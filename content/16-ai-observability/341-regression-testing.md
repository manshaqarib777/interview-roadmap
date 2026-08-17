# Lesson 341 — Regression Testing for AI

**Interview importance:** ⭐⭐⭐⭐⭐ — "the eval suite that runs on every deploy, like tests but for quality" — the answer is *the regression suite*: the evals in the CI, the golden set, and the gate (L341).**

L296 built the pipeline and L342 will build the datasets; this lesson is **the suite that gates it**: the regression testing for AI — the eval suite that runs on every deploy, like the tests but for the quality (L341): the suite (the evals in the CI L296, L341), the set (the golden L342 and the adversarial L342), and the gate (the thresholds and the diff, L341). The AI shape (L173): the changes (L365) — the suite (L341) gating (L341). This lesson is the AI's test suite (L341).

The distinction this lesson is built on: a **demo** deploys and hopes. A **solutions architect** gates with the evals (L341): the suite (L341), the set (L342), and the diff (L341) — because the AI's regression (L335) is caught like the code's (L296).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the suite: the evals in the CI (L341)
- Explain the set: the golden and the adversarial (L342)
- Explain the gate: the thresholds and the diff (L341)
- Explain the placement: the pipeline's stages (L296)
- Explain the AI shape: the quality's test suite (L341)

## 1. One-Line Definition

**The regression testing for AI is the eval suite that runs on every deploy, like the tests but for the quality (L341) — the suite (the evals L337, L338, L340 in the CI L296: the groundedness, the retrieval, the agent, L341), the set (the golden L342 and the adversarial L342, L341), and the gate (the thresholds: the scores L341 and the diff: the old vs the new, L341) — the AI's (L173) regression, caught (L341).**

The one-sentence interview answer: *"The regression testing for AI is the eval suite in the CI (L341). The suite (L341): the evals (L341) — the groundedness (L337), the retrieval (L338), the tool success (L339), and the agent (L340) — running on every deploy (L307) like the unit tests (L296). The set (L342): the golden (L342) — the representative cases with the expected outputs (L342); and the adversarial (L342) — the injection (L309) and the jailbreaks (L310), the edge cases (L342). The gate (L341): the thresholds (L341) — the groundedness ≥ 0.9, the retrieval recall ≥ 0.85 (L338), the task success ≥ 0.9 (L340); and the diff (L341) — the new scores vs the old (L341): the regression (L341) — the score dropped (L341) — fails the build (L296). The placement (L296): the eval stage (L297) in the pipeline (L307) — the CI (L296) runs it, the CD (L296) waits (L297). The AI shape (L173): the changes (L365) — the model (L148), the prompt (L328), the retrieval (L189) — gated (L341): the suite (L341) catches the regression (L341) before the users (L162)."*

## 2. Mental Model

Think of the regression suite as **the driving test before the license.** The test (the suite, L341) checks the driver (the AI change, L365) before the license (the deploy, L307): the standard course (the golden set, L342) — the known routes (L342) with the expected (L342); and the obstacle course (the adversarial set, L342) — the hazards (L309) and the edge cases (L342). The examiner (the gate, L341) scores (L341): the passing marks (the thresholds, L341) — the parallel parking (the groundedness, L337), the highway (the retrieval, L338) — and the comparison (the diff, L341): the new driver (L365) vs the old (L341) — the worse score (L341) → the fail (L296). The department (the CI, L296) runs the test (L341) for every applicant (L307). The roads work because the test is standard, the obstacles are included, and the worse driver doesn't get the license (L341).

```text
   the driving test (the suite, L341)
   ┌────────────────────────────────────────────────────────┐
   │ the standard course (the golden, L342) · the obstacles │
   │ (the adversarial, L342)                                │
   │ the examiner (the gate, L341) — the marks (L341), the  │
   │ comparison (L341)                                      │
   │ the department (the CI, L296) — every applicant (L307) │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the driving test**: the course, the examiner, and the department (L341).

## 3. Visual Flow — One Gated Deploy

```text
   the change (L365)
        │  the model (L148), the prompt (L328), the retrieval (L189)
        ▼
   ┌────────────────────── THE SUITE (L341) ────────────────────────────┐
   │  the groundedness (L337) · the retrieval (L338) · the agent (L340)│
   │  the golden set (L342) · the adversarial set (L342)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCORES (L341) ───────────────────────────┐
   │  the new: groundedness 0.92 · recall 0.87 · success 0.9 (L341)    │
   │  the old: groundedness 0.94 · recall 0.88 · success 0.91 (L341)   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE GATE (L341) ─────────────────────────────┐
   │  the thresholds: ≥ 0.9, ≥ 0.85, ≥ 0.9 (L341)                     │
   │  the diff: the groundedness dropped 0.02 → the fail (L341)        │
   │  → the build fails (L296) · the deploy stops (L307)               │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the gate: **suite → scores → gate** (L341).

