# Lesson 210 — Multi-Agent Systems

**Interview importance:** ⭐⭐⭐⭐ — "when do you use multiple agents?" — the answer is *the coordinator pattern*: specialists with a coordinator — and when one agent is not enough (L200, L204).**

L198–209 built the single agent. This lesson is **when one loop isn't enough**: multi-agent systems — specialists with a coordinator. Three shapes: **the coordinator** (one agent decomposes the task and delegates to specialists, L202), **the pipeline** (specialists pass work in sequence, L199), and **the swarm** (peers collaborate without a coordinator, L210). The rule: one agent first (L199); multiple agents when the task has genuinely separable expertise (L204) — and the cost: N agents is N loops, N budgets, N attack surfaces (L150, L212).

The distinction this lesson is built on: a **demo** wraps a chat in another chat and calls it multi-agent. A **solutions architect** knows the coordinator pattern: decomposition (L202), delegation with the right tool surface per specialist (L204), result aggregation (L206), and the whole system's budget (L149) and observability (L213) — and when multi-agent is the wrong call (L199).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the coordinator pattern: decompose, delegate, aggregate (L210)
- Name the three shapes: coordinator, pipeline, swarm (L210)
- Choose single vs multi-agent: separable expertise (L199, L204)
- Design the delegation: tool surfaces per specialist (L204, L212)
- Explain the costs: N loops, budgets, surfaces (L149, L150, L212)

## 1. One-Line Definition

**Multi-agent systems are specialists with a coordinator — the coordinator decomposes the task (L202), delegates each part to a specialist agent with its own tool surface (L204), and aggregates the results (L206) — three shapes (coordinator, pipeline, swarm) chosen when the task has genuinely separable expertise (L199), at the cost of N loops, N budgets, and N attack surfaces (L150, L212).**

The one-sentence interview answer: *"Multi-agent systems are specialists with a coordinator (L210). The coordinator pattern: decompose the task into parts (L202), delegate each part to a specialist — a research agent, a coding agent, a review agent — each with its own tool surface (L204) and its own guardrails (L209), and aggregate the results (L206). Three shapes: the coordinator (one agent delegates), the pipeline (specialists pass work in sequence, L199), and the swarm (peers collaborate without a coordinator, L210). The rule: one agent first (L199) — multiple agents when the expertise is genuinely separable (L204). The cost: N agents is N loops (L150), N budgets (L149), and N attack surfaces (L212) — multi-agent is an architecture decision, not a fashion (L216)."*

## 2. Mental Model

Think of multi-agent as **a firm with departments, run by a chief of staff.** The chief (the coordinator) takes the project, breaks it into assignments (decomposition, L202), and hands each to the right department (delegation): research, drafting, review — each department has its own tools (L204) and its own rules (L209). The chief collects the work and assembles the deliverable (aggregation, L206). The pipeline shape is the assembly line — each department adds to the work and passes it on (L199). The swarm is the open office — peers talk directly, no chief (L210). The firm works when the departments are genuinely different — and it's expensive: every department has its own headcount (L150), budget (L149), and security badge (L212).

```text
   COORDINATOR (L210)              PIPELINE (L199)            SWARM (L210)
   ┌─────────────────────┐         ┌────────────────────┐    ┌─────────────────┐
   │ the chief           │         │ specialist A → B   │    │ peers, no chief │
   │  decompose (L202)   │         │ → C — the line     │    │ peer-to-peer    │
   │  delegate (L204)    │         │ (L199)             │    │ (L210)          │
   │  aggregate (L206)   │         └────────────────────┘    └─────────────────┘
   └─────────────────────┘
```

The mental model is **the firm**: the chief coordinates, the departments specialize, the line assembles — and every department costs (L150, L212).

## 3. Visual Flow — The Coordinator Pattern

```text
   a task arrives (L210)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · DECOMPOSE (L202)                                     │
   │     the coordinator splits the task: research + draft +  │
   │     review — each part delegatable (L210)                │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · DELEGATE (L204, L212)                                │
   │     each specialist gets: its part + its tool surface    │
   │     (research → search tools; review → the draft)        │
   │     each runs its own loop with its own rails (L209)     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · AGGREGATE (L206, L343)                               │
   │     the results are collected, verified (L343), and      │
   │     assembled into the deliverable (L206)                │
   └──────────────────────────────────────────────────────────┘
```

The flow is the pattern: **decompose → delegate → aggregate** — and each delegate is a single agent with its own surface (L204) and rails (L209).

## 4. How It Works — The Three Shapes and the Rule

