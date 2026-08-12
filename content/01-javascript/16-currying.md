# Lesson 16 — Currying & Partial Application

**Interview importance:** ⭐⭐⭐ — a common live-coding task, and the pattern behind
`connect()` and middleware.

Currying shows up disguised as everything else: every time you write a function that
*returns* a function, you're doing it. By the end of this lesson you'll be able to derive
curry from first principles on a whiteboard, and tell it apart from partial application.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the difference between currying and partial application without looking it up
- Write `curry()` from scratch and know the order-argument gotchas
- Recognise curried APIs (`connect()`, Express middleware, `fetch` wrappers) in the wild
- Say exactly when currying helps and when it's needless indirection

## 1. One-line Definition

**Currying turns a function that takes multiple arguments into a chain of functions that
each take one argument.**

```js
const add = (a, b, c) => a + b + c;

const curried = (a) => (b) => (c) => a + b + c;

console.log(add(1, 2, 3), curried(1)(2)(3));
```

Output:

```text
6 6
```

Same result, same math — different calling convention. That's the whole idea.

## 2. Mental Model

**A curried function is an assembly line.**

```text
curried(1)   →  worker that "knows" a = 1
curried(1)(2)  →  worker that "knows" a = 1, b = 2
curried(1)(2)(3) →  finished product: 6
```

Each call returns a partially-configured worker, and each worker captures the arguments that
already arrived. Currying is just closures (Lesson 5) applied to a calling convention.

## 3. Visual Flow

```text
      curried(1)(2)(3)
   ┌─────────────────────────────────────────────────┐
   │ (a) => (b) => (c) => a + b + c                 │
   │                                                 │
   │ curried(1)     → (b) => (c) => 1 + b + c   a captured
   │ curried(1)(2)  → (c) => 1 + 2 + c         a, b captured
   │ curried(1)(2)(3) → 1 + 2 + 3 = 6          done
   └─────────────────────────────────────────────────┘
```

Each step eats one argument and hands the rest to a new closure. No step touches the
arguments that haven't arrived yet.

## 4. How It Works

Every arrow layer creates a scope holding the arguments passed so far (the closure
mechanism from Lesson 5). The inner layers read the outer ones through the scope chain:

```js
const add3 = (a) => (b) => (c) => a + b + c;

console.log(add3(10)(20)(30));
```

Output:

```text
60
```

The generic `curry` wrapper — the classic live-coding answer:

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...more) => curried(...args, ...more);
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));
console.log(curriedAdd(1, 2)(3));
console.log(curriedAdd(1, 2, 3));
```

Output:

```text
6
6
6
```

`fn.length` is the number of declared parameters — that's how the wrapper knows when enough
arguments have arrived. Collect what comes in, and once the count reaches `fn.length`, call
the original. All three call shapes work.

```narrate
line 2: curried is the recursive wrapper — it holds the growing argument list
line 3: enough arguments? call the real function and stop
line 6: not enough — return a function that keeps collecting
line 14: one argument per call — the classic curried shape
```

## 5. Real Project Usage

The idea is everywhere once you can see it:

| API | Shape | The pattern |
|---|---|---|
| Redux `connect(mapState, mapDispatch)` | `connect(...)(Component)` | Configure, then apply |
| Express middleware | `(req, res, next) => …` | One factory per route stack |
| Loggers | `createLogger('info')(msg)` | Bind the level, reuse the rest |
| Request wrappers | `requestWith(baseUrl)(path)` | Fix the host, vary the path |
| React `useState` | `useState(0)` returns `[value, setValue]` | Configuring a value you'll change later |

`connect` is the most quoted example in interviews. It takes the pieces you configure once —
mapping functions, options — and returns a second function that you apply to each component:

```jsx
const withUser = connect((state) => ({ user: state.user }));
const UserCard = withUser(Profile);
```

## 6. Interview Explanation

> Currying turns `f(a, b, c)` into `f(a)(b)(c)` — each call returns a function waiting for
> the next argument. Partial application fixes some arguments ahead of time and leaves the
> rest, like `bind(null, 1, 2)`.
>
> I use it for configuration: build once with the fixed pieces, then apply to many targets —
> that's `connect()` and middleware.

## 7. Senior-Level Insights

- **Currying is a tool for *reuse with configuration*, not a performance trick.** The senior
  answer names when the pattern pays: one shared fixed input applied to many varying inputs.
- **Arity is the design decision.** Order arguments "data last" so partial application reads
  naturally: `map(fn)(list)` instead of `map(list)(fn)`. Most utility libraries order the
  fixed part first and the data last.
- **Currying never mutates or caches.** It's pure composition (Lesson 14) — the captured
  arguments are read-only, so the whole chain is safe to share.
- **Know the honest critique.** For one-off calls, curried syntax is slower and harder to
  read. It earns its keep in reusable, configured pipelines — not in a single `add` call.

## 8. Common Mistakes

**Mistake 1 — currying a fixed-arity function "works", but `fn.length` bites.**

```js
function addAll(...nums) {           // rest parameter
  return nums.reduce((t, n) => t + n, 0);
}

