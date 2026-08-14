# Lesson 222 — Queues & Background Workers for AI

**Interview importance:** ⭐⭐⭐⭐⭐ — "where do LLM calls run?" — the answer is *the queue*: never in a request — enqueue the work, the worker processes it, with retries (L169) and dead letters (L232).**

L220–221 handed work to the queue; this lesson is **the queue itself**: queues & background workers for AI — where the LLM calls (L145) and the workflows (L217) actually run. The rule: **LLM calls are slow; never run them in a request** (L222) — the request enqueues (L220), the worker dequeues and processes (L222), with retries (L169) and dead letters (L232). The queue is the L230 platform's engine room (L230).

The distinction this lesson is built on: a **demo** awaits the model call in the request. A **solutions architect** designs the async path: the queue (L222), the workers (L222), the retry policy (L169), the dead-letter queue (L232), and the idempotency (L255) — because LLM work is slow (L151) and failure-prone (L211), and the request path must stay fast (L222).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the rule: LLM calls never run in a request (L222)
- Design the queue: enqueue, dequeue, workers (L222)
- Design the retry policy: backoff, max retries (L169)
- Design the dead-letter path: poison jobs, alerts (L232)
- Explain the idempotency and the observability (L255, L213)

## 1. One-Line Definition

**Queues and background workers are the engine room of the L230 platform — the rule is "LLM calls are slow, never run them in a request" (L222): the request enqueues the work (L220), the worker dequeues and processes it (L222), with a retry policy (L169), a dead-letter queue for the poison jobs (L232), and idempotency (L255) — because AI work is slow (L151) and failure-prone (L211), and the request path must stay fast (L222).**

The one-sentence interview answer: *"The rule: LLM calls never run in a request (L222). A model call takes seconds (L145) — a request awaiting it blocks the user (L151). So the path is the queue: the request enqueues the work (L220) and returns fast; a worker dequeues and processes it (L222) — running the model (L145), the workflow (L217), or the agent loop (L200). The queue's design has four parts (L222). The retry policy — failed jobs retry with exponential backoff (L169), bounded by max retries (L169). The dead-letter queue — the poison jobs land there, with an alert (L232). The idempotency — a retried job is safe to re-run, keyed by the job ID (L255). And the observability — the queue depth, the worker health, the failure rate (L213). The queue is what makes the AI work asynchronous — and the request path fast (L222)."*

## 2. Mental Model

Think of the queue as **the in-tray between the front desk and the back office.** The front desk (the request path, L222) takes the request and drops it in the in-tray (the queue, L222) — the customer leaves immediately, happy (fast response, L151). The back office (the workers, L222) picks up the jobs, one at a time, and does the slow work — the model calls (L145), the workflows (L217). The office has rules: a job that fails is put back in the tray with a delay (retry, L169); a job that keeps failing goes to the special tray (the dead-letter queue, L232) where a supervisor looks at it (alert, L232). The front desk is fast because the back office is a queue (L222).

```text
   the front desk (request, L222)     the back office (workers, L222)
   ┌──────────────────────┐           ┌──────────────────────────────┐
   │ request → enqueue    │ ────────► │ worker → the model call      │
   │ → return fast (L151) │           │ (L145) → the workflow (L217) │
   └──────────────────────┘           │ retry on failure (L169)      │
       the in-tray (L222)             │ dead-letter the poison (L232)│
                                      └──────────────────────────────┘
```

The mental model is **the in-tray**: the front desk drops and leaves; the back office works the tray with retries and a special tray for the poison (L222).

## 3. Visual Flow — One Job Through the Queue

```text
   a request arrives (L222)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · ENQUEUE (L220)                                       │
   │     the job is written to the queue → the request        │
   │     returns (fast, L151)                                 │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · DEQUEUE (L222)                                       │
   │     a worker picks up the job (L222)                     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · PROCESS (L217)                                       │
   │     the model call (L145), the workflow (L217), the      │
   │     agent loop (L200) — the slow work                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE OUTCOMES (L169, L232)                            │
   │     success → ack · failure → retry (backoff, L169)      │
   │     retries exhausted → the dead-letter queue (L232)     │
   └──────────────────────────────────────────────────────────┘
```

The flow is the async path: **enqueue → dequeue → process → ack/retry/dead-letter** — the back office's rhythm (L222).

## 4. How It Works — The Queue, the Workers, the Policies

