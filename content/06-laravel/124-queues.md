# Lesson 124 — Queues & Jobs

**Interview importance:** ⭐⭐⭐⭐ — a senior classic; "why don't you send the email in the
request?" gets asked at almost every backend loop.

Sending the confirmation email inside the request that created the order is the original
Laravel sin: the user waits on SMTP, and when the mail server is slow the whole request is
slow. Queues exist to move that work *out of the request entirely* — the request returns in
milliseconds, and a separate **worker** process does the slow work a moment later.

This lesson is the async mental model from Lesson 22 (the event loop) applied to a whole
process: dispatch work to a queue, have a dedicated process pick it up, and survive every
way that work can fail — crashes, timeouts, double runs. That survival story — retry,
backoff, timeout, idempotency, `failed_jobs` — is what interviewers are actually probing.
It also builds on Lesson 108: jobs are resolved through the container, and on Lesson 122:
your authenticated user is often the thing you're emailing.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why side effects don't belong in the request lifecycle
- Trace a job from `dispatch()` all the way to `failed_jobs`
- Describe how `php artisan queue:work` loops forever and what it does per job
- Configure retries, backoff, timeouts, and a delayed start
- Say what happens when a worker crashes, a job runs twice, or an API times out
- Know when to reach for batching, chains, and Horizon

## 1. One-line Definition

**A queue is a durable list of work waiting to be done; a job is the class that describes
one unit of that work; a worker is a process that pops jobs off the list forever and runs
them, retrying the ones that fail.**

Three nouns, three jobs to do. The request *pushes*; the worker *pulls*; the queue sits
between them so neither ever has to wait on the other.

## 2. Mental Model

**The queue is a shared to-do list; the worker is the colleague who works through it around
the clock.**

- The **request** is you jotting a task on the list ("email order #42"). You're free to
  take the next customer immediately.
- The **worker** is the colleague who works through the list all night, one task at a time,
  in order.
- A task that fails gets rewritten onto the list (**retry**), each time with a longer wait
  (**backoff**).
- A task that can never succeed goes into a **broken pile** (`failed_jobs`) for a human to
  look at in the morning.
- The list **survives the office closing** (a server restart) because it lives in the
  database or in Redis — not in memory.

The emotional shift is the same as Lesson 22: *your code doesn't do the work; it schedules
the work and lets the process that owns the queue do it.*

## 3. Visual Flow

This is the picture to draw on a whiteboard:

```text
   YOUR PHP PROCESS (php-fpm)                 THE WORKER (php artisan queue:work)
   ┌────────────────────────────────┐        ┌──────────────────────────────────┐
   │ HTTP request arrives           │        │ loops forever:                   │
   │  ├─ create order               │        │   pop job ◄──────────┐           │
   │  ├─ validate, persist          │        │   run it (handle)     │           │
   │  ├─ dispatch(job) ─────────────┼───────▶│   on failure:         │           │
   │  └─ return 201 in ~5 ms        │        │     retry w/ backoff  │           │
   └────────────────────────────────┘        │     else failed_jobs │           │
                                             └──────────────────────┴───────────┘
        │  dispatch = one INSERT into the jobs table / Redis list
        ▼
   ┌────────────────────────────────┐
   │  QUEUE (default, high, …)      │   stored in DB or Redis → survives restarts
   └────────────────────────────────┘
```

The request and the worker never meet. They communicate only through the queue. That is the
entire architecture.

## 4. How It Works

A job is a plain class that implements `ShouldQueue`:

```php
// php artisan make:job SendOrderConfirmation
class SendOrderConfirmation implements ShouldQueue
{
    public $tries = 3;              // retry count — attempt then 2 retries
    public $backoff = [1, 5, 10];   // seconds to wait between attempts
    public $timeout = 60;           // max seconds one run may take

    public function __construct(public Order $order) {}

    public function handle(): void
    {
        Mail::to($this->order->email)->send(new OrderConfirmation($this->order));
    }
}
```

