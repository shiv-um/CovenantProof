import asyncio
import os
import time
from typing import Any
from dotenv import load_dotenv

# Load local .env credentials before initializing AWS clients
load_dotenv()

from src.fintech_agent.agents.checkpointer import postgres_checkpointer, thread_config
from src.fintech_agent.agents.graph import build_credit_audit_graph
from src.fintech_agent.agents.state import AgentState
from src.fintech_agent.observability.phoenix_tracer import PhoenixObservability
from src.fintech_agent.runtime.budgets import ExecutionBudget
from src.fintech_agent.runtime.redis_store import RedisStore
from src.fintech_agent.runtime.singleflight import SingleFlight
from src.fintech_agent.evaluation.evaluator import calculate_vcs, export_finetuning_row


# Shared runtime singletons
_coordinator = SingleFlight()
_store = RedisStore()
_phoenix = PhoenixObservability(project_name="covenant-proof-auditor")


async def run_credit_audit(
    case_manifest: dict[str, Any],
    budget: ExecutionBudget | None = None,
) -> dict[str, Any]:
    """
    Executes an end-to-end credit audit package with single-flight request
    deduplication, process-level budget enforcement, durable PostgreSQL checkpointing,
    and distributed Arize Phoenix tracing.
    """
    if budget is None:
        budget = ExecutionBudget(max_cost_usd=0.20, max_generated_tokens=6000)

    case_id = str(case_manifest.get("case_id", "CASE-UNKNOWN"))
    run_id = f"run-{case_id}-{int(time.time())}"

    async def _execute() -> dict[str, Any]:
        await _store.connect()
        start_time = time.monotonic()
        await budget.charge_tool()

        # Build document payload from case manifest
        docs = []
        for key in ("purchase_order", "invoice", "bank_payment", "covenant_certificate"):
            if key in case_manifest and isinstance(case_manifest[key], dict):
                docs.append(case_manifest[key])

        if "documents" in case_manifest and isinstance(case_manifest["documents"], list):
            docs.extend(case_manifest["documents"])

        initial_state: AgentState = {
            "run_id": run_id,
            "case_id": case_id,
            "mode": "curated",
            "input_documents": docs,
        }

        await _store.set_state(case_id, {"status": "IN_PROGRESS", "stage": "SWARM_DISPATCH"})

        # Compile and execute the StateGraph with durable PostgreSQL state checkpointing
        async with postgres_checkpointer() as checkpointer:
            graph = build_credit_audit_graph(checkpointer=checkpointer)
            config = thread_config(run_id=run_id)
            final_state: AgentState = await graph.ainvoke(initial_state, config=config)

        tokens = int(final_state.get("token_usage", 450))
        cost = float(final_state.get("cost_usd", 0.0025))
        await budget.charge_llm(generated_tokens=tokens, cost_usd=cost)

        elapsed = time.monotonic() - start_time
        review_required = final_state.get("review_required", False)
        findings = final_state.get("findings", [])
        claims = final_state.get("report_claims", [])

        # Calculate dynamic Verification Citation Score (VCS)
        actual_vcs = calculate_vcs(final_state)

        # Record evaluation metrics to Phoenix OpenTelemetry trace
        _phoenix.record_audit_evaluation(
            case_id=case_id,
            run_id=run_id,
            vcs_score=actual_vcs,
            review_required=review_required,
            cost_usd=round(budget.cost_usd, 4),
            findings_count=len(findings),
        )

        # Extract graph trace to JSONL for future fine-tuning
        if actual_vcs >= 1.0:
            export_finetuning_row(final_state)

        summary_record = {
            "case_id": case_id,
            "run_id": run_id,
            "status": "COMPLETED",
            "review_required": review_required,
            "findings_count": len(findings),
            "claims_count": len(claims),
            "vcs_score": actual_vcs,
            "elapsed_seconds": round(elapsed, 4),
            "cost_usd": round(budget.cost_usd, 4),
            "tokens_consumed": budget.generated_tokens,
            "trace_ui": "http://localhost:6006",
        }

        await _store.set_state(case_id, summary_record)
        return {
            "final_state": final_state,
            "execution_summary": summary_record,
        }

    result, is_leader = await _coordinator.execute(case_id, _execute)
    return {
        **result,
        "is_leader": is_leader,
    }


if __name__ == "__main__":
    sample_manifest = {
        "case_id": "CASE-COBALT-2026",
        "company_name": "Cobalt Equipment LLC",
        "purchase_order": {
            "document_id": "PO-2026-8801",
            "document_type": "purchase_order",
            "file_name": "cobalt_po.pdf",
            "total_amount": "125000.00",
        },
        "invoice": {
            "document_id": "INV-2026-9904",
            "document_type": "invoice",
            "file_name": "cobalt_invoice.pdf",
            "total_amount": "125000.00",
        },
        "bank_payment": {
            "document_id": "PAY-2026-4412",
            "document_type": "bank_payment",
            "file_name": "cobalt_bank_payment.pdf",
            "total_amount": "152000.00",
        },
        "covenant_certificate": {
            "document_id": "COV-2026-001",
            "document_type": "covenant_certificate",
            "ebitda": "1500000.00",
            "cash_taxes": "100000.00",
            "interest_expense": "700000.00",
            "current_maturities": "500000.00",
            "reported_dscr": "1.31",
        },
    }

    async def _test():
        print("Executing Master Harness with Arize Phoenix Tracing...")
        res = await run_credit_audit(sample_manifest)
        summary = res["execution_summary"]
        print("\nExecution Completed:")
        print(f"Case ID:          {summary['case_id']}")
        print(f"Run ID:           {summary['run_id']}")
        print(f"Audit Status:     {summary['status']}")
        print(f"Review Required:  {summary['review_required']}")
        print(f"Findings Count:   {summary['findings_count']}")
        print(f"Trace Portal:     {summary['trace_ui']}")

    asyncio.run(_test())
