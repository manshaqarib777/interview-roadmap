# Lesson 61 — useMemo

**Interview importance:** ⭐⭐⭐⭐⭐ — half of "difference between useMemo and useCallback", one of the top-five React questions.

`useMemo` caches a value so that a re-render *reuses* the previous computation when the
dependencies haven't changed. It's the React-flavoured memoization from Lesson 17 — with the
same two promises: skip work, and keep reference equality. The honest interview answer
starts with "usually you should not need it", and the senior answer knows when it is
genuinely worth it.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `useMemo` caches and when the cache is used again
- Give the two real reasons to use it: expensive work and reference equality
- Explain how dependency arrays and reference equality (Lesson 6 / Lesson 58) make or break it
- Connect it to the memoization from Lesson 17
- Say when it is premature optimisation and how to prove it

## 1. One-line definition

**`useMemo` caches a computed value between renders, recomputing only when its dependencies change — saving work and stabilising references.**

## 2. Mental model

Picture a kitchen prep list. On every render you write a fresh list and cook it fresh — the
ingredients are the same (dependencies), so most renders just remake the same thing. `useMemo`
is a sticky note on the fridge: *if the ingredients are unchanged, reuse yesterday's dish.*
Change one ingredient, and you cook again.

Plain computation:

```js
const items = [{ price: 10 }, { price: 20 }];

const total = items.reduce((sum, it) => sum + it.price, 0);  // new every render

console.log(total);
```

Output:

```text
30
```

Memoized:

```jsx
const total = useMemo(
  () => items.reduce((sum, it) => sum + it.price, 0),
  [items],                                                    // reused if items is the same
);
```

Same computation, two lifetimes: one re-runs on every render, one re-runs only when `items`
actually changes.

## 3. Visual flow

```text
                render 1          render 2          render 3
deps: items     [A]               [A] (same ref)    [B]
computed:       {total: 120}      ──REUSED──▶ {total: 120}   recompute → {total: 210}
                computed here     no computation   computed here
```

The key row is render 2: `items` is reference-equal to render 1's array (Lesson 6), so the
memo returns the stored value without running the function.

## 4. How it works

A value is computed on first render and stored. On each later render React compares the
dependencies — with `Object.is` (Lesson 6 / Lesson 58) — and if they're all equal, returns
the stored value. If any differ, the factory runs again and the new result replaces the old.

That one mechanism gives you two benefits, which is why "just cache it" is a confused
answer:

| Benefit | The thing you're buying |
|---|---|
| **Skipping work** | the factory doesn't run when deps are unchanged |
| **Reference equality** | the same object is returned, so children and effects see a stable identity |

The second benefit is the one people miss. Even when computation is free, `useMemo` gives
you a stable reference — which is what `memo`ized children (Lesson 67) and effect
dependencies actually depend on. A faithful mental model:

```js
// the cache lives in the fiber, not a global
let cachedValue;
let cachedDeps;

function useMemo(factory, deps) {
  const same =
    cachedDeps &&
    deps.length === cachedDeps.length &&
    deps.every((d, i) => Object.is(d, cachedDeps[i]));
  if (!same) {
    cachedDeps = deps;
    cachedValue = factory();
  }
  return cachedValue;
}

let runs = 0;
const total = useMemo(() => { runs += 1; return 40 + 2; }, [40]);
const again = useMemo(() => { runs += 1; return 40 + 2; }, [40]); // same dep → reuse

console.log(total, again);
console.log('factory runs:', runs);
```

Output:

```text
42 42
factory runs: 1
```

A cache is only as good as its key. New dependencies every render (an inline object or array,
a fresh callback) defeat the cache — the key changed, so everything recomputes. The dep array
must hold *stable* references.

## 5. Real project usage

