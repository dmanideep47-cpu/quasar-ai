#!/usr/bin/env python3
"""
CodeLab RAG Retrieval CLI

Command-line interface for RAG retrieval service.
Reads search parameters from stdin, outputs JSON results to stdout.
"""

import sys
import json
import os
from retrieval_service import RAGRetrievalService, SearchFilter, get_connection_string

def main():
    """Main CLI entry point."""
    
    try:
        # Get API key from environment
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print(json.dumps({
                "error": "GEMINI_API_KEY not configured",
                "results": []
            }))
            return 1
        
        # Get database connection string
        connection_string = get_connection_string()
        
        # Read search parameters from stdin
        input_data = sys.stdin.read()
        params = json.loads(input_data)
        
        # Extract parameters
        query = params.get('query', '')
        language = params.get('language')
        category = params.get('category')
        topic = params.get('topic')
        difficulty = params.get('difficulty')
        limit = params.get('limit', 5)
        threshold = params.get('threshold', 0.5)
        
        # Validate query
        if not query or not query.strip():
            print(json.dumps({
                "error": "Query cannot be empty",
                "results": []
            }))
            return 1
        
        # Create filter
        filters = SearchFilter(
            language=language,
            category=category,
            topic=topic,
            difficulty=difficulty,
            limit=limit,
            threshold=threshold
        )
        
        # Initialize service
        service = RAGRetrievalService(api_key, connection_string)
        
        # Connect to database
        if not service.connect():
            print(json.dumps({
                "error": "Failed to connect to database",
                "results": []
            }))
            return 1
        
        try:
            # Perform search
            result = service.search(query, filters)
            
            # Output result as JSON
            print(json.dumps(result))
            
            return 0
        
        finally:
            service.close()
    
    except json.JSONDecodeError:
        print(json.dumps({
            "error": "Invalid JSON input",
            "results": []
        }))
        return 1
    
    except Exception as e:
        print(json.dumps({
            "error": f"Error: {str(e)[:100]}",
            "results": []
        }))
        return 1


if __name__ == "__main__":
    sys.exit(main())
