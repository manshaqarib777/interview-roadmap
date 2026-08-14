# Lesson 190 — Reranking

**Interview importance:** ⭐⭐⭐⭐ — "how do you fix retrieval quality?" — after the hybrid, the answer is *reranking*: a cross-encoder scoring the shortlist, fixing the first pass's ranking (L189) — the second pass that most improves RAG answers (L195).**

L189 gave you the retrieval path; this lesson is its **second pass**: reranking — taking the hybrid's (L187) shortlist of ~10–50 and re-scoring each candidate against the query with a cross-encoder, a model that reads query + chunk *together* and scores relevance precisely. The first pass (bi-encoder embeddings, L181) is fast but coarse — it encodes each text independently. The cross-encoder is slow but precise — it sees the pair. Reranking is the cheapest quality jump in RAG: small candidates, big precision win (L195).

The distinction this lesson is built on: a **demo** takes the top-k and builds the context. A **solutions architect** runs a two-pass retrieval: the bi-encoder/hybrid (L187) recalls a wider candidate set cheaply, the cross-encoder reranker (L190) reorders it precisely, and the top of the *reranked* list becomes the context (L191) — with the precision gain measured on the golden set (L195).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the two-pass pattern: bi-encoder recalls, cross-encoder reranks (L190)
- Explain why the cross-encoder is more precise: it sees query + chunk together (L190)
- Design the handoff: candidate size, rerank budget, final top-k (L189, L191)
- Decide when reranking is worth its cost (L195)
- Measure the reranker: golden set precision before/after (L195)

## 1. One-Line Definition

**Reranking is the second pass of retrieval — after the bi-encoder or hybrid (L187) recalls a wide candidate set, a cross-encoder scores each candidate against the query as a pair, reordering the shortlist by precise relevance (L190) — the cheapest quality jump in RAG: small candidates, big precision win, measured on the golden set (L195).**

The one-sentence interview answer: *"Reranking is the second pass (L190). The first pass — bi-encoder embeddings (L181) or the hybrid (L187) — recalls a wide candidate set cheaply, but it encodes each text independently, so relevance is approximate. The reranker is a cross-encoder: it reads the query and each candidate *together* and scores their relevance precisely (L190). I recall ~50, rerank them, and take the top ~5 — the precision gain is large and the cost is bounded, because the cross-encoder sees only the candidates, not the corpus (L189). The golden set (L195) measures the before/after — reranking is the cheapest quality jump in a RAG stack."*

## 2. Mental Model

Think of the two passes as **a recruiter and a hiring panel.** The recruiter (bi-encoder/hybrid, L187) screens a big pile of résumés fast — keyword and overall-fit signals — and shortlists 50. The hiring panel (cross-encoder reranker, L190) interviews each shortlisted candidate *against the specific job* — reading the résumé and the role together — and ranks them precisely. The panel is slower per candidate, but it only sees 50, not the pile — and its ranking is the one that decides the hire (the context, L191).

```text
   PASS 1 — the recruiter (L187, L189)     PASS 2 — the panel (L190)
   ┌────────────────────────────┐          ┌────────────────────────────┐
   │ bi-encoder / hybrid        │          │ cross-encoder reranker     │
   │ encodes each text alone    │          │ reads query + candidate    │
   │ fast, coarse (L181)        │          │ TOGETHER — precise (L190)  │
   │ recalls 50 candidates      │          │ ranks the 50, take the 5   │
   └─────────────┬──────────────┘          └─────────────┬──────────────┘
                 │  the shortlist (L189)                  │  the top-k → context (L191)
```

The mental model is **recruiter + panel**: a fast, wide first pass and a precise, narrow second pass — the panel never sees the whole pile.

## 3. Visual Flow — A Query Through the Two Passes

```text
   a query arrives
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ PASS 1 · RECALL (L187, L189)                             │
   │     hybrid / bi-encoder → 50 candidates                  │
   │     (wide, cheap — the recruiter)                        │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ PASS 2 · RERANK (L190)                                   │
   │     cross-encoder: score(query, candidate) for each      │
   │     of the 50 — the panel, precise, pair-aware           │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ TOP OF THE RERANKED LIST (L189, L191)                    │
   │     the 5 that best fit the QUERY — not just the corpus  │
   │     → context construction (L191)                        │
   └──────────────────────────────────────────────────────────┘
```

The flow is the two-pass pattern: **recall wide (pass 1), rerank narrow (pass 2), take the top** — the panel's ranking, not the recruiter's, builds the context (L191).

## 4. How It Works — The Two Encoders, the Handoff, the Cost

