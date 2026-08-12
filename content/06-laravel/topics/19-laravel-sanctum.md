# Topic 19 — Laravel Sanctum

**Checklist anchor:** SPA authentication · API tokens · personal access tokens · CSRF · cookie-based auth · token abilities

**Owning lessons:** [122 Authentication](../122-authentication.md) · [133 Laravel API + Next.js & Payments](../133-api-nextjs-stripe.md)

---

## The one-sentence answer

**Sanctum is Laravel's first-party API authentication — simple personal access tokens for mobile/API clients, and cookie-based session auth for your own SPA.**

## The mental model

Sanctum solves two problems with one package:

1. **SPA auth (cookie-based):** your own single-page app (React, Vue, Inertia) authenticates via the session — cookies + CSRF, no tokens in localStorage. The SPA lives on the same domain (or a configured one) and uses the session like a classic web app.
2. **Token auth (mobile/API):** mobile apps and external clients can't use cookies, so they get **personal access tokens** — `Authorization: Bearer <token>` on each request.

```text
SPA (same origin)     →  session cookie + CSRF token → sanctum/csrf-cookie
Mobile / API client   →  Bearer personal-access-token
```

## How it works

### Setup

```bash
php artisan install:api        # enables Sanctum + api routes
php artisan migrate            # creates personal_access_tokens table
```

### SPA mode — cookies, not tokens

```php
// config/sanctum.php — the SPA domain (must match, incl. port)
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000,localhost:5173')),
```

```js
// the SPA handshake:
await axios.get('/sanctum/csrf-cookie');   // get the CSRF cookie
await axios.post('/login', creds);          // session cookie set by Laravel
// subsequent requests: session cookie + X-XSRF-TOKEN header
```

Laravel's SPA guard checks the **session**, so `Auth::user()` works like a web app — no tokens to store or refresh client-side. CSRF is handled by the cookie + `X-XSRF-TOKEN` header exchange.

### Token mode — personal access tokens

```php
// issue a token:
$token = $user->createToken('mobile-app')->plainTextToken;
// returns the plain token ONCE — store it, it's never shown again

// authenticate requests:
// Authorization: Bearer <plainTextToken>
```

The token maps to a row in `personal_access_tokens`. `Sanctum::actingAs($user)` in tests fakes it.

### Token abilities — scoped tokens

```php
$token = $user->createToken('mobile', ['orders:read', 'orders:write']);

// enforce in routes:
Route::get('/orders', ...)->middleware('auth:sanctum')->can('orders:read');
// or in policies/middleware with $request->user()->tokenCan('orders:read')
```

Abilities are the token's permission list — a read-only mobile client simply can't write, even with the user's credentials.

## Sanctum vs Passport (the common question — from Topic 17)

| | Sanctum | Passport |
|---|---|---|
| Model | Personal access tokens + SPA sessions | Full **OAuth2**: clients, scopes, refresh tokens |
| Audience | Your own app (SPA, mobile, API) | Third-party apps / public API |
| Complexity | Simple — no OAuth2 flow | OAuth2 grants, client secrets |
| When | First-party: "my SPA + my mobile" | Third-party: "other apps log in" |

**When would you use Sanctum instead of Passport?** When authentication is for *your own* apps — a SPA on your domain and a mobile client you ship. You get tokens and sessions without OAuth2's client/scope machinery. Passport only pays off when external clients need their own OAuth2 credentials.

## Interview questions

**Q1. What is Sanctum?**
> Laravel's first-party auth for APIs and SPAs. Two modes: cookie-based session auth for your own SPA (CSRF-protected, no tokens in localStorage), and personal access tokens (`Bearer`) for mobile and API clients. One package covers "my own apps" without OAuth2.

**Q2. How does SPA authentication work in Sanctum?**
> The SPA fetches `/sanctum/csrf-cookie` to establish the CSRF cookie, then posts credentials to the login route; Laravel sets a session cookie. Subsequent requests authenticate via the session — the SPA guard — with the `X-XSRF-TOKEN` header. No tokens stored in the browser; it's a web-app session, just from JavaScript.

**Q3. What is a personal access token?**
> A random token string issued to a user — `$user->createToken('name')->plainTextToken`. The client sends it as `Authorization: Bearer <token>`. It's stored hashed in `personal_access_tokens` and can carry **abilities** (permission scopes). The plaintext is returned once at creation — lost it, revoke and reissue.

**Q4. What are token abilities?**
> Scopes on a token — `createToken('mobile', ['orders:read'])`. The token then only permits what its abilities allow, checked with `tokenCan()`. They let a read-only client get a read-only token even though the user could write — least-privilege for devices.

**Q5. When would you use Sanctum instead of Passport?**
> Whenever the consumers are my own apps — a same-origin SPA and a mobile client I control. Sanctum gives sessions and tokens with no OAuth2 machinery. I'd reach for Passport only when *third-party* applications need OAuth2 grants, clients, and scopes against my API.

**Senior follow-up: Why is a session cookie better than a token in localStorage for SPAs?**
> A token in `localStorage` is readable by any script on the page — one XSS and it's stolen. A session cookie with `HttpOnly` is invisible to JavaScript, so XSS can't exfiltrate it, and Sanctum's CSRF cookie + header exchange protects against cross-site requests. The trade is same-origin scope — which is exactly the case Sanctum's SPA mode is built for.

## Common mistakes

❌ Storing the plaintext token after creation — it's shown once; store it or lose it.

❌ Tokens in `localStorage` when the SPA is same-origin — the session cookie is the safer default.

❌ Using Passport where Sanctum suffices — OAuth2 complexity for a first-party app.

❌ Forgetting abilities — an unscoped token is the user's full power; scope tokens by device need.

## Quick revision notes

- Sanctum = **first-party API auth**: SPA sessions (cookies) + personal access tokens (Bearer)
- SPA: `/sanctum/csrf-cookie` → login → session cookie + `X-XSRF-TOKEN`
- Token: `createToken()->plainTextToken` — shown **once**; `Bearer` header after
- **Abilities** = token scopes (`tokenCan('orders:read')`)
- **Sanctum for your apps; Passport for third-party OAuth2**

## Check your understanding

1. What are Sanctum's two authentication modes?
2. How does the SPA handshake protect against CSRF?
3. What's a personal access token, and why is the plaintext shown once?
4. What do token abilities add over a plain token?
5. When is Passport the right choice instead?
