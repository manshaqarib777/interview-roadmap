# Lesson 195 — RAG Evaluation

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you know your RAG works?" — the answer is the *golden set*: retrieval metrics (precision, recall) and answer metrics (groundedness, L337) — the measuring loop that tunes the whole pipeline (L341).**

L174–194 built the RAG system. This lesson is the **measuring loop**: RAG evaluation — the golden set of questions with expected sources, scored for retrieval quality (precision, recall, MRR) and answer quality (groundedness, L337, faithfulness). Evaluation is what makes RAG an *engineering* discipline rather than a demo: every change — chunking (L178), retrieval (L189), reranking (L190), context (L191) — is a hypothesis tested against the golden set (L341).

The distinction this lesson is built on: a **demo** shows a few answers that look right. A **solutions architect** has a golden set, retrieval metrics, answer metrics, and a CI loop (L341) that re-scores every change — because "it looks right" is how retrieval regressions ship (L196).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the golden set: questions + expected sources (L195)
- Explain retrieval metrics: precision@k, recall@k, MRR (L195)
- Explain answer metrics: groundedness, faithfulness (L337)
- Design the eval loop: score on every change, in CI (L341)
- Use eval results to tune: chunking, top-k, reranking (L195)

## 1. One-Line Definition

**RAG evaluation is the measuring loop — a golden set of questions with expected sources, scored for retrieval quality (precision@k, recall@k, MRR) and answer quality (groundedness, faithfulness, L337), run on every change in CI (L341) — the discipline that turns "it looks right" into "it's measured", and the loop that tunes chunking (L178), retrieval (L189), and reranking (L190).**

The one-sentence interview answer: *"RAG evaluation is the golden set and the metrics (L195). I build a set of questions with expected source chunks — representative of real queries. Retrieval metrics: precision@k — of the retrieved chunks, how many are the expected ones; recall@k — of the expected chunks, how many were retrieved; MRR — how early the first right chunk ranks. Answer metrics: groundedness — does each claim follow from a retrieved chunk (L337); faithfulness — does the answer stay within the context (L196). The loop: score on every change — chunking (L178), top-k (L189), reranking (L190), context (L191) — in CI (L341), like a regression suite. 'It looks right' is how regressions ship; the golden set is how they don't (L196)."*

## 2. Mental Model

Think of RAG evaluation as **a driving test for your retrieval system.** The golden set is the test course — questions and the correct answers (expected sources). Retrieval metrics are the driving skills measured: precision is "did you find the right things without wrong ones?", recall is "did you find *all* the right things?", MRR is "was the first right thing near the top of your list?" Answer metrics are the passenger's check: groundedness is "did every claim come from the evidence you found?", faithfulness is "did you stay on the evidence, no inventions?" (L196). The test runs on every change to the car — a tweak to the engine (chunking, L178) gets re-tested (L341), not re-guessed.

```text
   the test course (golden set, L195)     the scores (L195, L337)
   ┌──────────────────────────┐           ┌──────────────────────────┐
   │ Q: "what's the return    │           │ precision@k — right hits  │
   │     policy for broken    │           │ recall@k    — all found   │
   │     items?"              │           │ MRR         — first rank  │
   │ → expected: return.md §3 │           │ groundedness — claims     │
   │   + refund.md §1         │           │   follow the chunks (L337)│
   └──────────────────────────┘           │ faithfulness — no extra   │
                                          └──────────────────────────┘
```

The mental model is **test course + scorecard**: the golden set is the course, the metrics are the scorecard, and CI (L341) re-runs the test on every change.

## 3. Visual Flow — The Eval Loop

