# Lesson 368 — Cost Estimation & Budgeting

**Interview importance:** ⭐⭐⭐⭐⭐ — "token math, infra cost, and the budget that survives the board" — the answer is *the estimate*: the tokens, the infra, and the budget (L368).**

L334 tracked the cost and L150 built the discipline; this lesson is **the board's number**: the cost estimation & budgeting — the token math, the infra cost, and the budget that survives the board (L368): the tokens (the math, L368), the infra (the compute and the storage, L368), and the budget (the board's, L368). The AI shape (L173): the enterprise (L380) — the estimate (L368) the board (L360) signs (L368). This lesson is the estimate's craft (L368).

The distinction this lesson is built on: a **junior** guesses the bill. A **solutions architect** estimates (L368): the tokens (L368), the infra (L368), and the budget (L368) — because the estimate (L368) must survive the board (L360).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tokens: the math (L368)
- Explain the infra: the compute and the storage (L368)
- Explain the budget: the board's (L368)
- Explain the levers: the caching, the routing, the provisioned (L368)
- Explain the AI shape: the estimate's craft (L368)

## 1. One-Line Definition

**The cost estimation & budgeting is the token math, the infra cost, and the budget that survives the board (L368) — the tokens (the math: the requests L358 × the tokens per request L332 × the price L150, L368), the infra (the compute L285, the storage L183, the egress L285, L368), and the budget (the board's: the monthly L368, the growth L368, the contingency L368, L368) — with the levers (the caching L171, the routing L155, the provisioned L278, L368) — the estimate (L368), the board's (L360) number (L368).**

The one-sentence interview answer: *"The cost estimate is the board's number (L368). The tokens (L368): the math (L368) — the requests per day (L358) × the tokens per request (L332) × the price per token (L150) — the model's (L148) tier (L365) — the input's and the output's (L152) prices (L368). The infra (L368): the compute (L285) — the Lambda (L266) and the ECS (L271); the storage (L183) — the vectors (L183) and the logs (L329); and the egress (L285). The budget (L368): the monthly (L368), the growth (L368) — the users' (L358) growth (L368) — and the contingency (L368) — the 20% (L368). The levers (L368): the caching (L171) — the hit rate (L269) cutting the tokens (L332); the routing (L155) — the small (L157) for the 80% (L365); and the provisioned (L278) — the steady (L358) at the discount (L285). The AI shape (L173): the enterprise (L380) — the estimate (L368): the tokens (L368), the infra (L368), and the budget (L368) — the levers (L368) applied — the board's (L360) number, survived (L368)."*

## 2. Mental Model

Think of the cost estimate as **the contractor's bid for the tower.** The bid (the estimate, L368) itemizes (L368): the materials (the tokens, L368) — the steel (the input, L152) and the glass (the output, L152) at the market (the price, L150); the labor (the infra, L368) — the crews (the compute, L285) and the warehouses (the storage, L183); and the contingencies (the budget, L368) — the 20% (L368) for the surprises (L368). The contractor (the architect, L368) applies the savings (the levers, L368): the bulk discounts (the provisioned, L278), the recycled materials (the caching, L171). The owner (the board, L360) reviews the bid (L368) — the line items (L368) and the total (L368) — and signs (L360). The tower works because the bid is itemized, the savings are applied, and the contingency is included (L368).

```text
   the bid (the estimate, L368)
   ┌────────────────────────────────────────────────────────┐
   │ the materials (the tokens, L368) — the steel (L152),   │
   │ the glass (L152) at the market (L150)                  │
   │ the labor (the infra, L368) — the crews (L285), the    │
   │ warehouses (L183)                                      │
   │ the contingency (L368) · the savings (the levers, L368)│
   └────────────────────────────────────────────────────────┘
```

The mental model is **the bid**: the materials, the labor, and the contingency (L368).

## 3. Visual Flow — The Estimate's Math

```text
   THE TOKENS (L368)
   the requests/day (L358) × the tokens/request (L332)
   × the price (L150) = the monthly model cost (L368)

   THE INFRA (L368)
   the compute (L285) + the storage (L183) + the egress (L285)
   = the monthly infra cost (L368)

   THE BUDGET (L368)
   the model + the infra = the base (L368)
   × the growth (L368) × the contingency (L368) = the total (L368)

   THE LEVERS (L368)
   the caching (L171) · the routing (L155) · the provisioned (L278)
   — the total (L368) reduced (L368)
```

The flow is the math: **tokens + infra → budget → levers** (L368).

## 4. How It Works — The Estimate, Part by Part

- **The tokens (L368).** The math (L368): the requests (L358) × the tokens per request (L332) × the price (L150).
- **The infra (L368).** The compute (L285), the storage (L183), the egress (L285).
- **The budget (L368).** The monthly (L368), the growth (L368), the contingency (L368).
- **The levers (L368).** The caching (L171), the routing (L155), the provisioned (L278).

> [!NOTE]
> **The token math is the estimate's foundation (L368).** The senior answer starts with the math (L368): the requests (L358) — the scale (L358); the tokens per request (L332) — the context (L191) and the output (L332); and the price (L150) — the model's (L148) tier (L365), the input and the output (L152). The multiplication (L368) — the requests × the tokens × the price — is the model's (L368) monthly (L368); the levers (L368) — the caching (L171), the routing (L155), the provisioned (L278) — reduce it (L368).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The estimate (L368) — the board's (L360) number (L368).
- **A model rollout (L365).** The tokens (L368) — the tier's (L365) price (L150).
- **A cloud migration (L366).** The infra (L368) — the compute (L285) and the egress (L285).
- **A budget review (L334).** The levers (L368) — the caching (L171), the routing (L155).
- **Anything enterprise (L380).** The estimate (L368) — the tokens, the infra, the budget (L368).

The through-line: **the craft is the estimate's** — the math, the infra, and the levers (L368).

## 6. Interview Explanation

Say it in four moves:

1. **The tokens.** "The requests × the tokens × the price (L368)."
2. **The infra.** "The compute (L285), the storage (L183), the egress (L285)."
3. **The budget.** "The monthly, the growth, the contingency (L368)."
4. **The levers.** "The caching (L171), the routing (L155), the provisioned (L278)."

## 7. Senior-Level Insights

- **The scale is the math's (L358).** The requests (L358) — the estimate (L368) follows the scale (L358).
- **The tier is the price's (L365).** The model's (L148) tier (L365) — the small (L157) at the low (L150) — the routing (L155) shapes the tokens (L368).
- **The cache is the tokens' lever (L171).** The hit rate (L269) — the model calls (L278) avoided (L358) — the tokens (L332) down (L368).
- **The provisioned is the steady's (L278).** The steady (L358) at the discount (L285) — the L285 lever (L285), estimate-shaped (L368).
- **The contingency is the board's (L368).** The 20% (L368) — the surprises (L367) absorbed (L368).

## 8. Common Mistakes

- **The guessed bill (L368).** The estimate (L368) without the math (L368) — the board (L360) rejects (L368).
- **The tokens-only (L368).** The model (L368) without the infra (L368) — the compute (L285) and the egress (L285) forgotten (L368).
- **The single price (L368).** The total tokens × one price (L368) — the input's and the output's (L152) differ (L368).
- **The no-lever (L368).** The estimate (L368) without the caching (L171) and the routing (L155) — the budget (L368) inflated (L368).
- **The no-contingency (L368).** The base (L368) without the 20% (L368) — the surprise (L367) at the overrun (L368).

## 9. Best Practices

- **Do the math** (L368) — the requests × the tokens × the price (L368).
- **Itemize the infra** (L368) — the compute (L285), the storage (L183), the egress (L285).
- **Apply the levers** (L368) — the caching (L171), the routing (L155), the provisioned (L278).
- **Add the contingency** (L368) — the 20% (L368).
- **Review with the board** (L360) — the line items (L368) and the total (L368).

## 10. Interview Questions

**Q: Walk me through the cost estimation.**
> A: The board's number (L368). The tokens — the requests × the tokens × the price (L368). The infra — the compute (L285), the storage (L183), the egress (L285). The budget — the monthly, the growth, the contingency (L368). And the levers — the caching (L171), the routing (L155), the provisioned (L278).

**Q: How do you estimate the model cost?**
> A: The math (L368): the requests per day (L358) × the tokens per request (L332) — the input and the output (L152) — × the price per token (L150) — the tier's (L365). The monthly (L368): the daily (L368) × 30. The levers (L368) — the caching (L171) and the routing (L155) — applied (L368).

**Q: What's the infra?**
> A: The compute (L285) — the Lambda (L266) and the ECS (L271); the storage (L183) — the vectors (L183) and the logs (L329); and the egress (L285) — the data out (L261). The infra (L368) is the estimate's (L368) second line (L368).

**Q: How do you make it survive the board?**
> A: The itemization (L368): the line items (L368) — the tokens (L368), the infra (L368) — the levers (L368) applied (L368); the growth (L368) — the users' (L358) growth (L368); and the contingency (L368) — the 20% (L368). The board (L360) sees the math (L368) and the risk (L368) — the estimate (L368) survives (L368).

## 11. Follow-Up Questions

- How do you estimate the model cost (L368)?
- What's the infra (L368)?
- How do you make it survive the board (L368)?
- What are the levers (L368)?
- What's the contingency (L368)?

## 12. Comparison Table — The Estimate's Lines

| Line (L368) | The math (L368) | The lever (L368) |
|---|---|---|
| The tokens (L368) | the requests × the tokens × the price (L368) | the caching (L171), the routing (L155) |
| The compute (L285) | the Lambda (L266) + the ECS (L271) | the concurrency (L266), the spot (L285) |
| The storage (L183) | the vectors (L183) + the logs (L329) | the lifecycle (L265), the retention (L322) |
| The egress (L285) | the data out (L261) | the CloudFront (L272), the endpoints (L263) |

The senior read: **each line with its lever** (L368).

## 13. Code Example — The Estimate, Built

```js
// The cost estimate (L368) — the math, the infra, the budget (L368).
// 1 · THE TOKENS (L368) — the math (L368).
const scale = { requestsPerDay: 1_000_000 };        // L358
const tokens = {
  input:  800,                                       // the context (L191)
  output: 400,                                       // the generation (L332)
};
const price = {                                      // the tier (L365, L150)
  input:  0.00000015,                                // the input (L152)
  output: 0.00000060,                                // the output (L152)
};

const modelCostPerDay =
  scale.requestsPerDay * (tokens.input * price.input + tokens.output * price.output);
const modelCostPerMonth = modelCostPerDay * 30;      // L368

// 2 · THE INFRA (L368) — the second line (L368).
const infraPerMonth = {
  compute: 4_000,                                    // the Lambda (L266), L285
  storage: 1_500,                                    // the vectors (L183), L285
  egress:  500,                                      // the data out (L285)
};
const infraCost = Object.values(infraPerMonth).reduce((a, b) => a + b, 0);

// 3 · THE LEVERS (L368) — applied (L368).
const levers = {
  caching: 0.3,    // the hit rate (L269) cuts the tokens (L171)
  routing: 0.4,    // the 80/20 (L365) cuts the price (L155)
  provisioned: 0.1,// the steady at the discount (L278, L285)
};

// 4 · THE BUDGET (L368) — the base + the growth + the contingency (L368).
const base = modelCostPerMonth * (1 - levers.caching - levers.routing - levers.provisioned)
          + infraCost;
const budget = base * 1.3 * 1.2;                     // the growth × the 20% (L368)
```

```text
What the reader must SEE — the estimate, built:

  requests × (in×pin + out×pout) → the token math (L368)
  compute + storage + egress    → the infra (L285, L368)
  caching 0.3 + routing 0.4 + provisioned → the levers (L368)
  base × 1.3 × 1.2              → the growth and the contingency (L368)

  The tokens, the infra, the levers, the budget (L368).
```

```narrate
4-7: The scale — the requests per day (L358, L368).
9-14: The prices — the tier's input and output (L152, L150).
16-19: The model cost — the daily and the monthly math (L368).
21-27: The infra — the compute, the storage, and the egress (L285, L368).
29-33: The levers — the caching, the routing, and the provisioned (L368).
35-36: The budget — the base with the growth and the contingency (L368).
```

> [!TIP]
> The pair that defines the estimate: **the per-token math** (the foundation, L368) and **the contingency multiplier** (the board's risk, L368). **Do the token math, itemize the infra, apply the levers, add the contingency — the board's number (L368).**

## 14. Performance Notes

- **The math is the estimate's speed (L368).** The spreadsheet (L368) — the scenarios (L368) compared (L368).
- **The levers are the cost's (L368).** The caching (L171) — the hit rate (L269) — the tokens (L332) down (L368).
- **The provisioned is the steady's (L278).** The discount (L285) — the L285 lever (L285), estimate-shaped (L368).
- **The contingency is the risk's (L368).** The 20% (L368) — the overrun (L367) absorbed (L368).

## 15. Debugging Scenarios

| Symptom | First check (L368) | The lever |
|---|---|---|
| The bill overruns | The math (L368) | The tokens (L332), the price (L150) |
| The infra surprises | The itemization (L368) | The egress (L285), the storage (L183) |
| The budget is rejected | The board (L360) | The line items (L368) |
| The levers are weak | The estimate (L368) | The caching (L171), the routing (L155) |
| The overrun hits | The contingency (L368) | The 20% (L368) |

## 16. Quick Revision Notes

- The cost estimation = **the board's number** (L368): the tokens, the infra, the budget, the levers.
- The tokens: **the requests × the tokens × the price (L368)**.
- The infra: **the compute (L285), the storage (L183), the egress (L285)**.
- The budget: **the monthly, the growth, the contingency (L368)**.
- The levers: **the caching (L171), the routing (L155), the provisioned (L278)**.

## 17. Cheat Sheet

```text
COST ESTIMATION & BUDGETING = the board's number

THE TOKENS (L368)
  the math (L368): the requests (L358) × the tokens per request (L332)
  × the price (L150) — the input (L152) and the output (L152)
  the tier's (L365) price (L150)

THE INFRA (L368)
  the compute (L285) — the Lambda (L266), the ECS (L271)
  the storage (L183) — the vectors (L183), the logs (L329)
  the egress (L285) — the data out (L261)

THE BUDGET (L368)
  the monthly (L368) · the growth (L368) — the users' (L358)
  the contingency (L368) — the 20% (L368)

THE LEVERS (L368)
  the caching (L171) — the hit rate (L269) cuts the tokens (L332)
  the routing (L155) — the small (L157) for the 80% (L365)
  the provisioned (L278) — the steady (L358) at the discount (L285)

INTERVIEW, 4 MOVES
  1 tokens  "the requests × the tokens × the price (L368)"
  2 infra   "the compute, the storage, the egress (L368)"
  3 budget  "the monthly, the growth, the contingency (L368)"
  4 levers  "the caching, the routing, the provisioned (L368)"
```

## 18. Key Takeaways

> [!RECAP]
> - The cost estimation & budgeting is **the token math, the infra cost, and the budget that survives the board** (L368): the tokens (L368), the infra (L368), the budget (L368), and the levers (L368)
> - **The tokens** (L368): the math (L368) — the requests (L358) × the tokens per request (L332) × the price (L150) — the input and the output (L152), the tier (L365)
> - **The infra** (L368): the compute (L285), the storage (L183), and the egress (L285)
> - **The budget** (L368): the monthly (L368), the growth (L368), and the contingency (L368) — the 20% (L368)
> - **The levers** (L368): the caching (L171) — the hit rate (L269); the routing (L155) — the 80/20 (L365); and the provisioned (L278) — the discount (L285)
> - The AI shape (L368): the enterprise (L380) — the estimate (L368): the tokens (L368), the infra (L368), and the budget (L368) — the levers (L368) applied — the board's (L360) number, survived (L368)

## Check your understanding

Answer these without looking back.

1. How do you estimate the model cost (L368)?
2. What's the infra (L368)?
3. How do you make it survive the board (L368)?
4. What are the levers (L368)?
5. What's the contingency (L368)?
6. What's the hit rate (L269)?
7. What's the provisioned (L278)?
8. What is the board's number (L368)?

## A Closing Note — The Bid, Itemized

You now hold the estimate: **the tokens, the infra, the budget, and the levers — with the line items and the contingency.** The contractor's bid is itemized — and the owner signs (L368).

Next: the throughput, the concurrency, and the model's rate limits as capacity — Capacity Planning (L369).
