# Lesson 19 — Arrays & Array Methods

**Interview importance:** ⭐⭐⭐⭐ — implementing `map`/`filter`/`reduce` yourself is a
standard warm-up round.

Arrays are where your data actually lives, and the iteration methods are the grammar you
talk about it in. The warm-up question is never about the API — it's *"implement `map`
without using `map`"* — so this lesson teaches the mechanism, not just the method list.

## Learning Objectives

By the end of this lesson you should be able to:

- Implement `map`, `filter` and `reduce` from scratch, in order
- Choose the right iteration method for a transformation without thinking
- Explain what `reduce` can do that the others can't, and why
- Know which methods mutate and which return new arrays

## 1. One-line Definition

**`map`, `filter` and `reduce` are higher-order functions (Lesson 13) that transform an
array without you writing a loop.**

```js
const nums = [1, 2, 3, 4, 5];

console.log(nums.map((n) => n * 2));
console.log(nums.filter((n) => n % 2 === 0));
console.log(nums.reduce((total, n) => total + n, 0));
```

Output:

```text
[ 2, 4, 6, 8, 10 ]
[ 2, 4 ]
15
```

Map transforms every element, filter keeps a subset, reduce collapses to one value.

## 2. Mental Model

Think of each method as a conveyor belt:

```text
map     → every item passes through a machine, comes out changed    (1 → 1)
filter  → a gate keeps or drops each item                           (n → ≤ n)
reduce  → items fold together into one accumulator, left to right   (n → 1)
```

`forEach` runs the belt with no output — a side effect per item (Lesson 14).

## 3. Visual Flow

```text
nums = [1, 2, 3, 4, 5]

map(n => n * 2):   1 → 2,  2 → 4,  3 → 6,  4 → 8,  5 → 10
filter(isEven):    keep 2, 4                      → [2, 4]
reduce(sum, 0):    0+1=1, 1+2=3, 3+3=6, 6+4=10, 10+5=15
```

## 4. How It Works

All three are just loops with the bookkeeping hidden. Implement them yourself and the
signatures stop being magic:

```js
function myMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr));
  }
  return result;
}

function myFilter(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) result.push(arr[i]);
  }
  return result;
}

function myReduce(arr, fn, initial) {
  let acc = initial;
  let start = 0;

  if (acc === undefined) {
    acc = arr[0];
    start = 1;
  }

  for (let i = start; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr);
  }
  return acc;
}

console.log(myMap([1, 2, 3], (n) => n * 2));
console.log(myFilter([1, 2, 3], (n) => n > 1));
console.log(myReduce([1, 2, 3], (a, b) => a + b));
```

Output:

```text
[ 2, 4, 6 ]
[ 2, 3 ]
6
```

Three loops, three shapes: collect every result, collect the matches, fold into one. The
real methods skip holes and pass `(value, index, array)` — but the loop *is* the method.

```narrate
line 5: map always returns a NEW array, same length as the input
line 11: filter keeps the item only when the predicate is truthy
line 17: reduce carries an accumulator; without an initial value it starts at arr[0]
line 28: `acc === undefined` is the "no initial value" path — the classic reduce gotcha
```

## 5. Real Project Usage

| Task | Method |
|---|---|
| Render a list from data | `map` → one element per item |
| Filter a table by a query | `filter` |
| Total of a cart, count of X | `reduce` |
| Group objects by a key | `reduce` (into an object) |
| Look up one item | `find` |
| Check a rule holds for all / some | `every` / `some` |
| Chain a pipeline | `filter(...).map(...).reduce(...)` |

Grouping, the pattern every dashboard uses:

```js
const orders = [
  { region: 'EU', total: 10 },
  { region: 'US', total: 20 },
  { region: 'EU', total: 30 },
];

const byRegion = orders.reduce((groups, order) => {
  groups[order.region] = (groups[order.region] || 0) + order.total;
  return groups;
}, {});

console.log(byRegion);
```

Output:

```text
{ EU: 40, US: 20 }
```

## 6. Interview Explanation

> `map` returns a new array of the same length with every element transformed. `filter`
> returns a new array containing only the elements where the predicate is truthy. `reduce`
> folds the array into a single value with an accumulator.
>
> All three take `(element, index, array)` and none mutate the original. The gotcha is that
> without an initial value, `reduce` seeds the accumulator with the first element and starts
> from index 1.

## 7. Senior-Level Insights

- **"Prefer composition over mutation" is the senior answer.** Chaining
  `filter → map → reduce` on immutable data reads as a pipeline. Each pass copies, so a
  chain of three on a big list is three allocations — mention that when asked about
  performance.
