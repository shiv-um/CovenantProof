from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_EVEN, localcontext
from typing import Literal


@dataclass(frozen=True)
class BoundingBox:
    x0: float
    y0: float
    x1: float
    y1: float


@dataclass(frozen=True)
class EvidenceSpan:
    id: str
    document_version_id: str
    source_sha256: str
    page: int
    block_id: str
    char_start: int
    char_end: int
    text: str
    bbox: BoundingBox | None = None
    verification_status: str = "unverified"


@dataclass(frozen=True)
class ReportClaim:
    id: str
    claim_type: str
    severity: Literal["info", "low", "medium", "high"]
    claim_text: str
    evidence_span_ids: list[str] = field(default_factory=list)
    verification_status: str = "unverified"


@dataclass(frozen=True)
class ClaimCheck:
    claim_id: str
    supported: bool
    reasons: tuple[str, ...]
    weight: Decimal


def claim_weight(severity: str) -> Decimal:
    """Assigns deterministic weights by severity."""
    return {
        "info": Decimal("1"),
        "low": Decimal("2"),
        "medium": Decimal("4"),
        "high": Decimal("8"),
    }[severity]


def verify_claim(
    claim: ReportClaim,
    spans: dict[str, EvidenceSpan],
    *,
    canonical_text_by_hash: dict[str, str],
) -> ClaimCheck:
    """
    Verifies that a report claim is strictly backed by immutable evidence spans.
    Checks span existence, document hash validity, offset ranges, and exact text equality.
    """
    reasons: list[str] = []

    if not claim.evidence_span_ids:
        reasons.append("no_evidence_attached")

    for evidence_id in claim.evidence_span_ids:
        span = spans.get(str(evidence_id))
        if span is None:
            reasons.append(f"missing_span:{evidence_id}")
            continue

        source = canonical_text_by_hash.get(span.source_sha256)
        if source is None:
            reasons.append(f"missing_source_hash:{span.source_sha256}")
            continue

        if span.char_end > len(source):
            reasons.append(f"offset_out_of_range:{evidence_id}")
            continue

        actual_slice = source[span.char_start:span.char_end]
        if actual_slice != span.text:
            reasons.append(f"evidence_text_mismatch:{evidence_id}")

    is_supported = len(reasons) == 0
    return ClaimCheck(
        claim_id=str(claim.id),
        supported=is_supported,
        reasons=tuple(reasons),
        weight=claim_weight(claim.severity),
    )


def calculate_citation_score(checks: list[ClaimCheck]) -> Decimal:
    """
    Computes the weighted Verification Citation Score (VCS):
    VCS = sum(weight * supported) / sum(weight)
    """
    if not checks:
        return Decimal("0.0000")

    with localcontext() as ctx:
        ctx.prec = 28
        total_weight = sum((check.weight for check in checks), Decimal("0"))
        if total_weight == Decimal("0"):
            return Decimal("0.0000")

        supported_weight = sum(
            (check.weight for check in checks if check.supported),
            Decimal("0"),
        )
        score = (supported_weight / total_weight).quantize(
            Decimal("0.0001"),
            rounding=ROUND_HALF_EVEN,
        )

    return score


if __name__ == "__main__":
    # Test suite verifying valid grounding and hallucination rejection
    sample_text = "Cobalt Equipment LLC wire payment cleared: $152,000.00 on 2026-08-20."
    doc_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    canonical_lookup = {doc_hash: sample_text}

    valid_span = EvidenceSpan(
        id="span-001",
        document_version_id="ver-001",
        source_sha256=doc_hash,
        page=1,
        block_id="p1-b5",
        char_start=43,
        char_end=54,
        text="$152,000.00",
    )
    spans_store = {"span-001": valid_span}

    # 1. Fully supported finding
    supported_claim = ReportClaim(
        id="claim-001",
        claim_type="reconciliation",
        severity="high",
        claim_text="Bank payment total is $152,000.00",
        evidence_span_ids=["span-001"],
    )

    # 2. Hallucinated / ungrounded claim
    ungrounded_claim = ReportClaim(
        id="claim-002",
        claim_type="covenant",
        severity="high",
        claim_text="Borrower was insolvent in 2025",
        evidence_span_ids=["span-fake-999"],
    )

    check_1 = verify_claim(supported_claim, spans_store, canonical_text_by_hash=canonical_lookup)
    check_2 = verify_claim(ungrounded_claim, spans_store, canonical_text_by_hash=canonical_lookup)

    vcs_valid = calculate_citation_score([check_1])
    vcs_mixed = calculate_citation_score([check_1, check_2])

    print(f"Claim 1 (Valid Grounding): Supported={check_1.supported} | Reasons={check_1.reasons}")
    print(f"Claim 2 (Hallucinated):   Supported={check_2.supported} | Reasons={check_2.reasons}")
    print(f"\nVerification Citation Score (Single Valid Claim): {vcs_valid * 100:.2f}%")
    print(f"Verification Citation Score (Mixed with Ungrounded): {vcs_mixed * 100:.2f}%")