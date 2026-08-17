# Lesson 302 — Deployment Strategies

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you ship the new version?" — the answer is *the strategies*: recreate, rolling, blue/green — and what an AI service needs (L302).**

L296 ran the conveyor and L295 the runtime; this lesson is **the ways the new version ships**: the deployment strategies — the recreate (the stop and the start, L302), the rolling (the gradual replacement, L302), and the blue/green (the parallel environments and the switch, L302) — and what an AI service (L173) needs (L302). The AI shape: the model update (L365) and the code update (L296) shipped with the strategy (L302) — the rollback (L304) as the safety (L302). This lesson is the deploy's moves (L302).

The distinction this lesson is built on: a **demo** overwrites. A **solutions architect** picks the strategy (L302): the recreate (L302), the rolling (L302), or the blue/green (L302) — by the downtime and the rollback the service needs (L302).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the recreate: the stop and the start (L302)
- Explain the rolling: the gradual replacement (L302)
- Explain the blue/green: the switch (L302)
- Explain the selection: by the downtime and the rollback (L302)
- Explain the AI shape: what an AI service needs (L302)

## 1. One-Line Definition

**The deployment strategies are the ways the new version ships (L302) — the recreate (the old stopped, the new started: the downtime, the simple, L302), the rolling (the gradual replacement: the instances updated in batches, no downtime, L302), and the blue/green (the parallel environments: the green deployed, the traffic switched, the instant rollback, L302) — the selection (L302) by the downtime and the rollback the service needs (L302).**

The one-sentence interview answer: *"The deployment strategies are the ways the new version ships (L302). The recreate (L302): the old version stopped, the new started (L302) — the simplest (L302), the downtime (L302), the rollback (L304) is the redeploy of the old (L302). The rolling (L302): the instances updated in batches (L302) — the new and the old coexist (L302), no downtime (L302), the health checks (L295) gate each batch (L302), and the rollback (L304) rolls the batches back (L302). The blue/green (L302): the two parallel environments (L302) — the blue (the current, L302) and the green (the new, L302) — the green deployed and tested (L302), and the traffic (L273) switched (L302) — the instant rollback (L304): the switch back (L302). The selection (L302): by the downtime the service can take (L302) and the rollback it needs (L302) — the internal tool (L302) on the recreate (L302), the API (L233) on the rolling (L302) or the blue/green (L302). The AI shape (L173): the model update (L365) — the canary (L303) or the blue/green (L302) with the evals (L341) gating — and the code update (L296) — the rolling (L302) on the ECS (L295) with the health checks (L295) and the rollback (L304). The demo overwrites; the architect switches (L302)."*

## 2. Mental Model

Think of the deployment strategies as **the ways a store changes its menu.** The recreate (L302): the store closes (the downtime, L302), the old menu removed (L302), the new menu posted (L302), the store reopens (L302) — simple, with the closed sign (L302). The rolling (L302): the store's counters (the instances, L302) switch one at a time (L302) — the line keeps moving (no downtime, L302), each counter's new menu checked (the health, L295) before the next (L302). The blue/green (L302): the store opens a second location (the green, L302) with the new menu (L302) — the customers (the traffic, L273) walk to the new door (the switch, L302) — and if the new menu flops (L302), they walk back (the instant rollback, L304). The store picks the way by the crowd (the downtime, L302) and the flop-risk (the rollback, L302).

```text
   the menu change (the deployment, L302)
   ┌────────────────────────────────────────────────────────┐
   │ the recreate (L302) — the closed sign (the downtime)   │
   │ the rolling (L302) — the counters one at a time (L302) │
   │ the blue/green (L302) — the second location, the       │
   │ switch (L302)                                          │
   │ the pick (L302) — the downtime and the rollback (L302) │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the menu change**: the closed sign, the counters, and the second location (L302).

## 3. Visual Flow — The Three Strategies

```text
   THE RECREATE (L302)          THE ROLLING (L302)
   old ── stop ──► new          [old][old][old]
   the downtime (L302)          [new][old][old] → the batches (L302)
                                [new][new][old] → the health gates (L295)
                                [new][new][new] → no downtime (L302)

   THE BLUE/GREEN (L302)
   the blue (the current, L302)  the green (the new, L302)
   the green deployed + tested (L302) → the traffic switched (L273)
   the rollback (L304): the switch back (L302) — instant (L302)
