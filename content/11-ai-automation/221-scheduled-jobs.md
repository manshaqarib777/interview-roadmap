# Lesson 221 — Scheduled Jobs & Cron for AI

**Interview importance:** ⭐⭐⭐⭐ — "how do you run AI work on a schedule?" — the answer is *scheduled jobs*: cron triggers, the batch shapes (digests, reports, syncs), and the timing discipline (L222).**

L220 gave you the event trigger; this lesson is the **time trigger**: scheduled jobs & cron for AI — running batch AI work on a schedule: daily digests (L224), weekly reports (L223), nightly syncs (L176). The trigger is cron (L221): the schedule expression (L217's trigger node, L220's sibling), the job runs the workflow (L217), and the discipline is the same as events — idempotency (L255), the queue handoff (L222), and the failure story (L232).

The distinction this lesson is built on: a **demo** has a cron that runs a script. A **solutions architect** designs the scheduled path: the schedule's shape (digests, reports, syncs — L221), the trigger → queue → workflow path (L222), the idempotency for the run window (L255), and the recovery for the missed runs (L232).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain scheduled jobs: cron triggers for batch AI work (L221)
- Name the batch shapes: digests, reports, syncs (L221)
- Design the scheduled path: trigger → queue → workflow (L222)
- Explain the timing discipline: timezone, skew, missed runs (L221)
- Explain the recovery: idempotent runs, backfill, dead letters (L232)

## 1. One-Line Definition

**Scheduled jobs and cron for AI are the time trigger of the workflow — a cron expression fires the batch shapes (digests, reports, syncs, L221), the run goes through the trigger → queue → workflow path (L222), and the discipline is the same as events: idempotent runs (L255), a designed timezone and skew story (L221), and recovery for the missed runs (L232).**

The one-sentence interview answer: *"Scheduled jobs are the time trigger (L221). A cron expression fires a workflow (L217) on a schedule — the batch shapes: a daily digest (L224), a weekly report (L223), a nightly sync (L176). The path is the same as events (L220): the schedule triggers, the job is enqueued (L222), and the worker runs the workflow (L217). The discipline has four parts (L221). Idempotency — a run window can re-run, so the job keys on the run (L255). Timezone and skew — the schedule is explicit about when and where (L221). Missed runs — a crash means a missed digest, so the recovery (L232) — backfill, catch-up — is designed. And the failure story — retries (L169) and dead letters (L222) — is the same as the event path (L232). The schedule is a trigger, not a script (L230)."*

## 2. Mental Model

Think of scheduled jobs as **the clock in the office — the appointments the business doesn't trigger, the recurring ones.** The events (L220) are the phone calls — something happened, react (L220). The schedule (L221) is the calendar — every morning at 6, the office runs the digest (L224); every Monday, the weekly report (L223); every night, the sync (L176). The calendar has its own discipline: it's in one timezone (L221), it runs on time or catches up (L232), and a missed morning means the digest is made up, not skipped (L232). The clock and the phone are both triggers — one reacts, one recurs (L221).

```text
   the events (L220)               the schedule (L221)
   ┌────────────────────┐          ┌──────────────────────────────┐
   │ something happened │          │ every 6am: the digest (L224)  │
   │ → react (L220)     │          │ every Mon: the report (L223)  │
   └────────────────────┘          │ every night: the sync (L176)  │
       the phone calls              the calendar — timezone, skew,
                                    missed-run recovery (L232)
```

The mental model is **the calendar**: the recurring appointments of the automation — the batch shapes, on the clock, with catch-up (L221).

## 3. Visual Flow — The Scheduled Path

```text
   the clock fires (L221)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE SCHEDULE (L221)                                  │
   │     cron: '0 6 * * *' — the daily digest (L224)          │
   │     the run's window and timezone are explicit (L221)    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE RUN (L222)                                       │
   │     the job is enqueued (L222) — the worker runs the     │
   │     workflow (L217) with the run's id (L255)             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE BATCH SHAPE (L221)                               │
   │     digest: collect + summarize (L163)                   │
   │     report: aggregate + draft (L223)                     │
   │     sync: fetch + reconcile (L176)                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · RECOVERY (L232)                                      │
   │     missed run? → backfill · failed? → retry + dead      │
   │     letter · re-run safe? → idempotent by the run id     │
   └──────────────────────────────────────────────────────────┘
```

The flow is the scheduled path: **the clock → the run → the batch shape → the recovery** — the calendar's appointment, run and caught up (L221).

## 4. How It Works — The Shapes, the Path, the Discipline

