# Lesson 381 — Project 1: Production RAG SaaS

**Interview importance:** ⭐⭐⭐⭐⭐ — the first capstone: a multi-tenant knowledge platform from the schema to the evaluation (L381).**

This is the first capstone — the proof of the RAG (L349) and the SaaS (L357) modules. L349 designed the platform and L357 the tenants; this lesson is **the build**: Project 1 — the production RAG SaaS — a multi-tenant knowledge platform from the schema to the evaluation (L381): the scope (the requirements, L381), the architecture (the L349 platform, L381), and the build (the schema to the eval, L381). This lesson is the RAG's proof (L381).

The distinction this lesson is built on: a **specialist** describes the RAG. A **solutions architect** builds it (L381): the schema (L381), the pipeline (L349), and the evaluation (L341) — the capstone (L381) that fills the portfolio (L103).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the scope: the requirements (L381)
- Explain the architecture: the L349 platform (L381)
- Explain the data model: the schema (L381)
- Explain the build: the pipeline and the API (L381)
- Explain the evaluation: the evals (L341)

## 1. One-Line Definition

**Project 1 — the production RAG SaaS — is the multi-tenant knowledge platform, built from the schema to the evaluation (L381) — the scope (the requirements L359: the tenants L320, the documents L176, the queries L358, L381), the architecture (the L349 platform L349: the ingestion L176, the retrieval L189, the isolation L320, L381), the data model (the schema L381: the tenants L320, the documents L265, the chunks L178, the vectors L183, L381), and the evaluation (the evals L341: the retrieval L338, the groundedness L337, in the CI L296, L381) — the RAG's (L349) proof (L381).**

The one-sentence interview answer: *"Project 1 is the RAG SaaS, built end to end (L381). The scope (L381): the requirements (L359) — the tenants (L320): the multi-tenant (L357) knowledge (L381); the documents (L176): the PDFs (L177) and the markdown (L381); and the queries (L358): the natural language (L348) over the knowledge (L381). The architecture (L381): the L349 platform (L349) — the ingestion (L176): the S3 (L265) → the queue (L270) → the parse (L177), the chunk (L178), the embed (L181); the retrieval (L189): the pgvector (L183) with the hybrid (L187) and the rerank (L190); and the isolation (L320): the per-tenant (L320) indexes (L183) and the filters (L189). The data model (L381): the schema (L381) — the tenants (L320), the documents (L265), the chunks (L178), and the vectors (L183). The build (L381): the pipeline (L349), the API (L267), and the frontend (L96). The evaluation (L341): the evals (L341) — the retrieval (L338): the precision and the recall (L338) on the golden set (L342); and the groundedness (L337) — in the CI (L296), gating (L341). The RAG's (L349) proof (L381) — from the schema (L381) to the evaluation (L341)."*

## 2. Mental Model

Think of the RAG SaaS as **the knowledge library, built.** The builder (the architect, L381) builds the library (L381): the blueprint (the scope, L381) — the branches (the tenants, L320) and the collections (the documents, L176); the intake (the ingestion, L176) — the donations (the PDFs, L177) sorted (L177), cut (L178), and catalogued (L181); the shelves (the index, L183) — the per-branch (L320); the desks (the retrieval, L189); and the inspectors (the evals, L341) — the reference checks (L338). The library works because the blueprint is clear, the intake runs, and the inspectors gate (L381).

```text
   the knowledge library (the RAG SaaS, L381)
   ┌────────────────────────────────────────────────────────┐
   │ the blueprint (the scope, L381) · the intake (the      │
   │ ingestion, L176) · the shelves (the index, L183)       │
   │ the desks (the retrieval, L189) · the inspectors (the  │
   │ evals, L341)                                           │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the library**: the blueprint, the intake, and the inspectors (L381).

## 3. Visual Flow — The Build

```text
   THE SCOPE (L381) → the requirements (L359)
        │
        ▼
   THE DATA MODEL (L381) → the schema (L381)
        │
        ▼
   THE ARCHITECTURE (L381) → the L349 platform (L349)
   the ingestion (L176) → the retrieval (L189) → the isolation (L320)
        │
        ▼
   THE EVALUATION (L341) → the evals (L338, L337) in the CI (L296)