Dispatch it from the controller — and the request is done:

```php
public function store(StoreOrderRequest $request)
{
    $order = Order::create($request->validated());   // fast DB work

    SendOrderConfirmation::dispatch($order);          // ≈ 1 ms, no SMTP involved

    return response()->json($order, 201);             // response, not an email
}
```

On the `database` connection, dispatching is literally one INSERT. Show the SQL the queue
generates:

```text
insert into `jobs` (`queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`)
values ('default',
        '{"uuid":"...","displayName":"App\\Jobs\\SendOrderConfirmation","data":{"order":42}}',
        0, null, 1730840400, 1730840400)
```

The worker is the other half. It is not a cron job that runs once — it is a long-running
process that loops forever:

```php
// php artisan queue:work — what actually happens, simplified
while (true) {
    $job = $queue->pop();        // block until a job is available
    if ($job) {
        try {
            $job->run();         // calls handle()
            $queue->ack($job);   // remove it — work is done
        } catch (Throwable $e) {
            if ($job->attempts() < $job->maxTries()) {
                $queue->release($job, $job->backoffDelay());  // retry later
            } else {
                $queue->moveToFailedJobs($job, $e);           // give up
            }
        }
    }
}
```

```narrate
line 2:  the worker NEVER exits — restart-on-crash is Supervisor's job (below)
line 3:  pop blocks: no job → the worker idles, it does not burn CPU
line 7:  success path — the job is acked and forgotten
line 9:  any Throwable (SMTP down, API 500, timeout) is caught here
line 11: still under maxTries → released back to the queue with a backoff delay
line 14: out of tries → moved to failed_jobs for a human
```

That try/catch/release/fail shape **is** the queue. Everything else in this lesson tunes it.

## 5. Real Project Usage

| Side effect | Why it goes in a queue |
|---|---|
| **Emails / SMS / push** | SMTP and carrier APIs are slow and flaky — never in a request |
| **Image / video processing** | CPU-heavy; takes seconds to minutes |
| **Webhook delivery** | Third parties are down or slow; retries are mandatory |
| **CSV / PDF / report export** | Long generation; the user should get a link, not a spinner |
| **Search index updates** | Elasticsearch/Meilisearch sync shouldn't block the write |
| **Charge retries / reminders** | "try again in 3 days" is literally a delayed job |

The pattern is always the same: the request writes the truth (the order row), then hands
the side effect to a worker that has all the time in the world.

## 6. Interview Explanation

> We never send email inside the request because the request's job is to return a response,
> and SMTP can take seconds or fail. So the controller only does fast, transactional work,
> then calls `dispatch()`. That puts a row into the queue — the `jobs` table or a Redis
> list — and the response returns immediately. Separately, a worker process — `php artisan
> queue:work` — loops forever, pops the job, and runs it. If it throws, the worker retries
> it with exponential backoff up to `$tries`, and if it still fails it lands in
> `failed_jobs` for a human to fix. The queue is durable storage, so a server restart loses
> nothing — the request and the worker never even have to be alive at the same time.

## 7. Senior-Level Insights

- **Delivery is at-least-once, not exactly-once.** A worker can crash after the email is
  sent but before it acks the job — so the job *will* be redelivered. The answer to "job
  runs twice" is always **idempotency**, not "it won't happen". Make the handler safe to
  run twice: guard with a unique check, a processed flag, or `ShouldBeUnique`.
- **Retry, backoff, timeout, idempotency, failed_jobs** — those five words are the whole
  resilience story. Say all five, in that order, and you've answered every failure question.
- **Backoff is exponential for a reason.** An API that's down at 10:00 is usually still down
  at 10:00:01. `$backoff = [1, 5, 10]` spreads attempts out; hammering a failing API with
  `--tries` and no backoff is a self-inflicted outage.
- **`$timeout` only works if the worker can enforce it** (`pcntl` installed). The worker
  kills the runaway job — but the external call still happened. Timeout is a guard against
  *leaks*, not a guarantee of *no side effect*.
