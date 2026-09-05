# STEP 7 Testing Guide - Cygnus RAG Integration

**Purpose:** Verify that RAG knowledge is correctly integrated with Cygnus mentor  
**Prerequisites:** PostgreSQL + pgvector deployed with embeddings ingested  
**Time:** 10-15 minutes  

---

## Test 1: List Access Query

### Setup
1. Navigate to: http://localhost:3000/code-lab
2. Select: **Python** → **Lists** → **Beginner**
3. Start the first challenge
4. Open Browser Console: `F12` → `Console` tab

### Test Steps
1. In Cygnus panel, type: **"How do I access an item from a list?"**
2. Press Enter or click Send
3. Observe the response

### Expected Behavior
- Browser console shows `[RAG Context]` with:
  - query containing "access" and "list"
  - filters: `{language: "python", topic: "lists"}`
  - chunkCount: 2-3
- Cygnus response:
  - Explains list indexing
  - Mentions list access methods
  - Provides code examples
  - Cites knowledge if appropriate

### Success Criteria
✅ Response is relevant to list access  
✅ RAG logs appear in console  
✅ Retrieved chunks relate to lists  
✅ Explanation uses knowledge context  

### Troubleshooting
| Issue | Solution |
|-------|----------|
| No response | Check network tab for /api/cygnus errors |
| Empty [RAG Context] log | PostgreSQL may not be running |
| Chunks with score > 0.7 | Similarity threshold may be too high |

---

## Test 2: IndexError Debugging

### Setup
1. Same CodeLab challenge as Test 1
2. In code editor, introduce an error:
   ```python
   my_list = [1, 2, 3]
   print(my_list[10])  # IndexError!
   ```
3. Paste this error message in Cygnus: **"IndexError: list index out of range"**

### Test Steps
1. Type in Cygnus: **"debug"** (or click 🐛 Debug button)
2. Observe the response
3. Check console for RAG context

### Expected Behavior
- Browser console shows `[RAG Context]` with:
  - query containing "IndexError" and error message
  - filters including `category: "debugging"`
  - chunkCount: 2-3 (debugging/indexing knowledge)
- Cygnus response:
  - Identifies IndexError specifically
  - Explains why it occurs
  - Uses debugging knowledge
  - Suggests checking index bounds

### Success Criteria
✅ IndexError is identified  
✅ Category filter = "debugging"  
✅ Retrieved chunks are debugging-related  
✅ Explanation is educational, not spoiling  

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Response talks about lists instead of debugging | Check category filter is being set in builder |
| Generic response | Ensure error message is passed to API |

---

## Test 3: Algorithm Knowledge

### Setup
1. Navigate to: http://localhost:3000/code-lab
2. Select: **Python** → **Algorithms** → **Intermediate**
   (If not available, use any advanced topic)

### Test Steps
1. Type in Cygnus: **"How does binary search work?"**
2. Press Enter
3. Observe response quality

### Expected Behavior
- Browser console shows:
  - query about "binary search"
  - filters: `{language: "python", topic: "algorithms"}` (or category: "algorithms")
  - chunkCount: 2-3 with algorithm knowledge
- Cygnus response:
  - Explains binary search algorithm
  - Discusses prerequisites (sorted array)
  - Compares to linear search
  - Mentions complexity

### Success Criteria
✅ Algorithm topic retrieved  
✅ Response discusses algorithm concepts  
✅ Complexity analysis included  
✅ Comparison provided  

---

## Test 4: Hint Mode (No Spoiling)

### Setup
1. Any CodeLab challenge
2. Make sure code is incomplete or wrong

### Test Steps
1. Click 💡 **Hint** button
2. Observe the response
3. Verify it doesn't reveal the solution

### Expected Behavior
- Cygnus provides:
  - Suggestion to consider specific aspect
  - Questions to guide thinking
  - Reference to relevant concepts
  - NO complete solution code
- Knowledge is used as reference, not pasted directly

### Success Criteria
✅ Hint is progressive  
✅ No solution code provided  
✅ Guides to discovery  
✅ Encouraging tone  

---

## Test 5: Unrelated Query Filtering

### Setup
1. Any CodeLab challenge
2. Ensure you're working with Python content

### Test Steps
1. Type in Cygnus: **"What is the capital of France?"**
2. Or: **"Tell me a joke"**
3. Observe the response
4. Check browser console

### Expected Behavior
- Browser console shows:
  - Retrieved chunks: 0 (or very few)
  - Similarity scores very high (indicating irrelevant matches filtered out)
- Cygnus response:
  - Acknowledges question is off-topic
  - Redirects to coding help
  - Maintains professional tone
  - Doesn't paste unrelated knowledge

### Success Criteria
✅ Off-topic query doesn't retrieve knowledge  
✅ Cygnus redirects helpfully  
✅ No irrelevant content shown  
✅ Maintains focus on coding  

---

## Test 6: Error State Handling

### Setup
1. Any CodeLab challenge
2. Kill PostgreSQL (simulate database failure)
   ```bash
   # If using docker
   docker stop postgres
   ```

### Test Steps
1. Type in Cygnus: **"Can you help?"**
2. Observe error handling
3. Check browser console for errors

### Expected Behavior
- Browser console shows:
  - [RAG] error in logs
  - Fallback behavior
