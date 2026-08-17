# Lesson 349 — RAG Platform

**Interview importance:** ⭐⭐⭐⭐⭐ — "ingestion, retrieval, and synthesis as a multi-tenant platform" — the answer is *the RAG design*: the pipeline, the index, and the tenants (L349).**

L197 built the production RAG (L197) and L347 the protocol; this lesson is **the protocol run on a RAG platform**: the RAG platform — the ingestion, the retrieval, and the synthesis as a multi-tenant platform (L349): the design (the protocol L347 run, L349), the ingestion (L176), the retrieval (L189), and the multi-tenancy (L320). The AI shape (L173): the RAG (L280) — the platform (L349) with the tenants (L320). This lesson is the knowledge's design (L349).

The distinction this lesson is built on: a **junior** describes the prompt. A **solutions architect** designs the platform (L349): the ingestion (L176), the retrieval (L189), and the isolation (L320) — the protocol (L347) run on the RAG (L349).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the RAG's requirements (L349)
- Explain the ingestion: the pipeline (L176)
- Explain the retrieval: the search (L189)
- Explain the multi-tenancy: the isolation (L320)
- Explain the AI shape: the knowledge's platform (L349)

## 1. One-Line Definition

**The RAG platform is the protocol run on a knowledge product (L349) — the clarify (the users L162, the documents L176, the freshness L335, L349), the ingestion (the pipeline L176: the parse L177, the chunk L178, the embed L181, the index L183, L349), the retrieval (the search L189: the top-k L189, the reranking L190, the hybrid L187, L349), and the multi-tenancy (the isolation L320: the per-tenant indexes L183 and the filters L189, L349) — the RAG (L280), platformed (L349).**

The one-sentence interview answer: *"The RAG platform is the protocol, run (L349). The clarify (L349): the users (L162) — the questioners (L349); the documents (L176) — the sources (L349); the freshness (L335) — how new the answers must be (L349); and the scale (L347) — the queries (L349) and the documents (L349). The ingestion (L176): the pipeline (L176) — the parse (L177), the chunk (L178), the embed (L181), and the index (L183) — the S3 (L265) events (L276) triggering (L349), the queue (L270) absorbing (L349). The retrieval (L189): the search (L189) — the top-k (L189), the reranking (L190), and the hybrid (L187) — the keyword plus the vector (L187). The multi-tenancy (L320): the isolation (L320) — the per-tenant indexes (L183) and the filters (L189) — the tenant ID (L320) everywhere (L349). The AI shape (L173): the RAG (L280) — the platform (L349): the ingestion (L176), the retrieval (L189), and the isolation (L320) — the protocol's (L347) run on the knowledge (L349)."*

## 2. Mental Model

Think of the RAG platform as **the city's public library system.** The system (the RAG platform, L349) serves the readers (the users, L162) across the branches (the tenants, L320): each branch (L320) has its own shelves (the indexes, L183) — the branch's books (the documents, L176) only (L320). The intake (the ingestion, L176): the book deliveries (the documents, L176) — the sorting (the parse, L177), the cutting (the chunk, L178), the cataloging (the embed, L181), the shelving (the index, L183) — the mailroom (the queue, L270) absorbing the batches (L349). The reference desk (the retrieval, L189): the question (L349) → the catalog (L189) → the best books (the top-k, L189), re-ranked (L190). The system works because the intake is pipelined, the desk is fast, and the branches are separated (L349).

```text
   the library system (the RAG, L349)
   ┌────────────────────────────────────────────────────────┐
   │ the intake (the ingestion, L176) — the sort, the cut,  │
   │ the catalog (L177, L178, L181)                         │
   │ the desk (the retrieval, L189) — the top-k (L189), the │
   │ rerank (L190)                                          │
   │ the branches (the tenants, L320) — the separate        │
   │ shelves (L183)                                         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the library system**: the intake, the desk, and the branches (L349).

## 3. Visual Flow — One Document's Path

```text
   the document (L176)
        │  the S3 event (L276)
        ▼
   ┌────────────────────── THE INGESTION (L176) ────────────────────────┐
   │  the parse (L177) → the chunk (L178) → the embed (L181)           │
   │  → the index (L183) — the queue (L270) absorbing (L349)           │
   │  the per-tenant (L320) pipeline (L349)                            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RETRIEVAL (L189) ────────────────────────┐
   │  the query (L349) → the embed (L181) → the search (L189)          │
   │  → the top-k (L189) → the rerank (L190) → the context (L191)      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SYNTHESIS (L349) ────────────────────────┐
   │  the model (L278) → the grounded answer (L337) with the          │
   │  citations (L192)                                                 │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the document: **ingest → retrieve → synthesize** (L349).