console.log(addAll.length);          // 0 — no declared params
```

Output:

```text
0
```

A rest parameter makes `length` zero, so a generic `curry` that relies on `fn.length` will
fire on the first call with whatever it got. Say it in an interview: *rest parameters break
arity-based currying*.

**Mistake 2 — confusing currying with partial application.**

```js
const add = (a, b) => a + b;
const with5 = add.bind(null, 5);      // partial application, not currying

console.log(with5(10));               // add(5, 10)
```

Output:

```text
15
```

`bind` fixes one argument and leaves the rest. Currying converts the function's shape —
each call accepts *exactly one* argument. Different mechanisms, related goals.

**Mistake 3 — calling a curried function with too many arguments at once** if you didn't
write the wrapper to tolerate it. The chain shape `(a) => (b) => …` drops extras silently.

## 9. Best Practices

✅ Order arguments configuration-first, data-last, so partial application reads naturally

✅ Use `curry(fn)` with a real arity check (`fn.length`) — never with rest-parameter functions

✅ Reach for the pattern when one fixed input is applied to many targets (middleware, `connect`)

✅ Keep curried chains short — two or three layers is plenty

❌ Don't curry for a single call site; the indirection isn't free to read

❌ Don't rely on `this` inside curried functions (the arrow layers drop it)

## 10. Interview Questions

**Q1. What is currying?**

> Converting a multi-argument function into a chain of single-argument functions. `f(a, b, c)`
> becomes `f(a)(b)(c)`, where each step returns a function waiting for the next argument.

**Q2. Currying vs partial application?**

> Currying changes the function's *shape* — it returns a function per argument. Partial
> application fixes some arguments and leaves the rest for later, like `bind(null, 1)`.
> A curried function can be partially applied naturally, but they aren't the same thing.

**Q3. Implement `curry`.**

> Recursively collect arguments until we have `fn.length` of them, then call the original:

```js
function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  };
}
```

> It relies on `fn.length`, which is why currying functions with default or rest parameters
> is unreliable.

**Senior follow-up: How is `connect()` currying?**

> `connect(mapState, mapDispatch)` returns a function, and you apply that function to a
> component: `connect(...)(Component)`. That's the configure-then-apply shape — the
> configuration is fixed once, then reused across many components.

**Senior follow-up: When would you *not* use currying?**

> For a one-off call it's slower and harder to read. I reach for it when the same fixed
> configuration is applied repeatedly — a middleware stack or a wrapped API client. Otherwise
> a plain function is the better tool.

## 11. Follow-up Questions

**Why does `fn.length` matter to a `curry` implementation?**

> It's the signal for "enough arguments". The wrapper compares the collected count against it
> and calls the original function once they match. `length` counts declared parameters and
> stops at the first default/rest parameter — so those functions can't be curried reliably.

**Can you partially apply without `bind`?**

> Yes — a closure (Lesson 5):

```js
const withBase = (base) => (n) => base + n;
const addTax = withBase(1.15);          // price * 1.15, base fixed
```

> The factory closes over `base`. `bind` does the same thing with `this` plus leading
> arguments; the closure does it without `this`.

## 12. Comparison Table

| | Currying | Partial Application |
|---|---|---|
| Changes function shape | ✅ `f(a,b,c)` → `f(a)(b)(c)` | ❌ keeps arity |
| Fixes some args | Individually, one per step | ✅ all at once |
| Primary tool | `curry()` | `fn.bind(null, …)` / closure |
| Example | `curriedAdd(1)(2)(3)` | `const double = n => n * 2` |
| Typical use | `connect()`, middleware | Configuration, wrappers |

## 13. Code Example

```js
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

