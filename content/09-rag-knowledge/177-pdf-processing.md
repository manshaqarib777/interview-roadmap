# Lesson 177 — PDF Processing & Text Extraction

**Interview importance:** ⭐⭐⭐⭐ — "how do you handle PDFs in RAG?" — the honest answer is *it depends on the PDF*: text layer, scanned image, or born-digital — and the extraction quality decides the retrieval quality (L195).

L176 built the factory; this lesson is its messiest machine: **document parsing** — turning PDFs, scans, tables and slides into the clean text the rest of the pipeline needs. It's the stage where content is quietly lost: a scanned PDF without OCR is a folder of images; a table parsed as text becomes a meaningless wall; an encoding bug turns a contract into mojibake. Retrieval quality (L195) can't exceed parse quality — garbage in, grounded hallucinations out (L196).

The distinction this lesson is built on: a **demo** runs `pdftotext` and moves on. A **solutions architect** classifies the document first — digital text layer, scanned image, or hybrid — picks the right extraction (text layer, OCR, or both), preserves structure (headings, tables, code blocks, L178), and checks the parse quality (L195) before a single chunk reaches the index.

## Learning Objectives

By the end of this lesson you should be able to:

- Classify PDFs: born-digital (text layer) vs scanned (OCR) vs hybrid (L177)
- Choose extraction per type: text-layer extraction, OCR, vision models (L146)
- Explain what structure to preserve — headings, tables, lists, code — and why (L178)
- Design parse-quality checks: character yield, page coverage, sanity checks (L195)
- Explain the failure modes: silent drops, OCR garbage, table mangling (L196)

## 1. One-Line Definition

**PDF processing and text extraction is the parse stage of the ingestion pipeline — classify the document (born-digital text layer, scanned image, or hybrid), extract with the right tool (text layer, OCR, or a vision model, L146), preserve structure (headings, tables, code, L178), and verify the parse quality (L195) — because retrieval quality can never exceed the quality of the text it searches (L196).**

The one-sentence interview answer: *"PDF parsing is classification first. Born-digital PDFs have a text layer — extract it directly, preserving structure (headings, tables, code blocks) for chunking (L178). Scanned PDFs are images — OCR them (and for hard layouts, a vision model, L146). Hybrids — text layer plus scanned pages — get both, merged by page. Then I check parse quality before indexing: character yield, page coverage, and a sanity check that the text is actually the document (L195). A parse stage that silently drops content is how retrieval goes wrong (L196)."*

## 2. Mental Model

Think of the document as **a chest of drawers, and parsing as opening each drawer without losing what's inside.** The PDF is the chest: pages (drawers), each holding text, images, tables. A text-layer PDF has readable labels on every drawer — extraction reads them directly. A scanned PDF has no labels — each drawer holds a photograph, and OCR reads the photograph (or a vision model, L146). The job is the same: get everything out, in order, without dropping a drawer or scrambling the contents.

```text
   born-digital PDF              scanned PDF                 hybrid PDF
   ┌────────────────┐           ┌────────────────┐         ┌────────────────┐
   │ text layer ✓   │           │ images only    │         │ text + scans   │
   │ extract text   │           │ OCR (or vision │         │ both, merged   │
   │ directly (L177)│           │ model, L146)   │         │ by page (L177) │
   └────────────────┘           └────────────────┘         └────────────────┘
        structure kept               structure recovered        structure merged
        headings · tables            layout → structure         per page
```

The mental model is **classify, then extract**: the tool is chosen by the document's nature, and the structure — not just the characters — is the payload.

## 3. Visual Flow — A Document Through the Parse Stage

```text
   a PDF arrives at the parse stage (L176)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CLASSIFY (L177)                                      │
   │     text layer? → born-digital                           │
   │     images only? → scanned (needs OCR / vision, L146)    │
   │     mixed? → hybrid                                      │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · EXTRACT — per class                                  │
   │     text layer → pdftotext-style, keep layout            │
   │     scanned → OCR / vision model (L146)                  │
   │     hybrid → both, merge by page                         │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · PRESERVE STRUCTURE (L178)                            │
   │     headings → chunk boundaries                          │
   │     tables → markdown tables (stay intact)               │
   │     lists/code → kept as blocks                          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · VERIFY (L195)                                        │
   │     character yield · page coverage · sanity check       │
   │     failed → log, retry (L169), don't index garbage      │
   └──────────────────────────────────────────────────────────┘
                      ▼
   clean, structured text → the chunking stage (L178)
```

The flow is the parse discipline: **classify → extract → preserve → verify** — and the verify stage is what separates a parse stage from a garbage generator.

## 4. How It Works — The Classes, the Extractors, and the Structure

