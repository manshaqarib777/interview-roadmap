# Lesson 270 — SQS & SNS on AWS

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the AWS async backbone?" — the answer is *SQS & SNS*: the queue and the pub/sub — the L245 queue and the L247 topic, AWS-shaped (L270).**

L245 and L247 built the queue and the pub/sub (L245, L247); this lesson is **their AWS implementation**: SQS & SNS on AWS — the async backbone: SQS (the queue, L245), SNS (the pub/sub, L247), the patterns (the fan-out, L270), and the guarantees (the at-least-once, the DLQ, L232). The AI platform's shape: the job queue (L249), the event fan-out (L248), and the DLQ (L232) run on SQS and SNS (L270). This lesson is the L245 engine room, AWS-shaped (L270).

The distinction this lesson is built on: a **demo** calls the model synchronously. A **solutions architect** decouples the slow work (L222): the job goes to SQS (L270), the workers (L249) process it, the events fan out through SNS (L247), and the DLQ (L232) catches the poison (L270).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain SQS: the queue (L245)
- Explain SNS: the pub/sub (L247)
- Explain the fan-out: the topic to the queues (L270)
- Explain the guarantees: the at-least-once and the DLQ (L232)
- Explain the AI shape: the engine room of the L260 backend (L270)

## 1. One-Line Definition

**SQS & SNS on AWS is the async backbone behind the AI pipelines (L270) — SQS (the queue: the producer sends, the consumer polls, L245), SNS (the pub/sub: the topic fans out to the subscribers, L247), the patterns (the fan-out: the SNS topic to the SQS queues, L270), and the guarantees (the at-least-once delivery, the visibility timeout, and the DLQ, L232) — the L245 engine room, AWS-shaped (L270).**

The one-sentence interview answer: *"SQS and SNS are AWS's async backbone (L270). SQS is the queue (L245): the producer sends a message, the consumer polls or receives it, processes it, and deletes it (L245). The delivery is at-least-once (L254): a message may arrive more than once, so the consumers are idempotent (L255) (L270). The visibility timeout (L270) hides an in-flight message from the other consumers while one processes it (L270) — and the DLQ (L232) catches the messages that keep failing (L270). SNS is the pub/sub (L247): a topic, many subscribers — the Lambda (L266), the SQS queue, the email (L270) — and the message fans out to all of them (L247). The pattern: the fan-out (L270) — an SNS topic to several SQS queues, each a different consumer's job (L270). The AI shape: the job queue (L249) — the model calls (L278) and the workflows (L217) enqueued and processed by the workers (L266); the event fan-out (L248) — the job completed, the billing updated, the webhook sent (L270); and the DLQ (L232) — the poison messages parked for the replay (L270). The L245 engine room, AWS-shaped (L270)."*

## 2. Mental Model

Think of SQS and SNS as **the office's mailroom and bulletin board.** The mailroom (SQS, L245) holds the envelopes (the messages, L245): the staff (the workers, L266) pick up an envelope, do the job, and mark it done (L245). An envelope being worked on is set aside so nobody else grabs it (the visibility timeout, L270); the envelopes that can't be completed go to the problem pile (the DLQ, L232). The bulletin board (SNS, L247) is the announcement system: one notice (the message, L247) posted, and every subscriber — the mailroom, the billing office, the webhook clerk (L270) — copies it (L247). The fan-out (L270): the notice goes up, and each office's inbox (the SQS queue, L270) receives its own copy (L270). The office works because the mailroom decouples the work, and the board fans out the news (L270).

```text
   the mailroom + the board (SQS & SNS, L270)
   ┌────────────────────────────────────────────────────────┐
   │ the mailroom (SQS, L245) — the envelopes, the workers,  │
   │ the visibility timeout (L270), the DLQ (L232)           │
   │ the board (SNS, L247) — the notices, the subscribers    │
   │ the fan-out (L270) — the board to the inboxes (L270)    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the mailroom and the board**: the envelopes, the notices, and the fan-out (L270).

## 3. Visual Flow — The Job and the Event

```text
   the producer (L270)
        │  the job message (L249)
        ▼
   ┌────────────────────── THE QUEUE (SQS, L245) ──────────────────────┐
   │  the message arrives (L245) · the visibility timeout (L270)       │
   │  the consumer (the Lambda, L266) processes and deletes (L245)    │
   │  the failures → the DLQ (L232)                                   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼  the job-completed event (L248)
   ┌────────────────────── THE TOPIC (SNS, L247) ──────────────────────┐
   │  the fan-out (L270): the message to every subscriber (L247)      │
   │  ┌──────────────┬──────────────┬──────────────────┐               │
   │  │ the billing  │ the webhook  │ the analytics    │               │
   │  │ queue (L270) │ (L220)       │ (L332)           │               │
   │  └──────────────┴──────────────┴──────────────────┘               │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the async backbone: **queue → worker → event → fan-out** (L270).

