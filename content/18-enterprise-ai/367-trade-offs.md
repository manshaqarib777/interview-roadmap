# Lesson 367 — Architecture Trade-offs

**Interview importance:** ⭐⭐⭐⭐⭐ — "the named trade-off is the senior deliverable" — the answer is *the trade-offs*: the axes, the named choice, and the decision (L367).**

L362 selected and L361 recorded; this lesson is **the heart of the choice**: the architecture trade-offs — the named trade-off is the senior deliverable (L367): the axes (the cost, the latency, the quality, L367), the named choice (the trade-off stated, L367), and the decision (the ADR L361, L367). The AI shape (L173): the enterprise (L380) — the trade-offs (L367) named (L367). This lesson is the trade-off's craft (L367).

The distinction this lesson is built on: a **junior** picks silently. A **solutions architect** names the trade-off (L367): the axes (L367), the choice (L367), and the cost (L367) — because the named trade-off (L367) is the senior deliverable (L367).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the axes: the cost, the latency, the quality (L367)
- Explain the named choice: the trade-off stated (L367)
- Explain the cost: the given-up (L367)
- Explain the AI's trade-offs: the RAG, the model, the streaming (L367)
- Explain the AI shape: the named trade-off (L367)

## 1. One-Line Definition

**The architecture trade-offs are the named choice — the trade-off stated with what's given up (L367) — the axes (the cost L334, the latency L333, the quality L341, L367), the named choice (the trade-off stated: "we chose the X for the Y, at the Z's cost", L367), and the decision (the ADR L361: the trade-off recorded L361, L367) — the AI's (L367): the RAG L349 vs the fine-tuning L365, the streaming L251 vs the batch L282, the cost L334 vs the quality L341 — the named (L367), the senior's (L367) deliverable (L367).**

The one-sentence interview answer: *"The architecture trade-off is the named choice (L367). The axes (L367): the cost (L334), the latency (L333), and the quality (L341) — the trade's (L367) dimensions (L367). The named choice (L367): the trade-off stated (L367) — "we chose the RAG (L349) over the fine-tuning (L365) for the freshness (L335) and the cost (L368), at the latency's (L333) cost" (L367). The cost (L367): what's given up (L367) — the latency (L333), the quality (L341), the simplicity (L367) — the negative (L367) stated (L367). The decision (L361): the ADR (L361) — the trade-off (L367) recorded (L361) — the review (L361) on the change (L361). The AI's trade-offs (L367): the RAG (L349) vs the fine-tuning (L365) — the freshness (L335) vs the latency (L333); the streaming (L251) vs the batch (L282) — the UX (L162) vs the throughput (L358); and the cost (L334) vs the quality (L341) — the model's (L148) tier (L365). The AI shape (L173): the enterprise (L380) — the trade-offs (L367) named (L367): the axes (L367), the choice (L367), and the cost (L367) — the ADR (L361) recording (L361) — the named (L367), the senior's (L367) deliverable (L367)."*

## 2. Mental Model

Think of the trade-off as **the engineer's bridge design.** The bridge (the system, L173) has the constraints (the axes, L367): the budget (the cost, L334), the traffic (the latency, L333), and the safety (the quality, L341). The engineer (the architect, L367) names the choice (L367): "we chose the lighter span (L367) for the budget (L334), at the traffic's (L333) cost" — the trade-off (L367) stated (L367). The engineer's report (the ADR, L361) records it (L361): the choice (L361), the why (L361), and the given-up (L367). The bridge works because the trade-offs (L367) are named (L367) — the surprises (L367) avoided (L367).

```text
   the bridge (the system, L173)
   ┌────────────────────────────────────────────────────────┐
   │ the constraints (the axes, L367) — the budget (L334),  │
   │ the traffic (L333), the safety (L341)                  │
   │ the named choice (L367) — "for the X, at the Y's cost" │
   │ the report (the ADR, L361) — the record (L361)         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the bridge**: the constraints, the named choice, and the report (L367).

## 3. Visual Flow — One Named Trade-off

```text
   the decision point (L367)
        │  e.g. the RAG (L349) vs the fine-tuning (L365)
        ▼
   ┌────────────────────── THE AXES (L367) ─────────────────────────────┐
   │  the cost (L334) · the latency (L333) · the quality (L341)        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE NAMED CHOICE (L367) ─────────────────────┐
   │  "we chose the RAG (L349) for the freshness (L335) and the cost   │
   │  (L368), at the latency's (L333) cost" (L367)                     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ADR (L361) ──────────────────────────────┐
   │  the trade-off (L367) recorded (L361) — the review (L361) on the  │
   │  change (L361)                                                    │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the craft: **axes → named choice → ADR** (L367).

