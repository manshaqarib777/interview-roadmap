# Lesson 281 — Bedrock Guardrails

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you filter the model's output in production?" — the answer is *Bedrock Guardrails*: the content filters and the PII redaction as a managed layer (L281).**

L209 built the agent guardrails (L209) and L313 the PII discipline (L313); this lesson is **their AWS implementation**: Bedrock Guardrails — the managed safety layer: the content filters (the harmful categories, L281), the PII redaction (the sensitive data, L313), the topic policies (the off-limits topics, L281), and the word filters (the custom lists, L281). The AI platform's shape: the model calls (L278) and the agents (L279) run through the guardrails (L281) — the filters and the redaction as a managed layer (L281). This lesson is the L209 guardrails, AWS-shaped (L281).

The distinction this lesson is built on: a **demo** posts the raw output. A **solutions architect** runs the guardrails (L281): the content filters (L281), the PII redaction (L313), and the topic policies (L281) — because the production AI (L260) filters at the boundary (L281).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the content filters: the harmful categories (L281)
- Explain the PII redaction: the sensitive data (L313)
- Explain the topic policies: the off-limits topics (L281)
- Explain the word filters: the custom lists (L281)
- Explain the AI shape: the managed safety layer (L281)

## 1. One-Line Definition

**Bedrock Guardrails is the content filters and the PII redaction as a managed layer (L281) — the content filters (the harmful categories: the hate, the violence, the sexual, the insults — with the strength per category, L281), the PII redaction (the sensitive data: the names, the emails, the SSNs — redacted or blocked, L313), the topic policies (the off-limits topics: the denied topics with the denial messages, L281), and the word filters (the custom lists: the profanity and the banned terms, L281) — applied to the model calls (L278) and the agents (L279) — the L209 guardrails, AWS-shaped (L281).**

The one-sentence interview answer: *"Bedrock Guardrails is AWS's managed content-safety layer (L281). The components: the content filters (L281) — the harmful categories — the hate, the violence, the sexual, the insults, the misconduct — each with a strength (the low, the medium, the high) that the model's inputs and outputs are scored against (L281); the PII redaction (L313) — the sensitive data — the names, the emails, the SSNs, the card numbers — redacted (masked) or blocked entirely (L313); the topic policies (L281) — the off-limits topics, denied with the configured message (L281); and the word filters (L281) — the custom lists: the profanity and the banned terms (L281). The placement (L281): the guardrails attach to the model calls (L278) — the inputs filtered before the model (L281), the outputs filtered after (L281) — and to the agents (L279) (L281). The AI shape: the production AI (L260) runs the guardrails (L281) at the boundary (L281): the user's input checked (L281), the model's output checked (L281), and the PII (L313) redacted (L281) — the L209 guardrails (L209), AWS-shaped (L281)."*

## 2. Mental Model

Think of Bedrock Guardrails as **the embassy's security checkpoint.** The checkpoint (L281) screens everyone going in and out: the visitors (the model's inputs, L281) are checked for the banned items (the content filters, L281) — the weapons (the hate, the violence, L281) refused; the documents (the PII, L313) are stamped over (the redaction, L313) — the sensitive details hidden; the off-limits destinations (the topic policies, L281) are refused with the notice (the denial message, L281); and the watchlist (the word filters, L281) flags the custom terms (L281). The embassy (the agent, L279) only sees the cleared visitors, and the visitors only see the cleared answers (L281). The checkpoint works because the screening is layered, the stamping is automatic, and the notices are clear (L281).

```text
   the checkpoint (Bedrock Guardrails, L281)
   ┌────────────────────────────────────────────────────────┐
   │ the screening (the content filters, L281) — the harmful │
   │ categories, the strengths (L281)                        │
   │ the stamping (the PII redaction, L313) — the sensitive  │
   │ data masked or blocked (L313)                           │
   │ the destinations (the topic policies, L281) · the       │
   │ watchlist (the word filters, L281)                      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the checkpoint**: the screening, the stamping, the destinations, and the watchlist (L281).

## 3. Visual Flow — One Call Through the Guardrails

```text
   the user's input (L281)
        │
        ▼
   ┌────────────────────── THE INPUT FILTER (L281) ────────────────────┐
   │  the content filters (L281) · the topic policies (L281)          │
   │  the word filters (L281) · the PII (L313) checked                │
   │  the blocked input → the denial (L281)                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE MODEL (L278) ───────────────────────────┐
   │  the call runs (L278) · the stream (L251)                        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE OUTPUT FILTER (L281) ───────────────────┐
   │  the content filters (L281) · the PII redaction (L313)           │
   │  the word filters (L281)                                         │
   │  the filtered output → the redaction or the block (L281)         │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the guardrail's path: **input filter → model → output filter** (L281).

