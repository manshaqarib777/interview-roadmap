# Lesson 257 — Circuit Breakers & Bulkheads

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you stop a cascading failure?" — the answer is the *breaker and the bulkhead*: stop calling the failing provider — and contain the blast radius (L256, L258).**

L256 retried; this lesson is **when to stop**: circuit breakers & bulkheads — the two resilience patterns that contain the failures (L257): the **circuit breaker** — stops calling the failing provider after a threshold (L257), giving it time to recover (L256); the **bulkhead** — isolates the services' resources (L257), so one overloaded service doesn't starve the others (L257).

The distinction this lesson is built on: a **demo** keeps calling the dead provider. A **solutions architect** breaks the circuit (L257) and bulkheads the services (L257) — the failures contained, the platform surviving (L258).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the circuit breaker: the three states and the threshold (L257)
- Explain the breaker's flow: closed → open → half-open (L257)
- Explain the bulkhead: the resource isolation (L257)
- Explain the pair: the breaker stops, the bulkhead contains (L257)
- Explain the AI shape: the provider and the service failures (L257)

## 1. One-Line Definition

**Circuit breakers and bulkheads are the failure-containment patterns (L257) — the circuit breaker stops calling the failing provider after a threshold (L257), letting it recover (L256), and the bulkhead isolates the services' resources (L257), so one overloaded service doesn't starve the others (L257) — the pair that stops the cascading failures (L258).**

The one-sentence interview answer: *"The breaker and the bulkhead contain the failures (L257). The circuit breaker: a state machine around the calls to a provider (L257) — closed: the calls flow, the failures counted (L257); when the failure rate crosses the threshold (L257), the breaker opens: the calls fail fast (L257) — the provider gets time to recover (L256); after the cooldown, the half-open: a few trial calls (L257) — success closes the breaker (L257), failure re-opens it (L257). The bulkhead: the resource isolation (L257) — each service's connection pool and its workers are separate (L257), so one overloaded service exhausts its own pool (L257) and the others are unaffected (L257). The pair: the breaker stops the calls to the failing provider (L257); the bulkhead contains the blast radius (L257) — the cascading failure (L258) prevented (L257). The AI platform's shape: the provider calls (L152) behind the breaker (L257) — the model outage (L168) fails fast (L257) into the degradation (L258); the services (L252) bulkheaded (L257) — the generation service's overload (L252) doesn't starve the chat (L233)."*

## 2. Mental Model

Think of the two patterns as **the power grid's two protections.** The first is the circuit breaker — literally: when the wires overload (the failure rate crosses the threshold, L257), the breaker trips (opens, L257): the power stops flowing (the calls fail fast, L257), and the wires cool down (the provider recovers, L256). After a moment, the breaker re-arms (the half-open, L257): a small test current (the trial calls, L257) — if it holds, the power returns (the closed, L257). The second is the bulkhead — the ship's watertight compartments (L257): one flooded compartment (the overloaded service, L257) doesn't sink the whole ship (L257); the water stays in its compartment (the isolated resources, L257). The grid works because the breaker trips and the compartments contain (L257).

```text
   the breaker (L257)            the bulkheads (L257)
   ┌──────────────────────┐      ┌──────────────────────────────┐
   │ closed → open →      │      │ the compartments — each      │
   │ half-open (L257)     │      │ service's own resources (L257)│
   │ the trips stop the   │      │ one floods, the ship floats  │
   │ calls (L257)         │      │ (L257)                       │
   └──────────────────────┘      └──────────────────────────────┘
```

The mental model is **the grid's two protections**: the breaker trips, and the compartments contain (L257).

## 3. Visual Flow — The Breaker's States

```text
   the calls to a provider (L257)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ CLOSED (L257) — the calls flow, the failures counted     │
   │     the failure rate > threshold → OPEN (L257)           │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ OPEN (L257) — the calls fail fast (L257)                 │
   │     the provider recovers (L256) · the cooldown passes   │
   │     → HALF-OPEN (L257)                                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ HALF-OPEN (L257) — the trial calls (L257)                │
   │     success → CLOSED (L257) · failure → OPEN (L257)      │
   └──────────────────────────────────────────────────────────┘
```

The flow is the state machine: **closed → open → half-open** (L257).

## 4. How It Works — The Breaker, the Bulkhead, the Pair

