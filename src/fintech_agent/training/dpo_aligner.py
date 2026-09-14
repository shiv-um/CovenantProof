from dataclasses import dataclass
from decimal import Decimal
import json
import random
from typing import Any

from src.fintech_agent.reconciliation.calculations import calculate_dscr


@dataclass(frozen=True)
class DPOPreferencePair:
    prompt: str
    chosen: str
    rejected: str
    metadata: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "prompt": self.prompt,
            "chosen": self.chosen,
            "rejected": self.rejected,
        }


def generate_dpo_pair(sample_id: int) -> DPOPreferencePair:
    """
    Synthesizes a contrastive preference pair for DPO alignment.
    - Chosen: strictly grounded, cites bounding coordinates, verified math.
    - Rejected: plausible corporate text with hallucinated uncited numbers.
    """
    rng = random.Random(sample_id * 4242)

    ebitda_val = rng.randint(1200, 6000) * 1000
    cash_taxes_val = rng.randint(100, 400) * 1000
    interest_val = rng.randint(300, 1500) * 1000
    maturities_val = rng.randint(200, 900) * 1000

    ebitda = Decimal(str(ebitda_val)).quantize(Decimal("0.01"))
    cash_taxes = Decimal(str(cash_taxes_val)).quantize(Decimal("0.01"))
    interest = Decimal(str(interest_val)).quantize(Decimal("0.01"))
    current_maturities = Decimal(str(maturities_val)).quantize(Decimal("0.01"))

    math_result = calculate_dscr(
        ebitda=ebitda,
        cash_taxes=cash_taxes,
        interest_expense=interest,
        current_maturities=current_maturities,
    )

    numerator = ebitda - cash_taxes
    denominator = interest + current_maturities
    exact_ratio = math_result.ratio

    prompt = (
        f"You are the CovenantProof Audit Agent. Reconcile the following covenant submission:\n"
        f"Document: Compliance Certificate FY2025 (DocHash: sha256_e8f2...)\n"
        f"Page 2 Table Extract:\n"
        f"  - EBITDA: ${ebitda:,.2f} [bbox: (0.12, 0.45, 0.38, 0.48)]\n"
        f"  - Taxes Paid: ${cash_taxes:,.2f} [bbox: (0.12, 0.50, 0.38, 0.53)]\n"
        f"  - Interest: ${interest:,.2f} [bbox: (0.12, 0.55, 0.38, 0.58)]\n"
        f"  - Debt Maturities: ${current_maturities:,.2f} [bbox: (0.12, 0.60, 0.38, 0.63)]\n\n"
        f"Evaluate DSCR and provide audit recommendation."
    )

    # CHOSEN: Exact, coordinate-anchored, deterministic math
    chosen = (
        f"EVIDENCE-GROUNDED AUDIT DETERMINATION:\n"
        f"1. Cash Flow Available for Debt Service (CFADS):\n"
        f"   ${ebitda:,.2f} [Page 2, bbox: (0.12, 0.45, 0.38, 0.48)] - ${cash_taxes:,.2f} [Page 2, bbox: (0.12, 0.50, 0.38, 0.53)]\n"
        f"   = ${numerator:,.2f}\n"
        f"2. Total Debt Service:\n"
        f"   ${interest:,.2f} [Page 2, bbox: (0.12, 0.55, 0.38, 0.58)] + ${current_maturities:,.2f} [Page 2, bbox: (0.12, 0.60, 0.38, 0.63)]\n"
        f"   = ${denominator:,.2f}\n"
        f"3. Deterministic DSCR:\n"
        f"   ${numerator:,.2f} / ${denominator:,.2f} = {exact_ratio}x\n"
        f"4. Citation Grounding: VCS = 1.0000 (4 of 4 assertions strictly bound to spatial coordinates).\n"
        f"5. Status: {'COMPLIANT' if exact_ratio >= Decimal('1.25') else 'COVENANT BREACH'} (Threshold: 1.25x)."
    )

    # REJECTED: Plausible narrative, rounded estimates, no bounding box citations, hallucinates adjustments
    hallucinated_est = round(float(exact_ratio) + 0.15, 2)
    rejected = (
        f"Based on the financial information provided in the borrower certificate, the company demonstrates "
        f"sound financial standing. The EBITDA of roughly ${ebitda:,.2f} easily covers the interest obligations. "
        f"After factoring in working capital assumptions and typical add-backs, the estimated DSCR comes out "
        f"to approximately {hallucinated_est}x, comfortably exceeding the standard benchmark. The credit facility "
        f"appears low-risk and compliant with credit agreements."
    )

    return DPOPreferencePair(
        prompt=prompt,
        chosen=chosen,
        rejected=rejected,
        metadata={"sample_id": sample_id, "dscr": str(exact_ratio)},
    )


def generate_dpo_corpus(num_pairs: int = 50) -> list[DPOPreferencePair]:
    """Builds a corpus of contrastive preference pairs for alignment training."""
    return [generate_dpo_pair(i) for i in range(num_pairs)]


if __name__ == "__main__":
    print("Executing DPO Alignment Pair Generator validation...")

    dataset = generate_dpo_corpus(num_pairs=3)
    print(f"Generated {len(dataset)} DPO pairs.\n")

    first_pair = dataset[0]
    print("--- PROMPT ---")
    print(first_pair.prompt)
    print("\n--- CHOSEN (Ground-Truth Evidence Anchored) ---")
    print(first_pair.chosen)
    print("\n--- REJECTED (Hallucinatory / Unanchored) ---")
    print(first_pair.rejected)