```text
   a change: chunking (L178) · top-k (L189) · reranker (L190) · context (L191)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · RUN THE GOLDEN SET (L195)                            │
   │     every question → the pipeline → retrieved chunks     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · RETRIEVAL METRICS (L195)                             │
   │     precision@k · recall@k · MRR                         │
   │     — did retrieval find the right chunks?               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · ANSWER METRICS (L337)                                │
   │     groundedness · faithfulness (L196)                   │
   │     — did the answer follow the evidence?                │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · COMPARE vs BASELINE (L341)                           │
   │     regression? → revert or tune (L196)                  │
   │     improved? → ship the change                          │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the loop: change → score → keep or revert (L341)
```

The flow is the discipline: **run the set → score retrieval → score answers → compare to baseline** — every change is a hypothesis, CI is the referee (L341).

## 4. How It Works — The Set, the Metrics, the Loop

- **The golden set (L195).** Questions with expected source chunks — built from real queries (logs, L332), corrected by hand, and representative of the query shapes (L193) and the failure modes (L196) that matter. The set is the eval's ground truth; its honesty bounds everything (L342).
- **Retrieval metrics (L195).** **Precision@k** — of the retrieved chunks, the fraction that are expected. **Recall@k** — of the expected chunks, the fraction retrieved. **MRR** — the reciprocal rank of the first expected chunk (how early the first right answer appears). They measure the retrieval stage (L189) alone.
- **Answer metrics (L337).** **Groundedness** — each claim in the answer is supported by a retrieved chunk (L192, L337). **Faithfulness** — the answer stays within the context, inventing nothing (L196). They measure the generation stage (L145) against the evidence.
- **The loop (L341).** Every change — chunking (L178), top-k (L189), reranker (L190), context (L191) — is scored against the baseline and run in CI (L341): a regression reverts, an improvement ships. The loop is what makes RAG tuning an engineering process (L195).

> [!NOTE]
> **Retrieval and answer metrics answer different questions (L195, L337).** Retrieval metrics ask "did the pipeline *find* the right chunks?" — they isolate the retrieval stage (L189): chunking (L178), top-k (L189), reranking (L190). Answer metrics ask "did the model *use* them honestly?" — they isolate the generation stage (L145): groundedness (L337), faithfulness (L196). A system can score high on retrieval and still hallucinate (the model ignored the context); it can score high on answers and still miss chunks (retrieval failure, L196). The senior design runs both — they tune different stages (L341).

## 5. Real Project Usage

- **CI quality gate (L341).** The golden set runs on every PR — a chunking or reranking change that regresses recall fails the build (L195).
- **Chunking tuning (L178).** Candidate chunk sizes scored on the same set — the golden set decides, not preference (L179).
- **Reranker selection (L190).** Reranker on/off, model A vs B — MRR and recall@k pick the winner (L195).
- **Top-k budgeting (L189).** k = 3 vs 5 vs 8 — recall@k and the token cost (L149) traded on the set (L195).
- **Regression detection (L196).** A retrieval change that looks right on one example but regresses the set — the golden set catches it before users do (L341).

The through-line: **the golden set is the RAG system's regression suite** — the measuring loop that makes every tuning decision an experiment (L195, L341).

## 6. Interview Explanation

Say it in four moves:

1. **The set.** "A golden set — questions with expected sources, built from real queries and corrected by hand (L195)."
2. **The retrieval metrics.** "Precision@k, recall@k, MRR — did retrieval find the right chunks (L189)?"
3. **The answer metrics.** "Groundedness (L337) and faithfulness — did the answer follow the evidence (L196)?"
4. **The loop.** "Every change — chunking (L178), top-k (L189), reranking (L190) — scored in CI (L341) against the baseline. 'It looks right' is how regressions ship; the set is how they don't."

## 7. Senior-Level Insights

