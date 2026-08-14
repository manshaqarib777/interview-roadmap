# Lesson 185 — Qdrant

**Interview importance:** ⭐⭐⭐⭐ — "self-hosted vector DB?" — the answer is Qdrant's *open-source, filtering-heavy* middle path: the control of self-hosting and rich filters (L180) without the managed bill (L150) — chosen by the L186 rule between pgvector (L183) and Pinecone (L184).**

L183 gave you the default, L184 the managed path. This lesson is the **middle**: Qdrant — a self-hostable, open-source vector database whose superpower is *filtering* (L180). It's the L186 answer for "self-hosted scale": when the corpus outgrows pgvector's ANN (L182) but the team wants control and cost (L150) over managed (L184) — Qdrant's rich filtering and payload support make it the filtering-heavy specialist.

The distinction this lesson is built on: a **demo** picks Qdrant because "it's open source". A **solutions architect** picks it because the L186 rule says so: filtering-heavy retrieval (L180, L189), self-hosting for control and cost (L150), and the ops story (L274) that self-hosting demands — weighed against pgvector (L183) and Pinecone (L184).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain Qdrant: self-hostable, open-source, filtering-heavy vector DB (L185)
- Describe the trade: control and cost vs the ops story (L150, L186)
- Explain Qdrant's filtering model: payloads, filters, and hybrid (L180, L187)
- Apply the L186 rule: when Qdrant wins over pgvector (L183) and Pinecone (L184)
- Explain the deployment: containers (L288), scaling, and observability (L274)

## 1. One-Line Definition

**Qdrant is the self-hostable, open-source vector database built around rich filtering — embeddings and payload metadata (L180) with a filter API that makes scoped retrieval (L189) and tenant isolation (L320) first-class — the L186 middle path: self-hosted control and cost (L150) with filtering-heavy power, at the price of running it yourself.**

The one-sentence interview answer: *"Qdrant is the self-hosted middle (L185). Open source, deployable with a container (L288), and its superpower is filtering — payloads (metadata, L180) are first-class: filters compose on any field, so scoped retrieval (L189) and tenant isolation (L320) are native. It wins on the L186 rule when self-hosting beats managed: the corpus outgrew pgvector's ANN (L183) or the filter load needs a specialist (L186), but the team wants control and the cost model (L150) over Pinecone's managed bill (L184). The price: I run it — containers, scaling, observability (L274) — which is exactly why the L186 rule weighs ops before the choice."*

## 2. Mental Model

Think of Qdrant as **a warehouse you own and manage, built for precise picking.** Your data lives in it (self-hosted, L288); the shelves are organized by vectors (ANN, L182), and every box carries a detailed label (payload metadata, L180) you can filter on — "pick only the boxes from this supplier, this quarter, this department". You run the warehouse (ops, L274), you own the cost (L150), and the picking is precise because the labeling is first-class.

```text
   THE WAREHOUSE YOU RUN (L185)
   ┌──────────────────────────────────────────────┐
   │ Qdrant (self-hosted, L288)                   │
   │  vectors (ANN, L182)                         │
   │  + PAYLOAD — metadata as first-class (L180)  │
   │    filter: supplier · quarter · department   │
   │  scoped retrieval (L189) · isolation (L320)  │
   │  you run it: ops (L274), cost (L150)         │
   └──────────────────────────────────────────────┘
```

The mental model is **owned warehouse with great labels**: the vectors are the shelves, the payload is the labeling system, and the filtering is the precise picking — all under your ops and your cost.

## 3. Visual Flow — Qdrant in the Architecture

```text
   ingestion (L176)                     queries (L189)
        │                                    │
        ▼                                    ▼
   ┌──────────────────────────────────────────────────────┐
   │ 1 · UPSERT with PAYLOAD (L180)                       │
   │     vector + payload: source, date, tenant, section  │
   │     — the metadata is first-class (L185)             │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 2 · FILTER (L180, L189)                              │
   │     must: tenant = acme AND date ≥ 2024-01-01        │
   │     — filters compose on ANY payload field           │
   └──────────────────┬───────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────┐
   │ 3 · ANN within the filter (L182)                     │
   │     HNSW over the scoped set — pre-filtered          │
   └──────────────────────────────────────────────────┘
                      ▼
   top-k → context (L191) → citations from payload (L192)
```

The flow is the filtering story: **upsert with payload, compose filters, ANN within the scope** — filtering-heavy retrieval as the design center.

## 4. How It Works — The Store, the Filtering, the Middle Path

