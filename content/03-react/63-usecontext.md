# Lesson 63 — useContext

**Interview importance:** ⭐⭐⭐⭐ — "What's the difference between Context and Redux?" is a guaranteed question.

The first thing to unlearn: `useContext` is not a state manager. It has no state of its own,
no action model, no rules about when things update. It is one thing only — a way to read a
value that lives *above* you in the tree. And crucially: **why context is not a state manager
and re-renders everything.** The cost is built into the design — every consumer re-renders
whenever the value changes.

## Learning Objectives

By the end of this lesson you should be able to:

- Build a `createContext` / `Provider` / `useContext` trio without looking anything up
- Explain why *every* consumer re-renders when the context value changes
- Say precisely why context is not a state manager
- Fix the "whole app re-renders" problem by memoising the context value with `useMemo`
- Diagnose prop-drilling from a code smell to a decision point

## 1. What is Context?

**Context is a way to pass a value down the tree without threading it through props — and
its cost is that every consumer re-renders whenever the value changes.**

Two pieces: a `Provider` that supplies the value, and a `useContext` hook that reads it. A
value is only ever read by components that *opt in* — but once they opt in, they re-render on
every change, no matter how deep they are. And it is not a state manager: the state still
lives in `useState` above the provider, and context just *delivers* it. It holds nothing,
updates nothing, and can't decide who re-renders.

## 2. Mental Model

Think of a **wireless channel**, not a state container:

- The `Provider` broadcasts on a frequency.
- A `useContext(MyCtx)` call tunes in to that frequency.
- Props are cables — you must plug each hop. Context is radio — one broadcast, many receivers.

State (from Lesson 50) still lives in `useState` inside the provider. Context is just the
delivery mechanism. This separation — *state lives here, context delivers it over there* —
is the sentence that stops you from treating context as a state manager.

## 3. Visual Flow

```text
        <ThemeProvider value={theme}>        state lives HERE (useState)
        ┌───────────────────────────┐
        │  App                      │
        │   └─ value={theme} ───────┼─── broadcast on the ThemeCtx frequency
        └───────────────────────────┘
                 │                    │
        ┌────────▼──────┐    ┌────────▼────────┐
        │ Header        │    │ Sidebar         │
        │  useTheme()   │    │  (no useContext │
        │  → re-renders │    │   — stays still)│
        └───────────────┘    └─────────────────┘

   theme changes → Header re-renders. Sidebar never opted in → it does not.
   Opt-in is per component, and "opt in" means "re-render on every change".
```

## 4. How It Works

`createContext` returns an object with a `Provider` and a `Consumer`. Modern code only uses
the `Provider` half, with `useContext` on the reading side:

```jsx {4,8}
const ThemeCtx = createContext('light');        // default used only with no Provider

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeCtx.Provider value={theme}>          // broadcast
      <Header />
      <Sidebar />
    </ThemeCtx.Provider>
  );
}

function Header() {
  const theme = useContext(ThemeCtx);          // tune in
  return <div className={`header header--${theme}`}>Theme: {theme}</div>;
}
```

```narrate
4: The state lives here, in a plain useState — context never holds it.
6: The Provider broadcasts the value on every render.
13: Header tunes in with useContext and re-renders whenever the value changes.
```

Reading `useContext(ThemeCtx)` subscribes that component to the context. When the `value`
prop of any matching `Provider` changes, React re-renders the component — and does **not**
skip it, even if it's `memo`ised. Context subscriptions beat the memo shortcut.

> [!NOTE]
> "Re-renders everything" is the common shorthand, but the precise claim is: *re-renders
> every consumer of that context*. Components that never call `useContext(ThemeCtx)` are
> untouched. Saying the precise version in an interview sounds better than the short one.

### Why every consumer re-renders

When the provider's `value` prop changes identity, React needs every reader to see the new
value. There is no way to tell *which* part of the value a consumer reads, so React's only
correct option is to re-render them all. This is exactly the inline-object problem from
Lesson 61, wearing a different hat:

