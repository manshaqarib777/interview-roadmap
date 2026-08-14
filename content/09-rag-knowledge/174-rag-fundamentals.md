# Lesson 174 — RAG Fundamentals

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you give an LLM your company's knowledge?" is the defining AI-app question, and the answer is *RAG* — grounding the model in retrieved context instead of retraining it.

Module 8 built the app; this lesson is why the app needs a memory. A model's knowledge is frozen at training (L141): it doesn't know your docs, your products, your policies — and it hallucinates confidently in the gaps. **RAG (retrieval-augmented generation)** is the pattern that fixes this: retrieve the relevant context from your knowledge base, stuff it into the prompt, and let the model answer from *that* instead of from memory. It's the difference between "the AI that makes things up" and "the AI that knows our data".

The distinction this lesson is built on: a **demo** pastes a PDF into the prompt and hopes the model "reads" it. A **solutions architect** knows RAG is a *system* — ingestion, retrieval, synthesis (the L175 spine) — and knows exactly what problem it solves (grounding, freshness, private data) and what it doesn't (reasoning, agent loops, low-latency chat).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what RAG is and the problem it solves: grounding, freshness, private knowledge (L141)
- Name the three stages — ingestion, retrieval, synthesis — and what each does (L175)
- Explain why RAG beats retraining and fine-tuning for most knowledge problems
- Describe what RAG does *not* solve — and where agents (L200), caching (L171) and evals (L195) take over
- Give the one-sentence definition that opens the interview answer

## 1. One-Line Definition

**RAG (retrieval-augmented generation) is the pattern that grounds an LLM in your data — retrieve the relevant chunks from a knowledge index, inject them into the prompt as context, and let the model answer from that context instead of from its frozen training knowledge (L141).**

The one-sentence interview answer: *"RAG grounds the model in my data. The model's knowledge is frozen at training (L141), so I keep my knowledge in an index instead: ingest documents into chunks (L176), embed them for search (L147, L181), retrieve the relevant chunks for each question (L189), and inject them into the prompt so the model answers from context with citations (L192). It's the standard answer to 'the AI doesn't know our data' — it's fresh, it's private, it's auditable, and it needs no retraining (L174)."*

## 2. Mental Model

Think of RAG as **a library and a librarian working together.** The library is your knowledge index — every document split into searchable chunks (L178), catalogued with metadata (L180). The librarian is the retrieval step — when a question comes in, it fetches the right books (the relevant chunks, L189). The reader is the LLM — it reads exactly what the librarian brought, no more, and answers from it.

```text
   without RAG                          with RAG
   ┌──────────────┐                     ┌──────────────────────────┐
   │ question     │                     │ question                 │
   │      ▼       │                     │      ▼                   │
   │ the model    │  →  guesses from    │ librarian (retrieval)    │
   │ (frozen at   │     training data   │      ▼  relevant chunks  │
   │  training)   │     = hallucination │ the model reads the      │
   └──────────────┘     (L141)          │ context → answers with   │
                                        │ citations (L192)         │
                                        └──────────────────────────┘
```

The mental model is **library + librarian + reader**: the knowledge lives in the library (yours, fresh, private), the librarian finds it (retrieval), and the reader (LLM) only answers from what was brought. The hallucination in the left column is exactly the failure the right column fixes.

## 3. Visual Flow — One Question Through the RAG Spine

```text
   a user question arrives
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · RETRIEVE (L189)                                      │
   │     embed the question (L147, L181)                      │
   │     → search the index (vector + keyword, L187)          │
   │     → top-k relevant chunks (L189)                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · AUGMENT (L191)                                       │
   │     build the prompt: system + retrieved chunks +        │
   │     question — inside the token budget (L149)            │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · GENERATE (L145)                                      │
   │     the model answers from the context, streaming,       │
   │     with citations to the chunks (L192)                  │
   └──────────────────────────────────────────────────────────┘
```

The flow is the three-stage spine (L175): **retrieve → augment → generate.** Each stage is a lesson of its own — this module teaches them in order.

## 4. How It Works — The Three Stages, and the Problem It Solves

- **The problem: frozen knowledge (L141).** The model's weights are fixed at training — it knows the world up to its cutoff, not your docs, not your products, not your private policies. Any gap is filled by confident hallucination. RAG doesn't change the weights; it changes *what the model reads*.
- **Ingestion (L176–179).** The knowledge base side: load documents, parse them (L177), split them into chunks (L178–179), embed the chunks (L147, L181), and index them with metadata (L180). This happens offline — it's the library being built.
- **Retrieval (L182–190).** The question side: embed the question, search the index (vector similarity, hybrid with keyword, L187), and return the top-k chunks (L189) — optionally reranked (L190). This is the librarian's job.
- **Synthesis (L191–192).** The answer side: build a prompt from the retrieved chunks (L191), generate (L145), and cite the sources (L192). The model answers from the context — grounded, auditable, fresh.

