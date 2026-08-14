# Lesson 148 — Model Selection & Frontier Families

**Interview importance:** ⭐⭐⭐⭐⭐ — "which model would you use, and why?" is *the* architect question; the answer is a decision procedure, never a brand loyalty.

Lessons 135–147 built the mechanism and the numbers. This lesson is where they converge into a decision: **which model, which size, which family, which provider** — for a given task, budget, and constraint. Model selection is the first architecture decision in every AI project, and the interview rewards a *repeatable decision rule* (the title of L157, which this feeds) over a favourite model.

The distinction this lesson is built on: a **fan** picks a model by hype. A **solutions architect** picks by a weighted decision: task fit (L140's regions), quality bar, cost per token (L150), latency (L151), context window (L138), tool/structured-output support (L143–L144), and the escape hatch (an abstraction, L155). The senior answer is "here's the rule I used", not "here's the model I like".

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the frontier families: OpenAI, Anthropic, Google — and what "frontier" means
- Explain the size tiers within a family: flagship, mid, small — and when each is right
- Run a model-selection decision: task → quality bar → budget → latency → context → features
- Explain why you rarely need the biggest model, and how to prove it
- Use an abstraction layer (L155) so the choice stays reversible

## 1. One-Line Definition

**Model selection is the architect's decision procedure for choosing an LLM — weighing task fit, quality, cost, latency, context, and feature support across the frontier families (OpenAI, Anthropic, Google) and the size tiers within them — so the choice is a justified trade-off, not a preference.**

The one-sentence interview answer: *"I select a model by a decision rule, not a preference: classify the task into a region (L140), set a quality bar, then check the constraints — cost per token (L150), latency (L151), context window (L138), and whether it supports tools and structured output (L143–L144). I start small, measure, and only move up when the evals say I must. And I keep the choice behind an abstraction (L155) so it stays reversible."*

## 2. Mental Model

Think of model families as **car brands and a lineup per brand** — each brand has a flagship, a sensible mid, and an economy model, and the right car depends on the trip, not the brand.

```text
   Frontier families (the three you'll actually choose between — L152-154, L156)
   ┌──────────────────┬──────────────────┬──────────────────┐
   │ OpenAI           │ Anthropic        │ Google           │
   │  flagship        │  flagship        │  flagship        │
   │  (strong general)│  (strong general)│  (multimodal)    │
   │  mid             │  mid             │  mid             │
   │  small/cheap     │  small/cheap     │  small/cheap     │
   │  embeddings      │  (no embeddings) │  embeddings      │
   │  vision/audio    │  vision          │  deep multimodal │
   └──────────────────┴──────────────────┴──────────────────┘

   Within a family: flagship = best quality, highest cost
                    mid      = the workhorse
                    small    = cheap, fast, good enough for easy tasks
```

The model-selection insight is the same as buying a car: **you don't take the flagship everywhere.** The flagship is for the hardest reasoning; the mid is for most production loads; the small is for classification, extraction, and anything with a clear right answer (L143). The cost gap between tiers (L150) is usually 10–50× — which is why "start small and measure" is the professional default.

## 3. Visual Flow — The Selection Decision Tree

```text
   A task arrives
        │
        ▼
   ┌────────────────────────────────────────────┐
   │ 1 · CLASSIFY the task (L140)              │
   │     dense region?  desert?  borderline?   │
   └──────────────────┬─────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────┐
   │ 2 · SET the quality bar                   │
   │     what's the cost of being wrong?       │
   │     (extraction: high bar, low temp 0)    │
   │     (chat: moderate, variety ok)          │
   └──────────────────┬─────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────┐
   │ 3 · CHECK THE CONSTRAINTS                 │
   │     cost/token (L150) · latency (L151)    │
   │     context window (L138) · tools (L144)  │
   │     structured output (L143) · modality   │
   └──────────────────┬─────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────┐
   │ 4 · START SMALL, MEASURE, MOVE UP ONLY    │
   │     if evals (L343) say the small model   │
   │     fails the quality bar → move up one   │
   └──────────────────┬─────────────────────────┘
                      ▼
   a chosen model, with the evals that justify it
```

The shape to remember: **classify → set the bar → check constraints → start small → measure → escalate only on evidence.** A selection without an eval (L343) is an opinion; a selection with one is an architecture decision.

## 4. How It Works — What Actually Differs Between Models

Four axes separate models, and only one of them is "smartness":

| Axis | What it is | How you weigh it |
|---|---|---|
| **Quality** | how well it does hard tasks (reasoning, code, nuance) | evals on *your* task (L343) |
| **Cost** | $ per 1M input/output tokens (L150) | your volume × your token count |
| **Latency** | time to first token + tokens/sec (L151) | your UX budget |
| **Context window** | max input tokens (L138) | your prompt/RAG size |
| **Feature support** | tools, structured output, vision, audio (L143–L146) | does your feature need it? |

The "frontier" label means *currently best-in-class on benchmarks* — and it moves every few months (L156). What does *not* move: the shape of the trade-off. **A bigger model is better at hard tasks, slower, and more expensive — and the gap between tiers is where the architecture money is.** The senior move is to size the model to the task, not to the hype.

> [!NOTE]
> **Size tiers are a price-quality curve, not a rule.** The small model in one family can beat the flagship of another on specific tasks (especially code or structured output). The "start small, measure, escalate" rule exists because the *only* way to know is to eval (L343) — never pick a tier by its reputation.

## 5. Real Project Usage

- **Extraction / classification → small model, temperature 0 (L139), structured output (L143).** A clear right answer needs no flagship. The small model is 10–50× cheaper (L150) and often just as accurate on the label set.
- **RAG synthesis → mid model.** Reading retrieved chunks (L174) and writing a grounded answer is a mid-tier strength; the flagship adds little.
- **Hard reasoning / agent loops → flagship.** Novel multi-step reasoning (L140's desert), complex planning, tool-heavy loops (L200) — this is where the flagship earns its price.
- **Chat products → mid, with the small for short replies.** Conversational quality saturates at the mid tier for most products; the flagship's edge is in the long tail of hard questions.
- **Multimodal tasks → the family that does the modality well.** Vision, audio, PDF (L146) — Google is multimodal-native, OpenAI and Anthropic have vision; pick the *modality* fit, not the general hype.

The through-line: **model selection is tiering your workload** — most requests are cheap, a few are expensive, and the architecture routes each to the tier that clears its quality bar at minimum cost (L157 makes this a rule).

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "Model selection is a decision procedure, not a preference — I classify the task, set a quality bar, and check the constraints: cost, latency, context, features."
2. **The rule.** "I start with the smallest model that plausibly clears the bar — small models are 10–50× cheaper (L150) — measure against evals (L343), and escalate only when the numbers say I must."
3. **The families.** "OpenAI, Anthropic, and Google are the frontier families (L156); within each there's a flagship, a mid, and a small. The brand matters less than the tier-to-task fit."
4. **The hedge.** "And I keep the choice behind an abstraction (L155), so when the frontier moves — and it moves every few months — swapping the model is a config change, not a rewrite."

## 7. Senior-Level Insights

- **The flagship is a tool, not a status symbol.** Production budgets route most traffic to the mid/small tiers (L150). A system that sends every request to the flagship is a cost leak, and an interview answer that does the same is a red flag.
- **The choice is *task-shaped* and *measurable*.** The same model is world-class at extraction and unnecessary for it. The senior answer names the task region (L140), the quality bar, and the eval that decided it — never "this one is smarter".
- **The frontier moves; your architecture shouldn't have to.** Models improve every few months (L156). An abstraction layer (L155) + evals (L343) means you ride the frontier instead of being stranded by it — the model is a parameter, not a dependency.
- **Model selection and cost are the same decision** (L150). The per-token price *is* the architecture's operating cost; selecting a model is selecting a cost structure. That's why the decision rule ends in a budget number, not a model name.

## 8. Common Mistakes

- **Picking the flagship for everything.** 10–50× the cost (L150) for tasks a small model does fine — the most common and most expensive mistake in AI architecture.
- **Choosing by benchmark or hype.** Leaderboards measure the average of everything; your task is specific. Eval on *your* data (L343), not the marketing.
- **Ignoring the constraint axes.** A great model with no tool support (L144) or a tiny context (L138) is disqualified regardless of quality.
- **Forgetting the abstraction.** Hardcoding a model name everywhere (L155) means every frontier move is a refactor — and a re-eval.
- **Not tiering the workload.** One model for all requests ignores that 90% of traffic is easy and 10% is hard (L157); tiered routing is the cost-lever (L150).
- **Assuming bigger = better at your task.** The small model in one family can beat the flagship of another on structured output or code. The eval decides, never the tier.

## 9. Best Practices

- **Write the selection rule down** (L157's decision rule): task region → quality bar → constraints → tier → eval. It's the architecture doc, not a formality.
- **Start small, measure, escalate only on evidence** — the small model first, evals (L343) against your golden set, flagship only when recall/precision demands it.
- **Tier the workload.** Route easy requests (extraction, short chat) to the small model and hard ones (reasoning, agents) to the flagship (L157).
- **Keep it behind an abstraction (L155)** — one interface, config-driven model choice, swap without a rewrite.
- **Pin the version.** Model names are moving targets (L156); pin what you deploy and re-eval on upgrade (L341).
- **Check feature support before quality.** Tools (L144), structured output (L143), vision (L146), context (L138) — a model that lacks the feature loses the argument immediately.

## 10. Interview Questions

**Q: How do you choose a model for a project?**
> A: I classify the task into a region (L140), set a quality bar, then check constraints — cost per token (L150), latency (L151), context window (L138), and tool/structured-output support (L143–L144). I start with the smallest plausible model, measure it against evals (L343), and escalate only when the numbers say I must. The choice is a justified trade-off, and it lives behind an abstraction (L155).

**Q: Why not always use the flagship model?**
> A: Because most traffic doesn't need it. A small model does extraction and classification at 10–50× lower cost (L150), and the mid tier handles most chat and RAG synthesis. The flagship earns its price on hard reasoning and agent loops. Routing by task tier (L157) is the cost lever — flagship-everything is a cost leak.

**Q: How do the frontier families differ?**
> A: OpenAI, Anthropic, and Google are the three you'll actually choose between (L156). The differences that matter are feature support — Google is multimodal-native (L146), OpenAI has the broadest API surface (L152), Anthropic has strong long-context and tooling (L153) — plus cost and quality per task. I pick by the axis my feature needs, not by general reputation.

**Q: What's your process when a new model comes out?**
> A: Re-eval, don't re-deploy. I run my golden eval set (L343) against the new model, compare cost and latency (L150–L151), and only switch if it clears the bar — and because the choice is behind an abstraction (L155), switching is a config change plus a re-eval, not a rewrite.

## 11. Follow-Up Questions

- What's the difference between "frontier" and "foundation" model?
- When is the mid tier better than both the small and the flagship?
- How do you set a quality bar you can actually measure (L343)?
- How does tiered routing work at the API layer (L157, L155)?
- What's the relationship between model selection and cost estimation (L150)?

## 12. Comparison Table — Tiering the Workload

| Task region (L140) | Tier | Why | Typical cost |
|---|---|---|---|
| Extraction / classification | small | clear right answer, temp 0 (L139, L143) | 10–50× cheaper (L150) |
| Chat / summarisation | mid | quality saturates; flagship edge is thin | mid |
| RAG synthesis (L174) | mid | grounded, retrieval does the heavy lifting | mid |
| Hard reasoning / planning | flagship | novel multi-step (L140) needs the depth | flagship |
| Agents (L200) | flagship | tool-heavy, compounding steps | flagship |
| Embeddings (L147) | dedicated | a separate model family, not a chat tier | cheap |

The senior read: **the table is a routing table** — most traffic to the cheap tiers, flagship reserved for the hard tail, and the whole thing measured by evals (L343) and governed by L157's rule.

## 13. Code Example — Selection Behind an Abstraction

```js
// Model selection as configuration, not code — the choice stays reversible (L155).
const MODELS = {
  extraction: { model: 'gpt-4o-mini', temperature: 0 },      // small + greedy
  chat:       { model: 'gpt-4o-mini', temperature: 0.8 },    // mid workhorse
  reasoning:  { model: 'gpt-4o',      temperature: 0.3 },    // flagship, reserved
};

// One call path, three tiers — the routing is a config choice.
async function run(tier, messages, schema) {
  const { model, temperature } = MODELS[tier];
  const res = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    ...(schema ? { response_format: { type: 'json_schema', json_schema: schema } } : {}),
  });
  return res.choices[0].message.content;
}

// The feature code never names a model — it names a tier.
await run('extraction', ticketMessages, ticketSchema);   // cheap path
await run('reasoning',  planMessages);                    // flagship path
```

```text
What the reader must SEE — selection is config, not code:

  MODELS = { extraction: small+greedy, chat: mid, reasoning: flagship }
  feature code calls run('extraction', …)   ← names a TIER
  swapping models = editing MODELS, not refactoring callsites

  And a swap always re-runs the evals (L343) — never silently.
```

```narrate
2-4: The selection lives in one config object — tiers, not model names scattered everywhere.
6-13: One call path; the tier decides the model, temperature, and schema.
15-18: Feature code names the tier; the model is a parameter behind the abstraction (L155).
```

> [!TIP]
> This is the shape L155 makes formal: **model = configuration, task = tier, swap = re-eval.** The abstraction is what lets you ride the frontier (L156) without rewriting the system every time a model improves.

## 14. Performance Notes

- **Tiering is the biggest cost lever in AI architecture** (L150). Routing 90% of traffic to the small model can cut the bill 5–20×.
- **Smaller models are faster too** (L151) — lower TTFT and higher tokens/sec — which makes the small tier a *latency* win, not just a cost win.
- **Latency and quality trade off at the tier level**: the flagship is slower *and* better; the senior move is to pay for the flagship only where the quality bar demands it (L151).
- **The model is the hot path.** Every token, every request, every tier — the selection determines the system's operating cost and feel. That's why it's the first architecture decision, and why it's config, not code (L155).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Cost growing with traffic | Flagship-everything, or no tiering (L150) | Route by tier (L157); small model first |
| Small model "not good enough" | No eval — a guess, not a measurement | Run the golden set (L343) before escalating |
| New model, worse results | Frontier moved; version not pinned (L156) | Pin the version; re-eval before upgrade |
| Model lacks a feature | Feature support not checked at selection | Check tools (L144) / structured output (L143) / vision (L146) first |
| Hard tasks fail on small tier | Task region needs the flagship (L140) | Escalate that *route*, not all routes |

## 16. Quick Revision Notes

- Model selection = **a decision procedure, not a preference**: classify → quality bar → constraints → start small → measure → escalate.
- The frontier families: **OpenAI, Anthropic, Google** (L156) — the brand matters less than tier-to-task fit.
- Tiers within a family: **flagship / mid / small** — a price-quality curve, 10–50× between ends (L150).
- **Start small, measure with evals (L343), escalate only on evidence.**
- **Tier the workload** (L157): cheap tiers for most traffic, flagship for the hard tail.
- Keep it **behind an abstraction (L155)** — the model is a parameter, not a dependency.

## 17. Cheat Sheet

```text
MODEL SELECTION = a decision procedure, not a preference

THE RULE (4 steps)
  1 classify the task region (L140)      dense? desert? borderline?
  2 set the quality bar                  cost of being wrong?
  3 check the constraints                cost · latency · context · features
  4 start small, measure, escalate       evals (L343), not opinions

THE FAMILIES (L156)
  OpenAI    broad API · embeddings · vision   (L152)
  Anthropic strong long-context · tooling     (L153)
  Google    multimodal-native                 (L154)

THE TIERS (within a family)
  flagship  hard reasoning, agents      $$$$
  mid       chat, RAG synthesis        $$
  small     extraction, classification $   (10-50x cheaper)

AXES THAT DIFFER
  quality · cost/token · latency · context · feature support

RULES
  tier the workload (L157) — flagship for the hard tail only
  eval on YOUR task, not benchmarks (L343)
  check features before quality (tools/structured/vision)
  abstraction + pinned versions → the frontier moves, you don't (L155)

INTERVIEW, 4 MOVES
  1 frame    "decision procedure, not preference"
  2 rule     "classify → bar → constraints → small → escalate"
  3 families "three frontier families, tier to task"
  4 hedge    "abstraction + evals → reversible"
```

## 18. Key Takeaways

> [!RECAP]
> - Model selection is **a decision procedure**: classify the task (L140) → set a quality bar → check constraints (cost, latency, context, features) → start small → measure → escalate
> - The frontier families are **OpenAI, Anthropic, Google** (L156); within each, **flagship / mid / small** is a price-quality curve, and the tiers are 10–50× apart in cost (L150)
> - **Start small and measure** — most tasks don't need the flagship, and the only way to know is evals (L343)
> - **Tier the workload** (L157): cheap tiers for most traffic, flagship reserved for the hard reasoning tail
> - Keep the choice **behind an abstraction (L155)** with pinned versions — the frontier moves, and your architecture shouldn't have to
> - The model is a **parameter, not a dependency** — and selecting it *is* selecting your cost structure (L150)

## Check your understanding

Answer these without looking back.

1. Run the model-selection rule on "extract entities from invoices".
2. Why is "start small, measure, escalate" the professional default?
3. Name the three frontier families and one differentiator each.
4. What are the four axes that separate models — and which one is "smartness"?
5. Why is tiering the workload a cost lever, not just a preference (L150)?
6. What does "the model is a parameter, not a dependency" mean?
7. When does the flagship actually earn its price?
8. How do you re-evaluate when a new model ships (L156, L341)?

## A Closing Note — The First Architecture Decision

Model selection is where everything before it — mechanism (L135), capability (L140), failure (L141), cost units (L137), context (L138) — becomes a *decision*. Hold the rule: **classify the task, set the bar, check the constraints, start small, escalate on evidence, keep it reversible.** That rule, applied, is what L157 will turn into the capstone decision procedure — and what separates an architect who picks models from one who *justifies* them.

Next: the numbers that make the decision real — token budgeting (L149), the cost model (L150), and the latency toolbox (L151).
