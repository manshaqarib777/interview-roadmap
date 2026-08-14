# Lesson 156 — Comparing the Three Providers

**Interview importance:** ⭐⭐⭐⭐ — "OpenAI, Anthropic, or Gemini?" is the most common provider question; the answer is a *decision table*, not a favourite.

Lessons 152–155 gave you the three dialects and the abstraction that routes across them. This lesson is the **decision table** that feeds the router (L155): comparing OpenAI, Anthropic, and Gemini on the axes that actually matter — quality, cost, latency, features, ecosystem, lock-in. The comparison is not "which is best" — it's *"which axis does my feature need, and who wins it?"*

The distinction this lesson is built on: a **fan** argues brands. A **solutions architect** holds a table: quality per task (measured, L343), cost (L150), latency (L151), feature support (L143–L146), ecosystem, and lock-in — and picks per axis, per task, per route. The table is the interview.

## Learning Objectives

By the end of this lesson you should be able to:

- Compare the three providers on the six axes: quality, cost, latency, features, ecosystem, lock-in
- Explain why the "best" provider is a per-task, per-axis question, not a brand
- Use the table to make a routing decision (L155) and a default choice
- Measure, not assume: why evals (L343) and usage logs (L332) beat the marketing
- Explain lock-in, and how the abstraction (L155) manages it

## 1. One-Line Definition

**Comparing the three frontier providers is holding a decision table across the axes that matter — quality (per task, measured), cost (L150), latency (L151), feature support (L143–L146), ecosystem, and lock-in — and choosing per axis, per task, per route, never per brand.**

The one-sentence interview answer: *"The comparison is a table, not a verdict. OpenAI, Anthropic, and Gemini differ on six axes — quality per task (measured by evals, L343), cost (L150), latency (L151), features (L143–L146), ecosystem, and lock-in. For most features they're interchangeable behind the abstraction (L155); the table decides the *edges*: who's cheapest for extraction, who reasons hardest, who does native multimodal, and who I trust with the workload."*

## 2. Mental Model

Think of the three providers as **three specialist firms, each with a different shop front — and you're a buyer who needs many different jobs done.**

```text
   OpenAI                     Anthropic                   Gemini
   ┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
   │ broadest shop    │      │ the long-context │       │ the multimodal   │
   │ every tool on    │      │ and deep-thinking│       │ native, Google-  │
   │ the shelf        │      │ specialist       │       │ connected shop   │
   │ (the baseline,   │      │ (L153)           │       │ (L154)           │
   │  L152)           │      │                  │       │                  │
   └──────────────────┘      └──────────────────┘       └──────────────────┘
        best default              best for hard             best for media,
        for most jobs             reasoning, long           Google stacks,
                                  context, tools            aggressive price
```

The mental model: **you don't have a favourite firm — you have a favourite firm *per job*.** The baseline (OpenAI) does most jobs well; Anthropic wins the hard-reasoning and long-context jobs; Gemini wins the media and Google-stack jobs. The table is the price list.

## 3. Visual Flow — The Decision Table in Use

```text
   a request arrives at the router (L155)
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ WHAT AXIS DRIVES THIS TASK?                  │
   │                                              │
   │  extraction / classification  →  cheapest that passes eval (L150, L343)
   │  hard reasoning / planning    →  best on the reasoning eval (L153)
   │  multimodal / media input     →  the native-multimodal provider (L154)
   │  long-context / big documents →  the long-context specialist
   │  everything else              →  the baseline default (L152)
   └──────────────────────────────────────────────┘
        │
        ▼
   the router picks → the adapter (L155) → done
```

The flow is the whole comparison: **name the driving axis, apply the table, route.** The table doesn't crown a winner — it names a winner *per axis*, and the router applies it per request.

## 4. How It Works — The Six Axes, Honestly

| Axis | What to compare | The honest read |
|---|---|---|
| **Quality** | evals on *your* task (L343) | changes every few months (L148); never a brand claim |
| **Cost** (L150) | per-1M tokens, in/out, by tier | Gemini often aggressive; measure, don't assume |
| **Latency** (L151) | TTFT + tokens/sec | model- and tier-specific; measure your path |
| **Features** | tools (L144), structured output (L143), modality (L146), thinking | OpenAI broadest; Anthropic thinking; Gemini native media |
| **Ecosystem** | SDKs, tooling, cloud, embeddings (L147) | OpenAI the ecosystem default; Gemini on Google Cloud (L261+) |
| **Lock-in** | how hard to leave (L155) | abstraction is the answer; APIs differ (L152–L154) |

