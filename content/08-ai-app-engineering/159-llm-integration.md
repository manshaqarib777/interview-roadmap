# Lesson 159 — LLM API Integration Patterns

**Interview importance:** ⭐⭐⭐⭐ — "how do you actually call the model in production?" is the integration question; the answer is the *patterns* — where the call lives, how it's shaped, and how it fails.

Lesson 158 mapped the six parts; this lesson is the **seam between orchestration and the provider** — the actual API call. Every AI app calls the model somehow, and the *patterns* of that call — server-side, streamed, budgeted, retried, with the key managed — are what separate a demo call from a production integration. This is the lesson the resilience lessons (L168–L171) build on.

The distinction this lesson is built on: a **demo** calls the API from a route or a component and renders. A **solutions architect** knows the integration *patterns*: the call lives server-side behind the gateway (L158, L172); it's shaped as messages + params (L152–L154); it's streamed to the UI (L145); it's budgeted (L149); it fails in known ways (L168); and the key is managed, never embedded (L172).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the integration patterns: server-side call, proxied stream, budgeted request, managed key
- Shape a call correctly: messages, roles, params, tools, schema (L143–L144, L152–L154)
- Explain where the call lives and why it never lives in the client (L158, L172)
- Describe the failure surface of an API call: errors, timeouts, rate limits, malformed responses (L168)
- Use the provider SDKs and the abstraction (L155) deliberately, not by default

## 1. One-Line Definition

**LLM API integration is the pattern of making production model calls — server-side behind the gateway, shaped as messages and params, streamed to the client, budgeted before the call, with the key managed and the failure modes handled — the seam between orchestration and provider.**

The one-sentence interview answer: *"The integration is a set of patterns, not a call. The request is built server-side — messages and params (L152–L154) — sent through the gateway that holds the key and enforces the budget (L149, L172), streamed to the client (L145), with tools and structured output shaped by the abstraction (L155). And it fails in known ways — provider errors, timeouts, rate limits, malformed JSON — each handled deliberately (L168)."*

## 2. Mental Model

Think of the LLM call as **a postcard to a very busy, very literal pen pal** — and the integration as *how you write, send, track, and survive the reply.*

- **Write it right** (the request shape): address (endpoint, L152–L154), the message (roles, L142), the constraints (temperature, L139; max_tokens, L149), and the attachments (tools, L144; schema, L143).
- **Send it safely** (the gateway, L158, L172): the key stays in your pocket, the budget is checked at the post office, and the route is rate-limited (L170).
- **Track the reply** (streaming, L145): the pen pal writes in real time; you read each line as it comes.
- **Survive the failure** (L168): the pen pal is busy (rate limit), unreachable (timeout), or writes nonsense (malformed JSON) — you have a plan for each.

```text
   the integration, as a postcard

   write it right   →  request shape (L142-144, L152-154)
   send it safely   →  gateway: key + budget + rate limit (L149, L170, L172)
   track the reply  →  streaming, not waiting (L145)
   survive failure  →  errors, timeouts, limits, malformed (L168)
```

The mental model is four jobs — **write, send, track, survive** — and each one is a pattern with a lesson behind it.

## 3. Visual Flow — The Integration Patterns in One Request

```text
   orchestration (L158) wants an answer
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ PATTERN 1 · SHAPE the request                │
   │   messages (roles, L142) + model (L157)      │
   │   + temperature (L139) + max_tokens (L149)   │
   │   + tools (L144) + schema (L143)             │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ PATTERN 2 · SEND through the gateway         │
   │   key managed server-side (L172)             │
   │   budget checked (L149) · rate limit (L170)  │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ PATTERN 3 · STREAM the response (L145)       │
   │   deltas → UI · tool fragments reassembled   │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ PATTERN 4 · SURVIVE the failures (L168)      │
   │   provider error → retry (L169)              │
   │   rate limit → backoff (L169)                │
   │   malformed JSON → re-ask / handle (L163)    │
   └──────────────────────────────────────────────┘
```

The four patterns are the integration: **shape → send → stream → survive**. Miss any one and the integration is a demo.

## 4. How It Works — The Patterns, and Why They're Patterns

