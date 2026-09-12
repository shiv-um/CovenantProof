import json
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_EVEN, localcontext
from pathlib import Path
from typing import Literal


@dataclass(frozen=True)
class Discrepancy:
    discrepancy_type: str
    severity: Literal["info", "low", "medium", "high"]
    field: str
    expected_value: Decimal
    actual_value: Decimal
    variance: Decimal
    description: str


@dataclass(frozen=True)
class ThreeWayMatchResult:
    is_matched: bool
    po_total: Decimal
    invoice_total: Decimal
    bank_payment_total: Decimal
    po_invoice_variance: Decimal
    invoice_bank_variance: Decimal
    discrepancies: list[Discrepancy]


def match_three_way(
    *,
    po_total: Decimal,
    invoice_total: Decimal,
    bank_payment_total: Decimal,
    tolerance: Decimal = Decimal("0.01"),
) -> ThreeWayMatchResult:
    """
    Deterministically reconciles Purchase Order, Invoice, and Bank Payment amounts.
    Enforces exact Decimal arithmetic with zero float tolerance.
    """
    with localcontext() as ctx:
        ctx.prec = 28
        po_inv_diff = (invoice_total - po_total).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)
        inv_bank_diff = (bank_payment_total - invoice_total).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)

    discrepancies: list[Discrepancy] = []

    if abs(po_inv_diff) > tolerance:
        discrepancies.append(
            Discrepancy(
                discrepancy_type="po_invoice_mismatch",
                severity="high",
                field="total_amount",
                expected_value=po_total,
                actual_value=invoice_total,
                variance=po_inv_diff,
                description=f"Invoice total (${invoice_total:,.2f}) does not match PO total (${po_total:,.2f}).",
            )
        )

    if abs(inv_bank_diff) > tolerance:
        discrepancies.append(
            Discrepancy(
                discrepancy_type="invoice_bank_mismatch",
                severity="high",
                field="payment_amount",
                expected_value=invoice_total,
                actual_value=bank_payment_total,
                variance=inv_bank_diff,
                description=f"Cleared bank payment (${bank_payment_total:,.2f}) does not match invoice total (${invoice_total:,.2f}).",
            )
        )

    return ThreeWayMatchResult(
        is_matched=len(discrepancies) == 0,
        po_total=po_total,
        invoice_total=invoice_total,
        bank_payment_total=bank_payment_total,
        po_invoice_variance=po_inv_diff,
        invoice_bank_variance=inv_bank_diff,
        discrepancies=discrepancies,
    )


def _extract_amount(doc: dict) -> Decimal:
    """Extracts the monetary total across common schema field naming conventions."""
    for field in ("total_amount", "total", "amount", "grand_total", "payment_amount"):
        if field in doc and doc[field] is not None:
            return Decimal(str(doc[field]))
    available_fields = list(doc.keys())
    raise KeyError(f"No valid amount field found in document. Available fields: {available_fields}")


def _resolve_document(manifest: dict, *keys: str) -> dict:
    """
    Resolves a document object from the manifest.
    Supports top-level keys (e.g. manifest['purchase_order']) as well as
    nested arrays (e.g. manifest['documents']).
    """
    # 1. Check top-level keys directly
    for k in keys:
        if k in manifest and isinstance(manifest[k], dict):
            return manifest[k]

    # 2. Check nested 'documents' list if present
    for doc in manifest.get("documents", []):
        doc_type = str(doc.get("document_type") or doc.get("type") or "").lower()
        for k in keys:
            if k.lower() in doc_type or doc_type in k.lower():
                return doc

    raise KeyError(f"Could not locate document matching {keys} in manifest.")


def reconcile_case_manifest(manifest_path: Path) -> ThreeWayMatchResult:
    """Loads a canonical CreditCaseManifest JSON file and verifies 3-way reconciliation."""
    if not manifest_path.exists():
        raise FileNotFoundError(f"Case manifest not found at: {manifest_path}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    po_doc = _resolve_document(data, "purchase_order", "po")
    invoice_doc = _resolve_document(data, "invoice", "inv")
    bank_doc = _resolve_document(data, "bank_payment", "bank", "payment")

    po_total = _extract_amount(po_doc)
    invoice_total = _extract_amount(invoice_doc)
    bank_total = _extract_amount(bank_doc)

    return match_three_way(
        po_total=po_total,
        invoice_total=invoice_total,
        bank_payment_total=bank_total,
    )


if __name__ == "__main__":
    canonical_manifest = Path("synthetic_data/output/CASE-COBALT-2026.json")
    if canonical_manifest.exists():
        result = reconcile_case_manifest(canonical_manifest)
        print(f"Reconciliation Match Status: {'PASSED' if result.is_matched else 'FAILED (Discrepancy Detected)'}")
        print(f"PO Total:            ${result.po_total:,.2f}")
        print(f"Invoice Total:       ${result.invoice_total:,.2f}")
        print(f"Bank Payment Total:  ${result.bank_payment_total:,.2f}")
        print(f"Payment Variance:    ${result.invoice_bank_variance:,.2f}")
        print(f"Discrepancies Found: {len(result.discrepancies)}")
        for d in result.discrepancies:
            print(f" - [{d.severity.upper()}] {d.discrepancy_type}: {d.description}")
    else:
        print(f"Manifest {canonical_manifest} not found. Run case_generator.py first!")