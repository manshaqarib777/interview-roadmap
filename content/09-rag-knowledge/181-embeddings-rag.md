# Lesson 181 — Embeddings for RAG

**Interview importance:** ⭐⭐⭐⭐⭐ — "which embedding model do you use?" — the answer is a *decision rule*: model choice, dimensionality, and the embedding's role as the retrieval representation (L189).

L147 gave you embeddings as semantics-as-coordinates. This lesson is the **RAG application**: choosing the embedding model, deciding dimensionality, and understanding that the embedding *is* the retrieval representation — the model that embeds your chunks and questions decides what "similar" means for your domain (L189). The embedding choice is a quality decision (L195) with cost (L150) and storage (L182) consequences.

The distinction this lesson is built on: a **demo** uses the default embedding model and never looks back. A **solutions architect** treats the embedding model as a *decision*: quality for the domain (L195), dimensionality for the index (L182), cost per million tokens (L150), and the same model for chunks *and* queries — with the multilingual, code, and domain trade-offs understood. The embedding is the representation; the representation is the retrieval.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the embedding's role: the representation retrieval searches over (L189)
- Choose an embedding model by domain, quality, cost and dimensionality (L181)
- Explain why chunks and queries must share the same model — and why that matters (L181)
- Decide dimensionality: quality vs storage vs search speed (L182)
- Explain multilingual, code, and domain-specific trade-offs

## 1. One-Line Definition

**Embeddings for RAG are the retrieval representation — the model that maps chunks and queries into the vector space where "similar" is measured (L189), chosen by domain quality (L195), cost per token (L150), and dimensionality (L182), with the rule that the same model embeds both the index and every query (L181).**

The one-sentence interview answer: *"The embedding model is the retrieval representation (L181). It maps my chunks and queries into the space where similarity is measured (L189) — so the choice decides what 'relevant' means for my domain. I pick by four axes: quality on my content (measured on a golden set, L195), cost per million tokens (L150), dimensionality for the index (L182 — fewer dims = cheaper storage and faster search, at some quality cost), and multilingual/code support if the corpus needs it (L181). The hard rule: the same model embeds chunks and queries — a mixed space never measures similarity correctly."*

## 2. Mental Model

Think of the embedding model as **the language the library and the librarian share.** The chunks are filed by their embedding (the library's classification, L182); the question is translated into the same embedding (the librarian's query). If they spoke different languages — different models — the librarian would search for "termination clause" in the wrong index and bring back the wrong books. The model defines the space; both sides must live in it.

```text
   chunks (L178)                queries (L189)
   ┌──────────────┐             ┌──────────────┐
   │ embed(c₁)    │             │ embed(q)     │
   │ embed(c₂)    │  ── same    │              │
   │ embed(c₃)    │   model ──► │  similarity   │
   └──────────────┘  (L181)     │  = closeness  │
        the index               the search
        in the space             in the same space
```

The mental model is **one language, two speakers**: the model defines the space, the chunks are filed in it, and the query is asked in it — change either side's model and the space breaks.

## 3. Visual Flow — The Embedding Decision

```text
   choosing the embedding model (L181)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · DOMAIN (L195)                                        │
   │     general prose? multilingual? code? legal/medical?    │
   │     → pick a family that speaks the content              │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · QUALITY (L195)                                       │
   │     golden set → retrieval precision/recall per candidate│
   │     the model is measured, not assumed                  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · COST (L150)                                          │
   │     $ per million tokens × chunks + queries              │
   │     (embedding is cheaper than generation, but scales)   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · DIMENSIONALITY (L182)                                │
   │     quality vs storage/search cost — 256 vs 768 vs 1536  │
   └──────────────────────────────────────────────────────────┘
                      ▼
   one model for chunks AND queries — the hard rule (L181)
```

The flow is the decision: **domain → quality → cost → dimensionality**, with the "same model for both sides" rule as the invariant.

## 4. How It Works — The Four Axes and the One Rule

