# Lesson 207 — Agent State & Persistence

**Interview importance:** ⭐⭐⭐⭐ — "what happens when an agent crashes mid-run?" — the answer is *state and persistence*: what the agent holds (context, scratchpad, tool state, L206), how it's checkpointed (L213), and how the run resumes (L207).**

L206 gave you memory; this lesson is **memory that survives**: agent state & persistence. An agent's **state** is everything the run holds — the context (L206), the scratchpad (L206), the tool state (partial results, L201), the plan (L202), and the step count (L205). **Persistence** is checkpointing that state so the run survives crashes, restarts, and time (L207). The discipline: define the state, checkpoint it (L213), and resume from a checkpoint — because long-running agents *will* be interrupted (L211).

The distinction this lesson is built on: a **demo** runs the agent in memory and loses everything on a crash. A **solutions architect** treats the agent as a state machine (L215): the state is defined (L207), checkpointed at safe points (L213), and resumable — so a crash at step 40 resumes at step 40 with its context intact (L206), not from scratch (L207).

## Learning Objectives

By the end of this lesson you should be able to:

- Define agent state: context, scratchpad, tool state, plan, step count (L207)
- Explain persistence: checkpointing the state at safe points (L213)
- Design resume: rebuild the window, restore the scratchpad, continue the plan (L206)
- Explain the state machine view: agents as checkpoints + transitions (L215)
- Explain the failure modes: lost state, partial writes, corrupted checkpoints (L211)

## 1. One-Line Definition

**Agent state & persistence is what makes a run survivable — the agent's state (context, scratchpad, tool results, plan, step count, L206) is defined, checkpointed at safe points (L213), and resumable — so a crash at step 40 resumes at step 40 with its context intact (L206), because long-running agents will be interrupted (L211) and a run that restarts from zero is a run that wastes everything before the crash.**

The one-sentence interview answer: *"Agent state is everything the run holds, and persistence is checkpointing it (L207). The state: the curated context (L206), the scratchpad (the plan, the reasoning, L202–203), the tool state (partial results, L201), and the step count (L205). Persistence: I checkpoint that state at safe points — after each tool result, before risky actions (L208) — so the run can resume (L213). Resume: rebuild the window from the checkpoint (L206), restore the scratchpad, continue the plan (L202). I treat the agent as a state machine (L215): checkpoints are the states, the tool calls are the transitions. The failure modes are the usual distributed-systems ones — lost state, partial writes, corrupted checkpoints (L211) — so the checkpoint is atomic and versioned (L255). A crash is an interruption, not a restart (L207)."*

## 2. Mental Model

Think of the agent's state as **a book with a bookmark.** The book is the run: the plan (L202), the reasoning (L203), the results (L205) — everything the run holds. The bookmark is the checkpoint (L213): it marks exactly where you are, so when you're interrupted (a crash, L211), you open the book, find the bookmark, and continue — you don't re-read the book from page one (L207). Without the bookmark, an interruption means starting over; with it, the interruption costs only the page you were on (L207).

```text
   the run (the book)                  the checkpoints (the bookmark)
   ┌──────────────────────────┐        ┌──────────────────────────────┐
   │ plan (L202) · reasoning  │        │ after each tool result       │
   │ (L203) · results (L205)  │        │ (the safe point, L213)       │
   │ context (L206) · step N  │  ────► │ atomic + versioned (L255)    │
   │ (L205)                   │        │ resume: rebuild window,      │
   └──────────────────────────┘        │ restore scratchpad (L206)   │
                                        └──────────────────────────────┘
```

The mental model is **book + bookmark**: the run's contents and the marker that makes interruptions survivable (L207).

## 3. Visual Flow — Crash, Checkpoint, Resume

```text
   the run at step 40 (L200)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CHECKPOINT (L213)                                    │
   │     at a safe point — after a tool result, before a      │
   │     risky action (L208) — the state is written:          │
   │     context (L206) + scratchpad (L202) + step count      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼  (the process crashes — L211)
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · RESTART (L207)                                       │
   │     the orchestrator loads the latest checkpoint         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · RESUME (L206, L202)                                  │
   │     rebuild the window from the checkpoint               │
   │     restore the scratchpad — continue the plan at step 40│
   └──────────────────────────────────────────────────────────┘
                      ▼
   the run continues — the crash cost only the last step (L207)
```

The flow is the survival story: **checkpoint at safe points → crash → load the checkpoint → resume** — the interruption costs the last step, not the run (L207).

## 4. How It Works — The State, the Checkpoints, the Resume

