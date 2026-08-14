# Lesson 173 — Production AI Patterns (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of AI Application Engineering: reassembling L158–L172 into *one architecture* — and the milestone for M19 is building a streaming, tool-calling AI app with the SDK.

This is the last lesson of AI Application Engineering — and it's the synthesis the module was built toward. L158–L172 gave you the parts: architecture (L158), integration (L159), the SDK (L160), parts and states (L161), the streaming UI (L162), structured generation (L163), the tool loop (L164), state (L165), conversation (L166), memory (L167), errors (L168), retries (L169), rate limits (L170), caching (L171), and security (L172). This lesson **reassembles them into one production architecture** — the shape you'd actually ship.

The distinction this lesson is built on: a **specialist** knows the parts. A **solutions architect** can assemble them into a whole — and explain why each part sits where it does, what happens when each one fails, and how the whole thing is tested (L341) and evaled (L343). That assembly is M19's milestone: build a streaming, tool-calling AI app.

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L158–L172 into one production AI app architecture
- Draw the full request flow: UI → gateway → orchestration → tools → evals, with caching and resilience
- Explain each part's placement by its boundary — security (L172), cost (L150), latency (L151)
- Describe the failure behavior of the whole — retries (L169), rate limits (L170), caching (L171), degradation (L162)
- Defend the architecture in an interview: the parts, the boundaries, the trade-offs (L157)

## 1. One-Line Definition

**Production AI patterns is the synthesis of the module — the one architecture that assembles the gateway (L158, L172), the SDK and streaming UI (L160–L162), the tool loop (L164), state and memory (L165–L167), and the resilience layer (L168–L171) into a shipping system, each part placed by its boundary.**

The one-sentence interview answer: *"The production pattern assembles everything from this module. The UI streams and shows tool progress (L162); the gateway holds the key, enforces budgets and rate limits (L149, L170, L172); orchestration runs the tool loop and conversation (L164, L166) with memory (L167); the resilience layer retries, caches, and degrades (L169–L171); and evals verify the output (L343). Every part is placed by a boundary — the key server-side (L172), the budget before the call (L149), the output verified before the user (L343)."*

## 2. Mental Model

Think of the production AI app as **a well-run restaurant that also makes decisions** — this lesson is the *whole floor plan*, not any single station.

```text
   the floor plan (one production AI app)

   ┌──────────────────────────────────────────────────────┐
   │ FRONT (L162)        the streaming UI + tool progress │
   ├──────────────────────────────────────────────────────┤
   │ DOOR (L158, L172)   the gateway — key, auth, budget, │
   │                     rate limit, log                  │
   ├──────────────────────────────────────────────────────┤
   │ KITCHEN (L164-167)  orchestration — tool loop,       │
   │                     conversation, memory             │
   ├──────────────────────────────────────────────────────┤
   │ RESILIENCE (L168-71) retries · backoff · rate limits │
   │                     · caching                        │
   ├──────────────────────────────────────────────────────┤
   │ INSPECTOR (L343)    evals — verify before serving    │
   └──────────────────────────────────────────────────────┘
```

The mental model is **the whole floor plan**: every station from the module, in its place, with the flow between them — and the milestone is being able to draw it and defend it.

## 3. Visual Flow — One Request Through the Whole Architecture

```text
   user: "what's my balance and can I pay the invoice?"
        │
        ▼
   ┌────────────────────────────────────────────────────────┐
   │ 1 · UI (L162)          sends the message, streams      │
   ├────────────────────────────────────────────────────────┤
   │ 2 · GATEWAY (L172)     auth → validate → budget (L149) │
   │                        → rate limit (L170) → log       │
   ├────────────────────────────────────────────────────────┤
   │ 3 · CACHE (L171)       exact repeat? → serve, no call  │
   ├────────────────────────────────────────────────────────┤
   │ 4 · ORCHESTRATION      load conversation (L166) +      │
   │                        memory (L167) → build context   │
   ├────────────────────────────────────────────────────────┤
   │ 5 · MODEL + TOOLS      stream (L145) · tool loop (L164)│
   │                        · structured output (L163)      │
   │                        · retries (L169) if it fails    │
   ├────────────────────────────────────────────────────────┤
   │ 6 · EVALS (L343)       verify the output               │
   ├────────────────────────────────────────────────────────┤
   │ 7 · WRITE BACK         save the turn (L165), cache it  │
   └────────────────────────────────────────────────────────┘
        │
        ▼
   the verified answer streams back through the door to the UI
```

