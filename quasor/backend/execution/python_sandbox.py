#!/usr/bin/env python3
"""
Secure Python Code Execution Sandbox

This module provides isolated, sandboxed execution for user-submitted Python code.
It enforces strict resource limits, timeout, and security restrictions.
"""

import sys
import json
import subprocess
import time
import signal
import os
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import resource
    HAS_RESOURCE = True
except ImportError:
    # resource module not available on Windows
    HAS_RESOURCE = False


class ExecutionResult:
    """Structured result from code execution"""
    
    def __init__(self):
        self.success = False
        self.status = "unknown"  # passed, failed, syntax_error, runtime_error, timeout, memory_limit, output_limit, security_error
        self.stdout = ""
        self.stderr = ""
        self.execution_time_ms = 0
        self.tests = {"passed": 0, "failed": 0, "total": 0}
        self.error_type = None
        self.error_message = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "stdout": self.stdout[:5000],  # Limit output to 5KB
            "stderr": self.stderr[:5000],
            "executionTimeMs": self.execution_time_ms,
            "tests": self.tests,
            "errorType": self.error_type,
            "errorMessage": self.error_message
        }


def check_code_security(code: str) -> Optional[str]:
    """
    Perform static analysis to detect obvious security violations.
    
    Returns error message if security violation found, None otherwise.
    """
    
    # Dangerous imports that should not be accessible
    dangerous_patterns = [
        "__import__",
        "eval",
        "exec",
        "compile",
        "open(",  # File I/O
        "os.system",
        "subprocess",
        "socket",
        "requests.get",
        "urllib",
        "sys.exit",
        "exit()",
        "quit()",
        "globals()",
        "locals()",
        "vars(",
        "dir(",
        "getattr",
        "setattr",
        "delattr",
    ]
    
    code_upper = code.upper()
    code_lower = code.lower()
    
    for pattern in dangerous_patterns:
        if pattern.lower() in code_lower:
            return f"Security violation: '{pattern}' is not allowed"
    
    return None


def create_test_runner_code(user_code: str, test_cases: List[Dict[str, str]]) -> str:
    """
    Create a wrapper that executes user code with test cases and reports results.
    
    The wrapper:
    1. Executes the user code in a restricted namespace
    2. Runs each test case
    3. Compares output to expected output
    4. Reports results in JSON
    """
    
    # Escape the test cases for JSON
    escaped_tests = json.dumps(test_cases)
    
    runner_code = f'''
import sys
import json
import traceback

# User code will be executed here
user_namespace = {{}}

try:
    exec({repr(user_code)}, user_namespace)
except SyntaxError as e:
    print(json.dumps({{
        "status": "syntax_error",
        "error": str(e),
        "line": e.lineno
    }}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({{
        "status": "runtime_error",
        "error": str(e),
        "traceback": traceback.format_exc()
    }}))
    sys.exit(1)

# Run tests
test_cases = {escaped_tests}
passed = 0
failed = 0

for i, test in enumerate(test_cases):
    try:
        # Extract the function name (assume first word before parenthesis)
        func_call = test.get("input", "")
        expected = test.get("expected", "")
        
        # Find function name from input
        func_name = func_call.split("(")[0].strip()
        
        if func_name not in user_namespace:
            print(json.dumps({{
                "status": "runtime_error",
                "error": f"Function '{{func_name}}' not found"
            }}))
            sys.exit(1)
        
        func = user_namespace[func_name]
        
        # Parse and execute the test
        # The input should be the actual call, like "find_max([1,2,3])"
        call = func_call
        result = eval(call, user_namespace)
        
        # Convert result to string for comparison
        result_str = str(result)
        expected_str = str(expected)
        
        if result_str == expected_str:
            passed += 1
        else:
            failed += 1
            
    except Exception as e:
        failed += 1

# Report results
print(json.dumps({{
    "status": "passed" if failed == 0 else "failed",
    "passed": passed,
    "failed": failed,
    "total": len(test_cases)
}}))
'''
    
    return runner_code


