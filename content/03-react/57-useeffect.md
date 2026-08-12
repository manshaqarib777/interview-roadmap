# Lesson 57 — useEffect

**Interview importance:** ⭐⭐⭐⭐⭐ — the most misunderstood hook and the most asked. It is
not a lifecycle method.

`useEffect` is where the "I know React" interviews start separating people. Almost every
candidate has used it; very few can say what it actually does. That's the gap this lesson
closes: an effect is a function React runs *after* it has committed the render — nothing
more, and nothing less.

Get this one right and Lessons 58, 59 and everything after it build on solid ground. Get it
wrong and you'll confidently say "that's like `componentDidMount`" and the interviewer will
quietly write you off.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain, in one sentence, what `useEffect` actually does
- Separate *effects* (after paint, may be skipped) from *events* (user-triggered, never skipped)
- Trace the two-step model: render → commit → effects
- Explain why `[]` is **not** "run once like `componentDidMount`"
- Describe what cleanup is for and when React calls it
- Diagnose a stale-closure bug and fix it (from Lesson 5)

## 1. One-line definition

**`useEffect(fn, deps)` schedules `fn` to run after the browser has painted the render
whose commit finished — and re-runs it only when a dependency changes.**

## 2. Mental model

An event handler answers a user: *clicked → do this now*. An effect answers the render: *the
UI just changed → now, and only if it's worth doing, sync with the outside world*.

Events are eager — React *must* run them, or the click did nothing. Effects are *scheduled* —
React runs them when it gets a spare moment after the paint, and skips them entirely when
nothing they depend on changed. If the click handler is the short-order cook taking orders,
the effect is the dishwasher that runs at the end of every shift, but only when dishes
actually appeared.

## 3. Visual flow

```text
        state/props change
                │
                ▼
        ┌─────────────────┐
        │ 1. Render       │  compute the new JSX
        └─────────────────┘
                │
                ▼
        ┌─────────────────┐
        │ 2. Commit to DOM│  browser paints
        └─────────────────┘
                │
                ▼
        ┌─────────────────────┐
        │ 3. Run effects       │  paint is already on screen —
        │    (passive effects) │  this must not block it
        └─────────────────────┘
```

Dependencies changed since the last commit? Run `fn` (after running any cleanup from the
previous run). Nothing changed? **Skip it.** The skipping is the whole point — that's what
makes `useEffect` different from "a function that runs every render".

> [!NOTE]
> Step 3 also runs on the very first commit. First mount is just "dependencies went from
> *nothing* to *the initial values*", which counts as a change. That single fact is why
> people reach for `componentDidMount` analogies — and why those analogies lie (Section 5).

## 4. How it works

```jsx {5}
function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUser(data);   // ignore if a newer render already started
      });

    return () => { cancelled = true; };  // cleanup
  }, [userId]);
  // ...
}
```

```narrate
5: the effect body runs after every commit where userId changed — including the first
11: if a newer render superseded this one, React runs the cleanup first, so the stale
   fetch can no longer set state
```

Three moving parts, and the whole hook is these three things:

1. **The body** runs after every commit where the dependencies changed (the first commit
   always counts).
2. **The cleanup** — the function you return — runs before the body re-runs and before
   unmount, to undo whatever the body did.
3. **The dependency array** decides *whether* the body is worth re-running.

The effect never runs inside the render. That's what makes it safe to read and set state
there without the render/effect loop you'd get from running side effects during render.

> [!TIP]
> Add the `cancelled` flag (or an `AbortController` — Section 15) to every async effect that
> writes state. A request from an old render finishing late is a state update on an unmounted
> component, and React logs it as a warning.

## 5. Why `[]` Is Not "run once like `componentDidMount`"

The empty array says: *this effect has no dependencies, so nothing can ever change about
what it does — run it on the first commit and then never again.* It is **not** a lifecycle
switch. It's the dependency comparison coming out empty.

The evidence that they're different ideas:

- **Effects run after paint**; `componentDidMount` ran during commit, before the browser
  painted. The very first thing your `[]` effect does may flash a frame of its own making.
- **Effects re-run in Strict Mode** (Lesson 59), twice on mount in development — a real
  lifecycle method never would.
- **Effects run cleanup** before they ever run again. React's contract is *every effect
  call has exactly one matching cleanup call* — `componentDidMount` had no such pairing.

The single sentence that answers the question:

> *"An empty dependency array means 'nothing this effect reads ever changes', so React runs
> it once and skips it forever. 'Run once like `componentDidMount`' is a coincidence that
> happens to look similar — the mechanism is the dependency comparison, not the lifecycle."*

