# Lesson 24 — Promises from Scratch

**Interview importance:** ⭐⭐⭐⭐ — writing a minimal Promise proves you understand the state machine, not just the API.

Anyone can recite `.then` and `.catch`. The interview question that separates people is
*"implement a Promise"* — because it forces you to show that a Promise is a state machine
with **pipelined callbacks**, not a magic box. By the end of this lesson you can build one
in ~30 lines and explain every line.

If you haven't yet, run Lessons 22 and 23 first — the settlement callbacks in this lesson
run on the same microtask queue you studied there.

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the `pending → fulfilled / rejected` state machine from memory
- Implement a minimal Promise: executor, two internal callbacks, `.then` chaining
- Explain why `.then` always returns a new promise and what that enables
- Trace what runs now vs later, in microtask order (Lesson 23)
- Spot the places a hand-rolled promise breaks vs the real one

## 1. What is a Promise?

**A Promise is an object with a state, a settled value, and a queue of callbacks.**

Three states, one transition each, no going back:

```text
           ┌──────────┐
  resolve──► fulfilled │◄── .then handlers run
           └──────────┘
  pending ─┤
           ┌──────────┐
  reject───► rejected  │◄── .catch handlers run
           └──────────┘
```

A promise that resolves with `42` doesn't hold a function that "calls back later". It holds
the **state `fulfilled`**, the **value `42`**, and the handlers you attached. Everything else
is sugar.

## 2. Mental Model

A Promise is an **inbox**. When you create one, you get an inbox and the keys to it
(`resolve` and `reject`). Handlers you attach are letters that wait in the tray — they run
when the inbox is **opened**, which may be long after you attached them.

That's why this works:

```js
const promise = new Promise((resolve) => {
  setTimeout(() => resolve('done'), 1000);
});

promise.then((value) => console.log(value));   // attached now, runs in 1s
promise.then((value) => console.log(value));   // every handler gets the value
```

Output (one second later):

```text
done
done
```

One settled value, many handlers, each independent. You cannot "re-resolve" — first
settlement wins.

## 3. Visual Flow: Promise Under the Hood

```text
new Promise(executor)
        │
        ▼
   ┌──────────┐   resolve(v) / reject(e)
   │  pending │──────────────────────────────┐
   │ handlers │                              │
   └────┬─────┘                              ▼
        │                             ┌───────────────┐
        │                             │ state is set, │
        │                             │ value stored  │
        │                             └───────┬───────┘
        │                                     │ handlers moved
        │                                     │ to the microtask
        │                                     ▼
        │                              ┌───────────────┐
        └────── handlers run ─────────►│  microtask    │  (Lesson 23)
                                       │  queue        │
                                       └───────────────┘
```

The state change is synchronous — the **handlers are not**.

## 4. How It Works: The API Contract

```js
const promise = new Promise((resolve, reject) => {
  // your async work goes here
  resolve(value);   // ✅ or reject(error) — first call wins
});
```

- The executor runs **synchronously**, before the constructor returns.
- `resolve` / `reject` are just functions — the state machine's two inputs.
- `.then` returns a **new** promise, so chains compose:

```js
Promise.resolve(5)
  .then((value) => value * 2)
  .then((value) => value + 1)
  .then((value) => console.log(value));
```

Output:

```text
11
```

Each `.then` is a fresh promise that settles with whatever the previous handler **returned**
(or throws). That single rule is the entire superpower.

## 5. Real Project Usage

| Where | The promise part |
|---|---|
| **`fetch`** | `fetch('/api/user')` returns a promise; `.then(res => res.json())` unwraps it |
| **React Query / SWR** | cache the promise, dedupe requests, keep the same promise for refetch |
| **`setTimeout`-based retries** | a promise that resolves on success or rejects after N attempts |
| **Lazy-loading images** | a promise resolved by the `load` event, rejected by `error` |
| **DB / I/O in the backend** | every driver call returns a promise you await |

## 6. Interview Explanation

> A Promise is an object with three states — pending, fulfilled, rejected — that stores the
> settled value and runs attached callbacks once settlement happens. `.then` returns a new
> promise chained to the previous one, so async sequences read linearly instead of nesting.
>
> Under the hood it's a state machine plus a handler queue drained on the microtask queue.

## 7. Senior-Level Insights

The 30-second answer gets the state machine. The senior answer also gets **the two rules
that make promises compose**:

1. **A promise adopts the state of whatever is returned from a handler.** Return a promise
   from `.then` and the outer one waits for it — this is *assimilation*, and it's what makes
   flattening possible.
