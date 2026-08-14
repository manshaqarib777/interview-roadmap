# Lesson 180 — Metadata for Retrieval

**Interview importance:** ⭐⭐⭐⭐ — "how do you filter retrieval?" — the answer is *metadata*: source, date, tenant, section — the labels that turn a vector search into precision, and power citations (L192) and tenant isolation (L320).

L178–179 chunked the documents; this lesson is the **labels on every chunk**: metadata — source, date, tenant, section, doc type. Metadata is what makes retrieval *precise*: filter by tenant (L320), by date (freshness, L140), by source (citations, L192), by section (scope). Without it, every search is a global vector scan — with it, retrieval becomes "the relevant chunks *within the right scope*" (L189).

The distinction this lesson is built on: a **demo** indexes chunks with just their text and vector. A **solutions architect** treats metadata as a first-class part of the index schema: captured at ingestion (L176), stored with every chunk (L180), used for filtering (L189), citations (L192), tenant isolation (L320), and freshness management (L140) — designed *before* the chunks exist, because retrofitting labels to an unlabeled index is a re-ingestion project.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why metadata matters: filtering, citations, isolation, freshness (L180)
- Name the core fields: source, date, tenant, section, doc type, hash (L180)
- Design a metadata schema at ingestion time (L176), not after
- Use metadata in retrieval: filters (L189), hybrid search (L187), tenant isolation (L320)
- Explain the metadata failure modes: missing, wrong, un-scoped (L196)

## 1. One-Line Definition

**Metadata for retrieval is the schema of labels stored with every chunk — source, date, tenant, section, doc type, and a content hash — that turns a global vector search into a scoped one: filters for precision (L189), provenance for citations (L192), isolation for tenants (L320), and recency for freshness (L140), designed at ingestion time (L176) because retrofitting an unlabeled index is a re-ingestion project.**

The one-sentence interview answer: *"Metadata is the schema of labels on every chunk (L180). Core fields: source, date, tenant, section, doc type, plus a content hash for dedup (L176). It powers four things. Filtering — retrieval is scoped to the right source, tenant, or recency (L189). Citations — every answer points back to its source (L192). Isolation — a tenant's chunks are only ever retrieved within their tenant (L320). Freshness — recency filters and re-ingestion know what's stale (L140). I design the schema at ingestion (L176) — retrofitting labels to an unlabeled index is a re-ingestion project."*

## 2. Mental Model

Think of metadata as **the card catalog in a library** — the vector is the book's position on the shelf, but the card catalog is how you find *which* books to pull. A card says: author (source), year (date), subject (section), shelf (tenant). Without the catalog, you search the whole library for every question. With it, you ask "what has this library written about X, this year, in this department?" and pull only the relevant shelf.

```text
   a chunk in the index (L182)
   ┌────────────────────────────────────────────┐
   │ text:     "the termination clause…"        │
   │ vector:   [0.21, -0.43, …] (L181)          │
   │ ── metadata (L180) ──────────────────────── │
   │ source:   contracts/acme-2024.pdf          │
   │ date:     2024-03-01                       │
   │ tenant:   acme                            │
   │ section:  §7 Termination                   │
   │ type:     contract                         │
   │ hash:     a3f9…                            │
   └────────────────────────────────────────────┘
   the card catalog: search by these, not just by vector
```

The mental model is **book + card**: the vector finds similar text, the metadata finds the *right scope* — and retrieval needs both.

## 3. Visual Flow — How Metadata Shapes a Retrieval

```text
   a question arrives (L189)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · SCOPE THE SEARCH (L189)                              │
   │     tenant filter (L320) — only this tenant's chunks     │
   │     source filter — only this doc / docs                 │
   │     date filter — only recent (L140)                     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · SIMILARITY (L181)                                    │
   │     vector search within the scoped set (L182)           │
   │     + keyword (L187) — hybrid                          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · RERANK (L190) + top-k (L189)                         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · GENERATE + CITE (L192)                               │
   │     every claim cites: source, section, date —           │
   │     from the chunk's metadata                            │
   └──────────────────────────────────────────────────────────┘
```

The flow is the power of metadata: **scope first (filters), then similarity, then citations** — every step after retrieval depends on labels captured at ingestion.

## 4. How It Works — The Core Fields and the Four Powers

