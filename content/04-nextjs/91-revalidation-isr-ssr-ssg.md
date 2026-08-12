# Lesson 91 — Revalidation, ISR, SSR & SSG

**Interview importance:** ⭐⭐⭐⭐⭐ — "SSR vs SSG vs ISR" is asked almost every time. Know the trade-offs, not the acronyms.

Every interview answer that starts "SSG means static… SSR means server…" and stops there
fails at the *why*. The four strategies are not a multiple-choice menu — they are points on
one dial: **when** do you render, and **how long** do you keep it? Lesson 90 built the
cache machinery; this lesson picks the strategy that uses it.

You already know what each cache stores. Now you'll learn when a page is rendered at all —
at build time (SSG), per request (SSR), on a schedule (ISR), or as raw server data (RSC)
— and how to choose by asking *how stale may your users' data be?*

## Learning Objectives

By the end of this lesson you should be able to:

- Explain SSG, SSR, ISR and streaming Server Components as one "when do you render" dial
- Say which is Next.js's default and what drives a page off it
- Tune ISR: `revalidate`, `revalidatePath` and `revalidateTag`, and the `dynamic` config
- Run the "how stale is acceptable?" decision rule on any page
- Compare the four strategies on speed, freshness, cost and complexity
- Answer "SSG vs SSR vs ISR" with trade-offs, not definitions

## 1. One-Line Definition

**The four rendering strategies are one question — when is this page rendered, and how long
is the result trusted? — answered at build time (SSG), per request (SSR), on a schedule
(ISR), or continuously revalidated (streaming RSC).**

## 2. Mental Model

**You are a chef deciding when to cook each dish.**

- **SSG** is cooking the whole menu the night before and reheating plates to order. Instant
  service, zero per-order work — but tonight's special won't be on the menu until you cook
  again (deploy).
- **SSR** is cooking every dish to order, each time. Always the freshest possible plate —
  but the kitchen is busy during service and every plate costs full effort.
- **ISR** is the "cook on a timer" compromise: plate from the pre-made batch, and every ten
  minutes a fresh batch goes in the oven in the background. Guests get food instantly;
  nobody eats yesterday's stew for a full shift.
- **Streaming RSC** is serving the soup course while the main is still in the oven — the
  parts that are ready ship, the slow parts arrive when done.

The whole interview is: for *this* dish (page), how stale may it be?

## 3. Visual Flow

```text
SSG:  build ──► render once ──► store HTML+RSC ──► serve cached forever
                (revalidate on deploy only)

SSR:  request ──► render per request ──► serve fresh ──► repeat every request

ISR:  build ──► render ──► serve cached for N seconds
        │                        │
        └─── background render ◄──┘ after N → serve stale + refresh in background

Streaming RSC:
      request ──► shell streams immediately
            └──► slow sections resolve later (Suspense) ──► same request, different times
```

## 4. How It Works

### SSG — Static Site Generation

Rendered **once, at build time**. The HTML and RSC payload go into the Full Route Cache
(Lesson 90) and every request is served from it. A page qualifies when nothing dynamic is
read during render: no `cookies()`, no `headers()`, no `searchParams`.

```tsx
// app/about/page.tsx — fully static: no dynamic functions, no uncached fetch
export default function AboutPage() {
  return <p>Built once, served from the Full Route Cache forever.</p>;
}
```

```text
next build → rendered once → HTML + RSC payload stored
request 1  → served from cache (zero render)
request 2  → served from cache (zero render)
…until you redeploy or revalidate
```

### SSR — Server-Side Rendering

Rendered **on every request**. This is what `getServerSideProps` did in the Pages Router,
and in the App Router it's what happens when a page reads `cookies()`, `headers()`, or
`searchParams` — or fetches with `no-store`. There is no Full Route Cache entry; the
component function runs for every visitor.

```tsx
// app/account/page.tsx — dynamic because it reads the session
import { cookies } from 'next/headers';

export default async function AccountPage() {
  const session = await cookies();       // dynamic → render per request
  const user = await getCurrentUser(session);

  return <p>Hello {user.name}</p>;       // fresh for every visitor
}
```

```text
request 1 → cookies() read → render → fresh HTML
request 2 → cookies() read → render → fresh HTML
each request: full render, correct for that user, no route cache
```

### ISR — Incremental Static Regeneration

The static page, plus a **revalidation timer**. For `revalidate: N` seconds the cached
render is served; after N, a request serves the stale page while a background render
produces the next version. If a rebuild fails, the stale version stays up — which is the
whole point: *a static site that can't go down*.

