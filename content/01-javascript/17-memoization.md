# Lesson 17 — Memoization

**Interview importance:** ⭐⭐⭐ — implement it from scratch, then explain how `useMemo`
differs. Frequent pairing.

A pure function returns the same answer for the same input — so why compute it twice?
Memoization is the answer to that question, and it's the hidden engine behind almost every
"fast" React page you've shipped.

## Learning Objectives

By the end of this lesson you should be able to:

- Implement `memoize` from scratch with `Map`, without looking it up
- Explain the trade-offs: what memoization can and cannot cache
- Say precisely how `useMemo` and `React.memo` differ from a hand-rolled cache
- Diagnose when a memoized function looks broken because of stale data

## 1. One-line Definition

**Memoization stores the result of a function call keyed by its arguments, and returns the
stored value instead of recomputing.**

```js
const memoize = (fn) => {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
};

let calls = 0;
const double = memoize((n) => { calls += 1; return n * 2; });

double(4); double(4); double(4);
console.log(double(4), 'calls:', calls);
```

Output:

```text
8 calls: 1
```

Three calls, one computation. That's the entire mechanism.

## 2. Mental Model

**Memoization is a cheat sheet.** The first time you see `f(4)` you do the work and write
the answer down. The second time you skip the work and read the note.

```text
f(4):  not in cache → compute → store → 8
f(4):  in cache     → return 8 (no compute)
f(5):  not in cache → compute → store → 10
```

The cache *is* the memo — a `Map` from input to output that lives inside a closure (Lesson 5)
so nothing outside can see or corrupt it.

## 3. Visual Flow

```text
        memoize(fn)
   ┌───────────────────────────────────┐
   │   cache = Map {}   ← private      │
   │                                   │
   │   f(4) → in cache?  no            │
   │        → result = fn(4)  = 8      │
   │        → cache.set(4, 8)          │
   │        → return 8                 │
   │                                   │
   │   f(4) → in cache?  YES → return 8  (fn never runs)
   └───────────────────────────────────┘
```

Same input, same lookup path. The pure function (Lesson 14) runs only on the misses.

## 4. How It Works

The classic implementation, with a `Map` keyed by argument:

```js
const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const slowSquare = memoize((n) => {
  console.log('computing', n);
  return n * n;
});

console.log(slowSquare(9));
console.log(slowSquare(9));
console.log(slowSquare(10));
```

Output:

```text
computing 9
81
81
computing 10
100
```

`computing 9` prints once. The second `slowSquare(9)` is a cache hit, so the body never runs.

> [!NOTE]
> The single-argument shortcut keeps primitive keys exact. For multiple arguments, stringify
> for a stable key. Real libraries like `lodash.memoize` accept a `resolver` function instead
> — you supply the key logic, the wrapper supplies the cache.

```narrate
line 2: the cache is private — a closure variable, not a global
line 4: build a key from the arguments
line 5: hit? return the stored result without calling fn
line 8: miss? compute once, store, and return
```

## 5. Real Project Usage

| Where | What gets memoized |
|---|---|
| React `useMemo` | Expensive derived values inside a render |
| `React.memo` | Whole components — skips re-render when props are equal |
| Redux selectors | Derived state recomputed only when inputs change |
| Server caches | Query results keyed by request parameters |
| Fibonacci / DP | Classic interview demonstration of exponential → linear |
| `fetch` wrappers | Repeated identical requests answered from memory |

## 6. Interview Explanation

> Memoization caches a function's results by its arguments, so repeated calls with the same
> input skip the computation. It works only for pure functions, and the key has to be a
> stable representation of the input — primitives work directly, objects need a stringified
> or resolved key.
>
> React's `useMemo` is the same idea, but the cache is thrown away every render and keyed by
> the dependency array rather than by the arguments.

## 7. Senior-Level Insights

- **"Pure functions only" isn't ceremony — it's correctness.** If the function reads
  non-deterministic state (the clock, a counter, a global), caching a stale result is a bug
  you shipped. Name this unprompted and you sound like you've been burned by it.
- **Reference equality is the React story.** `useMemo` keys on the dependency array, and
  arrays/objects compare by reference (Lesson 6), so a "same" input that is a *new* object
  always misses. This is why `useMemo` deps are compared by `Object.is`.
- **Memory is the real cost.** An unbounded cache can hold onto data forever. A senior
  answer mentions size limits, LRU eviction, or a `cache.clear()` for long-lived caches.
