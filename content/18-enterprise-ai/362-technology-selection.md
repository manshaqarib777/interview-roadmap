# Lesson 362 — Technology Selection

**Interview importance:** ⭐⭐⭐⭐⭐ — "frameworks, databases, and the shortlist you can defend" — the answer is *the selection*: the criteria, the shortlist, and the decision (L362).**

L361 recorded the decisions; this lesson is **how they're made**: the technology selection — the frameworks, the databases, and the shortlist you can defend (L362): the criteria (the fit, the cost, the risk, L362), the shortlist (the candidates, L362), and the decision (the ADR L361, L362). The AI shape (L173): the enterprise (L380) — the framework (L362), the vector DB (L182), the cloud (L366) — selected (L362). This lesson is the selection's method (L362).

The distinction this lesson is built on: a **junior** picks the favorite. A **solutions architect** selects by the criteria (L362): the fit (L362), the cost (L362), the risk (L362) — the shortlist (L362) and the decision (L361) — because the selection (L362) must be defensible (L362).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the criteria: the fit, the cost, the risk (L362)
- Explain the shortlist: the candidates (L362)
- Explain the decision: the ADR (L361)
- Explain the AI's criteria: the model, the framework, the vector DB (L362)
- Explain the AI shape: the defensible selection (L362)

## 1. One-Line Definition

**The technology selection is the frameworks, the databases, and the shortlist you can defend (L362) — the criteria (the fit: the requirements L359 match; the cost: the licensing L368 and the infra L285; the risk: the maturity L362 and the lock-in L377, L362), the shortlist (the candidates: the 3-5 considered L362), and the decision (the ADR L361: the choice with the context L361 and the consequences L361, L362) — the enterprise's (L380) selections, defended (L362).**

The one-sentence interview answer: *"The technology selection is the defensible choice (L362). The criteria (L362): the fit (L362) — the requirements (L359) match: the latency (L333), the scale (L358), the compliance (L371); the cost (L362) — the licensing (L362), the infra (L285), the team's (L362) skill (L362); and the risk (L362) — the maturity (L362), the community (L362), the lock-in (L377). The shortlist (L362): the candidates (L362) — the 3-5 (L362) considered (L362): the frameworks (L362), the databases (L268, L182), the clouds (L366). The decision (L361): the ADR (L361) — the choice (L361) with the context (L361) and the consequences (L361). The AI's criteria (L362): the model (L148) — the fit and the cost (L334); the framework (L214) — the LangChain (L214) vs the plain (L362); and the vector DB (L182) — the pgvector (L183) vs the Pinecone (L184). The AI shape (L173): the enterprise (L380) — the framework (L362), the vector DB (L182), the cloud (L366) — selected (L362) by the criteria (L362), recorded (L361), and defended (L362)."*

## 2. Mental Model

Think of the technology selection as **the chef's ingredient choice.** The chef (the architect, L362) chooses the ingredients (the technologies, L362) for the dish (the system, L173). The criteria (L362): the fit (L362) — the dish's (L359) needs (L362): the flavor (the latency, L333), the portions (the scale, L358); the cost (L362) — the price (the licensing, L362) and the pantry (the infra, L285); and the risk (L362) — the freshness (the maturity, L362) and the supplier (the lock-in, L377). The shortlist (L362): the 3-5 (L362) ingredients (L362) — the tested (L362). The choice (the decision, L361): the ADR (L361) — the ingredient (L361), the why (L361), the trade-offs (L361). The dish works because the criteria are clear, the shortlist is tested, and the choice is recorded (L362).

```text
   the ingredient choice (the selection, L362)
   ┌────────────────────────────────────────────────────────┐
   │ the criteria (L362) — the fit, the cost, the risk      │
   │ the shortlist (L362) — the 3-5 candidates (L362)       │
   │ the choice (the ADR, L361) — the why and the           │
   │ trade-offs (L361)                                      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the ingredient choice**: the criteria, the shortlist, and the recorded choice (L362).

## 3. Visual Flow — One Selection

```text
   the requirement (L359)
        │  the vector store (L182) needed
        ▼
   ┌────────────────────── THE CRITERIA (L362) ─────────────────────────┐
   │  the fit (L362): the scale (L358), the latency (L333)             │
   │  the cost (L362): the licensing (L362), the infra (L285)          │
   │  the risk (L362): the maturity (L362), the lock-in (L377)         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SHORTLIST (L362) ────────────────────────┐
   │  the pgvector (L183) · the Pinecone (L184) · the Qdrant (L185)    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DECISION (L361) ─────────────────────────┐
   │  ADR-021: the pgvector (L183) — the fit (L183), the cost (L362),  │
   │  the operations (L268) — the choice, recorded (L361)              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the selection: **criteria → shortlist → decision** (L362).

