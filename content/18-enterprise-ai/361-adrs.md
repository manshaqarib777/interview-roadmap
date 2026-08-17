# Lesson 361 — Architecture Decision Records

**Interview importance:** ⭐⭐⭐⭐⭐ — "the document that makes a choice reviewable and reversible" — the answer is *the ADR*: the context, the decision, and the consequences (L361).**

L359–360 gathered and aligned; this lesson is **how the choices are recorded**: the architecture decision records — the document that makes a choice reviewable and reversible (L361): the ADR (the record, L361), the parts (the context, the decision, the consequences, L361), and the use (the review, the reversal, L361). The AI shape (L173): the enterprise (L380) — the ADRs (L361) for the model, the RAG, the cloud (L361). This lesson is the decision's record (L361).

The distinction this lesson is built on: a **junior** decides in the meeting. A **solutions architect** records the ADR (L361): the context (L361), the decision (L361), and the consequences (L361) — because the choice (L361) must be reviewable (L361) and reversible (L361).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the ADR: the decision's record (L361)
- Explain the context: the why (L361)
- Explain the decision: the choice (L361)
- Explain the consequences: the costs and the trade-offs (L361)
- Explain the AI shape: the model and the RAG ADRs (L361)

## 1. One-Line Definition

**The architecture decision records are the documents that make a choice reviewable and reversible (L361) — the ADR (the record: the numbered, the titled, the dated, L361), the parts (the context: the why L361; the decision: the choice L361; the consequences: the costs L367 and the trade-offs L361), and the use (the review: the decision revisited L361; the reversal: the ADR superseded L361) — the enterprise's (L380) decisions, recorded (L361).**

The one-sentence interview answer: *"The ADR is the decision's record (L361). The parts (L361): the context (L361) — the why (L361): the problem (L361), the constraints (L361), the options (L361); the decision (L361) — the choice (L361): "we chose the RAG (L349) over the fine-tuning (L365)"; and the consequences (L361) — the costs (L367): the latency (L333), the quality (L341), the maintenance (L361) — the positive and the negative (L361). The use (L361): the review (L361) — the decision (L361) revisited (L361) when the context (L361) changes (L361): the model (L148) updated (L365), the scale (L358) grown; and the reversal (L361) — the ADR (L361) superseded (L361) by the new one (L361) — the choice (L361) reversible (L361). The AI shape (L173): the enterprise (L380) — the ADRs (L361): the model's choice (L148), the RAG (L349) vs the fine-tuning (L365), the cloud (L366) — the decisions (L361) recorded (L361), reviewable (L361), and reversible (L361)."*

## 2. Mental Model

Think of the ADR as **the ship's logbook for the course changes.** The captain (the architect, L361) records every course change (the decision, L361) in the logbook (the ADR, L361): the reason (the context, L361) — the storm (the problem, L361) and the routes (the options, L361); the chosen route (the decision, L361); and the consequences (L361) — the time gained (L361), the fuel spent (L361). The crew (the team, L361) reads the logbook (L361) — the change (L361) is reviewable (L361): "why did we turn?" (L361); and the change (L361) is reversible (L361): the logbook (L361) shows the old course (L361) — the return (L361) possible (L361). The ship works because the logbook is kept, the reasons are written, and the turns are reversible (L361).

```text
   the logbook (the ADR, L361)
   ┌────────────────────────────────────────────────────────┐
   │ the entries (the ADRs, L361) — the numbered, the       │
   │ dated (L361)                                           │
   │ the reason (the context, L361) · the route (the        │
   │ decision, L361) · the costs (the consequences, L361)   │
   │ the crew (the review, L361) — reads, revisits,         │
   │ reverses (L361)                                        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the logbook**: the entries, the reasons, and the review (L361).

## 3. Visual Flow — One ADR's Life

```text
   the decision point (L361)
        │  e.g. the RAG (L349) vs the fine-tuning (L365)
        ▼
   ┌────────────────────── THE ADR (L361) ──────────────────────────────┐
   │  ADR-014: Choose the RAG over the fine-tuning (L361)              │
   │  the context (L361): the latency (L333), the cost (L368),         │
   │    the data (L313) — the options (L361)                           │
   │  the decision (L361): the RAG (L349)                              │
   │  the consequences (L361): the latency (L333), the quality         │
   │    (L341), the maintenance (L361)                                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REVIEW (L361) ───────────────────────────┐
   │  the context changes (L361): the scale (L358) grows (L361)        │
   │  → the ADR revisited (L361) → the superseded (L361) by ADR-021    │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the ADR: **decision → record → review → supersede** (L361).

