# Lesson 96 — Env Vars, Build & Deployment

**Interview importance:** ⭐⭐ — deployment questions are rarer, but "what does `NEXT_PUBLIC_`
mean?" and "how did this secret end up in the bundle?" get asked *because* so many people get
them wrong.

This lesson is the production story: where configuration comes from (`.env` files), the one
prefix that decides whether a value ends up in the browser bundle, and what actually happens
between `npm run build` and a request hitting your deployed app. Two of the most common
production incidents — secrets in the client bundle, and values that "work on my machine" —
live entirely inside this lesson.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what `NEXT_PUBLIC_` does and why a secret leaks into the client bundle
- Order the `.env` files Next.js reads, and pick the right one per environment
- Walk through the build pipeline: `build`, static vs dynamic output, `start`
- Say how Vercel builds and serves a Next.js app (and how ISR stays alive)
- Debug the "secret in the bundle" and "works locally, not in prod" failure modes

## 1. What Is This Lesson Really About?

**Environment variables are a build-time contract: only `NEXT_PUBLIC_`-prefixed values get inlined into the client bundle, and the build/start pipeline decides which routes are static files and which render per request.**

Two systems sit side by side. The env-var system decides *who is allowed to see a value* —
the server process, or the browser. The build system decides *when work happens* — at deploy
time into static files, or per request. Confusing either one produces the classic incidents.

## 2. Mental Model

Think of `process.env` as a **sticky note wall** that only the server can see.

During `next build`, Next.js walks your code. Any `process.env.SECRET` it finds is replaced
by the value from the build machine — still server-side, safe. But when a module is bundled
**for the client**, the same replacement happens to whatever it references. `NEXT_PUBLIC_` is
the prefix that says "this one is for the browser too": its value gets baked into the JS file
that ships to users, forever, as plain text. Server-only values referenced from client code
are replaced with `undefined` — silently, at build time.

## 3. Visual Flow

```text
   .env files (build time, on the build machine)
        │
        ▼
   next build ── compiles every module ──┬── server bundle
                                         │      process.env.SECRET → "s3cr3t"  (safe)
                                         │      process.env.API_URL → "https://…"
                                         │
                                         └── client bundle  (sent to browsers)
                                                NEXT_PUBLIC_ANALYTICS → "G-1234"
                                                SECRET               → undefined  ← the leak would be HERE
        │
        ▼
   .next/ ── static routes (HTML/JS files)     dynamic routes (per-request)
   ──────────────────────────────────          ─────────────────────────────
   /about → about.html                          /dashboard (reads cookies)
   /       → index.html                         /products/[id] (ISR, revalidated)
        │
        ▼
   next start / Vercel serves .next/  →  browser
```

## 4. How It Works — Env Vars

Next.js loads `.env` files at **build time** and exposes them through `process.env`. The
prefix decides the audience:

- **No prefix** — server-only. Available in Server Components, Route Handlers, Server
  Actions, and `next.config.ts`. Never in client code.
- **`NEXT_PUBLIC_`** — inlined into the client bundle *and* available server-side. The value
  is baked in at build time and shipped to every browser.

```ts
// server-only — safe anywhere on the server:
const dbUrl = process.env.DATABASE_URL;
```

```ts
// client-safe — this one is intentionally public:
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
```

```text
process.env.DATABASE_URL           → "postgres://…"      (server bundle only)
process.env.NEXT_PUBLIC_ANALYTICS_ID → "G-1234"          (inlined into client JS)
process.env.SUPABASE_SERVICE_KEY   → undefined in client JS (server-only, not inlined)
```

> [!PITFALL]
> `NEXT_PUBLIC_` is not a way to make a secret "available to the client safely". It's a way
> to make a value *public*. Anything behind that prefix is readable by anyone who opens
> DevTools. Put a service key behind it and you've shipped the key — the classic leak.

**The leak, concretely.** This code compiles and deploys — and leaks the key:

```ts
// lib/client-config.ts — imported by a Client Component
export const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
```

