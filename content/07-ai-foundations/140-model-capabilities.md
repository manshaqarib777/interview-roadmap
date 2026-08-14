# Lesson 140 — Model Capabilities

**Interview importance:** ⭐⭐⭐ — "what can frontier models actually do?" separates someone who uses AI from someone who *architects with it*; the answer is a capability map, not a feature list.

Lessons 135–139 built the mechanism: next-token prediction (L135), attention (L136), tokens (L137), context (L138), sampling (L139). This lesson is the *capability surface* — what that mechanism can actually do well, where it degrades, and how a solutions architect *chooses the right tool for the job* (the title of L148, which this lesson feeds). You are not learning to use ChatGPT here; you are learning to *catalogue* what the tool is for.

The distinction this lesson is built on: a **user** knows "AI can write, code, and answer questions". A **solutions architect** knows the *shape* of capability — where models are strong (language, summarisation, code in familiar patterns, translation, extraction) and where they are weak (recent facts, precise arithmetic, novel reasoning, long-horizon planning) — and can map a product requirement to the right capability or the right *other tool*.

## Learning Objectives

By the end of this lesson you should be able to:

- Name the core capabilities: generation, comprehension, extraction, translation, code, reasoning
- Name the honest limits: recency, arithmetic, novelty, long-horizon planning
- Explain what "capability" really is: a learned pattern-matching skill, not a general intelligence
- Map a requirement to the right capability — or to a different tool entirely
- Explain why capability varies by model size, family, and training (L148)

## 1. One-Line Definition

**Model capabilities are the tasks a language model can perform well — generation, comprehension, extraction, translation, code, and a form of reasoning — all of them downstream of the same next-token predictor (L135), and each of them bounded by what the training data contains.**

The one-sentence interview answer: *"An LLM's capability is pattern-matching at scale: it is excellent at producing and understanding language — summarising, extracting, translating, coding in familiar patterns — and it is genuinely limited at anything that needs *recent facts, exact arithmetic, or novel multi-step reasoning*. The capability map is asymmetric: fluent where the training data is dense, brittle where it is thin."*

## 2. Mental Model

Think of capability as a **map with dense regions and deserts** — not a single "how smart is it" number.

The dense regions are where the training data is vast and the pattern is strong: language, summarisation, code, extraction, translation. The deserts are where the pattern breaks: recent events (data ended last year), exact arithmetic (prediction doesn't do column-math), novel reasoning (the pattern doesn't exist yet).

```text
        dense (strong)                        desert (weak)
   ┌───────────────────────┐           ┌────────────────────────┐
   │ language & style      │           │ recent facts           │
   │ summarisation         │           │ exact arithmetic       │
   │ extraction            │           │ novel reasoning        │
   │ translation           │           │ long-horizon planning  │
   │ code (common patterns)│           │ niche / rare knowledge │
   │ instruction following │           │ "knowing it doesn't    │
   │ chat & ideation       │           │  know"                 │
   └───────────────────────┘           └────────────────────────┘
        your product lives here              your design must route around
```

The senior move is not "how capable is the model?" — it's **"is this task in the dense region or the desert?"** Dense-region tasks get LLMs; desert tasks get grounding (L191), tools (L144), or a different tool entirely.

## 3. Visual Flow — Capability by Task Type

```text
   A requirement → which region is it in?

   "Summarise this 20-page report"
        │
        ▼
   ┌──────────────────────────────┐
   │ DENSE REGION (strong)        │  → LLM directly, with context (L138)
   │  summarisation, extraction   │
   └──────────────────────────────┘

   "What's the current price of AAPL?"
        │
        ▼
   ┌──────────────────────────────┐
   │ DESERT (recency, facts)      │  → tool call (L144) / RAG (L191)
   │  the model doesn't know      │     the model must not guess
   └──────────────────────────────┘

   "Calculate 2,847 × 391 exactly"
        │
        ▼
   ┌──────────────────────────────┐
   │ DESERT (arithmetic)          │  → give it a calculator tool, or
   │  prediction ≠ arithmetic     │     let it write+run code (L144)
   └──────────────────────────────┘

   "Plan a 6-month product roadmap"
        │
        ▼
   ┌──────────────────────────────┐
   │ BORDERLINE (planning)        │  → scaffold the plan, let the model
   │  good drafts, weak horizon   │     fill sections; human steers
   └──────────────────────────────┘
```

The flow is the interview: **classify the task, then route it.** A senior architect never asks "can the AI do this?" generically — they ask "which region is this task in, and what does that imply?"

## 4. How It Works — Why Capability Is Asymmetric

Every capability is the *same* next-token predictor expressing itself differently. That explains the shape of the map:

