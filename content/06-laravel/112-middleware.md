# Lesson 112 — Middleware

**Interview importance:** ⭐⭐⭐⭐ — the onion layers around your routes: auth, throttling, CORS — and what `$next($request)` really does.

Lesson 111 built the map from URL to controller. Middleware sits *on top of* that map: before the request reaches the controller, and after the response leaves it. Auth, throttling, CORS, HTTPS enforcement, logging — everything that wraps a route is a layer here.

This is also the lesson where the interview turns concrete. "What does `$next($request)` do?" and "how would you restrict an admin route?" are two of the most asked Laravel questions, and both are this lesson in disguise. The request lifecycle (Lesson 106) supplies the stage; middleware is what actually runs on it.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what middleware is, where it runs, and draw the onion model from memory
- Distinguish global, route and group middleware, and where each is registered
- Read `throttle:60,1` and know exactly what the two numbers do
- Explain `$next($request)` — including why the response comes back in reverse order
- Write a custom admin middleware, register it, and apply it to a route group
- Answer "restrict an admin route" and "where does `terminate()` run?" confidently

## 1. One-Line Definition

**Middleware is a chain of layers that wrap a route: each layer inspects the request before the controller sees it, and the response after — passing both through `$next($request)`.**

## 2. Mental Model

Think of an **onion**. The request enters from the outside and passes through every layer on the way in; the response exits from the inside and passes back through every layer in reverse.

```text
request ───────────────────────────────►
        │  auth        │  throttle    │  Controller    │  throttle    │  auth        │
        ▼              ▼              ▼                ▼              ▼              ▼
  ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐
  │ layer 1 │───►│ layer 2 │───►│ controller│───►│ layer 2 │───►│ layer 1 │───► response
  │ (outer) │    │         │    │  (inner)  │    │         │    │         │
  └─────────┘    └─────────┘    └──────────┘    └─────────┘    └─────────┘
                      request flows IN, response flows OUT, layers reverse
```

The innermost "layer" is the controller. Everything a layer does before calling `$next` is "on the way in"; everything after is "on the way out".

## 3. Visual Flow

One complete pass through a single middleware:

```text
request ──► handle($request, $next)
                │
                ├─ before $next: inspect, abort / redirect if not allowed
                ▼
           $next($request)  ──► the next layer, eventually the controller
                │
                ◄── returns the response (after the controller ran)
                ▼
                ├─ after $next: modify the response (headers, logging, timing)
                ▼
           return $response  ──► back out toward the browser
```

Middleware is just code *before and after a function call*. That's the whole mechanism.

## 4. How It Works

A middleware is a class with one method. The framework builds the `$next` closure — "call the rest of the pipeline, down to the controller" — and hands it to you. You decide what happens before, and what happens after:

```php
// app/Http/Middleware/LogRequestDuration.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogRequestDuration
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        // before: nothing to block here — just record when we started

        $response = $next($request);   // the controller runs inside this call

        // after: the response is back, so the total time is known
        logger("{$request->method()} {$request->path()} took "
            . (microtime(true) - $start) . 's');

        return $response;
    }
}
```

```text
GET /users/42  →  local.INFO: GET users/42 took 0.0123s
```

A blocking middleware is the same shape with an early exit instead of `$next`:

```php
// app/Http/Middleware/EnsureUserIsAdmin.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // before: the decision — allow or stop
        if (! $request->user()?->is_admin) {
            abort(403, 'Admins only.');
        }

        return $next($request);
    }
}
```

```text
GET /admin/reports  (admin user)     → 200, the controller runs
GET /admin/reports  (regular user)   → 403 "Admins only."
GET /admin/reports  (logged out)     → 403 (not a redirect — no session check here)
```

> [!TIP]
> Aborting in middleware with `abort(403)` skips the controller entirely — the exception handler turns it into the response. No controller code runs, and that's the point.

### Registration: global, route, and groups

| Where | How | Runs on |
|---|---|---|
| **Global** | `bootstrap/app.php` → `->withMiddleware(...)` | every request |
| **Route** | `->middleware('auth')` on a route | that route |
| **Group** | `middleware('web')` / `middleware('api')` on the whole file | everything in the group |
| **Controller** | `$this->middleware('auth')` in the constructor (Lesson 113) | controller actions |

```php
// bootstrap/app.php — where middleware is registered
->withMiddleware(function (Middleware $middleware) {
    // global: runs on every request
    $middleware->append(LogRequestDuration::class);

    // group membership: add your admin gate to the web group
    $middleware->web(append: [EnsureUserIsAdmin::class]);
})
```

```text
every request:      LogRequestDuration (global)
every web request:  VerifyCsrfToken, StartSession, EnsureUserIsAdmin …
every api request:  ThrottleRequests, SubstituteBindings …   (no session, no CSRF)
```

