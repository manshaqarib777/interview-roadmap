# Lesson 198 — What Agents Are

**Interview importance:** ⭐⭐⭐⭐⭐ — "what is an AI agent?" — the answer is the *loop*: call the model, execute tools, feed results back — and the distinction from a single tool call (L144, L164).**

Module 9 ended with the system that knows your data. This lesson is the shape that *acts*: AI agents. An agent is a **loop** — the model perceives (reads context), decides (what to do next), acts (calls a tool, L144), observes (reads the result), and decides again. The loop is the whole idea: a single model call with a tool is a function call; a loop that calls, executes, and feeds back is an agent. Everything else in this module — planning (L202), guardrails (L209), memory (L206) — is discipline around the loop.

The distinction this lesson is built on: a **demo** shows a chatbot that can call one tool. A **solutions architect** can explain the loop: what makes it an agent, where it lives in the L173 floor plan, what the model sees at each step (L138, L149), and why the loop is powerful *and* dangerous — the source of both its usefulness and its failure modes (L211).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the agent as a loop: perceive → decide → act → observe (L198)
- Distinguish an agent from a single tool call (L144, L164)
- Explain what the model sees at each step: context, tools, results (L138, L149)
- Place the agent in the production floor plan (L173)
- Explain why the loop is powerful and risky (L211)

## 1. One-Line Definition

**An AI agent is a loop — the model perceives context, decides what to do next, acts by calling a tool (L144), observes the result, and repeats until the task is done or a stop condition fires (L205) — the difference from a single model call being the loop itself, which is the source of both its power and its failure modes (L211).**

The one-sentence interview answer: *"An agent is a loop (L198). At each step the model sees the conversation and the tool results so far, decides the next action — a tool call (L144) or a final answer — executes it, and observes the outcome. That repeats until the task is done or a stop condition fires (L205). The difference from a single call is the loop: a chatbot that calls one tool is a function call; a loop that calls, executes, feeds back, and decides again is an agent. The loop is what makes agents powerful — multi-step work with real tools — and what makes them dangerous: loops can drift, spin, or act with too much agency (L211). The whole discipline of this module is keeping the loop bounded (L205), guarded (L209), and observable (L213)."*

## 2. Mental Model

Think of an agent as **a worker with a phone, a notebook, and a rulebook — who keeps working until the job is done.** Each cycle: the worker reads the notebook (the context so far, L138), decides the next step (reasoning), makes a call (the tool, L144), writes down the answer (observes), and decides again. A single phone call is not a job — the job is the *loop* of calls, each informed by the last. And the rulebook (the stop conditions, L205, and guardrails, L209) is what makes the worker stop when done — or stop when stuck.

```text
   a single call (L144)              the agent loop (L198)
   ┌────────────────────┐            ┌────────────────────────────┐
   │ question           │            │ perceive → decide → act    │
   │      ▼             │            │     → observe → decide…    │
   │ model → tool →     │            │ until done or stopped      │
   │ answer             │            │ (the loop, L200)           │
   └────────────────────┘            └────────────────────────────┘
     a function call                   a worker on a task
```

The mental model is **worker on a task, not a single phone call**: the loop is the job, and the discipline — stop conditions (L205), guardrails (L209) — is what keeps the worker sane.

## 3. Visual Flow — One Agent Cycle

```text
   a task arrives (L198)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · PERCEIVE (L138, L206)                                │
   │     the model reads: system + tools + conversation +     │
   │     tool results so far — within the context budget (L149)│
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · DECIDE (L202)                                        │
   │     "what's the next step?" — a tool call or an answer   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · ACT (L144, L201)                                     │
   │     execute the tool: search, compute, write, call API   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · OBSERVE (L164)                                       │
   │     the result goes back into the context → loop         │
   │     UNTIL done or a stop condition (L205)                │
   └──────────────────────────────────────────────────────────┘
```

The flow is the cycle: **perceive → decide → act → observe** (L200) — repeated until the stop condition (L205) fires. Every lesson in this module disciplines one part of this cycle.

## 4. How It Works — The Loop, the Model's View, the Placement

