# Topic 14 — Database & Migrations

**Checklist anchor:** migrations · schema builder · foreign keys · indexes · unique · composite · soft deletes · timestamps · transactions · seeders · factories · migrate commands

**Owning lesson:** [119 Migrations, Schema & Seeders](../119-migrations.md)

---

## The one-sentence answer

**Migrations are version control for your database schema — each one is a reversible change, applied in order, so the schema evolves with the code.**

## The mental model

Think of migrations as **git for the database**. Each migration file is a commit:

```text
2024_01_01_000000_create_users_table.php
2024_01_02_000000_add_role_to_users_table.php
2024_01_03_000000_create_orders_table.php
```

`php artisan migrate` replays them **in order** (tracked in the `migrations` table). `php artisan migrate:rollback` undoes the last batch. Every environment — your laptop, CI, production — ends up with the same schema by replaying the same files.

## How it works

### Anatomy of a migration

```php
// database/migrations/xxxx_create_orders_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->unsignedInteger('total_cents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

`up()` is the change; `down()` is the undo. Both must exist — that's what makes migrations reversible.

### The schema builder essentials

```php
$table->id();                        // bigint unsigned auto-increment PK
$table->foreignId('user_id')->constrained(); // FK + index, references users.id
$table->string('email')->unique();   // string + unique index
$table->index(['user_id', 'status']); // composite index
$table->timestamps();                // created_at + updated_at
$table->softDeletes();               // deleted_at — soft deletes
```

### Indexes

```php
$table->index('status');                      // plain index
$table->unique('email');                      // unique index
$table->index(['user_id', 'status']);         // composite — WHERE user_id = ? AND status = ?
```

Indexes make lookups fast (Lesson 63): a `WHERE user_id = ? AND status = ?` wants a composite `(user_id, status)` index, not two separate ones.

### Soft deletes

```php
use SoftDeletes;      // on the model

Model::withTrashed()->get();   // include deleted
Model::onlyTrashed()->get();   // only deleted
$model->restore();             // un-delete
$model->forceDelete();         // permanently remove
```

Rows get `deleted_at` set instead of being removed — history preserved, queries scoped to non-deleted by default.

### The migrate commands

| Command | What it does | Risk |
|---|---|---|
| `migrate` | Run pending migrations | None (safe) |
| `migrate:rollback` | Undo the last batch (`down()`) | Reversible |
| `migrate:refresh` | Rollback all, re-migrate | Data loss |
| `migrate:fresh` | Drop all tables, re-migrate | **Data loss — dev only** |

### Seeders & factories

```php
php artisan db:seed                      // run DatabaseSeeder
php artisan db:seed --class=UserSeeder   // run one seeder

User::factory()->count(10)->create();    // factories → test/dev data
```

Seeders populate data (dev/test); factories generate it on demand (Lesson 42–43).

## Interview questions

**Q1. What are migrations?**
> Version control for the schema. Each file is a reversible change — `up()` applies it, `down()` undoes it — and `php artisan migrate` replays them in order across every environment. The `migrations` table tracks what's been applied.

**Q2. What does `migrate:fresh` do, and why is it dangerous?**
> It drops every table and re-runs all migrations — a clean rebuild. Dangerous because it destroys data: it's for development (and resetting demo/test databases), never production. Production moves forward with `migrate` and `rollback`.

**Q3. Foreign keys and indexes — what's the difference?**
> A foreign key enforces referential integrity — `user_id` must exist in `users` (and defines what happens on delete: `cascade`, `restrict`, `set null`). An index makes lookups fast. `foreignId()->constrained()` creates both: the FK constraint and the index on the column.

**Q4. What are soft deletes, and when would you use them?**
> Setting `deleted_at` instead of deleting the row. Queries exclude trashed rows by default; `withTrashed`/`onlyTrashed`/`restore`/`forceDelete` control the rest. Use them when you need an audit trail or recoverable deletes — orders, users — but beware: every query now filters on `deleted_at`, so indexes matter and storage grows.

**Q5. How do you handle a schema change in production?**
> Write a new migration (never edit an applied one), `php artisan migrate` on deploy after the code ships, and keep the migration non-destructive — add nullable columns or backfill data rather than dropping things. Large tables get `--pretend` checks and possibly a maintenance window.

**Senior follow-up: What's the difference between a seeder and a factory?**
> A seeder runs once to put specific data in — dev fixtures, reference data, a default admin. A factory generates throwaway data on demand — `User::factory()->count(50)->create()` — used by tests and dev seeding. Seeders are the "what data exists"; factories are the "generate me data".

## Common mistakes

❌ Editing an applied migration — the change never reaches environments that already ran it; write a new one.

❌ `migrate:fresh` on production — data loss.

❌ Dropping columns/tables without a reversible `down()` — the migration can't roll back.

❌ Adding indexes without considering composite needs — two single-column indexes don't cover `WHERE user_id = ? AND status = ?`.

## Quick revision notes

- Migrations = **schema version control** — `up()`/`down()`, replayed in order
- `foreignId()->constrained()` = FK + index · `unique()` · `index([a, b])` composite
- **Soft deletes** = `deleted_at` + `SoftDeletes` + `withTrashed`/`onlyTrashed`/`restore`/`forceDelete`
- Commands: `migrate` (safe) → `rollback` → `refresh` → `fresh` (**dev only**)
- **Factories** generate data on demand; **seeders** plant specific data

## Check your understanding

1. What does the `migrations` table track, and why does order matter?
2. When would a composite index beat two single-column indexes?
3. What does soft deletes cost you, and when is it worth it?
4. Which migrate command is safe in production, and which is never?
5. Seeder vs factory — when is each the right tool?
