# Lesson 5 — Closures

**Interview importance:** ⭐⭐⭐⭐⭐ — the single most-asked JavaScript concept.

Most people answer this one with a memorised sentence. You already know the mechanism: it's
the scope chain from Lesson 2, observed after the outer function has returned.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a closure in words you can say out loud without hedging
- Explain why a variable survives the function that created it
- Name the places you already use closures without calling them that
- Explain why a stale `useEffect` value is the same mechanism
- Say when a closure becomes a memory leak

## 1. What is a Closure?

**A closure is a function together with the scope it was created in.**

That's it. Every function in JavaScript is a closure — the term only becomes interesting when
the outer function has finished and the inner one is still using its variables.

```js
function makeCounter() {
  let count = 0;                 // local to makeCounter

  return function () {
    count += 1;                  // …but this function keeps using it
    return count;
  };
}

const tick = makeCounter();

console.log(tick());
console.log(tick());
console.log(tick());
```

Output:

```text
1
2
3
```

`makeCounter()` returned on the first line. Its local `count` should be gone — and it isn't,
because the returned function still holds the scope it was born in.

> [!TIP]
> Press **Debug** on that snippet and watch the call stack. When `tick` runs, the panel shows
> `count` alive at `1`, `2`, `3` while `makeCounter` is nowhere on the stack. That picture is
> the entire concept.

## 2. Why the Variable Survives

Lesson 2 established that a function's scope chain is fixed by where it's *written*. The
returned function was written inside `makeCounter`, so it carries a reference to that scope
forever.

The engine can't discard a scope while something still points at it. So instead of the call
frame dying with the call, it stays alive for exactly as long as the closure does.

```text
    makeCounter() called
    ┌─────────────────────────┐
    │  count = 0              │◄── the returned function points here
    └─────────────────────────┘
             │
    makeCounter() returns — frame would normally die
             │
    ┌─────────────────────────┐
    │  count = 0   (kept)     │◄── still referenced, so still alive
    └─────────────────────────┘
```

## 3. Each Call Gets Its Own Scope

Two calls to the factory produce two independent scopes:

```js
function makeCounter() {
  let count = 0;
  return () => (count += 1);
}

const a = makeCounter();
const b = makeCounter();

a(); a(); a();
console.log(a());
console.log(b());
```

Output:

```text
4
1
```

`b` has its own `count`, untouched by `a`. That independence is the property everything else
is built on.

Same idea with a captured argument:

```js
function multiplier(factor) {
  return (n) => n * factor;
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5), triple(5));
```

Output:

```text
10 15
```

`double` and `triple` are the same function body over two different captured `factor`s. This
is partial application, and it's the idea behind every curried helper.

## 4. Where You Already Use Them

| Pattern | The closure part |
|---|---|
| **Private state** | `count` is unreachable except through the functions you return |
| **Callbacks** | An event handler keeps the variables from where it was defined |
| **`setTimeout`** | The callback runs later, still seeing the scope it was written in |
| **Memoisation** | The cache lives in the closure, not on a global |
| **Modules** | The IIFE pattern — one scope, a few exposed functions |
| **React hooks** | Every render's closure captures that render's props and state |

Private state, concretely:

```js
function createAccount(initial) {
  let balance = initial;                       // no one outside can touch this

  return {
    deposit: (n) => (balance += n),
    get: () => balance,
  };
}

const acct = createAccount(100);
acct.deposit(50);

console.log(acct.get());
console.log(acct.balance);
```

Output:

```text
150
undefined
```

Before `#private` class fields existed, this *was* privacy in JavaScript. It still works
everywhere, with no class involved.

## 5. The Trap: Closures Capture Variables, Not Values

