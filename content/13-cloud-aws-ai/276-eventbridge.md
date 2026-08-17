# Lesson 276 — EventBridge

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the AWS event bus?" — the answer is *EventBridge*: the event bus — the events, the rules, and the targets — the L248 event-driven architecture, AWS-shaped (L276).**

L248 built the event-driven architecture (L248); this lesson is **its AWS implementation**: EventBridge — the event bus: the events (the structured records, L248), the rules (the filters, L276), the targets (the consumers, L276), and the schedules (the cron, L221). The AI platform's shape: the S3 events (L265), the job completions (L248), and the scheduled jobs (L221) flow through the event bus (L276). This lesson is the L248 event bus, AWS-shaped (L276).

The distinction this lesson is built on: a **demo** polls. A **solutions architect** wires the events (L276): the source, the rule, and the target (L276) — because the L260 backend's seams (L248) run on the event bus (L276).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the event bus: the events' highway (L276)
- Explain the events: the structured records (L248)
- Explain the rules: the filters (L276)
- Explain the targets: the consumers (L276)
- Explain the AI shape: the L248 event bus, AWS-shaped (L276)

## 1. One-Line Definition

**EventBridge is the AWS event bus that wires the services together (L276) — the events (the structured records: the source, the detail-type, the detail, L248), the rules (the filters: the pattern matching and the scheduling, L276), the targets (the consumers: the Lambda L266, the SQS L270, the Step Functions L277, L276), and the schedules (the cron jobs, L221) — the L248 event-driven architecture, AWS-shaped (L276).**

The one-sentence interview answer: *"EventBridge is AWS's event bus (L276). The model: the events (L248) — the structured records with the source, the detail-type, and the detail (L276) — flow into the bus (L276); the rules (L276) filter them — the pattern matching: *when the source is the S3 and the detail-type is the object-created* (L276); and the targets (L276) receive the matching events — the Lambda (L266), the SQS queue (L270), the Step Functions (L277) (L276). The bus also does the schedules (L221): the cron rule (L276) invokes the target on the schedule (L276). The AI shape: the S3 event (L265) — the new document — triggers the ingestion (L280); the job-completed event (L248) fans out to the billing and the webhook (L270); the schedule (L221) runs the nightly retraining (L365); and the failed jobs (L232) alert the on-call (L274). The L248 event-driven architecture, AWS-shaped: the source emits, the rule filters, the target reacts (L276)."*

## 2. Mental Model

Think of EventBridge as **the city's radio dispatch.** The dispatcher (the event bus, L276) hears the calls (the events, L248): "Unit 7, the document arrived" (the S3 event, L265), "the job is done" (the completion, L248), "it's 3 AM" (the schedule, L221). The dispatcher routes by the rules (L276): "the document events go to the intake team" (the ingestion Lambda, L280), "the completions go to the billing and the webhook" (L270), "the 3 AM call goes to the night crew" (the retraining, L365). The callers never call the teams directly (L248) — they call the dispatcher, and the dispatcher knows the routing (L276). The city works because the calls are structured, the rules are clear, and the teams listen on the right channels (L276).

```text
   the dispatch (EventBridge, L276)
   ┌────────────────────────────────────────────────────────┐
   │ the calls (the events, L248) — the source, the type,   │
   │ the detail (L276)                                      │
   │ the routing (the rules, L276) — the filters            │
   │ the teams (the targets, L276) — the Lambda (L266),     │
   │ the SQS (L270), the Step Functions (L277)              │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the dispatch**: the calls, the routing, and the teams (L276).

## 3. Visual Flow — One Event Through the Bus

```text
   the source (L276)
        │  the event (L248)
        ▼
   ┌────────────────────── THE BUS (L276) ─────────────────────────────┐
   │  the event: { source, detail-type, detail } (L276)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RULES (L276) ───────────────────────────┐
   │  the pattern: source = S3 · type = object-created (L276)         │
   │  the schedule: cron(0 3 * * ? *) (L221)                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE TARGETS (L276) ─────────────────────────┐
   │  the ingestion Lambda (L266, L280) · the SQS queue (L270)        │
   │  the Step Functions (L277) · the SNS (L270)                      │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the event's path: **source → bus → rule → target** (L276).

