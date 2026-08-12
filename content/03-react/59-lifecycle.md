# Lesson 59 — Lifecycle & Effect Order

**Interview importance:** ⭐⭐⭐⭐ — foundational. Later lessons build directly on this.

Rendering is a pipeline, not a series of callback moments. When the interviewer asks
"what happens when state changes?", the difference between a mid answer and a strong one is
whether you can walk the order: render → commit → paint → effects, children first, cleanup
in reverse.

This lesson fixes the order in your head, then settles two questions every candidate gets
wrong: what Strict Mode actually does in development, and how effects map onto the lifecycle
methods everyone still quotes.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the four phases of a render cycle in order, and what runs in each
- Explain why children's effects run before parents' effects
- Explain why cleanup runs parent-first, and what it protects
- Explain Strict Mode's double-invocation and what it exists to catch
- Map every old lifecycle method onto a modern equivalent — or say why there is none
- Explain the unmount sequence: cleanup order, top-down, and what runs last

## 1. One-line definition

**A render cycle is render → commit → paint → effects, with effects running child-before-
parent and cleanup running parent-before-child — and in development, Strict Mode runs the
cycle twice to expose impure or leaky effects.**

## 2. Mental model

Think of a theatre company. **Render** is the rehearsal — pure, repeatable, thrown away and
done again, and it must not touch the audience. **Commit** is the performance itself: the
DOM is updated exactly once per cycle. **Paint** is when the audience sees it. **Effects**
are the after-show work — turning off the house lights, locking the doors — that must never
delay the curtain.

Children go first because a parent's effect expects its children to exist. The parent is
the stage manager checking the doors *after* the cast has left the building. And cleanup is
the reverse — you strike the set (child) before you close the building (parent), because
closing the building first would strand the cast inside.

## 3. Visual flow

```text
 one state change triggers one cycle:

 ┌─ 1. RENDER ──────────────────────────────────────────────┐
 │   parent function runs → child function runs             │
 │   (functions only — pure, may run multiple times)        │
 └──────────────────────────────────────────────────────────┘
 ┌─ 2. COMMIT ──────────────────────────────────────────────┐
 │   DOM updated once — refs attached — layout effects run  │
 └──────────────────────────────────────────────────────────┘
 ┌─ 3. PAINT ───────────────────────────────────────────────┐
 │   browser draws — the user sees the new UI               │
 └──────────────────────────────────────────────────────────┘
 ┌─ 4. EFFECTS (passive) ───────────────────────────────────┐
 │   children first, parents after                          │
 │   deps changed → cleanup(old) → body(new)                │
 └──────────────────────────────────────────────────────────┘

 Strict Mode (development only): repeat steps 1-4, then do the
 extra mount → cleanup → mount cycle on first mount.
```

Effects never run inside steps 1–3. That single sentence resolves most "but why…" questions.

## 4. How it works

**Step 1 — Render.** React calls the component functions, top-down: parent renders, then its
children. Nothing is written to the DOM. Render may be called more than once per commit
(discarded renders, bail-outs, Strict Mode) — which is why it must be pure.

**Step 2 — Commit.** React applies the diff to the real DOM, exactly once. Layout effects
(`useLayoutEffect`) run here, before paint — use them only when you must measure the DOM
before the user sees a flash.

**Step 3 — Paint.** The browser draws. Everything from here on is "passive": the user
already sees the committed UI.

**Step 4 — Effects.** React walks the tree *again*, bottom-up. For each component whose deps
changed: run the previous cleanup, then the body. The second walk is why children effect
before parents:

```jsx
function Parent() {
  useEffect(() => { console.log('parent effect'); }, []);
  return <Child />;
}

function Child() {
  useEffect(() => { console.log('child effect'); }, []);
  return null;
}
```

Output:

```text
child effect
parent effect
```

A parent's effect may read a ref, measure the DOM, or query a child-mounted subscription —
all of which require the child to have finished first.

**Cleanup order is the reverse.** On unmount, React walks *top-down*: parent cleanup, then
child cleanup. The parent is unsubscribing the shared connection; the children are
dismantling their own pieces. If the child went first, the parent's teardown could touch
something already gone.

```text
mount (first render):
    child effect          ← child-before-parent
    parent effect

unmount:
    parent cleanup        ← parent-before-child
    child cleanup
```