- **The state (L207).** Everything the run holds: the curated context (L206), the scratchpad — plan (L202), reasoning (L203) — the tool state (partial results, L201), and the step count (L205). The state is the run; persistence is the state's survival (L207).
- **The checkpoints (L213).** The state is written at safe points: after each tool result (a natural boundary, L201), before risky actions (so the action can be re-run or gated, L208), and at step boundaries (L205). A checkpoint is **atomic** (all-or-nothing, L255) and **versioned** (schema changes, L341).
- **The resume (L206, L202).** On restart, the orchestrator loads the latest checkpoint: rebuild the window (L206) from the saved context, restore the scratchpad (L202), and continue the plan from the saved step (L205). The tool state determines what to re-run — idempotent tools (L255) are simply re-executed (L201).
- **The state machine view (L215).** The agent *is* a state machine: checkpoints are the states, tool calls are the transitions (L215). This view is what LangGraph (L215) implements — and what makes the agent testable (L341) and resumable (L207).

> [!NOTE]
> **A crash is an interruption, not a restart (L207).** Without persistence, a crash at step 40 means re-running 40 steps — the tokens (L150), the latency (L151), and the risk of divergence (L211) all repeat. With checkpoints, the crash costs the last step (L207). The senior design treats interruption as the default assumption: "the process will die" is the design premise (L211), and the checkpoint is the insurance (L213). The same discipline as databases — the write-ahead log (L119) — applied to the agent (L207).

## 5. Real Project Usage

- **Long research runs.** Hours of searches — checkpointed after each finding (L213); a crash resumes with the findings intact (L207).
- **Automation workflows (L217).** A workflow with an agentic fork (L230) — the fork's state persists so the workflow can resume after a restart (L207).
- **Coding agents.** The edit plan and the test results checkpointed — a crash before the final commit resumes the plan (L202).
- **Human-in-the-loop tasks (L208).** The state is checkpointed *before* the approval gate (L208) — the human's approval resumes the exact action (L207).
- **Anything long-running (L216).** The state machine is the production pattern (L215) — persistence is what makes long runs possible (L207).

The through-line: **a long-running agent without persistence is a liability** — the state machine (L215) with checkpoints (L213) is what makes runs survivable (L207).

## 6. Interview Explanation

Say it in four moves:

1. **The state.** "Everything the run holds: context (L206), scratchpad (L202), tool state (L201), step count (L205)."
2. **The checkpoints.** "Written at safe points — after tool results, before risky actions (L208) — atomic and versioned (L255)."
3. **The resume.** "Load the latest checkpoint, rebuild the window (L206), restore the scratchpad, continue the plan (L202)."
4. **The view.** "The agent is a state machine (L215): checkpoints are states, tool calls are transitions — a crash is an interruption, not a restart (L207)."

## 7. Senior-Level Insights

- **The agent is a state machine (L215).** The senior answer models the agent as states and transitions (L215) — the view that makes it testable (L341), resumable (L207), and implementable with LangGraph (L215).
- **The checkpoint is a database discipline (L255).** Atomic writes (L255), versioned schemas (L341), and crash recovery — the write-ahead-log discipline (L119) applied to the agent's state (L207).
- **The safe points are the design (L213).** Where to checkpoint is a decision: after tool results (L201) and before risky actions (L208) — the checkpoints bracket the irreversible (L212).
- **Idempotency is the resume's enabler (L255).** Re-running a tool on resume is only safe if the tool is idempotent (L255) — the resume design and the tool design (L201) are one decision (L207).
- **Persistence composes with memory and trace (L206, L213).** The checkpoint is the scratchpad persisted (L206); the trace (L213) is the checkpoint's audit — the three are one record (L207).

## 8. Common Mistakes

- **No persistence (L207).** The run in memory — a crash is a full restart (L211), the tokens re-spent (L150).
- **Checkpointing too rarely (L213).** The state saved at the end — the crash before the save loses everything (L211).
- **Checkpointing too often (L150).** The state written every micro-step — the write cost (L151) and the storage (L150) outweigh the safety (L207).
- **Non-atomic writes (L255).** A partially written checkpoint — the resume loads a corrupted state (L211).
- **Non-idempotent tools on resume (L255).** Re-running a non-idempotent tool double-executes (L201) — the resume breaks (L207).
- **The schema unversioned (L341).** The agent evolves, the checkpoints don't — a resume after a deploy loads an old shape (L207).

## 9. Best Practices