```text
The client bundle now literally contains:
  "SUPABASE_SERVICE_KEY": undefined   ← at build time the value was not inlined
```

and its inverse, with `NEXT_PUBLIC_`:

```ts
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
```

```text
The client bundle now contains the real key, in plain text, for anyone to read:
  var SUPABASE_KEY = "sb_secret_7x…";
```

The first leaks nothing (it's `undefined` in the browser — but then the feature silently
breaks), the second leaks everything. Both are the same mistake: putting a server secret on
a path that reaches client code.

**File loading order.** Next.js reads, with later files overriding earlier ones:

```text
1. .env.$(NODE_ENV).local     → .env.development.local / .env.production.local
2. .env.local                 → never committed, highest priority after (1)
3. .env.$(NODE_ENV)           → .env.development / .env.production
4. .env                       → defaults, committed
```

`.env.local` (and `.env.*.local`) should be gitignored — that's where real secrets live on
your machine. Note the subtlety: only `NODE_ENV`-specific `.local` files load in the
corresponding mode; plain `.env.local` loads in *every* mode, which is why a prod secret
sitting in `.env.local` can sneak into a local prod build.

**Also true:**

- `next dev` does **not** load `.env.production` — it loads `.env.development*`.
- Changing an env var requires a **rebuild** (inlining happens at build time) and a **dev-server restart**.
- Runtime-only values in Node middleware/Route Handlers can read `process.env` at runtime too — but anything that reaches the client is still inlined.

## 5. How It Works — The Build Pipeline

`next build` produces a `.next/` directory; `next start` (or a platform) serves it.

```bash
npm run build
```

```text
▲ Compiling /  Generating static pages (8/8) ...
   ✓ Generating static pages
   ✓ Collecting page data
   ✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB          78 kB
├ ○ /about                               1.1 kB          78 kB
├ ƒ /dashboard                           1.3 kB          79 kB
└ ƒ /products/[id]                      1.4 kB          79 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Each route ends up in exactly one bucket:

| Marker | Meaning | When |
|---|---|---|
| `○` Static | Prerendered to an HTML file at build time | No request data read; can be cached aggressively |
| `ƒ` Dynamic | Rendered per request | Reads `cookies()`/`headers()`/`params`, or `no-store` fetches |
| `●` ISR | Static + revalidated | `revalidate` set, or on-demand revalidation (Lesson 91) |

`next start` serves `.next/` on a Node server. For a standalone, single-process container
you can set `output: 'standalone'` in `next.config.ts`, which produces a minimal
`node_modules` + server folder you can Dockerise — a common senior answer.

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',   // minimal self-contained server for containers
};

export default nextConfig;
```

## 6. How It Works — Deploying on Vercel

Vercel is the reference deployment: it runs `next build` for you and serves the result on
their edge network.

```text
  git push → Vercel: install deps → next build → serve .next/ from edge network
                                                    │
              ┌─────────────────────────────────────┼────────────────────────┐
              ▼                                     ▼                        ▼
         static HTML files                  dynamic routes                  ISR pages
         (CDN cache)                        (serverless per request)        (revalidated
                                                                             on schedule/
                                                                             on demand)
```

- **Env vars live in the project dashboard** — set for Preview and Production
  separately. Changing a dashboard value does **not** touch an existing build; you must
  redeploy, because the value was inlined at build time.
- **Preview deploys** get a unique URL per branch/PR — test the real thing before merging.
- **ISR works because Vercel keeps the functions and cache warm** — revalidation and
  on-demand invalidation (Lesson 91) both survive deployment.
- The build is **stateless and reproducible**: anything you need at build time (env vars,
  content) must be available to the build environment.

## 7. Interview Explanation