## 6. Real project usage

| When you reach for `useEffect` | Typical shape |
|---|---|
| Fetch on mount / on id change | `fetch` + `cancelled` flag or `AbortController`, cleanup aborts |
| Subscribe to something external | `store.subscribe(listener)` in the body, `unsubscribe()` in cleanup |
| Sync a non-React thing | set `document.title`, update a charting lib, push to analytics |
| Timer / polling | `setInterval` in the body, `clearInterval` in cleanup |
| Debounced input sync | start `setTimeout` in the body, `clearTimeout` in cleanup |

```jsx
function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => { document.title = previous; };
  }, [title]);
}
```

Every one of these is the same contract: *do something to the outside world, then undo it
when the dependencies change or the component leaves.* If there's nothing to undo, there's
no cleanup — `return;` nothing.

## 7. Interview explanation

> `useEffect(fn, deps)` runs `fn` after React has committed a render and the browser has
> painted. It re-runs only when something in `deps` changed since the last commit, and it
> always runs on the first commit.
>
> The returned function is cleanup — React calls it before re-running the effect and before
> unmount, so the effect can undo what it did: clear a timer, abort a fetch, remove a
> subscription.
>
> Crucially, it's not a lifecycle method. It's a way of saying "this work belongs after the
> render, and it's only worth doing when these values change."

## 8. Common mistakes

**❌ Mistake 1: Effects for user events**

```jsx
const [query, setQuery] = useState('');

// An event, written as an effect — fires after the paint, not on the keystroke
useEffect(() => {
  setSearchResults(search(query));   // ❌ render → effect → render
}, [query]);
```

A keystroke should call `setSearchResults(search(query))` **in the handler**. The effect
version double-schedules the work and makes the update a render behind.

**❌ Mistake 2: The stale closure (Lesson 5)**

```jsx {4}
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);  // ❌ stuck at 1
  return () => clearInterval(id);
}, []);
```

The empty array means the closure is created once, on the first render, and never rebuilt —
it captured `count` as `0` forever. That's the `var` loop from Lesson 1 wearing a hook. Fix
it by reading state through the updater, adding `count` to the deps, or using a ref
(Lesson 60):

```jsx
setCount((prev) => prev + 1);       // ✅ never reads the captured value
```

**❌ Mistake 3: Setting state in every effect body**

```jsx
useEffect(() => {
  const doubled = count * 2;        // ❌ derived value, not an effect
  setDoubled(doubled);
}, [count, doubled]);
```

Derived state belongs in the render body (`const doubled = count * 2`), not in an effect
that triggers another render that retriggers the effect. Effects exist to sync with *things
outside React*, not to compute things inside it.

**❌ Mistake 4: Object/array in the dependency array**

```jsx
useEffect(() => { /* … */ }, [{ id }]);   // ❌ new object every render → infinite loop
```

A fresh object literal is a new reference every render (Lesson 6), so this effect never
stops re-running. Deps are compared with `Object.is`, and `Object.is({}, {})` is `false`.
Lesson 58 owns this one.

**❌ Mistake 5: Not reading the docs' escape hatches**

