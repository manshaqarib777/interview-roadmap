# Lesson 328 — AI Observability Fundamentals

**Interview importance:** ⭐⭐⭐⭐⭐ — "what you must see in an AI system: prompts, outputs, tokens, latency, cost" — the answer is *the observability*: the AI's five must-see signals (L328).**

This is the first lesson of the AI Observability module — and the frame the module is drawn on. L327 secured the stack; this lesson is **what the stack must show**: the AI observability fundamentals — what you must see in an AI system: the prompts, the outputs, the tokens, the latency, and the cost (L328): the signals (the five, L328), the layers (the logs, the metrics, the traces, L329–331), and the why (the debugging L211, the cost L334, the quality L341). This lesson is the frame of the module (L328).

The distinction this lesson is built on: a **demo** watches the errors. A **solutions architect** watches the five (L328): the prompts (L328), the outputs (L328), the tokens (L332), the latency (L333), and the cost (L334) — because the AI product (L173) is its observability (L328).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the five signals: the prompts, the outputs, the tokens, the latency, the cost (L328)
- Explain the layers: the logs, the metrics, the traces (L329)
- Explain the why: the debugging, the cost, the quality (L328)
- Explain the AI shape: the product as its observability (L328)
- Explain the module: what L328–L346 assemble (L328)

## 1. One-Line Definition

**The AI observability fundamentals are what you must see in an AI system (L328) — the five signals (the prompts L312, the outputs, the tokens L332, the latency L333, and the cost L334, L328), the layers (the logs L329, the metrics L331, and the traces L330), and the why (the debugging L211, the cost L334, and the quality L341) — the product (L173) as its observability (L328).**

The one-sentence interview answer: *"The AI observability is the five must-see signals (L328). The signals (L328): the prompts (L328) — what was asked (L312); the outputs (L328) — what was returned (L328); the tokens (L332) — how much was used (L332); the latency (L333) — how long it took, the TTFT (L145); and the cost (L334) — what it spent (L334). The layers (L329): the logs (L329) — the records of the calls (L329); the metrics (L331) — the counters and the gauges (L331); and the traces (L330) — the request's path (L330). The why (L328): the debugging (L211) — the failure reconstructed (L328); the cost (L334) — the bill attributed (L334); and the quality (L341) — the regressions detected (L341). The AI shape (L173): the product (L173) is its observability (L328) — the five signals (L328) on every call (L328), the layers (L329) beneath (L329), and the module (L328) assembling them (L328): the logging (L329), the tracing (L330), the metrics (L331), the tokens (L332), the latency (L333), the cost (L334), the evals (L341), and the synthesis (L346)."*

## 2. Mental Model

Think of the observability as **the doctor's chart for the AI patient.** The chart (the observability, L328) records the vitals (the five signals, L328): the temperature (the prompts, L328), the pulse (the outputs, L328), the blood work (the tokens, L332), the reaction time (the latency, L333), and the bill (the cost, L334). The chart's sections (the layers, L329): the nurse's notes (the logs, L329), the vital signs board (the metrics, L331), and the timeline (the traces, L330). The doctor (the architect, L328) reads the chart (L328) to diagnose (the debugging, L211), to budget (the cost, L334), and to check the recovery (the quality, L341). The patient (the AI product, L173) is healthy when the chart is complete (L328).

```text
   the chart (the observability, L328)
   ┌────────────────────────────────────────────────────────┐
   │ the vitals (the five, L328): the prompts (L312), the   │
   │ outputs, the tokens (L332), the latency (L333), the    │
   │ cost (L334)                                            │
   │ the sections (the layers, L329): the notes (the logs,  │
   │ L329), the board (the metrics, L331), the timeline     │
   │ (the traces, L330)                                     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the chart**: the vitals and the sections (L328).

## 3. Visual Flow — One Observed Call

```text
   the request (L328)
        │
        ▼
   ┌────────────────────── THE FIVE (L328) ─────────────────────────────┐
   │  the prompt (L312) — hashed (L329)                                │
   │  the output — the response (L328)                                 │
   │  the tokens (L332) — the usage (L332)                             │
   │  the latency (L333) — the TTFT (L145)                             │
   │  the cost (L334) — the spend (L334)                               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE LAYERS (L329) ───────────────────────────┐
   │  the log (L329) — the structured record (L329)                    │
   │  the metric (L331) — the counter (L331)                           │
   │  the trace (L330) — the spans (L330)                              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the observation: **call → five signals → layers** (L328).

