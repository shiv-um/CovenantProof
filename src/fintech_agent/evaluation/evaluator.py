import json
from pathlib import Path
from typing import Any


def calculate_vcs(final_state: dict[str, Any]) -> float:
    """
    Verification Citation Score (VCS):
    Calculates the percentage of executive report claims that are successfully
    grounded to a valid spatial evidence span in the source documents.
    """
    claims = final_state.get("report_claims", [])
    if not claims:
        return 1.0

    grounded = sum(
        1 for c in claims
        if c.get("evidence_span_ids") and c.get("verification_status") == "verified"
    )
    return round(grounded / len(claims), 4)


def export_finetuning_row(
        final_state: dict[str, Any],
        file_path: str = "synthetic_data/output/dpo_dataset.jsonl"
) -> None:
    """
    Exports successful Bedrock reasoning traces into a JSONL dataset
    formatted for Anthropic/OpenAI Supervised Fine-Tuning (SFT).
    """
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    system_prompt = (
        "You are the CovenantProof Chief Credit Reviewer. Synthesize a concise, "
        "formal credit audit memo summarizing the findings and calculations. "
        "Reference evidence-grounded facts and do not make automated credit decisions."
    )

    user_content = (
        f"Findings:\n{json.dumps(final_state.get('findings', []), indent=2)}\n\n"
        f"Deterministic Calculations:\n{json.dumps(final_state.get('calculations', []), indent=2)}"
    )

    candidate_assertions = final_state.get("candidate_assertions", [])
    assistant_content = candidate_assertions[0].get("summary", "") if candidate_assertions else ""

    if not assistant_content or "Local Fallback" in assistant_content:
        return  # Do not train models on fallback outputs

    dataset_row = {
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": assistant_content}
        ]
    }

    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(dataset_row) + "\n")
