# Lesson 233 — API Architecture for AI Products

**Interview importance:** ⭐⭐⭐⭐⭐ — "where do the AI endpoints live?" — the answer is the *API shape*: the endpoints, the request flow, and the streaming (L251) — the L173 floor plan's front door, made real (L236).**

L173 built the floor plan; this lesson is **where it's exposed**: API architecture for AI products — the shape of the AI backend's API: the endpoints (chat, generate, tools — L173), the request flow (gateway → budget → model, L236), and the transport (streaming, L251). The AI API is different from a CRUD API: the responses stream (L145), the requests carry prompts and schemas (L143), and the backend must be async (L222) and observable (L213). This lesson is the map of that API (L233).

The distinction this lesson is built on: a **demo** has one endpoint that calls the model. A **solutions architect** designs the API surface: the endpoints and their contracts (L163), the request flow through the gateway (L236), the streaming transport (L251), and the observability (L213) — the L173 floor plan, exposed as an API (L233).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the AI API's shape: the endpoints and their contracts (L233)
- Design the request flow: gateway → budget → model → stream (L236)
- Explain the streaming transport (L251) and why it's the default (L145)
- Design the contracts: prompts, schemas, tool definitions (L143)
- Explain the observability: the API's trace (L213)

## 1. One-Line Definition

**API architecture for AI products is the shape of the AI backend — the endpoints (chat, generate, tools, L173) with their contracts (L163), the request flow through the gateway (L236: auth, budget, rate limit, L149, L170), the streaming transport (L251) that's the default because AI responses are slow (L145), and the observability (L213) that traces every request — the L173 floor plan, exposed as an API (L233).**

The one-sentence interview answer: *"The AI API's shape is the L173 floor plan, exposed (L233). The endpoints: a chat endpoint (L162), a generate endpoint, a tool endpoint (L164) — each with a contract (L163): the prompt, the schema (L143), the tool definitions (L144). The request flow goes through the gateway (L236): auth (L237), the token budget (L149), the rate limit (L170), then the model (L152). The transport is streaming (L251) by default — AI responses take seconds (L145), and the user sees the tokens as they arrive (L162). And every request is traced (L213): the prompt, the tokens, the cost (L332). The AI API is different from a CRUD API: the responses stream, the requests carry schemas, and the backend is async (L222) and observable (L233)."*

## 2. Mental Model

Think of the AI API as **a restaurant's kitchen, seen through its order window.** The menu (the API surface, L233) lists what you can order: chat, generate, tools (L173). You order through the window (the gateway, L236): your ticket is checked (auth, L237), your budget is verified (L149), your pace is measured (the rate limit, L170). The kitchen (the backend) cooks — and because cooking takes time (L145), the food comes out as it's ready (streaming, L251), not all at once. The window keeps a record of every order (the trace, L213). The restaurant works because the menu is clear, the window guards, and the food streams out (L233).

```text
   the menu (the API, L233)         the window (the gateway, L236)
   ┌──────────────────────┐         ┌──────────────────────────────┐
   │ chat · generate ·    │  ─────► │ auth (L237) · budget (L149)  │
   │ tools (L173)         │         │ rate limit (L170) · trace    │
   │ contracts (L163)     │         │ (L213) → the model → stream  │
   └──────────────────────┘         │ (L251)                       │
   └────────────────────────────────┘
```

The mental model is **the kitchen and the window**: a clear menu, a guarding window, and the food streaming out (L233).

## 3. Visual Flow — One Request Through the API

```text
   a client request arrives (L233)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE GATEWAY (L236)                                   │
   │     auth (L237) → budget (L149) → rate limit (L170)      │
   │     → the request is admitted (L233)                     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE CONTRACT (L163)                                  │
   │     the prompt · the schema (L143) · the tools (L144)    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE MODEL (L152)                                     │
   │     the call, streamed (L251) — the tokens arrive as     │
   │     they're generated (L145)                             │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · THE TRACE (L213)                                     │
   │     prompt · tokens · cost (L332) — recorded per request │
   └──────────────────────────────────────────────────────────┘
```

The flow is the API's anatomy: **gateway → contract → model → stream → trace** (L233).

## 4. How It Works — The Endpoints, the Flow, the Transport

