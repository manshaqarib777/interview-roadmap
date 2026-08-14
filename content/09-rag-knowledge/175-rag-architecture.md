# Lesson 175 — RAG Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "walk me through a RAG system" is the interview prompt — the answer is the *three-stage spine* — ingestion, retrieval, synthesis — and every later lesson hangs off it.

L174 gave you the pattern; this lesson is the **blueprint**. RAG architecture is the three-stage spine — ingestion, retrieval, synthesis — plus the four supporting layers that make it production: the **index** (where chunks live), the **orchestration** (where the question flows), the **cache** (L171) and the **evals** (L195). An architect draws this diagram before writing any code; this lesson teaches the diagram.

The distinction this lesson is built on: a **demo** has one script that "does RAG" in a file. A **solutions architect** has a *system*: offline ingestion pipelines (L176–179) that feed an index (L182–183), an online retrieval path (L187–190) with a budget (L149) and a cache (L171), a synthesis stage that constructs context (L191) and cites sources (L192), and an evaluation loop (L195) that measures the whole thing. This lesson is the map of that system.

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the three-stage spine: ingestion, retrieval, synthesis, and the data flow between them
- Place the four supporting layers: index, orchestration, cache, evals
- Explain the offline/online split — what runs when, and why
- Describe the per-question path: budget (L149), cache (L171), retrieval (L189), context (L191)
- Map every RAG lesson (L176–197) onto the architecture

## 1. One-Line Definition

**RAG architecture is the three-stage spine — ingestion, retrieval, synthesis — plus the four production layers around it: the index that stores chunks, the orchestration that runs the question path, the cache (L171) that skips repeats, and the evals (L195) that measure retrieval quality — the blueprint every RAG system, from prototype to platform, is a variation of.**

The one-sentence interview answer: *"RAG architecture is a spine of three stages. Ingestion (offline): documents → chunks (L178) → embeddings (L181) → index (L182). Retrieval (per question): embed the query, hybrid search (L187), top-k (L189), rerank (L190). Synthesis: build the context inside the budget (L191), generate with citations (L192). Around the spine sit four layers: the index itself (L183), orchestration (the L173 gateway), a cache for repeats (L171), and evals that measure retrieval (L195). The offline/online split is what makes it production — ingestion is a batch pipeline (L176), retrieval is a low-latency path (L151)."*

## 2. Mental Model

Think of RAG architecture as **a factory with two floors.** The ground floor is the offline factory — documents come in one end (ingestion, L176), and finished products — indexed chunks — come out the other. The top floor is the online shop — a customer walks in with a question (retrieval, L189), the shopkeeper finds the right product (top-k), wraps it in a budgeted box (context, L191), and the cashier (the model) answers with a receipt (citations, L192). The factory keeps the shelves stocked; the shop serves customers fast.

```text
   THE FACTORY (offline, batch)        THE SHOP (online, per question)
   ┌──────────────────────────┐        ┌──────────────────────────────┐
   │ docs → parse (L177)      │        │ question                     │
   │      → chunk (L178)      │        │   → embed (L181)             │
   │      → embed (L181)      │        │   → search (L187)            │
   │      → index (L182)      │        │   → top-k (L189) + rerank    │
   └───────────┬──────────────┘        │   → context (L191)           │
               │ the INDEX (L183)      │   → generate + cite (L192)   │
               ▼                       └──────────────────────────────┘
```

The mental model is **factory + shop sharing one warehouse**: the factory (offline) stocks the warehouse (the index); the shop (online) serves customers from it. Production RAG keeps the two decoupled — ingestion never blocks a question, and a question never triggers ingestion.

## 3. Visual Flow — The Whole System, One Diagram

```text
   ┌────────────────────────── OFFLINE (batch, L176) ──────────────────────────┐
   │  documents → parse (L177) → chunk (L178-179) → embed (L181)               │
   │       → index with metadata (L180) → the VECTOR INDEX (L182-183)          │
   └─────────────────────────────────┬─────────────────────────────────────────┘
                                     │  (the index — the shared warehouse)
                                     ▼
   ┌────────────────────────── ONLINE (per question, L151) ────────────────────┐
   │  question → CACHE check (L171) → embed (L181) → hybrid search (L187)      │
   │       → filter by metadata (L180) → top-k (L189) → rerank (L190)          │
   │       → context inside the budget (L191) → generate with citations (L192) │
   └─────────────────────────────────┬─────────────────────────────────────────┘
                                     ▼
   ┌────────────────────────── THE LOOP (L195) ────────────────────────────────┐
   │  eval the answers against a golden set → tune chunking (L178),            │
   │  top-k (L189), reranker (L190) → re-ingest → repeat                       │
   └────────────────────────────────────────────────────────────────────────────┘
```

