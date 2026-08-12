# Lesson 67 — React.memo

**Interview importance:** ⭐⭐⭐⭐ — expect a direct question, and expect it as a trap
disguised as a favour: "so you're saying I should memo everything, right?"

`React.memo` is a shallow prop comparison. It skips a re-render when every prop has the
same identity as last time — and that's the whole mechanism, no deep diffing anywhere. The
moment someone tells you memoisation, the follow-up is *what exactly is being compared, and
how can that comparison itself cost more than the render it saved?* Shallow prop comparison.
And when it makes things measurably slower.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what `React.memo` compares, and that the comparison is shallow
- Explain why a memoised component still re-renders when a prop is a fresh object
- Tell the story of when memo backfires and makes rendering slower (reference equality from Lesson 6)
- Give the rule for when memo helps, when it's noise, and when it's a trap
- Explain how `memo` interacts with `useCallback` and `useMemo`

## 1. One-line definition

**`React.memo` is a higher-order component that skips re-rendering a component when its
props are referentially equal to the previous render's props.**

## 2. Mental model

A cache with exactly one entry. The key is the previous props object, the value is the
last rendered output. Before every render, React asks: *"are all props still the same
objects as last time?"* If yes, reuse the cached output. If anything changed — even one
prop out of ten — render again.

It is *not* a "make it faster" button. It is an equality check running *in addition to*
the render it might save. The cache has no eviction, no way to say "close enough", and
no deep inspection of what changed inside an object.

## 3. Visual flow

```text
Parent re-renders
        │
        ▼
new props objects created        ← fresh references, every time
        │
        ▼
┌──────────────┐   identical refs   ┌──────────────────────┐
│ memo compare │ ─────────────────► │  skip render, reuse  │
│ (shallow,    │                    │  last committed tree │
│  props only) │                    └──────────────────────┘
└──────┬───────┘
       │  any prop reference differs
       ▼
  re-render component
```

## 4. How it works

`memo` is a function that takes a component and returns a wrapped one. The wrapped
version compares props with `Object.is` — one level deep — before deciding to render.

```jsx {8-10}
const Button = memo(function Button({ label, onClick }) {
  console.log('Button rendered');
  return <button onClick={onClick}>{label}</button>;
});
```

The comparison is the point. `Object.is(a.label, b.label)` for each prop — no diffing of
what's *inside* an object, no field-by-field walk. Two objects with identical contents but
different references fail the check:

```jsx
<Button label="Save" />            // re-renders when a fresh style object arrives
<Button style={{ width: 100 }} />
```

Every `{{ }}` in JSX is a brand-new object literal — a different reference on every
render. Same for `{ count }` state values (numbers compare equal, so those pass), and same
for inline arrow functions, which are new function objects each render.

## 5. Real project usage

| Situation | What memo does |
|---|---|
| **Big component tree, few prop changes** | Skips the expensive subtree unless its own props changed |
| **List of rows** | `memo(Row)` means a filtered re-render only touches changed rows |
| **Chart / table cells** | Cheap component, but hundreds of them — skipping hundreds of checks adds up |
| **`children` passed by the parent** | Fails memo every time — children is a fresh element each render |
| **`onClick` inline arrow** | Fails memo every time — until `useCallback` (Lesson 62) makes it stable |

The one pattern where memo does real work is parent-owned state. The list's data lives in
the parent, so every keystroke in a search box re-renders the parent; memo lets the rows
opt out unless *their own* row of data changed identity:

```jsx {12}
function List({ items }) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((it) => it.name.includes(query));
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {filtered.map((item) => <Row key={item.id} item={item} />)}
      </ul>
    </>
  );
}

const Row = memo(function Row({ item }) {
  return <li>{item.name}</li>;
});
```

Each `Row` skips unless *its* `item` reference changed — typing in the box re-renders the
`<input>` but not the rows. This is the flagship use case in real codebases.

## 6. Interview explanation

> `React.memo` compares the props from the last render to the current props using a
> shallow, referential check. If every prop is the same object it was last time, the
> component skips rendering and React reuses the previous output.
>
> It only helps when the parent re-renders often and the component's own props rarely
> change. It only works when the props are referentially stable — which is why inline
> objects and inline functions defeat it, and why you pair it with `useCallback` and
> `useMemo`.

## 7. Senior-level insights

- **Name the comparison precisely.** "Shallow, `Object.is` on each prop, values compared
  by reference for objects, by value for primitives." That sentence alone beats most
  candidates.
- **Memo is a re-render *skip*, not a render *cache*.** The component body still runs when
  props change; it runs *again* when internal state changes; and the skipped output is only
  reused when the props are referentially identical. It never memoises expensive work
  inside the body — that's `useMemo`'s job, and the two are different tools.
- **The failure mode is the extra work.** Every memoised component pays a shallow compare
  on *every* parent render. A cheap component in a hot list pays more in comparisons than
  it saves in renders. Measuring is the answer, not intuition — Profiler before, Profiler
  after.
