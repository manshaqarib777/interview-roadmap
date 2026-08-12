# Lesson 131 — Laravel Performance & Deployment

**Interview importance:** ⭐⭐⭐⭐ — the flagship scenario. If you're handed one senior question,
it's usually this: *"Your Laravel API is slow. What do you do?"*

The answer that separates offers from polite nods is **a decision ladder, not a guess**. You
measure first, you find the N+1 second, and only then do you reach for caching, queues, and
infrastructure — in an order where each step is cheaper than the one after it. The second half
is the deployment story: env vars, config caching, workers, migrations, and the rollback answer
you need when a deployment breaks production.

## Learning Objectives

By the end of this lesson you should be able to:

- Recite the 10-rung "API is slow" ladder in order, with the first 3 rungs fixed in your head
- Explain why "add caching" is wrong as the *first* answer — and what the first answer is
- Draw the production request path: nginx → PHP-FPM → Laravel → DB → Redis
- Say what `config:cache` / `route:cache` / `view:cache` do, and why you don't cache blindly in dev
- Walk a deployment: CI → build → migrate → workers, plus the rollback when it breaks

## 1. What Is This Lesson Really About?

**Performance is a ladder you climb one rung at a time, cheapest first — and deployment is a scripted, reversible procedure, not a hope.**

"Your API is slow" is un-answerable until you've measured *what* is slow. The 10 rungs below
go from "find the problem" (rungs 1–3) through "make the queries cheap" (4–5), "stop doing the
work" (6–7), "make the runtime faster" (8), and only at the very end "buy more machines" (9–10).
Jumping straight to Redis or a bigger box is how you spend a week making a 10-query N+1
slightly more cached.

```text
10-rung decision ladder
 1. MEASURE      clock(), Debugbar, query log — name the number
 2. FIND N+1     the most-asked Laravel bug; one loop = one query per row
 3. ADD INDEXES  EXPLAIN the slow query; composite indexes for the WHEREs
 4. EAGER LOAD   with() replaces N queries with 2
 5. PAGINATE/CHUNK  stop loading 10k rows; limit the response
 6. CACHE        Redis: the same answer served twice without the work
 7. QUEUES       move email/PDFs/imports off the request
 8. OPCACHE      make PHP itself stop re-compiling every request
 9. PAYLOAD      API Resources — smaller JSON, less transfer
10. INFRA        Redis, more workers, horizontal scaling
```

The first three rungs cost nothing and find most real slowness. That ordering *is* the answer
interviewers listen for.

## 2. Mental Model

Two clocks, two budgets. **Request time** is what the user feels: time-to-first-byte, then
bytes on the wire. **Server work** is what you pay for: queries, PHP execution, queue jobs.
Most "slow API" complaints are actually the first clock — and most fixes touch the second.

```text
client ── HTTP ──▶ nginx ──▶ PHP-FPM ──▶ Laravel app ──▶ MySQL / Postgres
                     │                          │                │
                     │                          └── Redis ───────┘   (cache, queues,
                     │                                               sessions)
                     └── static files served here, PHP never runs
```

The mental model for everything in this lesson: **the app does work per request, and each
rung reduces the amount of work a request does** — fewer queries, cheaper queries, or no work
at all because the answer was cached or the job was queued.

> [!TIP]
> "Measure, then act" is also the answer to "what would you do if this were my app?" — the
> follow-up they always ask. The ladder is a script; say the rungs in order and you sound
> senior without knowing their codebase.

## 3. Visual Flow — the 10-Rung Ladder

```text
   rung 1  MEASURE        → clock(60s) in route / Debugbar / DB::listen → "orders index = 940ms"
   rung 2  FIND N+1       → query log shows 51 queries for a page of 50 orders
   rung 3  ADD INDEXES    → EXPLAIN: full table scan → index on (status, created_at)
   rung 4  EAGER LOAD     → with('items') → 51 queries become 2
   rung 5  PAGINATE       → 10k-row response becomes 25 rows + next-page cursor
   rung 6  CACHE          → top-10 dashboard → Redis, TTL 60s, invalidation on write
   rung 7  QUEUES         → email/receipts → job, response returns in 50ms
   rung 8  OPCACHE        → opcache.enable=1, validate_timestamps=0 in prod
   rung 9  RESOURCES      → API Resources select() only the fields the client needs
   rung 10 INFRA          → Redis for cache/sessions, more workers, horizontal scale
```

