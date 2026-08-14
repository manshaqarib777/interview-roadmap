# Lesson 169 — Retry Strategies & Backoff

**Interview importance:** ⭐⭐⭐⭐ — "how do you handle retries?" is the resilience follow-up; the answer is *bounded, jittered, idempotent* — never a naive retry loop.

Lesson 168 gave you the failure taxonomy. This lesson is the **retry strategy** for the retryable classes: exponential backoff, jitter, bounded retries, and the idempotency (L255) that makes retrying safe. A naive retry — retry immediately, retry forever, no jitter — is worse than no retry: it amplifies outages (thundering herd) and doubles side effects (double emails).

The distinction this lesson is built on: a **junior** wraps the call in `retry(3)`. A **solutions architect** designs the policy: exponential backoff with jitter, bounded attempts, retryable-class checks (L168), idempotency for writes (L255), and circuit-breaking at scale (L257).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain retry policy: which classes to retry (L168), how many times, with what schedule
- Implement exponential backoff with jitter — and explain why jitter matters
- Bound the retries: max attempts, max total time, and the cost of each (L150)
- Make retries safe: idempotency for writes (L255), retryable-class checks (L168)
- Explain when to stop retrying: circuit breakers (L257) and fallback (L155)

## 1. One-Line Definition

**A retry strategy is the policy for re-attempting a failed LLM call — retry only the retryable classes (L168), with exponential backoff and jitter, bounded attempts and time, and idempotency (L255) so a retry is safe — never a naive loop.**

The one-sentence interview answer: *"Retries are a policy, not a loop. I retry only the retryable classes (L168) — transient and timeout — with exponential backoff and jitter, bounded to a few attempts and a max total time, and only when the call is idempotent (L255). The goal is to absorb the provider's hiccups without amplifying them: no thundering herd, no double side effects, and a circuit breaker (L257) when the provider is genuinely down."*

## 2. Mental Model

Think of retries as **calling a busy friend — politely.** You don't redial every second (that's a thundering herd and it makes the line busier); you wait a little longer each time (exponential backoff), at slightly random intervals (jitter, so you and everyone else don't redial in sync), and you stop after a few tries (bounded) and try the backup number (fallback, L155).

```text
   the polite retry schedule (exponential + jitter)

   attempt 0  fail  →  wait ~0.3s   (± jitter)
   attempt 1  fail  →  wait ~0.6s
   attempt 2  fail  →  wait ~1.2s
   attempt 3  fail  →  wait ~2.4s
   ── bounded: 4 attempts, max ~4.5s total ──
   then: circuit breaker (L257) / fallback (L155) / degrade (L162)
```

The mental model is **polite persistence**: wait longer each time, never in sync, never forever, and know when to stop.

## 3. Visual Flow — A Retry in the Request Path

```text
   the call fails (transient, L168)
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · CLASSIFY — is it retryable? (L168)       │
   │     transient / timeout → yes                │
   │     rate limit → respect Retry-After (L170)  │
   │     malformed / refusal → change, not retry  │
   │     permanent → fallback (L155), no retry    │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · CHECK the budget — attempts left?        │
   │     time left?  (bounded, L151)              │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 3 · WAIT — exponential backoff + jitter      │
   │     (L169) — never immediate, never in sync  │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 4 · RETRY — idempotent-safe (L255)           │
   │     writes carry an idempotency key          │
   └──────────────────────────────────────────────┘
        │
        ├── success → continue
        └── exhausted → circuit breaker (L257) / fallback (L155) / degrade (L162)
```

The flow is the policy: **classify → budget → wait → retry → terminal.** Every step is a decision, and the terminal path is designed (L168).

## 4. How It Works — The Policy's Four Decisions

- **What to retry (L168).** Only the retryable classes: transient and timeout. Malformed and refusal are retried *with a change* (L163, L142) — a stricter prompt, different words. Rate limits are respected, not retried into (L170). Permanent failures go to fallback (L155), never the retry loop.
- **The schedule: exponential backoff + jitter.** The wait grows exponentially — `base * 2^attempt` — and jitter randomises it (`± random`), so retrying clients don't synchronise into a thundering herd after an outage. The formula everyone should be able to write: `wait = min(cap, base * 2^attempt) + jitter`.
- **The bounds.** Max attempts (3–5), max total time, and per-call timeouts (L151). A retry policy without bounds is a bill and a latency leak (L150).
- **Idempotency (L255).** A retry must be safe to run twice. Reads are naturally idempotent; writes carry an idempotency key (L255) so the second attempt is a no-op, not a double email. Retrying a non-idempotent write without a key is the classic retry bug.

> [!NOTE]
> **The jitter rule, and why it's non-negotiable.** Without jitter, every retrying client waits the same `base * 2^attempt` and hits the provider in sync — the retry storm *is* the outage (L170's thundering herd). Jitter breaks the synchronisation: each client waits slightly differently, and the herd dissolves. `+ jitter` is the cheapest reliability line in the codebase.

