# Lesson 213 — Agent Observability

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you debug an agent?" — the answer is *the trace*: steps, tool calls, token spend, and the reasoning — the record of a single run, and the input to evals (L343) and audits (L322).**

L211 diagnosed from the trace; this lesson is **the trace itself**: agent observability — recording everything a run does: the steps (L200), the tool calls (L201), the reasoning (L203), the token spend (L149, L332), and the outcomes (L211). Observability serves three masters: **debugging** (the failure diagnosis, L211), **evaluation** (the golden set scores the traces, L343), and **audit** (the run's accountability, L322). The senior design decides *what to record* — and the recording is structured from the start (L213).

The distinction this lesson is built on: a **demo** logs "the agent ran". A **solutions architect** records the *run*: every cycle's decision, tool call, result, reasoning, and cost — structured, joined across agents (L210), and linked to the request (L330) — because an unobservable agent is undebuggable (L211), unevaluable (L343), and unauditable (L322).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the trace: steps, tool calls, reasoning, tokens, outcomes (L213)
- Design what to record: the run's structure, not just its result (L213)
- Explain the three consumers: debugging, evals, audit (L211, L343, L322)
- Explain the joined trace across multi-agent runs (L210)
- Explain the cost: tracing is storage and structure (L150)

## 1. One-Line Definition

**Agent observability is the record of a run — every cycle's decision, tool call, result, reasoning (L203), token spend (L149, L332), and outcome (L211), structured from the start (L213) — serving three consumers: debugging (the failure diagnosis, L211), evaluation (the golden set scores the traces, L343), and audit (the run's accountability, L322) — because an unobservable agent is undebuggable, unevaluable, and unauditable.**

The one-sentence interview answer: *"Agent observability is the structured trace of a run (L213). I record every cycle: the model's decision (L202), the tool call (L201), the result (vetted, L316), the reasoning (L203), the token spend (L149, L332), and the outcome (L211) — linked to the request (L330) and joined across agents in a multi-agent run (L210). Three consumers. Debugging — the failure modes (L211) are diagnosed from the trace's patterns (L213). Evaluation — the golden set scores the traces (L343), and the run's traces feed regression detection (L341). Audit — who did what, with which tools, at what cost (L322). The design decision is *what to record*: the run's structure, not just its result — and the recording is structured from the start, because retrofitting observability is a rewrite (L213)."*

## 2. Mental Model

Think of observability as **the flight recorder on an aircraft — the black box.** The recorder doesn't just record the landing; it records every instrument, every control input, every communication — the whole flight (the run's structure, L213). When something goes wrong, the investigators (debugging, L211) reconstruct the flight from the record. The evaluators (L343) use the record to score every flight. And the auditors (L322) use it to answer "what happened, when, and who decided?" The recorder is the difference between a crash that's a mystery and a crash that's a lesson (L213).

```text
   the flight recorder (L213)        the three consumers
   ┌──────────────────────────┐      ┌────────────────────────────────┐
   │ every cycle:             │      │ debugging — the failure mode    │
   │ decision (L202)          │ ───► │   from the patterns (L211)      │
   │ tool call (L201)         │      │ evals — the golden set scores   │
   │ result (L316)            │      │   the traces (L343)             │
   │ reasoning (L203)         │      │ audit — who/what/when/cost      │
   │ tokens (L149, L332)      │      │   (L322)                        │
   │ outcome (L211)           │      └────────────────────────────────┘
   └──────────────────────────┘
```

The mental model is **the black box**: the whole flight recorded, structured — for the investigators, the evaluators, and the auditors (L213).

## 3. Visual Flow — One Run, Recorded

```text
   a request arrives (L213)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · TRACE THE RUN (L200)                                 │
   │     per cycle: the decision (L202), the tool call        │
   │     (L201), the result (L316), the reasoning (L203)      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · METER THE COST (L149, L332)                          │
   │     tokens per cycle, per tool, total (L150)             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · JOIN THE RUN (L210, L330)                            │
   │     multi-agent: the traces join into one view (L210)    │
   │     linked to the request and the session (L330)         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · SERVE THE CONSUMERS (L211, L343, L322)               │
   │     debugging · evals · audit — the same record          │
   └──────────────────────────────────────────────────────────┘
```

The flow is the recording: **trace the run → meter the cost → join the view → serve the consumers** — one structured record, three masters (L213).

