# Lesson 313 — Sensitive Data & PII

**Interview importance:** ⭐⭐⭐⭐⭐ — "detecting, redacting, and minimising PII in AI flows" — the answer is *the PII discipline*: the detection, the redaction, and the minimization (L313).**

L312 mapped the exits; this lesson is **the data at risk**: the sensitive data & PII — detecting, redacting, and minimising the PII in the AI flows (L313): the entities (the names, the emails, the SSNs, L313), the detection (the recognizers, L313), and the redaction (the masking, the blocking, L313) — with the minimization (L312) as the principle (L313). The AI shape (L173): the prompts (L312) and the logs (L329) — the PII detected and redacted (L313). This lesson is the PII's discipline (L313).

The distinction this lesson is built on: a **demo** ships the PII. A **solutions architect** detects and redacts (L313): the entities (L313), the detection (L313), and the redaction (L313) — because the L312 exits (L312) carry the PII (L313).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the entities: the names, the emails, the SSNs (L313)
- Explain the detection: the recognizers (L313)
- Explain the redaction: the masking, the blocking (L313)
- Explain the minimization: the least PII (L312)
- Explain the AI shape: the PII out of the prompts and the logs (L313)

## 1. One-Line Definition

**The sensitive data & PII discipline detects, redacts, and minimises the PII in the AI flows (L313) — the entities (the names, the emails, the phone numbers, the SSNs, L313), the detection (the recognizers: the patterns and the ML models, L313), and the redaction (the masking — `name@***.com` — and the blocking, L313) — with the minimization (the least PII in the prompt, L312) as the principle (L313).**

The one-sentence interview answer: *"The PII discipline is the detection, the redaction, and the minimization (L313). The entities (L313): the names, the emails, the phone numbers, the SSNs, the addresses (L313) — the data that identifies (L313). The detection (L313): the recognizers (L313) — the pattern matching for the emails and the SSNs (L313), the ML models for the names (L313). The redaction (L313): the masking (L313) — the value replaced (L313): `name@***.com` (L313) — or the blocking (L313) — the entity removed (L313). The placement (L313): the redaction before the prompt (L312) — the provider (L278) sees less (L313); before the log (L329) — the record (L329) holds less (L313); and before the training (L365) — the model (L365) learns less (L313). The minimization (L312): the least PII (L312) in the flow (L313) — the data not collected (L313) is the data not leaked (L312). The AI shape (L173): the prompts (L312) and the logs (L329) — the PII detected (L313) and redacted (L313) before the exits (L312) — the L313 discipline (L313) at each boundary (L312)."*

## 2. Mental Model

Think of the PII as **the labeled jewels in the castle.** The jewels (the PII, L313) are labeled (the entities, L313): the rubies (the names, L313), the emeralds (the emails, L313), the diamonds (the SSNs, L313). The guards (the detection, L313) recognize the labels (L313) — the ruby's shape (the pattern, L313), the emerald's sparkle (the ML model, L313). Before the jewels leave the castle (the exits, L312), the clerk (the redaction, L313) replaces them with the replicas (the masking, L313) — the ruby-shaped glass (the `***`, L313) — or keeps them in (the blocking, L313). And the castle's rule (the minimization, L312): the fewer jewels brought in (L313), the fewer lost (L312). The castle works because the labels are recognized, the replicas are sent, and the jewels are minimized (L313).

```text
   the jewels (the PII, L313)
   ┌────────────────────────────────────────────────────────┐
   │ the labels (the entities, L313) — the names, the       │
   │ emails, the SSNs (L313)                                │
   │ the guards (the detection, L313) — the recognizers     │
   │ (L313)                                                 │
   │ the replicas (the redaction, L313) — the masks (L313)  │
   │ the rule (the minimization, L312) — the least jewels   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the jewels**: the labels, the guards, the replicas, and the rule (L313).

## 3. Visual Flow — One PII's Path

```text
   the input (L313)
        │  "email me at john@example.com" (L313)
        ▼
   ┌────────────────────── THE DETECTION (L313) ────────────────────────┐
   │  the recognizers (L313) — the email's pattern (L313)              │
   │  the entity found: the EMAIL (L313)                               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REDACTION (L313) ────────────────────────┐
   │  the masking (L313): "email me at ***@***.com" (L313)             │
   │  or the blocking (L313): "email me" (L313)                        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EXIT (L312) ─────────────────────────────┐
   │  the prompt (L312) — the provider sees the masked (L313)          │
   │  the log (L329) — the record holds the masked (L313)              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the PII's path: **detect → redact → exit** (L313).