> Env vars are a build-time contract. Server-only variables are replaced in the server
> bundle; `NEXT_PUBLIC_`-prefixed ones are inlined into the client bundle at build time —
> that's exactly why a secret leaks: someone put a server key behind `NEXT_PUBLIC_`, or
> referenced a server-only key from client code and shipped it. The rule is: nothing
> sensitive ever reaches a client module; `NEXT_PUBLIC_` is for public config only.
>
> The build produces static routes (prerendered HTML, `○`), dynamic routes (per request,
> `ƒ`), and ISR (`●`). `next start` or a platform like Vercel serves `.next/`. Vercel runs
> the build, keeps env vars per environment, and maintains the ISR cache.

## 8. Senior-Level Insights

- **The leak question is a boundary question.** "Why is my secret in the bundle?" is almost
  always the server/client boundary from Lesson 88, observed through env vars. The fix is
  structural — keep secrets server-side and never let a client module reference them — not
  "rename the variable".
- **Treat `NEXT_PUBLIC_` as an API for public configuration** — analytics IDs, API base
  URLs for public endpoints, feature flags you're fine sharing. Audit the git history: once
  inlined, a leaked value is *in every deployed bundle* and must be rotated, not deleted.
- **Validate env vars at startup** (zod + a schema, or `t3-env`) so a missing `DATABASE_URL`
  fails the build loudly instead of crashing in production.
- **`output: 'standalone'`** is the standard answer for Docker/self-hosting — a tiny,
  production-ready server without node_modules bloat.
- **Preview environments are the deployment killer feature.** Mentioning that you test env
  var sets per environment (development/preview/production) separates shipped experience
  from tutorial knowledge.

## 9. Common Mistakes

❌ A secret behind `NEXT_PUBLIC_` — the classic leak, shipped to every browser:

```ts
process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY  // 💥 anyone can read the Stripe key
```

❌ Reading a server-only env var from client code — silently becomes `undefined` in the
browser, so the bug hides until production:

```ts
// client.tsx
const key = process.env.OPENAI_API_KEY;   // undefined in the bundle — feature breaks
```

❌ Expecting runtime changes without a rebuild: editing `.env` in the dashboard and not
redeploying, or editing `.env.local` while the dev server runs.

❌ Committing `.env.local` (or worse, a `.env` full of prod secrets) to git.

❌ Forgetting that `next dev` doesn't load `.env.production` — a prod-only bug that never
shows up locally.

## 10. Best Practices

✅ Prefix **only public config** with `NEXT_PUBLIC_` — nothing else

✅ Keep server secrets in non-prefixed vars, referenced from server code only

✅ Gitignore `.env*.local`; commit only safe defaults in `.env`

✅ Validate required env vars at startup (zod / `t3-env`)

✅ Set env vars in the platform per environment; redeploy after changing them

✅ Use `output: 'standalone'` for Docker / self-hosted deploys

❌ Don't put credentials in client modules — not even "temporarily"

❌ Don't store secrets in `.env` committed to the repo

## 11. Interview Questions

**Q1. What does the `NEXT_PUBLIC_` prefix do?**

> It marks an env var as public and inlines its value into the client bundle at build time.
> Server-only vars without the prefix are available to server code but become `undefined` in
> the browser. Anything with the prefix is readable by anyone who opens the shipped JS —
> so it must only ever hold public config.

**Q2. How did a secret end up in the client bundle?**

> Two ways. Someone referenced a server-only var from client code — then it's not really a
> leak, the bundle just contains `undefined`, which breaks the feature silently. Or someone
> put a secret behind `NEXT_PUBLIC_`, and the real value was baked into the JS at build time
> and shipped to everyone. The second is the actual leak; both come from ignoring the
> server/client boundary.

**Q3. What's the difference between static and dynamic routes?**

> A static route (`○`) is fully prerendered to an HTML file at build time — no request data
> involved — so it's served from cache almost for free. A dynamic route (`ƒ`) renders per
> request because it reads cookies, headers, or params. ISR (`●`) is the middle: static
> output revalidated on a schedule or on demand.

**Q4. Walk me through deploying a Next.js app to Vercel.**

