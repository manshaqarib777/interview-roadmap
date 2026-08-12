# Lesson 25 — async / await

**Interview importance:** ⭐⭐⭐⭐ — everyone uses it; few can explain that it is syntax over the same microtask queue.

`await` feels like magic: code that reads like synchronous `return` statements, but runs on
the event loop. It's not magic — it's **sugar over the promise machinery from Lesson 24**.
An `async` function is a function whose whole body becomes a promise, and `await` is a
`.then` in disguise, pausing the function on the microtask queue (Lesson 23).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `async` does to a function's return value
- Explain what `await` actually does to the function's execution
- Rewrite an `async`/`await` snippet as equivalent `.then` chains
- Say why `await` in a `forEach` doesn't wait, and fix it
- Answer the "is `await` blocking?" question precisely

## 1. What is `async` / `await`?

**`async` makes a function return a promise; `await` pauses the function until a promise settles, then resumes on the microtask queue.**

An `async` function **never** returns its literal value:

```js {2}
async function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('Sam'));
```

Output:

```text
Promise { 'Hello, Sam!' }
```

The function body is a promise machine. Whatever it `return`s becomes the promise's
fulfilment value — you read it with `await` or `.then`, never directly.

## 2. Mental Model

An `async` function is a **synchronised runner**. It runs like normal code until it hits an
`await`, then it taps out: the event loop is free to do anything else. When the awaited
promise settles, the runner is **rescheduled as a microtask** (Lesson 23) and continues from
the exact next line.

```text
async function load() {
  const a = await stepA();   // suspend here
  const b = await stepB();   // resume → suspend again
  return combine(a, b);      // resume → settle the outer promise
}
```

Each `await` is a checkpoint. Between checkpoints, the whole app is free to run.

## 3. Visual Flow: `await` Is a `.then`

```text
await promise
      │
      ▼
┌─────────────────┐     settle?      ┌──────────────────────────┐
│ pause function  │────────────────►│ resume as a MICROTASK     │
│ (yield control) │   no, still     │ value lands in the await  │
└─────────────────┘   pending ─────►│ expression (or throws)    │
                                    └──────────────────────────┘
```

Same queue, same ordering rules as Lesson 23: an `await` resumes **before** the next
macrotask, and before any `.then` attached later in the same tick.

## 4. How It Works: `await` Is Not `return`

`await` does three things: unwrap a promise, **suspend** the function, and resume on the
microtask queue. It is not a `return` — the code after it still runs, and whatever the
function eventually returns is what resolves its promise:

```js {4}
const p = Promise.resolve(5);

p.then((value) => {
  console.log('first then:', value);
  return value * 2;
}).then((value) => console.log('second then:', value));
```

Output:

```text
first then: 5
second then: 10
```

The equivalent `async`/`await` — same microtask timeline:

```js
const p = Promise.resolve(5);

async function run() {
  const value = await p;
  console.log('first then:', value);
  return value * 2;
}

run().then((value) => console.log('second then:', value));
```

Output:

```text
first then: 5
second then: 10
```

An `await` resumes the function exactly like a `.then` handler runs — as a microtask, after
the current task finishes. Everything you learned about microtask ordering in Lesson 23
applies to `await` verbatim.

## 5. Real Project Usage

```js
function fetchUser(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: 'Sam' }), 10));
}

function fetchPosts(userId) {
  return new Promise((resolve) => setTimeout(() => resolve(['post-1', 'post-2']), 10));
}

async function loadProfile(id) {
  const user = await fetchUser(id);       // sequential: posts need the user
  const posts = await fetchPosts(user.id);
  return { user, posts };
}

loadProfile(7).then((profile) => console.log(profile));
```

Output:

```text
{ user: { id: 7, name: 'Sam' }, posts: [ 'post-1', 'post-2' ] }
```

When two calls are independent, don't `await` them one after another — run them in parallel:

```js
function fetchStats() {
  return new Promise((resolve) => setTimeout(() => resolve({ visits: 10 }), 10));
}

function fetchRecent() {
  return new Promise((resolve) => setTimeout(() => resolve(['a', 'b']), 10));
}

async function loadDashboard() {
  const [stats, recent] = await Promise.all([fetchStats(), fetchRecent()]);  // parallel
  return { stats, recent };
}

loadDashboard().then((d) => console.log(d));
```

