# Lesson 78 — Redux Toolkit

**Interview importance:** ⭐⭐⭐⭐ — store, slice, thunk, selector: still standard at many companies.

Redux is the ecosystem's reference state manager, and its vocabulary — store, slice, thunk,
selector — is the shared language every other tool compares itself to. `useReducer` from
Lesson 64 gives you the reducer idea in one component; Redux lifts that idea to a single
store for the whole app, with pure reducers and subscription control that context (Lesson 77)
cannot give you.

Redux Toolkit (RTK) is the modern, official way to write it. `configureStore` sets up the
store, `createSlice` generates reducers and actions together, and the data flow stays a
one-way loop: `dispatch(action) → reducer → new state → re-render`.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the four moving parts — store, slice, thunk, selector — in one sentence each
- Build a slice with `createSlice` and explain what its actions look like
- Set up a store with `configureStore` and combine slices
- Connect components with `useSelector` and `useDispatch`
- Draw the unidirectional data flow diagram and trace a click through it

## 1. One-line definition

**Redux Toolkit is the official way to write Redux: `configureStore` creates a single global
store, `createSlice` defines state + reducers + auto-generated actions in one block, and
components read state via selectors and change it by dispatching actions.**

## 2. Mental model

Think of a bank. The **store** is the vault — one source of truth holding all balances. A
**slice** is one ledger inside it (accounts, loans, cards), each with its own rules for
change. You never reach into the vault; you hand a **teller a slip** (dispatch an action),
and the teller's rules (the reducer) update the ledger and hand you back a receipt. To know
your balance you **ask a teller** (a selector) — you never guess it from elsewhere.

## 3. Visual flow

```text
   user clicks "Add item"
        │
        │ dispatch({ type: 'cart/add', payload: item })
        ▼
   ┌───────────────────────────────────────────────┐
   │  STORE  (configureStore)                      │
   │   ┌────────────────────────────────────────┐  │
   │   │ cart slice (createSlice)               │  │
   │   │   reducers: add / remove / clear       │  │
   │   │   state: { items, total }              │  │
   │   │   actions: cart/add, cart/remove       │  │
   │   └────────────────────────────────────────┘  │
   │   (pure reducers — Lesson 14, no mutation)    │
   └───────────────────────────────────────────────┘
        │  new state (new object identity)
        ▼
   useSelector reads state → components that read the changed
   slice re-render. Components that read other slices stay still.
```

## 4. How it works

### The slice — `createSlice`

`createSlice` takes a name, initial state, and a set of reducer functions. It generates the
action creators and the reducer from them:

```js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    add(state, action) {                    // (state, action) — Lesson 64 shape
      state.items.push(action.payload);     // ✅ Immer lets you write this
      state.total += action.payload.price;
    },
    remove(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.total = state.items.reduce((sum, i) => sum + i.price, 0);
    },
    clear(state) {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { add, remove, clear } = cartSlice.actions;
export default cartSlice.reducer;
```

Output:

```text
No console output — but know these generated facts:
cartSlice.actions.add({ id: 1, price: 5 })
  → { type: 'cart/add', payload: { id: 1, price: 5 } }
The reducer is cartSlice.reducer — a plain (state, action) => newState function.
```