## 4. How It Works — The Bus, Part by Part

- **The events (L248).** The structured records (L248): the source — who emitted it; the detail-type — what happened; the detail — the payload (L276). The event is the contract (L248) between the source and the target (L276).
- **The rules (L276).** The filters (L276): the pattern matching — the source, the detail-type, and the detail's fields (L276); the schedule — the cron expression (L221). The rule routes the matching events to the targets (L276).
- **The targets (L276).** The consumers (L276): the Lambda (L266), the SQS queue (L270), the SNS topic (L270), the Step Functions (L277) — each target with its own input (L276).
- **The schedules (L221).** The cron jobs (L221): the rule with the rate or the cron expression (L276) — the scheduled invocations (L276).
- **The replay and the archive (L276).** The bus archives the events (L276) — the replay (L276) for the debugging and the re-processing (L276).

> [!NOTE]
> **The bus decouples the source from the target (L248).** The source emits the event (L248) and never knows the target (L276); the target subscribes through the rule (L276) and never knows the source (L276). The seam (L248) is the event (L248): the new consumer subscribes (L276) without the producer changing (L248) — the L248 event-driven architecture, AWS-shaped (L276).

## 5. Real Project Usage

- **A RAG ingestion (L280).** The S3 event (L265) — the object-created (L276) — triggers the ingestion Lambda (L266): the parse, the chunk, the embed (L280).
- **A job completion (L248).** The worker (L249) publishes the job-completed event (L248); the rule (L276) fans it out to the billing (L332), the webhook (L220), and the analytics (L276).
- **A scheduled job (L221).** The cron rule (L276) — the nightly retraining (L365), the daily cost report (L334), the weekly embedding refresh (L181).
- **A failure alert (L232).** The DLQ (L232) message (L270) → the rule (L276) → the SNS (L270) → the on-call (L274).
- **Anything event-driven (L248).** The seams (L248) run on the bus (L276) — the sources emit, the rules filter, the targets react (L276).

The through-line: **the bus is the event-driven seam** — the source, the rule, and the target (L276).

## 6. Interview Explanation

Say it in four moves:

1. **The bus.** "The events' highway (L276)."
2. **The events.** "The structured records — the source, the detail-type, the detail (L248)."
3. **The rules.** "The filters — the pattern matching and the schedules (L276)."
4. **The targets.** "The Lambda (L266), the SQS (L270), the Step Functions (L277)."

## 7. Senior-Level Insights

- **The event is the contract (L248).** The senior answer designs the event schema first (L248): the source, the detail-type, the detail (L276) — the versioned contract (L341) between the source and the target (L276).
- **The rule is the routing's logic (L276).** The filtering (L276) — the target receives only what it handles (L276) — the routing (L276) is the rules' design (L276).
- **The bus is the new consumer's door (L248).** The new target subscribes (L276) without the producer changing (L248) — the L248 extensibility (L248), AWS-shaped (L276).
- **The archive is the replay's record (L276).** The events archived (L276) — the replay (L276) for the debugging (L211) and the re-processing (L276) — the L322 audit (L322), event-shaped (L276).
- **The schedule is the cron's home (L221).** The cron rule (L276) — the L221 scheduled jobs (L221), AWS-native (L276).

## 8. Common Mistakes

- **The direct calls (L248).** The service calling the service (L248) — the seam (L248) lost, the coupling (L252) returned (L276).
- **The fat event (L276).** The whole payload in the event (L276) — the contract (L248) bloated, the size (L276) exceeded (L276).
- **The rule too wide (L276).** The catch-all pattern (L276) — every target receives everything (L276).
- **The schema unversioned (L341).** The event shape changed (L276) — the consumers (L276) break (L341).
- **The schedule without the idempotency (L255).** The retried job (L256) double-runs (L276) — the L255 dedupe (L255) missing (L276).

## 9. Best Practices

- **Design the event contracts first** (L248) — the source, the type, the detail (L276).
- **Filter with the rules** (L276) — the target receives only what it handles (L276).
- **Version the schemas** (L341) — the consumers (L276) survive the changes (L341).
- **Archive and replay** (L276) — the debugging (L211) and the audit (L322).
- **Make the scheduled jobs idempotent** (L255) — the retry (L256) is a no-op (L276).

