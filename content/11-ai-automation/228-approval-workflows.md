# Lesson 228 — Human Approval Workflows

**Interview importance:** ⭐⭐⭐⭐⭐ — "what decides whether automation scales?" — the answer is the *approval step*: the gate that keeps humans at the consequential points — and the threshold that keeps them out of the routine (L208, L151).**

L208 gave you the gate; this lesson is **the gate as a workflow step**: human approval workflows — the approval step that decides whether automation scales or stalls. The design has two halves: **the gate** (the consequential step waits for the human — L208) and **the threshold** (the routine steps run free — L151). The approval is a first-class workflow step (L217): the request, the context, the decision, and the audit (L322) — the L208 discipline, made operational (L228).

The distinction this lesson is built on: a **demo** approves everything or nothing. A **solutions architect** designs the approval workflow: the risk threshold (L212), the request's context (L203), the decision kinds (L208), the fallback when no one approves (L232), and the audit (L322) — because the approval step is where automation earns its trust (L324).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the approval step: a first-class workflow gate (L228)
- Design the threshold: what waits, what runs free (L212, L151)
- Design the request: the action, the context, the reasoning (L203)
- Design the decision kinds: approve, edit, deny, escalate (L208)
- Explain the fallback and the audit (L232, L322)

## 1. One-Line Definition

**Human approval workflows are the gate as a first-class step (L228) — the consequential actions wait for the human (L208) with the action, its context, and its reasoning in the request (L203); the routine actions run free by the risk threshold (L212); the decisions are approve, edit, deny, or escalate (L208); and the fallback (L232) and the audit (L322) complete the step — the place where automation earns its trust (L324).**

The one-sentence interview answer: *"The approval workflow is the gate made operational (L228). Two halves. The threshold — the risk design (L212): routine actions run free (L151), consequential actions wait (L208) — the refund, the publish, the send (L228). The gate — a first-class step (L217): the request shows the action, its context, and the agent's reasoning (L203); the human decides — approve, edit, deny, or escalate (L208); and the workflow resumes accordingly (L217). The fallback — an approval that times out escalates or fails safe (L232). The audit — every decision is recorded (L322). The approval step is where automation earns its trust (L324): the human is at the consequential points, and the routine runs unattended (L228)."*

## 2. Mental Model

Think of the approval workflow as **the manager's sign-off tray — with a clear rule about what reaches the tray.** The rule (the threshold, L212): the routine work — the internal steps, the reads, the drafts — flows past the tray (runs free, L151); the consequential work — the refund, the publish, the send — lands in the tray (waits, L208). Each item in the tray carries a sticky note (the request's context, L203): what the action is, why the AI proposed it, what it will do. The manager stamps APPROVED, EDITED, DENIED, or ESCALATED (L208). The tray has a timeout (the fallback, L232), and every stamp is copied to the ledger (the audit, L322). The office runs because the rule keeps the tray from drowning (L228).

```text
   the manager's tray (L228)              the rule (L212)
   ┌────────────────────────────┐         ┌──────────────────────────────┐
   │ the consequential work:    │         │ routine → flows past (L151)  │
   │ refund · publish · send    │         │ consequential → the tray     │
   │ with the sticky note (L203)│         │ (L208)                       │
   │ approve · edit · deny      │         │ the timeout → escalate (L232)│
   │ · escalate (L208)          │         │ the ledger records (L322)    │
   └────────────────────────────┘         └──────────────────────────────┘
```

The mental model is **the manager's tray with a rule**: the routine flows past, the consequential waits with its context, and every decision is recorded (L228).

## 3. Visual Flow — The Approval Step

```text
   the workflow reaches a consequential step (L217)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE THRESHOLD (L212)                                 │
   │     routine → runs free (L151) · consequential → the gate│
   └──────────────────┬───────────────────────────────────────┘
                      ▼ consequential
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE REQUEST (L203, L213)                             │
   │     the action · the context · the reasoning (L203)      │
   │     → to the human (L208)                                │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE DECISION (L208)                                  │
   │     approve → run · edit → run the changes               │
   │     deny → re-plan (L202) · escalate → a senior human    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE RECORD (L322)                                    │
   │     the decision + the reasoning → the audit (L213)      │
   └──────────────────────────────────────────────────────────┘
```

The flow is the step: **threshold → request → decision → record** — the gate, operational (L228).

