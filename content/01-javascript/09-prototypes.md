# Lesson 9 — Prototypes & Inheritance

**Interview importance:** ⭐⭐⭐⭐☆ — "explain prototypal inheritance" separates people who
memorised from people who understand.

You already know the mechanism. Lesson 2 was a lookup chain for *variables*; this is a lookup
chain for *properties*. Same idea, different axis.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what happens when you read a property that doesn't exist on an object
- Distinguish `__proto__` from `prototype` without hesitating
- Describe what `new` actually does, in four steps
- Say why `class` is syntax over prototypes, not a different model
- Explain why methods live on the prototype rather than the instance

## 1. Every Object Has a Prototype

An object has a hidden link to another object — its prototype. When you read a property that
isn't there, the engine follows the link.

```js
const animal = {
  eats: true,
  describe() {
    return `eats: ${this.eats}`;
  },
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.jumps);
console.log(rabbit.eats);
console.log(rabbit.describe());
```

Output:

```text
true
true
eats: true
```

`rabbit` has one own property. `eats` and `describe` were found one link up — and note
`this` inside `describe` still refers to `rabbit`, because `this` comes from the call
(Lesson 10), not from where the method lives.

## 2. The Prototype Chain

The search continues until it finds the property or runs out of links:

```text
   rabbit  { jumps: true }
      │  __proto__
      ▼
   animal  { eats: true, describe() }
      │  __proto__
      ▼
   Object.prototype  { toString, hasOwnProperty, … }
      │  __proto__
      ▼
     null          ← end of the chain
```

```js
console.log(Object.getPrototypeOf(rabbit) === animal);
console.log(Object.getPrototypeOf(animal) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype));
console.log(rabbit.missing);
```

Output:

```text
true
true
null
undefined
```

Reading walks the chain. **Writing never does** — assignment always creates an own property
on the object itself:

```js
rabbit.eats = false;

console.log(rabbit.eats, animal.eats);
```

Output:

```text
false true
```

The prototype is untouched; `rabbit` now shadows it. That's the same shadowing idea from
Lesson 2.

## 3. `__proto__` vs `prototype`

This is the confusion the question is really testing.

| | What it is | Lives on |
|---|---|---|
| `__proto__` | The actual link to this object's prototype | Every object |
| `prototype` | The object that will *become* `__proto__` for instances | Functions only |

```js
function Dog(name) {
  this.name = name;
}

Dog.prototype.speak = function () {
  return `${this.name} barks`;
};

const rex = new Dog('Rex');

console.log(rex.speak());
console.log(Object.getPrototypeOf(rex) === Dog.prototype);
console.log(rex.prototype);
```

Output:

```text
Rex barks
true
undefined
```

An instance has no `prototype` property — only functions do. Use `Object.getPrototypeOf(obj)`
rather than `obj.__proto__`, which is legacy and only standardised for web compatibility.

## 4. What `new` Actually Does

Four steps, worth being able to recite:

1. Create a fresh empty object
2. Set its prototype to the constructor's `.prototype`
3. Call the constructor with `this` bound to that object
4. Return it — unless the constructor explicitly returns an object

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);   // steps 1 and 2
  const result = Ctor.apply(obj, args);        // step 3
  return typeof result === 'object' && result !== null ? result : obj;  // step 4
}

const rex2 = myNew(Dog, 'Rex II');
console.log(rex2.speak(), rex2 instanceof Dog);
```

Output:

```text
Rex II barks true
```

Writing `myNew` in an interview is a strong answer to "what does `new` do?".

## 5. Methods Live on the Prototype for a Reason

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
  this.badDistance = function () { return Math.hypot(this.x, this.y); };  // ❌ per instance
}

Point.prototype.distance = function () { return Math.hypot(this.x, this.y); };  // ✅ shared

const p1 = new Point(3, 4);
const p2 = new Point(6, 8);

console.log(p1.distance(), p2.distance());
console.log(p1.distance === p2.distance);
console.log(p1.badDistance === p2.badDistance);
```

Output:

```text
5 10
true
false
```

A prototype method is created once and shared by every instance. Defining it in the
constructor creates a new function object per instance — the memory argument for prototypes,
and a good thing to mention unprompted.

## 6. `class` Is Syntax Over This

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog2 extends Animal {
  speak() {
    return `${super.speak()} — a bark`;
  }
}

const d = new Dog2('Rex');

