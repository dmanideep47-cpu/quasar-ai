-- CodeLab RAG Vector Storage Schema
-- PostgreSQL with pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CodeLab knowledge chunks table with embeddings
CREATE TABLE IF NOT EXISTS codelab_knowledge_chunks (
    id BIGSERIAL PRIMARY KEY,
    chunk_id VARCHAR(255) UNIQUE NOT NULL,
    text TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    source VARCHAR(500) NOT NULL,
    embedding vector(768),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient metadata filtering
CREATE INDEX IF NOT EXISTS idx_codelab_language ON codelab_knowledge_chunks(language);
CREATE INDEX IF NOT EXISTS idx_codelab_category ON codelab_knowledge_chunks(category);
CREATE INDEX IF NOT EXISTS idx_codelab_topic ON codelab_knowledge_chunks(topic);
CREATE INDEX IF NOT EXISTS idx_codelab_difficulty ON codelab_knowledge_chunks(difficulty);
CREATE INDEX IF NOT EXISTS idx_codelab_source ON codelab_knowledge_chunks(source);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_codelab_lang_cat_topic 
    ON codelab_knowledge_chunks(language, category, topic);

-- Index for semantic search (vector similarity)
-- Uses IVFFlat or HNSW depending on pgvector version
CREATE INDEX IF NOT EXISTS idx_codelab_embedding 
    ON codelab_knowledge_chunks 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- View for debugging and monitoring
CREATE OR REPLACE VIEW codelab_chunks_summary AS
SELECT 
    language,
    category,
    topic,
    difficulty,
    COUNT(*) as chunk_count,
    COUNT(embedding) as embedded_count,
    ROUND(AVG(LENGTH(text))::numeric, 2) as avg_text_length
FROM codelab_knowledge_chunks
GROUP BY language, category, topic, difficulty
ORDER BY language, category, topic, difficulty;
