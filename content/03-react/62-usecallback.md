# Lesson 62 — useCallback

**Interview importance:** ⭐⭐⭐⭐⭐ — the other half of "useMemo vs useCallback", a top-five React question.

`useCallback` returns a function that stays the **same identity** between renders as long as
its dependencies don't change. It is `useMemo` applied to a function — one mechanism, two
spellings. And the honest answer, the one that marks you as senior, starts with "usually you
should not use it": a fresh function per render is cheap, and the problems it creates only
exist once something is memoized (Lesson 61) or an effect depends on it (Lesson 58).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why every render creates a new function identity, even when the body is identical
- State the `useMemo` / `useCallback` symmetry precisely
- Say when `useCallback` genuinely helps: memoized children and effect dependencies
- Give the counter-example: when wrapping in `useCallback` does nothing or hurts
- Deliver the honest answer — "usually you should not use it" — and justify it

## 1. One-line definition

**`useCallback` keeps a function's identity stable between renders, recreating it only when its dependencies change — so memoized children and effects stop seeing a "new" function every render.**

## 2. Mental model

Every render is a fresh batch of functions: same code, brand-new identity. Handing a memoized
child a fresh function each time is like handing a doorman a new photo of the same person
every minute — he re-checks the face every time because the photo looks new.

`useCallback` says: *same photo, same person — don't re-check.* The function body may be
identical, but the memoized child only cares about identity (reference equality, Lesson 6).
Keep the identity stable and the memoized child skips re-rendering.

## 3. Visual flow

```text
                render 1            render 2 (same deps)      render 3 (deps changed)
plain fn:       fn#1 ──────────▶    fn#2  (new identity) ──▶  fn#3
useCallback:    fn#1 ──────────▶    fn#1  (REUSED) ───────▶   fn#2
```

With `useCallback` the middle render hands the *same* function to children and effects —
they see no change, so they do no work.

## 4. How it works

`useCallback(fn, deps)` stores `fn` and returns it until a dependency changes; then the new
`fn` replaces the old. `useMemo` does exactly the same for a value — and a function is a
value. The equivalence is exact:

```js
// simplified — the real useMemo keys on deps (Lesson 61)
function useMemo(factory, deps) {
  return factory();
}

// useCallback IS useMemo with the function as the value
function useCallback(fn, deps) {
  return useMemo(() => fn, deps);
}

const fn = () => 'hi';
const stable = useCallback(fn, []);

console.log(stable === fn);
```

Output:

```text
true
```

Both are reference equality applied to a factory output (Lesson 61). The deps are compared
with `Object.is` (Lesson 6 / Lesson 58), so stable deps → stable function identity.

Why does identity matter at all? Every render creates a new function:

```js
function greet(name) {
  return `hi ${name}`;
}

const a = greet;
const b = greet;
console.log(a === b);         // true — SAME function, declared once

function makeGreeter() {
  return (name) => `hi ${name}`;  // new function every call
}

const c = makeGreeter();
const d = makeGreeter();
console.log(c === d);         // false — identical code, different identity
```

Output:

```text
true
false
```

A component body is a `makeGreeter`: every render re-executes it, so every inline function
is new. `useCallback` is the way to hand back the old one when nothing it closes over changed.

> [!TIP]
> `useCallback` preserves the *identity* of the function — never its freshness. If the
> callback reads a value that changes, either list it in the deps (recreating the function)
> or read through a ref (Lesson 60) so a long-lived callback still sees current data.

## 5. Real project usage

| Pattern | Why the callback needs to be stable |
|---|---|
| Callback prop to a `memo` child | a fresh function would re-render the child every time (Lesson 67) |
| Callback in an effect's deps | a fresh function would re-fire the effect every render (Lesson 58) |
| Callback passed to a hook with its own deps | `useEffect`, `useMemo` and friends all compare identity |
| Callback in context value | a new function re-renders every consumer (Lesson 63) |

The canonical example — a memoized child that must not re-render:

```jsx
const ExpensiveList = memo(function ExpensiveList({ onSelect }) {
  // … heavy rendering, and re-rendering it is the thing we're avoiding
  return <ul>{/* rows */}</ul>;
});

function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback(
    (id) => setSelected(id),      // stable while deps don't change
    [],
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveList onSelect={handleSelect} />
    </>
  );
}
```

```text
typing in the input         → App re-renders; ExpensiveList does NOT (stable handleSelect)
selecting a row             → setSelected; ExpensiveList re-renders (new selected)
```

Without `useCallback`, every keystroke creates a new `handleSelect`, so the memoized list
re-renders too — the memoization (Lesson 67) would be silently defeated. This is the one
place `useCallback` is worth writing.

## 6. Interview explanation

> Every render creates a new function identity, even when the body is identical.
> `useCallback` freezes that identity until its dependencies change. I use it when a stable
> identity actually matters: passing a callback to a `memo`ized child, or into an effect's
> dependency array, so the child doesn't re-render and the effect doesn't re-fire on every
> render. But usually I don't use it — a new function per render is cheap, and wrapping
> everything adds bookkeeping without changing behaviour. I add it when something memoized
> is being defeated, not pre-emptively.

## 7. Senior-level insights

- **Lead with "usually you should not use it."** The honest answer is what separates senior
  from junior — juniors wrap everything, seniors know a fresh function costs almost nothing.
- **Name the symmetry.** `useCallback(fn, deps)` is `useMemo(() => fn, deps)`. One
  mechanism, two spellings. Say that and the interviewer stops probing.
- **Know the failure mode.** The *reason* to use it is not the callback itself — it's the
  memoized child (Lesson 67) or the effect (Lesson 58) on the receiving end. If nothing
  downstream compares identity, `useCallback` changes nothing.
- **Reference all three dependencies.** It needs a memoized child *or* an effect dep; the
  memoized child needs a stable callback (this lesson) *and* stable data (Lesson 61).
- **The future is the compiler.** The React Compiler inserts these calls automatically —
  hand-written `useCallback` and `useMemo` fade out. Know it so you're not caught defending
  a stale default.
- **Read state through deps or refs, not silence.** If the callback reads changing state,
  a stable function is stale. Recreate it (deps) or route reads through a ref (Lesson 60).

> [!DEEPDIVE]
> The classic failure: `useCallback` with **missing deps** inside a long-lived event
> listener. The listener holds the *original* function — which closed over the first
> render's state (Lesson 5). Even though the deps changed, nobody re-subscribed, so the
> listener keeps reading stale values. "Stable identity" only means *not new*; it never
> means *fresh*. If you need both, keep the latest value in a ref.

## 8. Common mistakes

- **Wrapping with nothing to protect** — no memoized child and no effect dep, pure overhead:

```jsx
const onClick = useCallback(() => setCount((c) => c + 1), []);
```

- **Stable but stale** — a "stable" callback that reads changing state without saying so:

```jsx
const handleClick = useCallback(() => {
  setSelected(item.id);       // depends on `item`, but the deps don't say so
}, []);
```

- **Deps that change every render** — the "stable" callback is new every time anyway:

```jsx
const handle = useCallback(() => doThing(value), [value]);
```

`useCallback` only pays off when the receiver is memoized or an effect depends on it; then
`value` goes in the deps honestly.

- **Performance by default** — re-renders still happen; only identity-sensitive receivers
  skip work. Wrapping everything buys nothing (Lesson 71).

> [!PITFALL]
> `React.memo` (Lesson 67) does a shallow comparison of props, and a callback is a prop.
> If the callback is new, the child re-renders — period. If the callback is stable but
> another prop is a fresh object, the child *still* re-renders. `useCallback` is one half;
> `useMemo` (Lesson 61) is the other.

## 9. Best practices

✅ Wrap a callback when it goes to a `memo`ized child or into an effect's deps

✅ Keep the dependency array complete — the function re-creates when they change, by design

✅ Route current values through refs (Lesson 60) when a callback must be both stable *and* fresh

