# Lesson 256 — Retries & Backoff

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the retry policy?" — the answer is the *bounded, jittered, logged* retry: exponential backoff with jitter, max retries, and the log — the policy every AI call needs (L169, L255).**

L255 made retries safe; this lesson is **the policy itself**: retries & backoff — the bounded, jittered, logged retry (L256): the exponential backoff (L256), the jitter (L256), the max retries (L256), and the log (L213). The retry is safe because of the idempotency (L255); the retry is *effective* because of the backoff (L256) — and the AI platform's shape: the provider calls (L152), the service calls (L254), and the jobs (L249) all carry the policy (L256).

The distinction this lesson is built on: a **demo** retries immediately, forever. A **solutions architect** designs the policy: the exponential backoff with the jitter (L256), the bounded max retries (L256), and the logged retries (L213) — the L169 discipline, made concrete (L256).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the retry policy: the bounded, jittered, logged retry (L256)
- Explain the backoff: the exponential growth, with the jitter (L256)
- Explain the bounds: the max retries and the total time (L256)
- Explain the idempotency pairing: the retry safe (L255)
- Explain the logging: the retries observed (L213)

## 1. One-Line Definition

**Retries and backoff are the resilience policy of every AI call (L256) — the exponential backoff with the jitter (L256), the bounded max retries and the total time (L256), made safe by the idempotency (L255), and logged (L213) — the L169 discipline, made concrete (L256): the transient failures (L168) absorbed, the provider's limits (L170) respected.**

The one-sentence interview answer: *"The retry policy is the bounded, jittered, logged retry (L256). The backoff: the delays grow exponentially — 1s, 2s, 4s, 8s (L256) — with the jitter: a random element added, so the retries don't synchronize (L256). The bounds: the max retries and the total time (L256) — the retry is bounded, or it's a runaway (L256). The safety: the retried call is idempotent (L255) — the retry is safe to repeat (L255). And the logging: every retry is logged (L213) — the retries observed, the rate measured (L332). The policy by the failure (L168): the transient failures — the 429 (L170), the 5xx, the timeouts — retried (L256); the permanent ones — the 4xx — not (L168). The AI platform's shape: the provider calls (L152) with the backoff that respects the rate limits (L170), the service calls (L254) with the timeouts (L257), and the jobs (L249) with the retry count (L256)."*

## 2. Mental Model

Think of the retry policy as **the elevator's door-reopen logic — with a smarter wait.** The doors try to close (the call, L256); something's in the way (the transient failure, L168) — the doors wait and try again (the retry, L256). The smart part: each retry waits longer (the exponential backoff, L256) — the first wait is short, the next longer (L256) — and the wait has a random wiggle (the jitter, L256) so all the elevators don't retry at the same moment (L256). The elevator gives up after N tries (the max retries, L256) and tells the passenger (the logged failure, L213). The system works because the waits grow, the timing is jittered, and the tries are bounded (L256).

```text
   the elevator's retries (L256)
   ┌────────────────────────────────────────────────────────┐
   │ try → wait (short) → try (L256)                        │
   │ → wait (longer) → try — the exponential (L256)         │
   │ + the random wiggle (the jitter, L256)                 │
   │ → give up after N (the max, L256) → the log (L213)     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the elevator's waits**: growing, jittered, bounded — and logged when it gives up (L256).

## 3. Visual Flow — The Retry Lifecycle

```text
   a call fails (L168)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CLASSIFY (L168)                                      │
   │     the transient? (429, 5xx, timeout) → retry (L256)    │
   │     the permanent? (4xx) → don't (L168)                  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼ transient
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE BACKOFF (L256)                                   │
   │     delay = base × 2^attempt + jitter (L256)             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE BOUNDS (L256)                                    │
   │     attempt ≤ max? time ≤ max? → retry (L256)            │
   │     exceeded → give up, log (L213)                       │
   └──────────────────────────────────────────────────────────┘
