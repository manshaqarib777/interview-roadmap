# Lesson 146 — Multimodal Models

**Interview importance:** ⭐⭐⭐ — "can the model see images?" is now a product-shaping question; the senior answer is *how* vision/audio/PDF enter the token stream, and what that expands (and costs).

Lessons 135–145 built the text story: the model predicts the next token (L135), attends over context (L136), and streams the result (L145). This lesson expands the input side: **frontier models can now take images, audio, and PDFs as input — not as a separate "vision mode", but as part of the same context the model attends over.** That changes what you can build: screenshots, diagrams, voice, documents — all become prompt material.

The distinction this lesson is built on: a **user** knows "Claude can read images". A **solutions architect** knows how multimodal input *works* (non-text inputs are encoded into the same embedding space the model attends over), what it *costs* (images are token-denominated, and expensive), what it *can't* do (no native output for many modalities), and when to use it vs when to extract text first (OCR, PDF pipelines, L177).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain how multimodal input works: non-text inputs are encoded into tokens/embeddings the model attends to, not "looked at"
- Name the modalities: image, audio, video, PDF — and what each one costs in tokens
- Explain what multimodal is *not*: it's input to the same LLM, not a separate capability with its own brain
- Decide image-in-prompt vs extract-text-first for documents (L177)
- Budget multimodal requests: images are token-heavy, and the token math drives cost (L150)

## 1. One-Line Definition

**A multimodal model is an LLM that can take inputs beyond text — images, audio, video, PDFs — by encoding them into the same representation space it attends over, so a picture becomes part of the context the model reasons with, alongside text.**

The one-sentence interview answer: *"A multimodal model turns non-text inputs into tokens the model can attend to: an image is encoded into image tokens that sit in the same context as text. So 'what's in this screenshot?' is not a special vision mode — it's the same next-token predictor (L135) attending over image tokens plus text tokens, and generating the answer as text."*

## 2. Mental Model

Think of multimodal input as **translation into the model's native language — not opening a second brain.**

The model still predicts text. But its *context* (L138) can now contain image tokens, audio tokens, PDF tokens — alongside words. It's as if you pasted a picture into the conversation: the model can "see" it in the same way it can "read" the text around it — because the picture is now part of the sequence it attends over (L136).

```text
   The same model, one context, many input kinds:

   ┌────────────────────────────────────────────────┐
   │ CONTEXT (what the model attends over)          │
   │                                                │
   │  [text tokens]  "What's the error in this"     │
   │  [image tokens] 🖼  (the screenshot, encoded)   │
   │  [text tokens]  "screenshot?"                  │
   │                                                │
   │   → attention (L136) mixes ALL of them         │
   │   → the model generates a text answer          │
   └────────────────────────────────────────────────┘
```

The key mental shift: **an image is not "shown" to the model — it is *encoded into tokens* that enter the same context.** That single fact explains the costs (image tokens are pricey), the strengths (visual reasoning works), and the limits (the model's "vision" is the encoding's fidelity, not human eyes).

## 3. Visual Flow — An Image Becomes Part of the Prompt

```text
   User sends: a screenshot of a failed CI build + "why did this fail?"

   ┌────────────────────────────────────────────────────────┐
   │ 1 · the image is preprocessed → encoded into image     │
   │     tokens (a vision encoder turns pixels into vectors)│
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 2 · those tokens join the text tokens in ONE context:  │
   │     [vision tokens…] [text: "why did this fail?"]      │
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 3 · attention (L136) mixes image + text tokens         │
   │     → the model can "see" the red X and "read" the     │
   │       error line, together                            │
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 4 · output is TEXT: "The build failed at the lint      │
   │     step — the error is in eslint.config…"             │
   └────────────────────────────────────────────────────────┘
```

Two facts fall out of this picture:

1. **The output is still text.** Multimodal is (mostly) an *input* expansion — the model reads more, but it still speaks tokens. Native image/audio *output* is a separate (and newer) thing; today's multimodal is usually "anything in, text out".
2. **The vision is the encoding's fidelity.** If the image is small, blurry, or the encoder is weak, the model "sees" less than a human would. That's why high-res modes exist — and why they cost more tokens.

## 4. How It Works — The Token Math of Images and PDFs