- **What it is.** A self-hostable, open-source vector database — a container (L288), a REST/gRPC API, ANN indexes (HNSW, L182) — with a payload system: metadata (L180) stored beside every vector, indexable and filterable on any field.
- **The filtering model (L180).** Filters compose with `must`/`must_not` on any payload field — tenant (L320), source, date, section — applied *before* ANN (pre-filtering, L189), so scoped retrieval is both correct and fast.
- **The hybrid (L187).** Qdrant supports sparse vectors — keyword and dense together (L187) — the hybrid search requirement in one store.
- **The middle path (L186).** Between pgvector (L183) — same database, simpler filters — and Pinecone (L184) — managed, richer ops — Qdrant is self-hosted with specialist filtering. The L186 rule picks it when: the corpus/filter load outgrew Postgres, and the team prefers control and cost (L150) over managed (L184).
- **The ops story (L274).** Self-hosting means containers (L288), scaling, backups, and observability (L274) — the cost of control, weighed in the L186 decision.

> [!NOTE]
> **The filtering is the differentiator, and the pre-filter is the mechanism (L189).** Post-filtering — search, then filter — can return too few results when the filter is selective. Qdrant's payload filters apply *before* ANN: the search runs inside the scoped set, so tenant isolation (L320) and date scoping (L140) are both correct and fast. The senior answer names pre-filtering as the reason filtering-heavy workloads pick Qdrant (L186).

## 5. Real Project Usage

- **Filtering-heavy RAG (L180).** "Only answers from this tenant, this source, this quarter" — the payload filter is the query's spine (L189).
- **Multi-tenant platforms (L320).** Tenant in the payload, `must: { tenant }` on every query — isolation (L320) as a native filter.
- **Self-hosted AI (L283–284).** The team runs the stack (L284); Qdrant fits the containers-and-control posture (L288).
- **Hybrid search (L187).** Sparse + dense in one store — keyword precision and semantic recall together (L187).
- **Cost-conscious scale (L150).** The corpus outgrew pgvector (L183) but Pinecone's bill (L184) is off the table — self-hosted Qdrant is the middle (L186).

The through-line: **Qdrant is the "control and filtering" answer** — self-hosted, open source, and built around the payloads that make retrieval scoped (L180).

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "Qdrant is a self-hostable, open-source vector DB (L185) — a container (L288), ANN (L182), with payloads as first-class metadata (L180)."
2. **The filtering.** "Filters compose on any payload field and apply before ANN (L189) — scoped retrieval and tenant isolation (L320) are native."
3. **The trade.** "Control and cost (L150) over managed (L184), at the price of running it — containers, scaling, observability (L274)."
4. **The rule.** "It wins on L186 when self-hosting beats managed and filtering beats pgvector's (L183) — the middle path, chosen by the rule."

## 7. Senior-Level Insights

- **Pre-filtering is the quality mechanism (L189).** Filters before ANN keep scoped retrieval correct and fast — the reason filtering-heavy workloads pick Qdrant (L186). The senior answer explains *how* the filter applies, not just that it exists.
- **Payload is a schema decision (L180).** The payload fields (L180) and their indexes (L185) are designed at ingestion (L176) — filter performance depends on which payload fields are indexed, like columns in Postgres.
- **The hybrid is the completeness move (L187).** Sparse + dense in one store (L187) — keyword precision and semantic recall without a second system — the L187 requirement covered by the L185 choice.
- **Self-hosting is an ops contract (L274).** Containers (L288), scaling, backups, and observability (L274) are the price of control (L150) — the L186 rule weighs the ops story before the feature list.
- **The abstraction still applies (L155, L186).** Behind the interface (L155), Qdrant is one deployment choice among three — the L186 rule stays a per-deployment decision, and the migration path (L222) stays documented.

## 8. Common Mistakes

- **Qdrant "because it's open source" (L186).** The rule decides — pgvector (L183) is still the default, and managed (L184) still beats self-hosting when ops are scarce.
- **Payload fields unindexed (L180).** Filters on unindexed payload fields — every query scans payloads; the filter is slow (L189).
- **Post-filtering by habit (L189).** Searching, then filtering in code — the selective-filter empty-result failure.
- **No ops plan (L274).** Self-hosting without backups, scaling, or observability — the control was the point, and it's unmanaged.
- **Tenant only in the vector.** No `must: { tenant }` on every query (L320) — the leak (L312).
- **Ignoring the hybrid (L187).** Dense-only when the content has exact-match needs — the L187 upgrade missed.

## 9. Best Practices

- **Apply the L186 rule first** (L186) — filtering-heavy and self-hosting are the triggers.
- **Design the payload schema at ingestion** (L180, L176) — and index the filtered fields (L185).
- **Pre-filter, always** (L189) — filters before ANN keep scope correct and fast (L320).
- **Use the hybrid for exact-match content** (L187) — sparse + dense together.
- **Plan the ops** (L274) — containers (L288), backups, scaling, observability (L332).
- **Keep the interface** (L155) — the store stays a reversible choice (L186).

