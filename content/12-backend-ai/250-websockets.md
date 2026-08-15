# Lesson 250 — WebSockets

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you push live updates to the client?" — the answer is *WebSockets*: the bidirectional channel — and when it beats polling and SSE (L251).**

L251's sibling is this lesson: **WebSockets** — the bidirectional, full-duplex channel (L250): the client and the server both push (L250) — the chat room, the collaborative editor, the live dashboard (L250). The AI product's shape: the live AI features — the streaming chat (L251), the tool progress (L162), the agent's live steps (L213) — where the server pushes and the client reacts (L250).

The distinction this lesson is built on: a **demo** polls for everything. A **solutions architect** knows the transports: the polling (the simple pull, L250), the SSE (the server-push stream, L251), and the WebSocket (the bidirectional channel, L250) — chosen by the direction of the data (L250).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain WebSockets: the bidirectional, full-duplex channel (L250)
- Explain the handshake: HTTP → the upgraded connection (L250)
- Explain the fit: when the server AND the client push (L250)
- Explain the transport choice: polling vs SSE vs WebSockets (L251)
- Explain the scaling: the connection state and the fan-out (L250)

## 1. One-Line Definition

**WebSockets are the bidirectional, full-duplex channel (L250) — the client and the server both push over one persistent connection (L250), chosen when the data flows both ways (the chat room, the collaborative editor, L250) — as opposed to the polling (the pull, L250) and the SSE (the one-way server push, L251), with the scaling challenges of the connection state (L250) and the fan-out (L247).**

The one-sentence interview answer: *"WebSockets are the bidirectional channel (L250). The client and the server both push over one persistent connection (L250) — the chat room, the live dashboard, the collaborative editor (L250). The handshake: an HTTP request upgrades to the WebSocket (L250) — the connection stays open, full-duplex (L250). The fit is the direction: when the data flows both ways (L250) — the client sends, the server pushes back — the WebSocket wins; when only the server pushes, the SSE (L251) is simpler; when the client can poll, the polling is simplest (L250). The AI product's live features (L251): the streaming chat (L251) and the tool progress (L162) — the server pushes, the client reacts (L250). The scaling: the connections are stateful (L250) — the load balancer must stick (L250) or the state must move to Redis (L243); and the fan-out (L247) — a message to all the connections of a room (L250) — goes through the pub/sub (L247)."*

## 2. Mental Model

Think of the three transports as **three ways of talking to the office.** The polling is the phone calls back and forth: you call every minute to ask "any news?" (the pull, L250) — wasteful, but simple. The SSE is the one-way radio: the office broadcasts the news, you listen (the server push, L251) — one-way, simple. The WebSocket is the open phone line: both sides talk anytime (the full-duplex, L250) — you ask, the office answers, and it calls you with updates (L250). The AI chat is the open line: the client sends the message, the server streams the reply (L251) — and if the client needs to send again mid-stream (L250), the WebSocket is the channel (L250).

```text
   the polling (L250)     the SSE (L251)     the WebSocket (L250)
   ┌──────────────┐       ┌──────────────┐   ┌──────────────┐
   │ ask · wait · │       │ server →     │   │ client ↔     │
   │ ask (L250)   │       │ client (L251)│   │ server (L250)│
   └──────────────┘       └──────────────┘   └──────────────┘
```

The mental model is **the three conversations**: the calls, the radio, and the open line — chosen by the data's direction (L250).

## 3. Visual Flow — The WebSocket Connection

```text
   the client wants the live channel (L250)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE HANDSHAKE (L250)                                 │
   │     the HTTP request → the upgraded connection (L250)    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE FULL-DUPLEX (L250)                               │
   │     the client pushes: the message (L250)                │
   │     the server pushes: the stream, the progress (L251)   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE FAN-OUT (L250)                                   │
   │     the server broadcasts to the room's connections      │
   │     (L247) — via the pub/sub (L247)                      │
   └──────────────────────────────────────────────────────────┘
```

The flow is the channel: **handshake → full-duplex → fan-out** (L250).

## 4. How It Works — The Channel, the Fit, the Scale

