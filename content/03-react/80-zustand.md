# Lesson 80 — Zustand

**Interview importance:** ⭐⭐⭐ — the modern lightweight alternative — expect a comparison question.

Zustand is the small store that ate React's state-management question. A few lines of
setup, a selector-based subscription model, no providers, no boilerplate — and it is
genuinely faster than Context for high-frequency updates. Interviewers know the default
answer to "how do you manage global state?" is still Redux; showing up with a precise
Zustand-vs-Redux-vs-Context comparison is a fast senior signal.

This lesson assumes you already know Context (Lesson 77) and Redux Toolkit (Lesson 78).
Zustand is best understood *in contrast* to both: what it keeps, what it drops, and which
parts of your app should still not use it at all.

## Learning Objectives

By the end of this lesson you should be able to:

- Create a store with `create`, and read/update state with `get`, `set` and `set(partial)`
- Explain why selector subscriptions stop the re-render-everything problem from Lesson 77
- Choose between `useStore(s => s.x)` and `useShallow` when the selector returns an object
- Walk through Zustand vs Context vs Redux and say when each one earns its keep
- Say why Zustand does not belong inside a server state layer (previewing Lesson 81)

## 1. What is Zustand?

**Zustand is a tiny external store you subscribe to with hooks — no provider, no wrapper component, no action boilerplate.**

The whole API is one function, `create`, plus the `useStore` hook it hands back. State
lives outside React entirely; React only re-renders the components that selected the piece
that changed. From Lesson 77's model: it is Context's sharing without Context's
re-render-every-consumer cost, and Redux's store without Redux's ceremony.

## 2. Mental Model

Think of Zustand as a **shared whiteboard with per-person subscriptions**.

The whiteboard (the store) lives outside the room. Each component writes its own name next
to the facts it cares about — "tell me when `user` changes". When someone edits the
whiteboard, only the named people get paged. Everyone else keeps working.

Context is the opposite: it broadcasts every change to the whole room. Redux is the same
whiteboard, but every edit must be filed through a clerk (the reducer) and each reader gets
a name tag (a selector) by hand. Zustand keeps the subscription idea and deletes the clerk
and the name tags — you can write to the board directly.

## 3. Visual Flow

```text
  ┌──────────────────────────────────────────────────────┐
  │  store (outside React — plain JS object)             │
  │  { count: 0, actions: { inc } }                      │
  └──────────────┬───────────────────────────────────────┘
                 │ set() mutates the store
                 ▼
  ┌──────────────────────────────────────────────────────┐
  │  each subscriber holds its own selector              │
  │  useCart(s => s.items)      useCart(s => s.total)    │
  └──────────────┬───────────────────────────────────────┘
                 │ Object.is on the SELECTED value
                 ▼
  subscriber A re-renders       subscriber B skips
  (items changed)               (total unchanged)
```

The second box is the whole trick: comparison happens on the *selected* value, not on the
store object. That is what Lesson 77's context consumers cannot do.

## 4. How It Works

`create` builds a store object and returns a hook bound to it. Inside the store you get
`get` (read the current state) and `set` (merge a partial, or apply an updater function).

```js {2}
// store.js — plain JS, no provider needed
import { create } from 'zustand';

export const useCart = create((set, get) => ({
  items: [],
  total: 0,
  add: (item) =>
    set((state) => {
      const items = [...state.items, item];
      return { items, total: items.reduce((sum, i) => sum + i.price, 0) };
    }),
  clear: () => set({ items: [], total: 0 }),
  count: () => get().items.length,   // read current state imperatively
}));
```

```text
store created:  { items: [], total: 0, add: fn, clear: fn, count: fn }
add({ id: 1, price: 9 })  →  { items: [item], total: 9 }
add({ id: 2, price: 1 })  →  { items: [item, item], total: 10 }
clear()                   →  { items: [], total: 0 }
```

```narrate
1: the whole API — one call to create, nothing else to wire up
2: set merges a partial into the state; get reads the current snapshot
4: the updater form of set receives the latest state — safe under batching
```

