# Lesson 201 — Tool Calling for Agents

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do agents call tools?" — the answer is the *contract*: schemas the model proposes against (L144), execution the system controls (L212, L315), results back in context (L164) — done safely (L315).**

L200 drew the loop; "act" is this lesson: **tool calling for agents** — the contract between the model and the world. The model *proposes* tool calls against schemas (L144); the system *executes* them under authority (L212, L315); the results return to the context for the next cycle (L164). The discipline: precise schemas (L143–144), safe execution (L315), and results that are validated before they re-enter the model's context (L212) — because the tool result is the agent's window onto the world, and a poisoned window poisons the loop (L212, L316).

The distinction this lesson is built on: a **demo** exposes a function to the model and executes whatever comes back. A **solutions architect** designs the tool layer deliberately: schemas that make the model's proposals precise (L144), an execution boundary with scoping and validation (L315), result handling that feeds the context safely (L164, L212), and the failure modes of tool calls — malformed, refused, failed, poisoned (L211, L316).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tool contract: model proposes, system executes (L201)
- Design tool schemas: names, parameters, descriptions that get precise calls (L144)
- Design the execution boundary: validation, scoping, authority (L212, L315)
- Handle results: validation before they re-enter the context (L164, L212)
- Explain tool failure modes: malformed, refused, failed, poisoned (L211, L316)

## 1. One-Line Definition

**Tool calling for agents is the contract between the model and the world — the model proposes tool calls against precise schemas (L144), the system validates and executes them under scoped authority (L212, L315), and the results are validated before they re-enter the model's context (L164) — the "act" box of the L200 loop, where the agent's power and its attack surface both live (L212).**

The one-sentence interview answer: *"Tool calling is the contract (L201). Three layers. The schema — I define each tool with a name, parameters, and a description that teaches the model when to call it (L144); a precise schema gets precise calls (L143). The execution boundary — the model proposes, but the system executes: the call is validated against the schema, the tool is checked against the allowed list (L315), risky actions are gated (L208), and the execution is sandboxed where it matters (L212). The result handling — the tool's output is validated before it re-enters the context (L164), because the result is the model's window onto the world and untrusted tool output is an injection vector (L212, L316). The failure modes — malformed calls, refused calls, failed tools, and poisoned results — each handled explicitly (L211)."*

## 2. Mental Model

Think of tool calling as **a contract between a manager (the model) and a contractor (the system).** The manager writes a request on the contract form (the schema, L144) — what job, what details. The contractor checks the form (validates against the schema), checks the job against the permit (the allowed list, L315), and only then does the work (executes). The contractor hands back a *receipt* (the result) — which the manager reads and acts on. The safety comes from the contractor's checks, not the manager's good intentions: the form must be valid, the job must be permitted, and the receipt must be trustworthy (L212).

```text
   the model (manager)              the system (contractor)
   ┌─────────────────────┐          ┌──────────────────────────────┐
   │ proposes a call     │          │ validate the schema (L144)   │
   │ against the schema  │  ─────►  │ check the allowed list (L315)│
   │ (L144)              │          │ gate risky actions (L208)    │
   └─────────────────────┘          │ execute (sandboxed, L212)    │
                                    │ validate the result (L164)   │
                                    └──────────────┬───────────────┘
                                                   ▼
                                    the result → the model's context
```

The mental model is **contractor, not servant**: the model proposes, the system checks, executes, and vets the result — the safety lives in the system's checks (L212).

## 3. Visual Flow — One Tool Call, End to End

```text
   the model decides a tool is needed (L202)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · PROPOSE (L144)                                       │
   │     the model emits a call against the schema:           │
   │     tool name + parameters — nothing else                │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · VALIDATE (L143, L315)                                │
   │     the parameters match the schema?                     │
   │     the tool is on the allowed list? (L315)              │
   │     malformed → re-ask or fail cleanly (L211)            │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · GATE + EXECUTE (L208, L212)                          │
   │     risky? → human approval (L208)                       │
   │     execute under the scoped identity (L315)             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · VET + RETURN (L164, L212)                            │
   │     the result is validated (shape, size, content)       │
   │     → joins the context for the next cycle (L200)        │
   └──────────────────────────────────────────────────────────┘
```

The flow is the contract: **propose → validate → gate+execute → vet+return** — every step a check owned by the system (L212).

## 4. How It Works — The Schema, the Execution, the Result

