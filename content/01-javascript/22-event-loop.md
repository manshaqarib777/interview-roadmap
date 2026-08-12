# Lesson 22 — The Event Loop

**Interview importance:** ⭐⭐⭐⭐⭐ — top-three most asked JavaScript question at every level,
from junior screens to staff loops.

Single thread, but everything still works: the event loop is how JavaScript does that. This
lesson builds directly on the call stack from Lesson 21 — the stack runs code *now*, and the
event loop decides what the stack runs *next*.

## Learning Objectives

By the end of this lesson you should be able to:

- Name every participant in the loop: call stack, APIs, task queue, microtask queue
- Explain why JavaScript is single-threaded yet non-blocking
- Predict what order asynchronous code executes in, correctly
- Explain why the UI never freezes during I/O waits
- Trace a `setTimeout` from scheduling to execution

## 1. One-line Definition

**The event loop is a continuous cycle that takes the next ready task, pushes it onto the
call stack, and runs it to completion — so JavaScript's single thread never blocks waiting
for anything.**

It's a `while (true)` loop: *is the call stack empty?* → *are there tasks to run?* → *run
one*. That's the whole mechanism.

## 2. Mental Model

**The event loop is a single waiter in a restaurant kitchen.**

- The **call stack** is the cook's hands — they can only hold one dish at a time (one
  function runs at a time).
- The **task queue** is the ticket rack — orders that are ready to be cooked wait there in
  line (first in, first out).
- The **Web APIs / Node APIs** are the ovens and timers — they cook in the background while
  the cook keeps plating.
- The waiter picks up the *next* ticket **only when both hands are free** — and each dish is
  plated start to finish without interruption (run to completion).

When the timer dings, its callback goes on the ticket rack — not into the cook's hands. The
hands must be empty first.

## 3. Visual Flow

```text
        ┌────────────────────────────────────────────────────────┐
        │                                                        │
   JS thread                  BROWSER / NODE (background)        │
        │                                                        │
   ┌────┴──────────┐        ┌──────────────┐                     │
   │  CALL STACK   │◄───────│  Web APIs    │  setTimeout, fetch, │
   │  (Lesson 21)  │        │  / Node APIs │  events, I/O        │
   └────▲──────────┘        └──────┬───────┘                     │
        │                          │ callback ready             │
        │                          ▼                             │
        │            ┌───────────────────────────┐              │
        │            │        TASK QUEUE         │  FIFO         │
        │            └───────────────────────────┘              │
        │                          │                             │
        │                          │  stack empty?              │
        │                          ▼                             │
        └──────────────────  EVENT LOOP  ────────────────────────┘
            while (stack empty) → dequeue ONE task → run to completion

   Microtask queue (Lesson 23): drained BEFORE the next task, in its entirety.
```

Two doors, one rule: **a task runs only when the call stack is empty, and it runs to
completion before anything else touches the stack.**

## 4. How It Works

```js
console.log('1 start');

setTimeout(() => console.log('2 timeout'), 0);

Promise.resolve().then(() => console.log('3 microtask'));

console.log('4 end');
```

Output:

```text
1 start
4 end
3 microtask
2 timeout
```

```narrate
line 1: runs immediately on the stack
line 3: setTimeout schedules a macrotask — it goes to the task queue, NOT the stack
line 5: Promise.then schedules a microtask — Lesson 23 explains why it wins
line 7: runs immediately — the synchronous code finishes, the stack empties
after: microtasks drain FIRST → "3 microtask"
after: the task queue is only reached next → "2 timeout"
```

Every second of that output is decided by the loop: sync code first, then microtasks, then
the next task. This is the ordering rule that decides almost every async interview question.

### The step-by-step for a `setTimeout`

1. `setTimeout(fn, 1000)` is called — the stack is running your code.
2. The timer is handed to the **Web/Node API** (background thread), not the queue.
3. Your code keeps running; the stack empties.
4. After ~1000 ms, the API pushes `fn` onto the **task queue**.
5. The event loop checks: *is the stack empty?* If yes, it dequeues `fn` and runs it to
   completion. If no, it waits — which is why "1000 ms" is a *minimum*, not a guarantee.

```js
const start = Date.now();

setTimeout(() => console.log('timer after ~', Date.now() - start, 'ms'), 1000);

// block the stack for 2 seconds
const until = start + 2000;
while (Date.now() < until) { /* spin */ }

console.log('blocking done');
```

Output:

```text
blocking done
timer after ~ 2000 ms
```

The timer "fires" at 1000 ms, but its callback is stuck in the queue until the blocking loop
releases the stack at 2000 ms. **The event loop is not a clock — it's a queue runner.** The
delay is a lower bound.

