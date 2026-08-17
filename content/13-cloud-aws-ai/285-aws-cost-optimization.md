# Lesson 285 — AWS Cost Optimization for AI

**Interview importance:** ⭐⭐⭐⭐⭐ — "what does the AI stack cost, and how do you control it?" — the answer is *the cost architecture*: the model spend, the provisioned throughput, and the bill as a design (L285).**

L150 built the cost discipline (L150) and L334 the cost tracking (L334); this lesson is **its AWS implementation**: the AWS cost optimization for AI — the model spend (the tokens and the provisioned throughput, L285), the compute (the Lambda and the ECS, L285), the storage (the S3 classes and the lifecycle, L265), and the bill (the budget and the anomaly detection, L285). The AI platform's shape: the L282 patterns (L282) costed (L285) — the tokens (L332), the invocations (L266), the storage (L183), and the data transfer (L285). This lesson is the L150 cost discipline, AWS-shaped (L285).

The distinction this lesson is built on: a **demo** ignores the bill. A **solutions architect** designs the cost (L285): the model spend (L285), the compute (L285), and the storage (L285) — the bill as architecture (L285).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the model spend: the tokens and the provisioned (L285)
- Explain the compute: the Lambda and the ECS (L285)
- Explain the storage: the S3 classes and the lifecycle (L265)
- Explain the bill: the budgets and the anomalies (L285)
- Explain the AI shape: the L282 patterns, costed (L285)

## 1. One-Line Definition

**The AWS cost optimization for AI is the model spend, the provisioned throughput, and the AWS bill as architecture (L285) — the model spend (the tokens L332, the on-demand vs the provisioned L278, the caching L171), the compute (the Lambda L266 — the invocations and the concurrency; the ECS L271 — the running tasks; the spot L285), the storage (the S3 classes L265 and the lifecycle, the RDS L268 sizing), and the bill (the budgets L285, the anomaly detection L285, the per-tenant attribution L334) — the L150 cost discipline, AWS-shaped (L285).**

The one-sentence interview answer: *"The AWS AI cost is architecture (L285). The model spend (L285) is the biggest line (L285): the tokens (L332) — the model's choice (L148) is the price's (L150); the provisioned throughput (L278) for the steady load (L278) at the committed price (L285); and the caching (L171) cutting the repeated calls (L285). The compute (L285): the Lambda (L266) — the invocations and the concurrency (L266); the ECS (L271) — the running tasks (L271); the spot instances (L285) for the tolerant work (L264). The storage (L285): the S3 classes (L265) and the lifecycle (L265) — the hot fast, the cold cheap (L265); the RDS (L268) — the sizing and the IOPS (L268). The bill (L285): the budgets (L285) with the alerts (L274), the anomaly detection (L285), and the per-tenant attribution (L334) — the L334 cost tracking (L334), AWS-shaped (L285). The AI shape (L285): the L282 patterns (L282) costed (L285) — the chat's tokens (L332), the RAG's storage (L183), the batch's invocations (L266) — the bill (L285) as the design's feedback (L285)."*

## 2. Mental Model

Think of the AWS cost as **the restaurant's budget ledger.** The ledger (the bill, L285) tracks the spending (L285): the ingredients (the model tokens, L332) are the biggest line (L150) — the premium ingredients (the frontier models, L148) cost more, and the bulk deals (the provisioned throughput, L278) cut the price (L285). The staff (the compute, L285) — the per-dish cooks (the Lambdas, L266) paid per dish (the invocations, L285), the full-time chefs (the ECS tasks, L271) paid per shift (L285), and the part-timers (the spot, L285) for the busy nights (L285). The pantry (the storage, L265): the fresh items (the hot S3, L265) on the front shelves, the frozen (the cold classes, L265) in the back, the archive (the Glacier, L265) in the cellar (L265). And the owner (the budget, L285) reviews the ledger weekly (L285): the anomalies flagged (L285), the lines attributed (L334). The restaurant works because the biggest line is watched, the staff is matched, and the ledger is reviewed (L285).

