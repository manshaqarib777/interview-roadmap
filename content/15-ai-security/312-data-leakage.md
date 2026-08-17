# Lesson 312 — Data Leakage

**Interview importance:** ⭐⭐⭐⭐⭐ — "your data leaving through prompts, logs, or training" — the answer is *the leakage*: the data's exit paths and the controls (L312).**

L313 will build the PII discipline; this lesson is **the exit paths**: the data leakage — your data leaving through the prompts, the logs, or the training (L312): the paths (the prompts to the provider L312, the logs L329, the training L365), the exposure (the PII L313, the proprietary data L312), and the controls (the redaction L313, the masking L312, the retention L312). The AI shape (L173): the model calls (L278) and the logs (L329) — the data's exit (L312). This lesson is the data's boundary (L312).

The distinction this lesson is built on: a **demo** sends everything. A **solutions architect** maps the exits (L312): the prompts (L312), the logs (L329), and the training (L365) — with the controls at each (L312).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the paths: the prompts, the logs, the training (L312)
- Explain the exposure: the PII and the proprietary data (L312)
- Explain the controls: the redaction, the masking, the retention (L312)
- Explain the boundary: the data's allowed exits (L312)
- Explain the AI shape: the data's exit map (L312)

## 1. One-Line Definition

**The data leakage is your data leaving through the prompts, the logs, or the training (L312) — the paths (the prompts: the data sent to the provider L278; the logs: the data written to the records L329; the training: the data used for the fine-tuning L365, L312), the exposure (the PII L313 and the proprietary data L312), and the controls (the redaction L313, the masking L312, and the retention L322, L312) — the data's boundary (L312).**

The one-sentence interview answer: *"The data leakage is the data's unintended exit (L312). The paths (L312): the prompts (L312) — the data sent to the provider (L278) in the model call (L312); the logs (L329) — the data written to the records (L329) by the observability (L274); and the training (L365) — the data used for the fine-tuning (L365) or the eval (L341). The exposure (L312): the PII (L313) — the names and the emails (L313); and the proprietary data (L312) — the code, the documents, the strategy (L312). The controls (L312): the redaction (L313) — the PII (L313) removed before the send (L312); the masking (L312) — the sensitive values (L312) masked in the logs (L329); and the retention (L322) — the records (L322) kept only as long as needed (L312). The AI shape (L173): the boundary (L312): what goes to the model (L312), what goes to the logs (L329), and what goes to the training (L365) — each path (L312) controlled (L312). The demo sends everything; the architect maps the exits (L312)."*

## 2. Mental Model

Think of the data leakage as **the castle's water pipes.** The castle (the AI app, L173) holds the treasures (the data, L312): the gold (the proprietary data, L312) and the jewels (the PII, L313). The pipes (the exits, L312) lead out (L312): the messenger pipe (the prompts, L312) — the data sent to the ally (the provider, L278); the scribe's pipe (the logs, L329) — the data written to the records (L329); and the forge pipe (the training, L365) — the data used for the new weapons (the fine-tuning, L365). The leak (L312): the treasure (L312) flows out through the unguarded pipes (L312). The defense (L312): the guards at each pipe (L312) — the redaction (L313) before the messenger (L312), the masking (L312) before the scribe (L329), and the retention (L322) for the records (L312). The castle works because the pipes are mapped, and the guards are at each (L312).

```text
   the castle (the AI app, L173)
   ┌────────────────────────────────────────────────────────┐
   │ the treasures (the data, L312) — the gold (L312), the  │
   │ jewels (the PII, L313)                                 │
   │ the pipes (the exits, L312): the messenger (the        │
   │ prompts, L312), the scribe (the logs, L329), the forge │
   │ (the training, L365)                                   │
   │ the guards (the controls, L312) — at each pipe (L312)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the castle**: the treasures, the pipes, and the guards (L312).

## 3. Visual Flow — The Data's Exits

```text
   the data (L312)
        │
        ├──────────────► THE PROMPTS (L312)
        │                the model call (L278) — the provider sees it (L312)
        │                the control: the redaction (L313)
        │
        ├──────────────► THE LOGS (L329)
        │                the records (L329) — the observability (L274)
        │                the control: the masking (L312)
        │
        └──────────────► THE TRAINING (L365)
                         the fine-tuning (L365) — the data persists (L312)
                         the control: the retention (L322), the consent (L312)