The flow is the module in one diagram: **UI → gateway → cache → orchestration → model+tools → evals → write-back.** Every lesson has a station, and the flow between them is the architecture.

## 4. How It Works — The Assembly, Part by Part

- **The front (L162).** The streaming UI renders parts and states (L161) — text, tool progress, cancellation, honest end states. It's a pure renderer of server state (L165), never the truth, never holding the key (L172).
- **The door (L158, L172).** The gateway: auth (L239), input validation (L315), the token budget (L149), rate limits (L170), and the log (L213). The key lives here (L275). Everything else trusts the door.
- **The cache (L171).** Exact repeats served free; the byte-stable prompt prefix cached by the provider. The first cost and latency lever (L150, L151).
- **The kitchen (L164–L167).** Orchestration: the tool loop (L164) with validation and human gates (L315, L208), conversation management (L166) with the curator, memory (L167) retrieved and written back. The product's logic lives here.
- **The resilience (L168–L171).** Errors classified (L168), retried with backoff (L169), rate-limited deliberately (L170), and the whole thing cached (L171). The app survives the provider.
- **The inspector (L343).** Evals verify the output — groundedness (L337), schema (L143), the golden set in CI (L341). The health check before the plate is served.

> [!NOTE]
> **The assembly rule: every part is placed by a boundary.** The key is server-side because of the trust boundary (L172). The budget is before the call because of the cost boundary (L149, L150). The output is verified before the user because of the quality boundary (L343). The tool executes server-side because of the authority boundary (L315). An architect who can name the boundary for each part can defend the whole assembly.

## 5. Real Project Usage

- **A production chat product.** Every station in the floor plan: streaming UI, gateway, cache, conversation (L166), resilience, evals.
- **A copilot / agent UI (L200-adjacent).** The tool loop (L164) is the product; the streaming UI renders its steps (L162); memory (L167) and conversation (L166) hold the session; the resilience keeps the loop alive (L169).
- **An AI SaaS (L357-adjacent).** The gateway adds per-tenant budgets (L149, L318) and isolation (L320); the cache and tiering (L157) are the cost model; the evals are the quality contract (L343).
- **An extraction pipeline (L163).** Structured generation end to end; the response cache (L171) serves repeats free; the resilience re-asks on malformed (L163, L168).
- **Anything "production AI".** The pattern is the shape: front, door, cache, kitchen, resilience, inspector. Different products, same floor plan.

The through-line: **the floor plan is the module's output** — the assembly every AI product shares, and the milestone is building it with the SDK (L160) and defending it in the interview.

## 6. Interview Explanation

Say it in four moves:

1. **The assembly.** "The production pattern is the whole module in one architecture: UI (L162), gateway (L172), cache (L171), orchestration (L164–L167), resilience (L168–L171), and evals (L343)."
2. **The flow.** "A request streams from the UI through the door (auth, budget, rate limit) to the kitchen, which runs the tool loop and conversation, and the verified answer streams back."
3. **The boundaries.** "Every part is placed by one: the key server-side (L172), the budget before the call (L149), the tool executed with authority (L315), the output verified (L343)."
4. **The resilience.** "The provider fails in known classes (L168) — retried (L169), rate-limited (L170), cached (L171), degraded gracefully (L162). The app survives; the user never sees a crash."

## 7. Senior-Level Insights

