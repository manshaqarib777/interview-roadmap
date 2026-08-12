# Lesson 53 — Events & Synthetic Events

**Interview importance:** ⭐⭐⭐⭐⭐ — Foundational — later lessons build directly on this.

`onClick`, `onChange`, `onSubmit` look like DOM event handlers — they're not, quite. React
wraps every native event in a **synthetic event**: a cross-browser object that behaves like
the native one, delivered through a single listener at the root of the tree. Three questions
come out of that: what is the synthetic event, why the root listener, and what do
`stopPropagation` and `preventDefault` actually do in React — where the answers changed
after React 17.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a synthetic event is and why React bothers wrapping the native one
- Explain why React attaches all event listeners at the root, and where exactly
- Say what event pooling was, why it existed, and that it's gone since React 17
- Explain how `stopPropagation` and `preventDefault` behave — and the `nativeEvent` caveat
- Handle form submit correctly, and know what React's `onChange` *really* fires on

## 1. What is a Synthetic Event?

**A synthetic event is React's cross-browser wrapper around the browser's native event —
same properties and methods you expect, normalised so behaviour is consistent everywhere.**

```jsx
<button onClick={(e) => console.log(e.type)}>Click</button>
```

```text
e.type            → "click"
e.target          → the DOM element that was clicked
e.currentTarget   → the DOM element the handler is attached to (handler owner)
e.nativeEvent     → the underlying native event
e.stopPropagation / e.preventDefault / e.stopImmediatePropagation
```

`onClick` and friends are not DOM attributes. They are props, compiled like any other JSX,
and the handler receives the synthetic event.

## 2. Mental Model

A **conference call**. The browser has one open line — a single listener at the root of the
tree. Every event travels up that line. When an event reaches the root, React looks at its
call log, finds which components registered handlers along the way, and calls them in order.

The synthetic event is the translated transcript everyone gets. You don't speak "the
browser's dialect" — React has already normalised it, so the transcript reads the same on
every browser. The `nativeEvent` is the raw recording underneath.

## 3. Visual Flow

```text
  user clicks <button>
        │
        ▼
  native event bubbles:  button → div → ... → #root (React 17+)
        │
        ▼
  React's single listener at the root catches it
        │
        ▼
  React maps the event to SyntheticEvent, dispatches it
  through the fiber tree: deepest target first, then up
  (stopPropagation cuts this walk short)
        │
        ▼
  your handler runs → return value ignored → synthetic
  event is released (or just discarded)
```

## 4. How It Works

React doesn't put a listener on each element. It attaches **one listener per event type at
the root** and relies on native bubbling to bring events to it:

- **React ≤16** attached to the `document`.
- **React 17+** attaches to the **root container** (the `#root` div you render into).

Why does the change matter? Interop: with the listener on `document`, a React app inside a
page made of other frameworks/scripts was fighting them over *document-level* events —
`stopPropagation` inside React couldn't stop a native listener at `document` (it ran
before React's), and a native `stopPropagation` at `document` could never be called before
React's listener. Moving to the root container gives each app its own event territory, and
`e.stopPropagation()` inside React now behaves like the native one for the whole page.

From the captured event, React replays the path: it walks its fiber tree from the target up
to the root, invoking your `onClick` handlers — mirroring native bubbling, so your handler
gets a `currentTarget` that reflects the element the handler is on. In **delegation terms**,
React is one delegated listener per event type; `currentTarget` is computed, not attached.

> [!TIP]
> One listener per event type, not one per handler. That's the whole trick — thousands of
> buttons cost one listener each for click, change, input, etc.

## 5. Why the Wrapper? — Normalisation

The same event behaves differently across browsers: `key` vs `keyCode` vs `which`,
`charCode` quirks, `target` vs `srcElement`, `button` numbering. The synthetic event maps
all of that to one consistent API. Your handler code stops caring which browser it runs in:

```jsx
function KeyLogger() {
  const [key, setKey] = useState('');

  return (
    <input
      value={key}
      onKeyDown={(e) => setKey(e.key)}   // same e.key everywhere — no keyCode branches
      placeholder="type something"
    />
  );
}
```

```text
user presses "Enter" → e.key === "Enter" on every browser
                      (no keyCode === 13 / which === 13 branching)
```

## 6. The Form Case: onSubmit and the "onChange" Surprise

`onSubmit` fires on the `<form>` when it's submitted — by Enter in a field, or by a submit
button. That's the event to intercept:

```jsx
function Search() {
  const [q, setQ] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();            // stop the native navigation/reload
    doSearch(q);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  );
}
```

```text
Enter in the input  → onSubmit fires → preventDefault stops the page reload → doSearch runs
```

> [!PITFALL]
> React's `onChange` is not the DOM `change` event — it fires on every keystroke (it maps
> to the native `input` event). That's the behaviour every controlled component from
> Lesson 54 depends on. The DOM `change` event fires only when the field *loses focus*.

