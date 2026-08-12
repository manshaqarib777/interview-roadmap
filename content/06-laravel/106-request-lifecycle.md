# Lesson 106 — Request Lifecycle

**Interview importance:** ⭐⭐⭐⭐⭐ — the single most-asked Laravel question. "Walk me through what happens when a request hits your app" is the question, and it is also the map every other topic in this module plugs into.

Every Laravel request — a page load, an API call, an uploaded file — enters through the same door (`public/index.php`), gets bootstrapped by the same kernel, passes through the same middleware stack, and returns along the same path. If you can trace that line from start to finish, you can place *anything* in the framework: the container, providers, middleware, routing, Eloquent, even queues. This is the orientation lesson of the module — it is the single most-asked Laravel question, and the map for every other topic.

## Learning Objectives

By the end of this lesson you should be able to:

- Trace a request end-to-end: `public/index.php` → bootstrap → kernel → middleware → route → controller → response → middleware out
- Recite the kernel's bootstrapping sequence and say what each step does
- Say exactly where the container gets its chance — and why it's early
- Explain the onion model of middleware: in one order, out the other
- Answer "walk me through the request lifecycle" in under two minutes

## 1. What is the Request Lifecycle?

**The request lifecycle is the ordered path an HTTP request takes through Laravel — from the moment `public/index.php` receives it until the response travels back out the same way.**

It has three phases: **bootstrap** (turn the framework on), **dispatch** (route + middleware + controller + view, and build the response), and **terminate** (send the response and run any cleanup). Everything the framework *is* happens inside these three phases, in a fixed order you can recite.

## 2. Mental Model

Think of a **single-file queue through a kitchen that never closes.**

- The **front door** (`public/index.php`) lets every request in — one door, no exceptions, no side doors.
- The **manager** (the kernel) turns on the kitchen *before* the first order: loads the menu (config), checks the stock (providers register), and fires the burners (providers boot).
- The **maître d'** (middleware) vets each order on the way in — "is this table authenticated? is the request throttled?" — and checks the bill on the way out — "did we set the right headers?"
- The **chef** (the router + controller) cooks the actual dish using ingredients from the pantry (models/database) and plates it (the view).
- The finished dish travels back **through the same doors in reverse order**, and only then is it served (the response).

The key insight of the whole lesson: **the request goes through the middleware layers twice** — once on the way in, once on the way out. That is the onion, and it is the shape of the entire framework.

## 3. Visual Flow

```text
 browser / client
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  public/index.php                                                         │
│  (the front door — autoloads Composer, creates the app,                 │
│   hands the request to the kernel)                                        │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Kernel — bootstrapping (turns the framework on, once per request)        │
│  1. Load environment (.env)                                               │
│  2. Load config (config/*.php)                                            │
│  3. Handle exceptions                                                     │
│  4. Register facades                                                      │
│  5. Register service providers (container gets its chance)                │
│  6. Boot service providers                                                │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Middleware stack — ON THE WAY IN  (top → bottom)                         │
│  auth  →  throttle  →  session  →  cache-headers  …                       │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Router: match the URL → resolve the route's controller & parameters      │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Controller → Models (Eloquent SQL) → View (Blade)                        │
│  → a Response object is built                                             │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Middleware stack — ON THE WAY OUT (bottom → top)                         │
│  cache-headers  →  session  →  throttle  →  auth                          │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
  HTTP response sent → the kernel terminates → the request is over
```

Both passes matter: middleware *before* the route runs pre-conditions, middleware *after* the route runs post-processing — and the same middleware sees both sides.

## 4. How It Works

The whole lifecycle is driven by `public/index.php` handing the request to a **kernel**, and the kernel being a pipeline you can quote.

```php
// public/index.php — trimmed to what actually matters
require __DIR__.'/../vendor/autoload.php';               // 1. Composer autoloader

$app = require_once __DIR__.'/../bootstrap/app.php';     // 2. build the container/app

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);  // 3. resolve the kernel

$response = $kernel->handle(                              // 4. run the lifecycle
    $request = Illuminate\Http\Request::capture()         //    (bootstrap + dispatch)
);

$response->send();                                        // 5. send bytes to the client

$kernel->terminate($request, $response);                  // 6. cleanup (queued jobs, etc.)
```

