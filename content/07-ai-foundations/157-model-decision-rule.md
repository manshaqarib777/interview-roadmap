# Lesson 157 — Foundations Review: The Model Decision Rule

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of the module: a *repeatable rule* that turns every concept from L135–L156 into one procedure you can run on any model question, out loud, in an interview.

This is the last lesson of AI & LLM Foundations — and it is the one the module was built toward. L135–L156 gave you the mechanism, the failure surface, the economics, and the providers. This lesson **synthesises them into one decision rule**: given any task, budget, latency target, and reliability need, *classify → budget → select → verify*, and defend the choice. The rule is the interview — the milestone criterion is "can you run it without notes?"

The distinction this lesson is built on: a **syntax specialist** knows the vocabulary — temperature, tokens, RAG, tool calling — as separate facts. A **solutions architect** can run a *procedure*: take any request, produce a model, a provider, a token budget, and a cost — and explain the trade-offs. This lesson hands you the procedure.

## Learning Objectives

By the end of this lesson you should be able to:

- Run the four-phase decision rule on any task: classify → budget → select → verify
- Produce, in under two minutes: the task region (L140), the token budget (L149), the model + provider (L148, L156), and the cost (L150)
- Defend the choice: name the trade-offs (quality/cost/latency), the fallback (L168), and the eval that would change it (L343)
- Spot the common interview traps — and the specialist-vs-architect difference in any model question
- Claim Milestone M18: classify any model request and pick a model, provider, and budget without notes

## 1. One-Line Definition

**The model decision rule is a four-phase procedure — classify the task, budget the tokens, select the model and provider, verify with evals — that turns any AI request into a justified architecture choice, the way system design's four phases (L102) turn any prompt into an architecture.**

The one-sentence interview answer: *"My rule is classify → budget → select → verify. Classify the task into a region (L140): dense or desert, easy or hard. Budget the tokens: the request's ledger with the output reserve (L149). Select: the smallest tier that clears the quality bar (L148), the provider that wins the driving axis (L156), behind the abstraction (L155). Verify: the eval that would change my mind (L343), and the fallback (L168). Run it and I can justify any model choice in two minutes."*

## 2. Mental Model

Think of the rule as **the architect's checklist — the same role L102's four phases play for system design, but for model choice.** You don't answer "which model?" with an opinion; you run a procedure, the way you wouldn't answer "design a chat app" with a vibe.

```text
   the four phases (memorise the shape)
   ┌─────────────────────────────────────────────────────┐
   │ 1 · CLASSIFY  the task into a region (L140)         │
   │     dense (easy) or desert (hard)?  what's the      │
   │     cost of being wrong?                            │
   ├─────────────────────────────────────────────────────┤
   │ 2 · BUDGET    the tokens (L149)                     │
   │     system + history + docs + question + output     │
   │     reserve ≤ window; the number you'll pay (L150)  │
   ├─────────────────────────────────────────────────────┤
   │ 3 · SELECT    the tier (L148) and provider (L156)   │
   │     smallest tier that clears the bar; the provider │
   │     that wins the driving axis; behind L155         │
   ├─────────────────────────────────────────────────────┤
   │ 4 · VERIFY    the eval (L343) and fallback (L168)   │
   │     what would change my mind?  what if it fails?   │
   └─────────────────────────────────────────────────────┘
```

The mental model is a **procedure with four stops** — and the senior skill is that *any* model question routes through it: "which model for extraction?" → classify (dense, cheap) → budget (small output) → select (small tier, cheapest provider) → verify (eval set). Two minutes, out loud.

## 3. Visual Flow — The Rule Running on Three Tasks

