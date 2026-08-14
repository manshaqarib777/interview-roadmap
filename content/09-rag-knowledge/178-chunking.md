# Lesson 178 — Chunking Fundamentals

**Interview importance:** ⭐⭐⭐⭐ — "how do you chunk documents for RAG?" — the answer is the *size, overlap and boundary* decision — the granularity that determines retrieval quality (L195).

L176–177 built the factory and the parser. This lesson is the **granularity decision**: chunking — splitting clean text into retrieval-sized pieces. Chunk size, overlap, and boundaries decide everything downstream: whether the relevant answer lives in one chunk (retrievable, L189), whether context fits the budget (L149, L191), and whether retrieval can find the needle (L195). It's the most-tuned knob in RAG because it's the cheapest to get wrong.

The distinction this lesson is built on: a **demo** splits on a fixed character count and never looks back. A **solutions architect** knows chunking is a *trade*: too small loses context, too big buries the answer (and explodes the budget, L149). The design chooses size for the retrieval task, overlap for the boundaries, and boundaries that respect the document's own structure (L179) — then measures the choice (L195).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the chunking trade: too small loses context, too big buries the answer (L178)
- Choose chunk size by retrieval task, content type, and token budget (L149)
- Explain overlap and why boundaries matter (L179)
- Describe how chunking affects retrieval quality (L189, L195) and context cost (L191)
- Give the decision rule for a first chunking config

## 1. One-Line Definition

**Chunking is the granularity decision of RAG — splitting documents into retrieval-sized pieces, balancing context (bigger chunks carry more) against precision (smaller chunks retrieve cleaner), with overlap to protect boundary answers — a size, an overlap, and a boundary strategy, chosen for the retrieval task and measured by retrieval quality (L195).**

The one-sentence interview answer: *"Chunking is the granularity trade. Too small — a chunk lacks the context to answer (L178). Too big — the answer is buried in noise, and the context blows the token budget (L149, L191). I choose size by the task: sentence-ish chunks for precise Q&A, section chunks for summaries (L179). I add overlap so answers split across boundaries still retrieve whole (L179). And I make the boundaries respect the document's structure — headings, paragraphs, code blocks (L177) — because structure-aware chunks retrieve better than fixed-size slices (L195)."*

## 2. Mental Model

Think of chunking as **cutting a loaf of bread for sandwiches — the slice size decides the sandwich.** Too thin, and the filling (the answer) doesn't fit on one slice — it's split across two, and neither sandwich works alone. Too thick, and every sandwich is mostly bread (noise) — the filling is in there, but so is a lot you didn't want, and the box (the token budget, L149) only holds so many sandwiches. The baker (you) chooses the slice for the meal (the task): thin for a precise bite, thick for a hearty one.

```text
   too small (thin slices)        too big (thick slices)
   ┌──────┐ ┌──────┐ ┌──────┐    ┌──────────────────────────┐
   │ chunk │ │ the  │ │ is   │    │ the whole section in one  │
   │ 1     │ │answer│ │ split│    │ chunk — the answer is     │
   │ (no   │ │is    │ │      │    │ in there, but buried in   │
   │  ctx) │ │split │ │      │    │ noise + budget blowout    │
   └──────┘ └──────┘ └──────┘    └──────────────────────────┘
     no context                    too much noise (L149, L191)

   just right — task-sized, boundary-aware (L179)
   ┌──────────────────────────┐
   │ the section, as one chunk │
   │ with its heading (L178)   │
   └──────────────────────────┘
```

The mental model is **slice for the meal**: the chunk is sized for the retrieval task, not for the file — and the boundaries follow the bread's own structure (headings, paragraphs).

## 3. Visual Flow — Text Into Chunks

```text
   clean, structured text (L177)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CHOOSE SIZE (L178)                                   │
   │     task: precise Q&A → smaller; summary → larger        │
   │     content: dense (contracts) → smaller; prose → larger │
   │     budget: chunk × top-k ≤ context budget (L149)        │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · CHOOSE BOUNDARIES (L179)                             │
   │     respect structure: headings, paragraphs, code blocks │
   │     fixed-size only as a fallback (L179)                 │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · ADD OVERLAP (L179)                                   │
   │     small overlap at boundaries so answers split across  │
   │     chunks still retrieve whole                          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · MEASURE (L195)                                       │
   │     retrieval on a golden set → tune size / overlap      │
   └──────────────────────────────────────────────────────────┘
                      ▼
   chunks → embed (L181) → index (L180)
```

