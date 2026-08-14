# Lesson 167 — AI Memory

**Interview importance:** ⭐⭐⭐⭐ — "how does your AI remember?" is the product question; the answer is the *two-tier memory* — short-term context and long-term recall — and where each lives.

Lesson 166 gave you conversation management — the session's shape. This lesson is the **memory underneath**: the distinction between short-term memory (the context window, L138) and long-term memory (stored, retrievable facts), and the architecture that connects them. Every AI product that "remembers the user" — preferences, history, past decisions — is a memory design, and the interview rewards knowing the tiers.

The distinction this lesson is built on: a **user** thinks "the AI remembers me". A **solutions architect** knows the model remembers *nothing* — short-term memory is the context you feed it (L138), and long-term memory is a *store* you design: what to save, how to retrieve it (L147, L174), and how to get it back into context without blowing the budget (L149).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the two tiers: short-term memory (context, L138) and long-term memory (a store you design)
- Design long-term memory: what to save, how to store it, how to retrieve it (L147, L174)
- Get memory into context without blowing the budget (L149): retrieve the relevant, not the everything
- Distinguish memory from state (L165) and conversation management (L166)
- Explain the evals and privacy of memory: faithfulness (L337), retention (L322), consent

## 1. One-Line Definition

**AI memory is the two-tier architecture of what an AI can "remember" — short-term memory is the context window it attends over per request (L138), and long-term memory is a designed store of durable facts, retrieved into context on demand — because the model itself remembers nothing.**

The one-sentence interview answer: *"The model remembers nothing — memory is an architecture. Short-term memory is the context window (L138): what I feed the model this request. Long-term memory is a store I design: durable facts — preferences, history, decisions — saved server-side, retrieved on demand (L147, L174), and injected into the context within the token budget (L149). The two tiers, connected by retrieval, are what 'remembering' means."*

## 2. Mental Model

Think of AI memory as **a person with amnesia and a superb filing system** — the model is the person, and the filing system is your architecture.

```text
   short-term memory (the notepad, L138)     long-term memory (the cabinet)
   ┌──────────────────────────────┐         ┌──────────────────────────────┐
   │ what's on the desk NOW:      │         │ what's filed for later:      │
   │  this request's context      │         │  user preferences            │
   │  system + history + docs     │         │  past decisions              │
   │  evaporates per request      │  ───▶   │  facts learned               │
   └──────────────────────────────┘  retrieve│  stored server-side (L165)  │
        fed per request (L138)     ◀───      └──────────────────────────────┘
                                   inject    retrieved on demand (L147, L174)
```

The mental model is **two stores with a retrieval bridge**: the notepad (short-term) is filled per request; the cabinet (long-term) holds what survives; and the bridge — retrieval (L147, L174) — decides what moves from cabinet to notepad, within the budget (L149).

## 3. Visual Flow — Memory in One Request

```text
   user: "book my usual flight to Berlin"
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · LONG-TERM — retrieve what's relevant     │
   │     (L147, L174):                            │
   │     · user preferences (window seat)         │
   │     · past trips (Berlin, March)             │
   │     → from the memory store (L165)           │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · INJECT into short-term (L138, L149)      │
   │     system + retrieved memory + history +    │
   │     the question — within the budget         │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 3 · the model attends over it (L136)         │
   │     "window seat, Berlin — I remember"       │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 4 · WRITE BACK — new facts to long-term      │
   │     (this booking, the preference confirmed) │
   │     → stored, retrievable next time (L165)   │
   └──────────────────────────────────────────────┘
```

The flow is the memory architecture: **retrieve → inject → attend → write back.** "Remembering" is this loop; the model itself holds nothing between requests.

## 4. How It Works — The Two Tiers, and the Bridge

- **Short-term memory = the context window (L138).** Everything the model attends over this request — system, history, retrieved memory, the question. It evaporates when the generation ends. It's bounded by the token budget (L149). This is *not* "memory" in the product sense — it's the working set.
- **Long-term memory = a store you design (L165).** Durable facts, server-side, per user and tenant (L320): preferences, past decisions, learned facts. Stored in a database — often with embeddings for semantic retrieval (L147).
- **The bridge = retrieval (L174, L189).** When a request arrives, retrieve the *relevant* memory — by user, by recency, by semantics (L147) — and inject it into the context. The bridge is what keeps long-term memory usable: you never dump the cabinet; you retrieve the right files (L189).
- **The write-back = capture.** After a turn, decide what's worth remembering — new facts, confirmed preferences — and store them. Write-back is how memory *grows*.

