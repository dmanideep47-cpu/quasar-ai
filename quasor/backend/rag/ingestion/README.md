# CodeLab RAG Ingestion Pipeline

Converts Markdown knowledge files into semantic chunks with metadata for RAG system.

## Overview

This pipeline:
1. Reads all `.md` files from `codelab-knowledge/python/`
2. Splits them into semantic chunks based on heading sections
3. Generates deterministic chunk IDs (SHA256 hash-based)
4. Adds metadata (language, category, topic, difficulty, source)
5. Validates chunks and generates `chunks.json`

## Usage

```bash
cd backend/rag/ingestion
python ingest_markdown.py
```

## Output

**File**: `codelab-knowledge/_processed/chunks.json`

**Format**:
```json
{
  "version": "1.0",
  "totalChunks": 0,
  "filesProcessed": 0,
  "chunks": [
    {
      "id": "chunk_abc123def456",
      "text": "chunk content with markdown",
      "metadata": {
        "language": "python",
        "category": "fundamentals",
        "topic": "variables-and-data-types",
        "section": "Definition",
        "difficulty": "beginner",
        "source": "python/fundamentals/variables-and-data-types.md"
      }
    }
  ],
  "timestamp": "2026-09-02T01:51:11Z"
}
```

## Metadata Fields

| Field | Description |
|-------|-------------|
| `language` | Programming language (e.g., `python`) |
| `category` | Topic category (fundamentals, data-structures, etc.) |
| `topic` | Specific topic from filename |
| `section` | Section heading from markdown |
| `difficulty` | beginner, intermediate, advanced |
| `source` | Original markdown file path |

## Chunking Strategy

- Each markdown section (## heading) becomes a potential chunk
- Related content under the same heading stays together
- Code examples are preserved with explanations
- Deterministic IDs ensure reproducibility

## Validation

The script validates:
- ✓ No empty markdown files
- ✓ No empty chunk texts
- ✓ All chunks have required metadata
- ✓ No duplicate chunk IDs

## Next Steps

After ingestion, chunks are ready for:
1. Embedding generation (with Gemini or other models)
2. Vector storage (PostgreSQL + pgvector)
3. RAG retrieval for Cygnus mentoring
