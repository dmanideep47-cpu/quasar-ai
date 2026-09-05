# Exception Handling

## Definition

Exceptions are errors that occur during program execution. Exception handling allows you to catch and manage these errors gracefully instead of crashing.

## Exceptions

Common exceptions in Python:

- `TypeError`: Wrong data type
- `ValueError`: Invalid value
- `IndexError`: Index out of range
- `KeyError`: Dictionary key not found
- `ZeroDivisionError`: Division by zero
- `NameError`: Variable not defined
- `AttributeError`: Attribute doesn't exist

## try

The `try` block contains code that might raise an exception:

```python
try:
    x = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
```

## except

Catch and handle specific exceptions:

```python
try:
    number = int("abc")
except ValueError:
    print("Invalid number format")
```

Multiple `except` blocks:

```python
try:
    lst = [1, 2, 3]
    print(lst[10])
except IndexError:
    print("Index out of range")
except TypeError:
    print("Type error occurred")
```

Catch multiple exceptions in one block:

```python
try:
    lst = [1, 2, 3]
    print(lst[10])
except (IndexError, TypeError):
    print("Index or type error")
```

## else

Executes if no exception occurs:

```python
try:
    x = 10 / 2
except ZeroDivisionError:
    print("Error!")
else:
    print(f"Result: {x}")  # Prints "Result: 5.0"
```

## finally

Always executes, whether an exception occurs or not:

```python
try:
    file = open("data.txt", "r")
    data = file.read()
except FileNotFoundError:
    print("File not found")
finally:
    file.close()  # Always closes file
```

## Raising Exceptions

Throw an exception manually:

```python
def check_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

check_age(-5)  # Raises ValueError
```

## Custom Exceptions

Create your own exception classes:

```python
class InsufficientFundsError(Exception):
    pass

class BankAccount:
    def __init__(self, balance):
        self.balance = balance
    
    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError("Not enough funds")
        self.balance -= amount
```

## Good Exception-Handling Practices

**Catch specific exceptions:**
```python
# Good
try:
    x = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")

# Avoid
try:
    x = 10 / 0
except:  # Catches all exceptions (too broad)
    print("Error")
```

**Use else and finally appropriately:**
```python
try:
    result = compute()
except ValueError:
    print("Invalid input")
else:
    print(f"Success: {result}")
finally:
    cleanup()
```

**Provide context in error messages:**
```python
try:
    data = open("data.txt").read()
except FileNotFoundError:
    print("Could not find data.txt in current directory")
```

## Common Mistakes

- Using bare `except:` (catches all exceptions including system exit)
- Not cleaning up resources (use `finally` or context managers)
- Catching exceptions too broadly
- Re-raising the same exception without modification
- Ignoring exceptions silently (empty except block)

## Important Notes

- Exceptions are objects; they inherit from `BaseException`
- Use `try-except` for expected errors
- `else` is rarely needed; save it for significant logic
- `finally` is best used for cleanup (files, connections)

## Related Concepts

- Context managers (`with` statement)
- Logging (record errors with context)
- Exception chaining (raise from)
- Stack traces and debugging