- **The endpoints (L173, L233).** The API surface: a chat endpoint (L162), a generate endpoint, a tool-calling endpoint (L164), maybe a batch endpoint (L221). Each is a contract (L163): the request shape, the response shape, the schema (L143).
- **The request flow (L236).** Every request goes through the gateway (L236): auth (L237), the token budget (L149), the rate limit (L170), then the model (L152). The flow is the L172 baseline, made operational (L233).
- **The transport (L251).** Streaming is the default (L251): AI responses take seconds (L145), and the streaming transport (L251) delivers the tokens as they're generated (L162). The non-streaming call is the fallback, not the default (L233).
- **The observability (L213).** Every request is traced (L213): the prompt, the tokens, the cost (L332), the latency (L333). The AI API's observability is the product's health (L233).

> [!NOTE]
> **The AI API is a different shape from a CRUD API (L233).** A CRUD API returns a resource; an AI API streams a generation (L251). A CRUD API's request is a resource ID; an AI API's request is a prompt and a schema (L143). A CRUD API is synchronous; an AI API's heavy calls are async (L222). The senior design doesn't force the AI API into the CRUD mold (L233): the endpoints reflect the product's actions (L173), the transport streams (L251), and the backend absorbs the slow model calls (L222).

## 5. Real Project Usage

- **A chat product (L162).** The `/chat` endpoint (L233): the gateway (L236), the streaming response (L251), the trace (L213).
- **A copilot (L164).** The `/generate` and `/tools` endpoints (L233): the tool loop (L164) behind the API (L201).
- **A batch pipeline (L221).** The `/batch` endpoint (L233): the job is enqueued (L222), the webhook returns (L220).
- **An AI SaaS platform (L260).** The full API surface (L233) behind the gateway (L236) with per-tenant budgets (L149) and the observability (L213).
- **Anything AI (L260).** The API shape is the floor plan's front door (L233) — the endpoints, the flow, the streaming (L251).

The through-line: **the API is the floor plan, exposed** — the endpoints, the guarded flow, and the streaming transport that AI demands (L233).

## 6. Interview Explanation

Say it in four moves:

1. **The endpoints.** "Chat, generate, tools (L173) — each a contract (L163)."
2. **The flow.** "Gateway (L236): auth (L237), budget (L149), rate limit (L170), then the model (L152)."
3. **The transport.** "Streaming by default (L251) — the tokens arrive as they're generated (L145)."
4. **The observability.** "Every request traced (L213): the prompt, the tokens, the cost (L332)."

## 7. Senior-Level Insights

- **The endpoints mirror the product's actions (L173).** The senior answer designs the API around the actions — chat, generate, tools (L173) — not around resources (L233). The AI API is action-shaped (L233).
- **The gateway is the L172 baseline, operational (L236).** The request flow (L236) is the security baseline (L172) made real: auth (L237), budget (L149), limits (L170), trace (L213) — the L172 discipline at the API's front door (L233).
- **The streaming transport is the user experience (L251).** TTFT (L145) is the perceived latency (L162) — the streaming transport (L251) is the UX (L233).
- **The contracts are the product's interface (L163).** The prompt, the schema (L143), the tools (L144) — the contracts are versioned (L341) like any API (L233).
- **The observability is the AI API's health (L213).** The trace (L213) — tokens, cost (L332), latency (L333) — is the backend's dashboard (L260).

## 8. Common Mistakes

- **The CRUD mold (L233).** The AI API forced into resources (L233) — the actions (L173) and the streaming (L251) lost.
- **One endpoint for everything (L173).** The chat, generate, and tools collapsed (L233) — the contracts (L163) blur.
- **No gateway (L236).** The model called directly (L172) — no auth (L237), no budget (L149), no limits (L170).
- **Non-streaming default (L251).** The user waits for the full response (L145) — the TTFT (L162) and the UX die (L233).
- **No contracts (L163).** The prompts and schemas undefined (L143) — the API unversioned (L341).
- **No observability (L213).** The requests untraced (L332) — the cost and the failures invisible (L260).

## 9. Best Practices

- **Design the endpoints around the actions** (L173) — chat, generate, tools (L233).
- **Put every request through the gateway** (L236) — auth (L237), budget (L149), limits (L170).
- **Stream by default** (L251) — the tokens as they're generated (L145).
- **Define the contracts** (L163) — the prompt, the schema (L143), the tools (L144).
- **Trace every request** (L213) — the prompt, the tokens, the cost (L332).
- **Keep the heavy calls async** (L222) — the batch endpoint enqueues (L221).

## 10. Interview Questions

