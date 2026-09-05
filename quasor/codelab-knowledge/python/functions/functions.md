# Functions

## Definition

A function is a reusable block of code that performs a specific task. Functions allow you to organize code, avoid repetition, and make programs easier to understand.

## Defining Functions

Use the `def` keyword:

```python
def greet():
    print("Hello!")

greet()  # Call the function
```

## Parameters and Arguments

Parameters are variables in the function definition; arguments are values passed when calling:

```python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # "Alice" is the argument
```

## return

Functions return values using `return`:

```python
def add(a, b):
    return a + b

result = add(3, 5)  # result is 8
```

Without `return`, a function returns `None`.

## Positional Arguments

Arguments passed in order:

```python
def describe(name, age):
    print(f"{name} is {age} years old")

describe("Alice", 30)  # Positional
```

## Keyword Arguments

Arguments passed with names:

```python
def describe(name, age):
    print(f"{name} is {age} years old")

describe(age=30, name="Alice")  # Keyword (order doesn't matter)
describe(name="Bob", age=25)  # Also OK
```

## Default Parameters

Parameters with default values:

```python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")  # Uses default greeting
greet("Bob", "Hi")  # Overrides default
```

## *args

Capture variable number of positional arguments as a tuple:

```python
def sum_all(*args):
    total = 0
    for num in args:
        total += num
    return total

sum_all(1, 2, 3)  # 6
sum_all(10, 20)  # 30
```

## **kwargs

Capture variable number of keyword arguments as a dictionary:

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30, city="NYC")
```

## Scope: Local and Global Variables

Local variables exist only within the function; global variables exist in the module:

```python
x = 10  # Global

def func():
    x = 5  # Local (shadowing global)
    print(x)  # 5

print(x)  # 10 (global unchanged)

def modify_global():
    global x
    x = 20  # Modifies global x

modify_global()
print(x)  # 20
```

## Docstrings

Document functions with triple-quoted strings:

```python
def add(a, b):
    """
    Add two numbers and return the result.
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        The sum of a and b
    """
    return a + b

help(add)  # Displays the docstring
```

## Common Mistakes

- Missing `return` when a value is expected
- Forgetting to use `global` when modifying global variables
- Mutable default arguments: `def func(lst=[]):` (list is shared across calls)
- Using `*args` and `**kwargs` in the wrong order
- Not using keyword arguments for clarity with many parameters

## Important Notes

- Functions should have a single responsibility
- Use descriptive names for functions and parameters
- Use default parameters for optional arguments
- Return early from functions to simplify logic

## Related Concepts

- Lambda functions (anonymous functions)
- Decorators (functions that modify functions)
- *args and **kwargs unpacking
- Type hints for function annotations