```

The flow is the exits: **prompts → logs → training**, each guarded (L312).

## 4. How It Works — The Boundary, Part by Part

- **The prompts (L312).** The data sent to the provider (L278) in the model call (L312): the PII (L313) and the proprietary data (L312) — redacted (L313) before the send (L312).
- **The logs (L329).** The data written to the records (L329) by the observability (L274): the prompts and the outputs (L329) — the sensitive values (L312) masked (L312).
- **The training (L365).** The data used for the fine-tuning (L365) or the eval (L341): the data persists (L312) in the model (L365) — the consent (L312) and the retention (L322) applied (L312).
- **The controls (L312).** The redaction (L313), the masking (L312), and the retention (L322) — the guard at each pipe (L312).

> [!NOTE]
> **The leakage is the boundary's absence (L312).** The senior answer maps the boundary (L312): what the data's allowed exits (L312) are — the minimal prompt (L312), the redacted logs (L329), the consented training (L365) — and what they're not (L312): the full prompt to the provider (L312), the raw logs (L329), the unconsented training (L365). The L172 baseline (L172) — the client never trusted (L172) — extends to the data (L312): the data minimized (L312) at each exit (L312).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The boundary (L312): the minimal prompts (L312), the masked logs (L329), the consented training (L365).
- **A RAG platform (L280).** The documents (L316) to the model (L278) — the minimal chunks (L312), the redacted PII (L313).
- **A regulated workload (L371).** The GDPR (L371): the data's exits (L312) mapped (L371), the consent (L312) recorded (L322).
- **An observability pipeline (L274).** The logs (L329) — the masking (L312) before the write (L329).
- **Anything AI (L312).** The exits mapped (L312) — the prompts, the logs, the training (L312).

The through-line: **the boundary is the data's map** — the exits controlled (L312).

## 6. Interview Explanation

Say it in four moves:

1. **The paths.** "The prompts (L312), the logs (L329), the training (L365)."
2. **The exposure.** "The PII (L313) and the proprietary data (L312)."
3. **The controls.** "The redaction (L313), the masking (L312), the retention (L322)."
4. **The boundary.** "What the data's allowed exits are (L312)."

## 7. Senior-Level Insights

- **The prompt is the provider's view (L312).** The data sent to the model (L278) — the provider (L278) sees it (L312) — the minimal prompt (L312) and the redaction (L313) are the controls (L312).
- **The log is the persistent copy (L329).** The data written (L329) — the records (L322) persist (L312) — the masking (L312) and the retention (L322) are the controls (L312).
- **The training is the deepest persistence (L365).** The fine-tuned model (L365) contains the data (L312) — the consent (L312) and the deletion (L365) are the controls (L312).
- **The minimization is the principle (L312).** The least data (L312) at each exit (L312) — the L172 baseline (L172), data-shaped (L312).
- **The audit is the record (L322).** The exits (L312) and the consent (L312) — the audit (L322) records the data's path (L312).

## 8. Common Mistakes

- **The full prompt (L312).** The entire document (L316) to the provider (L278) — the minimal chunks (L312) are the prompt's (L312).
- **The raw logs (L329).** The prompts and the outputs (L329) in the records (L329) — the masking (L312) and the redaction (L313) before the write (L329).
- **The training without the consent (L365).** The user data (L312) in the fine-tuning (L365) — the consent (L312) is the boundary (L312).
- **The retention forever (L322).** The logs (L329) kept indefinitely (L322) — the retention (L322) is the control (L312).
- **The exits unmapped (L312).** The unknown pipe (L312) — the map (L312) first (L312).

## 9. Best Practices

- **Minimize the prompts** (L312) — the least data (L312) to the provider (L278).
- **Mask the logs** (L312) — the sensitive values (L312) before the write (L329).
- **Consent the training** (L312) — the user's data (L312) with the consent (L312).
- **Retain with the limit** (L322) — the records (L322) as long as needed (L312).
- **Map the exits** (L312) — the prompts, the logs, the training (L312).

## 10. Interview Questions

**Q: Walk me through the data leakage.**
> A: The data's unintended exits (L312). The paths — the prompts (L312), the logs (L329), the training (L365). The exposure — the PII (L313) and the proprietary data (L312). And the controls — the redaction (L313), the masking (L312), the retention (L322).

**Q: Where does the data leak?**
> A: Three paths (L312): the prompts — the data sent to the provider (L278) in the model call (L312); the logs — the data written to the records (L329) by the observability (L274); and the training — the data used for the fine-tuning (L365). Each path (L312) needs its control (L312).

**Q: How do you control the prompt path?**
> A: The minimization and the redaction (L312): the least data (L312) in the prompt (L312) — the minimal chunks (L312) for the RAG (L280) — and the PII (L313) redacted (L313) before the send (L312). The provider (L278) sees only what's needed (L312).

**Q: What about the logs?**
> A: The masking (L312): the sensitive values (L312) masked before the write (L329) — the prompt's PII (L313) redacted (L313), the API keys (L275) masked (L312) — and the retention (L322) limiting how long the records (L322) persist (L312).

## 11. Follow-Up Questions

- What are the paths (L312)?
- What's the exposure (L312)?
- How do you control the prompts (L312)?
- How do you control the logs (L329)?
- What about the training (L365)?

## 12. Comparison Table — The Three Exits

| Path (L312) | The exposure (L312) | The control (L312) |
|---|---|---|
| The prompts (L312) | the provider sees it (L278) | the minimization, the redaction (L313) |
| The logs (L329) | the records persist (L322) | the masking, the retention (L322) |
| The training (L365) | the model contains it (L365) | the consent, the deletion (L365) |

The senior read: **each exit has its control** — the boundary mapped (L312).

## 13. Code Example — The Boundary, Applied

```js
// The data boundary (L312) — the exits controlled (L312).
// 1 · THE PROMPT PATH (L312) — the minimization and the redaction (L312).
async function callModelWithBoundary(doc) {
  const minimal = extractMinimal(doc);          // the least data (L312)
  const redacted = redactPii(minimal);          // the PII removed (L313)
  return model.invoke(redacted);                // the provider sees less (L278)
}

