# Lesson 364 — Vendor Selection

**Interview importance:** ⭐⭐⭐⭐⭐ — "evaluating model and platform vendors on the axes that matter" — the answer is *the vendor eval*: the model vendors, the platform vendors, and the axes (L364).**

L363 decided the build vs buy; this lesson is **who to buy from**: the vendor selection — evaluating the model and the platform vendors on the axes that matter (L364): the vendors (the model L364, the platform L364), the axes (the capability, the cost, the risk, L364), and the decision (the ADR L361, L364). The AI shape (L173): the model vendor (L152) and the cloud vendor (L366) — selected (L364). This lesson is the vendor's eval (L364).

The distinction this lesson is built on: a **junior** picks the famous. A **solutions architect** evaluates the axes (L364): the capability (L364), the cost (L364), and the risk (L364) — the model and the platform vendors (L364) — because the vendor (L364) is the long-term (L364) partner (L364).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the vendors: the model, the platform (L364)
- Explain the axes: the capability, the cost, the risk (L364)
- Explain the model axes: the quality, the latency, the price (L364)
- Explain the platform axes: the features, the lock-in (L364)
- Explain the AI shape: the vendor's eval (L364)

## 1. One-Line Definition

**The vendor selection evaluates the model and the platform vendors on the axes that matter (L364) — the vendors (the model L364: the OpenAI L152, the Anthropic L153, the Bedrock L278; the platform L364: the cloud L366, the observability L345, L364), the axes (the capability L364, the cost L364, the risk L364, L364), and the decision (the ADR L361: the scored table L362 and the choice L361, L364) — the enterprise's (L380) vendors, evaluated (L364).**

The one-sentence interview answer: *"The vendor selection is the axes' evaluation (L364). The vendors (L364): the model vendors (L364) — the OpenAI (L152), the Anthropic (L153), the Bedrock (L278); the platform vendors (L364) — the cloud (L366), the observability (L345). The axes (L364): the capability (L364) — what it does (L364); the cost (L364) — the licensing (L363) and the usage (L368); and the risk (L364) — the maturity (L364), the lock-in (L377), the compliance (L371). The model axes (L364): the quality (L341) — the evals (L341) on the golden set (L342); the latency (L333) — the TTFT (L145); and the price (L150) — the tokens (L332). The platform axes (L364): the features (L364) — the fit (L362); and the lock-in (L377) — the exit cost (L366). The decision (L361): the scored table (L362) — the axes (L364) weighted (L362) — the ADR (L361) recording the choice (L361). The AI shape (L173): the enterprise (L380) — the model vendor (L152) and the cloud (L366) — evaluated (L364) on the axes (L364), recorded (L361)."*

## 2. Mental Model

Think of the vendor selection as **the supplier's fair.** The procurement officer (the architect, L364) visits the stalls (the vendors, L364): the flour mills (the model vendors, L364) — the OpenAI (L152), the Anthropic (L153); and the equipment makers (the platform vendors, L364) — the cloud (L366), the observability (L345). The officer's checklist (the axes, L364): the quality (the capability, L364) — the flour's (L341) grade; the price (the cost, L364) — the bag's (L368) cost; and the reliability (the risk, L364) — the mill's (L364) record (L364). The samples (the evals, L341) — the test bakes (L342) — scored (L341). The contract (the ADR, L361) — the chosen mill (L361) recorded (L361). The fair works because the checklist is clear, the samples are tested, and the contract is recorded (L364).

```text
   the fair (the vendor selection, L364)
   ┌────────────────────────────────────────────────────────┐
   │ the stalls (the vendors, L364) — the mills (L152), the │
   │ makers (L366)                                          │
   │ the checklist (the axes, L364) — the quality (L341),   │
   │ the price (L368), the risk (L377)                      │
   │ the samples (the evals, L341) · the contract (the ADR, │
   │ L361)                                                  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the fair**: the stalls, the checklist, and the samples (L364).

## 3. Visual Flow — One Vendor Eval

```text
   the need (L364)
        │  the model (L148) for the chat (L348)
        ▼
   ┌────────────────────── THE SHORTLIST (L364) ────────────────────────┐
   │  the OpenAI (L152) · the Anthropic (L153) · the Bedrock (L278)    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE AXES (L364) ─────────────────────────────┐
   │  the quality (L341): the evals (L341) on the golden set (L342)    │
   │  the latency (L333): the TTFT (L145) · the price (L150)           │
   │  the risk (L364): the maturity (L364), the lock-in (L377)         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DECISION (L361) ─────────────────────────┐
   │  the scored table (L362) → the ADR (L361): the choice (L361)      │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the eval: **shortlist → axes → decision** (L364).

