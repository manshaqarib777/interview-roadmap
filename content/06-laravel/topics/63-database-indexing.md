# Topic 63 — Database Indexing

**Checklist anchor:** primary · unique · composite · covering · selectivity · query plans · `EXPLAIN`

**Owning lessons:** [119 Migrations, Schema & Seeders](../119-migrations.md) · [118 Query Optimization & the Query Builder](../118-query-optimization.md)

---

## The one-sentence answer

**An index is a lookup structure that lets the database find rows without scanning the whole table — and the right index matches the query's `WHERE`/`ORDER BY` columns.**

## The mental model

Without an index, a `WHERE` on a million-row table means **scanning all million rows**:

```text
SELECT * FROM orders WHERE user_id = 7
→ full table scan: check every row (rows_examined = 1,000,000)
```

With an index on `user_id`, the DB jumps straight to the matching rows:

```text
index on (user_id)  →  like a phone book sorted by user_id
→ find "7" once, read its rows (rows_examined ≈ matches)
```

An index is the **sort order the database precomputes** so lookups become binary-search fast instead of linear-scan slow. The cost: writes get slightly slower (the index must be maintained), and the index takes space. The trade is almost always worth it on read-heavy paths.

## The index types

| Index | What it does | Example |
|---|---|---|
| **Primary** | The row identity, unique, clustered (usually `id`) | `$table->id()` |
| **Unique** | Enforces uniqueness *and* indexes the column | `$table->string('email')->unique()` |
| **Composite** | One index on multiple columns, left-to-right | `$table->index(['user_id', 'status'])` |
| **Covering** | Index contains *every* column the query needs → no table read at all | `select user_id, status` with `(user_id, status)` index |

## The composite-index rule

```sql
WHERE user_id = ? AND status = ?
```

Two separate indexes (`user_id` alone, `status` alone) — the DB usually picks **one**. The composite `(user_id, status)` serves the query directly:

```php
$table->index(['user_id', 'status']);
```

**Order matters, left to right:** `(user_id, status)` serves `WHERE user_id = ?`, `WHERE user_id = ? AND status = ?`, and (partially) `ORDER BY user_id`. It does *not* serve `WHERE status = ?` — the leading column is missing. Put the most selective (most discriminating) column first.

## Selectivity

**Selectivity** = how much a column narrows the set. `status` with 3 values is low-selectivity; `user_id` among 1M users is high. A high-selectivity leading column shrinks the candidate set fastest. An index on a column with almost no variation (a boolean, a `status` with 2 values) is often useless — the DB may scan anyway.

## `EXPLAIN` — reading the query plan

```php
DB::select('EXPLAIN ' . User::where('status', 'paid')->toSql());
```

| Column | What it tells you |
|---|---|
| `type` | `ALL` = full scan (bad) · `ref`/`range` = index used (good) |
| `key` | Which index was chosen (or `NULL` — none) |
| `rows` | Rows the DB examined — the number to shrink |
| `possible_keys` | Indexes the optimizer considered |

The loop: **run EXPLAIN → see `ALL`/`rows` → add the matching index → re-run EXPLAIN → confirm `ref`/`range` and fewer rows.** Measure, index, verify.

## Interview questions

**Q1. What is an index, and why does it matter?**
> A precomputed lookup structure that lets the database find rows without scanning the whole table — like the index of a book. Without one, a `WHERE` on a big table scans every row; with one, the DB jumps straight to the matches. Writes pay a small maintenance cost; reads get orders-of-magnitude faster.

**Q2. What's a composite index, and when do you need one?**
> One index over multiple columns — `(user_id, status)` — for queries filtering on both. Two single-column indexes can't serve `WHERE user_id = ? AND status = ?` as well as the composite. The left-to-right order matters: the leading column must be present in the query for the index to apply.

**Q3. What is selectivity?**
> How much a column narrows the candidate set. A high-selectivity column (unique-ish values) as the composite's leading column shrinks the search fastest; a low-selectivity column (a 2-value status) filters little. Indexing low-selectivity columns alone is often a waste — the DB may scan anyway.

**Q4. What's a covering index?**
> An index that contains every column the query needs — so the DB answers from the index alone, without reading the table. `SELECT user_id, status ... WHERE user_id = ?` is served entirely by the `(user_id, status)` index. The ultimate read optimization, paid for in index size.

**Q5. How do you use `EXPLAIN` to fix a slow query?**
> Run `EXPLAIN` on the query and read `type` and `rows`: `ALL` means a full scan — add an index on the filter columns; `ref`/`range` means an index is used. Re-run after adding it and confirm `rows` dropped. That's the whole loop: measure, index, verify.

**Senior follow-up: Index everything that's slow?**
> No — index what the *queries* need. Measure with `EXPLAIN` first; a missing index shows up as `ALL` on a hot path. And count the cost: each index slows writes and eats storage, so unused indexes are dead weight. The senior answer is: index to match measured queries, keep them few, and verify with `EXPLAIN`.

## Common mistakes

❌ Adding an index without `EXPLAIN` — guessing instead of measuring.

❌ Two single-column indexes where a composite belongs — the DB uses one, the other is dead weight.

❌ Leading the composite with a low-selectivity column — `(status, user_id)` when `user_id` should lead.

❌ Indexing write-heavy, never-read columns — the write cost with no read payoff.

## Quick revision notes

- Index = **precomputed lookup** — reads fast, writes slightly slower
- Types: **primary** (identity) · **unique** (enforce + index) · **composite** (multi-column) · **covering** (no table read)
- Composite order: **left to right**, most selective first
- `EXPLAIN`: `ALL` = scan (index it) · `ref`/`range` = indexed · `rows` = the number to shrink
- Loop: **measure → index → re-run EXPLAIN**

## Check your understanding

1. What exactly does an index buy you, and what does it cost?
2. When is a composite index right, and what order should it be in?
3. What is selectivity, and why does it decide the leading column?
4. What's a covering index, and when is it worth the size?
5. How do you prove an index fixed a query?
