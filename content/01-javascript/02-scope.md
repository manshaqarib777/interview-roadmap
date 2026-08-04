# Lesson 2 — Scope

**Interview importance:** ⭐⭐⭐⭐⭐ — one of the most commonly asked JavaScript topics.

Scope is the answer to one question: *from here, which names can I see?* Every "why is this
undefined" bug resolves to it.

## Learning Objectives

By the end of this lesson you'll understand:

- What scope is and why it exists
- Global, function and block scope
- Lexical scope and the scope chain
- Variable shadowing
- How scope keeps large codebases maintainable

## 1. What is Scope?

Scope determines **where a variable is accessible** in your program. Think of it as
visibility.

Imagine a company:

- The CEO can access everything
- A department manager can access only their department
- An employee can access only their own tasks

Variables work the same way.

## 2. Why Do We Need Scope?

Imagine this:

```js
let username = 'Ali';

// 5000 lines later…

username = 'Ahmed';
```

Without scope, any part of the application could modify any variable. Scope:

- Prevents accidental modification
- Avoids naming conflicts
- Organises code and improves readability
- Keeps variables alive only where they're needed

## 3. Global Scope

A variable declared outside any function or block is global.

```js
const appName = 'My App';

function start() {
  console.log(appName);
}

start();
console.log(appName);
```

Output:

```text
My App
My App
```

Both the function and the top level can see it. Too many globals is a problem, because they
can be changed from anywhere, they collide by name, and they make debugging harder. Modern
applications keep the global scope as small as possible.

## 4. Function Scope

Variables declared inside a function exist only inside it.

```js
function login() {
  const token = 'abc123';
  console.log(token);
}

login();
console.log(token);
```

Output:

```text
abc123
💥 ReferenceError: token is not defined
```

Think of a function as a room. People inside can see everything in it; people outside can't
see in.

## 5. Block Scope

A block is anything inside `{ }` — `if`, `for`, `while`, or a bare block. Variables declared
with `let` and `const` are block-scoped.

```js
if (true) {
  const message = 'Hello';
}

console.log(message);
```

Output:

```text
💥 ReferenceError: message is not defined
```

## 6. `var` Is Not Block Scoped

This is one of the biggest reasons `var` is discouraged.

```js
if (true) {
  var age = 28;
}

console.log(age);
```

Output:

```text
28
```

Most people expect `age` to disappear with the block. It doesn't — `var` is function-scoped,
so it escapes to the whole function. Compare:

```js
if (true) {
  let age = 28;
}

console.log(age);
```

Output:

```text
💥 ReferenceError: age is not defined
```

Safer, and far more predictable.

## 7. Lexical Scope

A favourite interview topic. **Lexical scope means a function can access variables from the
place where it was written** — not where it's called.

```js
const company = 'OpenAI';

function developer() {
  const team = 'Frontend';

  function intern() {
    console.log(company);
    console.log(team);
  }

  intern();
}

developer();
```

Output:

```text
OpenAI
Frontend
```

`intern` can see its own variables, `developer`'s, and the global ones. That's the chain.

Now the version that catches people out — predict it before running:

```js
const value = 'global';

function show() {
  console.log(value);
}

function run() {
  const value = 'local';
  show();            // what prints?
}

run();
```

It prints **`global`**. `show` was *written* next to the global `value`, so that's the chain
it carries — forever. Calling it from inside `run` doesn't re-point it. A function remembers
the neighbourhood it was born in, not the one it's visiting.

Get this and closures (Lesson 5) become obvious, because a closure is just this chain
outliving the function that created it.

## 8. The Scope Chain

When JavaScript looks for a name it searches **outward**, stopping at the first match:

```text
current scope → parent → parent's parent → global → ReferenceError
```

Visually:

```text
    ┌─ Global ────────────────────────┐
    │  const app = 'roadmap'          │
    │                                 │
    │  ┌─ outer() ──────────────────┐ │
    │  │  const user = 'Ada'        │ │
    │  │                            │ │
    │  │  ┌─ inner() ─────────────┐ │ │
    │  │  │  const id = 7         │ │ │
    │  │  │                       │ │ │
    │  │  │  id    → found here   │ │ │
    │  │  │  user  → found ───────┼─┘ │
    │  │  │  app   → found ───────┼───┘
    │  │  │  nope  → ReferenceError
    │  │  └───────────────────────┘
    │  └────────────────────────────┘
    └─────────────────────────────────┘
```

The search only goes **outward, never inward**. `outer()` cannot see `id`.

```js
const app = 'roadmap';

function outer() {
  const user = 'Ada';

  function inner() {
    const id = 7;
    console.log(id, user, app);   // reaches out three levels
  }

  inner();
  // console.log(id);  ← would throw: inner's scope is invisible from here
}

outer();
```

## 9. Variable Shadowing

An inner scope can declare a name that already exists outside. The inner one wins locally;
the outer one is untouched.

```js
const language = 'JavaScript';

function demo() {
  const language = 'TypeScript';
  console.log(language);
}

demo();
console.log(language);
```

