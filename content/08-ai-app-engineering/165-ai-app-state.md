# Lesson 165 — AI Application State

**Interview importance:** ⭐⭐⭐⭐ — "where does your AI app's state live?" is the architecture question; the answer is a *three-way split* — local, server, and model state — and knowing which is which.

Lessons 161–164 built the UI and the loop. This lesson is the **state model underneath**: where each piece of an AI app's state lives — client display state, server conversation state, and the model's context window — and why the split is load-bearing. State is where AI apps get tangled: a chat that loses history on refresh (L166), a tool loop with no persistence (L207), a UI that can't tell streaming from done (L162).

The distinction this lesson is built on: a **demo** keeps everything in the component. A **solutions architect** classifies state by *owner and lifetime*: UI state is local and ephemeral (L162); conversation state is server-side and durable (L166); the model's context is the model's working set (L138); and the boundaries between them are the architecture.

## Learning Objectives

By the end of this lesson you should be able to:

- Classify AI app state into three kinds: local (UI), server (conversation/session), model (context)
- Explain which state belongs where, and why the boundaries matter (L158, L166)
- Design the state flow: local renders the server's state; the server feeds the model's context
- Handle the shared state of a chat: messages, tool steps, streaming state (L161, L162)
- Explain how state scales to agents: session persistence, memory (L167, L207)

## 1. One-Line Definition

**AI application state is the three-way split of where an AI app keeps its data — local UI state (ephemeral, in the client), server conversation state (durable, per session), and the model's context (the working set it attends over) — with the boundaries between them defining the architecture.**

The one-sentence interview answer: *"State in an AI app splits three ways. Local UI state — is it streaming, tool-running, done? — lives in the client, ephemeral (L162). Server state — the conversation, the session, the memory — lives server-side, durable, per user (L166, L167). And the model's context — what the model attends over — is the model's working set, fed from server state (L138). The architecture is the boundaries: the client renders the server's state; the server feeds the model's context."*

## 2. Mental Model

Think of the three kinds of state as **a whiteboard, a filing cabinet, and the assistant's notepad.**

- **The whiteboard (local UI state)** — what's on screen right now: streaming, tool-running, the draft text. Erased when you leave the room (refresh).
- **The filing cabinet (server state)** — the conversation, the session, the user's memory. Survives the room; the durable record.
- **The assistant's notepad (model context, L138)** — what the assistant can see for this task: the system prompt, the history, the retrieved docs. It's the working set — filled from the filing cabinet, emptied per request.

```text
   the whiteboard          the filing cabinet        the notepad
   (local UI, L162)        (server state, L166)      (model context, L138)
   ┌────────────────┐      ┌──────────────────┐      ┌──────────────────┐
   │ streaming?     │      │ conversation     │      │ system + history │
   │ tool-running?  │  ←─  │ history (L166)   │  ←─  │ + retrieved docs │
   │ draft text     │      │ session · memory │      │ (what it attends)│
   │ ephemeral      │      │ durable          │      │ per request      │
   └────────────────┘      └──────────────────┘      └──────────────────┘
        renders                the source               the working set
```

The mental model is **three stores with a one-way flow**: the filing cabinet (server) feeds the notepad (model); the whiteboard (UI) renders what's happening. Confuse any two and the app gets tangled.

## 3. Visual Flow — One Turn's State, Three Stores

```text
   user sends a message
        │
        ▼
   ┌───────────────────────────────────────────────┐
   │ LOCAL (UI, L162)                              │
   │  streaming: true → tool-running → done        │
   │  (ephemeral — dies on refresh)                │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ SERVER (conversation, L166)                   │
   │  append user msg → load history → save        │
   │  assistant msg + tool steps (durable)         │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ MODEL (context, L138)                         │
   │  system + history + retrieved docs            │
   │  = the working set for this generation        │
   └───────────────────────────────────────────────┘
        │
        ▼
   the answer streams back → local state renders it →
   server state saves it → the cabinet is the truth
```

The flow is the discipline: **the server is the source of truth; the model is fed from it; the UI renders it.** Any state that isn't in one of those three places is a bug waiting to happen.

## 4. How It Works — The Three Kinds, and Their Rules

