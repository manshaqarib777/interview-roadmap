# Lesson 327 — Securing the RAG + Agent Stack (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of AI Security: the full threat model for a RAG agent — every path an attack can take (L327).**

This is the last lesson of the AI Security module — and the synthesis it was built toward. L308–L326 gave you the parts: the threat model (L308), the injection (L309–311), the data (L312–313), the agency (L314–315), the poisoning (L316), the abuse (L317–318), the auth (L319), the isolation (L320), the secrets (L321), the audit (L322), the tools (L323), the approvals (L324), the stack (L325), and the OWASP walkthrough (L326). This lesson **reassembles them into the full threat model for a RAG agent** — every path an attack can take (L327).

The distinction this lesson is built on: a **specialist** knows the risks. A **solutions architect** maps them onto the stack (L327) — and defends each path (L327). That assembly is M26's milestone: the threat model and the OWASP LLM Top 10 closed with the defense in depth (L327).

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L308–L326 into the full RAG-agent threat model
- Draw the attack paths: the prompt, the document, the tool, the data, the abuse
- Explain each path's defense: the guardrails, the tools, the isolation, the audit
- Map the OWASP LLM Top 10 onto the RAG agent (L326)
- Defend the architecture in an interview: the paths, the defenses, the trade-offs (L327)

## 1. One-Line Definition

**Securing the RAG + agent stack is the module's synthesis — the full threat model for a RAG agent (L327): the attack paths (the prompt L309, the document L316, the tool L315, the data L312, the abuse L317), the defenses at each (the guardrails L281, the tool boundaries L323, the tenant isolation L320, the audit L322), and the map (the OWASP LLM Top 10 L326 onto the stack L325) — every path an attack can take, and the defense at each (L327).**

The one-sentence interview answer: *"The RAG agent's threat model is the module in one architecture (L327). The paths (L327): the prompt path (L309) — the direct injection (L309) through the user's input; the document path (L316) — the indirect injection (L311) and the poisoning (L316) through the retrieved text (L189); the tool path (L315) — the unsafe tool calling (L315) and the excessive agency (L314) through the actions (L315); the data path (L312) — the leakage (L312) and the PII (L313) through the responses and the logs (L329); and the abuse path (L317) — the model abuse (L317) through the quota (L149). The defenses (L327): the guardrails (L281) at the model (L278) — the inputs and the outputs (L281); the tool boundaries (L323) — the schemas (L315), the scopes (L262), the approvals (L324); the tenant isolation (L320) — the tenant ID everywhere (L320); the audit (L322) — the record of everything (L322); and the rate limits (L318) — the quota (L149). The map (L326): the OWASP LLM Top 10 (L326) onto the stack (L325): the injection (L309) and the output (L326) → the guardrails (L281); the agency (L314) → the tools (L323) and the approvals (L324); the poisoning (L316) → the vetting (L316) and the isolation (L320); the consumption (L317) → the limits (L318). Every path (L327) has its defense (L327) — the defense in depth (L325)."*

## 2. Mental Model

Think of the RAG agent as **the embassy with the archives and the messengers.** The embassy (the RAG agent, L327) has the entrances (the paths, L327): the visitor's desk (the prompt path, L309), the archives (the document path, L316), the messengers (the tool path, L315), the couriers' copies (the data path, L312), and the feast hall (the abuse path, L317). Every entrance (L327) has its guard (L327): the letter-checker (the guardrails, L281) at the desk (L309); the archive vetter (the document checks, L316) at the shelves (L316); the badge-scoped messengers (the tool boundaries, L323) at the doors (L315); the sealed copies (the redaction, L313) for the couriers (L312); and the ration limits (the rate limits, L318) at the feast (L317). The ledger (the audit, L322) records every visitor (L327). The embassy works because every entrance has its guard, and the ledger records it all (L327).

