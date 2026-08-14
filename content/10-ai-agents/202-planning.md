# Lesson 202 — Planning (ReAct, Plan-and-Execute)

**Interview importance:** ⭐⭐⭐⭐ — "how does an agent decide what to do?" — the answer is *planning*: ReAct's think-then-act cycle and plan-and-execute's upfront plan — and when each wins (L200, L203).**

L200 drew the loop; "decide" is this lesson: **planning** — how the agent decides what to do next. Two patterns dominate. **ReAct** (reason + act): the model interleaves short reasoning with each action — think, act, observe, think again (L203). **Plan-and-execute**: the model writes a plan up front, then executes the steps (L205), re-planning when results demand it. ReAct is flexible and cheap to start; plan-and-execute is structured and better for multi-step tasks. The choice is a planning-depth decision (L202).

The distinction this lesson is built on: a **demo** lets the model wing it step to step. A **solutions architect** designs the planning: ReAct for tasks where reasoning is cheap and the path is open (L203), plan-and-execute for tasks where the steps are knowable up front (L205), and re-planning as the escape hatch when the world disagrees with the plan (L211).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain ReAct: interleaved reasoning and acting (L202)
- Explain plan-and-execute: upfront plan, step execution, re-planning (L205)
- Choose by task: open path → ReAct, knowable steps → plan-and-execute (L202)
- Explain when re-planning fires (L211)
- Explain the cost: planning is reasoning tokens (L149, L150)

## 1. One-Line Definition

**Planning is how the agent decides — ReAct interleaves reasoning with each action (think, act, observe — L203), while plan-and-execute writes the plan up front and executes the steps (L205), re-planning when results disagree — a planning-depth decision chosen by the task: open paths favor ReAct, knowable steps favor plan-and-execute (L202).**

The one-sentence interview answer: *"Planning is the decide box of the loop (L202). Two patterns. ReAct — the model interleaves a short reasoning step with each action: think about what the result means, then act (L203). It's flexible and cheap to start — the reasoning is per-step (L149). Plan-and-execute — the model writes a plan up front — step 1, 2, 3 — then executes the steps (L205), re-planning when a result contradicts the plan (L211). It's structured and better for multi-step tasks with knowable steps (L199). My choice: open-ended tasks where each step depends on the last → ReAct; tasks with a knowable sequence → plan-and-execute. And the cost is the reasoning tokens (L150) — planning depth is a budget decision (L149)."*

## 2. Mental Model

Think of the two planning styles as **improvisation vs a written agenda.** ReAct is the improviser: think about the last line, then say the next — each beat informed by what just happened (L203). Plan-and-execute is the meeting chair: write the agenda up front — item 1, 2, 3 — run the items in order, and rewrite the agenda when the room disagrees with it (L205). Improvisation handles anything; the agenda handles long, structured meetings well. Both work; the meeting's shape decides (L202).

```text
   REACT (L202-203)                 PLAN-AND-EXECUTE (L205)
   ┌─────────────────────┐          ┌──────────────────────────────┐
   │ think → act         │          │ PLAN: 1. search · 2. read    │
   │   → observe → think │          │       3. draft · 4. verify   │
   │   → act …           │          │ EXECUTE: step by step (L201) │
   │ (per-step reasoning)│          │ RE-PLAN when reality differs │
   └─────────────────────┘          └──────────────────────────────┘
     open path, flexible              knowable steps, structured
```

The mental model is **improviser vs agenda**: per-step thinking for open paths, upfront structure for knowable ones — and re-planning as the agenda's correction mechanism (L211).

## 3. Visual Flow — The Two Patterns

```text
   REACT (L202)                          PLAN-AND-EXECUTE (L205)
   ┌────────────────────────┐            ┌────────────────────────────┐
   │ observe the result     │            │ 1 · PLAN (the model writes)│
   │      ▼                 │            │     step 1, step 2, step 3 │
   │ THINK — what does it   │            │      ▼                     │
   │ mean? what next?       │            │ 2 · EXECUTE step 1 (L201)  │
   │      ▼                 │            │      ▼                     │
   │ ACT — one tool (L201)  │            │ 3 · does reality match?    │
   │      ▼                 │            │     yes → step 2           │
   │ observe → THINK again  │            │     no → RE-PLAN (L211)    │
   └────────────────────────┘            └────────────────────────────┘
```

The flow is the two shapes: **ReAct thinks per step; plan-and-execute plans once and re-plans on disagreement** — the planning depth is the difference (L202).

## 4. How It Works — The Two Patterns, the Choice, the Cost

