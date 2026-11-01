"""
Distributed Batch Map-Reduce Rollup Aggregator.
Consolidates millions of worker audit outcomes into an executive credit portfolio manifest.
"""

from dataclasses import dataclass, field
from decimal import Decimal
import time
from typing import Dict, List, Any
from src.fintech_agent.services.triage_engine import TriageCategory, TriageDecision


@dataclass
class PortfolioBatchManifest:
    batch_id: str
    total_documents_processed: int
    straight_through_accepted: int
    tier_2_flagged: int
    cluster_a_ocr_remediated: int
    cluster_b_format_resolved: int
    cluster_c_human_breaches: int
    critical_facilities_at_risk: List[str]
    processing_wall_time_sec: float
    effective_throughput_docs_per_sec: float


class BatchMapReduceAggregator:
    """
    Map-Reduce coordinator for portfolio-level batch audits.
    """

    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self._map_records: List[Dict[str, Any]] = []

    def record_worker_result(self, result: Dict[str, Any]):
        """Map step: Accumulates worker audit outcomes."""
        self._map_records.append(result)

    def reduce_manifest(self, total_ingested: int, start_time: float) -> PortfolioBatchManifest:
        """Reduce step: Aggregates clustered outcomes across all facilities."""
        straight_through = sum(1 for r in self._map_records if r.get("passed_tier_1", False))
        flagged = total_ingested - straight_through

        cluster_a = 0
        cluster_b = 0
        cluster_c = 0
        at_risk_facilities = set()

        for r in self._map_records:
            if not r.get("passed_tier_1", False):
                cat = r.get("triage_category")
                fac = r.get("facility_id")

                if cat == TriageCategory.CLUSTER_A_SCAN_DEGRADATION:
                    cluster_a += 1
                elif cat == TriageCategory.CLUSTER_B_FORMAT_DISCREPANCY:
                    cluster_b += 1
                elif cat == TriageCategory.CLUSTER_C_SUBSTANTIVE_BREACH:
                    cluster_c += 1
                    if fac:
                        at_risk_facilities.add(fac)

        wall_time = max(0.001, time.time() - start_time)
        throughput = round(total_ingested / wall_time, 2)

        return PortfolioBatchManifest(
            batch_id=self.batch_id,
            total_documents_processed=total_ingested,
            straight_through_accepted=straight_through,
            tier_2_flagged=flagged,
            cluster_a_ocr_remediated=cluster_a,
            cluster_b_format_resolved=cluster_b,
            cluster_c_human_breaches=cluster_c,
            critical_facilities_at_risk=sorted(list(at_risk_facilities)),
            processing_wall_time_sec=round(wall_time, 3),
            effective_throughput_docs_per_sec=throughput,
        )