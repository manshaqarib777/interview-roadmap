# Lesson 197 — Production RAG Architecture (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of RAG / Knowledge Systems: reassembling L174–L196 into *one production system* — and the milestone for M20 is building an ingestion → retrieval → synthesis pipeline and evaluating it.**

This is the last lesson of the RAG module — and the synthesis it was built toward. L174–L196 gave you the parts: the pattern (L174), the spine (L175), ingestion (L176–177), chunking (L178–179), metadata (L180), embeddings (L181), the stores (L182–186), the retrieval quality stack (L187–190), context (L191), citations (L192), query rewriting (L193), contextual retrieval (L194), evaluation (L195), and the failure modes (L196). This lesson **reassembles them into one production RAG architecture** — the shape you'd actually ship, drawn as one diagram with the budgets, the quality gates, and the eval loop (L195).

The distinction this lesson is built on: a **specialist** knows the parts. A **solutions architect** assembles them into a whole — and explains why each part sits where it does, what happens when each fails (L196), and how the whole thing is measured (L195) and kept fresh (L176). That assembly is M20's milestone: build an ingestion → retrieval → synthesis pipeline and evaluate it.

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L174–L196 into one production RAG architecture
- Draw the full flow: ingestion → retrieval → synthesis, with the quality stack and the eval loop
- Explain each part's placement by its boundary — offline/online (L175), budget (L149), quality (L195)
- Describe the failure behavior of the whole — the four modes (L196) and their levers
- Defend the architecture in an interview: the parts, the boundaries, the trade-offs (L186)

## 1. One-Line Definition

**Production RAG architecture is the module's synthesis — one system that assembles the offline factory (ingestion, chunking, embeddings, L176–181), the quality stack (hybrid, reranking, L187–190), the synthesis stage (context, citations, L191–192), the pre-retrieval upgrades (query rewriting, contextual retrieval, L193–194), and the eval loop (L195) — each part placed by a boundary, each failure mode mapped to its lever (L196), and the whole measured and kept fresh.**

The one-sentence interview answer: *"Production RAG is the whole module in one system (L197). Offline, the factory: documents → parse (L177) → chunk with context (L178, L194) → embed (L181) → index with metadata (L180, L182). Online, the query path: query rewriting (L193) → hybrid retrieval (L187) scoped by filters (L180, L320) → reranking (L190) → context inside the budget (L191, L149) → generation with citations (L145, L192). Around it: the eval loop (L195) — the golden set scores every change in CI (L341); the failure modes (L196) are mapped to levers; and freshness (L140) is the factory's product (L176). Every part is placed by a boundary — the factory offline (L175), the budget before the context (L149), the eval before ship (L195)."*

## 2. Mental Model

Think of the production RAG system as **a factory, a shop, and a quality lab** — the L175 floor plan, now fully stocked. The factory (offline, L176–181) turns raw documents into indexed chunks — with context (L194), metadata (L180), and embeddings (L181). The shop (online, L189–192) serves questions: rewrite (L193), retrieve (L189), rerank (L190), build the context (L191), answer with citations (L192). The quality lab (L195) tests everything: the golden set runs on every change (L341), and the failure modes (L196) are the lab's checklist.

```text
   THE FACTORY (L176-181)      THE SHOP (L189-192)         THE LAB (L195)
   ┌────────────────────┐      ┌────────────────────┐      ┌────────────────────┐
   │ docs → parse (L177)│      │ rewrite (L193)     │      │ golden set (L195)  │
   │ → chunk + ctx      │      │ hybrid (L187)      │      │ retrieval metrics  │
   │   (L178, L194)     │      │ rerank (L190)      │      │ answer metrics     │
   │ → embed (L181)     │      │ context (L191)     │      │ groundedness (L337)│
   │ → index + meta     │      │ answer + cite      │      │ CI gate (L341)     │
   │   (L180, L182)     │      │   (L145, L192)     │      │ failure map (L196) │
   └────────────────────┘      └────────────────────┘      └────────────────────┘
```

The mental model is **factory + shop + lab**: the factory keeps the index fresh (L176), the shop serves questions from it (L189), and the lab proves the whole thing (L195).

## 3. Visual Flow — The Whole System, One Diagram