## 4. How It Works — The Layer, Part by Part

- **The content filters (L281).** The harmful categories (L281): the hate, the insults, the sexual, the violence, the misconduct (L281) — each with the strength (L281): the low, the medium, the high (L281). The inputs and the outputs are scored (L281); the threshold (L281) decides the block (L281).
- **The PII redaction (L313).** The sensitive data (L313): the names, the emails, the SSNs, the card numbers (L313) — redacted (masked) or blocked (L313) in the inputs and the outputs (L281).
- **The topic policies (L281).** The off-limits topics (L281): the denied topics with the denial messages (L281) — the model is steered away (L281).
- **The word filters (L281).** The custom lists (L281): the profanity and the banned terms (L281) — filtered with the match types (L281).
- **The placement (L281).** The guardrails attach to the model calls (L278) and the agents (L279) (L281): the inputs filtered before the model (L281), the outputs filtered after (L281).

> [!NOTE]
> **The guardrails are the boundary, not the alignment (L281).** The senior answer is clear (L281): the guardrails (L281) are the runtime filters (L281) — the deterministic checks at the boundary (L281) — not the model's alignment (L281). The model's training (L148) is the first layer (L281); the guardrails (L281) are the second (L281): the checked inputs (L281), the checked outputs (L281), and the redacted PII (L313) — the L209 guardrails (L209), AWS-shaped (L281).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The model calls (L278) through the guardrails (L281) — the inputs checked, the outputs checked, the PII (L313) redacted.
- **An agent product (L279).** The Bedrock agent (L279) with the guardrails attached (L281) — the loop's inputs and outputs filtered (L281).
- **A regulated workload (L371).** The PII redaction (L313) — the compliance (L371) path (L371) through the managed layer (L281).
- **A customer-facing copilot (L350).** The word filters (L281) and the topic policies (L281) — the brand's voice (L281) bounded (L281).
- **Anything AI on AWS (L281).** The managed safety layer (L281) — the filters at the boundary (L281).

The through-line: **the guardrails are the boundary's filters** — the inputs checked, the outputs checked, the PII redacted (L281).

## 6. Interview Explanation

Say it in four moves:

1. **The content filters.** "The harmful categories — the hate, the violence, the sexual — with the strengths (L281)."
2. **The PII redaction.** "The sensitive data — masked or blocked (L313)."
3. **The topics and the words.** "The denied topics (L281) and the custom lists (L281)."
4. **The placement.** "The inputs filtered before the model (L278), the outputs after (L281)."

## 7. Senior-Level Insights

- **The guardrails are the boundary, not the alignment (L281).** The runtime filters (L281) — the deterministic checks (L281) — the model's alignment (L148) is the first layer, the guardrails (L281) the second (L281).
- **The strengths are the product's tolerance (L281).** The content filter strengths (L281) — the product's risk tolerance (L281) is the configuration's (L281).
- **The PII redaction is the compliance's path (L313).** The redacted data (L313) — the L313 discipline (L313) and the L371 compliance (L371), AWS-shaped (L281).
- **The placement is the defense in depth (L325).** The guardrails (L281) at the model's boundary (L281) — the L325 layers (L325): the input filter, the model, the output filter (L281).
- **The evaluation is the filters' calibration (L341).** The blocked and the passed outputs (L281) — the L341 eval (L341) calibrates the strengths (L281).

## 8. Common Mistakes

- **The alignment replaced (L281).** The guardrails (L281) as the only layer (L281) — the model's choice (L148) still matters (L281).
- **The strengths defaulted (L281).** The low strength everywhere (L281) — the harmful content (L309) through (L281).
- **The PII unredacted (L313).** The output with the emails (L313) — the L313 discipline (L313) skipped (L281).
- **The filters unplaced (L281).** The guardrails not attached (L281) — the raw calls (L278) ungoverned (L281).
- **The false positives unmanaged (L281).** The over-blocking (L281) — the product's UX (L162) hurt (L281); the eval (L341) calibrates (L281).

## 9. Best Practices

- **Filter both sides** (L281) — the inputs before the model (L278), the outputs after (L281).
- **Set the strengths by the risk** (L281) — the product's tolerance (L281).
- **Redact the PII** (L313) — the names, the emails, the SSNs (L313).
- **Deny the off-limits topics** (L281) — with the clear messages (L281).
- **Calibrate with the eval** (L341) — the false positives and the false negatives (L341).

