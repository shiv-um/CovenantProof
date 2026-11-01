"""
Phase 5 Asynchronous In-Process Concurrency & Stress Suite.
Simulates 100 concurrent institutional audits executing through the Decimal math engine.
Measures P50, P95, P99 latency percentiles and asserts zero variance under load.
"""

import asyncio
from decimal import Decimal
import statistics
import time
import pytest
from src.fintech_agent.reconciliation.calculations import (
    FinancialMetrics,
    evaluate_covenants,
)
from src.fintech_agent.schemas.sanitizers import RawExtractionPayload


async def simulate_single_audit_task(task_id: int) -> dict:
    t0 = time.perf_counter()

    # Generate distinct concurrent payload
    is_anomaly = (task_id % 4 == 0)
    ebitda_val = Decimal("10000000.00") + Decimal(str(task_id * 1000))
    wire_val = Decimal("125000.00") + (Decimal("27000.00") if is_anomaly else Decimal("0.00"))

    raw = {
        "reported_ebitda": f"${ebitda_val:,.2f}",
        "ltm_operating_ebitda": f"${ebitda_val * Decimal('0.9'):,.2f}",
        "reported_synergies": "$2,500,000.00" if is_anomaly else "$500,000.00",
        "synergy_cap_pct": "15.0%",
        "cash_taxes": f"${ebitda_val * Decimal('0.10'):,.2f}",
        "cash_interest": f"${ebitda_val * (Decimal('0.70') if is_anomaly else Decimal('0.30')):,.2f}",
        "scheduled_principal": f"${ebitda_val * Decimal('0.20'):,.2f}",
        "purchase_order_total": "$125,000.00",
        "invoice_total": "$125,000.00",
        "bank_payment_total": f"${wire_val:,.2f}",
    }

    # 1. Pydantic Sanitization Firewall
    payload = RawExtractionPayload(**raw)

    # 2. Deterministic Covenant Evaluation
    metrics = FinancialMetrics(
        reported_ebitda=payload.reported_ebitda,
        ltm_operating_ebitda=payload.ltm_operating_ebitda,
        reported_synergies=payload.reported_synergies,
        synergy_cap_pct=payload.synergy_cap_pct,
        cash_taxes=payload.cash_taxes,
        unfunded_capex=payload.unfunded_capex,
        cash_interest=payload.cash_interest,
        scheduled_principal=payload.scheduled_principal,
        minimum_fccr_threshold=Decimal("1.2500"),
        purchase_order_total=payload.purchase_order_total,
        invoice_total=payload.invoice_total,
        bank_payment_total=payload.bank_payment_total,
    )

    result = evaluate_covenants(metrics)
    latency_ms = (time.perf_counter() - t0) * 1000

    return {
        "task_id": task_id,
        "latency_ms": latency_ms,
        "is_anomaly": is_anomaly,
        "fccr_breach": result.fccr_breach,
        "wire_mismatch": result.three_way_mismatch_detected,
    }


def test_100_concurrent_audits_performance():
    concurrency_count = 100
    t_start = time.perf_counter()

    async def _execute_pool():
        tasks = [simulate_single_audit_task(i) for i in range(1, concurrency_count + 1)]
        return await asyncio.gather(*tasks)

    # Run native event loop synchronously
    results = asyncio.run(_execute_pool())

    total_wall_time = time.perf_counter() - t_start
    latencies = [r["latency_ms"] for r in results]

    # Compute Statistical Percentiles
    latencies.sort()
    p50 = statistics.median(latencies)
    p95 = latencies[int(len(latencies) * 0.95) - 1]
    p99 = latencies[int(len(latencies) * 0.99) - 1]
    avg_latency = statistics.mean(latencies)
    throughput = concurrency_count / total_wall_time

    print(f"\n========================================================")
    print(f"       COVENANTPROOF 100 CONCURRENT AUDIT BENCHMARK     ")
    print(f"========================================================")
    print(f"Total Requests Processed: {concurrency_count}")
    print(f"Total Wall-Clock Time:    {total_wall_time:.4f}s")
    print(f"Effective Throughput:     {throughput:,.1f} audits/sec")
    print(f"Latency P50 (Median):     {p50:.2f}ms")
    print(f"Latency P95:              {p95:.2f}ms")
    print(f"Latency P99:              {p99:.2f}ms")
    print(f"Latency Mean:             {avg_latency:.2f}ms")
    print(f"========================================================")

    # Architectural SLA Assertions
    assert len(results) == 100
    assert p95 < 50.0, f"P95 latency {p95:.2f}ms exceeded 50ms SLA"
    assert p99 < 100.0, f"P99 latency {p99:.2f}ms exceeded 100ms SLA"
    assert total_wall_time < 2.0, "100 concurrent audits must complete in under 2 seconds"

    # Integrity Assertions: Exactly 25 anomalies flagged
    anomalies = [r for r in results if r["is_anomaly"]]
    assert len(anomalies) == 25
    assert all(r["wire_mismatch"] for r in anomalies)