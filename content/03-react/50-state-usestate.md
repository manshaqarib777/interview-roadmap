# Lesson 50 — State & `useState`

**Interview importance:** ⭐⭐⭐⭐⭐ — "why are state updates asynchronous and batched?" is
asked constantly, at every level.

State is the data a component owns and can change. `useState` is where most of that happens,
and every interesting question about it — why you can't read the new value right after
`setCount`, why two updates in one handler produce one re-render, why an interval sees stale
state — has the same root cause. Understand that and you can answer half of React's hardest
questions.

This lesson is really Lesson 5 wearing a hoodie: `useState` and the closures around it are
the entire story.

## Learning Objectives

By the end of this lesson you should be able to:

- Create and update state with `useState`, and say why it must be a hook
- Explain why updates are asynchronous and what "snapshot" means
- Predict what batching does to several updates in one handler
- Use functional updates and an initialiser function correctly
- Diagnose and fix the stale-closure trap (the Lesson 5 connection)

## 1. One-line definition

**State is data a component owns; `useState` declares it, and `setState` schedules a
re-render instead of changing a variable — updates are asynchronous, queued, and batched.**

## 2. Mental model

Imagine a photo of the UI. React renders the picture, and `count` is a number written on it.
Calling `setCount(1)` doesn't change the photo — it schedules a *new* photo, and only when
React takes it does `count` read as `1`.

That's why the value doesn't change immediately: you're reading the current photo while the
next one is still being prepared. `useState` hands you the snapshot for *this render*, and a
setter that asks for the next one.

## 3. Visual flow

```text
 render #1:  count = 0            snapshot for the UI being drawn
   │
   ▼
   onClick → setCount(0 + 1)      schedules an update (queued, not applied)
   onClick → setCount(1 + 1)      queued — batch
   │
   ▼
 render #2:  count = 2            one re-render, snapshot updated
   │
   ▼
   setCount(count + 1)            reads THIS render's snapshot (2) → 3
```

Three `setCount` calls in one handler → *one* re-render with the final value. Each render
reads its own snapshot and no other.

## 4. How it works

A `useState` call returns a pair — the current value (a snapshot for this render) and a
setter that schedules an update:

```jsx
function Counter() {
  const [count, setCount] = useState(0);   // 0: initial value

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

The hook has two jobs — read and schedule. It is *not* a variable: you can't reassign
`count`, and the setter doesn't apply instantly.

Updating multiple state variables in one handler is a **batch** — one re-render, not two:

```jsx
function Form() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);

  function reset() {
    setName('');   // queued …
    setAge(0);     // … and flushed together
  }

  return null;
}
```

`name` and `age` update in the same render. The parent component is part of the same batch —
React re-renders the whole tree that needs it in one pass.

The **functional updater** reads the latest value instead of a snapshot — the fix for "stuck
at 1" and the safe form for multiple updates:

```jsx
setCount(prev => prev + 1);   // prev is the latest pending value
```

An **initialiser function** delays the initial computation until it's actually needed —
for reading `localStorage`, scanning a big array, or parsing JSON:

```jsx
const [todos, setTodos] = useState(() => loadTodosFromStorage());
```

`loadTodosFromStorage` runs once, on the first render only.

> [!PITFALL]
> Don't confuse the initialiser with lazy *updates*: `useState(load())` calls `load` on
> **every** render and discards the result — the argument is still evaluated. The function
> form `useState(() => load())` is what defers it.

## 5. Real project usage

| Pattern | Code |
|---|---|
| Basic toggle | `const [open, setOpen] = useState(false)` |
| Form fields | `const [query, setQuery] = useState('')` — controlled input (Lesson 54) |
| Counters/quantities | `setQuantity(q => q + 1)` — functional updater |
| Expensive init | `useState(() => parse(bigData))` — initialiser function |
| Multiple related | several `useState` calls, or `useReducer` when transitions get complex (Lesson 64) |
| Shared state | lift to the common parent (Lesson 55) or context (Lesson 63) |

The stale-closure trap in real life — the counter that gets stuck:

```jsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);  // ❌ stuck at 1
  return () => clearInterval(id);
}, []);
```

The effect ran once, so its closure captured `count` as `0` forever (Lesson 5). Every tick
computes `0 + 1`. Two honest fixes:

```jsx
setCount(prev => prev + 1);            // ✅ stop reading the captured snapshot
```

```jsx
useEffect(() => { … }, [count]);       // ✅ or re-create the closure when it changes
```

## 6. Interview explanation

> `useState` gives a component a value for this render and a setter that schedules an update.
> Updates aren't applied instantly — React queues them, batches everything in a handler or
> event into one re-render, and only then produces a new snapshot. So consecutive
> `setCount(count + 1)` calls each read the same old value; the functional form
> `setCount(prev => prev + 1)` reads the latest. The common bugs — a counter stuck at one, an
> interval seeing stale state — are closures capturing an old snapshot, the same mechanism as
> the `var` loop (Lesson 5).

## 7. Senior-level insights

- **State is per-render, and so are the closures around it.** Every render creates fresh
  functions capturing that render's state — one snapshot, one set of closures.
- **Treat the setter as a message, not a command.** You're telling React "the next render
  should have this"; you are not editing the current one.
- **Separate the three sources of truth.** Props are external inputs (Lesson 49), state is
  internal and owned, and derived values are computed in render (Lesson 55). `useMemo` is for
  expensive *derivation*, not for storing things.
- **One state, one owner.** The component that renders the value owns it; siblings share
  through a common parent (Lesson 55) — never by duplicating it.
- **Read React 18 batching precisely.** React 18 batches *everything* — timeouts, promises,
  native handlers included. In React 17 and earlier, batching happened only in React event
  handlers; async callbacks re-rendered each time.

## 8. Common mistakes

- **Mutating state instead of replacing it** — `todos.push(x)` then `setTodos(todos)`. Same
  reference, so React sees no change (Lesson 6's reference equality) and nothing re-renders.
  Copy first: `setTodos([...todos, x])`.
- **Reading state right after setting it** — `setCount(count + 1); console.log(count)`. You
  read the old snapshot; updates are queued, not applied.
- **Stale closures** — a `setTimeout` or `setInterval` capturing an old `count` (Lesson 5).
- **Unnecessary state** — `useState` for something already derivable from props or other
  state. "Most out-of-sync bugs are state that should have been derived" (Lesson 55).
- **Wrong initialiser** — `useState(load())` runs the call every render.
- **Several `setState` calls updating different slices of one object** — three separate
  objects, three churn points. Use one state object, `useReducer`, or three independent
  states (Lesson 64).
- **Resetting via re-mount** — clearing a form by remounting it with a different `key`
  instead of resetting state; it works, but it's a hack.

## 9. Best practices

✅ Name the pair after meaning: `const [isOpen, setIsOpen] = useState(false)`

✅ Use the functional updater when the next value depends on the previous one

✅ Use the initialiser function for expensive or derived initial values

✅ Keep related values in one state object or a reducer (Lesson 64)

✅ Treat state as immutable — copy, don't mutate (Lesson 20's spread patterns)

❌ Don't read state right after setting it — you're reading the old snapshot

❌ Don't duplicate state that can be derived (Lesson 55)

❌ Don't write state during render — that's a render loop, not a pattern

## 10. Interview questions

**Q1. Why are state updates asynchronous?**

> Because the setter schedules a re-render rather than mutating a variable. The component
> keeps rendering from the current snapshot until React processes the update and produces a
> new one. So after `setCount(x)` the local `count` is still the old value — reading it is
> reading the render in progress.

**Q2. What is batching, and how does React 18 change it?**

> Several updates in the same event handler are queued and flushed as one re-render, so
> `setName` + `setAge` → one render. React 18 batches *everything* — promises, timeouts,
> native events — where earlier React only batched inside React event handlers and
> re-rendered per update outside them.

**Q3. Why do two `setCount(count + 1)` calls add only one?**

> Both read the same snapshot — `count` from this render — so both compute the same value.
> The setter schedules, it doesn't apply. Use the functional form `setCount(prev => prev + 1)`
> to read the latest queued value instead.

**Q4. What's the difference between passing a value and passing a function to the setter?**

> A value schedules that exact value. A function receives the latest pending value and
> returns the next one — correct when the update depends on previous state, and it never
> reads a stale snapshot. Prefer the function form when the next value derives from the
> current one.

**Q5. Why does `useState(expensive())` not defer the work?**

> The argument is evaluated before `useState` is even called — every render. The *initialiser
> function* form `useState(() => expensive())` defers it and runs it once, on the first
> render. Same distinction as passing a value vs a function to any API.

**Q6. When would you use `useReducer` instead of `useState`?**

> When transitions are complex or related — multiple fields, state that changes based on
> actions. `useReducer` centralises the logic in one pure function (Lesson 14), which is
> easier to test and reason about. For a toggle or a counter, `useState` is the tool (Lesson 64).

**Senior follow-up: Walk through what happens end-to-end after a `setState` call.**

> The setter enqueues an update on the component's fiber and schedules work. After the event
> handler finishes, React processes the queue — including the functional updates in order,
> each receiving the previous result — then re-renders affected components, reconciles the
> new element tree against the old (Lesson 51), and commits the minimal DOM changes. All the
> updates from that event were batched, so there's one render pass and one commit.

## 11. Follow-up questions

**Why is state stored in order rather than in an object keyed by name?**

> Because hooks have no names — the hook array is indexed by call order. That's why hooks
> can't live inside conditions or loops (Lesson 66). The order of your `useState` calls *is*
> the identity of your state.

**Why does a re-render reset my `let` variables but not my state?**

> A plain variable is recreated from scratch on every render; state lives on the fiber, which
> persists across renders (Lesson 66). That persistence — plus the fact that only state
> changes trigger re-renders — is the whole difference.

**Can you use `useState` outside a component?**

> The hook itself needs a component context, but the *pattern* is plain closures — the
> `useState` deep-dive in Lesson 5 is exactly that. If you want shared mutable data outside a
> component, that's a store, not state (Lesson 77).

## 12. Comparison table

| | `const x = v` | `useState` | `useRef` (Lesson 60) |
|---|---|---|---|
| Survives re-renders | ❌ recreated | ✅ stored on fiber | ✅ stored on fiber |
| Changing it re-renders | — | ✅ | ❌ |
| Readable in this render | ✅ | ✅ (snapshot) | ✅ (live) |
| Writable in this render | ✅ | ❌ via setter | ✅ `.current` |
| Use for | pure computation | UI-affecting data | timers, DOM refs, latest values |

## 13. Code example

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  function addThree() {
    // All three read the same snapshot — the result is +3, not +1.
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  function addOneCorrectly() {
    setCount(prev => prev + 1);   // functional form — reads the latest
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addThree}>addThree</button>
      <button onClick={addOneCorrectly}>+1</button>
    </div>
  );
}

// The pattern behind useState — state is just a closure over a value (Lesson 5):
function createState(initial) {
  let value = initial;
  const set = (next) => { value = next; };
  return [value, set];
}

// Simulating the batch with plain JS — updates are queued, then applied together:
let queue = [];
const dispatch = (updater) => { queue.push(updater); };
const flush = () => {
  let current = 0;                       // the "state" being updated
  queue.forEach(update => { current = update(current); });
  queue = [];
  return current;                        // the one new snapshot
};

dispatch(prev => prev + 1);              // three queued functional updates
dispatch(prev => prev + 1);
dispatch(prev => prev + 1);

console.log(flush());                    // one flush, final value
```

