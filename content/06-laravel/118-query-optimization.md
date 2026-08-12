# Lesson 118 — Query Optimization & the Query Builder

**Interview importance:** ⭐⭐⭐ — the "your API is slow" question, and the toolbox you're expected to reach for in the answer.

Lesson 117 ended with the N+1 problem: a loop that turns one endpoint into fifty queries.
This lesson is the rest of the toolbox — the Query Builder, `chunk`/`cursor`, joins,
aggregates, and above all **indexes**. Everything here answers one question: *how do you turn
a slow endpoint into a fast one?*

You already know Eloquent; this lesson is where you stop treating it as magic and start
reading the SQL it generates. Eloquent builds on the Query Builder, and the Query Builder is
a thin wrapper over SQL — which is why the first move of any optimization is *seeing the
SQL*. Lesson 127 (caching) is the last rung of the same ladder; everything before it is this
lesson.

## Learning Objectives

By the end of this lesson you should be able to:

- Read the SQL a Query Builder chain generates, and explain each clause
- Explain why `chunk()`/`cursor()` exist and when each is the right call
- Turn a naive "load everything" endpoint into a measured, indexed, streamed one
- Build a composite index from a query, and justify it with selectivity
- Read an `EXPLAIN` output and name the plan that means "you're done"
- Answer "how would you optimize an endpoint returning 1M records?" with a decision ladder, not a guess

## 1. One-Line Definition

**The Query Builder is a fluent, chainable API for building and running SQL — indexes are the
data structure that makes those queries fast — and optimization is the discipline of proving
which of the two you need.**

## 2. Mental Model

Think of the Query Builder as **an SQL typewriter with autocomplete**, and Eloquent as a
model sitting on top of it. The chain you write is a *recipe* — every link adds one clause:

```text
DB::table('users')            →  SELECT * FROM users
  ->where('active', 1)        →  WHERE active = 1
  ->orderBy('created_at')     →  ORDER BY created_at
  ->limit(10)                 →  LIMIT 10
```

The model only changes the first line: `User::query()` instead of `DB::table('users')` —
everything downstream is the same builder. The Query Builder is *both* the thing Eloquent is
made of *and* your escape hatch when a model method won't say what you mean.

An index is a different mental model: **the book's index at the back, not the pages**. The
table is the pages (full scan). The index is the alphabetised list that tells the database
which pages to open — and it stays sorted even when you append pages.

## 3. Visual Flow

```text
slow endpoint (the before):

  GET /admin/users/export
      └─▶ User::all()                        -- 1M rows into PHP memory
      └─▶ foreach ($users as $user)          -- 1M Eloquent models
      └─▶ $user->orders->count()             -- 1M extra queries  (N+1)
      └─▶ response: 400 MB JSON               -- 14 s, memory spike, timeout

fast endpoint (the after):

  GET /admin/users/export
      └─▶ User::query()->select([...])       -- only the columns you need
      └─▶ ->withCount('orders')              -- 1 extra query, no N+1
      └─▶ ->whereHas('orders', fn ($q) =>    -- filtered in SQL, not PHP
                $q->where('status', 'paid'))
      └─▶ ->orderByDesc('created_at')
      └─▶ ->chunk(1000, fn ($chunk) => ...)  -- 1M rows, ~1 MB in PHP at a time
      └─▶ response streams 1000 rows at a time   -- 4 s, flat memory, done
```

## 4. How It Works

### The chain builds SQL, then runs it once

A chain is just method calls returning the same builder object. Nothing hits the database
until a *terminal* method runs — `get()`, `first()`, `count()`, `exists()`, `pluck()`.
Everything before that is string-building against the connection's grammar.

```php
$users = DB::table('users')
    ->where('active', 1)
    ->orderByDesc('created_at')
    ->limit(10)
    ->get();
```

```text
SELECT * FROM users WHERE active = 1 ORDER BY created_at DESC LIMIT 10
```

```narrate
1-4: the chain only records clauses — no SQL, no query, nothing touches the database
5: get() is the terminal call — here the SQL is compiled once and executed once
```

### The bread-and-butter methods