```text
   the embassy (the RAG agent, L327)
   ┌────────────────────────────────────────────────────────┐
   │ the desk (the prompt, L309) · the archives (the doc,   │
   │ L316) · the messengers (the tools, L315)               │
   │ the copies (the data, L312) · the feast (the abuse,    │
   │ L317)                                                  │
   │ the guards (L327) at each · the ledger (the audit,     │
   │ L322)                                                  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the embassy**: the entrances, the guards, and the ledger (L327).

## 3. Visual Flow — The Paths and Their Defenses

```text
   THE PATHS (L327)                    THE DEFENSES (L327)
   ┌─────────────────────────────┐    ┌─────────────────────────────┐
   │ 1 the prompt (L309)         │    │ the guardrails (L281): the  │
   │   the direct injection      │    │ input checks + the data-as- │
   │   (L309)                    │    │ data (L311)                 │
   ├─────────────────────────────┤    ├─────────────────────────────┤
   │ 2 the document (L316)       │    │ the vetting (L316): the     │
   │   the poisoning (L316), the │    │ sources (L316) + the scan   │
   │   indirect (L311)           │    │ (L293) + the per-tenant     │
   │                             │    │ bases (L320)                │
   ├─────────────────────────────┤    ├─────────────────────────────┤
   │ 3 the tool (L315)           │    │ the boundaries (L323): the  │
   │   the unsafe call (L315),   │    │ schemas (L315) + the scopes │
   │   the agency (L314)         │    │ (L262) + the approvals      │
   │                             │    │ (L324)                      │
   ├─────────────────────────────┤    ├─────────────────────────────┤
   │ 4 the data (L312)           │    │ the redaction (L313): the   │
   │   the leakage (L312), the   │    │ prompts + the logs (L329) + │
   │   PII (L313)                │    │ the isolation (L320)        │
   ├─────────────────────────────┤    ├─────────────────────────────┤
   │ 5 the abuse (L317)          │    │ the limits (L318): the auth │
   │   the quota burning (L317)  │    │ (L319) + the rate limits    │
   │                             │    │ (L318) + the quotas (L149)  │
   └─────────────────────────────┘    └─────────────────────────────┘
      THE LEDGER (L322): the audit records every path (L327)
