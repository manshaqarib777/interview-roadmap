# Lesson 231 — Multi-Agent Automation

**Interview importance:** ⭐⭐⭐⭐⭐ — "agents inside workflows?" — the answer is *the sub-loop*: when a workflow step runs an agent, bounded by the workflow's discipline (L200, L205) — the L210 pattern inside the L230 platform.**

L230 built the platform; this lesson is **the loop inside the line**: multi-agent automation — when a workflow step (L217) runs an agent loop (L200): the agent as a step with a contract (L163), bounded by the workflow's discipline (L205, L222). The pattern: the workflow's judgment steps become agents (L202) when the judgment is open-ended (L199) — and the agents inherit the platform's rails (L209), gates (L228), queue (L222), and record (L213) (L231).

The distinction this lesson is built on: a **demo** embeds a chat in a workflow. A **solutions architect** treats the agent as a first-class step: the contract (the agent's input and output, L163), the budget (the loop's steps, L205), the gates (the agent's consequential actions, L228), and the trace (the agent's run, L213) — the L210 pattern inside the L230 platform (L231).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the sub-loop: an agent as a workflow step (L231)
- Define the agent step's contract: input, output, budget (L163, L205)
- Explain the bounded loop: the agent inherits the workflow's discipline (L205)
- Explain the gates: the agent's consequential actions wait (L228)
- Explain the trace: the agent's run in the workflow's record (L213)

## 1. One-Line Definition

**Multi-agent automation is the sub-loop — an agent as a first-class workflow step (L231): the judgment steps become agent loops (L200) when the judgment is open-ended (L199), with a defined contract (the input, the output, L163), a bounded budget (the loop's steps and tokens, L205, L149), the platform's gates (the consequential actions wait, L208, L228), and the workflow's record (the agent's run traced, L213) — the L210 pattern inside the L230 platform (L231).**

The one-sentence interview answer: *"Multi-agent automation is the agent as a workflow step (L231). The L199 decision, per step: a *judgment* step is a model call when the judgment is narrow (L163) — and an *agent loop* (L200) when it's open-ended (L199): a research step that searches, reads, and synthesizes (L203). The agent is a first-class step with a contract (L163): the input the workflow hands it, the output it returns (L143). And it inherits the platform's discipline: the budget — the loop's steps and tokens are bounded (L205, L149); the gates — the agent's consequential actions wait for the human (L208, L228); the queue — the agent runs on the engine room (L222); and the record — the agent's cycles join the workflow's trace (L213). The agent is the L210 pattern inside the L230 platform (L231)."*

## 2. Mental Model

Think of multi-agent automation as **the expert called into the assembly line.** The line (the workflow, L217) is running its stations; one station's work is too open-ended for the standard machine — "research this exception and recommend the fix" — so the line calls in an expert (the agent, L200). The expert works in a side room (the sub-loop, L231): the line hands in the brief (the contract's input, L163), the expert works (the loop, L200), and returns the memo (the output, L143). The expert's work is bounded — the brief says "two hours max" (the budget, L205), the risky actions need the manager's sign-off (the gates, L228), and the side room's work is logged in the line's ledger (the record, L213). The line works because the expert is a station — bounded, gated, and recorded like any other (L231).

```text
   the line (the workflow, L217)          the side room (the agent, L200)
   ┌──────────────────────────┐           ┌──────────────────────────────┐
   │ station → [EXPERT] →     │  ──────►  │ the loop (L200), bounded      │
   │ the next station (L217)  │           │ (L205), gated (L228),        │
   │ the brief in (L163)      │           │ traced (L213)                │
   │ the memo out (L143)      │           └──────────────────────────────┘
   └──────────────────────────┘
```

The mental model is **the expert on the line**: a station like any other — with a contract, a budget, gates, and a record (L231).

## 3. Visual Flow — The Agent Step

```text
   the workflow reaches an open-ended step (L217, L199)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE CONTRACT (L163)                                  │
   │     the workflow hands the agent its input (L143) and    │
   │     defines the output it must return (L163)             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE LOOP (L200)                                      │
   │     the agent works — perceive, decide, act, observe     │
   │     (L200) — bounded by the budget (L205, L149)          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE GATES (L228)                                     │
   │     the agent's consequential actions wait for the       │
   │     human (L208) — the platform's gates inside the loop  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE OUTPUT + THE RECORD (L143, L213)                 │
   │     the memo returns to the line (L217) — the agent's    │
   │     cycles join the workflow's trace (L213)              │
   └──────────────────────────────────────────────────────────┘
```

The flow is the sub-loop: **contract → loop → gates → output + record** — the expert, as a station (L231).

## 4. How It Works — The Contract, the Budget, the Gates, the Record