## 4. How It Works — The Craft, Part by Part

- **The axes (L367).** The cost (L334), the latency (L333), the quality (L341) — the trade's (L367) dimensions (L367).
- **The named choice (L367).** The trade-off stated (L367): "we chose the X for the Y, at the Z's cost" (L367).
- **The cost (L367).** What's given up (L367): the latency (L333), the quality (L341), the simplicity (L367) — the negative (L367) stated (L367).
- **The decision (L361).** The ADR (L361) — the trade-off (L367) recorded (L361).

> [!NOTE]
> **The named trade-off is the senior's deliverable (L367).** The senior answer states the trade-off (L367) explicitly (L367): the axes (L367) — the cost (L334), the latency (L333), the quality (L341); the choice (L367) — the picked (L367); and the cost (L367) — the given-up (L367). The unnamed trade-off (L367) is the hidden (L367) surprise (L367): the stakeholders (L360) discover it at the bill (L368) or the latency (L333). The named (L367) — the reviewable (L361) — is the senior's (L367) craft (L367).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The trade-offs (L367) named (L367) — the case study's (L379) decisions (L367).
- **A RAG decision (L349).** The RAG (L349) vs the fine-tuning (L365) — the freshness (L335) vs the latency (L333).
- **A model decision (L148).** The tier (L365) — the cost (L334) vs the quality (L341).
- **A streaming decision (L251).** The streaming (L251) vs the batch (L282) — the UX (L162) vs the throughput (L358).
- **Anything enterprise (L380).** The craft (L367) — the axes, the choice, the cost (L367).

The through-line: **the craft is the trade-off's** — the axes, the named choice, and the cost (L367).

## 6. Interview Explanation

Say it in four moves:

1. **The axes.** "The cost (L334), the latency (L333), the quality (L341)."
2. **The named choice.** "The trade-off stated (L367)."
3. **The cost.** "The given-up (L367)."
4. **The record.** "The ADR (L361)."

## 7. Senior-Level Insights

- **The naming is the craft (L367).** The trade-off (L367) stated (L367) — the "for the X, at the Y's cost" (L367) — the senior's (L367) sentence (L367).
- **The negative is the honesty (L367).** The given-up (L367) — the latency (L333), the quality (L341) — stated (L367) — the surprise (L367) avoided (L367).
- **The axes are the dimensions (L367).** The cost (L334), the latency (L333), the quality (L341) — the trade's (L367) frame (L367).
- **The ADR is the record (L361).** The trade-off (L367) in the ADR (L361) — the review (L361) on the change (L361).
- **The AI's trade-offs are the new (L367).** The RAG (L349) vs the fine-tuning (L365), the model's (L148) tier (L365) — the AI's (L367) axes (L367).

## 8. Common Mistakes

- **The silent pick (L367).** The choice (L367) un-named (L367) — the surprise (L367) at the cost (L368) — the naming (L367) is the deliverable (L367).
- **The one-axis view (L367).** The cost (L334) only (L367) — the latency (L333) and the quality (L341) forgotten (L367).
- **The positive-only (L367).** The gains (L367) stated (L367), the given-up (L367) hidden (L367) — the honesty (L367) is the negative (L367).
- **The un-recorded (L361).** The trade-off (L367) without the ADR (L361) — the review (L361) impossible (L367).
- **The static trade-off (L367).** The choice (L367) never revisited (L361) — the context (L361) changed (L367).

## 9. Best Practices

- **Frame the axes** (L367) — the cost (L334), the latency (L333), the quality (L341).
- **Name the choice** (L367) — the "for the X, at the Y's cost" (L367).
- **State the given-up** (L367) — the negative (L367) honestly (L367).
- **Record the ADR** (L361) — the trade-off (L367) reviewable (L361).
- **Revisit on the change** (L361) — the context (L361) re-read (L367).

## 10. Interview Questions

