# Lesson 334 — Cost Tracking

**Interview importance:** ⭐⭐⭐⭐⭐ — "attributing model spend to features, tenants, and users" — the answer is *the cost attribution*: the spend's dimensions and the budget (L334).**

L150 built the cost discipline (L150) and L332 the metering (L332); this lesson is **the spend's attribution**: the cost tracking — attributing the model spend to the features, the tenants, and the users (L334): the calculation (the tokens × the price, L334), the dimensions (the feature, the tenant, the user, L334), and the budget (the caps and the alerts, L334). The AI shape (L173): the usage (L332) — the cost (L334) derived and attributed (L334). This lesson is the spend's record (L334).

The distinction this lesson is built on: a **demo** sees one bill. A **solutions architect** attributes (L334): the calculation (L334), the dimensions (L334), and the budget (L334) — because the pricing (L332) and the profit (L334) run on the attribution (L334).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the calculation: the tokens × the price (L334)
- Explain the dimensions: the feature, the tenant, the user (L334)
- Explain the budget: the caps and the alerts (L334)
- Explain the analysis: the unit economics (L334)
- Explain the AI shape: the spend's attribution (L334)

## 1. One-Line Definition

**The cost tracking attributes the model spend to the features, the tenants, and the users (L334) — the calculation (the tokens L332 × the price L150: the input's and the output's prices differ L152, L334), the dimensions (the feature L332, the tenant L320, the user L319, the model L148), and the budget (the caps L149 and the alerts L274, L334) — the usage (L332), costed (L334).**

The one-sentence interview answer: *"The cost tracking attributes the spend (L334). The calculation (L334): the cost per call (L334) — the tokens (L332) × the price (L150) — the input's and the output's prices (L152) differ (L334): the input tokens × the input price (L334), the output tokens × the output price (L334). The dimensions (L334): the feature (L332) — which feature spends (L334); the tenant (L320) — which customer spends (L334); the user (L319) — which user spends (L334); and the model (L148) — which model spends (L334). The budget (L334): the caps (L149) per dimension (L334) — the tenant's monthly cap (L149), the feature's cap (L334) — and the alerts (L274) — the spend over the threshold (L274) → the page (L334). The analysis (L334): the unit economics (L334) — the cost per request (L334), the cost per user (L334), the gross margin (L334) — the pricing's (L332) feedback (L334). The AI shape (L173): the usage (L332) — the cost (L334) derived (L334) and attributed (L334) to the features, the tenants, and the users — the L150 discipline (L150), observability-shaped (L334)."*

## 2. Mental Model

Think of the cost tracking as **the restaurant's nightly receipts.** The receipts (the cost records, L334) itemize every dish (the call, L328): the ingredients' costs (the tokens × the price, L334) — the base's (the input's, L152) and the garnish's (the output's, L152) different prices (L334). The receipts' columns (the dimensions, L334): the menu section (the feature, L332), the party (the tenant, L320), and the diner (the user, L319). The accountant (the tracker, L334) sums the columns (L334): the section's spend (L334), the party's spend (L334), the diner's spend (L334) — and the owner (the budget, L334) watches the caps (L149): the party's tab (L149) and the alerts (L274) when a tab runs hot (L334). The restaurant works because every receipt is itemized, and every column is summed (L334).

```text
   the receipts (the cost records, L334)
   ┌────────────────────────────────────────────────────────┐
   │ the itemization (the tokens × the price, L334) — the   │
   │ input's and the output's (L152)                        │
   │ the columns (the dimensions, L334) — the feature       │
   │ (L332), the tenant (L320), the user (L319)             │
   │ the sums (L334) · the caps (L149) · the alerts (L274)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the receipts**: the itemization, the columns, and the sums (L334).

## 3. Visual Flow — One Costed Call

```text
   the call (L328)
        │  the usage (L332)
        ▼
   ┌────────────────────── THE CALCULATION (L334) ──────────────────────┐
   │  inputTokens × inputPrice + outputTokens × outputPrice (L334)    │
   │  = the cost per call (L334)                                      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DIMENSIONS (L334) ───────────────────────┐
   │  featureId · tenantId · userId · modelId (L334)                  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE AGGREGATION (L334) ──────────────────────┐
   │  the feature's spend (L334) · the tenant's spend (L334)          │
   │  the user's spend (L334) · the month's total (L334)              │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE BUDGET (L334) ───────────────────────────┐
   │  the tenant's cap (L149) · the alert over the threshold (L274)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the cost: **calculate → dimension → aggregate → budget** (L334).

