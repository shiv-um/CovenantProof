from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    page: int = Field(description="1-based page index")
    x_min: float = Field(description="Normalized x minimum coordinate [0.0, 1.0]")
    y_min: float = Field(description="Normalized y minimum coordinate [0.0, 1.0]")
    x_max: float = Field(description="Normalized x maximum coordinate [0.0, 1.0]")
    y_max: float = Field(description="Normalized y maximum coordinate [0.0, 1.0]")


class LineItem(BaseModel):
    item_id: str
    description: str
    quantity: Decimal
    unit_price: Decimal
    total_amount: Decimal
    bbox: Optional[BoundingBox] = None


class DocumentMetadata(BaseModel):
    document_id: str
    document_type: str  # e.g., "PURCHASE_ORDER", "INVOICE", "BANK_PAYMENT"
    file_name: str
    issue_date: str
    counterparty_name: str
    total_amount: Decimal
    line_items: List[LineItem] = Field(default_factory=list)


class SeededDiscrepancy(BaseModel):
    has_discrepancy: bool = False
    discrepancy_type: Optional[str] = None  # e.g., "PAYMENT_AMOUNT_MISMATCH"
    expected_amount: Optional[Decimal] = None
    actual_amount: Optional[Decimal] = None
    delta_amount: Optional[Decimal] = None
    explanation: Optional[str] = None


class CreditCaseManifest(BaseModel):
    case_id: str
    company_name: str
    seed_number: int
    purchase_order: DocumentMetadata
    invoice: DocumentMetadata
    bank_payment: DocumentMetadata
    discrepancy: SeededDiscrepancy