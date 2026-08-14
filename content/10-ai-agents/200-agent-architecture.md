# Lesson 200 — Agent Architecture (the Loop)

**Interview importance:** ⭐⭐⭐⭐⭐ — "draw an agent's architecture" — the diagram is *perceive → decide → act → observe*, plus the four boundaries: context budget (L149), stop conditions (L205), execution authority (L212), and the trace (L213).**

L198–199 defined the agent and when to use it. This lesson is the **diagram**: agent architecture — the loop (perceive → decide → act → observe) plus the boundaries that make it production: the **context** (what the model sees, L138, L206), the **stop conditions** (when it ends, L205), the **execution authority** (what it's allowed to do, L212, L315), and the **trace** (what it did, L213). This is the picture you draw in interviews — and the map every later lesson hangs off (L201–216).

The distinction this lesson is built on: a **demo** has a while loop with a tool call. A **solutions architect** draws the loop *and its boundaries* — the four boxes around the cycle that make it safe, bounded and explainable — and can explain what happens at each boundary when things go wrong (L211).

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the loop: perceive → decide → act → observe (L200)
- Place the four boundaries: context, stop, authority, trace (L200)
- Explain the context boundary: what the model sees, budgeted (L149, L206)
- Explain the stop and authority boundaries: when it ends, what it may do (L205, L212)
- Map every later lesson onto the diagram (L201–216)

## 1. One-Line Definition

**Agent architecture is the loop and its four boundaries — the cycle perceive → decide → act → observe, wrapped by the context boundary (what the model sees, budgeted, L149, L206), the stop boundary (when the loop ends, L205), the authority boundary (what the loop may execute, L212, L315), and the trace boundary (what the loop did, L213) — the diagram that maps every agent lesson (L201–216).**

The one-sentence interview answer: *"Agent architecture is the loop plus four boundaries (L200). The loop: perceive — the model reads the context (L138); decide — a tool call or an answer; act — the system executes (L212); observe — the result joins the context. The four boundaries make it production. Context: what the model sees each cycle, inside the token budget (L149, L206). Stop: max steps, budget, task-done — the loop ends by design (L205). Authority: the tools are scoped and gated (L212, L315) — the system executes what the policy allows. Trace: every step, tool call, and token is logged (L213) — the loop is explainable. Draw the cycle, name the four boundaries, and every lesson from L201 to L216 is a box in the diagram."*

## 2. Mental Model

Think of the agent as **a worker in a well-run office: the desk, the mandate, the budget, and the log.** The desk is the context — the papers the worker can see at any moment (the model's view, L138), and it only holds so much (the budget, L149). The mandate is the authority — what the worker is allowed to do (which tools, which actions, L212). The budget is the stop conditions — the worker works until the job is done or the budget runs out (L205). The log is the trace — every action recorded, so the work is explainable and auditable (L213). The office works because the desk is organized, the mandate is clear, the budget is real, and the log is kept.

```text
   THE LOOP (L200)                     THE FOUR BOUNDARIES (L200)
   ┌─────────────────────┐             ┌──────────────────────────────┐
   │  perceive (L138)    │             │ context  — the desk (L149)   │
   │      ▼              │             │ stop     — the budget (L205) │
   │  decide (L202)      │  wrapped    │ authority — the mandate (L212)│
   │      ▼              │  by →       │ trace    — the log (L213)    │
   │  act (L201, L212)   │             └──────────────────────────────┘
   │      ▼              │
   │  observe (L164)     │
   └─────────────────────┘
```

The mental model is **worker + office**: the cycle is the work, and the four boundaries are the office's rules that keep the work safe, bounded, and explainable.

## 3. Visual Flow — The Full Diagram

```text
   ┌───────────────────────────────────────────────────────────────┐
   │  THE LOOP (L200)                                              │
   │                                                               │
   │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐ │
   │   │ PERCEIVE │ → │ DECIDE   │ → │ ACT      │ → │ OBSERVE │ │
   │   │ read the │    │ tool or  │    │ system   │    │ result  │ │
   │   │ context  │    │ answer   │    │ executes │    │ joins   │ │
   │   │ (L138)   │    │ (L202)   │    │ (L212)   │    │ context │ │
   │   └──────────┘    └──────────┘    └──────────┘    └────┬────┘ │
   │        ▲                                                │     │
   │        └────────────────────────────────────────────────┘     │
   └───────────────────────────────────────────────────────────────┘
   wrapped by the four boundaries:
   ┌───────────────────────────────────────────────────────────────┐
   │ CONTEXT (L149, L206)  what the model sees — budgeted, curated │
   │ STOP (L205)           max steps · budget · task-done detection│
   │ AUTHORITY (L212, L315) tools scoped + gated — least privilege │
   │ TRACE (L213)          every step, call, token — logged        │
   └───────────────────────────────────────────────────────────────┘
```

The diagram is the lesson: **the cycle in the middle, the four boundaries around it** — and every later lesson (L201–216) fills in one box.

## 4. How It Works — The Cycle and the Four Boundaries

- **The cycle (L200).** Perceive — the model reads the context (L138). Decide — the model proposes the next action: a tool call (L144) or a final answer (L202). Act — the *system* executes the tool with authority checks (L201, L212). Observe — the result is appended to the context (L164). Repeat.
- **The context boundary (L149, L206).** The model sees a budgeted window: system + tools + the curated conversation + the latest results (L206). The budget (L149) is the constraint; curation (L206) is the lever — a long loop must summarize or drop old context (L207).
- **The stop boundary (L205).** The loop ends by design: max steps, token budget, task-done detection, or a guardrail trigger (L209). Without it, the loop spins (L211).
- **The authority boundary (L212, L315).** The tools are scoped (least privilege, L315), gated (human approval for risky ones, L208), and executed by the system under policy (L212). The model proposes; the policy disposes (L201).
- **The trace boundary (L213).** Every cycle is logged — the decision, the tool call, the result, the tokens (L332). The trace is the loop's memory for debugging (L211) and evaluation (L343).

> [!NOTE]
> **The four boundaries are what make the loop an architecture (L200).** The cycle alone is a script — it can spin (L205), leak (L212), overflow (L149), and vanish without a trace (L213). The boundaries are the production wrap: the context boundary budgets what the model sees (L149), the stop boundary ends the loop by design (L205), the authority boundary scopes what it may do (L212), and the trace boundary records what it did (L213). An architect draws all five — the cycle and its wrap (L216).

## 5. Real Project Usage

- **Research agent.** Context boundary: the search results so far (L206). Stop: answer found or steps exhausted (L205). Authority: read-only search tools (L315). Trace: the search history (L213).
- **Support agent.** Context: the ticket + the KB results (L189). Authority: read the account, draft the reply — approval for refunds (L208). Stop: resolution drafted (L205).
- **Coding agent.** Context: the files read so far (L177). Authority: read/edit/test within the repo — no prod access (L315). Trace: the edit history (L213).
- **Automation workflows (L230).** The agentic fork inside the workflow — the same four boundaries inside the branch (L217).
- **Any agent (L216).** The diagram is constant: the cycle and the four boundaries — content changes, the architecture doesn't (L200).

The through-line: **the diagram is the module's map** — every lesson from L201 to L216 fills in one part of the cycle or one of its boundaries.

## 6. Interview Explanation

Say it in four moves:

1. **The cycle.** "Perceive → decide → act → observe — the model reads context, proposes an action, the system executes it, the result feeds back (L200)."
2. **The context.** "The model sees a budgeted window — system, tools, curated history, latest results (L149, L206)."
3. **The stop and authority.** "The loop ends by design — max steps, budget, task-done (L205). The tools are scoped and gated — least privilege (L212, L315)."
4. **The trace.** "Every cycle is logged (L213) — the loop is explainable and evaluable (L343)."

## 7. Senior-Level Insights

- **The boundaries are the architecture (L200).** The senior answer draws the cycle and *then* the wrap — the demo stops at the cycle. The four boundaries are where production lives (L216).
- **The context is a moving window (L149, L206).** The model's view shrinks and curates as the loop runs (L206) — the senior design manages the window (L207), not just the steps (L205).
- **Authority is least privilege, enforced (L212, L315).** Scoped tools, gated actions, human approval at the risk threshold (L208) — the authority boundary is the security posture (L212).
- **The trace is the eval's input (L213, L343).** The golden set scores the loop's traces (L343) — the trace boundary makes the agent *testable* (L341), not just debuggable (L211).
- **The diagram maps the module (L216).** Every lesson is a box: planning (L202) fills "decide"; tools (L201) fill "act"; memory (L206) fills "perceive"; observability (L213) fills the trace — the diagram is the module's table of contents (L216).

## 8. Common Mistakes

- **The cycle without the wrap (L200).** The while loop with no boundaries (L211) — it spins (L205), leaks (L212), overflows (L149), and vanishes (L213).
- **No stop conditions (L205).** The loop ends when the budget dies, not by design (L211).
- **Unbounded context (L149).** Every result kept forever — the window overflows (L138), the loop degrades (L206).
- **Unscoped tools (L212).** The full tool surface exposed (L315) — the excessive-agency failure (L212).
- **No trace (L213).** The loop that fails without a record (L211) — debugging and evals both blind (L343).
- **The model executing (L201).** The model running tools itself — the authority boundary broken (L212).

## 9. Best Practices

- **Draw the cycle and the four boundaries** (L200) — before any code (L216).
- **Budget the context** (L149, L206) — the model sees a curated window (L138).
- **Design the stop conditions** (L205) — max steps, budget, task-done, guardrail triggers (L209).
- **Scope and gate the tools** (L212, L315) — least privilege, approval at the risk threshold (L208).
- **Trace every cycle** (L213) — steps, calls, results, tokens (L332).
- **Eval the traces** (L343) — the golden set scores the loop (L341).

## 10. Interview Questions

**Q: Draw an agent's architecture.**
> A: The loop plus four boundaries (L200). The loop: perceive — the model reads the context (L138); decide — a tool call or an answer; act — the system executes with authority checks (L212); observe — the result joins the context (L164). The boundaries: context — a budgeted, curated window (L149, L206); stop — max steps, budget, task-done (L205); authority — scoped, gated tools, least privilege (L315); trace — every cycle logged (L213).

**Q: What does the model see each cycle?**
> A: A budgeted window (L138, L149): the system prompt, the tool definitions (L144), the curated conversation (L206), and the latest tool results (L164). The window is the context boundary — it shrinks and curates as the loop runs (L207), because every cycle appends and the budget (L149) is the ceiling. The model never sees the unbounded history — it sees the managed window (L206).

**Q: What stops the loop?**
> A: The stop boundary — designed, not accidental (L205). Max steps, a token budget (L149), task-done detection (the model's final answer), and guardrail triggers (L209). The loop should end because one of the four fired — if it ends because the budget died, the stop design failed (L211).

**Q: What can the agent actually do?**
> A: Whatever the authority boundary allows (L212). The tools are scoped — least privilege (L315): a support agent can read accounts but not delete them. Risky actions are gated — human approval (L208). And the system executes, never the model (L201) — the policy decides what runs. Authority is the loop's mandate, written down and enforced (L212).

## 11. Follow-Up Questions

- Where do planning and memory sit in the diagram (L202, L206)?
- How do the boundaries fail (L211)?
- How does the trace feed evaluation (L343)?
- How does the authority boundary compose with security (L212)?
- How does the diagram change for multi-agent systems (L210)?

## 12. Comparison Table — Script vs Architecture

| | Script (L211) | Architecture (this lesson) |
|---|---|---|
| The cycle | while loop | perceive → decide → act → observe (L200) |
| Context (L149) | unbounded | budgeted, curated (L206) |
| Stop (L205) | accidental | designed — steps, budget, done |
| Authority (L212) | everything | scoped, gated (L315) |
| Trace (L213) | none | every cycle logged |
| Failure (L211) | opaque | diagnosable, evaluable (L343) |

The senior read: **the right column is the diagram** — the cycle and its wrap (L216).

## 13. Code Example — The Diagram in Code

```js
// Agent architecture: the loop + the four boundaries (L200).
async function runAgent(task, { tools, budget }) {
  const trace = [];                                   // TRACE (L213)
  let context = await buildInitialContext(task);      // CONTEXT (L206)

  for (let step = 0; step < budget.maxSteps; step++) {   // STOP (L205)
    // PERCEIVE — the model sees the budgeted window (L138, L149).
    const response = await chat({
      model: 'gpt-4o-mini',
      ...context,                                     // the curated window
      tools: tools.allowed,                           // AUTHORITY: scoped (L315)
    });
    trace.push({ step, type: 'decide', response });   // TRACE (L213)

    const call = response.toolCalls?.[0];
    if (!call) break;                                 // task done — STOP (L205)

    // ACT — the system executes, under policy (L201, L212).
    if (!tools.allowedIds.has(call.name)) throw new Error('tool not allowed');  // L315
    if (tools.approvalRequired.has(call.name)) await humanApprove(call);        // L208
    const result = await executeTool(call);

    // OBSERVE — the result joins the curated context (L164, L206).
    context = await curate(context, call, result);    // the moving window (L207)
    trace.push({ step, type: 'observe', call, result });  // TRACE (L213)
  }
  return { answer: context.lastAnswer, trace };       // the trace → evals (L343)
}
```

```text
What the reader must SEE — the cycle and the wrap, in code:

  for loop + break       → the cycle + the stop (L200, L205)
  context (curated)      → the context boundary (L149, L206)
  tools.allowed + approve → the authority boundary (L315, L208)
  trace.push()           → the trace boundary (L213)

  The cycle in the middle, the four boundaries around it.
```

```narrate
4-5: The trace and the context — the record and the window are established (L213, L206).
7: The stop boundary — max steps is the loop's ceiling (L205).
8-14: Perceive — the model sees the curated window and the scoped tools (L138, L149, L315).
16-18: Decide — no tool call means done; the task-completion stop (L205).
20-23: Act — the authority checks: the tool is allowed (L315), and risky ones get human approval (L208).
25-27: Observe — the result joins the curated context, the moving window (L164, L206, L207).
28-30: Every cycle lands in the trace — the loop is explainable and evaluable (L213, L343).
```

> [!TIP]
> The three lines that make it an architecture and not a script: **`step < budget.maxSteps`** (stop, L205), **`tools.allowedIds.has(call.name)`** (authority, L315), and **`trace.push(...)`** (the record, L213). **The cycle is the agent; the three lines are the architecture (L200).**

## 14. Performance Notes

- **The loop is N model calls (L150).** Each cycle is a generation (L145) — the step budget (L205) is the cost control (L150), and the cache (L171) skips repeated contexts.
- **The context window is the latency lever (L149).** A curated window (L206) keeps the per-cycle input small (L138) — tokens (L150) and TTFT (L151) both improve.
- **Tool calls dominate the latency (L151).** Real tools are slower than the model (L145) — parallelize independent calls (L201) and cache tool results (L171).
- **The trace is the eval input (L213, L343).** Logged cycles feed the golden set (L343) and the cost attribution (L332) — the trace's completeness is the observability's quality (L213).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The loop spins | Stop conditions weak (L205) | Add max steps + repetition detection (L211) |
| Context overflow | The window never curates (L206) | Budget + curate (L149, L207) |
| Wrong side effects | Authority too wide (L212) | Scope the tools (L315); gate risky ones (L208) |
| Opaque failure | No trace (L213) | Log every cycle (L332) |
| Quality regressed | No eval on traces (L343) | Golden set on the loop (L341) |

## 16. Quick Revision Notes

- Agent architecture = **the cycle + four boundaries** (L200).
- The cycle: **perceive → decide → act → observe** (L200).
- Boundaries: **context (L149, L206), stop (L205), authority (L212, L315), trace (L213)**.
- The model **proposes**; the system **executes** (L201, L212).
- The loop ends **by design** (L205) — or it spins (L211).
- The diagram maps the module: **every lesson is a box** (L216).

## 17. Cheat Sheet

```text
AGENT ARCHITECTURE = the loop + the four boundaries

THE CYCLE (L200)
  perceive  the model reads the context (L138)
  decide    a tool call or a final answer (L202)
  act       the SYSTEM executes, under policy (L201, L212)
  observe   the result joins the context (L164)

THE FOUR BOUNDARIES (L200)
  context   what the model sees — budgeted, curated (L149, L206)
  stop      max steps · budget · task-done · guardrails (L205, L209)
  authority tools scoped + gated — least privilege (L212, L315)
  trace     every cycle logged — explainable (L213)

THE RULES
  the model proposes — the system executes (L201)
  the loop ends by design, or it spins (L211)
  the trace feeds the evals (L343)

THE MODULE MAP (L216)
  decide → planning (L202) · act → tools (L201) · perceive → memory (L206)
  authority → security (L212) · trace → observability (L213)

INTERVIEW, 4 MOVES
  1 cycle   "perceive → decide → act → observe"
  2 context "the budgeted window (L149, L206)"
  3 stop + authority "ends by design (L205) · does only what's allowed (L315)"
  4 trace   "every cycle logged (L213)"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent architecture is **the cycle plus four boundaries** (L200): perceive → decide → act → observe, wrapped by context, stop, authority, and trace
> - **Context** (L149, L206): the model sees a budgeted, curated window — the moving window (L207) is the loop's memory management
> - **Stop** (L205): the loop ends by design — max steps, budget, task-done, guardrail triggers (L209) — or it spins (L211)
> - **Authority** (L212, L315): tools scoped and gated, least privilege, human approval at the risk threshold (L208) — the system executes, never the model (L201)
> - **Trace** (L213): every cycle logged — the loop is explainable (L211) and evaluable (L343)
> - The diagram **maps the whole module** (L216): planning (L202) fills "decide", tools (L201) fill "act", memory (L206) fills "perceive", observability (L213) fills the trace

## Check your understanding

Answer these without looking back.

1. Draw the cycle and the four boundaries (L200).
2. What does the context boundary budget (L149)?
3. What are the stop conditions (L205)?
4. How is authority enforced (L212, L315)?
5. Why is the trace the eval's input (L343)?
6. Where do planning and memory sit in the diagram (L202, L206)?
7. What happens when each boundary is missing (L211)?
8. How does the diagram map the module (L216)?

## A Closing Note — The Diagram You'll Draw in Every Interview

You now hold the picture that opens every agent conversation: **the cycle in the middle — perceive, decide, act, observe — and the four boundaries around it: context, stop, authority, trace.** It's the map for the rest of the module — every lesson fills in one box.

Next: the loop's hands — tool calling for agents (L201), where schemas, execution, and safety meet.