> [!TIP]
> The "mutation-looking" code — `state.items.push(...)` — is safe because RTK wraps every
> reducer in **Immer** (from Lesson 20's immutable-update world). You write drafts as if
> mutating; Immer produces a new immutable state object. In interviews, say "Immer lets the
> reducer read like mutation but keeps updates immutable."

### The store — `configureStore`

```js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,        // state.cart
    user: userReducer,        // state.user
  },
});
```

`configureStore` combines the slice reducers into one root reducer, wires up the Redux
DevTools, and (in production) enables the middleware you'll meet in Lesson 79.

### Connecting components — `useSelector` and `useDispatch`

```jsx {4}
import { useDispatch, useSelector } from 'react-redux';
import { add } from './cartSlice';

function AddToCartButton({ item }) {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.cart.items.length);

  return (
    <button onClick={() => dispatch(add(item))}>
      Add ({count} in cart)
    </button>
  );
}
```

`useDispatch` returns the store's dispatch — stable, like Lesson 64's. `useSelector`
subscribes the component to the store and re-renders it when the selected value changes.

## 5. Real project usage

The store lives once, at the root:

```jsx
import { Provider } from 'react-redux';
import { store } from './store';
import { App } from './App';

export function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
```

A typical slice covers one feature:

| Slice | State | Actions |
|---|---|---|
| `user` | `{ profile, status }` | `login`, `logout`, `setProfile` |
| `cart` | `{ items, total }` | `add`, `remove`, `clear` |
| `filters` | `{ search, category }` | `setSearch`, `setCategory` |
| `notifications` | `{ list, unread }` | `push`, `markRead`, `dismiss` |

The selector side, derived at read time:

```jsx
const total = useSelector((state) =>
  state.cart.items.reduce((sum, i) => sum + i.price, 0)
);
```

> [!NOTE]
> The selector runs on every store change. Deriving a small value inline is fine; when the
> derivation is expensive you memoise it — that's exactly what Lesson 79's `createSelector`
> is for.

## 6. Interview explanation

> "Redux Toolkit is the standard way to write Redux. `configureStore` creates the store
> from a map of slice reducers, `createSlice` defines each feature's state, reducers and
> auto-generated actions in one place, and Immer keeps reducer updates immutable while
> reading like mutation."
>
> "In components, `useSelector` reads state and subscribes, `useDispatch` sends actions.
> Data flows one way — dispatch an action, the pure reducer computes new state, subscribers
> re-render. That one-way flow is the whole point."

## 7. Senior-level insights

- **`createSlice` is the key RTK idea.** One block defines state, reducers, and action
  creators — no hand-written action constants, no `switch` sprawl (the Lesson 64 pain).
- **Immer gives you "mutation" that isn't.** The reducer *looks* imperative but produces
  immutable updates. Say "the reducers are still pure — Immer handles the copying" — that's
  the correct, senior phrasing.
- **Slices are per-feature, not per-file.** A slice is a unit of state and its transitions.
  Combine them in the store's reducer map — that's what Lesson 82 calls the architecture
  question.
- **`useSelector` re-renders on reference change.** Return a new array/object from a
  selector and the component re-renders on every store update. Returning a primitive (a
  `length`) is stable; returning a derived array is not. Memoised selectors (Lesson 79) fix
  this.
- **`useDispatch` is stable** — safe in effect deps and callback props without
  `useCallback` (Lesson 62).
- **DevTools are part of the design.** Every action is replayable because reducers are pure.
  "You can time-travel through the action log" is the one-line pitch for the model.

## 8. Common mistakes

- **Mutating state outside a reducer** — Immer only protects inside `createSlice` reducers.
- **Forgetting that `state` inside a slice is that slice's state** — `state.cart.items`,
  not `state.items`, when you have multiple slices.
- **Dispatching the reducer instead of the action** — `dispatch(cartSlice.reducer)` is a
  function, not an action. Dispatch `cartSlice.actions.add(item)`.
- **Reading state without a selector** — reaching into the store via a closure or prop
  threading re-creates the problem context solved.
- **Expensive derived values in selectors** — `reduce` in every subscriber on every update.
  Memoise (Lesson 79) or derive with a selector.
- **One slice per micro-feature** — fragmentation makes the store a mirror of component
  structure. Slices should be state domains, not components.

## 9. Best practices

✅ Put each feature's state + reducers in one `createSlice`

✅ Dispatch action creators (`cartSlice.actions.add`), never the reducer

✅ Read state through `useSelector`; select a primitive when you can

✅ Let Immer handle immutability — don't hand-spread every update

✅ Use `configureStore`'s `reducer` map for multiple slices

✅ Keep reducers pure; put side effects in thunks (Lesson 79)

❌ Don't reach into the store outside components/selectors

❌ Don't derive expensive values inline in `useSelector` without memoisation

❌ Don't use Redux for local component state — that's `useState`/`useReducer`'s job (Lesson 82)

## 10. Interview questions

**Q1. What is Redux Toolkit, and why use it over plain Redux?**

> RTK is the official, batteries-included way to write Redux. `configureStore` sets up the
> store with good defaults, `createSlice` generates actions and reducers together, and
> Immer makes immutable updates read like mutation. Plain Redux needs hand-written action
> constants, reducers, and store wiring; RTK removes that boilerplate while keeping the
> one-way data flow.

**Q2. What is a slice?**

> A slice is a self-contained unit of state: the initial state, the reducers that change it,
> and the actions those reducers generate — all defined together with `createSlice`. Slices
> combine in the store's reducer map, each owning one part of the global state.

**Q3. How does data flow in Redux?**

> One way. A component dispatches an action — a plain object with a `type`. The store runs
> the matching reducer, which computes a new state immutably. Components subscribed via
> `useSelector` re-render when their selected value changes. Nothing mutates the store
> directly; everything goes through dispatch → reducer → new state.

**Q4. How do you connect a React component to the store?**

> Wrap the app in `<Provider store={store}>`, then use `useDispatch` to send actions and
> `useSelector` to read state. `useDispatch` is stable; `useSelector` subscribes the
> component and re-renders it when the selected value changes identity.

**Q5. What does `createSlice` generate?**

> The reducer and the action creators. `cartSlice.reducer` is a pure `(state, action)`
> function, and `cartSlice.actions.add(item)` returns `{ type: 'cart/add', payload: item }`.
> The `type` is auto-named from the slice name and the reducer name.

**Senior follow-up: How do you decide between context and Redux for a new feature?**

> Context for broadcast data — theme, auth, locale — where a handful of values are read
> widely and change rarely. Redux when I need selective subscriptions, derived state, or a
> formal action flow: many parts of the app update from many places, and I want updates
> targeted rather than re-rendering every consumer.
>
> The re-render story is the deciding factor. Context re-renders all consumers on any change;
> Redux re-renders only the components whose selected value changed. If the feature is
> single-purpose and local, I'd use `useState`/`useReducer` before either (Lesson 82).

## 11. Follow-up questions

**Why are Redux reducers pure?**

> So the output depends only on `(state, action)` — which makes every action replayable,
> testable, and debuggable in DevTools. Purity is the same rule as Lesson 14 and Lesson 64.

**What is Immer, exactly?**

> A library that wraps state updates in a draft you can "mutate", then produces a new
> immutable state from the changes. RTK uses it inside every slice reducer, which is why
> `state.items.push(...)` is safe there and dangerous outside it.

**What's the difference between `useSelector` and `useContext`?**

> `useSelector` subscribes to a store and re-renders only when the selected value changes
> identity. `useContext` re-renders on any change to the context value, wholesale. Selectors
> give you the selective updates that context can't (Lesson 77).

**What's the difference between `useSelector` and `useReducer`?**

> `useReducer` is a local hook — one component's transitions. `useSelector` reads from a
> global store shared by the whole app. Redux is essentially `useReducer` lifted to app
> scope, with selectors for targeted subscriptions.

## 12. Comparison table

| | `useState` (L50) | `useReducer` (L64) | Context (L77) | Redux Toolkit |
|---|---|---|---|---|
| Scope | One component | One component | Subtree of consumers | Whole app |
| Holds state? | Yes | Yes | No | Yes |
| Update call | `setValue` | `dispatch({type,payload})` | `setState` in the provider | `dispatch(action)` |
| Selective updates | n/a | n/a | ❌ | ✅ (selectors) |
| Purity | Implicit | Explicit | n/a | Explicit (+Immer) |
| DevTools / replay | ❌ | ❌ | ❌ | ✅ |
| Best for | Local values | Local complex transitions | Broadcast data | App-wide shared state, derived state |

## 13. Code example

The whole loop — store, slice, dispatch, selector — without React, proving the data flow is
just functions:

```js
function createSlice({ name, initialState, reducers }) {
  const actions = {};
  const reducer = (state = initialState, action) => {
    const fn = reducers[action.type.replace(`${name}/`, '')];
    return fn ? fn(state, action) : state;
  };
  for (const key of Object.keys(reducers)) {
    actions[key] = (payload) => ({ type: `${name}/${key}`, payload });
  }
  return { name, reducer, actions };
}

const counter = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => ({ count: state.count + 1 }),
    addBy: (state, action) => ({ count: state.count + action.payload }),
  },
});

let state = counter.reducer(undefined, { type: '@@init' });
state = counter.reducer(state, counter.actions.increment());
state = counter.reducer(state, counter.actions.addBy(5));

console.log(counter.actions.increment());   // the generated action shape
console.log(state.count);                   // 6
```

Output:

```text
{ type: 'counter/increment', payload: undefined }
6
```

```narrate
line 2-6: a createSlice stand-in — name, initialState, reducers in one block
line 12: the reducer is a plain (state, action) => next function
line 19: the generated action is just an object with a type
line 20-21: dispatch is literally "call the reducer with an action"
```

## 14. Performance notes

- **`useSelector` compares by reference.** Select a primitive and the component re-renders
  only when that value changes; select a derived array/object and it re-renders on every
  store update. Memoised selectors (Lesson 79) fix the derived case.
- **`useDispatch` is stable** — no `useCallback` needed for it in deps or props.
- **One subscription per `useSelector`.** Multiple selectors mean multiple subscriptions;
  combine with a single selector when it's cheap, or use `createSelector` (Lesson 79) when
  it's derived.
- **When it matters:** large apps where a store update should re-render a few components,
  not a subtree. That is Redux's actual job.
- **When it doesn't:** small apps, or a single broadcast value — context (Lesson 77) is
  lighter. Redux's DevTools and structure only pay off when the state graph is real.

## 15. Debugging scenarios

**Scenario 1 — "Component doesn't update after dispatch"**

The selector returns a value whose identity doesn't change — or the component reads a
different slice than the one being updated. Check the selector's return value and the
reducer map.

**Scenario 2 — "Component re-renders on every action"**

The selector returns a new array/object each call. Memoise with `createSelector` (Lesson 79)
or select a primitive.

**Scenario 3 — "State is mutated but nothing re-renders"**

Mutation outside Immer — `state.items.push(...)` in a plain reducer or a component. Redux
sees the same object identity and skips the update. Build new objects/arrays.

**Scenario 4 — "Redux DevTools shows nothing"**

The store isn't `configureStore`, or the component isn't inside `<Provider>`. Both are
required for the connection.

**Scenario 5 — "`state.items` is undefined in a component"**

You're reading `state.items` but the slice is mounted as `cart`, so it's
`state.cart.items`. The reducer map names the top-level keys.

## 16. Quick revision notes

- Store: `configureStore({ reducer: { cart: cartReducer } })` — one root reducer
- Slice: `createSlice({ name, initialState, reducers })` → reducer + auto actions
- Actions: `{ type: 'cart/add', payload }` — plain, serialisable objects
- Components: `useSelector` reads + subscribes; `useDispatch` sends actions
- Data flow: dispatch → pure reducer → new state → subscribed components re-render
- Immer makes slice reducers read like mutation but stay immutable
- `useDispatch` is stable; `useSelector` re-renders on selected-value identity change
- Redux is `useReducer` (Lesson 64) lifted to app scope, with selectors

## 17. Cheat sheet

```js
// store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: { cart: cartReducer },
});

// cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    add(state, action) {
      state.items.push(action.payload);
      state.total += action.payload.price;
    },
  },
});

export const { add } = cartSlice.actions;
export default cartSlice.reducer;

// component.jsx
const dispatch = useDispatch();
const total = useSelector((state) => state.cart.total);
dispatch(add({ id: 1, price: 5 }));   // { type: 'cart/add', payload: {...} }
```

## 18. Key takeaways

> [!RECAP]
> - `configureStore` builds the store; `createSlice` builds state + reducers + actions together
> - Actions are plain `{ type, payload }` objects; dispatch sends them one way
> - Reducers are pure — Immer keeps slice reducers immutable while reading like mutation
> - `useSelector` subscribes and re-renders on selected-value change; `useDispatch` is stable
> - Data flow is a loop: dispatch → reducer → new state → re-render
> - Redux is `useReducer` (Lesson 64) at app scope, with the selective updates context can't give
> - Selector identity is the performance lever — memoise derived values (Lesson 79)

## Check your understanding

Answer these without looking back.

1. Name the four moving parts of Redux and define each in one sentence.
2. What does `createSlice` generate from its `reducers` block?
3. Why can a slice reducer "mutate" state, and what makes it safe?
4. Trace one click through the data flow diagram: dispatch, reducer, store, re-render.
5. When does `useSelector` re-render a component — and why does a derived value need care?
6. What's the difference between `useSelector` and `useContext` as subscriptions?
7. When would you choose Redux over context, and when would you not?

## What's Next

**Lesson 79 — Async Thunks & Selectors.** The two places RTK gets deep: `createAsyncThunk`'s
pending/fulfilled/rejected lifecycle for server calls, and memoised `createSelector` for
derived state that doesn't re-render everything on every update.