- **The breaker (L257).** The state machine (L257): the closed — the calls flow, the failures counted (L257); the threshold crossed → the open — the calls fail fast (L257), the provider recovers (L256); the cooldown → the half-open — the trial calls (L257): the success closes (L257), the failure re-opens (L257).
- **The bulkhead (L257).** The resource isolation (L257): each service's connection pools and the workers are separate (L257) — the overloaded service exhausts its own pool (L257), and the others are unaffected (L257).
- **The pair (L257).** The breaker stops the calls to the failing provider (L257); the bulkhead contains the blast radius (L257) — together, the cascading failures (L258) are prevented (L257).
- **The AI shape (L257).** The provider calls (L152) behind the breaker (L257): the model outage (L168) fails fast (L257) into the degradation (L258). The services (L252) bulkheaded (L257): the generation service's overload (L252) doesn't starve the chat (L233).

> [!NOTE]
> **The breaker is the retries' counterbalance (L256, L257).** The retries (L256) are for the transient failures (L168); the breaker (L257) is for the persistent ones (L257). The retry says "try again" (L256); the breaker says "stop trying — let it recover" (L257). The senior design pairs them (L257): the retries absorb the blips (L256), and the breaker trips when the failures persist (L257) — the fail-fast (L257) into the degradation (L258) instead of the endless retries (L256).

## 5. Real Project Usage

- **The provider outage (L168).** The model provider fails (L168) — the breaker opens (L257): the calls fail fast (L257), the provider recovers (L256), and the app degrades (L258).
- **The service overload (L252).** The generation service (L145) overloaded (L252) — the bulkhead (L257): its pool exhausts (L257), the chat service (L233) unaffected (L257).
- **The third-party API (L227).** The external API (L227) failing (L168) — the breaker (L257) around the integration service (L252).
- **The cascading prevention (L258).** The failed service (L257) — the bulkhead (L257) and the breaker (L257) stop the cascade (L258).
- **Anything failing (L260).** The breaker and the bulkhead (L257) are the L260 platform's containment (L260) — the failures stopped and isolated (L257).

The through-line: **the grid's two protections** — the breaker trips, and the compartments contain — the failure containment of the platform (L257).

## 6. Interview Explanation

Say it in four moves:

1. **The breaker.** "The three states (L257): closed, open, half-open (L257)."
2. **The threshold.** "The failure rate crosses it → the calls fail fast (L257)."
3. **The bulkhead.** "The resource isolation (L257) — one service's overload contained (L257)."
4. **The pair.** "The breaker stops; the bulkhead contains — the cascade prevented (L258)."

## 7. Senior-Level Insights

- **The breaker is the persistent failure's answer (L257).** The senior answer pairs the retries (L256) with the breaker (L257): the blips retried (L256), the persistent failures tripped (L257).
- **The fail-fast is the user's experience (L257).** The open breaker's fast failure (L257) — the degradation (L258) instead of the hang (L257).
- **The threshold is the tuning (L257).** The failure rate and the cooldown (L257) — tuned by the provider's behavior (L257), measured (L341).
- **The bulkhead is the resource budget (L257).** The pools and the workers per service (L257) — the isolation is the budget's enforcement (L257).
- **The pair is the cascade's prevention (L258).** The breaker stops the calls (L257), the bulkhead contains the blast (L257) — the L258 degradation's foundation (L258).

## 8. Common Mistakes

- **The endless retries (L256).** The persistent failure retried forever (L256) — the breaker (L257) missing (L257).
- **The breaker never tripping (L257).** The threshold too high (L257) — the failing provider hammered (L257).
- **The shared pools (L257).** One pool for all the services (L257) — the bulkhead (L257) missing, the overload spreads (L257).
- **The half-open's trial storm (L257).** Too many trial calls (L257) — the recovering provider overwhelmed (L257).
- **No degradation path (L258).** The open breaker with no fallback (L258) — the user sees the raw failure (L258).
- **The breaker without the metrics (L213).** The failure rate unmeasured (L332) — the threshold un-tunable (L257).

## 9. Best Practices

- **Pair the retries with the breaker** (L256, L257) — the blips retried, the persistent tripped (L257).
- **Tune the threshold** (L257) — the failure rate and the cooldown, measured (L341).
- **Bulkhead the resources** (L257) — the pools and the workers per service (L257).
- **Design the degradation** (L258) — the fail-fast into the fallback (L258).
- **Watch the metrics** (L213) — the failure rate, the trips (L332).
- **Test the trips** (L341) — the breaker's behavior in the drills (L341).

## 10. Interview Questions