- **The role.** The embedding is the representation: retrieval measures similarity *in embedding space* (L189). If the space doesn't separate your domain's concepts — legal clauses, product specs, code — retrieval can't either (L195). The model is the map; the map decides what's nearby.
- **Domain.** General models handle prose well. Multilingual corpora need multilingual embeddings. Code needs code-aware models (or code-token handling). Legal/medical often benefit from domain-fine-tuned embeddings. The domain axis narrows the field before quality testing.
- **Quality (L195).** Measured, not assumed: a golden set of domain queries with expected chunks, scored for precision/recall per candidate model. The "best model" is an empirical fact about your content.
- **Cost (L150).** Embeddings bill per token, typically far cheaper than generation — but ingestion scales with corpus size (L176), and queries add per-request cost. The cost axis includes the cache (L171) and dedup (L176).
- **Dimensionality (L182).** More dimensions = more capacity, more storage, slower search (L182). Many providers offer truncated dimensions (e.g. 256 from 1536) at a small quality cost — the index (L182) and the budget (L150) decide.

> [!NOTE]
> **The hard rule: one model for chunks and queries (L181).** Retrieval measures similarity between the query's embedding and the chunks' embeddings — the space only exists if both sides use the same model. Mixing models (a newer model for queries, the old one for the index) produces a broken space: nothing measures correctly, and the fix is re-embedding the whole index (L176). The rule is why the model choice is made *before* ingestion, and why model upgrades are re-ingestion projects (L341).

## 5. Real Project Usage

- **Multilingual support.** A multilingual embedding model so a Spanish question finds English chunks (L181) — the space spans languages.
- **Legal contracts.** Domain-tuned embeddings separate clauses that general models blur (L195); measured on a clause-retrieval golden set.
- **Codebase Q&A.** Code-aware embeddings keep function names and docs nearby — "how do I use X" retrieves the doc + example (L177).
- **E-commerce.** Product-spec embeddings — "is it waterproof?" retrieves spec chunks (L189) with the spec's metadata (L180).
- **Freshness-heavy corpora.** The same embedding model with date metadata (L140) — the space plus the filters (L180).

The through-line: **the embedding is the map of your domain** — choose it for the content, measure it on the content, and keep both sides of retrieval in its space.

## 6. Interview Explanation

Say it in four moves:

1. **The role.** "The embedding is the retrieval representation (L181) — it decides what 'similar' means for my domain (L189)."
2. **The axes.** "I choose by domain (multilingual, code), quality (measured on a golden set, L195), cost per token (L150), and dimensionality for the index (L182)."
3. **The rule.** "One model for chunks and queries — mixing models breaks the space, and the fix is re-embedding (L176)."
4. **The trade.** "Dimensionality is quality vs storage and search speed (L182) — truncated dims save cost at some quality cost, measured, not assumed."

## 7. Senior-Level Insights

- **The embedding is a quality decision measured on your content (L195).** The senior answer names the golden set: candidate models scored for retrieval precision/recall on *domain* queries. "The best embedding model" is a fact about your corpus, not a benchmark leaderboard.
- **The model change is a re-ingestion project (L176, L341).** Upgrading the embedding model means re-embedding the entire index (L176) — the senior design treats it as a schema migration (L341), versioned and costed, not a config swap.
- **Dimensionality is an index decision (L182).** The vector store's memory and search speed scale with dimensions (L182) — the embedding choice and the index choice (L186) are made together, not separately.
- **Truncated dimensions are the cost lever (L150).** Many providers allow 256 dims from a 1536-dim model — a large storage and speed win (L182) at a measured quality cost (L195). The senior answer includes the measurement, not just the truncation.
- **Embedding caching is the repeat lever (L171).** Ingestion re-runs (L176) and repeated queries re-embed — caching embeddings by content hash (L171) makes re-ingestion nearly free.

## 8. Common Mistakes

- **The default model, forever.** Never measured on the domain (L195) — the representation may be wrong for the content.
- **Mixing models.** New model for queries, old for the index (L181) — the broken space; everything retrieves wrong.
- **Ignoring dimensionality.** 1536-dim vectors in a store that can't afford them (L182) — storage and search speed blow up.
- **No domain awareness.** A general model on multilingual or code corpora (L181) — the space doesn't separate the concepts.
- **No golden set.** Model chosen by reputation (L195) — quality assumed, not measured.
- **Model upgrade as a config change.** Swapped without re-ingesting (L176) — a silently broken index.

## 9. Best Practices

