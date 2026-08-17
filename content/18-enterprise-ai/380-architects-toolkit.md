# Lesson 380 — The Architect's Toolkit (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of Enterprise AI: the deliverables — the ADRs, the diagrams, the cost models, and the decision rule (L380).**

This is the last lesson of the Enterprise AI module — and the synthesis it was built toward. L359–L379 gave you the parts: the requirements (L359), the stakeholders (L360), the ADRs (L361), the selection (L362–366), the trade-offs (L367), the cost (L368), the capacity (L369), the scalability (L370), the compliance (L371), the governance (L372–373), the DR (L374), the integrations (L375–376), the multi-cloud (L377), the platform (L378), and the case study (L379). This lesson **reassembles them into the architect's toolkit** — the deliverables (L380): the ADRs (L361), the diagrams (L380), the cost models (L368), and the decision rule (L380).

The distinction this lesson is built on: a **specialist** knows the technology. A **solutions architect** delivers the toolkit (L380) — the ADRs (L361), the diagrams (L380), the cost models (L368), and the decision rule (L380) — the deliverables (L380) the enterprise signs (L360).

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L359–L379 into the architect's toolkit
- Explain the ADRs: the decisions (L361)
- Explain the diagrams: the architecture (L380)
- Explain the cost models: the economics (L368)
- Explain the decision rule: the spine (L380)
- Defend the toolkit in an interview: the deliverables, the loop (L380)

## 1. One-Line Definition

**The architect's toolkit is the module's synthesis — the deliverables: the ADRs, the diagrams, the cost models, and the decision rule (L380) — the ADRs (the decisions L361: the context L361, the choice L361, the consequences L361, L380), the diagrams (the architecture L380: the floor plan L260, the data flow L380, the sequence L380, L380), the cost models (the economics L368: the tokens L368, the infra L368, the levers L368, L380), and the decision rule (the spine L380: the requirements L359 → the trade-offs L367 → the decision L361, L380) — the deliverables (L380) the enterprise (L380) signs (L360).**

The one-sentence interview answer: *"The architect's toolkit is the module in one bag (L380). The ADRs (L361): the decisions (L361) — the context (L361), the choice (L361), and the consequences (L361) — the model (L365), the RAG (L349), the cloud (L366) — the reviewable (L361) and the reversible (L361). The diagrams (L380): the architecture (L380) — the floor plan (L260): the front door (L267), the engine room (L270), the data (L268); the data flow (L380): the request's (L328) path (L330); and the sequence (L380): the L208 approvals (L208). The cost models (L368): the economics (L368) — the tokens (L368), the infra (L368), and the levers (L368) — the board's (L360) number (L368). The decision rule (L380): the spine (L380) — the requirements (L359) → the trade-offs (L367) → the decision (L361) — run on every prompt (L380). The AI shape (L173): the enterprise (L380) — the toolkit (L380): the ADRs (L361), the diagrams (L380), the cost models (L368), and the decision rule (L380) — the deliverables (L380) the architect (L380) signs (L380)."*

## 2. Mental Model

Think of the toolkit as **the master builder's bag.** The bag (the toolkit, L380) holds the tools (L380): the contracts (the ADRs, L361) — the signed (L361) decisions (L361); the blueprints (the diagrams, L380) — the floors (L380) and the flows (L380); the ledgers (the cost models, L368) — the materials (L368) and the labor (L368); and the rulebook (the decision rule, L380) — the steps (L380) for every job (L380). The master builder (L380) carries the bag (L380) to every site (L379): the contracts signed (L361), the blueprints drawn (L380), the ledgers costed (L368), and the rulebook applied (L380). The building works because the bag is complete — the deliverables (L380) the owner (L360) signs (L380).

```text
   the bag (the toolkit, L380)
   ┌────────────────────────────────────────────────────────┐
   │ the contracts (the ADRs, L361) · the blueprints (the   │
   │ diagrams, L380)                                        │
   │ the ledgers (the cost models, L368) · the rulebook     │
   │ (the decision rule, L380)                              │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the bag**: the contracts, the blueprints, the ledgers, and the rulebook (L380).

## 3. Visual Flow — The Toolkit in Use

```text
   the prompt (L380)
        │
        ▼
   ┌────────────────────── THE DECISION RULE (L380) ────────────────────┐
   │  1 · the requirements (L359) — the brief (L359)                   │
   │  2 · the options (L380) — the trade-offs (L367)                   │
   │  3 · the decision (L361) — the ADR (L361)                         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DELIVERABLES (L380) ─────────────────────┐
   │  the ADR (L361) · the diagram (L380) · the cost model (L368)      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SIGN-OFF (L360) ─────────────────────────┐
   │  the stakeholders (L360) — the deliverables (L380) signed (L360)  │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the toolkit: **rule → deliverables → sign-off** (L380).

