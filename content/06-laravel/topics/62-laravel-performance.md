# Topic 62 — Laravel Performance

**Checklist anchor:** "Your Laravel API is slow. What do you do?" — measure · queries · N+1 · indexes · eager loading · pagination · caching · Redis · queues · OPcache · payload · infra · monitoring

**Owning lesson:** [131 Laravel Performance & Deployment](../131-performance-deployment.md)

---

## The one-sentence answer

**Performance work is a ladder — measure first, then fix queries, then add indexes, then cache — and the senior answer to "your API is slow" is the order, not the guess.**

## The mental model

The checklist's question: **"Your Laravel API is slow. What do you do?"** The answer is the 13-rung ladder — and the rungs are *ordered*:

```text
1.  Measure          ← you can't fix what you haven't located
2.  Database queries ← the usual culprit
3.  N+1              ← the usual cause of #2
4.  Indexes          ← the usual fix for #2
5.  Eager loading    ← the fix for #3
6.  Pagination       ← don't return a million rows
7.  Caching          ← stop recomputing
8.  Redis            ← the cache that scales (Lesson 34)
9.  Queues           ← move work out of the request (Lesson 26)
10. OPcache          ← stop recompiling PHP
11. API payload      ← shrink what you send (Lesson 24)
12. Infrastructure   ← the box, the balancer, the DB
13. Monitoring       ← keep seeing it (Lesson 39)
```

The discipline: **rungs 1–6 are where 90% of Laravel slowness lives** — and they're free. Caching, queues, and infrastructure are the *later* rungs because they add complexity; you climb them only after the cheap ones are done.

## How it works — the rungs in practice

### 1. Measure — where does the time go?

```php
// query log — how many queries, which are slow?
DB::enableQueryLog();
$data = Order::with('items')->get();
dump(DB::getQueryLog());   // count + SQL per query

// or: Telescope, Debugbar, a profiler, or time the request end-to-end
// the question: is it queries, views, or the framework bootstrap?
```

### 2–5. The query fix loop

```php
// find the N+1 (Lesson 11):
Order::all();               // 1 query + N for ->items
Order::with('items')->get();// 2 queries

// index the filter (Lesson 63):
// WHERE status = 'paid' AND created_at > ? → index (status, created_at)

// don't hydrate what you don't render (Lesson 12):
Order::where('status', 'paid')->count();   // not ->get()->count()
```

### 6. Paginate (Lesson 47)

```php
Order::cursorPaginate(50);   // keyset for huge sets — no deep OFFSET cost
```

### 7–8. Cache & Redis (Lessons 33–34)

```php
Cache::remember('orders.paid.total', 300, fn () => Order::where('status', 'paid')->sum('total'));
// Redis-backed so the cache is shared across servers
```

### 9. Queues (Lesson 26)

```php
SendConfirmation::dispatch($order);   // side effects leave the request
```

### 10. OPcache + bootstrap

```bash
php artisan optimize            # config + route + view cache
# + OPcache enabled: PHP doesn't recompile files per request
# + Octane for bootstrap-heavy workloads (Lesson 61) — the advanced rung
```

### 11. API payload (Lesson 24)

```php
// API Resources — send only what the client needs:
class OrderResource extends JsonResource { /* curated fields */ }
// big payloads = big serialization + transfer time; shrink the contract
```

### 12–13. Infrastructure & monitoring

```text
bigger box, more app servers, DB read replicas, a CDN
→ only after rungs 1–11 are measured — infra is the expensive rung
→ and monitoring (Lesson 39) keeps the answer honest over time
```

## The senior answer shape

The interview answer is the **order**:

> "I'd measure first — query log or profiler — to see whether it's SQL, views, or bootstrap. Most Laravel slowness is queries: find the N+1, eager-load, add the index, paginate. Then cache what's repeatable, in Redis. Move side effects to queues. Shrink the API payload. Only then look at OPcache, Octane, or bigger infrastructure — and set up monitoring so I can see the next regression."

That shape — measure, then cheap fixes, then caching/queues, then infra — is the senior tell. The candidate who says "add Redis" without measuring skipped six free rungs.

## Interview questions

**Q1. Your Laravel API is slow. What do you do?**
> Measure first — query log or profiler — to locate the time: SQL, views, or bootstrap. Then the free fixes: N+1 → eager-load (Lesson 11), filter columns → indexes (Lesson 63), don't hydrate what you won't render (Lesson 12), paginate (Lesson 47). Then cache repeatable work in Redis (Lessons 33–34), move side effects to queues (Lesson 26), shrink the payload with API Resources (Lesson 24). Only then OPcache/Octane/infrastructure — and monitoring (Lesson 39) so the next regression is visible.

**Q2. What's the most common cause of a slow Laravel endpoint?**
> Database queries — specifically N+1: a loop touching a relationship fires a query per row (Lesson 11). The query log shows it immediately (dozens of identical `select * from items where order_id = ?`). The fix is eager loading and, where needed, an index on the filtered columns.

**Q3. When do you reach for caching?**
> After the query work is done. If a query is now correct but still too slow — an expensive aggregate, a hot read, a dashboard number — cache it with a TTL or invalidate-on-write (Lesson 33). Caching before fixing the queries caches the wrong thing: the N+1, the missing index.

**Q4. Where do queues fit in performance?**
> They move latency out of the request — email, PDFs, external API calls become background work (Lesson 26). The request returns fast; the worker does the slow part. Queues don't make work faster — they make the *user's wait* shorter.

**Q5. What does the infrastructure rung look like?**
> More app servers behind a load balancer, DB read replicas, a CDN for static assets, a bigger DB box — after the application-level fixes are measured and proven. Infra is the expensive rung; climbing it first is how teams pay for a missing index.

**Senior follow-up: How do you know when you're done?**
> You're never "done" — you're *monitoring*. Set up the query log / Telescope in dev and request profiling in prod (Lesson 39's observability), set latency budgets per endpoint, and let the metrics flag regressions. The senior performance answer always ends in measurement: the ladder is a process, and the last rung keeps the first one honest.

## Common mistakes

❌ "Add Redis" as the first answer — skipped six free rungs.

❌ Optimizing without measuring — the fix targets the wrong layer.

❌ Caching before fixing the queries — caching an N+1.

❌ Treating infrastructure as the default fix — the expensive rung for a cheap problem.

## Quick revision notes

- The ladder is **ordered**: measure → queries → N+1 → indexes → eager load → paginate → cache → Redis → queues → OPcache → payload → infra → monitor
- 90% of Laravel slowness is **rungs 1–6** — and they're free
- The senior answer is the **order**, not the guess
- Measure with the **query log** / Telescope / profiler
- Infra is the **last** rung, monitoring is the **last word**

## Check your understanding

1. Recite the ladder — what are the first six rungs?
2. Why is "add Redis" the wrong first answer?
3. What does the query log reveal about an N+1?
4. Where do queues actually help — and what don't they fix?
5. Why does every performance answer end in monitoring?