> Push to git. Vercel runs `next build` in the cloud, with env vars from the project
> dashboard applied per environment. The output is served from their edge network: static
> files from the CDN, dynamic routes as serverless functions, ISR pages with the cache
> maintained by the platform. Preview deploys get a unique URL for each branch.

**Q5. Why is my env var `undefined` in the browser?**

> It doesn't have the `NEXT_PUBLIC_` prefix, so it was never inlined into the client bundle —
> by design. Either read it on the server and pass the value to the client explicitly, or, if
> it's genuinely public config, rename it with the prefix and redeploy.

**Senior follow-up: How do you handle secrets in a Next.js monorepo?**

> One shared validated env schema, loaded in a single server-only module. Client components
> import a tiny `public-config.ts` that only re-exports `NEXT_PUBLIC_` values. CI runs the
> schema validation with a placeholder env file so missing vars fail the build, and real
> secrets live in the platform, never in the repo. Rotate anything that was ever inlined.

## 12. Follow-up Questions

**Does `.env.production` load in development?**

> No. `next dev` loads `.env.development*`; `next build`/`next start` load
> `.env.production*`. That split is exactly why "works in dev, broken in prod" incidents
> happen — the value sets are different.

**How do you test env var changes locally?**

> Edit `.env.local`, restart the dev server, and for anything `NEXT_PUBLIC_` remember it's
> inlined at build time — a production preview deploy is the real test.

**What's `output: 'standalone'`?**

> A build mode that emits a minimal, self-contained server — only the code and dependencies
> the app needs — which you can drop into a Docker image without shipping node_modules or
> source.

## 13. Comparison Table

| | Server-only (`DATABASE_URL`) | `NEXT_PUBLIC_` (`NEXT_PUBLIC_ANALYTICS_ID`) |
|---|---|---|
| Server bundle | ✅ real value | ✅ real value |
| Client bundle | ❌ replaced with `undefined` | ✅ inlined, visible to everyone |
| When it's set | build time (inlined) / runtime (Node) | build time only |
| Safe for | secrets, DB URLs, keys | public config: IDs, public API URLs, flags |
| Change requires | rebuild + restart | rebuild (new deploy) |

| | Static (`○`) | Dynamic (`ƒ`) | ISR (`●`) |
|---|---|---|---|
| Rendered | at build | per request | at build + revalidated |
| Cached | CDN | per request | CDN + revalidation |
| Example | marketing pages | dashboards with cookies | product pages (Lesson 91) |

## 14. Code Example

A complete build-time flow, from `.env` to the bundle — first the environment, then the build
output shape:

```bash
# .env.local (gitignored)
DATABASE_URL=postgres://user:pass@prod-db.example.com/acme
NEXT_PUBLIC_API_URL=https://api.acme.com
```

```ts
// app/page.tsx — server component
export default async function Home() {
  const dbUrl = process.env.DATABASE_URL;            // server-only ✅
  return <main>{dbUrl ? 'db configured' : 'no db'}</main>;
}
```

```ts
// components/analytics.tsx — 'use client'
export function Analytics() {
  return <script src={`${process.env.NEXT_PUBLIC_API_URL}/track.js`} />;
}
```

After `next build`, the two bundles contain different things:

```text
server bundle (app/page.js):
  var DATABASE_URL = "postgres://user:pass@prod-db.example.com/acme";   ✅ present

client bundle (components/analytics.js — shipped to browsers):
  var NEXT_PUBLIC_API_URL = "https://api.acme.com";                     ✅ present (public)
  // DATABASE_URL is not here at all — server-only                      ✅ absent
```

```narrate
line 4 (page.tsx):    the DB URL is read on the server — never leaves it
line 8 (analytics):   the client component can only see NEXT_PUBLIC_ values
output:               server bundle keeps DATABASE_URL; the client bundle never contains it
```

If someone "helpfully" changed the analytics line to a server-only key, the bundle would
show `undefined` — and if they prefixed a secret with `NEXT_PUBLIC_`, the bundle would show
the secret. That contrast *is* the whole lesson.

