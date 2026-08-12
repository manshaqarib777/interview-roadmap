# Lesson 100 — Top Next.js Interview Questions

**Interview importance:** ⭐⭐⭐⭐⭐ — the final rehearsal round: the questions that decide Next.js screens, and the gateway to the coding tasks that follow.

Rehearsal. You have covered server components (Lesson 86), client components (Lesson 87),
the boundary (Lesson 88), caching (Lesson 90), revalidation and the rendering strategies
(Lesson 91). Knowing these and saying them under pressure are different skills — this
lesson is where you practise the second one.

Next.js interviews are the most architecture-heavy of the four rounds. Every question is
really one question in disguise: *where does this code run, and when?* Answer that once,
and most of this lesson becomes obvious. Say every answer out loud.

## Learning Objectives

By the end of this lesson you should be able to:

- Answer the top Next.js interview questions out loud, from memory
- Explain where code runs — server, client, or build time — for any feature you are asked about
- Draw the server/client boundary and name what crosses it and what cannot
- Explain the caching layers and how revalidation updates them
- Contrast SSR, SSG, ISR and client-side rendering with trade-offs, not acronyms
- Rehearse the harder follow-ups so no question in the round feels like a surprise

## 1. One-line Definition

**This is a rehearsal round: the most-asked Next.js interview questions from Lessons 83–96, with model answers worth saying out loud.**

The App Router is mostly one question — where does this code run, and when? — and this lesson rehearses every phrasing of it.

## 2. Mental Model

Think of this lesson as the **final mock exam** before the interview itself.

The earlier lessons built the model: what a Server Component is, how the boundary works,
what the cache layers hold. This lesson is the mock — the exact questions, timed, out
loud. The questions look like they are about ten different features. They are all one
question about code placement.

## 3. Visual Flow

```text
The rehearsal loop — do this for every question:
                                      ┌──────────────────────┐
                                      │                      ▼
  ┌────────────┐      ┌────────────┐  │   ┌──────────────────────────┐
  │  Read the  │ ───▶ │  Say your  │──┘   │  Compare with the model  │
  │  question  │      │  answer    │      │  answer — mark the gap   │
  └────────────┘      └────────────┘      └────────────┬─────────────┘
      (cover the answer)     (out loud)                │
                                                       ▼
                                        ┌──────────────────────────┐
                                        │  Re-say the answer       │
                                        │  until it is clean and   │
                                        │  complete — then move on │
                                        └──────────────────────────┘
```

If you cannot say it cleanly twice in a row, you have not finished the question.

## 4. How It Works

The questions map onto the module's path, and they all reduce to the same core:

| Theme | Questions | From lessons |
|---|---|---|
| Where code runs | server vs client components, the boundary | 86, 87, 88 |
| When code runs | data fetching, loading/error UI | 89 |
| Caching | the cache layers, revalidation, ISR/SSG/SSR | 90, 91 |
| The App Router | layouts, dynamic routes, route groups | 84, 85, 83 |
| Mutations & control | server actions, route handlers, middleware | 93, 92, 94 |

The unifying question — *where does this code run, and when?* — breaks each feature into
place (server or client) and time (build, request, or after hydration).

### The Next.js answer shape

```text
1. DIRECT   — where the code runs, and when
2. WHY      — the mechanism (the boundary, the cache, the build step)
3. EVIDENCE — a concrete trade-off or example
4. BRIDGE   — what it means for a real app you have built

"A Server Component renders on the server — at build time for static routes, per
 request for dynamic ones. It can read the database and the filesystem directly,
 and it ships zero JavaScript to the browser. I use it as the default: the client
 only gets involved where a component actually needs state, effects or events."
```

## 5. Real Project Usage

These answers are the decisions you make in every App Router codebase:

| Question being asked | Where you decide it at work |
|---|---|
| "Server or client component?" | Every new component, and why you reach for `'use client'` |
| "Why did my import break the build?" | Passing a server-only value across the boundary |
| "How do you revalidate?" | A CMS page that must update without a redeploy |
| "ISR vs SSR for this page?" | The pricing page vs the dashboard, at every architecture review |
| "Why is data duplicated?" | The same fetch in two components, and what the cache does about it |
| "Server action or route handler?" | Every mutation you add — forms, buttons, API consumers |

## 6. Interview Explanation

> Next.js interviews ask where code runs and when. Server Components render on the server —
> at build time or per request — and ship no client JS; Client Components render on the
> client and opt in with `'use client'`. The boundary is where props cross: only
> serialisable data can pass from server to client, and server-only imports never enter the
> client bundle. The cache keeps rendered output, data and route segments fresh across
> requests, and revalidation (time-based, on-demand, or dynamic) decides when they are
> rebuilt. The rendering strategies — SSR, SSG, ISR — are the same pipeline configured at
> different points, chosen by trade-off, not acronym.

## 7. Senior-Level Insights

- **Start from the model, not the docs.** "This page is static until auth, then per-request" shows you understand *why* the placement matters, which is the entire App Router interview.
- **Name the cache layers.** Saying "Next caches at four levels — the full route, the data, the router cache, and the fetch cache — and revalidation targets them from different sides" is the answer that separates senior from candidate.
- **Draw the boundary from a failure.** "The reason the build broke is that I passed a server-only module into a client component — the boundary only lets serialisable values cross" turns a bug you hit into the interview answer.
- **Give trade-offs with real numbers.** "SSG for the marketing pages — they change a few times a week, so ISR with an hour's revalidate; SSR for the dashboard — it is per-user and per-request by definition." Concrete placement beats abstract preference.
- **When you do not know, say what you do know** — and how you would verify it.

## 8. Common Mistakes

- **Calling `'use client'` "a client-side app".** It marks a boundary — the file and its
  imports render on the client. Everything above it on the server is still a Server
  Component.
- **Confusing rendering strategies with the cache.** SSG, SSR and ISR describe *when* a
  route is rendered; the cache decides *how long that output is reused*. They are different
  axes.
- **Passing non-serialisable values across the boundary.** Functions, `Date` instances,
  class instances and `Map`/`Set` cannot cross from server to client — the build breaks or
  the value arrives wrong.
- **"Server Actions replace everything."** They are for mutations. Route handlers still own
  webhooks, public APIs and non-form clients.
- **Treating middleware as an auth oracle.** It runs on the edge and does not see your
  session store or database the way a Server Component does — it is a fast gate, not the
  whole security story.
- **Not saying "where and when" first.** Every answer that starts with a feature name
  instead of a placement is a half-answer.

## 9. Best Practices

✅ Make Server Components the default — client JS is opt-in, not automatic

✅ Keep the client tree small: put `'use client'` at the leaf that needs interactivity, and pass serialisable props across the boundary

✅ Fetch where the data is needed; share the cache by fetching the same URL — deduplication is built in

✅ Choose the rendering strategy by trade-off: how often the data changes, how personalised it is, how fast the first paint must be

✅ Prefer server actions for app-internal mutations; use route handlers for webhooks and public APIs

✅ Use middleware for fast, coarse gates (auth redirects, geolocation, A/B tests) — not as the only security layer

❌ Don't fetch in a client component when a server component could do it — you lose the server round trip and add client JS

❌ Don't put secrets in `NEXT_PUBLIC_` variables or client components

❌ Don't memoise data fetches by hand — the server fetch cache and router cache already deduplicate

## 10. Interview Questions

**Q1. What is the difference between a Server Component and a Client Component?**

> A Server Component renders on the server — at build time for static routes, per request
> for dynamic ones. It can read the database, the filesystem and server-only modules
> directly, and it ships zero client JavaScript. A Client Component renders on the client
> — it opts in with `'use client'` at the top of the file and can use state, effects and
> event handlers. The mental rule: server by default, client only where interactivity
> demands it.

**Q2. What does `'use client'` actually do?**

