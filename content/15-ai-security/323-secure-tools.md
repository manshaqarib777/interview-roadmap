# Lesson 323 — Secure Tool Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "least privilege, scoped credentials, and tool output filtering" — the answer is *the tool architecture*: the tool's design as a security boundary (L323).**

L315 secured the tool call; this lesson is **the tool's design**: the secure tool architecture — the least privilege, the scoped credentials, and the tool output filtering (L323): the design (the tool as a boundary, L323), the credentials (the scoped roles, L262), and the output (the filtered result, L323). The AI shape (L173): the agent's tools (L315) — designed as the boundaries (L323) — the L314 control (L314), architecture-shaped (L323). This lesson is the tool's architecture (L323).

The distinction this lesson is built on: a **demo** wires the tool. A **solutions architect** designs the boundary (L323): the least privilege (L323), the scoped credentials (L323), and the output filtering (L323) — because the tool (L315) is the agent's power (L314).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the design: the tool as a boundary (L323)
- Explain the credentials: the scoped roles (L262)
- Explain the output: the filtered result (L323)
- Explain the validation: the schema and the permission (L315)
- Explain the AI shape: the agent's tools, boundary-designed (L323)

## 1. One-Line Definition

**The secure tool architecture designs the tool as a security boundary (L323) — the design (the tool's interface: the schema L315, the permission L323, and the audit L322, L323), the credentials (the scoped roles: the tool's IAM L262 for the one resource L315, the per-tool keys L275, L323), and the output (the filtered result: the injection L311 checked, the sensitive data L313 removed, L323) — the L314 control (L314), architecture-shaped (L323).**

The one-sentence interview answer: *"The secure tool architecture designs the tool as a boundary (L323). The design (L323): the tool's interface (L323) — the schema (L315) validating the inputs (L323), the permission (L323) authorizing the call (L314), and the audit (L322) recording it (L323) — the tool (L315) is a checked door (L323). The credentials (L323): the scoped roles (L262) — the tool's IAM role (L262) for the one resource (L315), the per-tool API keys (L275) — the least privilege (L314), tool-shaped (L323). The output (L323): the filtered result (L323) — the injection (L311) checked (L323), the sensitive data (L313) removed (L323), and the result (L315) returned as the untrusted data (L311). The AI shape (L173): the agent's tools (L315) — the boundaries (L323): each tool (L323) validates (L315), scopes (L262), filters (L323), and audits (L322) — the L314 control (L314), architecture-shaped (L323)."*

## 2. Mental Model

Think of the secure tool architecture as **the embassy's service windows.** The windows (the tools, L323) are the only way in (L323): each window (L323) has the form (the schema, L315) — the valid requests (L323) only; the clerk's badge (the permission, L314) — the one window's service (L323); the supplies (the credentials, L262) — the window's own drawer (L323), not the vault (L314); and the stamps (the audit, L322) — every request recorded (L323). The replies (the outputs, L323) are checked (L323) before the return (L311). The embassy works because the windows are the only doors, each is scoped, and every request is stamped (L323).

```text
   the windows (the tools, L323)
   ┌────────────────────────────────────────────────────────┐
   │ the forms (the schemas, L315) — the valid only (L323)  │
   │ the badges (the permissions, L314) · the drawers (the  │
   │ credentials, L262)                                     │
   │ the stamps (the audit, L322) · the checked replies     │
   │ (the outputs, L323)                                    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the windows**: the forms, the badges, the drawers, and the stamps (L323).

## 3. Visual Flow — One Tool's Architecture

```text
   the agent (L200)
        │  the tool call (L315)
        ▼
   ┌────────────────────── THE INTERFACE (L323) ────────────────────────┐
   │  the schema (L315) — the inputs validated (L323)                  │
   │  the permission (L314) — the caller authorized (L323)             │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EXECUTION (L323) ────────────────────────┐
   │  the scoped credential (L262) — the one resource (L323)           │
   │  the sandbox (L315) — the contained run (L323)                    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE OUTPUT (L323) ───────────────────────────┐
   │  the injection checked (L311) · the sensitive data removed (L313) │
   │  the audit (L322) — the call recorded (L323)                      │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the architecture: **interface → execution → output** (L323).