### Local UI state (client, ephemeral)

- What's on screen: `isLoading`, `isStreaming`, tool-running flags (L162), the draft, the visible parts (L161).
- Rules: ephemeral — never the source of truth; dies on refresh; purely presentational.

### Server conversation state (durable, per session)

- The conversation history (L166), the session identity, tool-step records (L213), user memory (L167).
- Rules: the source of truth; survives refresh; shareable across devices; the thing evals (L343) and audits (L322) read.

### Model context (the working set, per request)

- The system prompt, the history slice, the retrieved docs (L138, L174) — everything the model attends over (L136).
- Rules: built from server state per request; bounded by the token budget (L149); never a storage location — it evaporates when the generation ends.

> [!NOTE]
> **The three rules that keep it straight.** ① Local state *renders*; it never *stores*. ② Server state *stores*; it's the source of truth. ③ Model context *works*; it's fed per request and evaporates. An app that respects these three doesn't lose history on refresh, doesn't trust the UI as truth, and doesn't treat the context window as a database (L138).

## 5. Real Project Usage

- **Chat.** Local state renders the stream (L162); server state holds the conversation (L166); the model's context is fed from it (L138). Refresh → the server restores the chat; the model never "remembers" — the server does.
- **Tool-calling apps (L164).** Tool steps are *server* state (the record, L213); the UI renders them locally (L161); the model's context includes the step results (L144).
- **Agents (L200, L207).** Session state — the plan, the step history, the accumulated context — is server-side and durable (L207); the model's context is rebuilt per step (L138). Agent state is this lesson at loop scale.
- **Multi-device.** The server holds the truth, so a chat started on mobile continues on desktop (L166). Client-only state would strand the session.
- **RAG apps (L174).** The retrieved docs go into the model's context per request (L191); the corpus is server state; the UI renders the citations (L192). Same three-way split.

The through-line: **every AI app is the same state model** — local renders, server stores, model works — and the architecture's quality is the discipline of the boundaries.

## 6. Interview Explanation

Say it in four moves:

1. **The split.** "State splits three ways: local UI state (ephemeral, L162), server conversation state (durable, L166), and the model's context (the working set, L138)."
2. **The flow.** "The server is the source of truth; the model is fed from it per request; the UI renders it. One-way flow, three stores."
3. **The rules.** "Local renders, never stores. Server stores — it's the truth. Model context works — it's fed and evaporates (L138)."
4. **The payoff.** "Respect the split and the app doesn't lose history on refresh (L166), doesn't trust the UI as truth, and doesn't treat the context window as a database."

## 7. Senior-Level Insights

- **The server-as-truth rule is what makes evals and audits possible (L343, L322).** If the conversation lives server-side, evals can read it, audits can trace it, and multi-device just works. Client-only state is invisible to the system that should verify it.
- **Model context is *not* a state store (L138).** The window is a working set with a token budget (L149) — never the place to "remember". Memory is a *server-side* design (L167), and the context is rebuilt from it per request.
- **The state boundaries are the testing boundaries (L341).** A UI that's a pure renderer of server state is testable; a server that owns the conversation is testable; the model context builder is testable. The split *is* the testability.
- **Agent state is this lesson at loop scale (L207).** The plan, the step record, the memory — server-side and durable; the model's context rebuilt per step. A senior agent design (L200) is a state model, not a clever prompt.
- **State is where multi-tenancy bites (L320).** Server state must be scoped per tenant; a leak in the state layer is a tenant leak. The state model is a security boundary, not just an architecture detail.

## 8. Common Mistakes

- **History in the client (L166).** Lost on refresh, invisible to evals, unshareable — the demo's tell.
- **UI state as truth.** `isLoading` deciding business logic instead of rendering server state (L162).
- **The context window as memory (L138).** Stuffing everything into the prompt to "remember" — the budget explodes (L149) and the model still forgets.
- **No server state at all.** Every request is stateless (L166) — no conversation, no session, no memory, no audit.
- **Mixing lifetimes.** A tool step record treated as ephemeral UI state (L213) — the audit trail vanishes.
- **Unscoped server state (L320).** Conversation stored without tenant isolation — a state leak is a tenant leak.