- **The loop (L198).** Each cycle: the model sees the accumulated context (L138) — system prompt, tool definitions (L144), conversation, and every tool result so far — decides the next action, executes it (L201), and the result joins the context for the next decision. The task completes when the model answers, or when a stop condition fires (L205).
- **The model's view (L149).** The context grows every cycle — each tool result is appended. The token budget (L149) is the loop's constraint: long loops must curate the context (L206), or the window overflows (L138).
- **Tools (L144, L201).** The agent's hands: search, compute, APIs, writes. The model proposes a tool call; the *system* executes it (L201) — the model never runs code itself. Tool schemas (L144) define what the model can propose; safety (L212) governs what the system allows.
- **The placement (L173).** The agent loop lives in the production floor plan's kitchen (L173): the gateway (L172) guards the entry, the cache (L171) and budget (L149) bound it, the evals (L343) verify it. The loop is a smarter kitchen, not a separate app.

> [!NOTE]
> **The loop is the definition — and the risk (L198, L211).** A single call can answer; a loop can *do*. That's the power — multi-step tasks with real side effects. And it's the risk: a loop that decides badly repeats (spinning, L211), drifts from the task (L211), or acts with too much agency (L212). The senior answer names both halves: the loop is the agent, and the loop is what must be bounded (L205), guarded (L209), and observed (L213).

## 5. Real Project Usage

- **Customer support agents.** The loop perceives the ticket, searches the KB (L189), checks the account, drafts the reply — each step a tool call, until the resolution is written (L201).
- **Research agents.** The loop searches, reads, and synthesizes — multiple searches (L193-style querying) before the final answer (L203).
- **Coding assistants.** The loop reads files (L177), searches code, edits, runs tests — tools around a codebase (L354).
- **Automation (L217+).** The loop drives the workflow's decision steps — the module 11 workflows use agents at the judgment points (L230).
- **Anything multi-step (L216).** Where the task needs several actions with real tools — the agent is the shape (L198).

The through-line: **the agent is the loop** — and every production use is the loop plus the discipline of this module (L200–216).

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "An agent is a loop: perceive → decide → act → observe, until done or stopped (L198, L200)."
2. **The distinction.** "A single call with a tool is a function call (L144); the loop that feeds results back and decides again is the agent (L198)."
3. **The model's view.** "Each cycle the model reads the context so far — tools, conversation, results — within the budget (L149, L206)."
4. **The risk.** "The loop is the power and the danger — it must be bounded (L205), guarded (L209), and observed (L213)."

## 7. Senior-Level Insights

- **The loop is the architecture (L200).** The senior answer draws the cycle (L200) before naming any framework (L214–215) — the loop is the design; frameworks implement it (L216).
- **The model's context is the loop's memory (L138, L206).** Every result is appended — the loop's length is a context-management problem (L206, L149), not just a logic problem. The senior design budgets the context (L149) as it budgets the steps (L205).
- **The system executes; the model proposes (L201).** The safety line: the model never runs code — it proposes tool calls, and the system executes with authority checks (L212, L315). The senior answer places the trust boundary (L172) between proposal and execution.
- **The loop lives in the floor plan (L173).** Gateway, budget, cache, evals — the agent is a kitchen in the L173 architecture, not a separate system (L216).
- **The loop's failure modes are its own (L211).** Spinning, drift, tool explosions — the taxonomy (L211) is the senior answer's map, and observability (L213) is its instrument.

## 8. Common Mistakes

- **Calling any tool call an agent (L198).** A single call is a function call (L144) — the loop is the definition (L200).
- **No stop conditions (L205).** The loop that spins until the budget dies (L211) — termination is part of the design (L205).
- **Unbounded context (L149).** Every result appended forever — the window overflows (L138), the loop degrades (L206).
- **The model executing tools (L201).** Proposing is the model's job; executing is the system's — with authority checks (L212, L315).
- **The loop with no guardrails (L209).** No rails before, during, or after (L209) — the loop acts with too much agency (L212).
- **The agent as a separate app (L173).** Outside the gateway (L172) and the evals (L343) — the floor plan's protections missing (L216).

## 9. Best Practices

- **Draw the loop first** (L200) — perceive, decide, act, observe — before any framework (L214).
- **Design the stop conditions** (L205) — max steps, budget, task-done detection.
- **Budget the context** (L149, L206) — curate what the model sees each cycle (L138).
- **Keep the model proposing, the system executing** (L201, L212) — the trust boundary (L172).
- **Place the loop in the floor plan** (L173) — gateway (L172), cache (L171), evals (L343).
- **Observe every cycle** (L213) — steps, tools, tokens (L332).

