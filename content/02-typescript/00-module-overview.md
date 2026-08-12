# Module 2 — TypeScript

## Why this module comes second

You cannot fix what you cannot see. The JavaScript module taught you how the language *actually*
behaves — closures, references, the event loop. This module gives you a second program that watches
the first one while you write it.

TypeScript is not paperwork and it is not "JavaScript with types glued on". It is a **faster
feedback loop**: the errors you catch at compile time would otherwise have been runtime bugs in
production, or — worse — silent wrong behaviour in a user's browser. And it is a **safer refactor**:
when you rename a field or change an API's shape, the compiler finds every place that breaks.

Interviewers ask about TypeScript because the working world runs on it. A candidate who can model an
API response, write a generic, and explain why `unknown` beats `any` is a candidate who can be
trusted with a large, long-lived codebase.

## Module map

- **M4 · Type System Fluency (L29–L38)** — how to describe data precisely.
  Why TS, primitives/arrays/tuples, interfaces vs aliases, unions & intersections, narrowing,
  functions & overloads, `keyof`/`typeof`/indexed access, generics, constraints, discriminated unions.
- **M5 · Type-Level Programming (L39–L46)** — where TypeScript becomes a language of its own.
  Utility types, conditional types, mapped types, template literal types, `infer`, `satisfies`/`as
  const`, `unknown` vs `any` vs `never`, `tsconfig` & strict mode.

## How to study each lesson

1. **Read the definitions out loud.** Type questions have crisp one-sentence answers — that's the
   whole point. Own the sentence, then the detail.
2. **Predict before you compile.** Every code block: guess the *type* (and the runtime output),
   *then* check. Wrong predictions are the highest-value moments.
3. **Do the exercise in a file, not in your head.** Run it with
   `node exercises/02-typescript/<name>.js`.
4. **Reimplement the built-ins.** The best TypeScript interview drill is writing `Pick`, `Partial`,
   `ReturnType` and `Awaited` yourself. The lessons hand you each one.

## Prerequisites

Module 1 complete (L1–L28). You need real fluency with objects, arrays, destructuring and ES
modules before the type-system vocabulary makes sense.

## Next

→ [Lesson 29 — Why TypeScript?](./29-why-typescript.md)