The flow is the architecture: **an offline factory stocks a shared index; an online shop serves questions from it; an eval loop tunes both.** Every lesson from L176 to L197 is a box in this diagram.

## 4. How It Works — The Spine and the Layers

- **The three stages.** Ingestion (L176–181): documents to indexed chunks — offline, batch, repeatable. Retrieval (L182–190): question to relevant chunks — online, fast, budgeted. Synthesis (L191–192): chunks to a cited answer — the model's job, grounded in context.
- **The index (L182–186).** The shared warehouse: vectors + metadata (L180) in a store that supports similarity search and filtering — Postgres + pgvector (L183) first, specialist stores (L184–185) when scale demands.
- **The orchestration.** Where the question path runs — inside the L173 gateway: auth (L172), budget (L149), rate limit (L170), cache (L171), then retrieval and synthesis. The spine is a kitchen in the production floor plan (L173).
- **The cache (L171).** The same-question lever: an exact repeat skips retrieval *and* generation (L171). For a RAG app, cached repeats are the difference between a bill and a near-zero cost (L150).
- **The evals (L195).** The loop that measures the whole: a golden set of questions with expected sources; retrieval precision/recall and answer groundedness scored on every change (L341).

> [!NOTE]
> **The offline/online split is the architecture's spine.** Ingestion is a batch pipeline — slow, complete, repeatable, run on a schedule and on change (L176, L222). Retrieval is a request path — fast, budgeted, cached (L151, L171). Mixing them is the classic failure: doing ingestion on the question path (slow questions), or doing retrieval as a batch job (stale answers). The factory and the shop never share a process.

## 5. Real Project Usage

- **Support copilot.** Offline: help docs ingested nightly (L176). Online: each question retrieves from the index (L189), the cache (L171) serves repeats, citations (L192) link to the article.
- **Internal knowledge search.** HR + engineering docs in one index with tenant filters (L180); retrieval filters by department (L189).
- **E-commerce Q&A.** Product docs ingested per SKU with metadata (L180); "is this returnable?" retrieves the right policy chunk.
- **RAG platform (L349).** The architecture as a product: multi-tenant indexes (L320), per-tenant metadata filters (L180), and the ingestion pipeline exposed as a service.
- **Legal/finance research.** Freshness matters (L140): ingestion re-runs on doc change (L176), and every answer carries a citation (L192) — the audit trail is the product.

The through-line: **every RAG system is this diagram with different content** — the spine is constant, the docs and the scale vary.

## 6. Interview Explanation

Say it in four moves:

1. **The spine.** "Three stages: ingestion (offline, docs → chunks → embeddings → index), retrieval (embed the query, search, top-k), synthesis (context → cited answer)."
2. **The split.** "Ingestion is a batch pipeline (L176) — scheduled, repeatable, never on the question path. Retrieval is online — fast, budgeted (L149), cached (L171)."
3. **The layers.** "The index stores chunks with metadata (L180); orchestration runs inside the production gateway (L173); the cache serves repeats; evals (L195) measure retrieval."
4. **The loop.** "Every lesson is a box in this diagram — and the eval loop (L195) tunes chunking, top-k, and the reranker against a golden set."

## 7. Senior-Level Insights

- **The diagram is the deliverable (L175).** A senior interview answer starts with the spine and the offline/online split — before any tech names. The tech (L182–186) is a choice *within* the diagram, not the diagram itself.
- **The index is a database decision (L182–186).** Postgres + pgvector (L183) first — it's the boring default that lives with your data. Specialist stores (L184–185) are the "when scale demands" chapter, and the decision rule (L186) is a senior answer on its own.
- **Freshness is an ingestion problem (L176).** The eval loop (L195) measures the answers; the ingestion pipeline (L176) keeps them fresh. Both are part of the architecture — the demo has neither.
- **The cache is the economics (L171).** In a RAG app, many users ask the same questions. The response cache (L171) turns those repeats into zero-cost hits — it's where the RAG bill (L150) gets controlled.
- **The eval loop is the quality gate (L195, L341).** The golden set runs on every index change and every retrieval tweak — RAG quality is a *regression* problem (L341), and the architecture includes the harness that catches it.

## 8. Common Mistakes

- **Ingestion on the question path.** Chunking and embedding inside the request (L176) — slow questions, and the batch/realtime confusion the split exists to prevent.
- **No offline/online separation.** One script "does RAG" — no pipeline to refresh the index (L176), no fast path (L151).
- **The index as an afterthought.** Chunks in memory or a JSON file (L182) — no metadata (L180), no filtering, no scale. The index is a database decision.
- **No cache.** Every repeat pays full retrieval + generation (L171) — the biggest RAG cost lever ignored.
- **No evals.** Chunking, top-k, and reranking set by guesswork (L195) — the architecture lacks the loop that makes it improve.
- **RAG as a monolith.** Retrieval, context and generation in one function with no layers (L191) — no budget, no citations (L192), no testable units (L341).