## 4. How It Works — The Backbone, Part by Part

- **SQS (L245).** The queue: the producer sends the message, the consumer polls or receives it, processes it, and deletes it (L245). The delivery is at-least-once (L254) — the consumers are idempotent (L255) (L270).
- **The visibility timeout (L270).** The in-flight message is hidden from the other consumers while one processes it (L270) — if the consumer fails, the message becomes visible again (L270).
- **The DLQ (L232).** The dead-letter queue: the messages that keep failing (L232) are parked (L270) — for the inspection and the replay (L232).
- **SNS (L247).** The pub/sub: the topic, many subscribers — the Lambda (L266), the SQS queue, the email (L270) — and the message fans out to all of them (L247).
- **The fan-out (L270).** The pattern: the SNS topic to several SQS queues (L270) — the event (L248) delivered to each consumer's inbox (L270).

> [!NOTE]
> **The queue decouples; the topic broadcasts (L270).** The senior answer knows the difference (L270): SQS (L245) is the point-to-point — one job, one consumer, the work decoupled from the request (L222); SNS (L247) is the broadcast — one event, many subscribers (L247). The fan-out (L270) combines them: the SNS topic (L247) to the SQS queues (L245) — each consumer gets its own inbox (L270). The L245 engine room and the L247 event bus, AWS-shaped (L270).

## 5. Real Project Usage

- **A serverless AI stack (L283).** The API Gateway (L267) enqueues the generation job (L249) to SQS (L270); the worker Lambda (L266) processes it (L278); the completion event (L248) fans out through SNS (L270).
- **A RAG ingestion (L280).** The S3 event (L265) enqueues the document (L270); the ingestion workers (L266) parse, chunk, and embed (L280).
- **A multi-tenant SaaS (L357).** The per-tenant job queues (L270) and the per-tenant rate limits (L242) — the L320 isolation (L320).
- **A webhook delivery (L220).** The completion event (L248) through SNS (L247) to the webhook queue (L270) — the delivery (L220) with the retries (L256).
- **Anything async (L222).** The slow work (L222) rides the queue (L245); the events (L248) ride the topic (L247) — SQS and SNS run them (L270).

The through-line: **the async backbone decouples the work** — the queue for the jobs, the topic for the events (L270).

## 6. Interview Explanation

Say it in four moves:

1. **SQS.** "The queue — the producer sends, the consumer processes and deletes (L245)."
2. **The guarantees.** "The at-least-once (L254), the visibility timeout, the DLQ (L232)."
3. **SNS.** "The pub/sub — the topic, many subscribers (L247)."
4. **The fan-out.** "The topic to the queues — each consumer gets its own inbox (L270)."

## 7. Senior-Level Insights

- **The queue is the request path's savior (L222).** The slow work (L222) enqueued (L270) — the request returns fast (L151), the worker processes (L249) off the path (L222).
- **The idempotency is the at-least-once's answer (L255).** The redelivered message (L254) — the L255 dedupe (L255) makes the consumer safe (L270).
- **The DLQ is the failure's visibility (L232).** The poison messages (L232) parked (L270) — the replay (L232) and the alert (L274) are the DLQ's consumers (L270).
- **The fan-out is the event-driven seam (L248).** The SNS topic (L247) to the queues (L245) — the new consumer subscribes (L270) without the producer changing (L248).
- **The cost is the message's (L285).** The per-message pricing (L285) — the queues (L270) and the topics (L270) are the cheap backbone (L285).

## 8. Common Mistakes

- **The synchronous model call (L222).** The model call (L278) in the request (L270) — the engine room (L245) skipped, the user waits (L151).
- **The non-idempotent consumer (L255).** The redelivered message (L254) double-processed (L270) — the L255 dedupe (L255) missing.
- **The DLQ missing (L232).** The poison messages (L232) stuck in the queue (L270) — the failure invisible (L274).
- **The visibility timeout too short (L270).** The message reappears mid-processing (L270) — the double processing (L254) despite the timeout (L270).
- **The topic instead of the queue (L247).** The point-to-point job (L245) on the topic (L247) — the fan-out (L270) semantics wrong.

## 9. Best Practices

