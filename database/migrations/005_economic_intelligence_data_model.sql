-- ============================================================================
-- Migration 005: Economic Intelligence & Reference Data Model
-- Purpose: Durable, versioned, provenance-aware macroeconomic and tax reference
-- tables for inflation, GDP, interest rates, cost indices, and statutory tax rules.
-- Public reference data: Unrestricted SELECT for authenticated/public read,
-- restricted mutation/write policies to prevent unauthorized tenant tampering.
-- ============================================================================

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. EXTERNAL SOURCES REGISTRY (external_sources)
-- ============================================================================

CREATE TABLE IF NOT EXISTS external_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    organization VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- OFFICIAL_GOVERNMENT, REGULATOR, INTERNATIONAL_ORGANIZATION, etc.
    url VARCHAR(1024),
    country VARCHAR(10) NOT NULL DEFAULT 'IND',
    reliability_tier VARCHAR(50) NOT NULL, -- TIER_1_OFFICIAL, TIER_2_INSTITUTIONAL, TIER_3_SECONDARY, TIER_4_UNVERIFIED
    metadata_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_external_sources_name ON external_sources(name);
CREATE INDEX IF NOT EXISTS idx_external_sources_org ON external_sources(organization);
CREATE INDEX IF NOT EXISTS idx_external_sources_type ON external_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_external_sources_tier ON external_sources(reliability_tier);


