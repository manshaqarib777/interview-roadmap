# Lesson 3 — Hoisting

**Interview importance:** ⭐⭐⭐⭐⭐ — asked by name in most junior and mid-level screens.

Nothing moves. That's the whole secret. "Hoisting" is a word for something the engine does
*before* your first line runs — and once you see it as setup, every trick question about it
answers itself.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what the engine does before executing a single line
- Say why `var` gives `undefined` while `let` throws
- Explain why a function declaration can be called above where it's written
- Recognise the classic function-expression trick question
- Correct the "declarations are moved to the top" misconception

## 1. What Hoisting Actually Is

Running a script happens in two phases, and every hoisting question lives in the gap between
them.

| Phase | What happens |
|---|---|
| **1 · Creation** | The engine scans the scope and registers every declaration it finds |
| **2 · Execution** | Your code runs top to bottom, assigning values as it goes |

Hoisting is just phase 1 being invisible. The declarations already exist by the time line 1
executes — only the *values* wait their turn.

> [!NOTE]
> The code never moves. "Declarations are moved to the top" is a teaching shorthand that
> falls apart the moment someone asks about the TDZ. Say "registered during scope creation"
> instead — it's both correct and a strong signal.

## 2. What Each Keyword Gets During Creation

The keyword decides what phase 1 leaves behind:

| Declaration | Registered? | Initialised to | Reading it early |
|---|---|---|---|
| `function f() {}` | Yes | The whole function | ✅ Works |
| `var x` | Yes | `undefined` | ⚠️ Gives `undefined` |
| `let x` / `const x` | Yes | *nothing* | 💥 ReferenceError |
| `class C {}` | Yes | *nothing* | 💥 ReferenceError |
| `var f = function () {}` | Yes (`f` only) | `undefined` | 💥 TypeError when called |

Read that last row twice — it's the interview question. The *variable* hoists as a `var`;
the function on the right is just a value, and values are assigned in phase 2.

## 3. Function Declarations Are the Exception

```js
greet();            // ✅ "hello" — the whole function exists already

function greet() {
  console.log('hello');
}
```

Output:

```text
hello
```

Now the same code with an expression:

```js {1}
greet();            // 💥 TypeError: greet is not a function

var greet = function () {
  console.log('hello');
};
```

The error message is the tell. `greet` *exists* — that's why it isn't a `ReferenceError` —
it's just `undefined`, and you tried to call `undefined`.

Swap `var` for `const` and the message changes again, to `Cannot access 'greet' before
initialization`. Three keywords, three different failures, one shape of code.

## 4. Try It: Predict Before You Press Run

```js
console.log(typeof declaration);   // ?
console.log(typeof expression);    // ?
console.log(hoistedVar);           // ?

function declaration() {}
var expression = function () {};
var hoistedVar = 'assigned later';
```

Output:

```text
function
undefined
undefined
```

> [!TIP]
> Press **Debug** instead of Run and step through it. The variables panel shows
> `declaration` already holding a function on line 1, while `expression` and `hoistedVar`
> sit at `undefined` until their assignment lines. That's phase 1 and phase 2, made visible.

## 5. Functions Win Ties

When a `var` and a function declaration share a name, the function wins during creation —
and execution can still overwrite it afterwards:

```js
console.log(typeof thing);   // "function"  ← the declaration won phase 1

var thing = 'a string';

console.log(typeof thing);   // "string"    ← phase 2 reassigned it

function thing() {}          // declared last, available first
```

Two declarations of the same name with `let` would simply be a `SyntaxError`. That's the
better outcome, and the reason this whole category of confusion is a legacy problem.

> [!DEEPDIVE]
> Function declarations inside blocks are the murkiest corner of the language. In strict
> mode and in modules they're block-scoped, so this throws:
>
> ```js
> { function blocked() {} }
> blocked();   // 💥 ReferenceError in a module
> ```
>
> In sloppy mode, browsers implement legacy web-compatibility semantics that also leak a
> `var` binding to the function scope. If you ever want a function inside an `if`, assign a
> `const` to a function expression and the ambiguity disappears.

## 6. Hoisting Is Per Scope, Not Per File

Each function gets its own creation phase, so a variable declared inside one is registered
there and nowhere else:

```js
var value = 'outer';

function show() {
  console.log(value);   // undefined — not 'outer'
  var value = 'inner';
}

show();
```

Output:

```text
undefined
```

This catches almost everyone. `show` has its own `value`, registered during *its* creation
phase, so the lookup never reaches the outer scope. The declaration shadows the outer one
for the entire function, including the lines above it.

## 7. Common Interview Questions