**Q: Walk me through the architecture trade-offs.**
> A: The named choice (L367). The axes — the cost (L334), the latency (L333), the quality (L341). The named choice — the trade-off stated (L367). The cost — the given-up (L367). And the record — the ADR (L361).

**Q: What's the senior's sentence?**
> A: The named trade-off (L367): "we chose the RAG (L349) over the fine-tuning (L365) for the freshness (L335) and the cost (L368), at the latency's (L333) cost" (L367). The choice (L367), the why (L367), and the given-up (L367) — in one sentence (L367).

**Q: What are the AI's trade-offs?**
> A: Three (L367): the RAG (L349) vs the fine-tuning (L365) — the freshness (L335) vs the latency (L333); the streaming (L251) vs the batch (L282) — the UX (L162) vs the throughput (L358); and the model's (L148) tier (L365) — the cost (L334) vs the quality (L341). Each named (L367) with the given-up (L367).

**Q: Why name it?**
> A: The surprise (L367): the unnamed trade-off (L367) — the hidden (L367) cost (L368) or the latency (L333) — discovered by the stakeholders (L360) later (L367). The named (L367) — in the ADR (L361) — is the reviewable (L361) and the senior's (L367) deliverable (L367).

## 11. Follow-Up Questions

- What are the axes (L367)?
- What's the senior's sentence (L367)?
- What are the AI's trade-offs (L367)?
- Why name it (L367)?
- What's the record (L361)?

## 12. Comparison Table — The Trade-off's Shapes

| Trade-off (L367) | The chosen (L367) | The given-up (L367) |
|---|---|---|
| The RAG vs the fine-tuning (L365) | the RAG (L349) | the latency (L333) |
| The streaming vs the batch (L282) | the streaming (L251) | the throughput (L358) |
| The small vs the frontier (L157) | the small (L157) | the quality (L341) |

The senior read: **each trade-off named with the given-up** (L367).

## 13. Code Example — The Craft, Applied

```js
// The architecture trade-offs (L367) — the named choices (L367).
// 1 · THE AXES (L367) — the dimensions (L367).
const axes = ['cost', 'latency', 'quality'];     // L334, L333, L341

// 2 · THE NAMED CHOICES (L367) — the trade-offs stated (L367).
const tradeoffs = [
  {
    id: 'retrieval-approach',
    // "we chose the X for the Y, at the Z's cost" (L367):
    choice: 'RAG over fine-tuning',               // L349, L365
    for:    'the freshness (L335) and the cost (L368)',
    atCostOf: 'the latency (L333) of the retrieval (L189)',
    axes: { cost: '+', latency: '-', quality: '=' },   // L367
  },
  {
    id: 'transport',
    choice: 'streaming over batch',               // L251, L282
    for:    'the UX (L162) — the TTFT (L145)',
    atCostOf: 'the throughput (L358) and the complexity (L367)',
    axes: { latency: '+', cost: '-', quality: '=' },
  },
  {
    id: 'model-tier',
    choice: 'the tiered models over the single frontier',  // L365
    for:    'the cost (L334) — the 80/20 (L365)',
    atCostOf: 'the routing's (L155) complexity and the quality (L341) on the small (L157)',
    axes: { cost: '+', latency: '+', quality: '-' },
  },
];

// 3 · THE ADR (L361) — each trade-off recorded (L361).
//   ADR-041: the retrieval-approach — the RAG (L349), at the latency (L333)
```

```text
What the reader must SEE — the craft, applied:

  axes: cost, latency, quality → the dimensions (L367)
  "for the X, at the Y's cost" → the named choice (L367)
  the + and - per axis         → the honesty (L367)
  the ADR per trade-off        → the record (L361)

  The axes, the choice, the given-up — named (L367).
```

```narrate
4-5: The axes — the dimensions of the trade (L367).
7-16: The RAG trade-off — chosen for the freshness, at the latency's cost (L349, L367).
17-25: The transport trade-off — the streaming for the UX, at the throughput's cost (L251, L367).
26-34: The model tier trade-off — the tiers for the cost, at the quality's cost (L365, L367).
36-37: The ADR — each trade-off recorded (L361).
```

> [!TIP]
> The pair that defines the craft: **the "for the X, at the Y's cost" sentence** (the naming, L367) and **the per-axis +/-** (the honesty, L367). **Frame the axes, name the choice, state the given-up, record the ADR — the senior's deliverable (L367).**

