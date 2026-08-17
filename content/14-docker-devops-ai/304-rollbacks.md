# Lesson 304 — Rollbacks & Recovery

**Interview importance:** ⭐⭐⭐⭐⭐ — "what happens when the new version misbehaves?" — the answer is *the rollback*: the instant-revert path when the new model or build misbehaves (L304).**

L302 built the strategies and L303 the canary; this lesson is **the safety net**: the rollbacks & recovery — the instant-revert path when the new model or build misbehaves (L304): the rollback (the version revert, L304), the strategies (the switch, the redeploy, the flag, L304), and the recovery (the runbook, the postmortem, L304). The AI shape (L173): the model update (L365) rolled back (L304) when the evals (L341) or the metrics (L333) regress (L304). This lesson is the pipeline's safety net (L304).

The distinction this lesson is built on: a **demo** scrambles. A **solutions architect** rehearses (L304): the rollback (L304), the strategy (L304), and the runbook (L304) — because the L307 pipeline (L307) ships with the safety net (L304).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the rollback: the version revert (L304)
- Explain the strategies: the switch, the redeploy, the flag (L304)
- Explain the recovery: the runbook and the postmortem (L304)
- Explain the AI shape: the model rollback (L304)
- Explain the discipline: the rehearsed revert (L304)

## 1. One-Line Definition

**The rollbacks & recovery are the instant-revert path when the new model or build misbehaves (L304) — the rollback (the version revert: the previous image L291 or the previous model L148, L304), the strategies (the switch L273 — the blue/green's L302; the redeploy L302 — the recreate's; the flag L300 — the feature's, L304), and the recovery (the runbook: the rehearsed steps L304; the postmortem: the learnings L304) — the pipeline's safety net (L304).**

The one-sentence interview answer: *"The rollback is the instant-revert path (L304). The trigger (L304): the new version (L302) misbehaves — the errors spike (L303), the latency regresses (L333), the cost (L334) explodes, the model (L365) degrades (L335) (L304). The rollback (L304): the previous version restored (L304) — the previous image (L291) or the previous model (L148) (L304). The strategies (L304): the switch (L304) — the blue/green's (L302) traffic back (L273), the instant (L304); the redeploy (L304) — the recreate's (L302) previous version, with the downtime (L302); the flag (L304) — the feature flag (L300) off, the instant (L304). The recovery (L304): the runbook (L304) — the rehearsed steps: who decides (L304), what's rolled (L304), how it's verified (L304); and the postmortem (L304) — why it happened (L304), how it's prevented (L304). The AI shape (L173): the model update (L365) rolled back (L304) when the evals (L341) or the metrics (L333) regress (L304) — the previous model (L148) restored (L304), the traffic (L273) back (L304). The demo scrambles; the architect reverts (L304)."*

## 2. Mental Model

Think of the rollback as **the stage's emergency curtain.** The show (the release, L302) runs the new act (the new version, L302); the stage manager (the on-call, L304) watches the signs (the metrics, L303) — the boos (the errors, L303), the slow scenes (the latency, L333), the overrun (the cost, L334). At the first sign (the trigger, L304), the curtain drops (the rollback, L304): the old act (the previous version, L304) returns (L304) — the switch (the blue/green's, L302) or the flag (L300) — the show continues (the recovery, L304). The crew rehearses the curtain (the runbook, L304) — everyone knows their move (L304) — and the next morning (the postmortem, L304), the crew discusses what went wrong (L304). The theater works because the curtain is rehearsed, the drop is instant, and the review is honest (L304).

```text
   the curtain (the rollback, L304)
   ┌────────────────────────────────────────────────────────┐
   │ the signs (the triggers, L304) — the errors, the        │
   │ latency (L333), the cost (L334)                        │
   │ the drop (the rollback, L304) — the switch (L273), the │
   │ redeploy (L302), the flag (L300)                       │
   │ the rehearsal (the runbook, L304) · the review (the    │
   │ postmortem, L304)                                      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the curtain**: the signs, the drop, the rehearsal, and the review (L304).

## 3. Visual Flow — One Rollback

```text
   the new version misbehaves (L304)
        │  the trigger (L304): the errors (L303), the latency (L333),
        │  the cost (L334), the model's evals (L341)
        ▼
   ┌────────────────────── THE DECISION (L304) ─────────────────────────┐
   │  the runbook (L304): who decides (L304), what's rolled (L304)     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REVERT (L304) ───────────────────────────┐
   │  the switch (L273) — the blue/green's traffic back (L302, L304)   │
   │  the redeploy (L302) — the previous image (L291)                  │
   │  the flag (L300) — the feature off (L304)                         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RECOVERY (L304) ─────────────────────────┐
   │  the verify (L304) — the metrics back to the baseline (L303)      │
   │  the postmortem (L304) — the why and the prevention (L304)        │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the revert: **trigger → decide → revert → recover** (L304).

