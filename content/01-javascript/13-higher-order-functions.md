# Lesson 13 — Higher-Order Functions & Callbacks

**Interview importance:** ⭐⭐⭐⭐ — the mental model underneath every array method and
every React prop callback.

Functions are values, so they can be passed, returned and stored — and once you see that,
a huge chunk of JavaScript opens up: `map`/`filter`/`reduce`, event handlers, `useEffect`
dependencies, promise chains. This is the lesson where the earlier ones connect.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a higher-order function in one sentence
- Explain what a callback is and why the term exists
- Read `map`, `filter`, `reduce` fluently — including the index argument
- Recognize the HOF pattern in React props and effect hooks
- Distinguish "take a function" from "return a function" (Lesson 5)

## 1. One-line definition

**A higher-order function is a function that takes a function as an argument, returns a
function, or both — and the function it receives is the callback.**

## 2. Mental Model

A HOF is a machine with a slot where you insert behavior. `Array.prototype.map` doesn't
know how to transform your data — you hand it the transformation, it handles the walking
and collecting. That's why it's reusable: the walking is written once, the behavior
changes per call.

```text
[1, 2, 3] ──► [ map ]──( your transform )──► [2, 4, 6]
                ▲
        walking + collecting (built in)
```

## 3. Visual Flow

```text
[1, 2, 3, 4, 5]
   │  .filter(x => x % 2 === 1)     callback decides: keep or drop
   ▼
[1, 3, 5]
   │  .map(x => x * 10)             callback decides: transform each
   ▼
[10, 30, 50]
   │  .reduce((a, b) => a + b, 0)   callback decides: combine pairs
   ▼
90
```

## 4. How It Works

A callback is called *back* by the HOF, not by you. You never write `transform(3)` —
`map` does. Three signatures worth memorizing:

```js
console.log([1, 2, 3].map((value, index, array) => `${index}:${value}`));
console.log([1, 2, 3].filter((value, index, array) => value > 1));
console.log([1, 2, 3].reduce((acc, value, index, array) => acc + value, 0));
```

Output:

```text
[ '0:1', '1:2', '2:3' ]
[ 2, 3 ]
6
```

A function that **returns** a function is also a HOF — the factory shape from Lesson 5:

```js
function withTax(rate) {
  return (price) => price * (1 + rate);     // a HOF returning a function
}

const at20 = withTax(0.2);

console.log(at20(100));
console.log(at20(50));
```

Output:

```text
120
60
```

`map` is just a loop with a callback — you could write it yourself:

```js
function myMap(arr, transform) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(transform(arr[i], i, arr));
  }
  return out;
}

console.log(myMap([1, 2, 3], (n) => n * n));
```

Output:

```text
[ 1, 4, 9 ]
```

```narrate
line: myMap is a higher-order function — it takes transform, a callback
line: it calls the callback back for each element, passing value, index and array
line: the built-in map does exactly this, plus bounds checks and holes handling
```

## 5. Real Project Usage

| Spot | The HOF | What the callback is |
|---|---|---|
| Array methods | `map`/`filter`/`reduce` | Your transform / predicate / combiner |
| Events | `addEventListener('click', fn)` | The handler runs later, on the event |
| Timers | `setTimeout(fn, ms)` | Runs once after the delay (Lesson 5) |
| React | `onClick={() => …}` | Inline callback prop |
| React | `useEffect(fn, deps)` | The effect — a callback the hook manages |
| Promises | `.then(v => …)` | Runs when the promise settles (Lesson 24) |

In React the prop callback is the HOF pattern everywhere:

```jsx
function List({ items, onRemove }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => onRemove(item.id)}>×</button>
        </li>
      ))}
    </ul>
  );
}
```

## 6. Interview Explanation

*"A higher-order function takes a function as an argument, returns one, or both. The
passed function is a callback — the HOF calls it back later, so I hand it behavior while
it handles the walking and bookkeeping. `map` is the everyday example: it owns the loop
and the new array, and my callback owns just the transformation. React props like
`onClick` are the same idea — I pass a function, React calls it when the event fires."*

