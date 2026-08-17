# Lesson 369 — Capacity Planning

**Interview importance:** ⭐⭐⭐⭐⭐ — "throughput, concurrency, and the model's rate limits as capacity" — the answer is *the capacity*: the demand, the supply, and the plan (L369).**

L368 estimated the cost; this lesson is **the resources behind it**: the capacity planning — the throughput, the concurrency, and the model's rate limits as capacity (L369): the demand (the throughput, L369), the supply (the concurrency, L369), and the model's limits (the rate limits, L369). The AI shape (L173): the enterprise (L380) — the capacity (L369) planned (L369). This lesson is the capacity's plan (L369).

The distinction this lesson is built on: a **junior** over-provisions. A **solutions architect** plans the capacity (L369): the demand (L369), the supply (L369), and the model's limits (L369) — because the capacity (L369) is the cost's (L368) and the latency's (L333) balance (L369).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the demand: the throughput (L369)
- Explain the supply: the concurrency (L369)
- Explain the model's limits: the rate limits (L369)
- Explain the plan: the headroom and the autoscaling (L369)
- Explain the AI shape: the capacity's plan (L369)

## 1. One-Line Definition

**The capacity planning is the throughput, the concurrency, and the model's rate limits as capacity (L369) — the demand (the throughput: the requests L358 per second and the tokens L332 per second, L369), the supply (the concurrency: the workers L266 and the instances L295, L369), and the model's limits (the rate limits: the requests per minute L318 and the tokens per minute, L369) — with the plan (the headroom L369 and the autoscaling L271, L369) — the enterprise's (L380) capacity (L369).**

The one-sentence interview answer: *"The capacity planning is the demand vs the supply (L369). The demand (L369): the throughput (L369) — the requests (L358) per second (L369) and the tokens (L332) per second (L369) — the peak (L369): the request rate (L369) × the tokens per request (L332). The supply (L369): the concurrency (L369) — the workers (L266) and the instances (L295) — the throughput per worker (L369) — the concurrency needed (L369): the demand ÷ the per-worker (L369). The model's limits (L369): the rate limits (L318) — the provider's (L152) requests per minute (L369) and the tokens per minute (L369) — the capacity (L369) bounded (L369). The plan (L369): the headroom (L369) — the 20% (L369) for the spikes (L358); and the autoscaling (L271) — the workers (L266) on the queue's (L270) depth (L369). The AI shape (L173): the enterprise (L380) — the capacity (L369): the demand (L369), the supply (L369), and the model's (L152) limits (L369) — the plan (L369) balancing the cost (L368) and the latency (L333)."*

## 2. Mental Model

Think of the capacity planning as **the bridge's lanes.** The bridge (the system, L173) carries the traffic (the demand, L369): the cars per minute (the requests, L358). The lanes (the supply, L369): the toll booths (the workers, L266) — each booth's (L369) throughput (L369). And the city's (the provider's, L152) bridge rules (the rate limits, L369): the cars (L369) and the tolls (the tokens, L332) per minute (L369). The planner (the architect, L369): the lanes needed (L369) — the traffic ÷ the booth (L369) — plus the spare lane (the headroom, L369) for the rush (L358), and the dynamic lanes (the autoscaling, L271) for the surges (L369). The bridge works because the lanes match the traffic, the rules are known, and the spare lane is there (L369).

```text
   the bridge (the capacity, L369)
   ┌────────────────────────────────────────────────────────┐
   │ the traffic (the demand, L369) — the cars (L358)       │
   │ the lanes (the supply, L369) — the booths (L266)       │
   │ the city's rules (the rate limits, L369) · the spare   │
   │ lane (the headroom, L369) · the dynamic (the           │
   │ autoscaling, L271)                                     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the bridge**: the traffic, the lanes, and the rules (L369).

## 3. Visual Flow — The Capacity Math

```text
   THE DEMAND (L369)
   the peak requests/sec (L358) × the tokens/request (L332)
   = the tokens/sec (L369)

   THE SUPPLY (L369)
   the demand ÷ the per-worker throughput (L369)
   = the concurrency (L266)

   THE MODEL'S LIMITS (L369)
   the provider's (L152) requests/min and the tokens/min (L318)
   — the capacity bounded (L369)

   THE PLAN (L369)
   the concurrency × 1.2 (the headroom, L369)
   + the autoscaling (L271) on the queue (L270)