| Chain method | SQL it produces |
|---|---|
| `where('status', 'paid')` | `WHERE status = 'paid'` |
| `where('a', 1)->orWhere('b', 2)` | `WHERE a = 1 OR b = 2` |
| `whereIn('id', [1,2,3])` | `WHERE id IN (1,2,3)` |
| `whereBetween('price', [10, 50])` | `WHERE price BETWEEN 10 AND 50` |
| `orderBy('created_at', 'desc')` | `ORDER BY created_at DESC` |
| `limit(10)` / `offset(40)` | `LIMIT 10 OFFSET 40` |
| `select('id', 'email')` | `SELECT id, email` |
| `distinct()` | `SELECT DISTINCT …` |
| `groupBy('team_id')->having('n', '>', 5)` | `GROUP BY team_id HAVING n > 5` |

## 5. Real Project Usage

### `whereHas` and `withCount` — filter and count through a relationship

The two methods that make most Eloquent performance questions go away:

```php
$users = User::query()
    ->whereHas('orders', fn (Builder $q) => $q->where('status', 'paid'))
    ->withCount('orders')
    ->get();
```

```text
-- whereHas generates one EXISTS subquery:
SELECT * FROM users
WHERE EXISTS (
  SELECT * FROM orders
  WHERE orders.user_id = users.id AND status = 'paid'
);

-- withCount adds a correlated subquery to the SELECT list:
SELECT users.*,
  (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS orders_count
FROM users WHERE EXISTS ( ... );
```

```narrate
1-3: both methods add SQL — neither loads related models into memory, they constrain and count inside the database
1: whereHas filters users by "has at least one paid order" — an EXISTS, not a JOIN
2: withCount puts the order count into a column of the same row — no N+1 count queries later
```

The whole point: `withCount('orders')` is **one** query where `$user->orders->count()`
inside a loop would be **N**. If you only need the number, `withCount` never hydrates the
related models.

`exists()` is the same idea for a single boolean:

```php
$hasOrders = Order::query()->where('user_id', $user->id)->exists();
```

```text
SELECT exists(SELECT * FROM orders WHERE user_id = 7) AS exists
-- 1 query, 1 row, 0 models hydrated
```

> [!TIP]
> If you only need *whether* something exists, never fetch it. `exists()` on the builder is
> one cheap query; `first()` then checking for `null` hydrates a whole model you discard.

## 6. Interview Explanation

> Eloquent is a wrapper over the Query Builder, and the Query Builder is a wrapper over SQL —
> so the first thing I do with any slow query is make it print the SQL it actually runs.
> The big wins are almost never "write faster PHP"; they're *fewer and narrower queries*.
> `whereHas` and `withCount` push filtering and counting into the database instead of
> hydrating models and looping over them in PHP. For big result sets I never load everything
> into memory — I use `chunk()` or `cursor()` so the query streams. And if the query is still
> slow after that, it's almost always a missing index, which I confirm with `EXPLAIN` and fix
> with a migration. N+1, fat selects, missing indexes — in that order, measured at every step.

## 7. Senior-Level Insights

- **The hierarchy of optimizations.** N+1 first (it's a *number of queries* bug, the worst
  kind), then fat selects (`SELECT *` when you need two columns), then missing indexes, then
  memory (chunk/cursor), then cache (Lesson 127). Each rung is one order of magnitude. Jumping
  to caching before fixing N+1 is polishing a query you shouldn't be running.
- **Never optimize a query you haven't counted.** Laravel's query log is the measurement —
  `DB::enableQueryLog()` around a request tells you how many queries ran. "It feels slow" is
  not data; "41 queries, 39 of them identical" is.
- **`withCount` vs `loadCount` vs a grouped join** — three ways to count, different shapes.
  `withCount` is the default answer; a raw join is only for when you also need the grouped
  rows.
- **Indexes are a *space* trade.** Each index costs writes (every INSERT/UPDATE maintains it)
  and disk. You don't index "the database", you index the query shapes that actually run.
  Three composite indexes that serve real queries beat twelve single-column guesses.