- **Memoization doesn't speed up first calls** — it converts repeated work into a lookup and
  pays memory for it. The trade is worth it exactly when the recomputation is expensive and
  the inputs repeat.

## 8. Common Mistakes

**Mistake 1 — caching a non-pure function.**

```js
let now = () => Date.now();
// a memoized "now" returns the FIRST call's timestamp forever
```

**Mistake 2 — object arguments without a key.**

```js
const memoize = (fn) => {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);   // Map keys objects by REFERENCE
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
};

const f = memoize((o) => o.total * 2);

console.log(f({ total: 5 }));
console.log(f({ total: 5 }));    // SAME data, DIFFERENT object → miss
```

Output:

```text
10
10
```

Both calls printed the same number — but only because the computation was trivial. The
second `{ total: 5 }` is a **different object**, so `cache.has` said "no" and recomputed.
With an expensive body, that's a silent performance leak. Stringify the key or pass a
resolver.

**Mistake 3 — expecting `useMemo` to cache across renders.** Its cache lives for one render
and is rebuilt every time; it's not a persistent memo. (More below.)

**Mistake 4 — memoizing what should never be memoized:** random values, timestamps, anything
reading user input that changes identity. If the answer can change without the key changing,
you've stored a lie.

## 9. Best Practices

✅ Memoize **pure functions** with stable, repeatable outputs

✅ Use `Map` for the cache — `Map.has`/`Map.get` handle any key type exactly

✅ Key by value, not by object reference, when callers may pass fresh objects

✅ Bound the cache (clear it, or evict) when entries live long or grow large

✅ In React, memoize derived data (`useMemo`) and components (`React.memo`) — not everything

❌ Don't memoize timestamps, randomness, or anything side-effectful

❌ Don't cache objects/arrays if callers expect fresh references — the same reference coming
back out is a mutation trap

## 10. Interview Questions

**Q1. What is memoization?**

> Storing a function's results keyed by its arguments, so identical calls are answered from
> the cache instead of recomputed. It turns repeated work into a hash lookup.

**Q2. Why does it require pure functions?**

> Because the cache assumes the same input always produces the same output. If the function
> reads mutable or non-deterministic state, a stored result becomes stale — the memo is
> lying about the current answer.

**Q3. Implement `memoize`.**

> A closure holding a `Map`. Single-argument primitives key directly; multi-argument calls
> stringify the arguments (or use a resolver) to build the key:

```js
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
```

**Senior follow-up: How is `useMemo` different?**

> `useMemo(fn, deps)` caches for a single render and invalidates when the dependency array
> changes — it's a render-scoped memo, not a persistent one. `React.memo` is different again:
> it's a whole component that skips re-rendering when props are shallowly equal. Hand-rolled
> memoization is a cache that lives for the lifetime of the closure.

**Senior follow-up: What can go wrong with object keys?**

> Two objects with identical contents are still different `Map` keys, so the cache misses and
> recomputes. If the caller passes fresh objects every time, the cache never helps — stringify
> the key or accept a resolver. And because keys are held by reference, the cache also keeps
> the objects alive, which matters if they're large.

## 11. Follow-up Questions

**What's the downside of memoization?**

> Memory. Every stored result is a retained object, and keys are retained too. An unbounded
> cache can grow without limit — the answer is eviction or a bounded size.

**How would you memoize a multi-argument function?**

> Build a composite key — `JSON.stringify(args)`, or join the arguments with a delimiter, or
> let the caller supply a resolver that returns a stable key for any argument list.

**When is memoization useless?**

> When inputs rarely repeat, when the computation is already cheap, or when the function
> isn't pure. In those cases you pay cache overhead for no gain.

## 12. Comparison Table

| | Hand-rolled `memoize` | `useMemo` | `React.memo` |
|---|---|---|---|
| What is cached | A function's return value | A computed value | A rendered component |
| Key | Arguments (or resolver) | Dependency array | Props (shallow) |
| Cache lifetime | Lifetime of the closure | One render | Until props change |
| Use case | Repeated expensive calls | Derived data in renders | Skipping re-renders |
| Requires purity | ✅ | ✅ (inside render) | ✅ (component) |

## 13. Code Example

The classic demonstration — Fibonacci goes from exponential to linear. The helper from
section 4 is included so the block runs standalone:

```js
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

let plainCalls = 0;
let memoCalls = 0;

function fib(n) {
  plainCalls += 1;
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

const memoizedFib = memoize(function fibMemo(n) {
  memoCalls += 1;
  return n <= 1 ? n : memoizedFib(n - 1) + memoizedFib(n - 2);
});

console.log(fib(20), 'plain calls:', plainCalls);
console.log(memoizedFib(20), 'memoized calls:', memoCalls);
```

Output:

```text
6765 plain calls: 21891
6765 memoized calls: 21
```

21 calls versus 21,891 — each `n` computed once. The memoized version memoizes its *own*
recursive calls, which is why it collapses. (`21` is the count of distinct `n` values the
memoized body actually evaluates — the plain version re-evaluates the same `n` hundreds of
times.)

## 14. Performance Notes

- **Memoization matters when the computation is expensive and the inputs repeat** — parsing
  a large payload, deriving filtered lists, recursion with overlapping subproblems.
- **It doesn't help cheap or one-shot work**; the `Map` lookup costs more than the work it
  skips.
- **First call is always a miss.** If every input is unique, you've added cache overhead to
  the whole pipeline for nothing.
- **Reference-typed keys defeat the cache silently** — the code still returns the right
  answer, it just never hits. Profile, don't guess.

## 15. Debugging Scenarios

**Scenario 1 — "My memoized function returns stale data."**

The same `memoize` helper, self-contained so the block runs standalone:

```js
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

let n = 0;
const read = memoize(() => n);   // reads mutable state — not pure

console.log(read());             // 0 — first call, computed and stored
n = 42;
console.log(read());             // 0 — STALE: cached answer, `n` never re-read
```

Output:

```text
0
0
```

The first call cached the answer while `n` was `0`, and every later call returns that stored
value no matter how `n` changes. The function wasn't pure. Pass the changing value in as an
argument so it becomes part of the key.

**Scenario 2 — "The cache never hits; DevTools shows it growing forever."**

Fresh objects are arriving as keys. `new Map()` compares by reference, so structurally
identical inputs miss. Inspect the keys: if every call has a new object identity, stringify
the key or switch to a resolver-based memo.

**Scenario 3 — "Clearing doesn't clear."**

```js
const cache = new Map();
// a helper closes over this SAME cache for different functions
```

Two memoized functions sharing one cache can collide when keys overlap. Keep one `Map` per
memoized function, inside its own closure.

## 16. Quick Revision Notes

- Memoize = cache results by input; return cached value on repeat calls
- Only pure functions (Lesson 14) can be safely memoized
- `Map` keys primitives exactly; objects key by reference — stringify or resolve
- `useMemo` is render-scoped; `React.memo` is per-component; both are reference-sensitive
- First call is always a miss; the win is repeated inputs with expensive work
- Memory is the trade-off — bound or evict long-lived caches

## 17. Cheat Sheet

```text
memoize(fn)
  cache = Map
  key  = single arg  → args[0]
       = multiple    → JSON.stringify(args)
  hit  → cache.get(key)
  miss → cache.set(key, fn(...args))

useMemo(fn, deps)   → cache lives one render, keyed by deps (Object.is)
React.memo(Comp)    → skip re-render when props shallowly equal
fib memoized        → 21,891 calls → 21 calls (n=20)
```

## 18. Key Takeaways

> [!RECAP]
> - Memoization stores results keyed by arguments and skips recomputation on repeat calls
> - It's correct only for pure functions — caching side effects caches lies
> - The cache is a closure-held `Map` (Lesson 5); object keys compare by reference, so
>   identical-but-distinct objects always miss
> - `useMemo` caches for one render by dependency array; `React.memo` caches a component by props
> - The trade is memory for speed — bound the cache when it lives long
> - It shines on expensive, repeating work: Fibonacci drops from 21,891 calls to 21

## Check your understanding

Answer these without looking back.

1. Write `memoize` from memory, then explain what the closure is for.
2. Why is memoizing a non-pure function a correctness bug, not just a style question?
3. Why do two identical objects miss the cache when used as `Map` keys?
4. In one sentence each: `memoize` vs `useMemo` vs `React.memo`.
5. When does memoization make things worse?

## What's Next

**Lesson 18 — Debounce & Throttle.** The most-requested "implement this on a whiteboard"
function in frontend interviews — and the answer is timing, not caching.