Each rung is a *decreasing* marginal win — which is exactly why the order matters. Rung 1–5
is where 90% of real speedups live.

## 4. How It Works — Rungs 1–5: Measure, N+1, Indexes, Eager Load, Paginate

### Rung 1 — measure

```php
// routes/web.php — a 60-second timing window, or just watch Debugbar in dev
Route::get('/orders', function () {
    clock()->start('orders index');        // Laravel Debugbar
    $orders = Order::where('status', 'paid')->get();
    clock()->end('orders index');

    return view('orders.index', ['orders' => $orders]);
});
```

```text
[debugbar] orders index:  940 ms  — 51 queries, 19.2 MB memory
```

If you can't name the number, you can't prove the fix worked. Everything after this is
"compare before and after 940 ms".

### Rung 2 — find the N+1

The most-asked Laravel performance question (L117): one query per row, in a loop.

```php
foreach ($orders as $order) {
    $order->items->count();   // one SELECT per order — N queries
}
```

```text
select * from "orders" where "status" = 'paid'                 (1 query)
select * from "order_items" where "order_id" = 1               (…and 50 more,
select * from "order_items" where "order_id" = 2                one per order)
…
51 queries for 50 orders — the classic N+1
```

### Rung 3 — add indexes

For a query that is *still* slow after eager loading, `EXPLAIN` tells you whether the DB is
scanning or seeking:

```sql
EXPLAIN SELECT * FROM orders WHERE status = 'paid' AND created_at > '2025-01-01';
```

```text
type: ALL        ← full table scan: reads every row to find the match
rows: 1_200_000  ← that's the bill, right there
```

```php
// database/migrations/xxxx_add_orders_status_created_index.php
Schema::table('orders', function (Blueprint $table) {
    $table->index(['status', 'created_at']);   // composite — matches the WHERE
});
```

```text
type: ref        ← index seek
rows: 128        ← the same query, 4 orders of magnitude cheaper
```

### Rung 4 — eager load

One `with()` collapses the loop's N queries into two (L117):

```php
$orders = Order::with('items')->where('status', 'paid')->get();
```

```text
select * from "orders" where "status" = 'paid'
select * from "order_items" where "order_id" in (1, 2, 3, …, 50)     ← 2 queries total
```

### Rung 5 — paginate / chunk

Loading ten thousand rows to show twenty is waste in both clocks. Paginate for humans,
chunk for batches:

```php
$orders = Order::where('status', 'paid')
    ->latest()
    ->paginate(25);                       // SQL LIMIT 25 OFFSET 0 + COUNT(*)
```

```text
select count(*) as aggregate from "orders" where "status" = 'paid'
select * from "orders" where "status" = 'paid"
       order by "created_at" desc limit 25 offset 0
```

and for a report that touches every row, chunk — the memory never grows with the table:

```php
Order::chunkById(500, function ($orders) {
    foreach ($orders as $order) {
        // export, reprice, index — one 500-row slice at a time
    }
});
```

> [!NOTE]
> Rungs 1–5 are free and fix the large majority of "slow API" reports. Only once the query
> layer is clean do rungs 6–10 start to make sense — and by then they're often unnecessary.

## 5. How It Works — Rungs 6–10: Cache, Queues, OPcache, Resources, Infra

### Rung 6 — cache the answer (L127)

Cache only answers that are **expensive to compute and cheap to invalidate**. The dashboard's
top-10 is a perfect fit; a user's own orders are a trap (they change constantly and are
already one indexed query).

```php
$top = Cache::remember('dashboard.top10', 60, function () {
    return Order::with('items')
        ->where('status', 'paid')
        ->latest()
        ->take(10)
        ->get();
});
```

```text
first request:   compute + write  "dashboard.top10"  → 900 ms
next 59 seconds: read from Redis                    → 4 ms
```

Invalidate on write, not on a timer guess:

