# TypeError

## Definition

A `TypeError` occurs when an operation or function is applied to an object of an inappropriate type.

## What TypeError Means

The operation you're trying to do doesn't work with that data type:

```python
"hello" + 5  # TypeError: can only concatenate str (not "int") to str
```

## Common Causes

**Concatenating incompatible types:**
```python
"Age: " + 25  # TypeError: string + int
```

**Calling a non-function:**
```python
x = 5
x()  # TypeError: 'int' object is not callable
```

**Wrong number of arguments:**
```python
len(1, 2)  # TypeError: len() takes exactly one argument (2 given)
```

**Iterating over non-iterable:**
```python
for i in 5:  # TypeError: 'int' object is not iterable
    print(i)
```

**Using wrong type with method:**
```python
x = 5
x.append(10)  # TypeError: 'int' object has no attribute 'append'
```

## Examples

```python
# Concatenation error
result = "Hello" + 42  # TypeError

# Method error
num = 42
num.upper()  # TypeError: 'int' object has no attribute 'upper'

# Operation error
x = [1, 2, 3]
y = x + "error"  # TypeError: can only concatenate list (not "str") to list
```

## How to Diagnose It

1. Read the error message carefully: `TypeError: 'int' object is not callable`
2. Find the line number causing the error
3. Check the data type of the variable
4. Verify it supports the operation you're trying

```python
# Diagnose
x = 42
print(type(x))  # <class 'int'>
x()  # TypeError: 'int' object is not callable
```

## Common Fixes

**Convert to correct type:**
```python
# Wrong
"Age: " + 25

# Fixed
"Age: " + str(25)
# Or
f"Age: {25}"
```

**Use correct method/operation:**
```python
# Wrong
x = 5
x.append(10)

# Fixed
lst = [5]
lst.append(10)
```

**Check types before operations:**
```python
def add_values(a, b):
    if not isinstance(a, (int, float)):
        raise TypeError(f"Expected number, got {type(a)}")
    if not isinstance(b, (int, float)):
        raise TypeError(f"Expected number, got {type(b)}")
    return a + b
```

## How to Prevent It

- Use type hints to document expected types
- Use `isinstance()` to check types before operations
- Use descriptive variable names
- Test with different data types

```python
def concatenate(a: str, b: str) -> str:
    return a + b  # Clear expectation: both are strings

concatenate("Hello", 42)  # IDE will warn type mismatch
```

## Important Notes

- `TypeError` is different from `ValueError` (wrong type vs wrong value)
- Python is dynamically typed, but operations require compatible types
- Use duck typing carefully (if it looks like a duck...)
- Error messages usually tell you exactly what's wrong

## Related Concepts

- Type hints and annotations
- `isinstance()` and `type()`
- Duck typing
- Type conversion functions: `str()`, `int()`, `float()`, `list()`, etc.