# Lesson 357 — Multi-Tenant AI SaaS

**Interview importance:** ⭐⭐⭐⭐⭐ — "the capstone shape: tenant isolation over prompts, vectors, and caches" — the answer is *the SaaS design*: the tenants, the isolation, and the economics (L357).**

L320 built the isolation and L347 the protocol; this lesson is **the protocol run on the capstone shape**: the multi-tenant AI SaaS — the tenant isolation over the prompts, the vectors, and the caches (L357): the design (the protocol L347 run, L357), the tenants (L320), the isolation (L320), and the economics (L334). The AI shape (L173): the SaaS (L357) — the tenants (L320) with the isolation (L320) and the pricing (L332). This lesson is the capstone's design (L357).

The distinction this lesson is built on: a **junior** describes the app. A **solutions architect** designs the tenancy (L357): the isolation (L320), the per-tenant (L320) data, and the economics (L334) — the protocol (L347) run on the SaaS (L357).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the SaaS's requirements (L357)
- Explain the tenants: the models (L320)
- Explain the isolation: the prompts, the vectors, the caches (L320)
- Explain the economics: the pricing and the cost (L334)
- Explain the AI shape: the capstone shape (L357)

## 1. One-Line Definition

**The multi-tenant AI SaaS is the protocol run on the capstone shape (L357) — the clarify (the users L162, the tenants L320, the pricing L332, L357), the tenants (the per-tenant L320 workspaces: the models L148, the prompts L312, the data L313, L357), the isolation (the L320 discipline over the prompts L320, the vectors L183, and the caches L269, L357), and the economics (the pricing L332: the per-seat L357 and the per-token L332; the cost L334: the per-tenant L334 attribution, L357) — the SaaS (L357), the capstone shape (L357).**

The one-sentence interview answer: *"The multi-tenant AI SaaS is the protocol, run on the capstone shape (L357). The clarify (L357): the users (L162) — the tenants' (L320) users (L357); the tenants (L320) — the customers (L357); the pricing (L332) — the plans (L357); and the scale (L357) — the tenants (L357) and the requests (L357). The tenants (L357): the per-tenant (L320) workspaces (L357) — the models (L148), the prompts (L312), the data (L313) — the tenant's (L320) own (L357). The isolation (L320): the L320 discipline (L320) — the prompts (L320): the tenant ID (L320) in the context (L357); the vectors (L183): the per-tenant (L320) indexes (L357); and the caches (L269): the per-tenant (L320) keys (L357) — the L320 isolation (L320), capstone-shaped (L357). The economics (L334): the pricing (L332) — the per-seat (L357) and the per-token (L332); the cost (L334) — the per-tenant (L320) attribution (L334) — the margin (L334) per tenant (L357). The AI shape (L173): the SaaS (L357) — the tenants (L320), the isolation (L320), and the economics (L334) — the capstone shape (L357)."*

## 2. Mental Model

Think of the multi-tenant SaaS as **the apartment tower.** The tower (the SaaS, L357) has the apartments (the tenants, L320): each apartment (L357) has its own key (the tenant ID, L320), its own furniture (the models, L148), its own files (the data, L313), and its own pantry (the cache, L269) — the locked doors (the isolation, L320) between (L320). The management (the platform, L357): the leases (the pricing, L332) — the apartment's (L357) rent (the per-seat, L357) and the utilities (the per-token, L332); and the meter (the cost, L334) — each apartment's (L320) usage (L332) billed (L357). The tower works because the doors are locked, the leases are clear, and the meters are per-apartment (L357).

```text
   the tower (the SaaS, L357)
   ┌────────────────────────────────────────────────────────┐
   │ the apartments (the tenants, L320) — the keys (L320),  │
   │ the files (L313), the pantries (L269)                  │
   │ the locked doors (the isolation, L320)                 │
   │ the leases (the pricing, L332) · the meters (the       │
   │ cost, L334)                                            │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the tower**: the apartments, the locks, and the meters (L357).

## 3. Visual Flow — One Tenant's Request

```text
   the tenant A's user (L162)
        │  the tenant ID: A (L320)
        ▼
   ┌────────────────────── THE GATEWAY (L267) ──────────────────────────┐
   │  the auth (L319): the user's key → the tenant (L320)              │
   │  the quota (L149): the tenant's budget (L357)                     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ISOLATION (L320) ────────────────────────┐
   │  the prompt: the tenant A's context (L357)                        │
   │  the vectors: the tenant A's index (L183, L320)                   │
   │  the cache: the tenant A's key (L269, L320)                       │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ECONOMICS (L334) ────────────────────────┐
   │  the tokens (L332) → the cost (L334) → the tenant A's meter (L357)│
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the tenant: **auth → isolation → economics** (L357).

