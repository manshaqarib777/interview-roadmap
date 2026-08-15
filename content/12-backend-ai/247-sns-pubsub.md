# Lesson 247 — SNS & Pub/Sub

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you broadcast events?" — the answer is *pub/sub*: SNS's fan-out — one event, many subscribers — the pattern behind the event-driven AI platform (L248).**

L245's queue was point-to-point; this lesson is **the fan-out**: SNS & pub/sub — the publish/subscribe pattern: one event published, many subscribers receive it (L247). The AI platform's shape: an event — a job completed, an error, a model change (L248) — published to a topic (L247), fanned out to the subscribers — the queues (L245), the functions (L266), the email, the webhooks (L220).

The distinction this lesson is built on: a **demo** sends events to one consumer. A **solutions architect** designs the topic: the publisher (L247), the subscribers (L247), the fan-out (L247), and the filtering (L247) — because the decoupled events (L248) are the platform's nervous system (L260).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain pub/sub: one event, many subscribers (L247)
- Explain SNS: the managed topic service (L247)
- Explain the fan-out: the event to the queues and the functions (L247)
- Explain the filtering: the subscribers' interest (L247)
- Explain the AI shape: the events of the platform (L248)

## 1. One-Line Definition

**SNS & pub/sub is the fan-out pattern — one event published to a topic (L247), many subscribers receive it (L247): the queues (L245), the functions (L266), the endpoints (L220) — the decoupled broadcast behind the event-driven AI platform (L248), with the filtering (L247) deciding which subscriber gets which event (L247).**

The one-sentence interview answer: *"Pub/sub is the fan-out (L247). The publisher — a service, a workflow (L217) — publishes an event to a topic (L247): 'job completed', 'error raised', 'model updated' (L248). The subscribers — the queues (L245), the Lambda functions (L266), the webhooks (L220), the email — each subscribed to the topic (L247), each receiving a copy of the event (L247). SNS is the managed topic service (L247): the topic, the subscriptions, the fan-out, and the filtering (L247) — the subscriber's filter decides which events it gets (L247). The value: the decoupling (L248) — the publisher doesn't know the subscribers (L247), and new subscribers join without changing the publisher (L248). The AI platform's events (L248) — the jobs, the errors, the changes — flow through the topics (L247), the nervous system of the platform (L260)."*

## 2. Mental Model

Think of SNS as **the building's PA system (public address).** The announcements (the events, L247) are made over the PA (the topic, L247): "the job is done", "the error occurred" (L248). The people (the subscribers, L247) hear the announcements relevant to them: the operations team hears the errors (the alert, L208), the billing hears the jobs' completions (L332), the webhooks (L220) hear the changes. The PA doesn't know who's listening (the decoupling, L248) — anyone can listen in (the subscription, L247), and the listeners filter for what matters to them (L247). The building works because the announcements are broadcast, and each listener takes what it needs (L247).

```text
   the PA system (SNS, L247)
   ┌────────────────────────────────────────────────────────┐
   │ the announcement (the event, L247)                     │
   │ the topic (L247) → the listeners (the subscribers,     │
   │ L247) — each takes what it needs (the filter, L247)    │
   │ the PA doesn't know who's listening (L248)             │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the PA system**: the broadcast, the listeners, and each listener taking what it needs (L247).

## 3. Visual Flow — The Fan-out

```text
   an event happens (L248)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE PUBLISH (L247)                                   │
   │     the service publishes to the topic (L247)            │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE FAN-OUT (L247)                                   │
   │     the topic delivers to every subscriber (L247)        │
   │     the queues (L245) · the functions (L266) · the       │
   │     webhooks (L220) · the email (L224)                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE FILTERS (L247)                                   │
   │     each subscriber's filter (L247) decides which        │
   │     events it receives (L247)                            │
   └──────────────────────────────────────────────────────────┘
                      ▼
   each subscriber processes its copy (L245, L266)