## 4. How It Works — The Boundary, Part by Part

- **The design (L323).** The tool's interface (L323): the schema (L315) validating the inputs (L323), the permission (L314) authorizing the call (L323), and the audit (L322) recording it (L323).
- **The credentials (L323).** The scoped roles (L262): the tool's IAM (L262) for the one resource (L315), the per-tool keys (L275) — the least privilege (L314).
- **The output (L323).** The filtered result (L323): the injection (L311) checked (L323), the sensitive data (L313) removed (L323), and the result (L315) returned as the untrusted data (L311).

> [!NOTE]
> **The tool is the boundary; the agent is the caller (L323).** The senior answer designs the tool (L323) as the security boundary (L323) — not the agent (L200): the tool (L323) validates its own inputs (L315), scopes its own credentials (L262), filters its own outputs (L323), and audits its own calls (L322) — the agent (L200) is the caller (L323), not the control (L323). The L314 control (L314) lives in the tools (L323).

## 5. Real Project Usage

- **An agent product (L279).** The tools (L315) as the boundaries (L323): the schemas (L315), the scoped roles (L262), the filtered outputs (L323).
- **A document processor (L353).** The file tool (L323) — the schema (L315), the sandbox (L315), and the PII filter (L313).
- **A finance agent (L314).** The transfer tool (L323) — the scoped credential (L262), the approval (L324), and the audit (L322).
- **A coding assistant (L354).** The execution tool (L323) — the sandbox (L315) and the output filter (L323).
- **Anything agentic (L200).** The tools (L315) boundary-designed (L323) — the L314 control (L314), architecture-shaped (L323).

The through-line: **the boundary is the tool's** — the interface, the credentials, and the output (L323).

## 6. Interview Explanation

Say it in four moves:

1. **The design.** "The tool's interface — the schema, the permission, the audit (L323)."
2. **The credentials.** "The scoped roles — the one resource (L262)."
3. **The output.** "The filtered result — the injection checked (L311)."
4. **The boundary.** "The tool is the control; the agent is the caller (L323)."

## 7. Senior-Level Insights

- **The tool is the boundary (L323).** The tool (L323) validates (L315), scopes (L262), filters (L323), and audits (L322) — the agent (L200) is the caller (L323).
- **The credential is the least privilege (L262).** The tool's role (L262) for the one resource (L315) — the L314 blast radius (L314), tool-shaped (L323).
- **The output is the untrusted data (L311).** The tool's result (L315) filtered (L323) — the injection (L311) checked (L323), the PII (L313) removed (L313).
- **The audit is the call's record (L322).** The tool's calls (L322) — the who, the what, the when (L322) — the L322 record (L322), tool-shaped (L323).
- **The schema is the first gate (L315).** The tool's inputs (L315) validated (L323) — the model's argument (L315) rejected (L323).

## 8. Common Mistakes

- **The agent as the control (L200).** The agent (L200) trusted to be careful (L314) — the boundary (L323) is the tool's (L323).
- **The app's credential (L314).** The tool (L315) with the app's role (L314) — the scoped role (L262) is the fix (L323).
- **The raw output (L311).** The tool's result (L315) un-filtered (L323) — the injection (L311) and the PII (L313) checked (L323).
- **The tool un-audited (L322).** The calls (L315) unrecorded (L322) — the L322 record (L322) missing (L323).
- **The wide schema (L315).** The open inputs (L315) — the schema (L315) is the gate (L323).

## 9. Best Practices

- **Boundary-design the tools** (L323) — the interface, the credentials, the output (L323).
- **Scope the credentials** (L262) — the one resource (L315).
- **Filter the outputs** (L323) — the injection (L311), the PII (L313).
- **Audit the calls** (L322) — the record (L322) of the tool (L323).
- **Validate the inputs** (L315) — the schema (L315) first (L323).

## 10. Interview Questions

**Q: Walk me through the secure tool architecture.**
> A: The tool as a boundary (L323). The design — the tool's interface: the schema (L315), the permission (L314), the audit (L322). The credentials — the scoped roles (L262). The output — the filtered result (L323). And the principle — the tool is the control, the agent is the caller (L323).