- **ReAct (L202, L203).** The model emits a short reasoning step before each action — "the search returned X, so I should read Y" — then acts (L201), observes, and reasons again. The reasoning is *interleaved* with action, so the plan is implicit — rebuilt each cycle (L203). Flexible: it adapts to every surprise. Cost: reasoning tokens every step (L149).
- **Plan-and-execute (L205).** The model writes an explicit plan up front — the steps, in order — then executes (L201), checking each result against the plan's expectation. Disagreement → re-plan (L211): the model rewrites the remaining steps. Structured: the plan is inspectable, testable (L341), and better for tasks with knowable sequences (L199).
- **The choice (L202).** Open-ended tasks — the next step genuinely depends on the last result (research, troubleshooting) → ReAct's per-step thinking wins. Tasks with a knowable sequence — data pipeline, document workflow (L199) → plan-and-execute's structure wins. The planning depth follows the task's structure (L199).
- **The cost (L149, L150).** Planning is reasoning tokens (L150): ReAct's per-step reasoning adds up over a long loop (L205); plan-and-execute spends up front and saves per step. The planning budget (L149) is part of the loop budget (L200).

> [!NOTE]
> **Re-planning is the escape hatch that makes plans safe (L211).** A plan is a hypothesis about the world; the world disagrees — a search returns nothing, a tool fails, a result surprises (L211). Plan-and-execute's safety is the re-plan step: when the result contradicts the plan's expectation, the model rewrites the remaining steps instead of forcing the stale plan (L211). The senior design names the trigger — *disagreement with the plan* — and the budget: re-planning is bounded like the loop itself (L205).

## 5. Real Project Usage

- **Research agent (ReAct).** Search → think about the findings → search again — the next query depends on the last results (L203).
- **Troubleshooting agent (ReAct).** Run a diagnostic → reason about the output → try the next test (L202).
- **Document pipeline (plan-and-execute).** Extract → validate → post → notify — a knowable sequence (L199, L205).
- **Coding agent (mixed).** A plan for the refactor, ReAct inside each step — read, think, edit, test (L202).
- **Customer support (plan-and-execute).** Get account → check policy → draft reply → approval gate (L208) — knowable steps (L205).

The through-line: **planning is the decide box** — and the pattern follows the task: open paths improvise (L203), knowable steps use an agenda (L205).

## 6. Interview Explanation

Say it in four moves:

1. **The two patterns.** "ReAct — reason and act, interleaved (L203). Plan-and-execute — plan up front, execute the steps, re-plan on disagreement (L205)."
2. **The choice.** "Open path, each step depends on the last → ReAct. Knowable sequence → plan-and-execute (L202)."
3. **The safety.** "The plan is a hypothesis — re-planning fires when results disagree (L211)."
4. **The cost.** "Planning is reasoning tokens (L150) — the depth is a budget decision (L149)."

## 7. Senior-Level Insights

- **Planning depth is a task decision (L202).** The senior answer chooses ReAct or plan-and-execute by the task's structure (L199) — not by fashion. The demo just lets the model "think".
- **ReAct's reasoning is the model's scratchpad (L203).** The interleaved thinking (L203) is what makes the loop adaptive — the senior design budgets it (L149) and observes it (L213).
- **The plan is an inspectable artifact (L205, L341).** Plan-and-execute's plan is testable — you can check the plan against the task (L341), gate risky steps (L208), and show the user the plan (L213). Structure is an observability win (L213).
- **Re-planning is the plan's correction loop (L211).** The senior design names the trigger (result disagrees with the plan) and the budget (bounded re-plans, L205) — a plan without re-planning is a workflow in disguise (L199).
- **Planning composes with the loop (L216).** Tools (L201) execute the plan's steps, memory (L206) holds the plan, guardrails (L209) bound it, and the trace (L213) records it — planning is the decide box of the L200 diagram (L216).

## 8. Common Mistakes

- **No planning at all (L202).** The model acts without reasoning — each step a guess (L203) — drift and spinning (L211).
- **ReAct for knowable tasks (L205).** Per-step reasoning on a fixed sequence — reasoning tokens (L150) for no flexibility (L199).
- **Plan-and-execute without re-planning (L211).** A stale plan forced through a changing world — the workflow trap (L199).
- **Unbounded planning (L149).** Reasoning that eats the budget (L150) — planning depth is a budget line (L149).
- **The plan invisible (L213).** No plan in the trace (L213) — the user and the debugger can't see the intent (L211).
- **Planning as a black box (L341).** The plan never checked against the task — the plan itself should be evaluated (L343).

## 9. Best Practices

