# Lesson 12 — Arrow Functions

**Interview importance:** ⭐⭐⭐⭐ — "why do arrow functions exist?" is asked constantly,
and the wrong answer is the most common one.

Every candidate can say "shorter syntax". The point of arrows is **lexical `this`** — an
arrow has no `this` of its own, so it uses the enclosing scope's. That one fact is why
they replaced the callback dance, and why they're the wrong tool for methods.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the *reason* arrows exist, not just the syntax
- Trace which `this` an arrow sees, in any nesting
- Say exactly how arrows differ from regular functions beyond the shorthand
- Use them in React callbacks without losing state or `this`
- Say when an arrow is the wrong tool — methods, constructors, generators

## 1. One-line definition

**An arrow function has no `this`, `arguments`, `super` or `new.target` of its own — it
inherits them lexically from the scope where it's written.**

## 2. Mental model

A regular function asks *"how was I called?"* to find `this`. An arrow never asks — it
looks up the surrounding code, like a variable following the scope chain from Lesson 2.
"Shorter syntax" is a side effect; the behavior is the feature.

```text
regular:  this ← how it's called   (call-time, Lesson 10)
arrow:    this ← where it's written (definition-time)
```

## 3. Visual Flow

```text
object method
   └── this = the object (implicit binding)

function expression inside a method
   └── this = its own, call-time  → usually undefined

arrow inside a method
   └── this = the method's this  → the object again
```

## 4. How It Works

The four binding rules from Lesson 10 apply to regular functions. Arrows skip them all —
no `this`, `arguments`, `super` or `new.target` of their own:

```js
const f = () => {};
console.log(f.hasOwnProperty('prototype'));   // no prototype → not a constructor
console.log(f.length);
```

Output:

```text
false
0
```

This is the whole reason they exist — the classic timer bug and its fix:

```js
const timer = {
  label: 'timer',
  startBroken() {
    setTimeout(function () {
      console.log('broken:', this?.label);      // function's own this
    }, 0);
  },
  startFixed() {
    setTimeout(() => {
      console.log('fixed:', this.label);        // inherited from startFixed
    }, 0);
  },
};

timer.startBroken();
timer.startFixed();
```

Output:

```text
broken: undefined
fixed: timer
```

```narrate
line: the regular callback gets its own this — undefined in strict mode, so the optional chaining hides the failure
line: the arrow inherits this from startFixed, which was called as a method, so it's the timer object
line: this is the pre-2015 fix that used to be written const self = this
```

The same idea nested: an arrow inside an arrow keeps climbing until it finds a `this`:

```js
const outer = {
  label: 'outer',
  method() {
    const first = () => this.label;                 // outer
    const second = () => first() + ' → ' + this.label; // still outer
    return second();
  },
};

console.log(outer.method());
```

Output:

```text
outer → outer
```

## 5. Real Project Usage

| Where | Why the arrow wins |
|---|---|
| `setTimeout`, event callbacks | Inherits the surrounding `this` — no `bind` needed |
| `.map`, `.filter`, `.reduce` | Short return, no accidental `this` to lose |
| React event handlers | `onClick={() => …}` keeps component `this`/state |
| Promise chains | `.then(v => …)` stays in the enclosing scope |
| Class field arrows (Lesson 10) | One arrow per instance, `this` pre-fixed |

In React, the callback keeps seeing the right `this` — and with hooks there is no `this`
at all, so arrows are just the natural shape:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## 6. Interview Explanation

*"Arrow functions exist for lexical `this`. A regular function decides `this` at call
time, so it breaks when passed as a callback. An arrow has no `this` of its own — it uses
the one from the code around it, so a timer callback still sees the object it was written
in. That removes the old `const self = this` and `bind` dance. Shorter syntax is a bonus,
not the reason."*

## 7. Senior-Level Insights

- An arrow inherits `this` through the **scope chain** (Lesson 2), so it also inherits
  across functions, blocks and modules — there is no "arrow with its own `this`".