```php
Cache::forget('dashboard.top10');    // in the job/event that changes the data (L125)
```

### Rung 7 — move work to queues (L124)

Email, PDFs, CSV exports, webhooks — anything that doesn't have to finish before the response.
The request returns in milliseconds; the queue worker does the work.

```php
// controller
OrderMailer::dispatch($order)->afterResponse();   // respond first, email after
```

```text
before:  POST /orders → … → SMTP send inside the request → 1.4 s response
after:   POST /orders → … → job on the queue           → 60 ms response
         worker picks up the job → sends the email → marks it done
```

### Rung 8 — OPcache

PHP compiles source to bytecode on every request unless you cache it. OPcache is the runtime
switch that stops the re-compile — the free-est speedup in PHP:

```ini
; php.ini (production)
opcache.enable=1
opcache.validate_timestamps=0    ; prod: don't stat files each request
opcache.max_accelerated_files=20000
```

```text
without OPcache:  every request → parse + compile order controller → slow
with OPcache:     first request compiles → bytecode cached → every request after runs it
```

`validate_timestamps=0` is also why you must **restart PHP-FPM after deploys** — the cached
bytecode is the *old* code until you do.

### Rung 9 — API Resources

Smaller payloads = faster transfer and less JSON work. Resources select only what the client
needs (L133):

```php
// app/Http/Resources/OrderResource.php
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'     => $this->id,
            'total'  => $this->total,
            'placed' => $this->created_at->toIso8601String(),
            // no $this->internal_note, no $this->items->load() graph
        ];
    }
}
```

```text
before: {"id":1,"user_id":3,"internal_note":"…","stripe_id":"…","total":9900,"items":[…20…]}
after:  {"id":1,"total":9900,"placed":"2026-02-11T09:30:00Z"}      ← what the client renders
```

### Rung 10 — infrastructure

The last rung, because it costs money and adds operations. Add Redis as the shared cache
(L127), raise the queue worker count, and when one box is genuinely CPU-bound: more boxes
behind the load balancer.

```text
         ┌── web 1 (nginx + PHP-FPM)
LB ──────┼── web 2 (nginx + PHP-FPM)      ──▶ shared MySQL
         └── web 3 (nginx + PHP-FPM)      ──▶ shared Redis (cache + queues)
                                          ──▶ queue workers (1 per core, per app)
```

> [!DEEPDIVE]
> The ladder composes: caching and queues only help *after* queries are cheap, because a
> cached N+1 is still an N+1 (just cached). And infrastructure only helps after everything
> else, because more boxes run the same slow code at the same speed, just in parallel. Each
> rung is a decreasing marginal win — that's the ordering principle in one sentence.

## 6. Deployment — the Production Request Path

The shape of a production Laravel deployment, request side:

```text
  user ──▶ nginx ──▶ PHP-FPM ──▶ Laravel (bootstrap → routes → middleware → controller)
                                   │
                                   ├── MySQL / PostgreSQL   (primary data)
                                   └── Redis                (cache, sessions, queues)
  nginx also serves:  /public assets, robots.txt — PHP never runs for these
```

Key facts to say out loud:

- **nginx serves static files itself** and proxies everything else to PHP-FPM.
- **PHP-FPM runs the PHP processes** — the thing you restart after a deploy (OPcache!).
- **Laravel boots per request** — which is why `config:cache` and `route:cache` matter.
- **Redis** sits next to the app for cache/sessions/queues; the database is the single source
  of truth.

## 7. Deployment — Env Vars, Caching, and Why Not in Dev

**`.env` is never committed** — it holds the secrets and per-environment values (L96 pattern,
Laravel edition). Laravel reads it at boot via `env()`, and `config/` files read it:

```text
.env                    ← gitignored: APP_KEY, DB_PASSWORD, STRIPE_SECRET…
.env.example            ← committed: the shape, with placeholders
config/database.php     ← env('DB_CONNECTION', 'mysql')  — default, overridable
```

> [!PITFALL]
> `config:cache` **freezes** config values at cache time — and `env()` calls outside config
> files return `null` once config is cached. The rule that prevents the classic outage:
> **only ever call `env()` inside `config/*.php` files**; use `config('app.debug')` in the
> app itself. Then caching config is always safe.

