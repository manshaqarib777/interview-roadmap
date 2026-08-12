# Topic 44 — Artisan

**Checklist anchor:** `make:` commands · `route:list` · `migrate` · `queue:work` · `optimize` · config/route cache

**Owning lessons:** [107 Application Structure & Bootstrapping](../107-app-structure.md) · [119 Migrations, Schema & Seeders](../119-migrations.md)

---

## The one-sentence answer

**Artisan is Laravel's command-line interface — the same application with a console front door, running through the same bootstrap, config, and container.**

## The mental model

Artisan is not a separate tool. `php artisan` is the **same Laravel app with a console kernel** instead of an HTTP kernel:

```text
HTTP:  public/index.php → HTTP kernel → routes → controllers
CLI:   php artisan ...  → Console kernel → commands → whatever the command does
```

Same bootstrap: `.env`, config, container, providers — all loaded, then the command runs. That's why `php artisan tinker` has full access to your models and services, and why `php artisan migrate` can touch the same database as your routes.

## The commands that matter

### Scaffolding (`make:`)

```bash
php artisan make:model        Order
php artisan make:controller   OrderController
php artisan make:migration    create_orders_table
php artisan make:request      StoreOrderRequest
php artisan make:resource     OrderResource
php artisan make:job          ProcessPayment
php artisan make:event        OrderCreated
php artisan make:listener     SendOrderConfirmation
php artisan make:policy       OrderPolicy
php artisan make:test         OrderFlowTest
```

These are **templates, not magic** — they create a file in the right folder with the right base class. What you write inside is yours.

### Inspecting

```bash
php artisan route:list          # every route, method, middleware, controller
php artisan route:list --path=api
php artisan about               # version, env, cache state, drivers
php artisan tinker              # REPL with the full app booted
```

`route:list` is the single best "what does my app actually do?" command — it flattens routes, groups, and middleware into one table.

### Database

```bash
php artisan migrate             # run pending migrations
php artisan migrate:rollback    # undo the last batch
php artisan migrate:fresh       # drop ALL tables, re-run all migrations
php artisan migrate:refresh     # rollback then re-migrate
php artisan db:seed             # run seeders
php artisan db:seed --class=UserSeeder
```

**The dangerous ones:** `migrate:fresh` drops every table — never on production without knowing exactly what you're doing.

### Queues

```bash
php artisan queue:work          # process jobs (foreground worker)
php artisan queue:listen        # reload worker on code change (dev)
php artisan queue:retry failed  # re-queue failed jobs
php artisan queue:failed        # list failed jobs
php artisan queue:flush         # delete all failed jobs
```

### Production caching

```bash
php artisan optimize            # config + route + view cache in one
php artisan config:cache        # compile config to one file
php artisan route:cache         # compile routes
php artisan view:cache          # compile Blade views
php artisan optimize:clear      # undo all of it (development)
```

## Why caching commands matter

Without caches, each request re-reads dozens of config files and re-parses routes. With `config:cache`, it's **one compiled file read**. That's a bootstrap-cost win (Lesson 106) — but the rule is: **don't cache config in development**; you'd edit `config/*.php` and nothing would change until you clear the cache. That's the "why you shouldn't blindly cache everything during development" from the checklist.

## Interview questions

**Q1. What is Artisan?**
> Laravel's CLI. It boots the same application as an HTTP request — same `.env`, config, container, providers — but dispatches to a command instead of a route. That's why artisan can touch models, queues, and the database exactly like your app code.

**Q2. What's `php artisan migrate:fresh` and when is it dangerous?**
> It drops all tables and re-runs every migration — a clean slate. Dangerous on production because it destroys data; it's a development command (or a reset for a seeded demo). On production you use `migrate` and `migrate:rollback`.

**Q3. How does route caching work, and when does it break?**
> `route:cache` compiles all routes into a single cached array, so the router skips re-parsing route files. It must be re-run after any route change, and it can break if routes use closures (closures can't be cached) — Laravel warns about this. In CI you typically cache config/route/view before deployment.

**Q4. Why shouldn't you cache config during development?**
> Because `config:cache` freezes config into one file — edit `config/app.php` and the app still serves the cached values until you run `optimize:clear`. Caching is a production deployment step, not a dev convenience.

**Senior follow-up: How would you write a custom artisan command?**
> `php artisan make:command SendDailyDigest`, implement `handle()` with the work, inject services through the constructor (the container resolves them), and register the schedule if it's recurring. Commands are the right seam for cron work and one-off maintenance jobs.

## Common mistakes

❌ Running `migrate:fresh` on production — data loss.

❌ Editing config in dev with `config:cache` active — changes "don't apply."

❌ Writing heavy logic in `handle()` that belongs in a service — a command is a thin entry point, like a controller.

❌ Using `queue:listen` in production — it's for development (reloads on change); production runs `queue:work` under a supervisor.

## Quick revision notes

- Artisan = **console front door to the same app** — same bootstrap, config, container
- `make:*` scaffolds · `route:list` inspects · `migrate*` manages schema · `queue:*` runs workers
- **Production**: `optimize` (config+route+view cache) · **Dev**: `optimize:clear`
- `migrate:fresh` **drops data** — development only
- Commands are **thin entry points** — logic lives in services

## Check your understanding

1. Why can artisan touch models and the database exactly like routes can?
2. Which command shows every route and its middleware?
3. What's the difference between `migrate:fresh` and `migrate:refresh`?
4. Why is config caching a production-only move?
5. Where does a custom command's business logic belong?
