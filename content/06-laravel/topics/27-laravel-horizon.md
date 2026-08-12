# Topic 27 — Laravel Horizon

**Checklist anchor:** queue monitoring · workers · supervisors · metrics · Redis · failed jobs · balancing

**Owning lesson:** [124 Queues & Jobs](../124-queues.md)

---

## The one-sentence answer

**Horizon is the operations dashboard and supervisor for Redis-backed queues — it manages workers, balances them across queues, and shows you live metrics and failed jobs.**

## The mental model

`queue:work` is a single worker you babysit. Horizon is the **control room**:

```text
Horizon
 ├─ Supervisors ── manage worker processes (start, restart, watch)
 ├─ Balancing ──── shifts workers between queues by load
 ├─ Metrics ────── jobs processed, wait times, throughput
 └─ Failed jobs ── inspect, retry, purge from a dashboard
```

Instead of manually running `queue:work` per queue and hoping nothing dies, Horizon runs **supervisors** that spawn and monitor workers, and a web dashboard shows what's happening in real time. It only works with **Redis** — that's its explicit requirement.

## How it works

### Setup

```bash
composer require laravel/horizon
php artisan horizon:install
# QUEUE_CONNECTION=redis  — Horizon requires Redis
```

```bash
php artisan horizon              # start the supervisor (replaces queue:work)
php artisan horizon:terminate    # graceful restart after a deploy
```

Horizon's config (`config/horizon.php`) defines **environments** — each with its own balance strategy, worker count, and queue list:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default', 'emails', 'reports'],  // which queues
            'balance' => 'auto',                          // balancing strategy
            'maxProcesses' => 10,
            'tries' => 3,
        ],
    ],
],
```

### Supervisors & workers

- A **supervisor** is a long-lived process that spawns and watches **workers** (each worker processes jobs from its queue).
- If a worker crashes, the supervisor restarts it. `horizon:terminate` gracefully finishes in-flight jobs, then restarts — the standard deploy sequence.
- Workers remember nothing between jobs (a fresh app per job), which is why Horizon restarts cleanly after deploys.

### Balancing

With `'balance' => 'auto'`, Horizon watches queue load and **shifts workers to the busy queue**:

```text
default: 1000 queued jobs      emails: 5 queued jobs
→ Horizon moves worker processes from emails to default, live
```

The three strategies: `simple` (fair-ish round-robin), `auto` (shift by wait-time), `false` (fixed per queue). Auto is the default for production.

### Metrics & failed jobs

The dashboard shows:

- Jobs processed per minute, throughput, and **wait times** per queue.
- Failed jobs with their exception and payload — retry, retry-all, or purge in one click.
- The `horizon` job and metrics are stored in Redis (and optionally a `horizon_jobs` table for history).

## Interview questions

**Q1. What is Horizon?**
> Laravel's Redis-queue management layer. It replaces hand-managed `queue:work` processes with supervisors that spawn and monitor workers, balances them across queues automatically, and provides a dashboard with live metrics and failed-job management. Redis is a hard requirement.

**Q2. How does Horizon differ from `queue:work`?**
> `queue:work` is one worker process you run and babysit. Horizon runs supervisors that manage many workers, restart crashed ones, balance them across queues, and surface everything in a dashboard. For a single queue on a small app, `queue:work` under systemd is fine; Horizon is the answer when queues multiply and you need visibility.

**Q3. What are supervisors and workers?**
> A supervisor is the long-lived process Horizon runs per environment/queue group. It spawns and watches worker processes — each worker picks jobs off its queue and runs them. A crashed worker is restarted by the supervisor; `horizon:terminate` asks everything to finish in-flight work and restart cleanly, which is the deploy dance.

**Q4. What is queue balancing?**
> Shifting workers to the queue that's currently busy. With `'balance' => 'auto'`, Horizon monitors wait times and reallocates worker processes — the queue with 1000 pending jobs gets more workers while the idle one loses some. That's how one pool serves many queues efficiently.

**Q5. How do you deploy with Horizon?**
> Restart workers after code ships — `php artisan horizon:terminate` — so supervisors spawn fresh workers on the new code. The dashboard then shows the deploy's effect: processed rate, wait times, and any new failures. Metrics live in Redis, so the deployment restarts cleanly.

**Senior follow-up: When does Horizon stop being enough?**
> When the queue system outgrows a single Redis instance — cross-region workers, massive throughput, or strict per-tenant isolation. At that point you're looking at a dedicated job platform (SQS, RabbitMQ, Kafka-based systems) with Horizon's concepts — supervisors, retries, dead letters — reimplemented at platform scale. The *concepts* transfer; Horizon is the Redis-scoped implementation.

## Common mistakes

❌ Using Horizon with a non-Redis queue — it requires Redis, full stop.

❌ Running `queue:work` instead of `horizon` — you lose the supervision and dashboard.

❌ Forgetting `horizon:terminate` on deploy — workers keep running the old code until they die.

❌ Treating the dashboard as optional — failed-job visibility is the whole point.

## Quick revision notes

- Horizon = **Redis queue control room** — supervisors, balancing, metrics, failed jobs
- `php artisan horizon` starts it · `horizon:terminate` restarts cleanly on deploy
- **Supervisor** spawns/watches **workers** · crashed workers auto-restart
- **`balance => auto`** shifts workers to the busy queue
- Dashboard: throughput, **wait times**, failed jobs (retry/purge)
- Requires **Redis** — the production queue connection

## Check your understanding

1. What does Horizon give you over `queue:work`?
2. How do supervisors keep workers alive?
3. What does auto-balancing do, exactly?
4. What's the deploy sequence with Horizon?
5. Why does Horizon require Redis?