- **`children` breaks it silently.** A component that receives `children` from a parent
  re-renders with it, because the `children` element is a fresh object each parent render.
  Passing `memo(Component)` and passing children from the parent is a wasted wrap.
- **Memo protects against *downward* prop changes only.** It cannot stop the parent's
  re-render, it cannot stop internal state or context from re-rendering the component, and
  it does not stop *other* memoised siblings from re-rendering when their own props change.
  If your memoised component reads context (Lesson 63), context changes still re-render it.

## 8. Common mistakes

**Mistake 1 — memo everything "just in case".** Every wrapper adds a comparison cost. A
small component rendered once per screen does nothing but pay for the check. The comparison
has to cost *less than the render it skips*, or memo is a net loss.

**Mistake 2 — inline props that defeat the memo.**

```jsx
const Row = memo(function Row({ item, onSelect }) { /* … */ });

// in the parent:
<Row item={item} onSelect={() => handleSelect(item)} />   // ❌ new function every render
```

The `onSelect` is a fresh reference every render, so the memo always re-renders — the wrap
is dead weight. Pair it with `useCallback` (Lesson 62), or accept the re-render.

**Mistake 3 — believing memo does a deep compare.** Two equal-looking objects with
different references fail the check and re-render.

**Mistake 4 — putting a memoised component under a context that changes.** Context bypasses
props entirely; a memoised consumer still re-renders when its context value changes. Memo
cannot see context.

**Mistake 5 — missing that state and props both re-render.** Memo skips prop-driven
re-renders only. Internal `useState` changes still render, and so do `useReducer`
dispatches and context updates. Memo is not a "never render again" lock.

## 9. Best practices

✅ Use memo when: the component renders often, the subtree is expensive, and props change rarely — then measure it

✅ Make the props stable first: `useCallback` for handlers, `useMemo`/useMemoised parent state for objects

✅ Put `memo` on list rows and map leaves, where the same data objects flow through unchanged

✅ Measure with the React Profiler — before and after — and keep the change only if it's visible

❌ Don't wrap every component defensively; comparison cost with no render to save is pure overhead

❌ Don't pass inline functions or object literals to a memoised component and expect it to skip

❌ Don't rely on memo to fix a re-render *inside* the body — that's `useMemo` and memoisation of work, a separate concern

## 10. Interview questions

**Q1. What does `React.memo` do?**

> It's a higher-order component that memoises the component it wraps. On each render it
> compares the new props to the previous ones with a shallow, `Object.is`-style check. If
> every prop is referentially identical, React skips rendering and reuses the last output.

**Q2. Why would a memoised component still re-render?**

> A few reasons: one prop is a new reference — an inline object or inline function defeats
> the check; internal state changes; a context value the component reads changes; or the
> component receives `children` that the parent recreated. Memo only guards prop identity,
> nothing else.

**Q3. Does `React.memo` make your app faster?**

> Only when it skips a render that would have been more expensive than the comparison, and
> only when props are referentially stable. Otherwise it's overhead. A cheap component in a
> hot list can end up slower. You measure with the Profiler before and after.

**Senior follow-up: What's the difference between `memo` and `useMemo`?**

> `memo` memoises the component *itself* — it skips re-rendering when props are unchanged.
> `useMemo` memoises a *value computed inside* a component body — it skips recomputing an
> expensive calculation between renders. One is a whole-component shortcut around props;
> the other caches a specific result. And `useCallback` is `useMemo` for functions,
> returning a stable reference so that *other* memoised components can skip.

## 11. Follow-up questions

**How does memo relate to reference equality?**

> Directly: memo's entire decision is reference equality on props, which is Lesson 6.
> Primitives compare by value, objects by identity. That's why state values like
> `count` pass the check when unchanged, while a freshly built object always fails it. The
> "new props each render" story in Lesson 6 is exactly the story of why memo gets defeated.

**Does `React.memo` help with context changes?**

> No. Context consumers re-render when the value changes, regardless of memo, because the
> value arrives outside the props flow. If you need to avoid context re-renders you split
> the context into smaller values and memoise at the provider boundary, not on the consumer.

**When would you *not* use memo?**

> When the component is cheap, when the parent rarely re-renders, when the props are
> unstable anyway, or when the component sits under frequently-changing context. In all
> those cases the comparison runs without ever skipping a render.

## 12. Comparison table

| | `memo` (component) | `useMemo` (value) | `useCallback` (function) |
|---|---|---|---|
| Memoises | whole component render | a computed value | a function reference |
| Compared | props, shallow `Object.is` | dependency array, `Object.is` | dependency array, `Object.is` |
| Re-render skip | yes — reuses last tree | no — body still runs | no — body still runs |
| Needs stable inputs | `useCallback`/`useMemo` in the parent | stable deps to be useful | its own deps |
| Cost when it misses | one failed shallow compare | one recompute | one new function |