```jsx {2}
<ThemeCtx.Provider value={{ theme, setTheme }}>   // ❌ new object every render
```

Every render of the provider creates a brand-new object, so **every consumer re-renders on
every provider render** — even when nothing changed. The fix is the value-memoization trick:
memoise the value so its identity only changes when a real dependency does.

```jsx {1}
const value = useMemo(() => ({ theme, setTheme }), [theme]);

<ThemeCtx.Provider value={value}>   // ✅ stable until theme changes
```

> [!TIP]
> Put `setTheme` (and other state setters) in the `useMemo` deps — they're stable from
> Lesson 50, so the memo never invalidates for them. An object containing state *and* its
> setters is the classic pattern.

## 5. Real Project Usage

One of the few legitimate "global" contexts — auth:

```jsx
// AuthContext.js
export const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({
    user,
    login: (u) => setUser(u),
    logout: () => setUser(null),
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// usage — anywhere below the provider
function NavBar() {
  const { user, logout } = useContext(AuthCtx);
  return user ? <button onClick={logout}>Log out ({user.name})</button> : <LoginLink />;
}
```

Good uses: theme, current user, locale, feature flags. Bad uses: *everything* — and the test
that separates the two is the "not a state manager" question:

| Job | Who does it | So… |
|---|---|---|
| Hold the state | `useState` / `useReducer` inside the provider | Context has nothing to manage |
| Update the state | `setState` / `dispatch` — plain JavaScript | No middleware, no rules |
| Decide who re-renders | All consumers, wholesale | No selectivity by design |

When you need selective updates, derived values (Lesson 55), or a real action flow, you need
a state manager — not more context. Lesson 77 covers the full decision. Also prefer context
**composition** over one mega-provider: separate `ThemeCtx` from `AuthCtx` so changing the
theme doesn't re-render the auth consumers (Lesson 48's composition over configuration).

## 6. Interview Explanation

> "Context is a value-delivery mechanism. A Provider broadcasts a value; any component that
> calls `useContext` re-renders when that value changes. It's not a state manager — the state
> still lives in `useState` or `useReducer` above the provider, and context just moves it
> around."
>
> "The trade-off is that context can't target individual consumers. Any change re-renders
> every reader, so you memoise the value object with `useMemo`, split contexts by concern,
> and reserve context for genuinely shared data like theme or auth."

## 7. Senior-Level Insights

- **The default-value gotcha:** `useContext` returns the default only when *no* Provider is
  above. If a provider exists but passes `undefined`, you get `undefined` — not the default.
- **`memo` cannot save you.** `memo` prevents prop-triggered re-renders, but a context
  change bypasses it — the component re-renders anyway. Saying this out loud instantly
  separates you from candidates who "fix" context perf with `memo`.
- **Why it can't be selective:** a consumer may use the whole value or one field. React
  can't know without reading the component, so the safe answer is re-render everything.
- **Context is for "broadcast" data** (theme, auth, locale, flags). Per-screen data that
  only some components need is a smell — see Lesson 82 for the local vs global decision.
- **The real Redux answer:** Redux exists for *derived* state and *selective* updates
  (many subscribers, few re-renders). Context exists for *one* value, *many* readers.
  One is not "Redux with less code".

## 8. Common Mistakes

- **New object on every render.** `value={{...}}` inline makes consumers re-render constantly.
- **`memo` as a band-aid** — it does not stop context-triggered re-renders.
- **One mega-context for everything.** Changing the theme re-renders every consumer of the
  auth context. Split contexts by how often each value changes.
- **Reading context too high.** A component that uses context forces its whole subtree to
  re-render on every change. Push the reader down so the blast radius stays small.
- **Missing Provider.** `useContext` silently falls back to the default and your feature
  "works but is wrong" — until you scroll past the first screen.

## 9. Best Practices

✅ Memoise the value: `const value = useMemo(() => ({ theme, setTheme }), [theme])`

✅ Keep contexts small and split by change frequency — theme and auth should not share a provider

