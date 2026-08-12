# Topic 43 — Seeders

**Checklist anchor:** `php artisan db:seed` · development data · test data · production considerations

**Owning lessons:** [119 Migrations, Schema & Seeders](../119-migrations.md) · [129 Testing, Factories & Mocking](../129-testing.md)

---

## The one-sentence answer

**Seeders plant specific data into the database — dev fixtures, reference data, a default admin — run with `php artisan db:seed`.**

## The mental model

Migrations define the **schema**; seeders fill it with **data**. They're the difference between "the table exists" and "the app has something to show."

```text
php artisan migrate   →  schema (empty tables)
php artisan db:seed   →  data (fixtures, reference rows, dev accounts)
```

Seeders run once (or on demand), and they're the home for the data every environment needs to be usable.

## How it works

```php
// database/seeders/DatabaseSeeder.php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,       // reference data: roles, permissions
            UserSeeder::class,       // a default admin account
        ]);
    }
}
```

```bash
php artisan db:seed                    # run DatabaseSeeder
php artisan db:seed --class=RoleSeeder # run one seeder
php artisan migrate:fresh --seed       # rebuild schema AND seed
```

### What belongs in a seeder

| Kind | Example | Where it lives |
|---|---|---|
| **Reference data** | Roles, permissions, countries, plan tiers | Seeder — every environment needs it |
| **Dev fixtures** | A demo user with orders and posts | Seeder or factory |
| **Test data** | Specific rows tests assert against | Factories in tests (Lesson 42/41) |
| **Default accounts** | `admin@example.com` / admin password | Seeder — dev only |

### Seeders vs factories

| | Seeder | Factory |
|---|---|---|
| Purpose | Plant **specific** data once | **Generate** data on demand |
| Data | Fixed, known values | Random/faker-generated |
| Caller | `db:seed` / `$this->call()` | `User::factory()->count(10)->create()` |
| Typical use | Roles, defaults, demos | Test fixtures, bulk dev data |

Seeders can call factories (`User::factory()->count(20)->create()`) — that's the usual way to seed realistic dev data without hand-writing 20 users.

## Interview questions

**Q1. What are seeders?**
> Classes that plant data into the database. `DatabaseSeeder` runs a list of seeders — reference data (roles), defaults (admin account), and dev fixtures. `php artisan db:seed` runs them; `--class=` runs one. They're the "data half" of migrations.

**Q2. Seeder vs factory?**
> A seeder plants specific, known data once — roles, a default admin, reference rows. A factory generates throwaway data on demand — `User::factory()->count(50)->create()` — for tests and bulk dev data. They combine: a seeder can call factories to populate realistic dev data.

**Q3. What belongs in a seeder for production?**
> Only reference/configuration data — roles, permissions, plan tiers — and nothing that looks like real users. Production seeding should be idempotent (`firstOrCreate`, not `create`) so re-running doesn't duplicate, and anything customer-like belongs in factories, not production seeders.

**Q4. What are the production considerations?**
> Never seed fake users into production. Make reference-data seeders idempotent (`updateOrCreate`). Run them as part of a controlled deploy (or migrate step), never blindly. And treat `migrate:fresh --seed` as a development command — it drops data.

**Senior follow-up: How do you seed test data for a feature test?**
> Usually you don't seed in tests — factories create exactly what each test needs (`User::factory()->has(Post::factory()->count(3))->create()`), and `RefreshDatabase` keeps the schema clean between tests (Lesson 41). A seeder belongs in tests only when the fixture is complex enough to share.

## Common mistakes

❌ Seeding fake users into production — dev data in a live DB.

❌ Non-idempotent seeders — re-running duplicates rows; use `firstOrCreate`/`updateOrCreate` for reference data.

❌ `migrate:fresh --seed` on production — drops real data.

❌ Confusing seeders with factories — specific data vs generated data.

## Quick revision notes

- Seeders = **plant specific data** · Factories = **generate data on demand**
- `php artisan db:seed` · `--class=` · `migrate:fresh --seed` (dev)
- Seeder homes: **reference data, defaults, dev fixtures**
- Production: **idempotent, no fake users**
- Tests: **factories, not seeders**, unless the fixture is complex

## Check your understanding

1. What's the difference between a seeder and a factory?
2. What data belongs in a production seeder, and what doesn't?
3. How do you keep a seeder safe to re-run?
4. When would a test use a seeder instead of factories?
