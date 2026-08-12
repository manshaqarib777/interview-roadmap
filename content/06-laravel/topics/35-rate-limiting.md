# Topic 35 — Rate Limiting

**Checklist anchor:** Laravel RateLimiter · API throttling · user-based limits · IP-based limits · Redis-backed rate limiting · 100 req/min/user

**Owning lesson:** [128 Rate Limiting & Security](../128-security.md)

---

## The one-sentence answer

**Rate limiting caps how often a client can hit an endpoint — `throttle:60,1` or the `RateLimiter` facade — returning 429 when the limit is exceeded.**

## The mental model

```text
request → rate limiter → under limit? → route runs
                        → over limit? → 429 Too Many Requests
```

Rate limiting is the **bouncer at the API door**. It protects the server from abusive clients (bots, scraping, a misbehaving integration) and protects shared resources (login attempts, email sends, expensive queries) from being hammered.

The checklist's example: **100 requests/minute/user** — each authenticated user gets a budget; exceed it and the API says 429 until the window resets.

## How it works

### The middleware — `throttle`

```php
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/api/orders', ...);   // 60 requests per minute
});
// throttle:{max attempts},{decay minutes}
```

The built-in `throttle` middleware tracks by IP by default and returns **429** with `X-RateLimit-*` headers when exceeded.

### The `RateLimiter` facade — per-user and custom

```php
// in a service provider's boot() or routes:
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(100)                       // 100 req/min/user
        ->by($request->user()?->id ?: $request->ip()); // authenticated → user id; else IP
});
```

```php
// apply it:
Route::middleware('throttle:api')->group(function () { /* ... */ });
```

`->by()` is the key: **the limit is scoped to a key** — user id when logged in, IP otherwise. That's how "100/minute/user" is per-user, not per-server.

### Other limit shapes

```php
Limit::perMinute(60);
Limit::perHour(1000);
Limit::perDay(100);
->by($request->ip());                          // IP-based
Limit::perMinute(5)->by($request->input('email')); // per-credential (login attempts)
```

### Redis-backed

```php
// .env: CACHE_STORE=redis
// the limiter stores its counters in the cache store — Redis means the limits are
// shared across all app servers, not per-server
```

With the file cache, each server counts its own requests — behind a load balancer, the limit is multiplied by the server count. **Redis makes the counter global** (Lesson 34).

## The plain-JS model (what the exercise does)

```js
function rateLimit(key, max, windowMs) {
  const count = (counters[key] ||= 0);
  if (count >= max) return 429;              // over the limit
  counters[key] = count + 1;
  setTimeout(() => counters[key]--, windowMs); // window decay
  return 200;                                 // under the limit
}
```

## Interview questions

**Q1. What is rate limiting, and why does it matter?**
> Capping how often a client may hit an endpoint — the bouncer at the API door. It protects the server from abusive clients and protects shared resources (logins, email, expensive queries) from being hammered. Laravel's `throttle:60,1` middleware or the `RateLimiter` facade enforce it, returning 429 when exceeded.

**Q2. `throttle:60,1` — what does that mean?**
> Max 60 attempts per 1-minute decay window. The built-in middleware tracks by IP and returns 429 with rate-limit headers when the limit is hit. The middleware form is the quick route-level version; the `RateLimiter` facade is the flexible one (per-user keys, custom limits).

**Q3. How do you do per-user rate limiting?**
> With `RateLimiter::for('api', fn ($request) => Limit::perMinute(100)->by($request->user()?->id ?: $request->ip()))`. The `->by()` key is the scope: authenticated requests count against the user's id, anonymous ones against the IP. That's how "100 requests/minute/user" works — the budget follows the user, not the connection.

**Q4. Why Redis for rate limiting?**
> Because the counter must be shared. With the file cache, each app server counts separately — a 100/min limit behind 4 servers is effectively 400/min. Redis gives one global counter (Lesson 34), so the limit is exact regardless of how many servers serve the traffic.

**Q5. What does a rate-limited client see?**
> **429 Too Many Requests** (Lesson 25), with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and usually a `Retry-After` header so the client knows when the window resets. A well-behaved client backs off; the limit is enforced server-side regardless.

**Senior follow-up: How do you rate-limit login attempts specifically?**
> Scope the limit to the *credential*, not the IP — `Limit::perMinute(5)->by($request->input('email'))` — so an attacker can't rotate IPs to brute-force one account, and one user's failures don't lock out a shared office IP. The general principle: **scope the limit to the thing being protected** — user for API abuse, email for credential attacks, IP as the fallback.

## Common mistakes

❌ IP-based limits behind a load balancer — every user shares the proxy's IP (unless configured).

❌ File-cache counters on multiple servers — the limit multiplies per server; use Redis.

❌ Rate-limiting by IP when per-user is the intent — authenticated requests should key on the user.

❌ No limit on expensive endpoints — an unthrottled report endpoint is a self-DoS.

## Quick revision notes

- Rate limit = **the bouncer** — cap requests, return 429 when exceeded
- `throttle:60,1` = middleware form · `RateLimiter::for(...)` = flexible form
- `Limit::perMinute(100)->by($key)` — **the key scopes the limit** (user/IP/email)
- **Redis** = one shared counter across servers (Lesson 34)
- 429 + `X-RateLimit-*` / `Retry-After` headers
- Scope the limit to **what's protected** — user for API, email for logins

## Check your understanding

1. What does `throttle:60,1` actually enforce?
2. How is "100/minute/user" scoped to the user?
3. Why is file-cache rate limiting wrong behind a load balancer?
4. What status code and headers does an exceeded client get?
5. How do you rate-limit logins without locking out an office IP?
