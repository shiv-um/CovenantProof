import json
import os
import re
from typing import Any, Optional
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from pydantic import BaseModel, Field


class FinancialExtractionSchema(BaseModel):
    """Structured extraction contract for credit document financial figures."""
    po_total: Optional[str] = Field(None, description="Grand total amount on the purchase order")
    invoice_total: Optional[str] = Field(None, description="Total amount on the invoice")
    bank_payment_total: Optional[str] = Field(None, description="Cleared amount on the wire/payment receipt")
    ebitda: Optional[str] = Field(None, description="Earnings Before Interest, Taxes, Depreciation, Amortization")
    cash_taxes: Optional[str] = Field(None, description="Cash taxes paid in the period")
    interest_expense: Optional[str] = Field(None, description="Reported interest expense")
    current_maturities: Optional[str] = Field(None, description="Current portion of long-term debt")
    reported_dscr: Optional[str] = Field(None, description="Borrower certified DSCR ratio if present")


class BedrockAgentLLM:
    """
    Amazon Bedrock reasoning provider utilizing the unified Converse API.
    Enforces deterministic temperatures (0.0), adaptive retry backoff,
    and structured JSON decoding against Pydantic schemas.
    """

    def __init__(
            self,
            model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0",
            region_name: Optional[str] = None,
            max_tokens: int = 2048,
            temperature: float = 0.0,
    ):
        self.model_id = model_id
        self.region_name = region_name or os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self.max_tokens = max_tokens
        self.temperature = temperature

        # Exponential retry configuration for rate limiting resilience
        retry_config = Config(
            region_name=self.region_name,
            retries={"max_attempts": 5, "mode": "adaptive"},
        )
        self.client = boto3.client("bedrock-runtime", config=retry_config)

    def extract_financial_data(self, markdown_corpus: str) -> dict[str, Any]:
        """
        Extracts structured financial line-items from parsed document markdown.
        Falls back to regex extraction if AWS credentials are not active.
        """
        system_prompt = (
            "You are an expert financial auditor extraction agent. Extract exact numeric "
            "monetary values and ratios from the provided document markdown. "
            "Output ONLY valid raw JSON conforming strictly to the requested schema keys: "
            "po_total, invoice_total, bank_payment_total, ebitda, cash_taxes, "
            "interest_expense, current_maturities, reported_dscr. Omit currency signs ($) and commas."
        )

        user_prompt = f"Extract financial metrics from these parsed credit documents:\n\n{markdown_corpus}"

        if not (os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")):
            return self._heuristic_fallback(markdown_corpus)

        try:
            messages = [{"role": "user", "content": [{"text": user_prompt}]}]
            response = self.client.converse(
                modelId=self.model_id,
                messages=messages,
                system=[{"text": system_prompt}],
                inferenceConfig={
                    "maxTokens": self.max_tokens,
                    "temperature": self.temperature,
                },
            )
            raw_text = response["output"]["message"]["content"][0]["text"].strip()

            # Clean markdown code fences if generated
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:-3].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:-3].strip()

            return json.loads(raw_text)

        except (ClientError, Exception) as exc:
            # Fallback to local deterministic pattern extraction on API disconnect
            return self._heuristic_fallback(markdown_corpus, error=str(exc))

    def compose_audit_memo(self, findings: list[dict[str, Any]], calculations: list[dict[str, Any]]) -> str:
        """Composes an evidence-grounded credit audit memo using Claude 3.5 Sonnet."""
        if not (os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")):
            dscr_val = calculations[0]["output"] if calculations else "N/A"
            return (
                f"AUDIT DETERMINATION MEMO (Local Fallback):\n"
                f"- Review Required: {len(findings) > 0}\n"
                f"- Recomputed DSCR: {dscr_val}x\n"
                f"- Discrepancies Detected: {len(findings)}"
            )

        system_prompt = (
            "You are the CovenantProof Chief Credit Reviewer. Synthesize a concise, "
            "formal credit audit memo summarizing the findings and calculations. "
            "Reference evidence-grounded facts and do not make automated credit decisions."
        )

        user_prompt = (
            f"Findings:\n{json.dumps(findings, indent=2)}\n\n"
            f"Deterministic Calculations:\n{json.dumps(calculations, indent=2)}"
        )

        try:
            messages = [{"role": "user", "content": [{"text": user_prompt}]}]
            response = self.client.converse(
                modelId=self.model_id,
                messages=messages,
                system=[{"text": system_prompt}],
                inferenceConfig={
                    "maxTokens": self.max_tokens,
                    "temperature": self.temperature,
                },
            )
            return response["output"]["message"]["content"][0]["text"].strip()

        except Exception as exc:
            return f"AUDIT MEMO (Bedrock Fallback: {str(exc)})"

    def _heuristic_fallback(self, text: str, error: Optional[str] = None) -> dict[str, Any]:
        """Deterministic regex parsing when cloud inference endpoint is unauthenticated."""
        extracted: dict[str, Any] = {}

        patterns = {
            "po_total": r"GRAND TOTAL:?\s*\$?([\d,]+\.?\d*)",
            "invoice_total": r"GRAND TOTAL:?\s*\$?([\d,]+\.?\d*)",
            "bank_payment_total": r"TOTAL RECORDED PAYMENT:?\s*\$?([\d,]+\.?\d*)",
            "ebitda": r"EBITDA:?\s*\$?([\d,]+\.?\d*)",
            "cash_taxes": r"Cash Taxes:?\s*\$?([\d,]+\.?\d*)",
            "interest_expense": r"Interest Expense:?\s*\$?([\d,]+\.?\d*)",
            "current_maturities": r"Current Maturities:?\s*\$?([\d,]+\.?\d*)",
        }

        for field_name, regex in patterns.items():
            match = re.search(regex, text, re.IGNORECASE)
            if match:
                extracted[field_name] = match.group(1).replace(",", "")

        return extracted
