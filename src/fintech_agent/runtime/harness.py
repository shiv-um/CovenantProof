import asyncio
import time
from typing import Any

from src.fintech_agent.agents.graph import build_credit_audit_graph
from src.fintech_agent.agents.state import AgentState
from src.fintech_agent.runtime.budgets import ExecutionBudget, BudgetExceeded
from src.fintech_agent.runtime.redis_store import RedisStore
from src.fintech_agent.runtime.singleflight import SingleFlight

# Shared runtime singletons
_coordinator = SingleFlight()
_store = RedisStore()
_graph = build_credit_audit_graph()


async def run_credit_audit(
    case_manifest: dict[str, Any],
    budget: ExecutionBudget | None = None,
) -> dict[str, Any]:
    """
    Executes an end-to-end credit audit package with single-flight request
    deduplication, process-level budget enforcement, and state persistence.
    """
    if budget is None:
        budget = ExecutionBudget(max_cost_usd=0.20, max_generated_tokens=6000)

    case_id = str(case_manifest.get("case_id", "CASE-UNKNOWN"))

    async def _execute() -> dict[str, Any]:
        await _store.connect()
        start_time = time.monotonic()

        # Charge initial tool dispatch
        await budget.charge_tool()

        # Build document payload from case manifest
        docs = []
        for key in ("purchase_order", "invoice", "bank_payment", "covenant_certificate"):
            if key in case_manifest and isinstance(case_manifest[key], dict):
                docs.append(case_manifest[key])

        # If flat documents list exists, incorporate it
        if "documents" in case_manifest and isinstance(case_manifest["documents"], list):
            docs.extend(case_manifest["documents"])

        initial_state: AgentState = {
            "run_id": f"run-{case_id}-{int(time.time())}",
            "case_id": case_id,
            "mode": "curated",
            "input_documents": docs,
        }

        # Checkpoint initial stage
        await _store.set_state(case_id, {"status": "IN_PROGRESS", "stage": "SWARM_DISPATCH"})

        # Execute the LangGraph StateGraph in an async thread pool executor
        loop = asyncio.get_running_loop()
        final_state: AgentState = await loop.run_in_executor(None, _graph.invoke, initial_state)

        # Reconcile inference costs and generated tokens with execution budget
        tokens = int(final_state.get("token_usage", 450))
        cost = float(final_state.get("cost_usd", 0.0025))
        await budget.charge_llm(generated_tokens=tokens, cost_usd=cost)

        elapsed = time.monotonic() - start_time
        summary_record = {
            "case_id": case_id,
            "status": "COMPLETED",
            "review_required": final_state.get("review_required", False),
            "findings_count": len(final_state.get("findings", [])),
            "claims_count": len(final_state.get("report_claims", [])),
            "elapsed_seconds": round(elapsed, 4),
            "cost_usd": round(budget.cost_usd, 4),
            "tokens_consumed": budget.generated_tokens,
        }

        # Persist final audit result
        await _store.set_state(case_id, summary_record)

        return {
            "final_state": final_state,
            "execution_summary": summary_record,
        }

    # Execute under single-flight multiplexer to collapse duplicate concurrent triggers
    result, is_leader = await _coordinator.execute(case_id, _execute)

    return {
        **result,
        "is_leader": is_leader,
    }


async def _verify_harness():
    sample_manifest = {
        "case_id": "CASE-COBALT-2026",
        "company_name": "Cobalt Equipment LLC",
        "purchase_order": {
            "document_type": "purchase_order",
            "total_amount": "125000.00",
            "sha256": "po-sha256-sample",
        },
        "invoice": {
            "document_type": "invoice",
            "total_amount": "125000.00",
            "sha256": "inv-sha256-sample",
        },
        "bank_payment": {
            "document_type": "bank_payment",
            "total_amount": "152000.00",
            "sha256": "bank-sha256-sample",
        },
        "covenant_certificate": {
            "document_type": "covenant_certificate",
            "ebitda": "1500000.00",
            "cash_taxes": "100000.00",
            "interest_expense": "700000.00",
            "current_maturities": "500000.00",
            "reported_dscr": "1.31",
        },
    }

    print("Launching Master Execution Harness with concurrent deduplication...")
    # Dispatch 2 concurrent calls for the same case to verify single-flight + graph execution
    t1 = run_credit_audit(sample_manifest)
    t2 = run_credit_audit(sample_manifest)

    res1, res2 = await asyncio.gather(t1, t2)

    summary = res1["execution_summary"]
    print("\nMaster Harness Execution Completed:")
    print(f"Case ID:             {summary['case_id']}")
    print(f"Audit Status:        {summary['status']}")
    print(f"Review Required:     {summary['review_required']}")
    print(f"Findings Count:      {summary['findings_count']}")
    print(f"Report Claims:       {summary['claims_count']}")
    print(f"Cost USD:            ${summary['cost_usd']:.4f} (Cap: $0.20)")
    print(f"Caller 1 (Leader):   {res1['is_leader']}")
    print(f"Caller 2 (Coalesce): {res2['is_leader']}")


if __name__ == "__main__":
    asyncio.run(_verify_harness())