# Lesson 332 — Token Usage Tracking

**Interview importance:** ⭐⭐⭐⭐⭐ — "per-user, per-feature, per-day — the metering your pricing needs" — the answer is *the metering*: the token counters and the attribution (L332).**

L149 built the token budgeting (L149) and L334 will track the cost; this lesson is **the metering**: the token usage tracking — per-user, per-feature, per-day — the metering your pricing needs (L332): the counters (the tokens per call, L332), the dimensions (the user, the feature, the tenant, L332), and the aggregation (the per-day, per-month, L332). The AI shape (L173): the usage (L332) — the pricing's (L332) and the cost's (L334) input (L332). This lesson is the metering's layer (L332).

The distinction this lesson is built on: a **demo** ignores the usage. A **solutions architect** meters (L332): the counters (L332), the dimensions (L332), and the aggregation (L332) — because the pricing (L332) and the budget (L149) run on the numbers (L332).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the counters: the tokens per call (L332)
- Explain the dimensions: the user, the feature, the tenant (L332)
- Explain the aggregation: the per-day, per-month (L332)
- Explain the pricing: the metering's use (L332)
- Explain the AI shape: the usage's record (L332)

## 1. One-Line Definition

**The token usage tracking is the metering your pricing needs (L332) — the counters (the tokens per call: the input L332, the output L332, the total L332), the dimensions (the user L319, the feature L332, the tenant L320, the model L148), and the aggregation (the per-day and the per-month L332: the sums and the rates, L332) — the pricing's (L332) and the cost's (L334) input (L332).**

The one-sentence interview answer: *"The token usage tracking is the metering (L332). The counters (L332): the tokens per call (L332) — the input tokens (L332), the output tokens (L332), and the total (L332) — from the usage object (L332) the provider returns (L152). The dimensions (L332): the user (L319) — who used it (L332); the feature (L332) — which feature (L332); the tenant (L320) — which customer (L332); and the model (L148) — which model (L332). The aggregation (L332): the per-day and the per-month (L332) — the sums (L332), the rates (L331), and the trends (L332) — the per-user totals (L332), the per-feature totals (L332), the per-tenant totals (L332). The pricing (L332): the metering (L332) is the pricing's (L332) input — the per-token plans (L332), the tiered plans (L332), the overage (L332) — the bill (L334) derived from the usage (L332). The AI shape (L173): the usage (L332) recorded per call (L328) — the counters (L332), the dimensions (L332), and the aggregation (L332) — the metering (L332) the pricing (L332) and the budget (L149) run on (L332)."*

## 2. Mental Model

Think of the token tracking as **the restaurant's ingredient ledger.** The ledger (the metering, L332) records every dish's ingredients (the tokens, L332): the base (the input, L332), the garnish (the output, L332), and the total (L332). The ledger's columns (the dimensions, L332): the diner (the user, L319), the menu section (the feature, L332), the table's party (the tenant, L320), and the chef (the model, L148). The manager (the aggregator, L332) sums the columns (L332): the diner's daily total (L332), the section's monthly total (L332), the party's total (L332) — the trends (L332). And the pricing (L332): the menu's plans (L332) — the per-diner (L332) and the per-party (L332) — billed from the ledger (L332). The restaurant works because every ingredient is counted, and the columns are attributed (L332).

```text
   the ledger (the metering, L332)
   ┌────────────────────────────────────────────────────────┐
   │ the ingredients (the tokens, L332) — the input, the    │
   │ output, the total (L332)                               │
   │ the columns (the dimensions, L332) — the user (L319),  │
   │ the feature (L332), the tenant (L320), the model (L148)│
   │ the sums (the aggregation, L332) · the pricing (L332)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the ledger**: the ingredients, the columns, and the sums (L332).

## 3. Visual Flow — One Metered Call

```text
   the call (L328)
        │  the usage (L332)
        ▼
   ┌────────────────────── THE COUNTERS (L332) ─────────────────────────┐
   │  inputTokens: 120 (L332) · outputTokens: 340 (L332)               │
   │  totalTokens: 460 (L332)                                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DIMENSIONS (L332) ───────────────────────┐
   │  userId · featureId · tenantId · modelId (L332)                   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE AGGREGATION (L332) ──────────────────────┐
   │  the per-day: user X used 12k (L332)                              │
   │  the per-month: tenant Y used 1.2M (L332) · the trends (L332)     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE PRICING (L332) ──────────────────────────┐
   │  the plan's allowance (L332) · the overage (L332) → the bill      │
   │  (L334)                                                           │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the metering: **counters → dimensions → aggregation → pricing** (L332).

