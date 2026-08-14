# Lesson 158 — AI Application Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "walk me through the architecture of an AI app" is the opening question of the AI Application Engineering phase; this lesson is the map of the parts.

Module 7 gave you the model and the decision rule (L157). This lesson is the **map of the application** the rule runs inside: the parts every production AI app shares — UI, gateway, orchestration, tools, memory, evals — and how they fit together. You can't build a streaming UI (L162), a tool loop (L164), or a conversation manager (L166) until you can see the whole system they live in.

The distinction this lesson is built on: a **demo builder** has an input, an API call, and a render. A **solutions architect** can decompose an AI app into named components — where the key lives, where the stream is proxied, where the tool executes, where memory is stored, where the evals run — and explain why each part is where it is. That decomposition is the interview.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the parts of an AI application: UI, gateway, orchestration, tools, memory, evals
- Explain where the provider key lives, and why (L172)
- Explain why the gateway proxies the stream and enforces budgets (L170, L172)
- Place the tool loop, conversation state, and memory in the architecture (L164–L167)
- Draw the architecture of a chat, a copilot, and an agent from these parts

## 1. One-Line Definition

**AI application architecture is the arrangement of the parts every production LLM app shares — UI, gateway, orchestration, tools, memory, and evals — where each part has a job, a security boundary, and a cost line, and the whole thing is a pipeline from user input to verified output.**

The one-sentence interview answer: *"An AI app is six parts. The UI renders the stream (L162); the gateway holds the key, proxies the call, and enforces budgets (L170, L172); orchestration runs the logic — the tool loop (L164), the conversation shape (L166); tools are the app's capabilities, executed by the server with least privilege (L144); memory is the session state that survives (L167); and evals verify the output (L343). The architecture is where each part lives, who owns it, and how they fail."*

## 2. Mental Model

Think of an AI app as a **restaurant with a strict kitchen** — the customer (UI) orders, the waiter (gateway) takes the order to the kitchen and carries back dishes as they're ready (streaming, L145), the chef (orchestration) decides the sequence, the pantry (memory) holds what's been ordered before, and the health inspector (evals) checks the plates before they're served.

```text
   the customer          the waiter             the kitchen
   ┌────────────┐   ┌──────────────────┐   ┌─────────────────────┐
   │ UI         │   │ GATEWAY          │   │ ORCHESTRATION       │
   │ renders    │──▶│ holds the key    │──▶│ tool loop (L164)    │
   │ the stream │   │ proxies + budget │   │ conversation (L166) │
   └────────────┘   └──────────────────┘   │ memory (L167)       │
                                            └─────────┬───────────┘
                                                      │ tools (L144)
                                                      ▼
                                            ┌─────────────────────┐
                                            │ EVALS (L343) verify │
                                            │ the output          │
                                            └─────────────────────┘
```

The mental model is a **pipeline with named stops** — and the architect's job is knowing what happens at each stop, and why it can't happen anywhere else.

## 3. Visual Flow — The Six Parts in One Request

```text
   User types: "what's AAPL doing?"
        │
        ▼
   ┌────────────────────────────────────────────────────────┐
   │ 1 · UI (client)                                        │
   │     streams tokens (L162), shows tool progress (L164)  │
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 2 · GATEWAY (server)                                   │
   │     auth (L172) · rate limit (L170) · token budget (L149)│
   │     holds the provider key — NEVER in the client       │
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 3 · ORCHESTRATION (server)                             │
   │     call the model (L152-154) · stream (L145)          │
   │     conversation state (L166) · memory (L167)          │
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 4 · TOOL LOOP (server, L164)                           │
   │     model declares a tool → server executes (L144)     │
   │     → result back in context → continue                │
   └──────────────────┬─────────────────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ 5 · EVALS (L343)                                       │
   │     groundedness / schema / safety checks on output    │
   └────────────────────────────────────────────────────────┘
                      │
                      ▼
   the verified answer streams back to the UI
```

The flow is the architecture: **UI → gateway → orchestration → tools → evals**, with memory and state spanning the request. Every AI app is this pipeline at a different depth.

## 4. How It Works — The Six Parts, and Why Each Is Where It Is

- **UI (client).** Renders the stream (L162), owns the *display* state — is it typing, streaming, tool-running, errored? It never holds the key, never calls the provider directly.
- **Gateway (server).** The security and budget boundary (L172): auth, rate limiting (L170), token budgeting (L149), and the provider key. The client talks to the gateway; the gateway talks to the provider. This is why the stream is *proxied* — the key never leaves the server.
- **Orchestration (server).** The logic layer: which model (L157), what context (L138), the tool loop (L164), conversation management (L166), memory (L167). This is the part that makes the app an *application* rather than a prompt form.
- **Tools (server).** The app's capabilities (L144): search, query, write. Executed by the server with least privilege (L315) — the model declares, the server runs.
- **Memory (server + store).** Session state and long-term recall (L167): conversation history (L166), user preferences, retrieved knowledge. The shape of a session is an architecture decision.
- **Evals (offline + runtime).** Verification (L343): the golden set in CI (L341), and runtime checks on the output (groundedness, L337; schema, L143). The health inspector catches the plate before it's served.

