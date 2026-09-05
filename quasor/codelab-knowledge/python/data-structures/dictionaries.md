# Dictionaries

## Definition

A dictionary is a mutable, unordered collection of key-value pairs. Created using curly braces `{}` with `key: value` pairs. Keys must be unique and immutable.

## Key-Value Pairs

Dictionaries map keys to values:

```python
person = {"name": "Alice", "age": 30, "city": "NYC"}
```

## Creating Dictionaries

```python
empty_dict = {}
person = {"name": "Bob", "age": 25}
from_constructor = dict(name="Charlie", age=35)
from_list = dict([("x", 1), ("y", 2)])
```

## Accessing Values

Use the key in square brackets or `get()`:

```python
person = {"name": "Alice", "age": 30}
person["name"]  # "Alice"
person["age"]  # 30
```

## get()

Access a value with a default if key doesn't exist:

```python
person = {"name": "Alice", "age": 30}
person.get("name")  # "Alice"
person.get("city")  # None
person.get("city", "Unknown")  # "Unknown"
```

Accessing with brackets raises KeyError if key doesn't exist.

## Adding/Updating Values

```python
person = {"name": "Alice"}
person["age"] = 30  # Add new key-value
person["name"] = "Alicia"  # Update existing
```

## Deleting Values

```python
person = {"name": "Alice", "age": 30, "city": "NYC"}
del person["city"]  # Delete key
person.pop("age")  # Remove and return value
person.clear()  # Remove all items
```

## keys()

Get all keys:

```python
person = {"name": "Alice", "age": 30}
person.keys()  # dict_keys(['name', 'age'])

for key in person.keys():
    print(key)
```

## values()

Get all values:

```python
person = {"name": "Alice", "age": 30}
person.values()  # dict_values(['Alice', 30])

for value in person.values():
    print(value)
```

## items()

Get all key-value pairs:

```python
person = {"name": "Alice", "age": 30}
person.items()  # dict_items([('name', 'Alice'), ('age', 30)])

for key, value in person.items():
    print(f"{key}: {value}")
```

## Dictionary Comprehensions

Create a new dictionary from an existing one concisely:

```python
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

even_squares = {x: x**2 for x in range(10) if x % 2 == 0}
# {0: 0, 2: 4, 4: 16, 6: 36, 8: 64}
```

## Nested Dictionaries

Dictionaries containing other dictionaries:

```python
people = {
    "person1": {"name": "Alice", "age": 30},
    "person2": {"name": "Bob", "age": 25}
}

people["person1"]["name"]  # "Alice"
```

## Common Mistakes

- Using a mutable object as a key: `{[1, 2]: "value"}` → TypeError
- Accessing a key that doesn't exist with brackets: `d["missing"]` → KeyError
- Assuming dictionaries are ordered (they maintain insertion order in Python 3.7+)
- Confusing `keys()` return type (it's a dict_keys object, not a list)

## Important Notes

- Keys must be immutable (strings, numbers, tuples are OK; lists and dicts are not)
- Dictionary order is guaranteed in Python 3.7+
- Use `get()` instead of `[]` to avoid KeyError
- Check membership with `key in dict`, not `value in dict`

## Related Concepts

- Lists and tuples (other collections)
- Membership testing: `"name" in person`
- Default dict from collections module
- JSON (JavaScript Object Notation) is similar to Python dicts