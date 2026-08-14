/**
 * The curriculum, as data.
 *
 * Every lesson is a node in a knowledge graph: it has prerequisites, a
 * difficulty, an interview-frequency score and a reason to care. The graph
 * view, the dashboard stats and the "why this matters" panels are all
 * projections of this one table — nothing is duplicated.
 *
 * Tuple format keeps 386 rows readable:
 *   [n, title, file, difficulty(1-5), interviewFrequency(0-100), prereqs[], why?]
 */

export type LessonRef = {
  n: number;
  title: string;
  file: string;
  /** 1 = gentle, 5 = genuinely hard */
  difficulty: number;
  /** How often this comes up in real frontend interviews, 0–100 */
  frequency: number;
  /** Lesson numbers you should understand first — the graph edges */
  prereqs: number[];
  /** One line: why a working engineer cares */
  why: string;
};

type Row = [number, string, string, number, number, number[], string?];

const DEFAULT_WHY = 'Foundational — later lessons build directly on this.';

function rows(list: Row[]): LessonRef[] {
  return list.map(([n, title, file, difficulty, frequency, prereqs, why]) => ({
    n,
    title,
    file,
    difficulty,
    frequency,
    prereqs,
    why: why ?? DEFAULT_WHY,
  }));
}

/* ------------------------------------------------------------------ */
/* Module 1 — JavaScript                                               */
/* ------------------------------------------------------------------ */

const js = rows([
  [1, 'Variables: var, let, const', '01-variables', 1, 78, [],
    'The `var` loop bug and the React stale-closure bug are the same bug. This is where you learn to see it.'],
  [2, 'Scope & the Scope Chain', '02-scope', 2, 72, [1],
    'Every "why is this undefined" question resolves to a scope-chain lookup.'],
  [3, 'Hoisting', '03-hoisting', 2, 81, [1, 2],
    'Asked by name in most junior and mid-level screens.'],
  [4, 'Temporal Dead Zone', '04-temporal-dead-zone', 2, 54, [1, 3],
    'The follow-up question when you answer hoisting well.'],
  [5, 'Closures', '05-closures', 3, 95, [2, 3],
    'The single most-asked JavaScript concept. Also the engine behind hooks.'],
  [6, 'Primitive vs Reference Types', '06-primitive-vs-reference', 2, 84, [1],
    'Explains why your useEffect fires every render and why state updates get missed.'],
  [7, 'Coercion, Truthy/Falsy & Equality', '07-coercion-and-equality', 2, 76, [6],
    '`==` vs `===` is a guaranteed question. The interesting part is `0 == ""`.'],
  [8, 'Objects', '08-objects', 2, 70, [6],
    'Everything in JavaScript that is not a primitive is this.'],
  [9, 'Prototypes & Inheritance', '09-prototypes', 4, 68, [8],
    '"Explain prototypal inheritance" separates people who memorised from people who understand.'],
  [10, '`this` and Binding', '10-this-and-binding', 4, 79, [8, 9],
    'Four binding rules. Knowing all four calmly is a strong senior signal.'],
  [11, 'Functions: Declarations vs Expressions', '11-functions', 1, 58, [3],
    'Hoisting behaves differently for each — a classic trick question.'],
  [12, 'Arrow Functions', '12-arrow-functions', 2, 74, [10, 11],
    'Lexical `this` is the reason arrow functions exist. Say that, not "shorter syntax".'],
  [13, 'Higher-Order Functions & Callbacks', '13-higher-order-functions', 2, 71, [11],
    'The mental model underneath every array method and every React prop callback.'],
  [14, 'Pure Functions & Side Effects', '14-pure-functions', 2, 66, [13],
    'React is built on this idea. Reducers, selectors and render functions must all be pure.'],
  [15, 'IIFE & the Module Pattern', '15-iife', 2, 42, [5, 11],
    'How JavaScript did encapsulation before modules — still appears in legacy code.'],
  [16, 'Currying & Partial Application', '16-currying', 3, 61, [5, 13],
    'A common live-coding task, and the pattern behind `connect()` and middleware.'],
  [17, 'Memoization', '17-memoization', 3, 73, [5, 13],
    'Implement it from scratch, then explain how `useMemo` differs. Frequent pairing.'],
  [18, 'Debounce & Throttle', '18-debounce-throttle', 3, 88, [5, 17],
    'The most-requested "implement this on a whiteboard" function in frontend interviews.'],
  [19, 'Arrays & Array Methods', '19-arrays', 2, 80, [13],
    'Implementing `map`/`filter`/`reduce` yourself is a standard warm-up round.'],
  [20, 'Destructuring, Spread & Rest', '20-destructuring-spread-rest', 1, 64, [6, 8],
    'Shallow-copy semantics here cause a huge share of state-mutation bugs.'],
  [21, 'Call Stack & Execution Contexts', '21-call-stack', 3, 69, [2, 11],
    'You cannot explain the event loop without this. Interviewers ask them together.'],
  [22, 'The Event Loop', '22-event-loop', 4, 93, [21],
    'Top-three most asked JavaScript question at every level.'],
  [23, 'Microtasks vs Macrotasks', '23-microtasks-macrotasks', 4, 77, [22],
    'The output-ordering puzzle. Getting it exactly right is a senior signal.'],
  [24, 'Promises from Scratch', '24-promises', 4, 86, [22, 23],
    'Writing a minimal Promise proves you understand the state machine, not just the API.'],
  [25, 'async / await', '25-async-await', 3, 89, [24],
    'Everyone uses it; few can explain that it is syntax over the same microtask queue.'],
  [26, 'Promise Combinators', '26-promise-combinators', 3, 74, [24, 25],
    '`all` vs `allSettled` vs `race` vs `any` — a fast way to check real experience.'],
  [27, 'Error Handling & Propagation', '27-error-handling', 3, 67, [25],
    'How errors cross async boundaries. Directly relevant to error boundaries later.'],
  [28, 'Modern ES6+ Essentials', '28-modern-es6plus', 2, 59, [8, 20],
    'Modules, optional chaining, generators — the vocabulary of every modern codebase.'],
]);

/* ------------------------------------------------------------------ */
/* Module 2 — TypeScript                                               */
/* ------------------------------------------------------------------ */

const ts = rows([
  [29, 'Why TypeScript?', '29-why-typescript', 1, 62, [28],
    'The answer is not "fewer bugs". It is a faster feedback loop and safer refactors.'],
  [30, 'Primitives, Arrays & Tuples', '30-primitives-arrays-tuples', 1, 48, [29], DEFAULT_WHY],
  [31, 'Objects, Interfaces & Type Aliases', '31-objects-interfaces-aliases', 2, 85, [30],
    '"Interface vs type" is asked in essentially every TypeScript interview.'],
  [32, 'Union & Intersection Types', '32-unions-intersections', 2, 74, [31],
    'Modelling "one of these shapes" correctly is most of day-to-day TypeScript.'],
  [33, 'Narrowing & Type Guards', '33-narrowing-type-guards', 3, 78, [32],
    'How you turn an unknown API response into something safe to use.'],
  [34, 'Functions & Overloads', '34-functions-overloads', 3, 52, [31], DEFAULT_WHY],
  [35, 'keyof, typeof & Indexed Access', '35-keyof-typeof-indexed', 3, 66, [31],
    'The three operators every advanced type is built from.'],
  [36, 'Generics', '36-generics', 3, 91, [34, 35],
    'Second-most asked TypeScript topic. Expect to write a generic function live.'],
  [37, 'Generic Constraints', '37-generic-constraints', 4, 72, [36],
    '`extends` inside a generic — where most people stall.'],
  [38, 'Discriminated Unions', '38-discriminated-unions', 3, 80, [32, 33],
    'The single most useful pattern in application TypeScript. Loading/error/success states.'],
  [39, 'Utility Types', '39-utility-types', 2, 87, [36],
    'Partial, Pick, Omit, Record, ReturnType — expect to be asked to reimplement one.'],
  [40, 'Conditional Types', '40-conditional-types', 5, 63, [37, 39],
    'Where TypeScript becomes a programming language in its own right.'],
  [41, 'Mapped Types', '41-mapped-types', 4, 65, [39, 40],
    'How Partial and Readonly are actually implemented.'],
  [42, 'Template Literal Types', '42-template-literal-types', 4, 44, [40],
    'Type-safe event names and route strings. Shows genuine depth.'],
  [43, 'infer', '43-infer', 5, 58, [40],
    'Reimplementing ReturnType with `infer` is a strong senior demonstration.'],
  [44, 'satisfies & as const', '44-satisfies-as-const', 3, 55, [39],
    'Modern TypeScript that many candidates have not caught up with yet.'],
  [45, 'unknown vs any vs never', '45-unknown-any-never', 3, 82, [33],
    'A direct, frequently-asked question with a crisp correct answer.'],
  [46, 'tsconfig & Strict Mode', '46-tsconfig-strict', 2, 51, [29],
    'What `strictNullChecks` actually turns on, and why teams stage the migration.'],
]);

/* ------------------------------------------------------------------ */
/* Module 3 — React                                                    */
/* ------------------------------------------------------------------ */