**The cache commands** and what each one freezes:

```bash
php artisan config:cache    # compile config/*.php + .env into one cached file
php artisan route:cache     # compile the route table into one file
php artisan view:cache      # pre-compile every Blade template to PHP
```

```text
before config:cache — every request: read .env → evaluate every config/*.php → ~1,000 calls
after  config:cache — every request: load one compiled array                 → ms saved
```

**Why you don't cache everything blindly in dev:**

```text
dev (config:cache is a trap):
  change APP_DEBUG=true in .env  →  still cached: the app never sees the new value
  change routes/web.php          →  route:cache makes the edit invisible
  change a Blade file            →  view:cache serves the old compiled template

dev (uncached):
  every request re-reads everything  →  edits take effect immediately
  Debugbar, logging, errors all current
```

Prod wants the frozen, fast versions; dev wants live reloads. That's why the deploy script
runs the caches — and why a local dev that "can't see its own changes" is usually a leftover
cache command.

## 8. Deployment — Storage, Workers, Migrations

**Storage permissions** — the classic "works locally, white screen in prod":

```bash
chmod -R 775 storage bootstrap/cache     # php-fpm user must write here
# storage/framework/{sessions,views,cache}  +  storage/logs  +  uploaded files
```

```text
Symptoms:  500 errors on login (sessions), 500 on any view (compiled views),
           uploads fail (files), "permission denied" in storage/logs
```

**Workers and the scheduler in production** (L124, L126) — never in a web request:

```bash
php artisan queue:work --daemon          # one process per core; supervisor restarts it
php artisan schedule:work                # or crontab: * * * * * php artisan schedule:run
```

```text
web box runs nginx + PHP-FPM + queue workers + scheduler
      └── a deploy that changes job code but not the workers = old code still processing
      └── always: restart workers after deploy (php artisan queue:restart)
```

**Migrations in deploys** — the ordering question with a specific answer:

```text
Deploy that adds a nullable column:   migrate after deploy, no downtime
Deploy that drops a column/table:     remove reads → deploy → migrate → cleanup
  (this is the "expand and contract" pattern — L119 migrations)
Rollback if it goes wrong:            php artisan migrate:rollback --step=1
```

> [!DEEPDIVE]
> The expand-and-contract rule is worth the words: never write a migration the *old code*
> can't tolerate. Add columns as nullable first, deploy, then tighten. Drop things only after
> no running code references them. That's how Laravel deploys stay zero-downtime even though
> web servers and migrations aren't atomic.

## 9. Deployment — CI/CD and the Rollback Answer

The pipeline, in order:

```text
  git push
     │
     ▼
  CI: composer install --no-dev --optimize-autoloader
  CI: run tests            (php artisan test)
  CI: run lint/static      (pint / phpstan / tlint)
     │
     ▼
  build: npm ci && npm run build        (frontend assets, if any)
  build: php artisan config:cache route:cache view:cache
     │
     ▼
  deploy: rsync / pull release → symlink release (zero-downtime switch)
  deploy: php artisan migrate --force          (expand-and-contract order)
  deploy: php artisan queue:restart            (workers pick up new code)
  deploy: reload php-fpm / nginx               (OPcache drops stale bytecode)
  deploy: clear app caches: cache:clear / Cache::forget on changed keys
```

**`composer install` flags** — say the two flags and why:

```bash
composer install --no-dev --optimize-autoloader
```

```text
--no-dev               skip dev packages (debug tooling never ships to prod)
--optimize-autoloader  pre-build the classmap → no runtime file probing → faster boots
```

**"A deployment broke production" — the rollback answer:**

> First, stop the bleeding: roll back to the last known-good release. If the break is code,
> I switch the release symlink back and restart workers and PHP-FPM. If the break is a
> migration, I `migrate:rollback` the last step — but only after I've confirmed nothing
> running depends on the new column. Then I check the health endpoint, watch the error log,
> and confirm traffic is green before I even start diagnosing what went wrong. The diagnose-
> then-deploy rule is: the fix ships the same safe path as the original deploy — branch,
> tests, pipeline — never a hot edit on the box.