```

The flow is the lifecycle: **classify → backoff → bounds → give up** (L256).

## 4. How It Works — The Backoff, the Bounds, the Pairing

- **The backoff (L256).** The delays grow exponentially (L256): `delay = base × 2^(attempt-1)` (L256) — 1s, 2s, 4s, 8s (L256). The jitter (L256): a random element added (L256) — so the retries don't synchronize (the thundering herd, L256).
- **The bounds (L256).** The max retries and the total time (L256): the retry is bounded (L256) — or the failed call retries forever (L256). The bounds are the policy's cost control (L256).
- **The classification (L168).** The transient failures retry (L256): the 429 (L170), the 5xx, the timeout (L168). The permanent — the 4xx (L168) — don't (L168).
- **The pairing (L255).** The retry is safe because the call is idempotent (L255): the retried side effects are deduplicated (L255) — the L255 contract under the L256 policy (L256).
- **The logging (L213).** Every retry is logged (L213): the attempt, the delay, the failure (L332) — the retries observed, the rate measured (L256).

> [!NOTE]
> **The jitter is what makes the retries a herd-proof policy (L256).** Without the jitter (L256), the retries synchronize (L256): every client with the same base and the same failure retries at the same moment — the thundering herd (L256) — making the failure worse (L256). The jitter (L256) — a random element in the delay (L256) — spreads the retries (L256): the first few retry, the rest wait (L256). The senior answer always includes the jitter (L256): the exponential backoff without it is the herd's recipe (L256).

## 5. Real Project Usage

- **The provider calls (L152).** The model calls (L145) with the backoff that respects the provider's rate limits (L170) — the 429s (L170) waited out, the jitter (L256) spreading the load (L256).
- **The service calls (L254).** The service-to-service calls (L254) with the retries (L256) and the timeouts (L257) — the transient failures (L168) absorbed (L256).
- **The jobs (L249).** The background jobs (L249) with the retry count (L256) — the retries bounded (L256), the DLQ (L232) catching the poison (L256).
- **The webhook deliveries (L220).** The event deliveries (L247) with the backoff (L256) — the provider's retries (L232) respected (L256).
- **Anything failing (L260).** The retry policy (L256) is the L260 platform's resilience (L260) — the bounded, jittered, logged retry (L256).

The through-line: **the elevator's waits** — growing, jittered, bounded, and logged — the policy every AI call carries (L256).

## 6. Interview Explanation

Say it in four moves:

1. **The policy.** "The bounded, jittered, logged retry (L256)."
2. **The backoff.** "The exponential growth (L256) + the jitter (L256)."
3. **The bounds.** "The max retries and the total time (L256)."
4. **The pairing.** "Idempotent (L255) — the retry safe to repeat (L255)."

## 7. Senior-Level Insights

- **The policy is by the failure (L168).** The senior answer classifies (L168): the transient — the 429 (L170), the 5xx — retried (L256); the permanent — the 4xx — not (L168).
- **The backoff respects the provider (L170).** The model's rate limits (L170) — the backoff (L256) sized to the provider's retry-after (L170).
- **The jitter is the herd-proof (L256).** The senior answer always includes the jitter (L256) — the synchronized retries (L256) are the thundering herd (L256).
- **The bounds are the cost control (L256).** The max retries (L256) and the total time (L256) — the runaway retry's cost (L150) bounded (L256).
- **The log is the observability (L213).** The retries logged (L213), the rate measured (L332) — the retry's health observed (L256).

## 8. Common Mistakes

- **The immediate retry (L256).** No backoff (L256) — the retries hammer the failing service (L256).
- **The retry forever (L256).** No max (L256) — the runaway (L256) and the bill (L150).
- **No jitter (L256).** The synchronized retries (L256) — the thundering herd (L256).
- **The permanent retried (L168).** The 4xx retried (L168) — the policy unclassified (L256).
- **The non-idempotent retry (L255).** The retried call double-applies (L255) — the L255 contract missing (L256).
- **The unlogged retries (L213).** The failures invisible (L213) — the retry's rate unmeasured (L332).

## 9. Best Practices

- **Classify the failure** (L168) — the transient retried, the permanent not (L256).
- **Back off exponentially** (L256) — `base × 2^attempt` (L256).
- **Add the jitter** (L256) — the herd-proof (L256).
- **Bound the retries** (L256) — the max retries and the total time (L256).
- **Pair with the idempotency** (L255) — the retry safe (L256).
- **Log the retries** (L213) — the attempts, the delays, the failures (L332).

## 10. Interview Questions

**Q: What's the retry policy?**
> A: The bounded, jittered, logged retry (L256). The backoff: the delays grow exponentially (L256) — `base × 2^attempt` — with the jitter (L256) to avoid the synchronized retries (L256). The bounds: the max retries and the total time (L256). The classification: the transient (L168) — the 429 (L170), the 5xx — retried; the permanent — the 4xx — not (L168). The safety: the idempotent call (L255).

**Q: Why the jitter?**
> A: Because the synchronized retries are the thundering herd (L256). Without the jitter (L256), every client with the same base and the same failure retries at the same moment (L256) — the load spikes, the failure worsens (L256). The jitter (L256) — a random element in the delay (L256) — spreads the retries (L256). The exponential backoff without the jitter is the herd's recipe (L256).

**Q: How do you bound the retries?**
> A: The max retries and the total time (L256). The policy stops after N attempts (L256) or after the total budget (L256) — the runaway retry's cost (L150) bounded (L256). The exceeded retries give up and log (L213), and the job (L249) or the call (L254) falls to the failure path — the DLQ (L232) or the degradation (L258).

**Q: How does the retry respect the provider?**
> A: The provider's rate limits (L170). The 429 (L170) carries the retry-after (L170) — the backoff (L256) sized to it (L170). The jitter (L256) spreads the retries across the clients (L256) — the provider's limits (L170) respected, the hammering avoided (L256).

## 11. Follow-Up Questions

- What's the backoff formula (L256)?
- Why the jitter (L256)?
- How do you bound the retries (L256)?
- How does the policy classify (L168)?
- How does it pair with the idempotency (L255)?

## 12. Comparison Table — The Retry Shapes

| | Immediate (L256) | Fixed (L256) | Exponential + jitter (this lesson) |
|---|---|---|---|
| The delay | none | constant | growing (L256) + jitter (L256) |
| The herd (L256) | — | synchronized | spread (L256) |
| The provider (L170) | hammered | respected-ish | respected (L170) |
| The bounds (L256) | — | max N | max N + total time (L256) |
| The fit (L256) | never | simple | the standard (L256) |

The senior read: **the right column is the policy** — the growing, jittered, bounded retry (L256).

## 13. Code Example — The Policy

```js
// The retry policy: classify → backoff + jitter → bounds → log (L256).
const BASE_DELAY_MS = 1000;
const MAX_ATTEMPTS = 5;
const MAX_TOTAL_MS = 30_000;