- **The coordinator (L210).** One agent decomposes the task (L202), delegates parts to specialists (L204), and aggregates the results (L206). The coordinator's job is orchestration — it may not do the work itself, just assign it (L210).
- **The pipeline (L199).** Specialists in sequence: A's output is B's input (L199). The workflow shape with agentic stages (L230) — the L199 pattern at multi-agent scale.
- **The swarm (L210).** Peers collaborate without a coordinator — each agent decides who to talk to (L210). The most flexible and the least controllable — the hardest to observe (L213) and to guard (L209).
- **The rule (L199).** One agent first — a single loop with a plan (L202) handles most tasks. Multi-agent when the expertise is genuinely separable: research vs code vs review (L204) — and when the coordination cost (L150) is justified by the specialization gain (L343).
- **The costs (L150, L212).** N agents is N loops — N times the tokens (L150), N budgets (L149), N attack surfaces (L212), and N traces to observe (L213). The architecture decision is a cost decision (L199).

> [!NOTE]
> **Multi-agent is a cost decision, not a sophistication signal (L199, L210).** A single agent with a good plan (L202) and a well-scoped tool list (L204) handles most tasks — cheaper (L150) and easier to observe (L213). Multi-agent earns its N loops when the task has *genuinely separable expertise* — specialists whose combined output beats one generalist (L343). The senior answer names the trigger (separable expertise) and the price (N loops, N budgets, N surfaces, L212) — and defends single-agent-first as the default (L199).

## 5. Real Project Usage

- **Research + writing.** A research agent gathers (L189), a writing agent drafts, a review agent checks (L343) — the coordinator delegates (L210).
- **Code generation.** A planner agent designs (L202), a coder agent implements (L354), a reviewer agent checks (L343) — the pipeline shape (L199).
- **Customer support.** A triage agent routes, a specialist agent handles the issue, an escalation agent drafts the handoff (L208) — the coordinator (L210).
- **Content pipeline.** Outline → draft → fact-check → publish — the L199 line with agentic stages (L230).
- **Anything with departments (L216).** The firm is the pattern — where expertise separates, multi-agent pays (L204).

The through-line: **multi-agent is the firm** — specialists with a coordinator, chosen for separable expertise, priced at N loops (L210, L199).

## 6. Interview Explanation

Say it in four moves:

1. **The pattern.** "The coordinator: decompose the task (L202), delegate to specialists (L204), aggregate the results (L206)."
2. **The shapes.** "Coordinator, pipeline (L199), swarm (L210) — the coordination shape follows the task."
3. **The rule.** "One agent first (L199) — multi-agent when the expertise is genuinely separable (L204)."
4. **The price.** "N agents is N loops, N budgets (L149), N attack surfaces (L212) — the decision is a cost decision (L150)."

## 7. Senior-Level Insights

- **The coordinator is an orchestration problem (L202, L210).** The senior answer designs the decomposition (L202) and the delegation contracts (L204) — what each specialist receives and returns (L206) — before any agent code (L216).
- **The tool surfaces are the specialization (L204).** The reason multi-agent works is *different tools per specialist* (L204) — the research agent sees search (L189), the reviewer sees the draft (L343). Without separated surfaces, it's one agent wearing N hats (L210).
- **The traces compose (L213).** N agents is N traces (L213) — the senior design joins them into one run view (L213) with the coordinator's delegation map (L210), so the system is observable as a whole (L216).
- **The failure modes multiply (L211).** Each specialist can fail (L211), and the coordinator can mis-delegate (L202) — the senior design includes the aggregation checks (L343) and the fallbacks (L207).
- **The budgets are per-loop and total (L149).** Each agent has its budget (L205), and the system has a total (L150) — the coordinator is the cost's gatekeeper (L210).

## 8. Common Mistakes

- **Chat-in-a-chat "multi-agent" (L210).** Nested chats with no specialization — the cost (L150) without the separable expertise (L204).
- **No decomposition (L202).** The coordinator delegates a monolithic task — the specialists can't specialize (L210).
- **Overlapping tool surfaces (L204).** Every specialist sees every tool — the surfaces aren't separated, the attack surface (L212) is N-wide (L315).
- **The swarm without observability (L213).** Peers collaborating with no joined trace (L213) — the system becomes a black box (L211).
- **No aggregation checks (L343).** The results assembled unverified (L206) — a bad specialist's output ships (L211).
- **Multi-agent by fashion (L199).** N loops for a single-agent task — the cost decision skipped (L150).

## 9. Best Practices

