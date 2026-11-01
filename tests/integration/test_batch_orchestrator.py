"""
Phase 3 High-Throughput Batch Integration Test.
Simulates a 10,000-document loan audit batch run, triaging 1,000 edge cases into operational clusters.
"""

from decimal import Decimal
import time
import pytest
from src.fintech_agent.services.batch_aggregator import BatchMapReduceAggregator
from src.fintech_agent.services.triage_engine import (
    EdgeCaseTriageEngine,
    TriageCategory,
)


def test_10000_document_batch_triage_and_reduce():
    triage_engine = EdgeCaseTriageEngine()
    aggregator = BatchMapReduceAggregator(batch_id="BATCH-2026-Q3-TEST")

    total_docs = 10000
    t0 = time.time()

    # 1. Simulate 9,000 Straight-Through Documents (Tier 1 Cleared)
    for i in range(1, 9001):
        aggregator.record_worker_result({
            "doc_id": f"DOC-CLEAN-{i:05d}",
            "facility_id": f"FAC-CORP-{(i % 200):03d}",
            "passed_tier_1": True,
        })

    # 2. Simulate 1,000 Flagged Documents (Tier 2 Escalation)
    for i in range(1, 1001):
        # 60% Cluster A (OCR Degradation)
        if i <= 600:
            rec = {
                "doc_id": f"DOC-FLAG-{i:05d}",
                "facility_id": f"FAC-FLAG-{(i % 50):03d}",
                "ocr_confidence": 0.55,
                "scan_unreadable": True,
            }
        # 25% Cluster B (Minor Formatting / Penny Discrepancy)
        elif i <= 850:
            rec = {
                "doc_id": f"DOC-FLAG-{i:05d}",
                "facility_id": f"FAC-FLAG-{(i % 50):03d}",
                "ocr_confidence": 0.95,
                "wire_variance": "5.00",
                "fccr_breach": False,
            }
        # 15% Cluster C (True Covenant Breach or Major Wire Tampering)
        else:
            rec = {
                "doc_id": f"DOC-FLAG-{i:05d}",
                "facility_id": f"FAC-RISK-{(i % 10):03d}",
                "ocr_confidence": 0.99,
                "wire_variance": "27000.00",
                "fccr_breach": True,
            }

        decision = triage_engine.triage_record(rec)
        aggregator.record_worker_result({
            "doc_id": decision.doc_id,
            "facility_id": decision.facility_id,
            "passed_tier_1": False,
            "triage_category": decision.category,
            "requires_human": decision.requires_human_escalation,
        })

    # 3. Execute Map-Reduce Aggregation
    manifest = aggregator.reduce_manifest(total_ingested=total_docs, start_time=t0)

    print(f"\n[✓] Ingested & Triaged {manifest.total_documents_processed:,} documents in {manifest.processing_wall_time_sec:.3f}s")
    print(f"[✓] Straight-Through Accepted: {manifest.straight_through_accepted:,} ({(manifest.straight_through_accepted / total_docs) * 100:.1f}%)")
    print(f"[✓] Tier 2 Edge Cases:        {manifest.tier_2_flagged:,}")
    print(f"    - Cluster A (Scan Remediation): {manifest.cluster_a_ocr_remediated:,}")
    print(f"    - Cluster B (Format Resolved):  {manifest.cluster_b_format_resolved:,}")
    print(f"    - Cluster C (Human Escalated):  {manifest.cluster_c_human_breaches:,}")
    print(f"[✓] Critical Facilities at Risk:    {len(manifest.critical_facilities_at_risk)}")
    print(f"[✓] Effective Throughput:          {manifest.effective_throughput_docs_per_sec:,.0f} docs/sec")

    # Assertions
    assert manifest.total_documents_processed == 10000
    assert manifest.straight_through_accepted == 9000
    assert manifest.tier_2_flagged == 1000
    assert manifest.cluster_a_ocr_remediated == 600
    assert manifest.cluster_b_format_resolved == 250
    assert manifest.cluster_c_human_breaches == 150
    assert len(manifest.critical_facilities_at_risk) == 10
    assert manifest.processing_wall_time_sec < 1.0, "10k batch aggregation should complete in under 1 second"