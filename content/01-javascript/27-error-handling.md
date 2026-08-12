# Lesson 27 — Error Handling & Propagation

**Interview importance:** ⭐⭐⭐ — how errors cross async boundaries. Directly relevant to error boundaries later.

A synchronous throw stops the program. A rejected promise is **data** — it flows through
chains and awaits until someone handles it, and if no one does, the process hears about it.
This lesson is the async error story built on Lessons 25 and 26, and it's the exact mechanic
React's error boundaries (Lesson 76) will lean on later.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain how a rejection becomes a throw under `await`
- Handle errors with `try/catch/finally` inside `async` functions
- Explain what `.catch` and `.finally` do on a chain, and why order matters
- Trace how errors propagate through `Promise.all` and `allSettled` (Lesson 26)
- Explain unhandled rejections and the correct way to attach a late handler

## 1. What is Error Propagation?

**A rejection flows outward — through `.then` chains and `await`s — until a handler catches it; an unhandled rejection surfaces globally.**

One rule drives everything in this lesson: **an `await` on a rejected promise throws**, and
a **thrown error inside an `async` function rejects its promise**. Both directions are the
same coin — errors travel as data until a handler turns them back into control flow.

## 2. Mental Model

Think of a rejected promise as a **red envelope** passed down a chain of hands. Each `.then`
passes it along unopened unless it has an `onRejected` hand. An `await` is a hand that
opens it — and throws, which stops that function and sends *its* promise's envelope on.

`finally` is the hand that opens nothing but **must run regardless** — cleanup, then passes
the envelope along. The envelope only stops at a `.catch`.

```text
chain:  fetch ──► .then ──► .then ──► .catch ──► .finally
        │         │         │         │           │
        │         │         │      ✋ opens it    runs, passes on
        │         │         │                     (if a catch already handled)
        └── rejection passes through until someone opens it
```

## 3. Visual Flow

```text
reject('boom')
      │
      ▼
await fetchUser() ──► throws inside async main()
                              │
                              ▼
                    main()'s promise rejects
                              │
              ┌───────────────┴──────────────┐
              │                              │
        try/catch in main            caller's .catch(fn)
        (local handling)            (handling by the caller)
```

## 4. How It Works

**Synchronous cleanup, still synchronous.** `try/catch/finally` in an `async` function
behaves exactly like it does in sync code:

```js {4-6}
function acquireLock() {
  return { release: () => console.log('lock released') };
}

const lock = acquireLock();
try {
  console.log('holding lock');
  throw new Error('timeout');
} catch (err) {
  console.log('caught:', err.message);
} finally {
  lock.release();
}
```

Output:

```text
holding lock
caught: timeout
lock released
```

**A rejected `await` throws at that line.** The rest of the function is skipped, and the
function's promise rejects with the same error:

```js {7}
function readConfig(path) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(`${path} not found`)), 5);
  });
}

async function main() {
  try {
    const config = await readConfig('config.json');   // throws here
    console.log(config);
  } catch (err) {
    console.log('handled:', err.message);
  }
}

main();
```

Output:

```text
handled: config.json not found
```

**A throw inside an `async` function is a rejection.** No `try` needed — the function
converts it for you:

```js {2}
async function parseJson(text) {
  if (typeof text !== 'string') throw new TypeError('expected a string');
  return JSON.parse(text);
}

(async () => {
  try {
    await parseJson(42);
  } catch (err) {
    console.log('caught:', err.name, '-', err.message);
  }
})();
```

Output:

```text
caught: TypeError - expected a string
```

**A returned rejected promise is also a rejection** — the function's promise adopts it:

```js
function fetchUser() {
  return Promise.reject(new Error('401 unauthorised'));
}

async function main() {
  try {
    const user = await fetchUser();
    console.log(user);
  } catch (err) {
    console.log('handled:', err.message);
  }
}

main();
```

Output:

```text
handled: 401 unauthorised
```

## 5. Real Project Usage

**Let the caller decide.** The function that knows *what happened* shouldn't always decide
what to *do*. Throw (or reject) and let the layer above handle policy:

```js
function getValue() {
  return new Promise((resolve) => setTimeout(() => resolve(7), 5));
}

async function load() {
  const value = await getValue();
  if (value > 5) throw new Error(`value ${value} is too large`);
  return value;
}

load().catch((err) => console.log('handled by caller:', err.message));
```

Output:

```text
handled by caller: value 7 is too large
```

