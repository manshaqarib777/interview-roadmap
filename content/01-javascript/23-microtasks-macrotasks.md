# Lesson 23 — Microtasks vs Macrotasks

**Interview importance:** ⭐⭐⭐⭐ — the output-ordering puzzle. Getting it exactly right is a
senior signal.

Every "what does this print?" async question is one rule: **microtasks before tasks**. This
lesson builds on Lesson 22's event loop and makes the ordering precise enough to predict
byte-for-byte.

## Learning Objectives

By the end of this lesson you should be able to:

- Tell a microtask from a macrotask by which API produced it
- Explain why the microtask queue drains completely before the next task
- Predict the exact output of `setTimeout` + Promise + `console.log` puzzles
- Explain why `await` output can surprise people
- Say why an infinite microtask loop can freeze a page while infinite timers can't

## 1. One-line Definition

**Microtasks (Promises, `queueMicrotask`) run right after the current script, all of them,
before the event loop touches a single macrotask (timers, events, I/O) again.**

Two queues, one iron rule: the microtask queue is fully drained before the next task ever
runs.

## 2. Mental Model

**A task is a table in a restaurant; a microtask is the bill for the last table.**

The waiter (event loop) finishes seating and serving a table (runs a task to completion).
Before seating the *next* table, they run the card machine (microtasks) — and they run *every
pending charge*, even the ones that just arrived while the machine was working. Only when
every card has cleared does the next table get seated.

One table per visit. All bills before the next table. That's the entire model.

## 3. Visual Flow

```text
        TASK 1 (macrotask)          MICROTASK QUEUE            TASK 2 (macrotask)
   ┌────────────────────────┐   ┌──────────────────────┐   ┌────────────────────────┐
   │ setTimeout callback /  │   │ promise.then         │   │ next timer callback /  │
   │ event handler / I/O    │   │ .catch .finally      │   │ event / I/O            │
   └───────────┬────────────┘   │ queueMicrotask       │   └───────────┬────────────┘
               │                └──────────┬───────────┘               │
               │  task runs to             │  drained to               │
               │  completion               │  ZERO before              │
               ▼                           │  ANY task                 ▼
   ┌──────────────────────┐   ┌────────────▼───────────┐   ┌──────────────────────┐
   │  stack empty?        │   │  stack empty?          │   │  stack empty?        │
   │  microtasks pending? │──►│  run ALL microtasks    │──►│  run next task       │
   └──────────────────────┘   └────────────────────────┘   └──────────────────────┘
         sync code, line by line           microtasks that microtasks
                                           create ALSO run now
```

The loop never skips the microtask drain: *stack empty → drain microtasks → run one task →
drain microtasks → …*

## 4. How It Works

### The two queues

| Queue | Fed by | Runs when |
|---|---|---|
| **Macrotask queue** | `setTimeout`, `setInterval`, events, I/O callbacks, `setImmediate` | One per loop turn, after microtasks |
| **Microtask queue** | Promise `.then/.catch/.finally`, `async/await`, `queueMicrotask`, `process.nextTick`* | The whole queue, every time the stack empties |

\* `process.nextTick` is Node-specific and runs *before* other microtasks — a detail to
mention once and move on.

### The classic puzzle — predict, then read

```js
console.log('1 sync');

setTimeout(() => console.log('2 timeout'), 0);

Promise.resolve()
  .then(() => console.log('3 promise'))
  .then(() => console.log('4 promise'));

console.log('5 sync');
```

Output:

```text
1 sync
5 sync
3 promise
4 promise
2 timeout
```

```narrate
line 1: synchronous — prints immediately
line 3: timer queued as a macrotask (it will wait for a full loop turn)
line 5: the first .then is queued as a microtask — right after the current script
line 6: the second .then queues only AFTER the first one resolves, but still in the same microtask drain
line 8: synchronous — prints immediately, script ends, stack empties
after: microtask queue drains: "3 promise", then "4 promise"
after: the loop finally reaches the macrotask: "2 timeout"
```