- **The golden set is the eval's ground truth, and its honesty is the ceiling (L342).** The senior answer includes the set's hygiene: real queries from logs (L332), corrected expectations, and a representative spread of query shapes (L193) and failure modes (L196) — a set that mirrors your users (L342).
- **The metrics isolate stages (L195, L337).** Retrieval metrics tune the retrieval stage (L189); answer metrics tune generation (L145). The senior design attributes a regression to its stage before tuning it (L196).
- **The loop is CI's (L341).** Scoring on every change, in the build, like a regression suite — the senior answer puts the golden set in the pipeline (L341), not in a notebook.
- **Evals are a cost line (L150, L337).** Answer metrics are LLM calls (L337) — the set is sized for CI latency and cost (L150), and the retrieval metrics are the cheap, fast half (L195).
- **Evals compose with observability (L332).** The golden set's questions come from usage logs (L332); production metrics validate the set's representativeness (L195) — the loop closes between offline eval and online monitoring (L341).

## 8. Common Mistakes

- **No eval at all (L195).** "It looks right" — the demo's discipline; regressions ship silently (L196).
- **A tiny or toy set (L342).** Three examples from memory — the set doesn't represent the queries (L193) or the failures (L196).
- **Retrieval-only metrics (L195).** Scoring precision/recall, never groundedness (L337) — a system that retrieves well and hallucinates anyway passes (L196).
- **Answer-only metrics (L337).** Scoring groundedness, never retrieval — the missing-chunk failure invisible (L196).
- **No baseline (L341).** Scores without a before — "improved" is a feeling, not a number (L195).
- **The set that never changes (L342).** Stale questions as the corpus and queries evolve — the set is maintained (L342), like any test suite.

## 9. Best Practices

- **Build the golden set from real queries** (L332, L342) — logs, corrected, representative (L193).
- **Score both stages** (L195, L337) — retrieval metrics (precision/recall/MRR) and answer metrics (groundedness/faithfulness).
- **Run in CI on every change** (L341) — the golden set is the regression suite (L195).
- **Compare to a baseline** (L341) — every change is scored before/after.
- **Attribute regressions to their stage** (L196) — retrieval metrics for retrieval changes (L189), answer metrics for generation (L145).
- **Maintain the set** (L342) — add new query shapes (L193) as the product evolves.

## 10. Interview Questions

**Q: How do you evaluate a RAG system?**
> A: A golden set and two metric families (L195). The set: real queries with expected source chunks (L342). Retrieval metrics — precision@k, recall@k, MRR: did retrieval find the right chunks (L189)? Answer metrics — groundedness (L337) and faithfulness: did the answer follow the evidence (L196)? The loop: score on every change in CI (L341), compare to baseline. 'It looks right' is how regressions ship; the set is how they don't.

**Q: What are precision and recall in RAG?**
> A: Retrieval quality, at k (L195). Precision@k — of the retrieved chunks, the fraction that are the expected ones: did I get the right things? Recall@k — of the expected chunks, the fraction retrieved: did I get all the right things? MRR — the reciprocal rank of the first expected chunk: how early did the first right answer appear? They isolate the retrieval stage (L189) — chunking (L178), top-k (L189), reranking (L190).

**Q: How do you evaluate the answers, not just retrieval?**
> A: Groundedness and faithfulness (L337). Groundedness: each claim in the answer is supported by a retrieved chunk (L192) — does the evidence back the claim? Faithfulness: the answer stays within the context — no inventions (L196). They isolate the generation stage (L145). A system can retrieve well and still hallucinate (L337); answer metrics catch that.

**Q: How does the eval loop work in practice?**
> A: It's CI's (L341). Every change — a chunking config (L178), a top-k (L189), a reranker (L190), a context format (L191) — runs the golden set and compares to the baseline. A regression reverts the change; an improvement ships it. The retrieval metrics are cheap and fast; the answer metrics are LLM calls (L337), sized for the CI budget (L150). The loop is the regression suite (L195).

## 11. Follow-Up Questions

- How do you build and maintain the golden set (L342)?
- What's the difference between groundedness and faithfulness (L337)?
- How do you attribute a regression to its stage (L196)?
- How do retrieval and answer metrics trade (L195)?
- How do evals compose with production observability (L332)?

