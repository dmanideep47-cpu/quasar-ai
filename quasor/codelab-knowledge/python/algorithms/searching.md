# Searching Algorithms

## Definition

Searching is finding an element in a collection. Different algorithms have different performance characteristics based on data size and sorting.

## Linear Search

Checks each element one by one until found:

```python
def linear_search(lst, target):
    for i in range(len(lst)):
        if lst[i] == target:
            return i
    return -1

result = linear_search([3, 1, 4, 1, 5], 4)  # Returns 2
```

**When to use**: Works on unsorted data, small datasets.

## Binary Search

Divides the search space in half each time. Requires sorted data:

```python
def binary_search(lst, target):
    left, right = 0, len(lst) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

result = binary_search([1, 3, 4, 5, 7], 4)  # Returns 2
```

## Prerequisites for Binary Search

- Data must be **sorted**
- Works on lists or arrays (random access needed)
- Does NOT work on linked lists

## Time Complexity

- **Linear Search**: O(n) - proportional to list size
- **Binary Search**: O(log n) - much faster for large sorted data

Example: Searching 1 million items
- Linear: up to 1,000,000 comparisons
- Binary: up to ~20 comparisons

## Space Complexity

- **Linear Search**: O(1) - constant space
- **Binary Search**: O(1) - constant space (iterative)

## Iterative Approach (Binary Search)

Using a loop (shown above):

```python
def binary_search(lst, target):
    left, right = 0, len(lst) - 1
    while left <= right:
        mid = (left + right) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## Recursive Approach (Binary Search)

Using function recursion:

```python
def binary_search_recursive(lst, target, left=0, right=None):
    if right is None:
        right = len(lst) - 1
    
    if left > right:
        return -1
    
    mid = (left + right) // 2
    if lst[mid] == target:
        return mid
    elif lst[mid] < target:
        return binary_search_recursive(lst, target, mid + 1, right)
    else:
        return binary_search_recursive(lst, target, left, mid - 1)
```

## Comparison: Linear vs Binary

| Aspect | Linear | Binary |
|--------|--------|--------|
| Sorted data needed | No | Yes |
| Best case | 1 comparison | 1 comparison |
| Average case | n/2 comparisons | log n comparisons |
| Worst case | n comparisons | log n comparisons |
| Implementation | Simple | Slightly complex |

## Common Mistakes

- Using binary search on unsorted data
- Off-by-one errors in mid calculation: use `(left + right) // 2`
- Wrong boundary conditions in loop/recursion

## Important Notes

- Binary search is much faster for large sorted datasets
- Linear search is simpler and works on unsorted data
- Python's `list.index()` uses linear search
- Sorting data is expensive; choose search method based on your use case

## Related Concepts

- Sorting algorithms
- Hash tables (O(1) average search)
- Search in 2D arrays
- Search optimization techniques