# Lesson 372 — Data Governance

**Interview importance:** ⭐⭐⭐⭐⭐ — "where data comes from, where it goes, and who decides" — the answer is *the governance*: the lineage, the quality, and the ownership (L372).**

L371 built the compliance; this lesson is **the data's rulebook**: the data governance — where the data comes from, where it goes, and who decides (L372): the lineage (the data's path, L372), the quality (the data's fitness, L372), and the ownership (who decides, L372). The AI shape (L173): the enterprise (L380) — the data (L313) governed (L372). This lesson is the data's rulebook (L372).

The distinction this lesson is built on: a **junior** uses the data. A **solutions architect** governs it (L372): the lineage (L372), the quality (L372), and the ownership (L372) — because the AI (L173) is the data's (L372) product (L372).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the lineage: the data's path (L372)
- Explain the quality: the data's fitness (L372)
- Explain the ownership: who decides (L372)
- Explain the AI's data: the training, the RAG, the prompts (L372)
- Explain the AI shape: the data's rulebook (L372)

## 1. One-Line Definition

**The data governance is where the data comes from, where it goes, and who decides (L372) — the lineage (the data's path: the source L372, the transformations L372, the destinations L372), the quality (the data's fitness: the completeness L372, the accuracy L372, the freshness L335, L372), and the ownership (who decides: the data owner L372, the steward L372, the access L262, L372) — the enterprise's (L380) data (L372), governed (L372).**

The one-sentence interview answer: *"The data governance is the data's rulebook (L372). The lineage (L372): the data's path (L372) — the source (L372): where it comes from (L372); the transformations (L372): what happens to it (L372); and the destinations (L372): where it goes (L372) — the RAG (L349), the training (L365), the analytics (L372). The quality (L372): the data's fitness (L372) — the completeness (L372), the accuracy (L372), and the freshness (L335) — the golden set's (L342) quality (L372). The ownership (L372): who decides (L372) — the data owner (L372): the business (L360) accountable (L372); the steward (L372): the day-to-day (L372); and the access (L262): the least privilege (L314). The AI's data (L372): the training (L365) — the consent (L312) and the provenance (L372); the RAG (L349) — the sources (L316) and the quality (L338); and the prompts (L312) — the PII (L313) and the retention (L322). The AI shape (L173): the enterprise (L380) — the data (L313) governed (L372): the lineage (L372), the quality (L372), and the ownership (L372) — the AI's (L173) data (L372), rulebook'd (L372)."*

## 2. Mental Model

Think of the data governance as **the library's collection policy.** The policy (the governance, L372) governs the books (the data, L313): the provenance (the lineage, L372) — where each book (L372) came from (the source, L372) and where it's shelved (the destination, L372); the condition (the quality, L372) — the pages (the completeness, L372) and the printings (the freshness, L335); and the curators (the ownership, L372) — who decides (L372) what's acquired (L372) and who may borrow (the access, L262). The library works because the provenance is recorded, the condition is checked, and the curators decide (L372).

```text
   the collection policy (the governance, L372)
   ┌────────────────────────────────────────────────────────┐
   │ the provenance (the lineage, L372) — the sources, the  │
   │ shelves (L372)                                         │
   │ the condition (the quality, L372) — the pages, the     │
   │ printings (L335)                                       │
   │ the curators (the ownership, L372) — the access        │
   │ (L262)                                                 │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the collection policy**: the provenance, the condition, and the curators (L372).

## 3. Visual Flow — One Dataset's Life

```text
   the source (L372)
        │  e.g. the help center (L265)
        ▼
   ┌────────────────────── THE LINEAGE (L372) ──────────────────────────┐
   │  the transformations (L372): the parse (L177), the chunk (L178)   │
   │  the destinations (L372): the RAG (L349), the training (L365)     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE QUALITY (L372) ──────────────────────────┐
   │  the completeness (L372) · the accuracy (L372) · the freshness    │
   │  (L335) — the golden set (L342)                                   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE OWNERSHIP (L372) ────────────────────────┐
   │  the data owner (L372) · the steward (L372) · the access (L262)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the dataset: **source → lineage → quality → ownership** (L372).

## 4. How It Works — The Rulebook, Part by Part

- **The lineage (L372).** The data's path (L372): the source (L372), the transformations (L372), the destinations (L372).
- **The quality (L372).** The data's fitness (L372): the completeness (L372), the accuracy (L372), the freshness (L335).
- **The ownership (L372).** Who decides (L372): the data owner (L372), the steward (L372), the access (L262).
- **The AI's data (L372).** The training (L365), the RAG (L349), the prompts (L312).

> [!NOTE]
> **The AI is the data's product (L372).** The senior answer states the dependency (L372): the AI's (L173) quality (L341) is the data's (L372) quality (L372) — the golden set (L342) is the data's (L372) quality gate (L372); the RAG's (L349) retrieval (L338) is the data's (L372) fitness (L372); and the training's (L365) output is the data's (L372) provenance (L372). The governance (L372) — the lineage (L372), the quality (L372), and the ownership (L372) — is the AI's (L173) foundation (L372).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The data (L313) governed (L372) — the lineage (L372) and the ownership (L372).
- **A RAG platform (L349).** The sources (L316) — the lineage (L372) and the quality (L338).
- **A training pipeline (L365).** The dataset (L372) — the provenance (L372) and the consent (L312).
- **A regulated AI (L371).** The GDPR (L371) — the lineage (L372) and the deletion (L312).
- **Anything enterprise (L380).** The rulebook (L372) — the lineage, the quality, the ownership (L372).

The through-line: **the rulebook is the data's** — the lineage, the quality, and the ownership (L372).

## 6. Interview Explanation

Say it in four moves:

1. **The lineage.** "The data's path — the source, the transformations, the destinations (L372)."
2. **The quality.** "The completeness, the accuracy, the freshness (L372)."
3. **The ownership.** "Who decides — the owner, the steward, the access (L372)."
4. **The AI's.** "The training (L365), the RAG (L349), the prompts (L312)."

## 7. Senior-Level Insights

- **The lineage is the trust (L372).** The data's path (L372) — the provenance (L372) — the audit's (L322) and the compliance's (L371) evidence (L372).
- **The quality is the AI's (L372).** The golden set (L342) — the retrieval (L338) and the groundedness (L337) — the data's (L372) fitness (L372).
- **The ownership is the accountability (L372).** The data owner (L372) — the business (L360) decides (L372) — the steward (L372) maintains (L372).
- **The access is the least privilege (L262).** The data (L313) — the L262 scope (L262) — the isolation (L320), data-shaped (L372).
- **The consent is the training's (L312).** The user's (L162) data (L313) — the training (L365) — the consent (L312) and the provenance (L372).

## 8. Common Mistakes

- **The un-governed data (L372).** The data (L313) used (L372) without the lineage (L372) — the provenance (L372) unknown (L372).
- **The quality-blind (L372).** The golden set (L342) without the quality (L372) — the retrieval (L338) and the groundedness (L337) suffer (L372).
- **The owner-less (L372).** The data (L313) without the owner (L372) — the decisions (L372) unmade (L372).
- **The wide access (L262).** The data (L313) open (L262) — the isolation (L320) — the least privilege (L314).
- **The consent-less training (L365).** The user's (L162) data (L313) fine-tuned (L365) — the consent (L312) missing (L372).

## 9. Best Practices

- **Record the lineage** (L372) — the source, the transformations, the destinations (L372).
- **Measure the quality** (L372) — the completeness, the accuracy, the freshness (L335).
- **Assign the ownership** (L372) — the owner (L372) and the steward (L372).
- **Scope the access** (L262) — the least privilege (L314).
- **Consent the training** (L312) — the provenance (L372).

## 10. Interview Questions

**Q: Walk me through the data governance.**
> A: The data's rulebook (L372). The lineage — the source, the transformations, the destinations (L372). The quality — the completeness, the accuracy, the freshness (L372). The ownership — who decides (L372). And the AI's — the training (L365), the RAG (L349), the prompts (L312).

**Q: What's the lineage?**
> A: The data's path (L372): the source (L372) — where it comes from; the transformations (L372) — the parse (L177), the chunk (L178), the embed (L181); and the destinations (L372) — the RAG (L349), the training (L365), the analytics (L372). The lineage (L372) is the provenance (L372) — the audit's (L322) and the compliance's (L371) evidence (L372).

**Q: How does the data's quality affect the AI?**
> A: Directly (L372): the AI's (L173) quality (L341) is the data's (L372) quality (L372) — the golden set (L342) built from the governed (L372) data (L372); the retrieval (L338) and the groundedness (L337) on the quality (L372); and the training's (L365) output on the data's (L372) fitness (L372). The governance (L372) is the AI's (L173) foundation (L372).

**Q: Who decides?**
> A: The ownership (L372): the data owner (L372) — the business (L360) accountable for the data's (L313) use (L372); the steward (L372) — the day-to-day quality (L372); and the access (L262) — the least privilege (L314) on the data (L313). The decisions (L372) — what's collected (L372), what's used (L372), what's deleted (L312) — made (L372).

## 11. Follow-Up Questions

- What's the lineage (L372)?
- How does the data's quality affect the AI (L372)?
- Who decides (L372)?
- What's the ownership (L372)?
- What's the consent (L312)?

## 12. Comparison Table — The Governed vs the Un-Governed

| | The un-governed (L372) | The governed (L372) |
|---|---|---|
| The lineage (L372) | unknown (L372) | the recorded path (L372) |
| The quality (L372) | the unknown (L372) | the measured (L372) |
| The ownership (L372) | the none (L372) | the owner (L372) |
| The access (L262) | the wide (L262) | the least privilege (L314) |
| The AI's (L372) | the garbage in (L372) | the golden set (L342) |

The senior read: **the right column is the AI's foundation** (L372).

## 13. Code Example — The Rulebook, Applied

```js
// The data governance (L372) — the lineage, the quality, the ownership (L372).
// 1 · THE LINEAGE (L372) — the data's path (L372).
const lineage = {
  dataset: 'help-center-docs',
  source:  's3://help-center/',               // the source (L372, L265)
  transforms: [
    { step: 'parse',   by: 'ingestion-worker' },   // L177
    { step: 'chunk',   by: 'ingestion-worker' },   // L178
    { step: 'embed',   by: 'embedding-job' },      // L181
  ],
  destinations: ['rag:help-base', 'analytics'],    // L349, L372
};

// 2 · THE QUALITY (L372) — the fitness (L372).
const quality = {
  completeness: 0.98,                       // the pages (L372)
  accuracy:     0.95,                        // the verified (L372)
  freshness:    'daily',                     // the update (L335)
};

// 3 · THE OWNERSHIP (L372) — who decides (L372).
const ownership = {
  owner:   'support-org',                    // the business (L360)
  steward: 'data-team',                      // the day-to-day (L372)
  access:  ['read:rag', 'write:ingestion'],  // the least privilege (L262)
};

// 4 · THE AUDIT (L322) — the lineage recorded (L372).
await audit.log({ dataset, lineage, quality, at: Date.now() });  // L322
```

```text
What the reader must SEE — the rulebook, applied:

  source + transforms + destinations → the lineage (L372)
  completeness + accuracy + freshness → the quality (L335)
  owner + steward + access            → the ownership (L262)
  audit.log the lineage               → the evidence (L322)

  The lineage, the quality, the ownership (L372).
```

```narrate
4-11: The lineage — the source, the transformations, and the destinations (L372).
13-17: The quality — the completeness, the accuracy, and the freshness (L372, L335).
19-24: The ownership — the owner, the steward, and the access (L372, L262).
26-27: The audit — the lineage recorded (L322, L372).
```

> [!TIP]
> The pair that defines the rulebook: **the recorded lineage** (the trust, L372) and **the measured quality** (the AI's foundation, L342). **Record the lineage, measure the quality, assign the ownership, scope the access — the data's rulebook (L372).**

## 14. Performance Notes

- **The lineage is the audit's (L372).** The recorded path (L372) — the compliance's (L371) evidence (L372).
- **The quality is the AI's (L372).** The golden set (L342) — the retrieval (L338) and the groundedness (L337) (L372).
- **The ownership is the decision's (L372).** The owner (L372) — the changes (L372) decided (L372).
- **The access is the security's (L262).** The least privilege (L314) — the isolation (L320), data-shaped (L372).

## 15. Debugging Scenarios

| Symptom | First check (L372) | The lever |
|---|---|---|
| The provenance is unknown | The lineage (L372) | The recorded path (L372) |
| The AI quality is poor | The data's quality (L372) | The golden set (L342) |
| The decisions are unmade | The ownership (L372) | The owner (L372) |
| The data is exposed | The access (L262) | The least privilege (L314) |
| The training is un-consented | The consent (L312) | The provenance (L372) |

## 16. Quick Revision Notes

- The data governance = **the data's rulebook** (L372): the lineage, the quality, the ownership.
- The lineage: **the source, the transformations, the destinations (L372)**.
- The quality: **the completeness, the accuracy, the freshness (L335)**.
- The ownership: **the owner (L372), the steward (L372), the access (L262)**.
- The AI's: **the training (L365), the RAG (L349), the prompts (L312)**.

## 17. Cheat Sheet

```text
DATA GOVERNANCE = where the data comes from, where it goes, who decides

THE LINEAGE (L372)
  the source (L372) · the transformations (L372) — the parse (L177),
  the chunk (L178), the embed (L181)
  the destinations (L372) — the RAG (L349), the training (L365),
  the analytics (L372)
  the provenance (L372) — the audit's (L322) evidence (L372)

THE QUALITY (L372)
  the completeness (L372) · the accuracy (L372)
  the freshness (L335) — the golden set's (L342) quality (L372)

THE OWNERSHIP (L372)
  the data owner (L372) — the business (L360) accountable (L372)
  the steward (L372) — the day-to-day (L372)
  the access (L262) — the least privilege (L314)

THE AI'S (L372)
  the training (L365) — the consent (L312), the provenance (L372)
  the RAG (L349) — the sources (L316), the quality (L338)
  the prompts (L312) — the PII (L313), the retention (L322)

INTERVIEW, 4 MOVES
  1 lineage  "the source, the transformations, the destinations (L372)"
  2 quality  "the completeness, the accuracy, the freshness (L372)"
  3 ownership "the owner, the steward, the access (L372)"
  4 the AI's "the training, the RAG, the prompts (L372)"
```

## 18. Key Takeaways

> [!RECAP]
> - The data governance is **where the data comes from, where it goes, and who decides** (L372): the lineage (L372), the quality (L372), the ownership (L372), and the AI's data (L372)
> - **The lineage** (L372): the data's path (L372) — the source (L372), the transformations (L372), and the destinations (L372) — the provenance (L372)
> - **The quality** (L372): the data's fitness (L372) — the completeness (L372), the accuracy (L372), and the freshness (L335)
> - **The ownership** (L372): who decides (L372) — the data owner (L372), the steward (L372), and the access (L262)
> - **The AI's data** (L372): the training (L365) — the consent (L312) and the provenance (L372); the RAG (L349) — the sources (L316) and the quality (L338); and the prompts (L312) — the PII (L313) and the retention (L322)
> - The principle (L372): the AI is the data's product (L372) — the governance (L372) is the AI's (L173) foundation (L372)

## Check your understanding

Answer these without looking back.

1. What's the lineage (L372)?
2. How does the data's quality affect the AI (L372)?
3. Who decides (L372)?
4. What's the ownership (L372)?
5. What's the consent (L312)?
6. What's the provenance (L372)?
7. What's the steward (L372)?
8. What is the data's rulebook (L372)?

## A Closing Note — The Policy, Posted

You now hold the rulebook: **the lineage, the quality, and the ownership — with the provenance recorded and the curators deciding.** The library's collection is governed — and every book has its path (L372).

Next: the policies, the review boards, and the accountability for the model behavior — AI Governance (L373).
