# Lesson 60 — useRef

**Interview importance:** ⭐⭐⭐ — asked constantly, usually as the setup for a deeper question.

A mutable value that survives renders *without* causing one — that one sentence is the whole
hook. There are two distinct use cases, and mixing them up is the classic mistake: a **DOM
ref** (focus, scroll, measuring) and a **mutable value** (previous value, latest callback,
imperative handle). useRef is a more honest `this.field` for a function component.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why changing `.current` does not re-render, while changing state does
- Use a ref to focus an input and to scroll an element into view
- Keep a "previous value" ref updated across renders
- Explain why a ref is the escape hatch for a stale closure (from Lesson 5)
- Say exactly when a ref belongs in a dependency array — and when it doesn't

## 1. One-line definition

**A ref is a mutable box that persists for the component's lifetime, and changing its contents does not trigger a re-render.**

## 2. Mental model

Think of the component's **state** as a sticky note the component *sees*, and its **refs** as
a drawer it can always reach into without anyone being told. Writing to the sticky note
(`setState`) puts up a flag — React re-renders. Writing to the drawer (`ref.current`) changes
nothing visible, so nobody is notified.

`useState` is *change and notify*. `useRef` is *change and keep quiet*.

```text
     useState                    useRef
  ┌──────────────┐           ┌──────────────┐
  │   value      │           │   value      │
  └──────────────┘           └──────────────┘
        │                         │
     setState              ref.current = x
        │                         │
   re-render ✅             no re-render ❌
```

## 3. Visual flow

```text
render 1 ── useRef(0) ──► ref = { current: 0 }     state = 0
                            │  ▲                    │
        click → setState    ▼  │                    ▼
render 2 ── useRef(0) ──► ref = { current: 0 }     state = 1   re-render happened
                            │  ▲
        click → ref.current++▼  │
render 3 ── useRef(0) ──► ref = { current: 1 }     state = 1   NO re-render
```

One shared box across renders, mutated silently; state changed on render 2 and triggered
render 3, while `ref.current` changed on render 3 with no render at all.

## 4. How it works

`useRef` returns **the same object every render** — the identity from the first render is
stable, which is exactly why it is safe in a dependency array.

```js
// a faithful mental model, not React's actual code
function useState(initial) {                  // mock — state is one value per render
  let value = initial;
  return [
    value,
    (next) => { value = next; },              // setState, ignored here
  ];
}

function useRef(initial) {
  const ref = useState({ current: initial })[0]; // same object forever
  return ref;
}

const myRef = useRef(0);
myRef.current = 5;

console.log(myRef.current);
console.log(myRef === useRef(0));             // a NEW call returns a NEW ref
```

Output:

```text
5
false
```

React actually allocates the object once on the fiber and hands back the same reference on
every render. `ref.current` is just a property you may mutate freely.

```js
let renders = 0;

const ref = { current: 0 }; // one object
const a = ref;
const b = ref;

a.current = 5;

console.log(b.current);          // 5 — same object, both names see it
console.log(a === b);            // true
```

Output:

```text
5
true
```

A ref is that box: stable identity, mutable contents. State, by contrast, gives you a *new*
value each render.

## 5. Real project usage

| Use case | What you write |
|---|---|
| Focus on mount | `inputRef.current?.focus()` inside `useEffect` (Lesson 57) |
| Scroll into view | `listRef.current?.scrollIntoView({ behavior: 'smooth' })` |
| Measure the DOM | `node.getBoundingClientRect()` in a layout effect |
| Previous value | keep last render's value in a ref, update it every render |
| Latest value for a callback | a ref that always holds the newest state |
| Integrate non-React code | hold a D3 chart / map instance so the component owns it |

Two canonical examples — focus, then "previous value":

```jsx
function Autofocus() {
  const inputRef = useRef(null);              // DOM ref

  useEffect(() => {
    inputRef.current?.focus();                // runs once, after mount
  }, []);

  return <input ref={inputRef} placeholder="Search…" />;
}
```

```jsx
function PreviousCount({ count }) {
  const prevRef = useRef(count);

  useEffect(() => {
    prevRef.current = count;                  // update AFTER this render is painted
  });

  return (
    <p>
      Now: {count} — Before: {prevRef.current}
    </p>
  );
}
```

`prevRef` shows the *previous* render's value, because the effect runs after the render. One
shared box, read during render, written after render.

## 6. Interview explanation

> A ref is a stable object I can mutate without causing a re-render. I use it for two
> different things: holding a DOM node — focus, scroll, measuring — and holding a mutable
> value that should survive renders, like the previous value or the latest callback.
> Changing `ref.current` never re-renders; only state does. That's why a ref is the escape
> hatch when I need to remember something across renders without making React re-render.

## 7. Senior-level insights

- **Say "stable identity" out loud.** `useRef` returns the same object forever — that is the
  entire reason it is safe to leave out of a dependency array.
