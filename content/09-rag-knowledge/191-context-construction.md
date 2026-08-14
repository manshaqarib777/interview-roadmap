# Lesson 191 — Context Construction

**Interview importance:** ⭐⭐⭐⭐ — "how do you build the prompt?" — the answer is *context construction*: ordering, formatting, deduplication, and the token budget (L149) — the bridge between retrieval (L189–190) and generation (L145).**

L189–190 gave you the shortlist. This lesson is the **bridge to the prompt**: context construction — taking the retrieved (and reranked, L190) chunks and assembling them into the model's input: what to include, how to order, how to format (with sources, L192), and — above all — *how much*, against the token budget (L149). The context decides what the model can answer from (L174): a good shortlist badly assembled is a bad answer (L196).

The distinction this lesson is built on: a **demo** concatenates the chunks and hopes. A **solutions architect** builds the context deliberately: deduplicate the overlaps (L178), order by relevance and position (L192), format with clear separators and sources (L192), and budget the tokens (L149) — with a slot budget for the instruction, the context, and the question (L191), measured on the golden set (L195).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain context construction: what to include, order, format, and budget (L191)
- Apply the token budget: instruction + context + question slots (L149, L138)
- Explain the ordering and dedup rules: relevance, position, overlap (L178, L192)
- Explain how formatting and sources support the answer (L192)
- Measure context choices on the golden set (L195)

## 1. One-Line Definition

**Context construction is the bridge from retrieval to generation — selecting, ordering, formatting and budgeting the retrieved chunks into the model's input: deduplicate overlaps (L178), order by relevance with source markers (L192), and fit the whole — instruction, context, and question — inside the token budget (L149), because the context is what the model answers from (L174) and its assembly decides the answer's quality (L196).**

The one-sentence interview answer: *"Context construction is the bridge (L191). The retrieved chunks become the model's input, so the assembly matters as much as the retrieval. Four rules. Include: the reranked top-k (L190), deduplicated — chunk overlap (L178) duplicates content, and duplicates waste budget (L149). Order: relevance first, source position as tiebreak (L192). Format: clear separators and source markers, so the model can cite (L192). Budget: the prompt is three slots — instruction, context, question — sized inside the context window (L138, L149): context gets the most, instruction the fixed part, question the rest. Measured on the golden set (L195) — a good shortlist badly assembled is a bad answer (L196)."*

## 2. Mental Model

Think of context construction as **plating a dish for a critic.** The retrieval (L189–190) is the pantry — the available ingredients (chunks). Plating is the assembly: you choose what goes on the plate (include — dedupe the extras), arrange it deliberately (order — the best bites first), label it (format — source markers), and keep the portion inside the plate's size (budget — the token window, L149). The critic (the model) judges the plate — a great pantry badly plated is a bad meal (L196).

```text
   the pantry (L189-190)              the plate (L191)
   ┌──────────────────────┐           ┌──────────────────────────┐
   │ 50 chunks recalled,  │  ──────►  │ top-k, deduplicated      │
   │ reranked to 5        │           │ ordered by relevance     │
   │ (overlapping, some   │           │ formatted with sources   │
   │  redundant, L178)    │           │ sized to the budget      │
   └──────────────────────┘           │ (L149) — the plate fits  │
                                      └──────────────────────────┘
```

The mental model is **pantry → plate**: retrieval gathers, construction plates — and the plate (not the pantry) is what the model eats.

## 3. Visual Flow — The Context Assembly

```text
   the reranked shortlist (L190)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · INCLUDE (L191)                                       │
   │     top-k, deduplicated — overlap (L178) collapses;      │
   │     keep the most relevant copy of each fact             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · ORDER (L192)                                         │
   │     relevance first (the reranker's order, L190)         │
   │     source position as tiebreak                          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · FORMAT (L192)                                        │
   │     clear separators · source markers [source, §]        │
   │     the model can cite what it read (L192)               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · BUDGET (L149, L138)                                  │
   │     instruction slot · context slot · question slot      │
   │     all three inside the context window                  │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the assembled prompt → generation (L145) → citations (L192)
```

The flow is the assembly: **include → order → format → budget** — and the budget (L149) is the constraint the other three serve.

## 4. How It Works — The Four Rules