- **The contract (L163).** The agent is a step (L217) with a defined contract: the input the workflow hands it (L143) and the output it must return (L163). The contract is what makes the agent composable (L230) and testable (L341).
- **The budget (L205, L149).** The agent's loop is bounded like any loop (L205): the max steps and the token ceiling (L149) — the L205 stop conditions inside the workflow (L231).
- **The gates (L228).** The agent's consequential actions wait for the human (L208) — the platform's approval gates (L228) inside the loop (L231). The agent proposes; the human approves (L208).
- **The queue (L222).** The agent runs on the engine room (L222) — the sub-loop is a job on the queue (L222), never inline (L231).
- **The record (L213).** The agent's cycles join the workflow's trace (L213) — the sub-loop is observable (L231), auditable (L322), and recoverable (L232).

> [!NOTE]
> **The agent is a step, not a special case (L231).** The senior design treats the agent as a first-class workflow step (L217): it has a contract (L163), a budget (L205), gates (L228), and a record (L213) like any step (L231). The discipline that governs the workflow (L217) governs the loop (L200): the agent is bounded (L205), its consequential actions are gated (L208), and its work is traced (L213). The L210 pattern (multi-agent) inside the L230 platform (L230) — the sub-loop is the L199 decision applied to the step: narrow judgment → a model call (L163), open-ended judgment → the agent (L200, L231).

## 5. Real Project Usage

- **Support exceptions (L231).** The triage workflow (L217) hits an open-ended case — the agent step (L200) researches the account (L189) and drafts the resolution (L203); the refund is gated (L228).
- **Research tasks (L231).** The enrichment workflow's research step (L223) is an agent loop (L200) — the searches and the synthesis (L203), bounded by the budget (L205).
- **Dispute resolution (L231).** The finance workflow's dispute step (L217) is an agent — gathering the evidence (L189), drafting the assessment (L203), with the resolution gated (L228).
- **Code reviews (L231).** The CI workflow's review step (L217) is an agent — reading the diff (L177), drafting the comments (L203), with the merge gated (L228).
- **Anything open-ended (L230).** The agent step is the L230 platform's open-ended station (L231) — the L210 pattern, inside the line (L230).

The through-line: **the expert on the line** — the agent as a bounded, gated, traced step inside the workflow (L231).

## 6. Interview Explanation

Say it in four moves:

1. **The step.** "The agent is a first-class workflow step (L217) with a contract (L163)."
2. **The trigger.** "Open-ended judgment → the agent loop (L200); narrow judgment → a model call (L163) — the L199 decision per step (L231)."
3. **The discipline.** "The budget (L205), the gates (L228), the queue (L222), the record (L213) — the agent inherits the platform's."
4. **The pattern.** "The L210 sub-loop inside the L230 platform (L231)."

## 7. Senior-Level Insights

- **The contract is the composability (L163).** The agent's input and output (L143) are defined like any step's (L217) — the contract is what makes the agent swappable (L155) and testable (L341) (L231).
- **The L199 decision is per step (L199).** The senior answer doesn't make every judgment step an agent (L231) — the narrow ones are model calls (L163, cheaper, L150), the open-ended ones are loops (L200, L199) — the L199 rule applied at the step level (L230).
- **The budget is the loop's boundary (L205).** The agent step's max steps and tokens (L149) are the L205 stop conditions (L205) — the sub-loop is bounded like any loop (L231).
- **The gates are the platform's trust (L228).** The agent's consequential actions wait for the human (L208) — the platform's approval layer (L228) inside the loop (L231).
- **The trace is the sub-loop's record (L213).** The agent's cycles join the workflow's trace (L213) — the L210's joined traces (L210) inside the L230's record (L230).

## 8. Common Mistakes

- **The chat in the workflow (L231).** An embedded chat with no contract (L163) — no defined input or output (L143), uncomposable (L230).
- **Every judgment an agent (L199).** The narrow steps as loops (L200) — the model call (L163) is cheaper (L150); the loop's discipline (L205) is overhead for a one-call judgment (L231).
- **The unbounded loop (L205).** The agent step with no budget (L149) — the runaway (L211) inside the workflow (L231).
- **The agent's actions ungated (L228).** The consequential actions running inside the loop (L208) — the platform's gates bypassed (L231).
- **The agent inline (L222).** The sub-loop running in the trigger (L151) — the queue (L222) bypassed (L231).
- **The agent's work untraced (L213).** The cycles invisible in the record (L322) — the sub-loop unobservable (L231).

## 9. Best Practices