## 14. Performance Notes

- **The naming is the review's speed (L367).** The stated trade-off (L367) — the debate (L367) shortened (L367).
- **The honesty is the surprise's (L367).** The given-up (L367) stated (L367) — the bill (L368) surprise (L367) avoided (L367).
- **The ADR is the revisit's (L361).** The recorded (L361) — the context (L361) re-read (L367).
- **The axes are the decision's (L367).** The cost (L334), the latency (L333), the quality (L341) — the frame (L367).

## 15. Debugging Scenarios

| Symptom | First check (L367) | The lever |
|---|---|---|
| The bill surprises | The trade-off (L367) | The cost (L334) named (L367) |
| The latency disappoints | The trade-off (L367) | The given-up (L333) stated (L367) |
| The choice is disputed | The ADR (L361) | The named (L367) + the recorded (L361) |
| The quality slipped | The trade-off (L367) | The quality (L341) axis (L367) |
| The context changed | The review (L361) | The revisit (L361) |

## 16. Quick Revision Notes

- The architecture trade-offs = **the named choice** (L367): the axes, the choice, the cost.
- The axes: **the cost (L334), the latency (L333), the quality (L341)**.
- The named choice: **the "for the X, at the Y's cost" (L367)**.
- The cost: **the given-up (L367) — stated (L367)**.
- The record: **the ADR (L361)**.

## 17. Cheat Sheet

```text
ARCHITECTURE TRADE-OFFS = the named choice

THE AXES (L367)
  the cost (L334) · the latency (L333) · the quality (L341)
  the trade's (L367) dimensions (L367)

THE NAMED CHOICE (L367)
  "we chose the X for the Y, at the Z's cost" (L367)
  the choice (L367) · the why (L367) · the given-up (L367)

THE COST (L367)
  what's given up (L367): the latency (L333), the quality (L341),
  the simplicity (L367) — the negative (L367) stated (L367)

THE AI'S TRADE-OFFS (L367)
  the RAG (L349) vs the fine-tuning (L365) — the freshness (L335)
    vs the latency (L333)
  the streaming (L251) vs the batch (L282) — the UX (L162)
    vs the throughput (L358)
  the model's (L148) tier (L365) — the cost (L334) vs the quality (L341)

THE RECORD (L361)
  the ADR (L361) — the trade-off (L367) reviewable (L361)

INTERVIEW, 4 MOVES
  1 axes    "the cost, the latency, the quality (L367)"
  2 named   "the choice stated (L367)"
  3 cost    "the given-up (L367)"
  4 record  "the ADR (L361)"
```

## 18. Key Takeaways

> [!RECAP]
> - The architecture trade-offs are **the named choice — the trade-off stated with what's given up** (L367): the axes (L367), the named choice (L367), the cost (L367), and the record (L361)
> - **The axes** (L367): the cost (L334), the latency (L333), and the quality (L341) — the trade's (L367) dimensions (L367)
> - **The named choice** (L367): "we chose the X for the Y, at the Z's cost" (L367) — the trade-off stated (L367)
> - **The cost** (L367): what's given up (L367) — the latency (L333), the quality (L341), the simplicity (L367) — the negative (L367) stated (L367)
> - **The AI's trade-offs** (L367): the RAG (L349) vs the fine-tuning (L365), the streaming (L251) vs the batch (L282), and the model's (L148) tier (L365)
> - The record (L361): the ADR (L361) — the trade-off (L367) recorded (L361), reviewable (L361) — the named (L367), the senior's (L367) deliverable (L367)

## Check your understanding

Answer these without looking back.

1. What are the axes (L367)?
2. What's the senior's sentence (L367)?
3. What are the AI's trade-offs (L367)?
4. Why name it (L367)?
5. What's the record (L361)?
6. What's the given-up (L367)?
7. What's the surprise (L367)?
8. What is the senior's deliverable (L367)?

## A Closing Note — The Bridge, Documented

You now hold the craft: **the axes, the named choice, and the cost — with the "for the X, at the Y's cost" in the report.** The engineer's choices are named — and the bridge's surprises are avoided (L367).

Next: the token math, the infra cost, and the budget that survives the board — Cost Estimation & Budgeting (L368).