## 4. How It Works — The Method, Part by Part

- **The criteria (L362).** The fit (L362), the cost (L362), the risk (L362) — the requirements (L359) match (L362).
- **The shortlist (L362).** The candidates (L362) — the 3-5 (L362) considered (L362).
- **The decision (L361).** The ADR (L361) — the choice (L361) with the context (L361) and the consequences (L361).
- **The AI's criteria (L362).** The model (L148), the framework (L214), the vector DB (L182).

> [!NOTE]
> **The selection is the requirements' match, not the favorite's (L362).** The senior answer selects by the fit (L362): the requirements (L359) — the latency (L333), the scale (L358), the compliance (L371) — decide (L362); the cost (L362) — the licensing (L362) and the infra (L285); and the risk (L362) — the maturity (L362) and the lock-in (L377). The favorite (L362) — the familiar (L362) — is a criterion (L362), not the decision (L362).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The framework (L362), the database (L268), the cloud (L366) — selected (L362) and recorded (L361).
- **A vector DB choice (L182).** The pgvector (L183) vs the Pinecone (L184) — the criteria (L362) and the ADR (L361).
- **A framework choice (L362).** The LangChain (L214) vs the plain SDK (L152) — the fit and the cost (L362).
- **A cloud choice (L366).** The AWS (L366) vs the Azure (L366) — the exit cost (L366).
- **Anything enterprise (L380).** The selection (L362) — the criteria, the shortlist, the ADR (L362).

The through-line: **the method is the selection's** — the criteria, the shortlist, and the decision (L362).

## 6. Interview Explanation

Say it in four moves:

1. **The criteria.** "The fit, the cost, the risk (L362)."
2. **The shortlist.** "The 3-5 candidates (L362)."
3. **The decision.** "The ADR (L361) — the choice with the why (L361)."
4. **The AI's.** "The model (L148), the framework (L214), the vector DB (L182)."

## 7. Senior-Level Insights

- **The fit is the requirements' (L362).** The latency (L333), the scale (L358), the compliance (L371) — the requirements (L359) decide (L362).
- **The cost is the total's (L362).** The licensing (L362), the infra (L285), the team (L362) — the L368 total cost (L368) (L362).
- **The risk is the lock-in's (L377).** The maturity (L362) and the exit cost (L366) — the L377 lock-in (L377), selection-shaped (L362).
- **The ADR is the defense (L361).** The choice (L361) with the context (L361) — the selection (L362) defended (L362).
- **The AI's vector DB is the RAG's (L182).** The pgvector (L183) vs the Pinecone (L184) — the scale (L358) and the ops (L268) decide (L362).

## 8. Common Mistakes

- **The favorite picked (L362).** The familiar (L362) without the criteria (L362) — the fit (L362) un-checked (L362).
- **The single option (L362).** The one candidate (L362) — the shortlist (L362) of the 3-5 (L362).
- **The cost-blind (L362).** The licensing (L362) and the infra (L285) un-estimated (L362) — the L368 budget (L368) blown (L362).
- **The lock-in ignored (L377).** The proprietary (L362) without the exit (L366) — the L377 cost (L377) (L362).
- **The un-recorded choice (L361).** The decision (L362) without the ADR (L361) — the defense (L362) lost (L361).

## 9. Best Practices

- **Score by the criteria** (L362) — the fit, the cost, the risk (L362).
- **Shortlist the 3-5** (L362) — the candidates (L362).
- **Estimate the total cost** (L368) — the licensing (L362), the infra (L285).
- **Check the lock-in** (L377) — the exit cost (L366).
- **Record the ADR** (L361) — the selection (L362) defended (L362).

