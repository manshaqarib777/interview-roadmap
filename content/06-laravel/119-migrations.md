# Lesson 119 — Migrations, Schema & Seeders

**Interview importance:** ⭐⭐ — not the flashiest topic, but every "how does your team ship a schema change?" answer runs through it.

Lesson 115 built your first models. Lesson 118 told you which indexes a slow query needs.
This lesson is the *plumbing* that makes both real: the schema — columns, keys, soft
deletes — is written as code, applied with the `migrate` command family, and filled with
test data using factories and seeders.

The why-line: **schema as code**. Your database structure gets a version history, it can be
reviewed in a pull request, and a fresh machine or CI database is rebuilt with one command.
If you've ever deployed a schema change by running SQL by hand on a production server,
you're about to see why nobody does that twice.

## Learning Objectives

By the end of this lesson you should be able to:

- Read and write a migration: `up()` for the change, `down()` for the rollback
- Add columns, foreign keys and indexes — including composite and unique — with the schema builder
- Say what each of `migrate`, `migrate:fresh`, `migrate:refresh` and `migrate:rollback` does, and which are safe in production
- Explain soft deletes, `deleted_at`, and what `onlyTrashed()` does
- Write a factory with states and relationships, and a seeder that fills a database
- Design the seed vs factory split: sample data you control vs volume you simulate

## 1. One-Line Definition

**Migrations are version-controlled schema changes — every table, column and index in your
database is created, altered and rolled back by code, and seeders and factories put data
into the schema that code created.**

## 2. Mental Model

Think of the schema as **a Git history for the database**. Each migration file is one
commit: it knows how to apply the change (`up()`) and how to undo it (`down()`). Laravel
tracks which commits have been applied in the `migrations` table — so "apply the new
ones" is just `php artisan migrate`, and "go back one" is `migrate:rollback`.

A migration file is a recipe with two directions:

```text
up():    CREATE TABLE orders ...        down():  DROP TABLE orders
up():    ADD INDEX (user_id, status)    down():  DROP INDEX
up():    ADD COLUMN phone               down():  DROP COLUMN phone
```

## 3. Visual Flow

```text
YOUR TEAM's WORKFLOW:
  you write a migration + factory + seeder
      └─▶ code review in the PR            -- schema changes get reviewed like code
      └─▶ php artisan migrate on staging   -- applied in order, tracked in migrations table
      └─▶ php artisan migrate on prod      -- same commands, same order
      └─▶ rollback needs: migrate:rollback -- undoes only the last batch

THE migrate COMMAND FAMILY:
  migrate            apply pending migrations        ✅ safe anywhere
  migrate:fresh      drop ALL tables, re-run every migration   ⚠️ local/CI only
  migrate:refresh    rollback all, then migrate again          ⚠️ local/CI only
  migrate:rollback   undo the last batch of migrations         ⚠️ careful on prod
  migrate:status     show which migrations have run            ✅ safe anywhere
```

## 4. How It Works

### Anatomy of a migration

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->unsignedInteger('quantity');
            $table->decimal('total', 10, 2);
            $table->timestamps();

            $table->index(['user_id', 'status']);       // the L118 composite index
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

```text
-- what up() produces (MySQL, simplified):
CREATE TABLE orders (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  status      VARCHAR(255) NOT NULL DEFAULT 'pending',
  quantity    INT UNSIGNED NOT NULL,
  total       DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id)
              REFERENCES users (id) ON DELETE CASCADE,
  INDEX orders_user_id_status_index (user_id, status)
);
```

```narrate
2: up() is "what this migration does" — the recipe forward
3-8: the schema builder turns each method call into a column definition
5: foreignId()->constrained() creates the column AND the foreign key referencing users(id)
9: index(['user_id','status']) is the composite index from Lesson 118, written as code
12-14: down() is the mirror — drop the table, the exact inverse of up()
```