## 4. How It Works — The Discipline, Part by Part

- **The entities (L313).** The data that identifies (L313): the names, the emails, the phone numbers, the SSNs, the addresses (L313).
- **The detection (L313).** The recognizers (L313): the pattern matching (L313) — the emails and the SSNs (L313); the ML models (L313) — the names and the addresses (L313).
- **The redaction (L313).** The masking (L313) — the value replaced (L313): `john@example.com` → `***@***.com` (L313); the blocking (L313) — the entity removed (L313).
- **The placement (L313).** The redaction before the exits (L312): the prompt (L312), the log (L329), the training (L365) (L313).
- **The minimization (L312).** The least PII (L312) in the flow (L313) — the data not collected (L313) is the data not leaked (L312).

> [!NOTE]
> **The redaction is the last line; the minimization is the first (L313).** The senior answer orders the discipline (L313): the minimization (L312) — the PII not collected (L313) — is the first line (L313); the detection (L313) and the redaction (L313) are the last (L313). The AI flow (L173) — the prompt (L312), the log (L329), the training (L365) — minimizes (L312) first and redacts (L313) at each exit (L312).

## 5. Real Project Usage

- **A chat product (L162).** The prompts (L312) redacted (L313) — the provider (L278) sees the masked (L313).
- **A RAG platform (L280).** The documents (L316) — the PII (L313) redacted before the chunking (L178).
- **An observability pipeline (L274).** The logs (L329) — the PII (L313) redacted before the write (L329).
- **A regulated workload (L371).** The GDPR (L371) — the PII (L313) detected and redacted (L313), the records (L322) kept (L371).
- **Anything AI (L313).** The PII (L313) out of the prompts and the logs (L313) — the discipline (L313) at each exit (L312).

The through-line: **the discipline is the PII's boundary** — the detect, the redact, the minimize (L313).

## 6. Interview Explanation

Say it in four moves:

1. **The entities.** "The names, the emails, the SSNs (L313)."
2. **The detection.** "The recognizers — the patterns and the ML models (L313)."
3. **The redaction.** "The masking and the blocking (L313)."
4. **The minimization.** "The least PII in the flow (L312)."

## 7. Senior-Level Insights

- **The redaction is the exit's guard (L313).** The prompt (L312), the log (L329), and the training (L365) — the PII (L313) redacted at each (L313).
- **The minimization is the first line (L312).** The PII not collected (L313) — the data not leaked (L312) — the L312 principle (L312), PII-shaped (L313).
- **The recognizers are the coverage (L313).** The patterns (L313) and the ML (L313) — the coverage (L313) is the recognizers' (L313).
- **The masked value is the flow's shape (L313).** The `***` (L313) — the flow (L313) keeps its shape (L313) without the value (L313).
- **The compliance is the record (L371).** The GDPR (L371) — the PII (L313) redacted and the consent (L312) recorded (L322).

## 8. Common Mistakes

- **The raw prompt (L312).** The PII (L313) to the provider (L278) — the redaction (L313) before the exit (L312).
- **The raw logs (L329).** The PII (L313) in the records (L329) — the redaction (L313) before the write (L329).
- **The recognizers' gap (L313).** The names (L313) un-detected (L313) — the ML recognizers (L313) added (L313).
- **The collection-first (L313).** The PII collected (L313) without the need (L313) — the minimization (L312) first (L313).
- **The masked-then-revealed (L313).** The PII (L313) redacted in the prompt (L312) but logged raw (L329) — the discipline (L313) at every exit (L312).

## 9. Best Practices

