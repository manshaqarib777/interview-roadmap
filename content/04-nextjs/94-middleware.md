# Lesson 94 — Middleware

**Interview importance:** ⭐⭐⭐ — a quick, mechanical question. Know the three use cases, the `matcher` array, and one complete auth example.

Middleware is code that runs *before* the request reaches a route. In App Router terms: a
function at the top of the project that runs on the Edge (or Node) runtime, sees the incoming
request, and decides whether to let it through, redirect it, rewrite it, or answer it
directly. This lesson also covers the official `proxy.ts` rename.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what middleware is and when it runs in the request lifecycle
- Configure which paths it runs on with a `matcher`
- Write an auth-gating middleware that redirects unauthenticated users
- Answer "give me three use cases" with three *distinct* examples
- Explain the `middleware.ts` → `proxy.ts` rename without getting caught out

## 1. What is Middleware?

**Middleware is a function that runs on the server, before the request is matched to a route, and can redirect, rewrite, or answer the request before the page renders.**

It is the one place that runs for *every matching request* — before layouts, before Server
Components, before Route Handlers. Whatever you gate here is gated everywhere, with one
config file and no per-page code.

## 2. Mental Model

Think of middleware as the **bouncer at the door**, placed before the venue — not a bouncer
at each table.

Every guest (request) passes one door. The bouncer checks the ticket (session cookie),
either waves them in (pass through), points them to the right entrance (rewrite), or sends
them to another venue entirely (redirect). One person at one door is cheap; a bouncer at
every table (a check in every page) is not.

## 3. Visual Flow

```text
                 ┌──────────────────────────────┐
   request ─────►│  middleware.ts runs          │
                 │  (Edge / Node runtime)       │
                 └──────────────┬───────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
         redirect()        rewrite()          pass through
         (new URL)        (serve other       (route continues)
                           route, URL
                           unchanged)
              │                 │                  │
              └──── browser     └──── /dashboard   │
                                                   ▼
                                      layouts → pages → response
```

## 4. How It Works

Middleware is a single file at the **project root** (or inside `src/`) that exports one
function. It receives a `NextRequest` and returns a `NextResponse` — or nothing, to let the
request continue.

```ts
// middleware.ts — project root (or src/middleware.ts)
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.redirect(new URL('/team', request.url));
  }
  // return nothing → request continues to the route
}

export const config = {
  matcher: '/about/:path*',
};
```

```text
GET /about          → 307 → /team
GET /about/team     → 307 → /team
GET /               → runs middleware, no match, route serves as normal
```

The function runs on every request that matches `config.matcher`. Return nothing and the
route handles it; return a `NextResponse` and you have already decided the outcome.

`NextRequest` and `NextResponse` are the Web `Request`/`Response` classes with Next.js
helpers: `request.nextUrl`, `request.cookies`, `request.headers`, and the response builders
`NextResponse.redirect(url)`, `NextResponse.rewrite(url)`, `NextResponse.next()`.

## 5. Real Project Usage

Middleware is small and purpose-built. Its three classic jobs:

| Use case | What it does | Example |
|---|---|---|
| **Auth gating** | Check the session cookie, redirect to `/login` if absent | Every authenticated page |
| **Redirects** | Move old URLs, enforce locale, block bots | `/old-page` → `/new-page` |
| **A/B testing** | Read the bucket from a cookie, `rewrite` to the variant route | `rewrite('/variant-b')` keeps the URL stable |
| *(bonus)* **Rate limiting / bot blocking** | Inspect the request, respond directly with `429` or `403` | API abuse protection |

The canonical auth gating example — protect the dashboard, keep the rest public:

