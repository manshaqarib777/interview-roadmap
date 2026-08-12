# Lesson 97 — Top JavaScript Interview Questions

**Interview importance:** ⭐⭐⭐⭐⭐ — the module's first rehearsal round: the single highest-frequency question set in the whole roadmap.

Rehearsal. Knowing the answer and saying it under pressure are different skills. You have already learned every concept in this lesson — closures (Lesson 5), the event loop (Lesson 22), `this` (Lesson 10) and the rest. What you have *not* done is stand in front of a question and produce a clean, complete answer while a timer runs and a stranger watches.

This lesson is that exercise. The questions below are the JavaScript questions real interviewers actually ask, drawn straight from the earlier lessons in this module. For each one: cover the answer, say it **out loud** as if you were in the room, then flip to the model answer and compare. Do not read the answers first.

## Learning Objectives

By the end of this lesson you should be able to:

- Answer the top JavaScript interview questions out loud, from memory, in under 30 seconds each
- Give the "then a senior would add" layer for every question
- Notice when your own answers are vague, and fix them with the exact vocabulary from Lessons 1–28
- Predict interview output puzzles (event loop, closures, `this`, equality) without running them
- Rehearse the harder follow-ups so no question in the round feels like a surprise

## 1. One-line Definition

**This is a rehearsal round: the most-asked JavaScript interview questions from Lessons 1–28, with model answers worth saying out loud.**

Every concept here is revision of material you have already passed. The only new skill is delivery.

## 2. Mental Model

Think of this lesson as the **dress rehearsal** before the performance.

In the earlier lessons you were the actor learning lines — understanding *why* a closure survives, *why* the event loop orders the way it does. This lesson is the run-through with the actual script: the questions as they are asked, timed, out loud, in front of a room. You will flub lines here. That is the point — flubbing in rehearsal is free; flubbing in the room is not.

## 3. Visual Flow

```text
The rehearsal loop — do this for every question:
                                      ┌──────────────────────┐
                                      │                      ▼
  ┌────────────┐      ┌────────────┐  │   ┌──────────────────────────┐
  │  Read the  │ ───▶ │  Say your  │──┘   │  Compare with the model  │
  │  question  │      │  answer    │      │  answer — mark the gap   │
  └────────────┘      └────────────┘      └────────────┬─────────────┘
      (cover the answer)     (out loud)                │
                                                       ▼
                                        ┌──────────────────────────┐
                                        │  Re-say the answer       │
                                        │  until it is clean and   │
                                        │  complete — then move on │
                                        └──────────────────────────┘
```

If you cannot say it cleanly twice in a row, you have not finished the question.

## 4. How It Works

The questions are grouped by theme, and every group maps to lessons you already know:

| Theme | Questions | From lessons |
|---|---|---|
| Scope & closures | `var`/`let`/`const`, hoisting/TDZ, closures, curry, memoize | 1, 3, 4, 5, 16, 17 |
| `this` & prototypes | binding rules, prototype chain | 10, 9 |
| Async | event loop, promises, async/await, microtasks | 21–25 |
| Functions & data | arrays, debounce/throttle, coercion, equality | 18, 19, 7, 6 |

That mapping is the key insight: **the interview is a sample of the curriculum, not a separate subject.** Every question in this lesson has a home lesson. When you cannot answer, the fix is to return to that lesson — not to memorise this answer.

### The 30-second answer shape

Almost every good interview answer follows the same three moves:

```text
1. DIRECT  — answer the question in one sentence
2. WHY     — the mechanism underneath (one or two sentences)
3. EVIDENCE — a concrete example or trade-off (one sentence)

"Closures capture variables, not values — because scope is lexical, the function
 keeps the binding, not a snapshot. That is why a `var` loop prints 3,3,3 and why
 `setCount(prev => prev + 1)` fixes a stale effect."
```

Say the direct answer first. Interviewers stop listening when the first sentence is a throat-clearing preamble.

## 5. Real Project Usage

You rehearse these answers for the interview, but the same questions surface in every code review you will ever sit in:

| Question being asked | Where it comes up at work |
|---|---|
| "Explain the event loop" | Why a state update seems delayed; why two `fetch` calls resolve in a surprising order |
| "What is a closure?" | Stale data in subscriptions, memoised helpers, private state in a factory |
| "Why is `===` better?" | A bug that only appears when a value is `"0"` instead of `0` |
| "Implement debounce" | Search boxes, resize handlers, autosave |
| "What is a Promise?" | Wrapping a legacy callback API, `Promise.all` for parallel loads |
| "Explain `this`" | Class components, event handlers, arrow-vs-function decision in every component |

