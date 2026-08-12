# Topic 47 — Pagination

**Checklist anchor:** `paginate()` · `simplePaginate()` · `cursorPaginate()` · the difference · why cursor wins for very large datasets

**Owning lesson:** [118 Query Optimization & the Query Builder](../118-query-optimization.md)

---

## The one-sentence answer

**Pagination splits a large result set into bounded pages — and `cursorPaginate()` scales where `paginate()` degrades, because it pages by a key instead of an offset.**

## The mental model

An API never returns a million rows. It returns **a page**:

```php
$users = User::paginate(50);       // page 1 of 50
// response: items (50), current_page, last_page, total, per_page, links
```

The three flavours differ in what they count and how they find the next page:

| | `paginate(50)` | `simplePaginate(50)` | `cursorPaginate(50)` |
|---|---|---|---|
| Next page via | `?page=2` (offset) | `?page=2` | `?cursor=eyJpZCI6…` (key) |
| Counts total? | Yes (COUNT query) | No | No |
| Deep-page cost | `OFFSET` gets slower | `OFFSET` gets slower | Flat — keyset |
| Best for | Classic UI with page numbers | Prev/next only | Huge, fast-changing sets |
| Extra | `links()`, page numbers | `onEachSide()` still works | No total, stable under writes |

## How it works

```php
// classic — totals, page numbers, a COUNT query
$users = User::paginate(50);
// ?page=1, ?page=2 — SQL: limit 50 offset 0, limit 50 offset 50 …

// simpler — prev/next only, no COUNT
$users = User::simplePaginate(50);

// keyset — stable and fast at any depth
$users = User::cursorPaginate(50);
// SQL: where (id > last_seen_id) order by id limit 50
```

### Why `OFFSET` degrades

`paginate()` on page 1000 issues `LIMIT 50 OFFSET 49950` — the DB must **scan and discard 49,950 rows** to return 50. The cost grows linearly with page depth.

### Why `cursorPaginate` doesn't

```sql
-- cursor pagination: remember where you were, continue from there
SELECT * FROM users WHERE id > 42 ORDER BY id LIMIT 50;
-- the DB jumps straight to the key — no scanning, no offset
```

The cursor is an opaque, signed token encoding the last row's position. Deep pages cost the same as the first, and concurrent inserts/deletes don't shift the page boundaries — a stable snapshot per request.

## The plain-JS model (what the exercise does)

```js
// offset pagination:
function offsetPage(rows, page, perPage) {
  return rows.slice((page - 1) * perPage, page * perPage); // must scan to the offset
}

// cursor (keyset) pagination:
function cursorPage(rows, afterId, perPage) {
  const start = rows.findIndex((r) => r.id > afterId);      // jump to the key
  return rows.slice(start, start + perPage);
}
```

## Interview questions

**Q1. `paginate`, `simplePaginate`, `cursorPaginate` — what's the difference?**
> `paginate` returns page numbers and a total (it runs a COUNT query) and pages via `OFFSET`. `simplePaginate` drops the total — just prev/next — cheaper. `cursorPaginate` drops `OFFSET` entirely: it pages by a key ("give me the next 50 after this cursor"), which stays fast and stable no matter how deep the page.

**Q2. Why can cursor pagination perform better for very large datasets?**
> Because `OFFSET` forces the DB to scan and discard all the rows before the page — page 1000 of 50 means scanning 49,950 rows. Cursor pagination uses a key (`WHERE id > ?`), so the DB jumps straight to the position and returns 50. Deep pages cost the same as the first — and the cursor also survives concurrent inserts, which can shift offset pages.

**Q3. When do you NOT use `cursorPaginate`?**
> When you need a total and page numbers — a UI with `« 1 2 3 … 20 »`. Cursor pagination has no total (by design — counting is expensive at scale). Classic `paginate` is the right tool for numbered UIs; cursor wins for infinite scroll, "load more," and API lists on huge tables.

**Q4. What's the COUNT query cost?**
> `paginate` runs `SELECT COUNT(*)` to know the total — cheap on small tables, expensive on a 50-million-row one. That's why `simplePaginate` and `cursorPaginate` skip it: for "load more" UX nobody needs the total, and skipping the count is the point.

**Q5. How do you paginate in an API?**
> `Model::paginate()` returns `items`, `current_page`, `last_page`, `total`, `links` — or `cursorPaginate` returns `data` + `next_cursor`. Which you pick depends on scale: numbered pages → `paginate`; infinite scroll on big data → `cursorPaginate`. The API contract carries the pagination meta so the client can render the right control.

**Senior follow-up: When would you build custom pagination?**
> When the default doesn't fit — paginating across multiple tables or a search index, or when the cursor needs multiple columns (`WHERE (created_at, id) > (?, ?)`). Laravel's `cursorPaginate` handles a single-column cursor; composite cursors need a custom keyset query. It's a senior answer to show you know *why* the default works and where it ends.

## Common mistakes

❌ `paginate()` on a huge table for infinite scroll — the COUNT query and OFFSET both cost at scale.

❌ Using `cursorPaginate` where the UI needs page numbers — no total, no numbered links.

❌ Confusing the two: `cursorPaginate` is not "cursor() + paginate()" — it's a distinct keyset paginator.

❌ Returning unbounded lists at all — "no pagination" is the actual bug the checklist wants you to name.

## Quick revision notes

- `paginate` = **numbers + total** (COUNT + OFFSET) · `simplePaginate` = prev/next (OFFSET) · `cursorPaginate` = keyset (no COUNT, no OFFSET)
- **OFFSET degrades** at depth (scan + discard) · **cursor jumps** to the key
- Cursor = **stable under writes**, no total by design
- Pick by UI: numbered → `paginate` · infinite scroll/huge → `cursorPaginate`
- "Returning 1M records" — **paginate or stream**, never unbounded (Lesson 12/46)

## Check your understanding

1. What does `paginate()` pay for that `simplePaginate()` doesn't?
2. Why does page 1000 of 50 cost so much with OFFSET?
3. How does a keyset cursor avoid the deep-page cost?
4. When would you NOT use `cursorPaginate`?
5. Which paginator for an infinite-scroll feed on a 50M-row table?
