# Lesson 117 — Eager Loading & the N+1 Problem

**Interview importance:** ⭐⭐⭐⭐⭐ — the most-asked Laravel performance question, and the
fastest way to look senior in any Eloquent conversation.

Ask any Laravel interviewer for *the* performance question and this is it: show a `foreach`
over `User::all()` with `$user->posts` inside, and ask what's wrong. The answer isn't about
caching or indexes — it's about counting queries. One innocent-looking property access turns
one request into one *hundred* requests.

The fix is one word — **eager loading** — and the whole lesson is three ideas: why the naive
loop is O(N+1), how `with('posts')` collapses it to two queries with a `WHERE user_id IN (…)`,
and how to make the framework *catch* the mistake so it never ships.

## Learning Objectives

By the end of this lesson you should be able to:

- Recognise the N+1 pattern on sight and count the queries it produces
- Explain *why* N+1 is O(N) queries and why that grows with data
- Fix it with `with('posts')` and say exactly what SQL that runs
- Use `load()` / `loadMissing()` to eager-load after the fact
- Eager-load nested and conditional relations (`with(['posts' => fn ($q) => …])`)
- Detect N+1 with `Model::preventLazyLoading()`, `once()`, and the query log

## 1. What is the N+1 Problem?

Loading N rows, then loading one related thing per row — N *extra* queries. If you fetch 100
users and touch `$user->posts` for each, that's **1 query for users + 100 for posts** = 101
queries. The "N+1" is the N relation queries plus the original one.

```php
$users = User::all();                      // query #1

foreach ($users as $user) {
    echo $user->posts->count();            // query #2, #3, #4, … one PER user
}
```

It's the single most common performance bug in Laravel apps, precisely because the code reads
perfectly — nothing in the syntax hints that a query just ran.

## 2. Mental Model

**Think of the relationship property as a vending machine: every single access costs a
quarter (a query).** Inside a loop, that's N quarters. Eager loading is buying all of them in
one transaction — one query, `WHERE user_id IN (all the ids)`, handed out row by row.

| Approach | Queries for 100 users | SQL executed |
|---|---|---|
| Lazy (the bug) | 1 + 100 | 1× `SELECT users`, 100× `SELECT posts WHERE user_id = ?` |
| Eager (`with('posts')`) | 1 + 1 | 1× `SELECT users`, 1× `SELECT posts WHERE user_id IN (…)` |

The ratio is the story: lazy = N+1, eager = 2, no matter how many rows.

## 3. Visual Flow

```text
   LAZY — 100 users → 101 queries
   ┌─────────────────────────────────────────────┐
   │  SELECT * FROM users                        │  ← 1 query
   │  foreach $user:                             │
   │     SELECT * FROM posts WHERE user_id = 1   │  ┐
   │     SELECT * FROM posts WHERE user_id = 2   │  │
   │     SELECT * FROM posts WHERE user_id = 3   │  ├─ 100 queries
   │     …                                       │  │
   │     SELECT * FROM posts WHERE user_id = 100 │  ┘
   └─────────────────────────────────────────────┘

   EAGER — 100 users → 2 queries
   ┌─────────────────────────────────────────────┐
   │  SELECT * FROM users                        │  ← 1 query
   │  SELECT * FROM posts                        │  ← 1 query
   │  WHERE user_id IN (1, 2, 3, …, 100)         │
   │                                             │
   │  Eloquent then groups the posts by user_id  │
   │  and attaches each set to its user, in PHP. │
   └─────────────────────────────────────────────┘
```

Eager loading moves the grouping from the database *round-trips* into a single in-memory
pass — one query with a big `IN`, then a `groupBy` in PHP.

## 4. How it Works: Why Lazy Loading Runs N Queries

When you access `$user->posts`, Eloquent runs the relationship query **for that one model**,
then caches the result on the instance. A loop over 100 models means 100 separate `WHERE
user_id = ?` executions, each with its own network round-trip:

```php
$users = User::all();                     // 1 query

foreach ($users as $user) {
    $user->posts;                         // 100 queries — one per user
}
```