```tsx {4,7}
// app/posts/[slug]/page.tsx — ISR
export const revalidate = 300;          // regenerate at most every 5 minutes

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);   // cached fetch (Lesson 90)
  return <article>{post.title}</article>;
}
```

```text
build     → render all known slugs
t=0..299  → served from Full Route Cache
t=300     → request serves stale page, background render regenerates
t=300+    → fresh page; repeat
```

> [!TIP]
> `revalidate` is a *maximum* age, not a schedule — a page with no visitors at t=300 is
> simply not regenerated. ISR is on-demand, not a cron.

### Streaming Server Components — the fourth mode

An `async` Server Component (Lesson 89) with `loading.tsx` or `<Suspense>` is the same
dynamic render, but the shell streams immediately while slow awaits resolve. It is not a
separate strategy so much as the **delivery mechanism** the App Router gives all of them —
a static page can also stream its slower sections.

```tsx
// app/dashboard/page.tsx
export default async function Dashboard() {
  return (
    <main>
      <Suspense fallback={<p>Loading stats…</p>}>
        <Stats />          {/* slow, awaited, streamed in */}
      </Suspense>
      <p>Shell content — already on screen</p>
    </main>
  );
}
```

```text
t=0    → shell streams (dashboard header, layout)
t=slow → Stats resolves → streams in, page completes
```

### `revalidatePath` / `revalidateTag` — push-based revalidation

Time-based ISR is schedule-driven. Content-driven invalidation is the modern tool:
`revalidateTag('posts')` purges every cache entry tagged `posts` **on demand**, so a CMS
publish takes effect in seconds — no timer, no redeploy. This is the bridge from Lesson
90's cache tags into the strategy layer.

```ts
// app/actions.ts — called after a CMS publish, an edit, a delete
import { revalidateTag } from 'next/cache';

export async function publishPost(id: string) {
  await savePost(id);
  revalidateTag('posts');                 // purge now — no waiting for revalidate
  revalidatePath('/blog');                // and re-render the list route
}
```

```text
CMS publish → publishPost runs → 'posts' tag purged → next request renders fresh
vs pure ISR: up to `revalidate` seconds of stale — same page, slower to update
```

## 5. Real Project Usage

| Page | Strategy | Why |
|---|---|---|
| Marketing site, docs, landing pages | SSG | Never changes; fastest possible delivery |
| Product catalogue (e-commerce) | ISR (`revalidate: 300`) | Prices change hourly, uptime matters more |
| Blog / CMS content | ISR + `revalidateTag('posts')` | Instant publish, everything else cached |
| Dashboard with user session | SSR (dynamic) | Per-user data can't be cached (Lesson 90) |
| Account settings, admin | SSR (dynamic) | `cookies()` + per-user fetch |
| Slow stats section on a static page | Streaming RSC | Static shell, streamed data |

The decision rule, as a question:

```text
1. Does the data depend on the user (cookies, headers, searchParams)?   → SSR
2. If not: how stale may it be?
     never (seconds)        → SSR, or dynamic + streaming
     minutes                → ISR:  revalidate: 300
     on-demand only         → ISR:  tags + revalidateTag
     until I redeploy       → SSG
3. Within any strategy: can slow parts stream?  → Suspense / loading.tsx
```

## 6. Interview Explanation

> There are four modes and they're one dial: when do you render, and how long do you trust
> it? SSG renders once at build — fastest, but stale until redeploy. SSR renders per
> request — always fresh, always costs a render. ISR is SSG plus a revalidation timer:
> serve the cached page, regenerate in the background after N seconds. Streaming RSC is
> the delivery layer — a static or dynamic page can stream its slow parts via Suspense.
> Next.js's App Router defaults to static, and a page becomes dynamic the moment it reads
> `cookies()`, `headers()` or `searchParams`. I pick by asking how stale the data may be:
> user-specific means SSR, minutes or on-demand staleness means ISR, never-changing means
> SSG.

## 7. Senior-Level Insights

- **Trade-offs beat acronyms.** The interviewer wants to hear "SSG wins on speed and cost,
  loses on freshness; SSR is the inverse; ISR is the middle" — with *your* reasoning about
  which matters for the page in front of you. Definitions without trade-offs sound
  memorised.
- **"Always fresh" is a lie.** Every strategy serves *something* stale — even SSR serves
  data as of the moment the render started, and streaming serves partial data by design.
  The real question is *how stale may the user see?* Saying this reframes the whole topic.
