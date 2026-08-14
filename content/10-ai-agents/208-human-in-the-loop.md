# Lesson 208 — Human-in-the-Loop

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you keep an agent safe?" — the answer is *the human gate*: approval for risky actions, interrupts for course-correction, and the control points that make agency accountable (L212, L324).**

L205 stopped the loop; this lesson is **the human at the controls**: human-in-the-loop (HITL) — the approval gates, interrupts, and control points that put a human between the agent and its riskiest actions (L212). Three patterns: **approval gates** (the agent proposes, the human approves — for consequential actions, L208), **interrupts** (the human stops or redirects the loop mid-run, L205), and **human takeover** (the human continues the task manually, L207). The discipline: the gate is a designed control point — the agent is *accountable* because the human can say no (L324).

The distinction this lesson is built on: a **demo** lets the agent run everything. A **solutions architect** designs the control points: which actions are approval-gated (consequence, L212), where the interrupts live (the trace, L213), and how the human's decision is recorded (L322) — the HITL design is the accountability architecture (L324).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain HITL: approval gates, interrupts, and takeover (L208)
- Design the gates: which actions, at what risk threshold (L212, L315)
- Design the interrupts: when the human can stop or redirect (L205, L213)
- Explain the checkpointing that brackets the gate (L207)
- Explain the audit: the human's decisions recorded (L322)

## 1. One-Line Definition

**Human-in-the-loop is the control architecture that makes agency accountable — approval gates (the agent proposes, the human approves, for consequential actions, L212), interrupts (the human stops or redirects the loop, L205), and takeover (the human continues the task, L207) — designed control points where the loop's riskiest transitions wait for a human decision, recorded for the audit trail (L322).**

The one-sentence interview answer: *"HITL is the accountability architecture (L208). Three patterns. Approval gates — the agent proposes a consequential action — a refund, a transfer, a publish — and the system waits for a human's approval before executing (L212). The gate sits at the risk threshold: read actions run, write actions wait (L315). Interrupts — the human can stop or redirect the loop mid-run, from the trace (L213): 'that's the wrong direction, go back to step 12' (L207). Takeover — the human continues the task themselves from the checkpoint (L207). The design: the state is checkpointed before the gate (L207), the human's decision is recorded (L322), and the loop is accountable because the human can always say no (L324)."*

## 2. Mental Model

Think of HITL as **a pilot and a control tower.** The pilot (the agent) flies the loop — the routine actions are the pilot's (read, search, draft, L201). The control tower (the human) holds the approvals for the consequential ones — a course change, a landing, an emergency action — the pilot requests, the tower approves or denies (L208). The tower can also interrupt: "go around, try the other runway" (L205) — and if needed, the tower takes over the controls entirely (L207). Every decision is logged in the tower's logbook (L322): the pilot is accountable because the tower was in the loop at the critical moments (L324).

```text
   the pilot (agent)                    the tower (human)
   ┌─────────────────────────┐          ┌──────────────────────────────┐
   │ routine: read, search,  │          │ approve: refund, transfer,   │
   │   draft — no gate (L201)│  ─────►  │   publish — the risk gate    │
   │ risky: refund, publish  │          │   (L212, L315)               │
   │   → REQUEST approval    │          │ interrupt: redirect mid-run  │
   └─────────────────────────┘          │   (L205) · takeover (L207)   │
                                         │ every decision logged (L322) │
                                         └──────────────────────────────┘
```

The mental model is **pilot + tower**: routine actions fly free, consequential ones wait for approval, and the tower can interrupt or take over — with the logbook as the record (L322).

## 3. Visual Flow — The Approval Gate

```text
   the agent proposes an action (L201)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CLASSIFY THE RISK (L212, L315)                       │
   │     read-only? → executes, no gate (L201)                │
   │     consequential? → the gate (L208)                     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼ consequential
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · CHECKPOINT + REQUEST (L207, L213)                    │
   │     the state is saved (so approval resumes exactly)     │
   │     the human sees: the action + its context (L322)      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE HUMAN DECIDES (L208)                             │
   │     approve → execute (L212)                             │
   │     deny → the agent re-plans (L202)                     │
   │     edit → the human adjusts the parameters              │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   the decision is recorded (L322) → the loop continues (L200)
```

The flow is the gate: **classify risk → checkpoint + request → the human decides → record** — the consequential transition waits for a human (L208).

## 4. How It Works — The Three Patterns, the Threshold, the Record

