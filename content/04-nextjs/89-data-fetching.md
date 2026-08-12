# Lesson 89 — Data Fetching

**Interview importance:** ⭐⭐⭐⭐⭐ — the "where do I put the fetch?" question comes up in every Next.js interview.

The single decision that shapes a Next.js app is where the fetch happens: in a Server
Component, where it runs on the server and the response ships in the HTML payload, or in a
client hook like TanStack Query, where the browser does the talking. This lesson gives you
the when-and-why for both.

You already know the boundary from Lesson 88 and `async`/`await` from Lesson 25 — this
lesson puts them to work on real data. Lesson 90 turns the caching half of this story into
its own topic.

## Learning Objectives

By the end of this lesson you should be able to:

- Fetch data in an `async` Server Component and explain where the fetch runs
- Explain why the whole chain to the first `"use client"` must stay server-rendered
- Tell a client-side data hook when it's the right call, and name the costs
- Compare Server Component fetching with SWR/TanStack Query in one breath
- Explain what streaming does for your First Byte and First Paint times
- Answer "where do I fetch?" with a decision rule instead of a guess

## 1. One-Line Definition

**Fetching in Next.js means choosing who talks to the network — the server (in a Server
Component) or the browser (in a client hook) — and that choice decides your caching,
loading and payload behaviour.**

## 2. Mental Model

Think of Server Components as **a kitchen staffed by the restaurant**, and client-side data
hooks as **your own groceries**.

You want a meal (a page of data). If the restaurant preps it and hands you a finished plate
(a Server Component rendering the fetched data into HTML), you do zero cooking in your
living room — no extra round trips, no loading spinners. The plate arrives hot.

Fetching in a client hook is buying the groceries yourself and cooking at home: you make a
second trip to the store (a browser request) after the first delivery (the HTML shell), and
you see the kitchen as it cooks (loading states). More control, more visible effort.

A Server Component with `loading.tsx` is the best of both — the plate arrives in courses,
so you start eating before it's fully plated. That's streaming.

## 3. Visual Flow

```text
SERVER COMPONENT FETCH (default):
  request ──▶ server runs the RSC component ──▶ fetch() on the server
       ──▶ render the response into RSC payload + HTML
       ──▶ one network response  ◀── the client did NOTHING

CLIENT HOOK FETCH (SWR / TanStack Query):
  request ──▶ server sends the HTML shell (fast)
       ──▶ browser hydrates
       ──▶ client hook fires fetch() ──▶ loading state ──▶ data renders
       ──▶ two round trips: the shell, then the data
```

## 4. How It Works

A Server Component is just an `async` function that returns JSX. `await` it, and the
response is rendered *before* a byte of HTML leaves the server.

```tsx {5-7}
// app/blog/page.tsx — a Server Component (no "use client")
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 },          // cache for 60s — Lesson 90
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);   // nearest error.tsx
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}
    </main>
  );
}
```

```text
first request:  server does the fetch, renders the <article>s, ships finished HTML
later requests: served from the cache (revalidate: 60) — no fetch at all
```

```narrate
line: "the component is async — await pauses the render until the fetch resolves, then the HTML is built around the data and ships as one response."
line: "revalidate: 60 means the fetch (and thus this page) is cached for 60 seconds — the full story is Lesson 90."
```

> [!NOTE]
> Because the render is the fetch, there is nothing to fetch again in the browser. No
> loading state, no double-fetch, no client bundle for the data. That is the whole pitch.

### The boundary chain

If anything in the tree below needs client interactivity, it gets a `"use client"` marker —
and *everything above that marker stays on the server* (Lesson 88). A common pattern:

```tsx
// app/blog/page.tsx — Server Component: fetch + render
// app/blog/likes.tsx — "use client": interactive, receives fetched data as props
```

```text
page.tsx        (server: fetches posts, renders list)
  └─ PostCard   (server: renders each post)
       └─ LikeButton.tsx   [use client]  ←─ the boundary stops here
```

Props flowing down to a client component are **serialised** — only JSON-safe values cross
(Lesson 88). Fetch the data server-side, pass plain objects down.

## 5. Real Project Usage