- **Shape the request.** The request is a *spec*: messages with roles (L142), the model chosen by the rule (L157), temperature by task (L139), the output budget (L149), tools (L144), and schema (L143) where a parser waits. The abstraction (L155) normalises the shape across providers.
- **Send through the gateway.** The call is server-side (L158); the key is an environment secret, never embedded (L172); the budget is checked before the provider is called (L149); rate limits apply at the gateway (L170). This is why the "call" is a pipeline, not a one-liner.
- **Stream the response (L145).** The client sees the first token in TTFT and the rest as deltas; tool fragments are reassembled (L144); cancellation is first-class.
- **Survive the failure (L168).** Provider errors, timeouts, rate limits, and malformed responses are *expected* — each has a pattern: retry with backoff (L169), fallback provider (L155), re-ask for malformed JSON (L163), and a graceful degradation message to the user.

> [!NOTE]
> **The integration's honest name is "the failure surface, designed for" (L141, L168).** A provider call *will* fail — the network will drop, the limit will hit, the JSON will be malformed. The integration patterns are the design that makes those failures handled paths, not surprises. The demo calls the API; the integration *survives* it.

## 5. Real Project Usage

- **Every AI feature.** Chat, extraction, agents, RAG — all of them are these four patterns: shape, send, stream, survive.
- **The Vercel AI SDK (L160)** is a pre-built integration: `streamText` shapes and streams; `useChat` handles the client side. This lesson is the principle behind it.
- **Serverless functions (L266).** The gateway pattern maps to a Lambda/API Gateway: the key in Secrets Manager (L275), the budget checked, the stream proxied.
- **Background jobs (L222).** Non-interactive calls skip the streaming pattern but keep shape/send/survive — batch the shape, retry the failure (L169).
- **Multi-provider (L155).** The shape is normalised by the abstraction; the send and survive are per-provider adapters; the pattern is provider-agnostic.

The through-line: **the patterns are the same whether the app is a chat, an agent, or a batch job** — shape, send, stream (or not), survive. The differences are emphasis, not architecture.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "Integration is four patterns: shape the request, send through the gateway, stream the response, survive the failures."
2. **Shape + send.** "The request is a spec — messages, params, tools, schema (L142–L144) — sent server-side through the gateway that holds the key and checks the budget (L149, L172)."
3. **Stream + survive.** "The response streams as deltas (L145), and the failures are expected: errors retried with backoff (L169), limits handled, malformed JSON re-asked (L163)."
4. **The why.** "The call is a pipeline, not a one-liner, because the key must stay server-side (L172) and the failure surface (L141) must be designed for."

## 7. Senior-Level Insights

- **The integration is the reliability boundary (L168).** Every failure mode of the provider is designed for *before* the call is in production: the retry (L169), the fallback (L155), the timeout, the malformed response. That's what makes it an integration rather than a call.
- **The gateway pattern is the governance boundary (L158, L170).** Where the call lives *is* where budgets, rate limits, and tenant caps are enforced. The integration's placement is the cost and security model.
- **The SDK is a pattern, not a magic (L160).** The Vercel AI SDK (and provider SDKs) encode these patterns — but the architect who knows the underlying shape (L152–L154) can use the SDK well, debug it, and replace it.
- **The integration is the *testing* boundary (L341).** The shape and survive patterns are what you test — a mocked provider, a golden set (L343), a retry test (L169). The integration's value is that it *can* be tested.

## 8. Common Mistakes

- **Calling the provider from the client.** The key leaks (L172); there's no budget (L149) or rate limit (L170). The call lives server-side, always.
- **Embedding the key in code.** A committed key is a rotated key and an incident (L172, L275).
- **No budget check before the call.** The request goes out unbudgeted (L149) — cost discovered in the bill, truncation discovered in the UI (L145).
- **Waiting for the full response instead of streaming (L145).** The user waits in silence; the felt-quality collapses.
- **No failure handling.** A provider outage becomes a 500 and a blank UI (L168) — the failure surface reached the user.
- **SDK as magic.** Using `streamText` without knowing the shape (L152–L154) — debugging blind, and stuck when the SDK doesn't fit.

## 9. Best Practices

- **Keep the call server-side, behind the gateway (L158, L172)** — always.
- **Shape the request as a spec** — messages, params, tools, schema, named (L142–L144).
- **Check the budget before the call** (L149); enforce rate limits at the gateway (L170).
- **Stream to the client** (L145) — pipe, never buffer.
- **Design the failure paths** (L168): retry (L169), fallback (L155), re-ask for malformed JSON (L163), graceful degradation.
- **Use the SDK for the pattern, not as a black box** (L160) — know the shape it wraps.

## 10. Interview Questions

