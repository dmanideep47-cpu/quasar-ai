# IndexError

## Definition

An `IndexError` occurs when you try to access an index that doesn't exist in a sequence (list, string, tuple).

## List and String Indexing

Lists and strings use 0-based indexing:

```python
lst = [10, 20, 30, 40, 50]
lst[0]  # 10 (first element)
lst[4]  # 50 (last element)
lst[5]  # IndexError: list index out of range
```

## Out-of-Range Indexes

Accessing an index beyond the list/string length:

```python
fruits = ["apple", "banana", "cherry"]
fruits[0]  # "apple" - OK
fruits[2]  # "cherry" - OK
fruits[3]  # IndexError (length is 3, valid indexes are 0-2)
```

## String Indexing

Strings work the same way:

```python
word = "python"
word[0]  # "p"
word[5]  # "n"
word[6]  # IndexError
```

## Examples

```python
# List index error
numbers = [1, 2, 3]
print(numbers[10])  # IndexError: list index out of range

# String index error
name = "Alice"
print(name[5])  # IndexError: string index out of range

# Nested list error
matrix = [[1, 2], [3, 4]]
print(matrix[2])  # IndexError: list index out of range
```

## Debugging Techniques

**Check the length first:**
```python
lst = [1, 2, 3]
print(len(lst))  # 3

# Valid indexes: 0, 1, 2
# Invalid: 3, 4, ... or negative < -3
```

**Use loops safely:**
```python
# Wrong: assumes all elements exist
for i in range(10):
    print(lst[i])  # IndexError if lst has fewer than 10 items

# Correct: use actual length
for i in range(len(lst)):
    print(lst[i])

# Better: iterate directly
for item in lst:
    print(item)
```

**Print before accessing:**
```python
lst = [1, 2, 3]
idx = 5
print(f"List: {lst}, Index: {idx}")
print(lst[idx])  # IndexError with clear context
```

## Prevention

**Know the length:**
```python
lst = [10, 20, 30]
if 0 <= index < len(lst):
    print(lst[index])
else:
    print("Index out of range")
```

**Use get-like access:**
```python
# For lists, use slice with default
def safe_get(lst, index, default=None):
    return lst[index] if 0 <= index < len(lst) else default

result = safe_get([1, 2, 3], 10)  # None (no error)
```

**Use enumerate for safe iteration:**
```python
# Safer for iteration with indexes
for index, value in enumerate(lst):
    print(f"{index}: {value}")
```

## Important Notes

- Python allows negative indexes: `lst[-1]` is the last element
- Out-of-bounds access raises `IndexError`, not undefined
- Empty sequences have no valid indexes
- String slicing is safe; it returns empty string instead of error

```python
lst = [1, 2, 3]
lst[10]  # IndexError

# Slicing is safe
lst[1:10]  # [2, 3] (no error)
lst[10:20]  # [] (no error)
```

## Related Concepts

- List slicing (safe, returns subset)
- Negative indexing
- `range()` for safe iteration
- `enumerate()` for index and value
- `try-except` for error handling