## 4. How It Works — The Capstone, Part by Part

- **The clarify (L357).** The users (L162), the tenants (L320), the pricing (L332), the scale (L357).
- **The tenants (L357).** The per-tenant (L320) workspaces (L357): the models (L148), the prompts (L312), the data (L313).
- **The isolation (L320).** The L320 discipline (L320): the prompts (L320), the vectors (L183), the caches (L269) — the tenant ID (L320) everywhere (L357).
- **The economics (L334).** The pricing (L332) and the cost (L334): the per-tenant (L320) attribution (L334).

> [!NOTE]
> **The isolation is the capstone's load-bearing wall (L357).** The senior answer names the wall (L357): the multi-tenant SaaS (L357) lives on the isolation (L320) — the tenant A (L320) never sees the tenant B's (L320) prompts (L312), vectors (L183), or caches (L269) (L357). The wall (L320) is enforced at the data layer (L357) — the tenant ID (L320) in the indexes (L183) and the filters (L189) — not just the app (L357). The L320 discipline (L320) is the L357 capstone's (L357) foundation (L357).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The tenants (L320), the isolation (L320), the economics (L334).
- **A RAG SaaS (L349).** The per-tenant (L320) indexes (L183) — the isolation (L320).
- **A chat SaaS (L348).** The per-tenant (L320) sessions (L237) and the caches (L269).
- **An agent SaaS (L279).** The per-tenant (L320) tools (L315) and the approvals (L324).
- **Anything SaaS (L357).** The capstone shape (L357) — the tenants, the isolation, the economics (L357).

The through-line: **the capstone is the SaaS's** — the tenants, the wall, and the meters (L357).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The users, the tenants, the pricing, the scale (L357)."
2. **The tenants.** "The per-tenant workspaces — the models, the prompts, the data (L357)."
3. **The isolation.** "The L320 discipline — the prompts, the vectors, the caches (L320)."
4. **The economics.** "The per-token pricing (L332) and the per-tenant cost (L334)."

## 7. Senior-Level Insights

- **The wall is the data layer's (L357).** The tenant ID (L320) in the indexes (L183) and the filters (L189) — the isolation (L320) at the data (L357), not the app (L357).
- **The per-tenant cost is the pricing's (L334).** The tokens (L332) per tenant (L320) — the L334 attribution (L334) — the per-tenant (L320) margin (L357).
- **The quota is the tenant's budget (L149).** The per-tenant (L320) cap (L149) — the 429 (L318) — the abuse (L317) bounded (L357).
- **The shared pool is the economics (L285).** The shared (L357) infrastructure (L285) — the per-tenant (L320) usage (L332) — the scale's (L358) cost (L285).
- **The eval is the SaaS's quality (L341).** The per-tenant (L320) evals (L341) — the golden sets (L342) per tenant (L357).

## 8. Common Mistakes

- **The shared index (L320).** The one vector index (L183) — the cross-tenant (L320) retrieval (L189) — the filter (L189) is the wall (L357).
- **The shared cache (L269).** The one cache (L269) — the tenant A's (L320) response to the tenant B (L357) — the key (L320) is the wall (L357).
- **The app-only isolation (L357).** The tenant check (L320) in the controller (L357) — the data layer (L357) un-walled (L357).
- **The un-metered tenants (L334).** The usage (L332) un-attributed (L334) — the pricing (L332) and the margin (L357) impossible (L357).
- **The eval-less SaaS (L341).** The per-tenant (L320) quality (L341) un-measured (L341) — the suite (L341) (L357).

## 9. Best Practices

- **Wall the data layer** (L320) — the tenant ID (L320) in the indexes (L183) and the keys (L269).
- **Meter the tenants** (L332) — the tokens (L332) per tenant (L320).
- **Quota the tenants** (L149) — the per-tenant (L320) budget (L357).
- **Price by the usage** (L332) — the per-seat (L357) and the per-token (L332).
- **Eval per tenant** (L341) — the golden sets (L342) per tenant (L320).

## 10. Interview Questions