**Q: How do you integrate an LLM into an app?**
> A: Four patterns. Shape the request — messages, params, tools, schema (L142–L144). Send it through the gateway, which holds the key and checks the budget (L149, L172). Stream the response to the client (L145). And design the failure paths — retries (L169), fallback (L155), malformed JSON handling (L163).

**Q: Why is the call server-side and not in the client?**
> A: Two reasons. The key must never reach the client (L172) — a client-side key is a leaked key. And the server is where budgets (L149), rate limits (L170), and tenant caps (L357) are enforced. The call's placement is the security and cost model.

**Q: How do you handle a provider outage?**
> A: It's a designed path, not a surprise (L168). Retry with exponential backoff (L169); fall back to a second provider through the abstraction (L155); and if all paths fail, degrade gracefully — the user sees a clear "try again", never a blank UI. The integration survives the provider; the demo doesn't.

**Q: What does the Vercel AI SDK do for you (L160)?**
> A: It encodes these patterns: `streamText` shapes and streams the call, `useChat` handles the client side. It's a pre-built integration. The senior value is knowing the pattern underneath — the shape (L152–L154), the gateway, the failure paths — so the SDK is used well and debugged, not treated as magic.

## 11. Follow-Up Questions

- What's the difference between the SDK's abstraction and your own (L155)?
- How do you test the integration's failure paths (L341)?
- How does streaming change the integration shape (L145)?
- How does the integration differ for a batch job vs a chat (L222)?
- Where do retries belong — and when are they dangerous (L169)?

## 12. Comparison Table — Demo Call vs Production Integration

| | Demo call | Production integration |
|---|---|---|
| Where it lives | anywhere | server-side, behind the gateway (L158, L172) |
| Key | embedded / client | environment secret, managed (L172) |
| Budget | none | checked before the call (L149) |
| Response | wait, then render | streamed (L145) |
| Failure | throws / blank UI | designed paths (L168, L169) |
| Testable | no | mocked provider + golden set (L341, L343) |

The senior read: **the table is the definition** — an integration is a call with the gateway, the budget, the stream, and the failure paths. Without them, it's a demo.

## 13. Code Example — The Four Patterns in One Call

```js
// The integration, deliberately: shape → send → stream → survive.
// 1 · SHAPE — the request is a spec (L142-144, L157).
function shapeRequest(question, history, tier = 'chat') {
  return {
    model: MODELS[tier],                    // the rule's tier (L157)
    messages: [...history, { role: 'user', content: question }],
    temperature: tier === 'chat' ? 0.8 : 0, // by task (L139)
    max_tokens: 300,                        // the output budget (L149)
  };
}

// 2 · SEND — through the gateway (key, budget, rate limit).
export async function POST(req) {
  const { question } = await req.json();
  await auth(req);                          // L172
  await enforceRateLimit(req);              // L170
  const budget = budgetRequest({ question, maxTokens: 300 }); // L149
  if (!budget.ok) return error(429, 'over budget');

  // 3 · STREAM (L145) + 4 · SURVIVE (L168, L169).
  try {
    const stream = await openai.chat.completions.create({
      ...shapeRequest(question, await loadHistory(req)),
      stream: true,
    });
    return new Response(stream, SSE_HEADERS);   // pipe, never buffer
  } catch (err) {
    if (isRetryable(err)) { await backoff(err); return POST(req); } // L169
    if (hasFallback()) return fallbackProvider(question);           // L155
    return error(502, 'provider unavailable', { graceful: true });  // degrade
  }
}
```

```text
What the reader must SEE — the four patterns in code:

  shape   → messages + params + budget, by tier (L157, L149)
  send    → gateway: auth, rate limit, budget check (L170, L172)
  stream  → pipe the deltas, never buffer (L145)
  survive → retryable? → backoff (L169) · fallback (L155) · degrade
```

```narrate
3-10: The shape is a spec — tier, messages, temperature by task, the output budget (L149).
13-16: The gateway: auth, rate limit, and budget all checked before the provider is called (L170, L172).
19-21: The stream is piped, not collected — the felt-quality of L145 preserved.
23-28: The failure surface (L141): retryable errors get backoff (L169), then fallback (L155), then graceful degradation.
```

> [!TIP]
> The senior line is the `catch`: it *designs* the failure instead of throwing it. That's the whole difference between an integration and a call — and L168 and L169 build it out properly.

## 14. Performance Notes

