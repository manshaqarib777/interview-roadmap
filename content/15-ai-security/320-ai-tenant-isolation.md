# Lesson 320 — Tenant Isolation for AI (L134 Payoff)

**Interview importance:** ⭐⭐⭐⭐⭐ — "the L134 discipline, applied to prompts, caches, and vector stores" — the answer is *the isolation*: the tenant's boundary across the AI stack (L320).**

L134 built the multi-tenancy discipline (L134); this lesson is **its AI payoff**: the tenant isolation for AI — the L134 discipline applied to the prompts, the caches, and the vector stores (L320): the surfaces (the prompts, the caches, the vectors, L320), the boundary (the tenant ID everywhere, L320), and the leaks (the cross-tenant retrieval, the shared caches, L320). The AI shape (L173): the multi-tenant AI SaaS (L357) — the L134 discipline (L134), AI-shaped (L320). This lesson is the tenant's boundary (L320).

The distinction this lesson is built on: a **demo** shares the indexes. A **solutions architect** isolates (L320): the prompts (L320), the caches (L320), and the vectors (L320) — because the L357 SaaS (L357) lives on the isolation (L320).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the surfaces: the prompts, the caches, the vectors (L320)
- Explain the boundary: the tenant ID everywhere (L320)
- Explain the leaks: the cross-tenant paths (L320)
- Explain the enforcement: the row-level and the prefix-level (L320)
- Explain the AI shape: the L134 discipline, AI-shaped (L320)

## 1. One-Line Definition

**The tenant isolation for AI is the L134 discipline applied to the prompts, the caches, and the vector stores (L320) — the surfaces (the prompts L312, the caches L269, the vector stores L183, L320), the boundary (the tenant ID everywhere: the prompt's context L320, the cache's key L320, the vector's metadata L180, L320), and the enforcement (the row-level security L134, the prefix scoping L265, and the retrieval's filters L189, L320) — the L134 discipline (L134), AI-shaped (L320).**

The one-sentence interview answer: *"The tenant isolation is the L134 discipline, AI-shaped (L320). The surfaces (L320): the prompts (L312) — the tenant's context (L320) in the prompt (L320); the caches (L269) — the tenant's responses (L171) in the Redis (L243); the vector stores (L183) — the tenant's chunks (L316) in the index (L183); and the knowledge bases (L280) — the tenant's documents (L316). The boundary (L320): the tenant ID everywhere (L320) — the prompt's tenant (L320), the cache's key (L320), the vector's metadata (L180) — the L134 discipline (L134): the tenant (L320) scopes every read and write (L320). The leaks (L320): the cross-tenant retrieval (L189) — the filter (L180) missing; the shared cache (L269) — the key (L320) missing; the shared knowledge base (L280) — the poison (L316) crossing (L320). The enforcement (L320): the row-level security (L134) on the RDS (L268), the prefix scoping (L265) on the S3 (L265), and the retrieval's filters (L189) on the vectors (L183). The AI shape (L173): the multi-tenant AI SaaS (L357) — the isolation (L320) at every surface (L320) — the L134 payoff (L134), AI-shaped (L320)."*

## 2. Mental Model

Think of the tenant isolation as **the apartment building with the locked floors.** The building (the AI SaaS, L357) has the apartments (the tenants, L320). The L134 rule (L134): every floor (the surface, L320) is locked per apartment (L320): the mail slots (the prompts, L312) — the tenant's letters (L320) only; the shared pantry (the caches, L269) — the tenant's shelves (L320) labeled; the archive (the vector store, L183) — the tenant's files (L320) filed separately. The leaks (L320): the open floor (L320) — the tenant A's file (L320) in the tenant B's hands (L320). The locks (the enforcement, L320): the keycard (the tenant ID, L320) required at every door (L320). The building works because every floor is locked, every shelf is labeled, and every door checks the card (L320).

```text
   the building (the AI SaaS, L357)
   ┌────────────────────────────────────────────────────────┐
   │ the floors (the surfaces, L320) — the prompts (L312),  │
   │ the caches (L269), the vectors (L183)                  │
   │ the locks (the boundary, L320) — the tenant ID (L320)  │
   │ the leaks (L320) — the open floors (L320)              │
   │ the keycard (the enforcement, L320) — at every door    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the building**: the floors, the locks, and the keycard (L320).

## 3. Visual Flow — One Tenant's Boundary

```text
   the tenant A's request (L320)
        │  the tenant ID: A (L320)
        ▼
   ┌────────────────────── THE PROMPT (L312) ───────────────────────────┐
   │  the context: the tenant A's docs only (L320)                     │
   │  the retrieval (L189): the filter tenant=A (L180, L320)           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE CACHE (L269) ────────────────────────────┐
   │  the key: tenant:A:resp:{hash} (L320)                             │
   │  the tenant B's key (L320) → the miss (L320)                      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STORES (L320) ───────────────────────────┐
   │  the RDS (L268): the row-level security tenant=A (L134)           │
   │  the S3 (L265): the prefix tenant/A/ (L265, L320)                 │
   │  the vectors (L183): the metadata filter tenant=A (L180)          │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the boundary: **prompt → cache → stores**, the tenant ID everywhere (L320).