The flow is the decision: **size for the task, boundaries from structure, overlap for safety, measured by retrieval.** Chunking is a tunable knob with a measuring loop (L195), not a fixed default.

## 4. How It Works — The Trade, the Size, the Overlap, the Boundaries

- **The trade.** A chunk is the unit of retrieval (L189) — it's what the model reads (L191), so it must contain enough context to answer *and* be specific enough to match the query. Too small: the answer lives outside the retrieved chunk (a miss). Too big: the chunk matches the query but the answer is buried in noise — and top-k × chunk-size explodes the token budget (L149).
- **Size by task (L179).** Precise Q&A wants sentence/paragraph chunks — tight, specific. Summaries and overviews want section chunks — the full context of a topic. There's no universal number; the size is *a function of the question being asked* (L179).
- **Overlap (L179).** A small overlap (e.g. 10–15%) at chunk boundaries keeps answers that straddle a split retrievable whole — the "split-answer" failure mode is the reason overlap exists.
- **Boundaries (L179).** Structure-aware boundaries — split at headings, paragraphs, lists, code blocks (L177) — produce chunks that are internally coherent, which retrieves better than fixed-size slices that cut mid-sentence. The document's own structure is the best chunking map.

> [!NOTE]
> **The budget arithmetic is the discipline (L149, L191).** Retrieval returns top-k chunks; the context is top-k × chunk-size tokens. Chunk size and top-k are *two knobs on one budget*: bigger chunks mean fewer can fit in the context window (L138), and the cost (L150) scales with both. The senior design picks a budget first (L149) and sizes chunks inside it — never the other way around.

## 5. Real Project Usage

- **Legal contracts.** Dense clauses → smaller chunks by clause (L179) → "what's the termination clause?" retrieves the exact clause, not the whole contract.
- **Product manuals.** Sections with tables → section chunks preserving tables (L177) → "torque spec" finds the table chunk.
- **Support docs.** FAQ-style → sentence/paragraph chunks → precise answers with citations (L192).
- **Research papers.** Section chunks by heading (abstract, methods, results) → "what method did they use?" retrieves the methods section.
- **Code documentation.** Code blocks as chunk boundaries (L177) → "how do I use this function?" retrieves the function's docs + example together.

The through-line: **chunking is the retrieval task wearing a text-splitting hat** — the size, boundary and overlap choices are quality decisions (L195), not defaults.

## 6. Interview Explanation

Say it in four moves:

1. **The trade.** "Chunking balances context against precision: too small loses context, too big buries the answer and blows the budget (L149)."
2. **The size.** "I size for the task — precise Q&A wants sentence/paragraph chunks, summaries want sections (L179). The budget comes first (L149): chunk × top-k must fit the context."
3. **The boundaries.** "I split on structure — headings, paragraphs, code blocks (L177) — with a small overlap so straddling answers stay whole (L179)."
4. **The measurement.** "Then I measure retrieval on a golden set (L195) and tune size and overlap — chunking is a knob with a gauge, not a default."

## 7. Senior-Level Insights

- **Chunking is a retrieval-quality decision (L195).** The senior answer treats chunk size as a measured hyperparameter — golden set, retrieval metrics, tune. The demo treats it as a constant.
- **The budget is the constraint (L149, L191).** Chunk size and top-k compose on one token budget — the senior design sets the budget first (L149) and derives the chunk size inside it, keeping the context cost (L150) bounded.
- **Structure is the best chunking map (L177, L179).** Headings, paragraphs and code blocks are the document's own outline — structure-aware chunking retrieves better than any fixed-size split (L179).
- **Overlap is the boundary insurance (L179).** The split-answer failure — the answer straddling two chunks — is prevented by a small overlap and caught by evals (L195). Both are the design.
- **Chunking interacts with everything downstream (L189, L191).** Chunk size sets the retrieval unit, the context budget, and the citation granularity (L192). A change to chunking re-tunes the whole pipeline — which is why it's measured (L195), not guessed.

## 8. Common Mistakes

- **A fixed character count everywhere.** No task, no structure (L179) — the universal default that fits no document well.
- **Too small.** Sentence fragments with no context (L178) — the retrieved chunk can't answer alone.
- **Too big.** Whole documents as "chunks" (L149) — the answer is buried, the budget explodes, top-k is meaningless.
- **No overlap.** Answers split across boundaries retrieve as halves (L179).
- **Cutting through structure.** Mid-table, mid-code-block, mid-heading splits (L177) — chunks that are internally incoherent.
- **Never measuring.** Chunking set once and never tuned (L195) — the knob with no gauge.

