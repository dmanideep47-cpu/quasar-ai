import { executeCode } from "../../lib/execute-sandbox";
import type { ExecutionLanguage } from "../../lib/execute-sandbox";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, language, testCases, timeoutSeconds = 5 } = body;

    // Validate required fields
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Code is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!language || !["python", "javascript", "java", "sql"].includes(language)) {
      return new Response(
        JSON.stringify({ error: "Valid language is required (python, javascript, java, or sql)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // SQL execution not yet supported
    if (language === "sql") {
      return new Response(
        JSON.stringify({
          success: false,
          status: "error",
          stdout: "",
          stderr: "SQL execution is not yet available",
          executionTimeMs: 0,
          tests: { passed: 0, failed: 0, total: 0 },
          errorMessage: "SQL execution is not yet available",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Execute code in sandbox
    const result = await executeCode({
      code,
      language: language as ExecutionLanguage,
      testCases: testCases || [],
      timeoutSeconds:
        typeof timeoutSeconds === "number" && Number.isFinite(timeoutSeconds)
          ? Math.min(Math.max(timeoutSeconds, 1), 10)
          : 5,
    });

    // Log execution for monitoring (but don't expose sensitive data)
    console.log(`[Execution] ${language} - ${result.status} - ${result.executionTimeMs}ms`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Execute API Error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        stdout: "",
        stderr: errorMessage,
        executionTimeMs: 0,
        tests: { passed: 0, failed: 0, total: 0 },
        errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
