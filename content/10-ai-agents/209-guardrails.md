# Lesson 209 — Guardrails for Agents

**Interview importance:** ⭐⭐⭐⭐ — "how do you keep an agent on track?" — the answer is *guardrails*: input, tool, and output rails — before, during, and after the loop (L208, L212, L211).**

L208 gave you the human gates; this lesson is the **rails around the whole loop**: guardrails for agents — the input, tool, and output checks that keep the loop on track. Three layers: **input rails** (what enters the loop — validated, sanitized, L315), **tool rails** (what the loop may do — scoped, gated, L212, L208), and **output rails** (what the loop returns — verified, grounded, L343, L337). The timing: **before** (input), **during** (tool), **after** (output) — the loop is wrapped in checks at every boundary (L200).

The distinction this lesson is built on: a **demo** has a prompt that says "be careful". A **solutions architect** designs the rails: the input schema (L143), the tool authority (L212), the output verification (L343) — and the guardrail policy (L209) that decides what each rail checks, measured on the golden set (L341).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the three rails: input, tool, output (L209)
- Design the input rails: validation, sanitization (L143, L315)
- Design the tool rails: scope, gates, and the authority boundary (L212, L208)
- Design the output rails: verification, groundedness (L343, L337)
- Explain the timing: before, during, after — and the guardrail policy (L209)

## 1. One-Line Definition

**Guardrails for agents are the rails around the loop — input rails (what enters, validated and sanitized, L143, L315), tool rails (what the loop may do, scoped and gated, L212, L208), and output rails (what the loop returns, verified and grounded, L343, L337) — applied before, during, and after the loop, so the agent is checked at every boundary of the L200 diagram (L209).**

The one-sentence interview answer: *"Guardrails are the rails around the loop — checked at every boundary (L209). Input rails — before: what enters the loop is validated against a schema (L143) and sanitized (L315) — the user's message and the tool results (L212) are untrusted until checked (L316). Tool rails — during: what the loop may do is scoped and gated (L212) — the tool surface (L204), the allowed actions (L315), and the approval gates for consequential ones (L208). Output rails — after: what the loop returns is verified — groundedness against the evidence (L337), completion against the task (L343). The guardrail policy decides what each rail checks, tuned per task (L209) and measured on the golden set (L341). A demo has a prompt that says 'be careful'; production has rails at the three boundaries (L216)."*

## 2. Mental Model

Think of the guardrails as **a building's three sets of doors.** The front door (input rails) checks who and what comes in — ID and bag check (validation, L143, sanitization, L315). The internal doors (tool rails) check what you may do inside — room access by badge (scope, L212), and some rooms need a manager (approval gates, L208). The exit doors (output rails) check what you carry out — the goods are verified (groundedness, L337, completion, L343). The building works because every boundary is a check — and the guardrail policy (L209) decides what each door checks (L341).

```text
   the front door (input, L143)   the internal doors (tool, L212)   the exit (output, L343)
   ┌──────────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
   │ what ENTERS:         │       │ what the loop MAY DO:  │       │ what the loop RETURNS:│
   │ schema (L143)        │       │ scoped tools (L204)    │       │ grounded (L337)       │
   │ sanitized (L315)     │       │ gated actions (L208)   │       │ complete (L343)       │
   │ untrusted until      │       │ least privilege (L212) │       │ verified before ship  │
   │ checked (L316)       │       │                        │       │ (L341)                │
   └──────────────────────┘       └────────────────────────┘       └──────────────────────┘
        BEFORE (L209)                 DURING (L209)                    AFTER (L209)
```

The mental model is **the three doors**: every boundary of the loop is a check — input, tool, output — and the policy (L209) decides what each door looks for (L341).

## 3. Visual Flow — The Rails Around the Loop

```text
   a task arrives (L209)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ INPUT RAILS — BEFORE (L143, L315)                        │
   │  schema-validate the request (L143)                      │
   │  sanitize — prompt injection scan (L309, L316)           │
   │  reject or clean → the loop never sees bad input         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ THE LOOP (L200) with TOOL RAILS — DURING (L212, L208)    │
   │  scoped tools (L204) · allowed actions (L315)            │
   │  approval gates for consequential (L208)                 │
   │  loop-safety: repetition, stalling, divergence (L211)    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ OUTPUT RAILS — AFTER (L343, L337)                        │
   │  groundedness vs the evidence (L337)                     │
   │  completion vs the task (L343)                           │
   │  refuse or revise before the user sees it (L341)         │
   └──────────────────────────────────────────────────────────┘
```

The flow is the rails: **before (input), during (tool), after (output)** — the loop is wrapped at every boundary of the L200 diagram (L209).

## 4. How It Works — The Three Rails and the Policy