Two "timeouts" would still lose to one promise, because microtasks drain before *any* task —
including ones scheduled 500 ms earlier.

### Why the whole microtask queue drains

A microtask can queue another microtask, and the drain does not stop to check the task queue
in between:

```js
Promise.resolve()
  .then(() => { console.log('a'); Promise.resolve().then(() => console.log('b')); })
  .then(() => console.log('c'));

setTimeout(() => console.log('d'), 0);
```

Output:

```text
a
c
b
d
```

The `.then` chain is one queue: `a`, then `c` (chained on the original promise), then `b`
(the one created inside the first handler — added while draining, but still a microtask, so
it still wins). `d` waits for the *entire* drain, not just the first microtask.

> [!TIP]
> Watch this in the DevTools console: log `setTimeout(() => console.log('x'), 0)` and a
> Promise, and the promise always logs first. It is the single most reliable fact in async
> JavaScript.

## 5. Real Project Usage

Microtask-vs-macrotask ordering isn't trivia — it's the shape of the web platform.

| Situation | What's really happening |
|---|---|
| **`useEffect` vs layout effects** | React's effects are scheduled as microtasks/tasks — ordering you can rely on |
| **State update batching** | React 18 batches updates, then flushes them in a microtask — the "one render behind" confusion (module overview) |
| **`.then` after `.then`** | Every continuation is a fresh microtask — they chain without touching the task queue |
| **`await` in a loop** | Each `await` yields to the microtask queue — the loop can *look* sequential while interleaving |
| **Toast/notification after data load** | If you read it synchronously you paint before the DOM updates; queuing microtasks changes what you render |
| **Flushing a "dirty" flag** | `queueMicrotask` gives you *"after this batch of synchronous work, once"* — a built-in debounce |

### The `await` version of the puzzle

```js
async function main() {
  console.log('1 in async');

  await Promise.resolve();
  console.log('2 after await');

  console.log('3 end of async');
}

console.log('4 before call');
main();
console.log('5 after call');
```

Output:

```text
4 before call
1 in async
5 after call
2 after await
3 end of async
```

```narrate
line 7: prints before anything async runs
line 1: the async body starts SYNCHRONOUSLY — it prints immediately
line 3: await suspends the async function and queues its continuation as a microtask
line 9: main() has already returned a promise — the caller continues synchronously
line 11: the script ends; microtasks drain
line 4: the await continuation resumes
line 6: the rest of the async body finishes
```

The two traps: the async body starts *synchronously*, and the code *after* `await` is
deferred — both are just queue mechanics. The caller `main()` returned at line 9; the
function's body finished at line 3's microtask.

## 6. Interview Explanation

> There are two queues. Macrotasks — timers, events, I/O — run one per event-loop turn.
> Microtasks — Promise callbacks and `queueMicrotask` — run whenever the stack empties, and
> the whole queue drains before the next task starts. So a promise always beats a timer, even
> a zero-delay one, and a timer scheduled ten lines earlier still runs after a promise
> scheduled at the end of the script. `await` is just syntax over that: the code before the
> first `await` runs synchronously, and everything after it is a microtask continuation.

## 7. Senior-Level Insights

- **State it as a spec fact, not a rule of thumb.** *"The microtask queue is checked after
  every synchronous completion and drained completely before task selection."* That's the
  exact wording-level answer.
- **Explain *why* promises are microtasks.** Promise continuations are the program's own
  logic — it should finish its current logical step before the host (browser/Node) gets a
  turn to run unrelated work. Tasks are the host's work; microtasks are the program's.
- **Know the starvation asymmetry.** Infinite `queueMicrotask`/`.then` recursion starves
  rendering and the task queue — the page freezes. Infinite `setTimeout` recursion also
  freezes nothing, because each timer is one task and the browser renders between tasks.
- **Reference Lesson 22's loop.** *"The loop picks one task per turn, but drains every
  microtask before the next pick."* One sentence that connects the two lessons.