```

The flow is the math: **demand → supply → limits → plan** (L369).

## 4. How It Works — The Plan, Part by Part

- **The demand (L369).** The throughput (L369): the requests (L358) per second and the tokens (L332) per second — the peak (L369).
- **The supply (L369).** The concurrency (L369): the workers (L266) and the instances (L295) — the demand ÷ the per-worker (L369).
- **The model's limits (L369).** The rate limits (L318): the provider's (L152) requests per minute and the tokens per minute (L369).
- **The plan (L369).** The headroom (L369) and the autoscaling (L271): the workers (L266) on the queue's (L270) depth (L369).

> [!NOTE]
> **The model's rate limits are the capacity's ceiling (L369).** The senior answer names the ceiling (L369): the compute (L369) can scale (L271) — the model's (L152) rate limits (L318) — the requests per minute (L369) and the tokens per minute (L369) — cannot (L369): the provisioned throughput (L278) raises the ceiling (L369), the on-demand (L278) has the account's (L369) limit (L369). The capacity (L369) is the min (L369) of the compute's (L369) and the model's (L369) — the ceiling (L369) planned (L369).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The capacity (L369) — the demand, the supply, the limits (L369).
- **A serverless stack (L283).** The concurrency (L266) — the Lambda's (L266) limits (L369).
- **A batch pipeline (L282).** The workers (L266) — the queue's (L270) depth (L369).
- **A model rollout (L365).** The provisioned (L278) — the rate limits (L318) raised (L369).
- **Anything enterprise (L380).** The capacity's plan (L369) — the demand, the supply, the limits (L369).

The through-line: **the plan is the capacity's** — the demand, the supply, and the limits (L369).

## 6. Interview Explanation

Say it in four moves:

1. **The demand.** "The throughput — the requests and the tokens per second (L369)."
2. **The supply.** "The concurrency — the workers and the instances (L369)."
3. **The model's limits.** "The rate limits — the requests and the tokens per minute (L369)."
4. **The plan.** "The headroom (L369) and the autoscaling (L271)."

## 7. Senior-Level Insights

- **The peak is the plan's (L369).** The peak (L369) — the request rate (L358) × the tokens (L332) — the capacity (L369) at the peak (L369), not the average (L369).
- **The concurrency is the demand's (L369).** The demand ÷ the per-worker (L369) — the workers (L266) and the instances (L295) (L369).
- **The rate limit is the ceiling (L369).** The provider's (L152) limits (L318) — the provisioned (L278) raises (L369).
- **The headroom is the spike's (L369).** The 20% (L369) — the traffic's (L358) spikes (L369).
- **The autoscaling is the cost's (L271).** The workers (L266) on the queue (L270) — the capacity (L369) at the demand (L369), the cost (L368) at the use (L369).

## 8. Common Mistakes

- **The average planning (L369).** The average (L369) instead of the peak (L369) — the spike (L358) overwhelms (L369).
- **The compute-only (L369).** The workers (L266) planned (L369), the model's (L152) rate limits (L318) forgotten (L369) — the ceiling (L369) hits (L369).
- **The no-headroom (L369).** The exact concurrency (L369) — the spike (L358) — the headroom (L369) is the 20% (L369).
- **The over-provisioning (L369).** The capacity (L369) at the peak (L369) always (L369) — the cost (L368) — the autoscaling (L271) is the balance (L369).
- **The queue's depth un-watched (L270).** The workers (L266) fixed (L369) — the backlog (L270) — the autoscaling (L271) on the depth (L369).

## 9. Best Practices

- **Plan at the peak** (L369) — the request rate (L358) × the tokens (L332).
- **Compute the concurrency** (L369) — the demand ÷ the per-worker (L369).
- **Check the model's limits** (L369) — the rate limits (L318), the provisioned (L278).
- **Add the headroom** (L369) — the 20% (L369).
- **Autoscale on the queue** (L271) — the depth (L270) drives the workers (L266).

## 10. Interview Questions

**Q: Walk me through the capacity planning.**
> A: The demand vs the supply (L369). The demand — the throughput: the requests and the tokens per second (L369). The supply — the concurrency: the workers and the instances (L369). The model's limits — the rate limits (L369). And the plan — the headroom (L369) and the autoscaling (L271).

**Q: How do you compute the concurrency?**
> A: The demand ÷ the per-worker (L369): the peak requests per second (L358) — the per-worker (L266) throughput (L369) — the workers needed (L369). The tokens (L332) per second (L369) — the worker's (L266) model calls (L278) — the concurrency (L369).

**Q: What's the model's role?**
> A: The ceiling (L369): the provider's (L152) rate limits (L318) — the requests per minute (L369) and the tokens per minute (L369) — the capacity (L369) bounded (L369). The provisioned throughput (L278) raises the ceiling (L369) — the plan (L369) includes it (L369).

**Q: How do you balance the cost?**
> A: The autoscaling (L271): the workers (L266) on the queue's (L270) depth (L369) — the capacity (L369) at the demand (L369), the cost (L368) at the use (L369) — the headroom (L369) as the cushion (L369), not the constant (L369).

## 11. Follow-Up Questions

- What's the demand (L369)?
- How do you compute the concurrency (L369)?
- What's the model's role (L369)?
- How do you balance the cost (L369)?
- What's the headroom (L369)?

## 12. Comparison Table — The Capacity's Lines

| Line (L369) | The measure (L369) | The lever (L369) |
|---|---|---|
| The demand (L369) | the requests (L358) and the tokens (L332) per second | the caching (L171), the routing (L155) |
| The supply (L369) | the concurrency (L266) | the workers (L266), the autoscaling (L271) |
| The model's limits (L369) | the rate limits (L318) | the provisioned (L278) |

The senior read: **each line with its lever** — the capacity balanced (L369).

## 13. Code Example — The Plan, Built

```js
// The capacity planning (L369) — the math (L369).
// 1 · THE DEMAND (L369) — the peak throughput (L369).
const demand = {
  peakRequestsPerSec: 500,                 // the peak (L358, L369)
  tokensPerRequest: 1_200,                 // the tokens (L332)
  tokensPerSec: 500 * 1_200,               // 600k tokens/sec (L369)
};