## 5. Real Project Usage

- **Chat products.** A transient 5xx → backoff + retry once or twice, then the fallback/degrade path (L162, L155). The user never sees the retries.
- **Extraction pipelines (L163).** Malformed output → one *changed* retry (stricter schema), never a blind loop; transient → backoff.
- **Batch jobs (L222, L245).** Retries with backoff on the job queue (L245); exhausted attempts → the DLQ (L245), not a silent drop.
- **Agents (L200).** A failed tool call (L164) is retried per the same policy — with idempotency (L255), because an agent's retry is a tool run.
- **Multi-provider (L155).** After the retry budget is exhausted, the fallback provider (L155) is the terminal move — the retry policy hands off to the routing table (L157).

The through-line: **retries are the absorption layer** — they soak up the provider's transient failures so the user and the rest of the system never feel them, and they hand off cleanly when the failure isn't transient.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "Retries are a policy: retry only the retryable classes (L168), with exponential backoff and jitter, bounded attempts, and idempotency (L255)."
2. **The schedule.** "Exponential backoff — `base * 2^attempt`, capped — plus jitter so retrying clients don't synchronise into a thundering herd (L170)."
3. **The safety.** "A retry must be safe to run twice — writes carry an idempotency key (L255). And it must be bounded — max attempts and max time, or it's a bill and a latency leak (L150)."
4. **The terminal.** "When the budget's exhausted, it's not retry-forever: circuit breaker (L257) and fallback (L155), then graceful degradation (L162)."

## 7. Senior-Level Insights

- **Jitter is the difference between a retry and a retry storm (L170).** Synchronised retries after an outage amplify it — the retry policy that forgets jitter is the policy that creates the next outage.
- **Idempotency is what makes retries *safe*, not just possible (L255).** Reads are naturally safe; writes need an idempotency key (L255). The senior answer names idempotency *before* the retry loop — because an agent's retry (L200) is a tool run, and a double tool run is a double side effect.
- **The retry budget is a cost and latency control (L150, L151).** Each retry is another TTFT and another request; the bounds (attempts, time) are the budget. Retry-forever is a bill with a heartbeat.
- **At scale, the retry policy becomes a circuit breaker (L257).** After N failures, stop trying and fail fast for a cooldown — protecting the provider and your bill. The retry policy is the circuit breaker's inner loop.
- **The retry policy is a tested component (L341).** A pure function — given a failure class and an attempt count, produce the wait — is unit-testable, and the whole policy is testable against a fake provider.

## 8. Common Mistakes

- **Retrying everything.** Malformed output retried blindly (L163), 429s hammered (L170) — the classification (L168) is skipped.
- **Immediate retries.** No backoff — the retry hits the same failure instantly, then again.
- **No jitter.** Synchronised retries after an outage — the thundering herd (L170).
- **Unbounded retries.** Retry-forever — a latency and cost leak (L150, L151).
- **Retrying non-idempotent writes (L255).** A double email, double charge, double booking — the retry that creates the incident.
- **No terminal path.** Retries exhausted → crash (L162) instead of circuit breaker (L257) / fallback (L155).

## 9. Best Practices

- **Retry only the retryable classes** (L168) — transient and timeout as-is; malformed/refusal with a change (L163, L142).
- **Exponential backoff with jitter** — `base * 2^attempt`, capped, plus jitter (L169).
- **Bound it** — max attempts, max total time, per-call timeouts (L151).
- **Make writes idempotent** (L255) — the retry must be safe to run twice.
- **Terminal path** — circuit breaker (L257) → fallback (L155) → graceful degradation (L162).
- **Test the policy** (L341) — the schedule is a pure function; the policy is testable.

## 10. Interview Questions

