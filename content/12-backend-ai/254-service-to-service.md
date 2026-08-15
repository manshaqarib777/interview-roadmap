# Lesson 254 — Service-to-Service Communication

**Interview importance:** ⭐⭐⭐⭐ — "how do the services talk?" — the answer is *the contracts*: sync calls, async events, and the API contracts between the services (L252, L248).**

L252–253 built the services; this lesson is **how they talk**: service-to-service communication — the sync calls (the request/response APIs, L254), the async events (L248), and the contracts between them (L254). The AI platform's shape: the gateway (L236) calls the chat service (L233) synchronously; the chat service publishes the events (L248) asynchronously — the sync for the request path, the async for the reactions (L254).

The distinction this lesson is built on: a **demo** calls everything synchronously. A **solutions architect** designs the mix: the sync for the request path (L254), the async for the reactions (L248), and the contracts — the versioned APIs (L341) and the event schemas (L248) — that the services share (L254).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the two modes: the sync calls and the async events (L254)
- Explain the sync: the request/response API (L254)
- Explain the async: the event-driven reactions (L248)
- Explain the contracts: the versioned APIs and the schemas (L341, L248)
- Explain the choice: sync vs async by the need (L254)

## 1. One-Line Definition

**Service-to-service communication is how the services talk — the sync calls (the request/response APIs, L254) for the request path, and the async events (L248) for the reactions, bound by the contracts (L254): the versioned APIs (L341) and the event schemas (L248) that the services share (L254) — the mix chosen by the need (L254).**

The one-sentence interview answer: *"The services talk two ways (L254). The sync calls — the request/response API (L254): the gateway (L236) calls the chat service (L233), the chat service calls the generation service (L145) — the request's path, awaiting the response (L254). The async events (L248): the services publish and subscribe (L247) — the job completed, the error raised (L248) — the reactions off the request path (L222). The choice: the sync when the caller needs the answer now (L254) — the request path; the async when the reaction can wait (L248) — the notifications, the analytics, the billing (L332). And the contracts bind them (L254): the APIs versioned (L341) and the event schemas defined (L248) — the shared agreements that the services rely on (L254). The AI platform's mix: the sync for the streaming chat (L251), the async for the job completions and the billing (L248)."*

## 2. Mental Model

Think of the service-to-service communication as **the office's two ways of asking.** The first: the phone call (the sync call, L254) — you call the other department and wait for the answer (the request/response, L254): "what's the balance?" (the gateway to the data service, L189). The second: the memo (the async event, L248) — you post the notice and the other departments react when they can (L248): "job completed" (the billing reacts, L332). The phone for the answers you need now (L254); the memo for the reactions that can wait (L248). And the office's agreements — the forms (the contracts, L254): the phone scripts (the APIs, L341) and the memo formats (the schemas, L248) — are shared and versioned (L254).

```text
   the phone (the sync, L254)     the memo (the async, L248)
   ┌──────────────────────┐       ┌──────────────────────────────┐
   │ ask · wait · answer  │       │ post the notice · the others  │
   │ (the request path,   │       │ react when they can (L248)   │
   │  L254)               │       └──────────────────────────────┘
   └──────────────────────┘
        the contracts (L254): the APIs (L341), the schemas (L248)
```

The mental model is **the phone and the memo**: the answers now vs the reactions later, bound by the shared contracts (L254).

## 3. Visual Flow — The Two Modes

```text
   a service needs another (L254)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE NEED (L254)                                      │
   │     the answer now? → the SYNC call (L254)               │
   │     the reaction later? → the ASYNC event (L248)         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE SYNC (L254)                                      │
   │     the request/response API (L254), with the retries    │
   │     (L256) and the timeouts (L257)                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE ASYNC (L248)                                     │
   │     the event published (L247), the consumers react      │
   │     (L248) — idempotently (L255)                         │
   └──────────────────────────────────────────────────────────┘
```

The flow is the mix: **the need → the sync or the async** — bound by the contracts (L254).

## 4. How It Works — The Modes, the Contracts, the Choice

