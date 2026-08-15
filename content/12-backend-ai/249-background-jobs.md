# Lesson 249 — Background Jobs & Workers

**Interview importance:** ⭐⭐⭐⭐⭐ — "where does the long AI work run?" — the answer is *background jobs*: the worker pool processing the queues — the standard pattern for the long-running AI work (L222, L245).**

L245's consumers are this lesson: **background jobs & workers** — the standard pattern for the long-running AI work (L249): the job is enqueued (L245), the worker pool (L249) processes it off the request path (L222). The design: the job's definition (L249), the worker pool (L249), the concurrency (L249), and the observability (L213) — the engine room (L222) made concrete (L249).

The distinction this lesson is built on: a **demo** awaits the long work. A **solutions architect** designs the background path: the job (L249), the queue (L245), the worker pool (L249), the retries (L169), and the observability (L213) — because the AI work is slow (L151) and the request path must stay fast (L222).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the pattern: the job enqueued, the worker processes (L249)
- Explain the job: the definition and the state (L249)
- Explain the worker pool: the concurrency and the scale (L249)
- Explain the retries and the DLQ (L169, L232)
- Explain the observability: the job's lifecycle (L213)

## 1. One-Line Definition

**Background jobs and workers are the standard pattern for the long-running AI work (L249) — the job is enqueued (L245), the worker pool (L249) processes it off the request path (L222), with the job's definition and state (L249), the concurrency control (L249), the retries (L169) and the DLQ (L232), and the observability of the job's lifecycle (L213) — the engine room (L222), made concrete (L249).**

The one-sentence interview answer: *"Background jobs are the standard pattern for the long AI work (L249). The flow: the request enqueues the job (L245) and returns fast (L222); the worker pool (L249) picks it up and processes it off the request path (L249). The design has five parts (L249). The job — the definition: the type, the payload, and the state (L249): the job's progress, persisted (L207). The worker pool — the concurrency (L249): N workers processing in parallel (L222), the pool sized to the workload (L249). The retries — the failures retry with the backoff (L169), bounded (L169). The DLQ — the poison jobs (L232) with the alert (L208). And the observability — the job's lifecycle traced (L213): enqueued, running, done, failed (L332). The AI work — the generations (L145), the workflows (L217), the agents (L200) — is the background job's natural load (L249)."*

## 2. Mental Model

