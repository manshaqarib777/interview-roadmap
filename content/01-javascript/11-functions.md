# Lesson 11 — Functions: Declarations vs Expressions

**Interview importance:** ⭐⭐⭐ — a standard warm-up, with one trick detail: hoisting.

"Declare a function" and "store a function in a variable" look nearly identical and behave
very differently. The difference is hoisting, from Lesson 3, and it makes a reliable trick
question — so we settle it once, precisely.

## Learning Objectives

By the end of this lesson you should be able to:

- Tell a function declaration from a function expression on sight
- Predict which one is callable before its line runs, and why
- Explain how `var` and `let`/`const` change what hoisting means for an expression
- Use named function expressions to get readable stack traces
- Pick the right form for the situation without thinking

## 1. One-line definition

**A function declaration is hoisted in full — callable anywhere in its scope; a function
expression is not hoisted as a function, so it is callable only after the assignment runs.**

## 2. Mental model

A function declaration is a recipe pinned to the kitchen wall before you start cooking. A
function expression is a recipe torn from a magazine at the exact line where it executes —
until that line runs, the name refers to nothing you can cook with.

```text
Declaration:  recipe on the wall from the start   → callable immediately
Expression:   recipe in the magazine              → must reach the line first
```

## 3. Visual flow

```text
Function declaration               Function expression
┌───────────────────────────┐     ┌───────────────────────────┐
│ hoisted in full           │     │ binding hoisted only      │
│   function greet() {…}    │     │   var greet  → undefined  │
│                           │     │   const greet → TDZ       │
│ callable BEFORE its line  │     │ callable only AFTER       │
└───────────────────────────┘     │   the assignment runs     │
                                  └───────────────────────────┘
```

## 4. How It Works

The declaration is usable above its own line:

```js
console.log(declared());            // ✅ hoisted in full

function declared() {
  return 'from a declaration';
}
```

Output:

```text
from a declaration
```

An expression stored in a `var` is hoisted as `undefined` — callable-looking, not callable:

```js
console.log(exprGreet);             // undefined, not a function yet

var exprGreet = function () {
  return 'from an expression';
};

console.log(exprGreet());
```

Output:

```text
undefined
from an expression
```

With `const` or `let`, the binding sits in the Temporal Dead Zone (Lesson 4) — calling it
before the line *throws*, which is strictly better than the silent `undefined`:

```js
try {
  greet();
} catch (e) {
  console.log(e.constructor.name);
}

const greet = function () {
  return 'hi';
};

console.log(greet());
```

Output:

```text
ReferenceError
hi
```

```narrate
line: the declaration is fully hoisted, so it works before its own line
line: a var expression is hoisted as undefined — reading it works, calling it throws a TypeError
line: a const or let expression is in the TDZ — even reading it throws a ReferenceError
line: that escalation from silent undefined to a thrown error is exactly what TDZ is for
```

A named function expression can refer to itself and names itself in stack traces:

```js
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};

console.log(factorial(5));
console.log(factorial.name);
```

Output:

```text
120
fact
```

## 5. Real Project Usage

| Where | Which form | Why |
|---|---|---|
| React component files | Declarations | Hoisting lets you read top-down; named in DevTools |
| Inline callbacks (`map`, `onClick`) | Expressions | No name needed, created at the call site |
| Module pattern internals | Expressions | Created and returned inside a scope (Lesson 15) |
| Anything needing recursion/self-reference | Named expression | The name is only visible inside the body |
| Conditionally-created functions | Expressions | Declarations in `if` blocks are a spec rabbit hole |

Hoisting in practice — call the component before you write it:

```jsx
function App() {
  return <Header />;                       // works: Header is hoisted in full
}

function Header() {
  return <h1>Roadmap</h1>;
}
```

## 6. Interview Explanation

*"A declaration is hoisted entirely, so I can call it before its definition. An expression
is a value I create and assign at runtime — only the binding is hoisted, so calling it
before the assignment either sees `undefined` (`var`) or throws (`let`/`const`). I use
declarations for top-level functions and expressions when I need a function as a value,
like a callback."* — say that in under thirty seconds and move on.

## 7. Senior-Level Insights

- Hoisting is a **parse-time** behaviour, not a runtime one — the engine knows every
  declaration before executing a single line. That's why a declaration "jumps" to the top.
- A function expression named like a variable (`const f = function f() {…}`) is legal and
  the inner name is **only visible inside the body** — it's for recursion and debugging.
- Block-level declarations (inside `if`/`for`) are block-scoped in strict mode but behaved
  inconsistently in legacy sloppy-mode code — engines made it work "well enough". Mention
  the history, don't get lost in it.
- Anonymous function expressions show as `(anonymous)` in stack traces. One well-placed
  name can save minutes of debugging — that's the senior habit.

## 8. Common Mistakes

```js
// ❌ treating the two forms as interchangeable
try {
  run();
} catch (e) {
  console.log(e.constructor.name);
}

const run = () => 'nope';               // an arrow is an expression (Lesson 12)
```

Output:

```text
ReferenceError
```

```js
// ❌ redeclaring a declaration with let/const in the same scope
// SyntaxError: Identifier 'x' has already been declared
function x() {}
// let x = 1;
```

```js
// ❌ anonymous expressions in hot debugging paths
button.onclick = function () { /* … */ };   // stack shows "(anonymous)"
```

## 9. Best Practices

✅ Use **declarations** for top-level functions — hoisted, named, self-documenting

✅ Use **expressions** for callbacks and functions created at runtime

✅ Name a function expression when it's non-trivial — recursion or debugging wins