**Q: What's a circuit breaker?**
> A: The state machine around the calls to a provider (L257). The closed: the calls flow, the failures counted (L257). The threshold crossed → the open: the calls fail fast (L257), the provider recovers (L256). The cooldown → the half-open: the trial calls (L257) — the success closes the breaker (L257), the failure re-opens it (L257).

**Q: Why pair the retries with the breaker?**
> A: Because they answer different failures (L257). The retries (L256) are for the transient blips (L168); the breaker (L257) is for the persistent failures (L257). The retry says "try again" (L256); the breaker says "stop — let it recover" (L257). Without the breaker, the persistent failure is retried forever (L256) — the bill (L150) and the hammering (L257).

**Q: What's a bulkhead?**
> A: The resource isolation (L257). Each service has its own connection pools and workers (L257) — the overloaded service exhausts its own pool (L257), and the others are unaffected (L257). Like the ship's watertight compartments (L257): one floods, the ship floats (L257). The bulkhead contains the blast radius (L257).

**Q: How do they prevent the cascade?**
> A: The pair (L257). The breaker stops the calls to the failing provider (L257) — the fail-fast (L257). The bulkhead isolates the overloaded service's resources (L257) — the blast contained (L257). Together, the failing part fails alone (L257), and the rest of the platform degrades gracefully (L258) instead of cascading (L258).

## 11. Follow-Up Questions

- What are the breaker's states (L257)?
- How do you tune the threshold (L257)?
- What's the bulkhead (L257)?
- Why pair the retries with the breaker (L256)?
- How does the degradation follow (L258)?

## 12. Comparison Table — Retry vs Breaker

| | Retry (L256) | Breaker (this lesson) |
|---|---|---|
| The failure (L168) | the transient blip | the persistent (L257) |
| The response | try again (L256) | stop, let it recover (L257) |
| The state | the attempt count | the closed/open/half-open (L257) |
| The cost (L150) | bounded (L256) | fail-fast, no spend (L257) |
| The pair (L257) | the blips | the persistent |

The senior read: **the columns are the pair** — the retry for the blips, the breaker for the persistent (L257).

## 13. Code Example — The Breaker

```js
// The circuit breaker: closed → open → half-open (L257).
class CircuitBreaker {
  constructor({ threshold = 0.5, cooldownMs = 30_000, trialCount = 3 } = {}) {
    this.state = 'closed';            // CLOSED (L257)
    this.failures = 0; this.successes = 0;
    this.openedAt = null;
  }

  async call(fn, fallback) {
    // HALF-OPEN (L257) — the trial calls, a few at a time.
    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.cooldownMs) return fallback();  // fail fast (L257)
      this.state = 'half-open';       // the cooldown passed (L257)
    }

    try {
      const result = await fn();
      // The success closes the breaker (L257).
      if (this.state === 'half-open') { this.state = 'closed'; this.failures = 0; }
      return result;
    } catch (e) {
      if (this.state === 'half-open') { this.state = 'open'; this.openedAt = Date.now(); }
      else {
        this.failures += 1;
        // The threshold crossed → OPEN (L257).
        if (this.failures / Math.max(1, this.successes + this.failures) > this.threshold) {
          this.state = 'open'; this.openedAt = Date.now();
          log({ event: 'breaker.open', failures: this.failures });       // L213
        }
      }
      return fallback();              // the degradation (L258)
    }
  }
}

// The provider calls behind the breaker (L152, L257).
const generationBreaker = new CircuitBreaker({ threshold: 0.5, cooldownMs: 30_000 });
const result = await generationBreaker.call(
  () => callProvider(prompt),        // the model call (L145)
  () => cachedFallback(prompt),      // the degradation (L258) — the cache (L171)
);
```

```text
What the reader must SEE — the breaker's trip:

  state: closed / open / half-open → the machine (L257)
  the failure rate > threshold      → the trip (L257)
  the cooldown + trial calls        → the recovery probe (L257)
  fallback()                        → the degradation (L258)

  The trips stop the calls; the provider recovers; the app degrades.
```

```narrate
4-6: The configuration — the threshold, the cooldown, the trials (L257).
8-12: The open state — the calls fail fast (L257), the cooldown passes (L257).
13-16: The half-open — the trial calls (L257).
17-21: The success closes, the failure re-opens (L257).
22-30: The closed — the failures counted, the threshold crossing opens (L257).
31-32: The degradation — the fallback (L258).
```