**Q1. What is hoisting?**

> The engine registers every declaration in a scope before executing any of it, so the
> bindings exist from the first line even though assignments haven't happened yet.
>
> I'd avoid "moved to the top" — nothing moves, and that description can't explain why `let`
> throws instead of giving `undefined`.

**Q2. Are `let` and `const` hoisted?**

> Yes, and the Temporal Dead Zone is the evidence. If they weren't registered, reading one
> early would say `x is not defined`. Instead you get `Cannot access 'x' before
> initialization`, which means the engine already knows about the binding — it just has no
> value yet.

**Q3. Why can you call a function declaration before it appears?**

> Because a declaration is initialised with the whole function during the creation phase,
> not with `undefined`. It's the only form that's fully usable before its line.
>
> A function expression isn't — the variable hoists under its own keyword's rules and the
> function is just a value assigned later.

**Q4. What error do you get calling a hoisted `var` function expression, and why that one?**

> `TypeError: x is not a function`, not a `ReferenceError`. The variable exists and holds
> `undefined`, and calling `undefined` is a type error. The difference in message is a
> reliable way to tell which mistake you actually made.

**Q5. What happens when a `var` and a function declaration share a name?**

> The function declaration wins the creation phase, so `typeof` reports `function` before
> either line runs. Execution can then reassign it like any variable. With `let` it would be
> a `SyntaxError` — a duplicate declaration in the same scope.

**Senior follow-up: Why does a function log `undefined` for a variable that has a value outside it?**

> Because the inner `var` is registered in that function's own scope during its creation
> phase, so it shadows the outer one for the entire body — including the lines above the
> declaration. The lookup finds the local binding immediately and never walks the chain.
>
> It's the strongest argument for `let`: same code, immediate error instead of a
> plausible-looking `undefined`.

## 8. Best Practices

✅ Declare before you use. Hoisting is a fact to understand, not a feature to rely on

✅ Use `const` and `let` — the TDZ turns this whole class of bug into an instant error

✅ Prefer `const fn = () => {}` over `function` declarations if you want consistent rules

❌ Don't declare functions inside `if` blocks — assign a `const` instead

❌ Don't reuse a name across a `var` and a function declaration

## 9. Coding Exercise

Predict every line before running.

```js
console.log(a);
console.log(typeof b);
console.log(typeof c);

var a = 1;
function b() {}
var c = function () {};
```

<details>
<summary>Answer</summary>

```text
undefined
function
undefined
```

`a` is registered and initialised to `undefined`. `b` is fully available. `c` is a `var`
holding `undefined` until its assignment line — calling it here would be a `TypeError`.

</details>

Now the harder one:

```js
var name = 'outer';

function print() {
  console.log(name);
  var name = 'inner';
}

print();
```

<details>
<summary>Answer</summary>

`undefined`. `print` has its own `name`, registered during its creation phase, so the lookup
finds it immediately and never walks out to the global scope.

Change `var name = 'inner'` to `let name = 'inner'` and you get a `ReferenceError`
instead — louder, and much easier to spot.

</details>

## 10. Mini Challenge

Write a short snippet that produces, in this order:

1. A value printed as `undefined` because of `var` hoisting
2. A successful call to a function declared *below* the call
3. A `TypeError` from calling a function expression too early

Then rewrite all three with `const` and explain what each failure becomes.

## 11. Lesson Summary

> [!RECAP]
> - Hoisting is scope setup, not code movement — declarations are registered before execution
> - `var` is initialised to `undefined`; `let`, `const` and `class` are left uninitialised (TDZ)
> - Function declarations are initialised with the whole function, so they work from anywhere in scope
> - A function expression only hoists its *variable* — calling it early is a `TypeError`
> - Function declarations beat `var` on a name clash; `let` makes the clash a `SyntaxError`
> - Every scope has its own creation phase, so an inner `var` shadows the outer for the whole body

## Check your understanding

Answer these without looking back.

1. Describe the two phases of running a script, and say which one hoisting belongs to.
2. What is each of `var`, `let`, `function` and `class` initialised to during the creation phase?
3. Why does calling a hoisted `var` function expression give a `TypeError` rather than a `ReferenceError`?
4. A function reads a variable on its first line and declares it with `var` on its last. What prints, and why?
5. What happens when a function declaration and a `var` share a name? What changes if it's a `let`?
6. Someone says "`let` isn't hoisted." Correct them in one sentence.

## What's Next

**Lesson 4 — The Temporal Dead Zone.** The window where a variable exists but can't be read,
why the language designers chose an error over `undefined`, and the one place `typeof` stops
being safe.
