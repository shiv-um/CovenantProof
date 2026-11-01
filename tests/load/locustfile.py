"""
Phase 5 Distributed Load Testing Suite (Locust).
Simulates concurrent credit risk officers and automated loan origination streams.
"""

from locust import HttpUser, task, between
import random


class CreditAuditorUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(3)
    def health_check(self):
        self.client.get("/health")

    @task(5)
    def submit_clean_loan_package(self):
        base_ebitda = round(random.uniform(5_000_000, 20_000_000), 2)
        payload = {
            "case_id": f"LOAD-CLEAN-{random.randint(10000, 99999)}",
            "company_name": "Standard Logistics Corp",
            "purchase_order": {"document_type": "purchase_order", "total_amount": "125000.00"},
            "invoice": {"document_type": "invoice", "total_amount": "125000.00"},
            "bank_payment": {"document_type": "bank_payment", "total_amount": "125000.00"},
            "covenant_certificate": {
                "document_type": "covenant_certificate",
                "ebitda": f"{base_ebitda:.2f}",
                "cash_taxes": f"{base_ebitda * 0.10:.2f}",
                "interest_expense": f"{base_ebitda * 0.30:.2f}",
                "current_maturities": f"{base_ebitda * 0.20:.2f}",
            },
        }
        self.client.post("/api/v1/audits", json=payload)

    @task(2)
    def submit_anomaly_package(self):
        base_ebitda = round(random.uniform(5_000_000, 15_000_000), 2)
        payload = {
            "case_id": f"LOAD-ANOMALY-{random.randint(10000, 99999)}",
            "company_name": "Distressed Apex Holdings",
            "purchase_order": {"document_type": "purchase_order", "total_amount": "125000.00"},
            "invoice": {"document_type": "invoice", "total_amount": "125000.00"},
            "bank_payment": {"document_type": "bank_payment", "total_amount": "152000.00"},  # Wire discrepancy
            "covenant_certificate": {
                "document_type": "covenant_certificate",
                "ebitda": f"{base_ebitda:.2f}",
                "cash_taxes": f"{base_ebitda * 0.12:.2f}",
                "interest_expense": f"{base_ebitda * 0.70:.2f}",  # Breaches FCCR
                "current_maturities": f"{base_ebitda * 0.30:.2f}",
            },
        }
        self.client.post("/api/v1/audits", json=payload)