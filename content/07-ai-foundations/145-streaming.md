# Lesson 145 — Streaming Responses

**Interview importance:** ⭐⭐⭐⭐ — "why does ChatGPT stream, and how would you do it?" is the latency question that decides whether your product *feels* fast; the answer is TTFT, tokens, and the SSE pipeline.

Lesson 144 gave the model the ability to act. This lesson is about how it *speaks*: not all at once, but **token by token, over a stream** — the single biggest perceived-latency lever in AI products. A chat that streams *feels* instant even when the full answer takes ten seconds; a chat that doesn't feels broken at two. Every AI product you've used streams, and every AI product you build should too.

The distinction this lesson is built on: a **demo builder** uses the SDK's streaming flag and renders text. A **solutions architect** knows the *mechanics* — time-to-first-token, SSE framing, stream parts (text / tool calls / deltas), cancellation, and the error modes that only exist mid-stream — and can design the streaming layer as deliberately as any other interface.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain streaming: the model emits tokens as it generates them, over SSE, instead of waiting for the full completion
- Explain TTFT (time-to-first-token) and why it dominates perceived latency
- Describe a stream's parts: text deltas, tool-call deltas, finish reasons — and how they compose
- Implement streaming end to end: client → SSE → UI, with cancellation and error handling
- Decide *when* to stream — and when not to (short answers, machine-facing calls)

## 1. One-Line Definition

**Streaming is delivering the model's output incrementally — token by token — over a Server-Sent Events (SSE) connection, so the user sees text appearing as it's generated instead of waiting for the whole response.**

The one-sentence interview answer: *"Instead of waiting for the full completion, the provider sends each token as it's produced over an SSE stream. The user sees the first token in well under a second — time-to-first-token — and the rest fills in. Perceived latency collapses even though total latency is unchanged. The UI renders deltas; the stream carries text, tool calls, and a finish reason."*

## 2. Mental Model

Think of streaming as **watching a printer, not waiting for a letter.** A non-streaming request mails you the whole letter when it's done; streaming sits next to the printer and reads each line as it prints. The *total* time is the same — but the experience is completely different, because the wait becomes progress.

```text
   Non-streaming (wait, then all at once)      Streaming (appears as generated)
   ┌────────────────────────────────────┐      ┌────────────────────────────────────┐
   │ user: "explain closures"           │      │ user: "explain closures"           │
   │                                    │      │                                    │
   │    [ 3s of silence            ]    │      │ 0.3s: "A closure"                  │
   │    [ 5s of silence            ]    │      │ 0.6s: " is a function"             │
   │    [ 8s of silence            ]    │      │ 1.0s: " that remembers"            │
   │                                    │      │ 1.5s: " its lexical scope…"        │
   │ 8s: the whole answer appears       │      │ …                                  │
   └────────────────────────────────────┘      │ 8s: the same answer, fully         │
        feels broken after ~2s                 │     rendered — but it never felt   │
                                               │     like a wait                    │
                                               └────────────────────────────────────┘
```

The paradox to name: **total latency is identical; perceived latency is transformed.** That's why streaming is not a performance feature — it's a *product* feature.

## 3. Visual Flow — The Streaming Pipeline

```text
   Browser / app                     Your server                  Provider
   ┌──────────────┐   POST /chat    ┌──────────────┐   stream    ┌──────────────┐
   │ user types   │ ──────────────▶ │ holds the    │ ──────────▶ │ model        │
   │ question     │                 │ SSE pipe     │  (SSE)      │ generates    │
   └──────┬───────┘                 └──────┬───────┘             │ token by     │
          │                                │                     │ token        │
          │                                │  event: data: {"delta":"A"}       │
          │                                │  event: data: {"delta":" clo"}    │
          │                                │  event: data: {"delta":"sure"}    │
          │                                │  event: data: [DONE]              │
          │                                │◀──────────────────────────────────│
          ▼                                ▼
   UI renders each delta as it lands → the text "types itself"
```

The pipeline has three hops: **client ↔ your server ↔ provider.** Where the SSE boundary sits is an architecture decision (your server proxying is the common shape; direct client→provider is possible but leaks your key — L172). The deltas flow back the same way, and the UI renders them as they arrive.

## 4. How It Works — TTFT, Deltas, and the Finish Reason

