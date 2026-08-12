# Lesson 99 — Top React Interview Questions

**Interview importance:** ⭐⭐⭐⭐⭐ — the round that decides React screens at every level.

Rehearsal. You have covered rendering and reconciliation (Lesson 51), keys (Lesson 52),
`useEffect` (Lesson 57), `useMemo` and `useCallback` (Lessons 61–62), context (Lesson 63)
and error boundaries (Lesson 76). Knowing these and saying them under pressure are
different skills — this lesson is where you practise the second one.

React interviews are the most predictable of the rounds. The same dozen questions come up
again and again, because they separate people who used React from people who understood it.
Say every answer out loud — silently reading them is not rehearsal.

## Learning Objectives

By the end of this lesson you should be able to:

- Answer the top React interview questions out loud, from memory
- Explain why `setState` batches, why keys matter, and why context re-renders everything
- Give the "then a senior would add" layer for every question
- Walk through re-render behaviour for any small component you are shown
- Rehearse the harder follow-ups so no question in the round feels like a surprise

## 1. One-line Definition

**This is a rehearsal round: the most-asked React interview questions from Lessons 47–82, with model answers worth saying out loud.**

The interview samples the render model — state, effects, reconciliation, memoisation — and the answers are all consequences of that model.

## 2. Mental Model

Think of this lesson as the **mock board exam** after the course.

The earlier lessons taught the mechanism — what happens when state changes, why the DOM
node survives, what `useEffect` is actually for. This lesson is the mock: the exact
questions, timed, out loud, with someone scoring you. You will flub some here. That is the
point — flubbing the mock is free; flubbing the real thing is not.

## 3. Visual Flow

```text
The rehearsal loop — do this for every question:
                                      ┌──────────────────────┐
                                      │                      ▼
  ┌────────────┐      ┌────────────┐  │   ┌──────────────────────────┐
  │  Read the  │ ───▶ │  Say your  │──┘   │  Compare with the model  │
  │  question  │      │  answer    │      │  answer — mark the gap   │
  └────────────┘      └────────────┘      └────────────┬─────────────┘
      (cover the answer)     (out loud)                │
                                                       ▼
                                        ┌──────────────────────────┐
                                        │  Re-say the answer       │
                                        │  until it is clean and   │
                                        │  complete — then move on │
                                        └──────────────────────────┘
```

If you cannot say it cleanly twice in a row, you have not finished the question.

## 4. How It Works

Every React interview question is a consequence of the render model from Lesson 51. The
mapping:

| Theme | Questions | From lessons |
|---|---|---|
| State | `useState` batching, updates being async | 50 |
| Rendering | rendering vs re-rendering, reconciliation, keys, virtual DOM | 51, 52, 56 |
| Effects | `useEffect` deps, cleanup, stale closures | 57, 58 |
| Performance | `useMemo` vs `useCallback`, when not to optimise | 61, 62, 71 |
| Flow & architecture | controlled forms, lifting state, context re-renders, error boundaries, custom hooks, rules of hooks | 54, 55, 63, 76, 65, 66 |

The interview is a sample of these themes. When you cannot answer, return to the lesson —
not to memorise this page.

### The React answer shape

The React answer has a fourth move — most React questions are "what happens when…" and the
mechanism *is* the answer:

```text
1. DIRECT   — what happens, in one sentence
2. WHY      — the render-model mechanism underneath
3. EVIDENCE — a concrete example or trade-off
4. BRIDGE   — the senior layer (what it means for real apps)

"setState is asynchronous and batched — React queues the update, and within one event
 it processes them together. In React 18 the batching even crosses async boundaries.
 The reason is simple: React may re-render after the batch, once, instead of after
 each update. That is why two setStates in one click cost one render."
```

## 5. Real Project Usage

The same questions are the vocabulary of every React code review:

| Question being asked | Where it comes up at work |
|---|---|
| "Why are keys important?" | The list that loses focus, scroll or input state |
| "Explain controlled forms" | Every form in the product, and why you never read the DOM |
| "Why does context re-render?" | A provider value object created inline, re-rendering the whole tree |
| "`useMemo` vs `useCallback`?" | Why a memoised child still re-renders every time |
| "Error boundaries" | The blank white screen a single thrown error caused in production |
| "Custom hooks" | Every shared piece of logic extracted across components |

## 6. Interview Explanation

> The top React questions all trace back to the render model: state updates are batched
> and async; a render recomputes the element tree and reconciliation diffs it; keys tell
> reconciliation how to treat list items; effects are for synchronisation, not lifecycle;
> memoisation is about reference equality, not speed. The strong answer names the mechanism
> and then says what it means for a real app.

