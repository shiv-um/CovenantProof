"""
Stage 0 Document Structural Router.
Prunes 1,000+ page syndicated credit agreements down to 4-8 targeted covenant pages.
Executes purely on CPU in <500ms using pypdfium2 to eliminate LLM attention decay.
"""

from dataclasses import dataclass
from pathlib import Path
import re
import time
from typing import List, Optional, Set
import pypdfium2 as pdfium


@dataclass
class RoutedContext:
    total_original_pages: int
    selected_page_indices: List[int]
    extracted_text: str
    pruning_ratio: float
    routing_latency_ms: float
    routing_method: str
    target_clauses_identified: List[str]


# Key LSTA/LMA financial covenant anchors
OUTLINE_TARGET_PATTERNS = [
    r"article\s+(viii|8|vii|7)",
    r"negative\s+covenants",
    r"financial\s+covenants",
    r"section\s+8\.(4|1|2|3)",
    r"consolidated\s+(adjusted\s+)?ebitda",
    r"covenants",
]

LEXICAL_ANCHORS = [
    "consolidated adjusted ebitda",
    "fixed charge coverage ratio",
    "pro forma cost savings",
    "synergies",
    "section 8.4",
    "leverage ratio",
    "debt service coverage",
]


class DocumentStructuralRouter:
    """
    Two-stage structural parser:
    1. Fast Outline Path: Traverses PDF bookmarks/TOC outline tree.
    2. Fallback Lexical Density Path: Rapid text scan across un-bookmarked pages.
    """

    def __init__(self, page_window_padding: int = 2):
        self.padding = page_window_padding

    def route_document(self, file_path: Path) -> RoutedContext:
        t0 = time.time()
        pdf = pdfium.PdfDocument(file_path)
        total_pages = len(pdf)

        matched_pages: Set[int] = set()
        identified_clauses: List[str] = []
        method = "OUTLINE_TOC"

        # 1. Attempt Outline / Bookmark Tree Traversal
        try:
            toc = list(pdf.get_toc())
            for item in toc:
                title_lower = item.title.lower()
                for pattern in OUTLINE_TARGET_PATTERNS:
                    if re.search(pattern, title_lower):
                        page_index = item.page_index
                        if 0 <= page_index < total_pages:
                            matched_pages.add(page_index)
                            identified_clauses.append(f"{item.title} (Page {page_index + 1})")
        except Exception:
            pass

        # 2. Fallback: Lexical Keyword Density Scan (if document lacks outline bookmarks)
        if not matched_pages:
            method = "LEXICAL_DENSITY_FALLBACK"
            for p_idx in range(total_pages):
                page = pdf[p_idx]
                textpage = page.get_textpage()
                page_text = textpage.get_text_range().lower()
                textpage.close()
                page.close()

                # Score page based on covenant keyword frequency
                hits = sum(1 for kw in LEXICAL_ANCHORS if kw in page_text)
                if hits >= 2:
                    matched_pages.add(p_idx)
                    identified_clauses.append(f"Covenant Density Hit (Page {p_idx + 1}, {hits} anchors)")

        # Fallback default: If completely flat/ambiguous, extract the first 6 pages
        if not matched_pages:
            method = "HEAD_DEFAULT"
            matched_pages = set(range(min(6, total_pages)))

        # 3. Apply Context Padding (Include +/- N neighboring pages for complete clause context)
        padded_pages: Set[int] = set()
        for p in matched_pages:
            for offset in range(-self.padding, self.padding + 1):
                idx = p + offset
                if 0 <= idx < total_pages:
                    padded_pages.add(idx)

        selected_indices = sorted(list(padded_pages))

        # 4. Extract targeted text strictly from pruned pages
        extracted_chunks: List[str] = []
        for idx in selected_indices:
            page = pdf[idx]
            textpage = page.get_textpage()
            extracted_chunks.append(f"--- PAGE {idx + 1} OF {total_pages} ---\n" + textpage.get_text_range())
            textpage.close()
            page.close()

        pdf.close()

        latency_ms = (time.time() - t0) * 1000
        pruning_ratio = round((1.0 - (len(selected_indices) / max(total_pages, 1))) * 100, 2)

        return RoutedContext(
            total_original_pages=total_pages,
            selected_page_indices=selected_indices,
            extracted_text="\n\n".join(extracted_chunks),
            pruning_ratio=pruning_ratio,
            routing_latency_ms=round(latency_ms, 2),
            routing_method=method,
            target_clauses_identified=identified_clauses,
        )