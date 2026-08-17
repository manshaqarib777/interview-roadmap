# Lesson 322 — Audit Logs & Governance Records

**Interview importance:** ⭐⭐⭐⭐⭐ — "who prompted what, with which tools, at what cost — the record" — the answer is *the audit*: the governance record of the AI's actions (L322).**

L213 built the observability (L213) and L308 the threat model (L308); this lesson is **the record the governance needs**: the audit logs & governance records — who prompted what, with which tools, at what cost (L322): the record (the who, the what, the when, L322), the placement (the prompts, the tools, the cost, L322), and the governance (the retention, the immutability, the review, L322). The AI shape (L173): the model calls (L278) and the agent actions (L314) — the record (L322) of the AI's behavior (L322). This lesson is the governance's record (L322).

The distinction this lesson is built on: a **demo** logs the errors. A **solutions architect** records the governance (L322): the who, the what, the when (L322) — because the incident (L304) and the compliance (L371) read the same record (L322).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the record: the who, the what, the when (L322)
- Explain the placement: the prompts, the tools, the cost (L322)
- Explain the governance: the retention and the immutability (L322)
- Explain the review: the incidents and the compliance (L322)
- Explain the AI shape: the AI's governance record (L322)

## 1. One-Line Definition

**The audit logs & governance records are the record of who prompted what, with which tools, at what cost (L322) — the record (the who: the user L319 and the tenant L320; the what: the prompt L312, the tool L315, the output; the when: the timestamp, L322), the placement (the prompts hashed L329, the tools' calls L315, the cost L334, L322), and the governance (the retention L322, the immutability L322, and the review L322) — the incident's (L304) and the compliance's (L371) record (L322).**

The one-sentence interview answer: *"The audit logs are the governance's record (L322). The record (L322): the who (L322) — the user (L319) and the tenant (L320); the what (L322) — the prompt (L312) and the tool call (L315); the when (L322) — the timestamp (L322); and the cost (L334) — the tokens (L332). The placement (L322): the prompts stored hashed (L329) — the PII (L313) redacted (L313); the tools' calls (L315) — the arguments (L315) and the outcomes (L322); the cost (L334) — the per-request tokens (L332) and the spend (L334). The governance (L322): the retention (L322) — the records kept as long as the policy (L322) requires; the immutability (L322) — the records append-only (L322), the tamper-evident (L322); and the review (L322) — the incidents (L304) reconstructed (L322) and the compliance (L371) evidenced (L322). The AI shape (L173): the model calls (L278) and the agent actions (L314) — the record (L322) of the AI's behavior (L322): the prompt's hash (L329), the tool's call (L315), the cost (L334), and the outcome (L322) — the governance (L322) reads the same record (L322)."*

## 2. Mental Model

Think of the audit logs as **the ship's captain's log.** The log (the audit records, L322) records every event (L322): the course (the prompt, L312), the crew's orders (the tools, L315), the provisions (the cost, L334), and the time (the timestamp, L322) — the who, the what, the when (L322). The log is kept in the strongbox (the governance, L322): the pages numbered (the append-only, L322), the ink permanent (the immutability, L322), and the pages kept for the voyage (the retention, L322). The inspectors (the auditors, L322) review the log (L322) — after the storm (the incident, L304) and at the port (the compliance, L371). The ship works because the log is complete, the strongbox is locked, and the inspectors read it (L322).

```text
   the captain's log (the audit, L322)
   ┌────────────────────────────────────────────────────────┐
   │ the entries (L322) — the who, the what, the when, the  │
   │ cost (L334)                                            │
   │ the strongbox (the governance, L322) — the append-only │
   │ (L322), the retention (L322)                           │
   │ the inspectors (the review, L322) — the incidents      │
   │ (L304), the compliance (L371)                          │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the log**: the entries, the strongbox, and the inspectors (L322).

## 3. Visual Flow — One Recorded Event

```text
   the event (L322)
        │  the model call (L278) · the tool call (L315)
        ▼
   ┌────────────────────── THE RECORD (L322) ───────────────────────────┐
   │  the who: the user (L319), the tenant (L320)                      │
   │  the what: the prompt's hash (L329), the tool (L315)              │
   │  the when: the timestamp (L322)                                   │
   │  the cost: the tokens (L332), the spend (L334)                    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE GOVERNANCE (L322) ───────────────────────┐
   │  the append-only (L322) · the tamper-evident (L322)               │
   │  the retention (L322)                                             │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REVIEW (L322) ───────────────────────────┐
   │  the incident (L304) reconstructed (L322)                         │
   │  the compliance (L371) evidenced (L322)                           │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the record: **event → record → govern → review** (L322).

## 4. How It Works — The Record, Part by Part

- **The record (L322).** The who (L322) — the user (L319) and the tenant (L320); the what (L322) — the prompt (L312) and the tool (L315); the when (L322) — the timestamp (L322); the cost (L334) — the tokens (L332).
- **The placement (L322).** The prompts hashed (L329) — the PII (L313) redacted (L313); the tools' calls (L315) — the arguments (L315) and the outcomes (L322); the cost (L334) — the per-request (L332).
- **The governance (L322).** The retention (L322), the immutability (L322) — the append-only (L322), and the tamper-evidence (L322).
- **The review (L322).** The incidents (L304) reconstructed (L322) and the compliance (L371) evidenced (L322).

> [!NOTE]
> **The audit is the incident's and the compliance's record (L322).** The senior answer names the two readers (L322): the incident (L304) — the record (L322) reconstructs what happened (L322): who, what, when, at what cost (L322); the compliance (L371) — the record (L322) evidences the governance (L371): the SOC 2 (L371) and the GDPR (L371) read the same record (L322). The record (L322) is the AI's behavior (L322), written once and read twice (L322).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The audit (L322) — the per-tenant records (L320) with the retention (L322).
- **An agent product (L279).** The tool calls (L315) recorded (L322) — the agent's trajectory (L322).
- **A regulated workload (L371).** The SOC 2 (L371) and the GDPR (L371) — the audit (L322) as the evidence (L371).
- **An incident (L304).** The record (L322) — the reconstruction (L322) of the rollback (L304).
- **Anything AI (L322).** The governance's record (L322) — the who, the what, the when, the cost (L322).

The through-line: **the record is the governance's** — written once, read by the incident and the compliance (L322).

## 6. Interview Explanation

Say it in four moves:

1. **The record.** "The who, the what, the when, the cost (L322)."
2. **The placement.** "The prompts hashed (L329), the tools' calls (L315), the cost (L334)."
3. **The governance.** "The retention and the immutability (L322)."
4. **The review.** "The incidents (L304) and the compliance (L371)."

## 7. Senior-Level Insights

- **The who is the identity (L319).** The user (L319) and the tenant (L320) — the record (L322) attributed (L322).
- **The what is the behavior (L322).** The prompt (L312) and the tool (L315) — the AI's behavior (L322) recorded (L322).
- **The cost is the spend (L334).** The tokens (L332) per request (L322) — the L334 attribution (L334), audit-shaped (L322).
- **The immutability is the trust (L322).** The append-only (L322) — the tamper-evident (L322) — the record (L322) trusted (L322).
- **The review is the loop (L322).** The incidents (L304) and the compliance (L371) — the record (L322) read (L322), the controls (L325) improved (L322).

## 8. Common Mistakes

- **The error-only logs (L322).** The errors (L274) without the governance (L322) — the who and the what (L322) missing (L322).
- **The raw prompts (L329).** The PII (L313) in the records (L329) — the hashes (L329) and the redaction (L313) are the record's (L322).
- **The mutable records (L322).** The overwritten logs (L322) — the append-only (L322) is the trust (L322).
- **The no retention (L322).** The records (L322) forever or never (L322) — the policy (L322) is the retention (L322).
- **The un-reviewed record (L322).** The log (L322) unread (L322) — the incident (L304) and the compliance (L371) starved (L322).

## 9. Best Practices

- **Record the who, the what, the when** (L322) — and the cost (L334).
- **Hash and redact** (L329) — the prompts' PII (L313) out (L322).
- **Append-only** (L322) — the tamper-evident (L322).
- **Retain by the policy** (L322) — the compliance's (L371) requirement (L322).
- **Review the record** (L322) — the incidents (L304) and the audits (L371).

## 10. Interview Questions

**Q: Walk me through the audit logs.**
> A: The governance's record (L322). The record — the who, the what, the when, the cost (L322). The placement — the prompts hashed (L329), the tools' calls (L315), the cost (L334). The governance — the retention and the immutability (L322). And the review — the incidents (L304) and the compliance (L371).

**Q: What do you record for an AI call?**
> A: The who (L322) — the user (L319) and the tenant (L320); the what (L322) — the prompt's hash (L329) and the tool (L315); the when (L322) — the timestamp (L322); and the cost (L334) — the tokens (L332) and the spend (L334). The PII (L313) redacted (L313) — the record (L322) holds the hash, not the secret (L329).

**Q: How do you make the record trustworthy?**
> A: The immutability (L322): the append-only (L322) — the records (L322) never overwritten (L322); the tamper-evident (L322) — the hashes chained (L322); and the retention (L322) — the records (L322) kept as the policy (L322) requires. The trusted record (L322) is the evidence (L322).

**Q: Who reads it?**
> A: Two readers (L322): the incident (L304) — the record (L322) reconstructs what happened (L322): the prompt (L312), the tool (L315), the cost (L334); and the compliance (L371) — the SOC 2 (L371) and the GDPR (L371) read the same record (L322) as the evidence (L371).

## 11. Follow-Up Questions

- What's the record (L322)?
- What do you record for an AI call (L322)?
- How do you make it trustworthy (L322)?
- Who reads it (L322)?
- What's the retention (L322)?

## 12. Comparison Table — The App Log vs the Audit Record

| | The app log (L274) | The audit record (L322) |
|---|---|---|
| The purpose (L322) | the debugging (L274) | the governance (L322) |
| The content (L322) | the errors, the latency (L333) | the who, the what, the cost (L334) |
| The mutability (L322) | the rotating (L274) | the append-only (L322) |
| The reader (L322) | the on-call (L274) | the incident (L304), the auditor (L371) |

The senior read: **the audit is the governance's record** — the app log serves the ops, the audit serves the trust (L322).

## 13. Code Example — The Record, Applied

```js
// The audit record (L322) — the governance's log (L322).
// 1 · THE RECORD (L322) — the who, the what, the when, the cost (L322).
async function auditLog(entry) {
  const record = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),               // the when (L322)
    who: { userId: entry.userId, tenantId: entry.tenantId },  // L319, L320
    what: {
      kind: entry.kind,                          // the model / the tool (L322)
      promptHash: sha256(entry.prompt),          // the hash (L329)
      tool: entry.tool?.name,                    // the tool (L315)
      toolArgs: entry.tool?.args,                // the arguments (L315)
    },
    cost: { tokens: entry.usage, spendUsd: entry.spend },   // L332, L334
    outcome: entry.outcome,                      // the result (L322)
  };

  // 2 · THE APPEND-ONLY (L322) — the immutable record (L322).
  await auditStore.append(record);               // the append-only (L322)

  // 3 · THE RETENTION (L322) — the policy (L322).
  //   auditStore.retain('1y')                   // the compliance (L371)

  return record;
}

// 4 · THE REVIEW (L322) — the incident (L304) and the audit (L371).
```

```text
What the reader must SEE — the record, applied:

  at + who + what + cost    → the record's shape (L322)
  promptHash = sha256       → the PII out (L329, L313)
  tool + toolArgs           → the tool's call (L315)
  tokens + spendUsd         → the cost (L332, L334)
  auditStore.append         → the append-only (L322)

  Written once, read by the incident and the compliance (L322).
```

```narrate
4-17: The record — the who, the what (the hashed prompt and the tool), the when, and the cost (L322, L329).
19-21: The append — the immutable, append-only write (L322).
23-24: The retention — the policy's duration (L322, L371).
26: The review — the incident and the audit read it (L304, L371).
```

> [!TIP]
> The pair that defines the audit: **the hashed prompt** (the PII out, L329) and **the append-only store** (the trust, L322). **Record the who and the what, hash the prompts, append-only the store, retain by the policy — the governance's record (L322).**

## 14. Performance Notes

- **The write is the request's latency (L322).** The audit append (L322) — the async (L222) write (L322) — the request path (L151) unblocked (L322).
- **The retention is the storage's cost (L322).** The records (L322) — the policy (L322) bounds the storage (L285).
- **The immutability is the compute's cost (L322).** The chained hashes (L322) — the small compute (L322) for the trust (L322).
- **The review is the query's cost (L322).** The incident's search (L322) — the indexed (L322) records (L322).

## 15. Debugging Scenarios

| Symptom | First check (L322) | The lever |
|---|---|---|
| The incident is opaque | The record (L322) | The who and the what (L322) |
| The PII is in the logs | The record (L329) | The hash and the redaction (L313) |
| The record was overwritten | The store (L322) | The append-only (L322) |
| The compliance fails | The retention (L322) | The policy (L371) |
| The cost is unattributed | The record (L334) | The tokens (L332) per request (L322) |

## 16. Quick Revision Notes

- The audit logs = **the governance's record** (L322): the record, the placement, the governance, the review.
- The record: **the who, the what, the when, the cost (L334)**.
- The placement: **the prompts hashed (L329), the tools (L315), the cost (L334)**.
- The governance: **the retention (L322) and the immutability (L322)**.
- The review: **the incidents (L304) and the compliance (L371)**.

## 17. Cheat Sheet

```text
AUDIT LOGS & GOVERNANCE RECORDS = who prompted what, at what cost

THE RECORD (L322)
  the who — the user (L319), the tenant (L320)
  the what — the prompt (L312), the tool (L315), the outcome (L322)
  the when — the timestamp (L322)
  the cost — the tokens (L332), the spend (L334)

THE PLACEMENT (L322)
  the prompts hashed (L329) — the PII (L313) redacted (L313)
  the tools' calls (L315) — the arguments (L315)
  the cost (L334) — the per-request (L332)

THE GOVERNANCE (L322)
  the retention (L322) — the policy (L371)
  the immutability (L322) — the append-only (L322)
  the tamper-evidence (L322) — the chained hashes (L322)

THE REVIEW (L322)
  the incident (L304) — the reconstruction (L322)
  the compliance (L371) — the evidence (L371)

INTERVIEW, 4 MOVES
  1 record    "the who, the what, the when, the cost (L322)"
  2 placement "the hashes, the tools, the cost (L322)"
  3 governance "the retention, the immutability (L322)"
  4 review    "the incidents and the compliance (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - The audit logs & governance records are **the record of who prompted what, with which tools, at what cost** (L322): the record (L322), the placement (L322), the governance (L322), and the review (L322)
> - **The record** (L322): the who (L322) — the user (L319) and the tenant (L320); the what (L322) — the prompt (L312) and the tool (L315); the when (L322); and the cost (L334) — the tokens (L332)
> - **The placement** (L322): the prompts stored hashed (L329) with the PII (L313) redacted (L313); the tools' calls (L315) with the arguments (L315); the cost (L334) per request (L332)
> - **The governance** (L322): the retention (L322) by the policy (L371), the immutability (L322) — the append-only (L322) and the tamper-evident (L322)
> - **The review** (L322): the incidents (L304) reconstructed (L322) and the compliance (L371) evidenced (L322)
> - The AI shape (L322): the model calls (L278) and the agent actions (L314) — the record (L322) of the AI's behavior (L322) — written once and read by the incident (L304) and the compliance (L371)

## Check your understanding

Answer these without looking back.

1. What's the record (L322)?
2. What do you record for an AI call (L322)?
3. How do you make it trustworthy (L322)?
4. Who reads it (L322)?
5. What's the retention (L322)?
6. What's the hash for (L329)?
7. What's the append-only (L322)?
8. What is the governance's record (L322)?

## A Closing Note — The Log, Sealed

You now hold the record: **the who, the what, the when, and the cost — with the strongbox locked and the inspectors reading.** The captain's log is complete — and the ink is permanent (L322).

Next: the least privilege, the scoped credentials, and the tool output filtering — Secure Tool Architecture (L323).