- **Single-agent first** (L199) — a plan (L202) and a scoped surface (L204) handle most tasks.
- **Separate the tool surfaces** (L204) — the specialization is the different tools (L212).
- **Design the delegation contracts** (L206) — what each specialist receives and returns (L210).
- **Join the traces** (L213) — one run view across N agents (L216).
- **Check the aggregation** (L343) — verify the assembled results (L341).
- **Budget per loop and total** (L149, L150) — the coordinator is the cost gatekeeper (L210).

## 10. Interview Questions

**Q: When do you use multiple agents?**
> A: When the expertise is genuinely separable (L199, L210). Research vs writing vs review — specialists whose combined output beats one generalist (L343). The coordinator decomposes (L202), delegates to specialists with their own tool surfaces (L204), and aggregates (L206). One agent first is the default (L199) — multi-agent is a cost decision: N loops, N budgets (L149), N attack surfaces (L212).

**Q: What are the multi-agent shapes?**
> A: Three (L210). The coordinator — one agent decomposes and delegates (L202). The pipeline — specialists in sequence, A's output is B's input (L199). The swarm — peers collaborate without a coordinator (L210). The shape follows the task: a project with parts → coordinator; an assembly line → pipeline; peer collaboration → swarm. And the coordinator is the most controllable (L213).

**Q: What makes a specialist a specialist?**
> A: Its tool surface (L204). The research agent sees search and read (L189); the reviewer sees the draft and the rubric (L343). Different surfaces are the specialization — without them, multi-agent is one agent wearing N hats (L210). And the separated surfaces are the security win too: each agent's attack surface (L212) is only its own tools (L315).

**Q: What's the cost of multi-agent?**
> A: N times the single-agent price (L210): N loops is N model calls per step (L150), N budgets (L149), N traces to observe (L213), and N attack surfaces to guard (L212). Plus the coordinator's overhead — the decomposition and aggregation calls (L202, L343). The golden set (L343) has to show the specialization gain beats the coordination cost (L199).

## 11. Follow-Up Questions

- How do you design the delegation contracts (L206)?
- How do the traces join into one view (L213)?
- How do the budgets compose (L149)?
- When is the swarm the right shape (L210)?
- How do you verify the aggregation (L343)?

## 12. Comparison Table — The Three Shapes

| | Coordinator (L210) | Pipeline (L199) | Swarm (L210) |
|---|---|---|---|
| Control | central | sequential | peer-to-peer |
| Coordination (L202) | decompose + delegate | hand off | negotiate |
| Observability (L213) | clear | clear | hardest |
| Failure (L211) | coordinator is the SPOF | one stage blocks | drift hardest to catch |
| Best for | parts + assembly | assembly line | peer collaboration |

The senior read: **the control column is the choice** — more control, more observable; less control, more flexible (L210).

## 13. Code Example — The Coordinator

```js
// Multi-agent: the coordinator pattern (L210).
const SPECIALISTS = {
  research: { tools: ['search_web', 'read_url'],   // its own surface (L204)
              budget: 8_000 },                     // its own budget (L149)
  drafting: { tools: ['write_note'], budget: 6_000 },
  review:   { tools: ['check_rubric'], budget: 4_000 },   // L343
};

async function coordinator(task) {
  // 1 · DECOMPOSE — the coordinator splits the task (L202).
  const parts = await decompose(task);              // { research, drafting, review }

  // 2 · DELEGATE — each specialist runs its own loop (L200, L204).
  const [research, draft, review] = await Promise.all([
    runAgent(parts.research, SPECIALISTS.research),      // L204 — its tools only
    runAgent(parts.drafting, SPECIALISTS.drafting),
    runAgent(parts.review, SPECIALISTS.review),
  ]);

  // 3 · AGGREGATE — verify and assemble (L206, L343).
  const verified = await verify(review.output, { grounded: true });   // L343
  return assemble({ research, draft: verified, review });             // L206
}

// The joined trace: one run view across N agents (L213).
trace.join({ coordinator: task, specialists: [research, draft, review] });
```

```text
What the reader must SEE — the pattern and its prices:

  SPECIALISTS: tools + budget per agent → the specialization (L204, L149)
  decompose() → the delegation plan (L202)
  runAgent per specialist → N loops (L150)
  verify() before assemble → the aggregation check (L343)

  Decompose, delegate with separated surfaces, verify the assembly.
```

```narrate
2-6: The specialists — each with its own tool surface (L204) and budget (L149); the separated surfaces are the specialization (L210).
9-11: Decompose — the coordinator splits the task into delegatable parts (L202).
13-20: Delegate — each specialist runs its own loop with only its tools (L204) and its rails (L209).
21-23: Aggregate — the review output is verified (L343) before the assembly (L206).
25-26: The joined trace — N agents, one run view (L213).
```

