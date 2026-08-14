# Module 9 — RAG / Knowledge Systems

## Why this module comes ninth

Module 8 gave you the production AI app: the gateway, the tool loop, the resilience stack — an app that streams, remembers and survives. But every one of those apps has the same hole: the model's knowledge is frozen at training (L141). It doesn't know your docs, your products, your policies — and it hallucinates confidently in the gaps. This module is the fix: **RAG (retrieval-augmented generation)** — the pipeline that grounds an LLM in your documents, from raw files to cited answers.

The distinction this module is built on: a **demo** pastes a PDF into the prompt and hopes. A **solutions architect** designs the *knowledge system*: ingestion that turns messy files into a clean index (L176–179), retrieval that finds the right chunks fast (L182–190), synthesis that answers from context with citations (L191–192), and evaluation that proves retrieval quality (L195–196). That system is what separates "the AI that makes things up" from "the AI that knows our data".

## Module map

- **M20 · RAG / Knowledge Systems (L174–197)** — the knowledge spine.
  The pattern and architecture (L174–175), ingestion and parsing (L176–177), chunking (L178–179), metadata and embeddings (L180–181), the vector stores (L182–186), retrieval quality — hybrid search, reranking, context construction (L187–191), trust and precision — citations, query rewriting, contextual retrieval (L192–194), and the evaluation that closes the loop (L195) — then failure modes (L196) and the production synthesis (L197).

## How to study each lesson

1. **Draw the spine first.** L174–175 give you the three-stage architecture: ingestion → retrieval → synthesis. Every later lesson is one node of that diagram — when you can draw the spine from memory, the module is half done.
2. **Build the pipeline in batches.** The ingestion lessons (L176–179) are a working system: parse, chunk, embed, index. Build each stage with real files, then wire them together — the module's milestone is a pipeline that runs end to end.
3. **Make retrieval measurable.** L187–195 are all *quality* questions: hybrid search, reranking, evals. For each, ask "what does this improve — precision or recall (L195)?" and "how would I measure it?" Numbers beat vibes.
4. **Hold L149 in one hand.** Every RAG decision has a token cost: chunk size, top-k, context construction (L191) are budgets (L149), and caching (L171) is the lever. The knowledge system is also a cost model (L150).

## Prerequisites

Module 7 (L135–157) — especially embeddings (L147), token budgeting (L149) and the model decision rule (L157). Module 8 (L158–173) — the production floor plan (L173) is where RAG lives: the gateway, the budget, the cache and the evals. You also need PostgreSQL or SQLite basics (Module 6, L115–118) for the vector-store lessons (L183).

## Next

→ [Lesson 174 — RAG Fundamentals](./174-rag-fundamentals.md)