## 14. Performance Notes

- **Static output is the cheapest request there is** — a file served from cache. Routes that
  don't need request data should stay static (`○`). Reading cookies/headers moves them to
  `ƒ`, so place those reads as low as possible (Lesson 95).
- **ISR (`●`) is the deploy-time optimisation**: build once, serve cached, revalidate in the
  background. The cost is the revalidation pass, not per-request rendering.
- **Env inlining is compile-time substitution** — `NEXT_PUBLIC_` values add no runtime
  overhead, but they do add *bundle* presence: a secret inlined is permanently public.
- `output: 'standalone'` shrinks deploy size dramatically; it matters most for Docker image
  size and cold-start times on serverless.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| Secret found in the client bundle | `NEXT_PUBLIC_` on a secret, or server-only key reached client code | Remove the prefix / restructure; rotate the key — it's public now |
| `process.env.X` is `undefined` in browser | X has no `NEXT_PUBLIC_` prefix | Pass the value server→client, or rename + redeploy if public |
| "Works in dev, fails in prod" | Dev loads `.env.development*`, prod loads `.env.production*` | Compare the two sets; add a startup validation |
| Dashboard env change has no effect | Value was inlined at build time | Redeploy (a new build picks up the new value) |
| `.env.local` edit has no effect | Dev server caches env at start | Restart `next dev` |

## 16. Quick Revision Notes

- `NEXT_PUBLIC_` = inlined into the client bundle at **build time** — public, permanent
- No prefix = server-only; `undefined` in the browser
- Loading order: `.env.$(NODE_ENV).local` → `.env.local` → `.env.$(NODE_ENV)` → `.env`
- `next build` → static (`○`) vs dynamic (`ƒ`) vs ISR (`●`); `next start` serves `.next/`
- Vercel: git push → build → serve from edge; env vars per environment, redeploy to apply
- `output: 'standalone'` for Docker / self-hosted
- A leaked inlined secret must be **rotated**, not just deleted

## 17. Cheat Sheet

```text
Env vars:
  DATABASE_URL=…              → server bundle only
  NEXT_PUBLIC_ANALYTICS_ID=…  → inlined into client bundle (public)
  .env.production.local > .env.local > .env.production > .env

Build:
  npm run build          → .next/
  next start             → serve .next/
  output: 'standalone'   → minimal server for containers

Route markers:
  ○ Static (prerendered)  ƒ Dynamic (per request)  ● ISR (revalidated)

Vercel:
  git push → build → serve from edge
  env vars per environment; change ⇒ redeploy (values are inlined at build)
```

## 18. Key Takeaways

> [!RECAP]
> - `NEXT_PUBLIC_` is build-time inlining **into the client bundle** — a prefix for public config, never for secrets
> - Server-only vars reach the browser as `undefined`, which is the silent version of the same boundary bug
> - `.env` precedence: `.env.$(NODE_ENV).local` > `.env.local` > `.env.$(NODE_ENV)` > `.env`
> - `next build` classifies every route: static (`○`), dynamic (`ƒ`), or ISR (`●`)
> - `next start` serves `.next/`; `output: 'standalone'` gives a minimal container server
> - Vercel builds for you and keeps env vars per environment — changing one means redeploying
> - A secret that was ever inlined is public forever — rotate it

## Check your understanding

Answer these without looking back.

1. What does `NEXT_PUBLIC_` do — and what should never have the prefix?
2. Name the two ways a secret can end up in a client bundle.
3. Order the `.env` files by precedence.
4. Why does changing an env var in the Vercel dashboard not change an existing deployment?
5. What do the `○`, `ƒ` and `●` markers mean in a build output?
6. Which env files does `next dev` load, and why does that cause "works locally" bugs?
7. What does `output: 'standalone'` do, and when would you use it?

## What's Next

**Lesson 97 — Top JavaScript Interview Questions.** The first rehearsal lesson. You've built
the foundations — now learn to deliver them under pressure, starting with the JavaScript
questions that open most screens.