✅ Push `useContext` down to the leaf that actually reads the value

✅ Use context for broadcast data (theme, auth, locale, flags)

❌ Don't put objects or arrays in context without memoising their identity

❌ Don't wrap the whole app in one provider "just in case" — every reader becomes a full subscriber

❌ Don't reach for context to fix a prop-drilling problem that a component split (Lesson 48) solves better

## 10. Interview Questions

**Q1. What is Context? What problem does it solve?**

> Context is a way to pass data through the tree without prop-drilling. A Provider broadcasts
> a value and any component can read it with `useContext`, regardless of depth.
>
> It solves the "thread a prop through five components that don't care" problem for data that
> is broadly shared, like theme or auth.

**Q2. Why does changing the value re-render all consumers?**

> React can't know which part of the value each consumer reads, so it must assume all of them
> need the new value. The only correct safe answer is re-render every consumer of that
> context. That's why you memoise the value — so identity only changes when it really must.

**Q3. What's the difference between Context and Redux?**

> Context is a delivery mechanism with no state of its own — the state lives in hooks above
> the provider, and every consumer re-renders on change. Redux is a state manager: it owns
> the store, has pure reducers, and selectors that let you update the store without
> re-rendering subscribers that don't use the changed slice.
>
> Context is fine for broadcast data. When you need selective updates and derived state at
> scale, you want a real state manager — Lesson 77 goes deeper.

**Q4. Why does `memo` not prevent a re-render caused by context?**

> `memo` only blocks re-renders triggered by changing props. A context change is a different
> signal — the component is directly subscribed to the value — so React re-renders it
> regardless of the memo. `memo` optimises the prop path; context is its own path.

**Senior follow-up: How would you avoid re-rendering everything when only part of the context value changes?**

> Split the contexts so each has its own subscription. A theme context and an auth context
> re-render different sets of consumers.
>
> For truly selective updates you need a state manager with selectors — context cannot do
> this by design, and saying "context can't, that's why we pick a store here" is the answer.

## 11. Follow-up Questions

**What happens when a Provider passes `undefined`?**

> You get `undefined`. The default value only applies when there is *no* provider at all —
> a provider that exists but passes `undefined` shadows the default. Pass a sensible default
> and a real value.

**Can you have multiple consumers of different contexts in one component?**

> Yes — call `useContext` once per context. Each is an independent subscription, and the
> component re-renders when any of them changes.

**Where should the provider live?**

> As close to the consumers as possible. The provider's subtree is the blast radius of every
> value change, so the smaller that subtree, the fewer re-renders. App-level placement is
> the exception, not the default.

## 12. Comparison Table

| | Props | Context | Redux / Zustand |
|---|---|---|---|
| Setup cost | None | Low | Higher |
| Re-render scope | Only the component | All consumers of the context | Only subscribed selectors |
| Holds state? | No | No (state lives in hooks) | Yes |
| Selective updates | n/a | ❌ | ✅ |
| Best for | Local, single-level data | Broadcast data (theme, auth, locale) | Complex shared state, derived state |
| Re-render control | Parent decides | `useMemo` on the value | Selectors / equality |

## 13. Code Example

A runnable model of the re-render contract — why memoising the value matters:

```js
function createContextModel(defaultValue) {
  let value = defaultValue;
  const consumers = new Set();
  return {
    setValue(next) {
      value = next;
      consumers.forEach((c) => c(next));   // always notifies every consumer
    },
    subscribe(c) {
      consumers.add(c);
      return () => consumers.delete(c);
    },
  };
}

// Without memoisation: every setValue notifies, even for the same value.
const raw = createContextModel('light');
let rawRenders = 0;
raw.subscribe(() => { rawRenders += 1; });
raw.setValue('dark');
raw.setValue('dark');                       // same value, still notifies
raw.setValue('light');

// Memoised: notify only when the value actually changes (the useMemo job).
const memoised = createContextModel('light');
let memoRenders = 0;
memoised.subscribe(() => { memoRenders += 1; });
function setMemoValue(next) {
  if (next !== memoised.value) memoised.setValue(next);   // skip unchanged
}
setMemoValue('dark');
setMemoValue('dark');                       // skipped
setMemoValue('light');

console.log('renders without memoised value:', rawRenders);
console.log('renders with memoised value:', memoRenders);
```

