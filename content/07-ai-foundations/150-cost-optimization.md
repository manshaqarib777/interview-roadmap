# Lesson 150 — Cost Optimization

**Interview importance:** ⭐⭐⭐⭐ — "how much will this cost, and how do you control it?" is the business question every AI architect answers; the answer is a *cost model* with levers, not a hope.

Lesson 149 built the per-request token ledger. This lesson turns that ledger into the thing the business actually cares about: **the monthly cost model** — and the levers that control it. Token cost is the new infrastructure cost: it's variable, it scales with usage, and it's *fully controllable* once you can compute it. The interview rewards the architect who can estimate a cost before the bill and name the lever that cuts it.

The distinction this lesson is built on: a **developer** sees cost in the dashboard. A **solutions architect** can compute it up front — *tokens per request × requests per month × price per million, by tier* — and can name the five levers that move it: model tier, output length, caching, retrieval, and batching. Cost is not a surprise; it's a model with levers.

## Learning Objectives

By the end of this lesson you should be able to:

- Compute the cost of a request, a feature, and a month — input and output priced separately
- Name the cost levers: model tier (L148), output length, caching (L171), retrieval (L189), batching
- Explain why output tokens cost 3–5× input, and what that does to prompt design
- Build a cost model for a feature before shipping it, and sanity-check it against the provider dashboard
- Explain cost optimization as a *trade-off* — quality and latency in, dollars out

## 1. One-Line Definition

**Cost optimization is building a model of what AI usage actually costs — tokens per request, priced by tier, scaled by volume — and then applying the levers (model tier, output length, caching, retrieval, batching) to hit a budget, trading off quality and latency deliberately.**

The one-sentence interview answer: *"The cost model is arithmetic: tokens per request × price per million, input and output priced separately (output is 3–5× more), times requests per month. The levers are model tier (L148), output length, prompt caching (L171), retrieval tightness (L189), and batching. I compute the number before shipping, then pull the levers to hit the budget — trading quality and latency deliberately."*

## 2. Mental Model

Think of LLM cost as **a utility bill with five appliances** — and each appliance has a knob.

The bill is *variable* (it scales with usage, unlike a server you own) and *fully itemised* if you build the model. The five knobs:

| The knob | What it controls | The trade-off |
|---|---|---|
| **Model tier** (L148) | price per token (small→flagship is 10–50×) | quality |
| **Output length** | the expensive tokens (3–5× input) | completeness / latency |
| **Caching** (L171) | repeated prefixes at ~10% cost | cache stability |
| **Retrieval** (L189) | how much context you send | retrieval quality |
| **Batching** | provider discounts for volume | latency |

The mental model is a **cost equation with five adjustable terms**. You don't "hope the bill is low" — you set the knobs, compute the number, and pull a knob when you need a different number.

## 3. Visual Flow — From Request to Monthly Bill

```text
   ONE REQUEST (L149's ledger)          THE MONTHLY MODEL
   ┌──────────────────────────┐        ┌───────────────────────────┐
   │ input    2,000 tokens    │        │ requests/month  × 1M      │
   │ output     500 tokens    │        │  = 2B input + 500M output  │
   └───────────┬──────────────┘        └────────────┬──────────────┘
               ▼                                   ▼
   price × per million                     price × per million
   input  $0.15/M  → $0.0003               input 2B × $0.15/M = $300
   output $0.60/M  → $0.0003               output 500M × $0.60/M = $300
   ─────────────────────────              ─────────────────────────
   one request ≈ $0.0006                   month ≈ $600
               │                                   │
               ▼                                   ▼
        "one request is a fraction of a cent"      "a feature at scale is $600/month"
```

The two scales are the same arithmetic: **the per-request number (L149) times the volume.** That's why budgeting the request right (L149) makes the monthly model a spreadsheet, not a surprise.

## 4. How It Works — The Pricing Reality

- **Input and output are priced differently.** Output is 3–5× input at every provider — because generating a token is a full forward pass per token (L135, L151), while input is processed once. The pricing asymmetry is the physics, not a marketing decision.
- **Tiers are 10–50× apart (L148).** The small model is a fraction of the flagship's price. The single biggest cost lever is *which model you route to* (L157's tiering).
- **Caching (L171) prices repeated prefixes at ~10%.** A byte-stable system prompt + stable doc prefix turns repeated cost into cached cost — often the cheapest "free" money in the stack.
- **Batching and committed use** get volume discounts at most providers — the number matters once you're at scale (L285 touches the AWS-side).
- **Embeddings and fine-tuning are separate lines** (L147, L148): embeddings are cheap per token but you pay for *volume*; a fine-tuned model has its own hosted price.