## 7. Senior-Level Insights

- HOFs let you separate **what** from **how**: the callback is what to do, the HOF is how
  to orchestrate it. Naming that separation is a senior answer.
- **Referential transparency** (Lesson 14) is why callbacks compose: a pure transform
  can be reused, tested and reordered safely.
- "Callback" also names a **convention** — the function handed *to* async machinery.
  Lesson 21's event loop is what makes callbacks actually work.
- Curry (Lesson 16) and memoization (Lesson 18) are both built from the "returns a
  function" half of the definition.
- Composition is the payoff: `array.filter(pred).map(fn).reduce(combine, init)` reads as
  a pipeline, because each method is a HOF handing off its result.

## 8. Common Mistakes

```js
// ❌ calling instead of passing — the callback runs immediately, then undefined
const values = [1, 2, 3];
console.log(values.map(x => x * 2));   // ✅ passing the function
// values.map(x => x * 2());           // ❌ calling x*2() inside
```

```js
// ❌ "forEach with a return" — return does nothing
const doubled = [];
[1, 2, 3].forEach((x) => {
  doubled.push(x * 2);
  return x * 2;                        // ❌ ignored — forEach discards it
});
console.log(doubled);
```

Output:

```text
[ 2, 4, 6 ]
```

The code works by accident via `push`; the `return` is dead. Use `map` when you want a
result.

```js
// ❌ losing `this` when passing a method as a callback (Lessons 10, 12)
const timer = {
  tick() { console.log(this); },
};
// setTimeout(timer.tick, 0);          // this is not timer
setTimeout(() => timer.tick(), 0);     // ✅ preserve the call site
```

## 9. Best Practices

✅ Use `map`/`filter`/`reduce` over explicit loops when the intent is transform/filter/combine

✅ Keep callbacks small and named when they exceed a line or two

✅ Return a new value from `map`/`reduce` — don't mutate inside the callback

✅ Pass stable function references instead of re-creating inline closures in hot code

✅ Use an arrow wrapper when passing an object method, to keep `this` (Lesson 12)

❌ Don't return from `forEach` and expect it to matter

❌ Don't call a callback when you mean to pass it

## 10. Interview Questions

**Q1. What is a higher-order function?**

> A function that takes a function as an argument, returns a function, or both. `map`
> takes a transform; `withTax(rate)` returns a pricing function. Callbacks are the
> functions it receives.

**Q2. What's the difference between a callback and a higher-order function?**

> A callback is the function being passed; the HOF is the function receiving it. The HOF
> decides when and how to call the callback — immediately, per element, later on an
> event, or after a promise settles.

**Q3. Why do array methods take callbacks instead of hard-coding the logic?**

> So the looping and collecting logic is written once and reused, while the behavior
> varies per call. That's the "what vs how" separation, and it's why `map` works on
> numbers, strings and objects alike.

**Senior follow-up: When would you write your own higher-order function?**

> When I need to package behavior for reuse — a `withRetry(fn)` wrapper, a `debounce(fn)`
> (Lesson 19), a `memoize(fn)` (Lesson 18), or a factory that closes over config and
> returns a function (Lesson 5). The signal is repetition around a function call that
> isn't the function's own job.

## 11. Follow-Up Questions

**Is `.map` a higher-order function?**

> Yes — it takes a transform callback and calls it back for every element, delivering a
> new array. Same for `filter`, `reduce`, `forEach`, `sort` and the rest.

**What's the difference between `map` and `forEach`?**

> `map` returns a new array of the same length built from each callback's return; it's a
> transform. `forEach` returns `undefined` and is for side effects. If you need the
> result, use `map`.

**How do React prop callbacks fit this idea?**

> `onClick={handleClick}` passes a function as a value — the HOF is React's internals,
> which call the handler back when the event fires. Effects are the same: `useEffect(fn,
> deps)` is a HOF managing when `fn` runs and re-runs.

## 12. Comparison Table

