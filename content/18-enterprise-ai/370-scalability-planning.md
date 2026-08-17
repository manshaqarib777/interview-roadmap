# Lesson 370 — Scalability Planning

**Interview importance:** ⭐⭐⭐⭐⭐ — "the growth path from pilot to enterprise without a rewrite" — the answer is *the path*: the pilot, the growth, and the seams (L370).**

L369 planned the capacity; this lesson is **the path between the scales**: the scalability planning — the growth path from the pilot to the enterprise without a rewrite (L370): the stages (the pilot, the growth, the enterprise, L370), the seams (the split points, L370), and the path (the incremental, L370). The AI shape (L173): the enterprise (L380) — the growth (L370) without the rewrite (L370). This lesson is the growth's path (L370).

The distinction this lesson is built on: a **junior** builds for the enterprise. A **solutions architect** builds the seams (L370): the pilot (L370), the growth (L370), and the seams (L370) — because the rewrite (L370) is the death (L370) of the product (L370).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the stages: the pilot, the growth, the enterprise (L370)
- Explain the seams: the split points (L370)
- Explain the path: the incremental (L370)
- Explain the AI's seams: the model, the data, the retrieval (L370)
- Explain the AI shape: the growth without the rewrite (L370)

## 1. One-Line Definition

**The scalability planning is the growth path from the pilot to the enterprise without a rewrite (L370) — the stages (the pilot L370: the one tenant L320 and the one model L148; the growth L370: the more tenants L320 and the routing L155; the enterprise L370: the many and the isolation L320, L370), the seams (the split points: the queue L270, the services L252, the indexes L183, L370), and the path (the incremental L370: the stage to the stage L370, the seams pre-cut L370) — the rewrite (L370), avoided (L370).**

The one-sentence interview answer: *"The scalability planning is the growth path (L370). The stages (L370): the pilot (L370) — the one tenant (L320) and the one model (L148): the monolithic (L253) and the simple (L370); the growth (L370) — the more tenants (L320) and the routing (L155): the seams (L370) split (L370); and the enterprise (L370) — the many (L358): the isolation (L320), the tiered (L365), the sharded (L358). The seams (L370): the split points (L370) — the queue (L270): the async (L222) boundary (L370); the services (L252): the module's (L253) boundaries (L370); and the indexes (L183): the per-tenant (L320) shards (L358). The path (L370): the incremental (L370) — the stage to the stage (L370), the seams (L370) pre-cut (L370): the pilot (L370) built with the seams (L370), the growth (L370) splits them (L370). The AI's seams (L370): the model (L148) — the tiered (L365) later (L370); the data (L183) — the per-tenant (L320) later (L370); and the retrieval (L189) — the hybrid (L187) later (L370). The AI shape (L173): the enterprise (L380) — the growth (L370) through the seams (L370) — the rewrite (L370), avoided (L370)."*

## 2. Mental Model

Think of the scalability as **the house that grows with the family.** The family (the enterprise, L380) builds the starter house (the pilot, L370): the rooms (the modules, L253) with the walls that can move (the seams, L370). The family grows (the growth, L370): the wall (the seam, L370) moves (L370) — the new room (the service, L252) added (L370); the family grows more (the enterprise, L370): the extension (the shard, L358) built (L370). The house works because the movable walls (the seams, L370) were built in (L370) — the rebuild (the rewrite, L370) avoided (L370).

```text
   the growing house (the path, L370)
   ┌────────────────────────────────────────────────────────┐
   │ the starter (the pilot, L370) — the rooms (L253)       │
   │ the movable walls (the seams, L370) — the queue        │
   │ (L270), the services (L252), the indexes (L183)        │
   │ the extensions (the growth, L370) — the shards (L358)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the growing house**: the starter, the movable walls, and the extensions (L370).

## 3. Visual Flow — The Path

```text
   THE PILOT (L370)
   the one tenant (L320) · the one model (L148) · the monolithic (L253)
   — with the seams (L370) pre-cut (L370)

   THE GROWTH (L370)
   the more tenants (L320) · the routing (L155)
   — the seams (L370) split (L370): the queue (L270), the services (L252)

   THE ENTERPRISE (L370)
   the many (L358) · the isolation (L320) · the tiered (L365)
   — the shards (L358), the tiered (L365)