## 4. How It Works — The Boundary, Part by Part

- **The surfaces (L320).** Where the tenant's data lives (L320): the prompts (L312), the caches (L269), the vector stores (L183), the knowledge bases (L280), the logs (L329).
- **The boundary (L320).** The tenant ID everywhere (L320): the prompt's context (L320), the cache's key (L320), the vector's metadata (L180), the log's record (L322).
- **The leaks (L320).** The cross-tenant paths (L320): the retrieval without the filter (L189), the cache without the key (L269), the knowledge base shared (L280).
- **The enforcement (L320).** The row-level security (L134) on the RDS (L268), the prefix scoping (L265) on the S3 (L265), the retrieval's filters (L189) on the vectors (L183).

> [!NOTE]
> **The isolation is the L134 discipline at every AI surface (L320).** The senior answer maps the L134 discipline (L134) to the AI (L320): the L134 row-level security (L134) → the RDS (L268) and the vectors' metadata (L180); the L134 tenant scoping (L134) → the cache's keys (L269) and the S3's prefixes (L265); the L134 leak checks (L134) → the retrieval's filters (L189) and the knowledge bases (L280). The L357 SaaS (L357) — the L320 isolation (L320) — is the L134 payoff (L134).

## 5. Real Project Usage

- **A multi-tenant AI SaaS (L357).** The isolation (L320) at every surface (L320): the prompts (L312), the caches (L269), the vectors (L183).
- **A RAG platform (L280).** The per-tenant knowledge bases (L280) — the retrieval's filter (L189) and the metadata (L180).
- **A chat product (L162).** The per-tenant sessions (L237) — the cache's key (L269) with the tenant (L320).
- **A regulated workload (L371).** The isolation (L320) as the compliance (L371) — the tenant's data (L313) bounded (L320).
- **Anything multi-tenant (L357).** The L134 discipline (L134), AI-shaped (L320) — the tenant ID everywhere (L320).

The through-line: **the boundary is the tenant's** — the ID everywhere, the leaks closed (L320).

## 6. Interview Explanation

Say it in four moves:

1. **The surfaces.** "The prompts (L312), the caches (L269), the vectors (L183)."
2. **The boundary.** "The tenant ID everywhere (L320)."
3. **The leaks.** "The cross-tenant retrieval and the shared caches (L320)."
4. **The enforcement.** "The row-level, the prefixes, the filters (L320)."

## 7. Senior-Level Insights

- **The tenant ID is the invariant (L320).** The prompt (L320), the cache (L269), the vector (L183) — the tenant ID (L320) in every key and every filter (L320).
- **The retrieval is the leak's door (L189).** The vector search (L189) without the tenant filter (L180) — the cross-tenant results (L320) — the filter (L189) is the lock (L320).
- **The cache is the leak's shelf (L269).** The shared cache (L269) — the tenant A's response (L171) to the tenant B (L320) — the tenant key (L320) is the lock (L320).
- **The knowledge base is the poison's bridge (L280).** The shared base (L280) — the poisoned document (L316) crossing (L320) — the per-tenant bases (L320) are the lock (L320).
- **The audit is the boundary's record (L322).** The tenant's access (L320) — the L322 audit (L322) records the who and the what (L320).

## 8. Common Mistakes

- **The shared vector store (L183).** The index (L183) without the tenant filter (L180) — the cross-tenant retrieval (L189) — the metadata (L180) is the lock (L320).
- **The shared cache (L269).** The cache (L269) without the tenant key (L320) — the tenant A's data (L171) to the tenant B (L320).
- **The shared knowledge base (L280).** The one base (L280) for all (L320) — the per-tenant bases (L320) are the lock (L320).
- **The prompt's context (L312).** The tenant A's docs (L320) in the tenant B's prompt (L312) — the retrieval's filter (L189) is the lock (L320).
- **The logs un-tagged (L322).** The tenant's record (L322) without the tenant ID (L320) — the audit (L322) can't attribute (L320).

## 9. Best Practices

