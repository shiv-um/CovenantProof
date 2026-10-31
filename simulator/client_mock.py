"""
Core Banking Simulator & Ingestion CLI.
Simulates enterprise loan systems streaming compliance packages to CovenantProof.
"""

import argparse
import json
import random
import sys
import time
import requests


def generate_synthetic_payload(tamper_wire: bool = False, exceed_synergy: bool = False) -> dict:
    base_ebitda = round(random.uniform(5_000_000, 20_000_000), 2)
    po_total = 125_000.00
    invoice_total = po_total

    # Anomaly 1: SWIFT wire discrepancy (e.g. unapproved fee waiver or digit transposition)
    swift_wire = invoice_total + 27_000.00 if tamper_wire else invoice_total

    # Anomaly 2: Section 8.4(b) Synergy Cap breach (allowable cap is 15% of EBITDA)
    allowable_synergy = base_ebitda * 0.15
    synergies = allowable_synergy + round(random.uniform(500_000, 1_500_000),
                                          2) if exceed_synergy else allowable_synergy * 0.7

    # Debt service parameters
    interest_expense = round(base_ebitda * (0.65 if exceed_synergy else 0.35), 2)
    principal = round(base_ebitda * 0.20, 2)

    return {
        "case_id": f"CASE-SIM-{random.randint(1000, 9999)}",
        "company_name": "Apex Logistics Holdings Inc.",
        "purchase_order": {
            "document_type": "purchase_order",
            "total_amount": f"${po_total:,.2f}",
        },
        "invoice": {
            "document_type": "invoice",
            "total_amount": f"${invoice_total:,.2f}",
        },
        "bank_payment": {
            "document_type": "bank_payment",
            "total_amount": f"${swift_wire:,.2f}",
        },
        "covenant_certificate": {
            "document_type": "covenant_certificate",
            "ebitda": f"${base_ebitda:,.2f}",
            "reported_synergies": f"${synergies:,.2f}",
            "synergy_cap_pct": "15.0%",
            "cash_taxes": f"${round(base_ebitda * 0.10, 2):,.2f}",
            "interest_expense": f"${interest_expense:,.2f}",
            "current_maturities": f"${principal:,.2f}",
        },
    }


def main():
    parser = argparse.ArgumentParser(description="CovenantProof Core Banking Simulator")
    parser.add_argument("--count", type=int, default=5, help="Number of loan packages to audit")
    parser.add_argument("--target-url", type=str, default="http://localhost:8000/api/v1/audits", help="Audit API URL")
    parser.add_argument("--tamper-wire-rate", type=float, default=0.2,
                        help="Probability of wire tampering (0.0 to 1.0)")
    parser.add_argument("--exceed-synergy-rate", type=float, default=0.3, help="Probability of synergy cap violation")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print generated JSON payloads without executing HTTP requests")

    args = parser.parse_args()
    print(f"[*] Initializing simulator: {args.count} packages scheduled.")

    successful, failed = 0, 0

    for i in range(1, args.count + 1):
        should_tamper = random.random() < args.tamper_wire_rate
        should_exceed = random.random() < args.exceed_synergy_rate
        payload = generate_synthetic_payload(tamper_wire=should_tamper, exceed_synergy=should_exceed)

        if args.dry_run:
            print(f"\n--- Synthetic Payload {i}/{args.count} [{payload['case_id']}] ---")
            print(json.dumps(payload, indent=2))
            continue

        try:
            t0 = time.time()
            resp = requests.post(args.target_url, json=payload, timeout=10)
            latency = (time.time() - t0) * 1000

            if resp.status_code == 200:
                successful += 1
                body = resp.json()
                print(
                    f"[{i}/{args.count}] {payload['case_id']} OK ({latency:.1f}ms) "
                    f"-> Review Required: {body.get('review_required')} | Findings: {body.get('findings_count')}"
                )
            else:
                failed += 1
                print(f"[{i}/{args.count}] {payload['case_id']} HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            failed += 1
            print(f"[{i}/{args.count}] Connection failed to {args.target_url}: {str(e)}")

    if not args.dry_run:
        print(f"\nSimulation Complete: {successful} passed, {failed} failed.")


if __name__ == "__main__":
    main()