```text
   TASK 1: "extract entities from invoices"
     1 classify → dense, extraction, cost-of-wrong = medium
     2 budget   → 2K input + 200 output reserve
     3 select   → SMALL tier, temp 0 (L139), structured output (L143),
                  cheapest provider that passes the eval (L156)
     4 verify   → 500-invoice golden set (L343); fallback: second provider (L168)

   TASK 2: "agent that plans and books travel"
     1 classify → desert, reasoning + tools, cost-of-wrong = HIGH
     2 budget   → growing per loop; cap per run (L149, L205)
     3 select   → FLAGSHIP tier (L148), the thinking specialist (L153),
                  tools (L144), HITL for bookings (L208)
     4 verify   → task-completion evals (L340); human gate (L324)

   TASK 3: "chat over our docs"
     1 classify → dense, RAG synthesis, cost-of-wrong = low
     2 budget   → retrieval-tight: 5 chunks, not 20 (L189)
     3 select   → MID tier (L148), the baseline provider (L152),
                  RAG pipeline (L174)
     4 verify   → groundedness evals (L337); citation checks (L192)

   Same four phases, three different answers — that's the rule.
```

The flow is the proof: **the procedure is constant, the outputs are task-shaped.** That's the difference between a checklist and an opinion.

## 4. How It Works — The Four Phases, Each One a Lesson

### Phase 1 · Classify (L140, L141)

Which region is this task in? Dense (language, extraction, summarisation) or desert (facts, arithmetic, novel reasoning)? What's the cost of being wrong — cosmetic or consequential? The region sets the quality bar; the cost of being wrong sets the verification budget (L343).

### Phase 2 · Budget (L137, L138, L149)

Count the request's tokens — system, history, docs, question — plus the output reserve, against the window (L138). The budget is the *number you'll pay* (L150): per request, per month, per user. Tight retrieval (L189) and summarised history (L166) are the levers before selection.

### Phase 3 · Select (L148, L156, L155)

The smallest tier that clears the quality bar (L148); the provider that wins the driving axis (L156); temperature by task (L139); structured output where a parser waits (L143); tools where the model must act (L144); all behind the abstraction (L155) so the choice stays reversible.

### Phase 4 · Verify (L343, L168)

The eval that would change the choice — your golden set, measured (L343). The fallback if the provider fails (L168, L169). And the re-eval cadence, because the frontier moves (L148, L341). **A selection without a verification plan is an opinion.**

> [!NOTE]
> **The rule's one-line core.** *Classify the task, budget the tokens, select the smallest tier and the right provider, and name the eval that would change it.* Say that sentence and you've said the module.

## 5. Real Project Usage

- **Every "which model?" conversation.** The rule replaces the opinion with a procedure: classify → budget → select → verify. It's how you answer in a meeting without hedging.
- **Every architecture review.** The rule is the model-selection section of the ADR (L361): task region, budget, tier, provider, eval. It's the documented "why this model" that survives the project.
- **Every new feature.** Before writing code, run the rule — it decides the tier, the provider, the caching (L171), and the cost line before the first request.
- **Every provider change (L156).** The frontier moves; the rule is the re-eval procedure: does the new model clear the same bar at a better price (L341)?
- **The interview.** "Design a system that summarises 100K documents" — the rule is the opening move: classify (dense), budget (150M input tokens, L149/L150), select (mid tier, cheapest provider), verify (faithfulness evals, L337). Two minutes, out loud.

The through-line: **the rule is the module's output** — the thing you carry from L135–L156 into every later module, the way L102's four phases carry through the system-design lessons.

## 6. Interview Explanation

Say it in four moves (this is the *meta* answer — the module in four sentences):

1. **The procedure.** "My model decision rule is classify → budget → select → verify — I run it on any model question."
2. **The first three.** "Classify the task into a region (L140), budget the tokens with the output reserve (L149), select the smallest tier that clears the bar and the provider that wins the driving axis (L148, L156)."
3. **The fourth.** "Verify — I name the eval that would change the choice (L343) and the fallback if it fails (L168). A selection without a verification plan is an opinion."
4. **The proof.** "Run it on anything: extraction → small tier, temp 0, structured output, cheapest provider. Agent → flagship, thinking specialist, tools, human gate. Chat → mid tier, baseline provider, tight retrieval. Same procedure, task-shaped answers."

## 7. Senior-Level Insights