| Where it genuinely helps | Why |
|---|---|
| Derived data over a large collection | `filter`/`sort`/`groupBy` over thousands of rows re-runs on every render |
| Mapping API data to view models | same data, rebuilt shape — pure waste |
| Stable object for `memo` children | a fresh object every render defeats `React.memo` (Lesson 67) |
| Stable object for effect deps | keeps `useEffect` from re-firing (Lesson 58) |
| Sharing a computation across consumers | build the derived value once, read it in several spots |

The canonical example — sorting a large list, then rendering it:

```jsx
function SortedList({ items, sortKey }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a[sortKey].localeCompare(b[sortKey])),
    [items, sortKey],
  );

  return <ul>{sorted.map((it) => <li key={it.id}>{it.name}</li>)}</ul>;
}
```

```narrate
1: Items and sort key flow in from props.
2: The memo depends on both — change either and it recomputes.
3: Spread first, so the original array is never mutated (Lesson 14).
7: Re-renders with unchanged deps skip the sort entirely.
```

```text
render with items=[B,A] sortKey='name'  → sorted = [A,B]   (computed)
re-render, same items/sortKey           → sorted = [A,B]   (REUSED — no sort)
render with items=[C,B,A]               → sorted = [A,B,C] (computed)
```

## 6. Interview explanation

> `useMemo` caches a value between renders and recomputes it only when its dependencies
> change. I use it for two reasons: genuinely expensive derived computation — sorting or
> filtering a large list — and reference equality, when I need the same object across
> renders so a memoized child or an effect doesn't see a new identity every time. But I
> don't wrap everything in it. Most computation is cheap, and `useMemo` itself costs
> memory and comparison; I add it when something is actually slow or when a child's
> memoization is being defeated.

## 7. Senior-level insights

- **Say "expensive computation OR reference stability" — never just "caching".** That split
  is the whole concept, and most candidates only know the first half.
- **Measure first.** Before adding `useMemo`, ask: is the render slow? Profile it. If the
  computation takes microseconds, the memo is overhead (Lesson 71 — when NOT to optimize).
- **Recognise when the memo is useless.** If deps are new references every render — an
  inline object, a fresh function — the memo recomputes every time anyway. It becomes dead
  weight and a reader trap.
- **The `React.memo` partnership.** `useMemo` returning a stable object is what makes a
  `memo`ized child actually skip re-rendering. They're two halves of one system (Lessons 62,
  67).
- **Deps must be primitive values or stable references.** Deriving a dep with `Object.is`
  is precisely what decides whether the cache hits or misses.
- **`useMemo` is a hint, not a guarantee.** React may discard and recompute; it's an
  optimisation, so correctness can never depend on it.

> [!DEEPDIVE]
> The compiler is coming for this hook. The React Compiler auto-memoizes values and
> components — hand-written `useMemo` and `useCallback` become redundant in compiler-enabled
> codebases. In interviews, "the future is the compiler" is a strong closing note; in
> day-to-day code you still write the hooks yourself.

## 8. Common mistakes

- **Wrapping cheap work** — the memo costs more than the computation:

```jsx
const doubled = useMemo(() => x * 2, [x]);
```

- **Defeating the cache** — deps change on every render, so it recomputes every time. An
  inline array or object in the dep array does exactly this:

```jsx
const sorted = useMemo(() => [...items].sort(), [items]);
return <SortedList data={sorted} />;
```

- **Mutating the memoized value** — the cache now holds a corrupted object:

```jsx
const config = useMemo(() => ({ theme: 'dark' }), []);
config.theme = 'light';     // next render "reuses" a mutated cache
```

- **Missing dependencies** — the factory closes over something not listed, so it goes stale
  and the linter complains:

```jsx
const total = useMemo(
  () => items.filter((i) => i.active).reduce((s, i) => s + i.price, 0),
  [],                       // items changes → stale total, and lint is angry
);
```

- **Using it for "state that changes"** — a memo is not a cache that updates itself:

```jsx
const now = useMemo(() => Date.now(), []);   // frozen forever
```