```text
release-v1 (symlink → current)   release-v2 (broke)
       │                              │
       └──────── git revert / new fix ┘
                    │
                    ▼
        CI passes → deploy release-v3 → migrate:rollback if needed → restart workers
```

The phrase interviewers want to hear: **"the deploy is scripted and reversible, so breaking
production is a moment, not an event."**

## 10. Interview Explanation

> For "your API is slow": I don't guess — I climb a ladder. First I measure, with Debugbar or
> a timing window, so I have a number. Then I look for the N+1 in the query log — that's the
> most common cause, and eager loading collapses fifty queries into two. If it's still slow, I
> `EXPLAIN` the query and add a composite index, then paginate or chunk so I'm not loading ten
> thousand rows. Only then do I cache — expensive, rarely-changing answers in Redis with
> invalidation on write — and move email or exports to queues so the request doesn't do them.
> OPcache stops PHP recompiling every request, API Resources shrink the payload, and
> infrastructure is the last rung, because more boxes running slow code is just more slow.
>
> For deployment: config and routes get cached at deploy time, workers get restarted, and
> migrations run in expand-and-contract order so nothing the old code needs disappears.
> If a deploy breaks, I roll back to the last good release, roll back the migration if it
> caused it, restart workers, and verify green before diagnosing — the deploy is scripted, so
> it's reversible by design.

## 11. Senior-Level Insights

- **The ladder is the answer.** Reciting "measure → N+1 → index → eager load → paginate →
  cache → queues → OPcache → payload → infra" in order beats any single brilliant fix. The
  *ordering* is the senior signal.
- **Cache invalidation is the design, not the cache.** `remember()` is easy; knowing when to
  `forget()` is the actual engineering. Invalidating on a write event (L125) beats a TTL guess.
- **Queues are a performance feature, not just async.** Moving work off the request isn't
  merely about not blocking — it's the difference between a 1.4 s and a 60 ms response.
- **OPcache is the free rung everyone forgets.** A fresh deploy without a PHP-FPM reload
  serves stale bytecode; mention that and you've deployed before.
- **Rollback is a feature you build, not a prayer.** Symlinked releases and scripted
  migrations mean "broken deploy" is a two-minute revert, not a 3 a.m. firefight.
- **Compose the rungs.** Eager loading plus caching is fine; caching a known N+1 is not. Each
  rung has to be earned in order.

## 12. Common Mistakes

❌ Reaching for caching first:

```php
$orders = Cache::remember('orders.all', 60, fn () => Order::all());
```

```text
What's actually cached: an N+1 and a 10,000-row payload — now with stale-data bugs too.
Measure first, eager load second, cache third.
```

❌ Blind `config:cache` in dev — then editing `.env` or `routes/web.php` "does nothing":

```text
App is running the frozen cached values; the edit is invisible. In dev: never cache.
```

❌ `env()` calls outside config files — a guaranteed outage once config is cached:

```php
// controller
$secret = env('STRIPE_SECRET');     // → null after config:cache
```

❌ Forgetting to restart workers / PHP-FPM after a deploy — "I deployed it, why is the old
behaviour still there?" — because the old bytecode and old jobs are still running.

❌ A destructive migration in the same deploy as the code that stops using the column:
one atomic step both code and DB can't survive together.

## 13. Best Practices

✅ Measure first — one number per endpoint, compared before/after every change

✅ Eager load by default; add indexes from `EXPLAIN`, not from guesses

✅ Paginate for humans, chunk for batches — never `all()` on a big table

✅ Cache expensive, rarely-changing answers; invalidate on write events

✅ Queue anything that doesn't need to finish before the response (L124)

✅ OPcache on, timestamps off, PHP-FPM reload on every deploy

✅ Shrink payloads with API Resources; select only what the client renders

✅ Cache config/route/view only in prod, and call `env()` only inside config files

✅ Migrations in expand-and-contract order; rollback as the built-in escape hatch

❌ Don't scale horizontally until the code is already fast — infra is the last rung

## 14. Interview Questions

**Q1. Your Laravel API is slow. What do you do?**