## 4. How It Works — The Record, the Meters, the Consumers

- **The trace (L213).** Per cycle: the model's decision (L202), the proposed tool call (L201), the vetted result (L316), the reasoning (L203), and the outcome (L211). Structured events — not log lines — so the patterns are queryable (L213).
- **The meters (L149, L332).** Token spend per cycle, per tool, per run (L332); latency per cycle (L333); cost per run (L150). The meters are the economics and the failure signals (L211).
- **The join (L210, L330).** Multi-agent runs join into one view (L210); every trace links to its request and session (L330) — the run is a unit, not scattered logs (L213).
- **The consumers (L211, L343, L322).** Debugging reads the patterns (L211); the golden set scores the traces (L343); the audit reads who-what-when-cost (L322). One record, three masters (L213).

> [!NOTE]
> **What to record is the design decision (L213).** "The agent ran" is not observability — the record must contain the run's *structure*: the decisions (L202), the calls (L201), the reasoning (L203), the results (L316), the tokens (L149) — because the consumers need the structure, not the summary (L211). And the recording is designed from the start: retrofitting structure onto unstructured logs is a rewrite (L213). The senior design names the schema before the loop runs (L341) — the trace's shape is the observability's quality (L213).

## 5. Real Project Usage

- **Research agents.** The trace shows every search and its reasoning (L203) — the failure diagnosis (L211) and the eval input (L343).
- **Support agents.** The trace shows the account reads and the gated actions (L208) — the audit record (L322) and the cost attribution (L332).
- **Coding agents.** The trace shows the edits and the test runs (L201) — debugging the wrong-tool failure (L204).
- **Multi-agent systems (L210).** The joined trace shows the coordinator's delegation (L210) and each specialist's work (L213) — one view of the firm (L216).
- **Anything production (L216).** The trace is the run's record — observability is the production baseline (L213).

The through-line: **the trace is the agent's black box** — structured, joined, metered, and served to the three consumers (L213).

## 6. Interview Explanation

Say it in four moves:

1. **The record.** "Per cycle: the decision (L202), the tool call (L201), the result (L316), the reasoning (L203), the tokens (L149)."
2. **The structure.** "Structured events, not log lines — the patterns are queryable (L213)."
3. **The consumers.** "Debugging (L211), evals (L343), audit (L322) — one record, three masters."
4. **The design.** "What to record is decided before the loop runs (L341) — retrofitting is a rewrite (L213)."

## 7. Senior-Level Insights

- **The trace's schema is the observability's quality (L213).** The senior answer names the fields before the loop runs (L341) — the structure is what makes the patterns queryable (L211) and the evals possible (L343).
- **The reasoning is the most valuable field (L203).** The model's thinking (L203) is what the failure diagnosis (L211) and the eval (L343) read — recording only the calls loses the "why" (L213).
- **The meters are the economics (L149, L332).** Token and cost per run (L332) — the trace is where the bill (L150) becomes attributable (L334) and the runaway (L211) becomes visible (L205).
- **The joined trace is the multi-agent view (L210).** N agents, one run (L210) — the join (L330) is what makes the firm debuggable (L216).
- **Observability composes with evals (L343).** The golden set scores the traces (L343) — the trace is the eval's input, and the eval is the trace's consumer (L341).

## 8. Common Mistakes

- **"The agent ran" logging (L213).** A summary, not a trace — the run's structure lost (L211).
- **Results without reasoning (L203).** The calls recorded, the "why" dropped (L213) — the diagnosis can't explain (L211).
- **No meters (L149).** The tokens and cost unrecorded (L332) — the bill unattributable (L334) and the runaway invisible (L205).
- **No join (L210).** Multi-agent logs scattered (L330) — the firm is a black box (L216).
- **Retrofitting (L213).** The structure added after the fact — the rewrite the design avoided (L341).
- **Traces unserved (L343).** The record exists, the evals never read it (L341) — the loop unmeasured (L211).

## 9. Best Practices

- **Design the trace schema first** (L213, L341) — the fields before the loop (L200).
- **Record the reasoning** (L203) — the "why" is the diagnosis's and the eval's raw material (L211, L343).
- **Meter the tokens and cost** (L149, L332) — per cycle, per tool, per run (L334).
- **Join the run** (L210, L330) — multi-agent, one view, linked to the request (L213).
- **Serve the three consumers** (L211, L343, L322) — one record, three masters.
- **Eval the traces** (L341) — the golden set reads the record (L343).

