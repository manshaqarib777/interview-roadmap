# Lesson 64 — useReducer

**Interview importance:** ⭐⭐⭐ — the "state transitions getting complex" question, and the
foundation for Redux (Lesson 78).

`useState` is fine until your state has transitions — several related fields, actions that
change more than one of them, validation before you commit. When `useState` starts to feel
like a liability, the move is `useReducer`: extract every change into a named action, and let
one pure function decide what happens next. The "why" line to remember: **when state
transitions get complex enough that `useState` becomes a liability.**

## Learning Objectives

By the end of this lesson you should be able to:

- Explain reducer / action / dispatch in one sentence each
- Recognise the moment to move from `useState` to `useReducer`
- State the pure-reducer rule and why React relies on it (Lesson 14)
- Write a reducer with a switch over action types, including a default case
- Say when `useReducer` is and is not a performance win

## 1. What is a Reducer?

**A reducer is a pure function that takes the current state and an action, and returns the
next state — `(state, action) => newState`.**

It never reads, mutates, or fetches anything from outside; it only looks at its two arguments
and produces a new state object. That one constraint is the entire contract, and it comes
straight from Lesson 14 (pure functions & side effects).

## 2. Mental Model

`useState` is like giving a colleague a notepad: "write whatever you like on the next page."
`useReducer` is like giving them a menu: "you may only write what an action on the menu
describes." A reducer is a **traffic light** — state arrives from one direction, an action
arrives from the other, and the light decides which way the next state flows. Every change
is a named, reviewed decision rather than an ad-hoc `setState` call.

## 3. Visual Flow

```text
  user clicks "Add item"
        │
        │ dispatch({ type: 'add', payload: item })
        ▼
   ┌────────────────────────┐
   │  reducer(state, action)│   pure function — no side effects (Lesson 14)
   │  switch (action.type): │
   │    'add'    → new list │
   │    'remove' → filtered │
   │    default  → state    │
   └────────────────────────┘
        │
        ▼
   next state  →  React re-renders with the new state
```

## 4. How It Works

```jsx {11,19}
const initial = { items: [], total: 0 };

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const item = action.payload;
      return {
        items: [...state.items, item],            // new array, not a push
        total: state.total + item.price,
      };
    }
    case 'remove': {
      const items = state.items.filter((i) => i.id !== action.payload);
      return { items, total: items.reduce((sum, i) => sum + i.price, 0) };
    }
    default:
      return state;                                // unknown action → return state
  }
}

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, initial);
  return (
    <button onClick={() => dispatch({ type: 'add', payload: { id: 1, price: 9 } })}>
      Add ({state.items.length} items, ${state.total})
    </button>
  );
}
```

```narrate
11: A new array is built, never a mutation of state — the identity rule from Lesson 14.
17: The default case returns state unchanged, so an unknown action is a no-op.
19: dispatch hands the action to the reducer; it is stable across renders.
```

Three pieces to name out loud:

- **Action** — a plain object describing *what happened*: `{ type: 'add', payload: item }`.
- **Dispatch** — the function that hands an action to the reducer. It is stable across
  renders, exactly like a `setState` from Lesson 50.
- **Reducer** — the pure function that turns `(state, action)` into the next state.

> [!TIP]
> A common React convention calls actions `{ type, payload }` — `type` is the verb, `payload`
> is the data. That shape is what Redux formalised in Lesson 78.

## 5. Real Project Usage

A multi-field form is the canonical `useReducer` case: `change`, `submit` and `reset` as
named transitions, with the "clear the error for the field you're editing" logic in one
place:

```jsx
const initialForm = { name: '', email: '', errors: {}, submitted: false };

function formReducer(state, action) {
  switch (action.type) {
    case 'change': {
      const { name, value } = action.payload;
      return { ...state, [name]: value, errors: { ...state.errors, [name]: null } };
    }
    case 'submit': {
      const errors = validate(state);                    // helper, still pure
      return Object.keys(errors).length
        ? { ...state, errors, submitted: false }
        : { ...state, errors: {}, submitted: true };
    }
    case 'reset':
      return initialForm;
    default:
      return state;
  }
}
```

And the payoff is testability — a reducer is a plain function:

```js
const next = formReducer(initialForm, { type: 'submit', payload: null });
console.log(next.submitted, Object.keys(next.errors).length);
```

Output:

```text
false 0
```

The table that tells you when the move is right:

| Trigger | Signal |
|---|---|
| Several related fields change together | `setName`, `setEmail`, `setErrors` fired in sequence |
| One action touches many fields | "save" sets loading, clears errors, updates the user |
| State transitions are hard to test | Each transition is a function call — trivially testable |
| Logic is getting buried in the component | Extracting to a reducer cleans the component body |
| Next state depends on the previous one | `prev =>` chains that are hard to read |

```jsx
// ❌ three setters, each firing a re-render, bug-prone order
function handleSubmit() {
  setLoading(true);
  setError(null);
  setUser((u) => ({ ...u, name: form.name }));
}

// ✅ one dispatch, one transition, one re-render
function handleSubmit() {
  dispatch({ type: 'submit', payload: form.name });
}
```