> I don't guess — I climb a ladder. First, measure: Debugbar or a timing window, so I have a
> number. Second, find the N+1 in the query log — the most common cause — and eager load it,
> collapsing fifty queries into two. Third, `EXPLAIN` the slow query and add the composite
> index it actually needs, then paginate or chunk so I stop loading rows nobody sees. Only
> after the queries are clean do I cache — Redis for expensive, rarely-changing answers with
> invalidation on write — and move email or exports to queues so the request doesn't do them.
> OPcache stops PHP recompiling every request, API Resources shrink the payload, and
> infrastructure is the last rung: more boxes running slow code is just more slow.

**Q2. Why is "add caching" not the first thing you do?**

> Because caching preserves the problem. If the endpoint has an N+1 and loads ten thousand
> rows, caching makes it a *fast N+1 that's also stale* — the root cost is still there for
> every uncached request and every miss. Measure and fix the queries first; those fixes are
> free and permanent. Caching is rung six for a reason.

**Q3. What does `php artisan config:cache` do, and why not in dev?**

> It compiles `.env` and all `config/*.php` into one cached array, so every request loads one
> file instead of evaluating hundreds of `env()` calls. Prod wants that. Dev doesn't, because
> the cache freezes values — change `APP_DEBUG` in `.env` and the app keeps serving the cached
> value. The companion rule: call `env()` only inside config files, or the app breaks the
> moment config is cached.

**Q4. Walk me through a production deployment.**

> Git push triggers CI: `composer install --no-dev --optimize-autoloader`, tests, and lint.
> The build compiles frontend assets and caches config, routes, and views. The release is
> rsynced or pulled, the symlink switches to it atomically, then migrations run — in
> expand-and-contract order so nothing the old code needs disappears — and finally I restart
> the queue workers and reload PHP-FPM so OPcache drops the stale bytecode.

**Q5. A deployment broke production. What do you do?**

> Stop the bleeding first: roll back to the last known-good release — switch the symlink,
> restart workers and PHP-FPM, and check the health endpoint and error log until traffic is
> green. If the break came from a migration, `migrate:rollback --step=1`, but only after
> confirming nothing running depends on the new schema. Only once production is stable do I
> diagnose what went wrong, and the fix ships through the same scripted path — branch, tests,
> pipeline — never a hot edit on the server.

**Q6. How do you handle migrations in a deploy?**

> In expand-and-contract order, and never destructively alongside the code that stops using
> the thing being dropped. Add a column as nullable, deploy, then tighten. To drop: remove
> all reads in one deploy, then migrate the removal in the next. If it goes wrong,
> `migrate:rollback` is the built-in escape hatch — which is why each migration is one step,
> small and reversible.

**Senior follow-up: the API is slow and the queries are already clean. Now what?**

> Now the work itself is the problem, so I stop doing it per request: cache the expensive,
> rarely-changing answers in Redis with write-event invalidation; move email, exports, and
> PDFs to queues; and shrink the payload with API Resources so the client transfers less.
> Then OPcache for PHP itself, and only at the end infrastructure — a shared Redis, more
> workers, and horizontal boxes behind the load balancer once one box is genuinely CPU-bound.
> And I re-measure after every rung — each step has to beat the number I got at rung one.

## 15. Follow-up Questions

**What's the difference between `paginate` and `chunk`?**

> `paginate` is for humans — a page of 25 with a `COUNT(*)` for the page controls. `chunk` is
> for machines — a callback fed 500 rows at a time until the table is exhausted, so a report
> never loads the whole table into memory.

**When is caching the wrong tool?**

> When the data changes constantly and the query is already one indexed read — a user's own
> orders, say. The cache miss still runs the query, and now you also manage invalidation. Cache
> answers that are expensive *and* rarely change; skip it when either half is false.

**Why must you restart PHP-FPM after a deploy?**

> OPcache with `validate_timestamps=0` keeps the compiled bytecode from the old code. The new
> files on disk are ignored until the process restarts — that's the "I deployed it but it's
> still the old behaviour" mystery, solved by a reload in the deploy script.

**How do you do zero-downtime with a migration that adds a required column?**

