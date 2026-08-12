# Lesson 75 — The Provider Pattern

**Interview importance:** ⭐⭐⭐ — foundational, and every state-management answer builds on it.

Most "how do you share state between components" questions have one answer: the provider
pattern. It's the pattern behind every theme, auth, i18n and feature-flag library you've
used, and later lessons build directly on it — the Context API (Lesson 77) and Redux
Toolkit (Lesson 78) are this pattern with more ceremony. Get the mechanism right here and
the rest is vocabulary.

The pattern is three moving parts: a `Context` object (Lesson 63), a provider component
that owns the state, and consumers that read it through a hook. Everything else —
memoization, nesting, splitting contexts — is protecting those three parts from yourself.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the provider pattern in one sentence, in an interview, out loud
- Write a theme provider and an auth provider from memory
- Explain why the value object must be memoized (Lesson 6)
- Compose providers, and know when to split them
- Say when the provider pattern is the wrong tool (Lesson 63)

## 1. One-line Definition

**The provider pattern is a component that owns some state and exposes it to a whole subtree through context, instead of threading it down as props through every intermediate component.**

```jsx
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

That is the entire pattern: `createContext` at the top, a component that holds state, a
`.Provider` around `{children}`.

## 2. Mental Model

Prop drilling is a courier walking props down every floor of the building. The provider is
a radio tower: components with a receiver (`useContext`) hear the broadcast at any depth,
and the floors in between don't even know a message exists.

```text
prop drilling (courier)            provider (broadcast)
App ── theme ──► Layout            App
                   theme ──► Nav       └─ <ThemeProvider>      ← the tower
                                theme ──► Button                     │ broadcast
                                                                     ▼
                                          <Button />  ← hears it directly
                                          (no theme prop anywhere)
```

The courier touches every intermediate component; the broadcast doesn't. That's why
providers survive refactors — moving `<Button />` three levels deeper changes nothing.

## 3. Visual Flow

```text
App
│
├─ <ThemeProvider>              ← owns: theme, setTheme
│   └─ <Toolbar>
│        └─ <Button />          ← useContext(ThemeContext) — zero props
│
└─ <AuthProvider>               ← owns: user, login, logout
    └─ <Header />               ← useContext(AuthContext)
```

Two providers, two independent state islands, composed by nesting. Each provider is just a
component — so two of the same provider give you two independent scopes, exactly like two
calls to a factory function in Lesson 5:

```js
function createTheme(initial) {
  let theme = initial;                       // the provider's private state
  return {                                   // the provider's "value"
    get: () => theme,
    set: (next) => { theme = next; },
  };
}

const lightTheme = createTheme('light');
const darkTheme = createTheme('light');

lightTheme.set('dark');
console.log(lightTheme.get());
console.log(darkTheme.get());
```

Output:

```text
dark
light
```

`darkTheme` never heard about `lightTheme`'s change — separate closures, separate scopes,
no shared state. The provider pattern is this factory wearing a React costume.

## 4. How It Works

Three pieces, and only one of them is a component:

```jsx
// 1. the context — the "channel", created once at module level
const ThemeContext = createContext(null);
```

```jsx
// 2. the provider — owns state, broadcasts the value
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```jsx
// 3. the consumer — reads the channel at any depth
function ToggleButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button className={`btn-${theme}`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}
```

```narrate
line 2: the provider is a component — it can use useState, so it owns the state
line 3: `value` is passed down by React, not by prop threading
line 12: consumers read the channel directly; the intermediate Toolbar never knows
line 13: setTheme comes from the provider's useState, stable across renders
```

The important consequence: **every consumer re-renders when the value changes**, whether or
not it reads the field that changed (Lesson 63). The value's *identity* is the trigger, not
its contents. In plain JS, that's just object identity (Lesson 6):

```js
// The provider re-renders, builds a NEW value object, and hands it
// to every consumer. Identity changed → consumers re-render.
let theme = 'light';

function providerRender() {
  return { theme };            // new object every time — even for 'light'
}

const v1 = providerRender();
const v2 = providerRender();
console.log('same contents:', v1.theme === v2.theme);
console.log('same object?  ', v1 === v2 ? 'no re-render' : 're-render');
```

Output:

```text
same contents: true
same object?   re-render
```

That one line — `v1 !== v2` — is the whole reason "memoize the value" is the first piece
of senior advice about this pattern.

## 5. Real Project Usage

| Provider | Owns | Consumers read |
|---|---|---|
| **Theme** | `theme`, `setTheme` | Every styled component |
| **Auth** | `user`, `login`, `logout` | Header, profile, route guards |
| **i18n** | `locale`, `t()` | Every translated string |
| **Feature flags** | `flags` map | Gate new features per cohort |
| **User settings** | prefs, toasts | Layout, forms |
| **Query/cache** (React Query) | cached data, `refetch` | Every data component |

The auth provider is the one that gets asked about in interviews — it mixes state with
async (Lesson 27):

