# Lesson 379 — Enterprise AI Case Study

**Interview importance:** ⭐⭐⭐⭐⭐ — "a full requirement-to-architecture walkthrough in one lesson" — the answer is *the case study*: the requirements, the ADRs, and the architecture (L379).**

L359–378 built the enterprise loop; this lesson is **its run**: the enterprise AI case study — a full requirement-to-architecture walkthrough in one lesson (L379): the requirements (L359), the decisions (L361), and the architecture (L379). The AI shape (L173): the enterprise (L380) — the case study (L379) as the interview's (L379) rehearsal (L379). This lesson is the loop's run (L379).

The distinction this lesson is built on: a **junior** knows the pieces. A **solutions architect** runs the loop (L379): the requirements (L359), the ADRs (L361), and the architecture (L379) — the case study (L379) as the interview's (L379) proof (L379).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the requirements: the brief (L359)
- Explain the decisions: the ADRs (L361)
- Explain the architecture: the design (L379)
- Explain the walkthrough: the loop's run (L379)
- Explain the AI shape: the case study's arc (L379)

## 1. One-Line Definition

**The enterprise AI case study is the full requirement-to-architecture walkthrough in one lesson (L379) — the requirements (the brief L359: the users L162, the features L359, the non-functional L359, L379), the decisions (the ADRs L361: the model L365, the RAG L349, the cloud L366, L379), and the architecture (the design L379: the front door L267, the engine room L270, the data L268, the security L325, the observability L346, L379) — the loop's (L380) run (L379).**

The one-sentence interview answer: *"The case study is the loop, run end to end (L379). The requirements (L359): the brief (L359) — the users (L162), the features (L359): the support copilot (L350) with the RAG (L349); and the non-functional (L359): the TTFT (L145) under 2s, the 1M requests (L358), the GDPR (L371). The decisions (L361): the ADRs (L361) — the model (L365): the tiered (L365) with the routing (L155); the RAG (L349): the build (L363) with the pgvector (L183); and the cloud (L366): the AWS (L261) with the Bedrock (L278). The architecture (L379): the design (L379) — the front door (L267): the gateway (L267) with the auth (L319) and the limits (L318); the engine room (L270): the queue (L270) and the workers (L266); the data (L268): the RDS (L268) and the pgvector (L183); the security (L325): the L325 stack (L325) — the guardrails (L281), the isolation (L320), the audit (L322); and the observability (L346): the OTel (L346) with the evals (L341). The walkthrough (L379): the loop's (L380) run (L379) — the brief (L359) to the ADRs (L361) to the architecture (L379) — the case study (L379), the interview's (L379) proof (L379)."*

## 2. Mental Model

Think of the case study as **the architect's portfolio project.** The portfolio piece (the case study, L379) documents the whole project (L379): the client's brief (the requirements, L359) — the house (L173) they want (L359); the design decisions (the ADRs, L361) — the materials (L361) and the layout (L361); and the blueprints (the architecture, L379) — the floors (L379) and the systems (L379). The architect (L379) walks the reviewer (the interviewer, L379) through (L379): the brief (L359), the choices (L361), and the design (L379) — the why (L367) at each (L379). The portfolio works because the arc is complete: the brief, the decisions, and the design (L379).

```text
   the portfolio piece (the case study, L379)
   ┌────────────────────────────────────────────────────────┐
   │ the brief (the requirements, L359) — the house (L173)  │
   │ the decisions (the ADRs, L361) — the materials (L361)  │
   │ the blueprints (the architecture, L379) — the systems  │
   │ (L379)                                                 │
   │ the walkthrough (L379) — the why at each (L367)        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the portfolio piece**: the brief, the decisions, and the blueprints (L379).

## 3. Visual Flow — The Arc

```text
   1 · THE REQUIREMENTS (L359)
      the users (L162) · the features (L359) · the non-functional (L359)

   2 · THE DECISIONS (L361)
      the model (L365) · the RAG (L349) · the cloud (L366)
      — the ADRs (L361) with the trade-offs (L367)

   3 · THE ARCHITECTURE (L379)
      the front door (L267) · the engine room (L270) · the data (L268)
      the security (L325) · the observability (L346)

   4 · THE DEFENSE (L379)
      the walkthrough (L379) — the why at each (L367)