## 9. Best Practices

- **Draw the spine first** — ingestion, retrieval, synthesis, and the offline/online split (L175).
- **Choose the index deliberately** (L186) — Postgres + pgvector (L183) first, specialist stores when the decision rule says so.
- **Store metadata with every chunk** (L180) — source, date, tenant — retrieval filters and citations depend on it.
- **Cache the repeats** (L171) — the response cache is the RAG economics (L150).
- **Budget the context** (L191, L149) — top-k and chunk size are token decisions.
- **Wire the eval loop from day one** (L195) — a golden set, scored on every change (L341).

## 10. Interview Questions

**Q: Walk me through a RAG system's architecture.**
> A: Three stages. Ingestion — offline, batch: documents → parse (L177) → chunk (L178) → embed (L181) → index with metadata (L180). Retrieval — per question: embed the query, hybrid search (L187), filter (L180), top-k (L189), rerank (L190). Synthesis — context inside the budget (L191), generate with citations (L192). Around the spine: the index (L183), orchestration in the L173 gateway, a cache (L171) for repeats, and evals (L195) that measure the whole.

**Q: Why the offline/online split?**
> A: The two workloads have opposite requirements. Ingestion is slow, complete, and repeatable — a batch pipeline (L176), run on a schedule and on change, never on the question path. Retrieval is a request path — fast (L151), budgeted (L149), cached (L171). Mixing them either makes questions slow (ingestion in the request) or answers stale (retrieval as a batch job).

**Q: What's the database decision?**
> A: Start with Postgres + pgvector (L183) — vectors live with my data, one database, no new infrastructure. Move to a specialist store (L184–185) when the decision rule (L186) says so — scale, filtering, or managed operations. The index is a database decision (L182), not an afterthought.

**Q: How does the eval loop fit in?**
> A: It's the fourth layer (L195). A golden set of questions with expected sources; every index change and retrieval tweak is scored for precision/recall and groundedness (L341). The loop tunes chunking (L178), top-k (L189), and the reranker (L190) — RAG quality is a regression problem, and the eval loop is the harness.

## 11. Follow-Up Questions

- Where does the cache sit, and what does it skip (L171)?
- How do tenant filters work in the index (L180, L320)?
- How does RAG architecture change for a platform (L349)?
- What does the ingestion pipeline look like in production (L176)?
- How do you measure the whole system (L195)?

## 12. Comparison Table — Demo vs Production RAG

| Layer | Demo | Production (this lesson) |
|---|---|---|
| Ingestion | script, manual | pipeline (L176), scheduled, on change |
| Index | in-memory list | database (L182–183), metadata (L180) |
| Retrieval | one vector search | hybrid (L187), filter (L180), rerank (L190) |
| Cache (L171) | none | response cache on repeats |
| Context (L191) | full docs | budgeted top-k |
| Citations (L192) | none | source on every claim |
| Evals (L195) | none | golden set, scored on change (L341) |

The senior read: **the right column is the L175 diagram** — every box is a lesson in this module.

## 13. Code Example — The Architecture in a Folder

```text
The architecture as a codebase shape (L175):

  ingestion/            THE FACTORY — offline, batch (L176)
    parse.ts            documents → text (L177)
    chunk.ts            text → chunks (L178-179)
    embed.ts            chunks → vectors (L181)
    index.ts            vectors → the index (L182)
    run.ts              the pipeline entry — scheduled (L176, L222)

  retrieval/            THE SHOP — online, per question (L189)
    search.ts           hybrid search + filters (L187, L180)
    rerank.ts           top-k reranking (L190)
    context.ts          budgeted context construction (L191)

  api/                  ORCHESTRATION — inside the gateway (L173)
    route.ts            auth → budget (L149) → cache (L171) → answer
    cache.ts            the response cache (L171)

  evals/                THE LOOP — measured quality (L195, L341)
    golden.ts           the golden question set
    score.ts            precision/recall + groundedness

  The factory runs on a schedule. The shop serves questions.
  The eval loop tunes both. That is the architecture.
```

```text
What the reader must SEE — the split, as a folder shape:

  ingestion/  offline · batch · scheduled (L176)
  retrieval/  online · per question · fast (L151)
  api/        the gateway wrap: budget (L149), cache (L171)
  evals/      the loop that measures (L195, L341)

  Factory and shop share the index — never the process.
```

```narrate
3-8: The factory — ingestion as a pipeline: parse, chunk, embed, index, scheduled (L176-182).
10-15: The shop — retrieval: search, rerank, context construction (L187-191).
17-20: Orchestration — the question path wrapped by the gateway's budget and cache (L149, L171, L173).
22-25: The eval loop — the golden set and the scoring that tunes the system (L195, L341).
```

