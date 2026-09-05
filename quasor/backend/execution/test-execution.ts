#!/usr/bin/env node

/**
 * STEP 8: Secure Code Execution - Test Suite
 *
 * Tests for Python and JavaScript execution in isolated sandboxes.
 */

import { executeCode } from '../../app/lib/execute-sandbox';

interface TestCase {
  name: string;
  language: 'python' | 'javascript';
  code: string;
  testCases?: Array<{ input: string; expected: string }>;
  expectedStatus: 'passed' | 'failed' | 'syntax_error' | 'runtime_error' | 'timeout' | 'security_error';
  shouldSucceed: boolean;
}

const tests: TestCase[] = [
  // Python Tests
  {
    name: 'Python: Correct Code',
    language: 'python',
    code: `
def find_max(nums):
    return max(nums)
`,
    testCases: [
      { input: 'find_max([1, 5, 3, 9, 2])', expected: '9' },
      { input: 'find_max([-5, -2, -10])', expected: '-2' },
    ],
    expectedStatus: 'passed',
    shouldSucceed: true,
  },

  {
    name: 'Python: Incorrect Code',
    language: 'python',
    code: `
def find_max(nums):
    return 0  # Wrong implementation
`,
    testCases: [
      { input: 'find_max([1, 5, 3, 9, 2])', expected: '9' },
    ],
    expectedStatus: 'failed',
    shouldSucceed: false,
  },

  {
    name: 'Python: Syntax Error',
    language: 'python',
    code: `
def find_max(nums)
    return max(nums)  # Missing colon
`,
    testCases: [
      { input: 'find_max([1, 5, 3])', expected: '5' },
    ],
    expectedStatus: 'syntax_error',
    shouldSucceed: false,
  },

  {
    name: 'Python: Runtime Error',
    language: 'python',
    code: `
def find_max(nums):
    return nums[999]  # Index out of range
`,
    testCases: [
      { input: 'find_max([1, 5, 3])', expected: '5' },
    ],
    expectedStatus: 'runtime_error',
    shouldSucceed: false,
  },

  {
    name: 'Python: Security - Blocked Import',
    language: 'python',
    code: `
import os
def test():
    os.system('ls')
`,
    testCases: [
      { input: 'test()', expected: 'None' },
    ],
    expectedStatus: 'security_error',
    shouldSucceed: false,
  },

  // JavaScript Tests
  {
    name: 'JavaScript: Correct Code',
    language: 'javascript',
    code: `
function findMax(nums) {
  return Math.max(...nums);
}
`,
    testCases: [
      { input: 'findMax([1, 5, 3, 9, 2])', expected: '9' },
      { input: 'findMax([-5, -2, -10])', expected: '-5' },
    ],
    expectedStatus: 'passed',
    shouldSucceed: true,
  },

  {
    name: 'JavaScript: Incorrect Code',
    language: 'javascript',
    code: `
function findMax(nums) {
  return 0;  // Wrong implementation
}
`,
    testCases: [
      { input: 'findMax([1, 5, 3, 9, 2])', expected: '9' },
    ],
    expectedStatus: 'failed',
    shouldSucceed: false,
  },

  {
    name: 'JavaScript: Syntax Error',
    language: 'javascript',
    code: `
function findMax(nums) {
  return Math.max(...nums)  // Missing semicolon (not always an error)
}
const x = 5
`,
    expectedStatus: 'passed', // JS allows missing semicolons
    shouldSucceed: true,
  },

  {
    name: 'JavaScript: Runtime Error',
    language: 'javascript',
    code: `
function findMax(nums) {
  return nums[999].toString();  // TypeError
}
`,
    testCases: [
      { input: 'findMax([1, 5, 3])', expected: '5' },
    ],
    expectedStatus: 'runtime_error',
    shouldSucceed: false,
  },

  {
    name: 'JavaScript: Security - Blocked Require',
    language: 'javascript',
    code: `
const fs = require('fs');
function test() {
  return fs.readFileSync('/etc/passwd').toString();
}
`,
    testCases: [
      { input: 'test()', expected: 'secret' },
    ],
    expectedStatus: 'security_error',
    shouldSucceed: false,
  },
];

async function runTests() {
  console.log('🧪 STEP 8: Secure Code Execution - Test Suite\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 ${test.name}`);

      const result = await executeCode({
        code: test.code,
        language: test.language,
        testCases: test.testCases || [],
        timeoutSeconds: 5,
      });

      const statusMatch = result.status === test.expectedStatus;
      const successMatch = result.success === test.shouldSucceed;

      if (statusMatch && successMatch) {
        console.log(`✅ PASSED`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Tests: ${result.tests.passed}/${result.tests.total}`);
        console.log(`   Time: ${result.executionTimeMs}ms`);
        passed++;
      } else {
        console.log(`❌ FAILED`);
        console.log(`   Expected status: ${test.expectedStatus}, got: ${result.status}`);
        console.log(`   Expected success: ${test.shouldSucceed}, got: ${result.success}`);
        if (result.errorMessage) {
          console.log(`   Error: ${result.errorMessage}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(
    `\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} total\n`
  );

  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${failed} tests failed`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
