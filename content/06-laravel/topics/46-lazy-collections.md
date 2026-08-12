# Topic 46 — Lazy Collections

**Checklist anchor:** `LazyCollection` · `cursor()` · `lazy()` · why you don't load 1,000,000 records into RAM

**Owning lesson:** [118 Query Optimization & the Query Builder](../118-query-optimization.md)

---

## The one-sentence answer

**A lazy collection streams results one at a time instead of holding them all in memory — the difference between loading a million rows and iterating them.**

## The mental model

Compare the two:

```php
$users = User::all();          // 1,000,000 models IN MEMORY at once
foreach ($users as $user) { /* ... */ }

$users = User::cursor();       // streams — one model at a time
foreach ($users as $user) { /* ... */ }
```

`all()` builds a collection of a million models — memory blows up. `cursor()` returns a **generator**: the query runs, and each iteration pulls the next row, so memory stays flat no matter how many rows exist.

```text
all()      →  [row1 row2 row3 ... row1,000,000]   ← all in RAM
cursor()   →  row1 → row2 → row3 → …              ← one at a time
```

## How it works

```php
// cursor: the raw stream — one Eloquent model at a time
foreach (User::cursor() as $user) {
    // $user is a real model; only ONE exists in memory at once
}

// lazy: the same idea as a LazyCollection you can chain
User::lazy()
    ->filter(fn ($u) => $u->isActive())
    ->each(fn ($u) => /* ... */);

// lazy with a chunk size — fetch 1000 at a time, still bounded memory
User::lazy(1000)->each(fn ($u) => /* ... */);
```

### `cursor()` vs `lazy()`

| | `cursor()` | `lazy()` |
|---|---|---|
| Returns | A generator you iterate directly | A `LazyCollection` you can chain |
| Chaining | Manual loop | `->filter()->map()->each()` pipeline |
| Memory | One model at a time | One model at a time |

Both keep memory flat; `lazy()` adds the collection toolkit to the stream.

### `cursor()` vs `chunk()` (from Lesson 12)

| | `chunk()` | `cursor()` |
|---|---|---|
| Fetches | N rows per batch, passes to a callback | One row at a time |
| Memory | Bounded by batch size (500) | Bounded by one |
| Per-row cost | Handles each batch | Handles each row |
| Use when | Heavy per-batch work, or you need batch context | Simple per-row work over a huge set |

## The plain-JS model (what the exercise does)

```js
// the anti-pattern:
const rows = db.queryAll();          // 1,000,000 rows in memory
rows.forEach(handle);                // memory: O(N)

// the lazy version (generator):
function* rows() {
  for (let i = 0; i < 1_000_000; i++) yield db.fetchRow(i); // one at a time
}
for (const r of rows()) handle(r);   // memory: O(1)
```

## Interview questions

**Q1. What is a lazy collection?**
> A collection that yields items one at a time instead of holding them all. `User::cursor()` streams rows through a generator, and `User::lazy()` returns a chainable `LazyCollection` — the collection toolkit applied to a stream. Memory stays flat however many rows exist.

**Q2. Why not just `User::all()` on a million records?**
> `all()` hydrates every row into a collection in memory — a million models, a million instances, likely a memory exhaustion. `cursor()`/`lazy()` stream: the query runs and each iteration pulls the next row, so memory is bounded no matter the table size.

**Q3. `cursor()` vs `lazy()`?**
> `cursor()` returns a generator for direct iteration. `lazy()` returns a `LazyCollection` so you can chain `filter`, `map`, `each` — and `lazy(n)` fetches in chunks of n while staying bounded. Same streaming idea; `lazy()` adds the collection pipeline.

**Q4. `cursor()` vs `chunk()`?**
> `chunk(500)` fetches 500 models at a time and hands each batch to a callback — memory bounded by the batch, and it keeps a batch together. `cursor()` streams one at a time — the lowest memory. Use `chunkById` when the table changes mid-run; use `cursor` for simple per-row work.

**Q5. What are the caveats of lazy loading large sets?**
> A long-lived query holds a DB connection open for the whole iteration — don't do heavy work per row while streaming. Also, `cursor()` doesn't reload model state, so mutations during the stream can behave differently than a snapshot. And like `chunk`, memory-per-row still applies: `select` only what you need.

**Senior follow-up: When do you choose a lazy collection over pagination?**
> When the consumer is a **batch process**, not a user — an export, a report, a data migration. Pagination is for user-facing pages (bounded slices with nav); lazy collections are for processing the whole set in bounded memory. "Export a million users" is `cursor()`; "show users page 3" is `paginate()`.

## Common mistakes

❌ `User::all()` for batch processing — memory exhaustion on big tables.

❌ Long-running per-row work inside a `cursor()` loop — the DB connection stays open the whole time.

❌ Fetching whole rows when you only need one column — `cursor()` + `select('email')` keeps per-row cost minimal.

❌ Using lazy collections for user-facing pages — that's what pagination is for.

## Quick revision notes

- Lazy collection = **stream one at a time** — memory stays O(1)
- `cursor()` = generator · `lazy()` = chainable `LazyCollection` · `lazy(n)` = chunked
- `all()` on a million rows = **memory blowup**
- `chunk()` = batches · `cursor()` = single rows
- Batch jobs → **lazy** · user pages → **pagination**

## Check your understanding

1. What exactly stays flat when you stream a million rows?
2. `cursor()` vs `lazy()` — when do you pick which?
3. Why does a `cursor()` loop hold a DB connection open?
4. When is `chunk()` a better fit than `cursor()`?
5. Batch processing vs pagination — which consumer gets which?
