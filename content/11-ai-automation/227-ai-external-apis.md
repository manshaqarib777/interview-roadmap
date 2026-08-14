# Lesson 227 — AI + External APIs

**Interview importance:** ⭐⭐⭐⭐ — "how does AI call the outside world?" — the answer is *the API layer*: idempotency, retries, and the tool wrapper — the L201 discipline applied to external systems (L222).**

L226 guarded the database; this lesson is **the world**: AI + external APIs — the workflows calling Stripe, Twilio, the CRM, the web (L223–225) — through a wrapper (L201) with the L222 discipline: **idempotency** (the retried call is safe to repeat, L255), **retries** (the transient failure retried, L169), and **the tool contract** (the call's inputs and outputs, L163). The API is an external system — the workflow treats it like a tool with a contract (L201, L217).

The distinction this lesson is built on: a **demo** calls the API and hopes. A **solutions architect** wraps it: the API tool (L201), the idempotency key (L255), the retry policy (L169), the timeout (L151), and the error mapping (L211) — because the outside world is slow, flaky, and outside your control (L227).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the API tool: the external call wrapped with a contract (L201)
- Explain idempotency: the key that makes retries safe (L255)
- Explain the retry policy: backoff, bounded (L169)
- Explain the error mapping: the API's failures to the workflow's (L211)
- Explain the timeout and the fallback (L151, L232)

## 1. One-Line Definition

**AI + external APIs is the world reached through a tool wrapper — the external call is wrapped as a tool with a contract (L201, L163), carrying an idempotency key (L255), a bounded retry policy (L169), a timeout (L151), and an error mapping (L211) — because the outside world is slow, flaky, and outside your control (L227).**

The one-sentence interview answer: *"AI + external APIs is the world through a wrapper (L227). The workflow needs Stripe, Twilio, or the web (L223–225) — the call is wrapped as a tool (L201) with a contract: the inputs, the outputs, the errors (L163). The wrapper carries the L222 discipline. Idempotency — the call carries a key (L255): a retried payment or send is safe to repeat (L255). Retries — the transient failures retry with backoff (L169), bounded (L169). Timeout — the slow API is bounded (L151). Error mapping — the API's failures map to the workflow's (L211): the 429 to the rate limit (L170), the 5xx to the retry (L169), the 4xx to the contract (L143). The outside world is slow, flaky, and outside your control (L227) — the wrapper is what makes it safe to call (L230)."*

## 2. Mental Model

Think of the external API as **a remote office you call on the phone — with a good secretary handling the call.** The workflow needs something from the remote office (Stripe, the CRM, L223): the secretary (the wrapper, L227) places the call. The secretary's discipline: every call has a reference number (the idempotency key, L255) — if the line drops, the retry says "I'm calling about reference X" and the office knows not to do the work twice (L255). The busy signal (the 429, L170) means call back later (backoff, L169); the "we're having technical issues" (the 5xx, L168) means try again; the "you made an error" (the 4xx, L143) means the call was wrong. And the secretary never waits forever (the timeout, L151). The remote office works because every call is keyed, retried, and bounded (L227).

```text
   the workflow (L217)                the remote office (the API, L227)
   ┌──────────────────────┐           ┌──────────────────────────────┐
   │ the wrapper (L201)   │ ────────► │ the external system          │
   │ idempotency key (L255)│          │ slow (L151) · flaky (L168)   │
   │ retries (L169)       │           │ outside your control (L227)  │
   │ timeout (L151)       │           │ the 429 / 5xx / 4xx (L211)   │
   └──────────────────────┘           └──────────────────────────────┘
```

The mental model is **the secretary and the remote office**: keyed, retried, and bounded calls to a world outside your control (L227).

## 3. Visual Flow — One API Call

```text
   the workflow needs the API (L217)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE TOOL WRAPPER (L201)                              │
   │     the call is a tool with a contract (L163): inputs,   │
   │     outputs, errors (L143)                               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE KEY (L255)                                       │
   │     the idempotency key — a retried call is safe (L255)  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE CALL (L151, L169)                                │
   │     timeout-bound (L151) · transient failures retry      │
   │     with backoff (L169), bounded (L169)                  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE ERRORS (L211)                                    │
   │     429 → the rate limit (L170) · 5xx → retry (L169)     │
   │     4xx → the contract (L143) · timeout → the fallback   │
   │     (L232)                                               │
   └──────────────────────────────────────────────────────────┘
```

The flow is the wrapper: **the contract → the key → the bounded call → the error mapping** (L227).

## 4. How It Works — The Wrapper, the Key, the Policy, the Errors

- **The tool wrapper (L201, L163).** The external call is a tool (L201): the inputs (L143), the outputs, the errors (L163) — the workflow calls the wrapper, never the raw API (L227).
- **The idempotency key (L255).** The call carries a key (L255) — the payment ID, the send ID. A retried call presents the same key, and the API deduplicates (L255): the retry (L169) is safe because the key makes it idempotent (L255).
- **The retry policy (L169).** The transient failures retry with backoff (L169), bounded (L169) — and the retries respect the API's rate limits (L170).
- **The timeout (L151).** The slow API is bounded (L151) — the call fails fast into the workflow's fallback (L232).
- **The error mapping (L211).** The API's failures map to the workflow's: the 429 to the rate limit (L170), the 5xx to the retry (L169), the 4xx to the contract (L143), the timeout to the fallback (L232) — the L211 taxonomy applied to the external world (L227).

> [!NOTE]
> **Idempotency and retries are one design (L255, L169).** A retry policy (L169) without an idempotency key (L255) double-executes: the retried payment charges twice, the retried send sends twice (L255). The key is what makes the retry safe (L255): the API deduplicates on the key (L227). The senior design pairs them — the retry policy is bounded (L169) *because* the key makes the re-run a no-op (L255) — the same pairing as the queue's jobs (L222).

## 5. Real Project Usage

- **Payments (L255).** The Stripe call with the payment's idempotency key (L255) — a retried charge doesn't double-bill (L227).
- **Messaging (L225).** The Twilio call with the send's key (L255) — the retried SMS doesn't double-send (L227).
- **Web lookups (L227).** The enrichment's web calls (L223) — cached (L171), retried (L169), and bounded (L151).
- **CRM writes (L180).** The upsert with the contact's key (L255) — the retried write is idempotent (L227).
- **Anything external (L230).** The wrapper is the L230 platform's window to the world (L227) — keyed, retried, bounded (L230).

The through-line: **the outside world is reached through the wrapper** — every external call keyed, retried, and bounded, with its errors mapped (L227).

## 6. Interview Explanation

Say it in four moves:

1. **The wrapper.** "The external call is a tool with a contract (L201, L163)."
2. **The key.** "The idempotency key makes the retried call safe (L255)."
3. **The policy.** "Backoff (L169), bounded (L169), timeout-bound (L151)."
4. **The errors.** "The 429 (L170), 5xx (L169), 4xx (L143), and timeout (L232) mapped to the workflow's (L211)."

## 7. Senior-Level Insights

- **The wrapper is the L201 tool discipline (L201).** The senior answer wraps the API (L227) like any tool (L201): the contract (L163), the authority (L315), and the trace (L213) — the external call is an agent tool in the workflow (L230).
- **Idempotency is the money rule (L255).** Payments and sends are the idempotency-critical calls (L255) — the key (L255) is what makes the retry (L169) safe (L227).
- **The retries respect the rate limits (L170).** The API's 429 (L170) shapes the backoff (L169) — the retry policy and the limits compose (L227).
- **The error mapping is the L211 taxonomy (L211).** The API's failures map to the workflow's modes (L211): the 4xx is a contract failure (L143), the 5xx a transient (L169), the timeout a fallback (L232) — the taxonomy applied to the world (L227).
- **The fallback is the design's completion (L232).** The API down → the fallback path (L232): the queue (L222), the dead letter (L232), or the human (L208) — the wrapper includes the failure's next step (L227).

## 8. Common Mistakes

- **The raw API call (L227).** No wrapper, no contract (L163) — the workflow couples to the API (L201).
- **Retries without keys (L255).** The retried payment charges twice (L255) — the idempotency key missing (L227).
- **No timeout (L151).** The slow API hangs the workflow (L151) — the bound absent (L227).
- **No error mapping (L211).** The 429 retried into the limit (L170) — the taxonomy unapplied (L227).
- **No fallback (L232).** The API down kills the workflow (L211) — the fallback path missing (L227).
- **Secrets in the workflow (L275).** The API key exposed (L212) — the credential in the wrong place (L227).

## 9. Best Practices

- **Wrap the call as a tool** (L201) — the contract (L163), the inputs and outputs (L143).
- **Key the idempotent calls** (L255) — payments, sends, writes (L227).
- **Retry with backoff** (L169) — bounded (L169), respecting the limits (L170).
- **Bound the timeouts** (L151) — fail fast into the fallback (L232).
- **Map the errors** (L211) — the 429, 5xx, 4xx, and timeout to the workflow's (L227).
- **Keep the secrets server-side** (L275) — scoped, never in the context (L212).

## 10. Interview Questions

**Q: How does AI call external APIs?**
> A: Through a wrapper (L227). The external call is a tool (L201) with a contract: the inputs, the outputs, the errors (L163). The wrapper carries the discipline: an idempotency key (L255) so a retried call is safe, a bounded retry policy (L169) with backoff (L169), a timeout (L151), and the error mapping (L211). The outside world is slow and flaky (L227) — the wrapper is what makes it safe to call (L230).

**Q: Why the idempotency key?**
> A: Because retries re-send the call (L255). Without the key, a retried payment charges twice, a retried send sends twice (L255). The key — the payment ID, the send ID — lets the API deduplicate (L255): the retry presents the same key, and the API sees "already done" (L227). The retry policy (L169) and the idempotency key (L255) are one design (L255).

**Q: How do you handle the API's errors?**
> A: The error mapping (L211). The 429 — the rate limit (L170): back off, don't hammer (L169). The 5xx — the transient failure (L168): retry with backoff (L169). The 4xx — the contract failure (L143): the call was wrong, fix the inputs. The timeout (L151) — the fallback path (L232): the queue, the dead letter, or the human (L208). The API's failures map to the workflow's modes (L211).

**Q: What happens when the API is down?**
> A: The fallback path (L232). The timeout (L151) fires fast, and the workflow's failure story takes over: the job retries (L169), then dead-letters (L232), and the alert goes to the human (L208) — with the trace (L213) showing where it failed (L211). The wrapper includes the failure's next step (L227) — the workflow never just hangs (L222).

## 11. Follow-Up Questions

- What's in the API tool's contract (L163)?
- How does the idempotency key work (L255)?
- How do retries respect the rate limits (L170)?
- What's the error mapping (L211)?
- What's the fallback path (L232)?

## 12. Comparison Table — Raw Call vs Wrapper

| | Raw call (L227) | Wrapper (this lesson) |
|---|---|---|
| Contract (L163) | none | inputs, outputs, errors (L143) |
| Idempotency (L255) | none | the key (L255) |
| Retries (L169) | none | backoff, bounded (L169) |
| Timeout (L151) | none | bounded (L151) |
| Errors (L211) | crash | mapped (L170, L143) |
| Fallback (L232) | none | the next step (L232) |

The senior read: **the right column is the window to the world** — keyed, retried, bounded, mapped (L227).

## 13. Code Example — The API Wrapper

```js
// The external API through a wrapper (L227, L201, L255).
// THE TOOL — the contract (L201, L163).
const stripeCharge = {
  inputs: { customerId: 'string', amount: 'number' },        // L143
  idempotent: true,                                          // needs a key (L255)
  execute: async (args, ctx) => {
    // THE KEY (L255) — the retried call is safe.
    const key = ctx.jobId;                                   // the idempotency key (L255)
    try {
      return await callStripe('/charges', { ...args, 'Idempotency-Key': key }, {
        timeoutMs: 5000,                                     // THE BOUND (L151)
      });
    } catch (e) {
      // THE ERROR MAPPING (L211).
      if (e.status === 429) throw new RateLimitError();      // → back off (L170)
      if (e.status >= 500) throw new TransientError();       // → retry (L169)
      if (e.status >= 400) throw new ContractError(e.body);  // → fix the inputs (L143)
      throw e;
    }
  },
};

// THE RETRY POLICY (L169) — bounded, with backoff (L169).
const result = await withRetry(() => stripeCharge.execute(args, ctx), {
  maxRetries: 3, backoff: 'exponential', respect: 'rate-limit',   // L170
});

// THE FALLBACK (L232) — the failure's next step.
if (result instanceof TransientError && result.attempts > 3) {
  await deadLetter({ tool: 'stripe', args, error: result });   // L232
  await alertHuman(ctx);                                       // L208
}
```

```text
What the reader must SEE — the window to the world:

  the contract (L163, L143) · the idempotency key (L255)
  the timeout (L151) · the error mapping (L211)
  the retry policy (L169) · the fallback (L232)

  Keyed, retried, bounded, mapped — the wrapper makes the call safe.
```

```narrate
3-6: The tool contract — the inputs and the idempotency flag (L163, L143, L255).
8-11: The key — the job ID is the idempotency key that makes the retry safe (L255).
12-19: The call — bounded by the timeout (L151) and mapped by the error classes (L211, L170, L169, L143).
21-25: The retry policy — backoff, bounded, respecting the limits (L169, L170).
27-31: The fallback — the dead letter (L232) and the human alert (L208) when the retries exhaust (L227).
```

> [!TIP]
> The pair that prevents the money bug: **`'Idempotency-Key': key`** (L255) and **`maxRetries: 3`** (L169). **Retries re-send; the key makes the re-send safe — the wrapper's two guards (L227).**

## 14. Performance Notes

- **The timeout is the latency bound (L151).** The 5-second cap (L151) keeps the workflow's wall-clock predictable (L227) — the slow API fails fast (L232).
- **The retries are the provider's courtesy (L169).** Backoff (L169) and the rate-limit respect (L170) — the retry policy and the API's limits compose (L227).
- **The cache is the repeat lever (L171).** The read calls — lookups, enrichment (L223) — are cached by the request hash (L171) (L227).
- **The trace records the calls (L213).** The external calls are traced (L213) — the audit (L322) of the world's access (L227).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Double charges | No idempotency key (L255) | Key the retried calls (L227) |
| The workflow hangs | No timeout (L151) | Bound the call (L151) |
| The API hammers back | 429s retried (L170) | Respect the limits (L169) |
| Contract failures | Unvalidated inputs (L143) | The 4xx → the inputs (L227) |
| The workflow dies with the API | No fallback (L232) | The dead letter + the human (L208) |

## 16. Quick Revision Notes

- AI + APIs = **the world through a wrapper** (L227).
- The tool: **the contract** (L201, L163) — inputs, outputs, errors (L143).
- The key: **idempotency — the retry is safe** (L255).
- The policy: **backoff (L169), bounded, respecting the limits (L170)**.
- The errors: **429 (L170), 5xx (L169), 4xx (L143), timeout → fallback (L232)**.
- The secrets: **server-side (L275), never in the context (L212)**.

## 17. Cheat Sheet

```text
AI + EXTERNAL APIS = the world through a wrapper

THE TOOL (L201, L163)
  the external call is a tool with a contract
  inputs · outputs · errors (L143)

THE KEY (L255)
  the idempotency key — payments, sends, writes
  the retried call presents the key → the API deduplicates
  retries (L169) without keys double-execute (L255)

THE CALL (L151, L169)
  timeout-bound (L151) — fail fast into the fallback (L232)
  retries with backoff (L169), bounded (L169)
  respecting the API's rate limits (L170)

THE ERRORS (L211)
  429   → the rate limit — back off (L170)
  5xx   → the transient — retry (L169)
  4xx   → the contract — fix the inputs (L143)
  timeout → the fallback — queue, dead letter, human (L232)

THE SECRETS (L275)
  server-side (L275) · scoped (L315) · never in the context (L212)

INTERVIEW, 4 MOVES
  1 tool    "the call wrapped with a contract (L201, L163)"
  2 key     "idempotency — the retry is safe (L255)"
  3 policy  "backoff (L169) · timeout (L151) · limits (L170)"
  4 errors  "mapped to the workflow's modes (L211)"
```

## 18. Key Takeaways

> [!RECAP]
> - AI + external APIs is **the world through a wrapper** (L227): the external call wrapped as a tool (L201) with a contract (L163, L143)
> - **The idempotency key is the money rule** (L255) — a retried payment or send presents the key, and the API deduplicates (L255); retries without keys double-execute (L169)
> - **The retry policy is bounded** (L169) — backoff (L169) that respects the API's rate limits (L170)
> - **The timeout bounds the call** (L151) — the slow API fails fast into the fallback (L232)
> - **The error mapping applies the L211 taxonomy** (L211): 429 → the limit (L170), 5xx → the retry (L169), 4xx → the contract (L143), timeout → the fallback (L232)
> - The wrapper is **the L230 platform's window to the world** (L230) — keyed, retried, bounded, and traced (L213)

## Check your understanding

Answer these without looking back.

1. What's the API tool (L201)?
2. Why is the idempotency key the money rule (L255)?
3. How do the retries respect the limits (L170)?
4. What's the error mapping (L211)?
5. What's the fallback path (L232)?
6. Why is the timeout part of the wrapper (L151)?
7. Where do the secrets live (L275)?
8. What does the trace record (L213)?

## A Closing Note — The Window to the World, Guarded

You now hold the API layer: **the tool wrapper with its contract, the idempotency key that makes retries safe, the bounded backoff, and the mapped errors with their fallbacks.** The world is now reachable — safely, idempotently, and without surprises (L227).

Next: the gate that decides whether automation scales — human approval workflows (L228).