## 6. Interview Explanation

> The top JavaScript questions are a sample of the fundamentals: closures, the event loop,
> `this`, prototypes, promises, coercion, equality, hoisting and the array methods. The
> interview is not testing a secret body of knowledge — it is sampling the curriculum, and
> a strong answer follows one shape: direct answer, the mechanism underneath, then a
> concrete example.

## 7. Senior-Level Insights

- **The mechanism beats the definition.** Anyone can say "a closure is a function plus its lexical scope." Seniors say *why that means the variable survives* — because scope is resolved by the engine at creation time, and the scope stays alive as long as the function does.
- **Bridge to React unprompted.** This module is for frontend interviews. When the interviewer asks about closures or the event loop, a senior *also* connects it to what they debug daily: "and that same mechanism is why my `useEffect` went stale."
- **Say the trade-off, not just the rule.** "`===` is safer" is junior. "I use `===` by default, and I only reach for `==` when I explicitly want coercion — and even then I add a comment" is senior.
- **When you do not know, say what you do know.** "I haven't used that in a while — here's what I remember, and here's how I'd verify it" is worth more than a confident wrong answer.
- **Talk about the code as your own.** Say "when I wrote the debounce for our search bar…" — real examples are the difference between rehearsed and experienced.

## 8. Common Mistakes

- **Answering from memory instead of mechanism.** If you cannot re-derive the answer from first principles, one twist in the question and you are lost. Learn the *why*, not the sentence.
- **Rambling while you think.** The shape from section 4 — direct, why, example — keeps answers under 30 seconds. Long answers lose the interviewer.
- **Saying "it just works".** For any answer ending in "it just works", you have not answered. The follow-up will be "why?"
- **Naming the concept wrong.** Mixing up debounce and throttle, `var` hoisting with `let` hoisting, or `==` coercion rules will cost you the question even when the underlying idea is right.
- **Not predicting output.** Interview puzzles (event loop, equality) are solved by *prediction*, not by running. Practice predicting before you press Run — that is the whole point of the exercise for this lesson.

## 9. Best Practices

✅ Rehearse out loud — silently reading answers is not rehearsal

✅ Answer in the direct → why → example shape and keep it under 30 seconds

✅ Predict every code block's output before reading it

✅ Bridge each answer to React when the interview is for a frontend role

✅ Say "I don't know" cleanly, then show how you would find out

❌ Don't memorise answers verbatim — the interviewer will rephrase the question

❌ Don't stop at the definition — the mechanism is the senior signal

## 10. Interview Questions

**Q1. What is a closure?**

> A function together with the scope it was created in. Because scope is lexical, the
> function keeps access to those variables even after the outer function has returned.
> So a counter factory's `count` survives the call that made it, and each call to the
> factory gets its own independent `count` — private state with no class involved.

**Q2. Explain the event loop.**

> JavaScript is single-threaded: one call stack, one thing at a time. When the stack is
> empty, the event loop checks the task queues — first all microtasks (promise handlers,
> `queueMicrotask`), then one macrotask (timers, I/O). That ordering — stack, then
> microtasks to empty, then one macrotask — is the whole answer. It's why `setTimeout(…, 0)`
> runs after a promise that was created earlier in the same tick.

**Q3. How does `this` work in JavaScript?**

> Four binding rules, in priority order. Implicit: `obj.method()` binds `this` to `obj`.
> Explicit: `call`, `apply` and `bind` set it directly. `new` creates a fresh object and
> binds `this` to it. And default: a plain function call gets `undefined` in strict mode
> (or the global object in sloppy mode). The arrow-function exception: arrows have no
> `this` of their own — they use the enclosing scope's, lexically.

**Q4. What is the prototype chain?**

> Every object has a hidden `[[Prototype]]` link to another object. When you read a
> property, the engine walks the chain: the object, then its prototype, then the next one,
> until it finds the property or hits `null`. That is how `[].map` exists without `map`
> being on the array literal itself — it's found on `Array.prototype`.

**Q5. What is a Promise?**

> An object representing a value that is not available yet, with a state machine behind it:
> pending, then fulfilled or rejected, exactly once. `.then` registers handlers that run
> when the state settles, and promises are chainable — each `.then` returns a new promise.
> The three states, the once-only transition, and the chain are the entire API.

**Q6. What is the difference between `async`/`await` and promises?**

