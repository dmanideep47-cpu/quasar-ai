# CodeLab RAG Retrieval Service (STEP 6)

This directory contains the RAG retrieval/search layer for the CodeLab system.

## Overview

The retrieval service performs semantic search on embedded Python knowledge stored in PostgreSQL + pgvector, returning ranked results based on query similarity and optional metadata filters.

## Architecture

```
User Query
    ↓
API Endpoint (/api/rag/search)
    ↓
CLI Interface (retrieval_cli.py)
    ↓
Retrieval Service (retrieval_service.py)
    ├─ Generate Query Embedding (Gemini API)
    ├─ Build Vector Similarity Search Query
    └─ Execute on PostgreSQL + pgvector
    ↓
Ranked Results (JSON)
```

## Files

### Core
- **retrieval_service.py** (10 KB)
  - Main RAG retrieval service class
  - Vector similarity search implementation
  - Metadata filtering logic
  - Error handling and logging

- **retrieval_cli.py** (2.8 KB)
  - CLI interface for retrieval service
  - Reads parameters from stdin
  - Outputs JSON results to stdout
  - Called by Node.js API endpoint

### API
- **../../../app/api/rag/search/route.ts** (4.8 KB)
  - Next.js API endpoint for RAG search
  - Spawns Python subprocess
  - Handles JSON serialization
  - Error handling and timeouts

### Testing
- **test_retrieval.py** (9.4 KB)
  - Comprehensive test suite
  - 7 test cases covering various scenarios
  - Tests filters, thresholds, and edge cases
  - Requires live database connection

- **README.md** (This file)
  - Documentation and usage guide

## Configuration

### Environment Variables

```bash
# Gemini API
GEMINI_API_KEY=<your-gemini-api-key>

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<optional>
DB_NAME=quasor
```

### Search Parameters

```json
{
  "query": "user's question (required)",
  "language": "python",              // optional (e.g., python, javascript, sql)
  "category": "data-structures",     // optional (e.g., fundamentals, algorithms, debugging)
  "topic": "lists",                  // optional (e.g., lists, dictionaries, functions)
  "difficulty": "beginner",          // optional (e.g., beginner, intermediate, advanced)
  "limit": 5,                        // optional, default: 5 (max: 20)
  "threshold": 0.5                   // optional, default: 0.5 (similarity threshold)
}
```

## Usage

### Via API Endpoint

```bash
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I access items in a list?",
    "language": "python",
    "limit": 5
  }'
```

### Via Python CLI

```bash
export GEMINI_API_KEY=<your-key>
export DB_HOST=localhost
export DB_USER=postgres
export DB_NAME=quasor

echo '{"query": "How do I access items in a list?", "language": "python"}' | \
  python backend/rag/retrieval/retrieval_cli.py
```

### Programmatic Usage

```python
from retrieval_service import RAGRetrievalService, SearchFilter

# Initialize service
service = RAGRetrievalService(api_key, connection_string)

# Connect
if not service.connect():
    exit(1)

try:
    # Search with filters
    filters = SearchFilter(language='python', category='data-structures', limit=5)
    result = service.search("How do I access items in a list?", filters)
    
    # Use results
    for r in result['results']:
        print(f"{r['metadata']['topic']}: {r['text'][:100]}... (score: {r['score']:.4f})")

finally:
    service.close()
```

## Response Format

```json
{
  "query": "How do I access items in a list?",
  "filters": {
    "language": "python",
    "category": "data-structures",
    "topic": null,
    "difficulty": null
  },
  "results": [
    {
      "chunk_id": "sha256:...",
      "text": "# Accessing List Items...",
      "score": 0.2147,
      "metadata": {
        "language": "python",
        "category": "data-structures",
        "topic": "lists",
        "difficulty": "beginner",
        "source": "codelab-knowledge/python/data-structures/lists.md"
      }
    },
    ...
  ],
  "count": 3
}
```

## Key Features

### 1. Vector Similarity Search
- Uses pgvector's cosine distance metric
- Queries embeddings using `<->` operator
- Results ordered by distance (ascending)

### 2. Metadata Filtering
- Optional filters: language, category, topic, difficulty
- Parameterized SQL queries (prevents SQL injection)
- Filters reduce search space for better performance

### 3. Similarity Threshold
- Configurable similarity threshold (default: 0.5)
- Prevents completely unrelated results
- For cosine distance: lower values = higher similarity

### 4. Top-K Results
- Configurable result limit (default: 5, max: 20)
- Results ranked by relevance
- Each result includes similarity score

### 5. Embedding Model
- Uses Gemini embedding-001 (same as STEP 4)
- 768-dimensional embeddings
- Task type: RETRIEVAL_QUERY (for queries)

