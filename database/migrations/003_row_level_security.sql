-- Migration 003: Row Level Security (RLS) Tenant Isolation
-- Enforces multi-tenant isolation using transaction-local setting 'app.current_user_id'

-- ============================================================================
-- 1. USERS TABLE (Direct User Identity: users.id)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_tenant_isolation ON users;
CREATE POLICY users_tenant_isolation ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (id = current_setting('app.current_user_id', true)::uuid);

-- ============================================================================
-- 2. DIRECTLY-OWNED USER TABLES (Direct User Ownership: user_id)
-- ============================================================================

-- financial_profiles
ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS financial_profiles_tenant_isolation ON financial_profiles;
CREATE POLICY financial_profiles_tenant_isolation ON financial_profiles
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- income_sources
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS income_sources_tenant_isolation ON income_sources;
CREATE POLICY income_sources_tenant_isolation ON income_sources
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- expense_categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expense_categories_tenant_isolation ON expense_categories;
CREATE POLICY expense_categories_tenant_isolation ON expense_categories
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS assets_tenant_isolation ON assets;
CREATE POLICY assets_tenant_isolation ON assets
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- liabilities
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS liabilities_tenant_isolation ON liabilities;
CREATE POLICY liabilities_tenant_isolation ON liabilities
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS goals_tenant_isolation ON goals;
CREATE POLICY goals_tenant_isolation ON goals
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investments_tenant_isolation ON investments;
CREATE POLICY investments_tenant_isolation ON investments
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- insurance
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS insurance_tenant_isolation ON insurance;
CREATE POLICY insurance_tenant_isolation ON insurance
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_tenant_isolation ON subscriptions;
CREATE POLICY subscriptions_tenant_isolation ON subscriptions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS documents_tenant_isolation ON documents;
CREATE POLICY documents_tenant_isolation ON documents
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- document_financial_facts
ALTER TABLE document_financial_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_financial_facts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_financial_facts_tenant_isolation ON document_financial_facts;
CREATE POLICY document_financial_facts_tenant_isolation ON document_financial_facts
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_chunks_tenant_isolation ON document_chunks;
CREATE POLICY document_chunks_tenant_isolation ON document_chunks
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ai_memories
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_memories_tenant_isolation ON ai_memories;
CREATE POLICY ai_memories_tenant_isolation ON ai_memories
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_tenant_isolation ON conversations;
CREATE POLICY conversations_tenant_isolation ON conversations
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_insights_tenant_isolation ON ai_insights;
CREATE POLICY ai_insights_tenant_isolation ON ai_insights
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- decision_simulations
ALTER TABLE decision_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_simulations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS decision_simulations_tenant_isolation ON decision_simulations;
CREATE POLICY decision_simulations_tenant_isolation ON decision_simulations
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ============================================================================
-- 3. MESSAGES TABLE (Indirect Ownership: messages.conversation_id -> conversations.user_id)
-- ============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_tenant_isolation ON messages;
CREATE POLICY messages_tenant_isolation ON messages
    FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    );
