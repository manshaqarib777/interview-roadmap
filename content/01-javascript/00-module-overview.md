# Module 1 — JavaScript Foundations

## Why this module comes first

Almost every "React bug" people bring to a senior engineer is actually a JavaScript bug
wearing a React costume:

| The bug people report | What it actually is |
|---|---|
| "My `useEffect` runs on every render" | Reference equality of objects/arrays (Lesson 6) |
| "My state is stale inside `setTimeout`" | Closures capturing a snapshot (Lesson 5) |
| "`this` is undefined in my class method" | Binding rules (Lesson 10) |
| "My loop handlers all log the last index" | `var` scoping (Lessons 1–2) |
| "My `await` in a `forEach` doesn't wait" | Callbacks + event loop (Lessons 13, 22) |
| "State updates seem one render behind" | Batching + microtask queue (Lesson 23) |

Interviewers know this. That's why mid-to-senior frontend interviews spend 30–50% of the
time on plain JavaScript even for a React role. If your JS is genuinely solid, the React
answers become obvious. If it isn't, no amount of React trivia hides it.

## Module map

- **M1 · Core Mechanics (L1–L10)** — how the engine stores and looks up values.
  Variables, scope, hoisting, TDZ, closures, references, coercion, objects, prototypes, `this`.
- **M2 · Data & Functions (L11–L20)** — how you shape and transform data.
  Function forms, arrow functions, HOFs, purity, currying, memoization, debounce/throttle, arrays, destructuring.
- **M3 · Async (L21–L28)** — how JavaScript does one thing at a time and still feels concurrent.
  Call stack, event loop, task queues, promises, `async`/`await`, combinators, errors, modern ES.

## How to study each lesson

1. **Read sections 1–3 slowly.** The "how it works internally" section is what separates a
   mid-level answer from a senior one. Interviewers probe there.
2. **Predict before you run.** Every code block: guess the output, *then* run it.
   Wrong predictions are the highest-value moments in this whole roadmap.
3. **Do the exercise in a file, not in your head.** Run it with `node exercises/01-javascript/<name>.js`.
4. **Say the summary out loud** as if answering an interviewer. If you stumble, re-read.

## Prerequisites

Node.js installed (you have v22). That's it — every exercise runs with `node file.js`.
Browser DevTools console works for anything except the module lessons.

## Next

→ [Lesson 1 — Variables: `var`, `let`, `const`](./01-variables.md)