- **Enqueue the slow work** (L222) — the request path stays fast (L151).
- **Make the consumers idempotent** (L255) — the at-least-once (L254) is safe (L270).
- **Wire the DLQ** (L232) — the poison parked, the alert raised (L274).
- **Tune the visibility timeout** (L270) — the processing time + the margin (L270).
- **Use the topic for the events** (L247) — the fan-out (L270) at the seams (L248).

## 10. Interview Questions

**Q: Walk me through SQS and SNS.**
> A: The async backbone (L270). SQS — the queue: the producer sends, the consumer processes and deletes (L245). The guarantees: the at-least-once (L254), the visibility timeout, and the DLQ (L232). SNS — the pub/sub: the topic, many subscribers (L247). And the fan-out — the topic to the queues, each consumer's inbox (L270).

**Q: How do you run an AI job asynchronously?**
> A: Through the queue (L270): the API Gateway (L267) enqueues the job (L249) to SQS (L270); the worker Lambda (L266) polls and processes it — the model call (L278) and the workflow (L217); the completion event (L248) fans out through SNS (L270); and the DLQ (L232) catches the failures (L270).

**Q: What's the at-least-once?**
> A: The delivery guarantee (L254): a message may arrive more than once (L270). The consumer must be idempotent (L255) — the dedupe key (L255) makes the redelivery a no-op (L270). The at-least-once (L254) plus the idempotency (L255) is the correctness (L270).

**Q: What's the DLQ for?**
> A: The poison messages (L232). The messages that keep failing (L270) are parked in the DLQ (L232) — the inspection and the replay (L232), with the alert (L274) raising the visibility (L270).

## 11. Follow-Up Questions

- What's SQS (L245)?
- What's SNS (L247)?
- What's the fan-out (L270)?
- What's the at-least-once (L254)?
- What's the DLQ for (L232)?

## 12. Comparison Table — SQS vs SNS

| | SQS (L245) | SNS (L247) |
|---|---|---|
| Model (L270) | the point-to-point queue | the pub/sub topic |
| Consumer (L270) | one — polls (L245) | many — subscribes (L247) |
| Delivery (L270) | the at-least-once, the timeout (L254, L270) | the push to the subscribers (L247) |
| AI use (L270) | the job queue (L249), the DLQ (L232) | the event fan-out (L248) |

The senior read: **the queue for the jobs, the topic for the events** — and the fan-out (L270) combines them (L270).

## 13. Code Example — The Backbone, Declared

```js
// The async backbone (L270) — the queue and the topic (L245, L247).
// THE JOB QUEUE (SQS, L249) — the generation jobs (L278).
const generationQueue = 'generation-jobs';           // the L249 queue (L245)

// THE PRODUCER (L270) — the API Gateway handler (L267).
async function onGenerateRequest(event) {
  const jobId = crypto.randomUUID();                 // the idempotency key (L255)
  await sqs.send({
    queue: generationQueue,
    body: { jobId, prompt: event.prompt },
  });
  return { statusCode: 202, body: { jobId } };       // the fast response (L151)
}

// THE CONSUMER (L266, L249) — the worker Lambda (L266).
async function worker(event) {
  for (const record of event.Records) {
    const { jobId, prompt } = JSON.parse(record.body);
    // The idempotency (L255): the dedupe check before the work (L270).
    if (await alreadyDone(jobId)) continue;          // the redelivery is a no-op (L255)
    await generate(prompt);                          // the model call (L278)
    await markDone(jobId);                           // the dedupe write (L255)
  }
}

// THE EVENT (L248) — the completion fans out through the topic (L247).
await sns.publish({
  topic: 'job-completed',                            // the topic (L247)
  message: { jobId, status: 'done' },                // the event (L248)
});
// The subscribers (L270): the billing queue, the webhook queue,
// the analytics queue — each its own inbox (L270).

// THE DLQ (L232) — the poison messages parked (L270).
const dlq = 'generation-jobs-dlq';                   // the replay + the alert (L274)
```

```text
What the reader must SEE — the backbone, declared:

  sqs.send + 202          → the job enqueued, the request fast (L151, L270)
  jobId                   → the idempotency key (L255)
  alreadyDone(jobId)      → the redelivery is a no-op (L255, L270)
  sns.publish job-completed → the event fans out (L247, L248)
  -dlq                    → the poison parked (L232)

  The queue for the jobs, the topic for the events (L270).
```

```narrate
4-9: The producer — the job is enqueued with the idempotency key, and the request returns fast (L270, L255).
11-19: The consumer — the worker processes the record, dedupes, generates, and marks done (L266, L255).
21-27: The event — the completion publishes to the topic and fans out (L247, L248).
29-30: The DLQ — the poison messages are parked (L232, L270).
```

