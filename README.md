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
| M13 | **Laravel Fundamentals** | 6 (L105–L110) | You can trace a request from `public/index.php` to a response and explain where the container, providers, facades and contracts fit |
| M14 | **Routing & Request Handling** | 6 (L111–L114) | You can map any URL to its controller through middleware, model binding and form requests — and explain why controllers stay thin |
| M15 | **Eloquent & the Database** | 6 (L115–L121) | You can model any relationship, kill N+1 with eager loading, and design a schema with migrations and transactions |
| M16 | **Auth, Queues & Async** | 6 (L122–L129) | You can explain auth vs authorization, why queues exist, how caching invalidation works, and the full test pyramid |
| M17 | **Senior & Full-Stack** | 6 (L130–L134) | You can answer the senior scenarios — slow API, overselling, dead Redis, broken deploy, leaking tenants — with a decision rule, not a guess |

Progress is tracked in [`PROGRESS.md`](./PROGRESS.md).

---

## Module 1 — JavaScript Foundations

> Folder: [`01-javascript/`](./content/01-javascript/) · [Module overview](./content/01-javascript/00-module-overview.md)

### Milestone M1 — Core Mechanics
| # | Lesson | File | Status |
|---|--------|------|--------|
| 1 | Variables: `var`, `let`, `const` | [`01-variables.md`](./content/01-javascript/01-variables.md) | ✅ Written |
| 2 | Scope & the Scope Chain | [`02-scope.md`](./content/01-javascript/02-scope.md) | ✅ Written |
| 3 | Hoisting | [`03-hoisting.md`](./content/01-javascript/03-hoisting.md) | ✅ Written |
| 4 | Temporal Dead Zone | [`04-temporal-dead-zone.md`](./content/01-javascript/04-temporal-dead-zone.md) | ✅ Written |
| 5 | Closures | [`05-closures.md`](./content/01-javascript/05-closures.md) | ✅ Written |
| 6 | Primitive vs Reference Types | [`06-primitive-vs-reference.md`](./content/01-javascript/06-primitive-vs-reference.md) | ✅ Written |
| 7 | Type Coercion, Truthy/Falsy, `==` vs `===` | [`07-coercion-and-equality.md`](./content/01-javascript/07-coercion-and-equality.md) | ✅ Written |
| 8 | Objects | [`08-objects.md`](./content/01-javascript/08-objects.md) | ✅ Written |
| 9 | Prototypes & Prototypal Inheritance | [`09-prototypes.md`](./content/01-javascript/09-prototypes.md) | ✅ Written |
| 10 | `this` and binding | [`10-this-and-binding.md`](./content/01-javascript/10-this-and-binding.md) | ✅ Written |

### Milestone M2 — Data & Functions
| # | Lesson | File | Status |
|---|--------|------|--------|
| 11 | Functions: declarations vs expressions | [`11-functions.md`](./content/01-javascript/11-functions.md) | ✅ Written |
| 12 | Arrow functions | [`12-arrow-functions.md`](./content/01-javascript/12-arrow-functions.md) | ✅ Written |
| 13 | Higher-order functions & callbacks | [`13-higher-order-functions.md`](./content/01-javascript/13-higher-order-functions.md) | ✅ Written |
| 14 | Pure functions & side effects | [`14-pure-functions.md`](./content/01-javascript/14-pure-functions.md) | ✅ Written |
| 15 | IIFE & module pattern | [`15-iife.md`](./content/01-javascript/15-iife.md) | ✅ Written |
| 16 | Currying & partial application | [`16-currying.md`](./content/01-javascript/16-currying.md) | ✅ Written |
| 17 | Memoization | [`17-memoization.md`](./content/01-javascript/17-memoization.md) | ✅ Written |
| 18 | Debounce & Throttle | [`18-debounce-throttle.md`](./content/01-javascript/18-debounce-throttle.md) | ✅ Written |
| 19 | Arrays & array methods | [`19-arrays.md`](./content/01-javascript/19-arrays.md) | ✅ Written |
| 20 | Destructuring, spread & rest | [`20-destructuring-spread-rest.md`](./content/01-javascript/20-destructuring-spread-rest.md) | ✅ Written |

