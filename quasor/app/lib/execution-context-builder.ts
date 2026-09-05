/**
 * Execution Context Builder for Cygnus
 * 
 * Integrates code execution results into Cygnus context.
 * 
 * FLOW:
 * 1. User runs code → ExecutionResult
 * 2. Cygnus analyzes error + code + test results
 * 3. RAG retrieval triggered by error type
 * 4. Cygnus provides targeted debugging assistance
 */

import { ExecutionResult } from './execute-sandbox';
import type { CodelabContext } from './rag-context-builder';

export interface CodeLabState {
  language: string;
  topic?: string;
  difficulty?: string;
  problem?: string;
  code: string;
  selectedCode?: string;
}

export interface ExecutionContextData {
  state: CodeLabState;
  executionResult: ExecutionResult;
}

/**
 * Extract error information from execution result
 */
export function extractErrorInfo(result: ExecutionResult): {
  hasError: boolean;
  errorType: string;
  errorMessage: string;
  isRecoverable: boolean;
} {
  const hasError = !result.success || result.status !== 'passed';
  
  let errorType: string = result.status;
  let errorMessage = '';
  let isRecoverable = true;

  if (result.status === 'syntax_error') {
    errorType = 'SyntaxError';
    errorMessage = result.errorMessage || result.stderr || 'Syntax error in code';
    isRecoverable = true;
  } else if (result.status === 'runtime_error') {
    errorType = 'RuntimeError';
    errorMessage = result.errorMessage || result.stderr || 'Runtime error occurred';
    isRecoverable = true;
  } else if (result.status === 'timeout') {
    errorType = 'TimeoutError';
    errorMessage = 'Code execution exceeded time limit (likely infinite loop)';
    isRecoverable = true;
  } else if (result.status === 'security_error') {
    errorType = 'SecurityError';
    errorMessage = result.errorMessage || 'Code violates security restrictions';
    isRecoverable = false;
  } else if (result.status === 'failed') {
    errorType = 'TestFailure';
    errorMessage = `${result.tests.failed} test(s) failed out of ${result.tests.total}`;
    isRecoverable = true;
  }

  return {
    hasError,
    errorType,
    errorMessage,
    isRecoverable,
  };
}

/**
 * Determine if error suggests a specific category for RAG retrieval
 */
export function determineErrorCategory(
  errorType: string,
  errorMessage: string,
  topic?: string
): string {
  const lowerError = errorMessage.toLowerCase();

  // Specific error type patterns
  if (errorType.includes('IndexError') || lowerError.includes('index')) {
    return 'debugging';
  }
  if (errorType.includes('KeyError') || lowerError.includes('key')) {
    return 'debugging';
  }
  if (errorType.includes('TypeError') || lowerError.includes('type')) {
    return 'debugging';
  }
  if (errorType.includes('ValueError') || lowerError.includes('value')) {
    return 'debugging';
  }
  if (errorType.includes('NameError') || lowerError.includes('not defined')) {
    return 'debugging';
  }
  if (errorType === 'TimeoutError') {
    return 'algorithms'; // Likely infinite loop or inefficient code
  }
  if (errorType === 'SyntaxError') {
    return 'fundamentals'; // Basic syntax help
  }

  // Fallback to topic-based category
  if (topic === 'lists' || topic === 'tuples' || topic === 'dictionaries' || topic === 'sets') {
    return 'data-structures';
  }
  if (topic === 'functions' || topic === 'lambda') {
    return 'functions';
  }
  if (topic === 'classes' || topic === 'inheritance') {
    return 'oop';
  }
  if (topic === 'searching' || topic === 'sorting' || topic === 'recursion') {
    return 'algorithms';
  }

  return 'fundamentals';
}

/**
 * Build retrieval query from execution error
 */
export function buildErrorRetrievalQuery(
  result: ExecutionResult,
  state: CodeLabState
): string {
  const errorInfo = extractErrorInfo(result);
  const parts: string[] = [];

  if (errorInfo.errorMessage) {
    parts.push(errorInfo.errorMessage);
  }

  if (errorInfo.errorType) {
    parts.push(`Error type: ${errorInfo.errorType}`);
  }

  if (state.topic) {
    parts.push(`Topic: ${state.topic}`);
  }

  if (parts.length === 0) {
    parts.push(`Help with ${state.language} code`);
  }

  return parts.join(' ');
}

/**
 * Format execution result for Cygnus context
 */
export function formatExecutionContext(result: ExecutionResult): string {
  const errorInfo = extractErrorInfo(result);
  const lines: string[] = [];

  if (result.status === 'passed') {
    lines.push('✅ **Execution Status:** All tests passed!');
    lines.push(`   - **Tests:** ${result.tests.passed}/${result.tests.total} passed`);
    lines.push(`   - **Time:** ${result.executionTimeMs}ms`);
  } else {
    lines.push(`❌ **Execution Status:** ${errorInfo.errorType}`);
    lines.push(`   - **Error:** ${errorInfo.errorMessage}`);
    if (result.tests.total > 0) {
      lines.push(`   - **Tests:** ${result.tests.passed}/${result.tests.total} passed`);
    }
    if (result.executionTimeMs > 0) {
      lines.push(`   - **Time:** ${result.executionTimeMs}ms`);
    }
  }

  if (result.stderr && result.status !== 'passed') {
    const stderr = result.stderr.substring(0, 500); // Limit output
    lines.push('');
    lines.push('**Error Output:**');
    lines.push('```');
    lines.push(stderr);
    lines.push('```');
  }

  if (result.stdout && result.status === 'passed') {
    const stdout = result.stdout.substring(0, 300); // Limit output
    if (stdout.trim()) {
      lines.push('');
      lines.push('**Program Output:**');
      lines.push('```');
      lines.push(stdout);
      lines.push('```');
    }
  }

  return lines.join('\n');
}

