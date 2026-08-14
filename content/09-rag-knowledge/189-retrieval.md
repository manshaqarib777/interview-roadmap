# Lesson 189 — Retrieval (top-k, filters, scoring)

**Interview importance:** ⭐⭐⭐⭐⭐ — "walk me through retrieval" — the answer is *the query path*: filters (L180), scoring (L181–182, L188), top-k (L178), and reranking (L190) — the stage between the question and the context (L191).**

L174–188 built the index and the channels. This lesson is the **retrieval stage itself**: how a query becomes a shortlist — embedding (L181), filtering (L180), scoring, top-k selection, and the pre-filter/post-filter trade (L187–188). Retrieval is where RAG quality is won or lost (L195): the right chunks in the top-k decide the answer (L191), and the failure modes (L196) — missing chunks, wrong chunks, cross-tenant leaks (L320) — all live here.

The distinction this lesson is built on: a **demo** embeds, searches, takes the top 3, and hopes. A **solutions architect** designs the retrieval path deliberately: scope the search with filters first (L180, L320), score with the right similarity, choose top-k against the context budget (L149, L191), handle the pre/post-filter trade (L187), and measure the whole stage against the golden set (L195).

## Learning Objectives

By the end of this lesson you should be able to:

- Walk the retrieval path: filter → score → top-k → (rerank, L190) (L189)
- Explain the pre-filter vs post-filter trade (L187–189)
- Choose top-k against the token budget (L149, L191)
- Explain scoring: cosine, hybrid fusion (L187–188), and the rerank handoff (L190)
- Measure retrieval: golden set precision/recall (L195)

## 1. One-Line Definition

**Retrieval is the stage where a query becomes a shortlist — embed the query (L181), scope it with metadata filters (L180, L320), score the candidates (similarity, L182, or hybrid fusion, L187), and select the top-k against the token budget (L149) — then hand the shortlist to reranking (L190) and context construction (L191), with every choice measured on the golden set (L195).**

The one-sentence interview answer: *"Retrieval is the query-to-shortlist stage (L189). Four steps. First, scope: metadata filters — tenant always (L320), source and date when the query implies them (L180). Second, score: the hybrid (L187) — BM25 and embeddings fused by RRF — or vector similarity alone (L182). Third, top-k: chosen against the token budget (L149) — k × chunk size must fit the context window (L191). Fourth, hand off: the shortlist goes to a reranker (L190), then to context construction (L191). Every choice — the filters, the k, the scoring — is measured on the golden set (L195). Retrieval quality is RAG quality: the right chunks in the top-k decide the answer (L196)."*

## 2. Mental Model

Think of retrieval as **a bouncer narrowing a crowd into a VIP list.** The whole corpus is the crowd. First, the bouncer applies the door policy — filters: only this tenant, only recent docs, only this source (L180, L320) — the crowd shrinks to those allowed in. Then the host scores everyone — similarity to the question (L182), or the hybrid's two opinions (L187). Finally the top-k get the VIP list — the few who make it into the room (the context, L191). The list's quality decides the party — a bad list, a bad answer (L196).

```text
   the corpus (crowd)
        │  filters (L180, L320) — the door policy
        ▼
   the scoped set (allowed in)
        │  scoring (L182, L187) — the host's opinion
        ▼
   the ranking (who's closest)
        │  top-k (L178, L149) — the VIP list
        ▼
   the shortlist → rerank (L190) → context (L191)
```

The mental model is **door policy → scoring → VIP list**: filters scope, scores rank, top-k selects — and the list is what the model reads.

## 3. Visual Flow — The Retrieval Path

```text
   a query arrives
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · EMBED + SCOPE (L181, L180)                           │
   │     query → vector (L181)                                │
   │     filters: tenant (L320) · source · date (L140)        │
   │     pre-filter → search inside the scope (L189)          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · SCORE (L182, L187)                                   │
   │     similarity: cosine over the scoped candidates (L182) │
   │     hybrid: fuse BM25 + semantic ranks (RRF, L187)       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · TOP-K (L149, L191)                                   │
   │     k from the token budget: k × chunk ≤ context         │
   │     return k, not 3, not 50 — the budget decides         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · RERANK (L190) → CONTEXT (L191)                       │
   │     the shortlist is refined and ordered                 │
   └──────────────────────────────────────────────────────────┘
```

The flow is the path: **scope → score → top-k → rerank → context** — every step a decision with a budget (L149) and a measure (L195).

## 4. How It Works — The Four Decisions