> [!NOTE]
> Route middleware must be **aliased** before a route can refer to it by name. In `bootstrap/app.php`: `$middleware->alias(['admin' => EnsureUserIsAdmin::class])`. Without the alias, `->middleware('admin')` is an unknown name.

### Middleware with parameters: `throttle:60,1`

Middleware can take arguments from the route, separated by colons. `throttle:60,1` reads "allow 60 requests per minute per client", where `60` is the limit and `1` is the decay window in minutes:

```php
// routes/api.php — the whole API, throttled
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});
```

```text
GET /api/users         61st request in a minute:
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
```

The same mechanism powers the built-in rate limiters — `throttle:api` in modern Laravel is a configured limiter, and `throttle:10,1` in a route is an ad-hoc one. Both are the same `ThrottleRequests` class with different numbers.

## 5. Real Project Usage

| Middleware | Job | Where it's used |
|---|---|---|
| `auth` | redirect guests to the login page | every protected route |
| `auth:api` / `auth:sanctum` | authenticate by token | API routes |
| `throttle:60,1` | rate-limit a route | API groups, login endpoints |
| `verified` | require an email-verified user | profile and payment pages |
| `EnsureUserIsAdmin` | your gate | an `admin` route group |
| `CorsMiddleware` / `HandleCors` | add CORS headers | `api` group, custom |
| `TrimStrings`, `ConvertEmptyStringsToNull` | normalise input | global, on every request |

