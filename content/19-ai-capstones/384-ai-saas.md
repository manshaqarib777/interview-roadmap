# Lesson 384 — Project 4: Multi-Tenant AI SaaS

**Interview importance:** ⭐⭐⭐⭐⭐ — the fourth capstone: the full SaaS — tenants, billing, isolation, compliance (L384).**

This is the fourth capstone — the proof of the SaaS (L357) and the enterprise (L380) modules. L357 designed the capstone shape and L380 the toolkit; this lesson is **the build**: Project 4 — the multi-tenant AI SaaS — the full SaaS: the tenants, the billing, the isolation, and the compliance (L384): the scope (the product, L384), the architecture (the L357 shape, L384), and the build (the billing L332 and the compliance L371, L384). This lesson is the SaaS's proof (L384).

The distinction this lesson is built on: a **specialist** describes the app. A **solutions architect** builds the SaaS (L384): the tenants (L320), the billing (L332), the isolation (L320), and the compliance (L371) — the capstone (L384) that proves the L357 shape (L357).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the scope: the product (L384)
- Explain the architecture: the L357 shape (L384)
- Explain the billing: the metering (L332)
- Explain the compliance: the frameworks (L371)
- Explain the build: the isolation (L320)

## 1. One-Line Definition

**Project 4 — the multi-tenant AI SaaS — is the full SaaS: the tenants, the billing, the isolation, and the compliance (L384) — the scope (the product L384: the tenants L320, the plans L332, the regions L261, L384), the architecture (the L357 shape L357: the front door L267, the isolation L320, the metering L332, L384), and the build (the billing L332: the per-token L332 and the per-seat L357; the compliance L371: the GDPR L371 and the SOC 2 L371; and the isolation L320: the per-tenant L320 data, L384) — the SaaS's (L357) proof (L384).**

The one-sentence interview answer: *"Project 4 is the full SaaS, built (L384). The scope (L384): the product (L384) — the tenants (L320): the multi-tenant (L357) workspace (L384); the plans (L332): the tiered (L332) pricing (L332); and the regions (L261): the residency (L261) by the tenant (L320). The architecture (L384): the L357 shape (L357) — the front door (L267): the gateway (L267) with the auth (L319) and the quotas (L149); the isolation (L320): the tenant ID (L320) in the data (L313), the vectors (L183), and the caches (L269); and the metering (L332): the tokens (L332) per tenant (L320). The build (L384): the billing (L332) — the per-token (L332) and the per-seat (L357) — the L334 attribution (L334); the compliance (L371) — the GDPR (L371): the residency (L261) and the deletion (L312); the SOC 2 (L371): the audit (L322); and the isolation (L320) — the wall (L320) at the data layer (L384). The AI shape (L173): the SaaS (L384) — the tenants (L320), the billing (L332), the isolation (L320), and the compliance (L371) — the L357 shape (L357), built (L384), the SaaS's (L357) proof (L384)."*

## 2. Mental Model

Think of the multi-tenant SaaS as **the office tower, operated.** The tower (the SaaS, L384): the floors (the tenants, L320) — each with the locked (L320) doors; the leases (the plans, L332) — the per-floor (L357) rent (L332); the meters (the metering, L332) — the utilities (the tokens, L332) per floor (L320); the inspections (the compliance, L371) — the fire code (the SOC 2, L371) and the privacy code (the GDPR, L371); and the management (the platform, L378) — the front desk (the gateway, L267) and the records (the audit, L322). The tower works because the floors are locked, the meters are per-floor, and the codes are met (L384).

```text
   the office tower (the SaaS, L384)
   ┌────────────────────────────────────────────────────────┐
   │ the floors (the tenants, L320) — the locked (L320)     │
   │ the leases (the plans, L332) · the meters (the         │
   │ metering, L332) · the inspections (the compliance,     │
   │ L371) · the front desk (the gateway, L267)             │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the office tower**: the floors, the meters, and the inspections (L384).

## 3. Visual Flow — The Build

```text
   THE SCOPE (L384) → the product (L384)
        │
        ▼
   THE ARCHITECTURE (L384) → the L357 shape (L357)
        │
        ▼
   THE BILLING (L332) → the per-token (L332) + the per-seat (L357)
        │
        ▼
   THE COMPLIANCE (L371) → the GDPR (L371) + the SOC 2 (L371)
        │
        ▼
   THE ISOLATION (L320) → the wall at the data layer (L384)