## 7. Senior-Level Insights

- **Answer from the model, not the checklist.** If you can re-derive "keys matter" from how reconciliation matches positions, you can answer any variant of the question. Candidates who memorised "always use keys" fold the moment the question is phrased differently.
- **Say what you would actually do, with a trade-off.** "I'd memoise here because the child is expensive and the props are stable — and I'd measure first" is worth more than the pure theory.
- **Name the failure mode.** "Index keys break when the list is reordered or filtered — the DOM node survives but shows the wrong item" is the answer interviewers are listening for.
- **Bridge to Lesson 6 constantly.** Reference equality is the mechanism under half of React's questions — new objects each render, memo defeats, effect deps firing. Saying "this is Lesson 6's reference equality" lands very well.
- **When you do not know, say what you do know** — and how you would verify it.

## 8. Common Mistakes

- **Calling `useEffect` a lifecycle method.** It is a synchronisation mechanism, not
  `componentDidMount`. That framing mistake is visible from the first sentence.
- **Treating `useMemo`/`useCallback` as performance by default.** They trade memory and
  bookkeeping for skipping work that may be cheap. The senior answer includes when *not*
  to use them.
- **Blaming "re-renders" without naming the mechanism.** "It re-renders because the parent
  re-rendered" is a description; "…and it re-renders because reconciliation re-runs children
  by default when the parent renders" is an explanation.
- **Forgetting the render-phase purity rule.** Mutating during render, or reading the DOM,
  is undefined behaviour — Strict Mode double-invokes precisely to catch it.
- **Answering keys with "React needs them".** Say *why*: reconciliation matches siblings by
  position, and a stable key tells it which item is which.
- **Not predicting behaviour.** Interviewers ask "what happens when I click this?" — train
  by predicting before you check.

## 9. Best Practices

✅ Put side effects in effects, and clean them up — intervals, subscriptions, listeners

✅ Use stable, unique keys for list items; avoid index keys for reorderable lists

✅ Derive values in render; lift state only when siblings actually share it

✅ Memoise with `useMemo`/`useCallback` on measured hot spots — never preemptively everywhere

✅ Keep provider values stable (wrap in `useMemo`) or split contexts that change at different rates

✅ Prefer functional updates (`setCount(prev => prev + 1)`) over reading captured state

❌ Don't put an object literal in a dependency array — new reference every render (Lesson 6)

❌ Don't mutate props or state during render

❌ Don't reach for context to solve every prop-drilling annoyance without considering re-renders

## 10. Interview Questions

**Q1. How does `useState` work, and why are updates asynchronous?**

> `useState` gives you a value and a setter. The setter queues an update; React does not
> apply it synchronously. Within one event, React batches all the queued updates and applies
> them together before the next render — so two `setCount` calls in one click cause one
> render, and you never see the intermediate value. The setter also accepts a function of
> the previous value, which is the safe way to update when the new value depends on the old.

**Q2. What is batching, and how does React 18 change it?**

> Batching means grouping multiple state updates into a single render. Before React 18,
> updates were batched inside event handlers but not inside promises or `setTimeout`.
> React 18 batches everywhere, automatically — updates in a promise callback, a timeout or a
> native event all get grouped. That is why the "two renders instead of one" behaviour
> changed, and why people migrating sometimes see different render counts for the same code.

**Q3. What happens when a component's state changes?**

> React schedules a render. On render it calls the component function with the new state,
> gets a new element tree, and reconciles it against the previous tree. Same element types
> are kept and updated in place; changed types get unmounted and remounted. The diff
> produces a list of DOM mutations, committed synchronously, then effects run. And if the
> new tree diffs to nothing, no DOM work happens at all — rendering is not the same as
> touching the DOM.

**Q4. What is the virtual DOM?**

> React's internal model of the UI: a plain-object tree that describes what should be on
> screen — elements with type and props, not real DOM nodes. When state changes, React
> builds a new tree and diffs it against the previous one — reconciliation — producing a
> minimal list of real DOM mutations. The important part: the virtual DOM is what makes
> declarative `UI = f(state)` possible. It is not automatically a speed trick — the
> comparison itself costs work, which is why memoisation exists.

**Q5. Why are keys important in lists?**

> Reconciliation matches siblings by position. Without keys, removing the first item makes
> React "update" the remaining items into the wrong slots — the classic focus, scroll and
> input-state bugs. A stable key tells React *which item is which*, so it can reuse the
> right DOM node and its state when the list is reordered or filtered. The key must be
> unique among siblings and stable across renders.

