-- CovenantProof Multi-Tenant Migration
-- PostgreSQL Kernel-Level Row-Level Security (RLS)

-- 1. Create Tenant Registry Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name TEXT NOT NULL UNIQUE,
    api_key_hash TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL CHECK (tier IN ('standard', 'enterprise', 'institution')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add tenant_id to Core Entities
ALTER TABLE cases ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE findings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 3. Enable Row-Level Security on Core Tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- 4. Enforce Strict Kernel Isolation Policies
DROP POLICY IF EXISTS tenant_case_isolation ON cases;
CREATE POLICY tenant_case_isolation ON cases
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

DROP POLICY IF EXISTS tenant_doc_isolation ON documents;
CREATE POLICY tenant_doc_isolation ON documents
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

DROP POLICY IF EXISTS tenant_finding_isolation ON findings;
CREATE POLICY tenant_finding_isolation ON findings
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);