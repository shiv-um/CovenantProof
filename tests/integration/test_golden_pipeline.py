"""
Phase 1 Golden Corpus Integration Test Suite.
Validates 50 parameterized commercial credit profiles across all failure modes.
"""

from decimal import Decimal
import pytest
from src.fintech_agent.reconciliation.calculations import (
    FinancialMetrics,
    evaluate_covenants,
)

GOLDEN_TEST_SUITE = [
    # 1. Fully Compliant Clean Facilities (20 cases)
    *[
        {
            "id": f"CLEAN-{i:02d}",
            "metrics": FinancialMetrics(
                reported_ebitda=Decimal("20000000.00"),
                ltm_operating_ebitda=Decimal("18000000.00"),
                reported_synergies=Decimal("1000000.00"),
                synergy_cap_pct=Decimal("0.1500"),
                cash_taxes=Decimal("2000000.00"),
                unfunded_capex=Decimal("500000.00"),
                cash_interest=Decimal("4000000.00"),
                scheduled_principal=Decimal("2000000.00"),
                minimum_fccr_threshold=Decimal("1.2500"),
                purchase_order_total=Decimal("500000.00"),
                invoice_total=Decimal("500000.00"),
                bank_payment_total=Decimal("500000.00"),
            ),
            "expected_fccr_breach": False,
            "expected_mismatch": False,
        }
        for i in range(1, 21)
    ],
    # 2. Section 8.4(b) Synergy Cap Breaches (15 cases)
    *[
        {
            "id": f"SYNERGY-BREACH-{i:02d}",
            "metrics": FinancialMetrics(
                reported_ebitda=Decimal("14250000.00"),
                ltm_operating_ebitda=Decimal("10000000.00"),
                reported_synergies=Decimal("3000000.00"),  # 15% of 10M is 1.5M -> 1.5M disallowed
                synergy_cap_pct=Decimal("0.1500"),
                cash_taxes=Decimal("1000000.00"),
                cash_interest=Decimal("6000000.00"),
                scheduled_principal=Decimal("4000000.00"),
                minimum_fccr_threshold=Decimal("1.2500"),
                purchase_order_total=Decimal("100000.00"),
                invoice_total=Decimal("100000.00"),
                bank_payment_total=Decimal("100000.00"),
            ),
            "expected_fccr_breach": True,
            "expected_mismatch": False,
        }
        for i in range(1, 16)
    ],
    # 3. SWIFT Wire / Invoicing Variances (10 cases)
    *[
        {
            "id": f"WIRE-MISMATCH-{i:02d}",
            "metrics": FinancialMetrics(
                reported_ebitda=Decimal("15000000.00"),
                ltm_operating_ebitda=Decimal("15000000.00"),
                reported_synergies=Decimal("500000.00"),
                cash_interest=Decimal("2000000.00"),
                scheduled_principal=Decimal("1000000.00"),
                purchase_order_total=Decimal("125000.00"),
                invoice_total=Decimal("125000.00"),
                bank_payment_total=Decimal("125000.00") + Decimal(str(i * 1000)),
            ),
            "expected_fccr_breach": False,
            "expected_mismatch": True,
        }
        for i in range(1, 11)
    ],
    # 4. Severely Distressed Borrowers (5 cases)
    *[
        {
            "id": f"DISTRESSED-{i:02d}",
            "metrics": FinancialMetrics(
                reported_ebitda=Decimal("-1000000.00") * Decimal(str(i)),
                ltm_operating_ebitda=Decimal("500000.00"),
                reported_synergies=Decimal("0.00"),
                cash_interest=Decimal("2000000.00"),
                scheduled_principal=Decimal("1000000.00"),
            ),
            "expected_fccr_breach": True,
            "expected_mismatch": False,
        }
        for i in range(1, 6)
    ],
]


@pytest.mark.parametrize("case", GOLDEN_TEST_SUITE, ids=[c["id"] for c in GOLDEN_TEST_SUITE])
def test_golden_corpus(case):
    result = evaluate_covenants(case["metrics"])
    assert result.fccr_breach == case["expected_fccr_breach"]
    assert result.three_way_mismatch_detected == case["expected_mismatch"]