```

The flow is the module in one diagram: **five paths, five defenses, one ledger** (L327).

## 4. How It Works — The Assembly, Part by Part

- **The prompt path (L309).** The direct injection (L309) through the user's input — the defense: the guardrails (L281) and the data-as-data (L311).
- **The document path (L316).** The poisoning (L316) and the indirect injection (L311) through the retrieved text (L189) — the defense: the vetting (L316), the source control (L316), and the per-tenant bases (L320).
- **The tool path (L315).** The unsafe tool calling (L315) and the excessive agency (L314) through the actions (L315) — the defense: the tool boundaries (L323), the scopes (L262), and the approvals (L324).
- **The data path (L312).** The leakage (L312) and the PII (L313) through the responses and the logs (L329) — the defense: the redaction (L313) and the isolation (L320).
- **The abuse path (L317).** The model abuse (L317) through the quota (L149) — the defense: the auth (L319), the rate limits (L318), and the quotas (L149).

> [!NOTE]
> **The assembly rule: every path has its defense, and the ledger records it (L327).** The senior answer maps the paths (L327) to the defenses (L327): the prompt (L309) → the guardrails (L281); the document (L316) → the vetting (L316); the tool (L315) → the boundaries (L323); the data (L312) → the redaction (L313) and the isolation (L320); the abuse (L317) → the limits (L318). And the audit (L322) records every path (L327) — the defense in depth (L325), path by path (L327). An architect who can name the defense for each path can defend the whole (L327).

## 5. Real Project Usage

- **A production RAG agent (L327).** The five paths (L327) defended (L327): the guardrails (L281), the vetting (L316), the tools (L323), the isolation (L320), the limits (L318).
- **A customer support copilot (L350).** The document path (L316) — the trusted help center (L265) and the per-tenant bases (L320); the tool path (L315) — the ticket tools (L315) with the approvals (L324).
- **A multi-tenant SaaS (L357).** The isolation (L320) at every path (L327) — the tenant ID everywhere (L320).
- **A regulated workload (L371).** The threat model (L327) documented (L371) — the compliance's (L371) evidence (L322).
- **Anything RAG + agent (L280, L200).** The threat model (L327) — the paths and the defenses (L327).

The through-line: **the map is the module's output** — every path an attack can take, and the defense at each (L327).

## 6. Interview Explanation

Say it in four moves:

1. **The paths.** "The prompt (L309), the document (L316), the tool (L315), the data (L312), the abuse (L317)."
2. **The defenses.** "The guardrails (L281), the vetting (L316), the tools (L323), the isolation (L320), the limits (L318)."
3. **The ledger.** "The audit (L322) records every path (L327)."
4. **The map.** "The OWASP LLM Top 10 (L326) onto the stack (L325)."

## 7. Senior-Level Insights

- **The path is the review's unit (L327).** The senior review walks the paths (L327): the prompt (L309), the document (L316), the tool (L315), the data (L312), the abuse (L317) — naming the defense (L327) at each (L327).
- **The document path is the RAG's exposure (L316).** The poisoning (L316) and the indirect injection (L311) — the vetting (L316) and the data-as-data (L311) — the L316 risks (L316), path-shaped (L327).
- **The tool path is the agent's power (L315).** The unsafe call (L315) and the agency (L314) — the boundaries (L323) and the approvals (L324) — the L314 control (L314), path-shaped (L327).
- **The ledger is the loop's close (L322).** The audit (L322) — the attack (L308) reconstructed (L322) — the defenses (L327) improved (L327).
- **The map is the interview's (L326).** The OWASP LLM Top 10 (L326) onto the RAG agent (L327) — the sentences (L326) with the paths (L327).

## 8. Common Mistakes

- **The prompt-only defense (L309).** The guardrails (L281) on the prompt (L309) only (L327) — the document path (L316) and the tool path (L315) open (L327).
- **The retrieved text trusted (L311).** The document (L316) as the data (L311) — the poisoning (L316) rides the retrieval (L189) — the vetting (L316) and the data-as-data (L311) are the defense (L327).
- **The tools unscoped (L314).** The agent (L200) with the wide tools (L315) — the boundaries (L323) and the approvals (L324) missing (L327).
- **The shared data (L320).** The cross-tenant leak (L320) — the isolation (L320) missing (L327).
- **The ledger absent (L322).** The attack (L308) unrecorded (L322) — the loop (L327) unclosed (L327).

## 9. Best Practices

- **Draw the paths** (L327) — the five entrances (L327).
- **Defend each path** (L327) — the guardrails (L281), the vetting (L316), the tools (L323), the isolation (L320), the limits (L318).
- **Record the ledger** (L322) — the audit (L322) of every path (L327).
- **Map the OWASP** (L326) — the ten (L326) onto the stack (L325).
- **Review the paths** (L327) — before the launch (L307).

## 10. Interview Questions

**Q: Walk me through the RAG agent's threat model.**
> A: The five paths (L327): the prompt (L309) — the direct injection; the document (L316) — the poisoning and the indirect injection; the tool (L315) — the unsafe calls and the agency (L314); the data (L312) — the leakage and the PII (L313); and the abuse (L317) — the quota burning. Each with its defense (L327), and the audit (L322) recording it all (L327).

**Q: What's the document path's defense?**
> A: Three layers (L316): the vetting (L316) — the source control (L316) and the scans (L293) at the ingestion (L176); the data-as-data (L311) — the retrieved chunks (L189) marked as the untrusted data (L311); and the isolation (L320) — the per-tenant bases (L320) so the poisoned document (L316) doesn't cross (L320).

**Q: How do you secure the tool path?**
> A: The boundaries (L323): the schemas (L315) validating the inputs (L323), the scopes (L262) limiting the credentials (L323), the approvals (L324) gating the high-risk (L324), and the audit (L322) recording the calls (L327). The agency (L314) is bounded (L323) before the tool executes (L315).

**Q: How does the OWASP map onto this?**
> A: Risk by risk (L326): the injection (L309) and the output (L326) → the guardrails (L281); the poisoning (L316) and the vectors (L316) → the vetting (L316) and the isolation (L320); the agency (L314) → the tools (L323) and the approvals (L324); the disclosure (L312) → the redaction (L313) and the isolation (L320); the consumption (L317) → the limits (L318). The ten (L326) are the paths' (L327) checklist (L326).

## 11. Follow-Up Questions

- What are the five paths (L327)?
- What's the document path's defense (L316)?
- How do you secure the tool path (L323)?
- How does the OWASP map (L326)?
- What's the ledger's role (L322)?

## 12. Comparison Table — The Paths and the Defenses

| Path (L327) | The attack (L327) | The defense (L327) |
|---|---|---|
| The prompt (L309) | the direct injection (L309) | the guardrails (L281), the data-as-data (L311) |
| The document (L316) | the poisoning (L316), the indirect (L311) | the vetting (L316), the isolation (L320) |
| The tool (L315) | the unsafe call (L315), the agency (L314) | the boundaries (L323), the approvals (L324) |
| The data (L312) | the leakage (L312), the PII (L313) | the redaction (L313), the isolation (L320) |
| The abuse (L317) | the quota burning (L317) | the auth (L319), the limits (L318) |

The senior read: **the table is the milestone** — every path defended, the ledger recording (L327).

## 13. Code Example — The Assembly in One Shape

```text
The RAG agent (L327) — the threat model as folders:

  prompt-path/               THE PROMPT (L309)
    guardrails.ts            the input checks + the data-as-data (L281, L311)

  document-path/             THE DOCUMENT (L316)
    vetting.ts               the source control + the scans (L316, L293)
    tenant-bases.ts          the per-tenant knowledge (L320)

  tool-path/                 THE TOOL (L315)
    schemas.ts               the input validation (L315)
    scopes.ts                the least privilege (L262)
    approvals.ts             the human gate (L324)

  data-path/                 THE DATA (L312)
    redaction.ts             the PII out (L313)
    isolation.ts             the tenant ID everywhere (L320)

  abuse-path/                THE ABUSE (L317)
    auth.ts                  the per-customer keys (L319)
    limits.ts                the rate limits + the quotas (L318, L149)

  ledger/                    THE AUDIT (L322)
    audit.ts                 the who, the what, the when (L322)

  Every path is guarded; the ledger records it all (L327).
