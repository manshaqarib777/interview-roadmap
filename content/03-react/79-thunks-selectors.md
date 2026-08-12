# Lesson 79 — Async Thunks & Selectors

**Interview importance:** ⭐⭐⭐ — the two places RTK gets deep, and foundational for what comes next.

Lesson 78 gave you the pure, synchronous store. Real apps are not synchronous: they fetch,
they fail, they load. `createAsyncThunk` takes the three states every async operation has —
pending, fulfilled, rejected — and makes them explicit actions your reducers handle.
Selectors, meanwhile, are how the store *reads*: plain functions from `state` to a value,
which `createSelector` makes memoised.

Both are foundational — the server-state and architecture lessons (81 and 82) build directly
on them, and every "how do you handle loading in Redux" question starts here.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain `createAsyncThunk`'s pending/fulfilled/rejected lifecycle
- Handle all three lifecycle actions in `extraReducers`
- Write a memoised selector with `createSelector` and know when it recomputes
- Say why selectors are how the store reads, and how they beat reading state manually
- Model a fetch with loading/error/data state in one slice

## 1. One-line definition

**`createAsyncThunk` turns an async function into three dispatches — pending, fulfilled,
rejected — handled in `extraReducers`, while `createSelector` memoises derived values so a
selector only recomputes when its inputs actually change.**

## 2. Mental model

An async thunk is a **restaurant order**. You dispatch the order (`pending`) — the kitchen
starts cooking, the table shows "preparing". When the dish is ready it's brought out
(`fulfilled`) with the food; if the kitchen burns it, you get told (`rejected`) with the
reason. The table (the UI) never talks to the kitchen directly — it only reacts to those
three notifications.

A memoised selector is a **marked cupboard**. The first time you open it for a given
configuration you sort everything inside; the next time, if nothing changed, you just grab
the sorted result. Only when the contents change do you sort again.

## 3. Visual flow

```text
   component dispatches fetchUser(7)   (createAsyncThunk)
        │
        ▼
   ┌───────────────────────────────────────────────┐
   │  STORE                                       │
   │  pending   → { status: 'loading', error: null }  ← dispatch #1 (sync)
   │        │  await fetch(...)                    │
   │        ├─ success → fulfilled   { user, status: 'idle' }  ← dispatch #2
   │        └─ failure → rejected    { error, status: 'idle' } ← dispatch #3
   │  handled in extraReducers of the slice        │
   └───────────────────────────────────────────────┘
        │
        ▼
   component reads state.user.status with useSelector → renders loading / data / error

   selectors (createSelector) read + memoise derived values, e.g. visible items.
```

## 4. How it works

### The async thunk

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'users/fetch',                 // action prefix — types become 'users/fetch/pending', etc.
  async (id, { rejectWithValue }) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return rejectWithValue(`HTTP ${res.status}`);  // → rejected
    return await res.json();      // → fulfilled
  }
);
```

The action types are derived automatically: `users/fetch/pending`, `users/fetch/fulfilled`,
`users/fetch/rejected`. The payload of fulfilled is whatever the async function returns; the
payload of rejected is what you threw or passed to `rejectWithValue`.

### Handling the lifecycle — `extraReducers`

```js {2}
const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    logout(state) { state.user = null; state.status = 'idle'; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;          // the resolved value
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'failed to load';
      });
  },
});
```

Output:

```text
No console output — but trace it:
fetchUser(7) dispatched → status 'loading'
  → resolve → action { type: 'users/fetch/fulfilled', payload: user } → user set
  → reject  → action { type: 'users/fetch/rejected', payload: 'HTTP 500' } → error set
status is the single source of truth for the UI: loading / idle + user / idle + error.
```

> [!NOTE]
> `extraReducers` is for actions defined *outside* the slice — like a thunk's three
> lifecycle actions. It keeps the thunk's state transitions next to the slice they mutate,
> without polluting the slice's own `reducers` block. The `builder` callback API is the
> modern form; the older string-map form still appears in legacy code.

### The memoised selector

```js
import { createSelector } from '@reduxjs/toolkit';

