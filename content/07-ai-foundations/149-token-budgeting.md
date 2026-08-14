# Lesson 149 — Token Management & Budgeting

**Interview importance:** ⭐⭐⭐⭐ — "how do you keep token costs under control?" is the economics question; the answer is a *budgeting discipline*, not a guess.

Lessons 137 and 138 gave you the unit (tokens) and the ceiling (context). This lesson is the discipline that manages both: **token budgeting** — counting what a request costs, reserving for output, trimming what doesn't earn its seat, and making the numbers part of the architecture. You do not manage tokens by hoping; you manage them by accounting for them per request, per feature, and per user.

The distinction this lesson is built on: a **demo builder** watches token counts in the dashboard after the fact. A **solutions architect** *budgets before the call* — a per-request token ledger with a reserve for output, a hard cap, and a trimming strategy — and knows the number before the bill arrives.

## Learning Objectives

By the end of this lesson you should be able to:

- Budget a request's tokens up front: system + history + docs + question + output reserve
- Explain why the output reserve is the most-forgotten line of the budget
- Trim a request that exceeds its budget: summarise, truncate, retrieve
- Set per-request and per-user token caps, and handle the "over budget" path
- Turn token budgeting into a repeatable, measured discipline (the seed of L150's cost model)

## 1. One-Line Definition

**Token budgeting is accounting for every token a request consumes — input lines and the output reserve — against a per-request cap, so cost, context, and quality are managed deliberately instead of discovered in the bill.**

The one-sentence interview answer: *"Token budgeting is the discipline of counting a request's tokens before sending it: system prompt, history, retrieved docs, the question, plus a reserved slice for the answer — all against a cap. I know the number before the call, trim when it's over, and treat the output reserve as non-negotiable, because output tokens are the expensive, slow ones (L135, L150)."*

## 2. Mental Model

Think of a token budget as **a household budget for every request** — and the model as a household that will happily spend whatever it's given.

Every request has income (the context window, L138) and expenses (everything you put in, plus the answer). Like a budget, the discipline is: know what each line costs, reserve for the essentials, and cut the discretionary spending. And like a household, **the model will spend to the limit you give it** — an unbounded output reservation, or a history that grows forever, is a budget leak wearing a smile.

```text
   One request's ledger (the whole lesson in a table)

   line              tokens    why it's there          the lever
   ─────────────────────────────────────────────────────────────
   system prompt      2,000    instructions (L142)     keep lean, cache-stable (L171)
   history           10,000    past turns (L166)       summarise, don't append
   retrieved docs    60,000    RAG payload (L174)      retrieve tighter (L189)
   question             200    the ask                 the ask
   ─────────────────────────────────────────────────────────────
   output reserve     4,000    the answer (L135)       budget max_tokens
   ─────────────────────────────────────────────────────────────
   TOTAL             76,200    vs the window (e.g. 128K) → 51,800 headroom
```

The three levers — **lean system, summarised history, tight retrieval** — are where the budget is actually won or lost. The output reserve is the line everyone forgets, and it's the line that decides whether the answer gets cut off (L145's `length` finish reason).

## 3. Visual Flow — The Budget Checkpoint

```text
   A request is about to be sent
        │
        ▼
   ┌──────────────────────────────────────────┐
   │ COUNT: system + history + docs + question│  (L137's counting)
   │         + output reserve                  │
   └──────────────────┬───────────────────────┘
                      ▼
   fits in the window? (L138)
        │
        ├── YES ──────────────▶ send it (with max_tokens set)
        │
        └── NO ──▶ TRIM, in order:
              │
              ├─ 1 · tighten retrieval    (L189 — fewer, better chunks)
              ├─ 2 · summarise history    (L166 — compress old turns)
              ├─ 3 · shorten the system   (L142 — cut the spec to the spec)
              └─ 4 · reduce output reserve (but never below what the task needs)
                      │
                      ▼
              re-count → fits? → send, or refuse with a clean error
```

The order matters: **retrieve tighter first** (cheapest, most quality-preserving), **summarise history second**, **shorten system third** — and only *then* touch the output reserve, because cutting the answer budget cuts the product. The refusal at the end is a feature, not a failure: an over-budget request handled deliberately beats a silent truncation (L138) that the user never sees.

## 4. How It Works — The Budgeting Mechanics