- **The rule (L222).** LLM calls are slow (L145) and failure-prone (L211) — the request path never awaits them (L222). The request enqueues (L220) and returns (L151).
- **The queue (L222).** The in-tray: a durable queue (L245) holding the jobs — the workflows (L217), the model calls (L145), the agent loops (L200). The queue is the buffer between the fast front desk and the slow back office (L222).
- **The workers (L222).** The processes that dequeue and process (L222): a worker picks up a job, runs the work (L217), and acks it (L222). The workers scale with the load (L222).
- **The retry policy (L169).** A failed job retries with exponential backoff (L169), bounded by max retries (L169) — the retry policy is sized for the provider's limits (L170) and the transient failures (L168).
- **The dead-letter queue (L232).** The poison jobs — retries exhausted (L232) — land in the DLQ (L245), with an alert (L232) and a manual or automated review path (L232).
- **The idempotency (L255).** A retried job re-runs safely (L255) — keyed by the job ID (L255), the side effects are deduplicated (L255).

> [!NOTE]
> **The queue is what makes the AI work *asynchronous* — and the request path *fast* (L222).** The model call takes seconds (L145) — inside a request, that's the user waiting (L151); behind a queue, it's background work (L222). But the async path has its own discipline: the retry policy (L169) sized for the model's failures (L168), the dead-letter queue for the poison (L232), the idempotency for the re-runs (L255), and the observability (L213) for the queue's health. The senior design treats the queue as the platform's engine room (L230) — the request path is the front desk, and the engine room runs the AI (L222).

## 5. Real Project Usage

- **Workflow runs (L217).** The webhook (L220) enqueues the workflow (L217); the worker runs it (L222) — the request returned 200 already (L151).
- **Batch AI (L221).** The scheduled digest (L221) enqueues the batch job (L222); the workers process the summarization (L163).
- **Agent runs (L200).** A long agent loop (L200) runs in a worker (L222) — the request gets the job ID, the client polls or the webhook returns (L220).
- **Embedding pipelines (L176).** The ingestion (L176) enqueues the embedding jobs (L181); the workers embed in parallel (L222).
- **Anything slow (L230).** The queue is the L230 platform's engine room (L230) — every slow AI operation runs through it (L222).

The through-line: **the queue is the engine room** — the async home of every slow AI operation, with the retries, dead letters, and idempotency that make it production (L222).

## 6. Interview Explanation

Say it in four moves:

1. **The rule.** "LLM calls are slow (L145) — never in a request (L222). The request enqueues and returns (L151)."
2. **The path.** "Enqueue → dequeue → process (L217) → ack (L222)."
3. **The policies.** "Retry with backoff (L169), dead-letter the poison (L232), idempotent by the job ID (L255)."
4. **The observability.** "Queue depth, worker health, failure rate (L213) — the engine room is watched (L230)."

## 7. Senior-Level Insights

- **The request path is the user's experience (L222).** The senior answer protects the request path (L151) — the queue is the design that keeps the UI fast while the AI works (L222).
- **The retry policy is sized for the provider (L169).** Exponential backoff (L169) respects the rate limits (L170) and the transient failures (L168) — the policy composes with L169–170 (L222).
- **The DLQ is the failure surface's catcher (L232).** The poison jobs (L232) are the L211 failures that retries can't fix (L168) — the DLQ (L245) with the alert (L232) is the last line (L222).
- **Idempotency is the async correctness (L255).** A retried job re-runs safely (L255) — the side effects are deduplicated by the job ID (L255). Without it, the retry (L169) double-applies (L255).
- **The queue's observability is the platform's health (L213).** The depth, the failure rate, the worker lag (L213) — the engine room's gauges (L332) are the platform's early warning (L230).

## 8. Common Mistakes

- **The model call in the request (L222).** The user awaits the seconds (L151) — the rule broken (L222).
- **No retry policy (L169).** A transient failure (L168) kills the job (L222) — the backoff (L169) missing.
- **No DLQ (L232).** The poison job retries forever (L232) — the queue blocked (L222).
- **Non-idempotent jobs (L255).** The retried job double-applies (L255) — the job ID key missing (L255).
- **No observability (L213).** The queue's depth and failures invisible (L213) — the platform's health ungauged (L230).
- **The queue as an afterthought (L230).** The async path bolted on (L230) — the engine room designed after the house (L222).

## 9. Best Practices

- **Enqueue, never await** (L222) — the request path stays fast (L151).
- **Design the retry policy** (L169) — backoff (L169) sized for the provider (L170).
- **Dead-letter the poison** (L232) — with an alert and a review path (L222).
- **Key the jobs by ID** (L255) — idempotent re-runs (L255).
- **Watch the engine room** (L213) — depth, failure rate, worker lag (L332).
- **Scale the workers** (L222) — the queue absorbs the bursts (L151).

