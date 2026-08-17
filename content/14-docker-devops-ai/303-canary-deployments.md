# Lesson 303 — Canary Deployments

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you ship to 5% and roll forward?" — the answer is *the canary*: the small slice, the metrics, and the gradual rollout (L303).**

L302 built the strategies; this lesson is **the riskiest deploy's gate**: the canary deployments — ship to 5%, watch the metrics, roll forward (L303): the slice (the small traffic percentage, L303), the metrics (the errors, the latency, the cost, L303), and the progression (the 5% → 25% → 100%, L303). The AI shape (L173): the model update (L365) — the canary (L303) with the evals (L341) and the cost (L334) watched (L303). This lesson is the deploy's risk gate (L303).

The distinction this lesson is built on: a **demo** ships to everyone. A **solutions architect** ships to 5% (L303): the slice (L303), the metrics (L303), and the roll forward (L303) — because the AI service's changes (L365) are the riskiest (L303).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the slice: the small traffic percentage (L303)
- Explain the metrics: the errors, the latency, the cost (L303)
- Explain the progression: the 5% → 25% → 100% (L303)
- Explain the rollback: the instant off (L304)
- Explain the AI shape: the model update as the canary (L303)

## 1. One-Line Definition

**The canary deployment ships to 5%, watches the metrics, and rolls forward (L303) — the slice (the small traffic percentage: the new version serves 5% of the requests, L303), the metrics (the errors, the latency L333, and the cost L334 compared against the baseline, L303), and the progression (the 5% → 25% → 100% as the metrics hold, L303) — with the rollback (L304): the instant off (L303) — the AI model update (L365) as the canary (L303).**

The one-sentence interview answer: *"The canary deploys the new version to a small slice first (L303). The slice (L303): the new version serves 5% of the traffic (L303) — the 95% stays on the old (L303) — the blast radius (L314) bounded (L303). The metrics (L303): the canary's errors (L303), the latency (L333), and the cost (L334) compared against the baseline (L303) — the health check (L303) of the rollout (L303). The progression (L303): as the metrics hold (L303), the slice grows — the 5% → 25% → 100% (L303) — each step watched (L303); the metrics' regression (L303) stops the rollout (L303). The rollback (L304): the instant off (L303) — the traffic (L273) back to the old (L304) — the canary's safety (L303). The AI shape (L173): the model update (L365) as the canary (L303) — the new model (L148) serving the 5% (L303), the evals (L341) and the cost (L334) watched (L303) — the model's regression (L335) caught on the 5% (L303), not the 100% (L303). The demo ships to everyone and hopes; the canary ships to 5% and watches (L303)."*

## 2. Mental Model

Think of the canary as **the taster in the kitchen.** The chef (the team, L303) serves the new dish (the new version, L303) to the taster (the 5%, L303) first (L303): the taster eats (L303), and the chef watches (the metrics, L303) — the taster's reaction (the errors, L303), the time to eat (the latency, L333), the ingredients' cost (the cost, L334). If the taster is fine (the metrics hold, L303), the chef serves more tables (the progression, L303) — the 5% → 25% → 100% (L303). If the taster turns green (the regression, L303), the dish is pulled (the rollback, L304) — the instant off (L303). The kitchen works because the taster tries first, the chef watches, and the dish is pulled fast (L303).

```text
   the taster (the canary, L303)
   ┌────────────────────────────────────────────────────────┐
   │ the taster (the 5%, L303) — the new version's slice     │
   │ (L303)                                                  │
   │ the watch (the metrics, L303) — the errors, the         │
   │ latency (L333), the cost (L334)                         │
   │ the tables (the progression, L303) — 5% → 25% → 100%   │
   │ the pull (the rollback, L304) — the instant off (L303)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the taster**: the slice, the watch, the tables, and the pull (L303).

## 3. Visual Flow — One Canary

```text
   the new version (L303)
        │
        ▼
   ┌────────────────────── THE SLICE (L303) ────────────────────────────┐
   │  the new version serves 5% (L303) · the old serves 95% (L303)     │
   │  the blast radius (L314) bounded (L303)                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE WATCH (L303) ────────────────────────────┐
   │  the metrics (L303): the errors, the latency (L333), the cost     │
   │  (L334) vs the baseline (L303)                                    │
   │  the regression (L303) → the stop (L303) → the rollback (L304)    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE PROGRESSION (L303) ──────────────────────┐
   │  the metrics hold → 25% (L303) → 50% (L303) → 100% (L303)        │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the canary: **slice → watch → progress → (rollback)** (L303).