## 4. How It Works — The Platform, Part by Part

- **The clarify (L349).** The users (L162), the documents (L176), the freshness (L335), and the scale (L347).
- **The ingestion (L176).** The pipeline (L176): the parse (L177), the chunk (L178), the embed (L181), the index (L183) — the S3 (L265) events (L276) and the queue (L270).
- **The retrieval (L189).** The search (L189): the top-k (L189), the reranking (L190), and the hybrid (L187).
- **The multi-tenancy (L320).** The isolation (L320): the per-tenant indexes (L183) and the filters (L189) — the tenant ID (L320) everywhere (L349).

> [!NOTE]
> **The platform's shape: the pipeline in, the search in the middle, the synthesis out (L349).** The senior answer separates the three (L349): the ingestion (L176) — the write path (L349): the parse (L177), the chunk (L178), the embed (L181) — async (L222) through the queue (L270); the retrieval (L189) — the read path (L349): the top-k (L189), the rerank (L190) — the sub-second (L151); and the synthesis (L349) — the model (L278) with the grounded context (L191) and the citations (L192). The platform (L349) is the write path and the read path, separated (L349).

## 5. Real Project Usage

- **A knowledge SaaS (L357).** The RAG platform (L349) — the per-tenant (L320) indexes (L183).
- **A support copilot (L350).** The RAG (L349) — the help center's (L265) documents (L176) — the grounded answers (L337).
- **A document workspace (L353).** The ingestion (L176) — the uploaded documents (L316) — the search (L189).
- **A multi-tenant SaaS (L357).** The isolation (L320) — the tenant ID (L320) in the indexes (L183) and the filters (L189).
- **Anything RAG (L280).** The platform (L349) — the ingestion (L176), the retrieval (L189), the isolation (L320).

The through-line: **the platform is the knowledge's** — the pipeline, the search, and the branches (L349).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The users, the documents, the freshness (L349)."
2. **The ingestion.** "The parse, the chunk, the embed, the index (L176)."
3. **The retrieval.** "The top-k (L189), the rerank (L190), the hybrid (L187)."
4. **The multi-tenancy.** "The per-tenant indexes and the filters (L320)."

## 7. Senior-Level Insights

- **The write path and the read path separate (L349).** The ingestion (L176) — the async (L222) queue (L270); the retrieval (L189) — the sub-second (L151) — the separation (L349) is the platform's (L349).
- **The chunking is the retrieval's quality (L178).** The chunk's size (L178) — the recall (L338) and the cost (L334) — the tuned (L178) chunking (L349).
- **The reranking is the precision's lever (L190).** The top-k (L189) → the rerank (L190) — the precision (L338) up (L349).
- **The isolation is the tenants' (L320).** The per-tenant indexes (L183) and the filters (L189) — the L320 discipline (L320), platform-shaped (L349).
- **The eval is the platform's gate (L341).** The retrieval (L338) and the groundedness (L337) — the L341 suite (L341) gating (L349).

## 8. Common Mistakes

- **The prompt-only RAG (L349).** The retrieval (L189) described as the prompt (L349) — the pipeline (L176) and the index (L183) are the platform (L349).
- **The sync ingestion (L176).** The parse (L177) in the request (L349) — the queue (L270) and the workers (L266) are the pipeline (L349).
- **The shared index (L320).** The one index (L183) for all (L320) — the tenant filter (L189) is the isolation (L349).
- **The top-k un-reranked (L189).** The raw search (L189) — the rerank (L190) is the precision (L338).
- **The eval-less platform (L341).** The retrieval (L338) and the groundedness (L337) un-measured (L349) — the L341 suite (L341) (L349).

## 9. Best Practices

- **Separate the paths** (L349) — the write (L176) and the read (L189).
- **Async the ingestion** (L222) — the queue (L270) and the workers (L266).
- **Rerank the results** (L190) — the precision (L338).
- **Isolate the tenants** (L320) — the indexes (L183) and the filters (L189).
- **Gate the evals** (L341) — the retrieval (L338) and the groundedness (L337).

## 10. Interview Questions