> [!NOTE]
> **The honest truth about estimates.** The model is a spreadsheet, but the *prices* move (L156) and the *usage* moves. The discipline is: compute before shipping, then *measure* — log real token usage per request (L332) and reconcile against the provider dashboard monthly. An estimate that isn't measured is a guess wearing a spreadsheet.

## 5. Real Project Usage

- **The "how much will it cost" question** — before any AI feature ships, the architect produces a number: requests/month × tokens × price, by tier. That number decides build vs buy (L363) and feature viability.
- **Tiered routing (L157).** 90% of traffic to the small model, flagship for the hard tail — the single biggest bill reducer in production.
- **Prompt caching (L171) on chat.** A stable system prompt + summarised history (L166) turns most of every request into cached input.
- **Retrieval tightness (L189).** Sending 5 tight chunks instead of 20 loose ones halves the docs line — a retrieval-quality win that's also a cost win.
- **Output discipline.** Asking for a 50-word answer instead of a 500-word one cuts the *expensive* tokens (L135) — prompt design as cost design.
- **Per-user caps (L318).** In a multi-tenant SaaS (L357), per-user token budgets are the cost control that keeps one abusive tenant from blowing the shared bill.

The through-line: **cost is a design input, not a post-hoc surprise.** Every architecture decision — model, prompt, retrieval, caching — has a price, and the architect computes it before committing.

## 6. Interview Explanation

Say it in four moves:

1. **The model.** "Cost is arithmetic: tokens per request × price per million — input and output priced separately, output 3–5× more — times requests per month."
2. **The levers.** "Five knobs: model tier (L148), output length, caching (L171), retrieval tightness (L189), and batching. I compute the number, then pull a knob to hit the budget."
3. **The trade-off.** "Every lever trades something — tier trades quality, output trades completeness, caching trades stability, retrieval trades recall. Cost optimization is a deliberate trade, not a magic discount."
4. **The discipline.** "I compute before shipping, then measure — log real usage (L332) and reconcile monthly. An estimate that isn't measured is a guess."

## 7. Senior-Level Insights

- **Cost is the *other* architecture axis.** Quality and latency are visible; cost is invisible until the bill. The senior architect makes cost a first-class constraint — the same way you'd size a database — and it changes real decisions (tiering, caching, retrieval).
- **The output-token asymmetry is the deepest lever.** Output is 3–5× input *and* slow (L151). Designing prompts for short, structured outputs (L142, L143) attacks the most expensive and slowest part of every request — a double win.
- **Tiering is the biggest single lever (L148, L157).** Routing most traffic to the small model is a 10–50× cut on that traffic — no other lever comes close. The senior answer always mentions tiering first.
- **Caching is the "free money" lever (L171).** Repeated prefixes at ~10% cost is the rare lever with almost no quality trade-off — it trades *stability*, which is a discipline, not a sacrifice.
- **Cost optimization composes with quality.** Tight retrieval (L189) and summarised history (L166) usually *improve* answers while cutting cost. The best levers are the ones where the trade-off is positive.

## 8. Common Mistakes

- **Estimating with word counts (L137).** The 1.3× token error compounds across a pipeline into a 30% cost error.
- **Forgetting output is priced separately.** The 3–5× output premium is where the money is; a cost model that treats output like input is wrong by a multiple.
- **Flagship-everything.** No tiering (L148) — the single most expensive mistake, 10–50× on most traffic.
- **No per-user caps (L318).** A runaway agent (L200) or abusive tenant (L357) blows the monthly number.
- **Not measuring.** The spreadsheet says one thing; the dashboard says another (L332) — reconcile, or the model drifts.
- **Ignoring caching (L171).** A byte-unstable system prompt (L142) pays full price on every request when ~10% was available.

## 9. Best Practices

- **Compute the per-request cost (L149), then the monthly model, before shipping.**
- **Tier the workload (L157)** — small model first, flagship for the hard tail.
- **Design for short outputs** (L142, L143) — the expensive tokens, cut deliberately.
- **Cache stable prefixes** (L171): freeze the system prompt, keep docs stable.
- **Retrieve tight** (L189): fewer, better chunks.
- **Cap per user** (L318) and measure real usage (L332) against the model monthly.

