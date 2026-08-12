# Lesson 28 — Modern ES6+ Essentials

**Interview importance:** ⭐⭐ — modules, optional chaining, generators — the vocabulary of every modern codebase.

This is the "does this person write modern JavaScript or are they stuck in 2014?" lesson.
None of these are hard — that's the point: they're **readability features** that show up in
every codebase, and knowing the exact semantics is what lets you skim code instantly. You're
building on destructuring and spread from Lesson 20, and objects from Lesson 8.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain ES modules: named vs default, `import`/`export`, and static vs dynamic imports
- Use optional chaining (`?.`) and nullish coalescing (`??`) without mixing them up with `||`
- Say when a generator is the right tool, and trace `yield` and `next()` precisely
- Explain why `??` and `||` differ, and where mixing `?.` with `??` helps

## 1. What are Modern ES6+ Essentials?

**The post-2015 syntax that makes code shorter and safer: ES modules, optional chaining, nullish coalescing, and generators.**

Four features, four ideas: modules **share code across files**, optional chaining **safely
walks possibly-missing data**, nullish coalescing **supplies a default only when a value is
missing**, and generators **pause and resume functions**.

## 2. Mental Model

- **Modules** — a file is a room with a locked door. `export` hands things through the door;
  `import` reaches in and takes exactly what it asked for. Only the exports are visible.
- **Optional chaining** — a question mark that *checks before reaching*: `user?.name` reads
  "if `user` exists, give me `name`; otherwise `undefined`".
- **Nullish coalescing** — a fallback that only fires on `null`/`undefined`, never on
  `0`, `''` or `false`. `||` fires on *any* falsy value; `??` on *missing* values only.
- **Generators** — a function that **pauses at each `yield`** and hands control (and a
  value) back to the caller, resuming from the exact same line when `next()` is called.

## 3. Visual Flow

```text
ES modules:                     Generators:
  math.js           app.js        function* seq() {      next()       next()
  ┌──────────┐     ┌──────────┐    yield 1;  ────────►  {value:1}    {value:2}
  │ export   │────►│ import   │    yield 2;  ◄────────  resume here  resume here
  │ double   │     │ double   │    yield 3;  ────────►  {value:3}    {done:true}
  └──────────┘     └──────────┘

Optional chaining:  user?.profile?.address?.city
  undefined ─► undefined (skips the rest, no TypeError)
```

## 4. How It Works

**Modules — static by design.** `import`/`export` are *hoisted and resolved before any code
runs* — that's what makes tree-shaking possible (unused exports get dropped at build time).
Two flavours:

```js
// math.js
export function double(n) {
  return n * 2;
}

export const PI = 3.14159;

export default function log(message) {
  console.log('[log]', message);
}
```

```js
// app.js
import log from './logger.js';          // default — you pick the local name
import { double, PI } from './math.js'; // named — name must match

console.log(double(21));
console.log(PI.toFixed(2));
log('app started');
```

Output (running `node app.js` as an ES module):

```text
42
3.14
[log] app started
```

Rules to keep straight:

- **Named** exports (`export const x`) → imported with the **same name** in braces.
- **Default** exports (`export default …`) → imported without braces, any local name.
- One `export default` per file; as many named exports as you like.
- Static imports run at load time, top to bottom. For code-splitting, `import()` returns a
  promise — the dynamic form (Lesson 25 machinery):

```js
const chart = await import('./chart.js');   // loads only when needed
```

**Optional chaining — short-circuits the whole chain:**

```js {2}
const user = { profile: { address: null } };

console.log(user?.profile?.address?.city ?? 'unknown');   // ✅ safe
console.log(user.profile.address.city);                   // 💥 TypeError
```

Output:

```text
unknown
TypeError: Cannot read properties of null (reading 'city')
```

Each `?.` checks *its own left side*: if it's `null`/`undefined`, the whole expression
returns `undefined` and the rest never evaluates.

**Nullish coalescing — the "missing" test, not the "falsy" test:**

```js
function getPort() { return 0; }

console.log(getPort() ?? 3000);          // 0 — 0 is a real port
console.log(getPort() || 3000);          // 3000 — || flips on falsy 0

function maybeName() { return null; }
console.log(maybeName() ?? 'guest');     // guest — null is genuinely missing
```

Output:

```text
0
3000
guest
```

**Generators — pause, hand back, resume:**

```js {2-4}
function* countUp() {
  yield 1;
  yield 2;
  yield 3;
}

const it = countUp();
console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());
```

Output:

```text
{ value: 1, done: false }
{ value: 2, done: false }
{ value: 3, done: false }
{ value: undefined, done: true }
```