The classic "restrict an admin route" answer, end to end — alias, apply, verify:

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['admin' => EnsureUserIsAdmin::class]);
})
```

```php
// routes/web.php
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('reports', [ReportController::class, 'index']);
    Route::get('users', [AdminUserController::class, 'index']);
});
```

```text
GET /admin/reports  (logged-in admin)   → 200
GET /admin/reports  (guest)             → 302 → /login        (auth)
GET /admin/reports  (logged-in user)    → 403 "Admins only."  (admin)
```

## 6. Interview Explanation

> Middleware is a pipeline of layers around a route. Each layer's `handle($request, $next)` decides whether to let the request through — running code before `$next`, then passing the request down — and gets to touch the response after the controller returns. Global middleware runs on every request; route middleware only on the routes it's attached to; groups like `web` and `api` bundle middleware per file. Middleware can take parameters — `throttle:60,1` is 60 requests per minute — and that's how auth, throttling, CORS and my own admin checks all become the same one pattern.

That's the 30-second answer. The follow-ups are where it gets graded.

## 7. Senior-Level Insights

- **`$next($request)` is a closure over "the rest of the pipeline".** It isn't a framework call — it's the next layer, and eventually the controller. Whatever you do *after* `$next` runs, the response has already been produced. Naming that out loud is what separates the answer from a recitation.
- **The reverse pass is why headers stack correctly.** An outer layer that sets a header after `$next` overwrites what an inner layer set on the way out. Order matters twice: once going in, once coming back.
- **Order is registration order, with one exception.** Global middleware runs in registration order; but if a middleware *must* run before the session or auth exists, it declares a `$middlewarePriority` (Lesson 106's pipeline). Things that need the session can't be global-first.
- **Terminable middleware answers "after the response is sent".** `handle()` runs before the controller; `terminate()` runs after the response has gone out, in the same request but on a "flush" — perfect for slow post-response work:

```php
// app/Http/Middleware/RecordVisit.php
class RecordVisit
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        // runs after the response is flushed to the client
        Visit::record($request->path());   // e.g. analytics, slow logging
    }
}
```

- **"Is the user an admin?" is a permission, not an identity check.** `auth` answers *who are you?*; your admin middleware answers *what may you do?* — and in Laravel that "what may you do" has a native home, authorization policies (Lesson 123). Naming the distinction shows you understand the layering.

## 8. Common Mistakes

- **Treating `abort()` as a return.** `abort()` throws, so anything after it in `handle()` never runs — which is usually what you want. But a middleware that *redirects* (like the built-in `auth`) returns the redirect instead; it doesn't throw. Read the built-ins to see both idioms.
- **Applying route middleware before aliasing it** — `->middleware('admin')` with no alias registered is a "Target class [admin] does not exist" error.
- **Putting session-dependent logic in global middleware.** The session middleware is in the `web` group; a global middleware registered *before* it sees no session.
- **Forgetting that `web` and `api` are different groups.** A `throttle` on an API route, a CSRF check on a web form, and no session on `/api` — picking the wrong file means picking the wrong layers.
- **Blocking without thinking about guests.** `abort(403)` on a guest gives a 403; the built-in `auth` gives a redirect to login. Decide which behaviour the route actually needs.
- **Returning nothing from `handle()`** — Laravel needs the response; an empty return is a 200 with no body and the layers above get nothing to forward.

## 9. Best Practices

✅ Keep one responsibility per middleware — "ensure admin", not "ensure admin and log"

✅ Use the `auth` middleware to establish identity, then a *policy* or a narrow check for permission

✅ Use `abort()` to stop early; it produces a proper error response without controller code

✅ Group middleware in `bootstrap/app.php` (`web`, `api`) instead of sprinkling `->middleware(...)` everywhere

✅ Rate-limit with `throttle:60,1` on API groups and login endpoints

✅ Alias custom middleware and keep the alias table visible in `bootstrap/app.php`

❌ Don't do business logic in middleware — that's a controller's or service's job

❌ Don't set response headers both before and after `$next` without knowing which wins

❌ Don't put slow work in `handle()`; if it's post-response work, use `terminate()`

## 10. Interview Questions

**Q1. What does `$next($request)` do?**

> It's a closure that calls the next middleware in the pipeline, and eventually the controller. Before it runs, I'm "on the way in" — I can inspect the request and block it. After it returns, I'm "on the way out" — the response exists and I can modify it. Returning `$next($request)` means "let the request through".

**Q2. How would you restrict an admin route?**

> First the middleware — a class that checks `$request->user()?->is_admin` and `abort(403)` if not, registered with an alias like `admin`. Then I apply it: `Route::prefix('admin')->middleware(['auth', 'admin'])->group(...)`. `auth` handles the redirect for guests, `admin` rejects logged-in non-admins with a 403. If the permission is complex, I'd delegate to a policy instead of a raw boolean check.

**Q3. What's the difference between global, route and group middleware?**

> Global middleware runs on every request. Route middleware runs only on routes that declare `->middleware(...)`. Group middleware is applied to a whole file — the `web` group (session, CSRF) and the `api` group (throttle, no session) are the built-in examples. Registration is in `bootstrap/app.php`; routes can also receive middleware individually.

**Q4. How does `throttle:60,1` work?**

> Middleware parameters, colon-separated: `60` is the max requests, `1` is the decay window in minutes. Past the limit the client gets a `429` with `X-RateLimit-Limit` / `X-RateLimit-Remaining` headers, and Laravel keys the count by client — IP, or the authenticated user's id when a user is present.

**Q5. What is terminable middleware?**

> A middleware that also implements `terminate($request, $response)`. That method runs after the response has been flushed to the client, in the same request lifecycle — the place for analytics, slow logging and other work that shouldn't delay the response.

**Q6. Why does the response pass through middleware in reverse order?**

> Because each layer calls the next one and the call stack unwinds: the outermost layer's code after `$next($request)` runs last. It's the onion — request in, response out, layers reversed.

**Senior follow-up: Your admin check needs the session, but the app crashes when it's registered globally. Why?**

> Because global middleware runs in registration order and the session middleware lives in the `web` group, which runs later. A global middleware that reads the session before `StartSession` has run gets nothing. The fix is to attach the check to the `web` group — or the routes themselves — so it runs after the session exists, not to fight the global ordering.

## 11. Follow-up Questions

**Where do you register a middleware so routes can use it by name?**

> In `bootstrap/app.php` with `$middleware->alias(['name' => Class::class])`. Then `->middleware('name')` on a route or in a group resolves the alias. Aliases are the routing layer's handle on your classes.

**Can one middleware pass a value to the next one?**

> Yes — the request object itself. `$request->attributes->set('x', $value)` before `$next` lets any layer after it read `$request->attributes->get('x')`. The request is the shared envelope moving down the pipeline.

**What's the difference between `abort(403)` and returning a redirect?**

> `abort(403)` throws and becomes an error response — no controller runs. A redirect is a normal response (302) that the browser follows. Auth middleware redirects guests to login; a permission check aborts with 403. Choose per behaviour.

## 12. Comparison Table

| | Global | Group | Route |
|---|---|---|---|
| Runs on | every request | every route in the group | one route only |
| Registered in | `bootstrap/app.php` | `web` / `api` groups | `->middleware('…')` |
| Example | `TrimStrings` | `web`: session, CSRF | `->middleware('auth')` |

| | `handle()` | `terminate()` |
|---|---|---|
| When | before the controller | after the response is sent |
| Purpose | inspect, block, forward | post-response work |
| Example | admin check, throttle | analytics, slow logging |

## 13. Code Example

The full "restrict an admin route" story, from alias to verification:

```php
// app/Http/Middleware/EnsureUserIsAdmin.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->is_admin) {
            abort(403, 'Admins only.');
        }

        return $next($request);
    }
}
```

```text
admin user:    $next($request) is reached → controller runs → 200
regular user:  abort(403) throws before $next → exception handler → 403
guest:         $request->user() is null → null?->is_admin is null → 403
```

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['admin' => EnsureUserIsAdmin::class]);
})
```

```php
// routes/web.php
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('reports', [ReportController::class, 'index']);
});
```