```jsx {12}
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('login failed');   // caller catches it
    setUser(await res.json());
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

```narrate
line 5: login is a callback so its identity is stable — it never forces consumers to re-render
line 8: the async work lives in the provider; consumers just call login() and catch errors (Lesson 27)
line 12: useMemo keeps the value object stable unless user changes
line 14: the memoized value is what gets broadcast
```

## 6. Interview Explanation

> The provider pattern is a component that owns state and exposes it to a whole subtree
> through context, instead of threading it through props. You create a context, wrap the
> tree in a provider that holds the state, and consumers read it with `useContext`. It's
> how themes, auth and i18n are built. The main gotcha is that the value object must be
> memoized — an inline `value={{ ... }}` re-renders every consumer on every provider
> render, even when nothing changed.

## 7. Senior-Level Insights

- **Value memoization is the whole game.** `useMemo` on the value, `useCallback` on the
  functions. A new value object is the *only* trigger for consumers; keep its identity tied
  to real changes (Lesson 6).
- **Split fast-changing from slow-changing state.** Theme changes rarely; a cursor position
  changes constantly. One context for both means every theme toggle re-renders the cursor
  widget and vice versa. Two providers, two contexts.
- **Keep providers high, but not global.** Providers at the route or page level reset
  naturally when the route changes. A single app-wide provider for everything is a global
  variable wearing a costume (Lesson 63's warning).
- **Never create the context inside the component.** A new `createContext()` per render
  remounts the whole subtree — the context object must be module-level.
- **`children` as a prop is what makes providers cheap.** Because `children` is a stable
  reference, a provider that re-renders doesn't force its *children* to re-render — only
  its consumers do (Lessons 48, 67).

## 8. Common Mistakes

**Mistake 1 — inline value object.**

```jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* ❌ new object every render → every consumer re-renders */}
      {children}
    </ThemeContext.Provider>
  );
}
```

Even when the parent re-renders and `theme` hasn't changed, the fresh `{ theme, setTheme }`
has a new identity, so every consumer re-renders. This is the single most common provider
bug.

**Mistake 2 — context created in render.**

```jsx
function ThemeProvider({ children }) {
  const Ctx = createContext(null);        // ❌ new context per render
  // ...
}
```

React sees a different context object every render and unmounts/remounts the subtree.
`createContext` goes at module level, once.

**Mistake 3 — one giant context.** Auth + theme + settings + flags in a single provider
means any change re-renders every consumer of every concern. Split contexts by change
frequency (Lesson 63).

**Mistake 4 — provider below the components that need it.** A provider only feeds its own
subtree. Put it above everything that reads it, and keep it above frequently-changing
ancestors where you can.

## 9. Best Practices

✅ Create the context once, at module level

✅ Memoize the value (`useMemo`) and the functions (`useCallback`)

✅ Split contexts that change at different rates

✅ Pass `children` through so provider re-renders don't cascade

✅ Make the consumer hook throw when used outside its provider

❌ Don't put every piece of global state in one provider

❌ Don't use a provider for state only one or two components need — that's Lesson 63's
premature abstraction

## 10. Interview Questions

**Q1. What is the provider pattern?**

> A component that owns some state and exposes it to a whole subtree through context, so
> descendants can read and update it without prop drilling. It's `createContext` plus a
> component with state that renders `.Provider` around `{children}`, with consumers using
> `useContext`.

**Q2. Why does the value need to be memoized?**

> Because consumers re-render whenever the value object's identity changes. An inline
> `value={{ theme, setTheme }}` creates a new object on every provider render, so even an
> unrelated parent re-render makes every consumer re-render. `useMemo` ties the identity to
> actual changes, and `useCallback` keeps the functions stable.

**Q3. How do you share state between two components that aren't siblings?**

> Lift the state into a common ancestor provider and have both read it with `useContext`.
> If the state is truly global — theme, auth, locale — a provider at the top of the app. If
> only a subtree needs it, keep the provider inside that subtree.

**Senior follow-up: Your whole app re-renders when the theme toggles. Walk me through the fix.**

> Theme toggling changes the theme value, so theme consumers *should* re-render — that part
> is correct. The smell is the *whole app* re-rendering. Likely causes: an inline provider
> value (every consumer re-renders on any provider re-render), or theme and fast-changing
> state sharing one context. I'd memoize the value, split contexts by change frequency, and
> check whether non-theme consumers are reading theme at all.

## 11. Follow-up Questions

**When would you NOT use the provider pattern?**

> When only a couple of components share the state — lifting state to a common parent
> (Lesson 55) is cheaper. And never as a substitute for local state: if one component owns
> it, `useState` there beats a provider.

**Does a provider re-render its children when its state changes?**

> No. A provider re-render does not re-render `{children}` — `children` is a stable prop
> reference. Only components that consume the context re-render. That's what makes the
> pattern affordable.

**How do you provide a default value, and when is it used?**

> `createContext(defaultValue)` is used only when a component reads the context *without* a
> matching provider above it. In practice you often pass `null` and throw in the consumer
> hook, so a missing provider is a loud error, not a silent default.

## 12. Comparison Table

| | Prop drilling | Provider (context) | State library (Redux/Zustand) |
|---|---|---|---|
| Data path | props at every level | value through context | store outside the tree |
| Intermediate re-renders | ✅ happen | ❌ skipped | ❌ skipped |
| Setup cost | none | small | larger |
| Debugging | trace props | one value per provider | devtools, actions |
| Right for | 1–2 levels | subtree-wide state | complex cross-cutting state (Lesson 78) |
| Re-render scope | whole path | every consumer of that context | per selector |

## 13. Code Example

The compound pattern — providers composed by nesting, each owning one concern, plus the
memoized value:

```jsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Header />
        <Dashboard />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Header() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  return (
    <header className={`header-${theme}`}>
      {user ? `Signed in as ${user.name}` : 'Guest'}
    </header>
  );
}
```

```narrate
line 2-5: nesting composes providers — order matters only for components that consume both
line 9-10: one component consuming two contexts — both value objects must be stable
line 12: Header re-renders only when user or theme actually changes
```

And the guard hook that makes a missing provider loud instead of silent:

```jsx
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```

## 14. Performance Notes

- **When it matters:** contexts consumed by large subtrees, or values that change often. A
  memoized value is the difference between "toggle re-renders the consumers" and "toggle
  re-renders the app".
- **When it doesn't:** a provider wrapping a tiny subtree, or state that changes a few
  times a day (theme). The memoization is still correct — it's just not load-bearing.
- **The real cost of context is consumer re-renders**, not the provider. Measure with the
  Profiler (Lesson 71) before restructuring into five contexts.
- **`children` stability is free performance.** Keep it, and provider re-renders stay cheap.

## 15. Debugging Scenarios

**"Everything re-renders when one provider state changes."** Check the value: if it's
inline, that's it — memoize it. Then check whether unrelated consumers read that context at
all.

**"My consumer reads `undefined`."** The component is outside the provider. The guard hook
(`useAuth` throwing) turns this into an immediate, searchable error instead of a blank page.

**"Changing state doesn't re-render a memoized consumer."** `React.memo` (Lesson 67)
compares props — but context bypasses props. A memoized component still re-renders on
context change. If it must not, split the context so it doesn't consume the changing part.

**"Consumers re-render when an unrelated parent re-renders."** Look above the provider: if
the provider itself re-renders, its inline value re-creates. Memoize the value and the
re-render stops.

## 16. Quick Revision Notes

- Provider = state + `Context.Provider` + `useContext` consumer — nothing else
- `createContext` once, at module level — never inside a component
- Consumers re-render when the **value object's identity** changes (Lesson 6)
- Memoize value with `useMemo`, functions with `useCallback`
- Providers don't re-render their `children` — only consumers
- Split contexts by change frequency; nest providers to compose
- Guard hooks (`useAuth`) throw outside the provider
- The pattern scales to theme, auth, i18n, flags — and to Redux in Lesson 78

## 17. Cheat Sheet

```text
createContext(null)                  → module level, once