- **Call out `process.nextTick`.** It's not in the web platform and runs *before* other
  microtasks; naming it as the exception shows real depth.
- **Use it to explain batching.** "React batches updates and flushes them in a microtask —
  that's why you see one render per event, not per `setState`."

## 8. Common Mistakes

**Mistake 1 — "Promise resolves, so it runs immediately."** `Promise.resolve()` queues a
microtask; it doesn't run anything yet. The handler runs on the drain, after the current
script. Same for `await`: the continuation is deferred.

**Mistake 2 — "Earlier means earlier."** Time of *scheduling* does not decide the order
between queues; queue *priority* does:

```js
setTimeout(() => console.log('timeout scheduled first'), 0);

Promise.resolve().then(() => console.log('promise scheduled last'));
```

Output:

```text
promise scheduled last
timeout scheduled first
```

The promise was scheduled *after* the timer, yet runs first. Microtasks beat tasks regardless
of when either was scheduled.

**Mistake 3 — expecting `.then` inside a timer to run before the next timer.** A microtask
queued inside a task still beats the *next* task — but that next task is the next loop turn:

```js
setTimeout(() => {
  console.log('t1');
  Promise.resolve().then(() => console.log('t1 micro'));
}, 0);

setTimeout(() => console.log('t2'), 0);
```

Output:

```text
t1
t1 micro
t2
```

`t1` runs, its microtask drains before the loop picks `t2`. The rule is per-turn: *task →
drain all its microtasks → next task*.

**Mistake 4 — forgetting that `async` bodies start synchronously.** The first lines of an
`async` function run immediately; only `await` defers. "Async means everything is deferred"
is wrong — and it's a frequent interview miss.

## 9. Best Practices

✅ Use `queueMicrotask` for *"after the current batch of sync work, exactly once"* — the
built-in debounce

✅ Let Promises chain naturally — each `.then` is already a microtask, no timers needed

✅ Use `requestAnimationFrame` for visual work — it's scheduled relative to paint, not to
your promise

✅ Treat the microtask drain as "the current logical step finishing" — put dependent work in
`.then`, never after a `setTimeout`

❌ Don't use `setTimeout(fn, 0)` to "defer" work after a Promise — the promise already wins,
and the timer only adds a full loop turn of latency

❌ Don't build unbounded microtask loops — they starve rendering; a chunked task loop doesn't

## 10. Interview Questions

**Q1. What's the difference between a microtask and a macrotask?**

> A macrotask is one unit of host work — a timer callback, an event, an I/O callback — and
> the event loop runs exactly one per turn. A microtask is one unit of the program's own
> continuation — a Promise `.then` or `queueMicrotask` — and the loop drains the *entire*
> microtask queue whenever the stack empties, before choosing the next macrotask. Promise
> callbacks therefore always run before timer callbacks, regardless of order.

**Q2. Which wins: `setTimeout(…, 0)` or `Promise.resolve().then(…)`?**

> The Promise, always. The `setTimeout` callback is a macrotask that needs a full loop turn;
> the `.then` is a microtask that runs the moment the stack empties. Even a timer scheduled
> far earlier loses to a promise scheduled at the very end of the script.

**Q3. Why are promises handled as microtasks?**

> Because a promise continuation is the program continuing its own logic — the spec says the
> engine must finish that logical step before letting the host run unrelated work. Tasks are
> the host's turn; microtasks are the program's turn. That's why every microtask drains before
> any task.

**Q4. Predict the output:**

```js
console.log('a');
setTimeout(() => console.log('b'), 0);
Promise.resolve().then(() => console.log('c'));
console.log('d');
```

> `a, d, c, b`. `a` and `d` are synchronous. `c` is a microtask and drains right after the
> script. `b` is a macrotask and needs a full loop turn, so it runs last.

**Q5. Why can an infinite microtask loop freeze the page, while an infinite `setTimeout` loop
doesn't?**