const double = (n) => n * 2;
const square = (n) => n * n;

console.log(compose(square, double)(5));   // square(double(5))
```

Output:

```text
100
```

`compose` is the other half of the functional vocabulary — right-to-left, like math notation
`f ∘ g`. A curried `map` slots straight into it:

```js
const curriedMap = (fn) => (arr) => arr.map(fn);
const addTax = (n) => Math.round(n * 1.15);

console.log(curriedMap(addTax)([100, 200]));
```

Output:

```text
[ 115, 230 ]
```

## 14. Performance Notes

- **Currying is not an optimisation.** Each layer adds a closure allocation and a function
  call. The overhead is negligible per call — it only shows up in hot loops where the extra
  indirection compounds.
- **Where it pays is reuse, not speed.** The win is one configured function reused across a
  codebase, not faster execution.
- If you need speed and currying, **partially apply once, reuse the result** — don't
  re-curry inside the hot path. As always, measure before you "optimise".

## 15. Debugging Scenarios

**Scenario 1 — "It returned a function instead of the answer."**

The `curry` from section 4, self-contained so the block runs standalone:

```js
const add = (a, b, c) => a + b + c;
const curriedAdd = (a) => (b) => (c) => a + b + c;

console.log(curriedAdd(1, 2));   // fewer args than the chain needs
console.log(curriedAdd(1)(2));   // same — still waiting for (c)
```

Output:

```text
[Function (anonymous)]
[Function (anonymous)]
```

You passed fewer arguments than `fn.length`, so you got the collector back. Either keep
calling — `curriedAdd(1, 2)(3)` — or pass everything at once.

**Scenario 2 — `curriedAdd(1)(2)` returns `NaN`.**

```js
const add = (a, b, c = 0) => a + b + c;   // default param
console.log(add.length);                   // 2 — stops at the default
console.log(add(1, 2));                    // 3 — c fell back to its default
```

Output:

```text
2
3
```

The default parameter shrank `fn.length` to 2, so the wrapper fired early with only two
arguments. `c` was `undefined` at call time (here it fell back to the default `0`). Fix:
drop the default, or curry by an explicit arity instead of `fn.length`.

**Scenario 3 — a curried wrapper returns a function forever.**

```js
const addAll = (...nums) => nums.reduce((t, n) => t + n, 0);
```

`fn.length` is `0`, so the first call already has "enough" arguments and the recursion stops
immediately. Currying a variadic function needs a manual arity — this is a design problem,
not a bug in your code.

## 16. Quick Revision Notes

- Currying = `f(a)(b)(c)`; partial application = fixing arguments, leaving the rest
- A curried function is a chain of closures, each capturing the arguments so far
- `curry(fn)` collects until `args.length >= fn.length`, then calls `fn`
- `fn.length` counts declared params and stops at the first default/rest parameter
- Order arguments configuration-first, data-last
- `connect(...)(Component)` and Express middleware are curried-style APIs
- Currying is about reuse, not speed

## 17. Cheat Sheet

```text
curry(fn)          → curriedFn, applies once args.length >= fn.length
curry(add)(1)(2)(3)  === add(1, 2, 3)
partial            → fix some args now (bind / closure), call with the rest later
fn.length          → declared params, broken by defaults and rest
compose(...fns)    → right-to-left pipeline: compose(square, double)(5) === 100
```

## 18. Key Takeaways

> [!RECAP]
> - Currying converts a multi-argument function into a chain of single-argument functions
> - Each step is a closure capturing the arguments passed so far (Lesson 5)
> - Partial application fixes some arguments and leaves the rest — a different, related idea
> - `curry` hinges on `fn.length`, which default and rest parameters silently break
> - The pattern is configuration-then-application: `connect()`, middleware, loggers
> - It's a reuse tool, not a speed tool — reach for it when one config serves many targets

## Check your understanding

Answer these without looking back.

1. Distinguish currying from partial application in one sentence each.
2. Why is `fn.length` the natural arity signal — and when does it lie?
3. Walk through what `curried(1)(2)` returns and what it holds, in terms of closures.
4. How is Redux's `connect()` an example of currying?
5. What breaks if you curry a function with default parameters?

## What's Next

**Lesson 17 — Memoization.** Take a pure function, add a cache, and turn repeated work into
a hash lookup — then see how React's `useMemo` is the same idea wearing a hook.
