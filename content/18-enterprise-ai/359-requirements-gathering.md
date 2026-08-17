# Lesson 359 — Requirements Gathering for AI

**Interview importance:** ⭐⭐⭐⭐⭐ — "turning 'we want AI' into functional and non-functional requirements" — the answer is *the requirements*: the functional, the non-functional, and the AI's (L359).**

This is the first lesson of the Enterprise module — and the start of the enterprise loop (L380). L358 designed the system; this lesson is **what it must do**: the requirements gathering for AI — turning "we want AI" into the functional and the non-functional requirements (L359): the functional (the features, L359), the non-functional (the latency, the scale, the compliance, L359), and the AI's (the model, the data, the evals, L359). This lesson is the enterprise loop's start (L359).

The distinction this lesson is built on: a **junior** takes the wish. A **solutions architect** extracts the requirements (L359): the functional (L359), the non-functional (L359), and the AI's (L359) — because the wrong requirements (L359) are the wrong architecture (L358).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the functional: the features (L359)
- Explain the non-functional: the latency, the scale, the compliance (L359)
- Explain the AI's: the model, the data, the evals (L359)
- Explain the questions: the elicitation (L359)
- Explain the AI shape: the "we want AI" → the requirements (L359)

## 1. One-Line Definition

**The requirements gathering for AI turns "we want AI" into the functional and the non-functional requirements (L359) — the functional (the features: what the system does — the chat L348, the RAG L349, the agents L200, L359), the non-functional (the qualities: the latency L333, the scale L358, the compliance L371, the cost L368, L359), and the AI's (the model L148, the data L313, the evals L341, L359) — the enterprise loop's (L380) start (L359).**

The one-sentence interview answer: *"The requirements gathering turns the wish into the requirements (L359). The functional (L359): the features (L359) — what the system does (L359): the chat (L348), the RAG (L349), the agents (L200) — the user stories (L359). The non-functional (L359): the qualities (L359) — the latency (L333): the TTFT (L145) under 2s (L359); the scale (L358): the requests per day (L359); the compliance (L371): the data's residency (L261) and the privacy (L313); and the cost (L368): the budget (L368). The AI's (L359): the model (L148) — the task's (L340) fit (L359); the data (L313) — the sources (L359) and the quality (L359); and the evals (L341) — how the success (L341) is measured (L359). The elicitation (L359): the questions (L359) — "what does the user do?", "what's the latency?", "what's the data?", "what's the quality?" (L359). The AI shape (L173): the "we want AI" (L359) → the requirements (L359) — the functional (L359), the non-functional (L359), and the AI's (L359) — the ADR's (L361) input (L359)."*

## 2. Mental Model