> [!PITFALL]
> A single `setState` with a clear `setCount(prev => prev + 1)` does not become a reducer.
> If the transition is already simple, `useReducer` is ceremony, not clarity. The question is
> complexity of *transitions*, not size of the component.

## 6. Interview Explanation

> "`useReducer` manages state with a pure reducer — `(state, action) => newState`. You
> dispatch actions describing what happened, and the reducer decides the next state. I move
> to it when transitions get complex: several related fields changing together, or one action
> that touches many fields."
>
> "The key constraint is that the reducer is pure — no side effects, no mutation. That's what
> makes transitions predictable and testable, and it's the same idea Redux builds on."

## 7. Senior-Level Insights

- **Dispatch is stable.** It never changes identity across renders, so you can pass it down
  or put it in a `useEffect` dependency array without `useCallback` (Lesson 62). Say this —
  it's the performance point most people miss.
- **`useReducer` is not a performance feature.** Its re-render semantics match `useState`.
  The win is *locality of logic*: all transitions in one function. If you cite it as a perf
  fix, you lose the point.
- **Reducer as a "state machine"**: with a pure reducer, you can enumerate all actions and
  prove the state never reaches an invalid combination. That's the deeper answer to "why
  reducers over setters".
- **Lazy initialisation:** `useReducer(reducer, initial)` accepts a third argument,
  `init(initial)`, for expensive initial state — computed once.
- **The default case must return state unchanged** — forgetting it makes an unknown action
  return `undefined`, which is a runtime bug that only shows up as a mysterious blank screen.

### The pure-reducer rule (Lesson 14 applied)

This is the rule that makes `useReducer` predictable, and it's Lesson 14 word for word: **the
reducer must be pure.**

- Same `(state, action)` → same next state, every time.
- No `Math.random()`, no `Date.now()`, no reading/writing outside, no mutation of `state`.

```jsx
// ❌ impure — hides the real value, breaks replay, breaks tests
case 'applyDiscount':
  return { ...state, total: state.total * 0.9 };

// ✅ pure — discount travels in the action, output depends only on inputs
case 'applyDiscount':
  return { ...state, total: state.total * action.payload };
```

React leans on purity twice: during development it may invoke a reducer twice (StrictMode
double-invocation from Lesson 57) to surface impure logic, and it relies on the returned
object identity to decide whether to re-render. Impurity breaks both. The three rules to
recite: **pure function, immutable updates, name the action.**

## 8. Common Mistakes