```

The flow is the path: **pilot → growth → enterprise**, through the seams (L370).

## 4. How It Works — The Path, Part by Part

- **The stages (L370).** The pilot (L370), the growth (L370), the enterprise (L370) — the scale (L358) ladder (L370).
- **The seams (L370).** The split points (L370): the queue (L270), the services (L252), the indexes (L183).
- **The path (L370).** The incremental (L370): the stage to the stage (L370), the seams (L370) pre-cut (L370).
- **The AI's seams (L370).** The model (L148), the data (L183), the retrieval (L189) — the tiered (L365), the per-tenant (L320), the hybrid (L187) later (L370).

> [!NOTE]
> **The seam is the rewrite's prevention (L370).** The senior answer pre-cuts the seams (L370): the pilot (L370) — the monolithic (L253) — built with the seams (L370): the queue (L270) — the async (L222) boundary (L370); the services (L252) — the module's (L253) boundaries (L370); and the indexes (L183) — the tenant's (L320) column (L370). The growth (L370) splits the seams (L370) — the service (L252) extracted, the index (L183) sharded (L358) — the rewrite (L370) avoided (L370).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The path (L370) — the pilot (L370) to the enterprise (L380).
- **A SaaS growth (L357).** The one tenant (L320) to the many (L358) — the seams (L370).
- **A RAG growth (L349).** The one index (L183) to the sharded (L358) — the per-tenant (L320).
- **A model growth (L365).** The one model (L148) to the tiered (L365) — the routing (L155).
- **Anything enterprise (L380).** The path (L370) — the stages, the seams, the growth (L370).

The through-line: **the path is the growth's** — the stages, the seams, and the incremental (L370).

## 6. Interview Explanation

Say it in four moves:

1. **The stages.** "The pilot (L370), the growth (L370), the enterprise (L370)."
2. **The seams.** "The queue (L270), the services (L252), the indexes (L183)."
3. **The path.** "The incremental — the seams pre-cut (L370)."
4. **The AI's.** "The model (L148), the data (L183), the retrieval (L189)."

## 7. Senior-Level Insights

- **The seam is the investment (L370).** The pre-cut seams (L370) — the queue (L270), the services (L252) — the split (L370) cheap (L370), the rewrite (L370) avoided (L370).
- **The stage is the cost's (L370).** The pilot (L370) — the one tenant (L320) — the cost (L368) at the stage (L370), not the enterprise (L370).
- **The tenant is the growth's (L320).** The one tenant (L320) to the many (L358) — the isolation (L320) and the metering (L332) at the growth (L370).
- **The model is the later tier (L365).** The one model (L148) at the pilot (L370) — the routing (L155) and the tiers (L365) at the growth (L370).
- **The rewrite is the death (L370).** The un-seamed (L370) build (L370) — the enterprise (L380) rewrite (L370) — the seams (L370) are the prevention (L370).

## 8. Common Mistakes

- **The enterprise build (L370).** The shards (L358) and the tiers (L365) at the pilot (L370) — the cost (L368) and the delay (L370) — the stage (L370) is the scale (L370).
- **The un-seamed build (L370).** The monolithic (L253) without the seams (L370) — the growth (L370) is the rewrite (L370).
- **The single tenant (L320).** The tenant (L320) column (L370) un-designed (L370) — the isolation (L320) at the growth (L370) is the migration (L370).
- **The single model (L148).** The one model (L148) without the routing (L155) — the tiered (L365) later (L370) is the rework (L370).
- **The un-indexed growth (L183).** The one index (L183) — the shard (L358) at the scale (L358) — the seam (L183) pre-cut (L370).

## 9. Best Practices

- **Build the pilot with the seams** (L370) — the queue (L270), the services (L252).
- **Stage the scale** (L370) — the pilot, the growth, the enterprise (L370).
- **Design the tenant** (L320) — the column (L370) from the start (L370).
- **Plan the model's tiers** (L365) — the routing (L155) seam (L370).
- **Pre-cut the index** (L183) — the tenant (L320) shard (L358).

## 10. Interview Questions

**Q: Walk me through the scalability planning.**
> A: The growth path (L370). The stages — the pilot, the growth, the enterprise (L370). The seams — the queue (L270), the services (L252), the indexes (L183). The path — the incremental, the seams pre-cut (L370). And the AI's — the model (L148), the data (L183), the retrieval (L189).

**Q: How do you avoid the rewrite?**
> A: The seams (L370): the pilot (L370) built with the split points (L370) — the queue (L270) for the async (L222), the services (L252) for the modules (L253), the tenant (L320) column (L370) for the isolation (L320) — the growth (L370) splits them (L370) — the rewrite (L370) avoided (L370).

**Q: What's the pilot's shape?**
> A: The monolithic (L253) with the seams (L370): the one tenant (L320), the one model (L148), the one index (L183) — but the queue (L270) in front of the heavy work (L222), the module's (L253) boundaries (L370) clear, and the tenant (L320) column (L370) present (L370). The pilot (L370) is simple (L370), not seamed-out (L370).

**Q: What are the AI's seams?**
> A: Three (L370): the model (L148) — the routing (L155) seam (L370): the one model (L148) now, the tiers (L365) later; the data (L183) — the tenant (L320) column (L370): the one index (L183) now, the shards (L358) later; and the retrieval (L189) — the hybrid (L187) seam (L370): the vector (L183) now, the hybrid (L187) later (L370).

## 11. Follow-Up Questions

- What are the stages (L370)?
- How do you avoid the rewrite (L370)?
- What's the pilot's shape (L370)?
- What are the AI's seams (L370)?
- What's the seam (L370)?

## 12. Comparison Table — The Pilot vs the Enterprise

| | The pilot (L370) | The enterprise (L370) |
|---|---|---|
| The tenants (L320) | the one (L370) | the many (L358) |
| The models (L148) | the one (L370) | the tiered (L365) |
| The index (L183) | the one (L370) | the sharded (L358) |
| The seams (L370) | the pre-cut (L370) | the split (L370) |

The senior read: **the pilot with the seams, the enterprise with the splits** (L370).

## 13. Code Example — The Path, Applied

```js
// The scalability path (L370) — the seams pre-cut (L370).
// 1 · THE PILOT (L370) — the monolithic (L253) with the seams (L370).
const pilot = {
  tenant: { column: true },              // the tenant seam (L320, L370)
  queue:  { heavyWork: true },           // the async seam (L270, L222)
  model:  { single: true, router: false },  // the model seam (L148, L370)
  index:  { single: true, tenantKey: true }, // the index seam (L183, L370)
};