```

The flow is the fan-out: **publish → fan out → filter → process** — the PA's broadcast (L247).

## 4. How It Works — The Topic, the Subscribers, the Filter

- **The topic (L247).** The event's channel: the publisher publishes to the topic (L247), and the topic delivers to the subscribers (L247). The topic is the decoupling point (L248): the publisher doesn't know the subscribers (L247).
- **The subscribers (L247).** The consumers of the topic: the queues (L245), the Lambda functions (L266), the HTTP endpoints (the webhooks, L220), the email (L224). Each subscriber receives a copy of the event (L247).
- **The fan-out (L247).** The topic's delivery: one publish, many copies (L247) — the point-to-point queue's (L245) counterpart (L247).
- **The filtering (L247).** The subscriber's filter (L247): the subscription policy (L247) decides which events the subscriber receives (L247) — the operations team's topic subscription filters for the errors (L247).
- **The AI shape (L248).** The platform's events (L248): the job completed (L245), the error raised (L211), the model updated (L341), the tenant changed (L357) — published to the topics (L247), the nervous system of the platform (L260).

> [!NOTE]
> **The decoupling is the pub/sub's value (L247, L248).** The publisher publishes to the topic (L247) — it knows nothing about the subscribers (L247): a new subscriber joins without the publisher's change (L248), and a subscriber's failure doesn't affect the publisher (L248). The senior design uses the topics (L247) at the platform's seams (L248): the services publish their events (L247), and the downstream systems subscribe (L247) — the event-driven architecture (L248) built on the fan-out (L247).

## 5. Real Project Usage

- **The job completion (L245).** The worker publishes "job completed" (L247) → the fan-out (L247) → the webhook (L220), the billing (L332), and the analytics (L328) each get a copy (L247).
- **The error alert (L211).** The service publishes "error" (L247) → the operations' subscription (L247) with the filter (L247) → the alert (L208).
- **The model update (L341).** The model registry publishes "model changed" (L247) → the cache invalidation (L244) and the config reload (L247).
- **The tenant events (L357).** The tenant's changes (L357) published (L247) → the per-tenant subscribers (L320).
- **Anything decoupled (L260).** The topics (L247) are the L260 platform's nervous system (L260) — the events flowing (L248).

The through-line: **the PA system** — the events broadcast, the subscribers filtering, the decoupling carrying the platform's signals (L247).

## 6. Interview Explanation

Say it in four moves:

1. **The pattern.** "One event, many subscribers (L247) — the fan-out (L247)."
2. **The topic.** "The publisher publishes; the topic delivers (L247)."
3. **The filter.** "Each subscriber's filter (L247) decides what it gets (L247)."
4. **The value.** "The decoupling (L248) — new subscribers join without the publisher's change (L247)."

## 7. Senior-Level Insights

- **The topic is the seam (L248).** The senior answer places the topics at the platform's seams (L248) — the services publish, the systems subscribe (L247) — the event-driven architecture (L248).
- **The fan-out is the one-to-many (L247).** The point-to-point queue (L245) is one-to-one; the topic (L247) is one-to-many (L247) — the pattern by the consumers' count (L247).
- **The filter is the subscriber's contract (L247).** The subscription policy (L247) — the subscriber receives only what it needs (L247) — the fan-out's efficiency (L247).
- **The decoupling is the resilience (L248).** The subscriber's failure doesn't affect the publisher (L248) — the queues (L245) buffer (L245), the functions (L266) retry (L169).
- **The ordering is the topic's limit (L247).** The fan-out is best-effort ordered (L247) — the strictly-ordered flows use the FIFO queue (L246), not the topic (L247).

## 8. Common Mistakes

- **The queue for the fan-out (L245).** The one-to-one for the one-to-many (L247) — each subscriber re-implementing the publish (L247).
- **The topic for the point-to-point (L245).** The one-to-many for a single consumer (L247) — the queue (L245) is simpler (L247).
- **No filters (L247).** Every subscriber receives everything (L247) — the fan-out's noise (L247).
- **The publisher knows the subscribers (L248).** The coupling (L248) — the decoupling point missed (L247).
- **The ordering expected (L247).** The best-effort order (L247) — the FIFO (L246) for the strict (L247).
- **The event as the payload (L248).** The full data in the event (L248) — the reference (L248) vs the event's size (L247).

## 9. Best Practices

- **Place the topics at the seams** (L248) — the services publish, the systems subscribe (L247).
- **Filter the subscriptions** (L247) — each subscriber receives what it needs (L247).
- **Keep the publisher decoupled** (L247) — it knows nothing about the subscribers (L248).
- **Use the queues for the buffering** (L245) — the subscribers' queues (L247) absorb the bursts (L222).
- **Keep the events lean** (L248) — the reference, not the payload (L247).
- **Use the FIFO for the strict order** (L246) — not the topic (L247).

## 10. Interview Questions

**Q: What is pub/sub?**
> A: The fan-out pattern (L247): one event published to a topic (L247), many subscribers receive it (L247) — the queues (L245), the functions (L266), the webhooks (L220). SNS is the managed topic service (L247): the topic, the subscriptions, the fan-out, and the filtering (L247). The value is the decoupling (L248) — the publisher doesn't know the subscribers (L247).

**Q: Topic or queue?**
> A: The consumers' count decides (L247). The queue (L245) is point-to-point — one consumer (L245). The topic (L247) is one-to-many — the fan-out (L247): a job's completion reaching the webhook, the billing, and the analytics (L247). The queue for the one-to-one (L245); the topic for the one-to-many (L247).

**Q: How do the filters work?**
> A: The subscription policy (L247). Each subscriber's subscription has a filter (L247) — the operations team's subscription filters for the errors, the billing's for the completions (L247). The subscriber receives only what its filter matches (L247) — the fan-out stays efficient (L247).

**Q: What's the AI platform's use?**
> A: The events (L248): the job completed (L245), the error raised (L211), the model updated (L341). The services publish to the topics (L247); the downstream — the webhooks (L220), the alerts (L208), the analytics (L328) — subscribe with the filters (L247). The topics are the platform's nervous system (L260) — the events flowing between the decoupled parts (L248).

## 11. Follow-Up Questions

- What's the fan-out (L247)?
- Topic vs queue (L247)?
- How do the filters work (L247)?
- What's the decoupling's value (L248)?
- What are the platform's events (L248)?

## 12. Comparison Table — Queue vs Topic

| | Queue (L245) | Topic (this lesson) |
|---|---|---|
| The pattern | point-to-point (L245) | fan-out (L247) |
| The consumers | one (L245) | many (L247) |
| The delivery | at-least-once (L255) | a copy per subscriber (L247) |
| The filtering | n/a | the subscription filters (L247) |
| The ordering (L246) | FIFO available | best-effort (L247) |
| The fit (L247) | the one-to-one | the one-to-many |

The senior read: **the consumer count is the choice** — the queue for the one, the topic for the many (L247).

## 13. Code Example — The Fan-out

```js
// SNS & pub/sub: the topic, the subscribers, the filter (L247).
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({ region: 'us-east-1' });