- **Distinguish the two use cases before writing code.** DOM refs go on elements; mutable
  values go anywhere. Interviewers love to hear you name both deliberately.
- **A ref is a mutation in a render-phobic world.** You already know to keep renders pure
  (Lesson 14). Reading `.current` during render is fine; *writing* it during render is a
  side effect — so write in effects or event handlers, not in render.
- **`useRef` is not "state without re-render".** It is "a place to put things that React
  must not know about." Reaching for it because state re-renders too often is a code smell;
  the fix is usually derived state (Lesson 55) or layout.
- **It is `this` for a function component.** Class `this.timerId` becomes `timerRef.current`
  — that's the migration one-liner.

> [!DEEPDIVE]
> React 19 lets you pass a function as the ref initialiser: `useRef(() => createConnection())`.
> The lazy initialiser runs once, and you even get cleanup (`ref.current = null` handled for
> you). Mention it as "React 19 added lazy ref initialisation" — it shows you follow the
> ecosystem.

## 8. Common mistakes

A few traps to recognise on sight:

- `setRef({ current: x })` — there is no `setRef`; and using `useState` to hold a ref
  re-renders, which defeats the whole point.
- **Writing during render** — render must stay pure:

```jsx
function Bad() {
  const countRef = useRef(0);
  countRef.current += 1;   // mutates during render: breaks StrictMode double-render
  return <span>{countRef.current}</span>;
}

function Good() {
  const countRef = useRef(0);
  useEffect(() => {
    countRef.current += 1; // write in an effect or an event handler instead
  });
  return <span>mounted {countRef.current} times</span>;
}
```

- **Refs in dependency arrays** — the identity never changes, so it adds nothing:

```jsx
useEffect(() => {
  something(elRef.current);
}, [elRef]);            // elRef is stable — this is noise
```

- **Expecting a ref change to re-render** — it never will. If the UI must update, the
  changing value belongs in state.

> [!PITFALL]
> When you mutate a ref *during render* and the component re-renders for another reason, the
> mutation re-runs too. In React StrictMode's double-render this reads like a genuine bug:
> values jump by two. Keep ref writes out of the render body.

## 9. Best practices

✅ Use a **DOM ref** to focus, scroll to, or measure a node

✅ Use a **mutable-value ref** for things that must survive renders silently: timers, previous values, latest callbacks

✅ Write to `.current` in event handlers and effects — never in the render body

✅ Leave refs out of dependency arrays — stable identity means they can't cause re-runs

✅ Read `.current` inside long-lived callbacks so you never see a stale value (Lesson 5)

❌ Don't use a ref where the UI must reflect the change — that's what state is for

❌ Don't render from `ref.current` and expect updates; rendering is driven by state and props

## 10. Interview questions

**Q1. What is `useRef` and what is it for?**

> A hook that returns a stable, mutable object. `ref.current` survives renders, and changing
> it does not cause a re-render. I use it for two things: referencing DOM nodes — focus,
> scroll, measurements — and holding mutable values that should persist across renders
> without triggering one, like the previous value or a timer id.

**Q2. Why doesn't changing a ref re-render the component?**

> Because nothing notifies React. A ref is an object whose identity is stable; mutating a
> property on it produces no new value, so React has nothing to compare and no reason to
> render. State re-renders precisely because `setState` hands React a *new* value and
> schedules an update.

**Q3. What is the difference between `useRef` and `useState`?**

> `useState` re-renders when you update it; `useRef` doesn't. They also differ in timing:
> state updates are async and batched, while `ref.current` is mutable immediately. State is
> for values the UI depends on; refs are for values React doesn't need to know about.

**Q4. How do you store the previous value of a prop?**

> Keep a ref. In an effect without a dependency array, which runs after every render, write
> the current value into `ref.current`. During the render, the ref still holds the previous
> render's value — so you can render `before` and the effect makes it `now` for next time.

**Q5. Can you use a ref to focus an input?**

> Yes. Pass it to the element's `ref` attribute, then in a mount effect call
> `inputRef.current?.focus()`. The optional chaining guards against the node being null on
> first render.

**Senior follow-up: When would you read a ref inside a `setTimeout` callback instead of reading state directly?**

> When the timeout was created once and lives across renders. A `setTimeout` created in a
> mount effect closes over the first render's state (Lesson 5), so it reads a stale value.
> If the timeout reads `ref.current` instead, it always sees the newest value, because the
> ref object is shared and mutated, not snapshotted. That's the "latest callback ref"
> pattern.

## 11. Follow-up questions

**What is a "latest ref" and why is it needed?**

> A ref you assign the newest value on every render or effect run. Long-lived callbacks —
> timeouts, listeners, sockets — were created once and captured old closures; routing them
> through `latestRef.current` lets them read current state without being re-created.

**Why is it safe to omit a ref from a dependency array?**

> Dependency arrays re-run effects when a value *changes*. A ref's identity never changes —
> it's the same object on every render — so it can never be the reason an effect re-runs.
> Including it is harmless noise; omitting it is correct.