- **Include (L191).** The reranked top-k (L190), deduplicated: chunk overlap (L178) means adjacent chunks share content — duplicates waste budget (L149) and confuse the model. Keep the most relevant copy of each fact.
- **Order (L192).** The reranker's order is the default (L190) — most relevant first. Source position breaks ties and gives the model a reading order. The model reads top-down; the answer's shape follows the context's shape (L196).
- **Format (L192).** Clear separators between chunks, source markers on each — "[contracts/acme-2024.pdf, §7]" — so the model can distinguish sources and cite them (L192). Formatting is what makes citations *possible*.
- **Budget (L149, L138).** The prompt is three slots: **instruction** (the system prompt — fixed), **context** (the chunks — the flexible part), and **question**. All three fit the context window (L138). Context gets the largest share; the budget is derived from the window, not guessed (L191).

> [!NOTE]
> **The budget is the discipline the other rules serve (L149).** The context window (L138) is the hard ceiling: instruction + context + question must fit, with room for the output (L149). The senior design sizes the *context slot* first — the flexible part — and the chunk size (L178) and top-k (L189) are derived from it. When the window is tight, the levers are: fewer chunks (L189), smaller chunks (L178), dedup (L191), and — the expensive one — summarization (L166). The budget is the plate's size; everything else is plating.

## 5. Real Project Usage

- **Support copilots.** The top policy chunks, deduplicated, formatted with article markers, budgeted to fit the window (L191) — citations per answer (L192).
- **Legal research.** Clause chunks ordered by relevance, cited by § and source (L192) — the context's format is the answer's citation list (L191).
- **Product Q&A.** Spec chunks deduplicated (the same spec in overlapping chunks, L178), formatted with product markers (L192).
- **Agent memory (L207).** Context construction applies to the agent's working set too — the same budget rules (L149) shape what the agent reads (L206).
- **Multi-source RAG.** Docs from different sources — formatting with source markers is what lets the model distinguish and cite each (L192).

The through-line: **the context is the model's entire view of the answer** — construction is where retrieval quality becomes answer quality (L196).

## 6. Interview Explanation

Say it in four moves:

1. **The role.** "Context construction bridges retrieval and generation — the chunks become the model's input, so the assembly matters (L191)."
2. **The rules.** "Include the top-k deduplicated (L178); order by relevance (L190); format with source markers (L192)."
3. **The budget.** "Three slots — instruction, context, question — inside the window (L149, L138). Context is the flexible part; chunk size and top-k derive from it (L178, L189)."
4. **The measure.** "The golden set (L195) shows what a better assembly gains — a good shortlist badly plated is a bad answer (L196)."

## 7. Senior-Level Insights

- **The assembly is as important as the retrieval (L191).** The senior answer treats context construction as a design with rules — include, order, format, budget — not a concatenation. The demo answer is `chunks.join('\n')` (L196).
- **Deduplication is a budget and clarity win (L178).** Chunk overlap (L178) duplicates facts across chunks — dedup saves tokens (L149) and stops the model from double-reading a fact. The senior design dedupes by content, not just by chunk id (L180, L176).
- **Formatting is what makes citations possible (L192).** Source markers in the context are the citation template (L192) — the model cites what it read, and it can only cite what's labeled. Formatting is a trust feature, not decoration (L174).
- **The budget is derived, not guessed (L149).** Context slot = window − instruction − question − output headroom (L138) — chunk size (L178) and top-k (L189) derive from it, and re-derive when anything changes (L341).
- **The context is measured (L195).** Order, format, and budget choices are golden-set-tested — "context ordering matters" is proven with numbers, not asserted (L341).

## 8. Common Mistakes

- **`chunks.join('\n')`** (L191). No dedup, no order, no format, no budget (L196) — the assembly that wastes the window and confuses the model.
- **Ignoring the budget (L149).** The window overflows (L138) — the prompt truncated mid-context, the answer cut off (L196).
- **Duplicates in the context (L178).** Overlapping chunks both included — budget wasted, the fact double-read (L149).
- **No source markers (L192).** The model can't distinguish or cite the chunks — citations impossible (L192).
- **Order by retrieval accident (L190).** Ignoring the reranker's order — the model reads the wrong chunk first (L196).
- **No output headroom (L149).** The window full of input — the model has no room to answer (L138).

## 9. Best Practices

