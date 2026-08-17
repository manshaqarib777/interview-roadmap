# Lesson 329 — Logging

**Interview importance:** ⭐⭐⭐⭐⭐ — "structured logs for every model call — and what to redact first" — the answer is *the logging*: the structured record, the redaction, and the search (L329).**

L328 framed the five; this lesson is **the first layer**: the logging — the structured logs for every model call, and what to redact first (L329): the structure (the JSON records, L329), the redaction (the PII L313 and the secrets L275 out, L329), and the search (the Logs Insights L329, the debugging L211). The AI shape (L173): the model calls (L278) — the structured records (L329) with the PII (L313) redacted (L329). This lesson is the record's layer (L329).

The distinction this lesson is built on: a **demo** prints to the console. A **solutions architect** logs the structure (L329): the JSON (L329), the redaction (L329), and the search (L329) — because the debugging (L211) and the audit (L322) read the logs (L329).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the structure: the JSON records (L329)
- Explain the redaction: the PII and the secrets out (L329)
- Explain the search: the Logs Insights (L329)
- Explain the retention: the storage's bound (L329)
- Explain the AI shape: the model call's record (L329)

## 1. One-Line Definition

**The logging is the structured record of every model call (L329) — the structure (the JSON records: the timestamp, the request ID L330, the prompt's hash, the tokens L332, the latency L333, L329), the redaction (the PII L313 and the secrets L275 out before the write, L329), and the search (the Logs Insights L329 — the debugging's L211 and the audit's L322 record, L329) — with the retention (L329) bounding the storage (L285).**

The one-sentence interview answer: *"The logging is the structured record of every model call (L329). The structure (L329): the JSON record (L329) — the timestamp (L329), the request ID (L330), the user and the tenant (L322), the prompt's hash (L329), the output (L328), the tokens (L332), the latency (L333), and the cost (L334) — the machine-readable (L329), the searchable (L329). The redaction (L329): the PII (L313) — the names and the emails (L313) — and the secrets (L275) — the API keys (L275) — redacted before the write (L329): the log (L329) holds the hash (L329), not the secret (L329). The search (L329): the Logs Insights (L329) — the queries (L329) over the records (L329) — the debugging (L211): the failed request (L329) reconstructed (L329); the audit (L322): the who and the what (L322) evidenced (L329). The retention (L329): the records (L329) kept as the policy (L322) requires (L329) — the storage (L285) bounded (L329). The AI shape (L173): the model calls (L278) — the structured records (L329), the PII (L313) redacted (L329), and the search (L329) — the record's layer (L329) of the L328 frame (L328)."*

## 2. Mental Model

Think of the logging as **the hospital's patient records.** The records (the logs, L329) are the standardized forms (the JSON, L329): the patient's name and the date (the timestamp and the ID, L329), the symptoms (the prompt's hash, L329), the treatment (the output, L328), the dosages (the tokens, L332), and the times (the latency, L333). The clerk (the logger, L329) redacts (L329) before filing (L329): the patient's full name (the PII, L313) reduced to the initials (the hash, L329), the account numbers (the secrets, L275) removed (L329). The records room (the Logs Insights, L329) is searchable (L329): the doctor (the debugger, L211) pulls the patient's history (L329), and the inspectors (the auditors, L322) pull the compliance's (L322). The hospital works because the forms are standard, the records are redacted, and the room is searchable (L329).

```text
   the records (the logs, L329)
   ┌────────────────────────────────────────────────────────┐
   │ the forms (the JSON, L329) — the standard structure    │
   │ the redaction (L329) — the PII (L313) and the secrets  │
   │ (L275) out (L329)                                      │
   │ the room (the Logs Insights, L329) — the search (L329) │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the records**: the forms, the redaction, and the room (L329).

## 3. Visual Flow — One Logged Call

```text
   the model call (L278)
        │
        ▼
   ┌────────────────────── THE RECORD (L329) ───────────────────────────┐
   │  { timestamp, requestId, userId, tenantId,                       │
   │    promptHash, output, tokens, latencyMs, costUsd } (L329)        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REDACTION (L329) ────────────────────────┐
   │  the PII (L313) → the hash (L329) · the secrets (L275) → removed  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE WRITE (L329) ────────────────────────────┐
   │  the structured log (L329) → the store (L329)                     │
   │  the retention (L329) · the search (L329)                         │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the log: **record → redact → write** (L329).

## 4. How It Works — The Layer, Part by Part

- **The structure (L329).** The JSON record (L329): the timestamp, the request ID (L330), the user and the tenant (L322), the prompt's hash (L329), the output (L328), the tokens (L332), the latency (L333), the cost (L334).
- **The redaction (L329).** The PII (L313) and the secrets (L275) out (L329): the log (L329) holds the hash (L329), not the secret (L329).
- **The search (L329).** The Logs Insights (L329): the queries (L329) over the records (L329) — the debugging (L211) and the audit (L322).
- **The retention (L329).** The records (L329) kept as the policy (L322) requires (L329) — the storage (L285) bounded (L329).

> [!NOTE]
> **The redaction is the log's first rule (L329).** The senior answer redacts first (L329): the log (L329) is the persistent copy (L312) — the PII (L313) in it (L329) is the leak (L312); the secrets (L275) in it (L329) are the exposure (L321). The hash (L329) preserves the traceability (L322) without the data (L329): the prompt's hash (L329) links the request (L330), the audit (L322) reads the hash (L329), and the PII (L313) stays out (L329).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The structured logs (L329) — the per-tenant (L320) search (L329) and the retention (L322).
- **A chat product (L162).** The prompts' hashes (L329) — the debugging (L211) of the bad responses (L328).
- **A RAG platform (L280).** The retrieval's latency (L333) and the tokens (L332) in the log (L329).
- **An agent product (L279).** The tool calls (L315) logged (L329) — the trajectory (L340) reconstructed (L329).
- **Anything AI (L328).** The record's layer (L329) — the structured, the redacted, the searchable (L329).

The through-line: **the record is the layer's** — the structure, the redaction, and the search (L329).

## 6. Interview Explanation

Say it in four moves:

1. **The structure.** "The JSON record — the timestamp, the hash, the tokens, the latency (L329)."
2. **The redaction.** "The PII (L313) and the secrets (L275) out (L329)."
3. **The search.** "The Logs Insights — the debugging (L211) and the audit (L322)."
4. **The retention.** "The policy's bound (L322)."

## 7. Senior-Level Insights

- **The hash is the traceability without the data (L329).** The prompt's hash (L329) — the request linked (L330), the PII (L313) out (L329).
- **The redaction is the leak's prevention (L329).** The PII (L313) and the secrets (L275) redacted before the write (L329) — the L312 leak (L312), log-shaped (L329).
- **The request ID is the trace's key (L330).** The request ID (L330) in the log (L329) — the spans (L330) linked (L330) — the debugging (L211) fast (L329).
- **The retention is the compliance's (L322).** The records (L329) as the policy (L322) requires (L329) — the GDPR (L371) and the SOC 2 (L371) read the retention (L329).
- **The search is the review's (L329).** The Logs Insights (L329) — the incident (L304) and the audit (L322) query the same records (L329).

## 8. Common Mistakes

- **The console.log (L329).** The unstructured prints (L329) — the JSON (L329) is the searchable (L329).
- **The raw prompts (L329).** The PII (L313) in the logs (L329) — the hash (L329) and the redaction (L313) are the log's (L329).
- **The secrets in the logs (L275).** The API keys (L275) printed (L329) — the redaction (L329) first (L329).
- **The no request ID (L330).** The log (L329) without the trace's key (L330) — the debugging (L211) can't link (L330).
- **The retention forever (L329).** The logs (L329) kept indefinitely (L329) — the policy (L322) bounds the storage (L285).

## 9. Best Practices

- **Log the structure** (L329) — the JSON (L329) on every call (L328).
- **Redact first** (L329) — the PII (L313) and the secrets (L275) out (L329).
- **Include the request ID** (L330) — the trace's link (L330).
- **Search with the Insights** (L329) — the debugging (L211) and the audit (L322).
- **Retain by the policy** (L322) — the storage (L285) bounded (L329).

## 10. Interview Questions

**Q: Walk me through the logging.**
> A: The structured record of every model call (L329). The structure — the JSON: the timestamp, the request ID, the prompt's hash, the tokens, the latency (L329). The redaction — the PII (L313) and the secrets (L275) out (L329). The search — the Logs Insights (L329). And the retention — the policy's bound (L322).

**Q: What do you redact first?**
> A: The PII (L313) and the secrets (L275): the names and the emails (L313) → the hash (L329); the API keys (L275) → removed (L329). The log (L329) is the persistent copy (L312) — the data in it (L329) is the leak (L312). The hash (L329) preserves the traceability (L322) without the data (L329).

**Q: Why the JSON?**
> A: The searchability (L329): the JSON (L329) is the machine-readable (L329) — the Logs Insights (L329) queries the fields (L329): "the tenant's 429s in the last hour" (L329). The unstructured print (L329) can't be queried (L329) — the debugging (L211) slows (L329).

**Q: How do the logs link to the trace?**
> A: The request ID (L330): the log (L329) carries the request ID (L330) — the spans (L330) carry the same ID (L330) — the debugging (L211) moves from the log (L329) to the trace (L330) and back (L329). The one ID (L330) links the record (L329) and the path (L330).

## 11. Follow-Up Questions

- What's the structure (L329)?
- What do you redact first (L329)?
- Why the JSON (L329)?
- How do the logs link to the trace (L330)?
- What's the retention (L322)?

## 12. Comparison Table — The Print vs the Structured Log

| | The print (L329) | The structured log (L329) |
|---|---|---|
| The format (L329) | the text (L329) | the JSON (L329) |
| The search (L329) | the grep (L329) | the Logs Insights (L329) |
| The redaction (L329) | the manual (L329) | the automatic (L329) |
| The link (L330) | none (L329) | the request ID (L330) |
| The use (L329) | the demo (L329) | the debugging (L211), the audit (L322) |

The senior read: **the right column is the record** — the structured, the redacted, the linked (L329).

## 13. Code Example — The Record, Written

```js
// The structured logging (L329) — the record of every call (L329).
// 1 · THE REDACTION (L329) — the PII and the secrets out (L329).
function redactForLog(prompt) {
  return {
    promptHash: sha256(prompt),              // the hash (L329)
    // the PII (L313) and the secrets (L275) never enter the log (L329)
  };
}

// 2 · THE RECORD (L329) — the JSON structure (L329).
async function logCall({ req, response, started }) {
  const { promptHash } = redactForLog(req.prompt);   // L329

  const record = {
    timestamp: new Date().toISOString(),     // the when (L329)
    requestId: req.id,                       // the trace's key (L330)
    userId: req.userId,                      // the who (L322)
    tenantId: req.tenantId,                  // the tenant (L320)
    promptHash,                              // the content, hashed (L329)
    tokens: response.usage.total,            // the usage (L332)
    latencyMs: performance.now() - started,  // the time (L333)
    costUsd: costOf(response.usage),         // the cost (L334)
  };

  // 3 · THE WRITE (L329) — the structured log (L329).
  logger.info(record);                       // the JSON (L329)
  // the retention (L322): the policy's duration (L329)
}
```

```text
What the reader must SEE — the record, written:

  promptHash = sha256      → the PII out (L329, L313)
  requestId                → the trace's key (L330)
  tokens + costUsd         → the usage (L332, L334)
  latencyMs                → the time (L333)
  logger.info(record)      → the JSON write (L329)

  The structured, the redacted, the searchable (L329).
```

```narrate
4-7: The redaction — the prompt hashed, the PII never entering the log (L329, L313).
9-21: The record — the timestamp, the request ID, the identity, the hashed prompt, the tokens, the latency, and the cost (L329).
23-24: The write — the structured JSON log (L329).
```

> [!TIP]
> The pair that defines the logging: **the prompt's hash** (the traceability without the data, L329) and **the request ID** (the trace's link, L330). **Structure the JSON, redact first, link the request ID, retain by the policy — the record's layer (L329).**

## 14. Performance Notes

- **The write is the request's latency (L329).** The log (L329) — the async (L222) write (L329) — the request path (L151) unblocked (L329).
- **The retention is the storage's cost (L285).** The records (L329) — the policy (L322) bounds the storage (L285).
- **The search is the query's cost (L329).** The Logs Insights (L329) — the indexed fields (L329) — the queries (L329) fast (L329).
- **The redaction is the pipeline's cost (L329).** The hash (L329) — the microseconds (L329) for the safety (L329).

## 15. Debugging Scenarios

| Symptom | First check (L329) | The lever |
|---|---|---|
| The failure is opaque | The log (L329) | The structured record (L329) |
| The PII is in the logs | The redaction (L329) | The hash (L329), the redact (L313) |
| The debug can't link | The request ID (L330) | The ID in the log and the trace (L330) |
| The storage grows | The retention (L322) | The policy (L322) |
| The search is slow | The fields (L329) | The indexed (L329) |

## 16. Quick Revision Notes

- The logging = **the record's layer** (L329): the structure, the redaction, the search, the retention.
- The structure: **the JSON — the timestamp, the hash, the tokens, the latency** (L329).
- The redaction: **the PII (L313) and the secrets (L275) out** (L329).
- The search: **the Logs Insights — the debugging (L211) and the audit (L322)**.
- The retention: **the policy's bound (L322)**.

## 17. Cheat Sheet

```text
LOGGING = the structured record of every model call

THE STRUCTURE (L329)
  the JSON (L329): the timestamp, the request ID (L330)
  the user and the tenant (L322) · the prompt's hash (L329)
  the output (L328) · the tokens (L332) · the latency (L333)
  the cost (L334)

THE REDACTION (L329)
  the PII (L313) — the names, the emails → the hash (L329)
  the secrets (L275) — the API keys → removed (L329)
  the log holds the hash, not the secret (L329)

THE SEARCH (L329)
  the Logs Insights (L329) — the queries over the records (L329)
  the debugging (L211) · the audit (L322)

THE RETENTION (L329)
  the records (L329) as the policy (L322) requires (L329)
  the storage (L285) bounded (L329)

INTERVIEW, 4 MOVES
  1 structure "the JSON record (L329)"
  2 redaction "the PII and the secrets out (L329)"
  3 search    "the Logs Insights (L329)"
  4 retention "the policy's bound (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - The logging is **the structured record of every model call** (L329): the structure (L329), the redaction (L329), the search (L329), and the retention (L329)
> - **The structure** (L329): the JSON record (L329) — the timestamp, the request ID (L330), the user and the tenant (L322), the prompt's hash (L329), the output (L328), the tokens (L332), the latency (L333), and the cost (L334)
> - **The redaction** (L329): the PII (L313) and the secrets (L275) out (L329) — the log (L329) holds the hash (L329), not the secret (L329)
> - **The search** (L329): the Logs Insights (L329) — the debugging (L211) and the audit (L322) query the same records (L329)
> - **The retention** (L329): the records (L329) kept as the policy (L322) requires (L329) — the storage (L285) bounded (L329)
> - The AI shape (L329): the model calls (L278) — the structured records (L329), the PII (L313) redacted (L329), and the search (L329) — the record's layer (L329) of the L328 frame (L328)

## Check your understanding

Answer these without looking back.

1. What's the structure (L329)?
2. What do you redact first (L329)?
3. Why the JSON (L329)?
4. How do the logs link to the trace (L330)?
5. What's the retention (L322)?
6. What's the hash for (L329)?
7. What's the Logs Insights (L329)?
8. What is the record's layer (L329)?

## A Closing Note — The Records, Filed

You now hold the layer: **the structure, the redaction, the search, and the retention — with the hash preserving the trace and the PII staying out.** The patient records are standardized — and the clerk redacts first (L329).

Next: the request path through gateway, retrieval, tools, and model — Tracing (L330).