## 10. Interview Questions

**Q: How do you estimate the cost of an AI feature?**
> A: Arithmetic: tokens per request × price per million, input and output separately — output is 3–5× more (L135) — times requests per month, by tier. I compute the per-request ledger (L149), scale it to volume, and sanity-check against the provider dashboard after launch.

**Q: What's the biggest cost lever?**
> A: Model tiering (L148, L157). Routing most traffic to a small model is a 10–50× cut on that traffic. After that: output length (the expensive tokens), caching (L171) at ~10% for repeated prefixes, retrieval tightness (L189), and batching.

**Q: Why is output more expensive than input?**
> A: Because generation is a full forward pass *per token* (L135, L151), while input is processed once. So output is priced 3–5× higher — which is why prompt design that produces short, structured answers (L142, L143) attacks the most expensive part of the request.

**Q: How do you keep cost under control at scale?**
> A: Tiered routing (L157), prompt caching (L171), tight retrieval (L189), short structured outputs (L143), and per-user caps (L318). And I measure: real token usage per request (L332), reconciled monthly. Cost is a model with levers, not a hope.

## 11. Follow-Up Questions

- How does caching (L171) change the cost math for a chat product?
- What's the cost difference between a small and a flagship model for the same task (L148)?
- How does retrieval quality (L189) become a cost lever?
- What's the relationship between cost (L150) and latency (L151) optimization?
- How do per-user caps work in a multi-tenant AI SaaS (L357)?

## 12. Comparison Table — The Five Levers

| Lever | What it cuts | The trade-off | Size of the win |
|---|---|---|---|
| **Model tier** (L148) | price per token | quality | 10–50× |
| **Output length** | the 3–5× tokens | completeness | 2–10× |
| **Caching** (L171) | repeated prefixes | cache stability | up to ~10× on repeats |
| **Retrieval** (L189) | context size | recall | 2–20× on RAG |
| **Batching** | volume discounts | latency / complexity | 10–40% |

The senior read: **the table is a priority order** — tier first, then output, then cache, then retrieval, then batch — and each one is a *deliberate trade* you can name.

## 13. Code Example — The Cost Model, Computable

```js
// The cost model, as code — per-request → monthly, input/output separated.
const PRICES = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },   // $ per 1M tokens (L148)
  'gpt-4o':      { input: 2.50, output: 10.00 },
};

function costPerRequest(model, inputTokens, outputTokens) {
  const p = PRICES[model];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

function monthly(model, reqs, input, output) {
  return costPerRequest(model, input, output) * reqs;
}

// A RAG feature: 8K input, 300 output, 1M requests/month.
const per = costPerRequest('gpt-4o-mini', 8000, 300);      // ≈ $0.0014
const month = monthly('gpt-4o-mini', 1_000_000, 8000, 300); // ≈ $1,380
console.log(per.toFixed(4), month.toFixed(0));

// The levers in action (L157's tiering): flagship for 10% of traffic.
const tiered =
  monthly('gpt-4o-mini', 900_000, 8000, 300) +               // 90% small
  monthly('gpt-4o', 100_000, 8000, 300);                     // 10% flagship
console.log('tiered:', tiered.toFixed(0));                   // far less than flagship-everything
```

```text
What the reader must SEE — the model is arithmetic:

  per-request  (input×in_price + output×out_price) / 1M
  monthly      per-request × requests
  tiered       small-tier × 90% + flagship-tier × 10%  (L157)

  Output is 4× input price — the expensive tokens (L135).
```

```narrate
2-4: Prices by tier — the 10-50x gap between small and flagship is the whole story (L148).
6-10: The per-request and monthly numbers are two lines of arithmetic.
15-19: Tiered routing (L157): 90% cheap + 10% flagship beats flagship-everything by a huge margin.
```

> [!TIP]
> Keep this spreadsheet-function in the repo (L332 logs the real numbers). The per-request ledger (L149) feeds it, the dashboard reconciles it — and the tiered-routing line is where the money is actually saved.

## 14. Performance Notes

