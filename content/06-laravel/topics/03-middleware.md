# Topic 3 — Middleware

**Checklist anchor:** middleware purpose · global · route · groups · parameters · terminable · priority · `$next($request)` · auth/CORS/rate-limiting/logging

**Owning lesson:** [112 Middleware](../112-middleware.md)

---

## The one-sentence answer

**Middleware is a layer that runs around the route — it inspects and modifies the request on the way in, and the response on the way out, before or after the actual handler runs.**

## The mental model

The route sits in the **middle of an onion**. Each middleware wraps it:

```text
request → [auth] → [throttle] → [session] → ROUTE → [session] → [throttle] → [auth] → response
              IN (declared order)                       OUT (reverse order)
```

Middleware *before* `$next($request)` runs on the way **in** (pre-conditions: is this user authenticated? is this request throttled?). Middleware *after* `$next($request)` runs on the way **out** (post-processing: set the `X-Duration` header, add cookies).

```php
public function handle(Request $request, Closure $next): Response
{
    // ON THE WAY IN — before the route
    if (!$request->user()) abort(401);

    $response = $next($request);   // ← the rest of the stack, then the route

    // ON THE WAY OUT — after the route
    $response->headers->set('X-Duration-Ms', 42);
    return $response;
}
```

**`$next($request)` is the pass-through**: calling it runs the rest of the stack (and eventually the route). *Not* calling it short-circuits — the route never runs.

## How it works

### Registration (Laravel 11+)

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(EnsureUserIsAdmin::class);       // global — every request
    $middleware->alias('admin', EnsureUserIsAdmin::class); // route middleware
})
```

### Global vs route vs groups

| Kind | When it runs | Where |
|---|---|---|
| **Global** | Every HTTP request | `withMiddleware()->append(...)` |
| **Route** | Only matched routes | `->middleware('auth')` on the route/group |
| **Group** | All routes in a group | `web` / `api` groups, or custom |

```php
Route::middleware('auth')->group(function () { /* all authed */ });
Route::get('/admin', ...)->middleware('admin'); // single route
```

### Middleware with parameters

```php
Route::get('/api', ...)->middleware('throttle:60,1');
// 60 requests per minute, 1-minute decay
public function handle($request, Closure $next, $limit, $decayMinutes) { ... }
```

### Terminable middleware

```php
public function terminate(Request $request, Response $response): void
{
    // runs AFTER the response is sent — like kernel->terminate()
}
```

Use for cheap post-response work; heavy work still belongs in queues.

### Middleware priority

Laravel's `MiddlewarePriority` list orders the built-in middleware (session before auth, etc.). Custom middleware runs in the order you append it. Priority matters because a middleware can depend on one earlier in the chain — auth needs session to have run.

## The plain-JS model (what the exercise does)

```js
function pipeline(layers, request) {
  let index = 0;
  function next(req) {
    if (index >= layers.length) return { status: 200, body: `handled: ${req.path}` };
    const layer = layers[index++];
    return layer(req, next); // ← $next($request)
  }
  return next(request);
}

// short-circuit: block without calling next() → the route never runs
function requiresAuth(req, next) {
  if (!req.user) return { status: 401, body: 'Unauthorized' };
  return next(req);
}
```

## Interview questions

**Q1. What happens when middleware calls `$next($request)`?**
> It hands the request to the next layer in the stack — the rest of the middleware, then eventually the route. Code before `$next` runs on the way in; code after it runs on the way out with the response in hand. Not calling `$next` short-circuits: the request never reaches the route, and you return a response directly (like a 401).

**Q2. How would you create middleware to restrict access to admins?**
> `php artisan make:middleware EnsureUserIsAdmin`, then in `handle()`: if the user is missing or not an admin, abort with `403`; otherwise `return $next($request)`. Register it with `->alias('admin', ...)` and apply `->middleware('admin')` to the admin routes.

**Q3. Middleware vs authorization policy?**
> Middleware gates at the **route level** — "is this whole route only for admins?" Policies gate at the **model/action level** — "can *this* user update *this* post?" You usually do both: admin middleware on the route, a policy check in the controller for per-record authorization.

**Q4. What's the difference between global and route middleware?**
> Global middleware runs on every HTTP request (maintenance mode, CORS, session). Route middleware only runs for routes that declare it — so auth guards `/admin` without touching public routes. Groups let you apply a set to many routes at once.

**Q5. When does the "out" pass matter?**
> Whenever you modify the response — setting headers, cookies, gzip, cache-control. The out-pass is where half of middleware's work happens, and it's the reason the same middleware class sees both sides of the route.

**Senior follow-up: What's a real middleware you've written, and why middleware?**
> A per-request logger that records the URL, duration, and status — done as middleware so every route gets it without per-controller code. Middleware was right because it's cross-cutting: the same concern applied app-wide, orthogonal to any feature.

## Common mistakes

❌ Forgetting that middleware runs twice — code after `$next` is the out-pass, not dead code.

❌ Calling `$next` then ignoring the response — you must `return` it or the chain breaks.

❌ Putting auth checks in every controller — that's what route middleware is for.

❌ Using `queue:listen` middleware assumptions in production — priority and ordering differ.

## Quick revision notes

- Middleware = **layer around the route** — in (declared order), out (reverse)
- `$next($request)` = pass through · not calling it = **short-circuit**
- **Global** (every request) · **Route** (`->middleware('x')`) · **Groups** (`web`/`api`)
- Parameters: `throttle:60,1` → `handle($req, $next, $limit, $decay)`
- **Terminable** middleware runs after the response is sent
- Middleware gates **routes**; policies gate **records**

## Check your understanding

1. Trace `$next($request)` through the onion — what runs in, what runs out?
2. How would you build an admin-only middleware and attach it to a route group?
3. Middleware vs policy — when is each the right tool?
4. Why does a middleware that sets response headers belong *after* `$next`?
5. What does terminable middleware do, and what is it not for?