const react = rows([
  [47, 'JSX', '47-jsx', 1, 60, [12, 28],
    'JSX is a function call. Knowing what it compiles to explains the rules around it.'],
  [48, 'Components & Composition', '48-components-composition', 1, 68, [47],
    'Composition over configuration is the answer to most "how would you build" questions.'],
  [49, 'Props', '49-props', 1, 64, [48], DEFAULT_WHY],
  [50, 'State & useState', '50-state-usestate', 2, 88, [49],
    'Why state updates are asynchronous and batched — asked constantly.'],
  [51, 'Rendering & Reconciliation', '51-rendering-reconciliation', 4, 90, [50],
    '"What happens when state changes?" Answer this well and the level goes up.'],
  [52, 'Lists & Keys', '52-lists-and-keys', 2, 92, [51],
    '"Why are keys important?" is close to a guaranteed question. Index keys are the trap.'],
  [53, 'Events & Synthetic Events', '53-events', 2, 61, [51], DEFAULT_WHY],
  [54, 'Controlled vs Uncontrolled Forms', '54-forms', 2, 83, [50, 53],
    'Named directly in most React interviews, and in every real product.'],
  [55, 'Derived State & Lifting State', '55-derived-and-lifted-state', 3, 71, [50],
    'Most "state is out of sync" bugs are state that should have been derived.'],
  [56, 'The Virtual DOM', '56-virtual-dom', 3, 89, [51],
    'Classic question. The good answer includes why it is not automatically "fast".'],
  [57, 'useEffect', '57-useeffect', 3, 96, [50, 5],
    'The most misunderstood hook and the most asked. It is not a lifecycle method.'],
  [58, 'Dependency Arrays & Cleanup', '58-deps-and-cleanup', 4, 87, [57, 6],
    'Reference equality meets hooks. This is where Lesson 6 pays off.'],
  [59, 'Lifecycle & Effect Order', '59-lifecycle', 3, 70, [58], DEFAULT_WHY],
  [60, 'useRef', '60-useref', 2, 78, [57],
    'Mutable value that survives renders without causing one. Two distinct use cases.'],
  [61, 'useMemo', '61-usememo', 3, 85, [58, 17],
    'Half of "difference between useMemo and useCallback" — a top-five React question.'],
  [62, 'useCallback', '62-usecallback', 3, 85, [61, 5],
    'The other half. The honest answer includes "usually you should not".'],
  [63, 'useContext', '63-usecontext', 3, 80, [57],
    'And crucially: why context is not a state manager and re-renders everything.'],
  [64, 'useReducer', '64-usereducer', 3, 69, [63, 14],
    'When state transitions get complex enough that useState becomes a liability.'],
  [65, 'Custom Hooks', '65-custom-hooks', 3, 86, [57, 60],
    'Expect to write one live. This is the main React composition primitive.'],
  [66, 'Rules of Hooks (Internals)', '66-rules-of-hooks', 4, 74, [65],
    '"Why can\'t hooks go in conditionals?" Because hooks are a linked list indexed by call order.'],
  [67, 'React.memo', '67-react-memo', 3, 82, [51, 62],
    'Shallow prop comparison. And when it makes things measurably slower.'],
  [68, 'Lazy Loading & Suspense', '68-lazy-suspense', 3, 72, [48], DEFAULT_WHY],
  [69, 'Code Splitting', '69-code-splitting', 3, 68, [68], DEFAULT_WHY],
  [70, 'Virtualization', '70-virtualization', 4, 64, [51],
    'The correct answer to "how do you render 100,000 rows".'],
  [71, 'When NOT to Optimize', '71-when-not-to-optimize', 3, 58, [67, 61],
    'Saying this unprompted marks you as senior more than any optimisation trick.'],
  [72, 'Compound Components', '72-compound-components', 4, 66, [63, 48],
    'How real component libraries are designed. Great system-design answer.'],
  [73, 'Render Props', '73-render-props', 3, 55, [49, 13], DEFAULT_WHY],
  [74, 'Higher-Order Components', '74-hocs', 3, 57, [73, 13],
    'Largely superseded by hooks — knowing why is the actual question.'],
  [75, 'The Provider Pattern', '75-provider-pattern', 3, 63, [63], DEFAULT_WHY],
  [76, 'Error Boundaries', '76-error-boundaries', 3, 70, [59, 27],
    'Still class-only. A common gap, and a common interview gotcha.'],
  [77, 'Context API', '77-context-api', 3, 79, [63, 75],
    'Local vs global state, and the re-render cost people miss.'],
  [78, 'Redux Toolkit', '78-redux-toolkit', 3, 76, [64, 77],
    'Store, slice, thunk, selector. Still standard at many companies.'],
  [79, 'Async Thunks & Selectors', '79-thunks-selectors', 3, 66, [78], DEFAULT_WHY],
  [80, 'Zustand', '80-zustand', 2, 61, [77],
    'The modern lightweight alternative — expect a comparison question.'],
  [81, 'TanStack Query', '81-tanstack-query', 3, 78, [25, 77],
    'Server state is not client state. Understanding that distinction is a senior marker.'],
  [82, 'Local vs Global vs Server State', '82-state-strategy', 4, 84, [81, 80, 78],
    'The architecture question. Answer it with a decision rule, not a library preference.'],
]);

/* ------------------------------------------------------------------ */
/* Module 4 — Next.js                                                  */
/* ------------------------------------------------------------------ */

const next = rows([
  [83, 'App Router & File Routing', '83-app-router', 2, 84, [48],
    'The baseline expectation for any modern Next.js role.'],
  [84, 'Layouts & Nested Layouts', '84-layouts', 2, 71, [83],
    'Layouts do not re-render on navigation. That single fact drives a lot of design.'],
  [85, 'Dynamic Routes', '85-dynamic-routes', 2, 69, [83], DEFAULT_WHY],
  [86, 'Server Components', '86-server-components', 4, 95, [83],
    'The defining Next.js interview question today. Zero client JS by default.'],
  [87, 'Client Components', '87-client-components', 3, 88, [86],
    '`use client` is a boundary marker, not a file-level toggle. Widely misunderstood.'],
  [88, 'The Server/Client Boundary', '88-server-client-boundary', 4, 81, [86, 87],
    'What can cross it, what cannot, and why your import broke the build.'],
  [89, 'Data Fetching', '89-data-fetching', 3, 86, [86, 25],
    'Fetching in a Server Component versus a client hook — when and why.'],
  [90, 'Caching', '90-caching', 5, 90, [89],
    'The hardest part of Next.js and a favourite senior question.'],
  [91, 'Revalidation, ISR, SSR & SSG', '91-revalidation-isr-ssr-ssg', 4, 93, [90],
    '"SSR vs SSG vs ISR" is asked almost every time. Know the trade-offs, not the acronyms.'],
  [92, 'Route Handlers', '92-route-handlers', 2, 72, [89], DEFAULT_WHY],
  [93, 'Server Actions', '93-server-actions', 4, 87, [88, 92],
    'Mutations without an API route. New enough that a solid answer stands out.'],
  [94, 'Middleware', '94-middleware', 3, 76, [83],
    'Auth gating, redirects, A/B tests. Expect "give me three use cases".'],
  [95, 'Cookies, Headers & Metadata', '95-cookies-headers-metadata', 2, 68, [94], DEFAULT_WHY],
  [96, 'Env Vars, Build & Deployment', '96-deployment', 2, 64, [91],
    'What `NEXT_PUBLIC_` really means, and why a secret leaked into the bundle.'],
]);

/* ------------------------------------------------------------------ */
/* Module 5 — Interview Preparation                                    */
/* ------------------------------------------------------------------ */

const prep = rows([
  [97, 'Top JavaScript Interview Questions', '97-js-questions', 3, 100, [22, 5, 10],
    'Rehearsal. Knowing the answer and saying it under pressure are different skills.'],
  [98, 'Top TypeScript Interview Questions', '98-ts-questions', 3, 100, [36, 39, 45], 'Rehearsal.'],
  [99, 'Top React Interview Questions', '99-react-questions', 3, 100, [57, 52, 56], 'Rehearsal.'],
  [100, 'Top Next.js Interview Questions', '100-nextjs-questions', 3, 100, [86, 91, 90], 'Rehearsal.'],
  [101, 'Common Coding Tasks', '101-coding-tasks', 4, 94, [18, 65, 54],
    'Debounced search, infinite scroll, modal, tabs, toast. Build each one once.'],
  [102, 'Frontend System Design', '102-system-design', 5, 85, [82, 90, 76],
    'The round that decides mid versus senior.'],
  [103, 'Portfolio Projects', '103-portfolio-projects', 4, 70, [101, 102],
    'Three production-quality projects beat twenty tutorials.'],
  [104, 'Mock Interview Playbook', '104-mock-interviews', 3, 88, [97, 98, 99, 100],
    'Think aloud, optimise second, discuss trade-offs. Practised, not improvised.'],
]);

/* ------------------------------------------------------------------ */
/* Module 6 — Laravel                                                   */
/* ------------------------------------------------------------------ */

