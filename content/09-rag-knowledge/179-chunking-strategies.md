# Lesson 179 — Chunking Strategies

**Interview importance:** ⭐⭐⭐⭐ — "what chunking strategy do you use?" — the senior answer is a *menu with a decision rule*: fixed, recursive, semantic, document-aware — chosen by content type and measured by retrieval quality (L195).

L178 gave you the granularity trade. This lesson is the **strategy menu**: *how* you split — fixed-size, recursive character, semantic (meaning-based), and document-aware (structure-based). Each fits a content type: fixed for uniform text, recursive for mixed structure, semantic for prose with shifting topics, document-aware for anything with headings and sections. The senior move is not "I use X" — it's "**here's the menu, here's the decision rule, and here's how I measure the choice (L195)**".

The distinction this lesson is built on: a **demo** uses one library default for everything. A **solutions architect** matches the strategy to the content — structured docs get structure-aware splits (L177), prose gets semantic or recursive, uniform text gets fixed — and validates the choice with retrieval evals (L195), because the best strategy is an empirical fact, not an opinion.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the four strategies: fixed, recursive, semantic, document-aware (L179)
- Match strategy to content type: structure, prose, uniformity (L177)
- Explain when semantic chunking earns its cost (L150)
- Explain the hybrid: document-aware boundaries + recursive fallback + semantic where it pays
- Validate a strategy choice with retrieval evals (L195)

## 1. One-Line Definition

**Chunking strategies are the four ways to split a document — fixed-size, recursive character, semantic (meaning-based), and document-aware (structure-based) — each fitted to a content type (L177) and chosen by a decision rule, then validated by retrieval quality (L195), because the right strategy is an empirical fact about your documents, not an opinion.**

The one-sentence interview answer: *"Four strategies, chosen by content (L179). Fixed-size — uniform text, simplest, no structure needed. Recursive — split on a hierarchy of separators (paragraph, sentence), good for mixed prose. Semantic — embed, then cut where meaning shifts; the quality upgrade for long prose, at embedding cost (L150). Document-aware — split on the document's own headings and sections (L177); the best map when structure exists. My decision rule: structure → document-aware; prose → recursive or semantic; uniform → fixed. And I validate with retrieval evals (L195) — the strategy is a measured choice, not a preference."*

## 2. Mental Model

Think of the four strategies as **four ways to cut a steak — by the grain, by the fork, by the marble, or by the plate.** Fixed-size cuts by the ruler (equal slices, ignores the grain). Recursive cuts by the fork tines (paragraph, then sentence — the text's own natural breaks). Semantic cuts by the marble (where the meat's character changes — meaning shifts). Document-aware cuts by the plate lines (where the document itself divided the meal — headings, sections, L177).

```text
   fixed-size            recursive             semantic              document-aware
   ┌───────┐ ┌───────┐   ┌─────────┐           ┌─────┐               ┌─────────────┐
   │ equal │ │ equal │   │ paragraph│           │ topic A │           │ ## Section 1│
   │ slices│ │ slices│   │ then     │           │ ─────── │           │ (heading-   │
   │ by N  │ │ by N  │   │ sentence │           │ topic B │           │  bounded)   │
   └───────┘ └───────┘   └─────────┘           └─────┘               └─────────────┘
   uniform text          mixed prose           long prose             structured docs
   simplest (L179)       separator hierarchy   meaning shifts (L150)  structure map (L177)
```