```

The flow is the three moves: **recreate → rolling → blue/green** (L302).

## 4. How It Works — The Moves, Part by Part

- **The recreate (L302).** The old stopped, the new started (L302): the simplest (L302), the downtime (L302), the rollback (L304) is the redeploy (L302).
- **The rolling (L302).** The instances updated in batches (L302): the new and the old coexist (L302), no downtime (L302), the health checks (L295) gate each batch (L302).
- **The blue/green (L302).** The two parallel environments (L302): the green deployed and tested (L302), the traffic (L273) switched (L302), the instant rollback (L304) — the switch back (L302).
- **The selection (L302).** By the downtime and the rollback (L302): the internal tool (L302) on the recreate (L302), the API (L233) on the rolling (L302) or the blue/green (L302).

> [!NOTE]
> **The strategy is the rollback's shape (L302).** The senior answer picks the strategy (L302) by the rollback (L302) it enables (L302): the recreate's (L302) rollback is the redeploy (L304) — the downtime twice (L302); the rolling's (L302) is the batch rollback (L304) — the gradual (L302); the blue/green's (L302) is the switch (L304) — the instant (L302). The AI service (L173) — the users' API (L233) — wants the instant rollback (L304): the blue/green (L302) or the canary (L303) (L302).

## 5. Real Project Usage

- **An AI API (L233).** The rolling (L302) on the ECS (L295) — the batches (L302) with the health checks (L295).
- **A model update (L365).** The blue/green (L302) — the new model (L148) in the green (L302), the evals (L341) gating, the traffic (L273) switched (L302).
- **An internal tool (L302).** The recreate (L302) — the downtime (L302) acceptable (L302).
- **A webhook consumer (L220).** The rolling (L302) — the SQS (L270) consumer (L249) draining (L302) before the batch (L302).
- **Anything shipped (L307).** The L307 pipeline (L307) deploys with the strategy (L302) — the L302 move (L302) as the last mile (L307).

The through-line: **the strategy is the deploy's move** — the recreate, the rolling, or the blue/green (L302).

## 6. Interview Explanation

Say it in four moves:

1. **The recreate.** "The stop and the start — the downtime (L302)."
2. **The rolling.** "The batches — the gradual replacement, no downtime (L302)."
3. **The blue/green.** "The parallel environments and the switch (L302)."
4. **The pick.** "By the downtime and the rollback (L302)."

## 7. Senior-Level Insights

- **The rollback is the strategy's shape (L302).** The senior answer picks the strategy (L302) by the rollback (L304): the recreate's redeploy (L302), the rolling's batches (L302), the blue/green's switch (L304).
- **The blue/green is the instant rollback (L302).** The switch back (L304) — the seconds (L302), not the redeploy (L302).
- **The rolling is the zero-downtime default (L302).** The batches (L302) with the health gates (L295) — the API (L233) stays up (L302).
- **The model is the risk (L365).** The model update (L365) — the evals (L341) and the canary (L303) — the AI's change (L365) gated like the code's (L296).
- **The state is the constraint (L302).** The database schema (L268) — the strategy (L302) must handle the migrations (L268) — the blue/green (L302) with the compatible schema (L302).

## 8. Common Mistakes

- **The overwrite (L302).** The new version over the old (L302) — the rollback (L304) impossible (L302).
- **The recreate for the users (L302).** The downtime (L302) on the API (L233) — the rolling (L302) or the blue/green (L302) is the users' (L302).
- **The blue/green with the schema break (L302).** The incompatible migration (L268) — the green (L302) can't serve (L302); the backward-compatible schema (L268) is the fix (L302).
- **The health gate missing (L302).** The batch (L302) without the check (L295) — the broken version (L302) rolls on (L302).
- **The strategy for everything (L302).** The one move (L302) for every service (L302) — the pick (L302) is per service (L302).

## 9. Best Practices

- **Pick by the downtime and the rollback** (L302) — per service (L302).
- **Gate the batches** (L302) — the health checks (L295).
- **Blue/green for the users' API** (L302) — the instant rollback (L304).
- **Handle the schema** (L302) — the backward-compatible migrations (L268).
- **Rehearse the rollback** (L304) — the strategy's shape (L302).

## 10. Interview Questions

**Q: Walk me through the deployment strategies.**
> A: The three moves (L302). The recreate — the old stopped, the new started, the downtime (L302). The rolling — the batches, the gradual replacement, no downtime (L302). The blue/green — the parallel environments, the traffic switch (L302). The pick — by the downtime and the rollback (L302).

**Q: How do you pick the strategy?**
> A: By two axes (L302): the downtime the service can take (L302) and the rollback it needs (L304). The internal tool (L302) — the recreate (L302). The users' API (L233) — the rolling (L302) or the blue/green (L302) — the instant rollback (L304).

**Q: What's the blue/green?**
> A: The two parallel environments (L302): the blue — the current (L302); the green — the new (L302). The green is deployed and tested (L302), then the traffic (L273) switches (L302). The rollback (L304): the switch back (L302) — the instant (L302).

**Q: How do you deploy a model update?**
> A: As the riskiest change (L365): the new model (L148) in the green (L302) or the canary (L303), the evals (L341) gating, and the traffic (L273) switched gradually (L303) — with the instant rollback (L304) to the previous model (L302).

## 11. Follow-Up Questions

- What's the recreate (L302)?
- What's the rolling (L302)?
- What's the blue/green (L302)?
- How do you pick (L302)?
- How do you deploy a model (L365)?

## 12. Comparison Table — The Strategies

| | The recreate (L302) | The rolling (L302) | The blue/green (L302) |
|---|---|---|---|
| The downtime (L302) | yes (L302) | none (L302) | none (L302) |
| The rollback (L304) | the redeploy (L302) | the batches (L302) | the switch (L304) |
| The cost (L285) | the lowest (L302) | the moderate (L302) | the double (L302) |
| The use (L302) | the internal (L302) | the API (L233) | the users' API (L233), the model (L365) |

The senior read: **the right columns for the users** — the zero downtime and the instant rollback (L302).

## 13. Code Example — The Strategies, Declared

```js
// The deployment strategies (L302) — the ECS deployments (L295).
// THE RECREATE (L302) — the stop and the start (L302).
const recreate = {
  type: 'recreate',                          // the downtime (L302)
  // for the internal tools (L302)
};

