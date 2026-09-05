# Recursion

## Definition

Recursion is when a function calls itself to solve a smaller version of the same problem. It breaks down a problem into simpler subproblems.

## Base Case

The condition that stops the recursion (prevents infinite loops):

```python
def countdown(n):
    if n == 0:  # Base case
        print("Blastoff!")
        return
    print(n)
    countdown(n - 1)  # Recursive call
```

Without a base case, the function calls itself forever.

## Recursive Case

The function calling itself with a smaller/simpler input:

```python
def factorial(n):
    if n == 0:  # Base case
        return 1
    else:
        return n * factorial(n - 1)  # Recursive case

factorial(5)  # 5 * factorial(4) * factorial(3) * ... * factorial(0)
```

## Call Stack

Each function call is pushed onto the stack. With recursion, multiple calls stack up:

```python
factorial(3)
├── 3 * factorial(2)
│   ├── 2 * factorial(1)
│   │   ├── 1 * factorial(0)
│   │   │   └── return 1
│   │   └── return 1
│   └── return 2
└── return 6
```

When a function returns, it's popped off the stack.

## Simple Examples

**Sum of numbers:**
```python
def sum_numbers(n):
    if n == 0:
        return 0
    return n + sum_numbers(n - 1)

sum_numbers(5)  # 5 + 4 + 3 + 2 + 1 + 0 = 15
```

**Fibonacci:**
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fibonacci(5)  # 5
```

**Power function:**
```python
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

power(2, 3)  # 2 * 2 * 2 = 8
```

## Recursion vs Iteration

**Recursion:**
```python
def factorial_recursive(n):
    if n == 0:
        return 1
    return n * factorial_recursive(n - 1)
```

**Iteration:**
```python
def factorial_iterative(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
```

Both are correct. Iteration is often more efficient (no function call overhead).

## Common Recursion Mistakes

**Missing base case:**
```python
# This never stops!
def bad_recursion(n):
    return n * bad_recursion(n - 1)
```

**Wrong base case:**
```python
# Base case is unreachable
def fibonacci(n):
    if n == -1:  # Will never be true for positive n
        return 0
    return fibonacci(n - 1) + fibonacci(n - 2)
```

**Inefficient recursion:**
```python
# Recalculates same values many times
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)  # Slow!

# fibonacci(5) calls fibonacci(3) twice, fibonacci(2) three times, etc.
```

## Avoiding Infinite Recursion

**Rule 1: Must have a base case**
```python
def count_down(n):
    if n < 0:  # Base case stops recursion
        return
    print(n)
    count_down(n - 1)
```

**Rule 2: Must progress toward base case**
```python
# Good: getting closer to base case (0)
def countdown(n):
    if n == 0:
        return
    countdown(n - 1)

# Bad: not getting closer
def bad(n):
    if n == 0:
        return
    bad(n)  # Calls itself with same argument
```

**Rule 3: Know the recursion depth limit**
```python
import sys
sys.getrecursionlimit()  # Usually 1000

# Deep recursion causes RecursionError
def deep_recursion(n):
    if n == 0:
        return 0
    return deep_recursion(n - 1)

deep_recursion(2000)  # RecursionError: maximum recursion depth exceeded
```

## Important Notes

- Recursion is useful for problems with natural recursive structure (trees, divide-and-conquer)
- Each recursive call uses memory (call stack)
- Iteration is often more efficient than recursion
- Memoization can optimize recursive functions

## Related Concepts

- Stack and recursion depth
- Tail recursion (optimization technique)
- Memoization (caching results)
- Divide-and-conquer algorithms (merge sort, quicksort)
- Tree traversal (naturally recursive)