> It marks a boundary, not a mode. The file and everything it imports become part of the
> client bundle and render on the client. It does not turn the app into a client-side app —
> components above the boundary still run on the server, and a client component can still
> be rendered from a server component, with its props passed across as serialisable data.

**Q3. What is the server/client boundary?**

> The line where values pass from the server to the client. Only serialisable data can
> cross — primitives, plain objects, arrays, `Date` (in supported cases), and
> React elements. Functions, class instances, `Map`/`Set` and server-only modules cannot
> cross, which is exactly why the build breaks when you pass one. The boundary is also a
> bundle fact: everything below it ships to the browser.

**Q4. Why did my import break the build?**

> Almost always because a server-only value or module crossed the boundary. Either a client
> component imported a module that uses Node APIs or a server-only package, or a
> non-serialisable value — a function, a class instance, a `Map` — was passed as a prop
> from a server component to a client one. The fix is moving the import below the boundary
> or serialising the value before it crosses.

**Q5. How do you fetch data in the App Router?**

> By default in a Server Component — `await fetch(url)` (or the database directly) at the
> top level of the component. The server does the round trip, and the result is part of the
> rendered output, so the client never sees the loading state. For client-side interactivity,
> fetch in a client component inside an effect (or a data library like TanStack Query). The
> rule of thumb: fetch where the data is needed, server first.

**Q6. What is the Next.js cache, and what layers does it have?**

> A set of layers that reuse work across requests so the same page or data does not get
> rebuilt every time. There are four: the full-route cache (rendered HTML for static
> routes), the data cache (fetch results, revalidatable), the client-side router cache
> (navigation snapshots in the browser), and the fetch cache (per-request deduplication of
> identical fetches). Revalidation and dynamic rendering decide when each layer is skipped
> or rebuilt.

**Q7. What is revalidation, and how do you do it?**

> Revalidation is refreshing cached data or pages without a full redeploy. Two ways:
> time-based — `revalidate = 3600` (or `next: { revalidate: 3600 }` on a fetch) rebuilds
> in the background when a request finds the entry older than the window; on-demand —
> `revalidatePath('/blog')` or `revalidateTag('posts')` inside a server action or route
> handler purges the cache immediately when data actually changed. Time-based is periodic
> and lazy; on-demand is precise and immediate.

**Q8. What is the difference between SSR, SSG and ISR?**

> Three points on the same render pipeline, chosen by when the page is rendered. SSG renders
> at build time — output is static, cached, served instantly, but goes stale until a rebuild.
> SSR renders per request — always fresh, always per-user, but every request pays a server
> render. ISR is the middle: static output with a revalidation window, rebuilt in the
> background when stale. I choose by how often the data changes and how personalised the
> page is.

**Q9. When would you use ISR over SSR?**

> When the data changes occasionally but not per request, and a small staleness window is
> acceptable — a blog, a pricing page, a product catalogue updated a few times a day. ISR
> gives you the speed of static with scheduled freshness. I use SSR when the page is
> genuinely per-user or per-request — a dashboard, a session-driven view — because there is
> no shared static output to reuse.

**Q10. What are server actions?**

> Functions defined with `'use server'` that run on the server but are callable from the
> client — a form can post directly to a server function instead of an API route. They
> handle the request lifecycle for you, can revalidate the cache, and keep mutations close
> to the data they change. I use them for app-internal mutations — forms, buttons that
> change data. They are not a replacement for route handlers, which still own webhooks,
> public APIs and non-form clients.

**Q11. What is the difference between a server action and a route handler?**

> A server action is a function called from a form or event — the framework serialises the
> call, runs it on the server, and can revalidate and return the result. A route handler is
> an explicit HTTP endpoint in `route.ts` — a `POST /api/…` you could call from anywhere.
> Actions are convenient for app-internal mutations; handlers are the contract for
> everything external — webhooks, third-party clients, cron jobs. I default to actions
> inside the app and handlers at the edges.

**Q12. What is middleware in Next.js?**