const selectItems = (state) => state.cart.items;
const selectFilter = (state) => state.cart.filter;

export const selectVisibleItems = createSelector(
  [selectItems, selectFilter],       // input selectors
  (items, filter) =>                 // the "expensive" combine
    items.filter((i) => i.name.includes(filter))
);
```

`createSelector` caches. It recomputes only when an *input selector* returns a new reference
— never on every store update. When the inputs are unchanged, it returns the previous result
by identity.

## 5. Real project usage

The status field is the standard way to model an async fetch:

```jsx
function UserPage() {
  const { user, status, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => { dispatch(fetchUser(7)); }, [dispatch]);

  if (status === 'loading') return <Spinner />;
  if (status === 'idle' && error) return <Error message={error} />;
  return user ? <Profile user={user} /> : <Empty />;
}
```

Three things to notice: the effect (Lesson 57) dispatches the thunk once, `status` drives
the UI branches, and the derived `visibleItems` selector is shared by components that would
otherwise each run the filter:

```jsx
// two components, one memoised derivation
const items = useSelector(selectVisibleItems);
```

When one selector is composed from others — the "combine" stage recomputes only when the
relevant input changed:

```jsx
const selectVisibleTotal = createSelector(
  [selectVisibleItems],
  (visible) => visible.reduce((sum, i) => sum + i.price, 0)
);
```

## 6. Interview explanation

> "`createAsyncThunk` takes an async function and generates three action types — pending,
> fulfilled and rejected — which I handle in `extraReducers`. The slice keeps a `status`
> field and the UI renders loading, data or error from it."
>
> "Selectors are pure functions from state to a value. `createSelector` memoises them: it
> only recomputes when an input selector returns a new reference, so derived values are
> stable across unrelated store updates. That's how the store reads efficiently."

## 7. Senior-level insights

- **The three lifecycle actions are synchronous dispatches.** `pending` fires before the
  await, `fulfilled`/`rejected` after. The reducer only ever sees plain, synchronous actions
  — which is why the whole reducer purity argument from Lesson 78 still holds.
- **`rejectWithValue` is the canonical error path.** It lets a rejected promise carry a
  meaningful payload (an API error object) into `action.payload`, instead of the raw error.
  Teams that skip it end up string-parsing errors in reducers.
- **The `status` field is a state machine.** `idle → loading → idle(+data|+error)` is a
  small, deliberate machine. Enumerate the states out loud in an interview and you sound
  like you've shipped this.
- **`createSelector` recomputes on *reference* change, not content change.** The filter
  string may be "same" semantically, but if a new string was created, it recomputes. Cache
  invalidation is by input identity — the exact Lesson 77/78 lesson, in selector form.
- **Memoised selectors exist for the same reason memo does (Lesson 67):** keep derived
  values stable so subscribers don't re-render. The memo's dependency array and the
  selector's input list are the same idea.
- **Compose selectors.** Building `selectVisibleTotal` from `selectVisibleItems` keeps each
  selector small and testable — pure functions of state (Lesson 14), testable without React.

## 8. Common mistakes

- **Handling a thunk's actions in `reducers` instead of `extraReducers`** — the slice can't
  see the thunk's actions there. They belong in `extraReducers`.
- **Forgetting `pending` resets error** — the UI keeps showing last time's error during a
  reload. Reset `error` to `null` in pending.
- **Loading state that never clears** — if `fulfilled`/`rejected` don't set `status` back
  to `idle`, the spinner spins forever. Every terminal action must set it.
- **Deriving in `useSelector` without memoisation** — a new array per call re-renders the
  component on every store update (Lesson 78's selector-identity rule).
- **`createSelector` with a spread return** — returning a new object/array from the combine
  function is still a new reference each time the inputs change; that's correct, but it means
  downstream selectors recompute too. Keep combine functions pure and small.
- **Using `Date.now()` or randomness inside a selector** — a selector must be a pure
  function (Lesson 14), or memoisation gives stale/wrong results.

## 9. Best practices

✅ Model async as a `status` field: `idle → loading → idle` with `error` alongside

✅ Handle thunk lifecycle actions in `extraReducers` with the `builder` API

✅ Use `rejectWithValue` so rejected actions carry a useful payload

✅ Derive with `createSelector` when a `useSelector` computation is non-trivial

✅ Compose selectors from smaller selectors; keep each a pure function of state

✅ Reset `error` in `pending`; always return to `idle` in fulfilled and rejected

❌ Don't put side effects (fetch, logging, `Date.now()`) in reducers or selectors

❌ Don't create derived arrays inline in `useSelector` for expensive computations

❌ Don't read store state outside selectors — components should go through `useSelector`

## 10. Interview questions

**Q1. What is `createAsyncThunk`?**

> A helper that wraps an async function and generates three action types — `pending`,
> `fulfilled` and `rejected`. Dispatching the thunk fires pending synchronously, then
> fulfilled with the resolved value or rejected with the error. I handle all three in
> `extraReducers` and drive the UI from a `status` field.

**Q2. What is `extraReducers`?**

> The place in a slice to handle actions defined elsewhere — specifically a thunk's three
> lifecycle actions. `reducers` generates actions from the slice itself; `extraReducers`
> lets other actions update this slice's state. The `builder` callback form
> (`builder.addCase(...)`) is the modern API.

**Q3. Why do you need selectors, and what does `createSelector` add?**

> Selectors are pure functions from state to a value — the only sanctioned way to read the
> store. `createSelector` memoises them: it recomputes only when an input selector returns a
> new reference, and otherwise returns the cached result. That keeps derived values stable,
> so components don't re-render on every store update.

**Q4. When does a memoised selector recompute?**

> When any of its input selectors returns a new reference — a new object or array, or a
> changed primitive. If the inputs are identical by reference, it returns the cached result
> without running the combine function. That's why the selector's performance depends on the
> *inputs'* stability.

**Q5. How do you handle loading and error states?**

> A `status` field on the slice — `idle`, `loading`, plus data or error when settled.
> `pending` sets `status: 'loading'` and clears the error; `fulfilled` stores the payload
> and goes back to `idle`; `rejected` stores the error payload and goes back to `idle`. The
> component switches on `status` to render a spinner, the data, or an error.

**Senior follow-up: How would you structure a slice for a fetch that has retry and caching?**

> The `status` machine stays, but I'd think about server state properly: caching, retries
> and invalidation are TanStack Query's job (Lesson 81), not a hand-rolled thunk. Where I do
> need a thunk, I'd keep the slice thin — status plus data — and put retry/caching logic in
> the async function or a dedicated server-state layer, not in the reducer.

## 11. Follow-up questions

**What's the difference between `reducers` and `extraReducers`?**

> `reducers` generates action creators from the slice itself. `extraReducers` handles actions
> created elsewhere — a thunk's lifecycle actions, or another slice's actions — without
> generating new creators. Same reducer shape, different origin of the action.

**Can two thunks update the same slice?**

> Yes — `extraReducers` can `addCase` for any thunk. That's how a shared UI slice reacts to
> several fetches. Just keep each case small and the status transitions explicit.

**How do you cancel or avoid stale results?**

> Use an `AbortController` (from Lesson 27's error handling) or ignore a late
> `fulfilled`/`rejected` — e.g. a generation counter, or TanStack Query's cancellation
> (Lesson 81). The three-action lifecycle is a contract, but nothing stops a stale response
> arriving after a newer one; guard against it.

**What's the difference between a selector and `useMemo`?**

> A selector is a pure function of state, reusable and testable outside React.
> `useMemo` caches a computation inside one component instance. A memoised selector gives
> the same caching benefit but shared across components — the React-free, store-aware
> version of the same idea (Lesson 61).

## 12. Comparison table

| | Plain `useEffect` fetch | Thunk (L79) | TanStack Query (L81) |
|---|---|---|---|
| Where state lives | Local `useState` | Redux slice (`status`, data, error) | Its own cache |
| Loading/error handling | Hand-rolled per component | Three lifecycle actions | Built-in |
| Retries | Manual | Manual | Built-in |
| Caching / invalidation | None | None | Built-in |
| Best for | One-off local fetch | Global state driven by server | Heavy server state |

| | Plain selector | `createSelector` |
|---|---|---|
| Recomputation | Every call | Only when inputs change reference |
| Memoised | ❌ | ✅ |
| Pure function | ✅ | ✅ |
| Best for | Cheap reads | Derived / expensive reads |

## 13. Code example

The full lifecycle, simulated in plain JS — no Redux needed:

```js
function createAsyncThunk(prefix, asyncFn) {
  return (payload) => {
    const dispatch = (type, extra = {}) =>
      events.push({ type: `${prefix}/${type}`, ...extra });

    dispatch('pending');
    return asyncFn(payload).then(
      (result) => { dispatch('fulfilled', { payload: result }); return result; },
      (err) => { dispatch('rejected', { payload: err.message }); throw err; }
    );
  };
}