The actual SQL traffic:

```text
SELECT * FROM users;

SELECT * FROM posts WHERE user_id = 1;
SELECT * FROM posts WHERE user_id = 2;
SELECT * FROM posts WHERE user_id = 3;
...
SELECT * FROM posts WHERE user_id = 100;

TOTAL: 101 queries
```

Every `SELECT * FROM posts WHERE user_id = ?` is a full round-trip to the database. At 1–2ms
each you're at 100–200ms of pure query overhead before a single row is rendered — and the
count grows linearly with data. 10,000 users on a report page = 10,001 queries and a timeout.

> [!PITFALL]
> It gets worse with nested relations. `$user->posts` + `$post->comments` inside the same
> loop is N+1 queries *per user* — 100 users × (posts + comments) explodes to O(N×M). Eager
> loading scales each *level* down to one query, not each relationship occurrence.

## 5. How it Works: The Fix — `with()` and the `IN` Query

`with()` tells Eloquent to fetch the relationship for **all** loaded models up front, using a
single query with a `WHERE … IN (…)`:

```php
$users = User::with('posts')->get();      // 2 queries, not 101

foreach ($users as $user) {
    echo $user->posts->count();           // already loaded — no SQL
}
```

What Eloquent actually runs:

```text
SELECT * FROM users;

SELECT * FROM posts
WHERE user_id IN (1, 2, 3, ..., 100);

TOTAL: 2 queries
```

Afterwards Eloquent collects every returned post, groups them by `user_id` in memory, and
writes each group onto its matching `User` instance. Your code is byte-for-byte identical —
`$user->posts` works exactly the same — only the query count changed.

> [!TIP]
> The relationship method (`$user->posts()`) returns the **builder** — safe to chain, never
> fires by itself. The property (`$user->posts`) is what triggers the query. That distinction
> is why `with('posts')` and `$user->posts()->count()` can both avoid N+1 without you seeing
> the difference in the code.

## 6. Real Project Usage

N+1 almost never shows up as a headline bug — it hides in list pages, dashboards and exports:

```php
// A dashboard "latest activity" feed — the classic place N+1 hides.
$users = User::with('posts')
             ->withCount('posts')
             ->orderBy('last_login_at', 'desc')
             ->take(20)
             ->get();

// withCount avoids a SECOND N+1: post counts become a subquery, not 20 more queries.
foreach ($users as $user) {
    echo "{$user->name} — {$user->posts_count} posts\n";
}
```

Real project rules of thumb:

- **Index pages, dashboards, exports** — `with()` the relations you render.
- **`withCount`** when you only need a number per row (one subquery, not N).
- **Forms and detail pages** usually load one row — no loop, no N+1.

## 7. Interview Explanation

> The N+1 problem is loading N parent rows and then triggering one query per row by accessing
> a lazy relationship — `User::all()` followed by `$user->posts` in a loop is 1 + N queries.
> The fix is eager loading: `User::with('posts')->get()` runs the posts query once, with a
> `WHERE user_id IN (…)`, and Eloquent attaches the results to the right models in memory —
> so 100 users costs 2 queries, not 101.
>
> The deeper point is that lazy relationship access hides a query per access, so the way to
> stop shipping N+1 is to make it *visible*: `Model::preventLazyLoading()` in development
> throws the moment an unloaded relation is accessed, and the query log or Debugbar shows the
> count in black and white.

## 8. Senior-Level Insights

- **Say the growth, not just the bug.** "1 + N queries, so linear in N, which means it's
  invisible at 10 rows and lethal at 10,000" — naming the scaling is what sounds senior.
- **`preventLazyLoading()` belongs in development, not production.** Throwing an exception on
  a hot production path is a great way to take the site down. Enable it in local/testing, and
  ship the fix instead.
- **Nested `with()` is where the real queries live.** `with(['author.profile'])` is two
  queries (author, then profile), `with(['posts.comments', 'tags'])` is three — count per
  *level*, and the total stays flat no matter how many rows.