## 4. How It Works — The Eval, Part by Part

- **The vendors (L364).** The model vendors (L152) and the platform vendors (L366).
- **The axes (L364).** The capability (L364), the cost (L364), the risk (L364).
- **The model axes (L364).** The quality (L341), the latency (L333), the price (L150).
- **The decision (L361).** The scored table (L362) and the ADR (L361).

> [!NOTE]
> **The model's eval is the vendor's evidence (L364).** The senior answer evaluates the model (L364) with the data (L364): the golden set (L342) — the representative (L342) tasks (L364) — run against the candidates (L364) — the quality (L341) scored (L341), the latency (L333) measured (L333), the price (L150) costed (L368). The vendor's (L364) claims (L364) — the benchmark (L364) — verified (L364) on the enterprise's (L380) own data (L342).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The model vendor (L152) and the cloud (L366) — evaluated (L364).
- **A model decision (L148).** The OpenAI (L152) vs the Anthropic (L153) — the evals (L341) on the golden set (L342).
- **A cloud decision (L366).** The AWS (L366) vs the Azure (L366) — the features and the lock-in (L377).
- **An observability decision (L345).** The Langfuse (L345) vs the LangSmith (L344) — the data's control (L345).
- **Anything enterprise (L380).** The vendor's eval (L364) — the axes, the samples, the ADR (L364).

The through-line: **the eval is the vendor's** — the axes, the samples, and the decision (L364).

## 6. Interview Explanation

Say it in four moves:

1. **The vendors.** "The model (L152) and the platform (L366)."
2. **The axes.** "The capability, the cost, the risk (L364)."
3. **The model axes.** "The quality (L341), the latency (L333), the price (L150)."
4. **The decision.** "The scored table (L362) and the ADR (L361)."

## 7. Senior-Level Insights

- **The eval is the evidence (L364).** The golden set (L342) — the vendor's (L364) claims (L364) verified (L364) on the enterprise's (L380) data (L342).
- **The lock-in is the risk's (L377).** The exit cost (L366) — the portability (L377) — the L377 multi-cloud (L377), vendor-shaped (L364).
- **The price is the usage's (L150).** The tokens (L332) at the scale (L358) — the L368 cost (L368) — the per-token (L150) × the volume (L364).
- **The compliance is the boundary (L371).** The residency (L261) and the privacy (L313) — the L371 frameworks (L371) — the vendor's (L364) compliance (L371).
- **The ADR is the record (L361).** The scored table (L362) — the choice (L361) — the reviewable (L361) decision (L364).

## 8. Common Mistakes

- **The famous picked (L364).** The brand (L364) without the evals (L341) — the fit (L362) un-measured (L364).
- **The benchmark trusted (L364).** The vendor's (L364) numbers (L364) — the golden set (L342) is the enterprise's (L380) evidence (L364).
- **The price-only (L150).** The tokens (L332) per call (L150) — the volume (L358) and the latency (L333) matter (L364).
- **The lock-in ignored (L377).** The proprietary (L364) — the exit cost (L366) — the L377 cost (L377) (L364).
- **The ADR-less (L361).** The choice (L364) un-recorded (L361) — the defense (L364) lost (L361).

## 9. Best Practices

- **Eval on the golden set** (L342) — the enterprise's (L380) data (L364).
- **Score the axes** (L362) — the capability, the cost, the risk (L364).
- **Cost the usage** (L368) — the tokens (L332) at the scale (L358).
- **Check the lock-in** (L377) — the exit cost (L366).
- **Record the ADR** (L361) — the scored table (L362) and the choice (L361).

## 10. Interview Questions

**Q: Walk me through the vendor selection.**
> A: The axes' evaluation (L364). The vendors — the model (L152) and the platform (L366). The axes — the capability, the cost, the risk (L364). The model axes — the quality (L341), the latency (L333), the price (L150). And the decision — the scored table (L362) and the ADR (L361).

