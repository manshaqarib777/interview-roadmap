# Topic 50 — Soft Deletes

**Checklist anchor:** `SoftDeletes` trait · `withTrashed` · `onlyTrashed` · `withoutTrashed` · `restore` · `forceDelete`

**Owning lessons:** [115 Eloquent ORM](../115-eloquent.md) · [119 Migrations, Schema & Seeders](../119-migrations.md)

---

## The one-sentence answer

**Soft deletes don't remove a row — they set `deleted_at`, hide it from normal queries, and let you `restore()` or `forceDelete()` it later.**

## The mental model

```text
DELETE            →  row is GONE (irreversible)
soft delete       →  deleted_at = now()   (row stays, queries hide it)
restore()         →  deleted_at = null    (row is back)
forceDelete()     →  actually DELETE      (the escape hatch)
```

It's a **trash bin for rows** — the row exists, normal queries don't see it, and you can bring it back.

## How it works

### The migration + the trait

```php
// migration:
$table->softDeletes();          // adds deleted_at (nullable timestamp)

// model:
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model
{
    use SoftDeletes;
}
```

### The query methods

```php
User::all();                     // only non-deleted (deleted_at IS NULL, auto-scoped)
User::withTrashed()->get();      // include deleted rows
User::onlyTrashed()->get();      // ONLY deleted rows

$user = User::withTrashed()->find(1);
$user->restore();                // deleted_at = null → visible again
$user->forceDelete();            // real DELETE — gone for good
$user->trashed();                // true if soft-deleted
```

### What's happening under the hood

SoftDeletes adds a **global scope** (Lesson 49) that silently appends `WHERE deleted_at IS NULL` to every query. `withTrashed()` is `withoutGlobalScope(SoftDeletingScope::class)` in disguise; `onlyTrashed()` filters the opposite way. That's why "where did my soft-deleted rows go?" has the same answer as "what did my global scope do?" — invisible constraints.

## When soft deletes make sense

| Use it | Skip it |
|---|---|
| Users/accounts (reactivation, audit) | High-volume logs (bloat, useless) |
| Orders (history, compliance) | Ephemeral data (sessions, caches) |
| Content (recoverable mistakes) | Rows you'll never restore |
| Anything with a legal/audit reason | Where "deleted" must mean gone |

## The costs (the senior part)

1. **Every query filters `deleted_at`** — add the column to indexes; a soft-deleted table with millions of rows and no `deleted_at` index scans.
2. **Uniqueness breaks** — a unique index on `email` blocks re-creating a soft-deleted user's email. The fix: include `deleted_at` in a partial/composite unique index, or a separate tombstone approach.
3. **Relationships** — `whereHas` and eager loading respect the scope, but a soft-deleted parent can still reference children; cascade behaviour needs thought.
4. **Storage grows** — deleted rows still consume space; you need a real purge job for old trashed rows.

## Interview questions

**Q1. What are soft deletes?**
> Instead of `DELETE`, the row's `deleted_at` is set. A global scope hides soft-deleted rows from normal queries. `withTrashed()` includes them, `onlyTrashed()` shows only them, `restore()` clears `deleted_at`, and `forceDelete()` does the real delete. You get recoverable deletes and an audit trail at the cost of every query filtering on `deleted_at`.

**Q2. How does `SoftDeletes` actually work?**
> The trait registers a global scope that appends `WHERE deleted_at IS NULL` to every query. `withTrashed()` removes the scope; `onlyTrashed()` inverts it. That's why soft-deleted rows "disappear" — it's the same mechanism as a hand-written global scope.

**Q3. When would you use soft deletes?**
> When deletion must be recoverable or auditable — user accounts, orders, content. The cost is real (query filtering, index pressure, storage), so I'd skip it for ephemeral or high-volume data where "deleted" means gone.

**Q4. What breaks with soft deletes?**
> Unique constraints — a soft-deleted user still owns the email, so re-registering that email fails. Also: every query pays the `deleted_at` filter, so the column needs indexing on hot paths, and relationships need thought (a soft-deleted parent with live children).

**Q5. How do you purge soft-deleted rows?**
> A scheduled job that `forceDelete()`s rows past a retention window — "delete rows trashed more than 90 days ago." `onlyTrashed()->where('deleted_at', '<', now()->subDays(90))` → `forceDelete()`. Storage stops growing without losing the audit window.

**Senior follow-up: Why is soft-deletes a global-scope question?**
> Because the mechanism *is* a global scope. If an interviewer asks "how would you hide rows by default?", the answer is a global scope; soft deletes are the framework's implementation of that pattern with `restore()`/`forceDelete()` on top. Understanding the scope underneath explains every "why can't I see it?" debugging session.

## Common mistakes

❌ Expecting `User::find($deletedId)` to work — it 404s; use `withTrashed()`.

❌ Unique columns colliding with soft-deleted rows — plan the index or tombstone strategy.

❌ Soft-deleting high-volume data — storage and query costs with no recovery need.

❌ Forgetting `deleted_at` in indexes — every query filters on it.

## Quick revision notes

- Soft delete = **set `deleted_at`, hide it, restore later**
- `withTrashed()` all · `onlyTrashed()` only-deleted · `restore()` undelete · `forceDelete()` real delete
- Mechanism = **a global scope** appending `WHERE deleted_at IS NULL`
- Costs: **query filter, index pressure, unique collisions, storage**
- Purge: scheduled `forceDelete()` past a retention window

## Check your understanding

1. What's the actual mechanism that hides soft-deleted rows?
2. Which query shows only the trashed rows?
3. When is soft deletes the wrong call?
4. Why does a unique email index break with soft deletes?
5. How do you keep storage bounded while keeping the audit window?