> [!TIP]
> Effects aren't "on mount, on update, on unmount". They're "after every commit whose deps
> changed", and cleanup is "before the next one, and at unmount". The order above is the
> same for the very first commit as for any other.

## 5. Strict Mode Double-Invocation

In development only, Strict Mode deliberately re-runs the cycle to *catch the bugs that
only appear when effects re-run*:

```text
mount #1:  render → commit → paint → effect body
           (Strict Mode immediately unmounts the tree)
cleanup:   effect cleanup runs
mount #2:  render → commit → paint → effect body
```

So your `[]` effect body runs twice on mount in dev — and the cleanup runs once in between.
That's not a bug in your code by itself; it's the detector going off. Three things it
catches:

1. **Missing cleanup** — if the body opens a subscription or timer and nothing closes it,
   the second mount leaks it.
2. **Impure render** — if the render function itself has side effects, the double render
   makes them visibly run twice.
3. **Effects that assume "I ran exactly once"** — the exact assumption `componentDidMount`
   taught everyone to make.

> [!PITFALL]
> The double-invocation is **development-only**. Production runs mount effects once. Don't
> "fix" it by suppressing Strict Mode — it exists to surface the leaks; the leaks are the
> problem. If your effect is written as body-opens / cleanup-closes, the second cycle is
> harmless and free.

## 6. Real project usage

The order matters most in apps with a shared "shell": a provider that subscribes to a data
source, with pages as its children.

```jsx
function Workspace() {
  useEffect(() => {
    const unsub = channel.subscribe(handleEvent);   // parent: shared subscription
    return () => channel.unsubscribe(handleEvent);  // parent cleanup: close the channel
  }, []);

  return (
    <>
      <ChatPane />
      <Sidebar />
    </>
  );
}

function ChatPane() {
  useEffect(() => {
    const el = listRef.current;                     // child effect: needs the DOM + mount
    // …
    return () => { /* child cleanup: detach its own listeners */ };
  }, []);
  return <ul ref={listRef} />;
}
```

Because child effects run first, `ChatPane`'s effect can safely read its `ref` and set up
its piece before `Workspace` starts the shared subscription. On unmount, `Workspace` tears
the channel down first, so no child handler can fire during the dismantling. That's the
whole ordering contract, used for real.

## 7. Interview explanation

> One state change produces one cycle: render (pure, top-down), commit (DOM written once),
> paint, then effects. Effects run after paint, child-before-parent — a parent effect
> assumes its children are finished mounting — and cleanup runs in reverse at unmount,
> parent-before-child.
>
> Strict Mode is a development-only detector: it double-invokes mount effects so missing
> cleanup and impure renders surface immediately. It never affects production.
>
> And effects aren't the old lifecycle methods. They're a single "after the commit, if the
> deps changed" mechanism that happens to be called at mount, update and unmount times.

## 8. Common mistakes

**❌ Mistake 1: Relying on effect *within-tree* order**

```jsx
// you can't see this in the code, but the interviewer can hear it:
// "I need the child's effect to have run before I read its ref in the parent"
```

Child effects do run first — but only effects scheduled by the same commit, and never *on
the same frame* as render. If the parent needs the child's *render output* to be committed,
read it in a layout effect (before paint) or coordinate through state. Effect order is an
implementation guarantee, not a tool for sequencing work.

**❌ Mistake 2: Confusing Strict Mode double-invoke with production behaviour**

```jsx
// "why does my fetch run twice in dev but once in prod?"
// answer: Strict Mode, not your code — unless your cleanup is missing,
// in which case the second fetch is the bug detector working.
```

If the fetch is the "close what you opened" shape (abort in cleanup), the double run is
harmless. If it isn't, the double run is exactly the leak the detector exists to show you.

**❌ Mistake 3: Treating effects as a lifecycle map**

```jsx
// the mental model: "onMount → do X, onUpdate → do Y"
useEffect(() => {
  if (!mounted) { load(); mounted = true; }   // ❌ hand-rolled lifecycle
}, []);
```

Effects don't distinguish mount from update — they distinguish *changed deps from
unchanged*. Hand-rolling a "first run" flag recreates `componentDidMount` semantics you
already decided were wrong in Lesson 57.

**❌ Mistake 4: Measuring the DOM in a passive effect**

