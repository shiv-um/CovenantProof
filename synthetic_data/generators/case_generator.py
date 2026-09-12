import json
import random
from decimal import Decimal
from pathlib import Path
from synthetic_data.schemas.credit_case import (
    CreditCaseManifest,
    DocumentMetadata,
    LineItem,
    SeededDiscrepancy,
)


def generate_cobalt_case(seed: int = 42) -> CreditCaseManifest:
    """Generates the canonical 'Cobalt Equipment' credit case manifest
    with a seeded $27,000 bank payment discrepancy.
    """
    random.seed(seed)

    company_name = "Cobalt Equipment LLC"
    counterparty = "Atlas Industrial Supply Inc."
    issue_date = "2026-08-15"

    line_items = [
        LineItem(
            item_id="ITEM-001",
            description="Heavy Duty Hydraulic Excavator Component A",
            quantity=Decimal("2.00"),
            unit_price=Decimal("45000.00"),
            total_amount=Decimal("90000.00"),
        ),
        LineItem(
            item_id="ITEM-002",
            description="Industrial Reinforced Steer Axle Assembly",
            quantity=Decimal("5.00"),
            unit_price=Decimal("7000.00"),
            total_amount=Decimal("35000.00"),
        ),
    ]

    po_total = Decimal("125000.00")
    inv_total = Decimal("125000.00")

    # Seeded discrepancy: Bank payment recorded as $152,000 instead of $125,000 ($27,000 delta)
    bank_total = Decimal("152000.00")

    po_doc = DocumentMetadata(
        document_id="PO-2026-8801",
        document_type="PURCHASE_ORDER",
        file_name="cobalt_po.pdf",
        issue_date=issue_date,
        counterparty_name=counterparty,
        total_amount=po_total,
        line_items=line_items,
    )

    inv_doc = DocumentMetadata(
        document_id="INV-2026-9904",
        document_type="INVOICE",
        file_name="cobalt_invoice.pdf",
        issue_date=issue_date,
        counterparty_name=counterparty,
        total_amount=inv_total,
        line_items=line_items,
    )

    bank_doc = DocumentMetadata(
        document_id="PAY-2026-4412",
        document_type="BANK_PAYMENT",
        file_name="cobalt_bank_payment.pdf",
        issue_date=issue_date,
        counterparty_name=counterparty,
        total_amount=bank_total,
        line_items=[],
    )

    discrepancy = SeededDiscrepancy(
        has_discrepancy=True,
        discrepancy_type="PAYMENT_AMOUNT_MISMATCH",
        expected_amount=inv_total,
        actual_amount=bank_total,
        delta_amount=bank_total - inv_total,
        explanation="Bank payment ($152,000.00) exceeds invoice total ($125,000.00) by $27,000.00.",
    )

    return CreditCaseManifest(
        case_id="CASE-COBALT-2026",
        company_name=company_name,
        seed_number=seed,
        purchase_order=po_doc,
        invoice=inv_doc,
        bank_payment=bank_doc,
        discrepancy=discrepancy,
    )


def save_case_manifest(
    manifest: CreditCaseManifest, output_dir: str = "synthetic_data/output"
) -> Path:
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    file_path = out_path / f"{manifest.case_id}.json"

    data = manifest.model_dump(mode="json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return file_path


if __name__ == "__main__":
    case = generate_cobalt_case()
    saved_path = save_case_manifest(case)
    print(f"Generated manifest saved to: {saved_path}")