const events = [];
const fetchUser = createAsyncThunk('users/fetch', async (id) => {
  if (id < 0) throw new Error('not found');        // rejection path
  return { id, name: 'Ali' };                       // resolution path
});

await fetchUser(7).catch(() => {});
await fetchUser(-1).catch(() => {});

console.log(events);
```

Output:

```text
[
  { type: 'users/fetch/pending' },
  { type: 'users/fetch/fulfilled', payload: { id: 7, name: 'Ali' } },
  { type: 'users/fetch/pending' },
  { type: 'users/fetch/rejected', payload: 'not found' }
]
```

```narrate
line 5: pending always dispatches first, synchronously
line 7-8: fulfilled carries the resolved value; rejected carries the error
line 14-15: the thunk is just a function that dispatches at the right moments
```

And the memoisation, in plain JS:

```js
function createSelector(inputs, compute) {
  let lastInputs = null;
  let lastResult = null;
  return (state) => {
    const current = inputs.map((f) => f(state));
    if (lastInputs !== null && current.every((v, i) => v === lastInputs[i])) {
      return lastResult;                      // cache hit — no recompute
    }
    lastInputs = current;
    lastResult = compute(...current);
    return lastResult;
  };
}

let calls = 0;                      // counts combine invocations
const selectItems = (s) => s.items;
const selectVisible = createSelector(
  [selectItems],
  (items) => {
    calls += 1;                     // runs only when the input reference changes
    return items.filter((i) => i.visible);
  },
);