> [!NOTE]
> **The load-bearing rule: the key stays server-side.** The client never holds the provider key — a client-side key is a leaked key (L172). That single rule forces the gateway into existence, and the gateway is what makes rate limiting (L170), budgeting (L149), and proxying (L145) possible at all. If the architecture has no gateway, it has a security hole.

## 5. Real Project Usage

- **A chat product.** UI streams (L162); gateway holds the key and budget (L170, L172); orchestration manages the conversation (L166); memory stores history (L167); evals check groundedness (L337).
- **A copilot.** The same six parts, with tools doing the heavy lifting (L164): the model declares "run this command", the server runs it, the result streams back. The tool loop *is* the product.
- **An extraction pipeline.** UI is minimal; the gateway batches; orchestration is the schema + validation (L143, L163); evals are the precision/recall gates (L343). Same architecture, different emphasis.
- **An agent.** Orchestration becomes a loop (L200): plan → tool → observe → plan, with memory and state spanning steps (L206, L207), and evals on task completion (L340).
- **An AI SaaS.** The gateway adds per-tenant budgets and tenant isolation (L320, L357); evals become the product's quality contract (L328+).

The through-line: **the six parts are the common skeleton** — every AI app is this pipeline with different emphasis, and the architect's skill is placing each part where its job, its security boundary, and its cost line live.

## 6. Interview Explanation

Say it in four moves:

1. **The map.** "An AI app is six parts: UI, gateway, orchestration, tools, memory, evals — a pipeline from user input to verified output."
2. **The boundaries.** "The gateway holds the key and enforces budgets (L170, L172); tools execute server-side with least privilege (L144); memory and state live server-side (L166–L167); evals verify before the answer ships (L343)."
3. **The flow.** "A request streams from the UI through the gateway to orchestration, which runs the tool loop and conversation, then the verified answer streams back (L145)."
4. **The why.** "Each part is where it is because of a boundary: the key never leaves the server, the budget is enforced before the call, and the output is verified before the user trusts it."

## 7. Senior-Level Insights

- **The architecture is the security model, not a diagram.** Where the key lives (L172), where tools execute (L315), where tenant isolation happens (L320) — those placements *are* the security architecture. The senior answer places them deliberately.
- **The gateway is the cost and governance boundary (L150, L170).** Rate limits, token budgets, per-tenant caps — all enforced in one place, before the provider is called. The gateway is where "cost optimization" (L150) stops being a model and becomes a control.
- **Orchestration is where the product lives.** The model is swappable (L155); the tool loop, the conversation shape, and the memory are the product's logic — and they're what the evals (L343) actually measure.
- **Memory and evals are the moat (L167, L328).** Anyone can call the API (L152–L154); the accumulated session memory and the eval data are the parts that get better with your product. The architecture's value compounds there.
- **The pipeline is recursively composable.** Each part can itself be an AI app — an agent is orchestration + tools + memory; a RAG pipeline is retrieval + orchestration + evals (L174). Naming the recursion is a senior signal.

## 8. Common Mistakes

- **The key in the client.** A leaked provider key (L172) — the single most common and most expensive AI-app mistake. The gateway exists for this.
- **No gateway.** Client → provider directly: no rate limiting (L170), no budget (L149), no tenant caps (L357), no audit (L322). The architecture without a boundary is a liability.
- **State in the client.** Conversation history and memory living client-side (L166, L167) — lost on refresh, unshareable, unverifiable. Server-side state is the session.
- **Tools executing with the client's privileges.** A tool call running with the wrong scope (L315) — the model declares, the *server* decides with least privilege.
- **No evals.** Shipping a stochastic output with no verification (L343) — the health inspector never comes, and the failure surface (L141) reaches the user.
- **Orchestration in the component.** Business logic (tool loops, memory) in the React component (L165) — untestable, unshareable, and the state model (L161) gets lost.

## 9. Best Practices

- **Draw the six parts before writing code** — the pipeline is the design doc; the code is the implementation.
- **Keep the key server-side, always** (L172) — the gateway is non-negotiable.
- **Enforce budgets and rate limits at the gateway** (L149, L170) — one place, before the call.
- **Run tools server-side with least privilege** (L144, L315) — the model declares, the server executes.
- **Store conversation state and memory server-side** (L166, L167) — the session survives, and evals can see it.
- **Verify with evals before the answer ships** (L343) — the health inspector is part of the pipeline.