```

The flow is the arc: **requirements → decisions → architecture → defense** (L379).

## 4. How It Works — The Arc, Part by Part

- **The requirements (L359).** The brief (L359): the users (L162), the features (L359), the non-functional (L359).
- **The decisions (L361).** The ADRs (L361): the model (L365), the RAG (L349), the cloud (L366).
- **The architecture (L379).** The design (L379): the front door (L267), the engine room (L270), the data (L268), the security (L325), the observability (L346).
- **The walkthrough (L379).** The loop's (L380) run (L379) — the why (L367) at each (L379).

> [!NOTE]
> **The case study is the interview's rehearsal (L379).** The senior answer treats the case study (L379) as the rehearsal (L379): the requirements (L359) — the brief (L359) elicited (L359); the decisions (L361) — the ADRs (L361) with the trade-offs (L367) named (L367); and the architecture (L379) — the parts (L379) with the boundaries (L379). The walkthrough (L379) — the why (L367) at each (L379) — is the interview's (L379) proof (L379): the loop (L380) run (L379), end to end (L379).

## 5. Real Project Usage

- **An interview (L379).** The case study (L379) — the loop (L380) run (L379).
- **An enterprise engagement (L379).** The requirements (L359), the ADRs (L361), the architecture (L379).
- **A portfolio (L379).** The case study (L379) — the walkthrough (L379).
- **A design review (L379).** The architecture (L379) — the boundaries (L379) and the trade-offs (L367).
- **Anything enterprise (L380).** The arc (L379) — the brief, the decisions, the design (L379).

The through-line: **the arc is the loop's** — the requirements, the decisions, and the architecture (L379).

## 6. Interview Explanation

Say it in four moves:

1. **The requirements.** "The brief — the users, the features, the non-functional (L359)."
2. **The decisions.** "The ADRs — the model (L365), the RAG (L349), the cloud (L366)."
3. **The architecture.** "The front door (L267), the engine room (L270), the data (L268)."
4. **The defense.** "The why at each (L367)."

## 7. Senior-Level Insights

- **The arc is the loop's (L380).** The brief (L359) → the ADRs (L361) → the architecture (L379) — the L380 loop (L380), run (L379).
- **The trade-off is the defense's (L367).** The named (L367) — the RAG (L349) vs the fine-tuning (L365) — the why (L367) at each (L379).
- **The boundaries are the architecture's (L379).** The front door (L267), the engine room (L270) — the L260 floor plan (L260), enterprise-shaped (L379).
- **The security is the stack's (L325).** The guardrails (L281), the isolation (L320), the audit (L322) — the L325 stack (L325), in the case (L379).
- **The observability is the evals' (L346).** The OTel (L346) — the evals (L341) in the CI (L296) — the L346 standard (L346), in the case (L379).

## 8. Common Mistakes

- **The pieces without the arc (L379).** The Redis (L243) and the SQS (L270) named (L379) without the brief (L359) — the loop (L380) un-run (L379).
- **The decision-less (L361).** The architecture (L379) without the ADRs (L361) — the why (L367) missing (L379).
- **The trade-off-less (L367).** The choice (L367) un-named (L379) — the surprise (L367) (L379).
- **The security-less (L325).** The design (L379) without the guardrails (L281) and the isolation (L320) — the L325 stack (L325) (L379).
- **The eval-less (L341).** The quality (L341) un-defined (L359) — the success (L341) un-measured (L379).

## 9. Best Practices

- **Run the arc** (L379) — the brief (L359), the ADRs (L361), the architecture (L379).
- **Name the trade-offs** (L367) — at each decision (L361).
- **Bound the parts** (L379) — the front door (L267), the engine room (L270).
- **Include the security** (L325) — the stack (L325) in the design (L379).
- **Define the evals** (L341) — the success (L341) in the brief (L359).

## 10. Interview Questions

**Q: Walk me through the case study.**
> A: The loop, run end to end (L379). The requirements — the brief: the users, the features, the non-functional (L359). The decisions — the ADRs: the model (L365), the RAG (L349), the cloud (L366). The architecture — the front door (L267), the engine room (L270), the data (L268). And the defense — the why at each (L367).

**Q: What's the architecture?**
> A: The L260 floor plan (L260), enterprise-shaped (L379): the front door (L267) — the gateway (L267) with the auth (L319) and the limits (L318); the engine room (L270) — the queue (L270) and the workers (L266); the data (L268) — the RDS (L268) and the pgvector (L183); the security (L325) — the guardrails (L281), the isolation (L320), the audit (L322); and the observability (L346) — the OTel (L346) with the evals (L341).

**Q: How do you defend the decisions?**
> A: The ADRs (L361): the trade-off (L367) named (L367) — "the RAG (L349) over the fine-tuning (L365) for the freshness (L335) at the latency's (L333) cost" (L367); the cloud (L366) — the AWS (L261) for the Bedrock (L278); and the model (L365) — the tiered (L365) for the 80/20 (L365). The why (L367) at each (L379).

**Q: What's the arc?**
> A: The loop's (L380) run (L379): the requirements (L359) — the brief (L359) elicited (L359); the decisions (L361) — the ADRs (L361); and the architecture (L379) — the design (L379) with the boundaries (L379). The arc (L379) — the brief to the blueprints — is the interview's (L379) proof (L379).

## 11. Follow-Up Questions

- What's the arc (L379)?
- What's the architecture (L379)?
- How do you defend the decisions (L361)?
- What's the security (L325)?
- What's the observability (L346)?

## 12. Comparison Table — The Arc's Stages

| Stage (L379) | The deliverable (L379) | The lesson (L379) |
|---|---|---|
| The requirements (L359) | the brief (L359) | the L359 elicitation (L359) |
| The decisions (L361) | the ADRs (L361) | the L361 records (L361) |
| The architecture (L379) | the design (L379) | the L358 design (L358) |
| The defense (L379) | the walkthrough (L379) | the L367 trade-offs (L367) |

The senior read: **the stages compose the loop's run** (L379).

## 13. Code Example — The Arc, Run

```js
// The case study (L379) — the arc, run (L379).
// 1 · THE REQUIREMENTS (L359) — the brief (L379).
const brief = {
  users: 'support agents + customers',     // L162
  features: ['support-copilot', 'rag'],    // L350, L349
  nonFunctional: {
    ttft: '< 2s',                          // L145
    scale: '1M requests/day',              // L358
    compliance: 'gdpr',                    // L371
  },
  evals: { groundedness: '>= 0.9' },       // L341, L337
};