```narrate
line 1:  the Composer autoloader — without it no class is ever found
line 2:  bootstrap/app.php builds the application (the container) and returns it
line 3:  the container resolves the HTTP kernel — a provider-registered service
line 4:  the entire lifecycle happens inside kernel->handle()
line 5:  the Response object streams itself to the client
line 6:  terminate() runs post-response cleanup — nothing is sent after this line
```

Inside `kernel->handle()`:

1. **Bootstrap** — the kernel runs its bootstrappers *in order* (next section).
2. **Send the request through the router** — the kernel passes the request through the middleware stack (which wraps the router), the router matches the URL to a route, and the route's controller runs.
3. **The controller returns something** — a `Response`, a view, a redirect, or (in API-land) JSON. Laravel converts whatever it is into a proper `Illuminate\Http\Response`.
4. **The response returns through the middleware** — each layer gets its "out" pass.
5. **`send()`** writes the response to the client, then `terminate()` runs any post-response work.

The single most important sentence in the lesson: **the kernel is a pipeline — bootstrap, then a stack of middleware wrapping the route.**

> [!DEEPDIVE]
> The onion is not a Laravel invention — it's the HTTP-kernel shape shared by every modern framework. Symfony's HttpKernel, Express's middleware chain, and Next.js's `proxy.ts` (Lesson 94) all run handlers *inside* a decorator stack, and the response unwinds through the same stack in reverse. When you say "the request goes in through middleware and out through the same middleware," you're describing an architecture that transfers across every stack you've learned.

## 5. Real Project Usage

You never write this code — you *rely* on it. But you touch the lifecycle in real work constantly:

| Where you live | Which lifecycle stop |
|---|---|
| `routes/web.php` / `routes/api.php` | The router — your URL → controller mappings |
| Middleware classes | The stack — auth, throttle, logging, CORS, session |
| `bootstrap/app.php` | The wiring — which middleware, which providers, where routing is registered |
| `app/Providers/` | The bootstrap phase — services that register and boot here |
| Controllers, models, views | The dispatch phase — the actual feature |
| `AppServiceProvider::boot()` | "Runs on every request after registration" — the hook for per-request wiring |

One concrete daily case: you add a middleware to `bootstrap/app.php` for a new header on API responses. Because the stack wraps the route, that middleware runs for *every* API request automatically — no per-controller code. The lifecycle is why one-line config changes affect the whole app.

## 6. Interview Explanation

> Every request enters through `public/index.php`. It builds the application from `bootstrap/app.php`, resolves the HTTP kernel, and calls `$kernel->handle($request)`.
>
> The kernel first runs its bootstrappers: load the `.env` environment, load the config, register the exception handler and facades, register the service providers into the container, then boot them. That's where the container gets its chance — providers are registered early precisely so everything downstream can resolve services.
>
> Then the request is sent through the middleware stack, which wraps the router. Middleware runs in order on the way in — auth, throttling, session — then the router matches the URL to a route, the route resolves the controller, and the controller builds a response, usually through models and views.
>
> The response then travels back out through the same middleware stack in reverse order, gets sent to the client, and the kernel's `terminate()` method runs any post-response cleanup. So the shape is: bootstrap, in through middleware, route, controller, out through middleware, send, terminate.

That is the whole answer. Two minutes, no notes, correct at both the 10,000-foot and the file level.

## 7. Senior-Level Insights

