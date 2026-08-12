# Lesson 14 — Pure Functions & Side Effects

**Interview importance:** ⭐⭐⭐⭐ — React is built on this idea, and interviewers ask for
it directly.

Reducers, selectors and render functions must all be pure — that's not a style choice,
it's what makes rendering reproducible and state changes predictable. Say it precisely
and you've also explained half of React's design.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a pure function in two precise conditions
- Spot side effects — including the sneaky ones (mutation, `Date.now`, `Math.random`)
- Explain why React demands purity from components, reducers and selectors
- Refactor an impure function into a pure one
- Say why purity is a contract, and where it's allowed to break

## 1. One-line definition

**A pure function always returns the same output for the same input, and has no side
effects — it never touches the world outside its own scope.**

## 2. Mental Model

A pure function is a vending machine: put in the same coins, get out the same snack,
every single time. Nothing it does is visible from the outside — no cameras, no logs, no
changing the coins after you insert them. An impure function is the vending machine that
logs your visit, checks the time to pick your snack, or rearranges the other snacks while
you're not looking.

## 3. Visual Flow

```text
same input ──► [ pure fn ] ──► same output, always
                          └─► touches nothing outside (no logs, no writes)

same input ──► [ impure fn ] ──► output may differ (time, random, global state)
                           └─► writes to the outside (mutates, logs, throws)
```

## 4. How It Works

Two conditions, both required:

```js
// 1. Same input → same output, forever.
const add = (a, b) => a + b;          // pure
const now = () => Date.now();         // impure — different every call

// 2. No side effects: nothing observable happens outside the call.
const format = (n) => n.toFixed(2);   // pure — reads nothing, writes nothing
```

The sneaky ones — **mutation is a side effect even when it's not visible yet**:

```js
const base = { items: [1, 2, 3] };

function addItem(cart, item) {
  cart.items.push(item);              // ❌ mutates the input — impure
  return cart;
}

function addItemPure(cart, item) {
  return { ...cart, items: [...cart.items, item] };  // ✅ new state, input untouched
}

const next = addItemPure(base, 4);
console.log(base.items);
console.log(next.items);
```

Output:

```text
[ 1, 2, 3 ]
[ 1, 2, 3, 4 ]
```

```narrate
line: the pure version spreads both levels, so the original cart is untouched
line: mutation would be invisible here too, but would bite in React — the old state changing
      means re-renders get skipped
line: rule of thumb: treat every argument as read-only unless the function's job is to mutate it
```

Other impurity: `console.log` (a write to the outside), `Date.now()` and `Math.random()`
(global, non-reproducible state), reading or writing globals, and throwing outside the
function's contract.

## 5. Real Project Usage

| Where | The purity contract | What breaks it |
|---|---|---|
| React components | Same props → same render | Reading `Date.now()`, mutating props, logging |
| `useReducer` reducers | `(state, action) => nextState` | Mutating `state`, reading outside values |
| Selectors | `(state) => derived` | Calling impure functions, caching staleness |
| `Array.prototype` callbacks | Same element → same result | Mutating the array inside `map`/`reduce` |
| `Map`/`Set` keys | Same key → same value | Mutable keys (Lesson 6) |

In React, purity is what makes **re-rendering safe**. If a component produced different
output for the same props, re-renders and memoization would be chaos:

```jsx
function Price({ amount }) {
  return <span>{Math.round(amount)}</span>;   // ✅ pure — same props, same output
}
```