- **Pick by domain first** (L181) — multilingual, code, or general; then measure.
- **Score candidates on a golden set** (L195) — retrieval precision/recall on domain queries.
- **Keep one model for chunks and queries** (L181) — the invariant.
- **Decide dimensionality with the index** (L182) — quality vs storage/search, measured.
- **Cache embeddings by content hash** (L171) — re-ingestion and repeats get cheap.
- **Treat model upgrades as re-ingestion projects** (L176, L341) — versioned and costed.

## 10. Interview Questions

**Q: How do you choose an embedding model?**
> A: Four axes (L181). Domain — multilingual, code, or general content. Quality — measured on a golden set of domain queries with expected chunks, scored for precision/recall (L195). Cost — dollars per million tokens, times the corpus and the query volume (L150). Dimensionality — quality vs storage and search speed in my index (L182). The winner is an empirical fact about my content, not a benchmark.

**Q: Why must chunks and queries use the same model?**
> A: Because retrieval measures similarity *in embedding space* (L189). The space is defined by the model — chunks are filed in it, and queries are asked in it. A different model for either side is a different space: nothing measures correctly, and the fix is re-embedding the whole index (L176). One model, one space — that's the invariant (L181).

**Q: What about dimensionality?**
> A: It's an index decision (L182). More dimensions capture more nuance but cost more storage and slower search. Many providers truncate (e.g. 256 from 1536) — a big storage and speed win at a small, *measured* quality cost (L195). I choose with the vector store (L182) and the budget (L150) in hand, not in isolation.

**Q: What does an embedding model upgrade cost?**
> A: A re-ingestion project (L176). Every chunk must be re-embedded in the new space — that's corpus-size embedding cost (L150), pipeline time, and an index rebuild (L182). The senior design versiones the embedding model (L341) and plans the migration like a schema change — never a silent config swap.

## 11. Follow-Up Questions

- How do you build the golden set for embedding quality (L195)?
- How does dimensionality interact with the vector store (L182)?
- When do you need multilingual embeddings (L181)?
- How does embedding caching work (L171)?
- How do you version an embedding model change (L341)?

## 12. Comparison Table — The Embedding Axes

| Axis | Question | The trade |
|---|---|---|
| Domain (L181) | does it speak my content? | general vs multilingual/code |
| Quality (L195) | does it retrieve my chunks? | measured on the golden set |
| Cost (L150) | what's the per-token price? | corpus × query volume |
| Dimensionality (L182) | how big is the space? | quality vs storage/search |

The senior read: **the axes compose** — domain narrows, quality measures, cost and dimensionality bound.

## 13. Code Example — The Embedding Decision, Applied

```js
// Embeddings for RAG: one model, measured, both sides (L181, L195).
import { embedMany, embed } from './embeddings';

// INGESTION — the chosen model embeds every chunk (L176-181).
const MODEL = 'text-embedding-3-small';      // chosen by domain + cost (L150)
const DIMS = 256;                             // truncation — storage lever (L182)

async function ingestChunks(chunks) {
  const vectors = await embedMany(chunks, { model: MODEL, dims: DIMS });  // one model
  for (let i = 0; i < chunks.length; i++) {
    await indexChunk({ ...chunks[i], vector: vectors[i] });
  }
}

// QUERY — the SAME model, or the space breaks (L181).
async function search(question) {
  const qv = await embed(question, { model: MODEL, dims: DIMS });  // same model!
  return index.search(qv, { topK: 5 });
}

// VALIDATION — the choice is measured on a golden set (L195).
const candidates = ['text-embedding-3-small', 'text-embedding-3-large', 'bge-m3'];
for (const model of candidates) {
  const { precision, recall } = await evaluateEmbedding(model, goldenSet);  // L195
  log({ model, precision, recall });          // the winner is empirical (L332)
}
```

```text
What the reader must SEE — the rule and the measurement:

  const MODEL = …            chosen once, used everywhere (L181)
  embedMany + embed          same model, both sides (the invariant)
  evaluateEmbedding(model)   the golden set scores the choice (L195)

  One model, one space, measured on the content.
```

```narrate
3-5: The model and dimension are constants — chosen for the domain and the index (L181, L182).
7-12: Ingestion embeds every chunk with the chosen model, truncated to the storage budget (L176, L182).
15-19: Queries use the SAME model — mixing breaks the space (L181).
22-26: The golden set scores each candidate — the winner is measured, not assumed (L195, L332).
```