## 10. Interview Questions

**Q: How do you observe an agent?**
> A: A structured trace of the run (L213). Every cycle: the model's decision (L202), the tool call (L201), the vetted result (L316), the reasoning (L203), the token spend (L149, L332), and the outcome (L211). Joined across agents (L210) and linked to the request (L330). The record serves three consumers: debugging (L211), the golden set (L343), and the audit (L322).

**Q: What's the most important thing to record?**
> A: The reasoning (L203). The model's "why" — the thinking that led to each decision — is what the failure diagnosis reads (L211: why did it pick that tool?) and what the eval scores (L343: was the decision good?). Recording only the calls loses the why (L213). The calls are what happened; the reasoning is why — both belong in the trace (L213).

**Q: How do you observe a multi-agent system?**
> A: The joined trace (L210). Each specialist records its own run (L213), and the traces join into one view — the coordinator's delegation (L210), each agent's cycles, the total cost (L149) — linked by the run ID (L330). N agents, one black box (L216). Without the join, the firm is a collection of unrelated logs (L213).

**Q: How does observability feed the evals?**
> A: The golden set scores the traces (L343). Each run's record — the decisions, the outcomes (L211) — is the eval's input (L341): did the loop choose well? Did it complete (L205)? What did it cost (L150)? The trace is the eval's raw material, and the eval is the trace's consumer — the loop is measured because it's recorded (L213, L343).

## 11. Follow-Up Questions

- What's in the trace schema (L213)?
- Why record the reasoning (L203)?
- How do you meter the tokens (L332)?
- How do the traces join in a multi-agent run (L210)?
- How do evals consume the traces (L343)?

## 12. Comparison Table — Log Lines vs Trace

| | Log lines (L213) | Trace (this lesson) |
|---|---|---|
| Structure | free text | events with fields (L213) |
| Reasoning (L203) | dropped | recorded (L203) |
| Meters (L149) | absent | tokens, cost per run (L332) |
| Join (L210) | scattered | one view (L330) |
| Consumers (L211, L343, L322) | hard to serve | queryable, scoreable |
| Design (L341) | retrofitted | schema first (L213) |

The senior read: **the right column is the black box** — structured from the start, served to all three masters (L213).

## 13. Code Example — The Trace

```js
// Agent observability: the structured trace (L213, L341).
const trace = {                                  // the schema, designed first (L341)
  runId, sessionId,                             // the join keys (L330)
  startedAt, task,
  cycles: [],                                    // every cycle (L200)
  totals: { tokens: 0, cost: 0, latencyMs: 0 },  // the meters (L149, L332)
};

// The loop records each cycle (L200, L213).
for (const step of loop) {
  const cycle = {
    step,
    decision: response.reasoning,               // the WHY (L203)
    toolCall: call,                             // what it proposed (L201)
    result: vettedResult,                       // what it got (L316)
    tokens: response.usage,                     // the cost (L332)
    outcome: outcome,                           // done / failed / escalated (L211)
  };
  trace.cycles.push(cycle);                     // the record (L213)
  trace.totals.tokens += response.usage;        // the meters (L149)
  trace.totals.cost += costOf(response.usage);
}

// The consumers (L211, L343, L322):
//   debugging — the patterns in trace.cycles (L211)
//   evals     — scoreTrace(trace) on the golden set (L343)
//   audit     — who, what, when, cost (L322)
await persistTrace(trace);                       // joined, queryable (L330)
```

```text
What the reader must SEE — the record's structure:

  decision: reasoning   → the why (L203)
  toolCall + result     → what it did and got (L201, L316)
  tokens + cost         → the meters (L149, L332)
  outcome               → the result (L211)
  runId + sessionId     → the join (L330)

  One structured record, three consumers.
```

```narrate
2-6: The trace schema — designed before the loop: the join keys (L330), the cycles, and the totals (L341).
9-17: Each cycle is recorded — the reasoning (L203), the call (L201), the vetted result (L316), the tokens (L332), and the outcome (L211).
18-21: The meters accumulate — the run's tokens and cost (L149, L150).
23-27: The consumers — debugging reads the patterns (L211), the evals score the trace (L343), the audit reads the record (L322).
28: The trace is persisted, joined, queryable (L213).
```

