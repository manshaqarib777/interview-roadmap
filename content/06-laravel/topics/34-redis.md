# Topic 34 — Redis

**Checklist anchor:** cache · queues · locks · pub/sub concepts · rate limiting · sessions · why Redis beats a relational DB for ephemeral data

**Owning lesson:** [127 Caching & Redis](../127-caching-redis.md)

---

## The one-sentence answer

**Redis is an in-memory data store that Laravel uses for the things that need to be fast and shared — cache, queues, locks, rate limiting, sessions — and it's faster than a relational DB for this because it lives in memory with a simple data model.**

## The mental model

Redis is the **fast shared scratchpad** of a Laravel app. The things every request touches that must be *quick* and *shared across servers* live there:

```text
Laravel app
   ├─ Cache:     Cache::remember('users', ...)      → Redis
   ├─ Queues:    dispatch(new SendEmail)             → Redis
   ├─ Locks:     Cache::lock('report', 300)          → Redis
   ├─ Rate:      RateLimiter::for('api', ...)        → Redis
   └─ Sessions:  SESSION_DRIVER=redis                → Redis
```

It's **in-memory** — data lives in RAM, not on disk — and its data model is simple (strings, hashes, lists, sets, sorted sets). That's why it's fast: no disk seeks, no query planner, no joins.

## Why Redis is faster than a relational DB for ephemeral data

| | Redis | Relational DB (MySQL/Postgres) |
|---|---|---|
| Storage | **RAM** | Disk (+ cache) |
| Data model | Key-value with simple types | Tables, joins, constraints |
| Access | Direct key lookup | Query planning, indexing, parsing |
| Use | **Ephemeral, hot, short-lived** | **Authoritative, relational, durable** |
| Latency | Sub-millisecond | Milliseconds + |

The senior answer: **they serve different jobs.** The relational DB is the source of truth — durable, queryable, relational. Redis is the fast path for *frequently accessed, ephemeral* data — a user's session, a hot query's cached result, a rate-limit counter. You wouldn't put durable financial records in Redis; you wouldn't serve a hot dashboard counter from Postgres queries. The architecture is "DB owns the truth, Redis makes it fast."

## How Laravel uses it

### Cache

```php
// .env: CACHE_STORE=redis
Cache::remember('users', 3600, fn () => User::all());
// sub-millisecond hits, shared across all app servers
```

### Queues

```php
// .env: QUEUE_CONNECTION=redis
SendOrderConfirmation::dispatch($order);
// jobs live in a Redis list — fast enqueue/dequeue (Lesson 26), and Horizon (Lesson 27) requires it
```

### Locks

```php
Cache::lock('checkout:'.$product->id, 30)->get(function () {
    // serialized across processes — the mutex for the oversell scenario (Lesson 64)
});
```

### Rate limiting

```php
RateLimiter::for('api', fn () => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));
// counters in Redis — atomic increments, shared across servers (Lesson 35)
```

### Sessions

```php
// .env: SESSION_DRIVER=redis
// sessions in Redis = shared across servers, fast — vs file sessions that don't survive multi-server
```

## Pub/Sub (conceptually)

Redis has a **publish/subscribe** model — messages broadcast to channels, subscribers receive them live. Laravel's broadcasting (Lesson 59) can use Redis as the transport. The *concept* matters for interviews: a channel-based message bus, decoupling publishers from subscribers.

## Interview questions

**Q1. What is Redis, and why is it fast?**
> An in-memory key-value store with simple types — strings, hashes, lists, sets. It's fast because data lives in RAM and access is a direct key lookup — no disk, no query planner, no joins. Laravel uses it for cache, queues, locks, rate limiting, and sessions.

**Q2. Why is Redis faster than querying a relational DB for frequently accessed ephemeral data?**
> Because the jobs are different. The relational DB is durable and queryable but pays parsing, planning, and disk costs. Redis serves hot, short-lived data from memory with a direct lookup — sub-millisecond. Ephemeral data (sessions, cached results, rate counters) doesn't need the DB's guarantees, so Redis is the right tool — and the DB remains the source of truth.

**Q3. Where does Redis fit in a Laravel app?**
> Five places: the cache store, the queue connection, cache locks (cross-process mutexes), the rate limiter backend, and the session driver. Switching each is a `.env` change. One Redis instance can serve all five — which is also why "Redis is down" (Lesson 65's scenario) touches cache, queues, and locks at once.

**Q4. What are cache locks?**
> A mutex implemented in Redis — `Cache::lock('key', seconds)->get(fn () => ...)` — so only one process runs the critical section across all servers. It's the mechanism behind `withoutOverlapping()` (Lesson 32) and the overselling defence (Lesson 64).

**Q5. What is pub/sub?**
> Redis's messaging pattern: publishers send messages to channels, subscribers receive them live. Publishers don't know the subscribers. Laravel's broadcasting can use Redis as the transport — the concept transfers to WebSockets (Lesson 59): events published to channels, browsers subscribed.

**Senior follow-up: Redis down — what breaks, and how do you degrade?**
> Cache misses fall through to the DB (Lesson 33), queue dispatches need a fallback (database queue or retry), locks fail safe or block, and rate limiting loses its backend. The senior answer is *layered resilience*: critical queues get a fallback connection, cache has a degradation path, and monitoring alerts — because Redis is a shared dependency of five subsystems, its failure is a five-way incident (Lesson 65's scenario 9).

## Common mistakes

❌ Using Redis as the source of truth for durable data — it's in-memory and can lose data on restart.

❌ Ignoring Redis's shared nature — a cache that assumes one server is a bug behind a load balancer.

❌ Forgetting that cache/queues/locks share the instance — one noisy subsystem degrades the others.

❌ Reaching for Redis when a relational query with an index is fine — the DB is not the enemy.

## Quick revision notes

- Redis = **in-memory, shared, sub-millisecond** — cache, queues, locks, rate limits, sessions
- Faster than the DB for **ephemeral hot data** — RAM + direct lookup vs disk + planning
- **DB owns the truth; Redis makes it fast**
- **Locks** = cross-process mutex (`Cache::lock`) · **pub/sub** = channel messaging
- One instance serves five subsystems — "Redis down" is a five-way incident (Lesson 65)

## Check your understanding

1. Why is Redis sub-millisecond where a DB is milliseconds?
2. Name the five subsystems Laravel points at Redis.
3. What's the correct split between Redis and the relational DB?
4. What does a cache lock guarantee across servers?
5. What degrades when Redis goes down, and how do you survive it?