```text
   the ledger (the AWS bill, L285)
   ┌────────────────────────────────────────────────────────┐
   │ the ingredients (the tokens, L332) — the biggest line  │
   │ (L150), the provisioned deals (L278)                   │
   │ the staff (the compute, L285) — the invocations (L266),│
   │ the tasks (L271), the spot (L285)                      │
   │ the pantry (the storage, L265) — the classes, the      │
   │ lifecycle (L265)                                       │
   │ the review (the budgets, L285) — the anomalies (L285)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the ledger**: the ingredients, the staff, the pantry, and the review (L285).

## 3. Visual Flow — The Bill's Anatomy

```text
   THE BILL (L285)
   ┌────────────────────────────────────────────────────────┐
   │ THE MODEL (L285) — the biggest line (L150)             │
   │  the tokens (L332): the model's choice (L148)          │
   │  the provisioned (L278) for the steady (L285)          │
   │  the cache (L171) cutting the repeats (L285)           │
   ├────────────────────────────────────────────────────────┤
   │ THE COMPUTE (L285)                                     │
   │  the Lambda (L266): the invocations, the concurrency   │
   │  the ECS (L271): the running tasks · the spot (L285)   │
   ├────────────────────────────────────────────────────────┤
   │ THE STORAGE (L285)                                     │
   │  the S3 (L265): the classes + the lifecycle (L265)     │
   │  the RDS (L268): the sizing + the IOPS (L268)          │
   ├────────────────────────────────────────────────────────┤
   │ THE CONTROLS (L285)                                    │
   │  the budgets (L285) · the anomalies (L285) · the       │
   │  attribution (L334)                                    │
   └────────────────────────────────────────────────────────┘
