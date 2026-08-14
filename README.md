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
| M18 | **AI & LLM Foundations** | 7 (L135–L157) | You can classify any model, budget tokens, and pick a provider with a decision rule |
| M19 | **AI Application Engineering** | 8 (L158–L173) | You can build a streaming, tool-calling AI app with the Vercel AI SDK |
| M20 | **RAG / Knowledge Systems** | 9 (L174–L197) | You can design an ingestion → retrieval → synthesis pipeline and evaluate it |
| M21 | **AI Agents** | 10 (L198–L216) | You can build a guarded, observable agent loop with tools + HITL |
| M22 | **AI Automation** | 11 (L217–L232) | You can turn a business process into an event-driven AI workflow |
| M23 | **Backend & Distributed** | 12 (L233–L260) | You can design the async, fault-tolerant backend of an AI SaaS |
| M24 | **Cloud & AWS for AI** | 13 (L261–L287) | You can deploy a Bedrock + Lambda + pgvector AI stack with cost controls |
| M25 | **Docker / DevOps** | 14 (L288–L307) | You can ship an AI service through CI/CD with rollbacks |
| M26 | **AI Security** | 15 (L308–L327) | You can threat-model an LLM app and close the OWASP LLM Top 10 |
| M27 | **Observability & Evaluation** | 16 (L328–L346) | You can detect regressions and ground an eval dataset in CI |
| M28 | **AI System Design** | 17 (L347–L358) | You can run any AI system-design prompt through the 4-phase spine |
| M29 | **Enterprise AI Architecture** | 18 (L359–L380) | You can take a business requirement to an ADR + costed architecture |
| M30 | **Capstone Projects** | 19 (L381–L386) | Six production-grade projects + a complete architecture case study |

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
> Folder: [`06-laravel/`](./content/06-laravel/) · [Module overview](./content/06-laravel/00-module-overview.md) · [Master checklist](./content/06-laravel/laravel-interview-master-checklist.md) · [Topics breakdown](./content/06-laravel/topics-breakdown.md) · [75 topic files](./content/06-laravel/topics/) · [Topic pages](/topics)

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

## Module 7 — AI & LLM Foundations
> Folder: [`07-ai-foundations/`](./content/07-ai-foundations/) · [Module overview](./content/07-ai-foundations/00-module-overview.md)

### Milestone M18 — AI & LLM Foundations
| # | Lesson | File | Status |
|---|--------|------|--------|
| 135 | What an LLM Is | [`135-what-is-an-llm.md`](./content/07-ai-foundations/135-what-is-an-llm.md) | ✅ Written |
| 136 | The Transformer & Attention Mechanism | [`136-transformer-attention.md`](./content/07-ai-foundations/136-transformer-attention.md) | ✅ Written |
| 137 | Tokens & Tokenization | [`137-tokens-tokenization.md`](./content/07-ai-foundations/137-tokens-tokenization.md) | ✅ Written |
| 138 | Context Windows & Input Limits | [`138-context-windows.md`](./content/07-ai-foundations/138-context-windows.md) | ✅ Written |
| 139 | Temperature, Top-p & Sampling | [`139-temperature-top-p.md`](./content/07-ai-foundations/139-temperature-top-p.md) | ✅ Written |
| 140 | Model Capabilities | [`140-model-capabilities.md`](./content/07-ai-foundations/140-model-capabilities.md) | ✅ Written |
| 141 | Model Limitations | [`141-model-limitations.md`](./content/07-ai-foundations/141-model-limitations.md) | ✅ Written |
| 142 | Prompt Engineering & System/User/Developer Instructions | [`142-prompt-engineering.md`](./content/07-ai-foundations/142-prompt-engineering.md) | ✅ Written |
| 143 | Structured Outputs & JSON Schemas | [`143-structured-outputs.md`](./content/07-ai-foundations/143-structured-outputs.md) | ✅ Written |
| 144 | Function Calling & Tool Calling | [`144-function-calling.md`](./content/07-ai-foundations/144-function-calling.md) | ✅ Written |
| 145 | Streaming Responses | [`145-streaming.md`](./content/07-ai-foundations/145-streaming.md) | ✅ Written |
| 146 | Multimodal Models | [`146-multimodal.md`](./content/07-ai-foundations/146-multimodal.md) | ✅ Written |
| 147 | Embeddings & Vector Semantics | [`147-embeddings.md`](./content/07-ai-foundations/147-embeddings.md) | ✅ Written |
| 148 | Model Selection & Frontier Families | [`148-model-selection.md`](./content/07-ai-foundations/148-model-selection.md) | ✅ Written |
| 149 | Token Management & Budgeting | [`149-token-budgeting.md`](./content/07-ai-foundations/149-token-budgeting.md) | ✅ Written |
| 150 | Cost Optimization | [`150-cost-optimization.md`](./content/07-ai-foundations/150-cost-optimization.md) | ✅ Written |
| 151 | Latency Optimization | [`151-latency-optimization.md`](./content/07-ai-foundations/151-latency-optimization.md) | ✅ Written |
| 152 | The OpenAI API | [`152-openai-api.md`](./content/07-ai-foundations/152-openai-api.md) | ✅ Written |
| 153 | The Anthropic API | [`153-anthropic-api.md`](./content/07-ai-foundations/153-anthropic-api.md) | ✅ Written |
| 154 | The Google Gemini API | [`154-gemini-api.md`](./content/07-ai-foundations/154-gemini-api.md) | ✅ Written |
| 155 | Provider Abstraction & Model Routing | [`155-provider-abstraction.md`](./content/07-ai-foundations/155-provider-abstraction.md) | ✅ Written |
| 156 | Comparing the Three Providers | [`156-provider-comparison.md`](./content/07-ai-foundations/156-provider-comparison.md) | ✅ Written |
| 157 | Foundations Review — the Model Decision Rule | [`157-model-decision-rule.md`](./content/07-ai-foundations/157-model-decision-rule.md) | ✅ Written |

