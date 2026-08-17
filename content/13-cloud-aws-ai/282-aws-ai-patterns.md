# Lesson 282 — AWS AI Architecture Patterns

**Interview importance:** ⭐⭐⭐⭐⭐ — "what are the repeatable AI shapes on AWS?" — the answer is *the patterns*: the streaming chat, the RAG, the batch inference — the L173 floor plan, AWS-shaped (L282).**

L173 built the AI app floor plan (L173) and L260 the backend shape (L260); this lesson is **the repeatable AWS implementations**: the AWS AI architecture patterns — the streaming chat (the chat endpoint, L282), the RAG (the knowledge pipeline, L280), the batch inference (the queue and the workers, L282), and the agent (the tool loop, L279). The AI platform's shape: every AI product (L173) maps to a pattern (L282) — the chat, the RAG, the batch, the agent (L282). This lesson is the L173 floor plan, AWS-shaped (L282).

The distinction this lesson is built on: a **demo** invents a shape. A **solutions architect** recognizes the pattern (L282): the streaming chat (L282), the RAG (L280), the batch inference (L282), and the agent (L279) — the repeatable shapes (L282).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the streaming chat pattern (L282)
- Explain the RAG pattern (L280)
- Explain the batch inference pattern (L282)
- Explain the agent pattern (L279)
- Explain the pattern selection: the product to the shape (L282)

## 1. One-Line Definition

**The AWS AI architecture patterns are the repeatable shapes: the streaming chat, the RAG, the batch inference, and the agent (L282) — the streaming chat (the API Gateway L267 → the Lambda L266 → the Bedrock L278, streamed back L251), the RAG (the S3 L265 → the Knowledge Bases L280 → the retrieval L189, grounded L280), the batch inference (the SQS L270 → the workers L266 → the results L265, the DLQ L232), and the agent (the Bedrock Agents L279 with the action groups L279 and the guardrails L281) — the L173 floor plan, AWS-shaped (L282).**

The one-sentence interview answer: *"The AI architectures on AWS are four repeatable patterns (L282). The streaming chat (L282): the API Gateway (L267) receives the request, the Lambda (L266) or the ECS (L271) calls the Bedrock (L278), and the response streams back (L251) — the L173 chat floor plan (L162), AWS-shaped (L282). The RAG (L280): the documents in the S3 (L265) sync into the Knowledge Bases (L280), the app retrieves (L189) and grounds the answer (L280) — the L197 RAG (L197), AWS-shaped (L282). The batch inference (L282): the jobs enqueued on the SQS (L270), the workers (L266, L271) process them with the Bedrock (L278), and the results land in the S3 (L265) with the DLQ (L232) catching the poison (L282). The agent (L279): the Bedrock agent (L279) with the action groups (L279), the knowledge bases (L280), and the guardrails (L281) — the L216 agent (L216), AWS-shaped (L282). The pattern selection (L282): the interactive → the chat (L282); the knowledge → the RAG (L280); the heavy and the async → the batch (L282); the tools → the agent (L279). The L173 floor plan, AWS-shaped (L282)."*

## 2. Mental Model

Think of the patterns as **the restaurant's set menus.** The restaurant (the AWS stack, L282) has four set menus (the patterns, L282): the à-la-carte counter (the streaming chat, L282) — you order, and the dish arrives as it's cooked (the stream, L251); the reference library (the RAG, L280) — the waiter checks the books (the retrieval, L189) before answering (L280); the takeout kitchen (the batch, L282) — the orders pile up (the queue, L270), the kitchen cooks them in turn (the workers, L266), and the bags go out (the results, L265); and the private dining with the concierge (the agent, L279) — the concierge handles the whole meal (the loop, L200). The menu's choice (L282) is the customer's need (L282): the quick dish (the chat), the researched answer (the RAG), the bulk order (the batch), or the full service (the agent) (L282).