- **Input rails (L143, L315).** What enters: the request is schema-validated (L143), sanitized (L315), and scanned for injection (L309) — the tool results are treated as untrusted (L316). Bad input never reaches the loop (L209).
- **Tool rails (L212, L208).** What the loop may do: the tool surface is scoped (L204), the actions are allowed-checked (L315), the consequential ones are approval-gated (L208), and the loop-safety detectors (L211) stop the pathological loops (L205).
- **Output rails (L343, L337).** What the loop returns: the answer is verified — groundedness against the evidence (L337), completion against the task (L343) — before the user sees it (L341).
- **The policy (L209).** What each rail checks, and how strictly — tuned per task (a low-risk task has light rails; a finance task has heavy ones, L212) and measured on the golden set (L341). The policy is the guardrails' design (L209).

> [!NOTE]
> **The rails are the production difference — and the golden set is their tuning dial (L209, L341).** A prompt that says "be careful" is not a guardrail (L209); the rails are *enforced checks at the boundaries* (L143, L212, L343). And the strictness is a measured decision: too light, failures ship (L211); too heavy, the loop's cost and latency balloon (L150, L151). The golden set (L343) scores the rails — which checks catch which failures (L196) — and the policy (L209) is tuned with the numbers (L341).

## 5. Real Project Usage

- **Finance agents.** Input: the transfer request schema-validated (L143). Tool: transfers approval-gated (L208). Output: the confirmation verified (L343).
- **Support agents.** Input: the ticket sanitized (L315). Tool: refunds gated (L208). Output: the reply checked for groundedness (L337).
- **Research agents.** Input: the query sanitized (L309). Tool: read-only search (L315). Output: the synthesis verified against the sources (L337).
- **Publishing agents.** Input: the brief validated (L143). Tool: publish gated (L208). Output: the copy checked for policy (L343).
- **Anything production (L216).** The three rails are the L209 boundary checks — every agent gets them, tuned per task (L341).

The through-line: **the rails make the loop safe enough to run unattended** — input, tool, and output checks at the boundaries, tuned by the policy (L209).

## 6. Interview Explanation

Say it in four moves:

1. **The three rails.** "Input — what enters (L143, L315). Tool — what it may do (L212, L208). Output — what it returns (L343, L337)."
2. **The timing.** "Before, during, and after — every boundary of the loop is checked (L209)."
3. **The mechanics.** "Schema + sanitize in; scope + gate during; verify out (L143, L315, L212, L343)."
4. **The policy.** "What each rail checks is tuned per task (L209) and measured on the golden set (L341)."

## 7. Senior-Level Insights

- **The rails are the L200 boundaries, enforced (L209).** The senior answer maps the rails onto the architecture: input rails at the entry (L172), tool rails at the authority boundary (L212), output rails at the exit (L343) — the diagram is the guardrail map (L216).
- **Input includes the tool results (L212, L316).** The loop's own inputs — tool outputs (L201) — are untrusted (L316): the input rail scans them like user input (L309). The senior design doesn't trust the loop's internal data (L212).
- **The tool rails compose with HITL (L208).** Scope (L315) is the base; approval gates (L208) are the escalation — the tool rail is the L212 authority with the human at the consequential threshold (L324).
- **The output rails compose with the evals (L343).** Groundedness (L337) and completion (L343) are eval checks run per output (L195) — the guardrail is the eval applied at runtime (L341).
- **The policy is measured, not guessed (L341).** Which checks, how strict — the golden set (L343) shows what each rail catches (L196), and the policy (L209) is tuned with data (L341).

## 8. Common Mistakes

- **"Be careful" as a guardrail (L209).** An instruction, not a check — the rails are enforced at the boundaries (L143, L212, L343).
- **Only tool rails (L212).** Scope and gates, but no input validation (L143) or output verification (L337) — the loop's edges unguarded (L209).
- **Trusting the loop's inputs (L316).** Tool results treated as safe (L212) — the poisoned-result injection (L309, L316).
- **Rails so heavy the loop crawls (L151).** Every check a model call (L150) — the policy's strictness is a cost decision (L209).
- **Rails never measured (L341).** The checks added, the failures they catch never scored (L343) — the policy tuned by guesswork (L209).
- **Outputs shipped unverified (L343).** The answer to the user without groundedness (L337) or completion (L343) — the quality boundary missing (L196).

## 9. Best Practices

- **Wrap all three boundaries** (L209) — input (L143), tool (L212), output (L343).
- **Treat tool results as untrusted** (L316) — the input rail scans them (L309).
- **Scope + gate the tools** (L315, L208) — the L212 authority boundary (L212).
- **Verify the outputs** (L337, L343) — grounded and complete before the user (L341).
- **Tune the policy per task** (L209) — light for low-risk, heavy for consequential (L212).
- **Measure the rails** (L341) — the golden set scores what each rail catches (L343).