```text
   ┌────────────────────────── OFFLINE · THE FACTORY (L176) ──────────────────────────┐
   │  documents → parse (L177) → chunk with context (L178, L194) → contextual embed  │
   │       (L181, L194) → index with metadata (L180) → the vector store (L182-186)   │
   └──────────────────────────────────┬──────────────────────────────────────────────┘
                                      │  the index — fresh (L140), scoped (L180)
                                      ▼
   ┌────────────────────────── ONLINE · THE SHOP (L189) ─────────────────────────────┐
   │  question → rewrite (L193) → hybrid search (L187) + filters (L180, L320)        │
   │       → rerank (L190) → context within the budget (L191, L149)                  │
   │       → generate with citations (L145, L192) → the answer + sources             │
   └──────────────────────────────────┬──────────────────────────────────────────────┘
                                      ▼
   ┌────────────────────────── THE LOOP · THE LAB (L195, L341) ──────────────────────┐
   │  golden set → retrieval metrics (precision/recall/MRR) + answer metrics         │
   │       (groundedness, L337) → tune chunking (L178), top-k (L189), reranker       │
   │       (L190) → failure modes mapped (L196) → re-ingest (L176) → repeat          │
   └─────────────────────────────────────────────────────────────────────────────────┘
```

The flow is the module in one diagram: **factory → index → shop → lab** — and every box is a lesson from L174–L196.

## 4. How It Works — The Assembly, Part by Part

- **The factory (L176–181).** The offline spine: parse (L177), chunk with context (L178, L194), contextual embeddings (L181, L194), metadata (L180), and the store (L182–186). Its product is the index — fresh (L176, L140) and scoped (L180, L320). The factory runs on a schedule and on change (L222).
- **The shop (L187–192).** The online spine: query rewriting (L193), hybrid retrieval (L187) with filters (L180, L320), reranking (L190), context construction inside the budget (L191, L149), and generation with citations (L145, L192). Its product is the answer — grounded (L337) and sourced (L192).
- **The quality stack (L187–190).** The retrieval upgrades: hybrid (L187), the keyword/semantic channels (L188), the top-k and scoring (L189), and the reranker (L190) — each a precision/recall lever (L195).
- **The lab (L195, L341).** The eval loop: the golden set scores retrieval (L195) and answers (L337) on every change (L341); the failure modes (L196) are the checklist; the fixes follow the metrics (L195).
- **The boundaries (L175, L149).** The factory is offline (L175, L222); the budget gates the context (L149, L191); the eval gates the ship (L195, L341) — the boundaries are what make the assembly production.

> [!NOTE]
> **The assembly rule: every part is placed by a boundary (L197).** The factory is offline because ingestion is a batch workload (L175, L222). The budget gates the context because the window is the ceiling (L149, L138). The eval gates the ship because "it looks right" is how regressions ship (L195, L196). The index is a database decision (L186) and the citations are a metadata feature (L180, L192). An architect who can name the boundary for each part can defend the whole assembly — and the failure modes (L196) are what the boundaries prevent.

## 5. Real Project Usage

- **A production support copilot.** The full assembly: docs ingested nightly (L176), hybrid retrieval (L187), reranking (L190), cited answers (L192), and the golden set in CI (L341).
- **A multi-tenant RAG platform (L349, L320).** The factory per tenant (L176), tenant-scoped retrieval (L180, L320), and the golden set per tenant (L195).
- **A legal research tool.** Section-level chunking (L177–179), clause citations (L192), query rewriting for conceptual queries (L193), and groundedness evals (L337).
- **An e-commerce Q&A.** Hybrid for SKUs and concepts (L187–188), metadata filters for products (L180), and the failure-mode checklist (L196) in QA.
- **Anything "production RAG".** The pattern is the shape: factory, shop, lab — different content, same floor plan (L197).

The through-line: **the floor plan is the module's output** — every RAG product is this assembly, and M20's milestone is building it end to end and evaluating it (L195).

## 6. Interview Explanation

Say it in four moves:

1. **The assembly.** "Production RAG is the module in one system: the factory (ingestion, L176–181), the shop (retrieval + generation, L187–192), and the lab (eval, L195)."
2. **The flow.** "Docs flow through the factory into the index; questions flow through the shop — rewrite (L193), hybrid (L187), rerank (L190), budgeted context (L191), cited answer (L192)."
3. **The boundaries.** "The factory is offline (L175, L222); the budget gates the context (L149); the eval gates the ship (L195, L341)."
4. **The failure behavior.** "Four modes (L196) — missing chunk (recall, L193), wrong chunk (precision, L190), hallucinated (context + instructions, L191, L142), ungrounded (evals, L337) — each mapped to its lever, each caught by the golden set (L195)."