## 9. Best Practices

- **Classify every piece of state** — local (renders), server (stores), model (works) — before writing it.
- **Keep the server as the source of truth** (L166) — the UI renders it, the model is fed from it.
- **Build the model context per request** (L138) — system + history slice + retrieved docs, within the budget (L149).
- **Persist tool steps server-side** (L213) — the record is the audit and the observability.
- **Scope server state per tenant** (L320) — the state layer is a security boundary.
- **Make the UI a pure renderer of server state** (L162, L341) — testable, restorable, shareable.

## 10. Interview Questions

**Q: Where does state live in an AI app?**
> A: Three places. Local UI state — streaming, tool-running, the draft — in the client, ephemeral (L162). Server conversation state — history, session, memory — server-side, durable, per user (L166, L167). And the model's context — the working set it attends over — fed from server state per request (L138).

**Q: Why is server state the source of truth, not the UI?**
> A: Because the UI is ephemeral — it dies on refresh and lives per device. The conversation must survive, be shareable, and be readable by evals (L343) and audits (L322). If the server owns the truth, the UI is a pure renderer and everything else can trust the record.

**Q: Is the context window a place to store state?**
> A: No — it's a working set with a token budget (L138, L149). It's built from server state per request and evaporates when the generation ends. "Remembering" is a server-side design (L167); the context is the model's notepad, filled from the cabinet, never the cabinet itself.

**Q: How does this scale to an agent (L207)?**
> A: Same split, loop scale. The plan, the step history, and the memory are server state — durable, per session, scoped (L320). The model's context is rebuilt per step from that state. An agent is this state model running in a loop (L200) — which is why agent reliability is a state design problem.

## 11. Follow-Up Questions

- How does conversation management use this state model (L166)?
- What's the difference between state and memory (L167)?
- How does agent state persistence work (L207)?
- How does tenant isolation apply to the state layer (L320)?
- How does the state split make the app testable (L341)?

## 12. Comparison Table — The Three Stores

| Store | Lives | Lifetime | Job | Death |
|---|---|---|---|---|
| Local UI state | client | ephemeral | render (L162) | refresh |
| Server state | server | durable | store, truth (L166) | retention policy |
| Model context | per request | transient | work (L138) | generation ends |

The senior read: **the table is the classification rule** — ask "what is this state *for*?" and the answer puts it in exactly one store. Rendering → local; truth → server; working → model.

## 13. Code Example — The State Split in a Chat

```js
// The three-way split, in one feature: local renders, server stores, model works.

// 1 · SERVER — the source of truth (L166). The conversation persists here.
export async function POST(req) {
  const { message, sessionId } = await req.json();
  const session = await loadSession(sessionId);          // durable (L166)
  session.messages.push({ role: 'user', content: message });

  // 2 · MODEL CONTEXT — built per request, within the budget (L138, L149).
  const context = buildContext(session);                 // system + history + docs
  const stream = streamText({ model, messages: context.messages, tools });
  await saveSession(sessionId, session);                 // the cabinet is updated
  return stream.toDataStreamResponse();
}

// 3 · LOCAL — the UI is a pure renderer of server state (L162, L341).
export function Chat() {
  const { messages } = useChat();                        // renders, never stores
  return messages.map((m) => <MessageBubble key={m.id} message={m} />);
}
```

```text
What the reader must SEE — one flow, three stores:

  server   loadSession → append → save   (the truth, L166)
  model    buildContext → streamText     (the working set, L138)
  local    useChat renders                (the whiteboard, L162)

  Refresh? → the server restores.  Eval? → reads the server.
  The UI never holds the truth.
```

```narrate
6-8: Server state loads and appends — the conversation is the durable record (L166).
10-12: The model context is BUILT per request from server state, within the budget (L138, L149).
14: The server saves after the turn — the cabinet is always current.
17-19: The UI renders server-fed state — a pure renderer, testable and restorable (L162, L341).
```

> [!TIP]
> The discipline in one line: **`loadSession` on the way in, `saveSession` on the way out, `useChat` only renders.** Local state that stores, or model context that remembers, is the tangle this lesson exists to prevent.