- **Mutating state** — `state.items.push(item)` breaks identity, so React sees no change.
  Always build a new object/array (Lesson 14's immutability rules).
- **Side effects inside the reducer** — fetch, `Date.now()`, logging. They break purity,
  double-invoke in StrictMode, and break tests.
- **Missing `default: return state`** — unknown actions crash the reducer instead of being
  ignored (and `undefined` state breaks the render).
- **One `useState` per field, four setters firing together** — the exact smell `useReducer`
  exists to fix.
- **Reducers that "do too much"** — validation that calls out to the network, or derives
  data that should be derived at render time (Lesson 55).

## 9. Best Practices

✅ Make the reducer a pure function of `(state, action)` — Lesson 14, verbatim

✅ Return new objects/arrays; never mutate `state`

✅ Use `{ type, payload }` for actions and a `switch` with a `default: return state`

✅ Put validation and transitions in the reducer; leave side effects for effects (Lesson 57)

✅ Pass `dispatch` down as a stable reference instead of re-creating callbacks

❌ Don't use `useReducer` for a single, simple counter

❌ Don't fetch or read globals inside the reducer

❌ Don't initialise expensive state without the lazy `init` argument

## 10. Interview Questions

**Q1. What is `useReducer`? How does it differ from `useState`?**

> `useReducer` manages state through a pure reducer: you dispatch an action and the reducer
> computes the next state. `useState` is a single-value setter; `useReducer` is a named
> transition model. When several fields change together or one action touches many fields,
> a reducer keeps the transitions explicit and testable.

**Q2. When would you choose `useReducer` over `useState`?**

> When state transitions get complex — multiple related fields, or actions that affect
> several of them. For a counter, `useState` is clearer; for a multi-field form or a cart,
> `useReducer` keeps every transition in one pure function.

**Q3. Why must the reducer be pure?**

> So the next state depends only on `(state, action)` and nothing else. That makes transitions
> predictable and testable, lets React re-run the reducer in StrictMode to catch bugs, and
> relies on the returned object identity for re-renders. Purity is what makes the whole model
> work — it's the pure-function rule from Lesson 14.

**Q4. What's the difference between `dispatch` and `setState`?**

> Both trigger a re-render with new state and both are stable across renders. `setState` takes
> a value or an updater; `dispatch` takes an action object that the reducer interprets. Same
> mechanism underneath, different abstraction on top.

**Senior follow-up: Is `useReducer` faster than `useState`?**

> Not in any meaningful sense — the re-render behaviour is the same. What it buys you is
> maintainability and testability: transitions are named, pure, and enumerable. If someone
> reaches for it for speed, that's the wrong reason; the right reason is complexity of
> transitions.

## 11. Follow-up Questions

**What happens if the reducer returns the same object?**

> React bails out — no re-render. That's why returning `state` in the default case is both
> safe and cheap, and why mutation (which keeps the same identity) is so dangerous: React
> genuinely sees "nothing changed".

**Can you use `useReducer` for server data?**

> You can, but the better tool is a server-state library like TanStack Query (Lesson 81) that
> handles caching, retries and invalidation. `useReducer` shines for local, transition-heavy
> state — forms, wizards, carts.

**How do you test a reducer?**

> Like any pure function: call it with a state and an action, assert the result. No React
> renderer needed, because the reducer has no dependencies. That testability is one of the
> reasons to move complex transitions into a reducer in the first place.

## 12. Comparison Table

| | `useState` | `useReducer` | Redux (Lesson 78) |
|---|---|---|---|
| State shape | Single value (can be an object) | Any, transitions named by action | Global store, slices |
| Update call | `setValue(next)` | `dispatch({ type, payload })` | `dispatch(action)` |
| Transition logic | In the component | In the reducer | In reducers/slices |
| Purity required | Implicit | Explicit | Explicit |
| When to reach for it | Simple transitions | Complex, multi-field transitions | App-wide shared state |
| Testing | Needs a renderer | Plain function call | Plain function call |

## 13. Code Example

```js
// A reducer is just a function — it runs in plain Node, no React needed.
const initial = { count: 0 };

function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initial;
    default:
      return state;
  }
}

let state = initial;
state = counterReducer(state, { type: 'increment' });
state = counterReducer(state, { type: 'increment' });
state = counterReducer(state, { type: 'decrement' });

console.log(state);
console.log(counterReducer(state, { type: 'unknown' }) === state);  // default keeps identity
```

Output:

```text
{ count: 1 }
true
```

The second line is the purity payoff: an unknown action returns the *same* object, so React
would skip the re-render. That's the identity rule from Section 11, proven in two lines.

## 14. Performance Notes

- **Dispatch is stable** — safe in effect deps and callback props without `useCallback`.
- **Identity-based bailout:** returning the same state object skips the re-render; new object
  identity means a re-render, same as `useState`.
- **StrictMode double-invocation** (Lesson 57) runs the reducer twice in dev — pure reducers
  are unaffected; impure ones produce visible bugs.
- **Not a perf tool.** If you're reaching for `useReducer` to make things faster, stop — the
  win is structure and testability. Measure first (Lesson 71).

## 15. Debugging Scenarios

**Scenario 1 — "State silently doesn't update"**

The reducer mutated `state` and returned it. Identity unchanged → React bails out. Fix:
build new objects/arrays and return them.

**Scenario 2 — "Blank screen after an unknown action"**

No `default: return state` — the reducer returned `undefined` and the render crashed. Fix:
always end the switch with `default: return state`.

**Scenario 3 — "Reducer behaves differently in dev vs prod"**

StrictMode double-invokes in dev. Impure logic (randomness, date, mutation) diverges. Fix:
make the reducer pure.

**Scenario 4 — "State updates twice in dev"**

Two dispatches are firing (StrictMode or a missing cleanup). Check the effect that calls
`dispatch` — it likely needs a cleanup (Lesson 58).

## 16. Quick Revision Notes

- `(state, action) => newState` — pure, immutable, deterministic
- `dispatch({ type, payload })` — stable, passes the action to the reducer
- `switch` + `default: return state` — the canonical shape
- Move to `useReducer` when transitions get complex, not when state gets big
- Purity is Lesson 14; it's what makes tests, StrictMode and bailout work
- Same object back → no re-render; new object → re-render

## 17. Cheat Sheet

```jsx
const initialState = { items: [], total: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { items: [...state.items, action.payload],
               total: state.total + action.payload.price };
    case 'remove':
      return { items: state.items.filter(i => i.id !== action.payload),
               total: state.total - (state.items.find(i => i.id === action.payload)?.price ?? 0) };
    default:
      return state;
  }
}

// in the component
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'add', payload: { id: 2, price: 5 } });
```

## 18. Key Takeaways

> [!RECAP]
> - A reducer is a pure `(state, action) => newState` function — Lesson 14, applied
> - `dispatch` hands an action to the reducer; it's stable across renders
> - Move from `useState` when transitions get complex, not when the component gets big
> - Never mutate; return new objects so identity drives the re-render correctly
> - Always `default: return state` for unknown actions
> - Not a performance tool — a structure tool. Redux builds on the same idea (Lesson 78)

## Check your understanding

Answer these without looking back.

1. Define reducer, action and dispatch in one sentence each.
2. Name three signals that say "time to move from `useState` to `useReducer`".
3. Why must the reducer be pure, and which Lesson states that rule?
4. What does `default: return state` do, and why does returning the same object skip a re-render?
5. Why is `dispatch` safe to use in an effect dependency array without `useCallback`?
6. Is `useReducer` a performance improvement? Answer like a senior.

## What's Next

**Lesson 65 — Custom Hooks.** Expect to write one live. This is the main React composition
primitive — extract `useLocalStorage`, `useFetch` and `usePrevious` from logic that currently
lives inside your components.