The mental model is **cut by the document's nature**: the strategy matches the content's structure (or lack of it), and the cost (semantic's embeddings, L150) is justified by the content.

## 3. Visual Flow — Choosing a Strategy

```text
   a document's content
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · HAS STRUCTURE? (L177)                                │
   │     headings · sections · lists → DOCUMENT-AWARE (L179)  │
   │     split at headings, chunks per section                │
   └──────────────────┬───────────────────────────────────────┘
                      ▼ no
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · UNIFORM TEXT? (fixed-width, logs, flat prose)        │
   │     yes → FIXED-SIZE (L179) — simplest, works            │
   │     no → prose with mixed structure                      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · MEANING MATTERS + COST OK? (L150)                    │
   │     long prose, shifting topics → SEMANTIC (L179)        │
   │     otherwise → RECURSIVE (separator hierarchy)          │
   └──────────────────────────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · VALIDATE (L195)                                      │
   │     golden set → retrieval metrics → keep or switch      │
   └──────────────────────────────────────────────────────────┘
```

The flow is the decision rule: **structure → document-aware; uniform → fixed; prose → recursive or semantic — then measure (L195).**

## 4. How It Works — The Four Strategies

- **Fixed-size.** Split by a character or token count — simplest, no structure awareness. It works for uniform text (logs, fixed-width records, flat prose) but cuts through paragraphs and meaning. The baseline every other strategy beats (L195).
- **Recursive character.** Split on a *hierarchy* of separators: try paragraph breaks, then sentences, then words — the text's own natural breaks, sized to the target. Good for prose with mixed structure. Cheap, structure-aware at a coarse level.
- **Semantic chunking.** Embed the text (L181), then cut where the *meaning* shifts — adjacent embeddings that are far apart mark a topic boundary. The quality upgrade for long, topic-shifting prose; the cost is the embedding calls (L150). It groups by meaning, not by size.
- **Document-aware.** Split on the document's own headings and sections (L177) — each section (or heading + first paragraphs) is a chunk. The best map when structure exists: headings are the document's own topic boundaries, and chunks inherit the section's topic (and its metadata, L180).

> [!NOTE]
> **The hybrid is the production answer.** Most real documents mix structures: a manual has headings (document-aware) with prose sections (recursive or semantic) and code blocks (kept intact). The production strategy composes: **document-aware for the outline, recursive inside sections, semantic where meaning shifts, fixed as fallback** — and the whole thing validated by evals (L195). The four strategies are a menu, not a religion.

## 5. Real Project Usage

- **Contracts (structured).** Document-aware — split at clause headings (L177); each clause is a retrievable unit (L189), and citations (L192) point to the clause.
- **Research papers (semi-structured).** Document-aware sections (abstract, methods, results) with recursive inside; multi-column handled at parse (L177).
- **Blog posts / long prose (unstructured).** Semantic — topic-shifting prose chunks by meaning; or recursive when cost matters (L150).
- **Support docs (FAQ-style).** Document-aware question headings → one chunk per Q&A.
- **Logs / data dumps (uniform).** Fixed-size — no structure to respect, and the baseline is fine.

The through-line: **the strategy follows the content** — and the content's structure (L177) is the first thing the strategy asks about.

## 6. Interview Explanation

Say it in four moves:

1. **The menu.** "Four strategies: fixed-size, recursive (separator hierarchy), semantic (meaning-based), document-aware (structure-based, L177)."
2. **The rule.** "Structure → document-aware. Uniform text → fixed. Prose → recursive, and semantic when meaning shifts and the cost is worth it (L150)."
3. **The hybrid.** "Production composes them: headings first, recursive inside sections, semantic where it pays."
4. **The validation.** "I measure on a golden set (L195) — the strategy is an empirical fact about my documents, so I let the evals decide, not my preference."

## 7. Senior-Level Insights

- **The strategy is a decision rule, not a favorite (L179).** The senior answer matches strategy to content type — and says "here's how I'd decide", not "I use semantic chunking". The rule is the deliverable.
- **Semantic chunking is a cost-quality trade (L150, L181).** It's the only strategy that embeds *during* chunking — the embedding calls (L150) are the price of meaning-based boundaries. Use it where topic shifts are real and retrieval misses are expensive (L195).
- **Document-aware inherits structure (L177, L180).** Headings are topic boundaries *and* metadata — the chunk inherits the section's topic, source and page (L180), which powers filters (L189) and citations (L192). Structure is the gift that keeps giving.
- **The hybrid is what ships (L179).** Real documents are mixed — the production strategy composes the menu by content type, with a fixed fallback. The composition is the senior design.
- **The golden set is the referee (L195).** Chunking strategy is an empirical choice — the golden set (retrieval precision/recall) decides between candidates, and re-measures when the content changes (L341). Never argue strategy with opinions when you have a measuring loop.

## 8. Common Mistakes

- **One strategy for all content.** The library default on contracts, prose and logs alike (L179) — the menu exists because content differs.
- **Semantic for everything.** The expensive option (L150) on structured docs that document-aware handles better and cheaper.
- **Fixed-size on prose.** Mid-paragraph, mid-sentence cuts (L178) — the baseline beating nothing.
- **Ignoring structure.** A manual with headings split by character count (L177) — the best map ignored.
- **No validation.** Strategy chosen by taste, never measured (L195) — the empirical fact unexamined.
- **The hybrid forgotten.** Competing strategies instead of composing them (L179).

## 9. Best Practices

- **Ask about structure first** (L177) — headings and sections route to document-aware.
- **Use fixed-size only for uniform text** (L179) — logs, fixed-width records.
- **Use recursive for mixed prose** — paragraph → sentence hierarchy, cheap.
- **Use semantic where meaning shifts** (L150) — long prose, when retrieval misses are expensive (L195).
- **Compose the hybrid** — document-aware outline + recursive inside + semantic where it pays.
- **Validate with a golden set** (L195) — the strategy is measured, not preferred.

## 10. Interview Questions

**Q: What chunking strategy do you use?**
> A: It depends on the content (L179). Structured docs — headings, sections — get document-aware chunking: the document's own outline is the chunk map (L177). Uniform text gets fixed-size. Prose gets recursive (paragraph → sentence), and semantic when meaning shifts matter and the embedding cost is worth it (L150). Production composes the hybrid, and the golden set (L195) validates the choice.

**Q: When is semantic chunking worth it?**
> A: When the content has real topic shifts and retrieval misses are expensive (L195). Semantic chunking embeds during chunking and cuts where meaning changes — the quality upgrade for long, topic-shifting prose. The trade: it's the only strategy with extra embedding cost (L150). For structured docs, document-aware beats it on quality *and* cost.

**Q: What's the difference between recursive and semantic?**
> A: Recursive splits on a hierarchy of separators — paragraph breaks, then sentences — the text's natural breaks, cheap and structure-aware at a coarse level. Semantic splits on meaning — where adjacent embeddings diverge — grouping by topic, not size. Recursive is the cheap default for prose; semantic is the upgrade when topic boundaries are what retrieval needs (L195).

**Q: How do you know your strategy is right?**
> A: I don't — the golden set does (L195). A set of questions with expected sources; retrieval precision/recall scores each candidate strategy. The best strategy is an empirical fact about my documents, so the evals decide, and they re-run when content changes (L341). Preference is for arguing; the measuring loop is for deciding.

## 11. Follow-Up Questions

- How does the hybrid compose the four strategies (L179)?
- What structure does document-aware need (L177)?
- How does semantic chunking decide a boundary (L181)?
- How does chunking interact with metadata (L180)?
- How do you re-validate after content changes (L341)?

## 12. Comparison Table — The Four Strategies

| | Fixed | Recursive | Semantic | Document-aware |
|---|---|---|---|---|
| Splits on | token count | separator hierarchy | meaning shift | structure (L177) |
| Cost (L150) | cheapest | cheap | extra embeddings | cheap |
| Structure aware | no | coarse | no | yes |
| Best for | uniform text | mixed prose | topic-shifting prose | structured docs |
| Failure | cuts through meaning | mid-topic splits | cost, over-segmentation | needs headings |

The senior read: **the table is the decision rule** — content type → strategy, with cost (L150) as the tiebreaker and evals (L195) as the referee.

## 13. Code Example — The Decision Rule in Code

```js
// The chunking strategy decision rule (L179), composed for production.
function chunk(text, meta) {
  // 1 · STRUCTURE? → document-aware (L177).
  if (meta.hasHeadings) {
    return splitByHeadings(text);                    // headings are the chunk map
  }

  // 2 · UNIFORM? → fixed-size baseline (L179).
  if (meta.isUniform) {
    return fixedSize(text, { size: 512 });           // logs, flat records
  }

  // 3 · PROSE → recursive by default (separator hierarchy).
  const chunks = recursiveSplit(text, { target: 200 });  // paragraph → sentence

  // 4 · SEMANTIC where meaning shifts and quality pays (L150).
  if (meta.topicShifts && meta.budgetForSemantic) {
    return semanticSplit(text);                      // embed + cut at divergence (L181)
  }
  return chunks;
}

// 5 · VALIDATE — the golden set decides (L195).
const scores = await evaluate(chunkConfig, goldenSet);  // precision / recall
if (scores.recall < target) switchStrategy(chunkConfig);  // tune or switch
```

```text
What the reader must SEE — the rule, the composition, the referee:

  hasHeadings → document-aware · isUniform → fixed
  prose → recursive · topicShifts + budget → semantic (L150)
  evaluate(goldenSet) → the strategy is measured (L195)

  Content routes the strategy. The golden set keeps it honest.
```

```narrate
3-6: Structure first — headings route to document-aware chunking (L177, L179).
8-11: Uniform text falls back to the fixed-size baseline (L179).
13-14: Prose gets the recursive split — paragraph → sentence hierarchy.
16-19: Semantic is the paid upgrade — meaning shifts + budget available (L150, L181).
21-25: The golden set evaluates and re-tunes the strategy (L195) — measured, not preferred.
```

> [!TIP]
> The two lines that make it a strategy and not a default: **`meta.hasHeadings`** (content-aware routing, L177) and **`evaluate(chunkConfig, goldenSet)`** (the referee, L195). **Content decides, evals confirm.**

## 14. Performance Notes

- **Semantic chunking costs embeddings (L150, L181).** Every candidate boundary is an embedding call — cache them (L171) and budget the strategy (L149) where the content doesn't justify it.
- **Document-aware is the cheapest quality (L177).** Headings are free structure — no extra embeddings, better boundaries, inheritable metadata (L180).
- **The golden set is a CI cost (L195, L341).** Evaluation runs on every chunking change — keep the set small and scored fast, like any regression suite.
- **Chunk count drives the index (L182).** Finer strategies produce more chunks — index size (L150) and embedding cost grow with granularity. Size the strategy to the task, not to "more is better".

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Structured doc chunks badly | Strategy ignored the headings (L177) | Route to document-aware |
| Semantic cost ballooning | Semantic on everything (L150) | Restrict to topic-shifting prose |
| Mid-topic chunks | Recursive on shifting prose (L179) | Try semantic where it pays (L195) |
| Retrieval regressed after change | Strategy not re-validated (L341) | Re-run the golden set |
| Over-segmented chunks | Semantic too aggressive (L181) | Merge below similarity threshold |

## 16. Quick Revision Notes

- Four strategies: **fixed, recursive, semantic, document-aware** (L179).
- The rule: **structure → document-aware; uniform → fixed; prose → recursive, semantic when it pays (L150)**.
- Semantic = **meaning-based boundaries at embedding cost (L181)**.
- Document-aware = **headings as the chunk map (L177)** + inheritable metadata (L180).
- Production = **the hybrid**, composed by content type.
- The referee: **the golden set (L195, L341)** — strategy is measured, not preferred.

## 17. Cheat Sheet

```text
CHUNKING STRATEGIES = a menu with a decision rule

THE MENU (L179)
  fixed           token-count slices — uniform text, baseline
  recursive       paragraph → sentence hierarchy — mixed prose
  semantic        meaning-shift boundaries — long prose (L181)
  document-aware  headings/sections — structured docs (L177)

THE RULE
  structure?    → document-aware (L177)
  uniform?      → fixed
  prose?        → recursive; semantic when topic shifts + cost OK (L150)

THE HYBRID (what ships)
  document-aware outline → recursive inside → semantic where it pays

THE REFEREE (L195, L341)
  golden set → precision/recall → keep, tune, or switch
  strategy is an empirical fact, not a preference

INTERVIEW, 4 MOVES
  1 menu    "fixed, recursive, semantic, document-aware"
  2 rule    "structure, uniformity, prose — each routes"
  3 hybrid  "the composition is what ships"
  4 referee "the golden set decides (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - The four strategies are **fixed-size, recursive, semantic, and document-aware** (L179) — a menu, not a religion
> - The decision rule: **structure → document-aware (L177); uniform → fixed; prose → recursive — semantic when meaning shifts and the cost pays (L150)**
> - **Semantic chunking is the only strategy with extra embedding cost** (L150, L181) — the quality upgrade for topic-shifting prose
> - **Document-aware inherits structure** (L177, L180) — headings are boundaries *and* metadata, powering filters (L189) and citations (L192)
> - **Production composes the hybrid** — document-aware outline, recursive inside, semantic where it pays
> - **The golden set is the referee** (L195, L341) — the strategy is an empirical fact about your documents, measured not preferred

## Check your understanding

Answer these without looking back.

1. Name the four strategies and what each splits on.
2. What's the decision rule for choosing one (L177)?
3. When is semantic chunking worth its cost (L150)?
4. Why does document-aware inherit structure (L180)?
5. What does the production hybrid look like?
6. Why is the golden set the referee (L195)?
7. What happens if you never re-validate (L341)?
8. Which strategy is the baseline, and when is it right?

## A Closing Note — The Menu That Matches the Content

You now hold the strategy menu and its decision rule: **structure routes to document-aware, uniformity to fixed, prose to recursive — semantic where meaning and budget align — and the golden set keeps every choice honest (L195).** Chunking isn't one setting; it's a fitted decision.

Next: the labels that make chunks findable — metadata for retrieval (L180), where source, date and tenant turn search into precision.
