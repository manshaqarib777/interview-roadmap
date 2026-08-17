# Lesson 340 — Agent Evaluation

**Interview importance:** ⭐⭐⭐⭐⭐ — "trajectories, task success, and cost per completed task" — the answer is *the agent eval*: the task, the trajectory, and the economics (L340).**

L339 measured the tools; this lesson is **the whole agent**: the agent evaluation — the trajectories, the task success, and the cost per completed task (L340): the task (the goal, L340), the trajectory (the path of the calls, L340), and the metrics (the task success, the efficiency, the cost, L340). The AI shape (L173): the agents (L200) — the task's (L340) success and the path's (L340) quality (L340). This lesson is the agent's eval (L340).

The distinction this lesson is built on: a **demo** watches the answers. A **solutions architect** evaluates the agent (L340): the task success (L340), the trajectory (L340), and the cost (L334) — because the agent (L200) is the trajectory (L340).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the task: the goal (L340)
- Explain the trajectory: the path of the calls (L340)
- Explain the metrics: the task success, the efficiency, the cost (L340)
- Explain the evaluation: the golden tasks and the judge (L340)
- Explain the AI shape: the agent's task eval (L340)

## 1. One-Line Definition

**The agent evaluation measures the trajectories, the task success, and the cost per completed task (L340) — the task (the goal: the user's request L328, the defined outcome, L340), the trajectory (the path of the calls: the tool calls L315 and the observations, L340), and the metrics (the task success: the goal achieved L340; the efficiency: the steps taken L340; and the cost: the tokens L332 and the spend L334 per completed task, L340).**

The one-sentence interview answer: *"The agent evaluation measures the whole agent (L340). The task (L340): the goal (L340) — the user's request (L328) with the defined outcome (L340). The trajectory (L340): the path of the calls (L340) — the tool calls (L315), the observations (L340), and the reasoning (L340) — the agent's (L200) journey (L340). The metrics (L340): the task success (L340) — the goal achieved (L340); the efficiency (L340) — the steps taken (L340), the loops (L205); and the cost (L334) — the tokens (L332) and the spend (L334) per completed task (L340). The evaluation (L340): the golden tasks (L342) — the labeled tasks (L340) with the expected outcomes (L340) — run in the suite (L341); the judge (L343) — the LLM-judge (L343) scoring the trajectories (L340); and the human (L341) — the sampled review (L341). The AI shape (L173): the agents (L200) — the task's (L340) success (L340) and the path's (L340) quality (L340): the trajectory (L340) evaluated (L340), the cost (L334) per task (L340) watched (L340), and the regressions (L341) gated (L341)."*

## 2. Mental Model

Think of the agent eval as **the mission debrief.** The mission (the task, L340) has the objective (the goal, L340). The squad (the agent, L200) takes the route (the trajectory, L340): the checkpoints (the tool calls, L315), the observations (L340), and the detours (the loops, L205). The debrief (the eval, L340): the objective achieved? (the task success, L340); the route efficient? (the steps, L340); the supplies used? (the cost, L334). The trainer (the evaluator, L340) compares the missions (the golden tasks, L342) — the known objectives (L342) — and the judge (L343) scores the routes (L340). The squad works because the objectives are defined, the routes are debriefed, and the efficiency is measured (L340).

```text
   the debrief (the agent eval, L340)
   ┌────────────────────────────────────────────────────────┐
   │ the mission (the task, L340) — the objective (L340)    │
   │ the route (the trajectory, L340) — the checkpoints     │
   │ (L315), the detours (L205)                             │
   │ the debrief (L340): the success (L340), the steps      │
   │ (L340), the supplies (L334)                            │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the debrief**: the mission, the route, and the measures (L340).

## 3. Visual Flow — One Agent's Eval

```text
   the task (L340)
        │  "refund order #123" (L340)
        ▼
   ┌────────────────────── THE TRAJECTORY (L340) ───────────────────────┐
   │  get_order → refund_policy → approve_refund (L340)                │
   │  the steps: 3 (L340) · the loops: 0 (L205)                        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE METRICS (L340) ──────────────────────────┐
   │  the task success: the refund issued (L340)                       │
   │  the efficiency: 3 steps vs the expected 2 (L340)                 │
   │  the cost: 1,204 tokens, $0.03 (L332, L334)                       │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EVAL (L340) ─────────────────────────────┐
   │  the golden task (L342) · the judge's score (L343)                │
   │  the suite (L341) → the regression (L341) gated (L296)            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the eval: **task → trajectory → metrics → eval** (L340).

## 4. How It Works — The Debrief, Part by Part

- **The task (L340).** The goal (L340): the user's request (L328) with the defined outcome (L340).
- **The trajectory (L340).** The path of the calls (L340): the tool calls (L315), the observations (L340), and the reasoning (L340).
- **The metrics (L340).** The task success (L340), the efficiency (L340) — the steps and the loops (L205) — and the cost (L334) per completed task (L340).
- **The evaluation (L340).** The golden tasks (L342), the judge (L343), and the human (L341) — in the suite (L341).

> [!NOTE]
> **The agent is the trajectory (L340).** The senior answer evaluates the path (L340), not just the outcome (L340): the task success (L340) alone misses the broken tool (L339), the excessive loop (L205), and the wasted cost (L334) — the trajectory (L340) shows them (L340): the steps (L340), the loop count (L205), and the tool outcomes (L339). The golden tasks (L342) with the expected trajectories (L340) — the eval (L340) of the whole journey (L340).

## 5. Real Project Usage

- **An agent product (L279).** The golden tasks (L342) — the task success (L340) and the trajectory (L340) in the suite (L341).
- **A customer support agent (L350).** The refund task (L340) — the success (L340) and the cost (L334) per refund (L340).
- **A finance agent (L314).** The transfer task (L340) — the approval (L324) in the trajectory (L340).
- **A multi-tenant SaaS (L357).** The per-tenant (L320) agent evals (L340) — the tenant's (L320) tasks (L340).
- **Anything agentic (L200).** The agent's eval (L340) — the task, the trajectory, and the cost (L340).

The through-line: **the debrief is the agent's** — the task, the trajectory, and the metrics (L340).

## 6. Interview Explanation

Say it in four moves:

1. **The task.** "The goal — the request with the outcome (L340)."
2. **The trajectory.** "The path of the calls (L340)."
3. **The metrics.** "The success, the efficiency, the cost (L340)."
4. **The eval.** "The golden tasks (L342) and the judge (L343)."

## 7. Senior-Level Insights

- **The trajectory is the eval's unit (L340).** The tool calls (L315) and the observations (L340) — the path (L340) evaluated, not just the outcome (L340).
- **The task success is the product's metric (L340).** The goal achieved (L340) — the user's (L162) request (L328) done (L340).
- **The efficiency is the cost's lever (L340).** The steps (L340) and the loops (L205) — the excessive loop (L205) is the wasted tokens (L332) — the cost (L334) per task (L340).
- **The golden tasks are the suite's (L342).** The labeled tasks (L342) with the expected outcomes (L340) — the regressions (L341) gated (L296).
- **The judge is the trajectory's scorer (L343).** The LLM-judge (L343) — the trajectory's (L340) quality scored (L343) — validated by the human (L341).

## 8. Common Mistakes

- **The outcome-only eval (L340).** The success (L340) without the path (L340) — the broken tool (L339) and the loops (L205) missed (L340).
- **The un-defined task (L340).** The vague goal (L340) — the success (L340) un-judgeable (L340).
- **The golden tasks missing (L342).** The unlabeled tasks (L340) — the suite (L341) impossible (L340).
- **The cost blind (L334).** The task (L340) without the spend (L334) — the expensive agent (L340) unseen (L340).
- **The judge un-validated (L343).** The judge's (L343) trajectory scores (L340) — the human agreement (L341) checked (L343).

## 9. Best Practices

- **Define the task** (L340) — the outcome (L340) judgeable (L340).
- **Evaluate the trajectory** (L340) — the steps, the loops (L205), the tools (L339).
- **Watch the cost** (L334) — the tokens (L332) per completed task (L340).
- **Build the golden tasks** (L342) — the labeled set (L342) in the suite (L341).
- **Validate the judge** (L343) — the human agreement (L341).

## 10. Interview Questions

**Q: Walk me through the agent evaluation.**
> A: The whole agent (L340). The task — the goal with the defined outcome (L340). The trajectory — the path of the calls: the tools (L315), the observations, the loops (L205). The metrics — the task success, the efficiency, the cost (L340). And the eval — the golden tasks (L342) and the judge (L343).

**Q: Why the trajectory and not just the outcome?**
> A: The path shows the problems (L340): the task success (L340) alone misses the broken tool (L339), the excessive loop (L205), and the wasted cost (L334). The trajectory (L340) — the steps (L340), the loop count (L205), the tool outcomes (L339) — is the agent's (L200) behavior (L340).

**Q: What are the golden tasks?**
> A: The labeled tasks (L342): the representative tasks (L340) — "refund order #123", "update the shipping address" (L340) — with the expected outcomes (L340) and the ideal trajectories (L340). The suite (L341) runs them (L342) — the task success (L340) and the efficiency (L340) measured (L340) — and the CI (L296) gates (L341).

**Q: How do you measure the cost?**
> A: The L334 attribution (L334): the tokens (L332) and the spend (L334) per task (L340) — the cost per completed task (L340) — and the efficiency (L340) — the steps (L340) per task (L340). The expensive agent (L340) — the many loops (L205) and the failures (L339) — found (L340).

## 11. Follow-Up Questions

- What's the task (L340)?
- Why the trajectory (L340)?
- What are the golden tasks (L342)?
- How do you measure the cost (L334)?
- What's the judge (L343)?

## 12. Comparison Table — The Outcome vs the Trajectory

| | The outcome (L340) | The trajectory (L340) |
|---|---|---|
| The measure (L340) | the task success (L340) | the path's quality (L340) |
| The problems (L340) | hidden (L340) | shown: the tools (L339), the loops (L205) |
| The cost (L340) | the total (L334) | the steps' (L340) attribution (L334) |
| The use (L340) | the product's (L340) | the agent's (L200) improvement (L340) |

The senior read: **the trajectory is the agent's eval** — the outcome is the product's (L340).

## 13. Code Example — The Debrief, Applied

```js
// The agent eval (L340) — the task, the trajectory, the metrics (L340).
// 1 · THE GOLDEN TASKS (L342) — the labeled set (L340).
const goldenTasks = [
  {
    task: 'refund order #123',
    expected: { outcome: 'refund-issued', steps: 2, tools: ['get_order', 'refund'] },
  },
  // ... the labeled tasks (L342)
];

// 2 · THE RUN (L340) — the trajectory recorded (L340).
async function runTask(task) {
  const trajectory = [];                       // the path (L340)
  const started = performance.now();
  const result = await agent.run(task, {
    onStep: (step) => trajectory.push(step),   // the calls + the observations (L340)
  });
  return {
    result,
    trajectory,                                // L340
    steps: trajectory.length,                  // the efficiency (L340)
    loops: countLoops(trajectory),             // the loops (L205)
    tokens: result.usage.total,                // the tokens (L332)
    costUsd: costOf(result.usage),             // the cost (L334)
    latencyMs: performance.now() - started,
  };
}

// 3 · THE SCORE (L340) — the success and the judge (L343).
async function scoreRun(run, golden) {
  const success = run.result.outcome === golden.expected.outcome;  // L340
  const judgeScore = await judge.trajectory(run.trajectory, golden);  // L343
  return { success, judgeScore, costUsd: run.costUsd };            // L340
}

// 4 · THE GATE (L341): the success >= 0.9 and the cost within the budget (L334).
```

```text
What the reader must SEE — the debrief, applied:

  goldenTasks: task + expected → the labels (L342)
  trajectory.push per step     → the path (L340)
  steps + loops                → the efficiency (L340, L205)
  tokens + costUsd             → the economics (L332, L334)
  judge.trajectory             → the quality score (L343)

  The task, the trajectory, and the cost — the agent's eval (L340).
```

```narrate
4-9: The golden tasks — the labeled tasks with the expected outcomes (L342, L340).
11-24: The run — the trajectory recorded with the steps, the loops, the tokens, and the cost (L340).
26-31: The score — the task success and the judge's trajectory score (L340, L343).
33: The gate — the success and the cost gated in the CI (L341, L334).
```

> [!TIP]
> The pair that defines the eval: **the recorded trajectory** (the path, L340) and **the golden task's outcome** (the truth, L342). **Define the tasks, record the trajectories, score the success, watch the cost — the agent's debrief (L340).**

## 14. Performance Notes

- **The suite is the CI's time (L340).** The golden tasks (L342) — the minutes (L340) in the pipeline (L296).
- **The judge is the eval's cost (L343).** The trajectory scores (L340) — the tokens (L332) per task (L340).
- **The trajectory is the storage's cost (L340).** The recorded paths (L340) — the retention (L322) bounded (L340).
- **The cost per task is the product's economics (L334).** The tokens (L332) per completed task (L340) — the L334 unit economics (L334), agent-shaped (L340).

## 15. Debugging Scenarios

| Symptom | First check (L340) | The lever |
|---|---|---|
| The agent fails the tasks | The task success (L340) | The golden tasks (L342) |
| The agent loops | The trajectory (L340) | The loop count (L205), the termination (L205) |
| The cost explodes | The cost (L334) | The steps (L340), the failures (L339) |
| The judge is lenient | The validation (L343) | The human agreement (L341) |
| The regression ships | The gate (L341) | The suite (L341) in the CI (L296) |

## 16. Quick Revision Notes

- The agent eval = **the agent's debrief** (L340): the task, the trajectory, the metrics, the eval.
- The task: **the goal — the request with the outcome (L340)**.
- The trajectory: **the path of the calls (L340)**.
- The metrics: **the task success, the efficiency, the cost (L340)**.
- The eval: **the golden tasks (L342), the judge (L343), the human (L341)**.

## 17. Cheat Sheet

```text
AGENT EVALUATION = the trajectories, the task success, the cost

THE TASK (L340)
  the goal (L340) — the user's request (L328)
  with the defined outcome (L340)

THE TRAJECTORY (L340)
  the path of the calls (L340)
  the tool calls (L315) · the observations (L340) · the reasoning (L340)
  the steps (L340) · the loops (L205)

THE METRICS (L340)
  the task success (L340) — the goal achieved (L340)
  the efficiency (L340) — the steps taken (L340)
  the cost (L334) — the tokens (L332) and the spend (L334)
  per completed task (L340)

THE EVALUATION (L340)
  the golden tasks (L342) — the labeled tasks (L340)
  the judge (L343) — the trajectory's score (L343)
  the human (L341) — the sampled review (L341)
  the suite (L341) — the CI (L296) gate (L341)

INTERVIEW, 4 MOVES
  1 task       "the goal with the outcome (L340)"
  2 trajectory "the path of the calls (L340)"
  3 metrics    "the success, the efficiency, the cost (L340)"
  4 eval       "the golden tasks and the judge (L342, L343)"
```

## 18. Key Takeaways

> [!RECAP]
> - The agent evaluation **measures the trajectories, the task success, and the cost per completed task** (L340): the task (L340), the trajectory (L340), the metrics (L340), and the evaluation (L340)
> - **The task** (L340): the goal (L340) — the user's request (L328) with the defined outcome (L340)
> - **The trajectory** (L340): the path of the calls (L340) — the tool calls (L315), the observations (L340), and the reasoning (L340)
> - **The metrics** (L340): the task success (L340), the efficiency (L340) — the steps (L340) and the loops (L205) — and the cost (L334) per completed task (L340)
> - **The evaluation** (L340): the golden tasks (L342), the judge (L343), and the human (L341) — in the suite (L341)
> - **The principle** (L340): the agent (L200) is the trajectory (L340) — the path (L340) evaluated, not just the outcome (L340): the broken tool (L339), the excessive loop (L205), and the wasted cost (L334) shown (L340)

## Check your understanding

Answer these without looking back.

1. What's the task (L340)?
2. Why the trajectory (L340)?
3. What are the golden tasks (L342)?
4. How do you measure the cost (L334)?
5. What's the judge (L343)?
6. What's the efficiency (L340)?
7. What's the gate (L341)?
8. What is the agent's debrief (L340)?

## A Closing Note — The Debrief, Filed

You now hold the eval: **the task, the trajectory, the metrics, and the evaluation — with the objective defined and the route debriefed.** The mission's debrief is complete — and the next route is tuned (L340).

Next: the eval suite that runs on every deploy — Regression Testing for AI (L341).