✅ Prove a re-render problem exists before adding it

❌ Don't wrap every handler "to be safe" — that's overhead with no behaviour change (Lesson 71)

❌ Don't use a stable callback to smuggle stale state into long-lived listeners

## 10. Interview questions

**Q1. What is `useCallback`?**

> A hook that returns a memoized version of a function: same identity between renders while
> its dependencies don't change. It exists because every render otherwise creates a new
> function, and new identities defeat memoized children and re-fire effects.

**Q2. What is the difference between `useMemo` and `useCallback`?**

> `useMemo` caches a value; `useCallback` caches a function. But they're the same mechanism —
> `useCallback(fn, deps)` is `useMemo(() => fn, deps)`. The difference is only which one
> reads better for the thing you're caching.

**Q3. When should you use `useCallback`?**

> When a stable identity changes behaviour: a callback passed to a `memo`ized child, or a
> callback in an effect's dependency array. Without that, the child re-renders or the effect
> re-fires on every render. Outside those two cases — usually — I don't use it.

**Q4. Why is "usually you should not use it" the right default?**

> Because a new function per render is nearly free: one allocation, garbage-collected at the
> next render. The wrapper costs memory, a dependency comparison, and reader attention.
> Worse, wrapping everything gives a false sense of optimisation while the real cost — the
> render itself, or an un-memoized child — is untouched. I add it where it changes
> behaviour, not where it changes vibes.

**Q5. How do `useCallback` and `React.memo` work together?**

> `React.memo` skips re-rendering a child when its props are reference-equal to last time.
> A callback prop that's recreated every render breaks that — the child always sees a new
> prop. `useCallback` stabilises the callback, so the memoized child actually skips. The
> other props have to be stable too (via `useMemo`), or the skip still doesn't happen.

**Senior follow-up: Can a stable callback still be stale, and how do you fix it?**

> Yes — stability means the *identity* didn't change, not that the values it reads are
> current. A callback created with a dep array captures those deps at creation time; if a
> long-lived listener holds it, it keeps reading old state (Lesson 5). Two fixes: put the
> changing values in the deps and re-subscribe, or read them through a ref (`latestRef.current`)
> so the stable function always sees the newest value (Lesson 60). Which one depends on
> whether recreating the callback is acceptable.

## 11. Follow-up questions

**What is function identity, exactly?**

> Each time a function is created it gets a distinct identity — like a serial number. Two
> separately-created functions are never equal, even with identical code and behaviour.
> Reference equality (`===`) is the check, from Lesson 6.

**When does `useCallback` add nothing?**

> Whenever the callback isn't consumed by something that compares identity — a plain
> `<button onClick={fn}>` re-renders its subtree regardless, because the element was
> re-created. No memoized child, no effect dep, no context consumer? The wrapper is inert.

**How does the React Compiler change this?**

> The compiler auto-memoizes values and functions, so hand-written `useCallback` and
> `useMemo` become redundant — same guarantee, zero annotations. Teams adopting it delete
> most of their manual memoization.

**Can `useCallback` deps be a ref?**

> Only as a value that never changes — refs are stable, so listing one adds nothing (Lesson 60).
> The pattern you actually want is *reading* `ref.current` inside the callback while keeping
> deps as-is: stable identity, fresh data.

## 12. Comparison table

| | `useCallback` | `useMemo` | inline function |
|---|---|---|---|
| Caches | a function | any value | — |
| Recreated when | deps change | deps change | every render |
| Stable identity | ✅ | ✅ (for the cached value) | ❌ |
| Common job | stable callback for `memo`/effects | stable expensive derived data | everything else |
| Equivalent form | `useMemo(() => fn, deps)` | `useCallback` with a value… no | — |

## 13. Code example