- **The container gets its chance in the bootstrap phase, before any route runs.** Providers register services into the container so that *when* routing, middleware, and controllers ask for dependencies, the container can resolve them. Ask "where does the container get its chance?" in an interview and the answer is: step 5 of the kernel bootstrapping — *before* the middleware stack.
- **Every request re-bootstraps.** There's no long-running server state by default: each request re-runs the bootstrappers. That's why config caching and OPcache matter (Lesson 105), and it's why "bootstrap cost" is a per-request cost.
- **The onion is the architecture.** Middleware in/out is the *same* idea as HTTP decorators, Express middleware (Lesson 17's request pipeline analog), and — if you've done Next.js — the `middleware.ts`/proxy gate (Lesson 94). The pattern repeats because it's the right one.
- **The kernel is swappable.** The console kernel (`artisan`) runs the *same* bootstrap but dispatches to commands instead of routes. That's why `php artisan` commands have access to the exact same container, config, and providers.
- **`terminate()` is for cheap async**, not heavy work. Laravel sends the response before running it, but it still holds the process — real async belongs in queues (Lesson 124). Knowing the boundary between "terminate" and "queue" is a senior tell.
- **HTTP vs Console vs Queue worker** are three front doors into the *same* bootstrapped application. If you understand one lifecycle, you understand the other two — that mental unification is worth stating out loud.

## 8. Common Mistakes

❌ Skipping the bootstrap phase in the answer — "route → controller → response" is the app, not the *framework*; the framework is the bootstrap before it.

❌ Saying middleware runs "before the controller" as if it only runs once. It runs twice — in and out, in reverse order — and that second pass is where response headers and cookies get set.

❌ Forgetting where the container gets its chance. If you can't say "during provider registration, step 5 of bootstrapping, before the route," the answer sounds learned-by-rote.

❌ Claiming `public/index.php` is optional — it's the entry point the web server points at. Every request, every time.

❌ Confusing the *kernel's* bootstrappers with *service providers*. Bootstrappers are the framework's own six steps; providers are what *your app and packages* register during those steps.

❌ Saying the response is "returned to the browser" before it passes back through middleware — the middleware out-pass modifies the response (headers, cookies) before `send()`.

## 9. Best Practices

✅ Memorise the six bootstrappers in order — they're short, stable, and exactly what interviewers expect

✅ Answer lifecycle questions with the *shape* first (bootstrap → in → route → out → send) and fill in the stops after

✅ Know that "where does the container get its chance?" = provider registration, early in bootstrap

✅ Trace your own app's stops: which middleware, which route group, which controller — being specific is a senior signal

✅ Mention `terminate()` as the cleanup seam, but distinguish it from real async (queues)

❌ Don't hand-wave the bootstrap phase — name the steps

❌ Don't describe a request as "going to the controller" without mentioning middleware wraps it both ways

## 10. Interview Questions

**Q1. Walk me through the Laravel request lifecycle.**

> A request hits `public/index.php`. That file autoloads Composer, builds the app from `bootstrap/app.php`, resolves the HTTP kernel, and calls `handle($request)`. The kernel bootstraps: loads `.env`, loads config, registers the exception handler and facades, registers service providers into the container, and boots them. The request then goes through the middleware stack — which wraps the router — gets matched to a route, and the controller runs, building a response through models and views. The response passes back out through middleware in reverse, is sent to the client, and `terminate()` runs cleanup.

**Q2. Where does the service container fit into the lifecycle?**

> During the bootstrap phase, step five: providers register their services into the container, then step six boots them. After that, every downstream resolution — middleware, route dependencies, controller method injection — pulls from that same container. That early registration is what makes dependency injection work for the rest of the request.

**Q3. What does the kernel's bootstrapping sequence do, in order?**

> Six steps: load the environment from `.env`, load the config files, register the exception handler, register facades, register all service providers into the container, then boot them. The first two are configuration, the middle two are infrastructure, and the last two are where the application's own services come to life.

**Q4. When does middleware run relative to the controller?**

> Twice. On the way in, in the order it's declared — auth, throttling, session. Then the route and controller run and build the response. On the way out, the same middleware runs again in reverse order, which is where response headers, cookies, and post-processing happen. Middleware is an onion around the route.

**Q5. What is `terminate()` for?**

> It runs after the response has been sent to the client, so the user isn't waiting on it — cleanup and cheap deferred work. It's still in-process though; genuinely slow or independent work belongs in the queue system, not `terminate()`.

**Q6. What's the difference between HTTP and console kernels?**

> They share the same bootstrap — the same config, container, and providers — but the HTTP kernel dispatches to routes and middleware, while the console kernel dispatches to artisan commands. Same application, two front doors.

**Senior follow-up: How would you make the lifecycle faster?**

> Attack the bootstrap cost first, because it's paid every request: `php artisan config:cache`, `route:cache`, and `optimize` pre-compile the work the bootstrappers do, and OPcache stops PHP recompiling files. After that, the bottleneck is no longer the framework — it's the queries and views the route runs. I'd measure with something like Telescope or a profiler before optimising anything.

## 11. Follow-up Questions

**Where would you add code that needs to run on every request?**

> In a middleware — that's the layer that runs for every matching request without per-controller code. If it's app-wide (like a header or a CORS rule), register it in `bootstrap/app.php`; if it's scoped, attach it to a route group.

**Does the lifecycle differ for API requests?**

> The shape is identical. `routes/api.php` is a different route file with a different middleware group — typically no web session middleware, but JSON error handling and rate limiting — and the same kernel, bootstrap, and container underneath.

**What runs before the kernel?**

> `public/index.php` itself: the Composer autoloader loads every class, and `bootstrap/app.php` creates the application instance. So technically, the container exists *before* the kernel is resolved — the kernel is one of the services the container provides.

**Why does registration come before booting?**

> Because booting often *uses* other services. Providers register first so that during boot, every provider can resolve whatever it needs from the container. Order matters: register everything, then let everything boot.

## 12. Comparison Table

| | **Laravel lifecycle** | **Plain PHP** | **Next.js request path** (L94, L86) |
|---|---|---|---|
| Entry point | `public/index.php` (always) | Whatever file the URL hits | Route files / `proxy.ts` |
| Framework bootstrap | Kernel bootstrappers: env → config → exceptions → facades → providers | None — you wire it | Next.js internal render pipeline |
| Pre-route layer | Middleware stack (in, then out) | Nothing | `proxy.ts` / middleware |
| Dispatch | Router → controller | The file is the handler | App Router → Server Component |
| Post-route layer | Same middleware, reverse order | n/a | `proxy.ts` after render |
| Cleanup | `kernel->terminate()` | n/a | Request scope teardown |
| Repeat per request | Full bootstrap every time | Whatever the file does | Framework bootstrap per request |
| The point | One framework, one path, everything plumbed | You are the framework | One framework, one path |

## 13. Code Example

A middleware that sees both sides of the onion — you will write classes shaped exactly like this:

```php
// app/Http/Middleware/TrackRequest.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);                    // ON THE WAY IN
        info('request started', ['url' => $request->fullUrl()]);

        $response = $next($request);                 // ← the route (and the rest
                                                     //   of the stack) runs here

        $response->headers->set('X-Duration-Ms',     // ON THE WAY OUT
            (int) round((microtime(true) - $start) * 1000));
        info('request finished');

        return $response;
    }
}
```

```php
// bootstrap/app.php (Laravel 11+) — registering that middleware
return Application::configure(basePath: dirname(__DIR__))
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(TrackRequest::class);
    })
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
    )
    ->create();
```

```narrate
line 2:   every middleware receives the request and the $next closure
line 4:   code above $next($request) runs on the way IN
line 5:   $next($request) runs the rest of the stack, then the route
line 7:   code below $next(...) runs on the way OUT — the response is back
line 8:   the out-pass is where headers and cookies belong
line 12:  one line in bootstrap/app.php attaches it to the whole app
```

What the request produces — a reader can trace this in their head:

```text
GET /dashboard

  [IN]  TrackRequest::handle        log "request started"
  [IN]  auth middleware             session valid → pass
  [IN]  throttle middleware         under limit → pass
  [IN]  router matches /dashboard   → DashboardController@index
        controller + Eloquent       SQL: select * from `users` where id = 7
        view renders                HTML built
  [OUT] throttle middleware         nothing to add
  [OUT] auth middleware             nothing to add
  [OUT] TrackRequest::handle        X-Duration-Ms: 42   ← the out-pass pays off

HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
X-Duration-Ms: 42
```

The `X-Duration-Ms` header exists *because* the response comes back through the same middleware — the out-pass is not decoration, it's where half of the framework's work happens.

## 14. Performance Notes

The lifecycle's performance story is the bootstrap story (Lesson 105) plus one middleware rule:

- **Bootstrap runs every request.** `config:cache`, `route:cache`, `optimize`, and OPcache make the six bootstrappers nearly free. A cached config is one file read instead of dozens.
- **Middleware is per-request overhead** in both directions. Each layer costs something on the way in *and* on the way out. Laravel 11's slimmer default stack is a performance decision, not just tidiness.
- **The route phase is where time actually goes** — controller work, SQL, view rendering. Bootstrap and middleware are typically single-digit milliseconds; a missing index on a hot query is seconds.
- **`terminate()` is not async.** It runs after send but still blocks the process. If you're putting minutes of work there, you've misread the lifecycle — queues exist for that.
- **Interview framing:** "make the bootstrap cheap, keep middleware lean, then measure the queries" is the correct ordering. Optimising the route before caching the config is optimising the wrong end.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| Middleware never runs | Not registered in `bootstrap/app.php` or attached to a group | Check `withMiddleware()`; `php artisan route:list` shows group middleware |
| Header/cookie set in controller is missing | It's set *after* the out-pass ran — set it in middleware or on the Response object before it leaves the controller | Move the mutation to an out-pass middleware, or set it on the Response directly |
| `Class "…" not found` during bootstrap | Provider referenced a class before autoloading that class | `composer dump-autoload`; check the provider's `use` statements |
| Config changes "don't apply" | `config:cache` serving a stale compiled config | `php artisan optimize:clear` after config edits |
| Every request is slow, even simple routes | No OPcache and/or no config cache — full bootstrap recompile per request | `php -d opcache.enable=1`, `php artisan optimize` |
| `terminate()` code never runs | Using `php artisan serve` in some setups, or the method isn't registered | Confirm the kernel's `terminate()` is the one being called (check `bootstrap/app.php` wiring) |

## 16. Quick Revision Notes

- Entry: **`public/index.php`** → autoload → build app → resolve kernel → `handle()`
- **Bootstrap (6 steps)**: env → config → exceptions → facades → **register providers** → **boot providers**
- The **container gets its chance at step 5** — providers register early so everything downstream can resolve
- Dispatch: **middleware in → router → controller → models/views → response**
- **Middleware runs twice**: in (declared order), out (reverse order) — the onion
- **`send()`** streams the response; **`terminate()`** runs post-send cleanup
- Same bootstrap for **HTTP kernel, console kernel, queue worker** — three doors, one app
- Laravel 11+: wiring lives in `bootstrap/app.php`

## 17. Cheat Sheet

```text
public/index.php
  ├─ vendor/autoload.php          ← every class, loaded once
  ├─ bootstrap/app.php            ← build the application (container)
  ├─ $kernel->handle($request)    ← THE lifecycle
  │    ├─ bootstrappers (6, in order):
  │    │   1. load environment        (.env)
  │    │   2. load config             (config/*.php)
  │    │   3. register exceptions     (handler)
  │    │   4. register facades
  │    │   5. register providers      ← container gets its chance
  │    │   6. boot providers
  │    ├─ middleware stack (IN, top→bottom)
  │    ├─ router → route → controller
  │    │    └─ models (Eloquent) + views (Blade) → Response
  │    ├─ middleware stack (OUT, bottom→top)
  │    └─ return $response
  ├─ $response->send()
  └─ $kernel->terminate($request, $response)   ← cleanup, post-send

Order to remember:  bootstrap → in → route → out → send → terminate
```

## 18. Key Takeaways

> [!RECAP]
> - Every request enters **`public/index.php`** and lives or dies inside `kernel->handle()`
> - The **six bootstrappers run in order** — env, config, exceptions, facades, register providers, boot providers
> - **The container gets its chance at provider registration** — step 5, before any route
> - The request goes **in through middleware, out through the same middleware in reverse** — the onion
> - The router matches the URL; the controller builds the response through models and views
> - **`send()`** ships bytes; **`terminate()`** runs cleanup after the user has the response
> - HTTP kernel, console kernel, and queue workers share the **same bootstrap** — learn one lifecycle, know all three
> - This lifecycle is the **map for the whole module** — every later lesson is a stop on this line

## Check your understanding

Answer these without looking back.

1. In one sentence, what is the request lifecycle?
2. Write the six kernel bootstrappers in order.
3. Where exactly does the container get its chance — and why is it there?
4. Draw the middleware onion: how many times does middleware run, and in what orders?
5. Trace one request: name every stop from `public/index.php` to the bytes leaving the server.
6. What does `terminate()` do, and what is it *not* for?
7. How is the console kernel the same as the HTTP kernel — and how is it different?

## What's Next

**Lesson 107 — Application Structure & Bootstrapping.** `bootstrap/app.php`, the `app/` directory anatomy, service providers — register vs boot — and how the bootstrapping sequence you just traced is assembled in a real project.