> [!NOTE]
> **Why RAG and not fine-tuning?** Fine-tuning changes the model's weights — it's for *behavior* (tone, format, style), not *facts*. Facts change daily, live in private systems, and must be auditable — all of which fit a retrievable index, not frozen weights. The rule of thumb: **behavior → fine-tune; knowledge → RAG.** (And when you need both, you do both — RAG first, because it's cheaper and updatable.)

## 5. Real Project Usage

- **Customer support copilots.** The knowledge base is the help docs (L174); every answer is grounded in the relevant article with a citation (L192). The "AI that makes things up" becomes "the AI that points to the right page".
- **Internal knowledge search.** Employee handbooks, engineering runbooks, policy docs — retrieved and answered from, not memorized.
- **Codebase Q&A.** Docs + code chunks indexed (L176); developers ask "how do we do X here?" and get answers with the source file cited.
- **E-commerce product Q&A.** Product descriptions, specs, and return policies as the index; "is this returnable?" answered from the policy, not from vibes.
- **Any regulated or freshness-bound domain.** Finance, health, legal — the answer must be traceable to a source (L192), which is exactly what RAG's citations provide.

The through-line: **RAG is the default answer to "the AI doesn't know our data"** — and this module is the engineering of that answer, from raw files to cited replies.

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "RAG grounds the model in my data: retrieve the relevant chunks, inject them into the prompt, and generate from the context (L174)."
2. **The problem it solves.** "The model's knowledge is frozen at training (L141). RAG makes my knowledge — fresh, private, auditable — retrievable instead."
3. **The spine.** "Three stages: ingest the docs into chunks and embeddings (L176–181), retrieve the top-k relevant chunks (L182–190), synthesize an answer from them with citations (L191–192)."
4. **The boundary.** "It's for knowledge, not behavior — behavior is fine-tuning. And retrieval quality is the whole game: bad retrieval, grounded hallucinations (L195–196)."

## 7. Senior-Level Insights

- **RAG is the knowledge architecture, not a trick (L175).** The senior answer names the whole spine — ingestion, retrieval, synthesis — and where each can fail (L196). The demo answer names only "search the docs and stuff it in the prompt".
- **The quality ceiling is retrieval (L189, L195).** A perfect LLM with bad retrieval produces grounded hallucinations — the model faithfully answers from the *wrong* chunks (L196). That's why the module spends L187–L195 on retrieval quality: hybrid search, reranking, evals.
- **RAG composes with the production floor plan (L173).** The gateway (L172), the budget (L149), the cache (L171) and the evals (L343) all wrap the spine. RAG is a kitchen inside the L173 architecture, not a separate app.
- **The economics are the index and the context (L149, L150).** Every question costs a retrieval call plus the context tokens (L191). Chunk size, top-k, and caching (L171) are the cost controls — the knowledge system is a budgeted system.
- **Freshness is the silent killer (L140).** The index is only as good as its last ingestion. A stale chunk is a confidently wrong answer — the senior design includes the re-ingestion pipeline (L176), not just the search.

## 8. Common Mistakes

- **"Let's fine-tune it with our docs."** Facts in weights (L141) — stale, unauditable, expensive. Knowledge belongs in an index.
- **Stuffing the whole document in the prompt.** No retrieval (L189), no chunking (L178) — the context window (L138) and the budget (L149) explode, and the model can't find the needle in the haystack.
- **No citations (L192).** The answer "looks grounded" but nothing points back to a source — the auditability RAG exists for is gone.
- **Ignoring retrieval quality.** Chunking (L178) and top-k (L189) set by guesswork, no evaluation (L195) — grounded hallucinations are the result.
- **Treating RAG as one call.** Forgetting the ingestion side entirely — the index must exist, be fresh (L176), and be evaluated before any question is asked.
- **RAG for everything.** For low-latency chat with no knowledge need (L145), or agent loops that need tools not docs (L200) — RAG is the knowledge tool, not the only tool.

## 9. Best Practices

- **Design the spine before the code** (L175) — ingestion, retrieval, synthesis, and where each lives in the L173 floor plan.
- **Chunk deliberately** (L178–179) — size, overlap and strategy are retrieval-quality decisions, not defaults.
- **Store metadata with every chunk** (L180) — source, date, tenant — for filtering and citations (L192).
- **Retrieve with the best available quality** (L187, L190) — hybrid search and reranking are the upgrades when vector-only falls short.
- **Build the prompt inside the budget** (L191, L149) — context construction is a token decision.
- **Evaluate from day one** (L195) — a golden set of questions measures retrieval before the users do.

## 10. Interview Questions

**Q: What is RAG?**
> A: Retrieval-augmented generation — the pattern that grounds an LLM in your data. Instead of the model answering from its frozen training knowledge (L141), I retrieve the relevant chunks from a knowledge index (L189), inject them into the prompt (L191), and the model answers from that context with citations (L192). Three stages: ingest, retrieve, generate.

**Q: Why RAG instead of fine-tuning?**
> A: Because they solve different problems. Fine-tuning changes behavior — tone, format, style. RAG provides knowledge — facts, docs, policies. Facts change daily and must be auditable (L192), which a retrievable index does and frozen weights can't. RAG is cheaper, updatable, and traceable — the default for knowledge, with fine-tuning reserved for behavior.

**Q: What problem does RAG solve?**
> A: The frozen-knowledge problem (L141). The model doesn't know my docs, my products, or my private policies — and it hallucinates in the gaps. RAG makes my knowledge retrievable, so every answer is grounded in context: fresh (re-ingest, L176), private (my index, L180), and auditable (citations, L192).

**Q: What does RAG not solve?**
> A: It's a knowledge tool, not a thinking tool. It doesn't give the model multi-step reasoning — that's agent loops (L200). It doesn't fix bad retrieval — that produces grounded hallucinations (L196). And it's not free — the context has a token cost (L149). The senior design knows where RAG ends and agents, caching (L171), and evals (L195) begin.

## 11. Follow-Up Questions

- Walk the three stages and where each can fail (L175, L196).
- How do chunking choices affect retrieval quality (L178)?
- How do you measure whether retrieval is good enough (L195)?
- How does RAG fit into the production floor plan (L173)?
- When would you choose agents over RAG — or both (L200)?

## 12. Comparison Table — RAG vs the Alternatives

| | RAG (this lesson) | Fine-tuning | Everything in the prompt |
|---|---|---|---|
| What changes | what the model reads | the model's weights | the request |
| Freshness | re-ingest (L176) | retrain | re-send |
| Private data | in your index (L180) | in weights | in the prompt |
| Auditable | citations (L192) | no | no |
| Cost per question | retrieval + context (L149) | amortized training | context window (L138) |
| Best for | knowledge | behavior | tiny, static snippets |

The senior read: **knowledge → RAG, behavior → fine-tune, trivial → prompt** — and RAG wins the knowledge column on freshness, privacy and auditability.

## 13. Code Example — The RAG Spine, End to End

```js
// The three stages: ingest once, retrieve + generate per question (L174-175).
import { embed } from './embeddings';          // L147, L181
import { searchIndex } from './vector-store';  // L182-189

// STAGE 1 · INGESTION — once, offline (L176-179).
async function ingest(documents) {
  for (const doc of documents) {
    const chunks = splitIntoChunks(doc.text);           // L178-179
    for (const chunk of chunks) {
      const vector = await embed(chunk.text);           // L147, L181
      await indexChunk({ ...chunk, vector, source: doc.path });  // L180
    }
  }
}

// STAGE 2+3 · RETRIEVE + GENERATE — per question (L189-192).
async function answer(question) {
  const qVector = await embed(question);                // embed the question
  const topK = await searchIndex(qVector, { k: 5 });    // L189 — the librarian
  const context = topK.map((c) => `[${c.source}] ${c.text}`).join('\n\n');  // L191

  const stream = streamText({
    model: openai('gpt-4o-mini'),
    system: 'Answer from the context only. Cite each claim with [source].',
    prompt: `Context:\n${context}\n\nQuestion: ${question}`,  // L149 budget
  });
  return stream;
}
```

```text
What the reader must SEE — the spine in code:

  ingest()       chunks → embeddings → index (L176-181)
  answer()       embed question → top-k (L189) → context (L191) → generate
  citations      [source] attached to every chunk (L192)

  Ingestion is offline. Retrieval + generation is per question.
```

```narrate
10-17: Ingestion — the offline side: chunk, embed, index with source metadata (L176-181).
20-25: Retrieval — embed the question, search the index for the top-k chunks (L189).
26-28: Context construction — the chunks become the prompt, inside the budget (L191, L149).
30-35: Generation — the model answers from the context with [source] citations (L192).
```

> [!TIP]
> The one line that makes it RAG and not a demo is `searchIndex(qVector, { k: 5 })` — the *retrieval* between the question and the prompt. **No retrieval, no RAG** — just a prompt with extra text.

## 14. Performance Notes

- **Retrieval must be fast (L151).** The search is on the critical path — a vector index (L182) and a cache (L171) keep it milliseconds, inside the TTFT budget (L145).
- **The context is a token cost (L149).** top-k chunks at N tokens each — the context window (L138) and the bill (L150) are set by retrieval, not by luck. Budget the context (L191).
- **Ingestion is the batch side (L222).** Embedding is a bulk workload — queue it (L222), cache the embeddings (L171), and re-run on change (L176).
- **The index is a database (L182).** Search latency, index size, and update cost are the performance axes — Postgres + pgvector (L183) is the boring default that scales with your existing stack.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Answers that make things up | Retrieval returning wrong chunks (L196) | Check top-k relevance; add reranking (L190) |
| Context window overflow | Chunks too big / too many (L178) | Reduce chunk size or top-k (L191) |
| Slow answers | Retrieval on the hot path (L151) | Cache (L171); check the index query (L182) |
| Old answers after a doc change | Stale index (L176) | Re-run ingestion on change |
| Answers with no source | Citations not wired (L192) | Attach source metadata at ingest (L180) |

## 16. Quick Revision Notes

- RAG = **retrieve → augment → generate** — ground the model in your data (L174).
- The problem: **frozen knowledge (L141)** — gaps become hallucinations.
- The spine: **ingestion (L176–181) → retrieval (L182–190) → synthesis (L191–192)**.
- **Knowledge → RAG; behavior → fine-tune** — the decision rule (L174).
- Retrieval quality is the ceiling: **bad retrieval = grounded hallucinations (L196)**.
- The economics: **context tokens (L149) + retrieval cost** — cache it (L171).

## 17. Cheat Sheet

```text
RAG = RETRIEVAL-AUGMENTED GENERATION — the knowledge spine

THE PROBLEM (L141)
  the model's knowledge is frozen at training
  gaps → confident hallucination

THE SPINE (L175)
  1 ingest    documents → chunks (L178) → embeddings (L181) → index (L182)
  2 retrieve  question → embed → top-k chunks (L189) → rerank (L190)
  3 generate  context → prompt (L191) → answer with citations (L192)

THE DECISION RULE
  knowledge → RAG        behavior → fine-tune
  trivial → prompt       reasoning → agents (L200)

THE QUALITY RULE
  retrieval is the ceiling (L189, L195)
  bad retrieval → grounded hallucinations (L196)
  evaluate from day one with a golden set (L195)

THE ECONOMICS
  context tokens (L149) + retrieval + ingestion (L176)
  cache the repeats (L171) · budget the context (L191)

INTERVIEW, 4 MOVES
  1 definition "ground the model in my data"
  2 problem    "frozen knowledge → hallucinations (L141)"
  3 spine      "ingest → retrieve → generate"
  4 boundary   "knowledge, not behavior; retrieval is the ceiling"
```

## 18. Key Takeaways

> [!RECAP]
> - RAG is **retrieve → augment → generate** — the pattern that grounds an LLM in your data instead of its frozen training knowledge (L141)
> - The spine is **ingestion (L176–181), retrieval (L182–190), synthesis (L191–192)** — each stage a lesson of its own
> - **Knowledge → RAG; behavior → fine-tune** — facts belong in a retrievable index, not in weights
> - **Retrieval quality is the whole game** — bad retrieval produces grounded hallucinations (L196); hybrid search (L187), reranking (L190) and evals (L195) are the upgrades
> - The context is a **token budget (L149)** and the index a **database (L182)** — the knowledge system is a costed, cacheable system (L171)
> - RAG lives inside the **L173 floor plan** — the gateway (L172) and the cache (L171) wrap the spine

## Check your understanding

Answer these without looking back.

1. What problem does RAG solve, and why (L141)?
2. Name the three stages of the spine and what each does.
3. Why RAG over fine-tuning — and when is fine-tuning right?
4. What does RAG not solve, and where do agents take over (L200)?
5. Why is retrieval the quality ceiling (L189, L195)?
6. What are the economics of a RAG question (L149, L171)?
7. How does the spine fit into the production floor plan (L173)?
8. What is the defining difference between the demo and the architect (L175)?

## A Closing Note — The Memory Your Model Never Had

You now hold the pattern that gives an LLM a memory it was never trained with: **retrieve the right chunks, ground the answer in them, cite the sources.** The model's knowledge is frozen (L141); yours doesn't have to be — it lives in an index you ingest, refresh and control.

Next: the architecture that makes RAG a system rather than a trick — RAG architecture (L175), the three-stage spine and where each piece lives in production.