- **The gateway path must stay lean (L151).** Auth, rate limit, and budget are milliseconds against the model call — but they gate TTFT (L145). Keep them fast, or they eat the latency budget.
- **Streaming is the felt-latency pattern (L145)** — pipe the deltas; a buffering integration destroys TTFT's value.
- **Retries are a latency and cost trade (L169).** A retry costs another TTFT and another request; backoff with jitter, and only retry idempotent-safe calls (L169, L255).
- **The budget check is the cost control (L149, L150).** Checking before the call means the provider is never called with an over-budget request — the integration *is* the cost model's enforcement point.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Key in the client bundle | Key embedded or proxied wrongly (L172) | Move to the gateway; rotate the key |
| Stream arrives all at once | Gateway buffers (L145) | Pipe; disable buffering |
| Provider 429s | Rate limit not handled (L170) | Backoff + retry (L169); queue |
| Malformed JSON from extraction | Schema not enforced / not validated (L163) | Use structured output (L143); re-ask once |
| Blank UI on provider failure | No failure path (L168) | Add retry → fallback → graceful degradation |

## 16. Quick Revision Notes

- Integration = **four patterns: shape, send, stream, survive.**
- **Shape**: the request is a spec — messages, params, tools, schema (L142–L144, L157).
- **Send**: server-side through the gateway — key, budget (L149), rate limit (L170), auth (L172).
- **Stream** (L145): pipe deltas, never buffer; reassemble tool fragments (L144).
- **Survive** (L168): retry with backoff (L169), fallback (L155), re-ask for malformed JSON (L163), graceful degradation.
- The SDK (L160) encodes these patterns — know the shape underneath.

## 17. Cheat Sheet

```text
LLM INTEGRATION = four patterns, not one call

  1 SHAPE   the request is a spec
            messages (roles, L142) + model (L157)
            + temperature (L139) + max_tokens (L149)
            + tools (L144) + schema (L143)
            normalised by the abstraction (L155)

  2 SEND    through the gateway
            key managed server-side (L172)
            budget checked (L149) · rate limited (L170)
            auth'd (L172)

  3 STREAM  the response (L145)
            pipe deltas, never buffer
            reassemble tool fragments (L144)

  4 SURVIVE the failures (L168)
            retryable → backoff (L169)
            fallback provider (L155)
            malformed JSON → re-ask (L163)
            else → graceful degradation

RULES
  the call lives server-side, always (L158, L172)
  the failure surface is designed, not thrown (L141)
  the SDK (L160) encodes the patterns — know the shape

INTERVIEW, 4 MOVES
  1 frame    "shape, send, stream, survive"
  2 shape    "a spec: messages, params, tools, schema"
  3 send     "gateway: key, budget, rate limit"
  4 survive  "retry, fallback, re-ask, degrade"
```

## 18. Key Takeaways

> [!RECAP]
> - LLM integration is **four patterns**: shape the request, send through the gateway, stream the response, survive the failures
> - **Shape** is a spec — messages and roles (L142), model by the rule (L157), temperature (L139), budget (L149), tools (L144), schema (L143)
> - **Send** is server-side through the gateway — the key managed (L172), the budget checked (L149), rate limits applied (L170)
> - **Stream** pipes the deltas (L145) — never buffer, reassemble tool fragments (L144)
> - **Survive** designs the failure surface (L141, L168): retry with backoff (L169), fallback (L155), re-ask for malformed JSON (L163), graceful degradation
> - The SDK (L160) encodes these patterns — and the senior value is **knowing the shape underneath the SDK**

## Check your understanding

Answer these without looking back.

1. Name the four integration patterns.
2. What makes the request a "spec" rather than a call?
3. Why must the call live server-side (L158, L172)?
4. What does the gateway enforce before the provider is called (L149, L170)?
5. Why is "pipe, never buffer" a rule (L145)?
6. Walk the survive pattern: retryable error → fallback → degradation (L168).
7. What does the Vercel AI SDK encode (L160), and why does the shape underneath matter?
8. How is a production integration different from a demo call?

## A Closing Note — The Seam You'll Build On

You now hold the seam between orchestration and provider: **shape → send → stream → survive.** Every AI feature — chat, extraction, agent — is these four patterns, and every resilience lesson in this module (L168–L171) builds on the "survive" pattern you just drew. The next lesson is the toolkit that makes the shape and stream concrete in TypeScript: the Vercel AI SDK (L160).
