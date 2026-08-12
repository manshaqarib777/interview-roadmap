# Lesson 76 — Error Boundaries

**Interview importance:** ⭐⭐⭐⭐ — still class-only. A common gap, and a common interview gotcha.

You've shipped it, you've debugged it, you've hit the blank white screen. But error
boundaries have a weird status in React: they are the last class-component API you'll ever
need to know, because React still has no way to write one as a function component. A
surprising number of candidates freeze on that fact — the class is the point, not a
leftover.

The mechanism itself is small: two methods, a fallback, and a clear list of what it does
*not* catch. Almost all interview damage comes from the not-catch list — especially async
errors, which connect straight back to Lesson 27.

## Learning Objectives

By the end of this lesson you should be able to:

- Write a working error boundary class from memory
- Say why function components can't be error boundaries
- List exactly what boundaries catch and what they miss
- Explain why async errors escape them, in terms of Lesson 27
- Reset a boundary so the UI recovers after an error

## 1. One-line Definition

**An error boundary is a class component that catches errors thrown by its descendants while they render, and renders fallback UI instead of letting the error unmount the whole tree.**

```jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

That's the minimal boundary: a flag in state, a static method that sets it, a conditional
render. Everything else is polish.

## 2. Mental Model

Without a boundary, one throwing component takes down the whole tree — React unmounts
everything above and the user gets a blank screen. A boundary is a **circuit breaker**: it
sits in the tree, and when a descendant throws, it trips, cuts that branch off, and shows a
replacement instead.

```text
App                                    App
├─ Header                              ├─ Header
├─ ErrorBoundary ──► (open)            ├─ ErrorBoundary ──► TRIPPED
│   └─ Profile                         │   └─ (fallback UI shown)
└─ Footer                              └─ Footer        ← still alive
```

Note what doesn't happen: the boundary only affects *its own subtree*. Header and Footer
keep rendering. That containment is the entire point.

## 3. Visual Flow

```text
  descendant throws during render / lifecycle / constructor
                      │
                      ▼
        getDerivedStateFromError(error)   → return { hasError: true }
                      │                        (pure — must not log here)
                      ▼
             render(): hasError?
              │                │
             yes               no
              ▼                ▼
        fallback UI        this.props.children
              │
              ▼
    componentDidCatch(error, info)   → side effects only:
                                          log, report, track
```

Two methods, two jobs: `getDerivedStateFromError` updates state (pure), `componentDidCatch`
does the side effect (reporting). If you only remember one, remember the static one — a
boundary without it never shows a fallback.

## 4. How It Works

The complete, production-shaped boundary:

```jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Pure: called during render phase. Return the state update only.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Side effects live here — never in getDerivedStateFromError.
    reportError(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;          // or this.props.children replacement
    }
    return this.props.children;
  }
}
```

```narrate
line 7: the static method is render-phase — React may call it more than once, so it must be pure
line 11: componentDidCatch runs after commit — the right place for logging (Lesson 59)
line 16: fallback UI replaces the crashed subtree; nothing above the boundary is affected
line 17: a boundary with no state update in getDerivedStateFromError never shows a fallback
```

Why a class? Because `getDerivedStateFromError` and `componentDidCatch` are lifecycle
methods, and hooks have no lifecycle equivalent for errors — a `try/catch` inside a
function component can't wrap the render of its *children*. React docs are explicit: there
is currently no way to write an error boundary as a function component. The
`react-error-boundary` package wraps the class so you can use one with a render-prop or
hook API — but the class is still underneath.

What boundaries catch, concretely:

| Thrown during… | Caught? |
|---|---|
| Rendering (the `render` of a descendant) | ✅ |
| A lifecycle method of a descendant | ✅ |
| A descendant's `constructor` | ✅ |
| An event handler | ❌ |
| `useEffect` / `useLayoutEffect` | ❌ (see below) |
| A `setTimeout` / `fetch` callback (Lesson 27) | ❌ |
| Server-side rendering (Lesson 68) | ❌ |
| The boundary's own render | ❌ |

The `useEffect` row is a two-part fact, worth saying precisely: an error thrown *inside the
effect body* is caught by a boundary — but an error thrown in a callback the effect handed
to `setTimeout` or a promise is not, because by the time it fires, React is no longer
rendering that subtree. Same split as Lesson 27: synchronous throw vs. async rejection.

The reason is timing, and it's plain JavaScript:

```js
let rendering = true;                       // a boundary only "hears" during a render
let boundaryHasError = false;

