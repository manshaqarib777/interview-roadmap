# Lesson 155 — Provider Abstraction & Model Routing

**Interview importance:** ⭐⭐⭐⭐ — "how do you avoid being locked into one vendor?" is the architecture question; the answer is an *abstraction with deliberate escape hatches*, not a wrapper for its own sake.

Lessons 152–154 gave you the three dialects of the same grammar. This lesson is the layer that makes them interchangeable: **provider abstraction** — one interface over many providers — and **model routing** — the policy that decides, per request, which provider/model handles it. Done well, it makes the frontier (L156) a config choice instead of a rewrite. Done badly, it's an abstraction layer that leaks, hides provider strengths, and adds latency.

The distinction this lesson is built on: a **junior** wraps every provider "to keep options open". A **solutions architect** abstracts the *concepts* (messages, tools, structured output, streaming) — because they're the same across dialects (L152–L154) — routes by *policy* (task, cost, latency, eval), and designs the *escape hatches* for when the abstraction leaks.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why provider abstraction works: the concepts are shared, only the dialects differ (L152–L154)
- Design an abstraction surface: messages, tools, structured output, streaming, usage — the five that matter
- Explain model routing: a policy that sends each request to the right provider/model by task, cost, latency, and eval
- Build a router: task classification → tier (L148) → provider → fallback
- Explain when the abstraction leaks, and design the escape hatches

## 1. One-Line Definition

**Provider abstraction is one interface over many LLM providers — normalising messages, tools, structured output, streaming, and usage, since those concepts are shared across dialects (L152–L154) — and model routing is the policy layer that decides, per request, which provider and model actually handle it.**

The one-sentence interview answer: *"The three providers share the same concepts — messages, tools, structured output, streaming, usage — only the dialects differ. An abstraction normalises those five behind one interface. Routing then decides per request: classify the task, pick the tier (L148), pick the provider by cost/latency/eval (L150, L151, L156), and fall back if it fails. The abstraction makes the frontier a config choice; the routing makes it a *smart* config choice."*

## 2. Mental Model

Think of provider abstraction as **a universal power outlet, and routing as the building's circuit panel.**

The outlet is one shape — every device plugs in the same way (the five concepts). The circuit panel decides where the power actually comes from: solar for the cheap path, grid for the heavy load, a backup generator when the grid fails. You never rewire a device because the power source changed; you flip the panel.

```text
   your feature code (never names a provider)
        │
        ▼
   ┌──────────────────────────────────────┐
   │ THE ABSTRACTION  (one interface)     │
   │  generate({messages, tools, schema}) │
   │  stream(...) · usage(...)            │
   └──────────────────┬───────────────────┘
                      ▼
   ┌──────────────────────────────────────┐
   │ THE ROUTER  (the circuit panel)      │
   │  task → tier → provider → fallback   │
   ├────────────┬────────────┬────────────┤
   │ OpenAI     │ Anthropic  │ Gemini     │
   │ adapter    │ adapter    │ adapter    │
   │ (L152)     │ (L153)     │ (L154)     │
   └────────────┴────────────┴────────────┘
```

The mental model for interviews: **the abstraction is the outlet (one shape, five concepts); the router is the panel (policy per request); the adapters are the plugs (the dialects, L152–L154).** Feature code touches only the outlet.

## 3. Visual Flow — One Request Through the Abstraction

```text
   feature: "classify this ticket"
        │
        ▼
   ┌────────────────────────────────────────────┐
   │ 1 · ABSTRACTION: generate({               │
   │       messages, tools?, schema?, stream? })│
   │     — the feature names NO provider        │
   └──────────────────┬─────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────┐
   │ 2 · ROUTER (policy):                       │
   │     · task = extraction  (L140 region)     │
   │     · tier = small (L148, temp 0, L139)    │
   │     · provider = cheapest that passes      │
   │       the eval bar (L150, L343)            │
   │     · fallback = second provider (L168)    │
   └──────────────────┬─────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────┐
   │ 3 · ADAPTER: OpenAI (L152) dialect         │
   │     → post → response → normalise          │
   └──────────────────┬─────────────────────────┘
                      ▼
   ┌────────────────────────────────────────────┐
   │ 4 · back through the abstraction:          │
   │     {content | toolCalls | schemaJSON,     │
   │      finishReason, usage}                  │
   └────────────────────────────────────────────┘
```