- **Define the state first** (L207) — context, scratchpad, tool state, step count (L206).
- **Checkpoint at safe points** (L213) — after tool results (L201), before risky actions (L208).
- **Write atomically and versioned** (L255, L341) — the database discipline (L119).
- **Make the tools idempotent** (L255) — the resume re-runs safely (L201).
- **Treat the agent as a state machine** (L215) — checkpoints as states, calls as transitions.
- **Test the resume** (L341) — kill the process mid-run in the golden set (L343).

## 10. Interview Questions

**Q: What is agent state?**
> A: Everything the run holds (L207): the curated context (L206), the scratchpad — the plan (L202) and the reasoning (L203) — the tool state (partial results, L201), and the step count (L205). Persistence is checkpointing that state at safe points (L213) so the run can resume (L207).

**Q: What happens when an agent crashes?**
> A: With persistence, an interruption (L207). The orchestrator loads the latest checkpoint — the atomic, versioned write (L255) — rebuilds the window (L206), restores the scratchpad, and continues the plan (L202). The crash costs the last step, not the run (L207). Without it, a crash at step 40 re-runs 40 steps — tokens (L150), latency (L151), and divergence risk (L211) all repeat.

**Q: Where do you checkpoint?**
> A: At safe points (L213): after each tool result (a natural boundary, L201) and before risky actions (L208) — the checkpoints bracket the irreversible. Not every micro-step (the write cost, L150), not just at the end (the crash before the save, L211). The safe points are a design decision, tuned to the run's risk (L207).

**Q: How does resume work with tools?**
> A: Idempotency (L255). On resume, a tool that already ran can be re-executed only if re-running is safe — idempotent tools (L255) simply re-run; non-idempotent ones resume from their recorded result (L201). The resume design and the tool design are one decision (L207) — and the state machine view (L215) is what makes it all testable (L341).

## 11. Follow-Up Questions

- What are the safe points for a given run (L213)?
- How does idempotency enable resume (L255)?
- How does the state machine view help (L215)?
- How do you test the resume path (L341)?
- How does persistence compose with the trace (L213)?

## 12. Comparison Table — In-Memory vs Persistent

| | In-memory (L211) | Persistent (this lesson) |
|---|---|---|
| State (L207) | implicit | defined — context, scratchpad, step (L206) |
| Crash (L211) | full restart | resume from the checkpoint (L207) |
| Checkpoints (L213) | none | at safe points, atomic (L255) |
| Cost (L150) | re-runs repeat | the write cost only |
| Tools (L255) | — | idempotent, for safe resume |
| View (L215) | a loop | a state machine (L215) |

The senior read: **the right column is the survival design** — interruption assumed, resume designed (L207).

## 13. Code Example — The State Machine

```js
// Agent state & persistence: checkpoint, crash, resume (L207, L213).
const STATE = {                                        // the defined state (L207)
  context: { goal, history },                          // L206
  scratchpad: { plan, reasoning, results },            // L202-205
  toolState: {},                                       // partial results (L201)
  step: 0,                                             // L205
  version: 3,                                          // schema version (L341)
};

// CHECKPOINT — at safe points, atomic (L255, L213).
async function checkpoint(state, reason) {
  await db.put(`agent:run:${state.id}:${state.step}`,  // the write (L255)
    JSON.stringify(state), { atomic: true });
  //  after a tool result (L201), before a risky action (L208)
}

// RESUME — load the latest, rebuild, continue (L207).
async function resume(runId) {
  const state = await db.getLatest(`agent:run:${runId}`);   // atomic read (L255)
  if (state.version !== 3) await migrate(state);            // versioned (L341)
  const window = rebuildWindow(state.context);              // L206
  return { state, window };                                 // continue the plan (L202)
}

// The run: checkpoint at safe points, resume after a crash (L207).
const { state, window } = await resume(runId);              // restart (L207)
for (let s = state.step; s < 10; s++) {                     // resume, not re-run (L205)
  const r = await chat({ messages: window, tools });
  if (!r.toolCalls?.length) break;
  const result = await executeTool(r.toolCalls[0]);         // L201
  state.scratchpad.results.push(result); state.step = s + 1;
  await checkpoint(state, 'after-tool');                    // the safe point (L213)
}
```

```text
What the reader must SEE — the state, the checkpoint, the resume:

  STATE: context, scratchpad, toolState, step, version (L207, L341)
  checkpoint() at safe points, atomic (L255, L213)
  resume() loads + migrates + rebuilds (L207, L206)
  for (s = state.step…) — resume, not re-run (L205)

  A crash is an interruption. The checkpoint is the bookmark.
```

```narrate
2-8: The defined state — context (L206), scratchpad (L202), tool state (L201), step (L205), and the schema version (L341).
10-14: The checkpoint — atomic writes at safe points (L255, L213).
16-20: The resume — load the latest, migrate the version, rebuild the window (L207, L206).
22-27: The run continues from the saved step — the crash cost only the last cycle (L205, L207).
```

