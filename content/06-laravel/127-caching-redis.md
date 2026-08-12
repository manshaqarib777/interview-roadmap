# Lesson 127 — Caching & Redis

**Interview importance:** 🔥 — a mid-frequency question, but the one that separates
"I've used the Cache facade" from "I can explain invalidation".

Lesson 118 made your queries fast. This lesson stops them from running at all. Laravel's
cache is a key-value store in front of your expensive work — the same shape as the Data
Cache from Lesson 90, but for the whole backend instead of one framework's fetches.

The question is never *"should I cache?"* — it's *"what, where, and how does it die?"* The
cache drivers, TTL, tags, `remember()`, and why Redis beats the database for hot ephemeral
data are the four answers you'll give in the interview.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the four main cache drivers and when each is the right call
- Write `Cache::remember('key', 3600, fn () => ...)` from memory and say what each argument does
- Explain TTL vs explicit invalidation, and the exact failure each one hides
- Say why cache tags only work on Redis and Memcached
- Explain why Redis beats a relational database for hot ephemeral data
- Answer "what happens when cached data becomes stale?" with the trade-off, not a shrug

## 1. One-Line Definition

**Caching in Laravel is a key-value store in front of your expensive work — write the result
once, read it back in microseconds, and decide deliberately how it dies.**

That last clause is the whole interview. Everyone can make a cache; the senior part is the
invalidation story — what makes an entry disappear, and what you do when the data changes
before the entry does.

## 2. Mental Model

Think of the cache drivers as different grades of storage:

- **`array`** is your **working memory** — fast, gone the moment the request ends. Useless
  across requests; perfect for tests.
- **`file`** is the **notebook** — works everywhere, zero setup, but every read hits the
  filesystem and it doesn't scale across servers.
- **`database`** is the **filing cabinet** — one shared store, but you're querying the same
  database you were trying to protect.
- **`redis`** is the **whiteboard next to the kitchen** — in-memory, shared by every server,
  and reachable in microseconds. It's the production default for a reason.

A cache entry is always three things: a **key**, a **value**, and a **TTL** (how long it
lives). Get the third one wrong and the first two are a liability.

## 3. Visual Flow

```text
   REQUEST: Cache::remember('users', 3600, fn () => User::all())
      │
      ├── CACHE HIT ──► return the stored value
      │                    one Redis GET  ·  ~µs  ·  zero SQL
      │
      └── CACHE MISS ──► run the closure
             │              SELECT * FROM `users`      ← the expensive part
             ▼
         store result under key 'users', TTL 3600s
             │
             ▼
         return value — and every request after this one is a HIT
```

The closure is the *source of truth* on a miss; the cache is the fast path on a hit. If the
data changes, neither side knows unless your code tells it.

## 4. How It Works

### The drivers

| Driver | Storage | Lives | Use when |
|---|---|---|---|
| `array` | in-process memory | one request | tests only |
| `file` | `storage/framework/cache` | across requests | single-server dev / small apps |
| `database` | `cache` table | across requests | no Redis available, one DB |
| `redis` | in-memory, shared | across requests & servers | production, multi-server, hot data |

Set the default in `config/cache.php` (`CACHE_STORE=redis` in `.env`), and Laravel's `Cache`
facade talks to whichever driver you picked — the code you write doesn't change.

> [!NOTE]
> A **cache hit is only a hit if the driver is shared.** With `file`, a second web server
> has its own notebook — hits on server A miss on server B. That's the standard reason to
> move to Redis the moment you scale horizontally.

### `Cache::remember()` — the signature

```php
Cache::remember('users', 3600, fn () => User::all());
//              └─key─┘  └TTL┘  └──closure, runs ONLY on a miss──┘
```

Three arguments, three rules:

1. **key** (`'users'`) — what you look the value up by. Name it like a URL, not a variable.
2. **TTL** (`3600`) — seconds until the entry is considered expired.
3. **closure** — the work that produces the value. Runs exactly once per TTL window.

