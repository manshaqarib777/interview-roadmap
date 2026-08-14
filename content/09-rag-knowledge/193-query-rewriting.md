# Lesson 193 — Query Rewriting

**Interview importance:** ⭐⭐⭐⭐ — "how do you improve retrieval before the model?" — the answer is *query rewriting*: HyDE, multi-query, decomposition — refining the query so retrieval finds more (L189), measured on the golden set (L195).**

L189 gave you retrieval. This lesson is the **pre-retrieval upgrade**: query rewriting — transforming the user's query *before* it's embedded and searched, so retrieval finds better chunks. Three patterns: **HyDE** (hypothetical document embeddings — embed a *drafted answer* instead of the question), **multi-query** (generate several phrasings and search all), and **decomposition** (split compound questions into sub-queries). Each costs model calls (L150) to improve recall (L195) — the classic quality/latency trade (L151).

The distinction this lesson is built on: a **demo** embeds the raw query. A **solutions architect** knows raw queries are poor retrieval inputs — short, ambiguous, keyword-dense — and designs the rewrite: HyDE for vague questions, multi-query for paraphrase coverage, decomposition for multi-part questions — each with its cost (L150), each measured on the golden set (L195).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why raw queries retrieve poorly: short, ambiguous, under-specified (L193)
- Explain HyDE: embed a hypothetical answer, not the question (L193)
- Explain multi-query and decomposition: coverage and splitting (L193)
- Choose the pattern by query shape and measure the gain (L195)
- Explain the cost: model calls per query (L150, L151)

## 1. One-Line Definition

**Query rewriting is the pre-retrieval upgrade — transforming the user's raw query into better retrieval inputs: HyDE (embed a hypothetical answer instead of the question), multi-query (search several phrasings for paraphrase coverage), and decomposition (split compound questions into sub-queries) — each costing model calls (L150) to lift recall (L189), and each measured on the golden set (L195).**

The one-sentence interview answer: *"Query rewriting fixes the raw query before retrieval (L193). Raw queries are bad search inputs — short, ambiguous, keyword-dense. Three patterns. HyDE: I draft a hypothetical answer to the question and embed *that* — the draft's language matches the documents better than the terse question (L193). Multi-query: I generate several phrasings and search all, fusing the results (L187) — paraphrase coverage. Decomposition: a compound question — 'compare X and Y' — splits into sub-queries, each retrieved separately (L189). The trade: each pattern costs model calls (L150) and latency (L151) — so I choose by query shape and measure the recall gain on the golden set (L195)."*

## 2. Mental Model

Think of query rewriting as **asking a good librarian the question three different ways.** The raw query is the hurried version: "damaged stuff policy" — the librarian frowns. A good librarian knows that phrasing matters: HyDE is describing the *answer* you expect ("a policy page about returning broken items, refund eligibility…") so the librarian finds the right shelf; multi-query is asking three phrasings at once; decomposition is splitting "what's the policy for broken and late items?" into two questions. The rewriting is the thinking done *before* the search — it costs a moment but finds the right books.

```text
   raw query                    the rewrites (L193)
   ┌──────────────────┐         ┌──────────────────────────────┐
   │ "damaged stuff   │         │ HyDE: "return policy for     │
   │  policy"         │  ────►  │  broken items, refunds…"     │
   │ (terse, vague)   │         │ multi: "damaged goods return"│
   └──────────────────┘         │        "refund broken items" │
                                │ decomp: "policy for broken"  │
                                │         + "policy for late"  │
                                └──────────────────────────────┘
```

The mental model is **the hurried question, refined**: rewriting is the thinking that turns a poor search input into several good ones.

## 3. Visual Flow — The Rewrite Stage

```text
   a raw query arrives
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CLASSIFY THE QUERY SHAPE (L193)                      │
   │     vague/conceptual → HyDE (L193)                       │
   │     paraphrase-prone → multi-query (L193)                │
   │     compound (and/compare) → decomposition (L193)        │
   │     clear + specific → search directly (no rewrite)      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · REWRITE (L150) — model calls, budgeted               │
   │     HyDE: draft the answer → embed the draft (L181)      │
   │     multi: N phrasings → N embeddings                    │
   │     decomp: sub-queries → retrieved separately (L189)    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · RETRIEVE (L189) — the improved inputs                │
   │     fuse multi/decomp results (RRF, L187)                │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   → rerank (L190) → context (L191) — with better recall
```

The flow is the upgrade: **classify → rewrite → retrieve** — and the classification decides whether the rewrite is worth its model calls (L150).

## 4. How It Works — The Three Patterns

