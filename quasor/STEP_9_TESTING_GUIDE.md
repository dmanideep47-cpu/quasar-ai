# STEP 9 TESTING & TROUBLESHOOTING GUIDE

## Quick Test: Why Isn't Cygnus Giving Answers?

If you're testing CodeLab and Cygnus isn't responding, here's the checklist:

### Checklist

1. **Server is running?**
   ```bash
   npm run dev
   ```
   Should show: ✓ Ready in 32.7s

2. **CodeLab page loads?**
   - Navigate to http://localhost:3000/code-lab
   - Should see: Challenge selector, code editor, Cygnus panel

3. **Code execution works?**
   - Select a challenge
   - Write simple code
   - Click "Run Code"
   - Should see output in output panel

4. **Cygnus panel appears?**
   - On right side of screen
   - Should see: Title "CYGNUS", buttons (Hint, Debug, Explain, Optimize, Analyze)
   - Should see: Empty chat area with "Ask Cygnus about your code"

5. **Cygnus responds to questions?**
   - Click any button (Debug, Hint, etc.) or type a question
   - Watch browser console (F12) for errors
   - Response should appear in chat

### If Cygnus Doesn't Respond

#### Issue 1: Network Error
**Check browser console:**
- F12 → Console tab
- Look for errors like "Failed to fetch /api/cygnus"

**Fix:**
- Ensure GEMINI_API_KEY is set in .env.local
- Check that API key is valid
- Restart dev server: `npm run dev`

#### Issue 2: Module Not Found Errors
**Check browser console and terminal:**
- Terminal shows "Module not found"
- API route not compiling

**Fix:**
- Clear .next folder: `rm -r .next`
- Restart: `npm run dev`
- Check imports in `/app/api/cygnus/route.ts`

#### Issue 3: Execution Result Not Passed
**Browser shows error about "executionResult"**

**Fix:**
- Ensure code executed first (click "Run Code")
- Check that ExecutionResult was returned (status should be visible)
- Check terminal for execution errors

#### Issue 4: Slow Response
**Cygnus takes >30 seconds to respond**

**Possible causes:**
- Gemini API is slow
- RAG retrieval is slow
- Network latency

**Check:**
- Open Network tab (F12)
- Look for POST to /api/cygnus
- Check request/response time
- If >30s, API is likely slow

---

## Expected Behavior

### Scenario 1: Run Code, Then Debug

**Steps:**
1. Select Python challenge
2. Write code with error: `nums = [1,2]; print(nums[100])`
3. Click "Run Code"
4. Should see: "🔴 Runtime Error" with IndexError message
5. Click "Debug" button
6. Cygnus should respond with explanation

**Expected Response:**
```
You got an IndexError. This means you're trying to access a list index that doesn't exist...

Remember:
- Lists are 0-indexed (first item is index 0)
- Last item is at index len(list)-1
- Negative indices count from the end
```

### Scenario 2: Code Passes, Then Optimize

**Steps:**
1. Write correct code that passes all tests
2. Click "Run Code"
3. Should see: "✅ All tests passed!"
4. Click "Optimize" button
5. Cygnus should suggest improvements

**Expected Response:**
```
Great! Your code passes all tests.

**Time Complexity:** O(n) - You visit each element once
**Space Complexity:** O(1) - No extra space needed

Your solution is already optimal for this problem!
```

---

## API Integration Details

### /api/cygnus Endpoint

**Expected to receive:**
```json
{
  "message": "debug",
  "code": "user's code",
  "language": "python",
  "problem": "challenge description",
  "action": "debug",
  "executionResult": {
    "status": "runtime_error",
    "errorMessage": "IndexError: list index out of range",
    "stderr": "...",
    "tests": { "passed": 2, "failed": 3, "total": 5 },
    "executionTimeMs": 145
  }
}
```

**Should return:**
```json
{
  "answer": "Detailed explanation based on error..."
}
```

### RAG Integration

**Process:**
1. Cygnus API receives executionResult
2. Calls `buildExecutionAwareCodelabContext()`
3. Determines error category (debugging, algorithms, etc.)
4. Calls RAG retrieval with category filter
5. Gets top 3 relevant knowledge chunks
6. Includes in system prompt
7. Sends to Gemini with full context
8. Returns response

---

## Testing With curl

### Windows PowerShell