- **The batch shapes (L221).** The recurring work: **digests** (collect the new items, summarize them — L163, L224), **reports** (aggregate the metrics, draft the narrative — L223), **syncs** (fetch the changes, reconcile — L176). Each is a workflow (L217) with a defined contract (L163).
- **The path (L222).** The schedule triggers (L221), the job is enqueued (L222), and the worker runs the workflow (L217) — the same trigger → queue → workflow path as events (L220).
- **The timing discipline (L221).** The schedule is explicit: the timezone (a cron in UTC vs local changes the run), the window (the run's expected duration), and the skew (a run that overruns into the next window). The schedule is a contract, not a guess (L221).
- **The idempotency (L255).** The run keys on the run ID (L255): a re-run of the same window is safe (L255) — the digest isn't double-sent, the sync isn't double-applied (L232).
- **The recovery (L232).** Missed runs (a crash, an outage) are caught up: backfill the missed window (L232), retry the failed runs (L169), and the dead letters (L222) hold the poison runs (L232).

> [!NOTE]
> **The schedule is a trigger with a contract — timezone, idempotency, and catch-up (L221, L232).** A cron that "runs at 6" is ambiguous (whose 6? L221); a scheduled job is explicit: the timezone, the window, and the skew policy (L221). And a scheduled run is a *batch* — the run can fail and re-run, so idempotency (L255) and the catch-up story (L232) are part of the design: the missed digest is backfilled (L232), the duplicate run is a no-op (L255). The schedule is a contract (L221), not a crontab line (L230).

## 5. Real Project Usage

- **Daily digests (L224).** Every 6am: collect the overnight emails, summarize them (L163), send the digest (L224) — the L221 batch shape (L221).
- **Weekly reports (L223).** Every Monday: aggregate the CRM metrics (L223), draft the narrative (L163), post to Slack (L225).
- **Nightly syncs (L176).** Every night: fetch the changed documents (L176), re-ingest the index (L176), reconcile the counts (L221).
- **Hourly monitors.** Every hour: check the API health (L227), draft the alert (L163), notify on anomalies (L225).
- **Anything recurring (L230).** The schedule is the L230 platform's time trigger (L221) — the same path as events (L220).

The through-line: **the schedule is the calendar of the automation** — the recurring batch shapes, run on the clock, with catch-up and recovery (L221).

## 6. Interview Explanation

Say it in four moves:

1. **The trigger.** "Cron fires the workflow (L217) on a schedule — the digests, reports, syncs (L221)."
2. **The path.** "Trigger → queue → worker (L222) — the same path as events (L220)."
3. **The contract.** "Timezone, window, skew — the schedule is explicit (L221)."
4. **The recovery.** "Idempotent runs (L255), backfill for the missed (L232), retries + dead letters (L222)."

## 7. Senior-Level Insights

- **The schedule is the platform's time trigger (L230).** The senior answer designs the scheduled path (L221) as part of the L230 platform (L220's sibling) — the trigger → queue → workflow shape (L222), not a crontab script (L230).
- **The batch shape is a workflow with a contract (L163).** The digest, report, or sync is a defined workflow (L217): the inputs, the AI steps (L163), the output (L143) — the schedule fires it; the shape is the design (L230).
- **The timezone is a data decision (L221).** The schedule's timezone (L221) affects *whose* data the run sees (L140) — the senior design is explicit (L221), because a UTC/local mismatch is a silent data bug (L196).
- **Idempotency is the batch's spine (L255).** The run window re-runs safely (L255) — the digest's dedupe (L255) and the sync's reconciliation (L176) are the batch shapes' correctness (L232).
- **The catch-up is the recovery (L232).** Missed runs (L232) are backfilled (L232), and the failure story (L169, L222) is the same as the event path (L220).

## 8. Common Mistakes

- **A crontab script (L230).** The schedule running a script instead of the platform's path (L222) — no queue (L222), no recovery (L232).
- **The ambiguous cron (L221).** "At 6" with no timezone — the silent data bug (L196) when the server's clock differs (L221).
- **Non-idempotent runs (L255).** A re-run double-sends the digest (L255) — the run window key missing (L232).
- **No catch-up (L232).** A missed digest skipped forever (L232) — the recovery absent (L221).
- **The heavy work in the trigger (L222).** The batch runs in the cron process (L151) — the queue handoff (L222) skipped.
- **The schedule as an afterthought (L230).** The recurring work bolted on (L230) — the L221 design skipped (L221).

## 9. Best Practices