## 7. stopPropagation and preventDefault

Both are called on the synthetic event, and both work — with one asymmetry you should know:

```jsx
function StopCase() {
  return (
    <div onClick={() => console.log('outer div')}>
      <button
        onClick={(e) => {
          e.stopPropagation();          // ✅ stops React handlers above (and native bubbling)
          console.log('button');
        }}
      >
        click me
      </button>
    </div>
  );
}
```

```text
button
```

`stopPropagation` stops the synthetic walk upward — the outer div's `onClick` never runs —
**and** stops the native event's bubbling, so native listeners above the root never see it
either (React 17+).

```jsx
function PreventCase() {
  return (
    <a href="/page" onClick={(e) => e.preventDefault()}>
      won't navigate
    </a>
  );
}
```

```text
link renders, click does nothing — no navigation
```

`preventDefault` doesn't stop propagation — handlers further up still run; the default
browser action (navigation, reload, checkbox toggle) is just cancelled.

> [!PITFALL]
> The one place the symmetry breaks: if you call `e.stopPropagation()` **inside a native
> (non-React) handler**, React 17+ won't receive the event at all. That's not a React bug —
> it's the direct consequence of the single-root-listener design. And since React 17 the
> native event itself isn't modified: React stores the handler calls on a parallel
> bookkeeping structure, so a native listener at the root *can* see and stop propagation
> that React already processed.

## 8. Event Pooling (Historical, Gone Since React 17)

Before React 17, React reused event objects through a **pool**: after the handler ran, the
synthetic event was "released", its properties nulled, so a new event could reuse the same
object. The consequence was a classic interview question:

```jsx
function Pooled() {
  const [msg, setMsg] = useState('');

  return (
    <button
      onClick={(e) => {
        setTimeout(() => setMsg(e.target.textContent), 100); // ❌ e is nulled by then
      }}
    >
      click me
    </button>
  );
}
```

```text
before React 17:  e.target is null by the time the timeout runs → crash / undefined
React 17+:        e.target still readable — pooling is gone
```

Fix under pooling (this is why the pattern exists — keep it as a habit anyway):

```jsx
const text = e.target.textContent;      // ✅ copy what you need, synchronously
setTimeout(() => setMsg(text), 100);
```

Since React 17 the synthetic event is a plain object created per event — it stays alive, is
safe to read in callbacks, and `e.persist()` (the old escape hatch) is a no-op. The question
is now historical: interviewers still ask it to check whether you know modern React.

## 9. The Interview Explanation

> React wraps every native event in a synthetic event — a normalised, cross-browser object
> with the usual properties and methods. Instead of attaching a listener to every element,
> React attaches one listener per event type at the root of the tree — the root container
> since React 17 — and lets native bubbling carry events to it, then dispatches them back
> down through the fiber tree to your handlers. That single delegation point is why
> `stopPropagation` and `preventDefault` behave the way they do, and it's the reason event
> pooling existed before React 17 and was removed.

## 10. Senior-Level Insights

- **Event delegation is the design constraint.** Everything — the root listener, the
  stopPropagation semantics, pooling, interop — follows from "one listener per event type
  at the root". Explain the constraint and all three classic answers fall out of it.
- **`currentTarget` is computed, not attached.** Because delegation replays the path, the
  synthetic `currentTarget` is set correctly per handler — which is *not* true of naive
  delegation where `currentTarget` is always the delegated element.
- **`onChange` on controlled inputs is the foundation** (Lesson 54 builds directly on it).
  Knowing it maps to the native `input` event is a small fact with large consequences.
- **Events are per-render values.** The handler prop is part of the element from Lesson 51:
  a *new* function every render, with that render's state captured in a closure (Lesson 5).
  That's what makes stale handlers and re-subscription questions work.
- **Passive listener trade-offs**: for scroll/touch performance you can opt into native
  passive listeners, but the delegation design means React can't be passive by default.

## 11. Common Mistakes

- **Assuming `onChange` = DOM `change`.** React's fires on every keystroke — that's the
  `input` event. "My handler doesn't fire until I blur" is the DOM-event symptom, and it's
  a wrong-mental-model bug.
- **Calling `preventDefault` to stop other handlers.** It cancels the default action only.
  To stop handlers above, you need `stopPropagation` — they're different tools.
- **Reading the synthetic event in an async callback and expecting the old bugs.** On
  React 17+ it's safe, and old advice to "copy values synchronously" persists from pooling.
  Still good practice, no longer required.
- **Trying to add a listener to the wrong target.** `document.addEventListener('click', …)`
  in an effect without cleanup doubles up in Strict Mode — and leaks. Clean up, or attach
  to the ref.