`set` merges shallowly (like Lesson 20's spread), so returning only `{ items, total }`
leaves every other key untouched. Components subscribe with a selector:

```jsx
// CartIcon.jsx
import { useCart } from './store';

function CartIcon() {
  const count = useCart((s) => s.items.length);   // subscribe to ONE value
  return <span className="badge">{count}</span>;
}
```

```text
items changes → CartIcon re-renders (its selected value changed)
user changes  → CartIcon does NOT re-render (it never selected user)
```

This is `useSyncExternalStore` under the hood — the same mechanism React itself uses for
`useTransition` and the one `src/lib/store.ts` uses for learner state. Zustand is React's
own recommended pattern, packaged.

## 5. Real Project Usage

The store never holds data that other sources own (that is Lesson 81's job — more below).
Day-to-day Zustand usage looks like:

| Feature | Store shape | Why it works |
|---|---|---|
| Auth session | `{ user, token, login(), logout() }` | read everywhere, written rarely — trivial selectors |
| Cart / wishlist | `{ items, total, add, remove }` | high-frequency writes, per-line subscriptions |
| UI flags & toasts | `{ toasts, push, dismiss }` | cross-cutting UI state, actions are one-liners |
| Theme + sidebar | `{ theme, setTheme, sidebarOpen, toggle }` | the classic "should this be context?" case |
| Optimistic mutations | `{ pending, applyOptimistic, rollback }` | transient client-side state around server calls |

One real app's split: **Zustand for the cart and the auth session, TanStack Query for every
product and order endpoint, Context for the theme.** That division is Lesson 82 in
miniature — each tool owns the state class it is good at.

## 6. Interview Explanation

> Zustand is a small external store with a hook-based API. `create` builds the store,
> `set`/`get` read and write it, and components subscribe with selectors —
> `useStore(s => s.items)` — so a change re-renders only the components whose selected
> value changed. There is no provider and no action/reducer ceremony: state and actions
> live in one object, and you can read or update it outside React with `getState`/`setState`.
> Where Context re-renders every consumer and Redux wraps updates in actions, Zustand is
> direct — which is why it wins for high-frequency client state.

## 7. Senior-Level Insights

- **Selector precision is the whole game.** `useStore(s => s.items.length)` re-renders on
  length changes; `useStore(s => s.items)` re-renders whenever the *array reference*
  changes (Lesson 6), even for an unrelated edit elsewhere in it. Say both out loud.
- **`useShallow` is the object-selector escape hatch.** Returning a freshly-built object
  from a selector breaks `Object.is` every time. `useStore(useShallow(s => ({ a: s.a, b: s.b })))`
  compares the fields structurally — from Lesson 58's dependency-array lesson, in store
  form.
- **Equality is configurable, not magic.** The third argument to `useStore` is a custom
  equality function. The default is `Object.is`; replacing it is how people implement
  deep-compare or custom change detection.
- **The store is not a cache.** Server data cached in Zustand re-hydrates, goes stale, and
  never invalidates. That is the single most senior thing to say in this interview (Lesson 81).
- **One store per domain, not one mega-store.** Two stores — `useCart` and `useSession` —
  keep subscriptions small and prevent one update from touching unrelated readers.

## 8. Common Mistakes

- **`useStore()` with no selector.** Subscribes to the *entire* store — every change
  re-renders the component, which is Context-level broadcast with none of the benefit.
  Always select the smallest slice you actually render.
- **Selecting a whole object for one field.** `useStore(s => s.user).name` re-renders on
  *any* `user` change. Select `s => s.user.name` instead.
- **Mutating state outside `set`.** `useCart.getState().items.push(x)` writes to the store
  and notifies nobody — no subscriber re-renders. Everything goes through `set`.
- **New object in the selector.** `useStore(s => ({ n: s.count }))` is a fresh reference
  every render, so it re-renders constantly. Use `useShallow` or select primitives.
- **Storing server responses in Zustand.** Duplicates data you do not own, re-implements
  caching and invalidation badly, and misses retries and background refetch. Let TanStack
  Query own that (Lesson 81).
- **Creating the store inside a component.** `create` is called once at module scope. In a
  component body it makes a *new store every render* — components that import it each get a
  different one.

## 9. Best Practices

✅ Call `create` at module scope — one store instance, imported everywhere

✅ Select the smallest slice: `useStore(s => s.items.length)`, not the whole `items`

✅ `useShallow` when the selector must return an object — never a fresh inline object

✅ Write through `set` only — the updater form for anything depending on current state

✅ Split stores by domain — auth, cart, UI flags — and keep subscriptions narrow

✅ Read imperatively with `getState()` in event handlers and outside React (analytics, timers)

❌ Don't put server data in the store — it has no cache, no retry, no invalidation (Lesson 81)

❌ Don't reach for Zustand for state that should be local or derived (Lesson 55, Lesson 82)

## 10. Interview Questions

**Q1. What is Zustand, and how does it differ from Context?**

> Zustand is an external store you subscribe to with a hook. `create` builds the store and
> returns a hook; components select the slice they render. Context is a React-internal
> mechanism for passing values down a tree — every consumer re-renders when the value
> changes, and there is no way to subscribe to part of it. Zustand gives you selector-level
> subscription without providers or wrapping components, so it is a state manager while
> Context is a dependency-injection mechanism. Lesson 77 covered why that distinction
> matters.

**Q2. How does Zustand compare to Redux Toolkit?**

> Both are external stores with selector subscriptions. Redux formalises the write path:
> updates go through actions and reducers, middleware handles side effects, and the store
> is meant to be serialisable and time-travellable. Zustand keeps the subscribe/select
> model and drops the ceremony — you call actions directly and can update outside React.
> Redux Toolkit still wins for very large apps with strict rules and devtools-driven
> workflows; Zustand wins for the common case of shared client state with less
> boilerplate. Lesson 78 covers the Redux side.

**Q3. Why does Zustand not re-render every component?**

> Because each subscription holds a selector, and Zustand compares the *selected value* to
> its previous value with `Object.is`. A store change re-renders only the components whose
> selected slice changed. Compare that with Context, where the single value changing
> re-renders every consumer — from Lesson 77, that is the cost people miss.

**Q4. Why do you need `useShallow`?**

> Because if a selector returns a freshly-built object — `s => ({ a: s.a, b: s.b })` — that
> object is a new reference every render, so `Object.is` fails and the component re-renders
> constantly. `useShallow` compares the returned object field by field instead of by
> reference. It is the store form of the Lesson 6 reference trap.

**Q5. Can you use Zustand outside React?**

> Yes — that is a feature. `useCart.getState()` and `useCart.setState(...)` work in event
> handlers, timers, analytics and plain modules, because the store is just a JavaScript
> object. Components subscribe with the hook; the rest of the app can read and write
> without hooks. Redux has the same property via the store object, but Zustand ships it
> without the provider wiring.

**Senior follow-up: Where would you NOT use Zustand?**

> For server state. Fetching, caching, retrying, background refetch and invalidation are
> not client-state problems — caching that data in Zustand re-implements a cache poorly
> and goes stale. That belongs in TanStack Query (Lesson 81). I also would not use Zustand
> for state that only one component or a parent-child pair needs — that is `useState`
> (Lesson 50) or lifting state (Lesson 55). Zustand is for state that is genuinely shared
> across the app and not owned by the server.

## 11. Follow-up Questions

**How do you handle async actions in Zustand?**

> By writing them as ordinary async functions in the store — there is no middleware layer
> to configure. The action `await`s the request, then calls `set` with the result. The
> twist worth knowing: async actions belong in the store *only* for client-side state;
> for server data the loading/error/success transitions should live in TanStack Query
> (Lesson 81), which manages them for you.

**What happens if two stores need to share state?**

> Prefer composition over coupling. One store reads another's `getState()` for a snapshot,
> or you lift the shared slice into its own store and both depend on it. Zustand has no
> cross-store dispatch like Redux middleware; the fix is usually to ask whether the two
> stores actually hold one domain.

**How does Zustand interact with React 18's concurrent features?**

> `useSyncExternalStore` is what makes it safe: React can read the store during rendering
> and get a consistent snapshot, and tearing (different components seeing different
> versions of the store in one render) is prevented. That is the same guarantee React
> itself relies on for its built-in state.

## 12. Comparison Table

| | Context (L77) | Redux Toolkit (L78) | Zustand |
|---|---|---|---|
| Store location | React tree | Outside React | Outside React |
| Provider needed | ✅ | ✅ | ❌ |
| Re-render scope on change | Every consumer | Only selected subscribers | Only selected subscribers |
| Selector control | ❌ | ✅ | ✅ |
| Write path | `setValue` | Action → reducer | Direct `set` / action fn |
| Boilerplate | Low | Medium | Minimal |
| Middleware / devtools | ❌ (L75) | ✅ | Optional plugin |
| Outside-React access | ❌ | ✅ | ✅ |
| Best for | Theme, locale, DI | Large strict stores | Shared client state, high-frequency UI |

## 13. Code Example

A store with `get`, `set` and a `useShallow` subscription, modelled in plain JS:

```js
// A minimal Zustand-core: a store factory with subscribe + getSnapshot.
function createStore(initializer) {
  let state = initializer({ set, get });
  const listeners = new Set();

  function set(partial) {
    state = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
    listeners.forEach((l) => l());
  }
  function get() { return state; }

  return {
    getState: get,
    setState: set,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

const cart = createStore((set, get) => ({
  items: [],
  total: 0,
  add: (item) => set((s) => {
    const items = [...s.items, item];
    return { items, total: items.reduce((sum, i) => sum + i.price, 0) };
  }),
  count: () => get().items.length,
}));

const counts = [];                       // pretend these are subscribers
cart.subscribe(() => counts.push(cart.getState().count()));

console.log('initial:', cart.getState());
cart.getState().add({ id: 1, price: 9 });
cart.getState().add({ id: 2, price: 1 });
console.log('after adds:', cart.getState().total);
console.log('imperative read:', cart.getState().count());
console.log('subscriber saw:', counts.join(', '));
```

```text
initial: { items: [], total: 0, add: fn, count: fn }
after adds: 10
imperative read: 2
subscriber saw: 1, 2
```

The pattern to notice: every write goes through `set`, and subscribers are told the store
changed — they then read the slices they care about. That is exactly Zustand's contract,
minus the `useSyncExternalStore` bridge.

```narrate
3: state lives in the closure; set/get close over it (Lesson 5, again)
12: set merges a partial — or applies an updater function
27-28: subscribers are notified, then read their own slice
```

## 14. Performance Notes

- **Selectors are the performance surface.** Subscribe to the exact value you render and a
  high-frequency store — a typing cursor, an animation frame — touches only its readers.
  That is the concrete win over Context's broadcast (Lesson 77).
- **Watch the reference trap.** Selecting a whole array re-renders on any change to it
  (Lesson 6). Select a derived primitive (`length`, `total`) or memoise in the selector
  when the derivation is real work.
- **`useShallow` costs a small compare per render.** It is cheaper than the re-render it
  prevents; reach for it when a selector must return an object.
- **Most Zustand apps do not need further optimisation.** The store lives outside React, so
  store writes never cascade through a provider tree. Measure before adding memoisation —
  the Lesson 71 reflex.

## 15. Debugging Scenarios

**Scenario 1: "My component never updates after I call a store action."**

You mutated state outside `set` — `getState().items.push(x)` — so no listener fired. Fix:
`setState({ items: [...] })` or an action that calls `set`. If you are inside an async
function, check that you are not mutating a *captured* snapshot from before the `await`
(Lesson 5).

**Scenario 2: "My component re-renders on every store change."**

You called `useStore()` with no selector, or the selector returns a new object each time.
Fix the selector: pick primitives, or wrap the object with `useShallow`.

**Scenario 3: "Two tabs of the app see different state."**

The store was created inside a component (or inside a function that runs per mount), so
each consumer got its own instance. Move `create` to module scope — one store per module,
imported everywhere.

**Scenario 4: "The UI flashes stale data after a save."**

The store holds a copy of server data that nothing invalidates. Stop caching server data
in Zustand — move the fetch to TanStack Query (Lesson 81) and let the store hold only
client-side state.

## 16. Quick Revision Notes

- `create((set, get) => ({...}))` — state + actions in one object, module scope
- `set(partial)` merges; `set(updater)` builds on current state; `get()` reads
- Subscribe with a selector: `useStore(s => s.items.length)` — smallest slice you render
- New object in a selector → constant re-renders → `useShallow`
- No provider, no actions/reducers — write directly, read outside React with `getState()`
- Per-store subscription beats Context's broadcast for high-frequency state (Lesson 77)
- Redux keeps the ceremony for strict large stores (Lesson 78); Zustand drops it
- Server data does NOT belong here — that is TanStack Query's job (Lesson 81)

## 17. Cheat Sheet

```text
create((set, get) => ({ ...state, ...actions }))   // module scope, once

set({ count: 1 })                    // merge a partial
set((s) => ({ count: s.count + 1 })) // updater form — safe under batching
get()                                // read current state inside actions

const n = useStore((s) => s.items.length)            // subscribe to a slice
const obj = useStore(useShallow((s) => ({ a, b })))  // object slice → structural compare
useStore((s) => s.items)             // ⚠️ new array ref → re-renders on any change

getState() / setState()              // outside React: handlers, timers, analytics
```

## 18. Key Takeaways

> [!RECAP]
> - Zustand is a tiny external store with hook subscriptions — no provider, no boilerplate
> - `create` returns a store hook; `set` writes (merge or updater), `get` reads
> - Selectors decide who re-renders: compare the selected value, not the whole store
> - A fresh object from a selector breaks `Object.is` — reach for `useShallow`
> - `useSyncExternalStore` is the bridge that makes it concurrent-safe
> - It fixes Context's re-render-everyone problem (Lesson 77) and skips Redux's ceremony (Lesson 78)
> - Client state only — server data, caching and invalidation belong to TanStack Query (Lesson 81)

## Check your understanding

Answer these without looking back.

1. Write a `create` store with `items`, `total` and an `add` action in the updater form.
2. Why does `useStore()` with no selector behave like Context's broadcast?
3. A selector returning `{ n: s.count }` re-renders constantly. Explain why and fix it.
4. What is `useShallow` comparing, and when do you need it?
5. Walk through Zustand vs Context vs Redux: who re-renders, who needs a provider, and what the write path looks like.
6. Name two things that do not belong in a Zustand store, and where each belongs instead.

## What's Next

**Lesson 81 — TanStack Query.** Server state is not client state — and the moment you agree,
caching, retries, background refetch and invalidation stop being things you hand-roll and
become a library's job. The senior marker is understanding the distinction before touching
any code.