## 4. How It Works — The Threshold, the Request, the Decisions

- **The threshold (L212).** The risk design: what waits, what runs free (L228). Routine — the internal steps, the reads, the drafts — runs free (L151); consequential — the refund, the publish, the send — waits (L208). The threshold is the balance between the trust (L324) and the friction (L151).
- **The request (L203, L213).** The human approves well when the request shows the full picture (L208): the action, the context (L213), and the agent's reasoning (L203). The request is the gate's quality (L228).
- **The decisions (L208).** Approve — run it (L217). Edit — run the human's changes (L208). Deny — the workflow re-plans (L202). Escalate — a senior human (L208). Each decision resumes the workflow differently (L228).
- **The fallback (L232).** An approval that times out escalates or fails safe (L232) — the workflow never hangs on the tray (L228).
- **The audit (L322).** Every decision is recorded: the action, the context, the decision, the human (L322) — the approval's accountability (L324).

> [!NOTE]
> **The threshold is the scaling decision (L228, L151).** Approve everything — the human is the bottleneck, the automation stalls (L151). Approve nothing — the consequential runs unattended, the trust is gone (L324). The senior design sets the threshold by consequence (L212): the internal and the reversible run free (L151); the external and the irreversible wait (L208). The threshold is a measured balance (L341) — tuned as the automation's reliability earns more autonomy (L228).

## 5. Real Project Usage

- **Finance (L228).** The transfer waits for the approval (L208); the balance reads run free (L151). The request shows the amount and the reason (L203).
- **Publishing (L228).** The publish waits (L208); the drafting runs free (L151). The human edits the copy before the send (L208).
- **Customer support (L228).** The refund waits (L208); the replies draft free (L224). The human approves or edits (L208).
- **Deployments (L228).** The production deploy waits (L208); the staging runs free (L151). The request shows the diff and the tests (L213).
- **Anything consequential (L230).** The approval step is the L230 platform's trust control (L228) — the gate at the consequential points (L230).

The through-line: **the approval step is where automation earns its trust** — the threshold keeps the human at the consequential, and the routine runs free (L228).

## 6. Interview Explanation

Say it in four moves:

1. **The step.** "The approval is a first-class workflow step (L217): the consequential waits (L208)."
2. **The threshold.** "Routine runs free (L151); consequential waits — the risk design (L212)."
3. **The request.** "The action, the context, the reasoning (L203) — the human decides well (L208)."
4. **The record.** "Approve, edit, deny, escalate — and every decision is audited (L322)."

## 7. Senior-Level Insights

- **The threshold is the automation's maturity dial (L228).** The senior design starts strict and loosens as the automation's reliability earns it (L341) — the threshold is measured, not static (L228).
- **The request's context is the decision's quality (L203).** The human approves well when the request shows the action, the context (L213), and the reasoning (L203) — the gate's quality is its request's quality (L228).
- **The edit decision is the friction reducer (L208).** A human who can edit instead of deny keeps the automation moving (L228) — the edit is the middle path (L208).
- **The fallback is the anti-hang (L232).** The approval timeout (L232) escalates or fails safe (L232) — the workflow never waits forever (L228).
- **The audit is the trust's proof (L322).** Every decision recorded (L322) — the automation's consequential actions are human-authorized and provable (L324).

## 8. Common Mistakes

- **Everything gated (L151).** The human is the bottleneck (L228) — the threshold too wide (L208).
- **Nothing gated (L324).** The consequential runs unattended (L212) — the trust gone (L228).
- **The blind request (L203).** The human approves without the reasoning (L208) — the rubber stamp (L322).
- **No edit path (L208).** The human can only approve or deny (L228) — the friction of the full re-draft (L208).
- **No fallback (L232).** The approval times out, the workflow hangs (L232) — the anti-hang missing (L228).
- **Decisions unrecorded (L322).** No audit (L322) — the accountability (L324) gone (L228).

## 9. Best Practices

- **Set the threshold by consequence** (L212) — the reversible free, the irreversible gated (L151).
- **Show the request's context** (L203) — the action, the reasoning (L213), the trace (L208).
- **Offer the edit path** (L208) — the middle way between approve and deny (L228).
- **Design the fallback** (L232) — the timeout escalates or fails safe (L228).
- **Record every decision** (L322) — the audit is the trust's proof (L324).
- **Tune the threshold** (L341) — as the automation's reliability earns more autonomy (L228).

