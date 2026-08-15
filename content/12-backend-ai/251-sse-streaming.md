# Lesson 251 — SSE & Streaming Protocols

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the transport behind streaming chat?" — the answer is *SSE*: server-sent events — the one-way stream that powers every streaming chat — and why not WebSockets (L145, L250).**

L145's streaming, transported: **SSE & streaming protocols** — server-sent events: the one-way HTTP stream from the server to the client (L251) — the transport behind every streaming chat (L162): the model's tokens (L145) pushed down an open HTTP connection (L251). The protocol: the `text/event-stream` response, the events, and the reconnection (L251). The choice: SSE when the data flows server→client (L251); WebSockets when both ways (L250).

The distinction this lesson is built on: a **demo** polls for the response. A **solutions architect** streams it: the SSE response (L251), the event format (L251), the reconnection (L251), and the transport choice (L250) — the TTFT (L145) and the UX (L162) served by the stream (L251).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain SSE: the one-way HTTP stream (L251)
- Explain the format: the event-stream response, the events (L251)
- Explain the reconnection: the client's automatic retry (L251)
- Explain the choice: SSE vs WebSockets (L250)
- Explain the AI shape: the token stream (L145)

## 1. One-Line Definition

**SSE (server-sent events) is the one-way HTTP stream — the server pushes events down an open HTTP connection (L251), the transport behind every streaming chat (L162): the model's tokens (L145) arrive as they're generated (L251), with the text/event-stream format (L251) and the automatic reconnection (L251) — chosen when the data flows server→client (L251), and the WebSocket (L250) when both ways (L250).**

The one-sentence interview answer: *"SSE is the one-way HTTP stream (L251). The server opens a text/event-stream response (L251) and pushes events down it (L251): the model's tokens (L145) arrive as they're generated (L162) — the streaming chat's transport (L251). The format: each event is a block — the event type, the data, the ID (L251) — and the client parses them as they arrive (L251). The reconnection: the client automatically reconnects on a drop (L251), with the Last-Event-ID (L251) resuming from where it left (L251). The choice: SSE when the data flows server→client (L251) — the token stream (L145), the progress updates (L162); the WebSocket (L250) when the client must push too (L250). Why SSE for the chat: it's HTTP (L251) — simpler than the WebSocket's upgrade (L250), the proxies understand it (L251), and the reconnection is built in (L251)."*

## 2. Mental Model

Think of SSE as **the radio broadcast — the one-way news channel.** The station (the server, L251) broadcasts the news (the events, L251): the token arrives, the next token arrives (L145) — each broadcast a small update (L251). The radio (the client, L251) listens on the frequency (the event-stream connection, L251), picking up each update as it's broadcast (L251). If the signal drops (the connection breaks, L251), the radio re-tunes automatically (the reconnection, L251) and catches up from where it left (the Last-Event-ID, L251). The broadcast is one-way (L251) — the listener can't talk back on the frequency (L250); if it needs to, it uses a different channel (the WebSocket, L250). The news works because the broadcast is one-way, simple, and auto-reconnecting (L251).

```text
   the radio broadcast (SSE, L251)
   ┌────────────────────────────────────────────────────────┐
   │ the station (the server) broadcasts the updates (L251) │
   │ the radio (the client) listens — each event (L251)     │
   │ the drop → the auto re-tune (L251) + the catch-up      │
   │ (the Last-Event-ID, L251)                              │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the radio broadcast**: the one-way stream, the events, and the auto re-tune (L251).

## 3. Visual Flow — The SSE Stream

```text
   the client requests the stream (L251)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE RESPONSE (L251)                                  │
   │     text/event-stream — the connection stays open (L251) │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE EVENTS (L251)                                    │
   │     the server pushes: the tokens (L145), the progress   │
   │     (L162), the done signal (L251)                       │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE RECONNECTION (L251)                              │
   │     the drop → the client reconnects (L251)              │
   │     with the Last-Event-ID (L251) → the resume (L251)    │
   └──────────────────────────────────────────────────────────┘