## 4. How It Works — The Safety Net, Part by Part

- **The triggers (L304).** The misbehavior (L304): the errors spike (L303), the latency regresses (L333), the cost (L334) explodes, the model (L365) degrades (L335). The triggers (L304) are the alarms' (L274).
- **The rollback (L304).** The previous version restored (L304): the previous image (L291) or the previous model (L148) (L304).
- **The strategies (L304).** The switch (L304) — the blue/green's (L302) traffic back (L273), the instant (L304); the redeploy (L304) — the recreate's (L302) previous version, with the downtime (L302); the flag (L304) — the feature flag (L300) off, the instant (L304).
- **The recovery (L304).** The runbook (L304): the rehearsed steps (L304) — who decides (L304), what's rolled (L304), how it's verified (L304); the postmortem (L304): the why and the prevention (L304).

> [!NOTE]
> **The rollback is the deployment's pair (L304).** The senior answer pairs the deploy (L302) with its rollback (L304) at the design time (L304): the blue/green's (L302) switch back (L304), the canary's (L303) weight to zero (L304), the flag's (L300) off (L304) — the rollback (L304) is designed with the deploy (L302), not after (L304). The rehearsed rollback (L304) is the pipeline's (L307) trust (L304).

## 5. Real Project Usage

- **A model update (L365).** The new model (L148) rolled back (L304) when the evals (L341) or the metrics (L333) regress (L304) — the previous model (L148) restored (L304).
- **A code update (L296).** The new build (L289) rolled back (L304) — the ECS (L295) service (L295) to the previous task (L291).
- **A feature rollout (L300).** The flag (L300) off (L304) — the instant (L304).
- **A migration (L268).** The schema change (L268) — the backward-compatible (L302) so the rollback (L304) is safe (L304).
- **Anything shipped (L307).** The pipeline (L307) ships with the safety net (L304) — the rehearsed revert (L304).

The through-line: **the safety net is the pipeline's trust** — the trigger, the revert, and the runbook (L304).

## 6. Interview Explanation

Say it in four moves:

1. **The triggers.** "The errors, the latency (L333), the cost (L334), the evals (L341)."
2. **The revert.** "The previous version restored (L304)."
3. **The strategies.** "The switch (L273), the redeploy (L302), the flag (L300)."
4. **The recovery.** "The runbook and the postmortem (L304)."

## 7. Senior-Level Insights

- **The rollback is designed with the deploy (L304).** The strategy (L302) and its rollback (L304) — the pair (L304) at the design time (L304).
- **The switch is the instant revert (L304).** The blue/green's (L302) traffic back (L273) — the seconds (L304) — the users' API's (L233) rollback (L304).
- **The flag is the feature's revert (L304).** The flag (L300) off (L304) — the feature (L300) disabled without the redeploy (L304).
- **The runbook is the calm (L304).** The rehearsed steps (L304) — who decides (L304), what's rolled (L304) — the on-call (L274) acts, not scrambles (L304).
- **The postmortem is the prevention (L304).** The why (L304) — the L304 learnings (L304) into the tests (L296) and the evals (L341).

## 8. Common Mistakes

- **The rollback after the design (L304).** The strategy (L302) without the rollback (L304) — the deploy (L302) is the risk (L304).
- **The untested rollback (L304).** The runbook (L304) un-rehearsed (L304) — the first rollback (L304) is the failure's (L304).
- **The incompatible schema (L268).** The migration (L268) blocking the revert (L304) — the backward-compatible (L302) is the safety (L304).
- **The manual revert (L304).** The hand-rolled steps (L304) — the automated (L304) in the pipeline (L307).
- **The no postmortem (L304).** The incident (L304) without the why (L304) — the recurrence (L304) guaranteed (L304).

## 9. Best Practices

- **Design the rollback with the deploy** (L304) — the pair (L304).
- **Rehearse the runbook** (L304) — the calm (L304).
- **Prefer the switch and the flag** (L304) — the instant (L304).
- **Keep the schema backward-compatible** (L268) — the safe revert (L304).
- **Automate the revert** (L304) — in the pipeline (L307).

