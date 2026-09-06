import { NextRequest, NextResponse } from "next/server";
import { buildCygnusContext, formatCygnusPrompt } from "../../lib/rag-context-builder";
import { generateAIResponse } from "../../lib/ai/router";
import type { AIContentPart, AIMessage } from "../../lib/ai/types";

function mayBeIncomplete(answer: string) {
  const text = answer.trim();
  if (text.length < 500) return false;
  const displayMathIsOpen = (text.match(/\$\$/g) || []).length % 2 !== 0;
  const inlineMathIsOpen = (text.match(/(?<!\$)\$(?!\$)/g) || []).length % 2 !== 0;
  return (
    displayMathIsOpen ||
    inlineMathIsOpen ||
    !/[.!?:;)\]}]$/.test(text) &&
      !text.endsWith("```") &&
      !text.endsWith("$$")
  );
}

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
  try {
    const body = await req.json().catch(() => null);
    const message = body?.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "A non-empty message is required." },
        { status: 400 },
      );
    }

    const attachments = Array.isArray(body?.attachments)
      ? body.attachments.filter(
          (item: unknown): item is {
            name: string;
            type: string;
            dataUrl?: string;
            text?: string;
          } =>
            !!item &&
            typeof item === "object" &&
            typeof (item as { name?: unknown }).name === "string" &&
            typeof (item as { type?: unknown }).type === "string" &&
            (!("dataUrl" in item) || typeof (item as { dataUrl?: unknown }).dataUrl === "string") &&
            (!("text" in item) || typeof (item as { text?: unknown }).text === "string"),
        )
      : [];

    const userParts: AIContentPart[] = [{ type: "text", text: message }];
    for (const attachment of attachments.slice(0, 4)) {
      if (attachment.text?.trim()) {
        userParts.push({
          type: "text",
          text: `Attached document "${attachment.name}":\n${attachment.text.slice(0, 120_000)}`,
        });
      } else if (attachment.dataUrl?.startsWith("data:image/")) {
        userParts.push({
          type: "image_url",
          image_url: { url: attachment.dataUrl },
        });
      } else if (attachment.dataUrl?.startsWith("data:")) {
        const encoded = attachment.dataUrl.split(",", 2)[1];
        if (encoded) {
          userParts.push({
            type: "file",
            mimeType: attachment.type,
            data: encoded,
          });
        }
      }
    }

    // Use the shared retrieval path for Workspace questions as well. Retrieval
    // failures remain non-fatal so Gemini can still answer from its base model.
    const ragContext = await buildCygnusContext({
      language: "",
      userQuestion: message,
    });
    const ragPrompt = formatCygnusPrompt(ragContext);

    const systemPrompt = `You are an excellent educational AI tutor for university computing students. Your job is to give crystal-clear, step-by-step answers with a friendly but professional tone.

RESPONSE STRUCTURE (MANDATORY):
1. Start with 1–2 sentences that DIRECTLY answer the core question. If it's a math problem, state the final numeric/analytic answer here.
2. Then explain in sections using:
   - Markdown headers: ## for main sections, ### for subsections
   - Numbered steps for procedures (math, coding, algorithms)
   - Bullet points for lists of facts, features, or tips
   - Short, clear sentences; avoid unnecessary jargon
   - For math and physics: define every symbol before using it, derive equations step by step, and use display LaTeX delimiters ($$...$$) for important equations
3. Visual teaching rule: For mathematics, physics, geometry, trigonometry, coordinate graphs, functions, or spatial relationships, include a clearly labeled "## Visual Intuition" section whenever a diagram would help. Put a simple, accurate ASCII diagram inside a fenced text block so spacing is preserved. Label axes, points, forces, distances, angles, or directions as appropriate, then explain the diagram in 1–3 sentences. Do not invent diagrams for unrelated questions or use a diagram instead of the derivation.
4. Tone: Assume the user is beginner to lower-intermediate. Be practical and visual; use small examples when helpful. Never mention internal tools, models, or your reasoning process.
5. For mechanics problems, explicitly state the geometry, constraint, kinetic energy, potential energy, Lagrangian, Euler-Lagrange equation, equilibrium approximation, and final frequency. Explain each step in beginner-friendly language. Never output raw LaTeX commands outside math delimiters.
6. Ending: Do NOT add generic summaries like "In conclusion...". Just end naturally after the final result or key takeaway. Always finish the final sentence, equation, and ASCII diagram.

RESPONSE FORMAT:
Return ONLY plain text markdown (no JSON or special markers). Fenced text blocks are allowed and required for ASCII diagrams. Keep every diagram and equation complete.

RETRIEVED KNOWLEDGE:
${ragPrompt}
`;
    const messages: AIMessage[] = [{ role: "user", content: userParts }];
    const result = await generateAIResponse({
      provider: "auto",
      task: "academic",
      systemPrompt,
      messages,
      temperature: 0.4,
      maxTokens: 5000,
    });

    let answer = result.answer;
    if (
      result.finishReason === "MAX_TOKENS" ||
      result.finishReason === "length" ||
      mayBeIncomplete(result.answer)
    ) {
      const continuation = await generateAIResponse({
        provider: "auto",
        task: "academic",
        systemPrompt: `${systemPrompt}

Continue the answer below. Do not restart or repeat it. Begin exactly where it stopped and finish the explanation naturally.`,
        messages: [
          { role: "user", content: userParts },
          { role: "assistant", content: result.answer },
          { role: "user", content: "Continue from the last incomplete sentence and finish the solution." },
        ],
        temperature: 0.3,
        maxTokens: 3000,
      });
      answer = `${result.answer}\n\n${continuation.answer}`;
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("CAUGHT ERROR:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Quasar couldn't reach its AI services right now. Please try again shortly." },
      { status: 503 },
    );
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