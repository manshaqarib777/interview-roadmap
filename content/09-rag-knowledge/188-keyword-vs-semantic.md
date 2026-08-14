# Lesson 188 — Keyword vs Semantic Search

**Interview importance:** ⭐⭐⭐⭐ — "BM25 vs embeddings?" — the answer is *what each finds that the other misses*: exact tokens vs meaning — and why production uses both (L187).**

L187 gave you the hybrid. This lesson is the **two channels, understood deeply**: keyword search (BM25) and semantic search (embeddings, L181) — what each *is*, what each *finds*, and what each *misses*. Keyword is exact-token precision: term frequency, rarity, and the inverted index (L188). Semantic is meaning-based recall: embeddings and the vector space (L181). The senior answer explains the *mechanisms* — why BM25 finds "7A-220" and why embeddings find "damaged goods" — and why production composes them (L187).

The distinction this lesson is built on: a **demo** picks one. A **solutions architect** understands both mechanisms — the inverted index and the embedding space — names what each catches and misses (L188), and composes them (L187) with the golden set (L195) as the judge.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain BM25: term frequency, inverse document frequency, the inverted index (L188)
- Explain semantic search: embeddings and the vector space (L181)
- Name what each finds that the other misses (L188)
- Explain the failure modes: token-blind and meaning-blind retrieval (L196)
- Explain why production composes both (L187)

## 1. One-Line Definition

**Keyword and semantic search are the two retrieval mechanisms: BM25 — exact-token matching over an inverted index, weighted by term frequency and rarity (L188) — and semantic search — meaning-based matching over an embedding space (L181) — each finding what the other misses: BM25 catches exact terms (codes, names, IDs), embeddings catch concepts (synonyms, paraphrase) — so production composes them (L187), measured on the golden set (L195).**

The one-sentence interview answer: *"Two mechanisms, two blind spots (L188). BM25 is exact-token search: an inverted index of terms, scored by term frequency and inverse document frequency — it finds the exact tokens: part numbers, error codes, names — but it's meaning-blind: 'damaged goods' won't match 'broken items' (L188). Semantic search is meaning-based: embeddings (L181) map text to a vector space, and similarity means related meaning — it finds paraphrase and concepts — but it's token-blind: '7A-220' has no semantic neighborhood (L181). Real corpora have both — so production runs both and fuses them (L187), with the golden set (L195) measuring which channel matters for each query shape."*

## 2. Mental Model

Think of the two retrievers as **a dictionary and a thesaurus.** The dictionary (BM25) is exact: you look up "7A-220" and it's on the page — the exact string, weighted by how rare and specific it is. The thesaurus (semantic, L181) is conceptual: you look up "damaged goods" and it points you to "broken items", "defective products", "return policy" — related meaning, not exact words. A perfect search needs both: the dictionary for the exact code, the thesaurus for the concept.

```text
   the dictionary (BM25, L188)      the thesaurus (semantic, L181)
   ┌──────────────────────┐         ┌──────────────────────────┐
   │ exact strings        │         │ related meanings         │
   │ "7A-220" → the page  │         │ "damaged" → broken,      │
   │ weighted by rarity   │         │   defective, return      │
   │ (idf) + frequency    │         │ synonym, paraphrase      │
   │ MISSES: "broken"     │         │ MISSES: "7A-220"         │
   └──────────────────────┘         └──────────────────────────┘
```

The mental model is **dictionary + thesaurus**: exactness and meaning, two different mechanisms with complementary blind spots.

## 3. Visual Flow — The Two Mechanisms

```text
   a query: "where's the return policy for damaged 7A-220 units?"
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ BM25 (L188) — the dictionary                             │
   │  tokens: [damaged, return, policy, 7A-220, units]        │
   │  inverted index → docs containing the terms              │
   │  score: term frequency × inverse doc frequency           │
   │  "7A-220" is rare → HIGH idf → exact match dominates     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ EMBEDDINGS (L181) — the thesaurus                        │
   │  the query → one vector                                  │
   │  ANN (L182) → chunks whose meaning is near               │
   │  "return policy" finds the policy page (paraphrase OK)   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   FUSE (L187) — the hybrid: the policy page (both channels)
   ranks above everything either channel found alone
```

The flow is the complementarity: **BM25 pins the exact token; embeddings find the concept; the fuse (L187) combines them** — and the golden set (L195) measures both.

## 4. How It Works — The Two Mechanisms, Deep