## 4. How It Works — The Record, Part by Part

- **The calculation (L334).** The cost per call (L334): the tokens (L332) × the price (L150) — the input's and the output's prices (L152) differ (L334).
- **The dimensions (L334).** The attribution (L334): the feature (L332), the tenant (L320), the user (L319), the model (L148).
- **The budget (L334).** The caps (L149) per dimension (L334) and the alerts (L274) on the thresholds (L334).
- **The analysis (L334).** The unit economics (L334): the cost per request (L334), the cost per user (L334), the gross margin (L334).

> [!NOTE]
> **The cost is the usage, priced (L334).** The senior answer derives the cost (L334) from the metering (L332): the usage (L332) recorded once (L328), the cost (L334) calculated with the price table (L150): the input's and the output's prices (L152), the model's (L148) price. The attribution (L334) — the dimensions (L334) — is the metering's (L332): the same dimensions (L332), the priced sums (L334).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The cost (L334) per tenant (L320) — the billing (L332) and the margin (L334).
- **A multi-feature product (L173).** The cost (L334) per feature (L332) — the expensive feature (L334) found.
- **A chat product (L162).** The cost (L334) per user (L319) — the heavy users (L334) priced (L332).
- **A model router (L155).** The cost (L334) per model (L148) — the routing's (L155) economics (L334).
- **Anything AI (L328).** The spend's record (L334) — the usage (L332), costed (L334).

The through-line: **the attribution is the spend's** — the calculation, the dimensions, and the budget (L334).

## 6. Interview Explanation

Say it in four moves:

1. **The calculation.** "The tokens × the price — the input's and the output's differ (L334)."
2. **The dimensions.** "The feature (L332), the tenant (L320), the user (L319), the model (L148)."
3. **The budget.** "The caps (L149) and the alerts (L274)."
4. **The analysis.** "The unit economics — the cost per request, the margin (L334)."

## 7. Senior-Level Insights

- **The price table is the calculation's (L150).** The input's and the output's prices (L152), the model's (L148) — the cost (L334) derived (L334).
- **The dimensions are the attribution (L334).** The feature (L332), the tenant (L320), the user (L319) — the L332 metering (L332), priced (L334).
- **The budget is the cap (L149).** The tenant's monthly cap (L149) — the 429 (L318) and the alert (L274).
- **The unit economics is the pricing's feedback (L334).** The cost per request (L334) and the margin (L334) — the pricing (L332) adjusted (L334).
- **The anomaly is the spend's watch (L334).** The spike (L334) — the abuse (L317) and the leak (L312) — the L317 watch (L317), cost-shaped (L334).

## 8. Common Mistakes

- **The total-only price (L334).** The total tokens × one price (L334) — the input's and the output's prices (L152) differ (L334).
- **The un-dimensioned cost (L334).** The spend (L334) without the tenant (L320) and the feature (L332) — the attribution (L334) impossible (L334).
- **The price drift (L334).** The stale prices (L150) — the price table (L150) updated (L334).
- **The budget-less spend (L149).** The cost (L334) without the caps (L149) — the bill (L334) unbounded (L334).
- **The margin blind (L334).** The spend (L334) without the revenue (L334) — the unit economics (L334) invisible (L334).

## 9. Best Practices

- **Price the usage** (L334) — the input's and the output's (L152).
- **Dimension the cost** (L334) — the feature (L332), the tenant (L320), the user (L319).
- **Cap the spend** (L149) — the per-tenant (L320) and the per-feature (L332).
- **Alert the thresholds** (L274) — the spend's spikes (L334).
- **Analyze the economics** (L334) — the cost per request, the margin (L334).

## 10. Interview Questions