- **Assemble deliberately** (L191) — include, order, format, budget — never `join('\n')`.
- **Dedup by content** (L178, L180) — collapse the overlap; keep the most relevant copy.
- **Format with source markers** (L192) — separators + citations in the context.
- **Budget the three slots** (L149, L138) — instruction, context, question, with output headroom.
- **Derive chunk size and top-k from the context slot** (L178, L189) — and re-derive on change (L341).
- **Measure the assembly** (L195) — golden-set test order, format, and budget choices.

## 10. Interview Questions

**Q: How do you construct the context?**
> A: Four rules (L191). Include — the reranked top-k (L190), deduplicated: chunk overlap (L178) duplicates content, and duplicates waste the budget (L149). Order — the reranker's order, relevance first (L190). Format — clear separators and source markers, so the model can cite (L192). Budget — three slots: instruction, context, question, all inside the window (L138); the context is the flexible part, and chunk size and top-k derive from it.

**Q: How do you handle the token budget?**
> A: The window is the ceiling (L138). The prompt is three slots: the instruction (fixed), the context (flexible), and the question — plus headroom for the output (L149). I size the context slot from the window: context = window − instruction − question − output. Then chunk size (L178) and top-k (L189) derive from that slot. When it's tight: fewer chunks, smaller chunks, dedup (L191), and summarization as the last resort (L166).

**Q: Why does ordering matter?**
> A: Because the model reads top-down, and the answer follows the context's shape (L196). The reranker's order (L190) puts the most relevant chunk first — the model's first read is the best answer to the question. Source position breaks ties. A wrong first chunk can steer the whole answer, even when the right chunk is in the list — ordering is an assembly decision, not a nicety (L191).

**Q: How does formatting support citations?**
> A: The model cites what it read — and it can only cite what's labeled (L192). Source markers on each chunk — "[contracts/acme-2024.pdf, §7]" — give the model the citation template. The answer's citations are the context's formatting rendered back (L192). Formatting is a trust feature: it's what makes the answer auditable (L174).

## 11. Follow-Up Questions

- How do you deduplicate overlapping chunks (L178)?
- What's the output-headroom rule (L149)?
- When do you summarize the context instead of truncating (L166)?
- How does ordering interact with the reranker (L190)?
- How do you measure an assembly change (L195)?

## 12. Comparison Table — Concatenation vs Construction

| | `join('\n')` (L196) | Construction (this lesson) |
|---|---|---|
| Include (L191) | everything retrieved | top-k, deduplicated (L178) |
| Order (L192) | retrieval accident | relevance first (L190) |
| Format (L192) | unlabeled text | separators + source markers |
| Budget (L149) | none — overflow (L138) | three slots, derived |
| Citations (L192) | impossible | the context's template |
| Measure (L195) | never | golden-set tested |

The senior read: **the right column is the bridge** — the assembly that turns a shortlist into an answerable prompt.

## 13. Code Example — The Context Constructor

```js
// Context construction: include → order → format → budget (L191, L149).
import { dedupeByContent } from './dedup';       // L178 — collapse overlap

function buildContext(shortlist, { instruction, question, windowTokens }) {
  // 1 · INCLUDE — the reranked top-k, deduplicated by content (L178, L190).
  const chunks = dedupeByContent(shortlist);      // keep the most relevant copy

  // 2 · BUDGET — the three slots, derived from the window (L149, L138).
  const instructionTokens = count(instruction);
  const questionTokens = count(question);
  const outputHeadroom = 512;                     // room for the answer (L149)
  const contextSlot = windowTokens - instructionTokens - questionTokens - outputHeadroom;

  // 3 · FIT — take chunks until the context slot is full (L191).
  const context = [];
  let used = 0;
  for (const c of chunks) {
    if (used + c.tokens > contextSlot) break;     // the plate's size (L149)
    context.push(c); used += c.tokens;
  }

  // 4 · FORMAT — separators + source markers for citations (L192).
  return [
    instruction,
    context.map((c) => `[${c.source} §${c.section}]\n${c.text}`).join('\n\n---\n\n'),
    `Question: ${question}`,
  ].join('\n\n');
}
```

```text
What the reader must SEE — the four rules in code:

  dedupeByContent(shortlist)  → include, deduplicated (L178)
  contextSlot = window − rest  → budget derived, not guessed (L149, L138)
  fit loop with a break       → the plate's size (L191)
  [source §section] markers   → citations' template (L192)

  Include, budget, fit, format — the assembly.
```