The honest truth under the table: **the axes are *measured* and *moving* (L148).** Quality flips between releases; prices change; features land. The table is a *snapshot* that the evals (L343) and usage logs (L332) keep current — the senior answer is "here's the table, and here's how I keep it honest".

> [!NOTE]
> **The three providers, one sentence each (the interview's shortcut):**
> - **OpenAI** — the baseline: broadest API surface, the ecosystem default, best default choice for most jobs (L152).
> - **Anthropic** — the specialist: long-context strength, first-class extended thinking, tooling (L153).
> - **Gemini** — the native: multimodal-first parts, deep Google-ecosystem integration, often aggressive pricing (L154).
>
> Say those three sentences, then the table, then the axis for *your* feature — that's the whole comparison.

## 5. Real Project Usage

- **Routing (L155).** Extraction → cheapest that passes the eval (L150, L343); hard reasoning → the thinking specialist (L153); media → the native-multimodal provider (L154); everything else → the baseline (L152).
- **Default selection (L148).** When there's no reason to specialise, the baseline (OpenAI) is the default — the ecosystem, the SDKs, the reference point.
- **Cost pressure (L150).** At scale, the aggressive-pricing provider (often Gemini) becomes a real candidate for the easy traffic — measured against the quality bar (L343).
- **Google-stack products (L261+).** If the architecture is on Google Cloud, Gemini's integration and pricing change the table — the stack is an axis.
- **Eval-driven choice (L343).** The *only* way to compare quality honestly is your golden set on each provider, same prompts, same settings — the table's quality column is always an eval result, never a vibe.

The through-line: **the comparison exists to feed the router** (L155) — a per-axis table, kept honest by evals (L343) and logs (L332), applied per request.

## 6. Interview Explanation

Say it in four moves:

1. **The frame.** "The comparison is a table, not a verdict — six axes: quality, cost, latency, features, ecosystem, lock-in."
2. **The one-liners.** "OpenAI is the baseline and ecosystem default (L152); Anthropic is the long-context and deep-thinking specialist (L153); Gemini is multimodal-native with Google integration (L154)."
3. **The axes.** "Quality is measured per task with evals (L343); cost is per-token, output 3–5× (L150); latency is TTFT + tokens/sec (L151); features are tools, structured output, modality (L143–L146)."
4. **The application.** "For most features they're interchangeable behind the abstraction (L155). The table decides the edges — who's cheapest for extraction, who reasons hardest, who does native media — and the router applies it per request."

## 7. Senior-Level Insights

- **The table is a *moving* snapshot (L148).** The frontier changes every few months — quality flips, prices move, features land. The senior practice is re-running the evals (L343) on a schedule, not memorising "who's best" once.
- **The baseline is a real strategy, not a cop-out.** Defaulting to OpenAI (L152) and specialising only where the table says so is the cost-and-quality-optimal move for most systems — the table's job is to flag the *exceptions*.
- **Lock-in is an *axis*, and the abstraction (L155) is the management.** APIs differ (L152–L154); the abstraction normalises the concepts, and the router keeps the exit cheap. The senior answer treats lock-in as a *priced* axis, not a fear.
- **Multimodal is a first-class axis (L146).** Where the input is media, the provider's *native* multimodal handling (L154) beats a bolt-on — and it's an eval axis, not a brochure claim.
- **The comparison's real output is a *routing table* (L155), not a choice.** One provider may still be right (early products), but the *thinking* is the table — axis per task, measured, applied.

## 8. Common Mistakes

- **"X is the best" with no axis.** Best *at what*? The table has six columns; "best" without one is a brand opinion.
- **Choosing by benchmark.** Leaderboards measure the average; your task is specific — eval on *your* data (L343).
- **Assuming same price.** Providers price differently, output 3–5× input everywhere (L150); the table's cost column is per-provider, measured.
- **Ignoring the moving frontier.** "We chose X in January" with no re-eval (L341) — the table went stale.
- **Not using the abstraction (L155).** Hardcoding one provider makes every table change a rewrite — the table's decisions need an exit door.
- **Ignoring the ecosystem axis.** SDKs, embeddings (L147), cloud integration (L261+) — the "best model" can lose to the "best platform" for your stack.

## 9. Best Practices

- **Eval on your task, on all three (L343)** — same prompts, same settings, your golden set. The quality column is always measured.
- **Log usage per provider (L332)** — the cost column is your real ledger, not the price page.
- **Default to the baseline (L152), specialise by the table** — most traffic needs no specialism.
- **Keep the abstraction (L155)** — the table's decisions need a cheap exit door.
- **Re-eval on a schedule (L341)** — the frontier moves; the table must too.
- **Name the driving axis per feature** — "this feature is cost-driven", "this one is reasoning-driven" — then apply the table.

## 10. Interview Questions

**Q: How do you choose between OpenAI, Anthropic, and Gemini?**
> A: It's a table, not a verdict. Six axes: quality (evals on my task, L343), cost (L150), latency (L151), features (L143–L146), ecosystem, lock-in. For most features they're interchangeable behind the abstraction (L155). The table decides the edges: cheapest for extraction, strongest for hard reasoning, native for media — and the router applies it per request.

**Q: What is each provider's strength?**
> A: One sentence each. OpenAI is the baseline and ecosystem default — the broadest surface and the reference shape (L152). Anthropic is the long-context and deep-thinking specialist, with first-class extended thinking (L153). Gemini is multimodal-native, built around content parts, with deep Google-ecosystem integration (L154).

**Q: How do you keep the comparison honest?**
> A: Measure, don't assume. Quality comes from evals on *my* task, same prompts, all three providers (L343). Cost comes from logged usage (L332), not the price page. And I re-eval on a schedule, because the frontier moves every few months (L148, L341).

**Q: When would you use just one provider?**
> A: Often, at first. The abstraction (L155) earns its keep with a routing policy, a failover story, and multiple workloads — a small product on one provider with no special needs is simpler and deeper-integrated. The table is for when the axis differences start paying for the second adapter.

## 11. Follow-Up Questions

- What does the quality axis actually measure (L343)?
- How does the cost axis interact with tiering (L150, L157)?
- How does the abstraction (L155) manage lock-in as an axis?
- When does the ecosystem axis outweigh model quality?
- How often should you re-eval the provider table (L341)?

## 12. Comparison Table — The Six Axes

| Axis | OpenAI | Anthropic | Gemini |
|---|---|---|---|
| Quality (per task) | strong baseline (L152) | strong reasoning/long-context (L153) | strong multimodal (L154) |
| Cost (L150) | mid (the reference) | similar shape | often aggressive — measure |
| Latency (L151) | tier-dependent | tier-dependent | tier-dependent |
| Features (L143–146) | broadest surface | extended thinking | native media parts |
| Ecosystem | the default (SDKs, L160) | strong tooling | Google Cloud (L261+) |
| Lock-in | the reference (L155) | dialect (L153) | dialect + Google (L154) |

The senior read: **the table has no winner — it has a winner per axis** — and the router (L155) is where the per-axis choices become per-request decisions.

## 13. Code Example — The Table as a Routing Decision

```js
// The comparison table, as code — the router's policy (L155).
// Each task names its driving axis; the table applies.
const ROUTES = {
  // axis: COST (L150) — cheapest that passes the eval bar (L343).
  extraction:  { provider: 'openai', model: 'gpt-4o-mini', temperature: 0 },
  // axis: REASONING — the deep-thinking specialist (L153).
  reasoning:   { provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.3 },
  // axis: MULTIMODAL — native parts (L154, L146).
  media:       { provider: 'gemini', model: 'gemini-1.5-flash', temperature: 0.3 },
  // axis: DEFAULT — the baseline (L152), most traffic.
  chat:        { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.8 },
};

// The router applies the table per request (L155).
function route(task) {
  return ROUTES[task] ?? ROUTES.chat;
}

// The honest columns are measured, not assumed:
//   quality  → evals on your task (L343)
//   cost     → usage logs per provider (L332)
//   latency  → TTFT + tokens/sec per route (L151)
```

```text
What the reader must SEE — the table is code:

  ROUTES = { extraction: cheapest, reasoning: thinking,
             media: native, chat: baseline }
  route(task) → the table, applied per request

  The quality/cost/latency columns are MEASURED
  (L343, L332, L151), never assumed.
```

```narrate
3-4: Cost-driven routing — extraction goes to the cheap tier, evaluated against the quality bar (L150, L343).
5-6: Reasoning-driven — the deep-thinking specialist earns the hard tail (L153, L157).
7-8: Multimodal-driven — the native-parts provider (L154, L146).
9-10: The baseline default — most traffic, the ecosystem reference (L152).
13-14: The table, applied: task names the axis, the table names the provider.
```

> [!TIP]
> This file is L156 and L155 in one: the comparison table as a routing policy. The columns that aren't code — quality, cost, latency — are exactly what L343, L332, and L151 tell you to *measure*. The table stays honest because the measurements feed it.

## 14. Performance Notes

- **The cost column is per-provider and per-tier (L150)** — the router's savings come from routing *easy* traffic to the cheap tier, measured against the eval bar (L343).
- **The latency column is per-route (L151)** — measure TTFT and tokens/sec on *your* path; the brochure number is a starting point, not a spec.
- **The table's value decays** — the frontier moves (L148); a stale table is a cost/quality leak. Schedule the re-eval (L341).
- **The abstraction's overhead is negligible (L155)** — the routing decision is milliseconds against the network and generation; it is not a latency excuse.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| One provider takes all traffic | Router defaulting; no axis classification | Name the driving axis per task (L140) |
| Cost higher than the table said | Table not fed by usage logs (L332) | Log per provider; reconcile (L150) |
| Quality dropped after a swap | Provider changed without re-eval (L341) | Re-run the golden set before switching |
| Media tasks do poorly | Multimodal routed to a bolt-on provider | Route media to the native-parts provider (L154) |
| Lock-in feels real | No abstraction (L155) | Add the interface + adapters |

## 16. Quick Revision Notes

- The comparison is **a table, not a verdict** — six axes: quality, cost, latency, features, ecosystem, lock-in.
- One-liners: **OpenAI = baseline/ecosystem (L152); Anthropic = reasoning/long-context (L153); Gemini = multimodal/Google (L154).**
- **Quality is measured per task (L343); cost is per-token, output 3–5× (L150); latency is TTFT + tokens/sec (L151).**
- The table **feeds the router (L155)** — winner per axis, applied per request.
- **Measure, don't assume** — evals (L343), usage logs (L332), re-eval on a schedule (L341).
- One provider is often right **early on** — the table pays for the second adapter when the axis differences matter.

## 17. Cheat Sheet

```text
THE THREE PROVIDERS — a table, not a verdict

ONE-LINERS
  OpenAI     baseline · broadest surface · ecosystem default (L152)
  Anthropic  long-context · extended thinking · tooling (L153)
  Gemini     multimodal-native parts · Google stack (L154)

THE SIX AXES
  quality    evals on YOUR task (L343) — never a brand claim
  cost       per-token, output 3-5x, per tier (L150)
  latency    TTFT + tokens/sec, your path (L151)
  features   tools (L144) · structured (L143) · modality (L146)
  ecosystem  SDKs (L160) · embeddings (L147) · cloud (L261+)
  lock-in    managed by the abstraction (L155)

THE ROUTING TABLE (feeds L155)
  extraction  → cheapest that passes the eval (L150, L343)
  reasoning   → the thinking specialist (L153)
  media       → the native-multimodal provider (L154)
  default     → the baseline (L152), most traffic

RULES
  measure, don't assume (L332, L343)
  re-eval on a schedule (L341) — the frontier moves (L148)
  one provider is often right early; table pays later

INTERVIEW, 4 MOVES
  1 frame    "a table, six axes, not a verdict"
  2 one-liners "baseline / specialist / native"
  3 axes     "quality measured, cost per-token, latency per-route"
  4 apply    "feeds the router — winner per axis per request"
```

## 18. Key Takeaways

> [!RECAP]
> - The provider comparison is **a table, not a verdict** — six axes: quality, cost, latency, features, ecosystem, lock-in
> - One sentence each: **OpenAI is the baseline and ecosystem default (L152); Anthropic is the long-context and deep-thinking specialist (L153); Gemini is multimodal-native with Google integration (L154)**
> - **Quality is measured per task** (evals, L343); **cost is per-token with output at 3–5×** (L150); **latency is TTFT + tokens/sec** (L151) — none of them assumed
> - The table **feeds the router (L155)**: winner per axis, applied per request
> - **Lock-in is an axis, and the abstraction (L155) is the management** — not a fear, a priced trade
> - The table is a **moving snapshot** (L148): re-eval on a schedule (L341), and one provider is often the right early answer

## Check your understanding

Answer these without looking back.

1. Name the six axes of the provider comparison.
2. Give the one-sentence strength of each provider.
3. What does the quality axis actually measure, and how (L343)?
4. Why is the cost axis per-provider and per-tier (L150)?
5. How does the table feed the router (L155)?
6. How do you keep the table honest as the frontier moves (L148, L341)?
7. Why is "X is the best" a wrong answer without an axis?
8. When is one provider the right answer?

## A Closing Note — The Table That Decides

You now hold the complete provider map: **three dialects (L152–L154), the abstraction that routes across them (L155), and the comparison table that feeds it (this lesson).** The interview move is the table, not the brand — name the axis your feature needs, apply the measured columns, and let the router decide per request.

One lesson remains in this module — and it's the one the whole module was building toward: **L157, the model decision rule** — the capstone that turns every concept from L135 to this lesson into one repeatable procedure you can run on any request, out loud, in an interview.