## 10. Interview Questions

**Q: Walk me through the rollback.**
> A: The instant-revert path (L304). The triggers — the errors (L303), the latency (L333), the cost (L334), the evals (L341) (L304). The revert — the previous version restored (L304). The strategies — the switch (L273), the redeploy (L302), the flag (L300) (L304). And the recovery — the runbook and the postmortem (L304).

**Q: How do you roll back a model?**
> A: The previous model (L148) restored (L304): the canary's (L303) weight to zero (L304) or the blue/green's (L302) traffic back (L273) — the previous model (L148) serving (L304) — with the evals (L341) verifying the recovery (L304). The model's rollback (L304) is the instant path (L304).

**Q: What makes a rollback safe?**
> A: Three things (L304): the design — the strategy (L302) and its rollback (L304) paired (L304); the schema — the backward-compatible migrations (L268) so the revert (L304) is safe (L304); and the rehearsal — the runbook (L304) practiced (L304).

**Q: What's the runbook?**
> A: The rehearsed steps (L304): who decides (L304), what's rolled (L304) — the image (L291) or the model (L148) — and how it's verified (L304) — the metrics (L303) back to the baseline (L303). The runbook (L304) makes the on-call (L274) act, not scramble (L304).

## 11. Follow-Up Questions

- What are the triggers (L304)?
- What's the revert (L304)?
- What are the strategies (L304)?
- What makes a rollback safe (L304)?
- What's the runbook (L304)?

## 12. Comparison Table — The Rollback Strategies

| | The switch (L273) | The redeploy (L302) | The flag (L300) |
|---|---|---|---|
| The mechanism (L304) | the traffic back (L273) | the previous version (L302) | the feature off (L304) |
| The speed (L304) | the instant (L304) | the redeploy's time (L302) | the instant (L304) |
| The pairing (L304) | the blue/green (L302) | the recreate (L302) | the flags (L300) |
| The use (L304) | the users' API (L233) | the internal (L302) | the features (L300) |

The senior read: **the switch and the flag for the instant; the redeploy for the simple** (L304).

## 13. Code Example — The Safety Net, Declared

```js
// The rollback (L304) — the instant-revert path (L304).
// 1 · THE TRIGGERS (L304) — the alarms (L274) on the metrics (L303).
const triggers = {
  errorRate: { threshold: 0.02, window: '5m' },      // the errors (L303)
  ttft:      { threshold: 1.5, unit: 's' },          // the latency (L333)
  costPerCall: { threshold: 0.02, unit: 'usd' },     // the cost (L334)
  evals:     { groundedness: 0.9 },                  // the L341 gates (L341)
};

// 2 · THE REVERT (L304) — the previous version (L304).
const rollback = {
  image: 'ai-service:previous-sha',                  // the previous image (L291)
  model: 'previous-model-id',                        // the previous model (L148)
  switch: 'traffic-back',                            // the blue/green (L302, L273)
  flag: 'new-agent-off',                             // the flag (L300)
};

// 3 · THE RUNBOOK (L304) — the rehearsed steps (L304).
const runbook = {
  decide: 'on-call',                                 // who decides (L274)
  roll: 'image + model',                             // what's rolled (L304)
  verify: 'metrics back to the baseline',            // the verification (L303)
};

// 4 · THE POSTMORTEM (L304) — the why and the prevention (L304).
```

```text
What the reader must SEE — the net, declared:

  errorRate + ttft + cost + evals → the triggers (L303, L333, L341)
  image: previous-sha             → the previous image (L291)
  model: previous-model-id        → the previous model (L148)
  traffic-back + flag-off         → the instant strategies (L273, L300)
  the runbook                     → the rehearsed steps (L304)

  Triggered, reverted, rehearsed — the pipeline's safety net (L304).
```

```narrate
4-8: The triggers — the error rate, the TTFT, the cost, and the evals alarm (L303, L333, L341).
10-15: The revert — the previous image and model, with the traffic switch and the flag (L291, L148, L273).
17-20: The runbook — who decides, what's rolled, and how it's verified (L274, L304).
22: The postmortem — the why and the prevention (L304).
```

> [!TIP]
> The pair that defines the rollback: **the previous version** (the revert, L304) and **the rehearsed runbook** (the calm, L304). **Trigger on the metrics, revert to the previous, rehearse the steps — the pipeline's safety net (L304).**

## 14. Performance Notes

