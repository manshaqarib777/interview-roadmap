# Lesson 205 — Agent Loops & Termination

**Interview importance:** ⭐⭐⭐⭐⭐ — "what stops an agent?" — the answer is the *stop boundary*: max iterations, token budget, task-done detection, and the loop-safety triggers that keep agents sane (L200, L211).**

L200 drew the loop; the stop boundary is this lesson: **agent loops & termination** — when the loop ends. The loop's power is its repetition; its danger is unbounded repetition (L211). The stop design has four parts: **task-done detection** (the model's final answer, L203), **max iterations** (the hard ceiling, L200), **budget** (tokens and cost, L149, L150), and **loop-safety triggers** (repetition, stalling, divergence — L211). An agent that can't stop is not an agent — it's a bill (L150) and a liability (L211).

The distinction this lesson is built on: a **demo** has `while (true)` with hope. A **solutions architect** designs termination: the four stop conditions (L205), each with its own response — a clean finish, a bounded retry, a graceful handoff to the user (L208) — and the loop's health observed (L213) so the stop design is measured, not assumed (L341).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the stop boundary: the four stop conditions (L205)
- Design task-done detection: the model's answer vs a task-completion check (L203)
- Design the hard ceilings: max iterations and the token budget (L149, L200)
- Design the loop-safety triggers: repetition, stalling, divergence (L211)
- Explain the stop responses: clean finish, handoff, escalation (L208)

## 1. One-Line Definition

