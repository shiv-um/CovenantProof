"""
Phase 1 Unit Test Suite.
Validates division-by-zero, Section 8.4(b) synergy caps, wire variances, and Pydantic sanitization.
"""

from decimal import Decimal
import pytest
from src.fintech_agent.reconciliation.calculations import (
    FinancialMetrics,
    evaluate_covenants,
)
from src.fintech_agent.schemas.sanitizers import (
    RawExtractionPayload,
    clean_currency_string,
)


def test_division_by_zero_debt_service():
    """Verify zero cash interest & principal triggers infinite coverage without raising DivisionByZero."""
    metrics = FinancialMetrics(
        reported_ebitda=Decimal("10000000.00"),
        ltm_operating_ebitda=Decimal("12000000.00"),
        reported_synergies=Decimal("500000.00"),
        cash_interest=Decimal("0.00"),
        scheduled_principal=Decimal("0.00"),
    )
    result = evaluate_covenants(metrics)
    assert result.fccr_infinite_coverage is True
    assert result.calculated_fccr is None
    assert result.fccr_breach is False
    assert "ZERO_DEBT_SERVICE: Infinite coverage ratio" in result.status_flags[0]


def test_section_8_4_synergy_cap_breach():
    """Verify disallowed add-backs are subtracted from compliant EBITDA."""
    # LTM Operating = $10M, 15% Cap = $1.50M. Borrower reports $3.00M ($1.50M disallowed)
    metrics = FinancialMetrics(
        reported_ebitda=Decimal("14250000.00"),
        ltm_operating_ebitda=Decimal("10000000.00"),
        reported_synergies=Decimal("3000000.00"),
        synergy_cap_pct=Decimal("0.1500"),
        cash_taxes=Decimal("1000000.00"),
        unfunded_capex=Decimal("250000.00"),
        cash_interest=Decimal("6000000.00"),
        scheduled_principal=Decimal("4000000.00"),
        minimum_fccr_threshold=Decimal("1.2500"),
    )
    result = evaluate_covenants(metrics)
    assert result.permitted_synergy == Decimal("1500000.00")
    assert result.disallowed_synergy == Decimal("1500000.00")
    assert result.compliant_ebitda == Decimal("12750000.00")  # 14.25M - 1.5M

    # Numerator = 12.75M - 1M - 0.25M = 11.5M
    # Denominator = 6M + 4M = 10M
    # FCCR = 11.5 / 10 = 1.1500x (< 1.2500x)
    assert result.calculated_fccr == Decimal("1.1500")
    assert result.fccr_breach is True
    assert any("SYNERGY_CAP_EXCEEDED_SEC_8_4" in flag for flag in result.status_flags)


def test_distressed_borrower_negative_ebitda():
    """Verify negative EBITDA triggers a covenant breach cleanly."""
    metrics = FinancialMetrics(
        reported_ebitda=Decimal("-2500000.00"),
        ltm_operating_ebitda=Decimal("500000.00"),
        reported_synergies=Decimal("0.00"),
        cash_interest=Decimal("1000000.00"),
        scheduled_principal=Decimal("500000.00"),
        minimum_fccr_threshold=Decimal("1.2500"),
    )
    result = evaluate_covenants(metrics)
    # Numerator = -2.5M - 0 - 0 = -2.5M
    # Denominator = 1.5M
    # FCCR = -2.5 / 1.5 = -1.6667x
    assert result.calculated_fccr == Decimal("-1.6667")
    assert result.fccr_breach is True


def test_3_way_wire_variance_detected():
    """Verify exact-cent wire variance triggers mismatch flag."""
    metrics = FinancialMetrics(
        reported_ebitda=Decimal("5000000.00"),
        ltm_operating_ebitda=Decimal("5000000.00"),
        purchase_order_total=Decimal("125000.00"),
        invoice_total=Decimal("125000.00"),
        bank_payment_total=Decimal("152000.00"),  # $27,000 variance
    )
    result = evaluate_covenants(metrics)
    assert result.three_way_mismatch_detected is True
    assert result.wire_variance == Decimal("27000.00")
    assert any("WIRE_MISMATCH_DETECTED" in flag for flag in result.status_flags)


def test_pydantic_schema_sanitizer():
    """Verify unstructured strings, accounting parens, and suffixes normalize correctly."""
    raw = {
        "reported_ebitda": "$14,250,000.00",
        "ltm_operating_ebitda": "12.0M",
        "reported_synergies": " $2,400,000 ",
        "synergy_cap_pct": "15.0%",
        "cash_taxes": "(1,500,000.00)",  # negative accounting parentheses
        "invoice_total": "$125,000.00",
        "bank_payment_total": "152000.00",
    }
    payload = RawExtractionPayload(**raw)
    assert payload.reported_ebitda == Decimal("14250000.00")
    assert payload.ltm_operating_ebitda == Decimal("12000000.00")
    assert payload.reported_synergies == Decimal("2400000.00")
    assert payload.synergy_cap_pct == Decimal("0.15")
    assert payload.cash_taxes == Decimal("-1500000.00")
    assert payload.invoice_total == Decimal("125000.00")
    assert payload.bank_payment_total == Decimal("152000.00")