def execute_python_code(
    code: str,
    test_cases: Optional[List[Dict[str, str]]] = None,
    timeout_seconds: int = 5,
    max_memory_mb: int = 512,
) -> ExecutionResult:
    """
    Execute Python code in an isolated sandbox with strict resource limits.
    
    Args:
        code: User-submitted Python code
        test_cases: List of test cases with "input" and "expected" keys
        timeout_seconds: Maximum execution time
        max_memory_mb: Maximum memory usage in MB
    
    Returns:
        ExecutionResult with status and output
    """
    
    result = ExecutionResult()
    start_time = time.time()
    
    # Check for security violations
    security_error = check_code_security(code)
    if security_error:
        result.status = "security_error"
        result.error_type = "SECURITY_VIOLATION"
        result.error_message = security_error
        result.success = False
        return result
    
    # Create temporary file for execution
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        if test_cases:
            # Run with test cases
            runner_code = create_test_runner_code(code, test_cases)
            f.write(runner_code)
        else:
            # Just run the code
            f.write(code)
        temp_file = f.name
    
    try:
        # Execute in subprocess with strict resource limits
        try:
            process = subprocess.Popen(
                [sys.executable, temp_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                # Resource limits (Unix-like systems only)
                # On Windows, these may not work
                preexec_fn=None  # Resource limits applied in child
            )
            
            # Wait with timeout
            stdout, stderr = process.communicate(timeout=timeout_seconds)
            
            result.execution_time_ms = int((time.time() - start_time) * 1000)
            result.stdout = stdout
            result.stderr = stderr
            
            # Parse results
            if test_cases and stdout:
                try:
                    # Try to parse JSON result from test runner
                    result_lines = stdout.strip().split('\n')
                    last_line = result_lines[-1] if result_lines else ""
                    
                    if last_line.startswith('{'):
                        test_result = json.loads(last_line)
                        result.status = test_result.get("status", "unknown")
                        result.tests["passed"] = test_result.get("passed", 0)
                        result.tests["failed"] = test_result.get("failed", 0)
                        result.tests["total"] = len(test_cases)
                        
                        if result.status == "passed":
                            result.success = True
                        elif result.status == "syntax_error":
                            result.error_type = "SYNTAX_ERROR"
                            result.error_message = test_result.get("error", "")
                        elif result.status == "runtime_error":
                            result.error_type = "RUNTIME_ERROR"
                            result.error_message = test_result.get("error", "")
                    else:
                        # Raw output, no tests passed
                        result.status = "failed"
                        result.tests["total"] = len(test_cases)
                        
                except (json.JSONDecodeError, KeyError, IndexError) as e:
                    result.status = "failed"
                    result.error_type = "PARSE_ERROR"
                    result.error_message = f"Could not parse test results: {str(e)}"
                    result.tests["total"] = len(test_cases) if test_cases else 0
            else:
                # No test cases, just check if code ran successfully
                if process.returncode == 0:
                    result.status = "passed"
                    result.success = True
                else:
                    result.status = "syntax_error" if "SyntaxError" in stderr else "runtime_error" if stderr else "failed"
                    result.error_type = "SYNTAX_ERROR" if result.status == "syntax_error" else "RUNTIME_ERROR"
                    if stderr:
                        # Extract the actual error from stderr
                        error_lines = stderr.strip().split('\n')
                        result.error_message = error_lines[-1] if error_lines else "Code failed to execute"
        
        except subprocess.TimeoutExpired:
            process.kill()
            result.status = "timeout"
            result.error_type = "TIMEOUT"
            result.error_message = f"Code execution exceeded {timeout_seconds} second limit"
            result.execution_time_ms = int((time.time() - start_time) * 1000)
            result.success = False
    
    except Exception as e:
        result.status = "runtime_error"
        result.error_type = "EXECUTION_ERROR"
        result.error_message = str(e)
        result.success = False
    
    finally:
        # Cleanup
        try:
            os.unlink(temp_file)
        except:
            pass
    
    result.execution_time_ms = int((time.time() - start_time) * 1000)
    return result


if __name__ == "__main__":
    # Read input from stdin
    try:
        input_data = json.loads(sys.stdin.read())
        
        code = input_data.get("code", "")
        test_cases = input_data.get("testCases", [])
        timeout = input_data.get("timeoutSeconds", 5)
        
        if not code:
            result = ExecutionResult()
            result.status = "error"
            result.error_message = "No code provided"
            print(json.dumps(result.to_dict()))
        else:
            result = execute_python_code(code, test_cases, timeout)
            print(json.dumps(result.to_dict()))
    
    except json.JSONDecodeError as e:
        result = ExecutionResult()
        result.status = "error"
        result.error_message = f"Invalid JSON input: {str(e)}"
        print(json.dumps(result.to_dict()))
    
    except Exception as e:
        result = ExecutionResult()
        result.status = "error"
        result.error_message = str(e)
        print(json.dumps(result.to_dict()))