> Expand and contract: add it nullable, deploy, backfill, then alter it to `NOT NULL` in a
> second migration. Every step leaves a schema the *current* code can live with. Atomic
> "migrate + change code" in one shot is exactly what makes deploys break.

**What goes in the deploy script vs. what stays manual?**

> Everything mechanical goes in the script — install, build, cache, migrate, restart workers,
> reload PHP-FPM, cache:clear. Only the judgment stays manual: reviewing the migration diff
> and deciding rollback-vs-roll-forward. If a step can be scripted, it should be.

## 16. Comparison Table

| Rung | What it fixes | Cost | When it's the win |
|---|---|---|---|
| 1 Measure | "is it even slow?" | free | always — first move |
| 2 N+1 | query count explosion | free | most endpoints |
| 3 Indexes | full table scans | 1 migration | any `EXPLAIN` with `type: ALL` |
| 4 Eager load | loop queries | free | any relationship in a loop |
| 5 Paginate/chunk | huge row sets | free | reports, lists |
| 6 Cache | repeated expensive work | Redis + invalidation | dashboard, top-lists |
| 7 Queues | work that blocks the request | worker process | email, exports, PDFs |
| 8 OPcache | PHP recompiling per request | ini change | every production box |
| 9 Resources | fat JSON payloads | 1 class per resource | public APIs |
| 10 Infra | CPU-bound single box | money + ops | last resort, proven |

## 17. Code Example — a Full "Slow Endpoint" Fix

The scenario end to end. **Before** — an endpoint that answers, slowly:

```php
// routes/api.php
Route::get('/dashboard', function () {
    $orders = Order::where('status', 'paid')->get();   // 10,000 rows
    foreach ($orders as $order) {
        $order->items->count();                        // N+1 per row
    }
    return response()->json($orders);
});
```

```text
[measured]  /dashboard   → 9,800 ms · 10,001 queries · 41 MB
```

**After** — every rung that applies:

```php
// app/Http/Controllers/DashboardController.php
public function __invoke(): JsonResponse
{
    $stats = Cache::remember('dashboard.stats', 60, function () {
        return [
            'orders' => Order::query()
                ->with('items')                              // rung 4: 2 queries
                ->where('status', 'paid')
                ->latest()
                ->take(10)                                   // rung 5: 10 rows
                ->get()
                ->map(fn (Order $o) => OrderResource::make($o)),  // rung 9: slim payload
            'totalRevenue' => Order::where('status', 'paid')
                ->where('created_at', '>=', now()->subDays(30))
                ->sum('total'),                              // rung 3: index makes this fast
        ];
    });

    return response()->json($stats);
}
```

```text
first hit:   index (status, created_at) → fast SUM · eager loaded 10 rows → 120 ms
next 60 s:   served from Redis                              → 5 ms
payload:     10 slim order objects instead of 10,000 fat ones
```

```narrate
line 5:      Cache::remember with a 60s TTL — rung 6, only after the queries were fixed
line 7:      with('items') — rung 4, the N+1 is gone by construction
line 10:     take(10) — rung 5, no 10k rows
line 13:     the indexed where/order/sum — rung 3, one composite index
output:      9,800 ms → 5 ms on cache hits; the ladder, in one endpoint
```

**Invalidation** — the cache doesn't rot because a write clears it:

```php
// app/Jobs/OrderPlaced.php (or an event listener — L125)
public function handle(): void
{
    Cache::forget('dashboard.stats');
}
```

## 18. Performance Notes

- **The first three rungs are free and correct most reports.** Measure, N+1, index — before
  any money is spent, 90% of "slow API" cases are already fixed.
- **`paginate` adds a `COUNT(*)`** — fine for a page; don't call it in a loop. `chunkById` is
  the stable cursor for big passes.
- **Caching adds a Redis round trip per hit.** A 5 ms read beats 900 ms of work; it loses to
  a 2 ms indexed query. Rungs earn their place by comparison, not by name.
- **Queues trade latency for throughput:** the request gets fast, the worker gets busy.
  Monitor queue depth (L124) or you've moved the slowness, not removed it.