> [!TIP]
> The pair that defines the backbone: **the job queue** (the slow work decoupled, L245) and **the completion topic** (the event fanned out, L247). **Enqueue the jobs, fan out the events — the L245 engine room, AWS-shaped (L270).**

## 14. Performance Notes

- **The queue is the latency's savior (L151).** The job enqueued (L270) — the request returns in milliseconds (L151), the worker processes (L249) in the background (L222).
- **The worker is the throughput (L249).** The Lambda (L266) concurrency (L266) — the queue (L270) feeds the workers (L249) the messages (L270).
- **The fan-out is the event's reach (L247).** The topic (L247) to the queues (L245) — one event (L248), many consumers (L270).
- **The message is the cost (L285).** The per-message pricing (L285) — the queues and the topics (L270) are the cheap backbone (L285).

## 15. Debugging Scenarios

| Symptom | First check (L270) | The lever |
|---|---|---|
| The job processes twice | The idempotency (L255) | The dedupe key (L255) |
| The job vanishes | The visibility timeout (L270) | The timeout > the processing time (L270) |
| The poison fills the queue | The DLQ (L232) | The DLQ + the alert (L274) |
| The event missed | The subscription (L270) | The SNS subscription to the queue (L270) |
| The user waits | The sync call (L222) | The queue (L270) |

## 16. Quick Revision Notes

- SQS & SNS on AWS = **the async backbone** (L270): the queue, the topic, the guarantees, the fan-out.
- SQS: **the queue (L245) — the producer, the consumer, the delete (L245)**.
- SNS: **the pub/sub (L247) — the topic, many subscribers (L247)**.
- The guarantees: **the at-least-once (L254), the visibility timeout (L270), the DLQ (L232)**.
- The fan-out: **the topic to the queues — each consumer's inbox (L270)**.

## 17. Cheat Sheet

```text
SQS & SNS ON AWS = the async backbone behind the AI pipelines

SQS (L245) — THE QUEUE
  the producer sends · the consumer polls, processes, deletes
  the at-least-once (L254) → the idempotent consumer (L255)
  the visibility timeout (L270) · the DLQ (L232)

SNS (L247) — THE TOPIC
  the pub/sub: the topic, many subscribers (L247)
  the Lambda (L266) · the SQS queue · the email (L270)

THE FAN-OUT (L270)
  the SNS topic → the SQS queues (L270)
  the event (L248) delivered to each consumer's inbox (L270)

THE AI SHAPE (L270)
  the job queue (L249) — the model calls (L278), the workflows (L217)
  the event fan-out (L248) — the billing, the webhook, the analytics
  the DLQ (L232) — the poison parked for the replay

INTERVIEW, 4 MOVES
  1 SQS    "the queue — the producer, the consumer (L245)"
  2 guarantees "at-least-once, the timeout, the DLQ (L254, L270, L232)"
  3 SNS    "the pub/sub — the topic, many subscribers (L247)"
  4 fan-out "the topic to the queues (L270)"
```

## 18. Key Takeaways

> [!RECAP]
> - SQS & SNS on AWS is **the async backbone behind the AI pipelines** (L270): SQS (L245), SNS (L247), the fan-out (L270), and the guarantees (L254, L232)
> - **SQS** (L245) is the queue — the producer sends, the consumer processes and deletes; the delivery is at-least-once (L254), so the consumer is idempotent (L255)
> - **The visibility timeout** (L270) hides the in-flight message; **the DLQ** (L232) parks the poison (L270)
> - **SNS** (L247) is the pub/sub — the topic, many subscribers (L247)
> - **The fan-out** (L270) combines them — the SNS topic to the SQS queues, each consumer's own inbox (L270)
> - The AI shape (L270): the job queue (L249) for the model calls (L278) and the workflows (L217), the event fan-out (L248) for the billing and the webhooks, and the DLQ (L232) for the poison — the L245 engine room, AWS-shaped (L270)

## Check your understanding

Answer these without looking back.

1. What's SQS (L245)?
2. What's SNS (L247)?
3. What's the fan-out (L270)?
4. What's the at-least-once (L254)?
5. What's the visibility timeout (L270)?
6. What's the DLQ for (L232)?
7. How do you run an AI job asynchronously (L270)?
8. What is the async backbone's AI shape (L270)?

## A Closing Note — The Mailroom, Open

You now hold the async backbone: **the queue, the topic, the guarantees, and the fan-out — with the slow work decoupled and the events broadcast.** The L260 backend has its engine room — and it's the L245 shape, AWS-shaped (L270).

Next: the containers on AWS — ECS & ECR (L271).
