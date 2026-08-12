# Topic 61 — Laravel Octane

**Checklist anchor:** why Octane improves performance · long-lived workers · Swoole · RoadRunner · worker memory · application state · memory leaks · request lifecycle differences

**Owning lesson:** [131 Laravel Performance & Deployment](../131-performance-deployment.md)

---

## The one-sentence answer

**Octane boots the framework once and serves thousands of requests from long-lived workers — instead of bootstrapping per request — by running Laravel on Swoole or RoadRunner.**

## The mental model

The default lifecycle (Lesson 106) pays a **bootstrap cost every request**:

```text
PHP-FPM (default)
  request 1:  [boot framework] → handle → die     ← bootstrap paid again
  request 2:  [boot framework] → handle → die     ← and again
```

Octane keeps workers alive:

```text
Swoole / RoadRunner
  worker starts: [boot framework ONCE]
  request 1:  handle → reuse the worker
  request 2:  handle → reuse the worker          ← bootstrap paid once
  ...thousands of requests, one bootstrap
```

The win is the **bootstrap cost amortized to zero**: no config reload, no container rebuild, no provider re-registration per request. Combined with OPcache, that's why Octane can be an order of magnitude faster on framework-bound workloads.

## How it works

### Setup

```bash
composer require laravel/octane
php artisan octane:install        # choose Swoole or RoadRunner
php artisan octane:start          # serve from the long-lived workers
php artisan octane:reload         # restart workers after code changes (dev)
```

### Swoole vs RoadRunner

| | Swoole | RoadRunner |
|---|---|---|
| What | PHP extension + server | Go binary + PHP workers |
| Install | PHP extension (`swoole`) | A binary (no extension) |
| Memory | Shared across requests (care needed) | Workers are separate processes |
| Popularity | Common for Octane deployments | The default in Octane's installer |
| Best for | PHP-extension shops, heavy Octane | Teams wanting no PHP extension |

Both run the **same Octane application** — the difference is the process model underneath.

## The critical differences — what changes in Octane

The senior part isn't the speed; it's **what breaks**. Long-lived workers change the rules:

### 1. Application state persists between requests

```php
// ❌ a property on a singleton leaks across requests:
class UserState {
    public $currentUser;   // request 1 sets it, request 2 reads it — BUG
}
// the worker is reused — so is the memory

// ✅ per-request data belongs in the request, session, or a request-scoped store:
// $request->user() / session / context, never a worker-level property
```

### 2. Memory leaks are now fatal

A per-request leak that PHP-FPM "cleaned up" when the process died now **accumulates in the worker** until the worker must restart. Long-running workers make memory discipline a production requirement — unbounded caches, static state, and fat globals are leaks.

### 3. The lifecycle is different

- **`terminate()` doesn't run per request the same way** — no process death to hook into; use `Octane::tick()` or per-request hooks for cleanup.
- **Facades and singletons are shared** — the container instance lives for the worker's life.
- **Local state must be reset** — anything request-scoped must be cleaned at the end of each request (middleware is a good home).

### 4. What to avoid

- Static/global mutable state (request data in class properties).
- Per-request singletons that grow (caches without bounds).
- Relying on process death for cleanup.

## When Octane is the right call

| Yes | No |
|---|---|
| Framework-bound latency (many requests, light work) | Long-running CPU-heavy jobs per request |
| You can add Swoole/RoadRunner to the stack | Shared hosting / managed PHP-FPM |
| The app handles the long-lived-worker rules | The codebase has per-request state everywhere |
| The bootstrap cost is a real share of latency | The bottleneck is the DB (Octane won't fix queries) |

**The honest senior note:** Octane speeds up the *framework*; it doesn't fix slow queries, N+1 (Lesson 11), or a missing index (Lesson 63). Measure first (Lesson 62) — if the profile says bootstrap, Octane helps; if it says SQL, fix the SQL.

## Interview questions

**Q1. What is Octane, and why is it faster?**
> Octane runs Laravel on long-lived workers via Swoole or RoadRunner. The framework bootstraps **once** per worker instead of once per request — no per-request config load, container build, or provider registration. On framework-bound workloads that's a large latency win; on DB-bound workloads it changes nothing.

**Q2. Swoole vs RoadRunner?**
> Swoole is a PHP extension that embeds the server in PHP. RoadRunner is a Go binary that manages PHP worker processes — no extension. Both run the same Octane app; the choice is process model and infrastructure preference. Octane's installer offers both.

**Q3. What breaks with long-lived workers?**
> Application state. A singleton property set in request 1 persists into request 2 — per-request data must live in the request/session, not on a shared object. Memory leaks accumulate instead of dying with the process. And `terminate()`/process-death cleanup doesn't fire the way PHP-FPM developers expect.

**Q4. How do you handle per-request state in Octane?**
> Keep it in request-scoped places — `$request`, the session, or a request-scoped store — and reset anything shared at the end of each request (middleware is the natural seam). Never store request data on a singleton or static property; the worker will carry it into the next request.

**Q5. When is Octane NOT the answer?**
> When the bottleneck is the database — slow queries, N+1, missing indexes — Octane only accelerates the framework. And it's not for codebases full of per-request static state without the discipline to fix it. Measure first (Lesson 62): bootstrap-heavy → Octane; SQL-heavy → fix the queries.

**Senior follow-up: How do you deploy and monitor Octane?**
> Run `octane:start` under a supervisor (like a worker — Lesson 26/27), restart workers on deploy (`octane:reload`), and watch worker memory — a rising RSS across requests is a leak. Keep per-request data scoped, and monitor both request latency *and* worker restarts: restarts hide leaks, and hiding leaks hides incidents.

## Common mistakes

❌ Per-request state on singletons/statics — the #1 Octane bug.

❌ Expecting Octane to fix slow queries — it accelerates the framework, not the DB.

❌ No worker-memory monitoring — leaks hide until the worker OOMs.

❌ Cleanup logic relying on process death — that hook doesn't exist the same way.

## Quick revision notes

- Octane = **bootstrap once, serve thousands** — Swoole or RoadRunner workers
- PHP-FPM pays bootstrap per request; Octane amortizes it to zero
- **Application state persists** — per-request data stays in request/session
- **Memory leaks accumulate** — monitor worker RSS, restart on deploy
- Swoole = extension · RoadRunner = Go binary, no extension
- Fix the **framework** cost, not the DB cost — measure first

## Check your understanding

1. Where exactly does Octane's speedup come from?
2. What's the #1 bug class in Octane apps?
3. Swoole vs RoadRunner — what's the real difference?
4. How do you keep per-request data safe in a long-lived worker?
5. When is Octane the wrong tool?