```

The flow is the build: **scope → architecture → billing → compliance → isolation** (L384).

## 4. How It Works — The Build, Part by Part

- **The scope (L384).** The product (L384): the tenants (L320), the plans (L332), the regions (L261).
- **The architecture (L384).** The L357 shape (L357): the front door (L267), the isolation (L320), the metering (L332).
- **The billing (L332).** The per-token (L332) and the per-seat (L357) — the L334 attribution (L334).
- **The compliance (L371).** The GDPR (L371) and the SOC 2 (L371).
- **The build (L384).** The isolation (L320): the wall (L320) at the data layer (L384).

> [!NOTE]
> **The capstone's arc: the tenants to the compliance (L384).** The senior answer builds the arc (L384): the tenants (L320) — the L357 wall (L357) at the data layer (L384): the tenant ID (L320) in the vectors (L183), the caches (L269), and the prompts (L312); the billing (L332) — the metering (L332) with the per-tenant (L320) attribution (L334) and the quotas (L149); and the compliance (L371) — the GDPR (L371): the residency (L261) and the deletion (L312); the SOC 2 (L371): the audit (L322). The arc (L384) — the tenants (L320) to the compliance (L371) — is the L357 shape (L357), built (L384).

## 5. Real Project Usage

- **The portfolio (L103).** Project 4 (L384) — the L357 proof (L384).
- **An interview (L384).** The walkthrough (L384) — the tenants to the compliance (L384).
- **An AI SaaS (L357).** The multi-tenant (L357) — the billing (L332) and the isolation (L320).
- **A regulated SaaS (L371).** The GDPR (L371) — the residency (L261) and the audit (L322).
- **Anything SaaS (L357).** The capstone (L384) — the L357 shape (L357), built (L384).

The through-line: **the proof is the SaaS's** — the tenants, the billing, the isolation, and the compliance (L384).

## 6. Interview Explanation

Say it in four moves:

1. **The scope.** "The tenants (L320), the plans (L332), the regions (L261)."
2. **The architecture.** "The L357 shape (L357) — the door (L267), the wall (L320), the meter (L332)."
3. **The billing.** "The per-token (L332) and the per-seat (L357)."
4. **The compliance.** "The GDPR (L371) and the SOC 2 (L371)."

## 7. Senior-Level Insights

- **The wall is the data layer's (L320).** The tenant ID (L320) in the vectors (L183) and the filters (L189) — the L357 wall (L357), at the data (L384).
- **The meter is the billing's (L332).** The tokens (L332) per tenant (L320) — the L334 attribution (L334) — the per-tenant (L357) margin (L384).
- **The quota is the abuse's (L149).** The per-tenant (L320) cap (L149) — the L318 limits (L318) — the L317 abuse (L317), bounded (L384).
- **The residency is the region's (L261).** The tenant's (L320) region (L261) — the GDPR (L371) — the L366 cloud (L366), in the capstone (L384).
- **The audit is the SOC 2's (L322).** The who, the what, the when (L322) — the L371 evidence (L371) — the L322 record (L322), built (L384).

## 8. Common Mistakes

- **The single-tenant (L384).** The app (L384) without the tenants (L320) — the wall (L320) missing (L384).
- **The shared data (L320).** The one index (L183) and the one cache (L269) — the cross-tenant (L320) — the isolation (L320) (L384).
- **The un-metered (L332).** The usage (L332) un-attributed (L334) — the billing (L332) and the margin (L357) impossible (L384).
- **The residency ignored (L261).** The data (L313) in the wrong region (L261) — the GDPR (L371) (L384).
- **The un-audited (L322).** The SOC 2 (L371) — the record (L322) missing (L384).

## 9. Best Practices

- **Wall the data layer** (L320) — the tenant ID (L320) everywhere (L384).
- **Meter the tenants** (L332) — the tokens (L332) per tenant (L320).
- **Quota the tenants** (L149) — the per-tenant (L320) caps (L384).
- **Residency the data** (L261) — the tenant's (L320) region (L261).
- **Audit everything** (L322) — the SOC 2 (L371) evidence (L384).

## 10. Interview Questions

**Q: Walk me through Project 4.**
> A: The full SaaS, built (L384). The scope — the tenants (L320), the plans (L332), the regions (L261). The architecture — the L357 shape (L357): the door (L267), the wall (L320), the meter (L332). The billing — the per-token (L332) and the per-seat (L357). And the compliance — the GDPR (L371) and the SOC 2 (L371).

**Q: How do you isolate the tenants?**
> A: The L357 wall (L357) at the data layer (L384): the tenant ID (L320) in the vector indexes (L183) and the retrieval's filters (L189); the tenant ID (L320) in the cache's keys (L269); and the tenant ID (L320) in the prompts' context (L312). The isolation (L320) is the data's (L384), not just the app's (L384).

**Q: How does the billing work?**
> A: The metering (L332): the tokens (L332) per tenant (L320) — the L334 attribution (L334); and the seats (L357) — the users (L162) per tenant (L320). The plans (L332) — the per-token (L332) and the per-seat (L357) — the margin (L334) per tenant (L384).

**Q: How do you handle the compliance?**
> A: The GDPR (L371): the residency (L261) — the tenant's (L320) region (L261); and the deletion (L312) — the "right to be forgotten" (L371). The SOC 2 (L371): the audit (L322) — the who, the what, the when (L322). The L371 frameworks (L371), built in (L384).

## 11. Follow-Up Questions

- What's the scope (L384)?
- How do you isolate the tenants (L320)?
- How does the billing work (L332)?
- How do you handle the compliance (L371)?
- What's the arc (L384)?

## 12. Comparison Table — The App vs the SaaS

| | The app (L384) | The SaaS (L384) |
|---|---|---|
| The tenants (L320) | none (L384) | the multi-tenant (L357) |
| The billing (L332) | none (L384) | the metering (L332) |
| The isolation (L320) | none (L384) | the data-layer wall (L384) |
| The compliance (L371) | none (L384) | the GDPR (L371), the SOC 2 (L371) |

The senior read: **the right column is the capstone** — the full SaaS (L384).

## 13. Code Example — The Build, Started

```js
// Project 4 (L384) — the multi-tenant SaaS (L384).
// 1 · THE TENANT CONTEXT (L320) — from the auth (L319).
function tenantContext(req) {
  return { tenantId: req.tenantId, region: regionOf(req.tenantId) };  // L320, L261
}