## 10. Interview Questions

**Q: When do you use Qdrant?**
> A: The L186 middle path (L185). When filtering-heavy retrieval — scoped by tenant, source, date (L180) — outgrew pgvector's simplicity (L183), and self-hosting beats managed (L184): control, cost (L150), and open source over Pinecone's bill. Qdrant's superpower is the payload: metadata is first-class, filters compose before ANN (L189). If the corpus is small, pgvector (L183) stays the default; if ops are scarce, Pinecone (L184) wins.

**Q: What makes Qdrant's filtering different?**
> A: Payloads are first-class (L180), and filters apply before the ANN search (L189). A `must: { tenant, date }` filter scopes the search itself — tenant isolation (L320) is correct *and* fast, no post-filtering surprises. That's the filtering-heavy design center: the metadata is the query's spine, not an afterthought.

**Q: What's the trade vs Pinecone?**
> A: Control and cost over managed (L186). I run Qdrant — a container (L288), backups, scaling, observability (L274) — so the cost model is mine (L150), not per-token (L184). The price is the ops story: self-hosting demands the discipline (L274) that Pinecone sells as a service. The L186 rule weighs ops availability before the choice.

**Q: How does Qdrant handle hybrid search?**
> A: Sparse and dense vectors in one store (L187) — keyword precision (BM25-style) and semantic recall together, in one query. For content with exact-match needs — codes, names, IDs — the hybrid (L187) covers what dense-only misses, without a second system.

## 11. Follow-Up Questions

- How does the pre-filter work under the hood (L189)?
- What payload fields do you index, and why (L180)?
- How does Qdrant deploy — containers, scaling (L288)?
- When does the L186 rule pick Qdrant over pgvector (L183)?
- How does the hybrid compose with filters (L187)?

## 12. Comparison Table — The Three Stores (L186)

| | pgvector (L183) | Qdrant (this lesson) | Pinecone (L184) |
|---|---|---|---|
| Hosting | your Postgres | self-hosted (L288) | managed |
| Filtering | WHERE clauses | first-class payloads (L180) | filter API |
| Filter timing (L189) | query-time | pre-ANN | pre-ANN |
| Ops (L274) | your DB | yours — full story | zero ops |
| Cost (L150) | your Postgres | your infra | per-token/hour |
| Best when | data lives in PG | filtering-heavy + self-host | managed scale |

The senior read: **the L186 rule is the row selector** — where the data lives, how much ops exists, and how heavy the filtering is.

## 13. Code Example — Qdrant with First-Class Filters

```js
// Qdrant: payload metadata + pre-filtered ANN (L185, L180, L189).
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL, apiKey: process.env.QDRANT_KEY });  // L275

// INGEST — vector + payload together (L176, L180).
await qdrant.upsert('docs', {
  points: chunks.map((c) => ({
    id: c.hash,                              // idempotency (L176)
    vector: c.embedding,                     // L181
    payload: {                               // THE metadata (L180)
      source: c.source, date: c.date,
      tenant: c.tenant, section: c.section,
    },
  })),
});

// QUERY — filters BEFORE the ANN search (L189, L320).
await qdrant.search('docs', {
  vector: queryEmbedding,
  filter: {
    must: [
      { key: 'tenant', match: { value: session.tenant } },   // isolation (L320)
      { key: 'date', range: { gte: '2024-01-01' } },         // freshness (L140)
    ],
  },
  limit: 5,                                  // top-k (L189)
  with_payload: true,                        // citations (L192)
});

// HYBRID (L187) — sparse + dense in one store.
await qdrant.search('docs', {
  prefetch: [{ query: denseVector, using: 'dense' }],       // semantic (L181)
  query: sparseVector,                                       // keyword (L187)
  using: 'sparse',
  filter: { must: [{ key: 'tenant', match: { value: session.tenant } }] },  // L320
  limit: 5,
});
```

```text
What the reader must SEE — the filtering story:

  payload: {…}              metadata stored beside the vector (L180)
  filter.must: tenant, date → scope BEFORE ANN (L189, L320)
  with_payload: true        → citations come back (L192)
  sparse + dense            → the hybrid in one store (L187)

  Payloads first-class, filters pre-ANN, hybrid native.
```

```narrate
3-4: The client — connection details are server secrets (L275).
7-16: Ingestion stores the payload (metadata) beside each vector (L180) — idempotent by content hash (L176).
19-27: The query's filter applies before the ANN search — tenant isolation (L320) and freshness (L140) as native filters (L189).
29-31: Results carry payloads — the citations' backbone (L192).
34-42: The hybrid — sparse keyword and dense semantic in one store (L187), still scoped by tenant (L320).
```