- **The schema (L144).** Each tool is a JSON schema: name, parameters, description. The description is *instructions* — it teaches the model when to call the tool, what the parameters mean, and what the tool does (L142). A precise schema (L143) gets precise calls; a vague description gets wrong calls (L211).
- **The execution boundary (L315, L212).** The model proposes; the system executes. The boundary checks: **validity** (parameters match the schema, L143), **authority** (the tool is allowed, scoped to the session, L315), **risk** (approval-gated if the action is consequential, L208), and **sandbox** (execution under the least-privilege identity, L212). The checks are the security posture (L212).
- **The result (L164, L212).** The tool's output returns to the context (L164). It's validated first: shape (is it the expected type?), size (does it fit the budget, L149?), and content (untrusted output can carry injection, L212, L316). The vetted result joins the model's window (L206).
- **The failure modes (L211).** Malformed calls (schema validation fails — re-ask the model), refused calls (authority rejects — log and continue), failed tools (the tool errors — the error returns to the model like a result, L211), and poisoned results (untrusted content — vetted before entry, L212, L316).

> [!NOTE]
> **The tool result is the agent's window onto the world — and its injection surface (L212, L316).** The model reads tool output as truth: a search result, an API response, a file. If the output is untrusted — a poisoned document (L316), a malicious API reply (L311) — the model can be steered (L212). The senior design vets results at the boundary: shape, size, and content (prompt-injection scanning, L309). The result handling is not plumbing — it's a security control (L212).

## 5. Real Project Usage

- **Research agent.** Tools: search, read URL, extract text (L177). Authority: read-only. Results: pages vetted for size and injection (L316).
- **Support agent.** Tools: get account, get policy (L189), draft reply. Authority: read + draft; approval-gated for refunds (L208).
- **Coding agent.** Tools: read file, search code, edit file, run tests. Authority: scoped to the repo (L315), no prod credentials (L212).
- **Automation (L217).** Tools: send email, update CRM, post to Slack — each an approval gate (L208) and an audit record (L213).
- **Finance agent.** Tools: read balance, initiate transfer — the transfer is approval-gated and sandboxed (L208, L212).

The through-line: **the tool layer is the agent's power and its attack surface** — schemas make the power precise, the execution boundary makes it safe (L201, L212).

## 6. Interview Explanation

Say it in four moves:

1. **The contract.** "The model proposes tool calls against schemas; the system validates, gates, and executes (L201, L212)."
2. **The schema.** "Name, parameters, description — the description teaches the model when to call (L144). Precise schema, precise calls (L143)."
3. **The boundary.** "Validate against the schema, check the allowed list (L315), gate risky actions (L208), sandbox the execution (L212)."
4. **The result.** "Vet the output — shape, size, content — before it re-enters the context (L164, L212). The result is the model's window and its injection surface (L316)."

## 7. Senior-Level Insights

- **The schema is the model's instruction manual (L144).** The senior design writes descriptions that teach — when to call, what the parameters mean, what not to do (L142). A schema is not just a type; it's prompt engineering (L143).
- **The execution boundary is the security posture (L212, L315).** Validation, scoping, approval gates (L208), and sandboxing are the least-privilege discipline (L315) applied to the loop — the excessive-agency defense (L212).
- **The result vetting is a security control (L212, L316).** The poisoned-result failure (L316) — untrusted output steering the model — is prevented at the boundary: shape, size, and content checks (L309). The senior answer treats result handling as security, not plumbing.
- **The failure modes are designed, not discovered (L211).** Malformed, refused, failed, poisoned — each has a designed response (L211), and each lands in the trace (L213) for the evals (L343).
- **The tool layer composes with the rest (L216).** Tool selection (L204) picks which tools the model sees; guardrails (L209) and security (L212) wrap the boundary; observability (L213) records the calls — the tool layer is the module's hub (L216).

## 8. Common Mistakes

- **Executing whatever comes back (L212).** No schema validation, no allowed list (L315) — the excessive-agency failure (L212).
- **Vague schemas (L144).** Descriptions that don't teach — the model calls the wrong tool, with wrong parameters (L211).
- **The model executing (L201).** The model running the tool itself — the execution boundary gone (L212).
- **Results entering raw (L212).** Untrusted output straight into the context (L316) — the injection surface open (L309).
- **No failure handling (L211).** A failed tool crashes the loop (L168) — the error should return to the model like any result (L211).
- **Full tool surface (L315).** Every tool exposed to every session — least privilege ignored (L212).

## 9. Best Practices

- **Write schemas that teach** (L144) — name, parameters, and a description that says when (L142).
- **Keep the model proposing, the system executing** (L201, L212).
- **Validate at the boundary** (L315) — schema, allowed list, session scope.
- **Gate the risky tools** (L208) — approval at the risk threshold.
- **Vet the results** (L212, L316) — shape, size, content — before the context (L164).
- **Design the failure modes** (L211) — malformed, refused, failed, poisoned — each a response, each in the trace (L213).