- **Relying on `e.persist()`.** It's a no-op since React 17 — and a red flag in an
  interview if you reach for it as a "fix".

## 12. Best Practices

✅ Use `onSubmit` on the form and `preventDefault()` — never `onClick` on a submit button

✅ Copy any event data you need synchronously — still the clearest code, and it was the
pooling rule before React 17

✅ Put `stopPropagation` only where the parent genuinely must not react — not "just in case"

✅ Prefer `e.key` for keyboard handling; it's the normalised property, no `keyCode` branches

✅ For delegation needs of your own, attach a single listener to a parent instead of one per child

❌ Don't rely on `e.persist()`, `e.nativeEvent` internals, or pooling-era workarounds — all
historical since React 17

❌ Don't add and forget `document` listeners without cleanup

❌ Don't use `preventDefault` when you mean `stopPropagation`

## 13. Interview Questions

**Q1. What is a synthetic event?**

> React's cross-browser wrapper around the native browser event. It exposes the standard
> event API — type, target, currentTarget, preventDefault, stopPropagation — with
> normalised behaviour, so handlers don't need browser branches. `e.nativeEvent` is the
> underlying native event.

**Q2. Why does React attach event listeners at the root?**

> Event delegation: instead of a listener on every element, React attaches one listener
> per event type at the root and relies on native bubbling. Events arrive there, React
> replays the component path, and calls the handlers in order. One delegated listener per
> event type means thousands of buttons cost almost nothing to wire up.

**Q3. Where does React attach listeners, and why does the version matter?**

> React 17 moved from `document` to the root container. On `document`, React was fighting
> other frameworks and native listeners over document-level events: a native listener at
> `document` ran before React's, and React's `stopPropagation` couldn't stop it. On the
> root container, each app owns its event territory, and `stopPropagation` inside React
> now behaves like the native one for the whole page.

**Q4. What was event pooling, and why was it removed?**

> Before React 17, synthetic events were reused from a pool — after the handler ran the
> object was nulled and recycled, so reading it asynchronously returned nulled properties,
> and you had to copy values synchronously. React 17 removed pooling entirely: each event
> is a plain object that stays valid, and `e.persist()` is now a no-op. It's a historical
> question today — asked to see whether you know modern React.

**Q5. How does stopPropagation behave in React?**

> Called on the synthetic event, it stops React's dispatch up the fiber tree — parent
> handlers don't run — and, since React 17, it also stops the native event's bubbling, so
> native listeners above the root don't see it either. The old pre-17 asymmetry — native
> listeners at `document` still firing — is gone.

**Q6. What is the difference between stopPropagation and preventDefault in React?**

> `preventDefault` cancels the browser's default action — navigation, reload, checkbox
> toggle — while the event keeps propagating and other handlers still run.
> `stopPropagation` stops the event travelling further — handlers above never run — but
> the default action still happens. In forms you usually need both ideas: preventDefault
> on submit, stopPropagation when a parent must not react.

**Senior follow-up: A page with a React app and a jQuery widget — how do their event listeners interact?**

> If React is on 17+, its listeners are on the React root container, so both systems own
> their own event territory: each listens where it attaches. On React ≤16 the listeners
> were on `document`, so React and jQuery fought over document-level events — a jQuery
> `stopPropagation` at `document` could silence React, and React's own
> `stopPropagation` couldn't stop a native `document` listener that ran first. That
> interop problem was a large part of why React 17 moved to the root container.

## 14. Follow-up Questions

**Why is React's onChange different from the DOM change event?**

> React maps `onChange` to the native `input` event, which fires on every keystroke, not
> on blur. Controlled components (Lesson 54) depend on this — state updates as you type,
> and the input's value is always whatever state says.

**What exactly does e.nativeEvent give you?**

> The browser's original event object — same event, before React's wrapper. You can read
> browser-specific details there. React's synthetic properties are usually sufficient,
> and touching `nativeEvent` is the escape hatch for the rare case they aren't.

**What happens to the return value of an event handler?**

> Nothing. React ignores it — returning `false` from a handler does **not** prevent
> default, unlike classic inline `onclick="return false"`. If you want the default
> prevented, call `preventDefault()`.

**Why does React re-create the handler every render?**

> Because the handler prop is part of the element, and every render builds a new element
> (Lesson 51). The handler closes over that render's props and state (Lesson 5) — which
> is what makes stale handlers a thing, and `useCallback` (Lesson 62) the stabilising fix.

## 15. Comparison Table

| | Native DOM | React synthetic |
|---|---|---|
| Event object | `Event`, browser-specific | `SyntheticEvent` wrapper, normalised |
| Listener placement | On the element (or wherever you attach) | One per type, at the root container |
| `stopPropagation` | Stops native bubbling | Stops React dispatch + native bubbling (17+) |
| `preventDefault` | Cancels default action | Same — but does NOT stop propagation |
| `return false` | Prevents default (inline) | Ignored — must call `preventDefault()` |
| Async reads of the event | Safe | Safe since 17 (pooled before) |
| `onChange` semantics | Fires on blur | Fires on every keystroke (`input` event) |

