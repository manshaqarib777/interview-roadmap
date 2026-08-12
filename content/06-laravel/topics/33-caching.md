# Topic 33 — Caching

**Checklist anchor:** cache drivers · Redis · file · database · keys · TTL · tags · invalidation · `remember()` · `rememberForever()` · cache locking · stale data

**Owning lesson:** [127 Caching & Redis](../127-caching-redis.md)

---

## The one-sentence answer

**Caching stores expensive results so repeat work is skipped — and the senior questions are about *staleness*: what happens when the cached data is wrong, and how you invalidate it.**

## The mental model

```text
first request:   query DB (slow) ──► store in cache ──► return
next requests:   read cache (fast) ──────────────────► return
```

The cache is a **memo for your data**: an expensive computation (a query, an API call) runs once, and the result is served until it expires or is invalidated. The payoff is latency; the price is **staleness** — the cache can hold data that no longer matches the database.

## How it works

### Drivers

| Driver | Where | Use |
|---|---|---|
| `file` | `storage/framework/cache` | Dev/small apps — zero infra |
| `database` | A `cache` table | Multi-server without Redis |
| `redis` | Redis | The production default — shared, fast, tags |
| `memcached` | Memcached | Similar to Redis, no persistence |
| `array` | Per-request memory | Tests |

`CACHE_STORE=redis` — switching is a `.env` change (Lesson 7's replaceability in action).

### The API

```php
Cache::get('users');                                // read
Cache::put('users', $value, now()->addHours(1));    // write with TTL
Cache::remember('users', 3600, fn () => User::all()); // the common shape
Cache::rememberForever('users', fn () => User::all()); // no expiry — manual invalidation
Cache::forget('users');                             // remove
```

### `remember()` — the checklist's example

```php
Cache::remember('users', 3600, fn () => User::all());
// cache hit  → return cached
// cache miss → run the closure, store it for 3600s, return it
```

`rememberForever()` skips the TTL — the value lives until `forget()` or an explicit invalidation. "Forever" means "you're in charge of removing it."

### Cache tags (Redis/Memcached only)

```php
Cache::tags(['orders'])->remember('orders.paid.total', 3600, fn () => /* ... */);
Cache::tags(['orders'])->flush();     // invalidate EVERYTHING tagged 'orders' at once
```

Tags group related keys so one flush clears them as a set.

### Invalidation — the three weapons

1. **TTL** — the value expires on its own. Simple, but can serve stale data until it does.
2. **`Cache::forget` on writes** — invalidate when the underlying data changes:

```php
// after an order is created:
Cache::forget('orders.paid.total');
```

3. **Tags** — flush a whole group (`Cache::tags(['orders'])->flush()`).

The classic bug is the first two disagreeing: `rememberForever` (no TTL) with no `forget` on writes = permanent staleness.

### Cache locking

```php
// a mutex via the cache — "only one process may do this at a time":
Cache::lock('report-generating', 300)->get(function () {
    return generateExpensiveReport();   // serialized across processes
});
// the lock is how withoutOverlapping() (Lesson 32) and atomic jobs work
```

## What happens when cached data becomes stale? (the senior question)

Stale data is the cache's inherent trade. The answer:

1. **It's served as truth** — the user sees old data (an old price, a wrong stock count) until expiry or invalidation.
2. **You bound it** — a TTL caps how stale the data can get; the shorter the TTL, the tighter the bound, the higher the recompute cost.
3. **You invalidate on writes** — `forget` on the write path means the cache can't outlive its source by more than the write→read window.
4. **You accept it where it's fine** — analytics, settings, reference data tolerate staleness; balances, stock, and auth must not be cached (or invalidated rigorously).
5. **You choose per data** — `remember` with TTL for "close enough", tags + flush for related sets, no caching for anything that must be exact.

## Interview questions

**Q1. What is caching, and what are the drivers?**
> Storing expensive results so repeat work is skipped. Drivers: `file` (zero infra), `database`, `redis` (the production default — shared, fast, tags), `memcached`, and `array` (tests). Switching is a `.env` change because the cache facade resolves the driver from config.

**Q2. What does `Cache::remember()` do?**
> It's the memo shape: on a miss it runs the closure, stores the result under the key for the TTL, and returns it; on a hit it returns the stored value without running the closure. `remember('users', 3600, fn () => User::all())` is a query that runs at most once an hour.

**Q3. What's the difference between `remember` and `rememberForever`?**
> `remember` expires after the TTL — the staleness window is bounded automatically. `rememberForever` never expires on its own — you must `forget()` it (or flush a tag) when the data changes. "Forever" is a contract with yourself: invalidation is now manual.

**Q4. What are cache tags?**
> Named groups for related keys — `Cache::tags(['orders'])->remember(...)` — so one `flush()` invalidates the whole group. Tags are Redis/Memcached-only. They solve the "invalidate ten related keys" problem with one call.

**Q5. What happens when cached data becomes stale?**
> It's served as truth until expiry or invalidation — an old price, a wrong count. The defence is layered: a TTL bounds the staleness window, `forget` on writes invalidates at the source, and tags flush related sets. And you choose per data type — reference data tolerates staleness; balances and stock must not be cached (or must be invalidated rigorously).

**Senior follow-up: How do you invalidate a cache when the data changes?**
> The write path owns invalidation: after an order is created, `Cache::forget('orders.total')` — or flush the `orders` tag. The pattern is *invalidate-on-write*, not "wait for the TTL," for anything that must be fresh. And the ordering matters: invalidate after the DB commit (Lesson 15), so a rolled-back write doesn't clear a still-valid cache.

## Common mistakes

❌ `rememberForever` with no invalidation — permanent staleness.

❌ Caching what must be exact — balances, stock, auth state (Lesson 64's concurrency).

❌ Forgetting the cache on the write path — stale data served long after the source changed.

❌ Using tags on a non-Redis driver — tags are Redis/Memcached-only.

## Quick revision notes

- Cache = **memo for expensive results** — latency paid once, served until stale
- `remember(key, ttl, closure)` = the memo shape · `rememberForever` = you own invalidation
- Drivers: file · database · **redis** (default) · memcached · array (tests)
- **Tags** = group flush (Redis/Memcached only)
- Invalidate: **TTL** (bounds staleness) · **forget-on-write** (kills it at the source) · **tags** (group flush)
- **Cache locks** = cross-process mutex (overlap prevention, atomic jobs)

## Check your understanding

1. What's the exact behaviour of `remember()` on hit vs miss?
2. What does "rememberForever" commit you to?
3. What are the three invalidation weapons, and when is each right?
4. Why is stale data a trade, not a bug — and how do you bound it?
5. When should something *not* be cached?
