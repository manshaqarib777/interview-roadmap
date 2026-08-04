# Lesson 8 — Objects

**Interview importance:** ⭐⭐⭐⭐☆ — everything that isn't a primitive is one of these.

Objects are the substrate of the language. Arrays, functions, dates, classes and every module
you import are objects underneath, so the rules here carry into the next three lessons.

## Learning Objectives

By the end of this lesson you should be able to:

- Create, read, update and delete properties confidently
- Say when to use bracket notation instead of dot notation
- Iterate an object four different ways and pick the right one
- Explain shallow copy, `Object.freeze` and their limits
- Say when a `Map` beats a plain object

## 1. Creating Objects

```js
const user = {
  name: 'Ali',
  age: 28,
  isActive: true,
  greet() {
    return `Hi, ${this.name}`;
  },
};

console.log(user.greet());
```

Output:

```text
Hi, Ali
```

Keys are strings (or symbols) — even when you write them as numbers. `{ 1: 'a' }` has the key
`'1'`.

## 2. Dot vs Bracket Notation

```js
const key = 'age';

console.log(user.age);      // dot — you know the name when you write the code
console.log(user[key]);     // bracket — the name is in a variable
console.log(user['age']);   // same thing, spelled out
```

Output:

```text
28
28
28
```

Use brackets when the key is dynamic, or when it isn't a valid identifier:

```js
const config = { 'api-url': 'https://example.com', 'max retries': 3 };

console.log(config['api-url']);
```

Output:

```text
https://example.com
```

Computed keys work in the literal too:

```js
const field = 'status';
const record = { id: 1, [field]: 'active', [`${field}_at`]: '2026-01-01' };

console.log(record);
```

Output:

```text
{ id: 1, status: 'active', status_at: '2026-01-01' }
```

## 3. Adding, Updating, Deleting

```js
const person = { name: 'Ali' };

person.age = 28;            // add
person.name = 'Ahmed';      // update
delete person.age;          // remove

console.log(person, 'age' in person);
```

Output:

```text
{ name: 'Ahmed' } false
```

Reading something missing gives `undefined`, not an error — which is why a typo in a key can
travel a long way before it fails:

```js
console.log(person.nmae);
```

Output:

```text
undefined
```

Optional chaining stops the crash one level deeper:

```js
const data = { user: null };

// console.log(data.user.name);   💥 TypeError
console.log(data.user?.name);
console.log(data.user?.name ?? 'Anonymous');
```

Output:

```text
undefined
Anonymous
```

## 4. Checking for a Property

```js
const obj = { a: 1, b: undefined };

console.log('a' in obj);
console.log('b' in obj);
console.log(obj.b !== undefined);
console.log(Object.hasOwn(obj, 'b'));
console.log('toString' in obj);
console.log(Object.hasOwn(obj, 'toString'));
```

Output:

```text
true
true
false
true
true
false
```

`in` walks the prototype chain (Lesson 9), so it finds inherited things like `toString`.
`Object.hasOwn` — the modern replacement for `hasOwnProperty` — asks only about the object
itself. And note `b` exists while being `undefined`: "missing" and "set to undefined" are
different states.

## 5. Iterating

```js
const scores = { ali: 90, sara: 85, omar: 78 };

console.log(Object.keys(scores));
console.log(Object.values(scores));
console.log(Object.entries(scores));

for (const [name, score] of Object.entries(scores)) {
  console.log(`${name}: ${score}`);
}
```

Output:

```text
[ 'ali', 'sara', 'omar' ]
[ 90, 85, 78 ]
[ [ 'ali', 90 ], [ 'sara', 85 ], [ 'omar', 78 ] ]
ali: 90
sara: 85
omar: 78
```

`for...in` also exists, but it walks inherited enumerable properties too, so it needs a guard:

```js
for (const key in scores) {
  if (Object.hasOwn(scores, key)) console.log(key);
}
```

`Object.entries` with `for...of` is the modern default — no guard needed.

> [!NOTE]
> Key order isn't insertion order in one specific case: integer-like keys come first, in
> ascending numeric order, then string keys in insertion order, then symbols. So
> `{ b: 1, 2: 2, a: 3, 1: 4 }` iterates as `1, 2, b, a`.

## 6. Copying and Merging

```js
const defaults = { theme: 'dark', size: 14 };
const overrides = { size: 16 };

const merged = { ...defaults, ...overrides };
console.log(merged);
```

Output:

```text
{ theme: 'dark', size: 16 }
```

Later spreads win — that's the whole config-merging pattern. `Object.assign(target, …)` does
the same thing but mutates its first argument, so `{ ...a, ...b }` is usually clearer.

Both are **shallow**, exactly as in Lesson 6: nested objects are still shared, and
`structuredClone` is the deep answer.

## 7. Freezing

```js
const settings = Object.freeze({ theme: 'dark', nested: { size: 14 } });

settings.theme = 'light';        // silently ignored (throws in strict mode)
settings.nested.size = 99;       // ⚠️ not frozen — one level deep only

console.log(settings.theme, settings.nested.size);
```

Output:

```text
dark 99
```

