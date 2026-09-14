from dataclasses import asdict, dataclass
from decimal import Decimal, ROUND_HALF_UP
import json
import random
from typing import Any, Optional

from src.fintech_agent.reconciliation.calculations import calculate_dscr


@dataclass(frozen=True)
class SFTInstructionRecord:
    task_type: str
    instruction: str
    input_context: str
    target_response: str
    metadata: dict[str, Any]

    def to_alpaca_format(self) -> dict[str, str]:
        return {
            "instruction": self.instruction,
            "input": self.input_context,
            "output": self.target_response,
        }

    def to_sharegpt_format(self) -> dict[str, Any]:
        return {
            "conversations": [
                {"from": "human", "value": f"{self.instruction}\n\nContext:\n{self.input_context}"},
                {"from": "gpt", "value": self.target_response},
            ]
        }


def generate_dscr_sft_sample(sample_id: int) -> SFTInstructionRecord:
    """Synthesizes a mathematically verified covenant audit training sample."""
    # Deterministic pseudo-random generation anchored to sample_id
    rng = random.Random(sample_id * 1337)

    ebitda_val = rng.randint(800, 5000) * 1000
    cash_taxes_val = rng.randint(50, 300) * 1000
    interest_val = rng.randint(200, 1200) * 1000
    maturities_val = rng.randint(100, 800) * 1000

    ebitda = Decimal(str(ebitda_val)).quantize(Decimal("0.01"))
    cash_taxes = Decimal(str(cash_taxes_val)).quantize(Decimal("0.01"))
    interest = Decimal(str(interest_val)).quantize(Decimal("0.01"))
    current_maturities = Decimal(str(maturities_val)).quantize(Decimal("0.01"))

    # Compute deterministic ground truth using core math engine
    math_result = calculate_dscr(
        ebitda=ebitda,
        cash_taxes=cash_taxes,
        interest_expense=interest,
        current_maturities=current_maturities,
    )

    numerator = ebitda - cash_taxes
    denominator = interest + current_maturities
    computed_dscr = math_result.ratio
    is_compliant = computed_dscr >= Decimal("1.25")

    # Inject minor discrepancy 30% of the time to train auditor adversarial vigilance
    has_variance = rng.random() < 0.30
    reported_dscr = (
        (computed_dscr + Decimal("0.25")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if has_variance
        else computed_dscr
    )

    input_text = (
        f"Borrower Covenant Certificate Data:\n"
        f"- Reported EBITDA: ${ebitda:,.2f}\n"
        f"- Cash Taxes Paid: ${cash_taxes:,.2f}\n"
        f"- Interest Expense: ${interest:,.2f}\n"
        f"- Current Portion of Long-Term Debt: ${current_maturities:,.2f}\n"
        f"- Borrower Certified DSCR: {reported_dscr}x\n"
        f"- Covenant Threshold: 1.25x"
    )

    target_response = (
        f"COVENANT AUDIT DETERMINATION:\n"
        f"1. Net Available Cash Flow: ${ebitda:,.2f} - ${cash_taxes:,.2f} = ${numerator:,.2f}\n"
        f"2. Total Debt Service: ${interest:,.2f} + ${current_maturities:,.2f} = ${denominator:,.2f}\n"
        f"3. Deterministic DSCR: ${numerator:,.2f} / ${denominator:,.2f} = {computed_dscr}x\n"
        f"4. Variance Detected: {'YES (Reported ' + str(reported_dscr) + 'x vs Computed ' + str(computed_dscr) + 'x)' if has_variance else 'NO (Reconciled)'}\n"
        f"5. Covenant Status: {'COMPLIANT' if is_compliant else 'BREACH'}\n"
        f"6. Recommendation: {'ACCEPT_CALCULATION' if not has_variance and is_compliant else 'FLAG_FOR_HUMAN_REVIEW'}"
    )

    return SFTInstructionRecord(
        task_type="covenant_dscr_verification",
        instruction="Verify the borrower covenant certificate calculations against credit agreement standards and compute exact DSCR.",
        input_context=input_text,
        target_response=target_response,
        metadata={
            "sample_id": sample_id,
            "computed_dscr": str(computed_dscr),
            "reported_dscr": str(reported_dscr),
            "has_variance": has_variance,
            "is_compliant": is_compliant,
        },
    )


def generate_sft_dataset(num_samples: int = 100) -> list[SFTInstructionRecord]:
    """Generates a reproducible corpus of instruction tuning samples."""
    return [generate_dscr_sft_sample(i) for i in range(num_samples)]


if __name__ == "__main__":
    print("Executing SFT Dataset Synthesizer validation...")

    samples = generate_sft_dataset(num_samples=5)
    print(f"Generated {len(samples)} instruction records.")

    # Inspect the first generated sample
    sample_zero = samples[0]
    alpaca_repr = sample_zero.to_alpaca_format()

    print("\n--- SAMPLE 0 (Alpaca SFT Format) ---")
    print(f"Instruction: {alpaca_repr['instruction']}")
    print(f"\nInput:\n{alpaca_repr['input']}")
    print(f"\nTarget Response:\n{alpaca_repr['output']}")
    print("\nMetadata Attributes:", json.dumps(sample_zero.metadata, indent=2))