```narrate
5-6: Include — dedup collapses chunk overlap, keeping the most relevant copy (L178).
8-12: Budget — the three slots derived from the window, with output headroom (L149, L138).
15-19: Fit — chunks are added until the context slot fills; the break is the plate's size (L191).
21-25: Format — source and section markers give the model its citation template (L192).
```

> [!TIP]
> The line that makes it construction and not concatenation: **`if (used + c.tokens > contextSlot) break`** — the budget-gated fit. **The window is the ceiling; everything else is plating (L149).**

## 14. Performance Notes

- **The context is the token bill (L150).** The context slot is the dominant cost (L149) — dedup (L178), budget sizing (L191), and the cache (L171) are the controls.
- **The fit loop is trivial (L151).** Counting tokens and breaking — microseconds, off the critical path (L145).
- **The output headroom is a quality lever (L149).** Truncating the answer is a silent failure (L196) — the headroom is a budget line, not an afterthought.
- **Summarization is the expensive escape (L166).** When the context won't fit, summarize the oldest chunks (L166) — a model call (L150) traded for completeness (L191).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Answers cut off | No output headroom (L149) | Add the headroom line (L138) |
| Window overflow | Context slot uncomputed (L191) | Derive the slot; fit with a break |
| Double-read facts | Overlap duplicates (L178) | Dedup by content (L180) |
| No citations | No source markers (L192) | Format with markers in the context |
| Wrong answer despite right chunks | Order ignores the reranker (L190) | Use the reranked order (L191) |

## 16. Quick Revision Notes

- Context construction = **include → order → format → budget** (L191).
- Include: **top-k, deduplicated** (L178, L190).
- Order: **relevance first** (L190); format: **source markers** (L192).
- Budget: **three slots inside the window** (L149, L138) — with output headroom.
- Chunk size (L178) and top-k (L189) **derive from the context slot** (L191).
- Measure the assembly (L195) — **plating is a quality decision** (L196).

## 17. Cheat Sheet

```text
CONTEXT CONSTRUCTION = the bridge from shortlist to prompt

THE FOUR RULES (L191)
  include  top-k, deduplicated — overlap collapses (L178, L190)
  order    relevance first — the reranker's order (L190)
  format   separators + source markers — citations' template (L192)
  budget   three slots inside the window (L149, L138)

THE BUDGET (L149)
  window − instruction − question − output headroom = context slot
  chunk size (L178) + top-k (L189) derive from the slot
  tight? → fewer chunks · smaller chunks · dedup · summarize (L166)

THE FORMAT (L192)
  [source §section] per chunk — the model cites what it read
  formatting is a trust feature, not decoration

THE MEASURE (L195)
  golden-set test: order, format, budget choices
  a good shortlist badly plated is a bad answer (L196)

INTERVIEW, 4 MOVES
  1 role    "the bridge — the chunks become the input"
  2 rules   "include, order, format, budget"
  3 budget  "three slots, derived from the window (L149)"
  4 measure "the golden set tests the plating (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - Context construction is **the bridge from retrieval to generation** (L191) — include, order, format, and budget the chunks into the model's input
> - **Include the top-k deduplicated** (L178, L190) — chunk overlap wastes budget and confuses the model (L149)
> - **Order by relevance** (L190) and **format with source markers** (L192) — the model reads top-down, and it can only cite what's labeled
> - **The budget is the discipline**: three slots — instruction, context, question — inside the window (L138), with output headroom (L149); chunk size and top-k derive from the context slot
> - **Formatting is a trust feature** (L192) — source markers are the citations' template, and citations are RAG's auditability (L174)
> - The assembly is **measured on the golden set** (L195) — a good shortlist badly plated is a bad answer (L196)

## Check your understanding

Answer these without looking back.

1. What are the four rules of construction (L191)?
2. Why deduplicate by content (L178)?
3. How do you derive the context slot (L149)?
4. Why does ordering matter (L190)?
5. What makes citations possible (L192)?
6. What's the output headroom, and why (L149)?
7. When do you summarize instead of truncate (L166)?
8. How do you measure an assembly change (L195)?

## A Closing Note — The Plate the Model Eats

You now hold the bridge: **include the top-k deduplicated, order by relevance, format with sources, and budget the three slots inside the window.** The context is the model's entire view of the answer — and now you assemble it deliberately.

Next: the trust layer — citations & source attribution (L192), where every claim points back to its chunk.