> [!PITFALL]
> `useMemo` is not a cache to *store* things in; it is a cache to *avoid recomputing*
> things. If the value would be recomputed from state anyway, but your UI shows a stale
> version of it, that's not a memo problem — that's derived state you should render
> directly (Lesson 55).

## 9. Best practices

✅ Memoize when the computation is measurably expensive or runs over large data

✅ Memoize when you need a **stable reference** for a `memo` child or an effect dep

✅ Keep the factory pure and dependency arrays complete — no missing, no extra entries

✅ Treat the cached value as read-only — never mutate it

❌ Don't wrap trivial arithmetic or JSX — that's premature optimisation (Lesson 71)

❌ Don't memoize values whose deps are fresh references every render — it silently does nothing

## 10. Interview questions

**Q1. What does `useMemo` do?**

> It caches the result of a function between renders and only recomputes it when the
> dependencies change. I use it for two distinct things: skipping expensive computation —
> sorting or filtering a large collection — and keeping reference equality, so a memoized
> child or an effect sees the same object across renders.

**Q2. What is the difference between `useMemo` and `useCallback`?**

> One caches a *value* — `useMemo(() => value, deps)`. The other caches a *function* —
> `useCallback(fn, deps)`. And `useCallback(fn, deps)` is really `useMemo(() => fn, deps)`
> — the function is the value. Function identity is just reference equality applied to
> functions.

**Q3. When should you actually use `useMemo`?**

> When the computation is genuinely expensive and runs on every render, or when I need a
> stable reference so a memoized child doesn't re-render and an effect doesn't re-fire.
> Otherwise I don't use it — most computation is cheap and the memo costs more than it
> saves.

**Q4. How does `useMemo` relate to memoization (Lesson 17)?**

> Same idea: cache results keyed by arguments, return the cached value on a hit. The React
> version keys on the dependency array and lives per component instance, whereas a plain
> memoized function like `_.memoize` caches globally and never invalidates. `useMemo`'s
> cache is also a hint — React can drop it — so I never depend on it for correctness.

**Q5. Why does a memoized value change when nothing "changed"?**

> Dependencies are compared with reference equality, not deep equality (Lesson 6). If a dep
> is a new object with identical contents, the memo sees a change and recomputes. The fix
> is stable references upstream — memoizing the parent's object, or lifting it out of the
> component.

**Senior follow-up: When does `useMemo` NOT help performance?**

> When the dependencies are fresh references every render, the cache misses every time and
> you're paying the memo's bookkeeping for nothing. Also when the work itself is cheap —
> a few operations — the comparison and storage cost more than recomputation. And it never
> helps if the bottleneck is the render itself: a component that renders a huge tree is slow
> regardless of how cheap its derived values are. That's when you need `React.memo`, code
> splitting or virtualization, not `useMemo`.

## 11. Follow-up questions

**What happens if you call `useMemo` without a dependency array?**

> It recomputes on every render — equivalent to not memoizing at all. With an empty array
> it computes once and never again, which is correct only for truly constant values.

**Can you depend on a `useMemo` result in another `useMemo`?**

> Yes, and it works well: the inner memo gives the outer a stable reference, so the outer
> cache hits. Just be sure each dependency array is complete.

**Why is mutating a memoized value dangerous?**

> The cache holds one object; mutating it corrupts the cached value for every future render.
> The next "cache hit" returns your modified object, and memoized children may not notice.
> Treat memoized values as immutable.

**Is `useMemo` a performance guarantee?**

> No — it's a hint. React is allowed to recompute or discard the cache. That's why
> correctness must never depend on it; it only changes how much work a render does.

## 12. Comparison table

| | `useMemo` | `useCallback` | plain variable |
|---|---|---|---|
| Caches | a value | a function | — |
| Recomputes when | deps change | deps change | every render |
| Stable reference across renders | ✅ | ✅ | ❌ |
| Typical job | expensive derived data | stable callback for `memo`/effects | everything else |
| Equivalent form | — | `useMemo(() => fn, deps)` | — |

## 13. Code example

