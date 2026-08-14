# Lesson 192 — Citations & Source Attribution

**Interview importance:** ⭐⭐⭐⭐ — "how do you make RAG trustworthy?" — the answer is *citations*: every claim traced to its chunk, formatted from metadata (L180), and verified by groundedness evals (L195, L337) — the auditability that separates RAG from hallucination (L174).**

L191 built the context. This lesson is the **trust layer**: citations and source attribution — making every claim traceable to the chunk it came from. Citations are what turn "the AI that makes things up" into "the AI that points to the source" (L174): the metadata captured at ingestion (L180) becomes the citation rendered in the context (L191) and echoed in the answer (L192). The discipline: format the context so the model *can* cite, instruct it to cite, and verify that it *does* — with groundedness evals (L195, L337).

The distinction this lesson is built on: a **demo** returns an answer with no source at all. A **solutions architect** designs attribution end to end: source metadata at ingestion (L180), source markers in the context (L191), citation instructions in the system prompt, and a verification loop (L195, L337) that checks every claim against its cited chunk — because an uncited answer is a hallucination with good grammar (L196).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why citations are RAG's auditability — the trust feature (L174, L192)
- Design attribution end to end: metadata (L180) → context markers (L191) → citations (L192)
- Explain the citation instructions: cite per claim, name the source, quote (L192)
- Verify citations: groundedness evals on the answer vs the chunks (L195, L337)
- Explain the failure modes: no citation, wrong citation, unverifiable claims (L196)

## 1. One-Line Definition

**Citations and source attribution are RAG's trust layer — the end-to-end design that makes every claim traceable: source metadata captured at ingestion (L180), source markers in the context (L191), citation instructions in the prompt, and groundedness verification (L195, L337) — the auditability that separates "the AI that makes things up" from "the AI that points to the source" (L174).**

The one-sentence interview answer: *"Citations are the trust layer (L192). Three stages. Capture — at ingestion, every chunk stores its source metadata (L180): file, section, date (L180). Format — the context renders each chunk with a source marker (L191), so the model reads labeled evidence (L192). Instruct — the system prompt requires citing per claim: 'answer from the context only, cite [source, §section] for each claim' (L142). Then verify — groundedness evals (L195, L337) check each claim against its cited chunk, so an uncited or mis-cited claim is caught before the user sees it (L196). An answer without citations is a hallucination with good grammar — citations are what make RAG auditable (L174)."*

## 2. Mental Model

Think of citations as **a journalist's fact-checking rule: every claim names its source.** A good article says "according to the Acme 2024 contract, §7, the termination clause…" — the reader can check it. RAG citations work the same way: the context is the reporter's notebook (labeled evidence, L191), the answer is the article (every claim names its source), and the fact-checker (groundedness eval, L195, L337) verifies that each claim actually appears in the cited source. Uncited claims don't run.

```text
   the notebook (L191)                 the article (L192)        the fact-check (L195)
   ┌────────────────────┐              ┌────────────────────┐    ┌────────────────────┐
   │ [acme-2024 §7]     │              │ "the termination   │    │ each claim → its   │
   │ the termination    │  ── cites ──►│ clause (§7, acme)  │──► │ cited chunk —      │
   │ clause requires…   │              │ requires 30 days…" │    │ grounded? (L337)   │
   └────────────────────┘              └────────────────────┘    └────────────────────┘
```

The mental model is **notebook → article → fact-check**: labeled evidence in, sourced claims out, and every claim verified against its source.

## 3. Visual Flow — Attribution End to End

```text
   INGESTION (L176)                     GENERATION (L145)
        │                                     │
        ▼                                     ▼
   ┌────────────────────────┐        ┌────────────────────────────────┐
   │ 1 · CAPTURE (L180)     │        │ 3 · CITE (L192)                │
   │  source, section, date │        │  the system prompt requires    │
   │  stored per chunk      │        │  per-claim citations (L142)    │
   └───────────┬────────────┘        │  the answer cites the chunks  │
               ▼                      └───────────────┬────────────────┘
   ┌────────────────────────┐                        ▼
   │ 2 · FORMAT (L191)      │        ┌────────────────────────────────┐
   │  context renders each  │        │ 4 · VERIFY (L195, L337)        │
   │  chunk with a source   │        │  groundedness: each claim vs   │
   │  marker — labeled      │        │  its cited chunk — uncited /   │
   │  evidence (L192)       │        │  mis-cited caught before ship  │
   └────────────────────────┘        └────────────────────────────────┘
```

