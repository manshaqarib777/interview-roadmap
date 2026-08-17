# Lesson 338 — Retrieval Evaluation

**Interview importance:** ⭐⭐⭐⭐⭐ — "precision, recall, and the golden query set" — the answer is *the retrieval eval*: the search's quality, measured (L338).**

L195 built the RAG evaluation (L195); this lesson is **the retrieval's half**: the retrieval evaluation — the precision, the recall, and the golden query set (L338): the measures (the precision, the recall, L338), the golden set (the queries and the relevant documents, L342), and the tuning (the chunking L178, the embeddings L181, the top-k L189). The AI shape (L173): the RAG (L280) — the retrieval's (L189) quality, measured (L338). This lesson is the search's quality (L338).

The distinction this lesson is built on: a **demo** reads the answers. A **solutions architect** measures the retrieval (L338): the precision (L338), the recall (L338), and the golden set (L342) — because the answer (L328) is only as good as the retrieval (L189).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the precision: the retrieved relevant (L338)
- Explain the recall: the relevant retrieved (L338)
- Explain the golden set: the queries and the relevant docs (L342)
- Explain the tuning: the chunking, the embeddings, the top-k (L338)
- Explain the AI shape: the retrieval's quality (L338)

## 1. One-Line Definition

**The retrieval evaluation measures the search's quality (L338) — the precision (the retrieved-and-relevant ÷ the retrieved: the search's accuracy, L338), the recall (the retrieved-and-relevant ÷ the relevant: the search's completeness, L338), and the golden set (the queries with the relevant documents, L342) — with the tuning (the chunking L178, the embeddings L181, the top-k L189, L338) — the answer's (L328) foundation, measured (L338).**

The one-sentence interview answer: *"The retrieval evaluation measures the search (L338). The measures (L338): the precision (L338) — of the retrieved (L189), how many are relevant (L338) — the search's accuracy (L338); the recall (L338) — of the relevant (L338), how many were retrieved (L338) — the search's completeness (L338); and the ranked measures (L338) — the MRR and the nDCG (L338) — the order's quality (L338). The golden set (L342): the queries (L338) with the relevant documents (L342) — the labeled ground truth (L342) — built from the analytics (L332) and the reviews (L341). The tuning (L338): the chunking (L178) — the chunk's size (L178); the embeddings (L181) — the model (L148); the top-k (L189) — the count (L189); and the hybrid search (L187) — the keyword plus the vector (L187). The AI shape (L173): the RAG (L280) — the retrieval's (L189) quality (L338): the precision (L338) and the recall (L338) on the golden set (L342) — the answer's (L328) foundation, measured (L338)."*

## 2. Mental Model

Think of the retrieval eval as **the library's book-finder test.** The librarian (the retrieval, L189) fetches the books (the chunks, L178) for the questions (the queries, L338). The test (the golden set, L342): the questions (L338) with the right books (the relevant, L342). The scoring (L338): the precision (L338) — of the books fetched (L189), how many were right (L338); the recall (L338) — of the right books (L342), how many were fetched (L338). The librarian (L338) tunes (L338): the shelf arrangement (the chunking, L178), the catalog (the embeddings, L181), and the armload (the top-k, L189). The library works because the finder is tested, and the tuning follows the scores (L338).

```text
   the finder test (the retrieval eval, L338)
   ┌────────────────────────────────────────────────────────┐
   │ the questions (the queries, L338) · the right books    │
   │ (the relevant, L342)                                   │
   │ the scoring (L338): the precision, the recall (L338)   │
   │ the tuning (L338): the chunks (L178), the embeddings   │
   │ (L181), the top-k (L189)                               │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the finder test**: the questions, the scoring, and the tuning (L338).

## 3. Visual Flow — One Retrieval Score

```text
   the query (L338)
        │
        ▼
   ┌────────────────────── THE RETRIEVAL (L189) ────────────────────────┐
   │  the top-5 chunks (L189) — the retrieved (L338)                   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE LABEL (L342) ────────────────────────────┐
   │  the relevant docs for the query (L342)                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCORE (L338) ────────────────────────────┐
   │  retrieved = 5 · relevant = 3 (L342)                              │
   │  retrieved-and-relevant = 2 (L338)                                │
   │  precision = 2/5 = 0.4 (L338) · recall = 2/3 = 0.67 (L338)       │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the score: **retrieve → label → score** (L338).

## 4. How It Works — The Measure, Part by Part

- **The precision (L338).** The retrieved-and-relevant ÷ the retrieved (L338): the search's accuracy (L338).
- **The recall (L338).** The retrieved-and-relevant ÷ the relevant (L338): the search's completeness (L338).
- **The golden set (L342).** The queries (L338) with the relevant documents (L342): the labeled ground truth (L342).
- **The tuning (L338).** The chunking (L178), the embeddings (L181), the top-k (L189), and the hybrid (L187) — the levers (L338).

> [!NOTE]
> **The precision and the recall trade (L338).** The senior answer names the trade (L338): the top-k (L189) up (L338) — the recall up (L338), the precision down (L338); the top-k (L189) down (L338) — the precision up (L338), the recall down (L338). The product's (L173) choice (L338): the search (L338) wants the precision (L338); the RAG (L280) wants the recall (L338) — the missing chunk (L338) is the ungrounded answer (L337). The trade (L338) is the top-k's (L189) tuning (L338).

## 5. Real Project Usage

- **A RAG platform (L280).** The retrieval's (L189) precision and recall (L338) — the golden set (L342) in the suite (L341).
- **A search product (L338).** The ranked measures (L338) — the MRR and the nDCG (L338).
- **A support copilot (L350).** The recall (L338) — the missing doc (L338) is the wrong answer (L337).
- **A multi-tenant SaaS (L357).** The per-tenant (L320) retrieval eval (L338) — the golden set (L342) per tenant (L320).
- **Anything RAG (L280).** The search's quality (L338) — measured (L338) and tuned (L338).

The through-line: **the measure is the search's** — the precision, the recall, and the golden set (L338).

## 6. Interview Explanation

Say it in four moves:

1. **The precision.** "Of the retrieved, how many are relevant (L338)."
2. **The recall.** "Of the relevant, how many were retrieved (L338)."
3. **The golden set.** "The queries with the relevant docs (L342)."
4. **The tuning.** "The chunking (L178), the embeddings (L181), the top-k (L189)."

## 7. Senior-Level Insights

- **The recall is the RAG's metric (L338).** The missing chunk (L338) — the ungrounded answer (L337) — the RAG (L280) optimizes the recall (L338).
- **The golden set is the truth (L342).** The queries (L338) and the relevant docs (L342) — the ground truth (L342) — the suite's (L341) foundation (L338).
- **The chunking is the recall's lever (L178).** The chunk's size (L178) — the small chunks (L178) miss (L338); the large (L178) dilute (L338) — the tuning (L178) is the recall's (L338).
- **The hybrid is the coverage (L187).** The keyword plus the vector (L187) — the exact terms (L187) and the semantics (L187) — the recall (L338) up (L338).
- **The regression is the suite's (L341).** The retrieval (L338) in the golden set (L342) — the CI (L296) gating (L341).

## 8. Common Mistakes

- **The answer-only review (L337).** The answers (L328) read (L337) — the retrieval (L189) unmeasured (L338) — the answer's foundation (L338) unknown (L338).
- **The precision only (L338).** The accuracy (L338) without the completeness (L338) — the recall (L338) is the RAG's (L338).
- **The golden set missing (L342).** The unlabeled queries (L338) — the ground truth (L342) absent (L338).
- **The top-k un-tuned (L189).** The fixed count (L189) — the trade (L338) un-chosen (L338).
- **The drift un-gated (L341).** The retrieval (L189) changed (L178) without the suite (L341) — the regression (L341) ships (L338).

## 9. Best Practices

- **Measure the precision and the recall** (L338) — both (L338).
- **Build the golden set** (L342) — the queries and the relevant docs (L342).
- **Tune the levers** (L338) — the chunking (L178), the embeddings (L181), the top-k (L189), the hybrid (L187).
- **Gate the suite** (L341) — the retrieval (L338) in the CI (L296).
- **Watch the drift** (L335) — the retrieval's (L189) quality over time (L338).

## 10. Interview Questions

**Q: Walk me through the retrieval evaluation.**
> A: The search's quality (L338). The precision — of the retrieved, how many are relevant (L338). The recall — of the relevant, how many were retrieved (L338). The golden set — the queries with the relevant docs (L342). And the tuning — the chunking (L178), the embeddings (L181), the top-k (L189).

**Q: What's the difference between the precision and the recall?**
> A: The question (L338): the precision (L338) asks "of what I retrieved, how much was right" — the accuracy (L338); the recall (L338) asks "of what was right, how much did I retrieve" — the completeness (L338). The RAG (L280) cares about the recall (L338) — the missing chunk (L338) is the ungrounded answer (L337).

**Q: How do you build the golden set?**
> A: The labeled queries (L342): the real queries (L332) from the analytics (L332) and the sampled reviews (L341) — each labeled (L342) with the relevant documents (L342) — the ground truth (L342). The set (L342) grows with the production (L307): the new queries (L332) added (L342).

**Q: How do you tune the retrieval?**
> A: The levers (L338): the chunking (L178) — the size and the overlap (L178); the embeddings (L181) — the model (L148); the top-k (L189) — the count, the precision-recall trade (L338); and the hybrid search (L187) — the keyword plus the vector (L187). Each lever (L338) measured (L338) on the golden set (L342).

## 11. Follow-Up Questions

- What's the precision (L338)?
- What's the recall (L338)?
- How do you build the golden set (L342)?
- How do you tune the retrieval (L338)?
- What's the trade (L338)?

## 12. Comparison Table — The Precision vs the Recall

| | The precision (L338) | The recall (L338) |
|---|---|---|
| The question (L338) | of the retrieved, how many are relevant (L338) | of the relevant, how many were retrieved (L338) |
| The measure (L338) | the accuracy (L338) | the completeness (L338) |
| The product (L338) | the search (L338) | the RAG (L280) |
| The lever (L338) | the top-k down (L189) | the top-k up (L189) |

The senior read: **the recall for the RAG, the precision for the search** — the trade tuned (L338).

## 13. Code Example — The Measure, Applied

```js
// The retrieval eval (L338) — the precision and the recall (L338).
// 1 · THE GOLDEN SET (L342) — the labeled queries (L342).
const goldenSet = [
  { query: 'refund policy', relevant: ['doc-12', 'doc-13'] },   // L342
  { query: 'shipping times', relevant: ['doc-4'] },             // L342
  // ... the ground truth (L342)
];

// 2 · THE EVAL (L338) — the scores (L338).
async function evaluateRetrieval(retriever) {
  let precisionSum = 0, recallSum = 0;

  for (const { query, relevant } of goldenSet) {
    const retrieved = await retriever(query, { topK: 5 });     // L189
    const retrievedIds = new Set(retrieved.map((c) => c.id));
    const relevantIds = new Set(relevant);

    const hit = [...retrievedIds].filter((id) => relevantIds.has(id)).length;  // L338
    const precision = hit / retrievedIds.size;       // the precision (L338)
    const recall = hit / relevantIds.size;           // the recall (L338)

    precisionSum += precision;
    recallSum += recall;
  }

  return {
    precision: precisionSum / goldenSet.length,     // L338
    recall: recallSum / goldenSet.length,           // L338
  };
}

// 3 · THE GATE (L341): recall >= 0.85 in the CI (L296).
// 4 · THE TUNING (L338): the chunking (L178), the embeddings (L181), the top-k (L189).
```

```text
What the reader must SEE — the measure, applied:

  goldenSet: query + relevant → the ground truth (L342)
  retriever(query, topK 5)    → the retrieved (L189)
  hit / retrieved             → the precision (L338)
  hit / relevant              → the recall (L338)
  recall >= 0.85 gate         → the suite (L341, L296)

  The precision, the recall, and the gate (L338).
```

```narrate
4-7: The golden set — the queries with their relevant documents (L342).
9-23: The eval — each query's retrieval scored for the precision and the recall (L338).
25-28: The averages — the set's mean scores (L338).
30-31: The gate and the tuning — the recall gated in the CI, the levers tuned (L341, L338).
```

> [!TIP]
> The pair that defines the eval: **the labeled golden set** (the truth, L342) and **the recall gate** (the RAG's metric, L341). **Label the queries, measure the precision and the recall, tune the levers, gate the suite — the search's quality (L338).**

## 14. Performance Notes

- **The eval is the suite's time (L338).** The golden set (L342) — the minutes (L338) in the CI (L296).
- **The retrieval is the answer's latency (L189).** The top-k (L189) and the index (L183) — the TTFT's (L145) part (L338).
- **The recall is the cost's lever (L338).** The top-k up (L189) — the tokens (L332) up (L338) — the context's (L191) cost (L334).
- **The drift is the watch's (L335).** The retrieval (L189) over time (L338) — the golden set (L342) re-run (L335).

## 15. Debugging Scenarios

| Symptom | First check (L338) | The lever |
|---|---|---|
| The answers are ungrounded | The recall (L338) | The top-k (L189), the chunking (L178) |
| The search is noisy | The precision (L338) | The top-k down (L189), the reranking (L190) |
| The golden set is stale | The queries (L342) | The new queries (L332) added (L342) |
| The regression ships | The gate (L341) | The suite (L341) in the CI (L296) |
| The drift is silent | The watch (L335) | The re-run (L335) |

## 16. Quick Revision Notes

- The retrieval eval = **the search's quality** (L338): the precision, the recall, the golden set, the tuning.
- The precision: **the retrieved-and-relevant ÷ the retrieved (L338)**.
- The recall: **the retrieved-and-relevant ÷ the relevant (L338)**.
- The golden set: **the queries with the relevant docs (L342)**.
- The tuning: **the chunking (L178), the embeddings (L181), the top-k (L189), the hybrid (L187)**.

## 17. Cheat Sheet

```text
RETRIEVAL EVALUATION = the search's quality, measured

THE PRECISION (L338)
  the retrieved-and-relevant ÷ the retrieved (L338)
  the search's accuracy (L338)

THE RECALL (L338)
  the retrieved-and-relevant ÷ the relevant (L338)
  the search's completeness (L338)
  the RAG's (L280) metric — the missing chunk (L338)
  is the ungrounded answer (L337)

THE GOLDEN SET (L342)
  the queries (L338) with the relevant documents (L342)
  the labeled ground truth (L342)
  from the analytics (L332) and the reviews (L341)

THE TUNING (L338)
  the chunking (L178) · the embeddings (L181)
  the top-k (L189) — the precision-recall trade (L338)
  the hybrid search (L187) — the keyword plus the vector (L187)

THE GATE (L341)
  the golden set (L342) in the CI (L296) — the regression (L341) caught

INTERVIEW, 4 MOVES
  1 precision "of the retrieved, how many are relevant (L338)"
  2 recall    "of the relevant, how many were retrieved (L338)"
  3 golden set "the queries with the relevant docs (L342)"
  4 tuning    "the chunking, the embeddings, the top-k (L338)"
```

## 18. Key Takeaways

> [!RECAP]
> - The retrieval evaluation **measures the search's quality** (L338): the precision (L338), the recall (L338), the golden set (L342), and the tuning (L338)
> - **The precision** (L338): the retrieved-and-relevant ÷ the retrieved (L338) — the search's accuracy (L338)
> - **The recall** (L338): the retrieved-and-relevant ÷ the relevant (L338) — the search's completeness (L338) — the RAG's (L280) metric (L338)
> - **The golden set** (L342): the queries (L338) with the relevant documents (L342) — the labeled ground truth (L342)
> - **The tuning** (L338): the chunking (L178), the embeddings (L181), the top-k (L189) — the precision-recall trade (L338) — and the hybrid search (L187)
> - **The gate** (L341): the golden set (L342) in the CI (L296) — the regression (L341) caught — the answer's (L328) foundation, measured (L338)

## Check your understanding

Answer these without looking back.

1. What's the precision (L338)?
2. What's the recall (L338)?
3. How do you build the golden set (L342)?
4. How do you tune the retrieval (L338)?
5. What's the trade (L338)?
6. What's the hybrid (L187)?
7. What's the gate (L341)?
8. What is the search's quality (L338)?

## A Closing Note — The Finder, Tested

You now hold the measure: **the precision, the recall, the golden set, and the tuning — with the librarian tested and the armload tuned.** The finder's scores are in — and the shelves are rearranged (L338).

Next: the agent metric — Tool Success Rate (L339).
