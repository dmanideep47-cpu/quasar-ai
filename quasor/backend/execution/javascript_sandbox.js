#!/usr/bin/env node

/**
 * Secure JavaScript Code Execution Sandbox
 *
 * This module provides isolated, sandboxed execution for user-submitted JavaScript code.
 * It enforces strict resource limits, timeout, and security restrictions.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function checkCodeSecurity(code) {
  /**
   * Perform static analysis to detect obvious security violations.
   */

  const dangerousPatterns = [
    'require(',
    'import ',
    'eval(',
    'Function(',
    'globalThis',
    'process',
    '__dirname',
    '__filename',
    'fs.',
    'child_process',
    'net.',
    'http.',
    'fetch(',
    'XMLHttpRequest',
  ];

  const codeLower = code.toLowerCase();

  for (const pattern of dangerousPatterns) {
    if (codeLower.includes(pattern.toLowerCase())) {
      return `Security violation: '${pattern}' is not allowed`;
    }
  }

  return null;
}

function createTestRunnerCode(userCode, testCases) {
  /**
   * Create a wrapper that executes user code with test cases and reports results.
   */

  const escapedTests = JSON.stringify(testCases);

  const runnerCode = `
try {
    // Execute user code in sandbox context
    ${userCode}
} catch (e) {
    if (e instanceof SyntaxError) {
        console.log(JSON.stringify({
            status: "syntax_error",
            error: e.message,
            line: e.lineno
        }));
        process.exit(1);
    } else {
        console.log(JSON.stringify({
            status: "runtime_error",
            error: e.message,
            stack: e.stack
        }));
        process.exit(1);
    }
}

// Run tests
const testCases = ${escapedTests};
let passed = 0;
let failed = 0;

for (const test of testCases) {
    try {
        const funcCall = test.input;
        const expected = String(test.expected);
        
        // Evaluate the function call in the current context
        let result = eval(funcCall);
        const resultStr = String(result);
        
        if (resultStr === expected) {
            passed++;
        } else {
            failed++;
        }
    } catch (e) {
        failed++;
    }
}

// Report results
console.log(JSON.stringify({
    status: failed === 0 ? "passed" : "failed",
    passed: passed,
    failed: failed,
    total: testCases.length
}));
`;

  return runnerCode;
}

function executeJavaScriptCode(code, testCases = [], timeoutSeconds = 5) {
  /**
   * Execute JavaScript code in a VM sandbox with strict resource limits.
   */

  const result = {
    success: false,
    status: 'unknown',
    stdout: '',
    stderr: '',
    executionTimeMs: 0,
    tests: { passed: 0, failed: 0, total: 0 },
  };

  const startTime = Date.now();

  // Check for security violations
  const securityError = checkCodeSecurity(code);
  if (securityError) {
    result.status = 'security_error';
    result.errorType = 'SECURITY_VIOLATION';
    result.errorMessage = securityError;
    result.success = false;
    return result;
  }

  try {
    const timeoutMs = timeoutSeconds * 1000;

    // Create sandbox context
    const sandbox = {
      console: {
        log: (...args) => {
          result.stdout += args.map(a => String(a)).join(' ') + '\n';
        },
        error: (...args) => {
          result.stderr += args.map(a => String(a)).join(' ') + '\n';
        },
      },
    };

    // Prepare code to execute
    let execCode = code;
    if (testCases && testCases.length > 0) {
      execCode = createTestRunnerCode(code, testCases);
    }

    // Create and run VM script with timeout
    const script = new vm.Script(execCode, { timeout: timeoutMs });

    try {
      script.runInNewContext(sandbox, { timeout: timeoutMs });

      // Parse results
      if (testCases && testCases.length > 0 && result.stdout) {
        try {
          const lines = result.stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];

          if (lastLine.startsWith('{')) {
            const testResult = JSON.parse(lastLine);
            result.status = testResult.status || 'unknown';
            result.tests.passed = testResult.passed || 0;
            result.tests.failed = testResult.failed || 0;
            result.tests.total = testCases.length;

            if (result.status === 'passed') {
              result.success = true;
            } else if (result.status === 'syntax_error') {
              result.errorType = 'SYNTAX_ERROR';
              result.errorMessage = testResult.error || '';
            } else if (result.status === 'runtime_error') {
              result.errorType = 'RUNTIME_ERROR';
              result.errorMessage = testResult.error || '';
            }
          } else {
            result.status = 'failed';
            result.tests.total = testCases.length;
          }
        } catch (e) {
          result.status = 'failed';
          result.errorType = 'PARSE_ERROR';
          result.errorMessage = `Could not parse test results: ${e instanceof Error ? e.message : 'Unknown error'}`;
          result.tests.total = testCases.length || 0;
        }
      } else {
        // No test cases, just check if code ran successfully
        result.status = 'passed';
        result.success = true;
      }
    } catch (e) {
      if (e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
        result.status = 'timeout';
        result.errorType = 'TIMEOUT';
        result.errorMessage = `Code execution exceeded ${timeoutSeconds} second limit`;
        result.success = false;
      } else if (e instanceof SyntaxError) {
        result.status = 'syntax_error';
        result.errorType = 'SYNTAX_ERROR';
        result.errorMessage = e.message;
        result.success = false;
      } else {
        result.status = 'runtime_error';
        result.errorType = 'RUNTIME_ERROR';
        result.errorMessage = e.message || String(e);
        result.success = false;
      }
    }
  } catch (e) {
    result.status = 'runtime_error';
    result.errorType = 'EXECUTION_ERROR';
    result.errorMessage = e.message || String(e);
    result.success = false;
  }

  // Limit output size
  result.stdout = result.stdout.slice(0, 5000);
  result.stderr = result.stderr.slice(0, 5000);

  result.executionTimeMs = Date.now() - startTime;
  return result;
}

// Main execution
if (require.main === module) {
  let inputData = '';

  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => {
    inputData += chunk;
  });

  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(inputData);
      const code = input.code || '';
      const testCases = input.testCases || [];
      const timeout = input.timeoutSeconds || 5;

      if (!code) {
        console.log(
          JSON.stringify({
            success: false,
            status: 'error',
            errorMessage: 'No code provided',
            stdout: '',
            stderr: '',
            executionTimeMs: 0,
            tests: { passed: 0, failed: 0, total: 0 },
          })
        );
      } else {
        const result = executeJavaScriptCode(code, testCases, timeout);
        console.log(JSON.stringify(result));
      }
    } catch (e) {
      console.log(
        JSON.stringify({
          success: false,
          status: 'error',
          errorMessage: `Invalid input: ${e instanceof Error ? e.message : 'Unknown error'}`,
          stdout: '',
          stderr: '',
          executionTimeMs: 0,
          tests: { passed: 0, failed: 0, total: 0 },
        })
      );
    }
  });
}

module.exports = { executeJavaScriptCode, checkCodeSecurity };
