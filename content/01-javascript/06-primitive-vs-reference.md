# Lesson 6 — Primitive vs Reference Types

**Interview importance:** ⭐⭐⭐⭐⭐ — this explains why your `useEffect` fires every render and
why state updates get silently skipped.

Two kinds of values, two completely different copying rules. Almost every "why didn't it
update?" bug in React traces back to this one distinction.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the primitive types and say what makes them different
- Explain what actually gets copied when you assign a variable
- Explain why `{} === {}` is `false`
- Copy an object safely, and say when shallow isn't enough
- Connect all of it to React's re-render behaviour

## 1. The Two Kinds of Value

| Kind | Types | Copied as |
|---|---|---|
| **Primitive** | `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint` | The value itself |
| **Reference** | `object`, `array`, `function`, `Date`, `Map`, `Set`… | A pointer to one shared value |

Everything that isn't a primitive is a reference type. There are exactly seven primitives —
worth memorising, because "name the primitives" is a common warm-up question.

## 2. Copying a Primitive

A primitive assignment copies the value. The two variables are then unrelated:

```js
let a = 10;
let b = a;

b = 20;

console.log(a, b);
```

Output:

```text
10 20
```

`b` got its own copy of `10`. Changing it can't reach `a`.

## 3. Copying a Reference

An object assignment copies the *pointer*, not the object:

```js
const first = { name: 'Ali' };
const second = first;

second.name = 'Ahmed';

console.log(first.name);
```

Output:

```text
Ahmed
```

There's only one object. `first` and `second` are two labels on the same box — which is
exactly the mental model from Lesson 1's `const`.

```text
   first  ──┐
             ├──►  { name: 'Ahmed' }
   second ──┘
```

## 4. Passing to Functions

JavaScript always passes **by value**. For objects, the value being passed is the reference:

```js
function mutate(obj) {
  obj.changed = true;      // ✅ reaches the caller's object
}

function reassign(obj) {
  obj = { changed: true }; // ❌ only re-points the local parameter
}

const a = {};
mutate(a);
console.log(a.changed);

const b = {};
reassign(b);
console.log(b.changed);
```

Output:

```text
true
undefined
```

`mutate` followed the pointer and changed the shared object. `reassign` pointed its own
local variable somewhere else, which the caller never sees. Being able to explain that
difference cleanly is a strong signal.

## 5. Comparison Compares References

```js
console.log({} === {});
console.log([] === []);

const x = { id: 1 };
const y = x;
console.log(x === y);
```

Output:

```text
false
false
true
```

Two object literals are two different objects, however identical they look. Equality for
objects asks "is this the same box?", never "do these boxes contain the same things?".

To compare contents you need to do it yourself — field by field, or with something like
`JSON.stringify` for simple, ordered, JSON-safe data.

## 6. Copying Properly

The spread operator makes a **shallow** copy — a new outer object, but the same inner
references:

```js
const user = { name: 'Ali', address: { city: 'Lahore' } };
const copy = { ...user };

copy.name = 'Ahmed';            // ✅ only the copy changes
copy.address.city = 'Karachi';  // ⚠️ shared — changes the original too

console.log(user.name, user.address.city);
```

Output:

```text
Ali Karachi
```

For a genuinely independent copy, use `structuredClone`:

```js
const deep = structuredClone(user);
deep.address.city = 'Riyadh';

console.log(user.address.city, deep.address.city);
```

Output:

```text
Karachi Riyadh
```

> [!PITFALL]
> `JSON.parse(JSON.stringify(obj))` is the old deep-copy trick, and it quietly destroys
> data: `Date` becomes a string, and `undefined`, functions, `Map`, `Set`, `NaN` and
> `Infinity` are lost or mangled. `structuredClone` handles all of those and is built into
> every modern runtime.

## 7. Why This Decides React Re-renders

React compares with `Object.is` — a reference check for objects. Mutating state in place
produces the *same* reference, so React sees no change:

```jsx
// ❌ same array, React skips the render
items.push(newItem);
setItems(items);

// ✅ new array, new reference
setItems([...items, newItem]);
```

The same rule runs in reverse for effects. A new object literal is a new reference on every
render, so this dependency is never equal:

```jsx
// ❌ fires every render — { id } is a fresh object each time
useEffect(() => { /* … */ }, [{ id }]);

// ✅ compare the primitive
useEffect(() => { /* … */ }, [id]);
```