## 10. Interview Questions

**Q: What are guardrails for agents?**
> A: The rails at the loop's three boundaries (L209). Input rails — before: schema-validate (L143) and sanitize (L315) what enters, including tool results (L316). Tool rails — during: scope the tools (L204), check the allowed actions (L315), gate the consequential ones (L208). Output rails — after: verify the answer — groundedness (L337) and completion (L343) — before the user sees it. The policy (L209) tunes what each rail checks.

**Q: What's the difference between a guardrail and a prompt instruction?**
> A: Enforcement (L209). A prompt says "be careful" — the model may ignore it (L141). A guardrail is a check at the boundary: the schema rejects bad input before the loop sees it (L143), the authority denies a tool call before it runs (L315), the verification refuses an ungrounded answer before it ships (L337). Instructions ask; rails enforce (L209).

**Q: Why are tool results part of the input rail?**
> A: Because the loop's own inputs are untrusted (L316). A tool result — a page, an API reply — can carry prompt injection (L309) that steers the loop (L212). So the input rail treats tool results like user input: sanitized and scanned before they join the context (L316). The loop's internal data is not assumed safe (L209).

**Q: How do you tune the rails?**
> A: The guardrail policy, per task (L209). A low-risk task — research — has light rails: input sanitization (L315), read-only tools (L204). A finance task has heavy rails: schema validation (L143), approval gates (L208), grounded output (L337). The strictness is a cost decision (L150, L151) — and it's measured: the golden set (L343) shows what each rail catches, and the policy is tuned with the numbers (L341).

## 11. Follow-Up Questions

- How do the rails map to the L200 boundaries (L216)?
- What does the input rail scan for (L309)?
- How do the tool rails compose with HITL (L208)?
- How do the output rails reuse the evals (L343)?
- How do you measure the rail policy (L341)?

## 12. Comparison Table — Instruction vs Rails

| | "Be careful" (L209) | Rails (this lesson) |
|---|---|---|
| Input (L143) | hope | schema + sanitize (L315) |
| Tool (L212) | hope | scope + gate (L208) |
| Output (L337) | hope | grounded + complete (L343) |
| Enforcement | the model's mood (L141) | boundary checks |
| Measurement (L341) | none | the golden set scores each rail (L343) |

The senior read: **the right column is the production difference** — instructions ask, rails enforce (L209).

## 13. Code Example — The Rails

```js
// Guardrails: input, tool, and output rails (L209).
// INPUT RAIL — before: validate + sanitize what enters (L143, L315, L309).
function inputRail(request) {
  const parsed = TaskSchema.parse(request);             // L143 — the schema
  if (scanForInjection(parsed.prompt)) return reject('injection detected');  // L309
  return parsed;                                        // the loop never sees bad input (L209)
}

// TOOL RAIL — during: scope + gate what the loop may do (L212, L315, L208).
async function toolRail(call, ctx) {
  if (!ctx.allowedTools.has(call.name)) return deny('tool not allowed');    // L315
  if (RISK.gated.has(call.name)) {
    const decision = await humanApprove(call, ctx.reasoning);               // L208
    if (decision.kind === 'deny') return deny('denied by human');
  }
  return execute(call, ctx);                            // under the scoped identity (L212)
}

// OUTPUT RAIL — after: verify before the user sees it (L343, L337).
async function outputRail(answer, evidence) {
  const grounded = await checkGroundedness(answer, evidence);   // L337
  const complete = await completionCheck(task, answer);         // L343
  return grounded.ok && complete.ok
    ? answer                                                  // verified (L341)
    : refuseWith({ grounded, complete });                      // revise or refuse (L209)
}

// The loop is wrapped: in, during, out (L200, L209).
const task = inputRail(request);                    // BEFORE (L143)
const answer = await runLoop(task, { toolRail });   // DURING (L200, L212)
return outputRail(answer, evidence);                // AFTER (L337, L343)
```

```text
What the reader must SEE — the three rails around the loop:

  inputRail()   schema + injection scan — BEFORE (L143, L309)
  toolRail()    scope + approval gates — DURING (L315, L208)
  outputRail()  grounded + complete — AFTER (L337, L343)

  Instructions ask. Rails enforce — at every boundary.
```

```narrate
3-7: The input rail — the schema rejects malformed requests (L143), the scan rejects injection (L309) before the loop runs (L209).
9-15: The tool rail — the allowed list (L315) and the approval gates (L208) govern every action the loop proposes (L212).
17-23: The output rail — groundedness (L337) and completion (L343) verify the answer before the user sees it (L341).
25-27: The loop is wrapped — the rails are the boundaries of the L200 diagram (L209, L216).
```

