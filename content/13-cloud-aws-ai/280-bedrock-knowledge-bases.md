# Lesson 280 — Bedrock Knowledge Bases

**Interview importance:** ⭐⭐⭐⭐⭐ — "how does the RAG run on AWS?" — the answer is *Bedrock Knowledge Bases*: the managed RAG — the ingest, the embed, the retrieve — without building the pipeline (L280).**

L174 built the RAG fundamentals (L174) and L197 the production architecture (L197); this lesson is **their AWS implementation**: Bedrock Knowledge Bases — the managed RAG: the knowledge base (the source of truth, L280), the ingestion (the parse, the chunk, the embed, L280), the retrieval (the search, L189), and the integration (the agents L279, the apps L160). The AI platform's shape: the RAG (L197) runs on the knowledge bases (L280) — the ingest, the embed, the retrieve managed (L280). This lesson is the L197 production RAG, AWS-shaped (L280).

The distinction this lesson is built on: a **demo** hand-rolls the pipeline. A **solutions architect** uses the knowledge base (L280): the ingestion (L280), the retrieval (L189), and the integration (L279) — because the production RAG (L197) is the managed service (L280).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the knowledge base: the managed RAG (L174)
- Explain the ingestion: the parse, the chunk, the embed (L280)
- Explain the retrieval: the search and the scoring (L189)
- Explain the integration: the agents and the apps (L279)
- Explain the AI shape: the L197 production RAG, AWS-shaped (L280)

## 1. One-Line Definition

**Bedrock Knowledge Bases is the managed RAG — ingest, embed, retrieve — without building the pipeline (L280) — the knowledge base (the source of truth: the documents from the S3 L265, L280), the ingestion (the managed parse, chunk, and embed: the document → the chunks → the vectors, L280), the retrieval (the search and the scoring: the top-k L189 with the metadata filters L180), and the integration (the agents L279 and the apps L160 query the base, L280) — the L197 production RAG, AWS-shaped (L280).**

The one-sentence interview answer: *"Bedrock Knowledge Bases is AWS's managed RAG service (L280). The model: the knowledge base (L280) is the source of truth — the documents live in the S3 bucket (L265), and the base points at it (L280). The ingestion (L280): the managed pipeline — the parse, the chunk (L179), and the embed (L181) — runs when the documents land (L276): the S3 event (L265) triggers the sync (L280), the chunks are embedded (L181), and the vectors are indexed (L183). The retrieval (L189): the query is embedded (L181), searched (L189), and scored (L280) — the top-k (L189) with the metadata filters (L180) — the citations (L192) included (L280). The integration: the agents (L279) query the base (L280), and the apps (L160) use the Retrieve API (L280). The AI shape: the production RAG (L197) — the ingestion (L176), the retrieval (L189), and the grounding (L280) — runs on the knowledge base (L280): the pipeline managed (L280), the vectors in the Bedrock-managed store or your OpenSearch (L280), and the whole thing queryable (L280). The L197 production RAG, AWS-shaped (L280)."*

## 2. Mental Model

Think of Bedrock Knowledge Bases as **the company's managed library with the indexers.** The library (the knowledge base, L280) holds the company's documents (the S3 source, L265). The indexers (the ingestion, L280) process the new books automatically: they read (the parse, L177), cut the pages into the sections (the chunk, L179), and file each section by its topic map (the embed, L181) — the card catalog (the vector index, L183) updated (L280). The reference desk (the retrieval, L189) answers the questions: the question's topic map (the query embedding, L181) is matched against the catalog (L189), and the best sections (the top-k, L189) are handed over with their page numbers (the citations, L192). The library works because the indexers run automatically, the catalog is current, and the desk finds the right pages (L280).

```text
   the library (Bedrock Knowledge Bases, L280)
   ┌────────────────────────────────────────────────────────┐
   │ the books (the documents, L265) — the S3 source        │
   │ the indexers (the ingestion, L280) — the parse, the    │
   │ chunk (L179), the embed (L181)                         │
   │ the catalog (the vector index, L183) · the reference   │
   │ desk (the retrieval, L189) — the top-k (L189)          │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the library**: the books, the indexers, the catalog, and the reference desk (L280).

## 3. Visual Flow — The Document to the Answer

```text
   the document lands (L265)
        │  the S3 event (L276)
        ▼
   ┌────────────────────── THE INGESTION (L280) ───────────────────────┐
   │  the sync runs (L276, L280)                                      │
   │  the parse (L177) → the chunk (L179) → the embed (L181)          │
   │  → the vectors indexed (L183)                                    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RETRIEVAL (L189) ───────────────────────┐
   │  the query embedded (L181) · searched (L189) · scored (L280)     │
   │  the top-k (L189) + the metadata filters (L180)                  │
   │  the citations (L192)                                            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ANSWER (L280) ──────────────────────────┐
   │  the app (L160) or the agent (L279) forms the grounded answer    │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the RAG's path: **ingest → index → retrieve → answer** (L280).