### Milestone M3 — Async JavaScript
| # | Lesson | File | Status |
|---|--------|------|--------|
| 21 | Call Stack & execution contexts | [`21-call-stack.md`](./content/01-javascript/21-call-stack.md) | ✅ Written |
| 22 | The Event Loop | [`22-event-loop.md`](./content/01-javascript/22-event-loop.md) | ✅ Written |
| 23 | Microtasks vs Macrotasks | [`23-microtasks-macrotasks.md`](./content/01-javascript/23-microtasks-macrotasks.md) | ✅ Written |
| 24 | Promises from scratch | [`24-promises.md`](./content/01-javascript/24-promises.md) | ✅ Written |
| 25 | `async` / `await` | [`25-async-await.md`](./content/01-javascript/25-async-await.md) | ✅ Written |
| 26 | Promise combinators (`all`/`allSettled`/`race`/`any`) | [`26-promise-combinators.md`](./content/01-javascript/26-promise-combinators.md) | ✅ Written |
| 27 | Error handling & propagation | [`27-error-handling.md`](./content/01-javascript/27-error-handling.md) | ✅ Written |
| 28 | ES6+ essentials (modules, optional chaining, generators) | [`28-modern-es6plus.md`](./content/01-javascript/28-modern-es6plus.md) | ✅ Written |

---

## Module 2 — TypeScript
> Folder: [`02-typescript/`](./content/02-typescript/) · [Module overview](./content/02-typescript/00-module-overview.md)

### Milestone M4 — Type System Fluency
| # | Lesson | File | Status |
|---|--------|------|--------|
| 29 | Why TypeScript? | [`29-why-typescript.md`](./content/02-typescript/29-why-typescript.md) | ✅ Written |
| 30 | Primitives, arrays & tuples | [`30-primitives-arrays-tuples.md`](./content/02-typescript/30-primitives-arrays-tuples.md) | ✅ Written |
| 31 | Objects, interfaces & type aliases | [`31-objects-interfaces-aliases.md`](./content/02-typescript/31-objects-interfaces-aliases.md) | ✅ Written |
| 32 | Union & intersection types | [`32-unions-intersections.md`](./content/02-typescript/32-unions-intersections.md) | ✅ Written |
| 33 | Narrowing & type guards | [`33-narrowing-type-guards.md`](./content/02-typescript/33-narrowing-type-guards.md) | ✅ Written |
| 34 | Functions & overloads | [`34-functions-overloads.md`](./content/02-typescript/34-functions-overloads.md) | ✅ Written |
| 35 | `keyof`, `typeof` & indexed access | [`35-keyof-typeof-indexed.md`](./content/02-typescript/35-keyof-typeof-indexed.md) | ✅ Written |
| 36 | Generics | [`36-generics.md`](./content/02-typescript/36-generics.md) | ✅ Written |
| 37 | Generic constraints | [`37-generic-constraints.md`](./content/02-typescript/37-generic-constraints.md) | ✅ Written |
| 38 | Discriminated unions | [`38-discriminated-unions.md`](./content/02-typescript/38-discriminated-unions.md) | ✅ Written |

### Milestone M5 — Type-Level Programming
| # | Lesson | File | Status |
|---|--------|------|--------|
| 39 | Utility types | [`39-utility-types.md`](./content/02-typescript/39-utility-types.md) | ✅ Written |
| 40 | Conditional types | [`40-conditional-types.md`](./content/02-typescript/40-conditional-types.md) | ✅ Written |
| 41 | Mapped types | [`41-mapped-types.md`](./content/02-typescript/41-mapped-types.md) | ✅ Written |
| 42 | Template literal types | [`42-template-literal-types.md`](./content/02-typescript/42-template-literal-types.md) | ✅ Written |
| 43 | `infer` | [`43-infer.md`](./content/02-typescript/43-infer.md) | ✅ Written |
| 44 | `satisfies` & `as const` | [`44-satisfies-as-const.md`](./content/02-typescript/44-satisfies-as-const.md) | ✅ Written |
| 45 | `unknown` vs `any` vs `never` | [`45-unknown-any-never.md`](./content/02-typescript/45-unknown-any-never.md) | ✅ Written |
| 46 | `tsconfig` & strict mode | [`46-tsconfig-strict.md`](./content/02-typescript/46-tsconfig-strict.md) | ✅ Written |

## Module 3 — React
> Folder: [`03-react/`](./content/03-react/) · [Module overview](./content/03-react/00-module-overview.md)

