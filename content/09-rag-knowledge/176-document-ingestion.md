# Lesson 176 — Document Ingestion Pipelines

**Interview importance:** ⭐⭐⭐⭐ — "how do you get documents into a RAG system?" — the answer is the *ingestion pipeline*: load, parse, chunk, embed, index — repeatable, incremental, and never on the question path (L175).

L174–175 gave you the spine. This lesson is its first machine: **ingestion** — the offline pipeline that turns raw documents into a searchable index. Every RAG system is only as good as this stage: a messy, duplicated, stale index poisons everything downstream (L196). The senior difference is not "do you have an ingestion script" — it's **repeatability** (run it again, same result), **incrementality** (only new/changed docs), and **observability** (you know what got ingested and when).

The distinction this lesson is built on: a **demo** has a script that reads some files and stuffs them into a vector store. A **solutions architect** has a pipeline: source connectors (L220), parsing (L177), chunking (L178–179), embedding (L181), upsert with dedup (L180), scheduled and event-triggered (L222), idempotent by content hash, and observable (L332) — the factory of the L175 architecture.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the ingestion pipeline's five stages: load, parse, chunk, embed, index
- Design for repeatability: idempotent runs, content-hash dedup (L180)
- Design for incrementality: scheduled + event-triggered re-ingestion (L222)
- Explain where ingestion lives in the architecture: offline, batch, never on the question path (L175)
- Describe the failure modes: parse failures, stale docs, index drift (L196)

## 1. One-Line Definition

**A document ingestion pipeline is the offline factory that turns raw documents into a searchable index — load from sources (L220), parse (L177), chunk (L178–179), embed (L181), and upsert with metadata (L180) — designed to be repeatable (idempotent), incremental (only what changed), and observable, so the index always reflects the documents and never blocks a question (L175).**

The one-sentence interview answer: *"Ingestion is the offline factory of RAG. Five stages: load from the sources (L220), parse to text (L177), chunk (L178), embed (L181), and upsert into the index with metadata (L180). The design rules are three: repeatable — the run is idempotent, keyed by content hash, so re-running is safe (L180); incremental — only new and changed docs are re-processed, on a schedule and on change events (L222); observable — I know what was ingested, when, and what failed (L332). Ingestion is a batch pipeline (L176), never on the question path (L175)."*

## 2. Mental Model

Think of ingestion as **a factory assembly line** — raw materials in one end, finished, indexed products out the other.

```text
   raw materials            the assembly line               finished goods
   ┌────────────┐   ┌────────────────────────────────┐   ┌────────────────┐
   │ PDFs, docs │   │ load → parse → chunk → embed   │   │ the INDEX      │
   │ wiki, Slack│ → │ → index (L176-181)             │ → │ (L182-183)     │
   │ emails     │   │ idempotent · incremental ·     │   │ searchable,     │
   └────────────┘   │ observable (L180, L222, L332)  │   │ with metadata   │
                    └────────────────────────────────┘   └────────────────┘
```

The mental model is **factory, not script**: an assembly line with defined stages, quality checks, and a finished product that's stored — not a one-off script that happens to work once.

## 3. Visual Flow — A Document Through the Pipeline

```text
   a document arrives (new, or changed — L222)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · LOAD (L220)   pull from the source: S3, wiki, CRM,   │
   │                   Slack, email — via connectors (L220)   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · PARSE (L177)  PDF → text (L177), HTML → text,        │
   │                   images → OCR — messy formats become    │
   │                   clean text with structure kept         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · CHUNK (L178)  text → overlapping chunks, sized for   │
   │                   the retrieval task (L179)              │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · EMBED (L181)  each chunk → a vector (L147)           │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 5 · UPSERT (L180)  index with metadata (source, date,    │
   │                    tenant, section) — dedup by content   │
   │                    hash, so re-runs are idempotent       │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the index reflects the document — searchable (L182), filterable (L180)
```

The flow is the five-stage factory: **load → parse → chunk → embed → index.** Every stage is a lesson (L177–181), and the whole line is designed to run again and again without damage.

## 4. How It Works — The Five Stages and the Three Design Rules

