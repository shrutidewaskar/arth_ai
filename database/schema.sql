-- ArthAI Database Schema
-- Optimized for AI Reasoning over Indian Middle Class household balance sheets.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Core Auth Reference)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Profiles Table
CREATE TABLE IF NOT EXISTS financial_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    occupation VARCHAR(255),
    city VARCHAR(255),
    age INT,
    marital_status VARCHAR(100),
    dependents INT DEFAULT 0,
    risk_appetite VARCHAR(100) DEFAULT 'Moderate',
    currency VARCHAR(10) DEFAULT 'INR',
    monthly_income NUMERIC(15, 2) DEFAULT 0.00,
    monthly_expenses NUMERIC(15, 2) DEFAULT 0.00,
    monthly_savings NUMERIC(15, 2) DEFAULT 0.00,
    emergency_fund NUMERIC(15, 2) DEFAULT 0.00,
    credit_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Income Sources
CREATE TABLE IF NOT EXISTS income_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'Salary',
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(100) DEFAULT 'Monthly',
    active BOOLEAN DEFAULT TRUE
);

-- 4. Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    essential BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 5. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL,
    purchase_date DATE
);

-- 6. Liabilities Table
CREATE TABLE IF NOT EXISTS liabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_name VARCHAR(255) NOT NULL,
    loan_type VARCHAR(100) NOT NULL,
    principal NUMERIC(15, 2) NOT NULL,
    outstanding NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    emi NUMERIC(15, 2) NOT NULL,
    closing_date DATE
);

-- 7. Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    target_amount NUMERIC(15, 2) NOT NULL,
    saved_amount NUMERIC(15, 2) DEFAULT 0.00,
    monthly_contribution NUMERIC(15, 2) DEFAULT 0.00,
    target_date DATE,
    priority VARCHAR(100) DEFAULT 'Medium',
    status VARCHAR(100) DEFAULT 'Active'
);

-- 8. Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    investment_type VARCHAR(100) NOT NULL,
    platform VARCHAR(255),
    invested_amount NUMERIC(15, 2) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL,
    expected_return NUMERIC(5, 2),
    risk_level VARCHAR(100) DEFAULT 'Moderate'
);

-- 9. Insurance Table
CREATE TABLE IF NOT EXISTS insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    coverage NUMERIC(15, 2) NOT NULL,
    premium NUMERIC(15, 2) NOT NULL,
    renewal_date DATE,
    beneficiary VARCHAR(255),
    status VARCHAR(100) DEFAULT 'Active'
);

-- 10. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    billing_cycle VARCHAR(100) DEFAULT 'Monthly',
    renewal_date DATE,
    active BOOLEAN DEFAULT TRUE
);

-- 11. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    ocr_text TEXT,
    expiry_date DATE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. AI Memories Table
CREATE TABLE IF NOT EXISTS ai_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    memory_type VARCHAR(100) DEFAULT 'Fact',
    summary TEXT NOT NULL,
    importance_score INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE
);

-- 16. Decision Simulations Table
CREATE TABLE IF NOT EXISTS decision_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario VARCHAR(255) NOT NULL,
    inputs TEXT,
    recommendation TEXT,
    financial_impact TEXT,
    goal_impact TEXT,
    risk_score INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_simulations ENABLE ROW LEVEL SECURITY;
