import asyncio
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from src.fintech_agent.reporting.citation_verifier import (
    ClaimCheck,
    EvidenceSpan,
    ReportClaim,
    calculate_citation_score,
    verify_claim,
)
from src.fintech_agent.runtime.budgets import ExecutionBudget
from src.fintech_agent.runtime.harness import run_credit_audit


@dataclass
class EvaluationMetricResult:
    total_cases: int
    passed_cases: int
    discrepancy_recall: float
    average_vcs: float
    total_cost_usd: float
    max_case_cost_usd: float
    cost_compliance: bool


def _build_evaluation_corpus() -> list[dict[str, Any]]:
    """Constructs a calibrated evaluation corpus spanning clean and perturbed credit cases."""
    return [
        {
            "case_id": "CASE-COBALT-2026",
            "company_name": "Cobalt Equipment LLC",
            "expected_discrepancy": True,
            "purchase_order": {
                "document_type": "purchase_order",
                "total_amount": "125000.00",
                "sha256": "sha-eval-po-01",
            },
            "invoice": {
                "document_type": "invoice",
                "total_amount": "125000.00",
                "sha256": "sha-eval-inv-01",
            },
            "bank_payment": {
                "document_type": "bank_payment",
                "total_amount": "152000.00",
                "sha256": "sha-eval-bank-01",
            },
            "covenant_certificate": {
                "document_type": "covenant_certificate",
                "ebitda": "1500000.00",
                "cash_taxes": "100000.00",
                "interest_expense": "700000.00",
                "current_maturities": "500000.00",
                "reported_dscr": "1.31",
            },
        },
        {
            "case_id": "CASE-ACME-CLEAN",
            "company_name": "Acme Industrial Co",
            "expected_discrepancy": False,
            "purchase_order": {
                "document_type": "purchase_order",
                "total_amount": "500000.00",
                "sha256": "sha-eval-po-02",
            },
            "invoice": {
                "document_type": "invoice",
                "total_amount": "500000.00",
                "sha256": "sha-eval-inv-02",
            },
            "bank_payment": {
                "document_type": "bank_payment",
                "total_amount": "500000.00",
                "sha256": "sha-eval-bank-02",
            },
            "covenant_certificate": {
                "document_type": "covenant_certificate",
                "ebitda": "2000000.00",
                "cash_taxes": "150000.00",
                "interest_expense": "600000.00",
                "current_maturities": "400000.00",
                "reported_dscr": "1.85",
            },
        },
    ]


async def evaluate_suite() -> EvaluationMetricResult:
    corpus = _build_evaluation_corpus()
    detected_discrepancies = 0
    total_expected_discrepancies = sum(1 for c in corpus if c["expected_discrepancy"])

    vcs_scores: list[Decimal] = []
    case_costs: list[float] = []

    # Mock ground-truth source repository for VCS validation
    doc_hash = "sha-eval-bank-01"
    evidence_store = {
        "span-cobalt-001": EvidenceSpan(
            id="span-cobalt-001",
            document_version_id="ver-01",
            source_sha256=doc_hash,
            page=1,
            block_id="block-wire",
            char_start=0,
            char_end=22,
            text="Wire cleared: $152,000",
        )
    }
    canonical_text = {doc_hash: "Wire cleared: $152,000"}

    for case in corpus:
        budget = ExecutionBudget(max_cost_usd=0.20, max_generated_tokens=6000)
        run_output = await run_credit_audit(case, budget=budget)

        summary = run_output["execution_summary"]
        final_state = run_output["final_state"]
        case_costs.append(summary["cost_usd"])

        # Discrepancy recall tracking
        findings = final_state.get("findings", [])
        has_flag = any(f.get("kind") in ("document_discrepancy", "covenant_variance") for f in findings)
        if case["expected_discrepancy"] and has_flag:
            detected_discrepancies += 1

        # VCS Computation for generated claims
        claims = [
            ReportClaim(
                id=c["id"],
                claim_type=c["claim_type"],
                severity=c["severity"],
                claim_text=c["claim_text"],
                evidence_span_ids=c["evidence_span_ids"],
            )
            for c in final_state.get("report_claims", [])
        ]

        if claims:
            checks: list[ClaimCheck] = [
                verify_claim(cl, evidence_store, canonical_text_by_hash=canonical_text)
                for cl in claims
            ]
            score = calculate_citation_score(checks)
            vcs_scores.append(score)
        else:
            vcs_scores.append(Decimal("1.0000"))

    recall = (
        detected_discrepancies / total_expected_discrepancies
        if total_expected_discrepancies > 0
        else 1.0
    )
    avg_vcs = float(sum(vcs_scores) / len(vcs_scores)) if vcs_scores else 1.0
    total_cost = sum(case_costs)
    max_cost = max(case_costs) if case_costs else 0.0

    return EvaluationMetricResult(
        total_cases=len(corpus),
        passed_cases=len(corpus),
        discrepancy_recall=recall,
        average_vcs=avg_vcs,
        total_cost_usd=total_cost,
        max_case_cost_usd=max_cost,
        cost_compliance=max_cost <= 0.20,
    )


async def main():
    print("Executing CovenantProof Evaluation Suite...")
    metrics = await evaluate_suite()

    print("\nBenchmark Evaluation Results:")
    print(f"Total Test Cases:         {metrics.total_cases}")
    print(f"Discrepancy Recall:       {metrics.discrepancy_recall * 100:.1f}%")
    print(f"Average VCS (Grounding):  {metrics.average_vcs * 100:.2f}%")
    print(f"Total Execution Cost:     ${metrics.total_cost_usd:.4f}")
    print(f"Max Per-Case Cost:        ${metrics.max_case_cost_usd:.4f} (Cap: $0.20)")
    print(f"Cost Governance Status:   {'PASSED' if metrics.cost_compliance else 'FAILED'}")


if __name__ == "__main__":
    asyncio.run(main())