# Lesson 348 — AI Chat System

**Interview importance:** ⭐⭐⭐⭐⭐ — "streaming, history, tools, and the stateless backend of a chat product" — the answer is *the chat design*: the protocol run on a chat product (L348).**

L347 built the protocol; this lesson is **its first run**: the AI chat system — streaming, history, tools, and the stateless backend of a chat product (L348): the design (the protocol L347 run, L348), the streaming (L251), the history (L166), and the tools (L201). The AI shape (L173): the chat (L162) — the stateless backend (L348) with the streamed responses (L251). This lesson is the protocol's first run (L348).

The distinction this lesson is built on: a **junior** describes the UI. A **solutions architect** designs the system (L348): the streaming (L251), the history (L166), and the stateless backend (L348) — the protocol (L347) run on the chat (L348).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the clarify: the chat's requirements (L348)
- Explain the streaming: the transport (L251)
- Explain the history: the conversation state (L166)
- Explain the stateless backend: the state outside (L348)
- Explain the AI shape: the chat's design (L348)

## 1. One-Line Definition

**The AI chat system is the protocol run on a chat product (L348) — the clarify (the users L162, the reads and the writes L233, the TTFT L145, L348), the streaming (the SSE L251 transport: the tokens L145 as they're generated, L348), the history (the conversation L166 in the store L268: the messages and the metadata, L348), and the stateless backend (the state outside the server: the session L237 in the store, the server stateless L348) — the chat (L162), designed (L348).**

The one-sentence interview answer: *"The chat system is the protocol, run (L348). The clarify (L348): the users (L162) — the conversationalists (L348); the reads and the writes (L233) — the messages (L348); the latency (L333) — the TTFT (L145) under two seconds (L348). The streaming (L251): the SSE (L251) transport (L348) — the tokens (L145) as they're generated (L251) — the TTFT (L145) is the UX (L162). The history (L166): the conversation (L166) in the store (L268) — the messages (L348), the metadata (L348), the user (L319) — the context (L348) for the next turn (L348). The stateless backend (L348): the server (L348) holds no state (L348) — the session (L237) in the Redis (L269), the history (L166) in the store (L268) — the server (L348) scales (L348) horizontally (L348) without the stickiness (L348). The tools (L201): the chat (L162) with the tools (L201) — the tool loop (L200) in the stream (L348). The AI shape (L173): the chat (L162) — the stateless backend (L348), the streamed responses (L251), the history (L166) in the store (L268), and the tools (L201) — the protocol's (L347) first run (L348)."*

## 2. Mental Model

Think of the chat system as **the restaurant's order window with the streaming kitchen.** The diner (the user, L162) orders (the message, L348) at the window (the gateway, L267). The kitchen (the backend, L348) is stateless (L348): the orders (the messages, L348) go to the ledger (the history, L166) — the kitchen (L348) doesn't remember (L348); the cook (the model, L278) prepares (L348), and the dishes (the tokens, L145) come out as they're ready (the streaming, L251) — the first dish (the TTFT, L145) fast (L348). The kitchen's special requests (the tools, L201) — the pantry (the tools, L315) — called mid-cook (L348). The restaurant works because the kitchen is stateless (L348), the ledger holds the orders (L166), and the dishes stream out (L251).

```text
   the window (the chat, L348)
   ┌────────────────────────────────────────────────────────┐
   │ the diner (the user, L162) · the window (the gateway,  │
   │ L267)                                                  │
   │ the stateless kitchen (L348) · the ledger (the         │
   │ history, L166)                                         │
   │ the streaming dishes (L251) — the first fast (L145)    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the window**: the diner, the stateless kitchen, and the streaming (L348).

## 3. Visual Flow — One Chat Turn

```text
   the user (L162)
        │  the message (L348)
        ▼
   ┌────────────────────── THE GATEWAY (L267) ──────────────────────────┐
   │  the auth (L319) · the rate limit (L318)                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STATELESS BACKEND (L348) ────────────────┐
   │  the session (L237) from the Redis (L269)                         │
   │  the history (L166) from the store (L268)                         │
   │  the context (L348) = the history + the message (L348)            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STREAM (L251) ───────────────────────────┐
   │  the model (L278) → the tokens (L145) as they're generated        │
   │  → the SSE (L251) to the client (L348)                            │
   │  the tools (L201) in the loop (L200)                              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the turn: **gateway → stateless backend → stream** (L348).

## 4. How It Works — The Design, Part by Part

- **The clarify (L348).** The users (L162), the reads and the writes (L233), the TTFT (L145) — the latency budget (L151).
- **The streaming (L251).** The SSE (L251) transport (L348) — the tokens (L145) as they're generated (L251).
- **The history (L166).** The conversation (L166) in the store (L268) — the messages (L348), the metadata (L348), the user (L319).
- **The stateless backend (L348).** The state outside the server (L348): the session (L237) in the Redis (L269), the history (L166) in the store (L268) — the server (L348) scales (L348).

> [!NOTE]
> **The stateless backend is the chat's scale (L348).** The senior answer keeps the server stateless (L348): the state (L348) — the session (L237), the history (L166), the context (L348) — lives outside (L348): the Redis (L269) and the store (L268). The server (L348) — the stateless Lambda (L266) or the container (L295) — scales (L348) horizontally (L348): any instance (L348) serves any turn (L348), no stickiness (L348), no session pinning (L348).

## 5. Real Project Usage

- **A chat product (L162).** The streaming (L251), the history (L166), the stateless backend (L348).
- **A copilot (L164).** The chat (L348) with the tools (L201) — the tool loop (L200).
- **A customer support chat (L350).** The chat (L348) with the RAG (L280) — the grounded answers (L337).
- **A multi-tenant chat (L357).** The per-tenant (L320) sessions (L237) — the isolation (L320).
- **Anything chat (L162).** The design (L348) — the streaming (L251), the history (L166), the stateless (L348).

The through-line: **the design is the chat's** — the streaming, the history, and the stateless backend (L348).

## 6. Interview Explanation

Say it in four moves:

1. **The clarify.** "The conversationalists, the messages, the TTFT (L348)."
2. **The streaming.** "The SSE (L251) — the tokens as they're generated (L145)."
3. **The history.** "The conversation (L166) in the store (L268)."
4. **The stateless.** "The state outside the server — the session (L237), the history (L166)."

## 7. Senior-Level Insights

- **The TTFT is the chat's metric (L145).** The first token (L145) — the perceived latency (L162) — the streaming (L251) and the cache (L171) optimize it (L348).
- **The history is the context (L166).** The conversation (L166) — the messages (L348) and the metadata (L348) — the context (L348) for the model (L278) — the token budget (L149) bounded (L348).
- **The stateless server is the scale (L348).** The state outside (L348) — the horizontal scale (L348) — the Lambda (L266) and the ECS (L295) (L348).
- **The tools are the loop (L201).** The chat (L162) with the tools (L201) — the tool loop (L200) in the stream (L251) — the L200 agent (L200), chat-shaped (L348).
- **The observability is the chat's (L346).** The tokens (L332), the TTFT (L333), and the cost (L334) — the L346 standard (L346), chat-shaped (L348).

## 8. Common Mistakes

- **The stateful server (L348).** The session (L237) in the memory (L348) — the scale (L348) pinned (L348) — the state outside (L348).
- **The buffered response (L251).** The full response (L333) before the send (L348) — the TTFT (L145) dies (L348) — the streaming (L251) is the UX (L162).
- **The unbounded history (L166).** The whole conversation (L166) in the context (L348) — the tokens (L332) explode (L348) — the budget (L149) and the summarization (L166) bound it (L348).
- **The non-streamed tools (L201).** The tool loop (L200) after the response (L348) — the tools (L201) in the stream (L251).
- **The no observability (L346).** The tokens (L332) and the TTFT (L333) unmeasured (L348) — the L346 standard (L346) (L348).

## 9. Best Practices

- **Stream by default** (L251) — the SSE (L251), the TTFT (L145).
- **Store the history** (L166) — the messages (L348) in the store (L268).
- **Keep the server stateless** (L348) — the session (L237) in the Redis (L269).
- **Bound the context** (L149) — the budget (L149) and the summarization (L166).
- **Observe the chat** (L346) — the tokens (L332), the TTFT (L333), the cost (L334).

## 10. Interview Questions

**Q: Walk me through the chat system.**
> A: The protocol, run (L348). The clarify — the users, the messages, the TTFT (L348). The streaming — the SSE (L251), the tokens as they're generated (L145). The history — the conversation (L166) in the store (L268). And the stateless backend — the state outside the server (L348).

**Q: Why the stateless backend?**
> A: The scale (L348): the server (L348) holds no state (L348) — the session (L237) in the Redis (L269), the history (L166) in the store (L268) — so any instance (L348) serves any turn (L348) — the horizontal scale (L348), the Lambda (L266) and the ECS (L295), without the stickiness (L348).

**Q: How does the streaming work?**
> A: The SSE (L251): the gateway (L267) holds the connection (L348), the model (L278) generates (L145), and the tokens (L145) stream (L251) as they're produced (L348) — the TTFT (L145) is the perceived latency (L162). The tools (L201) run in the loop (L200) mid-stream (L348).

**Q: How do you bound the context?**
> A: The history's budget (L149): the messages (L348) that fit the context window (L138) — the token budget (L149) — the oldest (L348) dropped or summarized (L166) — the recent (L348) kept (L348). The context (L348) is bounded; the cost (L334) and the latency (L333) follow (L348).

## 11. Follow-Up Questions

- What's the clarify (L348)?
- Why the stateless backend (L348)?
- How does the streaming work (L251)?
- How do you bound the context (L149)?
- What's the history (L166)?

## 12. Comparison Table — The Chat's Design Choices

| | The stateful (L348) | The stateless (L348) |
|---|---|---|
| The session (L237) | in the memory (L348) | in the Redis (L269) |
| The scale (L348) | the pinned (L348) | the horizontal (L348) |
| The failure (L348) | the session lost (L348) | the any-instance (L348) |
| The use (L348) | the demo (L348) | the production (L348) |

The senior read: **the right column is the chat's scale** — the state outside, the server free (L348).

## 13. Code Example — The Design, Applied

```js
// The chat system (L348) — the stateless backend (L348).
// 1 · THE STATELESS HANDLER (L348) — the Lambda (L266).
export async function handler(event) {
  const { userId, message } = JSON.parse(event.body);

  // 2 · THE STATE OUTSIDE (L348) — the session and the history (L348).
  const session = await redis.get(`session:${userId}`);      // L237, L269
  const history = await store.get(`history:${userId}`);      // L166, L268

  // 3 · THE CONTEXT (L348) — the bounded history (L149).
  const context = buildContext(history, message, TOKEN_BUDGET);  // L348, L149

  // 4 · THE STREAM (L251) — the SSE response (L348).
  const stream = await model.stream(context);                // L278
  return streamResponse(stream, async (tokens) => {          // L251
    await store.append(`history:${userId}`, { message, tokens });  // L166
  });
}

// 5 · THE TOOLS (L201) — the tool loop in the stream (L200).
// 6 · THE OBSERVABILITY (L346) — the tokens (L332), the TTFT (L333).
```

```text
What the reader must SEE — the design, applied:

  redis session:{userId}     → the state outside (L237, L269)
  store history:{userId}     → the history (L166, L268)
  buildContext with the budget → the bounded context (L149)
  model.stream → streamResponse → the SSE (L251)
  the tool loop in the stream → the tools (L200, L201)

  The stateless server, the streamed response (L348).
```

```narrate
4-5: The handler — the stateless Lambda (L266, L348).
7-9: The state — the session and the history fetched from the stores (L237, L166).
11-12: The context — the history bounded by the token budget (L149, L348).
14-18: The stream — the SSE response with the history appended (L251, L166).
20-21: The tools and the observability — the loop and the standard (L200, L346).
```

> [!TIP]
> The pair that defines the chat: **the external session** (the stateless server, L237) and **the streamed response** (the TTFT, L251). **Keep the server stateless, store the history, stream the tokens, bound the context — the chat, designed (L348).**

## 14. Performance Notes

- **The TTFT is the chat's UX (L145).** The first token (L145) — the streaming (L251), the cache (L171), and the provisioned (L278) (L348).
- **The history is the latency's cost (L348).** The context (L348) — the tokens (L332) per turn (L348) — the budget (L149) bounds the cost (L334).
- **The stateless server is the scale (L348).** The horizontal (L348) — the Lambda (L266) and the ECS (L295) (L348).
- **The Redis is the session's speed (L269).** The session (L237) — the sub-millisecond (L243) read (L348).

## 15. Debugging Scenarios

| Symptom | First check (L348) | The lever |
|---|---|---|
| The chat is slow | The TTFT (L145) | The streaming (L251), the cache (L171) |
| The turns lose the context | The history (L166) | The store (L268) |
| The scale pins | The session (L237) | The stateless (L348) |
| The cost explodes | The context (L149) | The budget (L149), the summarization (L166) |
| The tools fail | The loop (L200) | The tool calls (L201) in the stream (L348) |

## 16. Quick Revision Notes

- The AI chat system = **the protocol's first run** (L348): the clarify, the streaming, the history, the stateless.
- The clarify: **the users (L162), the messages, the TTFT (L145)**.
- The streaming: **the SSE (L251) — the tokens as they're generated (L145)**.
- The history: **the conversation (L166) in the store (L268)**.
- The stateless: **the state outside the server (L348) — the session (L237), the history (L166)**.

## 17. Cheat Sheet

```text
AI CHAT SYSTEM = the streaming, the history, the stateless backend

THE CLARIFY (L348)
  the users (L162) — the conversationalists (L348)
  the reads and the writes (L233) — the messages (L348)
  the latency (L333) — the TTFT (L145) under the budget (L151)

THE STREAMING (L251)
  the SSE (L251) transport (L348)
  the tokens (L145) as they're generated (L251)
  the TTFT (L145) — the perceived latency (L162)

THE HISTORY (L166)
  the conversation (L166) in the store (L268)
  the messages (L348) · the metadata (L348) · the user (L319)
  the context (L348) for the next turn (L348)

THE STATELESS BACKEND (L348)
  the state outside the server (L348)
  the session (L237) in the Redis (L269)
  the history (L166) in the store (L268)
  the horizontal scale (L348) — no stickiness (L348)

THE TOOLS (L201)
  the tool loop (L200) in the stream (L251)

INTERVIEW, 4 MOVES
  1 clarify   "the users, the messages, the TTFT (L348)"
  2 streaming "the SSE, the tokens as they're generated (L251)"
  3 history   "the conversation in the store (L166)"
  4 stateless "the state outside the server (L348)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI chat system is **the protocol run on a chat product** (L348): the clarify (L348), the streaming (L251), the history (L166), and the stateless backend (L348)
> - **The clarify** (L348): the users (L162), the reads and the writes (L233), and the TTFT (L145) — the latency budget (L151)
> - **The streaming** (L251): the SSE (L251) transport (L348) — the tokens (L145) as they're generated (L251) — the TTFT (L145) is the UX (L162)
> - **The history** (L166): the conversation (L166) in the store (L268) — the messages (L348), the metadata (L348), the user (L319)
> - **The stateless backend** (L348): the state (L348) outside the server (L348) — the session (L237) in the Redis (L269), the history (L166) in the store (L268) — the horizontal scale (L348) without the stickiness (L348)
> - The AI shape (L348): the chat (L162) — the stateless backend (L348), the streamed responses (L251), the history (L166), and the tools (L201) — the protocol's (L347) first run (L348)

## Check your understanding

Answer these without looking back.

1. What's the clarify (L348)?
2. Why the stateless backend (L348)?
3. How does the streaming work (L251)?
4. How do you bound the context (L149)?
5. What's the history (L166)?
6. What's the TTFT (L145)?
7. What's the session (L237)?
8. What is the protocol's first run (L348)?

## A Closing Note — The Window, Streaming

You now hold the design: **the clarify, the streaming, the history, and the stateless — with the kitchen free and the dishes streaming.** The order window is open — and the first dish is fast (L348).

Next: the knowledge's design — RAG Platform (L349).