## 12. Comparison Table — The Two Metric Families

| | Retrieval metrics (L195) | Answer metrics (L337) |
|---|---|---|
| Asks | did retrieval find the right chunks? | did the answer follow the evidence? |
| Metrics | precision@k, recall@k, MRR | groundedness, faithfulness |
| Stage (L189, L145) | retrieval | generation |
| Tunes | chunking (L178), top-k (L189), reranking (L190) | context (L191), instructions (L142) |
| Cost (L150) | cheap, fast | LLM calls (L337) |
| Misses | answer quality | retrieval quality |

The senior read: **the columns tune different stages** — the golden set runs both, and regressions are attributed to their stage (L196).

## 13. Code Example — The Eval Harness

```js
// RAG evaluation: golden set → retrieval + answer metrics (L195, L337).
const goldenSet = [
  { q: 'What is the return policy for broken items?', expected: ['return.md#3', 'refund.md#1'] },
  { q: 'How do I reset my password?',                 expected: ['account.md#2'] },
  // …built from real logs (L332), corrected by hand (L342)
];

async function evaluate(pipeline, set) {
  let precision = [], recall = [], mrr = [], grounded = [];

  for (const { q, expected } of set) {
    const { chunks, answer } = await pipeline(q);          // L189, L145
    const hit = (id) => chunks.slice(0, 5).includes(id);   // @k = 5

    // RETRIEVAL METRICS (L195).
    const hits = expected.filter(hit).length;
    precision.push(hits / Math.min(chunks.length, 5));     // right / retrieved
    recall.push(hits / expected.length);                   // right / expected
    const first = expected.map((e) => chunks.indexOf(e)).filter((i) => i >= 0);
    mrr.push(first.length ? 1 / (Math.min(...first) + 1) : 0);

    // ANSWER METRICS (L337) — LLM-scored groundedness per claim.
    grounded.push(await scoreGroundedness(answer, chunks)); // L337
  }

  return {
    precisionAt5: mean(precision), recallAt5: mean(recall),
    mrr: mean(mrr), groundedness: mean(grounded),
  };
}

// THE LOOP (L341) — every change is scored against the baseline, in CI.
const baseline = await evaluate(currentPipeline, goldenSet);
const candidate = await evaluate(newChunking, goldenSet);   // L178
if (candidate.recallAt5 < baseline.recallAt5) revert(newChunking);  // regression → revert
```

```text
What the reader must SEE — the set, the metrics, the loop:

  goldenSet: q + expected   → the ground truth (L342)
  precision / recall / mrr  → the retrieval stage (L195)
  scoreGroundedness()       → the answer stage (L337)
  candidate < baseline → revert  → the CI loop (L341)

  Measure both stages, compare to baseline, keep or revert.
```

```narrate
2-5: The golden set — real queries with expected sources (L342, L332).
8-11: The pipeline runs each question; the retrieved chunks and the answer are the inputs (L189, L145).
13-18: Retrieval metrics — precision (right/retrieved), recall (right/expected), MRR (first rank) (L195).
19-21: Answer metrics — groundedness, an LLM check of each claim vs the chunks (L337).
24-29: The loop — every candidate change is scored against the baseline; a regression reverts (L341).
```

> [!TIP]
> The line that makes it an engineering loop and not a demo: **`if (candidate.recallAt5 < baseline.recallAt5) revert(...)`** — **every change is a hypothesis; CI is the referee (L341).**

## 14. Performance Notes