> An infinite microtask loop never lets the queue drain, so the browser never gets a turn —
> no rendering, no tasks. Infinite timers are one task per turn, so the loop keeps cycling
> and the browser renders between tasks. The page stays responsive; the microtask version
> locks it.

**Senior follow-up: Why does `await` change the ordering of the rest of the function?**

> Because `await` compiles to a promise `.then` — everything after it becomes a microtask
> continuation. The code before the first `await` runs synchronously in the caller's turn;
> the code after it is deferred to the microtask drain. That's why `console.log` around an
> `await` call still prints before the continuation does.

**Senior follow-up: How does this explain React's batched state updates?**

> React defers the re-render into a microtask after the event handler completes. Multiple
> `setState` calls in one handler all land in the same drain, so you get exactly one render
> per event — not one per call. Batching is literally queue scheduling.

## 11. Follow-up Questions

**Does `.then` always queue a microtask, even for an already-resolved promise?**

> Yes. `Promise.resolve(1).then(cb)` never runs `cb` synchronously — it always queues a
> microtask, even when the promise is already settled. The spec guarantees the callback runs
> only after the current synchronous code finishes.

**What's `process.nextTick` and how does it differ?**

> It's a Node-specific queue that runs *before* the microtask queue — and it can starve I/O
> if abused. The web platform has no equivalent; `queueMicrotask` is the standard tool.

**Can a macrotask run in the middle of a microtask drain?**

> No. The drain runs to completion — including microtasks added by other microtasks. The task
> queue is only consulted once the microtask queue is empty.

## 12. Comparison Table

| | **Microtask** | **Macrotask** |
|---|---|---|
| Examples | Promise `.then/.catch/.finally`, `await` continuation, `queueMicrotask` | `setTimeout`, `setInterval`, events, I/O callbacks |
| Queue order | FIFO | FIFO |
| Runs per loop turn | All of them | One |
| Runs when | Stack empties | After microtasks drain |
| Priority | Always first | Always second |
| Starvation risk | Endless microtasks freeze rendering | Endless timers stay responsive |
| Best mental model | The program's own next step | The host's next unit of work |

## 13. Code Example

The full gauntlet — run it, then read the walkthrough:

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
  .then(() => { console.log('3'); return Promise.resolve(); })
  .then(() => console.log('4'));

queueMicrotask(() => console.log('5'));

async function go() {
  console.log('6');
  await null;
  console.log('7');
}

go();

