# Lesson 248 — Event-Driven Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the architecture behind the async AI platform?" — the answer is *event-driven*: events as the contract between AI and the rest of the business (L247, L230).**

L247 gave you the fan-out; this lesson is **the architecture it enables**: event-driven architecture — the events as the contract (L248): the systems communicate by publishing and subscribing to events (L247), instead of calling each other (L254). The AI platform's shape: the AI's work — a generation completed, a tool run, a job failed (L248) — published as events (L247), consumed by the business's systems (L223–227), and the business's events consumed by the AI (L220).

The distinction this lesson is built on: a **demo** calls everything synchronously. A **solutions architect** designs the event-driven seams (L248): the events and their schemas (L248), the topics (L247), the consumers (L247), and the failure story (L232) — the decoupled contract between the AI and the business (L260).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain event-driven architecture: events as the contract (L248)
- Explain the events: the facts, the schemas (L248)
- Explain the flow: the producers, the topics, the consumers (L247)
- Explain the decoupling: the producers and the consumers independent (L248)
- Explain the failure story: the retries, the DLQ, the replay (L232)

## 1. One-Line Definition

**Event-driven architecture is the events as the contract (L248) — the systems communicate by publishing and subscribing to events (L247) instead of calling each other (L254): the producers publish the facts (L248), the topics (L247) route them, and the consumers react (L247) — the decoupled architecture behind the async AI platform, where the AI's work and the business's systems exchange events (L260).**

The one-sentence interview answer: *"Event-driven architecture makes the events the contract (L248). The systems don't call each other (L254) — they publish and subscribe (L247): the producer publishes the fact — 'job completed', 'error raised', 'tenant changed' (L248); the topic (L247) routes it; the consumers react (L247). The value is the decoupling (L248): the producer doesn't know the consumers (L247), the consumers join and leave independently (L248), and each side's failure doesn't block the other (L248). The AI platform's shape (L260): the AI's work — the generations (L145), the tool runs (L201), the failures (L211) — published as events (L247), consumed by the business's systems (L223–227); and the business's events (L220) consumed by the AI (L248). The design: the event schemas (L248), the topics (L247), the consumers' idempotency (L255), and the failure story (L232) — the DLQ (L245) and the replay (L232). The events are the nervous system (L260)."*

## 2. Mental Model

Think of event-driven architecture as **a town square where everyone posts notices — and reads the notices that matter.** The systems (the producers, L248) post their facts to the square (the topics, L247): the bakery posts "bread ready", the bank posts "payment received" (L248). The systems that care (the consumers, L247) check the square and react (L247): the cafe reacts to "bread ready", the AI reacts to "payment received" (L248). Nobody calls anybody (L254) — the notice board is the contract (L248). A new reader joins by reading the board (L247); a producer's failure doesn't stop the board (L248). The town works because the facts are posted, and each system reacts to what matters (L248).

```text
   the town square (the events, L248)
   ┌────────────────────────────────────────────────────────┐
   │ the producers post the facts (L248)                    │
   │ the topics carry them (L247)                           │
   │ the consumers react to what matters (L247)             │
   │ nobody calls anybody (L254) — the board is the contract│
   └────────────────────────────────────────────────────────┘
```

The mental model is **the town square**: the posted facts, the readers reacting — no direct calls (L248).

## 3. Visual Flow — The Event Flow

```text
   something happens in a system (L248)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE PRODUCER (L248)                                  │
   │     the system publishes the fact (L247)                 │
   │     the event's schema — the contract (L248)             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE TOPIC (L247)                                     │
   │     the event is routed to the subscribers (L247)        │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE CONSUMERS (L247)                                 │
   │     each reacts — idempotently (L255)                    │
   │     the failures → the retries (L169) → the DLQ (L232)   │
   └──────────────────────────────────────────────────────────┘
```

The flow is the contract: **produce → route → react** — with the idempotency and the DLQ (L248).

## 4. How It Works — The Events, the Flow, the Decoupling