**Q6. Why is using the array index as a key a problem?**

> Index keys are stable while the list is untouched — and wrong the moment it changes.
> Reorder two items and React keeps the DOM nodes (they have the same indices) but shows
> the wrong content; filter the list and the first items keep their DOM state, including
> input values and focus. Index keys are fine for a static list that never reorders and
> never filters — the moment either happens, they break.

**Q7. What is `useEffect` for?**

> Synchronising a component with something outside React — subscriptions, timers, network
> fetches, DOM APIs. The effect runs after the commit, and its cleanup runs before the next
> effect and on unmount. It is not a lifecycle method: it re-runs when the dependencies
> change, and an empty dependency array means "run after the first render, clean up on
> unmount" — which is a consequence of the rule, not a special mode.

**Q8. Why does `useEffect` with `[]` see stale state?**

> Because the effect body is a closure created during the first render, capturing that
> render's state. With `[]` it is never re-created, so it keeps reading the old value
> forever — the `var`-loop bug from Lesson 1, wearing a hook. The fixes rhyme too: stop
> reading the captured value (`setCount(prev => prev + 1)`), add the value to the
> dependencies so the closure is rebuilt, or hold the value in a ref for long-lived
> callbacks.

**Q9. What is the difference between `useMemo` and `useCallback`?**

> Both cache a value across renders, keyed by a dependency array. `useMemo` caches the
> *result* of a computation — it skips re-running the function when the deps are unchanged.
> `useCallback` caches the *function itself* — it returns the same function reference
> until the deps change. They are the same mechanism; `useCallback(fn, deps)` is
> `useMemo(() => fn, deps)`. You reach for them when reference equality matters: a stable
> callback so a memoised child skips re-rendering, or an expensive computation that should
> not repeat.

**Q10. When should you NOT use `useMemo` or `useCallback`?**

> By default. Memoisation costs memory and bookkeeping, and skipping a cheap computation or
> a cheap re-render saves nothing. I reach for them when I can measure that a child is
> expensive and its props are stable, or when the same reference is needed for effect deps.
> The honest senior answer: most memoisation in most codebases is unnecessary — and the
> reference trap means new object props defeat it anyway, so it often does nothing at all.

**Q11. Why does every component re-render when context changes?**

> Because the provider value is read during render, and when it changes, every component
> consuming that context re-renders — not just the ones that use the changed field. The
> value is compared by reference (Lesson 6): a new object every render is a change every
> render. The fixes are stabilising the value with `useMemo`, splitting contexts that
> change at different rates, or moving the consuming components under a memoised boundary.

**Q12. What is the difference between props and state?**

> Props are data passed down from a parent — the component does not own them and should
> never mutate them. State is data the component owns and can update with its setter. The
> rule that matters: changing props re-renders the component; changing state re-renders it
> too — but the *source* differs. Props flow one way, and the only way a child tells a
> parent anything is by calling a callback the parent passed down.

**Q13. What are controlled and uncontrolled components?**

> A controlled component's value comes from state and updates through a handler —
> `value={value} onChange={setValue}` — React owns the value. An uncontrolled component
> lets the DOM own it and reads it through a ref. I default to controlled: the input's
> value is in state, so validation, formatting and disabling all work in the same data
> flow. I use uncontrolled only for the rare case where no logic needs the value.

**Q14. What is lifting state up?**

> Moving state from a component into the nearest common parent of the components that need
> it, then passing it down as props — along with callbacks to change it. Siblings cannot
> share state directly, so the parent becomes the source of truth. The inverse matters too:
> if only one child needs state, keep it in that child. Lifting is for *shared* state; the
> failure mode is lifting everything and re-rendering the world.

**Q15. What is an error boundary?**

> A class component implementing `componentDidCatch` (or the static
> `getDerivedStateFromError`) that catches errors thrown by its children during rendering,
> in lifecycle methods and in constructors, and renders a fallback instead of crashing the
> whole tree. Two limits to know: it does not catch errors in event handlers (those need a
> `try/catch`), and it does not catch errors in itself — and because it must be a class
> component, there is no hook-based version yet.

**Q16. What are custom hooks?**

> Functions that start with `use` and call other hooks — the way you extract reusable
> stateful logic across components. They compose the same hooks you already use, so two
> components calling the same custom hook each get their own isolated state. They are the
> main React composition primitive: instead of higher-order components or render props, a
> custom hook packages the logic and returns plain values the component consumes.