## 7. Senior-Level Insights

- **The architecture is the sum of its boundaries (L175, L197).** A senior review of a RAG system checks the boundaries first: offline/online split (L175), the budget (L149), the tenant scope (L320), the eval gate (L341). Naming each is the review.
- **The eval loop is what makes it production (L195, L341).** A demo works on three examples; a production system is measured on a golden set in CI (L341) — the loop that tunes chunking (L178), top-k (L189), and the reranker (L190) with data, not vibes.
- **The failure modes are the operations checklist (L196).** Production RAG is diagnosed by the four modes — the golden set (L195) reveals which metric regressed, the mode names the lever, and the fix is targeted (L196). The ops team runs this playbook, not "tune the prompt".
- **The economics are the factory and the cache (L150, L171).** Ingestion is the batch cost (L176, L222); retrieval is the per-query cost (L189); the cache (L171) serves repeats; the budgets (L149) bound the context — the cost model (L150) is built into the assembly.
- **The assembly is testable per layer (L341).** The parser (L177), the chunker (L178), the retrievers (L187), the reranker (L190), the constructor (L191) — each a testable unit; the whole is tested by the golden set (L195). The floor plan's testability is its architecture's quality.

## 8. Common Mistakes

- **Building only the shop (L189–192).** Retrieval and generation without the factory (L176) or the lab (L195) — an index that goes stale (L140) and a quality that's unmeasured (L196).
- **The factory with no schedule (L176).** Ingestion run once by hand — freshness (L140) dies and nobody notices until the eval does (L195).
- **The lab bolted on (L195).** Evals after shipping instead of in CI (L341) — regressions reach users first (L196).
- **Parts without boundaries (L175).** Ingestion on the question path (L222), context un-budgeted (L149), the tenant filter forgotten (L320) — the assembly with its boundaries missing.
- **The quality stack skipped (L187–190).** Vector-only retrieval, no hybrid (L187), no reranking (L190) — the precision/recall levers unused (L195).
- **The floor plan without the failure map (L196).** Can't name which mode a wrong answer is — the misdiagnosis that wastes the team's time (L196).

## 9. Best Practices

- **Draw the floor plan before writing code** (L197) — factory, shop, lab, and the flow between them (L175).
- **Place every part by its boundary** (L197) — offline (L175), budget (L149), scope (L320), eval (L341).
- **Build the quality stack** (L187–190) — hybrid, reranking, measured (L195).
- **Wire the eval loop into CI** (L195, L341) — the golden set is a regression suite.
- **Map the failure modes to levers** (L196) — the ops playbook, written down.
- **Keep the factory scheduled and observable** (L176, L222, L332) — freshness is the index's product (L140).

## 10. Interview Questions

**Q: Walk me through a production RAG architecture.**
> A: Three parts (L197). The factory — offline: docs → parse (L177) → chunk with context (L178, L194) → embed (L181) → index with metadata (L180, L182). The shop — online: query rewriting (L193) → hybrid retrieval (L187) scoped by filters (L180, L320) → reranking (L190) → context inside the budget (L191, L149) → generation with citations (L192). The lab — the golden set (L195) scores retrieval and answers in CI (L341). The boundaries: factory offline (L175), budget before context (L149), eval before ship (L195).

**Q: What makes this production and not a demo?**
> A: The boundaries and the loop (L197). The factory is a scheduled pipeline (L176, L222), not a script — the index stays fresh (L140). The eval loop runs in CI (L341) — every change to chunking (L178), top-k (L189), or the reranker (L190) is scored against the baseline (L195). And the failure modes (L196) are mapped to levers — a wrong answer is diagnosed, not guessed at. A demo works on examples; this works when measured.

**Q: Where's the quality in this architecture?**
> A: Three places (L195). Retrieval quality — the hybrid (L187) and the reranker (L190), scored by precision/recall/MRR on the golden set (L195). Answer quality — groundedness and faithfulness evals (L337). And the loop — CI (L341) scores every change, so a regression reverts before users see it (L196). Quality is a measured property of the assembly, not a hope about the model.

**Q: How would you change it for a multi-tenant SaaS (L349)?**
> A: The floor plan stays; the scope changes (L197). The tenant filter is applied by construction in retrieval (L320) — isolation (L320) is a boundary of the shop. The factory runs per tenant or tagged by tenant (L176, L180). The eval loop has per-tenant golden sets (L195) and the failure modes (L196) include the leak mode (L320, L312). The assembly is identical; the tenant boundary is enforced everywhere.