> [!TIP]
> The two lines that define the middle path: **`filter: { must: [{ key: 'tenant' … }] }`** (isolation before ANN, L320) and the **sparse+dense hybrid** (L187). **Filtering-heavy, self-hosted, and complete.**

## 14. Performance Notes

- **Index the payload fields you filter on (L180, L185).** Filtering on an unindexed payload field scans payloads — index tenant, date, source like Postgres columns (L183).
- **Pre-filtering keeps ANN fast (L189).** The search runs inside the scoped set — selective filters don't degrade to post-filter empty results.
- **Self-hosting is your capacity story (L274).** Containers (L288) and replicas are yours — monitor (L332) and plan (L369), because the ops are the trade (L186).
- **The hybrid adds index cost (L187).** Sparse vectors double the index — the L187 quality at the L150 cost, weighed in the choice.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Slow filtered queries | Payload fields unindexed (L180) | Index the filtered fields (L185) |
| Empty results on selective filters | Post-filtering (L189) | Pre-filter with payload `must` |
| Cross-tenant results | Missing tenant filter (L320) | Add the `must` by construction |
| Index too big | Hybrid sparse vectors (L187) | Weigh the L150 cost |
| Ops incidents | No backups/observability (L274) | Add monitoring (L332), backups |

## 16. Quick Revision Notes

- Qdrant = **self-hostable, open-source, filtering-heavy** vector DB (L185).
- Payloads = **metadata as first-class citizens** (L180).
- Filters = **pre-ANN `must` composition** (L189) — isolation native (L320).
- Hybrid (L187) = **sparse + dense in one store**.
- The trade (L186): **control and cost (L150) vs the ops story (L274)**.
- The rule: **pgvector (L183) default, Qdrant middle, Pinecone (L184) managed** — L186 selects.

## 17. Cheat Sheet

```text
QDRANT = the self-hosted middle — filtering-heavy, open source

WHAT IT IS (L185)
  self-hostable vector DB — container (L288), ANN (L182)
  payloads = first-class metadata (L180)

THE FILTERING (L180, L189)
  filter.must: { tenant, date, source } — composed
  applied BEFORE the ANN search — pre-filtering
  scoped retrieval (L189) · isolation (L320) · freshness (L140)

THE HYBRID (L187)
  sparse + dense in one store — keyword + semantic

THE TRADE (L186)
  + control · cost model yours (L150) · open source
  − you run it: ops (L274), scaling, backups, observability

THE RULE (L186)
  data in Postgres + simple filters → pgvector (L183)
  filtering-heavy + self-host → Qdrant
  managed scale / zero ops → Pinecone (L184)
  keep the interface (L155) — the store is reversible

INTERVIEW, 4 MOVES
  1 define  "self-hosted, open source, payloads first-class"
  2 filter  "pre-ANN composition (L189) — isolation native (L320)"
  3 trade   "control + cost vs the ops story (L274)"
  4 rule    "the L186 middle between pgvector and Pinecone"
```

## 18. Key Takeaways

> [!RECAP]
> - Qdrant is the **self-hostable, open-source vector DB** (L185) whose superpower is filtering — payloads as first-class metadata (L180)
> - **Filters compose before the ANN search** (L189) — scoped retrieval (L189), tenant isolation (L320), and freshness (L140) are native
> - **The hybrid is in one store** (L187) — sparse keyword and dense semantic together
> - The trade is **control and cost (L150) against the ops story** (L274) — self-hosting demands the discipline that managed (L184) sells
> - The **L186 rule** selects: pgvector (L183) for the default, Qdrant for filtering-heavy self-hosting, Pinecone (L184) for managed scale
> - **The interface (L155) keeps the store reversible** — the choice is per-deployment, not a marriage

## Check your understanding

Answer these without looking back.

1. What is Qdrant's superpower (L185)?
2. How do filters apply — and why does it matter (L189)?
3. What's the trade vs Pinecone (L186)?
4. How does the hybrid work in one store (L187)?
5. What payload fields do you index, and why (L180)?
6. When does the L186 rule pick Qdrant over pgvector?
7. What does self-hosting demand (L274)?
8. Why does the interface matter (L155)?

## A Closing Note — The Middle Path, Chosen by the Rule

You now hold the self-hosted middle: **Qdrant — filtering-heavy, payload-first, hybrid-native, and yours to run.** It's the L186 answer when control and cost beat managed, and filtering beats pgvector's simplicity — a deployment choice behind the interface (L155).

Next: the decision itself — vector database selection (L186), the rule that picks between Postgres, Qdrant, and Pinecone.
