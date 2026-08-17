# Lesson 347 — System Design Protocol for AI (L102 Spine Applied)

**Interview importance:** ⭐⭐⭐⭐⭐ — "run any AI prompt through one repeatable protocol" — the answer is *the protocol*: clarify → estimate → design → trade-offs, with the AI-specific questions (L347).**

This is the first lesson of the AI System Design module — and the spine the module runs on. L102 built the web's protocol (L102); this lesson is **its AI application**: the system design protocol for AI — clarify → estimate → design → trade-offs, with the AI-specific questions per phase (L347): the phases (the four, L347) and the AI questions (the model, the tokens, the latency, the cost, L347). This lesson is the spine of the module (L347).

The distinction this lesson is built on: a **junior** answers with the pieces. A **solutions architect** runs the protocol (L347): the clarify (L347), the estimate (L347), the design (L347), and the trade-offs (L347) — the spine every L348–L358 design runs on (L347).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the phases: clarify → estimate → design → trade-offs (L347)
- Explain the clarify: the requirements and the scale (L347)
- Explain the estimate: the requests and the tokens (L347)
- Explain the design: the parts and the data flow (L347)
- Explain the trade-offs: the named choices (L347)

## 1. One-Line Definition

**The system design protocol for AI is the L102 spine, applied — clarify → estimate → design → trade-offs, with the AI-specific questions per phase (L347) — the clarify (the requirements: the users L162, the reads and the writes L233, the latency L333, the model L148, L347), the estimate (the scale: the requests per second, the tokens L332, the storage L183, the cost L334, L347), the design (the parts: the front door L267, the engine room L270, the model L278, L347), and the trade-offs (the named choices: the RAG vs the fine-tuning L365, the streaming L251 vs the batch L282, L347).**

The one-sentence interview answer: *"The protocol is the L102 spine, AI-shaped (L347). The phases (L347): the clarify (L347) — the requirements (L347): who the users are (L162), what the reads and the writes are (L233), the latency budget (L151) — the TTFT (L145) — and the model's role (L148): the chat (L348), the retrieval (L349), the tools (L200). The estimate (L347): the scale (L347) — the requests per second (L347), the tokens (L332) per request (L347), the storage (L183) for the vectors (L347), and the cost (L334) per month (L347). The design (L347): the parts (L347) — the front door (L267), the engine room (L270), the model (L278), the data (L268) — and the data flow (L347): the request (L328) from the edge (L272) to the model (L278) and back (L347). The trade-offs (L347): the named choices (L347) — the RAG (L280) vs the fine-tuning (L365), the streaming (L251) vs the batch (L282), the monolithic (L253) vs the serverless (L283) — each with its cost (L347). The AI shape (L173): the protocol (L347) run on the prompts (L348–358) — every lesson (L348) is the spine (L347), executed (L347)."*

## 2. Mental Model

