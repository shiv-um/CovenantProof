"""
Phase 4 Multi-Tenant Security & Isolation Integration Test Suite.
Verifies complete cryptographic isolation and rate-limiting across corporate tenants.
"""

import pytest
from src.fintech_agent.middleware.rate_limiter import TokenBucketRateLimiter
from src.fintech_agent.models.tenant_session import (
    MultiTenantDatabaseManager,
    TenantAuditCase,
)


@pytest.fixture
def multi_tenant_env():
    db = MultiTenantDatabaseManager(":memory:")
    limiter = TokenBucketRateLimiter()

    tenant_alpha = "TENANT-JPMC-001"
    tenant_beta = "TENANT-CITI-002"

    db.register_tenant(tenant_alpha, "JPMorgan Corporate Lending", tier="institution")
    db.register_tenant(tenant_beta, "Citigroup Credit Portfolio", tier="enterprise")

    # Seed 5 cases for Tenant Alpha
    for i in range(1, 6):
        db.insert_case(
            active_tenant_id=tenant_alpha,
            case=TenantAuditCase(
                case_id=f"CASE-ALPHA-{i:03d}",
                tenant_id=tenant_alpha,
                borrower_name=f"Borrower Alpha #{i}",
                reported_ebitda="$15,000,000.00",
                review_required=False,
            ),
        )

    # Seed 5 cases for Tenant Beta
    for i in range(1, 6):
        db.insert_case(
            active_tenant_id=tenant_beta,
            case=TenantAuditCase(
                case_id=f"CASE-BETA-{i:03d}",
                tenant_id=tenant_beta,
                borrower_name=f"Borrower Beta #{i}",
                reported_ebitda="$22,000,000.00",
                review_required=True,
            ),
        )

    return db, limiter, tenant_alpha, tenant_beta


def test_row_level_security_data_isolation(multi_tenant_env):
    db, _, alpha_id, beta_id = multi_tenant_env

    # 1. Query as Tenant Alpha: Must only see Alpha records
    alpha_records = db.query_cases(active_tenant_id=alpha_id)
    assert len(alpha_records) == 5
    assert all(r.tenant_id == alpha_id for r in alpha_records)
    assert not any("BETA" in r.case_id for r in alpha_records)

    # 2. Query as Tenant Beta: Must only see Beta records
    beta_records = db.query_cases(active_tenant_id=beta_id)
    assert len(beta_records) == 5
    assert all(r.tenant_id == beta_id for r in beta_records)
    assert not any("ALPHA" in r.case_id for r in beta_records)

    print(f"\n[✓] Tenant Alpha queried {len(alpha_records)} records with zero leakage of Tenant Beta data.")
    print(f"[✓] Tenant Beta queried {len(beta_records)} records with zero leakage of Tenant Alpha data.")


def test_unauthorized_cross_tenant_injection_prevented(multi_tenant_env):
    db, _, alpha_id, beta_id = multi_tenant_env

    # Tenant Alpha attempts to insert a record into Tenant Beta's ledger
    tampered_case = TenantAuditCase(
        case_id="CASE-TAMPER-999",
        tenant_id=beta_id,  # Target is Beta
        borrower_name="Malicious Injected Corp",
        reported_ebitda="$99,000,000.00",
        review_required=False,
    )

    with pytest.raises(PermissionError) as exc_info:
        db.insert_case(active_tenant_id=alpha_id, case=tampered_case)

    assert "Security Violation" in str(exc_info.value)
    print(f"[✓] Cross-tenant injection blocked by security policy: {exc_info.value}")


def test_tenant_rate_limiter_burst_enforcement():
    limiter = TokenBucketRateLimiter()
    test_tenant = "TENANT-TEST-STANDARD"

    # Standard tier allows burst of 10 requests
    allowed_count = 0
    denied_count = 0

    for _ in range(15):
        if limiter.allow_request(test_tenant, tier="standard"):
            allowed_count += 1
        else:
            denied_count += 1

    assert allowed_count == 10
    assert denied_count == 5
    print(f"[✓] Rate Limiter Quota enforced: {allowed_count} requests allowed, {denied_count} burst requests throttled.")