- **`reduce` is a superpower — and a readability trap.** Anything a list does, reduce can do
  (grouping, flattening, building objects). But a five-argument reduce makes reviewers work.
  Use the specific method when it exists; reach for reduce when it doesn't.
- **Know the callback contract cold:** `(element, index, array)`, plus `thisArg` as an
  optional second argument to the method. And the mutation gotcha — mutating the array *while*
  iterating is undefined-ish behaviour; don't.
- **Sparse arrays.** `map`/`filter` skip holes; `forEach` skips holes too. If you see
  "missing" iterations, it's not your loop — it's the hole.
- **Naming the "reduce without initial" edge** is the difference between a memorised and an
  understood answer. Empty array + no initial value → `TypeError`.

## 8. Common Mistakes

**Mistake 1 — forgetting the initial value.**

```js
console.log([1, 2, 3].reduce((a, b) => a + b));     // 6 — works by luck
console.log([].reduce((a, b) => a + b, 100));       // ✅ initial value: 100
console.log([].reduce((a, b) => a + b));            // 💥 TypeError
```

Output:

```text
6
100
```

An empty array with no initial value throws — there's nothing to seed the accumulator.
Always pass the initial value when the result type differs from the element type.

**Mistake 2 — mutating inside `map`.**

```js
const items = [{ n: 1 }, { n: 2 }];
items.map((item) => { item.n *= 10; return item; });   // mutates the ORIGINAL
```

`map` returns a new array of the *same objects* — the objects are shared (Lesson 6). To
transform without touching the source, return new objects: `items.map(({ n }) => ({ n: n * 10 }))`.

**Mistake 3 — `map` when you mean `forEach`** (or vice versa). If you're not using the
returned array, you wanted `forEach` — and `map` results thrown away is a linting smell.

**Mistake 4 — using `filter` to find one item.** `find` stops at the first match;
`filter` scans everything and allocates an array.

## 9. Best Practices

✅ Use `map` for transform, `filter` for subset, `reduce` for fold — the right name says what
the code does

✅ Always pass the initial value to `reduce` unless the accumulator type is the element type

✅ Chain `filter → map → reduce` for readable pipelines, then think about the allocations

✅ Use `find`, `some`, `every`, `includes` for their narrow jobs instead of hand-rolled loops

✅ Destructure before transforming: `arr.map(({ id }) => id)`

❌ Don't mutate the source array inside `map`/`filter` callbacks

❌ Don't `reduce` when a specific method exists — flatMap, groupBy, sum are clearer

## 10. Interview Questions

**Q1. What is the difference between `map`, `filter` and `reduce`?**

> `map` transforms every element into a new array of the same length. `filter` keeps the
> elements where the predicate is truthy. `reduce` folds the array into a single value via an
> accumulator. None of them mutate the original array.

**Q2. Implement `map`.**

> A loop collecting the callback's return for every element:

```js
function myMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr));
  }
  return result;
}
```

**Q3. Implement `reduce`.**

> Fold with an accumulator. Without an initial value, seed from the first element and start
> at index 1:

```js
function myReduce(arr, fn, initial) {
  let acc = initial;
  let start = 0;
  if (acc === undefined) {
    acc = arr[0];
    start = 1;
  }
  for (let i = start; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr);
  }
  return acc;
}
```

**Senior follow-up: When is `reduce` the right tool?**

> When the result is a shape no specific method produces — grouping into an object, building
> a histogram, flattening mixed data. For sums and products the intent is clearest with
> `reduce`; for single transforms, `map`; for subsets, `filter`. Use the specific method
> whenever it exists.

**Senior follow-up: What's the cost of chaining `map` and `filter`?**

> Each method allocates a new array, so a chain creates one array per step. On large lists
> that's real garbage. The trade-off is readability; when the list is huge, consider a single
> `reduce` or a `for` loop — but only after measuring.

## 11. Follow-up Questions

**What does `reduce` return when the array is empty?**

> The initial value, if one was given. Without one it throws a `TypeError` — there's nothing
> to seed the accumulator.

**Do `map` and `filter` mutate the original array?**

> No — they return new arrays. But the *elements* are shared by reference, so mutating an
> object inside a `map` callback mutates the original's object. Copy before transforming when
> that matters.

**What's the difference between `forEach` and `map`?**

> `forEach` returns nothing and is used for side effects. `map` returns a new array. If you
> ignore `map`'s return value, you wanted `forEach`.

## 12. Comparison Table

| Method | Returns | Length | Mutation | Use for |
|---|---|---|---|---|
| `forEach` | `undefined` | — | none | side effects per item |
| `map` | new array | same | none | transform every item |
| `filter` | new array | ≤ original | none | keep a subset |
| `reduce` | any value | — | none | fold to one value |
| `find` | one element | — | none | first match |
| `some` / `every` | boolean | — | none | predicate checks |
| `sort` | same array | same | ✅ mutates | ordering (careful!) |