## 4. How It Works — The Suite, Part by Part

- **The suite (L341).** The evals (L341): the groundedness (L337), the retrieval (L338), the tool success (L339), and the agent (L340) — running in the CI (L296).
- **The set (L342).** The golden (L342) — the representative cases (L342); and the adversarial (L342) — the injections (L309), the jailbreaks (L310), the edge cases (L342).
- **The gate (L341).** The thresholds (L341) and the diff (L341) — the new scores vs the old (L341) — the regression (L341) fails the build (L296).
- **The placement (L296).** The eval stage (L297) in the pipeline (L307) — the CD (L296) waits (L297).

> [!NOTE]
> **The evals are the AI's tests (L341).** The senior answer draws the parallel (L341): the code's (L296) unit tests (L296) catch the code's regression (L296); the AI's (L341) eval suite (L341) catches the quality's (L341) regression (L335) — the groundedness (L337), the retrieval (L338), and the agent (L340) — on every deploy (L307). The diff (L341) is the key (L341): the absolute threshold (L341) plus the comparison (L341) — the score dropped (L341) fails (L296) even above the threshold (L341).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The eval suite (L341) in the pipeline (L307) — the changes (L365) gated (L341).
- **A RAG platform (L280).** The retrieval (L338) and the groundedness (L337) — the golden set (L342) gating (L341).
- **An agent product (L279).** The agent eval (L340) — the golden tasks (L342) in the suite (L341).
- **A model update (L365).** The new model (L148) — the suite (L341) vs the old (L341) — the diff (L341) gating (L341).
- **Anything AI (L173).** The quality's test suite (L341) — like the tests (L296), but for the quality (L341).

The through-line: **the gate is the suite's** — the evals, the set, and the diff (L341).

## 6. Interview Explanation

Say it in four moves:

1. **The suite.** "The evals in the CI — the groundedness, the retrieval, the agent (L341)."
2. **The set.** "The golden (L342) and the adversarial (L342)."
3. **The gate.** "The thresholds and the diff (L341)."
4. **The placement.** "The pipeline's stage (L296) — the CD waits (L297)."

## 7. Senior-Level Insights

- **The diff is the regression's truth (L341).** The new scores (L341) vs the old (L341) — the dropped score (L341) fails (L296) even above the threshold (L341) — the silent regression (L335) caught (L341).
- **The adversarial set is the safety's (L342).** The injections (L309) and the jailbreaks (L310) — the security (L325) regressions (L341) caught (L342).
- **The eval stage is the pipeline's (L297).** The workflow (L297) — the eval job (L341) gating the deploy (L302) — the CD (L296) waits (L297).
- **The cost is the suite's (L334).** The golden set (L342) — the tokens (L332) per run (L341) — the sample (L341) sized by the budget (L334).
- **The drift is the suite's extension (L335).** The production (L307) samples (L341) — the golden set (L342) refreshed (L341) — the drift (L335) into the suite (L341).

## 8. Common Mistakes

- **The no-suite deploy (L341).** The change (L365) un-gated (L341) — the regression (L335) ships (L341).
- **The golden only (L342).** The standard cases (L342) without the adversarial (L342) — the injection (L309) regression (L341) missed (L342).
- **The threshold only (L341).** The absolute (L341) without the diff (L341) — the drop (L341) hidden above the threshold (L341).
- **The stale set (L342).** The golden (L342) never refreshed (L342) — the suite (L341) drifts from the production (L335).
- **The eval after the deploy (L341).** The suite (L341) in the CD's tail (L296) — the users (L162) first (L341).

## 9. Best Practices

