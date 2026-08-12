# Lesson 21 — Call Stack & Execution Contexts

**Interview importance:** ⭐⭐⭐ — you cannot explain the event loop without this. Interviewers
ask them together.

Every function call in JavaScript creates an execution context, and those contexts stack up
one on top of another — that stack is the call stack. It is the smallest complete model of
how JavaScript actually runs, and it unlocks Lesson 22.

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the call stack for a function that calls a function that calls a function
- Explain what an execution context holds and when it's destroyed
- Predict a `Maximum call stack size exceeded` error before it happens
- Say how closures keep scope alive after the stack frame is gone
- Explain why a recursive UI component can crash a browser tab

## 1. One-line Definition

**The call stack is a LIFO list of the function calls currently in progress — a record of
"where we are" at every instant of execution.**

JavaScript is single-threaded: it executes one statement at a time, and the call stack
decides *which* one. Whenever a function is invoked, a frame is pushed on top; when it
returns, its frame is popped off.

## 2. Mental Model

**Think of the call stack as a stack of plates in a cafeteria.**

- You can only touch the top plate — the function that is currently running.
- A plate goes on top when a function is called; it's removed when the function returns.
- If a stack grows so high it topples, that's a stack overflow.

```text
      ┌─────────────┐
      │  top → add()   │   ← the only plate you can touch (running now)
      ├─────────────┤
      │    double()   │   ← paused, mid-line, waiting for add to return
      ├─────────────┤
      │    main()     │   ← where the program started
      └─────────────┘
```

While `add` runs, `double` and `main` are **paused**. The engine remembers exactly where
each one stopped, so when the top frame returns, execution resumes right where it left off.

> [!NOTE]
> The stack itself isn't a fancy mechanism — it's just a push-and-pop list. The hard part is
> *knowing what is pushed onto it and when it comes off*. That's this whole lesson.

## 3. Visual Flow

```text
   call stack at each step:

   step 1            step 2            step 3            step 4
   ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ main()  │  call │ double  │  call │  add    │  return│ double  │  return
   └─────────┘  ───► ├─────────┤  ───► ├─────────┤  ────► ├─────────┤  ────►
                     │ main()  │       │ double  │        │ main()  │
                     └─────────┘       ├─────────┤        └─────────┘
                                       │ main()  │
                                       └─────────┘

   step 5
   ┌─────────┐
   │ main()  │  return  →  stack empty → program finishes
   └─────────┘
```

Each frame carries **the function's own code and local variables**. When a frame is popped,
its locals are destroyed — *unless* a closure (Lesson 5) still references the scope.

## 4. How It Works

Let's watch the stack at the three most important moments.

**Moment 1 — a call happens.** A new execution context is created and pushed on top:

```js
function add(a, b) {
  return a + b;
}

function double(x) {
  return add(x, x);
}

console.log(double(4));
```

Output:

```text
8
```

```narrate
line 1: add is *defined* here — nothing is pushed yet
line 8: double(4) is called → a double frame is pushed
line 6: inside double, add(x, x) is called → an add frame is pushed on top
line 2: add returns 8 → the add frame is popped, double resumes with the value 8
line 5: double returns 8 → the double frame is popped
line 8: console.log runs last, on the (nearly empty) global stack
```

**Moment 2 — a return happens.** The frame is popped, the returned value is handed to the
caller, and the caller resumes on the next statement.

**Moment 3 — an error is thrown.** Every frame between the throw and a `catch` is unwound in
order — which is exactly what the DevTools **stack trace** shows you, deepest call first.

```js
function a() { return b(); }
function b() { return c(); }
function c() { throw new Error('boom'); }

try {
  a();
} catch (err) {
  console.log(err.stack);
}
```

Output:

```text
Error: boom
    at c (…)
    at b (…)
    at a (…)
    at Object.<anonymous> (…)
```

### What an execution context contains

| Piece | What it holds | Example |
|---|---|---|
| **Variable environment** | locals, `arguments`, inner function refs | `x`, `count` |
| **Lexical environment** | the scope chain (outer scopes) | the parent's variables |
| **`this` binding** | decided by how the function was called (Lesson 10) | the object left of the dot |
| **Return address** | where the caller paused | the next statement in `double` |

## 5. Real Project Usage

Call-stack thinking is everyday debugging, not theory.