- **The switch is the recovery's speed (L304).** The traffic back (L273) — the seconds (L304) to the baseline (L303).
- **The flag is the feature's speed (L304).** The flag off (L300) — the instant (L304), no redeploy (L304).
- **The runbook is the MTTR's lever (L304).** The rehearsed steps (L304) — the mean time to recover (L304) down (L304).
- **The postmortem is the prevention's cost (L304).** The learnings (L304) — into the tests (L296) and the evals (L341) (L304).

## 15. Debugging Scenarios

| Symptom | First check (L304) | The lever |
|---|---|---|
| The new version misbehaves | The triggers (L304) | The revert (L304) |
| The rollback fails | The schema (L268) | The backward-compatible (L302) |
| The on-call scrambles | The runbook (L304) | The rehearsed steps (L304) |
| The incident repeats | The postmortem (L304) | The tests (L296), the evals (L341) |
| The rollback is slow | The strategy (L304) | The switch (L273), the flag (L300) |

## 16. Quick Revision Notes

- The rollbacks & recovery = **the pipeline's safety net** (L304): the triggers, the revert, the strategies, the recovery.
- The triggers: **the errors (L303), the latency (L333), the cost (L334), the evals (L341)**.
- The revert: **the previous version (L304) — the image (L291), the model (L148)**.
- The strategies: **the switch (L273), the redeploy (L302), the flag (L300)**.
- The recovery: **the runbook (L304) and the postmortem (L304)**.

## 17. Cheat Sheet

```text
ROLLBACKS & RECOVERY = the instant-revert path

THE TRIGGERS (L304)
  the errors (L303) · the latency (L333) · the cost (L334)
  the evals (L341) — the alarms (L274)

THE REVERT (L304)
  the previous image (L291) · the previous model (L148)
  the version restored (L304)

THE STRATEGIES (L304)
  the switch (L273) — the blue/green's traffic back (L302), instant (L304)
  the redeploy (L302) — the recreate's previous version (L302)
  the flag (L300) — the feature off (L304), instant (L304)

THE RECOVERY (L304)
  the runbook (L304) — the rehearsed steps (L304)
  who decides (L274) · what's rolled (L304) · how it's verified (L303)
  the postmortem (L304) — the why and the prevention (L304)

THE DISCIPLINE (L304)
  the rollback designed with the deploy (L302, L304)
  the backward-compatible schema (L268) · the automated revert (L304)

INTERVIEW, 4 MOVES
  1 triggers "the errors, the latency, the cost, the evals (L304)"
  2 revert   "the previous version (L304)"
  3 strategies "the switch, the redeploy, the flag (L304)"
  4 recovery "the runbook and the postmortem (L304)"
```

## 18. Key Takeaways

> [!RECAP]
> - The rollbacks & recovery are **the instant-revert path when the new model or build misbehaves** (L304): the triggers (L304), the revert (L304), the strategies (L304), and the recovery (L304)
> - **The triggers** (L304): the errors spike (L303), the latency regresses (L333), the cost (L334) explodes, the model (L365) degrades (L335) — the alarms (L274)
> - **The revert** (L304): the previous version restored (L304) — the previous image (L291) or the previous model (L148) (L304)
> - **The strategies** (L304): the switch (L273) — the blue/green's (L302) traffic back, the instant (L304); the redeploy (L302) — the recreate's (L302) previous version; the flag (L300) — the feature off (L304)
> - **The recovery** (L304): the runbook (L304) — the rehearsed steps (L304): who decides (L274), what's rolled (L304), how it's verified (L303); and the postmortem (L304) — the why and the prevention (L304)
> - The discipline (L304): the rollback (L304) designed with the deploy (L302), the backward-compatible schema (L268), and the rehearsed runbook (L304) — the pipeline's (L307) safety net (L304)

## Check your understanding

Answer these without looking back.

1. What are the triggers (L304)?
2. What's the revert (L304)?
3. What are the strategies (L304)?
4. What makes a rollback safe (L304)?
5. What's the runbook (L304)?
6. How do you roll back a model (L365)?
7. What's the postmortem (L304)?
8. What is the pipeline's safety net (L304)?

## A Closing Note — The Curtain, Rehearsed

You now hold the safety net: **the triggers, the revert, the strategies, and the recovery — with the runbook rehearsed and the switch ready.** The pipeline has its trust — and the curtain is rehearsed (L304).

Next: the deploy's observability — Observability for AI Deployments (L305).