Computing a total over a changing filter — watch the cache hit count:

```jsx
function Cart({ items, discount }) {
  const [log, setLog] = useState([]);
  const total = useMemo(() => {
    const base = items.reduce((sum, it) => sum + it.price, 0);
    setLog((l) => [...l, `computed: ${base}`]);   // for counting, not for real code
    return base * (1 - discount);
  }, [items, discount]);

  return (
    <div>
      <p>Total: ${total.toFixed(2)}</p>
      <ul>{log.map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
  );
}
```

```text
initial render                    → computed: 100
parent re-renders, items same     → (no new entry — memo reused)
parent re-renders, discount changes → computed: 95
```

`discount` is a primitive, so it compares cleanly; `items` must be reference-stable for the
middle render to skip — an inline `items` array would defeat the memo (Lesson 6).

## 14. Performance notes

- The memo helps only when **work is expensive** or **a stable reference matters**. Both
  are rare; most memoization in the wild is premature.
- Each memo costs memory (stored value + dependency list) and a per-render comparison —
  small, but real.
- The worst case is a *miss every render*: a memo whose deps are fresh references pays full
  computation **plus** bookkeeping, then triggers cascading re-renders downstream.
- When it matters, it matters a lot: a `sort` over 10,000 rows on a 60fps slider is exactly
  the lag users feel.
- Pair with `React.memo` (Lesson 67): memoized children skip work only when they receive
  stable props, and stable props come from `useMemo` and `useCallback` (Lesson 62).

## 15. Debugging scenarios

| Symptom | Likely cause |
|---|---|
| Memo recomputes every render | A dep is a new reference each render — inline object/array, or a fresh function (Lesson 6) |
| Memoized child still re-renders | The memo's output is a new reference, or the child isn't wrapped in `memo` (Lesson 67) |
| Effect fires on every render despite memo | An un-memoized value in the dep array — memoize it or lift it out |
| Stale value shown | Missing dep — the factory closes over something not listed. Run the linter with `exhaustive-deps` |
| Value changes "on its own" | A previous render mutated the memoized object |

## 16. Quick revision notes

- `useMemo` caches a value; recomputes only when deps change (`Object.is` comparison)
- Two reasons to use it: **expensive computation**, **reference equality**
- Fresh-reference deps defeat the cache — memo is dead weight then
- `useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)`
- It's a hint, not a guarantee — correctness never depends on it
- Lesson 17 memoization, rendered per component instance and keyed by deps

## 17. Cheat sheet

```jsx
const sorted = useMemo(
  () => expensive(items, sortKey),
  [items, sortKey],             // stable refs or primitives only
);

const stableConfig = useMemo(() => ({ theme: 'dark' }), []);  // stable reference

// never: mutate the result, inline-object deps, trivial work, missing deps
```

## 18. Key takeaways

> [!RECAP]
> - `useMemo` caches a computed value between renders, keyed by its dependency array
> - Two reasons to reach for it: expensive computation and stable references — not "caching" in general
> - Deps compare by reference equality (Lesson 6 / Lesson 58), so fresh references defeat the cache
> - Same idea as Lesson 17's memoization, but per component instance and evictable
> - Most uses are premature optimisation; measure first (Lesson 71)
> - It's the value half of "useMemo vs useCallback" — the function half is Lesson 62

## Check your understanding

Answer these without looking back.

1. What exactly does `useMemo` cache, and when is the cache used again?
2. Give the two legitimate reasons to use it — with a concrete example each.
3. Why does a memo whose dependency is a fresh inline object recompute every render?
4. How is `useMemo` related to the memoization from Lesson 17?
5. Why can the same memo produce a stable reference but a different value — and when does that matter for `memo` children and effects?
6. When is adding `useMemo` actively harmful rather than neutral?
7. What should you never do to a memoized value, and why?

## What's Next

**Lesson 62 — useCallback.** The other half of the most-asked React pairing: stable function
identity, and why the honest answer is "usually you should not use it".