## 10. Interview Questions

**Q: Walk me through the technology selection.**
> A: The defensible choice (L362). The criteria — the fit, the cost, the risk (L362). The shortlist — the 3-5 candidates (L362). The decision — the ADR (L361). And the AI's — the model (L148), the framework (L214), the vector DB (L182).

**Q: How do you pick the vector DB?**
> A: The criteria (L362): the fit — the scale (L358) and the latency (L333) of the retrieval (L189); the cost — the licensing (L362) and the infra (L285); and the risk — the maturity (L362) and the ops (L268). The shortlist (L362): the pgvector (L183), the Pinecone (L184), the Qdrant (L185). The ADR (L361) records the choice (L361).

**Q: How do you score the candidates?**
> A: The weighted criteria (L362): the fit (L362) — the requirements (L359) match (L362); the cost (L362) — the licensing (L362) and the infra (L285); the risk (L362) — the maturity (L362) and the lock-in (L377). Each candidate (L362) scored (L362) — the table (L362) in the ADR (L361).

**Q: What's the AI-specific selection?**
> A: Three (L362): the model (L148) — the fit and the cost (L334); the framework (L214) — the LangChain (L214) vs the plain SDK (L152); and the vector DB (L182) — the pgvector (L183) vs the managed (L184). Each (L362) by the criteria (L362), recorded (L361).

## 11. Follow-Up Questions

- What are the criteria (L362)?
- How do you pick the vector DB (L182)?
- How do you score the candidates (L362)?
- What's the AI-specific selection (L362)?
- What's the ADR (L361)?

## 12. Comparison Table — The Selection's Axes

| Criterion (L362) | The question (L362) | The AI's (L362) |
|---|---|---|
| The fit (L362) | the requirements (L359) match? | the model's (L148) task fit (L362) |
| The cost (L362) | the licensing + the infra (L368) | the tokens (L332), the provisioned (L278) |
| The risk (L362) | the maturity + the lock-in (L377) | the drift (L335), the vendor (L364) |

The senior read: **the three axes, scored and recorded** (L362).

## 13. Code Example — The Method, Applied

```js
// The technology selection (L362) — the criteria, the shortlist, the ADR (L362).
// 1 · THE CRITERIA (L362) — the weighted axes (L362).
const criteria = {
  fit:   { weight: 0.5, score: (c) => fitScore(c, requirements) },  // L359
  cost:  { weight: 0.3, score: (c) => costScore(c) },               // L368
  risk:  { weight: 0.2, score: (c) => riskScore(c) },               // L377
};

// 2 · THE SHORTLIST (L362) — the candidates (L362).
const shortlist = [
  { id: 'pgvector',  fit: 9, cost: 9, risk: 8 },   // L183
  { id: 'pinecone',  fit: 8, cost: 6, risk: 7 },   // L184
  { id: 'qdrant',    fit: 7, cost: 7, risk: 7 },   // L185
];

// 3 · THE SCORE (L362) — the weighted sum (L362).
function score(c) {
  return criteria.fit.weight * c.fit
       + criteria.cost.weight * c.cost
       + criteria.risk.weight * c.risk;
}
const ranked = shortlist.map((c) => ({ ...c, total: score(c) }))
                       .sort((a, b) => b.total - a.total);
// pgvector wins (L362)

// 4 · THE ADR (L361) — the choice recorded (L361).
//   ADR-021: the pgvector (L183) — the fit, the cost, the ops (L361)
```

```text
What the reader must SEE — the method, applied:

  fit 0.5 + cost 0.3 + risk 0.2 → the criteria (L362)
  the 3-candidate shortlist     → the options (L362)
  the weighted total            → the score (L362)
  pgvector wins → the ADR       → the record (L361)

  The criteria, the shortlist, the decision (L362).
```

```narrate
4-8: The criteria — the weighted axes of the fit, the cost, and the risk (L362).
10-14: The shortlist — the candidates with their scores (L362).
16-21: The score — the weighted total and the ranking (L362).
23-24: The ADR — the choice recorded (L361, L362).
```

> [!TIP]
> The pair that defines the method: **the weighted criteria** (the objectivity, L362) and **the recorded ADR** (the defense, L361). **Score by the fit, the cost, and the risk; shortlist the 3-5; record the choice — the defensible selection (L362).**