Calling a generator **does not run it** — it returns an iterator. Each `next()` runs up to
the next `yield`, hands back `{value, done}`, and pauses.

## 5. Real Project Usage

| Feature | Where you see it |
|---|---|
| **ES modules** | Every React/Vite/Next.js project — every file exports and imports |
| **Optional chaining** | `user?.settings?.theme`, `response?.data?.items`, config lookups |
| **Nullish coalescing** | `const port = env.PORT ?? 3000;`, `count ?? 0`, `props?.title ?? 'Untitled'` |
| **Generators** | Infinite ID sequences, paged fetching, Redux Saga, `async` generators for streams |

## 6. Interview Explanation

> ES modules are static `import`/`export` — named exports must match names, defaults can be
> renamed, and `import()` gives a dynamic, promise-based alternative. `?.` reads a chain and
> returns `undefined` if any link is nullish; `??` falls back only on `null`/`undefined`,
> unlike `||`. Generators are functions that pause at `yield` and resume on `next()`.

## 7. Senior-Level Insights

The features are easy — the *semantics* are where seniors earn the point:

1. **`??` vs `||` is a data-loss bug waiting to happen.** `||` is for *falsy fallback*
   (empty string, `0`); `??` is for *missing* values. A senior knows that `count ?? 0` keeps
   a real `0` and `props.title || 'Untitled'` replaces an empty string.
2. **Static imports are a build-time contract.** The bundler can analyse them, drop unused
   exports (tree-shaking), and split code — so you prefer static imports and reach for
   `import()` only for genuinely lazy-loaded routes.
3. **Generators invert control.** The caller pulls values (`next()`) instead of the function
   pushing them — that's the difference from an array or a callback. `for...of` consumes a
   generator by calling `next()` until `done`, which is why `for...of` over `countUp()`
   prints `1, 2, 3` without you writing `next()`.
4. **`async` generators** pair `await` with `yield` for streams — each `next()` can wait on
   I/O, and `for await...of` consumes the stream.

## 8. Common Mistakes

❌ **`??` with `||`-style thinking** — `0 ?? 'fallback'` is `0`, not `'fallback'`.

❌ **`?.` on the left side of an assignment** — `user?.name = 'x'` is a `SyntaxError`.

❌ **Generators don't run on call** — forgetting `next()` (or `for...of`) leaves the body
unexecuted.

❌ **`await` inside a generator** — it's a `SyntaxError`; use an `async` generator instead.

❌ **Default-importing a named export** — `import double from './math.js'` fails unless
`double` is the default export.

> [!PITFALL]
> You cannot mix `??` with `||` or `&&` in the same expression without parentheses:
> `a ?? b || c` is a `SyntaxError`. And chaining `user?.name` then assigning a fallback is
> where `?.` and `??` pair up naturally: `user?.name ?? 'guest'`.

## 9. Best Practices

✅ Prefer static `import`/`export`; reserve dynamic `import()` for lazy routes

✅ Default-import the main thing a file exports, name-import the helpers

✅ Use `?.` when a value may be missing *by design* (API payloads, optional config)

✅ Use `??` for defaults that must not clobber falsy-but-valid values

✅ Use generators for lazy or infinite sequences — a plain loop for simple lists

❌ Don't use `?.` to hide bugs — if `user` should always exist, let it throw

❌ Don't reach for generators where an array or a simple loop is clearer

## 10. Interview Questions

**Q1. Named vs default exports?**

> Named exports are imported with the same name in braces — `import { double } from …`.
> A file has one default export, imported without braces under any name. Static imports are
> resolved at load time; `import()` is the dynamic, promise-returning form.

**Q2. What does optional chaining do?**

> `user?.profile` reads `profile` only if `user` is not `null`/`undefined`; otherwise the
> whole expression is `undefined` — no `TypeError`. Each `?.` guards its own left side.

**Q3. `??` vs `||`?**

> `||` falls back on any falsy value — `0`, `''`, `false`, `NaN`. `??` falls back only on
> `null`/`undefined`. If a real `0` is meaningful, `??` is the only safe default.

**Q4. What is a generator?**

> A function that pauses at each `yield`. Calling it returns an iterator; `next()` runs to
> the next `yield` and returns `{value, done}`. `for...of` and `for await...of` consume
> generators directly.

**Senior follow-up: Why do generators matter if everyone uses arrays?**

> Because they're **lazy** — a generator produces values on demand, so an infinite sequence
> costs nothing until you pull from it, and a stream can interleave with I/O. That's the
> engine behind async iteration and libraries like Redux Saga, and it's why the language
> added `for await...of` to consume them.