This is the same shape React's error boundaries use later (Lesson 76): a component throws,
the boundary above catches. The error **crosses the boundary** by propagating up — async
chains just formalise that journey.

## 6. Interview Explanation

> Inside an `async` function, a rejected `await` throws at that line, and a thrown error
> rejects the function's promise. `try/catch/finally` handles both synchronously. Outside,
> `.catch` handles chain rejections; `.finally` runs cleanup either way. A rejection nobody
> handles becomes an unhandled rejection event.

## 7. Senior-Level Insights

Mid-level answers know `try/catch` works. Senior answers add the **boundaries**:

1. **Decide where errors are handled — near the source or at the top.** Handled too close
   to the source, you repeat `try/catch` everywhere and swallow context. Handled only at
   the top, you lose the specifics of what failed. The senior answer: wrap at meaningful
   boundaries — one per request, one per user action — with a final global net.
2. **Distinguish "expected" from "unexpected".** Expected failures (404, validation) are
   data; convert them to error *objects with context* and let the UI branch on them.
   Unexpected ones should crash loudly and reach the monitoring dashboard — don't swallow
   them to make the console quiet.
3. **Don't catch what you can't handle.** `try/catch` with an empty block hides bugs.
   If you can't recover, rethrow or let it propagate.
4. **`await Promise.all` throws on the first rejection (Lesson 26)** — if one failing
   request shouldn't kill the batch, that's `allSettled`, and you decide per-result.

## 8. Common Mistakes

❌ **Swallowing errors** — the worst habit in the language:

```js
try {
  await risky();
} catch (err) {
  // nothing — the bug is now invisible
}
```

❌ **Forgetting that `await` is required for the throw** — without it, a rejection is just
an unobserved promise:

```js
async function load() {
  const p = fetchUser();       // ❌ no await — rejection is unhandled here
  return 'loaded';
}
```

❌ **Awaiting after a `catch` that didn't rethrow** — code after the `try` assumes success:

```js
let user;
try {
  user = await fetchUser();
} catch (err) {
  console.error(err);          // ❌ didn't rethrow; user stays undefined
}
console.log(user.name);        // TypeError later, far from the cause
```

❌ **A `.catch` in the middle of a chain** — it catches, and the chain continues as
fulfilled, so a later `.catch` never fires. Attach **one catch at the end**.

## 9. Best Practices

✅ Always `await` promise-returning calls so rejections become throws (Lesson 25)

✅ One `try/catch` per meaningful boundary, not around every statement

✅ Use `finally` for cleanup — timers, locks, loading flags, `AbortController`

✅ Always end chains with a `.catch` (or hand the promise to `await` in a `try`)

✅ Rethrow when you can't handle — `catch (err) { cleanup(err); throw err; }`

❌ Don't swallow errors or log-and-continue as if nothing happened

❌ Don't put `.catch` in the middle of a chain unless you genuinely want to recover

## 10. Interview Questions

**Q1. How do errors work in `async`/`await`?**

> A rejected `await` throws at that line, so `try/catch` handles it. A throw inside the
> function rejects its promise, so callers can handle it with `await` in their own `try`, or
> with `.catch`. It's synchronous error handling applied to async flow.

**Q2. What is an unhandled promise rejection?**

> A rejected promise with no handler on its chain — no `.catch`, no awaited `try/catch`.
> The environment reports it (browser `unhandledrejection`, Node `unhandledRejection`), and
> Node treats it as fatal by default.

**Q3. `catch` vs `finally`?**

> `catch` runs only on rejection and stops the propagation — the chain continues fulfilled
> from there. `finally` runs whether the chain fulfilled or rejected, and passes the outcome
> through unchanged.

**Q4. How does an error propagate through `Promise.all`?**

> `all` rejects with the first rejection (Lesson 26), so the `await` throws — one `catch`
> around the `all` covers every source. If you need per-source outcomes instead, that's
> `allSettled`.

**Senior follow-up: Where do you catch errors in a large codebase?**

> At boundaries: each request, each user action, each render error boundary — plus one
> global net (an `unhandledrejection` listener, an error boundary at the root). The layer
> that knows the *context* decides; the layer that knows the *policy* handles. Never catch
> to silence.

## 11. Follow-up Questions

**Q1. Can `try/catch` handle errors from a promise you didn't await?**

> No. Only awaited (or `.then`-handled) promises route into your `try`. A fire-and-forget
> promise's rejection is unhandled.