// 2 · THE SUPPLY (L369) — the concurrency (L369).
const workerThroughput = 10;               // the requests/sec per worker (L266)
const workersNeeded = demand.peakRequestsPerSec / workerThroughput;  // 50 (L369)

// 3 · THE MODEL'S LIMITS (L369) — the ceiling (L369).
const modelLimits = {
  requestsPerMinute: 6_000,                // the rate limit (L318)
  tokensPerMinute: 30_000_000,             // the ceiling (L369)
  provisioned: 2_000,                      // the raised ceiling (L278)
};

// 4 · THE PLAN (L369) — the headroom and the autoscaling (L369).
const plan = {
  workers: workersNeeded * 1.2,            // the 20% headroom (L369)
  autoscaling: {
    metric: 'sqs:ApproximateNumberOfMessages',  // the queue depth (L270)
    min: 50, max: 120,                     // the bounds (L271, L369)
  },
};
```

```text
What the reader must SEE — the plan, built:

  peak rps × tokens/req     → the demand (L369)
  demand ÷ per-worker       → the concurrency (L369)
  the provider's limits     → the ceiling (L318, L369)
  workers × 1.2             → the headroom (L369)
  the queue-depth autoscale → the dynamic (L270, L271)

  The demand, the supply, the limits, the plan (L369).