## 9. Best Practices

- **Set the budget first** (L149) — context window minus system/instructions, then chunk size and top-k fit inside it (L191).
- **Choose size by task** (L179) — precise Q&A: smaller; summary: larger; dense content: smaller.
- **Split on structure** (L177) — headings, paragraphs, lists, code blocks — with fixed-size only as fallback.
- **Add a small overlap** (L179) — 10–15% keeps boundary answers whole.
- **Keep tables and code intact** (L177) — a chunk is one coherent unit.
- **Measure and tune** (L195) — a golden set scores the chunking config; change it with data, not vibes.

## 10. Interview Questions

**Q: How do you chunk documents for RAG?**
> A: As a granularity trade (L178). Too small — no context to answer; too big — the answer is buried and the budget blows up (L149). I size for the task: precise Q&A wants sentence/paragraph chunks, summaries want sections (L179). I split on structure — headings, paragraphs, code (L177) — with a small overlap for boundary answers. Then I measure retrieval on a golden set (L195) and tune.

**Q: What's the right chunk size?**
> A: There's no universal number — it's a function of the task and the budget (L149). The constraint is first: top-k × chunk size must fit the context window (L191). Inside that, precise Q&A wants smaller chunks (tight, specific), summaries want larger (full context). The golden set (L195) decides between candidates — measured, not guessed.

**Q: Why overlap?**
> A: Because answers straddle boundaries (L179). Without overlap, a question whose answer is split across two chunks retrieves each half — and neither answers alone. A small overlap (10–15%) keeps the straddling answer intact in at least one chunk. It's cheap insurance against a specific failure mode.

**Q: Why do boundaries matter more than size?**
> A: Because a chunk is a unit of meaning, and structure is the document's own meaning map (L177). A chunk that respects headings and paragraphs is internally coherent — it retrieves as a unit and answers alone. A fixed-size slice cuts mid-sentence, mid-table, mid-code — internally incoherent, retrieves poorly (L195). Boundaries are the quality lever; size is the budget lever.

## 11. Follow-Up Questions

- How do chunk size and top-k share the budget (L149)?
- When is semantic chunking (L179) the right strategy?
- How do you measure a chunking change (L195)?
- How does chunk size affect citation granularity (L192)?
- How does chunking interact with hybrid search (L187)?

## 12. Comparison Table — The Chunking Choices

| Choice | Too small | Too big | Right (this lesson) |
|---|---|---|---|
| Context | none — can't answer (L178) | buried in noise | task-sized (L179) |
| Budget (L149) | cheap | explodes (L191) | sized inside the budget |
| Boundaries | mid-sentence cuts | whole documents | structure-aware (L177) |
| Overlap (L179) | — | — | 10–15%, boundary-safe |
| Retrieval (L189) | miss (answer outside) | noise (answer inside) | measured (L195) |

The senior read: **the middle column is the discipline** — chunking is a measured trade, not a default.

## 13. Code Example — Structure-Aware Chunking with Overlap

```js
// Structure-aware chunking: size for the task, boundaries from the doc (L178-179).
function chunkDocument(text, { targetTokens = 200, overlap = 0.15 } = {}) {
  const sections = splitByHeadings(text);           // structure first (L177)
  const chunks = [];

  for (const section of sections) {
    const blocks = splitByBlocks(section);           // paragraphs, lists, code (L177)
    let current = [];

    for (const block of blocks) {
      const next = [...current, block].join('\n\n');
      if (tokens(next) > targetTokens && current.length) {
        // Emit the chunk with overlap: keep the last block for the next one (L179).
        chunks.push(current.join('\n\n'));
        const overlapBlock = block.slice(0, Math.round(block.length * overlap));
        current = [overlapBlock, block];
      } else {
        current.push(block);
      }
    }
    if (current.length) chunks.push(current.join('\n\n'));
  }
  return chunks;
}

// The budget check (L149, L191): top-k × chunk tokens ≤ context budget.
const budget = 4000;                                  // context window (L138)
const topK = 5;
const maxChunkTokens = Math.floor(budget / topK);     // size derived FROM the budget
```

```text
What the reader must SEE — the three decisions in code:

  splitByHeadings / splitByBlocks → boundaries from structure (L177)
  overlap slice                  → boundary answers stay whole (L179)
  budget / topK                  → size derived from the budget (L149, L191)

  The chunk is sized by the budget and shaped by the document.
```