- **The rule is the *interface* between the module and the interviews.** Every later module (RAG L174+, agents L198+, system design L347+) assumes you can run it — the RAG module's model choices, the agent module's tool selection, the system-design module's L102 spine all call this procedure.
- **The specialist knows the vocabulary; the architect runs the procedure.** "Temperature is a sampling parameter" (L139) is vocabulary. "For extraction: dense region, temp 0, small tier, structured output, cheapest provider that passes my eval" is the procedure. The interview tests the second.
- **The rule is *recursive* and *composable*.** It runs per request (chat), per feature (extraction), and per system (the whole stack). The same four phases at three scales — like the token budget (L149) at three scales.
- **The trade-offs are the *substance*.** The rule produces a choice; the senior answer explains what it *costs* — quality vs cost (L150), latency vs tier (L151), recall vs context (L138), lock-in vs abstraction (L155). A choice without its trade-offs is a guess with confidence.
- **Verification is what makes it architecture.** The eval (L343) and the fallback (L168) are what separate a *decision* from an *opinion* — the same discipline L141's failure surface demanded.

## 8. Common Mistakes

- **Answering "which model?" with a model name.** The interview wants the *procedure* — a name without classify/budget/select/verify is an opinion.
- **Skipping the budget (L149).** Selecting a model without counting the tokens it will process — the cost (L150) and the window (L138) are selection inputs, not afterthoughts.
- **Selecting the flagship by default (L148).** The rule starts *small*; the flagship is a verified escalation, not a default.
- **No verification plan (L343).** "This model is good" with no eval that could change it — the rule's fourth phase is the one that makes it a decision.
- **Ignoring the fallback (L168).** A single provider with no failover — the rule selects a *system*, not a favourite.
- **Forgetting the driving axis (L156).** Choosing a provider without naming what the feature needs most (cost, reasoning, modality) — the table decides per axis, never per brand.

## 9. Best Practices

- **Run the four phases out loud** — the interview is the rehearsal; practice on every feature you touch.
- **Write the rule's output as an ADR entry (L361)** — task region, budget, tier, provider, eval. It's the documented decision.
- **Start small, always (L148)** — the smallest tier that plausibly clears the bar; escalate only on eval evidence.
- **Name the trade-offs with the choice** — what it costs, and what would make you switch.
- **Pin the verification plan** — the eval (L343), the cadence (L341), and the fallback (L168).
- **Keep the abstraction (L155)** — the rule's decisions need a cheap exit door.

## 10. Interview Questions

**Q: What's your process for choosing a model?**
> A: Four phases. Classify the task into a region (L140) and set the quality bar. Budget the tokens — the request ledger plus the output reserve (L149). Select the smallest tier that clears the bar and the provider that wins the driving axis (L148, L156). Verify — the eval that would change my mind (L343) and the fallback (L168).

**Q: Run it on "a support chatbot over our docs."**
> A: Classify — dense, RAG synthesis, low cost-of-wrong. Budget — system prompt, summarised history (L166), 5 tight retrieved chunks (L189), output reserve. Select — mid tier, baseline provider (L152), RAG pipeline (L174). Verify — groundedness evals (L337), a faithfulness golden set, and a fallback provider. Two minutes.

**Q: What's the difference between knowing this module and being able to use it?**
> A: Knowing it is the vocabulary — temperature, tokens, RAG, tool calling. Using it is the procedure — classify → budget → select → verify, run on any request, with the trade-offs named. The interview tests the procedure; the module was built to hand you both.

**Q: When would you *not* use an LLM?**
> A: The rule's first phase covers it: if the task is a desert with a deterministic alternative — exact arithmetic (a calculator), current state (an API), a lookup (a database) — the LLM is the wrong tool (L140). The rule classifies first, and "not an LLM" is a valid output.

## 11. Follow-Up Questions

- How does the rule change for a RAG system (L174)?
- How does it change for an agent (L200)?
- How do you set the quality bar so it's measurable (L343)?
- How does the rule interact with the system-design spine (L102, L347)?
- What does "the trade-offs are the substance" mean?

## 12. Comparison Table — The Specialist vs the Architect

