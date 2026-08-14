# Lesson 138 — Context Windows & Input Limits

**Interview importance:** ⭐⭐⭐⭐ — "what happens when you exceed the context window?" is a guaranteed follow-up, and the answer is a budget, not a feature.

Lessons 135–137 gave you the model, the mechanism, and the unit. The context window is where they meet: the hard ceiling on how many tokens the model can see at once — and, because of attention's O(n²) cost (L136), a ceiling with real engineering behind it. Every AI architect budgets context; every interview about "long documents", "RAG", or "why is my prompt slow" is really a context-window question.

The distinction this lesson is built on: a **user** knows "Claude has a big context window". A **solutions architect** knows what the window is *for* (everything the model can attend to), what fills it (system prompt + history + retrieved docs + the answer you're asking for), and what happens at the edge (truncation, degradation, and the "lost in the middle" effect).

## Learning Objectives

By the end of this lesson you should be able to:

- Define the context window: the total input tokens the model can attend to in one generation
- Explain what fills the window: system + history + retrieved docs + the response budget
- Explain why long contexts degrade — and what "lost in the middle" means
- Budget context deliberately: reserve for output, keep only what earns its place
- Handle overflow: truncate, summarise, retrieve (and know which to use when)

## 1. One-Line Definition

**The context window is the maximum number of tokens the model can take as input in a single request — the entire "working set" of text it can attend to while generating a response.**

The one-sentence interview answer: *"The context window is the model's working memory: every token in it — system prompt, conversation history, retrieved documents — can be attended to (L136) while generating. It is a hard budget: input beyond it is rejected or truncated, and even within it, the model uses long contexts less well than short ones."*

## 2. Mental Model

Think of the context window as a **desk of fixed size**, and every request as arranging papers on it before answering.

Everything you want the model to know must be on the desk *before* it answers: the instructions, the conversation so far, the documents, the user's question. There is no "going to look something up" — if it's not on the desk, the model cannot see it (this is exactly why RAG exists, L174). And the desk is a *budget*: the bigger the pile, the slower the attention (O(n²), L136), the higher the cost (L150), and — past a point — the worse the model actually uses it.

```text
   Context window (e.g. 128K tokens)
   ┌────────────────────────────────────────────────────────┐
   │ system prompt      ~2K    (instructions, tools)        │
   │ conversation       ~10K   (history, if any)            │
   │ retrieved docs     ~100K  (RAG payload, if any)        │
   │ user question      ~0.2K                               │
   ├────────────────────────────────────────────────────────┤
   │   [reserved for the ANSWER — output tokens]  ~4K       │
   │                                                       │
   │   ↑ this part is the model's working set              │
   └────────────────────────────────────────────────────────┘
```

The key shift in thinking: **the window is not "how much the model can read" — it's "everything the model will work with", and you choose what earns a seat on the desk.** Everything you put in is context the model must attend over — and everything you leave out is information it cannot use.

## 3. Visual Flow — What Happens at the Edge of the Window

```text
   Input: system + history + docs + question
   ┌──────────────────────────────────────────────┐
   │ ████████████████████████████████████████│     │
   └──────────────────────────────────────────────┘
             within window                beyond window
                │                              │
                ▼                              ▼
        ┌────────────────┐            ┌─────────────────┐
        │  model attends │            │ ① hard rejection │
        │  to everything │            │    (API error)   │
        │  → answer      │            │ ② truncation     │
        └────────────────┘            │    (provider or  │
                                      │     you, silently)│
                                      │ ③ retrieval      │
                                      │    (you chose     │
                                      │     what fits)   │
                                      └─────────────────┘
```

Three ways to meet the edge, and each is a different *design choice*:

1. **Reject** — the API returns an error. Safe, obvious, and useless in production.
2. **Truncate** — drop the oldest tokens. Cheap, but you lose the past (or the middle).
3. **Retrieve** — you *chose* what earns a seat (RAG, L174). This is the senior move: you decide what the model sees instead of letting a silent default decide for you.

> [!NOTE]
> **The silent-truncation trap.** Some SDKs truncate for you. The model then answers *without the information you thought it had* — and you can't tell from the answer. Always know which of the three your stack does, and make it a deliberate choice.

## 4. How It Works — What Fills the Window, and Why It Degrades

The window is filled by *everything the model attends to* — and attention (L136) is O(n²). That single fact explains the whole shape of this lesson:

- **Long inputs are slow and expensive.** Every token attends to every other; doubling the input quadruples the attention work. A 100K-token prompt is a *different computational object* than a 2K one.
- **Long contexts are used less well.** Empirically, models attend to the beginning and end of a long context far better than the middle — the **"lost in the middle"** effect. A critical fact sitting at token 60,000 of 120,000 is likely to be missed.
- **The window is a working set, not a library.** Putting 100K tokens of documents "just in case" is like piling every book on your desk: the one you need is in there, but the model can't reliably find it. That's what retrieval exists for.

```text
   how well the model USES a long context (schematic)
   high ████████                                  ████████
         │   start (recent, salient)              end (the question)
   mid  ████          ── lost in the middle ──          ████
   low  ███                                          ███
        └──────────────────────────────────────────────┘
        token 0                                  token N
```

The engineering consequence is blunt: **if it matters, put it at the start or the end — or retrieve it on demand.**

## 5. Real Project Usage

- **RAG is a context-budgeting strategy.** The whole point of retrieval (L174, L189) is to fit the *relevant* documents into the window instead of everything. "128K context" did not kill RAG — retrieval became *more* important because the window rewards curation.
- **Conversation history is a ticking budget.** Every turn adds tokens. A 20-turn chat can outgrow the window — which is why real products summarise old turns or drop them (L166, L167).
- **The system prompt is permanent rent.** It's in every request. A 2K system prompt on 1M requests/month is a cost line you can measure (L149, L150) — keep it lean and cache-stable.
- **Agent loops spend the window fast.** Each tool result comes back *into* the context (L144, L205); a long agent run is a context-management problem, not just a logic problem.
- **Multi-document products are context-constrained by design.** "Ask questions over my whole codebase" is a retrieval + summarisation architecture, never a "dump everything in" one.

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "The context window is the maximum input tokens the model can attend to in one generation — its working set."
2. **The budget.** "It's filled by system prompt, history, retrieved docs, and the question — and the output needs its own reservation, because output tokens come out of the same window."
3. **The degradation.** "Attention is O(n²), so long contexts are slower and pricier — and models use them unevenly: they remember the start and end and lose the middle. That's the 'lost in the middle' effect."
4. **The strategy.** "So I treat the window as a curated working set: retrieve what matters, summarise what's past, keep the system prompt lean, and reserve for output. If it doesn't earn its seat, it doesn't sit on the desk."

## 7. Senior-Level Insights

- **The window is a product decision, not just a model spec.** A bigger window changes *what you can build* — full-file editing, long-form agents — but it also changes the *economics* (cost per request) and the *quality curve* (degradation). Choosing a model (L148) includes choosing its window.
- **"Lost in the middle" is the reason retrieval wins.** The empirical finding is not "long context is bad" — it's "long context is unevenly used". Retrieval exists to turn an even-but-shallow scan into a targeted look.
- **Output reservation is the most-forgotten line of the budget.** Every request has `max_tokens` of output inside the same window; a 128K window with a 16K answer leaves 112K for input. Forgetting this is a classic off-by-one in architecture reviews.
- **Context is where agents die.** The most common agent failure (L211) is the loop exhausting the window — the fix is summarisation, retrieval, and tool discipline, not a bigger model.

## 8. Common Mistakes

- **Treating the window as a reading limit.** It's a *working set* — the model attends over all of it, at O(n²) cost. "Just paste the whole codebase" is how you get slow, expensive, middle-losing answers.
- **Forgetting the output reservation.** Input + output share the window. A 200K window does not give you 200K of input.
- **Trusting silent truncation.** If the SDK drops old turns, the model answers without information you think it has — and the answer looks normal. Make truncation explicit and visible.
- **Ignoring the middle.** The middle of a long context is where facts go to die. If the answer depends on a fact, don't bury it at token 60,000.
- **Designing for the window's maximum.** The *usable* window is smaller than the *specified* one, once you account for degradation and the output budget. Design for the working range, not the headline number.

## 9. Best Practices

- **Reserve output first.** Decide `max_tokens`, then budget the input against what's left.
- **Categorise every input line.** System (permanent), history (summarisable), docs (retrievable), question (required). Anything that's not required belongs outside the window.
- **Retrieve, don't dump** — and retrieve the *relevant* part, not the whole document (L189, L191).
- **Summarise the past.** Old conversation (L166) and old agent steps (L205) should be compressed, not appended forever.
- **Keep the system prompt lean and byte-stable** — it's in every request and it's a cache key (L171).
- **Know your provider's truncation behaviour** — and prefer to control it yourself.

## 10. Interview Questions

**Q: What is the context window?**
> A: The maximum number of tokens the model can take as input in one generation — its entire working set. Everything in it — system prompt, history, retrieved documents, the question — can be attended to; everything outside it is invisible to the model.

**Q: What happens when you exceed it?**
> A: Either the request is rejected with a context-length error, or it's truncated — often silently, dropping the oldest tokens. In production I make that a deliberate choice: reject, truncate, or retrieve. Retrieval is the one where I decide what the model sees.

**Q: Why do models use long contexts less well than short ones?**
> A: Two reasons. Attention is O(n²), so long contexts are computationally heavy. And empirically, models attend best to the start and end — the middle gets lost, the 'lost in the middle' effect. So a long context is both more expensive and less reliably used.

**Q: Does a big context window make RAG unnecessary?**
> A: No — the opposite. A bigger window raises the ceiling, but it also raises the cost of filling it, and it doesn't fix the uneven use of long contexts. RAG is how you decide what earns a seat in the window. A 128K window with the right 5K in it beats 128K of everything.

## 11. Follow-Up Questions

- How do you decide what goes in the window vs what gets retrieved?
- What's the difference between truncation and summarisation, and when do you use each?
- How does conversation history eat the window over time, and what do you do about it (L166)?
- Why does the output budget live inside the same window?
- How would the design change for a 2K window vs a 200K window model?

## 12. Comparison Table — Context Models

| | Small window (~4–8K) | Standard (~32–64K) | Long (~128–200K+) |
|---|---|---|---|
| Typical cost per request | lowest | moderate | highest |
| Latency (attention) | lowest | moderate | highest |
| Reliable use of the middle | n/a (short) | modest | poor ("lost in the middle") |
| Best for | classification, extraction, short chat | RAG, summarisation, coding | full-file editing, long agents |
| The architect's move | keep it short | retrieve into it | *retrieve even more deliberately* |

The senior read: the window is a *budget with a quality curve* — bigger buys ceiling, pays in cost and reliability. Choose the window that matches the task (L148), and curate what fills it.

## 13. Code Example — Budgeting a Request Against the Window

```js
// The context budget, made explicit: reserve output, then account for input.
function budgetRequest({ system, history, docs, question, maxTokens, windowSize }) {
  const count = (s) => s.split(/\s+/).length * 1.3; // quick estimate (L137)
  const lines = { system, history, docs, question };

  const input = Object.entries(lines)
    .filter(([k, v]) => v && (k !== 'docs' || v.length))
    .reduce((sum, [, v]) => sum + count(v), 0);

  const total = input + maxTokens;                  // output lives in the window too
  const headroom = windowSize - total;

  console.log(`input ${input} + output ${maxTokens} = ${total} / ${windowSize}`);
  console.log(headroom >= 0
    ? `✓ fits — ${headroom} tokens of headroom`
    : `✗ over by ${-headroom} tokens — retrieve or summarise (L174/L166)`);

  return { input, total, headroom };
}

budgetRequest({
  system: 'You are a concise tutor.',
  history: '',                                   // summarised, not appended (L166)
  docs: '…1500 words of retrieved docs…',        // retrieved, not dumped (L174)
  question: 'Summarise the key risks.',
  maxTokens: 300,
  windowSize: 8192,
});
// → input ~2600 + output 300 = ~2900 / 8192  →  ✓ fits
```

```text
What the reader must SEE — the budget is arithmetic:

  input (system + history + docs + question)
  + output reservation (max_tokens)
  ≤ window size

  Over budget? → retrieve less, summarise the past, or truncate deliberately.
```

```narrate
3: The counting rule from L137 — tokens ≈ words × 1.3. Estimate, then verify with the tokenizer.
9-10: Output is reserved inside the same window — the line everyone forgets.
14-18: The whole decision: does it fit, or do you retrieve/summarise?
```

> [!TIP]
> Keep this function in your repo. Every AI feature should be able to answer "what's my request budget?" — and this is the shape of that answer (L149 makes it rigorous).

## 14. Performance Notes

- **Attention is the cost driver.** O(n²) in input length (L136): a 100K-token input costs ~50× the attention of a 14K one, before you even generate a token.
- **TTFT scales with input length.** The first output token waits for the whole input to be processed (L145). Long-context requests feel slow before the model says a word.
- **KV cache grows with the window.** Long inputs mean big key-value caches (L136), which is both a latency and a memory cost — and why prompt caching (L171) rewards stable long prefixes.
- **Batching fights the window.** Long contexts shrink batch sizes on the GPU; a 128K-token request can dominate a batch. That's part of why long-context pricing is high (L150).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| "Context length exceeded" error | Input genuinely exceeds the window | Count tokens (L137); truncate or retrieve |
| Answer ignores a fact you included | It was in the "lost in the middle" zone | Move it to the start/end or retrieve it on demand |
| Answers get worse as the chat goes on | History is eating the window; old turns dilute attention | Summarise old turns (L166); cap history length |
| Request is slow before any output | Long input = long attention pass (O(n²)) | Shorten context; use prompt caching (L171) |
| SDK silently drops old messages | Provider/client-side truncation | Check the SDK's default; make truncation explicit |

## 16. Quick Revision Notes

- Context window = **the model's working set** — max input tokens it can attend to in one generation.
- Everything in it is **attended to at O(n²)** — long input = slow + expensive (L136, L151).
- Output tokens live **inside the same window** — reserve `max_tokens` first.
- Models use long contexts **unevenly** — start and end well, middle poorly ("lost in the middle").
- At the edge: **reject, truncate, or retrieve** — retrieval is the deliberate choice (L174).
- Design for the **usable window**, not the headline number.

## 17. Cheat Sheet

```text
CONTEXT WINDOW = working set, not a reading limit
  everything in it is attended to (O(n²))
  everything outside it is invisible

THE BUDGET
  system + history + docs + question + max_tokens  ≤  window

WHAT EATS IT
  system prompt   permanent rent      → keep lean, cache-stable
  history         grows per turn      → summarise (L166)
  docs            as big as you make  → retrieve (L174), don't dump
  output          reserved           → budget first

DEGRADATION
  O(n²) cost        long = slow + expensive
  lost-in-the-middle  start/end good, middle bad
  silent truncation   you think it's there, it isn't

AT THE EDGE — 3 CHOICES
  reject    error, safe, useless in prod
  truncate  cheap, loses the past
  retrieve  you decide what the model sees  ← the senior move

INTERVIEW, 4 MOVES
  1 definition "working set"
  2 budget     "everything + output reservation"
  3 degradation "O(n²), lost in the middle"
  4 strategy   "curate: retrieve, summarise, reserve"
```

## 18. Key Takeaways

> [!RECAP]
> - The context window is the model's **working set** — every token in it can be attended to; every token outside it is invisible
> - It is a **budget with a quality curve**: O(n²) attention makes long inputs slow and expensive, and "lost in the middle" makes them unreliable
> - **Output lives inside the same window** — reserve `max_tokens` before budgeting input
> - The three edge responses are **reject, truncate, retrieve** — and retrieval is the one where *you* decide what the model sees
> - A big window **does not kill RAG** — it makes curation more valuable, because cost scales and quality degrades as the pile grows
> - Design for the **usable window**: lean system prompt, summarised history, retrieved docs, reserved output

## Check your understanding

Answer these without looking back.

1. Define the context window, and name everything that fills it.
2. Why does a long input cost more and feel slower? (Name the operation.)
3. What is "lost in the middle", and what does it mean for where you place a critical fact?
4. Why must output tokens be budgeted inside the same window?
5. Name the three ways to meet the edge of the window, and which one is the senior move.
6. Why did a bigger context window not kill RAG?
7. Why does a 20-turn chat degrade, and what's the fix?
8. What does "design for the usable window" mean in practice?

## A Closing Note — The Desk You Choose

The context window is where the theory of the last three lessons becomes the practice of the next fifteen: it is the O(n²) of L136 made visible, the token counting of L137 made mandatory, and the reason retrieval (L174), summarisation (L166), caching (L171), and token budgeting (L149) exist at all. When an interviewer says "you have a 128K window — why would you still use RAG?", you now have the full answer: because the window is a working set with a cost curve and a quality curve, and curation is how you spend it well.

Next: the knob that controls how the model *chooses* among the probable continuations — temperature, top-p, and sampling.