```text
   the set menus (the patterns, L282)
   ┌────────────────────────────────────────────────────────┐
   │ the counter (the chat, L282) — streamed (L251)         │
   │ the library (the RAG, L280) — grounded (L280)          │
   │ the takeout (the batch, L282) — queued (L270)          │
   │ the concierge (the agent, L279) — the loop (L200)      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the set menus**: the counter, the library, the takeout, and the concierge (L282).

## 3. Visual Flow — The Four Patterns

```text
   THE STREAMING CHAT (L282)          THE RAG (L280)
   user → API Gateway (L267)          document → S3 (L265) → sync (L280)
       → Lambda (L266)                → Knowledge Bases (L280)
       → Bedrock (L278)               → retrieve (L189) → ground (L280)
       → stream (L251)                → answer (L280)

   THE BATCH (L282)                   THE AGENT (L279)
   job → SQS (L270)                   user → Bedrock Agents (L279)
       → workers (L266, L271)             → the loop (L200)
       → Bedrock (L278)                   → action groups (L279)
       → results in S3 (L265)             → knowledge (L280)
       → the DLQ (L232)                   → guardrails (L281)
```

The flow is the four shapes: **chat, RAG, batch, agent** (L282).

## 4. How It Works — The Shapes, Part by Part

- **The streaming chat (L282).** The interactive pattern (L282): the API Gateway (L267) → the Lambda (L266) or the ECS (L271) → the Bedrock (L278), streamed back (L251). The cache (L171) and the sessions (L237) ride along (L282).
- **The RAG (L280).** The knowledge pattern (L280): the documents in the S3 (L265) → the Knowledge Bases (L280) → the retrieval (L189) → the grounded answer (L280). The citations (L192) and the metadata (L180) ride along (L282).
- **The batch inference (L282).** The async pattern (L282): the jobs on the SQS (L270) → the workers (L266, L271) → the Bedrock (L278) → the results in the S3 (L265). The DLQ (L232) and the idempotency (L255) ride along (L282).
- **The agent (L279).** The tool pattern (L279): the Bedrock agent (L279) with the action groups (L279), the knowledge bases (L280), and the guardrails (L281) — the loop (L200) managed (L282).
- **The pattern selection (L282).** The product to the shape (L282): the interactive → the chat (L282); the knowledge → the RAG (L280); the heavy and the async → the batch (L282); the tools → the agent (L279).

> [!NOTE]
> **The patterns compose (L282).** The senior answer doesn't pick one pattern (L282) — it composes them (L282): the chat (L282) with the RAG (L280) for the grounded answers (L280); the agent (L279) with the batch (L282) for the long tool calls (L279); the RAG (L280) feeding the batch (L282) for the nightly indexing (L221). The L173 floor plan (L173) is the four shapes, composed (L282).

## 5. Real Project Usage

- **A chat product (L162).** The streaming chat (L282): the API Gateway (L267), the Lambda (L266), the Bedrock (L278), the stream (L251).
- **A support copilot (L350).** The chat (L282) + the RAG (L280): the grounded answers (L280) with the citations (L192).
- **A document processor (L353).** The batch (L282): the SQS (L270), the workers (L266), the results (L265) — the L353 doc processing (L353), AWS-shaped (L282).
- **An operations agent (L279).** The agent (L279): the action groups (L279), the knowledge (L280), the guardrails (L281).
- **Anything AI on AWS (L282).** The product maps to a pattern (L282) — or a composition (L282).

The through-line: **the patterns are the floor plan's AWS shapes** — the chat, the RAG, the batch, and the agent (L282).

## 6. Interview Explanation

Say it in four moves:

1. **The chat.** "The API Gateway (L267) → the Lambda (L266) → the Bedrock (L278), streamed (L251)."
2. **The RAG.** "The S3 (L265) → the Knowledge Bases (L280) → the retrieval (L189), grounded (L280)."
3. **The batch.** "The SQS (L270) → the workers (L266) → the results (L265), the DLQ (L232)."
4. **The agent.** "The Bedrock agent (L279) with the tools (L279) and the guardrails (L281)."

## 7. Senior-Level Insights

- **The pattern is the product's match (L282).** The senior answer maps the product (L173) to the pattern (L282): the interactive → the chat (L282); the knowledge → the RAG (L280); the heavy → the batch (L282); the tools → the agent (L279).
- **The patterns compose (L282).** The chat + the RAG (L280), the agent + the batch (L282) — the floor plan (L173) is the composition (L282).
- **The governance rides along (L282).** Every pattern (L282) carries the L172 baseline (L172): the auth (L237) at the gateway (L267), the guardrails (L281) at the model (L278), the queues (L270) and the DLQ (L232) in the batch (L282).
- **The cost is the pattern's (L285).** The chat's tokens (L332), the RAG's storage (L183), the batch's workers (L266) — the L285 bill (L285) is the pattern's (L282).
- **The observability is the pattern's trace (L274).** The chat's stream (L251), the RAG's retrieval (L189), the batch's jobs (L270) — traced (L274) per pattern (L282).

## 8. Common Mistakes

- **The pattern forced (L282).** The batch for the interactive (L282) — the user waits (L151); the chat for the heavy (L282) — the timeout (L266) hits (L282).
- **The RAG skipped (L280).** The chat answering from the training (L282) — the grounding (L280) lost (L282).
- **The batch without the queue (L282).** The synchronous heavy work (L282) — the L222 engine room (L222) skipped (L282).
- **The agent without the guardrails (L281).** The unguarded loop (L279) — the L209 boundary (L209) lost (L282).
- **The pattern uncomposed (L282).** The one-size shape (L282) — the floor plan (L173) is the composition (L282).

## 9. Best Practices

- **Map the product to the pattern** (L282) — the chat, the RAG, the batch, the agent (L282).
- **Compose the patterns** (L282) — the chat + the RAG (L280), the agent + the batch (L282).
- **Carry the governance** (L282) — the auth (L237), the guardrails (L281), the DLQ (L232).
- **Cost the pattern** (L285) — the tokens (L332), the storage (L183), the workers (L266).
- **Trace the pattern** (L274) — the per-pattern observability (L282).

## 10. Interview Questions

**Q: What are the AWS AI architecture patterns?**
> A: Four repeatable shapes (L282). The streaming chat — the API Gateway (L267), the Lambda (L266), the Bedrock (L278), streamed (L251). The RAG — the S3 (L265), the Knowledge Bases (L280), the retrieval (L189). The batch inference — the SQS (L270), the workers (L266), the results (L265), the DLQ (L232). And the agent — the Bedrock agent (L279) with the tools (L279) and the guardrails (L281).

**Q: How do you pick the pattern?**
> A: By the product's shape (L282): the interactive → the chat (L282); the knowledge-bound → the RAG (L280); the heavy and the async → the batch (L282); the tool-using → the agent (L279). And the patterns compose (L282): the chat with the RAG (L280), the agent with the batch (L282).

**Q: How do you compose the chat and the RAG?**
> A: The chat's Lambda (L266) queries the Knowledge Bases (L280) before the model call (L278): the retrieval (L189) returns the chunks (L280), the model (L278) grounds the answer (L280), and the stream (L251) delivers it with the citations (L192) — the L197 RAG (L197), chat-shaped (L282).

**Q: What carries across all the patterns?**
> A: The L172 baseline (L172): the auth (L237) at the gateway (L267), the guardrails (L281) at the model (L278), the queues (L270) and the DLQ (L232) in the async (L282), and the trace (L274) across the whole (L282).

## 11. Follow-Up Questions

- What's the streaming chat pattern (L282)?
- What's the RAG pattern (L280)?
- What's the batch inference pattern (L282)?
- What's the agent pattern (L279)?
- How do you pick the pattern (L282)?

## 12. Comparison Table — The Four Patterns

| Pattern (L282) | The shape (L282) | The use (L282) |
|---|---|---|
| The streaming chat (L282) | the gateway (L267) → the Lambda (L266) → the Bedrock (L278) → the stream (L251) | the interactive (L162) |
| The RAG (L280) | the S3 (L265) → the Knowledge Bases (L280) → the retrieval (L189) | the knowledge (L197) |
| The batch (L282) | the SQS (L270) → the workers (L266) → the results (L265) | the heavy and the async (L222) |
| The agent (L279) | the Bedrock agent (L279) + the tools (L279) + the guardrails (L281) | the tool loops (L216) |

The senior read: **the table is the selection** — the product to the shape, and the shapes composed (L282).

## 13. Code Example — The Patterns, Selected

```js
// The patterns (L282) — the product to the shape (L282).
function patternFor(product) {
  switch (product.kind) {
    // THE STREAMING CHAT (L282) — the interactive (L162).
    case 'chat':
      return {
        apiGateway: chatRoute,            // the front door (L267)
        compute: [chatLambda],            // the handler (L266)
        model: 'bedrock',                 // the model (L278)
        stream: true,                     // the stream (L251)
        cache: responseCache,             // the L171 cache (L171)
      };

    // THE RAG (L280) — the knowledge (L197).
    case 'rag':
      return {
        source: 's3://docs',              // the documents (L265)
        kb: knowledgeBase,                // the managed RAG (L280)
        retrieval: { topK: 5, filters },  // the L189 retrieval (L189)
      };

    // THE BATCH (L282) — the heavy and the async (L222).
    case 'batch':
      return {
        queue: 'inference-jobs',          // the SQS (L270)
        workers: [workerLambda],          // the workers (L266)
        results: 's3://results',          // the results (L265)
        dlq: 'inference-jobs-dlq',        // the poison (L232)
      };

    // THE AGENT (L279) — the tools (L216).
    case 'agent':
      return {
        agent: bedrockAgent,              // the managed loop (L279)
        actions: [actionGroups],          // the tools (L279)
        guardrails: bedrockGuardrails,    // the boundary (L281)
      };
  }
}
```

```text
What the reader must SEE — the selection, declared:

  chat  → gateway + Lambda + Bedrock + stream (L267, L266, L278, L251)
  rag   → S3 + Knowledge Bases + retrieval (L265, L280, L189)
  batch → SQS + workers + results + DLQ (L270, L266, L265, L232)
  agent → Bedrock agent + actions + guardrails (L279, L281)

  The product to the shape — and the shapes composed (L282).