// 2 · THE DECISIONS (L361) — the ADRs (L379).
const adrs = [
  { id: 'ADR-001', choice: 'tiered models',        why: 'the 80/20 (L365)' },
  { id: 'ADR-002', choice: 'RAG over fine-tuning', why: 'the freshness (L335)' },
  { id: 'ADR-003', choice: 'AWS + Bedrock',        why: 'the L278 access (L278)' },
];

// 3 · THE ARCHITECTURE (L379) — the floor plan (L260).
const architecture = {
  frontDoor:  'api-gateway',               // L267
  engineRoom: 'sqs + workers',             // L270
  data:       'rds + pgvector',            // L268, L183
  security:   'guardrails + isolation + audit',  // L325, L320
  observability: 'otel + evals',           // L346, L341
};

// 4 · THE DEFENSE (L379) — the why at each (L367).
//   "the RAG (L349) for the freshness (L335) at the latency (L333)"
```

```text
What the reader must SEE — the arc, run:

  the brief with the evals    → the requirements (L359, L341)
  the three ADRs with the why → the decisions (L361)
  the floor plan              → the architecture (L379)
  the why at each             → the defense (L367)

  The requirements, the decisions, the architecture (L379).
```

```narrate
4-13: The brief — the users, the features, the non-functional, and the evals (L359, L341).
15-19: The ADRs — the model, the RAG, and the cloud decisions (L361).
21-27: The architecture — the floor plan with the security and the observability (L379).
29-30: The defense — the why at each decision (L367).
```

> [!TIP]
> The pair that defines the case study: **the brief with the eval bar** (the requirements, L359) and **the ADRs with the why** (the decisions, L361). **Run the arc, name the trade-offs, bound the parts, include the evals — the loop's run (L379).**

## 14. Performance Notes

- **The arc is the interview's speed (L379).** The structured run (L379) — the clear (L379) defense (L379).
- **The trade-off is the review's (L367).** The named (L367) — the debate (L367) shortened (L379).
- **The evals are the quality's (L341).** The bar (L341) — the success (L341) measured (L379).
- **The observability is the cost's (L346).** The OTel (L346) — the per-tenant (L334) attribution (L379).

## 15. Debugging Scenarios

| Symptom | First check (L379) | The lever |
|---|---|---|
| The defense is rambling | The arc (L379) | The staged run (L379) |
| The why is missing | The ADRs (L361) | The trade-offs (L367) |
| The security is absent | The stack (L325) | The guardrails (L281), the isolation (L320) |
| The success is undefined | The evals (L341) | The bar (L359) |
| The design is unbounded | The architecture (L379) | The floor plan (L260) |

## 16. Quick Revision Notes

- The enterprise AI case study = **the loop's run** (L379): the requirements, the decisions, the architecture.
- The requirements: **the brief (L359) — the users, the features, the non-functional (L359)**.
- The decisions: **the ADRs (L361) — the model (L365), the RAG (L349), the cloud (L366)**.
- The architecture: **the front door (L267), the engine room (L270), the data (L268), the security (L325), the observability (L346)**.
- The walkthrough: **the why at each (L367)**.

## 17. Cheat Sheet

```text
ENTERPRISE AI CASE STUDY = the loop, run end to end

