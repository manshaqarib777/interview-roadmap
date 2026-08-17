# Lesson 365 — Model Selection at Scale

**Interview importance:** ⭐⭐⭐⭐⭐ — "routing, fine-tuning, and the tiered model strategy for enterprise" — the answer is *the model strategy*: the tiers, the routing, and the fine-tuning (L365).**

L148 built the model selection (L148) and L364 the vendors; this lesson is **the strategy at the scale**: the model selection at scale — the routing, the fine-tuning, and the tiered model strategy for the enterprise (L365): the tiers (the small, the mid, the frontier, L365), the routing (the tier per request, L155), and the fine-tuning (the custom, L365). The AI shape (L173): the enterprise (L380) — the models (L148) tiered (L365), routed (L155), and fine-tuned (L365). This lesson is the model's strategy (L365).

The distinction this lesson is built on: a **junior** uses one model. A **solutions architect** tiers the models (L365): the small (L157), the mid, the frontier (L148) — the routing (L155) and the fine-tuning (L365) — because the scale (L358) is the model's (L365) economics (L334).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tiers: the small, the mid, the frontier (L365)
- Explain the routing: the tier per request (L155)
- Explain the fine-tuning: the custom model (L365)
- Explain the economics: the cost and the quality (L334)
- Explain the AI shape: the tiered strategy (L365)

## 1. One-Line Definition

**The model selection at scale is the routing, the fine-tuning, and the tiered model strategy for the enterprise (L365) — the tiers (the small L157: the cheap and the fast L151; the mid: the balance; the frontier L148: the best and the costly L150, L365), the routing (the tier per request: the simple L365 to the small L157, the hard L365 to the frontier L148, L155), and the fine-tuning (the custom L365: the domain L365, the format L365, L365) — the scale's (L358) model economics (L334).**

The one-sentence interview answer: *"The model strategy at the scale is the tiers, the routing, and the fine-tuning (L365). The tiers (L365): the small (L157) — the cheap (L150) and the fast (L151): the classification (L353), the extraction (L143); the mid (L365) — the balance: the summarization (L166); and the frontier (L148) — the best (L341) and the costly (L150): the complex reasoning (L203). The routing (L155): the tier per request (L365) — the simple (L365) to the small (L157), the hard (L365) to the frontier (L148) — the classifier (L353) routing (L155) — the cost (L334) and the latency (L333) balanced (L365). The fine-tuning (L365): the custom (L365) — the domain (L365): the legal (L371), the medical (L371) — the format (L365): the structured (L143) — the fine-tuned (L365) model (L148) for the high-volume (L358) specific (L365) task (L365). The economics (L334): the tokens (L332) per tier (L365) — the L334 attribution (L334) — the tier's (L365) cost vs the quality (L341). The AI shape (L173): the enterprise (L380) — the models (L148) tiered (L365), routed (L155), and fine-tuned (L365) — the scale's (L358) strategy (L365)."*

## 2. Mental Model