## 10. Interview Questions

**Q: How do agents call tools?**
> A: Through a contract (L201). The model proposes a call against a schema — tool name + parameters (L144). The system validates it against the schema, checks the allowed list (L315), gates risky actions (L208), and executes under the scoped identity (L212). The result is vetted — shape, size, content — before it re-enters the context (L164). The model proposes; the system disposes (L201).

**Q: What makes a good tool schema?**
> A: It teaches (L144). Name, parameters, and a description that tells the model *when* to call, what the parameters mean, and what the tool does (L142). A vague description produces wrong calls (L211); a precise one produces precise calls (L143). The schema is prompt engineering — the model reads it to decide (L144).

**Q: Why does the system execute, not the model?**
> A: Because the execution is where safety lives (L212). The model can propose anything its training allows; the system enforces what the *policy* allows — validation (L143), the allowed list (L315), approval gates (L208), sandboxing (L212). The model is the proposer; the system is the authority (L201). Letting the model execute is the excessive-agency failure (L212).

**Q: How do you handle tool results?**
> A: As untrusted input (L212). The result is the model's window onto the world — a poisoned document or a malicious API reply can steer the loop (L316). So the result is vetted at the boundary: shape (the expected type), size (the budget, L149), and content (injection scanning, L309). Then it joins the curated context (L164, L206). Result handling is a security control, not plumbing (L212).

## 11. Follow-Up Questions

- What's in the tool schema, and why (L144)?
- How do approval gates work (L208)?
- How do poisoned results attack the loop (L316)?
- What are the tool failure modes (L211)?
- How does tool selection narrow the surface (L204)?

## 12. Comparison Table — Demo vs Safe Tool Calling

| | Demo (L212) | Safe (this lesson) |
|---|---|---|
| Schema (L144) | minimal | teaches — when, what, why |
| Execution | whatever comes back | validated + allowed (L315) |
| Risk (L208) | unchecked | approval-gated |
| Sandbox (L212) | none | least-privilege identity |
| Result (L164) | raw into context | vetted — shape, size, content |
| Failures (L211) | crash | designed responses, traced (L213) |

The senior read: **the right column is the contract** — the checks that make the tool layer powerful *and* safe (L201).

## 13. Code Example — The Tool Layer

```js
// Tool calling: propose → validate → gate+execute → vet+return (L201).
const TOOLS = {
  get_balance: {
    description: 'Get the account balance. Use when the user asks about money or funds.',
    parameters: { accountId: { type: 'string' } },        // the schema (L144)
    allowed: (ctx) => ctx.scope.accounts.includes(args.accountId),  // L315
    requiresApproval: false,
    execute: (args, ctx) => accounts.balance(ctx.identity, args.accountId),  // L212
  },
  refund: {
    description: 'Issue a refund. Use only after the user explicitly requests one.',
    parameters: { orderId: { type: 'string' }, amount: { type: 'number' } },
    requiresApproval: true,                                // L208 — human gate
    execute: (args, ctx) => payments.refund(ctx.identity, args),
  },
};

// The boundary — the system owns every check (L201, L212).
async function handleToolCall(call, ctx) {
  const tool = TOOLS[call.name];
  if (!tool) return { ok: false, error: 'unknown tool' };          // refused (L211)
  if (!tool.allowed(ctx)) return { ok: false, error: 'not allowed' };  // L315
  const args = validate(call.arguments, tool.parameters);          // L143
  if (!args.ok) return { ok: false, error: 'malformed call' };     // re-ask (L211)
  if (tool.requiresApproval) await humanApprove(call, ctx);        // L208

  try {
    const result = await tool.execute(args, ctx);                  // L212
    return { ok: true, result: vet(result) };                      // vet (L316)
  } catch (e) {
    return { ok: false, error: String(e) };                        // failed → to the model (L211)
  }
}
```

```text
What the reader must SEE — the contract's checks:

  description: 'when to call'   → the schema teaches (L144)
  allowed + requiresApproval    → authority and gates (L315, L208)
  validate()                   → the parameters (L143)
  vet(result)                  → the untrusted output (L212, L316)
  every return path            → a designed failure (L211)

  The model proposes; the system checks and executes.
```

```narrate
2-14: The tool definitions — descriptions that teach (L144), scoped authority (L315), and approval flags (L208).
18-20: The boundary checks — unknown and disallowed tools are refused with designed responses (L211).
21-23: Validation — the parameters must match the schema before anything runs (L143).
24: The human gate — consequential actions require approval (L208).
26-30: Execution under the scoped identity (L212), with the result vetted (L316) and failures returned like results (L211).
```