**Q: Why is the tool the boundary and not the agent?**
> A: The agent (L200) is the caller (L323) — driven by the prompt (L309) and the injection (L311) (L323). The tool (L323) is the boundary (L323): it validates its own inputs (L315), scopes its own credentials (L262), filters its own outputs (L323), and audits its own calls (L322) — the control (L314) lives in the tools (L323), not the judgment (L314).

**Q: What does the tool's output filtering do?**
> A: The result (L315) checked before the return (L323): the injection (L311) — the tool's output (L315) is the untrusted data (L311) — checked (L323); the sensitive data (L313) — the PII (L313) removed (L313); and the result (L315) returned as the data (L311), marked (L311).

**Q: How do you scope the credentials?**
> A: The least privilege (L262): the tool's IAM role (L262) for the one resource (L315) — the one bucket (L265), the one API (L267); the per-tool keys (L275) in the vault (L275); and the sandbox (L315) containing the execution (L323). The blast radius (L314) is the tool's (L323).

## 11. Follow-Up Questions

- What's the design (L323)?
- Why is the tool the boundary (L323)?
- What does the output filtering do (L323)?
- How do you scope the credentials (L262)?
- What's the audit (L322)?

## 12. Comparison Table — The Raw vs the Boundary Tool

| | The raw tool (L315) | The boundary tool (L323) |
|---|---|---|
| The inputs (L315) | the raw call (L315) | the schema-validated (L323) |
| The credential (L314) | the app's (L314) | the scoped (L262) |
| The output (L311) | the raw result (L315) | the filtered (L323) |
| The audit (L322) | the absent (L322) | the recorded (L323) |
| The boundary (L323) | the agent's judgment (L314) | the tool's design (L323) |

The senior read: **the right column is the boundary** — the tool designed as the control (L323).

## 13. Code Example — The Boundary, Designed

```js
// The secure tool architecture (L323) — the tool as a boundary (L323).
// 1 · THE INTERFACE (L323) — the schema and the permission (L323).
const sendEmailTool = {
  name: 'send_email',
  schema: {
    type: 'object',
    properties: {
      to: { type: 'string', format: 'email', pattern: '@company\\.com$' },
      body: { type: 'string', maxLength: 2000 },
    },
    required: ['to', 'body'],
  },
  permission: ['email:send'],                // the scope (L314, L323)
};

// 2 · THE EXECUTION (L323) — the scoped credential (L262).
async function execute(tool, args, ctx) {
  validateSchema(tool.schema, args);         // the gate (L315)
  authorize(tool.permission, ctx);           // the permission (L314)
  const cred = await getScopedCredential(tool.name);   // the vault (L275)
  const result = await callService(tool, args, cred);  // the sandboxed (L315)
  return filterOutput(result);               // the output filter (L323)
}

// 3 · THE OUTPUT (L323) — the injection and the PII checked (L323).
function filterOutput(result) {
  return {
    ...result,
    body: sanitize(result.body),             // the injection (L311)
    pii: redact(result.pii),                 // the PII (L313)
    untrusted: true,                         // the data-as-data (L311)
  };
}

// 4 · THE AUDIT (L322) — the call recorded (L323).
await audit.log({ tool: 'send_email', args, outcome, at });   // L322
```

```text
What the reader must SEE — the boundary, designed:

  schema + permission      → the interface (L315, L314, L323)
  getScopedCredential      → the least privilege (L262, L275)
  sanitize + redact        → the output filter (L323, L313)
  untrusted: true          → the data-as-data (L311)
  audit.log                → the record (L322)

  The tool validates, scopes, filters, and audits (L323).
```

```narrate
4-13: The interface — the email tool's schema and permission (L315, L314).
15-20: The execution — the validation, the authorization, and the scoped credential (L262, L315).
22-28: The output — the injection sanitized, the PII redacted, the result marked untrusted (L311, L313).
30-31: The audit — the call recorded (L322, L323).
```