- **Eager loading is a contract, not a tweak.** The moment you render a list, decide which
  relations it needs and `with()` them — otherwise the "fix" is a whack-a-mole game where
  each new dev adds one more lazy access.
- **`load()` and `loadMissing()` matter for branching code.** When only some rows need a
  relation (an admin flag, a first-item check), load it conditionally — always-eager loading
  pays for relations you rarely use.

## 9. Common Mistakes

- ❌ **`with('posts')` on the first query, then a *nested* lazy access anyway** — `$user->posts`
  is loaded, but `$post->comments` isn't. The fix must cover every level you touch.
- ❌ **Eager-loading relations you never use** — `with(['posts', 'comments', 'likes'])` on a
  page that renders one column is 3 queries you didn't need.
- ❌ **`preventLazyLoading()` in production** — the correct move is dev-only, so CI catches
  N+1 before deploy, not after.
- ❌ **Forgetting `withCount`** — counting posts in a loop is the same N+1, just with `COUNT(*)`.
- ❌ **Caching eager-loaded models** — serialising models with loaded relations and reading
  them back later re-triggers the lazy load on access (or carries stale data).
- ❌ **Looping `find()` in a loop** — `User::find($id)` per iteration is a manual N+1; one
  `whereIn('id', $ids)` fixes it.

## 10. Best Practices

✅ `with()` every relationship you render — count levels, not rows

✅ Use `withCount('posts')` instead of `$user->posts->count()` in loops

✅ Nest deliberately: `with(['posts.comments'])` when you'll traverse both levels

✅ Load conditionally with `load()` / `loadMissing()` for branching code paths

✅ Run `Model::preventLazyLoading()` in development and tests so N+1 throws

✅ Keep an eye on the query count in Debugbar / the query log before every deploy

## 11. Interview Questions

**Q1. What is the N+1 problem in Laravel?**

> Loading N parent rows, then accessing a lazy relationship once per row — `User::all()` with
> `$user->posts` in a loop issues 1 query for users plus N separate queries for posts. The
> total grows linearly with the result size, so it's harmless in tests and destructive in
> production.

**Q2. Why is it inefficient?**

> Every relationship access is a full database round-trip with its own query plan and network
> latency. 100 users means 100 `WHERE user_id = ?` executions instead of one. The cost is
> O(N) round-trips on top of the data itself — and nested relations make it O(N×M).

**Q3. How do you fix it?**

> Eager loading: `User::with('posts')->get()`. Eloquent fetches all posts in one query with
> `WHERE user_id IN (…)`, groups them in memory, and attaches them to the right users. Same
> code afterwards — 100 users now cost 2 queries total.

**Q4. What is the difference between `with()` and `load()`?**

> `with()` loads relations as part of the original query. `load()` eager-loads *after* the
> models already exist — when you didn't know until runtime which relations you'd need. Both
> run the same two-query pattern; they differ in timing.

**Q5. What is `loadMissing()`?**

> Like `load()`, but it only loads relations that aren't already loaded. If a collection was
> built in pieces and some models already carry the relation, `loadMissing()` avoids the
> duplicate query.

**Q6. How do you detect N+1 in your app?**

> Turn on `Model::preventLazyLoading()` in development — the first access to an unloaded
> relation throws. For a single request, `Model::preventLazyLoading(true, true)` (the `once`
> flag). Or watch the query count: Laravel Debugbar shows it per request, and
> `DB::getQueryLog()` / `DB::listen()` print every query.

**Q7. How do you eager-load a relation with a condition?**

> With a closure: `User::with(['posts' => fn ($query) => $query->where('published', true)])
> ->get()`. The closure receives the relation's query builder, so it only constrains the
> eager-loaded set — the users query is untouched.

**Q8. How many queries does `User::with(['posts.comments'])->get()` run?**

> Three, regardless of row count: users, then posts for all users (`IN`), then comments for
> all those posts (`IN`). One per *level* of the graph, not one per row.

**Senior follow-up: A report page runs 1000 queries. Walk me through how you'd fix it.**