const laravel = rows([
  [105, 'What is Laravel?', '105-what-is-laravel', 1, 70, [28],
    'MVC, the container, and why the framework exists — the orientation answer that frames everything else.'],
  [106, 'Request Lifecycle', '106-request-lifecycle', 3, 85, [105],
    'public/index.php to a response — the single most-asked Laravel question, and the map for every other topic.'],
  [107, 'Application Structure & Bootstrapping', '107-app-structure', 2, 62, [106],
    'bootstrap/app.php, service providers, and where each kind of code lives in a Laravel app.'],
  [108, 'The Service Container & Dependency Injection', '108-service-container', 4, 92, [106],
    'The IoC container is the heart of Laravel. Senior interviews probe this directly.'],
  [109, 'Service Providers', '109-service-providers', 3, 78, [107, 108],
    'register() vs boot() — the lifecycle that wires the whole framework together.'],
  [110, 'Facades & Contracts', '110-facades-contracts', 3, 74, [108],
    'Are facades static? What are contracts? Both are container lookups wearing different clothes.'],
  [111, 'Routing', '111-routing', 2, 88, [106, 108],
    'Routes, parameters, model binding, groups, resource routes — the map from URL to controller.'],
  [112, 'Middleware', '112-middleware', 3, 84, [106, 111],
    'The onion layers around your routes: auth, throttling, CORS — and what $next($request) really does.'],
  [113, 'Controllers, Requests & Responses', '113-controllers', 2, 80, [111, 112],
    'Thin controllers, form requests, and why business logic never belongs here.'],
  [114, 'Blade', '114-blade', 2, 76, [105],
    'Templates, components, slots, and the escaping rule that keeps XSS out.'],
  [115, 'Eloquent ORM', '115-eloquent', 3, 90, [106, 108],
    'Models, fillable/guarded, casts, accessors, scopes — the largest Laravel interview topic.'],
  [116, 'Eloquent Relationships', '116-eloquent-relationships', 4, 88, [115],
    'One-to-one through polymorphic: which relation for which shape, and how each maps to SQL.'],
  [117, 'Eager Loading & the N+1 Problem', '117-n1-problem', 4, 95, [115, 116],
    'The most-asked Laravel performance question — why User::all() with a loop is O(N+1) queries.'],
  [118, 'Query Optimization & the Query Builder', '118-query-optimization', 3, 86, [117],
    'whereHas, withCount, chunk, cursors, indexes, EXPLAIN — turning a slow endpoint into a fast one.'],
  [119, 'Migrations, Schema & Seeders', '119-migrations', 2, 82, [115],
    'Schema building, indexes, factories, seeders, and the migrate command family.'],
  [120, 'Database Transactions & Concurrency', '120-transactions', 4, 89, [118, 119],
    'Atomicity, locking, overselling, and the two-users-buy-the-last-item scenario.'],
  [121, 'Validation & Form Requests', '121-validation', 3, 83, [113],
    'Rules, custom rules, authorize(), and validation inside Form Requests.'],
  [122, 'Authentication', '122-authentication', 3, 87, [112, 113],
    'Guards, sessions, Sanctum vs Passport vs Fortify — who are you?'],
  [123, 'Authorization', '123-authorization', 3, 81, [122],
    'Gates, policies, roles and permissions — what are you allowed to do?'],
  [124, 'Queues & Jobs', '124-queues', 4, 93, [108, 122],
    'Why you never send email in a request: workers, retries, backoff, failures.'],
  [125, 'Events, Listeners & Observers', '125-events-observers', 3, 79, [115, 124],
    'Decoupling with events, and model-lifecycle observers — and when each fits.'],
  [126, 'Notifications, Mail & Scheduling', '126-notifications-mail', 2, 68, [124, 125],
    'Notification channels, mailables, and the scheduler standing in for cron.'],
  [127, 'Caching & Redis', '127-caching-redis', 3, 85, [118],
    'Cache drivers, TTL, tags, remember(), and why Redis beats the database for hot ephemeral data.'],
  [128, 'Rate Limiting & Security', '128-security', 3, 84, [122, 127],
    'SQLi, XSS, CSRF, mass assignment, uploads — the attack surface and how Laravel covers each.'],
  [129, 'Testing, Factories & Mocking', '129-testing', 4, 88, [115, 121],
    'Unit vs feature vs HTTP tests, RefreshDatabase, and what to mock and why.'],
  [130, 'Service Layer, Repositories & SOLID', '130-solid-patterns', 4, 80, [108, 123],
    'When a service layer earns its place, when a repository is over-abstraction, and the SOLID examples.'],
  [131, 'Laravel Performance & Deployment', '131-performance-deployment', 3, 82, [124, 127, 118],
    'The "your API is slow" answer, plus caching, workers, and a safe production rollout.'],
  [132, 'Laravel + React / Inertia', '132-inertia', 3, 78, [48, 86, 121],
    'Server-side routing with React pages — and why Inertia beats a separate SPA + REST API.'],
  [133, 'Laravel API + Next.js & Payments', '133-api-nextjs-stripe', 4, 85, [132, 122, 26],
    'Laravel as an API for Next.js, and Stripe webhooks — never trust the frontend about money.'],
  [134, 'Multi-Tenancy & System Design', '134-multitenancy', 5, 86, [118, 120, 130],
    'Tenant isolation, the SaaS architectures, and the senior scenario questions that decide the offer.'],
]);

/* ------------------------------------------------------------------ */
/* Module 7 — AI & LLM Foundations                                     */
/* ------------------------------------------------------------------ */

const aiFoundations = rows([
  [135, 'What an LLM Is', '135-what-is-an-llm', 1, 85, [28],
    'The single mental model everything else hangs on: next-token prediction.'],
  [136, 'The Transformer & Attention Mechanism', '136-transformer-attention', 3, 70, [135],
    'Attention is how the model decides what matters. Enough to explain, not implement.'],
  [137, 'Tokens & Tokenization', '137-tokens-tokenization', 2, 78, [135],
    'Every input and output is measured in tokens — cost and context are token problems.'],
  [138, 'Context Windows & Input Limits', '138-context-windows', 2, 80, [135, 137],
    'The hard ceiling of every LLM request, and the first thing an architect budgets.'],
  [139, 'Temperature, Top-p & Sampling', '139-temperature-top-p', 2, 74, [135],
    'Creativity vs determinism is a knob, not a mystery — and it changes with the task.'],
  [140, 'Model Capabilities', '140-model-capabilities', 2, 76, [135, 136],
    'What frontier models can actually do, so you pick the right tool for the job.'],
  [141, 'Model Limitations', '141-model-limitations', 3, 82, [140],
    'Hallucination, staleness, weak math — the failure surface you design around.'],
  [142, 'Prompt Engineering & System/User/Developer Instructions', '142-prompt-engineering', 3, 84, [140],
    'Instructions are the cheapest model upgrade you can ship.'],
  [143, 'Structured Outputs & JSON Schemas', '143-structured-outputs', 3, 88, [142],
    'Guaranteed JSON turns a text model into a reliable function.'],
  [144, 'Function Calling & Tool Calling', '144-function-calling', 4, 90, [143],
    'The primitive that makes agents possible — the model declares, you execute.'],
  [145, 'Streaming Responses', '145-streaming', 2, 72, [135],
    'TTFT is the perceived latency of every AI product. Stream or feel slow.'],
  [146, 'Multimodal Models', '146-multimodal', 3, 75, [140],
    'Vision, audio and PDFs in — text out. Expands the product surface.'],
  [147, 'Embeddings & Vector Semantics', '147-embeddings', 3, 86, [135],
    'The foundation of every RAG system — semantics as coordinates.'],
  [148, 'Model Selection & Frontier Families', '148-model-selection', 3, 85, [140, 141],
    'The architect decision: which model, which size, which provider.'],
  [149, 'Token Management & Budgeting', '149-token-budgeting', 3, 80, [137, 138],
    'You do not manage tokens by guessing. You budget them per request.'],
  [150, 'Cost Optimization', '150-cost-optimization', 3, 84, [149],
    'Token cost is the new infrastructure cost — and it is fully controllable.'],
  [151, 'Latency Optimization', '151-latency-optimization', 3, 81, [145, 149],
    'Streaming, smaller models, caching, batching — the latency toolbox.'],
  [152, 'The OpenAI API', '152-openai-api', 2, 77, [143, 144],
    'Chat Completions, responses, tools, structured outputs — the baseline provider.'],
  [153, 'The Anthropic API', '153-anthropic-api', 2, 74, [143, 144],
    'Messages API, system prompts, tool use, extended thinking.'],
  [154, 'The Google Gemini API', '154-gemini-api', 2, 68, [143, 144],
    'The multimodal-native provider, with its own content-generation shape.'],
  [155, 'Provider Abstraction & Model Routing', '155-provider-abstraction', 3, 78, [152, 153, 154],
    'One interface over many providers — and the escape hatches when abstraction leaks.'],
  [156, 'Comparing the Three Providers', '156-provider-comparison', 2, 72, [152, 153, 154],
    'A decision table for the interview: quality, cost, speed, features, lock-in.'],
  [157, 'Foundations Review — the Model Decision Rule', '157-model-decision-rule', 3, 80, [148, 149, 150],
    'The capstone: a repeatable rule for choosing a model, a provider and a budget.'],
]);

/* ------------------------------------------------------------------ */
/* Module 8 — AI Application Engineering                               */
/* ------------------------------------------------------------------ */

const aiApp = rows([
  [158, 'AI Application Architecture', '158-ai-app-architecture', 3, 85, [157],
    'The parts of an AI app: UI, gateway, orchestration, tools, memory, evals.'],
  [159, 'LLM API Integration Patterns', '159-llm-integration', 3, 80, [157],
    'Where the API call lives, how it is called, and how it fails.'],
  [160, 'The Vercel AI SDK', '160-vercel-ai-sdk', 2, 76, [159],
    'The standard TypeScript toolkit for streaming LLM UIs.'],
  [161, 'AI SDK Patterns (streams, parts, tool calls)', '161-ai-sdk-patterns', 3, 78, [160],
    'Streams, tool-call parts, and the UI state machine around them.'],
  [162, 'Streaming UI', '162-streaming-ui', 3, 79, [161],
    'Markdown streaming, progress, cancellation — the felt-quality of AI apps.'],
  [163, 'Structured Generation in Apps', '163-structured-generation', 3, 82, [143, 160],
    'Typed outputs end to end: schema → validation → typed UI.'],
  [164, 'Tool Calling in Applications', '164-tool-calling-apps', 4, 85, [144, 161],
    'Tool calls in the UI loop: pending, executed, results back in context.'],
  [165, 'AI Application State', '165-ai-app-state', 3, 74, [82, 158],
    'Which state is local, which is server, which belongs to the model.'],
  [166, 'Conversation Management', '166-conversation-management', 3, 80, [165],
    'History, truncation, summarisation — the shape of a session.'],
  [167, 'AI Memory', '167-ai-memory', 3, 81, [166],
    'Short-term context vs long-term recall, and where each is stored.'],
  [168, 'Error Handling for LLM Calls', '168-llm-error-handling', 3, 83, [159],
    'Provider outages, timeouts, malformed JSON, refusal — handle them all.'],
  [169, 'Retry Strategies & Backoff', '169-retry-backoff', 3, 78, [168],
    'Idempotent retries, exponential backoff, jitter — the resilience layer.'],
  [170, 'Rate Limiting', '170-rate-limiting', 3, 79, [168],
    'TPM/RPM budgets, queueing, and what happens when you exceed them.'],
  [171, 'Caching LLM Responses', '171-caching', 3, 76, [169],
    'Exact-match and semantic caching — the biggest latency and cost lever.'],
  [172, 'AI API Security Fundamentals', '172-ai-api-security', 3, 80, [128, 170],
    'Keys, proxying, secret handling — the baseline before Lesson 308.'],
  [173, 'Production AI Patterns (synthesis)', '173-production-ai-patterns', 4, 84, [162, 164, 168, 171],
    'The full shape: streaming, tools, retries, caching, evals in one architecture.'],
]);

/* ------------------------------------------------------------------ */
/* Module 9 — RAG / Knowledge Systems                                  */
/* ------------------------------------------------------------------ */