### Milestone M6 — React Fundamentals
| # | Lesson | File | Status |
|---|--------|------|--------|
| 47 | JSX | [`47-jsx.md`](./content/03-react/47-jsx.md) | ✅ Written |
| 48 | Components & composition | [`48-components-composition.md`](./content/03-react/48-components-composition.md) | ✅ Written |
| 49 | Props | [`49-props.md`](./content/03-react/49-props.md) | ✅ Written |
| 50 | State & `useState` | [`50-state-usestate.md`](./content/03-react/50-state-usestate.md) | ✅ Written |
| 51 | Rendering & reconciliation | [`51-rendering-reconciliation.md`](./content/03-react/51-rendering-reconciliation.md) | ✅ Written |
| 52 | Lists & keys | [`52-lists-and-keys.md`](./content/03-react/52-lists-and-keys.md) | ✅ Written |
| 53 | Events & synthetic events | [`53-events.md`](./content/03-react/53-events.md) | ✅ Written |
| 54 | Controlled vs uncontrolled forms | [`54-forms.md`](./content/03-react/54-forms.md) | ✅ Written |
| 55 | Derived state & lifting state | [`55-derived-and-lifted-state.md`](./content/03-react/55-derived-and-lifted-state.md) | ✅ Written |
| 56 | The Virtual DOM | [`56-virtual-dom.md`](./content/03-react/56-virtual-dom.md) | ✅ Written |

### Milestone M7 — Hooks Mastery
| # | Lesson | File | Status |
|---|--------|------|--------|
| 57 | `useEffect` | [`57-useeffect.md`](./content/03-react/57-useeffect.md) | ✅ Written |
| 58 | Dependency arrays & cleanup | [`58-deps-and-cleanup.md`](./content/03-react/58-deps-and-cleanup.md) | ✅ Written |
| 59 | Lifecycle & effect order | [`59-lifecycle.md`](./content/03-react/59-lifecycle.md) | ✅ Written |
| 60 | `useRef` | [`60-useref.md`](./content/03-react/60-useref.md) | ✅ Written |
| 61 | `useMemo` | [`61-usememo.md`](./content/03-react/61-usememo.md) | ✅ Written |
| 62 | `useCallback` | [`62-usecallback.md`](./content/03-react/62-usecallback.md) | ✅ Written |
| 63 | `useContext` | [`63-usecontext.md`](./content/03-react/63-usecontext.md) | ✅ Written |
| 64 | `useReducer` | [`64-usereducer.md`](./content/03-react/64-usereducer.md) | ✅ Written |
| 65 | Custom hooks | [`65-custom-hooks.md`](./content/03-react/65-custom-hooks.md) | ✅ Written |
| 66 | Rules of hooks (internals) | [`66-rules-of-hooks.md`](./content/03-react/66-rules-of-hooks.md) | ✅ Written |

### Milestone M8 — Performance & Patterns
| # | Lesson | File | Status |
|---|--------|------|--------|
| 67 | `React.memo` | [`67-react-memo.md`](./content/03-react/67-react-memo.md) | ✅ Written |
| 68 | Lazy loading & Suspense | [`68-lazy-suspense.md`](./content/03-react/68-lazy-suspense.md) | ✅ Written |
| 69 | Code splitting | [`69-code-splitting.md`](./content/03-react/69-code-splitting.md) | ✅ Written |
| 70 | Virtualization | [`70-virtualization.md`](./content/03-react/70-virtualization.md) | ✅ Written |
| 71 | When *not* to optimize | [`71-when-not-to-optimize.md`](./content/03-react/71-when-not-to-optimize.md) | ✅ Written |
| 72 | Compound components | [`72-compound-components.md`](./content/03-react/72-compound-components.md) | ✅ Written |
| 73 | Render props | [`73-render-props.md`](./content/03-react/73-render-props.md) | ✅ Written |
| 74 | Higher-order components | [`74-hocs.md`](./content/03-react/74-hocs.md) | ✅ Written |
| 75 | The provider pattern | [`75-provider-pattern.md`](./content/03-react/75-provider-pattern.md) | ✅ Written |
| 76 | Error boundaries | [`76-error-boundaries.md`](./content/03-react/76-error-boundaries.md) | ✅ Written |

### Milestone M9 — State Management
| # | Lesson | File | Status |
|---|--------|------|--------|
| 77 | Context API | [`77-context-api.md`](./content/03-react/77-context-api.md) | ✅ Written |
| 78 | Redux Toolkit | [`78-redux-toolkit.md`](./content/03-react/78-redux-toolkit.md) | ✅ Written |
| 79 | Async thunks & selectors | [`79-thunks-selectors.md`](./content/03-react/79-thunks-selectors.md) | ✅ Written |
| 80 | Zustand | [`80-zustand.md`](./content/03-react/80-zustand.md) | ✅ Written |
| 81 | TanStack Query | [`81-tanstack-query.md`](./content/03-react/81-tanstack-query.md) | ✅ Written |
| 82 | Local vs global vs server state | [`82-state-strategy.md`](./content/03-react/82-state-strategy.md) | ✅ Written |

## Module 4 — Next.js
> Folder: [`04-nextjs/`](./content/04-nextjs/) · [Module overview](./content/04-nextjs/00-module-overview.md)