## 4. How It Works — The Gate, Part by Part

- **The slice (L303).** The small traffic percentage (L303): the new version serves 5% (L303), the old 95% (L303) — the blast radius (L314) bounded (L303).
- **The metrics (L303).** The canary's health (L303): the errors (L303), the latency (L333), the cost (L334) — compared against the baseline (L303).
- **The progression (L303).** The gradual rollout (L303): the 5% → 25% → 100% (L303) — each step watched (L303), the regression (L303) stopping the rollout (L303).
- **The rollback (L304).** The instant off (L303): the traffic (L273) back to the old (L304) — the canary's safety (L303).

> [!NOTE]
> **The canary is the model update's gate (L303).** The senior answer treats the model update (L365) as the canary's natural use (L303): the new model (L148) serving the 5% (L303), the evals (L341) and the cost (L334) watched (L303) — the model's regression (L335), the hallucination (L336), and the cost (L334) caught on the 5% (L303). The canary (L303) is the L365 rollout (L365) — the riskiest change (L303) gated (L303).

## 5. Real Project Usage

- **A model update (L365).** The new model (L148) as the canary (L303): the 5% (L303), the evals (L341) and the cost (L334) watched, the progression (L303).
- **A code update (L296).** The new build (L289) as the canary (L303): the rolling (L302) with the canary's slice (L303).
- **A feature flag rollout (L300).** The flag (L300) for the canary's slice (L303) — the beta tenants (L320) first (L303).
- **A multi-tenant SaaS (L357).** The per-tenant canary (L303): the new version (L303) to the beta tenants (L320) first (L303).
- **Anything risky (L303).** The riskiest change (L303) as the canary (L303) — the 5% first (L303).

The through-line: **the canary is the risk's gate** — the 5%, the metrics, and the progression (L303).

## 6. Interview Explanation

Say it in four moves:

1. **The slice.** "The 5% — the new version serves the small slice (L303)."
2. **The watch.** "The metrics — the errors, the latency, the cost vs the baseline (L303)."
3. **The progression.** "The 5% → 25% → 100% — as the metrics hold (L303)."
4. **The rollback.** "The instant off — the traffic back (L304)."

## 7. Senior-Level Insights

- **The blast radius is the slice's point (L314).** The 5% (L303) — the blast radius (L314) bounded (L303) — the broken version (L303) hits the few (L303).
- **The metrics are the rollout's truth (L303).** The errors, the latency (L333), the cost (L334) vs the baseline (L303) — the health check (L303) of the rollout (L303).
- **The progression is the confidence's pace (L303).** The 5% → 25% → 100% (L303) — the steps (L303) sized by the risk (L303) — the model's (L365) steps (L303) slower (L303).
- **The rollback is the instant off (L304).** The traffic (L273) back (L304) — the seconds (L303), not the redeploy (L302).
- **The evals are the model's metrics (L341).** The canary's evals (L341) — the groundedness (L337) and the cost (L334) — the L341 gates (L341), canary-shaped (L303).

## 8. Common Mistakes

- **The 100% ship (L303).** The full rollout (L303) without the slice (L303) — the blast radius (L314) the whole (L303).
- **The metrics unwatched (L303).** The 5% (L303) without the watch (L303) — the regression (L303) undetected (L303).
- **The jump to 100% (L303).** The 5% → 100% (L303) — the progression (L303) is the gradual (L303).
- **The no-baseline comparison (L303).** The canary's metrics (L303) without the baseline (L303) — the regression (L303) invisible (L303).
- **The canary without the rollback (L304).** The regression (L303) without the instant off (L304) — the broken version (L303) rolls on (L303).

## 9. Best Practices

