# Lesson 26 — Promise Combinators

**Interview importance:** ⭐⭐⭐ — `all` vs `allSettled` vs `race` vs `any` — a fast way to check real experience.

Four methods, one question: *"You have several promises — when do you want to hear back?"*
Most developers have used `Promise.all`; interviewers probe the other three because picking
the wrong one is a real-world bug. These are combinators on top of the machinery from
Lessons 24 and 25 — they take an iterable of promises and return one promise.

## Learning Objectives

By the end of this lesson you should be able to:

- State the settlement rule of `all`, `allSettled`, `race` and `any` in one sentence each
- Explain why `all` failing fast can be a footgun
- Pick the right combinator from a scenario (parallel requests, partial failure, timeout, first-success)
- Implement a timeout with `Promise.race`
- Explain `AggregateError` from `any` and `all`

## 1. What are Promise Combinators?

**Static methods that take an iterable of promises and return a single promise that settles according to one rule.**

```text
all          → settle when EVERY promise fulfils, or on the FIRST rejection
allSettled   → settle when EVERY promise settles (fulfilled or rejected)
race         → settle on the FIRST settlement of any kind
any          → settle on the FIRST fulfilment, or with an AggregateError if ALL reject
```

One input, one output — the rule is the only thing you need to memorize.

## 2. Mental Model

Each combinator is a **venue with a different finish line**:

| Combinator | Finish line | Watch out |
|---|---|---|
| `all` | Needs **everyone** to finish OK | One failure and it bails early |
| `allSettled` | Waits for **everyone**, whatever happens | You inspect each result yourself |
| `race` | **First to cross the line**, win or lose | A fast failure loses to a slow success |
| `any` | **First to cross OK** | All failures → `AggregateError` |

## 3. Visual Flow

```text
            Promise.all([p1, p2, p3])
   p1 ✅ ─┐
   p2 ✅ ─┼─► [v1, v2, v3]        one rejection anywhere ──► reject(firstError)
   p3 ✅ ─┘

            Promise.allSettled([p1, p2, p3])
   p1 ✅ ─┐
   p2 ❌ ─┼─► [{status:'fulfilled'}, {status:'rejected'}, …]   always waits for all
   p3 ✅ ─┘

            Promise.race([p1, p2, p3])     first settlement, good or bad
   ────────► p2 ❌ settles first ──► reject

            Promise.any([p1, p2, p3])      first FULFILMENT
   ────────► p1 ✅ settles first ──► resolve
```

## 4. How It Works

The mechanics of each, precisely.

**`Promise.all` — fail fast.** It resolves with an array of values **in input order**, and
rejects with the **first rejection** — even if other promises are still pending:

```js {5}
const p1 = Promise.resolve('a');
const p2 = new Promise((resolve, reject) => setTimeout(() => reject('api down'), 5));
const p3 = new Promise((resolve) => setTimeout(() => resolve('c'), 30));

Promise.all([p1, p2, p3])
  .then((all) => console.log('all:', all))
  .catch((err) => console.log('caught:', err));
```

Output:

```text
caught: api down
```

`p3` is still running when `p2` rejects — `all` doesn't wait for it. That's the footgun:
one flaky request takes down the whole batch.

**`Promise.allSettled` — wait for everyone.** Never rejects; every result carries its own
`status`:

```js
const p1 = Promise.resolve('ok');
const p2 = new Promise((resolve, reject) => setTimeout(() => reject('boom'), 5));

Promise.allSettled([p1, p2]).then((results) => console.log(results));
```

Output:

```text
[
  { status: 'fulfilled', value: 'ok' },
  { status: 'rejected', reason: 'boom' }
]
```

**`Promise.race` — first to settle, good or bad:**

```js
const fast = new Promise((resolve) => setTimeout(() => resolve('fast'), 5));
const slow = new Promise((resolve) => setTimeout(() => resolve('slow'), 40));

Promise.race([fast, slow]).then((winner) => console.log('race winner:', winner));
```

Output:

```text
race winner: fast
```

**`Promise.any` — first to *fulfil*; all reject → `AggregateError`:**

```js
const e1 = Promise.reject('e1');
const e2 = new Promise((resolve, reject) => setTimeout(() => reject('e2'), 5));

Promise.any([e1, e2]).catch((err) => {
  console.log('any name:', err.name);
  console.log('any errors:', err.errors);
});
```

Output:

```text
any name: AggregateError
any errors: [ 'e1', 'e2' ]
```

## 5. Real Project Usage

| Scenario | Combinator |
|---|---|
| Load two dashboards and render only when both arrive | `all` |
| Sync 50 rows; a few will 404 — keep the rest | `allSettled` |
| Timeout a slow request (`race` against a timer) | `race` |
| Try CDN A, then CDN B, then fallback | `any` |
| Strict validation: all checks must pass | `all` |
| Prefetch images; the page renders even if one fails | `allSettled` |

The timeout pattern — `race` is the only combinator you'd hand-roll:

```js
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    ),
  ]);
}

const slowFetch = new Promise((resolve) => setTimeout(() => resolve('data'), 100));

withTimeout(slowFetch, 30, 'GET /stats')
  .then((data) => console.log(data))
  .catch((err) => console.log(err.message));
```

Output:

```text
GET /stats timed out
```

## 6. Interview Explanation

> `Promise.all` settles when every promise fulfils — array of values in input order — and
> rejects on the first rejection. `allSettled` waits for every promise and reports each
> result with its own status. `race` settles on the first settlement of any kind. `any`
> settles on the first fulfilment, or rejects with an `AggregateError` if all reject.

## 7. Senior-Level Insights

The four rules are table stakes. Senior-level answers add **why**:

1. **Fail-fast is a design decision, not a default.** `all` bails on the first rejection, so
   one flaky request can hide the useful data in the other three. When partial success is
   acceptable, `allSettled` gives you everything and you decide the policy in one place.
2. **`race` for timeout is one-sided.** The slow promise keeps running and can still reject
   later, becoming an unhandled rejection. A real `AbortSignal.timeout()` cancels the work
   instead of just ignoring it — prefer that when the API supports it.
3. **`any` is for redundancy.** "Try the next source" — the fast-path of failover logic.
4. **Combinators compose with `async` (Lesson 25).** `await Promise.allSettled([…])` inside
   an async function is the idiomatic way to run independent work without a fail-fast
   surprise.

## 8. Common Mistakes

❌ **Using `all` where a partial failure is fine** — one 404 rejects the whole batch:

```js
const results = await Promise.all(urls.map(fetch));   // ❌ one 404 kills all
```

❌ **Using `allSettled` when every promise *must* succeed** — you now write the error
handling by hand.

❌ **Using `race` for timeouts without handling the loser** — the slower promise's later
rejection can surface as an unhandled rejection.

❌ **Expecting `any` to be "like `race`"** — `race` settles on the first rejection too;
`any` ignores rejections unless *all* reject.

❌ **Forgetting `all` preserves input order** — it does, even when promises settle out of
order.

## 9. Best Practices

✅ Reach for `allSettled` when any promise may reject and the others still matter

✅ Use `all` for strict all-or-nothing batches (form validation, parallel must-haves)

✅ Implement timeouts with `race` (or `AbortSignal.timeout()` where supported)

✅ Use `any` for "first working source" — CDNs, replicas, fallbacks

✅ Wrap combinator results in `try/catch` or a `.catch` (Lesson 27)

❌ Don't let `all`'s fail-fast hide recoverable failures in production data paths

## 10. Interview Questions

**Q1. What's the difference between `all` and `allSettled`?**

> `all` settles when every promise fulfils and rejects on the first rejection — fail fast.
> `allSettled` always waits for every promise and returns an array of `{status, value |
> reason}` results, so it never rejects.

**Q2. When would you use `race`?**

> When the first settlement decides — most commonly timeouts: `race` the real promise
> against a timer that rejects. Also first-available responses where a slow success can
> lose to a fast one.

**Q3. What does `Promise.any` return if all promises reject?**

> An `AggregateError` whose `.errors` array holds every rejection reason.

**Q4. You have 10 requests and 2 will fail. Which combinator?**

> `allSettled`, because I want the 8 successful results and the 2 reasons, not a batch-wide
> failure. With `all` I'd lose everything to the first rejection.

**Senior follow-up: What's wrong with a `race`-based timeout?**

> The loser keeps running. If the real request later rejects, its rejection is unhandled and
> can crash or warn globally. A cancellation-based timeout — `AbortController` or
> `AbortSignal.timeout()` — stops the work, which is why fetch supports it.

## 11. Follow-up Questions

**Q1. Does `all` run the promises in parallel?**