> [!PITFALL]
> A long-running synchronous task blocks *everything*: timers, clicks, renders, network
> callbacks — they all wait in the queue. That's exactly the "frozen page" bug. Keep the
> stack free, or the loop can't serve anyone.

## 5. Real Project Usage

The event loop is why every async pattern in the language works.

| Pattern | What the loop does |
|---|---|
| **`setTimeout` / `setInterval`** | Timer API → task queue → run when the stack is free |
| **`fetch` / `axios`** | Network I/O in the background → resolve → microtask (Lesson 23) |
| **`addEventListener` clicks** | Browser fires an event → its handler is queued as a task |
| **`queueMicrotask` / Promise** | Runs after the current script, before the next task |
| **`requestAnimationFrame`** | Queued to run before the next paint — your animations' heartbeat |
| **`setImmediate` (Node)** | Task queue, checked right after the current I/O phase |
| **`process.nextTick` (Node)** | Runs before *anything* else, even other microtasks |

```js
// a loading spinner driven by rAF — each frame is one task, one paint
let frames = 0;
const start = performance.now();

function frame() {
  if (performance.now() - start < 1000) {
    frames += 1;
    requestAnimationFrame(frame);
  } else {
    console.log('frames in ~1s:', frames);
  }
}

requestAnimationFrame(frame);
```

Output (approximate — varies by monitor):

```text
frames in ~1s: 60
```

Each `requestAnimationFrame` call schedules one callback per screen refresh, and every
callback is one small task — the stack is freed between frames, so the UI stays responsive.

## 6. Interview Explanation

> JavaScript is single-threaded, but the event loop keeps it non-blocking. The call stack
> runs one function at a time; slow operations like timers and network calls are handed to
> the browser or Node APIs, which run in the background. When the API finishes, it drops a
> callback onto the task queue. The event loop constantly asks: *is the stack empty?* If it
> is, it takes the next task and runs it to completion. So the thread never waits — it just
> comes back to finish the work later, one task at a time.

## 7. Senior-Level Insights

- **Say "macrotask" for the task queue.** "Task" and "macrotask" are the same thing; using
  the explicit word signals you've read the spec (Lesson 23 makes the contrast sharp).
- **Distinguish the queue from the stack.** The stack is LIFO (Lesson 21); the task queue is
  FIFO. Blurring those two is the fastest way to lose an async interviewer.
- **Know that rendering happens between tasks.** The browser repaints when the stack is free
  and no microtasks are pending — so an endless microtask chain can starve rendering. That's
  a real senior answer about jank.
- **Quote the 4 ms clamp.** Nested timers past depth 5 are clamped to ≥ 4 ms by the browser —
  a detail that impresses, and that a "0 ms means instant" answer would miss.
- **Explain why the loop exists.** Not "to run async code" but *"to let a single thread
  interleave many operations instead of blocking on each one."* That's the design goal.
- **Know the cost of blocking.** A long task delays *everything* behind it in the queue.
  "It's a single thread, so one heavy task can starve the whole page" is the answer for "why
  is my tab janky?"

## 8. Common Mistakes

**Mistake 1 — thinking `setTimeout`'s delay is exact.** It's a minimum. If the stack is busy,
the callback waits in the queue, no matter how many ms have passed.

**Mistake 2 — blocking the stack in production code.**

```js
// ❌ freezes every queued timer, click handler and render behind it
const end = Date.now() + 3000;
while (Date.now() < end) { /* heavy sync work */ }
```

Everything — timers, events, the next paint — is delayed by however long the stack stays
busy. Split the work into chunks with timers, or move it to a Web Worker.

**Mistake 3 — expecting callbacks to run in the order they were *scheduled*.** They run in
the order they were *queued*, and microtasks (Lesson 23) jump the queue entirely:

```js
setTimeout(() => console.log('task A'), 50);
Promise.resolve().then(() => console.log('microtask B'));
setTimeout(() => console.log('task C'), 10);
```

Output:

```text
microtask B
task C
task A
```

`B` runs first even though it was scheduled after `A`, because microtasks drain before tasks.
`C` beats `A` because it entered the queue 40 ms earlier.

## 9. Best Practices

✅ Keep synchronous work short — the stack must empty for the loop to serve anyone

✅ Treat timer delays as minimums, never as guarantees

✅ Split long CPU work into chunks (timers) or offload it (Web Workers / `worker_threads`)

✅ Use `requestAnimationFrame` for anything visual, not `setTimeout`

✅ Prefer Promises/`async` over raw callbacks — the queue ordering becomes explicit