- **Gate every change** (L341) — the model (L148), the prompt (L328), the retrieval (L189).
- **Include the adversarial** (L342) — the injections (L309), the jailbreaks (L310).
- **Compare the diff** (L341) — the new vs the old (L341).
- **Refresh the set** (L342) — from the production's (L307) samples (L341).
- **Run before the deploy** (L341) — the eval stage (L297) gating the CD (L296).

## 10. Interview Questions

**Q: Walk me through the regression testing for AI.**
> A: The eval suite in the CI (L341). The suite — the groundedness (L337), the retrieval (L338), the agent (L340). The set — the golden (L342) and the adversarial (L342). The gate — the thresholds and the diff (L341). And the placement — the pipeline's stage (L296).

**Q: How is it like the unit tests?**
> A: The parallel (L341): the unit tests (L296) catch the code's regression (L296) on every commit (L296); the eval suite (L341) catches the quality's (L341) — the groundedness (L337), the retrieval (L338), the agent (L340) — on every deploy (L307). The CI (L296) runs both (L341); the CD (L296) waits for both (L297).

**Q: What's the diff?**
> A: The comparison (L341): the new scores (L341) vs the old (L341) — the baseline (L341). The dropped score (L341) — the groundedness 0.94 → 0.92 (L341) — fails the build (L296) even above the absolute threshold (L341). The diff (L341) catches the silent regression (L335).

**Q: How do you keep the set honest?**
> A: The refresh (L342): the production's (L307) samples (L341) — the real queries (L332) and the real failures (L339) — added to the golden set (L342); the new attacks (L326) added to the adversarial (L342). The stale set (L342) drifts from the production (L335) — the refresh (L342) keeps the suite (L341) honest (L341).

## 11. Follow-Up Questions

- What's the suite (L341)?
- How is it like the unit tests (L296)?
- What's the diff (L341)?
- How do you keep the set honest (L342)?
- What's the adversarial set (L342)?

## 12. Comparison Table — The Tests vs the Evals

| | The unit tests (L296) | The eval suite (L341) |
|---|---|---|
| The target (L341) | the code (L296) | the quality (L341) |
| The unit (L341) | the function (L296) | the answer (L328), the retrieval (L189) |
| The set (L341) | the fixtures (L296) | the golden (L342), the adversarial (L342) |
| The timing (L341) | every commit (L296) | every deploy (L307) |
| The gate (L341) | the pass/fail (L296) | the thresholds + the diff (L341) |

The senior read: **the evals are the AI's tests** — the quality's regression, caught (L341).

## 13. Code Example — The Gate, Applied

```yaml
# The regression suite (L341) — the eval stage in the pipeline (L296).
# THE CI (L296) — the tests and the evals (L341).
jobs:
  unit-tests:                      # the code's tests (L296)
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  evals:                           # the AI's tests (L341)
    runs-on: ubuntu-latest
    steps:
      - run: npm run eval:golden       # the golden set (L342)
      - run: npm run eval:adversarial  # the injections + the jailbreaks (L342)
      - run: npm run eval:compare      # the diff vs the baseline (L341)

  deploy:                          # the CD (L296) — waits for both (L297)
    needs: [unit-tests, evals]
    steps:
      - run: ecs-deploy --canary 5%    # the gate passed (L302, L303)

# THE THRESHOLDS (L341): groundedness >= 0.9, recall >= 0.85,
#   task-success >= 0.9 — and the diff (L341): no score dropped > 0.01
```

```text
What the reader must SEE — the gate, applied:

  npm test                  → the code's tests (L296)
  eval:golden + adversarial → the AI's suite (L341, L342)
  eval:compare              → the diff vs the baseline (L341)
  deploy needs both         → the CD waits (L297)
  thresholds + diff         → the gate (L341)

  The tests and the evals — the quality gated like the code (L341).
```

```narrate
5-7: The unit tests — the code's regression caught (L296).
9-14: The evals — the golden and the adversarial sets run (L341, L342).
16-19: The deploy — the CD waits for the tests and the evals (L297, L296).
21-23: The gate — the thresholds and the diff (L341).
```