- **Counting is deterministic (L137).** Inputs can be tokenized exactly before the call. The tokenizer is free and instant — so there is no excuse for guessing. Count, then send.
- **The output reserve is inside the window (L138).** `max_tokens` is not an afterthought; it's the slice of the window the answer will occupy. Forgetting it means your "128K window" is really "128K minus whatever the answer turns out to be".
- **The budget's failure mode is `length` (L145).** If the answer hits `max_tokens`, the stream ends with `finish_reason: length` — a truncated answer that looks normal unless you handle the reason. The budget is *also* a UX contract: reserve enough that the answer isn't cut off, or handle the cut.
- **The budget is per-request, per-feature, and per-user.** Per-request caps protect a single call; per-feature caps protect the product (a chat feature shouldn't eat the RAG feature's budget); per-user caps protect the business (L318's abuse surface). The three layers compose.

> [!NOTE]
> **The budget's honest name is the cost model.** Token budgeting (this lesson) and cost optimization (L150) are the same ledger at two scales: per-request here, per-month there. Budget the request right and the monthly number is arithmetic (L150). Budget it wrong and the monthly number is a surprise.

## 5. Real Project Usage

- **Chat products.** The budget is per turn: system + growing history + the answer. The history line grows forever unless summarised (L166) — the classic chat cost leak.
- **RAG pipelines.** The budget is dominated by the docs line (L174): retrieve 5 tight chunks instead of 20 loose ones (L189) and the request halves. Retrieval quality (L195) *is* a budget lever.
- **Agents (L200).** Every tool result comes back into context (L144); a long agent run is a token budget being spent turn by turn. Agent design (L205) includes a budget per loop.
- **Batch / offline jobs.** Summarising 100K documents (L150) is a *total* budget problem: per-request budget × volume. The per-request discipline decides whether the batch is affordable.
- **Multi-tenant SaaS (L357).** Per-user token caps are the product's cost control (L318) — one abusive user shouldn't blow the shared bill.

The through-line: **every AI feature has a token budget; the discipline is deciding it up front, measuring it, and trimming before the call — not after the bill.**

## 6. Interview Explanation

Say it in four moves:

1. **The definition.** "Token budgeting is accounting for every token a request consumes — the four input lines plus the output reserve — against a cap, before the call."
2. **The reserve.** "The output reserve is the line everyone forgets: `max_tokens` lives inside the same window (L138), and output tokens are the expensive, slow ones (L135, L150)."
3. **The trim order.** "When a request is over budget I trim in order: tighter retrieval (L189), summarised history (L166), leaner system prompt (L142) — and only then touch the answer budget."
4. **The layers.** "Budgeting is per-request, per-feature, and per-user — one discipline at three scales, and it's the same ledger L150 turns into the monthly cost model."

## 7. Senior-Level Insights

- **The output reserve is the most-forgotten line — and the most expensive one.** Output tokens cost 3–5× input (L150) and take the longest to generate (L151). A budget that ignores it is a budget that's wrong where it hurts most.
- **Budgeting is a *retrieval* discipline, not just a counting one.** The biggest lever on the docs line is retrieval quality (L189, L195): better chunks, not more of them. A tight, relevant 5K of context beats a dumpy 60K.
- **The budget is a *contract* with the UX.** `max_tokens` too low = truncated answers (L145's `length`); too high = latency and cost you didn't need. The reserve is a product decision with a number on it.
- **Per-user caps are the multi-tenant cost control (L357).** Token budgets are how an AI SaaS stays solvent: caps per user, per tier, per feature — enforced at the gateway (L172, L318), not hoped for.

## 8. Common Mistakes

- **Forgetting the output reserve.** The window is input *plus* answer; ignoring `max_tokens` silently shrinks your real input budget.
- **Counting at the wrong layer.** Word counts (L137) instead of tokens; the 1.3× error compounds across a whole pipeline.
- **Letting history grow forever.** Appending every turn (L166) eats the window and the bill; summarise or drop the old.
- **Dumping documents instead of retrieving.** Sending 60K tokens of "relevant-ish" docs when 5K tight chunks would do (L189).
- **Not handling `length`.** The truncated answer that looks complete (L145) — the budget's failure mode must be a designed path, not a silent bug.
- **Budgeting per-request only.** Without per-user caps (L318), a single abusive user or runaway agent blows the monthly number.

## 9. Best Practices

- **Count before you send** — the tokenizer is free; use it (L137).
- **Reserve output first**, then budget input against what's left (L138).
- **Trim in the right order**: retrieval → history → system → output reserve.
- **Set per-request, per-feature, and per-user caps** — and enforce them at the gateway (L172).
- **Handle the `length` finish reason explicitly** (L145): continue, summarise, or tell the user — never silently.
- **Measure.** Log tokens per request (L332), and let the per-request budget feed the monthly cost model (L150).

## 10. Interview Questions

**Q: How do you budget tokens for a request?**
> A: I count the four input lines — system, history, retrieved docs, question — using the provider's tokenizer (L137), reserve a slice for the answer (`max_tokens`), and check the total against the window (L138). If it's over, I trim in order: tighter retrieval (L189), summarised history (L166), leaner system prompt (L142), and only then reduce the output reserve.

**Q: Why is the output reserve so important?**
> A: Because output tokens are the expensive and slow ones (L135, L150) — 3–5× input cost — and they live inside the same window as the input (L138). Forget the reserve and you've silently shrunk your input budget, and risk truncated answers (L145's `length`).

**Q: What do you do when a request is over budget?**
> A: Trim in a fixed order: tighten retrieval first — better chunks, not more (L189) — then summarise history (L166), then shorten the system prompt (L142). I touch the output reserve last, because cutting the answer budget cuts the product. If it still doesn't fit, I refuse with a clean error rather than silently truncating (L138).

**Q: How does token budgeting scale to a whole product?**
> A: It's the same ledger at three scales: per-request caps protect a single call, per-feature caps protect the product, and per-user caps protect the business (L318). The per-request discipline feeds the monthly cost model (L150) — budget the request right, and the monthly number is arithmetic.

## 11. Follow-Up Questions

- How does retrieval quality (L189) become a token-budget lever?
- When should you summarise history instead of dropping it (L166)?
- How do per-user token caps work in a multi-tenant SaaS (L357)?
- What's the relationship between `max_tokens` and the `length` finish reason (L145)?
- How does prompt caching (L171) change the token-budget math?

## 12. Comparison Table — The Budget Lines

| Line | Typical share | The lever | Forgetting it costs |
|---|---|---|---|
| System prompt | small, permanent | keep lean + cache-stable (L142, L171) | cache misses, context rent |
| History | grows per turn | summarise, don't append (L166) | window + bill growth |
| Retrieved docs | biggest when RAG | tighten retrieval (L189) | cost + lost-in-the-middle (L138) |
| Question | small | keep it the ask | ambiguity (L142) |
| **Output reserve** | **forgotten** | **budget `max_tokens` first** | **truncation + the expensive tokens (L135)** |

The senior read: **the table is a trim order** — and the most valuable line to manage is the one everyone forgets.

## 13. Code Example — The Budget, Enforced

```js
// The budget, made code: count, reserve, trim, and refuse cleanly.
const { encoding_for_model } = require('tiktoken');   // L137's exact counter
const enc = encoding_for_model('gpt-4o');

const count = (s) => enc.encode(s).length;

function budgetRequest({ system, history, docs, question, maxTokens, windowSize }) {
  const input = count(system) + count(history) + count(docs) + count(question);
  const total = input + maxTokens;                    // ← the output reserve, inside the window

  if (total <= windowSize) {
    return { ok: true, input, total, maxTokens };
  }

  // Over budget → trim in the fixed order (the senior move).
  const trimmedDocs = docs.slice(0, 4000);            // 1 · tighter retrieval (L189)
  const trimmedHistory = history.slice(-2000);        // 2 · summarised history (L166)
  const input2 = count(system) + count(trimmedHistory)
    + count(trimmedDocs) + count(question);

  if (input2 + maxTokens <= windowSize) {
    return { ok: true, input: input2, total: input2 + maxTokens, maxTokens, trimmed: true };
  }

  // Still over → refuse cleanly. Never silently truncate (L138).
  return { ok: false, reason: 'over-budget', total: input2 + maxTokens };
}

const r = budgetRequest({
  system: 'You are a concise analyst.', docs: '…', history: '…',
  question: 'Summarise the risks.', maxTokens: 300, windowSize: 8192,
});
console.log(r);
```

```text
What the reader must SEE — the budget is a decision, not a hope:

  count (deterministic, L137) → add the output reserve → fits?
    yes → send with max_tokens set
    no  → trim: retrieval → history → system → reserve
    still no → refuse cleanly, never truncate silently
```

```narrate
3: Counting is exact — the model's own tokenizer, not a word estimate (L137).
6: The output reserve is inside the window — the line everyone forgets (L138).
11-14: Trim in the fixed order: retrieval first, then history — quality-preserving levers.
17-19: The refusal is a designed path, not a failure — never silently truncate (L138).
```

> [!TIP]
> Put this function in your gateway (L172) and every request that reaches the model has already been budgeted. That single checkpoint is the difference between a token bill you control and one that controls you.

## 14. Performance Notes

- **Counting is free; forgetting is expensive.** Tokenization is milliseconds and deterministic (L137) — the cheapest discipline in the stack.
- **The docs line is the lever with the most headroom.** Retrieval quality (L189, L195) routinely cuts the context 5–20× without hurting answers — a bigger win than any prompt tweak.
- **Prompt caching (L171) rewards stable budgets.** A byte-stable system prompt and stable doc prefix turn repeated cost into cached cost — the budget and the cache interact.
- **The output reserve is the latency lever too (L151).** Fewer output tokens = faster answers (each token is a forward pass, L135). Budgeting output is budgeting latency.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Answers keep getting cut off | `max_tokens` too low; `length` finish reason (L145) | Raise the reserve; handle `length` explicitly |
| Token bill grows with usage | History grows unbounded (L166) | Summarise/drop old turns; per-user caps (L318) |
| RAG requests over the window | Docs line too big (L174) | Tighten retrieval (L189); re-chunk (L178) |
| "Over budget" errors in prod | Per-request cap too tight for the feature | Trim first (retrieval/history/system), not the cap alone |
| Cache hit rate low | System prompt not byte-stable (L171) | Freeze the prompt; keep the budget stable |

## 16. Quick Revision Notes

- Token budgeting = **accounting for every token before the call**: system + history + docs + question + output reserve, against a cap.
- **The output reserve is the forgotten line** — inside the window (L138), expensive (L150), slow (L151).
- Trim order: **retrieval → history → system → output reserve**.
- Caps at **three scales**: per-request, per-feature, per-user (L318).
- **`length` is the budget's failure mode** — handle it, never silently truncate (L145).
- The per-request ledger **is** the monthly cost model's input (L150).

## 17. Cheat Sheet

```text
TOKEN BUDGET = the ledger of one request

  input   system + history + docs + question
  reserve max_tokens (output — the expensive, slow slice)
  TOTAL   input + reserve  ≤  window (L138)

TRIM ORDER (when over budget)
  1 retrieval  tighter chunks, not more (L189)
  2 history    summarise, don't append (L166)
  3 system     the shortest spec that covers it (L142)
  4 reserve    last — cutting it cuts the product

THE THREE SCALES
  per-request  protects one call
  per-feature  protects the product
  per-user     protects the business (L318)

RULES
  count before you send (tokenizer is free, L137)
  handle the `length` finish reason (L145)
  enforce at the gateway (L172)
  feed the monthly cost model (L150)

INTERVIEW, 4 MOVES
  1 definition "accounting per request, before the call"
  2 reserve    "output is the forgotten, expensive line"
  3 trim       "retrieval → history → system → reserve"
  4 scales     "request, feature, user — one ledger"
```

## 18. Key Takeaways

> [!RECAP]
> - Token budgeting is **accounting for every token before the call** — the four input lines plus the output reserve, against a cap
> - **The output reserve is the most-forgotten line**: it lives inside the window (L138), and output tokens are the expensive, slow ones (L135, L150)
> - The trim order is **retrieval → history → system → output reserve** — quality-preserving levers first, the answer budget last
> - Caps work at **three scales**: per-request, per-feature, per-user — one discipline protecting the call, the product, and the business
> - **`length` is the budget's failure mode** — handle it as a designed path, never a silent truncation (L145)
> - The per-request ledger **is the input to the monthly cost model** (L150) — budget the request right, and the bill is arithmetic

## Check your understanding

Answer these without looking back.

1. Name the five lines of a request's token budget.
2. Why is the output reserve the most-forgotten — and most expensive — line?
3. Write out the trim order, and say why retrieval comes first.
4. What are the three scales of caps, and what does each protect?
5. What is the budget's failure mode, and how do you handle it?
6. Why is counting deterministic, and why does that matter?
7. How does retrieval quality (L189) become a budget lever?
8. How does the per-request ledger become the monthly cost model (L150)?

## A Closing Note — The Ledger Before the Bill

Token budgeting is where architecture meets accounting: it's the discipline that makes cost (L150) a *calculated* number instead of a *discovered* one, and it's the layer where quality-preserving levers (retrieval, L189; history, L166) turn into hard savings. Hold the shape — **count, reserve, trim in order, cap at three scales, handle `length`** — and the next two lessons (cost, latency) become arithmetic on top of a ledger you already keep.

Next: the cost model — turning the per-request ledger into the monthly bill, and the levers that control it.