> `async`/`await` is syntax over the same promise machinery — nothing new underneath. An
> `async` function always returns a promise, and `await` suspends the function and resumes
> it on the microtask queue when the awaited promise settles. It is promise code that reads
> like synchronous code, and it has the same semantics: errors become rejections, and
> `try/catch` around `await` is a `.catch`.

**Q7. What is the difference between `var`, `let` and `const`?**

> `var` is function-scoped, can be redeclared, and is hoisted as `undefined` — reading it
> early gives you a value instead of an error. `let` and `const` are block-scoped, cannot
> be redeclared in the same scope, and live in the Temporal Dead Zone until their
> declaration — reading early throws. `const` additionally cannot be reassigned. In
> practice: `const` by default, `let` when the value changes, never `var`.

**Q8. What is hoisting, and what is the Temporal Dead Zone?**

> Hoisting is the engine moving declarations to the top of their scope at compile time.
> For `var`, the binding is created and initialised to `undefined`. For `let` and `const`,
> the binding is created but *not* initialised — it sits in the TDZ, and any read before
> the declaration line throws a `ReferenceError`. Same hoisting, different initialisation:
> that is the whole distinction.

**Q9. What is the difference between `==` and `===`?**

> `===` requires the same type and the same value — no conversion, so `0 === "0"` is
> `false`. `==` converts one side to the other's type first, so `0 == "0"` is `true`, and
> famously `null == undefined` is `true`. I use `===` by default; I only reach for `==`
> when I deliberately want that coercion, and I document it.

**Q10. Explain how JavaScript coerces types.**

> Whenever an operator needs a particular type and the value is not one, the engine
> converts it — implicitly, by rules you can learn. Numbers, strings and booleans convert
> between each other (`"5" + 2` string-concatenates to `"52"`, but `"5" - 2` subtracts to
> `3`). Objects convert via `valueOf` and `toString`. The common traps are falsy values
> (`0`, `""`, `null`, `undefined`, `NaN`, `false`) and array-to-string coercions like
> `[] == false` being `true`.

**Q11. Can you explain `map`, `filter` and `reduce`?**

> All three are higher-order functions over arrays. `map` transforms every element and
> returns a new array of the same length. `filter` keeps the elements a predicate accepts
> and returns a shorter array. `reduce` folds the whole array into a single value — any
> value, including an object or another array. All three are pure: they never mutate the
> original array.

**Q12. What is the difference between debounce and throttle?**

> Both limit how often a function runs, but with different shapes. Debounce delays the call
> until the activity stops — every keystroke resets the timer, so the function runs once,
> after the last one. Throttle runs at most once per time window, at a steady rhythm. I use
> debounce for search-as-you-type (wait for the pause) and throttle for scroll and resize
> (keep a steady cadence).

**Q13. What is currying, and why would you use it?**

> Currying is transforming a function that takes several arguments into a chain of
> single-argument functions — `f(a, b, c)` becomes `f(a)(b)(c)`. Each step partially
> applies one argument and returns the next function. I use it to build specialised
> helpers from a general one — a `multiplier(2)` that returns a `double` — and it is the
> shape behind middleware and `connect()`.

**Q14. What is memoization?**

> Caching a function's result by its arguments, so repeated calls with the same input skip
> the computation. The cache lives in a closure — private to that wrapped function. It only
> pays off for expensive, deterministic (pure) functions: same input, same output, no side
> effects. And the reference trap applies: it caches by *key identity*, so objects and
> arrays defeat it.

**Q15. Why is `const` not the same as immutability?**

> `const` protects the *binding*, not the contents. `const user = { name: 'Ali' }` still
> allows `user.name = 'Ahmed'`; what it blocks is pointing the name at a new object.
> For actual immutability you reach for `Object.freeze()` — and even that is only one level
> deep.

**Q16. Why does `0.1 + 0.2` not equal `0.3`?**

> Floating point has no exact binary representation for most decimal fractions, so both
> numbers are stored as approximations and the sum rounds to `0.30000000000000004`. The
> comparison fails because the stored values genuinely differ. I fix it by working in
> integer units (cents, not dollars) or by comparing with an epsilon like
> `Math.abs(a - b) < 1e-9` — I never compare floats for exact equality.

**Q17. What is the difference between `undefined` and `null`?**

> `undefined` is the engine's "no value was provided": an uninitialised variable, a missing
> object property, a function with no return, an argument that was not passed. `null` is the
> developer's explicit "intentionally empty" value. I never assign `undefined` myself — I
> reserve `null` for "this slot is deliberately empty", and I treat both as falsy in checks.