**Q: Walk me through the RAG platform.**
> A: The protocol, run (L349). The clarify — the users, the documents, the freshness (L349). The ingestion — the parse, the chunk, the embed, the index (L176). The retrieval — the top-k (L189), the rerank (L190), the hybrid (L187). And the multi-tenancy — the per-tenant indexes and the filters (L320).

**Q: How do you design the ingestion?**
> A: The async pipeline (L176): the document (L176) lands in the S3 (L265) — the event (L276) triggers the worker (L266) — the parse (L177), the chunk (L178), the embed (L181), and the index (L183) — the queue (L270) absorbing the batches (L349). The write path (L349) never blocks the read path (L189).

**Q: How do you design the retrieval?**
> A: The read path (L189): the query (L349) embedded (L181), searched (L189) — the hybrid (L187) — the top-k (L189) retrieved, reranked (L190) — the context (L191) built for the model (L278). The sub-second (L151) path (L349), with the citations (L192) for the grounding (L337).

**Q: How do you isolate the tenants?**
> A: The L320 discipline (L320): the tenant ID (L320) in the indexes (L183) — the per-tenant (L320) partitions — and in the retrieval's filters (L189) — the tenant's (L320) chunks only (L349). The shared cluster (L349) with the isolated data (L320).

## 11. Follow-Up Questions

- What's the clarify (L349)?
- How do you design the ingestion (L176)?
- How do you design the retrieval (L189)?
- How do you isolate the tenants (L320)?
- What's the eval's gate (L341)?

## 12. Comparison Table — The RAG's Paths

| | The write path (L349) | The read path (L349) |
|---|---|---|
| The work (L349) | the ingestion (L176) | the retrieval (L189) + the synthesis (L349) |
| The timing (L349) | the async (L222) | the sub-second (L151) |
| The scale (L349) | the queue (L270) + the workers (L266) | the index (L183) + the cache (L171) |
| The failure (L349) | the DLQ (L232) | the fallback (L336) |

The senior read: **the paths separated** — the pipeline in, the search out (L349).

## 13. Code Example — The Platform, Applied

```js
// The RAG platform (L349) — the paths and the isolation (L349).
// 1 · THE INGESTION (L176) — the write path (L349).
async function ingest(tenantId, doc) {
  // the event (L276): the S3 (L265) document (L176)
  const chunks = chunk(parse(doc));                 // L177, L178
  const vectors = await embed(chunks);              // L181
  await index.write(`tenant:${tenantId}`, vectors); // the per-tenant (L320, L183)
  // the queue (L270) absorbs — the write path async (L222, L349)
}

// 2 · THE RETRIEVAL (L189) — the read path (L349).
async function retrieve(tenantId, query) {
  const qv = await embed(query);                    // L181
  const top = await index.search(`tenant:${tenantId}`, qv, { topK: 20 });  // L189, L320
  const reranked = await rerank(top, query);        // L190
  return reranked.slice(0, 5);                      // the top-5 (L189)
}

// 3 · THE SYNTHESIS (L349) — the grounded answer (L337).
async function answer(tenantId, query) {
  const chunks = await retrieve(tenantId, query);
  const out = await model.invoke({
    query,
    context: buildContext(chunks),                  // L191
  });
  return { answer: out, citations: chunks.map((c) => c.source) };  // L192
}

// 4 · THE EVAL (L341) — the retrieval (L338) and the groundedness (L337).
```

```text
What the reader must SEE — the platform, applied:

  chunk + embed + index.write   → the ingestion (L176, L181)
  tenant:{id} in the index      → the isolation (L320, L183)
  search + rerank + top-5       → the retrieval (L189, L190)
  buildContext + citations      → the synthesis (L191, L192)
  the evals (L338, L337)        → the gate (L341)

  The write path, the read path, the isolation (L349).
```

```narrate
4-9: The ingestion — the parse, the chunk, the embed, and the per-tenant index (L176, L320).
11-15: The retrieval — the search, the rerank, and the top-5 (L189, L190).
17-23: The synthesis — the grounded answer with the citations (L191, L192).
25: The eval — the retrieval and the groundedness gated (L338, L337, L341).
```

> [!TIP]
> The pair that defines the platform: **the per-tenant index** (the isolation, L320) and **the reranked top-k** (the precision, L190). **Pipeline the ingestion, separate the paths, isolate the tenants, rerank the results, gate the evals — the knowledge's platform (L349).**