### Milestone M10 — App Router
| # | Lesson | File | Status |
|---|--------|------|--------|
| 83 | App Router & file routing | [`83-app-router.md`](./content/04-nextjs/83-app-router.md) | ✅ Written |
| 84 | Layouts & nested layouts | [`84-layouts.md`](./content/04-nextjs/84-layouts.md) | ✅ Written |
| 85 | Dynamic routes | [`85-dynamic-routes.md`](./content/04-nextjs/85-dynamic-routes.md) | ✅ Written |
| 86 | Server Components | [`86-server-components.md`](./content/04-nextjs/86-server-components.md) | ✅ Written |
| 87 | Client Components | [`87-client-components.md`](./content/04-nextjs/87-client-components.md) | ✅ Written |
| 88 | The server/client boundary | [`88-server-client-boundary.md`](./content/04-nextjs/88-server-client-boundary.md) | ✅ Written |
| 89 | Data fetching & `fetch` | [`89-data-fetching.md`](./content/04-nextjs/89-data-fetching.md) | ✅ Written |
| 90 | Caching | [`90-caching.md`](./content/04-nextjs/90-caching.md) | ✅ Written |
| 91 | Revalidation, ISR, SSR & SSG | [`91-revalidation-isr-ssr-ssg.md`](./content/04-nextjs/91-revalidation-isr-ssr-ssg.md) | ✅ Written |
| 92 | Route Handlers | [`92-route-handlers.md`](./content/04-nextjs/92-route-handlers.md) | ✅ Written |
| 93 | Server Actions | [`93-server-actions.md`](./content/04-nextjs/93-server-actions.md) | ✅ Written |
| 94 | Middleware | [`94-middleware.md`](./content/04-nextjs/94-middleware.md) | ✅ Written |
| 95 | Cookies, headers, metadata/SEO | [`95-cookies-headers-metadata.md`](./content/04-nextjs/95-cookies-headers-metadata.md) | ✅ Written |
| 96 | Env vars, production build, deployment | [`96-deployment.md`](./content/04-nextjs/96-deployment.md) | ✅ Written |

## Module 5 — Interview Preparation
> Folder: [`05-interview-prep/`](./content/05-interview-prep/) · [Module overview](./content/05-interview-prep/00-module-overview.md)

### Milestone M11 — Production Concerns
| # | Lesson | File | Status |
|---|--------|------|--------|
| 97 | Frequently asked JS questions | [`97-js-questions.md`](./content/05-interview-prep/97-js-questions.md) | ✅ Written |
| 98 | Frequently asked TS questions | [`98-ts-questions.md`](./content/05-interview-prep/98-ts-questions.md) | ✅ Written |
| 99 | Frequently asked React questions | [`99-react-questions.md`](./content/05-interview-prep/99-react-questions.md) | ✅ Written |
| 100 | Frequently asked Next.js questions | [`100-nextjs-questions.md`](./content/05-interview-prep/100-nextjs-questions.md) | ✅ Written |
| 101 | Common coding tasks | [`101-coding-tasks.md`](./content/05-interview-prep/101-coding-tasks.md) | ✅ Written |
| 102 | Frontend system design | [`102-system-design.md`](./content/05-interview-prep/102-system-design.md) | ✅ Written |

### Milestone M12 — Interview Ready
| # | Lesson | File | Status |
|---|--------|------|--------|
| 103 | Portfolio projects | [`103-portfolio-projects.md`](./content/05-interview-prep/103-portfolio-projects.md) | ✅ Written |
| 104 | Mock interview playbook | [`104-mock-interviews.md`](./content/05-interview-prep/104-mock-interviews.md) | ✅ Written |

## Module 6 — Laravel
> Folder: [`06-laravel/`](./content/06-laravel/) · [Module overview](./content/06-laravel/00-module-overview.md) · [Master checklist](./content/06-laravel/laravel-interview-master-checklist.md) · [Topics breakdown](./content/06-laravel/topics-breakdown.md)

### Milestone M13 — Laravel Fundamentals
| # | Lesson | File | Status |
|---|--------|------|--------|
| 105 | What is Laravel? | [`105-what-is-laravel.md`](./content/06-laravel/105-what-is-laravel.md) | ✅ Written |
| 106 | Request Lifecycle | [`106-request-lifecycle.md`](./content/06-laravel/106-request-lifecycle.md) | ✅ Written |
| 107 | Application Structure & Bootstrapping | [`107-app-structure.md`](./content/06-laravel/107-app-structure.md) | ✅ Written |
| 108 | The Service Container & Dependency Injection | [`108-service-container.md`](./content/06-laravel/108-service-container.md) | ✅ Written |
| 109 | Service Providers | [`109-service-providers.md`](./content/06-laravel/109-service-providers.md) | ✅ Written |
| 110 | Facades & Contracts | [`110-facades-contracts.md`](./content/06-laravel/110-facades-contracts.md) | ✅ Written |

