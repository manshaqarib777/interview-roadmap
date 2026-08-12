# Topic 68 — CI/CD

**Checklist anchor:** GitHub Actions · the pipeline (push → CI → tests → lint → build → deploy → migrate → restart workers) · rollback strategies

**Owning lesson:** [131 Laravel Performance & Deployment](../131-performance-deployment.md)

---

## The one-sentence answer

**CI/CD is the pipeline that turns a push into a deployed app — tests, lint, and build in CI; then deploy, migrate, and restart workers in CD — so shipping is repeatable instead of a manual ritual.**

## The mental model

The checklist's diagram:

```text
Git push
   ↓
CI — tests + lint + build (automatically, on every push/PR)
   ↓
Deploy (on main, after CI is green)
   ↓
Migration
   ↓
Restart workers
```

CI answers **"does this code work?"** — automatically, before it merges. CD answers **"is it live?"** — the same tested code moves to production through a repeatable path. The pipeline makes "the last deploy" reproducible and reviewable — and rollback a known move, not a fire drill.

## How it works

### The CI job (GitHub Actions, as the checklist notes)

```yaml
# .github/workflows/ci.yml
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:        # spin up the services the app needs
        image: mysql:8
        env: { MYSQL_DATABASE: laravel_test, MYSQL_ALLOW_EMPTY_PASSWORD: yes }
        ports: [3306:3306]
      redis: { image: redis:7, ports: [6379:6379] }
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3', extensions: pdo_mysql, redis }
      - run: composer install --no-interaction
      - run: cp .env.ci .env
      - run: php artisan key:generate
      - run: php artisan migrate --env=testing
      - run: php artisan test          # the whole test suite
      - run: npm ci && npm run build   # the frontend (Inertia, Lesson 69)
```

The job **provisions its own services** (MySQL, Redis in containers), so every push gets the same environment — the "it works on my machine" failure mode is dead.

### The CD path — from green CI to production

```text
merge to main (CI green)
   ↓
deploy step: release dir + symlink, composer install --no-dev, npm build
   ↓
php artisan migrate --force          # schema first (Lesson 66)
php artisan optimize                 # config + route + view cache (Lesson 67)
php artisan queue:restart            # workers pick up the new code
   ↓
smoke test: GET / health check
```

The order is the Lesson 66 sequence — **migrate before restarting workers**, caches after code — encoded in the pipeline so nobody forgets it.

### Lint & static analysis

```bash
# in CI, alongside tests:
vendor/bin/pint --test      # Laravel Pint — style/lint
vendor/bin/phpstan          # static analysis — type errors before they ship
# fail the build on violations — CI is the gate, not a report
```

## Rollback strategies (the checklist's ask)

| Scenario | The move |
|---|---|
| **Code regression** (bad feature, broken route) | **Instant rollback**: point the release symlink back to the previous release — the code reverts in seconds; re-deploy the fix properly |
| **Bad migration** (schema destroyed data) | The pipeline can't undo data — restore the DB backup, then roll back code (Lesson 66's "data needs a plan") |
| **Workers on bad code** | `queue:restart` runs them on the reverted release — the rollback must include the worker restart |
| **Vercel-style infra** | Instant rollback to the previous deployment (this repo's own rule — Lesson 66/CLAUDE.md) |

The senior principle: **code rolls back instantly, data rolls back only as far as your last backup.** A pipeline that includes rollback as a step — not an incident — is the difference between a deploy hiccup and a production incident.

## Interview questions

**Q1. What does CI/CD mean for a Laravel app?**
> CI is the automated gate — tests, lint, build on every push/PR, with the services (MySQL, Redis) provisioned per job. CD is the automated ship — on green main, deploy, migrate, cache, restart workers, smoke test. The pipeline makes "does it work" and "is it live" repeatable instead of manual.

**Q2. What's in a Laravel CI job?**
> Checkout, set up PHP with the right extensions, `composer install`, the test database (migrate), the test suite, frontend build if there's one (Inertia/React), and lint/static analysis (Pint, PHPStan). Services like MySQL and Redis run as containers per job so the environment is identical every time.

**Q3. What's the CD sequence?**
> On green main: release the code, `composer install --no-dev --optimize-autoloader`, run migrations (`--force`), cache config/route/views, restart queue workers, then a smoke test. The order is deliberate — schema before code, workers last (Lessons 66–67).

**Q4. Why do workers restart in the pipeline?**
> Workers are long-lived processes holding the previous release in memory (Lessons 26–27). Without the restart step, the queue keeps executing old code against the new schema. It's the step people forget — which is exactly why it belongs in the pipeline, not in memory.

**Q5. How do you roll back?**
> For code: instant — the release symlink points back to the previous release, workers restart, done. For data: only as far as the last backup — a destructive migration needs a restore, which needs a backup made *before* the deploy. The senior rule: code rolls back in seconds; data rolls back as far as your backups — plan both in the pipeline.

**Senior follow-up: When does CI stop being enough?**
> When the tests don't match production — a CI that tests one PHP version but deploys another, or tests SQLite but runs MySQL, or skips the frontend build. The senior move is **parity**: same PHP version, same DB engine, same build steps as production. CI's promise is "green here means green in prod" — parity is what keeps the promise.

## Common mistakes

❌ Migrations after the new code is live — the app hits an unknown schema.

❌ No worker restart in the pipeline — old code runs in the queue.

❌ CI testing a different stack than production — SQLite tests, MySQL prod.

❌ No rollback plan — the first bad deploy becomes the incident.

❌ Deploying manually "just this once" — the pipeline exists to make every deploy identical.

## Quick revision notes

- **CI** = gate (tests + lint + build, services provisioned) · **CD** = ship (deploy + migrate + cache + restart workers)
- Pipeline order: code → `composer install --no-dev` → **migrate** → **optimize** → **queue:restart** → smoke test
- Workers restart in the pipeline — they hold the old release (Lessons 26–27)
- Rollback: **code = instant symlink** · **data = as far as the backup**
- **Parity** — CI must match production (PHP version, DB, build)
- The pipeline makes rollback a known move, not a fire drill

## Check your understanding

1. What does CI prove, and what does CD do with it?
2. Recite the CD sequence and why the order matters.
3. Why is the worker restart a pipeline step?
4. What can a code rollback never undo?
5. What breaks CI's promise, and how do you fix it?