- **BM25 (L188).** The exact-token mechanism. An inverted index maps each term to the documents containing it. A query is tokenized; each term's score is **term frequency** (how often it appears in the doc) × **inverse document frequency** (how rare the term is across the corpus — a rare term like "7A-220" is highly discriminative). The document score is the sum over query terms. It's precise, explainable, and cheap — and it's in Postgres (tsvector, L183) and every store (L184–185).
- **Semantic search (L181).** The meaning-based mechanism. The query and the chunks are embedded into a vector space (L181); similarity means related *meaning* (synonyms, paraphrase, concepts) — the thesaurus effect. Retrieval is ANN over the vectors (L182). It catches what words *mean*, not just what they say.
- **What keyword finds that semantic misses (L188).** Exact tokens — part numbers, error codes, product names, IDs, legal clause numbers. These have no semantic neighborhood; the embedding blurs them into a generic region. BM25's rarity weighting (idf) makes them *the* most discriminative terms.
- **What semantic finds that keyword misses (L181).** Paraphrase, synonyms, concepts, and cross-language meaning. "Damaged goods" ↔ "broken items", "how do I return" ↔ "return policy" — different words, same meaning. The embedding sees the meaning; BM25 sees only the words.

> [!NOTE]
> **The blind spots are mirror images (L188, L196).** Keyword is *meaning-blind* — a query phrased differently than the document fails even when the meaning matches. Semantic is *token-blind* — an exact token that matters (the code, the name) is lost in the embedding's generality. The hybrid (L187) exists because the two blind spots are complementary: each channel covers the other's miss. And both blind spots are *measured* failures (L195) — the golden set shows them before users do (L196).

## 5. Real Project Usage

- **Support knowledge bases.** Error codes ("ERR_429") need BM25's exact match (L188); "my connection keeps failing" needs semantic's paraphrase (L181) — the hybrid (L187) covers both.
- **Product catalogs.** SKUs and model numbers (exact, L188) plus "waterproof hiking boots" (concept, L181).
- **Codebase Q&A.** Function names are exact (L188); "how do I retry a failed call" is semantic (L181).
- **Legal research.** Clause numbers ("§7") exact; "early termination rights" conceptual — both channels (L195).
- **E-commerce.** Brand names and product codes (keyword) plus intent and synonym queries (semantic) — the L187 composition.

The through-line: **real queries mix exact tokens and concepts** — the corpus and the query shapes decide how much each channel matters (L195).

## 6. Interview Explanation

Say it in four moves:

1. **The mechanisms.** "BM25 is exact-token search — an inverted index, scored by term frequency × inverse document frequency (L188). Semantic is meaning search — embeddings in a vector space (L181)."
2. **The blind spots.** "Keyword is meaning-blind — paraphrase fails. Semantic is token-blind — exact codes have no neighborhood (L188, L181)."
3. **The complement.** "They're mirror images — each covers the other's miss. That's why production runs both (L187)."
4. **The measure.** "The golden set (L195) shows which channel carries which query shape — and what the fuse gains."

## 7. Senior-Level Insights

- **The mechanisms explain the failures (L188).** The senior answer explains *why* each channel misses — inverted-index tokenization vs embedding blur — not just "they're different". The mechanism is the argument (L196).
- **IDF is the keyword superpower (L188).** Rarity weighting is why BM25 dominates on exact tokens — "7A-220" is rare, so it's the most discriminative term in the query. The embedding has no equivalent — it can't see rarity.
- **The embedding space is the semantic superpower (L181).** Meaning proximity — synonyms and paraphrase near each other — is the thesaurus effect no tokenizer produces. The two channels are fundamentally different geometry: sparse term space vs dense semantic space.
- **The composition is measured, not assumed (L195).** Golden set precision/recall per channel and fused — the query shapes reveal the mix: code-heavy corpora lean keyword, prose-heavy lean semantic. The mix is a fact about the corpus (L195), tuned like any parameter (L341).
- **The hybrid is the production default (L187).** With both channels available in every store (L183–185), the L188 lesson's conclusion is practical: don't pick — compose, and let the numbers weight the channels.

## 8. Common Mistakes

- **Keyword-only (L188).** Meaning-blind — "broken items" misses the "return policy" page (L181).
- **Semantic-only (L181).** Token-blind — "7A-220" misses the exact product page (L187).
- **Treating them as rivals (L188).** Picking a "winner" instead of composing — the blind spots are complementary (L187).
- **Ignoring IDF (L188).** Raw term frequency without rarity weighting — common words dominate and exact tokens lose their power.
- **No measurement (L195).** The channel mix guessed instead of measured — the golden set is the judge (L341).
- **One embedding for everything (L181).** The semantic channel's quality is bounded by the embedding choice (L181) — a poor model makes the semantic channel worse than nothing.