- **HyDE (Hypothetical Document Embeddings) (L193).** Draft a hypothetical answer to the question — the model writes what a good document would say — then embed *the draft* and search with it. Why it works: the draft's language matches the documents' language better than the terse query does (L181). The embedding of "the return policy covers broken items, refunds within 30 days…" lands nearer the policy chunks than the embedding of "damaged stuff policy" does.
- **Multi-query (L193).** Generate several phrasings of the question and search all of them, fusing the results (RRF, L187). Why: paraphrase coverage — the user's words rarely match the document's words, but *some* phrasing does (L188).
- **Decomposition (L193).** Split a compound question — "compare X and Y", "what about A and B?" — into sub-queries, each retrieved separately, then combined. Why: a compound query embeds into a mush — neither X nor Y is well-represented; separate retrievals each find their part (L189).

> [!NOTE]
> **The cost is the trade: model calls per query (L150, L151).** Every rewrite pattern runs the model before retrieval — HyDE drafts, multi-query generates N phrasings, decomposition generates sub-queries. Each is a model call (L150) on the query path (L151), before the TTFT budget (L145) starts ticking. That's why the classification step matters: clear, specific queries skip the rewrite; only the query shapes that *need* it pay the cost. And the golden set (L195) measures whether each pattern's recall gain pays for its latency and tokens — per query shape, not globally.

## 5. Real Project Usage

- **Support copilots.** "my order is messed up" → HyDE drafts "order issues, delivery problems, refund eligibility…" — retrieval finds the right policy pages (L193).
- **E-commerce Q&A.** "do you take returns?" → multi-query: "return policy", "refund broken items", "return damaged goods" — fused (L187), covering the paraphrases (L193).
- **Legal research.** "compare termination and breach clauses" → decomposition into two retrievals — each clause found (L189).
- **Internal knowledge.** Vague questions ("how do we deploy?") → HyDE drafts the runbook's language — the runbook retrieved (L193).
- **Any high-recall requirement (L195).** When a missed chunk is expensive (L196) — query rewriting is the recall insurance (L193).

The through-line: **raw queries are the retrieval bottleneck** — rewriting is the model-aided fix, applied where the query shape needs it and measured where it pays (L195).

## 6. Interview Explanation

Say it in four moves:

1. **The problem.** "Raw queries retrieve poorly — short, ambiguous, keyword-dense (L193). The user's words rarely match the documents' words (L188)."
2. **The patterns.** "HyDE — embed a drafted answer, not the question. Multi-query — several phrasings, fused. Decomposition — split compound questions (L193)."
3. **The cost.** "Each is a model call on the query path (L150, L151) — so classification decides: clear queries skip the rewrite (L193)."
4. **The measure.** "The golden set (L195) shows each pattern's recall gain per query shape — applied where it pays, not everywhere."

## 7. Senior-Level Insights

- **Query rewriting is a recall investment (L195).** The senior answer frames it as a cost/recall trade per query shape — not a "always rewrite" feature. The classification step is the design; the golden set is the ledger (L341).
- **HyDE's mechanism is language matching (L193).** The draft's *vocabulary* matches the documents' — the embedding lands nearer (L181). That's why HyDE works for vague queries: it converts the question into the language of the answer (L188).
- **Multi-query composes with the hybrid (L187).** Fusing several phrasings' results by RRF (L187) — the paraphrase coverage composes with the keyword+semantic channels (L187–188).
- **Decomposition is a retrieval-structure decision (L189).** A compound question is really two retrievals — the senior answer splits the *search*, not just the prompt (L191).
- **The rewrite is cached (L171).** The same question rephrased the same way — cache the rewrites (L171) and the retrievals (L171), so the model calls (L150) amortize across users.

## 8. Common Mistakes

- **Rewriting everything (L150).** Model calls on clear queries — latency (L151) and cost (L150) for no recall gain (L195).
- **Rewriting nothing (L193).** Vague queries embedded raw — the recall loss that rewriting fixes (L189).
- **HyDE without verification (L196).** The drafted answer can hallucinate (L141) — the search uses the *draft's language*, not its truth (L193).
- **Multi-query without fusion (L187).** Several searches, results uncombined — the coverage wasted (L193).
- **Decomposition without merging (L189).** Sub-query results concatenated, not ranked — the context's order broken (L191).
- **Never measuring (L195).** The rewrite added, the per-shape gain unmeasured — cost paid, benefit assumed (L341).

## 9. Best Practices