## 10. Interview Questions

**Q: Walk me through the architecture of an AI app.**
> A: Six parts. The UI renders the stream (L162). The gateway holds the key, proxies the call, and enforces rate limits and token budgets (L170, L172). Orchestration runs the logic — the model call, the tool loop (L164), the conversation shape (L166). Tools execute server-side with least privilege (L144). Memory holds the session (L167). And evals verify the output before it ships (L343). A pipeline from user input to verified output.

**Q: Why does the gateway proxy the stream?**
> A: Three reasons. The key must never reach the client (L172). The gateway is where rate limits (L170) and token budgets (L149) are enforced, before the provider is called. And it's where per-tenant governance lives (L357). The proxy isn't plumbing — it's the security and cost boundary.

**Q: Where does the tool loop live, and why?**
> A: Server-side, in orchestration (L164). The model declares a tool call (L144); the server executes it with least privilege (L315) and returns the result to context. It lives server-side because execution is a security decision — the model never runs anything; the server decides what runs, with the tenant's scope.

**Q: What makes this an architecture and not a demo?**
> A: The boundaries. The key is server-side (L172), budgets are enforced at the gateway (L149), tools run with least privilege (L315), state is server-side (L166), and output is verified by evals (L343). A demo has an input and a render; an architecture has named parts with jobs, boundaries, and failure modes.

## 11. Follow-Up Questions

- How does the gateway enforce token budgets (L149, L170)?
- Where does conversation state live, and why (L166)?
- What's the difference between memory and state (L167)?
- How does the tool loop change the architecture (L164)?
- How do evals fit into the runtime pipeline (L343)?

## 12. Comparison Table — The Six Parts

| Part | Job | Security boundary | Cost line |
|---|---|---|---|
| UI (client) | render the stream (L162) | never holds the key (L172) | display only |
| Gateway (server) | proxy, budget, rate-limit (L149, L170) | the key lives here | per-request tokens |
| Orchestration (server) | tool loop, conversation (L164, L166) | server-only logic | the model calls |
| Tools (server) | the app's capabilities (L144) | least privilege (L315) | the tool's cost |
| Memory (server+store) | session + recall (L167) | server-side storage | storage + retrieval |
| Evals (offline+runtime) | verify the output (L343) | outside the request path | eval runs (L328+) |

The senior read: **the table is the architecture review** — for each part, who owns it, what it can't do, and what it costs. Answer those three for all six and you've described the system.

## 13. Code Example — The Pipeline in One File

```js
// The six parts, sketched as one server route — the shape every AI app shares.
export async function POST(req) {
  const { prompt, tenantId } = await req.json();

  // 2 · GATEWAY — auth, budget, rate limit (L170, L172). The key stays here.
  const user = await auth(req);                       // L172
  await enforceRateLimit(tenantId);                   // L170
  const budget = budgetRequest({ question: prompt, maxTokens: 300 }); // L149
  if (!budget.ok) return error(429, 'over budget');

  // 3 · ORCHESTRATION — the conversation shape (L166) + the model call (L157).
  const history = await loadConversation(user.id);    // L166 — server-side state
  const stream = await openai.chat.completions.create({
    model: MODELS[budget.tier],                       // the rule, applied (L157)
    messages: [...history, { role: 'user', content: prompt }],
    max_tokens: budget.output,
    stream: true,
  });

  // 5 · EVALS — a runtime check on the streamed output (L343, L337).
  const verified = new TransformStream({
    transform(chunk, controller) {
      // ground-truth / schema checks as tokens arrive (L163, L337)
      controller.enqueue(chunk);
    },
  });

  // The verified answer streams back through the gateway to the UI (L145).
  return new Response(stream.pipeThrough(verified), { headers: SSE_HEADERS });
}
```

```text
What the reader must SEE — the parts in the code:

  gateway      → auth + rate limit + budget, before the call (L170, L172)
  orchestration → conversation state + the model call (L157, L166)
  tools        → (the loop lives here too, L164 — omitted for brevity)
  evals        → a runtime verification transform on the stream (L343)
  UI           → renders the proxied, verified stream (L162)
```

```narrate
6-7: The gateway: authentication and rate limiting happen before any model call (L170, L172).
8-9: The token budget (L149) is enforced server-side — an over-budget request never reaches the provider.
12-13: Conversation state loads server-side — the session survives the refresh (L166).
15-18: The model call uses the decision rule's tier (L157) and streams (L145).
21-26: Evals run as a transform on the stream — verification is part of the pipeline (L343).
```