const rag = rows([
  [174, 'RAG Fundamentals', '174-rag-fundamentals', 2, 88, [147],
    'Why retrieval beats retraining: ground the model in your documents.'],
  [175, 'RAG Architecture', '175-rag-architecture', 3, 86, [174],
    'Ingestion → retrieval → synthesis. The three-stage spine of every RAG system.'],
  [176, 'Document Ingestion Pipelines', '176-ingestion', 3, 82, [175],
    'Load, parse, chunk, embed, index — and keep it repeatable and incremental.'],
  [177, 'PDF Processing & Text Extraction', '177-pdf-processing', 3, 75, [176],
    'Text layers, OCR, layout — the messiest part of real knowledge systems.'],
  [178, 'Chunking Fundamentals', '178-chunking', 3, 83, [176],
    'The size, overlap and granularity decisions that determine retrieval quality.'],
  [179, 'Chunking Strategies', '179-chunking-strategies', 3, 79, [178],
    'Fixed, recursive, semantic, document-aware — which strategy for which content.'],
  [180, 'Metadata for Retrieval', '180-metadata', 2, 74, [178],
    'Source, date, section, tenant — the filters that make retrieval precise.'],
  [181, 'Embeddings for RAG', '181-embeddings-rag', 3, 84, [147, 176],
    'Which embedding model, dimensionality, and the trade-offs.'],
  [182, 'Vector Databases', '182-vector-databases', 2, 83, [181],
    'What a vector DB actually does: ANN search over coordinates.'],
  [183, 'PostgreSQL + pgvector', '183-pgvector', 3, 80, [182],
    'The boring default: vectors in your existing Postgres.'],
  [184, 'Pinecone', '184-pinecone', 2, 68, [182],
    'Managed, serverless, purpose-built — when to pay for a specialist.'],
  [185, 'Qdrant', '185-qdrant', 2, 66, [182],
    'Self-hostable, filtering-heavy — the open-source middle path.'],
  [186, 'Vector Database Selection', '186-vector-db-selection', 3, 78, [183, 184, 185],
    'A decision rule: Postgres first, specialist when scale demands it.'],
  [187, 'Hybrid Search', '187-hybrid-search', 4, 84, [183, 188],
    'Keyword + vector together — the retrieval quality jump most teams miss.'],
  [188, 'Keyword vs Semantic Search', '188-keyword-vs-semantic', 3, 76, [182],
    'BM25 vs embeddings: what each finds that the other misses.'],
  [189, 'Retrieval (top-k, filters, scoring)', '189-retrieval', 3, 80, [186],
    'How a query becomes a shortlist: k, filters, and score shaping.'],
  [190, 'Reranking', '190-reranking', 3, 81, [189],
    'The second pass that fixes the first one — cross-encoder rerankers.'],
  [191, 'Context Construction', '191-context-construction', 3, 82, [189],
    'What you actually put in the prompt: ordering, formatting, budget.'],
  [192, 'Citations & Source Attribution', '192-citations', 3, 77, [191],
    'Every claim traceable to a chunk — trust is a feature of the architecture.'],
  [193, 'Query Rewriting', '193-query-rewriting', 3, 74, [189],
    'HyDE, multi-query, decomposition — improve retrieval before the model.'],
  [194, 'Contextual Retrieval', '194-contextual-retrieval', 3, 79, [191, 193],
    'Surrounding chunks and context-aware embedding for hard queries.'],
  [195, 'RAG Evaluation', '195-rag-evaluation', 4, 85, [190, 191],
    'Retrieval metrics, answer metrics, and the dataset that holds them.'],
  [196, 'RAG Failure Modes', '196-rag-failure-modes', 4, 87, [195],
    'Missing chunks, wrong chunks, hallucinated answers — and their fixes.'],
  [197, 'Production RAG Architecture (synthesis)', '197-production-rag', 4, 88, [175, 186, 190, 195],
    'The full RAG stack: ingestion pipeline, hybrid retrieval, reranking, evals.'],
]);

/* ------------------------------------------------------------------ */
/* Module 10 — AI Agents                                               */
/* ------------------------------------------------------------------ */

const agents = rows([
  [198, 'What Agents Are', '198-what-agents-are', 2, 84, [144],
    'A loop that calls the model, executes tools, and feeds results back.'],
  [199, 'Agent vs Workflow', '199-agent-vs-workflow', 3, 82, [198],
    'Deterministic pipelines vs model-driven loops — and when each wins.'],
  [200, 'Agent Architecture (the loop)', '200-agent-architecture', 3, 86, [198],
    'Perceive → decide → act → observe. The diagram you draw in interviews.'],
  [201, 'Tool Calling for Agents', '201-agent-tools', 3, 84, [144, 200],
    'Tool schemas, execution, and results back in context — done safely.'],
  [202, 'Planning (ReAct, plan-and-execute)', '202-planning', 3, 80, [200],
    'How agents decide what to do next — reasoning before acting.'],
  [203, 'Reasoning Patterns', '203-reasoning-patterns', 3, 79, [202],
    'Chain of thought, reflection, self-correction — the thinking scaffolds.'],
  [204, 'Tool Selection & Routing', '204-tool-selection', 3, 76, [201],
    'Which tool, given the task — and keeping the tool list small.'],
  [205, 'Agent Loops & Termination', '205-agent-loops', 3, 78, [200],
    'Max iterations, budget, and the stopping rules that keep agents sane.'],
  [206, 'Agent Memory', '206-agent-memory', 3, 80, [167, 200],
    'Context, scratchpad, and long-term recall for a multi-step run.'],
  [207, 'Agent State & Persistence', '207-agent-state', 3, 77, [206],
    'Checkpoints, resume, and durable state across a long run.'],
  [208, 'Human-in-the-Loop', '208-human-in-the-loop', 3, 83, [205],
    'Approval gates, interrupts, and the control point for risky tools.'],
  [209, 'Guardrails for Agents', '209-guardrails', 3, 81, [208],
    'The rails that keep a loop on track — before, during, and after.'],
  [210, 'Multi-Agent Systems', '210-multi-agent', 4, 79, [200, 204],
    'Specialists with a coordinator — when one agent is not enough.'],
  [211, 'Agent Failure Modes', '211-agent-failure-modes', 4, 84, [205],
    'Loops, drift, tool explosions — the ways agents break in production.'],
  [212, 'Agent Security', '212-agent-security', 4, 87, [209, 211],
    'The attack surface of a loop with tools: injection, excessive agency, secrets.'],
  [213, 'Agent Observability', '213-agent-observability', 3, 82, [211],
    'Steps, tool calls, token spend — the trace of a single agent run.'],
  [214, 'LangChain', '214-langchain', 2, 74, [200],
    'The most-used framework — and where it helps vs where it hides.'],
  [215, 'LangGraph', '215-langgraph', 3, 76, [214],
    'Agents as graphs: state machines with checkpoints and human gates.'],
  [216, 'MCP & Production Agent Architecture (synthesis)', '216-mcp-agent-architecture', 4, 85, [208, 212, 213, 215],
    'Model Context Protocol plus the production loop: tools, guardrails, traceability.'],
]);

/* ------------------------------------------------------------------ */
/* Module 11 — AI Automation                                           */
/* ------------------------------------------------------------------ */

const automation = rows([
  [217, 'AI Workflows', '217-ai-workflows', 2, 78, [199],
    'The automation unit: a pipeline of AI steps with human checkpoints.'],
  [218, 'n8n', '218-n8n', 2, 72, [217],
    'The open-source workflow tool for wiring AI into everything.'],
  [219, 'Make', '219-make', 2, 66, [217],
    'The visual automation alternative — and when it fits.'],
  [220, 'Webhooks & Event-Driven Automation', '220-webhooks', 3, 80, [217],
    'Triggering AI work from the events your systems already emit.'],
  [221, 'Scheduled Jobs & Cron for AI', '221-scheduled-jobs', 2, 74, [217],
    'Batch AI work on a schedule — digests, reports, syncs.'],
  [222, 'Queues & Background Workers for AI', '222-queues-workers', 3, 81, [249],
    'LLM calls are slow; never run them in a request.'],
  [223, 'AI + CRM', '223-ai-crm', 3, 73, [217],
    'Lead scoring, enrichment, and follow-up — the highest-ROI automation.'],
  [224, 'AI + Email', '224-ai-email', 3, 75, [217],
    'Drafting, triage, and replies — with the human-approval rule.'],
  [225, 'AI + Slack / Messaging', '225-ai-slack', 3, 72, [217],
    'Bots that act on channels — and the permission boundary.'],
  [226, 'AI + Databases', '226-ai-databases', 3, 77, [183, 217],
    'Text-to-SQL done safely: read-only, audited, and verified.'],
  [227, 'AI + External APIs', '227-ai-external-apis', 3, 74, [220],
    'Calling the world from a workflow — with idempotency and retries.'],
  [228, 'Human Approval Workflows', '228-approval-workflows', 3, 82, [208, 217],
    'The step that decides whether automation scales or stalls.'],
  [229, 'Business Process Automation', '229-business-process', 3, 79, [217, 228],
    'From a business process to a workflow: mapping, steps, ownership.'],
  [230, 'AI Automation Architecture', '230-automation-architecture', 4, 83, [220, 222, 228],
    'Events in, workflows, queues, approval gates — the platform shape.'],
  [231, 'Multi-Agent Automation', '231-multi-agent-automation', 4, 76, [210, 230],
    'Agents inside workflows: when the loop runs a sub-loop.'],
  [232, 'Automation Failure & Recovery', '232-automation-recovery', 3, 78, [222, 228],
    'Idempotency, dead letters, and the rerun story for automations.'],
]);

/* ------------------------------------------------------------------ */
/* Module 12 — Backend & Distributed Systems for AI                    */
/* ------------------------------------------------------------------ */