| Method | Returns | Callback decides | Typical use |
|---|---|---|---|
| `map` | New array, same length | The transformed value | Convert each item |
| `filter` | New array, subset | Keep or drop (`true`/`false`) | Select items |
| `reduce` | One value | How to combine pairs | Sum, group, flatten |
| `forEach` | `undefined` | Side effect per item | Logging, pushing elsewhere |
| `find` | First match (or `undefined`) | Match test | Look up an item |
| `some` / `every` | `true`/`false` | Predicate over items | Check conditions |

## 13. Code Example

One pipeline, three callbacks — predict the output:

```js
const orders = [
  { item: 'laptop', qty: 1, price: 900 },
  { item: 'mouse', qty: 2, price: 25 },
  { item: 'cable', qty: 3, price: 10 },
];

const total = orders
  .filter((o) => o.qty > 1)            // callback 1: predicate
  .map((o) => o.qty * o.price)         // callback 2: transform
  .reduce((sum, n) => sum + n, 0);     // callback 3: combiner

console.log(total);
```

Output:

```text
80
```

```narrate
line: filter keeps only multi-item orders, map converts each order to a line total
line: reduce folds the line totals down to a single number starting from 0
line: each step returns a new value, so the chain reads left to right as a pipeline
```

## 14. Performance Notes

The overhead of callbacks is negligible — V8 inlines small callbacks, so `filter` + `map`
+ `reduce` is usually as fast as a hand-rolled loop. The real costs to watch: creating a
fresh inline callback per element (per render, per call) allocates; passing a stable
reference avoids it. And each pass over the array is a pass — three chained methods mean
three loops, which only matters on very large data.

## 15. Debugging Scenarios

**"Callback isn't running"** — you passed a *call* instead of a function
(`onClick={handleClick()}` fires once at render, then passes `undefined`). Check for
parentheses at the call site.

**"`map` returns `undefined`s"** — the callback body has braces but no `return`
(`x => { x * 2 }`). That's a block body now, not an implicit return.

**"`this` is undefined inside my callback"** — a regular function callback re-decides
`this` (Lesson 10). Use an arrow (Lesson 12) or `bind`.

**"Reduce keeps returning the wrong type"** — the accumulator's initial value sets the
type. `reduce(fn)` without an initial value starts with the first element — surprising
for sums over empty arrays, which throw.

## 16. Quick Revision Notes

- HOF = takes a function, returns a function, or both
- Callback = the function handed over; the HOF calls it back
- `map` transforms, `filter` selects, `reduce` combines — each owns the loop
- `forEach` returns nothing; `return` inside it is dead code
- Factories (Lesson 5) are the "returns a function" half of the definition
- Currying (16), memoization (18), debounce (19): all HOFs built on HOFs
- React props and effect deps are callbacks — "HOF" is just the abstract name

## 17. Cheat Sheet

```text
arr.map(fn)          new array, same length — transform each
arr.filter(fn)       new array, subset — keep where truthy
arr.reduce(fn, init) one value — combine pairs
arr.forEach(fn)      nothing — side effects only
fn(takes callback)   higher-order function
factory(...) → fn    higher-order function (returns a function)
```

## 18. Key Takeaways

> [!RECAP]
> - A higher-order function takes a callback, returns a function, or both
> - Callbacks are called back by the HOF — the HOF owns the "how", the callback the "what"
> - `map`, `filter`, `reduce` are HOFs: transform, select, combine
> - Callbacks that return nothing are for side effects; use `map` when you need a result
> - React props, effect hooks and timers are all the same pattern in the wild
> - Factories, curry, memoization and debounce all build on returning functions (Lessons 5, 16, 18, 19)

## Check your understanding

Answer these without looking back.

1. Define a higher-order function in one sentence.
2. What's the difference between a callback and a HOF?
3. Why does `return` inside a `forEach` callback do nothing?
4. Write the three signatures: `map`, `filter`, `reduce` callback arguments.
5. Give an example of a HOF that *returns* a function — and the lesson it comes from.
6. Where do you see the HOF pattern in React?

## What's Next

**Lesson 14 — Pure Functions & Side Effects.** The property that makes callbacks and
composed pipelines predictable — and the idea React is built on.
