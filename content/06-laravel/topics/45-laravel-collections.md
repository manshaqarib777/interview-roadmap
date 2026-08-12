# Topic 45 — Laravel Collections

**Checklist anchor:** `map` · `filter` · `reduce` · `each` · `pluck` · `groupBy` · `keyBy` · `sortBy` · `unique` · `flatten` · `flatMap` · `first` · `contains` · `where` · Collection vs Query Builder

**Owning lesson:** [118 Query Optimization & the Query Builder](../118-query-optimization.md)

---

## The one-sentence answer

**A collection is a fluent, chainable wrapper around an array of items — a mini-toolkit of `map`, `filter`, `reduce`, and friends that makes array work read like a pipeline.**

## The mental model

A collection is **an array with superpowers**. Every method returns a new collection, so you chain:

```php
collect($users)
    ->filter(fn ($u) => $u['active'])           // keep active
    ->map(fn ($u) => $u['name'])                // just names
    ->sort()                                    // order
    ->values();                                 // re-key after filter
```

Compare the imperative version — loops, temp arrays, off-by-one bugs — with the chain: each step is a line, and the whole pipeline reads top to bottom. Eloquent's `->get()` returns a collection, so this toolkit applies to every query result.

## The methods that matter

```php
collect($items)
    ->map(fn ($i) => $i * 2)          // transform each item
    ->filter(fn ($i) => $i > 3)       // keep items where truthy
    ->reduce(fn ($carry, $i) => $carry + $i, 0) // fold to one value
    ->each(fn ($i) => ...)            // side effect per item (no new collection)

collect($users)->pluck('email');      // one column, as a list
collect($orders)->groupBy('status');  // { pending: [...], paid: [...] }
collect($users)->keyBy('id');         // keyed by column value
collect($users)->sortBy('name');      // sorted (stable)
collect($items)->unique();            // dedupe
collect($nested)->flatten();          // one level deep → flat
collect($groups)->flatMap(fn ($g) => $g['items']); // map then flatten
collect($users)->first(fn ($u) => $u['id'] === 7); // first match
collect($users)->contains('admin', true);          // any match?
collect($users)->where('status', 'active');        // filter shorthand
```

### Collection vs Query Builder — the key distinction

| | Query Builder (DB) | Collection (PHP) |
|---|---|---|
| Where it runs | **In the database** | **In PHP memory** |
| Filtering | `where('status', 'active')` → SQL | `->where('status', 'active')` → PHP loop |
| Cost | The DB does the work | You've already fetched the rows |
| The rule | **Filter in the DB first** | Then shape in PHP |

The senior rule: **never fetch rows to filter them in PHP.** `User::where('status', 'active')->get()` filters in SQL; `User::all()->where('status', 'active')` fetches everything and filters in memory. The first is the right shape — the second is how a million-row table ends up in RAM (Lesson 46).

## Interview questions

**Q1. What is a collection?**
> A fluent wrapper around an array. Methods like `map`, `filter`, `reduce`, `pluck`, `groupBy` return new collections, so you chain operations as a pipeline instead of writing loops and temp arrays. Eloquent returns collections, so the toolkit applies to every query result.

**Q2. `map` vs `filter` vs `each`?**
> `map` transforms every item and returns the transformed collection (same count). `filter` keeps items where the callback is truthy (fewer or equal). `each` runs a side effect per item and returns the original collection unchanged — use it for logging or touching, not transforming.

**Q3. `pluck` vs `groupBy`?**
> `pluck('email')` pulls one column into a flat list. `groupBy('status')` buckets items by a key — `{ pending: [...], paid: [...] }`. Pluck extracts; groupBy reorganizes.

**Q4. Collection vs Query Builder — when do you filter where?**
> Filter in the database whenever possible — `where()` in the query builder compiles to SQL and only fetches matches. Use collection methods for shaping what's already fetched: transforming, grouping, sorting. The rule: push filtering down to SQL; use PHP for presentation.

**Q5. What's `flatMap`?**
> `map` followed by `flatten` in one step — each callback returns an array, and the results are concatenated into one flat collection. Great for "give me all the items from all these groups."

**Senior follow-up: When does a collection become a performance problem?**
> When you use it to *filter* data that should have been filtered in SQL — fetching 100k rows to keep 50 in PHP. Collections are cheap in PHP; the cost is the rows you fetched to feed them. Filter in the DB, then shape in the collection, and watch the query log to confirm you're not hydrating more than you use.

## Common mistakes

❌ `Model::all()->where(...)` — filtering in PHP what SQL should have filtered (Lesson 12).

❌ Forgetting methods return new collections — mutating the result of `map` without assigning it does nothing.

❌ Using `each` to transform — `each` is for side effects; `map` is for transforms.

❌ Re-keying surprises — `filter` preserves keys; `values()` re-indexes when you need a plain list.

## Quick revision notes

- Collection = **fluent array toolkit** — map, filter, reduce, each, pluck, groupBy, keyBy, sortBy, unique, flatten, flatMap, first, contains, where
- Every method returns a **new collection** → chainable pipeline
- Eloquent `->get()` returns a **collection**
- **Filter in SQL, shape in PHP** — never fetch to filter
- `each` = side effects · `map` = transform · `filter` = keep truthy

## Check your understanding

1. What makes a collection different from a plain array?
2. `map` vs `filter` vs `each` — same count or different?
3. When should a `where` live in the query builder instead of the collection?
4. What does `flatMap` do that `map` alone doesn't?
5. How do you re-key a filtered collection into a plain list?
