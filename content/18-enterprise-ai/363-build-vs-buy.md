# Lesson 363 — Build vs Buy

**Interview importance:** ⭐⭐⭐⭐⭐ — "managed APIs, open-source stacks, or in-house — the cost equation" — the answer is *the decision*: the buy, the open-source, or the build (L363).**

L362 selected the technology; this lesson is **how much to build**: the build vs buy — the managed APIs, the open-source stacks, or the in-house — the cost equation (L363): the options (the buy L363, the open-source L363, the build L363), the costs (the licensing L363, the maintenance L363, the team L363), and the decision (the core vs the context, L363). The AI shape (L173): the model (L148) — the buy (L278); the RAG (L280) — the build or the managed (L280); the vector DB (L182) — the open-source (L183). This lesson is the cost equation (L363).

The distinction this lesson is built on: a **junior** builds everything. A **solutions architect** decides by the core (L363): the buy (L363), the open-source (L363), or the build (L363) — the cost equation (L363) — because the build (L363) is the maintenance's (L363) forever (L363).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the options: the buy, the open-source, the build (L363)
- Explain the costs: the licensing, the maintenance, the team (L363)
- Explain the core: the differentiator (L363)
- Explain the AI's: the model, the RAG, the vector DB (L363)
- Explain the AI shape: the cost equation (L363)

## 1. One-Line Definition

**The build vs buy is the cost equation — the managed APIs, the open-source stacks, or the in-house (L363) — the options (the buy: the managed L363 — the model L278, the vector DB L184; the open-source: the self-hosted L363 — the pgvector L183, the Langfuse L345; the build: the in-house L363 — the custom L363), the costs (the licensing L363, the maintenance L363, the team L363, the opportunity L363), and the decision (the core vs the context: the differentiator L363 built, the rest bought L363) — the enterprise's (L380) cost equation (L363).**

The one-sentence interview answer: *"The build vs buy is the cost equation (L363). The options (L363): the buy (L363) — the managed (L363): the model (L278), the vector DB (L184) — the license (L363) for the speed (L363); the open-source (L363) — the self-hosted (L363): the pgvector (L183), the Langfuse (L345) — the license-free (L363) for the ops (L363); and the build (L363) — the in-house (L363): the custom (L363) — the team (L363) for the control (L363). The costs (L363): the licensing (L363), the maintenance (L363) — the forever (L363), the team (L363) — the salaries (L363), and the opportunity (L363) — the core (L363) neglected (L363). The decision (L363): the core (L363) — the differentiator (L363): the unique (L363) workflow (L363) — built (L363); the context (L363) — the commodity (L363): the model (L278), the database (L268) — bought (L363). The AI's (L363): the model (L148) — the buy (L278); the RAG (L280) — the build or the managed (L280); the vector DB (L182) — the open-source (L183) or the managed (L184). The AI shape (L173): the enterprise (L380) — the model (L278) bought (L363), the RAG (L280) built (L363), the vector DB (L183) open-sourced (L363) — the cost equation (L363), decided (L363)."*

## 2. Mental Model

Think of the build vs buy as **the restaurant's kitchen decision.** The restaurant (the enterprise, L380) decides what to cook in-house (the build, L363) and what to order (the buy, L363): the signature dish (the core, L363) — the secret recipe (the differentiator, L363) — cooked in-house (L363); the staples (the context, L363) — the bread (the model, L278), the dairy (the database, L268) — ordered (L363) or from the local mill (the open-source, L363). The costs (L363): the orders (the licensing, L363), the kitchen staff (the team, L363), and the ovens (the maintenance, L363). The restaurant works because the signature is in-house, and the staples are ordered (L363).

```text
   the kitchen (the decision, L363)
   ┌────────────────────────────────────────────────────────┐
   │ the signature dish (the core, L363) — cooked in-house  │
   │ (L363)                                                 │
   │ the staples (the context, L363) — ordered (L363) or    │
   │ the local mill (the open-source, L363)                 │
   │ the costs (L363) — the orders, the staff, the ovens    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the kitchen**: the signature in-house, the staples ordered (L363).

## 3. Visual Flow — One Build-vs-Buy Decision

```text
   the component (L363)
        │  e.g. the RAG (L280)
        ▼
   ┌────────────────────── THE OPTIONS (L363) ──────────────────────────┐
   │  the buy (L363): the managed (L280) — the speed, the license      │
   │  the open-source (L363): the self-hosted (L363) — the free, the   │
   │  ops                                                              │
   │  the build (L363): the in-house (L363) — the control, the team    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE COSTS (L363) ────────────────────────────┐
   │  the licensing (L363) · the maintenance (L363) · the team (L363)  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DECISION (L363) ─────────────────────────┐
   │  the core (L363)? → the build (L363)                              │
   │  the context (L363)? → the buy or the open-source (L363)          │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the decision: **options → costs → core** (L363).