- **`ShouldBeUnique` + `uniqueFor()`** is the built-in "don't enqueue a second copy while
  one is pending" tool — perfect for the duplicate-confirmation bug.
- **Horizon is not just a dashboard.** Its supervisors spawn and balance workers across
  queues, which is the production answer to "how do you keep `queue:work` alive?".
- **A long-running worker leaks memory.** PHP frees memory per request; a worker is one
  request that never ends. That's what `--max-jobs=1000` (restart the worker every 1000
  jobs) is for.

> [!DEEPDIVE]
> The `sync` connection runs the job *inside* the request. That makes local dev and tests
> deterministic — but it also means a `sync` queue is exactly the "send email in the
> request" behaviour you're trying to avoid. Production is `database` or `redis`; `sync` is
> a testing tool, not a deployment strategy.

## 8. Common Mistakes

**Mistake 1 — sending mail (or doing any slow I/O) directly in the controller.** The user
waits on SMTP, and a slow mail server becomes a slow site. The whole point of this lesson.

**Mistake 2 — catching and swallowing the exception.**

```php
public function handle(): void
{
    try {
        $this->api->send();
    } catch (Throwable $e) {
        Log::error($e);   // ❌ job now "succeeds" — never retried, never failed
    }
}
```

The retry machinery only sees an exception if you **rethrow**:

```php
public function handle(): void
{
    try {
        $this->api->send();
    } catch (Throwable $e) {
        Log::warning('webhook failed, will retry', ['id' => $this->id]);
        throw $e;   // ✅ rethrow so the worker can retry
    }
}
```

**Mistake 3 — assuming a job runs exactly once.** At-least-once delivery means your handler
must be idempotent. A retried `ChargeCard` job that charges twice is not a Laravel bug —
it's a missing duplicate guard.

**Mistake 4 — testing with `sync` and shipping on `database`.** The two behave differently
under load (ordering, concurrency, retries). Test the real driver in CI at least once.

**Mistake 5 — no `--max-jobs` on a memory-hungry worker.** Over days, the worker's memory
climbs until Supervisor restarts it mid-job. Restart it yourself, on your terms.

**Mistake 6 — timeouts shorter than the real work.** A job that legitimately takes 90
seconds with `$timeout = 30` will be killed and retried forever — a perpetual-motion bug.

## 9. Best Practices

✅ Dispatch first, do the side effect in the job — never the reverse

✅ Set `$tries` and `$backoff` on every job that touches the network

✅ Set `$timeout` slightly above the *worst legitimate* run

✅ Make handlers idempotent: a duplicate run must be a no-op

✅ Use `dispatch(...)->delay(now()->addMinutes(10))` for "later", not for "never"

✅ Keep job payloads tiny — pass IDs, not whole hydrated models

✅ Use named queues (`->onQueue('high')`) and one worker per queue when priority matters

✅ Restart workers (`--max-jobs` / Supervisor) to control memory

❌ Don't put non-queueable work in the request because "the queue is complex"

❌ Don't retry without backoff — you'll turn one failure into a thundering herd

❌ Don't log-and-swallow exceptions — you disable the entire retry system

## 10. Interview Questions

**Q1. Why don't you send email inside the request?**

> Because the request's contract is "return a response fast". SMTP can take seconds and
> fail. So the request persists the order, dispatches a job, and returns immediately. A
> worker process picks the job up later and does the slow work with all the retry
> machinery available. The user experience is a fast response; the email still gets sent.

**Q2. What happens if the worker crashes mid-job?**

> The job hasn't been acked, so it's still in the queue — at-least-once delivery. When a
> worker comes back (Supervisor restarts it), the job runs again. That's exactly why the
> handler must be idempotent: the re-run is normal, not a bug.

**Q3. What happens if the job runs twice?**