## 4. How It Works — The Managed RAG, Part by Part

- **The knowledge base (L280).** The source of truth (L280): the documents in the S3 bucket (L265), the base pointing at it (L280). The base is the RAG's boundary (L280): the chunking strategy (L179) and the embedding model (L181) configured per base (L280).
- **The ingestion (L280).** The managed pipeline (L280): the parse (L177), the chunk (L179), and the embed (L181) — the sync (L280) triggered by the S3 event (L276) or the schedule (L221). The vectors go to the Bedrock-managed vector store or your OpenSearch (L280).
- **The retrieval (L189).** The search (L189): the query embedded (L181), searched against the index (L189), and scored (L280) — the top-k (L189) with the metadata filters (L180), the citations (L192) returned (L280).
- **The integration (L279).** The consumers (L280): the agents (L279) with the base attached (L280); the apps (L160) with the Retrieve API (L280).
- **The governance (L280).** The access (L262): the IAM (L262) scopes who may query the base (L280); the guardrails (L281) filter the retrieval's output (L280).

> [!NOTE]
> **The knowledge base is the L197 architecture, managed (L280).** The production RAG (L197) — the ingestion pipeline (L176), the vector store (L182), the retrieval (L189), and the grounding (L280) — is the knowledge base's components (L280): the parse and the chunk (L179) are the pipeline's (L280); the embeddings (L181) and the index (L183) are the store's (L280); the search (L189) is the retrieval's (L280). The managed service (L280) removes the plumbing (L280) — the team owns the documents (L265) and the evaluation (L341).

## 5. Real Project Usage

- **A RAG platform (L197).** The knowledge base (L280) on the S3 documents (L265) — the ingestion (L280) and the retrieval (L189) managed (L280).
- **An agent with grounding (L279).** The Bedrock agent (L279) with the knowledge base attached (L280) — the answers grounded (L280), cited (L192).
- **A support copilot (L350).** The knowledge base (L280) on the help center (L265) — the support answers (L350) grounded (L280).
- **A multi-tenant SaaS (L357).** The per-tenant knowledge bases (L320) — the per-tenant documents (L265) and the per-tenant access (L262).
- **Anything RAG (L197).** The production RAG (L197) — the managed pipeline (L280) — runs on the knowledge bases (L280).

The through-line: **the knowledge base is the production RAG** — the ingest, the embed, and the retrieve managed (L280).

## 6. Interview Explanation

Say it in four moves:

1. **The base.** "The source of truth — the documents in the S3 (L265)."
2. **The ingestion.** "The managed parse, chunk (L179), and embed (L181) — the sync on the S3 event (L276)."
3. **The retrieval.** "The search and the scoring (L189) — the top-k (L189), the citations (L192)."
4. **The integration.** "The agents (L279) and the apps (L160) query the base (L280)."

## 7. Senior-Level Insights

- **The knowledge base is the L197 architecture, managed (L280).** The senior answer maps the L197 components (L197) to the service (L280): the ingestion (L176) → the sync (L280); the store (L182) → the managed index (L280); the retrieval (L189) → the search (L280) — the team owns the documents (L265) and the evaluation (L341).
- **The chunking is the retrieval's quality (L179).** The chunking strategy (L179) configured per base (L280) — the L179 trade (L179) is the retrieval's (L280).
- **The citations are the trust (L192).** The retrieval's citations (L192) — the answers' sources (L280) — the L192 attribution (L192), AWS-shaped (L280).
- **The evaluation is the RAG's truth (L341).** The retrieval's quality (L195) — the L341 eval suite (L341) on the base's outputs (L280).
- **The per-tenant bases are the isolation (L320).** The per-tenant knowledge bases (L320) — the documents (L265) and the access (L262) isolated (L280).

## 8. Common Mistakes

- **The hand-rolled pipeline (L176).** The bespoke ingestion (L176) — the L280 managed sync (L280) is the platform's (L280).
- **The chunking guessed (L179).** The default chunking (L179) without the evaluation (L195) — the retrieval's quality (L280) suffers (L179).
- **The grounding skipped (L280).** The base unattached (L280) — the agent (L279) answers from the training (L280).
- **The metadata ignored (L180).** The retrieval without the filters (L180) — the tenant's (L320) and the recency's (L180) context lost (L280).
- **The evaluation missing (L341).** The RAG untested (L341) — the L195 quality (L195) unknown (L280).

