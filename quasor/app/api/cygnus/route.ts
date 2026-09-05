import { buildCygnusContext, formatCygnusPrompt } from "../../lib/rag-context-builder";
import type { CodelabContext } from "../../lib/rag-context-builder";
import {
  buildExecutionAwareCodelabContext,
  formatExecutionContext,
  extractErrorInfo,
  determineErrorCategory,
  createDebuggingHint,
  createCelebrationMessage,
} from "../../lib/execution-context-builder";
import type { ExecutionResult } from "../../lib/execute-sandbox";
import { GEMINI_MODEL, getGeminiClient } from "../../lib/gemini";

const genAI = getGeminiClient();

function generateMockAnswer(action: string, language: string): string {
  const mockResponses: Record<string, string> = {
    hint: `Here's a hint: Think about the edge cases. What happens when the input is empty or contains only negative numbers? Try initializing your variable with the first element instead of a default value.`,
    debug: `**Problem Found:**\n\nYour code fails when all values are negative because you initialize with 0.\n\n**Why?**\nIf the input is [-5, -2], the function returns 0, which isn't in the list.\n\n**Fix:**\nInitialize with the first element: \`max_num = nums[0]\``,
    explain: `Your code finds the maximum value in a list using a loop. Here's how it works:\n\n1. Create a variable to store the maximum\n2. Loop through each number\n3. Update if we find a larger number\n4. Return the result`,
    optimize: `**Time Complexity:** O(n) - You visit each element once\n**Space Complexity:** O(1) - No extra space needed\n\nYour solution is already optimal for this problem!`,
    analyze: `Your code is well-structured but has one edge case issue. The logic is sound, but initialization should use the first element.`,
  };

  return mockResponses[action] || "I'm here to help! Try a hint, debug, or explanation.";
}

export async function POST(request: Request) {
  try {
    const {
      message,
      code,
      language = "python",
      problem,
      error,
      testResults,
      action,
      topic,
      difficulty,
      executionResult,
    } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400 }
      );
    }

    // Build CodeLab context - enhanced with execution results if available
    let codelabContext: CodelabContext;

    if (executionResult && typeof executionResult === 'object') {
      // Use execution-aware context builder when execution results are available
      codelabContext = buildExecutionAwareCodelabContext(
        { language, topic, difficulty, problem, code },
        executionResult as ExecutionResult,
        message
      );
    } else {
      // Fallback to basic context
      codelabContext = {
        language,
        topic,
        difficulty,
        problem,
        code,
        error,
        testResults,
        userQuestion: message,
      };
    }

    // Get RAG context with retrieved knowledge
    const ragContext = await buildCygnusContext(codelabContext);
    const ragPrompt = formatCygnusPrompt(ragContext);

    // Build enhanced system prompt with RAG knowledge and execution context
    let systemPrompt = `You are CYGNUS, Quasar AI's specialized coding intelligence and mentor.

Your role is to help programmers debug, understand, optimize, and improve their code.

GUIDELINES:
- Be concise but thorough
- Guide rather than immediately spoil solutions
- Provide hints first, then explanations if asked
- Use code examples when helpful
- Explain WHY code is broken, not just the fix
- Consider edge cases
- Format responses with markdown headings and code blocks
- When relevant knowledge is available, cite it appropriately
- Avoid revealing complete solutions unless explicitly asked
- Use the retrieved knowledge to enhance your explanations
- When debugging errors, focus on teaching the concept, not just the fix

QUICK ACTIONS:
- hint: Give a progressive hint without the full solution
- debug: Explain what's wrong and why, provide guidance on fixing it
- explain: Break down what code does line-by-line
- optimize: Analyze complexity and suggest improvements
- analyze: Review code quality overall

KNOWLEDGE BASE CONTEXT:
${ragPrompt}

CURRENT CHALLENGE:
${problem ? `Problem: ${problem}` : "The user is asking for help with their code."}
`;

    // Add execution context if available
    if (executionResult && typeof executionResult === 'object') {
      const execResult = executionResult as ExecutionResult;
      const executionContextStr = formatExecutionContext(execResult);
      const errorInfo = extractErrorInfo(execResult);

      systemPrompt += `

EXECUTION RESULT:
${executionContextStr}

ERROR DETAILS:
- Error Type: ${errorInfo.errorType}
- Is Recoverable: ${errorInfo.isRecoverable ? "Yes" : "No"}`;

      // Add specific debugging guidance based on error type
      if (errorInfo.hasError && errorInfo.isRecoverable) {
        const debuggingHint = createDebuggingHint(execResult, {
          language,
          topic,
          difficulty,
          problem,
          code,
        });
        systemPrompt += `

DEBUGGING GUIDANCE:
${debuggingHint}`;
      }
    } else if (error || testResults) {
      // Legacy error/testResults fields
      if (error) {
        systemPrompt += `

Current Error: ${error}`;
      }
      if (testResults) {
        systemPrompt += `

Test Results: ${testResults}`;
      }
    }

    systemPrompt += `

Respond in a professional, technical tone suitable for serious programmers.`;

    console.log("[CYGNUS] System prompt built, length:", systemPrompt.length);
    console.log(`[CYGNUS] Calling Gemini with model: ${GEMINI_MODEL}`);

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    console.log("[CYGNUS] Generating content...");
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    });

    const answer =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("[CYGNUS] Response generated, length:", answer.length);

    return new Response(
      JSON.stringify({ answer }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[CYGNUS] API Error:", errorMessage, error);

    return new Response(
      JSON.stringify({
        error: errorMessage || "Failed to generate response",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