**Q: Walk me through the multi-tenant AI SaaS.**
> A: The protocol, run on the capstone shape (L357). The clarify — the users, the tenants, the pricing, the scale (L357). The tenants — the per-tenant workspaces (L357). The isolation — the L320 discipline over the prompts, the vectors, the caches (L320). And the economics — the per-token pricing (L332) and the per-tenant cost (L334).

**Q: How do you isolate the tenants?**
> A: The L320 discipline (L320), enforced at the data layer (L357): the tenant ID (L320) in the vector indexes (L183) and the retrieval's filters (L189); the tenant ID (L320) in the cache's keys (L269); and the tenant ID (L320) in the prompts' context (L357). The wall (L320) is the data's (L357), not just the app's (L357).

**Q: How do you price it?**
> A: The two meters (L332): the per-seat (L357) — the users (L162) per tenant (L320); and the per-token (L332) — the usage (L332) metered (L332). The cost (L334) per tenant (L320) — the L334 attribution (L334) — the margin (L334) per tenant (L357) — the pricing (L332) adjusted (L357).

**Q: How does it scale?**
> A: The shared pool (L357): the one platform (L357) — the gateway (L267), the model (L278), the workers (L266) — serving the many tenants (L320), with the isolation (L320) and the quotas (L149) per tenant (L357). The L358 high-scale (L358) — the pooling (L357) and the per-tenant (L320) limits (L357).

## 11. Follow-Up Questions

- What's the clarify (L357)?
- How do you isolate the tenants (L320)?
- How do you price it (L332)?
- How does it scale (L358)?
- What's the wall (L320)?

## 12. Comparison Table — The Single vs the Multi-Tenant

| | The single-tenant (L357) | The multi-tenant (L357) |
|---|---|---|
| The data (L320) | the one set (L357) | the per-tenant (L320) |
| The isolation (L320) | none needed (L357) | the wall (L320) |
| The cost (L285) | the per-instance (L285) | the shared pool (L285) |
| The pricing (L332) | the flat (L357) | the per-seat, the per-token (L332) |

The senior read: **the multi-tenant is the economics** — the pool and the meters (L357).

## 13. Code Example — The Capstone, Applied

```js
// The multi-tenant SaaS (L357) — the isolation and the economics (L357).
// 1 · THE TENANT CONTEXT (L320) — from the auth (L319).
function tenantContext(req) {
  return { tenantId: req.tenantId, userId: req.userId };   // L320, L319
}

// 2 · THE ISOLATION (L320) — at the data layer (L357).
async function retrieve(ctx, query) {
  // THE VECTORS (L183): the per-tenant index (L320).
  return index.search(`tenant:${ctx.tenantId}`, query, {   // L320, L183
    topK: 5,
    filter: { tenantId: { equals: ctx.tenantId } },        // the wall (L189, L357)
  });
}

// 3 · THE CACHE (L269) — the per-tenant key (L357).
const cacheKey = `tenant:${ctx.tenantId}:resp:${hash(query)}`;  // L320, L269

// 4 · THE ECONOMICS (L334) — the per-tenant meter (L357).
async function meter(ctx, usage) {
  const cost = costOf(usage, ctx.model);                   // L334
  await metering.write({ tenantId: ctx.tenantId, tokens: usage, cost });  // L332, L334
  // the per-tenant (L320) margin (L357) — from the meter (L334)
}

// 5 · THE QUOTA (L149) — the per-tenant budget (L357).
const used = await metering.tenantMonth(ctx.tenantId);     // L332
if (used > quotaOf(ctx.tenantId)) return error(429);       // L149, L318
```

```text
What the reader must SEE — the capstone, applied:

  tenantId from the auth       → the context (L319, L320)
  tenant:{id} index + filter   → the vector wall (L183, L189)
  tenant:{id}:resp:{hash}      → the cache wall (L269, L320)
  metering.write per tenant    → the meter (L332, L334)
  tenantMonth > quota → 429    → the budget (L149, L318)

  The wall at the data, the meter per tenant (L357).
```

```narrate
4-6: The context — the tenant ID from the auth (L319, L320).
8-14: The isolation — the per-tenant index and the filter (L183, L189, L320).
16-17: The cache — the per-tenant key (L269, L320).
19-23: The economics — the per-tenant meter (L332, L334).
25-27: The quota — the per-tenant budget enforced (L149, L318).
```

> [!TIP]
> The pair that defines the capstone: **the per-tenant index filter** (the wall, L189) and **the per-tenant meter** (the economics, L334). **Wall the data, key the caches, meter the tokens, quota the tenants — the capstone shape (L357).**

