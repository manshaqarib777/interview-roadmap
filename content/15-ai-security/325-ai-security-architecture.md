# Lesson 325 — AI Security Architecture (Defense in Depth)

**Interview importance:** ⭐⭐⭐⭐⭐ — "layers: guardrails, tools, tenant isolation, audit — one stack" — the answer is *the defense in depth*: the layered security of the AI stack (L325).**

L308 mapped the threat model and L323–324 built the tools; this lesson is **the layers stacked**: the AI security architecture — the defense in depth (L325): the layers (the guardrails L281, the tools L323, the tenant isolation L320, the audit L322), the principle (the failure of one layer isn't the breach, L325), and the stack (the one architecture, L325). The AI shape (L173): the L260 backend (L260) — the L325 layers (L325) at every boundary (L325). This lesson is the defense's stack (L325).

The distinction this lesson is built on: a **demo** has one control. A **solutions architect** stacks the layers (L325): the guardrails (L281), the tools (L323), the isolation (L320), and the audit (L322) — because the breach (L308) needs the many failures (L325).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the layers: the guardrails, the tools, the isolation, the audit (L325)
- Explain the principle: the failure of one isn't the breach (L325)
- Explain the stack: the one architecture (L325)
- Explain the placement: at the boundaries (L325)
- Explain the AI shape: the L260 backend, layered (L325)

## 1. One-Line Definition

**The AI security architecture is the defense in depth — the layers, the guardrails, the tools, the tenant isolation, and the audit, one stack (L325) — the layers (the guardrails L281 at the model, the tool boundaries L323 at the actions, the tenant isolation L320 at the data, and the audit L322 at the record, L325), the principle (the failure of one layer isn't the breach: the injection L309 caught by the guardrails L281, the agency L314 bounded by the tools L323, L325), and the stack (the one architecture: the L308 map (L308) with the L325 layers (L325) at every boundary (L325)).**

The one-sentence interview answer: *"The defense in depth stacks the security layers (L325). The layers (L325): the guardrails (L281) — at the model (L278): the inputs and the outputs filtered (L281); the tool boundaries (L323) — at the actions (L315): the schemas (L315), the scoped credentials (L262), the approvals (L324); the tenant isolation (L320) — at the data (L313): the tenant ID everywhere (L320); and the audit (L322) — at the record (L322): the who, the what, the when (L322). The principle (L325): the failure of one layer isn't the breach (L325) — the injection (L309) through the prompt (L312) is caught by the guardrails (L281) or bounded by the tools (L323); the agency (L314) is gated by the approvals (L324); the leak (L312) is limited by the isolation (L320) and recorded by the audit (L322). The stack (L325): the one architecture (L325) — the L308 threat model (L308) mapped (L308), the layers (L325) placed at the boundaries (L325), and the audit (L322) closing the loop (L325). The AI shape (L173): the L260 backend (L260) — the L325 layers (L325): the gateway's auth (L319), the model's guardrails (L281), the tools' boundaries (L323), the data's isolation (L320), and the audit (L322) — the defense in depth (L325)."*

## 2. Mental Model

Think of the defense in depth as **the castle's layered walls.** The castle (the AI app, L173) has the walls (the layers, L325): the outer wall (the gateway's auth, L319) — who enters (L325); the gatehouses (the guardrails, L281) — what's checked (L325); the inner doors (the tool boundaries, L323) — what the servants (the agents, L200) can touch (L325); the vault doors (the tenant isolation, L320) — the tenant's gold (L313) separated (L325); and the ledger (the audit, L322) — every visitor recorded (L325). The siege (the attack, L308) must breach every wall (L325): the outer wall falls (L325) — the gatehouses (L281) still hold (L325); the gatehouses fall (L325) — the inner doors (L323) still hold (L325). The castle works because the walls are many, and the ledger records the siege (L325).

```text
   the castle (the AI app, L173)
   ┌────────────────────────────────────────────────────────┐
   │ the outer wall (the auth, L319) · the gatehouses (the  │
   │ guardrails, L281)                                      │
   │ the inner doors (the tools, L323) · the vault doors    │
   │ (the isolation, L320)                                  │
   │ the ledger (the audit, L322) — every visitor recorded  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the castle**: the walls, the gates, and the ledger (L325).

## 3. Visual Flow — One Attack Through the Layers

```text
   the attack (L308)
        │  the injection (L309), the agency (L314), the leak (L312)
        ▼
   ┌────────────────────── THE OUTER WALL (L319) ───────────────────────┐
   │  the auth (L319) · the rate limits (L318)                         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE GATEHOUSES (L281) ───────────────────────┐
   │  the guardrails (L281): the inputs and the outputs (L281)         │
   │  the injection (L309) → the filter (L281)                         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE INNER DOORS (L323) ──────────────────────┐
   │  the tools (L315): the schemas (L315), the scopes (L262)          │
   │  the approvals (L324) — the agency (L314) bounded (L323)          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE VAULT (L320) ────────────────────────────┐
   │  the isolation (L320) — the tenant's data (L313) bounded (L320)   │
   │  the leak (L312) → the limited (L320)                             │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE LEDGER (L322) ───────────────────────────┐
   │  the audit (L322) — the attack recorded (L322)                    │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the layers: **auth → guardrails → tools → isolation → audit** (L325).

## 4. How It Works — The Stack, Part by Part

- **The guardrails (L281).** At the model (L278): the inputs and the outputs filtered (L281) — the injection (L309) and the jailbreaks (L310) caught (L325).
- **The tool boundaries (L323).** At the actions (L315): the schemas (L315), the scoped credentials (L262), the approvals (L324) — the agency (L314) bounded (L325).
- **The tenant isolation (L320).** At the data (L313): the tenant ID everywhere (L320) — the cross-tenant leak (L312) limited (L325).
- **The audit (L322).** At the record (L322): the who, the what, the when (L322) — the attack (L308) reconstructed (L325).

> [!NOTE]
> **The layers are the L308 map, made real (L325).** The senior answer maps the threat model (L308) to the layers (L325): the injection (L309) → the guardrails (L281); the agency (L314) → the tool boundaries (L323) and the approvals (L324); the leak (L312) → the isolation (L320) and the redaction (L313); the abuse (L317) → the rate limits (L318) and the auth (L319); and everything → the audit (L322). The defense in depth (L325) is the L308 map (L308), layer by layer (L325).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The L325 stack (L325): the auth (L319), the guardrails (L281), the tools (L323), the isolation (L320), and the audit (L322).
- **A RAG platform (L280).** The guardrails (L281), the document vetting (L316), and the per-tenant bases (L320).
- **An agent product (L279).** The tool boundaries (L323), the approvals (L324), and the audit (L322).
- **A regulated workload (L371).** The layers (L325) as the compliance's (L371) evidence (L322).
- **Anything AI (L173).** The defense in depth (L325) — the layers at the boundaries (L325).

The through-line: **the stack is the defense's** — the layers, the principle, and the audit (L325).

## 6. Interview Explanation

Say it in four moves:

1. **The layers.** "The guardrails (L281), the tools (L323), the isolation (L320), the audit (L322)."
2. **The principle.** "The failure of one isn't the breach (L325)."
3. **The placement.** "At the boundaries — the model, the actions, the data (L325)."
4. **The stack.** "The L308 map, made real (L325)."

## 7. Senior-Level Insights

- **The many walls are the principle (L325).** The breach (L308) needs the many failures (L325) — the injection (L309) through one wall (L325) is caught by the next (L325).
- **The placement is the boundary's (L325).** The guardrails (L281) at the model (L278), the tools (L323) at the actions (L315), the isolation (L320) at the data (L313) — each layer (L325) at its boundary (L325).
- **The audit is the loop's close (L322).** The record (L322) — the attack (L308) reconstructed (L322), the controls (L325) improved (L325).
- **The least privilege is the thread (L314).** The auth (L319), the tools (L323), and the isolation (L320) — the L314 least privilege (L314) threaded through (L325).
- **The compliance is the stack's evidence (L371).** The layers (L325) documented (L371) — the SOC 2 (L371) and the GDPR (L371) read the stack (L325).

## 8. Common Mistakes

- **The single control (L325).** The one layer (L325) — the breach (L308) of it is the breach (L325) — the depth (L325) is the point (L325).
- **The layers unplaced (L325).** The guardrails (L281) without the tools (L323) — the boundaries (L325) uncovered (L325).
- **The isolation skipped (L320).** The shared data (L320) — the leak (L312) crosses (L320) — the vault doors (L320) are the layer (L325).
- **The audit bolted on (L322).** The record (L322) after the launch (L307) — the loop (L325) unclosed (L325).
- **The stack un-reviewed (L325).** The layers (L325) never tested (L341) — the gaps (L325) unknown (L325).

## 9. Best Practices

- **Stack the layers** (L325) — the guardrails (L281), the tools (L323), the isolation (L320), the audit (L322).
- **Place at the boundaries** (L325) — the model (L278), the actions (L315), the data (L313).
- **Thread the least privilege** (L314) — through every layer (L325).
- **Test the layers** (L341) — the adversarial set (L342) against the stack (L325).
- **Close the loop** (L322) — the audit (L322) into the controls (L325).

## 10. Interview Questions

**Q: Walk me through the defense in depth.**
> A: The layers stacked (L325). The guardrails (L281) — at the model (L278). The tool boundaries (L323) — at the actions (L315). The tenant isolation (L320) — at the data (L313). And the audit (L322) — at the record (L322). The principle — the failure of one isn't the breach (L325).

**Q: Why the many layers?**
> A: The breach needs the many failures (L325): the injection (L309) through the prompt (L312) is caught by the guardrails (L281); if it reaches the tools (L315), the scopes (L262) and the approvals (L324) bound it; if the data (L313) is reached, the isolation (L320) limits it; and the audit (L322) records it (L325). The single control (L325) is the single point of failure (L325).

**Q: How do the layers map to the threat model?**
> A: Risk by risk (L325): the injection (L309) → the guardrails (L281); the agency (L314) → the tool boundaries (L323) and the approvals (L324); the leak (L312) → the isolation (L320) and the redaction (L313); the abuse (L317) → the rate limits (L318) and the auth (L319); and everything → the audit (L322). The defense in depth (L325) is the L308 map (L308), layer by layer (L325).

**Q: What's the audit's role in the stack?**
> A: The loop's close (L322): the record (L322) of the who, the what, the when (L322) — the attack (L308) reconstructed (L322), the gaps (L325) found (L322), and the layers (L325) improved (L325). The audit (L322) is the stack's memory (L325).

## 11. Follow-Up Questions

- What are the layers (L325)?
- Why the many layers (L325)?
- How do the layers map to the threat model (L308)?
- What's the audit's role (L322)?
- What's the least privilege thread (L314)?

## 12. Comparison Table — The Single vs the Layered

| | The single control (L325) | The defense in depth (L325) |
|---|---|---|
| The failure (L325) | the breach (L325) | the layer's (L325) |
| The injection (L309) | the filter only (L325) | the guardrails + the tools (L323) |
| The agency (L314) | the prompt only (L325) | the scopes (L262) + the approvals (L324) |
| The leak (L312) | the redaction only (L325) | the isolation (L320) + the audit (L322) |
| The record (L322) | the absent (L325) | the loop's close (L322) |

The senior read: **the right column is the defense** — the many walls and the ledger (L325).

## 13. Code Example — The Stack, Applied

```js
// The defense in depth (L325) — the layers at the boundaries (L325).
// 1 · THE OUTER WALL (L319) — the auth and the limits (L318).
async function gateway(req) {
  const key = await verifyKey(req);              // L319
  if (!key) return error(401);
  const limited = await rateLimit(key);          // L318
  if (!limited.ok) return error(429);
  return route(req, key);
}

// 2 · THE GATEHOUSES (L281) — the guardrails (L281).
async function modelCall(prompt) {
  const checked = await guardrails.apply({ input: prompt });   // L281
  if (!checked.pass) return deny();
  const output = await model.invoke(prompt);
  return guardrails.apply({ output });          // the output filter (L281)
}

// 3 · THE INNER DOORS (L323) — the tool boundaries (L323).
async function toolCall(tool, args, ctx) {
  validateSchema(tool.schema, args);            // L315
  authorize(tool.permission, ctx);              // L314
  if (HIGH_RISK.has(tool.name)) await approval(tool, ctx);   // L324
  return executeScoped(tool, args);             // L323
}

// 4 · THE VAULT (L320) — the tenant's data (L320).
const rows = await db.query('SELECT ... WHERE tenant_id = $1', [ctx.tenant]);

// 5 · THE LEDGER (L322) — the audit (L322).
await audit.log({ who: ctx.user, what: action, at });        // L322
```

```text
What the reader must SEE — the stack, applied:

  verifyKey + rateLimit    → the outer wall (L319, L318)
  guardrails in and out     → the gatehouses (L281)
  schema + scope + approval → the inner doors (L323, L324)
  WHERE tenant_id = $1      → the vault (L320)
  audit.log                 → the ledger (L322)

  The walls many, the breach hard, the record complete (L325).
```

```narrate
4-10: The outer wall — the auth and the rate limits at the gateway (L319, L318).
12-18: The gatehouses — the guardrails on the model's inputs and outputs (L281).
20-26: The inner doors — the tool's schema, scope, and approval (L315, L314, L324).
28-29: The vault — the tenant's data scoped (L320).
31-32: The ledger — the audit recorded (L322).
```

> [!TIP]
> The pair that defines the stack: **the guardrails on the model** (the gatehouse, L281) and **the audit ledger** (the loop's close, L322). **Stack the walls, place them at the boundaries, thread the least privilege, close the loop with the audit — the defense in depth (L325).**

## 14. Performance Notes

- **The layers are the latency's sum (L325).** The auth (L319), the guardrails (L281), and the scopes (L323) — the sub-millisecond (L325) each, the safety (L325) stacked (L325).
- **The audit is the storage's cost (L322).** The records (L322) — the retention (L322) bounded (L325).
- **The isolation is the storage's duplication (L320).** The per-tenant (L320) — the indexes (L183) for the safety (L325).
- **The approvals are the agent's latency (L324).** The high-risk (L324) — the human's (L324) time (L325).

## 15. Debugging Scenarios

| Symptom | First check (L325) | The lever |
|---|---|---|
| The attack reached the data | The layers (L325) | The missing layer (L325) |
| The injection passed | The guardrails (L281) | The filter (L281) |
| The agency acted | The tools (L323) | The scopes (L262), the approvals (L324) |
| The tenants mixed | The isolation (L320) | The tenant ID (L320) |
| The attack is opaque | The audit (L322) | The record (L322) |

## 16. Quick Revision Notes

- The defense in depth = **the layers stacked** (L325): the guardrails, the tools, the isolation, the audit.
- The guardrails: **at the model (L278) — the inputs and the outputs (L281)**.
- The tools: **at the actions (L315) — the schemas, the scopes, the approvals (L323)**.
- The isolation: **at the data (L313) — the tenant ID (L320)**.
- The audit: **at the record (L322) — the loop's close (L325)**.

## 17. Cheat Sheet

```text
AI SECURITY ARCHITECTURE = the defense in depth

THE LAYERS (L325)
  the guardrails (L281) — at the model (L278)
  the tool boundaries (L323) — at the actions (L315)
  the tenant isolation (L320) — at the data (L313)
  the audit (L322) — at the record (L322)

THE PRINCIPLE (L325)
  the failure of one layer isn't the breach (L325)
  the injection (L309) caught by the guardrails (L281)
  the agency (L314) bounded by the tools (L323)
  the leak (L312) limited by the isolation (L320)

THE MAP (L325)
  the L308 threat model (L308), layer by layer (L325)
  the injection → the guardrails (L281)
  the abuse (L317) → the rate limits (L318), the auth (L319)

THE LOOP (L322)
  the audit (L322) — the record (L322) of the attack (L308)
  the gaps (L325) found (L322) · the layers (L325) improved (L325)

INTERVIEW, 4 MOVES
  1 layers    "the guardrails, the tools, the isolation, the audit (L325)"
  2 principle "the failure of one isn't the breach (L325)"
  3 placement "at the boundaries — the model, the actions, the data (L325)"
  4 loop      "the audit closes the loop (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI security architecture is **the defense in depth — the layers, the guardrails, the tools, the tenant isolation, and the audit, one stack** (L325): the layers (L325), the principle (L325), and the stack (L325)
> - **The layers** (L325): the guardrails (L281) at the model (L278); the tool boundaries (L323) at the actions (L315); the tenant isolation (L320) at the data (L313); and the audit (L322) at the record (L322)
> - **The principle** (L325): the failure of one layer isn't the breach (L325) — the injection (L309) caught by the guardrails (L281), the agency (L314) bounded by the tools (L323), the leak (L312) limited by the isolation (L320)
> - **The map** (L325): the defense in depth (L325) is the L308 threat model (L308), layer by layer (L325) — each risk (L308) with its layers (L325)
> - **The loop** (L322): the audit (L322) closes the loop (L325) — the record (L322) of the attack (L308), the gaps (L325) found (L322), and the layers (L325) improved (L325)
> - The AI shape (L325): the L260 backend (L260) — the L325 layers (L325): the gateway's auth (L319), the model's guardrails (L281), the tools' boundaries (L323), the data's isolation (L320), and the audit (L322) — the defense in depth (L325)

## Check your understanding

Answer these without looking back.

1. What are the layers (L325)?
2. Why the many layers (L325)?
3. How do the layers map to the threat model (L308)?
4. What's the audit's role (L322)?
5. What's the least privilege thread (L314)?
6. What's the placement (L325)?
7. What's the loop (L322)?
8. What is the defense in depth (L325)?

## A Closing Note — The Walls, Stacked

You now hold the stack: **the guardrails, the tools, the isolation, and the audit — with the many walls and the ledger.** The castle holds because the walls are many — and the ledger records the siege (L325).

Next: each of the ten risks, its fix, and the sentence for the interview — the OWASP LLM Top 10 Walkthrough (L326).