// 2 · THE LOG PATH (L329) — the masking (L312).
function logCall(req) {
  logger.info({
    promptHash: hash(req.prompt),               // the hash, not the prompt (L329)
    maskedKey: mask(req.apiKey),                // the mask (L312)
    tokens: req.usage,
  });
}

// 3 · THE TRAINING PATH (L365) — the consent (L312).
async function fineTune(dataset) {
  const consented = dataset.filter((d) => d.consent);   // the consent (L312)
  return train(consented);                      // the data persists (L365)
}

// 4 · THE RETENTION (L322) — the records as long as needed (L312).
const retention = { logs: '30d', audit: '1y' };         // L322
```

```text
What the reader must SEE — the boundary, applied:

  extractMinimal + redactPii → the prompt's control (L312, L313)
  promptHash + mask         → the log's control (L329, L312)
  filter(consent)           → the training's control (L365, L312)
  retention: 30d / 1y       → the records' limit (L322)

  The prompts minimized, the logs masked, the training consented (L312).
```

```narrate
4-8: The prompt path — the minimal data, the PII redacted before the provider (L312, L313).
10-16: The log path — the hash and the mask instead of the raw values (L329, L312).
18-21: The training path — only the consented data fine-tunes (L365, L312).
23-24: The retention — the records kept as long as needed (L322, L312).
```

> [!TIP]
> The pair that defines the boundary: **the redacted prompt** (the provider's view, L312) and **the masked log** (the persistent copy, L329). **Minimize the prompts, mask the logs, consent the training — the data's boundary (L312).**

## 14. Performance Notes

- **The minimization is the cost's lever (L312).** The minimal prompt (L312) — the fewer tokens (L332), the lower the cost (L334) (L312).
- **The masking is the log's latency (L312).** The mask (L312) before the write (L329) — the negligible (L312) cost (L312).
- **The retention is the storage's cost (L322).** The records (L322) — the shorter retention (L322), the smaller bill (L312).
- **The redaction is the pipeline's cost (L313).** The PII detection (L313) — the milliseconds (L312) for the boundary (L312).

## 15. Debugging Scenarios

| Symptom | First check (L312) | The lever |
|---|---|---|
| The PII is in the response | The prompt (L312) | The redaction (L313) |
| The secrets are in the logs | The log (L329) | The masking (L312) |
| The user's data is in the model | The training (L365) | The consent (L312) |
| The logs grow forever | The retention (L322) | The limit (L322) |
| The leak is unknown | The map (L312) | The exits mapped (L312) |

## 16. Quick Revision Notes

- The data leakage = **the data's exits** (L312): the prompts, the logs, the training.
- The prompts: **the data to the provider (L278) — the minimization, the redaction (L313)**.
- The logs: **the data to the records (L329) — the masking, the retention (L322)**.
- The training: **the data to the model (L365) — the consent, the deletion (L365)**.
- The boundary: **what the data's allowed exits are (L312)**.

## 17. Cheat Sheet

```text
DATA LEAKAGE = your data leaving through prompts, logs, or training