// 2 · THE GROWTH (L370) — the seams split (L370).
const growth = {
  // the queue (L270) already there → the workers (L266) scale (L271)
  // the tenant column (L320) → the isolation (L320) + the metering (L332)
  model: { router: true },               // the routing (L155) — the tiers (L365)
  index: { shard: 'tenant' },            // the per-tenant shard (L358)
};

// 3 · THE ENTERPRISE (L370) — the full split (L370).
const enterprise = {
  isolation: 'data-layer',               // the L320 wall (L357)
  tiers: 'routed',                       // the L365 strategy (L365)
  shards: 'tenant + hash',               // the L358 scale (L358)
};

// The path (L370): the pilot (L370) with the seams (L370),
// the growth (L370) splitting them (L370) — the rewrite (L370) avoided (L370).
```

```text
What the reader must SEE — the path, applied:

  tenant.column + queue + router: false → the pilot's seams (L370)
  router: true + shard: tenant         → the growth's splits (L370)
  isolation + tiers + shards           → the enterprise (L370)
  the seams pre-cut                    → the rewrite avoided (L370)

  The pilot with the seams, the growth through them (L370).
```

```narrate
4-10: The pilot — the monolithic with the tenant, the queue, and the model seams (L253, L370).
12-18: The growth — the routing and the per-tenant shard split (L155, L358).
20-24: The enterprise — the isolation, the tiers, and the shards (L320, L365, L358).
26-27: The path — the seams pre-cut, the rewrite avoided (L370).
```

> [!TIP]
> The pair that defines the path: **the tenant column** (the first seam, L320) and **the router seam** (the model's growth, L155). **Build the pilot with the seams, split them at the growth, reach the enterprise — the rewrite avoided (L370).**

## 14. Performance Notes

- **The seam is the growth's speed (L370).** The pre-cut (L370) — the split (L370) in the days (L370), not the months (L370).
- **The stage is the cost's (L370).** The pilot (L370) — the cost (L368) at the stage (L370).
- **The tenant is the metering's (L320).** The column (L370) — the L332 metering (L332) at the growth (L370).
- **The shard is the index's (L358).** The pre-cut (L183) — the L358 scale (L358) ready (L370).

## 15. Debugging Scenarios

| Symptom | First check (L370) | The lever |
|---|---|---|
| The growth is a rewrite | The seams (L370) | The pre-cut (L370) |
| The tenants can't isolate | The column (L320) | The tenant seam (L370) |
| The model can't tier | The router (L155) | The model seam (L370) |
| The index can't shard | The key (L183) | The tenant key (L370) |
| The pilot is over-built | The stage (L370) | The pilot's simplicity (L370) |

## 16. Quick Revision Notes

- The scalability planning = **the growth's path** (L370): the stages, the seams, the path.
- The stages: **the pilot (L370), the growth (L370), the enterprise (L370)**.
- The seams: **the queue (L270), the services (L252), the indexes (L183)**.
- The path: **the incremental — the seams pre-cut (L370)**.
- The AI's seams: **the model (L148), the data (L183), the retrieval (L189)**.

## 17. Cheat Sheet

```text
SCALABILITY PLANNING = the pilot to the enterprise, no rewrite

