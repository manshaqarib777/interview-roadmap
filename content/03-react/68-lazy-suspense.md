# Lesson 68 — Lazy Loading & Suspense

**Interview importance:** ⭐⭐⭐ — a standard React question with a surprising amount of
depth. The basic answer is one line: `React.lazy` defers loading a component until it's
first rendered, and `Suspense` shows a fallback while it loads. The depth is in what
"waiting" means, and how Suspense changes data fetching.

`Suspense` is a loading *primitive*, not a loading *component* — React will wait for
anything that "suspends", and show a fallback while it does. The original use is
component code; the future is data. Foundational — later lessons build directly on this.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `React.lazy` defers, and when the code actually loads
- Set up `Suspense` with a fallback and name what can appear in the fallback
- Explain why a `lazy` component needs to be *inside* a `Suspense` boundary
- Describe how Suspense changes the data-fetching model versus `useEffect`
- Compare lazy loading to eager loading and know the trade-off

## 1. One-line definition

**Lazy loading defers loading a component's code until it is first rendered; `Suspense`
pauses the tree and shows a fallback while that load — of code or data — is in flight.**

## 2. Mental model

The movie theatre. The ticket taker (React) lets you through the door and sits you in the
auditorium. The projector (the component's code) is still warming up — so the house lights
stay on and a "please wait" slide (the fallback) plays. When the film is ready, the lights
drop and the real content replaces the slide in one swap. Nothing else in the building
waits; the rest of the theatre keeps running.

`React.lazy` is the *delayed* projector: it doesn't even start warming up until the
auditorium is first opened. `Suspense` is the *waiting room*: it catches anything that
isn't ready and shows a placeholder for exactly that region, not the whole app.

## 3. Visual flow

```text
First render of <Route path="/reports">
        │
        ▼
React.lazy: "need the Reports chunk" ──► dynamic import() starts, nothing loaded yet
        │
        ▼
┌────────────────────────────┐        network ──► chunk downloaded & evaluated
│ <Suspense fallback={<Spinner/>}>     │
│   "waiting…"              │ ◄────────┘
└────────────────────────────┘
        │  import resolves
        ▼
Spinner swapped out in one commit — Rest of the app never paused
```

## 4. How it works

`React.lazy` takes a function that must return a `Promise` resolving to a module with a
default export. React calls that function the first time the component renders — not at
import time, not at module load. The promise is a *suspension signal*: while it's
pending, React unwinds to the nearest `<Suspense>` boundary and renders its `fallback`.

```jsx {1,4-5}
const Reports = lazy(() => import('./Reports'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Reports />
    </Suspense>
  );
}
```

The fallback is not a new kind of component — it's an ordinary React element, rendered in
place of the suspended subtree. When the promise resolves, the tree is committed in one
pass: the fallback disappears and the real component appears together, no flicker.

`lazy` components **must** be rendered under a `Suspense` boundary. If a lazy component
renders with no boundary above it, React throws — the error boundary above it catches a
promise rejection instead of a render error, which is why the boundary must also provide
a fallback:

```jsx {2-4}
<Suspense fallback={<PageSpinner />}>
  <ErrorBoundary fallback={<PageError />}>
    <Reports />
  </ErrorBoundary>
</Suspense>
```

The key ordering: `Suspense` catches the *suspension*, the error boundary catches the
*rejection*. A failed network load inside `lazy` propagates as a rejected promise that
only the error boundary can handle.

## 5. Real project usage

| Pattern | What gets deferred |
|---|---|
| **Route-level** | The whole page component for a route, so the shell + login load first |
| **Modal / dialog** | A rarely-opened editor only loads when the user actually opens it |
| **Heavy chart / PDF viewer** | Big third-party libs load on demand, not on app start |
| **Below-the-fold section** | A stats panel loads after the first paint has already happened |

```jsx {2-5}
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./routes/Dashboard'));
const Settings = lazy(() => import('./routes/Settings'));
const Reports  = lazy(() => import('./routes/Reports'));
```

Every route becomes its own chunk. The initial bundle drops to just the shell and the
shared code, and each route's code arrives when — and only when — someone navigates to it.

> [!TIP]
> `lazy()` expects a module with a **default export**. Export a named component and you
> get a silent runtime failure (`element type is invalid`). The standard fix is the
> re-export file: `export { Reports } from './Reports';` or the default-export shim below.

## 6. Interview explanation

> `React.lazy` wraps a dynamic import. The component's code isn't loaded until the
> component first renders; while the import is pending, React shows the nearest
> `Suspense` fallback. When the promise resolves, the real component is committed in one
> pass.
>
> The important part is the boundary: a lazy component needs a `Suspense` above it, and
> load failures need an error boundary above *that*. Suspense is general — it waits for
> any suspended promise, code or data, and shows a fallback for just that region.

## 7. Senior-level insights

- **Separate the load from the boundary.** `lazy` handles *code*; `Suspense` handles
  *waiting*, for code or for data. Saying "lazy loading is one feature and Suspense is
  another — they're often used together but Suspense isn't lazy loading's API" is the
  senior distinction.
- **The boundary is the sizing decision.** One `Suspense` around the whole app shows one
  spinner for everything; a boundary per region keeps unrelated parts interactive. The
  fallback scope is a product decision, not a boilerplate detail.
- **Place `Suspense` high, `lazy` low.** Put the boundary near the route or the shell so
  a load never bubbles to a full-page spinner; put the `lazy()` call at the leaf you want
  to defer. The boundary catches everything below it, including nested `lazy`
  components.
- **Fallback design matters.** A spinner that flashes in and out is a worse experience
  than keeping the old content visible. Real apps keep the previous screen up during
  navigation or render a skeleton, not a spinner, for data.
- **Know the gotchas.** A dynamic import with a template literal that includes a variable
  defeats static analysis and produces one chunk for the whole directory. Named exports
  break `lazy`. And a `lazy` with no `Suspense` above it throws a runtime error, not a
  clean warning.

## 8. Common mistakes

**Mistake 1 — forgetting the `Suspense` boundary.**

```jsx
const Reports = lazy(() => import('./Reports'));
function App() { return <Reports />; }   // 💥 no Suspense above → runtime error
```

**Mistake 2 — named exports.** `lazy(() => import('./x'))` resolves the module's default
export. A named-export module yields a component-less module and breaks at render.

**Mistake 3 — dynamic import with a variable path.**

```js
const Page = lazy(() => import(`./pages/${name}`));   // ❌ one giant chunk, not per-page
```

Webpack/Vite can only statically analyse literal paths. A variable makes the bundler emit
one chunk covering the whole directory.

**Mistake 4 — a full-page spinner for a tiny lazy component.** The fallback flashes in and
out for a fast chunk. Keep the boundary tight so the flash is invisible.

**Mistake 5 — treating Suspense as a fetch library.** A promise passed to `useEffect` is
not automatically suspending. Suspense needs a promise that the framework *throws* while
pending — that's the model of the libraries below, not something your `useEffect` does
out of the box.

## 9. Best practices

✅ Lazy-load at route level and for rare, heavy features — modals, editors, charts

✅ Keep the fallback tight: a small spinner or skeleton per region, not a page-wide loader

✅ Use `useEffect` or `useState` for ordinary one-time client work; let `lazy`/`Suspense` carry the code-and-data waits

✅ Handle load failure with an error boundary above the Suspense boundary

✅ Let the bundler split by structure — `import('./routes/Reports')` produces its own chunk

❌ Don't lazy-load everything; a fast initial load is a trade-off, not a free win

❌ Don't render a lazy component without a Suspense boundary above it

## 10. Interview questions

**Q1. What does `React.lazy` do?**

> It's a function that takes a dynamic import — a function returning a promise — and
> returns a component whose code isn't loaded until the component is first rendered.
> Until that promise resolves, the nearest `Suspense` boundary shows its fallback.

**Q2. What is `Suspense`?**

> A boundary that pauses rendering of the subtree below it when something in that subtree
> "suspends" — throws a pending promise — and renders a fallback instead. When the promise
> resolves, React commits the real content in one pass. The classic case is a `lazy`
> component's chunk still loading.

**Q3. Can you lazy-load a named export?**

> Not directly — `lazy` resolves the default export. You create a small module that
> re-exports it as default, or restructure to a default export.

**Senior follow-up: How does Suspense change data fetching?**

> Before Suspense, you fetch in `useEffect` and juggle `loading`/`error`/`data` state
> yourself, with the loading state scattered around the tree. With Suspense, a data
> library can *throw the in-flight promise* — the boundary catches it and shows a
> fallback. The component that needs the data just reads it; no loading flags, no
> effect-ordering bugs. Libraries like TanStack Query (Lesson 81) adopt this, and it
> generalises to cache-miss-aware rendering: if data is cached, no suspension happens at
> all, so there's no spinner.

## 11. Follow-up questions

**What happens if a lazy load fails?**

> The import promise rejects. That's not handled by `Suspense` — the nearest error
> boundary above it catches the rejection and shows its fallback. So you pair them:
> `Suspense` for the pending state, an error boundary for the failed state.

**Does lazy loading reduce the initial load time?**

> The initial *parse and execution* time drops — less code arrives and runs at startup.
> But a chunk is another network request, so you may trade a slightly larger total
> download for a faster first paint, and you add a loading state on the boundary. It wins
> when the deferred feature is heavy and rarely used.

**When is lazy loading the wrong tool?**

> When the feature is needed on nearly every visit, or when the chunk is tiny. Splitting
> an always-used component just adds a request, a fallback flash, and slower navigation —
> the initial bundle is split, but the same total code still loads, just later.

## 12. Comparison table

| | Eager import | `lazy` + dynamic import |
|---|---|---|
| Code loads | at app start | first time the component renders |
| Initial bundle | everything | shell + shared code only |
| First paint | waits for all code | fast, then chunk loads on demand |
| Loading state | none | `Suspense` fallback |
| Network requests | one big request | one big request + one per chunk |
| Best for | core, always-visited features | routes, modals, heavy rare features |

## 13. Code example

A modal whose editor loads only when the user opens it:

```jsx {7,11}
import { useState, lazy, Suspense } from 'react';

const Editor = lazy(() => import('./Editor'));

export default function Composer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Write</button>
      {open && (
        <Suspense fallback={<div>Loading editor…</div>}>
          <Editor />
        </Suspense>
      )}
    </>
  );
}
```

The `Editor` chunk isn't requested until the button is clicked and `open` turns true —
which is also when the branch first renders. Closing the modal unmounts it; reopening
resolves from the module cache, so there's no second download.

```text
(first visit)  button visible — Editor chunk not requested
(click Write)  dynamic import starts  →  fallback "Loading editor…"
               chunk arrives          →  editor commits in one pass
(close modal)  editor unmounts; chunk stays in the module cache
```

```narrate
7: the import call is the promise lazy will wait on
11: the boundary that owns the wait — only this region shows the fallback
```

## 14. Performance notes

When it matters: apps with heavy route bundles where first paint is the bottleneck, and
rarely-visited features that carry expensive third-party code. Route-level lazy loading is
the single highest-impact split most apps can make.

When it doesn't: small apps where the whole bundle is already tiny, or features used on
nearly every visit — the split just moves the same bytes later and adds a fallback flash.

The hidden cost: every chunk is an extra round trip and an extra parse, and a lazy
component that's mounted eagerly in practice (a modal that's always open, say) splits code
for no gain. Also, the interaction of data and code: if the code chunk and the data
arrive at different times, you want one fallback for both — which is what data-suspense
libraries give you.

