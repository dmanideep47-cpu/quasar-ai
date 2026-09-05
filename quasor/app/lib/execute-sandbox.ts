import { spawn } from 'child_process';
import { resolve as resolvePath } from 'path';
import { execSync } from 'child_process';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';

export type ExecutionLanguage = 'python' | 'javascript' | 'java';

export interface TestCase {
  input: string;
  expected: string;
}

export interface ExecutionRequest {
  code: string;
  language: ExecutionLanguage;
  testCases?: TestCase[];
  timeoutSeconds?: number;
}

export interface ExecutionResult {
  success: boolean;
  status: 'passed' | 'failed' | 'syntax_error' | 'runtime_error' | 'timeout' | 'memory_limit' | 'output_limit' | 'security_error' | 'error';
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  tests: {
    passed: number;
    failed: number;
    total: number;
  };
  errorType?: string;
  errorMessage?: string;
}

/**
 * Execute user code in an isolated sandbox
 */
export async function executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
  const {
    code,
    language,
    testCases = [],
    timeoutSeconds = 5,
  } = request;

  // Validate inputs
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      status: 'error',
      stdout: '',
      stderr: 'No code provided',
      executionTimeMs: 0,
      tests: { passed: 0, failed: 0, total: 0 },
      errorMessage: 'No code provided',
    };
  }

  if (language !== 'python' && language !== 'javascript' && language !== 'java') {
    return {
      success: false,
      status: 'error',
      stdout: '',
      stderr: `Unsupported language: ${language}`,
      executionTimeMs: 0,
      tests: { passed: 0, failed: 0, total: 0 },
      errorMessage: `Unsupported language: ${language}`,
    };
  }

  try {
    if (language === 'python') {
      return await executePython(code, testCases, timeoutSeconds);
    } else if (language === 'javascript') {
      return await executeJavaScript(code, testCases, timeoutSeconds);
    } else {
      return await executeJava(code, timeoutSeconds);
    }

    async function executeJava(code: string, timeoutSeconds: number): Promise<ExecutionResult> {
      const startTime = Date.now();
      let directory = "";
      try {
        execSync("java -version", { stdio: "ignore" });
        directory = await mkdtemp(resolvePath(tmpdir(), "quasor-java-"));
        const source = /\bclass\s+Main\b/.test(code)
          ? code
          : `public class Main { public static void main(String[] args) { ${code} } }`;
        const sourcePath = resolvePath(directory, "Main.java");
        await writeFile(sourcePath, source, "utf8");
        execSync(`javac "${sourcePath}"`, { cwd: directory, timeout: timeoutSeconds * 1000 });
        const result = await runProcess("java", ["-cp", directory, "Main"], timeoutSeconds);
        return {
          success: result.code === 0,
          status: result.code === 0 ? "passed" : "runtime_error",
          stdout: result.stdout,
          stderr: result.stderr,
          executionTimeMs: Date.now() - startTime,
          tests: { passed: result.code === 0 ? 1 : 0, failed: result.code === 0 ? 0 : 1, total: 1 },
          errorMessage: result.code === 0 ? undefined : result.stderr || "Java execution failed",
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Java is not installed or execution failed";
        return {
          success: false,
          status: "error",
          stdout: "",
          stderr: message,
          executionTimeMs: Date.now() - startTime,
          tests: { passed: 0, failed: 1, total: 1 },
          errorMessage: message,
        };
      } finally {
        if (directory) await rm(directory, { recursive: true, force: true });
      }
    }

    function runProcess(command: string, args: string[], timeoutSeconds: number) {
      return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
        const child = spawn(command, args, { timeout: timeoutSeconds * 1000 });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (data) => { stdout += data.toString(); });
        child.stderr.on("data", (data) => { stderr += data.toString(); });
        child.on("error", reject);
        child.on("close", (code) => resolve({ code, stdout, stderr }));
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      status: 'error',
      stdout: '',
      stderr: errorMessage,
      executionTimeMs: 0,
      tests: { passed: 0, failed: 0, total: 0 },
      errorMessage,
    };
  }
}

/**
 * Execute Python code via python_sandbox.py
 */