const backendAi = rows([
  [233, 'API Architecture for AI Products', '233-api-architecture', 3, 84, [92, 158],
    'Where the AI endpoints live and how the request flows through them.'],
  [234, 'REST Best Practices (review)', '234-rest-review', 2, 70, [92],
    'Resources, status codes, pagination — the baseline your AI API extends.'],
  [235, 'GraphQL Basics', '235-graphql-basics', 2, 68, [233],
    'Queries, mutations, and when an AI product wants a schema, not routes.'],
  [236, 'API Gateways', '236-api-gateways', 3, 78, [233],
    'Auth, rate limiting, routing, caching — the front door of an AI platform.'],
  [237, 'Authentication', '237-authentication', 3, 84, [122, 233],
    'Who is calling your AI API — sessions, tokens, keys.'],
  [238, 'Authorization', '238-authorization', 3, 82, [123, 237],
    'What a caller may do with the model — scopes, quotas, policy.'],
  [239, 'OAuth 2.0 & OIDC', '239-oauth-oidc', 3, 78, [237],
    'The delegated-auth standard your customers will ask for.'],
  [240, 'JWT', '240-jwt', 3, 76, [237],
    'Signed claims, expiry, and the verification path in front of every API.'],
  [241, 'RBAC & Fine-Grained Access', '241-rbac', 3, 80, [238],
    'Roles, permissions, and per-resource checks for an AI SaaS.'],
  [242, 'Rate Limiting', '242-rate-limiting', 3, 79, [236],
    'Token buckets, per-tenant limits, and what the model bills you for.'],
  [243, 'Redis', '243-redis', 3, 83, [127, 242],
    'The cache and coordination layer every AI backend leans on.'],
  [244, 'Caching Strategies', '244-caching-strategies', 3, 78, [171, 243],
    'Cache-aside, TTL, invalidation — for prompts and for data.'],
  [245, 'Message Queues & DLQs', '245-message-queues', 3, 82, [124, 243],
    'Async work, ordering, and the dead-letter queue that catches failures.'],
  [246, 'Amazon SQS', '246-sqs', 2, 76, [245],
    'The queue service behind serverless AI workloads.'],
  [247, 'SNS & Pub/Sub', '247-sns-pubsub', 2, 72, [245],
    'Fan-out events to the systems that care.'],
  [248, 'Event-Driven Architecture', '248-event-driven', 3, 84, [247],
    'Events as the contract between AI and the rest of the business.'],
  [249, 'Background Jobs & Workers', '249-background-jobs', 3, 80, [245],
    'Long-running AI work off the request path — the standard pattern.'],
  [250, 'WebSockets', '250-websockets', 3, 74, [233],
    'Bidirectional channels for live AI features.'],
  [251, 'SSE & Streaming Protocols', '251-sse-streaming', 3, 81, [145, 233],
    'The transport behind every streaming chat — and why not WebSockets.'],
  [252, 'Microservices', '252-microservices', 3, 79, [233],
    'Splitting an AI platform by domain and by scale.'],
  [253, 'Modular Monoliths', '253-modular-monolith', 3, 77, [252],
    'The sane default between monolith and microservices.'],
  [254, 'Service-to-Service Communication', '254-service-to-service', 3, 76, [252],
    'Sync calls, async events, and the contracts between services.'],
  [255, 'Idempotency', '255-idempotency', 3, 81, [254],
    'Retries are only safe if the retried call is safe to repeat.'],
  [256, 'Retries & Backoff', '256-retries-backoff', 3, 78, [169, 255],
    'The retry policy every AI call needs — bounded, jittered, logged.'],
  [257, 'Circuit Breakers & Bulkheads', '257-circuit-breakers', 3, 79, [256],
    'Stop calling the failing provider — and contain the blast radius.'],
  [258, 'Fault Tolerance & Graceful Degradation', '258-fault-tolerance', 3, 80, [257],
    'What the user gets when the model is down — the fallback story.'],
  [259, 'Distributed Systems Concepts (review)', '259-distributed-concepts', 3, 75, [255, 256],
    'CAP, consistency, and the vocabulary you need for the design rounds.'],
  [260, 'Backend Architecture for AI SaaS (synthesis)', '260-ai-saas-backend', 4, 86, [236, 248, 257, 258],
    'Gateway, auth, queues, caching, streaming — one coherent backend.'],
]);

/* ------------------------------------------------------------------ */
/* Module 13 — Cloud & AWS for AI                                      */
/* ------------------------------------------------------------------ */

const cloudAws = rows([
  [261, 'AWS Fundamentals (regions, AZs)', '261-aws-fundamentals', 1, 74, [28],
    'The map before the services: regions, AZs, and the shared-responsibility model.'],
  [262, 'IAM', '262-iam', 3, 84, [261],
    'Users, roles, policies — the permission model everything else inherits.'],
  [263, 'VPC & Networking', '263-vpc', 3, 80, [261],
    'Subnets, security groups, and what can reach your AI services.'],
  [264, 'EC2', '264-ec2', 2, 68, [261],
    'The baseline compute — and when AI workloads prefer it.'],
  [265, 'S3', '265-s3', 2, 76, [261],
    'The object store behind documents, datasets, and model artifacts.'],
  [266, 'Lambda', '266-lambda', 3, 83, [261],
    'Serverless compute — the natural home of AI request handlers.'],
  [267, 'API Gateway', '267-api-gateway', 3, 79, [236, 266],
    'The AWS front door: routes, auth, throttling, and streaming.'],
  [268, 'RDS & PostgreSQL on AWS', '268-rds-postgresql', 3, 81, [183, 261],
    'Managed Postgres — and where pgvector lives in production.'],
  [269, 'ElastiCache & Redis', '269-elasticache', 2, 74, [243, 268],
    'Managed Redis for caching and queues on AWS.'],
  [270, 'SQS & SNS on AWS', '270-sqs-sns-aws', 3, 78, [246, 247],
    'The AWS async backbone behind AI pipelines.'],
  [271, 'ECS & ECR', '271-ecs-ecr', 3, 77, [261],
    'Containers on AWS: images in ECR, services on ECS.'],
  [272, 'CloudFront', '272-cloudfront', 2, 69, [261],
    'The CDN in front of static and streaming AI apps.'],
  [273, 'Route 53', '273-route-53', 2, 64, [261],
    'DNS, health checks, and routing traffic to the right region.'],
  [274, 'CloudWatch', '274-cloudwatch', 3, 76, [266, 268],
    'Logs, metrics, alarms — the AWS observability floor.'],
  [275, 'Secrets Manager', '275-secrets-manager', 2, 80, [262],
    'Where API keys and DB passwords actually live on AWS.'],
  [276, 'EventBridge', '276-eventbridge', 3, 78, [248, 261],
    'The AWS event bus that wires services together.'],
  [277, 'Step Functions', '277-step-functions', 3, 81, [222, 266],
    'The AWS state machine for long AI workflows.'],
  [278, 'Amazon Bedrock', '278-bedrock', 3, 82, [148, 261],
    'One API over many frontier models — the AWS-native LLM access.'],
  [279, 'Bedrock Agents', '279-bedrock-agents', 3, 78, [278],
    'Managed agents: tools, action groups, and orchestration on Bedrock.'],
  [280, 'Bedrock Knowledge Bases', '280-bedrock-knowledge-bases', 3, 80, [278, 183],
    'Managed RAG: ingest, embed, retrieve — without building the pipeline.'],
  [281, 'Bedrock Guardrails', '281-bedrock-guardrails', 3, 77, [278],
    'Content filters and PII redaction as a managed layer.'],
  [282, 'AWS AI Architecture Patterns', '282-aws-ai-patterns', 4, 83, [267, 278],
    'The repeatable shapes: streaming chat, RAG, batch inference.'],
  [283, 'Serverless AI Architecture', '283-serverless-ai', 4, 84, [266, 267, 280],
    'Lambda + API Gateway + Bedrock: the serverless AI stack.'],
  [284, 'Containerized AI Architecture', '284-containerized-ai', 4, 79, [271, 283],
    'ECS + ECR for AI services that outgrow Lambda.'],
  [285, 'AWS Cost Optimization for AI', '285-aws-cost-optimization', 4, 85, [150, 282],
    'Model spend, provisioned throughput, and the AWS bill as architecture.'],
  [286, 'Multi-Region & DR on AWS', '286-multi-region-dr', 3, 77, [282],
    'Replication, failover, and the RTO/RPO story for an AI platform.'],
  [287, 'Cloud Architecture for an AI SaaS (synthesis)', '287-ai-saas-cloud', 4, 86, [282, 283, 285],
    'The complete AWS reference architecture for a multi-tenant AI SaaS.'],
]);

/* ------------------------------------------------------------------ */
/* Module 14 — Docker / DevOps / Infrastructure                        */
/* ------------------------------------------------------------------ */

const devops = rows([
  [288, 'Docker & Containers', '288-docker-basics', 1, 70, [28],
    'The unit of deployment: image, container, and the runtime contract.'],
  [289, 'Dockerfiles', '289-dockerfiles', 2, 74, [288],
    'Writing images that are small, cached, and reproducible.'],
  [290, 'Docker Compose', '290-docker-compose', 2, 72, [288],
    'The local multi-service stack — AI app, Postgres, Redis.'],
  [291, 'Multi-Stage Builds', '291-multi-stage-builds', 2, 68, [289],
    'Build once, ship the runtime — the image-slimming move.'],
  [292, 'Container Networking', '292-container-networking', 3, 71, [290],
    'Ports, networks, and service discovery between containers.'],
  [293, 'Container Security', '293-container-security', 3, 79, [289],
    'Non-root, pinned base images, scanning — the container threat model.'],
  [294, 'ECR', '294-ecr', 2, 65, [271, 289],
    'The AWS image registry, and how images get there.'],
  [295, 'ECS & Fargate', '295-ecs-fargate', 3, 76, [271, 294],
    'Running containers without managing servers.'],
  [296, 'CI/CD Fundamentals', '296-ci-cd', 2, 74, [289],
    'Build, test, deploy — the pipeline every AI service needs.'],
  [297, 'GitHub Actions for AI Apps', '297-github-actions', 3, 80, [296],
    'The workflow file: CI for evals, and CD to the cloud.'],
  [298, 'Infrastructure as Code', '298-iac', 3, 78, [296],
    'Declaring AWS in code, so the environment is reviewable and repeatable.'],
  [299, 'Terraform Fundamentals', '299-terraform', 3, 82, [298],
    'Providers, state, and the plan/apply loop.'],
  [300, 'Environment Management', '300-environments', 3, 75, [298],
    'Dev, staging, prod — and how AI config differs from app config.'],
  [301, 'Secrets in CI/CD', '301-secrets-cicd', 3, 79, [300],
    'The one rule: secrets never touch the repo or the image.'],
  [302, 'Deployment Strategies', '302-deployment-strategies', 3, 77, [296],
    'Recreate, rolling, blue/green — and what an AI service needs.'],
  [303, 'Canary Deployments', '303-canary-deployments', 3, 75, [302],
    'Ship to 5%, watch the metrics, roll forward.'],
  [304, 'Rollbacks & Recovery', '304-rollbacks', 3, 76, [302],
    'The instant-revert path when the new model or build misbehaves.'],
  [305, 'Observability for AI Deployments', '305-observability-deployments', 3, 78, [274, 296],
    'Logs, metrics, traces across the pipeline — not just the app.'],
  [306, 'Kubernetes for the AI Architect (concepts only)', '306-kubernetes-basics', 3, 71, [295],
    'Pods, deployments, services — enough to speak the language, not run the cluster.'],
  [307, 'The AI Deployment Pipeline (synthesis)', '307-ai-deploy-pipeline', 4, 83, [297, 302, 305],
    'From commit to canary to rollback: the full AI service pipeline.'],
]);