```text
CACHE MISS  → closure runs   → SELECT * FROM `users`          → stored → returned
CACHE HIT   → closure skipped → value read from Redis in ~µs  → returned
first request of the window: ~20ms (query + network + Eloquent)
requests 2..N of the window: ~0.5ms (one Redis GET)
```

```narrate
line: "the closure runs ONCE per TTL window — that single fact is the entire value of remember()."
line: "every hit after the first skips the SELECT entirely: the database is never asked."
line: "3600 is a promise about acceptable staleness — a product decision, not a number to copy."
```

> [!PITFALL]
> `Cache::rememberForever('users', fn () => User::all())` stores the value with **no TTL at
> all**. It never expires on its own — if nothing forgets it, it is stale forever. "Forever"
> is a word you should only use when you have an explicit invalidation path (Section 5).

### Cache tags — Redis/Memcached only

A tag is a label you attach to entries so you can forget them as a group:

```php
Cache::tags(['users'])->remember('count', 3600, fn () => User::count());
Cache::tags(['users'])->remember('admins', 3600, fn () => User::where('role', 'admin')->get());

// a user row changed — nuke everything about users, in one line:
Cache::tags(['users'])->flush();
```

```text
without tags:   forget('count'); forget('admins'); forget('every-other-user-key')…  ❌ drift
with tags:      tags(['users'])->flush()  →  count + admins + anything else tagged 'users'
```

Tags only work on **Redis and Memcached**, because those stores support it natively. On
`file` or `database` drivers, `Cache::tags()` throws. That's not a Laravel quirk — it's
physics: an in-memory store can keep a tag index in memory; a filesystem can't do it cheaply.

### Invalidation — three weapons

```php
Cache::forget('users');                       // one key
Cache::tags(['users'])->flush();              // one group (Redis/Memcached)
Cache::flush();                               // EVERYTHING. do not do this in prod casually
```

```text
forget('users')    → that one key gone; next read re-runs the closure
tags()->flush()    → every tagged key gone; groups die together
flush()            → all keys in the store gone — including OTHER apps sharing the Redis
```

### Cache locks

Atomic "only one of me at a time" — the distributed mutex. Two requests both want to
recompute a slow value; the lock makes the second one wait instead of racing:

```php
Cache::lock('stats:recompute', 10)->get(function () {
    return $this->computeExpensiveStats();   // only ONE caller runs this at a time
});
```

```text
request A: acquires lock 'stats:recompute' → runs closure → releases
request B: lock held → waits (up to 10s)   → then runs or gives up
```

## 5. Real Project Usage