// THE PUBLISH (L247) — the publisher knows only the topic (L248).
await sns.send(new PublishCommand({
  TopicArn: process.env.JOB_EVENTS_TOPIC,
  Message: JSON.stringify({ type: 'job.completed', jobId, tenant, cost }),  // L248
  // the message attributes — the filter's inputs (L247):
  MessageAttributes: { type: { DataType: 'String', StringValue: 'job.completed' } },
}));

// THE SUBSCRIBERS (L247) — each with its filter (L247).
//   the webhook subscription:  filter policy { type: ["job.completed"] }   → L220
//   the billing subscription:  filter policy { type: ["job.completed"] }   → L332
//   the operations:            filter policy { type: ["error.raised"] }    → L208
//   the analytics:             filter policy { type: ["*"] }               → L328

// THE CONSUMER — the Lambda's queue (L247, L266).
//   the topic fans out to the queues (L245) → the Lambda (L266) processes.
```

```text
What the reader must SEE — the PA system:

  PublishCommand to the topic → the publisher knows only the topic (L247, L248)
  MessageAttributes           → the filters' inputs (L247)
  the subscription policies   → each listener takes what it needs (L247)
  the queues → the Lambda     → the fan-out's consumers (L266)

  The broadcast, the listeners, each taking what it needs.
