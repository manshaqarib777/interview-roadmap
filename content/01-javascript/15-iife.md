# Lesson 15 — IIFE & the Module Pattern

**Interview importance:** ⭐⭐ — you'll rarely write one, but you'll read them forever,
and the pattern explains how JavaScript did encapsulation before modules.

An IIFE — "iffy" — is a function that runs the moment it's created. It gave JavaScript
its only way to hide state (Lesson 5) and became the module pattern, the ancestor of
every import/export today. Legacy code and build artifacts are full of them.

## Learning Objectives

By the end of this lesson you should be able to:

- Define IIFE and read the double-paren syntax out loud
- Explain what problem it solved before modules existed
- Build the module pattern and say what's public versus private
- Spot an IIFE in legacy code and know why it's there
- Say why modern code uses real modules instead

## 1. One-line definition

**An IIFE is a function expression wrapped in parentheses and called immediately —
`(function(){…})()` — creating a private scope that runs once.**

## 2. Mental Model

An IIFE is a one-shot function: declared and executed in the same breath. Wrapping the
function in parentheses turns a statement into an *expression* (Lesson 11) so it can be
called, and the scope it creates is private — everything inside is invisible outside,
unless explicitly handed out.

```text
(function () {          ← create the scope
  let secret = 1;       ← private, unreachable outside
  return { get: () => secret };   ← the only door out
})();                   ← run it immediately
```

## 3. Visual Flow

```text
(function (window) {           ← a scope is created…
  var hidden = 'secret';       ← …private state lives here…
  function helper() { … }      ← …and private helpers too
  window.publicApi = {         ← only this escapes
    get: function () { return hidden; }
  };
})(window);                    ← …and immediately destroyed? no —
                               ← the returned object keeps the scope alive (Lesson 5)
```

## 4. How It Works

The two parens do different jobs — and that's the whole trick:

```js
// 1. The outer parens force expression context.
//    A bare `function` at statement position is a declaration (Lesson 11).
//    `(function …)` is a value that can be called.

(function () {
  console.log('runs once');
})();

// 2. The trailing () calls that expression immediately.
```

Output:

```text
runs once
```

Other legal spellings — `!function(){}()`, `void function(){}()` — are minifier tricks
that also force expression context, and `const f = function(){}()` doesn't even need the
parens because the assignment is already an expression. What the parens add is *direct
invocation* at statement level.

Arguments are just function parameters:

```js
const result = (function (a, b) {
  return a + b;
})(2, 3);

console.log(result);
```

Output:

```text
5
```

Inside the IIFE, `let`/`const` and `var` all stay private:

```js
(function () {
  var leak = 'internal';       // invisible outside
})();

// console.log(leak);          // 💥 ReferenceError — nothing escaped
console.log('still alive');
```

Output:

```text
still alive
```

```narrate
line: the outer parens convert the declaration into an expression, so it can be called
line: the trailing () runs the expression immediately — hence immediately-invoked
line: var, let and const are all scoped to the IIFE, so nothing leaks to the outside
```

## 5. Real Project Usage

The classic module pattern — private state, exposed API:

```js
const counter = (function () {
  let count = 0;                          // private — no one outside can touch it

  return {
    increment() { count += 1; return count; },
    get() { return count; },
    reset() { count = 0; },
  };
})();

console.log(counter.increment());
console.log(counter.increment());
console.log(counter.get());
console.log(counter.count);
```

Output:

```text
1
2
2
undefined
```

The closure from Lesson 5 is doing the work — the IIFE returns an object that keeps
referencing the scope, so the scope survives the call. The module pattern is exactly the
`createAccount` example wearing different clothes.

| What you saw in the wild | What it actually was |
|---|---|
| jQuery plugins (`$.fn.myPlugin = …`) | An IIFE closing over a private helper |
| Old Angular modules (`angular.module(…)`) | IIFE + registry pattern |
| UMD build artifacts | One big IIFE choosing CommonJS vs AMD vs global |
| Bundler output (pre-ESM) | One IIFE per module, wired up by hand |
| `var something = (function(){…})()` | A module: the `var` is the public handle |

## 6. Interview Explanation

