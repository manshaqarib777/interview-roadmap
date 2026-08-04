# React + TypeScript + Next.js — Interview Roadmap

A mentored, book-style curriculum. One lesson at a time. Each lesson is a standalone
markdown file you can re-read the night before an interview.

## How this works

**This is revision, not a tutorial.** It assumes you already write code for a living.
Every lesson is short, dense and skimmable — the target is a full concept revised in
**under ten minutes**. No long introductions, no filler, diagrams instead of paragraphs,
tables instead of prose comparisons.

Every lesson follows the same 18-section structure, and each section is its own **step**
in the reader — one idea per screen:

| | | |
|---|---|---|
| 1. One-line definition | 7. Senior-level insights | 13. Code example |
| 2. Mental model | 8. Common mistakes | 14. Performance notes |
| 3. Visual flow | 9. Best practices | 15. Debugging scenarios |
| 4. How it works | 10. Interview questions | 16. Quick revision notes |
| 5. Real project usage | 11. Follow-up questions | 17. Cheat sheet |
| 6. Interview explanation | 12. Comparison table | 18. Key takeaways |

**The loop:** work through the steps → rate yourself → reply `Next` → the following
lesson gets written. Depth beats coverage.

---

## Reading it as a website

The markdown is also served as a fast static site. Content and app are separate:

```
content/       ← the lessons, plain .md — the single source of truth
src/           ← the Next.js app that renders them
exercises/     ← runnable .js files for the coding tasks
```

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # prerenders all 104 lesson pages
```

Markdown → HTML and syntax highlighting both happen **at build time**; the reader then
layers interaction on top. Editing a `.md` file is all it takes to update a page.

**What the app does**

- **Stepped reader** — each of the 18 sections is a separate screen with its own progress,
  so you never face a wall of text.
- **Knowledge graph** (`/graph`) — all 104 concepts as nodes, prerequisites as edges,
  laid out left-to-right by dependency depth. Nodes light up as you complete them.
- **Runnable code** — hover any JS block for Copy / Edit / Run / Reset. Snippets execute
  in a Web Worker, so async examples show their real output ordering.
- **Interview mode** (`i`) — turns question sections into reveal-on-demand cards.
- **Command palette** (`⌘K`) — lessons, actions and synonym search: "state hook" finds
  `useState`.
- **Focus mode** (`f`), text size / line height / column width controls, bookmarks,
  streaks and achievements — all persisted locally.

**Shortcuts:** `⌘K` palette · `/` search · `←` `→` steps · `⇧←` `⇧→` lessons ·
`f` focus · `i` interview mode · `⌘↵` run a snippet you're editing.

---

## Milestones

| # | Milestone | Module | You can claim it when… |
|---|-----------|--------|------------------------|
| M1 | **JS Core Mechanics** | 1 (L1–L10) | You can explain hoisting, TDZ and closures on a whiteboard without notes |
| M2 | **JS Data & Functions** | 1 (L11–L20) | You can implement `map`/`filter`/`reduce`/`debounce`/`curry` from scratch |
| M3 | **Async JavaScript** | 1 (L21–L28) | You can predict the exact output order of any event-loop puzzle |
| M4 | **Type System Fluency** | 2 (L29–L38) | You can model any API response with unions, generics and narrowing |
| M5 | **Type-Level Programming** | 2 (L39–L46) | You can write a conditional + mapped type using `infer` unaided |
| M6 | **React Fundamentals** | 3 (L47–L56) | You can build a controlled form + list UI with zero re-render bugs |
| M7 | **Hooks Mastery** | 3 (L57–L66) | You can explain every hook's cleanup + dependency semantics |
| M8 | **React Performance & Patterns** | 3 (L67–L76) | You can say *when not to optimize* and prove it with a profile |
| M9 | **State Management** | 3 (L77–L82) | You can justify local vs global vs server state for any feature |
| M10 | **Next.js App Router** | 4 (L83–L96) | You can explain the render + cache path of a single request end to end |
| M11 | **Production Concerns** | 4–5 | Auth, forms, testing, a11y, error boundaries — all shipped, not just read |
| M12 | **Interview Ready** | 5 | Three portfolio projects + clean mock interviews |

Progress is tracked in [`PROGRESS.md`](./PROGRESS.md).

---

## Module 1 — JavaScript Foundations

> Folder: [`01-javascript/`](./content/01-javascript/) · [Module overview](./content/01-javascript/00-module-overview.md)

### Milestone M1 — Core Mechanics
| # | Lesson | File | Status |
|---|--------|------|--------|
| 1 | Variables: `var`, `let`, `const` | [`01-variables.md`](./content/01-javascript/01-variables.md) | ✅ Written |
| 2 | Scope & the Scope Chain | `02-scope.md` | ⬜ |
| 3 | Hoisting | `03-hoisting.md` | ⬜ |
| 4 | Temporal Dead Zone | `04-temporal-dead-zone.md` | ⬜ |
| 5 | Closures | `05-closures.md` | ⬜ |
| 6 | Primitive vs Reference Types | `06-primitive-vs-reference.md` | ⬜ |
| 7 | Type Coercion, Truthy/Falsy, `==` vs `===` | `07-coercion-and-equality.md` | ⬜ |
| 8 | Objects | `08-objects.md` | ⬜ |
| 9 | Prototypes & Prototypal Inheritance | `09-prototypes.md` | ⬜ |
| 10 | `this` and binding | `10-this-and-binding.md` | ⬜ |

### Milestone M2 — Data & Functions
| # | Lesson | File | Status |
|---|--------|------|--------|
| 11 | Functions: declarations vs expressions | `11-functions.md` | ⬜ |
| 12 | Arrow functions | `12-arrow-functions.md` | ⬜ |
| 13 | Higher-order functions & callbacks | `13-higher-order-functions.md` | ⬜ |
| 14 | Pure functions & side effects | `14-pure-functions.md` | ⬜ |
| 15 | IIFE & module pattern | `15-iife.md` | ⬜ |
| 16 | Currying & partial application | `16-currying.md` | ⬜ |
| 17 | Memoization | `17-memoization.md` | ⬜ |
| 18 | Debounce & Throttle | `18-debounce-throttle.md` | ⬜ |
| 19 | Arrays & array methods | `19-arrays.md` | ⬜ |
| 20 | Destructuring, spread & rest | `20-destructuring-spread-rest.md` | ⬜ |

### Milestone M3 — Async JavaScript
| # | Lesson | File | Status |
|---|--------|------|--------|
| 21 | Call Stack & execution contexts | `21-call-stack.md` | ⬜ |
| 22 | The Event Loop | `22-event-loop.md` | ⬜ |
| 23 | Microtasks vs Macrotasks | `23-microtasks-macrotasks.md` | ⬜ |
| 24 | Promises from scratch | `24-promises.md` | ⬜ |
| 25 | `async` / `await` | `25-async-await.md` | ⬜ |
| 26 | Promise combinators (`all`/`allSettled`/`race`/`any`) | `26-promise-combinators.md` | ⬜ |
| 27 | Error handling & propagation | `27-error-handling.md` | ⬜ |
| 28 | ES6+ essentials (modules, optional chaining, generators) | `28-modern-es6plus.md` | ⬜ |

---

## Module 2 — TypeScript
> Folder: `content/02-typescript/`

L29 Why TypeScript · L30 Primitives, arrays, tuples · L31 Objects, interfaces, type aliases ·
L32 Union & intersection types · L33 Narrowing & type guards · L34 Functions & overloads ·
L35 `keyof`, `typeof`, indexed access · L36 Generics · L37 Generic constraints ·
L38 Discriminated unions · L39 Utility types · L40 Conditional types · L41 Mapped types ·
L42 Template literal types · L43 `infer` · L44 `satisfies` & `as const` ·
L45 `unknown` vs `any` vs `never` · L46 `tsconfig` & strict mode

## Module 3 — React
> Folder: `content/03-react/`

L47 JSX · L48 Components & composition · L49 Props · L50 State & `useState` ·
L51 Rendering & reconciliation · L52 Lists & keys · L53 Events & synthetic events ·
L54 Controlled vs uncontrolled forms · L55 Derived state & lifting state · L56 Virtual DOM ·
L57 `useEffect` · L58 Dependency arrays & cleanup · L59 Lifecycle & effect order ·
L60 `useRef` · L61 `useMemo` · L62 `useCallback` · L63 `useContext` · L64 `useReducer` ·
L65 Custom hooks · L66 Rules of hooks internals · L67 `React.memo` · L68 Lazy loading & Suspense ·
L69 Code splitting · L70 Virtualization · L71 When *not* to optimize · L72 Compound components ·
L73 Render props · L74 HOCs · L75 Provider pattern · L76 Error boundaries ·
L77 Context API · L78 Redux Toolkit · L79 Async thunks & selectors · L80 Zustand ·
L81 TanStack Query · L82 Local vs global vs server state

## Module 4 — Next.js
> Folder: `content/04-nextjs/`

L83 App Router & file routing · L84 Layouts & nested layouts · L85 Dynamic routes ·
L86 Server Components · L87 Client Components · L88 The server/client boundary ·
L89 Data fetching & `fetch` · L90 Caching · L91 Revalidation, ISR, SSR, SSG ·
L92 Route Handlers · L93 Server Actions · L94 Middleware · L95 Cookies, headers, metadata/SEO ·
L96 Env vars, production build, deployment

## Module 5 — Interview Preparation
> Folder: `content/05-interview-prep/`

L97 Frequently asked JS questions · L98 Frequently asked TS questions ·
L99 Frequently asked React questions · L100 Frequently asked Next.js questions ·
L101 Common coding tasks (debounced search, infinite scroll, modal, tabs, toast…) ·
L102 Frontend system design · L103 Portfolio projects · L104 Mock interview playbook

---

## Reply `Next` to unlock Lesson 2.
