# Sorting Algorithms

## Definition

Sorting is arranging elements in a specific order (ascending or descending). Different algorithms have different performance characteristics.

## What Sorting Means

Arranging elements in ascending order (smallest to largest):

```python
unsorted = [3, 1, 4, 1, 5, 9, 2]
sorted_list = [1, 1, 2, 3, 4, 5, 9]
```

## Python sorted()

Built-in function that returns a new sorted list:

```python
numbers = [3, 1, 4, 1, 5]
sorted_numbers = sorted(numbers)  # [1, 1, 3, 4, 5]

descending = sorted(numbers, reverse=True)  # [5, 4, 3, 1, 1]

# Sort by custom key
words = ["cat", "apple", "bee"]
sorted_words = sorted(words, key=len)  # ['cat', 'bee', 'apple'] (by length)
```

## list.sort()

Method that sorts a list in place (modifies the original):

```python
numbers = [3, 1, 4, 1, 5]
numbers.sort()  # [1, 1, 3, 4, 5]
print(numbers)  # Mutated

numbers.sort(reverse=True)  # [5, 4, 3, 1, 1]
numbers.sort(key=str)  # Sort as strings
```

## Bubble Sort Concept

Repeatedly compares adjacent elements and swaps if out of order:

```python
def bubble_sort(lst):
    n = len(lst)
    for i in range(n):
        for j in range(0, n - i - 1):
            if lst[j] > lst[j + 1]:
                lst[j], lst[j + 1] = lst[j + 1], lst[j]
    return lst
```

**How it works:**
- Compare pairs of adjacent elements
- Swap if the first is greater
- Repeat until sorted

**Performance**: O(n²) - slow for large data

## Selection Sort Concept

Finds the minimum element and places it at the beginning:

```python
def selection_sort(lst):
    n = len(lst)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if lst[j] < lst[min_idx]:
                min_idx = j
        lst[i], lst[min_idx] = lst[min_idx], lst[i]
    return lst
```

**How it works:**
- Find the smallest element
- Swap with the first unsorted element
- Repeat for the rest

**Performance**: O(n²)

## Insertion Sort Concept

Builds sorted list one item at a time by inserting elements:

```python
def insertion_sort(lst):
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j + 1] = lst[j]
            j -= 1
        lst[j + 1] = key
    return lst
```

**How it works:**
- Assume first element is sorted
- For each new element, find its position in the sorted part
- Insert it there

**Performance**: O(n²) average, but fast for small or nearly sorted data

## Merge Sort Concept

Divides the list in half, sorts each half, then merges:

```python
def merge_sort(lst):
    if len(lst) <= 1:
        return lst
    
    mid = len(lst) // 2
    left = merge_sort(lst[:mid])
    right = merge_sort(lst[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

**Performance**: O(n log n) - much faster than bubble/selection/insertion

## Quicksort Concept

Picks a pivot element and partitions list around it:

```python
def quicksort(lst):
    if len(lst) <= 1:
        return lst
    
    pivot = lst[len(lst) // 2]
    left = [x for x in lst if x < pivot]
    middle = [x for x in lst if x == pivot]
    right = [x for x in lst if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)
```

**Performance**: O(n log n) average, O(n²) worst case

## Basic Time-Complexity Comparison

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) |

## Common Mistakes

- Using bubble sort for large datasets (very slow)
- Assuming quicksort is always O(n log n) (can degrade to O(n²))
- Not considering space complexity (merge sort uses extra space)

## Important Notes

- Use Python's built-in `sorted()` or `list.sort()` for production code
- They use Timsort (hybrid of merge and insertion sort), O(n log n)
- Understand sorting concepts for interviews and learning
- For small data (< 50 items), simple algorithms work fine

## Related Concepts

- Searching (often done on sorted data)
- Time and space complexity
- Stability (preserving order of equal elements)
- Comparison-based vs counting sort