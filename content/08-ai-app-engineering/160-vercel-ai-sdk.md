# Lesson 160 — The Vercel AI SDK

**Interview importance:** ⭐⭐⭐⭐ — "what do you use to build AI UIs?" — the Vercel AI SDK is the standard TypeScript answer; knowing what it *is* and what it *wraps* (L159's patterns) is the senior understanding.

Lesson 159 gave you the integration patterns (shape, send, stream, survive). This lesson is the **standard TypeScript toolkit that encodes them**: the Vercel AI SDK — `generateText`, `streamText`, `useChat`, `useCompletion`, and the provider abstraction it ships. It is the pre-built version of L155's abstraction and L159's patterns — and knowing what it wraps is what lets you use it well, debug it, and know when to step outside it.

The distinction this lesson is built on: a **user** calls `streamText` and it works. A **solutions architect** knows the SDK's layers — the AI SDK core (provider-agnostic), the provider packages (OpenAI, Anthropic, Google, L152–L154), the React hooks (`useChat`), and the streaming protocol it speaks — and can place it in the L158 architecture, extend it with tools and structured output, and handle what it deliberately leaves to you (auth, budgets, evals).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what the Vercel AI SDK is: a provider-agnostic toolkit that encodes L159's patterns and L155's abstraction
- Use the core functions: `generateText`, `streamText`, and the `useChat` hook
- Explain the streaming protocol it speaks (the AI SDK wire format, L145)
- Place it in the L158 architecture: server-side call, streamed to the client, gateway before it
- Know what the SDK does *not* do — auth, budgets, rate limits, evals — and where those live (L149, L170, L172, L343)

## 1. One-Line Definition

**The Vercel AI SDK is the standard TypeScript toolkit for building AI applications — a provider-agnostic core (`generateText`, `streamText`) and React hooks (`useChat`) that encode the integration patterns of L159 and the provider abstraction of L155, speaking a standard streaming protocol to the client.**

The one-sentence interview answer: *"The Vercel AI SDK is the pre-built integration: `streamText` on the server shapes and streams a provider call through the abstraction (L155), and `useChat` on the client renders the stream and manages the message state (L162). It speaks a standard wire format so the server and client agree on text, tool calls, and finish reasons (L145). It encodes L159's patterns — and it deliberately leaves the gateway concerns — auth, budgets, rate limits, evals — to you."*

## 2. Mental Model

Think of the Vercel AI SDK as **the plumbing between your app and every provider — pre-installed** — where you still choose the fixtures (the model, L157), the safety valves (the gateway, L158), and the inspector (the evals, L343).

```text
   your React component
        │  useChat() — the client side (L162)
        ▼
   ┌──────────────────────────────────────────┐
   │ THE AI SDK (the plumbing)                │
   │  streamText()  server side               │
   │  ↓ normalises the dialect (L155)         │
   │  ↓ encodes L159's shape/stream patterns  │
   ├──────────┬──────────┬────────────────────┤
   │ OpenAI   │ Anthropic│ Google             │
   │ provider │ provider │ provider           │
   │ (L152)   │ (L153)   │ (L154)             │
   └──────────┴──────────┴────────────────────┘
        │
        ▼
   the provider — but auth, budget, rate limit,
   and evals are YOURS (L149, L170, L172, L343)
```

The mental model is **plumbing + your responsibilities**: the SDK wires the pipes (server ↔ client ↔ provider) and normalises the dialects (L155); you install the safety valves (gateway, L172), the meters (budget, L149), and the inspector (evals, L343).

## 3. Visual Flow — A Request Through the SDK

```text
   user types a message
        │
        ▼
   ┌───────────────────────────────────────────────┐
   │ CLIENT · useChat()                             │
   │  manages message state (L162, L165)            │
   │  POSTs to your /api/chat route                 │
   └──────────────────┬─────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ YOUR SERVER · the route                        │
   │  gateway: auth, budget, rate limit (L149, L172)│ ← YOURS
   │  streamText({ model, messages, tools })        │
   └──────────────────┬─────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ THE SDK · provider layer (L155)                │
   │  normalises the dialect (L152-154)             │
   │  returns a standard stream                     │
   └──────────────────┬─────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ CLIENT · useChat() renders the stream          │
   │  text appears (L162) · tool calls shown        │
   │  cancellation wired (L145)                     │
   └───────────────────────────────────────────────┘
```

The flow is L159's patterns, pre-wired: **client hook → your gateway route → the SDK's provider layer → streamed back.** The SDK owns the plumbing; the route owns the gateway.

## 4. How It Works — The SDK's Layers

- **The AI SDK core (`ai` package)** — provider-agnostic: `generateText` (one-shot), `streamText` (streaming, L145), `tool` (tool definitions, L144), `generateObject`/`streamObject` (structured output, L143). This is the abstraction (L155) shipped as a library.
- **Provider packages** (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, …) — the adapters (L152–L154): each speaks its provider's dialect, normalised to the core's shape.
- **The React hooks (`ai/react`)** — `useChat` (message state + stream rendering, L162, L165), `useCompletion` (single-prompt completion). The client side of the plumbing.
- **The wire format** — the SDK defines a standard streaming protocol between server and client: text deltas, tool-call parts, finish reasons (L145). Both sides speak it, so the client renders what the server streams without knowing the provider.
- **What it deliberately leaves to you** — auth, rate limiting (L170), token budgeting (L149), the key (L172), and evals (L343). The SDK is plumbing, not governance.

> [!NOTE]
> **The honest framing: the SDK is L155 + L159, shipped.** The abstraction (one interface over providers) and the integration patterns (shape, send, stream) are exactly what the SDK encodes. That's why this lesson comes after them — knowing the principle is what lets you use the SDK as a tool instead of a black box, and know when to step outside it (custom gateway, custom evals, non-React clients).

## 5. Real Project Usage

- **Chat products.** `useChat` + `streamText`: message state, streaming, cancellation — the L162 felt-quality, pre-wired.
- **Tool-calling apps (L164).** `tool()` definitions + `streamText`: the SDK surfaces tool calls in the stream, and `useChat` renders them as pending → executed.
- **Structured generation (L163).** `generateObject`/`streamObject` with a Zod schema: typed output, validated, end to end (L143).
- **Multi-provider apps (L155).** Swap `@ai-sdk/openai` for `@ai-sdk/anthropic` by changing one import + the model — the abstraction, shipped.
- **Agents (L200).** `streamText` with tools and a loop; the SDK's stream carries the tool-call parts that the agent loop (L164) drives.

The through-line: **the SDK is the default plumbing for TypeScript AI apps** — and the architect's job is placing it in the L158 architecture: gateway before it, evals after it, and the pattern-knowledge (L159) to debug it.

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "The Vercel AI SDK is the standard TypeScript toolkit — a provider-agnostic core and React hooks that encode the integration patterns (L159) and the provider abstraction (L155)."
2. **The layers.** "`streamText` on the server shapes and streams; `useChat` on the client manages message state and renders; the provider packages normalise the dialects (L152–L154); and a standard wire format carries text, tool calls, and finish reasons (L145)."
3. **The placement.** "It lives in the L158 architecture as the orchestration-to-provider seam: my route does the gateway work — auth, budget, rate limit (L149, L172) — then calls `streamText`."
4. **The boundary.** "The SDK is plumbing, not governance: it deliberately leaves auth, budgets, rate limits, and evals to me — which is exactly where the architecture's security and cost live."

## 7. Senior-Level Insights

- **The SDK is L155 + L159 shipped — and that's its real value.** The abstraction (one interface over providers, L155) and the integration patterns (shape/stream, L159) are production-hardened and maintained. Adopting it is adopting those patterns without reimplementing them.
- **The wire format is the contract (L145).** Text, tool-call parts, finish reasons — the server and client agree on a standard stream. That's why `useChat` can render tool progress (L164) and cancellation (L145) without custom protocol code.
- **The SDK's boundary is a *design* boundary, not a limit.** It stops at the gateway — deliberately. Auth, budgets (L149), rate limits (L170), and evals (L343) are *yours*, because they're *your* security and cost model (L158). The senior answer names that boundary.
- **The SDK is a pattern to know, not a black box to trust.** `streamText` wraps L152–L154's shapes; `generateObject` wraps L143. When it misbehaves, the fix is in the underlying pattern, not the import. That's why L159 precedes this lesson.
- **It's the default, not the only answer.** Custom clients, non-React stacks, or bespoke gateway logic may step outside the SDK — but the *patterns* (shape, send, stream, survive) stay. The SDK encodes them; it doesn't own them.

## 8. Common Mistakes

- **Calling the SDK from the client.** `streamText` in a component — the key leaks (L172), the budget is gone (L149). The SDK call lives in the server route, behind the gateway.
- **Skipping the gateway.** Using `streamText` without auth/budget/rate-limit (L149, L170) — the SDK is plumbing; the governance is yours.
- **Treating the SDK as a black box.** Debugging `streamText` without knowing the underlying shape (L152–L154) — the fix is in the pattern.
- **Not using the wire format's parts.** Ignoring tool-call and finish-reason parts (L145) — tool loops (L164) and truncation handling (L145) silently break.
- **Provider lock-in by import.** Hardcoding one provider package without the abstraction's intent (L155) — a provider swap becomes a refactor.
- **Assuming the SDK does evals.** It streams; it doesn't verify (L343) — the health inspector is still yours.

## 9. Best Practices

- **Call the SDK in the server route, behind the gateway** (L158, L172) — never in the client.
- **Enforce auth, budget (L149), and rate limits (L170) before `streamText`.**
- **Use `tool()` for tool definitions (L164)** and `generateObject`/`streamObject` with a Zod schema for structured output (L163, L143).
- **Handle the stream's parts** — text, tool calls, finish reason (L145) — not just the text.
- **Keep providers behind the abstraction's intent** — one provider package per adapter, swapped by config (L155).
- **Add your own evals (L343)** — the SDK streams; you verify.

## 10. Interview Questions

**Q: What is the Vercel AI SDK?**
> A: The standard TypeScript toolkit for AI apps — a provider-agnostic core (`streamText`, `generateObject`) and React hooks (`useChat`) that encode the integration patterns (L159) and provider abstraction (L155), speaking a standard wire format for text, tool calls, and finish reasons (L145).

**Q: How does it fit into an AI app's architecture?**
> A: It's the orchestration-to-provider seam (L158). My route does the gateway work — auth, budget (L149), rate limit (L170) — then calls `streamText`, which normalises the provider dialect (L152–L154) and streams back through the standard format. `useChat` renders it client-side (L162). The SDK is the plumbing; the gateway and evals are mine.

**Q: What does the SDK *not* do?**
> A: Deliberately, the governance: authentication (L172), token budgeting (L149), rate limiting (L170), and evals (L343). It's plumbing, not a security or cost boundary. That's not a gap — it's the design. Those are *my* architecture's concerns, and they live in my gateway, not the SDK.

**Q: When would you step outside the SDK?**
> A: When the pattern it encodes needs to change — a custom client (non-React), a bespoke gateway, or deeper control of the stream. But the *patterns* stay: shape, send, stream, survive (L159). The SDK encodes them; stepping outside means reimplementing the pattern deliberately, not abandoning it.

## 11. Follow-Up Questions

- How does `streamText` relate to the raw provider call (L152–L154)?
- How do tool-call parts flow through the wire format (L145, L164)?
- How does `generateObject` implement structured output (L143, L163)?
- Where does the gateway sit relative to the SDK (L158, L172)?
- How do you eval what the SDK streams (L343)?

## 12. Comparison Table — SDK vs Raw Integration

| | Vercel AI SDK | Raw provider call (L152–L154) |
|---|---|---|
| Provider abstraction (L155) | built-in (provider packages) | you build it |
| Streaming (L145) | standard wire format | per-provider SSE |
| Client state (L162, L165) | `useChat` | you build it |
| Tool parts (L164) | first-class | reassemble yourself |
| Structured output (L143) | `generateObject` (Zod) | `response_format` per provider |
| Gateway (L149, L172) | **yours either way** | **yours either way** |

The senior read: **the SDK saves the plumbing; the gateway is yours either way.** That's the boundary — and it's why the SDK slots into L158's architecture without changing where security and cost live.

## 13. Code Example — The SDK, Server and Client

```js
// Server route: the gateway first, the SDK second (L158, L172).
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';          // one provider adapter (L155)

export async function POST(req) {
  const { messages } = await req.json();
  await auth(req);                                  // L172 — the gateway is yours
  const ok = await enforceBudget(messages);         // L149 — before the SDK
  if (!ok) return error(429, 'over budget');

  const result = streamText({
    model: openai('gpt-4o-mini'),                   // the tier, chosen by L157
    system: 'Answer concisely. Use tools when needed.',
    messages,                                       // the conversation (L166)
    tools: {                                        // tool definitions (L164)
      get_stock: tool({
        description: 'Current price of a US ticker.',
        parameters: z.object({ ticker: z.string() }),
        execute: async ({ ticker }) => fetchPrice(ticker),  // YOUR execution
      }),
    },
  });

  return result.toDataStreamResponse();             // the standard wire format (L145)
}
```

```jsx
// Client: useChat renders the stream and tool calls (L162, L164).
import { useChat } from 'ai/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  // messages[i].parts → text + tool-call parts, rendered as they stream (L145, L164)
  return (
    <div>
      {messages.map((m) => <Message key={m.id} message={m} />)}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

```text
What the reader must SEE — the boundary, in code:

  server:  auth + budget (YOURS, L149/L172) → streamText (the SDK)
  client:  useChat (the SDK) → renders parts: text + tool calls (L162, L164)
  provider: openai('gpt-4o-mini') — one adapter, swapped by config (L155)

  The SDK owns the plumbing; the gateway and evals are yours.
```

```narrate
8-9: The gateway runs BEFORE the SDK — auth and budget are the route's job, not the library's (L149, L172).
10-11: streamText is the shape+stream pattern (L159), normalising the provider dialect (L155).
15-21: Tool definitions with YOUR execute — the model declares, your server runs (L144, L164).
25-26: The standard wire format carries text + tool parts to the client (L145).
30-33: useChat is the client plumbing — message state and stream rendering (L162, L165).
```

> [!TIP]
> The file shows the whole module's boundary in one place: **the SDK between your gateway and the provider, with the gateway (L149/L172) and evals (L343) as yours.** That placement is the architecture — the SDK is a tool inside it, not the architecture itself.

## 14. Performance Notes

- **The SDK adds negligible overhead** — it's a thin normalisation over the provider call (L159). The latency is the provider's, not the SDK's (L151).
- **The wire format preserves streaming (L145)** — `toDataStreamResponse` pipes, it doesn't buffer; TTFT is preserved end to end.
- **`streamObject` (L163) can add latency** on complex schemas — the constrained generation cost (L143, L151); keep schemas flat.
- **The gateway still gates TTFT (L151)** — the auth/budget path must be fast; the SDK doesn't help or hurt that (it's yours, L158).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Key in the client | `streamText` called in a component (L172) | Move to the server route |
| No budget enforced | Gateway skipped before the SDK (L149) | Add the budget check in the route |
| Tool calls don't render | Tool-call parts ignored (L164) | Render `messages[i].parts`, not just text |
| Structured output invalid | `generateObject` schema loose (L163) | Tighten the Zod schema (L143) |
| Stream arrives buffered | The route collects before returning (L145) | Use `toDataStreamResponse()` (pipe) |

## 16. Quick Revision Notes

- The Vercel AI SDK = **L155's abstraction + L159's patterns, shipped** as a TypeScript toolkit.
- Layers: **core (`streamText`/`generateObject`), provider packages (L152–L154), React hooks (`useChat`), wire format (L145).**
- Placement: **server route, behind the gateway (L158)** — auth, budget (L149), rate limit (L170) are yours.
- **The wire format carries text, tool-call, and finish-reason parts** (L164).
- **The SDK deliberately doesn't do governance** — auth, budgets, rate limits, evals (L343) are the architecture's.
- The SDK is a **pattern to know, not a black box to trust** — L159 is the shape underneath.

## 17. Cheat Sheet

```text
VERCEL AI SDK = L155 + L159, shipped

LAYERS
  core        generateText · streamText · tool · generateObject (L143, L144)
  providers   @ai-sdk/openai · anthropic · google  (L152-154)
  hooks       useChat · useCompletion  (L162, L165)
  wire        text + tool-call parts + finish reason (L145)

PLACEMENT (in L158's architecture)
  client   useChat()      → renders the stream (L162)
  server   gateway first  → auth (L172) · budget (L149) · rate limit (L170)
           then streamText → the provider seam
  evals    after the stream, yours (L343)

WHAT THE SDK OWNS
  the plumbing: shape, stream, provider normalisation, client state

WHAT IT DELIBERATELY LEAVES YOU
  auth (L172) · budgets (L149) · rate limits (L170) · evals (L343)

RULES
  call the SDK in the server route, never the client
  render the parts (text + tool calls), not just text (L164)
  know the shape underneath (L152-154, L159)
  the SDK is a tool inside the architecture, not the architecture

INTERVIEW, 4 MOVES
  1 definition "L155 + L159, shipped as a toolkit"
  2 layers    "core, providers, hooks, wire format"
  3 placement "server route behind the gateway"
  4 boundary  "governance is yours — auth, budget, evals"
```

## 18. Key Takeaways

> [!RECAP]
> - The Vercel AI SDK is **the provider abstraction (L155) and integration patterns (L159), shipped** — a provider-agnostic core and React hooks speaking a standard wire format (L145)
> - Its layers: **`streamText`/`generateObject` (core), provider packages (L152–L154), `useChat` (client), and the wire format**
> - It lives in the L158 architecture as the **orchestration-to-provider seam**: your route does the gateway work — auth, budget (L149), rate limit (L170) — then calls the SDK
> - **The SDK deliberately leaves governance to you** — auth, budgets, rate limits, and evals (L343) are the architecture's, not the library's
> - **The wire format carries tool-call and finish-reason parts** (L145, L164) — render the parts, not just the text
> - The SDK is a **pattern to know, not a black box** — L159 is the shape underneath, and the gateway is yours either way

## Check your understanding

Answer these without looking back.

1. What is the Vercel AI SDK, in one sentence?
2. Name its four layers, and what each one does.
3. Where does the SDK sit in the L158 architecture, and what stays yours?
4. Why is the wire format a contract (L145)?
5. What does `generateObject` wrap, and what's the schema for (L143, L163)?
6. Why must `streamText` live in the server route, never the client (L172)?
7. What governance does the SDK deliberately leave you, and why?
8. When would you step outside the SDK — and what stays the same?

## A Closing Note — The Plumbing, and the Architecture Around It

You now hold the standard plumbing of TypeScript AI apps: **the SDK, its layers, its placement behind your gateway, and its deliberate boundary.** The senior value is the placement — the SDK is a tool inside the L158 architecture, not the architecture itself, and the gateway (L149, L170, L172) and evals (L343) are yours either way.

Next: the patterns the SDK speaks — streams, parts, and the tool-call UI state machine (L161), then the streaming UI that makes it feel real (L162).
