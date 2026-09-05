# Classes and Objects

## Definition

A class is a blueprint for creating objects. Classes bundle data (attributes) and functions (methods) together.

## Classes

Define a class with `class`:

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def bark(self):
        print(f"{self.name} says woof!")

dog = Dog("Buddy", 3)
dog.bark()  # "Buddy says woof!"
```

## Objects

An object is an instance of a class:

```python
dog1 = Dog("Buddy", 3)
dog2 = Dog("Max", 5)
```

Each object has its own data.

## __init__

The constructor method, called when creating an object:

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

person = Person("Alice", 30)  # __init__ is called automatically
```

## self

Reference to the object itself. The first parameter in any method:

```python
class Dog:
    def __init__(self, name):
        self.name = name  # self refers to the object
    
    def greet(self):
        print(f"I am {self.name}")  # Accessing self.name
```

## Instance Attributes

Data specific to each object:

```python
class Car:
    def __init__(self, make, model):
        self.make = make  # Instance attribute
        self.model = model

car = Car("Toyota", "Camry")
print(car.make)  # "Toyota"
```

## Instance Methods

Functions that operate on an object:

```python
class BankAccount:
    def __init__(self, balance):
        self.balance = balance
    
    def deposit(self, amount):
        self.balance += amount
    
    def withdraw(self, amount):
        self.balance -= amount
    
    def get_balance(self):
        return self.balance

account = BankAccount(100)
account.deposit(50)
print(account.get_balance())  # 150
```

## Class Attributes

Shared by all objects of the class:

```python
class Dog:
    species = "Canis familiaris"  # Class attribute
    
    def __init__(self, name):
        self.name = name

dog1 = Dog("Buddy")
dog2 = Dog("Max")
print(dog1.species)  # "Canis familiaris"
print(dog2.species)  # "Canis familiaris"
print(Dog.species)  # "Canis familiaris"
```

## Class Methods

Methods that operate on the class, not individual objects. Use `@classmethod` decorator and take `cls` as first parameter:

```python
class Dog:
    count = 0
    
    def __init__(self, name):
        self.name = name
        Dog.count += 1
    
    @classmethod
    def get_count(cls):
        return cls.count
```

## Static Methods

Methods that don't operate on the object or class. Use `@staticmethod`:

```python
class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

MathUtils.add(3, 5)  # 8
```

## Encapsulation Basics

Protect data by using naming conventions:

```python
class BankAccount:
    def __init__(self, balance):
        self._balance = balance  # Private by convention (single underscore)
    
    def get_balance(self):
        return self._balance
    
    def deposit(self, amount):
        if amount > 0:
            self._balance += amount
```

The single underscore `_` is a convention; Python doesn't strictly enforce privacy.

## Common Mistakes

- Forgetting `self` in method parameters
- Confusing class attributes with instance attributes
- Modifying mutable class attributes (shared across all objects)
- Not initializing attributes in `__init__`

## Important Notes

- Every method must have `self` as the first parameter
- Attributes can be added dynamically (not restricted to `__init__`)
- Use double underscore `__` for stronger name mangling (advanced)
- Classes organize related data and functions

## Related Concepts

- Inheritance (creating subclasses)
- Polymorphism (objects of different types responding the same way)
- Encapsulation (hiding internal details)
- Properties (getter/setter methods using @property)