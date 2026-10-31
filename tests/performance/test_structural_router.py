"""
Phase 2 Performance Benchmark Test.
Synthesizes a 1,000-page LSTA Credit Agreement and benchmarks Stage 0 routing speed and accuracy.
"""

from pathlib import Path
import pytest
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from src.fintech_agent.services.document_router import DocumentStructuralRouter


@pytest.fixture(scope="module")
def synthetic_1000_page_pdf(tmp_path_factory) -> Path:
    """Generates a synthetic 1,000-page LSTA credit agreement PDF with Section 8.4 on page 742."""
    tmp_dir = tmp_path_factory.mktemp("perf_data")
    pdf_path = tmp_dir / "Syndicated_Credit_Agreement_1000_Pages.pdf"

    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    total_pages = 1000
    target_page = 742

    for p in range(1, total_pages + 1):
        if p == 1:
            c.drawString(100, 750, "CREDIT AGREEMENT dated as of October 28, 2026")
            c.drawString(100, 730, "among APEX LOGISTICS HOLDINGS INC., as Borrower")
            c.drawString(100, 710, "and JPMORGAN CHASE BANK, N.A., as Administrative Agent")
        elif p == target_page:
            # Anchor page: Section 8.4 Financial Covenants
            c.drawString(100, 750, "ARTICLE VIII - NEGATIVE COVENANTS")
            c.drawString(100, 730, "SECTION 8.4. Financial Covenants.")
            c.drawString(
                100, 710,
                "(a) Fixed Charge Coverage Ratio. The Borrower shall not permit the FCCR to be less than 1.25 to 1.00."
            )
            c.drawString(
                100, 690,
                "(b) Consolidated Adjusted EBITDA. Permitted pro-forma cost synergies under clause (iv) shall not exceed 15.0%."
            )
        else:
            c.drawString(100, 750, f"Page {p} of {total_pages} - Standard LSTA Boilerplate Provisions")
            c.drawString(100, 730, "The obligations of the Lenders to make Loans are subject to satisfaction of conditions.")

        c.showPage()

    c.save()
    return pdf_path


def test_1000_page_pruning_performance(synthetic_1000_page_pdf: Path):
    router = DocumentStructuralRouter(page_window_padding=2)

    result = router.route_document(synthetic_1000_page_pdf)

    # 1. Total page verification
    assert result.total_original_pages == 1000

    # 2. Pruning ratio assertion: Must reduce document by > 99%
    assert result.pruning_ratio >= 99.0, f"Pruning ratio {result.pruning_ratio}% is below 99%"
    assert len(result.selected_page_indices) <= 6, f"Extracted {len(result.selected_page_indices)} pages; expected <= 6"

    # 3. Section 8.4 detection on page 742 (0-indexed: 741)
    assert 741 in result.selected_page_indices, "Target covenant page 742 was missed by the router"

    # 4. Latency assertion: Must execute in < 500ms
    assert result.routing_latency_ms < 500.0, f"Routing took {result.routing_latency_ms}ms; benchmark target is < 500ms"

    # 5. Content verification: Covenant terms must exist in pruned text
    assert "section 8.4. financial covenants." in result.extracted_text.lower()
    assert "15.0%" in result.extracted_text

    print(f"\n[✓] 1,000-page document pruned to {len(result.selected_page_indices)} pages ({result.pruning_ratio}% reduction)")
    print(f"[✓] Stage 0 Latency: {result.routing_latency_ms:.1f}ms (Method: {result.routing_method})")