> [!NOTE]
> **The senior distinction: memory is a retrieval problem, not a storage problem.** Storing everything is easy; retrieving the *right* memory within the budget (L149) is the design. That's why memory and RAG (L174) share the machinery: the memory store is a mini knowledge base, retrieved per user (L147, L189) — and evaluated for whether it helped (L343).

## 5. Real Project Usage

- **Personal assistants.** Preferences, past trips, frequent contacts — retrieved per request (L147), injected into context (L138), written back after (L165).
- **Support bots.** The user's plan, past tickets, resolved issues — the bot "remembers" the account, retrieved per session (L174-adjacent grounding).
- **Agents (L206, L207).** Agent memory is this lesson at loop scale: short-term is the step context (L138), long-term is the accumulated facts (L207), and the bridge keeps the loop bounded.
- **E-commerce assistants.** Cart state, browsing history, past orders — retrieved to personalise, written back to update.
- **Compliance (L322).** Memory is user data — retention policy, consent, the right to delete. The memory store is a data-governance surface (L372), not just a feature.

The through-line: **memory is the architecture of "the AI knows me"** — retrieve, inject, attend, write back — and it's a data-governance surface (L372) as much as a feature.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "The model remembers nothing — memory is an architecture with two tiers: short-term context (L138) and a long-term store I design."
2. **The bridge.** "Per request, I retrieve the relevant memory (L147, L174), inject it into the context within the budget (L149), and write back new facts after (L165)."
3. **The design.** "What to save is a product decision; how to retrieve it is a retrieval problem (L189); how to keep it bounded is the budget (L149)."
4. **The governance.** "Memory is user data — retention, consent, deletion (L322, L372). The store is a governance surface, not just a feature."

## 7. Senior-Level Insights

- **Memory is a retrieval problem, not a storage problem (L189).** The cabinet is easy; the bridge — retrieving the right files within the budget (L149) — is the design. That's why memory shares RAG's machinery (L174) and its evaluation (L343).
- **Write-back is the design decision (L165).** What gets remembered is a *filtered* decision, not "save everything": the cost of wrong memory (a hallucinated preference) is real (L141). Capture deliberately, verify what you store.
- **Memory and state are different layers (L165).** State is the session's truth (the conversation); memory is the durable, retrievable facts. Conversation management (L166) produces memory via the memo; the memory store holds it across sessions.
- **Memory is a tenant and privacy boundary (L320, L372).** Memory is per-user data — scoping (L320), retention (L322), and consent are non-negotiable. A memory leak is a tenant leak and a compliance incident.
- **Memory quality is evaled, not assumed (L337, L343).** Does the retrieved memory help the answer? Is the memo faithful? Both are eval questions — the memory layer is a model-dependent system, verified like one.

## 8. Common Mistakes

- **"The model remembers."** No — the model attends to what you feed it (L138); memory is the architecture around it.
- **Using the context window as the store (L138).** Dumping the cabinet into the prompt — the budget explodes (L149) and the model still can't recall beyond it.
- **Storing everything, retrieving nothing.** A memory store with no bridge (L189) — a cabinet with no retrieval, useless.
- **Saving without filtering.** Every turn written to memory — wrong facts remembered confidently (L141), storage bloat, governance trouble (L372).
- **Memory unscoped (L320).** User A's preferences retrieved for user B — the tenant leak.
- **No retention or consent (L322).** Memory kept forever, without deletion — the compliance incident.

## 9. Best Practices

- **Design the two tiers** — short-term context (L138), long-term store (L165) — and the bridge between them (L189).
- **Retrieve, don't dump** (L189) — the relevant memory within the budget (L149), by user, recency, and semantics (L147).
- **Write back deliberately** — filtered capture of durable facts, verified (L141, L165).
- **Scope every memory to the user and tenant** (L320) — memory is per-user data.
- **Add retention, consent, and deletion** (L322, L372) — memory is a governance surface.
- **Eval the memory layer** (L337, L343) — does the retrieved memory help? Is it faithful?