- **Classify the query shape first** (L193) — vague → HyDE, paraphrase-prone → multi-query, compound → decomposition.
- **Skip the rewrite for clear queries** (L150) — the classification saves the cost.
- **Fuse multi-query results** (L187) — RRF over the phrasings' lists.
- **Verify HyDE drafts** (L196) — the draft is a search vehicle, not an answer (L193).
- **Cache rewrites and retrievals** (L171) — the model calls amortize across users.
- **Measure per query shape** (L195) — the golden set decides which patterns pay (L341).

## 10. Interview Questions

**Q: What is query rewriting?**
> A: Transforming the query before retrieval so it searches better (L193). Raw queries are short and ambiguous — the user's words rarely match the documents' words (L188). Three patterns: HyDE — draft a hypothetical answer and embed that (the draft's language matches the docs); multi-query — several phrasings searched and fused (L187); decomposition — compound questions split into sub-queries (L189). Each costs model calls (L150), so I classify and apply only where it pays (L195).

**Q: How does HyDE work?**
> A: HyDE — hypothetical document embeddings (L193). The model drafts a hypothetical answer to the question, and I embed *the draft* instead of the question (L181). The insight: the draft's language matches the documents' language, so its embedding lands nearer the right chunks. The draft doesn't need to be *true* — it's a search vehicle; only its language matters (L196). Great for vague, conceptual queries.

**Q: When do you use multi-query?**
> A: When paraphrase coverage is the gap (L193). The user says "do you take returns?"; the doc says "refund eligibility". I generate several phrasings — "return policy", "refund broken items" — search all, and fuse with RRF (L187). Some phrasing matches the documents' words (L188). The cost is N model calls (L150) and N searches (L151) — measured against the recall gain (L195).

**Q: What about compound questions?**
> A: Decomposition (L193). "Compare termination and breach clauses" embeds into a mush — neither concept is well-represented. I split into sub-queries — "termination clause" and "breach clause" — retrieve each separately (L189), and rank the combined results (L191). The search mirrors the question's structure; the context then contains both parts.

## 11. Follow-Up Questions

- How does the golden set measure a rewrite's gain (L195)?
- How does HyDE compose with the hybrid (L187)?
- What's the latency cost of each pattern (L151)?
- How do you cache rewrites (L171)?
- When is no rewrite the right call (L150)?

## 12. Comparison Table — The Rewrite Patterns

| | HyDE (L193) | Multi-query (L193) | Decomposition (L193) |
|---|---|---|---|
| Fixes | vague queries | paraphrase mismatch (L188) | compound questions |
| Mechanism | embed a draft answer | N phrasings, fused (L187) | sub-queries, separate (L189) |
| Model calls (L150) | 1 draft | N phrasings | N splits |
| Risk (L196) | draft hallucination | fusion noise | mis-split |
| Best for | "how do we…?" | "do you take returns?" | "compare X and Y" |

The senior read: **the columns are the query shapes** — classification picks the pattern; the golden set (L195) confirms it.

## 13. Code Example — The Rewrite Stage

```js
// Query rewriting: classify → rewrite → retrieve (L193, L150, L195).
import { draftAnswer, generatePhrasings, splitQuery } from './rewriter';
import { hybridSearch } from './retrieval';          // L187, L189

async function retrieveWithRewrite(query, ctx) {
  // 1 · CLASSIFY — the query shape decides the rewrite (L193).
  const shape = classify(query);                     // 'vague' | 'paraphrase' | 'compound' | 'clear'

  // 2 · REWRITE — model calls, budgeted by shape (L150).
  const queries = shape === 'vague'      ? [await draftAnswer(query)]            // HyDE (L193)
                 : shape === 'paraphrase' ? await generatePhrasings(query, 3)    // multi-query (L193)
                 : shape === 'compound'   ? await splitQuery(query)              // decomposition (L193)
                 : [query];                                                      // clear → no rewrite (L150)

  // 3 · RETRIEVE — each improved query, results fused (L187, L189).
  const lists = await Promise.all(queries.map((q) => hybridSearch(q, ctx)));
  return rrf(...lists);                               // fused ranking (L187)
}
```

```text
What the reader must SEE — the classification, the cost, the fuse:

  classify(query)            → the shape decides the rewrite (L193)
  draft / phrasings / split  → the model calls, by shape (L150)
  'clear' → [query]          → no rewrite — the cost saved (L150)
  rrf(...lists)              → the fused results (L187)

  Rewrite where it pays, skip where it doesn't — measured (L195).
```

```narrate
4-5: Classification — the query shape routes to the right pattern, or to no rewrite at all (L193).
7-10: The rewrites — HyDE drafts, multi-query generates phrasings, decomposition splits (L193).
12-14: Retrieval per improved query — the model calls are the cost of recall (L150, L151).
15-16: Fusion — RRF combines the lists; the coverage becomes one ranking (L187).
```

> [!TIP]
> The line that shows the discipline is **`'clear' → [query]`** — the classification *skips* the rewrite when it wouldn't pay. **Rewriting is a recall investment, not a default (L150, L195).**

## 14. Performance Notes

- **The rewrite is on the query path (L151).** Model calls before retrieval — the TTFT budget (L145) includes them; parallelize the calls (L222) and cache (L171).
- **The model calls are the cost (L150).** HyDE's draft, multi-query's N phrasings — token spend per query (L149); caching (L171) amortizes repeats.
- **N searches multiply retrieval (L151).** Multi-query runs N retrievals — parallelize; the fuse (L187) is trivial.
- **The golden set runs per shape (L195).** The recall gain is measured by query class — the classification and the budget are tuned with data (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Rewrites not helping | Applied to clear queries (L150) | Classify; skip where it doesn't pay (L195) |
| Vague queries still miss | No HyDE (L193) | Add the draft-and-embed pattern |
| Paraphrases fail | No multi-query (L188) | Generate phrasings; fuse (L187) |
| Compound answers lopsided | No decomposition (L189) | Split; retrieve each part |
| Latency up | Unbudgeted model calls (L151) | Cache (L171); parallelize (L222) |

## 16. Quick Revision Notes

- Query rewriting = **the pre-retrieval upgrade** (L193).
- Three patterns: **HyDE** (draft + embed), **multi-query** (phrasings + fuse), **decomposition** (split + separate) (L193).
- The mechanism: **the rewrite's language matches the documents** (L181, L188).
- The cost: **model calls on the query path** (L150, L151) — classify to skip (L193).
- The fuse: **RRF over the rewrites' results** (L187).
- The measure: **golden set per query shape** (L195, L341).

## 17. Cheat Sheet

```text
QUERY REWRITING = the model-aided fix for poor search inputs

THE PROBLEM (L193)
  raw queries are short, ambiguous, keyword-dense
  the user's words rarely match the documents' words (L188)

THE THREE PATTERNS (L193)
  HyDE         draft a hypothetical answer → embed the draft (L181)
               the draft's LANGUAGE matches the docs — recall up
  multi-query  N phrasings → N searches → fuse (RRF, L187)
               paraphrase coverage
  decomposition  "compare X and Y" → sub-queries → separate (L189)

THE COST (L150, L151)
  every pattern is a model call on the query path
  classify: 'clear' → no rewrite — the cost saved

THE MEASURE (L195, L341)
  golden set per query shape — which patterns pay
  applied where it pays, skipped where it doesn't

INTERVIEW, 4 MOVES
  1 problem  "raw queries are bad search inputs"
  2 patterns "HyDE, multi-query, decomposition (L193)"
  3 cost     "model calls — classify to skip (L150)"
  4 measure  "the golden set per shape (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - Query rewriting is **the pre-retrieval upgrade** (L193): raw queries are short, ambiguous, and keyword-dense — poor search inputs (L188)
> - **HyDE** embeds a drafted answer, whose language matches the documents (L181); **multi-query** covers paraphrases and fuses by RRF (L187); **decomposition** splits compound questions into separate retrievals (L189)
> - Every pattern is a **model call on the query path** (L150, L151) — so the classification step decides: clear queries skip the rewrite
> - **HyDE's draft is a search vehicle, not an answer** (L196) — only its language matters
> - **Multi-query and decomposition fuse or merge their results** (L187, L191) — coverage without structure is wasted
> - The golden set **measures the recall gain per query shape** (L195, L341) — rewriting is applied where it pays, not everywhere

## Check your understanding

Answer these without looking back.

1. Why do raw queries retrieve poorly (L193)?
2. How does HyDE work, and why does it help (L181)?
3. When is multi-query the right pattern (L188)?
4. How does decomposition handle compound questions (L189)?
5. What's the cost of each pattern (L150)?
6. Why classify before rewriting (L193)?
7. How do you fuse multi-query results (L187)?
8. How does the golden set measure the gain (L195)?

## A Closing Note — The Question, Improved Before the Search

You now hold the pre-retrieval upgrade: **HyDE for the vague, multi-query for the paraphrase-prone, decomposition for the compound — applied by classification, paid for by the cost of model calls, and proven by the golden set.** The question is now as good as the documents it searches.

Next: retrieval with more context — contextual retrieval (L194), where surrounding context and context-aware embeddings handle the hard queries.
