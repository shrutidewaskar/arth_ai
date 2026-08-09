-- Migration 001: Document Intelligence Secure Foundation

-- 1. Add missing metadata fields to documents table safely
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'UPLOADED';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. Create document_financial_facts table
CREATE TABLE IF NOT EXISTS document_financial_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fact_type VARCHAR(100) NOT NULL,
    fact_key VARCHAR(100) NOT NULL,
    fact_value TEXT,
    confidence NUMERIC(5, 2) DEFAULT 1.00,
    source_page INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_facts_user_id ON document_financial_facts(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_facts_doc_id ON document_financial_facts(document_id);

-- 3. Create document_chunks table (NO pgvector embeddings yet)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_chunks_user_id ON document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc_id ON document_chunks(document_id);

-- 4. Enable Row Level Security
ALTER TABLE document_financial_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
