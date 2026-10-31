"""
Pydantic V2 Input Sanitization Layer.
Automated firewall isolating neural extraction from symbolic mathematical nodes.
"""

from decimal import Decimal, InvalidOperation
import re
from typing import Any
from pydantic import BaseModel, Field, field_validator


def clean_currency_string(v: Any) -> Decimal:
    """Converts diverse string/numeric formats into strict Decimals."""
    if isinstance(v, Decimal):
        return v
    if isinstance(v, (int, float)):
        return Decimal(str(v))
    if not isinstance(v, str):
        raise ValueError(f"Cannot sanitize non-string/non-numeric type: {type(v)}")

    s = v.strip()
    if not s:
        return Decimal("0.00")

    # Accounting parentheses notation: (1,500.00) -> -1500.00
    is_negative = False
    if s.startswith("(") and s.endswith(")"):
        is_negative = True
        s = s[1:-1].strip()

    # Suffix multipliers (e.g. 14.5M, 250K, 1.2B)
    multiplier = Decimal("1")
    if s.upper().endswith("B"):
        multiplier = Decimal("1000000000")
        s = s[:-1].strip()
    elif s.upper().endswith("M"):
        multiplier = Decimal("1000000")
        s = s[:-1].strip()
    elif s.upper().endswith("K"):
        multiplier = Decimal("1000")
        s = s[:-1].strip()

    # Strip currency symbols and whitespace
    s = re.sub(r"[^\d.-]", "", s)
    if not s or s == "-":
        return Decimal("0.00")

    try:
        val = Decimal(s) * multiplier
        return -val if is_negative else val
    except InvalidOperation:
        raise ValueError(f"Invalid currency decimal format: {v}")


class RawExtractionPayload(BaseModel):
    """Sanitizes raw unstructured model outputs prior to graph execution."""

    reported_ebitda: Decimal = Field(default=Decimal("0.00"))
    ltm_operating_ebitda: Decimal = Field(default=Decimal("0.00"))
    reported_synergies: Decimal = Field(default=Decimal("0.00"))
    synergy_cap_pct: Decimal = Field(default=Decimal("0.15"))
    cash_taxes: Decimal = Field(default=Decimal("0.00"))
    unfunded_capex: Decimal = Field(default=Decimal("0.00"))
    cash_interest: Decimal = Field(default=Decimal("0.00"))
    scheduled_principal: Decimal = Field(default=Decimal("0.00"))
    purchase_order_total: Decimal = Field(default=Decimal("0.00"))
    invoice_total: Decimal = Field(default=Decimal("0.00"))
    bank_payment_total: Decimal = Field(default=Decimal("0.00"))

    @field_validator(
        "reported_ebitda",
        "ltm_operating_ebitda",
        "reported_synergies",
        "cash_taxes",
        "unfunded_capex",
        "cash_interest",
        "scheduled_principal",
        "purchase_order_total",
        "invoice_total",
        "bank_payment_total",
        mode="before",
    )
    @classmethod
    def validate_currencies(cls, v: Any) -> Decimal:
        return clean_currency_string(v)

    @field_validator("synergy_cap_pct", mode="before")
    @classmethod
    def validate_percentage(cls, v: Any) -> Decimal:
        if isinstance(v, (int, float, Decimal)):
            d = Decimal(str(v))
            return d / Decimal("100") if d > Decimal("1.0") else d
        if isinstance(v, str):
            s = v.strip().replace("%", "")
            d = Decimal(s)
            return d / Decimal("100") if d > Decimal("1.0") else d
        return Decimal("0.15")