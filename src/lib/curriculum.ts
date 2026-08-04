/**
 * The curriculum, as data.
 *
 * Every lesson is a node in a knowledge graph: it has prerequisites, a
 * difficulty, an interview-frequency score and a reason to care. The graph
 * view, the dashboard stats and the "why this matters" panels are all
 * projections of this one table — nothing is duplicated.
 *
 * Tuple format keeps 104 rows readable:
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

export type Accent = 'amber' | 'sky' | 'cyan' | 'violet' | 'emerald';

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