```

The flow is the bill's anatomy: **model → compute → storage → controls** (L285).

## 4. How It Works — The Cost, Part by Part

- **The model spend (L285).** The biggest line (L150): the tokens (L332) — the model's choice (L148) is the price's (L150); the on-demand (L278) for the variable, the provisioned (L278) for the steady (L285); and the caching (L171) cutting the repeated calls (L285).
- **The compute (L285).** The Lambda (L266) — the invocations and the concurrency (L266), with the reserved concurrency (L266) capping the cost (L285); the ECS (L271) — the running tasks (L271) and the Fargate's vCPU and memory (L271); the spot (L285) for the tolerant work (L264).
- **The storage (L285).** The S3 (L265) — the classes (L265) and the lifecycle (L265): the hot fast, the cold cheap, the Glacier for the archive (L265); the RDS (L268) — the sizing (L268), the IOPS (L268), and the multi-AZ (L261).
- **The bill (L285).** The budgets (L285) with the alerts (L274); the anomaly detection (L285); and the attribution (L334) — the per-tenant and the per-feature cost (L334).
- **The data transfer (L285).** The egress (L285) — the data out of the region (L261) — the CloudFront (L272) and the endpoints (L263) cut it (L285).

> [!NOTE]
> **The cost is the design's feedback (L285).** The senior answer treats the bill (L285) as the architecture's feedback (L285): the tokens (L332) tell the model's choice (L148); the invocations (L266) tell the caching's hit rate (L171); the storage (L183) tells the lifecycle's (L265); the attribution (L334) tells the per-tenant health (L320). The L150 discipline (L150) — the decision rule (L157) — is the AWS bill's (L285).

## 5. Real Project Usage

- **A streaming chat (L282).** The tokens (L332) — the model's choice (L148) for the latency and the price (L157); the cache (L171) for the repeated prompts (L285).
- **A batch processor (L282).** The spot (L285) for the workers (L266) — the interruption (L285) tolerated (L264); the provisioned (L278) for the steady throughput (L285).
- **A RAG platform (L280).** The S3 classes (L265) for the documents (L285); the embeddings' storage (L183) sized (L285).
- **A multi-tenant SaaS (L357).** The per-tenant attribution (L334) — the tokens per tenant (L332), the cost per tenant (L334) — the L320 tenants (L320) costed (L285).
- **Anything AI on AWS (L285).** The bill as architecture (L285) — the model, the compute, and the storage designed (L285).

The through-line: **the bill is the design's feedback** — the model watched, the compute matched, the storage tiered (L285).

## 6. Interview Explanation

Say it in four moves:

1. **The model.** "The tokens (L332) — the model's choice (L148); the provisioned (L278) for the steady (L285)."
2. **The compute.** "The invocations (L266) and the tasks (L271); the spot (L285) for the tolerant (L264)."
3. **The storage.** "The S3 classes (L265) and the lifecycle (L265)."
4. **The bill.** "The budgets (L285), the anomalies (L285), and the attribution (L334)."

## 7. Senior-Level Insights

- **The model is the biggest lever (L150).** The tokens (L332) — the model's choice (L148) is the price's (L150); the routing (L155) — the cheap model for the simple, the frontier for the hard (L157) — is the senior's (L285).
- **The provisioned is the commitment's trade (L278).** The steady load (L278) on the provisioned (L278) — the committed price (L285) for the predictable (L285).
- **The cache is the cost's multiplier (L171).** The response cache (L171) — the repeated prompts (L171) skip the model (L278) — the hit rate (L269) is the bill's (L285).
- **The attribution is the pricing's input (L334).** The per-tenant cost (L334) — the L334 tracking (L334) feeds the pricing (L285) — the L332 metering (L332) is the SaaS's (L285).
- **The spot is the tolerant's discount (L285).** The batch (L282) and the training (L365) on the spot (L285) — the interruption (L285) tolerated (L264).

## 8. Common Mistakes

- **The frontier model everywhere (L150).** The top model for every call (L150) — the routing (L155) and the fallback (L157) cut the bill (L285).
- **The on-demand for the steady (L278).** The pay-per-token (L150) at the scale (L285) — the provisioned (L278) is the cost lever (L285).
- **The cache missing (L171).** The repeated prompts (L171) re-calling the model (L278) — the L171 cache (L171) is the bill's (L285).
- **The single S3 class (L265).** Everything in the Standard (L265) — the lifecycle (L265) is the storage's cost (L285).
- **The bill unattributed (L334).** The cost untracked (L334) — the per-tenant health (L320) invisible (L285).

## 9. Best Practices

- **Route the models** (L155) — the cheap for the simple, the frontier for the hard (L157).
- **Provision the steady** (L278) — the committed price (L285).
- **Cache the repeats** (L171) — the hit rate (L269) is the bill's (L285).
- **Tier the storage** (L265) — the classes and the lifecycle (L265).
- **Attribute the cost** (L334) — the per-tenant and the per-feature (L334).

## 10. Interview Questions

**Q: What drives the AWS AI cost?**
> A: Four lines (L285). The model — the tokens (L332), the biggest (L150). The compute — the invocations (L266) and the running tasks (L271). The storage — the S3 classes (L265) and the RDS sizing (L268). And the data transfer (L285) — the egress out of the region (L261).

**Q: How do you cut the model spend?**
> A: Three levers (L285): the routing (L155) — the cheap model for the simple calls, the frontier (L148) for the hard (L157); the provisioned throughput (L278) for the steady load (L278) at the committed price (L285); and the caching (L171) — the repeated prompts (L171) never re-call the model (L285).

**Q: How do you control the compute cost?**
> A: By the shape (L285): the Lambda (L266) — the reserved concurrency (L266) caps the invocations (L285); the ECS (L271) — the Fargate's vCPU and memory (L271) matched to the task (L285); and the spot (L285) for the tolerant work — the batch (L282) and the training (L365) (L285).

**Q: How do you attribute the cost?**
> A: The L334 way (L334): the per-request tokens (L332) and the cost (L334) recorded (L274), the tags (L285) on the resources — the tenant (L320) and the feature — and the per-tenant view (L334) in the bill (L285). The attribution (L334) feeds the pricing (L285).

## 11. Follow-Up Questions

- What drives the cost (L285)?
- How do you cut the model spend (L285)?
- How do you control the compute (L285)?
- What's the provisioned trade (L278)?
- How do you attribute the cost (L334)?

## 12. Comparison Table — The Cost Levers

| Line (L285) | The lever (L285) | The AI use (L285) |
|---|---|---|
| The model (L150) | the routing (L155), the provisioned (L278), the cache (L171) | the tokens (L332) |
| The compute (L285) | the concurrency (L266), the Fargate sizing (L271), the spot (L285) | the invocations (L266) |
| The storage (L285) | the S3 classes (L265), the lifecycle (L265), the RDS sizing (L268) | the documents (L265), the vectors (L183) |
| The transfer (L285) | the CloudFront (L272), the endpoints (L263) | the streams (L251), the APIs (L267) |

The senior read: **each line has a lever** — the model routed, the compute matched, the storage tiered (L285).

## 13. Code Example — The Cost, Designed

```js
// The cost design (L285) — the levers, applied (L285).
// THE MODEL ROUTING (L155) — the cheap for the simple (L157).
function modelFor(request) {
  if (request.simple) return 'amazon.titan-text-lite';   // the cheap (L150)
  return 'anthropic.claude-3-5-sonnet';                  // the frontier (L148)
}