## 9. Best Practices

- **Point the base at the S3** (L265) — the source of truth (L280).
- **Tune the chunking** (L179) — with the evaluation (L195).
- **Use the metadata filters** (L180) — the tenant (L320), the recency (L180).
- **Return the citations** (L192) — the L192 attribution (L192).
- **Evaluate the retrieval** (L341) — the L341 eval suite (L341).

## 10. Interview Questions

**Q: Walk me through Bedrock Knowledge Bases.**
> A: The managed RAG (L280). The knowledge base — the source of truth, the documents in the S3 (L265). The ingestion — the managed parse, chunk (L179), and embed (L181). The retrieval — the search and the scoring (L189), the top-k (L189) with the citations (L192). And the integration — the agents (L279) and the apps (L160).

**Q: How does the ingestion work?**
> A: Automatically (L280): the documents land in the S3 bucket (L265); the sync (L280) — triggered by the S3 event (L276) or the schedule (L221) — parses, chunks (L179), and embeds (L181); and the vectors are indexed (L183). The pipeline (L176) is managed (L280).

**Q: How do you ground an agent?**
> A: By attaching the knowledge base (L280): the Bedrock agent (L279) queries the base (L280) when the answer needs the documents — the retrieval (L189) with the top-k (L189) and the citations (L192) — and the answer is grounded (L280), not generated from the training (L280).

**Q: How do you evaluate it?**
> A: The L341 way (L341): the eval suite (L341) on the retrieval's outputs — the groundedness (L337), the retrieval's precision and recall (L195) — with the golden query set (L342). The knowledge base (L280) is the managed pipeline; the evaluation (L341) is still yours (L280).

## 11. Follow-Up Questions

- What's the knowledge base (L280)?
- How does the ingestion work (L280)?
- What's the retrieval (L189)?
- How do you ground an agent (L279)?
- How do you evaluate it (L341)?

## 12. Comparison Table — The Hand-Rolled vs the Managed RAG

| | The hand-rolled RAG (L197) | The knowledge base (L280) |
|---|---|---|
| Ingestion (L176) | your pipeline (L176) | the managed sync (L280) |
| Store (L182) | your vector DB (L182) | the managed index (L280) |
| Retrieval (L189) | your search (L189) | the managed search (L280) |
| Chunking (L179) | your strategy (L179) | the configured strategy (L280) |
| Eval (L341) | yours (L341) | yours (L341) |

The senior read: **the managed service removes the plumbing** — the team owns the documents (L265) and the evaluation (L341).

## 13. Code Example — The Knowledge Base, Used

```js
// The managed RAG (L280) — the retrieval through the API (L280).
import { BedrockAgentRuntimeClient, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';

const client = new BedrockAgentRuntimeClient({ region: 'us-east-1' });

// THE RETRIEVAL (L189) — the query, the filters, the top-k (L280).
const retrieve = await client.send(new RetrieveCommand({
  knowledgeBaseId: 'kb-company-docs',          // the base (L280)
  retrievalQuery: { text: 'What is the refund policy?' },
  retrievalConfiguration: {
    vectorSearchConfiguration: {
      numberOfResults: 5,                      // the top-k (L189)
      filter: { tenantId: { equals: '42' } },  // the metadata filter (L180, L320)
    },
  },
}));

// THE CITATIONS (L192) — the sources returned (L280).
const chunks = retrieve.retrievalResults.map((r) => ({
  text: r.content.text,
  source: r.location.s3Location,               // the citation (L192)
  score: r.score,                              // the score (L280)
}));

// The app (L160) or the agent (L279) forms the grounded answer (L280).
```

```text
What the reader must SEE — the base, used:

  knowledgeBaseId        → the managed RAG (L280)
  numberOfResults: 5     → the top-k (L189)
  filter: tenantId       → the metadata + the isolation (L180, L320)
  retrievalResults       → the chunks + the citations (L192)

  Ingested, indexed, retrieved — and cited (L280).
```

```narrate
3-5: The client — the Bedrock agent runtime (L280).
7-16: The retrieval — the query against the base, the top-k, and the tenant filter (L189, L180).
18-23: The citations — the chunks with their sources and the scores (L192, L280).
25: The integration — the app or the agent forms the grounded answer (L160, L279).
```

