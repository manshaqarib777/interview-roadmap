# Lesson 203 — Reasoning Patterns

**Interview importance:** ⭐⭐⭐⭐ — "what reasoning techniques do agents use?" — the answer is the *scaffolds*: chain of thought, reflection, self-correction — and where each earns its tokens (L149, L150).**

L202 gave you planning; this lesson is the **thinking itself**: reasoning patterns — the scaffolds that make the model's decisions better. **Chain of thought** — reason step by step before answering (L203). **Reflection** — the model critiques its own output (L203). **Self-correction** — the model revises after the critique (L211). Each is a tool with a cost (L149) and a quality payoff (L195) — and the senior skill is knowing when each earns its tokens (L150).

The distinction this lesson is built on: a **demo** asks the model to "think carefully" and hopes. A **solutions architect** designs the reasoning: CoT for multi-step problems (L203), reflection for answer review (L203), self-correction for iterative improvement (L211) — each budgeted (L149), each measured on the golden set (L343), and each placed in the loop where it pays (L202).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain chain of thought: step-by-step reasoning before the answer (L203)
- Explain reflection: the model critiques its own output (L203)
- Explain self-correction: revise after the critique (L211)
- Choose the pattern by task and measure the gain (L343)
- Explain the cost: reasoning tokens and latency (L149, L150)

## 1. One-Line Definition

**Reasoning patterns are the thinking scaffolds of the agent — chain of thought (step-by-step reasoning before the answer, L203), reflection (the model critiques its own output, L203), and self-correction (revising after the critique, L211) — each a tool with a token cost (L149) and a quality payoff, chosen by task and measured on the golden set (L343).**

The one-sentence interview answer: *"Reasoning patterns are the scaffolds that make decisions better (L203). Three. Chain of thought — the model reasons step by step before answering; it fixes multi-step problems where the jump to the answer skips a step (L203). Reflection — the model critiques its own draft: 'is this grounded? did I miss anything?' (L203). Self-correction — the model revises after the critique, iterating until the draft passes its own check (L211). Each costs tokens and latency (L149, L150): CoT spends reasoning tokens per answer, reflection and correction spend a review pass. So the choice is by task — multi-step math/code → CoT; high-stakes drafts → reflection; iterative tasks → self-correction — and the gain is measured on the golden set (L343). Reasoning is a budgeted tool, not a vibe (L149)."*

## 2. Mental Model

Think of the three patterns as **a student's study habits.** Chain of thought is showing your work: the student writes each step of the algebra instead of jumping to the answer — the steps catch the mistakes (L203). Reflection is checking your work: the student re-reads the solution, asking "does this answer the question? is this right?" (L203). Self-correction is the fix: the student finds the error in step two and redoes it (L211). Each habit helps; the right one depends on the exam — and each takes time (the cost, L149).

```text
   CHAIN OF THOUGHT (L203)       REFLECTION (L203)          SELF-CORRECTION (L211)
   ┌────────────────────┐        ┌────────────────────┐     ┌────────────────────┐
   │ step 1 → step 2    │        │ draft → critique:  │     │ critique → revise: │
   │ → step 3 → answer  │        │ "is it grounded?   │     │ find the error,    │
   │ (show the work)    │        │  complete?"        │     │ redo it (L211)     │
   └────────────────────┘        └────────────────────┘     └────────────────────┘
```

The mental model is **study habits**: show the work, check the work, fix the work — each a tool with a time cost (L149).

## 3. Visual Flow — The Three Patterns in the Loop

```text
   CHAIN OF THOUGHT (L203)        REFLECTION + SELF-CORRECTION (L203, L211)
   ┌──────────────────────┐       ┌──────────────────────────────────────┐
   │ question             │       │ 1 · draft — the first answer (L145)  │
   │      ▼               │       │      ▼                               │
   │ reason step by step  │       │ 2 · REFLECT — critique the draft:    │
   │ (the model shows     │       │    grounded? complete? correct?      │
   │  its work, L203)     │       │    (L203)                            │
   │      ▼               │       │      ▼                               │
   │ answer               │       │ 3 · passes? → done                   │
   └──────────────────────┘       │    fails? → SELF-CORRECT — revise,   │
                                  │    reflect again (bounded, L211)     │
                                  └──────────────────────────────────────┘
```

The flow is the three scaffolds: **CoT shows the work before the answer; reflection checks the draft; self-correction fixes it — bounded by the correction budget (L211).**

## 4. How It Works — The Three Patterns