*"An IIFE is a function expression that runs immediately — `(function(){…})()`. The
parens force it into expression context so it can be called, and the scope it creates is
private, so variables inside don't leak to the global scope. Before ES modules, that was
JavaScript's only way to encapsulate state, and the module pattern — an IIFE returning a
small public API over private variables — is where it ended up. It's a closure with a
one-shot scope, and it's why modern modules feel familiar."*

## 7. Senior-Level Insights

- The pattern's real name is **"module pattern"**; the IIFE is just the delivery
  mechanism. Being able to separate the two is a senior tell.
- The scope survives because of closures (Lesson 5) — the IIFE ran, but the returned
  object still references it. Say "same mechanism as a counter factory" and you're done.
- `var` inside the IIFE is a feature here: the IIFE is the function scope that `var`
  wants, and it keeps the global namespace clean.
- Revealing-module variation: build the private functions first, then *reveal* the ones
  you want public as method references.
- When you see one IIFE inside another, it's usually two modules stacked — or a
  "namespace" being assembled incrementally.

## 8. Common Mistakes

```js
// ❌ forgetting the parens — this is a declaration, not an IIFE
// function () { console.log('hi'); }();   // 💥 SyntaxError

// ✅ wrapping first, then calling
(function () {
  console.log('hi');
})();
```

Output:

```text
hi
```

```js
// ❌ expecting internal variables to survive outside
const api = (function () {
  let state = 0;
  return { next: () => ++state };
})();

// console.log(state);   // 💥 ReferenceError — state is private by design

console.log(api.next(), api.next());
```

Output:

```text
1 2
```

```js
// ❌ treating an IIFE like a function you can call again
// (function () { … })();  — ran already; calling the name does nothing
```

## 9. Best Practices

✅ Use an IIFE when you need a one-shot scope and can't use a module

✅ Return the smallest public API — expose methods, hide everything else

✅ Keep IIFEs tiny and single-purpose; a big IIFE is a module that escaped

✅ Use the `(function(){…})()` spelling — readable, obvious, no cleverness

❌ Don't write new IIFEs where a `const` block, a module, or a class would do

❌ Don't hoist logic out of an IIFE "just in case" — the privacy is the point

## 10. Interview Questions

**Q1. What is an IIFE?**

> Immediately-Invoked Function Expression — a function expression wrapped in
> parentheses and called right away: `(function(){…})()`. The parens make it an
> expression so it can be invoked, and its scope is private.

**Q2. Why were IIFEs used so much before ES modules?**

> Because they were the only way to encapsulate state. A scope is created by the
> function, so wrapping code in an IIFE kept its variables off the global scope and
> produced the module pattern: an IIFE returning a small API over private variables.

**Q3. How does the module pattern work?**

> An IIFE holds private state in its own scope and returns an object of functions that
> close over it — like `count` hidden inside with `increment` and `get` exposed. The
> closure (Lesson 5) keeps the scope alive, so the API works even after the IIFE has
> finished running.

**Q4. Why is an IIFE still used in modern code?**

> Mostly it isn't — ES modules give the same privacy with cleaner syntax. It survives in
> legacy code, build artifacts and a few hot-path micro-optimizations, and reading it is
> a genuinely common interview and code-review skill.

**Senior follow-up: What's the relationship between an IIFE and a closure?**

> The IIFE creates the scope; the closure is what keeps it alive. The IIFE runs once and
> returns functions that reference its variables — the same mechanism as any factory
> (Lesson 5). The module pattern is just the intentional use of both: one-shot scope,
> deliberately retained by the API it returns.

## 11. Follow-Up Questions

**Can an IIFE return a value?**

> Yes — `const result = (function(){ return 42; })();` is a common way to compute a value
> with private intermediate state. The returned value is whatever the IIFE returns.

**What's the difference between an IIFE and a module?**

> A module is the *pattern* — private state plus a public API. An IIFE is the
> *mechanism* that delivers it. ES modules give the same privacy as syntax, with
> `import`/`export`, so the IIFE's job is largely done.

**Why do arrow IIFEs exist?**