The flow is the whole architecture: **feature → abstraction → router → adapter → normalised result.** The feature is provider-agnostic; the policy lives in the router; the dialect lives in the adapter — and each part is independently testable (L341).

## 4. How It Works — The Five Concepts, the Router Policy, the Escape Hatches

### The five concepts the abstraction normalises

| Concept | The normalised shape | The dialect (L152–L154) |
|---|---|---|
| Messages | `[{role, content}]` | roles vs blocks vs parts |
| Tools | `{name, description, schema}` | `function` vs `input_schema` vs `functionDecl` |
| Structured output | `{schema}` → typed object | `response_format` vs tool vs `responseSchema` |
| Streaming | deltas + finish reason | SSE deltas vs blocks vs parts |
| Usage | `{input, output}` tokens | `usage` vs `usage` vs `usageMetadata` |

The abstraction normalises these five; the dialects stay in the adapters.

### The router policy (the actual decision)

- **Classify the task** into a region (L140) — extraction, chat, reasoning, RAG.
- **Pick the tier** (L148): small for easy, flagship for the hard tail.
- **Pick the provider** by the axes that matter: cost (L150), latency (L151), modality (L146), and the eval bar (L343) — L156 is the provider comparison feeding this decision.
- **Fallback**: if provider A errors or degrades (L168), route to B — the router is also the resilience layer.

### The escape hatches (when the abstraction leaks)

The abstraction normalises *concepts*, not *superpowers*. When a feature genuinely needs a provider's unique capability — Anthropic's extended thinking (L153), Gemini's native video (L154), OpenAI's embeddings (L147) — the senior design doesn't hide it; it exposes a **capability-flagged escape hatch**: the interface stays, but a request can declare "I need X", and the router sends it to the provider that has X.

> [!NOTE]
> **The honest truth about abstraction.** Abstraction is a *concept-normalisation*, never a *feature-unification*. It does not make providers identical (L156) — it makes the *shared* 90% swappable and the *unique* 10% explicit. An abstraction that hides the unique 10% is a leak waiting to happen; one that flags it is an architecture.

## 5. Real Project Usage

- **Multi-provider production stacks.** Route extraction to the cheapest small model (L148, L150), hard reasoning to the best flagship, multimodal to the native provider (L146) — the router is the cost/quality engine.
- **Resilience and failover (L168).** Provider outage (L169) → the router falls back to the second provider with zero feature-code change. Abstraction-as-resilience is a production-grade reason to have it.
- **The frontier is moving (L156).** A new model ships → add an adapter, run the evals (L343), flip the routing config — no rewrite. This is the "ride the frontier" pattern (L148).
- **The Vercel AI SDK (L160)** is the most common pre-built abstraction: `generateText`/`streamText` over many providers — this lesson is the *principle* behind that SDK.
- **Enterprise vendor strategy (L364, L377).** Abstraction is how a company keeps provider leverage — the multi-cloud/multi-vendor story at the model layer (L377).

The through-line: **abstraction decouples the architecture from the model market** — the concept layer is yours, the dialect layer is swappable, and the router is where the business decisions (cost, quality, resilience) actually live.

## 6. Interview Explanation

Say it in four moves:

1. **The why.** "The three providers share the same concepts — messages, tools, structured output, streaming, usage — only the dialects differ (L152–L154). That's what makes abstraction possible and honest."
2. **The surface.** "I normalise those five behind one interface; the dialects live in adapters. Feature code never names a provider."
3. **The router.** "Routing is policy: classify the task (L140), pick the tier (L148), pick the provider by cost/latency/eval (L150, L151, L343), and fall back on failure (L168)."
4. **The escape hatches.** "The abstraction normalises the shared 90%; the unique 10% — extended thinking, native video, embeddings — is exposed as capability-flagged routes, not hidden."