- **Chain of thought (L203).** The model reasons step by step before answering — the intermediate steps make multi-step problems tractable (math, code, logic) because each step is checked against the last (L203). The cost: reasoning tokens per answer (L149). The trade: better accuracy on multi-step tasks, no gain on simple ones (L343).
- **Reflection (L203).** The model critiques its own draft — "does this answer the question? is it grounded (L337)? did I miss anything?" — producing a critique, not a new answer (L203). The cost: a review pass (L150). The payoff: catching errors in high-stakes drafts (L195).
- **Self-correction (L211).** The model revises after the critique — find the error, redo the step, reflect again — until the draft passes, bounded by a correction budget (L211). The cost: iterative passes (L150). The payoff: iterative improvement — and the risk: the "correction" can make things worse (L211), which is why the budget and the eval (L343) exist.

> [!NOTE]
> **Self-correction needs a guardrail: it can make things worse (L211).** A model that revises can revise *away* from a good answer — the correction loop is not monotonic (L211). The senior design bounds it: a max number of corrections (L211), a quality check that stops the loop when the draft passes (L203), and the golden set (L343) to verify that correction *helps* the task — for some tasks, "draft and ship" beats "draft, critique, revise" (L195). Correction is a tool with a failure mode, not a default (L211).

## 5. Real Project Usage

- **Math and code agents (CoT).** "Solve this" with step-by-step reasoning — each step checked (L203); the code agent reasons before editing (L354).
- **High-stakes drafts (reflection).** Legal or customer-facing text — the draft is critiqued for completeness and tone before shipping (L203).
- **Iterative research (self-correction).** The draft answer is checked against the sources (L337) and revised until grounded (L211).
- **RAG answers (reflection).** The answer is reflected against the retrieved chunks — groundedness checked before the user sees it (L337).
- **Anything multi-step (L202).** CoT inside the agent's decide box — the reasoning (L203) feeds the planning (L202).

The through-line: **reasoning is a budgeted quality tool** — each pattern earns its tokens on the tasks it fits (L149, L150), and the golden set (L343) confirms the fit.

## 6. Interview Explanation

Say it in four moves:

1. **The three patterns.** "CoT — reason step by step (L203). Reflection — critique the draft (L203). Self-correction — revise after the critique, bounded (L211)."
2. **The cost.** "Each is reasoning tokens and latency (L149, L150) — a budget line, not a default."
3. **The choice.** "Multi-step problems → CoT. High-stakes drafts → reflection. Iterative tasks → self-correction (L203)."
4. **The measure.** "The golden set (L343) confirms the pattern earns its tokens — and that correction actually helps (L195)."

## 7. Senior-Level Insights

- **Reasoning is a budgeted tool (L149, L150).** The senior answer costs the patterns — CoT's per-answer reasoning, reflection's review pass, correction's iterations — and applies them where the quality gain (L343) beats the spend (L150).
- **CoT's mechanism is error checking (L203).** Step-by-step reasoning catches the error in the step, not the answer — that's why it helps multi-step tasks and not simple ones (L343).
- **Reflection is a second opinion, not a rewrite (L203).** The critique is the deliverable — a separate pass that reviews the draft (L203); the revision is self-correction's job (L211). The senior design separates the two.
- **Correction's failure mode is over-revision (L211).** The model can revise away from good (L211) — the senior design bounds the iterations (L211), stops on "passes the check" (L203), and measures on the golden set (L343).
- **The patterns compose with the loop (L216).** CoT feeds the decide box (L202), reflection checks the answer against the context (L337), self-correction is the loop's internal feedback (L211) — all three live in the L200 diagram (L216).

## 8. Common Mistakes

- **"Think carefully" with no mechanism (L203).** An instruction without the scaffold — CoT needs the model to actually emit the steps (L202).
- **CoT everywhere (L150).** Reasoning tokens on simple tasks — the spend (L149) with no gain (L343).
- **Reflection without acting (L203).** A critique that never leads to revision — the review pass wasted (L211).
- **Unbounded self-correction (L211).** Revision until the budget dies — the over-revision failure (L211); correction can make things worse.
- **No measurement (L343).** The pattern added, the gain unmeasured (L341) — reasoning is a budgeted tool, not a vibe (L149).
- **Correction as a default (L211).** Draft-and-ship beats draft-critique-revise for many tasks (L195) — the golden set decides (L343).

## 9. Best Practices