**Q: Walk me through the cost tracking.**
> A: The spend's attribution (L334). The calculation — the tokens × the price, the input's and the output's differing (L334). The dimensions — the feature (L332), the tenant (L320), the user (L319), the model (L148). The budget — the caps (L149) and the alerts (L274). And the analysis — the unit economics (L334).

**Q: How do you calculate the cost per call?**
> A: The usage priced (L334): the input tokens (L332) × the input price (L152), the output tokens (L332) × the output price (L152) — the prices (L150) differ by the type (L152) and the model (L148) — the sum is the cost per call (L334).

**Q: What are the dimensions for?**
> A: The attribution (L334): the cost (L334) per feature (L332) — the expensive feature (L334); per tenant (L320) — the heavy customer (L334); per user (L319) — the heavy user (L334); and per model (L148) — the routing's (L155) economics (L334). The L332 metering (L332), priced (L334).

**Q: How do you control the spend?**
> A: The caps and the alerts (L334): the per-tenant cap (L149) — the tenant's (L320) monthly budget (L149); the feature's cap (L334); and the alerts (L274) — the spend over the threshold (L274) → the page (L334). The caps (L149) bound the bill (L334); the alerts (L274) catch the spikes (L334).

## 11. Follow-Up Questions

- How do you calculate the cost (L334)?
- What are the dimensions (L334)?
- How do you control the spend (L334)?
- What's the unit economics (L334)?
- What's the anomaly (L334)?

## 12. Comparison Table — The Usage vs the Cost

| | The usage (L332) | The cost (L334) |
|---|---|---|
| The unit (L334) | the tokens (L332) | the dollars (L334) |
| The calculation (L334) | the count (L332) | the tokens × the price (L334) |
| The use (L334) | the quota (L149), the metering (L332) | the billing (L332), the margin (L334) |

The senior read: **the usage is counted; the cost is priced** — the one metering, the two views (L334).

## 13. Code Example — The Spend, Tracked

```js
// The cost tracking (L334) — the usage, priced (L334).
// 1 · THE PRICE TABLE (L150) — the input's and the output's (L152).
const PRICES = {
  'gpt-4o-mini':       { input: 0.00000015, output: 0.00000060 },  // L150
  'claude-3-5-sonnet': { input: 0.00000003, output: 0.00000015 },
};

// 2 · THE CALCULATION (L334) — the cost per call (L334).
function costOf(usage, modelId) {
  const price = PRICES[modelId];                        // L150
  return usage.input_tokens * price.input              // the input (L152)
       + usage.output_tokens * price.output;           // the output (L152)
}

// 3 · THE DIMENSIONS (L334) — the attribution (L334).
async function trackCost(req, usage) {
  const record = {
    at: new Date().toISOString(),
    featureId: req.feature,              // the feature (L332)
    tenantId: req.tenantId,              // the tenant (L320)
    userId: req.userId,                  // the user (L319)
    modelId: req.model,                  // the model (L148)
    costUsd: costOf(usage, req.model),   // the cost (L334)
  };
  await costStore.write(record);         // the record (L334)

  // 4 · THE BUDGET (L149) — the per-tenant cap (L334).
  const month = await costStore.tenantMonth(record.tenantId);
  if (month > TENANT_MONTHLY_CAP) {
    await alert('tenant-over-budget', record.tenantId);   // L274
    return error(429);                   // the cap (L149, L318)
  }
  return record;
}

// 5 · THE ANALYSIS (L334) — the cost per request, the margin (L334).
```

```text
What the reader must SEE — the spend, tracked:

  PRICES per model            → the price table (L150)
  input × input + output × output → the calculation (L152, L334)
  featureId + tenantId + userId → the dimensions (L334)
  TENANT_MONTHLY_CAP → alert   → the budget (L149, L274)

  The usage counted, the cost priced, the spend capped (L334).
```

```narrate
4-8: The price table — the input and output prices per model (L150, L152).
10-13: The calculation — the input and the output costed separately (L334).
15-24: The dimensions — the feature, the tenant, the user, and the model attributed (L334).
26-31: The budget — the tenant's monthly cap and the alert (L149, L274).
33: The analysis — the unit economics (L334).
```

