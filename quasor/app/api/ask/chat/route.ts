import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL } from "../../../lib/gemini";

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

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/` +
      `models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
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

RESPONSE FORMAT: Return ONLY plain text markdown (no JSON, no code fences, no special markers). The text should be directly readable and follow the structure above exactly.`,
            },
          ],
        },

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

        generationConfig: {
          responseMimeType: "text/plain",
          temperature: 0.4,
        },
      }),
    });

    let data;
    try {
      const text = await response.text();
      console.log("Gemini raw text response:", text.substring(0, 300));
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", parseErr);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Gemini API request failed.",
        },
        { status: response.status }
      );
    }

    const rawAnswer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim();

    if (!rawAnswer) {
      console.error(
        "Gemini returned no text"
      );

      return NextResponse.json(
        {
          error: "Gemini returned an empty response.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer: rawAnswer,
    });
  } catch (error) {
    console.error("Quasar API error:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing your question.",
      },
      { status: 500 }
    );
  }
}