## 9. Best Practices

- **Understand the blind spots** (L188) — exact tokens need BM25; concepts need embeddings (L181).
- **Compose both** (L187) — the hybrid is the production default.
- **Weight by IDF** (L188) — rarity is the keyword channel's precision engine.
- **Choose the embedding for the meaning** (L181) — domain, quality, dimensionality (L195).
- **Measure the mix** (L195) — golden set per channel and fused; tune the weights (L341).
- **Cache the repeats** (L171) — both channels skip on a cached hit.

## 10. Interview Questions

**Q: Keyword vs semantic search — what's the difference?**
> A: Two mechanisms (L188). BM25 is exact-token search: an inverted index, scored by term frequency × inverse document frequency — it finds exact terms: codes, names, IDs. Semantic search embeds text into a vector space (L181) and finds related meaning — synonyms, paraphrase, concepts. Keyword is meaning-blind; semantic is token-blind. That's why production composes them (L187).

**Q: Why does BM25 beat embeddings on exact tokens?**
> A: Because of IDF — inverse document frequency (L188). "7A-220" is rare, so it's the most discriminative term in the query — BM25 weights it highest and goes straight to the exact match. An embedding blurs "7A-220" into a generic "product" region — exact tokens have no semantic neighborhood (L181). Rarity is a signal BM25 sees and the vector space can't.

**Q: When does semantic beat keyword?**
> A: When the meaning outranks the words (L181). "My connection keeps failing" and "the API returns errors" share no tokens, but the same meaning — the embedding space puts them near each other, so the semantic channel finds the right doc where BM25 finds nothing. Paraphrase, synonyms, and concepts are the semantic channel's territory (L188).

**Q: So which do you use?**
> A: Both — the hybrid (L187). The blind spots are mirror images: keyword misses meaning, semantic misses exact tokens. Real corpora have both. I run BM25 and embeddings, fuse with RRF (L187), and measure the mix on the golden set (L195) — code-heavy corpora lean keyword, prose-heavy lean semantic, and the numbers set the weights.

## 11. Follow-Up Questions

- How does the inverted index work under the hood (L188)?
- What exactly does IDF weight, and why does it matter?
- How does the embedding choice bound the semantic channel (L181)?
- How do you measure the channel mix (L195)?
- When would one channel alone be enough?

## 12. Comparison Table — The Two Mechanisms

| | Keyword / BM25 (L188) | Semantic / embeddings (L181) |
|---|---|---|
| Mechanism | inverted index, TF-IDF | vector space, ANN (L182) |
| Finds | exact tokens | related meaning |
| Weighted by | rarity (IDF) + frequency | distance in the space |
| Misses | paraphrase (meaning-blind) | exact tokens (token-blind) |
| Cost (L150) | cheap, explainable | embedding + ANN |
| Best for | codes, names, IDs | concepts, synonyms |

The senior read: **the blind-spot row is the whole argument** — complementary misses are why production composes (L187).

## 13. Code Example — Both Channels, Explained

```js
// Keyword vs semantic — the two mechanisms, side by side (L188, L181).
import { bm25 } from './keyword';              // the dictionary (L188)
import { embed, annSearch } from './semantic'; // the thesaurus (L181-182)

// 1 · KEYWORD — the inverted index, weighted by rarity (L188).
//    "7A-220" is rare → high IDF → the exact match dominates.
const keywordHits = await bm25.search('return policy for damaged 7A-220 units');
//    terms: [return, policy, damaged, 7A-220, units]
//    doc score = Σ tf(term, doc) × idf(term)   ← the mechanism

// 2 · SEMANTIC — one vector, nearest meaning (L181).
const qVector = await embed('where can I send back a broken unit?');
const semanticHits = await annSearch(qVector, { topK: 20 });   // L182
//    "broken unit" ≈ "return policy" — the thesaurus effect (L181)

// 3 · THE COMPOSE — each covers the other's blind spot (L187).
const fused = rrf(keywordHits, semanticHits);   // ranks, not scores
```

```text
What the reader must SEE — the two mechanisms, the two blind spots:

  bm25.search()    tf × idf — exact tokens, weighted by rarity (L188)
  embed + annSearch  meaning proximity — paraphrase finds the page (L181)
  rrf()            the compose — mirror-image blind spots (L187)

  The dictionary and the thesaurus, one ranking.
```

```narrate
4-7: The keyword channel — the inverted index scores exact tokens by frequency × rarity (L188).
10-12: The semantic channel — the query embeds to one vector, ANN finds nearest meaning (L181-182).
15-16: The fuse — each channel covers the other's miss (L187).
```

