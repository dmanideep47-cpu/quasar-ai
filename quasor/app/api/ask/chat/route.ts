import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "../../../lib/ai/router";

function mayBeIncomplete(answer: string) {
  const text = answer.trim();
  if (text.length < 500) return false;
  return !/[.!?:;)\]}]$/.test(text) && !text.endsWith("```") && !text.endsWith("$$");
}

function parseAnswer(rawText: string, question: string) {
  let text = rawText.trim();

  // Remove markdown JSON fences if Gemini adds them
  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/i, "");
  text = text.replace(/\s*```$/i, "");
  text = text.trim();

  try {
    const parsed = JSON.parse(text);

    return {
      type: parsed?.type || "general",
      question: parsed?.question || question,
      summary: parsed?.summary || "",
      steps: Array.isArray(parsed?.steps) ? parsed.steps : [],
      given: Array.isArray(parsed?.given) ? parsed.given : [],
      find: Array.isArray(parsed?.find) ? parsed.find : [],
      keyValues: Array.isArray(parsed?.keyValues)
        ? parsed.keyValues
        : [],
      graph:
        parsed?.graph && typeof parsed.graph === "object"
          ? parsed.graph
          : { enabled: false },
      verification: Array.isArray(parsed?.verification)
        ? parsed.verification
        : [],
      finalAnswer:
        parsed?.finalAnswer ||
        parsed?.summary ||
        "I couldn't generate an answer.",
      concept: parsed?.concept || "",
      explanation: parsed?.explanation || "",
      code: parsed?.code || "",
      codeLanguage: parsed?.codeLanguage || "typescript",
      diagram:
        parsed?.diagram &&
        typeof parsed.diagram === "object"
          ? parsed.diagram
          : undefined,
    };
  } catch {
    // If Gemini returns normal text instead of JSON,
    // don't lose the answer.
    return {
      type: "general",
      question,
      summary: text,
      steps: [],
      given: [],
      find: [],
      keyValues: [],
      graph: { enabled: false },
      verification: [],
      finalAnswer: text,
      concept: "",
      explanation: text,
      code: "",
      codeLanguage: "typescript",
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const history = Array.isArray(body?.messages)
      ? body.messages.filter(
          (item: unknown): item is { role: "user" | "assistant"; content: string } =>
            !!item &&
            typeof item === "object" &&
            ((item as { role?: unknown }).role === "user" ||
              (item as { role?: unknown }).role === "assistant") &&
            typeof (item as { content?: unknown }).content === "string" &&
            (item as { content: string }).content.trim().length > 0,
        )
      : [];

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const result = await generateAIResponse({
      provider: "auto",
      task: "academic",
      systemPrompt: `You are an excellent educational AI tutor for university computing students. Your job is to give crystal-clear, step-by-step answers with a friendly but professional tone.

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

RESPONSE FORMAT: Return ONLY plain text markdown (no JSON or special markers). Fenced text blocks are allowed and required for ASCII diagrams. Keep every diagram and equation complete.`,
      messages: history.length > 0
        ? history
        : [{ role: "user", content: message }],
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
        systemPrompt: `Continue the previous answer without repeating it. Finish the explanation naturally and never stop mid-sentence.`,
        messages: [
          ...history,
          { role: "assistant", content: result.answer },
          { role: "user", content: "Continue from the last incomplete sentence and finish the solution." },
        ],
        temperature: 0.3,
        maxTokens: 3000,
      });
      answer = `${result.answer}\n\n${continuation.answer}`;
    }

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    console.error("Quasar API error:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: "Quasar couldn't reach its AI services right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}