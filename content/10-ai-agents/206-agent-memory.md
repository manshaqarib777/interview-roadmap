# Lesson 206 — Agent Memory

**Interview importance:** ⭐⭐⭐⭐⭐ — "how does an agent remember?" — the answer is the *memory hierarchy*: the context window (working memory), the scratchpad (the loop's notes), and long-term recall (the index) — with curation (L207) as the discipline (L149).**

L200's context boundary is this lesson: **agent memory** — how the agent remembers across a run. Three layers: the **context window** (working memory — what the model sees this cycle, L138, budgeted, L149), the **scratchpad** (the loop's working notes — reasoning, plans, results, L203, L205), and **long-term recall** (the durable index — previous runs, the knowledge base, L189, L167). The discipline is **curation** (L207): the window can't hold everything, so the agent summarizes, drops, and retrieves — the memory is managed, not accumulated (L149).

The distinction this lesson is built on: a **demo** appends everything and overflows. A **solutions architect** designs the hierarchy: the budgeted window (L149) as working memory, the scratchpad (L202) as the loop's notes, the retrieval layer (L189) as long-term recall — and curation (L207) as the policy that decides what the window holds at each cycle (L206).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the memory hierarchy: window, scratchpad, long-term recall (L206)
- Explain the context window as working memory, budgeted (L149, L138)
- Explain the scratchpad: the loop's working notes (L202, L203)
- Explain long-term recall: retrieval from the index (L189, L167)
- Explain curation: summarize, drop, retrieve — the memory policy (L207)

## 1. One-Line Definition