-- ============================================================================
-- 2. GENERIC ECONOMIC OBSERVATIONS (economic_observations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS economic_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES external_sources(id) ON DELETE RESTRICT,
    indicator VARCHAR(100) NOT NULL,
    value NUMERIC(18, 6) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    geography VARCHAR(100) NOT NULL DEFAULT 'IN',
    frequency VARCHAR(50) NOT NULL, -- MONTHLY, QUARTERLY, ANNUAL, DAILY
    observation_period VARCHAR(50) NOT NULL, -- e.g. '2025-01', '2024-Q3'
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'FINAL', -- PROVISIONAL, FINAL, REVISED, ESTIMATE
    revision_number INT NOT NULL DEFAULT 0,
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_to TIMESTAMP WITH TIME ZONE,
    methodology TEXT,
    source_reference VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_econ_obs_indicator ON economic_observations(indicator);
CREATE INDEX IF NOT EXISTS idx_econ_obs_lookup ON economic_observations(indicator, geography, observation_period);
CREATE INDEX IF NOT EXISTS idx_econ_obs_source ON economic_observations(source_id);
CREATE INDEX IF NOT EXISTS idx_econ_obs_dates ON economic_observations(published_at, effective_from);


-- ============================================================================
-- 3. INFLATION OBSERVATIONS (inflation_observations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inflation_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES external_sources(id) ON DELETE RESTRICT,
    category VARCHAR(100) NOT NULL, -- GENERAL, FOOD, HOUSING, HEALTHCARE, EDUCATION, etc.
    subcategory VARCHAR(150),
    inflation_rate NUMERIC(8, 4) NOT NULL, -- YoY % change
    index_value NUMERIC(12, 4), -- Absolute CPI index points
    base_year VARCHAR(20) DEFAULT '2012=100',
    basket_version VARCHAR(50),
    geography VARCHAR(100) NOT NULL DEFAULT 'IN',
    sector VARCHAR(50) NOT NULL DEFAULT 'COMBINED', -- COMBINED, RURAL, URBAN
    period VARCHAR(50) NOT NULL, -- e.g. '2025-01'
    is_provisional BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_to TIMESTAMP WITH TIME ZONE,
    data_quality VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL_FINAL',
    source_reference VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inflation_cat_period ON inflation_observations(category, geography, sector, period);
CREATE INDEX IF NOT EXISTS idx_inflation_source ON inflation_observations(source_id);
CREATE INDEX IF NOT EXISTS idx_inflation_pub_date ON inflation_observations(published_at);


-- ============================================================================
-- 4. COST INDEX OBSERVATIONS (cost_index_observations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cost_index_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES external_sources(id) ON DELETE RESTRICT,
    category VARCHAR(100) NOT NULL, -- EDUCATION, HEALTHCARE, HOUSING_RENT, VEHICLES, etc.
    item VARCHAR(255) NOT NULL,
    geography VARCHAR(100) NOT NULL DEFAULT 'IN',
    value NUMERIC(18, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL DEFAULT 'ANNUAL',
    methodology TEXT,
    data_quality VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_reference VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cost_index_item ON cost_index_observations(category, item, geography, period);
CREATE INDEX IF NOT EXISTS idx_cost_index_source ON cost_index_observations(source_id);


-- ============================================================================
-- 5. GDP OBSERVATIONS (gdp_observations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gdp_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES external_sources(id) ON DELETE RESTRICT,
    metric VARCHAR(100) NOT NULL, -- REAL_GDP_GROWTH, NOMINAL_GDP_GROWTH, GDP, GVA, PFCE, etc.
    value NUMERIC(18, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    real_or_nominal VARCHAR(20) NOT NULL DEFAULT 'REAL', -- REAL, NOMINAL
    seasonally_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
    geography VARCHAR(100) NOT NULL DEFAULT 'IN',
    period VARCHAR(50) NOT NULL, -- e.g. '2024-Q3', 'FY2024-25'
    frequency VARCHAR(50) NOT NULL DEFAULT 'QUARTERLY',
    estimate_stage VARCHAR(50) NOT NULL DEFAULT 'FIRST_ADVANCE_ESTIMATE',
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revision_number INT NOT NULL DEFAULT 0,
    data_quality VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
    source_reference VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gdp_obs_metric_lookup ON gdp_observations(metric, real_or_nominal, period, geography);
CREATE INDEX IF NOT EXISTS idx_gdp_obs_source ON gdp_observations(source_id);


-- ============================================================================
-- 6. INTEREST RATE OBSERVATIONS (interest_rate_observations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interest_rate_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES external_sources(id) ON DELETE RESTRICT,
    rate_type VARCHAR(100) NOT NULL, -- RBI_REPO, RBI_SDF, GOI_10Y_BOND_YIELD, PPF_RATE, etc.
    rate NUMERIC(8, 4) NOT NULL, -- Annualized percentage rate
    unit VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE_PER_ANNUM',
    institution VARCHAR(255) NOT NULL DEFAULT 'Reserve Bank of India',
    instrument VARCHAR(255),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    announcement_date TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_reference VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interest_rate_type_dates ON interest_rate_observations(rate_type, effective_from);
CREATE INDEX IF NOT EXISTS idx_interest_rate_source ON interest_rate_observations(source_id);


-- ============================================================================
-- 7. VERSIONED TAX RULES (tax_rule_versions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_rule_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_year VARCHAR(20) NOT NULL, -- e.g. 'FY 2024-25', 'FY 2025-26'
    assessment_year VARCHAR(20) NOT NULL, -- e.g. 'AY 2025-26', 'AY 2026-27'
    regime VARCHAR(50) NOT NULL, -- NEW, OLD, UNIVERSAL
    section VARCHAR(100) NOT NULL, -- '115BAC', '80C', 'STANDARD_DEDUCTION', etc.
    subsection VARCHAR(100),
    rule_type VARCHAR(100) NOT NULL, -- TAX_SLABS, DEDUCTION_LIMIT, TAX_REBATE, etc.
    parameter VARCHAR(100) NOT NULL, -- SLAB_RATES, MAX_LIMIT, REBATE_CAP, etc.
    value JSONB NOT NULL, -- Structured slab schedules, limits, or parameters
    unit VARCHAR(50) NOT NULL, -- INR, PERCENTAGE, SLAB_SCHEDULE
    conditions JSONB,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    source_id UUID NOT NULL REFERENCES external_sources(id) ON DELETE RESTRICT,
    source_reference VARCHAR(512),
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUPERSEDED, DRAFT, REPEALED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_rules_lookup ON tax_rule_versions(tax_year, regime, section, parameter, status);
CREATE INDEX IF NOT EXISTS idx_tax_rules_ay ON tax_rule_versions(assessment_year, regime);
CREATE INDEX IF NOT EXISTS idx_tax_rules_source ON tax_rule_versions(source_id);


-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES FOR PUBLIC REFERENCE DATA
-- ============================================================================
-- Economic intelligence & tax rules represent global public reference data.
-- 1. Read access is permitted for all sessions (SELECT USING (true)).
-- 2. Mutation (INSERT / UPDATE / DELETE) is restricted to internal trusted roles
--    and database administrator/service role. No public write policy is defined.
-- ============================================================================

-- external_sources
ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_sources FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS external_sources_public_read ON external_sources;
CREATE POLICY external_sources_public_read ON external_sources
    FOR SELECT
    USING (true);

-- economic_observations
ALTER TABLE economic_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_observations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS economic_observations_public_read ON economic_observations;
CREATE POLICY economic_observations_public_read ON economic_observations
    FOR SELECT
    USING (true);

-- inflation_observations
ALTER TABLE inflation_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inflation_observations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inflation_observations_public_read ON inflation_observations;
CREATE POLICY inflation_observations_public_read ON inflation_observations
    FOR SELECT
    USING (true);

-- cost_index_observations
ALTER TABLE cost_index_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_index_observations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cost_index_observations_public_read ON cost_index_observations;
CREATE POLICY cost_index_observations_public_read ON cost_index_observations
    FOR SELECT
    USING (true);

-- gdp_observations
ALTER TABLE gdp_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdp_observations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gdp_observations_public_read ON gdp_observations;
CREATE POLICY gdp_observations_public_read ON gdp_observations
    FOR SELECT
    USING (true);

-- interest_rate_observations
ALTER TABLE interest_rate_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_rate_observations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS interest_rate_observations_public_read ON interest_rate_observations;
CREATE POLICY interest_rate_observations_public_read ON interest_rate_observations
    FOR SELECT
    USING (true);

-- tax_rule_versions
ALTER TABLE tax_rule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rule_versions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tax_rule_versions_public_read ON tax_rule_versions;
CREATE POLICY tax_rule_versions_public_read ON tax_rule_versions
    FOR SELECT
    USING (true);
