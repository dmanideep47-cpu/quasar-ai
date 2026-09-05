#!/usr/bin/env python3
"""
CodeLab RAG Embedding Generation Pipeline (Mock Version)

Reads chunks.json and generates mock embeddings for testing.
This allows testing the RAG pipeline without needing API access.
"""

import os
import json
import time
from pathlib import Path
from typing import List, Dict, Any
import sys
import hashlib

# Mock embedding configuration
MOCK_EMBEDDING_DIM = 768


class MockEmbeddingGenerator:
    """Generate mock embeddings for chunks (for testing without API)."""
    
    # Gemini embedding model
    EMBEDDING_MODEL = "models/embedding-001"
    
    def __init__(self, api_key: str = None):
        """Initialize with optional API key."""
        self.generated_count = 0
        self.failed_count = 0
    
    def generate_embedding(self, text: str, chunk_id: str) -> List[float]:
        """Generate deterministic mock embedding for a text chunk."""
        try:
            # Use hash of text + chunk_id for deterministic but unique embeddings
            combined = f"{chunk_id}:{text[:100]}"
            hash_bytes = hashlib.sha256(combined.encode()).digest()
            
            # Convert hash to embedding values between -1 and 1
            embedding = []
            for i in range(MOCK_EMBEDDING_DIM):
                byte_val = hash_bytes[i % len(hash_bytes)]
                # Normalize to -1..1 range
                val = (byte_val - 128) / 128.0
                embedding.append(float(val))
            
            self.generated_count += 1
            return embedding
        
        except Exception as e:
            print(f"    [ERROR] Failed to generate embedding: {e}")
            self.failed_count += 1
            return None
    
    def process_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate embeddings for all chunks."""
        embedded_chunks = []
        
        print(f"[PROCESSING] Generating MOCK embeddings for {len(chunks)} chunks")
        print(f"[MODEL] {self.EMBEDDING_MODEL}")
        print(f"[MODE] MOCK (deterministic, no API required)")
        print()
        
        for idx, chunk in enumerate(chunks):
            if (idx + 1) % 50 == 0:
                print(f"  [{idx + 1}/{len(chunks)}] Processed {idx + 1} chunks...")
            
            chunk_id = chunk['id']
            text = chunk['text']
            metadata = chunk['metadata']
            
            # Generate mock embedding
            embedding = self.generate_embedding(text, chunk_id)
            
            if embedding is None:
                print(f"    [SKIP] No embedding for {chunk_id}")
                continue
            
            # Create embedded chunk
            embedded_chunk = {
                "id": chunk_id,
                "embedding": embedding,
                "metadata": metadata
            }
            
            embedded_chunks.append(embedded_chunk)
        
        print()
        return embedded_chunks


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
    
    chunks_file = project_root / "codelab-knowledge" / "_processed" / "chunks.json"
    embeddings_file = project_root / "codelab-knowledge" / "_processed" / "embedded_chunks.json"
    
    # Verify chunks file exists
    if not chunks_file.exists():
        print(f"[ERROR] chunks.json not found: {chunks_file}")
        return 1
    
    print("[START] Embedding Generation Pipeline (MOCK)")
    print(f"[SOURCE] {chunks_file.relative_to(project_root)}")
    print()
    
    # Load chunks
    print("[LOAD] Reading chunks.json...")
    with open(chunks_file, 'r', encoding='utf-8') as f:
        chunks_data = json.load(f)
    
    chunks = chunks_data.get('chunks', [])
    print(f"[OK] Loaded {len(chunks)} chunks")
    print()
    
    # Generate embeddings (mock)
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        print("[API] GEMINI_API_KEY is set")
        try:
            import google.genai as genai
            print("[INFO] Attempting to use real Gemini API")
            generator = RealEmbeddingGenerator(api_key)
        except Exception as e:
            print(f"[WARNING] Could not use real API: {e}")
            print("[INFO] Falling back to mock embeddings")
            generator = MockEmbeddingGenerator()
    else:
        print("[INFO] GEMINI_API_KEY not set - using mock embeddings")
        generator = MockEmbeddingGenerator()
    
    embedded_chunks = generator.process_chunks(chunks)
    
    print(f"[COMPLETE] Embedding generation complete")
    print(f"  Generated: {generator.generated_count}")
    print(f"  Failed: {generator.failed_count}")
    print(f"  Success rate: {(generator.generated_count / len(chunks) * 100):.1f}%")
    print()
    
    if not embedded_chunks:
        print("[ERROR] No chunks were successfully embedded")
        return 1
    
    # Create output structure
    output_data = {
        "version": "1.0",
        "model": generator.EMBEDDING_MODEL,
        "totalChunks": len(embedded_chunks),
        "embeddingDimension": len(embedded_chunks[0]['embedding']) if embedded_chunks else 0,
        "chunks": embedded_chunks,
        "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
    }
    
    # Save embeddings
    print(f"[SAVE] Writing embeddings to {embeddings_file.relative_to(project_root)}")
    with open(embeddings_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print()
    
    # Print statistics
    print("[STATS]")
    print(f"  Total chunks embedded: {len(embedded_chunks)}")
    print(f"  Embedding dimension: {output_data['embeddingDimension']}")
    print(f"  File size: {embeddings_file.stat().st_size / 1024 / 1024:.2f} MB")
    print()
    
    print("[SUCCESS] Embedding pipeline completed successfully!")
    print(f"  Output: codelab-knowledge/_processed/embedded_chunks.json")
    
    return 0


# Real embedding generator class (kept for reference)
class RealEmbeddingGenerator:
    """Generate real embeddings using Google Gemini API."""
    
    EMBEDDING_MODEL = "models/embedding-001"
    MAX_RETRIES = 3
    RETRY_DELAY = 2
    
    def __init__(self, api_key: str):
        """Initialize with API key."""
        import google.genai as genai
        self.client = genai.Client(api_key=api_key)
        self.generated_count = 0
        self.failed_count = 0
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate real embedding."""
        retries = 0
        while retries < self.MAX_RETRIES:
            try:
                response = self.client.models.embed_content(
                    model=self.EMBEDDING_MODEL,
                    contents=text
                )
                embedding = getattr(response, "embedding", None)
                if embedding is None:
                    embeddings = getattr(response, "embeddings", None)
                    embedding = embeddings[0] if embeddings else None
                if embedding is None and isinstance(response, dict):
                    embedding = response.get("embedding")
                    if embedding is None:
                        embeddings = response.get("embeddings") or []
                        embedding = embeddings[0] if embeddings else None
                if embedding is None:
                    raise ValueError("Embedding provider returned no vector")
                if hasattr(embedding, "values"):
                    embedding = embedding.values
                vector = [float(value) for value in embedding]
                self.generated_count += 1
                return vector
            except Exception as e:
                retries += 1
                if retries < self.MAX_RETRIES:
                    print(f"    [RETRY] Attempt {retries}/{self.MAX_RETRIES}")
                    time.sleep(self.RETRY_DELAY * retries)
                else:
                    print(f"    [ERROR] Failed after {self.MAX_RETRIES} retries")
                    self.failed_count += 1
                    return None
    
    def process_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate real embeddings for chunks."""
        embedded_chunks = []
        print(f"[PROCESSING] Generating embeddings for {len(chunks)} chunks")
        print(f"[MODEL] {self.EMBEDDING_MODEL}")
        print()
        
        for idx, chunk in enumerate(chunks):
            if (idx + 1) % 50 == 0:
                print(f"  [{idx + 1}/{len(chunks)}] Processed {idx + 1} chunks...")
            
            chunk_id = chunk['id']
            text = chunk['text']
            metadata = chunk['metadata']
            embedding = self.generate_embedding(text)
            
            if embedding is None:
                print(f"    [SKIP] No embedding for {chunk_id}")
                continue
            
            embedded_chunk = {
                "id": chunk_id,
                "embedding": embedding,
                "metadata": metadata
            }
            embedded_chunks.append(embedded_chunk)
        
        print()
        return embedded_chunks


if __name__ == "__main__":
    exit(main())