- **Apply CoT to multi-step problems** (L203) — math, code, logic — where steps can be checked (L202).
- **Use reflection for high-stakes drafts** (L203) — the critique is the deliverable (L337).
- **Bound self-correction** (L211) — max iterations, stop on pass, and measure whether it helps (L343).
- **Budget the reasoning** (L149) — the patterns are cost lines (L150).
- **Measure on the golden set** (L343) — pattern on/off, per task type (L341).

## 10. Interview Questions

**Q: What reasoning patterns do agents use?**
> A: Three scaffolds (L203). Chain of thought — the model reasons step by step before answering; it catches errors in the steps, so multi-step problems improve (L203). Reflection — the model critiques its own draft: grounded (L337)? complete? correct? (L203). Self-correction — the model revises after the critique, bounded by a correction budget (L211). Each costs tokens and latency (L149, L150) — so they're applied by task and measured (L343).

**Q: When does chain of thought help?**
> A: Multi-step problems where the jump to the answer skips a step (L203) — math, code, logic, multi-hop reasoning. The mechanism is error checking: the model's intermediate steps are checked against each other (L202). For simple tasks, CoT's reasoning tokens (L149) buy nothing (L343). The golden set shows the per-task-type gain (L341).

**Q: What's the difference between reflection and self-correction?**
> A: The deliverable (L203). Reflection produces a critique — a second opinion on the draft: grounded (L337)? complete? It doesn't rewrite (L203). Self-correction produces a revision — it finds the error the critique named and redoes the work (L211). The sequence is draft → reflect → correct → reflect again, bounded (L211). And the correction budget exists because revision can make things worse (L211).

**Q: Why is self-correction risky?**
> A: It's not monotonic (L211). A model that revises can revise *away* from a good answer — each pass is a new generation, not an improvement guarantee. So the senior design bounds the iterations (L211), stops when the draft passes the reflection check (L203), and verifies on the golden set that correction actually helps the task (L343). For many tasks, draft-and-ship beats the correction loop (L195).

## 11. Follow-Up Questions

- How does CoT fit in the decide box (L202)?
- How does reflection check groundedness (L337)?
- What bounds the correction loop (L211)?
- How do you measure a reasoning pattern's gain (L343)?
- When does correction make things worse (L211)?

## 12. Comparison Table — The Three Patterns

| | CoT (L203) | Reflection (L203) | Self-correction (L211) |
|---|---|---|---|
| Does | reasons step by step | critiques the draft | revises after the critique |
| Deliverable | the worked steps | the critique | the revision |
| Cost (L149) | reasoning tokens | a review pass | iterations |
| Best for | multi-step problems | high-stakes drafts | iterative tasks |
| Risk (L211) | token spend | critique ignored | over-revision |

The senior read: **the columns are the task fits** — each pattern is applied where its deliverable matches the task (L343).

## 13. Code Example — The Scaffolds

```js
// Reasoning patterns: CoT, reflection, bounded self-correction (L203, L211).
// CHAIN OF THOUGHT — the model shows its work (L203).
async function solveWithCot(task) {
  return chat({
    messages: [{ role: 'user', content: task }],
    reasoning: 'step by step',                   // emit the steps (L202)
  });
}

// REFLECTION — a critique, not a rewrite (L203).
async function reflect(draft, context) {
  return chat({
    messages: [
      { role: 'user', content: `Critique this answer. Is it grounded in the context (L337)? Complete? Correct?\nContext: ${context}\nAnswer: ${draft}` },
    ],
  });
}

// SELF-CORRECTION — bounded, stops on pass (L211, L203).
async function draftReflectCorrect(task, context, maxCorrections = 2) {
  let draft = await chat({ messages: [{ role: 'user', content: task }] });
  for (let i = 0; i < maxCorrections; i++) {
    const critique = await reflect(draft, context);       // L203
    if (critique.passes) return draft;                    // stop on pass (L203)
    draft = await chat({                                   // revise (L211)
      messages: [{ role: 'user', content: `Revise this draft per the critique:\nDraft: ${draft}\nCritique: ${critique}` }],
    });
  }
  return draft;                                            // the budget (L211)
}
```

```text
What the reader must SEE — the three scaffolds:

  reasoning: 'step by step'   → CoT — show the work (L203)
  reflect()                   → a critique, not a rewrite (L203)
  maxCorrections + passes     → the bounded correction loop (L211)

  Each pattern is a budgeted tool — measured on the golden set (L343).
```

```narrate
4-8: CoT — the model is asked to emit the intermediate steps; the steps catch the errors (L203, L202).
10-17: Reflection — the critique pass checks the draft against the context (groundedness, L337) and completeness (L203).
19-26: Self-correction — the bounded loop: reflect, revise on failure, stop on pass (L211, L203).
27: The correction budget — bounded, because revision can make things worse (L211).
```