- **The events (L248).** The facts: "job completed", "error raised", "tenant changed" (L248). Each event has a schema (L248) — the contract (L248): the type, the entity, the data, the timestamp (L248).
- **The flow (L247).** The producer publishes (L247); the topic routes (L247); the consumers react (L247) — the fan-out (L247) carrying the events (L248).
- **The decoupling (L248).** The producer doesn't know the consumers (L247); the consumers join and leave independently (L248); the failures don't propagate (L248) — the queues (L245) buffer (L245).
- **The failure story (L232).** The consumers are idempotent (L255); the failures retry (L169); the poison lands in the DLQ (L232) with the replay (L245) — the same discipline as the queues (L245).
- **The AI shape (L260).** The AI's work published as events (L247): the generations (L145), the tool runs (L201), the failures (L211). The business's events (L220) consumed by the AI (L248). The events are the contract between the AI and the business (L260).

> [!NOTE]
> **The event is a fact, not a command (L248).** The event-driven contract publishes *facts* — "the job completed" (L248) — not commands — "please do X" (L248). The consumer decides how to react (L248): the billing reacts to the completion (L332), the webhook reacts to the change (L220). The fact-based contract (L248) is what makes the decoupling possible (L248): the producer states what happened, and the consumers' reactions are their own (L247). A command would couple them (L248) — the fact keeps them independent (L248).

## 5. Real Project Usage

- **The job completion (L245).** The worker publishes "job completed" (L248) → the billing (L332), the webhook (L220), and the analytics (L328) react (L247).
- **The error events (L211).** The services publish the errors (L248) → the operations' alerts (L208) and the tracing (L213).
- **The tenant events (L357).** The tenant's changes (L357) published (L248) → the provisioning (L283) and the isolation updates (L320) react (L247).
- **The AI-bus (L260).** The AI's work (L145) and the business's systems (L223–227) exchanging events (L248) — the decoupled contract (L260).
- **Anything decoupled (L260).** The event-driven architecture (L248) is the L260 platform's nervous system (L260) — the events as the contract (L248).

The through-line: **the town square** — the facts posted, the systems reacting, the contract between the AI and the business (L248).

## 6. Interview Explanation

Say it in four moves:

1. **The contract.** "The events are the contract (L248) — the systems publish and subscribe (L247)."
2. **The flow.** "Produce → route → react (L247) — the facts, the topics, the consumers (L248)."
3. **The value.** "The decoupling (L248) — the producers and the consumers independent (L247)."
4. **The AI shape.** "The AI's work and the business's events (L248) — the contract between them (L260)."

## 7. Senior-Level Insights

- **The event schema is the contract (L248).** The senior answer designs the events (L248): the type, the entity, the data, the timestamp (L248) — versioned (L341) like any contract (L248).
- **The fact, not the command (L248).** The events state what happened (L248) — the consumers' reactions are their own (L247) — the decoupling's foundation (L248).
- **The idempotency is the consumer's duty (L255).** The at-least-once delivery (L255) — the consumers dedupe (L255) — the event contract assumes it (L248).
- **The seams are the topics (L247).** The senior design places the topics at the seams (L248) — the services publish, the systems subscribe (L247).
- **The failure story is the DLQ (L232).** The retries (L169), the DLQ (L232), and the replay (L245) — the event-driven system's recovery (L248).

## 8. Common Mistakes

- **The command events (L248).** "Do X" instead of "X happened" (L248) — the coupling (L248).
- **The sync calls (L254).** The systems calling each other (L254) — the event seam (L248) missed.
- **No schemas (L248).** The events untyped (L248) — the contract (L248) missing.
- **The non-idempotent consumers (L255).** The redelivered event double-processed (L255) — the dedupe (L255) missing.
- **No DLQ (L232).** The poison event retries forever (L232) — the failure story (L245) missing.
- **The event as the payload (L248).** The full data in the event (L248) — the reference (L248) keeps the events lean (L248).

## 9. Best Practices

- **Design the event schemas** (L248) — the contract, versioned (L341).
- **Publish the facts, not the commands** (L248) — the consumers' reactions are their own (L247).
- **Place the topics at the seams** (L247) — the services publish, the systems subscribe (L248).
- **Make the consumers idempotent** (L255) — the at-least-once assumption (L248).
- **Design the failure story** (L232) — the retries (L169), the DLQ (L232), the replay (L245).
- **Keep the events lean** (L248) — the reference, not the payload (L248).

