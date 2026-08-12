# Lesson 77 — Context API

**Interview importance:** ⭐⭐⭐⭐ — "Context vs Redux" and "why is my whole app re-rendering" are both guaranteed questions.

Context solves one specific problem — local vs global state, and getting that state past
components that don't care about it. The part people miss is the cost: **every consumer
re-renders on every value change**. Get that wrong and you've traded prop drilling for a
slower app with the same bug.

Lesson 63 taught the mechanism, Lesson 75 the Provider pattern. This lesson is the
decision: when context is right, when it's a state library, and how to keep the blast
radius small.

## Learning Objectives

By the end of this lesson you should be able to:

- Contrast prop drilling and context, and name the moment to switch
- Say exactly who re-renders when a context value changes, and why
- Memoise and split contexts so unrelated consumers stay still
- Decide between context and a state library for any feature
- Answer "Context vs Redux" with the delivery-mechanism framing

## 1. One-line definition

**Context is a value-delivery mechanism: a Provider broadcasts a value and every `useContext`
consumer re-renders whenever that value's identity changes — it holds no state of its own.**

## 2. Mental model

Props are cables — you must plug each hop. Context is radio — one broadcast, many receivers.
But unlike a state library, the radio station owns no playlists: the state still lives in
`useState` or `useReducer` (Lessons 50 and 64) up at the Provider, and context is only the
antenna that moves it down the tree.

The trade is the part everyone forgets: every receiver tuned to the frequency re-renders on
every broadcast, whether or not it uses the new value.

## 3. Visual flow

```text
        <SettingsProvider value={value}>        state lives HERE (useState/useReducer)
        ┌──────────────────────────────────┐
        │  App                             │
        │   └─ value ── broadcast ─────────┼──────►  Header (useContext) → re-renders
        └──────────────────────────────────┘
                 │                         └──────►  Sidebar (no useContext) → stays
                 │
                 ▼   value changes
   every consumer of SettingsCtx re-renders, no matter how deep.
   Sidebar never opted in → it is untouched.
```

## 4. How it works

```jsx {6}
const ThemeCtx = createContext('light');        // default: only used with no Provider

function App() {
  const [theme, setTheme] = useState('light');

  const value = useMemo(() => ({ theme, setTheme }), [theme]);   // the memoised value

  return (
    <ThemeCtx.Provider value={value}>          // broadcast
      <Header />
      <Sidebar />
    </ThemeCtx.Provider>
  );
}

function Header() {
  const { theme, setTheme } = useContext(ThemeCtx);   // tune in
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
```

Output:

```text
No console output — but a mental model to check: when `theme` changes, `Header`
re-renders. `Sidebar` never called `useContext`, so it stays still. If the value
object were created inline (`value={{ theme, setTheme }}`) instead of memoised,
`Header` would re-render on *every* render of `App`, even when nothing changed.
```

The rule that drives everything: **re-renders are triggered by the value's identity, not
by its contents.** The memoised object keeps the same identity until `theme` changes, so
consumers only re-render when a real dependency moved.

> [!PITFALL]
> `memo` cannot save a context consumer. A context change bypasses prop comparison and
> re-renders the component anyway (Lesson 63). If a consumer "still re-renders after
> memo", that's the design, not a bug in your memo.

## 5. Real project usage

Good contexts are **broadcast data**: values read across a wide subtree that change rarely.

| Data | Context? | Why |
|---|---|---|
| Theme | ✅ | Read by hundreds of components, changes rarely |
| Current user / auth | ✅ | Read everywhere, changes on login/logout |
| Locale / language | ✅ | Broadcast, rare changes |
| Feature flags | ✅ | Read widely, changes at runtime |
| Cart contents | ⚠️ | Per-screen data — context re-renders the whole tree per item |
| Form values | ❌ | Local state or a form lib; context adds nothing |
| Server cache | ❌ | That's a server-state problem (Lesson 81) |

The Provider pattern from Lesson 75, applied to a real codebase:

```jsx
// AuthProvider.js
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

// Deep anywhere below — no prop threading
function NavBar() {
  const { user, logout } = useContext(AuthCtx);
  return user ? <button onClick={logout}>Log out ({user.name})</button> : <LoginLink />;
}
```

## 6. Interview explanation

> "Context is a value-delivery mechanism. A Provider broadcasts a value, and any component
> that calls `useContext` re-renders when the value's identity changes. It's not a state
> manager — the state still lives in `useState` or `useReducer` above the provider, and
> context just moves it around."
>
> "The trade-off is that context can't target individual consumers. Any change re-renders
> every reader, so I memoise the value with `useMemo`, split contexts by how often values
> change, and reserve context for broadcast data like theme or auth. When I need selective
> updates or heavy derived state, I reach for a state library instead."

## 7. Senior-level insights

- **The re-render cost people miss:** consumers re-render on *identity change*, and an
  inline `value={{...}}` creates a new identity on every provider render. The bug looks
  like "my app re-renders constantly" and the fix is one `useMemo`.