The flow is the trust chain: **capture at ingestion (L180) → format in the context (L191) → cite in the answer (L192) → verify by eval (L195, L337)** — every stage a precondition for the next.

## 4. How It Works — The Four Stages

- **Capture (L180).** Attribution starts at ingestion: every chunk stores its source metadata (L180) — file/URL, section (L177), date (L140). No metadata, no citations — the auditability is a metadata feature (L180).
- **Format (L191).** The context renders each chunk with its source marker — "[acme-2024.pdf, §7]" — so the model reads *labeled* evidence (L191). The model can only cite what's labeled; formatting is the citation's precondition (L192).
- **Cite (L192).** The system prompt instructs: answer from the context only, cite per claim with the source marker (L142). The answer's citations are the context's markers echoed back — "per §7 of acme-2024.pdf…".
- **Verify (L195, L337).** Groundedness evaluation checks each claim against its cited chunk: does the chunk actually support the claim (L337)? Uncited claims and mis-cited chunks are flagged (L196) — the eval is the fact-checker that keeps trust from rotting (L341).

> [!NOTE]
> **The citation instruction is a prompt-engineering contract (L142).** "Cite every claim" is a system-prompt requirement (L142) — and like any instruction, the model may follow it imperfectly. That's why verification (L337) exists: the eval checks *output* against *chunks*, catching the model that summarized without citing, or cited the wrong chunk (L196). The senior design treats the instruction and the eval as one system — the instruction asks, the eval enforces (L195).

## 5. Real Project Usage

- **Customer support copilots.** Every answer cites the help article — "per 'Return policy', §3…" (L192); the user can verify (L174).
- **Legal and finance.** Clause-level citations ("§7, Acme 2024") — the audit trail is the product (L192); the groundedness eval (L337) runs in CI (L341).
- **E-commerce Q&A.** Product specs cited by SKU and section — "the spec sheet says…" (L180).
- **Internal knowledge search.** Engineering runbooks cited by file — "per runbook 'Deploy', §Rollback…" (L192).
- **Any regulated answer.** The claim→source link is a compliance requirement — citations are the evidence trail (L322).

The through-line: **citations are what make RAG's answers *checkable*** — and checkability is the trust that separates grounded answers from confident hallucinations (L174, L196).

## 6. Interview Explanation

Say it in four moves:

1. **The chain.** "Attribution is end to end: capture source metadata at ingestion (L180), label the context (L191), instruct the model to cite (L142), verify with evals (L195)."
2. **The why.** "An uncited answer is a hallucination with good grammar (L196) — citations are what make RAG auditable (L174)."
3. **The mechanism.** "The model cites what it read, and it only reads labeled evidence — the context's markers are the citation template (L192)."
4. **The enforcement.** "The instruction asks; the groundedness eval (L337) enforces — uncited and mis-cited claims are caught before the user sees them (L341)."

## 7. Senior-Level Insights

- **Attribution is designed end to end, or it fails (L192).** The senior answer names all four stages — capture (L180), format (L191), instruct (L142), verify (L337) — because a gap anywhere breaks the chain: no metadata, no markers, no citations, no trust.
- **Metadata is the citation's raw material (L180).** The auditability is a metadata feature — source, section, date captured at ingestion (L180). Retrofitting citations to an unlabeled index is re-ingestion (L176).
- **The eval is the enforcement (L195, L337).** Model instructions are probabilistic — the groundedness eval (L337) makes citation quality a *measured* property, run on every change (L341), like any regression (L195).
- **Citations compose with the observability stack (L322).** The claim→source link is the audit record (L322) — governance, compliance, and debugging all read the same trail (L332).
- **Groundedness is the quality boundary (L337).** "Does the answer follow from the evidence?" is the RAG-specific quality question (L337) — the eval that the observability module (L328+) makes continuous.

## 8. Common Mistakes

- **No source metadata (L180).** Chunks without provenance — citations impossible from the start (L192).
- **No markers in the context (L191).** Unlabeled evidence — the model can't distinguish or cite the chunks (L192).
- **No citation instruction (L142).** The model answers without sourcing — the instruction is a system-prompt contract (L192).
- **No verification (L337).** The instruction followed imperfectly — mis-cited chunks ship (L196).
- **Citations as decoration (L195).** Markers in the context but no eval — "trust me, it cites" is not a quality gate (L341).
- **Wrong-granularity citations (L177).** Citing a whole document when the claim is clause-level — the section metadata (L180) is the granularity control (L192).