- **Know when the Query Builder wins over Eloquent.** Bulk writes (`DB::table()->insert()`
  in one statement vs `Model::create()` per row), reporting/aggregation, and anything with a
  convoluted `JOIN`. Eloquent stays for business logic; the builder stays for bulk and
  reporting.

## 8. Common Mistakes

- **`get()` on a huge table.** One million rows as one million Eloquent models in PHP memory
  — the classic "works on my laptop, OOMs in production" failure. Stream with `chunk()` or
  `cursor()`.
- **`foreach ($users as $u) { $u->orders; }`** — N+1, Lesson 117. The whole reason `with`,
  `withCount` and `whereHas` exist.
- **Querying inside a loop at all.** Even a "fast" query inside a loop is N queries; hoist it
  out with a `whereIn` or an aggregate.
- **Indexing the wrong column order.** `INDEX (status, user_id)` cannot serve
  `WHERE user_id = 7 AND status = 'paid'` at index speed — only `(user_id, status)` can.
  Column order in a composite index is the column order in the WHERE, leftmost first.
- **Indexing low-selectivity columns alone.** `WHERE active = 1` on a table where 90% of
  rows are active — the index helps less than you think; it's still scanning most of the
  table. Only index it as part of a composite that starts with something selective.
- **`whereYear(DB::raw(...))`-style raw calls inside normal chains** — fine when needed, but
  they skip the query builder's binding system and can break the query log's parameter
  interpolation. `whereRaw` with bound parameters is the safe form.
- **Paginating deep pages with `offset`.** `LIMIT 10 OFFSET 999990` is the same full scan
  every time — that's what `cursorPaginate` fixes (Section 12).

## 9. Best Practices

✅ Count your queries before touching anything — `DB::enableQueryLog()`, then fix the number, not the feeling

✅ Use `withCount`/`whereHas` instead of loading relations to count or filter (Lesson 117)

✅ `select()` only the columns you need — `SELECT *` is a habit, not a requirement

✅ Stream big results with `chunk()` or `cursor()` — never `get()` a million rows

✅ Index the query shapes that exist — composite, leftmost-first, selectivity-first

✅ Read the SQL: `toSql()` while developing, `EXPLAIN` before you declare a query fixed

✅ Stream exports via a `StreamedResponse`, never by building the whole array first

❌ Don't `get()` a big table — OOM is a production incident, not a quirk

❌ Don't add an index you can't attach to a real query

## 10. Interview Questions

**Q1. What's the difference between the Query Builder and Eloquent?**

> The Query Builder is a fluent API over SQL — `DB::table('users')->where(...)->get()`
> builds a query and runs it. Eloquent is a layer on top that hydrates the result rows into
> models and adds relations, scopes, mutators and events. Underneath, an Eloquent query is
> the same builder. I use Eloquent for business logic and the builder for bulk inserts,
> aggregates and reporting queries where a model adds nothing.

**Q2. What is N+1 and how do you fix it?**

> N+1 is one query to load a collection plus one query per row for a relation — 1M rows, 1M
> extra queries. Eloquent fixes it with eager loading: `with('orders')` runs one extra query
> with a `WHERE user_id IN (...)`. When I don't even need the models, `withCount('orders')`
> or `whereHas('orders', ...)` avoids hydrating them at all. Lesson 117 is the full answer.

**Q3. `chunk()`, `chunkById()`, `cursor()` and `lazy()` — what's the difference?**

> All four keep memory flat on big result sets. `chunk(1000)` fetches 1000 rows, gives them
> to the callback, then the next 1000 — but it uses `OFFSET`, which gets slower as you go
> deep and can skip rows if the data changes mid-run. `chunkById(1000)` keeps a
> `WHERE id > lastId` watermark instead, so it's stable and offset-free. `cursor()` fetches
> rows lazily one at a time with the least memory, but the connection stays open the whole
> time, so it's wrong for long-running jobs. `lazy()` is `cursor()` that returns a lazy
> collection — you get collection methods without loading everything. Rule of thumb:
> `chunkById` for scripts that mutate as they go, `cursor`/`lazy` for read-only streaming.

**Q4. Why is `cursorPaginate` better than `paginate` on huge datasets?**