- **Summarisation / extraction work** because the training data is full of "here is a summary", "the key points are", "extract the action items" — dense, repeated patterns. The model is *continuing a well-worn pattern*.
- **Code in common patterns works** for the same reason: the internet is full of "how to sort an array", "how to write a React hook". Novel or niche code degrades because the pattern is thinner.
- **Reasoning "works"** when it's a *pattern of reasoning* — chain-of-thought, "first…, then…, finally…" — that the model has seen thousands of times. Novel, multi-step, constraint-heavy reasoning is where the pattern runs out (this is exactly what "extended thinking" is engineered against, and its limits are real).
- **Recency fails** because the weights froze at the end of training. There is *no mechanism* in the model for "today" — only the pattern of what "a date in 2023" looks like (which is why it can invent a plausible-sounding "today").
- **Arithmetic fails** because next-token prediction is not arithmetic; 2,847 × 391 has no stable pattern in text the way "the capital of France" does. Give it a calculator (tool, L144) and the *model* becomes accurate at arithmetic — by delegation.
- **Confidence is decoupled from correctness.** The same machinery that makes "Paris" 91% likely makes a hallucinated fact 91% likely. Capability and calibration are different axes (this is the seed of L141).

> [!NOTE]
> **The one sentence that ties it together.** Every capability is "pattern-matching at scale" — strong where the pattern is dense, weak where it's thin, and *calibrated to nothing*. That single sentence explains the whole asymmetry and predicts the failure modes before you meet them.

## 5. Real Project Usage

- **Summarisation products** — meeting notes, support threads, document digests. Dense region, LLM directly, with a good prompt (L142) and a context budget (L138).
- **Extraction / classification** — "is this ticket a refund?", "extract entities from this invoice". Dense region, low temperature (L139), structured outputs (L143).
- **Code assistants** — completion and generation in common patterns. Dense region, but with tools: let it run code, read errors, iterate (L144, L164).
- **Chat / copilots** — the flagship. Dense region, moderate temperature (L139), conversation management (L166).
- **RAG over company knowledge** — "ask questions over our docs". The model's *language* capability does the synthesis; the *facts* come from retrieval (L174), because facts are in the desert.
- **Translation** — dense in common pairs, brittle in niche or low-resource ones (a tokenization + data-density issue, L137).

The through-line: **products succeed when they put the model in its dense region and route the deserts elsewhere.**

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "Capability is pattern-matching at scale — the same next-token predictor (L135) expressed in different tasks. Strong where training data is dense, weak where it's thin."
2. **The dense map.** "Language, summarisation, extraction, translation, code in common patterns, instruction following — these are the regions where the model is genuinely strong."
3. **The deserts.** "Recent facts, exact arithmetic, novel multi-step reasoning, and knowing what it doesn't know. Those are where I route around the model — grounding for facts, tools for arithmetic, humans for novel planning."
4. **The consequence.** "So 'can the AI do this?' is the wrong question. The right one is 'which region is this task in, and what does that imply for my architecture?'"

## 7. Senior-Level Insights