// 2 · THE ISOLATION (L320) — the data-layer wall (L384).
async function retrieve(ctx, query) {
  return index.search(`tenant:${ctx.tenantId}`, query, {   // L183, L320
    filter: { tenantId: { equals: ctx.tenantId } },        // L189, L384
  });
}
const cacheKey = `tenant:${ctx.tenantId}:resp:${hash(query)}`;  // L269, L320

// 3 · THE METERING (L332) — the billing (L384).
async function meter(ctx, usage) {
  const cost = costOf(usage, ctx.model);                   // L334
  await metering.write({ tenantId: ctx.tenantId, tokens: usage, cost });  // L332
  // the per-token (L332) and the per-seat (L357) billing (L384)
}

// 4 · THE QUOTA (L149) — the per-tenant cap (L384).
if (await metering.tenantMonth(ctx.tenantId) > quotaOf(ctx.tenantId)) {
  return error(429);                                       // L149, L318
}

// 5 · THE COMPLIANCE (L371) — the residency (L261) and the audit (L322).
await invokeIn(ctx.region, prompt);                        // L261, L371
await audit.log({ who, what, when, tenantId: ctx.tenantId });  // L322
```

```text
What the reader must SEE — the build, started:

  tenantId + region from the auth → the context (L319, L261)
  the per-tenant index + cache    → the wall (L183, L269, L320)
  metering per tenant             → the billing (L332, L334)
  the per-tenant quota → 429      → the cap (L149, L318)
  the region's invoke + the audit → the compliance (L261, L322)

  The tenants, the billing, the isolation, the compliance (L384).
