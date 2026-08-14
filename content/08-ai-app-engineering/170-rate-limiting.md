# Lesson 170 — Rate Limiting

**Interview importance:** ⭐⭐⭐⭐ — "what happens when you hit the provider's limits?" is the scale question; the answer is the *TPM/RPM budget* — and the gateway's enforcement (L158).

Lessons 168–169 handled failures and retries. This lesson is the **budget that prevents them**: rate limiting — the provider's tokens-per-minute (TPM) and requests-per-minute (RPM) limits, and your app's own per-user limits. Rate limiting sits at the gateway (L158, L172), it's the cost control (L150) and the abuse shield (L318), and it's the difference between a 429 and a bill.

The distinction this lesson is built on: a **demo** hits the provider and handles a 429 when it comes. A **solutions architect** knows the *budgets* before the call: the provider's TPM/RPM limits, your per-user caps (L149, L318), and what happens at each boundary — queue, backoff (L169), or a clean rejection (L162).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the provider's rate limits: TPM, RPM, and the per-model budget
- Design your own limits: per-user, per-feature, per-tenant caps (L149, L318)
- Enforce at the gateway (L158, L172): before the call, not after the 429
- Handle the boundary: queue vs backoff (L169) vs clean rejection (L162)
- Explain rate limiting as cost control (L150) and abuse shield (L318)

## 1. One-Line Definition

**Rate limiting is the budget that governs how much AI usage is allowed — the provider's TPM/RPM limits and your app's per-user caps — enforced at the gateway before the call, so demand is shaped deliberately instead of discovered as 429s and bills.**

The one-sentence interview answer: *"Rate limiting is the AI budget at three scales. The provider sets TPM and RPM limits per model — exceed them and you get 429s (L168). My gateway (L158, L172) enforces my own caps first — per user, per feature, per tenant (L149, L318) — so I shape demand before it reaches the provider. At the boundary: queue what can wait, back off (L169) what can't, and reject cleanly (L162) what shouldn't run. It's cost control (L150) and abuse protection (L318) in one layer."*

## 2. Mental Model

Think of rate limiting as **the bouncer and the meter at the same club** — the provider's limits are the club's capacity (TPM/RPM), and your gateway's limits are your own door policy (per user).

```text
   the club (provider)          your door (gateway, L158, L172)
   ┌────────────────────┐       ┌───────────────────────────┐
   │ TPM budget: 2M/min │       │ per-user: 10 req/min      │
   │ RPM budget: 500/min │      │ per-feature: 1K req/min   │
   │ (per model, L148)   │       │ per-tenant: 50K/day (L357)│
   │                     │       │                           │
   │ 429 = "we're full"  │       │ 429 = "you're over YOUR   │
   └────────────────────┘       │       budget" (L318)      │
                                └───────────────────────────┘
```