Think of the requirements as **the architect's brief for the client's dream house.** The client (the business, L359) says "we want a house" (L359). The architect (the solutions architect, L359) extracts the brief (the requirements, L359): the rooms (the functional, L359) — the kitchen (the chat, L348), the library (the RAG, L349), the workshop (the agents, L200); the qualities (the non-functional, L359) — the light (the latency, L333), the size (the scale, L358), the codes (the compliance, L371); and the materials (the AI's, L359) — the contractor (the model, L148), the lumber (the data, L313), the inspections (the evals, L341). The client signs the brief (L359) before the blueprint (L361). The house works because the brief is complete, and the client signed it (L359).

```text
   the brief (the requirements, L359)
   ┌────────────────────────────────────────────────────────┐
   │ the rooms (the functional, L359) — the features (L359) │
   │ the qualities (the non-functional, L359) — the         │
   │ latency (L333), the scale (L358), the compliance (L371)│
   │ the materials (the AI's, L359) — the model (L148), the │
   │ data (L313), the evals (L341)                          │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the brief**: the rooms, the qualities, and the materials (L359).

## 3. Visual Flow — The Wish to the Requirements

```text
   "we want AI" (L359)
        │  the elicitation (L359)
        ▼
   ┌────────────────────── THE FUNCTIONAL (L359) ───────────────────────┐
   │  the features (L359): the chat (L348), the RAG (L349), the        │
   │  agents (L200) — the user stories (L359)                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE NON-FUNCTIONAL (L359) ───────────────────┐
   │  the latency (L333): the TTFT (L145) · the scale (L358)           │
   │  the compliance (L371) · the cost (L368)                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE AI'S (L359) ─────────────────────────────┐
   │  the model (L148) · the data (L313) · the evals (L341)            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ADR (L361) ──────────────────────────────┐
   │  the requirements (L359) → the architecture decision (L361)       │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the loop's start: **wish → requirements → ADR** (L359).

## 4. How It Works — The Brief, Part by Part

- **The functional (L359).** The features (L359): the chat (L348), the RAG (L349), the agents (L200) — the user stories (L359).
- **The non-functional (L359).** The qualities (L359): the latency (L333), the scale (L358), the compliance (L371), the cost (L368).
- **The AI's (L359).** The model (L148), the data (L313), the evals (L341).
- **The elicitation (L359).** The questions (L359): "what does the user do?", "what's the latency?", "what's the data?", "what's the quality?" (L359).

> [!NOTE]
> **The AI's requirements are the difference (L359).** The senior answer adds the AI's (L359): the web's requirements (L102) — the functional and the non-functional (L102); the AI's (L359) — the model (L148): which task and which fit (L359); the data (L313): the sources (L359) and the quality (L359); and the evals (L341): the success metric (L341) — the groundedness (L337), the task success (L340) — defined up front (L359). The eval (L341) is a requirement (L359), not an afterthought (L359).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The requirements (L359) — the case study's (L379) start (L359).
- **A greenfield AI product (L173).** The features (L359) — the chat (L348), the RAG (L349).
- **A regulated enterprise (L371).** The compliance (L371) — the data's residency (L261) — the non-functional (L359).
- **A model rollout (L365).** The evals (L341) — the success metric (L359) — the AI's (L359).
- **Anything enterprise (L380).** The brief (L359) — the loop's (L380) start (L359).

The through-line: **the brief is the loop's start** — the functional, the non-functional, and the AI's (L359).

## 6. Interview Explanation

Say it in four moves:

1. **The functional.** "The features — the chat, the RAG, the agents (L359)."
2. **The non-functional.** "The latency, the scale, the compliance (L359)."
3. **The AI's.** "The model, the data, the evals (L359)."
4. **The elicitation.** "The questions — the wish → the brief (L359)."

## 7. Senior-Level Insights

- **The requirements are the design's half (L359).** The brief (L359) — the wrong brief (L359) is the wrong architecture (L358) — the elicitation (L359) first (L359).
- **The latency is the non-functional's first (L333).** The TTFT (L145) — the L151 budget (L151) — the design's (L358) constraint (L359).
- **The eval is the requirement (L341).** The success metric (L341) — the groundedness (L337), the task success (L340) — defined up front (L359) — the L346 suite (L346) gating (L359).
- **The compliance is the boundary (L371).** The data's residency (L261) and the privacy (L313) — the L371 frameworks (L371) — the non-functional (L359).
- **The cost is the budget's (L368).** The tokens (L332) and the infra (L368) — the L368 estimate (L368) — the business (L360) signs (L359).

## 8. Common Mistakes

- **The wish accepted (L359).** "We want AI" (L359) without the brief (L359) — the requirements (L359) are the design's (L358) input (L359).
- **The functional-only (L359).** The features (L359) without the latency (L333) and the scale (L358) — the architecture (L358) unconstrained (L359).
- **The eval-less (L341).** The success (L341) undefined (L359) — the quality (L341) un-measurable (L359).
- **The compliance after (L371).** The residency (L261) bolted on (L371) — the requirement (L359) up front (L359).
- **The un-signed brief (L359).** The requirements (L359) un-agreed (L360) — the scope (L359) creeps (L359).

## 9. Best Practices

- **Elicit the three** (L359) — the functional, the non-functional, the AI's (L359).
- **Define the evals** (L341) — the success metric (L359) up front (L359).
- **Bound the latency** (L333) — the TTFT (L145) and the budget (L151).
- **Ask the compliance** (L371) — the residency (L261), the privacy (L313).
- **Sign the brief** (L360) — the stakeholders (L360) agree (L359).

## 10. Interview Questions

**Q: Walk me through the requirements gathering for AI.**
> A: The wish → the requirements (L359). The functional — the features: the chat, the RAG, the agents (L359). The non-functional — the latency, the scale, the compliance (L359). And the AI's — the model, the data, the evals (L359).

**Q: What are the AI-specific requirements?**
> A: Three (L359): the model (L148) — which task and which fit (L359); the data (L313) — the sources (L359) and the quality (L359); and the evals (L341) — the success metric (L341): the groundedness (L337), the task success (L340) — defined up front (L359). The eval (L341) is a requirement (L359), not an afterthought (L359).

**Q: How do you turn "we want AI" into the requirements?**
> A: The questions (L359): "what does the user do?" — the functional (L359); "what's the latency and the scale?" — the non-functional (L333, L358); "what's the data and the compliance?" — the AI's and the boundary (L313, L371); and "what's the success metric?" — the eval (L341). The answers (L359) are the brief (L359).

**Q: Why do the requirements matter?**
> A: The design's input (L359): the wrong requirements (L359) are the wrong architecture (L358) — the rework (L359) and the cost (L368). The brief (L359) — signed by the stakeholders (L360) — is the ADR's (L361) input (L359).

## 11. Follow-Up Questions

- What's the functional (L359)?
- What's the non-functional (L359)?
- What are the AI's requirements (L359)?
- How do you elicit (L359)?
- What's the eval's role (L341)?

## 12. Comparison Table — The Web vs the AI Requirements

| | The web (L102) | The AI (L359) |
|---|---|---|
| The functional (L359) | the CRUD (L102) | the chat (L348), the RAG (L349) |
| The non-functional (L359) | the latency, the scale (L102) | + the TTFT (L145), the cost (L368) |
| The AI's (L359) | — | the model (L148), the data (L313), the evals (L341) |

The senior read: **the AI's column is the difference** — the model, the data, the evals (L359).

## 13. Code Example — The Brief, Written

```js
// The requirements (L359) — the brief for the ADR (L361).
// 1 · THE FUNCTIONAL (L359) — the features (L359).
const functional = [
  { id: 'F1', story: 'As a user, I can chat with the assistant' },      // L348
  { id: 'F2', story: 'As a user, I can ask about the docs' },           // L349
  { id: 'F3', story: 'As an admin, I can review the refunds' },         // L350
];

// 2 · THE NON-FUNCTIONAL (L359) — the qualities (L359).
const nonFunctional = {
  latency: { ttft: '< 2s', p95: '< 4s' },         // L333, L145
  scale:   { requestsPerDay: 1_000_000 },          // L358
  compliance: { residency: 'eu', privacy: 'gdpr' },// L371, L261
  cost:    { monthlyBudget: 50_000 },              // L368
};

// 3 · THE AI'S (L359) — the model, the data, the evals (L359).
const aiRequirements = {
  model: { task: 'chat + grounded answers', candidates: ['claude', 'gpt'] },  // L148
  data:  { sources: ['help-center'], quality: 'reviewed' },   // L313, L349
  evals: { groundedness: '>= 0.9', taskSuccess: '>= 0.85' },  // L337, L341
};

// 4 · THE ADR (L361) — the brief → the decision (L361).
```

```text
What the reader must SEE — the brief, written:

  F1-F3: the user stories     → the functional (L359)
  ttft < 2s, 1M/day, gdpr    → the non-functional (L333, L358, L371)
  the model candidates        → the AI's (L148, L359)
  groundedness >= 0.9         → the evals (L341, L337)
  → the ADR (L361)            → the loop's next (L361)

  The functional, the non-functional, and the AI's (L359).
```

```narrate
4-7: The functional — the user stories: the chat, the RAG, the refunds (L359).
9-14: The non-functional — the latency, the scale, the compliance, and the cost (L359).
16-19: The AI's — the model candidates, the data sources, and the eval thresholds (L359, L341).
21: The ADR — the brief feeds the decision (L361).
```

> [!TIP]
> The pair that defines the brief: **the eval thresholds** (the success metric, L341) and **the compliance boundary** (the constraint, L371). **Elicit the three, define the evals, bound the latency, sign the brief — the loop's start (L359).**

## 14. Performance Notes

- **The brief is the design's speed (L359).** The right requirements (L359) — the rework (L359) avoided (L359).
- **The latency is the design's constraint (L333).** The TTFT (L145) — the L151 budget (L151) — the architecture (L358) follows (L359).
- **The scale is the capacity's (L358).** The requests (L358) — the L369 capacity (L369) sized (L359).
- **The eval is the quality's gate (L341).** The thresholds (L341) — the L346 suite (L346) gating (L359).

## 15. Debugging Scenarios

| Symptom | First check (L359) | The lever |
|---|---|---|
| The architecture misses the users | The functional (L359) | The stories (L359) |
| The latency blows the budget | The non-functional (L333) | The TTFT (L145) |
| The quality is undefined | The AI's (L341) | The eval thresholds (L359) |
| The compliance fails | The boundary (L371) | The residency (L261) |
| The scope creeps | The brief (L359) | The sign-off (L360) |

## 16. Quick Revision Notes

- The requirements gathering = **the loop's start** (L359): the functional, the non-functional, the AI's.
- The functional: **the features (L359) — the chat (L348), the RAG (L349), the agents (L200)**.
- The non-functional: **the latency (L333), the scale (L358), the compliance (L371), the cost (L368)**.
- The AI's: **the model (L148), the data (L313), the evals (L341)**.
- The elicitation: **the questions (L359) — the wish → the brief (L359)**.

## 17. Cheat Sheet

```text
REQUIREMENTS GATHERING FOR AI = the wish → the brief

THE FUNCTIONAL (L359)
  the features (L359): the chat (L348), the RAG (L349),
  the agents (L200) — the user stories (L359)

THE NON-FUNCTIONAL (L359)
  the latency (L333) — the TTFT (L145) under the budget (L151)
  the scale (L358) — the requests per day (L359)
  the compliance (L371) — the residency (L261), the privacy (L313)
  the cost (L368) — the budget (L368)

THE AI'S (L359)
  the model (L148) — the task's (L340) fit (L359)
  the data (L313) — the sources (L359), the quality (L359)
  the evals (L341) — the success metric (L359):
  the groundedness (L337), the task success (L340)

THE ELICITATION (L359)
  "what does the user do?" · "what's the latency?"
  "what's the data?" · "what's the quality?"
  → the ADR (L361)

INTERVIEW, 4 MOVES
  1 functional "the features (L359)"
  2 non-functional "the latency, the scale, the compliance (L359)"
  3 the AI's  "the model, the data, the evals (L359)"
  4 elicitation "the questions (L359)"
```

## 18. Key Takeaways

> [!RECAP]
> - The requirements gathering for AI **turns "we want AI" into the functional and the non-functional requirements** (L359): the functional (L359), the non-functional (L359), the AI's (L359), and the elicitation (L359)
> - **The functional** (L359): the features (L359) — the chat (L348), the RAG (L349), the agents (L200) — the user stories (L359)
> - **The non-functional** (L359): the qualities (L359) — the latency (L333), the scale (L358), the compliance (L371), and the cost (L368)
> - **The AI's** (L359): the model (L148), the data (L313), and the evals (L341) — the success metric (L341) defined up front (L359)
> - **The elicitation** (L359): the questions (L359) — "what does the user do?", "what's the latency?", "what's the data?", "what's the quality?" (L359)
> - The AI shape (L359): the "we want AI" (L359) → the requirements (L359) — the functional (L359), the non-functional (L359), and the AI's (L359) — the ADR's (L361) input (L359), the enterprise loop's (L380) start (L359)

## Check your understanding

Answer these without looking back.

1. What's the functional (L359)?
2. What's the non-functional (L359)?
3. What are the AI's requirements (L359)?
4. How do you elicit (L359)?
5. What's the eval's role (L341)?
6. What's the compliance (L371)?
7. What's the sign-off (L360)?
8. What is the loop's start (L359)?

## A Closing Note — The Brief, Signed

You now hold the brief: **the functional, the non-functional, and the AI's — with the evals defined and the compliance bounded.** The client's dream is a signed brief — and the blueprint comes next (L359).

Next: the executives, the engineers, and the risk of AI theatre — Stakeholder Communication (L360).