2. **Chains are promises, not callbacks.** A bug in `.then` handler N+1 rejects the chain
   and is caught by the `.catch` at the end. There's no "callback hell" re-entry point.

A senior can also say *why* handlers can't run synchronously: if a handler ran inline during
`resolve`, a promise resolved before its `.then` was attached would call the handler in the
wrong order. Deferring to the microtask queue guarantees **attachment order == execution
order**.

## 8. Common Mistakes

❌ Forgetting that **state changes are synchronous** — logging right after `resolve` shows
`pending`:

```js
const promise = Promise.resolve(1);
console.log(promise);                     // Promise { 1 }  (already settled)
```

❌ **Resolving twice** and expecting the second call to matter — first settlement wins.

❌ **Not returning in `.then`** — the next handler gets `undefined`:

```js
Promise.resolve(5)
  .then((value) => { console.log(value); })          // forgot `return`
  .then((value) => console.log(value));              // undefined
```

Output:

```text
5
undefined
```

❌ **Ignoring rejection** — a rejected promise with no handler on the chain becomes an
`unhandledrejection` event.

## 9. Best Practices

✅ Always return the promise from `.then` when you want to chain it

✅ End chains with a `.catch` — one rejection handler per chain

✅ Attach handlers once; re-reading state is a code smell

✅ Use `Promise.resolve`/`Promise.reject` for wrapping values

❌ Don't create promises around things that already return one — that's the "new Promise
anti-pattern"

❌ Don't call `resolve`/`reject` more than once

## 10. Interview Questions

**Q1. What is a Promise?**

> An object representing an eventual value: pending, fulfilled, or rejected. It holds the
> settled value and runs attached handlers once settlement happens. `.then` returns a new
> promise, so async flows compose instead of nesting.

**Q2. Implement a minimal Promise.**

> See Section 12 — a state machine with two internal callbacks, a handler queue, and a
> `.then` that returns a new promise wired through `resolve`/`reject`.

**Q3. Why does `.then` return a new promise?**

> So chains are promises end to end. Every `.then` creates a fresh promise that settles with
> the previous handler's return value — you can keep chaining, or hand the tail to `await`.

**Q4. Why don't handlers run synchronously?**

> Ordering. If a handler ran inline during `resolve`, handlers attached *after* settlement
> would need different rules. Deferring to the microtask queue means attachment order is
> always execution order, whether the promise settled before or after `.then` was called.

**Senior follow-up: What is thenable assimilation?**

> When a handler returns a promise, the outer promise adopts its state — it waits. That's
> how a chain flattens instead of nesting: `then(x).then(y)` where `y` depends on an async
> `x`. Without it, chaining promises would need explicit nesting.

## 11. Follow-up Questions

**Q1. What happens if the executor throws?**

> The thrown error rejects the promise automatically — it's equivalent to calling `reject`.

**Q2. Can a promise be both fulfilled and rejected?**

> No. Settlement is one-way; after the first `resolve` or `reject`, every later call is
> ignored.

**Q3. Where do handlers run, exactly?**

> On the microtask queue, after the current task — never synchronously. That's Lesson 23's
> territory: `setTimeout` callbacks are macrotasks and can run *after* microtasks queued
> later.

## 12. Code Example: A Minimal Promise

The flagship implementation — a state machine with `pending/fulfilled/rejected`, thenable
chaining, and microtask dispatch:

```js {6,10,19-32}
function MinimalPromise(executor) {
  this._state = 'pending';        // 'pending' | 'fulfilled' | 'rejected'
  this._value = undefined;
  this._handlers = [];

  const settle = (state, value) => {
    if (this._state !== 'pending') return;   // first settlement wins
    this._state = state;
    this._value = value;
    this._handlers.splice(0).forEach((h) => this._run(h));
  };

  const run = (handler) => {
    if (this._state === 'pending') { this._handlers.push(handler); return; }
    queueMicrotask(() => {
      if (handler.onFulfilled && this._state === 'fulfilled') handler.onFulfilled(this._value);
      if (handler.onRejected && this._state === 'rejected') handler.onRejected(this._value);
    });
  };
  this._run = run;

  this.then = function (onFulfilled, onRejected) {
    return new MinimalPromise((resolve, reject) => {
      run({
        onFulfilled: (value) => {
          try {
            const next = onFulfilled ? onFulfilled(value) : value;
            resolve(next);
          } catch (err) { reject(err); }
        },
        onRejected: (reason) => {
          if (!onRejected) { reject(reason); return; }
          try { resolve(onRejected(reason)); } catch (err) { reject(err); }
        },
      });
    });
  };

  try {
    executor(settle.bind(this, 'fulfilled'), settle.bind(this, 'rejected'));
  } catch (err) {
    settle.call(this, 'rejected', err);
  }
}

MinimalPromise.resolve = (value) => new MinimalPromise((resolve) => resolve(value));

const p = new MinimalPromise((resolve) => setTimeout(() => resolve('done'), 0));
p.then((value) => {
  console.log('then 1:', value);
  return value.toUpperCase();
}).then((value) => console.log('then 2:', value));

MinimalPromise.resolve(1)
  .then((v) => v + 1)
  .then((v) => console.log('chain:', v));

const rp = new MinimalPromise((resolve, reject) => reject('nope'));
rp.then(() => console.log('BAD: fulfilled handler ran'))
  .then(undefined, (err) => console.log('caught:', err));
```