## Module 8 — AI Application Engineering
> Folder: [`08-ai-app-engineering/`](./content/08-ai-app-engineering/) · [Module overview](./content/08-ai-app-engineering/00-module-overview.md)

### Milestone M19 — AI Application Engineering
| # | Lesson | File | Status |
|---|--------|------|--------|
| 158 | AI Application Architecture | [`158-ai-app-architecture.md`](./content/08-ai-app-engineering/158-ai-app-architecture.md) | ✅ Written |
| 159 | LLM API Integration Patterns | [`159-llm-integration.md`](./content/08-ai-app-engineering/159-llm-integration.md) | ✅ Written |
| 160 | The Vercel AI SDK | [`160-vercel-ai-sdk.md`](./content/08-ai-app-engineering/160-vercel-ai-sdk.md) | ✅ Written |
| 161 | AI SDK Patterns (streams, parts, tool calls) | [`161-ai-sdk-patterns.md`](./content/08-ai-app-engineering/161-ai-sdk-patterns.md) | ✅ Written |
| 162 | Streaming UI | [`162-streaming-ui.md`](./content/08-ai-app-engineering/162-streaming-ui.md) | ✅ Written |
| 163 | Structured Generation in Apps | [`163-structured-generation.md`](./content/08-ai-app-engineering/163-structured-generation.md) | ✅ Written |
| 164 | Tool Calling in Applications | [`164-tool-calling-apps.md`](./content/08-ai-app-engineering/164-tool-calling-apps.md) | ✅ Written |
| 165 | AI Application State | [`165-ai-app-state.md`](./content/08-ai-app-engineering/165-ai-app-state.md) | ✅ Written |
| 166 | Conversation Management | [`166-conversation-management.md`](./content/08-ai-app-engineering/166-conversation-management.md) | ✅ Written |
| 167 | AI Memory | [`167-ai-memory.md`](./content/08-ai-app-engineering/167-ai-memory.md) | ✅ Written |
| 168 | Error Handling for LLM Calls | [`168-llm-error-handling.md`](./content/08-ai-app-engineering/168-llm-error-handling.md) | ✅ Written |
| 169 | Retry Strategies & Backoff | [`169-retry-backoff.md`](./content/08-ai-app-engineering/169-retry-backoff.md) | ✅ Written |
| 170 | Rate Limiting | [`170-rate-limiting.md`](./content/08-ai-app-engineering/170-rate-limiting.md) | ✅ Written |
| 171 | Caching LLM Responses | [`171-caching.md`](./content/08-ai-app-engineering/171-caching.md) | ✅ Written |
| 172 | AI API Security Fundamentals | [`172-ai-api-security.md`](./content/08-ai-app-engineering/172-ai-api-security.md) | ✅ Written |
| 173 | Production AI Patterns (synthesis) | [`173-production-ai-patterns.md`](./content/08-ai-app-engineering/173-production-ai-patterns.md) | ✅ Written |

## Module 9 — RAG / Knowledge Systems
> Folder: [`09-rag-knowledge/`](./content/09-rag-knowledge/) · [Module overview](./content/09-rag-knowledge/00-module-overview.md)