// THE CACHE (L171) — the repeated prompts never re-call (L285).
async function chatWithCache(req) {
  const hit = await cache.get(req.hash);      // the cache (L171, L269)
  if (hit) return hit;                        // the hit — the model skipped (L285)
  const out = await bedrock.invoke({ modelId: modelFor(req) });
  await cache.set(req.hash, out, 'EX', 3600); // the TTL (L244)
  return out;
}

// THE PROVISIONED (L278) — the steady load at the committed price (L285).
const steady = { mode: 'provisioned', throughput: 100, commitment: '1yr' };

// THE SPOT (L285) — the tolerant batch (L282).
const batch = { compute: 'spot', interruption: 'tolerated' };  // L285

// THE BUDGET (L285) — the alert at 80% (L274).
const budget = { limit: 5000, alert: { at: 80, action: 'sns' } };
```

```text
What the reader must SEE — the design, applied:

  modelFor(req)        → the routing: the cheap vs the frontier (L155, L148)
  cache.get/set        → the repeated prompts skipped (L171, L285)
  provisioned + 1yr    → the steady at the committed price (L278, L285)
  spot + tolerated     → the batch's discount (L285)
  budget at 80%        → the alert (L274)

  The model routed, the compute matched, the bill watched (L285).
```

```narrate
3-6: The routing — the simple calls get the cheap model, the hard get the frontier (L155, L148).
8-13: The cache — the repeated prompts skip the model (L171, L285).
15-16: The provisioned — the steady load at the committed price (L278, L285).
18-19: The spot — the tolerant batch at the discount (L285).
21-22: The budget — the alert at 80% (L274, L285).
```

> [!TIP]
> The pair that defines the cost design: **the model routing** (the cheap vs the frontier, L155) and **the budget alert** (the bill watched, L285). **Route the models, cache the repeats, watch the bill — the L150 discipline, AWS-shaped (L285).**

## 14. Performance Notes

- **The routing is the cost and the latency (L157).** The cheap model (L150) is the faster (L151) — the routing (L155) serves both (L285).
- **The cache is the cost and the TTFT (L171).** The hit (L171) — the model skipped (L278), the response instant (L151).
- **The provisioned is the latency's control (L278).** The reserved capacity (L278) — the predictable latency (L333) at the committed price (L285).
- **The spot is the throughput's cost (L285).** The interruption (L285) — the batch (L282) and the training (L365) tolerate it (L264).

## 15. Debugging Scenarios

| Symptom | First check (L285) | The lever |
|---|---|---|
| The bill spikes | The model spend (L332) | The routing (L155), the cache (L171) |
| The steady load overpays | The inference mode (L278) | The provisioned (L278) |
| The storage bill grows | The S3 classes (L265) | The lifecycle (L265) |
| The compute is idle | The tasks (L271) | The Fargate sizing (L271), the spot (L285) |
| The cost is unattributable | The tags (L285) | The per-tenant attribution (L334) |

## 16. Quick Revision Notes

- The AWS cost for AI = **the model + the compute + the storage + the bill** (L285).
- The model: **the tokens (L332) — the routing (L155), the provisioned (L278), the cache (L171)**.
- The compute: **the invocations (L266), the tasks (L271), the spot (L285)**.
- The storage: **the S3 classes (L265) and the lifecycle (L265)**.
- The bill: **the budgets (L285), the anomalies (L285), the attribution (L334)**.

## 17. Cheat Sheet

```text
AWS COST OPTIMIZATION FOR AI = the bill as architecture