> [!TIP]
> The pair that defines the tracking: **the priced usage** (the calculation, L334) and **the per-tenant cap** (the budget, L149). **Price the tokens, dimension the spend, cap the tenants, alert the spikes — the spend's record (L334).**

## 14. Performance Notes

- **The calculation is the call's latency (L334).** The arithmetic (L334) — the negligible (L334) cost (L334).
- **The aggregation is the batch's cost (L334).** The monthly sums (L334) — the batched (L334) computation (L334).
- **The storage is the spend's cost (L334).** The records (L334) — the retention (L322) bounded (L334).
- **The cap is the bill's bound (L149).** The per-tenant cap (L149) — the cost (L334) bounded (L334).

## 15. Debugging Scenarios

| Symptom | First check (L334) | The lever |
|---|---|---|
| The bill is wrong | The price (L150) | The price table (L150) |
| The spend is unattributed | The dimensions (L334) | The tenant (L320), the feature (L332) |
| The tenant overspends | The cap (L149) | The per-tenant budget (L149) |
| The spike is silent | The alert (L274) | The threshold (L274) |
| The margin is negative | The economics (L334) | The pricing (L332) |

## 16. Quick Revision Notes

- The cost tracking = **the spend's record** (L334): the calculation, the dimensions, the budget, the analysis.
- The calculation: **the tokens × the price — the input's and the output's (L152)**.
- The dimensions: **the feature (L332), the tenant (L320), the user (L319), the model (L148)**.
- The budget: **the caps (L149) and the alerts (L274)**.
- The analysis: **the unit economics — the cost per request, the margin (L334)**.

## 17. Cheat Sheet

```text
COST TRACKING = attributing the spend to the features, the tenants,
the users

THE CALCULATION (L334)
  the cost per call (L334): the tokens (L332) × the price (L150)
  the input's and the output's prices (L152) differ (L334)
  the model's (L148) price (L150)

THE DIMENSIONS (L334)
  the feature (L332) · the tenant (L320) · the user (L319)
  the model (L148) — the attribution (L334)

THE BUDGET (L334)
  the caps (L149) — the tenant's monthly (L149), the feature's (L334)
  the alerts (L274) — the spend over the threshold (L274) → the page (L334)

THE ANALYSIS (L334)
  the unit economics (L334): the cost per request (L334)
  the cost per user (L334) · the gross margin (L334)

INTERVIEW, 4 MOVES
  1 calculation "the tokens × the price (L334)"
  2 dimensions  "the feature, the tenant, the user, the model (L334)"
  3 budget      "the caps and the alerts (L149, L274)"
  4 analysis    "the unit economics (L334)"
```

## 18. Key Takeaways

> [!RECAP]
> - The cost tracking **attributes the model spend to the features, the tenants, and the users** (L334): the calculation (L334), the dimensions (L334), the budget (L334), and the analysis (L334)
> - **The calculation** (L334): the cost per call (L334) — the tokens (L332) × the price (L150) — the input's and the output's prices (L152) differing (L334)
> - **The dimensions** (L334): the feature (L332), the tenant (L320), the user (L319), and the model (L148) — the attribution (L334)
> - **The budget** (L334): the caps (L149) per dimension (L334) and the alerts (L274) on the thresholds (L334)
> - **The analysis** (L334): the unit economics (L334) — the cost per request (L334), the cost per user (L334), the gross margin (L334) — the pricing's (L332) feedback (L334)
> - The AI shape (L334): the usage (L332) — the cost (L334) derived (L334) and attributed (L334) — the L150 discipline (L150), observability-shaped (L334)

## Check your understanding

Answer these without looking back.

1. How do you calculate the cost (L334)?
2. What are the dimensions (L334)?
3. How do you control the spend (L334)?
4. What's the unit economics (L334)?
5. What's the price table (L150)?
6. What's the cap (L149)?
7. What's the anomaly (L334)?
8. What is the spend's record (L334)?

## A Closing Note — The Receipts, Summed

You now hold the record: **the calculation, the dimensions, the budget, and the analysis — with every dish itemized and every column summed.** The nightly receipts are tallied — and the hot tabs are paged (L334).

Next: the hidden regressions after the deploy — Model Performance Monitoring (L335).
