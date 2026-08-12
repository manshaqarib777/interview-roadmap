# Module 3 — React

## Why this module comes third

React is a small idea — **UI = f(state)** — surrounded by a large amount of consequence. The whole
module is about the consequence: what happens when state changes, why your effect runs twice, why a
key matters, and where the re-render cost actually goes.

Almost every "React bug" people bring to a senior engineer is a JavaScript bug wearing a React
costume — a stale closure, a reference-equality trap, an unhandled async error. That is why this
module sits *after* two modules of plain JavaScript and TypeScript: the React answers are obvious
once the foundations are solid, and impossible to fake when they aren't.

## Module map

- **M6 · React Fundamentals (L47–L56)** — the render model.
  JSX, components & composition, props, state & `useState`, rendering & reconciliation, lists &
  keys, events, forms, derived & lifted state, the virtual DOM.
- **M7 · Hooks Mastery (L57–L66)** — the hooks mental model, not the API list.
  `useEffect`, dependency arrays & cleanup, lifecycle & effect order, `useRef`, `useMemo`,
  `useCallback`, `useContext`, `useReducer`, custom hooks, rules of hooks internals.
- **M8 · Performance & Patterns (L67–L76)** — optimisation and the patterns that survived.
  `React.memo`, lazy loading & Suspense, code splitting, virtualization, when *not* to optimise,
  compound components, render props, HOCs, the provider pattern, error boundaries.
- **M9 · State Management (L77–L82)** — where state lives and why.
  Context API, Redux Toolkit, async thunks & selectors, Zustand, TanStack Query, and the capstone:
  local vs global vs server state.

## How to study each lesson

1. **Trace the renders.** For every component example: which render is it on, what does the closure
   capture, what re-renders when state changes? Say it out loud.
2. **Predict before you run.** Every code block: guess the output, *then* run it.
3. **Do the exercise in a file, not in your head.** Run it with
   `node exercises/03-react/<name>.js`.
4. **Say the "why" out loud.** The interview answers are all "because X, therefore Y" — the hooks
   lessons in particular are about the mechanism, not the call signature.

## Prerequisites

Modules 1–2 complete. Closures (L5), reference equality (L6) and purity (L14) are used constantly —
if those feel shaky, re-read them before starting.

## Next

→ [Lesson 47 — JSX](./47-jsx.md)