THE MODEL (L285) — THE BIGGEST LINE (L150)
  the tokens (L332) — the model's choice (L148)
  the routing (L155) — the cheap for the simple (L157)
  the provisioned (L278) — the steady at the committed price (L285)
  the cache (L171) — the repeats skipped (L285)

THE COMPUTE (L285)
  the Lambda (L266) — the invocations, the concurrency (L266)
  the ECS (L271) — the running tasks, the Fargate sizing (L271)
  the spot (L285) — the tolerant work: the batch (L282), the training (L365)

THE STORAGE (L285)
  the S3 (L265) — the classes + the lifecycle (L265)
  the RDS (L268) — the sizing + the IOPS (L268)
  the vectors (L183) — the index sized (L285)

THE BILL (L285)
  the budgets (L285) with the alerts (L274)
  the anomaly detection (L285) · the tags (L285)
  the per-tenant attribution (L334)

INTERVIEW, 4 MOVES
  1 model  "the tokens — the biggest line (L332, L150)"
  2 compute "the invocations, the tasks, the spot (L285)"
  3 storage "the S3 classes and the lifecycle (L265)"
  4 bill   "the budgets, the anomalies, the attribution (L285)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AWS cost optimization for AI is **the model spend, the provisioned throughput, and the AWS bill as architecture** (L285): the model (L285), the compute (L285), the storage (L265), and the bill (L285)
> - **The model** (L285) is the biggest line (L150) — the tokens (L332), the routing (L155) — the cheap for the simple (L157) — the provisioned throughput (L278) for the steady (L285), and the caching (L171) cutting the repeats (L285)
> - **The compute** (L285) — the Lambda's invocations and concurrency (L266), the ECS's running tasks (L271), and the spot (L285) for the tolerant work (L264)
> - **The storage** (L285) — the S3 classes (L265) and the lifecycle (L265), and the RDS sizing (L268)
> - **The bill** (L285) — the budgets with the alerts (L274), the anomaly detection (L285), and the per-tenant attribution (L334)
> - The bill is **the design's feedback** (L285): the tokens (L332) tell the model's choice (L148), the hit rate (L269) tells the caching (L171), the attribution (L334) tells the per-tenant health (L320) — the L150 discipline (L150), AWS-shaped (L285)

## Check your understanding

Answer these without looking back.

1. What drives the cost (L285)?
2. How do you cut the model spend (L285)?
3. What's the provisioned trade (L278)?
4. How do you control the compute (L285)?
5. What's the storage design (L265)?
6. How do you attribute the cost (L334)?
7. What's the bill as feedback (L285)?
8. What is the L150 discipline, AWS-shaped (L285)?

## A Closing Note — The Ledger, Balanced

You now hold the cost design: **the model, the compute, the storage, and the bill — with the levers named and the attribution in place.** The AWS stack has its budget — and the ledger is watched (L285).

Next: the replication, the failover, and the RTO/RPO — Multi-Region & DR on AWS (L286).