- **The channel (L250).** The WebSocket: the HTTP handshake (L250) upgrades the connection (L250) — the persistent, full-duplex channel (L250): both sides push (L250).
- **The fit (L250).** The direction decides (L250): both ways → the WebSocket (L250); the server-only push → the SSE (L251); the client-only pull → the polling (L250). The WebSocket is the chat room's and the collaborative editor's channel (L250).
- **The AI shape (L251).** The live AI features: the streaming chat (L251) — the server pushes the tokens (L162); the tool progress (L162) — the server pushes the steps (L213). The client sends, the server streams (L250).
- **The scale (L250).** The connections are stateful (L250): the load balancer must stick the session (L250) — or the state moves to Redis (L243); and the fan-out (L247): a message to a room's connections (L250) goes through the pub/sub (L247).

> [!NOTE]
> **The transport follows the direction of the data (L250).** The senior answer chooses by the flow (L250): the client pulls → the polling (L250); the server pushes one-way → the SSE (L251); both push → the WebSocket (L250). The AI streaming (L251) is the interesting case: the tokens flow server→client (L251) — the SSE is enough (L251) — but the interactive features — the client sending mid-stream, the live collaboration (L250) — need the WebSocket's both-ways (L250). The transport is a fit decision, not a fashion (L250).

## 5. Real Project Usage

- **The streaming chat (L251).** The chat UI's WebSocket (L250): the client sends, the server streams the tokens (L162) — and the client can interrupt (L250).
- **The collaborative editor (L250).** The edits both ways (L250) — the WebSocket's full-duplex (L250).
- **The live dashboard (L250).** The server pushes the metrics (L250) — the WebSocket or the SSE (L251).
- **The agent's live steps (L213).** The agent run's progress (L213) pushed to the UI (L162) — the WebSocket (L250).
- **Anything live (L260).** The WebSocket (L250) is the L260 platform's live channel (L260) — chosen by the direction (L250).

The through-line: **the open line** — the bidirectional channel for the live AI features, chosen by the data's direction (L250).

## 6. Interview Explanation

Say it in four moves:

1. **The channel.** "The bidirectional, full-duplex connection (L250) — both sides push (L250)."
2. **The handshake.** "The HTTP request upgrades (L250) — the persistent connection (L250)."
3. **The fit.** "Both ways → the WebSocket (L250); server-only → the SSE (L251); the client pulls → the polling (L250)."
4. **The scale.** "The stateful connections (L250) — the stickiness (L250) and the fan-out (L247)."

## 7. Senior-Level Insights

- **The transport follows the direction (L250).** The senior answer chooses by the data's flow (L250): the polling for the pull (L250), the SSE for the server push (L251), the WebSocket for the both-ways (L250).
- **The AI streaming is the SSE's case (L251).** The tokens flow server→client (L145) — the SSE (L251) is the simpler fit (L251); the WebSocket (L250) when the client must send mid-stream (L250).
- **The connection state is the scaling cost (L250).** The sticky load balancing (L250) or the state in Redis (L243) — the stateful channel's price (L250).
- **The fan-out is the pub/sub's job (L247).** A message to a room (L250) — the pub/sub (L247) routing to the connections (L250).
- **The reconnection is the UX (L250).** The dropped connection (L250) — the reconnect and the resume (L250) are the live UX's design (L250).

## 8. Common Mistakes

- **The polling for the live (L250).** The chat polling every second (L250) — the waste (L250), the SSE (L251) or the WebSocket (L250) the fit (L250).
- **The WebSocket for the one-way (L250).** The server push only (L251) — the SSE (L251) is simpler (L251).
- **The connections unscaled (L250).** No stickiness (L250), no shared state (L243) — the reconnect breaks the session (L250).
- **The fan-out unscaled (L247).** The server iterating the connections (L250) — the pub/sub (L247) missing (L250).
- **No reconnection (L250).** The dropped line kills the UX (L250) — the reconnect and the resume (L250) missing (L250).
- **The channel for the request (L250).** The one-shot request over the WebSocket (L233) — the HTTP (L233) is the fit (L250).

## 9. Best Practices

- **Choose by the direction** (L250) — both ways → the WebSocket (L250), the server-only → the SSE (L251), the pull → the polling (L250).
- **Design the scaling** (L250) — the stickiness (L250) or the shared state in Redis (L243).
- **Route the fan-out through the pub/sub** (L247) — a room's messages (L250).
- **Design the reconnection** (L250) — the reconnect and the resume (L250).
- **Keep the connection lean** (L250) — the channel for the live events, not the requests (L233).
- **Monitor the connections** (L213) — the connected count, the drop rate (L332).

## 10. Interview Questions

