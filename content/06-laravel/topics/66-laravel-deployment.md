# Topic 66 — Laravel Deployment

**Checklist anchor:** the production path (Nginx → PHP-FPM → Laravel → DB → Redis) · env vars · PHP extensions · Composer · migrations · storage permissions · queues · workers · scheduler · cache · OPcache

**Owning lesson:** [131 Laravel Performance & Deployment](../131-performance-deployment.md)

---

## The one-sentence answer

**Deploying Laravel is knowing the production request path and every moving part on it — Nginx → PHP-FPM → the app → MySQL/Postgres → Redis — plus migrations, workers, the scheduler, storage permissions, and caches.**

## The mental model

The checklist's diagram:

```text
Nginx (web server)
   ↓  (static files served; PHP proxied)
PHP-FPM (PHP workers)
   ↓
Laravel (the app)
   ↓                    ↓
MySQL/PostgreSQL     Redis (cache, queues, sessions, rate limits)
```

Every box is a deploy concern: the web server serves static files and proxies PHP; PHP-FPM runs the app; the database holds the truth; Redis holds the fast shared state (Lesson 34). A production Laravel deploy touches all of them.

## How it works — the deploy checklist

### 1. The server stack

```text
Nginx        → serves public/ (index.php, assets), proxies PHP to FPM
PHP-FPM      → runs the app; PHP extensions must match the app (pdo_mysql/pdo_pgsql,
               mbstring, openssl, curl, zip, gd/imagick, redis, opcache)
Laravel      → the code, deployed and configured
MySQL/Postgres → the source of truth
Redis        → cache, queues, sessions, rate limits
```

### 2. Environment — `.env` and secrets

```bash
# production .env lives in the deploy environment, NEVER in the repo (Lesson 37):
APP_ENV=production
APP_DEBUG=false              # no error details leaked to clients
APP_KEY=<generated>          # the encryption crown jewel (Lesson 38)
DB_* / REDIS_* / QUEUE_CONNECTION=redis / CACHE_STORE=redis / SESSION_DRIVER=redis
```

### 3. Composer & the app

```bash
composer install --no-dev --optimize-autoloader
# --no-dev: no dev packages in prod · --optimize-autoloader: classmap for speed
php artisan migrate --force        # schema changes (no confirmation prompt)
php artisan optimize               # config + route + view cache
```

### 4. Storage permissions

```bash
chown -R www-data:www-data storage bootstrap/cache
# Laravel writes logs, sessions, compiled views, and cached config to these
# (Lesson 39's logs + the compiled view cache)
```

### 5. Queues, workers & the scheduler

```bash
# queue workers — supervised (systemd, supervisor, Horizon — Lesson 27):
# restart them after a deploy so they run the new code
php artisan queue:restart

# the scheduler — ONE cron line (Lesson 32):
* * * * * cd /app && php artisan schedule:run >> /dev/null 2>&1
```

### 6. OPcache

```bash
# enabled in PHP — stop recompiling PHP files per request (Lesson 62's rung 10)
# validate_timestamps=0 with a cache-clear step on deploy, or validate on mtime
```

### 7. The deploy sequence (the ordering that matters)

```text
1.  pull the code (release dir + symlink for zero-downtime)
2.  composer install --no-dev --optimize-autoloader
3.  php artisan migrate --force        (schema before new code depends on it)
4.  php artisan optimize               (config + route + view cache)
5.  restart queue workers              (they run the old code until now)
6.  clear/reload OPcache               (PHP files changed)
7.  storage permissions                (new files, writable dirs)
```

**Migrations before workers** is the critical ordering: the new code expects the new schema, and workers pick up the new code only after the restart step.

## Interview questions

**Q1. Walk me through a Laravel deployment.**
> Pull the code, `composer install --no-dev --optimize-autoloader`, run `php artisan migrate --force`, cache config/route/views (`optimize`), restart queue workers, reload OPcache, and check storage permissions. Env is set in the deploy environment with `APP_DEBUG=false`; the `.env` never comes from the repo. Workers restart after the schema so they run the new code against the new schema.

**Q2. Why do workers need restarting on deploy?**
> Queue workers are long-lived processes holding the old code in memory — a deploy changes the files, but the running worker still executes the previous version. `php artisan queue:restart` (or Horizon's `horizon:terminate`) signals them to finish and restart on the new code (Lessons 26–27). Skipping it = the app runs new code while the queue runs old code.

**Q3. What's the production request path?**
> Nginx receives the request — serves static files directly, proxies PHP to PHP-FPM. PHP-FPM runs Laravel's `public/index.php` lifecycle (Lesson 106). The app reads/writes MySQL/PostgreSQL (the source of truth) and uses Redis for cache, queues, sessions, and rate limits (Lesson 34).

**Q4. What environment settings matter in production?**
> `APP_ENV=production`, `APP_DEBUG=false` (no stack traces to clients — Lesson 40), a real `APP_KEY`, and the production drivers — Redis for cache/queue/session (Lessons 33–34), and proper DB credentials. Secrets live in the deploy environment, never the repo (Lesson 37).

**Q5. How do migrations fit into a deploy?**
> `php artisan migrate --force` runs pending schema changes without the confirmation prompt — before the new code depends on the new schema, and before workers restart. The ordering matters: new schema first, then new code (including workers), then caches.

**Senior follow-up: How do you roll back a bad deploy?**
> Two options: instant rollback — point the release symlink back to the previous release (the code is gone, the DB may have moved) — or `git revert` plus a re-deploy for code-only issues. The DB is the hard part: if the migration was destructive, rolling back code doesn't roll back data — which is why destructive schema changes get a backup and a plan (Lesson 14). The senior answer: code rolls back fast; data needs a plan made *before* the deploy.

## Common mistakes

❌ `APP_DEBUG=true` in production — stack traces and env details leaked to clients.

❌ Not restarting workers — the queue runs stale code after a deploy.

❌ Running migrations after the new code is live — the app hits a schema it doesn't know.

❌ `composer install` with dev packages in production — extra attack surface and dead weight.

❌ Forgetting storage permissions — logs and caches fail silently at first write.

## Quick revision notes

- The path: **Nginx → PHP-FPM → Laravel → MySQL/Postgres + Redis**
- Deploy sequence: code → `composer install --no-dev --optimize-autoloader` → **`migrate --force`** → `optimize` → **restart workers** → reload OPcache → storage perms
- Env: `APP_DEBUG=false`, real `APP_KEY`, Redis drivers, secrets in the environment (never the repo)
- **Workers restart** after schema — they hold old code until then
- Scheduler: one cron line → `schedule:run` (Lesson 32)
- Rollback: code is instant (symlink); **data needs a pre-made plan**

## Check your understanding

1. Recite the production request path and what each box does.
2. What's the critical ordering between migrations, workers, and code?
3. Why does `--no-dev` matter in production?
4. What breaks when storage permissions are wrong?
5. Why can't a code rollback undo a bad migration?