// SYNC — thrown while rendering: the boundary reacts.
try {
  throw new Error('boom in render');
} catch (err) {
  if (rendering) boundaryHasError = true;   // getDerivedStateFromError
}
console.log('sync  → boundary caught it:', boundaryHasError);

// ASYNC — thrown in a timer callback, long after rendering finished.
boundaryHasError = false;
rendering = false;
setTimeout(() => {
  try {
    throw new Error('boom in setTimeout');
  } catch (err) {
    // the try/catch sees it — the boundary never does
    console.log('async → boundary caught it:', boundaryHasError);
  }
}, 0);
```

Output:

```text
sync  → boundary caught it: true
async → boundary caught it: false
```

When the timer fires, nothing is rendering — there is no subtree for a boundary to sit in.
An error boundary and a `try/catch` cover different worlds, and async code belongs to the
`try/catch` one (Lesson 27).

## 5. Real Project Usage

| Where | Why |
|---|---|
| Around the whole app (root) | Last line of defence — never a blank screen |
| Around a dashboard/widget grid | One broken widget shouldn't kill the page |
| Around lazy-loaded routes (Lesson 68) | Chunk-load failures get a retry screen, not a crash |
| Around the PDF/export feature | One bad document format, one fallback |
| Around a chat list, per message | Fault isolation, per React docs |

Granularity is a judgement call. A boundary around every avatar is noise; one around the
whole app is not enough — you want the rest of the page to survive. The rule of thumb:
boundaries at feature boundaries.

## 6. Interview Explanation

> An error boundary is a class component implementing `getDerivedStateFromError` and
> `componentDidCatch`. It catches errors thrown by its children during rendering,
> lifecycles and constructors, and renders fallback UI instead of unmounting the whole
> tree. It does not catch event handlers, async code, errors in itself, or SSR — and there
> is no function-component version, so this is one of the few places you still write a
> class.

## 7. Senior-Level Insights

- **"What boundaries don't catch" is the senior part.** Naming event handlers and async
  code — and *why* — separates people who read the docs from people who lived the bugs.
  The *why* is Lesson 27: the error is thrown outside React's render phase, so there is no
  subtree for a boundary to catch it in.
- **Async errors get caught where the promise resolves.** Wrap the code that handles the
  rejected promise — a `.catch` on the `fetch`, or the `try/catch` around `await` inside an
  event handler — not the render. That's also where your error-reporting call belongs.
- **A boundary is also a UX contract.** The fallback should offer a way out: a retry
  button, or a "reload" link. Production users rarely see boundaries with `setState`-only
  fallbacks that offer nothing.
- **Report, don't swallow.** `componentDidCatch` should feed your error tracker. A boundary
  that only shows a fallback is a support ticket generator — you'll never learn the error
  happened.
- **The boundary itself must be boring.** It renders children, a fallback, or a wrapper.
  The moment you put risky logic *inside* the boundary component, it can throw — and
  boundaries don't catch their own errors.

## 8. Common Mistakes

**Mistake 1 — expecting async errors to be caught.** The most common misconception:

```jsx
<ErrorBoundary>
  <DataFetcher />
</ErrorBoundary>