| You need… | Pattern |
|---|---|
| An expensive query result, same for everyone, few minutes old is fine | `Cache::remember('users', 3600, fn () => User::all())` |
| A value that must die the moment data changes | `Cache::rememberForever` + `forget`/`tags()->flush()` on write |
| Several keys that change together (a user's profile, posts, counts) | `Cache::tags(['users'])` + flush the tag on write |
| A slow job's result, expensive to recompute, racing requests | `Cache::lock()` |
| Per-user data (cart, session, settings) | Don't cache it in a shared store — that's what sessions are for |
| Rates / counters / leaderboards | Redis directly — `Redis::incr('views:post:1')` |
| Throttling an endpoint | `Cache::get`/`Cache::add` with a TTL — Lesson 128 builds the whole rate limiter on exactly this |

> [!TIP]
> The two real-world reads: **public aggregate data** (counts, lists, config) and **anything
> expensive and frequently asked**. Everything else — a dashboard that's already fast, a
> query that runs twice a day — is a cache looking for a problem.

## 6. Interview Explanation

> Laravel's cache is a key-value store in front of expensive work. I write
> `Cache::remember('users', 3600, fn () => User::all())` — on a miss the closure runs and
> the result is stored under the key for 3600 seconds; on a hit the closure is skipped
> entirely and the value comes back in microseconds. The driver decides where that store
> lives: `file` and `database` are single-server conveniences, `redis` is the production
> store because it's in-memory, shared across servers, and O(1) per lookup. Entries die by
> TTL or by explicit invalidation — `forget`, or `Cache::tags(['users'])->flush()` on
> Redis/Memcached, which is how I clear a whole group when a write happens. The senior
> question is always the staleness trade-off: TTL is automatic but can serve stale data;
> explicit invalidation is precise but every write path must remember to do it.

## 7. Senior-Level Insights

- **"What happens when cached data becomes stale?" is the real question — and the answer
  is a trade-off, not a feature.** A TTL of 3600 means: for up to an hour, the cache is
  *allowed* to be wrong. Users see a stale count, a missing post, yesterday's price. That
  is the cost of not touching the database. Explicit invalidation (`forget` on write)
  keeps data fresh, but only if *every* code path that changes the data also forgets the
  key — and code paths have a way of multiplying.
- **The senior pattern is invalidation on write, not waiting for TTL.** "When a user is
  created, `Cache::forget('users')` (or `tags(['users'])->flush()`) runs in the same
  transaction." TTL becomes the *safety net* for bugs, not the freshness mechanism.
- **Tag-based invalidation is the bridge between the two.** One write → one flush → every
  key about users dies together, with no inventory of "which keys mention users". That's
  why tags matter beyond Redis being cool.
- **When NOT to cache:** per-user data in a shared store (you leak one user's cart to the
  next request that shares the key — Lesson 90 made the same point about the Data Cache),
  data that changes so often the cache is always a miss plus a write, anything you haven't
  measured as slow. A cache that's always missing isn't a cache, it's a faster slow path.
- **Redis beats the relational DB for hot ephemeral data for three reasons:** it's
  **in-memory** (no disk, no buffer-pool misses), lookups are **O(1)** hash reads instead
  of query parsing → planning → index walks, and there is **no SQL at all** — no parser,
  no optimizer, no row materialisation. A DB answers "what rows match this predicate"; a
  cache answers "here is the value", because the value was already computed.

## 8. Common Mistakes

- **Caching per-user data with a shared key.** `remember('cart', ...)` with one key = user
  A's cart served to user B. If it's per-user, the key must be per-user
  (`'cart:'.$user->id`) or better, don't cache it.
- **`rememberForever` with no invalidation.** The entry never dies. "Forever" is a promise
  that a write path exists to kill it.
- **TTL as a substitute for invalidation.** "It'll be fine in an hour" is how you serve
  deleted posts for 59 minutes.
- **Using `file` or `database` on a multi-server deployment.** Every server has its own
  notebook — the cache is a series of polite suggestions, not a cache.
- **`Cache::flush()` in production.** It clears *every* key in the store, including keys
  from other features (or other apps) sharing the same Redis. One deploy nukes them all.
- **Cache-tagging on the wrong driver.** `Cache::tags()` on `file`/`database` throws.
  Tags are a Redis/Memcached capability.
- **Wrapping the cache around a query that's already fast** — you've added a write and a
  consistency problem to make a 2ms query take 0.5ms. Measure first (Lesson 118's
  `EXPLAIN` discipline).

## 9. Best Practices

✅ Cache public, expensive, rarely-changing reads — aggregate counts, lists, config

✅ Make TTL a named constant or config value, and treat it as a freshness promise

✅ Invalidate on write: `Cache::forget()`/`tags()->flush()` inside the same transaction

✅ Use tags for anything with a natural group (users, posts, products)

✅ Use `remember()` over manual `get`+`put` — it's race-free on a miss

✅ Use Redis for anything shared across servers or genuinely hot

✅ Name keys like URLs: `'posts:recent'`, `'user:42:stats'`, not `'data'`

❌ Don't cache per-user data in a shared store

❌ Don't call `flush()` in production paths

❌ Don't cache before measuring

## 10. Interview Questions

**Q1. What is `Cache::remember('users', 3600, fn () => User::all())` doing?**

> It checks the `users` key in the cache. On a hit, it returns the stored value and the
> closure never runs — no query. On a miss, it runs the closure, stores the result under
> `users` for 3600 seconds, and returns it. The closure is the source of truth, and it
> runs exactly once per TTL window.

**Q2. What's the difference between the cache drivers?**

> Where the store lives. `array` is per-request in-memory — only useful in tests. `file`
> writes to the filesystem — zero setup but per-server and slow to scan. `database` uses a
> cache table — shared but you're querying the DB you were trying to spare. `redis` is an
> in-memory shared store — O(1) lookups, works across servers, and the production default
> for hot data.

**Q3. Why does `Cache::tags()` only work on Redis and Memcached?**

> Tags need the store to maintain a tag index and atomically remove every key in a group.
> Redis and Memcached support that natively in memory; the file and database drivers
> don't have a cheap way to do it, so Laravel throws if you try.

**Q4. How do you invalidate a cache entry?**

> `Cache::forget('key')` for one key, `Cache::tags(['users'])->flush()` for a group, and
> `Cache::flush()` for everything — which is a sledgehammer and dangerous on a shared
> store. The important part is *when*: invalidation should run on the write that makes the
> data stale, not "eventually".

**Q5. What happens when cached data becomes stale?**

> That's the core trade-off. A TTL means the cache is allowed to be wrong for up to N
> seconds — automatic, but you serve stale data until it expires. Explicit invalidation —
> forgetting the key when the data changes — is precise, but every write path has to
> remember to do it, and they multiply. The senior answer is tag-based invalidation on
> writes: one flush per change, TTL kept as a safety net for the paths you missed.

**Senior follow-up: your users page shows a count that's wrong for up to an hour after new users sign up. Walk me through the fix.**

> First I'd decide what freshness we're promising — if the count must be accurate, the
> hour-long TTL is wrong for this use case. Then the fix: when a user is created (or
> deleted), run `Cache::tags(['users'])->flush()` inside the same transaction as the
> insert. The next read misses, recomputes, and stores the fresh value. I'd keep a short
> TTL as a safety net for write paths I might have missed, and I'd verify with a test that
> creating a user invalidates the tag — a cache test is worth more than a cache.

## 11. Follow-up Questions

**Why is Redis faster than querying a relational database for the same data?**

> Three reasons. Redis is in-memory — no disk I/O. Lookups are O(1) hash reads, while a
> query has to be parsed, planned, and executed against indexes. And there's no SQL at
> all — no parser, no optimizer, no row materialisation. The database answers "which rows
> match this predicate"; the cache answers "here's the value", because the value was
> already computed once.

**What's a cache stampede, and how does Laravel protect against it?**

> A hot key expires, and every concurrent request sees a miss and recomputes it at once —
> ten requests, ten identical expensive queries. `Cache::remember()` doesn't solve that by
> itself; the distributed lock does. `Cache::lock()` lets one request do the work while
> the others wait, so the closure runs once instead of once per concurrent request.

**Can you nest `remember()` calls, or cache computed arrays?**

> Yes — the value can be any serialisable PHP value: a collection, an array, a scalar. A
> common pattern is caching the *result of a calculation* — a summary array built from
> several queries — under one key, so one miss recomputes the whole thing and one forget
> kills the whole thing.

**What's the difference between the Laravel cache and sessions?**

> Sessions are per-user and keyed by the session id; the cache is shared and keyed by
> whatever you name. Cache a value because it's expensive to compute and shared; keep
> per-user state in the session or a database column. Putting per-user data in a shared
> cache key is the fastest way to serve user A's data to user B.

## 12. Comparison Table

| | `file` | `database` | `redis` | `array` |
|---|---|---|---|---|
| Storage | filesystem | cache table | in-memory | process memory |
| Shared across servers | ❌ | ✅ | ✅ | ❌ |
| Lookup cost | disk I/O + file read | SQL query | O(1) memory | O(1) memory |
| Tags | ❌ | ❌ | ✅ | ❌ |
| Survives restart | ✅ | ✅ | depends (persistence) | ❌ |
| Use in | dev, single server | no-Redis production | production | tests |
| `Cache::remember` works | ✅ | ✅ | ✅ | ✅ |

## 13. Code Example

The invalidation-on-write pattern, end to end — the version you'd actually ship:

```php
// A controller reading the cached value (public, expensive, rarely changes):
public function index()
{
    $users = Cache::tags(['users'])->remember('users:all', 3600, fn () => User::all());
    return view('users.index', ['users' => $users]);
}

// The write path — invalidation lives HERE, beside the mutation:
public function store(UserRequest $request)
{
    $user = DB::transaction(function () use ($request) {
        $user = User::create($request->validated());   // the INSERT
        Cache::tags(['users'])->flush();               // ← the invalidation, same transaction
        return $user;
    });

    return redirect()->route('users.index');
}
```

```text
GET /users              → miss → SELECT * FROM `users` → stored (tags: users) → 20ms
GET /users              → HIT  → served from Redis → 0.4ms
POST /users  (create)   → INSERT into users → tags(['users'])->flush()
GET /users              → miss again → fresh SELECT → stored → 20ms
   (and the old value was never served stale — the flush died with the transaction)
```

```narrate
line: "the invalidation is a sibling of the INSERT, inside the same transaction — if the insert rolls back, the cache is untouched."
line: "a reader never has to know what invalidates it; the writer owns that responsibility."
```

## 14. Performance Notes

- **One cache hit replaces an entire query pipeline** — connection, parse, plan, index
  walk, row materialisation, hydration of Eloquent models. That's the difference between
  20ms and 0.4ms, and it compounds per request.
- **Redis is sub-millisecond because it's memory-to-memory.** The network round trip is
  often the largest cost — keep Redis on the same network as the app (the VPC, not the
  public internet).
- **Don't cache cold paths.** A cache that's frequently missing is a write on top of a
  slow path. The only thing worse than a slow query is a slow query plus a cache miss.
- **Watch key expiry storms.** Dozens of keys with the same TTL expiring at the same
  second = a stampede of simultaneous recomputes. Jitter the TTL (`3600 + random(0..300)`)
  to spread the misses.
- **When it doesn't matter:** a request already under 10ms with a DB under load headroom.
  If you haven't measured that the query is the problem (Lesson 118), the cache is
  speculative complexity.

## 15. Debugging Scenarios

**Scenario 1: "I cleared the cache but the page still shows old data."**

Three layers to check. (1) Which store did you clear? `php artisan cache:clear` clears the
*default* store — if the page writes to `redis` but the CLI clears `file`, nothing
happened. (2) Is there a second cache — an HTTP/CDN cache, or the browser? (3) Did the
data come from the cache at all? Add `Cache::tags(['users'])->flush()` after the write and
re-test; if it's still stale, the reader path is bypassing the cache entirely.

**Scenario 2: "The cache works on my machine but not in production."**

Almost always the driver mismatch — `CACHE_STORE=file` locally, `redis` in prod, or a
Redis that isn't reachable from all app servers. Every server needs to share one store,
and every `Cache::tags()` call needs a driver that supports tags. Check the `.env`, then
check that the same Redis host is reachable from every worker.

**Scenario 3: "New signups don't show on the users page for an hour."**

The write path never invalidates — the TTL is doing all the freshness work. Put the
`tags(['users'])->flush()` beside the `User::create()`, inside the transaction. And write
the test that proves a create invalidates the tag, so the next regression is a red test,
not a stale page.

**Scenario 4: "Deploying caused a giant spike in database load."**

Classic key-expiry storm: a deploy changed the TTL (or the code path that *fills* the
cache), so all keys expired at once and every request recomputed. Check `php artisan
cache:clear` ran at deploy (it does, in some pipelines — that's fine, it's a one-time
recompute), and add jitter to the TTL so the refill spreads out.

## 16. Quick Revision Notes

- `remember(key, ttl, closure)` — closure runs on miss only, once per TTL window
- Drivers: `array` (tests) · `file` (single server) · `database` (no Redis) · `redis` (prod)
- Redis = in-memory, shared across servers, O(1) lookups, no SQL parse/plan
- TTL is a staleness promise — the cache is *allowed* to be wrong for that long
- Invalidation: `forget(key)` · `tags([...])->flush()` · `flush()` (sledgehammer)
- Tags are Redis/Memcached only — the store must maintain the tag index
- Senior pattern: invalidate on write, inside the transaction; TTL is the safety net
- Don't cache: per-user data (shared store), always-changing data, unmeasured queries
- `Cache::lock()` = distributed mutex against stampedes
- Name keys like URLs: `'user:42:stats'`, not `'data'`

## 17. Cheat Sheet

```text
CACHE FACADE
  Cache::remember('key', ttl, fn)      get or compute-and-store (race-free on miss)
  Cache::rememberForever('key', fn)    no TTL — YOU must invalidate
  Cache::get('key', $default)          read
  Cache::put('key', $value, ttl)       write
  Cache::forget('key')                 delete one
  Cache::tags(['users'])->flush()      delete a group   (Redis/Memcached only)
  Cache::flush()                       delete EVERYTHING — dangerous
  Cache::lock('name', seconds)         distributed mutex

DRIVERS  (config/cache.php → CACHE_STORE)
  array      per-request, tests only
  file       storage/framework/cache, single server
  database   cache table, no Redis available
  redis      production: in-memory, shared, O(1)

FRESHNESS STRATEGY
  TTL only        → automatic, but allowed to be stale for the window
  forget on write → precise, but every write path must do it
  tags on write   → one flush per group, TTL kept as safety net  ✅ ship this

WHY REDIS BEATS THE DB FOR HOT DATA
  in-memory (no disk) · O(1) hash read (no parse/plan/index walk) · no SQL at all

NEVER CACHE: per-user data in a shared key · data that changes faster than TTL ·
             queries you haven't profiled
```

## 18. Key Takeaways

> [!RECAP]
> - The cache is a key-value store in front of expensive work; the closure runs only on a miss
> - `remember('users', 3600, fn)`: one compute per TTL window, microseconds per hit
> - Drivers: array (tests), file (single server), database (fallback), redis (production)
> - Redis wins for hot ephemeral data: in-memory, O(1), no query parsing or plans
> - TTL is a staleness promise; explicit invalidation is precision; tags bridge the two
> - Tags need Redis/Memcached because the store must index them
> - Senior pattern: `tags()->flush()` beside the write, inside the transaction
> - Don't cache per-user data, always-changing data, or unmeasured queries
> - `Cache::lock()` stops stampedes when a hot key expires
> - Invalidation, not the cache itself, is what interviews are really testing

## Check your understanding

Answer these without looking back.

1. Write `Cache::remember` from memory, and say what each argument does.
2. When does the closure in `remember()` run — and how often per TTL window?
3. Name the four drivers and when each is the right call.
4. Why does `Cache::tags()` throw on the `file` driver?
5. What's the difference between `forget`, `tags()->flush()`, and `flush()`?
6. Explain the staleness trade-off: TTL vs explicit invalidation, and where tags fit.
7. Give three reasons Redis beats a relational database for hot ephemeral data.
8. List three things you should NOT cache, and why.

## What's Next

**Lesson 128 — Rate Limiting & Security.** The same cache store becomes a rate limiter —
and the attacks that cache won't stop: SQLi, XSS, CSRF, mass assignment and uploads, and
the exact Laravel feature that covers each.