- **Choose planning depth by the task** (L202) — open → ReAct (L203), knowable → plan-and-execute (L205).
- **Budget the reasoning** (L149) — planning tokens are a cost line (L150).
- **Re-plan on disagreement** (L211) — the plan is a hypothesis, not a contract (L205).
- **Show the plan** (L213) — inspectable plans are testable (L341) and gated (L208).
- **Evaluate the plan** (L343) — the golden set scores the loop's planning quality (L341).

## 10. Interview Questions

**Q: How does an agent decide what to do?**
> A: Planning (L202). Two patterns. ReAct — the model reasons briefly, acts, observes, and reasons again: think and act interleaved (L203). Plan-and-execute — the model writes the steps up front, executes them (L201), and re-plans when a result disagrees (L211). Open-ended tasks favor ReAct's per-step thinking; knowable sequences favor plan-and-execute's structure (L199).

**Q: ReAct vs plan-and-execute — when each?**
> A: The task's structure decides (L202). If the next step genuinely depends on the last result — research, troubleshooting — ReAct adapts per step (L203). If the sequence is knowable up front — a document pipeline — plan-and-execute's plan is cheaper (L150) and inspectable (L213). And the hybrid exists: a plan for the skeleton, ReAct inside the open steps (L199).

**Q: Why is re-planning important?**
> A: Because a plan is a hypothesis (L211). The world disagrees — a search returns nothing, a tool fails (L211). Plan-and-execute's safety is the re-plan step: when the result contradicts the plan's expectation, the model rewrites the remaining steps (L205). Without it, the agent forces a stale plan — a workflow in disguise (L199).

**Q: What does planning cost?**
> A: Reasoning tokens (L150). ReAct's per-step reasoning adds up over a long loop (L205); plan-and-execute spends up front and saves per step (L149). Either way, planning depth is a budget decision (L149) — part of the loop's budget (L200) — and it's a quality lever: too little planning, drift (L211); too much, cost (L150). The golden set (L343) finds the balance (L341).

## 11. Follow-Up Questions

- How does ReAct's reasoning appear in the trace (L213)?
- When does a plan become a workflow (L199)?
- How do you gate a plan's steps (L208)?
- How do you evaluate planning quality (L343)?
- How does memory hold the plan (L206)?

## 12. Comparison Table — ReAct vs Plan-and-Execute

| | ReAct (L202-203) | Plan-and-execute (L205) |
|---|---|---|
| Plan | implicit, per step | explicit, up front |
| Reasoning (L149) | every step | up front + re-plan |
| Adapts to | any surprise | re-plan on disagreement (L211) |
| Inspectable (L213) | the reasoning trace | the plan itself |
| Best for | open paths (L199) | knowable sequences |
| Risk (L211) | drift without reasoning | stale plans without re-plan |

The senior read: **the columns are the task types** — planning depth follows the path's structure (L202).

## 13. Code Example — The Two Patterns

```js
// Planning: ReAct vs plan-and-execute (L202, L205).
// REACT — reason and act, interleaved (L203).
async function reactAgent(task) {
  const messages = [{ role: 'user', content: task }];
  for (let i = 0; i < 10; i++) {
    const r = await chat({ messages, tools: [search, read] });
    // The model emits reasoning THEN the action (L203):
    //   "The search found X → I should read Y to confirm."
    if (!r.toolCalls?.length) return r.content;          // done (L205)
    messages.push({ role: 'assistant', content: r.reasoning });  // think (L203)
    messages.push({ role: 'tool', content: await executeTool(r.toolCalls[0]) });  // act (L201)
  }
}

// PLAN-AND-EXECUTE — plan up front, re-plan on disagreement (L205, L211).
async function planExecuteAgent(task) {
  let plan = await planTask(task);                       // the agenda (L202)
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const result = await executeStep(step);              // L201
    if (!step.matchesExpectation(result)) {
      plan = await replan(task, plan, step, result);     // re-plan (L211)
      i = -1;                                            // re-walk the new plan
    }
  }
}
```

```text
What the reader must SEE — the two planning shapes:

  reactAgent: reasoning + tool, per cycle   → think, act, observe (L203)
  planExecute: plan → execute → re-plan     → the agenda + its correction (L205, L211)

  Open paths think per step. Knowable steps plan once.
```

```narrate
4-11: ReAct — the reasoning joins the messages before each action; the model thinks and acts per cycle (L203, L201).
14-21: Plan-and-execute — the plan is written first (L202); each step executes (L201) and is checked against its expectation.
22-24: The re-plan — when reality disagrees, the remaining steps are rewritten (L211) and the loop re-walks them (L205).
```