- **Context can't be selective.** React has no way to know which field a consumer reads,
  so the only safe answer to "value changed" is re-render all of them. This is *why*
  Redux/Zustand exist (Lessons 78 and 80) — not "Redux with less code".
- **Split contexts by change frequency.** Theme changes fast, user changes rarely. One
  mega-context means every theme toggle re-renders the auth consumers too. Two contexts,
  two independent subscription sets.
- **Keep readers low in the tree.** A consumer's re-render covers its whole subtree, so a
  `useContext` call near the root has a huge blast radius. Push the reader down to the leaf
  that actually uses the value.
- **The default-value gotcha:** the default only applies when *no* Provider exists above. A
  Provider that passes `undefined` gives you `undefined`, not the default (Lesson 63).
- **Context is not the answer to every prop-drilling problem.** Often a component split
  (Lesson 48) removes the drilling entirely — no context needed. Reach for context when the
  data is genuinely shared and broadcast.

## 8. Common mistakes

- **Inline value object** — `value={{ theme, setTheme }}` re-renders every consumer on every
  provider render.
- **`memo` as a band-aid** — it does not stop context-triggered re-renders.
- **One mega-context for everything** — unrelated consumers re-render together. Split by
  change frequency.
- **Reading context too high** — a `useContext` near the root re-renders its entire subtree
  on change. Push the reader down.
- **Missing Provider** — `useContext` silently returns the default and your feature "works
  but is wrong" until you scroll past the first screen.
- **Context for per-screen data** — a cart or form in context re-renders the whole app on
  every keystroke or item change. That's local state's job.

## 9. Best practices

✅ Memoise the value: `const value = useMemo(() => ({ theme, setTheme }), [theme])`

✅ Split contexts by change frequency — theme and auth should not share a provider

✅ Push `useContext` down to the leaf that actually reads the value

✅ Use context for broadcast data: theme, auth, locale, feature flags

✅ Fix prop drilling with a component split (Lesson 48) *before* reaching for context

❌ Don't put un-memoised objects or arrays in context

❌ Don't wrap the whole app in one provider "just in case" — every reader becomes a subscriber

❌ Don't use context where a state library's selectors would avoid the re-renders

## 10. Interview questions

**Q1. When would you choose Context over prop drilling?**

> When a value is read by many components spread across the tree — theme, auth, locale —
> and threading it through props would touch components that don't care. Context broadcasts
> the value so only the readers subscribe.
>
> I'd still check whether a component split removes the drilling first; context has a
> re-render cost, so it's a decision, not a default.

**Q2. Why does every consumer re-render when the context value changes?**

> React can't know which part of the value each consumer reads, so the only safe assumption
> is that all of them need the new value. It re-renders every consumer of that context. That
> is why you memoise the value — so its identity only changes when a real dependency does.

**Q3. What's the difference between Context and Redux?**

> Context is a delivery mechanism with no state of its own; the state lives in hooks above
> the provider, and every consumer re-renders on change. Redux is a state manager: it owns
> the store, uses pure reducers, and selectors that let many components subscribe without all
> re-rendering when an unrelated slice changes.
>
> For broadcast data I'd use context. When I need selective updates or derived state at
> scale, I'd use Redux (Lesson 78) or Zustand (Lesson 80).

**Q4. How do you reduce re-renders with context?**

> Three levers. Memoise the value so identity is stable. Split contexts by change frequency
> so one update doesn't re-render everyone. And push consumers down so the blast radius of
> each re-render stays small.

**Senior follow-up: When is context the wrong tool, and what do you use instead?**

> When the data is only used in one small part of the app, when updates are frequent, or
> when I need selective subscriptions and derived state. Context re-renders all consumers
> wholesale — if the feature needs fine-grained updates, that's a state library's job:
> Redux Toolkit for a formal action flow (Lesson 78), Zustand when I want minimal ceremony
> (Lesson 80), and TanStack Query for server state (Lesson 81).

## 11. Follow-up questions

**What happens when a Provider passes `undefined`?**

> You get `undefined`. The default value only applies when there's no Provider at all — a
> Provider that exists but passes `undefined` shadows the default. Pass a real value or a
> sensible default.

**Can one component read two contexts?**

> Yes — call `useContext` once per context. Each is an independent subscription, and the
> component re-renders when *either* value changes.

**Does splitting contexts mean more providers to nest?**

> Yes, but nesting providers is cheap — the cost is in the subscriptions, not the provider
> elements. Two focused providers with tiny subscriber sets beat one provider with a huge
> subscriber set.

## 12. Comparison table

| | Prop drilling | Context | State library (Redux/Zustand) |
|---|---|---|---|
| Setup cost | None | Low | Higher |
| Re-render scope | Only the component | All consumers of the context | Only subscribed selectors |
| Holds state? | No | No (state lives in hooks) | Yes |
| Selective updates | n/a | ❌ | ✅ |
| Derived state | n/a | Recompute per render | Memoised selectors |
| Best for | Single-level data | Broadcast data (theme, auth, locale) | Complex shared state, derived state |
| The trade | Verbose props | Whole-tree re-renders | Boilerplate + architecture |

## 13. Code example

The re-render cost, simulated in plain JS — no React needed:

```js
function createContext(initial) {
  let value = initial;
  const consumers = new Set();
  return {
    _get: () => value,
    _set(next) {
      if (Object.is(next, value)) return;      // same value → bailout
      value = next;
      consumers.forEach((c) => c());           // EVERY consumer re-renders
    },
    _subscribe(fn) { consumers.add(fn); return () => consumers.delete(fn); },
  };
}

const ThemeCtx = createContext('light');
let headerRenders = 0, sidebarRenders = 0;
ThemeCtx._subscribe(() => { headerRenders += 1; });
ThemeCtx._subscribe(() => { sidebarRenders += 1; });

ThemeCtx._set('dark');
ThemeCtx._set('dark');        // same value — no broadcast
ThemeCtx._set('sepia');

console.log('header renders:', headerRenders);   // 2
console.log('sidebar renders:', sidebarRenders); // 2 — same subscription
```

Output:

```text
header renders: 2
sidebar renders: 2
```

Now split the contexts and watch the unrelated consumer go quiet:

```js
const ThemeCtx = createContext('light');
const UserCtx = createContext(null);

let themeConsumers = 0, userConsumers = 0;
ThemeCtx._subscribe(() => { themeConsumers += 1; });
UserCtx._subscribe(() => { userConsumers += 1; });

ThemeCtx._set('dark');
ThemeCtx._set('sepia');

console.log('theme consumers:', themeConsumers); // 2 — theme moved
console.log('user  consumers:', userConsumers);  // 0 — untouched by theme
```

Output:

```text
theme consumers: 2
user  consumers: 0
```

```narrate
line 7: Object.is bailout — setting the same value costs nothing
line 9: every subscriber fires on a real change — that IS context's contract
line 5-6: two independent subscriptions — the whole "split contexts" optimisation
```

## 14. Performance notes

- **Identity is the trigger.** Memoise the value; the consumers only re-render when the
  memo's dependencies change. Everything else is downstream of that fact.
- **Consumers re-render on value change, not on provider render.** An unrelated re-render of
  `App` does not touch consumers while the memoised value's identity is stable.
- **When it matters:** medium+ apps with a theme or auth context read by hundreds of
  components — the blast radius is real.
- **When it doesn't:** small apps, or a context that changes rarely (a theme toggle). The
  re-render cost of a handful of consumers is invisible. "Always split contexts" is a rule
  for scale, not for a 10-component demo.
- **Measure first.** The "when NOT to optimise" mindset from Lesson 71 applies — profile
  before you refactor context into a state library.

## 15. Debugging scenarios

**Scenario 1 — "The whole app re-renders every render"**

The value object is created inline in JSX, so its identity changes constantly. Fix:
`useMemo` the value with the state variables you actually use.

**Scenario 2 — "My context value is `undefined`"**

A Provider above you passes `undefined`, or you're outside any Provider. Fix: check the
Provider's `value` prop, and add a fallback default in `createContext`.

**Scenario 3 — "I wrapped it in `memo` and it still re-renders"**

Expected — `memo` doesn't cover context subscriptions. Fix: split the context or push the
consumer lower, not more memo.

**Scenario 4 — "Changing feature A re-renders feature B's components"**

They share one context. Split into two contexts so the subscriptions are independent.

**Scenario 5 — "Works in isolation, wrong in the app"**

You're rendering a component without its Provider, so `useContext` silently returned the
default. Wrap the test or the route in the real Provider.

## 16. Quick revision notes

- `createContext(default)` → Provider broadcasts, `useContext` reads
- Value *identity* drives re-renders → `useMemo` the value object
- All consumers re-render on change; `memo` does not stop it
- Default applies only when no Provider exists; `undefined` shadows it
- Context is not a state manager — state lives in hooks above the provider
- Split contexts by change frequency; push consumers down the tree
- Use it for broadcast data; use a state library for selective updates (Lessons 78, 80)

## 17. Cheat sheet

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
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}
```

## 18. Key takeaways

> [!RECAP]
> - Context delivers a value down the tree; the state still lives in hooks above the provider
> - Every consumer re-renders when the value's identity changes — that is the design
> - Memoise the value with `useMemo`; split contexts by change frequency
> - `memo` cannot block context-triggered re-renders
> - Context is not a state manager — that's what Redux/Zustand are for (Lessons 78, 80)
> - Use context for broadcast data; use a component split before reaching for it
> - The default applies only when no Provider exists

## Check your understanding

Answer these without looking back.

1. What problem does context solve that prop drilling does not — and what cost does it add?
2. Why does every consumer re-render when the context value changes?
3. What exactly does `useMemo` on the context value fix, and why does identity matter?
4. Two contexts change at different rates — what happens if they share one Provider, and how do you fix it?
5. When is context the wrong tool, and what do you reach for instead?
6. A provider passes `undefined`. What does `useContext` return, and why is that surprising?
7. Give the "context vs Redux" answer in two sentences.

## What's Next

**Lesson 78 — Redux Toolkit.** Store, slice, thunk, selector — still standard at many
companies. Where context stops being enough, and how one store with pure reducers replaces
a tree full of providers.
