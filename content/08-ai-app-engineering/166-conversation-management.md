# Lesson 166 — Conversation Management

**Interview importance:** ⭐⭐⭐⭐ — "how do you handle a long conversation?" is the session question; the answer is the *shape of a session* — history, truncation, summarisation — inside the server state (L165).

Lesson 165 gave you the state model; this lesson is the **conversation itself** — how a session is stored, how it grows, and how it stays inside the token budget (L149). Every chat product faces the same curve: the history grows with every turn, the context window (L138) fills, and the answers degrade. Conversation management is the discipline that keeps the session alive, bounded, and coherent.

The distinction this lesson is built on: a **demo** appends every message forever. A **solutions architect** manages the conversation shape: what's kept verbatim, what's summarised, what's dropped — and *when*, based on the token budget (L149) — so the session stays within the window (L138) without losing what matters.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the conversation's lifecycle: store (L165), grow, trim, summarise, rehydrate
- Manage history against the token budget (L149): the window (L138) decides what fits
- Choose the strategy: keep-recent, truncate-old, summarise-middle — and when each is right
- Persist and rehydrate sessions server-side (L165), across devices (L166)
- Design the session shape for evals and audits (L343, L322)

## 1. One-Line Definition

**Conversation management is the discipline of a session's shape — how history is stored (L165), how it grows, and how it's trimmed and summarised to stay inside the token budget (L149) — so a conversation stays coherent over many turns without losing what matters.**

The one-sentence interview answer: *"Conversation management is the session's shape. The history is stored server-side (L165) and grows per turn; the token budget (L149) and the window (L138) decide what fits. When it doesn't, I trim in order — keep the recent verbatim, summarise the middle, drop only what's truly past — and I persist and rehydrate the session so it survives across devices (L166). The conversation is a designed object, not an unbounded array."*

## 2. Mental Model

Think of a conversation as **a desk that fills with papers** — and the window (L138) as the desk's size. You can't pile forever; you *curate*: the current task stays on top, the recent context stays reachable, and the old context gets compressed into a memo.

```text
   the growing conversation (papers on the desk, L138's window)

   turn 1   user      ████
   turn 2   assistant ██████
   turn 3   user      ███
   …        (the pile grows per turn)
   turn 40  ████████████████████████████████  ← the desk is full

   the curator's move (this lesson):
   ┌──────────────────────────────────────┐
   │ [memo: the first 35 turns,           │  ← summarised (compressed)
   │  compressed to the key facts]        │
   │ [recent 5 turns, verbatim]           │  ← kept exactly
   │ [the current question]               │  ← on top
   └──────────────────────────────────────┘
```

The mental model is **curation, not deletion**: the conversation's past becomes a memo (summary), the recent stays exact, and the current turn sits on top — inside the desk's size (L138) and the budget (L149).

## 3. Visual Flow — The Conversation Lifecycle

```text
   turn N arrives
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · STORE — append to server state (L165)    │
   │     the session is the durable record        │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · BUDGET — does the history fit the        │
   │     window with the output reserve? (L138,   │
   │     L149)                                    │
   └──────────────────┬───────────────────────────┘
          fits        │          doesn't fit
          │           ▼
          │   ┌──────────────────────────────────┐
          │   │ 3 · CURATE, in order:            │
          │   │    a · keep recent verbatim      │
          │   │    b · summarise the middle (L167)│
          │   │    c · drop the truly past       │
          │   └──────────────────┬───────────────┘
          │                      ▼
          │             re-count → fits? → yes
          ▼
   ┌──────────────────────────────────────────────┐
   │ 4 · FEED the model context (L138) + persist  │
   └──────────────────────────────────────────────┘
```

The lifecycle is the discipline: **store → budget → curate → feed + persist.** The curator (step 3) is the part most apps skip — and the part that keeps long conversations working.

## 4. How It Works — The Curator's Decisions