## 7. Senior-Level Insights

- **Abstraction is justified by the *concept* overlap, not by "options" (L152–L154).** The three dialects genuinely share five concepts — that's the technical basis, and naming it is the senior answer. "To avoid lock-in" alone is a wrapper, not an architecture.
- **The router is where the *business* lives.** Task → tier → provider → fallback is cost optimization (L150), quality assurance (L343), and resilience (L168) in one policy. The abstraction is plumbing; the router is product.
- **The escape hatch is the design's honesty (L156).** Providers have real superpowers; hiding them behind "one interface" trades capability for neatness. Flag them, route to them, and the abstraction never lies about what it unifies.
- **The abstraction is a *testing* boundary (L341).** Feature code is testable against a fake; each adapter is tested against its dialect; the router is tested as policy. The three layers are three test suites — that's the architecture's value.
- **Cost is per-provider, never abstracted (L150).** The abstraction normalises calls, not bills. L156's comparison stays a real, measured table feeding the router — never a "same price" assumption.

## 8. Common Mistakes

- **Abstraction for its own sake.** Wrapping providers "to keep options open" without a router policy — an interface with no decisions behind it is ceremony.
- **Hiding provider strengths.** Forcing Anthropic's extended thinking or Gemini's video through a text-only interface — the abstraction that leaks by *throttling* capability (L153, L154).
- **Normalising the un-normalisable.** Pretending prices, latencies, or evals are provider-agnostic — they're not (L150, L151, L156).
- **Routing without evals.** Sending traffic to "the cheapest" with no quality bar (L343) — cost optimization without quality control.
- **No fallback.** A single provider behind an abstraction is still a single point of failure (L168, L169).
- **Leaking dialect into feature code.** Adapter-specific shapes escaping the adapter — the abstraction that exists on paper only.

## 9. Best Practices

- **Normalise the five concepts** (messages, tools, structured output, streaming, usage) — nothing more.
- **Route by policy**: task region (L140) → tier (L148) → provider (L156) → fallback (L168).
- **Keep a quality bar on every route** — evals (L343), not just price (L150).
- **Expose capability flags** for the unique 10% — route to the provider that has the feature, don't hide it.
- **Make it a testing boundary** — fake the interface for feature tests; test adapters and router separately (L341).
- **Measure per provider** — the router's decisions are only as good as L156's table and L332's usage logs.

## 10. Interview Questions

**Q: Why does provider abstraction work?**
> A: Because the three providers share the same five concepts — messages, tools, structured output, streaming, usage — and only the dialects differ (L152–L154). Normalising those five gives one honest interface; the dialects live in adapters. It's concept-overlap, not a wrapper for its own sake.

**Q: How do you route between providers?**
> A: Policy per request: classify the task (L140), pick the tier (L148), choose the provider by cost, latency, and eval results (L150, L151, L156), and fall back to a second provider on failure (L168). The router is where the business decisions live.

**Q: What happens when the abstraction leaks?**
> A: It's supposed to, in one sense — providers have unique capabilities. The senior design exposes them as capability-flagged routes: the interface stays, but a request can declare it needs extended thinking or native video, and the router sends it to the provider that has it. Hiding the unique 10% is the leak; flagging it is the architecture.

**Q: How does this relate to the Vercel AI SDK (L160)?**
> A: The SDK is a pre-built version of exactly this: `generateText`/`streamText` over many providers. This lesson is the principle behind it — the five concepts, the adapter per provider, and routing on top. Knowing the principle is what lets you use the SDK well or build your own.

## 11. Follow-Up Questions

- What are the five concepts worth normalising, and which one is hardest?
- How do you set a quality bar per route (L343)?
- How does the router handle provider outages (L168, L169)?
- When is a pre-built abstraction (L160) better than a custom one?
- How does provider abstraction interact with enterprise vendor strategy (L364)?

