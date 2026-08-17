# Lesson 335 — Model Performance Monitoring

**Interview importance:** ⭐⭐⭐⭐⭐ — "quality drift and behavioral change after deploy — the hidden regressions" — the answer is *the drift watch*: the model's quality and behavior after the deploy (L335).**

L341 will build the regression suite; this lesson is **the hidden regressions**: the model performance monitoring — the quality drift and the behavioral change after the deploy (L335): the drift (the quality's decay, L335), the behavior (the output's change, L335), and the watch (the samples, the evals, the alerts, L335). The AI shape (L173): the deployed model (L365) — the drift (L335) detected (L335). This lesson is the drift's watch (L335).

The distinction this lesson is built on: a **demo** deploys and forgets. A **solutions architect** watches the drift (L335): the quality (L335), the behavior (L335), and the alerts (L274) — because the model (L365) changes after the deploy (L335).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the drift: the quality's decay (L335)
- Explain the behavior: the output's change (L335)
- Explain the watch: the samples, the evals, the alerts (L335)
- Explain the causes: the data shift, the model change (L335)
- Explain the AI shape: the deployed model's watch (L335)

## 1. One-Line Definition

**The model performance monitoring watches the quality drift and the behavioral change after the deploy (L335) — the drift (the quality's decay: the answers' L341 quality slipping, L335), the behavior (the output's change: the length, the format, the refusal rate, L335), and the watch (the sampled reviews L341, the evals L341, and the alerts L274, L335) — the deployed model (L365), watched (L335).**

The one-sentence interview answer: *"The model performance monitoring catches the hidden regressions (L335). The drift (L335): the quality's decay (L335) — the answers' (L341) quality slipping (L335) without a code change (L335): the model's (L148) update (L365) upstream (L335), the prompt's (L328) behavior (L335), the data's (L335) shift (L335). The behavior (L335): the output's change (L335) — the length (L335), the format (L335), the refusal rate (L335), the tool call rate (L315) — the observable shifts (L335). The watch (L335): the sampled reviews (L341) — the human or the judge (L343) scoring the samples (L342); the evals (L341) — the golden set (L342) run on the schedule (L221); and the alerts (L274) — the drift over the threshold (L274) → the page (L335). The causes (L335): the data shift (L335) — the users' inputs changed (L335); the model change (L365) — the provider's update (L152); the prompt change (L328) — the drift's root (L335). The AI shape (L173): the deployed model (L365) — the watch (L335): the samples (L341), the evals (L341), and the alerts (L274) — the hidden regression (L335), found (L335)."*

## 2. Mental Model

Think of the model monitoring as **the lighthouse keeper's nightly sweep.** The keeper (the monitor, L335) sweeps the light (the watch, L335) across the sea (the production, L307): the ships (the requests, L328) pass (L335), and the keeper checks the signals (the behavior, L335) — the ships' lights (the outputs, L328) the same brightness (the format, L335), the same count (the length, L335). The keeper also reads the logbook (the samples, L341): the captains' (the reviewers, L341) notes (the scores, L341) — the seamarks (the golden set, L342) checked (L341). The fog (the drift, L335) — the signals fading (L335) — the keeper rings the bell (the alert, L274). The coast works because the sweep is nightly, the logbook is read, and the bell rings at the fade (L335).

```text
   the sweep (the watch, L335)
   ┌────────────────────────────────────────────────────────┐
   │ the ships (the requests, L328) — the signals (the      │
   │ behavior, L335)                                        │
   │ the logbook (the samples, L341) — the notes (the       │
   │ scores, L341) · the seamarks (the golden set, L342)    │
   │ the fog (the drift, L335) · the bell (the alert, L274) │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the sweep**: the signals, the logbook, and the bell (L335).

## 3. Visual Flow — One Drift Detection

```text
   the deploy (L365)
        │
        ▼
   ┌────────────────────── THE WATCH (L335) ────────────────────────────┐
   │  the behavior (L335): the length, the format, the refusal rate    │
   │  the samples (L341): the outputs → the scores (L341)              │
   │  the evals (L341): the golden set (L342) on the schedule (L221)   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DRIFT (L335) ────────────────────────────┐
   │  the quality's decay (L335) — the scores slipping (L341)          │
   │  the behavior's shift (L335) — the format changed (L335)          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ALERT (L274) ────────────────────────────┐
   │  the drift over the threshold (L274) → the page (L335)            │
   │  the rollback (L304) or the fix (L335)                            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the detection: **watch → drift → alert** (L335).

## 4. How It Works — The Watch, Part by Part

- **The drift (L335).** The quality's decay (L335): the answers' (L341) quality slipping (L335) without a code change (L335).
- **The behavior (L335).** The output's change (L335): the length (L335), the format (L335), the refusal rate (L335), the tool call rate (L315).
- **The watch (L335).** The sampled reviews (L341), the evals (L341) on the schedule (L221), and the alerts (L274).
- **The causes (L335).** The data shift (L335), the model change (L365), the prompt change (L328).

> [!NOTE]
> **The drift is the deploy's hidden regression (L335).** The senior answer names the difference (L335): the code's regression (L296) is caught by the tests (L296) at the deploy (L307); the model's drift (L335) appears *after* (L335) — the provider's update (L152), the data's shift (L335), the prompt's behavior (L328) — the quality (L341) slipping silently (L335). The watch (L335) — the samples (L341), the evals (L341), and the alerts (L274) — is the model's regression suite (L335).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The watch (L335) — the sampled reviews (L341) and the alerts (L274).
- **A chat product (L162).** The behavior (L335) — the refusal rate (L335) and the length (L335) watched (L335).
- **A RAG platform (L280).** The retrieval's quality (L195) drifting (L335) — the groundedness (L337) watched (L335).
- **An agent product (L279).** The tool call rate (L315) and the success (L339) — the behavior (L335) watched (L335).
- **Anything AI (L173).** The deployed model (L365) — the watch (L335) — the hidden regression (L335), found (L335).

The through-line: **the watch is the drift's** — the samples, the evals, and the alerts (L335).

## 6. Interview Explanation

Say it in four moves:

1. **The drift.** "The quality's decay — without a code change (L335)."
2. **The behavior.** "The output's change — the length, the format, the refusals (L335)."
3. **The watch.** "The samples (L341), the evals (L341), the alerts (L274)."
4. **The causes.** "The data shift (L335), the model change (L365), the prompt (L328)."

## 7. Senior-Level Insights

- **The drift is the silent regression (L335).** The quality (L341) slipping (L335) without the deploy (L307) — the model (L365) changed upstream (L335).
- **The behavior is the early signal (L335).** The length (L335) and the refusal rate (L335) — the observable shifts (L335) before the quality (L341).
- **The samples are the truth (L341).** The sampled reviews (L341) — the human or the judge (L343) — the L342 samples (L342), scored (L341).
- **The evals are the schedule's (L341).** The golden set (L342) on the schedule (L221) — the drift (L335) measured (L341).
- **The alert is the rollback's trigger (L274).** The drift over the threshold (L274) — the page (L274), the rollback (L304) — the L304 path (L304), drift-driven (L335).

## 8. Common Mistakes

- **The deploy-and-forget (L335).** The model (L365) deployed (L307) without the watch (L335) — the drift (L335) silent (L335).
- **The code-only tests (L296).** The tests (L296) at the deploy (L307) — the drift (L335) appears after (L335) — the watch (L335) is the model's suite (L335).
- **The behavior un-watched (L335).** The length (L335) and the refusals (L335) unmeasured (L335) — the early signal (L335) missed (L335).
- **The samples un-reviewed (L341).** The outputs (L328) unscored (L341) — the quality (L341) unknown (L335).
- **The alert-less drift (L274).** The decay (L335) without the page (L274) — the users (L162) find it first (L335).

## 9. Best Practices

- **Watch the behavior** (L335) — the length, the format, the refusals (L335).
- **Sample the reviews** (L341) — the human or the judge (L343).
- **Run the evals** (L341) — the golden set (L342) on the schedule (L221).
- **Alert the drift** (L274) — the threshold (L274) → the page (L274).
- **Roll back on the drift** (L304) — the L304 path (L304).

## 10. Interview Questions

**Q: Walk me through the model performance monitoring.**
> A: The hidden regressions (L335). The drift — the quality's decay without a code change (L335). The behavior — the output's change: the length, the format, the refusals (L335). The watch — the samples (L341), the evals (L341), the alerts (L274). And the causes — the data shift (L335), the model change (L365), the prompt (L328).

**Q: Why does the model drift?**
> A: Three causes (L335): the data shift (L335) — the users' inputs (L328) changed (L335); the model change (L365) — the provider's update (L152) altered the behavior (L335); and the prompt's (L328) interaction (L335) — the same prompt (L328), the different model (L148), the different output (L335). The drift (L335) needs no code change (L335).

**Q: How do you detect it?**
> A: The watch (L335): the behavior (L335) — the observable shifts (L335); the samples (L341) — the outputs (L328) scored by the human or the judge (L343); and the evals (L341) — the golden set (L342) on the schedule (L221). The drift (L335) over the threshold (L274) → the page (L274).

**Q: What do you do when it drifts?**
> A: The rollback (L304) or the fix (L335): the drift's alert (L274) triggers the rollback (L304) to the previous model (L148); or the fix (L335) — the prompt (L328), the model (L148), the data (L335) — with the evals (L341) verifying (L341). The L304 path (L304), drift-driven (L335).

## 11. Follow-Up Questions

- What's the drift (L335)?
- Why does the model drift (L335)?
- How do you detect it (L335)?
- What do you do when it drifts (L304)?
- What's the behavior (L335)?

## 12. Comparison Table — The Code vs the Model Regression

| | The code (L296) | The model (L335) |
|---|---|---|
| The timing (L335) | at the deploy (L307) | after the deploy (L335) |
| The cause (L335) | the code change (L296) | the data shift (L335), the model change (L365) |
| The detection (L335) | the tests (L296) | the samples (L341), the evals (L341) |
| The fix (L335) | the rollback (L304) | the rollback (L304), the prompt (L328) |

The senior read: **the model's regression needs its own suite** — the watch (L335).

## 13. Code Example — The Watch, Applied

```js
// The drift watch (L335) — the model's regression suite (L335).
// 1 · THE BEHAVIOR (L335) — the observable shifts (L335).
const behavior = {
  length:         histogram('ai.out_length'),         // the length (L335)
  refusalRate:    counter('ai.refusals_total'),       // the refusals (L335)
  toolCallRate:   counter('ai.tool_calls_total'),     // the tools (L315)
  formatValid:    counter('ai.format_invalid_total'), // the format (L335)
};

// 2 · THE SAMPLES (L341) — the reviewed outputs (L341).
async function sampleOutput(req, out) {
  if (Math.random() < 0.01) {                // the 1% sample (L341)
    const score = await judge.score(req.prompt, out);   // the judge (L343)
    await evalStore.write({ promptHash: hash(req.prompt), score });  // L341
  }
}

// 3 · THE EVALS (L341) — the golden set on the schedule (L221).
//   cron: the golden set (L342) run nightly (L221)
//   the drift score (L341) computed (L341)

// 4 · THE ALERT (L274) — the drift over the threshold (L274).
//   ai.eval_score < 0.85 for 3 runs → the page (L274)
//   → the rollback (L304) to the previous model (L148)
```

```text
What the reader must SEE — the watch, applied:

  length + refusalRate + toolCallRate → the behavior (L335)
  the 1% sample → the judge's score   → the samples (L341, L343)
  the golden set on the cron          → the evals (L341, L221)
  score < 0.85 → the page             → the alert (L274)
  → the rollback (L304)               → the fix (L335)

  The drift watched, scored, alerted, and rolled back (L335).
```

```narrate
4-9: The behavior — the length, the refusals, the tools, and the format watched (L335).
11-16: The samples — the 1% of the outputs scored by the judge (L341, L343).
18-19: The evals — the golden set on the nightly schedule (L341, L221).
21-23: The alert and the rollback — the drift pages and reverts (L274, L304).
```

> [!TIP]
> The pair that defines the watch: **the sampled score** (the truth, L341) and **the drift alert** (the trigger, L274). **Watch the behavior, sample the outputs, run the evals, alert and roll back — the model's hidden regression, found (L335).**

## 14. Performance Notes

- **The sampling is the review's cost (L335).** The 1% (L341) — the judge's (L343) cost (L334) bounded (L335).
- **The behavior is the zero-cost watch (L335).** The counters (L331) — the negligible (L335) cost (L335).
- **The evals are the schedule's cost (L341).** The golden set (L342) — the tokens (L332) on the schedule (L221).
- **The alert is the incident's speed (L274).** The threshold (L274) — the drift (L335) caught before the users (L162).

## 15. Debugging Scenarios

| Symptom | First check (L335) | The lever |
|---|---|---|
| The answers got worse | The drift (L335) | The samples (L341), the evals (L341) |
| The refusals spiked | The behavior (L335) | The refusal rate (L335) |
| The provider updated | The model (L365) | The re-eval (L341) |
| The drift is silent | The alert (L274) | The threshold (L274) |
| The users complain first | The watch (L335) | The samples (L341) |

## 16. Quick Revision Notes

- The model performance monitoring = **the drift's watch** (L335): the drift, the behavior, the watch.
- The drift: **the quality's decay — without a code change (L335)**.
- The behavior: **the output's change — the length, the format, the refusals (L335)**.
- The watch: **the samples (L341), the evals (L341), the alerts (L274)**.
- The causes: **the data shift (L335), the model change (L365), the prompt (L328)**.

## 17. Cheat Sheet

```text
MODEL PERFORMANCE MONITORING = the drift and the behavior after deploy

THE DRIFT (L335)
  the quality's decay (L335) — the answers' (L341) quality slipping (L335)
  without a code change (L335)
  the causes: the data shift (L335), the model change (L365),
  the prompt's (L328) behavior (L335)

THE BEHAVIOR (L335)
  the output's change (L335): the length (L335), the format (L335)
  the refusal rate (L335), the tool call rate (L315)
  the observable shifts (L335) — the early signal (L335)

THE WATCH (L335)
  the samples (L341) — the outputs (L328) scored (L341)
    by the human or the judge (L343)
  the evals (L341) — the golden set (L342) on the schedule (L221)
  the alerts (L274) — the drift over the threshold (L274) → the page (L274)

THE FIX (L335)
  the rollback (L304) to the previous model (L148)
  or the fix (L335): the prompt (L328), the model (L148), the data (L335)

INTERVIEW, 4 MOVES
  1 drift    "the quality's decay (L335)"
  2 behavior "the output's change (L335)"
  3 watch    "the samples, the evals, the alerts (L335)"
  4 fix      "the rollback (L304), the prompt, the model (L335)"
```

## 18. Key Takeaways

> [!RECAP]
> - The model performance monitoring **watches the quality drift and the behavioral change after the deploy** (L335): the drift (L335), the behavior (L335), the watch (L335), and the fix (L335)
> - **The drift** (L335): the quality's decay (L335) — the answers' (L341) quality slipping (L335) without a code change (L335)
> - **The behavior** (L335): the output's change (L335) — the length (L335), the format (L335), the refusal rate (L335), the tool call rate (L315)
> - **The watch** (L335): the sampled reviews (L341) — the human or the judge (L343); the evals (L341) — the golden set (L342) on the schedule (L221); and the alerts (L274) — the drift over the threshold (L274) → the page (L274)
> - **The causes** (L335): the data shift (L335), the model change (L365), and the prompt's (L328) behavior (L335)
> - **The fix** (L335): the rollback (L304) to the previous model (L148) or the fix (L335) — the prompt (L328), the model (L148), the data (L335) — with the evals (L341) verifying (L341)

## Check your understanding

Answer these without looking back.

1. What's the drift (L335)?
2. Why does the model drift (L335)?
3. How do you detect it (L335)?
4. What do you do when it drifts (L304)?
5. What's the behavior (L335)?
6. What's the sample (L341)?
7. What's the judge (L343)?
8. What is the drift's watch (L335)?

## A Closing Note — The Sweep, Nightly

You now hold the watch: **the drift, the behavior, the samples, and the alerts — with the logbook read and the bell ready.** The lighthouse sweeps nightly — and the fog is found (L335).

Next: spotting the ungrounded claims — Hallucination Detection (L336).