## 10. Interview Questions

**Q: What are human approval workflows?**
> A: The gate as a first-class step (L228). The threshold (L212) decides what waits: the routine runs free (L151), the consequential waits (L208). The request shows the action, the context, and the reasoning (L203); the human decides — approve, edit, deny, or escalate (L208); the workflow resumes accordingly (L217). The fallback (L232) prevents the hang, and the audit (L322) records every decision.

**Q: How do you set the threshold?**
> A: By consequence (L212). The internal and the reversible — the reads, the drafts — run free (L151). The external and the irreversible — the refund, the publish, the send — wait (L208). The threshold is the balance between the trust (L324) and the friction (L151), and it's a measured dial (L341): strict at first, looser as the automation's reliability earns it (L228).

**Q: What makes a good approval request?**
> A: The context (L203). The human decides well when the request shows the full picture: the action, what led to it (the trace, L213), and the agent's reasoning (L203). A blind request — "approve this refund" with no why — is a rubber stamp (L322). The request's quality is the gate's quality (L228).

**Q: What happens if no one approves?**
> A: The fallback (L232). The approval has a timeout — when it expires, the workflow escalates to a senior human or fails safe (L232): the consequential action doesn't run unattended, and the workflow doesn't hang (L228). The fallback is the anti-hang — the approval is a designed step with a designed timeout (L232).

## 11. Follow-Up Questions

- How do you set the threshold (L212)?
- What's in the approval request (L203)?
- What are the decision kinds (L208)?
- What's the fallback (L232)?
- How do you tune the threshold (L341)?

## 12. Comparison Table — No Gate vs Over-Gated vs Designed

| | No gate (L324) | Over-gated (L151) | Designed (this lesson) |
|---|---|---|---|
| Threshold (L212) | none | everything | by consequence |
| Routine (L151) | — | waits | runs free |
| Consequential (L208) | runs | waits | waits with context (L203) |
| Decisions (L208) | — | approve/deny | + edit + escalate |
| Fallback (L232) | — | — | timeout → escalate/fail-safe |
| Audit (L322) | none | present | every decision recorded |

The senior read: **the right column is the trust dial** — the consequential gated, the routine free, the decisions recorded (L228).

## 13. Code Example — The Approval Step

```js
// The approval workflow: threshold → request → decision → record (L228).
// THE THRESHOLD (L212) — the risk design (L151).
const RISK = { free: ['read', 'draft', 'search'], gated: ['refund', 'publish', 'send'] };

async function workflowStep(step, ctx) {
  // THE THRESHOLD — routine runs free (L151, L208).
  if (RISK.free.includes(step.kind)) return execute(step, ctx);

  // THE REQUEST (L203, L213) — the full picture.
  const request = {
    action: step,                                        // what (L217)
    context: summarizeTrace(ctx.trace),                  // what led here (L213)
    reasoning: ctx.scratchpad.reasoning.at(-1),          // why (L203)
  };

  // THE DECISION (L208) — approve, edit, deny, escalate.
  const decision = await humanDecide(request, { timeoutMs: 60_000 });   // the fallback (L232)
  switch (decision.kind) {
    case 'approve':  return execute(step, ctx);                       // L217
    case 'edit':     return execute({ ...step, ...decision.changes }, ctx);  // L208
    case 'deny':     return replan(ctx, decision.reason);             // L202
    case 'escalate': return escalateToSenior(request, decision);      // L208
    case 'timeout':  return failSafe(request);                        // L232
  }
}

// THE AUDIT (L322) — every decision recorded (L213).
await audit.log({ step: step.id, decision, human: decision.approver, at: Date.now() });
```

```text
What the reader must SEE — the step, operational:

  RISK.free / gated   → the threshold (L212, L151)
  request: action+context+reasoning → the quality (L203, L213)
  approve/edit/deny/escalate → the decisions (L208)
  timeout → failSafe  → the fallback (L232)
  audit.log()          → the record (L322)

  The consequential waits with context; every decision is recorded.
```

```narrate
3-5: The threshold — the risk design: the routine is free, the consequential is gated (L212, L151).
8-12: The request — the action, the trace's context (L213), and the reasoning (L203) — the full picture (L228).
14-21: The decisions — approve, edit (L208), deny → re-plan (L202), escalate (L208).
22: The timeout — the fallback fails safe (L232), never hangs (L228).
24-25: The audit — every decision recorded (L322), the trust's proof (L324).
```