## 14. Performance Notes

- **The selection is the project's speed (L362).** The decided stack (L362) — the rework (L362) avoided (L362).
- **The cost is the budget's (L362).** The licensing (L362) and the infra (L285) — the L368 estimate (L368) (L362).
- **The lock-in is the exit's (L377).** The proprietary (L362) — the L377 exit cost (L377) (L362).
- **The ADR is the review's (L361).** The context (L361) — the selection (L362) revisited (L361).

## 15. Debugging Scenarios

| Symptom | First check (L362) | The lever |
|---|---|---|
| The stack doesn't fit | The criteria (L362) | The requirements (L359) |
| The budget blows | The cost (L362) | The total cost (L368) |
| The exit is hard | The lock-in (L377) | The exit cost (L366) |
| The choice is disputed | The ADR (L361) | The context (L361) |
| The team re-picks | The criteria (L362) | The scored table (L362) |

## 16. Quick Revision Notes

- The technology selection = **the defensible choice** (L362): the criteria, the shortlist, the decision.
- The criteria: **the fit, the cost, the risk (L362)**.
- The shortlist: **the 3-5 candidates (L362)**.
- The decision: **the ADR (L361) — the choice with the why (L361)**.
- The AI's: **the model (L148), the framework (L214), the vector DB (L182)**.

## 17. Cheat Sheet

```text
TECHNOLOGY SELECTION = the shortlist you can defend

THE CRITERIA (L362)
  the fit (L362) — the requirements (L359) match:
    the latency (L333), the scale (L358), the compliance (L371)
  the cost (L362) — the licensing (L362), the infra (L285),
    the team (L362)
  the risk (L362) — the maturity (L362), the community (L362),
    the lock-in (L377)

THE SHORTLIST (L362)
  the 3-5 candidates (L362) — the frameworks (L362),
  the databases (L268, L182), the clouds (L366)
  the weighted score (L362)

THE DECISION (L361)
  the ADR (L361) — the choice (L361), the context (L361),
  the consequences (L361)

THE AI'S (L362)
  the model (L148) — the fit and the cost (L334)
  the framework (L214) — the LangChain (L214) vs the plain (L152)
  the vector DB (L182) — the pgvector (L183) vs the Pinecone (L184)

INTERVIEW, 4 MOVES
  1 criteria  "the fit, the cost, the risk (L362)"
  2 shortlist "the 3-5 candidates (L362)"
  3 decision  "the ADR (L361)"
  4 the AI's  "the model, the framework, the vector DB (L362)"
```

## 18. Key Takeaways

> [!RECAP]
> - The technology selection is **the frameworks, the databases, and the shortlist you can defend** (L362): the criteria (L362), the shortlist (L362), the decision (L361), and the AI's criteria (L362)
> - **The criteria** (L362): the fit (L362) — the requirements (L359) match; the cost (L362) — the licensing (L362) and the infra (L285); and the risk (L362) — the maturity (L362) and the lock-in (L377)
> - **The shortlist** (L362): the candidates (L362) — the 3-5 (L362) considered (L362)
> - **The decision** (L361): the ADR (L361) — the choice (L361) with the context (L361) and the consequences (L361)
> - **The AI's criteria** (L362): the model (L148), the framework (L214), and the vector DB (L182)
> - The principle (L362): the selection is the requirements' match (L362), not the favorite's (L362) — the criteria (L362) scored, the shortlist (L362) tested, and the choice (L361) recorded (L362)

## Check your understanding

Answer these without looking back.

1. What are the criteria (L362)?
2. How do you pick the vector DB (L182)?
3. How do you score the candidates (L362)?
4. What's the AI-specific selection (L362)?
5. What's the ADR (L361)?
6. What's the fit (L362)?
7. What's the lock-in (L377)?
8. What is the defensible choice (L362)?

## A Closing Note — The Pantry, Chosen

You now hold the method: **the criteria, the shortlist, and the decision — with the fit scored and the choice recorded.** The chef chose by the dish — and the recipe is in the logbook (L362).

Next: the managed APIs, the open-source stacks, or the in-house — Build vs Buy (L363).