| Situation | Default choice | Why |
|---|---|---|
| Public, mostly-read data (blog, docs, catalogue) | Server Component + cached fetch | One round trip, cacheable, best SEO |
| Personalised data keyed by session | Server Component, per-request (`no-store` or cookies) | Data and user are both server-side |
| Data the user mutates constantly | Client hook (TanStack Query / SWR) | Optimistic UI, refetch on focus, local cache |
| Real-time updates (chat, prices, dashboards) | Client hook or websocket | Polling, retry, background refresh |
| Route handlers, webhooks, API calls | `fetch` in a Route Handler (Lesson 92) | The server is the only caller |

A real shape — a page that fetches on the server and passes data to a client list:

```tsx
// app/products/page.tsx  (server)
export default async function ProductsPage() {
  const products = await getProducts();   // cached fetch — Lesson 90

  return <ProductGrid products={products} />;   // client component, props only
}
```

```text
server: fetch products → render page → pass plain objects down
```

```tsx
// app/products/product-grid.tsx  ("use client")
'use client';

export function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');

  return <ul>{products.filter((p) => p.name.includes(filter)).map(/* … */)}</ul>;
}
```

```text
the fetch happens once, on the server
the browser receives finished HTML + a small client component for the filter box
```

## 6. Interview Explanation

> Next.js fetches data in Server Components by default: the component is an async function,
> so I can `await fetch(...)` right in the render, and the server streams back the result
> already rendered. No client fetch, no loading state, no second round trip, and the data
> works with the built-in caching.
>
> I only move to a client hook — TanStack Query or SWR — when the data belongs to the
> browser: live updates, optimistic mutation, or refetch on focus. Server Components killed
> the "fetch-in-`useEffect` boilerplate" for page data, but they didn't replace client
> caching; they moved the split.

## 7. Senior-Level Insights

- **Ask "who owns this data?" before "which hook?"** If the data is shared across users and
  mostly reads, the server owns it. If it's per-user, per-session, or mutating constantly,
  the client owns it. Library choice comes after that answer.
- **Server fetching and client caching are not rivals.** The senior move is layering them:
  Server Component for the initial payload, a client hook for the same resource when it
  needs to stay live. Each owns a different slice of the lifecycle.
- **Fetching in `useEffect` is a smell in Next.js.** With a Server Component available, an
  empty-dep `useEffect` fetch is usually double work (RSC + effect) and always slower
  first paint. Say this — it signals you've built on the App Router, not ported a CRA app.
- **Streaming changes what "loading" means.** You don't need a fetch-in-client spinner for
  page data; a Server Component plus `loading.tsx` and `Suspense` shows the shell instantly
  and streams data as it arrives. First Byte stays fast while the slowest query finishes.
- **Watch out for the cache hiding updates.** A cached Server Component fetch never re-runs
  on the client, so "but I refreshed and it didn't change" is usually cache, not a bug —
  Lesson 90's revalidation is the fix, not a `router.refresh()` hammer.

## 8. Common Mistakes

- **Fetching twice**: a Server Component fetch *and* a client hook for the same data — two
  requests for one value. Pick the owner, pass the result down.
- **`"use client"` on the page, fetch in the component.** The page can't fetch in the
  browser *and* stream; you lose the whole point. Mark the leaf interactive, keep the page
  server.
- **Passing non-serialisable data across the boundary.** A `Date`, a `Map`, or worse a
  function, as props to a client component breaks the build (Lesson 88). Fetch server-side,
  serialise, then pass.
- **Unconditional `no-store`.** Always-fresh sounds right until you serve every request
  with a full backend hit. Default to cached, opt into freshness where it matters.
- **Treating `loading.tsx` as a separate page.** It's a fallback shell shown while the
  parent stream renders — put real skeleton UI in it, not a spinner that flashes.

## 9. Best Practices

✅ Default to fetching in Server Components — one round trip, cacheable, no client bundle

✅ Fetch as high as the boundary allows, then pass serialised props down (Lesson 88)

✅ Cache by default; add `revalidate` or `no-store` only where freshness matters (Lesson 90)

✅ Use `loading.tsx`/`Suspense` so slow queries stream instead of blocking First Byte

✅ Throw on `!res.ok` in the fetch so the nearest `error.tsx` handles failures

❌ Don't fetch the same data in a Server Component *and* a client hook

❌ Don't put `"use client"` on a page just because one button needs state

❌ Don't fetch in `useEffect` when an RSC would do — and can cache — the job

## 10. Interview Questions

**Q1. Where do you fetch data in Next.js — server or client?**