- **The architecture is the sum of its boundaries (L158, L172).** A senior review of an AI app checks the boundaries first: where's the key, where's the budget, where do tools execute, where's the verification? Naming each is the review.
- **The resilience layer is what makes it production (L168–L171).** A demo works when the provider works; a production app works when the provider *doesn't*. The classification (L168), retries (L169), limits (L170), and cache (L171) are the difference — and the milestone's "production" is in this layer.
- **Caching and tiering are the economics (L157, L171).** The cost model (L150) is realized by the cache (L171) and the tiered routing (L157). The floor plan's money is made in the resilience layer.
- **Evals close the loop (L343).** The inspector makes the stochastic system *accountable* — and it's the boundary the module hands to the observability module (L328+). Production AI without evals is production hope.
- **The assembly is testable per layer (L341).** The gateway, the curator (L166), the retry policy (L169), the renderer (L162) — each a testable unit; the whole is tested by the golden set (L343). The floor plan's testability is its architecture's quality.

## 8. Common Mistakes

- **Building only the kitchen.** Orchestration without the door (L172), the resilience (L168), or the inspector (L343) — a demo that works when everything else works.
- **The door with no cache or resilience.** Security and budget, but no retries (L169) or caching (L171) — the app is safe and slow and breaks.
- **The inspector bolted on.** Evals (L343) after shipping instead of in the pipeline — the quality boundary arrives after the users do.
- **Parts without boundaries.** The key in the client (L172), the tool executing client-side (L315), the budget checked after the call (L149) — the assembly with its boundaries missing.
- **No write-back.** The conversation never saved (L165), the cache never written (L171) — every turn starts cold, every repeat pays full price.
- **The floor plan without the trade-offs.** Can't name what the architecture costs (L150), how it fails (L168), or what would make you change it (L157) — the interview's final question.

## 9. Best Practices

- **Draw the floor plan before writing code** — the six stations and the flow between them (L158).
- **Place every part by its boundary** — key (L172), budget (L149), authority (L315), verification (L343).
- **Build the resilience in** (L168–L171) — the app is production when the provider isn't.
- **Make the cache and tiering the economics** (L157, L171) — the cost model (L150) with enforcement.
- **Wire the evals into the pipeline** (L343) — the inspector is a station, not an afterthought.
- **Write back** — the conversation (L165), the cache (L171), the memory (L167) — so the next turn starts warm.

## 10. Interview Questions

**Q: Walk me through a production AI app's architecture.**
> A: Six stations (L158). The UI streams and shows tool progress (L162). The gateway holds the key, validates, and enforces budget (L149) and rate limits (L170, L172). The cache serves repeats (L171). Orchestration runs the tool loop (L164), conversation (L166), and memory (L167). The resilience layer retries, backs off, and degrades (L168–L171). And evals verify the output (L343). A request flows through all six, and the verified answer streams back.

**Q: What makes this production and not a demo?**
> A: The resilience and the boundaries (L168, L172). A demo works when the provider works; this app works when the provider doesn't — errors classified (L168), retried (L169), rate-limited (L170), cached (L171), degraded gracefully (L162). And every boundary is in place: the key server-side (L172), the budget before the call (L149), tools executed with authority (L315), output verified (L343).

**Q: Where's the money in this architecture?**
> A: The economics are the cache and the tiering (L157, L171). The response cache serves repeats free; the prompt cache cuts the prefix to ~10% (L150); tiered routing (L157) sends the easy traffic to the cheap model; per-user caps (L318) bound the demand. The cost model (L150) is realized in the resilience layer.

**Q: How would you change it for an agent (L200)?**
> A: The floor plan stays; the kitchen changes. The tool loop (L164) becomes the agent loop with a plan and termination (L202, L205); memory (L167) becomes agent memory (L206); the conversation curator (L166) manages the step history (L207). The door, the resilience, and the inspector are unchanged — an agent is this architecture with a smarter kitchen.

## 11. Follow-Up Questions

- Which boundary is the hardest to keep, and why (L172, L315)?
- How do the evals verify a streaming output (L343)?
- How does the cache interact with the budget and rate limits (L149, L170)?
- What's the cost model of this architecture (L150, L157)?
- How does the floor plan change for a multi-tenant SaaS (L357)?

## 12. Comparison Table — Demo vs the Production Assembly

| Station | Demo | Production (this lesson) |
|---|---|---|
| UI (L162) | renders when done | streams, shows tool progress |
| Gateway (L172) | none | key, auth, budget (L149), limit (L170), log |
| Cache (L171) | none | response + prompt cache |
| Orchestration (L164–167) | one call | tool loop, conversation, memory |
| Resilience (L168–171) | none | retries, backoff, limits, degrade |
| Evals (L343) | none | verify before serving |