## 4. How It Works — The Meter, Part by Part

- **The counters (L332).** The tokens per call (L332): the input (L332), the output (L332), the total (L332) — from the usage (L332).
- **The dimensions (L332).** The attribution (L332): the user (L319), the feature (L332), the tenant (L320), the model (L148).
- **The aggregation (L332).** The per-day and the per-month (L332): the sums (L332), the rates (L331), and the trends (L332).
- **The pricing (L332).** The metering's use (L332): the per-token plans (L332), the tiered (L332), the overage (L332) — the bill (L334) derived from the usage (L332).

> [!NOTE]
> **The metering is the pricing's and the budget's input (L332).** The senior answer names the two consumers (L332): the pricing (L332) — the bill (L334) derived from the usage (L332): the plan's allowance (L332), the overage (L332); and the budget (L149) — the per-tenant quota (L149) enforced against the usage (L332): the token cap (L149), the 429 (L318). The metering (L332) is recorded once (L328) and read by the pricing (L332) and the budget (L149).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The metering (L332) — the per-tenant (L320) usage (L332) for the billing (L334).
- **A chat product (L162).** The per-user (L319) tokens (L332) — the plan's allowance (L332).
- **A RAG platform (L280).** The per-query (L189) tokens (L332) — the feature's (L332) cost (L334).
- **A multi-tenant SaaS (L357).** The per-tenant (L320) quota (L149) enforced against the metering (L332).
- **Anything AI (L328).** The metering's layer (L332) — the counters, the dimensions, the aggregation (L332).

The through-line: **the meter is the usage's record** — the counters, the dimensions, and the pricing (L332).

## 6. Interview Explanation

Say it in four moves:

1. **The counters.** "The input, the output, the total (L332)."
2. **The dimensions.** "The user (L319), the feature (L332), the tenant (L320), the model (L148)."
3. **The aggregation.** "The per-day, the per-month (L332)."
4. **The pricing.** "The plans and the overage, from the usage (L332)."

## 7. Senior-Level Insights

- **The usage object is the source (L332).** The provider's usage (L152) — the input, the output, the total (L332) — recorded per call (L328).
- **The dimensions are the attribution (L332).** The user (L319), the feature (L332), the tenant (L320) — the L334 cost (L334) and the L149 budget (L149) attributed (L332).
- **The aggregation is the trend (L332).** The per-day (L332) and the per-month (L332) — the growth (L332) and the anomalies (L317) seen (L332).
- **The pricing is the metering's use (L332).** The per-token (L332) and the tiered (L332) — the bill (L334) from the usage (L332).
- **The quota is the metering's enforcement (L149).** The per-tenant cap (L149) — the 429 (L318) against the usage (L332).

## 8. Common Mistakes

- **The total only (L332).** The input and the output (L332) unrecorded (L332) — the cost (L334) differs by the type (L152).
- **The un-dimensioned usage (L332).** The totals (L332) without the user (L319) and the tenant (L320) — the pricing (L332) and the budget (L149) impossible (L332).
- **The un-aggregated (L332).** The per-call (L332) without the per-day (L332) — the trends (L332) invisible (L332).
- **The pricing decoupled (L332).** The bill (L334) guessed (L332) — the metering (L332) is the pricing's (L332) input (L332).
- **The quota unmetered (L149).** The cap (L149) without the usage (L332) — the enforcement (L318) blind (L332).

## 9. Best Practices

- **Record the usage per call** (L332) — the input, the output, the total (L332).
- **Dimension the usage** (L332) — the user (L319), the feature (L332), the tenant (L320), the model (L148).
- **Aggregate the trends** (L332) — the per-day, the per-month (L332).
- **Derive the pricing** (L332) — the plans and the overage (L332).
- **Enforce the quota** (L149) — against the metering (L332).

## 10. Interview Questions