## 10. Interview Questions

**Q: Walk me through EventBridge.**
> A: The event bus (L276). The events — the structured records: the source, the detail-type, the detail (L248). The rules — the filters: the pattern matching and the schedules (L276). The targets — the Lambda (L266), the SQS (L270), the Step Functions (L277) (L276).

**Q: How do you wire the RAG ingestion?**
> A: Through the bus (L276): the S3 bucket (L265) emits the object-created event (L276); the rule (L276) filters for the document prefix (L265); and the target — the ingestion Lambda (L266) — parses, chunks, and embeds (L280). The new document type subscribes with a new rule (L276) — the source never changes (L248).

**Q: What's the difference between a rule and a target?**
> A: The filter and the consumer (L276). The rule (L276) matches the events — the pattern or the schedule (L276); the target (L276) receives the matched events — the Lambda (L266), the SQS (L270), the Step Functions (L277) (L276). The rule routes; the target reacts (L276).

**Q: How do you run a scheduled AI job?**
> A: With the schedule rule (L276): the cron expression (L221) — the nightly retraining (L365), the daily cost report (L334) — invokes the target (L276). The scheduled Lambda (L266) runs the job (L276) — idempotent (L255) so the retries (L256) are safe (L276).

## 11. Follow-Up Questions

- What's the event bus (L276)?
- What's in an event (L248)?
- What's a rule (L276)?
- What's a target (L276)?
- How do you schedule a job (L221)?

## 12. Comparison Table — The Bus vs the Queue

| | EventBridge (L276) | SQS (L270) |
|---|---|---|
| Model (L276) | the pub/sub bus (L247) | the point-to-point queue (L245) |
| Routing (L276) | the rules — the filters (L276) | the consumers poll (L245) |
| Delivery (L276) | the push to the targets (L276) | the at-least-once, the timeout (L254, L270) |
| Use (L276) | the events (L248), the schedules (L221) | the jobs (L249), the DLQ (L232) |

The senior read: **the bus for the events, the queue for the jobs** — the L248 and the L245, AWS-shaped (L276).

## 13. Code Example — The Bus, Declared

```js
// The event bus (L276) — the source, the rule, the target (L276).
// THE EVENT (L248) — the structured record from the S3 (L265, L276).
//   { source: 'aws.s3', detail-type: 'Object Created',
//     detail: { bucket, key } }                     (L276)

// THE RULE (L276) — the filter routes the document events (L276).
const rule = {
  name: 'ingest-new-documents',
  eventPattern: {                                 // the pattern (L276)
    source: ['aws.s3'],
    detailType: ['Object Created'],
    detail: { key: [{ prefix: 'tenant/42/docs/' }] },   // the tenant (L320)
  },
  targets: [{ arn: ingestLambda }],               // the ingestion (L266, L280)
};

// THE SCHEDULE (L221, L276) — the cron rule (L276).
const nightly = {
  name: 'nightly-embedding-refresh',
  schedule: 'cron(0 3 * * ? *)',                  // the 3 AM job (L221)
  targets: [{ arn: refreshLambda }],              // the refresh (L181)
};

// THE FAILURE (L232) — the DLQ (L270) message → the alert (L274).
const alertRule = {
  eventPattern: { source: ['aws.sqs'], detail: { queue: ['*-dlq'] } },
  targets: [{ arn: alertTopic }],                 // the SNS → the on-call (L270, L274)
};
```

```text
What the reader must SEE — the bus, declared:

  eventPattern: S3 + Object Created + tenant prefix → the ingestion (L276, L280)
  cron(0 3 * * ? *) → the nightly refresh (L221, L181)
  *-dlq pattern → the alert topic (L232, L274)

  The source emits, the rule filters, the target reacts (L276).
```

```narrate
3-7: The event — the S3 object-created record (L265, L276).
9-16: The rule — the pattern filters the tenant's documents and routes to the ingestion Lambda (L276, L280).
18-23: The schedule — the cron rule runs the nightly refresh (L221, L181).
25-27: The failure — the DLQ pattern alerts the on-call (L232, L274).
```

> [!TIP]
> The pair that defines EventBridge: **the event pattern** (the filter, L276) and **the target** (the consumer, L276). **The source emits, the rule filters, the target reacts — the L248 seam, AWS-shaped (L276).**