## 12. Comparison Table — Abstraction vs the Alternatives

| Approach | What it gives | What it costs | Best for |
|---|---|---|---|
| **Abstraction + router** | swappable providers, cost/quality policy | adapter maintenance, dialect learning | production, multi-provider |
| One provider (L152–L154) | simplicity, deepest integration | lock-in, no failover (L168) | small/early products |
| Pre-built SDK (L160) | fast, maintained, standard | less control, its opinion | most apps |
| Full DIY multi-LLM | total control | you maintain everything | special needs |

The senior read: **abstraction is a production pattern, not a default** — it earns its keep with a router policy, a failover story, and a capability-flag design. Without those, one provider (L156) is often the right answer.

## 13. Code Example — The Abstraction and Router

```js
// The abstraction: one interface, three dialects behind adapters.
// The router: policy per request — task, tier, provider, fallback.

// 1 · THE INTERFACE — the five normalised concepts (L152-154).
async function generate({ messages, tools, schema, tier = 'small' }) {
  const provider = router.pick({ tier, task: schema ? 'structured' : 'chat' });
  try {
    return await ADAPTERS[provider].generate({ messages, tools, schema, tier });
  } catch (err) {
    return ADAPTERS[router.fallback(provider)].generate({ messages, tools, schema, tier });
  }
}

// 2 · THE ROUTER — policy, not plumbing (L148, L150, L156).
const router = {
  pick({ tier, task }) {
    if (task === 'structured') return 'openai';       // best schema support (L143)
    if (tier === 'flagship' && task === 'reasoning') return 'anthropic'; // thinking (L153)
    if (task === 'multimodal') return 'gemini';       // native parts (L154)
    return 'openai';                                  // the default cheap path
  },
  fallback(p) { return p === 'openai' ? 'anthropic' : 'openai'; }, // L168
};

// 3 · ADAPTERS — the dialects stay here (L152-154). One shown.
const ADAPTERS = {
  openai: { generate: async (args) => openai.chat.completions.create({ …args }) },
  // anthropic: { generate: async (args) => anthropic.messages.create({ … }) },
  // gemini:   { generate: async (args) => gemini.model.generateContent({ … }) },
};

// Feature code: no provider name in sight (L155's whole point).
const answer = await generate({
  messages: [{ role: 'user', content: 'Classify this ticket…' }],
  schema: ticketSchema,          // → router sends it to OpenAI, temp 0
});
```

```text
What the reader must SEE — three layers, one flow:

  generate()      the interface — feature code, provider-agnostic
  router.pick()   the policy — task → tier → provider → fallback
  ADAPTERS        the dialects — one per provider (L152-154)

  Feature code never names a provider; the router and adapters do.
```

```narrate
5-11: The interface: feature code calls generate(), never a provider. The router decides, and falls back on error (L168).
14-22: The policy: structured→OpenAI, reasoning→Anthropic, multimodal→Gemini, default→OpenAI. That's L156 in code.
24-27: The dialects stay in adapters — the five concepts normalised, per provider (L152-154).
31-34: The feature is provider-agnostic — swapping providers is router config plus re-eval (L341).
```