THE STAGES (L370)
  the pilot (L370) — the one tenant (L320), the one model (L148),
    the monolithic (L253) — with the seams (L370)
  the growth (L370) — the more tenants (L320), the routing (L155)
  the enterprise (L370) — the many (L358), the isolation (L320),
    the shards (L358)

THE SEAMS (L370)
  the queue (L270) — the async (L222) boundary (L370)
  the services (L252) — the module's (L253) boundaries (L370)
  the indexes (L183) — the tenant (L320) key (L370)

THE PATH (L370)
  the incremental (L370) — the stage to the stage (L370)
  the seams (L370) pre-cut (L370) — the split (L370) cheap (L370)

THE AI'S SEAMS (L370)
  the model (L148) — the router (L155) seam (L370)
  the data (L183) — the tenant (L320) column (L370)
  the retrieval (L189) — the hybrid (L187) seam (L370)

INTERVIEW, 4 MOVES
  1 stages  "the pilot, the growth, the enterprise (L370)"
  2 seams   "the queue, the services, the indexes (L370)"
  3 path    "the incremental, the seams pre-cut (L370)"
  4 the AI's "the model, the data, the retrieval (L370)"
```

## 18. Key Takeaways

> [!RECAP]
> - The scalability planning is **the growth path from the pilot to the enterprise without a rewrite** (L370): the stages (L370), the seams (L370), the path (L370), and the AI's seams (L370)
> - **The stages** (L370): the pilot (L370) — the one tenant (L320) and the one model (L148); the growth (L370) — the more tenants (L320) and the routing (L155); and the enterprise (L370) — the many (L358), the isolation (L320), the shards (L358)
> - **The seams** (L370): the split points (L370) — the queue (L270), the services (L252), and the indexes (L183)
> - **The path** (L370): the incremental (L370) — the stage to the stage (L370), the seams (L370) pre-cut (L370)
> - **The AI's seams** (L370): the model (L148) — the router (L155) seam; the data (L183) — the tenant (L320) column; and the retrieval (L189) — the hybrid (L187) seam
> - The principle (L370): the rewrite (L370) is the death (L370) of the product (L370) — the seams (L370) pre-cut (L370) are the prevention (L370)

## Check your understanding

Answer these without looking back.

1. What are the stages (L370)?
2. How do you avoid the rewrite (L370)?
3. What's the pilot's shape (L370)?
4. What are the AI's seams (L370)?
5. What's the seam (L370)?
6. What's the tenant column (L320)?
7. What's the router seam (L155)?
8. What is the growth's path (L370)?

## A Closing Note — The House, Extendable

You now hold the path: **the stages, the seams, and the incremental — with the movable walls built in.** The starter house grows with the family — and the rebuild is avoided (L370).

Next: the frameworks that gate the enterprise AI adoption — Security & Compliance (L371).