function DataFetcher() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then(setData)
      .catch((err) => { throw err; });   // ❌ NOT caught by the boundary
  }, []);
  // ...
}
```

The rejection happens after render, in a promise callback. The boundary is long gone from
the render stack. Lesson 27's rule: an error is caught by whatever code is *awaiting* it.
Here, nothing is. Add a `.catch` that sets an error state — or `await` in an event handler.

**Mistake 2 — error in the boundary's own render.**

```jsx
render() {
  if (this.state.hasError) {
    return <this.props.fallback />;      // ❌ this.props.fallback is a node, not a type
  }
  return this.props.children;
}
```

Rendering a *component type* as the fallback is a common slip. More importantly: if the
boundary's own `render` throws, nothing above it catches it — a boundary never catches
itself.

**Mistake 3 — only `componentDidCatch`, no state update.** Without
`getDerivedStateFromError` (or an old-style `setState` in `componentDidCatch`), `hasError`
never flips, and the fallback never renders — the boundary "catches" the error invisibly
and keeps trying to render the broken child.

**Mistake 4 — catching, then re-throwing in render.** Returning `children` again while
still in the error state re-throws the same error and loops. The fallback path must be
distinct from the normal path.

## 9. Best Practices

✅ Put `getDerivedStateFromError` (pure) and `componentDidCatch` (side effects) together

✅ Report errors in `componentDidCatch` — to Sentry or your tracker, with `info.componentStack`

✅ Give the fallback a retry or reload affordance

✅ Handle async errors with `.catch` / `try/catch` where the promise resolves — Lesson 27

✅ Place boundaries at feature boundaries: route, dashboard, export, lazy chunk

❌ Don't write a boundary that swallows errors silently — you'll never know they happened

❌ Don't put risky logic inside the boundary component itself

## 10. Interview Questions

**Q1. What is an error boundary?**

> A class component with `getDerivedStateFromError` and `componentDidCatch` that catches
> errors thrown by its descendants during rendering, lifecycle methods and constructors,
> and renders fallback UI instead of letting React unmount the whole tree. One boundary
> contains the failure to its own subtree.

**Q2. Why can't a function component be an error boundary?**

> Because it requires the two lifecycle methods, and hooks have no error-lifecycle
> equivalent — a `try/catch` inside a function can't catch errors in the render of its
> children. There's no function-component API for it yet, so the class is the only way.
> Libraries like `react-error-boundary` wrap the class to give you a hook-style API, but
> the class is underneath.

**Q3. What do error boundaries NOT catch?**

> Event handlers, async code like `setTimeout` or promise callbacks, errors thrown in the
> boundary itself, and server-side rendering. Event handlers need a `try/catch`, and async
> errors need a `.catch` on the promise — because by the time the error is thrown, React
> isn't rendering that subtree anymore.

**Senior follow-up: How do you handle an error thrown inside a `useEffect` that fetches data?**

> Two cases. If the effect body throws synchronously — like reading a field before it
> exists — a surrounding boundary catches it. If the *promise* rejects, the boundary does
> not: that rejection lands outside the render phase, exactly like Lesson 27. I attach a
> `.catch` on the fetch that sets an error state (or rethrows into an error state via
> `setState`), and render a fallback from that state. The boundary and the `try/catch`
> handle different worlds, and I keep them separate.

## 11. Follow-up Questions

**How do you reset a boundary after it catches?**

> There's no built-in reset. The standard is a `reset` key: if the boundary receives a new
> `key` prop, React remounts it — a fresh instance, `hasError` back to `false`. Or expose a
> method that `setState`s `hasError` back to `false` and call it from a Retry button. The
> `react-error-boundary` package turns this into a `resetKeys` prop.

**What is the difference between `getDerivedStateFromError` and `componentDidCatch`?**

> `getDerivedStateFromError` runs during the render phase, must be pure, and is what flips
> the fallback state. `componentDidCatch` runs after commit and is the side-effect hook —
> logging and reporting. `setState` in `componentDidCatch` was the old pattern and is
> deprecated in favour of the static method.

**Where should you place boundaries in a large app?**

> At fault-isolation seams: one at the root as a last resort, then around routes,
> dashboards, widgets and lazy chunks — wherever one failure should not blank the rest of
> the page. Too fine (per avatar) is noise; too coarse (only the root) gives you blank
> pages instead of partial failures.

**Does a boundary catch errors in event handlers?**

> No. An event handler runs outside React's render phase, so there's no render tree for a
> boundary to wrap. The fix is a `try/catch` (or `.catch`) inside the handler, where you
> can also set state to show a message.

## 12. Comparison Table

| | `try/catch` | Error boundary |
|---|---|---|
| Where it works | Inside a function's own call | Around a subtree's render |
| Catches render errors of children | ❌ | ✅ |
| Catches event handlers | ✅ | ❌ |
| Catches async / promises | ✅ (with `await`) | ❌ |
| Fallback UI | Manual state | Automatic via `getDerivedStateFromError` |
| Requirement | None | Class component |
| Use when | Handler/async logic (Lesson 27) | A subtree might fail to render |

Both have a place. The boundary is the only one that can catch a *render* error; `try/catch`
is the only one that can touch async.

## 13. Code Example

Boundary with a reset, used around a risky feature:

```jsx
export class WidgetBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p>This widget hit a problem.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