THE PATHS (L312)
  the prompts (L312) — the data to the provider (L278)
  the logs (L329) — the data to the records (L329)
  the training (L365) — the data to the model (L365)

THE EXPOSURE (L312)
  the PII (L313) — the names, the emails (L313)
  the proprietary data (L312) — the code, the documents (L312)

THE CONTROLS (L312)
  the prompts: the minimization (L312), the redaction (L313)
  the logs: the masking (L312), the retention (L322)
  the training: the consent (L312), the deletion (L365)

THE PRINCIPLE (L312)
  the L172 baseline (L172) — the client never trusted (L172)
  the data minimized at each exit (L312)

INTERVIEW, 4 MOVES
  1 paths    "the prompts, the logs, the training (L312)"
  2 exposure "the PII and the proprietary data (L312)"
  3 controls "the redaction, the masking, the retention (L312)"
  4 boundary "what the data's allowed exits are (L312)"
```

## 18. Key Takeaways

> [!RECAP]
> - The data leakage is **your data leaving through the prompts, the logs, or the training** (L312): the paths (L312), the exposure (L312), and the controls (L312)
> - **The paths** (L312): the prompts (L312) — the data sent to the provider (L278); the logs (L329) — the data written to the records (L329); and the training (L365) — the data used for the fine-tuning (L365)
> - **The exposure** (L312): the PII (L313) — the names and the emails (L313); and the proprietary data (L312) — the code, the documents, the strategy (L312)
> - **The controls** (L312): the redaction (L313) before the prompt (L312), the masking (L312) before the log (L329), and the consent (L312) and the retention (L322) for the training (L365) and the records (L322)
> - **The boundary** (L312): what the data's allowed exits are (L312) — the minimal prompt (L312), the masked logs (L329), the consented training (L365)
> - The principle (L312): the L172 baseline (L172) — the client never trusted (L172) — extended to the data (L312): the data minimized (L312) at each exit (L312)

## Check your understanding

Answer these without looking back.

1. What are the paths (L312)?
2. What's the exposure (L312)?
3. How do you control the prompts (L312)?
4. How do you control the logs (L329)?
5. What about the training (L365)?
6. What's the boundary (L312)?
7. What's the retention (L322)?
8. What is the data's exit map (L312)?

## A Closing Note — The Pipes, Guarded

You now hold the boundary: **the prompts, the logs, and the training — with a guard at each pipe.** The treasure stays in the castle — and the pipes are mapped (L312).

Next: detecting, redacting, and minimising the PII — Sensitive Data & PII (L313).