// THE ROLLING (L302) — the batches with the health gates (L302).
const rolling = {
  type: 'rolling',
  minHealthyPercent: 50,                     // the batch size (L302)
  maxPercent: 200,                           // the old + the new (L302)
  healthCheck: '/health',                    // the gate (L295, L302)
};

// THE BLUE/GREEN (L302) — the parallel environments and the switch (L302).
const blueGreen = {
  type: 'blue-green',
  environments: { blue: 'current', green: 'new' },   // the two (L302)
  switch: 'traffic',                        // the Route 53 switch (L273, L302)
  rollback: 'switch-back',                  // the instant (L304)
};

// THE PICK (L302) — by the downtime and the rollback (L302):
//   the internal tool → the recreate (L302)
//   the API (L233) → the rolling (L302) or the blue/green (L302)
//   the model update (L365) → the blue/green (L302) + the evals (L341)
```

```text
What the reader must SEE — the moves, declared:

  recreate + downtime       → the internal tool (L302)
  rolling + minHealthy 50   → the batches (L302)
  blue/green + switch       → the parallel environments (L302)
  switch-back               → the instant rollback (L304)
  the model update + evals  → the gated rollout (L365, L341)

  The pick by the downtime and the rollback (L302).
```

```narrate
3-6: The recreate — the stop and the start, for the internal tools (L302).
8-13: The rolling — the batches with the health gates, no downtime (L302, L295).
15-20: The blue/green — the two environments and the traffic switch (L302, L273).
22-25: The pick — the strategy by the downtime and the rollback, with the model update gated by the evals (L302, L341).
```

> [!TIP]
> The pair that defines the strategies: **the batch health gate** (the rolling's safety, L295) and **the traffic switch** (the blue/green's rollback, L273). **Pick by the downtime, gate the batches, switch for the rollback — the deploy's moves (L302).**

## 14. Performance Notes

- **The recreate is the simplest and the slowest (L302).** The downtime (L302) — the internal tools' (L302).
- **The rolling is the zero-downtime (L302).** The batches (L302) — the capacity (L302) held by the min healthy (L302).
- **The blue/green is the double cost (L285).** The two environments (L302) — the capacity (L285) doubled during the switch (L302).
- **The switch is the rollback's speed (L304).** The traffic (L273) switched (L302) — the seconds (L302) to the previous version (L304).

## 15. Debugging Scenarios

| Symptom | First check (L302) | The lever |
|---|---|---|
| The deploy has downtime | The strategy (L302) | The rolling (L302) or the blue/green (L302) |
| The broken batch rolls on | The health gate (L295) | The `/health` check (L295) |
| The rollback is slow | The strategy (L302) | The blue/green's switch (L304) |
| The green can't serve | The schema (L268) | The backward-compatible migration (L268) |
| The model regresses | The evals (L341) | The eval gate (L341) |

## 16. Quick Revision Notes

- The deployment strategies = **the deploy's moves** (L302): the recreate, the rolling, the blue/green.
- The recreate: **the stop and the start — the downtime** (L302).
- The rolling: **the batches — the gradual replacement, no downtime** (L302).
- The blue/green: **the parallel environments and the switch** (L302).
- The pick: **by the downtime and the rollback** (L302).

## 17. Cheat Sheet

```text
DEPLOYMENT STRATEGIES = the ways the new version ships

