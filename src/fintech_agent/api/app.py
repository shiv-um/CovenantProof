import asyncio
from typing import Any, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from src.fintech_agent.evaluation.economics import compute_economic_roi
from src.fintech_agent.runtime.budgets import ExecutionBudget
from src.fintech_agent.runtime.harness import run_credit_audit
from src.fintech_agent.runtime.redis_store import RedisStore

app = FastAPI(
    title="CovenantProof Commercial Underwriting Auditor API",
    version="1.0.0",
    description="Deterministic multi-agent credit covenant reconciliation and evidence grounding engine.",
)

_store = RedisStore()


class DocumentPayload(BaseModel):
    document_type: str
    total_amount: Optional[str] = None
    sha256: Optional[str] = None
    ebitda: Optional[str] = None
    cash_taxes: Optional[str] = None
    interest_expense: Optional[str] = None
    current_maturities: Optional[str] = None
    reported_dscr: Optional[str] = None


class AuditRequest(BaseModel):
    case_id: str = Field(..., examples=["CASE-COBALT-2026"])
    company_name: str = Field(..., examples=["Cobalt Equipment LLC"])
    purchase_order: Optional[DocumentPayload] = None
    invoice: Optional[DocumentPayload] = None
    bank_payment: Optional[DocumentPayload] = None
    covenant_certificate: Optional[DocumentPayload] = None


class AuditResponse(BaseModel):
    case_id: str
    status: str
    review_required: bool
    findings_count: int
    claims_count: int
    elapsed_seconds: float
    cost_usd: float
    tokens_consumed: int
    is_leader: bool


@app.get("/health", tags=["Operations"])
async def health_check() -> dict[str, str]:
    connected = await _store.connect()
    return {
        "status": "HEALTHY",
        "redis_driver": "CONNECTED" if connected else "IN_MEMORY_FALLBACK",
        "service": "CovenantProof Auditor Swarm",
    }


@app.post(
    "/api/v1/audits",
    response_model=AuditResponse,
    status_code=status.HTTP_200_OK,
    tags=["Underwriting"],
)
async def create_credit_audit(request: AuditRequest) -> Any:
    manifest = request.model_dump(exclude_none=True)
    budget = ExecutionBudget(max_cost_usd=0.20, max_generated_tokens=6000)

    try:
        execution_output = await run_credit_audit(manifest, budget=budget)
        summary = execution_output["execution_summary"]
        return {
            **summary,
            "is_leader": execution_output["is_leader"],
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audit run failure: {str(exc)}",
        )


@app.get("/api/v1/audits/{case_id}", tags=["Underwriting"])
async def get_audit_record(case_id: str) -> dict[str, Any]:
    await _store.connect()
    record = await _store.get_state(case_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit record not found for case: {case_id}",
        )
    return record


@app.get("/api/v1/metrics/economics", tags=["Economics"])
async def get_economic_model() -> dict[str, Any]:
    report = compute_economic_roi()
    return {
        "annual_volume": report.annual_case_volume,
        "analyst_hourly_wage": float(report.analyst_hourly_wage),
        "manual_hours_per_case": float(report.manual_hours_per_case),
        "automated_hours_per_case": float(report.auto_human_hours_per_case),
        "net_annual_benefit_usd": float(report.net_annual_benefit),
        "roi_percentage": float(report.roi_percentage),
        "hours_saved_annually": float(report.hours_saved_annually),
    }


if __name__ == "__main__":
    from fastapi.testclient import TestClient

    client = TestClient(app)

    # 1. Verify health endpoint
    health_resp = client.get("/health")
    print(f"1. Health Check Endpoint:  {health_resp.status_code} | {health_resp.json()}")

    # 2. Verify economics endpoint
    econ_resp = client.get("/api/v1/metrics/economics")
    print(f"2. Economics Endpoint:     {econ_resp.status_code} | Net Benefit: ${econ_resp.json()['net_annual_benefit_usd']:,.2f}")

    # 3. Verify audit creation endpoint
    payload = {
        "case_id": "CASE-API-TEST-001",
        "company_name": "API Verifier Inc",
        "purchase_order": {"document_type": "purchase_order", "total_amount": "125000.00"},
        "invoice": {"document_type": "invoice", "total_amount": "125000.00"},
        "bank_payment": {"document_type": "bank_payment", "total_amount": "152000.00"},
        "covenant_certificate": {
            "document_type": "covenant_certificate",
            "ebitda": "1500000.00",
            "cash_taxes": "100000.00",
            "interest_expense": "700000.00",
            "current_maturities": "500000.00",
        },
    }
    audit_resp = client.post("/api/v1/audits", json=payload)
    data = audit_resp.json()
    print(f"3. Audit Trigger Endpoint: {audit_resp.status_code}")
    print(f"   - Case ID:         {data.get('case_id')}")
    print(f"   - Review Required: {data.get('review_required')}")
    print(f"   - Findings Count:  {data.get('findings_count')}")
    print(f"   - Variable Cost:   ${data.get('cost_usd'):.4f}")