**Agent loops & termination is the stop boundary of the L200 diagram — the loop ends by design through four stop conditions: task-done detection (the model's final answer, L203), max iterations (the hard ceiling, L200), the token and cost budget (L149, L150), and loop-safety triggers (repetition, stalling, divergence, L211) — each with a designed response, because an agent that can't stop is a bill and a liability.**

The one-sentence interview answer: *"Termination is the stop boundary — the loop ends by design, through four conditions (L205). Task-done: the model emits its final answer (L203) — and for high-stakes tasks, a completion check verifies the answer actually addresses the task (L343). Max iterations: the hard ceiling — no loop runs forever (L200). Budget: the token and cost ceiling (L149, L150) — the loop stops when the money says stop. Loop-safety: repetition detection — the same tool call twice with no progress (L211); stalling — no new information across cycles (L211); divergence — the loop drifting from the task (L211). Each condition has a response: a clean finish, a handoff to the user (L208), or an escalation. The stop design is the loop's discipline — and it's observed (L213) and measured (L341), not assumed."*

## 2. Mental Model

Think of the stop conditions as **the safety systems on a machine — the off switches, and they're redundant.** The operator (task-done) turns the machine off when the job is done. The fuse (max iterations) blows when the machine has run too long. The fuel gauge (budget, L149) stops it when the money's gone. And the vibration sensor (loop-safety, L211) stops it when it's spinning in place — the same motion, no progress. A machine with one off switch fails when that switch is missed; the four conditions make "stops" the designed default (L205).

```text
   the four stop conditions (L205)
   ┌────────────────────────────────────────────────────────┐
   │ TASK-DONE    the model's final answer (L203)           │
   │ MAX STEPS    the hard iteration ceiling (L200)         │
   │ BUDGET       tokens and cost run out (L149, L150)      │
   │ SAFETY       repetition · stalling · divergence (L211) │
   └────────────────────────────────────────────────────────┘
       each fires → a designed response (L208)
```

The mental model is **redundant off switches**: no single failure can keep the loop running, because four independent conditions each stop it (L205).

## 3. Visual Flow — When the Loop Stops

```text
   the loop is running (L200)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · TASK-DONE? (L203)                                    │
   │     the model answered without a tool call               │
   │     → clean finish (verify with a check, L343)           │
   └──────────────────┬───────────────────────────────────────┘
                      ▼ no
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · SAFETY? (L211)                                       │
   │     repeating the same call? no new info? drifted?       │
   │     → stop — hand off or escalate (L208)                 │
   └──────────────────┬───────────────────────────────────────┘
                      ▼ no
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · BUDGET? (L149, L150)                                 │
   │     steps or tokens past the ceiling?                    │
   │     → stop — summarize what was learned (L206)           │
   └──────────────────────────────────────────────────────────┘
                      ▼ no
   the loop continues — one more cycle (L200)
```

The flow is the stop design: **task-done → safety → budget → continue** — the loop stops at the first condition that fires, each with its response (L205).

## 4. How It Works — The Four Conditions

- **Task-done (L203).** The model's final answer — a response with no tool call. For high-stakes tasks, a **completion check** verifies the answer addresses the task (L343) — the model can declare done prematurely (L211), so the check is the senior addition (L341).
- **Max iterations (L200).** The hard ceiling — the loop never runs past N steps. The ceiling is a design number: the task's expected steps plus headroom (L205), and the safety net when task-done fails (L211).
- **Budget (L149, L150).** The token and cost ceiling — the loop stops when the budget says stop (L149). The budget is the cost control (L150): a runaway loop is a runaway bill (L211).
- **Loop-safety (L211).** The failure detectors: **repetition** — the same tool call with no progress (L211); **stalling** — no new information across cycles (L206); **divergence** — the loop drifting from the task (L211). Each detector is a designed check on the trace (L213).

> [!NOTE]
> **The responses are designed, not accidents (L208).** Each stop condition has a response: task-done → the answer, verified (L343); max steps and budget → a graceful stop that summarizes the progress (L206) and hands off to the user (L208); safety triggers → an escalation path (L208) — the loop tells a human what it was doing (L213). The design is the difference between "the agent stopped cleanly with a summary" and "the loop died at the budget" (L211). Every stop is a UX and a handoff, not just an exit (L205).

## 5. Real Project Usage

- **Research agent.** Task-done: the synthesis is written (L203). Safety: repeated identical searches stop it (L211). Budget: the token ceiling (L149) bounds a deep dive (L150).
- **Support agent.** Task-done: the reply is drafted (L203). Budget: the ticket's cost ceiling (L149). Safety: circling between two tools escalates to a human (L208).
- **Coding agent.** Task-done: the tests pass (L203). Max iterations: the fix attempt is bounded (L205). Safety: the same failing test repeated stops the loop (L211).
- **Finance agent.** Budget: the transfer amount and the loop cost are both capped (L149, L150). Safety: repeated transfer attempts escalate (L208).
- **Any agent (L216).** The four conditions are the stop boundary of the L200 diagram — every agent gets them (L205).

The through-line: **termination is the loop's discipline** — the four conditions, the designed responses, and the observation (L213) that proves the stop design works (L341).

## 6. Interview Explanation

Say it in four moves:

1. **The four conditions.** "Task-done, max iterations, budget, loop-safety (L205)."
2. **The safety detectors.** "Repetition, stalling, divergence — checked on the trace (L211, L213)."
3. **The budgets.** "Max steps and the token/cost ceiling (L149, L150) — the loop stops when the money says stop."
4. **The responses.** "Each stop is designed: a verified answer, a graceful summary + handoff (L208), or an escalation (L205)."

## 7. Senior-Level Insights

- **Termination is the loop's architecture (L205).** The senior answer designs the stops *before* the loop — the demo adds them after the first runaway (L211).
- **Task-done needs a completion check (L343).** The model can declare done prematurely (L211) — the senior design verifies the answer against the task (L343), like the groundedness check (L337) verifies RAG answers (L195).
- **The budgets are the cost controls (L149, L150).** Max steps and the token ceiling (L149) are the bill's ceiling (L150) — a loop without budgets is an unbounded cost (L211).
- **The safety detectors are trace checks (L213).** Repetition, stalling, and divergence are patterns in the trace (L213) — the senior design checks the log, not the model's self-report (L211).
- **The stop responses are UX (L208).** Every stop is a handoff (L208) — the user gets a summary (L206) or an escalation, never a dead loop (L205).

## 8. Common Mistakes

- **No stop conditions (L205).** `while (true)` with hope — the runaway loop (L211) and the bill (L150).
- **Only max iterations (L205).** The ceiling fires, but the loop dies with no summary and no handoff (L208) — the response missing (L206).
- **Trusting the model's "done" (L211).** No completion check — premature finishes ship (L343).
- **No safety detectors (L211).** The loop spins in place — repetition and stalling undetected (L213).
- **Budget as an afterthought (L149).** The token ceiling added after the bill — the cost control retrofitted (L150).
- **Stops without observation (L341).** The stop design never measured — which condition fires, how often, and whether the responses work (L213).

## 9. Best Practices

- **Design the four conditions first** (L205) — before the loop runs (L200).
- **Verify task-done for high-stakes tasks** (L343) — a completion check (L203).
- **Set the ceilings from the task** (L205) — expected steps + headroom (L149).
- **Detect the safety patterns on the trace** (L211, L213) — repetition, stalling, divergence.
- **Design every stop's response** (L208) — a summary (L206), a handoff, an escalation.
- **Measure the stops** (L341) — which condition fires, and whether the loop completes (L343).

## 10. Interview Questions

**Q: What stops an agent?**
> A: Four stop conditions, by design (L205). Task-done — the model's final answer, verified by a completion check for high-stakes tasks (L203, L343). Max iterations — the hard ceiling (L200). Budget — the token and cost ceiling (L149, L150). Loop-safety — repetition, stalling, and divergence detected on the trace (L211, L213). Each fires with a designed response (L208) — the loop never just dies.

**Q: Why can't you rely on the model saying "done"?**
> A: Because premature completion is a real failure (L211). The model can answer without having fully addressed the task — especially when the context is long (L206). So for high-stakes tasks, the senior design adds a completion check: does the answer actually address the task (L343)? Same idea as the groundedness check in RAG (L337) — the model's declaration is verified, not trusted (L195).

**Q: What are the loop-safety triggers?**
> A: Patterns in the trace (L213). Repetition — the same tool call with no progress (L211). Stalling — no new information across cycles (L206). Divergence — the loop drifting from the task (L211). Each is a check on the log, not the model's self-report (L213) — the trace says what actually happened (L205).

**Q: What happens when a stop fires?**
> A: A designed response (L208). Task-done → the verified answer. Max steps or budget → a graceful stop: summarize what the loop learned (L206) and hand off to the user (L208). Safety triggers → an escalation path — a human sees the trace and takes over (L213). Every stop is a handoff, not an exit — the user never faces a dead loop (L205).

## 11. Follow-Up Questions

- How does the completion check work (L343)?
- How do you detect repetition in the trace (L213)?
- What's in the graceful-stop summary (L206)?
- How do the budgets compose with cost control (L150)?
- How do you measure the stop design (L341)?

## 12. Comparison Table — Unbounded vs Designed Termination

| | Unbounded (L211) | Designed (this lesson) |
|---|---|---|
| Task-done (L203) | the model's word | + completion check (L343) |
| Max iterations (L200) | none | the hard ceiling (L205) |
| Budget (L149) | none | the token/cost ceiling (L150) |
| Safety (L211) | none | repetition/stall/divergence on the trace (L213) |
| Response (L208) | the loop dies | summary + handoff + escalation (L206) |
| Measurement (L341) | none | which condition fires, how often |

The senior read: **the right column is the stop boundary** — the four conditions and their designed responses (L205).

## 13. Code Example — The Stop Boundary

```js
// Agent termination: the four stop conditions, each with a response (L205, L208).
async function runAgent(task, { maxSteps = 10, tokenBudget = 20_000, tools }) {
  const trace = [];                                   // L213
  let tokens = 0;

  for (let step = 0; step < maxSteps; step++) {       // CONDITION 2 — the ceiling (L200)
    // CONDITION 1 — task-done (L203).
    const response = await chat({ messages, tools });
    if (!response.toolCalls?.length) {
      const check = await completionCheck(task, response);      // L343
      return check.ok ? { done: 'answer', answer: response }    // verified finish
                      : { done: 'handoff', reason: 'incomplete', summary: summarize(trace) };  // L208
    }

    // CONDITION 4 — loop-safety on the trace (L211, L213).
    const safety = checkSafety(trace, response);      // repetition · stalling · divergence
    if (safety.triggered) {
      return { done: 'escalate', reason: safety.type, summary: summarize(trace) };  // L208
    }

    tokens += response.usage;
    // CONDITION 3 — the budget (L149, L150).
    if (tokens > tokenBudget) {
      return { done: 'handoff', reason: 'budget', summary: summarize(trace) };      // L206, L208
    }

    const result = await executeTool(response.toolCalls[0]);   // L201
    trace.push({ step, call: response.toolCalls[0], result }); // L213
  }
  return { done: 'handoff', reason: 'max-steps', summary: summarize(trace) };  // the ceiling + handoff (L208)
}
```

```text
What the reader must SEE — the four conditions, the responses:

  !toolCalls → completion check (L343) → verified answer or handoff
  checkSafety(trace) → repetition/stall/divergence → escalate (L211)
  tokens > tokenBudget → handoff with a summary (L149, L206)
  the for-loop ceiling → max steps (L200)

  Every stop is designed; the loop never just dies.
```

```narrate
6: The max-iteration ceiling — the hard stop (L200, L205).
7-13: Task-done — the answer is verified by a completion check (L203, L343); failure becomes a handoff with a summary (L208).
15-20: Loop-safety — the trace is checked for repetition, stalling, and divergence; triggers escalate (L211, L213).
22-26: The budget — the token ceiling (L149) stops the loop with a graceful handoff (L150, L206).
28-31: The trace records every cycle — the data the safety checks and the summaries read (L213).
32-33: The final response — the ceiling fires with a summary, never a dead exit (L208).
```

> [!TIP]
> The line that makes termination a design: **`return { done: 'handoff', reason: 'budget', summary: summarize(trace) }`** — the stop *and its response*. **A stop without a handoff is a dead loop (L205, L208).**

## 14. Performance Notes

- **The ceilings are the cost controls (L149, L150).** Max steps and the token budget (L149) are the bill's ceiling (L150) — the loop's economics are the stop design (L205).
- **The safety checks are cheap (L151).** Repetition and stalling are trace pattern checks (L213) — microseconds per cycle (L211).
- **The completion check is the eval cost (L343).** A model call per finish (L337-style) — applied to high-stakes tasks, sized to the budget (L150).
- **The summary is the handoff's content (L206).** A graceful stop summarizes the trace (L213) — the user and the escalation both read it (L208).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The loop runs forever | No stop conditions (L205) | Add the four (L200) |
| Premature answers | No completion check (L343) | Verify task-done (L203) |
| The loop spins | No repetition detection (L211) | Check the trace patterns (L213) |
| The bill explodes | No budget (L149) | Add the token ceiling (L150) |
| Dead-loop UX | No handoff response (L208) | Summarize + escalate (L206) |

## 16. Quick Revision Notes

- Termination = **the stop boundary** (L205): four conditions.
- **Task-done** — verified by a completion check (L203, L343).
- **Max iterations** — the hard ceiling (L200).
- **Budget** — the token/cost ceiling (L149, L150).
- **Loop-safety** — repetition, stalling, divergence on the trace (L211, L213).
- Every stop has a **response**: answer, handoff (L208), escalation (L205).

## 17. Cheat Sheet

```text
AGENT LOOPS & TERMINATION = the stop boundary

THE FOUR CONDITIONS (L205)
  1 task-done     the model's final answer (L203)
                  + a completion check for high-stakes (L343)
  2 max iterations the hard ceiling (L200) — N steps + headroom
  3 budget        the token/cost ceiling (L149, L150)
  4 loop-safety   repetition · stalling · divergence (L211)
                  detected on the TRACE, not the self-report (L213)

THE RESPONSES (L208)
  task-done → the verified answer (L343)
  ceiling/budget → a graceful stop: summarize (L206) + handoff (L208)
  safety → escalation — a human sees the trace (L213)

THE RULES
  the loop stops by design, or it spins (L211)
  the ceilings are the cost controls (L150)
  premature "done" is verified, not trusted (L343)
  the stop design is measured (L341): which condition, how often

INTERVIEW, 4 MOVES
  1 conditions "task-done, max steps, budget, safety"
  2 safety     "repetition/stall/divergence on the trace (L211)"
  3 budgets    "the ceilings are the cost controls (L149)"
  4 responses  "every stop hands off — never a dead loop (L208)"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent termination is **the stop boundary** (L205): the loop ends by design through four conditions — task-done, max iterations, budget, and loop-safety
> - **Task-done is verified** (L343) — a completion check catches premature "done" (L211), like groundedness checks verify RAG answers (L337)
> - **Max iterations and the budget are the hard ceilings** (L200, L149) — the loop's cost controls (L150): an unbounded loop is an unbounded bill (L211)
> - **Loop-safety detects the failure patterns on the trace** (L211, L213) — repetition, stalling, and divergence are log checks, not model self-reports
> - **Every stop has a designed response** (L208): the verified answer, a graceful summary + handoff (L206), or an escalation — never a dead loop
> - The stop design is **measured** (L341) — which conditions fire, how often, and whether the loop completes (L343)

## Check your understanding

Answer these without looking back.

1. Name the four stop conditions (L205).
2. Why verify task-done (L343)?
3. What are the loop-safety triggers (L211)?
4. Why are the budgets the cost controls (L149)?
5. What are the designed responses (L208)?
6. Why check the trace, not the model's word (L213)?
7. What's in a graceful-stop summary (L206)?
8. How do you measure the stop design (L341)?

## A Closing Note — The Off Switches, Designed

You now hold the stop boundary: **task-done verified, the hard ceilings, the safety detectors on the trace, and a handoff for every stop.** The loop no longer runs until it dies — it ends by design, every time, with a summary in its hand.

Next: what the loop remembers — agent memory (L206), context, scratchpad, and long-term recall.
