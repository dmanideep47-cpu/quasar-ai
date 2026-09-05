# ValueError

## Definition

A `ValueError` occurs when a function receives an argument of the correct type but an inappropriate or invalid value.

## Invalid Conversion

Type conversion with invalid data:

```python
int("42")  # 42 - OK
int("abc")  # ValueError: invalid literal for int() with base 10: 'abc'

float("3.14")  # 3.14 - OK
float("hello")  # ValueError: could not convert string to float: 'hello'
```

## Invalid Function Argument Values

A function gets the right type but wrong value:

```python
numbers = [1, 2, 3, 4]
numbers.remove(5)  # ValueError: list.remove(x): x not in list

"hello".index("x")  # ValueError: substring not found
```

## Examples

```python
# Invalid conversion
value = int("not a number")  # ValueError

# Value not in sequence
lst = [1, 2, 3]
lst.remove(99)  # ValueError: list.remove(x): x not in list

# Unpacking with wrong count
a, b = [1, 2, 3]  # ValueError: too many values to unpack

# Argument out of valid range
data = [1, 2, 3]
data.pop(10)  # IndexError (not ValueError)
```

## Debugging Techniques

**Inspect the value:**
```python
user_input = input("Enter a number: ")  # "abc"
print(f"Input: '{user_input}'")

try:
    num = int(user_input)
except ValueError:
    print(f"Could not convert '{user_input}' to int")
```

**Validate before converting:**
```python
def safe_int(value):
    try:
        return int(value)
    except ValueError:
        return None

result = safe_int("hello")  # None (no error)
```

**Check if value exists:**
```python
items = [10, 20, 30]

if 20 in items:
    items.remove(20)  # Safe
else:
    print("Item not found")
```

**Verify unpacking count:**
```python
# Wrong: too many values
try:
    a, b = [1, 2, 3]
except ValueError as e:
    print(f"Unpacking error: {e}")

# Correct
a, b, c = [1, 2, 3]
```

## Prevention

**Validate user input:**
```python
def get_positive_number():
    while True:
        try:
            num = int(input("Enter a positive number: "))
            if num > 0:
                return num
            else:
                print("Number must be positive")
        except ValueError:
            print("Please enter a valid number")
```

**Use try-except for conversions:**
```python
age_str = user_input
try:
    age = int(age_str)
except ValueError:
    age = 0  # Default value
```

**Check membership before remove:**
```python
item_to_remove = 99
if item_to_remove in lst:
    lst.remove(item_to_remove)
```

**Use index safely:**
```python
# Risky
idx = text.index("x")  # ValueError if not found

# Safe
try:
    idx = text.index("x")
except ValueError:
    idx = -1
```

## Important Notes

- `ValueError` = wrong value, not wrong type (that's `TypeError`)
- Always validate user input before conversion
- Use `in` operator to check membership before `remove()` or `index()`
- Default values prevent crashes

## Related Concepts

- `TypeError` (wrong type)
- `IndexError` (out of range)
- `KeyError` (missing key)
- Input validation
- Exception handling with try-except