```

```narrate
5-8: The publish — the event to the topic, with the attributes for the filters (L247, L248).
10-13: The subscribers' filters — the webhook, the billing, the operations, the analytics each subscribe with their policy (L247).
15-16: The consumption — the topic fans out to the queues (L245), and the Lambda (L266) processes (L283).
```

> [!TIP]
> The pair that shows the decoupling: **`TopicArn`** (the publisher's only knowledge, L247) and **`MessageAttributes`** (the filters' inputs, L247). **The publisher broadcasts to the topic; the listeners filter their own copies — the PA doesn't know who's listening (L247).**

## 14. Performance Notes

- **The fan-out is the broadcast's cost (L150).** One publish, many copies (L247) — the delivery cost scales with the subscribers (L247).
- **The filters are the efficiency (L151).** The subscription policies (L247) — the subscriber receives only what it needs (L247).
- **The queues buffer the bursts (L245).** The subscribers' queues (L245) — the Lambda (L266) and the workers absorb the fan-out's bursts (L222).
- **The ordering is best-effort (L247).** The topic's order (L247) — the FIFO queue (L246) for the strict (L247).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The subscriber misses events | The filter too narrow (L247) | The subscription policy (L247) |
| The fan-out is noisy | No filters (L247) | The subscription policies (L247) |
| The publisher couples | It knows the subscribers (L248) | The topic's decoupling (L247) |
| The order wrong | The best-effort topic (L247) | The FIFO queue (L246) |
| The bursts overwhelm | No subscriber queues (L245) | The buffers (L222) |

## 16. Quick Revision Notes

- Pub/sub = **the fan-out** (L247): one event, many subscribers.
- The topic: **the decoupling point** (L247) — the publisher knows only the topic (L248).
- The subscribers: **the queues (L245), the functions (L266), the webhooks (L220)**.
- The filters: **the subscription policies** (L247).
- The ordering: **best-effort (L247)** — the FIFO (L246) for the strict (L247).
- The AI shape: **the platform's events (L248) — the nervous system (L260)**.

## 17. Cheat Sheet

```text
SNS & PUB/SUB = the fan-out — the PA system

THE PATTERN (L247)
  the publisher publishes to the topic (L247)
  the topic delivers to every subscriber (L247)
  the subscribers: the queues (L245), the functions (L266),
  the webhooks (L220), the email (L224)

THE DECOUPLING (L247, L248)
  the publisher knows only the topic (L247)
  the new subscribers join without the publisher's change (L248)
  the subscriber's failure doesn't affect the publisher (L248)

THE FILTERS (L247)
  the subscription policies (L247)
  each subscriber receives what its filter matches (L247)

THE ORDERING (L247)
  best-effort on the topic (L247)
  the FIFO queue (L246) for the strictly-ordered flows (L247)

THE AI SHAPE (L248)
  the events: the job completed (L245), the error (L211),
  the model updated (L341)
  the topics = the platform's nervous system (L260)

INTERVIEW, 4 MOVES
  1 pattern  "one event, many subscribers (L247)"
  2 topic    "the decoupling point (L247, L248)"
  3 filters  "the subscription policies (L247)"
  4 AI shape "the platform's events (L248, L260)"
```

## 18. Key Takeaways

> [!RECAP]
> - Pub/sub is **the fan-out pattern** (L247): one event published to a topic (L247), many subscribers receive it (L247)
> - **The topic is the decoupling point** (L247) — the publisher knows only the topic (L247), and new subscribers join without the publisher's change (L248)
> - **The subscribers are the queues (L245), the functions (L266), and the webhooks (L220)** — each receiving its copy of the event (L247)
> - **The subscription filters** (L247) decide which events each subscriber receives (L247) — the fan-out's efficiency (L247)
> - **The ordering is best-effort** (L247) on the topic — the strictly-ordered flows use the FIFO queue (L246), not the topic (L247)
> - The topics are **the L260 platform's nervous system** (L260) — the platform's events (L248) — the job completions (L245), the errors (L211), and the model changes (L341) — flowing between the decoupled parts (L248)

## Check your understanding

Answer these without looking back.

1. What's the fan-out (L247)?
2. Why is the topic the decoupling point (L247)?
3. Who are the subscribers (L247)?
4. How do the filters work (L247)?
5. What's the ordering (L247)?
6. What are the platform's events (L248)?
7. Topic vs queue (L247)?
8. Why is it the nervous system (L260)?

## A Closing Note — The PA System

You now hold the fan-out: **the topic that decouples, the subscribers that filter, and the events that flow between the platform's parts.** The AI platform now has a nervous system — every signal broadcast, each listener taking what it needs (L247).

Next: the architecture the events enable — event-driven architecture (L248), events as the contract between AI and the business.
