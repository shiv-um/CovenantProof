-- CovenantProof Core Production Schema
-- Immutable Evidence Lineage & Audit Store

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Cases & Document Management
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_identifier TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('curated', 'live', 'developer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    logical_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    sha256 CHAR(64) NOT NULL UNIQUE,
    object_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    page_count INTEGER NOT NULL CHECK (page_count >= 0),
    parser_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Spatial Evidence Spans
CREATE TABLE IF NOT EXISTS evidence_spans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    page INTEGER NOT NULL CHECK (page > 0),
    block_id TEXT NOT NULL,
    table_id TEXT,
    row_index INTEGER,
    column_index INTEGER,
    x0 DOUBLE PRECISION NOT NULL,
    y0 DOUBLE PRECISION NOT NULL,
    x1 DOUBLE PRECISION NOT NULL,
    y1 DOUBLE PRECISION NOT NULL,
    char_start INTEGER NOT NULL CHECK (char_start >= 0),
    char_end INTEGER NOT NULL CHECK (char_end >= char_start),
    evidence_text TEXT NOT NULL,
    ocr_confidence REAL CHECK (ocr_confidence IS NULL OR ocr_confidence BETWEEN 0 AND 1),
    parser_version TEXT NOT NULL,
    extraction_model_version TEXT,
    prompt_version TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (document_version_id, page, block_id, char_start, char_end)
);

-- 3. Field Extractions
CREATE TABLE IF NOT EXISTS extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id),
    field_type TEXT NOT NULL,
    raw_value TEXT NOT NULL,
    normalized_value TEXT,
    currency CHAR(3) DEFAULT 'USD',
    unit TEXT,
    as_of_date DATE,
    confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    model_version TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS extracted_field_evidence (
    field_id UUID NOT NULL REFERENCES extracted_fields(id) ON DELETE CASCADE,
    evidence_span_id UUID NOT NULL REFERENCES evidence_spans(id),
    PRIMARY KEY (field_id, evidence_span_id)
);

-- 4. Deterministic Calculations & Rules
CREATE TABLE IF NOT EXISTS calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    formula_version TEXT NOT NULL,
    inputs JSONB NOT NULL,
    output NUMERIC NOT NULL,
    tolerance NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calculation_evidence (
    calculation_id UUID NOT NULL REFERENCES calculations(id) ON DELETE CASCADE,
    evidence_span_id UUID NOT NULL REFERENCES evidence_spans(id),
    PRIMARY KEY (calculation_id, evidence_span_id)
);

CREATE TABLE IF NOT EXISTS rule_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    rule_id TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    passed BOOLEAN,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high')),
    message TEXT NOT NULL,
    calculation_id UUID REFERENCES calculations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Findings & Report Claims
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high')),
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    status TEXT NOT NULL,
    human_review_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finding_evidence (
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    evidence_span_id UUID NOT NULL REFERENCES evidence_spans(id),
    PRIMARY KEY (finding_id, evidence_span_id)
);

CREATE TABLE IF NOT EXISTS report_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    claim_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high')),
    claim_text TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_claim_evidence (
    claim_id UUID NOT NULL REFERENCES report_claims(id) ON DELETE CASCADE,
    evidence_span_id UUID NOT NULL REFERENCES evidence_spans(id),
    PRIMARY KEY (claim_id, evidence_span_id)
);

-- 6. Runtime Governance & Cost Ledgers
CREATE TABLE IF NOT EXISTS cost_ledger (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID NOT NULL,
    component TEXT NOT NULL,
    units NUMERIC NOT NULL,
    cost_usd NUMERIC(18, 6) NOT NULL,
    model_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_results (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID,
    suite_version TEXT NOT NULL,
    metric TEXT NOT NULL,
    value NUMERIC NOT NULL,
    passed BOOLEAN NOT NULL,
    artifact_uri TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);