✅ Read top-down: put shared helpers in declarations and lean on hoisting

❌ Don't call an expression above its assignment and rely on "it happens to work"

❌ Don't redeclare a `function x() {}` with `let`/`const x` in the same scope

## 10. Interview Questions

**Q1. What's the difference between a function declaration and a function expression?**

> A declaration is hoisted in full, so it's callable before its definition. An expression
> is created when the line runs — only the variable binding is hoisted, as `undefined` for
> `var` or into the TDZ for `let`/`const` — so calling it early fails.

**Q2. What happens if you call a function expression before it's assigned?**

> With `var` the binding is hoisted as `undefined`, so you get a `TypeError: f is not a
> function`. With `let`/`const` the binding is in the Temporal Dead Zone, so you get a
> `ReferenceError` — which is the better failure, because it points at the mistake.

**Q3. Can you call a function declaration before it appears in the file?**

> Yes. Declarations are fully hoisted at parse time, so the function exists for the entire
> scope. That's what makes "call before define" work.

**Senior follow-up: How does hoisting differ for `function f(){}` versus `const f = () => {}`?**

> `function f(){}` is hoisted as a complete, callable function. `const f = () => {}` is an
> arrow, which is always an expression, so only the binding is hoisted — into the TDZ. The
> distinction is declaration versus assignment, and the arrow never changes that.

## 11. Follow-Up Questions

**Is an arrow function a declaration or an expression?**

> Always an expression. There is no arrow-function declaration form — that's the whole
> reason a "function" that isn't a declaration has to be assigned before use.

**Why would you ever name a function expression?**

> For self-reference — recursion — and for readable stack traces. The name is scoped to
> the body only, so it can't collide with an outer name.

**What does "statement versus expression" have to do with functions?**

> A declaration is a statement — it does not produce a value. An expression produces a
> value you can store, pass, or return. That's why wrapping a function in parentheses,
> the IIFE trick from Lesson 15, forces expression context.

## 12. Comparison Table

| Property | Declaration `function f(){}` | Expression `const f = function(){}` |
|---|---|---|
| Hoisted as | Full function | Binding only (`undefined` / TDZ) |
| Callable before its line | ✅ | ❌ |
| Produces a value | ❌ (a statement) | ✅ |
| Name available inside body | ✅ | Only if named |
| Can be anonymous | ❌ | ✅ |
| Block-scoped in strict mode | ✅ | ✅ |
| Self-reference | `f` | The inner name, if given one |

## 13. Code Example

All three forms in one file — predict the output before you run it:

```js
'use strict';

console.log(one());                    // declaration, hoisted — fine

function one() {
  return 1;
}

console.log(two);                      // undefined — var binding hoisted, value not
// two();                              // 💥 TypeError

var two = function () {
  return 2;
};

console.log(two());

try {
  three();
} catch (e) {
  console.log('three:', e.constructor.name);
}

const three = () => 3;                 // arrow, expression, TDZ
console.log(three());
```

Output:

```text
1
undefined
2
three: ReferenceError
3
```

## 14. Performance Notes

There is no meaningful speed difference — V8 compiles both forms to the same optimized
code. Where cost shows up is *allocation*: a fresh function expression created per call
(per render, per loop iteration) allocates each time. Usually irrelevant; in a hot path,
hoist the function out of the loop. Named expressions cost nothing and pay for
themselves in profiling.

## 15. Debugging Scenarios

**"TypeError: f is not a function"** — you're calling an expression stored with `var`
before the assignment. Read the binding above the call site.

**"ReferenceError: Cannot access 'f' before initialization"** — same mistake with
`const`/`let`. The TDZ is doing its job.

**Stack trace shows `(anonymous)`** — an unnamed expression. Add a name, or convert to a
declaration when the function is worth naming.

**A function "works" above its line in one file but not another** — one file uses a
declaration, the other a `const` arrow. Hoisting only applies to the first.

## 16. Quick Revision Notes

- Declaration = statement, hoisted **in full** — callable anywhere in scope
- Expression = value, created at runtime — callable only after its line
- `var f = function…` → hoisted as `undefined` → `TypeError` if called early
- `const f = function…` → hoisted into the TDZ → `ReferenceError` if touched early
- Name an expression to get self-reference and readable stack traces
- Arrows (Lesson 12) and callbacks are always expressions
- Hoisting is parse-time, so it costs nothing at runtime

## 17. Cheat Sheet

```text
function f() {}          declaration   hoisted fully     callable anywhere
const f = function(){}   expression    binding hoisted   callable after line
const f = () => {}       expression    TDZ               callable after line
var f = function(){}     expression    hoisted undefined callable after line
(function f(){})         expression    needs parens      IIFE (Lesson 15)
```

## 18. Key Takeaways

> [!RECAP]
> - Declarations are hoisted in full; expressions are created where they're written
> - `var` expressions surface as `undefined`; `let`/`const` expressions throw via the TDZ
> - Arrow functions are always expressions — they never get declaration hoisting
> - Named function expressions give self-reference and readable stack traces
> - Use declarations for top-level functions, expressions for functions-as-values

## Check your understanding

Answer these without looking back.

1. Which form is callable before its own line, and why?
2. What exactly is hoisted for `var f = function(){}`? What does calling it early produce?
3. Why does the `const` version throw a `ReferenceError` instead of a `TypeError`?
4. Can an arrow function ever be a function declaration? Why not?
5. When would you give a function expression a name?
6. What's the difference between a statement and an expression, in one sentence?

## What's Next

**Lesson 12 — Arrow Functions.** The most common expression form in modern code — and
lexical `this` is why they exist, not the shorter syntax.