## 4. How It Works — The Record, Part by Part

- **The ADR (L361).** The record (L361): the numbered (L361), the titled (L361), the dated (L361), the status (L361) — the proposed, the accepted, the superseded (L361).
- **The context (L361).** The why (L361): the problem (L361), the constraints (L361), the options (L361).
- **The decision (L361).** The choice (L361) — with the rationale (L361).
- **The consequences (L361).** The costs (L367): the latency (L333), the quality (L341), the maintenance (L361) — the positive and the negative (L361).

> [!NOTE]
> **The ADR is the review's and the reversal's tool (L361).** The senior answer uses the ADR (L361) for the two (L361): the review (L361) — the decision (L361) revisited (L361) when the context (L361) changes (L361): the new model (L148), the new scale (L358), the new compliance (L371) — the ADR's (L361) context (L361) re-read (L361); and the reversal (L361) — the ADR (L361) superseded (L361) — the new ADR (L361) records the new choice (L361) with the old (L361) as the history (L361). The reviewable (L361) and the reversible (L361) are the record's (L361) value (L361).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The ADRs (L361) — the case study's (L379) decisions (L361).
- **A model choice (L148).** The ADR (L361): the model (L148) selected (L361) — the candidates (L148) and the trade-offs (L367).
- **A RAG vs fine-tuning (L349).** The ADR (L361): the RAG (L349) chosen (L361) — the context (L361) and the consequences (L361).
- **A cloud choice (L366).** The ADR (L361): the cloud (L366) selected (L361) — the exit cost (L366).
- **Anything enterprise (L380).** The record (L361) — the decisions (L361), reviewable and reversible (L361).

The through-line: **the record is the decision's** — the context, the choice, and the consequences (L361).

## 6. Interview Explanation

Say it in four moves:

1. **The ADR.** "The numbered, dated record of the decision (L361)."
2. **The context.** "The why — the problem, the constraints, the options (L361)."
3. **The decision.** "The choice — with the rationale (L361)."
4. **The consequences.** "The costs — the latency, the quality, the maintenance (L361)."

## 7. Senior-Level Insights

- **The context is the review's key (L361).** The why (L361) — the decision (L361) revisited (L361) when the context (L361) changes (L361).
- **The consequences are the honesty (L361).** The costs (L367) — the negative (L361) stated (L361) — the surprise (L361) avoided (L361).
- **The supersede is the reversal (L361).** The new ADR (L361) — the old (L361) as the history (L361) — the choice (L361) reversible (L361).
- **The status is the lifecycle (L361).** The proposed (L361), the accepted (L361), the superseded (L361) — the decision's (L361) state (L361).
- **The AI's ADRs are the difference (L361).** The model (L148), the RAG (L349), the evals (L341) — the AI's (L359) decisions (L361) recorded (L361).

## 8. Common Mistakes

- **The decision in the meeting (L361).** The choice (L361) unrecorded (L361) — the why (L361) lost (L361) — the ADR (L361) is the record (L361).
- **The decision-only ADR (L361).** The choice (L361) without the context (L361) — the review (L361) impossible (L361).
- **The consequence-less ADR (L361).** The costs (L367) unstated (L361) — the surprise (L361) at the bill (L368).
- **The un-reviewed ADR (L361).** The decision (L361) never revisited (L361) — the stale (L361) choice (L361).
- **The un-reversible ADR (L361).** The choice (L361) without the supersede (L361) — the reversal (L361) lost (L361).

## 9. Best Practices