```

```narrate
4-8: The demand — the peak requests and the tokens per second (L358, L369).
10-11: The supply — the workers needed (L266, L369).
13-18: The model's limits — the rate limits and the provisioned (L318, L278).
20-26: The plan — the headroom and the queue-driven autoscaling (L369, L271).
```

> [!TIP]
> The pair that defines the plan: **the peak token rate** (the demand, L369) and **the queue-driven autoscale** (the supply, L271). **Plan at the peak, compute the concurrency, check the model's ceiling, autoscale on the queue — the capacity's plan (L369).**

## 14. Performance Notes

- **The peak is the plan's (L369).** The demand (L369) at the peak (L358) — the latency (L333) held (L369).
- **The concurrency is the throughput's (L369).** The workers (L266) — the queue (L270) drained (L369).
- **The provisioned is the ceiling's (L278).** The rate limits (L318) raised (L369) — the latency (L333) predictable (L369).
- **The autoscaling is the cost's (L271).** The capacity (L369) at the demand (L369) — the cost (L368) at the use (L369).

## 15. Debugging Scenarios

| Symptom | First check (L369) | The lever |
|---|---|---|
| The spike overwhelms | The demand (L369) | The peak (L358), the headroom (L369) |
| The queue backs up | The supply (L369) | The concurrency (L266), the autoscale (L271) |
| The 429s hit | The model's limits (L369) | The provisioned (L278) |
| The cost is high | The plan (L369) | The autoscaling (L271) |
| The latency spikes | The capacity (L369) | The concurrency (L266) at the peak (L369) |

## 16. Quick Revision Notes

- The capacity planning = **the capacity's plan** (L369): the demand, the supply, the limits, the plan.
- The demand: **the throughput — the requests (L358) and the tokens (L332) per second (L369)**.
- The supply: **the concurrency — the workers (L266) and the instances (L295)**.
- The model's limits: **the rate limits (L318) — the ceiling (L369)**.
- The plan: **the headroom (L369) and the autoscaling (L271)**.

## 17. Cheat Sheet

```text
CAPACITY PLANNING = the throughput, the concurrency, the limits

THE DEMAND (L369)
  the throughput (L369): the requests (L358) per second (L369)
  the tokens (L332) per second (L369) — the peak (L369):
  the request rate (L358) × the tokens per request (L332)

THE SUPPLY (L369)
  the concurrency (L369): the workers (L266), the instances (L295)
  the demand ÷ the per-worker (L369) — the workers needed (L369)

THE MODEL'S LIMITS (L369)
  the rate limits (L318): the requests per minute (L369),
  the tokens per minute (L369) — the ceiling (L369)
  the provisioned (L278) raises the ceiling (L369)

THE PLAN (L369)
  the headroom (L369) — the 20% (L369) for the spikes (L358)
  the autoscaling (L271) — the workers (L266) on the queue's (L270)
  depth (L369) — the capacity at the demand (L369)

INTERVIEW, 4 MOVES
  1 demand  "the requests and the tokens per second (L369)"
  2 supply  "the concurrency — the workers (L369)"
  3 limits  "the model's rate limits (L369)"
  4 plan    "the headroom and the autoscaling (L369)"
```

## 18. Key Takeaways

> [!RECAP]
> - The capacity planning is **the throughput, the concurrency, and the model's rate limits as capacity** (L369): the demand (L369), the supply (L369), the model's limits (L369), and the plan (L369)
> - **The demand** (L369): the throughput (L369) — the requests (L358) per second and the tokens (L332) per second — at the peak (L369)
> - **The supply** (L369): the concurrency (L369) — the workers (L266) and the instances (L295) — the demand ÷ the per-worker (L369)
> - **The model's limits** (L369): the rate limits (L318) — the requests per minute and the tokens per minute — the ceiling (L369), raised by the provisioned (L278)
> - **The plan** (L369): the headroom (L369) — the 20% (L369); and the autoscaling (L271) — the workers (L266) on the queue's (L270) depth (L369)
> - The AI shape (L369): the enterprise (L380) — the capacity (L369): the demand (L369), the supply (L369), and the model's (L152) limits (L369) — the plan (L369) balancing the cost (L368) and the latency (L333)

## Check your understanding

Answer these without looking back.

1. What's the demand (L369)?
2. How do you compute the concurrency (L369)?
3. What's the model's role (L369)?
4. How do you balance the cost (L369)?
5. What's the headroom (L369)?
6. What's the ceiling (L369)?
7. What's the autoscaling (L271)?
8. What is the capacity's plan (L369)?

## A Closing Note — The Lanes, Counted

You now hold the plan: **the demand, the supply, the limits, and the plan — with the traffic counted and the spare lane ready.** The bridge's lanes match the traffic — and the dynamic lanes appear at the rush (L369).

Next: the growth path from the pilot to the enterprise without a rewrite — Scalability Planning (L370).