**Q: What are WebSockets?**
> A: The bidirectional, full-duplex channel (L250): the client and the server both push over one persistent connection (L250). The handshake: the HTTP request upgrades to the WebSocket (L250). The fit: when the data flows both ways (L250) — the chat room, the collaborative editor (L250). The server-only push is the SSE's case (L251).

**Q: Polling, SSE, or WebSockets?**
> A: The data's direction (L250). The client pulls → the polling (L250) — simple, wasteful. The server pushes one-way → the SSE (L251) — the streaming chat's tokens (L251). Both push → the WebSocket (L250) — the chat room, the collaboration (L250). The transport is a fit decision (L250), not a fashion (L250).

**Q: Why is the AI streaming the SSE's case?**
> A: Because the tokens flow one way (L251): the server → the client (L145). The SSE (L251) is the simpler fit for the one-way stream (L251). The WebSocket (L250) earns its complexity when the client must send mid-stream — the interruptions, the follow-ups (L250) — or when the feature is truly bidirectional (L250).

**Q: How do you scale WebSockets?**
> A: The connection state is the cost (L250). The load balancer must stick the session (L250) — or the state moves to Redis (L243). And the fan-out — a message to a room's connections (L250) — goes through the pub/sub (L247), not the server's loop (L250). The reconnection (L250) and the resume (L250) complete the scaling story (L250).

## 11. Follow-Up Questions

- What's the handshake (L250)?
- Polling vs SSE vs WebSockets (L250)?
- Why is the streaming the SSE's case (L251)?
- How do you scale the connections (L250)?
- How does the fan-out work (L247)?

## 12. Comparison Table — The Three Transports

| | Polling (L250) | SSE (L251) | WebSocket (this lesson) |
|---|---|---|---|
| The direction | the client pulls | server → client (L251) | both ways (L250) |
| The connection | per request | one-way stream (L251) | full-duplex (L250) |
| The complexity | low | low | highest (L250) |
| The fit (L250) | the simple pull | the server push | the bidirectional |
| The AI case (L251) | — | the token stream (L251) | the interactive chat (L250) |

The senior read: **the direction column is the choice** — the transport follows the data's flow (L250).

## 13. Code Example — The WebSocket Server

```js
// WebSockets: the handshake, the full-duplex, the fan-out (L250).
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const rooms = new Map();                              // room → the connections (L250)

wss.on('connection', (ws, req) => {
  // THE HANDSHAKE (L250) — the upgrade happened (L250).
  const { roomId, userId } = parse(req.url);          // the room and the user (L250)
  ws.roomId = roomId;
  rooms.get(roomId)?.add(ws);

  // THE FULL-DUPLEX (L250) — the client pushes (L250).
  ws.on('message', async (raw) => {
    const msg = JSON.parse(raw);

    if (msg.type === 'chat') {
      // THE AI STREAM (L251) — the server pushes the tokens (L162).
      const stream = await streamChat(msg.text);
      for await (const token of stream) ws.send(JSON.stringify({ type: 'token', token }));  // L251
    }

    if (msg.type === 'interrupt') {                   // the client pushes mid-stream (L250)
      await cancel(stream);                           // L250
    }
  });

  ws.on('close', () => rooms.get(roomId)?.delete(ws));   // the disconnect (L250)
});

// THE FAN-OUT (L250) — a message to the room, via the pub/sub (L247).
await pubsub.publish(`room:${roomId}`, event);        // L247
// each server's subscriber forwards to its connections (L250):
pubsub.subscribe(`room:${roomId}`, (event) => {
  for (const ws of rooms.get(roomId) ?? []) ws.send(JSON.stringify(event));
});
```

```text
What the reader must SEE — the open line:

  the connection + room  → the stateful channel (L250)
  ws.on('message')       → the client pushes (L250)
  ws.send(token)         → the server streams (L251)
  pubsub.publish         → the fan-out through the pub/sub (L247)

  Both sides talk — the open line, scaled by the pub/sub.
```

```narrate
5-8: The connection — the handshake done, the room joined (L250).
10-16: The full-duplex — the client's message, the server's token stream (L251, L250).
17-20: The interruption — the client pushes mid-stream (L250).
22-24: The disconnect — the connection leaves the room (L250).
26-30: The fan-out — the room's messages through the pub/sub (L247), forwarded to the server's connections (L250).
```

> [!TIP]
> The pair that defines the channel: **`ws.send(JSON.stringify({ type: 'token', token }))`** (the server push, L251) beside **`ws.on('message')`** (the client push, L250). **The open line — both sides talk, and the pub/sub carries the room's broadcasts (L250).**

