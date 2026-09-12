import json
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from synthetic_data.generators.case_generator import generate_cobalt_case
from synthetic_data.schemas.credit_case import CreditCaseManifest, DocumentMetadata


def build_pdf_from_doc(
    doc_meta: DocumentMetadata, company_name: str, output_path: Path
):
    """Compiles a single DocumentMetadata object into a native PDF using ReportLab."""
    pdf = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E293B"),
    )
    meta_style = ParagraphStyle(
        "DocMeta",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
    )

    elements = []

    # Header
    doc_title_text = doc_meta.document_type.replace("_", " ").title()
    elements.append(Paragraph(f"<b>{doc_title_text}</b>", title_style))
    elements.append(Spacer(1, 10))

    # Metadata Block
    meta_text = f"""
    <b>Company:</b> {company_name}<br/>
    <b>Counterparty:</b> {doc_meta.counterparty_name}<br/>
    <b>Document ID:</b> {doc_meta.document_id}<br/>
    <b>Issue Date:</b> {doc_meta.issue_date}
    """
    elements.append(Paragraph(meta_text, meta_style))
    elements.append(Spacer(1, 15))

    # Line Items Table (if applicable)
    if doc_meta.line_items:
        table_data = [["Item ID", "Description", "Qty", "Unit Price", "Total"]]
        for item in doc_meta.line_items:
            table_data.append(
                [
                    item.item_id,
                    item.description,
                    str(item.quantity),
                    f"${item.unit_price:,.2f}",
                    f"${item.total_amount:,.2f}",
                ]
            )

        # Append Total Row
        table_data.append(
            [
                "",
                "",
                "",
                "GRAND TOTAL:",
                f"${doc_meta.total_amount:,.2f}",
            ]
        )

        t = Table(
            table_data, colWidths=[80, 240, 50, 80, 90]
        )  # Total 540 pt width
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#0F172A"),
                    ),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -2), 0.5, colors.HexColor("#CBD5E1")),
                    ("LINEABOVE", (0, -1), (-1, -1), 1.0, colors.black),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ]
            )
        )
        elements.append(t)
    else:
        # Bank Payment Summary Table
        table_data = [
            ["Description", "Amount"],
            [
                f"Bank Wire Transfer ({doc_meta.document_id})",
                f"${doc_meta.total_amount:,.2f}",
            ],
            ["TOTAL RECORDED PAYMENT", f"${doc_meta.total_amount:,.2f}"],
        ]
        t = Table(table_data, colWidths=[360, 180])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#0F172A"),
                    ),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ]
            )
        )
        elements.append(t)

    pdf.build(elements)


def generate_case_pdfs(
    manifest: CreditCaseManifest, output_dir: str = "synthetic_data/output"
) -> list[Path]:
    """Generates all 3 PDF documents for a given CreditCaseManifest."""
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    generated_files = []
    docs = [
        manifest.purchase_order,
        manifest.invoice,
        manifest.bank_payment,
    ]

    for doc in docs:
        file_path = out_dir / doc.file_name
        build_pdf_from_doc(doc, manifest.company_name, file_path)
        generated_files.append(file_path)

    return generated_files


if __name__ == "__main__":
    case = generate_cobalt_case()
    pdf_paths = generate_case_pdfs(case)
    print("Generated PDF Documents:")
    for path in pdf_paths:
        print(f" - {path}")