## 14. Performance Notes

- **The bus is the event's latency (L276).** The push to the targets (L276) — the event's delivery (L276) is the bus's (L276).
- **The rule is the target's load (L276).** The precise patterns (L276) — the target receives only its events (L276) — the load (L276) is the rules' design (L276).
- **The schedule is the cron's precision (L221).** The cron expression (L276) — the scheduled invocations (L221) on time (L276).
- **The archive is the storage's cost (L285).** The events archived (L276) — the retention (L276) is the bill's line (L285).

## 15. Debugging Scenarios

| Symptom | First check (L276) | The lever |
|---|---|---|
| The target never fires | The rule's pattern (L276) | The source and the detail-type (L276) |
| The target gets everything | The rule's scope (L276) | The precise pattern (L276) |
| The scheduled job double-runs | The idempotency (L255) | The dedupe (L255) |
| The consumer breaks | The event schema (L341) | The versioned contract (L341) |
| The event is lost | The archive (L276) | The replay (L276) |

## 16. Quick Revision Notes

- EventBridge = **the AWS event bus** (L276): the events, the rules, the targets, the schedules.
- The events: **the structured records (L248) — the source, the type, the detail**.
- The rules: **the filters — the patterns and the schedules (L276)**.
- The targets: **the Lambda (L266), the SQS (L270), the Step Functions (L277)**.
- The shape: **the L248 event-driven architecture, AWS-shaped (L276)**.

## 17. Cheat Sheet

```text
EVENTBRIDGE = the AWS event bus that wires the services together

THE EVENTS (L248)
  { source, detail-type, detail } (L276)
  the contract (L248) between the source and the target (L276)

THE RULES (L276)
  the patterns — the source, the type, the detail's fields (L276)
  the schedules — the cron / the rate (L221)

THE TARGETS (L276)
  the Lambda (L266) · the SQS (L270) · the SNS (L270)
  the Step Functions (L277) (L276)

THE AI SHAPE (L276)
  the S3 event (L265) → the ingestion (L280)
  the completion (L248) → the billing + the webhook (L270)
  the schedule (L221) → the nightly retraining (L365)
  the DLQ (L232) → the on-call alert (L274)

THE SEAM (L248)
  the source never knows the target (L276)
  the new consumer subscribes — the producer unchanged (L248)

INTERVIEW, 4 MOVES
  1 bus     "the events' highway (L276)"
  2 events  "the structured records (L248)"
  3 rules   "the filters + the schedules (L276)"
  4 targets "the Lambda, the SQS, the Step Functions (L276)"
```

## 18. Key Takeaways

> [!RECAP]
> - EventBridge is **the AWS event bus that wires the services together** (L276): the events (L248), the rules (L276), the targets (L276), and the schedules (L221)
> - **The events** (L248) are the structured records — the source, the detail-type, and the detail (L276) — the contract (L248) between the source and the target (L276)
> - **The rules** (L276) are the filters — the pattern matching (L276) and the cron schedules (L221)
> - **The targets** (L276) are the consumers — the Lambda (L266), the SQS (L270), the SNS (L270), and the Step Functions (L277)
> - The bus is **the L248 seam, AWS-shaped** (L276): the source emits, the rule filters, the target reacts — the new consumer subscribes without the producer changing (L248)
> - The AI shape (L276): the S3 event (L265) triggers the ingestion (L280), the completions (L248) fan out to the billing and the webhooks (L270), the schedules (L221) run the retraining (L365), and the DLQ (L232) alerts the on-call (L274)

## Check your understanding

Answer these without looking back.

1. What's the event bus (L276)?
2. What's in an event (L248)?
3. What's a rule (L276)?
4. What's a target (L276)?
5. How do you wire the RAG ingestion (L280)?
6. How do you schedule a job (L221)?
7. What's the L248 seam, AWS-shaped (L276)?
8. What's the archive for (L276)?

## A Closing Note — The Dispatch, Live

You now hold the event bus: **the events, the rules, the targets, and the schedules — with the source never knowing the target.** The L260 backend has its seams — and they're wired (L276).

Next: the AWS state machine for the long AI workflows — Step Functions (L277).