- **Scope: filters (L180, L320).** The search runs inside a scoped set — tenant always (L320), source and date when the query implies them (L140). **Pre-filtering** applies the filter to the index before scoring (correct, fast); **post-filtering** scores then filters (may return too few — the trade, L187).
- **Score (L182, L187).** The candidates are ranked: vector similarity (cosine, L182) for semantic-only, or the hybrid fusion (RRF over BM25 + semantic, L187) for the both-channels default. The score's scale doesn't matter — only the ranking (L190).
- **Top-k (L149, L178).** k is a budget decision: k × average chunk size must fit the context window minus the system prompt (L149, L191). Small k is precise but risky (the answer's chunk may be outside, L196); large k is recall-heavy but costs tokens (L150) and buries the answer in noise.
- **Hand off (L190, L191).** The shortlist goes to the reranker (L190) — a second, more expensive pass that fixes the first ranking — then to context construction (L191), which orders and formats the chunks into the prompt.

> [!NOTE]
> **The pre/post-filter trade is a retrieval-quality decision (L189).** Pre-filtering — filter applied to the index before scoring — is correct and fast: the ANN search runs inside the scoped set (L182). Post-filtering — search, then filter in code — risks the **empty-shortlist** failure: the filter is selective, the top-50 contained few scoped results, and after filtering there are too few to fill the context (L196). The senior design prefers pre-filtering, and the store's support for it (L183–185) is part of the L186 choice. Both are measured (L195).

## 5. Real Project Usage

- **Multi-tenant copilots (L320).** The tenant filter pre-scopes every query — isolation by construction (L180), and the golden set (L195) verifies no cross-tenant results.
- **Freshness-bound support (L140).** Date filters pre-scope to this quarter's docs — stale chunks excluded before scoring (L189).
- **Product Q&A.** Source filters — "only the return policy" — plus the hybrid's keyword channel for SKUs (L187–188).
- **Legal research.** Clause-number filters (L180) with hybrid scoring — exact § references and conceptual searches together (L188).
- **Any RAG app.** The retrieval path is the shared spine (L175) — this lesson is the per-query engine of that spine.

The through-line: **retrieval is where the architecture meets the query** — the L175 spine's per-question heart, and the quality ceiling (L195).

## 6. Interview Explanation

Say it in four moves:

1. **The path.** "Retrieval is scope → score → top-k → hand off (L189): filters first (L320), then similarity or hybrid (L187), then k."
2. **The budget.** "Top-k is a token decision (L149) — k × chunk size fits the context (L191). k is not 3 because it feels right."
3. **The trade.** "Pre-filtering is correct and fast (L189); post-filtering risks the empty shortlist (L196). I pre-filter, and the store's support (L186) is part of the choice."
4. **The measure.** "Every decision — filters, scoring, k — is scored on the golden set (L195). Retrieval quality is RAG quality."

## 7. Senior-Level Insights

- **Retrieval is the quality ceiling (L195).** The senior answer leads with the path and its decisions — the demo leads with a library call. The right chunks in the top-k decide the answer; everything after (L191–192) is downstream of this stage (L196).
- **Top-k is a budget, not a constant (L149).** k composes with chunk size (L178) on the context budget (L191) — the senior design derives k from the budget per feature, and re-derives when the chunk size changes (L341).
- **The filters are isolation enforcement (L320).** The tenant filter is applied by construction, in the retrieval function — a filter you must remember is a leak you haven't had yet (L312).
- **The reranker is the second pass (L190).** Retrieval's ranking is the cheap first pass; the reranker (L190) is the expensive fix — the handoff between them is part of this lesson's design.
- **Retrieval is measured continuously (L195, L341).** Golden-set precision/recall runs on every retrieval change — filters, scoring, k — like a regression suite (L341). The stage is tuned with data, never by vibes.

## 8. Common Mistakes

- **No filters (L180).** A global search in a multi-tenant system (L320) — the leak (L312).
- **Post-filtering by default (L189).** The empty-shortlist failure (L196) — selective filters after scoring.
- **k by guesswork (L149).** k = 3 forever — the answer's chunk outside the top-k, or the context over budget (L191).
- **Ignoring the budget (L149).** k × chunk size ignoring the context window (L138) — truncation mid-answer.
- **Score averaging (L187).** Fusing incompatible scales instead of RRF ranks — the semantic channel swamps the keyword.
- **No measurement (L195).** Filters, k, and scoring set once, never scored — the quality ceiling unexamined.

## 9. Best Practices

- **Scope first, by construction** (L180, L320) — the tenant filter is part of the retrieval function.
- **Pre-filter, always** (L189) — search inside the scoped set; the store's support is an L186 factor.
- **Derive k from the budget** (L149, L191) — per feature, re-derived when chunks change (L341).
- **Fuse with RRF** (L187) — the hybrid's ranks, not scores.
- **Hand off to the reranker** (L190) — the cheap first pass, then the expensive fix.
- **Measure the whole stage** (L195) — golden set precision/recall on every change (L341).

## 10. Interview Questions

**Q: Walk me through retrieval.**
> A: Four steps (L189). Scope — metadata filters applied first: tenant by construction (L320), source and date when the query implies them (L180). Score — the hybrid (L187): BM25 and embeddings fused by RRF, or vector similarity alone (L182). Top-k — derived from the token budget (L149): k × chunk size fits the context (L191). Hand off — the shortlist goes to the reranker (L190), then context construction (L191). Every choice is measured on the golden set (L195).

**Q: How do you choose top-k?**
> A: From the budget, not from habit (L149). The constraint: k × average chunk size ≤ context window minus the system prompt (L191). Small k is precise but risky — the answer's chunk can fall outside (L196). Large k recalls more but costs tokens (L150) and buries the answer in noise. I derive k per feature from the budget, and re-derive when the chunk size changes (L341).

**Q: Pre-filter or post-filter?**
> A: Pre-filter, always (L189). The filter is applied to the index before scoring — the ANN search runs inside the scoped set: correct and fast (L182). Post-filtering scores first and filters after — a selective filter can leave too few results to fill the context: the empty-shortlist failure (L196). The store's pre-filter support (L183–185) is part of the L186 choice.

**Q: How do you measure retrieval?**
> A: The golden set (L195). A set of queries with expected sources; retrieval precision and recall scored on every change — filters, scoring, k (L341). Retrieval quality is RAG quality: if the right chunks aren't in the top-k, no amount of prompting fixes the answer (L196). The golden set is the regression suite for this stage.

## 11. Follow-Up Questions

- How does top-k interact with the token budget (L149)?
- When is post-filtering acceptable (L189)?
- How does the reranker change the handoff (L190)?
- How do filters compose with the hybrid (L187)?
- What does the golden set measure here (L195)?

## 12. Comparison Table — Retrieval Decisions

| Decision | Wrong | Right (this lesson) |
|---|---|---|
| Filters (L180, L320) | none — global search | tenant by construction, scoped |
| Filter timing (L189) | post-filter → empty shortlist | pre-filter inside the set |
| k (L149) | fixed by habit | derived from the budget (L191) |
| Scoring (L182, L187) | score averaging | RRF over ranks |
| Hand off (L190) | straight to the prompt | rerank, then context (L191) |
| Measurement (L195) | never | golden set, every change (L341) |

The senior read: **the right column is the retrieval path** — every row a decision with a budget and a measure.

## 13. Code Example — The Retrieval Path

```js
// Retrieval: scope → score → top-k → hand off (L189).
async function retrieve(query, { user, dateFrom, k }) {
  // 1 · SCOPE — filters by construction (L180, L320).
  const scoped = {
    tenant: user.tenant,                        // L320 — always
    ...(dateFrom && { date: { $gte: dateFrom } }),   // L140 — freshness
  };

  // 2 · SCORE — the hybrid (L187): both channels, fused.
  const [keyword, semantic] = await Promise.all([
    bm25Search(query, { filter: scoped, limit: 50 }),     // L188
    vectorSearch(query, { filter: scoped, topK: 50 }),    // L181-182
  ]);
  const ranked = rrf(keyword, semantic);                  // L187

  // 3 · TOP-K — from the token budget, not from habit (L149, L191).
  //    k = floor((contextBudget - systemTokens) / avgChunkTokens)
  const shortlist = ranked.slice(0, k);

  // 4 · HAND OFF — the reranker fixes the ranking (L190) → context (L191).
  return rerank(shortlist, query);
}
```

```text
What the reader must SEE — the four decisions in code:

  filter: { tenant, date }  → scope by construction (L180, L320)
  bm25 + vector + rrf       → score with the hybrid (L187-188)
  k from the budget         → top-k is a token decision (L149, L191)
  rerank(shortlist)         → the second pass (L190)

  Scope, score, budget, hand off — the retrieval path.
```

```narrate
3-7: Scope — the tenant filter is always applied, by construction; date when freshness demands (L320, L140, L180).
9-14: Score — both channels run in parallel, scoped, and fuse by RRF (L187-188).
16-18: Top-k — k comes from the token budget arithmetic, not a fixed number (L149, L191).
20-21: Hand off — the reranker is the second pass before context construction (L190, L191).
```

> [!TIP]
> The two lines that make retrieval a design and not a call: **`tenant: user.tenant`** (scope by construction, L320) and **`k = floor((budget − system) / chunk)`** (top-k as arithmetic, L149). **Scope and budget — the two numbers that decide the shortlist.**

## 14. Performance Notes

- **The path is the latency budget (L151).** Scope + score + top-k must fit the TTFT budget (L145) — the ANN index (L182), parallel channels (L222), and the cache (L171) are the levers.
- **Pre-filtering is the fast path (L189).** Filtering inside the index beats scoring-then-filtering at every scale (L182).
- **The reranker is the expensive step (L190).** It's the second pass on a shortlist of ~10–50, not the corpus — keep the handoff small (L151).
- **k × chunk is the token bill (L150).** The context cost (L191) is k × chunk size — the budget arithmetic (L149) is the cost control.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Empty answers | Post-filtering with selective filters (L196) | Pre-filter (L189) |
| Cross-tenant results | Tenant filter missing (L320) | Add it by construction |
| Context overflow | k too big for the budget (L149) | Re-derive k (L191) |
| Exact codes missed | No keyword channel (L188) | Hybrid + RRF (L187) |
| Quality regressed | Retrieval changed, never re-scored (L341) | Re-run the golden set (L195) |

## 16. Quick Revision Notes

- Retrieval = **scope → score → top-k → hand off** (L189).
- Scope: **filters by construction** (L180, L320), pre-filter always (L189).
- Score: **hybrid + RRF** (L187), or similarity alone (L182).
- Top-k: **a token budget decision** (L149, L191), derived per feature.
- Hand off: **the reranker (L190)** → context (L191).
- Measure: **golden set, every change** (L195, L341).

## 17. Cheat Sheet

```text
RETRIEVAL = scope → score → top-k → hand off

THE PATH (L189)
  1 scope    filters by construction (L180, L320)
            tenant always · source/date when implied (L140)
  2 score    hybrid: BM25 + embeddings, fused by RRF (L187-188)
            or vector similarity alone (L182)
  3 top-k    from the budget: k × chunk ≤ context (L149, L191)
  4 hand off rerank (L190) → context construction (L191)

THE TRADE (L189, L196)
  pre-filter   correct + fast — search inside the scope
  post-filter  risks the empty shortlist — too few after filtering
  the store's pre-filter support is an L186 factor

THE BUDGET (L149)
  k = floor((contextBudget − system) / avgChunkTokens)
  re-derive when chunks change (L341)

THE MEASURE (L195)
  golden set: precision/recall on every retrieval change
  the right chunks in the top-k decide the answer (L196)

INTERVIEW, 4 MOVES
  1 path    "scope, score, top-k, hand off"
  2 budget  "k is arithmetic, not habit (L149)"
  3 trade   "pre-filter — the empty shortlist is the risk (L196)"
  4 measure "the golden set runs on every change (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - Retrieval is the **query-to-shortlist stage** (L189): scope with filters, score, select top-k, hand off — the L175 spine's per-query engine
> - **Filters scope by construction** (L180, L320) — tenant always; **pre-filtering** is correct and fast, while post-filtering risks the empty shortlist (L196)
> - **Top-k is a token-budget decision** (L149, L191) — k × chunk size fits the context; derived per feature, re-derived on chunk changes (L341)
> - **Scoring is the hybrid** (L187) — BM25 and embeddings fused by RRF — or similarity alone (L182); the ranking, not the score scale, is what matters
> - The shortlist **hands off to the reranker** (L190) and then to context construction (L191)
> - **Retrieval is measured on the golden set** (L195) — it's the quality ceiling: the right chunks in the top-k decide the answer (L196)

## Check your understanding

Answer these without looking back.

1. Walk the retrieval path (L189).
2. Why pre-filter rather than post-filter (L196)?
3. How do you derive top-k (L149)?
4. What does RRF fuse, and why ranks (L187)?
5. Where does the reranker sit (L190)?
6. Why is the tenant filter by construction (L320)?
7. What does the golden set measure (L195)?
8. Why is retrieval the quality ceiling (L196)?

## A Closing Note — The Stage Where Answers Are Won

You now hold the retrieval path: **scope with filters, score with both channels, select top-k from the budget, and hand the shortlist to the reranker.** It's the stage where RAG quality is decided — and the golden set (L195) is its scoreboard.

Next: the second pass that fixes the first — reranking (L190), where a cross-encoder reorders the shortlist.