**Q17. What are the rules of hooks?**

> Two rules. First, only call hooks at the top level — never inside conditionals, loops or
> nested functions. Second, only call them from React function components or other custom
> hooks. The reason is mechanical: React stores hook state on the fiber in a linked list
> keyed by *call order*, so every render must call the same hooks in the same order.
> Skip one because of a conditional, and every hook after it reads the wrong state.

**Q18. How do you update state when the new value depends on the old?**

> With the functional update: `setCount(prev => prev + 1)`. The updater receives the latest
> value, so it is safe under batching — two functional updates in one event each build on
> the previous result. Reading the captured `count` instead, in the same event, computes
> `0 + 1` twice. The same principle fixes stale effects and stale closures everywhere:
> prefer the updater over the captured value.

**Senior follow-up: Walk through what happens when you click a button that calls two `setState`s.**

> The click handler runs, and both setters queue updates. React batches them — they apply
> together, in order, in one pass — then schedules a single render. The component function
> runs once with the merged state, not twice with intermediate values. If either updater is
> functional, it receives the result of the previous one. The visible consequence: one
> render per event, not two, which is exactly why the batching exists.

## 11. Follow-up Questions

**Why does `React.memo` sometimes make things slower?**

> Because comparing props is not free, and the comparison can fail uselessly. Every render
> of the parent, React must shallow-compare the props — and if the parent passes a new
> object, array or function each render (Lesson 6), the comparison fails every time, so the
> child re-renders anyway *and* you paid for the compare. `React.memo` only pays off when
> props are mostly stable and the child is genuinely expensive.

**How do you prevent a child from re-rendering when the parent re-renders?**

> First, ask whether the re-render matters — most are free. If it does, the tools are
> `React.memo` on the child, stable props (`useCallback`/`useMemo`) so the memo's compare
> passes, moving state down so fewer components are under the changing parent, or passing
> the child as `children` so it is created outside the changing component. The children
> trick is the least known and often the cleanest.

**What is the difference between `useEffect` and `useLayoutEffect`?**

> Both run after the commit, but `useLayoutEffect` runs synchronously before the browser
> paints, while `useEffect` runs after paint. Layout effects are for reading layout —
> measuring the DOM and adjusting it in the same frame — which is why they exist. The
> guidance is to default to `useEffect`; `useLayoutEffect` is only for work that must
> happen before the user sees the frame, and it blocks paint, so it should be rare.

## 12. Comparison Table

| | `useState` | `useRef` | `useReducer` |
|---|---|---|---|
| Re-render on change | ✅ | ❌ | ✅ |
| Best for | Single values | Mutable values that must not trigger renders | Complex transitions |
| Update | Setter, functional form | `.current =` | `dispatch(action)` |
| Source | Component | Component | Component |

| | `useMemo` | `useCallback` | `React.memo` |
|---|---|---|---|
| Caches | A computed value | A function reference | Component render (skips) |
| Keyed by | Dependency array | Dependency array | Shallow prop compare |
| The trap | New deps defeat it (L6) | New deps defeat it (L6) | New object props defeat it (L6) |

| | Controlled | Uncontrolled |
|---|---|---|
| Value source | React state | The DOM |
| Read via | `value` prop + handler | `ref` |
| Validation/formatting | In the same data flow | Manual, after the fact |
| Default | ✅ | Rare |

## 13. Code Example