The senior read: **the table is the milestone** — M19's claim is building the right column with the SDK (L160), and defending it with the left column's failures in mind.

## 13. Code Example — The Assembly in One Route

```js
// The production assembly: every station, in one request (L158-172).
export async function POST(req) {
  // THE DOOR (L172): auth → validate → budget → rate limit → log.
  const session = await authenticate(req);                  // L239
  const body = ChatRequestSchema.parse(await req.json());   // L315
  const budget = await checkBudget(session.user, body);     // L149
  if (!budget.ok) return error(429, 'over budget');
  if (!(await rateLimit(session.user)).ok) return error(429, 'rate limited'); // L170

  // THE CACHE (L171): an exact repeat is served with no call.
  const key = cacheKey(body);
  const hit = await redis.get(key);
  if (hit) return Response.json(JSON.parse(hit), { headers: { 'X-Cache': 'HIT' } });

  // THE KITCHEN (L164-167): conversation, memory, the tool loop.
  const sessionState = await loadSession(session.user.id);  // L166
  const memory = await retrieveMemory(session.user.id, body.question); // L167

  // THE MODEL + RESILIENCE (L168-171): stream, retry on failure.
  const result = streamText({
    model: openai(budget.tier),                             // L157
    system: FROZEN_SYSTEM,                                  // L142 — the cache key
    messages: buildContext(sessionState, memory),           // L138
    tools: { get_balance, pay_invoice },                    // L164 — scoped, gated
  }).pipeThrough(retryStream());                            // L169

  // WRITE BACK (L165, L171) + EVALS (L343).
  result.onFinish(async ({ text }) => {
    await saveSession(session.user.id, sessionState);       // L165
    await verify(text);                                     // L343 — the inspector
    await redis.set(key, text, { ex: ttlFor(body) });       // L171
  });

  return result.toDataStreamResponse();                     // L145, L162
}
```

```text
What the reader must SEE — the whole module in one route:

  door        auth · validate · budget · rate limit (L149, L170, L172)
  cache       exact repeat → no call (L171)
  kitchen     conversation (L166) · memory (L167) · tools (L164)
  resilience  retry stream (L169)
  write-back  save (L165) · cache (L171) · verify (L343)

  Six stations, one request, every boundary in place.
```

```narrate
6-10: The door — auth, schema validation, budget (L149), rate limit (L170). Nothing passes unguarded (L172).
12-15: The cache — an exact repeat is served without a provider call (L171).
17-19: The kitchen — the conversation (L166) and memory (L167) build the context (L138).
21-27: The model with scoped, gated tools (L164, L315) and a retry stream (L169).
30-34: Write-back saves the session (L165), caches the repeat (L171), and verifies the output (L343).
```

> [!TIP]
> This route is M19's milestone in one file: **the door, the cache, the kitchen, the resilience, and the inspector** — assembled, streaming, tool-calling, and every boundary named. Build this and you can build any AI product; the modules ahead (RAG L174+, agents L198+) are this floor plan with different kitchens.

## 14. Performance Notes

- **The door gates TTFT (L151)** — auth, validation, and the counters must be fast (Redis, L243); the security steps add microseconds, not milliseconds.
- **The cache is the latency and cost lever (L171)** — a hit skips the entire kitchen and the provider (L150, L151).
- **The resilience bounds the worst case (L168–L169)** — timeouts and bounded retries cap the latency (L151) and the cost (L150).
- **Write-back is off the hot path (L151)** — save, cache, and verify asynchronously after the stream, so the response isn't delayed.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Works in dev, breaks in prod | The resilience missing (L168) | Classify, retry (L169), degrade (L162) |
| Bills with no users | Leaked key (L172) or no caps (L318) | Rotate (L275); per-user caps |
| Repeats pay full price | No response cache (L171) | Add the cache at the gateway |
| Long sessions degrade | Conversation not curated (L166) | Add the curator + budget trigger |
| Unverified answers shipped | No evals in the pipeline (L343) | Add the inspector before serving |