async function executePython(
  code: string,
  testCases: TestCase[],
  timeoutSeconds: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    // Resolve to the actual backend/execution directory, not the compiled location
    const sandboxPath = resolvePath(process.cwd(), "backend", "execution", "python_sandbox.py");

    const input = JSON.stringify({
      code,
      testCases,
      timeoutSeconds,
    });

    const startTime = Date.now();

    try {
      // Check if Python is available
      try {
        execSync('python --version', { stdio: 'ignore' });
      } catch {
        return resolve({
          success: false,
          status: 'error',
          stdout: '',
          stderr: 'Python is not installed or not in PATH',
          executionTimeMs: Date.now() - startTime,
          tests: { passed: 0, failed: 0, total: 0 },
          errorMessage: 'Python is not installed',
        });
      }

      const process = spawn('python', [sandboxPath], {
        timeout: (timeoutSeconds + 2) * 1000, // Add 2 second buffer
      });

      let stdout = '';
      let stderr = '';

      process.stdout!.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr!.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          status: 'error',
          stdout,
          stderr: error.message,
          executionTimeMs: Date.now() - startTime,
          tests: { passed: 0, failed: 0, total: testCases.length },
          errorMessage: error.message,
        });
      });

      process.on('close', (code) => {
        const executionTimeMs = Date.now() - startTime;

        try {
          // Parse JSON response
          if (stdout.trim()) {
            const result = JSON.parse(stdout.trim());
            result.executionTimeMs = executionTimeMs;
            return resolve(result as ExecutionResult);
          } else {
            resolve({
              success: false,
              status: 'error',
              stdout,
              stderr: stderr || 'No output from sandbox',
              executionTimeMs,
              tests: { passed: 0, failed: 0, total: testCases.length },
              errorMessage: 'No output from sandbox',
            });
          }
        } catch (parseError) {
          resolve({
            success: false,
            status: 'error',
            stdout,
            stderr: stderr || (parseError instanceof Error ? parseError.message : 'Parse error'),
            executionTimeMs,
            tests: { passed: 0, failed: 0, total: testCases.length },
            errorMessage: 'Failed to parse sandbox response',
          });
        }
      });

      // Send input to process
      process.stdin!.write(input);
      process.stdin!.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      resolve({
        success: false,
        status: 'error',
        stdout: '',
        stderr: errorMessage,
        executionTimeMs: Date.now() - startTime,
        tests: { passed: 0, failed: 0, total: testCases.length },
        errorMessage,
      });
    }
  });
}

/**
 * Execute JavaScript code via javascript_sandbox.js
 */
async function executeJavaScript(
  code: string,
  testCases: TestCase[],
  timeoutSeconds: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const sandboxPath = resolvePath(process.cwd(), "backend", "execution", "javascript_sandbox.js");

    const input = JSON.stringify({
      code,
      testCases,
      timeoutSeconds,
    });

    const startTime = Date.now();

    try {
      const process = spawn('node', [sandboxPath], {
        timeout: (timeoutSeconds + 2) * 1000, // Add 2 second buffer
      });

      let stdout = '';
      let stderr = '';

      process.stdout!.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr!.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          status: 'error',
          stdout,
          stderr: error.message,
          executionTimeMs: Date.now() - startTime,
          tests: { passed: 0, failed: 0, total: testCases.length },
          errorMessage: error.message,
        });
      });

      process.on('close', (code) => {
        const executionTimeMs = Date.now() - startTime;

        try {
          // Parse JSON response - JavaScript sandbox outputs JSON directly
          if (stdout.trim()) {
            // JavaScript sandbox outputs JSON on console.log
            const lines = stdout.trim().split('\n');
            let jsonLine = '';

            // Find the last JSON line (in case there's other output)
            for (let i = lines.length - 1; i >= 0; i--) {
              if (lines[i].trim().startsWith('{')) {
                jsonLine = lines[i];
                break;
              }
            }

            if (jsonLine) {
              const result = JSON.parse(jsonLine);
              result.executionTimeMs = executionTimeMs;
              return resolve(result as ExecutionResult);
            }
          }

          resolve({
            success: false,
            status: 'error',
            stdout,
            stderr: stderr || 'No output from sandbox',
            executionTimeMs,
            tests: { passed: 0, failed: 0, total: testCases.length },
            errorMessage: 'No output from sandbox',
          });
        } catch (parseError) {
          resolve({
            success: false,
            status: 'error',
            stdout,
            stderr: stderr || (parseError instanceof Error ? parseError.message : 'Parse error'),
            executionTimeMs,
            tests: { passed: 0, failed: 0, total: testCases.length },
            errorMessage: 'Failed to parse sandbox response',
          });
        }
      });

      // Send input to process
      process.stdin!.write(input);
      process.stdin!.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      resolve({
        success: false,
        status: 'error',
        stdout: '',
        stderr: errorMessage,
        executionTimeMs: Date.now() - startTime,
        tests: { passed: 0, failed: 0, total: testCases.length },
        errorMessage,
      });
    }
  });
}