## 13. Code Example

A real pipeline — filter, then transform, then fold:

```js
const orders = [
  { product: 'A', price: 10, paid: true },
  { product: 'B', price: 25, paid: false },
  { product: 'C', price: 40, paid: true },
];

const revenue = orders
  .filter((o) => o.paid)
  .map((o) => o.price)
  .reduce((sum, price) => sum + price, 0);

console.log(revenue);
```

Output:

```text
50
```

Three tiny functions, no loop, no mutation. Read it out loud: *paid orders, their prices,
total*. That readability is the argument for the methods over a hand-rolled `for`.

## 14. Performance Notes

- **The methods are fast** — native, optimised C++ loops. A hand-rolled `for` is rarely
  faster in a way you can measure.
- **Chains allocate.** `filter(...).map(...)` creates two intermediate arrays. On huge lists
  that's garbage pressure; on normal UI data, irrelevant.
- **`sort` mutates** — always copy first: `[...arr].sort(...)` (spread comes in Lesson 20).
- **Sparse arrays iterate oddly** — holes are skipped by `map`/`filter`/`forEach` but not by
  `reduce`. Avoid building them; `Array.from({ length: n })` fills explicitly.
- **Measure before optimising** — the pipeline version stays until a profile says otherwise.

## 15. Debugging Scenarios

**Scenario 1 — "`reduce` returned the array, not the sum."**

```js
console.log([1, 2, 3].reduce((acc, n) => { acc + n; }, 0));   // ❌ no return
```

Output:

```text
undefined
```

The callback didn't return — the accumulator became `undefined` after the first step. Arrow
with a body needs an explicit `return`, or drop the braces.

**Scenario 2 — "`map` returns `undefined`s."**

```js
console.log([1, 2, 3].map((n) => { n * 2; }));
```

Output:

```text
[ undefined, undefined, undefined ]
```

Same bug: braced arrow, no `return`. The classic one-line-at-a-glance mistake.

**Scenario 3 — "My original array changed after `map`."**

The callback mutated the shared element objects (Mistake 2). Return new objects, or clone
the elements first.

**Scenario 4 — "Iteration skipped some elements."**

```js
const arr = [1, , 3];   // sparse — a hole at index 1
console.log(arr.map((n) => n * 2));
```

Output:

```text
[ 2, <1 empty item>, 6 ]
```

The hole was skipped. Either fill it or be aware that iteration methods ignore holes.

## 16. Quick Revision Notes

- `map` → new array, same length; `filter` → subset; `reduce` → one value
- Callback signature everywhere: `(element, index, array)`
- Reduce without initial: seeds with `arr[0]`, starts at index 1, throws on empty
- The methods never mutate the array — but the elements are shared references
- `find` stops early; `filter` scans all; `sort` mutates
- Hand-rolled implementations are just loops — that's the warm-up question

## 17. Cheat Sheet

```text
map(fn)     → fn(el, i, arr) → new array, same length
filter(fn)  → keep el when fn(el, i, arr) truthy → new array
reduce(fn, init) → acc = fn(acc, el, i, arr) → single value
find(fn)    → first element where fn truthy (stops early)
some/every(fn) → boolean
forEach(fn) → side effects, returns undefined
sort()      → MUTATES — copy with [...arr].sort() first

reduce no-init: acc = arr[0]; start at i = 1; [] → TypeError
```

## 18. Key Takeaways

> [!RECAP]
> - `map`, `filter`, `reduce` are higher-order functions (Lesson 13) hiding a loop
> - Implementing them from scratch is the standard interview warm-up — three loops, three shapes
> - Callbacks receive `(element, index, array)`; none of the methods mutate the array
> - `reduce` without an initial value seeds from `arr[0]` and throws on empty arrays
> - Chain `filter → map → reduce` for readable pipelines; each step allocates a new array
> - `find`, `some`, `every`, `includes` exist for their narrow jobs — use them

## Check your understanding

Answer these without looking back.

1. Write `myMap`, `myFilter` and `myReduce` from memory.
2. What happens if you call `reduce` on an empty array without an initial value?
3. Why does mutating an object inside a `map` callback change the original array?
4. When is `find` better than `filter`, and when is `reduce` better than a chain?
5. Which array method mutates the array it's called on?

## What's Next

**Lesson 20 — Destructuring, Spread & Rest.** The same `...` in three different moods, and
why shallow-copy semantics cause a huge share of state-mutation bugs.