> First, measure — I'd pull the query log or Debugbar and confirm the shape: is it one query
> plus N per parent, or nested N×M? Then map the touched relations and `with()` each level I
> actually render, using `withCount` for totals and `loadMissing` where the path is
> conditional. I'd also run `Model::preventLazyLoading()` locally to make any stragglers
> throw. After the fix I'd re-run the log and verify the count collapsed to one query per
> level — then wire `preventLazyLoading` into the test suite so it can't regress.

## 12. Follow-Up Questions

**Q1. What's the difference between eager loading and lazy eager loading?**

> Eager loading (`with()`) runs at the initial query. Lazy eager loading (`load()` /
> `loadMissing()`) runs later, on a collection you already have — same SQL shape, decided at
> a different moment. Lazy eager loading is for when you can't know the needs up front.

**Q2. Does eager loading use a JOIN?**

> No — and that's the part people get wrong. `with('posts')` is *two separate queries*: the
> parents, then the children with `WHERE user_id IN (…)`. Eloquent joins them in PHP. A real
> JOIN (`join()` or `with()` of a constrained relation) merges rows instead, which is right
> for filtering but wrong for loading a relationship.

**Q3. Why does `$user->posts()` not cause N+1 but `$user->posts` does?**

> `posts()` returns the query builder — it never executes. `posts` accesses the relationship
> and runs it. Calling `$user->posts()` and chaining `->count()` or `->where()` gives you a
> single query without loading everything. The "lazy load" only happens on property access.

**Q4. When is a *single* query with a JOIN actually better than eager loading?**

> When you're filtering by the related table — "users who have written a published post" is
> one query with a JOIN or `whereHas`/`exists`; eager loading gives you all users *then* all
> posts. Filtering is a query-shape problem; loading is a round-trip problem. Use `whereHas`
> for the first and `with()` for the second.

## 13. Comparison Table

| | Lazy (the bug) | Eager `with()` | Lazy eager `load()` | `withCount()` |
|---|---|---|---|---|
| When it runs | On property access | With the first query | After, on a collection | With the first query |
| Queries for 100 users | 1 + 100 | 2 | 1 (earlier) + 2 | 1 (with a subquery) |
| Use for | Single-model access | Rendering lists | Branching code paths | "How many per row?" |
| Risk | N+1 | Over-eager loading | Missed relations | Extra JOIN/subquery |

## 14. Code Example

```php
use App\Models\User;

// BAD — 101 queries for 100 users
$users = User::all();

foreach ($users as $user) {
    echo "{$user->name}: {$user->posts->count()} posts\n";
}

// GOOD — 2 queries, same output
$users = User::with('posts')->get();

foreach ($users as $user) {
    echo "{$user->name}: {$user->posts->count()} posts\n";
}
```

Output — the query counts, side by side:

```text
BAD  →  101 queries   (1 for users + 100 for posts)
GOOD →  2 queries     (1 for users + 1 for posts WHERE user_id IN (…))

Mansha Khan: 3 posts
Ali Ahmed: 1 post
Sara Lee: 12 posts
```

The rendered HTML is identical. Only the database traffic changed — which is exactly why N+1
ships so often: *the bug is invisible in the output.*

## 15. Performance Notes

- **Count queries, not lines.** The invariant: one query per *level* of the relation graph
  you render. Two levels = 3 queries max, three levels = 4.
- **`withCount` is a subquery, not a relation.** `User::withCount('posts')->get()` reads
  `$user->posts_count` with no second query and no N+1.
- **`whereHas` filters without loading.** "Only users with published posts" via `whereHas`
  runs one query with an `EXISTS` — cheaper than eager-loading everything and filtering in
  PHP.
- **Chunk large exports.** `User::with('posts')->chunk(500, ...)` keeps the memory flat; a
  single `->get()` on a giant table is its own scaling problem.
- **The query log is the ruler.** `DB::enableQueryLog()` before, `DB::getQueryLog()` after —
  if the count per request doesn't stay flat as data grows, you haven't fixed N+1.

