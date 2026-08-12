# Topic 13 — Query Builder

**Checklist anchor:** `DB::table()` · joins · subqueries · grouping · aggregates · transactions · raw expressions · unions · pagination · Query Builder vs Eloquent

**Owning lesson:** [118 Query Optimization & the Query Builder](../118-query-optimization.md)

---

## The one-sentence answer

**The query builder is Laravel's SQL-building API — `DB::table('users')` chains methods that compile to SQL, without Eloquent models.**

## The mental model

Eloquent sits *on top of* the query builder. The query builder is the **middle layer**: more SQL-flavoured than Eloquent, more ergonomic than raw `DB::select`.

```text
Eloquent models      ← highest level (domain)
Query builder        ← SQL-shaped API (DB::table)
Raw SQL             ← lowest level (DB::select / selectRaw)
```

Every Eloquent query eventually compiles through the query builder. When you need joins, aggregates, subqueries, or unions that feel awkward as relationships, you drop to `DB::table()`.

## How it works

### The basics

```php
DB::table('users')->where('active', true)->orderBy('name')->get();
// select * from users where active = ? order by name asc

DB::table('users')->where('id', 7)->first();
DB::table('users')->where('email', $email)->exists();
```

### Joins

```php
DB::table('users')
    ->join('posts', 'users.id', '=', 'posts.user_id')
    ->select('users.name', 'posts.title')
    ->get();
// select users.name, posts.title from users inner join posts on users.id = posts.user_id
```

### Aggregates & grouping

```php
DB::table('orders')
    ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
    ->groupBy('day')
    ->get();

DB::table('orders')->sum('total');
DB::table('orders')->avg('total');
DB::table('orders')->max('total');
```

### Subqueries

```php
DB::table('users')
    ->whereIn('id', DB::table('orders')->select('user_id')->where('total', '>', 100))
    ->get();
```

### Raw expressions

```php
DB::table('users')
    ->selectRaw('count(*) as total, status')
    ->groupBy('status')
    ->get();

// parameter binding still applies — never interpolate user input
DB::table('users')->whereRaw('email LIKE ?', ["%{$search}%"]);
```

### Unions

```php
$recent = DB::table('posts')->where('created_at', '>', now()->subWeek());
$featured = DB::table('posts')->where('featured', true);
$recent->union($featured)->get();
```

### Transactions

```php
DB::transaction(function () {
    DB::table('orders')->insert($order);
    DB::table('inventory')->decrement('stock', 1);
    // any failure → everything rolls back
});
```

### Pagination

```php
DB::table('users')->paginate(50);
DB::table('users')->simplePaginate(50);
DB::table('users')->cursorPaginate(50);
```

## Query Builder vs Eloquent — the comparison

| | Query Builder | Eloquent |
|---|---|---|
| Level | SQL-shaped | Domain (models, relationships) |
| Return type | StdClass objects | Model instances |
| Relationships | Manual joins | `with()`, eager loading, N+1-safe |
| Events/accessors/casts | None | Full model behaviour |
| Best for | Joins, aggregates, reports, bulk ops | Domain models, CRUD, app code |
| Performance | Lighter (no hydration machinery) | Slightly heavier per instance |

**The interview answer:** use Eloquent for your domain models — relationships, casts, events, serialization are where the value is. Drop to the query builder when you're doing reporting-style work — complex joins, grouped aggregates, unions — where model behaviour adds nothing.

## Interview questions

**Q1. What is the query builder?**
> Laravel's fluent SQL API. `DB::table('users')` chains `where`, `join`, `groupBy`, `orderBy` and compiles to a parameter-bound SQL statement. It returns plain `stdClass` objects. Eloquent is built on top of it; the builder is the SQL-shaped layer.

**Q2. Query Builder vs Eloquent — when do you use which?**
> Eloquent for domain work: models, relationships, casts, events — the behaviour matters. The query builder for reporting and SQL-shaped work: complex joins, aggregates, unions — where you want the SQL, not the model. Eloquent is the query builder plus a domain layer; use the layer that fits the job.

**Q3. How does the query builder prevent SQL injection?**
> Through parameter binding. Values passed to `where`, `whereRaw`, `selectRaw` are bound as parameters (`whereRaw('email LIKE ?', [$search])`), so the DB treats them as data, not SQL. The rule is the same as everywhere: never interpolate user input into a SQL string.

**Q4. When would you use a subquery?**
> When a condition depends on another table without wanting a join — "users who have an order over $100" via `whereIn` against a subquery, or a `selectRaw` with a correlated subquery for a computed column. Subqueries often read better than their join equivalents and avoid row multiplication.

**Q5. How do unions work?**
> Two queries with the same column shape combined with `union` — e.g. recent posts union featured posts. The builder composes them into `... union ...` and you can paginate the result. Useful when two different filters should return one combined set.

**Senior follow-up: When do you reach for raw SQL instead of the builder?**
> When the query is so dynamic or so specific that the builder's abstraction adds noise — window functions, complex `CASE` expressions, database-specific features. The trade: raw SQL leaves the DB, not the builder, in charge — keep it parameter-bound and behind a repository/service so it's testable.

## Common mistakes

❌ Interpolating user input into SQL strings — the injection hole; always bind parameters.

❌ Using the builder where Eloquent's relationships/eager loading would prevent N+1.

❌ Forgetting transactions around multi-step writes.

❌ Joining and selecting `*` when you only need a few columns — `select()` the columns.

## Quick revision notes

- `DB::table()` = **fluent SQL** — joins, aggregates, subqueries, unions, transactions, pagination
- Returns **stdClass**, no model behaviour
- Eloquent **sits on top** of the builder
- **Bind parameters, never interpolate** — the injection defence
- Builder for **reporting/joins/aggregates**; Eloquent for **domain models**

## Check your understanding

1. What layer is the query builder, and what sits above and below it?
2. When do you pick the builder over Eloquent?
3. How does parameter binding stop injection?
4. Write a join, an aggregate with `groupBy`, and a union from memory.
5. Where do transactions fit in a multi-step builder write?