```

The flow is the build: **scope → schema → architecture → evaluation** (L381).

## 4. How It Works — The Build, Part by Part

- **The scope (L381).** The requirements (L359): the tenants (L320), the documents (L176), the queries (L358).
- **The architecture (L381).** The L349 platform (L349): the ingestion (L176), the retrieval (L189), the isolation (L320).
- **The data model (L381).** The schema (L381): the tenants (L320), the documents (L265), the chunks (L178), the vectors (L183).
- **The evaluation (L341).** The evals (L341): the retrieval (L338), the groundedness (L337), in the CI (L296).

> [!NOTE]
> **The capstone's arc: the schema to the evaluation (L381).** The senior answer builds the arc (L381): the schema (L381) — the data model (L381) designed first (L381): the tenants (L320), the documents (L265), the chunks (L178), the vectors (L183); the pipeline (L349) — the ingestion (L176) and the retrieval (L189); and the evaluation (L341) — the golden set (L342) with the retrieval (L338) and the groundedness (L337), gating the CI (L296). The arc (L381) — the schema to the eval (L341) — is the L349 platform (L349), built (L381).

## 5. Real Project Usage

- **The portfolio (L103).** Project 1 (L381) — the L349 proof (L381).
- **An interview (L381).** The walkthrough (L381) — the schema to the eval (L381).
- **A knowledge product (L357).** The RAG SaaS (L381) — the tenants (L320) and the knowledge (L349).
- **A support copilot (L350).** The RAG (L381) — the help center (L265) grounded (L337).
- **Anything RAG (L349).** The capstone (L381) — the L349 platform (L349), built (L381).

The through-line: **the proof is the RAG's** — the L349 platform (L349), from the schema (L381) to the eval (L341).

## 6. Interview Explanation

Say it in four moves:

1. **The scope.** "The tenants (L320), the documents (L176), the queries (L358)."
2. **The architecture.** "The L349 platform (L349) — the ingestion (L176), the retrieval (L189), the isolation (L320)."
3. **The data model.** "The schema (L381) — the tenants, the documents, the chunks, the vectors (L183)."
4. **The evaluation.** "The evals (L341) — the retrieval (L338) and the groundedness (L337) in the CI (L296)."

## 7. Senior-Level Insights

- **The schema is the foundation (L381).** The data model (L381) — the tenants (L320) and the chunks (L178) — the L370 seam (L370), schema-shaped (L381).
- **The isolation is the SaaS's (L320).** The per-tenant (L320) indexes (L183) and the filters (L189) — the L357 wall (L357), built (L381).
- **The evals are the gate (L341).** The retrieval (L338) and the groundedness (L337) — the L341 suite (L341) in the CI (L296) — the quality (L341) gated (L381).
- **The pipeline is the async (L176).** The queue (L270) — the ingestion (L176) — the L222 engine room (L222), built (L381).
- **The observability is the standard (L346).** The OTel (L346) — the tokens (L332) and the cost (L334) — the L346 standard (L346), in the capstone (L381).

## 8. Common Mistakes

- **The demo RAG (L381).** The prompt-only (L349) — the pipeline (L176) and the schema (L381) missing (L381).
- **The schema-less (L381).** The vectors (L183) without the tenants (L320) and the chunks (L178) — the data model (L381) first (L381).
- **The shared index (L320).** The one index (L183) — the cross-tenant (L320) — the isolation (L320) (L381).
- **The eval-less (L341).** The retrieval (L338) and the groundedness (L337) un-gated (L296) — the quality (L341) unknown (L381).
- **The un-observed (L346).** The tokens (L332) and the cost (L334) un-measured (L346) — the L346 standard (L346) (L381).

## 9. Best Practices

- **Design the schema first** (L381) — the tenants (L320), the chunks (L178), the vectors (L183).
- **Build the pipeline** (L349) — the ingestion (L176) and the retrieval (L189).
- **Isolate the tenants** (L320) — the per-tenant (L320) indexes (L183).
- **Gate the evals** (L341) — the retrieval (L338) and the groundedness (L337) in the CI (L296).
- **Observe the platform** (L346) — the OTel (L346) with the cost (L334).

## 10. Interview Questions

**Q: Walk me through Project 1.**
> A: The RAG SaaS, built end to end (L381). The scope — the tenants (L320), the documents (L176), the queries (L358). The architecture — the L349 platform (L349): the ingestion (L176), the retrieval (L189), the isolation (L320). The data model — the schema (L381). And the evaluation — the evals (L341) in the CI (L296).

**Q: What's the data model?**
> A: The schema (L381): the tenants (L320) — the multi-tenant (L357) root; the documents (L265) — the S3 (L265) sources; the chunks (L178) — the parsed (L177) and the chunked (L178); and the vectors (L183) — the pgvector (L183) embeddings (L181). The schema (L381) is the L370 seam (L370) — the per-tenant (L320) from the start (L381).

**Q: How do you evaluate it?**
> A: The L341 suite (L341): the golden set (L342) — the queries (L338) with the relevant docs (L342); the retrieval (L338) — the precision and the recall (L338); and the groundedness (L337) — the L337 check (L337). The suite (L341) in the CI (L296) — gating the deploy (L307) (L381).

**Q: How do you isolate the tenants?**
> A: The L320 wall (L320): the tenant ID (L320) in the indexes (L183) and the filters (L189) — the per-tenant (L320) retrieval (L189); the per-tenant (L320) keys (L269) in the cache (L269); and the per-tenant (L320) quotas (L149) in the gateway (L267) — the L357 wall (L357), built (L381).

## 11. Follow-Up Questions

- What's the scope (L381)?
- What's the data model (L381)?
- How do you evaluate it (L341)?
- How do you isolate the tenants (L320)?
- What's the arc (L381)?

## 12. Comparison Table — The Demo vs the Capstone

| | The demo RAG (L381) | The RAG SaaS (L381) |
|---|---|---|
| The schema (L381) | none (L381) | the tenants, the chunks, the vectors (L381) |
| The pipeline (L349) | the prompt (L349) | the ingestion (L176), the retrieval (L189) |
| The isolation (L320) | none (L381) | the per-tenant (L320) |
| The evals (L341) | none (L381) | the golden set (L342) in the CI (L296) |

The senior read: **the right column is the capstone** — the schema to the eval (L381).

## 13. Code Example — The Build, Started

```js
// Project 1 (L381) — the RAG SaaS, from the schema (L381).
// 1 · THE SCHEMA (L381) — the data model (L381).
const schema = {
  tenants:  { id: 'uuid', name: 'text' },              // L320
  documents: { id: 'uuid', tenantId: 'fk', s3Key: 'text' },   // L265, L320
  chunks:   { id: 'uuid', documentId: 'fk', index: 'int', text: 'text' },  // L178
  vectors:  { chunkId: 'fk', embedding: 'vector(1536)' },  // L181, L183
};