```

The flow is the broadcast: **response → events → reconnection** (L251).

## 4. How It Works — The Format, the Reconnection, the Choice

- **The response (L251).** The `text/event-stream` response (L251): the connection stays open, and the server pushes events (L251) — no polling (L251).
- **The events (L251).** Each event is a block: the event type, the data, and the ID (L251) — the client parses them as they arrive (L251). The token events (L145), the progress events (L162), the done event (L251).
- **The reconnection (L251).** The client automatically reconnects on a drop (L251), with the Last-Event-ID (L251) — the server resumes from the last event (L251). The reconnection is built into the protocol (L251).
- **The choice (L250).** SSE when the data flows server→client (L251); the WebSocket (L250) when both ways (L250). The SSE is HTTP (L251) — simpler than the WebSocket's upgrade (L250), and the proxies understand it (L251).
- **The AI shape (L145).** The token stream (L145): the model's tokens pushed as they're generated (L162) — the TTFT (L145) served, the UX delivered (L162).

> [!NOTE]
> **The streaming chat's transport is SSE, not WebSockets (L251).** The chat's data flows one way — the server's tokens to the client (L145). The SSE (L251) is the simpler fit: HTTP-native (L251), the proxies and the load balancers understand it (L251), and the reconnection is built in (L251). The WebSocket (L250) earns its complexity when the client must push mid-stream (L250) — the interruptions, the bidirectional features (L250). The senior answer names the direction (L251): the streaming chat is the SSE's case (L251); the interactive collaboration is the WebSocket's (L250).

## 5. Real Project Usage

- **The streaming chat (L162).** The chat's tokens (L145) via SSE (L251) — the `/chat` endpoint's stream (L233).
- **The progress updates (L162).** The long job's progress (L249) pushed via SSE (L251) — the UI's progress bar (L162).
- **The agent's live steps (L213).** The agent run's steps (L213) streamed (L251) — the UI showing the loop (L162).
- **The live notifications (L251).** The server's notifications pushed (L251) — the one-way stream's case (L251).
- **Anything server-pushed (L260).** The SSE (L251) is the L260 platform's one-way stream (L260) — the token stream and the progress (L251).

The through-line: **the radio broadcast** — the one-way stream carrying the tokens and the progress, with the built-in reconnection (L251).

## 6. Interview Explanation

Say it in four moves:

1. **The stream.** "The one-way HTTP stream (L251) — the server pushes the events (L251)."
2. **The format.** "The text/event-stream response (L251), the event blocks (L251)."
3. **The reconnection.** "The client auto-reconnects (L251) with the Last-Event-ID (L251)."
4. **The choice.** "Server→client → SSE (L251); both ways → the WebSocket (L250)."

## 7. Senior-Level Insights

- **The direction is the choice (L251).** The senior answer names the data's flow (L250): the server→client → the SSE (L251); the both-ways → the WebSocket (L250).
- **The TTFT is the stream's job (L145).** The first token's arrival (L145) — the SSE's first event (L251) — the perceived latency (L162).
- **The reconnection is the reliability (L251).** The Last-Event-ID (L251) — the resume without the lost tail (L251) — the built-in reliability (L251).
- **The HTTP-native is the simplicity (L251).** The SSE rides HTTP (L251) — the proxies and the caches understand it (L251), no upgrade handshake (L250).
- **The backpressure is the server's concern (L251).** The fast model, the slow client (L151) — the stream's backpressure (L251) — the buffer (L251) and the rate (L251) managed by the server (L251).

## 8. Common Mistakes

- **The polling for the stream (L251).** The chat polling for the tokens (L251) — the SSE (L251) the fit (L251).
- **The WebSocket for the one-way (L250).** The token stream over the WebSocket (L250) — the SSE's simplicity (L251) missed (L251).
- **No reconnection handling (L251).** The dropped stream loses the tail (L251) — the Last-Event-ID (L251) missing (L251).
- **The events unformatted (L251).** The raw text instead of the event blocks (L251) — the client's parse broken (L251).
- **The unbounded stream (L251).** The stream never closed (L251) — the done event (L251) missing (L251).
- **The stream unobservable (L213).** The stream's life unmonitored (L332) — the drops and the latency (L333) invisible (L251).

## 9. Best Practices

- **Use the SSE for the server→client** (L251) — the token stream (L145), the progress (L162).
- **Format the events** (L251) — the event type, the data, the ID (L251).
- **Handle the reconnection** (L251) — the Last-Event-ID (L251), the resume (L251).
- **Close the stream** (L251) — the done event (L251), the cleanup (L251).
- **Manage the backpressure** (L251) — the buffer and the rate (L251).
- **Monitor the streams** (L213) — the drops, the latency (L333).

## 10. Interview Questions

**Q: What is SSE?**
> A: Server-sent events (L251): the one-way HTTP stream — the server pushes events down an open text/event-stream connection (L251). The events arrive as they're generated (L251): the model's tokens (L145), the progress (L162). The client auto-reconnects on a drop (L251), with the Last-Event-ID (L251) resuming the stream (L251).

**Q: Why SSE for the streaming chat?**
> A: Because the chat's data flows one way (L251): the server's tokens to the client (L145). The SSE (L251) is the simpler fit: HTTP-native (L251), the proxies understand it (L251), and the reconnection is built in (L251). The WebSocket (L250) earns its complexity when the client must push mid-stream (L250) — the streaming chat doesn't (L251).

**Q: How does the reconnection work?**
> A: The protocol's built-in (L251). When the connection drops, the client automatically reconnects (L251) with the Last-Event-ID (L251) — the server resumes from the last delivered event (L251). The stream's tail isn't lost (L251). The reconnection is the SSE's reliability (L251).

**Q: SSE or WebSockets?**
> A: The data's direction (L250). The server pushes one-way → the SSE (L251): the token stream (L145), the progress (L162), the notifications (L251). The client must push too → the WebSocket (L250): the interactive chat, the collaboration (L250). The streaming chat is the SSE's case (L251); the WebSocket is the both-ways case (L250).

## 11. Follow-Up Questions

- What's the event format (L251)?
- How does the reconnection work (L251)?
- Why SSE for the chat (L251)?
- SSE vs WebSockets (L250)?
- How do you manage the backpressure (L251)?

## 12. Comparison Table — SSE vs WebSocket

| | SSE (this lesson) | WebSocket (L250) |
|---|---|---|
| The direction | server → client (L251) | both ways (L250) |
| The protocol | HTTP (L251) | the upgrade (L250) |
| The reconnection | built in (L251) | the app's job (L250) |
| The proxies (L251) | understand it (L251) | need the support (L250) |
| The fit (L251) | the one-way stream | the bidirectional |
| The AI case (L251) | the token stream (L145) | the interactive chat (L250) |

The senior read: **the direction column is the choice** — the stream's one-way vs the channel's both-ways (L251).

## 13. Code Example — The SSE Stream

```js
// SSE: the streaming response (L251).
import { Readable } from 'node:stream';