The mental model is **two doors**: the provider's capacity (TPM/RPM — you can't change it, you budget against it) and your own door policy (per-user caps — you design it, it's your cost control and abuse shield). The gateway stands between them.

## 3. Visual Flow — A Request Through the Rate-Limit Gates

```text
   a request arrives at the gateway (L158)
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · YOUR caps (per user / feature / tenant)  │
   │     (L149, L318) — the door policy           │
   │     over → 429 clean rejection (L162)        │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · YOUR token budget (L149)                 │
   │     over → trim or reject (L149)             │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 3 · PROVIDER limits (TPM/RPM, per model)     │
   │     (L148) — the club's capacity             │
   │     near → queue / back off (L169)           │
   │     over → respect Retry-After (L168)        │
   └──────────────────────────────────────────────┘
                      ▼
   the call goes out — within every budget
```

The flow is the discipline: **your caps first, your budget second, the provider's limits third** — and the request only leaves the gateway when every budget says it can.

## 4. How It Works — The Limits, and the Boundaries

- **The provider's limits.** TPM (tokens per minute) and RPM (requests per minute), often per model and per tier (L148). They're the *capacity* you budget against. Exceeding them → 429 with a `Retry-After` (L168).
- **Your caps (L149, L318).** Per-user, per-feature, per-tenant limits — your door policy. They're your *cost control* (a runaway user, L318) and your *product design* (what a free tier gets).
- **The token budget (L149).** The per-request ledger — a request that's over the token budget is rejected *before* it consumes provider TPM. The two budgets compose: request tokens (L149) and request rate (this lesson).
- **The boundary responses.** Queue — what can wait (batch jobs, L222). Back off (L169) — a 429 respected, retried later. Clean rejection (L162) — the user told their limit clearly, not a crash.
- **Enforcement at the gateway (L158, L172).** The gateway is the only place both your caps and the provider's limits can be checked — before the call, not after the 429.

> [!NOTE]
> **The two 429s, and why the distinction matters.** A 429 can mean *you're over your own cap* (a product decision — reject cleanly, L162) or *the provider is over its limit* (a capacity fact — respect Retry-After and back off, L169). Handling both as "retry" hammers the first; handling both as "reject" breaks the second. The gateway distinguishes them.

## 5. Real Project Usage

- **Chat products.** Per-user caps (e.g. 30 messages/hour on the free tier, L318) enforced at the gateway; provider TPM budgeted so the team's aggregate never 429s.
- **AI SaaS (L357).** Per-tenant token and rate budgets (L149) — the product's cost control and the abuse shield (L318). One tenant can't blow the shared bill.
- **Batch pipelines (L222).** The provider's RPM is the constraint; a queue (L222) shapes the batch into the limit instead of 429ing into it (L169).
- **Agents (L200).** A long agent run is many calls — the loop's rate budget is designed per run, so an agent doesn't burn the day's TPM in one session.
- **Public AI APIs (L172).** Your own API's rate limits are the product contract — documented, enforced, and the clean 429 the client is designed around (L162).

The through-line: **rate limiting is the budget layer between demand and cost** — it shapes usage into the provider's capacity and your margins, and it's where "unlimited AI" becomes "designed AI".

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "Rate limiting is the AI budget: the provider's TPM/RPM limits and my per-user caps, enforced at the gateway before the call (L158, L172)."
2. **The order.** "My caps first — per user, feature, tenant (L318) — then the token budget (L149), then the provider's limits. The request leaves the gateway only when every budget says it can."
3. **The boundary.** "Queue what can wait (L222), back off a provider 429 with Retry-After (L169), and reject over-my-cap cleanly (L162)."
4. **The why.** "It's cost control (L150) and abuse protection (L318) in one layer — the difference between shaped demand and discovered bills."

## 7. Senior-Level Insights

- **The gateway is the only place both budgets live (L158, L172).** Your caps and the provider's limits are checked in one layer, before the call — that placement is what makes rate limiting a *control* rather than a 429 handler.
- **Per-tenant caps are the SaaS economics (L357, L318).** In a multi-tenant AI product, the per-tenant budget *is* the business model — free tiers, quotas, upgrades. The gateway's caps are the pricing in code (L150).
- **The queue is the batch-shaped answer (L222).** Interactive traffic rejects or backs off; batch work queues into the provider's RPM. Shaping by workload type is the senior design.
- **Rate limiting and retries compose (L169).** A 429 is respected, not retried-into; the retry policy (L169) and the rate budget (this lesson) are two policies that must agree — backoff schedules are sized against the limits.
- **The limits are *observed*, not assumed (L332, L328).** Provider limits vary by tier and change; your usage logs (L332) show the real headroom. The rate budget is a measured number, re-tuned (L341).

## 8. Common Mistakes

- **Handling 429s as retryable.** Hammering the provider (L169) — a 429 is respected with Retry-After, not retried into (L168).
- **No per-user caps.** One runaway user burns the shared TPM and the bill (L318, L150).
- **Enforcement after the call.** Discovering the 429 instead of shaping demand at the gateway (L158, L172).
- **One limit for all workloads.** Chat and batch shaped the same — interactive traffic queues, batch traffic 429s (L222).
- **Ignoring the token budget (L149).** Rate-limited per request but not per token — a request that's 10× the token budget still consumes 10× TPM.
- **429 as a crash.** The user sees an error instead of a clean limit message (L162) — the boundary response is designed UX.

## 9. Best Practices

- **Enforce at the gateway, before the call** (L158, L172) — your caps, then the token budget (L149), then the provider's limits.
- **Design per-user, per-feature, per-tenant caps** (L318) — the product and the cost control (L150).
- **Shape by workload**: queue batch (L222), back off interactive (L169), reject cleanly (L162).
- **Respect `Retry-After`** on provider 429s (L168) — never retry into a limit.
- **Observe the real limits** (L332) — usage logs show headroom; re-tune (L341).
- **Make the 429 a designed state** (L162) — the user knows their limit and when it resets.

## 10. Interview Questions

**Q: What are the provider's rate limits, and how do you manage them?**
> A: TPM (tokens per minute) and RPM (requests per minute), often per model and tier (L148). I manage them by budgeting against them: my gateway (L158, L172) enforces my own caps and token budgets first (L149), so the aggregate traffic stays inside the provider's limits — and when a 429 does come, it's respected with Retry-After (L168), never retried into (L169).

**Q: How do you rate-limit your own users?**
> A: Per-user, per-feature, and per-tenant caps (L318), enforced at the gateway before the call. Per-user protects the product (free-tier limits), per-tenant protects the business (the shared bill, L357). The caps are the pricing and the abuse shield in code (L150).

**Q: What happens at the boundary — when a limit is hit?**
> A: It depends on which limit (L168). Over *my* cap → a clean 429 the client is designed around (L162), with the reset time. Provider 429 → respect Retry-After, back off (L169). Batch work → queue into the provider's RPM (L222). The boundary is three designed responses, not one error.

**Q: How do rate limiting and cost control relate (L150)?**
> A: They're the same budget at two scales. The per-request token budget (L149) controls the cost of one call; the per-user/per-tenant rate caps (L318) control the cost of demand. Together they're the cost model (L150) with enforcement — the difference between shaped usage and discovered bills.

## 11. Follow-Up Questions

- How do TPM and RPM differ, and which bites first (L148)?
- How do per-tenant caps work in a multi-tenant SaaS (L357)?
- How do the retry policy and the rate budget compose (L169)?
- When is a queue the right boundary response (L222)?
- How do you observe and re-tune the limits (L332, L341)?

## 12. Comparison Table — The Budget Layers

| Layer | What it limits | Enforced | The boundary |
|---|---|---|---|
| Per-user caps | requests/user | gateway (L172) | clean 429 (L162) |
| Per-tenant caps | usage/tenant | gateway (L357) | quota + upgrade (L318) |
| Token budget (L149) | tokens/request | gateway | trim or reject (L149) |
| Provider TPM/RPM | aggregate | provider | Retry-After + backoff (L169) |

The senior read: **the layers compose in order** — your caps, your budget, the provider's capacity — and each has a designed boundary response.

## 13. Code Example — The Gateway's Rate-Limit Gates

```js
// Rate limiting at the gateway: your caps → token budget → provider headroom.
export async function POST(req) {
  const { userId, tenantId } = await auth(req);       // L172

  // 1 · YOUR caps — per user and per tenant (L318, L357).
  const userQuota = await rateLimit(`user:${userId}`, { max: 30, window: '1h' });
  if (!userQuota.ok) return error(429, { message: 'Message limit reached — resets at ' + userQuota.resetsAt, code: 'user-quota' });

  const tenantQuota = await rateLimit(`tenant:${tenantId}`, { max: 50_000, window: '1d' });
  if (!tenantQuota.ok) return error(429, { message: 'Workspace quota reached.', code: 'tenant-quota' });

  // 2 · YOUR token budget (L149) — reject BEFORE it consumes TPM.
  const budget = budgetRequest(await req.json());
  if (!budget.ok) return error(429, { message: 'Request over token budget.', code: 'token-budget' });

  // 3 · PROVIDER headroom — near the TPM/RPM limit? Back off (L169).
  const headroom = await providerHeadroom(model);
  if (!headroom.ok) {
    await sleep(headroom.retryAfterMs);               // respect, don't hammer (L168)
    return retryOrQueue(req, 'batch' in req);          // queue batch, retry interactive
  }

  return streamText({ ...budget.call });
}
```

```text
What the reader must SEE — the gates, in order:

  user/tenant caps → clean 429 (L318, L162)
  token budget     → reject before TPM (L149)
  provider headroom → back off, don't hammer (L169)

  The request leaves the gateway only when every budget says it can.
```

```narrate
6-8: Per-user caps — the product's door policy, a clean 429 with a reset time (L318, L162).
9-11: Per-tenant caps — the SaaS economics, protecting the shared bill (L357).
13-15: The token budget (L149) rejects before it consumes provider TPM.
17-21: Provider headroom is respected — back off with Retry-After, never hammer (L168, L169).
```

> [!TIP]
> The senior detail is the *order* and the *distinct 429s*: **your caps first (clean rejection), the provider's capacity second (respectful backoff).** Confusing the two is how apps either hammer providers or frustrate their own users.

## 14. Performance Notes

- **The gateway gates TTFT (L151)** — the rate-limit check must be microseconds (a Redis counter, L243), or it eats the latency budget (L145).
- **Rate limiting is the cost control's enforcement (L150)** — a capped user can't run a bill; the caps are the cost model with teeth.
- **The queue is the batch-throughput lever (L222)** — shaping batch work into the provider's RPM maximizes throughput without 429s (L169).
- **The limits are observed, not guessed (L332)** — usage logs (L332) and 429 counts (L329) tune the real budget; the provider's numbers change with tier (L148).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Sporadic provider 429s | Aggregate near the TPM/RPM limit | Add gateway headroom checks; queue batch (L222) |
| One user burns the bill | No per-user caps (L318) | Add per-user + per-tenant caps |
| Requests rejected wrongly | Own-cap 429 treated as provider 429 (L168) | Distinguish the two; design each response |
| Batch jobs 429 into the provider | No queue (L222) | Queue batch work into the RPM budget |
| TTFT creeping up | Rate-limit check too slow (L151) | Move the counter to Redis (L243); keep it fast |

## 16. Quick Revision Notes

- Rate limiting = **the AI budget**: provider TPM/RPM + your per-user/tenant caps (L318), enforced at the gateway (L158, L172).
- Order: **your caps → token budget (L149) → provider headroom.**
- Boundary: **queue** batch (L222), **back off** provider 429s (L169), **reject cleanly** over-your-cap (L162).
- The **two 429s** — your cap (product) vs the provider's (capacity) — have different responses (L168).
- It's **cost control (L150) and abuse protection (L318)** in one layer.
- The limits are **observed (L332), not assumed** — re-tune from usage.

## 17. Cheat Sheet

```text
RATE LIMITING = the budget layer between demand and cost

THE LIMITS
  provider   TPM · RPM (per model/tier, L148) — capacity
  yours      per-user · per-feature · per-tenant (L318) — policy
  tokens     per-request ledger (L149) — cost of one call

THE ORDER (at the gateway, L158, L172)
  1 your caps          over → clean 429 + reset time (L162)
  2 token budget       over → trim or reject (L149)
  3 provider headroom  near → back off / queue (L169, L222)

THE TWO 429s (L168)
  your cap      → a product decision: reject cleanly (L162)
  provider      → a capacity fact: respect Retry-After (L169)

RULES
  enforce before the call, not after the 429 (L158)
  shape by workload: queue batch, back off interactive (L222)
  caps are the pricing + abuse shield in code (L150, L318)
  observe the limits (L332), re-tune (L341)

INTERVIEW, 4 MOVES
  1 frame    "the provider's capacity + my policy"
  2 order    "my caps → token budget → provider headroom"
  3 boundary "queue, back off, reject cleanly"
  4 why      "cost control + abuse shield (L150, L318)"
```

## 18. Key Takeaways

> [!RECAP]
> - Rate limiting is **the AI budget**: the provider's TPM/RPM limits and your per-user/tenant caps (L318), enforced at the gateway before the call (L158, L172)
> - The order is **your caps → the token budget (L149) → the provider's headroom** — a request leaves the gateway only when every budget says it can
> - **The two 429s have different responses** (L168): over *your* cap is a clean rejection (L162); the provider's limit is respected with Retry-After (L169)
> - The boundary is **queue for batch (L222), back off for interactive (L169), reject cleanly for policy** (L162)
> - It's **cost control (L150) and abuse protection (L318) in one layer** — the pricing in code for an AI SaaS (L357)
> - **The limits are observed, not assumed** (L332) — usage logs and 429 counts (L329) tune the real budget (L341)

## Check your understanding

Answer these without looking back.

1. What are TPM and RPM, and where do they live (L148)?
2. Name the three budget layers and their order at the gateway.
3. What's the difference between the two 429s (L168)?
4. What are the three boundary responses, and when is each right?
5. Why are per-tenant caps the SaaS economics (L357, L318)?
6. How do rate limiting and retries compose (L169)?
7. Why is the gateway the only place both budgets live (L158, L172)?
8. How do you observe and re-tune the limits (L332, L341)?

## A Closing Note — The Budget That Shapes Demand

You now hold the layer that shapes demand into capacity and margins: **provider TPM/RPM, your per-user caps, the token budget, and three designed boundary responses** — enforced at the gateway (L158, L172), observed from usage (L332), and re-tuned like any budget (L341). It's the cost control (L150) and the abuse shield (L318) in one.

Next: the lever that removes the call entirely — caching LLM responses (L171), the biggest latency and cost win in the stack.