- **Cost is part of the answer.** SSG costs build time; SSR costs a render per request;
  ISR costs a render only when the timer expires. "SSR everything" is how you burn a
  server budget on pages that never change — which is exactly why static defaults exist.
- **ISR and streaming compose.** A page can be ISR for its static shell *and* stream
  per-request data into a section. The strategy answer that only names one mode misses
  that pages are built from layers.
- **Revalidation is the modern answer to stale UI.** Time-based `revalidate` is fine for
  "prices change hourly"; content-driven `revalidateTag` is the senior move for "CMS
  publish must show now". Mentioning tags unprompted signals you've built real products.

## 8. Common Mistakes

- **Equating SSG with "only for static content."** SSG renders anything build-time-safe —
  including data fetched with `force-cache` (Lesson 90). The question is freshness, not
  content type.
- **Adding `revalidate` to a dynamic page.** `revalidate` is ignored when the page reads
  `cookies()`/`headers()` — those make it per-request regardless. "I set `revalidate` and
  it's still slow" usually means the route is dynamic and the option never applied.
- **Believing ISR is a cron.** `revalidate: 300` means "no older than 5 minutes", not
  "regenerate every 5 minutes". An idle page stays stale until someone visits it.
- **`revalidateTag` without the tag.** The fetch must be tagged — `next: { tags: ['posts'] }`
  — or the purge call matches nothing. "I called `revalidateTag` and nothing happened" is
  this bug nine times out of ten.
- **SSR for everything "to be safe."** Per-request rendering multiplies backend load by
  visitor count. Lesson 71's lesson applies to strategies too: the default is the cheap
  one, and freshness is earned per page.
- **Quoting Pages Router functions.** `getServerSideProps`/`getStaticProps` are legacy.
  Say "the App Router renders per request when the page reads `cookies()`", not the old
  function names — it dates your answer.

## 9. Best Practices

✅ Default to static; make a page dynamic only when the data demands it

✅ Use ISR's `revalidate` for time-based staleness, `revalidateTag` for content-driven

✅ Read `cookies()`/`headers()` in Server Components — it's the idiomatic way to go dynamic

✅ Tag every content fetch (`tags: ['posts']`) so a CMS publish can purge precisely

✅ Stream slow sections with `Suspense`/`loading.tsx` even on static pages

✅ For a dynamic page, scope the dynamic part small (one component) so the shell stays cached

❌ Don't `revalidate` a page that reads `cookies()` — it's dynamic and the option is ignored

❌ Don't fetch user-specific data with `force-cache` — Lesson 90's leak, again

❌ Don't force SSG on a per-user page just because it's "the default"

## 10. Interview Questions

**Q1. What's the difference between SSR, SSG and ISR?**

> It's when the page renders. SSG renders once at build and serves the cached result —
> fastest, but stale until you redeploy or revalidate. SSR renders on every request —
> always fresh, at the cost of a render per visitor. ISR is SSG with a revalidation
> timer: the cached page is served while a background render refreshes it after N seconds.
> Same code path, three decisions about freshness.

**Q2. How do you decide which to use?**

> I ask how stale the data may be. If it's per-user — cookies, headers, search params — it
> has to be SSR, because a cached copy can't be personalised. Otherwise, if it can be
> minutes stale, ISR with `revalidate`; if it must update the moment content changes,
> ISR with `revalidateTag`; if it effectively never changes, SSG. The strategy follows the
> freshness requirement, not the content type.

**Q3. What is ISR, exactly?**

> Static rendering plus background revalidation. The page is rendered once, served from
> cache, and when a request arrives after the `revalidate` window, the stale page is served
> while a new render happens in the background. Crucially, if regeneration fails, the stale
> page stays up — so ISR has SSG's speed and uptime with a bounded freshness window.

**Q4. What is Next.js's default — static or dynamic?**

> Static, with an important escape hatch: a page becomes dynamic the moment it reads
> `cookies()`, `headers()`, or `searchParams`, or fetches with `no-store`. So "static by
> default" really means "static until you ask for the request". Lesson 90's Full Route
> Cache is exactly what static pages are served from.

**Q5. How do you update an ISR page when the CMS publishes?**

> Two ways. Time-based: `revalidate: 300` means it self-heals within five minutes. But the
> modern way is push-based: tag the fetch `next: { tags: ['posts'] }` and call
> `revalidateTag('posts')` from the publish action — the cache is purged on demand, so the
> next request is fresh. No timer, no redeploy.

**Senior follow-up: an ISR blog's page doesn't update for up to 5 minutes, and marketing is unhappy. How do you fix it without killing the cache?**