<ThemeContext.Provider value={v}>    → broadcast v to the subtree
useContext(ThemeContext)             → read v, at any depth

value = useMemo(() => ({ theme, setTheme }), [theme])   ← THE rule
login  = useCallback(async () => { … }, [])             ← stable fn

<ThemeProvider><AuthProvider>…</AuthProvider></ThemeProvider>  ← compose

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside <AuthProvider>');
  return ctx;
}
```

## 18. Key Takeaways

> [!RECAP]
> - The provider pattern is a component that owns state and broadcasts it through context — prop drilling's replacement
> - Three parts: a module-level context, a provider holding state, `useContext` consumers
> - Consumer re-renders are driven by **value identity**, not contents (Lesson 6)
> - Memoize the value (`useMemo`) and the functions (`useCallback`) — non-negotiable in practice
> - Providers don't re-render their `children`, so wrapping is cheap
> - Compose providers by nesting; split contexts that change at different rates
> - Guard hooks turn "used outside provider" into a loud error
> - Lesson 77 (Context API) and Lesson 78 (Redux) build directly on this

## Check your understanding

Answer these without looking back.

1. Write the provider pattern from memory: context, provider, consumer.
2. Why does an inline `value={{ ... }}` re-render every consumer on every provider render?
3. What does `useCallback` protect in an auth provider — and what would happen without it?
4. Do provider re-renders re-render their children? Why not?
5. When would you split one context into two?
6. What does the guard-hook pattern do, and why is it better than a default value?

## What's Next

**Lesson 76 — Error Boundaries.** The class-only mechanism that keeps one crashing
component from taking down your whole app — and the four kinds of errors it still can't
catch.
