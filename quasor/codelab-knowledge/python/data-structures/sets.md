# Sets

## Definition

A set is an unordered, mutable collection of unique items. Sets cannot contain duplicate values and are created using curly braces `{}`.

## Set Creation

```python
empty_set = set()  # Use set(), not {}, which creates an empty dict
numbers = {1, 2, 3, 4, 5}
mixed = {1, "hello", 3.14}
from_list = set([1, 2, 2, 3])  # {1, 2, 3} duplicates removed
```

## Uniqueness

Sets automatically remove duplicates:

```python
s = {1, 2, 2, 3, 3, 3}
print(s)  # {1, 2, 3}
```

## add()

Add a single item:

```python
s = {1, 2, 3}
s.add(4)  # {1, 2, 3, 4}
s.add(2)  # Still {1, 2, 3, 4} (no duplicate)
```

## remove()

Remove an item (raises error if not found):

```python
s = {1, 2, 3}
s.remove(2)  # {1, 3}
s.remove(5)  # KeyError
```

## discard()

Remove an item (no error if not found):

```python
s = {1, 2, 3}
s.discard(2)  # {1, 3}
s.discard(5)  # {1, 3} (no error)
```

## Set Operations

**Union** (all items from both sets):
```python
a = {1, 2, 3}
b = {3, 4, 5}
a.union(b)  # {1, 2, 3, 4, 5}
a | b  # Same as union
```

**Intersection** (items in both sets):
```python
a = {1, 2, 3}
b = {3, 4, 5}
a.intersection(b)  # {3}
a & b  # Same as intersection
```

**Difference** (items in first set but not second):
```python
a = {1, 2, 3}
b = {3, 4, 5}
a.difference(b)  # {1, 2}
a - b  # Same as difference
```

**Symmetric Difference** (items in either set but not both):
```python
a = {1, 2, 3}
b = {3, 4, 5}
a.symmetric_difference(b)  # {1, 2, 4, 5}
a ^ b  # Same as symmetric difference
```

## Membership Testing

Check if an item is in the set:

```python
s = {1, 2, 3}
2 in s  # True
4 in s  # False
4 not in s  # True
```

## Common Mistakes

- Using `{}` for an empty set creates an empty dict, not a set
- Trying to add a list to a set: `s.add([1, 2])` → TypeError (lists are unhashable)
- Accessing items by index: sets are unordered
- Assuming `add()` returns the modified set (it returns None)

## Important Notes

- Sets are unordered; iteration order is not guaranteed
- Sets cannot contain mutable objects (lists, dicts, sets)
- Use sets for membership testing (faster than lists for large data)
- Tuples can be in sets (they're hashable)

## Related Concepts

- List operations (similar but different behavior)
- Frozenset (immutable set)
- Set comprehensions: `{x**2 for x in range(5)}`
- Set methods: `pop()`, `clear()`, `copy()`