- **Define the agent's contract** (L163) — the input (L143) and the output (L163).
- **Apply the L199 decision per step** (L199) — narrow → the model call (L163), open-ended → the agent (L200).
- **Bound the loop** (L205) — max steps and tokens (L149).
- **Gate the consequential** (L228) — the agent's actions wait (L208).
- **Run on the queue** (L222) — the sub-loop is a job (L231).
- **Trace the cycles** (L213) — the agent joins the workflow's record (L322).

## 10. Interview Questions

**Q: How do agents fit into workflows?**
> A: As a first-class step (L231). When a workflow's judgment step is open-ended (L199) — research an exception, draft a resolution — the step is an agent loop (L200) instead of a single model call (L163). The agent has a contract (L163): the input the workflow hands it (L143) and the output it returns. And it inherits the platform's discipline — the budget (L205), the gates (L228), the queue (L222), and the record (L213).

**Q: When is a step an agent, not a model call?**
> A: The L199 decision, per step (L199). A narrow judgment — extract the fields, classify the case — is a model call with a contract (L163): cheap (L150) and fast (L151). An open-ended judgment — research and recommend, investigate and draft — is an agent loop (L200): the steps depend on the findings (L203). The model call is the default; the agent is for the genuinely open-ended steps (L231).

**Q: How do you bound the agent step?**
> A: The L205 budget (L205). The sub-loop has max steps and a token ceiling (L149) — the stop conditions of the L205 lesson, applied inside the workflow (L231). The workflow can't have a runaway loop (L211) — the budget is part of the step's contract (L163), and the loop ends by design (L205).

**Q: How do the gates work inside the agent?**
> A: The platform's approval layer, inside the loop (L228). When the agent proposes a consequential action — a refund, a publish — the action waits for the human (L208): the agent proposes, the human approves (L228), and the loop resumes (L231). The agent is a step, not a special case — the trust control applies inside it too (L230).

## 11. Follow-Up Questions

- What's the agent step's contract (L163)?
- When is a step an agent vs a model call (L199)?
- How do you bound the loop (L205)?
- How do the gates apply inside the agent (L228)?
- How does the trace capture the cycles (L213)?

## 12. Comparison Table — Model Call vs Agent Step

| | Model call (L163) | Agent step (this lesson) |
|---|---|---|
| Judgment (L199) | narrow | open-ended (L200) |
| Structure | one call | the loop (L200) |
| Cost (L150) | one generation | N cycles (L205) |
| Contract (L163) | input/output | input/output + budget (L205) |
| Gates (L228) | n/a | the consequential waits (L208) |
| Record (L213) | the call | the cycles (L231) |

The senior read: **the L199 column is the choice** — the narrow judgment is a call, the open-ended is the loop (L231).

## 13. Code Example — The Agent Step

```js
// Multi-agent automation: the agent as a workflow step (L231).
const workflow = {
  steps: [
    { id: 'triage',      kind: 'judgment', run: classifyCase },   // L163 — one call
    { id: 'investigate', kind: 'agent',    run: agentStep },      // L200 — the sub-loop
    { id: 'refund',      kind: 'risk',     run: approvalGate },   // L228 — the gate
    { id: 'notify',      kind: 'rule',     run: notifyCustomer }, // L199
  ],
};

// THE AGENT STEP (L231) — a contract, a budget, a record (L163, L205, L213).
async function agentStep(input, ctx) {
  // THE CONTRACT (L163): the workflow's input → the agent's output (L143).
  const brief = { task: input.task, context: input.account };     // in (L163)
  const { output, cycles } = await runAgent(brief, {
    maxSteps: 8, tokenBudget: 12_000,                             // L205, L149
    onConsequential: (proposal) => approvalGate(proposal, ctx),   // L228 — the gates
  });
  ctx.trace.push({ step: 'investigate', cycles });                // L213 — the record
  return output;                                                  // out (L143)
}

// THE QUEUE (L222) — the sub-loop runs on the engine room (L231).
await queue.enqueue({ type: 'workflow.run', workflow, event });
```

```text
What the reader must SEE — the expert, as a station:

  kind: 'agent'        → the sub-loop step (L231)
  brief in / output out → the contract (L163, L143)
  maxSteps + tokenBudget → the loop's bounds (L205, L149)
  onConsequential → gate → the platform's trust inside (L228)
  cycles → the trace  → the record (L213)

  The agent is a step — bounded, gated, traced, queued.
```

```narrate
2-7: The workflow — the judgment step is one call (L163), the open-ended step is the agent (L200), the risk step is gated (L228), the notify is a rule (L199).
10-13: The contract — the workflow's input is the agent's brief (L163, L143).
14-17: The bounds — the loop's max steps and token budget (L205, L149).
18: The gates — the agent's consequential proposals wait for the human (L208, L228).
19-21: The record — the cycles join the workflow's trace (L213), and the output returns (L143).
23-24: The queue — the whole workflow, agent included, runs on the engine room (L222).
```