- **Time-to-first-token (TTFT)** is the interval from *send* to *first token received*. It's dominated by input processing — the whole prompt must be attended over before generation starts (L136's forward pass, L138's O(n²)). TTFT is the number users actually feel; it's why a 100K-token RAG context "feels slow" even when streaming is on.
- **The stream is a sequence of *deltas*, not answers.** Each SSE event carries a fragment: a text delta (`"A clo"`), a tool-call fragment (`{"name":"get_","arguments":"st"}`), or metadata. The client accumulates deltas to render text and reassembles tool-call fragments to execute them (L144).
- **The stream ends with a finish reason** — `stop`, `length` (hit max_tokens), `tool_calls` (the model wants tools), `content_filter`. The finish reason is how your code knows *why* the generation ended: `length` means "truncated, tell the user or continue", `tool_calls` means "don't render, execute the tool and continue the loop" (L144, L200).
- **Cancellation is first-class.** The user can stop generation mid-stream; the client closes the connection, the server aborts the upstream call. A chat UI without cancellation is a user holding a button that does nothing.

> [!NOTE]
> **The tool-call stream is a reassembly problem.** Tool arguments arrive as *fragments* across many events — you must buffer them until the call is complete before parsing. The SDKs (L160) do this for you; doing it by hand is a classic source of "my tool call is malformed" bugs (L144, L161).

## 5. Real Project Usage

- **Every chat product.** ChatGPT, Claude, Gemini — all stream. The typing effect is not decoration; it's TTFT made visible, and it keeps users from abandoning at 2 seconds.
- **Copilots and assistants.** Streaming + tool calling (L144): the model declares a tool call mid-stream, your UI shows "checking the database…", then the *next* streamed segment is the answer. The stream carries the whole conversation state.
- **Voice and latency-sensitive UIs.** The faster the first token, the more natural the interaction; streaming is the base layer that voice (and TTFT-optimised models, L151) build on.
- **Long generations.** Summaries, reports, code — minutes of output, rendered as they're produced, with a Stop button. Streaming turns a 3-minute wait into a 3-minute *process* the user can watch and interrupt.
- **Machine-facing calls? Often *not* streamed.** If the output feeds a parser (L143) or a tool, waiting for the full response is simpler and cheaper — streaming is a UI feature first.

The through-line: **stream when a human watches; wait when a machine consumes.** That one rule covers most decisions.

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "Streaming delivers tokens over SSE as they're generated, instead of returning the whole completion at once."
2. **The why.** "Total latency is unchanged, but perceived latency collapses: the user sees the first token in TTFT — well under a second — and the rest fills in. Without streaming, a two-second wait feels broken."
3. **The mechanics.** "The stream carries deltas — text fragments, tool-call fragments, and a finish reason. The UI accumulates deltas; tool fragments get reassembled and executed (L144); the finish reason tells me *why* it ended — stop, length, or tool_calls."
4. **The design.** "I stream when a human watches the output, and wait for full responses when a machine parses them. And cancellation is first-class — a chat UI without Stop is a broken product."

## 7. Senior-Level Insights

- **TTFT is the product metric.** Users don't measure total latency; they feel the first token. Optimising TTFT — prompt caching (L171), input truncation (L138), smaller models for the first pass (L148) — is the latency engineering that users can actually perceive.
- **Streaming changes the *state model* of your UI.** The component isn't "wait for answer" — it's "append delta, handle interruption, render tool progress, handle stream error". The AI SDK's `useChat` (L160) exists because this state machine is subtle and reimplementing it is where bugs live.
- **The finish reason is a contract.** `length` vs `stop` vs `tool_calls` changes what your code does next. Handling it is the difference between "the answer just cuts off" and "the UI says 'I ran out of room, continue?'".
- **Streaming is the base layer for the felt-quality of AI apps.** Cursor-like tools, voice, agents that narrate their steps — all of them are streaming plus a richer delta vocabulary. Master the base and the richer layers (L162, L161) are extensions, not mysteries.

## 8. Common Mistakes

- **Streaming when a machine consumes the output.** A parser doesn't care about TTFT; it wants the full, valid JSON. Stream to humans, wait for machines (L143).
- **Forgetting cancellation.** A long generation with no Stop button is a hostage situation; the abort path is as important as the render path.
- **Ignoring the finish reason.** Rendering text and ignoring `length`/`tool_calls` silently breaks tool loops and truncation UX.
- **Assembling tool args naively.** Fragments must be buffered to completion before parsing — "my tool call is malformed" is almost always this.
- **Not handling mid-stream errors.** The provider dies at token 40 of 500; if the UI has no recovery path, the user sees a half-answer with no explanation (L168).