```

```text
What the reader must SEE — the boundaries as folders:

  prompt-path/    the guardrails (L281, L311)
  document-path/  the vetting + the isolation (L316, L320)
  tool-path/      the schemas, the scopes, the approvals (L323, L324)
  data-path/      the redaction + the isolation (L313, L320)
  abuse-path/     the auth + the limits (L319, L318)
  ledger/         the audit (L322)

  Every folder is a path; every path has its guard (L327).
```

```narrate
3-5: The prompt path — the guardrails on the inputs (L281, L311).
6-10: The document path — the vetting and the per-tenant bases (L316, L320).
11-17: The tool path — the schemas, the scopes, and the approvals (L315, L262, L324).
18-22: The data path — the redaction and the isolation (L313, L320).
23-27: The abuse path — the auth and the limits (L319, L318).
28-30: The ledger — the audit recording everything (L322, L327).
```

> [!TIP]
> The folder shape *is* the threat model: **prompt-path, document-path, tool-path, data-path, abuse-path, ledger** — each a path, each with its guard (L327). **If the document path isn't vetted (L316) or the ledger isn't recording (L322), the threat model is missing its walls — that's M26's milestone in a directory tree (L327).**

## 14. Performance Notes

- **The guardrails are the latency's sum (L327).** The input checks (L281) and the output filters (L281) — the sub-millisecond (L327) at the model (L278).
- **The retrieval is the RAG's latency (L189).** The tenant filter (L180) — the index (L183) narrowed (L189) — the isolation (L320) speeds the search (L189).
- **The approvals are the agent's latency (L324).** The high-risk (L324) — the human's (L324) time (L327).
- **The ledger is the storage's cost (L322).** The audit (L322) — the retention (L322) bounded (L327).

## 15. Debugging Scenarios

| Symptom | First check (L327) | The lever |
|---|---|---|
| The RAG answers the attack | The document path (L316) | The vetting (L316), the data-as-data (L311) |
| The agent did too much | The tool path (L315) | The scopes (L262), the approvals (L324) |
| The tenants mixed | The data path (L320) | The isolation (L320) |
| The quota is gone | The abuse path (L317) | The limits (L318) |
| The attack is opaque | The ledger (L322) | The audit (L322) |

## 16. Quick Revision Notes

- Securing the RAG + agent = **the module's synthesis** (L327): the five paths, the defenses, the ledger.
- The paths: **the prompt (L309), the document (L316), the tool (L315), the data (L312), the abuse (L317)**.
- The defenses: **the guardrails (L281), the vetting (L316), the tools (L323), the isolation (L320), the limits (L318)**.
- The ledger: **the audit (L322) — the record of every path (L327)**.
- The map: **the OWASP LLM Top 10 (L326) onto the stack (L325)**.

## 17. Cheat Sheet

```text
SECURING THE RAG + AGENT STACK = the full threat model