> [!TIP]
> The three lines that make it production: **`TaskSchema.parse(request)`** (input, L143), **`ctx.allowedTools.has(call.name)`** (tool, L315), and **`checkGroundedness(answer, evidence)`** (output, L337). **The rails are checks at the boundaries — a prompt that says "be careful" is none of the three (L209).**

## 14. Performance Notes

- **The rails are on the path (L151).** Input checks are fast (L143); output verification is a model call (L337) — the heavy rail is sized and cached (L171), and the policy (L209) trades strictness against TTFT (L145).
- **The tool rail is nearly free (L151).** Allowed-list checks (L315) and gates (L208) are microseconds; the approval wait is the human's time (L208).
- **The output rail is the eval cost (L150).** Groundedness (L337) and completion (L343) are model calls per output — the golden set (L341) sizes them, and the cache (L171) amortizes repeats.
- **The policy is the cost dial (L209).** Heavy rails on a low-risk task are pure cost (L150) — the strictness is tuned per task (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Bad input reaches the loop | No input rail (L143) | Schema + sanitize (L315) |
| The loop does too much | No tool rail (L212) | Scope + gate (L315, L208) |
| Ungrounded answers ship | No output rail (L337) | Verify before the user (L343) |
| The loop steered by a result | Tool results untrusted (L316) | Scan them in the input rail (L309) |
| The loop is slow | Rails too heavy (L151) | Tune the policy per task (L209) |

## 16. Quick Revision Notes

- Guardrails = **the three rails** (L209): input, tool, output.
- Input — **before**: schema (L143) + sanitize (L315), tool results included (L316).
- Tool — **during**: scope (L204), gates (L208), the authority boundary (L212).
- Output — **after**: grounded (L337), complete (L343).
- The policy (L209) tunes strictness per task, measured (L341).
- Instructions ask; **rails enforce** (L209).

## 17. Cheat Sheet

```text
GUARDRAILS = the rails at the loop's three boundaries

THE THREE RAILS (L209)
  input   BEFORE — what enters (L143)
          schema-validate (L143) · sanitize (L315)
          scan for injection (L309) — tool results included (L316)
  tool    DURING — what the loop may do (L212)
          scoped tools (L204) · allowed actions (L315)
          approval gates for consequential (L208)
          loop-safety detectors (L211)
  output  AFTER — what the loop returns (L343)
          groundedness vs the evidence (L337)
          completion vs the task (L343)
          verified before the user sees it (L341)

THE POLICY (L209)
  what each rail checks, and how strictly — per task
  light for low-risk · heavy for consequential (L212)
  measured on the golden set (L341, L343)

THE RULE
  instructions ask — rails enforce (L209)
  a "be careful" prompt is not a guardrail (L141)

INTERVIEW, 4 MOVES
  1 rails    "input, tool, output (L209)"
  2 timing   "before, during, after — every boundary"
  3 mechanics "schema + sanitize · scope + gate · verify (L143, L212, L343)"
  4 policy   "tuned per task, measured (L341)"
```

## 18. Key Takeaways

> [!RECAP]
> - Guardrails are **the rails at the loop's three boundaries** (L209): input (before), tool (during), output (after)
> - **Input rails** (L143, L315): schema-validate and sanitize what enters — *including tool results* (L316), which are untrusted (L309)
> - **Tool rails** (L212, L208): scope the tools (L204), check the allowed actions (L315), gate the consequential ones (L208) — the authority boundary
> - **Output rails** (L343, L337): verify groundedness against the evidence (L337) and completion against the task (L343) before the user sees it (L341)
> - **The policy** (L209) tunes strictness per task — light for low-risk, heavy for consequential (L212) — measured on the golden set (L341)
> - **Instructions ask; rails enforce** (L209) — a "be careful" prompt is not a guardrail (L141); the checks at the boundaries are (L216)

## Check your understanding

Answer these without looking back.

1. What are the three rails (L209)?
2. What does the input rail check (L143)?
3. Why are tool results part of the input rail (L316)?
4. What do the tool rails enforce (L212)?
5. What do the output rails verify (L343)?
6. How do you tune the policy (L209)?
7. Why is "be careful" not a guardrail (L141)?
8. How do the rails map to the L200 diagram (L216)?

## A Closing Note — The Doors That Make the Loop Safe

You now hold the rails: **the input door that checks what enters, the tool doors that scope what the loop may do, and the exit door that verifies what it returns — tuned by a policy, measured on the golden set.** The loop is now wrapped at every boundary — safe enough to run, accountable enough to trust.

Next: when one loop isn't enough — multi-agent systems (L210), specialists with a coordinator.