`Object.freeze` blocks adding, removing and changing properties — of that object only.
`Object.isFrozen` tells you the state; `Object.seal` is the softer version that allows
changing existing values but not adding or removing keys.

## 8. Objects vs `Map`

| | Plain object | `Map` |
|---|---|---|
| Key types | Strings and symbols only | Anything, including objects |
| Order | Integer keys first, then insertion | Always insertion |
| Size | `Object.keys(o).length` | `map.size` |
| Iteration | `Object.entries(o)` | Directly iterable |
| Inherited keys | Yes, via the prototype | None |
| Best for | Records with known shape | Frequently changing key/value pairs |

```js
const cache = new Map();
const keyObj = { id: 1 };

cache.set(keyObj, 'cached value');
cache.set('plain', 42);

console.log(cache.get(keyObj), cache.size);
```

Output:

```text
cached value 2
```

Rule of thumb: use an object when the keys are known field names, a `Map` when keys are data.

## 9. Common Interview Questions

**Q1. When do you need bracket notation?**

> When the key is dynamic — held in a variable or computed — or when it isn't a valid
> identifier, like `'api-url'`. Dot notation is for keys you know at the time you write the
> code.

**Q2. How do you check whether a property exists?**

> `Object.hasOwn(obj, key)` for the object's own properties, or the `in` operator if you want
> inherited ones to count too. Comparing to `undefined` isn't the same thing, because a
> property can exist and be `undefined`.

**Q3. What's the difference between `for...in` and `Object.keys`?**

> `for...in` walks enumerable properties including inherited ones, so it usually needs a
> `hasOwn` guard. `Object.keys` returns only the object's own enumerable string keys.
>
> I reach for `Object.entries` with `for...of` by default.

**Q4. What does `Object.freeze` actually guarantee?**

> That you can't add, remove or reassign properties on *that* object. It's shallow, so nested
> objects stay mutable, and in sloppy mode the failed writes are silent rather than throwing.

**Q5. Object or `Map`?**

> An object for records with a known shape and string keys. A `Map` when keys are arbitrary
> data, when they might not be strings, when you're adding and deleting frequently, or when
> you need a reliable size and insertion order.

**Senior follow-up: Is a JavaScript object's key order guaranteed?**

> Mostly, and the exception matters. Integer-like keys come first in ascending numeric order,
> then string keys in insertion order, then symbols. So an object with keys `'2'` and `'b'`
> will always list `'2'` first regardless of when you added it.
>
> If order is part of your data model, use a `Map` or an array of entries instead of relying
> on that.

## 10. Best Practices

✅ Prefer `Object.entries` + `for...of` for iteration

✅ Use `Object.hasOwn` over `hasOwnProperty` — it works on objects with no prototype too

✅ Merge with spread and let the later object win

✅ Use optional chaining and `??` when reading from data you didn't create

❌ Don't rely on `Object.freeze` for deep immutability

❌ Don't use an object as a lookup table when keys come from user data — reach for `Map`

## 11. Coding Exercise

Predict every line, then run it.

```js
const o = { a: 1, b: undefined };

console.log('b' in o, o.b !== undefined);
console.log(Object.keys({ b: 1, 2: 2, a: 3, 1: 4 }));

const base = { x: 1, nested: { y: 2 } };
const copy = { ...base };
copy.nested.y = 99;
console.log(base.nested.y);

const frozen = Object.freeze({ v: 1 });
frozen.v = 2;
console.log(frozen.v);
```

<details>
<summary>Answers</summary>

```text
true false
[ '1', '2', 'b', 'a' ]
99
1
```

A key can exist while holding `undefined`; integer-like keys sort first; spread is shallow;
freezing silently rejects the write in sloppy mode.

</details>

## 12. Mini Challenge

Write `pick(obj, keys)` and `omit(obj, keys)` that return a new object without mutating the
original — then use them to strip a `password` field out of a user record before logging it.

Then say which one you'd reach for when the sensitive fields are a fixed list, and why.

## 13. Lesson Summary

> [!RECAP]
> - Keys are strings or symbols; brackets are for dynamic or awkward names
> - Reading a missing property gives `undefined` — a typo fails late
> - `Object.hasOwn` asks about the object; `in` includes the prototype chain
> - `Object.entries` + `for...of` is the default iteration; `for...in` needs a guard
> - Spread merges shallowly, later wins; `Object.freeze` is also one level deep
> - Integer-like keys always iterate first — use a `Map` when order or key type matters

## Check your understanding

Answer these without looking back.

1. When must you use bracket notation instead of dot notation?
2. What's the difference between a property that's missing and one set to `undefined`, and how do you tell them apart?
3. Why does `for...in` sometimes need a `hasOwn` guard when `Object.keys` doesn't?
4. What exactly does `Object.freeze` prevent, and what does it miss?
5. Give two situations where a `Map` is the better choice than an object.
6. In what order does `{ b: 1, 2: 2, a: 3, 1: 4 }` iterate, and why?

## What's Next

**Lesson 9 — Prototypes & Inheritance.** "Explain prototypal inheritance" is the question
that separates people who memorised from people who understand. You already have the
mechanism: it's another lookup chain.