Think of the background workers as **the night shift at the factory.** The day shift (the request path, L222) takes the orders and drops them in the order bin (the queue, L245); the night shift (the worker pool, L249) processes them off the day's floor (off the request path, L222). The night shift has a crew (the pool's concurrency, L249): several workers, each taking an order (L245). Each order has a tag (the job's state, L249) — "in progress", "done", "failed" — tracked on the wall (the observability, L213). The orders that fail are retried (L169), then moved to the problem bin (the DLQ, L232). The factory works because the day shift drops, the night shift processes, and the tags tell the story (L249).

```text
   the night shift (the worker pool, L249)
   ┌────────────────────────────────────────────────────────┐
   │ the orders (the jobs, L249) · the bin (the queue, L245)│
   │ the crew (the concurrency, L249)                       │
   │ the tags (the state, L249) · the wall (the trace, L213)│
   └────────────────────────────────────────────────────────┘
```

The mental model is **the night shift**: the orders, the crew, the tags, and the wall — off the day's floor (L249).

## 3. Visual Flow — The Job's Lifecycle

```text
   the work is enqueued (L222)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE JOB (L249)                                       │
   │     the definition: type, payload, state (L249)          │
   │     the state persisted (L207)                           │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE WORKER POOL (L249)                               │
   │     N workers process in parallel (L222)                 │
   │     the concurrency sized to the workload (L249)         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE OUTCOMES (L169, L232)                            │
   │     success → done (L249)                                │
   │     failure → retry (L169) → the DLQ (L232)              │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the trace (L213) — enqueued, running, done, failed (L332)
```

The flow is the lifecycle: **enqueue → process → done/retry/DLQ** — with the trace (L249).

## 4. How It Works — The Job, the Pool, the Outcomes

- **The job (L249).** The definition: the type, the payload, and the state (L249) — the progress persisted (L207): the job's state is the durable record (L207).
- **The worker pool (L249).** The concurrency (L249): N workers processing the queue in parallel (L222) — the pool sized to the workload and the provider's limits (L170).
- **The retries (L169).** The failures retry with the backoff (L169), bounded (L169) — the transient failures (L168) absorbed (L249).
- **The DLQ (L232).** The poison jobs — the retries exhausted (L232) — land in the DLQ (L232) with the alert (L208) and the replay (L245).
- **The observability (L213).** The job's lifecycle traced (L213): enqueued, running, done, failed (L332) — the job's status and the cost (L213).

> [!NOTE]
> **The job's state is the durable record — the queue is the transport (L207, L249).** The queue (L245) moves the job; the job's state (L249) is where the truth lives (L207): the progress, the results, and the errors — persisted (L207). The senior design treats the job as a stateful entity (L249): the queue holds the reference (L245), the state holds the record (L207), and the trace (L213) holds the story — so a job can resume (L207), be replayed (L232), and be audited (L322).

## 5. Real Project Usage

- **The generation jobs (L145).** The image or the batch generation (L145) enqueued (L245) — the worker pool (L249) processes, the webhook (L220) returns the result.
- **The workflow runs (L217).** The automation's workflows (L217) as the jobs (L249) — the L230 engine room (L230).
- **The agent runs (L200).** The long agent loops (L200) as the jobs (L249) — the checkpointed state (L207) in the job (L249).
- **The ingestion (L176).** The embedding batches (L181) as the jobs (L249) — the workers process in parallel (L222).
- **Anything long (L260).** The background jobs (L249) are the L260 platform's engine room (L260) — the standard pattern for the long AI work (L249).

The through-line: **the night shift** — the jobs, the worker pool, and the lifecycle, carrying the long AI work off the request path (L249).

## 6. Interview Explanation

Say it in four moves:

1. **The pattern.** "The job enqueued (L245), the worker processes (L249) — off the request path (L222)."
2. **The job.** "The definition, the payload, and the persisted state (L249)."
3. **The pool.** "The concurrency (L249) — N workers, sized to the load (L222)."
4. **The outcomes.** "The retries (L169), the DLQ (L232), and the trace (L213)."

## 7. Senior-Level Insights

- **The request path is the user's experience (L222).** The senior answer enqueues the long work (L245) — the request returns fast (L151), the worker processes (L249).
- **The job is a stateful entity (L249).** The senior design persists the job's state (L207): the progress, the results, and the errors (L249) — the resume (L207) and the replay (L232) enabled (L249).
- **The pool is the concurrency control (L249).** The worker count (L249) sized to the workload and the provider's rate limits (L170) — the throughput dial (L249).
- **The trace is the job's story (L213).** The lifecycle (L213): enqueued, running, done, failed (L332) — the debugging (L211) and the audit (L322) read it (L249).
- **The DLQ is the ops story (L232).** The poison (L232), the alert (L208), and the replay (L245) — the job's failure path (L249).

## 8. Common Mistakes

- **The long work in the request (L222).** The user awaits the generation (L151) — the background pattern (L249) skipped.
- **The job stateless (L249).** No persisted state (L207) — the resume (L207) and the replay (L232) impossible (L249).
- **The pool unbounded (L249).** The workers hammering the provider (L170) — the concurrency (L249) unsized (L249).
- **No retries (L169).** The transient failure (L168) kills the job (L169) — the retry policy (L169) missing (L249).
- **No DLQ (L232).** The poison blocks the queue (L232) — the failure catcher (L245) missing (L249).
- **The jobs unobserved (L213).** The lifecycle invisible (L213) — the debugging (L211) and the audit (L322) blind (L249).

## 9. Best Practices

- **Enqueue the long work** (L245) — the request path fast (L222).
- **Persist the job's state** (L207) — the durable record (L249).
- **Size the pool** (L249) — to the workload and the provider's limits (L170).
- **Design the retries** (L169) — the backoff, bounded (L169).
- **Include the DLQ** (L232) — the poison, the alert (L208), the replay (L245).
- **Trace the lifecycle** (L213) — enqueued, running, done, failed (L332).

## 10. Interview Questions

**Q: What are background jobs?**
> A: The standard pattern for the long AI work (L249). The request enqueues the job (L245) and returns fast (L222); the worker pool (L249) processes it off the request path (L249). The job has a definition — the type, the payload, the state (L249) — persisted (L207); the failures retry (L169); the poison lands in the DLQ (L232); and the lifecycle is traced (L213).

**Q: Why not run the long work in the request?**
> A: Because the user's experience is the request (L222). A generation takes seconds (L145) — the user awaits it (L151), and a failure retries against the request (L168). The background pattern moves the work off the request path (L222): the request enqueues and returns (L151), and the worker processes with the retries (L169), the DLQ (L232), and the trace (L213) (L249).

**Q: How do you size the worker pool?**
> A: The concurrency is the throughput dial (L249). The pool is sized to the workload — the queue's depth (L332) — and the provider's rate limits (L170): N workers that the provider can serve without the 429s (L170). The pool scales with the demand (L222), bounded by the provider's limits (L249).

**Q: What's the job's state for?**
> A: The durable record (L249). The queue (L245) is the transport; the job's state (L249) is the truth (L207): the progress, the results, and the errors — persisted (L207). The state enables the resume (L207) — a crashed job continues from its checkpoint (L207) — and the replay (L232). The job is a stateful entity (L249), not just a message (L245).

## 11. Follow-Up Questions

- What's the job's definition (L249)?
- How do you size the pool (L249)?
- What's the retry policy (L169)?
- What's the DLQ's role (L232)?
- What does the trace record (L213)?

## 12. Comparison Table — In-Request vs Background

| | In-request (L222) | Background (this lesson) |
|---|---|---|
| The response (L151) | waits | fast — enqueued (L222) |
| The state (L207) | none | persisted (L249) |
| The retries (L169) | against the user | the backoff (L169) |
| The concurrency (L249) | the request's thread | the worker pool (L249) |
| The DLQ (L232) | — | the poison catcher (L232) |
| The trace (L213) | the request | the job's lifecycle (L332) |

The senior read: **the right column is the engine room** — the long AI work carried off the request path (L249).

## 13. Code Example — The Background Job

```js
// Background jobs: the job, the pool, the lifecycle (L249).
// THE JOB (L249) — the definition and the state (L207).
const job = {
  id: crypto.randomUUID(),
  type: 'generate',
  payload: { prompt, model },
  state: { status: 'enqueued', progress: 0, result: null, error: null },  // L207
};
await jobs.save(job);                                  // the durable state (L207)
await queue.enqueue({ jobId: job.id });                // the transport (L245)

// THE WORKER POOL (L249) — the concurrency (L222).
async function worker() {
  const { jobId } = await queue.dequeue();             // L245
  const job = await jobs.load(jobId);
  try {
    job.state.status = 'running';
    await jobs.save(job);                              // the state (L207)
    job.state.result = await generate(job.payload);    // the AI work (L145)
    job.state.status = 'done';
  } catch (e) {
    job.state.error = String(e);
    await retryOrDeadLetter(job, e);                   // L169, L232
  }
  await jobs.save(job);                                // the durable record (L249)
  await trace.log({ jobId: job.id, status: job.state.status, cost });  // L213
}

// THE POOL (L249) — N workers, sized to the load (L170).
for (let i = 0; i < WORKER_COUNT; i++) spawn(worker);
```

```text
What the reader must SEE — the night shift:

  jobs.save(job)          → the durable state (L207)
  queue.enqueue           → the transport (L245)
  job.state.status        → the lifecycle (L249)
  retryOrDeadLetter       → the failure story (L169, L232)
  trace.log               → the observability (L213)

  The day shift drops; the night shift processes; the wall tells the story.
```

```narrate
3-9: The job — the definition and the persisted state (L207, L249).
10-11: The enqueue — the transport (L245), the state already saved (L207).
13-20: The worker — the state transitions to running, the work (L145), then done (L249).
21-24: The failures — the retry or the dead letter (L169, L232).
25-27: The durable record and the trace (L207, L213).
29-30: The pool — N workers, sized to the load (L249).
```

> [!TIP]
> The pair that defines the pattern: **`jobs.save(job)`** (the durable state, L207) beside **`queue.enqueue`** (the transport, L245). **The queue moves the job; the state is the truth — and the night shift tells the story on the wall (L249).**

## 14. Performance Notes

- **The enqueue is the latency lever (L151).** The request enqueues and returns (L222) — the user's experience is the enqueue time (L249).
- **The pool is the throughput dial (L249).** The worker count (L249) — the concurrency (L222) bounded by the provider (L170).
- **The state writes are the durability's cost (L150).** The persisted state (L207) — the writes (L119) are the resume's (L207) and the audit's (L322) price (L249).
- **The trace is the observability (L213).** The lifecycle (L213) — the debugging (L211) and the cost attribution (L332) read the same record (L249).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The user waits | The work in the request (L222) | The enqueue (L245) |
| The job can't resume | No state (L207) | The persisted state (L249) |
| The provider 429s | The pool too big (L170) | The concurrency (L249) |
| The job dies once | No retries (L169) | The backoff (L169) |
| The queue blocked | No DLQ (L232) | The failure catcher (L245) |

## 16. Quick Revision Notes

- Background jobs = **the standard pattern for the long AI work** (L249).
- The flow: **enqueue (L245) → the worker pool (L249) → done/retry/DLQ**.
- The job: **the definition + the persisted state** (L249, L207).
- The pool: **the concurrency, sized to the load** (L249, L170).
- The failures: **the retries (L169), the DLQ (L232)**.
- The observability: **the lifecycle (L213) — enqueued, running, done, failed (L332)**.

## 17. Cheat Sheet

```text
BACKGROUND JOBS & WORKERS = the engine room, made concrete

THE PATTERN (L249)
  the request enqueues (L245) and returns fast (L222)
  the worker pool (L249) processes off the request path (L249)

THE JOB (L249)
  the definition — the type, the payload (L249)
  the state — the progress, the results, the errors (L249)
  persisted (L207) — the durable record (L249)
  the queue is the transport; the state is the truth (L207)

THE POOL (L249)
  N workers, the concurrency (L222)
  sized to the workload and the provider's limits (L170)

THE OUTCOMES (L169, L232)
  the retries — the backoff, bounded (L169)
  the DLQ — the poison (L232), the alert (L208), the replay (L245)

THE OBSERVABILITY (L213)
  the lifecycle — enqueued, running, done, failed (L332)
  the debugging (L211) and the audit (L322) read the record

INTERVIEW, 4 MOVES
  1 pattern  "enqueue, worker pool, off the request path (L249)"
  2 job      "the definition + the persisted state (L207)"
  3 pool     "the concurrency, sized to the load (L249)"
  4 outcomes "retries (L169), DLQ (L232), trace (L213)"
```

## 18. Key Takeaways

> [!RECAP]
> - Background jobs and workers are **the standard pattern for the long AI work** (L249): the job is enqueued (L245), and the worker pool (L249) processes it off the request path (L222)
> - **The job is a stateful entity** (L249): the definition, the payload, and the persisted state (L207) — the progress, the results, and the errors (L249) — the durable record (L207)
> - **The worker pool is the concurrency control** (L249) — N workers, sized to the workload and the provider's rate limits (L170)
> - **The failures retry** (L169) with the backoff (L169), and the poison lands in the DLQ (L232) with the alert (L208) and the replay (L245)
> - **The lifecycle is traced** (L213) — enqueued, running, done, failed (L332) — serving the debugging (L211) and the audit (L322)
> - The engine room (L222) made concrete (L249): **the queue is the transport, and the job's state is the truth** (L207)

## Check your understanding

Answer these without looking back.

1. What's the background pattern (L249)?
2. What's in the job's definition (L249)?
3. Why is the state persisted (L207)?
4. How do you size the pool (L249)?
5. What's the retry policy (L169)?
6. What's the DLQ's role (L232)?
7. What does the trace record (L213)?
8. Why is the queue the transport, not the truth (L207)?

## A Closing Note — The Night Shift

You now hold the engine room: **the job with its durable state, the worker pool with its concurrency, the retries and the DLQ, and the lifecycle on the wall.** The long AI work now runs on the night shift — off the request path, with a story told (L249).

Next: the live channel — WebSockets (L250), bidirectional channels for the live AI features.
