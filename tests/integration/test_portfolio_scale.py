"""
Phase 2 Portfolio Scale Test Suite.
Verifies an enterprise borrower with 1,000+ historical documents can be updated in O(1) time
and queried for rolling multi-quarter LTM covenants in <40ms.
"""

from decimal import Decimal
import time
import pytest
from src.fintech_agent.models.facility_graph import (
    ComplianceSubmissionRecord,
    FacilityGraphRepository,
    FacilityMaster,
)


@pytest.fixture(scope="module")
def populated_facility_repo() -> FacilityGraphRepository:
    repo = FacilityGraphRepository(":memory:")

    # 1. Register base syndicated credit facility ($250M limit, 1.25x minimum FCCR)
    fac = FacilityMaster(
        facility_id="FAC-TITAN-900",
        borrower_name="Titan Logistics Global Inc.",
        facility_limit=Decimal("250000000.00"),
        base_covenant_threshold=Decimal("1.2500"),
    )
    repo.register_facility(fac)

    # 2. Seed 1,000 historical document submissions (simulating 10+ years of monthly statements)
    base_year = 2014
    for i in range(1, 1001):
        month = ((i - 1) % 12) + 1
        year = base_year + ((i - 1) // 12)
        date_str = f"{year:04d}-{month:02d}-15"

        repo.record_submission(
            ComplianceSubmissionRecord(
                submission_id=f"DOC-HIST-{i:05d}",
                facility_id="FAC-TITAN-900",
                period_date=date_str,
                reported_ebitda=Decimal("6250000.00"),
                cash_taxes=Decimal("600000.00"),
                unfunded_capex=Decimal("250000.00"),
                cash_interest=Decimal("2100000.00"),
                scheduled_principal=Decimal("1200000.00"),
            )
        )

    return repo


def test_incremental_doc_ingestion_and_rolling_ltm_speed(populated_facility_repo: FacilityGraphRepository):
    repo = populated_facility_repo

    # 1. Ingest Document #1,001 (incremental single-document arrival)
    t0 = time.time()
    repo.record_submission(
        ComplianceSubmissionRecord(
            submission_id="DOC-LIVE-01001",
            facility_id="FAC-TITAN-900",
            period_date="2099-01-15",
            reported_ebitda=Decimal("7500000.00"),
            cash_taxes=Decimal("700000.00"),
            unfunded_capex=Decimal("300000.00"),
            cash_interest=Decimal("2200000.00"),
            scheduled_principal=Decimal("1300000.00"),
        )
    )
    ingest_latency_ms = (time.time() - t0) * 1000
    assert ingest_latency_ms < 10.0, f"Incremental ingestion took {ingest_latency_ms}ms; target is <10ms"

    # 2. Benchmark rolling LTM FCCR calculation over 1,000+ historical records
    fccr, breach, query_latency_ms = repo.compute_rolling_ltm_fccr(
        facility_id="FAC-TITAN-900", as_of_date="2099-01-15", quarters=4
    )

    print(f"\n[✓] Ingested Document #1,001 in {ingest_latency_ms:.2f}ms")
    print(
        f"[✓] Rolling LTM FCCR query across 1,001 records completed in {query_latency_ms:.2f}ms (Result: {fccr}x, Breach: {breach})")

    # Assertions
    assert query_latency_ms < 40.0, f"Query took {query_latency_ms}ms; SLA is <40ms"
    assert fccr is not None
    assert fccr > Decimal("1.2500")
    assert breach is False