**Q: How do you design a retry strategy?**
> A: As a policy, not a loop. Retry only the retryable classes (L168) — transient and timeout — with exponential backoff and jitter, bounded to a few attempts and a max total time, and only when the call is idempotent (L255). When the budget's exhausted: circuit breaker (L257), fallback (L155), then graceful degradation (L162).

**Q: Why jitter?**
> A: Without it, every retrying client waits the same `base * 2^attempt` and hits the provider in sync — the thundering herd (L170). Jitter randomises the wait, the herd dissolves, and the retries absorb the outage instead of amplifying it. It's the cheapest reliability line in the codebase.

**Q: When is a retry not safe?**
> A: When the call has a side effect and isn't idempotent (L255). A retry of "send email" without an idempotency key sends two emails. Reads are naturally safe; writes need a key, or a human gate (L208) at the write boundary. Retrying safely is an idempotency design, not a loop.

**Q: How do retries interact with rate limits?**
> A: They're different classes (L168). A 429 is respected, not retried — I read `Retry-After` and back off to the limit (L170). Retrying into a rate limit is hammering; the rate-limit strategy (L170) and the retry strategy (this lesson) are two policies that compose.

## 11. Follow-Up Questions

- What's the difference between a retry and a circuit breaker (L257)?
- How does idempotency work for a write tool (L255)?
- How do retries apply to batch jobs and DLQs (L222, L245)?
- How does the retry policy interact with the fallback (L155)?
- How do you test a retry policy (L341)?

## 12. Comparison Table — Retry Styles

| Style | Schedule | Risk | Verdict |
|---|---|---|---|
| Immediate retry | same instant | re-hits the same failure | ✗ |
| Fixed delay | constant wait | sync across clients | weak |
| **Exponential backoff** | `base * 2^attempt` | none, alone | the base |
| **+ jitter** | randomised wait | none | **the standard** |
| Retry-forever | unbounded | bill + latency leak (L150) | ✗ |
| Circuit breaker (L257) | cooldown after N | fail-fast window | at scale |

The senior read: **exponential backoff + jitter + bounds + idempotency is the production retry**; the circuit breaker (L257) is what it becomes at scale.

## 13. Code Example — The Policy in Code

```js
// The retry policy: classify → budget → backoff + jitter → retry → terminal.
const MAX_ATTEMPTS = 4;
const BASE_MS = 200;
const CAP_MS = 4000;

// The schedule — a pure function, unit-testable (L341).
function backoff(attempt) {
  const exp = Math.min(CAP_MS, BASE_MS * 2 ** attempt);   // exponential, capped
  return exp + Math.random() * exp * 0.5;                 // + jitter (L169)
}

async function retry(fn, context, idempotencyKey) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();                                  // the call
    } catch (err) {
      const cls = classify(err);                          // L168's taxonomy

      // Only retryable classes continue; rate limits respect Retry-After (L170).
      if (cls === 'rate-limit') { await sleep(err.retryAfterMs); continue; }
      if (cls !== 'retryable') throw err;                 // malformed → re-ask elsewhere (L163)

      if (attempt === MAX_ATTEMPTS - 1) throw err;        // bounded (L168)
      await sleep(backoff(attempt));                      // + jitter
    }
  }
}

// Idempotency (L255): a write retried with the same key is a no-op, not a double.
await retry(() => payInvoice({ id, idempotencyKey }), ctx, key);
```

```text
What the reader must SEE — the policy in code:

  backoff(attempt)  exponential, capped, + jitter (L169)
  classify(err)     only the retryable classes (L168)
  rate-limit        respected, not retried (L170)
  MAX_ATTEMPTS      bounded (L168)
  idempotencyKey    a retry is safe to run twice (L255)

  No immediate retries. No sync. No forever. No double side effects.
```

```narrate
4-7: The schedule — exponential, capped, plus jitter. The jitter line is the one that prevents the herd (L170).
10-11: Classification first — only the retryable classes enter the loop (L168).
14: Rate limits are respected via Retry-After, never hammered (L170).
15: Non-retryable classes throw — malformed goes to the re-ask path (L163), not the loop.
17-18: Bounded attempts, then the terminal path (L155, L162).
23: Idempotency — the retry is safe because the write carries a key (L255).
```

> [!TIP]
> The two lines that make it production-grade are the jitter and the idempotency key — **`+ jitter` prevents the herd; the key prevents the double.** A retry policy without either is a time bomb with a heartbeat.

## 14. Performance Notes