```jsx
useEffect(() => {
  const w = node.offsetWidth;    // ❌ after paint — the user may see the flash
}, []);
```

Reading layout after paint forces the browser to reflow and can visibly jump. If the value
must be read before the user sees the frame, use `useLayoutEffect` — it runs in the commit
phase, before paint.

**❌ Mistake 5: Assuming unmount cleanup order runs "bottom-up like effects"**

The common wrong answer is "cleanup runs child-first, mirroring effects." It doesn't —
cleanup is **top-down**, parent-before-child. Unmount is the reverse of mount, not a mirror
of the effect pass.

> [!PITFALL]
> Any time you see "why did the parent's effect run *after* the child's?" the answer is the
> second walk. And any time you see "why did the parent's cleanup run *before* the child's?"
> the answer is the same walk, in reverse. Commit these two directions; everything else in
> this lesson hangs off them.

## 9. Best practices

✅ Write effects as "open in the body, close in cleanup" — order then stops mattering to you

✅ Rely on child-before-parent for **reading** mounted children, not for sequencing side effects

✅ Use `useLayoutEffect` only for pre-paint DOM measurement — never as a default

✅ Keep Strict Mode on; treat a double-run as a signal, not a mystery

✅ Mention the second-walk explanation when you explain effect order — it's the part that sounds senior

❌ Don't hand-roll mount/update flags inside an effect — deps already encode that

❌ Don't do layout reads in a passive effect — the user can see the result of the reflow

❌ Don't suppress Strict Mode to make a warning "go away" — the warning is the feature

## 10. Interview questions

**Q1. What happens, step by step, when a state update is processed?**

> Render: React calls the component function (and its children) to compute the new tree —
> pure, no DOM writes, may run more than once. Commit: it applies the diff to the real DOM
> exactly once, and layout effects run here, before paint. The browser paints. Then passive
> effects run: for every component whose dependencies changed, cleanup first, then the body.
> Effects are scheduled after paint so they never block the frame.

**Q2. Do child effects run before or after parent effects — and why?**

> After. The effect pass is a second walk over the committed tree, bottom-up. A parent
> effect often reads refs or queries things the children set up, so the guarantee is that
> children finish their effects first. If the parent's effect ran first, that read would
> race the child's setup.

**Q3. What order does cleanup run in when a component unmounts?**

> Top-down: parent cleanup first, then child cleanup. Unmount walks the tree from the root
> toward the leaves, the opposite direction of the effect pass. The parent tears down the
> shared resource first so children never keep firing into a half-dismantled tree.

**Q4. What does Strict Mode actually do?**

> In development, it intentionally double-invokes render and runs mount effects through a
> mount → cleanup → mount cycle, to catch effects that leak or renders that aren't pure.
> Production is unaffected — effects run once there. The correct response to a double-run is
> "my cleanup is probably missing", not "Strict Mode is buggy".

**Q5. How do `useEffect` and `useLayoutEffect` differ?**

> Both run after the DOM commit, but `useEffect` waits for the browser to paint and
> `useLayoutEffect` runs synchronously in the commit, before paint. So layout effects can
> read and mutate the DOM without the user seeing a flash, at the cost of blocking the
> paint. Use them for measurements; use `useEffect` for everything that doesn't need to
> happen before the user sees the frame.

**Senior follow-up: Is `useEffect` a replacement for `componentDidMount`, `componentDidUpdate` and `componentWillUnmount`?**

> Not a replacement — a different model. Those were lifecycle methods, three separate moments
> React called you at. An effect is one mechanism — "after the commit, if the deps changed" —
> that fires at all three moments depending on context. On mount there's no previous deps, so
> it runs; on updates it runs only when the deps changed; on unmount it doesn't run at all,
> but the cleanup it left behind does.
>
> The reason the old map was dangerous: `componentDidMount` ran during commit, before paint,
> while effects run after. Same reason Strict Mode double-invocation exists — the old API
> taught people to write effects that assume "exactly once".

## 11. Follow-up questions

**Why is render allowed to run more than once per commit?**

> Because React may throw away work — an interrupted render, a concurrent update, a strict-
> mode re-run — and start again. That's only safe if render has no side effects, which is
> exactly why effects are deferred out of render entirely. The rule "render is pure" is the
> price of render being discardable.

**What is the difference between the render phase and the commit phase?**