> Code in `middleware.ts` that runs on the edge before a request reaches a route — it can
> rewrite, redirect, check headers and short-circuit. The three use cases interviewers
> want: auth gating (redirect unauthenticated users), geo/region handling, and A/B tests.
> The critical limit: it runs at the edge, so it cannot reach your database or session
> store the way a server component can — it is a fast, coarse gate, not the whole security
> layer.

**Q13. What are layouts in the App Router?**

> A `layout.tsx` wraps a route segment and its children and is shared across all pages in
> that segment. The property that drives the design: layouts do **not** re-render on
> navigation between pages inside them — only the page's content swaps. That is why the
> nav, the sidebar and the shell belong in a layout, and why per-page data belongs in the
> page. Nested layouts compose down the route tree.

**Q14. How do dynamic routes work?**

> A folder in square brackets — `app/blog/[slug]/page.tsx` — makes a segment dynamic: the
> page receives `params.slug` and renders per value. Static generation renders the routes
> listed in `generateStaticParams` at build time; anything else renders on demand.
> Dynamic segments and static params together give you ISR-style blogs and catalogues —
> a few dozen known pages built eagerly, the rest generated on first visit.

**Q15. What can cross the server/client boundary, and what cannot?**

> Only serialisable data crosses: primitives, strings, numbers, booleans, plain objects and
> arrays, and serialisable React elements. Functions cannot cross — which is exactly why a
> server function passed to a client component breaks the build — nor can class instances,
> `Map`/`Set`, and anything holding a server-only module. The rule of thumb: if
> `JSON.stringify` cannot represent it, it does not cross. The exception that proves the
> rule: Server Actions, which cross as references and run on the server.

**Q16. How do you handle loading and error states in the App Router?**

> With special files. `loading.tsx` renders a fallback while a segment's server components
> stream in — no client-side loading state needed. `error.tsx` is a client component that
> catches errors in the segment and renders a fallback — the App Router's error boundary.
> Together they mean the framework owns the async states: `loading.tsx` for pending,
> `error.tsx` for failure, the page itself for success.

**Q17. Why would you put a fetch in a client component at all?**

> When the data must be fetched *after* the page has loaded — a search box hitting an API,
> a filter that queries on every change, or data that depends on client-only input. A server
> component fetch is one round trip at page load; a client fetch can re-run on interaction.
> The trade-off to name: client fetching adds client JS and a visible loading state, so I
> only move a fetch to the client when it genuinely must react to client-side input.

**Q18. How do you share data between components without prop drilling?**

> Depends on the kind of data. Server-rendered data is shared by the fetch cache — two
> components fetching the same URL get one request, so "prop drilling" is often unnecessary
> on the server. Client-shared data uses context or a state library. And "co-located" data
> is shared by fetching it in the segment layout, which both pages see without props. The
> first answer interviewers want is the fetch cache — most "how do I share data" questions
> are answered by deduplication, not by state.

**Senior follow-up: Walk through the full render and cache path of a request for an ISR page.**

> First request: the route is rendered at the request time and the output is cached, so
> subsequent requests within the revalidation window are served from the full-route cache —
> no render at all. When a request arrives after the window, the stale page is served
> immediately while a background re-render runs: the data cache is checked, stale fetches
> re-execute, the page is rebuilt, and the cache is refreshed. On-demand revalidation cuts
> in from the other side — `revalidatePath` purges the cache when data changes, so the next
> request renders fresh. The through-line: one request, four cache layers, and revalidation
> decides which layer wins.

## 11. Follow-up Questions

**Why is the router cache different from the data cache?**

> They live in different places and answer different questions. The data cache is server-side
> and persists rendered and fetched data across requests — it is shared by every user. The
> router cache is client-side, in the browser's memory, and holds recent route snapshots so
> back/forward navigation is instant — it is per-user and per-session. One is "reuse the
> server's work", the other is "skip the network on navigation".

**How do you keep a page dynamic in the App Router?**

> Make it depend on something the server can only know at request time: `cookies()`,
> `headers()`, searchParams, or a call to a dynamic API. When Next sees that dependency, it
> treats the route as dynamic — rendered per request, and the full-route cache is skipped
> for it. `export const dynamic = 'force-dynamic'` is the explicit version for the rare
> case where the dependency is not visible to the compiler.