```ts {3,5,7}
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

```text
GET /dashboard        (no session cookie) → 307 → /login?next=/dashboard
GET /dashboard        (session cookie)    → 200, dashboard renders
GET /                 → middleware does not run, homepage is public
```

The A/B test variant, which is the one people forget:

```ts
export function middleware(request: NextRequest) {
  const bucket = request.cookies.get('bucket')?.value ?? 'a';
  if (bucket === 'b' && request.nextUrl.pathname.startsWith('/landing')) {
    return NextResponse.rewrite(new URL('/landing/b', request.url));
  }
  return NextResponse.next();
}
```

`rewrite` serves the *content* of `/landing/b` while the address bar still shows `/landing`.
That is what makes it safe for A/B tests — no redirect, no broken back button, the variant
is invisible to the user.

> [!TIP]
> Keep middleware small. Every middleware request pays its cost, and the Edge runtime is
> restricted. JWT verification and heavy work belong in Route Handlers (Lesson 92) or Server
> Actions (Lesson 93); middleware should only read cookies and decide.

## 6. Interview Explanation

> Middleware runs once per matching request, before the route is resolved. It sees the
> incoming `NextRequest`, and can redirect to a different URL, rewrite to a different route,
> or respond directly.
>
> The three classic uses are auth gating, redirects, and A/B testing — and I'd pick one and
> write the skeleton: check the cookie, redirect to login if it's missing, and scope it with
> a matcher so public pages never run it.

## 7. Senior-Level Insights

- **Matchers are inverted by default.** Everything not matched skips middleware entirely.
  That's the point: your homepage and static assets never pay the auth-check cost.
- **Middleware runs before everything** — layouts, Server Components, Route Handlers — so
  it is the only layer that gates *all* of them at once. A check inside a page can't protect
  an API route; middleware can.
- **It's the wrong tool for data.** Middleware can't access your database client the way a
  Server Component can, and it runs in a constrained runtime. Auth that needs to verify a
  JWT signature is often better done in a Route Handler or Server Action, with middleware
  doing the cheap "is there a cookie at all?" gate.
- **The rename.** Next.js 15.2 renamed the convention: `middleware.ts` → `proxy.ts`, and
  `middleware` → `proxy`. "Middleware" is deprecated but still works; new projects use
  "proxy". Mentioning the rename unprompted is a strong signal you ship current Next.js.
- **It runs on the Edge by default, Node is opt-in.** Most middleware can't use Node APIs
  without opting into the Node runtime.

## 8. Common Mistakes

❌ Forgetting the `matcher` and running middleware on *every* request, including images and
static assets:

```ts
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };
```

❌ Redirecting to `/login` without a cookie check, so *every* request bounces — including
the login page itself (infinite redirect):

```ts
return NextResponse.redirect(new URL('/login', request.url)); // no `if (!token)`
```

❌ Using `rewrite` when you mean `redirect` (or vice versa). A rewrite keeps the URL; a
redirect changes it. Pick deliberately.

❌ `use client` in the same file — middleware runs on the server and cannot import client
code.

## 9. Best Practices

✅ Scope every middleware with a `matcher` so public routes never run it

✅ Do the cheap gate in middleware, the expensive verification in a Route Handler / Server Action

✅ Use `rewrite` for A/B tests and geo/locale variants — the URL must stay stable

✅ Preserve the "return to" path in the login redirect (`?next=/dashboard`)

✅ One middleware file, kept under ~50 lines

❌ Don't put database calls or heavy validation in middleware

❌ Don't write your own token parsing when `next-auth` / `clerk` middleware handles it

## 10. Interview Questions

**Q1. What is middleware in Next.js?**

> A function that runs on the server before the request is matched to a route. It sees the
> incoming request and can redirect, rewrite, respond directly, or let the request continue.
> It's configured with a `matcher` that decides which paths it runs on.

**Q2. Give me three use cases for middleware.**

> Auth gating — check the session cookie and redirect to login. Redirects — moving old URLs
> or enforcing locales. And A/B testing — reading a bucket cookie and rewriting to a variant
> route, so the URL stays stable. A common fourth is rate limiting or bot blocking, where
> middleware answers with a 429 or 403 directly.

**Q3. How does the `matcher` config work?**

> It's an array of path patterns that decides where middleware runs. Everything *not* matched
> skips middleware completely. The pattern `/dashboard/:path*` matches `/dashboard` and every
> path below it, and `:path*` is the catch-all segment. Routes outside the array never pay
> the middleware cost.

**Q4. What's the difference between `redirect` and `rewrite`?**

> A redirect sends a 3xx response and the browser navigates to a new URL. A rewrite serves
> the content of a different route while keeping the original URL in the address bar — that's
> why rewrites are used for A/B tests and locale variants.

**Q5. Where does middleware run?**

> On the server, before the route renders. Historically the Edge runtime, close to the user;
> Next.js 15.2 added opt-in Node.js middleware. Either way it runs before layouts, Server
> Components, and Route Handlers.

**Senior follow-up: Your team renamed `middleware.ts` to `proxy.ts` — what changed?**

> Functionally nothing yet: same file convention location, same signature. The rename
> reflects what the feature actually is — a proxy in front of the app — and the old name is
> deprecated but still supported. New code should use `proxy.ts` / `export function proxy`,
> and I'd flag the warning if the build still uses the old name.

## 11. Follow-up Questions

**How do you protect only some routes?**

> With the `matcher` — list exactly the protected prefixes and everything else skips
> middleware. You can also early-return in the function for exceptions, but the matcher is
> the primary scope.

**Can middleware read cookies and headers?**

> Yes, from `request.cookies` and `request.headers`, and it can set cookies on the response
> with `NextResponse`. Lesson 95 covers the same `cookies()`/`headers()` APIs used in
> Server Components and Route Handlers.

**What is a rewrite used for in real code?**

> Internationalisation — serving `/en` or `/ar` content based on the user's locale while the
> URL stays the same — and A/B testing, where the variant route is rewritten invisibly.

## 12. Comparison Table

| | `redirect` | `rewrite` | `NextResponse.next()` |
|---|---|---|---|
| What happens | Browser navigates to a new URL | Serves another route, URL unchanged | Request continues to its route |
| HTTP status | 307/308 | 200 (internal) | normal |
| Use case | Logged out → `/login` | A/B variants, locale | Allow the request through |
| Visible in URL bar | ✅ new URL | ❌ original URL | n/a |

## 13. Code Example

A complete "protect the dashboard, allow the rest" middleware with a matcher:

```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

