# Lesson 355 — AI E-commerce Assistant

**Interview importance:** ⭐⭐⭐⭐⭐ — "catalog grounding, recommendations, and purchase-safe tool calls" — the answer is *the e-commerce design*: the catalog, the recommendations, and the safe purchases (L355).**

L347 built the protocol and L315 the tool security; this lesson is **the protocol run on e-commerce**: the AI e-commerce assistant — the catalog grounding, the recommendations, and the purchase-safe tool calls (L355): the design (the protocol L347 run, L355), the catalog (the grounding L280, L355), the recommendations (the personalization, L355), and the purchases (the tool calls L315, safe L355). The AI shape (L173): the store (L355) — the assistant (L355) with the grounded catalog (L355) and the safe purchases (L355). This lesson is the store's design (L355).

The distinction this lesson is built on: a **junior** describes the chatbot. A **solutions architect** designs the trust (L355): the catalog (L280), the recommendations (L355), and the purchase-safe calls (L315) — the protocol (L347) run on the store (L355).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the store's requirements (L355)
- Explain the catalog: the grounding (L280)
- Explain the recommendations: the personalization (L355)
- Explain the purchases: the safe tool calls (L315)
- Explain the AI shape: the store's trust (L355)

## 1. One-Line Definition

**The AI e-commerce assistant is the protocol run on a store (L355) — the clarify (the users L162, the catalog L355, the purchases L355, L355), the catalog (the grounding L280: the products L355 indexed L183 and retrieved L189, L355), the recommendations (the personalization L355: the history L166 and the embeddings L181, L355), and the purchases (the tool calls L315 safe: the confirm L355, the approval L324, the sandbox L315, L355) — the store (L355), assisted with the trust (L355).**

The one-sentence interview answer: *"The e-commerce assistant is the protocol, run (L355). The clarify (L355): the users (L162) — the shoppers (L355); the catalog (L355) — the products (L355); the purchases (L355) — the transactions (L355); and the trust (L355) — the accuracy (L355) and the safety (L355). The catalog (L355): the grounding (L280) — the products (L355) ingested (L349) and indexed (L183), the retrieval (L189) grounding the answers (L337) with the current prices (L355). The recommendations (L355): the personalization (L355) — the shopper's (L162) history (L166) and the embeddings (L181) — the similar (L355) products (L355). The purchases (L355): the tool calls (L315) — the add-to-cart (L355) and the checkout (L355) — safe (L355): the confirm (L355) — the shopper (L162) confirms (L355); the approval (L324) — the high-value (L355) gated (L324); and the sandbox (L315) — the scoped (L315) execution (L355). The AI shape (L173): the store (L355) — the grounded catalog (L280), the recommendations (L355), and the purchase-safe calls (L315) — the trust (L355), designed (L355)."*

## 2. Mental Model

Think of the e-commerce assistant as **the department store's personal shopper.** The shopper (the user, L162) asks the assistant (L355). The assistant's catalog (the grounding, L280): the shelves (the index, L183) with the current prices (L355) — the answers (L337) grounded (L355). The assistant's taste (the recommendations, L355): the shopper's (L162) history (L166) — the similar (L355) items (L355). And the purchases (the safe calls, L355): the assistant (L355) fills the cart (L355) — the shopper (L162) confirms (L355); the big-ticket (L324) — the manager's (L324) approval (L324); and the register (the sandbox, L315) — the scoped (L315) transaction (L355). The store works because the catalog is current, the taste is personal, and the purchases are confirmed (L355).

```text
   the personal shopper (the assistant, L355)
   ┌────────────────────────────────────────────────────────┐
   │ the catalog (the grounding, L280) — the current        │
   │ shelves (L183)                                         │
   │ the taste (the recommendations, L355) — the history    │
   │ (L166)                                                 │
   │ the purchases (the safe calls, L315) — the confirm     │
   │ (L355), the approval (L324), the sandbox (L315)        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the personal shopper**: the catalog, the taste, and the purchases (L355).

## 3. Visual Flow — One Query and One Purchase

```text
   THE QUERY (L355)
   "show me a waterproof camera under $300" (L355)
   → the retrieval (L189) over the catalog (L355)
   → the grounded answer (L337) with the prices (L355)

   THE PURCHASE (L355)
   "add the third to my cart" (L355)
   → the tool call (L315): add_to_cart (L355)
   → the confirm (L355) → the sandbox (L315) → the scoped (L315)
   → the high-value (L324) → the approval (L324)