Think of the protocol as **the architect's four-question walk.** The walk (the protocol, L347) has the four questions (L347): the first — "what are we building?" (the clarify, L347): the building's (the system's, L347) users (L162) and rooms (L233). The second — "how big?" (the estimate, L347): the visitors per hour (the requests, L347), the supplies (the tokens, L332). The third — "how do we build it?" (the design, L347): the lobby (the gateway, L267), the kitchens (the engine room, L270), the power plant (the model, L278). And the fourth — "what do we give up?" (the trade-offs, L347): the marble vs the speed (the cost, L347). The architect (L347) walks the four (L347) on every project (L348–358). The building works because the walk is repeatable (L347).

```text
   the walk (the protocol, L347)
   ┌────────────────────────────────────────────────────────┐
   │ 1 clarify (L347) — the requirements and the users      │
   │ 2 estimate (L347) — the requests and the tokens (L332) │
   │ 3 design (L347) — the parts and the flow (L347)        │
   │ 4 trade-offs (L347) — the named choices (L347)         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the walk**: the four questions, repeated (L347).

## 3. Visual Flow — The Protocol, Run

```text
   the prompt (L347)
        │
        ▼
   ┌────────────────────── 1 · CLARIFY (L347) ──────────────────────────┐
   │  the users (L162) · the reads and the writes (L233)               │
   │  the latency (L333): the TTFT (L145) · the model (L148)           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── 2 · ESTIMATE (L347) ─────────────────────────┐
   │  the requests per second (L347) · the tokens (L332) per request   │
   │  the storage (L183) · the cost (L334) per month (L347)            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── 3 · DESIGN (L347) ───────────────────────────┐
   │  the front door (L267) · the engine room (L270) · the model       │
   │  (L278) · the data (L268) · the flow (L347)                       │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── 4 · TRADE-OFFS (L347) ───────────────────────┐
   │  the RAG (L280) vs the fine-tuning (L365) · the streaming (L251)  │
   │  vs the batch (L282) · the named costs (L347)                     │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the spine: **clarify → estimate → design → trade-offs** (L347).

## 4. How It Works — The Spine, Part by Part

- **The clarify (L347).** The requirements (L347): the users (L162), the reads and the writes (L233), the latency budget (L151) — the TTFT (L145) — and the model's role (L148).
- **The estimate (L347).** The scale (L347): the requests per second (L347), the tokens (L332) per request (L347), the storage (L183), and the cost (L334).
- **The design (L347).** The parts (L347): the front door (L267), the engine room (L270), the model (L278), the data (L268) — and the data flow (L347).
- **The trade-offs (L347).** The named choices (L347): the RAG (L280) vs the fine-tuning (L365), the streaming (L251) vs the batch (L282) — each with its cost (L347).

> [!NOTE]
> **The AI's questions are the protocol's difference (L347).** The senior answer names the AI's additions (L347): the L102 spine (L102) — the users, the scale, the design, the trade-offs (L102) — plus the AI's (L347): the model (L148) — which and why (L347); the tokens (L332) — the cost (L334) and the latency (L333); the hallucination (L336) — the grounding (L280); and the eval (L341) — how the quality (L341) is measured (L347). The protocol (L347) runs the four (L347) with the AI's (L347) questions inside (L347).

## 5. Real Project Usage

- **An interview (L348).** The chat system (L348) — the protocol (L347) run (L348).
- **A design review (L357).** The multi-tenant SaaS (L357) — the protocol (L347) run (L357).
- **A greenfield build (L173).** The new product (L173) — the protocol (L347) first (L347).
- **A scale-up (L358).** The high-scale system (L358) — the protocol (L347) run (L358).
- **Anything designed (L347).** The spine (L347) — the four phases (L347), the AI's questions (L347).

The through-line: **the spine is the module's** — the four phases, run on every prompt (L347).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The requirements — the users, the reads and the writes, the latency (L347)."
2. **The estimate.** "The requests, the tokens (L332), the storage, the cost (L334)."
3. **The design.** "The front door (L267), the engine room (L270), the model (L278)."
4. **The trade-offs.** "The named choices — the RAG (L280), the streaming (L251)."

## 7. Senior-Level Insights

- **The clarify is the design's half (L347).** The requirements (L347) — the wrong clarify (L347) is the wrong design (L347) — the questions (L347) first (L347).
- **The estimate is the design's scale (L347).** The requests (L347) and the tokens (L332) — the design (L347) follows the scale (L347).
- **The model is the design's center (L148).** The model's choice (L148) — the latency (L333), the cost (L334), and the quality (L341) — the design (L347) around it (L347).
- **The trade-offs are the senior's deliverable (L347).** The named choice (L347) — the RAG (L280) vs the fine-tuning (L365) — with the cost (L347) — the L367 trade-off (L367), protocol-shaped (L347).
- **The eval is the design's gate (L341).** The quality (L341) — the evals (L341) in the design (L347) — the L346 suite (L346), design-shaped (L347).

## 8. Common Mistakes

- **The piece-first answer (L347).** The Redis (L243) and the SQS (L270) named (L347) before the clarify (L347) — the spine (L347) first (L347).
- **The skipped estimate (L347).** The design (L347) without the scale (L347) — the capacity (L369) unknown (L347).
- **The model by the habit (L347).** The frontier (L148) for everything (L347) — the model's choice (L148) by the requirements (L347).
- **The un-named trade-off (L347).** The choice (L347) without the cost (L347) — the named trade-off (L367) is the senior's (L347).
- **The eval-less design (L347).** The quality (L341) un-measured (L347) — the evals (L341) in the design (L347).

## 9. Best Practices

- **Run the four phases** (L347) — in the order (L347).
- **Clarify before the design** (L347) — the requirements (L347) first (L347).
- **Estimate the scale** (L347) — the requests, the tokens (L332), the cost (L334).
- **Choose the model by the requirements** (L148) — not the habit (L347).
- **Name the trade-offs** (L347) — with the costs (L347).

## 10. Interview Questions

**Q: Walk me through the system design protocol for AI.**
> A: The L102 spine, AI-shaped (L347). The clarify — the requirements: the users, the reads and the writes, the latency (L347). The estimate — the requests, the tokens (L332), the storage, the cost (L334). The design — the front door (L267), the engine room (L270), the model (L278). And the trade-offs — the named choices (L347).

**Q: What are the AI-specific questions?**
> A: Four additions (L347): the model (L148) — which and why, by the latency (L333) and the cost (L334); the tokens (L332) — the per-request cost (L334) and the latency (L333); the hallucination (L336) — the grounding (L280) needed (L347); and the eval (L341) — how the quality (L341) is measured (L347). The L102 spine (L102) plus the AI's (L347).

**Q: How do you estimate the AI scale?**
> A: The requests and the tokens (L347): the requests per second (L347) × the tokens (L332) per request (L347) — the tokens per day (L332); the model's price (L150) — the cost (L334) per day and per month (L347); and the storage (L347) — the vectors (L183) and the logs (L329) — the growth (L347) over the retention (L322).

**Q: How do you pick the model?**
> A: By the requirements (L148): the latency budget (L151) — the TTFT (L145); the cost (L334) — the tokens (L332) per request (L347); and the quality (L341) — the task's (L340) difficulty (L347). The routing (L155) — the cheap for the simple (L157), the frontier (L148) for the hard (L347).

## 11. Follow-Up Questions

- What are the phases (L347)?
- What are the AI-specific questions (L347)?
- How do you estimate the scale (L347)?
- How do you pick the model (L148)?
- What are the trade-offs (L347)?

## 12. Comparison Table — The Web vs the AI Protocol

| Phase (L347) | The web (L102) | The AI (L347) |
|---|---|---|
| The clarify (L347) | the users, the reads and the writes (L102) | + the model (L148), the latency (L333) |
| The estimate (L347) | the requests, the storage (L102) | + the tokens (L332), the cost (L334) |
| The design (L347) | the servers, the databases (L102) | + the engine room (L270), the model (L278) |
| The trade-offs (L347) | the CAP (L259), the cost (L102) | + the RAG (L280), the streaming (L251) |

The senior read: **the AI's columns are the additions** — the model, the tokens, the evals (L347).

## 13. Code Example — The Spine, Run

```js
// The protocol (L347) — the four phases, run (L347).
// 1 · THE CLARIFY (L347) — the requirements (L347).
const clarify = {
  users: '10k DAU',                     // the users (L162)
  reads: 'chat messages',                // the reads (L233)
  writes: 'conversations',               // the writes (L233)
  latency: { ttft: '< 2s' },             // the TTFT (L145, L151)
  model: 'routed',                       // the model's role (L148)
};

// 2 · THE ESTIMATE (L347) — the scale (L347).
const estimate = {
  rps: 100,                              // the requests per second (L347)
  tokensPerRequest: 800,                 // the tokens (L332)
  tokensPerDay: 100 * 800 * 86400,       // ~6.9B tokens/day (L347)
  costPerMonth: 6.9e9 * 1e-6 * 30,       // the $ (L334, L150)
  storage: { vectors: '50M chunks', logs: '1TB/mo' },  // L183, L329
};

// 3 · THE DESIGN (L347) — the parts (L347).
const design = {
  frontDoor: 'api-gateway',              // the gateway (L267)
  engineRoom: 'sqs + workers',           // the queue (L270)
  model: 'bedrock',                      // the model (L278)
  data: 'rds + pgvector',                // the data (L268, L183)
  cache: 'elasticache',                  // the fast layer (L269)
};

// 4 · THE TRADE-OFFS (L347) — the named choices (L347).
const tradeoffs = [
  { choice: 'RAG vs fine-tuning', cost: 'the latency vs the quality (L280, L365)' },
  { choice: 'streaming vs batch', cost: 'the UX vs the throughput (L251, L282)' },
  { choice: 'serverless vs monolithic', cost: 'the scale vs the seams (L283, L253)' },
];
```

```text
What the reader must SEE — the spine, run:

  clarify: users, reads, writes, TTFT → the requirements (L347)
  estimate: rps × tokens × price     → the scale (L332, L334)
  design: gateway, queue, model, data → the parts (L347)
  tradeoffs: the named choices        → the costs (L347)

  The four phases, in the order (L347).
```

```narrate
4-11: The clarify — the users, the reads and the writes, the latency, and the model (L347).
13-19: The estimate — the requests, the tokens, and the cost (L332, L334, L347).
21-27: The design — the gateway, the queue, the model, and the data (L347).
29-32: The trade-offs — the named choices with their costs (L347).
```

> [!TIP]
> The pair that defines the protocol: **the clarify's latency budget** (the requirement, L151) and **the estimate's token math** (the scale, L332). **Clarify the requirements, estimate the tokens, design the parts, name the trade-offs — the spine, run (L347).**

## 14. Performance Notes

- **The clarify is the design's speed (L347).** The right questions (L347) — the wrong design (L347) avoided (L347).
- **The estimate is the capacity's (L347).** The requests (L347) and the tokens (L332) — the L369 capacity (L369) sized (L347).
- **The model is the latency's (L148).** The choice (L148) — the TTFT (L145) and the cost (L334) (L347).
- **The trade-off is the cost's (L347).** The named choice (L347) — the L368 budget (L368) informed (L347).

## 15. Debugging Scenarios

| Symptom | First check (L347) | The lever |
|---|---|---|
| The design misses the users | The clarify (L347) | The requirements (L347) |
| The capacity is wrong | The estimate (L347) | The tokens (L332), the rps (L347) |
| The latency blows the budget | The model (L148) | The routing (L155) |
| The cost explodes | The estimate (L334) | The tokens (L332), the model (L150) |
| The trade-off is unnamed | The trade-offs (L347) | The named choice (L367) |

## 16. Quick Revision Notes

- The protocol = **the L102 spine, AI-shaped** (L347): the clarify, the estimate, the design, the trade-offs.
- The clarify: **the requirements — the users, the reads and the writes, the latency (L347)**.
- The estimate: **the requests, the tokens (L332), the storage, the cost (L334)**.
- The design: **the front door (L267), the engine room (L270), the model (L278)**.
- The trade-offs: **the named choices (L347) — the RAG (L280), the streaming (L251)**.

## 17. Cheat Sheet

```text
SYSTEM DESIGN PROTOCOL FOR AI = the L102 spine, applied

1 · THE CLARIFY (L347)
  the users (L162) · the reads and the writes (L233)
  the latency (L333): the TTFT (L145) · the model's role (L148)

2 · THE ESTIMATE (L347)
  the requests per second (L347) · the tokens (L332) per request
  the storage (L183) · the cost (L334) per month (L347)

3 · THE DESIGN (L347)
  the front door (L267) · the engine room (L270) · the model (L278)
  the data (L268) · the cache (L269) · the data flow (L347)

4 · THE TRADE-OFFS (L347)
  the RAG (L280) vs the fine-tuning (L365)
  the streaming (L251) vs the batch (L282)
  the serverless (L283) vs the monolithic (L253)
  the named choices with the costs (L347)

INTERVIEW, 4 MOVES
  1 clarify   "the requirements (L347)"
  2 estimate  "the requests, the tokens, the cost (L347)"
  3 design    "the parts and the flow (L347)"
  4 trade-offs "the named choices (L347)"
```

## 18. Key Takeaways

> [!RECAP]
> - The system design protocol for AI is **the L102 spine, applied — clarify → estimate → design → trade-offs, with the AI-specific questions per phase** (L347): the clarify (L347), the estimate (L347), the design (L347), and the trade-offs (L347)
> - **The clarify** (L347): the requirements (L347) — the users (L162), the reads and the writes (L233), the latency budget (L151), and the model's role (L148)
> - **The estimate** (L347): the scale (L347) — the requests per second (L347), the tokens (L332) per request (L347), the storage (L183), and the cost (L334)
> - **The design** (L347): the parts (L347) — the front door (L267), the engine room (L270), the model (L278), the data (L268) — and the data flow (L347)
> - **The trade-offs** (L347): the named choices (L347) — the RAG (L280) vs the fine-tuning (L365), the streaming (L251) vs the batch (L282) — each with its cost (L347)
> - The AI's questions (L347): the model (L148), the tokens (L332), the hallucination (L336), and the eval (L341) — the L102 spine (L102) plus the AI's (L347), run on every prompt (L348–358)

## Check your understanding

Answer these without looking back.

1. What are the phases (L347)?
2. What are the AI-specific questions (L347)?
3. How do you estimate the scale (L347)?
4. How do you pick the model (L148)?
5. What are the trade-offs (L347)?
6. What's the clarify (L347)?
7. What's the eval's role (L341)?
8. What is the spine (L347)?

## A Closing Note — The Walk, Learned

You now hold the spine: **the clarify, the estimate, the design, and the trade-offs — with the AI's questions inside.** The four-question walk is learned — and every design will run it (L347).

Next: the first run — AI Chat System (L348).