## 10. Interview Questions

**Q: What is event-driven architecture?**
> A: The events as the contract (L248). The systems don't call each other (L254) — they publish and subscribe (L247): the producer publishes the fact — "job completed" (L248); the topic (L247) routes it; the consumers react (L247). The value is the decoupling (L248) — the producer doesn't know the consumers (L247), and the failures don't propagate (L248).

**Q: Why is the event a fact, not a command?**
> A: Because the fact is what decouples (L248). "The job completed" (a fact) lets each consumer decide its reaction — the billing records (L332), the webhook notifies (L220) (L247). "Please notify the customer" (a command) couples the producer to the consumers' actions (L248). The fact states what happened; the reactions are the consumers' own (L248).

**Q: How do you handle failures?**
> A: The same discipline as the queues (L232): the consumers are idempotent (L255) — the redelivered event is a no-op (L255); the failures retry with the backoff (L169); and the poison events land in the DLQ (L232) with the alert (L208) and the replay (L245). The event-driven system's recovery is part of the design (L248).

**Q: How does the AI platform use it?**
> A: The AI's work is published as events (L247): the generations (L145), the tool runs (L201), the failures (L211) — consumed by the business's systems (L223–227). And the business's events (L220) — the orders, the payments — are consumed by the AI (L248). The events are the contract between the AI and the business (L260) — the decoupled nervous system (L260).

## 11. Follow-Up Questions

- What's in the event schema (L248)?
- Why the fact, not the command (L248)?
- How does the decoupling work (L248)?
- What's the failure story (L232)?
- How does the AI platform use it (L260)?

## 12. Comparison Table — Sync vs Event-Driven

| | Sync calls (L254) | Event-driven (this lesson) |
|---|---|---|
| The contract | the API (L254) | the events (L248) |
| The coupling | the caller knows the callee | decoupled (L248) |
| The failures (L248) | propagate (L257) | buffered by the queues (L245) |
| The scale (L252) | the caller's pace | the consumers independent (L247) |
| The observability (L213) | the request trace | the event trace (L248) |
| The fit (L248) | the immediate response | the async reactions |

The senior read: **the columns are the coupling** — the sync for the immediate, the events for the async (L248).

## 13. Code Example — The Event Contract

```js
// Event-driven: the schema, the publish, the consume (L248, L247).
// THE EVENT SCHEMA (L248) — the contract, versioned (L341).
const JobCompletedEvent = {
  type: 'job.completed',                 // the fact (L248)
  version: 1,                            // the contract's version (L341)
  entity: { type: 'job', id: jobId },    // the entity (L248)
  data: { cost, tokens, model },         // the payload (L248)
  occurredAt: Date.now(),                // the timestamp (L248)
};

// THE PRODUCER (L248) — the fact published (L247).
await publish(JobCompletedEvent);        // the topic (L247)

// THE CONSUMER (L247) — idempotent (L255), the DLQ on the poison (L232).
async function onJobCompleted(event) {
  if (await alreadyProcessed(event.entity.id)) return;   // the dedupe (L255)

  try {
    await billing.record(event.data);          // the billing's reaction (L332)
    await notifyWebhook(event);                // the webhook's reaction (L220)
  } catch (e) {
    await retryOrDeadLetter(event, e);         // the failure story (L232)
  }
}
```

```text
What the reader must SEE — the town square:

  the event schema       → the contract (L248), versioned (L341)
  publish(event)         → the producer posts the fact (L247)
  onJobCompleted(event)  → the consumers react (L247)
  alreadyProcessed       → the idempotency (L255)
  retryOrDeadLetter      → the failure story (L232)

  The facts posted, the systems reacting, nobody calling anybody.
```

```narrate
3-9: The event schema — the contract: the type, the version, the entity, the data, the timestamp (L248, L341).
11-12: The publish — the producer posts the fact to the topic (L247, L248).
14-16: The consume — the consumer reacts, deduplicated (L247, L255).
17-20: The reactions — the billing (L332) and the webhook (L220) each do their own.
21-23: The failures — the retry or the dead letter (L232).
```