- **Store (L165).** The conversation lives server-side, per session, per user — the durable record that evals (L343), audits (L322), and rehydration read. It is never client-only.
- **Budget (L149).** Each turn, the history + system + output reserve is counted against the window (L138). The budget is the trigger: when it doesn't fit, curate. This is arithmetic, not a feeling.
- **Curate — the three levers, in order:**
  - **Keep recent verbatim.** The last few turns stay exact — the model needs the immediate thread verbatim.
  - **Summarise the middle (L167).** The older turns compress into a memo — a summary of decisions, facts, and state, written by the model itself (a summarisation call) and stored as the session's "memory" of the past.
  - **Drop the truly past.** What neither the thread nor the memo needs goes away — within a retention policy, not randomly.
- **Feed + persist.** The curated context goes to the model (L138); the session — including the memo — is saved (L165), so the next turn starts from the curated state, not the raw history.

> [!NOTE]
> **The senior order matters.** Keep-recent *before* summarise-middle *before* drop-past. Apps that truncate the *oldest* first destroy the thread; apps that summarise everything lose the exact recent context. The order — verbatim recent, memo middle, drop only the truly past — is the difference between a conversation that degrades and one that doesn't.

## 5. Real Project Usage

- **Chat products.** Every turn appends; the curator keeps the session inside the budget (L149). A 40-turn conversation reads as: memo + recent turns + the question.
- **Support bots.** The conversation's decisions (the ticket, the outcome) go into the memo; the recent exchange stays verbatim; the agent answers from the curated context (L174-adjacent grounding).
- **Agents (L207).** The step history grows per tool call (L164); conversation management is how the agent's context stays bounded across a long run (L205).
- **Multi-device sessions.** The server holds the curated session (L165), so the chat continues on any device — rehydrated from the store, not the client.
- **Compliance (L322).** The *full* history is retained for audit even when the *context* is curated — curating what the model sees is not deleting what happened. The two stores are separate.

The through-line: **conversation management is curation with a budget** — the full history stays (for audit, L322), the model sees the curated version (L138), and the session survives (L165).

## 6. Interview Explanation

Say it in four moves:

1. **The lifecycle.** "Store the conversation server-side (L165), count it against the token budget (L149) each turn, and curate when it doesn't fit (L138)."
2. **The curator.** "Keep the recent verbatim, summarise the middle into a memo (L167), and drop only the truly past — in that order."
3. **The persistence.** "The curated session is saved, so the next turn starts from it, and the full history is retained separately for audit (L322)."
4. **The why.** "The conversation is a designed object, not an unbounded array — a long session stays coherent because its shape is managed, not because the model has a bigger window."

## 7. Senior-Level Insights

- **The window (L138) is the constraint; the curator is the design.** A bigger window (L138) postpones the curation — it doesn't remove it. The senior answer designs the curator regardless of window size, because cost (L150) and degradation (L138) follow the pile.
- **The memo is *memory* (L167).** Summarised history is the session's long-term memory — and it's a model call, so it has a cost (L150) and a quality (L343). The memo's faithfulness is evaled (L337), not assumed.
- **Curating context ≠ deleting history (L322).** The audit trail keeps the full record; the model sees the curated version. Separating the two stores is a compliance requirement, not a detail.
- **Conversation management is agent state at small scale (L207).** The plan, the steps, the memo — the same store-curate-feed loop, at session scale here, at loop scale in L207.
- **The curator is a testable policy (L341).** "Given this history and this budget, produce this context" is a pure function — feed it histories, assert the curated output. That's the testing boundary of the whole session.

## 8. Common Mistakes

- **Appending forever.** History grows unbounded — the window (L138) fills, the bill (L150) grows, the answers degrade (lost-in-the-middle).
- **Truncating the oldest first.** The beginning of the thread dies while the middle bloats — the wrong lever, in the wrong order (L138).
- **Client-side history (L166).** Lost on refresh, invisible to evals (L343) and audits (L322).
- **Summarising everything.** The recent thread compressed too — the model loses the exact context it needs for the current turn.
- **No memo at all.** Every long conversation degrades — the middle has no compressed form.
- **Deleting history for context.** Curating what the model sees, then losing the record (L322) — a compliance failure wearing a performance fix.

## 9. Best Practices

