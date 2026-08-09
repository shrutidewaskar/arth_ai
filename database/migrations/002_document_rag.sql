-- Migration 002: pgvector RAG Extension

-- 1. Enable pgvector extension if available
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to document_chunks
-- Handles sqlite/pg fallback by permitting text representation or vector type
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding TEXT;