> [!TIP]
> The invariant is the pair `const MODEL` + the comment "same model!": **one embedding model for the index and the queries, chosen once, measured on the golden set (L195).** Everything else is tuning.

## 14. Performance Notes

- **Dimensionality drives the index (L182).** Vector memory and search speed scale with dims — truncation (L182) is the storage and latency lever (L151).
- **Embedding is a batch workload (L222).** Ingestion embeds the corpus — queue it (L222), cache by content hash (L171), and parallelize the workers.
- **Embedding cost is small but scales (L150).** Per-token it's cheaper than generation, but corpus × re-ingestion adds up (L176) — the cache (L171) and dedup (L176) are the controls.
- **The golden set runs in CI (L195, L341).** Embedding quality is re-measured on every candidate and every corpus change — the eval is a regression suite (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Retrieval misses obvious matches | Wrong embedding for the domain (L195) | Score candidates on the golden set |
| Everything retrieves wrong | Mixed models — chunks vs queries (L181) | Re-embed the index with one model (L176) |
| Index too big / search slow | Dimensionality too high (L182) | Truncate dims; measure the quality cost (L195) |
| Multilingual queries fail | General model on multilingual corpus (L181) | Switch to a multilingual embedding |
| Upgrade broke retrieval | Model swapped without re-ingest (L176) | Re-embed; version the model (L341) |

## 16. Quick Revision Notes

- The embedding is **the retrieval representation** (L181) — it defines "similar" (L189).
- Four axes: **domain, quality (L195), cost (L150), dimensionality (L182)**.
- **The invariant: one model for chunks and queries** (L181).
- Dimensionality = **quality vs storage/search** (L182) — truncation is the lever.
- A model upgrade is a **re-ingestion project** (L176, L341), not a config change.
- Cache embeddings **by content hash** (L171) — re-ingestion gets cheap.

## 17. Cheat Sheet

```text
EMBEDDINGS FOR RAG = the map of your domain

THE ROLE (L181)
  the embedding defines the space where similarity is measured (L189)
  the model decides what "relevant" means for YOUR content

THE FOUR AXES
  domain    general · multilingual · code (L181)
  quality   golden set → precision/recall (L195) — measured, not assumed
  cost      $ per million tokens × corpus + queries (L150)
  dims      quality vs storage/search (L182) — truncation is the lever

THE INVARIANT (L181)
  ONE model for chunks and queries
  mixing models = broken space = re-ingestion (L176)

THE MIGRATION RULE
  model upgrade = re-ingestion project (L176, L341)
  version it, cost it, never swap silently

INTERVIEW, 4 MOVES
  1 role    "the embedding is the representation (L181)"
  2 axes    "domain, quality, cost, dimensionality"
  3 rule    "one model, both sides (the invariant)"
  4 measure "the golden set decides (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - The embedding model is **the retrieval representation** (L181) — it decides what "similar" means for your domain (L189)
> - Choose by **four axes**: domain, quality (measured on a golden set, L195), cost (L150), and dimensionality (L182)
> - **The invariant: one model for chunks and queries** (L181) — a mixed space never measures similarity correctly
> - **Dimensionality is an index decision** (L182) — quality vs storage and search speed, with truncation as the measured lever
> - A model upgrade is a **re-ingestion project** (L176, L341) — versioned and costed, never a silent config swap
> - **Cache embeddings by content hash** (L171) — re-ingestion and repeated queries get nearly free

## Check your understanding

Answer these without looking back.

1. Why is the embedding called the retrieval representation (L189)?
2. Name the four axes of the embedding decision.
3. What's the invariant, and what breaks it (L181)?
4. How does dimensionality trade against the index (L182)?
5. How do you measure embedding quality (L195)?
6. What does a model upgrade cost (L176)?
7. When do you need multilingual embeddings (L181)?
8. Why is embedding caching a lever (L171)?

## A Closing Note — The Space Your Retrieval Lives In

You now hold the representation decision: **the embedding model that defines "similar" for your domain — chosen by domain, quality, cost and dimensionality, measured on a golden set, and shared by both sides of retrieval.** One model, one space, and the whole index lives in it.

Next: where that space is stored — vector databases (L182), the ANN search over coordinates.