- **The core fields.** **Source** — where the chunk came from (file path, URL, doc ID); the citation's backbone (L192). **Date** — when the source was created/updated; freshness filtering (L140). **Tenant** — whose data this is; isolation (L320). **Section** — the heading the chunk lives under (L177–179); scope and citation context. **Doc type** — contract, manual, FAQ; routing and UI. **Hash** — the content hash for idempotent ingestion (L176).
- **Filtering (L189).** Retrieval applies filters *before* or *during* similarity search: tenant always (L320), source and date when the question implies them, doc type when the product needs it. Filters turn a global scan into a scoped search.
- **Citations (L192).** The chunk's metadata becomes the citation — "per §7 of contracts/acme-2024.pdf". Without metadata, there's no source to cite; the auditability of RAG (L174) is a metadata feature.
- **Isolation (L320).** In a multi-tenant system, the tenant filter is not optional — it's the enforcement of isolation. A missing filter is a data leak (L320, L312).
- **Freshness (L140).** Date metadata powers recency filtering and re-ingestion decisions (L176) — "only docs from this quarter" is a filter, and "what's stale" is a query.

> [!NOTE]
> **The schema is designed at ingestion, or paid for at re-ingestion (L176).** Every metadata field is captured when the document enters the pipeline — source from the connector (L220), date from the file system, tenant from the upload context, section from the parser (L177). Retrofitting labels to an already-indexed corpus means re-ingesting it. The senior design writes the metadata schema *before* the first chunk is indexed.

## 5. Real Project Usage

- **Multi-tenant support copilot (L320).** Tenant filter on every query — each customer's answers come only from their docs. The missing filter is the classic leak (L312).
- **Legal research.** Source + date + section metadata — "the 2024 termination clause in the Acme contract" is a scoped query, and every citation names the clause (L192).
- **Product Q&A.** Doc type + source filters — "return policy" answers come from policy docs, not product specs.
- **Freshness-bound domains (L140).** Date filters — "current as of this quarter" — and stale docs flagged for re-ingestion (L176).
- **HR/engineering knowledge.** Section metadata routes answers to the right handbook; source metadata makes the answer traceable (L192).

The through-line: **metadata is what makes RAG precise, private and provable** — precision (filters), privacy (tenant), and proof (citations) are all metadata features.

## 6. Interview Explanation

Say it in four moves:

1. **The fields.** "Every chunk carries metadata: source, date, tenant, section, doc type, content hash (L180)."
2. **The powers.** "Four: filtering for precision (L189), provenance for citations (L192), isolation for tenants (L320), recency for freshness (L140)."
3. **The timing.** "The schema is designed at ingestion (L176) — the connector supplies source and date, the parser supplies section (L177). Retrofitting means re-ingesting."
4. **The failure.** "The missing tenant filter is a data leak (L320); missing source means answers that can't be cited (L192) — metadata failure is trust failure."

## 7. Senior-Level Insights

- **Metadata is the retrieval schema (L180).** The senior design defines the fields and their provenance before the index exists — which field comes from which stage (L176–179) — because every downstream feature (filters, citations, isolation) is a metadata consumer.
- **Tenant filters are isolation enforcement (L320).** In a multi-tenant system, the tenant filter is not an optimization — it's the control that makes a leak impossible (L320, L312). The senior answer says "the filter is always applied, by construction, not by convention".
- **Citations are metadata rendered (L192).** The auditability that makes RAG trustworthy for legal, finance, and support is a metadata feature: the source and section stored at ingestion become the citation at generation. No metadata, no citations, no trust.
- **Freshness is a metadata query (L140).** "What's stale?" is answered by date metadata; "only recent" is a filter; re-ingestion triggers (L176) read the same field. Recency is not a vibe — it's a column.
- **Metadata is a schema evolution problem (L341).** Adding a field means re-ingesting (L176) — the senior design versions the metadata schema (L341) and plans migration costs, like any database schema.

## 8. Common Mistakes

- **No metadata at all.** Chunks are text + vector only (L180) — no filters, no citations, no isolation.
- **Retrofitting labels.** Adding metadata after indexing (L176) — the re-ingestion project nobody budgets for.
- **The missing tenant filter (L320).** A global search in a multi-tenant system — the data leak (L312).
- **Metadata that lies.** Wrong source, wrong date, wrong section (L196) — citations and freshness both corrupted.
- **No hash (L176).** Duplicates from re-ingestion — the idempotency key missing.
- **Metadata as an afterthought column.** A field that no code reads — schema without consumers is decoration.