- **The sync (L254).** The request/response API (L254): the caller awaits the response (L254) — the request path (L233). The sync needs the retries (L256), the timeouts (L257), and the circuit breaker (L257).
- **The async (L248).** The events (L248): the publisher posts (L247), the consumers react (L248) — the reactions off the request path (L222), with the idempotency (L255) and the DLQ (L232).
- **The contracts (L254).** The agreements: the versioned APIs (L341) — the sync's contract (L254); the event schemas (L248) — the async's contract (L248). The contracts are what the services rely on (L254).
- **The choice (L254).** The need decides (L254): the answer now → the sync (L254); the reaction can wait → the async (L248). The sync for the request path (L233), the async for the notifications, the analytics, and the billing (L332).

> [!NOTE]
> **The sync and the async are a mix, not a war (L254).** The senior design uses both (L254): the sync for the answers the caller needs now (L254) — the request path's flow (L233); the async for the reactions that can wait (L248) — the notifications, the billing, the analytics (L332). The sync couples the caller to the callee's availability (L257) — the circuit breaker (L257) and the degradation (L258) follow; the async decouples (L248) — the idempotency (L255) and the DLQ (L232) follow. The mix is designed by the need (L254), and the contracts (L254) bind both modes (L254).

## 5. Real Project Usage

- **The streaming chat (L251).** The gateway (L236) calls the chat service (L233) synchronously (L254) — the stream (L251) awaited by the caller (L254).
- **The job completion (L248).** The generation service (L145) publishes "job completed" (L248) — the webhook (L220), the billing (L332), and the analytics (L328) react asynchronously (L248).
- **The profile lookup (L254).** The chat service calls the data service (L189) synchronously (L254) — the answer now (L254).
- **The cache invalidation (L244).** The update service publishes "data changed" (L248) — the caches (L244) invalidated asynchronously (L248).
- **Anything split (L260).** The service-to-service mix (L254) is the L260 platform's communication (L260) — the sync and the async by the need (L254).

The through-line: **the phone and the memo** — the sync for the answers now, the async for the reactions later, bound by the contracts (L254).

## 6. Interview Explanation

Say it in four moves:

1. **The modes.** "The sync calls (L254) and the async events (L248)."
2. **The sync.** "The request/response API (L254) — the answer now (L254)."
3. **The async.** "The events (L248) — the reactions later (L248)."
4. **The contracts.** "The versioned APIs (L341) and the schemas (L248) — the agreements (L254)."

## 7. Senior-Level Insights

- **The need decides the mode (L254).** The senior answer chooses by the caller's need (L254): the answer now → the sync (L254); the reaction can wait → the async (L248).
- **The sync's costs are the resilience (L257).** The sync couples (L254) — the timeouts (L257), the retries (L256), and the circuit breaker (L257) follow (L254).
- **The async's costs are the correctness (L255).** The events (L248) — the idempotency (L255), the DLQ (L232), and the replay (L245) follow (L254).
- **The contracts are the versioned agreements (L341).** The APIs (L341) and the schemas (L248) — versioned (L341), the services' shared reliance (L254).
- **The trace spans both (L213).** The sync's calls and the async's events (L213) — the distributed trace (L330) across the modes (L254).

## 8. Common Mistakes

- **Everything sync (L254).** The notifications awaited (L254) — the request path bloated (L222), the coupling (L257) everywhere (L254).
- **Everything async (L248).** The answer-now requests as events (L248) — the caller waiting on the event's round trip (L248).
- **No contracts (L254).** The services reaching into each other (L253) — the APIs (L341) and the schemas (L248) missing (L254).
- **The sync without the resilience (L257).** No timeout (L257), no breaker (L257) — the caller hangs (L257).
- **The async without the idempotency (L255).** The redelivered event double-processed (L255) — the dedupe (L255) missing (L254).
- **The contracts unversioned (L341).** The APIs breaking the consumers (L341) — the versioning (L341) missing (L254).

## 9. Best Practices

- **Choose by the need** (L254) — the answer now → the sync (L254); the reaction later → the async (L248).
- **Resilience the sync** (L257) — the timeouts (L257), the retries (L256), the breaker (L257).
- **Correctness the async** (L255) — the idempotency (L255), the DLQ (L232).
- **Define the contracts** (L254) — the APIs (L341) and the schemas (L248), versioned (L341).
- **Trace across the modes** (L213) — the distributed trace (L330).
- **Keep the mix explicit** (L254) — the sync for the request path, the async for the reactions (L254).