## 14. Performance Notes

- **The write path is the async (L349).** The queue (L270) — the ingestion (L176) never blocks the reads (L189).
- **The read path is the sub-second (L151).** The index (L183) and the cache (L171) — the TTFT (L145) preserved (L349).
- **The index is the storage (L183).** The vectors (L183) — the per-tenant (L320) duplication (L349).
- **The rerank is the latency's cost (L190).** The rerank (L190) — the milliseconds (L349) for the precision (L338).

## 15. Debugging Scenarios

| Symptom | First check (L349) | The lever |
|---|---|---|
| The answers are ungrounded | The retrieval (L189) | The recall (L338), the chunks (L178) |
| The ingestion lags | The queue (L270) | The workers (L266), the DLQ (L232) |
| The tenants mix | The isolation (L320) | The filter (L189), the index (L183) |
| The search is noisy | The rerank (L190) | The precision (L338) |
| The regressions ship | The evals (L341) | The suite (L341) in the CI (L296) |

## 16. Quick Revision Notes

- The RAG platform = **the protocol's run on the knowledge** (L349): the clarify, the ingestion, the retrieval, the multi-tenancy.
- The clarify: **the users (L162), the documents (L176), the freshness (L335)**.
- The ingestion: **the parse (L177), the chunk (L178), the embed (L181), the index (L183)**.
- The retrieval: **the top-k (L189), the rerank (L190), the hybrid (L187)**.
- The multi-tenancy: **the per-tenant indexes (L183) and the filters (L189)**.

## 17. Cheat Sheet

```text
RAG PLATFORM = the ingestion, the retrieval, the synthesis

THE CLARIFY (L349)
  the users (L162) · the documents (L176) · the freshness (L335)
  the scale (L347): the queries (L349) and the documents (L349)

THE INGESTION (L176) — THE WRITE PATH (L349)
  the parse (L177) → the chunk (L178) → the embed (L181)
  → the index (L183) — the queue (L270) absorbing (L349)
  the S3 (L265) events (L276) triggering (L349)

THE RETRIEVAL (L189) — THE READ PATH (L349)
  the query → the embed (L181) → the search (L189)
  → the top-k (L189) → the rerank (L190) → the hybrid (L187)
  → the context (L191) — the sub-second (L151)

THE SYNTHESIS (L349)
  the model (L278) → the grounded answer (L337)
  with the citations (L192)

THE MULTI-TENANCY (L320)
  the per-tenant indexes (L183) · the filters (L189)
  the tenant ID (L320) everywhere (L349)

INTERVIEW, 4 MOVES
  1 clarify   "the users, the documents, the freshness (L349)"
  2 ingestion "the parse, the chunk, the embed, the index (L176)"
  3 retrieval "the top-k, the rerank, the hybrid (L189)"
  4 multi-tenant "the per-tenant indexes and filters (L320)"
```

## 18. Key Takeaways

> [!RECAP]
> - The RAG platform is **the protocol run on a knowledge product** (L349): the clarify (L349), the ingestion (L176), the retrieval (L189), and the multi-tenancy (L320)
> - **The clarify** (L349): the users (L162), the documents (L176), the freshness (L335), and the scale (L347)
> - **The ingestion** (L176): the pipeline (L176) — the parse (L177), the chunk (L178), the embed (L181), and the index (L183) — the S3 (L265) events (L276) and the queue (L270)
> - **The retrieval** (L189): the search (L189) — the top-k (L189), the reranking (L190), and the hybrid (L187)
> - **The multi-tenancy** (L320): the isolation (L320) — the per-tenant indexes (L183) and the filters (L189)
> - The platform's shape (L349): the write path (L176) and the read path (L189) separated (L349) — the pipeline in, the search out, the tenants isolated (L349)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L349)?
2. How do you design the ingestion (L176)?
3. How do you design the retrieval (L189)?
4. How do you isolate the tenants (L320)?
5. What's the eval's gate (L341)?
6. What's the write path (L349)?
7. What's the rerank (L190)?
8. What is the knowledge's platform (L349)?

## A Closing Note — The Library, Platformed

You now hold the design: **the ingestion, the retrieval, the synthesis, and the isolation — with the intake pipelined and the branches separated.** The library system is open — and every branch has its own shelves (L349).

Next: the tickets, the escalation, and the human handoff — AI Customer Support (L350).
