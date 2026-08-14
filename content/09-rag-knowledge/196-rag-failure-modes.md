# Lesson 196 — RAG Failure Modes

**Interview importance:** ⭐⭐⭐⭐⭐ — "why did the AI give a wrong answer?" — the answer is the *failure taxonomy*: missing chunks, wrong chunks, hallucinated answers, and the groundedness failure (L337) — each traced to its stage (L189, L191, L145) and fixed by its lever (L195).**

L195 gave you the eval; this lesson is **what it catches**: the RAG failure taxonomy — missing chunks (retrieval found nothing relevant, L189), wrong chunks (retrieval found the wrong things, L189), hallucinated answers (generation invented beyond the context, L145), and the groundedness failure (the answer doesn't follow even the retrieved chunks, L337). Each failure traces to a stage — ingestion (L176), chunking (L178), retrieval (L189), generation (L145) — and each has a lever. The senior skill is *diagnosing which one you're looking at* (L196).

The distinction this lesson is built on: a **demo** calls every wrong answer "a hallucination". A **solutions architect** diagnoses: is the chunk missing (ingestion/chunking/retrieval, L178, L189)? Is the chunk wrong (retrieval quality, L187–190)? Is the answer invented (generation, L145) or ungrounded (L337)? The fix differs per failure — and the eval (L195) is how you tell them apart.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the four failure modes: missing chunk, wrong chunk, hallucinated answer, ungrounded answer (L196)
- Trace each failure to its stage: ingestion (L176), chunking (L178), retrieval (L189), generation (L145)
- Diagnose a failure: which mode is it, which stage, which lever (L196)
- Apply the fix per mode: recall (L189), reranking (L190), context (L191), instructions (L142), evals (L337)
- Use the golden set (L195) to detect and prevent each mode

## 1. One-Line Definition

**RAG failure modes are the taxonomy of wrong answers — missing chunks (retrieval found nothing relevant, L189), wrong chunks (retrieval found the wrong things, L187–190), hallucinated answers (generation invented beyond the context, L145), and ungrounded answers (the answer doesn't follow the retrieved chunks, L337) — each traced to its stage and fixed by its lever, with the golden set (L195) as the diagnostic.**

The one-sentence interview answer: *"Wrong RAG answers are a taxonomy, not one bug (L196). Four modes. Missing chunk — retrieval found nothing relevant: the answer is generic or 'I don't know' (L189); the fix is recall — better chunking (L178), retrieval (L189), or query rewriting (L193). Wrong chunk — retrieval found the wrong things: the answer is confidently wrong with a citation to the wrong source (L189); the fix is retrieval quality — hybrid (L187), reranking (L190). Hallucinated answer — generation invented beyond the context: the claim isn't in any chunk (L145); the fix is the context (L191), instructions (L142), and faithfulness evals (L196). Ungrounded answer — the answer doesn't follow the chunks it cites (L337); the fix is groundedness evals (L337) and better context (L191). The golden set (L195) is how I tell the four apart."*

## 2. Mental Model

Think of the four failure modes as **four ways a waiter can get your order wrong.** The missing chunk: the kitchen never had the dish — "we don't have that" (nothing retrieved, L189). The wrong chunk: the kitchen sent the wrong dish — confidently, with a garnish that looks right (wrong retrieval, L189). The hallucinated answer: the kitchen invented a dish not on the menu (generation beyond context, L145). The ungrounded answer: the kitchen cooked the dish but ignored the recipe card it was given (L337). Each has a different fix — order it differently, check the menu, hand the recipe again, watch the cook — and the diagnosis comes first (L196).

```text
   missing chunk (L189)         wrong chunk (L189)         hallucinated (L145)      ungrounded (L337)
   ┌────────────────────┐      ┌────────────────────┐     ┌────────────────────┐   ┌────────────────────┐
   │ "we don't have    │      │ the WRONG dish,    │     │ a dish NOT on the  │   │ the right dish,    │
   │  that" — nothing  │      │ garnished to look  │     │ menu — invented    │   │ but the recipe     │
   │  retrieved        │      │ right (wrong chunk)│     │ (beyond context)   │   │ ignored (L337)     │
   └────────────────────┘      └────────────────────┘     └────────────────────┘   └────────────────────┘
     fix: recall (L193)          fix: rerank (L190)         fix: context + faith     fix: groundedness
```

The mental model is **four order failures, four fixes** — and the diagnosis (which one am I looking at?) comes before any fix (L196).

## 3. Visual Flow — Diagnosing a Wrong Answer

```text
   a wrong answer arrives
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · WAS ANYTHING RELEVANT RETRIEVED? (L189)              │
   │     no → MISSING CHUNK — fix recall: chunking (L178),    │
   │          retrieval (L189), query rewriting (L193)        │
   │     yes → continue                                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · WERE THE RETRIEVED CHUNKS THE RIGHT ONES? (L187-190) │
   │     no → WRONG CHUNK — fix quality: hybrid (L187),       │
   │          reranking (L190), metadata filters (L180)       │
   │     yes → continue                                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · DOES THE ANSWER STAY IN THE CONTEXT? (L145, L337)    │
   │     no → HALLUCINATED — fix: context (L191),             │
   │          instructions (L142), faithfulness evals (L196)  │
   │     partially → UNGROUNDED — fix: groundedness (L337)    │
   └──────────────────────────────────────────────────────────┘
```

The flow is the diagnostic: **was it retrieved → was it right → did the answer follow it** — three questions, four failure modes, each with its own lever (L196).

## 4. How It Works — The Four Modes, Their Stages, Their Fixes

- **Missing chunk (L189).** Nothing relevant was retrieved — the answer is generic, hedged, or "I don't know". The stage: ingestion (L176, the doc isn't indexed), chunking (L178, the chunk is too small or mis-cut), retrieval (L189, recall too low), or the query (L193, poorly written). The fix: the recall levers — better chunking (L179), hybrid search (L187), query rewriting (L193), wider top-k (L189).
- **Wrong chunk (L189).** The retrieved chunks are irrelevant — the answer is confidently wrong, often with a citation to the wrong source (L192). The stage: retrieval quality (L187–190). The fix: the precision levers — hybrid (L187), reranking (L190), metadata filters (L180), better embeddings (L181).
- **Hallucinated answer (L145).** The generation invented beyond the context — the claim is in no chunk (L141). The stage: generation (L145) and the context (L191). The fix: the faithfulness levers — stronger instructions (L142), a fuller context (L191), and faithfulness evals (L196).
- **Ungrounded answer (L337).** The answer doesn't follow even the chunks it cites — the claim and the citation disagree (L192). The stage: generation (L145) against the evidence (L337). The fix: groundedness evals (L337) to catch it, better context formatting (L191) to prevent it.

> [!NOTE]
> **The misdiagnosis is the expensive failure (L196).** Treating a wrong-chunk failure as a hallucination means "tuning the prompt" when the fix is reranking (L190) — the failure persists, and the team blames the model. The senior discipline is the diagnostic: the golden set (L195) reveals the mode by *which metric* regressed — recall@k drops (missing/wrong chunk, L189), groundedness drops (generation, L337) — and the fix follows the metric (L341).

## 5. Real Project Usage

- **Support copilots.** "We don't have that policy" → missing chunk (L189) — the doc wasn't ingested (L176) or the query was vague (L193). Fix: ingestion coverage + query rewriting (L193).
- **E-commerce Q&A.** "Is this waterproof?" citing the wrong spec → wrong chunk (L189). Fix: reranking (L190) + metadata filters (L180).
- **Legal research.** An invented clause → hallucinated answer (L145). Fix: context (L191) + instructions (L142) + faithfulness evals (L196).
- **Finance answers.** A claim that contradicts its citation → ungrounded (L337). Fix: groundedness evals (L337) in CI (L341).
- **Any RAG system.** The four modes are the QA checklist — the golden set (L195) has examples of each (L342).

The through-line: **every wrong answer is one of four modes** — the diagnosis is the skill, the golden set (L195) is the diagnostic tool, and each mode has a lever.

## 6. Interview Explanation

Say it in four moves:

1. **The taxonomy.** "Four modes: missing chunk, wrong chunk, hallucinated answer, ungrounded answer (L196)."
2. **The diagnostic.** "Three questions: was anything retrieved (L189)? Was it the right thing (L187–190)? Did the answer follow it (L337)?"
3. **The levers.** "Missing → recall (L193). Wrong → precision (L190). Hallucinated → context + instructions (L191, L142). Ungrounded → evals (L337)."
4. **The discipline.** "The golden set (L195) tells the modes apart by which metric regressed — the fix follows the metric, not the blame."

## 7. Senior-Level Insights

- **The taxonomy is the debugging discipline (L196).** The senior answer names the four modes and their stages before any fix — the diagnosis is the deliverable, the fix is the follow-through.
- **The metric reveals the mode (L195, L337).** Recall@k drops → missing/wrong chunk (L189); groundedness drops → generation (L337). The golden set (L195) is the diagnostic: which metric regressed, which stage, which lever (L341).
- **Wrong chunks are the sneakiest (L189, L190).** They produce confident, well-cited wrong answers (L192) — the hardest to spot and the most damaging to trust (L174). Reranking (L190) and hybrid (L187) are the precision defenses.
- **Hallucination has a pre-RAG cousin (L141).** The model's frozen knowledge (L141) fills gaps the context leaves — a fuller context (L191) and stronger grounding instructions (L142) close the gaps the failure mode exploits.
- **The modes compose with observability (L332).** Production logs reveal the modes at scale — no-retrieval queries (L332), citation mismatches (L192), groundedness scores (L337) — the offline eval (L195) and the online monitor agree (L341).

## 8. Common Mistakes

- **"It's a hallucination" for everything (L196).** The wrong-chunk and missing-chunk failures misdiagnosed — the fix aimed at the wrong stage (L189).
- **Fixing recall with prompts (L190).** Missing chunks tuned by instruction changes (L142) — the prompt can't retrieve (L189).
- **Fixing precision with more chunks (L189).** Wrong chunks fixed by a wider top-k (L149) — more noise, not better (L190).
- **No groundedness check (L337).** The citation and the claim disagree, undetected — the ungrounded mode ships (L196).
- **No eval at all (L195).** Modes discovered by users, not by the golden set (L341) — the regression suite missing.
- **Blame the model (L145).** The generation blamed when the retrieval stage failed (L189) — the four modes exist to prevent exactly this (L196).

## 9. Best Practices

- **Diagnose before fixing** (L196) — which mode, which stage, which metric.
- **Use the golden set as the diagnostic** (L195) — the regressed metric names the mode (L341).
- **Fix missing chunks with recall levers** (L193) — chunking (L178), hybrid (L187), query rewriting (L193).
- **Fix wrong chunks with precision levers** (L190) — reranking (L190), filters (L180), embeddings (L181).
- **Fix hallucination with context and instructions** (L191, L142) — and faithfulness evals (L196).
- **Fix ungrounded answers with groundedness evals** (L337) — in CI (L341).

## 10. Interview Questions

**Q: Why did the AI give a wrong answer?**
> A: One of four failure modes (L196). Missing chunk — nothing relevant was retrieved, so the answer is generic (L189). Wrong chunk — the retrieved chunks are irrelevant, so the answer is confidently wrong, often citing the wrong source (L189, L192). Hallucinated answer — generation invented beyond the context (L145). Ungrounded answer — the answer doesn't follow even the chunks it cites (L337). The diagnosis — which mode, which stage — comes before the fix.

**Q: How do you tell the modes apart?**
> A: The golden set and the metric (L195). If recall@k dropped, it's a retrieval mode — missing or wrong chunks (L189). If groundedness dropped, it's a generation mode (L337). Three questions at the debugger: was anything relevant retrieved (L189)? Was it the right chunk (L187–190)? Did the answer follow it (L337)? The answers name the mode, and the mode names the lever (L196).

**Q: What's the fix for each mode?**
> A: Missing chunk — recall levers: better chunking (L178), hybrid search (L187), query rewriting (L193). Wrong chunk — precision levers: reranking (L190), metadata filters (L180), better embeddings (L181). Hallucinated — context and instructions (L191, L142) plus faithfulness evals (L196). Ungrounded — groundedness evals (L337) and better context formatting (L191). Each mode has its lever; the misdiagnosis is the expensive failure (L196).

**Q: Which mode is the most dangerous?**
> A: Wrong chunks (L189). They produce confident, well-cited wrong answers (L192) — the hardest to spot and the most damaging to trust (L174). A hallucinated answer is often visibly vague; a wrong-chunk answer reads authoritative. That's why reranking (L190) and hybrid (L187) are the precision defenses, and why the golden set (L195) checks what the retrieved chunks actually are — not just that answers look good.

## 11. Follow-Up Questions

- How does the metric identify the mode (L195)?
- When is a failure an ingestion problem vs a retrieval problem (L176)?
- How do you fix the wrong-chunk mode (L190)?
- What's the difference between hallucinated and ungrounded (L337)?
- How do production logs reveal the modes (L332)?

## 12. Comparison Table — The Four Modes

| Mode | Symptom | Stage (L196) | Fix |
|---|---|---|---|
| Missing chunk (L189) | generic / "I don't know" | retrieval (L189) | recall: chunking (L178), rewrite (L193) |
| Wrong chunk (L189) | confident + wrong citation | retrieval quality (L190) | precision: rerank (L190), hybrid (L187) |
| Hallucinated (L145) | claim in no chunk | generation (L145) | context (L191), instructions (L142) |
| Ungrounded (L337) | claim contradicts citation | generation (L337) | groundedness evals (L337) |

The senior read: **the stage column is the diagnosis; the fix column is the lever** — the taxonomy turns "wrong answer" into a specific repair (L196).

## 13. Code Example — The Diagnostic

```js
// The failure-mode diagnostic: which mode is this wrong answer? (L196)
async function diagnose(question, { chunks, answer }) {
  // MODE 1 — MISSING CHUNK (L189): was anything relevant retrieved?
  const relevant = await hasRelevantChunk(question, chunks);   // relevance check
  if (!relevant) {
    return { mode: 'missing-chunk', fix: 'recall — chunking (L178), hybrid (L187), query rewrite (L193)' };
  }

  // MODE 2 — WRONG CHUNK (L189): is the answer's citation supported by the chunk?
  const citation = extractCitations(answer);                   // L192
  const wrongChunk = citation.some((c) => !chunks.includes(c.source));
  if (wrongChunk) {
    return { mode: 'wrong-chunk', fix: 'precision — rerank (L190), filters (L180), embeddings (L181)' };
  }

  // MODE 3 + 4 — GENERATION: does the answer follow the context? (L337)
  const { groundedness, faithfulness } = await scoreAnswer(answer, chunks);  // L337
  if (faithfulness < 0.8) {
    return { mode: 'hallucinated', fix: 'context (L191), instructions (L142), faithfulness evals' };
  }
  if (groundedness < 0.8) {
    return { mode: 'ungrounded', fix: 'groundedness evals (L337) + context formatting (L191)' };
  }
  return { mode: 'ok' };
}

// THE GOLDEN SET confirms the mode by metric (L195, L341):
//   recall@k dropped → missing/wrong chunk · groundedness dropped → generation
```

```text
What the reader must SEE — the three questions, the four modes:

  hasRelevantChunk()      → missing chunk? (L189)
  citations vs chunks     → wrong chunk? (L189, L192)
  groundedness/faithfulness → hallucinated or ungrounded? (L337)

  Diagnose first — the fix follows the mode (L196).
```

```narrate
4-7: Mode 1 — was anything relevant retrieved? The missing-chunk check (L189).
9-14: Mode 2 — do the answer's citations match the retrieved chunks? The wrong-chunk check (L189, L192).
16-22: Modes 3+4 — faithfulness and groundedness scores separate hallucination (L145) from ungroundedness (L337).
24-26: The golden set confirms the diagnosis by metric — the fix follows the mode (L195, L341).
```

> [!TIP]
> The line that prevents the expensive misdiagnosis: **`if (faithfulness < 0.8)` vs `if (groundedness < 0.8)`** — the two generation modes separated. **The mode names the fix; guessing at the wrong stage is the expensive failure (L196).**

## 14. Performance Notes

- **The diagnostic is cheap (L151).** Relevance checks and citation matching run on the shortlist (L189) — microseconds; the LLM scoring (L337) is the costly part, sampled or run in CI (L341).
- **The golden set is the early warning (L195).** Catching a mode in CI (L341) costs tokens (L150); catching it in production costs trust (L174).
- **The fixes have their own costs (L150).** Reranking (L190) and query rewriting (L193) add latency (L151) and tokens (L150) — the mode's fix is weighed against its cost (L195).
- **Observability closes the loop (L332).** Production metrics reveal modes at scale (L332); the offline eval (L195) validates the fixes — the loop is continuous (L341).

## 15. Debugging Scenarios

| Symptom | Mode | First lever |
|---|---|---|
| Generic / "I don't know" answers | Missing chunk (L189) | Recall: chunking (L178), rewrite (L193) |
| Confident wrong answers with citations | Wrong chunk (L189) | Precision: rerank (L190), hybrid (L187) |
| Claims in no chunk | Hallucinated (L145) | Context (L191), instructions (L142) |
| Claims contradict their citation | Ungrounded (L337) | Groundedness evals (L337) |
| Regression after a change | Any — metric tells | Golden set (L195), CI (L341) |

## 16. Quick Revision Notes

- Four modes: **missing chunk, wrong chunk, hallucinated, ungrounded** (L196).
- The diagnostic: **was it retrieved (L189) → was it right (L187–190) → did the answer follow (L337)?**
- Missing → **recall** (L193). Wrong → **precision** (L190). Hallucinated → **context + instructions** (L191, L142). Ungrounded → **evals** (L337).
- The metric names the mode: **recall@k → retrieval; groundedness → generation** (L195).
- The misdiagnosis is the expensive failure (L196).
- The golden set (L195) is the diagnostic; CI (L341) is the early warning.

## 17. Cheat Sheet

```text
RAG FAILURE MODES = the taxonomy of wrong answers

THE FOUR MODES (L196)
  missing chunk   nothing retrieved → generic answer (L189)
  wrong chunk     irrelevant chunks → confident, wrong citation (L189)
  hallucinated    invented beyond context (L145)
  ungrounded      claim contradicts its citation (L337)

THE DIAGNOSTIC — three questions
  1 was anything relevant retrieved?  → no: missing (L189)
  2 was the retrieved chunk right?    → no: wrong (L187-190)
  3 did the answer follow the chunks? → no: hallucinated/ungrounded (L337)

THE FIXES — the mode names the lever
  missing → recall: chunking (L178) · hybrid (L187) · rewrite (L193)
  wrong   → precision: rerank (L190) · filters (L180) · embeddings (L181)
  hallucinated → context (L191) · instructions (L142) · faithfulness evals
  ungrounded   → groundedness evals (L337) · context formatting (L191)

THE METRIC TELLS (L195, L341)
  recall@k drops → retrieval mode (L189)
  groundedness drops → generation mode (L337)
  the golden set is the diagnostic — CI is the early warning

INTERVIEW, 4 MOVES
  1 taxonomy "four modes, four stages"
  2 diagnostic "retrieved? right? followed?"
  3 fixes    "recall, precision, context, evals"
  4 discipline "the metric names the mode (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - Wrong RAG answers are **a taxonomy, not one bug** (L196): missing chunk, wrong chunk, hallucinated answer, ungrounded answer
> - The diagnostic is **three questions**: was it retrieved (L189), was it right (L187–190), did the answer follow it (L337) — the answers name the mode
> - **Missing chunks → recall levers** (L193): chunking (L178), hybrid (L187), query rewriting (L193)
> - **Wrong chunks → precision levers** (L190): reranking (L190), filters (L180), embeddings (L181) — the sneakiest mode, confident and well-cited (L192)
> - **Hallucination → context and instructions** (L191, L142); **ungroundedness → groundedness evals** (L337)
> - **The golden set is the diagnostic** (L195, L341) — the regressed metric names the mode, and the misdiagnosis is the expensive failure (L196)

## Check your understanding

Answer these without looking back.

1. Name the four failure modes (L196).
2. What are the three diagnostic questions?
3. Which levers fix missing chunks (L193)?
4. Which levers fix wrong chunks (L190)?
5. What separates hallucinated from ungrounded (L337)?
6. Why is wrong-chunk the sneakiest mode (L192)?
7. How does the metric name the mode (L195)?
8. Why is the misdiagnosis the expensive failure?

## A Closing Note — The Diagnosis Before the Fix

You now hold the failure taxonomy: **missing chunks, wrong chunks, hallucinated answers, ungrounded answers — each traced to its stage, each fixed by its lever, each caught by the golden set.** "Why did the AI get it wrong?" now has a four-part answer — and the fix follows the mode.

Next: the module's capstone — production RAG architecture (L197), reassembling everything into one system.