Output:

```text
renders without memoised value: 3
renders with memoised value: 2
```

The memo is not a micro-optimisation — it is the difference between "every provider render
re-renders every consumer" and "consumers re-render only on real change". That's the entire
performance story of Context.

## 14. Performance Notes

Context performance is identity, identity, identity:

- The value's *identity* is what triggers consumer re-renders — memoise it with `useMemo`.
- Consumers re-render when the value changes; **not** when the provider itself re-renders
  for unrelated reasons — that's the whole point of the memo.
- When it matters: medium+ apps with a theme or auth context read by hundreds of components,
  where the blast radius is real.
- When it doesn't: small apps, or a context that changes rarely (theme toggles). The
  re-render cost of a handful of consumers is invisible; "always split contexts" is a rule
  for scale, not for a 10-component demo.
- Context is often *not* the bottleneck you think. Measure with the profiler first (Lesson 71's
  "when NOT to optimize" mindset applies).

## 15. Debugging Scenarios

**Scenario 1 — "Whole app re-renders every render"**

Value object created inline in JSX, so its identity changes constantly. Fix: `useMemo` the
value with the state variables you actually use.

**Scenario 2 — "My context value is `undefined`"**

A provider above you is passing `undefined` (or you're outside any provider). Fix: check the
provider's `value` prop, and add a fallback default in `createContext`.

**Scenario 3 — "memo didn't help"**

You wrapped a consumer in `memo`, it still re-renders on context change. That's expected —
`memo` doesn't cover context subscriptions. Fix: split the context or push the consumer
lower, not more memo.

**Scenario 4 — "Two features fight: changing A re-renders B's consumers"**

They share one context. Split into two contexts so subscriptions are independent.

## 16. Quick Revision Notes

- `createContext(default)` → `Provider` broadcasts, `useContext` reads
- Value identity drives re-renders → `useMemo` the value object
- All consumers re-render on change — `memo` does not stop it
- Default value applies only when no provider exists
- Context is not a state manager — state lives in hooks above the provider
- Split contexts by change frequency; push consumers down the tree
- Reserved for broadcast data: theme, auth, locale, feature flags

## 17. Cheat Sheet

```jsx
const ThemeCtx = createContext('light');                       // 1. create

function App() {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]); // 2. memoise
  return (
    <ThemeCtx.Provider value={value}>{/* … */}</ThemeCtx.Provider> // 3. broadcast
  );
}

function Header() {
  const { theme, setTheme } = useContext(ThemeCtx);            // 4. read
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
    {theme}
  </button>;
}
```

## 18. Key Takeaways

> [!RECAP]
> - Context delivers a value down the tree; the state still lives in hooks above the provider
> - Every consumer re-renders when the value changes — that is the design, not a bug
> - Memoise the value object with `useMemo` so identity is stable between real changes
> - `memo` cannot block context-triggered re-renders
> - Context is not a state manager — that's what Redux/Zustand are for (Lessons 77–80)
> - Split contexts by how often their values change, and keep readers low in the tree
> - Default value applies only when there is no provider at all

## Check your understanding

Answer these without looking back.

1. What two things does `useContext` do, exactly?
2. Why does changing the context value re-render all consumers — and why can't React do better?
3. Why is "context is not a state manager" true — where does the state actually live?
4. What does memoising the context value fix, and what does it not fix?
5. When does a Provider's `value` of `undefined` shadow the default?
6. When would you choose a state manager over context — and how do you say that in an interview?

## What's Next

**Lesson 64 — useReducer.** When state transitions get complex enough that `useState` becomes
a liability — the reducer/action/dispatch model, and why the pure-function rule from Lesson 14
is the contract that keeps it predictable.