```text
then 1: done
then 2: DONE
chain: 2
caught: nope
```

```narrate
line: `settle` is the whole state machine — flip state, store value, flush the queue
line: `run` either queues the handler while pending, or schedules it as a microtask once settled
line: `then` returns a NEW MinimalPromise wired so a handler's return value resolves it — that's chaining
line: the missing handler skips through so a rejection stays rejected until a `.catch` shows up
```

> [!NOTE]
> The real `Promise` also assimilates thenables (a returned promise's state is adopted), and
> `queueMicrotask` has a native scheduling primitive (Lesson 23). The skeleton above is the
> same machine minus that adoption step.

## 13. Performance Notes

- **When it matters:** many independent promises (a list of `fetch` calls) — batching them
  with `Promise.all` (Lesson 26) beats attaching handlers one by one.
- **When it doesn't:** a handful of awaits in a request handler; the microtask overhead is
  nanoseconds and never your bottleneck.
- Creating a promise per item in a hot render loop is fine; creating them per keystroke
  inside a search debounce is a smell — debounce first (Lesson 18).

## 14. Debugging Scenarios

| Symptom | Likely cause |
|---|---|
| Handler never runs | Promise never settles — find the missing `resolve`/`reject` call |
| `undefined` in the next `.then` | A handler that doesn't `return` its value |
| "Unhandled promise rejection" | A rejected promise with no `.catch` on its chain |
| Handler runs twice | `resolve` called in two code paths, or the executor called twice |
| Value changes after resolve | The resolved value was an object you mutate later — resolve a copy if that matters |

## 15. Quick Revision Notes

- A Promise has **three states**: `pending`, `fulfilled`, `rejected` — one transition, final.
- The executor runs **synchronously**; handlers never do.
- `.then` **returns a new promise** — that's what makes chains work.
- The first `resolve`/`reject` wins; later calls are ignored.
- A handler's **return value** becomes the next promise's value; a **throw** becomes its
  rejection.
- Handlers run on the **microtask queue** (Lesson 23), in attachment order.

## 16. Cheat Sheet

```js
const p = new Promise((resolve, reject) => { /* … */ });
p.then(onFulfilled, onRejected);   // returns a new promise
p.catch(onRejected);               // sugar for .then(undefined, onRejected)
p.finally(onFinally);              // runs whether fulfilled or rejected

Promise.resolve(value);            // already-fulfilled promise
Promise.reject(error);             // already-rejected promise
Promise.all(iterable);             // Lesson 26
Promise.allSettled(iterable);      // Lesson 26
Promise.race(iterable);            // Lesson 26
Promise.any(iterable);             // Lesson 26
```

## 17. Key Takeaways

> [!RECAP]
> - A promise is a **state machine**: `pending → fulfilled | rejected`, first settlement wins
> - The executor runs synchronously; **handlers run later**, on the microtask queue (Lesson 23)
> - `.then` **returns a new promise**, so chains compose and stay promises end to end
> - A handler's return value fulfils the next promise; a throw rejects it
> - A minimal implementation is ~30 lines: state, value, a handler queue, and a `then`
> - Rejections with no handler become unhandled-rejection events — always end chains with `.catch`

## Check your understanding

Answer these without looking back.

1. Draw the promise state machine from memory, including what can and can't happen from each state.
2. Why does `.then` return a new promise instead of the same one?
3. The executor runs synchronously, but handlers never do. Why is that ordering rule essential?
4. In the minimal implementation, what does `settle` do, and why does it check `this._state !== 'pending'`?
5. What happens to a rejection when a `.then` handler is missing its `onRejected`? Trace it through the chain.
6. Name the two internal callbacks a promise needs, and which one wires to `.then`'s returned promise.

## What's Next

**Lesson 25 — async / await.** Everyone uses it; few can explain that it is syntax over the
same microtask queue. You'll see why `await` is not `return`, and what the engine does with
your `async` function's promise.