async function withRetry(fn) {
  let attempt = 0;
  const startedAt = Date.now();

  while (attempt < MAX_ATTEMPTS) {
    try {
      return await fn();
    } catch (e) {
      // 1 · CLASSIFY (L168) — the transient retried, the permanent not.
      if (isPermanent(e)) throw e;                       // the 4xx (L168)

      attempt += 1;
      if (attempt >= MAX_ATTEMPTS || Date.now() - startedAt > MAX_TOTAL_MS) {
        // 3 · THE BOUNDS (L256) — give up, log (L213).
        log({ event: 'retry.exhausted', attempt, error: e.message, at: Date.now() });  // L213
        throw e;
      }

      // 2 · THE BACKOFF (L256) — exponential + jitter (L256).
      const base = BASE_DELAY_MS * 2 ** (attempt - 1);   // 1s, 2s, 4s, 8s (L256)
      const jitter = Math.random() * base;                // the herd-proof (L256)
      log({ event: 'retry', attempt, delayMs: base + jitter, error: e.message });  // L213
      await sleep(base + jitter);
    }
  }
}

// The idempotency pairing (L255) — the retried call is safe (L255).
await withRetry(() => chargeWithKey(key, amount));        // L227, L255
```

```text
What the reader must SEE — the elevator's waits:

  isPermanent(e)        → the classification (L168)
  BASE × 2^attempt      → the exponential backoff (L256)
  Math.random() × base  → the jitter (L256)
  MAX_ATTEMPTS / MAX_MS → the bounds (L256)
  log({event:'retry'})  → the observability (L213)

  Growing, jittered, bounded, logged — the policy in code.
