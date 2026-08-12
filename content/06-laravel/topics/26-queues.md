# Topic 26 — Queues

**Checklist anchor:** jobs · workers · connections · Redis/database queues · failed jobs · retries · backoff · timeouts · delayed · batching · chains · Horizon · why not sync email

**Owning lesson:** [124 Queues & Jobs](../124-queues.md)

---

## The one-sentence answer

**A queue moves slow or side-effectful work out of the request — the request dispatches a job, a worker picks it up and runs it — so the user's response never waits on email, PDFs, or API calls.**

## The mental model

The checklist's diagram:

```text
HTTP Request
     ↓
Create Order
     ↓
Dispatch Job ──► Queue ──► Worker ──► Send Email
   (instant)      (store)    (later)
```

The request's job is done the moment the job is **dispatched** — the email is sent later by a worker. The user gets a fast response; the email happens in the background.

**Why shouldn't you send emails synchronously inside a request?** (the question) Because the response waits on the email: slow SMTP, a down mail server, a large attachment — and the user's page hangs on it. The request should be fast and resilient; the email is a side effect that belongs behind a queue where a failure retries instead of breaking the checkout.

## How it works

### The job

```php
php artisan make:job SendOrderConfirmation
```

```php
class SendOrderConfirmation implements ShouldQueue
{
    public function __construct(public Order $order) {}

    public function handle(): void
    {
        Mail::to($this->order->email)->send(new OrderConfirmation($this->order));
        // worker runs this — not the request
    }
}
```

### Dispatch — the moment the request ends

```php
SendOrderConfirmation::dispatch($order);            // queue it (default connection)
dispatch(new SendOrderConfirmation($order));        // same
$this->dispatch(new SendOrderConfirmation($order)); // from the request
```

### The worker

```bash
php artisan queue:work                    # process jobs, forever
php artisan queue:work --queue=emails     # a specific queue
```

The worker pulls jobs off the queue and runs them. In production, a supervisor (systemd, Horizon) keeps workers alive.

### Connections & queues

```php
// config/queue.php — the connection drivers:
'connections' => [
    'database' => [...],   // jobs table — zero extra infra, good to start
    'redis' => [...],      // Redis — the production default
    'sync' => [...],       // run inline — dev only, defeats the point
],
```

`QUEUE_CONNECTION=redis` in production; `database` for simple deploys; `sync` only for tests/dev.

### Retries, backoff, timeouts, delays

```php
class SendEmailJob implements ShouldQueue
{
    public $tries = 3;              // retry up to 3 times
    public $backoff = [5, 15];      // wait 5s, then 15s between retries
    public $timeout = 120;          // kill a run after 120s

    public function handle(): void { /* ... */ }
}

// delayed: run later
SendOrderConfirmation::dispatch($order)->delay(now()->addMinutes(30));

// failed jobs land in failed_jobs — inspect with:
php artisan queue:failed
php artisan queue:retry all
```

### Batching & chains

```php
// chain: run in order, each waits for the previous
Bus::chain([
    new ProcessOrder($order),
    new SendOrderConfirmation($order),
])->dispatch();

// batch: run together, report progress
Bus::batch([
    new GenerateReport($page1),
    new GenerateReport($page2),
])->then(fn () => /* all done */)->dispatch();
```

## Failed jobs & the failure path

- A job that exhausts retries lands in the `failed_jobs` table — inspect with `queue:failed`, retry with `queue:retry`, purge with `queue:flush`.
- **The rule:** jobs must be **idempotent** — re-running them must be safe, because a retry will re-run them (Lesson 65).

## The plain-JS model (what the exercise does)

```js
// dispatch = enqueue (fast, returns)  ·  worker = dequeue (slow, async)
const queue = [];
function dispatch(job) { queue.push(job); return 'queued'; }   // request returns here
function worker() { while (queue.length) run(queue.shift()); }  // later, elsewhere
```

## Interview questions

**Q1. What are queues, and why do you need them?**
> Queues move slow or side-effectful work out of the request. The request dispatches a job — which is nearly instant — and a worker runs it later. Email, PDF generation, webhooks, and external API calls belong in queues: the response stays fast, and failures retry instead of breaking the request.

**Q2. Why shouldn't you send emails synchronously inside a request?**
> Because the request waits on the email. A slow or down mail server turns a 100ms checkout into a timeout. Dispatched to a queue, the request returns instantly and the worker handles the email — with retries when it fails. Synchronous side effects are the difference between "the order was placed" and "the page hung on SMTP."

**Q3. What's a job?**
> A class that encapsulates a unit of background work — `SendOrderConfirmation` with a `handle()` method. `ShouldQueue` marks it for the queue; dispatch enqueues it; the worker runs `handle()`. Jobs are the queue's unit of work.

**Q4. What happens when a job fails?**
> It retries per `$tries` and `$backoff`, then lands in the `failed_jobs` table. You inspect with `queue:failed`, retry with `queue:retry`, and fix the underlying issue. The job's `handle()` must be written to survive re-runs — idempotency is the contract with the queue.

**Q5. Database queue vs Redis queue?**
> The database queue stores jobs in a `jobs` table — zero extra infrastructure, fine to start. Redis is the production default: faster enqueue/dequeue, and it's the basis for Horizon (Lesson 27). The trade is infrastructure: `database` needs nothing, `redis` needs Redis — worth it at scale.

**Senior follow-up: How do you make a job safe to retry?**
> Idempotency: the job must produce the same result whether it runs once or twice. Check before you act (`firstOrCreate`, `updateOrCreate`), or make the action itself idempotent (Stripe's idempotency keys, Lesson 71). Also: catch expected failures and release/retry deliberately, and never swallow exceptions — a job that dies silently is a bug wearing a retry count.

## Common mistakes

❌ Sending email (or any side effect) synchronously in a request.

❌ Jobs that aren't idempotent — a retry double-sends or double-creates.

❌ `QUEUE_CONNECTION=sync` in production — that's the dev setting that makes jobs run inline.

❌ Ignoring failed jobs — `queue:failed` is the operations dashboard; retry, fix, or purge.

## Quick revision notes

- Queue = **move work out of the request** — dispatch (instant) → worker (later)
- **Job** = the unit of work (`ShouldQueue` + `handle()`)
- Connections: `database` (zero infra) · `redis` (production) · `sync` (dev only)
- Resilience: `$tries`, `$backoff`, `$timeout`, `delay()`, failed jobs
- **Batching** (parallel + progress) · **chains** (strict order)
- Jobs must be **idempotent** — retries will re-run them

## Check your understanding

1. Why does the request return the instant a job is dispatched?
2. What exactly does a worker do, and how does it stay alive in production?
3. How do `$tries` and `$backoff` shape the retry story?
4. Where do failed jobs go, and how do you handle them?
5. What makes a job safe to run twice?