```

The flow is the assistant: **the grounded query and the confirmed purchase** (L355).

## 4. How It Works — The Design, Part by Part

- **The clarify (L355).** The users (L162), the catalog (L355), the purchases (L355), the trust (L355).
- **The catalog (L355).** The grounding (L280): the products (L355) ingested (L349), indexed (L183), retrieved (L189) — the current prices (L355).
- **The recommendations (L355).** The personalization (L355): the history (L166) and the embeddings (L181) — the similar (L355) products (L355).
- **The purchases (L355).** The tool calls (L315) safe (L355): the confirm (L355), the approval (L324), the sandbox (L315).

> [!NOTE]
> **The purchase is the trust's test (L355).** The senior answer secures the purchase (L355): the tool calls (L315) — the add-to-cart (L355) and the checkout (L355) — the schema (L315) validated (L355); the confirm (L355) — the shopper (L162) confirms the action (L355) — the L208 human-in-the-loop (L208), purchase-shaped (L355); the high-value (L355) — the approval (L324); and the sandbox (L315) — the scoped (L315) execution (L355). The purchase (L355) is the assistant's (L355) trust (L355).

## 5. Real Project Usage

- **A storefront (L355).** The catalog (L355), the recommendations (L355), the safe purchases (L355).
- **A product search (L189).** The grounding (L280) — the retrieval (L189) over the catalog (L355).
- **A recommendation feed (L355).** The history (L166) and the embeddings (L181) — the similar (L355).
- **A checkout flow (L355).** The tool calls (L315) — the confirm (L355), the approval (L324).
- **Anything commerce (L355).** The trust (L355) — the grounding (L280), the safe calls (L315).

The through-line: **the trust is the store's** — the grounded catalog, the personal taste, the confirmed purchases (L355).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The shoppers, the catalog, the purchases (L355)."
2. **The catalog.** "The grounding (L280) — the retrieval (L189) with the prices (L355)."
3. **The recommendations.** "The history (L166) and the embeddings (L181)."
4. **The purchases.** "The confirm (L355), the approval (L324), the sandbox (L315)."

## 7. Senior-Level Insights

- **The catalog's freshness is the trust (L355).** The current prices (L355) — the grounding (L280) with the live data (L355) — the stale (L355) answer is the lost (L355) sale (L355).
- **The recommendations are the history's (L166).** The shopper's (L162) history (L166) — the embeddings (L181) — the personal (L355), the relevant (L355).
- **The confirm is the L208 control (L208).** The purchase (L355) — the shopper (L162) confirms (L355) — the L208 human-in-the-loop (L208), purchase-shaped (L355).
- **The approval is the value's gate (L324).** The high-value (L355) — the L324 approval (L324) — the L314 agency (L314), commerce-shaped (L355).
- **The eval is the store's quality (L341).** The grounding (L337) and the purchase success (L355) — the L341 suite (L341) (L355).

## 8. Common Mistakes

- **The un-grounded answers (L337).** The catalog (L355) from the memory (L336) — the hallucinated prices (L336) — the grounding (L280) with the live index (L183).
- **The auto-purchase (L355).** The checkout (L355) without the confirm (L355) — the L208 control (L208) missing (L355).
- **The un-scoped tool (L315).** The purchase tool (L315) with the wide permissions (L314) — the sandbox (L315) and the scope (L262).
- **The un-approved high-value (L324).** The big-ticket (L355) automatic (L324) — the L324 gate (L324) (L355).
- **The eval-less store (L341).** The grounding (L337) and the purchases (L355) un-measured (L341) — the suite (L341) (L355).

## 9. Best Practices

- **Ground the catalog** (L280) — the live index (L183) and the prices (L355).
- **Personalize the recommendations** (L355) — the history (L166) and the embeddings (L181).
- **Confirm the purchases** (L355) — the L208 control (L208).
- **Gate the high-value** (L324) — the approval (L324).
- **Sandbox the tools** (L315) — the scoped (L262) execution (L355).

## 10. Interview Questions

**Q: Walk me through the e-commerce assistant.**
> A: The protocol, run (L355). The clarify — the shoppers, the catalog, the purchases (L355). The catalog — the grounding (L280) with the prices (L355). The recommendations — the history (L166) and the embeddings (L181). And the purchases — the confirm (L355), the approval (L324), the sandbox (L315).

**Q: How do you keep the catalog grounded?**
> A: The RAG (L349): the products (L355) ingested (L176) and indexed (L183) — the retrieval (L189) grounding (L280) the answers (L337) — the prices (L355) and the stock (L355) from the live index (L355). The stale (L355) answer is the hallucination (L336) — the grounding (L280) is the trust (L355).

**Q: How do the recommendations work?**
> A: The personalization (L355): the shopper's (L162) history (L166) — the viewed and the purchased (L355) — and the embeddings (L181) of the products (L355) — the similar (L355) items (L355) recommended (L355). The fresh (L355) and the personal (L355) — the conversion (L355).

**Q: How do you make the purchases safe?**
> A: Four controls (L355): the schema (L315) — the tool call (L315) validated (L355); the confirm (L355) — the shopper (L162) confirms the action (L355) — the L208 control (L208); the approval (L324) — the high-value (L355) gated (L324); and the sandbox (L315) — the scoped (L262) execution (L355).

## 11. Follow-Up Questions

- What's the clarify (L355)?
- How do you keep the catalog grounded (L280)?
- How do the recommendations work (L355)?
- How do you make the purchases safe (L355)?
- What's the eval (L341)?

## 12. Comparison Table — The Query vs the Purchase

| | The query (L355) | The purchase (L355) |
|---|---|---|
| The risk (L355) | the hallucination (L336) | the wrong charge (L355) |
| The control (L355) | the grounding (L280) | the confirm (L355), the approval (L324) |
| The latency (L355) | the sub-second (L151) | the human's (L208) |
| The eval (L355) | the groundedness (L337) | the purchase success (L355) |

The senior read: **the query needs the grounding; the purchase needs the gates** (L355).

## 13. Code Example — The Design, Applied

```js
// The e-commerce assistant (L355) — the trust, designed (L355).
// 1 · THE GROUNDED QUERY (L355) — the catalog (L280).
async function answerQuery(shopperId, query) {
  const products = await retrieve(`catalog:${query}`, { topK: 5 });  // L189, L183
  const answer = await model.invoke({
    query,
    context: products,                         // the grounding (L280)
  });
  return {
    answer,
    citations: products.map((p) => p.url),     // the sources (L192)
    prices: products.map((p) => p.price),      // the live prices (L355)
  };
}