> [!TIP]
> The field that makes the trace valuable: **`decision: response.reasoning`** — the "why" recorded alongside the "what". **The calls are what happened; the reasoning is why — the black box needs both (L203, L213).**

## 14. Performance Notes

- **The trace is a storage cost (L150).** Every cycle recorded (L213) — structured storage (L330), retained per policy (L322), sized by the run volume (L150).
- **The meters are free (L149).** Token counts (L332) and timestamps ride along (L333) — the economics' data at zero marginal cost (L213).
- **The reasoning is the expensive field (L203).** The model's reasoning tokens (L149) are already spent; recording them is storage only (L150).
- **The trace is the eval's input (L343).** Scoring the traces (L343) is a CI cost (L341) — the golden set reads the same record the debugging reads (L213).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| A failure with no explanation | Reasoning not recorded (L203) | Add decision to the trace (L213) |
| The bill unattributable | No meters (L149) | Token + cost per run (L332) |
| Multi-agent black box | Traces not joined (L210) | Join by run ID (L330) |
| Evals can't run | Traces unstructured (L343) | Schema-first tracing (L341) |
| No audit trail | Record unpersisted (L322) | Persist + retain (L213) |

## 16. Quick Revision Notes

- Observability = **the structured trace of the run** (L213).
- The record: **decision (L202), call (L201), result (L316), reasoning (L203), tokens (L149), outcome (L211)**.
- The meters: **tokens and cost per run** (L332, L150).
- The join: **multi-agent, one view** (L210, L330).
- The consumers: **debugging (L211), evals (L343), audit (L322)**.
- The design: **schema first** (L341) — retrofitting is a rewrite (L213).

## 17. Cheat Sheet

```text
AGENT OBSERVABILITY = the black box of the run

THE RECORD (L213) — per cycle
  decision   the model's choice (L202)
  reasoning  the WHY (L203) — the most valuable field
  toolCall   what it proposed (L201)
  result     what it got — vetted (L316)
  tokens     the cost (L149, L332)
  outcome    done · failed · escalated (L211)

THE METERS (L149, L332)
  tokens and cost per cycle, per tool, per run (L150, L334)
  latency per cycle (L333)

THE JOIN (L210, L330)
  multi-agent traces → one run view (L210)
  every trace linked to its request and session (L330)

THE CONSUMERS (L213)
  debugging — the failure patterns (L211)
  evals     — the golden set scores the traces (L343)
  audit     — who, what, when, cost (L322)

THE DESIGN (L341)
  the schema is designed before the loop runs (L213)
  retrofitting structure is a rewrite (L341)

INTERVIEW, 4 MOVES
  1 record  "decision, call, result, reasoning, tokens, outcome"
  2 structure "events, not log lines — queryable (L213)"
  3 join    "multi-agent, one view (L210, L330)"
  4 consumers "debugging, evals, audit (L211, L343, L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent observability is **the structured trace of the run** (L213): every cycle's decision (L202), tool call (L201), vetted result (L316), reasoning (L203), tokens (L149), and outcome (L211)
> - **The reasoning is the most valuable field** (L203) — the "why" is what the failure diagnosis (L211) and the evals (L343) read
> - **The meters make the economics visible** (L149, L332) — tokens and cost per run (L150), attributable (L334), and the runaway becomes visible (L205)
> - **Multi-agent runs join into one view** (L210, L330) — the firm is one black box, not scattered logs (L216)
> - **Three consumers, one record** (L213): debugging (L211), the golden set (L343), and the audit (L322)
> - **The schema is designed before the loop** (L341) — the trace's shape is the observability's quality, and retrofitting is a rewrite (L213)

## Check your understanding

Answer these without looking back.

1. What's in the trace per cycle (L213)?
2. Why is the reasoning the most valuable field (L203)?
3. What do the meters record (L332)?
4. How do multi-agent traces join (L210)?
5. What are the three consumers (L213)?
6. Why is the schema designed first (L341)?
7. How do the evals consume the traces (L343)?
8. What does the audit read (L322)?

## A Closing Note — The Black Box That Makes the Loop Measurable

You now hold the flight recorder: **the structured trace — decisions, reasoning, calls, results, tokens, outcomes — joined into one view and served to debugging, evals, and audit.** The loop is no longer a mystery; it's a record.

Next: the frameworks that implement it all — LangChain (L214), where the toolbox helps and where it hides.