- **Scope every surface** (L320) — the tenant ID everywhere (L320).
- **Filter the retrieval** (L189) — the tenant's metadata (L180).
- **Key the cache** (L269) — the tenant's prefix (L320).
- **Isolate the bases** (L280) — the per-tenant knowledge (L320).
- **Tag the logs** (L322) — the tenant's audit (L320).

## 10. Interview Questions

**Q: Walk me through the tenant isolation for AI.**
> A: The L134 discipline, AI-shaped (L320). The surfaces — the prompts (L312), the caches (L269), the vectors (L183). The boundary — the tenant ID everywhere (L320). The leaks — the cross-tenant retrieval (L189) and the shared caches (L269). And the enforcement — the row-level (L134), the prefixes (L265), the filters (L189).

**Q: Where does the AI data leak between tenants?**
> A: Three paths (L320): the retrieval (L189) — the vector search (L183) without the tenant filter (L180) returns the other tenant's chunks (L320); the cache (L269) — the shared Redis (L243) without the tenant key (L320) serves the other tenant's responses (L171); and the knowledge base (L280) — the shared base (L280) lets the poisoned document (L316) cross (L320).

**Q: How do you enforce it?**
> A: The tenant ID at every surface (L320): the retrieval's filter (L189) on the metadata (L180); the cache's key (L269) with the tenant prefix (L320); the S3's prefixes (L265) per tenant (L320); and the row-level security (L134) on the RDS (L268). The boundary (L320) is enforced at the data layer (L320), not just the app (L320).

**Q: What's the L134 payoff?**
> A: The L134 discipline (L134) — the tenant scoping, the leak checks, the row-level security (L134) — applied to the AI's surfaces (L320): the prompts (L312), the caches (L269), the vectors (L183), and the knowledge bases (L280). The multi-tenant AI SaaS (L357) lives on it (L320).

## 11. Follow-Up Questions

- What are the surfaces (L320)?
- What's the boundary (L320)?
- Where does the data leak (L320)?
- How do you enforce it (L320)?
- What's the L134 payoff (L134)?

## 12. Comparison Table — The Isolated vs the Leaky

| | The isolated (L320) | The leaky (L320) |
|---|---|---|
| The retrieval (L189) | the tenant filter (L180) | the shared index (L183) |
| The cache (L269) | the tenant key (L320) | the shared key (L269) |
| The base (L280) | the per-tenant (L320) | the shared (L280) |
| The logs (L322) | the tenant tagged (L320) | the untagged (L322) |
| The risk (L320) | the contained (L320) | the cross-tenant (L320) |

The senior read: **the left column is the L134 payoff** (L320).

## 13. Code Example — The Boundary, Applied

```js
// The tenant isolation (L320) — the tenant ID everywhere (L320).
// 1 · THE RETRIEVAL (L189) — the tenant's filter (L180).
const chunks = await vectorStore.search(query, {
  topK: 5,
  filter: { tenantId: { equals: tenant.id } },   // the metadata filter (L180, L320)
});

// 2 · THE CACHE (L269) — the tenant's key (L320).
const cacheKey = `tenant:${tenant.id}:resp:${hash(prompt)}`;   // L320
const cached = await redis.get(cacheKey);        // L269

// 3 · THE PROMPT (L312) — the tenant's context only (L320).
const context = buildContext(chunks);            // the tenant's chunks (L320)

// 4 · THE STORES (L320) — the row-level and the prefixes (L320).
//   the RDS (L268): SELECT ... WHERE tenant_id = $1   (L134)
//   the S3 (L265): s3://docs/tenant/{id}/...           (L265)
//   the knowledge base (L280): the per-tenant kb       (L320)

// 5 · THE AUDIT (L322) — the tenant's record (L320).
await audit.log({ tenantId: tenant.id, action, at });   // L322
```

```text
What the reader must SEE — the boundary, applied:

  filter: tenantId        → the retrieval's lock (L180, L189)
  tenant:{id}:resp:{hash} → the cache's lock (L269, L320)
  the tenant's context    → the prompt's lock (L312, L320)
  WHERE tenant_id = $1    → the row-level (L134)
  s3://docs/tenant/{id}/  → the prefix (L265)
  tenantId in the audit   → the record (L322)

  The tenant ID everywhere — the L134 payoff (L320).
```

```narrate
4-7: The retrieval — the vector search filtered by the tenant's ID (L180, L189).
9-11: The cache — the key scoped to the tenant (L269, L320).
13-14: The prompt — the context built from the tenant's chunks only (L312, L320).
16-20: The stores — the row-level security and the per-tenant prefixes (L134, L265).
22-23: The audit — the tenant's actions recorded (L322, L320).
```