- **Approval gates (L208).** The agent proposes a consequential action; the system waits for a human's approval (L212). The **threshold** is the design: read actions run (L201), write actions with consequence wait (L315) — refunds, transfers, publishes, deletes (L212). The gate's context matters: the human sees the action *and* why the agent proposed it (the reasoning, L203, and the trace, L213).
- **Interrupts (L205).** The human can stop or redirect the loop mid-run — from the trace (L213): the loop pauses, the human redirects (a new instruction, L202), and the loop resumes from the checkpoint (L207). The interrupt is the human's course-correction (L208).
- **Takeover (L207).** The human continues the task themselves — from the checkpoint (L207): the state is handed over, the human completes the remaining steps, and the record shows the handoff (L322).
- **The record (L322).** Every human decision is logged — the action, the context, the decision, the timestamp (L322). The record is the accountability: the loop's consequential actions are human-authorized, auditable (L324).

> [!NOTE]
> **The gate is where agency meets accountability (L324).** An agent that can execute any action is a liability (L212); an agent whose consequential actions wait for a human is a *tool* (L324). The senior design names the threshold: which actions are gated, and why (consequence, L212) — and brackets the gate with checkpoints (L207) so the human's approval resumes the exact action, and the record (L322) so the approval is auditable (L324). The gate is not friction — it's the design that makes the agent safe enough to use (L208).

## 5. Real Project Usage

- **Finance agents.** Transfers are approval-gated (L208); balance reads run free (L201). The gate shows the amount and the reason (L203).
- **Support agents.** Refunds and account changes wait for approval (L315); drafts run free. The human edits the refund amount before approving (L208).
- **Publishing agents.** Posts and emails are gated (L208); drafting runs free (L201). The human approves the copy (L324).
- **Automation workflows (L217).** The approval gates are the workflow's control points (L230) — the L228 pattern (L208).
- **Anything consequential (L212).** The gate is the accountability architecture (L324) — the control point that makes agency usable (L208).

The through-line: **HITL is where the agent's power becomes accountable** — the gates, interrupts, and takeover put a human at the consequential moments (L208, L324).

## 6. Interview Explanation

Say it in four moves:

1. **The three patterns.** "Approval gates for consequential actions (L208), interrupts for course-correction (L205), takeover for handoff (L207)."
2. **The threshold.** "Read actions run (L201); write actions with consequence wait (L315) — the threshold is the risk design (L212)."
3. **The mechanics.** "The state is checkpointed before the gate (L207), so approval resumes the exact action — and the human sees the action with its reasoning (L203, L213)."
4. **The record.** "Every decision is logged (L322) — the agent is accountable because the human can say no (L324)."

## 7. Senior-Level Insights

- **The threshold is the design (L212, L315).** The senior answer names *which* actions are gated and why — consequence, irreversibility (L212) — not "everything is gated" (friction, L151) or "nothing is" (liability, L211).
- **The gate's context is its quality (L203, L213).** A human approves better when they see the action *and* the agent's reasoning (L203) — the trace (L213) is the gate's input (L208).
- **The checkpoint brackets the gate (L207).** Approval resumes the exact action — the state is saved before the request (L207), so approve, deny, and edit all resume cleanly (L208).
- **The record is the accountability (L322, L324).** The audit trail (L322) of human decisions is what makes the agent's consequential actions defensible (L324) — the governance story (L373).
- **HITL composes with the failure modes (L211).** The gate is the answer to the excessive-agency failure (L212) — and the interrupt (L205) is the answer to drift (L211): the human's eyes are the last guardrail (L209).

## 8. Common Mistakes

- **No gates (L212).** Every action executes — the excessive-agency failure (L212); the agent is a liability (L211).
- **Everything gated (L151).** Every read waits for approval — friction (L151) and the human becomes the bottleneck (L150); the threshold is the design (L315).
- **Gates without context (L203).** The human approves blind — no reasoning, no trace (L213); the gate's quality is its context (L208).
- **No checkpoint before the gate (L207).** The approval resumes a different state — approve, deny, and edit break (L207).
- **Decisions unrecorded (L322).** The approvals leave no trail — the accountability (L324) is gone (L322).
- **Interrupts impossible (L205).** The human can't stop the loop — drift (L211) runs to the budget (L205).

## 9. Best Practices

- **Set the risk threshold** (L212, L315) — read free, consequential gated (L208).
- **Show the action with its reasoning** (L203, L213) — the gate's context is its quality (L208).
- **Checkpoint before the gate** (L207) — approval resumes the exact action (L255).
- **Record every decision** (L322) — the audit trail is the accountability (L324).
- **Design the interrupts** (L205) — the human can stop, redirect, or take over (L207).
- **Test the gate** (L341) — the golden set covers the approve/deny/edit paths (L343).

