# Module 15 — AI Security

## Why this module comes fifteenth

Modules 7–14 built and shipped the AI product: the model decision (M18), the app (M19), the knowledge (M20), the loop (M21), the automation (M22), the backend (M23), the cloud (M24), and the pipeline (M25). Every one of them has an **attack surface** — and this module is the defense. The L307 pipeline ships the service; this module is **the security that guards it**: the threat model (L308), the injection (L309–311), the data (L312–313), the agency (L314–315), the poisoning (L316), the abuse (L317–318), the auth (L319), the isolation (L320), the secrets (L321), the audit (L322), the tools (L323–324), the defense in depth (L325), and the OWASP walkthrough (L326–327).

The distinction this module is built on: a **demo** ships and hopes. A **solutions architect** threat-models first (L308) — and closes the OWASP LLM Top 10 (L326) with defense in depth (L325).

## Module map

- **M26 · AI Security (L308–327)** — the defense under the product.
  The threat model (L308), the prompt injection and the jailbreaks (L309–310), the indirect injection (L311), the data leakage and the PII (L312–313), the excessive agency and the unsafe tools (L314–315), the RAG poisoning (L316), the model abuse (L317–318), the auth (L319), the tenant isolation (L320), the secrets (L321), the audit (L322), the secure tools (L323–324), the defense in depth (L325), and the OWASP walkthrough (L326–327).

## How to study each lesson

1. **Follow one attack through the module.** A malicious document (L316) enters the RAG (L280), injects the prompt (L311), exfiltrates the PII (L313), and the agent (L279) with the excessive agency (L314) acts — the threat model (L308) maps it, the guardrails (L281) filter it, the tools (L323) scope it, and the audit (L322) records it.
2. **Learn the OWASP vocabulary.** The OWASP LLM Top 10 (L326) — the prompt injection (L309), the jailbreaks (L310), the data leakage (L312), the excessive agency (L314), the unsafe tools (L315), the poisoning (L316), the abuse (L317) — the words every AI security discussion uses.
3. **Apply the earlier modules.** The L172 baseline (L172) is the security's start; the L209 guardrails (L209) are the boundary; the L275 secrets (L275) are the keys; the L320 isolation (L320) is the L134 discipline's payoff (L134). This module is the earlier discipline, attack-shaped (L327).
4. **Build the synthesis at the end (L327).** The final lesson assembles the whole: every path an attack can take through a RAG agent (L327) — the injection, the poisoning, the agency, the exfiltration — and the defense at each (L327). Draw it, defend it, and M26 is claimed.

## Prerequisites

Module 12 (L233–260) — the backend the attacks target (L260). Module 13 (L261–287) — the cloud and the Bedrock the attacks cross (L278). Module 10 (L198–216) — the agents with the agency (L200) and the guardrails (L209). Module 9 (L174–197) — the RAG the poisoning targets (L196). Module 6 (L105–134) — the Laravel security and the multi-tenancy (L128, L134).

## Next

→ [Lesson 308 — AI Security Threat Model (OWASP LLM Top 10)](./308-threat-model.md)