> By default in Server Components: an async component that `await`s `fetch` in its render.
> The server does the request, renders the result into HTML, and the client never refetches.
> I go client-side with a data hook only when the data is inherently browser-owned — live
> updates, optimistic UI, refetch on focus. The question to answer first is who owns the
> data, and the caching story follows from that.

**Q2. How does fetching in a Server Component work?**

> Server Components can be `async`, so I `await fetch()` right in the component body. The
> response is rendered into the RSC payload and HTML on the server and shipped in the single
> initial response — which is why there's no client loading state: there's nothing left for
> the client to fetch. The result is also cacheable by Next.js.

**Q3. Why is fetch-in-`useEffect` a problem here?**

> It's a second network request after the HTML already arrived, so first data paint is
> strictly later than the Server Component version. And with an empty dependency array it
> misses the caching, revalidation and error handling the App Router gives you for free.

**Q4. When would you use TanStack Query or SWR in a Next.js app?**

> When the data needs to live on the client: it changes often, the user mutates it and
> expects optimistic updates, or it should refetch when the tab regains focus. Those hooks
> also give you a client-side cache and background refetching that RSC deliberately doesn't.
> Page-load data stays in the Server Component; live data goes in the hook.

**Q5. What does streaming change about loading UI?**

> The server sends the shell immediately and data as it resolves, so the user sees layout
> before the slowest query finishes. `loading.tsx` shows a fallback while the parent
> streams, and `Suspense` lets me stream per-section. It's why a slow backend query no
> longer has to delay First Paint.

**Senior follow-up: walk through the network traffic for a page that has both a server fetch and a client hook.**

> One request for the page: the server runs the RSC component, does its `fetch`, renders
> HTML, and streams it back. After hydration, the client hook fires its own request for the
> live resource — so exactly two data round trips for the whole page: one owned by the
> server, one owned by the browser. If I need just one, I move the live resource into the
> server fetch with a short `revalidate` instead.

## 11. Follow-up Questions

**Can a Server Component call a third-party SDK instead of `fetch`? What's cached then?**

> Yes — an SDK call is just a normal await. But only `fetch` gets Next.js's built-in Data
> Cache (Lesson 90); raw SDK calls return fresh data every render unless I wrap them with
> `unstable_cache`. That's a favourite trap: "my fetch is cached, why isn't my Prisma
> call?"

**How do you handle a fetch that fails inside a Server Component?**

> Throw an error and let the nearest `error.tsx` boundary render the fallback. Throwing out
> of a Server Component is the standard error mechanism — it triggers the client error
> boundary without me writing any error-handling UI in the component itself.

**When does the client hook become worth its dependencies?**

> When the app does any of three things: optimistic mutations, background refetching on
> focus, or a shared cache across many components. A single one-off fetch doesn't justify
> the dependency; a dashboard that lives by freshness does.

## 12. Comparison Table

| | Server Component fetch | Client hook (SWR / TanStack Query) |
|---|---|---|
| Where the request runs | Server | Browser |
| Round trips for first data | 1 (the page) | 2 (shell, then data) |
| Cached by Next.js | ✅ (Data Cache, Lesson 90) | ❌ (own client cache) |
| Loading state needed | ❌ — streams instead | ✅ — required |
| Works with `loading.tsx` | ✅ | ❌ |
| Optimistic mutation | ❌ | ✅ |
| Refetch on focus / polling | ❌ (needs revalidation) | ✅ built-in |
| SEO / initial HTML contains data | ✅ | ❌ — data arrives after hydration |

## 13. Code Example

A server fetch with a stale-while-revalidate cache, rendered inside a streamed section:

```tsx
// app/stats/page.tsx
async function getStats() {
  const res = await fetch('https://api.example.com/stats', {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('stats unavailable');
  return res.json();
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <section>
      <h1>Live-ish stats</h1>
      <p>{stats.visitors} visitors this week</p>
    </section>
  );
}
```

```text
request 1  → fetch on server → renders → HTML with real numbers  (takes the fetch time)
request 2  → served from cache → no fetch, same numbers           (near-instant)
5 minutes later → stale entry expires → background refetch → fresh numbers
```

> [!TIP]
> Press **Debug** and watch the Server Components panel: the awaited `fetch` suspends the
> render until the promise resolves, then the result renders and ships — one waterfall, not
> the client fetch-then-render two-step.

## 14. Performance Notes

- **Server fetching wins First Paint.** The data is in the first HTML; no second round
  trip, no effect, no spinner. This is the dominant reason RSC is the default.