## 11. Follow-Up Questions

- Which boundary is the hardest to keep, and why (L175)?
- How does the eval loop tune the quality stack (L195)?
- How does the budget flow through the shop (L149)?
- How do the failure modes map to the assembly (L196)?
- How does the floor plan change for a RAG platform (L349)?

## 12. Comparison Table — Demo vs the Production Assembly

| Station | Demo | Production (this lesson) |
|---|---|---|
| Factory (L176) | one-off script | scheduled pipeline (L222), observable (L332) |
| Chunking (L178) | fixed default | measured config (L179, L195) |
| Retrieval (L189) | vector-only | hybrid (L187) + rerank (L190), scoped (L320) |
| Context (L191) | full docs | budgeted (L149), formatted (L192) |
| Citations (L192) | none | source + section, verified (L337) |
| Eval (L195) | none | golden set in CI (L341) |
| Failures (L196) | "it hallucinated" | four modes, mapped to levers |

The senior read: **the table is the milestone** — M20's claim is building the right column end to end, and defending it with the left column's failures in mind.

## 13. Code Example — The Assembly in One Shape

```text
The production RAG codebase (L197) — the floor plan as folders:

  factory/                 THE OFFLINE SPINE (L176) — scheduled (L222)
    parse.ts               documents → text (L177)
    chunk.ts               chunks + surrounding context (L178, L194)
    contextual-embed.ts    context sentences + embeddings (L194, L181)
    index.ts               metadata + vectors → the store (L180, L182)

  shop/                    THE ONLINE SPINE (L189) — per question
    rewrite.ts             query rewriting by shape (L193)
    retrieve.ts            hybrid + filters, scoped (L187, L180, L320)
    rerank.ts              the cross-encoder pass (L190)
    context.ts             budgeted construction (L191, L149)
    generate.ts            cited answers (L145, L192)

  lab/                     THE EVAL LOOP (L195) — CI (L341)
    golden.ts              questions + expected sources (L342)
    retrieval-metrics.ts   precision/recall/MRR (L195)
    answer-metrics.ts      groundedness/faithfulness (L337)
    failures.ts            the four modes → levers (L196)

  The factory feeds the index. The shop serves questions.
  The lab gates every change. That is the architecture.
```

```text
What the reader must SEE — the three parts, the boundaries:

  factory/  offline · scheduled · observable (L176, L222, L332)
  shop/     online · budgeted · scoped (L189, L149, L320)
  lab/      the golden set · CI · failure map (L195, L341)

  Factory, shop, lab — the floor plan in folders.
```

```narrate
2-7: The factory — the offline spine: parse, chunk with context, contextual embeddings, index (L176-182, L194).
9-15: The shop — the online spine: rewrite, hybrid with filters, rerank, budgeted context, cited generation (L187-193).
17-22: The lab — the eval loop: the golden set, both metric families, and the failure-mode map (L195, L337, L196).
24-26: The assembly rule — every folder is a boundary; every box is a lesson (L197).
```

> [!TIP]
> The folder shape *is* the architecture: **factory offline, shop online, lab in CI.** If the factory code touches the question path (L175), the split is broken; if the lab isn't wired to CI (L341), the quality gate is missing. **Three folders, three boundaries — that's M20's milestone in a directory tree.**

## 14. Performance Notes

- **The factory is the batch cost (L176, L222).** Parsing, chunking, and contextual embedding are ingestion-time (L150) — queued (L222), parallelized, and cached by content hash (L171).
- **The shop is the latency path (L189, L151).** Rewrite (L193) → hybrid (L187) → rerank (L190) must fit the TTFT budget (L145) — the cache (L171) and parallel channels (L222) are the levers.
- **The context is the token bill (L149, L191).** Budgeted construction (L191) is the cost control (L150); dedup (L178) and the cache (L171) trim it.
- **The lab is the CI cost (L195, L341).** Retrieval metrics are cheap (L195); answer metrics are LLM calls (L337) — sized for the build (L296), run on every change (L341).

## 15. Debugging Scenarios

