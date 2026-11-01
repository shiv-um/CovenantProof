"""
Deterministic Financial Covenant Math Engine.
Enforces IEEE 754-free exact banking decimal arithmetic (ROUND_HALF_UP).
Executes with zero LLM intervention: 100% deterministic symbolic node.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Optional, List
from pydantic import BaseModel, Field, field_validator


def clean_decimal(val: Any) -> Decimal:
    """
    Sanitizes raw banking strings ($1,000.00, 15.0%) into clean IEEE 754-free Decimals.
    """
    if val is None or val == "":
        return Decimal("0.00")
    if isinstance(val, Decimal):
        return val
    if isinstance(val, (int, float)):
        return Decimal(str(val))

    s = str(val).strip().replace("$", "").replace(",", "")
    if s.endswith("%"):
        # Converts '15.0%' -> Decimal('0.1500')
        return (Decimal(s[:-1].strip()) / Decimal("100")).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
    return Decimal(s)

class FinancialMetrics(BaseModel):
    reported_ebitda: Decimal
    ltm_operating_ebitda: Decimal = Decimal("0.00")
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

    @field_validator(
        "reported_ebitda",
        "ltm_operating_ebitda",
        "reported_synergies",
        "synergy_cap_pct",
        "cash_taxes",
        "unfunded_capex",
        "cash_interest",
        "scheduled_principal",
        "minimum_fccr_threshold",
        "purchase_order_total",
        "invoice_total",
        "bank_payment_total",
        mode="before",
    )
    @classmethod
    def sanitize_inputs(cls, v: Any) -> Decimal:
        return clean_decimal(v)


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


def calculate_dscr(net_operating_income: Decimal, total_debt_service: Decimal) -> Decimal:
    """
    Backward-compatible standalone DSCR helper.
    Enforces IEEE 754-free decimal arithmetic with ROUND_HALF_UP.
    """
    if total_debt_service <= Decimal("0.00"):
        return Decimal("999.99")
    return (net_operating_income / total_debt_service).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_fccr(
    ebitda: Decimal,
    cash_taxes: Decimal,
    unfunded_capex: Decimal,
    total_debt_service: Decimal
) -> Decimal:
    """
    Backward-compatible standalone FCCR helper.
    """
    if total_debt_service <= Decimal("0.00"):
        return Decimal("999.99")
    numerator = ebitda - cash_taxes - unfunded_capex
    return (numerator / total_debt_service).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)