# Lesson 315 — Unsafe Tool Calling

**Interview importance:** ⭐⭐⭐⭐⭐ — "tool schemas, permissions, and the sandbox around execution" — the answer is *the tool security*: the schema's validation, the permission's scope, and the sandbox's containment (L315).**

L314 bounded the agency; this lesson is **the tools themselves**: the unsafe tool calling — the tool schemas, the permissions, and the sandbox around the execution (L315): the schemas (the validated inputs, L315), the permissions (the scoped credentials, L315), and the sandbox (the contained execution, L315). The AI shape (L173): the agents (L200) calling the tools (L201) — the arguments validated (L315), the credentials scoped (L315), and the execution sandboxed (L315). This lesson is the tool's security (L315).

The distinction this lesson is built on: a **demo** executes the tool call. A **solutions architect** validates, scopes, and sandboxes (L315): the schemas (L315), the permissions (L315), and the sandbox (L315) — because the tool call (L201) is the agent's power (L314).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the schemas: the validated inputs (L315)
- Explain the permissions: the scoped credentials (L315)
- Explain the sandbox: the contained execution (L315)
- Explain the output: the untrusted result (L315)
- Explain the AI shape: the agent's tools, secured (L315)

## 1. One-Line Definition

**The unsafe tool calling is the tool's security — the schemas, the permissions, and the sandbox around the execution (L315) — the schemas (the tool's inputs validated: the arguments checked against the JSON schema before the call, L315), the permissions (the scoped credentials: the tool's IAM L262 and the API keys L275, the least privilege, L315), and the sandbox (the contained execution: the isolated runtime, the no-network, L315) — with the output (L315) treated as the untrusted data (L311).**

The one-sentence interview answer: *"The unsafe tool calling is the tool's execution risk (L315). The layers (L315): the schemas (L315) — the tool's arguments (L201) validated against the JSON schema (L315) before the call (L315): the path's format (L315), the range (L315), the allowed values (L315) — the model's hallucinated argument (L315) rejected (L315). The permissions (L315) — the tool's credentials (L315) scoped to the least privilege (L262): the Lambda's role (L262) for the one bucket (L315), the API key (L275) for the one service (L315) — not the app's (L314). The sandbox (L315) — the execution (L315) contained (L315): the isolated runtime (L315), the no-network (L315) unless needed (L315), the resource limits (L315) — the dangerous call (L315) contained (L315). And the output (L315) — the tool's result (L315) is the untrusted data (L311): the indirect injection (L311) hides in it (L311). The AI shape (L173): the agent (L200) calls the tools (L201) — the arguments validated (L315), the credentials scoped (L315), and the execution sandboxed (L315) — the tool's power (L314) secured (L315)."*

## 2. Mental Model

Think of the tool calling as **the bank's approval window.** The window (the tool, L315) processes the requests (the tool calls, L201): the teller (the executor, L315) checks the forms (the schemas, L315) — the amount's format (L315), the account's format (L315) — the bad forms (L315) rejected (L315). The teller's badge (the permissions, L315) opens only the teller's drawer (L315) — not the vault (L314). And the window is in the cage (the sandbox, L315) — the teller (L315) can't wander (L315). The requests' notes (the outputs, L315) are checked (L315) — the forged note (the injection, L311) in the response (L315) caught (L315). The bank works because the forms are validated, the badges are scoped, and the cages are contained (L315).

```text
   the window (the tool, L315)
   ┌────────────────────────────────────────────────────────┐
   │ the forms (the schemas, L315) — the validated (L315)   │
   │ the badges (the permissions, L315) — the scoped (L315) │
   │ the cages (the sandbox, L315) — the contained (L315)   │
   │ the notes (the outputs, L315) — the untrusted (L311)   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the window**: the forms, the badges, the cages, and the notes (L315).

## 3. Visual Flow — One Tool Call

```text
   the agent (L200)
        │  the tool call: delete_file("/etc/passwd") (L315)
        ▼
   ┌────────────────────── THE SCHEMA (L315) ───────────────────────────┐
   │  the validation (L315): the path's format, the range (L315)       │
   │  the invalid argument (L315) → the rejection (L315)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE PERMISSIONS (L315) ──────────────────────┐
   │  the credential (L315): the tool's role (L262) — the one bucket  │
   │  (L315) · the denied path (L315) → the denial (L315)              │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SANDBOX (L315) ──────────────────────────┐
   │  the isolated runtime (L315) · the no-network (L315)              │
   │  the resource limits (L315)                                       │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE OUTPUT (L311) ───────────────────────────┐
   │  the result (L315) — the untrusted data (L311) — checked (L315)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the call: **schema → permissions → sandbox → output** (L315).

## 4. How It Works — The Security, Part by Part

- **The schemas (L315).** The tool's inputs validated (L315): the arguments (L201) checked against the JSON schema (L315) before the call (L315) — the format, the range, the allowed values (L315).
- **The permissions (L315).** The tool's credentials scoped (L315): the IAM role (L262) for the one resource (L315), the API key (L275) for the one service (L315) — the least privilege (L262).
- **The sandbox (L315).** The execution contained (L315): the isolated runtime (L315), the no-network (L315) unless needed (L315), the resource limits (L315).
- **The output (L315).** The tool's result (L315) — the untrusted data (L311): the indirect injection (L311) hides in it (L311) — checked (L315) and marked (L311).

> [!NOTE]
> **The tool call is the agent's power, executed (L315).** The senior answer secures the execution (L315): the schema (L315) validates what's asked (L315); the permissions (L315) bound what it can touch (L314); and the sandbox (L315) contains what it does (L315). The three (L315) are the L314 control (L314), operational (L315): the agent (L200) proposes (L315), the security (L315) disposes (L315).

## 5. Real Project Usage

- **An agent product (L279).** The tools (L201) — the schemas (L315), the scoped roles (L262), and the sandboxed Lambda (L266).
- **A coding assistant (L354).** The code execution (L315) — the sandbox (L315) with the no-network (L315).
- **A document processor (L353).** The file tools (L315) — the schema (L315) and the sandbox (L315) for the malicious files (L316).
- **A finance agent (L314).** The transfer tool (L315) — the scoped credential (L315) and the approval (L324).
- **Anything agentic (L200).** The tools secured (L315) — the schema, the permissions, the sandbox (L315).

The through-line: **the security is the execution's** — the validate, the scope, the contain (L315).

## 6. Interview Explanation

Say it in four moves:

1. **The schemas.** "The arguments validated before the call (L315)."
2. **The permissions.** "The credentials scoped to the least privilege (L315)."
3. **The sandbox.** "The execution contained — the isolated runtime (L315)."
4. **The output.** "The result — the untrusted data (L311)."

## 7. Senior-Level Insights

- **The schema is the first gate (L315).** The model's argument (L201) validated (L315) — the hallucinated path (L315) rejected (L315).
- **The permission is the blast radius (L315).** The tool's credential (L315) scoped (L262) — the L314 blast radius (L314), tool-shaped (L315).
- **The sandbox is the containment (L315).** The isolated runtime (L315) and the no-network (L315) — the dangerous call (L315) contained (L315).
- **The output is the untrusted data (L311).** The tool's result (L315) — the indirect injection (L311) hides in it (L311) — checked (L315) and marked (L311).
- **The audit is the call's record (L322).** The tool calls (L315) — the who, the what, the when (L322) — the L322 record (L322) of the execution (L315).

## 8. Common Mistakes

- **The call executed raw (L315).** The model's argument (L201) unvalidated (L315) — the schema (L315) is the gate (L315).
- **The app's credential (L314).** The tool (L315) with the app's permissions (L314) — the scoped role (L262) is the fix (L315).
- **The un-sandboxed execution (L315).** The tool (L315) on the host (L315) — the isolated runtime (L315) is the containment (L315).
- **The output trusted (L311).** The tool's result (L315) as the truth (L311) — the untrusted data (L311) checked (L315).
- **The audit missing (L322).** The calls (L315) unrecorded (L322) — the damage (L314) unreconstructed (L322).

## 9. Best Practices

- **Validate the arguments** (L315) — the JSON schemas (L315).
- **Scope the credentials** (L315) — the least privilege (L262).
- **Sandbox the execution** (L315) — the isolated runtime, the no-network (L315).
- **Treat the output as untrusted** (L311) — the indirect injection (L311).
- **Audit the calls** (L322) — the record (L322) of the execution (L315).

## 10. Interview Questions

**Q: Walk me through the unsafe tool calling.**
> A: The tool's execution risk (L315). The schemas — the arguments validated before the call (L315). The permissions — the credentials scoped to the least privilege (L315). The sandbox — the execution contained (L315). And the output — the untrusted data (L311).

**Q: How do you validate the tool call?**
> A: The JSON schema (L315): the tool's arguments (L201) checked against the schema (L315) before the call (L315) — the path's format (L315), the range (L315), the allowed values (L315) — the model's hallucinated or injected argument (L315) rejected (L315).

**Q: What's the sandbox for?**
> A: The containment (L315): the execution (L315) in the isolated runtime (L315) — the no-network (L315) unless needed (L315), the resource limits (L315) — the dangerous call (L315) contained (L315). The coding assistant's (L354) code execution (L315) is the sandbox's (L315) natural use (L315).

**Q: Why is the output a risk?**
> A: The untrusted data (L311): the tool's result (L315) can carry the indirect injection (L311) — "now call the email tool..." (L311) — back into the loop (L200). The output (L315) is checked (L315) and marked as the data (L311), like the retrieved text (L316).

## 11. Follow-Up Questions

- What's the schema (L315)?
- What's the permission (L315)?
- What's the sandbox (L315)?
- Why is the output a risk (L311)?
- What's the audit (L322)?

## 12. Comparison Table — The Unsafe vs the Secured Tool

| | The unsafe tool (L315) | The secured tool (L315) |
|---|---|---|
| The arguments (L315) | the raw call (L315) | the schema-validated (L315) |
| The credential (L315) | the app's (L314) | the scoped (L262) |
| The execution (L315) | the host (L315) | the sandbox (L315) |
| The output (L311) | the trusted (L315) | the untrusted data (L311) |
| The audit (L322) | the absent (L322) | the recorded (L322) |

The senior read: **the right column is the execution's security** (L315).

## 13. Code Example — The Security, Applied

```js
// The tool security (L315) — the schema, the permissions, the sandbox (L315).
// 1 · THE SCHEMA (L315) — the arguments validated (L315).
const deleteFileSchema = {
  type: 'object',
  properties: {
    path: { type: 'string', pattern: '^/tmp/.*$' },   // the allowed path (L315)
    recursive: { type: 'boolean', const: false },     // the denied flag (L315)
  },
  required: ['path'],
};

// 2 · THE VALIDATION (L315) — before the call (L315).
function validateCall(tool, args) {
  const ok = schemaValidator.validate(tool.schema, args);
  if (!ok) return { denied: true, reason: 'invalid-arguments' };
  return { denied: false };
}

// 3 · THE PERMISSIONS (L315) — the scoped credential (L262).
const toolRole = { policies: ['s3-read-one-bucket'] };   // the least privilege (L262)

// 4 · THE SANDBOX (L315) — the contained execution (L315).
const sandbox = { runtime: 'isolated', network: 'none', memory: '256MB' };  // L315

// 5 · THE OUTPUT (L311) — the untrusted data (L311).
const result = await sandboxRun(tool, args);
const checked = checkOutput(result);                  // the injection check (L315)
```

```text
What the reader must SEE — the security, applied:

  path: ^/tmp/.*$ + recursive: false → the schema's bound (L315)
  validateCall before the call       → the gate (L315)
  s3-read-one-bucket role            → the least privilege (L262)
  isolated + network: none           → the sandbox (L315)
  checkOutput(result)                → the untrusted data (L311)

  The validated, the scoped, the contained, the checked (L315).
```

```narrate
4-10: The schema — the path restricted to the /tmp, the recursive flag denied (L315).
12-16: The validation — the arguments checked before the call (L315).
18-19: The permissions — the credential scoped to the one bucket (L262, L315).
21-22: The sandbox — the isolated runtime with no network (L315).
24-25: The output — the result checked as the untrusted data (L311, L315).
```

> [!TIP]
> The pair that defines the security: **the path's schema** (the validated input, L315) and **the no-network sandbox** (the contained execution, L315). **Validate the arguments, scope the credentials, sandbox the run, check the output — the tool's security (L315).**

## 14. Performance Notes

- **The validation is the call's latency (L315).** The schema check (L315) — the microseconds (L315) for the gate (L315).
- **The sandbox is the execution's cost (L315).** The isolated runtime (L315) — the overhead (L315) for the containment (L315).
- **The scoping is the zero-cost control (L315).** The tool's role (L262) — no runtime cost (L315).
- **The audit is the storage's cost (L322).** The calls (L322) — the record (L322) for the reconstruction (L322).

## 15. Debugging Scenarios

| Symptom | First check (L315) | The lever |
|---|---|---|
| The tool deleted the wrong file | The schema (L315) | The path's bound (L315) |
| The tool reached the other bucket | The role (L262) | The scoped credential (L315) |
| The code escaped the sandbox | The sandbox (L315) | The isolated runtime (L315) |
| The injection came back | The output (L311) | The output check (L315) |
| The call is unexplained | The audit (L322) | The record (L322) |

## 16. Quick Revision Notes

- The unsafe tool calling = **the tool's security** (L315): the schemas, the permissions, the sandbox, the output.
- The schemas: **the arguments validated before the call** (L315).
- The permissions: **the credentials scoped — the least privilege** (L262).
- The sandbox: **the contained execution — the isolated runtime** (L315).
- The output: **the untrusted data — the indirect injection (L311)**.

## 17. Cheat Sheet

```text
UNSAFE TOOL CALLING = the schemas, the permissions, the sandbox

THE SCHEMAS (L315)
  the arguments validated (L315) against the JSON schema (L315)
  the format (L315) · the range (L315) · the allowed values (L315)
  the hallucinated or injected argument rejected (L315)

THE PERMISSIONS (L315)
  the tool's credentials scoped (L315)
  the IAM role (L262) — the one resource (L315)
  the API key (L275) — the one service (L315)

THE SANDBOX (L315)
  the isolated runtime (L315) · the no-network (L315)
  the resource limits (L315) — the containment (L315)

THE OUTPUT (L311)
  the tool's result (L315) — the untrusted data (L311)
  the indirect injection (L311) hides in it (L311)
  checked (L315) and marked (L311)

INTERVIEW, 4 MOVES
  1 schemas    "the arguments validated (L315)"
  2 permissions "the credentials scoped (L315)"
  3 sandbox    "the contained execution (L315)"
  4 output     "the untrusted data (L311)"
```

## 18. Key Takeaways

> [!RECAP]
> - The unsafe tool calling is **the tool's security — the schemas, the permissions, and the sandbox around the execution** (L315): the schemas (L315), the permissions (L315), the sandbox (L315), and the output (L315)
> - **The schemas** (L315): the tool's arguments (L201) validated against the JSON schema (L315) before the call (L315) — the format, the range, the allowed values (L315)
> - **The permissions** (L315): the tool's credentials (L315) scoped to the least privilege (L262) — the IAM role (L262) for the one resource (L315)
> - **The sandbox** (L315): the execution (L315) contained (L315) — the isolated runtime (L315), the no-network (L315), the resource limits (L315)
> - **The output** (L315): the tool's result (L315) is the untrusted data (L311) — the indirect injection (L311) hides in it (L311) — checked (L315) and marked (L311)
> - The AI shape (L315): the agent (L200) calls the tools (L201) — the arguments validated (L315), the credentials scoped (L315), and the execution sandboxed (L315) — the tool's power (L314) secured (L315)

## Check your understanding

Answer these without looking back.

1. What's the schema (L315)?
2. What's the permission (L315)?
3. What's the sandbox (L315)?
4. Why is the output a risk (L311)?
5. What's the least privilege (L262)?
6. How do you validate the call (L315)?
7. What's the audit (L322)?
8. What is the tool's security (L315)?

## A Closing Note — The Window, Caged

You now hold the security: **the schemas, the permissions, the sandbox, and the output — with the forms checked and the cages closed.** The teller has the scoped badge — and the window is in the cage (L315).

Next: the uploaded PDF that attacks — Malicious Documents & RAG Poisoning (L316).