- **Each retry costs a TTFT and a request (L151, L150)** — the bounds are the cost control; exponential backoff makes later retries cheap in *rate* but the attempts still bill (L149).
- **Jitter adds a small wait variance (L151)** — a deliberate trade: a few ms of latency for herd-immunity (L170).
- **Idempotency keys add storage (L255)** — the key → result cache is a store; retention there is a cost line (L150).
- **At scale, the circuit breaker (L257) short-circuits the retries** — failing fast during a cooldown beats retrying into a down provider (L151, L168).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Retry storm after outage | No jitter (L170) | Add jitter; check the schedule |
| Double emails / charges | Non-idempotent write retried (L255) | Add idempotency keys |
| Bill spikes on failures | Retry-forever, unbounded (L150) | Bound attempts + total time |
| 429s from your own retries | Rate limit retried as retryable (L170) | Respect `Retry-After` |
| User waits through retries | No per-call timeout (L151) | Set deadlines; degrade |

## 16. Quick Revision Notes

- Retries = **a policy**: classify (L168) → budget → backoff + jitter → retry → terminal.
- Schedule: **`base * 2^attempt`, capped, + jitter** — never immediate, never in sync (L170).
- **Bounded**: max attempts, max time, per-call timeouts (L151).
- **Idempotent** (L255): a retry must be safe to run twice — writes carry a key.
- **Terminal**: circuit breaker (L257) → fallback (L155) → graceful degradation (L162).
- Only **retryable classes** (L168) enter the loop; rate limits are respected (L170).

## 17. Cheat Sheet

```text
RETRY STRATEGY = polite persistence, not a loop

THE SCHEDULE
  wait = min(cap, base * 2^attempt) + jitter
  exponential (grow) · capped (bounded) · jittered (no herd, L170)

WHAT ENTERS THE LOOP (L168)
  transient / timeout   → retry as-is
  malformed / refusal   → retry WITH A CHANGE (L163, L142)
  rate limit (429)      → respect Retry-After, never hammer (L170)
  permanent             → fallback (L155), no retry

THE SAFETY
  bounded:   max attempts + max total time (L151)
  idempotent: writes carry a key (L255) — a retry is safe twice
  timeout:   every call has a deadline (L151)

THE TERMINAL PATH (L168)
  attempts exhausted → circuit breaker (L257) → fallback (L155)
                     → graceful degradation (L162)

RULES
  jitter is non-negotiable (L170)
  never retry into a rate limit (L170)
  never retry a non-idempotent write (L255)
  the schedule is a pure function — test it (L341)

INTERVIEW, 4 MOVES
  1 frame    "a policy, not a loop"
  2 schedule "exponential + cap + jitter"
  3 safety   "bounded + idempotent (L255)"
  4 terminal "circuit breaker → fallback → degrade"
```

## 18. Key Takeaways

> [!RECAP]
> - Retries are **a policy, not a loop**: classify (L168) → budget → backoff + jitter → retry → terminal
> - The schedule is **exponential backoff, capped, plus jitter** — never immediate, never in sync (L170)
> - **Only the retryable classes enter the loop** (L168); malformed/refusal retry with a change (L163, L142), rate limits are respected (L170), permanent goes to fallback (L155)
> - **Bounded and idempotent** (L151, L255): max attempts, max time, and writes carrying a key so a retry is safe to run twice
> - The **terminal path is designed**: circuit breaker (L257) → fallback (L155) → graceful degradation (L162)
> - **Jitter is non-negotiable** — it's the difference between absorbing an outage and amplifying it (L170)

## Check your understanding

Answer these without looking back.

1. Write the backoff formula, and explain each part.
2. Why is jitter non-negotiable (L170)?
3. Which failure classes enter the retry loop (L168)?
4. What makes a retry safe (L255)?
5. What are the bounds, and what do they protect (L150, L151)?
6. When does the retry policy hand off to the circuit breaker (L257)?
7. How do retries and rate limits interact (L170)?
8. Why is the schedule a testable pure function (L341)?

## A Closing Note — The Absorption Layer

You now hold the policy that absorbs the provider's hiccups: **exponential backoff, jitter, bounds, idempotency, and a terminal path.** It's the inner loop of the resilience stack — rate limiting (L170) guards the front, caching (L171) removes the need to call at all, and the circuit breaker (L257) takes over at scale.

Next: rate limiting (L170) — the TPM/RPM budgets, and what happens when you exceed them.