> The framework can't prevent it — a crash can happen between the side effect and the ack.
> The defence is idempotency: the job checks whether the work is already done before doing
> it again. For "don't even enqueue a second copy", there's `ShouldBeUnique`.

**Q4. The external API your job calls times out. What happens?**

> The job throws, the worker catches it, and since we're under `$tries` it releases the job
> back to the queue with a backoff delay — 1 s, then 5 s, then 10 s. If the API is still
> down after the last attempt, the job moves to `failed_jobs`. `$timeout` caps how long one
> run is allowed to hang before the worker kills it.

**Q5. Database queue vs Redis queue — which and why?**

> `database` is zero extra infrastructure: a `jobs` table, reliable, fine at low volume.
> `redis` is faster and scales better — Redis is a queue by nature — and it's required for
> Horizon's dashboard and balancing. Both are durable; `sync` runs inline and is only for
> tests and local dev.

**Q6. How does `php artisan queue:work` work?**

> It's a long-running process with an infinite loop: pop a job, run it, ack it on success,
> or on failure retry with backoff or move to `failed_jobs`. It blocks when the queue is
> empty. Because it never exits, production keeps it alive with Supervisor and restarts it
> every N jobs with `--max-jobs`.

**Senior follow-up: Design a job that calls a rate-limited third-party API.**

> Three knobs: `$backoff` for retry spacing, a per-minute throttle using
> `Redis::throttle(...)` with `release()` when over the limit, and `$timeout` so a hung
> call can't pin a worker. If the API gives 429s, I'd treat that as "retry with a longer
> delay", and I'd make the job idempotent so a retry can't double-charge. Let me show the
> throttle in section 13.

## 11. Follow-up Questions

**Does a worker process the queue in FIFO order?**

> A single worker on a single queue does — it pops from the head. Ordering breaks across
> queues, across multiple workers, and when `delay()` is involved. If order matters, use a
> **chain**, don't rely on luck.

**How do you run `queue:work` in production?**

> You don't — you run `php artisan horizon` (Redis only) or Supervisor watching
> `queue:work`. Supervisor restarts the worker when it dies, and it's how `--max-jobs` and
> `--max-time` workers stay alive across restarts.

**What's the difference between `dispatch` and `dispatchSync`?**

> `dispatch` enqueues for a worker. `dispatchSync` runs the job inline in the current
> process — effectively the `sync` connection. It's occasionally useful in tests, and it's
> the sign of a design smell when it appears in production controllers.

**How do you monitor queue health?**

> Watch the queue length (a growing `jobs` table is a stalled worker), alert on
> `failed_jobs` growth, and use Horizon's metrics — throughput, wait times, failures per
> job — when you're on Redis. A queue you can't see is a queue you don't trust.

## 12. Comparison Table

| | **`sync`** | **`database`** | **`redis`** |
|---|---|---|---|
| Runs where | In the request | Worker process | Worker process |
| Extra infra | None | A `jobs` table | A Redis server |
| Durability | n/a (never stored) | Yes — DB row | Yes — Redis is durable-ish (AOF) |
| Speed | n/a | Slowest (SQL per op) | Fastest |
| Use it for | Tests, local dev | Small/medium production | Production, Horizon, high volume |
| Retry/failed | n/a | ✅ | ✅ |

The three big job combinators:

| Tool | What it guarantees | When to use |
|---|---|---|
| **`->delay()`** | One job starts later | Reminders, "try again in a day" |
| **`Bus::batch()`** | A *group* runs; `then/catch/finally` callbacks | Fan-out that must all finish (or fail) together |
| **`Bus::chain()`** | Jobs run strictly one after another | Pipeline: process → optimize → release |

## 13. Code Example

A rate-limited job (the senior follow-up, concretely):

```php
class SyncContacts implements ShouldQueue
{
    public $tries = 5;
    public $backoff = [10, 30, 60, 120, 300];
    public $timeout = 90;

    public function __construct(public User $user) {}

    public function handle(): void
    {
        Redis::throttle('contacts:' . $this->user->id)
            ->allow(10)->every(60)                              // 10 calls / minute
            ->then(
                fn () => $this->user->provider()->pushContacts(), // under the limit
                fn () => $this->release(30)                       // over it: wait 30 s
            );
    }
}
```