### Milestone M20 — RAG / Knowledge Systems
| # | Lesson | File | Status |
|---|--------|------|--------|
| 174 | RAG Fundamentals | [`174-rag-fundamentals.md`](./content/09-rag-knowledge/174-rag-fundamentals.md) | ✅ Written |
| 175 | RAG Architecture | [`175-rag-architecture.md`](./content/09-rag-knowledge/175-rag-architecture.md) | ✅ Written |
| 176 | Document Ingestion Pipelines | [`176-document-ingestion.md`](./content/09-rag-knowledge/176-document-ingestion.md) | ✅ Written |
| 177 | PDF Processing & Text Extraction | [`177-pdf-processing.md`](./content/09-rag-knowledge/177-pdf-processing.md) | ✅ Written |
| 178 | Chunking Fundamentals | [`178-chunking.md`](./content/09-rag-knowledge/178-chunking.md) | ✅ Written |
| 179 | Chunking Strategies | [`179-chunking-strategies.md`](./content/09-rag-knowledge/179-chunking-strategies.md) | ✅ Written |
| 180 | Metadata for Retrieval | [`180-metadata.md`](./content/09-rag-knowledge/180-metadata.md) | ✅ Written |
| 181 | Embeddings for RAG | [`181-embeddings-rag.md`](./content/09-rag-knowledge/181-embeddings-rag.md) | ✅ Written |
| 182 | Vector Databases | [`182-vector-databases.md`](./content/09-rag-knowledge/182-vector-databases.md) | ✅ Written |
| 183 | PostgreSQL + pgvector | [`183-pgvector.md`](./content/09-rag-knowledge/183-pgvector.md) | ✅ Written |
| 184 | Pinecone | [`184-pinecone.md`](./content/09-rag-knowledge/184-pinecone.md) | ✅ Written |
| 185 | Qdrant | [`185-qdrant.md`](./content/09-rag-knowledge/185-qdrant.md) | ✅ Written |
| 186 | Vector Database Selection | [`186-vector-db-selection.md`](./content/09-rag-knowledge/186-vector-db-selection.md) | ✅ Written |
| 187 | Hybrid Search | [`187-hybrid-search.md`](./content/09-rag-knowledge/187-hybrid-search.md) | ✅ Written |
| 188 | Keyword vs Semantic Search | [`188-keyword-vs-semantic.md`](./content/09-rag-knowledge/188-keyword-vs-semantic.md) | ✅ Written |
| 189 | Retrieval (top-k, filters, scoring) | [`189-retrieval.md`](./content/09-rag-knowledge/189-retrieval.md) | ✅ Written |
| 190 | Reranking | [`190-reranking.md`](./content/09-rag-knowledge/190-reranking.md) | ✅ Written |
| 191 | Context Construction | [`191-context-construction.md`](./content/09-rag-knowledge/191-context-construction.md) | ✅ Written |
| 192 | Citations & Source Attribution | [`192-citations.md`](./content/09-rag-knowledge/192-citations.md) | ✅ Written |
| 193 | Query Rewriting | [`193-query-rewriting.md`](./content/09-rag-knowledge/193-query-rewriting.md) | ✅ Written |
| 194 | Contextual Retrieval | [`194-contextual-retrieval.md`](./content/09-rag-knowledge/194-contextual-retrieval.md) | ✅ Written |
| 195 | RAG Evaluation | [`195-rag-evaluation.md`](./content/09-rag-knowledge/195-rag-evaluation.md) | ✅ Written |
| 196 | RAG Failure Modes | [`196-rag-failure-modes.md`](./content/09-rag-knowledge/196-rag-failure-modes.md) | ✅ Written |
| 197 | Production RAG Architecture (synthesis) | [`197-production-rag.md`](./content/09-rag-knowledge/197-production-rag.md) | ✅ Written |

## Module 10 — AI Agents
> Folder: [`10-ai-agents/`](./content/10-ai-agents/) · [Module overview](./content/10-ai-agents/00-module-overview.md)