## 4. How It Works — The Frame, Part by Part

- **The five signals (L328).** The prompts (L328) — what was asked (L312); the outputs (L328) — what was returned (L328); the tokens (L332) — how much was used (L332); the latency (L333) — how long it took (L145); the cost (L334) — what it spent (L334).
- **The layers (L329).** The logs (L329) — the structured records (L329); the metrics (L331) — the counters and the gauges (L331); the traces (L330) — the request's path (L330).
- **The why (L328).** The debugging (L211) — the failure reconstructed (L328); the cost (L334) — the bill attributed (L334); the quality (L341) — the regressions detected (L341).

> [!NOTE]
> **The five are the AI's difference (L328).** The senior answer names the difference (L328): the web observability (L274) watches the errors and the latency (L333); the AI observability (L328) adds the prompts (L328), the outputs (L328), and the tokens (L332) — the *content* of the calls (L328) — plus the cost (L334) that the tokens (L332) drive (L334). The five (L328) are what the AI product (L173) must see (L328).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The five signals (L328) on every call (L328) — the per-tenant (L320) view (L328).
- **A chat product (L162).** The prompts (L312) and the outputs (L328) — the quality (L341) and the debugging (L211).
- **A RAG platform (L280).** The retrieval's latency (L333) and the tokens (L332) — the cost (L334) of the grounding (L280).
- **An agent product (L279).** The tool calls (L315) in the trace (L330) — the trajectory (L340) measured (L328).
- **Anything AI (L328).** The five signals (L328) — the product (L173) as its observability (L328).

The through-line: **the frame is the module's** — the five signals, the layers, and the why (L328).

## 6. Interview Explanation

Say it in four moves:

1. **The five.** "The prompts (L312), the outputs, the tokens (L332), the latency (L333), the cost (L334)."
2. **The layers.** "The logs (L329), the metrics (L331), the traces (L330)."
3. **The why.** "The debugging (L211), the cost (L334), the quality (L341)."
4. **The difference.** "The content and the cost — the AI's signals (L328)."

## 7. Senior-Level Insights

- **The prompts are the record's core (L328).** The prompt (L312) hashed (L329) — the PII (L313) out, the traceability (L322) in (L328).
- **The tokens are the cost's driver (L332).** The tokens (L332) per call (L328) — the cost (L334) attributed (L334) and the budget (L149) bounded (L328).
- **The latency is the UX's metric (L333).** The TTFT (L145) — the product's (L162) feel (L328).
- **The evals are the quality's gate (L341).** The regressions (L341) — the deploy (L307) gated (L341) — the quality (L328) measured (L328).
- **The traces are the path's truth (L330).** The request (L330) — the gateway (L267) to the model (L278) — the debugging (L211) and the audit (L322) read the same trace (L328).

## 8. Common Mistakes

- **The error-only watch (L274).** The errors (L274) without the five (L328) — the prompts (L312) and the tokens (L332) invisible (L328).
- **The raw prompts (L329).** The PII (L313) in the records (L329) — the hash (L329) and the redaction (L313) are the record's (L328).
- **The cost blind (L334).** The tokens (L332) unmeasured (L334) — the bill (L334) unattributed (L328).
- **The quality unmeasured (L341).** The regressions (L341) undetected (L328) — the evals (L341) are the quality's (L328).
- **The layers bolted on (L328).** The logs (L329) without the traces (L330) — the path (L330) invisible (L328).

## 9. Best Practices

- **Record the five** (L328) — on every call (L328).
- **Hash and redact the prompts** (L329) — the PII (L313) out (L328).
- **Attribute the cost** (L334) — per user, per tenant (L320).
- **Trace the path** (L330) — the gateway (L267) to the model (L278).
- **Gate with the evals** (L341) — in the CI (L296).

## 10. Interview Questions