Output:

```text
TypeScript
JavaScript
```

Compare that with **not** redeclaring — then you're reaching out and modifying the original:

```js
let count = 1;

{
  count = 99;        // no `let` → this is the outer count
}

console.log(count);
```

Output:

```text
99
```

One `let` is the entire difference between "create a new variable" and "modify the existing
one".

## 10. Common Interview Questions

**Q1. What is scope?**

> The set of names visible from a given point in the code. JavaScript has global scope,
> function scope and block scope.
>
> The one that trips people is that `var` only respects function boundaries, so it leaks out
> of `if` and `for` blocks. `let` and `const` respect any `{ }`.

**Q2. What is the scope chain?**

> Every scope holds a reference to the scope that contains it. When you use a name, the
> engine checks the current scope, then walks outward link by link until it finds it —
> otherwise you get `is not defined`.
>
> The search only goes outward. An outer scope can never see into an inner one.

**Q3. What does it mean that scope is lexical?**

> The chain is fixed by where a function is *written* in the source, not by where it's
> called from. A function carries the neighbourhood it was born in.
>
> So if `show()` is defined at the top level and reads `value`, calling it from inside a
> function that has its own local `value` still prints the global one.

**Q4. Why is `var` considered unsafe?**

> It's function-scoped rather than block-scoped, so it escapes blocks people expect to
> contain it. It can also be redeclared silently, and it's hoisted as `undefined` rather
> than throwing.

**Q5. What is variable shadowing, and how is it different from reassigning?**

> Shadowing is declaring a name in an inner scope that already exists outside — the inner
> one hides the outer for that block, and the outer is untouched. Without a declaration
> keyword you're not shadowing at all: the engine walks the chain and modifies the outer
> variable.

**Q6. What actually creates a new scope?**

> A function call, any `{ }` block for `let` and `const`, a module, and the parameter of a
> `catch` clause. An object literal's braces don't — they aren't a block.

**Senior follow-up: Lexical versus dynamic scope — and what does that have to do with closures?**

> Lexical means the chain comes from source position, which is what JavaScript does. Dynamic
> means it would come from the call stack — what shell scripts and some older Lisps do — so
> the same function could see different variables depending on the caller.
>
> Closures fall straight out of the lexical rule: since a function keeps the chain it was
> written in, it still has that chain after the outer function has returned.

## 11. Best Practices

✅ Keep variables scoped as narrowly as they can be

✅ Minimise globals — prefer modules and function parameters

✅ Use `const` by default, `let` only when reassignment is required

✅ Avoid reusing a name in a nested scope unless the shadowing is deliberate

❌ Don't rely on `var` escaping a block. If you need it outside, declare it outside

## 12. Coding Exercise

Predict each output before running.

```js
// 1
const city = 'Riyadh';
function showCity() { console.log(city); }
showCity();

// 2
function demo() { const age = 28; }
// console.log(age);   ← uncomment: what happens?

// 3
if (true) { var x = 10; }
console.log(x);

// 4
if (true) { let y = 20; }
// console.log(y);     ← uncomment: what happens?

// 5
const name = 'Ali';
function printName() {
  const name = 'Ahmed';
  console.log(name);
}
printName();
console.log(name);
```

<details>
<summary>Answers</summary>

1. `Riyadh` — lexical scope: `showCity` sees the global `city`
2. `ReferenceError` — `age` is function-scoped to `demo`
3. `10` — `var` escapes the block
4. `ReferenceError` — `let` doesn't
5. `Ahmed` then `Ali` — shadowing, with the outer untouched

</details>

## 13. Mini Challenge

Write a small program that demonstrates all four:

- A global variable
- A function-scoped variable
- A block-scoped variable
- Variable shadowing

Then explain, out loud, which variables are reachable from each part of it.

## 14. Lesson Summary

> [!RECAP]
> - Scope is the set of names visible from a point in the code
> - Three kinds: global, function (`var` stops here) and block (`let`/`const` stop here)
> - Lookup walks **outward only** — current scope, parent, parent, global, then `ReferenceError`
> - Lexical scope: the chain is set by where you *wrote* the function, not where you called it
> - Shadowing creates a new variable; dropping the keyword modifies the outer one
> - Minimise globals and keep every variable as narrowly scoped as you can

## Check your understanding

Answer these without looking back.

1. From inside a doubly-nested function, describe the exact order the engine searches for a name — and what happens when it runs out.
2. Why can `inner()` see `outer`'s variables, but never the reverse?
3. Predict the output when a top-level `show()` is called from inside a `run()` that declares its own `value` — and say why.
4. What is the difference between writing `let count = 99` and `count = 99` inside a block?
5. Which of `if`, `for`, a function call, and `catch (err)` create a scope that stops a `var`? Which stop a `let`?
6. Explain why lexical scoping is what makes closures possible.

## What's Next

**Lesson 3 — Hoisting.** What hoisting actually is, whether JavaScript really "moves"
declarations (it doesn't), why `var`, `let`, `const` and functions behave differently, and
how it all relates to the execution context.