## 4. How It Works — The Bag, Part by Part

- **The ADRs (L361).** The decisions (L361): the context (L361), the choice (L361), the consequences (L361).
- **The diagrams (L380).** The architecture (L380): the floor plan (L260), the data flow (L380), the sequence (L380).
- **The cost models (L368).** The economics (L368): the tokens (L368), the infra (L368), the levers (L368).
- **The decision rule (L380).** The spine (L380): the requirements (L359) → the trade-offs (L367) → the decision (L361).

> [!NOTE]
> **The decision rule is the toolkit's spine (L380).** The senior answer runs the rule (L380) on every prompt (L380): the requirements (L359) — the brief (L359) elicited (L359); the options (L380) — the trade-offs (L367) named (L367); and the decision (L361) — the ADR (L361) recorded (L361). The rule (L380) — the L347 protocol (L347), enterprise-shaped (L380) — produces the deliverables (L380): the ADR (L361), the diagram (L380), and the cost model (L368) — the bag (L380), complete (L380).

## 5. Real Project Usage

- **An interview (L380).** The toolkit (L380) — the deliverables (L380) rehearsed (L379).
- **An enterprise engagement (L379).** The ADRs (L361), the diagrams (L380), the cost models (L368).
- **A design review (L380).** The diagrams (L380) — the floor plan (L260) and the flows (L380).
- **A board presentation (L360).** The cost model (L368) — the board's (L360) number (L368).
- **Anything enterprise (L380).** The bag (L380) — the ADRs, the diagrams, the cost models, the rule (L380).

The through-line: **the bag is the architect's** — the deliverables (L380) the enterprise (L380) signs (L360).

## 6. Interview Explanation

Say it in four moves:

1. **The ADRs.** "The decisions — the context, the choice, the consequences (L361)."
2. **The diagrams.** "The floor plan (L260), the data flow (L380), the sequence (L380)."
3. **The cost models.** "The tokens (L368), the infra (L368), the levers (L368)."
4. **The decision rule.** "The requirements (L359) → the trade-offs (L367) → the decision (L361)."

## 7. Senior-Level Insights

- **The ADRs are the memory (L361).** The decisions (L361) — the reviewable (L361) and the reversible (L361) — the why (L361) preserved (L380).
- **The diagrams are the communication (L380).** The floor plan (L260) — the stakeholders (L360) see (L380) — the data flow (L380) and the sequence (L380) (L380).
- **The cost models are the economics (L368).** The tokens (L368) and the levers (L368) — the board's (L360) number (L368).
- **The decision rule is the repeatability (L380).** The spine (L380) — the L347 protocol (L347) — run on every prompt (L380).
- **The bag is the senior's (L380).** The complete toolkit (L380) — the deliverables (L380) — the M29 milestone (L380): the ADRs (L361), the diagrams (L380), the cost models (L368), and the decision rule (L380).

## 8. Common Mistakes

- **The tech-only (L380).** The Redis (L243) and the SQS (L270) (L380) — the deliverables (L380) missing (L380) — the bag (L380) is the ADRs (L361) and the costs (L368).
- **The decision-less (L361).** The architecture (L380) without the ADRs (L361) — the why (L367) lost (L380).
- **The diagram-less (L380).** The prose (L380) without the floor plan (L260) — the stakeholders (L360) can't see (L380).
- **The cost-less (L368).** The design (L380) without the model (L368) — the board (L360) rejects (L368).
- **The rule-less (L380).** The one-off (L380) decisions (L361) — the spine (L380) un-run (L380).

## 9. Best Practices

- **Record the ADRs** (L361) — every decision (L361).
- **Draw the diagrams** (L380) — the floor plan (L260), the flows (L380).
- **Build the cost models** (L368) — the tokens (L368), the infra (L368), the levers (L368).
- **Run the decision rule** (L380) — the spine (L380) on every prompt (L380).
- **Assemble the bag** (L380) — the deliverables (L380) for the sign-off (L360).

## 10. Interview Questions

**Q: Walk me through the architect's toolkit.**
> A: The module in one bag (L380). The ADRs — the decisions: the context, the choice, the consequences (L361). The diagrams — the floor plan (L260), the data flow (L380), the sequence (L380). The cost models — the tokens, the infra, the levers (L368). And the decision rule — the requirements → the trade-offs → the decision (L380).