/* ------------------------------------------------------------------ */
/* Module 15 — AI Security                                             */
/* ------------------------------------------------------------------ */

const aiSecurity = rows([
  [308, 'AI Security Threat Model (OWASP LLM Top 10)', '308-threat-model', 3, 86, [128, 212],
    'The map of the attack surface before any countermeasure.'],
  [309, 'Prompt Injection', '309-prompt-injection', 4, 92, [308],
    'The model follows instructions — including the attacker\u2019s.'],
  [310, 'Jailbreaks', '310-jailbreaks', 3, 82, [309],
    'The attacks that escape the model\u2019s training-time alignment.'],
  [311, 'Indirect Prompt Injection', '311-indirect-injection', 4, 88, [309],
    'The injection hiding in retrieved text, tools, or files.'],
  [312, 'Data Leakage', '312-data-leakage', 4, 85, [308],
    'Your data leaving through prompts, logs, or training.'],
  [313, 'Sensitive Data & PII', '313-sensitive-data', 3, 83, [312],
    'Detecting, redacting, and minimising PII in AI flows.'],
  [314, 'Excessive Agency', '314-excessive-agency', 4, 87, [308],
    'The agent that can do too much — and the blast-radius fix.'],
  [315, 'Unsafe Tool Calling', '315-unsafe-tools', 4, 86, [314],
    'Tool schemas, permissions, and the sandbox around execution.'],
  [316, 'Malicious Documents & RAG Poisoning', '316-rag-poisoning', 4, 85, [311, 196],
    'The uploaded PDF that attacks your knowledge base.'],
  [317, 'Model Abuse', '317-model-abuse', 3, 79, [308],
    'Scraping, cloning, and burning your quota with junk calls.'],
  [318, 'Rate Limiting & Abuse Prevention', '318-rate-limit-security', 3, 81, [242, 317],
    'The control that stops abuse at the door.'],
  [319, 'Auth for AI APIs', '319-ai-api-auth', 3, 82, [237, 308],
    'Keys, scopes, and quotas for the model endpoint.'],
  [320, 'Tenant Isolation for AI (L134 payoff)', '320-ai-tenant-isolation', 4, 88, [134, 308],
    'The L134 discipline, applied to prompts, caches, and vector stores.'],
  [321, 'Secret Management', '321-secret-management', 3, 80, [275, 308],
    'Where model keys live, and how they never reach the client.'],
  [322, 'Audit Logs & Governance Records', '322-audit-logs', 3, 79, [308],
    'Who prompted what, with which tools, at what cost — the record.'],
  [323, 'Secure Tool Architecture', '323-secure-tools', 4, 84, [315, 322],
    'Least privilege, scoped credentials, and tool output filtering.'],
  [324, 'Human Approval as a Security Control', '324-human-approval-security', 3, 80, [208, 323],
    'The highest-value control for the highest-risk actions.'],
  [325, 'AI Security Architecture (defense in depth)', '325-ai-security-architecture', 4, 86, [320, 323, 324],
    'Layers: guardrails, tools, tenant isolation, audit — one stack.'],
  [326, 'OWASP LLM Top 10 Walkthrough', '326-owasp-llm-top10', 3, 84, [325],
    'Each of the ten risks, its fix, and the sentence for the interview.'],
  [327, 'Securing the RAG + Agent Stack (synthesis)', '327-secure-rag-agents', 4, 87, [316, 325],
    'The full threat model for a RAG agent: every path an attack can take.'],
]);

/* ------------------------------------------------------------------ */
/* Module 16 — AI Observability & Evaluation                           */
/* ------------------------------------------------------------------ */

const observability = rows([
  [328, 'AI Observability Fundamentals', '328-ai-observability', 2, 82, [28],
    'What you must see in an AI system: prompts, outputs, tokens, latency, cost.'],
  [329, 'Logging', '329-logging', 3, 76, [328],
    'Structured logs for every model call — and what to redact first.'],
  [330, 'Tracing', '330-tracing', 3, 81, [328],
    'The request path through gateway, retrieval, tools, and model.'],
  [331, 'Metrics', '331-metrics', 3, 78, [328],
    'Counters, gauges, and histograms for the AI platform.'],
  [332, 'Token Usage Tracking', '332-token-usage', 2, 80, [149, 328],
    'Per-user, per-feature, per-day — the metering your pricing needs.'],
  [333, 'Latency & TTFT Monitoring', '333-latency-ttft', 3, 77, [145, 328],
    'Time-to-first-token as the product metric it is.'],
  [334, 'Cost Tracking', '334-cost-tracking', 3, 82, [150, 332],
    'Attributing model spend to features, tenants, and users.'],
  [335, 'Model Performance Monitoring', '335-model-performance', 3, 79, [328],
    'Quality drift and behavioral change after deploy — the hidden regressions.'],
  [336, 'Hallucination Detection', '336-hallucination-detection', 4, 85, [337],
    'Spotting ungrounded claims in production output.'],
  [337, 'Groundedness Evaluation', '337-groundedness', 4, 83, [195, 328],
    'Does the answer follow from the retrieved evidence?'],
  [338, 'Retrieval Evaluation', '338-retrieval-evaluation', 3, 81, [195, 328],
    'Precision, recall, and the golden query set.'],
  [339, 'Tool Success Rate', '339-tool-success', 3, 74, [213, 328],
    'The agent metric: how often tools work, and how that decays.'],
  [340, 'Agent Evaluation', '340-agent-evaluation', 4, 82, [339],
    'Trajectories, task success, and cost per completed task.'],
  [341, 'Regression Testing for AI', '341-regression-testing', 3, 80, [342],
    'The eval suite that runs on every deploy, like tests but for quality.'],
  [342, 'Evaluation Datasets', '342-eval-datasets', 3, 83, [328],
    'Golden sets, adversarial sets, and keeping them honest.'],
  [343, 'LLM-as-a-Judge', '343-llm-as-a-judge', 3, 82, [342],
    'Scoring answers at scale — and the bias you must check.'],
  [344, 'LangSmith', '344-langsmith', 2, 74, [341],
    'The LangChain-family tracing and evaluation platform.'],
  [345, 'Langfuse', '345-langfuse', 2, 73, [341],
    'The open-source observability platform for LLM apps.'],
  [346, 'OpenTelemetry for AI (synthesis)', '346-opentelemetry', 3, 79, [330, 341],
    'One tracing standard across your AI stack — plus the OTel AI conventions.'],
]);

/* ------------------------------------------------------------------ */
/* Module 17 — AI System Design                                        */
/* ------------------------------------------------------------------ */

const aiSystemDesign = rows([
  [347, 'System Design Protocol for AI (L102 spine applied)', '347-ai-system-design-protocol', 3, 85, [102, 260],
    'Clarify → estimate → design → trade-offs, with AI-specific questions per phase.'],
  [348, 'AI Chat System', '348-ai-chat-system', 4, 88, [347, 173],
    'Streaming, history, tools, and the stateless backend of a chat product.'],
  [349, 'RAG Platform', '349-rag-platform', 4, 87, [347, 197],
    'Ingestion, retrieval, and synthesis as a multi-tenant platform.'],
  [350, 'AI Customer Support', '350-ai-support', 4, 86, [347, 349],
    'Tickets, escalation, and the human handoff as an architecture.'],
  [351, 'AI Sales Assistant', '351-ai-sales', 4, 83, [347, 350],
    'Lead triage, CRM integration, and approval-gated outreach.'],
  [352, 'AI Recruiting Platform', '352-ai-recruiting', 4, 84, [347, 350],
    'Resume ingestion, matching, and bias — the fairness-constrained design.'],
  [353, 'AI Document Processing System', '353-ai-doc-processing', 4, 85, [347, 177],
    'Parse, classify, extract, and verify documents at scale.'],
  [354, 'AI Coding Assistant', '354-ai-coding-assistant', 4, 84, [347, 353],
    'Context, autocomplete, and edit orchestration — the hardest latency budget.'],
  [355, 'AI E-commerce Assistant', '355-ai-ecommerce', 4, 82, [347, 348],
    'Catalog grounding, recommendations, and purchase-safe tool calls.'],
  [356, 'AI Automation Platform', '356-ai-automation-platform', 4, 85, [347, 230],
    'Workflows, integrations, and approval gates as a product.'],
  [357, 'Multi-Tenant AI SaaS', '357-multi-tenant-ai-saas', 5, 90, [347, 320],
    'The capstone shape: tenant isolation over prompts, vectors, and caches.'],
  [358, 'High-Scale AI System', '358-high-scale-ai', 5, 88, [347, 357],
    'Millions of requests: caching, batching, and the cost of scale.'],
]);

/* ------------------------------------------------------------------ */
/* Module 18 — Enterprise AI Solutions Architecture                    */
/* ------------------------------------------------------------------ */