**Q18. How do you handle errors in asynchronous code?**

> Prefer `try/catch` around `await` — it reads like synchronous error handling and it
> catches rejections. For promise chains without `await`, every `.then` needs a matching
> `.catch`, and I make sure the chain ends with one. The critical habit: an unhandled
> rejection is a bug — I always decide where an error is caught before I write the async
> code, never after.

**Senior follow-up: What does the `[object Object]` you see in a console or a string actually mean?**

> It is the result of calling `toString()` on an object that does not override it —
> `Object.prototype.toString` returns the tag `[object Object]` by default. It is a
> debugging symptom: someone string-concatenated an object, or logged it through a
> template literal, instead of logging the object itself. The fix is `JSON.stringify`,
> `console.dir`, or `%o` in the console. The deeper point: knowing that it is `toString`
> failing tells you that any object with a custom `toString` — like arrays or Dates —
> will not show that placeholder.

## 11. Follow-up Questions

**What is the difference between a microtask and a macrotask?**

> Microtasks are promise callbacks and `queueMicrotask` work; macrotasks are timers and I/O.
> After each stack empties, the event loop drains *all* microtasks before it takes the next
> single macrotask. That is why a `.then` scheduled inside another `.then` still runs before
> a `setTimeout(…, 0)` sitting earlier in the file. The one-at-a-time macrotask vs
> drain-the-queue microtask difference is the whole ordering rule.

**How would you deep-copy an object?**

> `structuredClone` is the modern answer — it handles nested objects, arrays, Dates and
> Maps. `JSON.parse(JSON.stringify(x))` works only for JSON-safe data and silently drops
> functions, `undefined` and symbol keys. For a one-level copy, `{ ...obj }` and
> `[...arr]` are enough — and the fact that they are shallow is itself a common interview
> follow-up.

**What happens when you `return` inside a `.then`?**

> The returned value becomes the resolution value of the next promise in the chain — the
> chain flattens one level, so `return somePromise` does not nest. If you `return` a
> promise, the chain waits for it; if you `return` a plain value, it is wrapped. That
> flattening is why chains stay linear instead of becoming callback pyramids.

## 12. Comparison Table

| | Debounce | Throttle |
|---|---|---|
| When it runs | Once, after activity stops | At most once per window |
| Timing | Trailing edge of the burst | Steady cadence |
| Use case | Search-as-you-type, autosave | Scroll, resize, drag |
| Result of 10 rapid calls | 1 call (after the pause) | ~1 call per window |

| | `==` | `===` |
|---|---|---|
| Converts types | Yes | No |
| `0 == "0"` | `true` | `false` |
| `null == undefined` | `true` | `false` |
| Default choice | Never in new code | Always |

## 13. Code Example

The classic "predict the output" gauntlet. Cover the answers, then read on.

```js
const fn = () => {
  console.log('a');
  setTimeout(() => console.log('b'), 0);
  Promise.resolve().then(() => console.log('c'));
  console.log('d');
};

fn();
```

Output:

```text
a
d
c
b
```

Why: `a` and `d` are synchronous. The promise callback is a microtask, so it drains before
the timer's macrotask — even though the timer was scheduled first. `c` before `b` is the
entire event-loop lesson in one snippet.

```narrate
2: synchronous — logs immediately
3: macrotask — queued, runs after the stack and the microtasks
4: microtask — runs when the stack empties, before the macrotask
5: synchronous — logs immediately
7: the order is the event-loop rule in miniature: sync, then microtasks, then one macrotask
```

And the `this` gauntlet:

```js
'use strict';

const name = 'module scope';

const obj = {
  name: 'ali',
  greet() {
    console.log(this.name);
  },
  arrow: () => console.log(name),
};

const detached = obj.greet;

obj.greet();
try {
  detached();
} catch (err) {
  console.log('detached:', err.constructor.name);
}
obj.arrow();
```

Output:

```text
ali
detached: TypeError
module scope
```

`obj.greet()` binds implicitly to `obj`. The detached reference loses that binding, so in
strict mode `this` is `undefined` and the call throws. The arrow has no `this` of its own —
it reads the *enclosing scope's* `name`, the outer `const`, not `obj`'s property.

## 14. Performance Notes

- **Rehearsal cost is time, and it is the cheapest investment in the module.** Ten minutes
  out loud per question beats an hour re-reading definitions silently.