## 16. Debugging Scenarios

- **"My page got slow only in production."** — Tests used 10 rows; production has 10,000.
  Turn on `Model::preventLazyLoading()` locally with realistic data, or watch Debugbar's query
  count on a real list page. Count per request, then `with()` what's missing.
- **"`with('posts')` didn't change the query count."** — You're still touching a *nested*
  relation (e.g. `$post->comments`) or accessing the relation through a different loaded
  model. Fix each level: `with(['posts.comments'])`.
- **"`$user->posts` throws in dev but worked before."** — Someone enabled
  `Model::preventLazyLoading()`. That's the detector working as intended: the relation wasn't
  eager-loaded. Add it to the `with()` call (or `load()` it where the code branches).
- **"A conditional eager load returns fewer rows than expected."** — `with(['posts' => fn
  ($q) => $q->where('published', true)])` doesn't hide users — it gives some users an *empty*
  posts collection. If rows vanished, you've used the closure to filter *users* instead of
  *posts* (that's `whereHas`'s job).

## 17. Quick Revision Notes

- **N+1** = N parent rows + one relation query per row = O(N) round-trips.
- **`with('posts')`** = two queries — parents, then `WHERE user_id IN (…)` — joined in PHP.
- **`load()`** = eager-load after the models exist; **`loadMissing()`** = only the not-loaded.
- **Nested** `with(['posts.comments'])` = one query per level, flat in row count.
- **Conditional** `with(['posts' => fn ($q) => $q->where(...)])` constrains only the loaded set.
- **`withCount('posts')`** = `$user->posts_count` with a subquery, no N+1.
- **Detect**: `Model::preventLazyLoading()` (dev), `preventLazyLoading(true, true)` (one
  request), Debugbar / `DB::getQueryLog()`.

## 18. Cheat Sheet

```text
N+1            → foreach over all() + $row->relation  = 1 + N queries
FIX            → Model::with('relation')->get()        = 2 queries
AFTER THE FACT → $users->load('relation')              = 2 queries
SKIP LOADED    → $users->loadMissing('relation')
NESTED         → with(['posts.comments'])              = 3 queries, always
CONDITIONAL    → with(['posts' => fn ($q) => …])
COUNT WITHOUT  → withCount('posts') → $row->posts_count
DETECT         → Model::preventLazyLoading()           (dev only)
ONE REQUEST    → Model::preventLazyLoading(true, true) (the $once flag)
RULER          → DB::getQueryLog() / Debugbar query count
```

## 19. Key Takeaways

> [!RECAP]
> - N+1 is 1 + N queries: one parent query, then one per row via lazy relationship access
> - It grows linearly with rows — invisible in tests, fatal in production
> - `with('posts')` collapses it to two queries using `WHERE user_id IN (…)`
> - `load()` / `loadMissing()` eager-load after the fact; nested and conditional loads
>   (`with(['posts' => fn ($q) => …])`) keep it at one query per level
> - `withCount()` gets per-row totals as a subquery instead of a second N+1
> - Detect it with `Model::preventLazyLoading()` (dev), the `once` flag for a single request,
>   or the query log / Debugbar — then never ship without the count in sight

## Check your understanding

Answer these without looking back.

1. How many queries does `User::all()` + `foreach … $user->posts` run for 500 users?
2. Why is the cost O(N) and not just "a few extra queries"?
3. Write the fix, and state the exact SQL Eloquent runs for it.
4. What's the difference between `with()`, `load()`, and `loadMissing()`?
5. How many queries does `User::with(['posts.comments', 'tags'])->get()` run — and why?
6. Write a conditional eager load that only loads published posts.
7. How would you make N+1 throw an exception in development, and why not in production?
8. When do you reach for `whereHas` instead of `with()`?

## What's Next

**Lesson 118 — Query Optimization & the Query Builder.** `whereHas`, `withCount`, `chunk`,
indexes and `EXPLAIN` — the rest of making Eloquent fast, without reaching for raw SQL.