**Q: Walk me through the AI observability fundamentals.**
> A: The five must-see signals (L328): the prompts (L312), the outputs, the tokens (L332), the latency (L333), and the cost (L334). The layers — the logs (L329), the metrics (L331), the traces (L330). And the why — the debugging (L211), the cost (L334), and the quality (L341).

**Q: How is AI observability different from the web's?**
> A: The content and the cost (L328): the web observability (L274) watches the errors and the latency (L333); the AI (L328) adds the prompts (L328) and the outputs (L328) — the *content* of the calls (L328) — plus the tokens (L332) and the cost (L334). The five (L328) are the AI's difference (L328).

**Q: What do you record per call?**
> A: The five (L328): the prompt hashed (L329), the output, the tokens (L332), the latency (L333) — the TTFT (L145) — and the cost (L334). Plus the identity (L322): the user (L319) and the tenant (L320) — the attribution (L334) and the audit (L322).

**Q: Why the evals?**
> A: The quality (L341): the observability (L328) tells you *what happened* (L328); the evals (L341) tell you *whether it's good* (L341). The regression suite (L341) in the CI (L296) gates the deploy (L307) — the quality (L328) measured like the code's tests (L296).

## 11. Follow-Up Questions

- What are the five (L328)?
- What are the layers (L329)?
- How is it different (L328)?
- What do you record per call (L328)?
- Why the evals (L341)?

## 12. Comparison Table — The Web vs the AI Observability

| | The web (L274) | The AI (L328) |
|---|---|---|
| The errors (L274) | yes (L274) | yes (L328) |
| The latency (L333) | yes (L333) | yes — the TTFT (L145) |
| The prompts (L328) | no (L274) | yes — hashed (L329) |
| The tokens (L332) | no (L274) | yes — the cost's driver (L334) |
| The quality (L341) | the tests (L296) | the evals (L341) |

The senior read: **the right column is the AI's** — the content, the cost, and the quality (L328).

## 13. Code Example — The Frame, Applied

```js
// The AI observability (L328) — the five signals per call (L328).
// 1 · THE CALL (L328) — the model invocation (L278).
async function observedCall(req) {
  const started = performance.now();               // the latency (L333)

  const response = await model.invoke(req.prompt);
  const usage = response.usage;                    // the tokens (L332)

  const ttft = await measureTTFT();                // the first token (L145)

  // 2 · THE FIVE (L328) — recorded (L328).
  const record = {
    promptHash: sha256(req.prompt),                // the prompt hashed (L329)
    output: response.text,                         // the output (L328)
    tokens: usage.total,                           // the tokens (L332)
    latencyMs: performance.now() - started,        // the latency (L333)
    ttftMs: ttft,                                  // the TTFT (L145)
    costUsd: costOf(usage),                        // the cost (L334)
    userId: req.userId,                            // the who (L322)
    tenantId: req.tenantId,                        // the tenant (L320)
  };

  // 3 · THE LAYERS (L329) — the log, the metric, the trace (L329).
  await log(record);                               // the log (L329)
  await metric('ai.tokens', usage.total);          // the metric (L331)
  await span('model.invoke', { started, ttft });   // the trace (L330)

  return response;
}
```

```text
What the reader must SEE — the frame, applied:

  promptHash + output       → the content (L329, L328)
  tokens + costUsd          → the usage (L332, L334)
  latencyMs + ttftMs        → the time (L333, L145)
  userId + tenantId         → the attribution (L322, L320)
  log + metric + span       → the layers (L329, L331, L330)

  The five signals, on every call (L328).
```

```narrate
4-6: The call — the model invocation with the timing started (L328, L333).
8-9: The usage — the tokens returned (L332).
11-12: The TTFT — the first token's arrival (L145).
14-25: The five — the hashed prompt, the output, the tokens, the latency, and the cost, with the identity (L328, L322).
27-30: The layers — the log, the metric, and the trace (L329, L331, L330).
```

> [!TIP]
> The pair that defines the frame: **the hashed prompt** (the content, L329) and **the cost per call** (the usage, L334). **Record the five on every call, hash the prompts, attribute the cost, trace the path — the AI's observability (L328).**

## 14. Performance Notes