- Arrows can't be constructors. Calling one with `new` is a `TypeError`, and they have no
  `prototype` property — a reliable one-line interview check.
- They also don't get `arguments`. Rest parameters (`(...args)`) are the replacement.
- Because `this` is lexical, an arrow can't be rebound with `call`/`apply`/`bind` — the
  arguments still pass, the `this` argument is ignored.
- They can't be generators — no `function*` arrow form exists.

## 8. Common Mistakes

```js
// ❌ arrow as an object method — no enclosing object scope to inherit from
const bad = {
  name: 'bad',
  greet: () => this.name,
};
console.log(bad.greet());
```

Output:

```text
undefined
```

The object literal doesn't create a scope, so the arrow looks further out — to the
module, where `this` is `undefined`. Fix with a method shorthand:

```js
const good = {
  name: 'good',
  greet() {
    return this.name;
  },
};
console.log(good.greet());
```

Output:

```text
good
```

```js
// ❌ calling an arrow before its line — it's an expression (Lesson 11), TDZ throws
try {
  greet();
} catch (e) {
  console.log(e.constructor.name);
}

const greet = () => 'hi';
```

Output:

```text
ReferenceError
```

## 9. Best Practices

✅ Use arrows for callbacks — timers, events, array methods, promise chains

✅ Use arrows in React when you don't need the element/event as `this`

✅ Use the implicit return only for single expressions

✅ Reach for `(...args)` instead of `arguments` inside arrows

❌ Don't use an arrow as an object or prototype method

❌ Don't use an arrow for a constructor, generator, or when you need `this` from the caller

## 10. Interview Questions

**Q1. Why do arrow functions exist?**

> For lexical `this`. A regular function gets `this` from how it's called, which breaks
> when it's passed as a callback. An arrow has no `this` of its own and uses the
> surrounding scope's, so the fix is automatic. The shorter syntax is a bonus, not the
> point.

**Q2. How is `this` different inside an arrow function?**

> There is no `this` inside an arrow — the identifier resolves through the scope chain to
> the enclosing function's. That's why arrows can't be rebound with `call`, `apply` or
> `bind`, and why they don't work as constructors.

**Q3. What can't an arrow function do?**

> Be a constructor — no `prototype`, calling with `new` throws. Be a generator — there's
> no `function*` arrow form. Have its own `arguments` or `this`. And as a method on an
> object or prototype it can't get the object from the call.

**Q4. When would you avoid an arrow function?**

> Whenever the caller's `this` matters — object methods, prototype methods, DOM event
> handlers that want `this` to be the element, and constructors. Use a regular function
> or method shorthand there.

**Senior follow-up: Why does `() => this` ignore `.call()`, and what does that imply?**

> Because the arrow never creates a `this` binding, so `call`'s first argument has nothing
> to bind to and is silently dropped — the function still receives its other arguments.
> Implication: you can't use arrows to build "bound" utilities, and if you need per-call
> context you must pass it as a parameter instead.

## 11. Follow-Up Questions

**Do arrow functions get hoisted?**

> No — an arrow is always an expression (Lesson 11), so only its `const`/`let` binding is
> hoisted, into the Temporal Dead Zone. Call one before its line and you get a
> `ReferenceError`.

**Can you use `arguments` inside an arrow?**

> No, but you rarely need to — a rest parameter `(...args)` is cleaner and works in
> arrows, and `arguments` inside a regular function is already a smell.

**Do arrows work with `this` in class fields?**

> Yes — a class-field arrow (Lesson 10) is created once per instance with `this` already
> pointing at the instance, which is exactly why it's the standard fix for passing a
> method as a callback.

## 12. Comparison Table