```

```narrate
4-6: The context — the tenant and the region from the auth (L319, L261).
8-14: The isolation — the per-tenant index and the cache (L183, L269, L320).
16-20: The metering — the tokens and the cost per tenant (L332, L334).
22-24: The quota — the per-tenant cap (L149, L318).
26-28: The compliance — the region's invoke and the audit (L261, L322).
```

> [!TIP]
> The pair that defines the capstone: **the per-tenant index filter** (the wall, L320) and **the per-tenant meter** (the billing, L332). **Wall the data, meter the tenants, quota the caps, comply the regions — the full SaaS (L384).**

## 14. Performance Notes

- **The wall is the retrieval's (L320).** The per-tenant (L320) index (L183) — the filter (L189) narrows (L384).
- **The meter is the batch's (L332).** The per-tenant (L320) usage (L332) — the L334 attribution (L334), batched (L384).
- **The quota is the cost's (L149).** The per-tenant (L320) cap (L149) — the bill (L334) bounded (L384).
- **The residency is the latency's (L261).** The tenant's (L320) region (L261) — the L333 latency (L333) by the region (L384).

## 15. Debugging Scenarios

| Symptom | First check (L384) | The lever |
|---|---|---|
| The tenants mix | The isolation (L320) | The filter (L189), the key (L269) |
| The bill is unattributed | The metering (L332) | The tokens (L332) per tenant (L320) |
| The one tenant starves the rest | The quota (L149) | The per-tenant cap (L149) |
| The residency is wrong | The region (L261) | The tenant's (L320) region (L384) |
| The audit fails | The compliance (L371) | The record (L322) |

## 16. Quick Revision Notes

- Project 4 = **the SaaS's proof** (L384): the scope, the architecture, the billing, the compliance.
- The scope: **the tenants (L320), the plans (L332), the regions (L261)**.
- The architecture: **the L357 shape (L357) — the door (L267), the wall (L320), the meter (L332)**.
- The billing: **the per-token (L332) and the per-seat (L357)**.
- The compliance: **the GDPR (L371) and the SOC 2 (L371)**.

## 17. Cheat Sheet

```text
PROJECT 4: MULTI-TENANT AI SAAS = the full SaaS

THE SCOPE (L384)
  the tenants (L320) — the multi-tenant (L357) workspace (L384)
  the plans (L332) — the tiered (L332) pricing (L332)
  the regions (L261) — the residency (L261) by the tenant (L320)

THE ARCHITECTURE (L384) — THE L357 SHAPE (L357)
  the front door (L267) — the gateway (L267), the auth (L319),
  the quotas (L149)
  the isolation (L320) — the tenant ID (L320) in the data (L313),
  the vectors (L183), the caches (L269)
  the metering (L332) — the tokens (L332) per tenant (L320)

THE BILLING (L332)
  the per-token (L332) · the per-seat (L357)
  the L334 attribution (L334) · the margin (L357)

THE COMPLIANCE (L371)
  the GDPR (L371) — the residency (L261), the deletion (L312)
  the SOC 2 (L371) — the audit (L322)

INTERVIEW, 4 MOVES
  1 scope   "the tenants, the plans, the regions (L384)"
  2 architecture "the L357 shape (L357)"
  3 billing "the per-token and the per-seat (L332)"
  4 compliance "the GDPR and the SOC 2 (L371)"
```

## 18. Key Takeaways

> [!RECAP]
> - Project 4 — the multi-tenant AI SaaS — is **the full SaaS: the tenants, the billing, the isolation, and the compliance** (L384): the scope (L384), the architecture (L384), the billing (L332), and the compliance (L371)
> - **The scope** (L384): the product (L384) — the tenants (L320), the plans (L332), and the regions (L261)
> - **The architecture** (L384): the L357 shape (L357) — the front door (L267), the isolation (L320), and the metering (L332)
> - **The billing** (L332): the per-token (L332) and the per-seat (L357) — the L334 attribution (L334)
> - **The compliance** (L371): the GDPR (L371) — the residency (L261) and the deletion (L312); and the SOC 2 (L371) — the audit (L322)
> - The arc (L384): the tenants (L320) to the compliance (L371) — the L357 shape (L357), built (L384), the SaaS's (L357) proof (L384), filling the portfolio (L103)

## Check your understanding

Answer these without looking back.

1. What's the scope (L384)?
2. How do you isolate the tenants (L320)?
3. How does the billing work (L332)?
4. How do you handle the compliance (L371)?
5. What's the arc (L384)?
6. What's the wall (L320)?
7. What's the meter (L332)?
8. What is the full SaaS (L384)?

## A Closing Note — The Tower, Operated

You now hold the fourth proof: **the tenants, the billing, the isolation, and the compliance — with the floors locked and the meters per-floor.** The office tower is operated — and the codes are met (L384).

Next: the SSO, the RBAC, the audit, and the grounding inside the enterprise firewall — Project 5 (L385).