- **The recording is the request's latency (L328).** The log and the metric (L329) — the async (L222) writes (L328) — the request path (L151) unblocked (L328).
- **The tokens are the cost's driver (L332).** The tokens (L332) per call (L328) — the bill (L334) attributed (L334).
- **The TTFT is the UX (L145).** The first token (L145) — the product's (L162) feel (L328).
- **The traces are the storage's cost (L330).** The spans (L330) — the sampling (L330) bounds the storage (L328).

## 15. Debugging Scenarios

| Symptom | First check (L328) | The lever |
|---|---|---|
| The failure is opaque | The record (L328) | The prompt's hash, the output (L329) |
| The bill is unexplained | The cost (L334) | The tokens (L332) per call (L334) |
| The response is slow | The latency (L333) | The TTFT (L145), the trace (L330) |
| The quality regressed | The evals (L341) | The regression suite (L341) |
| The PII is in the logs | The prompts (L329) | The hash and the redaction (L313) |

## 16. Quick Revision Notes

- The AI observability = **the five must-see signals** (L328): the prompts, the outputs, the tokens, the latency, the cost.
- The prompts and the outputs: **the content** (L328) — hashed (L329).
- The tokens: **the usage (L332) — the cost's driver (L334)**.
- The latency: **the TTFT (L145) — the UX (L162)**.
- The layers: **the logs (L329), the metrics (L331), the traces (L330)**.

## 17. Cheat Sheet

```text
AI OBSERVABILITY FUNDAMENTALS = what you must see in an AI system

THE FIVE SIGNALS (L328)
  the prompts (L312) — what was asked, hashed (L329)
  the outputs (L328) — what was returned (L328)
  the tokens (L332) — how much was used (L332)
  the latency (L333) — how long, the TTFT (L145)
  the cost (L334) — what it spent (L334)

THE LAYERS (L329)
  the logs (L329) — the structured records (L329)
  the metrics (L331) — the counters and the gauges (L331)
  the traces (L330) — the request's path (L330)

THE WHY (L328)
  the debugging (L211) — the failure reconstructed (L328)
  the cost (L334) — the bill attributed (L334)
  the quality (L341) — the regressions detected (L341)

THE DIFFERENCE (L328)
  the content and the cost (L328) — the AI's signals (L328)

INTERVIEW, 4 MOVES
  1 five    "the prompts, the outputs, the tokens, the latency, the cost (L328)"
  2 layers  "the logs, the metrics, the traces (L329)"
  3 why     "the debugging, the cost, the quality (L328)"
  4 difference "the content and the cost (L328)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI observability fundamentals are **what you must see in an AI system** (L328): the five signals (L328), the layers (L329), and the why (L328)
> - **The five signals** (L328): the prompts (L312), the outputs (L328), the tokens (L332), the latency (L333), and the cost (L334)
> - **The layers** (L329): the logs (L329) — the structured records (L329); the metrics (L331) — the counters and the gauges (L331); and the traces (L330) — the request's path (L330)
> - **The why** (L328): the debugging (L211), the cost (L334), and the quality (L341)
> - **The difference** (L328): the AI observability (L328) adds the content — the prompts (L328) and the outputs (L328) — and the cost (L334) that the tokens (L332) drive (L334), to the web's (L274) errors and latency (L333)
> - The AI shape (L328): the product (L173) is its observability (L328) — the five signals (L328) on every call (L328), the layers (L329) beneath (L329), and the module (L328) assembling them (L328): the logging (L329), the tracing (L330), the metrics (L331), the tokens (L332), the latency (L333), the cost (L334), the evals (L341), and the synthesis (L346)

## Check your understanding

Answer these without looking back.

1. What are the five (L328)?
2. What are the layers (L329)?
3. How is it different (L328)?
4. What do you record per call (L328)?
5. Why the evals (L341)?
6. What's the TTFT (L145)?
7. What's the hash for (L329)?
8. What is the AI's observability (L328)?

## A Closing Note — The Chart, Opened

You now hold the frame: **the five signals, the layers, and the why — with the content and the cost as the AI's difference.** The doctor's chart is open — and the vitals will be recorded (L328).

Next: the structured logs for every model call — Logging (L329).