**Q: What's the decision rule?**
> A: The spine (L380): the requirements (L359) — the brief (L359) elicited (L359); the options (L380) — the trade-offs (L367) named (L367); and the decision (L361) — the ADR (L361) recorded (L361). The rule (L380) — the L347 protocol (L347), enterprise-shaped (L380) — run on every prompt (L380).

**Q: What are the deliverables?**
> A: Four (L380): the ADRs (L361) — the decisions (L361); the diagrams (L380) — the floor plan (L260) and the flows (L380); the cost models (L368) — the board's (L360) number (L368); and the decision rule (L380) — the spine (L380). The deliverables (L380) the enterprise (L380) signs (L360).

**Q: How do you defend the M29 milestone?**
> A: The bag (L380): the ADRs (L361) with the trade-offs (L367); the diagrams (L380) with the boundaries (L379); the cost models (L368) with the levers (L368); and the decision rule (L380) run (L380) — the L380 toolkit (L380), assembled (L380) and defended (L380).

## 11. Follow-Up Questions

- What's the decision rule (L380)?
- What are the deliverables (L380)?
- What's in the ADRs (L361)?
- What's in the cost models (L368)?
- What's the bag (L380)?

## 12. Comparison Table — The Specialist vs the Architect

| | The specialist (L380) | The architect (L380) |
|---|---|---|
| The knowledge (L380) | the technology (L380) | the deliverables (L380) |
| The ADRs (L361) | none (L380) | the decisions (L361) |
| The diagrams (L380) | none (L380) | the floor plan (L260) |
| The cost models (L368) | none (L380) | the board's number (L368) |
| The rule (L380) | the one-off (L380) | the spine (L380) |

The senior read: **the right column is the toolkit** — the deliverables (L380).

## 13. Code Example — The Bag, Assembled

```js
// The architect's toolkit (L380) — the deliverables (L380).
// 1 · THE DECISION RULE (L380) — the spine (L380).
async function decide(prompt) {
  const brief = await elicitRequirements(prompt);   // L359
  const options = await enumerateOptions(brief);    // the trade-offs (L367)
  const decision = await choose(options, brief);    // the choice (L361)
  return { brief, options, decision };
}

// 2 · THE ADR (L361) — the decision recorded (L380).
const adr = {
  id: 'ADR-001', status: 'accepted',
  context: brief,                       // the why (L361)
  decision: decision,                   // the choice (L361)
  consequences: tradeoffs,              // the costs (L367, L361)
};

// 3 · THE DIAGRAM (L380) — the floor plan (L260).
const floorPlan = {
  frontDoor: 'api-gateway',             // L267
  fastLayer: 'elasticache',             // L269
  engineRoom: 'sqs + workers',          // L270
  data: 'rds + pgvector',               // L268, L183
  model: 'bedrock',                     // L278
  security: 'guardrails + audit',       // L325, L322
  observability: 'otel + evals',        // L346, L341
};

// 4 · THE COST MODEL (L368) — the board's number (L380).
const costModel = estimate(brief, decision);   // L368

// 5 · THE SIGN-OFF (L360) — the deliverables (L380).
await stakeholderSignoff({ adr, floorPlan, costModel });   // L360
```

```text
What the reader must SEE — the bag, assembled:

  decide: brief → options → choice → the rule (L380)
  ADR-001 with the context    → the record (L361)
  the floor plan              → the diagram (L260, L380)
  estimate(brief, decision)   → the cost model (L368)
  stakeholderSignoff          → the sign-off (L360)

  The ADRs, the diagrams, the cost models, the rule (L380).
```

```narrate
4-9: The decision rule — the brief, the options, and the choice (L380, L359).
11-16: The ADR — the decision recorded with the context and the consequences (L361).
18-27: The diagram — the floor plan with the boundaries (L260, L380).
29-30: The cost model — the board's number (L368, L380).
32-33: The sign-off — the deliverables signed (L360).
```

> [!TIP]
> The pair that defines the toolkit: **the decision rule** (the repeatability, L380) and **the stakeholder sign-off** (the acceptance, L360). **Run the rule, record the ADRs, draw the diagrams, cost the models — the architect's bag (L380).**

## 14. Performance Notes

