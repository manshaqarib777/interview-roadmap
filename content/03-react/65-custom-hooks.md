# Lesson 65 — Custom Hooks

**Interview importance:** ⭐⭐⭐⭐ — you will be asked to write one live. This is the main
React composition primitive.

Most of React's composition story lives in a single idea: a function that starts with `use`
and returns state + helpers. Custom hooks let you move logic out of components — data
fetching, subscriptions, persisted state — and share it without render props or HOCs
(Lessons 73, 74). The "why" line to remember: **expect to write one live. This is the main
React composition primitive.**

## Learning Objectives

By the end of this lesson you should be able to:

- State the two conventions every custom hook must follow (the `use` prefix; the pure-function-of-state rule)
- Extract repeated logic from a component into a custom hook
- Write `useLocalStorage`, `useFetch` and `usePrevious` from memory
- Explain what a custom hook is *not* — it's not a lifecycle, not a context, not a class mixin
- Answer the live-coding question with a clean, complete hook and its calling component

## 1. What is a Custom Hook?

**A custom hook is a JavaScript function whose name starts with `use`, and which calls other
hooks inside it.**

That's the whole definition. It is not a React feature — it's a *convention* the React team
formalised: a function that composes the built-in hooks (Lesson 57's `useEffect`, Lesson 60's
`useRef`, Lesson 63's `useContext`, and so on). Because the name starts with `use`, React and
its lint rules treat it as a hook, which brings two guarantees: it can call hooks inside
itself, and it follows the Rules of Hooks (Lesson 66).

## 2. Mental Model

Think of a custom hook as a **component without the JSX**.

A component takes props and returns UI; a custom hook takes arguments and returns *values and
functions*. Same per-instance state, same re-render on change, same rules — just no render
output. And it's a **pure function of state**: given the same inputs and the same prior
state, it produces the same outputs. No surprise global reads, no hidden side effects beyond
the ones you explicitly create with hooks like `useEffect`.

## 3. Visual Flow

```text
   useCounter(initial)
   ┌───────────────────────────────────────────┐
   │  useState(initial)     → [count, setCount] │
   │  increment = () => setCount(c => c + 1)    │
   │  decrement = () => setCount(c => c - 1)    │
   └───────────────────────────────────────────┘
         │
         ▼  returns { count, increment, decrement }
   <Counter /> uses it like state it owned itself

   Each caller gets its OWN instance — same as calling useState twice.
```

## 4. How It Works

A custom hook is just a function — write it, call other hooks, return what the component
needs:

```jsx {3,9}
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  return { count, increment, decrement };
}

function Counter() {
  const { count, increment, decrement } = useCounter(10);
  return (
    <div>
      <button onClick={decrement}>−</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

```narrate
3: The hook body is deterministic given its input and prior state — a pure function of state.
9: State is owned by the CALLER: each component that calls useCounter gets its own count.
```

Three things to notice:

1. **State is owned by the caller.** `useCounter` doesn't store anything globally — every
   component that calls it gets its own `count`, exactly like calling `useState` directly.
2. **The hook is a pure function of its inputs and state.** Same `initial`, same prior
   state → same returned values. All side effects live *inside* the hooks it calls, not in
   the function body itself.
3. **No JSX, no lifecycle.** The component's render happens where it always does; the hook
   just supplies the data and the callbacks.

> [!TIP]
> "A custom hook is a component without the JSX" is the one-liner to have ready — it
> immediately explains why per-instance state and the Rules of Hooks apply unchanged.

## 5. Real Project Usage

The pattern for extracting a hook: **spot repeated logic across components, move it into a
`use` function, keep the parameters and return values minimal.**

```jsx
// Repeated everywhere: load a user's profile, track loading + error state.
// Before — three components with three copies of the same useEffect:
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setUser(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return loading ? <Spinner /> : <Profile user={user} />;
}
```

After — one hook, three call sites, each with its own state:

```jsx {1,16}
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setUser(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading };
}