## 4. How It Works — The Equation, Part by Part

- **The options (L363).** The buy (L363) — the managed; the open-source (L363) — the self-hosted; the build (L363) — the in-house.
- **The costs (L363).** The licensing (L363), the maintenance (L363), the team (L363), the opportunity (L363).
- **The core (L363).** The differentiator (L363) — built (L363); the context (L363) — the commodity (L363) — bought (L363).
- **The AI's (L363).** The model (L148) — the buy (L278); the RAG (L280) — the build or the managed (L280); the vector DB (L182) — the open-source (L183) or the managed (L184).

> [!NOTE]
> **The core is the build's test (L363).** The senior answer asks the one question (L363): is it the differentiator (L363) — the unique (L363) workflow (L363) the competitors (L363) can't copy (L363) — then build (L363); is it the context (L363) — the commodity (L363): the model (L278), the database (L268), the queue (L270) — then buy (L363) or open-source (L363). The build (L363) is the maintenance's (L363) forever (L363) — the core (L363) only (L363).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The model (L278) bought, the RAG (L280) built — the equation (L363).
- **A model decision (L148).** The buy (L278) — the frontier (L148) via the API (L363).
- **A vector DB decision (L182).** The open-source (L183) vs the managed (L184) — the ops (L268) vs the license (L363).
- **A RAG decision (L280).** The build (L349) vs the managed (L280) — the core (L363).
- **Anything enterprise (L380).** The equation (L363) — the options, the costs, the core (L363).

The through-line: **the equation is the decision's** — the options, the costs, and the core (L363).

## 6. Interview Explanation

Say it in four moves:

1. **The options.** "The buy (L363), the open-source (L363), the build (L363)."
2. **The costs.** "The licensing, the maintenance, the team (L363)."
3. **The core.** "The differentiator — built; the commodity — bought (L363)."
4. **The AI's.** "The model (L278) bought, the RAG (L280) built, the vector DB (L183) open-sourced (L363)."

## 7. Senior-Level Insights

- **The core is the test (L363).** The differentiator (L363) built (L363); the context (L363) bought (L363) — the core (L363) only (L363).
- **The maintenance is the hidden cost (L363).** The build (L363) — the forever (L363): the bugs (L363), the upgrades (L363), the team (L363) — the L363 total (L363).
- **The model is the buy (L363).** The frontier (L148) — the API (L278) — the build (L363) of the model (L365) is the rare (L363) case (L363).
- **The open-source is the middle (L363).** The pgvector (L183) and the Langfuse (L345) — the free (L363) for the ops (L363) — the middle (L363) of the buy and the build (L363).
- **The opportunity is the core's (L363).** The team (L363) on the build (L363) — the core (L363) neglected (L363) — the opportunity cost (L363).

## 8. Common Mistakes

- **The build-everything (L363).** The model (L365) and the database (L268) built (L363) — the maintenance (L363) forever (L363) — the buy (L363) for the commodity (L363).
- **The buy-everything (L363).** The unique workflow (L363) outsourced (L363) — the differentiator (L363) lost (L363) — the build (L363) for the core (L363).
- **The license-blind (L363).** The managed (L363) at the scale (L358) — the cost (L368) explodes (L363) — the open-source (L363) considered (L363).
- **The ops-blind (L363).** The open-source (L183) self-hosted (L363) — the ops (L268) under-estimated (L363).
- **The ADR-less (L361).** The decision (L363) un-recorded (L361) — the defense (L363) lost (L361).

## 9. Best Practices

- **Ask the core question** (L363) — the differentiator (L363)?
- **Build the core** (L363) — the unique (L363) workflow (L363).
- **Buy the commodity** (L363) — the model (L278), the database (L268).
- **Open-source the middle** (L363) — the pgvector (L183), the Langfuse (L345).
- **Record the ADR** (L361) — the equation (L363), decided (L361).

