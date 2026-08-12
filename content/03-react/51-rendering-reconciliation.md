# Lesson 51 — Rendering & Reconciliation

**Interview importance:** ⭐⭐⭐⭐⭐ — "What happens when state changes?" Answer this well and the level goes up.

State changes in React do **not** mean "the DOM changes". The word *render* means something
very specific here, and confusing it with "paint" or "the browser did work" is the most
common way to fail this question. This lesson unpacks the pipeline from `setState` to the
pixel — and the reconciliation algorithm in the middle.

You already know the two pieces this hangs on: the component function re-runs, and the JSX
it returns is a new tree of element objects. Lesson 6's reference equality is the crux —
new objects and new arrays *every render* is what makes the whole algorithm work.

## Learning Objectives

By the end of this lesson you should be able to:

- Separate **render phase** from **commit phase**, and name what each one is allowed to do
- Explain why a component that renders is not the same as a DOM node that changed
- Walk through reconciliation (diffing) for a changed element, an unchanged element, and a new one
- Explain why new object/array props each render defeat every memoisation — using Lesson 6
- Say why rendering is not "slow work", and where the real performance budget goes
- Explain why you must never mutate props or state during render, with a concrete example

## 1. What is Rendering?

**Rendering is React calling your component functions to compute the next element tree — it is not touching the DOM.**

Rendering takes props + state, runs the function components, and produces a new tree of
plain element objects. The DOM update is a separate, later step — and it's optional, because
React can compare the trees and decide nothing changed.

## 2. Mental Model

Think of React as a **travel agent, not the airline**.

The agent (React) recomputes your full itinerary (the element tree) on every change so it
always has the latest plan. When you finally travel (commit), only the legs that actually
changed get rebooked — the flight to your destination is untouched even though the whole
itinerary was re-planned.

"Re-planning the itinerary" is rendering. "The flight actually changing" is the DOM update.
Most of the itinerary usually stays the same, and that's the entire point.

## 3. Visual Flow

```text
  setState / new props / context change
                    │
                    ▼
  ┌─────────────────────────────────────────────┐
  │  RENDER PHASE  (pure, may be paused/redone) │
  │                                             │
  │  1. call component function with new values │
  │  2. produce new element tree                │
  │  3. reconcile (diff) old tree vs new tree   │
  │     → list of DOM mutations                 │
  └─────────────────────────────────────────────┘
                    │
                    ▼
  ┌─────────────────────────────────────────────┐
  │  COMMIT PHASE  (synchronous, must complete) │
  │                                             │
  │  4. apply the mutations to the real DOM     │
  │  5. run layout effects, set refs, run       │
  │     passive effects (useEffect)             │
  └─────────────────────────────────────────────┘
                    │
                    ▼
                 browser paint
```

## 4. How It Works

A render is just function calls. React remembers the element tree from the previous render
(the *current* tree) and compares it with the freshly computed one (the *work-in-progress*
tree). The comparison is called **reconciliation** — colloquially "diffing".

```jsx
// <App /> renders, React calls App():
function App() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <h1>Count: {count}</h1>
      <Child name="Mansha" />
    </section>
  );
}
```

```text
App()  →  { type: 'section', props: { children: [
             { type: 'h1', props: { children: 'Count: 0' } },
             { type: Child, props: { name: 'Mansha' } },
           ] } }
```

`count` changes to `1`, and the whole tree is recomputed. Now reconcile the two trees:

```text
section  — same type  →  keep the DOM node, update props
h1       — same type  →  keep the DOM node, update text  "Count: 0" → "Count: 1"
Child    — same type  →  keep the DOM node, re-render Child with new props
```

> [!TIP]
> "Same type" is the whole rule. The DOM node survives exactly when the element type at that
> position is unchanged. Everything else — props, text, children — is just updated in place.

## 5. Why Rendering ≠ DOM Change

Rendering is cheap and happens often. DOM mutation is comparatively expensive and happens
only when the diff finds something. They are not the same work.

```jsx
function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h1>Renders: {now.toLocaleTimeString()}</h1>
      <StaticHeader />   {/* renders every second too — nothing breaks */}
    </div>
  );
}
```

```text
every second:
  Clock()   → render  → h1 text updated in the DOM
  StaticHeader() → render  → diff finds zero changes → DOM untouched
```

`StaticHeader` re-renders every second, yet its DOM subtree is never touched. **Render count
is not DOM-change count.** That distinction is the answer to "isn't re-rendering expensive?"

## 6. The Rules of the Render Phase

The render phase must be **pure**: same props + state → same output, and no side effects.
React may call your component multiple times, pause a render, discard it, or redo it —
impurity turns that into broken UI.

