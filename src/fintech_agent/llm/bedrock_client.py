import json
import os
import re
from typing import Any, Optional
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from opentelemetry import trace as trace_api
from opentelemetry.trace import SpanKind
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
    Instrumented with OpenTelemetry to report token consumption and latency directly to Phoenix.
    """

    def __init__(
        self,
        model_id: str = "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
        region_name: Optional[str] = None,
        max_tokens: int = 2048,
        temperature: float = 0.0,
    ):
        self.model_id = model_id
        self.region_name = region_name or os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.tracer = trace_api.get_tracer("covenantproof.llm")

        retry_config = Config(
            region_name=self.region_name,
            retries={"max_attempts": 5, "mode": "adaptive"},
        )
        self.client = boto3.client("bedrock-runtime", config=retry_config)

    def extract_financial_data(self, markdown_corpus: str) -> dict[str, Any]:
        """
        Extracts structured financial line-items from parsed document markdown.
        Reports token counts, latency, and model attributes to Arize Phoenix.
        """
        system_prompt = (
            "You are an expert financial auditor extraction agent. Extract exact numeric "
            "monetary values and ratios from the provided document markdown. "
            "Output ONLY valid raw JSON conforming strictly to these schema keys: "
            "po_total, invoice_total, bank_payment_total, ebitda, cash_taxes, "
            "interest_expense, current_maturities, reported_dscr. "
            "Omit currency signs ($) and commas. Do not include markdown code block formatting."
        )
        user_prompt = f"Extract financial metrics from these parsed credit documents:\n\n{markdown_corpus}"

        if not (os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")):
            return self._heuristic_fallback(markdown_corpus)

        # OpenTelemetry span formatted for Phoenix LLM detection
        with self.tracer.start_as_current_span(
            name=f"Bedrock Converse: {self.model_id}",
            kind=SpanKind.CLIENT,
        ) as span:
            span.set_attribute("openinference.span.kind", "LLM")
            span.set_attribute("llm.model_name", self.model_id)
            span.set_attribute("llm.provider", "bedrock")
            span.set_attribute("llm.prompts.0.role", "system")
            span.set_attribute("llm.prompts.0.content", system_prompt)
            span.set_attribute("llm.prompts.1.role", "user")
            span.set_attribute("llm.prompts.1.content", user_prompt[:1000])

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

                # Record token metrics returned by Bedrock Converse API
                usage = response.get("usage", {})
                in_tokens = usage.get("inputTokens", 0)
                out_tokens = usage.get("outputTokens", 0)
                total_tokens = usage.get("totalTokens", in_tokens + out_tokens)

                span.set_attribute("llm.token_count.prompt", in_tokens)
                span.set_attribute("llm.token_count.completion", out_tokens)
                span.set_attribute("llm.token_count.total", total_tokens)

                raw_text = response["output"]["message"]["content"][0]["text"].strip()
                span.set_attribute("llm.response.content", raw_text)

                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:-3].strip()
                elif raw_text.startswith("```"):
                    raw_text = raw_text[3:-3].strip()

                data = json.loads(raw_text)
                return data

            except (ClientError, Exception) as exc:
                span.record_exception(exc)
                span.set_status(trace_api.StatusCode.ERROR, str(exc))
                return self._heuristic_fallback(markdown_corpus, error=str(exc))

    def compose_audit_memo(self, findings: list[dict[str, Any]], calculations: list[dict[str, Any]]) -> str:
        """Composes an evidence-grounded credit audit memo using Claude Sonnet."""
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

        with self.tracer.start_as_current_span(
            name=f"Bedrock Compose Memo: {self.model_id}",
            kind=SpanKind.CLIENT,
        ) as span:
            span.set_attribute("openinference.span.kind", "LLM")
            span.set_attribute("llm.model_name", self.model_id)
            span.set_attribute("llm.provider", "bedrock")

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
                usage = response.get("usage", {})
                span.set_attribute("llm.token_count.prompt", usage.get("inputTokens", 0))
                span.set_attribute("llm.token_count.completion", usage.get("outputTokens", 0))
                span.set_attribute("llm.token_count.total", usage.get("totalTokens", 0))

                memo = response["output"]["message"]["content"][0]["text"].strip()
                span.set_attribute("llm.response.content", memo)
                return memo
            except Exception as exc:
                span.record_exception(exc)
                span.set_status(trace_api.StatusCode.ERROR, str(exc))
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