> [!TIP]
> The pair that defines the contract: **`type: 'job.completed'`** (the fact, L248) and **`version: 1`** (the contract, L341). **The facts are posted with their schemas — and the systems react to what matters (L248).**

## 14. Performance Notes

- **The async is the latency lever (L151).** The event's publish (L247) returns fast (L222) — the consumer's work off the request path (L245).
- **The queues buffer the bursts (L245).** The consumers' queues (L245) — the event storms absorbed (L222).
- **The idempotency is the correctness (L255).** The dedupe (L255) — the at-least-once delivery's pair (L248).
- **The trace is the observability (L213).** The event's journey (L248) — the distributed trace (L330) through the producers and the consumers (L213).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The consumer double-processes | No idempotency (L255) | The dedupe (L255) |
| The event is a black box | No schema (L248) | The contract (L248) |
| The poison blocks | No DLQ (L232) | The failure story (L245) |
| The coupling | The command events (L248) | The facts (L248) |
| The event lost | No trace (L213) | The event journey (L330) |

## 16. Quick Revision Notes

- Event-driven = **the events as the contract** (L248).
- The events: **the facts, with schemas** (L248), versioned (L341).
- The flow: **produce → route → react** (L247).
- The decoupling: **the producers and the consumers independent** (L248).
- The failure story: **the retries (L169), the DLQ (L232), the replay (L245)**.
- The AI shape: **the contract between the AI and the business** (L260).

## 17. Cheat Sheet

```text
EVENT-DRIVEN ARCHITECTURE = the events as the contract

THE EVENTS (L248)
  the facts — "job completed", "error raised", "tenant changed" (L248)
  the schemas — the type, the entity, the data, the timestamp (L248)
  versioned (L341) — the contract (L248)

THE FLOW (L247)
  the producers publish (L247) · the topics route (L247)
  the consumers react (L247) — the fan-out (L247)

THE DECOUPLING (L248)
  the producer doesn't know the consumers (L247)
  the consumers join and leave independently (L248)
  the failures don't propagate (L248) — the queues buffer (L245)

THE DISCIPLINE (L255, L232)
  the consumers are idempotent (L255) — the at-least-once pair (L255)
  the failures retry (L169) · the poison → the DLQ (L232) · replay (L245)

THE RULE (L248)
  the event is a FACT, not a command (L248)
  the facts keep the systems decoupled (L248)

INTERVIEW, 4 MOVES
  1 contract "the events are the contract (L248)"
  2 flow     "produce, route, react (L247)"
  3 value    "the decoupling (L248)"
  4 AI shape "the contract between the AI and the business (L260)"
```

## 18. Key Takeaways

> [!RECAP]
> - Event-driven architecture makes **the events the contract** (L248): the systems publish and subscribe (L247) instead of calling each other (L254)
> - **The events are the facts** (L248) — "job completed", "error raised" — with schemas (L248) that are versioned (L341) like any contract (L248)
> - **The flow is produce → route → react** (L247) — the topics (L247) carrying the events to the consumers (L247)
> - **The decoupling is the value** (L248) — the producer doesn't know the consumers (L247), the consumers join and leave independently (L248), and the failures don't propagate (L248)
> - **The discipline is the queues'** (L245): the idempotent consumers (L255), the retries (L169), the DLQ (L232), and the replay (L245)
> - The events are **the contract between the AI and the business** (L260) — the AI's work (L145, L201, L211) and the business's events (L220) exchanged through the topics (L247)

## Check your understanding

Answer these without looking back.

1. What's the event contract (L248)?
2. Why the fact, not the command (L248)?
3. What's the flow (L247)?
4. What's the decoupling's value (L248)?
5. What's the failure story (L232)?
6. What's in the event schema (L248)?
7. How does the AI platform use it (L260)?
8. Why version the events (L341)?

## A Closing Note — The Town Square

You now hold the architecture: **the facts posted with their schemas, the topics routing, the consumers reacting — decoupled, idempotent, and recovered through the DLQ.** The AI and the business now talk through the square — the events as their contract (L248).

Next: the work behind the events — background jobs & workers (L249), the long-running AI work off the request path.