**What happens if you read `ref.current` before the element is mounted?**

> You get `null`, because the ref's initial value is `null` until React attaches the node.
> That's why DOM work happens in `useEffect` (after mount) and why the optional chaining
> `?.` is idiomatic.

**How is a ref different from a module-level variable?**

> A module variable is shared by every component instance in the app. A ref is per instance —
> two `Autofocus` components each get their own box. Module-level state also survives
> unmounts and leaks; refs are cleaned up with the component.

## 12. Comparison table

| | `useRef` | `useState` | plain `let` |
|---|---|---|---|
| Survives renders | ✅ | ✅ | ❌ |
| Changing it re-renders | ❌ | ✅ | ❌ |
| New value per render | ❌ (same object) | ✅ | n/a |
| Update timing | synchronous | async, batched | n/a |
| Per component instance | ✅ | ✅ | ❌ |
| Common job | DOM node, mutable holder | UI state | local scratch |

## 13. Code example

A counter that tracks the previous value with a ref:

```jsx {3,9}
function Counter() {
  const [count, setCount] = useState(0);
  const prevRef = useRef(count);

  useEffect(() => {
    prevRef.current = count;              // write AFTER render
  });

  const direction = count > prevRef.current ? 'up' : 'down';

  return (
    <div>
      <p>Now: {count} — was {prevRef.current} ({direction})</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => setCount(0)}>reset</button>
    </div>
  );
}
```

```narrate
1: A state value the UI depends on — this one re-renders.
3: A ref seeded with the first render's count.
6: After the render, the effect stores the current count.
9: During render the ref still holds the PREVIOUS count, so we can compare.
```

```text
Initially:   Now: 0 — was 0 (down)
After +1:    Now: 1 — was 0 (up)
After reset: Now: 0 — was 1 (down)
```

## 14. Performance notes

- `useRef` itself costs almost nothing: one allocation on first render, stable identity after.
- **Creating** a new object *every render* for a fresh render is the expensive thing; that's
  `useMemo`'s problem (Lesson 61), not a ref's.
- A "latest ref" costs one property write per render — negligible.
- The real win is **unblocking renders**, not speeding them up: keeping non-UI values out of
  state means fewer re-renders and fewer effect re-runs.

## 15. Debugging scenarios

| Symptom | Likely cause |
|---|---|
| `ref.current` is `null` in a handler | Element not mounted yet — access inside `useEffect` or after interaction |
| Value doubles in StrictMode | Writing to the ref during render; move the write into an effect |
| UI never updates after `ref.current = x` | Correct behaviour — a ref can't re-render. Move the value to state |
| Timer/listener reads stale state | The callback captured old state (Lesson 5). Read `ref.current` instead |
| Two components share one value | Module-level variable instead of `useRef` — one box per instance |

## 16. Quick revision notes

- A ref is a stable, mutable box that survives renders — changing it never re-renders
- Two use cases: **DOM refs** (focus, scroll, measure) and **mutable values** (previous, latest)
- `useRef(initial)` → `{ current: initial }`, same object every render
- Same object identity ⇒ never a valid dependency-array entry
- Write `.current` in effects/handlers, never during render
- React 19: lazy initialiser `useRef(() => make())`

## 17. Cheat sheet

```jsx
const inputRef = useRef(null);                 // DOM ref
// attach: <input ref={inputRef} />
inputRef.current?.focus();                     // use after mount

const prevRef = useRef(value);                 // previous-value pattern
useEffect(() => { prevRef.current = value; }); // write after render

const latestRef = useRef(initial);
function stableCallback() {                   // always current inside
  doSomething(latestRef.current);
}

// refs are per instance, never in dep arrays, never mutated during render
```

## 18. Key takeaways

> [!RECAP]
> - A ref is a mutable value that survives renders without causing one — the two use cases are DOM refs and mutable holders
> - `useRef` returns the same object on every render: stable identity, mutable contents
> - Only state re-renders. Changing `ref.current` never does — keep UI values in state
> - Write `.current` in effects and handlers, never in the render body
> - A "latest ref" is the fix for the stale-closure bug from Lesson 5
> - Per component instance, never shared — that's what makes it different from a module variable

## Check your understanding

Answer these without looking back.

1. Why does changing `ref.current` not cause a re-render?
2. Name the two use cases for `useRef` and give a concrete example of each.
3. What is the initial value of a DOM ref before the node is attached?
4. Why is it safe — and correct — to leave a ref out of a dependency array?
5. Write the previous-value pattern: when does the write happen, and why there?
6. What would break if you replaced a module-level variable with a ref, or a ref with a module-level variable?
7. Why does a `setTimeout` created in a mount effect see stale state, and how does a latest-ref fix it?

## What's Next

**Lesson 61 — useMemo.** When caching a value actually helps, when it is premature
optimisation, and the half of "useMemo vs useCallback" you'll be asked about first.
