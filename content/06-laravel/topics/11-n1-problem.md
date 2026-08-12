# Topic 11 — The N+1 Problem

**Checklist anchor:** why lazy loading runs N queries · how `with()` fixes it · how to detect it

**Owning lesson:** [117 Eager Loading & the N+1 Problem](../117-n1-problem.md)

---

## The one-sentence answer

**The N+1 problem is when fetching N models triggers N *extra* queries — one per model — turning a 2-query operation into N+1; eager loading collapses it back to 2.**

## The mental model

The classic:

```php
$users = User::all();          // 1 query → 100 users

foreach ($users as $user) {
    echo $user->posts;         // 1 query PER user → 100 queries
}
```

**1 (users) + 100 (posts) = 101 queries** for 100 users. The relationship is lazy-loaded — fetched on first access, once per model.

The fix:

```php
$users = User::with('posts')->get();
// 1 query for users + 1 query for ALL posts (WHERE user_id IN (...)) = 2 queries
```

The difference grows with N: 101 queries vs 2. At 10,000 users, 10,001 vs 2 — that's the difference between a fast endpoint and a timeout.

## Why lazy loading runs N queries

Each `$user->posts` is a fresh query:

```text
select * from users                                    ← 1 query
select * from posts where user_id = 1                  ← per user
select * from posts where user_id = 2                  ← per user
select * from posts where user_id = 3                  ← per user
... × N
```

Lazy loading isn't wrong — it's the default because it's simple. It becomes a problem **in a loop**, where the per-model query fires N times.

## How `with()` solves it

```php
User::with('posts')->get();
// phase 1: select * from users
// phase 2: select * from posts where user_id in (1, 2, 3, ...)   ← ONE query
```

Laravel fetches all posts for all users in one `IN` query, then stitches them onto the right models in memory. Accessing `$user->posts` afterward hits the already-loaded collection — zero extra queries.

## How to detect N+1

1. **The query log.** Count the queries: dozens of identical `select * from posts where user_id = ?` lines in a loop is the smoking gun.

```php
DB::enableQueryLog();
$users = User::all();
foreach ($users as $user) { $user->posts; }
dump(DB::getQueryLog()); // 1 + N entries
```

2. **`preventLazyLoading()`** — the development guard. It throws on lazy access, so the N+1 surfaces in dev, not production:

```php
// in a service provider's boot():
Model::preventLazyLoading(!app()->isProduction());
```

3. **Telescope / Debugbar** — query counts per request at a glance.

## The plain-JS model (what the exercise does)

```js
// N+1: 1 + N queries
const users = allUsers();
for (const u of users) userPosts(u.id);   // one query per user

// eager: 2 queries
const users = allUsers();
const posts = postsForUsers(users.map(u => u.id)); // WHERE id IN (...)
// stitch posts onto users in memory
```

## Interview questions

**Q1. What is the N+1 problem?**
> Fetching a collection then touching a lazy relationship in a loop. Each access fires a query, so N models produce N extra queries — 1 + N total. With 100 users, 101 queries; with 10,000, 10,001. The fix is eager loading, which fetches all related rows in one `IN` query.

**Q2. How does `User::with('posts')->get()` solve it?**
> It runs two queries: the users, then all their posts in one `WHERE user_id IN (...)` query. Laravel assigns each post to its user in memory, so accessing `$user->posts` never touches the database again. The relationship count drops from N+1 to 2.

**Q3. How do you detect N+1?**
> Enable the query log and look for identical per-iteration queries; enable `Model::preventLazyLoading()` in development so lazy access throws; or use Telescope/Debugbar's per-request query counts. The loop-with-a-relationship is the pattern to grep for.

**Q4. Does eager loading fix every N+1?**
> No. Nested relationships need `with('posts.comments')`, and you can still N+1 with a *nested* lazy load in a loop. Also, filtering by a relationship uses `whereHas`, and counts use `withCount` — eager loading isn't the tool for those.

**Q5. When is lazy loading fine?**
> On a single model (no N), or when a relationship is rarely accessed. The problem is specifically *in a loop*. `loadMissing()` even gives you "load if not already loaded" so repeated access doesn't re-query.

**Senior follow-up: How do you prevent N+1 from shipping?**
> Three layers: `preventLazyLoading()` fails tests in dev when lazy access happens; code review greps for relationship access inside `foreach`; and performance testing watches query counts per request (Telescope). The fix is usually one `with()` — the cost of missing it is multiplicative.

## Common mistakes

❌ `$user->posts` inside `foreach` — the textbook N+1.

❌ Eager-loading nested relations shallowly — `with('posts')` still N+1s if you access `posts.comments` in the loop.

❌ Counting via hydration — `$user->posts->count()` loads all posts; `withCount('posts')` is one aggregate.

❌ Only fixing it after load testing — `preventLazyLoading()` finds it in dev.

## Quick revision notes

- N+1 = **1 query for the collection + N for the relationship**, in a loop
- Fix = **`with()`** → 2 queries (`WHERE user_id IN (...)`), stitched in memory
- Detect = **query log**, `preventLazyLoading()`, Telescope/Debugbar
- Nested loops need **nested eager loading** (`with('posts.comments')`)
- Counts: **`withCount()`** — don't hydrate what you won't render

## Check your understanding

1. Write out the query count for 100 users with and without eager loading.
2. Why does `with()` need just one query for all related rows?
3. Name three ways to detect an N+1.
4. When is lazy loading still the right choice?
5. What's the nested-relationship version of the N+1 trap?
