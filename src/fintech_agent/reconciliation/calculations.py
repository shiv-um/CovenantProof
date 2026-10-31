"""
Deterministic Financial Covenant Math Engine.
Enforces IEEE 754-free exact banking decimal arithmetic (ROUND_HALF_UP).
Executes with zero LLM intervention: 100% deterministic symbolic node.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List
from pydantic import BaseModel, Field


class FinancialMetrics(BaseModel):
    reported_ebitda: Decimal
    ltm_operating_ebitda: Decimal
    reported_synergies: Decimal = Decimal("0.00")
    synergy_cap_pct: Decimal = Field(default=Decimal("0.1500"))
    cash_taxes: Decimal = Field(default=Decimal("0.00"))
    unfunded_capex: Decimal = Field(default=Decimal("0.00"))
    cash_interest: Decimal = Field(default=Decimal("0.00"))
    scheduled_principal: Decimal = Field(default=Decimal("0.00"))
    minimum_fccr_threshold: Decimal = Field(default=Decimal("1.2500"))
    purchase_order_total: Decimal = Field(default=Decimal("0.00"))
    invoice_total: Decimal = Field(default=Decimal("0.00"))
    bank_payment_total: Decimal = Field(default=Decimal("0.00"))


class AuditMathResult(BaseModel):
    compliant_ebitda: Decimal
    permitted_synergy: Decimal
    disallowed_synergy: Decimal
    fixed_charge_numerator: Decimal
    fixed_charge_denominator: Decimal
    calculated_fccr: Optional[Decimal]
    fccr_breach: bool
    fccr_infinite_coverage: bool
    po_invoice_variance: Decimal
    wire_variance: Decimal
    three_way_mismatch_detected: bool
    status_flags: List[str]


def quantize_currency(val: Decimal) -> Decimal:
    """Rounds to 2 decimal places for currency reconciliation."""
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def quantize_ratio(val: Decimal) -> Decimal:
    """Rounds to 4 decimal places for credit ratio evaluation."""
    return val.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


def evaluate_covenants(metrics: FinancialMetrics) -> AuditMathResult:
    status_flags: List[str] = []

    # 1. Section 8.4(b) Synergy Cap Evaluation
    effective_ltm_basis = (
        metrics.ltm_operating_ebitda
        if metrics.ltm_operating_ebitda > Decimal("0.00")
        else metrics.reported_ebitda
    )
    max_allowable_synergy = quantize_currency(effective_ltm_basis * metrics.synergy_cap_pct)
    permitted_synergy = min(metrics.reported_synergies, max_allowable_synergy)
    disallowed_synergy = max(Decimal("0.00"), metrics.reported_synergies - permitted_synergy)

    if disallowed_synergy > Decimal("0.00"):
        status_flags.append(
            f"SYNERGY_CAP_EXCEEDED_SEC_8_4: Disallowed ${disallowed_synergy:,.2f} exceeding {metrics.synergy_cap_pct * Decimal('100')}% cap"
        )

    # 2. Compliant EBITDA
    compliant_ebitda = quantize_currency(metrics.reported_ebitda - disallowed_synergy)

    # 3. Fixed Charge Coverage Ratio (FCCR)
    numerator = quantize_currency(compliant_ebitda - metrics.cash_taxes - metrics.unfunded_capex)
    denominator = quantize_currency(metrics.cash_interest + metrics.scheduled_principal)

    calculated_fccr: Optional[Decimal] = None
    fccr_breach: bool = False
    fccr_infinite_coverage: bool = False

    if denominator <= Decimal("0.00"):
        fccr_infinite_coverage = True
        status_flags.append("ZERO_DEBT_SERVICE: Infinite coverage ratio (no debt payments)")
    else:
        calculated_fccr = quantize_ratio(numerator / denominator)
        if calculated_fccr < metrics.minimum_fccr_threshold:
            fccr_breach = True
            status_flags.append(
                f"COVENANT_BREACH_FCCR: Recomputed {calculated_fccr}x below minimum threshold {metrics.minimum_fccr_threshold}x"
            )

    # 4. Deterministic 3-Way Matching
    po_invoice_variance = quantize_currency(metrics.invoice_total - metrics.purchase_order_total)
    wire_variance = quantize_currency(metrics.bank_payment_total - metrics.invoice_total)

    three_way_mismatch = False
    if metrics.purchase_order_total > Decimal("0.00") and abs(po_invoice_variance) > Decimal("0.00"):
        three_way_mismatch = True
        status_flags.append(f"PO_INVOICE_VARIANCE: Variance of ${po_invoice_variance:,.2f}")

    if metrics.invoice_total > Decimal("0.00") and abs(wire_variance) > Decimal("0.00"):
        three_way_mismatch = True
        status_flags.append(f"WIRE_MISMATCH_DETECTED: Variance of ${wire_variance:,.2f}")

    return AuditMathResult(
        compliant_ebitda=compliant_ebitda,
        permitted_synergy=permitted_synergy,
        disallowed_synergy=disallowed_synergy,
        fixed_charge_numerator=numerator,
        fixed_charge_denominator=denominator,
        calculated_fccr=calculated_fccr,
        fccr_breach=fccr_breach,
        fccr_infinite_coverage=fccr_infinite_coverage,
        po_invoice_variance=po_invoice_variance,
        wire_variance=wire_variance,
        three_way_mismatch_detected=three_way_mismatch,
        status_flags=status_flags,
    )