- **Store the conversation server-side** (L165) — the durable record, per user, per tenant (L320).
- **Budget every turn** (L149) — count history + system + output reserve against the window (L138).
- **Curate in order**: recent verbatim → summarise the middle (L167) → drop the truly past.
- **Persist the curated session** — the next turn starts from it (L165).
- **Keep the full history for audit** (L322) — curating context is not deleting records.
- **Eval the memo's faithfulness** (L337) — the summary is a model output, verified like one.

## 10. Interview Questions

**Q: How do you manage a long conversation?**
> A: Store it server-side (L165), count it against the token budget each turn (L149), and curate when it doesn't fit (L138): keep the recent verbatim, summarise the middle into a memo (L167), and drop only the truly past. The curated session is persisted, and the full history is kept separately for audit (L322).

**Q: Why summarise the middle instead of truncating the oldest?**
> A: Because the beginning of the thread often holds the context — the task, the decisions — while the middle carries the bulk. Truncating the oldest destroys the thread; summarising the middle compresses it into a memo that preserves what matters (L167). The order is deliberate: verbatim recent, memo middle, drop only what's truly past.

**Q: Does a bigger context window remove the need for this?**
> A: It postpones it, not removes it (L138). A bigger window holds more turns, but cost (L150) grows with the pile and the model uses long contexts unevenly — the middle gets lost. The curator is the design; the window just sets how often it runs.

**Q: How does this relate to memory (L167)?**
> A: The summarised middle *is* the session's memory — the compressed record of what happened. Conversation management is the mechanism; memory is what it produces and what it reads. Short-term (recent turns) is verbatim; long-term (the memo) is summarised and stored (L167).

## 11. Follow-Up Questions

- How does the memo get written, and what does it cost (L150, L337)?
- How do you keep the full history for audit while curating the context (L322)?
- How does this apply to an agent's step history (L207)?
- When should you drop history instead of summarising it?
- How do you test the curator's policy (L341)?

## 12. Comparison Table — The Curation Strategies

| Strategy | What the model sees | When it's right | The risk |
|---|---|---|---|
| Keep-recent verbatim | the last N turns exactly | always the base | alone, loses the past |
| Summarise-middle (L167) | a memo of the old turns | when history > budget | memo infidelity (L337) |
| Drop-past | nothing of the old turns | truly irrelevant / retention | lost context |
| Full history | everything | tiny sessions only | budget blowup (L149) |

The senior read: **the strategies compose in order** — verbatim recent + memo middle + drop past — and the budget (L149) is the trigger that runs them.

## 13. Code Example — The Curator in Code

```js
// Conversation management: store → budget → curate → feed (L165, L149, L138).
async function buildContext(session, maxTokens) {
  const { system, messages, memo } = session;

  // 1 · always keep the recent turns verbatim (the thread).
  const recent = messages.slice(-6);

  // 2 · count the base: system + recent + the output reserve (L149).
  const base = count(system) + count(recent);
  const headroom = maxTokens - base - RESERVE;         // the reserve, never forgotten

  // 3 · if the memo + recent fit, include the memo (L167).
  if (memo && count(memo) <= headroom) {
    return { system, memo, recent };                   // the curated session
  }

  // 4 · if not, write a NEW memo from the older turns (L167), then retry.
  if (headroom > MIN_MEMO) {
    const older = messages.slice(0, -6);
    const newMemo = await summarize(older);            // a model call — cost (L150)
    session.memo = newMemo;                            // persisted (L165)
    return { system, memo: newMemo, recent };
  }

  // 5 · the last resort: drop the truly past (retention-aware).
  return { system, memo: null, recent: messages.slice(-4) };
}
```

```text
What the reader must SEE — the curator's order:

  recent verbatim   → the thread, always exact
  memo (L167)       → the compressed middle, if it fits
  new memo          → written from the older turns when needed
  drop past         → only the truly gone, retention-aware

  The budget (L149) is the trigger; the order is the design.
```

```narrate
5-6: The recent turns stay verbatim — the model needs the exact thread (L138).
9-11: The budget counts history + system + the output reserve (L149) — the trigger to curate.
14-16: The existing memo is included if it fits — memory reused (L167).
20-23: Otherwise a NEW memo is written from the older turns — a model call, budgeted (L150).
26-28: The last resort drops only the truly past — with retention, not randomly (L322).
```