> They were already started — the promises are created before `all` is called, so their
> work began in the previous line. `all` only observes and combines them.

**Q2. What order does `all` put the results in?**

> Input order, regardless of settlement order.

**Q3. What if you pass an empty array to each?**

> `all` and `allSettled` resolve immediately; `race` stays pending forever; `any` rejects
> with an `AggregateError` with no errors.

## 12. Code Example: Dashboard That Tolerates Failure

```js
function fetchStats() {
  return new Promise((resolve, reject) =>
    setTimeout(() => resolve({ visits: 120 }), 10)
  );
}

function fetchRecent() {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('recent unavailable')), 5)
  );
}

async function renderDashboard() {
  const [stats, recent] = await Promise.allSettled([fetchStats(), fetchRecent()]);

  const visits = stats.status === 'fulfilled' ? stats.value.visits : '—';
  const posts = recent.status === 'fulfilled' ? recent.value : ['(empty)'];

  return { visits, posts };
}

renderDashboard().then((d) => console.log(d));
```

Output:

```text
{ visits: 120, posts: [ '(empty)' ] }
```

```narrate
line: allSettled means one failing source can't take down the dashboard
line: each result is inspected on its own — the policy is decided here, in one place
line: the same shape works for image prefetch, sync jobs and health checks
```

## 13. Performance Notes

- **When it matters:** `all` vs sequential `await`s is the difference between worst-case
  latency of `max(...)` vs `sum(...)`. Starting N requests in one tick and combining is the
  point of the combinator.
- **When it doesn't:** a handful of calls where one dependency chain is inherently serial.
- `race`-based timeouts don't stop the underlying work — if the timed-out promise holds a
  connection or a timer, that resource lives on until it settles. Cancellation APIs are the
  real fix.

## 14. Debugging Scenarios

| Symptom | Likely cause |
|---|---|
| `all` rejects though most calls succeeded | One promise rejected — check each source; consider `allSettled` |
| `allSettled` results are `{status, value}`/`{status, reason}` shapes | That's the contract — you must branch on `status` |
| `race` "wins" with a rejection you expected to be late | First settlement wins, even if it's an error — use `any` for first success |
| `any` throws `AggregateError` | Every promise rejected — inspect `err.errors` |
| Results out of order | You mapped after settling, or expected `all` to return settlement order |

## 15. Quick Revision Notes

- `all`: all fulfil → `[values]` in input order; **first rejection wins** (fail fast)
- `allSettled`: waits for everyone; never rejects; `{status, value | reason}` per result
- `race`: **first settlement** of any kind decides
- `any`: first **fulfilment** decides; all rejected → `AggregateError`
- Promises are created (and start) before the combinator runs — combinators only observe
- Timeouts: `race` against a rejecting timer, or `AbortSignal.timeout()` for real
  cancellation

## 16. Cheat Sheet

```js
Promise.all([p1, p2]).then(([a, b]) => a + b);      // all or nothing, fail fast
Promise.allSettled([p1, p2]);                        // every outcome, never rejects
Promise.race([p, timeout(3000)]);                    // first settlement wins
Promise.any([cdnA, cdnB, fallback]);                 // first success wins

// timeout helper
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
```

## 17. Key Takeaways

> [!RECAP]
> - Four combinators, four rules: `all` fail-fast, `allSettled` waits for all,
>   `race` first settlement, `any` first fulfilment
> - `all` returns values in **input order** and rejects with the **first** rejection
> - `allSettled` never rejects — each result carries its own `status` (Lesson 25's `await` loves this)
> - `race` is the timeout tool; `any` is the failover tool
> - `any` all-rejected ⇒ `AggregateError` with `.errors`
> - Promises start before the combinator — these methods only combine, they don't launch

## Check your understanding

Answer these without looking back.

1. State the settlement rule of each of the four combinators in one sentence.
2. Why is `all` called "fail fast", and when is that the wrong behaviour?
3. You have 12 sync requests and 3 will fail. Which combinator, and what do you do with the results?
4. Implement `withTimeout(promise, ms)` with `race`. What happens to the loser?
5. What does `Promise.any` reject with, and what's inside it?
6. When are the promises in `Promise.all([…])` actually started?

## What's Next

**Lesson 27 — Error Handling & Propagation.** How errors cross async boundaries — the 
`try/catch` inside `async`, the `.catch` at the end of a chain, and how a senior keeps an
unhandled rejection from ever reaching production.
