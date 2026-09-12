from pathlib import Path
from docling.document_converter import DocumentConverter


def parse_pdf_document(pdf_path: Path) -> dict:
    """Parses a physical PDF file using Docling and extracts structured Markdown."""
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")

    converter = DocumentConverter()
    conversion_result = converter.convert(str(pdf_path))

    # Export document to structured Markdown representation
    markdown_text = conversion_result.document.export_to_markdown()

    return {
        "file_name": pdf_path.name,
        "markdown": markdown_text,
    }


if __name__ == "__main__":
    sample_pdf = Path("synthetic_data/output/cobalt_po.pdf")
    if sample_pdf.exists():
        parsed_data = parse_pdf_document(sample_pdf)
        print(f"Successfully parsed: {parsed_data['file_name']}")
        print("--- Extracted Markdown ---")
        print(parsed_data["markdown"])
    else:
        print(
            f"Sample PDF {sample_pdf} not found. Run pdf_generator.py first!"
        )