function ProfilePage({ userId }) {
  const { user, loading } = useUser(userId);   // one line instead of eight
  return loading ? <Spinner /> : <Profile user={user} />;
}
```

```narrate
1: The hook owns the effect, its cleanup and the dependency array — callers can't get it wrong.
16: The returned object is the whole API: { user, loading }.
```

The `cancelled` flag (the cleanup idiom from Lesson 57/58) lives in exactly one place now,
not three — fixing the race condition once fixes every caller.

## 6. Interview Explanation

> "A custom hook is a function that starts with `use` and composes other hooks. It lets me
> extract logic — state, effects, subscriptions — out of components and share it without
> render props or HOCs. Each caller gets its own instance, because the built-in hooks inside
> are per-component."
>
> "I'd write `useLocalStorage` by combining `useState` with a lazy initialiser and a
> `useEffect` that writes on change. The `use` prefix matters because it tells the lint rules
> this is a hook, so the Rules of Hooks get enforced."

## 7. Senior-Level Insights

- **Custom hooks are the composition primitive.** Render props and HOCs (Lessons 73, 74) were
  the pre-hooks answers; hooks replaced them because they compose without nesting.
- **Dependency arrays move with the logic.** Extracting `useUser` moves the `[userId]` array
  into the hook — callers can't forget it, because it's not theirs to write.
- **Name hooks for what they return**, not how they're built: `useUser`, not `useFetchForUsers`.
  The convention reads like a contract.
- **"Pure function of state" is the design constraint.** The hook body is deterministic given
  its args and prior hook state; all non-determinism is isolated inside the built-in hooks it
  calls. That's what makes custom hooks testable and composable.
- **Watch out for shared mutable state.** If you want a *single shared* value across callers
  (a cache, a store), a custom hook is the wrong tool — that's a module singleton or Context
  (Lesson 63). Each hook call is a fresh instance by design.

### The `use` prefix — why it's a rule, not a style choice

The prefix is what makes React's lint rules treat your function as a hook. `react-hooks/rules-of-hooks`
(covered in depth in Lesson 66) checks that hooks are called unconditionally at the top
level — and it needs the `use` prefix to know *which* functions are hooks.

```jsx
function useCounter(initial = 0) {   // ✅ starts with `use` → lint checks it as a hook
  const [count, setCount] = useState(initial);
  return { count, increment: () => setCount((c) => c + 1) };
}

function counter(initial = 0) {      // ❌ lowercase → lint does NOT check it
  const [count, setCount] = useState(initial);   // silently skips the rules
  return count;
}
```

> [!PITFALL]
> A non-hook function that calls hooks (lowercase name) still *works* at runtime, but it
> escapes the lint rules, and the moment a hook lands in a condition or loop, the linked
> list breaks (Lesson 66). The prefix turns a silent footgun into a caught error.

## 8. Common Mistakes

- **Calling a hook conditionally** — breaks the call-order guarantee (Lesson 66 in full).
- **Sharing state between callers by accident** — no, two calls are two instances. If you
  need shared state, use Context or a store, not a hook.
- **Effects with missing dependencies** inside the hook — the extraction doesn't fix the
  dependency array; the lint rules still flag it (Lesson 58).
- **Returning unstable objects from the hook** — `{ data, loading }` is a new object every
  render, which can break a `useEffect` or `useMemo` at the call site that depends on it.
- **Naming hooks with lowercase** — silently drops lint coverage.
- **A hook that returns JSX** — that's a component. If it takes props and returns JSX, call
  it a component; if it returns values and functions, call it a hook.

## 9. Best Practices

✅ Start every custom hook with `use`

✅ Keep the hook body a pure function of its arguments and hook state — side effects only inside hooks

✅ Return stable references when callers will use them in deps (`useCallback`/`useMemo` inside the hook)

✅ Name by what it returns: `useUser`, `useLocalStorage`, `usePrevious`

✅ Extract when logic is duplicated or a component is drowning in effects

❌ Don't share "global" state through hooks — each call is a new instance

❌ Don't call hooks inside loops, conditions, or nested functions (Lesson 66)

❌ Don't put JSX in a hook — that's a component's job

## 10. Interview Questions

**Q1. What is a custom hook?**

> A JavaScript function that starts with `use` and composes other hooks. It extracts stateful
> logic — effects, refs, context — out of components so it can be shared and tested. Each
> call gets its own instance of the state, because the built-in hooks inside are
> per-component.

**Q2. Why must the name start with `use`?**

> So the lint rules can recognise it as a hook and enforce the Rules of Hooks — top-level
> calls, no conditions, no loops. The prefix is the contract that keeps hook call order safe
> (the linked list from Lesson 66).

**Q3. How is a custom hook different from a regular function?**

> A regular function can't call hooks — doing so breaks the rules unless it's a hook itself.
> A custom hook participates in the component's render lifecycle: its state and effects are
> owned by the calling component, per instance.

**Q4. Write `usePrevious`.**

> Use a ref plus an effect. The effect runs after render, so `ref.current` still holds the
> previous value when the next render reads it:

```jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}
```

**Senior follow-up: Can two components share state through a custom hook?**

> No — and that's a feature, not a limitation. Each call creates independent state, which is
> what makes hooks compose safely. If you genuinely need shared state, lift it to a shared
> ancestor with Context (Lesson 63) or a store like Zustand (Lesson 80).

## 11. Follow-up Questions

**How do you test a custom hook?**

> With `renderHook` from `@testing-library/react`, or by calling the underlying pure helpers
> directly. The hook itself needs a renderer; the logic inside it — reducers, pure functions —
> tests as plain functions.

**When should you NOT create a custom hook?**

> When the logic has no state, no effects, and no reuse. A plain function does the job. Also
> when a component-specific piece of UI is better split as a component (Lesson 48). Hooks
> are for *behaviour*, components are for *appearance*.

**What's the relationship to render props and HOCs?**

> They were the pre-hooks composition tools. Hooks achieve the same sharing with less nesting,
> so modern React prefers them. You should be able to say why: hooks compose linearly, HOCs
> nest and can collide on prop names (Lesson 74 covers the details).

## 12. Comparison Table

| | Custom Hooks | Render Props (L73) | HOCs (L74) | Context (L63) |
|---|---|---|---|---|
| Shares | Logic | Logic + render | Logic + props | Values |
| Nesting | Linear | Can nest | Nests deeply | N/A |
| Call-order rules | Yes (Rules of Hooks) | No | No | No |
| Per-instance state | ✅ | ✅ | ✅ | n/a |
| Modern default? | ✅ | Rarely | Rarely | For broadcast values |

## 13. Code Example

A runnable, plain-JS take on the idea — `useLocalStorage`'s persistence logic, factored as a
testable pure module (the hook adds React binding on top):

```js
// The storage logic behind useLocalStorage — pure functions, no React.
function readStored(key, initialValue) {
  const stored = localStorage.getItem(key);
  return stored !== null ? JSON.parse(stored) : initialValue;
}

function writeStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const store = new Map();                       // stand-in for localStorage
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};

writeStored('theme', 'dark');
console.log(readStored('theme', 'light'));
console.log(readStored('missing', 'light'));
```

Output:

```text
dark
light
```

In the real hook (Section 17, the Cheat Sheet), `useState(() => readStored(key, initial))`
seeds the value and `useEffect` calls `writeStored` on change — the same logic, wrapped in
React's lifecycle.

## 14. Performance Notes

- **Return values are fresh each render** — a hook returning `{ data, loading }` creates a
  new object identity. If a caller puts that in a dependency array, it invalidates every
  render. Wrap returned callbacks in `useCallback` and memoise derived values (Lesson 61/62)
  when the caller needs stability.
- **The hook itself doesn't add cost** — it's just the hooks it calls. `useLocalStorage`
  costs exactly what `useState` + `useEffect` cost.
- **Per-instance state means per-instance cost.** Ten components calling `useUser` run ten
  fetches. If callers should share one fetch, that's server state (Lesson 81) or a cache —
  not a hook.
- Measure with the profiler before optimising inside a hook; the extraction is usually the
  clarity win, not a perf win (Lesson 71's mindset).

## 15. Debugging Scenarios

**Scenario 1 — "Two components that call my hook share state"**

They can't, by design — so check the hook's state actually comes from hooks. If it reads a
module-level `let` or a singleton, that's the shared state. Move shared state to Context or a
store.

**Scenario 2 — "Caller's `useEffect` fires every render"**

The hook returns a fresh object/array. Fix: `useMemo`/`useCallback` inside the hook so the
identity is stable, or restructure the caller to depend on the primitive fields.

**Scenario 3 — "Values flicker or flash on first load"**

The lazy initialiser is running before `localStorage` is ready, or SSR is involved. Guard
with a `typeof window` check in the initialiser, or defer to an effect.

**Scenario 4 — "Lint says `react-hooks/rules-of-hooks` inside my hook"**

A hook is being called after a conditional or early return. Refactor so every hook call is at
the top level, unconditionally (Lesson 66).

## 16. Quick Revision Notes

- Custom hook = function that starts with `use` and calls other hooks
- "A component without the JSX" — per-instance state, same rules as hooks
- Pure function of state: deterministic given args + hook state; side effects live inside hooks
- The prefix is what the lint rules key on — never drop it
- `useLocalStorage`, `useFetch`, `usePrevious` are the classic live-coding answers
- Fresh return identities can break callers' dep arrays — stabilise with `useCallback`/`useMemo`
- Hooks share *logic*, not *state* — shared state needs Context or a store

## 17. Cheat Sheet

```jsx
// The three to write from memory:
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url).then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);
  return { data, error, loading };
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}
```

## 18. Key Takeaways

> [!RECAP]
> - A custom hook is a `use`-prefixed function that composes other hooks — the composition primitive
> - It's a component without the JSX: per-instance state, same Rules of Hooks
> - The hook body is a pure function of its arguments and hook state; side effects live inside hooks
> - The `use` prefix is what triggers the lint rules — lowercasing it drops safety
> - Extract when logic repeats or a component drowns in effects; name by what you return
> - Hooks share logic, never state — shared state is Context (L63) or a store (L80)
> - `useLocalStorage`, `useFetch`, `usePrevious` are the live-coding set to know cold

## Check your understanding

Answer these without looking back.

1. What two things make a function a custom hook?
2. Why must the name start with `use` — what breaks if it doesn't?
3. How does a custom hook get "per-instance state", and why can two callers never share it?
4. Write `usePrevious` and explain the render/effect timing that makes it work.
5. When is a custom hook the wrong tool — and what should you reach for instead?
6. Why can a hook returning `{ data, loading }` cause a caller's effect to fire every render — and how do you fix it?

## What's Next

**Lesson 66 — Rules of Hooks (Internals).** "Why can't hooks go in conditionals?" Because
hooks are a linked list indexed by call order — the internal model, why the rules exist, and
the ESLint rules that enforce them.
