# Lesson 90 — Caching

**Interview importance:** ⭐⭐⭐⭐⭐ — the hardest part of Next.js, and a favourite senior question.

Almost every "why is my data stale" or "why is my data slow" bug in a Next.js app is a
cache you didn't know existed, doing its job. Next.js keeps **four** layers of cache — two
on the server, one in the browser, one per request — and "the cache" is never just one
thing. Get the layers wrong and you'll answer questions at the wrong altitude.

Lesson 89 fetched data and dropped `revalidate` and `no-store` in passing. This is where
they get the full treatment: what each cache stores, where it lives, how long it survives,
and the exact switch that turns each one on and off.

## Learning Objectives

By the end of this lesson you should be able to:

- Name all four caches and say where each one lives
- Explain why back-navigation is instant even though the server never re-rendered
- Explain why a static route never re-renders while a dynamic one always does
- Use `no-store`, `force-cache`, `revalidate` and cache tags with intent
- Debug "my data is stale" by walking the four layers in order
- Give the senior "walk me through your cache story" answer without notes

## 1. One-Line Definition

**Caching in Next.js is four independent layers — per-request, server-persistent data,
server-persistent routes, and a client session store — each of which can serve a response
without asking the source that produced it.**

## 2. Mental Model

Think of the four caches as four different grades of memory:

- **Request Memoization** is your **working memory** for one task — jot the API result
  down so you don't call the same number twice while cooking one meal.
- **The Data Cache** is the **pantry** — ingredients (fetch results) stored for days,
  restocked on a schedule.
- **The Full Route Cache** is the **freezer** — whole meals (rendered pages) defrosted on
  demand. A frozen meal takes seconds; cooking from scratch takes minutes.
- **The Router Cache** is your **fridge with leftovers** — what you ate recently is
  immediately grab-able, and it's gone when you leave the house (close the tab).

One request can be served entirely from the fridge, the freezer, or the pantry — or it can
be cooked fresh. That's the whole game: know which layer can answer.

## 3. Visual Flow

```text
                          REQUEST
                             │
                             ▼
   ┌──────────────────── BROWSER ────────────────────┐
   │  ROUTER CACHE  (client, in-memory, session)     │
   │  RSC payloads you visited or prefetched         │
   │  → instant back/forward and Link navigation     │
   │  → cleared on hard reload, session end          │
   └───────────────────────┬─────────────────────────┘
                           ▼
   ┌──────────────────── SERVER ─────────────────────┐
   │  FULL ROUTE CACHE  (persistent)                 │
   │  HTML + RSC payload of STATICALLY rendered      │
   │  routes → served without re-rendering           │
   │                                                 │
   │  ┌───────────────────────────────────────────┐  │
   │  │  DATA CACHE  (persistent)                 │  │
   │  │  fetch() results, keyed by URL + options  │  │
   │  │  revalidate: N | force-cache | cache tags │  │
   │  └───────────────────────────────────────────┘  │
   └───────────────────────┬─────────────────────────┘
                           ▼
                    backend / API / DB
```

One more layer exists *inside a single render* — Request Memoization dedupes identical
`fetch` calls within the same server request (Section 4). The other four layers are the
interview answer.

## 4. How It Works

### Request Memoization — per-request dedup

React memoises `fetch` results for the **duration of one server request**. Ten components
that fetch the same URL get one network call, one shared result. The cache dies when the
request ends — nothing persists, nothing goes stale.

```tsx
// three components, all fetch the same URL during one render:
const post = await fetch('/api/post/1');   // one network call for all three
```

```text
request 1 → fetch #1 → all three components receive the same resolved promise
request 2 → fetch #1 again (new request, new memoisation)
```

### The Data Cache — the persistent fetch cache

The server-side cache that stores `fetch` results **across requests and deployments**,
keyed by URL + options. This is the one Lesson 89's `revalidate: 60` was talking about.

```tsx {5-10}
await fetch('https://api.example.com/posts', {
  next: { revalidate: 60 },   // ✅ stale-while-revalidate: serve for 60s, refetch in background
});

await fetch('https://api.example.com/today', {
  cache: 'no-store',          // ✅ never stored — render-time call only
});

await fetch('https://api.example.com/settings', {
  cache: 'force-cache',       // ✅ stored forever — revalidation is manual
});
```

```text
revalidate: 60    → 60s of cache, then a background refetch; user never waits
no-store          → every request hits the backend, always fresh
force-cache       → stored until you revalidate by tag or redeploy
```