> [!TIP]
> The pair that explains the whole lesson: **`idf(term)`** (why keyword pins exact tokens, L188) and **`'broken unit' ≈ 'return policy'`** (why semantic finds meaning, L181). **Rarity vs proximity — the two mechanisms, composed by RRF (L187).**

## 14. Performance Notes

- **BM25 is the cheap channel (L150).** An inverted index is small and fast — the keyword channel's latency (L151) is negligible next to ANN (L182).
- **The embedding is the expensive channel (L150, L181).** Query-time embedding plus ANN — and the embedding model's quality bounds the channel (L181).
- **The hybrid runs both (L151).** Parallelize the channels (L222); the fuse (L187) is O(n log n) on shortlists — never the bottleneck.
- **Caching skips both (L171).** The response cache (L171) serves repeats without either channel — the hybrid's economics.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Exact code not found | Semantic-only (L181) | Add BM25; check IDF (L188) |
| Paraphrase fails | Keyword-only (L188) | Add the embedding channel (L181) |
| Common words dominate | IDF missing (L188) | Weight by rarity |
| Concepts blurred | Poor embedding model (L181) | Re-measure on the golden set (L195) |
| Channel mix wrong | Never measured (L195) | Golden set per channel + fused (L341) |

## 16. Quick Revision Notes

- **BM25** = exact tokens, TF × IDF, inverted index (L188).
- **Semantic** = meaning proximity, embeddings, ANN (L181).
- Keyword is **meaning-blind**; semantic is **token-blind** (L188, L181).
- The blind spots are **mirror images** — compose (L187).
- **IDF** is the keyword superpower; **the space** is semantic's (L188, L181).
- The mix is **measured** (L195), never assumed (L341).

## 17. Cheat Sheet

```text
KEYWORD vs SEMANTIC = the dictionary and the thesaurus

THE MECHANISMS (L188, L181)
  BM25         inverted index · tf × idf · exact tokens
  embeddings   vector space · ANN (L182) · related meaning

THE BLIND SPOTS — mirror images
  keyword      meaning-blind: "broken" won't match "damaged" (L188)
  semantic     token-blind: "7A-220" has no neighborhood (L181)

THE SUPERPOWERS
  keyword      IDF — rarity is the precision engine (L188)
  semantic     the space — proximity is the recall engine (L181)

THE COMPOSE (L187)
  run both → fuse with RRF → one ranking
  each channel covers the other's miss

THE MEASURE (L195)
  golden set: per-channel + fused precision/recall
  code-heavy → lean keyword · prose-heavy → lean semantic
  the mix is a fact about the corpus, tuned (L341)

INTERVIEW, 4 MOVES
  1 mechanisms "inverted index vs vector space"
  2 blind spots "meaning-blind vs token-blind"
  3 compose    "RRF — the mirror images fused (L187)"
  4 measure    "the golden set sets the mix (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - **BM25** is exact-token search — an inverted index scored by term frequency × inverse document frequency (L188); **semantic search** is meaning-based — embeddings in a vector space (L181)
> - The blind spots are **mirror images**: keyword is meaning-blind (paraphrase fails), semantic is token-blind (exact codes have no neighborhood) (L188, L181)
> - **IDF is the keyword superpower** — rarity weights exact tokens highest; **the space is semantic's** — proximity captures meaning no tokenizer produces (L188, L181)
> - Production **composes both** (L187) — RRF fuses the ranked lists, each channel covering the other's miss
> - The channel mix is **measured on the golden set (L195)** — code-heavy corpora lean keyword, prose-heavy lean semantic — and tuned like any parameter (L341)
> - Understanding the mechanisms is what turns "hybrid is better" into "**here's why, and here's how the numbers show it**"

## Check your understanding

Answer these without looking back.

1. How does BM25 score a document (L188)?
2. What's the semantic channel's mechanism (L181)?
3. Name each channel's blind spot.
4. Why is IDF the keyword superpower?
5. When does semantic beat keyword (L188)?
6. Why compose rather than pick (L187)?
7. How do you measure the channel mix (L195)?
8. What bounds the semantic channel's quality (L181)?

## A Closing Note — Two Mechanisms, One Ranking

You now hold the two channels, understood deeply: **the dictionary — BM25, exact tokens weighted by rarity — and the thesaurus — embeddings, meaning measured by proximity.** Each is half a retriever; their blind spots are mirror images; and the fuse (L187) is how production gets the whole.

Next: the retrieval stage itself — retrieval (top-k, filters, scoring) (L189), where a query becomes a shortlist.