**Q: Walk me through the token usage tracking.**
> A: The metering (L332). The counters — the input, the output, the total (L332). The dimensions — the user (L319), the feature (L332), the tenant (L320), the model (L148). The aggregation — the per-day and the per-month (L332). And the pricing — the plans and the overage, from the usage (L332).

**Q: What do you record per call?**
> A: The usage (L332): the input tokens (L332), the output tokens (L332), and the total (L332) — from the provider's usage object (L152). Plus the dimensions (L332): the user (L319), the feature (L332), the tenant (L320), and the model (L148) — the attribution (L332) for the pricing (L332) and the budget (L149).

**Q: How does the pricing use it?**
> A: The metering is the pricing's input (L332): the plan's allowance (L332) — the included tokens (L332); the overage (L332) — the usage beyond (L332); and the tier (L332) — the volume discounts (L332). The bill (L334) is derived from the usage (L332), never guessed (L332).

**Q: How does the quota use it?**
> A: The enforcement (L149): the per-tenant cap (L149) — the tenant's (L320) usage (L332) aggregated (L332) and compared (L149); the exhausted quota (L149) → the 429 (L318). The metering (L332) is recorded once (L328) and read by the pricing (L332) and the budget (L149).

## 11. Follow-Up Questions

- What are the counters (L332)?
- What are the dimensions (L332)?
- How does the pricing use it (L332)?
- How does the quota use it (L149)?
- What's the aggregation (L332)?

## 12. Comparison Table — The Metered vs the Unmetered

| | The unmetered (L332) | The metered (L332) |
|---|---|---|
| The usage (L332) | unknown (L332) | the per-call (L332) |
| The attribution (L332) | none (L332) | the user, the feature, the tenant (L332) |
| The pricing (L332) | the guess (L332) | the derived bill (L334) |
| The quota (L149) | the blind (L149) | the enforced (L318) |
| The trend (L332) | invisible (L332) | the per-day, the per-month (L332) |

The senior read: **the right column is the pricing's and the budget's foundation** (L332).

## 13. Code Example — The Meter, Applied

```js
// The token metering (L332) — the usage recorded (L332).
// 1 · THE USAGE (L332) — from the provider (L152).
async function meteredCall(req) {
  const response = await model.invoke(req.prompt);
  const { input_tokens, output_tokens, total_tokens } = response.usage;  // L332

  // 2 · THE RECORD (L332) — the counters + the dimensions (L332).
  const usage = {
    at: new Date().toISOString(),
    userId: req.userId,                    // the user (L319)
    featureId: req.feature,                // the feature (L332)
    tenantId: req.tenantId,                // the tenant (L320)
    modelId: req.model,                    // the model (L148)
    inputTokens: input_tokens,             // L332
    outputTokens: output_tokens,           // L332
    totalTokens: total_tokens,             // L332
  };
  await usageStore.write(usage);           // the metering (L332)

  // 3 · THE AGGREGATION (L332) — the per-day, the per-month (L332).
  await usageStore.incrementDaily(usage);  // the sums (L332)

  // 4 · THE QUOTA (L149) — the enforcement (L149).
  const used = await usageStore.tenantMonth(usage.tenantId);
  if (used > QUOTA_MONTHLY) return error(429);   // L149, L318

  return response;
}

// 5 · THE PRICING (L332): the bill (L334) from the metered usage (L332).
```

```text
What the reader must SEE — the meter, applied:

  input_tokens + output_tokens → the counters (L332)
  userId + featureId + tenantId + modelId → the dimensions (L332)
  usageStore.write            → the record (L332)
  incrementDaily              → the aggregation (L332)
  QUOTA_MONTHLY → 429         → the enforcement (L149, L318)

  The usage counted, dimensioned, aggregated, and enforced (L332).
```

```narrate
4-6: The usage — the provider's token counts (L152, L332).
8-19: The record — the counters with the user, the feature, the tenant, and the model dimensions (L332).
21-22: The aggregation — the daily sums (L332).
24-27: The quota — the tenant's monthly usage enforced (L149, L318).
29: The pricing — the bill derived from the metered usage (L332, L334).
```

> [!TIP]
> The pair that defines the metering: **the per-call usage record** (the counters, L332) and **the per-tenant monthly sum** (the attribution, L320). **Count the tokens, dimension the usage, aggregate the trends, enforce the quota — the metering your pricing needs (L332).**