## 9. Best Practices

- **Define the metadata schema first** (L180) — before the first chunk is indexed (L176).
- **Capture provenance at ingestion** (L176) — source from the connector (L220), date from the FS, section from the parser (L177).
- **Always apply the tenant filter** (L320) — by construction, in the retrieval function, not by convention.
- **Store the content hash** (L176) — idempotency, dedup, and re-ingestion decisions.
- **Make citations read metadata** (L192) — the source and section fields are the citation template.
- **Use date for freshness** (L140) — filters and re-ingestion triggers read the same field.

## 10. Interview Questions

**Q: Why does metadata matter in RAG?**
> A: It's what turns a global vector search into a scoped one (L180). Four powers: filters for precision (L189) — source, date, doc type; provenance for citations (L192) — every claim traces to its source; isolation for tenants (L320) — the filter that prevents leaks; and recency for freshness (L140). Without metadata, retrieval is "similar text anywhere"; with it, retrieval is "the right chunks, in the right scope".

**Q: What metadata do you store per chunk?**
> A: Core fields: source (the citation's backbone, L192), date (freshness, L140), tenant (isolation, L320), section (scope, from the parser, L177), doc type (routing), and a content hash (idempotency, L176). Designed at ingestion — the connector supplies source and date, the parser supplies section — because retrofitting means re-ingesting (L176).

**Q: How do you prevent cross-tenant retrieval?**
> A: The tenant filter is applied by construction, not by convention (L320). The retrieval function always takes the tenant from the authenticated session (L172) and filters the index with it — there is no code path that searches without it. The filter is isolation enforcement, and a missing filter is a data leak (L312).

**Q: How does metadata support citations?**
> A: Citations are metadata rendered (L192). The chunk stores source and section at ingestion; at generation, the model cites "per §7 of contracts/acme-2024.pdf". The auditability of RAG — what the answer is based on, and where to verify it — is a metadata feature.

## 11. Follow-Up Questions

- Which fields come from which ingestion stage (L176)?
- How do filters interact with hybrid search (L187)?
- How does tenant isolation use metadata (L320)?
- How does freshness filtering work (L140)?
- What does a metadata schema change cost (L341)?

## 12. Comparison Table — Without vs With Metadata

| | Without metadata | With metadata (this lesson) |
|---|---|---|
| Retrieval (L189) | global vector scan | scoped + filtered |
| Citations (L192) | none | source + section |
| Tenant isolation (L320) | impossible | enforced by filter |
| Freshness (L140) | unknowable | date filter + re-ingest |
| Dedup (L176) | none | content hash |
| Trust | "trust me" | "per §7, contracts/acme-2024.pdf" |

The senior read: **the right column is a product feature** — precision, privacy, and provability are metadata features.

## 13. Code Example — Metadata Through the Pipeline

```js
// Metadata: captured at ingestion (L176), used at retrieval (L189).
// INGESTION — the schema is written here (L180).
async function ingest(doc, { tenant }) {
  const parsed = await parse(doc);                    // L177 — parser supplies sections
  const chunks = chunk(parsed.text);                  // L178-179
  for (const c of chunks) {
    await indexChunk({
      text: c.text,
      vector: await embed(c.text),                    // L181
      // THE METADATA (L180) — provenance from the stages:
      source: doc.path,                               // from the connector (L220)
      date: doc.updatedAt,                            // from the file system (L140)
      tenant,                                         // from the upload context (L320)
      section: c.heading,                             // from the parser (L177)
      type: doc.type,
      hash: sha256(c.text),                           // idempotency (L176)
    });
  }
}

// RETRIEVAL — the filters are applied by construction (L189, L320).
async function search(question, { tenant, dateFrom }) {
  const qv = await embed(question);
  return index.search(qv, {
    filter: { tenant, ...(dateFrom && { date: { $gte: dateFrom } }) },  // L320, L140
    topK: 5,
  });
}
```

```text
What the reader must SEE — provenance in, scope out:

  ingest():  source · date · tenant · section · hash (L180, L176)
  search():  filter: { tenant } — by construction (L320)

  Metadata is captured once at ingestion and consumed everywhere.
```

```narrate
4-13: Ingestion captures the schema — source from the connector, date from the FS, tenant from context, section from the parser (L180, L176, L177).
14-15: The content hash makes re-ingestion idempotent (L176).
20-24: Retrieval applies the tenant filter always (L320) and date when freshness requires (L140) — scoped search (L189).
```

> [!TIP]
> The line that makes metadata real is **`filter: { tenant }`** — applied inside the retrieval function, by construction. **A tenant filter you have to remember is a leak you haven't had yet (L320).**

## 14. Performance Notes

- **Filters must hit the index's structure (L182).** A vector store that can't filter efficiently (L183–185) forces post-filtering — retrieve 100, filter to 5 (L189). The index choice (L186) should include filter performance.
- **Metadata is cheap storage (L150).** A few fields per chunk — but they enable filters that cut retrieval cost (L151) by scoping the search.
- **Date filters need a real field (L140).** Storing dates as strings breaks range queries — index the date type properly (L183).
- **The hash is the re-ingestion lever (L176, L171).** Content-hash dedup skips unchanged docs — incrementality (L222) and cache (L171) both read it.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Cross-tenant results | Missing tenant filter (L320) | Add the filter by construction |
| Answers with no citations | Source metadata missing (L192) | Backfill via re-ingestion (L176) |
| Stale docs retrieved | No date filter (L140) | Add date filter / re-ingest |
| Duplicate chunks | Missing hash dedup (L176) | Key upserts by hash |
| Filters slow | Post-filtering (L189) | Index the metadata (L182) |

## 16. Quick Revision Notes

- Metadata = **the schema of labels on every chunk** (L180).
- Core fields: **source, date, tenant, section, type, hash** (L180).
- Four powers: **filters (L189), citations (L192), isolation (L320), freshness (L140)**.
- Designed at **ingestion (L176)** — retrofitting is re-ingestion.
- The tenant filter is **isolation enforcement (L320)**, by construction.
- Citations are **metadata rendered (L192)** — no metadata, no trust.

## 17. Cheat Sheet

```text
METADATA = the card catalog of the index

THE FIELDS (L180)
  source   citation backbone (L192) — from the connector (L220)
  date     freshness (L140) — from the file system
  tenant   isolation (L320) — from the upload context
  section  scope — from the parser (L177)
  type     routing — doc kind
  hash     idempotency (L176) — dedup, re-ingest

THE FOUR POWERS
  filters    scoped retrieval (L189) — source, date, type
  citations  every claim → its source (L192)
  isolation  the tenant filter, by construction (L320)
  freshness  date filter + re-ingest triggers (L140)

THE TIMING RULE
  schema first, at ingestion (L176)
  retrofit = re-ingestion project

THE SAFETY RULE
  the tenant filter is isolation enforcement (L320)
  a filter you must remember is a leak you haven't had yet

INTERVIEW, 4 MOVES
  1 fields   "source, date, tenant, section, type, hash"
  2 powers   "filters, citations, isolation, freshness"
  3 timing   "designed at ingestion (L176)"
  4 failure  "the missing tenant filter is a leak (L320)"
```

## 18. Key Takeaways

> [!RECAP]
> - Metadata is the **schema of labels on every chunk** (L180) — source, date, tenant, section, doc type, and a content hash
> - It powers **four things**: scoped retrieval filters (L189), source citations (L192), tenant isolation (L320), and freshness management (L140)
> - The schema is **designed at ingestion** (L176) — each field has a provenance stage, and retrofitting means re-ingesting
> - **The tenant filter is isolation enforcement** (L320), applied by construction in the retrieval function — a missing filter is a data leak (L312)
> - **Citations are metadata rendered** (L192) — the auditability that makes RAG trustworthy is a metadata feature
> - The **content hash** (L176) is the idempotency key — dedup, incrementality (L222), and re-ingestion all read it

## Check your understanding

Answer these without looking back.

1. Name the core metadata fields and where each comes from.
2. What are the four powers of metadata?
3. Why is the schema designed at ingestion (L176)?
4. How is the tenant filter applied — and why by construction (L320)?
5. How do citations read metadata (L192)?
6. How does date metadata manage freshness (L140)?
7. What happens when metadata is missing or wrong (L196)?
8. Why is the hash the re-ingestion lever (L176)?

## A Closing Note — The Labels That Make Retrieval Precise

You now hold the schema that turns a vector search into a scoped, provable one: **source, date, tenant, section, type, hash — designed at ingestion, consumed by filters, citations, isolation and freshness.** Metadata is the difference between "similar text anywhere" and "the right chunks, in the right scope".

Next: the representation — embeddings for RAG (L181), where chunks become coordinates.