- **Born-digital PDFs.** The file has a text layer — the characters are there, extractable directly. Tools like `pdftotext` or PDF.js read it fast and cheap. The catch: layout order can be wrong (columns, headers/footers) — extraction needs layout awareness (L177), not just character dumping.
- **Scanned PDFs.** The "PDF" is a folder of images. OCR (Tesseract, cloud OCR) reads the pixels — slower, error-prone on handwriting and low quality. For hard layouts — tables, forms, dense pages — a **vision model (L146)** reads the page image directly and returns structured text or Markdown. The trade: OCR is cheap and batchable; vision is more accurate and more expensive (L150).
- **Hybrid PDFs.** Some pages have a text layer, some are scans (or the text layer is corrupt). The answer is both: extract the text layer where it exists, OCR the rest, merge by page.
- **The structure to preserve (L178).** Headings (chunk boundaries), tables (keep them tables — a markdown table chunk retrieves better than a mangled wall of text), lists, code blocks, and page/section signals. Structure is what makes the text chunkable (L178) and retrievable (L189).

> [!NOTE]
> **The quality rule: retrieval can't exceed parse quality (L195, L196).** If the parse stage drops a table, no retrieval tuning will ever find it — the missing chunk is a L196 failure mode born at this stage. That's why parse has a verify step: character yield (how much text came out vs expected), page coverage (did every page produce content), and a sanity check (is the output actually the document, not garbage or the wrong file). Parse quality is checked here or paid for forever downstream.

## 5. Real Project Usage

- **Legal contracts.** Scanned agreements → OCR/vision (L146) → clauses chunked by heading (L178) → "what's the termination clause?" retrieves the right section (L192 cites it).
- **HR policies.** Born-digital PDFs + scanned old versions → text-layer + OCR → one index with source/date metadata (L180).
- **Product manuals.** Tables and diagrams → vision extraction (L146) → table-preserving chunks (L178) → "what's the torque spec?" finds the table.
- **Research papers.** Multi-column layouts → layout-aware extraction (L177) → chunks by section — the reading-order bug is the classic failure here.
- **E-commerce invoices.** Structured docs → extraction with field mapping (L163) — the structured-generation lesson applied to parsing.

The through-line: **parsing is where documents fight back** — and the parse stage that classifies, preserves structure and verifies is the one that feeds retrieval well.

## 6. Interview Explanation

Say it in four moves:

1. **The classification.** "First I classify: born-digital (text layer), scanned (images), or hybrid — each needs a different extractor."
2. **The extraction.** "Text layer → direct extraction with layout awareness. Scanned → OCR, and for hard layouts a vision model (L146). Hybrid → both, merged by page."
3. **The structure.** "I preserve structure — headings, tables, lists, code — because chunking (L178) and retrieval (L189) depend on it. A table as a wall of text is a lost table."
4. **The verification.** "Parse quality is checked before indexing: character yield, page coverage, sanity check (L195). A parse stage that silently drops content is how retrieval goes wrong (L196)."

## 7. Senior-Level Insights

- **Classification before extraction (L177).** The senior parse pipeline asks "what kind of document is this?" before choosing the tool — a scanned PDF run through text extraction returns nothing, silently. The classifier is the first quality gate.
- **Vision models are the parse upgrade (L146).** For hard layouts, a vision model (L146) beats OCR — it reads the page as a whole, preserving structure. The trade is cost (L150) and latency: OCR for the bulk, vision for the hard 5%.
- **Structure is retrieval's grammar (L178).** Headings become chunk boundaries (L178), tables stay tables, code stays code. The parse stage decides the chunk grammar (L179) — and thus the retrieval quality (L195).
- **Layout order is the silent killer (L177).** Multi-column pages read out of order produce confident nonsense — the classic research-paper failure. Layout-aware extraction and page-coverage checks (L195) catch it.
- **Parse quality is a measured number (L195, L332).** Character yield, page coverage, and spot checks on a sample — the parse stage's output is observable (L332), not assumed, and its failures are logged and retried (L169).

## 8. Common Mistakes

- **`pdftotext` on everything.** A scanned PDF returns nothing (or garbage) — the classifier was skipped (L177).
- **No OCR on scans.** The "PDF" is images; the extraction returns empty strings — the missing-content failure (L196).
- **Structure flattened.** Tables as walls of text, headings lost (L178) — chunking (L178) and retrieval (L189) both degrade.
- **Reading order wrong.** Multi-column text in the wrong order — confident nonsense (L177).
- **No parse verification.** Garbage indexed silently (L195) — the index now contains what the parse stage dropped.
- **OCR for everything.** Slow and error-prone where a text layer exists (L150) — the classifier saves the cost.

## 9. Best Practices

