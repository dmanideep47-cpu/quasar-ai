#!/usr/bin/env python3
"""
CodeLab RAG Retrieval Service

Performs semantic search on embedded knowledge chunks in PostgreSQL + pgvector.
Ranks results by similarity and metadata filters.
"""

import os
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import json

try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("[ERROR] psycopg2 package not found")
    print("Install with: pip install psycopg2-binary")
    exit(1)

try:
    import google.generativeai as genai
except ImportError:
    print("[ERROR] google-generativeai package not found")
    print("Install with: pip install google-generativeai")
    exit(1)


# Configure logging (never log sensitive data)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class SearchFilter:
    """Search filters for RAG retrieval."""
    language: Optional[str] = None
    category: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    limit: int = 5
    threshold: float = 0.5  # Minimum similarity score (0-1)


@dataclass
class SearchResult:
    """Individual search result."""
    chunk_id: str
    text: str
    score: float
    metadata: Dict[str, str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding embeddings."""
        return asdict(self)


class RAGRetrievalService:
    """RAG Retrieval Service using PostgreSQL + pgvector."""
    
    # Gemini embedding model (must match STEP 4)
    EMBEDDING_MODEL = "models/embedding-001"
    
    # Similarity metric: cosine distance (lower is more similar)
    # For cosine distance: 0 = identical, 2 = opposite
    # For cosine similarity: 1 = identical, -1 = opposite
    SIMILARITY_METRIC = "cosine"  # Using <-> operator in pgvector
    
    # Default parameters
    DEFAULT_LIMIT = 5
    DEFAULT_THRESHOLD = 0.5  # For cosine distance: scores < 0.5 are very relevant
    
    def __init__(self, api_key: str, connection_string: str):
        """Initialize retrieval service with API key and database connection."""
        self.api_key = api_key
        self.connection_string = connection_string
        self.conn = None
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        logger.info("RAG Retrieval Service initialized")
    
    def connect(self) -> bool:
        """Connect to PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(self.connection_string)
            logger.info("Connected to PostgreSQL")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)[:100]}")
            return False
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def generate_query_embedding(self, query: str) -> Optional[List[float]]:
        """Generate embedding for query using Gemini API."""
        try:
            response = genai.embed_content(
                model=self.EMBEDDING_MODEL,
                content=query,
                task_type="RETRIEVAL_QUERY"
            )
            logger.info(f"Generated embedding for query (dim={len(response['embedding'])})")
            return response['embedding']
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)[:100]}")
            return None
    
    def build_search_query(self, filters: SearchFilter) -> tuple:
        """Build SQL query and parameters for vector search."""
        
        # Base query with cosine distance
        base_query = """
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
        WHERE 1=1
        """
        
        params = []
        conditions = []
        
        # Add filter conditions
        if filters.language:
            conditions.append("language = %s")
            params.append(filters.language)
        
        if filters.category:
            conditions.append("category = %s")
            params.append(filters.category)
        
        if filters.topic:
            conditions.append("topic = %s")
            params.append(filters.topic)
        
        if filters.difficulty:
            conditions.append("difficulty = %s")
            params.append(filters.difficulty)
        
        # Combine conditions
        where_clause = base_query
        for condition in conditions:
            where_clause += f"AND {condition}\n"
        
        # Add similarity threshold and ordering
        where_clause += f"""
        AND embedding <-> %s::vector < %s
        ORDER BY distance ASC
        LIMIT %s
        """
        
        return where_clause, params
    
    def search(self, query: str, filters: Optional[SearchFilter] = None) -> Dict[str, Any]:
        """
        Perform RAG retrieval search.
        
        Returns:
            Dictionary with query and ranked results.
        """
        
        # Validate input
        if not query or not query.strip():
            logger.warning("Empty query received")
            return {
                "query": query,
                "error": "Query cannot be empty",
                "results": []
            }
        
        # Use default filters if not provided
        if filters is None:
            filters = SearchFilter()
        
        # Generate embedding for query
        query_embedding = self.generate_query_embedding(query)
        if query_embedding is None:
            logger.error("Failed to generate query embedding")
            return {
                "query": query,
                "error": "Failed to generate embedding for query",
                "results": []
            }
        
        # Convert embedding to pgvector format
        embedding_str = f"[{','.join(str(x) for x in query_embedding)}]"
        
        # Build and execute search query
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                search_query, params = self.build_search_query(filters)
                
                # Add embedding parameters
                # The query embedding is used in both SELECT distance and the
                # threshold predicate, so it must bind before filter values.
                search_params = [embedding_str] + params + [
                    embedding_str,
                    filters.threshold,
                    filters.limit,
                ]
                
                logger.info(f"Executing search: query={query[:50]}..., filters={filters}")
                cur.execute(search_query, search_params)
                
                rows = cur.fetchall()
                logger.info(f"Found {len(rows)} results")
                
                # Convert results to SearchResult objects
                results = []
                for row in rows:
                    result = SearchResult(
                        chunk_id=row['chunk_id'],
                        text=row['text'],
                        score=float(row['distance']),  # Cosine distance
                        metadata={
                            'language': row['language'],
                            'category': row['category'],
                            'topic': row['topic'],
                            'difficulty': row['difficulty'],
                            'source': row['source']
                        }
                    )
                    results.append(result)
                
                return {
                    "query": query,
                    "filters": {
                        "language": filters.language,
                        "category": filters.category,
                        "topic": filters.topic,
                        "difficulty": filters.difficulty
                    },
                    "results": [r.to_dict() for r in results],
                    "count": len(results)
                }
        
        except Exception as e:
            logger.error(f"Database search failed: {str(e)[:100]}")
            return {
                "query": query,
                "error": f"Database search failed: {str(e)[:50]}",
                "results": []
            }


def get_connection_string() -> str:
    """Get PostgreSQL connection string from environment."""
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'quasor')
    
    if password:
        return f"postgresql://{user}:{password}@{host}:{port}/{database}"
    else:
        return f"postgresql://{user}@{host}:{port}/{database}"


def main():
    """Main entry point for testing."""
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        logger.error("GEMINI_API_KEY not set")
        return 1
    
    connection_string = get_connection_string()
    
    # Initialize service
    service = RAGRetrievalService(api_key, connection_string)
    
    if not service.connect():
        return 1
    
    try:
        # Example search
        logger.info("Starting example search...")
        filters = SearchFilter(language='python', limit=5)
        result = service.search("How do I access items in a Python list?", filters)
        
        print("\nSearch Result:")
        print(json.dumps(result, indent=2))
        
        logger.info("Search completed successfully")
    
    finally:
        service.close()
    
    return 0


if __name__ == "__main__":
    exit(main())