- **Retrieval metrics are cheap (L195).** Precision/recall/MRR need no LLM calls (L150) — the fast, frequent half of the eval (L341).
- **Answer metrics are LLM calls (L337).** Groundedness scoring costs tokens (L150) — size the set for the CI budget, and sample where needed (L195).
- **The eval runs in CI (L341).** The golden set is a test suite — its runtime is part of the build (L296); keep the set lean and representative (L342).
- **Evals compose with observability (L332).** Production metrics validate the set's representativeness (L195) — the offline loop and the online monitor agree (L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Regressions ship anyway | No eval in CI (L341) | Wire the golden set into the build (L195) |
| High retrieval, bad answers | No answer metrics (L337) | Add groundedness scoring |
| Good answers, missing chunks | No retrieval metrics (L195) | Add precision/recall/MRR |
| Tuning by taste | No baseline (L341) | Score before/after every change |
| Eval out of date | Stale golden set (L342) | Refresh from logs (L332) |

## 16. Quick Revision Notes

- RAG eval = **golden set + two metric families** (L195, L337).
- Retrieval metrics: **precision@k, recall@k, MRR** — the retrieval stage (L189).
- Answer metrics: **groundedness, faithfulness** — the generation stage (L145).
- The loop: **score on every change, in CI, vs the baseline** (L341).
- The set: **real queries, corrected, representative** (L342).
- "It looks right" = **how regressions ship** (L196).

## 17. Cheat Sheet

```text
RAG EVALUATION = the golden set and the measuring loop

THE SET (L342)
  real queries (L332) + expected source chunks
  representative of query shapes (L193) and failures (L196)
  maintained as the product evolves

THE RETRIEVAL METRICS (L195) — the retrieval stage (L189)
  precision@k   right chunks / retrieved chunks
  recall@k      right chunks / expected chunks
  MRR           how early the first right chunk ranks

THE ANSWER METRICS (L337) — the generation stage (L145)
  groundedness  each claim follows a retrieved chunk (L192)
  faithfulness  no inventions — stays in the context (L196)

THE LOOP (L341)
  every change — chunking (L178) · top-k (L189) · reranking (L190)
  score vs the baseline, in CI
  regression → revert · improvement → ship

THE RULES
  measure both stages — retrieval AND answers (L195, L337)
  attribute regressions to their stage (L196)
  the set's honesty bounds the eval (L342)

INTERVIEW, 4 MOVES
  1 set     "questions + expected sources (L342)"
  2 retrieval "precision, recall, MRR (L195)"
  3 answers "groundedness, faithfulness (L337)"
  4 loop    "CI scores every change (L341)"
```

## 18. Key Takeaways

> [!RECAP]
> - RAG evaluation is **the golden set and the measuring loop** (L195): real queries with expected sources (L342), scored on every change in CI (L341)
> - **Retrieval metrics** — precision@k, recall@k, MRR — isolate the retrieval stage (L189): chunking (L178), top-k (L189), reranking (L190)
> - **Answer metrics** — groundedness and faithfulness (L337) — isolate the generation stage (L145): the answer follows the evidence, no inventions (L196)
> - **Both families are necessary** (L195, L337) — a system can retrieve well and hallucinate, or answer well and miss chunks; regressions are attributed to their stage
> - **The loop is CI's** (L341) — every change is scored against the baseline; a regression reverts, an improvement ships
> - **"It looks right" is how regressions ship** (L196) — the golden set is the discipline that turns RAG into engineering

## Check your understanding

Answer these without looking back.

1. What's in the golden set (L342)?
2. Define precision@k, recall@k, and MRR (L195).
3. What do groundedness and faithfulness measure (L337)?
4. Why run both metric families (L195)?
5. What's the eval loop (L341)?
6. How do you attribute a regression to its stage (L196)?
7. Why is the set maintained (L342)?
8. How do evals compose with observability (L332)?

## A Closing Note — The Scoreboard That Makes RAG Engineering

You now hold the measuring loop: **the golden set, the retrieval metrics, the answer metrics, and CI as the referee.** RAG is no longer "it looks right" — it's precision, recall, MRR, and groundedness, scored on every change.

Next: what the eval catches — RAG failure modes (L196), where missing chunks, wrong chunks, and hallucinated answers come from.