- **Images → image tokens.** A vision encoder converts the image into a grid of patches, each patch becoming tokens the model attends to. Resolution is the cost driver: a low-res image may be ~85 tokens; a high-res image can be ~1,000+ tokens — and providers charge accordingly.
- **Audio → audio tokens (for input-capable models).** Speech, and in some cases the *meaning* of the audio, enters the context. Cost is per duration.
- **PDFs → this is where architects get it wrong.** Most "PDF support" is not the model reading the PDF directly — it's the *provider* extracting the text (often with its own OCR/parsing) and feeding that text into the same context. So a PDF is really a *text-extraction* feature with a wrapper, and the token cost is the text's cost (L137) — not a special "PDF token" magic.
- **Video → a sequence of frames**, each frame being image tokens; cost scales with frames × resolution, which is why video input is expensive and usually sampled rather than full-rate.

> [!NOTE]
> **The one number that matters for budgeting.** A single high-res image can cost more tokens than a full page of text (L137: ~1,500 tokens for a 500-word page; ~1,100+ for a high-res image). When an interviewer asks "why is multimodal expensive?", the answer is the token math: *images are token-heavy, and tokens are the cost unit (L150).*

## 5. Real Project Usage

- **Screenshot-based debugging.** "Here's my error — what's wrong?" The model reads the screenshot and the error text together. This is the killer multimodal demo and a genuinely useful support feature.
- **Document intelligence.** Invoices, receipts, forms: "extract the total and the vendor" (L143's structured output over a document image). For *scanned* documents this beats text extraction; for text-native PDFs, extract-first (L177) is usually cheaper and better.
- **Diagrams and charts.** "Explain this architecture diagram", "what does this dashboard say?" — visual reasoning over non-text content that pure text can't capture.
- **Voice assistants.** Audio in, text/action out — the input side of voice UIs (L151's latency pressure applies even harder).
- **Moderation and safety.** "Does this image violate policy?" — vision as a content-safety filter (L317, L325).
- **UI testing and accessibility.** "Describe this screen" — generating alt-text or spotting layout issues from a screenshot.

The through-line: **multimodal expands *what can be prompted*** — anything you can show becomes context. The architect's job is deciding *what deserves the expensive image tokens* vs what should be extracted to text first.

## 6. Interview Explanation

Say it in four moves:

1. **The mechanism.** "Multimodal means non-text inputs get encoded into tokens that join text in the same context — the model attends over image and text together, and outputs text."
2. **The expansion.** "So a screenshot, a diagram, an invoice, or audio become prompt material. It's an input expansion, not a second brain — same next-token predictor (L135), richer context (L138)."
3. **The cost.** "The token math is the real story: a high-res image can cost more tokens than a page of text. Images are token-heavy, and tokens are the cost unit (L150)."
4. **The decision.** "I use image-in-prompt when the *visual* content matters — screenshots, diagrams, scans. For text-native documents, I extract text first (L177) — cheaper and often more accurate. Multimodal is a tool with a price tag, not a default."

## 7. Senior-Level Insights

- **Multimodal is an input expansion, not a new capability class.** The model still predicts the next token; the win is that *more of the world* can enter the context. That framing keeps your mental model honest — the failure surface (L141) still applies, including to "what it saw".
- **The vision is as good as the encoding.** Image tokens are a lossy compression of the pixels. Small text in a screenshot, low contrast, or blur can be genuinely unreadable to the model — test at the resolution your users will send (this is a real eval axis, L343).
- **Extract-first is the senior default for documents.** Text-native PDFs should be extracted to text (L177) — cheaper, more accurate, searchable, and the text can be embedded (L147) for retrieval. Vision is for *scanned* docs and *visual* content, not for everything with a file extension.
- **Token budgeting gets harder.** A document pipeline that sends 10 high-res images per page is a *cost landmine* (L150). Budget the multimodal path like any token path: count the image tokens, cache what repeats, and retrieve rather than dump.

## 8. Common Mistakes

- **Sending high-res images when low-res suffices.** Vision cost scales with resolution; a 1,100-token image for a task that works at 85 is wasted money (L150).
- **Using vision for text-native PDFs.** Extract the text (L177) — cheaper, more accurate, and the text is usable for retrieval and search. Vision is for scans and visuals.
- **Assuming the model "saw" what you saw.** Small text, blur, low contrast — the encoding can lose it. Test with your real inputs.
- **Forgetting the output is still text.** "Can it generate an image?" is a different (and newer) capability; today's multimodal is mostly *anything in, text out*.
- **Ignoring the token budget.** "Just send the screenshot" × 1M requests is a cost incident. Budget image tokens like any token (L149, L150).

## 9. Best Practices

- **Choose resolution deliberately.** Low-res for "what's in this image", high-res only when fine detail matters (text, small UI elements).
- **Extract text from text-native documents** (L177); use vision for scans and visual content.
- **Test at your users' real quality.** Screenshots at 1440p, photos in bad light — the eval set (L343) should match reality, not the demo.
- **Budget the multimodal path.** Count image tokens in your cost model (L149); cache repeated images (L171); retrieve instead of dumping.
- **Keep structured outputs (L143) for extraction** — "extract {total, vendor, date} from this invoice image" is vision + schema, and it's the reliable version of the pattern.

## 10. Interview Questions

**Q: How does a model "see" an image?**
> A: It doesn't see it the way we do — the image is encoded into image tokens by a vision encoder, and those tokens join the text tokens in the same context. Attention (L136) then mixes image and text together, and the model generates a text answer. The "vision" is the fidelity of that encoding.

**Q: What does multimodal cost, compared to text?**
> A: It's token-denominated like everything else (L150), but images are token-heavy: a low-res image might be ~85 tokens, a high-res one 1,000+. A single high-res image can cost more than a full page of text. So the cost question is the token question.

**Q: When would you use an image vs extract the text first?**
> A: For *visual* content — screenshots, diagrams, scans — the image is the information, so vision is right. For text-native documents — a PDF that's text, not a scan — I extract the text first (L177): it's cheaper, more accurate, and the text is searchable and embeddable. The file extension doesn't decide; the *content* does.

**Q: Is multimodal output the same as multimodal input?**
> A: Not necessarily. Today's frontier multimodal is mostly *anything in, text out* — image, audio, PDF in, text answer out. Native image/audio *generation* is a separate, newer capability. So when I design, I treat multimodal as expanding the *input* surface, and text as the output contract (L143).

## 11. Follow-Up Questions

- How does image resolution affect token count and cost (L150)?
- What's the difference between "PDF support" and actual vision?
- How would you evaluate whether a model can read your users' screenshots (L343)?
- When is vision better than OCR for a scanned document?
- How does multimodal input interact with RAG (L174)?

## 12. Comparison Table — Modalities and Their Cost

| Modality | Enters context as | Cost driver | Best for |
|---|---|---|---|
| Text | tokens (L137) | length | everything |
| Image (low-res) | ~85 image tokens | count | "what's in this" |
| Image (high-res) | ~1,100+ tokens | resolution × count | fine detail, small text |
| Audio | audio tokens | duration | voice input |
| PDF (text-native) | extracted text (L177) | text length | documents (extract first) |
| PDF (scan) | vision tokens | pages × res | scans, handwritten |
| Video | frame image tokens | frames × res | temporal visual reasoning |

The senior read: **every row is a token cost** (L150). The modal decision is a budget decision: what does the information cost, and is there a cheaper way to get it into context?

## 13. Code Example — Vision in a Request

```js
// Multimodal in practice: an image joins the prompt, structured output comes back.
const res = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Extract the vendor, total, and due date from this invoice image.',
        },
        {
          type: 'image_url',
          image_url: { url: 'data:image/png;base64,…' },   // the image becomes tokens
        },
      ],
    },
  ],
  response_format: {                                       // L143 — the shape is a contract
    type: 'json_schema',
    json_schema: {
      name: 'invoice',
      schema: {
        type: 'object',
        properties: {
          vendor:  { type: 'string' },
          total:   { type: 'number' },
          dueDate: { type: 'string' },
        },
        required: ['vendor', 'total', 'dueDate'],
      },
    },
  },
});

const invoice = JSON.parse(res.choices[0].message.content);
console.log(invoice.vendor, invoice.total, invoice.dueDate);
// → "Acme Corp 1249.99 2026-09-01"  (typed, from the image)
```

```text
What the reader must SEE — image tokens + schema:

  content: [ {type:'text'}, {type:'image_url'} ]  → image joins the prompt
  response_format: schema                          → output is typed (L143)

  The image was encoded, attended over (L136), and the
  model generated the structured answer as text.
```

```narrate
5-12: The prompt is a list of parts — text and an image — both enter the context.
16-33: Structured output (L143) turns the visual extraction into a typed record.
35: The payoff: a parsed object, guaranteed shape, from a picture.
```

> [!TIP]
> This is the reliable multimodal pattern: **vision in, schema out.** The image brings the information; the schema (L143) makes the output a contract; the token budget (L150) decides whether the image was worth it.

## 14. Performance Notes

- **Image tokens are the cost and latency driver.** A high-res image adds ~1,100 tokens of input — more than a page of text. Multimodal requests are heavier per request than text-only ones (L150, L151).
- **Resolution is the lever.** Low-res for classification, high-res for fine detail. The right resolution halves the cost without hurting the task.
- **Vision preprocessing happens before the model** — encoding is fast, but the *tokens it produces* are what the model attends over (L136), so cost and latency follow the token count.
- **Extract-first is cheaper for text-native docs.** OCR/text extraction (L177) converts a 10-page PDF into ~15K text tokens instead of tens of thousands of image tokens — often 10× cheaper (L150).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The model misses text in the image | The encoding lost fine detail (small/low-res) | High-res mode; crop the region; test the real input (L343) |
| "Can't read this" on a scan | Vision vs text-native mismatch | Extract text first (L177) for text-native; use vision for true scans |
| Cost spike on a document feature | High-res images sent by default | Count image tokens (L149); low-res by default, high-res on demand |
| Structured output is empty fields | The image didn't contain what the schema demanded | Check the image actually shows it; tighten the prompt (L142) |
| Video input too slow/expensive | Full-rate frames | Sample frames; lower resolution (L151, L150) |

## 16. Quick Revision Notes

- Multimodal = **non-text inputs encoded into tokens, attended over with text** — same model, richer context (L136, L138).
- **Output is still text** — multimodal is mostly an *input* expansion today.
- **Images are token-heavy**: low-res ~85, high-res ~1,000+ tokens (L150).
- **PDFs ≠ vision**: text-native → extract first (L177); scans/visuals → vision.
- The decision rule: **is the information visual or textual?** Visual → image tokens; textual → extract to text.
- Budget the multimodal path like any token path — **count, cache, retrieve** (L149, L171).

## 17. Cheat Sheet

```text
MULTIMODAL = more input kinds, same model, same token stream

MECHANISM
  image → vision encoder → image tokens → join text in context
  attention (L136) mixes them → model generates TEXT

WHAT IT ISN'T
  not a second brain       same next-token predictor (L135)
  not "showing" the model  encoding into tokens
  not free                 image tokens are expensive

COST (tokens — the unit of everything, L137/L150)
  low-res image    ~85 tokens
  high-res image   ~1,100+ tokens
  text page        ~1,500 tokens  (an image can beat a page)
  video            frames × resolution

DECISION RULE
  visual content (screenshot, diagram, scan) → vision
  text-native document (text PDF)           → extract first (L177)
  fine detail (small text, UI)              → high-res, deliberately

DESIGN RULES
  low-res by default, high-res on demand
  structured output (L143) for extraction
  test with the user's real image quality (L343)
  budget the path: count, cache, retrieve (L149/L171)

INTERVIEW, 4 MOVES
  1 mechanism "encoded into tokens, attended with text"
  2 expansion "more of the world can be prompted"
  3 cost      "images are token-heavy (L150)"
  4 decision  "visual → vision, textual → extract"
```

## 18. Key Takeaways

> [!RECAP]
> - Multimodal means **non-text inputs are encoded into tokens that join text in the same context** — the same model, attending over more of the world (L136, L138)
> - **Output is still text** — today's multimodal is mostly an *input* expansion, "anything in, text out"
> - **Images are token-heavy**: a high-res image can cost more than a page of text — so multimodal is a budget decision (L150), not a default
> - **PDFs are not vision**: text-native documents should be extracted to text (L177); vision is for scans and visual content
> - The decision rule is **visual or textual?** — visual content earns image tokens; textual content earns extraction
> - The reliable pattern is **vision in, schema out** (L143): the image brings the information, the schema makes the output a contract

## Check your understanding

Answer these without looking back.

1. How does a model "see" an image — mechanically?
2. Why is the output of a multimodal request still text?
3. Roughly how many tokens does a high-res image cost, vs a text page?
4. When would you extract text from a PDF instead of sending the pages as images?
5. What does "the vision is the encoding's fidelity" mean?
6. Why is resolution a cost lever, and when would you use high-res?
7. How does structured output (L143) compose with vision?
8. What's the decision rule for image-in-prompt vs extract-first?

## A Closing Note — The World Can Now Be Prompted

You've now covered the full input/output surface of a frontier model: text in (L135–L138), sampling out (L139), capabilities and limits (L140–L141), prompting (L142), structured output (L143), tools (L144), streaming (L145), and now vision, audio, and documents (L146). What's left in this module is the *architect's* layer — the numbers and decisions: embeddings and vector semantics (L147), model selection (L148), token budgeting (L149), cost (L150), latency (L151), and the three providers (L152–L157).

Multimodal is the last "what can the model do" lesson — from here, the questions are "which model, at what cost, through which provider?" The foundations are complete; the decisions are next.
