#!/usr/bin/env python3
"""Quick test of google-genai embedding API."""

import os
import sys

# Check API key
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("[ERROR] GEMINI_API_KEY not set")
    sys.exit(1)

print(f"[INFO] API key found: {api_key[:20]}...")

try:
    import google.genai as genai
    print("[OK] google.genai imported successfully")
    
    # Initialize client
    client = genai.Client(api_key=api_key)
    print("[OK] Client created successfully")
    
    # Test embedding
    test_text = "Python is a programming language"
    print(f"[TEST] Generating embedding for: {test_text[:50]}...")
    
    response = client.models.embed_content(
        model="models/embedding-001",
        contents=test_text
    )
    
    embedding = response.embedding
    print(f"[OK] Embedding generated successfully")
    print(f"[INFO] Embedding dimension: {len(embedding)}")
    print(f"[INFO] First 5 values: {embedding[:5]}")
    
except Exception as e:
    print(f"[ERROR] {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("[SUCCESS] API test passed!")