> [!TIP]
> The pair that makes the agent a step: **`maxSteps: 8`** (the bound, L205) and **`onConsequential: (proposal) => approvalGate(...)`** (the gates, L228). **The expert is on the line — bounded and gated like every station (L231).**

## 14. Performance Notes

- **The agent is the expensive step (L150).** The sub-loop's N cycles (L205) are the workflow's biggest token spend (L149) — the budget (L205) is the cost control (L231).
- **The sub-loop runs on the queue (L222).** The agent is a job (L222) — the workflow's latency story includes the loop's wall-clock (L151).
- **The gates are the human's latency (L151).** The agent's consequential actions wait (L208) — the approval time is in the sub-loop's wall-clock (L228).
- **The trace is the observability (L213).** The agent's cycles in the record (L213) — the sub-loop's debugging (L211) and the audit (L322) read the same trace (L231).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The agent step is a black box | No trace of the cycles (L213) | Record the sub-loop (L231) |
| The loop runs away | No budget (L205) | Max steps + tokens (L149) |
| Consequential actions run | The gates bypassed (L228) | The onConsequential hook (L208) |
| The workflow hangs | The agent inline (L222) | The queue (L222) |
| The agent can't compose | No contract (L163) | The input and output (L143) |

## 16. Quick Revision Notes

- Multi-agent automation = **the agent as a workflow step** (L231).
- The trigger: **open-ended judgment → the loop (L200); narrow → the call (L163)** — the L199 decision per step (L231).
- The contract: **the input and the output** (L163, L143).
- The bounds: **max steps + tokens** (L205, L149).
- The gates: **the consequential waits for the human** (L208, L228).
- The record: **the cycles join the workflow's trace** (L213).

## 17. Cheat Sheet

```text
MULTI-AGENT AUTOMATION = the sub-loop inside the line

THE PATTERN (L231)
  the agent is a first-class workflow step (L217)
  the L199 decision per step (L199):
    narrow judgment → a model call (L163) — cheap (L150)
    open-ended judgment → the agent loop (L200)

THE STEP'S CONTRACT (L163, L143)
  the input the workflow hands it · the output it returns
  the contract makes the agent composable (L230) and testable (L341)

THE DISCIPLINE (L231) — inherited from the platform
  budget   max steps + tokens (L205, L149) — ends by design (L205)
  gates    the consequential actions wait for the human (L208, L228)
  queue    the sub-loop is a job on the engine room (L222)
  record   the cycles join the workflow's trace (L213, L322)

THE RULE
  the agent is a step, not a special case (L231)
  the L210 pattern inside the L230 platform (L230)

INTERVIEW, 4 MOVES
  1 step    "the agent as a workflow step with a contract (L231, L163)"
  2 trigger "open-ended → loop · narrow → call (L199)"
  3 bounds  "max steps + tokens (L205, L149)"
  4 record  "the cycles traced (L213) · the gates applied (L228)"
```

## 18. Key Takeaways

> [!RECAP]
> - Multi-agent automation is **the agent as a first-class workflow step** (L231) — the L210 pattern inside the L230 platform (L230)
> - **The trigger is the L199 decision per step** (L199): narrow judgment → a model call (L163, cheaper, L150); open-ended judgment → the agent loop (L200)
> - **The agent has a contract** (L163) — the input the workflow hands it (L143) and the output it returns — making it composable (L230) and testable (L341)
> - **The loop is bounded** (L205) — max steps and a token ceiling (L149), the L205 stop conditions inside the workflow (L231)
> - **The platform's gates apply inside the loop** (L228) — the agent's consequential actions wait for the human (L208)
> - **The cycles join the workflow's record** (L213) — the sub-loop is observable (L213), auditable (L322), and runs on the queue (L222)

## Check your understanding

Answer these without looking back.

1. What's the sub-loop pattern (L231)?
2. When is a step an agent vs a model call (L199)?
3. What's the agent step's contract (L163)?
4. How do you bound the loop (L205)?
5. How do the gates apply inside the agent (L228)?
6. Where does the sub-loop run (L222)?
7. How is the agent traced (L213)?
8. Why is the agent a step, not a special case (L230)?

## A Closing Note — The Expert on the Line

You now hold the sub-loop: **the open-ended steps as bounded, gated, traced agents — with contracts that make them compose and budgets that keep them sane.** The line now calls in experts where the work is open-ended — and they work like every station (L231).

Next: when the line breaks — automation failure & recovery (L232), idempotency, dead letters, and the rerun story.