What the throttle does to the timeline:

```text
attempt 1  at t=0s    → over limit → release(30)      backoff: 10s later
attempt 2  at t=10s   → over limit → release(30)      backoff: 30s later
attempt 3  at t=40s   → under limit → API called      10 calls allowed
...
attempt 5  at t=...   → still 429 → moves to failed_jobs (tries exhausted)
```

Now batching a shipment pipeline:

```php
Bus::batch([
    new ProcessOrder($order),
    new ChargeCard($order),
    new GenerateInvoice($order),
])->then(fn () => $this->notifyCustomer($order))
  ->catch(fn (Throwable $e) => Log::error('order batch failed', ['id' => $order->id]))
  ->finally(fn () => Cache::forget('orders:processing:' . $order->id))
  ->dispatch();
```

And a chain when order is a hard requirement:

```php
Bus::chain([
    new ProcessPodcast($podcast),
    new OptimizePodcast($podcast),
    new ReleasePodcast($podcast),
])->dispatch();
```

A batch needs the `job_batches` table and a chain needs nothing special — it's just queue
order enforced. Where does a failed job go? See it, audit it, retry it:

```text
$ php artisan queue:failed
+----+------------+---------+-------------+----------------------------+
| ID | Connection | Queue   | Class       | Failed At                  |
+----+------------+---------+-------------+----------------------------+
| 21 | database   | default | SendOrder.. | 2026-03-04 10:41:22        |
+----+------------+---------+-------------+----------------------------+

$ php artisan queue:retry 21        # back onto the queue
$ php artisan queue:flush           # clear the whole table when reviewed
```

Horizon setup, one process to rule the workers:

```text
$ composer require laravel/horizon
$ php artisan horizon:install
$ php artisan horizon          # long-running; supervise THIS with Supervisor
```

## 14. Performance Notes

- **The `database` driver is slow but honest.** Every pop/ack is SQL. Fine to ~thousands of
  jobs/day; past that, Redis wins on both latency and polling overhead.
- **Workers idle cheaply** — a blocked `pop` burns no CPU, but each extra worker still costs
  RAM and DB/Redis connections. Scale workers by queue length, not by instinct.
- **Polling vs blocking:** Redis blocking pops (`BRPOP`) scale better than `database`'s
  `SELECT ... FOR UPDATE SKIP LOCKED` polling at high throughput.
- **Long-running workers accumulate memory.** PHP wasn't built for this — `--max-jobs` and
  `--max-time` are the standard answer, not optional hygiene.
- **Throttling inside jobs is a self-protection feature** — without it, a 429 storm becomes
  a worker stampede and your own retries become the DDoS.
- **When it doesn't matter:** a site sending a handful of mails a day on `database` — the
  whole lesson still applies, but none of the tuning knobs will be the bottleneck.

## 15. Debugging Scenarios

**Scenario 1 — "my jobs never run."**

Check three things in order: the queue connection in use (`QUEUE_CONNECTION` env — if it's
`sync`, the job ran inline, you just never saw a worker), whether a worker is actually
running (`ps aux | grep queue:work`), and whether the queue name matches
(`--queue=high` on the worker vs `->onQueue('high')` on the job).

**Scenario 2 — "failed_jobs is growing and I don't know why."**

Run `php artisan queue:failed` and read the `exception` column — it stores the full stack
trace. The usual suspects: a job calling a service that needs auth, a model that was
deleted before the job ran (guard by ID, not by loaded object), and missing
`ShouldBeUnique` causing collisions.

**Scenario 3 — "the same email was sent twice."**

That's at-least-once delivery plus a non-idempotent handler. The worker crashed after the
send and before the ack. Fix: make `handle()` check "already sent?" before sending, or use
`ShouldBeUnique` so a duplicate isn't even enqueued while one is pending.