Output:

```text
{ stats: { visits: 10 }, recent: [ 'a', 'b' ] }
```

`await Promise.all([…])` is the async version of `Promise.all` from Lesson 26 — one
resumption, two parallel requests.

## 6. Interview Explanation

> `async` marks a function as returning a promise. `await` pauses the function until the
> promise settles, then resumes it on the microtask queue — it's `.then` written as syntax.
> The function's return value resolves its promise, and a thrown error rejects it.

## 7. Senior-Level Insights

The mid-level answer stops at "it's sugar." A senior adds **what the sugar buys you**:

1. **Errors become try/catch.** A rejected `await` *throws* at the exact line — no more
   callback-style error plumbing. That's the entire topic of Lesson 27.
2. **Sequencing is explicit.** `await` makes the dependency between calls visible, and
   `Promise.all` marks the ones that don't depend on each other.
3. **`await` is not blocking.** The event loop keeps running; only this one function
   suspends. A senior can say it precisely: *await yields control and re-enters via the
   microtask queue.*

And the trap worth naming unprompted — `forEach` doesn't await:

```js {2}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  [1, 2, 3].forEach(async (n) => {          // ❌ fire-and-forget callbacks
    await wait(10);
    console.log('forEach tick', n);
  });
  console.log('forEach done');              // runs first
})();
```

Output:

```text
forEach done
forEach tick 1
forEach tick 2
forEach tick 3
```

`forEach` calls the callback three times and moves on; the callbacks are three separate
async functions racing in parallel. The `for...of` loop awaits properly:

```js
(async () => {
  for (const n of [1, 2, 3]) {              // ✅ each iteration waits
    await wait(10);
    console.log('for-of tick', n);
  }
  console.log('for-of done');
})();
```

Output:

```text
for-of tick 1
for-of tick 2
for-of tick 3
for-of done
```

## 8. Common Mistakes

❌ **`await` in a `forEach`** — the loop doesn't wait; use `for...of` or `Promise.all`.

❌ **`await` on a non-promise** — it works (the value passes through), but it signals you're
not sure what's async. `await` on a settled value still costs a microtask.

❌ **Treating the function's return as the awaited value:**

```js
async function load() {
  return fetch('/api/data');      // returns a promise, not data
}
```

❌ **`await`ing in a non-async function** — `SyntaxError`. The keyword only exists inside
`async` bodies (and top-level module code).

## 9. Best Practices

✅ `await` sequential steps, `Promise.all` independent ones (Lesson 26)

✅ Let errors flow to a `try/catch` or a caller's `.catch` — Lesson 27

✅ Return values from the function instead of awaiting the last line

✅ Use `for...of` when you genuinely need to await inside a loop

❌ Don't `await` inside `forEach`/`map` and expect waiting

❌ Don't mark every function `async` "just in case" — it changes the return type

## 10. Interview Questions

**Q1. What does `async` do to a function?**

> It makes the function return a promise. Whatever the function returns becomes the promise's
> value; a thrown error rejects it. Inside, `await` can be used.

**Q2. What does `await` do?**

> It pauses the function until the promise settles, then resumes on the microtask queue with
> the value — or throws if the promise rejected. It's `.then` written as syntax.

**Q3. Is `await` blocking?**

> No — only the function suspends. The event loop keeps running other tasks and callbacks.
> The function is rescheduled as a microtask when the promise settles.

**Q4. Why doesn't `await` work inside `forEach`?**

> `forEach` calls the callback and moves on without awaiting it. Each callback is a separate
> async function. Use `for...of` or `Promise.all` instead.

**Senior follow-up: Rewrite `async`/`await` as `.then` chains — what's the mapping?**

> The function body becomes a promise. Each `await` becomes a `.then` that resumes the rest
> of the body with the value. The final `return` fulfils the outer promise; a `throw` or a
> rejected `await` rejects it. The microtask scheduling is identical either way — it's the
> same queue from Lesson 23.

## 11. Follow-up Questions

**Q1. What does `await 5` do?**

> Passes `5` through after one microtask — non-promises resolve to themselves. Usually a
> sign you're awaiting something that's already synchronous.