| | Syntax specialist | Solutions architect |
|---|---|---|
| Answers "which model?" with | a model name | the four-phase procedure |
| Knows | the vocabulary (L135–L156 facts) | the procedure + the trade-offs |
| Budgets | sometimes | always, before selecting (L149) |
| Verifies | trusts the demo | the eval that would change it (L343) |
| Handles provider failure | surprised | the fallback (L168) |
| The interview hears | facts | a decision, defended |

The senior read: **the table is the milestone** — M18's claim criterion is "can you run the procedure without notes?" The specialist stops at facts; the architect runs the rule.

## 13. Code Example — The Rule as a Function

```js
// The model decision rule, as code — classify → budget → select → verify.
// One function that produces the same output an architect gives in an interview.

function modelDecision(task, { goldenSet, windowSize = 128_000 } = {}) {
  // 1 · CLASSIFY (L140): region + cost-of-being-wrong → quality bar.
  const region = classify(task);            // 'dense' | 'reasoning' | 'multimodal' | …
  const qualityBar = region === 'reasoning' ? 'flagship' : 'small';  // L148

  // 2 · BUDGET (L149): the request ledger, with the output reserve (L138).
  const budget = {
    input: countTokens(task.system) + countTokens(task.docs) + countTokens(task.question),
    output: task.outputTokens ?? 300,       // ← the reserve, never forgotten
  };
  budget.total = budget.input + budget.output;

  // 3 · SELECT (L148, L156): smallest tier that clears the bar,
  //     provider that wins the driving axis, behind the abstraction (L155).
  const selection = {
    tier: qualityBar,
    provider: pickProvider(region, budget), // L156's table, applied
    temperature: region === 'dense' ? 0 : 0.3,   // L139
    schema: task.schema ?? null,                 // L143 where a parser waits
  };

  // 4 · VERIFY (L343, L168): the eval that would change it + the fallback.
  return {
    ...selection,
    fitsWindow: budget.total <= windowSize,
    evalToChange: `${task.name} golden set (${goldenSet?.length ?? 0} cases)`,
    fallback: alternateProvider(selection.provider),   // L168
    monthlyCost: estimateMonthly(budget, selection),   // L150
  };
}

// The same four phases, task-shaped outputs — the rule, not an opinion.
```

```text
What the reader must SEE — the procedure is the code:

  classify()   → region + quality bar (L140, L148)
  budget       → input + output reserve, ≤ window (L149, L138)
  selection    → tier + provider + temperature + schema (L148, L156, L139, L143)
  verify       → the eval, the fallback, the cost (L343, L168, L150)

  Four phases, four named lessons, one repeatable output.
```

```narrate
7-8: Phase 1 — the region sets the quality bar: reasoning tasks escalate to the flagship (L148).
11-15: Phase 2 — the ledger with the output reserve, checked against the window (L138, L149).
17-23: Phase 3 — tier, provider by driving axis (L156), temperature by task (L139), schema where needed (L143).
26-31: Phase 4 — the eval that would change it (L343), the fallback (L168), and the cost (L150).
```

> [!TIP]
> This function is the module in code — and it's exactly the shape of the ADR's model-selection section (L361). Run it on every feature; the interview is just the same run, out loud.

## 14. Performance Notes

- **The rule is the cost model's front door (L150).** Phase 2 produces the ledger, Phase 3 prices it — a decision made with the rule is a cost model already computed.
- **The rule is the latency budget's front door (L151).** Selecting the tier *is* selecting the TTFT and tokens/sec — the rule makes the latency trade explicit at selection time.
- **Verification is the cheapest insurance (L343).** A golden set (hundreds of cases) costs far less than a wrong flagship, a wrong provider, or a wrong budget at scale (L150).
- **The rule composes with every later module** — RAG's model choice, agents' tool selection, system design's L102 spine all call the same four phases. Learn it once, use it everywhere.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Cost higher than the estimate | Phase 2 skipped or output reserve forgotten (L149, L150) | Run the ledger; log usage (L332) |
| Quality "not good enough" | Phase 1 misclassified, or no eval (L140, L343) | Re-classify; run the golden set before escalating (L148) |
| Wrong provider for the task | Driving axis not named (L156) | Name the axis; re-run Phase 3 |
| Locked into a provider | No abstraction (L155) | Add the interface + adapters |
| "It worked in the demo" but not in prod | Phase 4 skipped — no verification (L343) | Build the eval set; pin the fallback (L168) |

