#!/usr/bin/env python3
"""
CodeLab RAG Vector Storage Ingestion

Reads embedded_chunks.json and ingests embeddings into PostgreSQL with pgvector.
Creates/updates the codelab_knowledge_chunks table as needed.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any
import sys

try:
    import psycopg2
    from psycopg2.extras import execute_values, Json
    from psycopg2 import sql
except ImportError:
    print("[ERROR] psycopg2 package not found")
    print("Install with: pip install psycopg2-binary")
    sys.exit(1)


class VectorIngester:
    """Ingest embeddings into PostgreSQL with pgvector."""
    
    def __init__(self, connection_string: str):
        """Initialize database connection."""
        self.conn_string = connection_string
        self.conn = None
        self.inserted = 0
        self.updated = 0
        self.failed = 0
    
    def connect(self) -> bool:
        """Connect to PostgreSQL."""
        try:
            self.conn = psycopg2.connect(self.conn_string)
            print("[OK] Connected to PostgreSQL")
            return True
        except Exception as e:
            print(f"[ERROR] Connection failed: {str(e)[:100]}")
            return False
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            print("[OK] Database connection closed")
    
    def enable_pgvector(self) -> bool:
        """Enable pgvector extension."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                self.conn.commit()
                print("[OK] pgvector extension enabled")
                return True
        except Exception as e:
            print(f"[WARN] pgvector enable failed: {str(e)[:80]}")
            return False
    
    def create_table(self) -> bool:
        """Create codelab_knowledge_chunks table if it doesn't exist."""
        create_table_sql = """
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
        """
        
        try:
            with self.conn.cursor() as cur:
                cur.execute(create_table_sql)
                self.conn.commit()
                print("[OK] Table created (or already exists)")
                return True
        except Exception as e:
            print(f"[ERROR] Table creation failed: {str(e)[:100]}")
            return False
    
    def ingest_chunks(self, chunks: List[Dict[str, Any]]) -> bool:
        """Ingest embedded chunks into database."""
        if not chunks:
            print("[ERROR] No chunks to ingest")
            return False
        
        print(f"[PROCESS] Ingesting {len(chunks)} chunks...")
        
        with self.conn.cursor() as cur:
            for idx, chunk in enumerate(chunks):
                try:
                    chunk_id = chunk['id']
                    text = chunk['text']
                    metadata = chunk['metadata']
                    embedding = chunk.get('embedding', None)
                    
                    # Extract metadata
                    language = metadata.get('language', 'unknown')
                    category = metadata.get('category', 'unknown')
                    topic = metadata.get('topic', 'unknown')
                    difficulty = metadata.get('difficulty', 'unknown')
                    source = metadata.get('source', '')
                    
                    # Convert embedding to SQL format if present
                    embedding_sql = None
                    if embedding:
                        embedding_sql = f"[{','.join(str(x) for x in embedding)}]"
                    
                    # Upsert: insert or update if chunk_id already exists
                    upsert_sql = sql.SQL("""
                    INSERT INTO codelab_knowledge_chunks 
                    (chunk_id, text, language, category, topic, difficulty, source, embedding, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (chunk_id) DO UPDATE SET
                        text = EXCLUDED.text,
                        language = EXCLUDED.language,
                        category = EXCLUDED.category,
                        topic = EXCLUDED.topic,
                        difficulty = EXCLUDED.difficulty,
                        source = EXCLUDED.source,
                        embedding = EXCLUDED.embedding,
                        updated_at = CURRENT_TIMESTAMP
                    """)
                    
                    # Execute upsert
                    if embedding_sql:
                        cur.execute(upsert_sql, (chunk_id, text, language, category, topic, difficulty, source, embedding_sql))
                    else:
                        cur.execute(upsert_sql, (chunk_id, text, language, category, topic, difficulty, source, None))
                    
                    # Determine if it was insert or update
                    if cur.rowcount > 0:
                        if "INSERT" in cur.statusmessage or cur.rowcount == 1:
                            self.inserted += 1
                        else:
                            self.updated += 1
                    
                    if (idx + 1) % 50 == 0:
                        print(f"  [{idx + 1}/{len(chunks)}] Processed {idx + 1} chunks...")
                        self.conn.commit()
                
                except Exception as e:
                    self.failed += 1
                    print(f"    [ERROR] Chunk {chunk_id}: {str(e)[:80]}")
        
        self.conn.commit()
        return True
    
    def create_indexes(self) -> bool:
        """Create indexes for efficient querying."""
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_codelab_language ON codelab_knowledge_chunks(language);",
            "CREATE INDEX IF NOT EXISTS idx_codelab_category ON codelab_knowledge_chunks(category);",
            "CREATE INDEX IF NOT EXISTS idx_codelab_topic ON codelab_knowledge_chunks(topic);",
            "CREATE INDEX IF NOT EXISTS idx_codelab_difficulty ON codelab_knowledge_chunks(difficulty);",
            "CREATE INDEX IF NOT EXISTS idx_codelab_source ON codelab_knowledge_chunks(source);",
            "CREATE INDEX IF NOT EXISTS idx_codelab_lang_cat_topic ON codelab_knowledge_chunks(language, category, topic);",
        ]
        
        try:
            with self.conn.cursor() as cur:
                for idx_sql in indexes:
                    cur.execute(idx_sql)
                self.conn.commit()
            print("[OK] Indexes created")
            return True
        except Exception as e:
            print(f"[WARN] Index creation failed: {str(e)[:80]}")
            return False
    
    def validate(self) -> bool:
        """Validate ingestion results."""
        try:
            with self.conn.cursor() as cur:
                # Count total chunks
                cur.execute("SELECT COUNT(*) FROM codelab_knowledge_chunks;")
                total = cur.fetchone()[0]
                
                # Count chunks with embeddings
                cur.execute("SELECT COUNT(*) FROM codelab_knowledge_chunks WHERE embedding IS NOT NULL;")
                embedded = cur.fetchone()[0]
                
                # Check for duplicates
                cur.execute("SELECT COUNT(*) FROM (SELECT chunk_id, COUNT(*) as cnt FROM codelab_knowledge_chunks GROUP BY chunk_id HAVING COUNT(*) > 1) t;")
                duplicates = cur.fetchone()[0]
                
                # Get embedding dimension
                cur.execute("SELECT dimension(embedding) FROM codelab_knowledge_chunks WHERE embedding IS NOT NULL LIMIT 1;")
                result = cur.fetchone()
                dimension = result[0] if result else 0
                
                print()
                print("[VALIDATION]")
                print(f"  Total chunks in database: {total}")
                print(f"  Chunks with embeddings: {embedded}")
                print(f"  Duplicate chunk_ids: {duplicates}")
                print(f"  Embedding dimension: {dimension}")
                print()
                
                return duplicates == 0
        
        except Exception as e:
            print(f"[ERROR] Validation failed: {str(e)[:100]}")
            return False