## 10. Interview Questions

**Q: How do you keep an agent safe?**
> A: Human-in-the-loop (L208). Three patterns: approval gates — the agent proposes a consequential action and the system waits for a human (L212); interrupts — the human stops or redirects the loop mid-run (L205); takeover — the human continues the task from the checkpoint (L207). The threshold is the design: read actions run (L201), write actions with consequence wait (L315). Every decision is recorded (L322).

**Q: Which actions are approval-gated?**
> A: The consequential ones (L212): refunds, transfers, publishes, deletes — write actions with irreversible effects (L315). Read actions — search, read, draft — run free (L201). The threshold is a design decision: too wide, the human is the bottleneck (L151); too narrow, the agent is a liability (L211). Consequence and irreversibility set the line (L212).

**Q: What does the human see at the gate?**
> A: The action and its reasoning (L208). The agent's proposal — the tool, the parameters (L201) — plus why it proposed it: the reasoning (L203) and the trace context (L213). A human approves better with the "why" in view (L324). The gate's context is its quality — a blind approval is a rubber stamp (L322).

**Q: How does the loop resume after the human decides?**
> A: The checkpoint brackets the gate (L207). The state is saved before the request (L207), so approve executes the exact action, deny re-plans (L202), and edit adjusts the parameters — all resuming cleanly (L255). And the decision is recorded (L322): the loop is accountable because the human's approvals are auditable (L324).

## 11. Follow-Up Questions

- How do you set the risk threshold (L212)?
- What context should the gate show (L203)?
- How does the interrupt work (L205)?
- How do you record the decisions (L322)?
- How does HITL compose with automation workflows (L228)?

## 12. Comparison Table — Unbounded vs Gated

| | Unbounded (L212) | Gated (this lesson) |
|---|---|---|
| Read actions (L201) | run | run (free) |
| Consequential (L315) | execute | approval-gated (L208) |
| Context (L203) | none | the action + reasoning (L213) |
| Checkpoint (L207) | none | before the gate (L255) |
| Interrupt (L205) | none | stop, redirect, takeover |
| Record (L322) | none | every decision logged (L324) |

The senior read: **the right column is the accountability architecture** — the human at the consequential moments, with the record to prove it (L208).

## 13. Code Example — The Approval Gate

```js
// Human-in-the-loop: the risk threshold, the gate, the record (L208, L322).
const RISK = {                                           // the threshold (L212, L315)
  read_only: ['get_balance', 'search_kb'],
  gated: ['refund', 'transfer', 'publish'],
};

async function runStep(proposal, ctx) {
  // CLASSIFY — read actions run free (L201, L315).
  if (RISK.read_only.includes(proposal.tool)) {
    return execute(proposal, ctx);                       // no gate (L208)
  }
  if (!RISK.gated.includes(proposal.tool)) return deny(proposal, 'tool not classified');

  // THE GATE — checkpoint, request, decide, record (L207, L208, L322).
  await checkpoint(ctx.state, 'before-gate');            // resume the exact action (L207)
  const request = {
    action: proposal,                                    // what (L201)
    reasoning: ctx.scratchpad.reasoning.at(-1),          // why (L203)
    context: summarizeTrace(ctx.trace),                  // the record (L213)
  };
  const decision = await humanApprove(request);          // the tower (L208)
  await logDecision(request, decision);                  // the logbook (L322)

  switch (decision.kind) {
    case 'approve': return execute(proposal, ctx);       // run it (L212)
    case 'edit':    return execute({ ...proposal, ...decision.changes }, ctx);  // adjusted (L208)
    case 'deny':    return replan(ctx, 'denied: ' + decision.reason);           // re-plan (L202)
  }
}
```

```text
What the reader must SEE — the threshold, the gate, the record:

  RISK.read_only → runs free · RISK.gated → the gate (L315, L208)
  checkpoint before the gate → resume the exact action (L207)
  humanApprove(request) → the action + the reasoning (L203)
  logDecision() → the audit trail (L322, L324)

  The human is in the loop at the consequential moments.
```

```narrate
2-6: The risk threshold — read tools run free, consequential tools are gated (L212, L315).
9-11: Read actions execute without a gate — the loop's routine work (L201).
13-15: Unclassified tools are denied — the threshold is enforced (L315).
17-19: The gate's mechanics — the state is checkpointed so approval resumes the exact action (L207).
20-24: The request shows the action AND the reasoning — the gate's context is its quality (L203, L213).
25-28: The human's decision is recorded — the accountability trail (L322, L324).
30-34: Approve, edit, and deny each resume cleanly — the checkpoint brackets the gate (L208, L202).
```