// 2 · THE PIPELINE (L349) — the ingestion (L176).
async function onDocumentUploaded(event) {             // the S3 event (L276)
  await queue.enqueue(event.documentId);               // the queue (L270)
}
async function worker(documentId) {                    // L266
  const text = await parse(documentId);                // L177
  const chunks = chunk(text);                          // L178
  const vectors = await embed(chunks);                 // L181
  await index.write(chunks, vectors, { tenantId });    // L183, L320
}

// 3 · THE RETRIEVAL (L189) — with the isolation (L320).
const top = await index.search(tenantId, query, { topK: 20 });   // L189, L320
const reranked = await rerank(top, query);             // L190

// 4 · THE EVALS (L341) — in the CI (L296).
//   the golden set (L342): the retrieval (L338) >= 0.85 recall (L381)
//   the groundedness (L337) >= 0.9 (L381)
```

```text
What the reader must SEE — the build, started:

  the tenants + chunks + vectors schema → the data model (L381)
  the queue + the parse + the embed     → the pipeline (L176)
  the per-tenant search + the rerank    → the retrieval (L189)
  the golden set in the CI              → the evals (L341)

  From the schema to the evaluation (L381).
```

```narrate
4-9: The schema — the tenants, the documents, the chunks, and the vectors (L381).
11-17: The pipeline — the queue-fed ingestion (L176, L270).
19-21: The retrieval — the per-tenant search and the rerank (L189, L320).
23-25: The evals — the golden set gating the CI (L341, L342).
```

> [!TIP]
> The pair that defines the capstone: **the tenant-scoped schema** (the foundation, L381) and **the golden-set gate** (the proof, L341). **Design the schema, build the pipeline, isolate the tenants, gate the evals — the RAG's proof (L381).**

## 14. Performance Notes

- **The pipeline is the async (L176).** The queue (L270) — the ingestion (L176) — the L222 engine room (L222) (L381).
- **The retrieval is the TTFT (L189).** The index (L183) and the rerank (L190) — the sub-second (L151) (L381).
- **The evals are the CI's (L341).** The golden set (L342) — the minutes (L381) in the pipeline (L296).
- **The cost is the tokens' (L332).** The embedding (L181) and the generation (L278) — the L334 attribution (L334) (L381).

## 15. Debugging Scenarios

| Symptom | First check (L381) | The lever |
|---|---|---|
| The answers are ungrounded | The retrieval (L189) | The recall (L338), the chunks (L178) |
| The tenants mix | The isolation (L320) | The filter (L189), the index (L183) |
| The ingestion lags | The queue (L270) | The workers (L266) |
| The quality drifts | The evals (L341) | The golden set (L342) |
| The bill explodes | The tokens (L332) | The caching (L171), the routing (L155) |

## 16. Quick Revision Notes

- Project 1 = **the RAG's proof** (L381): the scope, the architecture, the data model, the evaluation.
- The scope: **the tenants (L320), the documents (L176), the queries (L358)**.
- The architecture: **the L349 platform (L349) — the ingestion (L176), the retrieval (L189), the isolation (L320)**.
- The data model: **the schema (L381) — the tenants, the documents, the chunks, the vectors (L183)**.
- The evaluation: **the evals (L341) — the retrieval (L338) and the groundedness (L337) in the CI (L296)**.

## 17. Cheat Sheet

```text
PROJECT 1: PRODUCTION RAG SAAS = the multi-tenant knowledge platform