And a reducer must return a new state object, never mutate the old one:

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, total: state.total + action.payload };  // ✅ new object
    default:
      return state;
  }
}
```

## 6. Interview Explanation

*"A pure function always returns the same output for the same input and has no side
effects — it doesn't mutate arguments, read or write globals, log, or depend on time or
randomness. React components, reducers and selectors must be pure so that rendering is
reproducible: same props in, same UI out, and state changes are computed from the old
state instead of corrupting it. Side effects don't disappear — they get pushed to the
edges, to event handlers and effects."*

## 7. Senior-Level Insights

- Purity buys **referential transparency** — an expression can be replaced by its value
  without changing behavior. That's the property tests, memoization and hot module
  reloading depend on.
- Purity isn't "no I/O ever" — it's a **boundary**. React itself is impure: it writes to
  the DOM. The discipline is keeping the impure part small and visible.
- `Object.freeze` (Lesson 1) turns accidental mutation into an error in strict mode —
  teams freeze state in dev to enforce purity mechanically.
- `Math.random` and `Date.now` are fine *inside* impure functions — the purity test is
  about the function's own contract, not the values it happens to use.
- Reducers are the pure core of state management: every action → a new state, so you can
  replay, time-travel and test.

## 8. Common Mistakes

```js
// ❌ mutating the array inside map — the callback is supposed to be pure
const nums = [1, 2, 3];
const doubled = nums.map((n) => {
  nums.push(n);        // ❌ grows the array while it's being mapped
  return n * 2;
});
console.log(doubled);
console.log(nums);
```

Output:

```text
[ 2, 4, 6 ]
[ 1, 2, 3, 1, 2, 3 ]
```

`map` reads the length once and iterates over the original indices, so the mutation shows
up in the array itself, not in the mapped result — subtle, and a great reason to treat
the input as read-only.

```js
// ❌ impure sort — sort mutates the original array
const original = [3, 1, 2];
const sorted = original.sort();
console.log(original);      // also [1, 2, 3] — original was changed
console.log(sorted);
```

Output:

```text
[ 1, 2, 3 ]
[ 1, 2, 3 ]
```

Use `[...original].sort()` to keep the source intact.

```js
// ❌ reading Date.now in a component — breaks reproducibility
function Clock() {
  return <p>{new Date().toISOString()}</p>;   // different output every render
}
```

## 9. Best Practices

✅ Treat function arguments as read-only — return a new value instead of mutating

✅ Compute derived values with pure helpers you can test in isolation

✅ Keep side effects at the edges — event handlers, `useEffect`, module init

✅ Use `Object.freeze` in dev to catch accidental mutation early (strict mode)

✅ Copy before mutating: `[...arr]`, `{ ...obj }`, structuredClone for deep copies

❌ Don't mutate the array you're iterating (inside `map`/`reduce`/`forEach`)

❌ Don't depend on `Date.now()`, `Math.random()` or globals inside a "pure" function

## 10. Interview Questions

**Q1. What is a pure function?**

> A function that always returns the same output for the same input and has no side
> effects — no mutation of arguments, no reading or writing globals, no logging, no
> dependence on time or randomness.

**Q2. Why does React require components to be pure?**

> So rendering is reproducible: same props in, same output out. If components had
> visible side effects, React couldn't safely re-render, memoize, or run effects in
> strict mode twice without surprising behavior. Side effects belong in handlers and
> `useEffect`, not in the render.

**Q3. What counts as a side effect?**

> Anything observable outside the function: mutating an argument or a global, writing
> to the console or a file, updating the DOM, throwing outside the contract — plus
> depending on non-deterministic state like `Date.now()` and `Math.random()`, which
> breaks the "same input, same output" half of the definition.

**Q4. Why must a reducer be pure?**

> Because the reducer computes the next state from the previous state. If it mutated the
> old state, re-renders and memoized selectors would skip or read corrupted data. The
> contract is `(state, action) => newState` — a fresh object, never a modified one.

**Senior follow-up: How do you keep a large app pure in practice?**

> I push impurity to the boundaries. Reducers and selectors stay pure and testable; I/O
> and timers live in event handlers, effects and services; I copy before mutating
> (`[...arr]`, `{ ...obj }`); and in dev I freeze state so accidental mutation throws.
> It's a discipline enforced by convention and tooling, not something a linter can
> fully automate.

## 11. Follow-Up Questions

**Can a pure function use `Math.random()`?**

> Then it stops being pure — the same input no longer guarantees the same output. Put the
> randomness at the boundary and pass the value in, so the function itself stays
> deterministic.

**Is `console.log` ever acceptable in a "pure" function?**

> Logging is a side effect, so by definition no. In practice a debug `console.log` in
> dev is harmless, but it makes the function observably impure — remove it before the
> interview answer.

**What does purity have to do with memoization (Lesson 18)?**

> Memoization caches output by input. It's only correct if the function is pure —
> otherwise the cache serves a stale result. Purity is what makes caching safe at all.

**Are all array methods pure?**

> The ones that return a new array (`map`, `filter`, `slice`, `reduce`) are pure if the
> callback is. `sort`, `splice`, `reverse`, `push`, `pop` mutate in place — they're
> impure by design. `sort` is the classic trap.

## 12. Comparison Table

| Property | Pure | Impure |
|---|---|---|
| Same input → same output | Always | Not guaranteed |
| Mutates arguments | Never | Often |
| Reads globals | Never | Sometimes |
| Writes (log, DOM, file) | Never | Sometimes |
| Depends on time/randomness | Never | Sometimes |
| Safe to memoize | ✅ | ❌ |
| Safe to re-run | ✅ | ❌ |
| Testable in isolation | ✅ | Harder |
| Where it belongs | Components, reducers, selectors | Event handlers, effects, services |

## 13. Code Example

A pure refactor, end to end — predict the output:

```js
// ❌ impure: mutates the argument, hides the change
function addTaxImpure(prices, rate) {
  for (let i = 0; i < prices.length; i++) {
    prices[i] = Math.round(prices[i] * (1 + rate));
  }
  return prices;
}

