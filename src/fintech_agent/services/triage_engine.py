"""
Automated Tier 2 Edge-Case Triage & Clustering Engine.
Categorizes flagged documents from high-volume batch runs into operational action clusters.
"""

from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Dict, Any, List


class TriageCategory(str, Enum):
    CLUSTER_A_SCAN_DEGRADATION = "CLUSTER_A_SCAN_DEGRADATION"
    CLUSTER_B_FORMAT_DISCREPANCY = "CLUSTER_B_FORMAT_DISCREPANCY"
    CLUSTER_C_SUBSTANTIVE_BREACH = "CLUSTER_C_SUBSTANTIVE_BREACH"


@dataclass
class TriageDecision:
    doc_id: str
    facility_id: str
    category: TriageCategory
    confidence_score: float
    recommended_action: str
    requires_human_escalation: bool


class EdgeCaseTriageEngine:
    """
    Triages documents that failed Tier 1 straight-through processing.
    Separates simple scan/formatting noise from true balance sheet covenant breaches.
    """

    def triage_record(self, record: Dict[str, Any]) -> TriageDecision:
        doc_id = record.get("doc_id", "UNKNOWN-DOC")
        facility_id = record.get("facility_id", "UNKNOWN-FAC")
        ocr_confidence = float(record.get("ocr_confidence", 1.0))
        discrepancy_type = record.get("discrepancy_type")
        has_fccr_breach = bool(record.get("fccr_breach", False))
        wire_variance = Decimal(str(record.get("wire_variance", "0.00")))

        # 1. Cluster A: OCR Quality / Low-Contrast Scan Degradation
        if ocr_confidence < 0.75 or record.get("scan_unreadable", False):
            return TriageDecision(
                doc_id=doc_id,
                facility_id=facility_id,
                category=TriageCategory.CLUSTER_A_SCAN_DEGRADATION,
                confidence_score=ocr_confidence,
                recommended_action="Route to adaptive image binarization and re-ingest",
                requires_human_escalation=False,
            )

        # 2. Cluster C: Substantive Covenant Breach or Wire Tampering
        if has_fccr_breach or abs(wire_variance) > Decimal("1000.00"):
            return TriageDecision(
                doc_id=doc_id,
                facility_id=facility_id,
                category=TriageCategory.CLUSTER_C_SUBSTANTIVE_BREACH,
                confidence_score=0.98,
                recommended_action="Execute full 4-Agent LangGraph DAG and route to Tier 2 Exception Desk",
                requires_human_escalation=True,
            )

        # 3. Cluster B: Minor SWIFT Tag Format or Minor Cent Variance
        return TriageDecision(
            doc_id=doc_id,
            facility_id=facility_id,
            category=TriageCategory.CLUSTER_B_FORMAT_DISCREPANCY,
            confidence_score=0.92,
            recommended_action="Reconcile programmatically via symbolic math engine",
            requires_human_escalation=False,
        )