THE SCOPE (L381)
  the tenants (L320) — the multi-tenant (L357) knowledge (L381)
  the documents (L176) — the PDFs (L177), the markdown (L381)
  the queries (L358) — the natural language (L348)

THE ARCHITECTURE (L381) — THE L349 PLATFORM (L349)
  the ingestion (L176): the S3 (L265) → the queue (L270)
    → the parse (L177), the chunk (L178), the embed (L181)
  the retrieval (L189): the pgvector (L183), the hybrid (L187),
    the rerank (L190)
  the isolation (L320): the per-tenant (L320) indexes (L183)

THE DATA MODEL (L381)
  the tenants (L320) · the documents (L265) · the chunks (L178)
  the vectors (L183) — the schema (L381)

THE EVALUATION (L341)
  the retrieval (L338) — the precision and the recall (L338)
  the groundedness (L337) · the golden set (L342)
  in the CI (L296) — gating (L341)

INTERVIEW, 4 MOVES
  1 scope   "the tenants, the documents, the queries (L381)"
  2 architecture "the L349 platform (L349)"
  3 schema  "the data model (L381)"
  4 evals   "the golden set in the CI (L341)"
```

## 18. Key Takeaways

> [!RECAP]
> - Project 1 — the production RAG SaaS — is **the multi-tenant knowledge platform, built from the schema to the evaluation** (L381): the scope (L381), the architecture (L381), the data model (L381), and the evaluation (L341)
> - **The scope** (L381): the requirements (L359) — the tenants (L320), the documents (L176), and the queries (L358)
> - **The architecture** (L381): the L349 platform (L349) — the ingestion (L176), the retrieval (L189), and the isolation (L320)
> - **The data model** (L381): the schema (L381) — the tenants (L320), the documents (L265), the chunks (L178), and the vectors (L183)
> - **The evaluation** (L341): the evals (L341) — the retrieval (L338) and the groundedness (L337) — in the CI (L296), gating (L341)
> - The arc (L381): the schema (L381) to the evaluation (L341) — the L349 platform (L349), built (L381), the RAG's (L349) proof (L381), filling the portfolio (L103)

## Check your understanding

Answer these without looking back.

1. What's the scope (L381)?
2. What's the data model (L381)?
3. How do you evaluate it (L341)?
4. How do you isolate the tenants (L320)?
5. What's the arc (L381)?
6. What's the pipeline (L176)?
7. What's the golden set (L342)?
8. What is the RAG's proof (L381)?

## A Closing Note — The Library, Built

You now hold the first proof: **the scope, the architecture, the schema, and the evaluation — with the intake running and the inspectors gating.** The knowledge library is built — and it fills the portfolio (L381).

Next: the guarded, audited, approval-gated agent — Project 2 (L382).