- **Record every decision** (L361) — the numbered (L361), the dated (L361).
- **Write the context** (L361) — the why (L361) and the options (L361).
- **State the consequences** (L361) — the costs (L367) and the trade-offs (L361).
- **Review on the change** (L361) — the context (L361) re-read (L361).
- **Supersede on the reversal** (L361) — the new ADR (L361), the old as the history (L361).

## 10. Interview Questions

**Q: Walk me through the ADR.**
> A: The decision's record (L361). The parts — the context (the why, the options), the decision (the choice), and the consequences (the costs) (L361). The use — the review (L361) and the reversal (L361) — the supersede (L361).

**Q: Why record the decision?**
> A: The review and the reversal (L361): the review (L361) — the decision (L361) revisited (L361) when the context (L361) changes (L361): the new model (L148), the new scale (L358); the reversal (L361) — the ADR (L361) superseded (L361) by the new one (L361) — the choice (L361) reversible (L361). Without the ADR (L361), the why (L361) is lost (L361).

**Q: What's in the context?**
> A: The why (L361): the problem (L361) — what the decision solves (L361); the constraints (L361) — the latency (L333), the cost (L368), the compliance (L371); and the options (L361) — the considered (L361) alternatives (L361). The context (L361) makes the decision (L361) reviewable (L361).

**Q: How does the AI differ?**
> A: The AI's decisions (L361): the model (L148) — which and why (L361); the RAG (L349) vs the fine-tuning (L365); the evals (L341) — the success metric (L359). The ADRs (L361) for the AI's (L359) choices (L361) — the reviewable (L361) record (L361).

## 11. Follow-Up Questions

- What's the ADR (L361)?
- Why record the decision (L361)?
- What's in the context (L361)?
- How does the AI differ (L361)?
- What's the supersede (L361)?

## 12. Comparison Table — The Meeting vs the ADR

| | The meeting (L361) | The ADR (L361) |
|---|---|---|
| The record (L361) | the memory (L361) | the document (L361) |
| The review (L361) | the re-litigation (L361) | the context (L361) re-read (L361) |
| The reversal (L361) | the lost why (L361) | the supersede (L361) |
| The use (L361) | the demo (L361) | the enterprise (L380) |

The senior read: **the ADR is the enterprise's record** — the reviewable, the reversible (L361).

## 13. Code Example — The Record, Written

```markdown
# ADR-014: Choose the RAG over the fine-tuning for the support copilot

## Status
Accepted (L361)

## Context (L361)
- The support copilot (L350) needs the grounded answers (L337).
- The latency (L333): the TTFT (L145) under 2s (L151).
- The data (L313): the help center (L265), updated daily (L335).
- The options (L361):
  1. The RAG (L349) — the retrieval (L189) over the live docs.
  2. The fine-tuning (L365) — the model (L148) trained on the docs.

## Decision (L361)
- We chose the RAG (L349) — the live docs (L335) ground the answers
  (L337) without the retraining (L365) on every update (L361).

## Consequences (L361)
- Positive: the grounded answers (L337) with the citations (L192);
  the docs (L265) updated without the retraining (L365).
- Negative: the retrieval's (L189) latency (L333) and the cost (L368);
  the eval (L341) required for the retrieval (L338).
- The trade-off (L367): the RAG's (L349) freshness (L335) vs the
  fine-tuning's (L365) latency (L333).

## Supersedes / Superseded by (L361)
- Superseded by: none (review when the scale (L358) grows) (L361).
```

```text
What the reader must SEE — the record, written:

  ADR-014 + Status         → the identity (L361)
  Context: the problem, the constraints, the options (L361)
  Decision: the RAG (L349)  → the choice (L361)
  Consequences: the + and the - → the honesty (L361)
  Superseded by: none       → the review trigger (L361)

  The context, the choice, the costs — reviewable and reversible (L361).
```

```narrate
4-5: The identity — the number and the status (L361).
7-14: The context — the problem, the constraints, and the options (L361).
16-18: The decision — the RAG chosen with the rationale (L349, L361).
20-24: The consequences — the positives and the negatives (L361).
26-27: The review — the supersede trigger (L361).
```