Output:

```text
3
```

React's real implementation stores the value on the fiber and runs the queue before render —
but "queued updates, applied in order, one new snapshot" is exactly the model.

## 14. Performance notes

- One render per batch, not per setter — batching is why handlers can call setters freely.
- The initialiser function is a real optimisation when init is expensive (parsing, storage,
  big scans) — it runs once instead of every render.
- Functional updates are O(1) to queue; they also fix stale-closure bugs without extra
  dependencies.
- Frequent updates (animations, streaming) should stay out of state where possible — `useRef`
  (Lesson 60) holds values that shouldn't re-render. And re-renders themselves are the thing
  to measure (Lesson 71), not the number of setters.

## 15. Debugging scenarios

**The counter is stuck at 1.** A closure captured `count` from the first render — the
`setInterval` from Lesson 5. Fix with the functional updater or add the dependency.

**The UI doesn't change after you called the setter.** You mutated instead of replacing —
`todos.push(x)` keeps the same reference, so React skips the render. Copy: `setTodos([...todos, x])`.

**Two updates in a row only apply the second.** Both read the same snapshot. Switch to
functional updates: `setQty(prev => prev + 1)`.

**The setter logs the old value.** Reading state right after setting it is reading the
current snapshot — updates are queued. Log inside the render or in a `useEffect`.

