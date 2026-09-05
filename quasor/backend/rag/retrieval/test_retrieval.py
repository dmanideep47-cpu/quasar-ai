#!/usr/bin/env python3
"""
CodeLab RAG Retrieval Service - Test Suite

Tests the RAG retrieval functionality with various queries and filters.
"""

import os
import json
import sys
from retrieval_service import RAGRetrievalService, SearchFilter, get_connection_string

class TestRunner:
    """Test runner for RAG retrieval service."""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.connection_string = get_connection_string()
        self.service = None
        self.passed = 0
        self.failed = 0
    
    def setup(self):
        """Set up test environment."""
        if not self.api_key:
            print("[ERROR] GEMINI_API_KEY not set")
            return False
        
        self.service = RAGRetrievalService(self.api_key, self.connection_string)
        
        if not self.service.connect():
            print("[ERROR] Failed to connect to database")
            return False
        
        print("[OK] Test environment ready")
        return True
    
    def teardown(self):
        """Clean up test environment."""
        if self.service:
            self.service.close()
    
    def test_query_empty(self):
        """Test 1: Empty query should fail."""
        print("\n[TEST 1] Empty Query")
        print("Expected: Error about empty query")
        
        result = self.service.search("")
        
        if "error" in result and result["error"]:
            print("[PASS] Empty query rejected correctly")
            self.passed += 1
            return True
        else:
            print("[FAIL] Empty query should return error")
            self.failed += 1
            return False
    
    def test_list_access_python(self):
        """Test 2: Query about accessing Python list items."""
        print("\n[TEST 2] List Access Query (Python)")
        print("Query: 'How do I access an item from a Python list?'")
        print("Expected: Python list-related chunks should rank highly")
        
        filters = SearchFilter(language='python', limit=5)
        result = self.service.search("How do I access an item from a Python list?", filters)
        
        if result.get("results") and len(result["results"]) > 0:
            print(f"[PASS] Found {len(result['results'])} results")
            for i, r in enumerate(result["results"][:3]):
                print(f"  #{i+1}: {r['metadata']['topic']} (score: {r['score']:.4f})")
            self.passed += 1
            return True
        else:
            print("[FAIL] Should return results for list access query")
            self.failed += 1
            return False
    
    def test_index_error_python(self):
        """Test 3: Query about IndexError."""
        print("\n[TEST 3] IndexError Query")
        print("Query: 'Why am I getting IndexError?'")
        print("Expected: Python debugging/index-error knowledge should rank highly")
        
        filters = SearchFilter(language='python', category='debugging', limit=5)
        result = self.service.search("Why am I getting IndexError?", filters)
        
        if result.get("results") and len(result["results"]) > 0:
            print(f"[PASS] Found {len(result['results'])} results")
            for i, r in enumerate(result["results"][:3]):
                print(f"  #{i+1}: {r['metadata']['topic']} (score: {r['score']:.4f})")
            self.passed += 1
            return True
        else:
            print("[FAIL] Should return debugging results")
            self.failed += 1
            return False
    
    def test_sql_with_python_filter(self):
        """Test 4: SQL query should be filtered out when language=python."""
        print("\n[TEST 4] SQL Query with Python Filter")
        print("Query: 'What is a SQL JOIN?'")
        print("Language filter: Python")
        print("Expected: Should return no results or Python-only results (not SQL)")
        
        filters = SearchFilter(language='python', limit=5)
        result = self.service.search("What is a SQL JOIN?", filters)
        
        # Check if results contain SQL knowledge
        has_sql = any('sql' in r['metadata'].get('language', '').lower() 
                     for r in result.get("results", []))
        
        if not has_sql or len(result.get("results", [])) == 0:
            print(f"[PASS] Language filter working (returned {len(result.get('results', []))} Python results)")
            self.passed += 1
            return True
        else:
            print("[FAIL] SQL knowledge should not appear with language=python filter")
            self.failed += 1
            return False
    
    def test_binary_search_algorithm(self):
        """Test 5: Query about binary search."""
        print("\n[TEST 5] Binary Search Query")
        print("Query: 'How does binary search work?'")
        print("Expected: Python algorithm/searching knowledge should rank highly")
        
        filters = SearchFilter(language='python', category='algorithms', limit=5)
        result = self.service.search("How does binary search work?", filters)
        
        if result.get("results") and len(result["results"]) > 0:
            print(f"[PASS] Found {len(result['results'])} algorithm results")
            for i, r in enumerate(result["results"][:3]):
                print(f"  #{i+1}: {r['metadata']['topic']} (score: {r['score']:.4f})")
            self.passed += 1
            return True
        else:
            print("[FAIL] Should return algorithm results")
            self.failed += 1
            return False
    
    def test_unrelated_query(self):
        """Test 6: Unrelated query should return no results or low-relevance results."""
        print("\n[TEST 6] Unrelated Query")
        print("Query: 'What is the meaning of life?'")
        print("Expected: No results (above similarity threshold) or low scores")
        
        filters = SearchFilter(language='python', limit=5, threshold=0.3)
        result = self.service.search("What is the meaning of life?", filters)
        
        results = result.get("results", [])
        
        if len(results) == 0:
            print("[PASS] Correctly returned no results for unrelated query")
            self.passed += 1
            return True
        elif all(r['score'] > 0.6 for r in results):
            print("[FAIL] Unrelated query has high similarity scores")
            self.failed += 1
            return False
        else:
            print(f"[PASS] Returned {len(results)} low-relevance results (good threshold filtering)")
            self.passed += 1
            return True
    
    def test_metadata_filters(self):
        """Test 7: Metadata filters should work correctly."""
        print("\n[TEST 7] Metadata Filters")
        print("Query: 'dictionaries and maps'")
        print("Filters: language=python, category=data-structures, topic=dictionaries")
        print("Expected: Only results matching all filters")
        
        filters = SearchFilter(
            language='python',
            category='data-structures',
            topic='dictionaries',
            limit=5
        )
        result = self.service.search("dictionaries and maps", filters)
        
        results = result.get("results", [])
        
        if len(results) > 0:
            all_match = all(
                r['metadata']['language'] == 'python' and
                r['metadata']['category'] == 'data-structures' and
                r['metadata']['topic'] == 'dictionaries'
                for r in results
            )
            
            if all_match:
                print(f"[PASS] All {len(results)} results match filters")
                self.passed += 1
                return True
            else:
                print("[FAIL] Some results don't match filters")
                self.failed += 1
                return False
        else:
            print("[FAIL] Should return filtered results")
            self.failed += 1
            return False
    
    def run_all_tests(self):
        """Run all tests."""
        print("=" * 70)
        print("CodeLab RAG Retrieval Service - Test Suite")
        print("=" * 70)
        
        if not self.setup():
            return 1
        
        try:
            # Run tests
            self.test_query_empty()
            self.test_list_access_python()
            self.test_index_error_python()
            self.test_sql_with_python_filter()
            self.test_binary_search_algorithm()
            self.test_unrelated_query()
            self.test_metadata_filters()
            
            # Print summary
            total = self.passed + self.failed
            print("\n" + "=" * 70)
            print(f"Test Results: {self.passed}/{total} passed")
            print("=" * 70)
            
            if self.failed == 0:
                print("✅ ALL TESTS PASSED!")
                return 0
            else:
                print(f"❌ {self.failed} test(s) failed")
                return 1
        
        finally:
            self.teardown()


def main():
    """Main entry point."""
    runner = TestRunner()
    return runner.run_all_tests()


if __name__ == "__main__":
    sys.exit(main())