def get_connection_string() -> str:
    """Get PostgreSQL connection string from environment or defaults."""
    # Try to get from environment variables
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'quasor')
    
    # Build connection string
    if password:
        conn_string = f"postgresql://{user}:{password}@{host}:{port}/{database}"
    else:
        conn_string = f"postgresql://{user}@{host}:{port}/{database}"
    
    return conn_string


def main():
    """Main entry point."""
    
    # Get paths
    script_dir = Path(__file__).parent
    current = script_dir
    project_root = None
    
    for _ in range(5):
        if (current / "codelab-knowledge").exists():
            project_root = current
            break
        current = current.parent
    
    if project_root is None:
        print("[ERROR] Could not find project root")
        return 1
    
    embeddings_file = project_root / "codelab-knowledge" / "_processed" / "embedded_chunks.json"
    
    # Verify embeddings file exists
    if not embeddings_file.exists():
        print(f"[ERROR] embedded_chunks.json not found: {embeddings_file}")
        return 1
    
    print("[START] Vector Storage Ingestion Pipeline")
    print(f"[SOURCE] {embeddings_file.relative_to(project_root)}")
    print()
    
    # Load embeddings
    print("[LOAD] Reading embedded_chunks.json...")
    with open(embeddings_file, 'r', encoding='utf-8') as f:
        embeddings_data = json.load(f)
    
    chunks = embeddings_data.get('chunks', [])
    embedding_dim = embeddings_data.get('embeddingDimension', 0)
    
    print(f"[OK] Loaded {len(chunks)} embedded chunks")
    print(f"[OK] Embedding dimension: {embedding_dim}")
    print()
    
    # Get database connection string
    connection_string = get_connection_string()
    print("[DB] Connecting to PostgreSQL...")
    print(f"[DB] Host: {os.getenv('DB_HOST', 'localhost')}")
    print(f"[DB] Database: {os.getenv('DB_NAME', 'quasor')}")
    print()
    
    # Initialize ingester
    ingester = VectorIngester(connection_string)
    
    # Connect
    if not ingester.connect():
        return 1
    
    # Enable pgvector
    ingester.enable_pgvector()
    
    # Create table
    if not ingester.create_table():
        ingester.close()
        return 1
    
    print()
    
    # Ingest chunks
    if not ingester.ingest_chunks(chunks):
        ingester.close()
        return 1
    
    print()
    
    # Create indexes
    ingester.create_indexes()
    
    print()
    
    # Validate
    ingester.validate()
    
    # Print summary
    print("[SUMMARY]")
    print(f"  Inserted: {ingester.inserted}")
    print(f"  Updated: {ingester.updated}")
    print(f"  Failed: {ingester.failed}")
    print(f"  Total: {ingester.inserted + ingester.updated}")
    print()
    
    print("[SUCCESS] Vector ingestion completed!")
    
    # Close connection
    ingester.close()
    
    return 0


if __name__ == "__main__":
    exit(main())