- **Load (L220).** Pull from sources via connectors — file systems, S3 (L265), wikis, CRMs, Slack, email. The connector knows the source's shape: a file path, an object key, a page, a message thread.
- **Parse (L177).** Convert the raw format to clean text: PDFs (text layer or OCR, L177), HTML, Markdown, Word. Structure matters — headings, tables, and code blocks are signals for chunking (L178).
- **Chunk (L178–179).** Split the text into retrieval-sized pieces with overlap — the granularity decision that determines search quality (L178).
- **Embed (L181).** Convert each chunk to a vector with the embedding model (L147) — the representation retrieval searches over.
- **Index/upsert (L180).** Write the chunk + vector + metadata into the store (L182). The **content hash** is the idempotency key: the same chunk, re-ingested, overwrites instead of duplicating. Metadata (source, date, tenant) powers filters (L180) and citations (L192).

> [!NOTE]
> **The three design rules: repeatable, incremental, observable.** Repeatable — every run is idempotent (content-hash upsert, L180), so re-running the pipeline is always safe. Incremental — only new and changed documents are re-processed: a schedule for the "did anything change?" sweep (L222), and events (webhooks, file watches, L220) for the "something changed now" trigger. Observable — ingestion logs what was processed, what was skipped, and what failed (L332), so the index's health is known, not assumed. A pipeline without these three is a script.

## 5. Real Project Usage

- **Support knowledge base.** Help docs in a wiki → nightly ingestion (L222) → the index that powers the copilot's retrieval (L189).
- **Internal docs.** HR, engineering, and policy docs from multiple sources (L220) → one index with tenant/source metadata (L180).
- **Legal/finance.** Document management systems → event-triggered ingestion (L220) — the moment a contract lands, it's searchable (L140 freshness).
- **E-commerce.** Product catalogs → nightly sync → per-SKU chunks with metadata (L180); "is this returnable?" retrieves the right policy.
- **RAG platform (L349).** Ingestion as a service: customers upload docs, the pipeline runs in their tenant (L320), with per-tenant isolation of the index (L180).

The through-line: **ingestion is the factory that keeps the index fresh** — and freshness (L140) is what makes RAG answers trustworthy rather than confidently stale.

## 6. Interview Explanation

Say it in four moves:

1. **The pipeline.** "Five stages: load from sources (L220), parse (L177), chunk (L178), embed (L181), upsert with metadata (L180)."
2. **The rules.** "Repeatable — content-hash upserts, so every run is idempotent (L180). Incremental — schedule + events, only what changed (L222). Observable — what got ingested, when, and what failed (L332)."
3. **The placement.** "It's the offline factory (L175) — a batch pipeline (L222), never on the question path, so questions are never blocked by ingestion."
4. **The failure mode.** "A messy pipeline poisons the index (L196): stale docs, duplicates, parse failures — the eval loop (L195) catches what the pipeline let through."

## 7. Senior-Level Insights

- **Ingestion is idempotency engineering (L180).** The senior design keys every upsert by content hash — re-runs, retries (L169), and backfills are safe by construction. "Run it again" is a feature, not a risk.
- **Freshness is a pipeline property (L140).** A doc changes; the index must follow. The senior answer names the trigger — schedule, event (L220), or both — and the freshness SLA per source (L140).
- **Parsing is the hidden failure surface (L177).** PDFs, tables, OCR, encoding — the parse stage is where ingestion quietly loses content (L196). The senior design checks parse quality (L195) before the chunks ever reach the index.
- **The pipeline is observable by design (L332).** Ingestion logs are the index's audit trail — what was processed, skipped, failed, and when (L322). An index without an ingestion history is unaccountable.
- **Ingestion composes with the batch architecture (L222).** Embedding is expensive (L150) — the pipeline is a queue of jobs (L222), retried (L169), with a dead-letter story. The factory is a distributed system, not a for-loop.

## 8. Common Mistakes

- **A one-off script.** No idempotency, no schedule (L222) — the index drifts until someone re-runs it manually.
- **Full re-ingest every time.** Re-embedding unchanged docs (L181) — slow and expensive (L150); the content hash (L180) is the dedup.
- **Ingestion on the question path.** Chunking and embedding inside a request (L175) — slow questions, and the offline/online split broken.
- **Ignoring parse failures.** A PDF that fails to parse silently disappears (L177) — the "missing chunk" failure mode (L196).
- **No observability.** Nobody knows what's in the index or when it was last fresh (L332) — stale answers ship without a trace.
- **No metadata.** Chunks without source/date/tenant (L180) — no filters (L189), no citations (L192), no tenant isolation (L320).

## 9. Best Practices

- **Build the five stages as separate, testable units** (L176) — load, parse, chunk, embed, index each testable alone (L341).
- **Key every upsert by content hash** (L180) — idempotent by construction.
- **Run on a schedule and on events** (L222, L220) — the sweep catches drift; the event catches change.
- **Log what was ingested, skipped, and failed** (L332) — the index's health is observable.
- **Check parse quality before indexing** (L177, L195) — a chunk of garbage is worse than no chunk.
- **Keep ingestion off the question path** (L175) — the factory never blocks the shop.