- **Minimize the collection** (L312) — the least PII (L313).
- **Detect at the boundary** (L313) — the recognizers (L313) before the exit (L312).
- **Redact at every exit** (L313) — the prompt (L312), the log (L329), the training (L365).
- **Test the recognizers** (L341) — the PII set (L342) in the eval (L341).
- **Record the compliance** (L322) — the GDPR (L371) evidence (L322).

## 10. Interview Questions

**Q: Walk me through the PII discipline.**
> A: The detect, the redact, the minimize (L313). The entities — the names, the emails, the SSNs (L313). The detection — the recognizers: the patterns and the ML models (L313). The redaction — the masking and the blocking (L313). And the minimization — the least PII in the flow (L312).

**Q: Where do you redact?**
> A: At the exits (L312): before the prompt (L312) — the provider (L278) sees the masked (L313); before the log (L329) — the record (L329) holds the masked (L313); and before the training (L365) — the model (L365) learns the masked (L313). The discipline (L313) at every exit (L312).

**Q: How do you detect the PII?**
> A: The recognizers (L313): the pattern matching (L313) for the structured entities — the emails, the SSNs, the phone numbers (L313); and the ML models (L313) for the unstructured — the names and the addresses (L313). The coverage (L313) is the recognizers' (L313).

**Q: What's the minimization?**
> A: The first line (L312): the PII not collected (L313) is the PII not leaked (L312). The prompt (L312) asks for the least (L313), the flow (L173) keeps the least (L313) — and the redaction (L313) is the last line (L313).

## 11. Follow-Up Questions

- What are the entities (L313)?
- What's the detection (L313)?
- What's the redaction (L313)?
- Where do you redact (L313)?
- What's the minimization (L312)?

## 12. Comparison Table — The Redaction Modes

| | The masking (L313) | The blocking (L313) |
|---|---|---|
| The result (L313) | the value replaced (L313) | the entity removed (L313) |
| The flow (L313) | the shape kept (L313) | the content dropped (L313) |
| The use (L313) | the prompts (L312), the logs (L329) | the high-risk entities (L313) |

The senior read: **the mask for the flow, the block for the risk** (L313).

## 13. Code Example — The Discipline, Applied

```js
// The PII discipline (L313) — the detect, the redact (L313).
// 1 · THE DETECTION (L313) — the recognizers (L313).
const entities = await pii.detect(prompt, {
  recognizers: [
    { type: 'EMAIL', pattern: EMAIL_RE },      // the pattern (L313)
    { type: 'SSN',   pattern: SSN_RE },        // the pattern (L313)
    { type: 'NAME',  model: 'presidio-name' }, // the ML (L313)
  ],
});

// 2 · THE REDACTION (L313) — the masking and the blocking (L313).
const redacted = pii.redact(prompt, entities, {
  mode: 'mask',                                // the mask (L313)
  mask: (type) => (type === 'SSN' ? 'BLOCK' : `***`),  // the SSN blocked (L313)
});

// 3 · THE EXITS (L312) — the redacted everywhere (L313).
await model.invoke(redacted);                  // the prompt (L312)
logger.info({ prompt: redacted });             // the log (L329)
// the training dataset (L365) — the redacted only (L313)

// 4 · THE MINIMIZATION (L312) — the least PII collected (L313).
//   the form asks for the email only — not the SSN (L313)
```

```text
What the reader must SEE — the discipline, applied:

  pii.detect + recognizers   → the detection (L313)
  mode: mask + SSN blocked   → the redaction (L313)
  the redacted in the prompt, the log, the training → every exit (L312)
  the form asks the least     → the minimization (L312)

  The detect, the redact, the minimize (L313).
```

```narrate
4-10: The detection — the pattern recognizers and the ML model find the entities (L313).
12-16: The redaction — the masking, with the SSN blocked (L313).
18-21: The exits — the redacted text goes to the prompt, the log, and the training (L312, L329).
23-24: The minimization — the least PII collected (L312, L313).
```