## 16. Quick Revision Notes

- The production pattern = **six stations**: UI (L162), gateway (L172), cache (L171), orchestration (L164–167), resilience (L168–171), evals (L343).
- The flow: **UI → door → cache → kitchen → model+tools → inspector → write-back.**
- **Every part is placed by a boundary**: key (L172), budget (L149), authority (L315), verification (L343).
- **Resilience is what makes it production** — the app works when the provider doesn't (L168).
- **The economics are the cache and tiering** (L157, L171) — the cost model (L150) with enforcement.
- The milestone: **build the assembly with the SDK (L160) and defend it** — this route is the shape.

## 17. Cheat Sheet

```text
PRODUCTION AI PATTERNS = the whole module, one architecture

THE SIX STATIONS
  UI (L162)         streams · tool progress · honest states
  GATEWAY (L172)    auth · validate · budget (L149) · limit (L170) · log
  CACHE (L171)      response (repeats) + prompt (prefix)
  KITCHEN (L164-67) tool loop · conversation (L166) · memory (L167)
  RESILIENCE (L168-71) classify · retry (L169) · limit · cache · degrade
  INSPECTOR (L343)  verify before serving

THE FLOW
  UI → gateway → cache → orchestration → model+tools → evals → write-back

THE BOUNDARIES (what places each part)
  the key server-side (L172)      → the gateway
  the budget before the call (L149) → the gateway
  tools executed with authority (L315) → the kitchen
  output verified (L343)          → the inspector

RULES
  production = works when the provider doesn't (L168)
  the economics = cache (L171) + tiering (L157)
  every station is testable (L341); the whole is evaled (L343)
  write back — save, cache, remember (L165, L167, L171)

INTERVIEW, 4 MOVES
  1 assembly "six stations, one floor plan"
  2 flow     "UI → door → cache → kitchen → inspector"
  3 boundaries "key, budget, authority, verification"
  4 milestone "build it with the SDK (L160) — that's M19"
```

## 18. Key Takeaways

> [!RECAP]
> - Production AI patterns is **the module's synthesis**: six stations — UI (L162), gateway (L172), cache (L171), orchestration (L164–L167), resilience (L168–L171), and evals (L343) — in one architecture
> - The flow is **UI → gateway → cache → orchestration → model+tools → evals → write-back** — every lesson has a station
> - **Every part is placed by a boundary**: the key server-side (L172), the budget before the call (L149), tools executed with authority (L315), the output verified (L343)
> - **Resilience is what makes it production** — the app works when the provider doesn't: classified failures (L168), bounded retries (L169), deliberate limits (L170), caching (L171), graceful degradation (L162)
> - **The economics are the cache and the tiering** (L157, L171) — the cost model (L150) realized in the resilience layer
> - **M19's milestone is this assembly**: build a streaming, tool-calling AI app with the SDK (L160) — the route in section 13 is the shape

## Check your understanding

Answer these without looking back.

1. Name the six stations and the flow between them.
2. What boundary places each station where it is?
3. What makes the assembly production rather than a demo (L168)?
4. Where is the money in the architecture (L150, L157, L171)?
5. What does the inspector do, and where does it sit (L343)?
6. Why is write-back part of the pattern (L165, L171)?
7. How does the floor plan change for an agent (L200)?
8. What is M19's milestone, and how does this lesson meet it?

## A Closing Note — The Floor Plan You Can Build

That was the last lesson of AI Application Engineering — and the first one you'll *ship*. L158–L172 gave you the stations; this lesson gave you the floor plan: **six stations, the flow between them, the boundaries that place each one, and the resilience that makes it production.** When you can draw it, build it with the SDK (L160), and defend it — naming the key's home (L172), the budget's timing (L149), the tool's authority (L315), and the inspector's seat (L343) — you have claimed Milestone M19.

The next module turns the floor plan into *knowledge*: RAG / Knowledge Systems (L174–L197) — ingestion, chunking, retrieval, reranking, and the evaluation that makes retrieval trustworthy. You've built the app; now you'll teach it to know your data.
