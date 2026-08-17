# Lesson 337 — Groundedness Evaluation

**Interview importance:** ⭐⭐⭐⭐⭐ — "does the answer follow from the retrieved evidence?" — the answer is *the groundedness eval*: the answer vs the evidence, scored (L337).**

L336 detected the hallucinations; this lesson is **the eval behind the detection**: the groundedness evaluation — does the answer follow from the retrieved evidence (L337): the measure (the answer's alignment with the context, L337), the methods (the NLI, the LLM-judge, the human, L337), and the use (the detection L336, the regression suite L341). The AI shape (L173): the RAG (L280) — the groundedness (L337) as the core quality (L337). This lesson is the answer's truth check (L337).

The distinction this lesson is built on: a **demo** reads the answers. A **solutions architect** scores the groundedness (L337): the measure (L337), the methods (L337), and the use (L337) — because the grounded answer (L337) is the RAG's (L280) contract (L337).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the measure: the answer vs the evidence (L337)
- Explain the methods: the NLI, the LLM-judge, the human (L337)
- Explain the score: the grounded, the partially, the ungrounded (L337)
- Explain the use: the detection and the regression suite (L337)
- Explain the AI shape: the RAG's core quality (L337)

## 1. One-Line Definition

**The groundedness evaluation scores whether the answer follows from the retrieved evidence (L337) — the measure (the answer's alignment with the context: the claims vs the chunks L189, L337), the methods (the NLI L336: the natural language inference; the LLM-judge L343; the human review L341, L337), and the use (the detection L336: the low-groundedness flagged L336; the regression suite L341: the groundedness in the CI L296, L337) — the RAG's (L280) core quality (L337).**

The one-sentence interview answer: *"The groundedness evaluation is the answer's truth check (L337). The measure (L337): does the answer follow from the evidence (L337) — the answer's claims (L337) vs the retrieved chunks (L189) — each claim (L337) supported by a chunk (L337) or not (L337). The methods (L337): the NLI (L336) — the natural language inference: the answer's entailment from the context (L337); the LLM-judge (L343) — the second model (L343) scoring the groundedness (L337); and the human (L341) — the sampled review (L341) validating the judge (L343). The score (L337): the grounded (L337) — the claims supported (L337); the partially grounded (L337) — the mixed (L337); the ungrounded (L337) — the claims unsupported (L337). The use (L337): the detection (L336) — the low-groundedness (L337) flagged (L336) and the fallback (L336) applied (L337); and the regression suite (L341) — the groundedness (L337) in the golden set (L342), gating the deploy (L296). The AI shape (L173): the RAG (L280) — the groundedness (L337) as the core quality (L337): the answers (L328) scored (L337), the regressions (L341) caught (L337)."*

## 2. Mental Model

Think of the groundedness as **the judge's ruling on the essay.** The essay (the answer, L328) makes the claims (L337); the evidence (the retrieved chunks, L189) is the source material (L337). The judge (the evaluator, L337) rules on each claim (L337): the claim supported by the evidence (the grounded, L337) — the quote matches (L337); the claim partly supported (the partially, L337); the claim with no support (the ungrounded, L337) — the invented (L336). The judge's methods (L337): the clerk's check (the NLI, L336), the senior judge's review (the LLM-judge, L343), and the appeals panel (the human, L341). The court's record (the eval, L341) — the rulings (the scores, L337) on the golden essays (L342) — gates the new essays (the deploy, L296). The court works because every claim is ruled, and the record gates the releases (L337).

```text
   the ruling (the groundedness, L337)
   ┌────────────────────────────────────────────────────────┐
   │ the claims (the answer, L328) vs the evidence (the     │
   │ chunks, L189)                                          │
   │ the rulings (L337): the grounded, the partially, the   │
   │ ungrounded (L337)                                      │
   │ the methods (L337): the NLI (L336), the judge (L343),  │
   │ the human (L341)                                       │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the ruling**: the claims, the evidence, and the methods (L337).

## 3. Visual Flow — One Groundedness Score

```text
   the answer (L328) + the chunks (L189)
        │
        ▼
   ┌────────────────────── THE CLAIMS (L337) ───────────────────────────┐
   │  the claim 1: "the refund policy is 30 days" (L337)               │
   │  the claim 2: "the CEO resigned" (L337)                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE CHECK (L337) ────────────────────────────┐
   │  the claim 1 → supported by the chunk 3 (L337) → grounded (L337)  │
   │  the claim 2 → no supporting chunk (L337) → ungrounded (L337)     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCORE (L337) ────────────────────────────┐
   │  the groundedness = 0.5 (L337) — the partially (L337)             │
   │  the flag (L336) · the fallback (L336)                            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the score: **claims → check → score** (L337).

## 4. How It Works — The Truth Check, Part by Part

- **The measure (L337).** The answer's alignment with the context (L337): the answer's claims (L337) vs the retrieved chunks (L189) — each claim (L337) supported or not (L337).
- **The methods (L337).** The NLI (L336), the LLM-judge (L343), and the human (L341) — the judge (L343) validated by the human (L341).
- **The score (L337).** The grounded (L337), the partially (L337), the ungrounded (L337) — the fraction (L337) of the supported claims (L337).
- **The use (L337).** The detection (L336) — the low-groundedness (L337) flagged (L336); the regression suite (L341) — the groundedness (L337) in the CI (L296).

> [!NOTE]
> **The groundedness is the RAG's core quality (L337).** The senior answer places it (L337): the RAG (L280) exists to ground the answers (L280) — the groundedness (L337) is the contract (L337): the answer (L328) follows from the retrieved evidence (L189). The eval (L337) measures the contract (L337): the golden set (L342) scored (L337), the regressions (L341) gated (L296), and the detection (L336) guarding the production (L307).

## 5. Real Project Usage

- **A RAG platform (L280).** The groundedness (L337) — the core quality (L337) in the eval suite (L341).
- **A chat product (L162).** The groundedness (L337) of the free-form answers (L328) — the detection (L336).
- **A support copilot (L350).** The grounded answers (L337) with the citations (L192) — the trust (L350).
- **A regulated workload (L371).** The groundedness (L337) as the compliance's (L371) evidence (L337).
- **Anything RAG (L280).** The truth check (L337) — the answer vs the evidence (L337).

The through-line: **the check is the answer's truth** — the claims, the evidence, and the score (L337).

## 6. Interview Explanation

Say it in four moves:

1. **The measure.** "The answer's claims vs the retrieved chunks (L337)."
2. **The methods.** "The NLI (L336), the judge (L343), the human (L341)."
3. **The score.** "The grounded, the partially, the ungrounded (L337)."
4. **The use.** "The detection (L336) and the regression suite (L341)."

## 7. Senior-Level Insights

- **The claim-level check is the truth (L337).** The answer's claims (L337) vs the chunks (L189) — the groundedness (L337) per claim (L337).
- **The judge is the scalable scorer (L343).** The LLM-judge (L343) — the groundedness (L337) at the scale (L343) — the human (L341) validating (L341).
- **The golden set is the suite's (L342).** The groundedness (L337) in the golden set (L342) — the regressions (L341) gated (L296).
- **The detection is the production's guard (L336).** The low-groundedness (L337) flagged (L336) — the fallback (L336) applied (L337).
- **The citations are the user's check (L192).** The grounded answer (L337) with the citations (L192) — the user (L162) verifies (L192).

## 8. Common Mistakes

- **The fluency trusted (L336).** The confident answer (L336) — the groundedness (L337) un-scored (L337).
- **The answer-level score (L337).** The whole answer (L328) scored (L337) — the claim-level (L337) is the truth (L337).
- **The judge un-validated (L343).** The judge's (L343) bias (L343) — the human agreement (L341) checked (L337).
- **The suite missing (L341).** The groundedness (L337) un-gated (L296) — the regression (L341) ships (L337).
- **The detection unguarded (L336).** The low-groundedness (L337) delivered (L336) — the fallback (L336) missing (L337).

## 9. Best Practices

- **Check the claims** (L337) — the answer's claims vs the chunks (L189).
- **Score with the judge** (L343) — validated by the human (L341).
- **Gate the suite** (L341) — the groundedness (L337) in the CI (L296).
- **Guard the production** (L336) — the detection (L336) and the fallback (L336).
- **Cite the sources** (L192) — the user's (L162) verification (L192).

## 10. Interview Questions

**Q: Walk me through the groundedness evaluation.**
> A: The answer's truth check (L337). The measure — the answer's claims vs the retrieved chunks (L337). The methods — the NLI (L336), the LLM-judge (L343), the human (L341). The score — the grounded, the partially, the ungrounded (L337). And the use — the detection (L336) and the regression suite (L341).

**Q: How do you score it?**
> A: The claim-level (L337): split the answer (L328) into the claims (L337), and check each (L337) against the retrieved chunks (L189) — the NLI (L336): the entailment (L337); or the judge (L343): the supported? (L337). The groundedness (L337) is the fraction of the supported claims (L337).

**Q: How does the judge work?**
> A: The LLM-judge (L343): a second model (L343) reads the answer (L328) and the chunks (L189) and scores the groundedness (L337) — the supported claims (L337) vs the unsupported (L337). The judge (L343) is validated (L343) against the human reviews (L341) — the agreement (L343) measured (L337).

**Q: How does it gate the deploy?**
> A: The regression suite (L341): the golden set (L342) with the groundedness (L337) scored (L337) — the CI (L296) runs it (L341), and the score (L337) below the threshold (L337) fails the build (L296). The groundedness (L337) is the RAG's (L280) quality gate (L337).

## 11. Follow-Up Questions

- What's the measure (L337)?
- How do you score it (L337)?
- How does the judge work (L343)?
- How does it gate the deploy (L341)?
- What's the score's scale (L337)?

## 12. Comparison Table — The Eval vs the Detection

| | The eval (L337) | The detection (L336) |
|---|---|---|
| The scope (L337) | the golden set (L342) | the individual output (L328) |
| The timing (L337) | the CI (L296), the schedule (L221) | the production (L307), per answer (L336) |
| The method (L337) | the NLI (L336), the judge (L343) | the same, per answer (L336) |
| The use (L337) | the quality gate (L341) | the fallback (L336) |

The senior read: **the eval measures the system; the detection guards the answer** (L337).

## 13. Code Example — The Check, Applied

```js
// The groundedness eval (L337) — the answer vs the evidence (L337).
// 1 · THE CLAIMS (L337) — the answer split (L337).
const claims = splitClaims(answer);              // the answer's claims (L337)

// 2 · THE CHECK (L337) — each claim vs the chunks (L189).
async function scoreGroundedness(answer, chunks) {
  const claims = splitClaims(answer);            // L337

  // THE NLI (L336): the entailment per claim (L337).
  const nli = await Promise.all(
    claims.map((claim) => nliEntails(claim, chunks)),   // L337
  );

  // THE JUDGE (L343): the second opinion (L343).
  const judged = await judge.score({
    claims, chunks,                              // L343
    prompt: 'Is each claim supported by the chunks?',  // L337
  });

  const supported = nli.filter(Boolean).length;
  const groundedness = supported / claims.length;      // the score (L337)

  return {
    groundedness,                                // the fraction (L337)
    unsupported: claims.filter((_, i) => !nli[i]),     // the flagged (L336)
  };
}

// 3 · THE USE (L337): the regression gate (L341) and the detection (L336).
//   golden set (L342): the groundedness >= 0.9 → the deploy (L296)
//   production (L307): the groundedness < 0.85 → the fallback (L336)
```

```text
What the reader must SEE — the check, applied:

  splitClaims(answer)        → the claims (L337)
  nliEntails per claim       → the NLI (L336, L337)
  judge.score                → the second opinion (L343)
  supported / claims.length  → the groundedness (L337)
  golden set >= 0.9 → deploy → the regression gate (L341, L296)

  The claims ruled, the score computed, the gate applied (L337).
```

```narrate
4-5: The claims — the answer split into the verifiable claims (L337).
7-17: The NLI — each claim checked against the chunks (L336, L337).
19-22: The judge — the second model's score (L343, L337).
24-28: The score — the fraction of the supported claims (L337).
30-32: The use — the regression gate and the production guard (L341, L336).
```

> [!TIP]
> The pair that defines the eval: **the claim-level NLI** (the truth, L337) and **the golden-set threshold** (the gate, L341). **Split the claims, check each against the chunks, score the fraction, gate the deploy — the answer's truth check (L337).**

## 14. Performance Notes

- **The NLI is the eval's cost (L337).** The entailment per claim (L337) — the tokens (L332) per check (L337).
- **The judge is the scale's cost (L343).** The second model (L343) — the sampled (L341) vs the per-answer (L336) — the budget (L334) balanced (L337).
- **The suite is the CI's time (L341).** The golden set (L342) — the minutes (L337) in the pipeline (L296).
- **The detection is the answer's latency (L336).** The per-answer check (L336) — the seconds (L337) for the guard (L336).

## 15. Debugging Scenarios

| Symptom | First check (L337) | The lever |
|---|---|---|
| The answers drift | The suite (L341) | The golden set (L342) |
| The judge is lenient | The validation (L343) | The human agreement (L341) |
| The claims are vague | The splitting (L337) | The claim extraction (L337) |
| The detection is slow | The check (L336) | The sampling (L341) |
| The regressions ship | The gate (L341) | The threshold (L337) in the CI (L296) |

## 16. Quick Revision Notes

- The groundedness eval = **the answer's truth check** (L337): the measure, the methods, the score, the use.
- The measure: **the answer's claims vs the retrieved chunks (L189)**.
- The methods: **the NLI (L336), the LLM-judge (L343), the human (L341)**.
- The score: **the grounded, the partially, the ungrounded (L337)**.
- The use: **the detection (L336) and the regression suite (L341)**.

## 17. Cheat Sheet

```text
GROUNDEDNESS EVALUATION = does the answer follow from the evidence?

THE MEASURE (L337)
  the answer's claims (L337) vs the retrieved chunks (L189)
  each claim (L337) supported by a chunk (L337) or not (L337)

THE METHODS (L337)
  the NLI (L336) — the entailment from the context (L337)
  the LLM-judge (L343) — the groundedness scored (L343)
  the human (L341) — validating the judge (L343)

THE SCORE (L337)
  the grounded (L337) — the claims supported (L337)
  the partially (L337) · the ungrounded (L337)
  the fraction of the supported claims (L337)

THE USE (L337)
  the detection (L336) — the low-groundedness (L337) flagged (L336)
  the regression suite (L341) — the golden set (L342) gating (L296)

INTERVIEW, 4 MOVES
  1 measure "the claims vs the chunks (L337)"
  2 methods "the NLI, the judge, the human (L337)"
  3 score   "the grounded, the partially, the ungrounded (L337)"
  4 use     "the detection and the suite (L336, L341)"
```

## 18. Key Takeaways

> [!RECAP]
> - The groundedness evaluation **scores whether the answer follows from the retrieved evidence** (L337): the measure (L337), the methods (L337), the score (L337), and the use (L337)
> - **The measure** (L337): the answer's claims (L337) vs the retrieved chunks (L189) — each claim (L337) supported or not (L337)
> - **The methods** (L337): the NLI (L336) — the natural language inference (L337); the LLM-judge (L343) — the groundedness scored (L343); and the human (L341) — validating the judge (L343)
> - **The score** (L337): the grounded (L337), the partially (L337), the ungrounded (L337) — the fraction (L337) of the supported claims (L337)
> - **The use** (L337): the detection (L336) — the low-groundedness (L337) flagged (L336) and the fallback (L336) applied; and the regression suite (L341) — the groundedness (L337) in the golden set (L342), gating the deploy (L296)
> - The AI shape (L337): the RAG (L280) — the groundedness (L337) as the core quality (L337) — the answers (L328) scored (L337), the regressions (L341) caught (L337)

## Check your understanding

Answer these without looking back.

1. What's the measure (L337)?
2. How do you score it (L337)?
3. How does the judge work (L343)?
4. How does it gate the deploy (L341)?
5. What's the score's scale (L337)?
6. What's the NLI (L336)?
7. What's the golden set (L342)?
8. What is the answer's truth check (L337)?

## A Closing Note — The Rulings, Filed

You now hold the check: **the measure, the methods, the score, and the use — with every claim ruled and the record gating the releases.** The judge rules on each claim — and the ungrounded doesn't pass (L337).

Next: precision, recall, and the golden query set — Retrieval Evaluation (L338).