> [!TIP]
> The pair that defines the knowledge bases: **the sync on the S3 event** (the managed ingestion, L280) and **the retrieval with the citations** (the grounded answer, L189, L192). **Ingest automatically, retrieve with the sources — the L197 RAG, AWS-shaped (L280).**

## 14. Performance Notes

- **The sync is the freshness (L280).** The ingestion (L280) on the S3 event (L276) — the vectors (L183) current (L280).
- **The retrieval is the latency (L189).** The search (L189) — the top-k (L189) bounded, the index (L183) fast (L280).
- **The filters are the precision (L180).** The metadata filters (L180) — the tenant (L320) and the recency (L180) narrow the search (L280).
- **The cost is the tokens' and the storage's (L285).** The embedding (L181) and the storage (L183) — the base's bill (L285) is the index's (L280).

## 15. Debugging Scenarios

| Symptom | First check (L280) | The lever |
|---|---|---|
| The new documents aren't found | The sync (L280) | The S3 event → the ingestion (L276) |
| The retrieval is poor | The chunking (L179) | The chunking strategy (L179) + the eval (L195) |
| The wrong tenant's docs appear | The filter (L180) | The metadata filter (L320) |
| The answers are ungrounded | The integration (L279) | The base attached to the agent (L280) |
| The cost spikes | The sync (L285) | The schedule (L221), the chunking (L179) |

## 16. Quick Revision Notes

- Bedrock Knowledge Bases = **the managed RAG** (L280): the base, the ingestion, the retrieval, the integration.
- The base: **the source of truth — the S3 documents (L265)**.
- The ingestion: **the managed parse, chunk (L179), embed (L181) — the sync (L276)**.
- The retrieval: **the search and the scoring (L189) — the top-k (L189), the citations (L192)**.
- The integration: **the agents (L279) and the apps (L160)**.

## 17. Cheat Sheet

```text
BEDROCK KNOWLEDGE BASES = the managed RAG — ingest, embed, retrieve

THE BASE (L280)
  the source of truth — the S3 documents (L265)
  the chunking (L179) + the embedding model (L181) configured (L280)

THE INGESTION (L280)
  the sync — the S3 event (L276) / the schedule (L221)
  the parse (L177) → the chunk (L179) → the embed (L181) → the index (L183)

THE RETRIEVAL (L189)
  the query embedded (L181) · the search (L189) · the scoring (L280)
  the top-k (L189) + the metadata filters (L180)
  the citations (L192) returned

THE INTEGRATION (L280)
  the agents (L279) — the base attached (L280)
  the apps (L160) — the Retrieve API (L280)

THE AI SHAPE (L280)
  the L197 production RAG (L197) — the pipeline managed (L280)
  the evaluation (L341) — still yours (L280)

INTERVIEW, 4 MOVES
  1 base      "the source of truth — the S3 (L265)"
  2 ingestion "the managed parse, chunk, embed (L280)"
  3 retrieval "the search, the top-k, the citations (L189, L192)"
  4 integration "the agents and the apps (L279, L160)"
```

## 18. Key Takeaways

> [!RECAP]
> - Bedrock Knowledge Bases is **the managed RAG — ingest, embed, retrieve — without building the pipeline** (L280): the knowledge base (L280), the ingestion (L280), the retrieval (L189), and the integration (L279)
> - **The knowledge base** (L280) is the source of truth — the documents in the S3 (L265), with the chunking (L179) and the embedding model (L181) configured per base (L280)
> - **The ingestion** (L280) is the managed pipeline — the sync (L276) parses (L177), chunks (L179), and embeds (L181), and the vectors are indexed (L183)
> - **The retrieval** (L189) is the search — the query embedded (L181), scored (L280), the top-k (L189) with the metadata filters (L180) and the citations (L192)
> - **The integration** (L280): the agents (L279) and the apps (L160) query the base (L280)
> - The AI shape (L280): the L197 production RAG (L197) runs on the knowledge bases (L280) — the pipeline managed (L280), the evaluation (L341) still yours (L280)

## Check your understanding

Answer these without looking back.

1. What's the knowledge base (L280)?
2. How does the ingestion work (L280)?
3. What's the retrieval (L189)?
4. How do you ground an agent (L279)?
5. How do you evaluate it (L341)?
6. What are the citations (L192)?
7. What's the L320 isolation (L320)?
8. What is the L197 RAG, AWS-shaped (L280)?

## A Closing Note — The Library, Indexed

You now hold the managed RAG: **the base, the ingestion, the retrieval, and the integration — with the pipeline managed and the citations returned.** The AWS stack has its knowledge — and the library indexes itself (L280).

Next: the managed guardrails — Bedrock Guardrails (L281).