```

```narrate
3-5: The policy's constants — the base, the max attempts, the total time (L256).
8-10: The classify — the permanent failures are not retried (L168).
11-17: The bounds — the max attempts and the total time; the exhaustion logs and gives up (L256, L213).
19-24: The backoff — the exponential growth (L256) with the jitter (L256), and the retry logged (L213).
26-28: The idempotent call — the retry safe to repeat (L255, L227).
```

> [!TIP]
> The line that makes the policy production: **`const jitter = Math.random() * base`** — the herd-proof (L256). **The exponential backoff without the jitter is the thundering herd; with it, the retries spread (L256).**

## 14. Performance Notes

- **The backoff is the provider's courtesy (L151).** The growing delays (L256) — the failing provider's recovery time (L256), the hammering avoided (L170).
- **The jitter is the herd's prevention (L151).** The spread retries (L256) — the load's spike avoided (L256).
- **The bounds are the cost control (L150).** The max retries (L256) and the total time (L256) — the retry's bill (L150) bounded (L256).
- **The log is the observability (L213).** The retries logged (L213), the rate measured (L332) — the retry's health (L256).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The retries hammer | No backoff (L256) | The exponential (L256) |
| The synchronized spikes | No jitter (L256) | The jitter (L256) |
| The runaway retries | No bounds (L256) | The max attempts (L256) |
| The 4xx retried | No classification (L168) | The isPermanent check (L168) |
| The double side effects | Non-idempotent (L255) | The L255 key (L255) |

## 16. Quick Revision Notes

- The retry policy = **the bounded, jittered, logged retry** (L256).
- The backoff: **`base × 2^attempt`** (L256), with the jitter (L256).
- The bounds: **the max retries and the total time** (L256).
- The classification: **the transient retried, the permanent not** (L168).
- The pairing: **the idempotency (L255) — the retry safe** (L256).
- The log: **the attempts, the delays, the failures** (L213, L332).

## 17. Cheat Sheet

```text
RETRIES & BACKOFF = the bounded, jittered, logged retry

THE BACKOFF (L256)
  delay = base × 2^attempt  — 1s, 2s, 4s, 8s (L256)
  + the jitter (L256) — the random element (L256)
  the jitter spreads the retries — the herd-proof (L256)

THE BOUNDS (L256)
  the max retries (L256) · the total time (L256)
  the runaway retry's cost (L150) bounded (L256)
  the exhaustion → give up + log (L213)

THE CLASSIFICATION (L168)
  the transient — the 429 (L170), the 5xx, the timeout — retried (L256)
  the permanent — the 4xx — not (L168)

THE PAIRING (L255)
  the retried call is idempotent (L255) — safe to repeat (L255)

THE LOG (L213)
  every retry logged (L213): the attempt, the delay, the failure (L332)
  the retry's rate measured — the policy's health (L256)

INTERVIEW, 4 MOVES
  1 policy  "the bounded, jittered, logged retry (L256)"
  2 backoff "exponential + jitter (L256)"
  3 bounds  "max retries + total time (L256)"
  4 pairing "idempotent (L255) — safe to repeat (L255)"
```

## 18. Key Takeaways

> [!RECAP]
> - The retry policy is **the bounded, jittered, logged retry** (L256) — the L169 discipline, made concrete (L256)
> - **The backoff grows exponentially** (L256) — `base × 2^attempt` (L256) — with **the jitter** (L256) that spreads the retries and prevents the thundering herd (L256)
> - **The bounds are the cost control** (L256) — the max retries and the total time (L256) bound the runaway retry's bill (L150)
> - **The classification is by the failure** (L168): the transient — the 429 (L170), the 5xx, the timeout — retried (L256); the permanent — the 4xx — not (L168)
> - **The retry is safe because of the idempotency** (L255) — the L255 contract under the L256 policy (L256)
> - **The retries are logged** (L213) — the attempts, the delays, and the failures (L332), measured as the policy's health (L256)

## Check your understanding

Answer these without looking back.

1. What's the retry policy (L256)?
2. What's the backoff formula (L256)?
3. Why the jitter (L256)?
4. How do you bound the retries (L256)?
5. How does the policy classify (L168)?
6. How does it pair with the idempotency (L255)?
7. What's the exhaustion path (L256)?
8. What does the log record (L213)?

## A Closing Note — The Elevator's Waits

You now hold the policy: **the exponential backoff with the jitter, the max retries and the total time, the classification by the failure, and the idempotency pairing — every retry logged.** The platform's calls now retry deliberately — bounded, spread, and observed (L256).

Next: when to stop calling — circuit breakers & bulkheads (L257), stopping the failing provider and containing the blast radius.