- **Classify every document first** (L177) — text layer, scanned, hybrid — and route to the right extractor.
- **Preserve structure** (L178) — headings, tables, lists, code as blocks; tables as markdown tables.
- **Use vision models for hard layouts** (L146) — tables, forms, dense pages — and OCR for the bulk (L150).
- **Verify before indexing** (L195) — character yield, page coverage, sanity check.
- **Log and retry parse failures** (L169, L332) — a failed page is a retried page, not a silent gap.
- **Sample the output** (L195) — spot-check a few pages per batch; the pipeline is only as trustworthy as its parse.

## 10. Interview Questions

**Q: How do you extract text from PDFs?**
> A: Classify first (L177). Born-digital PDFs have a text layer — extract it with layout awareness, preserving structure. Scanned PDFs are images — OCR them, and for hard layouts (tables, forms) a vision model (L146). Hybrids get both, merged by page. Then verify: character yield, page coverage, sanity check (L195) — before any chunk reaches the index.

**Q: What about scanned documents?**
> A: They're images, not text — the PDF is a container. OCR reads them, but for complex layouts a vision model (L146) is the upgrade: it reads the page as a whole and preserves structure (tables stay tables). The trade is cost (L150) — OCR for the bulk, vision for the hard cases.

**Q: Why does structure matter for parsing?**
> A: Because the rest of the pipeline runs on it. Headings become chunk boundaries (L178), tables stay intact for retrieval (L189), code stays code. A parse that flattens structure produces chunks that can't be retrieved well — the structure decision at parse time is a retrieval-quality decision (L195).

**Q: How do you know parsing worked?**
> A: Verification before indexing (L195): character yield — how much text came out vs expected; page coverage — every page produced content; and a sanity check — the output is the document, not garbage. Failures are logged (L332) and retried (L169), never silently dropped. Retrieval can't exceed parse quality (L196).

## 11. Follow-Up Questions

- When is a vision model the right parse tool (L146)?
- How does structure preservation affect chunking (L178)?
- What does a parse-quality check look like (L195)?
- How do you handle multi-column layouts (L177)?
- How does parse cost scale with OCR vs vision (L150)?

## 12. Comparison Table — The Parse Classes

| | Born-digital | Scanned | Hybrid |
|---|---|---|---|
| What it is | text layer present | images only | mixed pages |
| Extractor | text-layer extraction | OCR / vision (L146) | both, merged by page |
| Speed | fast (L151) | slow (OCR) | slowest |
| Cost | cheapest (L150) | medium | highest |
| Structure | preserved from the file | recovered from pixels | merged |
| Failure mode | reading order (L177) | OCR garbage | merge misalignment |

The senior read: **the classifier routes each document to its column** — and the verify step (L195) catches the failures each column is prone to.

## 13. Code Example — The Parse Stage, Classified and Verified

```js
// Parse: classify → extract → preserve → verify (L177, L195).
async function parseDocument(pdf) {
  // 1 · CLASSIFY (L177) — what kind of document is this?
  const hasTextLayer = pdf.pages.some((p) => p.text && p.text.trim().length > 20);
  const isScanned = pdf.pages.every((p) => !p.text || p.text.trim().length === 0);

  let pages;
  if (hasTextLayer && !isScanned) {
    pages = extractTextLayer(pdf);            // born-digital — fast and cheap (L150)
  } else if (isScanned) {
    pages = await ocrPages(pdf);              // scanned — OCR (or vision for hard ones, L146)
  } else {
    pages = await mergeTextAndOcr(pdf);       // hybrid — text where it exists, OCR the rest
  }

  // 2 · PRESERVE STRUCTURE (L178) — headings, tables, code as blocks.
  const structured = pages.map((p) => toMarkdown(p));  // tables stay tables

  // 3 · VERIFY (L195) — don't index garbage.
  const yield = structured.join('').length / pdf.bytes;   // character yield
  if (yield < 0.1 || structured.length === 0) {
    log({ event: 'parse-failed', source: pdf.path, yield });  // L332
    throw new ParseError('low character yield');              // retried by the pipeline (L169)
  }
  log({ event: 'parsed', source: pdf.path, pages: pages.length, yield });
  return structured;
}
```

```text
What the reader must SEE — classify, preserve, verify:

  hasTextLayer / isScanned → the right extractor (L177)
  toMarkdown(p)           → structure kept for chunking (L178)
  yield check + throw     → garbage never reaches the index (L195, L169)

  Retrieval quality starts here.
```

```narrate
3-4: Classification — text layer or images decides the extractor (L177).
6-11: The three extraction paths — born-digital, scanned (OCR/vision, L146), hybrid merged by page.
13-15: Structure preservation — markdown keeps tables and headings intact for chunking (L178).
17-22: Verification — character yield, logged, and failed parses are thrown for the pipeline to retry (L195, L169, L332).
```