- **Don't optimise the wrong muscle.** The bottleneck in an interview is retrieval and
  phrasing, not knowledge. Practise saying answers, not just recognising them.
- **Debounce and throttle are the two answers where real numbers win.** Being able to say
  "our search fired ~200 requests per second before, now one per pause" is a stronger answer
  than any definition.
- **Memoization is the answer where the caveat matters.** "And it only helps for pure
  functions — I'd measure before adding it" is the difference between a rehearsed and a
  senior answer.

## 15. Debugging Scenarios

**Scenario 1: "The interview asks a question you know you learned — and your mind goes blank."**

Say the one thing you *are* sure of out loud, however small. "I know this is about scope —"
and the retrieval often unblocks. Silence is the only answer you cannot recover from.

**Scenario 2: "Your output prediction is wrong."**

That is the best moment in the whole roadmap — from the module overview, wrong predictions
are the highest-value moments. Do not move on: re-derive the correct order from the rules,
then say the corrected answer out loud.

**Scenario 3: "The interviewer asks a `this` question and you freeze."**

Name the four rules out loud in order — implicit, explicit, `new`, default — and then walk
the example through them. The rules are a checklist; freezing happens when you try to hold
the whole answer in your head at once.

**Scenario 4: "You don't know the question at all."**

Say so, cleanly, and show the path: "I haven't used that — here's what the name suggests,
and I'd check the docs before shipping it." Confident honesty beats a confident guess every
time, and it keeps the rest of the interview alive.

## 16. Quick Revision Notes

- Closure: function + the scope it was created in; captures variables, not values
- Event loop: stack → drain microtasks → one macrotask → repeat
- `this`: implicit, explicit (`call`/`apply`/`bind`), `new`, default — arrows use lexical scope
- Prototype chain: property lookup walks `[[Prototype]]` links until `null`
- Promise: pending → fulfilled/rejected once; `.then` chains flatten
- `async`/`await`: syntax over the same microtask machinery
- `var` hoists as `undefined`; `let`/`const` hoist into the TDZ and throw early
- `===` no coercion; `==` coerces; `null == undefined` is `true`
- `map` transforms, `filter` selects, `reduce` folds — all pure
- Debounce waits for the pause; throttle keeps a cadence
- Curry: `f(a)(b)(c)`; memoize: cache results by argument in a closure
- `const` freezes the binding, not the contents
- Floats: compare with epsilon, or work in integer units
- Async errors: `try/catch` around `await`; every chain ends in a `.catch`

## 17. Cheat Sheet

```text
ANSWER SHAPE:  direct → why → example        (under 30 seconds)

EVENT LOOP:    sync → ALL microtasks → ONE macrotask → repeat

this BINDING:  obj.m()          → obj
               fn.call(obj)     → obj
               new F()          → fresh object
               plain call       → undefined (strict)
               arrow            → lexical (no own this)

FALSY:         0, "", null, undefined, NaN, false

FLOAT CHECK:   Math.abs(a - b) < 1e-9

STALE CLOSURE: capture the variable, not its value
               → setCount(prev => prev + 1)
```

## 18. Key Takeaways

> [!RECAP]
> - This is rehearsal: every concept here is revision; the only new skill is saying it out loud
> - The interview samples the curriculum — every question maps back to a lesson in this module
> - The 30-second answer shape: direct, then the mechanism, then a concrete example
> - Predict every code block's output before reading the answer — prediction is the practice
> - The senior layer is the *why*: closures capture variables, microtasks drain before macrotasks, `===` never coerces
> - Say "I don't know" cleanly and show the path — confident honesty always beats a confident guess
> - If you cannot say an answer cleanly twice, you have not finished the question

## Check your understanding

Answer these without looking back.

1. Say the 30-second answer to "what is the event loop?" out loud, then check section 10.
2. Why does a `.then` inside another `.then` still run before a `setTimeout(…, 0)` scheduled earlier?
3. What are the four `this` binding rules, in priority order — and what do arrows do?
4. Where does `[].map` actually live, and how does lookup find it?
5. What is the difference between hoisting for `var` and hoisting for `let`?
6. Give one real situation where you would choose `==` over `===`.
7. Why does debounce run once and throttle run steadily — which one for a search box?
8. When is memoization a waste, and how do you decide before adding it?

## What's Next

**Lesson 98 — Top TypeScript Interview Questions.** The same rehearsal format for the type
system: interface vs type, generics, narrowing, utility types and `infer` — the questions
interviewers ask when they want to know if you write TypeScript or merely tolerate it.
