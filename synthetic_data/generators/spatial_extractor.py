import json
from pathlib import Path
from docling.document_converter import DocumentConverter


def extract_spatial_spans(pdf_path: Path) -> list[dict]:
    """
    Parses a physical PDF using Docling and extracts layout blocks
    with normalized bounding-box coordinates (x0, y0, x1, y1).
    """
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")

    converter = DocumentConverter()
    conversion_result = converter.convert(str(pdf_path))
    doc = conversion_result.document

    spans = []
    block_idx = 1

    for item, _level in doc.iterate_items():
        text = getattr(item, "text", "")
        if not text and hasattr(item, "export_to_markdown"):
            text = item.export_to_markdown()

        text = str(text).strip()
        if not text:
            continue

        # Extract spatial provenance (page number and bounding box coordinates)
        prov_list = getattr(item, "prov", [])
        if not prov_list:
            continue

        prov = prov_list[0]
        page_no = getattr(prov, "page_no", 1)
        bbox_obj = getattr(prov, "bbox", None)

        if bbox_obj is None:
            continue

        # Extract normalized boundary coordinates
        if hasattr(bbox_obj, "l") and hasattr(bbox_obj, "r"):
            x0 = float(bbox_obj.l)
            y0 = float(min(bbox_obj.t, bbox_obj.b))
            x1 = float(bbox_obj.r)
            y1 = float(max(bbox_obj.t, bbox_obj.b))
        elif hasattr(bbox_obj, "x0") and hasattr(bbox_obj, "x1"):
            x0 = float(bbox_obj.x0)
            y0 = float(min(bbox_obj.y0, bbox_obj.y1))
            x1 = float(bbox_obj.x1)
            y1 = float(max(bbox_obj.y0, bbox_obj.y1))
        else:
            continue

        spans.append({
            "block_id": f"p{page_no}-b{block_idx}",
            "page": page_no,
            "label": str(getattr(item, "label", "text")),
            "text": text,
            "bbox": {
                "x0": round(x0, 2),
                "y0": round(y0, 2),
                "x1": round(x1, 2),
                "y1": round(y1, 2),
            },
        })
        block_idx += 1

    return spans


if __name__ == "__main__":
    sample_pdf = Path("synthetic_data/output/cobalt_po.pdf")
    if not sample_pdf.exists():
        print(f"Sample PDF {sample_pdf} not found. Run pdf_generator.py first!")
    else:
        extracted_spans = extract_spatial_spans(sample_pdf)
        output_path = Path("synthetic_data/output/cobalt_po_spans.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(extracted_spans, f, indent=2)

        print(
            f"Successfully extracted {len(extracted_spans)} spatial spans from {sample_pdf.name}"
        )
        print(f"Saved spans manifest to: {output_path}")
        print("\n--- First 3 Extracted Spans ---")
        for s in extracted_spans[:3]:
            preview = s['text'].replace('\n', ' ')[:40]
            print(f"[{s['block_id']}] (Page {s['page']}) bbox={s['bbox']} | Text: {preview}...")