**Q: How do you design an AI product's API?**
> A: Around the actions, not the resources (L233). The endpoints mirror the product: chat (L162), generate, tools (L164) — each a contract (L163): the prompt, the schema (L143), the tool definitions (L144). Every request flows through the gateway (L236): auth (L237), the token budget (L149), the rate limit (L170). The transport streams (L251) — AI responses take seconds (L145). And every request is traced (L213).

**Q: Why is streaming the default?**
> A: Because TTFT is the perceived latency (L145). An AI response takes seconds to generate (L145) — a non-streaming call makes the user wait for the whole thing (L162). The streaming transport (L251) delivers the tokens as they're generated, so the user sees progress immediately (L162). For an AI API, streaming is the user experience (L233) — the non-streaming call is the fallback (L251).

**Q: How is an AI API different from a CRUD API?**
> A: Three differences (L233). The endpoints are action-shaped — chat, generate, tools (L173) — not resource-shaped. The requests carry prompts and schemas (L143), not resource IDs. And the responses stream (L251) — the model is slow (L145), so the backend is async (L222) and the tokens arrive as they're generated (L162). Forcing the AI API into the CRUD mold loses all three (L233).

**Q: What's in the request flow?**
> A: The gateway first (L236): auth — who's calling (L237); the token budget — how much the call may spend (L149); the rate limit — how fast the caller may go (L170). Then the contract is validated (L143), the model is called and streamed (L251), and the whole request is traced (L213) — the prompt, the tokens, the cost (L332). The flow is the L172 baseline, made operational (L233).

## 11. Follow-Up Questions

- What are the action-shaped endpoints (L173)?
- What's in the gateway's flow (L236)?
- Why stream by default (L251)?
- What's in a contract (L163)?
- What does the trace record (L213)?

## 12. Comparison Table — CRUD vs AI API

| | CRUD API (L92) | AI API (this lesson) |
|---|---|---|
| Shape (L233) | resources | actions (L173) |
| Request | resource ID | prompt + schema (L143) |
| Response | a resource | a stream (L251) |
| Latency (L145) | ms | seconds — streamed (L162) |
| Work (L222) | sync | async + batch (L221) |
| Observability (L213) | logs | tokens + cost (L332) |

The senior read: **the right column is the AI shape** — action endpoints, schema requests, streaming responses (L233).

## 13. Code Example — The API Shape

```js
// The AI API: endpoints, the gateway flow, streaming, the trace (L233, L251).
// THE ENDPOINT (L173) — an action-shaped contract (L163).
export async function POST(req) {
  // 1 · THE GATEWAY (L236): auth → budget → rate limit.
  const session = await authenticate(req);                     // L237
  if (!session) return error(401);
  const budget = await checkBudget(session, body);             // L149
  if (!budget.ok) return error(429, 'over budget');
  if (!(await rateLimit(session)).ok) return error(429);       // L170

  // 2 · THE CONTRACT (L163): the prompt, the schema, the tools (L143, L144).
  const parsed = ChatSchema.parse(body);                       // L143

  // 3 · THE MODEL, STREAMED (L251) — the tokens as they're generated (L145).
  const stream = streamText({
    model: openai('gpt-4o-mini'),
    system: FROZEN_SYSTEM,
    messages: parsed.messages,
    tools: parsed.tools,                                       // L144
  });

  // 4 · THE TRACE (L213): the prompt, the tokens, the cost (L332).
  stream.onFinish(async ({ usage }) => {
    await trace.log({ user: session.user, tokens: usage, cost: costOf(usage), at: Date.now() });
  });

  return stream.toDataStreamResponse();                        // the streaming transport (L251)
}
```

```text
What the reader must SEE — the API's anatomy:

  authenticate → budget → rateLimit   → the gateway (L236)
  ChatSchema.parse(body)               → the contract (L163, L143)
  streamText + toDataStreamResponse    → the streaming transport (L251)
  stream.onFinish → trace.log          → the observability (L213, L332)

  The floor plan, exposed: guarded, contracted, streamed, traced.
```

```narrate
4-8: The gateway — auth (L237), the token budget (L149), the rate limit (L170): the L172 baseline, operational (L236).
10-12: The contract — the schema validates the request (L143, L163).
14-20: The model — called and streamed (L251), the tokens arriving as they're generated (L145).
22-25: The trace — the request's tokens and cost recorded (L213, L332).
27: The streaming transport — the response goes out as a stream (L251).
```