```jsx
let globalCount = 0;                       // module scope — shared by every render

function Counter() {
  globalCount += 1;                        // ❌ mutating during render

  return <p>Times called: {globalCount}</p>;
}
```

```text
render 1 → "Times called: 1"
render 2 → "Times called: 2"   (value is now 2)
```

Re-run the same render (Strict Mode, a paused render, Concurrent features) and the count
jumps again — output depends on how many times React ran you, not on the props. In
development, Strict Mode deliberately double-invokes every component to expose exactly this.

> [!PITFALL]
> In React 18+, renders can be **interrupted and restarted** without committing. Mutation
> during render is not a style preference — it's undefined behaviour.

## 7. Where the Time Goes

People worry about the wrong thing. Diffing thousands of elements is fast; the expensive
parts are:

1. **Calling your component functions** — especially when only a tiny subtree changed (from
   Lesson 67's `React.memo` perspective, re-running *every* component in the tree on each
   state change is the default).
2. **Creating the new element objects** — every render allocates a fresh tree.
3. **Re-running children's render functions** when their props didn't actually change.

The good news: since a re-render only re-runs function calls and cheap object allocations,
a few extra renders are usually free. The bad news: that's also why the "everything
re-renders" interview answer is not automatically a disaster — measure before you fix.

## 8. Reference Equality Is the Crux

Lesson 6's rule — objects and arrays are compared by reference, not contents — drives
everything here.

```jsx
function Parent() {
  const [tick, setTick] = useState(0);
  const style = { color: 'red' };          // new object every render

  return <Child style={style} />;
}
```

```text
render 1 → style is object #1
render 2 → style is object #2  (different reference, identical contents)
```

To `Child` and to `React.memo`/`useMemo`, `style` **changed** — new reference. It doesn't
matter that the contents are identical; a `{ color: 'red' }` you just created is never
`===` to the previous one.

This is why inline objects, arrays and arrow functions break memoisation. The value didn't
change; the *reference* did — and reference equality only sees the reference.

## 9. Reconciliation vs the "Virtual DOM"

The virtual DOM is a thin model that exists for a very different algorithm. This lesson is
the algorithm: comparing the last element tree with the new one and producing a minimal set
of DOM mutations. The virtual DOM is where that comparison happens — it is the substrate for
reconciliation, not a performance trick in itself. Lesson 56 covers it directly.

The tree React diffs against is not the browser's DOM tree. It's React's own internal model,
a per-component data structure called a **fiber**. The fiber holds the element, the state,
the effect list and the pointers that make diffing walkable. Reconciliation walks fibers;
the virtual DOM is the element tree the fibers describe.

## 10. Interview Explanation

> State changes schedule a render. During the render phase React calls the component
> functions with the new props and state, producing a new element tree. Then it reconciles
> that tree against the previous one — same element type means keep the DOM node and update
> its props, different type means unmount the old node and mount a new one. That produces a
> list of DOM mutations, which the commit phase applies synchronously before the browser
> paints. So rendering doesn't touch the DOM; reconciliation decides what, if anything,
> needs to be committed.

## 11. Senior-Level Insights

- **Render phase vs commit phase is the framing that separates you.** Render can be
  paused, discarded and redone; commit is synchronous and all-or-nothing. `useEffect` and
  `useLayoutEffect` run *after* commit — the render is already done when your effect sees
  the DOM. Side effects therefore belong in effects, never in render.
- **"Rendering is cheap" has a scope.** Re-running component functions is cheap in the
  abstract; it becomes expensive when a large subtree sits under a frequently-changing
  parent and those components do real work. The fix is targeting the *tree*, not the
  render count: `React.memo`, `useMemo`, or moving state down.
- **Minimal DOM mutations are not the point.** The browser is good at patching DOM. The
  point of reconciliation is *correctness with cheap guarantees* — you can write `UI = f(state)`
  and let React work out the diff. The performance win comes from skipping work (memo),
  not from shrinking the mutation list.
- **Strict Mode double-invokes components** in development to surface impure renders. If
  your component is pure, double-rendering changes nothing — which is precisely the test.

## 12. Common Mistakes

- **"Render means update the DOM."** It doesn't. Rendering is computing; commit is
  applying. Saying "it re-renders, so the DOM changes" is the #1 giveaway answer.
- **"New state always causes a re-render."** Not quite. If `setState` is called with the
  *same value* (same reference for objects), React bails out — from Lesson 50.
- **Mutating props or state during render.** Example below — the fix is to compute the
  value and let React own the update:

```jsx
function Bad() {
  const [user, setUser] = useState({ name: 'Ali' });
  user.name = 'Ahmed';                 // ❌ mutates state during render
  return <p>{user.name}</p>;
}

function Good() {
  const [user, setUser] = useState({ name: 'Ali' });
  return <p>{user.name}</p>;           // ✅ update via setUser in an event/effect
}
```

- **"useMemo makes renders cheap."** It only skips *recomputing a value*, and only when the
  dependencies are unchanged — and new-array deps (from Lesson 6) mean it recomputes
  anyway. It never stops a component from rendering.
- **Treating reconciliation as "magic diffing" that knows your data.** It knows nothing
  about your data. It compares element types and references. Keys (Lesson 52) exist
  precisely because it can't see your intentions in lists.

## 13. Best Practices

✅ Keep render functions pure — no writes, no network, no timers

✅ Let React drive updates: `setState` in events/effects, never mutation during render

✅ Move state down so only the subtree that needs it re-renders

✅ Use `React.memo`/`useMemo`/`useCallback` on real hot spots — and read Lesson 6 before
doing so, because reference equality decides whether they work at all

✅ Pass primitives where possible; stabilise objects/arrays/functions with `useMemo` /
`useCallback` when they must cross a memoised boundary

❌ Don't reach for memo at the first sign of a re-render — most re-renders are free

❌ Don't put side effects in render "because it runs anyway"

❌ Don't derive output by mutating props — compute new values and let React commit them

## 14. Interview Questions

**Q1. What happens when a component's state changes?**

> React schedules a render for that component. On render it calls the component function
> with the new state, gets a new element tree, and reconciles it against the previous tree.
> Same element types are kept and updated in place; changed types get unmounted and
> remounted. The diff produces a list of DOM mutations, which are committed synchronously,
> and then effects run. The browser paints last.

**Q2. Does every render update the DOM?**

> No. Rendering and committing are separate phases. A component can render, produce a tree
> that diffs to zero changes, and nothing in the DOM is touched — even though the function
> ran. Render count and DOM changes are different numbers.

**Q3. What is reconciliation?**

> React's diffing of the new element tree against the previous one, to decide which DOM
> mutations are actually needed. The core rule is element type: same type is updated in
> place, different type is replaced. It's an O(n) algorithm over the tree, and it's why you
> write `UI = f(state)` instead of hand-writing DOM updates.

**Q4. When does React replace a DOM node instead of updating it?**

> When the element type at a position changes — a `<div>` becoming a `<section>`, or a
> component class/function identity changing. Different type means React tears down the old
> node and its state and mounts a fresh one. Same type re-renders in place and keeps DOM
> state like focus, scroll and input text.

**Q5. Why does passing a new object every render break memoisation?**

> From Lesson 6, objects are compared by reference. Each render creates a new object with a
> new reference, so `Object.is` sees a change even when the contents are identical.
> `React.memo`'s shallow comparison therefore fails, `useMemo`'s dependency check fires, and
> the child re-renders. The fix is stabilising the reference with `useMemo`/`useCallback`
> or restructuring so the object isn't created in the parent at all.

**Q6. Why can't you mutate state or props during render?**

> The render phase must be pure because React may call a component multiple times, pause,
> discard or redo a render. Mutating means each attempt produces different output and the
> component leaks state between attempts. React 18 Strict Mode double-invokes components
> specifically to catch this. Side effects belong in effects — which run after commit.

**Senior follow-up: React can pause or restart a render. What does that mean for your code?**

> It means my render code can run more than once per visible update, so it has to be pure —
> same input, same output, no side effects. Any work that must happen once goes in an
> effect, which is tied to commit. It's also why Strict Mode double-invokes: to prove a
> component is pure enough for concurrent rendering.

## 15. Follow-up Questions

**Why is diffing considered O(n) rather than O(n²)?**

> React only compares elements at the same position in the tree, never cross-matching
> arbitrary old and new nodes. Tree level by level, position by position, same type means
> "reuse", different type means "replace". That linear walk is what keeps it fast — and it
> is exactly why keys (Lesson 52) are needed to tell React when a *sibling* actually moved.

**What's the difference between reconciliation and re-rendering?**

> Re-rendering is the phase that runs component functions and produces a new tree.
> Reconciliation is the comparison of that new tree with the old one. A render always
> produces a tree; reconciliation decides whether that tree means any DOM work.

**When does React bail out of re-rendering a child?**

> When the child's props are unchanged and the parent isn't the one that re-rendered, or
> when the child is wrapped in `React.memo` and its props compare shallowly equal. Note the
> reference trap: an inline object is never shallowly equal, so memo silently doesn't apply.
> Also from Lesson 50: calling `setState` with the same value bails out of even the parent's
> own render.