// 2 · THE RECOMMENDATIONS (L355) — the history (L166).
async function recommend(shopperId) {
  const history = await store.get(`history:${shopperId}`);  // L166
  const embeddings = await embed(history.viewed);          // L181
  return similarProducts(embeddings);                      // L355
}

// 3 · THE SAFE PURCHASE (L355) — the tool call (L315).
async function purchase(shopperId, productId) {
  validateSchema(addToCartSchema, { shopperId, productId });  // L315

  // THE CONFIRM (L355) — the shopper confirms (L355, L208).
  const ok = await confirmAction(shopperId, { productId, price: priceOf(productId) });
  if (!ok) return { status: 'cancelled' };

  // THE APPROVAL (L324) — the high-value gated (L355).
  if (priceOf(productId) > HIGH_VALUE) {
    await approvalGate(shopperId, { productId });          // L324
  }

  // THE SANDBOX (L315) — the scoped execution (L355).
  return sandboxExecute('cart', { shopperId, productId }); // L315, L262
}
```

```text
What the reader must SEE — the trust, applied:

  retrieve catalog + prices   → the grounding (L280, L355)
  history + embed             → the recommendations (L166, L181)
  validateSchema              → the tool's gate (L315)
  confirmAction               → the L208 control (L208, L355)
  approvalGate on the high    → the L324 gate (L324)
  sandboxExecute              → the scope (L315, L262)

  The grounded catalog, the personal taste, the confirmed purchase (L355).