## 9. Best Practices

- **Stream to humans, wait for machines.** If a person reads it, stream; if code parses it, don't.
- **Treat TTFT as the metric.** Measure and optimise it (L151); a prompt-cache hit that cuts TTFT is a product win users can feel.
- **Handle the finish reason explicitly.** `stop` → done; `length` → "continued" UX; `tool_calls` → execute and loop (L144).
- **Buffer tool fragments until complete.** Let the SDK do it, or do it right — never parse mid-stream.
- **Make cancellation a first-class UI control** — and wire it to abort the upstream call, not just hide the text.
- **Handle stream errors with a recovery path** — a "resume" or "try again" that keeps the conversation (L168).

## 10. Interview Questions

**Q: Why does streaming matter so much?**
> A: Because perceived latency is dominated by the first token. Streaming collapses the wait — the user sees text appearing in under a second — even though total latency is the same. A non-streaming chat feels broken after two seconds of silence.

**Q: What is TTFT?**
> A: Time-to-first-token — the interval from sending the request to receiving the first token. It's dominated by input processing: the whole prompt must be attended over before generation starts (L136, L138). It's the number users actually feel, so it's the metric I optimise for latency-sensitive products (L151).

**Q: What's in a stream, besides text?**
> A: Deltas — text fragments, tool-call fragments that need reassembly (L144), metadata, and a finish reason. The finish reason tells the client *why* generation ended: stop, length (truncated), or tool_calls (execute the tool and continue the loop).

**Q: When would you NOT stream?**
> A: When the output feeds a machine — a parser (L143), a tool result, a background job. A parser wants the full valid payload, not fragments; streaming adds complexity for no perceived gain. Stream to humans, wait for machines.

## 11. Follow-Up Questions

- How does streaming interact with tool calling — what does a tool-call delta look like?
- What's the architecture of proxying the stream through your server (L172)?
- How do you handle cancellation and mid-stream errors?
- How does prompt caching (L171) improve TTFT?
- What does the AI SDK's `useChat` (L160) do for you, and what's left to you?

## 12. Comparison Table — Streaming vs Full Response

| | Streaming | Full response |
|---|---|---|
| Perceived latency | TTFT — feels instant | feels broken past ~2s |
| Total latency | identical | identical |
| UI model | append deltas | render once |
| Tool calls | fragmented, reassemble | complete |
| Parser-friendly | no | yes |
| Cancellation | first-class | n/a |
| Best for | humans reading | machines parsing |

The senior read: **it's not faster, it's *felt* faster** — and the decision is about who consumes the output, not about performance.

## 13. Code Example — Streaming End to End

```js
// The streaming pipeline, minimal but complete: provider → server → client.
// Server route: proxying the model's SSE stream to the browser.

import { OpenAI } from 'openai';
const openai = new OpenAI();

// A minimal SSE-serialised response from your server route.
export async function POST(req) {
  const { prompt } = await req.json();

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    stream: true,                    // ← the whole feature
  });

  // Read the stream, forward each delta as an SSE event.
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

```text
What the reader must SEE — the three facts of streaming:

  stream: true        → the provider emits tokens as they're made
  for await … chunk   → each chunk carries a text delta
  SSE framing         → "data: …\n\n" is the wire protocol the browser EventSource reads