> [!TIP]
> The pair that defines the accountability: **`checkpoint(ctx.state, 'before-gate')`** (the exact-action resume, L207) and **`logDecision(request, decision)`** (the audit, L322). **The gate brackets the action with a checkpoint and a record — the human's say-so is both precise and provable (L324).**

## 14. Performance Notes

- **The gate is a latency pause (L151).** A gated action waits for the human — the TTFT story (L145) includes the approval time; the pause is the price of the control (L208).
- **The threshold is the friction control (L150).** Too many gates → the human is the bottleneck (L151) — the threshold (L315) is a throughput design (L208).
- **The checkpoint is the cheap insurance (L255).** An atomic write before the gate (L207) — microseconds, next to the approval wait (L151).
- **The record is storage (L150).** Decision logs (L322) are cheap and auditable — the governance requirement (L373).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Risky actions execute | No gate (L212) | Add the threshold + gate (L208) |
| Everything waits | Threshold too wide (L315) | Free the read actions (L201) |
| Approvals resume wrong state | No checkpoint (L207) | Save before the request (L255) |
| No audit trail | Decisions unrecorded (L322) | Log every decision (L324) |
| The human can't stop the loop | No interrupts (L205) | Add the interrupt path (L208) |

## 16. Quick Revision Notes

- HITL = **approval gates, interrupts, takeover** (L208).
- The threshold: **read free, consequential gated** (L212, L315).
- The gate shows **the action + the reasoning** (L203, L213).
- The checkpoint **brackets the gate** (L207) — approve/edit/deny resume cleanly (L255).
- Every decision is **recorded** (L322) — the accountability (L324).
- The gate is **the answer to excessive agency** (L212).

## 17. Cheat Sheet

```text
HUMAN-IN-THE-LOOP = the accountability architecture

THE THREE PATTERNS (L208)
  approval gate   the agent proposes, the human approves — for
                  consequential actions (L212)
  interrupt       the human stops or redirects the loop (L205)
  takeover        the human continues the task (L207)

THE THRESHOLD (L212, L315)
  read actions    run free (L201)
  consequential   gated — refund, transfer, publish, delete
  the line is consequence + irreversibility (L212)

THE GATE'S MECHANICS (L207, L203)
  checkpoint before the gate — approval resumes the exact action (L255)
  the human sees the action + the reasoning (L203) + the trace (L213)

THE RECORD (L322, L324)
  every decision logged — approve, edit, deny
  the loop is accountable because the human can say no

THE COMPOSE (L216)
  the gate answers excessive agency (L212)
  the interrupt answers drift (L211)
  both are part of the guardrails (L209)

INTERVIEW, 4 MOVES
  1 patterns "gates, interrupts, takeover (L208)"
  2 threshold "read free, consequential gated (L315)"
  3 mechanics "checkpoint + context — approve/edit/deny (L207, L203)"
  4 record   "the audit trail is the accountability (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - HITL is **the accountability architecture** (L208): approval gates, interrupts, and takeover — the human at the loop's consequential moments (L324)
> - **The threshold is the design** (L212, L315): read actions run free (L201), write actions with consequence wait for approval (L208)
> - **The gate's context is its quality** (L203, L213) — the human approves the action *with the agent's reasoning* in view (L324)
> - **The checkpoint brackets the gate** (L207, L255) — approve, edit, and deny each resume the exact action (L208)
> - **Every decision is recorded** (L322) — the audit trail is what makes the agent's consequential actions defensible (L324)
> - The gate is **the answer to excessive agency** (L212), and the interrupt is **the answer to drift** (L211) — HITL is the human guardrail (L209)

## Check your understanding

Answer these without looking back.

1. What are the three HITL patterns (L208)?
2. How do you set the risk threshold (L315)?
3. What does the human see at the gate (L203)?
4. Why checkpoint before the gate (L207)?
5. What are the three decision kinds, and what does each do (L208)?
6. Why record every decision (L322)?
7. How do interrupts work (L205)?
8. Which failure mode does the gate answer (L212)?

## A Closing Note — The Tower That Makes the Flight Safe

You now hold the control architecture: **the approval gates at the consequential moments, the interrupts that redirect, the takeover that hands over, and the logbook that records it all.** The agent's power is now accountable — the human is in the loop exactly where it matters (L324).

Next: the rails around the whole loop — guardrails for agents (L209), before, during, and after.