```narrate
4-5: Structure first — the document's own outline is the chunking map (L177).
7-16: Blocks accumulate to the target size; a chunk is emitted when full (L178).
17-20: Overlap keeps the tail block for the next chunk — boundary answers survive (L179).
23-26: The budget arithmetic — top-k × chunk size fits the context window (L149, L191).
```

> [!TIP]
> The line that shows the discipline is **`maxChunkTokens = budget / topK`** — chunk size derived *from* the budget, not chosen in a vacuum. **Budget first, chunks inside it (L149).**

## 14. Performance Notes

- **Chunk size sets the context cost (L149, L150).** Doubling the chunk size doubles the per-question token spend at the same top-k — the budget arithmetic (L191) is the cost control.
- **Overlap is a storage tax (L180).** Overlap duplicates tokens in the index (L150) — keep it small; it's insurance, not content.
- **Embedding cost scales with chunk count (L181).** Smaller chunks = more chunks = more embedding calls (L150) — another reason size is a budget decision.
- **Retrieval latency is roughly constant (L151).** The vector search cost (L182) doesn't change much with chunk size — but the context generation cost (L145, L191) does. The bottleneck moves to the model.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Answer missing though doc is indexed | Chunks too small — answer outside (L178) | Increase size; check boundary cuts |
| Answers vague, buried in noise | Chunks too big (L149) | Decrease size; re-tune top-k (L189) |
| Half-answers | Boundary split (L179) | Add/raise overlap |
| Context overflow (L138) | top-k × size over budget (L191) | Budget first, then size + top-k |
| Incoherent chunks | Cut through structure (L177) | Split on headings/blocks |

## 16. Quick Revision Notes

- Chunking = **the granularity trade**: context vs precision (L178).
- **Budget first (L149, L191)** — top-k × chunk size ≤ context.
- Size **for the task** (L179): Q&A smaller, summary larger.
- Boundaries **from structure** (L177): headings, paragraphs, code.
- **Overlap for straddling answers** (L179) — small, as insurance.
- **Measure and tune** (L195) — chunking is a knob with a gauge.

## 17. Cheat Sheet

```text
CHUNKING = the granularity decision of RAG

THE TRADE (L178)
  too small → no context to answer (miss)
  too big   → buried in noise + budget blowout (L149)

THE THREE KNOBS
  size       for the task (L179): Q&A small, summary large
  boundaries from structure (L177): headings, paragraphs, code
  overlap    10-15% — straddling answers stay whole (L179)

THE BUDGET ARITHMETIC (L149, L191)
  context budget = top-k × chunk size
  set the budget first — size derives from it

THE MEASUREMENT (L195)
  golden set → retrieval precision/recall → tune size/overlap
  chunking is a knob with a gauge, not a default

INTERVIEW, 4 MOVES
  1 trade    "context vs precision"
  2 size     "for the task, inside the budget (L149)"
  3 boundaries "structure first (L177), overlap for safety (L179)"
  4 measure  "golden set tunes it (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - Chunking is the **granularity trade** (L178): too small loses context, too big buries the answer and explodes the budget (L149)
> - **The budget comes first** (L149, L191) — top-k × chunk size must fit the context window (L138); size is derived from the budget
> - **Size for the task** (L179): precise Q&A wants sentence/paragraph chunks, summaries want sections — there is no universal number
> - **Boundaries follow structure** (L177): headings, paragraphs, lists and code blocks produce internally coherent chunks that retrieve well
> - **Overlap is the boundary insurance** (L179) — a small overlap keeps straddling answers whole
> - **Chunking is measured, not guessed** (L195) — a golden set scores the config and tunes it with data

## Check your understanding

Answer these without looking back.

1. What's the chunking trade (L178)?
2. How do chunk size and top-k share the budget (L149)?
3. Why are boundaries more important than size (L177)?
4. What failure does overlap prevent (L179)?
5. How do you choose size for a task (L179)?
6. What happens if you never measure (L195)?
7. How does chunk size affect cost (L150)?
8. What's the first decision in a chunking config (L149)?

## A Closing Note — The Knob That Sets Retrieval's Ceiling

You now hold the granularity decision: **size for the task, boundaries from structure, overlap for safety, and a budget that sizes it all.** Chunking is the cheapest quality lever in RAG — and the most-tuned, because it's the one that decides what retrieval can find (L195).

Next: the strategies — chunking strategies (L179), from fixed-size to semantic and document-aware splits.