```

```narrate
13: The one flag that turns a completion into a stream — tokens arrive as produced.
16-19: The server forwards each delta as an SSE event; the browser EventSource receives them.
22-24: [DONE] is the stream terminator — the client knows the generation finished.
```

> [!TIP]
> On the client, the AI SDK's `useChat` (L160) handles this delta loop, cancellation, and tool-call reassembly for you. Writing it by hand once — as above — is how you understand what the SDK does; shipping it by hand is how you reimplement a subtle state machine.

## 14. Performance Notes

- **TTFT is the lever users feel.** Prompt caching (L171), lean system prompts (L142), and input truncation (L138) all cut TTFT; total time barely matters to a user who's watching words appear.
- **Streaming is not faster overall.** It adds framing overhead and keeps a connection open; for machine-facing calls it's pure overhead (L143).
- **First-token latency is dominated by input size** (L136's O(n²)); a big RAG context streams slowly *to the first token*, then fast. That's why retrieval quality (L189) is also a latency lever.
- **Throughput after TTFT is about tokens/sec** — smaller/faster models (L148), batching, and hardware. Two knobs: get the first token sooner, then pour the rest faster (L151).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Text appears all at once | Streaming not enabled, or proxy buffers the stream | Check `stream: true`; disable response buffering server-side |
| Long pause, then everything | TTFT dominated by a huge input (L138) | Shrink the input; prompt-cache the prefix (L171) |
| Tool call comes back malformed | Tool fragments parsed before reassembly | Buffer until the call is complete (L144) |
| Generation stops mid-sentence, no error | Finish reason is `length` (max_tokens) | Handle `length` in the UI; raise the budget or continue |
| Stream dies at token 40 | Mid-stream provider error / network drop (L168) | Recovery path: resume with the partial in context |
| Stop button does nothing | Cancellation not wired to abort | Abort the upstream call, not just the UI text |

## 16. Quick Revision Notes

- Streaming = **tokens as generated, over SSE** — total time same, *felt* time transformed.
- **TTFT** is the perceived-latency metric — dominated by input processing (L138).
- The stream carries **deltas** (text, tool fragments) and a **finish reason** (`stop`/`length`/`tool_calls`).
- **Tool fragments need reassembly** before parsing (L144).
- **Stream to humans, wait for machines** — the decision rule.
- **Cancellation and mid-stream errors are first-class** design problems (L168).

## 17. Cheat Sheet

```text
STREAMING = the printer, not the letter
  total latency identical · perceived latency transformed

TTFT
  send → first token      dominated by input processing (L138)
  the metric users feel   → cache the prefix (L171), trim input

THE STREAM
  delta        a text fragment ("A clo")
  tool delta   tool-call fragments → reassemble → execute (L144)
  finish reason  stop | length | tool_calls | content_filter
  [DONE]       the terminator

WIRE FORMAT (SSE)
  data: {"delta":"A clo"}\n\n
  data: [DONE]\n\n

DECISION RULE
  human reads it   → stream
  machine parses it→ wait for the full response (L143)

DESIGN RULES
  cancellation is first-class (abort the upstream call)
  handle finish reasons explicitly (length ≠ stop)
  recovery path for mid-stream errors (L168)

INTERVIEW, 4 MOVES
  1 definition "tokens over SSE as generated"
  2 why        "TTFT → felt instant"
  3 mechanics  "deltas + finish reason"
  4 design     "humans stream, machines wait"
```

## 18. Key Takeaways

> [!RECAP]
> - Streaming delivers **tokens as they're generated, over SSE** — total latency unchanged, perceived latency transformed
> - **TTFT is the metric users feel**, and it's dominated by input processing — so prompt caching (L171) and lean inputs (L138) are the latency levers that matter
> - The stream carries **text deltas, tool-call fragments, and a finish reason** — and tool fragments must be reassembled before execution (L144)
> - **Stream to humans, wait for machines** — a parser wants the full payload, not fragments (L143)
> - **Cancellation and mid-stream errors are first-class design problems** (L168), not edge cases
> - Streaming is the **base layer of every AI product's felt quality** — the typing effect, the agent narration, the voice — and the AI SDK's `useChat` (L160) exists because the state machine is worth not reimplementing

## Check your understanding

Answer these without looking back.

1. Explain streaming and the paradox of its latency.
2. What is TTFT, and what dominates it?
3. Name the things a stream can carry, besides text deltas.
4. Why must tool-call fragments be buffered before parsing?
5. What does the finish reason tell you, and what are the three main values?
6. When would you *not* stream?
7. Why is cancellation a first-class design problem?
8. How does prompt caching (L171) improve the felt quality of a stream?

## A Closing Note — The Product Layer of Latency

Streaming is the layer where engineering becomes *feel*: it's the difference between a product that seems to think and one that seems broken, at identical total latency. Hold the two facts together — **TTFT is what users feel, and TTFT is dominated by input processing** — and the whole latency toolbox (L151) becomes obvious: cache the prefix, trim the context, get the first token out fast, then stream the rest.

Next: the input side of the same coin — multimodal models, and what happens when the token stream starts from a picture, an audio clip, or a PDF instead of text.