```narrate
line 10: setState back to false — the boundary re-renders children from scratch
line 13-16: a visible, actionable fallback is the UX contract
line 19: the retry button is just a state reset — no special API
```

Used as:

```jsx
<WidgetBoundary>
  <StockChart symbol={symbol} />
</WidgetBoundary>
```

If `StockChart` throws while rendering, the page survives, the error is reported, and the
user gets a button that restarts the widget — instead of a blank white screen.

## 14. Performance Notes

- Boundaries are **cheap**: two lifecycle calls on the error path, nothing on the happy
  path. Don't worry about the overhead.
- The cost is **operational, not computational** — a coarse boundary means a single bug
  blanks a large region of UI. Boundary granularity is a product decision, not a
  performance one.
- A remount-based reset (new `key`) tears down and rebuilds the whole subtree — fine for
  rare failures, wasteful if you reset eagerly on every render.
- **Logging in `componentDidCatch` runs per error, per boundary.** A flood of errors can
  spam your tracker — batch or throttle reports if a widget loops.

## 15. Debugging Scenarios

**"My boundary never shows the fallback."** First check: is the error async? A rejected
`fetch` in `useEffect` is never caught — that's the most common cause (Lesson 27). Second
check: does `getDerivedStateFromError` actually return the state update? Without it,
`hasError` never flips. Finally, is the throwing component *inside* the boundary?

**"The fallback shows, then immediately disappears / loops."** The boundary caught an error
but `render` still returns the broken children — usually the old
`setState`-in-`componentDidCatch` pattern or a missing flag check. Keep the fallback path
distinct.

**"The boundary itself crashes."** Its own `render` threw — no boundary catches itself.
Move risky logic out, or wrap the boundary in another boundary if you really need defence
in depth (rarely worth it).

**"Errors show in the console but the app keeps working."** In development, React logs
errors that boundaries catch too — a caught error in the console is not a bug. Check
whether production behaves differently; dev-only reporting noise is normal.

## 16. Quick Revision Notes

- Class-only: `getDerivedStateFromError` (state) + `componentDidCatch` (reporting)
- Catches: rendering, lifecycles, constructors of descendants
- Doesn't catch: event handlers, async (Lesson 27), its own errors, SSR
- `useEffect` body: caught; a `setTimeout`/promise callback: not caught
- Handle async with `.catch` / `try/catch` where the promise resolves
- Reset: `setState({ hasError: false })` from a Retry button, or a new `key` to remount
- Place boundaries at feature seams — root, routes, widgets, lazy chunks (Lesson 68)
- Report in `componentDidCatch` — a silent fallback is a ticket generator

## 17. Cheat Sheet

```text
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { report(error, info.componentStack); }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

catches   → render, lifecycle, constructor of descendants
misses    → event handlers, async, own render, SSR
async     → handle at the promise: .catch(() => setState)  (Lesson 27)
reset     → setState({ hasError: false })  |  new key → remount
fallback  → always give the user a way out
```

## 18. Key Takeaways

> [!RECAP]
> - An error boundary is a class component that catches descendant render errors and shows fallback UI — the only class-only React API left
> - Two methods: `getDerivedStateFromError` (pure, flips state) and `componentDidCatch` (side effects, reporting)
> - Function components can't be boundaries — no hook equivalent; libraries wrap the class
> - It catches render/lifecycle/constructor errors only: not event handlers, not async code, not its own errors, not SSR
> - Async errors follow Lesson 27: catch them at the promise, with `.catch` or `try/catch` where it resolves
> - Reset via `setState({ hasError: false })` or a new `key`; always offer the user a way out
> - Place boundaries at feature seams — root, routes, dashboards, lazy chunks (Lesson 68)

## Check your understanding

Answer these without looking back.

1. Write a minimal error boundary from memory.
2. Why must `getDerivedStateFromError` be pure, and where do side effects belong?
3. Why can't a function component be an error boundary?
4. List the four things error boundaries do not catch, and the *why* for async.
5. An effect's body throws; a `setTimeout` callback throws. Which reaches the boundary?
6. How do you reset a boundary — and what does a new `key` actually do?
7. Where would you place boundaries in a real app, and why that granularity?

## What's Next

**Lesson 77 — Context API.** The provider pattern's core primitive, done properly: when
context is the right tool, local vs global state, and the re-render cost people miss.
