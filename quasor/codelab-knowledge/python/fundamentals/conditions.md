# Conditions

## Definition

Conditional statements control the flow of a program by executing different code based on whether a condition is true or false.

## if, elif, else

Basic structure:

```python
if condition:
    # Execute if condition is True
elif another_condition:
    # Execute if another_condition is True (only if first is False)
else:
    # Execute if all previous conditions are False
```

Example:

```python
age = 15
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teenager")
else:
    print("Child")
```

## Comparison Operators

- `==`: Equal to
- `!=`: Not equal to
- `<`: Less than
- `>`: Greater than
- `<=`: Less than or equal to
- `>=`: Greater than or equal to

```python
x = 10
x == 10  # True
x > 5    # True
x != 10  # False
```

## Logical Operators

- `and`: Both conditions must be True
- `or`: At least one condition must be True
- `not`: Inverts the condition

```python
age = 20
has_license = True

if age >= 18 and has_license:
    print("Can drive")

if not has_license:
    print("No license")
```

## Nested Conditions

Conditions inside other conditions:

```python
age = 16
has_license = True

if age >= 16:
    if has_license:
        print("Can drive")
    else:
        print("Get a license first")
else:
    print("Too young")
```

## Truthy and Falsy Values

In Python, any value can be used in a boolean context:

**Falsy values**: `False`, `0`, `0.0`, `""`, `[]`, `{}`, `()`, `None`

**Truthy values**: Everything else (non-zero numbers, non-empty strings/lists, etc.)

```python
if "hello":  # True (non-empty string)
    print("This prints")

if 0:  # False
    print("This doesn't print")

if []:  # False (empty list)
    print("This doesn't print")
```

## Conditional Expressions (Ternary Operator)

Compact form of if-else on a single line:

```python
value_if_true if condition else value_if_false
```

Example:

```python
age = 20
status = "Adult" if age >= 18 else "Minor"
print(status)  # "Adult"
```

## Common Mistakes

- Using `=` instead of `==` in conditions: `if x = 5:` → error
- Forgetting colons after `if`, `elif`, `else`
- Indentation errors (Python requires proper indentation)
- Using `and`/`or` incorrectly with multiple values

## Important Notes

- Always use `==` for comparison, not `=` (which assigns)
- Indentation is critical in Python
- Conditions don't need parentheses (but they're allowed)
- `elif` is short for "else if"

## Related Concepts

- Boolean data type and truth values
- Comparison operators
- Loops (which often use conditions)
- Functions with conditional logic