## 14. Performance Notes

- **The pool is the scale's economics (L285).** The shared (L357) platform — the L358 scale (L358) — the cost (L285) per tenant (L357).
- **The wall is the retrieval's speed (L357).** The per-tenant (L320) index (L183) — the filter (L189) narrows (L357).
- **The meter is the batch's (L332).** The per-tenant (L320) usage (L332) — the L334 attribution (L334), batched (L357).
- **The quota is the cost's bound (L149).** The per-tenant (L320) cap (L149) — the bill (L334) bounded (L357).

## 15. Debugging Scenarios

| Symptom | First check (L357) | The lever |
|---|---|---|
| The tenant B sees the tenant A's data | The isolation (L320) | The filter (L189), the index (L183) |
| The tenant B gets the tenant A's cache | The cache (L269) | The per-tenant key (L320) |
| The bill is un-attributable | The meter (L334) | The tokens (L332) per tenant (L320) |
| The one tenant starves the rest | The quota (L149) | The per-tenant cap (L149) |
| The quality drifts per tenant | The evals (L341) | The golden sets (L342) |

## 16. Quick Revision Notes

- The multi-tenant AI SaaS = **the capstone shape** (L357): the clarify, the tenants, the isolation, the economics.
- The clarify: **the users (L162), the tenants (L320), the pricing (L332), the scale (L357)**.
- The tenants: **the per-tenant workspaces (L357)**.
- The isolation: **the L320 discipline over the prompts, the vectors, the caches (L320)**.
- The economics: **the per-token pricing (L332) and the per-tenant cost (L334)**.

## 17. Cheat Sheet

```text
MULTI-TENANT AI SAAS = the capstone shape

THE CLARIFY (L357)
  the users (L162) — the tenants' (L320) users (L357)
  the tenants (L320) · the pricing (L332) · the scale (L357)

THE TENANTS (L357)
  the per-tenant (L320) workspaces (L357)
  the models (L148) · the prompts (L312) · the data (L313)

THE ISOLATION (L320)
  the L320 discipline (L320), enforced at the data layer (L357):
  the prompts (L320) — the tenant ID (L320) in the context (L357)
  the vectors (L183) — the per-tenant (L320) indexes (L357)
  the caches (L269) — the per-tenant (L320) keys (L357)

THE ECONOMICS (L334)
  the pricing (L332) — the per-seat (L357), the per-token (L332)
  the cost (L334) — the per-tenant (L320) attribution (L334)
  the margin (L334) per tenant (L357)

INTERVIEW, 4 MOVES
  1 clarify  "the users, the tenants, the pricing, the scale (L357)"
  2 tenants  "the per-tenant workspaces (L357)"
  3 isolation "the wall over the prompts, the vectors, the caches (L320)"
  4 economics "the per-token pricing, the per-tenant cost (L332, L334)"
```

## 18. Key Takeaways

> [!RECAP]
> - The multi-tenant AI SaaS is **the protocol run on the capstone shape** (L357): the clarify (L357), the tenants (L320), the isolation (L320), and the economics (L334)
> - **The clarify** (L357): the users (L162), the tenants (L320), the pricing (L332), and the scale (L357)
> - **The tenants** (L357): the per-tenant (L320) workspaces (L357) — the models (L148), the prompts (L312), the data (L313)
> - **The isolation** (L320): the L320 discipline (L320) over the prompts (L320), the vectors (L183), and the caches (L269) — enforced at the data layer (L357)
> - **The economics** (L334): the pricing (L332) — the per-seat (L357) and the per-token (L332); and the cost (L334) — the per-tenant (L320) attribution (L334)
> - The principle (L357): the isolation (L320) is the capstone's load-bearing wall (L357) — the tenant A (L320) never sees the tenant B's (L320) prompts (L312), vectors (L183), or caches (L269) (L357)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L357)?
2. How do you isolate the tenants (L320)?
3. How do you price it (L332)?
4. How does it scale (L358)?
5. What's the wall (L320)?
6. What's the meter (L334)?
7. What's the quota (L149)?
8. What is the capstone shape (L357)?

## A Closing Note — The Tower, Locked

You now hold the capstone: **the tenants, the isolation, and the economics — with the doors locked and the meters per-apartment.** The apartment tower is secure — and every lease is metered (L357).

Next: the millions of requests — High-Scale AI System (L358).