```narrate
3:   the decision happens entirely before $next — nothing below runs on failure
6:   a logged-out user has no user(); the null-safe chain turns that into a clean 403
9:   the only way to the controller is through this line
14:  the alias is what lets routes say 'admin' instead of the full class name
18-20: auth handles the guest redirect; admin handles the non-admin 403
```

## 14. Performance Notes

- **Every layer runs per request, in order.** A global middleware is pure overhead on routes that never needed it — prefer group or route middleware for anything niche.
- **`throttle` reads a cache store** (by default the app's cache, often Redis). The rate-limit lookup is fast, but it's a round-trip per request — the limiter's Redis key is the cost centre.
- **`terminate()` does not delay the response** — the flush happens first. That's the entire reason it exists: move slow, non-critical work out of `handle()`.
- **Middleware ordering costs more than middleware count.** Every layer is a function call; a deep, well-ordered pipeline is cheaper than a shallow one with expensive checks duplicated across layers.
- **Don't over-layer.** An admin gate on a public route, or a log middleware on `/health` — each one pays. Measure with the profiling tools (Lesson 131) before adding layers everywhere.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| "Target class [admin] does not exist" | route middleware name isn't aliased | add `$middleware->alias(['admin' => …::class])` |
| Guests get 403 instead of a login redirect | the admin check runs before/without `auth` | put `auth` first in the middleware list |
| Everything is 403, even admins | `$request->user()?->is_admin` is always falsy | check whether the session middleware ran (global vs web group); check the column exists and is cast to bool |
| 429 too early | decay is too short for real usage, or the limit key is too narrow | tune `throttle:60,1`; consider per-user keys |
| `terminate()` never runs | it's only invoked in the standard HTTP kernel lifecycle, and it may be skipped on long-running workers | log in `terminate()` with a tag to confirm; or move work to a queue (Lesson 124) |
| Response headers missing | inner layer set them, outer overwrote on the way out | set headers in the outermost layer's *after* block, once |

## 16. Quick Revision Notes

- Middleware = layers around a route; `handle($request, $next)` is the contract
- Before `$next`: on the way in — inspect, block (`abort`, redirect). After: on the way out — modify the response
- `$next($request)` is a closure to the rest of the pipeline, ending at the controller
- Global → every request; route → one route; group → a whole file (`web`, `api`)
- Registration lives in `bootstrap/app.php`; aliases make names like `admin` usable on routes
- Parameters: `throttle:60,1` = 60 requests per 1-minute window, keyed by client
- `terminate($request, $response)` runs after the response is flushed — post-response work
- Response order is reversed: the outermost layer's after-code runs last
- `$middlewarePriority` exists because order matters for session/auth-dependent layers

## 17. Cheat Sheet

```text
class X implements the contract:
  handle(Request $request, Closure $next): Response {
      // before: inspect / block
      $response = $next($request);
      // after: modify the response
      return $response;
  }

Blocking:   abort(403) | redirect()->route('login')
Forward:    return $next($request);
Alias:      $middleware->alias(['admin' => EnsureUserIsAdmin::class]);
Apply:      Route::get(...)->middleware('admin');
            Route::prefix('admin')->middleware(['auth','admin'])->group(...);

Built-ins:  auth  verified  throttle:60,1  cache.headers  trustedproxy
Groups:     web (session, CSRF)  api (throttle, no session)
Global:     TrimStrings, ConvertEmptyStringsToNull, HandleCors

terminate(Request $request, Response $response): void  — after flush
$middlewarePriority  — when a layer MUST run before the session
```

## 18. Key Takeaways

> [!RECAP]
> - Middleware wraps routes: code before `$next($request)` on the way in, code after on the way out
> - `$next($request)` is the closure to the rest of the pipeline — the controller is the innermost layer
> - Global, group and route middleware differ only in how wide they're applied
> - `throttle:60,1` is the parameterised pattern behind all rate limiting
> - `terminate()` runs after the response is flushed — post-response work without latency
> - Restricting an admin route = a narrow check (`auth` + `admin`), not business logic in the layer
> - Responses pass back in reverse order: the onion unwinds

## Check your understanding

Answer these without looking back.

1. Draw the onion model and mark where `$next($request)` sits.
2. Explain exactly what `$next($request)` does, in terms of "the rest of the pipeline".
3. Global vs group vs route middleware — when does each run, and where is each registered?
4. Read `throttle:60,1` out loud, number by number.
5. Write the admin middleware, alias it, and apply it to a route group.
6. Why does the response hit layers in reverse order?
7. When would you use `terminate()` instead of code after `$next`?
8. A guest hits an admin route and gets a 403 instead of a login redirect. What's wrong?

## What's Next

**Lesson 113 — Controllers, Requests & Responses.** Thin controllers, form requests, and why
business logic never belongs here — the layer your routes and middleware hand the request to.
