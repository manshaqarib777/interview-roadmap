# Lesson 212 — Agent Security

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you secure an agent?" — the answer is the *attack surface of a loop with tools*: prompt injection, excessive agency, secrets, and the authority boundary (L200, L315) — the L212 defense-in-depth.**

L209's rails and L211's taxonomy set this up; this lesson is the **security of the whole loop**: agent security — the attack surface of a loop with tools. Three families: **prompt injection** (the loop's inputs — user text, tool results, documents — steering the model, L309, L316), **excessive agency** (the loop doing more than the task allows — the authority boundary, L315, L208), and **secrets** (the loop's credentials — where they live, how they're scoped, L275). The defense is the L200 authority boundary plus the rails (L209): the model proposes, the system executes under policy (L201), and the loop's data is untrusted until vetted (L316).

The distinction this lesson is built on: a **demo** exposes the API key to the model. A **solutions architect** threat-models the loop: the inputs (L309, L316), the tools (L315), the secrets (L275), the identity (L212) — and designs the authority boundary (L200) as the enforcement point, with the OWASP LLM Top 10 (L308) as the map (L326).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the agent's attack surface: inputs, tools, secrets, identity (L212)
- Explain prompt injection in the loop: user text, tool results, documents (L309, L316)
- Explain excessive agency: the authority boundary and least privilege (L315, L208)
- Explain secret handling: server-side, scoped, rotated (L275)
- Design the defense: the authority boundary, the rails, the threat model (L209, L308)

## 1. One-Line Definition

**Agent security is the defense of a loop with tools — prompt injection (the loop's inputs steering the model: user text, tool results, documents, L309, L316), excessive agency (the loop doing more than the task allows, L315, L208), and secrets (the loop's credentials, server-side and scoped, L275) — enforced at the authority boundary of the L200 diagram (L200), where the model proposes and the system executes under policy (L201).**

The one-sentence interview answer: *"Agent security is the attack surface of a loop with tools (L212). Three families. Prompt injection — the loop's inputs steer the model: a user message, a tool result, a retrieved document can all carry instructions the model follows (L309, L316); the defense is treating every input as untrusted — vetted at the boundary (L316). Excessive agency — the loop does more than the task allows: un-scoped tools, un-gated actions (L315); the defense is the authority boundary (L200): the model proposes, the system executes under least privilege (L201), and consequential actions are human-gated (L208). Secrets — the loop's credentials: they live server-side (L275), scoped per tool (L315), and never reach the model's context (L212). The threat model is the OWASP LLM Top 10 map (L308) — and the authority boundary is where the defense lives (L216)."*

## 2. Mental Model

Think of the agent as **a courier with a master key — and the security is the rules around the key.** The courier (the model) carries messages (the loop's work), but three dangers exist. The first: anyone can slip a note into the courier's bag telling them to take a different route — prompt injection (L309): the note looks like cargo (tool results, L316) but is really an instruction. The second: the courier's key opens every door — excessive agency (L315): the courier should only open the doors the job needs (L212). The third: the key itself — secrets (L275): it's kept in the safe (server-side, L275), never in the courier's pocket (the model's context, L212). The rules — the bag is checked at the door (L316), the key is scoped (L315), and the safe is the only place the master lives (L275).

```text
   the courier (model, L200)          the three dangers (L212)
   ┌────────────────────────┐         ┌────────────────────────────────┐
   │ carries the loop's     │         │ injection — notes in the bag    │
   │ messages and proposes  │  ────►  │   (user, results, docs — L316)  │
   │ tool calls (L201)      │         │ agency — the key opens every    │
   │                        │         │   door (un-scoped, L315)        │
   │ the SYSTEM holds the   │         │ secrets — the master key in the │
   │ key (L275)             │         │   courier's pocket (L212)       │
   └────────────────────────┘         └────────────────────────────────┘
```

The mental model is **courier + key + rules**: the bag is checked (L316), the key is scoped (L315), and the master key stays in the safe (L275).

## 3. Visual Flow — The Threat-Modeled Loop

```text
   ┌──────────────────────────────────────────────────────────────────┐
   │ INPUTS — untrusted (L309, L316)                                  │
   │  user text · tool results · retrieved documents                  │
   │  each vetted at the boundary: schema (L143), injection scan      │
   │  (L309), size and shape (L316) — before the context (L164)       │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │ THE AUTHORITY BOUNDARY (L200, L212) — where the defense lives    │
   │  the model PROPOSES (L201)                                       │
   │  the system checks: allowed list (L315) · scope (L204)           │
   │  gates (L208) · sandbox (L212)                                   │
   │  the system EXECUTES under the scoped identity (L315)            │
   └──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │ SECRETS — server-side only (L275)                                │
   │  credentials in the secrets manager (L275), injected at          │
   │  execution, NEVER in the model's context (L212)                  │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the threat model: **vetted inputs in, the authority boundary in the middle, secrets server-side** — the loop's three security surfaces (L212).

## 4. How It Works — The Three Families and the Boundary

- **Prompt injection (L309, L316).** The loop's inputs are untrusted: the user's message (L309), the tool results (L316), and the retrieved documents (L316) can all carry instructions the model follows (L141). The defense: vet at the boundary — schema (L143), injection scanning (L309), and treating tool output as data, never instructions (L316).
- **Excessive agency (L315).** The loop can propose anything; the authority boundary decides what executes (L201). The defense: least privilege (L315) — a scoped tool surface (L204), per-session authority (L212), approval gates for the consequential (L208), and a sandboxed identity (L212).
- **Secrets (L275).** The loop's credentials — provider keys (L275), tool credentials — live server-side (L275), scoped per tool (L315), rotated (L275), and never placed in the model's context (L212). The model proposes; the system holds the key (L201).
- **The boundary (L200, L212).** The enforcement point is the authority boundary of the L200 diagram: the model proposes tool calls (L201), the system validates, scopes, gates, and executes (L315, L208) — with the rails (L209) as the boundary's checks.

> [!NOTE]
> **The agent's data is not the agent's truth (L212, L316).** The model reads tool results and documents as its window onto the world (L164) — and that's exactly what injection exploits (L309): a poisoned document (L316) or a malicious API reply steers the loop (L212). The senior defense treats *everything the loop reads* as untrusted input (L316) — vetted at the boundary like user input (L309). The loop's power — reading the world — is its injection surface; the vetting is what keeps the window honest (L212).

## 5. Real Project Usage

- **Research agents.** Inputs: search results and pages vetted for injection (L316); read-only tools (L315). Secrets: the search API key server-side (L275).
- **Support agents.** Inputs: the ticket sanitized (L309). Authority: account reads free, refunds gated (L208). Secrets: the CRM credentials scoped per tool (L315).
- **Coding agents.** Inputs: repo files vetted (L316). Authority: edits scoped to the repo, no prod credentials (L212). Secrets: the CI tokens never in context (L275).
- **Finance agents.** Authority: transfers gated + sandboxed (L208, L212). Secrets: the payments key in the secrets manager (L275).
- **Anything with tools (L216).** The three families are the threat model — and the OWASP LLM Top 10 (L308) is the map (L326).

The through-line: **the loop's power is its attack surface** — the inputs, the tools, and the secrets are the three families, and the authority boundary is the defense (L212).

## 6. Interview Explanation

Say it in four moves:

1. **The three families.** "Injection — the inputs steer the model (L309, L316). Agency — the loop exceeds its authority (L315). Secrets — the credentials (L275)."
2. **The boundary.** "The model proposes; the system executes under policy (L201) — validation, scope, gates, sandbox (L315, L208)."
3. **The untrusted data.** "Everything the loop reads is vetted (L316) — tool results are data, never instructions (L309)."
4. **The secrets.** "Server-side, scoped, rotated (L275) — never in the model's context (L212)."

## 7. Senior-Level Insights

- **The authority boundary is the security posture (L200, L212).** The senior answer places the defense at the boundary: the model proposes (L201), the system executes under least privilege (L315) — the L212 posture *is* the L200 architecture (L216).
- **Injection is a data-trust problem (L316).** The senior defense treats tool output and documents as untrusted data (L316) — vetted like user input (L309). The L309–L311 module (L308) is the injection playbook (L326).
- **Agency is a scope problem (L315).** Least privilege per session (L315), approval gates at the consequence threshold (L208) — the excessive-agency failure (L211) is prevented by design, not by hope (L212).
- **Secrets are a lifecycle (L275).** Issued, scoped, rotated, revoked (L275) — the secrets manager (L275) and the never-in-context rule (L212) are the baseline (L321).
- **The threat model is the map (L308).** OWASP LLM Top 10 (L308) — injection (L309), excessive agency (L314), unsafe tools (L315), data leakage (L312) — the L212 lesson is the agent's slice of the L308 map (L326).

## 8. Common Mistakes

- **The key in the context (L212).** The provider key visible to the model (L275) — a leaked secret and a prompt target (L309).
- **Un-scoped tools (L315).** The full tool surface per session (L204) — the excessive-agency failure (L212).
- **Tool results trusted raw (L316).** A poisoned document steering the loop (L309) — the input vetting skipped (L212).
- **No gates (L208).** Consequential actions execute unchecked (L315) — the L212 boundary missing (L212).
- **Secrets unrotated (L275).** The credential lives for years (L275) — the longer it lives, the more it leaks (L321).
- **No threat model (L308).** The attack surface unexamined (L326) — the defense built reactively (L212).

## 9. Best Practices

- **Threat-model the loop** (L308) — inputs, tools, secrets, identity (L212).
- **Vet every input** (L316) — user text, tool results, documents (L309).
- **Enforce the authority boundary** (L201, L315) — the system executes under least privilege (L212).
- **Gate the consequential** (L208) — approval at the risk threshold (L315).
- **Keep secrets server-side** (L275) — scoped, rotated, never in context (L212).
- **Apply the OWASP map** (L326) — injection (L309), agency (L314), tools (L315), data (L312).

## 10. Interview Questions

**Q: How do you secure an agent?**
> A: Threat-model the loop (L212). Three families. Injection — the inputs: user text, tool results, documents can all steer the model (L309, L316), so everything the loop reads is vetted at the boundary (L316). Excessive agency — the loop exceeds its authority (L315): the model proposes, the system executes under least privilege (L201), with gates for the consequential (L208). Secrets — server-side (L275), scoped, rotated, never in the model's context (L212).

**Q: What's the biggest agent-specific risk?**
> A: Prompt injection via tool results (L316). The model reads tool output as its window onto the world (L164) — a poisoned document or a malicious API reply carries instructions the model follows (L309). Unlike a chatbot, the agent *acts* on those instructions (L201). The defense: treat all tool output as untrusted data (L316), vetted like user input (L309), with the authority boundary as the second line (L315).

**Q: How do you prevent excessive agency?**
> A: Least privilege at the authority boundary (L315). The tool surface is scoped per session (L204), the tools are allowed-checked (L315), the consequential actions are human-gated (L208), and execution runs under a sandboxed identity (L212). The model proposes anything its training allows; the system executes only what the policy allows (L201). Agency is a scope problem — solved by scope (L212).

**Q: Where do the agent's secrets live?**
> A: Server-side, in the secrets manager (L275). The credentials — provider keys, tool tokens — are injected at execution time (L201), scoped per tool (L315), and rotated on a lifecycle (L275). They never appear in the model's context (L212) — a key the model can read is a key the model can leak (L312) and an injection target (L309).

## 11. Follow-Up Questions

- How does injection arrive through tool results (L316)?
- What does the authority boundary enforce (L315)?
- How do you scope a credential per tool (L275)?
- How does the OWASP map apply to agents (L326)?
- How does HITL compose with security (L208)?

## 12. Comparison Table — Chatbot vs Agent Security

| | Chatbot (L172) | Agent (this lesson) |
|---|---|---|
| Inputs (L316) | user text | user + tool results + documents (L309) |
| Actions (L315) | none | tools — scoped, gated (L201) |
| Risk (L212) | hallucination | injection → ACTION (L316) |
| Secrets (L275) | one provider key | many scoped credentials (L315) |
| Boundary (L200) | the gateway (L172) | the authority boundary (L212) |

The senior read: **the agent's risk is injection-with-action** — the loop reads the world and acts on it, so the defense is the vetted input plus the authority boundary (L212).

## 13. Code Example — The Secured Loop

```js
// Agent security: vetted inputs, the authority boundary, server-side secrets (L212).
// INPUT VETTING — tool results are untrusted data (L316, L309).
function vetResult(result) {
  if (scanForInjection(result.content)) return { ok: false, reason: 'injection' };  // L309
  if (result.content.length > MAX_TOKENS) return { ok: false, reason: 'too large' }; // L316
  return { ok: true, data: result };                    // vetted → the context (L164)
}

// THE AUTHORITY BOUNDARY — propose/execute split (L201, L315).
async function handleToolCall(proposal, ctx) {
  if (!ctx.session.allowed.has(proposal.tool)) return deny('not allowed');    // L315
  if (RISK.gated.has(proposal.tool)) {
    const d = await humanApprove(proposal, ctx.reasoning);                    // L208
    if (d.kind !== 'approve') return deny(d.reason);
  }
  // SECRETS — injected at execution, never in the model's context (L275, L212).
  const creds = await secrets.getScoped(proposal.tool, ctx.session);          // L275
  return execute(proposal, creds, { sandbox: ctx.session.sandbox });          // L212
}

// The loop: inputs vetted before the context, proposals gated before execution (L200, L209).
const vetted = await vetResult(toolResult);              // before the context (L316)
if (!vetted.ok) return reroute(vetted.reason);           // the injection stopped (L309)
messages.push({ role: 'tool', content: vetted.data });   // only vetted data (L164)
```

```text
What the reader must SEE — the three families, defended:

  vetResult()       → injection + size checks on every input (L316, L309)
  allowed + approve → the authority boundary (L315, L208)
  secrets.getScoped → injected at execution, never in context (L275)
  sandbox           → the least-privilege identity (L212)

  Inputs vetted, actions gated, secrets server-side.
```

```narrate
3-7: The input vetting — every tool result is scanned for injection (L309) and sized (L316) before the context (L212).
9-13: The authority boundary — the allowed list (L315) and the human gates (L208) govern every proposal (L201).
15-18: Secrets — scoped credentials injected at execution (L275), under the sandboxed identity (L212).
21-24: The loop — only vetted data reaches the context; the injection stopped at the boundary (L316, L209).
```

> [!TIP]
> The three lines that define agent security: **`scanForInjection(result.content)`** (the vetted input, L316), **`ctx.session.allowed.has(proposal.tool)`** (the scoped authority, L315), and **`secrets.getScoped(...)`** (the server-side credential, L275). **The loop reads vetted data, proposes anything, and executes only what the policy allows with the key it never sees.**

## 14. Performance Notes

- **The vetting is cheap (L151).** Injection scans (L309) and size checks (L316) are fast — the security cost is microseconds per result (L212).
- **The gates are the human's time (L208).** Approval pauses are the latency story (L151) — the threshold (L315) is the friction control (L150).
- **The secrets manager is off the hot path (L275).** Credentials fetched at startup or per-tool (L275), cached (L171) — the lifecycle is an ops event, not a per-request lookup (L212).
- **The sandbox bounds the blast radius (L212).** The scoped identity's limits (L315) are the damage control when a defense fails (L211).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The loop acts on a document | Injection via a result (L316) | Vet inputs; scan (L309) |
| The loop exceeds its task | Un-scoped tools (L315) | Scope per session (L204) |
| A key in the trace | Secret in the context (L212) | Move server-side (L275) |
| Consequential actions unapproved | No gates (L208) | Add the threshold (L315) |
| Breach blast radius large | No sandbox (L212) | Scoped identity (L315) |

## 16. Quick Revision Notes

- Agent security = **injection, agency, secrets** (L212).
- Injection: **the loop's inputs are untrusted** (L316) — vetted like user input (L309).
- Agency: **least privilege at the authority boundary** (L315) — propose/execute split (L201), gates (L208).
- Secrets: **server-side, scoped, rotated** (L275) — never in the context (L212).
- The defense lives at **the L200 authority boundary** (L200, L216).
- The map: **OWASP LLM Top 10** (L308, L326).

## 17. Cheat Sheet

```text
AGENT SECURITY = the attack surface of a loop with tools

THE THREE FAMILIES (L212)
  injection  the loop's inputs steer the model (L309, L316)
             user text · tool results · documents — all untrusted (L316)
  agency     the loop exceeds its authority (L315)
             un-scoped tools · un-gated actions (L204, L208)
  secrets    the loop's credentials (L275)
             server-side (L275) · scoped (L315) · never in context (L212)

THE BOUNDARY (L200, L212)
  the model PROPOSES (L201)
  the system checks: allowed (L315) · scope (L204) · gates (L208)
  the system EXECUTES under the sandboxed identity (L212)

THE DATA RULE (L316)
  everything the loop reads is vetted — results are data,
  never instructions (L309) — the window stays honest (L212)

THE MAP (L308, L326)
  OWASP LLM Top 10: injection (L309), agency (L314),
  unsafe tools (L315), data leakage (L312)

INTERVIEW, 4 MOVES
  1 families "injection, agency, secrets (L212)"
  2 boundary "propose vs execute — least privilege (L315)"
  3 data     "the loop's inputs are untrusted (L316)"
  4 secrets  "server-side, scoped, never in context (L275)"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent security is **the attack surface of a loop with tools** (L212): prompt injection, excessive agency, and secrets
> - **Injection** is the agent-specific risk (L316): the loop reads tool results and documents as truth (L164) and *acts* on them (L201) — so every input is vetted at the boundary (L309)
> - **Excessive agency** is a scope problem (L315): the model proposes, the system executes under least privilege (L201), with approval gates at the consequence threshold (L208)
> - **Secrets** are server-side (L275), scoped per tool (L315), rotated (L275), and never placed in the model's context (L212)
> - The defense lives at **the L200 authority boundary** (L212) — where the propose/execute split (L201) and the rails (L209) enforce the policy
> - The map is **the OWASP LLM Top 10** (L308, L326) — the agent's security is the threat model applied to the loop (L216)

## Check your understanding

Answer these without looking back.

1. What are the three security families (L212)?
2. Why is injection the agent-specific risk (L316)?
3. What does the authority boundary enforce (L315)?
4. Where do the secrets live (L275)?
5. Why is every loop input untrusted (L316)?
6. How do gates compose with security (L208)?
7. What does the sandbox bound (L212)?
8. How does the OWASP map apply (L308)?

## A Closing Note — The Loop, Made Defensible

You now hold the security posture: **the vetted inputs, the authority boundary where the model proposes and the system disposes, and the secrets that never leave the safe.** The loop's power — reading the world and acting on it — is now defensible, and its attack surface is mapped (L308).

Next: seeing the loop work — agent observability (L213), the trace of a single run.