"State updates get missed when you mutate; effects fire forever when you don't" — both are
this lesson.

## 8. Common Interview Questions

**Q1. What's the difference between primitive and reference types?**

> Primitives — string, number, boolean, null, undefined, symbol and bigint — are copied by
> value, so each variable holds its own. Everything else is a reference type, and assignment
> copies the pointer, so two variables can point at one shared object.
>
> The practical consequence is that mutating through one name is visible through the other.

**Q2. Is JavaScript pass by value or pass by reference?**

> Always pass by value. For objects the value happens to be a reference, which is why
> mutating a parameter's properties is visible to the caller — but reassigning the parameter
> itself isn't.
>
> "Pass by value of the reference" is the precise phrasing.

**Q3. Why is `{} === {}` false?**

> Because equality for objects compares identity, not contents. Two literals create two
> separate objects, so they're never the same reference. Comparing contents is something you
> have to do explicitly.

**Q4. How do you copy an object, and when is a shallow copy not enough?**

> Spread or `Object.assign` for a shallow copy — a new outer object, but nested objects are
> still shared. As soon as you mutate anything nested, you need a deep copy.
>
> `structuredClone` is the modern answer. I'd avoid the `JSON.parse(JSON.stringify(…))`
> trick because it loses dates, functions and `undefined`.

**Q5. Why does React skip a re-render after you `push` into a state array?**

> Because `push` mutates in place, so the reference is unchanged and React's `Object.is`
> check sees the same value. Creating a new array with spread gives a new reference and the
> render happens.

**Senior follow-up: Why does a `useEffect` with an object dependency fire on every render?**

> Because an object literal in the dependency array is constructed fresh each render, so it
> is never referentially equal to the previous one. React compares dependencies with
> `Object.is`, which is identity for objects.
>
> Depend on the primitive fields instead, or memoise the object with `useMemo` so the
> reference is stable.

## 9. Best Practices

✅ Treat state as immutable — build new objects and arrays instead of mutating

✅ Use spread for flat data, `structuredClone` when nesting matters

✅ Depend on primitives in hook dependency arrays wherever you can

✅ Compare objects deliberately — decide whether you mean identity or contents

❌ Don't use `JSON.parse(JSON.stringify(x))` as a general deep copy

❌ Don't assume a function can't change the object you passed it

## 10. Coding Exercise

Predict every line before running.

```js
let a = 1;
let b = a;
b++;
console.log(a, b);

const o1 = { n: 1 };
const o2 = o1;
o2.n++;
console.log(o1.n, o2.n);

const arr = [1, 2];
const copy = [...arr];
copy.push(3);
console.log(arr.length, copy.length);

console.log([1, 2] === [1, 2]);
```

<details>
<summary>Answers</summary>

```text
1 2
2 2
2 3
false
```

Primitives copy; objects share; spread breaks the sharing one level deep; two literals are
never the same reference.

</details>

## 11. Mini Challenge

Write `deepEqual(a, b)` that compares two plain objects by contents rather than identity —
handling nested objects and arrays, and returning `false` for different key counts.

Then explain, in one sentence, why `===` couldn't have done it for you.

## 12. Lesson Summary

> [!RECAP]
> - Seven primitives, copied by value; everything else is a reference, copied as a pointer
> - JavaScript is always pass by value — for objects, the value *is* the reference
> - Mutating a parameter's properties reaches the caller; reassigning the parameter doesn't
> - `===` on objects asks "same box?", never "same contents?"
> - Spread copies one level deep; `structuredClone` copies all of it
> - React skips renders when the reference is unchanged, and re-runs effects when it isn't

## Check your understanding

Answer these without looking back.

1. Name all seven primitive types.
2. Explain the difference between mutating a parameter and reassigning it, and what the caller sees in each case.
3. Why is `{} === {}` false, and how would you compare contents instead?
4. What exactly does spread copy, and where does it stop?
5. Why does `setItems(items)` after `items.push(x)` do nothing?
6. Why does `useEffect(fn, [{ id }])` fire on every render?

## What's Next

**Lesson 7 — Coercion, Truthy/Falsy & Equality.** `==` versus `===` is a guaranteed
question; the interesting part is being able to explain `0 == ''` and `null == undefined`
without hand-waving.