console.log(d.speak());
console.log(Object.getPrototypeOf(d) === Dog2.prototype);
console.log(Object.getPrototypeOf(Dog2.prototype) === Animal.prototype);
console.log(typeof Dog2);
```

Output:

```text
Rex makes a sound — a bark
true
true
function
```

`typeof Dog2` is `'function'` — a class *is* a constructor function with a prototype object.
The differences are ergonomic and a few safety rules: class bodies are always strict, methods
are non-enumerable, and calling a class without `new` throws.

> [!NOTE]
> "Is JavaScript classical or prototypal?" — prototypal. `class` is sugar that makes the
> prototype wiring readable; there are no classes in the Java sense underneath.

## 7. Checking Types and Ownership

```js
console.log(d instanceof Dog2, d instanceof Animal);
console.log(Object.hasOwn(d, 'name'), Object.hasOwn(d, 'speak'));
console.log('speak' in d);
console.log(Object.keys(d));
```

Output:

```text
true true
true false
true
[ 'name' ]
```

`instanceof` asks whether a constructor's `prototype` appears anywhere in the chain. `name` is
an own property; `speak` is inherited, so it's `in` the object but not `hasOwn`, and
`Object.keys` skips it.

> [!PITFALL]
> Never add to `Object.prototype`. Every object in the program inherits it, so a stray key
> shows up in every `for...in` loop and in libraries that never expected it. Extending
> built-in prototypes at all is a code smell — reach for a plain function instead.

## 8. Common Interview Questions

**Q1. What is prototypal inheritance?**

> Every object has a link to another object, its prototype. When you read a property the
> engine checks the object, then walks that chain until it finds it or reaches `null`.
>
> It's the same shape as the scope chain — a lookup that goes one way — except it's for
> properties rather than variables.

**Q2. What's the difference between `__proto__` and `prototype`?**

> `__proto__` is the actual link on an object, pointing to its prototype. `prototype` is a
> property that only functions have, holding the object that instances created with `new` will
> get as *their* `__proto__`.
>
> So `rex.__proto__ === Dog.prototype`. In modern code I'd read it with
> `Object.getPrototypeOf`.

**Q3. What does `new` do?**

> Four things: creates an empty object, sets its prototype to the constructor's `.prototype`,
> calls the constructor with `this` bound to that object, and returns it unless the
> constructor returns an object of its own.

**Q4. Is `class` a different inheritance model?**

> No — it's syntax over prototypes. `typeof MyClass` is `'function'`, and its methods live on
> `MyClass.prototype`. The additions are guardrails: strict mode, non-enumerable methods, and
> a throw if you call it without `new`.

**Q5. Why put methods on the prototype instead of in the constructor?**

> Because a prototype method is created once and shared by every instance, while one defined
> in the constructor is a new function object per instance. With a thousand instances that's
> a thousand copies of the same function.

**Q6. What happens when you assign to a property that exists on the prototype?**

> The assignment creates an own property on the instance, shadowing the prototype's. The
> prototype is never modified through an instance — reads walk the chain, writes don't.

**Senior follow-up: How do `instanceof` and `hasOwnProperty` differ in what they inspect?**

> `instanceof` walks the prototype chain looking for a constructor's `.prototype` object, so
> it answers "is this type anywhere in my ancestry?". `Object.hasOwn` looks only at the object
> itself and ignores the chain entirely.
>
> That's why an inherited method is `in` an object and passes `instanceof` for its class, but
> doesn't show up in `Object.keys` or `hasOwn`.

## 9. Best Practices

✅ Use `class` syntax for new code — same model, far more readable

✅ Read prototypes with `Object.getPrototypeOf`, not `__proto__`

✅ Use `Object.hasOwn` when you mean own properties only

✅ Prefer composition over deep inheritance chains

❌ Never extend `Object.prototype` or other built-ins

❌ Don't use `Object.setPrototypeOf` on existing objects — it deoptimises the engine badly

## 10. Coding Exercise

Predict every line, then run it.

```js
const base = { greet() { return 'hi'; } };
const child = Object.create(base);

console.log(child.greet());
console.log(Object.hasOwn(child, 'greet'));

child.greet = () => 'hello';
console.log(child.greet(), base.greet());

function F() {}
const f = new F();
console.log(Object.getPrototypeOf(f) === F.prototype, f.prototype);
```

<details>
<summary>Answers</summary>

```text
hi
false
hello hi
true undefined
```

Reads walk the chain; writes create an own property and shadow it; instances have no
`prototype` of their own.

</details>

## 11. Mini Challenge

Implement `myNew(Ctor, ...args)` from memory, then prove it works by using it with a
constructor whose prototype has a method — checking `instanceof` and that the method is
shared, not copied.

Then explain what your implementation does with a constructor that returns an object.

## 12. Lesson Summary

> [!RECAP]
> - Property lookup walks the prototype chain until it hits `null`
> - Reads walk the chain; **writes always create an own property**
> - `__proto__` is an object's link; `prototype` is a property of functions
> - `new` = create, link, call with `this`, return
> - `class` is syntax over prototypes — `typeof` a class is `'function'`
> - Prototype methods are shared once; constructor-defined methods are copied per instance
> - `instanceof` searches the chain; `Object.hasOwn` never leaves the object

## Check your understanding

Answer these without looking back.

1. Describe what happens when you read a property that isn't on the object.
2. State the difference between `__proto__` and `prototype` in one sentence each.
3. Recite the four steps of `new`.
4. Why doesn't assigning to an inherited property change the prototype?
5. Why are methods put on the prototype rather than created in the constructor?
6. In what sense is `class` "just syntax"? Name two things it does add.

## What's Next

**Lesson 10 — `this` and Binding.** Four rules that decide what `this` is, and knowing all
four calmly is one of the strongest senior signals in a JavaScript interview.
