# Lesson 314 — Excessive Agency

**Interview importance:** ⭐⭐⭐⭐⭐ — "the agent that can do too much" — the answer is *the agency control*: the permissions, the blast radius, and the human-in-the-loop (L314).**

L315 will build the tool security; this lesson is **the power the tools grant**: the excessive agency — the agent that can do too much (L314): the mechanism (the agent's permissions, L314), the blast radius (the damage a bad call can do, L314), and the fix (the least privilege, the scoped tools, the human approval, L314). The AI shape (L173): the agents (L200) with the tools (L315) — the power (L314) bounded (L314). This lesson is the agency's control (L314).

The distinction this lesson is built on: a **demo** grants the wide permissions. A **solutions architect** bounds the agency (L314): the least privilege (L314), the blast radius (L314), and the human-in-the-loop (L324) — because the agent (L200) will do what it can (L314).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the agency: the agent's permissions (L314)
- Explain the blast radius: the damage's bound (L314)
- Explain the least privilege: the scoped tools (L314)
- Explain the human approval: the high-risk gate (L324)
- Explain the AI shape: the agent's power, bounded (L314)

## 1. One-Line Definition

**The excessive agency is the agent that can do too much (L314) — the mechanism (the agent's permissions: the tools L315 it can call and the data they reach, L314), the blast radius (the damage a bad call can do: the delete, the email, the transfer, L314), and the fix (the least privilege L314 — the scoped tools L323; the blast-radius bound L314; and the human approval L324 — the high-risk gate, L314) — the agent (L200) will do what it can (L314).**

The one-sentence interview answer: *"The excessive agency is the agent with too much power (L314). The mechanism (L314): the agent (L200) calls the tools (L315) with the permissions (L314) — the delete tool (L314), the email tool (L314), the transfer tool (L314) — and the permissions (L314) are as wide as the app's (L314). The blast radius (L314): the damage a bad call (L314) — the injection (L311) or the misstep (L314) — can do (L314): the deleted rows (L314), the sent emails (L314), the moved funds (L314). The fix (L314): the least privilege (L314) — the tools scoped (L323) to the minimum (L314): the read-only (L314) unless the write is needed (L314); the blast-radius bound (L314) — the per-tenant (L320) and the per-user (L314) limits (L314); and the human approval (L324) — the high-risk actions (L324) gated by the human (L208). The AI shape (L173): the agent (L200) with the tools (L315) — the power (L314) bounded (L314): the least privilege (L314), the blast radius (L314), and the human-in-the-loop (L324). The demo grants the wide permissions; the architect bounds the agency (L314)."*

## 2. Mental Model

Think of the excessive agency as **the intern with the master keys.** The intern (the agent, L200) is capable and eager (L314) — but the keys (the permissions, L314) decide what it can do (L314): the master keys (L314) open the vault (the delete, L314), the mailroom (the email, L314), and the treasury (the transfer, L314). The intern (L314) will use what it has (L314) — and a mistake (L314) or a forged note (the injection, L311) with the master keys (L314) is the disaster (L314). The fix (L314): the intern gets the pantry keys only (the least privilege, L314); the rooms it can reach are limited (the blast radius, L314); and the vault (the high-risk action, L324) requires the manager's signature (the human approval, L324). The office works because the keys are scoped, the reach is limited, and the vault is signed (L314).

```text
   the intern (the agent, L200)
   ┌────────────────────────────────────────────────────────┐
   │ the keys (the permissions, L314) — the scoped (L314)   │
   │ the rooms (the blast radius, L314) — the limited       │
   │ (L314)                                                 │
   │ the vault (the high-risk, L324) — the manager's        │
   │ signature (L324)                                       │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the intern**: the keys, the rooms, and the vault's signature (L314).

## 3. Visual Flow — One Agency Check

```text
   the agent's action (L314)
        │  the tool call (L315)
        ▼
   ┌────────────────────── THE PERMISSIONS (L314) ──────────────────────┐
   │  the tool's scope (L323): the read-only vs the write (L314)       │
   │  the data's scope (L320): the tenant, the user (L314)             │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE BLAST RADIUS (L314) ─────────────────────┐
   │  the action's damage (L314): the delete, the email, the transfer │
   │  the high-risk (L314) → the human approval (L324)                │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EXECUTION (L314) ────────────────────────┐
   │  the scoped action (L314) · the audited (L322)                   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the check: **permissions → blast radius → approval → execution** (L314).

## 4. How It Works — The Control, Part by Part

- **The mechanism (L314).** The agent's permissions (L314): the tools (L315) it can call (L314) and the data they reach (L314).
- **The blast radius (L314).** The damage a bad call can do (L314): the deleted rows, the sent emails, the moved funds (L314) — bounded by the scope (L314).
- **The least privilege (L314).** The tools scoped (L323) to the minimum (L314): the read-only (L314) unless the write is needed (L314).
- **The human approval (L324).** The high-risk actions (L324) gated by the human (L208) — the L324 control (L324), the agency's brake (L314).

> [!NOTE]
> **The agent will do what it can (L314).** The senior answer assumes the execution (L314): the agent (L200) — driven by the injection (L311), the misstep (L314), or the drift (L335) — will call what it can (L314). The control (L314) is not the agent's judgment (L314) but the permissions' (L314): the least privilege (L314), the blast radius (L314), and the human approval (L324) — the power bounded (L314) before the agent acts (L314).

## 5. Real Project Usage

- **An agent product (L279).** The tools (L315) scoped (L323) — the read-only by default (L314), the write approved (L324).
- **A customer support agent (L350).** The ticket tools (L350) — the read (L314), the reply (L314), the refund (L324) — the refund (L324) human-approved (L314).
- **A finance agent (L314).** The transfer tool (L314) — the human approval (L324) mandatory (L314).
- **A multi-tenant SaaS (L357).** The per-tenant scope (L320) — the agent (L314) reaches only its tenant's data (L320).
- **Anything agentic (L200).** The power bounded (L314) — the least privilege (L314), the blast radius (L314), the approvals (L324).

The through-line: **the control is the power's bound** — the agent will do what it can (L314).

## 6. Interview Explanation

Say it in four moves:

1. **The mechanism.** "The agent's permissions — the tools and the data (L314)."
2. **The blast radius.** "The damage a bad call can do (L314)."
3. **The least privilege.** "The tools scoped to the minimum (L314)."
4. **The approval.** "The high-risk actions gated by the human (L324)."

## 7. Senior-Level Insights

- **The permissions are the control (L314).** The agent's power (L314) is the permissions' (L314) — not the judgment's (L314).
- **The blast radius is the design (L314).** The action's damage (L314) — the delete and the transfer (L314) — bounded (L314) by the design (L314).
- **The least privilege is the default (L314).** The read-only (L314) unless the write is needed (L314) — the L262 discipline (L262), agent-shaped (L314).
- **The human approval is the high-risk gate (L324).** The refund (L324) and the transfer (L324) — the L324 control (L324), the agency's brake (L314).
- **The audit is the record (L322).** The agent's actions (L314) — the who, the what, the when (L322) — the L322 record (L322) of the agency (L314).

## 8. Common Mistakes

- **The master keys (L314).** The agent (L200) with the app's permissions (L314) — the blast radius (L314) the whole system (L314).
- **The write by default (L314).** The delete and the update (L314) without the need (L314) — the read-only (L314) is the default (L314).
- **The cross-tenant reach (L320).** The agent (L314) reaching the other tenants (L320) — the per-tenant scope (L320) is the bound (L314).
- **The high-risk unapproved (L324).** The transfer (L324) without the human (L324) — the L324 gate (L324) mandatory (L314).
- **The audit missing (L322).** The agent's actions (L314) unrecorded (L322) — the damage (L314) unreconstructed (L322).

## 9. Best Practices

- **Scope the tools** (L314) — the least privilege (L323), the read-only default (L314).
- **Bound the blast radius** (L314) — the per-tenant (L320), the per-user (L314).
- **Gate the high-risk** (L324) — the human approval (L324).
- **Audit the actions** (L322) — the record (L322) of the agency (L314).
- **Test the agency** (L341) — the adversarial tools (L315) in the eval (L341).

## 10. Interview Questions

**Q: Walk me through the excessive agency.**
> A: The agent that can do too much (L314). The mechanism — the agent's permissions: the tools and the data (L314). The blast radius — the damage a bad call can do (L314). And the fix — the least privilege (L314), the blast-radius bound (L314), and the human approval (L324).

**Q: Why is it dangerous?**
> A: The agent will do what it can (L314): driven by the injection (L311), the misstep (L314), or the drift (L335), the agent (L200) calls what it can (L314). The wide permissions (L314) — the delete, the email, the transfer (L314) — make the blast radius (L314) the whole system (L314).

**Q: How do you bound it?**
> A: Three moves (L314): the least privilege (L314) — the tools scoped (L323) to the minimum, the read-only default (L314); the blast radius (L314) — the per-tenant (L320) and the per-user (L314) scope; and the human approval (L324) — the high-risk actions (L324) gated (L324).

**Q: What needs the human approval?**
> A: The high-risk (L324): the refund (L324), the transfer (L324), the delete (L324) — the irreversible or the expensive (L324). The L324 control (L324): the workflow (L277) pauses (L208), the human (L208) approves, and the agent (L314) proceeds (L314).

## 11. Follow-Up Questions

- What's the mechanism (L314)?
- What's the blast radius (L314)?
- How do you bound it (L314)?
- What needs the approval (L324)?
- What's the audit (L322)?

## 12. Comparison Table — The Scoped vs the Excessive

| | The scoped agent (L314) | The excessive agent (L314) |
|---|---|---|
| The tools (L323) | the read-only default (L314) | the app's permissions (L314) |
| The data (L320) | the tenant's (L320) | everything (L314) |
| The high-risk (L324) | the human-gated (L324) | the automatic (L314) |
| The blast radius (L314) | the bounded (L314) | the whole system (L314) |
| The audit (L322) | the recorded (L322) | the absent (L322) |

The senior read: **the left column is the control** — the power bounded (L314).

## 13. Code Example — The Bound, Applied

```js
// The agency control (L314) — the power bounded (L314).
// 1 · THE LEAST PRIVILEGE (L314) — the tools scoped (L323).
const agentTools = [
  { name: 'get_ticket',    mode: 'read',  scope: 'own-tenant' },   // L314
  { name: 'reply_ticket',  mode: 'write', scope: 'own-tenant' },   // L314
  // no delete, no global search (L314)
];

// 2 · THE BLAST RADIUS (L314) — the per-tenant and the per-user (L314).
function authorize(tool, ctx) {
  if (tool.scope === 'own-tenant' && ctx.tenant !== ctx.agentTenant) {
    return deny();                            // the cross-tenant blocked (L320)
  }
  return allow();
}

// 3 · THE HUMAN APPROVAL (L324) — the high-risk gated (L324).
const highRisk = { refund: true, transfer: true, delete: true };   // L324
async function run(action) {
  if (highRisk[action.name]) {
    await publishApproval(action);            // the pause (L208)
    const ok = await waitForApproval(action.id);   // the human (L324)
    if (!ok) return deny('not approved');     // the gate (L324)
  }
  return execute(action);                     // the scoped action (L314)
}

// 4 · THE AUDIT (L322) — the record of the agency (L314).
await audit.log({ agent: id, action, approvedBy, at });           // L322
```

```text
What the reader must SEE — the bound, applied:

  read + own-tenant scopes  → the least privilege (L314)
  authorize: tenant check   → the blast radius (L320)
  highRisk → approval       → the human gate (L324)
  audit.log                 → the record (L322)

  The read-only default, the tenant scope, the human gate (L314).
```

```narrate
4-8: The least privilege — the tools scoped to the reads and the own-tenant writes (L314).
10-15: The blast radius — the cross-tenant calls blocked (L320, L314).
17-25: The human approval — the refund, the transfer, and the delete paused for the human (L324, L208).
27-28: The audit — the agent's actions recorded (L322, L314).
```

> [!TIP]
> The pair that defines the control: **the read-only default** (the least privilege, L314) and **the approval pause** (the high-risk gate, L324). **Scope the tools, bound the radius, gate the high-risk, audit the actions — the agency contained (L314).**

## 14. Performance Notes

- **The scoping is the zero-cost control (L314).** The tool permissions (L314) — no runtime cost (L314), the power bounded (L314).
- **The approval is the latency's cost (L324).** The high-risk (L324) pauses (L208) — the seconds (L324) for the gate (L314).
- **The audit is the storage's cost (L322).** The actions (L322) — the record (L322) for the reconstruction (L314).
- **The eval is the deploy's gate (L341).** The adversarial tools (L315) — the agency (L314) tested (L341).

## 15. Debugging Scenarios

| Symptom | First check (L314) | The lever |
|---|---|---|
| The agent deleted | The permissions (L314) | The read-only default (L314) |
| The agent crossed the tenants | The scope (L320) | The per-tenant check (L320) |
| The refund went out | The approval (L324) | The human gate (L324) |
| The action is unexplained | The audit (L322) | The record (L322) |
| The agent misbehaves | The eval (L341) | The adversarial tools (L315) |

## 16. Quick Revision Notes

- The excessive agency = **the agent that can do too much** (L314): the mechanism, the blast radius, the fix.
- The mechanism: **the agent's permissions — the tools and the data** (L314).
- The blast radius: **the damage a bad call can do** (L314).
- The least privilege: **the scoped tools — the read-only default** (L314).
- The human approval: **the high-risk gate (L324)**.

## 17. Cheat Sheet

```text
EXCESSIVE AGENCY = the agent that can do too much

THE MECHANISM (L314)
  the agent's permissions (L314)
  the tools (L315) it can call · the data they reach (L314)

THE BLAST RADIUS (L314)
  the damage a bad call can do (L314)
  the delete (L314) · the email (L314) · the transfer (L314)

THE FIX (L314)
  the least privilege (L314) — the scoped tools (L323)
  the read-only default (L314) · the per-tenant scope (L320)
  the human approval (L324) — the high-risk gate (L324)
  the audit (L322) — the record (L322)

THE TRUTH (L314)
  the agent will do what it can (L314)
  the control is the permissions' (L314), not the judgment's (L314)

INTERVIEW, 4 MOVES
  1 mechanism   "the permissions — the tools and the data (L314)"
  2 blast radius "the damage a bad call can do (L314)"
  3 least privilege "the scoped tools, the read-only default (L314)"
  4 approval    "the high-risk gated by the human (L324)"
```

## 18. Key Takeaways

> [!RECAP]
> - The excessive agency is **the agent that can do too much** (L314): the mechanism (L314), the blast radius (L314), and the fix (L314)
> - **The mechanism** (L314): the agent's permissions (L314) — the tools (L315) it can call (L314) and the data they reach (L314)
> - **The blast radius** (L314): the damage a bad call can do (L314) — the delete, the email, the transfer (L314)
> - **The least privilege** (L314): the tools scoped (L323) to the minimum (L314) — the read-only default (L314)
> - **The human approval** (L324): the high-risk actions (L324) — the refund, the transfer, the delete (L324) — gated by the human (L208)
> - **The truth** (L314): the agent (L200) will do what it can (L314) — driven by the injection (L311) or the misstep (L314) — so the control (L314) is the permissions' (L314): the least privilege (L314), the blast radius (L314), and the human approval (L324), with the audit (L322) as the record (L314)

## Check your understanding

Answer these without looking back.

1. What's the mechanism (L314)?
2. What's the blast radius (L314)?
3. How do you bound it (L314)?
4. What needs the approval (L324)?
5. What's the least privilege (L314)?
6. Why is it dangerous (L314)?
7. What's the audit (L322)?
8. What is the agency's control (L314)?

## A Closing Note — The Keys, Scoped

You now hold the control: **the mechanism, the blast radius, and the fix — with the read-only default and the human gate.** The intern has the pantry keys — and the vault needs the signature (L314).

Next: the tool schemas, permissions, and the sandbox — Unsafe Tool Calling (L315).