## 10. Interview Questions

**Q: Where do LLM calls run?**
> A: Never in a request (L222). A model call takes seconds (L145) — inside a request, that's the user waiting (L151). The path: the request enqueues the work (L220) and returns fast; a worker dequeues and processes it (L222) — the model call (L145), the workflow (L217), the agent loop (L200). The queue is the async home of the AI work (L222).

**Q: How do you handle failed jobs?**
> A: The retry policy (L169) and the dead-letter queue (L232). A failed job retries with exponential backoff (L169), bounded by max retries (L169) — sized for the provider's rate limits (L170) and the transient failures (L168). When the retries are exhausted, the job lands in the DLQ (L232) with an alert and a review path (L245). The poison jobs are caught, not retried forever (L222).

**Q: Why must the jobs be idempotent?**
> A: Because retries re-run the job (L255). The retry policy (L169) is safe only if the retried execution is safe to repeat (L255) — the side effects are deduplicated by the job ID (L255). Without idempotency, a retried job double-applies — double refunds, double writes (L255). The retry policy and the idempotency are one design (L222).

**Q: How do you watch the queue?**
> A: The engine room's gauges (L213): the queue depth (is the backlog growing?), the failure rate (are the jobs failing?), and the worker lag (are the workers keeping up?) (L332). The observability (L213) is the platform's early warning — a growing depth or a rising failure rate is the alert that something upstream broke (L230).

## 11. Follow-Up Questions

- How does the retry policy compose with L169–170?
- What lands in the DLQ (L232)?
- How do the workers scale (L222)?
- How does idempotency work by job ID (L255)?
- How do you observe the queue (L213)?

## 12. Comparison Table — In-Request vs Queued

| | In-request (L222) | Queued (this lesson) |
|---|---|---|
| Response (L151) | the user waits | fast — the job is enqueued (L220) |
| Retries (L169) | none | backoff, bounded (L169) |
| Poison jobs (L232) | fail the request | the DLQ (L232) |
| Idempotency (L255) | n/a | by the job ID (L255) |
| Scale (L222) | the request's thread | workers scale (L222) |
| Observability (L213) | request logs | depth, failures, lag (L332) |

The senior read: **the right column is the engine room** — the async path that keeps the front desk fast (L222).

## 13. Code Example — The Queue Path

```js
// The queue: enqueue → worker → retry → DLQ (L222, L169, L232).
// ENQUEUE — the request path stays fast (L220, L151).
export async function POST(req) {
  const job = { id: crypto.randomUUID(), type: 'workflow.run', payload: body };
  await queue.enqueue(job);                    // the in-tray (L222)
  return Response.json({ jobId: job.id });     // fast (L151)
}

// THE WORKER (L222) — the back office.
async function worker() {
  for (const job of await queue.dequeue()) {
    try {
      await processJob(job);                   // the workflow (L217)
      await queue.ack(job.id);                 // done (L222)
    } catch (e) {
      // RETRY (L169) — backoff, bounded.
      const attempts = job.attempts + 1;
      if (attempts <= MAX_RETRIES) {
        await queue.enqueue({ ...job, attempts }, { delay: backoff(attempts) });  // L169
      } else {
        await deadLetter(job, e);              // the poison tray (L232, L245)
        await alert('job failed: ' + job.id);  // the supervisor (L232)
      }
    }
  }
}

// IDEMPOTENCY (L255) — the side effects key on the job ID.
async function processJob(job) {
  if (await alreadyProcessed(job.id)) return;  // the re-run is a no-op (L255)
  await runWorkflow(job.payload);              // L217
  await markProcessed(job.id);                 // the key (L255)
}
```

```text
What the reader must SEE — the engine room's four parts:

  queue.enqueue(job)      → the fast request path (L220, L151)
  retry + backoff         → the L169 policy (L169)
  deadLetter + alert      → the DLQ (L232, L245)
  alreadyProcessed(job.id)→ the idempotency (L255)

  The front desk drops; the back office works; the poison is caught.
```

```narrate
4-8: The enqueue — the request returns fast with the job ID (L220, L151, L222).
11-16: The worker — dequeue, process the workflow (L217), and ack (L222).
18-25: The retry — exponential backoff (L169), bounded by max retries (L169).
26-28: The DLQ — the poison job is dead-lettered (L232) and alerted (L245).
31-36: The idempotency — the re-run is a no-op, keyed by the job ID (L255).
```