> [!TIP]
> The senior line is **`if (yield < 0.1) throw`** — the parse stage refuses to index garbage. A parse that can't fail loudly is a parse that fails silently (L196).

## 14. Performance Notes

- **Parse is the ingestion bottleneck (L176).** OCR and PDF rendering are slow — parallelize across documents, batch the workers (L222), and cache parses by content hash (L171).
- **Vision parsing is the expensive path (L146, L150).** Use it for the hard 5% — OCR handles the bulk at a fraction of the cost.
- **Layout-aware extraction costs CPU but saves quality (L177).** Reading-order bugs are free to produce and expensive to catch — the yield check (L195) is the cheap insurance.
- **Parse caching is the re-ingest lever (L171).** A content-hash key means unchanged docs skip parsing entirely — incrementality (L222) applied at the parse stage.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Document missing from answers | Parse dropped it silently (L177) | Check the ingestion logs (L332) |
| Garbled answers | OCR garbage indexed (L196) | Add the yield check (L195); re-parse |
| Table answers wrong | Tables flattened to text (L178) | Preserve tables at parse (L177) |
| Confident nonsense in papers | Multi-column reading order (L177) | Layout-aware extraction + page checks |
| Parse stage slow | Vision on everything (L146) | Classify; OCR the bulk (L150) |

## 16. Quick Revision Notes

- Parse = **classify → extract → preserve → verify** (L177).
- The classes: **born-digital** (text layer), **scanned** (OCR/vision, L146), **hybrid** (both, merged).
- Structure is the payload: **headings, tables, code** — chunk grammar (L178).
- **Retrieval can't exceed parse quality** (L195, L196) — verify before indexing.
- The checks: **character yield, page coverage, sanity** (L195).
- Cost: **text-layer cheapest, OCR medium, vision highest (L150)** — classify to route.

## 17. Cheat Sheet

```text
PDF PARSING = classify, extract, preserve, verify

THE CLASSES (L177)
  born-digital   text layer ✓ → extract directly, layout-aware
  scanned        images only → OCR (vision for hard layouts, L146)
  hybrid         both → text where it exists, OCR the rest, merge by page

THE STRUCTURE TO KEEP (L178)
  headings   → chunk boundaries
  tables     → markdown tables (a flattened table is a lost table)
  lists/code → blocks, not walls of text

THE VERIFY GATES (L195)
  character yield   text out vs expected
  page coverage     every page produced content
  sanity check      it's the document, not garbage
  failure           → log (L332), retry (L169), never index silently

THE COST ROUTING (L150)
  text layer → cheapest · OCR → medium · vision (L146) → highest
  classify first: vision only for the hard 5%

INTERVIEW, 4 MOVES
  1 classify "text layer, scanned, or hybrid?"
  2 extract  "the right tool per class (L146)"
  3 preserve "structure is retrieval's grammar (L178)"
  4 verify   "yield + coverage + sanity (L195) — garbage never indexes"
```

## 18. Key Takeaways

> [!RECAP]
> - Parsing is **classify → extract → preserve → verify** (L177): born-digital, scanned, or hybrid decides the extractor
> - **Structure is the payload** (L178) — headings, tables, and code survive parsing as themselves, because chunking and retrieval depend on them
> - **Vision models are the hard-layout upgrade** (L146) — tables and forms read as wholes, at a higher cost (L150); OCR handles the bulk
> - **Retrieval quality can never exceed parse quality** (L195, L196) — the verify gates (character yield, page coverage, sanity) run before indexing
> - Failed parses are **logged (L332) and retried (L169), never silently dropped** — the missing-chunk failure mode (L196) is born here
> - The parse stage decides the **chunk grammar (L178)** — and thus the whole retrieval story

## Check your understanding

Answer these without looking back.

1. What are the three document classes, and which extractor fits each?
2. Why does structure matter at parse time (L178)?
3. When is a vision model the right choice (L146)?
4. What are the three verify gates (L195)?
5. What happens when a parse fails — and what should never happen?
6. How does classification save cost (L150)?
7. What's the reading-order failure, and who's most prone (L177)?
8. Why can't retrieval exceed parse quality (L196)?

## A Closing Note — The Stage Where Documents Fight Back

You now hold the parse discipline: **classify every document, extract with the right tool, preserve the structure, and verify before it ever reaches the index.** It's the stage where content is won or silently lost — and where retrieval quality (L195) is decided before retrieval exists.

Next: the granularity decision — chunking fundamentals (L178), where text becomes retrieval-sized pieces.