- **The rule is the speed (L380).** The spine (L380) — the decisions (L361) fast (L380).
- **The ADRs are the review's (L361).** The recorded (L361) — the revisit (L361) fast (L380).
- **The diagrams are the communication's (L380).** The floor plan (L260) — the stakeholders (L360) aligned (L380).
- **The cost models are the board's (L368).** The number (L368) — the sign-off (L360) fast (L380).

## 15. Debugging Scenarios

| Symptom | First check (L380) | The lever |
|---|---|---|
| The why is lost | The ADRs (L361) | The recorded decisions (L361) |
| The stakeholders can't see | The diagrams (L380) | The floor plan (L260) |
| The board rejects | The cost model (L368) | The line items (L368) |
| The decisions repeat | The rule (L380) | The spine (L380) |
| The sign-off stalls | The deliverables (L380) | The complete bag (L380) |

## 16. Quick Revision Notes

- The architect's toolkit = **the module's synthesis** (L380): the ADRs, the diagrams, the cost models, the decision rule.
- The ADRs: **the decisions (L361) — the context, the choice, the consequences (L361)**.
- The diagrams: **the floor plan (L260), the data flow (L380), the sequence (L380)**.
- The cost models: **the tokens (L368), the infra (L368), the levers (L368)**.
- The decision rule: **the requirements (L359) → the trade-offs (L367) → the decision (L361)**.

## 17. Cheat Sheet

```text
THE ARCHITECT'S TOOLKIT = the deliverables the enterprise signs

THE ADRS (L361)
  the decisions (L361): the context (L361), the choice (L361),
  the consequences (L361)
  the model (L365), the RAG (L349), the cloud (L366)
  the reviewable (L361) and the reversible (L361)

THE DIAGRAMS (L380)
  the floor plan (L260): the front door (L267), the engine room
  (L270), the data (L268)
  the data flow (L380): the request's (L328) path (L330)
  the sequence (L380): the L208 approvals (L208)

THE COST MODELS (L368)
  the tokens (L368) · the infra (L368) · the levers (L368)
  the board's (L360) number (L368)

THE DECISION RULE (L380)
  the spine (L380): the requirements (L359) → the trade-offs
  (L367) → the decision (L361)
  the L347 protocol (L347), enterprise-shaped (L380)

INTERVIEW, 4 MOVES
  1 ADRs       "the decisions (L361)"
  2 diagrams   "the floor plan and the flows (L380)"
  3 cost models "the board's number (L368)"
  4 decision rule "the spine (L380)"
```

## 18. Key Takeaways

> [!RECAP]
> - The architect's toolkit is **the module's synthesis — the deliverables: the ADRs, the diagrams, the cost models, and the decision rule** (L380): the ADRs (L361), the diagrams (L380), the cost models (L368), and the decision rule (L380)
> - **The ADRs** (L361): the decisions (L361) — the context (L361), the choice (L361), and the consequences (L361) — the reviewable (L361) and the reversible (L361)
> - **The diagrams** (L380): the architecture (L380) — the floor plan (L260), the data flow (L380), and the sequence (L380)
> - **The cost models** (L368): the economics (L368) — the tokens (L368), the infra (L368), and the levers (L368) — the board's (L360) number (L368)
> - **The decision rule** (L380): the spine (L380) — the requirements (L359) → the trade-offs (L367) → the decision (L361)
> - The milestone (L380): the deliverables (L380) the enterprise (L380) signs (L360) — the bag (L380), assembled (L380) and defended (L380) — assemble it, and M29 is claimed (L380)

## Check your understanding

Answer these without looking back.

1. What's the decision rule (L380)?
2. What are the deliverables (L380)?
3. What's in the ADRs (L361)?
4. What's in the cost models (L368)?
5. What's the bag (L380)?
6. What's the floor plan (L260)?
7. What's the sign-off (L360)?
8. What is the module's synthesis (L380)?

## A Closing Note — The Bag, Packed

That was the last lesson of the Enterprise AI module — and the one you'll *deliver with*. L359–L379 gave you the parts; this lesson gave you the bag: **the ADRs, the diagrams, the cost models, and the decision rule.** When you can run the rule (L380), record the decisions (L361), draw the floor plan (L260), and cost the model (L368) — you have claimed Milestone M29.

The next module turns the toolkit into the *proof*: Capstone Projects (L381–L386) — the RAG SaaS (L381), the agent with the tools and the human approval (L382), the automation platform (L383), the multi-tenant AI SaaS (L384), the enterprise assistant (L385), and the complete architecture case study (L386). You've packed the bag; now you'll build the projects that fill the portfolio.