> [!TIP]
> The pair that defines the ADR: **the context's options** (the review, L361) and **the stated consequences** (the honesty, L361). **Record every decision, write the context, state the costs, review on the change, supersede on the reversal — the decision's record (L361).**

## 14. Performance Notes

- **The ADR is the review's speed (L361).** The context (L361) — the decision (L361) revisited (L361) fast (L361).
- **The record is the onboarding's (L361).** The history (L361) — the new architect (L361) reads the why (L361).
- **The consequences are the cost's (L367).** The stated (L361) — the surprise (L361) avoided (L361).
- **The maintenance is the record's (L361).** The ADRs (L361) — the review (L361) on the change (L361).

## 15. Debugging Scenarios

| Symptom | First check (L361) | The lever |
|---|---|---|
| The why is lost | The ADR (L361) | The context (L361) |
| The decision is stale | The review (L361) | The context (L361) re-read (L361) |
| The reversal is hard | The supersede (L361) | The new ADR (L361) |
| The costs surprise | The consequences (L361) | The stated (L361) |
| The team re-litigates | The record (L361) | The ADR (L361) as the source (L361) |

## 16. Quick Revision Notes

- The ADR = **the decision's record** (L361): the parts, the use.
- The ADR: **the numbered, the dated, the status (L361)**.
- The context: **the why — the problem, the constraints, the options (L361)**.
- The decision: **the choice with the rationale (L361)**.
- The consequences: **the costs (L367) and the trade-offs (L361)**.

## 17. Cheat Sheet

```text
ARCHITECTURE DECISION RECORDS = the reviewable, the reversible

THE ADR (L361)
  the numbered (L361) · the titled (L361) · the dated (L361)
  the status (L361): the proposed, the accepted, the superseded

THE CONTEXT (L361)
  the why (L361): the problem (L361), the constraints (L361)
  the options (L361) — the considered alternatives (L361)

THE DECISION (L361)
  the choice (L361) — with the rationale (L361)

THE CONSEQUENCES (L361)
  the costs (L367): the latency (L333), the quality (L341),
  the maintenance (L361)
  the positive (L361) and the negative (L361)

THE USE (L361)
  the review (L361) — the context (L361) re-read (L361)
  the reversal (L361) — the supersede (L361) by the new ADR (L361)

INTERVIEW, 4 MOVES
  1 ADR        "the numbered, dated record (L361)"
  2 context    "the why and the options (L361)"
  3 decision   "the choice with the rationale (L361)"
  4 consequences "the costs and the trade-offs (L361)"
```

## 18. Key Takeaways

> [!RECAP]
> - The architecture decision records are **the documents that make a choice reviewable and reversible** (L361): the ADR (L361), the parts (L361), and the use (L361)
> - **The ADR** (L361): the numbered (L361), the titled (L361), the dated (L361), and the status (L361)
> - **The context** (L361): the why (L361) — the problem (L361), the constraints (L361), and the options (L361)
> - **The decision** (L361): the choice (L361) — with the rationale (L361)
> - **The consequences** (L361): the costs (L367) — the latency (L333), the quality (L341), the maintenance (L361) — the positive and the negative (L361)
> - **The use** (L361): the review (L361) — the decision (L361) revisited (L361) when the context (L361) changes (L361); and the reversal (L361) — the ADR (L361) superseded (L361) by the new one (L361)
> - The AI shape (L361): the enterprise (L380) — the ADRs (L361): the model's choice (L148), the RAG (L349) vs the fine-tuning (L365), the cloud (L366) — the decisions (L361), reviewable and reversible (L361)

## Check your understanding

Answer these without looking back.

1. What's the ADR (L361)?
2. Why record the decision (L361)?
3. What's in the context (L361)?
4. How does the AI differ (L361)?
5. What's the supersede (L361)?
6. What are the consequences (L361)?
7. What's the status (L361)?
8. What is the reviewable and the reversible (L361)?

## A Closing Note — The Logbook, Kept

You now hold the record: **the context, the decision, and the consequences — with every turn logged and every turn reversible.** The ship's logbook is kept — and the crew reads it (L361).

Next: the frameworks, the databases, and the shortlist you can defend — Technology Selection (L362).