## 10. Interview Questions

**Q: What is an AI agent?**
> A: A loop (L198). The model perceives the context — system, tools, conversation, results so far (L138) — decides the next action, acts by calling a tool (L144), observes the result, and repeats until done or a stop condition (L205). The loop is the definition: a single call with a tool is a function call; the loop that feeds results back and decides again is the agent.

**Q: What's the difference between an agent and a tool call?**
> A: The loop (L198). A single call can propose one tool and answer (L144). An agent runs many cycles — each tool result goes back into the context and informs the next decision (L200). That's what enables multi-step tasks with real side effects — and it's what needs the discipline: stop conditions (L205), guardrails (L209), and observability (L213).

**Q: What does the model see at each step?**
> A: The accumulated context (L138): the system prompt, the tool definitions (L144), the conversation, and every tool result so far (L164). Each cycle appends the latest result (L206). The constraint is the token budget (L149) — long loops must curate what the model sees (L206), or the window overflows (L138).

**Q: Where does the agent live in production?**
> A: Inside the L173 floor plan (L173). The gateway (L172) guards the entry — auth, budget (L149), rate limits (L170). The cache (L171) and the context budget (L149) bound the loop. The evals (L343) verify the output. The agent is a smarter kitchen in the same architecture — not a separate app (L216).

## 11. Follow-Up Questions

- Draw the loop and name a discipline per phase (L200).
- How does the context budget constrain the loop (L149)?
- What are the stop conditions (L205)?
- Why does the system execute tools, not the model (L201)?
- How do agents fail (L211)?

## 12. Comparison Table — Tool Call vs Agent

| | Single tool call (L144) | Agent (this lesson) |
|---|---|---|
| Cycles | one | many (L200) |
| Feedback | none | results back in context (L164) |
| Task shape | one step | multi-step (L202) |
| Stop condition (L205) | after the call | designed — steps, budget, done |
| Risk (L211) | low | loops, drift, agency (L212) |
| Discipline (L209, L213) | minimal | guardrails + observability |

The senior read: **the loop column is the agent** — and the discipline column is what this module teaches (L216).

## 13. Code Example — The Bare Loop

```js
// The agent loop, in its simplest honest form (L198, L200).
async function runAgent(task, { tools, maxSteps = 10 }) {
  const messages = [{ role: 'user', content: task }];
  let done = false, steps = 0;

  while (!done && steps < maxSteps) {           // the loop (L200)
    // 1 · PERCEIVE — the model sees the context so far (L138).
    const response = await chat({
      model: 'gpt-4o-mini',
      messages,                                  // grows every cycle (L206)
      tools,                                     // the agent's hands (L144)
    });

    // 2 · DECIDE — a tool call, or the final answer?
    const call = response.toolCalls?.[0];
    if (!call) { done = true; break; }           // the answer — done (L205)

    // 3 · ACT — the SYSTEM executes, never the model (L201, L212).
    const result = await executeTool(call);      // authority check here (L315)

    // 4 · OBSERVE — the result joins the context (L164).
    messages.push({ role: 'tool', tool_call_id: call.id, content: result });
    steps += 1;                                  // the budget (L205)
  }
  return messages;                               // the trace (L213)
}
```

```text
What the reader must SEE — the loop, the boundaries:

  while (!done && steps < maxSteps)  → the loop + the stop condition (L200, L205)
  messages grows every cycle         → the context budget (L149, L206)
  executeTool(call)                  → the SYSTEM executes (L201, L212)
  return messages                    → the trace (L213)

  Perceive, decide, act, observe — until done or stopped.
```

```narrate
5-6: The loop condition — the task-done flag and the step budget (L200, L205).
8-13: Perceive — the model reads the accumulated context and the tools (L138, L144).
15-18: Decide — a tool call means more work; the answer means done (L205).
20-22: Act — the system executes the tool, with the authority check (L201, L212, L315).
24-26: Observe — the result joins the context; the next cycle sees it (L164).
28-29: The messages array is the loop's trace — observability's raw material (L213).
```

