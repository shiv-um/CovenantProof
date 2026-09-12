from operator import add
from typing import Annotated, Literal, TypedDict


def dedupe_by_id(
    left: list[dict],
    right: list[dict],
) -> list[dict]:
    """Reduces lists of state entities by unique ID, preventing duplicate appends."""
    merged: dict[str, dict] = {}
    for item in [*left, *right]:
        key = str(item.get("id") or item)
        merged[key] = item
    return list(merged.values())


class AgentState(TypedDict, total=False):
    """
    Central immutable-first state machine schema for the CovenantProof auditor swarm.
    Carries documents, spatial blocks, recomputed ratios, and verified findings.
    """
    run_id: str
    request_id: str
    case_id: str
    mode: Literal["curated", "live", "developer"]

    input_documents: list[dict]
    document_hashes: list[str]

    parsed_pages: Annotated[list[dict], add]
    layout_blocks: Annotated[list[dict], add]
    tables: Annotated[list[dict], add]

    extracted_fields: Annotated[list[dict], dedupe_by_id]
    normalized_values: Annotated[list[dict], dedupe_by_id]
    resolved_entities: Annotated[list[dict], dedupe_by_id]

    calculations: Annotated[list[dict], dedupe_by_id]
    rule_results: Annotated[list[dict], dedupe_by_id]
    discrepancies: Annotated[list[dict], dedupe_by_id]
    findings: Annotated[list[dict], dedupe_by_id]

    evidence_spans: Annotated[list[dict], dedupe_by_id]
    report_claims: Annotated[list[dict], dedupe_by_id]

    candidate_assertions: Annotated[list[dict], dedupe_by_id]
    verified_assertions: Annotated[list[dict], dedupe_by_id]
    rejected_assertions: Annotated[list[dict], dedupe_by_id]

    coverage_metrics: dict
    warnings: Annotated[list[str], add]
    errors: Annotated[list[str], add]

    review_required: bool
    partial_result_reason: str | None

    execution_budget: dict
    llm_call_count: int
    tool_call_count: int
    token_usage: int
    cost_usd: float

    model_version: str
    prompt_version: str
    rule_version: str

    economic_scenario: str
    economic_results: dict
    trace_context: dict


if __name__ == "__main__":
    sample_a = [{"id": "span-1", "val": 100}]
    sample_b = [{"id": "span-1", "val": 100}, {"id": "span-2", "val": 200}]
    deduped = dedupe_by_id(sample_a, sample_b)
    print(f"Verified dedupe_by_id reducer: {len(deduped)} unique entities.")
    print("AgentState TypedDict schema initialized cleanly.")