> Render computes the new tree; commit applies it. Render may run zero or more times per
> update and must be pure; commit runs exactly once and is where the DOM (and refs, and
> layout effects) actually change. Everything observable about the old lifecycle methods
> happened in the commit phase; the render phase was invisible to them.

**If two sibling components both have effects, which one runs first?**

> The order of the second walk follows the order of the first: siblings effect in their
> render order, left-to-right in the tree as rendered. Between sibling branches it's depth-
> first, matching the order their components were invoked during render.

**Why does the cleanup for a parent run before the child's cleanup?**

> Because unmount is a teardown from the top. The parent owns shared resources — a channel,
> a subscription, a global listener — and if it tore down after its children, a child's
> cleanup could fire handlers into a dead channel. Parent-first guarantees children stop
> first, then the shared resource closes.

**Does the double-invocation in Strict Mode affect production?**

> No. It's compiled out — the strict double-cycling exists only in development builds. Your
> production bundle runs mount effects once, and cleanup once on unmount. The dev/prod
> difference is a feature: it makes leaks visible exactly where you're watching.

## 12. Comparison table

| Old lifecycle method | When it ran | Modern equivalent |
|---|---|---|
| `componentDidMount` | Commit, before paint | `useEffect(fn, [])` — after paint, not the same moment |
| `componentDidUpdate` | Every re-commit | `useEffect(fn, deps)` — only when deps changed |
| `componentWillUnmount` | During unmount commit | the cleanup returned from `useEffect` |
| `shouldComponentUpdate` | Before render | `React.memo` (Lesson 67) — the render side, not effects |
| `getDerivedStateFromProps` | Before render | derive during render — never an effect (Lesson 57) |
| `getSnapshotBeforeUpdate` | Commit, before DOM write | `useLayoutEffect` |

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Runs | After paint (passive) | In commit, before paint |
| Blocks the paint | No | Yes |
| Use for | Sync, subscriptions, fetch, timers | Measuring / mutating DOM before the user sees it |
| On mount | Runs once (twice in dev Strict Mode) | Runs once (twice in dev Strict Mode) |

## 13. Code example

The whole ordering contract in one file — render order, effect order, cleanup order:

```jsx
function App() {
  useEffect(() => {
    console.log('effect: parent');
    return () => console.log('cleanup: parent');
  }, []);

  return (
    <>
      <Panel label="first" />
      <Panel label="second" />
    </>
  );
}

function Panel({ label }) {
  useEffect(() => {
    console.log('effect:', label);
    return () => console.log('cleanup:', label);
  }, []);

  return <div>{label}</div>;
}
```

Output (mount):

```text
effect: first
effect: second
effect: parent
```

Output (unmount):

```text
cleanup: parent
cleanup: first
cleanup: second
```

One cycle, two walks: effects bottom-up, cleanup top-down. Siblings keep render order
within their branch — and that order is exactly the one the second walk reuses.

> [!DEEPDIVE]
> Strict Mode's mount cycle on the tree above is: render both panels and `App` → commit →
> paint → effects (`first`, `second`, `parent`) → immediately unmount (cleanups in
> top-down order) → render again → commit → paint → effects again. So in dev you'd see each
> "effect" log twice with the cleanups between — which is how you *know* the second run is a
> detector, not a bug.

## 14. Performance notes

**When it matters:** effects block the main thread when they run, and they run after every
commit whose deps changed. A parent effect that re-subscribes on every render forces its
entire subtree's effects to re-run behind it. The ordering guarantee means a heavy child
effect always executes before its parent's, so a parent re-render you can't avoid still
costs the child's work first. Fix the *deps*, not the ordering.

**When it doesn't:** the two-walk scheduling itself is cheap — React walks fibers, not the
DOM, and skipped effects are just a comparison. Micro-optimising "how many effects run per
commit" by merging effects is the wrong trade: separate effects with honest deps re-run
*less* than one merged effect with a union of deps.

> [!NOTE]
> `useLayoutEffect` costs real paint time — it runs synchronously before the browser draws.
> Using it "just in case" makes every commit slower for no benefit. Default to `useEffect`;
> switch to layout only for a measured need (read a size, position a tooltip, kill a flash).

## 15. Debugging scenarios