> [!TIP]
> The line that defines the containment: **`if (this.failures / (this.successes + this.failures) > this.threshold)`** — the trip (L257). **The failure rate crosses the threshold, the calls fail fast, and the provider recovers — the cascade stopped (L257).**

## 14. Performance Notes

- **The fail-fast is the latency win (L151).** The open breaker's fast failure (L257) — the hang (L257) avoided, the user served the degradation (L258).
- **The trip is the cost control (L150).** The stopped calls (L257) — the failing provider's bill (L150) stopped (L257).
- **The trial calls are the recovery probe (L257).** The half-open's few calls (L257) — the provider's recovery tested (L257).
- **The metrics are the tuning (L213).** The failure rate (L332) — the threshold tuned (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The provider hammered | No breaker (L257) | The breaker (L257) |
| The breaker never trips | The threshold too high (L257) | The threshold (L257) |
| The overload spreads | No bulkhead (L257) | The resource isolation (L257) |
| The users see the failure | No degradation (L258) | The fallback (L258) |
| The trips unpredictable | No metrics (L213) | The failure rate (L332) |

## 16. Quick Revision Notes

- The breaker = **the three-state machine** (L257): closed, open, half-open (L257).
- The threshold: **the failure rate crosses it → the trip** (L257).
- The bulkhead: **the resource isolation** (L257) — the blast contained (L257).
- The pair: **the breaker stops, the bulkhead contains** (L257) — the cascade prevented (L258).
- The degradation: **the fail-fast into the fallback** (L258).
- The metrics: **the failure rate, the trips** (L213, L332).

## 17. Cheat Sheet

```text
CIRCUIT BREAKERS & BULKHEADS = the failure containment

THE BREAKER (L257)
  closed    the calls flow, the failures counted (L257)
  open      the threshold crossed — the calls fail fast (L257)
            the provider recovers (L256)
  half-open the cooldown — the trial calls (L257)
            the success closes (L257) · the failure re-opens (L257)

THE BULKHEAD (L257)
  the resource isolation (L257) — the pools and the workers
  per service (L257)
  one overloaded service exhausts its own pool (L257)
  the others are unaffected (L257)

THE PAIR (L257)
  the retries (L256) for the blips · the breaker for the persistent (L257)
  the breaker stops the calls (L257) · the bulkhead contains the blast (L257)
  the cascade (L258) prevented (L257)

THE DEGRADATION (L258)
  the fail-fast (L257) into the fallback (L258) — the cache (L171),
  the smaller model (L157), the honest message (L258)

INTERVIEW, 4 MOVES
  1 breaker "the three states (L257)"
  2 threshold "the failure rate trips it (L257)"
  3 bulkhead "the resource isolation (L257)"
  4 pair    "the retries + the breaker + the containment (L256, L257)"
```

## 18. Key Takeaways

> [!RECAP]
> - Circuit breakers and bulkheads are **the failure-containment patterns** (L257): the breaker stops the calls to the failing provider (L257), and the bulkhead isolates the services' resources (L257)
> - **The breaker is the three-state machine** (L257): closed (the calls flow, L257), open (the failure rate crosses the threshold — the calls fail fast, L257), and half-open (the cooldown's trial calls, L257)
> - **The bulkhead is the resource isolation** (L257): each service's pools and workers are separate (L257) — the overloaded service exhausts its own (L257), and the others are unaffected (L257)
> - **The pair is the cascade's prevention** (L257): the retries (L256) absorb the blips, the breaker trips on the persistent (L257), and the bulkhead contains the blast (L257)
> - **The degradation follows** (L258): the open breaker fails fast (L257) into the fallback (L258) — the cache (L171) or the honest message (L258)
> - The breaker and the bulkhead are **the L260 platform's containment** (L260) — the failures stopped and isolated (L257)

## Check your understanding

Answer these without looking back.

1. What are the breaker's states (L257)?
2. What trips the breaker (L257)?
3. What's the half-open (L257)?
4. What's the bulkhead (L257)?
5. Why pair the retries with the breaker (L256)?
6. What's the degradation (L258)?
7. How does the cascade get prevented (L257)?
8. What do you measure (L213)?

## A Closing Note — The Grid's Two Protections

You now hold the containment: **the breaker that trips on the persistent failures, the bulkhead that isolates the overloaded service, and the degradation that serves the user anyway.** The platform now fails in place — the blast contained, the rest surviving (L257).

Next: what the user gets when it fails — fault tolerance & graceful degradation (L258), the fallback story.