## 10. Interview Questions

**Q: How does an AI "remember" things?**
> A: It doesn't — memory is an architecture. Short-term memory is the context window (L138): what I feed the model this request. Long-term memory is a store I design (L165): durable facts, retrieved on demand (L147, L174) and injected into context within the budget (L149). The two tiers, connected by retrieval, are what "remembering" means.

**Q: How do you get long-term memory into the context?**
> A: Retrieval, not dumping (L189). Per request, I retrieve the *relevant* memory — by user, recency, and semantics (L147) — and inject it into the context within the token budget (L149). Dumping the whole store would blow the window (L138) and dilute attention; retrieval is what keeps memory usable.

**Q: What's the difference between memory and state?**
> A: State is the session's truth — the conversation, the current turn (L165). Memory is the durable, retrievable facts across sessions — preferences, past decisions. Conversation management (L166) produces memory (the memo); the memory store holds it long-term. State is the desk; memory is the cabinet.

**Q: How do you handle memory privacy?**
> A: Memory is user data (L372). It's scoped per user and tenant (L320), has a retention policy and deletion path (L322), and requires consent. And the memory layer is evaled like any model-dependent system (L343) — the stored facts are verified, not assumed. A memory store without governance is a compliance incident waiting.

## 11. Follow-Up Questions

- How does memory share RAG's machinery (L174)?
- How do you decide what to write back (L165)?
- How does agent memory differ from chat memory (L206, L207)?
- How do you eval whether memory helped (L343)?
- What does retention and deletion look like in practice (L322)?

## 12. Comparison Table — The Memory Tiers

| | Short-term (L138) | Long-term (this lesson) |
|---|---|---|
| What it is | the context window | a designed store (L165) |
| Lifetime | one request | durable, across sessions |
| Content | system + history + memory + question | preferences, facts, decisions |
| Access | fed per request | retrieved on demand (L189) |
| Budget | the token budget (L149) | storage + retrieval cost (L150) |
| Forgetting | automatic | retention policy (L322) |

The senior read: **short-term is the working set; long-term is the store; the retrieval bridge is the design** — and both are bounded by budgets (L149) and governance (L322).

## 13. Code Example — Memory in the Request Path

```js
// Memory: retrieve → inject → attend → write back (L147, L165, L174).
async function answerWithMemory(userId, question) {
  // 1 · RETRIEVE the relevant long-term memory (L147, L189).
  const memory = await retrieveMemory(userId, question);   // embeddings + filters
  //   → [ {fact: "prefers window seats", score: 0.91}, … ] (top-k, L189)

  // 2 · INJECT into the context, within the budget (L149).
  const context = [
    { role: 'system', content: SYSTEM },
    ...memory.map((m) => ({ role: 'system', content: `Known: ${m.fact}` })),
    { role: 'user', content: question },
  ];
  assertWithinBudget(context);                              // L149

  // 3 · the model attends over it (L136) and answers.
  const answer = await streamText({ model, messages: context });

  // 4 · WRITE BACK the new durable facts — filtered, verified (L165).
  const newFacts = await extractFacts(question, answer);    // capture
  await saveMemory(userId, newFacts);                       // store

  return answer;
}
```

```text
What the reader must SEE — the memory loop in code:

  retrieveMemory  → the bridge (L147, L189) — top-k, not everything
  inject          → within the budget (L149) — the window (L138)
  attend + answer → the model does the work (L136)
  write back      → filtered capture, stored (L165)

  The model holds nothing between requests — the store does.
```

```narrate
5-7: The bridge — semantic retrieval of the relevant memory (L147, L189), never the whole store.
9-14: Injection into the context, budget-checked (L149) — the window is the constraint (L138).
17: The model attends over the retrieved memory — "remembering" happens here, per request (L136).
20-22: Write-back is filtered and stored — memory grows deliberately, not by default (L165).
```

> [!TIP]
> The two lines that make memory safe are `assertWithinBudget` and the filtered `write back` — **bounded retrieval in, deliberate capture out.** Memory that isn't budgeted blows the window; memory that saves everything remembers the wrong things (L141).

## 14. Performance Notes