## 11. Follow-up Questions

**Q1. Can `?.` and `??` be mixed?**

> Yes, they pair well: `user?.name ?? 'guest'` reads "name if the chain exists, otherwise
> guest". Mixing `??` with `||`/`&&` *without* parentheses is a syntax error.

**Q2. Does `import()` block the page?**

> No — it returns a promise (Lesson 24) and loads the module asynchronously, which is how
> routes code-split without stalling the initial bundle.

**Q3. What is a `for await...of`?**

> The async version of `for...of` — it awaits each value from an async generator (or any
> async iterable), one stream item per iteration.

## 12. Code Example: An ID Generator

```js {2-4}
function* uniqueIds() {
  let id = 0;
  while (true) yield `id-${++id}`;
}

const nextId = uniqueIds();
console.log(nextId.next().value);
console.log(nextId.next().value);
```

Output:

```text
id-1
id-2
```

```narrate
line: the loop never ends — but nothing runs until next() pulls a value
line: each yield hands one ID back and pauses; the next next() resumes the loop
line: that's laziness: an infinite sequence with zero upfront cost
```

## 13. Performance Notes

- **When it matters:** modules — static imports enable tree-shaking and code splitting,
  which is real bundle-size money. Generators are the lazy option for huge or infinite
  sequences — they don't allocate the whole collection upfront.
- **When it doesn't:** `?.` and `??` cost a check per link, negligible at any realistic
  depth; `||` isn't meaningfully faster.
- A generator's per-`next()` overhead is small but not free — for a million-item loop, a
  plain array beats a generator that yields a million times.

## 14. Debugging Scenarios

| Symptom | Likely cause |
|---|---|
| `Cannot read properties of undefined` | Forgot `?.` on a chain (or the `?.` is too early/late) |
| Defaults never apply | Used `||` where `??` was needed — a valid `0`/`''` was replaced |
| `SyntaxError: Unexpected token '?'` | `?.`/`??` in an old runtime, or `??` mixed with `||`/`&&` unparenthesised |
| `SyntaxError: Unexpected token 'export'` | Running ESM syntax as CommonJS — needs a `.mjs`/`"type": "module"` context |
| Generator body never runs | Called the generator but never `next()`'d or iterated it |

## 15. Quick Revision Notes

- **Modules**: named imports must match names; defaults can be renamed; `import()` is dynamic
- **`?.`**: guards its left side — `null`/`undefined` short-circuits the rest to `undefined`
- **`??`**: fallback for *missing* values only; `||` also replaces `0`, `''`, `false`
- **Generators**: `function*` + `yield`; `next()` → `{value, done}`; lazy, resumable
- `for...of` consumes generators; `for await...of` consumes async generators
- `?.` + `??` pair naturally: `user?.name ?? 'guest'`

## 16. Cheat Sheet

```js
// modules
import log, { double, PI } from './math.js';   // default + named in one line
const chart = await import('./chart.js');       // dynamic, promise-based

// optional chaining + nullish coalescing
const theme = user?.settings?.theme ?? 'dark';

// generators
function* ids() {
  let n = 0;
  while (true) yield ++n;
}
for (const id of ids()) { … break when done … }

async function* stream() {
  yield await fetchPage(1);
  yield await fetchPage(2);
}
for await (const page of stream()) { … }
```

## 17. Key Takeaways

> [!RECAP]
> - **ES modules**: static `import`/`export`; defaults are renameable, named exports must
>   match; dynamic `import()` returns a promise (Lesson 24)
> - **Optional chaining** `?.` returns `undefined` instead of throwing when a link is missing
> - **Nullish coalescing** `??` falls back only on `null`/`undefined` — unlike `||`'s falsy test
> - **Generators** pause at `yield` and resume on `next()` — lazy, infinite-safe iteration
> - `for...of` / `for await...of` consume generators without manual `next()` calls
> - This vocabulary is the difference between reading modern code fast and decoding it

## Check your understanding

Answer these without looking back.

1. Named vs default exports — when do you need braces, and when can you rename?
2. When is `import()` used instead of a static `import`?
3. `const n = 0; n ?? 5` vs `n || 5` — different results? Explain why.
4. Trace `user?.profile?.address?.city` when `address` is `null` — what happens at each `?.`?
5. What does `it.next()` return, and when is `done` true?
6. Why does an infinite `while (true)` in a generator not hang the program?

## What's Next

**Lesson 29 — Why TypeScript?** The answer is not "fewer bugs". It is a faster feedback
loop and safer refactors — the payoff for the JavaScript fluency you just built across
Lessons 21–28.