## 9. Best Practices

- **Capture source metadata at ingestion** (L180) — file, section, date (L176).
- **Label every chunk in the context** (L191) — the marker is the citation template (L192).
- **Instruct per-claim citation** (L142) — "answer from context, cite each claim" (L192).
- **Verify with groundedness evals** (L337) — uncited and mis-cited claims caught (L195).
- **Run the eval in CI** (L341) — every retrieval/context change re-checks the chain.
- **Use section granularity** (L180, L177) — the citation's precision matches the claim's.

## 10. Interview Questions

**Q: How do you make RAG answers trustworthy?**
> A: Citations, end to end (L192). Capture source metadata at ingestion (L180) — file, section, date. Label each chunk in the context with its source marker (L191), so the model reads labeled evidence. Instruct the model to cite per claim (L142). Then verify — groundedness evals (L337) check each claim against its cited chunk. An answer without citations is a hallucination with good grammar (L196); the chain makes it auditable (L174).

**Q: What makes a citation possible?**
> A: Three preconditions (L192). Metadata — the source and section stored at ingestion (L180); without it, there's nothing to cite. Labeling — the context renders each chunk with its marker (L191), so the model reads labeled evidence. Instruction — the system prompt requires per-claim citation (L142). The answer's citations are the context's markers echoed back — the chain is designed, not hoped for.

**Q: What if the model cites wrong?**
> A: That's why verification exists (L337). The instruction is probabilistic — the model may mis-cite or skip citations. The groundedness eval (L337) checks each claim against its cited chunk: does the chunk support the claim? Uncited claims and mis-citations are flagged (L196), run on every change (L341). The instruction asks; the eval enforces (L195).

**Q: How do you cite at the right granularity?**
> A: The section metadata is the granularity control (L180). A clause-level claim cites the clause — "per §7" — not the whole document (L192). The parser (L177) captures the section at ingestion (L176), the context renders it in the marker (L191), and the answer cites it. The citation's precision matches the claim's — that's the audit trail's quality (L322).

## 11. Follow-Up Questions

- How does the eval check groundedness (L337)?
- What's the citation instruction, exactly (L142)?
- How does section granularity flow from parsing (L177)?
- How do citations feed the audit trail (L322)?
- How does the eval run in CI (L341)?

## 12. Comparison Table — Uncited vs Cited RAG

| | Uncited (L196) | Cited (this lesson) |
|---|---|---|
| Source metadata (L180) | none | captured at ingestion |
| Context (L191) | unlabeled text | labeled evidence |
| Instruction (L142) | "answer" | "cite per claim" |
| Answer | confident claims | sourced claims |
| Verification (L337) | none | groundedness eval |
| Trust (L174) | "trust me" | "per §7, acme-2024.pdf" |

The senior read: **the right column is the trust chain** — each stage a precondition for the next (L192).

## 13. Code Example — The Trust Chain

```js
// Citations: capture → format → instruct → verify (L192, L337).
// 1 · CAPTURE — at ingestion, source metadata per chunk (L180).
await indexChunk({
  text: chunk.text,
  vector: chunk.embedding,                    // L181
  metadata: { source: doc.path, section: chunk.heading, date: doc.updatedAt },  // L180
});

// 2 · FORMAT — the context renders labeled evidence (L191).
const context = topK.map((c) => `[${c.metadata.source} §${c.metadata.section}]\n${c.text}`).join('\n\n');

// 3 · INSTRUCT — the citation contract (L142, L192).
const system = `Answer from the context only. Cite each claim with its [source §section] marker. If the context doesn't support a claim, say so — never invent a source.`;

// 4 · VERIFY — groundedness: each claim vs its cited chunk (L337).
const grounded = await evaluateGroundedness(answer, chunks);   // L195, L337
const issues = grounded.filter((c) => !c.supported);           // mis-cites caught
if (issues.length) await flagForReview(issues);                // before the user (L196)
```

```text
What the reader must SEE — the four stages, one chain:

  metadata: source, section  → capture at ingestion (L180)
  [source §section] in ctx   → labeled evidence (L191)
  "cite each claim"          → the instruction (L142)
  evaluateGroundedness()     → the enforcement (L337)

  Capture → format → instruct → verify — the trust chain.