The batching gauntlet. Cover the answers, then read on.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
  };

  const handleFunctional = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>+1 (captured)</button>
      <button onClick={handleFunctional}>+2 (functional)</button>
    </div>
  );
}
```

Output (React 18, batching on):

```text
click "+1 (captured)":   count becomes 1   (both updates read the same captured 0)
click "+2 (functional)": count becomes 2   (each updater builds on the previous value)
```

Both clicks cause **one** render. The first click computes `0 + 1` twice because both
setters read the captured `count` from the render that created the handler. The second
click works because each functional updater receives the result of the previous one.

```narrate
5: reads the captured count from this render's closure — 0
6: same captured value — still 0, so the result is identical
9-10: each updater receives the latest value, so they chain: 0 → 1 → 2
16-19: one render per event; batching is why
```

## 14. Performance Notes

- **Rehearsal cost is time, and it is the cheapest investment in the module.** Ten minutes
  out loud per question beats an hour re-reading definitions silently.
- **The bottleneck is retrieval and phrasing, not knowledge.** Practise saying the answers.
- **Most re-renders are free.** A re-render is function calls and object allocation; the
  DOM only changes when the diff finds something. Saying this unprompted marks you as senior
  (Lesson 71 is entirely about when *not* to optimise).
- **Memoisation has a real cost.** Each `useMemo`/`useCallback` stores the cached value and
  the dependency array and compares them every render. That overhead is only worth it when
  the skipped work is measurably more expensive — the classic case being a memoised child
  with stable props.

## 15. Debugging Scenarios

**Scenario 1: "My input loses focus on every keystroke."**

The input is being replaced, not updated — almost always an unstable key or a changed
element type. Check the tree shape: an inline conditional switching between `<input>` and
`<textarea>`, or a list whose keys change each render, will destroy and remount the node,
and focus dies with it. Stable keys fix it.

**Scenario 2: "A child still re-renders after `React.memo`."**

The reference trap. The parent creates a new object, array or function each render, so the
memo's shallow compare fails every time — this is Lesson 6 wearing a hook costume.
Stabilise the reference with `useCallback`/`useMemo`, or restructure so the changing values
live below the memoised boundary.

**Scenario 3: "My effect fires on every render no matter the deps."**

An object or array in the dependency array. `[options]` where `options` is created in the
component is a new reference every render — the deps always changed. Either memoise the
value, or depend on the primitive fields inside it.

**Scenario 4: "State updates seem one render behind."**

You are reading state in the same tick you set it, before the batched render commits. The
value in the closure is still the old one. Use the functional updater if you need the new
value immediately, or read it after the render — in an effect keyed on that state.

## 16. Quick Revision Notes

- `setState` is async and batched — one render per event; React 18 batches everywhere
- Render = compute the tree; commit = apply the diff; effects run after commit
- Keys tell reconciliation which list item is which — stable, unique, never reorder-dependent
- Index keys break the moment a list reorders or filters
- `useEffect` is a synchronisation mechanism, not a lifecycle method
- Empty deps = closure from the first render — the source of stale state
- `useMemo` caches a value, `useCallback` caches a function — same mechanism, same reference trap
- Context changes re-render every consumer; stabilise the value and split fast-changing contexts
- Controlled: React owns the value; uncontrolled: the DOM owns it, read via ref
- Lift state to the nearest shared parent — and only when it is actually shared
- Error boundaries are class-only and miss event handlers
- Rules of hooks exist because hook state is indexed by call order
- Functional updates chain correctly under batching

## 17. Cheat Sheet

```text
ANSWER SHAPE:  direct → why → example → bridge to the render model

setState:      queued + batched → one render per event
               setCount(prev => prev + 1)  // chains safely

useEffect:     runs AFTER commit; re-runs when deps change
               cleanup before next effect + on unmount
               []  →  first-render closure (stale state lives here)

useMemo(fn, deps)   → caches fn's RESULT
useCallback(fn, deps) → caches fn ITSELF
React.memo(Comp)    → skips re-render when props shallowly equal

KEYS:          stable + unique among siblings
               index key is safe ONLY for static lists

CONTEXT:       value change → ALL consumers re-render
               fix: useMemo value · split contexts · children prop
```

## 18. Key Takeaways

> [!RECAP]
> - This is rehearsal: the render model is revision; the new skill is saying the answers out loud
> - Every question is a consequence of one model: batched state → render → reconcile → commit
> - `useState` is async and batched; functional updates chain; React 18 batches everywhere
> - Keys exist because reconciliation matches by position — index keys break on reorder
> - `useEffect` is synchronisation, and `[]` captures the first render forever
> - `useMemo` and `useCallback` are one mechanism gated by reference equality (Lesson 6)
> - Context re-renders every consumer; error boundaries are class-only; hooks are ordered by call
> - If you cannot say an answer cleanly twice, you have not finished the question

## Check your understanding

Answer these without looking back.

1. What happens, step by step, when a button click calls `setCount(c => c + 1)` twice?
2. Why does removing the first item of an unkeyed list break the rest — exactly?
3. Give a real situation where index keys are safe, and one where they break.
4. Why is `useEffect` not a lifecycle method — and what does `[]` really mean?
5. `useMemo` vs `useCallback`: same mechanism, different what?
6. Why does every consumer re-render when a context value object is recreated?
7. What does an error boundary catch, and what two things does it miss?
8. Why can hooks not go in conditionals — mechanically?

## What's Next

**Lesson 100 — Top Next.js Interview Questions.** The same rehearsal format for the App
Router: server vs client components, the boundary, caching and revalidation, server actions
and middleware — the questions that decide Next.js screens.
