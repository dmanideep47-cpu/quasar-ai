# CodeLab RAG Vector Storage Layer (STEP 5)

This directory contains the vector storage infrastructure for the CodeLab RAG system.

## Files

- **schema.sql** - PostgreSQL schema with pgvector extension for vector storage
- **ingest_vectors.py** - Python script to ingest embeddings into the database

## Database Setup

### Prerequisites

1. PostgreSQL 12+ installed
2. pgvector extension available

### Environment Variables

Set these environment variables before running the ingestion script:

```bash
DB_HOST=localhost           # PostgreSQL host
DB_PORT=5432               # PostgreSQL port
DB_USER=postgres           # PostgreSQL user
DB_PASSWORD=               # PostgreSQL password (optional)
DB_NAME=quasor             # Database name
```

### Creating the Database

```bash
# Create database (if not exists)
createdb quasor

# Enable pgvector extension
psql -d quasor -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Apply schema
psql -d quasor -f backend/rag/vectors/schema.sql
```

### Running the Ingestion

```bash
# Install dependencies
pip install psycopg2-binary

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_NAME=quasor

# Run ingestion script
python backend/rag/vectors/ingest_vectors.py
```

## Database Schema

### codelab_knowledge_chunks

Main table storing all CodeLab knowledge chunks with embeddings.

**Columns:**
- `id` (BIGSERIAL) - Primary key
- `chunk_id` (VARCHAR 255, UNIQUE) - Unique identifier from ingestion pipeline
- `text` (TEXT) - Chunk content
- `language` (VARCHAR 50) - Programming language (e.g., python)
- `category` (VARCHAR 100) - Knowledge category (e.g., fundamentals)
- `topic` (VARCHAR 100) - Specific topic (e.g., variables-and-data-types)
- `difficulty` (VARCHAR 50) - Difficulty level (beginner, intermediate, advanced)
- `source` (VARCHAR 500) - Original source file path
- `embedding` (vector(768)) - Vector embedding (768 dimensions for Gemini embedding-001)
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

### Indexes

- `idx_codelab_language` - Fast filtering by language
- `idx_codelab_category` - Fast filtering by category
- `idx_codelab_topic` - Fast filtering by topic
- `idx_codelab_difficulty` - Fast filtering by difficulty
- `idx_codelab_source` - Fast filtering by source
- `idx_codelab_lang_cat_topic` - Composite index for common filters
- `idx_codelab_embedding` - IVFFlat index for vector similarity search

### Views

**codelab_chunks_summary** - Summary statistics by language/category/topic/difficulty

```sql
SELECT * FROM codelab_chunks_summary;
```

## Metadata Filtering

Query chunks by various metadata fields:

```sql
-- All Python debugging chunks
SELECT * FROM codelab_knowledge_chunks 
WHERE language = 'python' AND category = 'debugging';

-- Beginner fundamentals
SELECT * FROM codelab_knowledge_chunks 
WHERE language = 'python' AND category = 'fundamentals' AND difficulty = 'beginner';

-- Specific topic chunks
SELECT * FROM codelab_knowledge_chunks 
WHERE topic = 'variables-and-data-types';
```

## Vector Similarity Search

Once the RAG system is complete, perform semantic search:

```sql
-- Find most relevant chunks for a query embedding
SELECT 
    chunk_id, 
    text, 
    topic,
    (embedding <-> query_vector) as distance
FROM codelab_knowledge_chunks
WHERE language = 'python' AND category = 'fundamentals'
ORDER BY embedding <-> query_vector
LIMIT 5;
```

## Validation

Check ingestion status:

```sql
-- Total chunks by category
SELECT category, COUNT(*) FROM codelab_knowledge_chunks GROUP BY category;

-- Chunks with embeddings
SELECT COUNT(*) FROM codelab_knowledge_chunks WHERE embedding IS NOT NULL;

-- Embedding dimensions
SELECT dimension(embedding) FROM codelab_knowledge_chunks LIMIT 1;
```

## Troubleshooting

**pgvector not found:**
```bash
# Install pgvector on Ubuntu/Debian
sudo apt-get install postgresql-12-pgvector

# Or build from source
cd /tmp
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

**Connection refused:**
- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT settings
- Verify credentials

**Vector dimension mismatch:**
- Check embedding model in generate_embeddings.py
- Default is 768 for models/embedding-001
- Update schema.sql if different

## Next Steps

After vector ingestion:
1. Build RAG retrieval API (STEP 6)
2. Implement similarity search endpoints
3. Integrate with Cygnus mentor system (STEP 7)
4. Create RAG query endpoints (STEP 8)