- **Design the batch shape** (L221) — the digest, report, or sync as a workflow (L217) with a contract (L163).
- **Use the trigger → queue → worker path** (L222) — never the cron process (L151).
- **Make the schedule explicit** (L221) — timezone, window, skew (L140).
- **Key the run by the run ID** (L255) — idempotent re-runs (L232).
- **Design the catch-up** (L232) — backfill the missed, retry the failed (L169), dead-letter the poison (L222).
- **Record the runs** (L213) — the schedule's trace (L341).

## 10. Interview Questions

**Q: How do you run AI work on a schedule?**
> A: Scheduled jobs (L221). A cron expression fires a workflow (L217) on a schedule — the batch shapes: daily digests (L224), weekly reports (L223), nightly syncs (L176). The path is the same as events (L220): the schedule triggers, the job is enqueued (L222), and the worker runs the workflow (L217). The discipline: an explicit timezone and window (L221), idempotent runs (L255), and recovery for the missed (L232).

**Q: What are the batch shapes?**
> A: Three recurring patterns (L221). Digests — collect the new items and summarize them (L163, L224). Reports — aggregate the metrics and draft the narrative (L163, L223). Syncs — fetch the changes and reconcile (L176). Each is a workflow (L217) with a defined contract (L163) — the schedule fires it, and the shape is the design (L230).

**Q: Why does idempotency matter for a schedule?**
> A: Because a scheduled run is a batch (L255). The run can fail and re-run — the provider retries (L232), or the catch-up backfills a missed window (L232). Without the run ID key (L255), a re-run double-sends the digest or double-applies the sync (L255). The run window is idempotent: the first execution does the work, the re-run is a no-op (L255).

**Q: What happens when a scheduled run is missed?**
> A: The catch-up story (L232). A crash or an outage means a missed digest — the recovery backfills the missed window (L232), retries the failed runs (L169), and dead-letters the poison runs (L222). The schedule's recovery is part of the design (L221) — the calendar catches up, it doesn't skip (L232).

## 11. Follow-Up Questions

- What are the three batch shapes (L221)?
- How does the scheduled path reuse the event path (L222)?
- How do you make the schedule explicit (L221)?
- How does the run ID make a batch idempotent (L255)?
- What's the catch-up story (L232)?

## 12. Comparison Table — Event vs Schedule Trigger

| | Events (L220) | Schedule (this lesson) |
|---|---|---|
| Trigger | something happened | the clock (L221) |
| Shapes | reactions (L220) | digests, reports, syncs (L221) |
| Path (L222) | webhook → queue → worker | cron → queue → worker |
| Idempotency (L255) | by the event ID | by the run ID (L255) |
| Recovery (L232) | provider retries | backfill + catch-up (L232) |
| Time (L221) | when it happens | explicit timezone + window |

The senior read: **the columns are the two triggers of the L230 platform** — react and recur — sharing the queue (L222) and the recovery (L232) path (L230).

## 13. Code Example — The Scheduled Job

```js
// Scheduled jobs: the batch shape, the path, the recovery (L221, L222).
// THE SCHEDULE (L221) — explicit: timezone, window, shape.
export const jobs = [
  {
    cron: '0 6 * * *',                       // every 6am (L221)
    timezone: 'UTC',                         // explicit (L221)
    workflow: 'daily-digest',                // the batch shape (L221)
  },
];

// THE RUN (L222) — the trigger enqueues; the worker runs (L217).
export async function runScheduled(job, fireAt) {
  const runId = `${job.workflow}:${fireAt.toISOString()}`;  // the idempotency key (L255)
  if (await alreadyRun(runId)) return;        // duplicate run → no-op (L255)
  await queue.enqueue({ type: 'workflow.run', workflow: job.workflow, runId });
}

// THE BATCH SHAPE (L221) — the digest workflow (L217, L163).
async function dailyDigest(runId) {
  const items = await collectNewItems();      // the inputs (L224)
  const summary = await model.summarize(items);              // AI (L163)
  await sendDigest(summary);                  // the output (L224)
  await markRun(runId);                       // the key (L255)
}

// THE RECOVERY (L232) — the catch-up.
async function catchUpMissed() {
  for (const missed of await findMissedWindows()) {   // the gaps (L232)
    await runScheduled(missed.job, missed.fireAt);    // backfill (L232)
  }
}
```

```text
What the reader must SEE — the calendar's contract:

  cron + timezone       → the explicit schedule (L221)
  runId = workflow:time → the idempotency key (L255)
  queue.enqueue         → the path (L222) — never the cron process
  catchUpMissed()       → the missed-run recovery (L232)

  The clock fires; the queue runs; the calendar catches up.
```