❌ Don't busy-wait with `while` loops to "wait for" async work — you block the very loop that
would deliver it

❌ Don't put heavy work in a task without chunking it — one long task starves the queue

## 10. Interview Questions

**Q1. Explain the event loop.**

> The call stack runs synchronous code one function at a time. Slow work — timers, network,
> events — is handed to browser/Node APIs that run in the background. When they finish, they
> queue a callback. The event loop is the cycle that checks: *is the stack empty?* When it
> is, it dequeues the next task and runs it to completion. That's how a single thread handles
> many concurrent operations without blocking on any of them.

**Q2. Why is JavaScript single-threaded?**

> Because it started as a scripting language for the DOM, where two threads mutating the same
> UI would need locks on everything. A single thread plus the event loop gives non-blocking
> behaviour without the complexity of shared-memory concurrency. (That's also why UI code
> stays safe — no two callbacks touch the DOM at once.)

**Q3. Why doesn't JavaScript block on I/O?**

> Because blocking I/O doesn't happen on the main thread. `fetch`, timers and file reads are
> handed to the platform's background APIs; the thread keeps running the stack. When the
> platform finishes, the result is queued and the loop picks it up when the stack is free.
> The thread never sits idle waiting.

**Q4. What happens if the call stack is never empty?**

> The event loop can't run any queued task — timers fire late, clicks do nothing, rendering
> stalls. That's a frozen page. A single long synchronous task starves the whole queue.

**Q5. How does `setTimeout(fn, 0)` work?**

> It still doesn't run `fn` immediately. The timer is handed to the background API, the
> callback is queued, and it runs only when the stack empties and the loop reaches it — after
> the current script and any pending microtasks. "0" just means "the soonest the loop can get
> to it", never "now".

**Senior follow-up: What's the difference between the task queue and the microtask queue?**

> The task queue holds macrotasks — timers, events, I/O callbacks — and the loop runs exactly
> one per cycle. The microtask queue holds Promises and `queueMicrotask`, and is drained
> *completely* whenever the stack empties, before the loop picks the next task. So every
> microtask always beats the next task, no matter what order they were created in. (Lesson 23
> is entirely this.)

**Senior follow-up: How can a single task starve the whole page?**

> A task runs to completion — nothing else touches the stack while it's running. If that task
> is a 10-second synchronous loop, ten seconds of queued timers, clicks and paints wait
> behind it. The fix is chunking (yield between pieces with a timer) or offloading (Web
> Worker).

## 11. Follow-up Questions

**Is the event loop part of JavaScript?**

> No — it's provided by the host environment (browsers, Node). The language spec defines the
> call stack and the queues; the host implements the loop and the background APIs that feed
> them. That's why `setTimeout` and `fetch` aren't in the JavaScript spec.

**Does the event loop have a fixed order of phases in Node?**

> Yes — Node's loop cycles through timers, pending I/O, idle/prepare, poll, check
> (`setImmediate`), and close callbacks, and the exact phase depends on where the callback
> was scheduled. The mental model here — background work, then queue, then run when free —
> holds everywhere; the phase list is the Node-specific version of the same idea.

**Why does the page still paint during a long `fetch`?**

> Because network I/O doesn't occupy the stack — it runs in the background. The loop keeps
> cycling, and the browser paints between tasks. The freeze only happens when *synchronous
> CPU work* blocks the stack, not when work is waiting in the background.

## 12. Comparison Table

| | **Call stack** | **Task queue (macrotasks)** | **Microtask queue** |
|---|---|---|---|
| What lives there | Running functions (Lesson 21) | Timers, events, I/O callbacks | `.then`, `queueMicrotask` |
| Order | LIFO | FIFO | FIFO, drained fully first |
| When it runs | Now | Next time the stack is empty | Immediately after the stack empties |
| Runs per cycle | — | Exactly one | All of them |
| Blocking effect | Blocks everything while busy | Starved by a busy stack | Starves rendering if endless |

## 13. Code Example

```js
console.log('1 sync');

setTimeout(() => console.log('2 timer'), 0);

queueMicrotask(() => console.log('3 microtask'));

setTimeout(() => console.log('4 timer'), 0);

Promise.resolve().then(() => console.log('5 promise'));

console.log('6 sync');
```

Output:

```text
1 sync
6 sync
3 microtask
5 promise
2 timer
4 timer
```

```narrate
line 1: synchronous, runs immediately
line 3: timer queued as task #1
line 5: microtask queued
line 7: timer queued as task #2
line 9: promise microtask queued
line 11: synchronous, runs immediately
after: stack empties → ALL microtasks drain: "3 microtask", then "5 promise"
after: loop takes task #1 → "2 timer"
after: loop takes task #2 → "4 timer"
```