| Situation | What the stack does |
|---|---|
| **Reading a stack trace** | The top frame is where it broke; each frame below is a caller still waiting |
| **Recursive components** | A recursive React tree hundreds deep can overflow the stack |
| **`JSON.stringify` on circular data** | It recurses forever → `Maximum call stack size exceeded` |
| **Promise chains** | Every `.then` callback gets its own fresh call — which is why the stack trace "resets" there (Lesson 23) |
| **Sync errors in callbacks** | Thrown inside a callback, they bubble through that callback's own stack, not the outer one |

### Recursion — the classic live example

```js
function factorial(n) {
  if (n <= 1) return 1;          // base case: stop recursing
  return n * factorial(n - 1);   // recursive case: push another frame
}

console.log(factorial(5));
console.log(factorial(10000));   // 💥 stack overflow
```

Output:

```text
120
RangeError: Maximum call stack size exceeded
```

The first call builds five frames, then unwinds them multiplying back down. The second call
tries to push ten thousand frames — the engine's stack has a hard size limit, and the top
frame's base case is never reached. That `RangeError` is the stack hitting its ceiling.

### The stack overflow that bites real apps

```js
// a recursive render of a deeply nested tree — a stack overflow waiting to happen
function renderNode(node) {
  return `<${node.tag}>` + node.children.map(renderNode).join('') + `</${node.tag}>`;
}
```

`renderNode` is called once per nested element. Depth 50,000 → 50,000 frames → the browser
tab freezes or the error is thrown. The fix is usually an **iterative** version with an
explicit work list, or a `while` loop that reuses one frame instead of stacking thousands.

> [!TIP]
> In DevTools, the stack trace panel *is* the call stack, frozen at the moment of the error.
> The frames at the bottom are the "longest waiting" callers — which is why a senior reads a
> stack trace bottom-up to find *who called the broken code*, not just *what broke*.

## 6. Interview Explanation

> JavaScript runs one statement at a time on a single thread. Every function call pushes an
> execution context onto the call stack; every return pops it off. The stack is LIFO, so the
> function that most recently started is the one currently running. An error unwinds the
> stack frame by frame — that's the stack trace. If the stack grows beyond the engine's
> limit, you get a stack overflow. Callbacks don't block this — they're executed later, from
> a queue, which is the event loop (Lesson 22).

## 7. Senior-Level Insights

- **Name the LIFO property and its consequence.** "The call stack is LIFO — so a function
  can't resume until everything it called has returned." That's the whole behaviour in one
  sentence.
- **Distinguish the stack from the queue.** The stack runs functions *now*; the task queue
  holds functions *for later* (Lesson 22). Mixing the two up is the most common mid-level
  error in async interviews.
- **Know how the stack explains callbacks.** `setTimeout(cb, 0)` does *not* run `cb`
  immediately — it can't, because the current frame is still on the stack. The callback only
  runs after the stack has emptied. That's why "zero delay" isn't instant.
- **Prefer `while` over recursion when depth is unbounded.** Recursion is elegant; the stack
  has a fixed budget. Production code that walks huge structures almost always iterates.
- **Know what resets the stack in async code.** Every callback starts from the (nearly)
  empty stack. That's why "where's the original caller?" is the wrong question for a stack
  trace after an `await` (Lesson 23).
- **Tie it to your debugging habits.** "I read stack traces bottom-up: top tells me what
  broke, bottom tells me who called it."

## 8. Common Mistakes

**Mistake 1 — thinking recursion is slow because of the stack.** The recursion itself is
usually fine; the frames are cheap. It's *deep* recursion that fails — depth is the enemy,
not recursion per se. Depth 100 is a non-issue; depth 100,000 is a `RangeError`.

**Mistake 2 — expecting a `setTimeout` callback to run before the current code finishes.**

```js
console.log('a');
setTimeout(() => console.log('b'), 0);
console.log('c');
```

Output:

```text
a
c
b
```

`setTimeout` schedules the callback; it cannot run until the current frame (and everything
else on the stack) has returned. Order `a, c, b` — always.

**Mistake 3 — shadowing inside a stack frame.** Two variables with the same name at different
depths of the stack are unrelated; a shadowed name refers to the *nearest* scope (Lesson 2).
Not a stack bug, but the confusion usually surfaces while reading a stack trace.

## 9. Best Practices

✅ Keep a function's work in one place — the stack shows the call path, so shallow call trees
are easier to trace