1 · THE REQUIREMENTS (L359)
  the brief (L359): the users (L162), the features (L359),
  the non-functional (L359): the TTFT (L145), the scale (L358),
  the compliance (L371)
  the evals (L341) — the bar (L359)

2 · THE DECISIONS (L361)
  the model (L365) — the tiered (L365), the routing (L155)
  the RAG (L349) — the build (L363), the pgvector (L183)
  the cloud (L366) — the AWS (L261), the Bedrock (L278)
  the ADRs (L361) with the trade-offs (L367)

3 · THE ARCHITECTURE (L379)
  the front door (L267) · the engine room (L270) · the data (L268)
  the security (L325) — the guardrails (L281), the isolation (L320),
  the audit (L322)
  the observability (L346) — the OTel (L346), the evals (L341)

4 · THE DEFENSE (L379)
  the why (L367) at each — the walkthrough (L379)

INTERVIEW, 4 MOVES
  1 requirements "the brief (L359)"
  2 decisions    "the ADRs (L361)"
  3 architecture "the floor plan (L379)"
  4 defense      "the why at each (L367)"
```

## 18. Key Takeaways

> [!RECAP]
> - The enterprise AI case study is **the full requirement-to-architecture walkthrough in one lesson** (L379): the requirements (L359), the decisions (L361), the architecture (L379), and the defense (L379)
> - **The requirements** (L359): the brief (L359) — the users (L162), the features (L359), the non-functional (L359), and the evals (L341)
> - **The decisions** (L361): the ADRs (L361) — the model (L365), the RAG (L349), the cloud (L366) — with the trade-offs (L367)
> - **The architecture** (L379): the floor plan (L379) — the front door (L267), the engine room (L270), the data (L268), the security (L325), the observability (L346)
> - **The defense** (L379): the walkthrough (L379) — the why (L367) at each (L379)
> - The principle (L379): the case study (L379) is the loop's (L380) run (L379) — the brief (L359) to the ADRs (L361) to the architecture (L379) — the interview's (L379) proof (L379)

## Check your understanding

Answer these without looking back.

1. What's the arc (L379)?
2. What's the architecture (L379)?
3. How do you defend the decisions (L361)?
4. What's the security (L325)?
5. What's the observability (L346)?
6. What's the brief (L359)?
7. What's the walkthrough (L379)?
8. What is the loop's run (L379)?

## A Closing Note — The Portfolio, Complete

You now hold the case study: **the requirements, the decisions, the architecture, and the defense — with the brief to the blueprints.** The portfolio piece is complete — and the walkthrough is rehearsed (L379).

Next: the capstone — the deliverables, the diagrams, the cost models, and the decision rule (L380).