This is where the `var` loop from Lesson 1 comes back:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var →', i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let →', j), 0);
}
```

Output:

```text
var → 3
var → 3
var → 3
let → 0
let → 1
let → 2
```

All three `var` callbacks closed over **the same** `i` — one variable for the whole loop. By
the time they ran it held `3`. `let` creates a fresh binding per iteration, so each callback
closed over a different one.

Say it precisely in an interview: *a closure captures the variable, not a snapshot of its
value.* That single sentence explains both loops and every stale-value bug you'll meet.

> [!PITFALL]
> Closures keep their scope alive, which means they can keep large objects alive too. A
> forgotten event listener that captures a big array holds that array until the listener is
> removed. This is the ordinary shape of a JavaScript memory leak — not exotic, just a
> reference you forgot you made.

## 6. Try It: Two Counters, One Body

```js
function makeCounter(label) {
  let count = 0;
  return () => `${label}: ${++count}`;
}

const clicks = makeCounter('clicks');
const views = makeCounter('views');

console.log(clicks());
console.log(clicks());
console.log(views());
```

Output:

```text
clicks: 1
clicks: 2
views: 1
```

Press **Debug** and step it. Two separate `count` variables, both alive, neither reachable
from outside.

## 7. Closures in React

Every render creates new closures over that render's props and state. Most hook confusion
comes from that one fact.

```jsx {5}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000);  // ❌ stuck at 1
    return () => clearInterval(id);
  }, []);
}
```

The effect ran once, on the first render, so its closure captured `count` as `0` forever.
Every tick computes `0 + 1`. It is the `var` loop wearing a hook.

Two honest fixes:

```jsx
setCount(prev => prev + 1);              // ✅ stop reading the captured value
```

```jsx
useEffect(() => { /* … */ }, [count]);   // ✅ or re-create the closure when it changes
```

And a third, `useRef`, when you need a value that outlives renders without causing one:

```jsx
const latest = useRef(count);
latest.current = count;       // read latest.current inside long-lived callbacks
```

> [!DEEPDIVE]
> `useState` itself is closures. A simplified version:
>
> ```js
> function createState(initial) {
>   let value = initial;
>   const get = () => value;
>   const set = (next) => { value = next; };
>   return [get, set];
> }
> ```
>
> React's real implementation stores state on the fiber rather than in a module closure, so
> it survives re-renders and works per component instance — but the shape of the idea, a
> value plus the functions that close over it, is exactly this.

## 8. Common Interview Questions

**Q1. What is a closure?**

> A function together with the scope it was defined in. Because scope is lexical, the
> function keeps access to those variables even after the outer function has returned.
>
> The everyday version: a counter factory whose `count` survives the call that created it,
> with each call producing an independent one.

**Q2. Why does the variable survive after the outer function returns?**

> Because the returned function still references that scope, so the engine can't discard it.
> Normally a call frame dies with the call; here something still points at it, so it stays
> alive exactly as long as the closure does.

**Q3. Does a closure capture the value or the variable?**

> The variable. That's why all three callbacks in a `var` loop print the final number — they
> share one binding that kept changing. `let` gives each iteration its own binding, so each
> closure captures a different variable.

**Q4. Give a real use for closures.**

> Private state — a factory returning methods over a variable nothing outside can reach. Also
> memoisation, where the cache lives in the closure instead of a shared object, and partial
> application, like a `multiplier(2)` that returns a doubler.
>
> Every callback and event handler is one too; those are just the cases where nobody bothers
> saying the word.

**Q5. Can closures cause memory leaks?**

> They keep their scope alive, so anything captured stays reachable. That becomes a leak when
> the closure itself outlives its usefulness — a listener that's never removed, or a timer
> never cleared, holding on to a large object.
>
> The fix is removing the reference, not avoiding closures.

**Q6. How do closures explain a stale value in `useEffect`?**

> The effect body is a closure created during a render, capturing that render's state. With
> an empty dependency array it's never re-created, so it keeps reading the first render's
> value.
>
> Fix it by not reading the captured value — `setCount(prev => prev + 1)` — or by adding the
> value to the dependencies so the closure is rebuilt.

**Senior follow-up: How would you implement something like `useState` with closures?**

> A function holding a `value` in its scope and returning a getter and a setter that close
> over it. That gives you per-instance state with no globals.
>
> React can't literally use a module-level closure, because state has to survive re-renders
> and be per component instance, so it stores the value on the fiber and relies on hook call
> order. Same idea, different storage.

## 9. Best Practices

✅ Reach for a closure when you want private state without a class

✅ Remove listeners and clear timers — that's what stops a closure becoming a leak

✅ In React, prefer the functional updater (`setCount(prev => …)`) over reading captured state

✅ Keep captured scopes small: capture the one field, not the whole object, when it matters

❌ Don't create closures inside a hot loop when a single shared function would do

## 10. Coding Exercise

Predict the output, then run it.

```js
function counter() {
  let n = 0;
  return { inc: () => ++n, get: () => n };
}