### 6. Error Handling
- Empty query validation
- Embedding generation failures
- Database connection failures
- No relevant results handling
- Query timeout protection (30s)

### 7. Security
- Parameterized database queries
- No hardcoded credentials (env vars)
- No logging of sensitive data
- Secure subprocess handling

## Database Query

### Similarity Search Query

```sql
SELECT 
    chunk_id,
    text,
    language,
    category,
    topic,
    difficulty,
    source,
    embedding <-> %s::vector as distance
FROM codelab_knowledge_chunks
WHERE language = %s
  AND category = %s
  AND embedding <-> %s::vector < %s
ORDER BY distance ASC
LIMIT %s
```

### Metrics

- **Model:** models/embedding-001 (Gemini)
- **Dimension:** 768
- **Similarity Metric:** Cosine Distance
- **Task Type:** RETRIEVAL_QUERY / RETRIEVAL_DOCUMENT
- **Threshold:** 0.5 (configurable)
- **Default Top-K:** 5
- **Max Top-K:** 20

## Testing

### Run Full Test Suite

```bash
export GEMINI_API_KEY=<your-key>
export DB_HOST=localhost
export DB_USER=postgres
export DB_NAME=quasor

python backend/rag/retrieval/test_retrieval.py
```

### Test Cases

1. **Empty Query** - Should reject with error
2. **List Access** - Python list knowledge should rank high
3. **IndexError** - Python debugging knowledge should rank high
4. **Language Filter** - SQL queries should be filtered out with language=python
5. **Binary Search** - Python algorithm knowledge should rank high
6. **Unrelated Query** - Should return no results or low scores
7. **Metadata Filters** - All results should match specified filters

## Performance Considerations

### Indexes Used
- `idx_codelab_embedding` (IVFFlat) - Vector similarity
- `idx_codelab_language` - Language filtering
- `idx_codelab_category` - Category filtering
- `idx_codelab_topic` - Topic filtering
- `idx_codelab_lang_cat_topic` - Composite filter

### Optimization Tips
1. Use metadata filters to reduce search space
2. Keep result limit reasonable (5-10 typical)
3. Cache embeddings for repeated queries
4. Consider batch processing for multiple searches

## Troubleshooting

### "Failed to connect to database"
```bash
# Check PostgreSQL is running
psql -d quasor -c "SELECT COUNT(*) FROM codelab_knowledge_chunks;"
```

### "No embedding results"
```bash
# Verify embeddings were ingested
psql -d quasor -c "SELECT COUNT(*) FROM codelab_knowledge_chunks WHERE embedding IS NOT NULL;"
```

### "Query timeout"
- Increase timeout in retrieval_cli.py if needed
- Check database performance
- Verify API key is valid

### "Unrelated results returned"
- Lower the threshold value
- Add more specific metadata filters
- Check if knowledge base content is appropriate

## Next Steps

### STEP 7: CYGNUS Integration
- Pass retrieved chunks to CYGNUS mentor
- Enhance responses with knowledge base context
- Implement knowledge-aware prompts

### Future Enhancements
1. Hybrid search (keyword + semantic)
2. Query expansion / paraphrasing
3. Result re-ranking
4. Query caching
5. Personalized filtering
6. Feedback loop for relevance

## Integration Points

### Frontend
- CodeLab challenge view can call `/api/rag/search`
- CYGNUS panel can include retrieved knowledge in context
- Display source citations for retrieved chunks

### Backend
- CYGNUS mentor can use retrieved context
- Create knowledge-aware prompts
- Track retrieval quality metrics

### Database
- Monitor vector index performance
- Analyze query patterns
- Track similarity scores over time

## Compliance & Security

✅ **No API Keys Logged**
- API keys never printed or logged
- Only connection status logged

✅ **No Passwords Logged**
- Database credentials from environment
- Never included in logs

✅ **SQL Injection Prevention**
- All queries parameterized
- User inputs never in SQL strings

✅ **No Embeddings in Response**
- Only relevant metadata returned
- Embeddings never exposed to frontend

✅ **Error Handling**
- Graceful failures
- No stack traces to client
- Proper HTTP status codes

## Statistics

- **Knowledge Chunks:** 225 (from STEP 3)
- **Embedding Dimension:** 768
- **Similarity Metric:** Cosine Distance
- **Default Results:** 5
- **Max Results:** 20
- **Filters Supported:** 4 (language, category, topic, difficulty)
- **Response Time:** Typically <2 seconds

---

**Status:** ✅ COMPLETE - STEP 6  
**Created:** 2026-09-02  
**Next:** STEP 7 - CYGNUS Integration