THE RECREATE (L302)
  the old stopped, the new started (L302)
  the simplest (L302) · the downtime (L302)
  the rollback: the redeploy (L304)

THE ROLLING (L302)
  the instances in batches (L302)
  the new and the old coexist (L302) · no downtime (L302)
  the health gates (L295) · the rollback: the batches (L304)

THE BLUE/GREEN (L302)
  the blue (the current) + the green (the new) (L302)
  the green deployed + tested (L302) · the traffic switched (L273)
  the rollback: the switch back (L304) — instant (L302)

THE PICK (L302)
  by the downtime (L302) and the rollback (L304)
  the internal → the recreate (L302) · the API → the rolling (L302)
  or the blue/green (L302) · the model (L365) → the gated blue/green (L302)

INTERVIEW, 4 MOVES
  1 recreate "the stop and the start (L302)"
  2 rolling  "the batches, no downtime (L302)"
  3 blue/green "the parallel environments, the switch (L302)"
  4 pick     "by the downtime and the rollback (L302)"
```

## 18. Key Takeaways

> [!RECAP]
> - The deployment strategies are **the ways the new version ships** (L302): the recreate (L302), the rolling (L302), and the blue/green (L302)
> - **The recreate** (L302): the old stopped, the new started (L302) — the simplest (L302), with the downtime (L302)
> - **The rolling** (L302): the instances updated in batches (L302) — the new and the old coexist (L302), no downtime (L302), the health checks (L295) gating each batch (L302)
> - **The blue/green** (L302): the two parallel environments (L302) — the green deployed and tested (L302), the traffic (L273) switched (L302), and the instant rollback (L304) — the switch back (L302)
> - **The pick** (L302): by the downtime the service can take (L302) and the rollback it needs (L304) — the internal tool (L302) on the recreate (L302), the users' API (L233) on the rolling (L302) or the blue/green (L302)
> - The AI shape (L302): the model update (L365) — the canary (L303) or the blue/green (L302) with the evals (L341) gating — and the code update (L296) — the rolling (L302) on the ECS (L295) with the health checks (L295) and the rollback (L304) (L302)

## Check your understanding

Answer these without looking back.

1. What's the recreate (L302)?
2. What's the rolling (L302)?
3. What's the blue/green (L302)?
4. How do you pick (L302)?
5. How do you deploy a model (L365)?
6. What's the rollback's shape (L304)?
7. What's the schema's constraint (L268)?
8. What are the deploy's moves (L302)?

## A Closing Note — The Menu, Switched

You now hold the moves: **the recreate, the rolling, and the blue/green — with the pick by the downtime and the rollback.** The new version has its ways — and the menu is switched (L302).

Next: the 5% gate — Canary Deployments (L303).