// ✅ pure: same input, same output, input untouched
const addTaxPure = (prices, rate) =>
  prices.map((p) => Math.round(p * (1 + rate)));

const prices = [100, 250, 90];

console.log(addTaxPure(prices, 0.2));
console.log(addTaxPure(prices, 0.2));   // identical result, input still intact
console.log(prices);
```

Output:

```text
[ 120, 300, 108 ]
[ 120, 300, 108 ]
[ 100, 250, 90 ]
```

## 14. Performance Notes

Pure functions are *easier* to optimize, not faster by themselves. Because they have no
side effects, the engine can inline, reorder and eliminate calls it can prove pure, and
you can memoize them (Lesson 18). The costs show up where people force purity: deep
copies in hot paths allocate, and `structuredClone` per call is expensive — copy at the
boundary, not inside every small helper.

## 15. Debugging Scenarios

**"My component doesn't re-render when state changes"** — a reducer or setter mutated the
old state instead of returning a new object, so the reference didn't change (Lesson 6).
Return a fresh object.

**"Same input gives different output"** — the function reads `Date.now()`, `Math.random()`
or a global that changed. Make the value a parameter.

**"An array is different after I called `sort`"** — `sort` mutates. Copy first
(`[...arr].sort()`).

**"`Object is not extensible` in dev"** — `Object.freeze` caught real mutation. Trace
who writes to the frozen state; it's the reducer or a helper that should have returned a
new object.

## 16. Quick Revision Notes

- Two conditions: same input → same output, **and** no side effects
- Side effects: mutation, globals, logging, DOM/file writes, time, randomness
- Mutation is a side effect even when it's invisible to the caller
- Copy before changing: `[...arr]`, `{ ...obj }`, `structuredClone` for deep
- `sort`, `splice`, `reverse`, `push` mutate — `map`, `filter`, `slice` don't
- React components, reducers and selectors must be pure — it's a contract, not a style
- Push side effects to handlers, effects and services — the edges

## 17. Cheat Sheet

```text
pure = (same in → same out)  AND  (no observable outside effects)

✅ map / filter / slice / reduce (with a pure callback)
❌ sort / splice / reverse / push (mutate in place)

copy:  [...arr]        shallow
       { ...obj }      shallow
       structuredClone deep

must be pure:  components, reducers, selectors
impure is OK:  handlers, useEffect, services, module init
```

## 18. Key Takeaways

> [!RECAP]
> - Pure = same input → same output, and no side effects — both conditions required
> - Mutation, globals, logging, time and randomness all break purity
> - React, reducers and selectors depend on purity to render and re-render correctly
> - Copy before changing; push side effects to handlers and effects
> - Purity makes functions memoizable, testable and replayable — the property caching and time-travel rely on

## Check your understanding

Answer these without looking back.

1. State the two conditions for purity.
2. List five different side effects — include two that don't touch the DOM.
3. Why is mutating an argument a side effect even if the caller never notices?
4. Give two array methods that mutate and two that don't.
5. Why must a React reducer return a new object instead of mutating state?
6. Where is it *correct* to be impure in a React app?

## What's Next

**Lesson 15 — IIFE & the Module Pattern.** How JavaScript did encapsulation before
modules — the pattern that made purity enforceable, and that still shows up in legacy code.
