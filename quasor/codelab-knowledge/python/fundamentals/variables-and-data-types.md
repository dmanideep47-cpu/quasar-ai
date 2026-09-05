# Variables and Data Types

## Definition

A variable is a name that refers to a value in memory. Python is dynamically typed—you don't declare the type; it's inferred from the value. Python has several built-in data types for different kinds of data.

## Variable Assignment

Variables are created when you assign a value using `=`:

```python
name = "Alice"
age = 25
temperature = 98.6
```

Python allows multiple assignments:

```python
x = y = z = 0  # All three variables get 0
a, b, c = 1, 2, 3  # Tuple unpacking
```

## Naming Rules

- Must start with a letter (a-z, A-Z) or underscore `_`
- Can contain letters, numbers (0-9), and underscores
- Case-sensitive: `age` and `Age` are different variables
- Avoid Python keywords: `if`, `for`, `while`, `def`, `class`, etc.
- Use descriptive names: `student_age` instead of `a`

## Numeric Types

### int
Whole numbers, positive or negative, unlimited precision:

```python
x = 42
y = -10
z = 0
```

### float
Numbers with a decimal point or scientific notation:

```python
pi = 3.14
e = 2.7e-4  # Scientific notation (0.00027)
temp = -273.15
```

### complex
Numbers with real and imaginary parts (for advanced math):

```python
c = 3 + 4j
```

## bool
Boolean values represent truth: `True` or `False` (capitalized):

```python
is_student = True
has_passed = False
```

## str
String is a sequence of characters enclosed in quotes (single, double, or triple):

```python
name = "Bob"
message = 'Hello World'
multiline = """This is a
multiline string"""
```

## None
Represents the absence of a value:

```python
result = None  # Often used as a default or placeholder
```

## type()
Returns the data type of a value:

```python
type(42)  # <class 'int'>
type(3.14)  # <class 'float'>
type("hello")  # <class 'str'>
type(True)  # <class 'bool'>
type(None)  # <class 'NoneType'>
```

## Type Conversion

Convert between types using type names as functions:

```python
int("42")  # 42
float("3.14")  # 3.14
str(100)  # "100"
bool(1)  # True
bool(0)  # False
bool("")  # False (empty string is falsy)
```

## Mutable vs Immutable (Basics)

- **Immutable**: Cannot change after creation (int, float, str, bool, tuple)
- **Mutable**: Can be modified in place (list, dict, set)

```python
x = "hello"
x[0] = "H"  # Error: strings are immutable

lst = [1, 2, 3]
lst[0] = 10  # Works: lists are mutable
```

## Common Mistakes

- Using Python keywords as variable names: `for = 5` → error
- Expecting type conversion to always work: `int("abc")` → error
- Confusing `=` (assignment) with `==` (comparison)
- Modifying a string in place (strings are immutable)

## Important Notes

- Python variables don't have fixed types; reassigning changes the type
- `None` is not the same as `0`, `""`, or `False`
- Use `type()` to check actual data type
- Prefer descriptive variable names for readable code

## Related Concepts

- Type checking: `isinstance()`, `type()`
- Containers (lists, dicts, tuples) for storing multiple values
- Operators for working with different types