## 10. Interview Questions

**Q: How do the services talk?**
> A: Two ways (L254). The sync calls — the request/response API (L254): the gateway (L236) calls the chat service (L233) and awaits the stream (L251). The async events (L248): the services publish and subscribe (L247) — the job completed, the error raised (L248). The choice: the answer now → the sync (L254); the reaction can wait → the async (L248).

**Q: When is the sync right?**
> A: When the caller needs the answer now (L254): the request path (L233) — the gateway's call to the chat service (L236), the chat's call to the data service (L189). The sync couples the caller to the callee's availability (L257), so it brings the resilience: the timeouts (L257), the retries (L256), and the circuit breaker (L257) (L254).

**Q: When is the async right?**
> A: When the reaction can wait (L248): the notifications (L220), the billing (L332), the analytics (L328). The service publishes the event (L247), and the consumers react when they can (L248) — off the request path (L222). The async brings its own discipline: the idempotency (L255), the DLQ (L232), and the replay (L245) (L254).

**Q: What binds the services?**
> A: The contracts (L254). The sync's contract is the versioned API (L341); the async's contract is the event schema (L248). Both versioned (L341) — the shared agreements the services rely on (L254). A change to a contract is announced (L341), and the consumers migrate (L341). The contracts are the services' shared language (L254).

## 11. Follow-Up Questions

- What are the two modes (L254)?
- When is the sync right (L254)?
- When is the async right (L248)?
- What are the contracts (L254)?
- How do the costs differ (L257, L255)?

## 12. Comparison Table — Sync vs Async

| | Sync (L254) | Async (this lesson, L248) |
|---|---|---|
| The pattern | the request/response (L254) | the events (L248) |
| The caller | awaits (L254) | publishes (L247) |
| The coupling (L254) | coupled (L257) | decoupled (L248) |
| The costs (L254) | timeouts, retries, breakers (L257) | idempotency, DLQ (L255) |
| The fit (L254) | the answer now | the reaction later |
| The AI case (L251) | the streaming chat (L251) | the job completions (L248) |

The senior read: **the need column is the choice** — the answer now vs the reaction later (L254).

## 13. Code Example — The Two Modes

```js
// Service-to-service: the sync and the async, bound by the contracts (L254).
// THE SYNC (L254) — the request path (L233), with the resilience (L257).
async function chatWithGeneration(input) {
  return withTimeout(                                          // the timeout (L257)
    withRetry(() => generationApi.generate(input), { backoff: true }),  // the retry (L256)
    10_000,
  );
}

// THE ASYNC (L248) — the reactions, with the correctness (L255).
async function onGenerationCompleted(event) {
  if (await alreadyProcessed(event.jobId)) return;             // the idempotency (L255)

  await notifyWebhook(event);      // the notification's reaction (L220)
  await billing.record(event);     // the billing's reaction (L332)
  await analytics.send(event);     // the analytics' reaction (L328)
  await markProcessed(event.jobId);
}

// THE CONTRACTS (L254) — the shared agreements (L341, L248).
//   the API:  POST /v1/generations → the sync's contract (L254, L341)
//   the event: { type: 'generation.completed', jobId, cost } → the async's (L248)
```

```text
What the reader must SEE — the phone and the memo:

  withTimeout + withRetry → the sync's resilience (L257, L256)
  alreadyProcessed        → the async's idempotency (L255)
  the contracts           → the versioned API (L341) + the schema (L248)

  The answer now, the reactions later — bound by the contracts.
```

```narrate
4-8: The sync — the request path's call, with the timeout (L257) and the retry (L256).
11-16: The async — the event's consumers, deduplicated (L255): the webhook (L220), the billing (L332), the analytics (L328).
18-19: The contracts — the versioned API (L341) and the event schema (L248) that bind the modes (L254).
```