## 10. Interview Questions

**Q: Walk me through the build vs buy.**
> A: The cost equation (L363). The options — the buy (the managed), the open-source (the self-hosted), the build (the in-house) (L363). The costs — the licensing, the maintenance, the team (L363). And the core — the differentiator built, the commodity bought (L363).

**Q: How do you decide?**
> A: The core question (L363): is it the differentiator (L363) — the unique (L363) workflow (L363) — build (L363); is it the context (L363) — the commodity (L363): the model (L278), the database (L268) — buy (L363) or open-source (L363). The build (L363) is the maintenance's (L363) forever (L363) — the core (L363) only (L363).

**Q: What's the AI's build vs buy?**
> A: The model (L148) — the buy (L278): the frontier (L148) via the API (L363); the RAG (L280) — the build (L349) if the retrieval (L189) is the differentiator (L363), the managed (L280) if not (L363); and the vector DB (L182) — the open-source (L183) for the ops (L268), the managed (L184) for the scale (L358).

**Q: What's the hidden cost of the build?**
> A: The maintenance (L363): the build (L363) is the forever (L363) — the bugs (L363), the upgrades (L363), the team (L363) — plus the opportunity (L363): the team (L363) on the build (L363), the core (L363) neglected (L363). The equation (L363) includes the maintenance (L363).

## 11. Follow-Up Questions

- What are the options (L363)?
- How do you decide (L363)?
- What's the AI's build vs buy (L363)?
- What's the hidden cost of the build (L363)?
- What's the core (L363)?

## 12. Comparison Table — The Three Options

| | The buy (L363) | The open-source (L363) | The build (L363) |
|---|---|---|---|
| The speed (L363) | the fastest (L363) | the middle (L363) | the slowest (L363) |
| The cost (L363) | the license (L363) | the ops (L363) | the team (L363) |
| The control (L363) | the vendor's (L363) | the yours (L363) | the yours (L363) |
| The use (L363) | the commodity (L363) | the middle (L363) | the core (L363) |

The senior read: **the core decides the column** (L363).

## 13. Code Example — The Equation, Applied

```js
// The build vs buy (L363) — the core question (L363).
// 1 · THE COMPONENTS (L363) — with the core test (L363).
const components = [
  {
    name: 'model',                          // the model (L148)
    core: false,                            // the commodity (L363)
    decision: 'buy',                        // the API (L278, L363)
    why: 'the frontier (L148) via the API (L363); the build (L365)
         is the rare case (L363)',
  },
  {
    name: 'rag-pipeline',                   // the RAG (L280)
    core: true,                             // the differentiator (L363)
    decision: 'build',                      // the custom retrieval (L349)
    why: 'the retrieval (L189) is the product (L363)',
  },
  {
    name: 'vector-db',                      // the vector store (L182)
    core: false,
    decision: 'open-source',                // the pgvector (L183)
    why: 'the free (L363) for the ops (L268) we already run (L363)',
  },
  {
    name: 'observability',                  // the L346 (L346)
    core: false,
    decision: 'open-source',                // the Langfuse (L345)
    why: 'the self-hosted (L345) keeps the data in our control (L363)',
  },
];

// 2 · THE COSTS (L363) — the total (L363).
//   the license (L363) vs the ops (L363) vs the team (L363)
//   the maintenance (L363) — the forever (L363)

// 3 · THE ADR (L361) — the equation, recorded (L361).
```

```text
What the reader must SEE — the equation, applied:

  model: buy                → the commodity via the API (L278, L363)
  rag-pipeline: build       → the differentiator (L363)
  vector-db: open-source    → the free for the ops (L183, L363)
  observability: open-source → the data's control (L345, L363)
  the maintenance included  → the hidden cost (L363)

  The core built, the commodity bought, the middle open-sourced (L363).
```

```narrate
4-10: The model — the commodity, bought via the API (L278, L363).
11-17: The RAG — the differentiator, built (L349, L363).
18-24: The vector DB — the open-source for the ops (L183, L363).
25-30: The observability — the open-source for the data's control (L345, L363).
32-33: The costs and the ADR — the equation recorded (L361, L363).
```

> [!TIP]
> The pair that defines the equation: **the core test** (the differentiator, L363) and **the maintenance cost** (the hidden forever, L363). **Build the core, buy the commodity, open-source the middle, record the ADR — the cost equation (L363).**

