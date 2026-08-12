# Topic 23 — API Development

**Checklist anchor:** REST · HTTP methods · status codes · API Resources · versioning · pagination · filtering · sorting · searching · rate limiting · auth · error handling

**Owning lessons:** [133 Laravel API + Next.js & Payments](../133-api-nextjs-stripe.md) · [128 Rate Limiting & Security](../128-security.md)

---

## The one-sentence answer

**A Laravel API is the same framework pointed at JSON — REST routes, resources for consistent shapes, validation, rate limits, auth, and standardized errors — designed for clients that can't see your views.**

## The mental model

An API is a **contract with a client you don't control**. Every decision serves that contract:

```text
client ── GET /api/orders?status=paid&page=2 ──► Laravel API
   ◄── { data: [...], links, meta } ──

The contract: stable URLs, precise status codes, consistent shapes,
bounded pages, and clear errors — so the client can build on it.
```

The checklist's list is the contract's clauses: REST shape, correct HTTP codes (Lesson 25), API Resources (Lesson 24), pagination (Lesson 47), filtering/sorting/searching, rate limiting (Lesson 35), authentication (Lesson 17/19), and error handling.

## How it works

### REST routes & methods

```php
// routes/api.php
Route::apiResource('orders', OrderController::class);   // index, store, show, update, destroy
// GET /api/orders · POST /api/orders · GET/PUT/PATCH/DELETE /api/orders/{order}
```

HTTP method = the verb (`GET` read, `POST` create, `PUT`/`PATCH` update, `DELETE` remove), URL = the noun, status code = the outcome (Lesson 25).

### Filtering, sorting, searching

```php
// a standard pattern: query params → scopes, whitelisted
Order::query()
    ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
    ->when($request->filled('sort'), fn ($q) => $q->orderBy($sortColumn, $request->input('dir', 'asc')))
    ->paginate($request->integer('per_page', 50));

// the rule: WHITELIST what the client may sort/filter by — never pass
// the param into orderBy() raw (SQL injection + nonsense columns)
```

### Rate limiting

```php
RateLimiter::for('api', fn ($request) => Limit::perMinute(100)->by($request->user()?->id ?: $request->ip()));
Route::middleware('throttle:api')->group(function () { /* all API routes */ });
// 429 when exceeded (Lesson 35)
```

### Authentication

```php
Route::middleware('auth:sanctum')->group(function () {
    // the client authenticates with a Bearer token (Lesson 19)
});
```

### Error handling — the consistent shape

```php
// app/Exceptions/Handler or the render method — one shape for every error:
// { "message": "...", "errors": { field: [...] } }
// 401 auth · 403 authz · 404 missing · 422 validation · 429 rate limit

// validation already returns 422 with {"errors": {...}} — keep that shape
// for everything else so clients parse one contract
```

### API versioning

```php
// three approaches:
Route::prefix('api/v1')->group(fn () => require base_path('routes/api_v1.php'));
Route::prefix('api/v2')->group(fn () => require base_path('routes/api_v2.php'));
// or: URL prefix (/api/v1/orders) vs header (Accept: application/vnd.app.v1+json)
```

URL versioning is the common, visible choice; header versioning keeps URLs stable. The point: **breaking changes get a new version, never silently break old clients.**

## Interview questions

**Q1. What does a well-designed Laravel API look like?**
> REST-shaped routes (`apiResource`), precise status codes (201 created, 422 validation, 429 rate-limited — Lesson 25), consistent JSON via API Resources (Lesson 24), bounded pages (paginate/cursorPaginate — Lesson 47), whitelisted filtering/sorting/searching, auth via Sanctum tokens, and one error shape across the app. The API is a contract — every piece keeps it stable and parseable.

**Q2. How do you do filtering and sorting safely?**
> Query params map to scopes with `when()` — `?status=paid&sort=-created_at`. The security rule: **whitelist the columns** — never pass a client-supplied string into `orderBy()` raw. Filtering uses `where`/scopes; sorting uses a whitelist map (`['created_at', 'total']` → actual columns).

**Q3. How do you paginate an API?**
> `paginate()` returns `data`, `links`, `meta` (total, current_page, per_page); `cursorPaginate()` returns `data` + `next_cursor` — the scale choice (Lesson 47). The API exposes the pagination meta so the client can render the control; per_page is capped so a client can't request 10,000 rows.

**Q4. How do you handle API errors?**
> Standardized: 401/403/404/422/429/500 (Lesson 25), with a consistent JSON shape — `{"message": ..., "errors": {...}}`. Laravel's validation already returns 422 with that shape; custom exceptions render the same way. A client should be able to parse *any* error with one code path.

**Q5. How do you version an API?**
> URL prefix (`/api/v1/orders`) or header-based (Accept version). URL is visible and simple; header keeps URLs stable. The rule: breaking changes ship as a new version and old versions stay alive (or at least announced-deprecated) — never break the contract silently.

**Senior follow-up: How would you design an API handling 1M requests/day?**
> The senior layers: stateless auth (Sanctum tokens — no session affinity), Redis-backed rate limiting (Lesson 35), cursor pagination for deep lists (Lesson 47), caching hot reads (Lesson 33), queues for side effects (Lesson 26), an index per filtered column (Lesson 63), and monitoring query counts and p95 latency. At 1M/day the DB and cache are the story — the API code is the thin layer in front.

## Common mistakes

❌ Returning the Eloquent model raw — inconsistent shapes; use API Resources (Lesson 24).

❌ Raw client input into `orderBy()`/`where()` — injection + nonsense columns; whitelist.

❌ Unbounded lists — no pagination or an uncapped per_page.

❌ Breaking clients silently — version the API instead of changing responses.

❌ One error shape for web, another for API — keep `{message, errors}` everywhere.

## Quick revision notes

- API = **a contract with an uncontrolled client**
- REST routes (`apiResource`) + precise codes (Lesson 25) + Resources (Lesson 24)
- Filter/sort/search via **whitelisted** params + `when()` scopes
- **Paginate**, cap `per_page` — cursor for huge sets
- Auth: **Sanctum** tokens · Rate limit: `throttle:api` → 429
- Errors: **one shape** (`{message, errors}`) across the app
- **Version** breaking changes — never break the contract silently

## Check your understanding

1. What makes an API a "contract," and what clauses matter?
2. How do you keep sorting safe from client input?
3. Which paginator do you pick for a huge, fast-changing list?
4. What's the one error shape, and how do you keep it consistent?
5. How do you ship a breaking change without breaking clients?