Think of the model strategy as **the law firm's partner tiers.** The firm (the enterprise, L380) has the tiers (L365): the associates (the small, L157) — the cheap (L150) and the fast (L151): the filings (the classification, L353); the partners (the mid, L365) — the balance: the briefs (the summarization, L166); and the senior partners (the frontier, L148) — the best (L341) and the costly (L150): the trials (the reasoning, L203). The intake (the routing, L155): the case's (the request's, L365) complexity (L365) → the tier (L155). And the specialists (the fine-tuning, L365): the domain experts (L365) — the tax (L371), the patent (L371) — hired (the fine-tuned, L365) for the firm's (L358) high-volume (L358) niche (L365). The firm works because the tiers match the cases, the intake routes, and the specialists handle the niches (L365).

```text
   the firm (the strategy, L365)
   ┌────────────────────────────────────────────────────────┐
   │ the tiers (L365) — the associates (L157), the partners │
   │ (L365), the seniors (L148)                             │
   │ the intake (the routing, L155) — the complexity → the  │
   │ tier (L365)                                            │
   │ the specialists (the fine-tuning, L365) — the niches   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the firm**: the tiers, the intake, and the specialists (L365).

## 3. Visual Flow — One Request Through the Tiers

```text
   the request (L365)
        │
        ▼
   ┌────────────────────── THE ROUTER (L155) ───────────────────────────┐
   │  the classifier (L353): the complexity (L365)                     │
   │  the simple (L365) → the small (L157)                             │
   │  the mid (L365) → the mid (L365)                                  │
   │  the hard (L365) → the frontier (L148)                            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE TIER (L365) ─────────────────────────────┐
   │  the small (L157): the cheap, the fast (L151)                     │
   │  the mid (L365): the balance (L365)                               │
   │  the frontier (L148): the best, the costly (L150)                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE FINE-TUNED (L365) ───────────────────────┐
   │  the niche (L365): the legal (L371), the format (L143)            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the strategy: **route → tier → fine-tuned** (L365).

## 4. How It Works — The Strategy, Part by Part

- **The tiers (L365).** The small (L157), the mid (L365), the frontier (L148) — the cost (L150) and the quality (L341) ladder (L365).
- **The routing (L155).** The tier per request (L365): the classifier (L353) — the complexity (L365) — the tier (L155).
- **The fine-tuning (L365).** The custom (L365): the domain (L371), the format (L143) — the high-volume (L358) niche (L365).
- **The economics (L334).** The tokens (L332) per tier (L365) — the L334 attribution (L334) — the tier's (L365) cost vs the quality (L341).

> [!NOTE]
> **The routing is the strategy's cost lever (L365).** The senior answer routes (L155): the tier per request (L365) — the simple (L365) to the small (L157) — the 80% (L365) of the requests (L358) on the cheap (L150); the hard (L365) to the frontier (L148) — the 20% (L365) on the costly (L150). The routing (L155) — the classifier (L353) with the fallback (L365): the uncertain (L139) → the next tier (L365) — the cost (L334) and the quality (L341) balanced (L365).

## 5. Real Project Usage

- **A support copilot (L350).** The tiered (L365): the triage (L350) on the small (L157), the resolution (L350) on the mid (L365).
- **A document processor (L353).** The extraction (L143) on the fine-tuned (L365) — the high-volume (L358) invoices (L353).
- **A chat product (L348).** The routing (L155): the simple (L365) chats on the small (L157), the complex (L365) on the frontier (L148).
- **A legal or medical copilot (L371).** The fine-tuned (L365) — the domain (L371) — with the compliance (L371).
- **Anything enterprise (L380).** The strategy (L365) — the tiers, the routing, the fine-tuning (L365).

The through-line: **the strategy is the model's** — the tiers, the routing, and the fine-tuning (L365).

## 6. Interview Explanation

Say it in four moves:

1. **The tiers.** "The small (L157), the mid (L365), the frontier (L148)."
2. **The routing.** "The tier per request — the classifier (L353), the fallback (L365)."
3. **The fine-tuning.** "The custom — the domain (L371), the format (L143)."
4. **The economics.** "The tokens (L332) per tier (L365) — the cost vs the quality (L341)."

## 7. Senior-Level Insights

- **The 80/20 is the routing's (L365).** The 80% (L365) of the requests (L358) on the small (L157) — the 20% (L365) on the frontier (L148) — the cost (L334) shaped (L365).
- **The fallback is the quality's (L365).** The uncertain (L139) routing (L155) — the next tier (L365) — the quality (L341) preserved (L365).
- **The fine-tuning is the niche's (L365).** The high-volume (L358) specific (L365) task (L365) — the legal (L371), the format (L143) — the fine-tuned (L365) model (L148).
- **The drift is the strategy's watch (L335).** The model (L148) updates (L335) — the tiers (L365) re-evaluated (L341) — the L335 watch (L335), strategy-shaped (L365).
- **The eval is the tier's (L341).** The golden set (L342) per tier (L365) — the L341 suite (L341) gating (L365).

## 8. Common Mistakes

- **The one model (L365).** The frontier (L148) for everything (L365) — the cost (L334) — the tiers (L365) are the economics (L334).
- **The rule-based routing (L155).** The static rules (L155) — the classifier (L353) and the fallback (L365) — the dynamic (L155).
- **The fine-tune-everything (L365).** The fine-tuning (L365) for the commodity (L363) — the domain (L371) niche (L365) only (L365).
- **The tier un-evaluated (L341).** The tier (L365) without the golden set (L342) — the quality (L341) unknown (L365).
- **The drift un-watched (L335).** The model (L148) update (L335) — the tiers (L365) un-re-evaluated (L365).

## 9. Best Practices

- **Tier the models** (L365) — the small (L157), the mid (L365), the frontier (L148).
- **Route by the complexity** (L155) — the classifier (L353), the fallback (L365).
- **Fine-tune the niche** (L365) — the high-volume (L358) domain (L371).
- **Eval per tier** (L341) — the golden set (L342) gating (L365).
- **Watch the drift** (L335) — the re-evaluation (L341) on the update (L365).

## 10. Interview Questions

**Q: Walk me through the model selection at scale.**
> A: The strategy (L365). The tiers — the small (L157), the mid (L365), the frontier (L148). The routing — the tier per request (L155). The fine-tuning — the custom for the niche (L365). And the economics — the tokens (L332) per tier (L365).

**Q: How do you route?**
> A: The classifier (L353): the request's (L365) complexity (L365) → the tier (L155) — the simple (L365) to the small (L157), the hard (L365) to the frontier (L148). The fallback (L365): the uncertain (L139) routing (L155) → the next tier (L365) — the quality (L341) preserved (L365).

**Q: When do you fine-tune?**
> A: The niche (L365): the high-volume (L358) specific (L365) task (L365) — the legal (L371) or the medical (L371) domain (L365), the structured format (L143) — the fine-tuned (L365) model (L148) — the quality (L341) and the cost (L334) improved (L365). The commodity (L363) — the general chat (L348) — stays on the API (L278).

**Q: What's the economics?**
> A: The tier's (L365) cost vs the quality (L341): the tokens (L332) per tier (L365) — the 80/20 (L365): the 80% (L365) on the small (L157), the 20% (L365) on the frontier (L148) — the cost (L334) shaped (L365). The L334 attribution (L334) per tier (L365) — the budget (L368) informed (L365).

## 11. Follow-Up Questions

- What are the tiers (L365)?
- How do you route (L155)?
- When do you fine-tune (L365)?
- What's the economics (L334)?
- What's the drift watch (L335)?

## 12. Comparison Table — The Tiers

| Tier (L365) | The use (L365) | The cost (L150) | The latency (L333) |
|---|---|---|---|
| The small (L157) | the classify (L353), the extract (L143) | the lowest (L150) | the fastest (L151) |
| The mid (L365) | the summarize (L166) | the mid (L365) | the mid (L365) |
| The frontier (L148) | the reasoning (L203) | the highest (L150) | the slowest (L333) |

The senior read: **the tier matches the task** — the ladder (L365).

## 13. Code Example — The Strategy, Applied

```js
// The model strategy (L365) — the tiers, the routing, the fine-tuning (L365).
// 1 · THE TIERS (L365) — the ladder (L365).
const tiers = {
  small:    'titan-text-lite',        // the cheap and the fast (L157, L151)
  mid:      'claude-3-5-haiku',       // the balance (L365)
  frontier: 'claude-3-5-sonnet',      // the best and the costly (L148, L150)
  niche:    'fine-tuned-legal',       // the custom (L365, L371)
};

// 2 · THE ROUTER (L155) — the complexity (L365).
async function route(request) {
  const complexity = await classify(request);      // the classifier (L353)
  if (complexity === 'simple') return tiers.small; // L157
  if (complexity === 'mid')    return tiers.mid;   // L365
  if (complexity === 'hard')   return tiers.frontier;  // L148
  // the fallback (L365): the uncertain (L139) → the next tier (L365)
  return tiers.frontier;
}

// 3 · THE FINE-TUNED (L365) — the niche (L365).
if (request.domain === 'legal') return tiers.niche;   // L371, L365

// 4 · THE ECONOMICS (L334) — the tokens (L332) per tier (L365).
await metering.write({ tier, tokens: usage });        // L332, L334

// 5 · THE EVAL (L341) — the golden set (L342) per tier (L365).
//   the L341 suite (L341) gating the tiers (L365)
```

```text
What the reader must SEE — the strategy, applied:

  the four tiers             → the ladder (L365)
  classify → the tier        → the routing (L155, L353)
  the uncertain → the frontier → the fallback (L365)
  the legal → the fine-tuned → the niche (L365, L371)
  metering per tier          → the economics (L332, L334)

  The tiers, the routing, the fine-tuning (L365).
```

```narrate
4-9: The tiers — the ladder from the small to the fine-tuned (L365).
11-19: The router — the complexity classified and the tier chosen (L155, L353).
21-22: The fallback — the uncertain routed to the next tier (L365).
24-25: The niche — the legal domain to the fine-tuned (L371, L365).
27-28: The economics — the tokens metered per tier (L332, L334).
30: The eval — the golden set gating the tiers (L341, L342).
```

> [!TIP]
> The pair that defines the strategy: **the complexity router** (the tier per request, L155) and **the per-tier metering** (the economics, L334). **Tier the models, route by the complexity, fine-tune the niche, eval per tier — the scale's model strategy (L365).**

## 14. Performance Notes

- **The small tier is the latency (L157).** The fast (L151) — the classify (L353) and the extract (L143) (L365).
- **The routing is the cost (L334).** The 80/20 (L365) — the tokens (L332) shaped (L365).
- **The fine-tuned is the niche's (L365).** The high-volume (L358) — the tokens (L332) reduced (L365).
- **The drift is the watch's (L335).** The updates (L335) — the re-eval (L341) on the schedule (L221).

## 15. Debugging Scenarios

| Symptom | First check (L365) | The lever |
|---|---|---|
| The cost explodes | The routing (L155) | The 80/20 (L365) |
| The quality dips | The fallback (L365) | The uncertain (L139) → the frontier (L148) |
| The niche is slow | The fine-tuning (L365) | The custom model (L365) |
| The tier regresses | The evals (L341) | The golden set (L342) |
| The model updated | The drift (L335) | The re-eval (L341) |

## 16. Quick Revision Notes

- The model selection at scale = **the model's strategy** (L365): the tiers, the routing, the fine-tuning.
- The tiers: **the small (L157), the mid (L365), the frontier (L148)**.
- The routing: **the tier per request (L155) — the classifier (L353), the fallback (L365)**.
- The fine-tuning: **the custom — the domain (L371), the format (L143)**.
- The economics: **the tokens (L332) per tier (L365) — the cost vs the quality (L341)**.

## 17. Cheat Sheet

```text
MODEL SELECTION AT SCALE = the tiered strategy

THE TIERS (L365)
  the small (L157) — the cheap (L150), the fast (L151):
    the classify (L353), the extract (L143)
  the mid (L365) — the balance: the summarize (L166)
  the frontier (L148) — the best (L341), the costly (L150):
    the reasoning (L203)
  the fine-tuned (L365) — the niche (L365): the domain (L371),
    the format (L143)

THE ROUTING (L155)
  the tier per request (L365) — the classifier (L353)
  the simple (L365) → the small (L157) · the hard (L365) → the frontier (L148)
  the fallback (L365): the uncertain (L139) → the next tier (L365)
  the 80/20 (L365): the 80% on the small (L157)

THE FINE-TUNING (L365)
  the high-volume (L358) specific (L365) task (L365)
  the legal (L371), the medical (L371), the format (L143)

THE ECONOMICS (L334)
  the tokens (L332) per tier (L365) · the L334 attribution (L334)
  the tier's (L365) cost vs the quality (L341)

INTERVIEW, 4 MOVES
  1 tiers    "the small, the mid, the frontier (L365)"
  2 routing  "the tier per request (L155)"
  3 fine-tuning "the niche (L365)"
  4 economics "the tokens per tier (L334)"
```

## 18. Key Takeaways

> [!RECAP]
> - The model selection at scale is **the routing, the fine-tuning, and the tiered model strategy for the enterprise** (L365): the tiers (L365), the routing (L155), the fine-tuning (L365), and the economics (L334)
> - **The tiers** (L365): the small (L157) — the cheap (L150) and the fast (L151); the mid (L365) — the balance; and the frontier (L148) — the best (L341) and the costly (L150)
> - **The routing** (L155): the tier per request (L365) — the classifier (L353) with the fallback (L365) — the 80/20 (L365)
> - **The fine-tuning** (L365): the custom (L365) — the domain (L371), the format (L143) — for the high-volume (L358) niche (L365)
> - **The economics** (L334): the tokens (L332) per tier (L365) — the L334 attribution (L334) — the tier's (L365) cost vs the quality (L341)
> - The AI shape (L365): the enterprise (L380) — the models (L148) tiered (L365), routed (L155), and fine-tuned (L365) — with the evals (L341) per tier (L365) and the drift (L335) watched (L365)

## Check your understanding

Answer these without looking back.

1. What are the tiers (L365)?
2. How do you route (L155)?
3. When do you fine-tune (L365)?
4. What's the economics (L334)?
5. What's the drift watch (L335)?
6. What's the fallback (L365)?
7. What's the 80/20 (L365)?
8. What is the tiered strategy (L365)?

## A Closing Note — The Firm, Tiered

You now hold the strategy: **the tiers, the routing, and the fine-tuning — with the intake routing and the specialists hired.** The law firm matches the cases to the partners — and the niches have the specialists (L365).

Next: the AWS vs the Azure vs the GCP for AI, and the exit-cost question — Cloud Selection (L366).