Three callbacks, three fates — watch which identity is reused:

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const bump = useCallback(() => setCount((c) => c + step), [step]);
  const stale = useCallback(() => console.log('count is', count), []);

  return (
    <div>
      <button onClick={bump}>step: {step}</button>
      <button onClick={() => setStep(step + 1)}>change step</button>
      <button onClick={stale}>log count</button>
    </div>
  );
}
```

```narrate
5: `bump` re-creates only when `step` changes — honest deps.
6: `stale` is stable AND stale: empty deps froze the closure over count=0 forever.
```

```text
mount                     → bump#1 (closes over step=1), stale#1 (closes over count=0)
click "change step"       → bump#2 (step=2 now); stale stays #1 — still reads count=0
click "log count" a few times → always 0, because stale was created once (Lesson 5)
```

The lesson in one component: a stable function with empty deps is a frozen closure. Keep
deps honest, or read through a ref.

## 14. Performance notes

- Creating a function is one of the cheapest operations in JavaScript. A fresh function per
  render is usually free — this is why the default is *no* `useCallback`.
- The hook's real cost is **downstream**: a new callback re-renders a memoized child and
  re-fires effects, which *can* be expensive. That's what you're paying to avoid.
- Worst case: a `useCallback` whose deps change every render — full recreation, plus
  comparison, plus the downstream re-renders it was meant to prevent.
- `useCallback` never reduces render *count* on its own. It reduces work only when a
  memoized child (Lesson 67) or an effect (Lesson 58) would otherwise run unnecessarily.

## 15. Debugging scenarios

| Symptom | Likely cause |
|---|---|
| Memoized child re-renders on every parent render | Callback (or another prop) is a new reference — `useCallback` it, or check for inline objects (Lessons 61, 67) |
| Effect with the callback in deps re-fires every render | The callback isn't memoized, or its deps change each render |
| "Stable" callback reads old state | Empty/missing deps froze the closure — recreate it, or read via a ref (Lesson 60) |
| `useCallback` has no effect at all | Nothing downstream compares identity — the wrapper was inert all along |

## 16. Quick revision notes

- Every render makes new functions; `useCallback` keeps one identity while deps don't change
- `useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)` — one mechanism, two spellings
- Worth it only for a memoized child (Lesson 67) or an effect dep (Lesson 58)
- "Usually you should not use it" — fresh functions are cheap (Lesson 71)
- Stable ≠ fresh: deps honest, or read current values through a ref (Lesson 60)
- The compiler auto-memoizes; hand-written calls fade out

## 17. Cheat sheet

```jsx
// only when identity matters downstream:
const handle = useCallback((id) => setSelected(id), []);   // memoized child / effect dep

// stable AND fresh — deps in, or read through a ref:
const latest = useRef(null);
latest.current = value;                                    // every render, outside effects
const handle = useCallback(() => doThing(latest.current), []); // stable, always current

// default: just write the function
const onClick = () => setCount((c) => c + 1);              // ✅ no wrapper needed
```

## 18. Key takeaways

> [!RECAP]
> - Every render creates a new function identity; `useCallback` freezes it until deps change
> - `useCallback(fn, deps)` is `useMemo(() => fn, deps)` — the symmetry is the answer
> - It helps in exactly two places: memoized children (Lesson 67) and effect dependencies (Lesson 58)
> - The honest default is "usually you should not use it" — fresh functions are cheap (Lesson 71)
> - Stable identity never means fresh values — keep deps honest or read through a ref (Lesson 60)
> - It's the second half of "useMemo vs useCallback" — Lesson 61 is the first

## Check your understanding

Answer these without looking back.

1. Why does a component re-render create a new function even when the code is identical?
2. Write the `useMemo` / `useCallback` equivalence in one line, and explain why it holds.
3. Name the two receivers that make `useCallback` worth it — and what happens to each without it.
4. Why is "usually you should not use it" the honest default?
5. How does a stable callback end up stale, and what are the two fixes?
6. Why does `useCallback` do nothing when the callback goes to a plain `<button onClick={…}>`?
7. How do `useCallback` and `useMemo` cooperate to make `React.memo` work?

## What's Next

**Lesson 63 — useContext.** Context's job, why it is not a state manager, and why every
consumer re-renders when the value changes.