// THE STREAMING ROUTE (L233) — the text/event-stream (L251).
export async function POST(req) {
  // THE RESPONSE (L251) — the connection stays open.
  const stream = new Readable({ read() {} });
  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',      // the protocol (L251)
      'Cache-Control': 'no-cache',              // no caching (L251)
      Connection: 'keep-alive',
    },
  });

  // THE EVENTS (L251) — the tokens pushed as they're generated (L145).
  let id = 0;
  const result = streamText({ model, messages });
  for await (const token of result.textStream) {
    id += 1;
    stream.push(                                   // the event block (L251):
      `id: ${id}\n` +                              // the ID — the resume point (L251)
      `event: token\n` +                            // the event type (L251)
      `data: ${JSON.stringify({ token })}\n\n`,     // the data (L251)
    );
  }

  // THE DONE EVENT (L251) — the stream's close (L251).
  stream.push(`event: done\ndata: {}\n\n`);
  stream.push(null);

  return response;                                 // the streaming transport (L251)
}
```

```text
What the reader must SEE — the radio broadcast:

  text/event-stream        → the open connection (L251)
  id / event / data        → the event block (L251)
  the token events         → the stream (L145)
  the done event           → the close (L251)
  the IDs                  → the resume points (L251)

  The one-way broadcast, with the auto re-tune built in.