console.log('8');
```

Output:

```text
1
8
6
3
5
7
4
2
```

```narrate
line 1: synchronous → prints immediately
line 3: setTimeout queues a macrotask
line 5: .then queues microtask M3
line 7: chained .then queues microtask M4 — but only after M3 resolves
line 9: queueMicrotask queues microtask M5
line 12: go() is CALLED — its body starts synchronously
line 13: prints immediately
line 14: await null suspends go → its continuation becomes microtask M7
line 17: go() already returned; the caller continues
line 19: synchronous → prints immediately; script ends, stack empties
drain: M3 → prints "3", resolves, M4 is now queued
drain continues: M5 → "5"
drain continues: M7 (go's continuation) → "7"
drain continues: M4 → "4"
next task: the timer → "2"
```

Note the order inside the drain: `M3`, `M5`, `M7`, `M4`. `M4` came last because it only
*existed* once `M3` resolved — microtasks created during the drain still run within it.

## 14. Performance Notes

- **The drain is greedy by design.** It's a correctness guarantee, not an optimisation — the
  engine will happily run 10,000 microtasks in one go. A long promise chain is one long
  task-shaped block from the browser's perspective.
- **Batch to protect the drain.** If a `fetch` handler fans out into thousands of `.then`s,
  they all drain in one turn and can block paint. Chunk heavy continuations or use
  `scheduler.yield`/`setTimeout` to give the browser a turn.
- **`await` in a loop is N microtasks.** `for (const x of xs) await f(x)` yields once per
  item. That's correct, but if `f` is heavy it's N interleaved drains — consider whether a
  synchronous accumulate is fine.
- **When it doesn't matter:** ordinary app code with a handful of promises and timers runs
  identically either way. The ordering only bites in tests, animations, and anything
  asserting sequence.

## 15. Debugging Scenarios

**Scenario 1 — "my test asserts the wrong order."**

```js
let order = [];
setTimeout(() => order.push('timeout'), 0);
Promise.resolve().then(() => order.push('promise'));
// later: expect(order).toEqual(['timeout', 'promise']);   // ❌
```

The promise pushes first, always. Fix the expectation — or, if you genuinely need the timer
first, await it: `await new Promise(r => setTimeout(r, 0))` and note that even then the
already-queued microtask beat it.

**Scenario 2 — "the spinner never shows because the load finished too fast."**

```js
showSpinner();                    // ❌ painted only after this task
const data = await fetch('/api');
hideSpinner();                    // same task's microtasks — no paint in between
```

The await's continuation runs in the same drain; the browser never got a turn to paint the
spinner. Add an explicit `await new Promise(r => requestAnimationFrame(() => r()))`, or let
the fetch naturally take a frame.

**Scenario 3 — "my `async` loop logs everything in the wrong order."**

```js
for (const x of [1, 2, 3]) {
  setTimeout(() => console.log(x), 0);
}
```

Output:

```text
3
3
3
```

That's Lesson 1's `var` trap: all three timers close over the same `x`. The *queue* is
fine — the closure captured the wrong variable. Check for closures first, queue ordering
second.

## 16. Quick Revision Notes

- Microtasks: promises, `await` continuations, `queueMicrotask`
- Macrotasks: timers, events, I/O callbacks
- Order: sync code → **all** microtasks → one task → **all** microtasks → …
- A promise beats a timer regardless of when either was scheduled
- An `async` body starts synchronously; only `await` defers
- Microtasks queued *during* a drain still run within that drain
- `process.nextTick` (Node) runs before other microtasks
- Endless microtasks freeze rendering; endless timers don't

## 17. Cheat Sheet

```text
ORDER OF EXECUTION:
  1. synchronous code (the current task, line by line)
  2. drain the ENTIRE microtask queue
  3. run ONE macrotask
  4. repeat from step 2

MICROTASKS     → Promise.then/.catch/.finally, await continuation, queueMicrotask
MACROTASKS     → setTimeout, setInterval, events, I/O callbacks

await fn()  →  body before: sync   body after: microtask continuation
async fn()  →  starts synchronously on the call
.inside a task  →  drains before the NEXT task, not before the current one

predict puzzles → list sync, then queue order per queue, then interleave: all micro, one macro
```

## 18. Key Takeaways

> [!RECAP]
> - Two queues: microtasks (promises, `queueMicrotask`) and macrotasks (timers, events, I/O)
> - The event loop (Lesson 22) drains all microtasks before every single task
> - Promise continuations are the program's own next step — they always beat host work
> - A promise scheduled last still beats a timer scheduled first
> - `async` bodies run synchronously up to the first `await`; the rest is a microtask
> - Microtasks created during a drain still run within that same drain
> - Endless microtasks starve rendering — chunk them; endless timers are safe
> - Get the ordering right once and every async puzzle is the same puzzle

## Check your understanding

Answer these without looking back.

1. Name three microtask sources and three macrotask sources.
2. Why does every promise beat every timer, regardless of scheduling order?
3. Predict `a, setTimeout→b, Promise→c, d` — and justify each step.
4. Does `async function f() { console.log(1); await 0; console.log(2); }` log `1` before or
   after the caller's next line? Why?
5. A `.then` inside a timer: does it run before or after the *next* timer? Draw the turn.
6. Why does an infinite microtask loop freeze the page when an infinite timer loop doesn't?

## What's Next

**Lesson 24 — Promises from Scratch.** You've predicted their ordering; now you'll build
one — state machine, `.then` chaining, resolution semantics — and see exactly why the
microtask rules you just learned are baked into the design.
