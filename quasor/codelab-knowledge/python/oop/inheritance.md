# Inheritance

## Definition

Inheritance allows a class (child/subclass) to inherit attributes and methods from another class (parent/superclass). This promotes code reuse and creates hierarchical relationships.

## Parent and Child Classes

Create a child class that inherits from a parent:

```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        print(f"{self.name} makes a sound")

class Dog(Animal):  # Dog inherits from Animal
    pass

dog = Dog("Buddy")
dog.speak()  # Works: "Buddy makes a sound"
```

## Method Overriding

Child classes can override parent methods:

```python
class Animal:
    def speak(self):
        print("Some sound")

class Dog(Animal):
    def speak(self):  # Override
        print("Woof!")

class Cat(Animal):
    def speak(self):  # Override
        print("Meow!")

dog = Dog()
dog.speak()  # "Woof!"

cat = Cat()
cat.speak()  # "Meow!"
```

## super()

Call the parent class's method from the child class:

```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        print(f"{self.name} makes a sound")

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)  # Call parent __init__
        self.breed = breed
    
    def speak(self):
        super().speak()  # Call parent speak
        print("Woof!")

dog = Dog("Buddy", "Golden Retriever")
dog.speak()
# "Buddy makes a sound"
# "Woof!"
```

## Multiple Inheritance Basics

A class can inherit from multiple parents:

```python
class Swimmer:
    def swim(self):
        print("Swimming")

class Flyer:
    def fly(self):
        print("Flying")

class Duck(Swimmer, Flyer):
    pass

duck = Duck()
duck.swim()  # "Swimming"
duck.fly()   # "Flying"
```

With multiple inheritance, method resolution order (MRO) determines which method is called. Use `help(ClassName)` or `ClassName.__mro__` to see the order.

## isinstance()

Check if an object is an instance of a class:

```python
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()
isinstance(dog, Dog)  # True
isinstance(dog, Animal)  # True (subclass counts)
isinstance(dog, str)  # False
```

## issubclass()

Check if a class is a subclass of another:

```python
class Animal:
    pass

class Dog(Animal):
    pass

issubclass(Dog, Animal)  # True
issubclass(Animal, Dog)  # False
issubclass(str, object)  # True (all classes inherit from object)
```

## Common Mistakes

- Forgetting to call `super().__init__()` in child `__init__`
- Assuming method resolution order in multiple inheritance
- Overriding methods unintentionally (name collision)
- Creating deep inheritance hierarchies (hard to follow)

## Important Notes

- All Python classes inherit from `object` (the base class)
- `super()` is preferred over calling parent class directly
- Use inheritance for "is-a" relationships (Dog is an Animal)
- Composition (having objects as attributes) is often better than deep inheritance

## Related Concepts

- Polymorphism (same method name, different behavior)
- Abstract base classes (ABCs)
- Method Resolution Order (MRO)
- Duck typing (if it quacks like a duck, it's a duck)