```narrate
line 6:   the only check middleware should do — is there a session cookie at all?
line 8:   build the login URL, and remember where the user was headed
line 9:   the ?next= param means "send me back after login"
line 12:  no match → let the request through
line 16:  everything outside /dashboard skips middleware entirely
```

Behavior:

```text
GET /dashboard        (no cookie)  → 307 → /login?next=/dashboard
GET /dashboard/settings (no cookie)→ 307 → /login?next=/dashboard/settings
GET /dashboard        (cookie)     → 200, dashboard renders
GET /                 → 200, homepage never touched middleware work
```

## 14. Performance Notes

Middleware cost is paid **per matching request**, so it matters exactly as much as your
traffic on those paths. Keep it cheap:

- Match narrowly — a matcher for `/dashboard` costs nothing on the homepage
- Read cookies, don't verify JWTs (that's a Route Handler's job)
- If middleware runs on every request, every request pays — use `matcher` first

When it doesn't matter: a small matcher + a cookie read is microseconds, dwarfed by the
route work that follows. The mistake isn't middleware, it's middleware with no matcher.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| "Too many redirects" | Redirect loop — middleware redirects the login page too | Narrow the `matcher`, or check `request.nextUrl.pathname !== '/login'` before redirecting |
| Middleware never runs | Wrong file location or matcher doesn't match the path | Move to project root / `src/`, test the matcher pattern |
| Works in dev, not production | Middleware is only built into the production server when the file is at the root | Confirm the root-level location; check the deployed build includes it |
| Cookie appears undefined | Cookie set *after* the middleware ran | Middleware sees the request as it arrives — set cookies in a Route Handler / Server Action or set a response cookie via `NextResponse` |
| JWT verify hangs / unavailable | Node-only library in Edge runtime | Opt into Node middleware (15.2+), or move verification to a Route Handler |

## 16. Quick Revision Notes

- Middleware runs **before routes**, once per matching request — the bouncer at the door
- Three use cases: **auth gating, redirects, A/B testing** (+ rate limiting/bot blocking)
- `NextRequest` in, `NextResponse` out; return nothing to pass through
- `redirect` changes the URL; `rewrite` changes the content, URL stays
- `matcher` scopes the work — everything else skips it
- Edge runtime by default; Node runtime is opt-in (15.2+)
- `middleware.ts` is renamed to `proxy.ts` — old name deprecated, still works

## 17. Cheat Sheet

```text
File:        middleware.ts / proxy.ts  (project root or src/)
Export:      export function middleware(request: NextRequest)
Config:      export const config = { matcher: ['/path/:path*'] }

Read:        request.cookies.get('name'), request.headers.get('x'),
             request.nextUrl.pathname
Redirect:    NextResponse.redirect(new URL('/login', request.url))
Rewrite:     NextResponse.rewrite(new URL('/variant', request.url))
Pass:        NextResponse.next()   — or return nothing
Respond:     return NextResponse.json({ ok: false }, { status: 401 })

Patterns:    '/about'          exact path
             '/about/:path*'   prefix + everything below
             ['/a', '/b']      multiple patterns
```

## 18. Key Takeaways

> [!RECAP]
> - Middleware is the single server-side gate that runs before every matching request
> - The three interview use cases: **auth gating, redirects, A/B testing**
> - `redirect` moves the browser; `rewrite` swaps content while the URL stays put
> - `matcher` scopes middleware — routes outside it never pay the cost
> - Auth belongs in middleware as a *cookie check*, not a JWT verification
> - The convention is now `proxy.ts`; `middleware.ts` is deprecated but works

## Check your understanding

Answer these without looking back.

1. In one sentence, when does middleware run relative to routes?
2. Name the three classic middleware use cases — and the common fourth.
3. Why would you choose `rewrite` over `redirect` for an A/B test?
4. What does the `matcher` array do, and why does it matter for performance?
5. Write the auth-gate skeleton: check the session cookie, redirect to `/login?next=…`.
6. What is the difference between `middleware.ts` and `proxy.ts` today?
7. Why should JWT verification *not* live in middleware?

## What's Next

**Lesson 95 — Cookies, Headers & Metadata.** The request-context APIs middleware shares with
Server Components — `cookies()`, `headers()` — and the metadata API that fills the `<head>`
with titles, descriptions and Open Graph tags.
