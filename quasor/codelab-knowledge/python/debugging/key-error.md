# KeyError

## Definition

A `KeyError` occurs when you try to access a dictionary key that doesn't exist.

## Dictionary Access

Accessing a key with brackets:

```python
person = {"name": "Alice", "age": 30}
person["name"]  # "Alice" - OK
person["city"]  # KeyError: 'city'
```

## Examples

```python
# Missing key
data = {"a": 1, "b": 2}
print(data["c"])  # KeyError: 'c'

# Nested dictionary
user = {"profile": {"name": "Bob"}}
print(user["settings"])  # KeyError: 'settings'

# From iteration
for key in some_dict:
    print(data[key])  # OK (only iterates over actual keys)
```

## get()

Access a value with a default if key doesn't exist:

```python
person = {"name": "Alice", "age": 30}
person.get("name")  # "Alice"
person.get("city")  # None
person.get("city", "Unknown")  # "Unknown"
```

No KeyError is raised with `get()`.

## Checking Membership

Test if a key exists before accessing:

```python
person = {"name": "Alice", "age": 30}

if "name" in person:
    print(person["name"])  # Safe access

if "city" not in person:
    print("City not found")
```

## Debugging Techniques

**Print available keys:**
```python
data = {"a": 1, "b": 2}
print(data.keys())  # dict_keys(['a', 'b'])

# Now try to access
key = "c"
if key in data:
    print(data[key])
else:
    print(f"Key '{key}' not found in {list(data.keys())}")
```

**Use dictionary.get() safely:**
```python
config = {"timeout": 30}
timeout = config.get("timeout", 10)  # 30
retry_count = config.get("retry_count", 3)  # 3 (default)
```

**Check for nested keys:**
```python
person = {"profile": {"name": "Bob"}}

# Unsafe
print(person["profile"]["email"])  # KeyError

# Safe
if "profile" in person and "email" in person["profile"]:
    print(person["profile"]["email"])
```

## Prevention

**Always use get() for optional keys:**
```python
# Bad: might raise KeyError
def get_user_email(user):
    return user["email"]

# Good: handles missing key
def get_user_email(user):
    return user.get("email", "No email")
```

**Validate data before processing:**
```python
def process_json(data):
    if not isinstance(data, dict):
        raise ValueError("Expected dictionary")
    
    name = data.get("name", "Unknown")
    age = data.get("age", 0)
    
    return f"{name} ({age})"
```

**Use setdefault for initialization:**
```python
# Safely add key if missing
cache = {}
cache.setdefault("counter", 0)
cache["counter"] += 1
```

## Important Notes

- Use `get()` for optional keys
- Use bracket access `[]` only for keys you're sure exist
- Check membership with `in` before accessing uncertain keys
- `setdefault()` returns the value and adds key if missing

## Related Concepts

- Dictionary methods: `keys()`, `values()`, `items()`
- `get()` vs bracket access
- `setdefault()` for initialization
- Dictionary comprehensions
- JSON handling (similar structure)