> [!TIP]
> The pair that shows the mix: **`withTimeout(withRetry(...))`** (the sync's resilience, L257) beside **`alreadyProcessed(event.jobId)`** (the async's correctness, L255). **The phone answers with the breakers; the memo reacts idempotently — the mix, bound by the contracts (L254).**

## 14. Performance Notes

- **The sync is the request path's latency (L151).** The awaited call (L254) — the timeout (L257) bounds the hang (L257).
- **The async is the request path's relief (L222).** The events (L248) off the path (L222) — the notifications and the billing don't block the response (L254).
- **The contracts are the versioning's cost (L341).** The APIs and the schemas (L254) — versioned (L341), the migration (L341) managed (L254).
- **The trace spans the modes (L213).** The sync's calls and the async's events (L213) — the distributed trace (L330) across both (L254).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The caller hangs | No timeout (L257) | The sync's resilience (L254) |
| The reactions double | No idempotency (L255) | The async's dedupe (L254) |
| The consumers break | The contracts unversioned (L341) | The versioning (L341) |
| The request path bloats | Everything sync (L254) | The async for the reactions (L248) |
| The failure is opaque | No distributed trace (L213) | The trace across the modes (L330) |

## 16. Quick Revision Notes

- Service-to-service = **the sync calls and the async events** (L254).
- The sync: **the request/response (L254), the resilience (L257)**.
- The async: **the events (L248), the correctness (L255)**.
- The contracts: **the versioned APIs (L341) and the schemas (L248)**.
- The choice: **the answer now → sync; the reaction later → async** (L254).
- The trace: **across the modes (L213, L330)**.

## 17. Cheat Sheet

```text
SERVICE-TO-SERVICE = the phone and the memo

THE TWO MODES (L254)
  sync   the request/response API (L254) — the answer now (L254)
         the request path (L233) — with the resilience (L257):
         the timeouts (L257), the retries (L256), the breakers (L257)
  async  the events (L248) — the reactions later (L248)
         off the request path (L222) — with the correctness (L255):
         the idempotency (L255), the DLQ (L232)

THE CONTRACTS (L254)
  the sync's contract  — the versioned API (L341)
  the async's contract — the event schema (L248)
  the shared agreements the services rely on (L254)

THE CHOICE (L254)
  the answer now  → the sync (L254)
  the reaction can wait → the async (L248)
  the mix is designed by the need (L254)

THE TRACE (L213)
  the sync's calls and the async's events (L213)
  one distributed trace across the modes (L330)

INTERVIEW, 4 MOVES
  1 modes   "the sync calls and the async events (L254)"
  2 sync    "the answer now, with the breakers (L257)"
  3 async   "the reactions later, idempotent (L255)"
  4 contracts "the versioned APIs (L341) and the schemas (L248)"
```

## 18. Key Takeaways

> [!RECAP]
> - Service-to-service communication is **the sync calls and the async events** (L254) — the phone and the memo (L254)
> - **The sync** (L254) is the request/response API for the answers the caller needs now (L254) — the request path (L233) — with the timeouts (L257), the retries (L256), and the circuit breakers (L257)
> - **The async** (L248) is the events for the reactions that can wait (L248) — off the request path (L222) — with the idempotency (L255), the DLQ (L232), and the replay (L245)
> - **The contracts bind both** (L254): the versioned APIs (L341) and the event schemas (L248) — the shared agreements (L254)
> - **The choice is the need** (L254): the answer now → the sync (L254); the reaction can wait → the async (L248) — the mix designed, not defaulted (L254)
> - The distributed trace (L330) spans **both modes** (L213) — the L260 platform's communication, designed by the need (L260)

## Check your understanding

Answer these without looking back.

1. What are the two modes (L254)?
2. When is the sync right (L254)?
3. When is the async right (L248)?
4. What are the sync's costs (L257)?
5. What are the async's costs (L255)?
6. What are the contracts (L254)?
7. Why version them (L341)?
8. How does the trace span the modes (L213)?

## A Closing Note — The Phone and the Memo

You now hold the communication: **the sync for the answers now, the async for the reactions later, and the versioned contracts that bind both.** The services now talk — deliberately, by the need (L254).

Next: the correctness of the retries — idempotency (L255), where retries are only safe if the retried call is safe to repeat.