**Q: How do you evaluate the model vendors?**
> A: The evals (L341): the golden set (L342) — the representative (L342) tasks (L364) — run against the candidates (L364) — the quality (L341) scored (L341), the latency (L333) measured (L333), the price (L150) costed (L368). The vendor's (L364) benchmarks (L364) verified (L364) on the enterprise's (L380) data (L342).

**Q: What are the axes?**
> A: Three (L364): the capability (L364) — what it does and the fit (L362); the cost (L364) — the licensing (L363) and the usage (L368); and the risk (L364) — the maturity (L364), the lock-in (L377), the compliance (L371). The weighted (L362) score (L364) — the table (L362) in the ADR (L361).

**Q: What's the lock-in?**
> A: The exit cost (L377): the proprietary (L364) model or platform (L364) — the migration (L364) to the next vendor (L364) — the cost (L366). The portability (L377) — the standard APIs (L346), the open formats (L364) — the L377 mitigation (L377), vendor-shaped (L364).

## 11. Follow-Up Questions

- What are the vendors (L364)?
- How do you evaluate the model vendors (L364)?
- What are the axes (L364)?
- What's the lock-in (L377)?
- What's the ADR (L361)?

## 12. Comparison Table — The Model Vendor Axes

| Axis (L364) | The question (L364) | The measure (L364) |
|---|---|---|
| The quality (L341) | how good (L364) | the evals (L341) on the golden set (L342) |
| The latency (L333) | how fast (L364) | the TTFT (L145) and the p99 (L333) |
| The price (L150) | how much (L364) | the tokens (L332) × the volume (L358) |
| The risk (L364) | how safe (L364) | the maturity (L364), the lock-in (L377) |

The senior read: **the axes, scored on the enterprise's data** (L364).

## 13. Code Example — The Eval, Applied

```js
// The vendor selection (L364) — the axes on the golden set (L364).
// 1 · THE GOLDEN SET (L342) — the enterprise's tasks (L364).
const goldenSet = loadGoldenSet('support-queries');    // L342

// 2 · THE CANDIDATES (L364) — the model vendors (L152).
const candidates = [
  { id: 'openai',   invoke: (q) => openai.chat(q) },   // L152
  { id: 'anthropic', invoke: (q) => anthropic.chat(q) }, // L153
  { id: 'bedrock',  invoke: (q) => bedrock.chat(q) },  // L278
];

// 3 · THE AXES (L364) — the quality, the latency, the price (L364).
async function evaluate(candidate) {
  let qualitySum = 0, latencySum = 0;
  for (const { query, expected } of goldenSet) {
    const started = performance.now();
    const out = await candidate.invoke(query);
    latencySum += performance.now() - started;         // L333
    qualitySum += await judge.score(out, expected);    // L343, L341
  }
  const price = pricePerToken(candidate.id);           // L150
  return {
    id: candidate.id,
    quality: qualitySum / goldenSet.length,            // L341
    latency: latencySum / goldenSet.length,            // L333
    monthlyCost: estimateMonthly(price),               // L368
  };
}

// 4 · THE ADR (L361) — the scored table and the choice (L361).
const scores = await Promise.all(candidates.map(evaluate));
// ADR-027: the anthropic — the quality (L341) at the latency (L333)
```

```text
What the reader must SEE — the eval, applied:

  the golden set (L342)      → the enterprise's data (L364)
  the three candidates (L152) → the shortlist (L364)
  judge.score + latency      → the axes (L341, L333)
  monthlyCost estimate       → the price (L368, L150)
  the ADR (L361)             → the record (L361)

  The quality, the latency, the price — scored and recorded (L364).
```

```narrate
4-5: The golden set — the enterprise's representative tasks (L342, L364).
7-11: The candidates — the model vendors (L152, L153, L278).
13-24: The axes — the quality, the latency, and the price evaluated (L341, L333, L368).
26-28: The ADR — the scored table and the choice recorded (L361).
```

> [!TIP]
> The pair that defines the eval: **the golden-set scoring** (the evidence, L342) and **the monthly cost** (the economics, L368). **Eval on your data, score the axes, cost the usage, record the ADR — the vendor's eval (L364).**