> [!NOTE]
> `down()` must be the *exact inverse* of `up()`: every `create` has a `dropIfExists`,
> every `addColumn` has a `dropColumn`. If `down()` is wrong or missing, rollback is the
> first thing that breaks in an emergency.

### The schema builder's most-used column types

| Method | Column |
|---|---|
| `$table->id()` | `BIGINT` auto-increment primary key |
| `$table->foreignId('user_id')` | unsigned bigint, ready for a foreign key |
| `$table->string('name', 100)` | `VARCHAR(100)` |
| `$table->text('body')` | `TEXT` |
| `$table->unsignedInteger('qty')` | `INT UNSIGNED` |
| `$table->decimal('total', 10, 2)` | `DECIMAL(10,2)` — never float for money |
| `$table->boolean('active')->default(true)` | `TINYINT(1)` with a default |
| `$table->timestamp('paid_at')->nullable()` | `TIMESTAMP NULL` |
| `$table->timestamps()` | `created_at` + `updated_at` |
| `$table->softDeletes()` | `deleted_at` — the soft-delete marker |
| `$table->unique(['email'])` | `UNIQUE` index |
| `$table->index(['user_id', 'status'])` | composite `INDEX` |

> [!TIP]
> `foreignId('user_id')->constrained()` names the key from the column name — `users(id)` —
> and adds the `ON DELETE` behaviour. Pass the table name explicitly when it's not the
> plural of the column: `->constrained('members')`.

## 5. Real Project Usage

### The migrate command family — what each does and when it's safe

| Command | What it does | Safe in production? |
|---|---|---|
| `migrate` | runs pending migrations, in order, as one batch | ✅ — the normal deploy step |
| `migrate:status` | shows applied vs pending | ✅ |
| `migrate:rollback` | undoes the **last batch** of migrations | ⚠️ only the newest batch, only if `down()` is sound |
| `migrate:refresh` | rollback all, then migrate again | ❌ — drops and recreates your schema |
| `migrate:fresh` | drop **all** tables, then migrate | ❌ — local/CI/test only |
| `migrate:fresh --seed` | fresh, then run the seeders | ❌ — the local "reset to demo" command |

> [!PITFALL]
> `migrate:fresh` runs `DROP TABLE` on everything — including data you didn't mean to lose.
> That's why it belongs in local dev and CI only. In production, the answer to "I need to
> redo a schema" is a *new* migration that fixes forward, never a fresh.

### Soft deletes — `deleted_at`

Soft deletes keep the row, marking it deleted with a timestamp. The `SoftDeletes` trait
makes Eloquent filter out marked rows automatically.

```php
// migration
$table->softDeletes();           // adds deleted_at TIMESTAMP NULL

// model
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;
}
```

```text
Post::all()               →  SELECT * FROM posts WHERE deleted_at IS NULL
Post::withTrashed()->get()  →  SELECT * FROM posts                 (no filter)
Post::onlyTrashed()->get()  →  SELECT * FROM posts WHERE deleted_at IS NOT NULL
$post->restore()          →  UPDATE posts SET deleted_at = NULL WHERE id = ?
$post->forceDelete()      →  DELETE FROM posts WHERE id = ?        (hard delete)
```

```narrate
1-4: the trait makes every Eloquent query append the deleted_at IS NULL filter automatically
3: withTrashed() is how an admin UI shows "recently deleted" items
5: restore() is the entire reason soft deletes exist — undelete without a backup
```

Soft deletes are for *"can the user change their mind?"* data — a deleted post that can be
restored from the trash, an account you can recover. Audit/log data, or anything legally
required to disappear, is hard-deleted or anonymised instead. And note: the `deleted_at`
filter means your indexes should include it when you query both live and trashed rows.

## 6. Interview Explanation

> Migrations are how I version the schema: every table, column and index lives in a file
> with an `up()` and a `down()`, and Laravel tracks what's been applied in a `migrations`
> table. `php artisan migrate` applies the pending ones in order — that's the deploy step.
> `rollback` undoes the last batch; `fresh` and `refresh` drop the schema and are strictly
> for local and CI. I write the composite index the query actually needs right in the
> migration, I use soft deletes when the user should be able to change their mind, and I
> fill dev databases with factories and seeders — factories for realistic volume, seeders
> for the canonical rows every environment must have, like an admin user or a settings row.