> `(() => { … })()` — same idea, lexical `this` (Lesson 12) and slightly terser. They're
> common in scripts where you want a private scope without a function keyword.

## 12. Comparison Table

| Feature | IIFE | ES module (`export`/`import`) |
|---|---|---|
| Scope | Function scope | File scope |
| Private state | ✅ via closure | ✅ top-level, not exported |
| Dependency sharing | Via arguments / globals | Explicit `import` |
| Loaded | Eagerly, in order | Lazy, per-module, cached |
| `this` at top level | The IIFE's (call-dependent) | `undefined` (always strict) |
| Where you'll find it | Legacy code, build artifacts | Modern code |
| When to write one | Almost never | Always |

## 13. Code Example

A runnable module pattern with a private helper — predict the output:

```js
const config = (function () {
  const defaults = { theme: 'dark', lang: 'en' };   // private

  function merge(overrides) {                       // private helper
    return { ...defaults, ...overrides };
  }

  return {
    get: (key) => defaults[key],                    // read through the API only
    apply(overrides) { return merge(overrides); },
  };
})();

console.log(config.get('theme'));
console.log(config.apply({ lang: 'ar' }));
console.log(config.defaults);
```

Output:

```text
dark
{ theme: 'dark', lang: 'ar' }
undefined
```

## 14. Performance Notes

An IIFE's cost is one function call — negligible and usually a one-time initialization.
The real-world cost is the *opposite* of performance: an IIFE created per event or per
render allocates and captures each time, so keep them as one-shot module-scope
constructions. V8 optimizes them well, but the pattern's value is privacy, not speed.
There's also a startup-cost angle — legacy bundles full of IIFEs parse and run at load,
which is precisely why bundlers replaced them with smaller, lazy ESM graphs.

## 15. Debugging Scenarios

**"I can't reach a variable that's 'inside my script'"** — it's inside an IIFE; it's
private by design. Export what you need by assigning to a shared object or returning it.

**"SyntaxError: Unexpected token ')'"** — the parens are unbalanced, or you wrote
`function(){}()` without the wrapping parens, which is a declaration, not an expression.

**"My variable is `undefined` but I declared it"** — the declaration is inside a
different IIFE. Each IIFE is its own scope; nothing crosses the boundary except what's
explicitly returned.

**"jQuery is not defined" inside a plugin** — the plugin's IIFE expects `jQuery` as an
argument, but the argument order or the global name changed. Check the IIFE's parameters.

## 16. Quick Revision Notes

- IIFE = Immediately-Invoked Function Expression — `(function(){…})()`
- Parens force expression context; trailing `()` invokes immediately
- Creates a private scope — no leaks to the global object
- Module pattern = IIFE returning a public API over private state
- Survival of the scope = closures from Lesson 5
- `(() => { … })()` — arrow IIFE, lexical `this`
- ES modules replaced IIFEs: same privacy, explicit imports, file scope
- Legacy code, jQuery plugins and bundle artifacts are full of them

## 17. Cheat Sheet

```text
(function () { … })();         classic IIFE
(() => { … })();               arrow IIFE
const m = (function () {
  let secret = 0;              private state
  return { get: () => secret } public API
})();                          module pattern
!function(){…}()               minifier's expression trick — avoid in new code
```

## 18. Key Takeaways

> [!RECAP]
> - An IIFE is a function expression called the instant it's created
> - The parens force expression context; the trailing `()` calls it
> - It creates a private scope — JavaScript's pre-module answer to encapsulation
> - The module pattern is an IIFE returning a small API over private state (Lesson 5)
> - The scope survives because closures keep referencing it
> - Modern code uses ES modules for the same privacy — read IIFEs, rarely write them

## Check your understanding

Answer these without looking back.

1. Write an IIFE from memory — both pairs of parentheses.
2. What does each pair of parentheses do?
3. What problem did the IIFE solve before ES modules?
4. Why does the module pattern's private state survive after the IIFE returns?
5. How is an arrow IIFE different from a classic one?
6. Name three places you'll still find IIFEs today.

## What's Next

**Lesson 16 — Currying & Partial Application.** From "a function that returns a
function" to an entire style of composing functions — the HOF idea taken to its logical end.