const c1 = counter();
const c2 = counter();

c1.inc();
c1.inc();
c2.inc();

console.log(c1.get(), c2.get());
```

<details>
<summary>Answer</summary>

```text
2 1
```

Each `counter()` call creates a new scope, so `c1` and `c2` never share `n`.

</details>

Now implement `once(fn)` — a function that only ever runs once:

<details>
<summary>Solution</summary>

```js
function once(fn) {
  let called = false;
  let result;

  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

const init = once(() => {
  console.log('initialising');
  return 42;
});

console.log(init(), init(), init());
```

Output:

```text
initialising
42 42 42
```

`called` and `result` live in the closure — one private scope per `once()` call, which is why
two wrapped functions never interfere.

</details>

And `memoize(fn)` for a single-argument function:

<details>
<summary>Solution</summary>

```js
function memoize(fn) {
  const cache = new Map();

  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}

let calls = 0;
const square = memoize((n) => { calls += 1; return n * n; });

console.log(square(9), square(9), 'calls:', calls);
```

Output:

```text
81 81 calls: 1
```

The cache is private to this wrapper. Two `memoize` calls get two caches, and nothing outside
can corrupt either — the whole benefit over a module-level object.

</details>

Finally, fix the loop **without** using `let`:

<details>
<summary>Solution</summary>

```js
for (var i = 0; i < 3; i++) {
  ((captured) => setTimeout(() => console.log(captured), 0))(i);
}
```

Calling a function creates a scope, and `captured` is a fresh parameter each iteration. This
is what everyone did before ES2015 — and the reason `let` was added.

</details>

## 11. Mini Challenge

Build a `createTimer()` factory that returns `{ start, stop, elapsed }`, keeping the interval
id and the accumulated time entirely private — nothing reachable from outside the returned
object.

Then explain which variables each returned function closes over, and what would leak if
`stop` were never called.

## 12. Lesson Summary

> [!RECAP]
> - A closure is a function plus the scope it was created in — lexical scope, observed later
> - The scope survives because the function still references it, not because anything was copied
> - Closures capture **variables, not values** — the source of every stale-value bug
> - Each call to a factory produces an independent scope
> - Private state, memoisation, partial application and the module pattern are all this one idea
> - React's stale `useEffect` is the `var` loop bug: a closure made once, never re-made
> - Keeping a closure alive keeps everything it captured alive — clean up listeners and timers

## Check your understanding

Answer these without looking back.

1. Define a closure in one sentence, without using the word "remembers".
2. Why is `count` still alive after `makeCounter()` has returned?
3. Explain why two calls to the same factory don't share state.
4. Does a closure capture the variable or its value? Prove it with the `var` loop.
5. Name three things you've used closures for without calling them closures.
6. Walk through why a `useEffect` with `[]` sees stale state, and give two different fixes.
7. When does a closure become a memory leak — and when is that just a normal reference?

## What's Next

**Lesson 6 — Primitive vs Reference Types.** Why `useEffect` fires every render, why state
updates get missed, and what actually happens when you copy a value.