> [!TIP]
> The pair that defines the suite: **the golden-set evals** (the quality's measure, L342) and **the diff gate** (the regression's truth, L341). **Run the evals in the CI, include the adversarial, compare the diff, gate the deploy — the AI's test suite (L341).**

## 14. Performance Notes

- **The suite is the CI's time (L341).** The evals (L341) — the minutes (L341) in the pipeline (L296) — the sample (L341) sized (L341).
- **The cost is the suite's (L334).** The golden set (L342) — the tokens (L332) per run (L341) — the budget (L334) bounded (L341).
- **The diff is the baseline's (L341).** The stored baseline (L341) — the comparison (L341) cheap (L341).
- **The gate is the deploy's speed (L341).** The evals (L341) before the CD (L296) — the regression (L341) caught before the users (L162).

## 15. Debugging Scenarios

| Symptom | First check (L341) | The lever |
|---|---|---|
| The regression ships | The gate (L341) | The suite (L341) in the CI (L296) |
| The scores dropped | The diff (L341) | The baseline (L341) |
| The injection passes | The adversarial (L342) | The set (L342) |
| The set is stale | The refresh (L342) | The production's samples (L335) |
| The suite is slow | The sample (L341) | The set's size (L342) |

## 16. Quick Revision Notes

- The regression testing for AI = **the AI's test suite** (L341): the suite, the set, the gate, the placement.
- The suite: **the evals in the CI (L296) — the groundedness (L337), the retrieval (L338), the agent (L340)**.
- The set: **the golden (L342) and the adversarial (L342)**.
- The gate: **the thresholds and the diff (L341)**.
- The placement: **the pipeline's stage (L297) — the CD waits (L296)**.

## 17. Cheat Sheet

```text
REGRESSION TESTING FOR AI = the eval suite on every deploy

THE SUITE (L341)
  the groundedness (L337) · the retrieval (L338)
  the tool success (L339) · the agent (L340)
  running in the CI (L296) — like the unit tests (L296)

THE SET (L342)
  the golden (L342) — the representative cases (L342)
    with the expected outputs (L342)
  the adversarial (L342) — the injections (L309),
    the jailbreaks (L310), the edge cases (L342)

THE GATE (L341)
  the thresholds (L341) — the scores (L341)
  the diff (L341) — the new vs the old (L341)
  the dropped score (L341) → the build fails (L296)

THE PLACEMENT (L296)
  the eval stage (L297) in the pipeline (L307)
  the CD (L296) waits (L297) — before the users (L162)

INTERVIEW, 4 MOVES
  1 suite   "the evals in the CI (L341)"
  2 set     "the golden and the adversarial (L342)"
  3 gate    "the thresholds and the diff (L341)"
  4 placement "the pipeline's stage (L296)"
```

## 18. Key Takeaways

> [!RECAP]
> - The regression testing for AI is **the eval suite that runs on every deploy, like the tests but for the quality** (L341): the suite (L341), the set (L342), the gate (L341), and the placement (L296)
> - **The suite** (L341): the evals (L341) — the groundedness (L337), the retrieval (L338), the tool success (L339), and the agent (L340) — running in the CI (L296)
> - **The set** (L342): the golden (L342) — the representative cases (L342); and the adversarial (L342) — the injections (L309), the jailbreaks (L310), the edge cases (L342)
> - **The gate** (L341): the thresholds (L341) and the diff (L341) — the new scores (L341) vs the old (L341) — the regression (L341) fails the build (L296)
> - **The placement** (L296): the eval stage (L297) in the pipeline (L307) — the CD (L296) waits (L297)
> - The principle (L341): the evals are the AI's tests (L341) — the quality's regression (L335) caught like the code's (L296), before the users (L162)

## Check your understanding

Answer these without looking back.

1. What's the suite (L341)?
2. How is it like the unit tests (L296)?
3. What's the diff (L341)?
4. How do you keep the set honest (L342)?
5. What's the adversarial set (L342)?
6. What's the threshold (L341)?
7. What's the placement (L297)?
8. What is the AI's test suite (L341)?

## A Closing Note — The Test, Administered

You now hold the suite: **the evals, the set, the gate, and the placement — with the standard course and the obstacles.** The driving test is standard — and the worse driver doesn't get the license (L341).

Next: the golden sets, the adversarial sets, and keeping them honest — Evaluation Datasets (L342).