> [!TIP]
> The pair that makes the async path correct: **`backoff(attempts)`** (the retry policy, L169) and **`alreadyProcessed(job.id)`** (the idempotency, L255). **Retries re-run; idempotency makes the re-run safe — the engine room's two guards (L222).**

## 14. Performance Notes

- **The request path is the latency win (L151).** Enqueue and return — the user's experience is the enqueue time, not the model's (L222).
- **The workers scale with the load (L222).** The queue absorbs the bursts (L151) — the workers (L222) are the throughput control (L222).
- **The retries are the provider's courtesy (L169).** Backoff (L169) respects the rate limits (L170) — the retry policy and the limits compose (L222).
- **The queue is the observability's source (L213).** Depth and failures (L332) — the gauges of the engine room (L230).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Slow requests | The model in the request (L222) | Enqueue + worker (L151) |
| Jobs die once | No retry policy (L169) | Add backoff (L169) |
| The queue blocked | No DLQ (L232) | Dead-letter + alert (L245) |
| Double side effects | Non-idempotent jobs (L255) | Key by the job ID (L255) |
| Growing backlog | Worker lag (L213) | Scale the workers (L222) |

## 16. Quick Revision Notes

- The rule: **LLM calls never run in a request** (L222).
- The path: **enqueue (L220) → worker (L222) → process (L217) → ack**.
- The retry policy: **backoff (L169), bounded** (L169).
- The DLQ: **poison jobs (L232), alerted** (L245).
- Idempotency: **keyed by the job ID** (L255).
- The observability: **depth, failures, lag** (L213, L332).

## 17. Cheat Sheet

```text
QUEUES & WORKERS = the engine room of the L230 platform

THE RULE (L222)
  LLM calls are slow (L145) — never in a request (L151)
  the request enqueues (L220) and returns fast

THE PATH (L222)
  enqueue → dequeue → process (L217) → ack
  the front desk drops; the back office works

THE POLICIES (L169, L232, L255)
  retry        exponential backoff (L169), bounded (L169)
               sized for the provider's limits (L170)
  dead letter  the poison jobs (L232) — DLQ (L245) + alert (L232)
  idempotency  keyed by the job ID (L255) — re-runs are no-ops

THE OBSERVABILITY (L213, L332)
  queue depth · failure rate · worker lag — the gauges (L213)
  a growing backlog is the early warning (L230)

THE RULE OF THUMB
  the queue is what makes AI work asynchronous
  and the request path fast (L222)

INTERVIEW, 4 MOVES
  1 rule    "never in a request — enqueue and return (L222)"
  2 path    "enqueue → worker → process → ack (L217)"
  3 policies "retry (L169) · DLQ (L232) · idempotency (L255)"
  4 gauges  "depth, failures, lag (L213, L332)"
```

## 18. Key Takeaways

> [!RECAP]
> - **The rule: LLM calls never run in a request** (L222) — the request enqueues (L220) and returns fast (L151); the worker processes the model call (L145), the workflow (L217), or the agent loop (L200)
> - **The queue is the engine room** (L222) — the async home of every slow AI operation, with the workers as the throughput control (L222)
> - **The retry policy** (L169): exponential backoff (L169), bounded (L169), sized for the provider's limits (L170)
> - **The dead-letter queue** (L232): the poison jobs — retries exhausted — are caught, alerted, and reviewed (L245)
> - **Idempotency is the async correctness** (L255): retried jobs re-run safely, keyed by the job ID (L255)
> - **The queue's gauges** (L213): depth, failure rate, and worker lag (L332) are the platform's early warning (L230)

## Check your understanding

Answer these without looking back.

1. Why do LLM calls never run in a request (L222)?
2. What's the queue path (L222)?
3. How does the retry policy work (L169)?
4. What lands in the DLQ (L232)?
5. Why is idempotency the async correctness (L255)?
6. How do the workers scale (L222)?
7. What are the queue's gauges (L213)?
8. Why is the queue the engine room (L230)?

## A Closing Note — The Engine Room That Keeps the Front Desk Fast

You now hold the async path: **enqueue and return, workers that process, retries that respect the provider, a DLQ for the poison, and idempotency that makes every re-run safe.** The AI work now runs in the engine room — and the request path stays fast (L222).

Next: the highest-ROI integration — AI + CRM (L223), lead scoring, enrichment, and follow-up.