`useEffect` is for **synchronising with external systems**, not for:
- reacting to a state change with another state change (that's deriving, or an event),
- doing work the user *asked* for (that's an event handler),
- caching (that's `useMemo`), or
- storing mutable values (that's `useRef`).

> [!PITFALL]
> Every `useEffect` with a dependency on an *effect-made* state is a bug in waiting. If
> effect B re-runs because effect A set state, ask whether B could be derived from the same
> source instead.

## 9. Best practices

✅ Write effects as **syncs** — "when `deps` change, make the outside world match"

✅ Put the data the effect reads in the dependency array — honestly and completely

✅ Return a cleanup for every effect that opens something (timer, subscription, socket, fetch)

✅ Derive values during render; reserve effects for things outside React

✅ Use the functional updater (`setCount(prev => prev + 1)`) to avoid stale reads

❌ Don't use effects to respond to events — handlers are eager, effects are post-paint

❌ Don't set state based on state in an effect when the value can be derived

❌ Don't omit a dependency just because "it never changes" — `[]` means *never re-run*

## 10. Interview questions

**Q1. What does `useEffect` do?**

> It lets a component synchronise with something outside React after the render is
> committed and painted. You pass a function and a dependency array; React runs the function
> after every commit where the dependencies changed, and skips it otherwise. The function
> can return a cleanup that React runs before the next run and on unmount.

**Q2. What is the dependency array for?**

> It's the comparison input that decides whether the effect re-runs. React diffs it against
> the previous render's array using `Object.is`; if any entry changed, the effect runs.
> The first render always runs because there's nothing to compare against.

**Q3. What does an empty dependency array mean?**

> "This effect reads nothing from the render, so nothing can ever change about it." React
> runs it after the first commit and then skips it forever. It is not a
> `componentDidMount` replacement — that's a lifecycle method, and this is a dependency
> comparison that happens to come out empty.

**Q4. What is cleanup in `useEffect`?**

> A function returned from the effect body that undoes what the body did — clears the timer,
> aborts the fetch, removes the subscription. React calls it before re-running the effect
> and when the component unmounts, so there's never a window where the old effect's
> resources leak.

**Q5. What is the difference between an event handler and an effect?**

> An event handler answers a user action and runs synchronously in response. An effect runs
> after the render, post-paint, and is *skippable* — if nothing it depends on changed, it
> doesn't run. If the work is in response to a user action, it's an event; if it's keeping
> the outside world in sync with the render, it's an effect.

**Senior follow-up: Why is it wrong to say `useEffect` "reacts to state changes"?**

> Because that framing invites reading state and setting more state in the effect, which
> produces the render → effect → render loop. The correct framing is sync: the effect body
> makes an external system match the latest props and state, and the dependency array
> describes *what changed* so React knows whether the sync is needed.
>
> Following from that, if two state values are causally linked, I derive one from the other
> instead of effecting it — derived values during render are free and can't loop.

## 11. Follow-up questions

**When exactly does the effect body run relative to the browser paint?**

> After React has committed the DOM changes and the browser has painted. Effects are
> *passive* — the paint is never blocked waiting for them, which is why the browser's own
> updates stay responsive.

**Can an effect run multiple times? How many?**

> As many times as its dependencies change, plus once on mount. There's no upper bound —
> every commit with a changed dependency re-runs the body (and the previous cleanup first).
> In development, Strict Mode (Lesson 59) also runs mount effects twice to surface missing
> cleanup.

**How would you debounce a fetch with `useEffect`?**

> Put the fetch in the body with `setTimeout`, and have the cleanup `clearTimeout`. When the
> user types, the dependency changes, the cleanup cancels the pending timer, and only the
> last keystroke's fetch actually fires.

**What happens if the effect has side effects inside the render phase?**

> It corrupts React's mental model. Render must be pure — it can be re-run, thrown away, or
> interleaved with other work. A side effect there could run twice, run with stale data, or
> run for a render that's never committed. That's exactly why effects are deferred to after
> commit.

**Why does a `[]` effect see stale state in a callback, and what are the fixes?**

> Because the effect body is a closure created during the first render, capturing the first
> render's state (Lesson 5). The fixes: don't read the captured value at all
> (`setCount(prev => prev + 1)`), add the value to the dependencies so the closure is
> rebuilt, or read through a ref (Lesson 60) when the value must be fresh inside a
> long-lived callback.

## 12. Comparison table

| | Event handler | `useEffect` |
|---|---|---|
| Trigger | User action | Commit of a render |
| Timing | Synchronous, eager | After paint, scheduled |
| Skippable | Never — the action happened | Yes — deps unchanged |
| Purpose | Respond to the user | Sync with the outside world |
| Knows the latest render? | It's created per render | Only if deps are honest |

| | `componentDidMount` (old) | `useEffect(fn, [])` |
|---|---|---|
| When it runs | During commit, before paint | After commit, after paint |
| Runs twice in dev Strict Mode | No | Yes |
| Has a paired cleanup | No | Yes |
| Semantics | Lifecycle method | Dependency comparison that came out empty |

## 13. Code example

A subscription, the textbook effect: open in the body, close in the cleanup, dependency
declared.

```js
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set: (next) => { state = next; listeners.forEach((l) => l(state)); },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  };
}

const store = createStore({ unread: 0 });
const unsub = store.subscribe((s) => console.log('unread →', s.unread));

store.set({ unread: 1 });
store.set({ unread: 2 });
unsub();               // the cleanup — React calls this before re-run and on unmount
store.set({ unread: 3 });  // nobody is listening anymore

console.log('still reachable:', store.get().unread);
```

Output:

```text
unread → 1
unread → 2
still reachable: 3
```

In a component this is the whole pattern:

```jsx {2,6}
useEffect(() => {
  const unsubscribe = store.subscribe(() => setUnread(store.get().unread));
  return unsubscribe;            // exact same subscribe/cleanup pairing
}, []);
```

The `subscribe` returns the unsubscriber, the effect returns it straight back to React, and
React owns the lifecycle from there.

## 14. Performance notes

**When it matters:** the browser paints before effects run, so a slow effect body never
blocks the initial paint — but it *does* hold the main thread afterwards, and it runs on
every dependency change. A heavy effect (big fetch, expensive sync) with a missing
dependency re-runs constantly and stutters. Fewer, honest dependencies are a real
perf lever.

**When it doesn't:** micro-optimising an effect body that runs once on mount is pointless.
The cost of an effect is mostly the work in the body, not the scheduling — skipping an
unnecessary run saves that work, and that's the only thing to optimise.

> [!NOTE]
> `useEffect` **never** skips the first run, so it can't replace `useMemo` for "compute this
> once". If the value is used during render, deriving it (or `useMemo`) is the tool; the
> effect's deferral would make the UI render without the value.

## 15. Debugging scenarios

**Scenario 1: "The effect runs way more often than it should."**
Look at the dependency array first. An object or array literal in deps is a new reference
every render (Lesson 6) — `Object.is` sees a change every time. Fix: depend on the primitive
inside it, memoise the object, or move the object creation out of the render entirely.

**Scenario 2: "The interval fires but the count never goes past 1."**
That's the stale closure (Lesson 5). `[]` froze the closure at the first render, so every
tick reads `0`. Use the functional updater or add `count` to the deps. Expected when a
warning-free console shows the interval still alive.

**Scenario 3: "Fetch data from an old render just overwrote the new data."**
The cleanup is missing or the request isn't cancellable. Add a `cancelled` flag or an
`AbortController`, and abort in the cleanup — the stale request then fails or no-ops instead
of winning the race:

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch(() => {});            // AbortError on cleanup — swallow it
  return () => controller.abort();
}, [userId]);
```

**Scenario 4: "React warns about a state update on an unmounted component."**
The effect that sets state has no cleanup. Either the async work must be cancelled (above),
or the subscription must be removed — the warning *is* the missing cleanup, in so many words.

## 16. Quick revision notes

- `useEffect(fn, deps)`: run `fn` **after paint**, only when `deps` changed (first commit always counts)
- Render is pure; effects are where the impure sync lives — never run side effects during render
- `[]` means "nothing this effect reads changes" → run once — it is **not** `componentDidMount`
- Every effect call has exactly one cleanup call: before the next run and on unmount
- Deps are compared with `Object.is` — objects/arrays in deps loop forever (Lesson 6)
- Effect closures capture the render they were created in — the stale-closure trap (Lesson 5)
- Events are eager and never skipped; effects are scheduled and skip when deps are unchanged
- Not for: user events, derived state, caching, mutable values — those are handlers, render math, `useMemo`, `useRef`

## 17. Cheat sheet

```jsx
// The one shape to have memorised:
useEffect(() => {
  // 1. do the thing — subscribe / fetch / start timer / set document.title
  return () => {
    // 2. undo the thing — unsubscribe / abort / clearInterval / restore title
  };
}, [dep1, dep2]);   // 3. re-run only when one of these changes
```

```text
deps changed? ──yes──▶ cleanup (old) → run body (new) → [wait for next commit]
     │
     └─no──▶ skip entirely
```

## 18. Key takeaways

> [!RECAP]
> - An effect is a function React runs **after the commit, after the paint** — not during render
> - It re-runs only when a dependency changed; the first commit always runs it
> - `[]` is the dependency comparison coming out empty, **not** a `componentDidMount` switch
> - Events are eager and never skipped; effects are scheduled and skippable
> - Cleanup runs before every re-run and on unmount — timers, subscriptions and fetches get undone there
> - Effect closures capture the render they were born in: the stale-closure trap from Lesson 5
> - Objects and arrays in deps are new references every render → infinite loops (Lesson 6)
> - Effects sync with the outside world; they don't compute values or answer user actions

## Check your understanding

Answer these without looking back.

1. Say exactly when an effect body runs — and when it's skipped.
2. Why is `[]` not equivalent to `componentDidMount`? Name two differences that prove it.
3. What is cleanup for, and on which two occasions does React call it?
4. An interval in a `[]` effect never counts past 1. Explain the mechanism (Lesson 5) and give the fix.
5. Is "fetch the user's profile when the search box changes" an effect or an event? Justify it.
6. When would you set state inside an effect, and when would you refuse to?
7. Why must render stay pure, and what would an effect running during render break?

## What's Next

**Lesson 58 — Dependency Arrays & Cleanup.** What belongs in the array, why reference
equality decides everything (Lesson 6), why objects in deps loop forever, and how the rules
of `react-hooks` keep you honest.