const enterpriseAi = rows([
  [359, 'Requirements Gathering for AI', '359-requirements-gathering', 3, 82, [347],
    'Turning "we want AI" into functional and non-functional requirements.'],
  [360, 'Stakeholder Communication', '360-stakeholders', 3, 78, [359],
    'Executives, engineers, and the risk of AI theatre.'],
  [361, 'Architecture Decision Records', '361-adrs', 3, 76, [359],
    'The document that makes a choice reviewable and reversible.'],
  [362, 'Technology Selection', '362-technology-selection', 3, 80, [361],
    'Frameworks, databases, and the shortlist you can defend.'],
  [363, 'Build vs Buy', '363-build-vs-buy', 3, 82, [362],
    'Managed APIs, open-source stacks, or in-house — the cost equation.'],
  [364, 'Vendor Selection', '364-vendor-selection', 3, 77, [363],
    'Evaluating model and platform vendors on the axes that matter.'],
  [365, 'Model Selection at Scale', '365-model-selection-scale', 4, 84, [148, 364],
    'Routing, fine-tuning, and the tiered model strategy for enterprise.'],
  [366, 'Cloud Selection', '366-cloud-selection', 3, 79, [364],
    'AWS vs Azure vs GCP for AI, and the exit-cost question.'],
  [367, 'Architecture Trade-offs', '367-trade-offs', 3, 81, [361],
    'The named trade-off is the senior deliverable.'],
  [368, 'Cost Estimation & Budgeting', '368-cost-estimation', 4, 85, [150, 334],
    'Token math, infra cost, and the budget that survives the board.'],
  [369, 'Capacity Planning', '369-capacity-planning', 3, 79, [368],
    'Throughput, concurrency, and the model\u2019s rate limits as capacity.'],
  [370, 'Scalability Planning', '370-scalability-planning', 4, 82, [369],
    'The growth path from pilot to enterprise without a rewrite.'],
  [371, 'Security & Compliance (SOC 2, GDPR, HIPAA)', '371-compliance', 4, 86, [320, 325],
    'The frameworks that gate enterprise AI adoption.'],
  [372, 'Data Governance', '372-data-governance', 3, 81, [371],
    'Where data comes from, where it goes, and who decides.'],
  [373, 'AI Governance', '373-ai-governance', 3, 80, [372],
    'Policies, review boards, and accountability for model behavior.'],
  [374, 'Disaster Recovery & Business Continuity', '374-disaster-recovery', 3, 78, [286],
    'RTO, RPO, and the multi-region AI story.'],
  [375, 'Enterprise Integration', '375-enterprise-integration', 3, 80, [359],
    'Connecting AI to the systems the business already runs.'],
  [376, 'Legacy System Integration', '376-legacy-integration', 3, 77, [375],
    'The COBOL-era database, the old CRM, and the bridge to AI.'],
  [377, 'Multi-Cloud Concepts', '377-multi-cloud', 3, 74, [366],
    'Portability, fallback, and when multi-cloud is the wrong answer.'],
  [378, 'AI Platform Architecture', '378-ai-platform-architecture', 4, 85, [370, 375],
    'The internal platform: shared services, guardrails, and self-service.'],
  [379, 'Enterprise AI Case Study', '379-enterprise-case-study', 4, 83, [378],
    'A full requirement-to-architecture walkthrough in one lesson.'],
  [380, "The Architect's Toolkit (synthesis)", '380-architects-toolkit', 3, 84, [361, 368, 373],
    'The deliverables: ADRs, diagrams, cost models, and the decision rule.'],
]);

/* ------------------------------------------------------------------ */
/* Module 19 — Capstone Projects                                       */
/* ------------------------------------------------------------------ */

const capstones = rows([
  [381, 'Project 1 — Production RAG SaaS', '381-rag-saas', 5, 86, [197, 357],
    'A multi-tenant knowledge platform from schema to evaluation.'],
  [382, 'Project 2 — AI Agent with Tools + Human Approval', '382-agent-hittl', 5, 88, [216, 324],
    'A guarded, audited, approval-gated agent end to end.'],
  [383, 'Project 3 — AI Business Automation Platform', '383-automation-platform', 5, 84, [230, 356],
    'Workflows, integrations, and approval gates as a shippable product.'],
  [384, 'Project 4 — Multi-Tenant AI SaaS', '384-ai-saas', 5, 90, [357, 371],
    'The full SaaS: tenants, billing, isolation, compliance.'],
  [385, 'Project 5 — Enterprise AI Assistant', '385-enterprise-assistant', 5, 87, [378, 379],
    'SSO, RBAC, audit, and grounding inside the enterprise firewall.'],
  [386, 'Project 6 — Complete AI Solutions Architecture Case Study', '386-architecture-case-study', 5, 89, [380, 384],
    'The capstone of the capstones: one end-to-end design, documented.'],
]);

/* ------------------------------------------------------------------ */

export type Accent =
  | 'amber'
  | 'sky'
  | 'cyan'
  | 'violet'
  | 'emerald'
  | 'red'
  | 'lime'
  | 'teal'
  | 'indigo'
  | 'fuchsia'
  | 'orange'
  | 'pink'
  | 'slate'
  | 'blue'
  | 'green'
  | 'purple'
  | 'rose'
  | 'copper'
  | 'steel';

export type Milestone = {
  id: string;
  title: string;
  range: [number, number];
  claimWhen: string;
};

export type ModuleDef = {
  slug: string;
  dir: string;
  num: number;
  title: string;
  short: string;
  blurb: string;
  accent: Accent;
  milestones: Milestone[];
  lessons: LessonRef[];
};

