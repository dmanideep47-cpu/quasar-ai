# Lambda Functions

## Definition

A lambda is a small anonymous function defined with `lambda` keyword. Lambdas are useful for short, simple operations where defining a full function with `def` would be overkill.

## Lambda Syntax

```python
lambda parameters: expression
```

Example:

```python
square = lambda x: x ** 2
square(5)  # 25

add = lambda x, y: x + y
add(3, 4)  # 7
```

## Parameters

Lambdas can take multiple parameters:

```python
multiply = lambda x, y, z: x * y * z
multiply(2, 3, 4)  # 24
```

## Return Expression

Lambdas automatically return the result of the expression:

```python
double = lambda x: x * 2
double(5)  # 10
```

Only one expression is allowed (no multi-line logic).

## Lambda with sorted()

Sort with a custom key:

```python
students = [("Alice", 85), ("Bob", 92), ("Charlie", 78)]
sorted(students, key=lambda x: x[1])  # Sort by grade
# [("Charlie", 78), ("Alice", 85), ("Bob", 92)]
```

## Lambda with map()

Apply a function to all items in an iterable:

```python
numbers = [1, 2, 3, 4, 5]
squared = map(lambda x: x**2, numbers)
list(squared)  # [1, 4, 9, 16, 25]
```

## Lambda with filter()

Filter items based on a condition:

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8]
evens = filter(lambda x: x % 2 == 0, numbers)
list(evens)  # [2, 4, 6, 8]
```

## Limitations of Lambda

Lambdas cannot contain:
- Multiple statements (only one expression)
- Variable assignments
- Loops or conditionals (except ternary operator)
- Complex logic

```python
# This works
short = lambda x: x if x > 0 else 0

# This doesn't work in a lambda
# lambda x: x += 1  # SyntaxError
# lambda x: if x > 0: return x  # SyntaxError
```

## When Normal def Is Better

Use `def` for:
- Reusable functions used multiple times
- Complex logic requiring multiple statements
- Functions needing documentation
- Clarity and readability

```python
# Better as a regular function
def categorize_age(age):
    if age < 13:
        return "Child"
    elif age < 18:
        return "Teenager"
    else:
        return "Adult"
```

Lambdas are best for:
- One-time use functions
- Short, simple operations
- Passing to functions like `map()`, `filter()`, `sorted()`

## Common Mistakes

- Using lambda for complex logic (hard to read and debug)
- Assigning lambda to variable when `def` is clearer
- Forgetting that lambda returns one expression (no statements)
- Using lambda when a built-in function or simple expression works

## Important Notes

- Lambdas are less readable than named functions
- Use lambdas sparingly for clarity
- Lambda code is harder to debug (no name in tracebacks)
- Most lambda uses can be replaced with comprehensions or generator expressions

## Related Concepts

- Map, filter functions
- Sorted with custom keys
- List comprehensions (often clearer than map/filter)
- Decorators (advanced function manipulation)