| Property | Regular function | Arrow function |
|---|---|---|
| `this` | Call-time (Lesson 10) | Lexical — inherited |
| `arguments` | Own | Inherited (use `...args`) |
| Constructor (`new`) | ✅ | ❌ `TypeError` |
| `prototype` property | ✅ | ❌ |
| Generator (`function*`) | ✅ | ❌ |
| `call`/`apply`/`bind` | Rebindable | `this` argument ignored |
| Object method | ✅ (method shorthand) | ❌ |
| Implicit return | ❌ | ✅ single expressions |
| Hoisting | Declaration form hoists | Never — always an expression |

## 13. Code Example

Predict the output, then run it:

```js
'use strict';

const arrow = () => 'arrow';

console.log(arrow.hasOwnProperty('prototype'));

try {
  new arrow();
} catch (e) {
  console.log('new:', e.constructor.name);
}

console.log(arrow.call({ forced: true }));       // this argument ignored

const collect = (...args) => args;
console.log(collect(1, 2, 3));
```

Output:

```text
false
new: TypeError
arrow
[ 1, 2, 3 ]
```

## 14. Performance Notes

Arrows are not meaningfully faster than regular functions — V8 compiles both to
optimized code. The real costs are elsewhere: an arrow created inside a render or a hot
loop allocates a fresh function each time, so hoist stable callbacks out when it shows up
in profiling. Class-field arrows trade one allocation per instance for correct `this` —
that's the conscious trade.

## 15. Debugging Scenarios

**"`this` is undefined in my method"** — you used an arrow as an object or prototype
method. It has no own `this`, and there's no enclosing function scope. Switch to method
shorthand.

**"`this` is the wrong object in my timer"** — a regular function callback is re-deciding
`this` at call time (Lesson 10). Use an arrow, or `bind` the callback.

**"Cannot read properties of undefined" inside an arrow** — you read `this.x` where
`this` is inherited as `undefined` (module top level, strict mode). The arrow is doing
exactly what it's supposed to; the fix is to check where the enclosing `this` comes from.

**"Unexpected token '=>'"** — the codebase predates ES2015 or the parser is misreading a
`<`/`>` next to `=>`. Modern tooling doesn't hit this; if it does, it's a build config
issue, not a syntax one.

## 16. Quick Revision Notes

- Arrows exist for **lexical `this`** — say that first, always
- No `this`, `arguments`, `super`, `new.target`, `prototype`; not constructible
- Inherit `this` through the scope chain — no own binding to rebind
- Never an object/prototype method; use method shorthand there
- Always an expression — TDZ, no hoisting (Lessons 11, 4)
- Implicit return for single expressions; `...args` replaces `arguments`
- React callbacks: arrows are the natural shape, especially with hooks

## 17. Cheat Sheet

```text
() => expr              implicit return — no braces
() => { … }             block body — explicit return
x => x * 2              one parameter, no parens
(a, b) => a + b         multiple parameters
async () => await f()   async arrows exist
function* () {}         ❌ no generator arrow
```

## 18. Key Takeaways

> [!RECAP]
> - Lexical `this` is the reason arrows exist — shorter syntax is the bonus
> - An arrow inherits `this`, `arguments` and `new.target` from its enclosing scope
> - No `prototype`, no constructor, no generator form — and `call`/`bind` can't rebind them
> - Wrong tools: object methods, prototype methods, anything needing call-time `this`
> - Always an expression: TDZ, never hoisted (Lessons 11 and 4)
> - In React, arrows are the default callback shape — with hooks there's no `this` to lose

## Check your understanding

Answer these without looking back.

1. In one sentence: why do arrow functions exist?
2. Trace what `this` is inside an arrow nested two functions deep.
3. Why can't `call` or `bind` change an arrow's `this`?
4. Name three things an arrow function cannot do.
5. Why is an arrow the wrong tool for an object method?
6. What replaces `arguments` inside an arrow, and why is it better?

## What's Next

**Lesson 13 — Higher-Order Functions & Callbacks.** Arrows are the perfect value to pass
around — and passing functions as values is the whole idea.