## 10. Interview Questions

**Q: How do you get documents into a RAG system?**
> A: An ingestion pipeline, offline and batch (L222). Five stages: load from sources via connectors (L220), parse to text (L177), chunk (L178), embed (L181), and upsert into the index with metadata (L180). The rules: idempotent by content hash, incremental via schedule + events, and observable via logs (L332).

**Q: How do you handle document updates?**
> A: Incremental ingestion. A schedule sweeps for changes (L222); events trigger on change (L220). The content hash (L180) makes each run idempotent — the changed doc re-processes, the unchanged docs skip, and re-runs are safe. Freshness (L140) is a pipeline property, not an accident.

**Q: What are the failure modes?**
> A: Parse failures that silently drop content (L177), stale docs that never re-ingest (L222), duplicates from non-idempotent runs (L180), and index drift from no observability (L332). Each has a defense: parse-quality checks (L195), schedule + events, content-hash upserts, and ingestion logs.

**Q: Where does ingestion live in the architecture?**
> A: Offline, in the L175 factory. It's a batch pipeline (L222) — queued, retried (L169), never on the question path. Retrieval serves questions from the finished index; ingestion keeps that index fresh without ever blocking a question.

## 11. Follow-Up Questions

- How does content-hash dedup work end to end (L180)?
- When is event-triggered ingestion right vs scheduled (L222)?
- How do you measure parse quality (L177, L195)?
- How does ingestion scale — queues, workers (L222)?
- How does the pipeline handle a tenant's upload (L320)?

## 12. Comparison Table — Script vs Pipeline

| | One-off script | Pipeline (this lesson) |
|---|---|---|
| Re-run safety | re-ingests everything | idempotent by hash (L180) |
| Updates | manual re-run | schedule + events (L222) |
| Failures | silent | logged, retried (L169, L332) |
| Metadata (L180) | none | source, date, tenant |
| Placement | anywhere | offline, batch (L175) |
| Observability | none | ingestion history (L332) |

The senior read: **the script is a step; the pipeline is a system** — the right column is the L176 lesson.

## 13. Code Example — The Pipeline, Idempotent and Incremental

```js
// The ingestion pipeline: load → parse → chunk → embed → upsert (L176-181).
const pipeline = async (sources, { schedule, onEvent }) => {
  for (const source of sources) {
    const docs = await load(source);                    // L220 — the connector

    for (const doc of docs) {
      const hash = sha256(doc.raw);                     // the idempotency key (L180)
      if (await alreadyIndexed(hash)) continue;         // incremental: skip unchanged (L222)

      try {
        const text = await parse(doc.raw, doc.format);  // L177 — PDF → text, OCR
        const chunks = chunk(text);                     // L178-179
        const vectors = await embed(chunks);            // L181 — the expensive stage
        await upsert(chunks, vectors, {                 // L180 — metadata + hash
          source: doc.path, date: doc.updatedAt, tenant: doc.tenant,
          hash,
        });
        log({ event: 'ingested', source: doc.path, chunks: chunks.length });  // L332
      } catch (e) {
        log({ event: 'failed', source: doc.path, error: e.message });         // L332
        queueRetry(doc);                                // L169, L222 — retry, dead-letter
      }
    }
  }
};

// Scheduled sweep (L222) + event trigger (L220).
schedule('0 2 * * *', () => pipeline(allSources));          // the nightly sweep
onEvent('doc.updated', (doc) => pipeline([doc]));           // the change trigger
```

```text
What the reader must SEE — the three rules in code:

  hash + alreadyIndexed   → idempotent, incremental (L180, L222)
  try/catch + log + retry → observable, recoverable (L169, L332)
  upsert with metadata    → filterable, citable (L180, L192)

  The factory runs again and again without damage.
```

```narrate
4-5: Load from the source connector (L220) — the pipeline's front door.
7-9: The content hash is the idempotency key — unchanged docs skip, re-runs are safe (L180, L222).
11-13: Parse — the messy-format stage where content is lost if unchecked (L177).
14-16: Chunk and embed — the expensive stages (L178-179, L181).
17-20: Upsert with metadata + hash, and a log of what was ingested (L180, L332).
22-25: Failures are logged and retried — observable and recoverable (L169, L332).
27-29: The schedule catches drift; the event catches change (L222, L220).
```

