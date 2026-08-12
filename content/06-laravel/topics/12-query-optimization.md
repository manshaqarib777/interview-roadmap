# Topic 12 — Eloquent Query Optimization

**Checklist anchor:** `select` · `where` · `whereHas` · `with` · `withCount` · `exists` · `chunk` · `chunkById` · `cursor` · `lazy` · pagination · indexes · query logging · `EXPLAIN`

**Owning lesson:** [118 Query Optimization & the Query Builder](../118-query-optimization.md)

---

## The one-sentence answer

**Query optimization is making sure each Eloquent call fetches only what you need, in the fewest queries, using indexes — measured with the query log and `EXPLAIN`, not guesses.**

## The mental model

Every Eloquent query has three costs you can control:

1. **How many queries** — eager loading collapses N+1 into 2 (Lesson 11).
2. **How much data** — `select()` and `exists()` avoid hydrating columns and rows you don't need.
3. **How the DB finds it** — indexes turn full scans into lookups.

The senior answer to "your endpoint is slow" always starts the same way: **measure first** (query log, `EXPLAIN`), then fix the query, then the index — never guess.

## The methods that matter

### Fetch only what you need

```php
// don't hydrate everything
User::where('active', true)->get();         // filter with where
User::where('active', true)->exists();      // just a boolean — no hydration
User::where('active', true)->count();       // just a number — no hydration
User::select('id', 'name')->get();          // only these columns
User::pluck('name');                        // just one column, as a list
```

### Query through relationships

```php
User::whereHas('posts', fn ($q) => $q->where('published', true))->get();
// users who have a published post — EXISTS-style filter, no posts hydrated

User::withCount('posts')->get();            // users + posts_count column
User::withCount(['posts' => fn ($q) => $q->where('published', true)])->get();
```

`whereHas` filters *by* a relationship; `withCount` adds a count without loading the relation.

### Large result sets — don't load 1M rows into RAM

```php
// chunk: process N rows at a time (safe against memory blowups)
User::chunk(500, function ($users) { foreach ($users as $u) { /* handle */ } });

// chunkById: stable for datasets that change during processing (by PK)
User::orderBy('id')->chunkById(500, fn ($users) => /* ... */);

// cursor: lazy stream of models — one at a time
foreach (User::cursor() as $user) { /* never holds all in memory */ }

// lazy: the same idea but returns a lazy collection
User::lazy()->each(fn ($user) => /* ... */);
```

The "1 million records" answer (checklist Scenario 2) is: **don't fetch them all** — `chunk`/`cursor`/`lazy`, or paginate.

### Pagination

```php
User::paginate(50);            // classic — page numbers + total (COUNT query)
User::simplePaginate(50);      // prev/next only — no COUNT, cheaper
User::cursorPaginate(50);      // keyset pagination — stable for huge sets, no offset
```

`cursorPaginate` avoids the offset problem at scale: it pages by a cursor key instead of `OFFSET` which degrades on deep pages.

### Query logging & EXPLAIN

```php
DB::enableQueryLog();
User::where('status', 'paid')->get();
dump(DB::getQueryLog());       // see the SQL + bindings

// EXPLAIN — is the index being used?
DB::select('EXPLAIN ' . User::where('status', 'paid')->toSql());
```

## The plain-JS model (what the exercise does)

```js
// fetch only what you need — the shape, not the SQL
users.filter(u => u.active);                 // where
users.some(u => u.active);                   // exists
users.length;                                // count — no hydration
users.map(u => u.name);                      // pluck
```

## Interview questions

**Q1. How would you optimize an endpoint returning 1 million records?**
> I wouldn't return a million records. I'd ask what the client actually needs: paginate (`cursorPaginate` for huge sets), or stream with `chunk`/`cursor` for processing. If the endpoint truly returns a big list, add filtering, sorting, and pagination at the API boundary (Lesson 23). The query itself gets `select` for only the needed columns and an index on the filter column.

**Q2. `whereHas` vs `with`?**
> `whereHas` filters the *parent* by whether a relationship matches — "users with a published post" — using an `EXISTS` query and hydrating only the users. `with` loads the related models for display. One is a filter, the other a fetch.

**Q3. `chunk` vs `cursor`?**
> `chunk` fetches N models at a time and passes each batch to a callback — bounded memory, good for heavy per-row work. `cursor` streams one model at a time with a generator — the lowest memory footprint. `chunkById` is the stable variant when the dataset changes mid-run (it pages by primary key, so inserts/deletes don't skip rows).

**Q4. Why is `cursorPaginate` better for very large datasets?**
> Classic `paginate` uses `OFFSET`, which gets slower and less stable on deep pages (the DB skips N rows each time) and double-reads under writes. `cursorPaginate` pages by a key — "give me the next 50 after this cursor" — so deep pages cost the same as the first, and concurrent changes don't shift the page.

**Q5. How do you use `EXPLAIN` to find a slow query?**
> Run `EXPLAIN` on the query SQL and read the `type` and `rows` columns: `ALL` means a full table scan (missing index), `ref`/`range` mean an index is being used, and `rows` shows how many rows the DB examined. The fix is usually an index matching the `WHERE`/`ORDER BY` columns.

**Senior follow-up: Walk me through the "1 million records" scenario.**
> First, measure: enable the query log or Telescope, see what's slow. Second, fix the shape: `chunkById` or `cursor` if it's a batch job — never hydrate a million models. Third, index the filter columns and `select` only what's needed. Fourth, if it's an API, paginate and let the client filter. The answer is: don't fetch them all, and prove it with the query log.

## Common mistakes

❌ `->get()->count()` — hydrates everything; use `->count()`.

❌ Loading a 1M-row table into memory — chunk/cursor/lazy exist for exactly this.

❌ Deep `OFFSET` pagination on huge tables — keyset (`cursorPaginate`) is the fix.

❌ Adding an index without `EXPLAIN` — measure first, then index.

## Quick revision notes

- Optimize in order: **measure → fix the query → add the index**
- `exists()`/`count()`/`select()`/`pluck()` — **don't hydrate what you don't render**
- `whereHas` filters *by* a relationship · `withCount` counts it
- Big sets: **`chunk` / `chunkById` / `cursor` / `lazy`** — bounded memory
- Pagination: `paginate` (COUNT) · `simplePaginate` (prev/next) · `cursorPaginate` (keyset)
- `EXPLAIN` shows **`ALL`** (scan) vs **`ref`/`range`** (index)

## Check your understanding

1. What's the order of operations for optimizing a slow query?
2. `whereHas` vs `with` vs `withCount` — when is each right?
3. Why does `chunkById` beat `chunk` when the data changes mid-run?
4. What makes `cursorPaginate` scale where `OFFSET` doesn't?
5. What do `ALL` and `ref` mean in `EXPLAIN`, and what do you do about it?