> [!TIP]
> The pair that defines the isolation: **the retrieval's tenant filter** (the vector's lock, L189) and **the cache's tenant key** (the Redis's lock, L269). **Filter the retrieval, key the cache, scope the stores, tag the audit — the tenant's boundary (L320).**

## 14. Performance Notes

- **The filter is the retrieval's precision (L320).** The tenant's metadata (L180) — the index (L183) narrowed (L189) — the retrieval (L189) faster (L320).
- **The key is the cache's isolation (L320).** The tenant's prefix (L320) — the misses (L320) for the other tenants (L320).
- **The row-level is the DB's cost (L134).** The tenant's column (L134) — the indexed (L134) — the queries (L320) fast (L320).
- **The per-tenant bases are the storage's cost (L280).** The duplicated indexes (L183) — the isolation (L320) for the storage (L285).

## 15. Debugging Scenarios

| Symptom | First check (L320) | The lever |
|---|---|---|
| The tenant B sees the tenant A's docs | The retrieval (L189) | The tenant filter (L180) |
| The tenant B gets the tenant A's cache | The cache (L269) | The tenant key (L320) |
| The poison crosses | The base (L280) | The per-tenant bases (L320) |
| The prompt mixes the contexts | The retrieval (L189) | The filter (L180) |
| The audit can't attribute | The logs (L322) | The tenant ID (L320) |

## 16. Quick Revision Notes

- The tenant isolation = **the L134 payoff** (L320): the surfaces, the boundary, the leaks, the enforcement.
- The surfaces: **the prompts (L312), the caches (L269), the vectors (L183)**.
- The boundary: **the tenant ID everywhere (L320)**.
- The leaks: **the cross-tenant retrieval (L189), the shared caches (L269)**.
- The enforcement: **the row-level (L134), the prefixes (L265), the filters (L189)**.

## 17. Cheat Sheet

```text
TENANT ISOLATION FOR AI = the L134 discipline, AI-shaped

THE SURFACES (L320)
  the prompts (L312) · the caches (L269) · the vector stores (L183)
  the knowledge bases (L280) · the logs (L329)

THE BOUNDARY (L320)
  the tenant ID everywhere (L320)
  the prompt's context (L320) · the cache's key (L269)
  the vector's metadata (L180) · the log's record (L322)

THE LEAKS (L320)
  the retrieval without the filter (L189)
  the cache without the key (L269)
  the knowledge base shared (L280)

THE ENFORCEMENT (L320)
  the row-level security (L134) — the RDS (L268)
  the prefix scoping (L265) — the S3 (L265)
  the retrieval's filters (L189) — the vectors (L183)
  the per-tenant bases (L280) — the knowledge (L280)

INTERVIEW, 4 MOVES
  1 surfaces  "the prompts, the caches, the vectors (L320)"
  2 boundary  "the tenant ID everywhere (L320)"
  3 leaks     "the cross-tenant paths (L320)"
  4 enforcement "the row-level, the prefixes, the filters (L320)"
```

## 18. Key Takeaways

> [!RECAP]
> - The tenant isolation for AI is **the L134 discipline applied to the prompts, the caches, and the vector stores** (L320): the surfaces (L320), the boundary (L320), the leaks (L320), and the enforcement (L320)
> - **The surfaces** (L320): the prompts (L312), the caches (L269), the vector stores (L183), the knowledge bases (L280), and the logs (L329)
> - **The boundary** (L320): the tenant ID everywhere (L320) — the prompt's context (L320), the cache's key (L269), the vector's metadata (L180)
> - **The leaks** (L320): the cross-tenant retrieval (L189) without the filter (L180), the shared cache (L269) without the key (L320), the shared knowledge base (L280)
> - **The enforcement** (L320): the row-level security (L134) on the RDS (L268), the prefix scoping (L265) on the S3 (L265), the retrieval's filters (L189) on the vectors (L183), and the per-tenant bases (L280)
> - The AI shape (L320): the multi-tenant AI SaaS (L357) — the isolation (L320) at every surface (L320) — the L134 payoff (L134), AI-shaped (L320)

## Check your understanding

Answer these without looking back.

1. What are the surfaces (L320)?
2. What's the boundary (L320)?
3. Where does the data leak (L320)?
4. How do you enforce it (L320)?
5. What's the L134 payoff (L134)?
6. What's the retrieval's lock (L189)?
7. What's the cache's lock (L269)?
8. What is the tenant's boundary (L320)?

## A Closing Note — The Floors, Locked

You now hold the isolation: **the surfaces, the boundary, the leaks, and the enforcement — with the tenant ID at every door.** The apartment building is locked per floor — and the L134 payoff is banked (L320).

Next: where the model keys live, and how they never reach the client — Secret Management (L321).
