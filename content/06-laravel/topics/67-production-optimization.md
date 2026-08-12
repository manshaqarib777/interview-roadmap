# Topic 67 — Production Optimization

**Checklist anchor:** `composer install --no-dev --optimize-autoloader` · `config:cache` · `route:cache` · `view:cache` · why you shouldn't blindly cache during development

**Owning lesson:** [131 Laravel Performance & Deployment](../131-performance-deployment.md)

---

## The one-sentence answer

**Production optimization is pre-compiling the work every request would otherwise do — autoloader classmaps, cached config, routes, and views — applied at deploy time, not during development.**

## The mental model

Every Laravel request pays **bootstrap costs** (Lesson 106): loading config from dozens of files, parsing route files, compiling Blade views. Production optimization collapses each into **one pre-built artifact**:

```text
DEV (convenience)                  PROD (speed)
config/*.php → read every request  config:cache → ONE compiled file
routes/*.php → parse per request   route:cache  → ONE compiled route table
views/*.blade → compile per view   view:cache   → pre-compiled PHP
autoloader → resolve per class     --optimize-autoloader → classmap
```

The trade is **freshness vs speed**: a cache is fast because it's frozen. That's exactly why the caches belong at *deploy time* — where the code is stable — and never in development, where files change constantly.

## How it works

### The commands

```bash
# the classic sequence:
composer install --no-dev --optimize-autoloader   # no dev deps + classmap
php artisan config:cache      # compile config/*.php → bootstrap/cache/config.php
php artisan route:cache       # compile routes → a cached route table
php artisan view:cache        # pre-compile every Blade view

# all three in one:
php artisan optimize           # config + route + view cache

# undo — for development:
php artisan optimize:clear     # remove all caches
```

### Why each one matters

| Command | What it saves | The cost it avoids |
|---|---|---|
| `--optimize-autoloader` | Classmap — `class_exists` skips filesystem scans | Autoloader filesystem hits per class |
| `config:cache` | **One file read** instead of dozens | Reading + parsing every `config/*.php` per request |
| `route:cache` | A pre-built route table | Parsing `routes/*.php` per request |
| `view:cache` | Pre-compiled view PHP | Compiling each Blade template on first use |

### Why you shouldn't blindly cache during development

```text
config:cache in dev:
  edit config/app.php
  request → serves the CACHED config
  "why isn't my change working?"  ← the classic trap
```

The caches **freeze** their inputs. In development, files change every few minutes — a frozen config means edits appear to do nothing until `optimize:clear`. The rules:

- **Dev**: `optimize:clear` — everything dynamic, changes visible immediately.
- **Deploy**: `optimize` — everything frozen, fast, stable.
- **After a deploy that changes config/routes/views**: re-run the cache — the old artifact serves stale data.

### The pitfalls

```bash
php artisan route:cache      # ❌ fails if a route uses a closure
# routes with closures can't be serialized — use controller references
# (Lesson 2's route-caching note)

# config:cache with env() at runtime — env() reads outside the cached file:
# use config() instead; env() only works in config files (a Laravel rule
# that bites exactly when you cache config)
```

## Interview questions

**Q1. What are the production optimization commands?**
> `composer install --no-dev --optimize-autoloader` for the autoloader, `php artisan config:cache`, `route:cache`, and `view:cache` — or `optimize` for all three — applied at deploy time. They pre-compile per-request bootstrap work into one artifact each: a compiled config file, a route table, pre-compiled views, a classmap.

**Q2. What does `config:cache` actually do?**
> Compiles all `config/*.php` into a single cached file (`bootstrap/cache/config.php`). Instead of reading and parsing dozens of files per request, the app loads one. It's the biggest single bootstrap saving — and it freezes config, which is why it's a deploy-time command.

**Q3. Why shouldn't you cache during development?**
> Because the caches freeze their inputs. With `config:cache` active, editing `config/app.php` changes nothing until `optimize:clear` — "my change isn't working" is the symptom. Development needs freshness (files change constantly); production needs speed (files are stable). That's why the caches run at deploy time and `optimize:clear` lives in dev.

**Q4. What breaks with `route:cache`?**
> Routes defined with **closures** can't be serialized — the cache build fails with a clear error. The fix is controller references (`[Controller::class, 'method']`) instead of closures (Lesson 2). Also, the cache must be re-run after any route change, or the app serves the old route table.

**Q5. What's the `env()` pitfall with config caching?**
> `env()` reads the `.env` file directly — outside the compiled config. When config is cached, runtime `env()` calls can return wrong/empty values. The Laravel rule: call `env()` **only inside config files**; everywhere else use `config()`. It's a rule that matters exactly when you cache config.

**Senior follow-up: What's the full deploy-time optimization sequence?**
> `composer install --no-dev --optimize-autoloader`, then `php artisan optimize` (config + route + view), after migrations and before restarting workers (Lesson 66). If the deploy changes config, routes, or views, the caches re-run — a stale `config.php` after a config change is the silent regression the sequence prevents.

## Common mistakes

❌ `config:cache` in development — edits "don't apply."

❌ `env()` at runtime with config cached — wrong values from outside the compiled file.

❌ Closures in routes + `route:cache` — the build fails.

❌ Caching once and forgetting — the caches must re-run on every deploy that changes their inputs.

## Quick revision notes

- Production optimization = **pre-compile the bootstrap cost**
- `composer install --no-dev --optimize-autoloader` + `config:cache` + `route:cache` + `view:cache` (or `optimize`)
- Dev: **`optimize:clear`** — freshness · Deploy: **`optimize`** — speed
- `env()` only in **config files**; use `config()` elsewhere
- No **closures** in route-cached routes
- Re-run caches on **every deploy** that changes their inputs

## Check your understanding

1. What does each cache command pre-compile?
2. Why is the dev/prod split the whole point?
3. What's the `env()` rule, and when does it bite?
4. Why do closures break route caching?
5. When must the caches re-run after a deploy?