- **The bi-encoder (L181).** The first pass's model: encodes text and query *independently* into vectors; relevance is approximated by distance in the space (L182). Fast — embeddings are precomputable for the corpus (L176) — but coarse: it can't see the specific interaction between a query and a candidate.
- **The cross-encoder (L190).** The reranker's model: takes query + candidate *together* as one input and outputs a relevance score. Precise — it sees the full interaction, the way a reader would — but slow: it can't precompute, so every candidate is scored live.
- **The handoff (L189).** Pass 1 recalls a *wide* candidate set (e.g. 50 — wider than the final top-k); pass 2 reranks them; the top of the reranked list (e.g. 5) is the context's input (L191). The reranker's cost is bounded because it sees only the candidates, not the corpus.
- **The cost (L151, L150).** Each candidate is a cross-encoder call — 50 calls per query. The latency (L151) and cost (L150) are the trade for precision; the golden set (L195) measures whether the precision gain justifies it.

> [!NOTE]
> **Why the cross-encoder is more precise: it sees the pair (L190).** The bi-encoder (L181) embeds "return policy" and "refund eligibility" separately — they may be near in the space, or not, depending on the corpus. The cross-encoder reads *the query and the candidate together* — it scores "does THIS candidate answer THIS query" with full attention on their interaction (the way the reader of the context will). That pair-awareness is the reranker's precision advantage — and it's why reranking is the second pass, not the first: pair-scoring the whole corpus is unaffordable, pair-scoring 50 candidates is not.

## 5. Real Project Usage

- **RAG quality upgrades (L195).** The single most common "retrieval got better when we…" after the hybrid (L187) — the cross-encoder reorders the shortlist and the top-5 changes (L190).
- **Support copilots.** The hybrid recalls the likely policy pages; the reranker picks the one that *actually answers* the user's phrasing (L189).
- **Legal research.** "Early termination rights" — the hybrid recalls the clause-adjacent chunks; the reranker picks the clause that answers the concept (L188).
- **Product Q&A.** "Is this waterproof?" — the reranker distinguishes the spec table from a passing mention (L190).
- **Any precision-critical retrieval.** Where a wrong top-k is expensive (L196) — reranking is the precision insurance (L195).

The through-line: **reranking is the precision fix for the cheap recall pass** — the two-pass pattern is how RAG gets both speed (L151) and precision (L195).

## 6. Interview Explanation

Say it in four moves:

1. **The pattern.** "Two passes: the bi-encoder or hybrid (L187) recalls a wide set cheaply; the cross-encoder reranks them precisely (L190)."
2. **The mechanism.** "The bi-encoder encodes each text alone (L181) — coarse. The cross-encoder reads query + candidate together — pair-aware, precise (L190)."
3. **The handoff.** "Recall 50, rerank 50, take 5 — the reranker's cost is bounded because it never sees the corpus (L189)."
4. **The measure.** "The golden set (L195) shows the precision gain before/after — reranking is the cheapest quality jump in the stack."

## 7. Senior-Level Insights

- **The two-pass pattern is the architecture (L190).** The senior answer names the pattern — recall wide, rerank narrow — and why: pair-scoring the corpus is unaffordable; pair-scoring 50 candidates is not. The handoff size is the design.
- **The candidate width is a recall dial (L189).** Recall 50 instead of 5 — the reranker can only reorder what pass 1 found. A too-narrow first pass caps the reranker's ceiling (L196); the width is set for the recall budget (L195).
- **Reranking composes with the hybrid (L187, L190).** The hybrid fuses the channels into one ranking; the reranker then reorders it — the three-stage retrieval: recall → fuse → rerank (L189–190).
- **The cost is latency and tokens (L151, L150).** 50 cross-encoder calls per query — the latency budget (L151) and the bill (L150) are the trade; the golden set (L195) decides if the precision pays for them.
- **The reranker is measured like any change (L195, L341).** Golden-set precision before/after, on every reranker model change (L341) — the "best reranker" is a fact about the corpus, not a benchmark.

## 8. Common Mistakes

- **Reranking the whole corpus.** A cross-encoder over everything (L190) — the cost (L150) defeats the pattern; the first pass exists to bound it (L189).
- **No reranking at all.** The top-k straight to the context (L191) — the precision fix skipped (L195).
- **Too-narrow candidates (L189).** Recalling 5 to rerank 5 — the reranker can't fix what pass 1 missed (L196).
- **Reranking after context construction (L191).** The context is built from the wrong ranking — rerank first, then build (L190).
- **Ignoring the cost (L151).** 50 cross-encoder calls on the hot path without the latency budget (L145) — TTFT blows past (L333).
- **Never measuring (L195).** The reranker added, the before/after never scored — the precision gain assumed, not proven (L341).

## 9. Best Practices