**Q2. What happens if `.finally`'s callback throws?**

> Its rejection replaces the original outcome — the chain rejects with the new error.
> Keep `finally` callbacks side-effect-only.

**Q3. Does `allSettled` ever throw?**

> No — it always resolves with an array of `{status, value | reason}` (Lesson 26). You
> branch on `status` yourself.

## 12. Code Example: A Request Layer That Reports and Rethrows

```js
function fetchJson(url) {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error(`GET ${url} failed`)), 5)
  );
}

async function loadUser() {
  try {
    return await fetchJson('/api/user');
  } catch (err) {
    console.error('[loadUser]', err.message);   // log with context…
    throw err;                                   // …then let the caller decide
  }
}

loadUser()
  .then((user) => console.log(user))
  .catch((err) => console.log('[UI]', err.message));
```

Output:

```text
[loadUser] GET /api/user failed
[UI] GET /api/user failed
```

```narrate
line: the inner catch adds context but rethrows — the error keeps propagating
line: the outer .catch is the boundary that finally handles it
line: one log at the source, one decision at the edge — not a try/catch everywhere
```

## 13. Performance Notes

- **When it matters:** throwing and catching is cheap in absolute terms but not free — don't
  use exceptions for expected control flow (like validation on every keystroke).
- **When it doesn't:** a handful of caught errors per request is noise; the real cost is
  unhandled rejections crashing the process.
- A rejected `allSettled` *never* throws, so it can't crash a batch job — that's the
  performance-adjacent reason to prefer it for bulk work.

## 14. Debugging Scenarios

| Symptom | Likely cause |
|---|---|
| "Unhandled promise rejection" warning | A rejected promise with no handler — add `.catch` or await it |
| Error message appears twice | Logged in an inner `catch` and again in an outer one — fine, but don't log every layer |
| `finally` runs but `.catch` doesn't | The chain was already handled by a middle `.catch` |
| Code after `try` crashes on `undefined` | A `catch` that swallowed the error and didn't rethrow |
| Node exits on an async error | An unhandled rejection — Node treats it as fatal; that's the event loop's last resort |

## 15. Quick Revision Notes

- A rejected `await` **throws at that line** — `try/catch` works like sync code
- A **throw inside `async` rejects the function's promise** — callers see a rejection
- A **returned rejected promise** is adopted — the function's promise rejects too
- `.catch` stops propagation (chain continues fulfilled); `.finally` passes the outcome
  through
- `all` rejects on the first rejection; `allSettled` never throws (Lesson 26)
- Unhandled rejection ⇒ global event; Node crashes on it by default
- `finally` callbacks should be side-effect-only — a throw there replaces the outcome

## 16. Cheat Sheet

```js
async function handle() {
  let result;
  try {
    result = await risky();          // rejection → throw
  } catch (err) {
    console.error(err);              // decide: handle, or rethrow
    throw err;                       // rethrow to let callers decide
  } finally {
    cleanup();                       // always runs, passes outcome through
  }
  return result;
}

// chain form — one catch at the end
promise
  .then(step1)
  .then(step2)
  .catch(handleError)
  .finally(cleanup);
```

## 17. Key Takeaways

> [!RECAP]
> - A rejection is **data that flows** — through chains and `await`s — until a handler catches it
> - Inside `async`: rejected `await` throws; thrown errors reject the function's promise
> - `try/catch/finally` inside `async` works exactly like synchronous code
> - One `.catch` at the end of a chain; `finally` for cleanup that passes outcomes through
> - `all` propagates the **first** rejection; `allSettled` never throws (Lesson 26)
> - Unhandled rejections surface globally and crash Node — never leave a chain without a handler
> - The same "throw up to the boundary" shape powers React error boundaries (Lesson 76)

## Check your understanding

Answer these without looking back.

1. What does an `await` do to a rejected promise — at which exact point does control jump?
2. What happens to the error when a thrown error escapes an `async` function?
3. `catch` vs `finally`: which stops propagation, and which passes the outcome through?
4. Why is `user` possibly `undefined` after a `try/catch` that logged and didn't rethrow?
5. Trace an error through `Promise.all([…])` — where would you catch it?
6. What is an unhandled rejection, and what happens to the process when one occurs?

## What's Next

**Lesson 28 — Modern ES6+ Essentials.** Modules, optional chaining, nullish coalescing,
generators — the vocabulary of every modern codebase. You'll close out the async module
with the syntax that turns promises and error handling into everyday, readable code.