```

```narrate
4-13: The chat — the gateway, the Lambda, the model, the stream, and the cache (L267, L266, L278, L251).
15-20: The RAG — the S3 source, the knowledge base, and the retrieval (L265, L280, L189).
22-28: The batch — the queue, the workers, the results, and the DLQ (L270, L266, L232).
30-35: The agent — the managed loop, the actions, and the guardrails (L279, L281).
```

> [!TIP]
> The pair that defines the patterns: **the product's kind** (the selection, L282) and **the pattern's shape** (the composition, L282). **Map the product to the shape, compose the shapes, carry the governance — the L173 floor plan, AWS-shaped (L282).**

## 14. Performance Notes

- **The chat is the TTFT (L145).** The stream (L251) — the first token (L145) is the UX (L162).
- **The RAG is the retrieval's latency (L189).** The top-k (L189) and the index (L183) — the grounding (L280) within the budget (L151).
- **The batch is the throughput (L222).** The workers (L266) on the queue (L270) — the throughput (L333) is the concurrency's (L266).
- **The agent is the loop's cost (L285).** The iterations (L205) — the tokens (L332) per loop (L279).

## 15. Debugging Scenarios

| Symptom | First check (L282) | The lever |
|---|---|---|
| The chat is slow | The stream (L251) | The TTFT (L145) |
| The answers are ungrounded | The RAG (L280) | The Knowledge Bases (L280) |
| The heavy work blocks the request | The batch (L282) | The SQS (L270) |
| The agent misbehaves | The guardrails (L281) | The Bedrock Guardrails (L281) |
| The bill surprises | The pattern's cost (L285) | The tokens (L332), the workers (L266) |

## 16. Quick Revision Notes

- The AWS AI patterns = **the repeatable shapes** (L282): the chat, the RAG, the batch, the agent.
- The chat: **the gateway (L267) → the Lambda (L266) → the Bedrock (L278) → the stream (L251)**.
- The RAG: **the S3 (L265) → the Knowledge Bases (L280) → the retrieval (L189)**.
- The batch: **the SQS (L270) → the workers (L266) → the results (L265) + the DLQ (L232)**.
- The agent: **the Bedrock agent (L279) + the tools (L279) + the guardrails (L281)**.

## 17. Cheat Sheet

```text
AWS AI ARCHITECTURE PATTERNS = the repeatable shapes