- **Capability is a *distribution* over tasks, not a level.** The same model is world-class at summarisation and worse than a calculator at arithmetic. Rating a model "smart" is meaningless; rating it *per task region* is engineering.
- **The deserts are *features of the mechanism*, not bugs to be patched.** You can't "prompt away" the recency limit — you add tools. The senior framing is *route around the desert*, not *expect the model to cross it*.
- **Reasoning is the frontier — and the most overclaimed.** Models are strong at *patterned* reasoning (chains of thought they've seen) and weaker at *novel* constraint-heavy reasoning. The senior answer distinguishes the two, and designs for the former while verifying the latter (evals, L328+).
- **Capability is moving, and it moves unevenly.** Each frontier generation (L148) improves the dense regions and shrinks some deserts — but the *shape* (asymmetric, calibration-poor) persists. Architectures that route around the deserts survive model upgrades; architectures that assume a level do not.

## 8. Common Mistakes

- **Treating the model as a general intelligence** — expecting it to be uniformly capable across tasks, then being surprised at arithmetic and recency failures.
- **Asking it for facts it cannot have** — "what's the latest version of X?" with no tooling. The model will invent a plausible answer (that's L141's hallucination, invited).
- **Assuming capability = accuracy.** Fluent ≠ correct. Calibration is a separate axis and is poor — high confidence, high error.
- **Judging "smartness" by one demo.** A model that writes great emails can still be terrible at your niche schema. Test per task region, not by impression.
- **Under-routing the deserts.** "The model can do it" ≠ "the model should do it". If a task needs a fact, an exact number, or a current state, the architecture needs a tool or a lookup — not a prompt.

## 9. Best Practices

- **Map your feature's tasks to regions before choosing a model.** Make the dense/desert list for *your* domain; it drives model selection (L148) and architecture.
- **Route the deserts explicitly.** Facts → retrieval/tools (L144, L191); arithmetic → calculator/code execution; recency → API/tool; novel planning → human-in-the-loop (L208).
- **Assume poor calibration.** For anything consequential, verify — with evals (L343), structured checks, or a human gate. Never trust confidence as a signal.
- **Test in the dense region you actually use.** Your summarisation task is not "the model is good at summarisation" — run *your* documents, *your* prompts, *your* eval set.
- **Re-test on model upgrades.** Capability shifts between versions; your region map is a living document, not a one-time judgement.

## 10. Interview Questions

**Q: What are LLMs actually good at?**
> A: Dense-region tasks — language and style, summarisation, extraction and classification, translation, code in common patterns, and instruction following. These work because the training data is full of the patterns they need to continue.

**Q: What are they genuinely bad at?**
> A: Recency (the weights froze at training), exact arithmetic (prediction isn't computation), novel multi-step reasoning (thin patterns), and calibration — they don't know what they don't know. Those are the deserts, and the architecture routes around them.

**Q: Why can a model that writes great code fail at a simple calculation?**
> A: Because capability is per-task-region, not a single level. Code in common patterns is a dense region — millions of examples. Exact arithmetic is a desert — there's no stable text pattern for "2,847 × 391". Same mechanism, different data density.

**Q: How do you decide whether a task should use an LLM?**
> A: I classify the task into a region. If it's dense — language, extraction, summarisation — an LLM with a good prompt is the right tool. If it's a desert — facts, arithmetic, recency — I route it to a tool, retrieval, or a different system, and use the model only where its language capability adds value.

## 11. Follow-Up Questions

- Where exactly does the recency limit come from, mechanically?
- Why is the model's confidence not a reliable signal?
- What distinguishes "patterned reasoning" from "novel reasoning"?
- How does adding tools change the capability map (L144)?
- Why does capability shift between model versions, and what does that mean for evals?

## 12. Comparison Table — Task Regions

| Task | Region | What the model does | Architect's default |
|---|---|---|---|
| Summarise a report | dense | strong, fluent | LLM + context (L138) |
| Extract entities | dense | strong | LLM + structured output (L143) |
| Translate common pairs | dense | strong | LLM |
| Code in common patterns | dense | strong | LLM + tools (L144) |
| Recent facts | desert | invents plausibly | retrieval / tools (L191, L144) |
| Exact arithmetic | desert | approximates | calculator / code execution |
| Novel multi-step reasoning | desert-ish | drafts, then drifts | scaffold + human steers |
| Knowing what it doesn't know | desert | confident either way | evals + verification (L343) |

The senior read: **the table is your design checklist.** For every feature, put the task in a row; if it's a desert row, the architecture must supply what the model can't.

## 13. Code Example — Routing the Deserts (Tools Instead of Guessing)

```js
// The capability map in code: strong tasks use the model,
// desert tasks use tools — the model never guesses a fact.

const { OpenAI } = require('openai');
const openai = new OpenAI();

// DESERT: a current fact. The model must NOT invent the price.
async function stockPrice(ticker) {
  // In production this calls a real market API (L144 tools).
  const price = await fetchMarketPrice(ticker);   // ← the tool
  return price;
}

// DENSE: summarise — the model's strong region.
async function summarize(text) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Summarise in 3 bullets.' },
      { role: 'user', content: text },
    ],
    temperature: 0.2,
  });
  return res.choices[0].message.content;
}

// DESERT: exact arithmetic. Never ask the model to multiply.
function multiply(a, b) {
  return a * b;   // the calculator is a tool, not a prompt
}

// The product: "what's AAPL worth and why?" → tool for the fact,
// model for the explanation. Each side does what it's good at.
```

```text
What the reader must SEE — the split:

  current price   → fetchMarketPrice()   (a tool, not a prompt)
  summary         → the LLM              (its dense region)
  exact product   → a * b                (a calculator, not a prompt)
```

```narrate
9-12: A current fact is a desert — the tool supplies it, the model never guesses.
16-23: Summarisation is the dense region — the model, with a tight prompt.
26-29: Arithmetic is a desert — the code does it; the model doesn't multiply.
```

> [!TIP]
> This file is a microcosm of the whole module: **route by region.** The model writes the summary and explains the number; the API and the calculator supply the facts and the math. That split — model for language, tools for truth — is the architecture behind every reliable AI product.

## 14. Performance Notes

- **Dense-region tasks are cheap to run well** — a good prompt (L142) gets most of the win; you don't need the biggest model for summarisation or extraction.
- **Desert tasks are expensive to force.** Making the model "reason" its way to arithmetic costs tokens and still fails; the tool is faster, cheaper, and exact. Routing is a performance strategy, not just a quality one.
- **Reasoning is token-hungry.** Extended thinking / chain-of-thought improves many tasks but multiplies output tokens (and latency, L145, L151). Budget it where it pays.
- **Capability ≠ throughput.** A model that's great at a task can still be slow or expensive per call; the region map decides *whether* to use it, the cost model (L150) decides *how much*.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Confident wrong fact | The task is in the recency/knowledge desert | Add retrieval or a tool; never re-prompt the same desert |
| Bad arithmetic in output | The model was asked to compute | Give it a calculator/code tool (L144); don't prompt it |
| Great on simple, weak on your niche case | Your niche is a thin-data region | Test per region; consider a specialised/fine-tuned model (L148) |
| Model "reasons" to a wrong conclusion | Novel multi-step reasoning exceeded the pattern | Scaffold the steps; verify each; add a human gate for the risky ones (L208) |
| High confidence, wrong answer | Calibration is poor (by design) | Never trust confidence; add evals/checks (L343) |

## 16. Quick Revision Notes

- Capability = **pattern-matching at scale** — the same next-token predictor (L135), task by task.
- **Dense regions**: language, summarisation, extraction, translation, code (common), instruction following.
- **Deserts**: recent facts, exact arithmetic, novel reasoning, calibration ("doesn't know it doesn't know").
- The senior question: **"which region is this task in?"** — not "how smart is the model?"
- **Route the deserts**: facts → retrieval/tools; arithmetic → calculator; recency → API; planning → human.
- Capability is **asymmetric and moving** — re-test per region and per model version (L148).

## 17. Cheat Sheet

```text
CAPABILITY = pattern-matching at scale (L135's mechanism)

DENSE (strong)              DESERT (weak)
  language & style            recent facts
  summarisation               exact arithmetic
  extraction / classification novel multi-step reasoning
  translation (common)        niche / rare knowledge
  code (common patterns)      calibration ("knows" what it
  instruction following         doesn't know — it doesn't)

WHY ASYMMETRIC
  dense  = pattern is everywhere in training data
  desert = pattern is thin, or absent, or needs a clock

ROUTE, DON'T PROMPT
  fact      → retrieval / tool (L191, L144)
  arithmetic→ calculator / code execution
  recency   → API / tool
  planning  → scaffold + human-in-the-loop (L208)
  confidence→ never a signal; verify (L343)

INTERVIEW, 4 MOVES
  1 frame    "pattern-matching at scale"
  2 dense    "language, extraction, code, summarisation"
  3 desert   "recency, arithmetic, novel reasoning, calibration"
  4 move     "classify the task, route the desert, model in its region"
```

## 18. Key Takeaways

> [!RECAP]
> - Capability is **pattern-matching at scale** — strong in dense training-data regions, weak in the deserts, and **never calibrated** to its own accuracy
> - The dense regions: **language, summarisation, extraction, translation, code (common patterns), instruction following** — where products should put the model
> - The deserts: **recent facts, exact arithmetic, novel multi-step reasoning, knowing what it doesn't know** — where the architecture must route around the model
> - The senior question is **"which region is this task in?"** — and the senior move is *route the desert*, not *prompt harder*
> - Capability is **per-task and moving**: re-test your regions on every model upgrade
> - This capability map is what model selection (L148) and every architecture decision in this module run on

## Check your understanding

Answer these without looking back.

1. Define capability in one sentence — mechanism first.
2. Name four dense-region and four desert tasks.
3. Why is the same model great at summarisation and bad at arithmetic?
4. What does "calibration" mean, and why is it poor in LLMs?
5. For each desert (facts, arithmetic, recency, planning), name the routing strategy.
6. Why is "how smart is the model?" the wrong question?
7. How would you decide whether a feature should use an LLM at all?
8. Why does capability shift between model versions, and what does that mean for your code?

## A Closing Note — You Can Now See the Map

Lesson 135 gave you the mechanism; this lesson gives you the *terrain*. From here on, "can the model do X?" is never a mystery — it's a region question with a default answer: *if it's a dense pattern, yes; if it's a fact, a number, or a novel chain, route it.* That single skill — classifying the task before choosing the tool — is what makes the rest of the module actionable: it tells you when to prompt (L142), when to structure (L143), when to tool (L144), and when to retrieve (L174).

Next lesson: the other side of the map — model limitations, and why the model is *designed* to be fluently wrong.