**Q2. Can you use `await` at the top level of a script?**

> In a browser module or a Node ESM module, yes — top-level await. In CommonJS scripts, no.

**Q3. What's the difference between `await p` and `p.then`?**

> Semantics are the same; the difference is control flow. `await` suspends the enclosing
> function, keeping the rest of the code in the same scope; `.then` needs a new function for
> each step.

## 12. Code Example: Async Sequence with a Parallel Step

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function processUser(id) {
  const user = await wait(5).then(() => ({ id, name: 'Sam' }));   // sequential
  const [posts, friends] = await Promise.all([                    // parallel
    wait(5).then(() => ['post-1', 'post-2']),
    wait(5).then(() => ['alex', 'jordan']),
  ]);
  return { user, posts, friends };
}

processUser(7).then((result) => console.log(result));
```

Output:

```text
{ user: { id: 7, name: 'Sam' }, posts: [ 'post-1', 'post-2' ], friends: [ 'alex', 'jordan' ] }
```

```narrate
line: the first await is sequential — `posts` and `friends` don't need each other
line: `Promise.all` starts both requests in the same tick, so they run in parallel
line: one await resumes the function once, after both settle
```

## 13. Performance Notes

- **When it matters:** sequential `await`s over independent network calls add latency
  linearly — `await` each one only when the next step depends on it, and use `Promise.all`
  otherwise.
- **When it doesn't:** two or three awaited calls in a handler; the difference is tens of
  milliseconds, not a bottleneck.
- Awaiting inside a loop (each item needs its own request) is the classic serialization
  mistake — either accept the serial cost or batch with combinators (Lesson 26).

## 14. Debugging Scenarios

| Symptom | Likely cause |
|---|---|
| Function returns a promise instead of the value | `async` function — log `await fn()` or `.then(...)`, not `fn()` |
| Logs print out of order | Forgot `await`, or awaited a fire-and-forget call |
| "Can only await async" | `await` used outside an `async` function (or non-module top level) |
| Values are `undefined` in the next step | A promise-returning call that wasn't awaited, or a handler that didn't return |
| Loop results arrive in random order | `forEach`/`map` with async callbacks — they all started together |

## 15. Quick Revision Notes

- `async` function ⇒ always returns a promise; body's `return`/`throw` becomes its settlement
- `await` ⇒ pause here, resume as a **microtask** with the value, or **throw** on rejection
- `await` is `.then` as syntax — same queue, same ordering (Lesson 23)
- Sequential by default: each `await` waits; use `Promise.all` for parallel
- `forEach` does **not** await — use `for...of` or `Promise.all`
- `await` is non-blocking: only this function suspends, the event loop keeps running

## 16. Cheat Sheet

```js
async function load() {
  const data = await fetch('/api/data');   // pause & resume as a microtask
  return transform(data);                  // resolves load()'s promise
}

// equivalent chain
function load() {
  return fetch('/api/data')
    .then((data) => transform(data));
}
```

## 17. Key Takeaways

> [!RECAP]
> - `async` makes a function return a **promise**; `return` fulfils it, `throw` rejects it
> - `await` **pauses** the function and **resumes on the microtask queue** (Lesson 23)
> - `await` is `.then` written as syntax — never `return`, and never blocking
> - Sequential awaits are explicit dependencies; use `Promise.all` for parallel work
> - `forEach` + `async` is fire-and-forget; `for...of` awaits properly
> - Errors from a rejected `await` become **thrown exceptions** — the hook into Lesson 27

## Check your understanding

Answer these without looking back.

1. What does an `async` function always return? What settles that promise?
2. What does `await` do to the function's execution — and on which queue does it resume?
3. Rewrite `const v = await p; use(v);` as an equivalent `.then` chain.
4. Why doesn't `[1,2,3].forEach(async () => …)` wait for each callback? Give two fixes.
5. Is `await` blocking? Answer as if the interviewer expects a trick.
6. Two independent `fetch` calls: do you `await` them one after the other? Why not?

## What's Next

**Lesson 26 — Promise Combinators.** `Promise.all` vs `allSettled` vs `race` vs `any` — a
fast way to check real experience. You'll learn which one to reach for when some requests
may fail.