> [!TIP]
> The two lines that define the agent: **`while (!done && steps < maxSteps)`** (the loop *and* its stop condition, L205) and **`executeTool(call)`** (the system executing, L201). **The loop is the agent; the stop condition and the execution boundary are its discipline.**

## 14. Performance Notes

- **The loop is N model calls (L150).** Each cycle is a generation (L145) — the cost (L150) and latency (L151) scale with steps; the step budget (L205) is the cost control.
- **The context grows every cycle (L149).** N cycles × results — the token bill (L150) compounds; curation (L206) and the cache (L171) are the levers.
- **Tool latency dominates (L151).** Real tools (search, APIs) are slower than the model (L145) — parallelize independent tools (L201) and cache tool results (L171).
- **The trace is the observability cost (L213).** Logging each step is cheap; the eval loop (L343) on the traces is the quality gate (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The loop never ends | No stop condition (L205) | Add max steps + task-done detection |
| The loop spins | Repeating the same tool call (L211) | Detect repetition; force a new action |
| Context overflow | Results never curated (L206) | Budget + curate the context (L149) |
| Wrong side effects | Too much agency (L212) | Add authority checks + human gates (L208) |
| Opaque failures | No trace (L213) | Log every cycle — steps, tools, tokens (L332) |

## 16. Quick Revision Notes

- An agent = **the loop** (L198): perceive → decide → act → observe (L200).
- Single call = **function call** (L144); the loop = **the agent** (L198).
- The model **proposes** tools; the system **executes** (L201, L212).
- The context **grows every cycle** (L206) — budget it (L149).
- Stop conditions are **part of the design** (L205) — or the loop spins (L211).
- The loop lives **in the floor plan** (L173) — guarded, cached, evaled (L216).

## 17. Cheat Sheet

```text
WHAT AGENTS ARE = the loop

THE DEFINITION (L198)
  an agent is a loop: perceive → decide → act → observe (L200)
  until the task is done or a stop condition fires (L205)

THE DISTINCTION
  single call + tool  = a function call (L144)
  the loop, feeding results back = the agent (L198)

THE MODEL'S VIEW (L138, L206)
  system + tools + conversation + results so far
  the context grows every cycle — budget it (L149)

THE EXECUTION BOUNDARY (L201, L212)
  the model PROPOSES tool calls
  the SYSTEM executes — with authority checks (L315)

THE DISCIPLINE (L216)
  bounded   stop conditions, step budget (L205)
  guarded   guardrails before/during/after (L209)
  observed  the trace of every cycle (L213)
  evaled    the golden set in CI (L343, L341)

INTERVIEW, 4 MOVES
  1 define  "a loop: perceive, decide, act, observe"
  2 distinguish "a tool call is a function; the loop is the agent"
  3 view    "the context grows — budget it (L149)"
  4 risk    "bounded, guarded, observed (L205, L209, L213)"
```

## 18. Key Takeaways

> [!RECAP]
> - An AI agent is **the loop** (L198): perceive → decide → act → observe, repeated until the task is done or a stop condition fires (L200, L205)
> - **A single tool call is a function call** (L144); the loop that feeds results back and decides again is the agent (L198)
> - The model **proposes** tool calls; the **system executes** them (L201) — with authority checks at the boundary (L212, L315)
> - The context **grows every cycle** (L206) — the token budget (L149) is the loop's constraint, and curation (L206) is the lever
> - The loop is **the power and the risk** (L211) — it must be bounded (L205), guarded (L209), and observed (L213)
> - The agent lives **inside the L173 floor plan** (L173) — the gateway (L172), cache (L171), and evals (L343) wrap the loop (L216)

## Check your understanding

Answer these without looking back.

1. What is the agent's loop (L200)?
2. What distinguishes an agent from a tool call (L198)?
3. What does the model see each cycle (L138)?
4. Why does the system execute tools, not the model (L201)?
5. What are the stop conditions (L205)?
6. Why is the loop both powerful and dangerous (L211)?
7. Where does the agent live in production (L173)?
8. What is the loop's trace used for (L213)?

## A Closing Note — The Shape That Acts

You now hold the definition that starts the module: **an agent is the loop — perceive, decide, act, observe — until done or stopped.** It's the shape that turns knowledge into action, and it's the shape that needs every discipline this module teaches next.

Next: when the loop is the right shape at all — agent vs workflow (L199), deterministic pipelines against model-driven loops.