> [!TIP]
> The pair that defines the AI API: **`authenticate → checkBudget → rateLimit`** (the gateway, L236) and **`stream.toDataStreamResponse()`** (the streaming transport, L251). **Guarded at the door, streamed on the way out — the AI API's two signatures (L233).**

## 14. Performance Notes

- **The gateway is the latency budget (L151).** The auth (L237) and the checks (L149, L170) must be fast (Redis, L243) — or they eat the TTFT (L145).
- **The streaming is the perceived latency (L162).** The first token's arrival (L145) is the UX (L251) — the backend's pipeline is tuned for it (L333).
- **The model is the slow part (L145).** The generation (L145) is seconds — the gateway's work is microseconds next to it (L233).
- **The trace is the storage cost (L150).** The tokens and cost logs (L332) are cheap and required (L322).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The lessons... 404 | The dev server's route registry stale | Restart `next dev` with a clean `.next` |
| Slow responses | The model called non-streamed (L251) | The streaming transport (L145) |
| Unauthenticated calls | No gateway (L236) | The auth step (L237) |
| Bills with no trace | No observability (L213) | The trace per request (L332) |
| Schema errors | No contract (L143) | The validation step (L163) |

## 16. Quick Revision Notes

- API architecture = **the floor plan, exposed** (L233).
- The endpoints: **action-shaped** (L173) — chat, generate, tools (L233).
- The flow: **gateway (L236): auth (L237), budget (L149), limits (L170)**.
- The transport: **streaming by default** (L251).
- The contracts: **prompt, schema (L143), tools (L144)**.
- The observability: **the trace (L213) — tokens, cost (L332)**.

## 17. Cheat Sheet

```text
API ARCHITECTURE FOR AI = the floor plan, exposed

THE ENDPOINTS (L173, L233)
  action-shaped: chat (L162) · generate · tools (L164) · batch (L221)
  each a contract (L163): prompt + schema (L143) + tools (L144)

THE FLOW (L236)
  gateway → auth (L237) → token budget (L149) → rate limit (L170)
  → contract (L143) → the model (L152) → stream (L251) → trace (L213)

THE TRANSPORT (L251)
  streaming by default — the tokens as they're generated (L145)
  TTFT is the perceived latency (L162)
  non-streaming is the fallback, not the default (L233)

THE OBSERVABILITY (L213)
  every request traced: the prompt, the tokens, the cost (L332)
  the trace is the backend's health (L260)

THE SHAPE (L233)
  action endpoints · schema requests · streaming responses
  async heavy calls (L222) · batch for the long jobs (L221)

INTERVIEW, 4 MOVES
  1 endpoints "action-shaped: chat, generate, tools (L173)"
  2 flow      "gateway: auth, budget, limits (L236)"
  3 transport "streaming by default (L251)"
  4 observability "the trace — tokens, cost (L213, L332)"
```

## 18. Key Takeaways

> [!RECAP]
> - API architecture for AI is **the L173 floor plan, exposed** (L233): the action-shaped endpoints (L173), the gateway flow (L236), the streaming transport (L251), and the observability (L213)
> - **The endpoints mirror the product's actions** (L173): chat (L162), generate, tools (L164), batch (L221) — each with a contract (L163): the prompt, the schema (L143), the tools (L144)
> - **Every request flows through the gateway** (L236): auth (L237), the token budget (L149), the rate limit (L170) — the L172 baseline, operational (L233)
> - **Streaming is the default** (L251) — TTFT (L145) is the perceived latency (L162), and the tokens arrive as they're generated (L233)
> - **Every request is traced** (L213) — the prompt, the tokens, the cost (L332), serving the backend's health (L260)
> - The AI API is a **different shape from a CRUD API** (L233): action endpoints, schema requests, streaming responses, and an async backend (L222)

## Check your understanding

Answer these without looking back.

1. What are the action-shaped endpoints (L173)?
2. What's in the gateway's flow (L236)?
3. Why is streaming the default (L251)?
4. What's in a contract (L163)?
5. What does the trace record (L213)?
6. How is the AI API different from a CRUD API (L233)?
7. What's the L172 baseline, made operational (L236)?
8. Why is the heavy work async (L222)?

## A Closing Note — The Front Door, Designed

You now hold the API shape: **the action endpoints, the guarded gateway flow, the streaming transport, and the trace of every request.** The floor plan now has a front door — and it's built for the AI product's shape (L233).

Next: the baseline the gateway extends — REST best practices (L234), resources, status codes, pagination.