> [!TIP]
> The pair that defines the safe tool layer: **`tool.allowed(ctx)`** (scope, L315) and **`vet(result)`** (the untrusted output, L212). **The model proposes anything; the boundary allows only what the policy approves — and reads only what it vets.**

## 14. Performance Notes

- **The schema is free (L144).** Descriptions cost tokens (L149) — keep them tight; a precise tool list (L204) is smaller than a bloated one (L150).
- **Tool latency dominates (L151).** Real tools are slower than the model (L145) — parallelize independent calls (L222) and cache tool results (L171).
- **Result size is a budget line (L149).** Vetting includes size — a huge result overflows the window (L138) and the bill (L150); truncate or summarize (L206).
- **The trace records the calls (L213).** Every proposal, check, and result lands in the trace (L213) — the eval (L343) and the audit (L322) read the same record.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Wrong tool called | Vague schema (L144) | Rewrite the description; check the golden set (L343) |
| Calls rejected | Allowed list too narrow (L315) | Scope per session, not globally |
| Loop steered by a doc | Poisoned result (L316) | Vet content at the boundary (L212) |
| Tool crash kills the loop | No failure handling (L211) | Return errors like results (L168) |
| Over-permission | Full tool surface (L315) | Least privilege per session (L212) |

## 16. Quick Revision Notes

- Tool calling = **the contract**: model proposes, system executes (L201).
- The schema **teaches** — description says when (L144).
- The boundary checks: **validity (L143), authority (L315), risk (L208), sandbox (L212)**.
- Results are **vetted** — shape, size, content (L212, L316).
- Failures are **designed**: malformed, refused, failed, poisoned (L211).
- Every call lands in the **trace** (L213).

## 17. Cheat Sheet

```text
TOOL CALLING = the contract between the model and the world

THE CONTRACT (L201)
  the model PROPOSES — a call against the schema (L144)
  the system EXECUTES — validated, scoped, gated (L212, L315)

THE SCHEMA (L144)
  name + parameters + description
  the description TEACHES: when to call, what it means (L142)
  precise schema → precise calls (L143)

THE EXECUTION BOUNDARY (L315, L212)
  validate   parameters match the schema (L143)
  authority  the tool is on the allowed list, scoped (L315)
  risk       approval-gated for consequential actions (L208)
  sandbox    least-privilege identity (L212)

THE RESULT (L164, L212)
  vet: shape · size · content — untrusted output (L316)
  the result is the model's window AND its injection surface (L309)

THE FAILURES (L211)
  malformed → re-ask · refused → log · failed → error as result
  poisoned → vetted at the boundary — each designed, each traced (L213)

INTERVIEW, 4 MOVES
  1 contract "propose vs execute — the system owns the checks"
  2 schema   "teaches the model when (L144)"
  3 boundary "validate, scope, gate, sandbox (L315, L208, L212)"
  4 result   "vetted — untrusted in, vetted in context (L316)"
```

## 18. Key Takeaways

> [!RECAP]
> - Tool calling is **the contract** (L201): the model proposes calls against schemas, the system validates, gates, and executes — the model never runs tools itself (L212)
> - **The schema teaches** (L144): name, parameters, and a description that says when to call — precise schemas produce precise calls (L143)
> - The execution boundary checks **validity, authority, risk, and sandbox** (L143, L315, L208, L212) — the least-privilege discipline applied to the loop
> - **Results are vetted** (L212, L316) — shape, size, and content — because the tool result is the model's window onto the world and its injection surface (L309)
> - **The failure modes are designed** (L211): malformed (re-ask), refused (log), failed (error as result), poisoned (vetted at the boundary)
> - Every call lands in the **trace** (L213) — the tool layer is the module's hub (L216), feeding the evals (L343) and the audit (L322)

## Check your understanding

Answer these without looking back.

1. What's the tool contract (L201)?
2. Why does the schema need to teach (L144)?
3. What does the execution boundary check (L315)?
4. Why are results vetted (L212)?
5. What are the four tool failure modes (L211)?
6. How do approval gates work (L208)?
7. Why is the result the injection surface (L316)?
8. What lands in the trace (L213)?

## A Closing Note — The Hands, Made Safe

You now hold the contract that gives the loop its hands: **schemas that teach, an execution boundary that checks, results that are vetted, and failures that are designed.** The tool layer is where the agent's power and its attack surface live — and the boundary is what keeps them separate.

Next: how the loop decides — planning (L202), ReAct and plan-and-execute.
