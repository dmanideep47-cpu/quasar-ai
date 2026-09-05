# Loops

## Definition

Loops allow you to execute a block of code repeatedly. Python has two types of loops: `for` and `while`.

## for Loop

Iterates over a sequence (list, string, range, etc.):

```python
for item in sequence:
    # Execute for each item
```

Example:

```python
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4

for letter in "hello":
    print(letter)  # Prints h, e, l, l, o
```

## while Loop

Continues as long as a condition is True:

```python
while condition:
    # Execute while condition is True
```

Example:

```python
count = 0
while count < 5:
    print(count)
    count += 1  # Must change condition to avoid infinite loop
```

## range()

Generates a sequence of numbers:

```python
range(5)  # 0, 1, 2, 3, 4
range(2, 8)  # 2, 3, 4, 5, 6, 7 (start, stop)
range(0, 10, 2)  # 0, 2, 4, 6, 8 (start, stop, step)
```

## break

Exits the loop immediately:

```python
for i in range(10):
    if i == 5:
        break
    print(i)  # Prints 0, 1, 2, 3, 4
```

## continue

Skips the current iteration and goes to the next:

```python
for i in range(5):
    if i == 2:
        continue
    print(i)  # Prints 0, 1, 3, 4 (skips 2)
```

## pass

Does nothing; used as a placeholder:

```python
for i in range(5):
    if i == 2:
        pass  # Placeholder for future code
    else:
        print(i)
```

## Nested Loops

Loops inside loops:

```python
for i in range(3):
    for j in range(2):
        print(f"i={i}, j={j}")
```

## Loop else

Executes after the loop completes normally (not broken):

```python
for i in range(5):
    if i == 10:
        break
else:
    print("Loop completed normally")  # This prints

for i in range(5):
    if i == 3:
        break
else:
    print("This doesn't print")  # Break was executed
```

## Iterating Collections

**Lists:**
```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

**Dictionaries:**
```python
person = {"name": "Alice", "age": 30}
for key in person:
    print(key, person[key])
```

**With index:**
```python
for index, item in enumerate(["a", "b", "c"]):
    print(index, item)  # 0 a, 1 b, 2 c
```

## Common Mistakes

- Infinite loops: forgetting to update the condition in `while`
- Off-by-one errors: `range(5)` is 0-4, not 1-5
- Modifying a list while iterating over it (can skip items)
- Using `break` instead of `continue` when you only want to skip one iteration

## Important Notes

- `range()` does not include the stop value
- `break` exits the loop; `continue` skips to the next iteration
- Indentation determines which code is inside the loop
- `for` loops are generally preferred over `while` when iterating collections

## Related Concepts

- Conditional statements (if/elif/else)
- Collections (lists, strings, dicts)
- enumerate() for index and value
- List comprehensions (compact loops)