> [!TIP]
> The pair that defines the step: **`RISK.free` vs `RISK.gated`** (the threshold, L212) and **`humanDecide(request, { timeoutMs })`** (the gate with its fallback, L232). **The routine flows past; the consequential waits with context and a timeout — the trust dial (L228).**

## 14. Performance Notes

- **The threshold is the friction control (L151).** The free steps (L151) keep the human out of the routine (L228) — the threshold is the throughput dial (L228).
- **The gate is the human's latency (L151).** The consequential waits (L208) — the workflow's wall-clock includes the approval (L228).
- **The request's context is the token cost (L149).** The summarized trace (L213) in the request (L203) — budgeted (L149), not the full log (L228).
- **The audit is the storage cost (L150).** The decisions (L322) are cheap and required (L373).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The automation stalls | The threshold too wide (L151) | Free the routine (L212) |
| The consequential runs | The gate missing (L208) | Add the threshold + gate (L228) |
| Rubber-stamp approvals | The blind request (L203) | Add the reasoning (L213) |
| The workflow hangs | No timeout (L232) | The fallback path (L232) |
| No accountability | Decisions unrecorded (L322) | Log every decision (L213) |

## 16. Quick Revision Notes

- Approval workflows = **the gate as a first-class step** (L228).
- The threshold: **by consequence** (L212) — routine free (L151), consequential gated (L208).
- The request: **the action, the context, the reasoning** (L203, L213).
- The decisions: **approve, edit, deny, escalate** (L208).
- The fallback: **timeout → escalate or fail safe** (L232).
- The audit: **every decision recorded** (L322, L324).

## 17. Cheat Sheet

```text
HUMAN APPROVAL WORKFLOWS = the gate, made operational

THE STEP (L228)
  a first-class workflow step (L217) — the consequential waits (L208)

THE THRESHOLD (L212)
  by consequence: the reversible free (L151), the irreversible gated (L208)
  the trust dial — strict first, looser as reliability earns it (L341)

THE REQUEST (L203, L213)
  the action · the context (L213) · the reasoning (L203)
  the request's quality is the gate's quality (L228)

THE DECISIONS (L208)
  approve  → run (L217) · edit → run the changes (L208)
  deny     → re-plan (L202) · escalate → a senior human (L208)

THE FALLBACK (L232)
  the timeout → escalate or fail safe (L232) — never hangs (L228)

THE RECORD (L322)
  every decision logged (L213) — the trust's proof (L324)

INTERVIEW, 4 MOVES
  1 step     "the gate as a first-class workflow step (L228)"
  2 threshold "by consequence — routine free, consequential gated (L212)"
  3 request  "action + context + reasoning (L203)"
  4 record   "decisions audited (L322) — the trust's proof (L324)"
```

## 18. Key Takeaways

> [!RECAP]
> - Human approval workflows are **the gate as a first-class step** (L228): the consequential actions wait for the human (L208), with the routine running free (L151)
> - **The threshold is the trust dial** (L212): set by consequence (L212) and tuned as the automation's reliability earns more autonomy (L341)
> - **The request's quality is the gate's quality** (L203): the action, its context (L213), and the agent's reasoning (L203) — a blind request is a rubber stamp (L322)
> - **The decisions are approve, edit, deny, or escalate** (L208) — the edit path is the middle way that keeps the automation moving (L228)
> - **The fallback is the anti-hang** (L232): the approval timeout escalates or fails safe (L232) — the workflow never waits forever
> - **The audit is the trust's proof** (L322): every decision recorded (L322), because the approval step is where automation earns its trust (L324)

## Check your understanding

Answer these without looking back.

1. What's the approval step (L228)?
2. How do you set the threshold (L212)?
3. What's in the request (L203)?
4. What are the four decisions (L208)?
5. What's the fallback (L232)?
6. Why is the edit path important (L208)?
7. What does the audit record (L322)?
8. Why is the threshold a dial (L341)?

## A Closing Note — The Tray That Decides the Scale

You now hold the trust control: **the threshold that keeps the routine free, the request that shows the full picture, the decisions that resume the workflow, and the record that proves every one.** The automation now scales — because the human is exactly where the consequence is (L228).

Next: from process to workflow — business process automation (L229), mapping, steps, ownership.