> [!TIP]
> The line that prevents the over-revision failure: **`if (critique.passes) return draft`** — the loop stops when the check passes. **Correction is bounded and gated — never a blind default (L211).**

## 14. Performance Notes

- **Reasoning is the token lever (L149, L150).** CoT's steps, the review pass, the iterations — each is a cost line (L150); the budgets (L149) are the controls.
- **Latency compounds (L151).** Reflection and correction are extra calls on the path (L145) — parallelize where independent (L222), cache (L171), and watch TTFT (L333).
- **The eval measures the gain (L343).** Pattern on/off on the golden set (L341) — the reasoning's cost is justified by its quality delta (L195).
- **The trace records the reasoning (L213).** The steps (L203) and the critiques (L211) are trace data (L213) — observability and evaluation read the same record (L343).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Wrong answers on multi-step | No CoT (L203) | Add step-by-step reasoning (L202) |
| Drafts ship unreviewed | No reflection (L203) | Add the critique pass (L337) |
| Quality degrades after "fixing" | Over-correction (L211) | Bound the iterations; measure (L343) |
| Cost climbing | Reasoning everywhere (L150) | Apply per task; budget (L149) |
| No visible reasoning | Steps not in the trace (L213) | Log the reasoning (L213) |

## 16. Quick Revision Notes

- Reasoning patterns = **the thinking scaffolds** (L203).
- **CoT** — step-by-step reasoning, multi-step problems (L203).
- **Reflection** — a critique, not a rewrite (L203).
- **Self-correction** — bounded revision, stops on pass (L211).
- The cost: **reasoning tokens and passes** (L149, L150).
- The measure: **golden set, pattern on/off** (L343, L341).

## 17. Cheat Sheet

```text
REASONING PATTERNS = the thinking scaffolds of the agent

THE THREE (L203, L211)
  chain of thought    reason step by step before answering (L203)
                      catches errors in the STEPS — multi-step tasks
  reflection          critique the draft (L203)
                      grounded? (L337) complete? correct?
                      a second opinion, not a rewrite
  self-correction     revise after the critique (L211)
                      bounded — max iterations, stop on pass (L203)

THE COST (L149, L150)
  CoT = reasoning tokens · reflection = a review pass
  correction = iterations — each a budget line (L149)

THE RULE
  multi-step → CoT (L203) · high-stakes → reflection (L203)
  iterative → self-correction (L211) — measured on the golden set (L343)

THE RISK (L211)
  correction is NOT monotonic — it can make things worse
  bound it, stop on pass, verify it helps (L343)

INTERVIEW, 4 MOVES
  1 patterns "CoT, reflection, self-correction"
  2 cost     "reasoning tokens and passes (L149)"
  3 choice   "by task — and measured (L343)"
  4 risk     "correction is bounded, not default (L211)"
```

## 18. Key Takeaways

> [!RECAP]
> - Reasoning patterns are **the thinking scaffolds** (L203): chain of thought, reflection, and self-correction
> - **CoT** reasons step by step and catches errors in the steps (L203) — the tool for multi-step problems; **reflection** produces a critique (L203); **self-correction** revises after the critique (L211)
> - **Each pattern costs tokens and latency** (L149, L150) — a budget line, applied by task, never a default
> - **Self-correction is not monotonic** (L211) — it can revise away from good, so it's bounded (max iterations), gated (stop on pass, L203), and verified on the golden set (L343)
> - The **golden set measures the gain** (L343) — pattern on/off per task type (L341)
> - The reasoning is **trace data** (L213) — the steps and critiques feed observability and evaluation (L343)

## Check your understanding

Answer these without looking back.

1. Name the three reasoning patterns (L203).
2. How does CoT catch errors (L203)?
3. What's the difference between reflection and self-correction (L211)?
4. Why is correction not monotonic (L211)?
5. What does each pattern cost (L149)?
6. How do you choose the pattern (L343)?
7. How do you bound the correction loop (L211)?
8. Why is the reasoning trace data (L213)?

## A Closing Note — The Thinking, Made Deliberate

You now hold the scaffolds: **CoT's shown work, reflection's second opinion, and the bounded correction loop.** The agent no longer "thinks carefully" — it reasons with a pattern, pays for it with a budget, and proves it on the golden set.

Next: which hands to offer the model — tool selection & routing (L204), keeping the tool list small and the calls precise.