- **Cost and latency are the same tokens (L151).** Fewer tokens = cheaper *and* faster; short structured outputs (L143) win both axes.
- **Caching cuts cost and TTFT together (L171).** A cached prefix is ~10% cost *and* a much faster first token — the rare lever that helps both numbers.
- **Tiering cuts cost and latency together (L148).** The small model is cheaper *and* faster; the flagship is the exception you route to, not the default.
- **Retrieval tightness cuts cost and improves quality (L189).** The best levers are the ones where the trade-off is positive — which is why the senior answer leads with them.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Bill grew with traffic | No tiering (L148) or unbounded history (L166) | Tier the workload (L157); summarise history |
| Per-request cost higher than model | Output tokens unaccounted (L135) | Shorten outputs; structured answers (L143) |
| Caching doesn't help | System prompt not byte-stable (L171) | Freeze the prompt; keep the prefix identical |
| RAG requests expensive | Context too big (L174) | Tighten retrieval (L189); re-chunk (L178) |
| Model vs dashboard disagree | Estimates not measured (L332) | Log real usage; reconcile monthly |

## 16. Quick Revision Notes

- Cost = **tokens × price per million, input and output separately, × volume** (L149's ledger at scale).
- **Output is 3–5× input** — the expensive, slow tokens (L135, L151).
- The five levers: **tier (L148), output length, caching (L171), retrieval (L189), batching**.
- **Tiering is the biggest lever** — 10–50× on most traffic (L157).
- Every lever **trades something** — cost optimization is a deliberate trade, not a discount.
- **Compute, then measure** (L332) — an estimate that isn't reconciled is a guess.

## 17. Cheat Sheet

```text
COST MODEL = arithmetic with levers

  per-request  (input × in_price + output × out_price) / 1M   (L149)
  monthly      per-request × requests
  tiered       90% small + 10% flagship  (L157)

PRICING FACTS
  output is 3-5× input        (per-token forward pass, L135)
  small vs flagship is 10-50× (L148)
  cached prefix ≈ 10%         (L171)

THE FIVE LEVERS (priority order)
  1 model tier    10-50×    trades quality
  2 output length 2-10×     trades completeness
  3 caching       ~10× on repeats  trades stability
  4 retrieval     2-20× on RAG     trades recall
  5 batching      10-40%    trades latency/complexity

DISCIPLINE
  compute before shipping
  tier the workload (L157)
  short structured outputs (L143)
  cache stable prefixes (L171)
  cap per user (L318) · measure (L332) · reconcile monthly

INTERVIEW, 4 MOVES
  1 model   "tokens × price, in/out separated, × volume"
  2 levers  "tier, output, cache, retrieval, batch"
  3 trade   "every lever trades something — deliberate"
  4 measure "compute, then reconcile (L332)"
```

## 18. Key Takeaways

> [!RECAP]
> - Cost is **arithmetic**: tokens per request (L149) × price per million, input and output separately, times volume — computable before you ship
> - **Output is 3–5× input** because generation is a forward pass per token (L135) — making output length the second-biggest lever
> - The five levers are **tier (L148), output length, caching (L171), retrieval (L189), batching** — and tiering is the biggest, at 10–50×
> - Every lever **trades something** — quality, completeness, stability, recall — so cost optimization is a deliberate trade, not a discount
> - The best levers are **positive-trade ones**: tight retrieval and summarised history usually *improve* quality while cutting cost
> - **Compute before shipping, measure after** (L332) — an estimate that isn't reconciled against the dashboard is a guess

## Check your understanding

Answer these without looking back.

1. Write the cost equation for one request, and for a month.
2. Why is output priced higher than input — mechanically?
3. Name the five levers in priority order, and what each trades.
4. Why is tiering the biggest lever (L148, L157)?
5. Which levers have a *positive* trade-off, and why?
6. How does caching (L171) change the math for a chat product?
7. Why is "compute before shipping, measure after" the discipline?
8. How do per-user caps (L318) protect the monthly bill?

## A Closing Note — The Bill You Can Read

Cost optimization is where the architect earns the business's trust: it's the ability to say *"this feature costs $1,380/month, and here are the levers that make it $400"* — before the bill arrives, and with the trade-offs named. Hold the model — **tokens × price, in/out separated, × volume, five levers, deliberate trades, measure monthly** — and cost is never a surprise again.

Next: the other half of the price-quality trade — latency optimization, and the toolbox that makes AI products feel fast.