const state1 = { items: [{ id: 1, visible: true }, { id: 2, visible: false }] };
selectVisible(state1);
selectVisible(state1);              // same state reference — cached
console.log('calls with same state:', calls);     // 1

const state2 = { items: [...state1.items] };      // new array reference
selectVisible(state2);
console.log('calls with new reference:', calls);  // 2
```

Output:

```text
calls with same state: 1
calls with new reference: 2
```

The second read of the *same* state object hits the cache. The moment the items array gets a
new reference, the combine runs again — exactly how `createSelector` behaves in RTK.

## 14. Performance notes

- **A thunk's lifecycle is cheap.** Three dispatches, each a synchronous reducer call. The
  cost is in re-renders: every slice update notifies every subscriber, so the selector
  stability from `createSelector` is what actually keeps the tree quiet.
- **`createSelector` is a cache, not a guarantee.** It caches one result per input
  combination. If your state legitimately produces many distinct inputs, you get cache
  misses — which is correct behaviour, not a leak.
- **When it matters:** a large store with many subscribers and derived lists — the filter
  case above. Without memoisation, every store update re-filters and re-renders.
- **When it doesn't:** a handful of subscribers reading primitives. `createSelector` adds a
  layer; don't add it to a selector that returns `state.cart.total` directly.
- **The real cost is subscription, not computation.** Memoised selectors reduce *re-renders*,
  which is the same lever Lesson 67's `memo` pulls — fewer renders, not faster math.

## 15. Debugging scenarios

**Scenario 1 — "Spinner never stops"**

`fulfilled` or `rejected` doesn't set `status` back to `idle`. Check `extraReducers` has all
three cases, and that `status` is set on both terminal actions.

**Scenario 2 — "Component re-renders on every store update"**

The selector returns a new array/object each call (an inline filter or reduce). Memoise with
`createSelector` or select a primitive.

**Scenario 3 — "Error shows during reload"**

`pending` doesn't reset `error` to `null`, so the old error renders while loading. Clear
`error` in the pending case.

**Scenario 4 — "Stale data wins"**

A slow request resolves after a newer one. Guard with an `AbortController` (Lesson 27) or a
request-generation counter, or move to a server-state layer (Lesson 81).

**Scenario 5 — "Memoised selector returns stale value"**

One of the input selectors returns a value that *looks* the same but is a new reference — or
an input selector reads a field that changed elsewhere. The cache keys on input identity;
make the input selectors read exactly what the combine uses.

## 16. Quick revision notes

- `createAsyncThunk('users/fetch', fn)` → `pending` / `fulfilled` / `rejected` action types
- Handle them in `extraReducers` with the `builder` API
- `status`: `idle → loading → idle` (+ `user` or `error`) — a small state machine
- `rejectWithValue` carries a useful payload into the rejected action
- Selectors are pure functions of state; `useSelector` is how components read
- `createSelector` recomputes only when an input returns a new reference
- Memoised selectors reduce re-renders — the Lesson 67 `memo` idea, store-side
- Reducers and selectors stay pure (Lesson 14) — side effects belong in the thunk
- Server-state concerns (caching, retries) belong in TanStack Query (Lesson 81)

## 17. Cheat sheet

```js
// thunk
export const fetchUser = createAsyncThunk(
  'users/fetch',
  async (id, { rejectWithValue }) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return rejectWithValue(`HTTP ${res.status}`);
    return await res.json();
  }
);