> [!TIP]
> The line that justifies the architecture: **`SPECIALISTS.research.tools`** — the separated tool surface. **Different tools are the specialization; without them, multi-agent is just N times the cost (L204, L210).**

## 14. Performance Notes

- **N loops is N times the tokens (L150).** Each specialist's loop is a model-call stream (L145) — the total budget (L149) is the architecture's cost control (L210).
- **Parallel delegation is the latency lever (L151).** Independent specialists run in parallel (L222) — the coordinator's wall-clock is the slowest specialist, not the sum (L210).
- **The coordinator adds calls (L202, L343).** Decomposition and aggregation are model calls (L150) — the coordination overhead is priced into the decision (L199).
- **The joined trace is the observability cost (L213).** N traces joined into one view (L213) — the storage (L150) buys the system-level debuggability (L216).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Specialists all do the same | Overlapping surfaces (L204) | Separate the tools (L212) |
| The assembly is wrong | No aggregation check (L343) | Verify before assembling (L206) |
| A bad specialist's output ships | No verification (L343) | Add the review stage (L210) |
| The system is a black box | Traces not joined (L213) | One run view across agents (L216) |
| Cost explodes | Multi-agent by fashion (L199) | Re-evaluate single-agent (L150) |

## 16. Quick Revision Notes

- Multi-agent = **specialists + coordinator** (L210).
- The pattern: **decompose (L202) → delegate (L204) → aggregate (L206)**.
- Three shapes: **coordinator, pipeline (L199), swarm (L210)**.
- The rule: **one agent first (L199)** — separable expertise earns N loops (L204).
- The cost: **N loops (L150), N budgets (L149), N surfaces (L212)**.
- The traces **join into one view** (L213); the assembly is **verified** (L343).

## 17. Cheat Sheet

```text
MULTI-AGENT SYSTEMS = specialists with a coordinator

THE PATTERN (L210)
  decompose  the coordinator splits the task (L202)
  delegate   each specialist runs its own loop, its own tools (L204)
  aggregate  the results are verified (L343) and assembled (L206)

THE THREE SHAPES (L210)
  coordinator  one agent delegates — control + observability (L213)
  pipeline     specialists in sequence — the L199 line (L199)
  swarm        peers, no coordinator — flexible, least controllable

THE RULE (L199)
  one agent first — a plan (L202) + a scoped surface (L204)
  multi-agent when the expertise is GENUINELY separable (L204)
  the golden set proves the specialization gain (L343)

THE COSTS (L210)
  N loops → N × model calls (L150) · N budgets (L149)
  N attack surfaces (L212) · N traces (L213)
  plus the coordinator's decompose/aggregate calls (L202, L343)

INTERVIEW, 4 MOVES
  1 pattern  "decompose, delegate, aggregate"
  2 shapes   "coordinator, pipeline, swarm (L210)"
  3 rule     "one agent first — separable expertise earns N loops"
  4 costs    "N loops, budgets, surfaces — measured (L343)"
```

## 18. Key Takeaways

> [!RECAP]
> - Multi-agent systems are **specialists with a coordinator** (L210): decompose (L202), delegate to specialists with separated tool surfaces (L204), aggregate and verify (L206, L343)
> - **Three shapes**: the coordinator (one agent delegates), the pipeline (specialists in sequence, L199), and the swarm (peers, no coordinator, L210)
> - **One agent first is the default** (L199) — multi-agent earns its N loops when the expertise is genuinely separable (L204)
> - **The separated tool surfaces are the specialization** (L204) — and the security win: each agent's attack surface is only its own tools (L212, L315)
> - **N agents is N loops** (L150), N budgets (L149), N attack surfaces (L212), and N traces (L213) — the decision is a cost decision
> - The **traces join into one run view** (L213) and the **aggregation is verified** (L343) — the system is observable and accountable as a whole (L216)

## Check your understanding

Answer these without looking back.

1. What's the coordinator pattern (L210)?
2. Name the three shapes (L210).
3. What's the trigger for multi-agent (L199)?
4. Why are separated tool surfaces the specialization (L204)?
5. What are the costs of N agents (L150)?
6. When is the swarm the right shape (L210)?
7. How do the traces join (L213)?
8. How is the aggregation verified (L343)?

## A Closing Note — The Firm, When the Firm Pays

You now hold the multi-agent pattern: **the coordinator's decompose-delegate-aggregate, the separated surfaces that make specialists, and the price — N loops, budgets, and attack surfaces — that the golden set must justify.** One agent first; the firm only when the departments are real.

Next: how the firm breaks — agent failure modes (L211), the ways agents fail in production.