**State resets when you navigate.** The component unmounted and remounted, so the fiber state
was discarded. Move the state up (Lesson 55) or to context (Lesson 63) if it must survive.

## 16. Quick revision notes

- `useState(initial)` → `[value, setter]`; value is a snapshot for this render
- Setters schedule, they don't apply — updates are asynchronous
- Updates are batched: one handler → one re-render (React 18 batches everything)
- The functional updater reads the latest: `setCount(prev => prev + 1)`
- The initialiser function defers init: `useState(() => expensive())`
- Two snapshot reads of the same state add one, not two
- Stale closures are Lesson 5 wearing a hoodie
- Don't mutate state — replace it (reference equality, Lesson 6)
- Don't read state right after setting it
- Don't store what can be derived (Lesson 55)
- `useRef` when changes must not re-render (Lesson 60); `useReducer` for complex transitions (Lesson 64)

## 17. Cheat sheet

```jsx
// Declare
const [count, setCount] = useState(0);
const [user, setUser] = useState(() => loadUser());   // lazy init

// Update — value form (schedules this exact value)
setCount(5);

// Update — functional form (reads the latest; use when deriving)
setCount(prev => prev + 1);

// Never mutate — copy and replace (Lesson 20)
setTodos([...todos, { id, text }]);
setUser({ ...user, name: 'Mansha' });

// Common bug: these three add 1, not 3 (same snapshot)
// setCount(count + 1); setCount(count + 1); setCount(count + 1);

// Derived value — compute in render, don't store (Lesson 55)
const fullName = `${user.first} ${user.last}`;
```

## 18. Key takeaways

> [!RECAP]
> - State is data a component owns; `useState` returns a snapshot plus a scheduler
> - Updates are asynchronous and batched — one handler, one re-render
> - The functional updater reads the latest value; the value form reads the snapshot
> - The initialiser function defers expensive first-render work
> - Never mutate state — replace it, or reference equality hides the change (Lesson 6)
> - Stale closures are the `var` loop wearing a hook (Lesson 5)
> - React 18 batches across events, promises and timeouts — not just handlers
> - State is stored on the fiber by call order — that's the Rules of Hooks (Lesson 66)
> - Don't store what can be derived; lift what must be shared (Lesson 55)

## Check your understanding

Answer these without looking back.

1. Why can't you read the new value immediately after calling `setCount`?
2. Three `setCount(count + 1)` calls in one handler — what's the final value, and why?
3. What does the functional updater receive, and when must you use it?
4. Why does `useState(loadTodos())` run the call every render?
5. Explain the `setInterval` "stuck at 1" bug in terms of Lesson 5, and give two fixes.
6. How is React 18's batching different from React 17's?
7. Why does mutating an array and then setting it not re-render?
8. Where does React actually store state, and what does that imply about hook order?

## What's Next

**Lesson 51 — Rendering & Reconciliation.** What actually happens when state changes: how
React decides what to re-render, why reference identity matters, and what `key` does to the
diff.
