# Lesson 371 — Security & Compliance (SOC 2, GDPR, HIPAA)

**Interview importance:** ⭐⭐⭐⭐⭐ — "the frameworks that gate enterprise AI adoption" — the answer is *the compliance*: the frameworks, the gaps, and the evidence (L371).**

L325 built the security and L322 the audit; this lesson is **the frameworks**: the security & compliance — the SOC 2, the GDPR, the HIPAA — the frameworks that gate the enterprise AI adoption (L371): the frameworks (the SOC 2, the GDPR, the HIPAA, L371), the gaps (the AI's gaps, L371), and the evidence (the audit L322, L371). The AI shape (L173): the enterprise (L380) — the compliance (L371) gating the adoption (L371). This lesson is the compliance's gate (L371).

The distinction this lesson is built on: a **junior** treats the compliance as the checkbox. A **solutions architect** treats it as the gate (L371): the frameworks (L371), the gaps (L371), and the evidence (L322) — because the enterprise (L380) adoption (L371) is gated (L371).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the frameworks: the SOC 2, the GDPR, the HIPAA (L371)
- Explain the gaps: the AI's gaps (L371)
- Explain the evidence: the audit (L322)
- Explain the data: the residency and the privacy (L371)
- Explain the AI shape: the compliance's gate (L371)

## 1. One-Line Definition

**The security & compliance are the frameworks that gate the enterprise AI adoption (L371) — the frameworks (the SOC 2 L371: the security's controls; the GDPR L371: the data's privacy; the HIPAA L371: the health's data, L371), the gaps (the AI's gaps: the prompts L312, the data L313, the models L365, L371), and the evidence (the audit L322: the records L322, the controls L325, L371) — the enterprise's (L380) gate (L371).**

The one-sentence interview answer: *"The compliance is the adoption's gate (L371). The frameworks (L371): the SOC 2 (L371) — the security's (L325) controls (L371): the access (L262), the monitoring (L274), the incident (L304); the GDPR (L371) — the data's (L313) privacy (L371): the consent (L312), the deletion (L312), the residency (L261); and the HIPAA (L371) — the health's (L371) data (L313): the PHI (L371) protected (L371). The gaps (L371): the AI's (L371) — the prompts (L312) — the PII (L313) in the prompt (L312) and the log (L329); the data (L313) — the training (L365) and the vectors (L183); and the models (L365) — the vendor's (L364) processing (L371). The evidence (L322): the audit (L322) — the records (L322): the who, the what, the when (L322); and the controls (L325) — the L325 stack (L325) documented (L371). The AI shape (L173): the enterprise (L380) — the compliance (L371): the SOC 2 (L371), the GDPR (L371), the HIPAA (L371) — the gaps (L371) closed (L325), the evidence (L322) ready (L371)."*

## 2. Mental Model

Think of the compliance as **the building inspector's codes.** The inspector (the auditor, L371) checks the building (the AI system, L173) against the codes (the frameworks, L371): the fire code (the SOC 2, L371) — the exits (the access, L262) and the alarms (the monitoring, L274); the privacy code (the GDPR, L371) — the tenants' (L320) data (L313) and the consent (L312); and the medical code (the HIPAA, L371) — the clinic's (L371) records (L371). The inspector's checklist (the gaps, L371): the AI's (L371) rooms (L371) — the prompt's (L312) PII (L313), the training's (L365) data (L371). The building's logbook (the evidence, L322): the entries (L322) — the who, the what, the when (L322) — and the controls (L325) documented (L371). The building passes (L371) because the codes are met, the gaps are closed, and the logbook is ready (L371).

```text
   the inspection (the compliance, L371)
   ┌────────────────────────────────────────────────────────┐
   │ the codes (the frameworks, L371) — the SOC 2 (L371),   │
   │ the GDPR (L371), the HIPAA (L371)                      │
   │ the checklist (the gaps, L371) — the AI's rooms (L371) │
   │ the logbook (the evidence, L322) — the entries (L322)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the inspection**: the codes, the checklist, and the logbook (L371).

## 3. Visual Flow — One Compliance Review

```text
   the framework (L371)
        │  e.g. the GDPR (L371)
        ▼
   ┌────────────────────── THE GAPS (L371) ─────────────────────────────┐
   │  the prompts (L312): the PII (L313) in the prompt and the log     │
   │  the data (L313): the training (L365), the vectors (L183)         │
   │  the models (L365): the vendor's (L364) processing (L371)         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE CONTROLS (L325) ─────────────────────────┐
   │  the redaction (L313) · the isolation (L320) · the audit (L322)   │
   │  the residency (L261) · the consent (L312)                        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EVIDENCE (L322) ─────────────────────────┐
   │  the audit (L322): the who, the what, the when (L322)             │
   │  the controls (L325) documented (L371)                            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the review: **framework → gaps → controls → evidence** (L371).

## 4. How It Works — The Gate, Part by Part

- **The frameworks (L371).** The SOC 2 (L371), the GDPR (L371), the HIPAA (L371) — the security (L325), the privacy (L313), the health (L371).
- **The gaps (L371).** The AI's (L371): the prompts (L312), the data (L313), the models (L365).
- **The evidence (L322).** The audit (L322) — the records (L322); the controls (L325) — documented (L371).
- **The data (L371).** The residency (L261) and the privacy (L313) — the consent (L312) and the deletion (L312).

> [!NOTE]
> **The compliance is the adoption's gate, not the checkbox (L371).** The senior answer treats the compliance (L371) as the gate (L371): the enterprise (L380) adoption (L371) — the SOC 2 (L371) and the GDPR (L371) — gated (L371) on the evidence (L322): the audit (L322) — the who, the what, the when (L322); and the controls (L325) — the L325 stack (L325) documented (L371). The AI's (L371) gaps (L371) — the prompts (L312) and the data (L313) — closed (L325) with the evidence (L322) — the gate (L371) passed (L371).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The SOC 2 (L371) — the evidence (L322) — the adoption (L371).
- **A regulated AI (L371).** The HIPAA (L371) — the PHI (L371) — the isolation (L320).
- **A European deployment (L371).** The GDPR (L371) — the residency (L261) and the consent (L312).
- **A model vendor (L364).** The vendor's (L364) compliance (L371) — the processing (L371).
- **Anything enterprise (L380).** The gate (L371) — the frameworks, the gaps, the evidence (L371).

The through-line: **the gate is the adoption's** — the frameworks, the gaps, and the evidence (L371).

## 6. Interview Explanation

Say it in four moves:

1. **The frameworks.** "The SOC 2 (L371), the GDPR (L371), the HIPAA (L371)."
2. **The gaps.** "The prompts (L312), the data (L313), the models (L365)."
3. **The controls.** "The redaction (L313), the isolation (L320), the audit (L322)."
4. **The evidence.** "The records (L322) and the controls (L325) documented (L371)."

## 7. Senior-Level Insights

- **The residency is the data's (L261).** The region (L261) — the GDPR (L371) — the data's (L313) home (L261) — the cloud (L366) choice (L371).
- **The consent is the training's (L312).** The user's (L162) data (L313) in the training (L365) — the consent (L312) and the deletion (L312).
- **The redaction is the PII's (L313).** The prompts (L312) and the logs (L329) — the L313 discipline (L313), compliance-shaped (L371).
- **The audit is the evidence (L322).** The who, the what, the when (L322) — the L322 record (L322), compliance-shaped (L371).
- **The vendor is the chain's (L364).** The model vendor (L364) — the processing (L371) — the vendor's (L364) compliance (L371) in the contract (L371).

## 8. Common Mistakes

- **The checkbox compliance (L371).** The policy (L371) without the evidence (L322) — the audit (L322) fails (L371).
- **The PII in the prompt (L312).** The GDPR (L371) — the prompt (L312) sent (L312) — the redaction (L313) missing (L371).
- **The residency ignored (L261).** The data (L313) in the wrong region (L261) — the GDPR (L371) — the region (L261) is the choice (L371).
- **The training un-consented (L365).** The user's (L162) data (L313) fine-tuned (L365) — the consent (L312) missing (L371).
- **The vendor un-vetted (L364).** The model (L278) processing (L371) — the vendor's (L364) compliance (L371) un-checked (L371).

## 9. Best Practices

- **Map the frameworks** (L371) — the SOC 2 (L371), the GDPR (L371), the HIPAA (L371).
- **Close the AI's gaps** (L325) — the prompts (L312), the data (L313).
- **Redact the PII** (L313) — the prompts (L312) and the logs (L329).
- **Residency the data** (L261) — the region (L261) by the compliance (L371).
- **Evidence with the audit** (L322) — the records (L322) and the controls (L325).

## 10. Interview Questions

**Q: Walk me through the security and compliance.**
> A: The adoption's gate (L371). The frameworks — the SOC 2 (L371), the GDPR (L371), the HIPAA (L371). The gaps — the prompts (L312), the data (L313), the models (L365). The controls — the redaction (L313), the isolation (L320), the audit (L322). And the evidence — the records (L322).

**Q: What are the AI's compliance gaps?**
> A: Three (L371): the prompts (L312) — the PII (L313) in the prompt (L312) and the log (L329); the data (L313) — the training (L365) and the vectors (L183); and the models (L365) — the vendor's (L364) processing (L371). Each gap (L371) closed (L325) with the evidence (L322).

**Q: How does the GDPR apply?**
> A: The data's (L313) privacy (L371): the residency (L261) — the data (L313) in the region (L261); the consent (L312) — the training (L365) and the processing (L371); and the deletion (L312) — the "right to be forgotten" (L371). The prompts (L312) redacted (L313) — the PII (L313) out (L371).

**Q: How do you evidence it?**
> A: The audit (L322): the records (L322) — the who, the what, the when (L322) — the prompts' hashes (L329), the tool calls (L315), the cost (L334); and the controls (L325) — the L325 stack (L325) documented (L371). The evidence (L322) is the gate's (L371) pass (L371).

## 11. Follow-Up Questions

- What are the frameworks (L371)?
- What are the AI's gaps (L371)?
- How does the GDPR apply (L371)?
- How do you evidence it (L322)?
- What's the residency (L261)?

## 12. Comparison Table — The Frameworks

| Framework (L371) | The focus (L371) | The AI's (L371) |
|---|---|---|
| The SOC 2 (L371) | the security (L325) | the controls (L325), the audit (L322) |
| The GDPR (L371) | the privacy (L313) | the PII (L313), the residency (L261) |
| The HIPAA (L371) | the health (L371) | the PHI (L371), the isolation (L320) |

The senior read: **the framework by the domain** — the security, the privacy, the health (L371).

## 13. Code Example — The Gate, Applied

```js
// The compliance (L371) — the gaps, the controls, the evidence (L371).
// 1 · THE FRAMEWORK (L371) — the requirements (L371).
const gdpr = {
  residency: 'eu',                        // the data's region (L261)
  consent:   true,                        // the processing's consent (L312)
  deletion:  true,                        // the right to be forgotten (L312)
  piiRedaction: true,                     // the prompts' PII (L313)
};

// 2 · THE CONTROLS (L325) — the gaps closed (L371).
async function compliantCall(req) {
  // THE REDACTION (L313): the PII out of the prompt (L312).
  const redacted = redactPii(req.prompt);             // L313

  // THE RESIDENCY (L261): the region by the tenant (L320).
  const region = regionOf(req.tenantId);              // L261, L371

  // THE CONSENT (L312): the training (L365) excluded.
  if (!req.consent) await excludeFromTraining(req.userId);  // L312

  return invokeIn(region, redacted);                  // L278
}

// 3 · THE EVIDENCE (L322) — the audit (L322).
await audit.log({
  who: req.userId, what: { promptHash: sha256(req.prompt) },
  when: new Date().toISOString(), tenantId: req.tenantId,
});                                                 // L322

// 4 · THE VENDOR (L364) — the processing (L371).
//   the model vendor's (L364) compliance (L371) — in the contract (L371)
```

```text
What the reader must SEE — the gate, applied:

  residency: eu              → the data's region (L261, L371)
  redactPii                  → the PII out (L313)
  excludeFromTraining        → the consent (L312)
  invokeIn(region)           → the residency's call (L261)
  audit.log                  → the evidence (L322)

  The gaps closed, the evidence ready (L371).
```

```narrate
4-9: The framework — the GDPR's requirements (L371).
11-20: The controls — the redaction, the residency, and the consent (L313, L261, L312).
22-26: The evidence — the audit record (L322).
28-29: The vendor — the processing's compliance (L364, L371).
```

> [!TIP]
> The pair that defines the gate: **the redacted prompt** (the PII out, L313) and **the audit record** (the evidence, L322). **Map the frameworks, close the gaps, redact the PII, evidence with the audit — the adoption's gate (L371).**

## 14. Performance Notes

- **The redaction is the call's latency (L313).** The PII check (L313) — the milliseconds (L371) for the GDPR (L371).
- **The residency is the region's (L261).** The per-tenant (L320) region (L261) — the latency (L333) by the region (L371).
- **The audit is the storage's (L322).** The records (L322) — the retention (L322) — the evidence (L371).
- **The compliance is the adoption's (L371).** The gate (L371) — the enterprise (L380) revenue (L371).

## 15. Debugging Scenarios

| Symptom | First check (L371) | The lever |
|---|---|---|
| The audit fails | The evidence (L322) | The records (L322) |
| The PII leaks | The prompts (L312) | The redaction (L313) |
| The residency is wrong | The region (L261) | The tenant's (L320) region (L371) |
| The consent is missing | The training (L365) | The exclusion (L312) |
| The vendor's processing | The vendor (L364) | The contract (L371) |

## 16. Quick Revision Notes

- The security & compliance = **the adoption's gate** (L371): the frameworks, the gaps, the evidence.
- The frameworks: **the SOC 2 (L371), the GDPR (L371), the HIPAA (L371)**.
- The gaps: **the prompts (L312), the data (L313), the models (L365)**.
- The evidence: **the audit (L322) — the records (L322) and the controls (L325)**.
- The data: **the residency (L261) and the privacy (L313)**.

## 17. Cheat Sheet

```text
SECURITY & COMPLIANCE = the frameworks that gate the adoption

THE FRAMEWORKS (L371)
  the SOC 2 (L371) — the security's (L325) controls (L371)
  the GDPR (L371) — the data's (L313) privacy (L371)
  the HIPAA (L371) — the health's (L371) data (L371)

THE GAPS (L371)
  the prompts (L312) — the PII (L313) in the prompt and the log (L329)
  the data (L313) — the training (L365), the vectors (L183)
  the models (L365) — the vendor's (L364) processing (L371)

THE CONTROLS (L325)
  the redaction (L313) · the isolation (L320) · the audit (L322)
  the residency (L261) · the consent (L312)

THE EVIDENCE (L322)
  the audit (L322) — the who, the what, the when (L322)
  the controls (L325) documented (L371)

INTERVIEW, 4 MOVES
  1 frameworks "the SOC 2, the GDPR, the HIPAA (L371)"
  2 gaps      "the prompts, the data, the models (L371)"
  3 controls  "the redaction, the isolation, the audit (L371)"
  4 evidence  "the records (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - The security & compliance are **the frameworks that gate the enterprise AI adoption** (L371): the frameworks (L371), the gaps (L371), the evidence (L322), and the data (L371)
> - **The frameworks** (L371): the SOC 2 (L371) — the security's (L325) controls; the GDPR (L371) — the data's (L313) privacy; and the HIPAA (L371) — the health's (L371) data
> - **The gaps** (L371): the AI's (L371) — the prompts (L312) — the PII (L313); the data (L313) — the training (L365) and the vectors (L183); and the models (L365) — the vendor's (L364) processing (L371)
> - **The evidence** (L322): the audit (L322) — the who, the what, the when (L322); and the controls (L325) — documented (L371)
> - **The data** (L371): the residency (L261) and the privacy (L313) — the consent (L312) and the deletion (L312)
> - The principle (L371): the compliance (L371) is the gate (L371), not the checkbox (L371) — the gaps (L371) closed (L325) with the evidence (L322), and the adoption (L371) passed (L371)

## Check your understanding

Answer these without looking back.

1. What are the frameworks (L371)?
2. What are the AI's gaps (L371)?
3. How does the GDPR apply (L371)?
4. How do you evidence it (L322)?
5. What's the residency (L261)?
6. What's the consent (L312)?
7. What's the HIPAA (L371)?
8. What is the adoption's gate (L371)?

## A Closing Note — The Inspection, Passed

You now hold the gate: **the frameworks, the gaps, the controls, and the evidence — with the codes met and the logbook ready.** The building passes the inspection — and the logbook is complete (L371).

Next: where the data comes from, where it goes, and who decides — Data Governance (L372).