## 16. Comparison Table

| | Render phase | Commit phase |
|---|---|---|
| What it does | Runs components, builds element tree | Applies DOM mutations, runs effects |
| Pure? | Must be pure | May have side effects |
| Interruptible? | Yes (Concurrent React) | No — synchronous |
| Touches the DOM? | No | Yes |
| Can be skipped? | Yes (bail out) | Only if the diff is empty |
| Where effects run | Never | After (layout effects first) |

## 17. Performance Notes

- **Rendering isn't the bottleneck; the DOM work it causes is** — and most renders cause no
  DOM work at all. Profile before "optimising renders".
- **Re-running component functions is usually cheap.** It becomes expensive under a
  high-frequency parent (animated list, keystroke-driven state) with a large subtree.
- **Reference equality defeats memo silently.** If a child still re-renders after
  `React.memo`, the almost-certain cause is a new object/array/function prop each render
  (Lesson 6) — look there before blaming the memo.
- **`key` stability is performance-relevant** (full detail in Lesson 52): unstable keys
  destroy and rebuild DOM nodes, losing focus, scroll and input state.

## 18. Debugging Scenarios

**Scenario 1: "Why is my component re-rendering on every keystroke?"**

The state that changes lives too high — every ancestor of it re-renders. Fix: move the state
down into the component that actually uses it (Lifting state down is the inverse of Lesson
55's lifting up).

**Scenario 2: "My input loses focus on every render."**

The input is being **replaced**, not updated — its element type changed, or its key changed,
or it's under a keyed list where the keys are unstable (Lesson 52). Check the tree shape
first: an inline conditional swapping between `<input>` and `<textarea>` type changes is the
classic culprit.

**Scenario 3: "A child re-renders even though I wrapped it in `React.memo`."**

Almost always the reference trap: the parent creates a new object/array/function each
render, so the memo's shallow compare fails every time (Lesson 6). Stabilise the reference,
or restructure so the object is created in a child that doesn't re-render.

**Scenario 4: "Strict Mode runs my component twice — is that a bug?"**

No. It's React deliberately double-invoking render to prove it's pure. If the second run
changes anything visible or throws, you've found an impurity in render — exactly what the
mechanism is for.

## 19. Quick Revision Notes

- Render = compute the tree; commit = apply the diff; paint = browser's job
- Render phase: pure, interruptible. Commit phase: side-effectful, synchronous
- Reconciliation rule: same element type → update in place; different type → replace
- Renders frequently; DOM changes rarely — render count ≠ DOM-change count
- New objects/arrays each render → new references → memo defeats (Lesson 6)
- Never mutate props or state during render — undefined behaviour under concurrency
- Bail out: same-value `setState` skips the render; empty diff skips the commit
- Effects run after commit — that's where side effects belong

## 20. Cheat Sheet

```text
setState → render schedule → component functions run → new element tree
        → reconcile (type match? update : replace) → mutation list → commit → effects → paint

SAME TYPE   → keep node, update props
DIFF TYPE   → unmount old, mount new (state lost)
NO DIFF     → render happened, DOM untouched

useState / props / context change  →  re-render (unless same value / memoised child)
```

## 21. Key Takeaways

> [!RECAP]
> - **Render** computes a new element tree; **commit** applies the diff to the DOM — two phases, different rules
> - The render phase must be pure: React may pause, discard and redo renders
> - Reconciliation is a linear diff on element type: same type updates in place, different type replaces
> - Rendering a component ≠ changing the DOM — most renders produce an empty diff
> - Reference equality (Lesson 6) is why new objects/arrays each render defeat every memo
> - Side effects go in effects, after commit — never in render
> - Bail-outs: same-value `setState` skips render; empty diff skips commit

## Check your understanding

Answer these without looking back.

1. What is the render phase allowed to do, and what is it forbidden from doing?
2. A component renders ten times and the DOM changed once. Explain the discrepancy.
3. Walk through reconciliation for: (a) same type, (b) different type, (c) a new element.
4. Why does `const style = { color: 'red' }` in a parent break `React.memo` on the child — and which lesson explains it?
5. Why would you never put `localStorage.setItem(...)` directly inside a component body?
6. What does "same value `setState` bails out" mean, and where did you learn it?
7. What is a fiber, and how does it relate to the element tree?

## What's Next

**Lesson 52 — Lists & Keys.** Rendering a list is where reconciliation's position-based
diff hits its limit — and where a single wrong `key` produces the exact kind of DOM bug this
lesson's rules predict. "Why are keys important?" is close to a guaranteed question.