## 10. Interview Questions

**Q: Walk me through Bedrock Guardrails.**
> A: The managed safety layer (L281). The content filters — the harmful categories with the strengths (L281). The PII redaction — the sensitive data masked or blocked (L313). The topic policies — the denied topics (L281). And the word filters — the custom lists (L281).

**Q: Where do the guardrails sit?**
> A: At the model's boundary (L281): the inputs are filtered before the model (L278) — the blocked input gets the denial (L281); the outputs are filtered after (L281) — the redaction or the block (L281). The same guardrails attach to the agents (L279) (L281).

**Q: How do you handle the PII?**
> A: With the redaction policies (L313): the sensitive entities — the names, the emails, the SSNs, the card numbers (L313) — are redacted (masked) in the output, or blocked entirely (L313) — the L313 discipline (L313), AWS-shaped (L281).

**Q: What's the difference between the guardrails and the model's safety training?**
> A: The layer (L281). The model's training (L148) is the alignment — the model's tendency (L281). The guardrails (L281) are the runtime filters — the deterministic checks at the boundary (L281): the content filters, the topics, the words, the PII (L313). The production AI (L260) uses both (L281): the aligned model (L148) behind the checked boundary (L281).

## 11. Follow-Up Questions

- What are the content filters (L281)?
- What's the PII redaction (L313)?
- What are the topic policies (L281)?
- Where do the guardrails sit (L281)?
- How do you calibrate them (L341)?

## 12. Comparison Table — The Guardrail's Components

| Component (L281) | What it does (L281) | The AI use (L281) |
|---|---|---|
| Content filters (L281) | the harmful categories, the strengths (L281) | the inputs and the outputs scored (L281) |
| PII redaction (L313) | the sensitive data masked or blocked (L313) | the emails, the SSNs, the cards (L313) |
| Topic policies (L281) | the denied topics (L281) | the off-limits domains refused (L281) |
| Word filters (L281) | the custom lists (L281) | the profanity, the brand terms (L281) |

The senior read: **the components compose the boundary** — the screening, the stamping, the destinations, and the watchlist (L281).

## 13. Code Example — The Guardrails, Configured

```js
// The managed safety layer (L281) — the guardrails, configured (L281).
const guardrails = {
  // THE CONTENT FILTERS (L281) — the categories, the strengths (L281).
  contentPolicy: {
    filters: [
      { type: 'HATE',       strength: 'HIGH' },   // the strict (L281)
      { type: 'INSULTS',    strength: 'MEDIUM' },
      { type: 'SEXUAL',     strength: 'HIGH' },
      { type: 'VIOLENCE',   strength: 'HIGH' },
      { type: 'MISCONDUCT', strength: 'MEDIUM' },
    ],
  },

  // THE PII REDACTION (L313) — the sensitive data (L313).
  piiPolicy: {
    redaction: {
      types: ['NAME', 'EMAIL', 'SSN', 'CREDIT_DEBIT_NUMBER'],  // L313
      action: 'REDACT',                        // the mask (L313)
    },
  },

  // THE TOPIC POLICIES (L281) — the denied topics (L281).
  topicPolicy: {
    topics: [{ name: 'medical-advice', definition: '...', action: 'BLOCK' }],
  },

  // THE WORD FILTERS (L281) — the custom lists (L281).
  wordPolicy: { words: [{ text: 'banned-term', action: 'BLOCK' }] },
};

// THE PLACEMENT (L281) — the inputs before the model (L278),
// the outputs after (L281): the calls and the agents guarded (L279).
```

```text
What the reader must SEE — the layer, configured:

  HATE: HIGH, VIOLENCE: HIGH  → the strengths (L281)
  piiPolicy: NAME, EMAIL, SSN → the redaction (L313)
  topicPolicy: medical-advice → the denied topic (L281)
  wordPolicy: banned-term     → the custom list (L281)

  The boundary: the inputs checked, the outputs checked (L281).
```

```narrate
3-10: The content filters — the harmful categories with their strengths (L281).
12-18: The PII policy — the sensitive entities redacted (L313).
20-22: The topic policy — the denied topic blocked (L281).
24-26: The word policy — the custom terms blocked (L281).
28-29: The placement — the inputs before the model, the outputs after (L278, L281).
```

> [!TIP]
> The pair that defines the guardrails: **the content strengths** (the risk tolerance, L281) and **the PII redaction** (the sensitive data, L313). **Set the strengths by the risk, redact the PII, filter both sides — the L209 guardrails, AWS-shaped (L281).**