- **Streaming is the fix for slow queries** — the shell renders immediately and slow data
  catches up, so Time to Interactive doesn't wait on the backend. Without it, one slow
  query delays everything above it.
- **Caching is where the real perf lives** — a cached fetch is a non-event per request
  (Lesson 90). Uncached, every visitor re-hits the backend; that's a cost curve, not a
  bug.
- **Client hooks have a bundle and a fetch tax.** The hook library ships to the browser
  and every mount triggers its own request. Cheap for one dashboard, real cost spread
  across many.
- **When it doesn't matter:** a small admin tool where both approaches are a 200ms request.
  Pick server by default and move on — don't over-architect the fetch.

## 15. Debugging Scenarios

**Scenario 1: "My client component logs the fetch twice in dev."**

That's React Strict Mode double-invoking the effect — not a double production request. If
it also happens in a production build, you're fetching in an effect *and* in a Server
Component. Delete one of them (Lesson 88's boundary).

**Scenario 2: "The page is slow even though my backend is fast."**

The slow part is likely the waterfall: an uncached server fetch (or several chained ones)
blocking render. Cache with `revalidate`, and wrap independent sections in `Suspense` so
they stream in parallel instead of serialising.

**Scenario 3: "I see data in the browser but not in the page source."**

That's the signature of a client-hook fetch — the data arrived after hydration. If the
content is important for SEO or social previews, move it to a Server Component so it's in
the initial HTML.

**Scenario 4: "My page worked locally but errors in production."**

An uncached server fetch is hitting a rate-limited or unavailable API from the prod
server's network — different DNS, different IP allowlist. Cache it, and check whether the
endpoint is even reachable from the server that renders.

## 16. Quick Revision Notes

- Server Components are `async` — `await fetch()` straight in the render
- The server renders the data into HTML; the client receives it, it doesn't fetch it
- Everything above the first `"use client"` stays on the server (Lesson 88)
- Props crossing to client components must be serialisable
- Client hooks (SWR/TanStack Query) are for live data, optimistic UI, focus refetch
- Fetch-in-`useEffect` is a smell when an RSC could do it
- `loading.tsx` + `Suspense` stream the shell before slow data resolves
- Default cache, opt into freshness — never the reverse
- Throw on `!res.ok`; let the nearest `error.tsx` handle it

## 17. Cheat Sheet

```text
WHERE DOES THE FETCH RUN?
  data is read-mostly / shared / SEO-relevant  →  Server Component  (async await fetch)
  data is per-session / personalised           →  Server Component (no-store / cookies)
  data is live / user-mutated / real-time      →  client hook (SWR / TanStack Query)

Server Component fetch:
  async function Page() { const data = await fetch(...); return <UI data={data}/> }
  → one round trip, cached, streamed, no client loading state

Client hook fetch:
  shell → hydrate → hook fires fetch → loading → data
  → two round trips, own cache, optimistic UI, refetch-on-focus

Boundary rule (Lesson 88):  client only from the first "use client" downward
Streaming:  loading.tsx / <Suspense> — shell first, data streams in
```

## 18. Key Takeaways

> [!RECAP]
> - Server Components fetch by default: `async` + `await fetch()`, data rendered server-side
> - One round trip, cached by Next.js, data in the initial HTML — no client loading state
> - The client only runs from the first `"use client"` down; props must be serialisable
> - Client hooks are for browser-owned data: live updates, optimistic UI, focus refetch
> - Fetch-in-`useEffect` duplicates what a Server Component already does
> - Streaming (`loading.tsx`, `Suspense`) keeps First Byte fast while slow queries resolve
> - Choose by who owns the data — the caching story follows (Lesson 90)

## Check your understanding

Answer these without looking back.

1. Why is there no client loading state when a Server Component fetches?
2. Where does the boundary sit in a page that has both a server fetch and a like button?
3. Name two situations where a client data hook is the right call.
4. What happens if you pass a `Date` object from a Server Component to a client component — and which lesson explains it?
5. How does streaming change what the user sees while the slowest query runs?
6. Give the one-sentence decision rule for server fetch vs client hook.

## What's Next

**Lesson 90 — Caching.** You just fetched data; now learn how Next.js decides *not* to.
The full cache story — fetch cache, Router Cache, Full Route Cache, Data Cache — is the
hardest part of Next.js and a favourite senior question.