## 14. Performance Notes

- **State I/O is per-request (L151).** Loading and saving the session bracket the model call; keep it fast and cache where possible (L171) or it eats TTFT (L145).
- **The context builder is the token-budget gate (L149).** Building the model's context per request is where the budget is enforced — history trimming (L166), retrieval tightness (L189).
- **Server state scales with sessions (L150).** Storage and retrieval cost grow with users; per-tenant partitioning (L320) and retention policy are the cost controls.
- **Local state is cheap but never authoritative** — the ephemeral store costs nothing but holds nothing.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| History lost on refresh | History in client state (L166) | Move to server state |
| UI decides business logic | Local state used as truth (L162) | Render server state instead |
| Context budget explodes | Window used as memory (L138) | Trim history (L166); retrieve (L189) |
| Audit trail missing | Tool steps not persisted (L213) | Save steps server-side |
| Tenant A sees tenant B | State unscoped (L320) | Partition server state per tenant |

## 16. Quick Revision Notes

- State splits **three ways**: local (render), server (truth), model context (work) — L162, L166, L138.
- **Local renders, never stores.** **Server stores, is the truth.** **Model context works, evaporates.**
- The flow is **one-way**: server → model context; server → UI renderer.
- Server state is what **evals (L343), audits (L322), and multi-device** read.
- The context window is **a working set, not a database** (L138, L149).
- Agent state (L207) is **this split at loop scale**, scoped per tenant (L320).

## 17. Cheat Sheet

```text
AI APP STATE = three stores, one flow

  LOCAL (UI, L162)        client · ephemeral · RENDERS
    streaming? tool-running? draft — dies on refresh
  SERVER (L166)           server · durable · THE TRUTH
    conversation · session · memory · tool steps (L213)
  MODEL CONTEXT (L138)    per request · transient · WORKS
    system + history + docs — the working set, then gone

FLOW
  server ──feeds──▶ model context (per request, budgeted L149)
  server ──feeds──▶ UI renderer (local, ephemeral)

RULES
  local renders, never stores
  server stores, is the source of truth
  model context works, never remembers (memory = L167, server-side)
  scope server state per tenant (L320)

PAYOFF
  no history loss on refresh (L166)
  evals and audits read the server (L343, L322)
  the UI is a testable pure renderer (L341)

INTERVIEW, 4 MOVES
  1 split   "local renders, server stores, model works"
  2 flow    "server feeds both, one-way"
  3 rules   "render / truth / work — three jobs, three stores"
  4 payoff  "no loss, auditable, testable, scoped"
```

## 18. Key Takeaways

> [!RECAP]
> - AI app state splits **three ways**: local UI state (renders, L162), server conversation state (stores, the truth, L166), and the model's context (works, the working set, L138)
> - The flow is **one-way**: the server feeds the model's context per request (budgeted, L149) and feeds the UI renderer
> - **Local renders, never stores; server stores, is the truth; model context works, evaporates** — the three rules that keep the app untangled
> - Server state is what **evals (L343), audits (L322), and multi-device sessions** read — client-only state is invisible to the system that should verify it
> - The **context window is a working set, never a database** (L138) — memory is a server-side design (L167)
> - **Agent state (L207) is this split at loop scale** — scoped per tenant (L320), and the reason agent reliability is a state problem

## Check your understanding

Answer these without looking back.

1. Name the three state stores and the job of each.
2. What is the one-way flow between them?
3. Why is server state the source of truth (L166)?
4. Why is the context window not a place to store state (L138)?
5. What happens when local state is treated as truth (L162)?
6. How does the state split make evals and audits possible (L343, L322)?
7. How does this scale to agent state (L207)?
8. Why is the state layer a security boundary (L320)?

## A Closing Note — The Three Stores That Hold the App

You now hold the state model underneath every AI app: **local renders, server stores, model works — three stores, one-way flow.** It's the layer that makes conversation management (L166), memory (L167), and agent persistence (L207) coherent — and the discipline that keeps an AI app from tangling its UI, its truth, and its working set into one messy pile.

Next: conversation management (L166) — history, truncation, and summarisation, the shape of a session inside the server state store.