Sync runs first, microtasks next, then tasks in FIFO order. Predict any async output by
applying exactly this rule.

## 14. Performance Notes

- **The loop itself is fast.** The cost is never the cycle — it's what you put in it. One
  long task delays every task behind it, so profile for long tasks, not loop overhead.
- **Microtasks drain greedily.** A `while` loop that keeps resolving promises runs thousands
  of microtasks in one go and can starve the browser's rendering. Batch or yield if you see
  jank.
- **Rendering waits between tasks.** Because the browser paints when the stack is free, fewer,
  shorter tasks mean smoother frames. 60 fps = one task per ~16 ms budget.
- **Timer delay is a minimum.** Clamped at 4 ms for nested timers past depth 5, and delayed
  further by any busy stack. Measure with `performance.now()`, don't assume.
- **When it doesn't matter:** ordinary CRUD code with a couple of timers and fetches — the
  loop handles it silently. It matters when things jank, starve, or run out of order.

## 15. Debugging Scenarios

**Scenario 1 — "my timer fires way too late."**

```js
const t0 = Date.now();
setTimeout(() => console.log('elapsed:', Date.now() - t0), 0);
heavySyncWork();   // 300 ms of stack-blocking work
```

Output:

```text
elapsed: 300
```

Diagnosis: the delay is a minimum and the stack was busy. Profile `heavySyncWork`, chunk it,
or move it off the main thread. The timer wasn't late — the loop was starved.

**Scenario 2 — "the page freezes during a data load."**

If the load *parses and transforms* data synchronously, that work blocks the stack:

```js
// the fetch resolves fine; then THIS freezes the page
const rows = bigResponse.map(row => expensiveTransform(row));
```

Move the transform into chunks (`setTimeout`-batched) or a Worker. The network was never the
problem — the synchronous CPU work after it was.

**Scenario 3 — "my event handler runs after another one I registered first."**

```js
window.addEventListener('click', () => console.log('handler A'));
window.addEventListener('click', () => console.log('handler B'));
```

Both handlers are part of *one* task — the click event — and run in registration order, so
this prints `A` then `B` reliably. But if handler A *schedules* something with a timer, that
callback is a *separate* task and runs after the whole click task, including handler B.
Ordering bugs usually come from crossing the task boundary, not from the event itself.

## 16. Quick Revision Notes

- The event loop: *stack empty? → run the next task*, forever
- Call stack runs code now; the task queue holds callbacks for later
- A task runs to completion — nothing interrupts it mid-way
- Timer delays are minimums; a busy stack delays everything behind it
- Microtasks drain before the next task, all of them (Lesson 23)
- The event loop is provided by the host, not by the JavaScript spec
- Long synchronous work starves timers, events and rendering
- Node phases: timers → I/O → poll → check → close — same idea, named phases

## 17. Cheat Sheet

```text
while (stack is empty) {
  drain all microtasks;            // promises, queueMicrotask
  run the next task;               // timers, events, I/O callbacks
  (browser: paint between tasks)
}

setTimeout(fn, d) → fn queued as a task after ≥ d ms, stack permitting
Promise.then / queueMicrotask → microtask, runs before any task
requestAnimationFrame(cb) → cb before the next paint
sync code ALWAYS runs first
one long task → everything behind it is late
```

## 18. Key Takeaways

> [!RECAP]
> - The event loop moves work from queues to the stack: *stack empty → run the next task*
> - JavaScript is single-threaded yet non-blocking because I/O happens in background APIs
> - The stack is LIFO (Lesson 21); the task queue is FIFO; each task runs to completion
> - Timer delays are minimums — a busy stack makes everything late
> - Microtasks drain before any task — the key to ordering (Lesson 23)
> - One long synchronous task can starve the entire page
> - The event loop is the host's job; the language only defines the stacks and queues

## Check your understanding

Answer these without looking back.

1. Name the four pieces of the event loop and what each one does.
2. Why is JavaScript single-threaded, and how does it stay non-blocking?
3. Trace `setTimeout(fn, 1000)` from the call to the callback running.
4. Predict the output of the section 13 code example, and justify each line.
5. What does "run to completion" mean, and what breaks if a task never completes?
6. Why can a timer be 2000 ms late when it was set for 1000 ms?

## What's Next

**Lesson 23 — Microtasks vs Macrotasks.** The output-ordering puzzle: `setTimeout` versus
Promises versus `console.log`. Getting the exact order right is a senior signal — and it's
the difference between a job offer and a follow-up email.