### Milestone M21 — AI Agents
| # | Lesson | File | Status |
|---|--------|------|--------|
| 198 | What Agents Are | [`198-what-agents-are.md`](./content/10-ai-agents/198-what-agents-are.md) | ✅ Written |
| 199 | Agent vs Workflow | [`199-agent-vs-workflow.md`](./content/10-ai-agents/199-agent-vs-workflow.md) | ✅ Written |
| 200 | Agent Architecture (the loop) | [`200-agent-architecture.md`](./content/10-ai-agents/200-agent-architecture.md) | ✅ Written |
| 201 | Tool Calling for Agents | [`201-agent-tools.md`](./content/10-ai-agents/201-agent-tools.md) | ✅ Written |
| 202 | Planning (ReAct, plan-and-execute) | [`202-planning.md`](./content/10-ai-agents/202-planning.md) | ✅ Written |
| 203 | Reasoning Patterns | [`203-reasoning-patterns.md`](./content/10-ai-agents/203-reasoning-patterns.md) | ✅ Written |
| 204 | Tool Selection & Routing | [`204-tool-selection.md`](./content/10-ai-agents/204-tool-selection.md) | ✅ Written |
| 205 | Agent Loops & Termination | [`205-agent-loops.md`](./content/10-ai-agents/205-agent-loops.md) | ✅ Written |
| 206 | Agent Memory | [`206-agent-memory.md`](./content/10-ai-agents/206-agent-memory.md) | ✅ Written |
| 207 | Agent State & Persistence | [`207-agent-state.md`](./content/10-ai-agents/207-agent-state.md) | ✅ Written |
| 208 | Human-in-the-Loop | [`208-human-in-the-loop.md`](./content/10-ai-agents/208-human-in-the-loop.md) | ✅ Written |
| 209 | Guardrails for Agents | [`209-guardrails.md`](./content/10-ai-agents/209-guardrails.md) | ✅ Written |
| 210 | Multi-Agent Systems | [`210-multi-agent.md`](./content/10-ai-agents/210-multi-agent.md) | ✅ Written |
| 211 | Agent Failure Modes | [`211-agent-failure-modes.md`](./content/10-ai-agents/211-agent-failure-modes.md) | ✅ Written |
| 212 | Agent Security | [`212-agent-security.md`](./content/10-ai-agents/212-agent-security.md) | ✅ Written |
| 213 | Agent Observability | [`213-agent-observability.md`](./content/10-ai-agents/213-agent-observability.md) | ✅ Written |
| 214 | LangChain | [`214-langchain.md`](./content/10-ai-agents/214-langchain.md) | ✅ Written |
| 215 | LangGraph | [`215-langgraph.md`](./content/10-ai-agents/215-langgraph.md) | ✅ Written |
| 216 | MCP & Production Agent Architecture (synthesis) | [`216-mcp-agent-architecture.md`](./content/10-ai-agents/216-mcp-agent-architecture.md) | ✅ Written |

## Module 11 — AI Automation
> Folder: [`11-ai-automation/`](./content/11-ai-automation/) · [Module overview](./content/11-ai-automation/00-module-overview.md)

### Milestone M22 — AI Automation
| # | Lesson | File | Status |
|---|--------|------|--------|
| 217 | AI Workflows | [`217-ai-workflows.md`](./content/11-ai-automation/217-ai-workflows.md) | ✅ Written |
| 218 | n8n | [`218-n8n.md`](./content/11-ai-automation/218-n8n.md) | ✅ Written |
| 219 | Make | [`219-make.md`](./content/11-ai-automation/219-make.md) | ✅ Written |
| 220 | Webhooks & Event-Driven Automation | [`220-webhooks.md`](./content/11-ai-automation/220-webhooks.md) | ✅ Written |
| 221 | Scheduled Jobs & Cron for AI | [`221-scheduled-jobs.md`](./content/11-ai-automation/221-scheduled-jobs.md) | ✅ Written |
| 222 | Queues & Background Workers for AI | [`222-queues-workers.md`](./content/11-ai-automation/222-queues-workers.md) | ✅ Written |
| 223 | AI + CRM | [`223-ai-crm.md`](./content/11-ai-automation/223-ai-crm.md) | ✅ Written |
| 224 | AI + Email | [`224-ai-email.md`](./content/11-ai-automation/224-ai-email.md) | ✅ Written |
| 225 | AI + Slack / Messaging | [`225-ai-slack.md`](./content/11-ai-automation/225-ai-slack.md) | ✅ Written |
| 226 | AI + Databases | [`226-ai-databases.md`](./content/11-ai-automation/226-ai-databases.md) | ✅ Written |
| 227 | AI + External APIs | [`227-ai-external-apis.md`](./content/11-ai-automation/227-ai-external-apis.md) | ✅ Written |
| 228 | Human Approval Workflows | [`228-approval-workflows.md`](./content/11-ai-automation/228-approval-workflows.md) | ✅ Written |
| 229 | Business Process Automation | [`229-business-process.md`](./content/11-ai-automation/229-business-process.md) | 📝 Queued |
| 230 | AI Automation Architecture | [`230-automation-architecture.md`](./content/11-ai-automation/230-automation-architecture.md) | 📝 Queued |
| 231 | Multi-Agent Automation | [`231-multi-agent-automation.md`](./content/11-ai-automation/231-multi-agent-automation.md) | 📝 Queued |
| 232 | Automation Failure & Recovery | [`232-automation-recovery.md`](./content/11-ai-automation/232-automation-recovery.md) | 📝 Queued |

---

**All 134 original lessons are written.** The AI Solutions Architect half (Modules 7–19, L135–L386)
is scaffolded in the curriculum and tracked in [`PROGRESS.md`](./PROGRESS.md); its lessons are being
written milestone by milestone — see the [AI Solutions Architect Curriculum Plan](./docs/ai-solutions-architect-curriculum.md).
The original roadmap closes with the [Mock Interview Playbook](./content/05-interview-prep/104-mock-interviews.md)
and [Multi-Tenancy & System Design](./content/06-laravel/134-multitenancy.md).