```narrate
3-9: The schedule — the cron, the explicit timezone, and the batch shape it fires (L221).
11-16: The run — the run ID is the idempotency key (L255); the job is enqueued, not run in the trigger (L222).
19-25: The batch shape — the digest workflow: collect, summarize (L163), send (L224), and mark the run (L255).
27-31: The recovery — the missed windows are found and backfilled (L232).
```

> [!TIP]
> The line that makes the schedule a contract: **`runId = `${job.workflow}:${fireAt.toISOString()}``** — the run key (L255). **The clock fires, the queue runs, and the calendar catches up — idempotently (L221, L232).**

## 14. Performance Notes

- **The trigger is the fast path (L151).** The cron enqueues and returns (L222) — the batch runs in the worker, off the trigger (L217).
- **The batch is the queue's throughput (L222).** The digest's work is a queued job (L222) — the workers scale to the schedule's bursts (L222).
- **The AI steps are the token cost (L150).** The summarization (L163) is the digest's spend (L149) — the batch's cost is predictable (L150).
- **The catch-up is the recovery's cost (L232).** A missed window's backfill (L232) is a re-run (L255) — the recovery is budgeted like any run (L232).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The digest runs at the wrong hour | The timezone ambiguous (L221) | Make it explicit (L140) |
| Double digests | No run ID key (L255) | Key the run (L255) |
| Missed digests, never caught up | No catch-up (L232) | Backfill the windows (L232) |
| The cron process is slow | Work in the trigger (L222) | Enqueue + worker (L222) |
| Poison runs block the queue | No dead letters (L222) | Dead-letter + alert (L232) |

## 16. Quick Revision Notes

- Scheduled jobs = **the time trigger** (L221): cron fires the workflow (L217).
- The batch shapes: **digests (L224), reports (L223), syncs (L176)**.
- The path: **trigger → queue → worker** (L222) — same as events (L220).
- The contract: **timezone, window, skew explicit** (L221).
- Idempotency: **keyed by the run ID** (L255).
- Recovery: **backfill (L232), retries (L169), dead letters (L222)**.

## 17. Cheat Sheet

```text
SCHEDULED JOBS & CRON = the time trigger of the workflow

THE TRIGGER (L221)
  cron fires the workflow (L217) on a schedule
  explicit: timezone · window · skew (L140)

THE BATCH SHAPES (L221)
  digests   collect + summarize (L163, L224)
  reports   aggregate + draft (L163, L223)
  syncs     fetch + reconcile (L176)

THE PATH (L222)
  schedule → queue → worker — same as events (L220)
  never run the batch in the cron process (L151)

THE CORRECTNESS (L255, L232)
  the run keys by the run ID (L255) — re-runs are no-ops
  missed runs are backfilled (L232) — the calendar catches up
  failed runs retry (L169) · poison runs dead-letter (L222)

THE RECORD (L213)
  the schedule's runs are traced (L213) — audit (L322) + recovery (L232)

INTERVIEW, 4 MOVES
  1 trigger "cron fires the workflow (L221)"
  2 shapes  "digests, reports, syncs (L221)"
  3 path    "trigger → queue → worker (L222)"
  4 recovery "idempotent (L255) · backfill (L232) · retries (L169)"
```

## 18. Key Takeaways

> [!RECAP]
> - Scheduled jobs are **the time trigger** (L221): a cron expression fires a workflow (L217) — the batch shapes of digests (L224), reports (L223), and syncs (L176)
> - **The path is the same as events** (L220): schedule → queue → worker (L222) — never the cron process (L151)
> - **The schedule is a contract** (L221): the timezone, the window, and the skew are explicit (L140)
> - **The batch is idempotent by the run ID** (L255) — a re-run is a no-op, so the digest isn't double-sent (L232)
> - **The recovery is the catch-up** (L232): missed windows are backfilled (L232), failed runs retry (L169), poison runs dead-letter (L222)
> - The schedule is **the L230 platform's time trigger** (L230) — the recurring appointment, on the clock, with a record (L213)

## Check your understanding

Answer these without looking back.

1. What are the three batch shapes (L221)?
2. What's the scheduled path (L222)?
3. Why is the timezone explicit (L221)?
4. What makes a run idempotent (L255)?
5. What's the catch-up story (L232)?
6. Why not run the batch in the cron process (L151)?
7. What's in the schedule's contract (L221)?
8. What does the record serve (L213)?

## A Closing Note — The Calendar That Catches Up

You now hold the time trigger: **the batch shapes — digests, reports, syncs — fired by an explicit schedule, run on the queue, idempotent by the run ID, and caught up when the clock is missed.** The automation now works on the calendar as well as the phone (L230).

Next: where the queued work runs — queues & background workers for AI (L222), the in-tray that keeps requests fast.