## 15. Debugging scenarios

**"My lazy component never loads — blank screen, no error."** A missing default export is
the usual culprit. Log `import('./Editor')` and check `.default` exists; then check the
component is under a `Suspense` boundary — without one, React throws on the first render.

**"I get a giant chunk even though I split."** A variable inside the import path breaks
static analysis. Replace `` import(`./pages/${name}`) `` with literal paths per route.

**"The spinner flashes for a split second every time."** The chunk is small and the
fallback renders anyway. Raise the boundary or keep the previous content on screen during
navigation so the swap is invisible.

**"A lazy route fails and the whole app crashes."** The rejection needs an error boundary
above the Suspense boundary. Add one per region instead of only at the app root.

**"My `useEffect` data fetch doesn't suspend."** Correct — `useEffect` is not Suspense.
To get Suspense semantics, the promise has to be *thrown* while pending, which is what a
data library does. Plain `useEffect` state remains the standard tool for ad-hoc fetches.

## 16. Quick revision notes

- `lazy(() => import('./X'))` defers the chunk until `X` first renders
- `Suspense` shows a fallback while anything below it is waiting — code or data
- A `lazy` component with no `Suspense` above it throws
- A failed chunk load rejects the promise — error boundary territory, not Suspense's
- `lazy` wants a default export; named exports need a re-export shim
- Literal import paths only — variables kill the per-file chunking
- Route-level splitting is the highest-value place to lazy-load
- The fallback scope is a product decision: tight boundaries, not one app-wide spinner