> [!TIP]
> The senior detail is the order and the reserve: **recent verbatim, memo middle, reserve never forgotten, drop last.** Copy this shape into any chat and the session survives turn 100.

## 14. Performance Notes

- **The budget check is per-turn arithmetic (L149)** — counting is microseconds against the model call (L151); it gates the curator.
- **The memo is a model call (L150)** — summarising costs tokens and latency; write it *when the budget demands*, not every turn, and cache it (L171).
- **The memo degrades with age (L337)** — a memo of a memo loses fidelity; re-summarise from the full history (kept for audit, L322) when it matters.
- **Persistence is per-turn I/O (L165, L151)** — save after the turn, asynchronously where possible, to keep it off the hot path.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Answers degrade after ~20 turns | History unbounded; no curation (L138) | Add the budget trigger + curator |
| The model forgets the task | Oldest truncated instead of summarised | Summarise the middle (L167) |
| Cost grows with session length | Full history sent every turn (L150) | Curate; memo; tighten retrieval |
| Memo contradicts the thread | Memo infidelity (L337) | Re-summarise; eval faithfulness |
| History "gone" after curation | Context curating deleted the record (L322) | Keep full history for audit, separate |

## 16. Quick Revision Notes

- Conversation management = **store → budget → curate → feed + persist** (L165, L149).
- The curator's order: **recent verbatim → summarise the middle (L167) → drop the truly past.**
- The budget (L149) is the **trigger**; the window (L138) sets how often.
- The memo is **the session's memory** — a model call, budgeted (L150), evaled (L337).
- **Curating context ≠ deleting history** — full record kept for audit (L322).
- A bigger window **postpones** curation, never removes it (L138).

## 17. Cheat Sheet

```text
CONVERSATION MANAGEMENT = the session's shape

LIFECYCLE
  store    server-side, per session (L165)
  budget   history + system + reserve ≤ window (L149, L138)
  curate   when it doesn't fit
  feed     the curated context to the model
  persist  save the curated session (L165)

THE CURATOR (in order)
  1 recent verbatim    the thread, exact
  2 memo of the middle the compressed past (L167)
  3 drop the past      only the truly gone, retention-aware (L322)

RULES
  the budget is the trigger, the order is the design
  the memo is a model call — budget (L150), eval (L337)
  curating context ≠ deleting history (L322)
  a bigger window postpones, never removes (L138)

INTERVIEW, 4 MOVES
  1 lifecycle "store → budget → curate → feed + persist"
  2 curator   "recent verbatim → memo middle → drop past"
  3 memory    "the memo is the session's long-term memory (L167)"
  4 audit     "full history kept, curated context fed (L322)"
```

## 18. Key Takeaways

> [!RECAP]
> - Conversation management is **the session's shape**: store server-side (L165), budget every turn (L149), curate when it doesn't fit (L138)
> - The curator's order is deliberate: **recent verbatim → summarise the middle (L167) → drop only the truly past**
> - The **memo is the session's memory** — a model-written summary, budgeted (L150) and evaled for faithfulness (L337)
> - **Curating context is not deleting history** — the full record is kept for audit (L322) while the model sees the curated version
> - A bigger window (L138) **postpones curation, never removes it** — cost (L150) and degradation follow the pile
> - The session is **a designed object, not an unbounded array** — and the curator is a testable policy (L341)

## Check your understanding

Answer these without looking back.

1. Walk the conversation lifecycle.
2. What triggers the curator, and in what order does it work?
3. Why summarise the middle instead of truncating the oldest?
4. What is the memo, and what does it cost (L150, L167)?
5. Why keep the full history when the context is curated (L322)?
6. Does a bigger window remove the need to curate (L138)?
7. How does conversation management become agent state (L207)?
8. How do you test the curator's policy (L341)?

## A Closing Note — The Session That Survives

You now hold the discipline that keeps a conversation alive across a hundred turns: **store, budget, curate, feed, persist** — with the curator's order as the design and the budget (L149) as the trigger. It's the mechanism that produces memory (L167), the shape that agents inherit (L207), and the record that audits read (L322).

Next: the memory itself — short-term context versus long-term recall, and where each is stored (L167).