```

```narrate
4-13: The query — the retrieval and the grounded answer with the live prices (L189, L280, L355).
15-18: The recommendations — the history and the embeddings (L166, L181).
20-34: The purchase — the schema, the confirm, the approval, and the sandbox (L315, L208, L324, L262).
```

> [!TIP]
> The pair that defines the trust: **the live-index grounding** (the catalog, L280) and **the confirmed purchase** (the L208 control, L208). **Ground the catalog, personalize the recommendations, confirm the purchases, gate the high-value — the store, assisted (L355).**

## 14. Performance Notes

- **The grounding is the answer's latency (L355).** The retrieval (L189) — the sub-second (L151) — the TTFT (L145) preserved (L355).
- **The recommendations are the batch's (L355).** The embeddings (L181) — the precomputed (L355) similar (L355).
- **The purchase is the human's latency (L208).** The confirm (L355) — the seconds (L355) for the trust (L355).
- **The eval is the store's quality (L341).** The groundedness (L337) and the purchase success (L355).

## 15. Debugging Scenarios

| Symptom | First check (L355) | The lever |
|---|---|---|
| The prices are wrong | The grounding (L280) | The live index (L183) |
| The recommendations are generic | The history (L166) | The embeddings (L181) |
| The wrong charge | The purchase (L355) | The confirm (L355), the approval (L324) |
| The tool overreaches | The scope (L315) | The sandbox (L315), the schema (L262) |
| The trust drifts | The evals (L341) | The groundedness (L337) |

## 16. Quick Revision Notes

- The AI e-commerce assistant = **the store's design** (L355): the clarify, the catalog, the recommendations, the purchases.
- The clarify: **the shoppers (L162), the catalog (L355), the purchases (L355)**.
- The catalog: **the grounding (L280) — the live index (L183) and the prices (L355)**.
- The recommendations: **the history (L166) and the embeddings (L181)**.
- The purchases: **the confirm (L355), the approval (L324), the sandbox (L315)**.

## 17. Cheat Sheet

```text
AI E-COMMERCE ASSISTANT = the catalog, the recommendations, the trust

THE CLARIFY (L355)
  the users (L162) — the shoppers (L355)
  the catalog (L355) — the products (L355)
  the purchases (L355) — the transactions (L355)
  the trust (L355) — the accuracy (L355) and the safety (L355)

THE CATALOG (L355)
  the grounding (L280) — the products (L355) ingested (L349)
  and indexed (L183) · the retrieval (L189)
  the current prices (L355) — the freshness (L355)

THE RECOMMENDATIONS (L355)
  the personalization (L355) — the history (L166)
  and the embeddings (L181) — the similar (L355) products (L355)

THE PURCHASES (L355)
  the tool calls (L315) safe (L355):
  the schema (L315) validated (L355) · the confirm (L355)
  the approval (L324) — the high-value (L355) gated (L324)
  the sandbox (L315) — the scoped (L262) execution (L355)

INTERVIEW, 4 MOVES
  1 clarify  "the shoppers, the catalog, the purchases (L355)"
  2 catalog  "the grounding with the prices (L280)"
  3 recommend "the history and the embeddings (L355)"
  4 purchases "the confirm, the approval, the sandbox (L355)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI e-commerce assistant is **the protocol run on a store** (L355): the clarify (L355), the catalog (L355), the recommendations (L355), and the purchases (L355)
> - **The clarify** (L355): the users (L162), the catalog (L355), the purchases (L355), and the trust (L355)
> - **The catalog** (L355): the grounding (L280) — the products (L355) ingested (L349) and indexed (L183), the retrieval (L189) grounding (L337) the answers (L355) with the current prices (L355)
> - **The recommendations** (L355): the personalization (L355) — the history (L166) and the embeddings (L181)
> - **The purchases** (L355): the tool calls (L315) safe (L355) — the confirm (L355) — the L208 control (L208); the approval (L324) — the high-value (L355); and the sandbox (L315) — the scoped (L262) execution (L355)
> - The AI shape (L355): the store (L355) — the grounded catalog (L280), the recommendations (L355), and the purchase-safe calls (L315) — the trust (L355), designed (L355)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L355)?
2. How do you keep the catalog grounded (L280)?
3. How do the recommendations work (L355)?
4. How do you make the purchases safe (L355)?
5. What's the eval (L341)?
6. What's the confirm (L208)?
7. What's the approval (L324)?
8. What is the store's trust (L355)?

## A Closing Note — The Shopper, Trusted

You now hold the design: **the catalog, the recommendations, and the safe purchases — with the shelves current and the purchases confirmed.** The personal shopper knows the store — and the big-ticket needs the manager (L355).

Next: the workflows, the integrations, and the approval gates as a product — AI Automation Platform (L356).
