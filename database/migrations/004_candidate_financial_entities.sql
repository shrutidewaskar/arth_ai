-- Migration 004: Candidate Financial Entities & Human-in-the-Loop Ingestion Staging
-- Enables staging of parsed, normalized financial facts prior to user review and canonical state promotion.

-- 1. Create candidate_financial_entities table
CREATE TABLE IF NOT EXISTS candidate_financial_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    candidate_type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE, LIABILITY, ASSET, INVESTMENT, SUBSCRIPTION, TRANSACTION
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED, EDITED
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    suggested_data JSONB NOT NULL,
    provenance JSONB NOT NULL,
    canonical_entity_id UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_entities_user_id ON candidate_financial_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_entities_doc_id ON candidate_financial_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_candidate_entities_status ON candidate_financial_entities(status);
CREATE INDEX IF NOT EXISTS idx_candidate_entities_type ON candidate_financial_entities(candidate_type);

-- 2. Enable and Force Row Level Security (RLS)
ALTER TABLE candidate_financial_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_financial_entities FORCE ROW LEVEL SECURITY;

-- 3. Tenant Isolation Policy using app.current_user_id
DROP POLICY IF EXISTS candidate_financial_entities_tenant_isolation ON candidate_financial_entities;
CREATE POLICY candidate_financial_entities_tenant_isolation ON candidate_financial_entities
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);