> [!TIP]
> This is the skeleton every lesson in this module fills in: L162 builds the UI side, L164 the tool loop, L166 the conversation, L169–L171 the resilience, L172 the gateway's security. Hold this file and the module is "how to fill in each part".

## 14. Performance Notes

- **The gateway is the latency checkpoint (L151).** Auth, rate limit, and budget must be fast (milliseconds) or they eat TTFT (L145). Keep the pre-call path lean.
- **Streaming through the gateway adds one hop (L145).** The proxy must not buffer — a buffering gateway destroys the felt-quality the stream provides. Pipe, don't collect.
- **Conversation and memory are per-request I/O (L166, L167).** Load them before the call, cache where possible (L171), and keep them off the hot path.
- **Evals on the stream are a latency trade (L151).** A full groundedness check on every token is too slow; runtime checks are cheap heuristics, with the deep evals offline (L328+, L341).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Provider key in the bundle | The key leaked to the client (L172) | Move to the gateway; rotate the key |
| Requests bypass limits | No gateway / direct client calls | Route through the gateway (L170) |
| Stream arrives all at once | Gateway buffers instead of piping (L145) | Pipe the stream; disable buffering |
| State lost on refresh | Conversation lives client-side (L166) | Move history to the server |
| Unverified answers shipped | No evals in the pipeline (L343) | Add runtime checks + offline evals |

## 16. Quick Revision Notes

- Six parts: **UI, gateway, orchestration, tools, memory, evals** — a pipeline, not a diagram.
- **Gateway** = key, budget, rate limit (L149, L170, L172) — the security and cost boundary.
- **Orchestration** = the product logic — tool loop (L164), conversation (L166), memory (L167).
- **Tools** execute server-side, least privilege (L144, L315).
- **Evals** verify before the answer ships (L343).
- The rule that makes it an architecture: **the key never leaves the server.**

## 17. Cheat Sheet

```text
AI APP ARCHITECTURE = six parts, one pipeline

  UI            renders the stream (L162)      never holds the key
  GATEWAY       key · budget (L149) · rate limit (L170) · auth (L172)
  ORCHESTRATION model call (L157) · tool loop (L164) · conversation (L166)
  TOOLS         execute server-side, least privilege (L144, L315)
  MEMORY        session + recall, server-side (L167)
  EVALS         verify output, runtime + offline (L343)

THE FLOW
  user → UI → gateway → orchestration → tools → evals → verified answer

THE LOAD-BEARING RULES
  the key never leaves the server (L172)
  budgets enforced before the call (L149, L170)
  tools run with the server's least privilege (L315)
  state is server-side (L166) · output is verified (L343)

INTERVIEW, 4 MOVES
  1 map     "six parts, one pipeline"
  2 boundaries "key, budget, tools, state, evals"
  3 flow    "UI → gateway → orchestration → tools → evals"
  4 why     "each part placed by its boundary"
```

## 18. Key Takeaways

> [!RECAP]
> - An AI app is **six parts**: UI, gateway, orchestration, tools, memory, evals — a pipeline from user input to verified output
> - The **gateway** is the security and cost boundary: the key lives there (L172), budgets are enforced before the call (L149), rate limits apply (L170)
> - **Orchestration is the product logic** — the tool loop (L164), the conversation shape (L166), the memory (L167) — and it's what evals measure
> - **Tools execute server-side with least privilege** (L144, L315) — the model declares, the server decides
> - **Evals verify before the answer ships** (L343) — the health inspector is part of the pipeline
> - The rule that makes it an architecture: **the key never leaves the server** — and every lesson in this module fills in one part of this map

## Check your understanding

Answer these without looking back.

1. Name the six parts of an AI application.
2. Why must the gateway proxy the stream, not just the request (L145, L172)?
3. Where does the tool loop live, and why (L164)?
4. Why is conversation state server-side, not in the client (L166)?
5. Where do evals fit — and what's the difference between runtime and offline (L343)?
6. What's the single rule that makes this an architecture and not a demo?
7. Draw the flow of one request through all six parts.
8. How does this architecture differ for an agent vs a chat (L200)?

## A Closing Note — The Map You'll Fill In

You now hold the skeleton of every AI app: **six parts, one pipeline, and the rule that makes it an architecture — the key never leaves the server.** Every lesson in this module fills in one part: the SDK (L160) and streaming UI (L162) build the UI side; the tool loop (L164) and conversation management (L166) build orchestration; memory (L167), errors (L168), retries (L169), rate limiting (L170), and caching (L171) make it resilient; security (L172) hardens the gateway; and the synthesis (L173) reassembles the whole map.

Next: the integration patterns that connect these parts to the provider — where the call lives, how it's called, and how it fails (L159).