THE STREAMING CHAT (L282)
  the API Gateway (L267) → the Lambda (L266) / the ECS (L271)
  → the Bedrock (L278) → the stream (L251)
  the cache (L171) + the sessions (L237)

THE RAG (L280)
  the S3 (L265) → the Knowledge Bases (L280)
  → the retrieval (L189) → the grounded answer (L280)
  the citations (L192) + the metadata (L180)

THE BATCH (L282)
  the SQS (L270) → the workers (L266, L271)
  → the Bedrock (L278) → the results in the S3 (L265)
  the DLQ (L232) + the idempotency (L255)

THE AGENT (L279)
  the Bedrock agent (L279) + the action groups (L279)
  + the knowledge bases (L280) + the guardrails (L281)

THE SELECTION (L282)
  the interactive → the chat · the knowledge → the RAG (L280)
  the heavy → the batch · the tools → the agent (L279)
  the patterns compose (L282) · the governance carries (L172)

INTERVIEW, 4 MOVES
  1 chat   "gateway → Lambda → Bedrock → stream (L282)"
  2 RAG    "S3 → Knowledge Bases → retrieval (L280)"
  3 batch  "SQS → workers → results + DLQ (L282)"
  4 agent  "Bedrock agent + tools + guardrails (L279, L281)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AWS AI architecture patterns are **the repeatable shapes** (L282): the streaming chat (L282), the RAG (L280), the batch inference (L282), and the agent (L279)
