# Lesson 382 — Project 2: AI Agent with Tools + Human Approval

**Interview importance:** ⭐⭐⭐⭐⭐ — the second capstone: a guarded, audited, approval-gated agent end to end (L382).**

This is the second capstone — the proof of the agents (L216) and the security (L325) modules. L216 built the loop and L324 the approvals; this lesson is **the build**: Project 2 — the AI agent with the tools and the human approval — a guarded, audited, approval-gated agent end to end (L382): the scope (the agent's tasks, L382), the architecture (the loop L200 and the tools L315), and the build (the guardrails L325 and the approvals L324). This lesson is the agent's proof (L382).

The distinction this lesson is built on: a **specialist** describes the loop. A **solutions architect** builds the guarded agent (L382): the tools (L315), the guardrails (L325), and the approvals (L324) — the capstone (L382) that proves the L216 loop (L216).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the scope: the agent's tasks (L382)
- Explain the architecture: the loop and the tools (L382)
- Explain the guardrails: the security (L325)
- Explain the approvals: the human gate (L324)
- Explain the build: the audited end to end (L382)

## 1. One-Line Definition

**Project 2 — the AI agent with the tools and the human approval — is the guarded, audited, approval-gated agent, built end to end (L382) — the scope (the agent's tasks L382: the support L350 or the ops L382, L382), the architecture (the loop L200: the plan L202, the tool calls L201, the observations L200; the tools L315: the scoped L262, L382), and the build (the guardrails L325: the least privilege L314, the sandbox L315, the audit L322; and the approvals L324: the high-risk L324 gated L208, L382) — the agent's (L216) proof (L382).**

The one-sentence interview answer: *"Project 2 is the guarded agent, built end to end (L382). The scope (L382): the agent's tasks (L382) — the support (L350): the tickets (L350) and the refunds (L324); or the ops (L382): the dashboards (L382) and the alerts (L274). The architecture (L382): the loop (L200) — the plan (L202), the tool calls (L201), and the observations (L200) — the L200 loop (L200), built (L382); and the tools (L315) — the scoped (L262) actions (L315) with the schemas (L315). The build (L382): the guardrails (L325) — the least privilege (L314): the read-only (L314) defaults; the sandbox (L315): the contained (L315) execution; and the audit (L322): the who, the what, the when (L322) — the black box (L322). And the approvals (L324): the high-risk (L324) — the refund (L324), the send (L324) — gated (L208) by the human (L208) — the L324 control (L324), built (L382). The AI shape (L173): the agent (L382) — the loop (L200), the tools (L315), the guardrails (L325), and the approvals (L324) — the L216 agent (L216), proofed (L382)."*

## 2. Mental Model

Think of the guarded agent as **the bank's authorized clerk.** The clerk (the agent, L382) handles the requests (L382): the desk (the loop, L200) — the forms (the plans, L202) and the processing (the tool calls, L201); the badge (the least privilege, L314) — the scoped (L262) access (L315); the cage (the sandbox, L315) — the contained (L315) work; the ledger (the audit, L322) — every action (L322) recorded; and the manager's key (the approval, L324) — the big (L324) transactions (L324) signed (L208). The bank works because the clerk is scoped, the cage is contained, the ledger is kept, and the manager signs (L382).

```text
   the authorized clerk (the agent, L382)
   ┌────────────────────────────────────────────────────────┐
   │ the desk (the loop, L200) · the badge (the privilege,  │
   │ L314) · the cage (the sandbox, L315)                   │
   │ the ledger (the audit, L322) · the manager's key (the  │
   │ approval, L324)                                        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the clerk**: the desk, the badge, and the manager's key (L382).

## 3. Visual Flow — One Agent Run

```text
   the task (L382)
        │  "process the refund for order #123" (L382)
        ▼
   ┌────────────────────── THE LOOP (L200) ─────────────────────────────┐
   │  the plan (L202) → the tool calls (L201) → the observations (L200)│
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE GUARDRAILS (L325) ───────────────────────┐
   │  the least privilege (L314) · the sandbox (L315) · the audit      │
   │  (L322)                                                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE APPROVAL (L324) ─────────────────────────┐
   │  the refund (L324) → the human (L208) approves (L208)             │
   │  the approved (L324) → the action (L382) · the denied (L382)      │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the run: **task → loop → guardrails → approval** (L382).

## 4. How It Works — The Build, Part by Part

- **The scope (L382).** The agent's tasks (L382): the support (L350) or the ops (L382).
- **The architecture (L382).** The loop (L200) and the tools (L315): the plan (L202), the calls (L201), the scoped (L262).
- **The guardrails (L325).** The least privilege (L314), the sandbox (L315), the audit (L322).
- **The approvals (L324).** The high-risk (L324) gated (L208) by the human (L208).

> [!NOTE]
> **The capstone's arc: the guarded loop (L382).** The senior answer builds the arc (L382): the loop (L200) — the L200 loop (L200) with the termination (L205) bounded (L205); the tools (L315) — the scoped (L262) actions (L315) with the schemas (L315); the guardrails (L325) — the least privilege (L314), the sandbox (L315), and the audit (L322); and the approvals (L324) — the high-risk (L324) gated (L208). The arc (L382) — the loop (L200) to the approval (L324) — is the L216 agent (L216), guarded (L382).

## 5. Real Project Usage

- **The portfolio (L103).** Project 2 (L382) — the L216 proof (L382).
- **An interview (L382).** The walkthrough (L382) — the loop (L200) to the approval (L324).
- **A support agent (L350).** The tickets (L350) — the refunds (L324) gated (L324).
- **An ops agent (L382).** The dashboards (L382) — the alerts (L274) — the read-only (L314).
- **Anything agentic (L216).** The capstone (L382) — the guarded loop (L382).

The through-line: **the proof is the agent's** — the loop (L200), guarded (L325) and gated (L324).

## 6. Interview Explanation

Say it in four moves:

1. **The scope.** "The tasks — the support (L350) or the ops (L382)."
2. **The architecture.** "The loop (L200) — the plan (L202), the calls (L201), the observations (L200)."
3. **The guardrails.** "The least privilege (L314), the sandbox (L315), the audit (L322)."
4. **The approvals.** "The high-risk (L324) gated (L208)."

## 7. Senior-Level Insights

- **The loop is the L200 (L200).** The plan (L202), the calls (L201), the observations (L200) — with the termination (L205) bounded (L205) (L382).
- **The tool is the scoped (L262).** The least privilege (L314) — the read-only (L314) defaults (L382) — the L314 blast radius (L314), built (L382).
- **The audit is the black box (L322).** The who, the what, the when (L322) — the L322 record (L322), in the agent (L382).
- **The approval is the L324 (L324).** The high-risk (L324) — the refund (L324) and the send (L324) — the L208 pause (L208), built (L382).
- **The eval is the agent's (L341).** The golden tasks (L342) — the L340 eval (L340) — the quality (L341) gated (L382).

## 8. Common Mistakes

- **The un-guarded loop (L382).** The L200 loop (L200) without the tools' (L315) scope (L262) — the L314 agency (L314) (L382).
- **The un-scoped tools (L262).** The agent (L382) with the app's (L314) permissions (L314) — the least privilege (L314) (L382).
- **The un-gated refund (L324).** The high-risk (L324) automatic (L324) — the L324 gate (L324) (L382).
- **The un-audited (L322).** The actions (L382) un-recorded (L322) — the black box (L322) missing (L382).
- **The eval-less (L341).** The golden tasks (L342) un-run (L341) — the quality (L341) unknown (L382).

## 9. Best Practices

- **Build the loop** (L200) — with the termination (L205) bounded (L205).
- **Scope the tools** (L262) — the least privilege (L314), the read-only (L314) defaults.
- **Sandbox the execution** (L315) — the contained (L315) runs.
- **Gate the high-risk** (L324) — the L208 approval (L208).
- **Audit and eval** (L322, L341) — the black box (L322), the golden tasks (L342).

## 10. Interview Questions

**Q: Walk me through Project 2.**
> A: The guarded agent, built end to end (L382). The scope — the tasks: the support (L350) or the ops (L382). The architecture — the loop (L200) and the tools (L315). The guardrails — the least privilege (L314), the sandbox (L315), the audit (L322). And the approvals — the high-risk (L324) gated (L208).

**Q: How do you guard the loop?**
> A: Three layers (L325): the least privilege (L314) — the tools (L315) scoped (L262), the read-only (L314) defaults; the sandbox (L315) — the contained (L315) execution; and the audit (L322) — the who, the what, the when (L322). The L325 stack (L325), agent-shaped (L382).

**Q: How do the approvals work?**
> A: The L324 control (L324): the high-risk (L324) — the refund (L324), the send (L324) — the loop (L200) pauses (L208), the task (L228) published, the human (L208) approves (L208), and the callback (L277) resumes (L382). The approval (L324) is the agency's (L314) brake (L382).

**Q: How do you evaluate it?**
> A: The L340 eval (L340): the golden tasks (L342) — the refund and the send (L382) — the task success (L340), the trajectory (L340), and the cost (L334) — in the CI (L296), gating (L341). The agent's (L382) quality (L341), measured (L382).

## 11. Follow-Up Questions

- What's the scope (L382)?
- How do you guard the loop (L325)?
- How do the approvals work (L324)?
- How do you evaluate it (L341)?
- What's the arc (L382)?

## 12. Comparison Table — The Demo vs the Guarded Agent

| | The demo agent (L382) | The guarded agent (L382) |
|---|---|---|
| The tools (L315) | the app's (L314) | the scoped (L262), the read-only (L314) |
| The execution (L315) | the host (L315) | the sandbox (L315) |
| The high-risk (L324) | the automatic (L324) | the gated (L208) |
| The record (L322) | none (L382) | the audit (L322) |
| The eval (L341) | none (L382) | the golden tasks (L342) |

The senior read: **the right column is the capstone** — the guarded, audited, gated (L382).

## 13. Code Example — The Build, Started

```js
// Project 2 (L382) — the guarded agent (L382).
// 1 · THE LOOP (L200) — with the bounded termination (L205).
async function runAgent(task) {
  let steps = 0;
  while (steps < MAX_STEPS) {              // the termination (L205)
    const action = await model.plan(task, observations);   // L202
    if (action.type === 'final') return action.answer;     // L200

    // 2 · THE TOOL (L315) — the scoped call (L262).
    const allowed = authorize(action.tool, agentScopes);   // L314, L262
    if (!allowed) return deny(action.tool);                // L314

    // 3 · THE APPROVAL (L324) — the high-risk gate (L208).
    if (HIGH_RISK.has(action.tool)) {
      const ok = await approvalGate(action);               // L324, L208
      if (!ok) return deny('not approved');                // L324
    }

    // 4 · THE SANDBOX (L315) — the contained run (L315).
    const observation = await sandboxExecute(action);      // L315
    await audit.log({ action, observation, at: Date.now() });  // L322
    observations.push(observation);                        // L200
    steps++;
  }
  return { status: 'max-steps' };                          // L205
}
```

```text
What the reader must SEE — the build, started:

  the while + MAX_STEPS     → the bounded loop (L200, L205)
  authorize + agentScopes   → the least privilege (L314, L262)
  approvalGate on the high  → the L324 gate (L208)
  sandboxExecute            → the containment (L315)
  audit.log                 → the black box (L322)

  The loop, guarded and gated (L382).
```

```narrate
4-9: The loop — the plan with the bounded termination (L202, L205).
11-14: The tool — the scoped authorization (L314, L262).
16-21: The approval — the high-risk gate (L324, L208).
23-26: The sandbox and the audit — the contained run and the record (L315, L322).
```

> [!TIP]
> The pair that defines the capstone: **the scoped tool call** (the least privilege, L314) and **the approval gate** (the human control, L324). **Build the loop, scope the tools, sandbox the runs, gate the high-risk, audit the actions — the guarded agent (L382).**

## 14. Performance Notes

- **The loop is the latency (L200).** The steps (L200) — the iterations (L205) bounded (L205) — the L340 efficiency (L340) (L382).
- **The approval is the human's (L208).** The high-risk (L324) — the hours (L382) for the gate (L208).
- **The audit is the storage (L322).** The actions (L322) — the retention (L322) — the black box (L382).
- **The evals are the CI's (L341).** The golden tasks (L342) — the minutes (L382) in the pipeline (L296).

## 15. Debugging Scenarios

| Symptom | First check (L382) | The lever |
|---|---|---|
| The agent overreaches | The scope (L262) | The least privilege (L314) |
| The loop runs away | The termination (L205) | The MAX_STEPS (L205) |
| The refund slips | The approval (L324) | The gate (L208) |
| The action is opaque | The audit (L322) | The record (L322) |
| The quality drifts | The evals (L341) | The golden tasks (L342) |

## 16. Quick Revision Notes

- Project 2 = **the agent's proof** (L382): the scope, the architecture, the guardrails, the approvals.
- The scope: **the tasks — the support (L350) or the ops (L382)**.
- The architecture: **the loop (L200) and the tools (L315)**.
- The guardrails: **the least privilege (L314), the sandbox (L315), the audit (L322)**.
- The approvals: **the high-risk (L324) gated (L208)**.

## 17. Cheat Sheet

```text
PROJECT 2: AI AGENT WITH TOOLS + HUMAN APPROVAL = the guarded agent

THE SCOPE (L382)
  the support (L350) — the tickets (L350), the refunds (L324)
  the ops (L382) — the dashboards (L382), the alerts (L274)

THE ARCHITECTURE (L382)
  the loop (L200) — the plan (L202), the calls (L201),
  the observations (L200), the termination (L205)
  the tools (L315) — the scoped (L262), the schemas (L315)

THE GUARDRAILS (L325)
  the least privilege (L314) — the read-only (L314) defaults
  the sandbox (L315) — the contained (L315) execution
  the audit (L322) — the who, the what, the when (L322)

THE APPROVALS (L324)
  the high-risk (L324) — the refund (L324), the send (L324)
  gated (L208) by the human (L208) — the L324 control (L324)

THE EVALS (L341)
  the golden tasks (L342) — the task success (L340),
  the trajectory (L340), the cost (L334) — in the CI (L296)

INTERVIEW, 4 MOVES
  1 scope   "the tasks (L382)"
  2 architecture "the loop and the tools (L382)"
  3 guardrails "the privilege, the sandbox, the audit (L382)"
  4 approvals "the high-risk gated (L324)"
```

## 18. Key Takeaways

> [!RECAP]
> - Project 2 — the AI agent with the tools and the human approval — is **the guarded, audited, approval-gated agent, built end to end** (L382): the scope (L382), the architecture (L382), the guardrails (L325), and the approvals (L324)
> - **The scope** (L382): the agent's tasks (L382) — the support (L350) or the ops (L382)
> - **The architecture** (L382): the loop (L200) — the plan (L202), the calls (L201), the observations (L200), with the termination (L205) bounded; and the tools (L315) — the scoped (L262)
> - **The guardrails** (L325): the least privilege (L314), the sandbox (L315), and the audit (L322)
> - **The approvals** (L324): the high-risk (L324) gated (L208) by the human (L208)
> - The evals (L341): the golden tasks (L342) — the task success (L340), the trajectory (L340), and the cost (L334) — in the CI (L296) — the L216 agent (L216), guarded (L382), proofed (L382), filling the portfolio (L103)

## Check your understanding

Answer these without looking back.

1. What's the scope (L382)?
2. How do you guard the loop (L325)?
3. How do the approvals work (L324)?
4. How do you evaluate it (L341)?
5. What's the arc (L382)?
6. What's the least privilege (L314)?
7. What's the sandbox (L315)?
8. What is the guarded agent (L382)?

## A Closing Note — The Clerk, Guarded

You now hold the second proof: **the loop, the guardrails, and the approvals — with the badge scoped and the manager signing.** The authorized clerk is guarded — and the ledger is complete (L382).

Next: the workflows, the integrations, and the approval gates as a shippable product — Project 3 (L383).