- **Recall wide, rerank narrow** (L189, L190) — e.g. 50 candidates → rerank → top 5 (L191).
- **Rerank before context construction** (L190) — the reranked order is the context's order (L191).
- **Compose after the hybrid** (L187) — recall → fuse → rerank (L189).
- **Budget the rerank latency** (L151) — the calls are on the hot path (L145); parallelize or cache (L171).
- **Measure before/after** (L195) — golden-set precision with and without the reranker (L341).
- **Keep the candidate width honest** (L189) — wide enough that pass 1 doesn't cap the ceiling (L196).

## 10. Interview Questions

**Q: What is reranking?**
> A: The second pass of retrieval (L190). The first pass — bi-encoder or hybrid (L187) — recalls a wide candidate set cheaply, encoding each text independently (L181). The reranker is a cross-encoder: it reads the query and each candidate together and scores their relevance precisely. Recall 50, rerank 50, take the top 5 — the precision gain is large, and the cost is bounded because the reranker only sees the candidates (L189).

**Q: Why is the cross-encoder more precise?**
> A: Because it sees the pair (L190). A bi-encoder embeds the query and the chunk separately — relevance is approximated by distance in a shared space (L182). A cross-encoder takes query + candidate as one input and attends to their interaction — it scores "does THIS candidate answer THIS question", the way the reader will. Pair-awareness is the precision; the cost is that every candidate is scored live (L151).

**Q: How many candidates do you rerank?**
> A: A design trade (L189). Wide enough that the first pass doesn't cap the ceiling — if I recall 5 and rerank 5, the reranker can't fix what pass 1 missed (L196). I recall ~50, rerank them, and take the top ~5 for the context (L191). The width is a recall dial, set against the rerank latency (L151) and cost (L150), measured on the golden set (L195).

**Q: When is reranking not worth it?**
> A: When the golden set says so (L195). If the first pass's top-k already contains the right chunks — a clean corpus, well-chunked, strong hybrid (L187) — the reranker's latency (L151) and cost (L150) may not pay. The rule: measure precision before/after; the reranker earns its place when the numbers show it, and re-measure on every model change (L341).

## 11. Follow-Up Questions

- How does the candidate width affect the reranker's ceiling (L196)?
- How does reranking compose with the hybrid (L187)?
- What's the latency budget for reranking (L151)?
- How do you measure the reranker's gain (L195)?
- When is a reranker model change a re-measurement event (L341)?

## 12. Comparison Table — Pass 1 vs Pass 2

| | Pass 1 — recall (L189) | Pass 2 — rerank (this lesson) |
|---|---|---|
| Model | bi-encoder (L181) / hybrid (L187) | cross-encoder |
| Sees | each text independently | query + candidate together |
| Speed (L151) | fast, precomputable (L176) | slow, live per candidate |
| Scope | the whole corpus | the shortlist (~50) |
| Output | a wide candidate set | a precise ranking |
| Role | cheap recall | precision fix (L195) |

The senior read: **the columns are the pattern** — the coarse pass bounds the cost; the precise pass fixes the ranking.

## 13. Code Example — The Two-Pass Retrieval

```js
// Two-pass retrieval: recall wide, rerank narrow (L189, L190).
import { hybridRecall } from './retrieval';       // pass 1 — L187, L189
import { crossEncode } from './reranker';         // pass 2 — L190

const CANDIDATES = 50;                            // the recall width (L189)
const TOP_K = 5;                                  // the context input (L191)

async function retrieveAndRerank(query, { tenant }) {
  // PASS 1 — recall wide (cheap): the hybrid, scoped (L187, L320).
  const candidates = await hybridRecall(query, { tenant, topK: CANDIDATES });

  // PASS 2 — rerank narrow (precise): score each pair, live (L190).
  const scored = await Promise.all(
    candidates.map((c) => crossEncode(query, c.text).then((s) => ({ c, s }))),
  );
  scored.sort((a, b) => b.s - a.s);               // the panel's ranking

  // TOP OF THE RERANKED LIST → context construction (L191).
  return scored.slice(0, TOP_K).map((x) => x.c);
}
```

```text
What the reader must SEE — the pattern in code:

  hybridRecall(…, topK: 50)    → pass 1, wide, cheap (L187, L189)
  crossEncode(query, c.text)   → pass 2, pair-aware, precise (L190)
  sort + slice(0, 5)           → the panel's ranking → context (L191)

  Recall wide, rerank narrow — the precision fix, bounded.
```

```narrate
5-6: The two sizes — the recall width (50) and the context input (5) are the design (L189, L191).
8-10: Pass 1 — the hybrid recalls widely and cheaply, scoped by tenant (L187, L320).
12-15: Pass 2 — the cross-encoder scores each query+candidate pair live; pair-awareness is the precision (L190).
17-19: The reranked top-k feeds context construction — the panel's ranking decides (L191).
```