- **OPcache is the cheapest rung per user served** — one php.ini change, every request faster.

## 19. Debugging Scenarios

| Symptom | Likely cause | Fix |
|---|---|---|
| Endpoint slow, page of 50 rows | N+1 (51 queries) | `with()` eager load → 2 queries |
| One query slow in prod, fast locally | Missing index / different data size | `EXPLAIN`; add composite index |
| Change to `.env` has no effect | `config:cache` ran in dev | `config:clear`; never cache in dev |
| "Deployed but still old behaviour" | Workers / PHP-FPM not restarted | `queue:restart` + reload php-fpm |
| 500s on login / uploads after deploy | storage permissions | `chmod -R 775 storage bootstrap/cache` |
| Migration broke prod | destructive step next to dependent code | `migrate:rollback --step=1`; expand-and-contract next time |

## 20. Quick Revision Notes

- Ladder: measure → N+1 → index → eager load → paginate/chunk → cache → queues → OPcache → payload → infra
- Cache first is wrong: it preserves the N+1 and adds staleness
- Deployment path: nginx → PHP-FPM → Laravel → MySQL → Redis
- `.env` gitignored; `env()` only inside config files; `config:cache` freezes values
- Cache config/route/view **in prod only** — dev needs live values
- Deploy: `composer install --no-dev --optimize-autoloader`, tests, build, caches, migrate, restart workers + PHP-FPM
- Migrations: expand-and-contract; `migrate:rollback --step=1` is the escape hatch
- Rollback answer: revert release → rollback migration if needed → restart → verify green → then diagnose

## 21. Cheat Sheet

```text
Slow API ladder (say in order):
  1 measure → 2 N+1 → 3 index → 4 eager load → 5 paginate/chunk
  6 cache → 7 queues → 8 OPcache → 9 resources → 10 infra

Deploy checklist:
  composer install --no-dev --optimize-autoloader
  npm ci && npm run build
  php artisan config:cache route:cache view:cache     (prod only)
  php artisan migrate --force                          (expand-and-contract)
  php artisan queue:restart
  reload php-fpm / nginx                               (OPcache)

Break a deploy?  rollback release → migrate:rollback --step=1 → restart workers
                 → health check green → then diagnose

Storage: chmod -R 775 storage bootstrap/cache
Workers: php artisan queue:work --daemon   ·   crontab: schedule:run every minute
```

## 22. Key Takeaways

> [!RECAP]
> - "Your API is slow" is answered with a ladder, cheapest first: measure → N+1 → index → eager load → paginate → cache → queues → OPcache → payload → infra
> - Caching first is wrong — it makes an N+1 faster *and* stale
> - Eager loading and a composite index fix the large majority of real endpoints for free
> - Production path: nginx → PHP-FPM → Laravel → MySQL/Postgres → Redis
> - `config:cache`/`route:cache`/`view:cache` freeze prod values — dev must stay uncached; call `env()` only inside config files
> - Deploy = tests → build → caches → `migrate --force` → `queue:restart` → reload PHP-FPM
> - Migrations run expand-and-contract; `migrate:rollback --step=1` is the built-in escape hatch
> - "A deployment broke production": roll back first, verify green, diagnose second — the deploy is scripted, so it's reversible by design

## Check your understanding

Answer these without looking back.

1. Recite the 10-rung ladder in order — then say why "add caching" isn't rung one.
2. What three things does rung 1–3 cost, and what percentage of real slowness do they usually fix?
3. Why must you restart PHP-FPM after every deploy?
4. What does `config:cache` freeze, and why is caching config in dev a trap?
5. What's the one rule about `env()` that keeps an app alive after `config:cache`?
6. Walk a full deployment, from `git push` to the moment traffic is green.
7. Give the rollback sequence for a deployment that broke production — in order, with the migration step explained.
8. Why do migrations run expand-and-contract, and what's the escape hatch if one goes wrong?

## What's Next

**Lesson 132 — Laravel + React / Inertia.** You've made the backend fast and shipped it safely —
now wire the SPA frontend to it: Inertia's server-driven pages, shared props, and when a
traditional API beats a monolith (L48 composition and L86 server components come back here).