## 13. Code example

```js
// Shallow = one level. Simulated `Object.is` prop check.
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;                  // same reference (or primitives)
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.is(a[k], b[k])) return false;        // values compared, not deep
  }
  return true;
}

console.log(shallowEqual({ x: 1 }, { x: 1 }));       // different objects
console.log(shallowEqual({ x: 1 }, { x: 1 }));       // fresh objects again
const shared = { x: 1 };
console.log(shallowEqual(shared, shared));           // same reference
```

Output:

```text
false
false
true
```

A fresh `{ x: 1 }` is a different reference every time, so memo's check fails and the
component renders — even though the *contents* are identical. That is the whole story of
Lesson 6 applied to props.

```narrate
1: the compare React runs on every parent render
2-3: same reference, or two primitives that are Object.is equal, pass immediately
4-8: any non-object fails; the check stays shallow
9-11: same number of keys, then compare each value by Object.is
13-15: two separately built objects never pass, even with identical contents
18-19: the object passed twice from the same variable passes
```

## 14. Performance notes

When it matters: a big subtree re-rendering on every parent update while its own props
change rarely — say a heavy `Chart` under a text-input screen, or a thousand `Row`s in a
list.

When it doesn't: cheap components, renders that are already rare, or props that are new
every time anyway. There, the shallow compare is pure overhead and can make things
measurably slower — an extra `Object.is` per prop, per parent render, forever.

The trap: memo turns an O(1) cheap render into an O(n) compare *plus* a render. The
compare only pays off when the skip happens often. Profile before and after; keep it only
if the Profiler agrees.

## 15. Debugging scenarios

**"I wrapped it in memo but it still re-renders."** Suspect a fresh reference first. Add
a `console.log('render')` inside the body and log the props at the same time — compare the
reference of the object prop across renders, or `Object.is(prev.item, next.item)` manually.
Then fix the parent: `useCallback` the handler, memoise the object.

**"It re-renders everything in the list when I type."** If rows are memoised but the list
data is recomputed each render, every row gets a new item reference. Memoise the filtered
array or move the filtering below the memo boundary — the data must be referentially
stable for memo to skip.

**"My memoised component never re-renders, even when the props change."** You've memoised
a component that reads props only through context, or the data update isn't producing a
new props reference. Log the props and check whether the parent is actually passing a new
value — memo skips exactly when the old reference is passed again.

**"It got slower after adding memo."** The component was cheap and the compare never skips
(see: inline props, context). Remove the wrapper and re-measure — this is the case the
"memo makes things slower" story is about.

## 16. Quick revision notes

- `memo` = shallow, referential prop comparison — never deep, never content-aware
- It skips re-renders only when props are unchanged *by reference*; state, context and children still re-render
- Fresh objects and functions every render defeat it — Lesson 6's reference equality is the whole mechanism
- Pair with `useCallback` for handlers and `useMemo` for data to make props stable
- Wrap selectively: big subtrees, stable props, frequent parent renders — then measure
- The backfire story: cheap component + never-identical props = compare cost with no skip
- `children` from the parent always breaks the memo; context bypasses it entirely

## 17. Cheat sheet

```jsx
const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item)}>{item.name}</li>;
});

// stable props or memo is dead weight:
const onSelect = useCallback((item) => handleSelect(item), []);
const rows = useMemo(() => filter(items), [items, query]);   // stable array ref
```

- Default: skip memo until a render is measured slow
- Memoise list rows and heavy subtrees whose props change rarely
- `Object.is` on each prop; primitives pass by value, objects by reference
- `memo` never skips: internal state, context updates, new `children`
- If props are fresh objects/functions each render, fix stability first or drop memo

## 18. Key takeaways

> [!RECAP]
> - `React.memo` compares props shallowly — the mechanism is reference equality from Lesson 6
> - Identical contents with different references fail the check and re-render
> - It skips only prop-driven re-renders; state, context and `children` still re-render
> - Inline functions and object literals defeat it — pair it with `useCallback` and `useMemo`
> - The backfire story is real: comparison cost with no render saved can make things measurably slower
> - Wrap selectively and measure with the Profiler — memo is a tool, not a default

## Check your understanding

Answer these without looking back.

1. What exactly does `React.memo` compare, and at what depth?
2. A component receives `item={{ id: 1, name: 'x' }}` built fresh in the parent. Why does it re-render every time?
3. Name the three things that still re-render a memoised component.
4. Why does an inline `onClick={() => …}` defeat memo, and what's the fix?
5. When does memo make things *slower*, not faster?
6. What's the difference between `memo` and `useMemo` — which one skips a render?

## What's Next

**Lesson 68 — Lazy Loading & Suspense.** React will wait for a component you tell it to
wait for. The follow-up is always: *"waiting for what, exactly, and what happens while we
wait?"*