## 17. Cheat sheet

```jsx
import { lazy, Suspense } from 'react';

const Reports = lazy(() => import('./routes/Reports')); // chunk created at build time

<Suspense fallback={<Skeleton />}>
  <ErrorBoundary fallback={<RouteError />}>
    <Reports />
  </ErrorBoundary>
</Suspense>
```

- Load order: module → bundle → chunk per route/feature
- `lazy` needs: dynamic import + default export + a `Suspense` above it
- Failures: error boundary above the Suspense boundary
- Suspense waits for anything that throws a pending promise — not only chunks
- Splitting by structure gives the bundler stable, analysable boundaries

## 18. Key takeaways

> [!RECAP]
> - `React.lazy` defers a component's code until first render; `Suspense` shows a fallback while it waits
> - Lazy + Suspense is one common pair, but Suspense is general — it waits on any suspended promise
> - A lazy component needs a `Suspense` boundary above it, and an error boundary for failed loads
> - The boundary scope decides the UX: tight boundaries keep unrelated UI interactive
> - Literal import paths and default exports are required for splitting to work
> - Route-level lazy loading is the biggest initial-load win in a typical app

## Check your understanding

Answer these without looking back.

1. When does the code inside `React.lazy(() => import('./X'))` actually load?
2. What does `Suspense` render while a lazy chunk is loading, and where does it look for it?
3. What happens if a lazy component has no `Suspense` boundary above it? What if the import fails?
4. Why can't `lazy` take a component exported as a named export?
5. Why does a variable inside an import path break per-file code splitting?
6. How is Suspense-based data fetching different from the `useEffect` + loading-state pattern?

## What's Next

**Lesson 69 — Code Splitting.** Lazy loading is the *symptom*; code splitting is the
*mechanism*. Next: how the bundler actually divides your app into chunks, and how to read
what it produced.