> [!TIP]
> The line that shows the difference: **`i = -1`** after a re-plan — the plan is re-walked when reality disagrees. **A plan without re-planning is a workflow in disguise (L199, L211).**

## 14. Performance Notes

- **Planning is the token lever (L149, L150).** ReAct's reasoning per step vs the plan's up-front spend — the planning budget (L149) is the cost control (L150).
- **Re-planning is bounded (L205).** Re-plans are model calls (L150) — bound them like the loop (L205), or a confusing world triggers endless re-planning (L211).
- **The plan is cacheable (L171).** Similar tasks produce similar plans — cache the plan (L171) and the step results (L171).
- **The reasoning is observable (L213).** The interleaved reasoning (L203) and the plan (L205) are trace data (L213) — the eval (L343) scores them (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The agent drifts | No reasoning (L203) | Add ReAct's think step (L202) |
| Stale plans forced | No re-plan (L211) | Add the disagreement trigger (L205) |
| Cost climbing | Planning unbudgeted (L149) | Bound the reasoning tokens (L150) |
| Opaque intent | Plan not in the trace (L213) | Log the plan + the reasoning (L213) |
| Wrong sequence | Plan never evaluated (L343) | Golden set on planning (L341) |

## 16. Quick Revision Notes

- Planning = **the decide box** (L202): ReAct or plan-and-execute.
- ReAct = **think, act, observe** — interleaved (L203).
- Plan-and-execute = **plan once, execute, re-plan on disagreement** (L205, L211).
- The choice: **open path → ReAct; knowable sequence → plan-and-execute** (L202).
- The cost: **reasoning tokens (L149, L150)** — depth is a budget.
- The plan is **inspectable (L213)** and **evaluable (L343)**.

## 17. Cheat Sheet

```text
PLANNING = the decide box of the loop

THE TWO PATTERNS (L202)
  ReAct             reason + act, interleaved (L203)
                    think → act → observe → think …
                    open paths — adapts per step
  plan-and-execute  plan up front → execute steps (L205)
                    re-plan when reality disagrees (L211)
                    knowable sequences — inspectable

THE CHOICE (L202)
  next step depends on the last  → ReAct (L203)
  the sequence is knowable       → plan-and-execute (L205)
  mixed                         → plan the skeleton, ReAct inside

THE SAFETY (L211)
  the plan is a hypothesis
  disagreement → re-plan — bounded like the loop (L205)
  a plan without re-planning is a workflow in disguise (L199)

THE COST (L149, L150)
  planning is reasoning tokens — a budget line (L149)
  too little → drift (L211) · too much → cost (L150)

INTERVIEW, 4 MOVES
  1 patterns "ReAct vs plan-and-execute"
  2 choice   "open path vs knowable sequence (L202)"
  3 safety   "re-plan on disagreement (L211)"
  4 cost     "reasoning is a budget (L149)"
```

## 18. Key Takeaways

> [!RECAP]
> - Planning is **the decide box** (L202): ReAct's interleaved reasoning (L203) or plan-and-execute's upfront plan (L205)
> - **ReAct** adapts per step — open paths where the next step depends on the last (L203); **plan-and-execute** structures knowable sequences (L205)
> - **The plan is a hypothesis** (L211) — re-planning fires when results disagree, bounded like the loop (L205); without it, a plan is a workflow in disguise (L199)
> - **Planning costs reasoning tokens** (L149, L150) — the depth is a budget decision, part of the loop's budget (L200)
> - The plan and the reasoning are **inspectable** (L213) and **evaluable** (L343) — the golden set scores planning quality (L341)
> - The planning choice **follows the task's structure** (L199) — and the hybrid (plan the skeleton, ReAct inside) covers mixed tasks

## Check your understanding

Answer these without looking back.

1. What are the two planning patterns (L202)?
2. How does ReAct work (L203)?
3. When does plan-and-execute win (L205)?
4. Why is re-planning the plan's safety (L211)?
5. What does planning cost (L149)?
6. When is a plan a workflow in disguise (L199)?
7. How is planning observable (L213)?
8. How do you evaluate planning quality (L343)?

## A Closing Note — The Thinking Before the Acting

You now hold the decide box: **ReAct's think-act-observe for open paths, plan-and-execute's agenda for knowable ones, and the re-plan that keeps every plan honest.** The agent no longer wings it — it thinks before it acts, and rethinks when the world disagrees.

Next: the thinking scaffolds themselves — reasoning patterns (L203), chain of thought, reflection, self-correction.