```narrate
line: "revalidate: N is stale-while-revalidate, not a TTL — after 60s a background request refreshes it and the next visitor gets fresh data."
line: "no-store and force-cache are the two poles; revalidate is the dial between them."
line: "only fetch() gets this cache for free — Prisma, SDKs and raw DB calls need unstable_cache."
```

> [!NOTE]
> Since Next.js 15, `fetch` defaults to **`no-store`** — caching is opt-in. If you read
> older answers claiming "fetch is cached by default", that was the Next 13/14 default and
> it changed. Saying "opt-in since 15" lands well.

### The Full Route Cache — cached whole pages

The server persists the **rendered HTML + RSC payload of statically rendered routes**.
A route qualifies when it can be rendered at build time — no `cookies()`, no `headers()`,
no `searchParams`, no dynamic functions (Lesson 91's SSG). Static routes are rendered once
and served from this cache forever, or until revalidation.

```tsx
export default function AboutPage() {   // fully static
  return <p>About</p>;                  // rendered once at build, cached
}
```

```text
build    → render once → HTML + RSC payload stored
request 1 → served from Full Route Cache (no render)
request 2 → served from Full Route Cache (no render)
```

### The Router Cache — the client session cache

In the browser, Next.js keeps the **RSC payloads of routes you visited or prefetched**
for the session. That's why back/forward is instant and `<Link>` hover feels pre-loaded:
the payload is already in the browser, no network round trip.

```tsx
<Link href="/blog/1">   // prefetch on hover/viewport → payload lands in the Router Cache
```

```text
visit /blog/1  → payload stored in the Router Cache
navigate away, then back → served from Router Cache, instant
hard reload   → Router Cache cleared
```

It clears on hard reload, ends with the session, and is invalidated by mutations —
`router.refresh()`, Server Actions, and `revalidatePath`/`revalidateTag` (Lesson 91). In
Next 15 dynamic routes get a ~30s default freshness window; static ones persist.

> [!PITFALL]
> The Router Cache is why a fresh-looking page can be stale: the data revalidated on the
> server, but the browser is still serving the payload *it* cached from the last visit. The
> fix is invalidation (`revalidateTag`, `router.refresh()`), not "deploy again".

## 5. Real Project Usage

| You need… | Cache layer | Switch |
|---|---|---|
| Same fetch deduped within one render | Request Memoization | automatic — nothing to write |
| Public data, refreshed every few minutes | Data Cache | `next: { revalidate: 60 }` |
| Data that changes on demand (CMS publish) | Data Cache | `next: { tags: ['posts'] }` + `revalidateTag` |
| A page that never changes | Full Route Cache | nothing — keep it static |
| A page that must be per-user | No Full Route Cache | use `cookies()` / `headers()` → dynamic |
| Instant back/forward navigation | Router Cache | automatic — don't fight it |
| Live-ish data you must never cache | Nothing | `cache: 'no-store'` |

## 6. Interview Explanation

> Next.js has four caches. Request Memoization dedupes identical fetches within one server
> request. The Data Cache persists `fetch` results across requests and deployments — opt-in
> since Next 15 with `revalidate: N` (stale-while-revalidate) or `force-cache`, off by
> default. The Full Route Cache persists whole statically rendered pages, so static routes
> don't re-render per request. And the Router Cache is a client-side session cache of RSC
> payloads, which is why navigation feels instant. The `revalidate`/`no-store` options
> control the Data Cache; `revalidatePath`/`revalidateTag` control the Full Route Cache.

## 7. Senior-Level Insights

- **"The cache" is four questions, not one.** Where does it live (server/browser), how long
  does it persist (request/deployment/session), what does it store (fetch result/whole
  page/payload), and how is it invalidated (time/tag/mutation). Naming all four unprompted
  is the senior answer.
- **Freshness is a product decision, not a code decision.** `revalidate: 300` is a promise
  about how stale your users tolerate data. Say that before saying the syntax — it shows
  you think in trade-offs (Lesson 91 makes the same argument for strategies).
- **Caches compose; they don't replace.** A static page with `revalidate: 60` sits in the
  Full Route Cache *and* its fetches sit in the Data Cache. Revalidating one doesn't
  necessarily clear the other — the layers are independent, which is exactly why "I called
  `revalidateTag` and nothing changed" happens.
- **The Router Cache is the one users feel.** Server caches make your origin fast; the
  Router Cache makes navigation feel instant. A slow app is usually a Data/Full Route Cache
  problem; a "stale after navigation" bug is usually the Router Cache.
- **Default = slow-but-correct, opt-in = fast-but-stale.** Since Next 15's `no-store`
  default, correctness is the baseline and performance is earned per-route. That inversion
  is deliberate — say it, don't fight it.

## 8. Common Mistakes

- **Using `no-store` everywhere "to be safe"** — that's just a slow app with extra steps.
  Default to caching, opt into freshness where the data actually changes.
- **Using `force-cache` on user-specific data.** Auth'd or personalised responses cached
  server-side leak one user's data to another. Never cache per-user data without a
  per-user cache key (or better: don't cache it).
- **Fetching outside `fetch()` and expecting a cache.** Prisma, SDKs and database calls
  bypass the Data Cache entirely — wrap them in `unstable_cache` if they need one.
- **Assuming the Full Route Cache is on for every page.** `cookies()`, `headers()`, or a
  dynamic `searchParams` make the route dynamic; it renders per request. Check the route
  segment config, don't guess.
- **Fighting the Router Cache with `router.refresh()`.** Refresh is a hammer. The actual
  fix for stale client payloads is invalidating the Data Cache *and* the Router Cache
  together — revalidation hooks do that as part of the mutation flow (Lesson 91).
- **Copying Next 13-era answers.** "fetch caches by default" was true before Next 15 and is
  false now. If an answer or a stack-overflow snippet says so, it's outdated.

## 9. Best Practices

✅ Cache by default; add `no-store` only for genuinely per-request data

✅ Use `revalidate: N` as a stale-while-revalidate window, not a hard TTL

✅ Use cache tags for content-driven invalidation: `tags: ['posts']` → `revalidateTag('posts')`

✅ Wrap non-`fetch` data sources in `unstable_cache` when they need caching

✅ Keep pages static where possible — the Full Route Cache is free performance

✅ Let the Router Cache work for you: `Link` prefetching is the feature, not a bug

❌ Don't cache user-specific responses in the Data Cache

❌ Don't call `router.refresh()` as a substitute for real revalidation

❌ Don't assume a route is static — check for `cookies()`/`headers()`/`searchParams` first

## 10. Interview Questions

**Q1. Walk me through the Next.js caching layers.**

> Four. Request Memoization: React dedupes identical fetches within one server request —
> per-request, nothing persists. Data Cache: the server persists `fetch` results across
> requests and deployments, opt-in since Next 15 with `revalidate: N` or `force-cache`.
> Full Route Cache: statically rendered routes have their HTML and RSC payload persisted
> server-side, so they're served without re-rendering. Router Cache: the browser keeps the
> RSC payloads of visited and prefetched routes for the session, which is why navigation
> feels instant. Time-based revalidation controls the Data Cache; `revalidatePath` and
> `revalidateTag` control the Full Route Cache; mutations clear the Router Cache.

**Q2. What does `revalidate: 60` actually do?**

> It's stale-while-revalidate, not a TTL. For the first 60 seconds, requests are served
> from the Data Cache with no backend call. When a request arrives after 60 seconds, the
> stale entry is served immediately while a background fetch refreshes it. The user never
> waits on the revalidation; they just get fresh data a moment later. `no-store` skips all
> of this and hits the backend every request.

**Q3. Why is back-navigation instant?**

> The Router Cache. When I visited the route, its RSC payload was stored client-side for
> the session, and navigation to it doesn't need the server — it's already in the browser.
> It clears on hard reload and is invalidated by mutations like `revalidateTag` and
> `router.refresh()`.

**Q4. Why does a static page never re-render?**

> Because of the Full Route Cache. If a route has no dynamic functions — no `cookies()`,
> no `headers()`, no `searchParams` — it can be rendered once at build time, and the HTML
> plus RSC payload is persisted server-side. Every request is served from that cache, so
> the component function simply never runs again until revalidation.

**Q5. What changed in Next.js 15 around caching?**

> Fetch requests stopped being cached by default — the default went from `force-cache` to
> `no-store`. Caching is now opt-in via `next: { revalidate }` or explicit `cache`. It
> flipped the default from "fast but possibly stale" to "correct but needs opt-in
> performance".

**Senior follow-up: a user says data is stale after a CMS publish. You call `revalidateTag('posts')` and nothing changes. What now?**

> First I check which layer is still holding the stale copy. `revalidateTag` clears the
> Data Cache entries with that tag and the Full Route Cache for affected routes — but the
> browser's Router Cache still has the old payload from the user's last visit. So I
> invalidate client-side too: trigger `router.refresh()` (or a Server Action that does),
> and if it's still stale, verify the fetch actually has the `tags` option, and that the
> route isn't cached beyond the revalidation window. Walking the layers in order — data,
> route, router — is the whole debugging skill.

## 11. Follow-up Questions

**Does the Router Cache survive a full page reload?**

> No. It's in-memory in the browser and scoped to the session. A hard reload rebuilds it
> from whatever the server sends. That's also the fastest test for "is the Router Cache
> serving stale UI": hard reload, and if the data changes, the server was fine and the
> browser cache was the culprit.

**What is Request Memoization, and how is it different from the Data Cache?**

> It's React's per-request dedup: identical fetches during one server render share a single
> network call and one result. It lives for exactly that request and no longer. The Data
> Cache persists across requests and deployments. Memoization stops duplicate work in one
> render; the Data Cache stops repeat work across renders.

**Why can't you see the Data Cache in DevTools?**

> Because it lives on the server, not in the browser. DevTools shows the HTTP cache and
> the Router Cache's network activity; the Data and Full Route Caches are on the origin
> (or in the hosting layer's CDN). So "I don't see it in the Network tab" proves nothing
> about server-side caching.

## 12. Comparison Table

| | Request Memoization | Data Cache | Full Route Cache | Router Cache |
|---|---|---|---|---|
| Where | React (server) | Server | Server | Browser |
| Stores | `fetch` results | `fetch` results | HTML + RSC payload | RSC payloads of visited/prefetched routes |
| Lives for | One request | Requests + deployments | Requests + deployments | The session |
| Default (Next 15+) | On | **Off** (`no-store`) | On for static routes | On |
| Controlled by | automatic | `revalidate`, `cache`, `tags` | static rendering + revalidation | `router.refresh()`, mutations |
| Cleared by | request end | revalidate/time | revalidate/time | reload, session end |

## 13. Code Example

The `revalidate` semantics, simulated in plain Node so you can actually run it — the same
stale-while-revalidate behaviour the Data Cache implements:

```js
function makeDataCache(load, revalidateMs, now) {
  let value = null;
  let fetchedAt = -Infinity;

  return async function get() {
    if (now() - fetchedAt >= revalidateMs) {
      value = await load();          // refresh: user waits only when nothing is cached
      fetchedAt = now();
    }
    return value;                    // otherwise: serve stale, refresh in background
  };
}

(async () => {
  let t = 0;                                   // fake clock — deterministic output
  let hits = 0;
  const now = () => t;
  const getPosts = makeDataCache(async () => {
    hits += 1;
    return `posts loaded at t=${t}`;
  }, 60, now);

  console.log(await getPosts());               // cold — fetch
  console.log(await getPosts());               // t=10 → cached
  t = 70;
  console.log(await getPosts());               // t=70 ≥ 60 → refresh (serve stale in real Next)
  console.log('backend hits:', hits);          // 2, not 4
})();
```

```text
posts loaded at t=0
posts loaded at t=0
posts loaded at t=70
backend hits: 2
```

```narrate
line: "two calls inside the window hit zero backend; one call after the window refetches — that is revalidate: 60 in a dozen lines."
```

## 14. Performance Notes

- **The Data Cache is your biggest lever.** One cached fetch turns thousands of requests
  into zero backend calls. Uncached fetches are the number-one "why is my app slow"
  cause — especially in `getServerSideProps`-era codebases.
- **The Full Route Cache makes static routes nearly free** to serve, at the cost of a
  heavier build. The performance question is really the rendering-strategy question —
  Lesson 91.
- **The Router Cache matters for perceived speed.** Navigation feel (instant back/forward)
  beats raw server latency in user perception. Don't disable prefetching to "save
  bandwidth" unless you've measured the trade.
- **When it doesn't matter:** an authenticated dashboard where every screen is already
  dynamic and uncached, and the backend is the bottleneck. Caching won't fix a slow query
  — profile the query.

## 15. Debugging Scenarios

**Scenario 1: "My data updates on the backend but the page never changes."**

Walk the layers top-down. (1) Hard-reload — if data updates, the Router Cache was serving
the stale payload. (2) If still stale, check the fetch options: is it cached with
`revalidate` or `force-cache`? (3) If the route is static, it's the Full Route Cache —
`revalidatePath` or a shorter `revalidate`. The layer that answers last is the culprit.

**Scenario 2: "`no-store` is set but the page still shows old data."**

`no-store` makes the *fetch* fresh, but the route might still be statically rendered — the
Full Route Cache is serving the old page without ever running the component. Force dynamic
rendering (use `cookies()`, or a `dynamic` segment config) or revalidate the route.

**Scenario 3: "Back button shows a different page than forward."**

Classic Router Cache asymmetry: back navigation serves the cached payload, forward
triggers a fresh prefetch/navigation. If the server data changed between them, the two
views differ. `router.refresh()` after a mutation fixes the mismatch.

**Scenario 4: "Revalidation works in dev but not in production."**

The Full Route Cache and Data Cache behave differently across environments, and production
is fronted by a CDN that may cache headers. Check: does the route actually stay dynamic in
prod? Does `revalidate` have effect, or is the CDN ignoring `Cache-Control`? Dev has no CDN,
so it hides exactly this class of bug.

## 16. Quick Revision Notes

- Four caches: Request Memoization, Data Cache, Full Route Cache, Router Cache
- Memoization: per-request dedup, automatic, dies with the request
- Data Cache: persistent fetch results; opt-in since Next 15 via `revalidate`/`force-cache`
- Full Route Cache: whole static pages, rendered once, served forever (until revalidated)
- Router Cache: client session store of RSC payloads — instant nav, cleared on reload
- `no-store` = never cache · `force-cache` = cache forever · `revalidate: N` = SWR window
- `revalidateTag`/`revalidatePath` clear the server caches; mutations clear the Router Cache
- "Why is my data stale" → check Router Cache → Data Cache → Full Route Cache, in that order
- Pre-Next-15 answers claiming "fetch is cached by default" are outdated

## 17. Cheat Sheet

```text
FOUR LAYERS
  Request Memoization  React, per-request      dedup identical fetches in one render
  Data Cache           server, persistent      fetch() results  (opt-in since Next 15)
  Full Route Cache     server, persistent      HTML+RSC of STATIC routes
  Router Cache         browser, session        RSC payloads you visited/prefetched

DATA CACHE SWITCHES
  cache: 'no-store'        → never store (Next 15+ default)
  cache: 'force-cache'     → store forever, revalidate manually
  next: { revalidate: 60 } → stale-while-revalidate, 60s window
  next: { tags: ['posts'] }→ cache tagged → revalidateTag('posts') invalidates
  unstable_cache(fn)       → cache non-fetch data sources

STATIC vs DYNAMIC (drives Full Route Cache)
  cookies() / headers() / searchParams / no-store fetch  → dynamic → render per request
  none of the above                                      → static → Full Route Cache

DEBUG ORDER: hard reload → Router Cache → fetch options → Full Route Cache
```

## 18. Key Takeaways

> [!RECAP]
> - Four independent caches: Request Memoization, Data Cache, Full Route Cache, Router Cache
> - Request Memoization dedupes within one request; it never persists
> - The Data Cache persists `fetch` results — opt-in since Next 15, `no-store` by default
> - The Full Route Cache persists whole static pages; dynamic routes bypass it
> - The Router Cache makes navigation instant and is the usual "stale" suspect
> - `no-store` / `force-cache` / `revalidate: N` are the Data Cache switches; tags add
>   on-demand control
> - Revalidation, ISR and rendering strategies decide *which* cache serves your page —
>   that's Lesson 91

## Check your understanding

Answer these without looking back.

1. Name all four caches, and where each one lives.
2. Why is back-navigation instant even though the server never re-rendered?
3. What makes a route dynamic — and what does that do to the Full Route Cache?
4. What changed in Next.js 15, and why did it matter?
5. `revalidate: 30` — walk through what happens at t=0, t=25, and t=45.
6. A user sees stale data after `revalidateTag('posts')`. Walk the layers to find why.
7. Why can't you debug the Data Cache from DevTools?

## What's Next

**Lesson 91 — Revalidation, ISR, SSR & SSG.** The caches decide *what* gets served; the
rendering strategies decide *when* something is rendered at all. "SSR vs SSG vs ISR" is
asked almost every time — you'll learn the trade-offs, not just the acronyms.