**Scenario 4 — "my worker's memory grows every day."**

Normal PHP would free it between requests; a worker never gets that reset. Restart it:
`queue:work --max-jobs=1000` under Supervisor, or Horizon's `auto` balancing with
`--max-time`. Then check the heaviest job for a held connection or a growing in-memory
cache.

## 16. Quick Revision Notes

- Request = schedule; worker = do; queue = the buffer between them
- `ShouldQueue` + `dispatch()` is the whole trigger
- `queue:work` is an infinite loop: pop → run → ack / retry / fail
- Retry, backoff, timeout, idempotency, failed_jobs — the five survival tools
- `$backoff = [1, 5, 10]` — exponential spacing; never retry without it
- `$timeout` guards a hung run; it can't undo a side effect
- Delivery is **at-least-once** → handlers must be idempotent
- `delay()` for later, `Bus::batch()` for fan-out, `Bus::chain()` for order
- `Redis::throttle()` inside jobs protects external APIs from your retries
- Horizon = dashboard + supervisors + balancing; Supervisor = keep `queue:work` alive
- `sync` is a testing driver, not a deployment strategy

## 17. Cheat Sheet

```text
# The flow
controller ──dispatch()──▶ queue (jobs table / Redis) ──pop──▶ worker ──handle()──▶ done
                                                                │ failure
                                                                ├─ under $tries → release + backoff
                                                                └─ exhausted   → failed_jobs

# Per-job config
class X implements ShouldQueue {
    public $tries = 3;              // attempts total
    public $backoff = [1, 5, 10];   // seconds between attempts
    public $timeout = 60;           // kill a run after 60 s
}

# Dispatch variants
X::dispatch($id);                                     // now
X::dispatch($id)->delay(now()->addMinutes(10));       // later
X::dispatch($id)->onQueue('high');                    // named queue
Bus::batch([...])->then(fn)->catch(fn)->finally(fn)->dispatch();   // fan-out
Bus::chain([...])->dispatch();                        // strict order

# Worker
php artisan queue:work --queue=high,default --max-jobs=1000 --tries=3

# Failure ops
php artisan queue:failed     # list
php artisan queue:retry 21   # requeue one
php artisan queue:flush      # clear all
php artisan horizon          # production: dashboard + supervisors
```

## 18. Key Takeaways

> [!RECAP]
> - Never do slow side effects in a request — dispatch a job and return
> - A queue is durable storage; the request and worker never need to overlap in time
> - `queue:work` is an infinite pop→run→ack/retry/fail loop, kept alive by Supervisor/Horizon
> - Retry, backoff, timeout, idempotency, failed_jobs answer every failure question
> - Delivery is at-least-once — idempotency is mandatory, not optional
> - `delay()` for later, batches for fan-out, chains for strict order
> - Throttle third-party calls from inside the job, or your retries become the attack
> - Horizon gives Redis queues a dashboard, supervisors, and balancing

## Check your understanding

Answer these without looking back.

1. Why is sending email in the request a bug? What is the contract a request must keep?
2. Trace a job from `dispatch()` to `failed_jobs`, naming every stop.
3. What does `queue:work` do when the queue is empty? When a job throws on attempt 2 of 3?
4. What happens if the worker crashes after the side effect but before the ack? What property
   of the handler saves you?
5. Difference between `delay()`, `Bus::batch()`, and `Bus::chain()` — with one use each.
6. Why does exponential backoff exist, and what does `Redis::throttle()` add on top of it?
7. What is `--max-jobs` for, and why does a PHP worker leak memory in the first place?
8. When would you pick `database` over `redis` for the queue connection?

## What's Next

**Lesson 125 — Events, Listeners & Observers.** Dispatching a job is "do this work";
events are "this happened". Decouple your app the way Laravel intends — and learn when a
model-lifecycle observer beats both.