```

```narrate
3-6: Capture — source and section metadata stored at ingestion; without it, no citations (L180).
8-9: Format — the context renders each chunk with its source marker (L191).
11-13: Instruct — the system prompt requires per-claim citation with the markers (L142, L192).
15-19: Verify — the groundedness eval checks each claim against its cited chunk; failures are flagged before ship (L337, L195, L196).
```

> [!TIP]
> The pair that makes it a chain and not a feature: **`[${source} §${section}]`** (labeled evidence, L191) and **`evaluateGroundedness(answer, chunks)`** (the enforcement, L337). **The marker makes citing possible; the eval makes it true.**

## 14. Performance Notes

- **The metadata is free (L150).** Captured at ingestion (L180) — a few fields per chunk; the citation feature costs nothing at query time (L151).
- **The markers are free (L191).** Rendering `[source §section]` in the context — token cost is a handful per chunk (L149).
- **The eval is the cost (L150, L337).** Groundedness checks are LLM calls (L337) — sample or score on the golden set (L195), and run in CI (L341), not per user request.
- **The citation adds no latency (L151).** The answer's markers are the context's markers echoed — no extra round trips (L145).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| No citations in answers | No instruction (L142) | Add the cite-per-claim system prompt |
| Citations impossible | No metadata (L180) | Re-ingest with source/section (L176) |
| Wrong chunks cited | No verification (L337) | Add groundedness evals (L195) |
| Whole-doc citations | Section metadata missing (L177) | Capture sections at parse (L180) |
| Trust regressed after change | Eval not in CI (L341) | Run the groundedness suite |

## 16. Quick Revision Notes

- Citations = **the trust chain**: capture → format → instruct → verify (L192).
- Capture: **source metadata at ingestion** (L180).
- Format: **labeled evidence in the context** (L191).
- Instruct: **"cite each claim"** (L142).
- Verify: **groundedness evals** (L337) — the enforcement (L195).
- Uncited answers = **hallucination with good grammar** (L196).

## 17. Cheat Sheet

```text
CITATIONS = the trust layer of RAG — every claim traced

THE CHAIN (L192)
  1 capture  source, section, date per chunk — at ingestion (L180)
  2 format   [source §section] markers in the context (L191)
  3 instruct "cite each claim" — the system-prompt contract (L142)
  4 verify   groundedness: claim vs cited chunk (L337)

THE WHY (L174, L196)
  an uncited answer is a hallucination with good grammar
  citations are what make RAG auditable (L322)

THE ENFORCEMENT (L195, L341)
  the instruction asks — the eval enforces
  mis-cites and uncited claims caught before the user (L196)
  run on every change, in CI (L341)

THE GRANULARITY (L177, L180)
  clause-level claim → "per §7" — the section is the unit
  captured by the parser (L177), stored as metadata (L180)

INTERVIEW, 4 MOVES
  1 chain    "capture → format → instruct → verify"
  2 why      "auditability — trust vs hallucination (L174)"
  3 mechanism "the model cites what it reads (labeled, L191)"
  4 enforce  "the eval makes the instruction true (L337)"
```

## 18. Key Takeaways

> [!RECAP]
> - Citations are RAG's **trust layer** (L192): capture source metadata (L180), format labeled evidence (L191), instruct per-claim citation (L142), and verify with groundedness evals (L337)
> - **The chain is designed end to end** — a gap anywhere breaks it: no metadata, no markers, no citations, no trust
> - The model **cites what it reads**, and it only reads labeled evidence — the context's markers are the citation template (L192)
> - **The instruction asks; the eval enforces** (L195, L337) — mis-cites and uncited claims are caught before the user sees them (L196)
> - **The section is the citation granularity** (L177, L180) — captured by the parser at ingestion, rendered in the marker, echoed in the claim (L192)
> - An uncited answer is **a hallucination with good grammar** (L196) — citations are what separate grounded RAG from confident invention (L174)

## Check your understanding

Answer these without looking back.

1. Name the four stages of the trust chain (L192).
2. Why is metadata the citation's raw material (L180)?
3. What makes citing possible in the context (L191)?
4. Why is the eval the enforcement (L337)?
5. What's the citation granularity, and where does it come from (L177)?
6. What happens when the chain breaks at each stage?
7. How do citations feed the audit trail (L322)?
8. Why is an uncited answer a hallucination (L196)?

## A Closing Note — The Trust That Makes RAG Real

You now hold the trust chain: **capture the source at ingestion, label the evidence in the context, instruct the model to cite, and verify with the eval.** Citations are the difference between grounded answers and confident invention — and now every claim can be checked.

Next: improving the question before retrieval — query rewriting (L193), where the query is refined before it's ever searched.