> `paginate` uses `LIMIT ? OFFSET ?`, and the database still walks past every skipped row on
> every page — page 100,000 is as slow as the first page would be if it scanned everything.
> `cursorPaginate` keys off the last row's ordered column instead (`WHERE (created_at, id) >
> (?, ?)`) and walks a small index window, so deep pages stay fast. It can't jump to "page
> 37" and it needs a unique, ordered column — you trade random access for constant cost per
> page.

**Q5. What is a composite index and when do you use one?**

> An index on multiple columns, in a fixed order. MySQL can use it leftmost-first, so
> `(user_id, status)` serves `WHERE user_id = ?`, and `WHERE user_id = ? AND status = ?`, but
> not `WHERE status = ?` alone. I use one when a query filters on several columns at once —
> the classic is the user's status list, Lesson 119's example. Column order is
> selectivity-first, then the range column last.

**Q6. Walk through optimizing an endpoint that returns 1M records.**

> Measure first. I put the query log on, see what actually runs, and check `EXPLAIN`. Then I
> walk the ladder: kill the N+1 with `with`/`withCount`/`whereHas`; narrow the `select()` to
> what the client needs; add a composite index on the filter + order columns and confirm with
> `EXPLAIN` that the plan uses it; then stream the result with `chunkById` or `cursor` so
> memory stays flat instead of loading a million models. Only after all that do I consider
> caching — and by then the endpoint is usually fast enough that the cache is a bonus, not a
> band-aid.

**Senior follow-up: "Your query is using the index you just added — but it's still slow."**

> Then the index is being read but not *limiting* enough — low selectivity, or a range that
> still covers most rows. I'd check the row estimate in `EXPLAIN`: if the plan reads 900k of
> 1M rows, the index isn't the bottleneck; the WHERE shape is. Then I'd look at widening the
> filter, adding the range column to the tail of the index, or reconsidering whether the
> client needs 1M rows in one response at all — usually they don't, and the real fix is
> pagination, a narrower export, or a pre-aggregated table.

## 11. Follow-up Questions

**What does a JOIN actually generate, and when do you use one over a relationship?**

> A join flattens two tables into one row set: `SELECT users.name, orders.total FROM users
> INNER JOIN orders ON orders.user_id = users.id`. The builder's `->join('orders', 'orders.user_id', '=', 'users.id')`
> generates exactly that. Eloquent relationships are also joins under the hood when you use
> `with`; I reach for an explicit join when I'm aggregating or reporting and don't want
> models hydrated at all.

**How does a subquery differ from a join?**

> A subquery is a query nested inside the outer one — `whereHas` produces an `EXISTS`
> subquery; `withCount` produces a correlated `SELECT (SELECT COUNT(*) …)` in the select
> list. Joins widen rows, subqueries annotate or filter them without multiplying them. If a
> join is producing duplicate rows (one per order), a subquery or `distinct` usually fixes it.

**When would you cache instead of optimizing further?**

> When the data is read far more than it changes, and the query is already reasonable. The
> decision rule: optimize until the query is index-fast, then cache when the *volume of
> identical reads* is the problem. Lesson 127 covers `Cache::remember`, tags and invalidation
> — caching a broken query just caches the slowness.

## 12. Comparison Table

| | `paginate` | `simplePaginate` | `cursorPaginate` |
|---|---|---|---|
| SQL | `LIMIT ? OFFSET ?` + COUNT | `LIMIT ? OFFSET ?` | `WHERE (k1,k2) > (?,?)` window |
| Extra query | +1 COUNT (heavy on big tables) | none | none |
| Deep-page cost | full scan every page | full scan every page | small index walk |
| Random access to page N | ✅ | ✅ | ❌ |
| Needs unique ordered column | ❌ | ❌ | ✅ |
| Used for | admin lists | infinite scroll | huge datasets, feeds |

## 13. Code Example

The full ladder applied to the "export all users" endpoint:

```php
// Before — 1M models, 1M count queries, then a 400 MB response:
$users = User::all();
foreach ($users as $user) {
    $data[] = [$user->name, $user->orders()->count()];
}

// After — narrow select, withCount, indexed order, streamed in chunks:
DB::enableQueryLog();

