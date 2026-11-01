"""
Multi-Tenant Session & Security Enforcement Manager.
Simulates PostgreSQL Row-Level Security (RLS) session variable boundaries.
"""

from dataclasses import dataclass
import sqlite3
import time
from typing import Dict, List, Optional
import uuid


@dataclass
class TenantAuditCase:
    case_id: str
    tenant_id: str
    borrower_name: str
    reported_ebitda: str
    review_required: bool


class MultiTenantDatabaseManager:
    """
    Manages tenant session boundaries. Guarantees cross-tenant query isolation
    by dynamically applying tenant session filters to all active database connections.
    """

    def __init__(self, db_path: str = ":memory:"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self):
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS tenants (
                    tenant_id TEXT PRIMARY KEY,
                    tenant_name TEXT NOT NULL,
                    tier TEXT NOT NULL
                );
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS tenant_cases (
                    case_id TEXT PRIMARY KEY,
                    tenant_id TEXT NOT NULL,
                    borrower_name TEXT NOT NULL,
                    reported_ebitda TEXT NOT NULL,
                    review_required INTEGER NOT NULL,
                    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
                );
            """)
            self.conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_tenant_case_isolation 
                ON tenant_cases (tenant_id, case_id);
            """)

    def register_tenant(self, tenant_id: str, name: str, tier: str = "enterprise"):
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO tenants (tenant_id, tenant_name, tier) VALUES (?, ?, ?)",
                (tenant_id, name, tier),
            )

    def insert_case(self, active_tenant_id: str, case: TenantAuditCase):
        """Enforces that a tenant can only insert records under its own tenant_id."""
        if case.tenant_id != active_tenant_id:
            raise PermissionError(
                f"Security Violation: Tenant '{active_tenant_id}' cannot create records for '{case.tenant_id}'."
            )
        with self.conn:
            self.conn.execute(
                """
                INSERT OR REPLACE INTO tenant_cases 
                (case_id, tenant_id, borrower_name, reported_ebitda, review_required)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    case.case_id,
                    case.tenant_id,
                    case.borrower_name,
                    case.reported_ebitda,
                    1 if case.review_required else 0,
                ),
            )

    def query_cases(self, active_tenant_id: str) -> List[TenantAuditCase]:
        """
        Emulates PostgreSQL RLS: Queries are strictly bound to the active session tenant.
        """
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT case_id, tenant_id, borrower_name, reported_ebitda, review_required
            FROM tenant_cases
            WHERE tenant_id = ?
            ORDER BY case_id ASC
            """,
            (active_tenant_id,),
        )
        rows = cursor.fetchall()
        return [
            TenantAuditCase(
                case_id=r["case_id"],
                tenant_id=r["tenant_id"],
                borrower_name=r["borrower_name"],
                reported_ebitda=r["reported_ebitda"],
                review_required=bool(r["review_required"]),
            )
            for r in rows
        ]