# Topic 70 — Laravel + Next.js

**Checklist anchor:** the architecture (Next.js → Laravel API → PostgreSQL) · JWT · Sanctum · CORS · CSRF · API Resources · SSR considerations · auth · token handling

**Owning lesson:** [133 Laravel API + Next.js & Payments](../133-api-nextjs-stripe.md)

---

## The one-sentence answer

**Next.js + Laravel is a split-stack architecture — Next.js owns the frontend (SSR/SSG) and calls a Laravel JSON API that owns the data, with token authentication and CORS as the seam.**

## The mental model

The checklist's diagram:

```text
Next.js (React, SSR/SSG)
   ↓  HTTP/JSON, Bearer tokens
Laravel API
   ↓
PostgreSQL
```

Two codebases, one contract. Next.js renders pages — server-side or statically — and fetches data from the Laravel API. Laravel owns the data, auth, and business logic behind a JSON API (Lesson 23). The seam is everything the checklist lists: **how the token is stored, how CORS/CSRF behave, and what the API returns.**

## How it works

### The architecture

| Layer | Next.js | Laravel |
|---|---|---|
| Job | Rendering, routing, UX | Data, auth, business logic |
| Owns | React components, SSR/SSG | Eloquent, validation, policies |
| Talks via | `fetch` → the API | `routes/api.php` → JSON (Lesson 23) |
| Auth | Sends the token | Verifies the token (Sanctum) |

### Authentication — Sanctum tokens (the recommended path)

```js
// Next.js logs in → Laravel issues a Sanctum token (Lesson 19):
const res = await fetch('https://api.app.com/api/login', {
  method: 'POST',
  body: JSON.stringify(creds),
});
const { token } = await res.json();

// store it — httpOnly cookie preferred (safe from XSS):
// (Next.js API route sets the cookie; the client never touches the token)
// then send it on every request:
fetch('https://api.app.com/api/orders', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### JWT vs Sanctum — the choice

| | Sanctum token | JWT |
|---|---|---|
| What | An opaque token mapped in `personal_access_tokens` | A signed, self-contained token (payload + signature) |
| Revocation | **Instant** — delete the DB row | Hard — the signature stays valid until expiry |
| Expiry | Your choice per token | Inside the payload (`exp`) |
| Server state | Yes (the token table) | No (stateless) |
| When | **The Laravel default — first-party apps** | Legacy systems, existing JWT infra |

**The senior recommendation:** Sanctum. Revocability is the killer feature — a leaked or rotated token dies immediately; a JWT lives until its `exp`. JWT's statelessness matters when you *can't* share state (microservices), not between Next.js and Laravel.

### CORS & CSRF

```php
// Laravel must allow the Next.js origin:
'paths' => ['api/*'],
'allowed_origins' => ['https://app.example.com'],   // the Next.js origin
'allowed_methods' => ['*'],
'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
'supports_credentials' => true,   // if using cookies/session
```

- **CORS** — the browser's same-origin guard: the Laravel API explicitly allows the Next.js origin (Lesson 3's middleware in action).
- **CSRF** — with **Bearer tokens** in headers, there's no CSRF vulnerability (the token isn't a cookie the browser auto-sends). With **cookie/session** auth, the Sanctum SPA handshake applies (Lesson 19).

### Token handling — the secure pattern

```text
❌ token in localStorage  → XSS reads it (Lesson 37)
✅ httpOnly cookie        → JS can't read it; the Next.js server adds the
                            Authorization header server-side
✅ server-side fetching   → Next.js Server Components/Route Handlers hold
                            the token; the browser never sees it
```

**SSR considerations** (the checklist's item):

- **Server Components / SSR**: fetch server-side — the token lives in the server process or an httpOnly cookie; the browser never handles auth headers.
- **Client components**: fetch via the token in cookies — or proxy through a Next.js route handler that adds the header.
- **SSG**: static pages can't hold user data — the token is per-request; static shells fetch after hydration.

### API Resources — the contract (Lesson 24)

```php
class OrderResource extends JsonResource { /* curated fields */ }
// Next.js receives { data: [...] } — the same shape every endpoint
// (Lesson 24's envelope: { data, links, meta })
```

## Interview questions

**Q1. What's the architecture?**
> Next.js owns the frontend — SSR/SSG rendering — and calls a Laravel JSON API. Laravel owns the data, auth, and business logic behind `routes/api.php`, returning API Resources (Lesson 24). Two codebases, one HTTP contract, with the token as the auth seam.

**Q2. Sanctum tokens vs JWT — which, and why?**
> Sanctum. A Sanctum token is revocable — deleting the DB row kills it instantly, which is what you want when a token leaks or a user logs out. A JWT stays valid until its `exp` — you can't un-sign it. JWT's statelessness only pays off when you can't share state (microservices); Next.js and Laravel share a database of tokens fine. Sanctum is the Laravel-native default.

**Q3. How does CORS fit?**
> The browser blocks cross-origin calls by default — the Next.js origin can't read Laravel API responses unless Laravel allows it. `config/cors.php` whitelists the Next.js origin (`https://app.example.com`) for `api/*` paths. It's middleware (Lesson 3) — the seam between the two origins.

**Q4. What about CSRF?**
> With Bearer tokens sent in headers, there's no CSRF vector — the browser doesn't auto-send the token like it does cookies. With cookie/session auth, the Sanctum SPA handshake applies: CSRF cookie + `X-XSRF-TOKEN` header (Lesson 19). The rule: tokens in headers = no CSRF; cookies = the Sanctum exchange.

**Q5. How do you handle tokens securely with SSR?**
> Keep the token where JavaScript can't read it: an httpOnly cookie, or server-side in Next.js route handlers/Server Components that add the Authorization header. Never localStorage — one XSS and the token is stolen (Lesson 37). Server Components fetch with the token server-side; static pages fetch after hydration.

**Senior follow-up: When is this split the right architecture vs Inertia?**
> The split earns its complexity when the frontend has needs Laravel's Blade/Inertia world doesn't serve well — heavy client interactivity, third-party integrations, a design system, or separate frontend/backend teams (Lesson 69's comparison). For a server-driven team app, Inertia keeps it one codebase; when the frontend is genuinely its own product, Next.js + API is the call — and then the API contract discipline (versioning, Resources, errors — Lesson 23) is what makes it work.

## Common mistakes

❌ Tokens in `localStorage` — the XSS theft (Lesson 37).

❌ Forgetting CORS — the API works in Postman, fails in the browser.

❌ JWT "because it's modern" — revocability is the real requirement; Sanctum wins.

❌ Client components fetching with no auth — the token must reach the request somehow (cookie or proxy).

## Quick revision notes

- **Next.js (frontend) → Laravel API → PostgreSQL** — two codebases, one contract
- Auth: **Sanctum Bearer tokens** — revocable, Laravel-native (Lesson 19)
- **CORS** allows the Next.js origin · tokens in headers = **no CSRF**
- Token handling: **httpOnly cookie / server-side** — never localStorage
- **SSR** fetches server-side with the token; SSG pages fetch after hydration
- API Resources = the shape Next.js receives (Lesson 24)
- Split stack for a **real frontend product**; Inertia for server-driven apps

## Check your understanding

1. Where does auth live in this split, and what's the seam?
2. Why is Sanctum the right call over JWT here?
3. What does CORS actually protect, and why is it needed?
4. When is CSRF a concern, and when is it not, in this stack?
5. How does SSR fetch data without exposing the token to the browser?