**Agent memory is the hierarchy that lets the loop remember — the context window (working memory, budgeted and curated, L149, L138), the scratchpad (the loop's working notes — reasoning, plans, results, L202–205), and long-term recall (the durable index, retrieved on demand, L189, L167) — with curation (L207) as the policy that decides what the window holds at each cycle, because the window can't hold everything (L206).**

The one-sentence interview answer: *"Agent memory is a hierarchy of three layers (L206). Working memory — the context window: what the model sees this cycle, budgeted (L149) and curated (L207). The scratchpad — the loop's working notes: the reasoning (L203), the plan (L202), the results (L205) — the notes the loop needs to keep working. Long-term recall — the durable index: previous runs and the knowledge base, retrieved on demand (L189, L167). The discipline is curation (L207): the window can't hold a long run, so the agent summarizes the old context (L206), drops what's spent, and retrieves what's needed (L189). The memory is managed — the window is a budgeted resource (L149), and curation is the policy that spends it well (L206)."*

## 2. Mental Model

Think of the three layers as **a desk, a notepad, and a filing cabinet.** The desk (the context window) is what you can see right now — and it only holds so much (the budget, L149); you keep the current work on it (curation, L207). The notepad (the scratchpad) is your running notes — the plan (L202), the steps so far (L205) — you can look at it anytime, but it's not on the desk (L203). The filing cabinet (long-term recall) is everything else — past runs, the knowledge base (L189) — you go to it when you need something (L167). The discipline is the desk's organizer: when the desk fills, you summarize the old notes to the notepad, file what's spent, and keep only what the current step needs (L206).

```text
   the desk (window, L138)      the notepad (scratchpad)      the cabinet (index, L189)
   ┌──────────────────┐         ┌────────────────────┐        ┌────────────────────┐
   │ what the model   │         │ the plan (L202)    │        │ past runs (L167)   │
   │ sees THIS cycle  │         │ reasoning (L203)   │        │ the knowledge base │
   │ budgeted (L149)  │         │ results so far     │        │ retrieved on demand│
   │ curated (L207)   │         │ (L205)             │        │ (L189)             │
   └──────────────────┘         └────────────────────┘        └────────────────────┘
```

The mental model is **desk, notepad, cabinet**: working memory on the desk, the loop's notes on the notepad, and everything else in the cabinet — with the organizer (curation, L207) keeping the desk usable (L206).

## 3. Visual Flow — One Cycle's Memory

```text
   the loop is at step N (L200)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · CURATE THE WINDOW (L207)                             │
   │     what must the model see THIS step?                   │
   │     keep: the current goal, the latest result (L164)     │
   │     summarize: the spent context (L206)                  │
   │     drop: the completed steps (L205)                     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE WINDOW (L138, L149)                              │
   │     system + tools + the curated history + latest        │
   │     results — inside the budget (L149)                   │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE MODEL DECIDES (L202)                             │
   │     reads the scratchpad (L203), retrieves from the      │
   │     index when needed (L189) — the next action           │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the result joins the scratchpad (L205) → next cycle's curation (L207)
```

The flow is the memory policy: **curate the window → decide → write back to the scratchpad** — the hierarchy serves the cycle, and curation (L207) is the policy (L206).

## 4. How It Works — The Three Layers and the Policy

- **Working memory — the window (L138, L149).** What the model sees this cycle: system, tools (L144), the curated history, the latest results (L164). The budget (L149) is the ceiling — the window is a resource, not a log (L206).
- **The scratchpad (L202, L203).** The loop's working notes: the plan (L202), the reasoning (L203), the results so far (L205). It's the notepad the model can consult — and the trace's content (L213). The scratchpad is where the loop's *process* lives (L206).
- **Long-term recall (L189, L167).** The durable index: previous runs, the knowledge base (L189), and the app's data (L167). Retrieved on demand — the agent doesn't hold the cabinet in the window; it fetches what a step needs (L189).
- **The policy — curation (L207).** What the window holds at each cycle: **keep** the current goal and the latest result, **summarize** the spent context (L206), **drop** the completed steps (L205), **retrieve** what a new step needs (L189). Curation is the policy that spends the budget well (L149).

> [!NOTE]
> **The window is a budget, and curation is its policy (L149, L206).** The context window (L138) can't hold a long run — every cycle appends (L164), and the budget (L149) is the ceiling. The senior design treats curation (L207) as a first-class policy: what to keep, what to summarize (L206), what to drop (L205), what to retrieve (L189) — decided per cycle, measured on the golden set (L343). An agent without curation isn't "remembering" — it's overflowing (L211). The memory design *is* the curation design (L206).

## 5. Real Project Usage

- **Research agent.** Working memory: the current question + the latest findings (L164). Scratchpad: the search notes (L203). Long-term: the corpus (L189). Curation: earlier searches summarized as the run lengthens (L206).
- **Support agent.** Working memory: the ticket + the account summary (L180). Scratchpad: the troubleshooting steps (L205). Long-term: the KB (L189) and past tickets (L167).
- **Coding agent.** Working memory: the file + the test output (L164). Scratchpad: the plan (L202) and the edit history (L205). Long-term: the repo (L189).
- **Long-running automation (L207).** The run's state persists (L207) — the memory survives the process (L206).
- **Anything multi-step (L216).** The hierarchy is the context boundary of the L200 diagram — every agent gets it (L206).

The through-line: **memory is the hierarchy; curation is the discipline** — the window, the notepad, and the cabinet, managed by a policy (L206, L207).

## 6. Interview Explanation

Say it in four moves:

1. **The hierarchy.** "Three layers: the window (working memory, L138), the scratchpad (the loop's notes, L203), long-term recall (the index, L189)."
2. **The window.** "Budgeted (L149) and curated (L207) — the model sees a managed view, not the log (L206)."
3. **The policy.** "Curation: keep the goal, summarize the spent context (L206), drop the completed steps (L205), retrieve what's needed (L189)."
4. **The failure.** "An agent without curation isn't remembering — it's overflowing (L211)."

## 7. Senior-Level Insights

- **The memory design is the curation design (L206).** The senior answer names the policy — keep, summarize, drop, retrieve (L207) — not just the layers. The window is a budget (L149); the policy is how it's spent (L206).
- **The scratchpad is the loop's process (L202–205).** The plan (L202), the reasoning (L203), the results (L205) — the notepad makes the loop's thinking inspectable (L213) and continuable (L207).
- **Long-term recall reuses retrieval (L189).** The cabinet is the L189 machinery — the agent retrieves like RAG retrieves (L174), with the same budgets (L149) and quality levers (L190).
- **Curation is a quality decision, measured (L343).** What gets summarized and dropped affects the decisions (L203) — the curation policy is tuned on the golden set (L341), like any prompt (L142).
- **Memory composes with state (L207).** The in-run memory (this lesson) and the durable state (L207) are one system — the scratchpad persists (L207), the window rebuilds on resume (L206).

## 8. Common Mistakes

- **Appending everything (L149).** The window as a log — overflow (L138), cost (L150), and degraded decisions (L211).
- **No scratchpad (L203).** The plan and reasoning live only in the window — the loop loses its notes (L205).
- **No long-term recall (L189).** Every run starts cold — the cabinet never consulted (L167).
- **Summarizing the wrong things (L207).** The current goal dropped, the spent context kept — curation by accident (L206).
- **No persistence (L207).** The memory dies with the process — a long run can't resume (L207).
- **Curation never measured (L343).** The policy tuned by guesswork — the golden set should decide what to keep and summarize (L341).

## 9. Best Practices

- **Design the hierarchy** (L206) — window, scratchpad, recall (L189).
- **Budget the window** (L149) — the ceiling is a design number (L138).
- **Keep the scratchpad structured** (L202, L203) — the plan and the reasoning are the loop's notes (L205).
- **Retrieve on demand** (L189) — the cabinet is fetched, not held (L167).
- **Curate per cycle** (L207) — keep the goal, summarize the spent, drop the done, retrieve the needed (L206).
- **Measure the policy** (L343) — what to keep and summarize is a golden-set decision (L341).

## 10. Interview Questions

**Q: How does an agent remember?**
> A: A hierarchy of three layers (L206). Working memory — the context window: what the model sees this cycle, budgeted (L149) and curated (L207). The scratchpad — the loop's working notes: the plan (L202), the reasoning (L203), the results so far (L205). Long-term recall — the durable index: past runs and the knowledge base, retrieved on demand (L189). The discipline is curation — the policy that decides what the window holds (L206).

**Q: Why can't the window just hold everything?**
> A: Because it's a budget, not a log (L149). Every cycle appends (L164), the window has a ceiling (L138), and an overflowing window costs tokens (L150) and degrades decisions (L211). So the agent curates: keep the current goal, summarize the spent context (L206), drop the completed steps (L205), retrieve what a new step needs (L189). The memory is managed, not accumulated (L206).

**Q: What's the scratchpad for?**
> A: The loop's process (L202–205). The plan (L202), the reasoning (L203), the results (L205) — the working notes the loop needs to keep going. It's the notepad the model can consult without it sitting on the desk (the window) full-time (L206). And it's the trace's content (L213) — the scratchpad makes the loop's thinking inspectable and continuable (L207).

**Q: How does long-term recall work?**
> A: It reuses the retrieval machinery (L189). The cabinet — past runs (L167), the knowledge base — is indexed like RAG indexes (L174): the agent retrieves what a step needs, with the same budgets (L149) and quality levers (L190). The agent doesn't hold the cabinet in the window — it fetches on demand (L206).

## 11. Follow-Up Questions

- What does the curation policy keep and drop (L207)?
- How does the scratchpad persist (L207)?
- How does long-term recall reuse retrieval (L189)?
- How do you measure the curation policy (L343)?
- How does memory differ across tasks (L206)?

## 12. Comparison Table — The Three Layers

| | Window (L138) | Scratchpad (L202-205) | Long-term (L189, L167) |
|---|---|---|---|
| Role | working memory | the loop's notes | durable recall |
| Lifetime | one cycle (curated) | the run | across runs |
| Budget (L149) | the ceiling | grows with the run | on-demand |
| Content | goal + latest results | plan, reasoning, results | past runs, the KB |
| Curation (L207) | per cycle | summarized at the end | retrieval (L189) |

The senior read: **the columns are the lifetime** — one cycle, one run, forever — and curation (L207) manages the transitions (L206).

## 13. Code Example — The Memory Hierarchy

```js
// Agent memory: window + scratchpad + recall, with curation (L206, L207).
const scratchpad = { plan: [], reasoning: [], results: [] };   // the notepad (L202-205)
const window = { goal: task, history: [], budget: 8000 };      // the desk (L138, L149)

async function curateWindow(scratchpad, latest) {              // the policy (L207)
  // KEEP — the current goal and the latest result (L164).
  const keep = [system(window.goal), latest];
  // SUMMARIZE — the spent context (L206) — a model call, budgeted.
  if (tokenCount(window.history) + tokenCount(latest) > window.budget) {
    const summary = await summarize(window.history);           // L206
    keep.push(summary);                                        // the condensed past
  }
  // DROP — the completed steps stay in the scratchpad, not the window (L205).
  // RETRIEVE — the long-term recall, on demand (L189, L167).
  const recall = await retrieve(`context for: ${window.goal}`, { k: 3 });   // L189
  return { ...window, history: [...keep, ...recall] };         // the curated view
}

// The loop uses the curated window and writes to the scratchpad (L200, L206).
for (let step = 0; step < 10; step++) {
  const view = await curateWindow(scratchpad, latestResult);   // curate (L207)
  const r = await chat({ messages: view.history, tools });     // perceive (L138)
  scratchpad.reasoning.push(r.reasoning);                      // the notepad (L203)
  scratchpad.results.push(r.toolCalls);                        // the record (L205)
  if (!r.toolCalls?.length) break;                             // done (L205)
}
```

```text
What the reader must SEE — the hierarchy and the policy:

  scratchpad: plan, reasoning, results → the notepad (L202-205)
  window: goal + history, budgeted      → the desk (L138, L149)
  curateWindow(): keep, summarize, retrieve → the policy (L207)
  retrieve() → the cabinet (L189, L167)

  The desk holds the goal; the notepad holds the process;
  the cabinet holds the past — and the policy manages all three.
```

```narrate
2-3: The hierarchy's three stores — the desk, the notepad, and the cabinet's access (L206).
5-14: The curation policy — keep the goal, summarize the spent context (L206), and retrieve on demand (L189, L207).
16-22: The loop perceives the curated view and writes to the scratchpad — the notes the run needs (L200, L203, L205).
```

> [!TIP]
> The line that defines the memory design: **`const summary = await summarize(window.history)`** — the curation policy's core move. **The window is managed; summarization is how it stays within the budget (L206, L207).**

## 14. Performance Notes

- **The window size is the token cost (L149, L150).** A curated window is the bill's control (L150) — every token in the window is every cycle's cost (L149).
- **Summarization is the expensive curation (L206).** A model call per summarize (L150) — budget it and cache it (L171); summarize when the window demands, not every cycle (L207).
- **Retrieval is on demand (L151).** The cabinet fetch (L189) is a query-path cost (L151) — the cache (L171) and the retrieval levers (L190) apply (L189).
- **The scratchpad persists (L207).** The notepad is the resume point (L207) — persisting it (L213) is what makes long runs continuable (L206).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Context overflow | No curation (L149) | Add keep/summarize/drop (L207) |
| The loop forgets the goal | Goal dropped by curation (L207) | Keep the goal in the window (L206) |
| Cold starts | No long-term recall (L189) | Retrieve past runs (L167) |
| Summaries degrade decisions | Bad summarize policy (L343) | Measure on the golden set (L341) |
| Long runs die | No persistence (L207) | Persist the scratchpad (L213) |

## 16. Quick Revision Notes

- Agent memory = **the hierarchy** (L206): window, scratchpad, long-term (L189).
- Window = **working memory**, budgeted (L149) and curated (L207).
- Scratchpad = **the loop's notes**: plan (L202), reasoning (L203), results (L205).
- Long-term = **the cabinet**, retrieved on demand (L189, L167).
- Curation = **the policy**: keep, summarize (L206), drop (L205), retrieve (L189).
- Without curation, the agent **overflows, it doesn't remember** (L211).

## 17. Cheat Sheet

```text
AGENT MEMORY = the desk, the notepad, the cabinet

THE HIERARCHY (L206)
  window      working memory — what the model sees this cycle (L138)
              budgeted (L149) · curated (L207)
  scratchpad  the loop's notes — plan (L202), reasoning (L203),
              results (L205) — the process, inspectable (L213)
  long-term   the cabinet — past runs (L167), the KB (L189)
              retrieved on demand, like RAG (L174)

THE POLICY — curation (L207)
  keep       the current goal + the latest result (L164)
  summarize  the spent context (L206) — a budgeted model call
  drop       the completed steps (L205) — the scratchpad holds them
  retrieve   what a new step needs (L189, L167)

THE RULES
  the window is a budget, not a log (L149)
  without curation, the agent overflows (L211)
  the policy is measured on the golden set (L343, L341)

INTERVIEW, 4 MOVES
  1 hierarchy "window, scratchpad, long-term (L206)"
  2 window    "budgeted and curated (L149, L207)"
  3 policy    "keep, summarize, drop, retrieve (L207)"
  4 failure   "no curation = overflow (L211)"
```

## 18. Key Takeaways

> [!RECAP]
> - Agent memory is **the hierarchy** (L206): the context window (working memory, L138), the scratchpad (the loop's notes, L202–205), and long-term recall (the index, L189, L167)
> - **The window is a budget, not a log** (L149) — budgeted (L149) and curated (L207), because an overflowing window costs tokens (L150) and degrades decisions (L211)
> - **The scratchpad is the loop's process** (L202–205) — the plan, the reasoning, the results — making the loop inspectable (L213) and continuable (L207)
> - **Long-term recall reuses retrieval** (L189) — the cabinet is fetched on demand, like RAG (L174), with the same budgets (L149) and quality levers (L190)
> - **Curation is the policy** (L207): keep the goal, summarize the spent (L206), drop the done (L205), retrieve the needed (L189)
> - The policy is **measured on the golden set** (L343) — what to keep and summarize is a tuned decision (L341), and without curation the agent overflows instead of remembering (L211)

## Check your understanding

Answer these without looking back.

1. Name the three memory layers (L206).
2. Why is the window a budget (L149)?
3. What lives in the scratchpad (L202)?
4. How does long-term recall reuse retrieval (L189)?
5. What are the four curation moves (L207)?
6. Why does no curation mean overflow (L211)?
7. How does the scratchpad persist (L207)?
8. How do you measure the curation policy (L343)?

## A Closing Note — The Desk That Stays Usable

You now hold the memory hierarchy: **the desk (window, budgeted and curated), the notepad (scratchpad, the loop's process), and the cabinet (long-term, retrieved on demand) — with the curation policy that keeps the desk usable.** The agent no longer overflows — it remembers, deliberately.

Next: the memory that survives — agent state & persistence (L207), checkpoints and resumable runs.