## 16. Performance Notes

- **Delegation scales.** One listener per event type at the root — thousands of handlers
  cost one listener each. The cost moves to dispatch, which is O(depth) per event.
- **Handlers are created per render** (new closure per render — Lesson 5/51). For hot
  paths, `useCallback` (Lesson 62) stabilises the reference; the listener count at the root
  doesn't change either way.
- **Passive events**: React doesn't attach passive listeners, so scroll/touch handlers
  can block scrolling if they're slow. For high-frequency native listeners, attach your
  own passive listener to a ref — and remember the root-delegation caveat.
- **Strict Mode double-invokes** event-handler *creation*, not the handlers themselves —
  handlers run once per event.

## 17. Debugging Scenarios

**Scenario 1: "My onChange fires only when the field loses focus."**

You're expecting React semantics from a native listener: you attached the handler to the
DOM node (`addEventListener('change', …)` or a native `onchange` attribute) instead of
using React's `onChange` prop. React's `onChange` maps to the `input` event.

**Scenario 2: "A parent's onClick fires even though I called stopPropagation."**

You probably called it on the wrong event, or the parent listener is native — a `document`
listener attached in an effect runs in native phase and, since React 17, sits *outside*
React's root container. If the parent is a React handler, check you called
`e.stopPropagation()` (not `e.preventDefault()`) and on the synthetic event, not
`nativeEvent`.

**Scenario 3: "My form reloads the page on submit."**

Missing `e.preventDefault()` in `onSubmit` — or the submit went out via a button without
`type` (defaults to `submit`) while the handler was attached elsewhere. Handle `onSubmit`
on the `<form>` and preventDefault there.

**Scenario 4: "A handler reads stale state."**

The handler is a closure from the render that created it (Lesson 5). If it's an async or
long-lived callback, capture the latest state with a ref, or rebuild the handler with
`useCallback` deps — same fix as any stale closure.

## 18. Quick Revision Notes

- `onClick` etc. are props, not DOM attributes — handlers receive a `SyntheticEvent`
- One listener per event type at the **root container** (React 17+; `document` before)
- Root delegation is why stopPropagation semantics and pooling history are what they are
- `preventDefault` ≠ `stopPropagation` — cancel action vs stop propagation
- `return false` in a handler does nothing — call `preventDefault()`
- Event pooling: historical, removed in React 17, `e.persist()` is a no-op
- React `onChange` fires per keystroke (native `input` event), not on blur
- Async reads of the event are safe on React 17+
- Handlers are new closures per render — stale-state territory (Lessons 5, 62)

## 19. Cheat Sheet

```text
<button onClick={(e) => ...}>
            │
            └─ SyntheticEvent
               .type            event name, normalised
               .target          DOM node the event happened on
               .currentTarget   DOM node of the handler's owner
               .nativeEvent     raw browser event
               .stopPropagation()   stop React dispatch + native bubbling (17+)
               .preventDefault()    cancel default action (still propagates)
               .persist()           no-op since React 17

<Form onSubmit={e => { e.preventDefault(); save(); }}>   // the form pattern
```

## 20. Key Takeaways

> [!RECAP]
> - Synthetic events are React's normalised wrapper around native browser events
> - React attaches one listener per event type at the root container (17+), not on each element
> - Delegation at the root explains stopPropagation semantics, interop, and pooling history
> - `preventDefault` cancels the default action; `stopPropagation` stops handler dispatch — different tools
> - `return false` is ignored in React handlers — always call `preventDefault()`
> - Event pooling is gone since React 17; async reads are safe; `e.persist()` is a no-op
> - React's `onChange` fires on every keystroke — the foundation of controlled components in Lesson 54

## Check your understanding

Answer these without looking back.

1. What is a synthetic event, and what is `e.nativeEvent`?
2. Why does React use a single root listener instead of per-element listeners?
3. Where were listeners attached before React 17, and what problem did the move solve?
4. What was event pooling, and what did you have to do because of it?
5. `stopPropagation` versus `preventDefault` — what does each do, and do they affect each other?
6. A handler returns `false` — what happens?
7. Why does React's `onChange` fire on every keystroke when the DOM's `change` fires on blur?
8. Why is the handler prop a new function every render, and which two earlier lessons explain it?

## What's Next

**Lesson 54 — Controlled vs Uncontrolled Forms.** You now know the event that fires on every
keystroke, the `onSubmit` pattern, and the closure that carries each render's state. Lesson
54 assembles those into React's most direct real-world question: who owns the input's value
— React, or the DOM?