**How do you handle authentication in Next.js?**

> In layers. Middleware does the fast gate — if there is no session cookie, redirect to
> login before the route renders. The page or layout reads the actual session with
> `cookies()` or an auth library and renders accordingly. The error boundaries catch the
> "session expired mid-use" case. The senior point: middleware decides *whether* the request
> proceeds; the server component decides *what* to render — two jobs, two layers, and
> security lives in the second one.

## 12. Comparison Table

| | Server Component | Client Component |
|---|---|---|
| Renders | On the server (build/request) | On the client |
| Client JS shipped | None | Yes |
| Can use hooks/events | ❌ | ✅ |
| Can read DB/filesystem | ✅ | ❌ |
| Default | ✅ | Opt-in via `'use client'` |

| | SSG | ISR | SSR |
|---|---|---|---|
| Rendered | At build | Build + background re-render | Per request |
| Freshness | Until rebuild | Within the revalidate window | Always |
| Speed | Fastest | Fast, stale-while-revalidate | Slowest |
| Best for | Truly static pages | Occasionally-changing content | Per-user views |

| | Server Action | Route Handler |
|---|---|---|
| Interface | A function called from the client | An HTTP endpoint (`route.ts`) |
| Best for | App-internal mutations, forms | Webhooks, public APIs, cron |
| Can revalidate | ✅ | ✅ |
| External callers | ❌ | ✅ |

## 13. Code Example

The boundary gauntlet. Cover the answers, then read on.

```tsx
// app/products/page.tsx  (Server Component — default)
import { getProducts } from '@/lib/products';

export const revalidate = 3600;               // ISR: rebuild in background every hour

export default async function Products() {
  const products = await getProducts();       // runs on the server

  return (
    <main>
      <h1>Products</h1>
      <ProductList products={products} />     // serialisable data crosses the boundary
    </main>
  );
}
```

```text
request 1          → rendered on the server, output cached
requests 2..N      → served from the full-route cache (no render)
after 1 hour       → stale page served, background re-render, cache refreshed
```

```narrate
1: default — this file renders on the server
4: the ISR revalidation window — the whole route's trade-off in one line
6: server-side data access — database, filesystem, no client round trip
9: props cross the boundary — but only serialisable values
```

And the mutation side:

```tsx
'use server';

import { revalidatePath } from 'next/cache';

export async function renameProduct(id: string, name: string) {
  await db.products.update({ id, name });
  revalidatePath('/products');                // purge the cache — next request is fresh
}
```

```text
form submit → server action runs on the server → db updated
            → revalidatePath purges the route cache
            → the next /products request renders fresh data
```

The first file shows *where and when*: server at build/request, cached for an hour. The
second shows the mutation loop: server action updates data, then revalidates the cache the
page was served from.

## 14. Performance Notes

- **Rehearsal cost is time, and it is the cheapest investment in the module.** Ten minutes
  out loud per question beats an hour re-reading definitions silently.
- **The bottleneck is retrieval and phrasing, not knowledge.** Practise saying the answers.
- **The biggest Next.js performance lever is placement.** A Server Component removes a
  client round trip and the JS for it; moving a fetch from client to server removes a
  loading state and a request. Naming that order — placement, then caching, then
  micro-optimisations — is a senior signal.
- **The cache is free wins if you understand revalidation.** The fetch cache and router
  cache deduplicate and replay work you would otherwise repeat; the cost is staleness, which
  revalidation manages. Getting the *staleness trade-off* right matters more than any
  bundle-size tweak.

## 15. Debugging Scenarios

**Scenario 1: "My client component throws 'only plain objects can be passed' — or the build fails."**

A non-serialisable value crossed the boundary: a function, a `Date` in a props object, a
`Map`, or a server-only import below the `'use client'` line. Trace the prop that crosses,
serialise it (or move the computation above the boundary), and confirm nothing server-only
is imported in the client subtree.