> - **The streaming chat** (L282): the API Gateway (L267) → the Lambda (L266) → the Bedrock (L278), streamed back (L251)
> - **The RAG** (L280): the S3 (L265) → the Knowledge Bases (L280) → the retrieval (L189) → the grounded answer (L280)
> - **The batch inference** (L282): the SQS (L270) → the workers (L266) → the results in the S3 (L265), with the DLQ (L232) and the idempotency (L255)
> - **The agent** (L279): the Bedrock agent (L279) with the action groups (L279), the knowledge bases (L280), and the guardrails (L281)
> - The selection (L282): the interactive → the chat, the knowledge → the RAG (L280), the heavy → the batch (L282), the tools → the agent (L279) — and the patterns compose (L282), carrying the L172 governance (L172) throughout (L282)

## Check your understanding

Answer these without looking back.

1. What's the streaming chat pattern (L282)?
2. What's the RAG pattern (L280)?
3. What's the batch inference pattern (L282)?
4. What's the agent pattern (L279)?
5. How do you pick the pattern (L282)?
6. How do the patterns compose (L282)?
7. What carries across the patterns (L172)?
8. What is the L173 floor plan, AWS-shaped (L282)?

## A Closing Note — The Menus, Set

You now hold the repeatable shapes: **the chat, the RAG, the batch, and the agent — with the product mapped and the patterns composed.** The floor plan has its AWS shapes — and the menu is set (L282).

Next: the serverless stack assembled — Serverless AI Architecture (L283).