> `revalidateTag`. The five-minute lag is the *time-based* window; content-driven
> invalidation removes the wait. I tag every post fetch, have the CMS webhook (or a Server
> Action) call `revalidateTag('posts')` after a publish, and the very next request renders
> fresh — the static cache still absorbs every other request. That's the trade-off I'd
> present: keep ISR's speed, lose only the staleness window.

## 11. Follow-up Questions

**Is streaming a fourth strategy like the others?**

> Not quite — it's how any strategy delivers. A static page can stream a slow section via
> Suspense, and an SSR page streams by default. Streaming changes *when the user sees
> content*, not *when the page renders*. So I'd put it beside the four, not in the menu.

**What does `getStaticProps` map to in the App Router?**

> Nothing with that name — static rendering is the default for routes with no dynamic
> functions, and `revalidate` is the replacement for `getStaticProps`'s revalidate option.
> `getServerSideProps` maps to "the page is dynamic because it reads the request" — you
> don't opt into SSR; you opt *out* of static by reading `cookies()`/`headers()`.

**When would you choose SSR over ISR?**

> When per-request data is part of the page: a session, personalisation, or anything keyed
> to the visitor. ISR can't serve that because the cached render is shared. Also when the
> backend guarantees freshness within a request — like auth-gated pages — that a cached
> copy would violate.

## 12. Comparison Table

| | SSG | ISR | SSR | Streaming RSC |
|---|---|---|---|---|
| Rendered | At build | Build + background | Per request | Per request |
| Served from | Full Route Cache | Full Route Cache | Fresh render | Fresh render, partial |
| Freshness | Until redeploy | ≤ `revalidate` / until purged | As of request | As of request |
| Per-request cost | ~zero | ~zero (cache hit) | Full render | Full render |
| Failure mode | Stale, never down | Stale, never down | Errors on the hot path | Partial content |
| Complexity | Low | Medium (timer/tags) | Medium | Medium (Suspense) |
| Pick when | Never changes | Minutes/on-demand stale is fine | Per-user or always-fresh | Slow sections on any page |

## 13. Code Example

The ISR decision rule, simulated in plain Node so you can run it — serve stale, refresh in
the background, keep the site up:

```js
function makeIsr(render, revalidateMs, now) {
  let html = null;
  let renderedAt = -Infinity;

  return function get() {
    if (now() - renderedAt >= revalidateMs && html !== null) {
      render().then((fresh) => {     // background regeneration — serve stale now
        html = fresh;
        renderedAt = now();
      });
    }
    if (html === null) {
      html = render();               // first request / cold build — synchronous render
      renderedAt = now();
    }
    return html;
  };
}

(async () => {
  let t = 0;
  const now = () => t;
  let renders = 0;
  const page = makeIsr(() => {
    renders += 1;
    return Promise.resolve(`<p>rendered at t=${t}</p>`);
  }, 60, now);

  console.log('visit at t=0  →', await page());    // build render
  console.log('visit at t=30 →', await page());    // cached
  t = 70;
  console.log('visit at t=70 →', await page());    // serves stale, schedules refresh
  await new Promise((r) => setTimeout(r, 0));      // let the background render land
  console.log('visit at t=70 →', await page());    // now fresh
  console.log('total renders:', renders);
})();
```

```text
visit at t=0  → <p>rendered at t=0</p>
visit at t=30 → <p>rendered at t=0</p>
visit at t=70 → <p>rendered at t=0</p>
visit at t=70 → <p>rendered at t=70</p>
total renders: 2
```

```narrate
line: "t=70 shows the stale page twice — the visitor never waits, the background render lands between requests."
line: "two renders total for four visits: that is ISR's entire value proposition."
```

## 14. Performance Notes

- **SSG and ISR hits are the fastest possible responses** — no render on the hot path.
  This is where Lesson 90's Full Route Cache pays off.
- **SSR's cost scales with traffic.** Every request is a render plus a backend round trip.
  Under load, that's the first thing to move to ISR or cache. Profile the render before
  adding caching, though — Lesson 71's rule survives contact with Next.js.
- **ISR's build is heavier than SSG's** (every path rendered at build), and regeneration
  is on-demand — an idle page never refreshes. If a page must refresh even when unvisited,
  that's a job for the Data Cache's `revalidate`, not ISR alone.
- **Streaming wins Time-to-Content** — the shell paints while slow data loads. For LCP,
  put the critical content early and stream the rest; the interactive budget stays small.
- **When it doesn't matter:** internal tools with a handful of users and a fast backend.
  Strategy choice is invisible at that scale — pick static and move on.