| Symptom | First check (L196) | The lever |
|---|---|---|
| Generic answers | Missing chunk (L189) | Recall: chunking (L178), rewrite (L193) |
| Confident wrong answers | Wrong chunk (L189) | Precision: hybrid (L187), rerank (L190) |
| Invented claims | Hallucinated (L145) | Context (L191), instructions (L142) |
| Citations don't match | Ungrounded (L337) | Groundedness evals (L337) |
| Stale answers | Factory not scheduled (L176) | Re-ingest on change (L222, L140) |
| Regression after a change | Metric dropped (L195) | Golden set in CI (L341); revert |

## 16. Quick Revision Notes

- Production RAG = **the factory (L176–181), the shop (L187–192), the lab (L195)** (L197).
- The flow: **factory → index → shop → answer → lab → tune** (L197).
- The boundaries: **offline (L175), budget (L149), scope (L320), eval (L341)**.
- The quality stack: **hybrid (L187) + rerank (L190)**, measured (L195).
- The failure map: **four modes → levers** (L196).
- The milestone: **build the assembly and evaluate it** (L195, L341).

## 17. Cheat Sheet

```text
PRODUCTION RAG = the factory, the shop, the lab

THE FACTORY (L176-181) — OFFLINE
  parse (L177) → chunk + context (L178, L194) → contextual embed (L181)
  → index + metadata (L180, L182) — scheduled (L222), fresh (L140)

THE SHOP (L189-192) — ONLINE
  rewrite (L193) → hybrid + filters (L187, L180, L320) → rerank (L190)
  → context within the budget (L191, L149) → cited answer (L145, L192)

THE LAB (L195, L341) — THE LOOP
  golden set → retrieval metrics (precision/recall/MRR) (L195)
  + answer metrics (groundedness, L337) → tune chunking/top-k/reranker
  → failure modes mapped to levers (L196) → CI gates the ship (L341)

THE BOUNDARIES (L197)
  factory offline (L175) · budget before context (L149)
  tenant scope by construction (L320) · eval before ship (L195)

THE MILESTONE (M20)
  build the assembly end to end — and evaluate it (L195)

INTERVIEW, 4 MOVES
  1 assembly "factory, shop, lab — the module in one system"
  2 flow     "docs in, index, questions through the shop, cited answers"
  3 boundaries "offline, budget, scope, eval"
  4 failures "four modes, mapped to levers (L196)"
```

## 18. Key Takeaways

> [!RECAP]
> - Production RAG architecture is **the module's synthesis** (L197): the factory (L176–181), the shop (L187–192), and the lab (L195) in one system
> - The flow is **factory → index → shop → answer → lab → tune** — every lesson has a station (L197)
> - **Every part is placed by a boundary**: the factory offline (L175), the budget before the context (L149), tenant scope by construction (L320), the eval before ship (L195, L341)
> - The **quality stack** — hybrid (L187) and reranking (L190) — is the retrieval upgrade, measured on the golden set (L195)
> - The **failure modes are mapped to levers** (L196) — missing chunk (recall, L193), wrong chunk (precision, L190), hallucinated (context + instructions, L191, L142), ungrounded (evals, L337)
> - **M20's milestone is this assembly**: build an ingestion → retrieval → synthesis pipeline and evaluate it (L195) — the floor plan in section 13 is the shape

## Check your understanding

Answer these without looking back.

1. Name the three parts of the assembly and the flow between them (L197).
2. What boundary places each part where it is?
3. What makes the assembly production rather than a demo (L195)?
4. Where is the quality in the architecture (L195, L337)?
5. How do the failure modes map to the assembly (L196)?
6. How does the budget flow through the shop (L149)?
7. How does the floor plan change for a multi-tenant SaaS (L320)?
8. What is M20's milestone, and how does this lesson meet it?

## A Closing Note — The Floor Plan You Can Build

That was the last lesson of RAG / Knowledge Systems — and the one you'll *ship*. L174–L196 gave you the stations; this lesson gave you the floor plan: **the factory, the shop, the lab — the flow between them, the boundaries that place each part, and the failure map that keeps the whole thing diagnosable.** When you can draw it, build it with the pipeline, and defend it — naming the factory's schedule (L176), the budget's gate (L149), the tenant's scope (L320), and the eval's seat (L195) — you have claimed Milestone M20.

The next module turns the floor plan into *action*: AI Agents (L198–L216) — the loop that calls the model, executes tools, and feeds results back — built on the tools (L144, L164) and grounded in everything this module taught you to retrieve. You've built the system that knows your data; now you'll build the one that does things with it.