/**
 * Determine what debugging action Cygnus should take
 */
export function suggestDebuggingAction(
  result: ExecutionResult,
  state: CodeLabState
): string {
  const errorInfo = extractErrorInfo(result);

  if (!errorInfo.hasError) {
    return 'celebrate'; // All tests passed
  }

  if (result.status === 'syntax_error') {
    return 'syntax-help'; // Help fix syntax
  }

  if (result.status === 'timeout') {
    return 'performance'; // Help optimize
  }

  if (result.status === 'failed') {
    return 'debug'; // Debug test failures
  }

  if (result.status === 'runtime_error') {
    return 'runtime-help'; // Help fix runtime error
  }

  if (result.status === 'security_error') {
    return 'security'; // Explain security issue
  }

  return 'help';
}

/**
 * Build enhanced CodeLab context with execution results
 */
export function buildExecutionAwareCodelabContext(
  state: CodeLabState,
  result: ExecutionResult,
  userQuestion?: string
): CodelabContext {
  const errorInfo = extractErrorInfo(result);
  const errorCategory = determineErrorCategory(
    errorInfo.errorType,
    errorInfo.errorMessage,
    state.topic
  );

  return {
    language: state.language,
    topic: state.topic,
    difficulty: state.difficulty,
    problem: state.problem,
    code: state.code,
    error: errorInfo.hasError ? errorInfo.errorMessage : undefined,
    testResults: `${result.tests.passed}/${result.tests.total} tests passed, status: ${result.status}`,
    userQuestion: userQuestion || (errorInfo.hasError ? `I got an error: ${errorInfo.errorMessage}` : 'My code runs but I want to improve it'),
  };
}

/**
 * Determine if RAG retrieval should focus on debugging
 */
export function shouldFocusOnDebug(result: ExecutionResult): boolean {
  return (
    result.status === 'runtime_error' ||
    result.status === 'syntax_error' ||
    (result.status === 'failed' && result.tests.total > 0 && result.tests.failed > 0)
  );
}

/**
 * Create Cygnus hint for debugging errors
 */
export function createDebuggingHint(result: ExecutionResult, state: CodeLabState): string {
  const errorInfo = extractErrorInfo(result);

  if (result.status === 'syntax_error') {
    return `There's a **syntax error** in your code. Python can't parse it. Look for:\n- Missing colons (:) after control structures\n- Incorrect indentation\n- Mismatched parentheses or brackets\n- Typos in keywords (if, def, class, etc.)`;
  }

  if (result.status === 'timeout') {
    return `Your code is taking too long to run. This usually means:\n- An **infinite loop** (while condition never becomes false)\n- A loop that runs way too many times\n- Recursive function that doesn't terminate\n\nCheck your loop conditions and recursion base cases.`;
  }

  if (errorInfo.errorMessage.includes('IndexError')) {
    return `You got an **IndexError**. This means you're trying to access an index that doesn't exist in a list or string. Remember:\n- Lists are 0-indexed (first item is index 0)\n- Last item is at index len(list)-1\n- Negative indices count from the end (-1 is the last item)`;
  }

  if (errorInfo.errorMessage.includes('KeyError')) {
    return `You got a **KeyError**. This means you're trying to access a dictionary key that doesn't exist. Use:\n- \`.get(key, default_value)\` to safely access keys\n- \`if key in dict\` to check before accessing\n- \`dict.keys()\` to see available keys`;
  }

  if (errorInfo.errorMessage.includes('NameError')) {
    return `You got a **NameError**. This means you're using a variable that isn't defined yet. Check:\n- Did you spell the variable name correctly?\n- Is the variable defined before you use it?\n- Is it in the right scope (inside/outside function)?`;
  }

  if (errorInfo.errorMessage.includes('TypeError')) {
    return `You got a **TypeError**. This usually means you're using the wrong type. Common causes:\n- Trying to add a string and number together\n- Calling a function on an object that doesn't support it\n- Missing parentheses when calling a function`;
  }

  if (result.status === 'failed') {
    return `Your code runs, but the test(s) are failing. This means:\n- Your logic might be incorrect\n- You're not handling edge cases\n- Output format might be wrong\n\nReview the expected output and compare with what your code produces.`;
  }

  return `Something went wrong: ${errorInfo.errorMessage}. Let's debug this together!`;
}

/**
 * Create Cygnus celebration message
 */
export function createCelebrationMessage(result: ExecutionResult, state: CodeLabState): string {
  return `🎉 **Congratulations!** Your **${state.language}** code passed all tests!

**Results:**
- ✅ All ${result.tests.total} tests passed
- ⏱️ Execution time: ${result.executionTimeMs}ms

Great work! You can now:
1. Try the **Optimize** action to see if your code can be improved
2. Analyze code quality with **Analyze**
3. Move on to the next challenge for a new topic`;
}

export default {
  extractErrorInfo,
  determineErrorCategory,
  buildErrorRetrievalQuery,
  formatExecutionContext,
  suggestDebuggingAction,
  buildExecutionAwareCodelabContext,
  shouldFocusOnDebug,
  createDebuggingHint,
  createCelebrationMessage,
};
