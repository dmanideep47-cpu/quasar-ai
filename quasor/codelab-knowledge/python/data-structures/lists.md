# Lists

## Definition

A list is a mutable, ordered collection of items. Lists can contain different data types and are created using square brackets `[]`.

## Creating Lists

```python
empty_list = []
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
nested = [1, [2, 3], [4, 5]]
```

## Indexing

Access items by position (0-based):

```python
fruits = ["apple", "banana", "cherry"]
fruits[0]  # "apple"
fruits[1]  # "banana"
fruits[-1]  # "cherry" (last item)
fruits[-2]  # "banana" (second-to-last)
```

## Slicing

Extract a range of items:

```python
numbers = [0, 1, 2, 3, 4, 5]
numbers[1:4]  # [1, 2, 3] (start inclusive, stop exclusive)
numbers[:3]  # [0, 1, 2] (from beginning)
numbers[2:]  # [2, 3, 4, 5] (to end)
numbers[::2]  # [0, 2, 4] (every 2nd item)
```

## Modifying Lists

**Change a single item:**
```python
lst = [1, 2, 3]
lst[1] = 20  # [1, 20, 3]
```

**Change multiple items:**
```python
lst = [1, 2, 3, 4, 5]
lst[1:3] = [20, 30]  # [1, 20, 30, 4, 5]
```

## append()

Add an item to the end:

```python
lst = [1, 2, 3]
lst.append(4)  # [1, 2, 3, 4]
```

## extend()

Add multiple items:

```python
lst = [1, 2, 3]
lst.extend([4, 5])  # [1, 2, 3, 4, 5]
```

## insert()

Insert at a specific position:

```python
lst = [1, 2, 4, 5]
lst.insert(2, 3)  # [1, 2, 3, 4, 5]
```

## remove()

Remove the first occurrence of a value:

```python
lst = [1, 2, 3, 2, 4]
lst.remove(2)  # [1, 3, 2, 4] (removes first 2)
```

## pop()

Remove and return an item by index (default: last item):

```python
lst = [1, 2, 3, 4]
lst.pop()  # Returns 4, lst is now [1, 2, 3]
lst.pop(1)  # Returns 2, lst is now [1, 3]
```

## sort()

Sort the list in place:

```python
lst = [3, 1, 4, 1, 5]
lst.sort()  # [1, 1, 3, 4, 5]
lst.sort(reverse=True)  # [5, 4, 3, 1, 1]
```

## reverse()

Reverse the list in place:

```python
lst = [1, 2, 3]
lst.reverse()  # [3, 2, 1]
```

## List Comprehensions

Create a new list from an existing one concisely:

```python
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]

evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]
```

## Common Mistakes

- Indexing out of range: `lst[10]` when list has only 5 items → IndexError
- Confusing `append()` (adds one item) with `extend()` (adds multiple)
- Modifying a list while iterating over it
- `sort()` returns `None`, not a sorted list

## Important Notes

- Lists are mutable: you can change items
- Negative indices count from the end
- `append()` modifies the list; doesn't return a new list
- Use slicing to copy a list: `new_list = lst[:]`

## Related Concepts

- Tuples (immutable alternative)
- List methods: `count()`, `index()`, `clear()`
- Sorting with `sorted()` function
- List comprehensions for filtering and transforming