```

```narrate
4-9: The response — the text/event-stream connection stays open (L251).
12-19: The events — the model's tokens (L145) pushed as event blocks: the ID, the type, the data (L251).
21-23: The done event — the stream's explicit close (L251).
24: The response — the streaming transport (L251).
```

> [!TIP]
> The line that shows the protocol's elegance: **`id: ${id}`** before **`data: ${JSON.stringify({ token })}`** — the resume point beside each token (L251). **The one-way broadcast with the built-in catch-up — the streaming chat's transport (L251).**

## 14. Performance Notes

- **The TTFT is the stream's win (L145).** The first event arrives fast (L151) — the perceived latency (L162) served (L251).
- **The connection is the memory cost (L150).** The open streams (L251) — the server's memory scales with the concurrent streams (L250).
- **The backpressure is the server's control (L251).** The fast model, the slow client (L151) — the buffer (L251) and the rate (L251) managed (L251).
- **The reconnection is the reliability (L251).** The Last-Event-ID (L251) — the resume without the lost tail (L251).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The chat is slow | The polling used (L251) | The SSE (L251) |
| The stream's tail lost | No reconnection (L251) | The Last-Event-ID (L251) |
| The client can't parse | The events unformatted (L251) | The event blocks (L251) |
| The stream never closes | No done event (L251) | The cleanup (L251) |
| The server memory grows | The streams unmonitored (L213) | The concurrent count (L332) |

## 16. Quick Revision Notes

- SSE = **the one-way HTTP stream** (L251) — the server pushes the events (L251).
- The format: **text/event-stream, the event blocks** (L251).
- The reconnection: **built in — the Last-Event-ID** (L251).
- The choice: **server→client → SSE (L251); both ways → the WebSocket (L250)**.
- The AI shape: **the token stream (L145) — the streaming chat's transport (L162)**.
- The stream's life: **the done event (L251), the backpressure (L251), the monitoring (L213)**.

## 17. Cheat Sheet

```text
SSE & STREAMING PROTOCOLS = the one-way HTTP stream

THE STREAM (L251)
  text/event-stream — the connection stays open (L251)
  the server pushes the events (L251) — no polling (L251)

THE EVENTS (L251)
  the block: id · event · data (L251)
  the tokens (L145) · the progress (L162) · the done (L251)
  the IDs are the resume points (L251)

THE RECONNECTION (L251)
  built into the protocol (L251)
  the client reconnects with the Last-Event-ID (L251)
  the server resumes — the tail isn't lost (L251)

THE CHOICE (L250)
  the server → client  → the SSE (L251) — HTTP-native (L251)
  the client also pushes → the WebSocket (L250)
  the streaming chat is the SSE's case (L251)

THE AI SHAPE (L145)
  the token stream (L145) — the TTFT (L145) and the UX (L162)
  served by the stream (L251)

INTERVIEW, 4 MOVES
  1 stream  "the one-way HTTP push (L251)"
  2 events  "id · event · data (L251)"
  3 reconnect "the Last-Event-ID (L251)"
  4 choice  "server→client → SSE (L251); both ways → WS (L250)"
```

## 18. Key Takeaways

> [!RECAP]
> - SSE is **the one-way HTTP stream** (L251): the server pushes events down an open text/event-stream connection (L251) — the transport behind every streaming chat (L162)
> - **The events are blocks** (L251): the id, the event type, and the data (L251) — the model's tokens (L145) arriving as they're generated (L162)
> - **The reconnection is built into the protocol** (L251) — the client reconnects with the Last-Event-ID (L251), and the stream resumes without losing its tail (L251)
> - **The choice is the data's direction** (L250): the server→client → the SSE (L251); the client must push too → the WebSocket (L250)
> - **The streaming chat is the SSE's case** (L251) — HTTP-native (L251), proxy-friendly (L251), with the reconnection built in (L251)
> - The SSE is **the L260 platform's one-way stream** (L260) — the token stream (L145), the progress (L162), and the notifications (L251), monitored for the drops and the latency (L213, L333)

## Check your understanding

Answer these without looking back.

1. What's the SSE stream (L251)?
2. What's the event format (L251)?
3. How does the reconnection work (L251)?
4. Why SSE for the chat (L251)?
5. SSE vs WebSockets (L250)?
6. What's the done event (L251)?
7. What's the backpressure (L251)?
8. What do you monitor (L213)?

## A Closing Note — The Radio Broadcast

You now hold the streaming transport: **the one-way HTTP stream, the event blocks with their resume points, the built-in reconnection, and the direction-based choice.** The streaming chat now has its transport — simpler than the WebSocket, and exactly right (L251).

Next: the service shapes — microservices (L252), splitting the AI platform by domain and by scale.