> [!TIP]
> The pair that defines the architecture: **the tool's schema** (the interface, L315) and **the scoped credential** (the least privilege, L262). **Design the interface, scope the credentials, filter the output, audit the call — the tool as the boundary (L323).**

## 14. Performance Notes

- **The validation is the call's latency (L323).** The schema (L315) — the microseconds (L323) for the gate (L323).
- **The scoping is the zero-cost control (L262).** The tool's role (L262) — no runtime cost (L323).
- **The filtering is the output's latency (L323).** The sanitize and the redact (L323) — the milliseconds (L323) for the safety (L323).
- **The audit is the storage's cost (L322).** The calls (L322) — the record (L322) for the governance (L322).

## 15. Debugging Scenarios

| Symptom | First check (L323) | The lever |
|---|---|---|
| The tool accepts the bad input | The schema (L315) | The validation (L323) |
| The tool reaches too far | The credential (L262) | The scoped role (L262) |
| The injection comes back | The output (L311) | The sanitize (L323) |
| The PII is in the result | The output (L313) | The redact (L313) |
| The call is unexplained | The audit (L322) | The record (L322) |

## 16. Quick Revision Notes

- The secure tool architecture = **the tool as a boundary** (L323): the design, the credentials, the output.
- The design: **the interface — the schema (L315), the permission (L314), the audit (L322)**.
- The credentials: **the scoped roles (L262) — the one resource (L315)**.
- The output: **the filtered result — the injection (L311), the PII (L313)**.
- The principle: **the tool is the control; the agent is the caller (L323)**.

## 17. Cheat Sheet

```text
SECURE TOOL ARCHITECTURE = the tool as a security boundary

THE DESIGN (L323)
  the interface (L323): the schema (L315) — the inputs validated
  the permission (L314) — the caller authorized
  the audit (L322) — the call recorded

THE CREDENTIALS (L323)
  the scoped roles (L262) — the tool's IAM (L262)
  the one resource (L315) · the per-tool keys (L275)
  the least privilege (L314)

THE OUTPUT (L323)
  the filtered result (L323)
  the injection (L311) checked · the PII (L313) removed
  the result (L315) returned as the untrusted data (L311)

THE PRINCIPLE (L323)
  the tool is the boundary (L323) — the agent is the caller (L323)
  the control (L314) lives in the tools (L323)

INTERVIEW, 4 MOVES
  1 design      "the schema, the permission, the audit (L323)"
  2 credentials "the scoped roles (L262)"
  3 output      "the filtered result (L323)"
  4 principle   "the tool is the boundary (L323)"
```

## 18. Key Takeaways

> [!RECAP]
> - The secure tool architecture **designs the tool as a security boundary** (L323): the design (L323), the credentials (L323), and the output (L323)
> - **The design** (L323): the tool's interface (L323) — the schema (L315) validating the inputs (L323), the permission (L314) authorizing the call (L323), and the audit (L322) recording it (L323)
> - **The credentials** (L323): the scoped roles (L262) — the tool's IAM (L262) for the one resource (L315), the per-tool keys (L275) — the least privilege (L314)
> - **The output** (L323): the filtered result (L323) — the injection (L311) checked (L323), the sensitive data (L313) removed (L313), and the result (L315) returned as the untrusted data (L311)
> - **The principle** (L323): the tool is the boundary (L323) — it validates (L315), scopes (L262), filters (L323), and audits (L322) — and the agent (L200) is the caller (L323), not the control (L323)
> - The AI shape (L323): the agent's tools (L315) — the boundaries (L323) — the L314 control (L314), architecture-shaped (L323)

## Check your understanding

Answer these without looking back.

1. What's the design (L323)?
2. Why is the tool the boundary (L323)?
3. What does the output filtering do (L323)?
4. How do you scope the credentials (L262)?
5. What's the least privilege (L314)?
6. What's the audit (L322)?
7. What's the data-as-data (L311)?
8. What is the tool as a boundary (L323)?

## A Closing Note — The Windows, Designed

You now hold the architecture: **the design, the credentials, and the output — with the tool as the boundary and the agent as the caller.** The embassy's windows are the only doors — and every request is stamped (L323).

Next: the highest-value control — Human Approval as a Security Control (L324).