THE PATHS (L327)
  1 the prompt (L309) — the direct injection (L309)
  2 the document (L316) — the poisoning (L316), the indirect (L311)
  3 the tool (L315) — the unsafe call (L315), the agency (L314)
  4 the data (L312) — the leakage (L312), the PII (L313)
  5 the abuse (L317) — the quota burning (L317)

THE DEFENSES (L327)
  the prompt → the guardrails (L281), the data-as-data (L311)
  the document → the vetting (L316), the isolation (L320)
  the tool → the boundaries (L323), the approvals (L324)
  the data → the redaction (L313), the isolation (L320)
  the abuse → the auth (L319), the limits (L318)

THE LEDGER (L322)
  the audit (L322) — the who, the what, the when (L322)
  the loop's close (L327) — the defenses improved (L327)

THE MAP (L326)
  the OWASP LLM Top 10 (L326) onto the stack (L325)

INTERVIEW, 4 MOVES
  1 paths    "the prompt, the document, the tool, the data, the abuse (L327)"
  2 defenses "the guardrails, the vetting, the tools, the isolation, the limits (L327)"
  3 ledger   "the audit records every path (L322)"
  4 map      "the OWASP onto the stack (L326)"
```

## 18. Key Takeaways

> [!RECAP]
> - Securing the RAG + agent stack is **the module's synthesis — the full threat model for a RAG agent** (L327): the paths (L327), the defenses (L327), the ledger (L322), and the map (L326)
> - **The paths** (L327): the prompt (L309) — the direct injection (L309); the document (L316) — the poisoning (L316) and the indirect injection (L311); the tool (L315) — the unsafe calls (L315) and the agency (L314); the data (L312) — the leakage (L312) and the PII (L313); and the abuse (L317) — the quota burning (L317)
> - **The defenses** (L327): the guardrails (L281) for the prompt (L309); the vetting (L316) and the isolation (L320) for the document (L316); the boundaries (L323) and the approvals (L324) for the tool (L315); the redaction (L313) and the isolation (L320) for the data (L312); and the auth (L319) and the limits (L318) for the abuse (L317)
> - **The ledger** (L322): the audit (L322) records every path (L327) — the loop's close (L327)
> - **The map** (L326): the OWASP LLM Top 10 (L326) onto the stack (L325) — the ten (L326) are the paths' (L327) checklist (L326)
> - The assembly (L327): every path an attack can take (L327), and the defense at each (L327) — the defense in depth (L325), path by path (L327) — assemble it, defend it, and M26 is claimed (L327)

## Check your understanding

Answer these without looking back.

1. What are the five paths (L327)?
2. What's the document path's defense (L316)?
3. How do you secure the tool path (L323)?
4. How does the OWASP map (L326)?
5. What's the ledger's role (L322)?
6. What's the abuse path's defense (L318)?
7. What's the data path's defense (L313)?
8. What is M26's milestone (L327)?

## A Closing Note — The Embassy, Guarded

That was the last lesson of the AI Security module — and the one you'll *defend with*. L308–L326 gave you the parts; this lesson gave you the floor plan: **the five paths, the defenses at each, and the ledger recording it all.** When you can draw it, defend it, and review it — naming the guardrails for the prompt (L281), the vetting for the document (L316), the boundaries for the tool (L323), the isolation for the data (L320), and the limits for the abuse (L318) — you have claimed Milestone M26.

The next module turns the secured service into the *measured* service: AI Observability & Evaluation (L328–L346) — the observability fundamentals (L328), the logging and the tracing (L329–330), the metrics (L331), the token and the cost tracking (L332, L334), the latency (L333), the model performance (L335), the hallucination and the groundedness (L336–337), the retrieval and the tool evals (L338–339), the agent eval (L340), the regression testing (L341), the datasets (L342), the LLM-as-a-judge (L343), the platforms (L344–345), and the OpenTelemetry synthesis (L346). You've secured the embassy; now you'll measure everything inside it.