## 14. Performance Notes

- **The write is the request's latency (L332).** The usage record (L332) — the async (L222) write (L332) — the request path (L151) unblocked (L332).
- **The aggregation is the batch's cost (L332).** The daily sums (L332) — the batched (L332) computation (L332).
- **The storage is the usage's cost (L332).** The records (L332) — the retention (L322) bounded (L332).
- **The quota is the bill's bound (L149).** The cap (L149) — the cost (L334) bounded (L332).

## 15. Debugging Scenarios

| Symptom | First check (L332) | The lever |
|---|---|---|
| The bill is wrong | The metering (L332) | The counters (L332) |
| The usage is unattributed | The dimensions (L332) | The tenant (L320), the user (L319) |
| The trends are invisible | The aggregation (L332) | The per-day, the per-month (L332) |
| The quota isn't enforced | The metering (L149) | The usage vs the cap (L149) |
| The spikes are unexplained | The dimensions (L332) | The feature (L332), the model (L148) |

## 16. Quick Revision Notes

- The token usage tracking = **the metering** (L332): the counters, the dimensions, the aggregation, the pricing.
- The counters: **the input, the output, the total (L332)**.
- The dimensions: **the user (L319), the feature (L332), the tenant (L320), the model (L148)**.
- The aggregation: **the per-day, the per-month (L332)**.
- The pricing: **the plans and the overage, from the usage (L332)**.

## 17. Cheat Sheet

```text
TOKEN USAGE TRACKING = the metering your pricing needs

THE COUNTERS (L332)
  the input tokens (L332) · the output tokens (L332)
  the total (L332) — from the usage (L152)

THE DIMENSIONS (L332)
  the user (L319) — who used it (L332)
  the feature (L332) — which feature (L332)
  the tenant (L320) — which customer (L332)
  the model (L148) — which model (L332)

THE AGGREGATION (L332)
  the per-day (L332) · the per-month (L332)
  the sums (L332), the rates (L331), the trends (L332)

THE PRICING (L332)
  the per-token plans (L332) · the tiered (L332)
  the overage (L332) · the bill (L334) from the usage (L332)

THE QUOTA (L149)
  the per-tenant cap (L149) — the 429 (L318)
  the enforcement against the metering (L332)

INTERVIEW, 4 MOVES
  1 counters  "the input, the output, the total (L332)"
  2 dimensions "the user, the feature, the tenant, the model (L332)"
  3 aggregation "the per-day, the per-month (L332)"
  4 pricing   "the plans and the overage (L332)"
```

## 18. Key Takeaways

> [!RECAP]
> - The token usage tracking is **the metering your pricing needs** (L332): the counters (L332), the dimensions (L332), the aggregation (L332), and the pricing (L332)
> - **The counters** (L332): the tokens per call (L332) — the input (L332), the output (L332), and the total (L332) — from the provider's usage object (L152)
> - **The dimensions** (L332): the user (L319), the feature (L332), the tenant (L320), and the model (L148) — the attribution (L332)
> - **The aggregation** (L332): the per-day and the per-month (L332) — the sums (L332), the rates (L331), and the trends (L332)
> - **The pricing** (L332): the metering (L332) is the pricing's (L332) input — the per-token plans (L332), the tiered (L332), the overage (L332) — the bill (L334) derived from the usage (L332)
> - **The quota** (L149): the per-tenant cap (L149) enforced against the metering (L332) — the 429 (L318) — the metering (L332) recorded once (L328) and read by the pricing (L332) and the budget (L149)

## Check your understanding

Answer these without looking back.

1. What are the counters (L332)?
2. What are the dimensions (L332)?
3. How does the pricing use it (L332)?
4. How does the quota use it (L149)?
5. What's the aggregation (L332)?
6. What's the usage object (L152)?
7. What's the overage (L332)?
8. What is the metering (L332)?

## A Closing Note — The Ledger, Filled

You now hold the meter: **the counters, the dimensions, the aggregation, and the pricing — with every ingredient counted and every column attributed.** The restaurant's ledger is filled — and the bills derive from it (L332).

Next: the time-to-first-token as the product metric it is — Latency & TTFT Monitoring (L333).