## 16. Quick Revision Notes

- The rule: **classify → budget → select → verify** — four phases, four named lessons.
- **Classify** (L140): region + cost-of-being-wrong → quality bar.
- **Budget** (L149): input + output reserve ≤ window (L138); the number you'll pay (L150).
- **Select** (L148, L156): smallest tier that clears the bar; provider by driving axis; behind the abstraction (L155).
- **Verify** (L343, L168): the eval that would change it; the fallback; the re-eval cadence (L341).
- **Specialist vs architect**: vocabulary vs procedure — the milestone is running it without notes.

## 17. Cheat Sheet

```text
THE MODEL DECISION RULE (M18's milestone)

  1 CLASSIFY (L140)
     region: dense | reasoning | multimodal | desert
     cost-of-being-wrong → quality bar
     desert + deterministic alternative → DON'T use an LLM

  2 BUDGET (L149)
     input (system + history + docs + question)
     + output reserve (max_tokens)   ≤ window (L138)
     → the number you'll pay (L150)

  3 SELECT (L148, L156)
     tier:   smallest that clears the bar; escalate on eval (L148)
     provider: the one that wins the driving axis (L156)
     temperature by task (L139) · schema where a parser waits (L143)
     tools where the model must act (L144)
     behind the abstraction (L155)

  4 VERIFY (L343, L168)
     the eval that would change it (golden set)
     the fallback if it fails (L168)
     the re-eval cadence (L341)

INTERVIEW, 4 MOVES
  1 procedure "classify → budget → select → verify"
  2 first 3   "region, ledger, smallest tier + right provider"
  3 verify    "the eval that would change it + the fallback"
  4 proof     "run it on anything — same rule, task-shaped answers"
```

## 18. Key Takeaways

> [!RECAP]
> - The model decision rule is **classify → budget → select → verify** — the module's output, and M18's milestone
> - **Classify** the task into a region (L140) and set the quality bar by the cost of being wrong
> - **Budget** the tokens — input plus the output reserve (L149), against the window (L138), priced by the cost model (L150)
> - **Select** the smallest tier that clears the bar (L148) and the provider that wins the driving axis (L156), behind the abstraction (L155)
> - **Verify** — the eval that would change the choice (L343), the fallback (L168), and the re-eval cadence (L341). A selection without verification is an opinion
> - **The specialist knows the vocabulary; the architect runs the procedure** — and every later module (RAG, agents, system design) assumes you can

## Check your understanding

Answer these without looking back.

1. Name the four phases of the model decision rule.
2. Run the rule on "extract entities from invoices" — all four phases.
3. Run it on "an agent that books travel" — all four phases.
4. What does the cost-of-being-wrong set, and why?
5. Why is the output reserve a mandatory budget line (L149)?
6. What makes a selection a *decision* rather than an opinion (L343)?
7. When is "don't use an LLM" the rule's correct output (L140)?
8. What's the difference between the specialist and the architect in this lesson?

## A Closing Note — You Can Now Run the Module

That was the last lesson of AI & LLM Foundations — and the first one you'll *use* every day. L135–L156 gave you the mechanism, the failure surface, the economics, and the providers; this lesson gave you the **procedure** that holds them together. When you can run *classify → budget → select → verify* on any request, out loud, without notes — naming the region, the ledger, the tier, the provider, the eval, and the fallback — you have claimed Milestone M18, and you have the foundation every later module builds on.

The next module turns the rule into *product*: AI Application Engineering (L158–L173) — architecture, the Vercel AI SDK, streaming UIs, tool-calling apps, error handling, and the production patterns that take a model choice and make it a shipped system. You've built the decision; now you'll build the thing it decided on.