### Milestone M14 — Routing & Request Handling
| # | Lesson | File | Status |
|---|--------|------|--------|
| 111 | Routing | [`111-routing.md`](./content/06-laravel/111-routing.md) | ✅ Written |
| 112 | Middleware | [`112-middleware.md`](./content/06-laravel/112-middleware.md) | ✅ Written |
| 113 | Controllers, Requests & Responses | [`113-controllers.md`](./content/06-laravel/113-controllers.md) | ✅ Written |
| 114 | Blade | [`114-blade.md`](./content/06-laravel/114-blade.md) | ✅ Written |

### Milestone M15 — Eloquent & the Database
| # | Lesson | File | Status |
|---|--------|------|--------|
| 115 | Eloquent ORM | [`115-eloquent.md`](./content/06-laravel/115-eloquent.md) | ✅ Written |
| 116 | Eloquent Relationships | [`116-eloquent-relationships.md`](./content/06-laravel/116-eloquent-relationships.md) | ✅ Written |
| 117 | Eager Loading & the N+1 Problem | [`117-n1-problem.md`](./content/06-laravel/117-n1-problem.md) | ✅ Written |
| 118 | Query Optimization & the Query Builder | [`118-query-optimization.md`](./content/06-laravel/118-query-optimization.md) | ✅ Written |
| 119 | Migrations, Schema & Seeders | [`119-migrations.md`](./content/06-laravel/119-migrations.md) | ✅ Written |
| 120 | Database Transactions & Concurrency | [`120-transactions.md`](./content/06-laravel/120-transactions.md) | ✅ Written |
| 121 | Validation & Form Requests | [`121-validation.md`](./content/06-laravel/121-validation.md) | ✅ Written |

### Milestone M16 — Auth, Queues & Async
| # | Lesson | File | Status |
|---|--------|------|--------|
| 122 | Authentication | [`122-authentication.md`](./content/06-laravel/122-authentication.md) | ✅ Written |
| 123 | Authorization | [`123-authorization.md`](./content/06-laravel/123-authorization.md) | ✅ Written |
| 124 | Queues & Jobs | [`124-queues.md`](./content/06-laravel/124-queues.md) | ✅ Written |
| 125 | Events, Listeners & Observers | [`125-events-observers.md`](./content/06-laravel/125-events-observers.md) | ✅ Written |
| 126 | Notifications, Mail & Scheduling | [`126-notifications-mail.md`](./content/06-laravel/126-notifications-mail.md) | ✅ Written |
| 127 | Caching & Redis | [`127-caching-redis.md`](./content/06-laravel/127-caching-redis.md) | ✅ Written |
| 128 | Rate Limiting & Security | [`128-security.md`](./content/06-laravel/128-security.md) | ✅ Written |
| 129 | Testing, Factories & Mocking | [`129-testing.md`](./content/06-laravel/129-testing.md) | ✅ Written |

### Milestone M17 — Senior & Full-Stack
| # | Lesson | File | Status |
|---|--------|------|--------|
| 130 | Service Layer, Repositories & SOLID | [`130-solid-patterns.md`](./content/06-laravel/130-solid-patterns.md) | ✅ Written |
| 131 | Laravel Performance & Deployment | [`131-performance-deployment.md`](./content/06-laravel/131-performance-deployment.md) | ✅ Written |
| 132 | Laravel + React / Inertia | [`132-inertia.md`](./content/06-laravel/132-inertia.md) | ✅ Written |
| 133 | Laravel API + Next.js & Payments | [`133-api-nextjs-stripe.md`](./content/06-laravel/133-api-nextjs-stripe.md) | ✅ Written |
| 134 | Multi-Tenancy & System Design | [`134-multitenancy.md`](./content/06-laravel/134-multitenancy.md) | ✅ Written |

---

**All 134 lessons are written.** Work through them in order, mark them off in
[`PROGRESS.md`](./PROGRESS.md), and claim each milestone when you can meet its
"claim it when" criterion. The final frontend lesson, the [Mock Interview
Playbook](./content/05-interview-prep/104-mock-interviews.md), tells you how to rehearse the whole
thing — and the final Laravel lesson, [Multi-Tenancy & System Design](./content/06-laravel/134-multitenancy.md),
closes the backend half.