- Cygnus response:
  - Still provides help
  - Uses general knowledge
  - Doesn't crash
  - Clear error handling

### Success Criteria
✅ Graceful degradation  
✅ No 500 errors  
✅ User can still interact  
✅ Informative error messages  

### Cleanup
1. Restart PostgreSQL
   ```bash
   docker start postgres
   ```

---

## Test 7: Multiple Turns

### Setup
1. Any CodeLab challenge

### Test Steps
1. Turn 1: "hint" (click 💡)
2. Turn 2: "Can you explain this concept?" (type question)
3. Turn 3: "debug" (click 🐛)
4. Observe context persistence

### Expected Behavior
- Each turn:
  - Retrieves fresh knowledge
  - Maintains conversation context
  - Improves responses
  - Doesn't repeat

### Success Criteria
✅ Multiple turns work  
✅ Context is preserved  
✅ Knowledge retrieval per turn  
✅ Conversation flows naturally  

---

## Test 8: Code Context Inclusion

### Setup
1. CodeLab challenge with starter code
2. Modify code slightly

### Test Steps
1. Type in Cygnus: **"explain"** (click 📖)
2. Observe if Cygnus references the actual code

### Expected Behavior
- Cygnus response:
  - References actual code provided
  - Explains line-by-line
  - Uses retrieved knowledge
  - Connects to problem

### Success Criteria
✅ Code context is used  
✅ Explanation is specific  
✅ Not generic  
✅ Tailored to user's code  

---

## Performance Testing

### Browser Developer Tools

1. Open DevTools: F12
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Send a message to Cygnus
5. Observe:

| Request | Expected Time |
|---------|---|
| /api/cygnus | 700-1500ms |
| /api/rag/search (inside) | 200-400ms |
| Gemini API | 500-1000ms |

### Acceptable Performance
- ✅ < 2 seconds total response time
- ✅ < 5 seconds with slow network
- ✅ Smooth streaming animation

### Slow Performance
- Check Network tab for slow requests
- If /api/rag/search > 500ms:
  - Verify PostgreSQL indexes
  - Check database load
- If Gemini > 1500ms:
  - Network latency
  - API rate limiting

---

## Debug Console Output

### Expected Logs

```
[RAG Context] {
  query: "How do I access items in a list?",
  filters: { language: "python", topic: "lists" },
  chunkCount: 3,
  scores: [
    { topic: "lists", score: 0.2147 },
    { topic: "data-structures", score: 0.3456 },
    { topic: "indexing", score: 0.4789 }
  ]
}
```

### Checking Logs
1. Open Console in DevTools
2. Look for `[RAG Context]` messages
3. Verify:
   - Query is relevant
   - Filters are appropriate
   - chunkCount is 2-3
   - Scores are reasonable

### No Logs?
- Production build doesn't show development logs
- Use `NODE_ENV=development` during testing

---

## Test Checklist

### Before Testing
- [ ] PostgreSQL running
- [ ] pgvector extension enabled
- [ ] Embeddings ingected (225 chunks)
- [ ] Dev server running
- [ ] Browser console open

### During Testing
- [ ] Test 1: List access ✓
- [ ] Test 2: IndexError ✓
- [ ] Test 3: Algorithm ✓
- [ ] Test 4: Hint mode ✓
- [ ] Test 5: Unrelated query ✓
- [ ] Test 6: Error handling ✓
- [ ] Test 7: Multiple turns ✓
- [ ] Test 8: Code context ✓

### After Testing
- [ ] All tests passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Ready for deployment

---

## Troubleshooting Matrix

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| "Retrieval service not available" | RAG script missing | Check backend/rag/retrieval/retrieval_cli.py exists |
| No [RAG Context] in console | PostgreSQL not running | Start PostgreSQL: `docker start postgres` |
| High similarity scores (> 0.8) | Threshold too permissive | Lower threshold in retrieval_service.py |
| Chunks empty array | No embeddings in DB | Run vector ingestion script |
| Gemini returns generic response | No RAG context in prompt | Check formatCygnusPrompt() is called |
| Slow response (> 3s) | PostgreSQL slow | Check table size, indexes |
| API error 500 | Python script error | Check backend logs, test /api/rag/search manually |

---

## Manual RAG Testing

### Test /api/rag/search Directly

```bash
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I access items in a list?",
    "language": "python",
    "topic": "lists",
    "limit": 3
  }'
```

**Expected Response:**
```json
{
  "query": "How do I access items...",
  "filters": {...},
  "results": [
    {
      "chunk_id": "...",
      "text": "# Accessing List Items...",
      "score": 0.2147,
      "metadata": {...}
    }
  ],
  "count": 1
}
```

---

## Success Criteria Summary

**STEP 7 is successful when:**

1. ✅ Cygnus receives CodeLab context
2. ✅ RAG retrieves relevant knowledge (scores < 0.5)
3. ✅ Knowledge is integrated into responses
4. ✅ Responses are educational (not copying RAG)
5. ✅ Hints don't spoil solutions
6. ✅ Unrelated queries are filtered
7. ✅ Multiple turns work smoothly
8. ✅ Error handling is graceful
9. ✅ Performance is acceptable (<2s)
10. ✅ No console errors

---

**When all tests pass: STEP 7 is COMPLETE ✅**