## 14. Performance Notes

- **The eval is the decision's speed (L364).** The golden set (L342) — the choice (L361) evidenced (L364).
- **The latency is the TTFT's (L333).** The p99 (L333) — the UX (L162) — the vendor's (L364) axis (L364).
- **The price is the scale's (L150).** The tokens (L332) at the volume (L358) — the L368 cost (L368) (L364).
- **The lock-in is the exit's (L377).** The migration (L364) — the L377 cost (L377) (L364).

## 15. Debugging Scenarios

| Symptom | First check (L364) | The lever |
|---|---|---|
| The choice is disputed | The evals (L341) | The golden set (L342) |
| The bill explodes | The price (L150) | The volume (L358) × the tokens (L332) |
| The migration is hard | The lock-in (L377) | The portability (L377) |
| The compliance fails | The vendor (L371) | The residency (L261) |
| The why is lost | The ADR (L361) | The scored table (L361) |

## 16. Quick Revision Notes

- The vendor selection = **the vendor's eval** (L364): the vendors, the axes, the decision.
- The vendors: **the model (L152) and the platform (L366)**.
- The axes: **the capability, the cost, the risk (L364)**.
- The model axes: **the quality (L341), the latency (L333), the price (L150)**.
- The decision: **the scored table (L362) and the ADR (L361)**.

## 17. Cheat Sheet

```text
VENDOR SELECTION = the axes that matter

THE VENDORS (L364)
  the model vendors (L364): the OpenAI (L152), the Anthropic (L153),
    the Bedrock (L278)
  the platform vendors (L364): the cloud (L366), the observability (L345)

THE AXES (L364)
  the capability (L364) — what it does, the fit (L362)
  the cost (L364) — the licensing (L363), the usage (L368)
  the risk (L364) — the maturity (L364), the lock-in (L377),
    the compliance (L371)

THE MODEL AXES (L364)
  the quality (L341) — the evals (L341) on the golden set (L342)
  the latency (L333) — the TTFT (L145), the p99 (L333)
  the price (L150) — the tokens (L332) × the volume (L358)

THE DECISION (L361)
  the scored table (L362) — the weighted axes (L362)
  the ADR (L361) — the choice recorded (L361)

INTERVIEW, 4 MOVES
  1 vendors  "the model and the platform (L364)"
  2 axes     "the capability, the cost, the risk (L364)"
  3 model axes "the quality, the latency, the price (L364)"
  4 decision "the scored table and the ADR (L364)"
```

## 18. Key Takeaways

> [!RECAP]
> - The vendor selection **evaluates the model and the platform vendors on the axes that matter** (L364): the vendors (L364), the axes (L364), the model axes (L364), and the decision (L361)
> - **The vendors** (L364): the model vendors (L364) — the OpenAI (L152), the Anthropic (L153), the Bedrock (L278); the platform vendors (L364) — the cloud (L366), the observability (L345)
> - **The axes** (L364): the capability (L364), the cost (L364), and the risk (L364) — the maturity (L364), the lock-in (L377), the compliance (L371)
> - **The model axes** (L364): the quality (L341) — the evals (L341) on the golden set (L342); the latency (L333) — the TTFT (L145); and the price (L150) — the tokens (L332)
> - **The decision** (L361): the scored table (L362) — the weighted axes (L362) — and the ADR (L361)
> - The principle (L364): the vendor's (L364) benchmarks (L364) verified (L364) on the enterprise's (L380) own data (L342) — the golden set (L342) is the evidence (L364)

## Check your understanding

Answer these without looking back.

1. What are the vendors (L364)?
2. How do you evaluate the model vendors (L364)?
3. What are the axes (L364)?
4. What's the lock-in (L377)?
5. What's the ADR (L361)?
6. What's the golden set (L342)?
7. What's the model's price (L150)?
8. What is the vendor's eval (L364)?

## A Closing Note — The Fair, Judged

You now hold the eval: **the vendors, the axes, and the decision — with the samples tested and the contract recorded.** The supplier's fair is judged on the enterprise's own flour — and the chosen mill is in the logbook (L364).

Next: the routing, the fine-tuning, and the tiered model strategy — Model Selection at Scale (L365).
