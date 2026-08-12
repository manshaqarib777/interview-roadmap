# Topic 65 — Queues & Distributed Systems

**Checklist anchor:** worker crash · job executes twice · external API timeout · 30-minute job · Redis down · retry · backoff · timeout · idempotency · dead-letter/failed-job concepts

**Owning lesson:** [124 Queues & Jobs](../124-queues.md)

---

## The one-sentence answer

**A queued system is a distributed system — and the senior skill is answering what happens when the parts fail: workers crash, jobs run twice, APIs time out, and Redis goes down.**

## The mental model

The checklist's architecture:

```text
API
 ↓
Job ──► Redis ──► Worker ──► External service
```

Every arrow is a **failure point**. The senior interview isn't "what's a job?" — it's "what happens when *this* breaks?" The answer set is the same every time:

1. **Retry** — failures are transient; try again.
2. **Backoff** — don't hammer a failing service; wait longer between tries.
3. **Timeout** — a hung job must not run forever.
4. **Idempotency** — a retry must not double the side effect.
5. **Failed jobs / dead letter** — the last resort has a home and eyes on it.

## The five scenarios

### 1. Worker crashes

A worker dies mid-job. The job was **not acknowledged** — the queue redelivers it to another worker. This is safe *because* jobs are idempotent. The supervisor (Horizon, Lesson 27) restarts the worker; the queue keeps the job.

### 2. Job executes twice

Redelivery, retries, or at-least-once semantics mean a job can run twice. The defence is **idempotency**:

```php
public function handle(): void
{
    $paid = Payment::where('stripe_payment_intent', $this->intentId)->exists();
    if ($paid) return;              // already done — no-op

    // mark-as-you-go so a concurrent duplicate sees the mark:
    $claim = PaymentJob::firstOrCreate(['payment_intent' => $this->intentId]);
    if (!$claim->wasRecentlyCreated) return;
    // ...do the work...
}
```

**At-least-once** is the queue's promise — your job must tolerate duplicates. "Exactly once" is an impossible distributed guarantee; you implement it with idempotency keys.

### 3. External API times out

```php
public $timeout = 30;               // the job gives up at 30s

public function handle(): void
{
    try {
        $this->api->charge($this->order);   // may hang…
    } catch (TimeoutException $e) {
        $this->release(60);                 // …put the job back, wait 60s
        return;
    }
}
```

- `$timeout` caps the run — a hung API can't hold the worker forever.
- **Retries with backoff** let the external service recover.
- If the API *repeatedly* fails, `$tries` exhausts and the job goes to the failed table — an alert, not a silent loss.

### 4. Job takes 30 minutes

```php
public $timeout = 3600;             // honest about the runtime
public $tries = 1;                  // don't re-run a 30-min job from scratch blindly
```

- Set the timeout to match reality — a 30-minute job with a 30-second timeout is a guaranteed failure.
- Consider **chunking** — process in batches with `chunkById` (Lesson 12) so a crash doesn't redo everything.
- Consider **checkpointing** — record progress, resume from it on retry.

### 5. Redis goes down

Redis is the queue *and* often the cache (Lesson 34). When it's down:

- **Enqueue fails** — dispatches throw. The defence: retry dispatch with backoff, or a **fallback connection** (database queue) for critical jobs.
- **Workers stall** — no jobs to pull. They wait and reconnect when Redis returns.
- **Cache falls back** — `Cache::remember` misses and hits the DB (Lesson 34's fallback design).
- **Horizon's dashboard** goes dark — the monitoring layer itself depends on Redis.

The answer: **degrade gracefully** — the API stays up (jobs pile up safely or fail to a database queue), the cache falls through to the DB, and alerts fire. Redis down is an incident, not a data-loss event — because the queues are durable (jobs survive in the DB/queue until processed).

## The plain-JS model (what the exercise does)

```js
// at-least-once + idempotency: the worker contract
function worker(job) {
  if (alreadyDone(job.id)) return;      // duplicate → no-op
  try {
    run(job);                           // may throw, may hang
    markDone(job.id);                   // claim BEFORE the side effect
  } catch (e) {
    scheduleRetry(job, backoff(job.attempts)); // retry with backoff
  }
}
```

## Interview questions

**Q1. What happens if a worker crashes mid-job?**
> The job isn't acknowledged, so the queue redelivers it — another worker picks it up. That's why jobs must be idempotent: the retry re-runs the job, and it must be safe to do so. The supervisor (Horizon) restarts the worker; the queue guarantees the job isn't lost.

**Q2. What happens if a job executes twice?**
> With at-least-once delivery, duplicates are expected. The job guards itself: check-before-act (`firstOrCreate` on the external id), or claim-then-work so a concurrent duplicate sees the mark and no-ops. "Exactly once" isn't something the queue provides — idempotency is what you build to make duplicates harmless.

**Q3. How do you handle an external API that times out?**
> A `$timeout` so the worker never hangs forever, `$tries` with `$backoff` so retries give the service room to recover, and a `catch` that `release()`s the job with a delay when the timeout is transient. If it exhausts retries, the failed-jobs table holds it for inspection — an alert, not a silent loss.

**Q4. How do you handle a 30-minute job?**
> Make the timeout honest (`$timeout = 3600`), chunk the work so a crash doesn't restart the whole thing, and checkpoint progress so a retry resumes rather than repeats. A job whose runtime exceeds its timeout is a bug — the config must match the work.

**Q5. What happens when Redis goes down?**
> The API stays up — jobs fail to enqueue (handled by dispatch retries or a database-queue fallback), workers stall and wait, and the cache degrades to DB hits (Lesson 34). Queues are durable, so nothing is lost; the incident is degraded throughput, not data loss. The alerting and fallbacks are the production answer.

**Senior follow-up: How do you design a queue system for failure?**
> Assume every step fails. Jobs are idempotent (safe to run twice), bounded (`$timeout`, `$tries`, `$backoff`), and land somewhere visible (failed-jobs table, alerting). External calls are time-boxed and retried with backoff. Critical jobs have a fallback path if the primary queue is down. And the whole thing is observed — queue depth, failure rate, wait time (Horizon) — because a queue you can't see is a queue you can't trust.

## Common mistakes

❌ Jobs that aren't idempotent — the #1 distributed-systems bug in Laravel apps.

❌ Timeout shorter than the work — guaranteed failures on slow jobs.

❌ No backoff — retries hammer a down service, making the outage worse.

❌ No failed-job monitoring — a dead-letter queue with nobody watching is just data loss with extra steps.

## Quick revision notes

- A queue is a **distributed system** — every arrow can fail
- **Retry** (transient failures) · **backoff** (don't hammer) · **timeout** (never hang) · **idempotency** (safe twice) · **failed jobs** (the visible last resort)
- Worker crash → **redelivery** (safe because idempotent)
- Run twice → **claim/check-before-act** — at-least-once is the contract
- External timeout → `release()` with delay, retries, then failed table
- Long job → **honest timeout, chunk, checkpoint**
- Redis down → **API up, jobs durable, cache falls back** — degraded, not lost

## Check your understanding

1. What's the queue's delivery guarantee, and what do you build on top of it?
2. How does a job make itself safe to run twice?
3. Walk through the external-API-timeout scenario end to end.
4. What does a 30-minute job need that a 2-second job doesn't?
5. Why is Redis-down an incident but not a data-loss event?