✅ Write the base case of a recursion *first* — a missing base case is a guaranteed overflow

✅ Prefer iteration for anything with unbounded depth (trees, graphs, long chains)

✅ Read stack traces bottom-up: the top is the symptom, the bottom is the cause

✅ Use meaningful function names — the stack trace is the first thing you'll read

❌ Don't run heavy synchronous work in the main thread — it blocks the stack and freezes the UI

❌ Don't use deep recursion where a `while` loop fits

## 10. Interview Questions

**Q1. What is the call stack?**

> A LIFO structure holding every function call currently in progress. Each call pushes an
> execution context onto the stack; each return pops it off. The function at the top is the
> one executing right now; everything below it is paused waiting for it to return.

**Q2. What happens when a function calls another function?**

> A new execution context is created for the callee and pushed on top of the caller's. The
> caller's context stays exactly where it was, paused. When the callee returns, its frame is
> popped, and the caller resumes on the next statement — the returned value is handed to it.

**Q3. Why does deep recursion throw `Maximum call stack size exceeded`?**

> Because the stack has a fixed size limit, not an infinite one. Each recursive call pushes
> another frame, and at roughly ten thousand frames (in Node/V8) the engine refuses to push
> more. The fix is a base case that stops the recursion, or an iterative rewrite.

**Q4. Does `setTimeout(fn, 0)` run `fn` immediately?**

> No. `setTimeout` hands the callback to a timer and schedules it for later — the callback
> can only run once the current stack has emptied. That's why the classic example logs
> `a, c, b`, never `a, b, c`.

**Q5. Where is the global code in the stack?**

> The global execution context is the first frame pushed, at the very bottom of the stack. It
> stays there for the whole program and is popped when the program ends. Every function frame
> sits above it.

**Senior follow-up: How do closures let a variable survive after its frame is popped?**

> When a function returns, its frame is popped and its locals normally die with it. But if
> an inner function still references that scope — a closure (Lesson 5) — the engine keeps the
> scope object alive. The *frame* is gone; the *scope* it carried lives on, held by the
> closure. That's the exact mechanism behind `makeCounter()`'s surviving `count`.

**Senior follow-up: When does the stack trace "reset" in async code, and why?**

> Every time a callback runs, it starts from a fresh, near-empty stack — so an error thrown
> *inside* a `.then` callback only shows the synchronous calls above it, not the original
> caller. The original call has long since returned. This is why async stack traces look
> "cut off" unless the engine links them via the event loop (Lessons 22–23).

## 11. Follow-up Questions

**What's an execution context?**

> The environment a running function lives in: its variable environment (locals, arguments),
> its lexical environment (the scope chain out to the outer scopes), the `this` binding, and
> the return address where the caller paused. One context per in-progress call.

**Can the call stack run out of memory?**

> Yes — that's precisely a stack overflow. Frames are allocated on a fixed-size stack (a few
> MB), so runaway recursion or runaway sync work eventually hits the ceiling and throws
> `RangeError: Maximum call stack size exceeded`.

**Is recursion always the cause of a stack overflow?**

> Not always — a very long synchronous chain of calls can overflow too, and infinite
> recursion isn't the only path. But unbounded recursion is by far the common case, which is
> why the first question is always "does it terminate?"

## 12. Comparison Table

| | **Call stack** | **Task queue** | **Heap** |
|---|---|---|---|
| What it holds | Function calls in progress | Callbacks scheduled for later | Objects and data |
| Order | LIFO — push on call, pop on return | FIFO — first scheduled, first run | Unordered |
| When it runs | Now, on the main thread | Only after the stack empties (Lesson 22) | Never "runs" — just memory |
| Overflow symptom | `RangeError: Maximum call stack size exceeded` | Never overflows — it just drains | Memory pressure / leaks |
| Your tools | Stack traces, `console.trace()` | DevTools → Sources → call stack vs queue | Heap snapshots |

## 13. Code Example

```js
'use strict';

// Track every push and pop with console.trace()
function ping(depth) {
  console.trace(`frame ${depth}`);
  if (depth > 0) ping(depth - 1);
}

console.log('call ping(2)');
ping(2);
```

Output:

```text
call ping(2)
Trace: frame 2
    at ping (…:6)
    at Object.<anonymous> (…:10)
Trace: frame 1
    at ping (…:6)
    at ping (…:7)
    at Object.<anonymous> (…:10)
Trace: frame 0
    at ping (…:6)
    at ping (…:7)
    at ping (…:7)
    at Object.<anonymous> (…:10)
```

Watch the traces grow one `ping` line at a time — that's the stack stacking. Each `ping`
call is a real frame, and each trace shows the frames currently alive. Notice the recursion
can't unwind until `depth` hits `0` and returns.

## 14. Performance Notes

- **Frames are cheap; depth is the enemy.** A single call costs almost nothing, but a call
  chain thousands deep consumes the engine's fixed stack budget. Iteration reuses one frame
  and has no depth limit.
- **Sync work blocks the stack.** One long-running function holds the top frame for the whole
  task; nothing else can run until it returns. This is why heavy work goes to workers or gets
  chunked with timers.
- **Stack overflow is a hard crash, not a slowdown.** A too-deep recursion throws a
  `RangeError`; the code before it doesn't "get slower" first. You'll know when you hit it.
- **The stack is not where memory leaks live.** The heap is. Frames are released on return —
  a leak means a *reference* kept alive by a closure or a listener (Lesson 5), not a frame
  that failed to pop.

## 15. Debugging Scenarios

**Scenario 1 — the page freezes on load.**

Open the Performance panel and record: a single long task occupying the main thread means
one function never returns — it's holding the stack. Profile the task and look at the call
tree: the function that stays on the stack longest is the culprit. Then move the work off
the main thread or chunk it.

**Scenario 2 — "Maximum call stack size exceeded" in a JSON call.**

You probably passed a circular object to `JSON.stringify`, which recurses forever:

```js
const obj = { name: 'a' };
obj.self = obj;
console.log(JSON.stringify(obj));
```

Output:

```text
TypeError: Converting circular structure to JSON
```

The message differs per engine, but the *shape* is the stack overflowing. Fix: break the
cycle (use `replacer`, or keep the graph acyclic) before serialising.

**Scenario 3 — a stack trace pointing at a library you don't control.**

The frames below the top are all callers. Find the first frame that's *your* code — that's
where you passed the bad input. Read the trace bottom-up, not top-down.

## 16. Quick Revision Notes

- The call stack is LIFO: push on call, pop on return
- The top frame is the only one executing; everything below is paused
- An execution context = variable environment + scope chain + `this` + return address
- The global context sits at the bottom for the entire program
- An error unwinds the stack — that's the stack trace, read bottom-up
- A closure keeps its scope alive after its frame is popped (Lesson 5)
- A callback can only run after the stack empties — hence `setTimeout` order (Lesson 22)
- `Maximum call stack size exceeded` = the stack's fixed budget ran out

## 17. Cheat Sheet

```text
LIFO — push on call, pop on return
call → push context   return → pop context
throw → unwind stack, frame by frame (that's your stack trace)
setTimeout(cb, 0) → cb runs AFTER the current stack empties, never before
stack overflow → RangeError: Maximum call stack size exceeded
fix deep recursion → while loop / explicit work list
read stack traces bottom-up → top is symptom, bottom is cause
```

## 18. Key Takeaways

> [!RECAP]
> - The call stack is a LIFO list of every function call currently in progress
> - Each call pushes an execution context; each return pops it; the top frame is the one running
> - Global code lives in the bottom-most frame, alive for the whole program
> - Errors unwind the stack frame by frame — the stack trace is that unwinding, read bottom-up
> - Closures keep a *scope* alive after its *frame* is gone (Lesson 5)
> - A callback is scheduled, not run — it waits until the stack empties (Lesson 22)
> - Recursion that never hits a base case throws `Maximum call stack size exceeded`

## Check your understanding

Answer these without looking back.

1. Draw the call stack at the moment `b()` is running inside `a()` called from `main()`.
2. What exactly is in an execution context?
3. Why does a `setTimeout(cb, 0)` callback never run before the synchronous code finishes?
4. What does a stack overflow mean, and what two fixes are available?
5. A stack trace shows frames `f → g → h`. Which is the cause, and which is the caller?
6. How does a closure keep a variable alive after its frame was popped?

## What's Next

**Lesson 22 — The Event Loop.** The call stack is only half the story: callbacks are
scheduled onto queues, and the event loop decides when the stack finally gets to run them.
Top-three most asked JavaScript question at every level.