> [!TIP]
> The three lines that make it a pipeline: **`sha256(doc.raw)`** (idempotency, L180), **`alreadyIndexed(hash)`** (incrementality, L222), and the **`log(...)`** calls (observability, L332). A script has none of the three.

## 14. Performance Notes

- **Embedding is the expensive stage (L150, L181).** Batch it (L222), cache by content hash (L171), and never re-embed unchanged docs — the incrementality is also the cost control.
- **The pipeline is a queue, not a loop (L222).** Workers, retries (L169), and a dead-letter queue keep a parse failure from stalling the factory.
- **Ingestion is off the critical path (L151).** It never touches the question path (L175) — the shop's latency is the retrieval stage's, not the factory's.
- **Parse is the throughput bottleneck (L177).** OCR and PDF rendering are slow — parallelize across documents, and check quality (L195) before the index.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Document missing from answers | Parse failed silently (L177) | Check the ingestion logs (L332) |
| Duplicate chunks | No content-hash dedup (L180) | Key upserts by hash |
| Stale answers after a doc change | No event trigger (L222) | Wire the change event (L220) |
| Slow ingestion | Full re-ingest every run (L181) | Make it incremental (L180, L222) |
| Index drift | No scheduled sweep (L222) | Add the nightly sweep |

## 16. Quick Revision Notes

- Ingestion = **load → parse → chunk → embed → upsert** (L176–181).
- Three rules: **repeatable** (content hash, L180), **incremental** (schedule + events, L222), **observable** (logs, L332).
- Placement: **offline, batch (L175, L222)** — never on the question path.
- The expensive stage: **embedding (L150, L181)** — batch it, dedup by hash (L171).
- Failures: **parse silently dropping content (L177)** — check quality (L195), log, retry (L169).
- Freshness: **a pipeline property (L140)** — the index reflects the docs, or the answers go stale.

## 17. Cheat Sheet

```text
INGESTION = the factory that turns docs into an index

THE FIVE STAGES (L176-181)
  load     connectors (L220): S3, wiki, CRM, Slack, email
  parse    PDF → text (L177), HTML, OCR — structure kept
  chunk    sized + overlapping (L178-179)
  embed    chunks → vectors (L181) — the expensive stage
  upsert   index + metadata + hash (L180)

THE THREE RULES
  repeatable   content-hash upserts — idempotent (L180)
  incremental  schedule sweep + change events (L222, L220)
  observable   logs: ingested, skipped, failed (L332)

THE PLACEMENT
  offline · batch (L175) · never on the question path (L222)

THE FAILURE SURFACE
  parse silently drops content (L177, L196)
  stale docs from no re-ingest (L222)
  duplicates from no dedup (L180)

INTERVIEW, 4 MOVES
  1 pipeline  "load → parse → chunk → embed → upsert"
  2 rules     "repeatable, incremental, observable"
  3 placement "the offline factory (L175), never on the path"
  4 failures  "parse, staleness, duplicates — each has a defense"
```

## 18. Key Takeaways

> [!RECAP]
> - Ingestion is the **five-stage factory**: load (L220), parse (L177), chunk (L178–179), embed (L181), upsert with metadata (L180)
> - The three design rules: **repeatable** (content-hash upserts, L180), **incremental** (schedule + events, L222), **observable** (logs, L332)
> - It lives **offline, as a batch pipeline (L175, L222)** — the factory never blocks the shop
> - **Embedding is the expensive stage (L150, L181)** — incrementality is the cost control, caching (L171) the lever
> - The failure surface is **parse quality (L177), staleness (L222), and duplicates (L180)** — each with a designed defense
> - Freshness (L140) is a **pipeline property** — the index reflects the docs, or the answers go confidently stale

## Check your understanding

Answer these without looking back.

1. Name the five stages of the ingestion pipeline.
2. What makes a pipeline repeatable (L180)?
3. How do you handle document updates (L222)?
4. Where does ingestion live, and why (L175)?
5. What are the failure modes and their defenses?
6. Why is embedding the expensive stage (L150, L181)?
7. What should the ingestion logs contain (L332)?
8. How does ingestion stay fresh (L140)?

## A Closing Note — The Factory Your Index Depends On

You now hold the factory that feeds every RAG answer: **load, parse, chunk, embed, upsert — repeatable, incremental, observable, and off the question path.** The index is only as good as this pipeline; freshness (L140) is its product.

Next: the messiest stage — PDF processing & text extraction (L177), where documents fight back with layouts, scans and tables.
