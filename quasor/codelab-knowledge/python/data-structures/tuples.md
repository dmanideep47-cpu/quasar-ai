# Tuples

## Definition

A tuple is an immutable, ordered collection of items. Created with parentheses `()` or just commas. Once created, tuples cannot be modified.

## Tuple Creation

```python
empty_tuple = ()
single_item = (42,)  # Comma is required for single item
numbers = (1, 2, 3, 4)
mixed = (1, "hello", 3.14, True)
without_parens = 1, 2, 3  # Also valid
```

## Indexing

Access items by position (0-based):

```python
coords = (10, 20, 30)
coords[0]  # 10
coords[-1]  # 30
coords[1]  # 20
```

## Slicing

Extract a range of items:

```python
t = (0, 1, 2, 3, 4, 5)
t[1:4]  # (1, 2, 3)
t[:3]  # (0, 1, 2)
t[::2]  # (0, 2, 4)
```

## Immutability

Tuples cannot be modified after creation:

```python
t = (1, 2, 3)
t[0] = 10  # TypeError: 'tuple' object does not support item assignment
```

However, if a tuple contains a mutable object (list), that object can be modified:

```python
t = ([1, 2], 3)
t[0][0] = 10  # OK: ([10, 2], 3)
t[0] = [20, 30]  # Error: tuple itself is immutable
```

## Tuple Unpacking

Assign tuple elements to multiple variables:

```python
x, y, z = (1, 2, 3)
print(x)  # 1
print(y)  # 2

a, b = (10, 20)

# Can ignore values with _
first, _, third = (1, 2, 3)
```

## Packing

Combine values into a tuple:

```python
a, b, c = 1, 2, 3  # Automatically packed into tuple
t = (a, b, c)  # Explicit packing
```

## Useful Tuple Operations

**len()**: Get the number of items
```python
t = (1, 2, 3)
len(t)  # 3
```

**count()**: Count occurrences of a value
```python
t = (1, 2, 2, 3, 2)
t.count(2)  # 3
```

**index()**: Find the index of a value
```python
t = ("a", "b", "c")
t.index("b")  # 1
```

**Membership testing**: Check if item exists
```python
t = (1, 2, 3)
2 in t  # True
4 in t  # False
```

## When Tuples Are Useful

- As dictionary keys (lists cannot be keys because they're mutable)
- Returning multiple values from a function
- Protecting data that shouldn't be modified
- Slightly better performance than lists
- Function arguments unpacking

```python
# Multiple returns
def get_coordinates():
    return (10, 20)  # Tuple

x, y = get_coordinates()

# Dictionary key
locations = {(0, 0): "origin", (1, 1): "diagonal"}
```

## Common Mistakes

- Forgetting the comma in a single-element tuple: `(42)` is not a tuple
- Trying to modify a tuple: `t[0] = 5` → TypeError
- Confusing tuple with list syntax (parentheses vs brackets)
- Assuming nested tuples can't be unpacked (they can with nested unpacking)

## Important Notes

- Tuples are immutable and hashable (can be dictionary keys)
- Single-element tuples need a trailing comma: `(1,)`
- Parentheses are optional for tuple creation: `1, 2, 3` is a tuple
- Empty tuple is: `()` not `(,)`

## Related Concepts

- Lists (mutable alternative)
- Unpacking in function arguments
- Zip function (creates tuples from iterables)
- Named tuples (more advanced)