**Scenario 2: "My ISR page shows stale data."**

Check which cache layer is serving you: the route was cached before the data changed, the
revalidate window has not elapsed, or the fetch itself is cached without a revalidate tag.
The fix is precise: `revalidatePath`/`revalidateTag` on-demand after the write, or a shorter
window — and verify by hitting the page after purging, not by assuming.

**Scenario 3: "My page is static when I need it dynamic."**

Something is forcing static rendering — no request-time dependency, or an explicit
`force-static`. Add the dynamic dependency (`cookies()`, `headers()`, searchParams) or set
`dynamic = 'force-dynamic'` for the route. Then check the build output — it prints whether
each route is static or dynamic, which is the fastest diagnosis.

**Scenario 4: "A form submits but the data never appears."**

The server action ran, but the cache still holds the old page. Almost always a missing
`revalidatePath` after the write. The revalidate call is the other half of every mutation
in the App Router — update the data, then tell the cache.

## 16. Quick Revision Notes

- One question underneath everything: *where does this code run, and when?*
- Server Components render on the server, ship no JS; `'use client'` marks a boundary, not a mode
- Only serialisable values cross the boundary — functions and server modules break the build
- Data fetching defaults to server components; client fetching only when input is client-side
- Four cache layers: full-route, data, router (client), fetch dedupe
- Revalidation: time-based (`revalidate`) or on-demand (`revalidatePath`/`revalidateTag`)
- SSG = build, SSR = per request, ISR = static + background rebuild — trade-offs, not acronyms
- Server actions: `'use server'` functions called from the client, with revalidation built in
- Route handlers: HTTP endpoints for webhooks, APIs and external callers
- Middleware: fast edge gate — auth redirects, geo, A/B — not the whole security layer
- Layouts do not re-render on navigation; dynamic routes via `[slug]` + `generateStaticParams`
- `loading.tsx` and `error.tsx` own the async states of a segment

## 17. Cheat Sheet

```text
ANSWER SHAPE:  where? → when? → why? → trade-off

PLACEMENT:     Server by default
               'use client' only where interactivity lives
               boundary: JSON-serialisable values only

CACHE:         full-route · data · router (client) · fetch-dedupe
REVALIDATE:    revalidate = 3600          (time-based, lazy)
               revalidatePath('/x')       (on-demand, immediate)

STRATEGIES:    SSG = build time   ·  SSR = per request   ·  ISR = static + window

MUTATIONS:     server actions inside the app · route handlers at the edges
MIDDLEWARE:    edge gate: auth, geo, A/B — never the only security layer
```

## 18. Key Takeaways

> [!RECAP]
> - This is rehearsal: the App Router model is revision; the new skill is saying the answers out loud
> - Every question is one question: where does this code run, and when?
> - Server Components are the default; `'use client'` marks a boundary, and only serialisable values cross it
> - Data fetching lives on the server by default; the cache shares the work across requests
> - Revalidation is the other half of every write: time-based or on-demand
> - SSG, SSR and ISR are the same pipeline at different points — choose by trade-off
> - Server actions for internal mutations; route handlers for the edges; middleware as a fast gate
> - If you cannot say an answer cleanly twice, you have not finished the question

## Check your understanding

Answer these without looking back.

1. Where does a Server Component run, and what does it ship to the browser?
2. What does `'use client'` mark — and what does it not do?
3. Give three things that cannot cross the server/client boundary, and why.
4. Name the four cache layers, and which one lives in the browser.
5. `revalidate = 3600` vs `revalidatePath('/x')` — what changes between the two?
6. When would you choose ISR over SSR, concretely?
7. Server action vs route handler — which do you reach for, and when?
8. Why do layouts not re-render on navigation, and what belongs in them?

## What's Next

**Lesson 101 — Common Coding Tasks.** The rehearsal rounds are done; now you build.
Debounced search, infinite scroll, a modal, tabs and a toast — each one a small,
shippable project you should be able to build without looking anything up.