- **Slice the traffic** (L303) — the 5% first (L303).
- **Watch the metrics** (L303) — the errors, the latency (L333), the cost (L334) vs the baseline (L303).
- **Progress gradually** (L303) — the 5% → 25% → 100% (L303).
- **Gate the model with the evals** (L341) — the L341 gates (L341) in the canary (L303).
- **Rehearse the instant off** (L304) — the canary's rollback (L304).

## 10. Interview Questions

**Q: Walk me through a canary deployment.**
> A: The risk's gate (L303). The slice — the new version serves 5% (L303). The watch — the metrics: the errors, the latency (L333), the cost (L334) vs the baseline (L303). The progression — the 5% → 25% → 100% as the metrics hold (L303). And the rollback — the instant off (L304).

**Q: How do you decide the slice and the steps?**
> A: By the risk (L303): the riskier the change (L303), the smaller the first slice (L303) and the slower the progression (L303). The model update (L365) — the 5% first, the steps slower (L303), the evals (L341) gating each (L303). The code update (L296) — the larger slices (L303), the faster steps (L303).

**Q: What metrics do you watch?**
> A: The rollout's truth (L303): the error rate (L303), the latency (L333) — the TTFT (L145) for the AI (L303) — and the cost (L334) — the tokens (L332) for the model (L303). Each compared against the baseline (L303) — the regression (L303) stops the rollout (L303).

**Q: How do you roll back a canary?**
> A: The instant off (L304): the traffic (L273) back to the old version (L304) — the seconds (L303), not the redeploy (L302). The canary's safety (L303): the 5% (L303) rolls back in seconds (L304).

## 11. Follow-Up Questions

- What's the slice (L303)?
- What are the metrics (L303)?
- What's the progression (L303)?
- How do you roll back (L304)?
- How do you canary a model (L365)?

## 12. Comparison Table — Canary vs Blue/Green

| | The canary (L303) | The blue/green (L302) |
|---|---|---|
| The slice (L303) | the 5% gradual (L303) | the 100% switch (L302) |
| The duration (L303) | the watch + the progression (L303) | the switch (L302) |
| The rollback (L304) | the instant off (L303) | the switch back (L304) |
| The use (L303) | the model (L365), the risky (L303) | the big-bang switch (L302) |

The senior read: **the canary for the gradual, the blue/green for the switch** (L303).

## 13. Code Example — The Canary, Declared

```js
// The canary (L303) — the model update, gated (L365, L303).
// 1 · THE SLICE (L303) — the 5% of the traffic (L303).
const canary = {
  version: 'new-model-v2',                    // the new model (L148)
  weight: 5,                                  // the 5% (L303)
  // the Route 53 weighted routing (L273) or the flag (L300)
};

// 2 · THE WATCH (L303) — the metrics vs the baseline (L303).
const watch = {
  errorRate: { threshold: 0.01, window: '5m' },     // the errors (L303)
  ttft:      { threshold: 1.5, unit: 's' },         // the latency (L333, L145)
  costPerCall: { threshold: 0.02, unit: 'usd' },    // the cost (L334)
  evals: { groundedness: 0.9 },                     // the L341 gates (L341)
};

// 3 · THE PROGRESSION (L303) — as the metrics hold (L303).
const progression = [5, 25, 50, 100];               // the steps (L303)

// 4 · THE ROLLBACK (L304) — the instant off (L303).
const rollback = { action: 'weight-to-0', immediate: true };  // L304
```

```text
What the reader must SEE — the canary, declared:

  weight: 5                 → the slice (L303)
  errorRate + ttft + cost   → the watch (L303, L333, L334)
  evals: groundedness       → the model's gate (L341)
  5 → 25 → 50 → 100         → the progression (L303)
  weight-to-0               → the instant rollback (L304)

  The 5%, the metrics, the progression — the risk's gate (L303).
```

```narrate
4-8: The slice — the new model serves the 5% of the traffic (L303, L148).
10-16: The watch — the error rate, the TTFT, the cost, and the evals against the baseline (L303, L333, L341).
18-19: The progression — the steps as the metrics hold (L303).
21-22: The rollback — the weight to zero, the instant off (L304, L303).
```

