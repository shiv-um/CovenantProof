from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_EVEN, localcontext


class CalculationError(ValueError):
    """Raised when calculation inputs violate financial invariants (e.g. non-positive denominator)."""
    pass


@dataclass(frozen=True)
class DscrResult:
    numerator: Decimal
    denominator: Decimal
    ratio: Decimal


def calculate_dscr(
    *,
    ebitda: Decimal,
    cash_taxes: Decimal,
    interest_expense: Decimal,
    current_maturities: Decimal,
) -> DscrResult:
    """
    Deterministically computes Debt Service Coverage Ratio (DSCR):
    DSCR = (EBITDA - Cash Taxes) / (Interest Expense + Current Maturities)
    """
    numerator = ebitda - cash_taxes
    denominator = interest_expense + current_maturities

    if denominator <= 0:
        raise CalculationError("DSCR denominator must be positive and non-zero.")

    with localcontext() as ctx:
        ctx.prec = 28
        ratio = (numerator / denominator).quantize(
            Decimal("0.0001"),
            rounding=ROUND_HALF_EVEN,
        )

    return DscrResult(
        numerator=numerator,
        denominator=denominator,
        ratio=ratio,
    )


def calculate_borrowing_base(
    *,
    eligible_ar: Decimal,
    advance_rate: Decimal,
    reserves: Decimal,
) -> Decimal:
    """
    Deterministically computes Borrowing Base:
    Borrowing Base = (Eligible AR * Advance Rate) - Reserves
    """
    if not Decimal("0") <= advance_rate <= Decimal("1"):
        raise CalculationError("Advance rate must be between 0.0 and 1.0.")

    with localcontext() as ctx:
        ctx.prec = 28
        base = (eligible_ar * advance_rate - reserves).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_EVEN,
        )

    return base


if __name__ == "__main__":
    # Test with golden mismatch case values:
    # EBITDA: $1,500,000 | Taxes: $100,000 | Interest: $700,000 | Maturities: $500,000
    res = calculate_dscr(
        ebitda=Decimal("1500000"),
        cash_taxes=Decimal("100000"),
        interest_expense=Decimal("700000"),
        current_maturities=Decimal("500000"),
    )
    print(f"Calculated DSCR Numerator:   ${res.numerator:,.2f}")
    print(f"Calculated DSCR Denominator: ${res.denominator:,.2f}")
    print(f"Recomputed DSCR Ratio:       {res.ratio}x")