> [!TIP]
> The two numbers that define the pattern: **`CANDIDATES = 50`** (wide enough that pass 1 doesn't cap the ceiling, L196) and **`TOP_K = 5`** (the budgeted context input, L191). **Recall wide, rerank narrow — the precision fix is bounded by the design.**

## 14. Performance Notes

- **The reranker is the hot-path cost (L151).** 50 cross-encoder calls per query — parallelize (L222), watch TTFT (L333), and let the cache (L171) skip repeats.
- **The candidate width is a latency dial (L189).** Wider recall = more rerank calls — the width is set against the latency budget (L151), not maximized.
- **The reranker's cost is the model's (L150).** A larger cross-encoder is more precise and pricier — the golden set (L195) decides which model earns its tokens.
- **Pass 1 stays precomputed (L181, L176).** Bi-encoder embeddings are built at ingestion (L176) — pass 1 is cheap because it's precomputed; only pass 2 is live (L190).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Precision not improving | Candidate width too narrow (L189) | Widen pass 1; re-measure (L195) |
| TTFT too high | Rerank calls unbudgeted (L151) | Parallelize; reduce width; cache (L171) |
| Context order wrong | Rerank after context build (L191) | Rerank first, then construct (L190) |
| Reranker model change regressed | Not re-measured (L341) | Golden set before/after (L195) |
| Cost climbing | Cross-encoder too big (L150) | Smaller model; measure the precision loss (L195) |

## 16. Quick Revision Notes

- Reranking = **the second pass**: recall wide, rerank narrow (L189, L190).
- The mechanism: **cross-encoder sees query + candidate together** (L190).
- The handoff: **50 → rerank → 5** (L189, L191); the width is the recall dial (L196).
- Compose after the **hybrid (L187)**: recall → fuse → rerank.
- The cost: **live pair-scoring (L151, L150)** — bounded by the shortlist.
- Measure: **golden set before/after** (L195, L341).

## 17. Cheat Sheet

```text
RERANKING = the second pass — precision fixes the cheap recall

THE PATTERN (L189, L190)
  pass 1   bi-encoder / hybrid (L187) — recall WIDE (≈50), cheap
  pass 2   cross-encoder — score each pair, LIVE, precise
  output   the reranked top-k (≈5) → context (L191)

THE MECHANISM (L190)
  bi-encoder     encodes each text alone (L181) — coarse
  cross-encoder  reads query + candidate TOGETHER — precise
  pair-awareness is the precision advantage

THE DESIGN NUMBERS
  candidates = 50   wide enough — pass 1 must not cap the ceiling (L196)
  top-k = 5         the budgeted context input (L149, L191)
  the reranker only sees the shortlist — the cost is bounded (L189)

THE COMPOSE (L187)
  recall → fuse (RRF) → rerank — the three-stage retrieval

THE MEASURE (L195)
  golden set: precision before/after the reranker
  re-measure on every model change (L341)
  the reranker earns its latency (L151) and cost (L150) when proven

INTERVIEW, 4 MOVES
  1 pattern  "recall wide, rerank narrow"
  2 mechanism "the cross-encoder sees the pair (L190)"
  3 handoff  "50 → rerank → 5 — the cost is bounded (L189)"
  4 measure  "golden set before/after (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - Reranking is **the second retrieval pass** (L190): the bi-encoder or hybrid (L187) recalls a wide candidate set cheaply, and a cross-encoder reorders it precisely
> - **The cross-encoder sees the pair** — query + candidate together — which is why it's more precise than the independently-encoding bi-encoder (L181)
> - The handoff design: **recall ~50, rerank ~50, take ~5** (L189, L191) — the reranker's cost is bounded because it never sees the corpus
> - **The candidate width is a recall dial** (L189, L196) — too-narrow pass 1 caps the reranker's ceiling
> - It composes as **recall → fuse (L187) → rerank**, before context construction (L191)
> - **The golden set measures before/after** (L195, L341) — reranking is the cheapest quality jump in the stack, proven by numbers

## Check your understanding

Answer these without looking back.

1. What's the two-pass pattern (L190)?
2. Why is the cross-encoder more precise (L190)?
3. What are the design numbers, and why (L189)?
4. Why must pass 1 recall wide (L196)?
5. Where does reranking sit in the compose (L187)?
6. What bounds the reranker's cost (L189)?
7. How do you measure the gain (L195)?
8. When is reranking not worth it?

## A Closing Note — The Panel That Fixes the Recruiter's List

You now hold the second pass: **recall wide with the cheap encoders, rerank narrow with the pair-aware cross-encoder, and let the panel's ranking build the context.** It's the precision fix that most improves RAG answers — and the golden set is its proof.

Next: assembling the answer's input — context construction (L191), where the shortlist becomes the prompt.