## 14. Performance Notes

- **The buy is the speed (L363).** The managed (L363) — the fastest (L363) to the market (L363).
- **The open-source is the ops (L363).** The self-hosted (L363) — the infra (L285) for the free (L363).
- **The build is the team's (L363).** The in-house (L363) — the salaries (L363) and the maintenance (L363).
- **The decision is the cost's (L368).** The equation (L363) — the L368 budget (L368) informed (L363).

## 15. Debugging Scenarios

| Symptom | First check (L363) | The lever |
|---|---|---|
| The maintenance is huge | The build (L363) | The commodity (L363) bought (L363) |
| The differentiator is weak | The buy (L363) | The core (L363) built (L363) |
| The license explodes | The managed (L363) | The open-source (L363) at the scale (L358) |
| The ops overwhelm | The open-source (L363) | The ops cost (L268) re-estimated (L363) |
| The decision is disputed | The ADR (L361) | The equation (L363) recorded (L361) |

## 16. Quick Revision Notes

- The build vs buy = **the cost equation** (L363): the options, the costs, the core.
- The options: **the buy (L363), the open-source (L363), the build (L363)**.
- The costs: **the licensing (L363), the maintenance (L363), the team (L363)**.
- The core: **the differentiator — built; the commodity — bought (L363)**.
- The AI's: **the model (L278) bought, the RAG (L280) built, the vector DB (L183) open-sourced (L363)**.

## 17. Cheat Sheet

```text
BUILD VS BUY = the cost equation

THE OPTIONS (L363)
  the buy (L363) — the managed: the model (L278), the vector DB (L184)
  the open-source (L363) — the self-hosted: the pgvector (L183),
    the Langfuse (L345)
  the build (L363) — the in-house: the custom (L363)

THE COSTS (L363)
  the licensing (L363) · the maintenance (L363) — the forever (L363)
  the team (L363) — the salaries (L363)
  the opportunity (L363) — the core (L363) neglected (L363)

THE CORE (L363)
  the differentiator (L363) — the unique (L363) workflow (L363)
    → the build (L363)
  the context (L363) — the commodity (L363): the model (L278),
    the database (L268) → the buy (L363)

THE AI'S (L363)
  the model (L148) → the buy (L278)
  the RAG (L280) → the build (L349) if the core (L363)
  the vector DB (L182) → the open-source (L183) or the managed (L184)

INTERVIEW, 4 MOVES
  1 options "the buy, the open-source, the build (L363)"
  2 costs   "the licensing, the maintenance, the team (L363)"
  3 core    "the differentiator built, the commodity bought (L363)"
  4 the AI's "the model bought, the RAG built, the DB open-sourced (L363)"
```

## 18. Key Takeaways

> [!RECAP]
> - The build vs buy is **the cost equation — the managed APIs, the open-source stacks, or the in-house** (L363): the options (L363), the costs (L363), the core (L363), and the AI's (L363)
> - **The options** (L363): the buy (L363) — the managed (L363); the open-source (L363) — the self-hosted (L363); and the build (L363) — the in-house (L363)
> - **The costs** (L363): the licensing (L363), the maintenance (L363) — the forever (L363), the team (L363), and the opportunity (L363)
> - **The core** (L363): the differentiator (L363) — built (L363); the context (L363) — the commodity (L363) — bought (L363)
> - **The AI's** (L363): the model (L148) — the buy (L278); the RAG (L280) — the build (L349) if the core (L363); the vector DB (L182) — the open-source (L183) or the managed (L184)
> - The principle (L363): the build (L363) is the maintenance's (L363) forever (L363) — the core (L363) only (L363), the equation (L363) recorded in the ADR (L361)

## Check your understanding

Answer these without looking back.

1. What are the options (L363)?
2. How do you decide (L363)?
3. What's the AI's build vs buy (L363)?
4. What's the hidden cost of the build (L363)?
5. What's the core (L363)?
6. What's the maintenance (L363)?
7. What's the opportunity (L363)?
8. What is the cost equation (L363)?

## A Closing Note — The Kitchen, Decided

You now hold the equation: **the options, the costs, and the core — with the signature in-house and the staples ordered.** The restaurant's kitchen is decided — and the recipe is recorded (L363).

Next: evaluating the model and the platform vendors on the axes that matter — Vendor Selection (L364).