> [!TIP]
> The pair that defines the canary: **the 5% weight** (the slice, L303) and **the evals gate** (the model's metrics, L341). **Slice the traffic, watch the metrics, progress gradually, roll back instantly — the risk's gate (L303).**

## 14. Performance Notes

- **The slice is the blast radius (L314).** The 5% (L303) — the broken version (L303) hits the few (L303).
- **The watch is the rollout's latency (L303).** The metrics (L303) — the TTFT (L145) and the errors (L303) — the progression (L303) waits for the window (L303).
- **The progression is the exposure's growth (L303).** The steps (L303) — the exposure (L303) grows with the confidence (L303).
- **The rollback is the recovery's speed (L304).** The weight to zero (L304) — the seconds (L303) to the old (L304).

## 15. Debugging Scenarios

| Symptom | First check (L303) | The lever |
|---|---|---|
| The 5% is broken | The metrics (L303) | The regression (L303) → the stop (L303) |
| The rollout stalls | The thresholds (L303) | The metrics' window (L303) |
| The model regresses | The evals (L341) | The L341 gates (L341) |
| The cost spikes | The cost (L334) | The tokens (L332), the model (L148) |
| The rollback is slow | The weight (L304) | The weight-to-0 (L304) |

## 16. Quick Revision Notes

- The canary = **the risk's gate** (L303): the slice, the watch, the progression, the rollback.
- The slice: **the 5% — the new version's small share** (L303).
- The watch: **the errors, the latency (L333), the cost (L334) vs the baseline** (L303).
- The progression: **the 5% → 25% → 100%** (L303).
- The rollback: **the instant off — the weight to zero (L304)**.

## 17. Cheat Sheet

```text
CANARY DEPLOYMENTS = ship to 5%, watch the metrics, roll forward

THE SLICE (L303)
  the new version serves 5% (L303) · the old serves 95% (L303)
  the blast radius (L314) bounded (L303)

THE WATCH (L303)
  the errors (L303) · the latency (L333) · the cost (L334)
  vs the baseline (L303) — the regression stops the rollout (L303)

THE PROGRESSION (L303)
  the 5% → 25% → 100% (L303) — as the metrics hold (L303)
  the steps sized by the risk (L303)

THE ROLLBACK (L304)
  the instant off (L303) — the traffic back to the old (L304)
  the weight to zero (L304)

THE AI SHAPE (L303)
  the model update (L365) as the canary (L303)
  the evals (L341) gating · the cost (L334) watched
  the TTFT (L145) as the latency metric (L333)

INTERVIEW, 4 MOVES
  1 slice    "the 5% (L303)"
  2 watch    "the metrics vs the baseline (L303)"
  3 progression "5% → 25% → 100% (L303)"
  4 rollback "the instant off (L304)"
```

## 18. Key Takeaways

> [!RECAP]
> - The canary deployment **ships to 5%, watches the metrics, and rolls forward** (L303): the slice (L303), the metrics (L303), the progression (L303), and the rollback (L304)
> - **The slice** (L303): the new version serves 5% of the traffic (L303), the old 95% (L303) — the blast radius (L314) bounded (L303)
> - **The metrics** (L303): the errors (L303), the latency (L333), and the cost (L334) compared against the baseline (L303) — the regression (L303) stops the rollout (L303)
> - **The progression** (L303): the 5% → 25% → 100% (L303), each step watched (L303), sized by the risk (L303)
> - **The rollback** (L304): the instant off (L303) — the traffic (L273) back to the old (L304), the weight to zero (L304)
> - The AI shape (L303): the model update (L365) as the canary (L303) — the new model (L148) serving the 5% (L303), the evals (L341) and the cost (L334) watched (L303) — the model's regression (L335) caught on the 5% (L303), not the 100% (L303)

## Check your understanding

Answer these without looking back.

1. What's the slice (L303)?
2. What are the metrics (L303)?
3. What's the progression (L303)?
4. How do you roll back (L304)?
5. How do you canary a model (L365)?
6. What's the blast radius (L314)?
7. What are the model's metrics (L341)?
8. What is the risk's gate (L303)?

## A Closing Note — The Taster, First

You now hold the gate: **the slice, the watch, the progression, and the rollback — with the 5% first and the instant off ready.** The riskiest change has its gate — and the taster tries first (L303).

Next: the instant-revert path — Rollbacks & Recovery (L304).
