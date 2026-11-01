import asyncio
import os
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import psycopg2

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

POSTGRES_URI = os.getenv(
    "POSTGRES_URI",
    "postgresql://postgres:postgrespassword@postgres:5432/covenantproof?sslmode=disable",
)
DEFAULT_TENANT_ID = os.getenv("DEFAULT_TENANT_ID", "00000000-0000-0000-0000-000000000001")


def persist_audit_record(
    execution_output: Dict[str, Any],
    manifest: Dict[str, Any],
    tenant_id: str = DEFAULT_TENANT_ID,
) -> None:
    try:
        conn = psycopg2.connect(POSTGRES_URI)
        with conn:
            with conn.cursor() as cur:
                # 1. Enforce Kernel-Level Tenant Context for RLS
                cur.execute("SET LOCAL app.current_tenant = %s;", (tenant_id,))

                # 2. Upsert Case Record
                case_id = manifest.get("case_id")
                company_name = manifest.get("company_name", "Corporate Borrower")

                cur.execute(
                    """
                    INSERT INTO cases (case_identifier, company_name, mode, tenant_id)
                    VALUES (%s, %s, %s, %s::uuid)
                    ON CONFLICT (case_identifier) DO UPDATE 
                    SET company_name = EXCLUDED.company_name
                    RETURNING id;
                    """,
                    (case_id, company_name, "live", tenant_id),
                )
                case_uuid = cur.fetchone()[0]

                # 3. Extract Findings from final_state
                final_state = execution_output.get("final_state") or {}
                findings = final_state.get("findings") or []

                for f in findings:
                    raw_severity = str(f.get("severity", "medium")).lower()
                    # Map 'critical' to 'high' to satisfy findings_severity_check
                    allowed = {"info", "low", "medium", "high"}
                    severity = raw_severity if raw_severity in allowed else "high"

                    statement = f.get("statement") or f.get("title") or "Underwriting variance recorded."

                    cur.execute(
                        """
                        INSERT INTO findings (
                            case_id, 
                            kind, 
                            severity, 
                            title, 
                            statement, 
                            status, 
                            human_review_required, 
                            tenant_id
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::uuid);
                        """,
                        (
                            case_uuid,
                            f.get("kind", "covenant_variance"),
                            severity,
                            f.get("title", "Underwriting Finding"),
                            statement,
                            "open",
                            f.get("human_review_required", True),
                            tenant_id,
                        ),
                    )
        conn.close()
    except Exception as exc:
        print(f"[PostgreSQL Persistence Warning]: {exc}")


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

        # Persist case & findings to PostgreSQL
        persist_audit_record(execution_output, manifest)

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