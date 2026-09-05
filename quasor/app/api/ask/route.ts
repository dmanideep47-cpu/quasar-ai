import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL } from "../../lib/gemini";
import { buildCygnusContext, formatCygnusPrompt } from "../../lib/rag-context-builder";

function generateMockAnswer(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes("reverse") || lower.includes("array")) {
    return `To reverse an array in place, you use a **two-pointer approach** where you swap elements from both ends moving toward the center.

## Algorithm

**1. Initialize two pointers**
- left = 0 (start of array)
- right = array.length - 1 (end of array)

**2. Swap and move**
While left < right:
- Swap array[left] with array[right]
- Move left pointer forward (left++)
- Move right pointer backward (right--)

**3. Stop when pointers meet**
When left >= right, the array is fully reversed.

## Time & Space Complexity
- **Time:** O(n) — each element visited once
- **Space:** O(1) — no extra space needed (in-place)

## Example

\`\`\`
Input:  [1, 2, 3, 4, 5]
Step 1: [5, 2, 3, 4, 1]  (swap 1 and 5)
Step 2: [5, 4, 3, 2, 1]  (swap 2 and 4)
Done:   [5, 4, 3, 2, 1]
\`\`\`

This is the most efficient in-place reversal method.`;
  }
  
  if (lower.includes("2+2")) {
    return `The answer to 2 + 2 is **4**.

## Why?

Addition combines two quantities. When you have 2 objects and add 2 more objects, you now have 4 total objects.

## Verification

Using the number line:
- Start at 2
- Move 2 steps forward
- Land on 4

Therefore: **2 + 2 = 4**`;
  }
  
  if (lower.includes("hello")) {
    return `Hello! 👋 I'm LYRA, your AI tutor here in Quasor.

I'm ready to help you with:
- **Math problems** — algebra, calculus, geometry, statistics
- **Programming** — code explanations, debugging, algorithms
- **Physics & Chemistry** — concepts, formulas, problem-solving
- **General concepts** — clear explanations with examples

Just ask me anything and I'll give you clear, step-by-step answers with working examples.

What would you like to learn?`;
  }
  
  return `## Your Question

"${message}"

I'm currently in **demo mode** while the AI service recovers from high demand. 

To get a real answer once the service is back:
1. Try asking again in a few moments
2. Or rephrase your question

Real responses will appear here with full explanations, code examples, and step-by-step breakdowns following the tutor format you configured.

**The system is fully set up** — just waiting for the API to recover! 🔄`;
}

export async function POST(req: NextRequest) {
  console.log("=== API POST called ===");
  
  try {
    console.log("Parsing request body...");
    const body = await req.json().catch(() => null);
    console.log("Body parsed:", body);
    
    const message = body?.message?.trim();
    if (!message) {
      console.log("No valid message provided");
      return NextResponse.json(
        { error: "A non-empty message is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("No API key");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from .env.local." },
        { status: 500 },
      );
    }

    // Use the shared retrieval path for Workspace questions as well. Retrieval
    // failures remain non-fatal so Gemini can still answer from its base model.
    const ragContext = await buildCygnusContext({
      language: "",
      userQuestion: message,
    });
    const ragPrompt = formatCygnusPrompt(ragContext);

    console.log(`Calling Gemini API with ${GEMINI_MODEL}...`);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ 
              text: `You are an excellent educational AI tutor for university computing students. Your job is to give crystal-clear, step-by-step answers with a friendly but professional tone.

RESPONSE STRUCTURE (MANDATORY):
1. Start with 1–2 sentences that DIRECTLY answer the core question. If it's a math problem, state the final numeric/analytic answer here.
2. Then explain in sections using:
   - Markdown headers: ## for main sections, ### for subsections
   - Numbered steps for procedures (math, coding, algorithms)
   - Bullet points for lists of facts, features, or tips
   - Short, clear sentences; avoid unnecessary jargon
   - For math: rearrange into standard form, name the method, show key intermediate steps
3. Tone: Assume the user is beginner to lower-intermediate. Be practical and visual; use small examples when helpful. Never mention internal tools, models, or your reasoning process.
4. Ending: Do NOT add generic summaries like "In conclusion...". Just end naturally after the final result or key takeaway.

RESPONSE FORMAT:
Return ONLY plain text markdown (no JSON, no code fences, no special markers). The text should be directly readable and follow the structure above exactly.

RETRIEVED KNOWLEDGE:
${ragPrompt}
`
            }],
          },
          generationConfig: { responseMimeType: "text/plain" },
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    console.log("Gemini response status:", response.status);
    const textBody = await response.text();
    console.log("Response text length:", textBody.length);
    console.log("Response first 100 chars:", textBody.substring(0, 100));

    if (!response.ok) {
      let apiError = "Gemini API request failed.";
      try {
        const errorData = JSON.parse(textBody);
        apiError = errorData?.error?.message || apiError;
      } catch {
        // Keep the stable message when Gemini returns a non-JSON error body.
      }
      console.error("API error response:", apiError);
      return NextResponse.json({ error: apiError }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(textBody);
    } catch (e) {
      console.error("Failed to parse as JSON:", e);
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const answerText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Answer text first 100 chars:", answerText.substring(0, 100));

    if (!answerText) {
      console.log("No answer text in response");
      return NextResponse.json({ error: "No answer" }, { status: 500 });
    }

    return NextResponse.json({ answer: answerText });
  } catch (error) {
    console.error("CAUGHT ERROR:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// Health check endpoint for the UI to poll backend availability
export async function GET() {
  try {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}