> [!TIP]
> The line that makes the crash survivable: **`for (let s = state.step; s < 10; s++)`** — the loop starts at the saved step, not at zero. **Resume is the point of persistence; the checkpoint is just its bookmark (L207).**

## 14. Performance Notes

- **The checkpoint is a write cost (L150).** Every safe-point write is storage and latency (L151) — the safe-point frequency is a cost/safety trade (L207).
- **The resume saves the re-run cost (L150).** The checkpoint's write is cheap next to re-running 40 steps of tools (L151) and tokens (L149).
- **Atomic writes need the DB discipline (L255).** The checkpoint store is a database concern (L119) — transactions (L255) and backups (L207) included.
- **The state's size grows with the run (L206).** The scratchpad (L206) can be summarized at checkpoints (L206) — the checkpoint stays lean (L150).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Full restarts after crashes | No checkpoints (L213) | Add safe-point writes (L207) |
| Corrupted resumes | Non-atomic writes (L255) | Make the checkpoint atomic (L119) |
| Double-executed tools | Non-idempotent tools (L255) | Record results; re-run only idempotent (L201) |
| Resume after deploy fails | Schema unversioned (L341) | Version + migrate the state (L207) |
| Checkpoint writes slowing the run | Too frequent (L150) | Space the safe points (L213) |

## 16. Quick Revision Notes

- Agent state = **context, scratchpad, tool state, step** (L207, L206).
- Persistence = **checkpoints at safe points** (L213), atomic (L255).
- Resume = **load, rebuild the window (L206), continue the plan (L202)**.
- The view: **the agent is a state machine** (L215).
- The premise: **interruption is the default** (L211) — a crash is an interruption, not a restart (L207).
- Idempotent tools (L255) make the resume safe (L201).

## 17. Cheat Sheet

```text
AGENT STATE & PERSISTENCE = the run that survives

THE STATE (L207)
  context    the curated window (L206)
  scratchpad the plan (L202), reasoning (L203), results (L205)
  toolState  partial results (L201)
  step       the step count (L205)
  version    the schema version (L341)

THE CHECKPOINTS (L213)
  at safe points — after tool results (L201), before risky actions (L208)
  atomic writes (L255) · versioned schemas (L341)

THE RESUME (L207)
  load the latest checkpoint → migrate (L341)
  rebuild the window (L206) → restore the scratchpad (L202)
  continue from the saved step (L205) — idempotent tools re-run (L255)

THE VIEW (L215)
  the agent is a state machine: checkpoints = states,
  tool calls = transitions — testable (L341), resumable (L207)

THE PREMISE (L211)
  the process WILL die — interruption is the default
  a crash is an interruption, not a restart (L207)

INTERVIEW, 4 MOVES
  1 state    "context, scratchpad, tool state, step"
  2 checkpoints "safe points, atomic (L213, L255)"
  3 resume   "load, rebuild, continue (L207)"
  4 view     "the state machine (L215) — crash = interruption"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent state is **everything the run holds** (L207): context (L206), scratchpad (L202–205), tool state (L201), and the step count (L205)
> - **Persistence is checkpointing at safe points** (L213) — after tool results (L201) and before risky actions (L208) — written atomically (L255) and versioned (L341)
> - **Resume** loads the latest checkpoint, rebuilds the window (L206), restores the scratchpad (L202), and continues from the saved step (L205)
> - **The agent is a state machine** (L215): checkpoints are states, tool calls are transitions — the view that makes agents testable (L341) and resumable (L207)
> - **Idempotent tools enable safe resume** (L255) — re-running a tool on restart is only safe when re-running is safe (L201)
> - **Interruption is the default premise** (L211) — the process will die; a crash is an interruption, not a restart (L207)

## Check your understanding

Answer these without looking back.

1. What's in the agent's state (L207)?
2. Where are the safe points (L213)?
3. How does resume work (L207)?
4. Why is the agent a state machine (L215)?
5. What makes resume safe with tools (L255)?
6. Why is interruption the design premise (L211)?
7. What are the checkpoint failure modes (L255)?
8. Why version the state (L341)?

## A Closing Note — The Bookmark That Survives the Crash

You now hold the survival design: **the defined state, the atomic checkpoints at safe points, the resume that continues from the bookmark — and the state machine view that makes it all testable.** The agent no longer dies with the process — it pauses, and it resumes.

Next: the human at the controls — human-in-the-loop (L208), approval gates and interrupts.