## 7. Senior-Level Insights

- **Schema as code means schema as reviewable diff.** The question "what changed in the
  database this week?" has a one-command answer: `git log` on the migrations directory.
  That's the entire argument for migrations over hand-run SQL.
- **Migrations are forward-only on production.** You *never* roll back a shipped migration
  to fix it — you write a new one. The `down()` matters most on local and staging, where
  `migrate:refresh` keeps the dev loop clean.
- **Migrations run in one batch per deploy.** Everything in a batch either applies fully or
  not at all (each migration runs inside a transaction where the driver supports it). So the
  risk of a "half-deployed schema" is exactly one deploy wide.
- **Factories are for volume, seeders are for truth.** A factory produces realistic random
  rows by the thousand; a seeder guarantees *specific* rows exist — an admin account, a
  default plan, a settings record. If you need "the user who owns the demo project", that's
  a seeder. If you need 10,000 users to make an index matter, that's a factory.
- **State and relationships are the power of factories.** A factory can say
  `->state(fn () => ['role' => 'admin'])` or attach related models with `for()`/`has()` —
  so one `User::factory()` covers a dozen scenarios without a dozen factories.
- **`deleted_at` is a filter you must index.** Once a table has soft deletes, the common
  query is `WHERE deleted_at IS NULL AND …` — include `deleted_at` in the composite index if
  that predicate matters (Lesson 118's index rules apply to it like any column).

## 8. Common Mistakes

- **A `down()` that doesn't invert `up()`.** Creating a table but `dropping` a column, or
  dropping the wrong table name — rollback breaks exactly when you need it most.
- **`migrate:fresh` on a shared or production database.** It's `DROP TABLE` on everything.
  The command exists for local and CI; treating it as "restart the database" on prod is how
  you lose a day of data.
- **Running raw SQL by hand instead of writing a migration.** It works once, leaves no
  record, and nobody on the team can reproduce it — the schema and the code diverge forever.
- **An index per column instead of one composite.** Three single-column indexes for a query
  that filters on three columns — MySQL may use one, and it's three times the write cost.
  Lesson 118: one composite, leftmost-first.
- **`string` for columns that should be something else.** A phone number or a status as
  `string()` is fine; a price as `float` or a quantity as `string` is a correctness bug.
  Money is `decimal`, counts are unsigned integers.
- **Seeding the same canonical row twice.** Running a seeder twice that uses
  `create()` instead of `firstOrCreate()`/`updateOrCreate()` duplicates the admin user on
  every `--seed`.
- **Forgetting to run `migrate` in the deploy.** Code that references a column that doesn't
  exist yet is a 500 in production. Migrate-before-deploy is part of the release pipeline,
  not an afterthought.

## 9. Best Practices

✅ One migration per logical change — reviewable like a commit

✅ `up()` and `down()` as exact mirrors; run `migrate:rollback` locally before you trust it

✅ Foreign keys with `constrained()` and the `ON DELETE` behaviour named explicitly

✅ Money as `decimal`, counts as unsigned integers, booleans for flags

✅ Soft deletes only where "change your mind" is a real user story; index `deleted_at`

✅ Factories for volume, seeders for canonical rows — never the reverse

✅ `firstOrCreate()`/`updateOrCreate()` for seeders you run more than once

✅ Run `migrate --seed` on a fresh clone and verify the app boots — that's your "does it build" for data

❌ Don't `migrate:fresh`/`refresh` on anything shared — they are drop-and-rebuild commands

❌ Don't ship a schema change without a migration — the schema is code too

## 10. Interview Questions

**Q1. What is a migration and why do you need one?**

> A migration is a version-controlled schema change: a file with an `up()` that applies a
> change and a `down()` that reverses it. Laravel tracks applied migrations in the
> `migrations` table, so the database can be rebuilt, reviewed and rolled back like code.
> Without migrations, schema changes are undocumented SQL someone ran by hand once — the
> team can never reproduce them.

**Q2. `migrate`, `migrate:fresh`, `migrate:refresh`, `migrate:rollback` — explain each.**

> `migrate` runs the pending migrations in order — that's the normal deploy step, safe
> anywhere. `migrate:rollback` undoes the last batch, so it's safe only when you're sure the
> `down()` methods are sound and you only want to step back one batch. `migrate:refresh`
> rolls everything back and re-runs it, and `migrate:fresh` drops every table first — both
> are local and CI commands. In production the answer to a bad schema is always a new
> migration, never a fresh.

**Q3. What's the difference between a factory and a seeder?**

> A factory generates fake records in volume — `User::factory()->count(100)->create()`
> gives you 100 realistic users to work against. A seeder guarantees specific canonical rows
> exist: the admin user, a default plan, settings. Factories create volume to make queries
> and indexes meaningful; seeders create truth that every environment must have.

**Q4. How do you model a relationship in a factory?**

> With the relationship helpers: `for()` sets the parent on a belongs-to, `has()` creates
> the children. A post factory can say
> `Post::factory()->for(User::factory()->state(['role' => 'admin']))->count(5)` or simply
> `User::factory()->hasPosts(10)->create()` — one call creates the user *and* ten posts with
> the right foreign keys.

**Q5. What are soft deletes and when do you use them?**

> Soft deletes set a `deleted_at` timestamp instead of removing the row, and the
> `SoftDeletes` trait makes Eloquent filter it out automatically — with `withTrashed()`,
> `onlyTrashed()` and `restore()` to work with the marked rows. I use them when the user can
> change their mind: a recoverable account, a trash folder. When data must actually
> disappear — legal requirements, audit logs — I hard-delete or anonymise instead.

**Senior follow-up: walk through your production deploy with a schema change.**

> The migration goes in the PR like any code and gets reviewed — the reviewer checks the
> index matches the query and the `down()` is a real inverse. In the deploy, migrations run
> before the new code serves traffic, so no request ever touches a column that doesn't exist
> yet. I use `migrate` for the deploy, never `fresh`; if a migration is wrong after it
> shipped, I write a fix-forward migration. On a big table, the migration needs care — MySQL
> 8+ can add an index in place, but adding a column with a default can still lock a huge
> table, so that's when a zero-downtime tool or a maintenance window earns its keep.

## 11. Follow-up Questions

**What does `migrate:status` show you?**

> A table of every migration file with a `Ran?` column — which ones are applied and which
> are pending. It's the first thing I run when "I migrated but my schema didn't change."

**How do you change a column type in a migration?**

> `Schema::table('orders', fn (Blueprint $table) => $table->string('status', 20)->change())`.
> The `change()` method marks the column for alteration — but on MySQL it can require the
> doctrine/dbal package, and on a large table it may lock. Add the column with a new name and
> a data migration instead, when the table is big.

**Why does a migration sometimes fail partway on MySQL?**

> MySQL can't always run DDL inside a transaction the way Postgres can, so each statement
> autocommits — a failure mid-migration can leave some statements applied. That's why
> `migrate:rollback` exists and why a migration should be one coherent change: the smaller
> the batch, the easier it is to recover.

## 12. Comparison Table

| | Factory | Seeder |
|---|---|---|
| Purpose | generate volume | guarantee canonical rows |
| Data | random, realistic | specific, hand-picked |
| Volume | `count(1000)` | a handful |
| Re-runnable | always | needs `firstOrCreate`/`updateOrCreate` |
| Typical use | dev, tests, perf work | admin user, defaults, demo project |
| Runs via | `User::factory()` | `php artisan db:seed` / `--seed` |

## 13. Code Example

A factory with states and relationships, plus the seeder that uses it:

```php
// database/factories/UserFactory.php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'     => fake()->name(),
            'email'    => fake()->unique()->safeEmail(),
            'password' => bcrypt('password'),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => ['role' => 'admin']);
    }
}

// database/seeders/DatabaseSeeder.php
public function run(): void
{
    // canonical rows — must exist everywhere
    User::factory()->admin()->create([
        'email' => 'admin@example.com',
    ]);

    // volume — 10 users, each with 3 orders, each with a payment
    User::factory()
        ->count(10)
        ->has(
            Order::factory()
                ->count(3)
                ->has(Payment::factory()->count(1), 'payment')
        )
        ->create();
}
```

```text
php artisan migrate:fresh --seed   (local/CI only)

  Dropped all tables successfully.
  Migration table created successfully.
  Migrating: 2014_10_12_000000_create_users_table ......... DONE
  Migrating: 2024_01_15_120000_create_orders_table ........ DONE
  Migrating: 2024_01_15_130000_create_payments_table ...... DONE
  Seeding: DatabaseSeeder
    User #1  admin@example.com  (role: admin)
    User #2  jane@example.com   (10 users created, each with 3 orders)
    ...orders and payments created through the factory relationships
  Database seeded successfully.
```

```narrate
1-10: the factory definition — one set of realistic defaults reused by every generated user
12: admin() is a state: same factory, one attribute overridden
17-20: the canonical row every environment must have — note firstOrCreate in real seeders
24-31: the volume: has() makes the factory create related models through the relationship
35: migrate:fresh --seed is the local "reset to a working demo" command — never production
```

> [!DEEPDIVE]
> The `has()`/`for()` helpers write the foreign keys for you because the factory knows the
> relationship. `User::factory()->hasPosts(10)` is the factory equivalent of
> `$user->posts()->createMany(...)` — one call creates the parent and the children with
> matching `user_id`s. That's why a "make me a user with orders and payments" scenario is
> one chained factory call instead of a script full of nested loops.

## 14. Performance Notes

- **The schema *is* query performance.** Lesson 118's composite index is written in a
  migration — if the index doesn't exist in the schema, no amount of PHP tuning matters.
- **Column types have a cost.** `text` columns can't be indexed the way `string` can;
  oversized `varchar` wastes index space; `decimal` is exact but heavier than `float`.
  The schema is the first place performance is decided.
- **Soft-delete queries add a predicate.** Every `where deleted_at IS NULL` is only fast
  if the index covers it. Big soft-deleted tables need `deleted_at` in the composite index.
- **Seeder volume is load testing in disguise.** 10,000 factory rows give you a real
  surface to measure indexes and queries against — the same reason `migrate --seed` is part
  of a fresh-clone checklist.
- **DDL locks.** Adding a column or index to a huge production table can lock writes
  (MySQL 5.7-era `ALTER`). That's a deployment concern, not a code concern — but the senior
  answer to "schema change on a big table" is "check the lock behaviour first".
- **When it doesn't matter:** tiny tables, prototypes. One migration per logical change is
  still the rule — but you don't need factory states for a two-table demo.

## 15. Debugging Scenarios

**Scenario 1: "I ran `migrate` and it says 'Nothing to migrate'."**

You're in the wrong directory or the file is newer than the last run but somehow already
tracked. Check `migrate:status` — if the file shows as applied and you didn't run it, the
row exists in the `migrations` table but the file's content changed; that's why you never
edit a shipped migration.

**Scenario 2: "`migrate:fresh` deleted my local data."**

That's what the command does — the name is honest. This is why canonical data lives in
seeders (`--seed` rebuilds it) and why nobody runs `fresh` on a database they care about.
Lesson learned once, typically.

**Scenario 3: "`migrate:rollback` throws an error on a table with a foreign key."**

Your `down()` is trying to drop a column or table that other tables still reference — the
exact case where a mirrored `up()`/`down()` matters. Fix `down()` to drop the foreign key
first (`dropConstrainedForeignId('user_id')` or `dropForeign`), then the column.

**Scenario 4: "The new code works locally but 500s in production: column not found."**

The deploy ran code before `php artisan migrate`. Migrations are a deploy *step*, not a
separate task — run them in the release pipeline before traffic switches, and the column
exists before any request touches it.

## 16. Quick Revision Notes

- Migration = `up()` (apply) + `down()` (invert), tracked in the `migrations` table
- `migrate` = apply pending; `rollback` = undo last batch; `refresh`/`fresh` = drop & rebuild (local/CI)
- `migrate:status` = which migrations have run; `--seed` runs seeders after migrating
- `foreignId()->constrained()` = column + foreign key in one line
- `timestamps()` = `created_at` + `updated_at`; `softDeletes()` = `deleted_at`
- Soft deletes: `withTrashed()`, `onlyTrashed()`, `restore()`, `forceDelete()`
- Factories = volume (`count(10)`, states, `has()`/`for()` relationships)
- Seeders = canonical rows (`firstOrCreate`), run via `db:seed` or `--seed`
- Production schema changes are forward-only — new migration, never a fresh
- The composite index from Lesson 118 lives in the migration — schema is performance

## 17. Cheat Sheet

```text
MIGRATION FILE SHAPE:
  up():   Schema::create('orders', fn (Blueprint $t) => $t->id() ... );
  down(): Schema::dropIfExists('orders');          // the exact mirror

COMMON COLUMNS:
  id / foreignId()->constrained() / string / text / decimal(10,2)
  unsignedInteger / boolean / timestamp()->nullable()
  timestamps() / softDeletes() / unique([...]) / index([...])

COMMANDS:
  php artisan make:migration create_orders_table     -- --table= / --create=
  php artisan migrate            ✅ apply pending (deploy step)
  php artisan migrate:status     ✅ applied vs pending
  php artisan migrate:rollback   ⚠️ undo last batch
  php artisan migrate:refresh    ⚠️ rollback all → migrate (local/CI)
  php artisan migrate:fresh      ⚠️ drop all → migrate (local/CI)
  php artisan db:seed            ✅ run seeders

SOFT DELETES:
  SoftDeletes trait  →  deleted_at IS NULL  auto-appended
  withTrashed() / onlyTrashed() / restore() / forceDelete()

FACTORY vs SEEDER:
  factory = User::factory()->count(100)->admin()->create()
  seeder  = User::factory()->admin()->create(['email' => 'admin@example.com'])
  relation = has(Order::factory()->count(3)) / for($user)
```

## 18. Key Takeaways

> [!RECAP]
> - Migrations version the schema: `up()`/`down()` pairs tracked in the `migrations` table
> - `migrate` is the deploy step; `fresh`/`refresh` are drop-and-rebuild local/CI tools
> - Columns, foreign keys and the Lesson 118 composite index are all written in migrations
> - Soft deletes keep rows and filter with `deleted_at` — restore is the whole point
> - Factories generate volume and relationships; seeders guarantee canonical rows
> - `migrate:fresh --seed` rebuilds a working local database — that's the local loop
> - Production schema fixes are forward-only — write a new migration, never roll back a shipped one

## Check your understanding

Answer these without looking back.

1. Write the `up()` and `down()` for a table called `subscriptions` with `user_id`, a status, and a composite index on `(user_id, status)`.
2. Which migrate commands are safe on a production database, and which are drop-and-rebuild local tools?
3. What query does `Post::onlyTrashed()->get()` generate, and why does that differ from `Post::all()`?
4. A seeder runs twice and creates two admin users — what's the fix, and why?
5. Write a factory call that creates 5 users, each with 2 orders.
6. When is `forceDelete()` the right call instead of a soft delete?
7. Why must `down()` mirror `up()` exactly — what breaks when it doesn't?

## What's Next

**Lesson 120 — Database Transactions & Concurrency.** Your schema is versioned and your data
is seeded — now make the writes safe. Transactions, locking, and the two-users-buy-the-last-item
scenario that separates "knows Laravel" from "can be handed a production shop."