export const MODULES: ModuleDef[] = [
  {
    slug: 'javascript',
    dir: '01-javascript',
    num: 1,
    title: 'JavaScript Foundations',
    short: 'JavaScript',
    blurb:
      'Almost every "React bug" is a JavaScript bug in a React costume. This module is where the real leverage is.',
    accent: 'amber',
    lessons: js,
    milestones: [
      { id: 'M1', title: 'Core Mechanics', range: [1, 10], claimWhen: 'You can explain hoisting, TDZ and closures on a whiteboard without notes.' },
      { id: 'M2', title: 'Data & Functions', range: [11, 20], claimWhen: 'You can implement map, filter, reduce, debounce and curry from scratch.' },
      { id: 'M3', title: 'Async JavaScript', range: [21, 28], claimWhen: 'You can predict the exact output order of any event-loop puzzle.' },
    ],
  },
  {
    slug: 'typescript',
    dir: '02-typescript',
    num: 2,
    title: 'TypeScript',
    short: 'TypeScript',
    blurb:
      'Types are not paperwork. They are a second program that checks the first one while you write it.',
    accent: 'sky',
    lessons: ts,
    milestones: [
      { id: 'M4', title: 'Type System Fluency', range: [29, 38], claimWhen: 'You can model any API response with unions, generics and narrowing.' },
      { id: 'M5', title: 'Type-Level Programming', range: [39, 46], claimWhen: 'You can write a conditional + mapped type using infer, unaided.' },
    ],
  },
  {
    slug: 'react',
    dir: '03-react',
    num: 3,
    title: 'React',
    short: 'React',
    blurb:
      'React is a small idea — UI = f(state) — surrounded by a large amount of consequence. We cover the consequence.',
    accent: 'cyan',
    lessons: react,
    milestones: [
      { id: 'M6', title: 'React Fundamentals', range: [47, 56], claimWhen: 'You can build a controlled form and list UI with zero re-render bugs.' },
      { id: 'M7', title: 'Hooks Mastery', range: [57, 66], claimWhen: "You can explain every hook's cleanup and dependency semantics." },
      { id: 'M8', title: 'Performance & Patterns', range: [67, 76], claimWhen: 'You can say when NOT to optimize, and prove it with a profile.' },
      { id: 'M9', title: 'State Management', range: [77, 82], claimWhen: 'You can justify local vs global vs server state for any feature.' },
    ],
  },
  {
    slug: 'nextjs',
    dir: '04-nextjs',
    num: 4,
    title: 'Next.js',
    short: 'Next.js',
    blurb:
      'The App Router is mostly one question: where does this code run, and when? Everything else follows.',
    accent: 'violet',
    lessons: next,
    milestones: [
      { id: 'M10', title: 'App Router', range: [83, 96], claimWhen: 'You can trace the render and cache path of a single request end to end.' },
    ],
  },
  {
    slug: 'interview-prep',
    dir: '05-interview-prep',
    num: 5,
    title: 'Interview Preparation',
    short: 'Interview',
    blurb:
      'Knowing the answer and being able to say it under pressure are different skills. This module trains the second.',
    accent: 'emerald',
    lessons: prep,
    milestones: [
      { id: 'M11', title: 'Production Concerns', range: [97, 102], claimWhen: 'Auth, forms, testing, a11y and error boundaries — shipped, not just read.' },
      { id: 'M12', title: 'Interview Ready', range: [103, 104], claimWhen: 'Three portfolio projects plus clean mock interviews.' },
    ],
  },
  {
    slug: 'laravel',
    dir: '06-laravel',
    num: 6,
    title: 'Laravel',
    short: 'Laravel',
    blurb:
      'Backend interviews are won on the request lifecycle, the container, and Eloquent — and lost on N+1 and silent failures.',
    accent: 'red',
    lessons: laravel,
    milestones: [
      { id: 'M13', title: 'Laravel Fundamentals', range: [105, 110], claimWhen: 'You can trace a request from public/index.php to a response and explain where the container, providers, facades and contracts fit.' },
      { id: 'M14', title: 'Routing & Request Handling', range: [111, 114], claimWhen: 'You can map any URL to its controller through middleware, model binding and form requests — and explain why controllers stay thin.' },
      { id: 'M15', title: 'Eloquent & the Database', range: [115, 121], claimWhen: 'You can model any relationship, kill N+1 with eager loading, and design a schema with migrations and transactions.' },
      { id: 'M16', title: 'Auth, Queues & Async', range: [122, 129], claimWhen: 'You can explain auth vs authorization, why queues exist, how caching invalidation works, and the full test pyramid.' },
      { id: 'M17', title: 'Senior & Full-Stack', range: [130, 134], claimWhen: 'You can answer the senior scenarios — slow API, overselling, dead Redis, broken deploy, leaking tenants — with a decision rule, not a guess.' },
    ],
  },
  {
    slug: 'ai-foundations',
    dir: '07-ai-foundations',
    num: 7,
    title: 'AI & LLM Foundations',
    short: 'AI Foundations',
    blurb:
      'Everything about an AI product is downstream of one fact: a language model predicts the next token. This module makes that fact — and its consequences for cost, latency and reliability — second nature.',
    accent: 'lime',
    lessons: aiFoundations,
    milestones: [
      { id: 'M18', title: 'AI & LLM Foundations', range: [135, 157], claimWhen: 'You can classify any model, budget tokens, and pick a provider with a decision rule.' },
    ],
  },
  {
    slug: 'ai-app-engineering',
    dir: '08-ai-app-engineering',
    num: 8,
    title: 'AI Application Engineering',
    short: 'AI Apps',
    blurb:
      'The step between "I can call an API" and "I ship an AI product": streaming, tools, state, memory, retries and caching — the patterns every production LLM app shares.',
    accent: 'teal',
    lessons: aiApp,
    milestones: [
      { id: 'M19', title: 'AI Application Engineering', range: [158, 173], claimWhen: 'You can build a streaming, tool-calling AI app with the Vercel AI SDK.' },
    ],
  },
  {
    slug: 'rag-knowledge',
    dir: '09-rag-knowledge',
    num: 9,
    title: 'RAG / Knowledge Systems',
    short: 'RAG',
    blurb:
      'Grounding the model in your data is the difference between a demo and a product. Ingestion, chunking, vectors, retrieval, reranking — and the evaluation that tells you it works.',
    accent: 'indigo',
    lessons: rag,
    milestones: [
      { id: 'M20', title: 'RAG / Knowledge Systems', range: [174, 197], claimWhen: 'You can design an ingestion → retrieval → synthesis pipeline and evaluate it.' },
    ],
  },
  {
    slug: 'ai-agents',
    dir: '10-ai-agents',
    num: 10,
    title: 'AI Agents',
    short: 'Agents',
    blurb:
      'An agent is a loop with tools. The architecture is the loop — perception, decision, action, observation — and everything else is the discipline that keeps it safe, bounded and observable.',
    accent: 'fuchsia',
    lessons: agents,
    milestones: [
      { id: 'M21', title: 'AI Agents', range: [198, 216], claimWhen: 'You can build a guarded, observable agent loop with tools and human-in-the-loop.' },
    ],
  },
  {
    slug: 'ai-automation',
    dir: '11-ai-automation',
    num: 11,
    title: 'AI Automation',
    short: 'Automation',
    blurb:
      'Where AI earns its keep: workflows that touch the CRM, the inbox, the database and the API layer — with queues, approval gates and a recovery story.',
    accent: 'orange',
    lessons: automation,
    milestones: [
      { id: 'M22', title: 'AI Automation', range: [217, 232], claimWhen: 'You can turn a business process into an event-driven AI workflow.' },
    ],
  },
  {
    slug: 'backend-ai',
    dir: '12-backend-ai',
    num: 12,
    title: 'Backend & Distributed Systems for AI',
    short: 'Backend',
    blurb:
      'The model is the easiest part of the backend. Auth, rate limits, queues, caching, streaming transport and fault tolerance are what make an AI product a platform.',
    accent: 'pink',
    lessons: backendAi,
    milestones: [
      { id: 'M23', title: 'Backend & Distributed Systems', range: [233, 260], claimWhen: 'You can design the async, fault-tolerant backend of an AI SaaS.' },
    ],
  },
  {
    slug: 'cloud-aws-ai',
    dir: '13-cloud-aws-ai',
    num: 13,
    title: 'Cloud & AWS for AI',
    short: 'Cloud & AWS',
    blurb:
      'IAM, Lambda, Bedrock, SQS, Step Functions — the AWS vocabulary an AI architect is expected to design in, and the cost controls that keep the bill sane.',
    accent: 'slate',
    lessons: cloudAws,
    milestones: [
      { id: 'M24', title: 'Cloud & AWS for AI', range: [261, 287], claimWhen: 'You can deploy a Bedrock + Lambda + pgvector AI stack with cost controls.' },
    ],
  },
  {
    slug: 'docker-devops-ai',
    dir: '14-docker-devops-ai',
    num: 14,
    title: 'Docker / DevOps / Infrastructure',
    short: 'DevOps',
    blurb:
      'The pipeline that ships an AI service: containers, CI/CD, IaC, canaries and rollbacks — enough Kubernetes to speak the language, not to run the cluster.',
    accent: 'blue',
    lessons: devops,
    milestones: [
      { id: 'M25', title: 'Docker / DevOps / Infrastructure', range: [288, 307], claimWhen: 'You can ship an AI service through CI/CD with rollbacks.' },
    ],
  },
  {
    slug: 'ai-security',
    dir: '15-ai-security',
    num: 15,
    title: 'AI Security',
    short: 'AI Security',
    blurb:
      'Prompt injection, excessive agency, poisoned knowledge bases — the AI attack surface is new, and the OWASP LLM Top 10 is the map. This module is the defense in depth.',
    accent: 'green',
    lessons: aiSecurity,
    milestones: [
      { id: 'M26', title: 'AI Security', range: [308, 327], claimWhen: 'You can threat-model an LLM app and close the OWASP LLM Top 10.' },
    ],
  },
  {
    slug: 'ai-observability',
    dir: '16-ai-observability',
    num: 16,
    title: 'AI Observability & Evaluation',
    short: 'Observability',
    blurb:
      'You cannot improve what you cannot measure. Tracing, token metering, cost attribution, groundedness checks and the eval suite that runs in CI like tests do.',
    accent: 'purple',
    lessons: observability,
    milestones: [
      { id: 'M27', title: 'AI Observability & Evaluation', range: [328, 346], claimWhen: 'You can detect regressions and ground an eval dataset in CI.' },
    ],
  },
  {
    slug: 'ai-system-design',
    dir: '17-ai-system-design',
    num: 17,
    title: 'AI System Design',
    short: 'System Design',
    blurb:
      'The round that decides the architect: run any AI prompt — chat, RAG platform, support, sales, recruiting, coding assistant — through one repeatable protocol.',
    accent: 'rose',
    lessons: aiSystemDesign,
    milestones: [
      { id: 'M28', title: 'AI System Design', range: [347, 358], claimWhen: 'You can run any AI system-design prompt through the 4-phase spine.' },
    ],
  },
  {
    slug: 'enterprise-ai',
    dir: '18-enterprise-ai',
    num: 18,
    title: 'Enterprise AI Solutions Architecture',
    short: 'Enterprise',
    blurb:
      'The architect half of the role: requirements, stakeholders, ADRs, build vs buy, cost models, governance and compliance — the deliverables that are not code.',
    accent: 'copper',
    lessons: enterpriseAi,
    milestones: [
      { id: 'M29', title: 'Enterprise AI Solutions Architecture', range: [359, 380], claimWhen: 'You can take a business requirement to an ADR and a costed architecture.' },
    ],
  },
  {
    slug: 'ai-capstones',
    dir: '19-ai-capstones',
    num: 19,
    title: 'Capstone Projects',
    short: 'Capstones',
    blurb:
      'Six production-grade projects — a RAG SaaS, a guarded agent, an automation platform, a multi-tenant AI SaaS, an enterprise assistant and one complete case study. Serious projects, not toy chatbots.',
    accent: 'steel',
    lessons: capstones,
    milestones: [
      { id: 'M30', title: 'Capstone Projects', range: [381, 386], claimWhen: 'Six production-grade projects plus a complete architecture case study.' },
    ],
  },
];

export const TOTAL_LESSONS = MODULES.reduce((s, m) => s + m.lessons.length, 0);

export const LESSON_INDEX = MODULES.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, module: m })),
).sort((a, b) => a.n - b.n);

export type IndexedLesson = (typeof LESSON_INDEX)[number];

export const BY_N = new Map(LESSON_INDEX.map((l) => [l.n, l]));

export const ALL_MILESTONES = MODULES.flatMap((m) =>
  m.milestones.map((ms) => ({ ...ms, module: m })),
);

export function milestoneFor(n: number) {
  return ALL_MILESTONES.find((ms) => n >= ms.range[0] && n <= ms.range[1]);
}

export function lessonHref(moduleSlug: string, file: string) {
  return `/lessons/${moduleSlug}/${file}`;
}

export function hrefOf(l: { module: { slug: string }; file: string }) {
  return lessonHref(l.module.slug, l.file);
}

/** Lessons that list `n` as a prerequisite — "what this unlocks". */
export function unlockedBy(n: number): IndexedLesson[] {
  return LESSON_INDEX.filter((l) => l.prereqs.includes(n));
}

export const DIFFICULTY_LABEL = ['', 'Gentle', 'Easy', 'Moderate', 'Hard', 'Deep'];

/** Rough minutes, used before a lesson is written (real value comes from word count). */
export function estimateMinutes(l: LessonRef) {
  return 6 + l.difficulty * 3;
}

/* Search synonyms so "state hook" finds useState. */
export const SYNONYMS: Record<string, string[]> = {
  usestate: ['state', 'state hook', 'react state', 'setstate'],
  useeffect: ['effect', 'side effect', 'lifecycle', 'componentdidmount'],
  usememo: ['memo', 'memoize', 'cache value', 'expensive computation'],
  usecallback: ['callback', 'memoize function', 'stable reference'],
  useref: ['ref', 'dom ref', 'mutable', 'instance variable'],
  usecontext: ['context', 'provider', 'prop drilling'],
  usereducer: ['reducer', 'dispatch', 'action'],
  closures: ['closure', 'lexical scope', 'stale closure', 'counter'],
  'the event loop': ['event loop', 'async', 'concurrency', 'non blocking'],
  'microtasks vs macrotasks': ['microtask', 'macrotask', 'task queue', 'output order'],
  'debounce & throttle': ['debounce', 'throttle', 'rate limit', 'search input'],
  'server components': ['rsc', 'react server components', 'use server', 'zero js'],
  'client components': ['use client', 'interactivity', 'hydration'],
  'revalidation, isr, ssr & ssg': ['ssr', 'ssg', 'isr', 'static', 'rendering strategy'],
  'lists & keys': ['key prop', 'keys', 'index key', 'reconciliation list'],
  'the virtual dom': ['vdom', 'virtual dom', 'diffing'],
  'rendering & reconciliation': ['reconciliation', 'diffing', 're-render', 'fiber'],
  generics: ['generic', 'type parameter', 't extends'],
  'utility types': ['partial', 'pick', 'omit', 'record', 'returntype'],
  'discriminated unions': ['tagged union', 'variant', 'kind'],
  'unknown vs any vs never': ['unknown', 'any', 'never', 'top type'],
  'primitive vs reference types': ['reference', 'pass by reference', 'shallow copy', 'equality'],
  'coercion, truthy/falsy & equality': ['==', '===', 'coercion', 'falsy', 'truthy'],
  hoisting: ['hoist', 'temporal dead zone', 'undefined'],
  'variables: var, let, const': ['var', 'let', 'const', 'declaration'],
  'react.memo': ['memo', 'pure component', 'shallow compare'],
  'error boundaries': ['error boundary', 'componentdidcatch', 'fallback ui'],
  caching: ['cache', 'revalidate', 'stale', 'fetch cache'],
};