**Scenario 1: "My parent's effect runs after my child's — is React broken?"**
No — that's the contract. The effect pass is a second walk, bottom-up. If you needed the
parent to act on the child's *committed DOM*, move the read into the child (or a layout
effect); don't try to reorder the walks.

**Scenario 2: "My fetch fires twice in development."**
Strict Mode. Mount → cleanup → mount means the effect body ran twice. If the cleanup
aborts the request, the second run is the one that matters; if there's no cleanup, the
double fetch is the leak detector working — add the abort.

**Scenario 3: "The tooltip flashes in the wrong position for one frame."**
The measurement is in a passive effect, so it happens after paint. Move it to
`useLayoutEffect` — it will run before the browser draws, and the flash disappears.

**Scenario 4: "Cleanup order broke a shared subscription."**
A parent and child both subscribe to the same store; on unmount, the parent's cleanup ran
first and closed the channel, then the child's cleanup tried to unsubscribe from it. Fix:
let the parent own the subscription and have the child *not* subscribe separately — one
owner per resource is the rule that survives any order.

**Scenario 5: "Logs show render happening twice for one state change."**
Could be Strict Mode (dev), a discarded render (concurrent), or two state updates batched
into one commit. Render being pure means double-render is invisible unless your render has
side effects — if it does, that's the bug, and Strict Mode just exposed it.

## 16. Quick revision notes

- Cycle: **render → commit → paint → effects** — effects are always after paint
- Render is pure and discardable; commit writes the DOM once; paint is when the user sees it
- Effects run in a second walk, **bottom-up**: children before parents
- Cleanup runs in **reverse order, top-down**: parent before child, on re-run and unmount
- Siblings keep render order within their branch in both walks
- Strict Mode (dev only): mount → cleanup → mount, to expose leaks and impure renders
- `useLayoutEffect` = commit phase, before paint — for measurements, not defaults
- Effects are one "after commit, if deps changed" mechanism — not the three lifecycle methods
- Old lifecycle map: `componentDidMount`→`[]`, `componentDidUpdate`→`[deps]`, `componentWillUnmount`→cleanup
- A double-run in dev is a signal; missing cleanup is the disease

## 17. Cheat sheet

```text
state change
   │
   ▼
render (pure, top-down, may repeat) ───────────────┐
   ▼                                                 │
commit (DOM written once, refs attached)             │  Strict Mode (dev only):
   ▼                                                 │  repeat the whole cycle, then
paint (user sees it)                                 │  extra mount → cleanup → mount
   ▼                                                 │
effects (bottom-up: children → parents) ◄────────────┘
   │  deps changed? → cleanup(old) → body(new)
   ▼
unmount: cleanup runs top-down (parents → children)
```

```jsx
useEffect(() => { /* open */ return () => { /* close */ }; }, [deps]);
//            ↑ after paint, child-before-parent   ↑ before next run & at unmount, parent-before-child
```

## 18. Key takeaways

> [!RECAP]
> - One state change = render → commit → paint → effects; effects are always post-paint
> - Render is pure and discardable; commit happens exactly once; that's why effects live outside render
> - Effects run child-before-parent — a second walk, so parents find children already mounted
> - Cleanup runs parent-before-child at unmount — teardown from the top, so no child fires into a dead resource
> - Strict Mode double-invokes mount effects in development to catch leaks and impure renders; production is unaffected
> - `useLayoutEffect` is the pre-paint commit-phase tool for DOM measurement — not a default
> - Effects are not the old lifecycle methods: one mechanism covers mount, update and unmount
> - Fix deps, not ordering — the walks are cheap; the bodies they schedule are not

## Check your understanding

Answer these without looking back.

1. Name the four phases of a render cycle and what is guaranteed to happen exactly once.
2. Why do child effects run before parent effects — and which walk makes that true?
3. What order does cleanup run in at unmount, and why is it the reverse of the effect pass?
4. What does Strict Mode do, exactly, and which bug does it catch that nothing else can?
5. Map `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` onto modern equivalents.
6. When would you reach for `useLayoutEffect`, and what does it cost?
7. Your dev logs show a fetch firing twice. What are the two possible causes, and how do you tell them apart?

## What's Next

**Lesson 60 — useRef.** A mutable value that survives renders without causing one — the
escape hatch that fixes the stale-closure trap, reads DOM nodes, and keeps identity stable
where `useState` would re-render.