User::query()
    ->select(['id', 'name', 'email', 'created_at'])
    ->withCount('orders')
    ->where('active', 1)
    ->orderByDesc('created_at')
    ->chunk(1000, function ($chunk) {
        foreach ($chunk as $user) {
            yield [$user->name, $user->email, $user->orders_count];
        }
    });

dump(DB::getQueryLog());
```

```text
-- what the chain generates (simplified):
SELECT id, name, email, created_at,
  (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS orders_count
FROM users
WHERE active = 1
ORDER BY created_at DESC
LIMIT 1000 OFFSET ?        -- chunk() advances the offset per batch

-- query count before:   1 (users) + 1,000,000 (orders count) = 1,000,001
-- query count after:    1 + ceiling(1,000,000 / 1000)        = 1,001
-- memory before:        ~1M models resident;  after: 1000 models at a time
```

```narrate
3-4: select() narrows the columns; withCount('orders') replaces the million-count loop with one subquery
7: where/orderBy map to WHERE and ORDER BY — an index on (active, created_at) serves both
9: chunk(1000) is what keeps memory flat — 1000 rows per batch instead of a million
13: the query log is the measurement that says "1,001 queries, not 1,000,001"
```

> [!PITFALL]
> `chunk()` uses `OFFSET`, which re-scans skipped rows and can skip or duplicate rows if the
> table changes mid-iteration. For a script that mutates as it goes (deleting, updating rows),
> use `chunkById()` — it keeps a `WHERE id > last_id` watermark instead.

## 14. Performance Notes

- **The two-orders-of-magnitude moves, in order:** kill N+1 (×N queries → ×1), narrow the
  select, add the index (×10–100 on the query), stream the result (memory flat, response
  starts sooner), then cache (Lesson 127). Each is a *class* of win, not a tweak.
- **An index turns a scan into a seek.** `WHERE user_id = 7 AND status = 'paid'` with no
  index reads the whole table; with `(user_id, status)` it reads a few rows from a small
  sorted structure. On a 1M-row table that's often the difference between 800 ms and 2 ms.
- **EXPLAIN is the proof.** A good plan shows `key: (user_id,status)` and `rows: 3`; a scan
  shows `key: NULL` and `rows: 1000000`. You don't *believe* a query is fixed — you read the
  plan.
- **Query logging costs.** `DB::enableQueryLog()` keeps every query in memory — never leave
  it on in production. Enable per-request, read it, turn it off. In production use
  `DB::listen()` to ship to a logger or `EXPLAIN` the slow query log instead.
- **Memory is the quiet killer on exports.** A 1M-row `get()` can OOM a PHP-FPM worker
  mid-request. `chunk()`/`cursor()` make the memory *constant* regardless of table size —
  that's the property to quote in an interview.
- **When it doesn't matter:** a table with a few thousand rows, or an internal admin page.
  The index and the chunk still cost nothing to write correctly — but don't reach for Redis
  before checking whether the query is the problem.

## 15. Debugging Scenarios

**Scenario 1: "My page runs 41 queries and they're all identical."**

That's N+1, Lesson 117's signature. The repeated query is the relation load inside the loop.
Add `with('relation')` (or `withCount`/`whereHas` if you only need the number), and the 41
queries collapse into 2.

**Scenario 2: "`EXPLAIN` says `key: NULL, rows: 1000000`."**

The query is doing a full table scan — there's no index for this WHERE shape. Add a
migration with the composite index that matches the query's filter columns, leftmost-first
(Section 16's cheat sheet), then re-run `EXPLAIN` and watch `key` fill in and `rows` drop.

**Scenario 3: "The index exists but `EXPLAIN` still shows the scan."**

Either the query's column order doesn't match the index (an index on `(status, user_id)`
can't serve `WHERE user_id = ?` first), or the predicate is non-sargable — `WHERE
LOWER(email) = ?` can't use an index on `email`. Fix the query to use the bare column, or
reorder the index columns to match the query.

**Scenario 4: "My export runs out of memory on a million-row table."**

`get()` hydrated a million models at once. Switch to `chunkById(1000)` (or `cursor()`) so
only one batch is in memory, and stream the HTTP response with `StreamedResponse` so the
client sees the first rows while the rest still generate.

## 16. Quick Revision Notes

- Query Builder = fluent SQL; Eloquent sits on top; `toSql()`/`dd()` shows the generated SQL
- `whereHas` → `EXISTS` subquery; `withCount` → correlated `COUNT` in the SELECT list
- `exists()` is a boolean query, not a model fetch
- N+1 is a *number-of-queries* bug — `with`, `withCount`, `whereHas` are the fixes (L117)
- `chunk()` uses `OFFSET`; `chunkById()` uses a `WHERE id > ?` watermark — use it when mutating
- `cursor()`/`lazy()` stream one row at a time — least memory, connection held open
- `paginate`/`simplePaginate` = `OFFSET`; `cursorPaginate` = keyset window — use it on huge data
- Joins flatten tables; subqueries annotate or filter without multiplying rows
- Composite index: leftmost-first, selectivity-first, range column last
- The ladder: measure → query log → N+1 → indexes → chunk/cursor → cache (L127)
- `EXPLAIN`: `key` non-NULL + small `rows` = the query is done; `key: NULL` = index it

## 17. Cheat Sheet

```text
OPTIMIZE ANY ENDPOINT (the decision ladder):
  1. MEASURE     → DB::enableQueryLog(); how many queries? which SQL?
  2. N+1         → with() / withCount() / whereHas()      (1M queries → 2)
  3. NARROW      → select() only the columns you use
  4. INDEX       → composite index matching the WHERE shape, confirm with EXPLAIN
  5. MEMORY      → chunkById(1000) / cursor() instead of get()
  6. CACHE       → Cache::remember(...) only when reads dwarf writes  (L127)

READ THE PLAN (EXPLAIN):
  key: (user_id, status)   rows: 3        → index hit, done
  key: NULL                rows: 1000000  → full scan, add an index

INDEX RULES:
  composite order = WHERE column order, leftmost first
  selectivity first, range column last, covering when you can
  WHERE user_id = ? AND status = ?  →  INDEX (user_id, status)

BIG RESULT SETS:
  get()             → all rows in memory      (never for 1M)
  chunk(1000)       → OFFSET batches          (watch mutation)
  chunkById(1000)   → id-watermark batches    (safe while mutating)
  cursor() / lazy() → one row at a time       (connection stays open)
  cursorPaginate()  → keyset windows          (deep pages stay fast)
```

## 18. Key Takeaways

> [!RECAP]
> - The Query Builder is fluent SQL; Eloquent is a layer on top — read the SQL it generates
> - `whereHas`/`withCount`/`exists` do filtering and counting in the database, not in PHP
> - N+1 is the worst bug class — it multiplies the number of queries (L117)
> - `chunkById`/`cursor`/`lazy` stream big results with flat memory; `get()` does not
> - `cursorPaginate` beats `paginate` on huge datasets because it skips the offset scan
> - Indexes are the data structure that makes queries fast — composite, leftmost-first
> - `EXPLAIN` is the proof: `key: NULL, rows: 1000000` means you're not done
> - The ladder: measure → query log → N+1 → indexes → chunk/cursor → cache (L127)

## Check your understanding

Answer these without looking back.

1. Where does `whereHas('orders', fn ($q) => $q->where('status', 'paid'))` put the filtering — and what SQL does it generate?
2. Why is `chunkById` safer than `chunk` when a script deletes rows as it goes?
3. Which method streams rows one at a time, and what's the cost of that choice?
4. Why does `cursorPaginate` stay fast on page 100,000 when `paginate` doesn't?
5. Build the composite index for `WHERE user_id = ? AND status = ? ORDER BY created_at DESC` and justify the column order.
6. What two fields in an `EXPLAIN` output tell you a query is fixed?
7. Recite the optimization ladder from measure to cache.

## What's Next

**Lesson 119 — Migrations, Schema & Seeders.** Now that you know *which* index a query needs,
learn how to make it exist: the schema tools — columns, keys, soft deletes — and the
`migrate` command family that applies and rolls them back safely.