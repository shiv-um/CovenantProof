import asyncio
from dataclasses import dataclass
from typing import Any

from src.fintech_agent.runtime.budgets import ExecutionBudget
from src.fintech_agent.runtime.harness import run_credit_audit


@dataclass
class StressTestScenarioResult:
    scenario_id: str
    description: str
    discrepancy_detected: bool
    review_required: bool
    fail_safe_triggered: bool
    cost_usd: float


def _build_stress_scenarios() -> list[dict[str, Any]]:
    """Generates synthetic adversarial scenarios targeting specific document corruption modes."""
    return [
        {
            "scenario_id": "STRESS-001-DIGIT-TRANSPOSITION",
            "description": "Invoice transposition error swapping digits ($125,000.00 -> $152,000.00)",
            "case_manifest": {
                "case_id": "CASE-STRESS-TRANS-01",
                "company_name": "Transposition Stress Testing LLC",
                "purchase_order": {
                    "document_type": "purchase_order",
                    "total_amount": "125000.00",
                    "sha256": "sha-stress-po-01",
                },
                "invoice": {
                    "document_type": "invoice",
                    "total_amount": "152000.00",  # Transposed from 125,000
                    "sha256": "sha-stress-inv-01",
                },
                "bank_payment": {
                    "document_type": "bank_payment",
                    "total_amount": "125000.00",
                    "sha256": "sha-stress-bank-01",
                },
            },
            "expect_fail_safe": True,
        },
        {
            "scenario_id": "STRESS-002-PAYMENT-SHORTFALL",
            "description": "Critical shortfall on cleared bank wire ($125,000.00 down to $98,000.00)",
            "case_manifest": {
                "case_id": "CASE-STRESS-SHORTFALL-02",
                "company_name": "Underpayment Industrial Ltd",
                "purchase_order": {
                    "document_type": "purchase_order",
                    "total_amount": "125000.00",
                    "sha256": "sha-stress-po-02",
                },
                "invoice": {
                    "document_type": "invoice",
                    "total_amount": "125000.00",
                    "sha256": "sha-stress-inv-02",
                },
                "bank_payment": {
                    "document_type": "bank_payment",
                    "total_amount": "98000.00",
                    "sha256": "sha-stress-bank-02",
                },
            },
            "expect_fail_safe": True,
        },
        {
            "scenario_id": "STRESS-003-COVENANT-BREACH",
            "description": "Adversarial cash-flow erosion forcing DSCR ratio below covenant threshold",
            "case_manifest": {
                "case_id": "CASE-STRESS-COVENANT-03",
                "company_name": "Distressed Borrowing Corp",
                "purchase_order": {
                    "document_type": "purchase_order",
                    "total_amount": "200000.00",
                    "sha256": "sha-stress-po-03",
                },
                "invoice": {
                    "document_type": "invoice",
                    "total_amount": "200000.00",
                    "sha256": "sha-stress-inv-03",
                },
                "bank_payment": {
                    "document_type": "bank_payment",
                    "total_amount": "200000.00",
                    "sha256": "sha-stress-bank-03",
                },
                "covenant_certificate": {
                    "document_type": "covenant_certificate",
                    "ebitda": "900000.00",          # Compressed earnings
                    "cash_taxes": "100000.00",
                    "interest_expense": "500000.00",
                    "current_maturities": "300000.00",  # Denominator = 800k -> DSCR = 1.00x < 1.25x
                    "reported_dscr": "1.00",
                },
            },
            "expect_fail_safe": True,
        },
    ]


async def run_stress_suite() -> list[StressTestScenarioResult]:
    scenarios = _build_stress_scenarios()
    results: list[StressTestScenarioResult] = []

    for item in scenarios:
        budget = ExecutionBudget(max_cost_usd=0.20, max_generated_tokens=6000)
        output = await run_credit_audit(item["case_manifest"], budget=budget)

        summary = output["execution_summary"]
        final_state = output["final_state"]

        findings = final_state.get("findings", [])
        discrepancies = final_state.get("discrepancies", [])

        has_flags = len(findings) > 0 or len(discrepancies) > 0
        review_required = final_state.get("review_required", False)

        # Fail-safe requires flagging the condition and demanding human intervention
        fail_safe_triggered = has_flags and review_required

        results.append(
            StressTestScenarioResult(
                scenario_id=item["scenario_id"],
                description=item["description"],
                discrepancy_detected=has_flags,
                review_required=review_required,
                fail_safe_triggered=fail_safe_triggered,
                cost_usd=summary["cost_usd"],
            )
        )

    return results


async def main():
    print("Launching Adversarial Perturbation Stress Suite...")
    results = await run_stress_suite()

    print("\nStress Test Results Summary:")
    all_passed = True
    for r in results:
        status = "PASSED (Safe Review Triggered)" if r.fail_safe_triggered else "FAILED (Silent Flaw)"
        if not r.fail_safe_triggered:
            all_passed = False
        print(f"\n- Scenario: {r.scenario_id}")
        print(f"  Description:         {r.description}")
        print(f"  Discrepancy Caught:  {r.discrepancy_detected}")
        print(f"  Review Demanded:     {r.review_required}")
        print(f"  Status:              {status}")

    print("\nOverall Fail-Safe Robustness:", "100% RELIABLE" if all_passed else "VULNERABILITY DETECTED")


if __name__ == "__main__":
    asyncio.run(main())