## 14. Performance Notes

- **The persistent connection is the latency win (L151).** The open channel (L250) — no per-message handshake (L250), the live updates instant (L151).
- **The connections are the memory cost (L150).** The stateful channels (L250) — the server's memory scales with the connections (L250).
- **The fan-out is the pub/sub's scale (L247).** The room's broadcasts (L250) through the pub/sub (L247) — the horizontal scaling (L252).
- **The reconnection is the UX's design (L250).** The dropped line (L250) — the reconnect and the resume (L250) keep the UX alive (L250).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The live updates lag | The polling used (L250) | The SSE (L251) or the WebSocket (L250) |
| The session breaks | No stickiness (L250) | The load balancer (L250) |
| The fan-out misses | No pub/sub (L247) | The room's subscription (L247) |
| The dropped line kills the UX | No reconnection (L250) | The reconnect + the resume (L250) |
| The memory grows | The connections unmonitored (L213) | The connected count (L332) |

## 16. Quick Revision Notes

- WebSockets = **the bidirectional channel** (L250): both sides push (L250).
- The handshake: **the HTTP upgrade** (L250).
- The fit: **both ways → the WebSocket (L250); the server-only → the SSE (L251); the pull → the polling (L250)**.
- The AI case: **the interactive chat (L250); the pure stream → the SSE (L251)**.
- The scale: **the stickiness (L250), the shared state (L243), the fan-out via the pub/sub (L247)**.
- The UX: **the reconnection and the resume (L250)**.

## 17. Cheat Sheet

```text
WEBSOCKETS = the bidirectional, full-duplex channel

THE CHANNEL (L250)
  the HTTP handshake upgrades the connection (L250)
  the persistent, full-duplex line (L250) — both sides push (L250)

THE TRANSPORT CHOICE (L250)
  the client pulls  → the polling (L250) — simple, wasteful
  the server pushes → the SSE (L251) — the one-way stream (L251)
  both push         → the WebSocket (L250) — the open line (L250)

THE AI SHAPE (L251)
  the token stream (L145) → the SSE (L251) — one-way (L251)
  the interactive chat (L250) — the client sends mid-stream →
  the WebSocket (L250)

THE SCALING (L250)
  the connections are stateful (L250) — the stickiness (L250)
  or the shared state in Redis (L243)
  the fan-out — a room's messages — through the pub/sub (L247)

THE UX (L250)
  the reconnection (L250) · the resume (L250)
  the monitor: the connected count, the drop rate (L213, L332)

INTERVIEW, 4 MOVES
  1 channel  "the full-duplex, both push (L250)"
  2 choice   "by the direction: pull, push, or both (L250)"
  3 AI shape "the stream → SSE (L251); the interactive → WS (L250)"
  4 scaling  "the stickiness, the state, the pub/sub fan-out (L250)"
```

## 18. Key Takeaways

> [!RECAP]
> - WebSockets are **the bidirectional, full-duplex channel** (L250): the client and the server both push over one persistent connection (L250), established by the HTTP upgrade (L250)
> - **The transport follows the data's direction** (L250): the polling for the pull (L250), the SSE for the server-only push (L251), and the WebSocket for the both-ways (L250)
> - **The AI streaming is the SSE's case** (L251) — the tokens flow one way (L145); the interactive chat — the client sending mid-stream (L250) — is the WebSocket's (L250)
> - **The connections are stateful** (L250) — the scaling requires the stickiness (L250) or the shared state in Redis (L243)
> - **The fan-out goes through the pub/sub** (L247) — a room's messages (L250) routed to the connections (L250)
> - **The reconnection and the resume** (L250) are the live UX's design — and the connected count and the drop rate are monitored (L213, L332)

## Check your understanding

Answer these without looking back.

1. What's the WebSocket channel (L250)?
2. What's the handshake (L250)?
3. How do you choose the transport (L250)?
4. Why is the streaming the SSE's case (L251)?
5. How do you scale the connections (L250)?
6. How does the fan-out work (L247)?
7. What's the reconnection story (L250)?
8. What do you monitor (L213)?

## A Closing Note — The Open Line

You now hold the live channel: **the full-duplex connection, the transport chosen by the data's direction, the scaling through stickiness and the pub/sub, and the reconnection that keeps the line alive.** The live AI features now have their channel (L250).

Next: the simpler stream — SSE & streaming protocols (L251), the transport behind every streaming chat.
