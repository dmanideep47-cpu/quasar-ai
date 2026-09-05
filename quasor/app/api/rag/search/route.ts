import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/**
 * POST /api/rag/search
 * 
 * Performs semantic search on CodeLab knowledge base.
 * 
 * Body:
 * {
 *   "query": "How do I access items in a list?",
 *   "language": "python",           // optional
 *   "category": "data-structures",  // optional
 *   "topic": "lists",               // optional
 *   "difficulty": "beginner",       // optional
 *   "limit": 5                      // optional (default: 5)
 * }
 * 
 * Response:
 * {
 *   "query": "...",
 *   "filters": {...},
 *   "results": [
 *     {
 *       "chunk_id": "...",
 *       "text": "...",
 *       "score": 0.91,
 *       "metadata": {...}
 *     }
 *   ],
 *   "count": 5
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language, category, topic, difficulty, limit = 5 } = body;

    // Validate query
    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Build search request for Python backend
    const searchParams = {
      query: query.trim(),
      ...(language && { language }),
      ...(category && { category }),
      ...(topic && { topic }),
      ...(difficulty && { difficulty }),
      limit: Math.min(Math.max(limit, 1), 20), // Clamp between 1-20
    };

    // Call Python retrieval service
    const result = await callRetrievalService(searchParams);

    if (result.error) {
      console.error("[RAG] Retrieval error:", result.error);
      return NextResponse.json(
        { error: result.error || "Retrieval failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[RAG] API error:", errorMessage);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Call Python retrieval service via subprocess.
 * This is a synchronous call that runs the Python script.
 */
function callRetrievalService(
  params: Record<string, any>
): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    try {
      // Get the Python script path
      const scriptPath = path.join(
        process.cwd(),
        "backend",
        "rag",
        "retrieval",
        "retrieval_cli.py"
      );

      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        resolve({
          error: "Retrieval service not available",
          results: [],
        });
        return;
      }

      // Get environment variables
      const env = {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
        DB_HOST: process.env.DB_HOST || "localhost",
        DB_PORT: process.env.DB_PORT || "5432",
        DB_USER: process.env.DB_USER || "postgres",
        DB_PASSWORD: process.env.DB_PASSWORD || "",
        DB_NAME: process.env.DB_NAME || "quasor",
      };

      // Spawn Python process
      const python = spawn("python", [scriptPath], { env });

      let output = "";
      let errorOutput = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      let settled = false;
      const finish = (result: Record<string, any>) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      python.on("close", (code) => {
        if (code !== 0) {
          console.error("[RAG] Python error:", errorOutput);
          try {
            const errorResult = JSON.parse(output);
            finish({
              ...errorResult,
              error:
                errorResult.error ||
                errorOutput.trim() ||
                "Retrieval service failed",
            });
          } catch {
            finish({
              error: errorOutput.trim() || "Retrieval service failed",
              results: [],
            });
          }
          return;
        }

        try {
          // Parse JSON output from Python script
          const result = JSON.parse(output);
          finish(result);
        } catch {
          console.error("[RAG] JSON parse error:", output);
          finish({
            error: "Failed to parse retrieval results",
            results: [],
          });
        }
      });

      // Send parameters as JSON to stdin
      python.stdin.write(JSON.stringify(params));
      python.stdin.end();

      // Timeout after 30 seconds
      setTimeout(() => {
        if (settled) return;
        python.kill();
        finish({
          error: "Retrieval service timeout",
          results: [],
        });
      }, 30000);
    } catch (error) {
      console.error("[RAG] Subprocess error:", error);
      resolve({
        error: "Failed to call retrieval service",
        results: [],
      });
    }
  });
}