## 15. Debugging Scenarios

**Scenario 1: "I set `revalidate: 300` and the page still shows old data."**

Check whether the route is actually static: if it reads `cookies()`/`headers()` or fetches
with `no-store`, `revalidate` is ignored — the page is dynamic by definition. Fix by
removing the dynamic read or using `revalidateTag` for content-driven updates instead.

**Scenario 2: "A CMS publish doesn't show up for five minutes."**

That's time-based ISR working as designed. Switch to push-based: tag the fetches
(`tags: ['posts']`), call `revalidateTag('posts')` from the publish action, and the next
request is fresh. If it's *still* stale after that, the fetch was never tagged — check the
`next` options on every fetch that reads posts.

**Scenario 3: "The page shows user A's data to user B."**

A cached page is shared across visitors — this is the Lesson 90 per-user leak. The page
must be dynamic: read `cookies()`/`headers()` so it renders per request, and never cache
the user-specific fetch. Same fix, and it's a security bug, not a performance one.

**Scenario 4: "Dynamic pages are slow under traffic."**

Each request renders and hits the backend. First decide what's actually dynamic: the
session, or one data section? Move the slow-but-shared data to a cached Server Component
(Lesson 90), wrap the genuinely per-user part in `Suspense` so it streams, and consider
ISR for anything that's only nominally per-user.

## 16. Quick Revision Notes

- One dial, four positions: SSG (build) → ISR (build + timer) → SSR (per request) → streaming (per request, partial)
- Static by default; `cookies()`/`headers()`/`searchParams`/`no-store` ⇒ dynamic
- SSG: rendered once at build, Full Route Cache, stale until redeploy
- SSR: render per request, always fresh, cost scales with traffic
- ISR: serve cached, regenerate in background after `revalidate` — stale but never down
- `revalidate` = maximum age, not a cron; idle pages don't regenerate
- `revalidateTag`/`revalidatePath` = push-based, content-driven invalidation
- Streaming RSC (`Suspense`, `loading.tsx`) = how slow sections arrive, on any strategy
- Decision rule: per-user → SSR · minutes stale → ISR · on-demand → tags · never → SSG

## 17. Cheat Sheet

```text
WHEN DOES IT RENDER?
  SSG      build time               → Fast Route Cache forever
  ISR      build + every N seconds  → cached, background refresh (stale-while-rebuild)
  SSR      every request            → fresh per visitor (dynamic)
  Streaming  per request, partial   → shell first, slow parts later

WHAT MAKES A ROUTE DYNAMIC (SSR)?
  cookies() | headers() | searchParams | fetch(cache: 'no-store')

ISR CONTROL
  export const revalidate = 300;             // max age in seconds
  next: { tags: ['posts'] }                  // tag the fetch
  revalidateTag('posts')                     // purge on demand (CMS publish, edit…)
  revalidatePath('/blog')                    // re-render a route

DECISION RULE
  per-user data?        → SSR (dynamic)
  minutes stale ok?     → ISR  (revalidate: N)
  updates on publish?   → ISR  (tags + revalidateTag)
  never changes?        → SSG
  slow section?         → wrap in <Suspense>, stream it
```

## 18. Key Takeaways

> [!RECAP]
> - SSG, SSR, ISR and streaming are one dial: when you render, and how long you trust it
> - SSG: rendered once at build, fastest, stale until redeploy — the static default
> - SSR: rendered per request via `cookies()`/`headers()`/`searchParams` — fresh, costly
> - ISR: cached render with background regeneration — stale but never down
> - `revalidate` is a maximum age; `revalidateTag`/`revalidatePath` push updates on demand
> - Streaming RSC is the delivery layer — every strategy can stream its slow parts
> - Pick by "how stale may the user see?", not by content type (Lesson 90's caches decide *what* is served; this lesson decides *when*)

## Check your understanding

Answer these without looking back.

1. In one sentence each: when does SSG, SSR and ISR render?
2. What are the three things that silently make a route dynamic?
3. Why does `revalidate` not apply to a page that reads `cookies()`?
4. Why is an ISR page never completely down — even if regeneration fails?
5. When would you prefer `revalidateTag` over `revalidate: N`?
6. Run the decision rule on: a pricing page, an account dashboard, and a docs site.
7. How is streaming different from the other three — and where does it fit?

## What's Next

**Lesson 92 — Route Handlers.** You've fetched data and decided how to render it. Next
up: the App Router's API routes — `GET`/`POST` handlers for forms, webhooks and
third-party callers, and how they share the cache and revalidation machinery you now know.