// slice — lifecycle in extraReducers
const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, status: 'idle', error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchUser.fulfilled, (s, a) => { s.status = 'idle'; s.user = a.payload; })
      .addCase(fetchUser.rejected, (s, a) => { s.status = 'idle'; s.error = a.payload; });
  },
});

// memoised selector
const selectVisible = createSelector(
  [(s) => s.cart.items, (s) => s.cart.filter],
  (items, filter) => items.filter((i) => i.name.includes(filter))
);

// in a component
const status = useSelector((s) => s.user.status);
dispatch(fetchUser(7));
```

## 18. Key takeaways

> [!RECAP]
> - `createAsyncThunk` turns one async function into pending/fulfilled/rejected dispatches
> - `extraReducers` is where those lifecycle actions update the slice
> - A `status` field (`idle → loading → idle`) is the canonical way to model async UI
> - `rejectWithValue` keeps rejected actions meaningful
> - Selectors are pure functions from state to a value (Lesson 14, applied)
> - `createSelector` memoises: recompute only when an input selector changes reference
> - Memoised selectors prevent re-renders — the same lever as `memo` (Lesson 67)
> - Server state at scale is TanStack Query's job (Lesson 81); thunks cover the rest
> - Foundational: Lessons 81 and 82 build directly on this

## Check your understanding

Answer these without looking back.

1. Name the three action types `createAsyncThunk` generates, and when each dispatches.
2. Why do lifecycle actions go in `extraReducers` and not `reducers`?
3. What happens to the UI if you forget to set `status` back to `idle` on rejection?
4. When does a `createSelector` selector recompute — and when does it hit the cache?
5. Why does an inline derived array in `useSelector` re-render on every store update?
6. How does `rejectWithValue` improve error handling over throwing?
7. Where would you put caching and retries instead of hand-rolling them in a thunk?

## What's Next

**Lesson 80 — Zustand.** The modern lightweight alternative — a store with no boilerplate,
no provider tree, and selector-like subscriptions. Expect the comparison question: "When
Zustand, when Redux, when context?"