> [!TIP]
> The folder shape *is* the architecture — **offline and online never share a directory.** If ingestion code lives on the request path, the split is broken; if retrieval is a batch job, the answers are stale. The split is the design.

## 14. Performance Notes

- **Retrieval is on the critical path (L151).** Embed + search + rerank must fit the TTFT budget (L145) — the vector query (L182) and the cache (L171) are the levers.
- **Ingestion is a batch workload (L222).** Embedding is expensive — queue it (L222), run it off-peak, and cache embeddings (L171) so re-ingestion of unchanged docs is free.
- **The index is the scaling axis (L182).** Search latency and index size grow together — the pgvector index (L183) and the specialist stores (L184–185) are the "bigger" answers.
- **The context is a budget (L149).** top-k × chunk size is the per-question token spend (L191) — the cache (L171) and the budget (L149) control the bill (L150).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Slow questions | Retrieval on the hot path (L151) | Cache (L171); check the index query (L182) |
| Stale answers | Ingestion not re-run on change (L176) | Schedule + trigger the pipeline |
| Bad retrieval quality | Chunking/top-k by guess (L178, L189) | Add the eval loop (L195); tune with data |
| Answers with no source | Citations not wired (L192) | Attach metadata at ingest (L180) |
| Ingestion blocks questions | The split broken (L175) | Move ingestion off the request path (L222) |

## 16. Quick Revision Notes

- RAG architecture = **three-stage spine + four layers** (L175).
- The spine: **ingestion (L176–181) → retrieval (L182–190) → synthesis (L191–192)**.
- The split: **offline factory, online shop, shared index** — never one process (L222).
- The layers: **index (L182), orchestration (L173), cache (L171), evals (L195)**.
- The economics: **context budget (L149) + cache (L171) + batch ingestion (L222)**.
- The loop: **golden set → score → tune chunking/top-k/reranker (L195, L341)**.

## 17. Cheat Sheet

```text
RAG ARCHITECTURE = the factory, the shop, the warehouse, the loop

THE SPINE
  ingest    docs → parse (L177) → chunk (L178) → embed (L181) → index (L182)
  retrieve  query → embed → search (L187) → filter (L180) → top-k (L189) → rerank (L190)
  generate  context (L191) → answer with citations (L192)

THE SPLIT — the design
  OFFLINE   ingestion = batch pipeline (L176, L222) — scheduled, on change
  ONLINE    retrieval = request path (L151) — fast, budgeted (L149), cached (L171)

THE FOUR LAYERS
  index       the database decision (L182-186): pgvector first (L183)
  orchestration  inside the L173 gateway: auth, budget, cache
  cache       response cache for repeats (L171) — the RAG economics
  evals       golden set → precision/recall + groundedness (L195, L341)

THE LOOP
  change → score → tune chunking (L178) · top-k (L189) · reranker (L190)

INTERVIEW, 4 MOVES
  1 spine    "ingest → retrieve → generate"
  2 split    "offline factory, online shop, shared index"
  3 layers   "index, orchestration, cache, evals"
  4 loop     "the golden set tunes the whole (L195)"
```

## 18. Key Takeaways

> [!RECAP]
> - RAG architecture is the **three-stage spine** — ingestion (L176–181), retrieval (L182–190), synthesis (L191–192) — plus **four layers**: index, orchestration, cache, evals
> - The **offline/online split** is the design: ingestion is a batch pipeline (L176, L222), retrieval is a fast request path (L151) — the factory and the shop share the index, never a process
> - The **index is a database decision** (L182–186) — Postgres + pgvector first (L183), specialists (L184–185) when the rule (L186) says so
> - The **cache is the economics** (L171) — repeats skip retrieval and generation; it's where the RAG bill (L150) is controlled
> - The **eval loop is the quality gate** (L195, L341) — a golden set scores every change and tunes chunking, top-k, and the reranker
> - Every lesson in this module is a **box in the L175 diagram** — the architecture is the map

## Check your understanding

Answer these without looking back.

1. Draw the spine and name each stage's lessons.
2. Why is the offline/online split the design's spine?
3. What are the four layers, and what does each do?
4. Why is the index a database decision (L182–186)?
5. Where does the cache sit, and what does it skip (L171)?
6. How does the eval loop tune the system (L195)?
7. What does the architecture look like as a codebase (L175)?
8. How does RAG architecture become a platform (L349)?

## A Closing Note — The Blueprint You'll Draw in Every Interview

You now hold the diagram that answers "walk me through a RAG system": **the offline factory, the online shop, the shared index, and the eval loop.** It's the map for every lesson ahead — ingestion, retrieval, synthesis, and the layers that make them production.

Next: the factory's first machine — document ingestion pipelines (L176), where messy files become a clean, repeatable index.
