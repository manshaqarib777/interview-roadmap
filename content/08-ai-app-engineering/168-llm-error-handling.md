# Lesson 168 — Error Handling for LLM Calls

**Interview importance:** ⭐⭐⭐⭐⭐ — "what happens when the provider fails?" is the resilience question; the answer is the *failure taxonomy* and the designed response to each class.

Lessons 158–167 built the app. This lesson is where it **survives**: error handling for LLM calls. A provider call fails in *known classes* — outages, timeouts, rate limits, malformed responses, refusals — and each class has a designed response (L169's retries, L170's rate limiting, L163's re-ask). The interview rewards the taxonomy: name the failure classes, the response to each, and what degrades gracefully.

The distinction this lesson is built on: a **demo** lets the exception crash. A **solutions architect** classifies the failure — transient (retry, L169), rate-limited (backoff, L170), malformed (re-ask, L163), refusal (rephrase or route, L142), permanent (fallback, L155) — and designs the response so the user never sees a blank UI (L162).

## Learning Objectives

By the end of this lesson you should be able to:

- Name the failure classes: transient, rate limit, timeout, malformed, refusal, permanent
- Map each class to a designed response: retry (L169), backoff (L170), re-ask (L163), fallback (L155), degrade
- Handle streaming failures mid-generation (L145): partial output, recovery, cancellation
- Design graceful degradation: the user sees a clear state, never a crash (L162)
- Distinguish what's retryable from what isn't — and why the distinction is load-bearing

## 1. One-Line Definition

**Error handling for LLM calls is the taxonomy of provider failures — transient, rate-limited, timeout, malformed, refusal, permanent — each mapped to a designed response, so the stochastic, network-bound model call fails like a known system, not like a surprise.**

The one-sentence interview answer: *"A provider call fails in known classes. Transient and timeout → retry with backoff (L169). Rate limit → respect the limits (L170). Malformed JSON → re-ask with a stricter prompt (L163). Refusal → rephrase or route (L142, L155). Permanent → fallback provider (L155) and graceful degradation. I classify the failure, apply the response, and the user never sees a crash — they see a clear state and a recovery path (L162)."*

## 2. Mental Model

Think of the provider as **a restaurant that's occasionally terrible** — sometimes busy (rate limit), sometimes out of ingredients (transient), sometimes slow (timeout), sometimes sends the wrong dish (malformed), sometimes refuses the order (refusal). A good diner knows which failures to *try again*, which to *order differently*, and which to *go to another restaurant*.

```text
   the failure classes, and the diner's response

   busy / flickering   →  try again (retry, L169)
   "come back later"   →  wait politely (backoff, L169, L170)
   too slow            →  give up after N seconds (timeout)
   wrong dish          →  re-order, more specific (re-ask, L163)
   "we don't serve that"→ order differently / elsewhere (refusal, L142, L155)
   permanently closed  →  another restaurant (fallback, L155) + tell the guest (degrade)
```

The mental model is **classify then respond** — the failure tells you *what kind*, and the kind tells you the response. The diner who treats every failure as "try again" eats cold soup; the one who classifies eats well.

## 3. Visual Flow — The Failure Taxonomy in One Diagram

```text
   the model call throws
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ CLASSIFY the failure                         │
   │                                              │
   │ transient / timeout   ──▶ retry w/ backoff   │  (L169)
   │ rate limit (429)      ──▶ respect + queue    │  (L170)
   │ malformed output      ──▶ re-ask, stricter   │  (L163)
   │ refusal               ──▶ rephrase / route   │  (L142, L155)
   │ permanent / auth      ──▶ fallback provider  │  (L155)
   │                        └─▶ graceful degrade  │  (L162)
   └──────────────────────────────────────────────┘
        │
        ▼
   the user sees: a clear state + a recovery path,
   never a blank UI or a raw 500 (L162)
```

The taxonomy is the whole lesson: **every failure class has a designed response, and the terminal response is graceful degradation** — the user is told what happened and what they can do.

## 4. How It Works — The Classes, and the Responses

- **Transient (5xx, network).** The provider hiccuped. Response: retry with exponential backoff + jitter (L169) — idempotent-safe only (L255).
- **Rate limit (429) (L170).** You exceeded the TPM/RPM budget. Response: respect the `Retry-After`, back off, queue — never hammer.
- **Timeout.** The call exceeded your deadline. Response: abort, retry once with backoff (L169), then degrade — a hung call is worse than a failed one.
- **Malformed output (L163).** The response didn't parse / didn't validate. Response: re-ask once with a stricter prompt or schema (L143), then degrade — never parse-guess.
- **Refusal (L142).** The model declined (safety, L317; or the prompt asked something it won't do). Response: rephrase, route (L155), or surface the refusal as a designed state — not an error.
- **Permanent (auth, model-gone, quota).** The call can't succeed. Response: fallback provider (L155), then graceful degradation (L162) — tell the user, offer retry later.

> [!NOTE]
> **The load-bearing distinction: retryable vs not (L169).** Transient and timeout are retryable; malformed and refusal are *retryable with a change* (stricter prompt / different wording); permanent and rate-limit-without-headroom are *not retryable*. An app that retries everything is a hammer that breaks the malformed cases and hammers the rate limits (L170). Classification is the discipline.

## 5. Real Project Usage

- **Chat products.** A 429 → "I'm a bit busy, try again in a moment" with auto-backoff (L169, L170); a provider outage → fallback (L155) or a clear error state (L162).
- **Extraction pipelines (L163).** Malformed JSON → one re-ask with the schema tightened, then a failure record — never a parse-guess loop.
- **Agents (L200).** A tool call fails → the *error goes back into the context* as a tool result, and the model decides the next step (L164) — failure as information, not as a crash.
- **Batch jobs (L222).** Transient failures → retry with backoff (L169); permanent → the job's DLQ (L245); the batch survives the provider.
- **Multi-provider (L155).** The fallback provider is the permanent-failure response — the abstraction (L155) makes it a config change.

The through-line: **the error handler is the app's composure** — the provider fails, the app classifies, responds, and the user sees a system, not a crash.

## 6. Interview Explanation

Say it in four moves:

1. **The taxonomy.** "A provider call fails in known classes: transient, rate limit, timeout, malformed, refusal, permanent."
2. **The responses.** "Transient/timeout → retry with backoff (L169); 429 → respect it (L170); malformed → re-ask stricter (L163); refusal → rephrase or route (L142); permanent → fallback (L155)."
3. **The discipline.** "The key distinction is retryable vs not — retrying a malformed response or hammering a rate limit is worse than the original failure."
4. **The terminal state.** "Everything ends in graceful degradation (L162): a clear state and a recovery path, never a blank UI or a raw 500."

## 7. Senior-Level Insights

- **The error handler is a *classification* system, not a try/catch (L169).** The senior design maps error classes to responses deliberately — a retry policy, a rate-limit strategy (L170), a re-ask policy, a fallback (L155) — not a generic `catch` that guesses.
- **Streaming failures are a *different* class (L145, L162).** A mid-stream failure has partial output, a half-rendered answer, and a user watching. The response: keep the partial, offer recovery — the errored state (L162) is designed, not discovered.
- **The fallback is a *product* decision (L155).** Which provider, which model, which quality drop is acceptable — that's a routing table entry (L156), not an emergency. The senior design has the fallback chosen *before* the outage.
- **Errors are *information* for agents (L200, L164).** A failed tool call returns the error into the context; the model decides the next step. The error handler is part of the agent's reasoning loop, not an escape hatch.
- **Observability is the error handler's mirror (L329, L330).** Every failure class, counted and traced — error rates by class feed the reliability story (L328+) and the retry tuning (L169).

## 8. Common Mistakes

- **A generic catch.** Every failure treated the same — retrying what shouldn't be retried (L169), crashing on what should degrade.
- **Retrying everything.** Hammering a 429 (L170) or retrying malformed output forever (L163) — the retry that makes it worse.
- **No timeout.** A hung provider call holds the user forever (L151) — a timeout is a failure class, designed like the rest.
- **Ignoring streaming failures (L145).** A mid-stream death as a blank UI (L162) — the partial answer, discarded, the user, confused.
- **No fallback (L155).** A permanent failure as a 500 — the abstraction (L155) exists for exactly this.
- **The raw 500 to the user.** The user sees an exception instead of a state (L162) — the terminal response is a designed message, never a stack trace.

## 9. Best Practices

- **Classify the failure, then respond** — the taxonomy is the design (L169).
- **Retry only the retryable** — transient/timeout with backoff (L169); never hammer 429s (L170) or retry malformed blindly (L163).
- **Set timeouts on every call** — a hung call fails faster than a slow one (L151).
- **Handle streaming failures with an errored state** (L145, L162) — keep the partial, offer recovery.
- **Design the fallback before the outage** (L155) — provider, model, quality drop, chosen.
- **Surface refusals as states, not errors** (L142, L317) — the model said no; that's information.
- **Count and trace failures by class** (L329) — the error handler feeds the observability.

## 10. Interview Questions

**Q: How do you handle LLM call failures?**
> A: I classify them. Transient and timeout → retry with backoff (L169). Rate limit → respect it (L170). Malformed output → re-ask with a stricter schema (L163). Refusal → rephrase or route (L142). Permanent → fallback provider (L155) and graceful degradation (L162). The user sees a clear state and a recovery path, never a crash.

**Q: What's the difference between retryable and non-retryable failures?**
> A: Transient and timeout are retryable as-is. Malformed and refusal are retryable *with a change* — a stricter prompt (L163) or different wording (L142). Rate limits without headroom and permanent failures are not retryable. The discipline is classifying before retrying — a hammer retries everything and makes it worse (L169, L170).

**Q: How do you handle a failure mid-stream?**
> A: It's a distinct class (L145). The user has a partial answer and is watching. The response is the errored state (L162): keep the partial, explain the stream failed, offer retry or continuation. A mid-stream failure treated as a blank UI discards the partial and the user's trust.

**Q: When do you fall back to another provider?**
> A: On permanent failures — auth, model-gone, quota — or after the retries are exhausted. The fallback is a product decision made *before* the outage (L155): which provider, which model, what quality drop is acceptable. The abstraction (L155) makes it a routing-table entry, not an emergency.

## 11. Follow-Up Questions

- How does the retry policy interact with idempotency (L169, L255)?
- How do you tune backoff and timeouts (L169, L151)?
- How do rate limits differ from transient errors (L170)?
- How does an agent use a failed tool call as information (L164, L200)?
- How do you measure failure rates by class (L329)?

## 12. Comparison Table — The Failure Classes

| Class | Example | Retryable? | Response |
|---|---|---|---|
| Transient | 5xx, network blip | yes, as-is | backoff + retry (L169) |
| Timeout | hung call | yes, once | abort, retry, then degrade |
| Rate limit | 429 | no, wait | respect `Retry-After` (L170) |
| Malformed | bad JSON | with change | re-ask stricter (L163) |
| Refusal | safety decline | with change | rephrase / route (L142) |
| Permanent | auth, model-gone | no | fallback (L155) + degrade |

The senior read: **the table is the error handler** — classify the failure, look up the response, and the app stays composed.

## 13. Code Example — The Classifier in Code

```js
// Error handling by class: classify → respond → degrade (L169, L163, L155).
const RETRYABLE = new Set(['ECONNRESET', '5xx', 'timeout']);   // L169
const MAX_RETRIES = 3;

async function callWithHandling(request, context) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await withTimeout(request(), 30_000);             // timeout class (L151)
    } catch (err) {
      // 1 · CLASSIFY (the whole lesson is this line).
      const cls = classify(err);                               // L168's taxonomy

      // 2 · RESPOND per class.
      if (cls === 'rate-limit') {
        await sleep(err.retryAfterMs);                         // respect it (L170)
        continue;
      }
      if (cls === 'retryable' && attempt < MAX_RETRIES) {
        await sleep(backoff(attempt));                         // exponential + jitter (L169)
        continue;
      }
      if (cls === 'malformed') {
        return await reaskStricter(request, context);          // L163 — one re-ask
      }
      if (cls === 'refusal') {
        return await rephrase(request, context);               // L142 — different words
      }
      // 3 · TERMINAL — fallback, then graceful degradation (L155, L162).
      if (hasFallback()) return await fallbackProvider(request, context);
      return { degraded: true, message: 'The service is busy — try again shortly.' };
    }
  }
}
```

```text
What the reader must SEE — the discipline in code:

  classify(err)     → the taxonomy (L168)
  rate-limit        → respect Retry-After (L170)
  retryable         → backoff, bounded (L169)
  malformed         → re-ask stricter, once (L163)
  refusal           → rephrase (L142)
  terminal          → fallback (L155) → graceful message (L162)

  Every class has a response; every response is bounded.
```

```narrate
2: The retryable set is explicit — the classification is the design (L169).
8-10: A timeout is a class with a deadline — a hung call fails faster (L151).
11-14: Rate limits are respected, not hammered — Retry-After, then continue (L170).
15-17: Retryables get bounded exponential backoff (L169).
19-24: Malformed and refusal get a *changed* retry — stricter or rephrased (L163, L142).
26-30: The terminal path is fallback (L155), then a graceful, human message (L162).
```

> [!TIP]
> The senior lines are `classify(err)` and the terminal message — **every failure mapped to a response, and the worst case is a clear sentence, not a stack trace.** That's the whole difference between an app that fails and an app that fails well.

## 14. Performance Notes

- **Timeouts bound the worst case (L151)** — a 30s cap means the user never waits forever; the timeout is a latency control, not an afterthought.
- **Retries cost latency and tokens (L169, L150)** — each retry is another TTFT and another request; bounded backoff (L169) is the cost control.
- **Backoff with jitter prevents thundering herds (L169)** — synchronized retries after an outage amplify it; jitter is the fix.
- **The fallback is a latency trade (L155)** — the second provider may be slower or lower quality (L156); the routing table (L157) decides the acceptable drop.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Hammered 429s | Rate limit treated as retryable (L170) | Respect `Retry-After`; queue |
| Malformed retry loop | Retried without a change (L163) | Re-ask stricter, once |
| User waits forever | No timeout (L151) | Set per-call deadlines |
| Blank UI on outage | No terminal degrade (L162) | Add the fallback + message |
| Provider failure = 500 | No fallback (L155) | Wire the abstraction's fallback |
| Mid-stream death, partial lost | Streaming error unhandled (L145) | Errored state: keep partial, recover |

## 16. Quick Revision Notes

- Failure classes: **transient, rate limit, timeout, malformed, refusal, permanent** — each with a response.
- **Retryable vs not** is the load-bearing distinction (L169).
- Transient/timeout → **backoff (L169)**; 429 → **respect (L170)**; malformed → **re-ask stricter (L163)**; refusal → **rephrase (L142)**; permanent → **fallback (L155) + degrade (L162)**.
- **Streaming failures are a class** — keep the partial, recover (L145, L162).
- The terminal response is **a clear state and a recovery path** — never a crash.

## 17. Cheat Sheet

```text
ERROR HANDLING = classify the failure, respond deliberately

THE CLASSES → THE RESPONSES
  transient (5xx/net)   retry w/ backoff + jitter (L169)
  timeout               abort → retry once → degrade (L151)
  rate limit (429)      respect Retry-After, queue (L170)
  malformed             re-ask stricter, once (L163)
  refusal               rephrase or route (L142, L155)
  permanent (auth/quota) fallback (L155) → graceful message (L162)

THE DISCIPLINE
  retryable: transient, timeout (as-is)
  retryable-with-change: malformed, refusal
  not retryable: rate-limit w/o headroom, permanent
  a hammer retries everything — and makes it worse

STREAMING IS A CLASS (L145)
  partial output exists · the user is watching
  keep the partial · explain · offer recovery (L162)

RULES
  timeouts on every call (L151)
  bounded backoff (L169) · respect limits (L170)
  fallback chosen BEFORE the outage (L155)
  count failures by class (L329) — feed the observability

INTERVIEW, 4 MOVES
  1 taxonomy "six classes, six responses"
  2 retryable "as-is vs with-change vs never"
  3 streaming "partial kept, recovery offered (L162)"
  4 terminal  "fallback (L155) → graceful message, never a crash"
```

## 18. Key Takeaways

> [!RECAP]
> - A provider call fails in **known classes**: transient, rate limit, timeout, malformed, refusal, permanent — each with a designed response
> - **Retryable vs not is the load-bearing distinction** (L169): transient/timeout retry as-is; malformed/refusal retry *with a change* (L163, L142); rate limits and permanent failures don't
> - The responses: **backoff (L169), respect limits (L170), re-ask stricter (L163), rephrase (L142), fallback (L155), graceful degradation (L162)**
> - **Streaming failures are a distinct class** (L145) — keep the partial, explain, offer recovery (L162)
> - The **fallback is a product decision made before the outage** (L155) — a routing-table entry, not an emergency
> - The terminal response is **a clear state and a recovery path, never a crash** — and failures by class feed the observability (L329)

## Check your understanding

Answer these without looking back.

1. Name the six failure classes.
2. Which are retryable as-is, which with a change, which never?
3. What's the response to a 429 (L170)?
4. Why is a timeout a class with a designed response (L151)?
5. How do you handle a mid-stream failure (L145, L162)?
6. When is the fallback chosen — and why (L155)?
7. Why is a refusal a state, not an error (L142, L317)?
8. How does the error handler feed observability (L329)?

## A Closing Note — The App That Fails Well

You now hold the taxonomy that keeps an AI app composed when the provider stumbles: **six classes, six responses, retryable vs not, streaming as a class, and graceful degradation as the terminal state.** It's the layer that L169 (retries), L170 (rate limits), and L171 (caching) build on — and the difference between an app that fails and one that fails well.

Next: the retry strategy itself — exponential backoff, jitter, and idempotency (L169).