> [!TIP]
> The senior details are the *policy* (the router's `pick`) and the *fallback* (L168) — not the wrapper. An abstraction without a policy is plumbing; with one, it's the cost/quality/resilience engine of the whole AI stack.

## 14. Performance Notes

- **The abstraction adds one hop and a tiny overhead** — the routing decision is milliseconds; the network dominates (L151). It is not a latency excuse.
- **Routing is a cost lever (L150)** — sending the easy traffic to the cheap provider is tiering (L148) at the provider level; the router *is* cost optimization in code.
- **Fallback is a latency trade (L151)** — a failed provider costs a retry's TTFT; weigh fallback against timeouts (L169) per feature.
- **Adapters must stream correctly (L145)** — the abstraction normalises streaming too; a buffering adapter destroys the felt-quality the stream provides.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| All traffic hits one provider | Router policy defaulting (no task classification) | Check the `pick` logic; add the task regions (L140) |
| A provider's strength unused | Abstraction hides it (L153, L154) | Expose capability flags; route to it |
| Fallback never fires | No error handling in the router (L168) | Wrap adapter calls; add the fallback path |
| Feature code has provider names | Abstraction leaking | Move dialect to adapters; fix the interface |
| Costs higher than modeled | Router not tiering (L148) | Route easy traffic to the cheap tier/provider (L150) |

## 16. Quick Revision Notes

- Abstraction works because **the five concepts are shared** (messages, tools, structured output, streaming, usage) — only the dialects differ (L152–L154).
- The surface normalises **five concepts**; the dialects stay in **adapters**.
- The router is **policy**: task (L140) → tier (L148) → provider (L156) → fallback (L168).
- **Escape hatches**: the unique 10% (extended thinking, video, embeddings) is capability-flagged, not hidden.
- **Abstraction ≠ price normalisation** — cost (L150) stays per-provider and measured.
- The Vercel AI SDK (L160) is the pre-built version of this pattern.

## 17. Cheat Sheet

```text
PROVIDER ABSTRACTION = one interface over many dialects (L152-154)

THE FIVE CONCEPTS (the shared grammar)
  messages          [{role, content}]
  tools             {name, description, schema}   (L144)
  structured output {schema} → typed object       (L143)
  streaming         deltas + finish reason        (L145)
  usage             {input, output} tokens        (L149)

THE ROUTER (the policy — where the business lives)
  classify task (L140) → tier (L148) → provider (L156) → fallback (L168)
  cost (L150) · latency (L151) · eval bar (L343) · modality (L146)

THE ESCAPE HATCHES (the honest 10%)
  capability flags: extended thinking (L153), native video (L154),
  embeddings (L147) — route to the provider that has them, never hide

RULES
  normalise five concepts, nothing more
  keep a quality bar on every route (L343)
  measure per provider (L150) — never assume same price
  abstraction + router + adapters = three test suites (L341)

INTERVIEW, 4 MOVES
  1 why     "five shared concepts, dialects differ"
  2 surface "normalise five, adapters hold dialects"
  3 router  "task → tier → provider → fallback"
  4 hatches "unique 10% flagged, never hidden"
```

## 18. Key Takeaways

> [!RECAP]
> - Provider abstraction is honest because **the five concepts are genuinely shared** (L152–L154): messages, tools, structured output, streaming, usage
> - The architecture is three layers: **interface (five concepts), router (policy), adapters (dialects)** — feature code never names a provider
> - **Routing is where the business lives**: task → tier → provider → fallback, driven by cost (L150), latency (L151), and evals (L343)
> - The **escape hatches are the design's honesty** — the unique 10% (extended thinking, native video, embeddings) is capability-flagged and routed, never hidden
> - **Abstraction never normalises price** — cost stays per-provider and measured (L150, L156)
> - The Vercel AI SDK (L160) is the **pre-built version of this pattern** — and this lesson is the principle behind it

## Check your understanding

Answer these without looking back.

1. Why does provider abstraction work — what's the technical basis?
2. Name the five concepts an abstraction should normalise.
3. Walk a request through interface → router → adapter.
4. What does the router policy decide, and in what order?
5. How do escape hatches keep the abstraction honest (L156)?
6. Why is "abstraction ≠ same price" an important rule (L150)?
7. How does the abstraction become a testing boundary (L341)?
8. When is one provider (no abstraction) the right answer?

## A Closing Note — The Layer That Makes the Frontier a Config

You now hold the layer that turns the moving frontier (L156) into a config choice: **one interface, five concepts, a policy router, adapters per dialect, and escape hatches for the unique 10%.** Combined with the three dialects (L152–L154), you can build against any provider, route for cost and quality, and fail over when one of them stumbles — without rewriting a single feature.

Next: the comparison that feeds the router — L156's decision table across the three providers, and then L157's capstone: the model decision rule that turns this whole module into one repeatable procedure.