- **Retrieval is the memory latency (L151)** — the bridge adds a search step before the model call; keep it fast (L182) and cache hot queries (L171).
- **Memory in context costs tokens (L149)** — the retrieved facts are input tokens (L137); retrieve top-k, not top-all (L189).
- **Write-back is background work (L222)** — extraction and storage can run async after the response, off the hot path.
- **The store scales with users (L150)** — memory storage and indexing grow per user; per-tenant partitioning (L320) and retention (L322) are the cost and governance controls.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| "It doesn't remember me" | No retrieval, or retrieval returns nothing (L189) | Check the bridge; top-k and filters |
| Context budget explodes | Memory dumped, not retrieved (L149) | Retrieve top-k within the budget |
| Wrong "memory" surfaces | Stored without filtering (L141) | Filter write-back; verify facts |
| User A sees user B's memory | Unscoped store (L320) | Scope retrieval and writes per user |
| Memory grows forever | No retention (L322) | Add retention + deletion policy |

## 16. Quick Revision Notes

- Memory = **two tiers**: short-term context (L138) + long-term store (L165), connected by retrieval.
- **Retrieve → inject → attend → write back** — the memory loop.
- **Retrieval, not dumping** (L189) — top-k within the budget (L149).
- **Write-back is filtered** — deliberate capture, verified (L165).
- Memory is **user data** — scoped (L320), retentioned (L322), consented (L372).
- Memory shares **RAG's machinery (L174)** and its evaluation (L343).

## 17. Cheat Sheet

```text
AI MEMORY = the model remembers nothing; the architecture does

TWO TIERS
  short-term  the context window (L138) — per request, evaporates
  long-term   a designed store (L165) — durable, per user

THE LOOP
  retrieve   the relevant memory (L147, L189) — top-k, not all
  inject     into context, within the budget (L149)
  attend     the model does the work (L136)
  write back filtered capture, stored (L165)

THE DESIGN DECISIONS
  what to save      filtered, verified (L141)
  how to retrieve   embeddings + filters (L147, L189)
  how to bound      the token budget (L149)
  how to govern     scope (L320) · retention (L322) · consent (L372)

RULES
  never dump the store into the window (L138, L149)
  never save everything — remember deliberately (L165)
  memory is user data — scope and retention (L320, L322)
  eval the memory layer (L337, L343)

INTERVIEW, 4 MOVES
  1 frame    "two tiers: context + store, connected by retrieval"
  2 loop     "retrieve → inject → attend → write back"
  3 design   "what to save, how to retrieve, how to bound"
  4 governance "user data: scope, retention, consent"
```

## 18. Key Takeaways

> [!RECAP]
> - **The model remembers nothing** — memory is an architecture: short-term context (L138) plus a long-term store you design (L165)
> - The memory loop is **retrieve → inject → attend → write back** — retrieval (L147, L189) is the bridge between the tiers
> - **Retrieval, not dumping** (L189): the relevant memory, top-k, within the token budget (L149) — never the whole store
> - **Write-back is a filtered design decision** — deliberate, verified capture (L165), because wrong memory is hallucination with a home (L141)
> - Memory is **user data** — scoped per tenant (L320), retentioned (L322), consented (L372): a governance surface, not just a feature
> - Memory shares **RAG's machinery (L174)** and its evaluation (L343) — it's a retrieval problem, not a storage problem

## Check your understanding

Answer these without looking back.

1. Name the two memory tiers and the lifetime of each.
2. Walk the memory loop: retrieve → inject → attend → write back.
3. Why is retrieval, not dumping, the design (L189, L149)?
4. What decides what gets written back (L165)?
5. How do memory and state differ (L165)?
6. Why is memory a governance surface (L320, L322, L372)?
7. How does memory share RAG's machinery (L174)?
8. How do you eval whether memory helped (L343)?

## A Closing Note — The Architecture of "Remembers You"

You now hold the architecture of "the AI knows me": **two tiers, a retrieval bridge, a budget, and a governance surface.** The model holds nothing; the store, the retrieval, and the filtered write-back are the design — and they're the same machinery RAG (L174) will use on documents, pointed at the user instead.

Next: the resilience layer — error handling for LLM calls (L168), where the loop you've built learns to survive the provider.