## 14. Performance Notes

- **The filter is the latency's addition (L281).** The checks (L281) add to the call's latency (L333) — the guardrails (L281) are tuned to the milliseconds (L281).
- **The redaction is the compliance's cost (L285).** The PII scanning (L313) — the processing (L285) is the bill's line (L281).
- **The stream is the filtering's shape (L251).** The streamed output (L251) filtered (L281) — the TTFT (L145) preserved (L281).
- **The strengths are the UX's balance (L281).** The over-blocking (L281) hurts the product (L162); the calibration (L341) is the balance (L281).

## 15. Debugging Scenarios

| Symptom | First check (L281) | The lever |
|---|---|---|
| The harmful content passes | The strengths (L281) | The HIGH strength (L281) |
| The PII leaks | The redaction (L313) | The PII policy (L313) |
| The valid input blocked | The topic policy (L281) | The denied topic's definition (L281) |
| The UX is hurt | The false positives (L281) | The calibration with the eval (L341) |
| The raw calls are ungoverned | The placement (L281) | The guardrails attached (L278, L279) |

## 16. Quick Revision Notes

- Bedrock Guardrails = **the managed safety layer** (L281): the content filters, the PII redaction, the topics, the words.
- The content filters: **the harmful categories with the strengths (L281)**.
- The PII redaction: **the sensitive data masked or blocked (L313)**.
- The topics: **the denied topics with the messages (L281)**.
- The placement: **the inputs before the model (L278), the outputs after (L281)**.

## 17. Cheat Sheet

```text
BEDROCK GUARDRAILS = the content filters + the PII redaction,
a managed layer

THE CONTENT FILTERS (L281)
  the categories: hate · insults · sexual · violence · misconduct (L281)
  the strengths: low · medium · high (L281)
  the inputs and the outputs scored (L281)

THE PII REDACTION (L313)
  the entities: name · email · SSN · card (L313)
  the action: redact (mask) or block (L313)

THE TOPIC POLICIES (L281)
  the denied topics with the denial messages (L281)

THE WORD FILTERS (L281)
  the custom lists — the profanity, the banned terms (L281)

THE PLACEMENT (L281)
  the inputs filtered before the model (L278)
  the outputs filtered after (L281)
  the agents (L279) guarded the same (L281)

THE BOUNDARY (L281)
  the runtime filters (L281), not the alignment (L148)
  the L209 guardrails (L209), AWS-shaped (L281)

INTERVIEW, 4 MOVES
  1 content  "the harmful categories, the strengths (L281)"
  2 PII      "the sensitive data masked or blocked (L313)"
  3 topics   "the denied topics (L281)"
  4 placement "the inputs before, the outputs after (L281)"
```

## 18. Key Takeaways

> [!RECAP]
> - Bedrock Guardrails is **the content filters and the PII redaction as a managed layer** (L281): the content filters (L281), the PII redaction (L313), the topic policies (L281), and the word filters (L281)
> - **The content filters** (L281) are the harmful categories — the hate, the insults, the sexual, the violence, the misconduct — with the strengths (L281) scored against the inputs and the outputs (L281)
> - **The PII redaction** (L313) is the sensitive data — the names, the emails, the SSNs, the cards — redacted or blocked (L313)
> - **The topic policies** (L281) deny the off-limits topics; **the word filters** (L281) flag the custom lists (L281)
> - **The placement** (L281): the inputs filtered before the model (L278) and the outputs filtered after (L281) — for the calls (L278) and the agents (L279)
> - The guardrails are **the boundary, not the alignment** (L281): the runtime filters (L281) behind the aligned model (L148) — the L209 guardrails (L209), AWS-shaped (L281)

## Check your understanding

Answer these without looking back.

1. What are the content filters (L281)?
2. What's the PII redaction (L313)?
3. What are the topic policies (L281)?
4. Where do the guardrails sit (L281)?
5. How do you calibrate them (L341)?
6. What's the boundary vs the alignment (L281)?
7. How do the agents get guarded (L279)?
8. What is the L209 guardrails, AWS-shaped (L281)?

## A Closing Note — The Checkpoint, Manned

You now hold the managed safety layer: **the content filters, the PII redaction, the topics, and the words — with the inputs checked and the outputs checked.** The AWS stack has its boundary — and the checkpoint screens both ways (L281).

Next: the repeatable shapes — AWS AI Architecture Patterns (L282).