```powershell
$body = @{
    message = "debug"
    code = "nums = [1,2]; print(nums[100])"
    language = "python"
    problem = "Find max in list"
    action = "debug"
    executionResult = @{
        status = "runtime_error"
        errorMessage = "IndexError: list index out of range"
        stderr = "Error details"
        tests = @{ passed = 2; failed = 3; total = 5 }
        executionTimeMs = 145
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:3000/api/cygnus" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Linux/Mac with curl

```bash
curl -X POST http://localhost:3000/api/cygnus \
  -H "Content-Type: application/json" \
  -d '{
    "message": "debug",
    "code": "nums = [1,2]; print(nums[100])",
    "language": "python",
    "problem": "Find max in list",
    "action": "debug",
    "executionResult": {
      "status": "runtime_error",
      "errorMessage": "IndexError: list index out of range",
      "stderr": "Error details",
      "tests": {"passed": 2, "failed": 3, "total": 5},
      "executionTimeMs": 145
    }
  }'
```

---

## Debug Logging

### Enable Debug Logs

In `/app/api/cygnus/route.ts`, add before the response:

```typescript
console.log('[CYGNUS DEBUG]', {
  messageReceived: message,
  executionResultReceived: !!executionResult,
  ragContextBuilt: !!ragContext,
  systemPromptLength: systemPrompt.length,
});
```

### Check Dev Server Logs

Terminal should show:
```
[CYGNUS DEBUG] {
  messageReceived: "debug",
  executionResultReceived: true,
  ragContextBuilt: true,
  systemPromptLength: 2850
}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 error on /api/cygnus | Server not running, or API file not compiled. Check terminal. |
| "executionResult is not defined" | CodeLab not passing it. Check CygnusPanel props. |
| Cygnus responds but very generic | RAG retrieval not working. Check /api/rag/search endpoint. |
| Very slow response (>30s) | Gemini API is slow. Try again, or check API quota. |
| No error hints in response | Error category detection might be wrong. Check determineErrorCategory(). |
| Test results not showing | ExecutionResult not being captured. Check runCode() in CodeLab page. |

---

## Files to Check

If things aren't working, verify these files exist and have content:

1. **`app/lib/execution-context-builder.ts`**
   - Should have: extractErrorInfo, formatExecutionContext, buildExecutionAwareCodelabContext
   - Size: ~370 lines

2. **`app/api/cygnus/route.ts`**
   - Should import execution-context-builder
   - Should accept executionResult in POST body
   - Should include execution context in system prompt

3. **`app/code-lab/page.tsx`**
   - Should have lastExecutionResult state
   - Should pass it to CygnusPanel
   - Should set it in runCode()

4. **`app/components/CygnusPanel.tsx`**
   - Should accept executionResult prop
   - Should pass it in API request

5. **`.env.local`**
   - Must have: GEMINI_API_KEY=...
   - Must have: DATABASE_URL=... (for RAG)

---

## Next Steps for Debugging

1. **Check Console Errors**
   - Open http://localhost:3000/code-lab
   - Press F12 → Console
   - Look for red errors
   - Report any TypeScript or network errors

2. **Check Network Requests**
   - F12 → Network tab
   - Click Cygnus action (Debug, Hint, etc.)
   - Look for POST to /api/cygnus
   - Check request and response payloads

3. **Check Server Logs**
   - Look at terminal running `npm run dev`
   - Should show [CYGNUS DEBUG] logs
   - Should show GET /api/cygnus 200 responses

4. **Test Cygnus API Directly**
   - Use curl command above
   - If it works, then CodeLab integration is issue
   - If it fails, then API endpoint is issue

5. **Check RAG Retrieval**
   - POST to /api/rag/search with test query
   - Should return 3 chunks
   - If no chunks, RAG system needs fixing

---

## Success Indicators

✅ CodeLab loads  
✅ Challenge selector works  
✅ Code runs (shows execution result)  
✅ Cygnus panel appears on screen  
✅ Clicking actions (Debug, Hint, etc.) sends request  
✅ Cygnus responds with meaningful text  
✅ Response includes error explanations  
✅ Response includes knowledge from RAG  
✅ Multiple interactions work without errors  
✅ Test results reflected in Cygnus response  

---

## Report Template

If something doesn't work, provide:

1. **What you did:**
   - Clicked "Run Code" with code: `...`
   - Then clicked "Debug"

2. **What you expected:**
   - Cygnus to explain the error

3. **What actually happened:**
   - Error message or no response

4. **Browser console error (F12):**
   - Copy/paste any red errors

5. **Terminal output:**
   - Paste relevant lines from `npm run dev` output

6. **Affected file:**
   - Which file are you testing (CodeLab, Cygnus panel)?

---

This guide should help diagnose any issues with STEP 9 integration!