> [!TIP]
> The pair that defines the discipline: **the recognizers** (the detection, L313) and **the mask at every exit** (the redaction, L312). **Minimize the collection, detect the entities, redact at every exit — the PII's boundary (L313).**

## 14. Performance Notes

- **The detection is the latency's cost (L313).** The recognizers (L313) — the milliseconds (L313) before the exit (L312).
- **The redaction is the flow's cost (L313).** The mask (L313) — the negligible (L313) cost (L313).
- **The minimization is the cost's lever (L312).** The least PII (L312) — the fewer tokens (L332), the lower the cost (L334) (L313).
- **The compliance is the record's cost (L322).** The GDPR (L371) — the records (L322) for the audit (L322).

## 15. Debugging Scenarios

| Symptom | First check (L313) | The lever |
|---|---|---|
| The email is in the response | The prompt (L312) | The redaction (L313) |
| The SSN is in the logs | The log (L329) | The block (L313) |
| The name slips through | The recognizers (L313) | The ML model (L313) |
| The form collects too much | The collection (L312) | The minimization (L312) |
| The masked leaks raw | The exits (L312) | The discipline at each (L313) |

## 16. Quick Revision Notes

- The PII = **the data at risk** (L313): the entities, the detection, the redaction, the minimization.
- The entities: **the names, the emails, the SSNs** (L313).
- The detection: **the recognizers — the patterns and the ML** (L313).
- The redaction: **the masking and the blocking** (L313).
- The minimization: **the least PII (L312) — the first line** (L313).

## 17. Cheat Sheet

```text
SENSITIVE DATA & PII = the detect, the redact, the minimize

THE ENTITIES (L313)
  the names (L313) · the emails (L313) · the phones (L313)
  the SSNs (L313) · the addresses (L313)

THE DETECTION (L313)
  the pattern matching (L313) — the emails, the SSNs (L313)
  the ML models (L313) — the names, the addresses (L313)

THE REDACTION (L313)
  the masking (L313) — the value replaced (L313)
  the blocking (L313) — the entity removed (L313)
  at every exit (L312): the prompt (L312), the log (L329),
  the training (L365)

THE MINIMIZATION (L312)
  the least PII in the flow (L312)
  the data not collected (L313) is the data not leaked (L312)

INTERVIEW, 4 MOVES
  1 entities  "the names, the emails, the SSNs (L313)"
  2 detection "the recognizers — the patterns and the ML (L313)"
  3 redaction "the masking and the blocking (L313)"
  4 minimize  "the least PII, the first line (L312)"
```

## 18. Key Takeaways

> [!RECAP]
> - The sensitive data & PII discipline **detects, redacts, and minimises the PII in the AI flows** (L313): the entities (L313), the detection (L313), the redaction (L313), and the minimization (L312)
> - **The entities** (L313): the names, the emails, the phone numbers, the SSNs, the addresses (L313)
> - **The detection** (L313): the recognizers (L313) — the pattern matching (L313) for the structured entities, the ML models (L313) for the unstructured (L313)
> - **The redaction** (L313): the masking (L313) — the value replaced (L313) — and the blocking (L313) — the entity removed (L313) — at every exit (L312): the prompt (L312), the log (L329), the training (L365)
> - **The minimization** (L312): the least PII (L312) in the flow (L313) — the first line (L313); the redaction (L313) is the last (L313)
> - The AI shape (L313): the prompts (L312) and the logs (L329) — the PII (L313) detected (L313) and redacted (L313) before the exits (L312) — the discipline (L313) at each boundary (L312)

## Check your understanding

Answer these without looking back.

1. What are the entities (L313)?
2. What's the detection (L313)?
3. What's the redaction (L313)?
4. Where do you redact (L313)?
5. What's the minimization (L312)?
6. What's the masking vs the blocking (L313)?
7. What's the compliance (L371)?
8. What is the PII's boundary (L313)?

## A Closing Note — The Jewels, Replaced

You now hold the discipline: **the entities, the detection, the redaction, and the minimization — with the replicas at the gates.** The labeled jewels stay in the castle — and the replicas go out (L313).

Next: the agent that can do too much — Excessive Agency (L314).
