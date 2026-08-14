# Lesson 151 — Latency Optimization

**Interview importance:** ⭐⭐⭐⭐ — "how do you make an AI product feel fast?" is the performance question; the answer is a *latency toolbox* built on TTFT, tokens, and streaming.

Lesson 145 gave you the product layer of latency (streaming). This lesson is the engineering layer: **the latency toolbox** — TTFT, tokens-per-second, caching, tiering, and batching — and how they compose. An AI product's perceived speed is not "is the model fast?"; it's *how fast the first token arrives* (TTFT) and *how fast the rest pours in* (tokens/sec), and both are engineering levers, not model magic.

The distinction this lesson is built on: a **user** thinks latency is a property of the model. A **solutions architect** knows it's a property of the *system* — the model, the prompt, the cache, the tier, the network, the stream — and can name the lever that moves each millisecond.

## Learning Objectives

By the end of this lesson you should be able to:

- Split latency into TTFT (time-to-first-token) and inter-token latency, and name what dominates each
- Explain the latency levers: prompt caching (L171), tiering (L148), input size (L138), output length (L135), streaming (L145), batching
- Explain why output length is the hidden latency driver (a forward pass per token)
- Design a latency budget: what "feels fast" means per feature, and how to hit it
- Trade latency against cost and quality deliberately (L150's other axis)

## 1. One-Line Definition

**Latency optimization is engineering an LLM product's speed — splitting response time into time-to-first-token and generation throughput, then applying the levers (caching, tiering, input size, output length, streaming, batching) so the product *feels* fast within its cost and quality budget.**

The one-sentence interview answer: *"Latency has two halves: time-to-first-token — dominated by input processing, attention over the whole prompt (L136, L138) — and generation throughput, one forward pass per output token (L135). I optimise the first with caching (L171), tiering (L148), and input size (L138); the second with model tier, output length (L143), and streaming (L145). Then I budget: 'feels fast' is a target per feature, and I trade latency against cost (L150) deliberately."*

## 2. Mental Model

Think of an AI response as a **train journey with two legs**: the wait at the platform (TTFT) and the speed of the train (tokens/sec). Streaming (L145) is the trick that makes the platform wait feel like travel — but the *engineering* is making the platform wait short and the train fast.

```text
   total response time
   ├───────────────────────────────────────────────────┤
   │ TTFT                │  generation                 │
   │ (wait at platform)  │  (the train, token by token)│
   │                     │                             │
   │ input processing    │  one forward pass           │
   │ = attention over    │  per output token (L135)    │
   │   the whole prompt  │  → output length drives it  │
   │   (L136, L138)      │                             │
   │                     │                             │
   │ levers:             │  levers:                    │
   │  cache (L171)       │   tier (L148)               │
   │  tier (L148)        │   output length (L143)      │
   │  input size (L138)  │   stream (L145)             │
   │  network            │   batch                     │
   └─────────────────────┴─────────────────────────────┘
```

The mental model: **two numbers, two lever sets.** TTFT = "how long until the train starts moving"; generation = "how fast it moves". Streaming makes the wait *feel* shorter; caching and tiering make it *actually* shorter.

## 3. Visual Flow — Where the Milliseconds Go

```text
   user clicks "send"
        │
        ▼
   ┌───────────────────────────────────────────────┐
   │ network to your server        ~20-100ms       │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ YOUR stack (gateway, auth, retrieval)         │
   │  retrieval (L189)  ~50-200ms                  │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ PROVIDER                                          │
   │  prompt cache hit?   ~30-80ms  (L171)        │
   │  else full input pass ~0.5-5s (L138, O(n²))  │
   │  ──── TTFT ────                              │
   │  generation: N tokens × per-token forward    │
   │             pass   ~20-80ms/token (L135)     │
   └──────────────────┬────────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────────┐
   │ stream back (L145) — user sees token 1 fast,  │
   │ then the rest pour in                         │
   └───────────────────────────────────────────────┘
```

The picture is the toolbox: **every hop is a lever.** The network, the retrieval (L189), the cache (L171), the tier (L148), the input size (L138), the output length (L143), and the stream (L145) — each one adds or removes milliseconds, and the architect's job is to know which ones dominate *for this feature*.

## 4. How It Works — The Two Halves, Mechanically

- **TTFT is dominated by input processing.** The whole prompt must be attended over before the first output token — attention is O(n²) in input length (L136, L138). So TTFT scales with *input* size, and the levers are: shrink the input (L138), cache the prefix (L171, repeated input ≈ free), and pick a faster tier (L148).
- **Generation throughput is one forward pass per token (L135).** A 300-token answer is 300 sequential forward passes. So the generation leg scales with *output* length, and the levers are: shorter outputs (L143), a faster tier (L148), and streaming (L145) to make the wait visible instead of silent.
- **Caching (L171) is the asymmetric win.** A cached prefix skips the input processing entirely — TTFT drops to ~10% of the uncached number. For chat (same system prompt + summarised history, L166) and RAG (stable doc prefix), caching is the biggest single lever.
- **Tiering (L148) is the second win.** The small model is faster on both legs — lower TTFT and higher tokens/sec. The flagship's latency is a *feature you pay for*, routed to the hard tail only (L157).
- **Batching helps throughput, hurts TTFT.** Batching many requests together is efficient for the provider but queues your request — good for background jobs (L222), wrong for interactive chat.

> [!NOTE]
> **The latency/cost/quality triangle (L150).** The same levers move all three: tiering cuts cost and latency together but trades quality; caching cuts cost and latency with no quality loss but trades stability; shorter outputs cut cost and latency but trade completeness. The senior move is to *name the trade* per lever — latency optimization is never free.

## 5. Real Project Usage

- **Chat products — the TTFT fight.** The perceived quality of ChatGPT/Claude/Gemini is mostly TTFT + streaming (L145). Caching the system prompt (L171) and streaming immediately are the two non-negotiables.
- **Voice and assistant UIs.** TTFT is the whole experience — a 2-second first token breaks a voice loop. Voice routes to the fastest tier (L148) and caches aggressively.
- **RAG products.** TTFT includes retrieval (L189): a slow vector search (L182) delays the first token. Caching the *retrieved prefix* on repeated queries (L171) is the RAG-specific lever.
- **Agents (L200).** Every tool round trip (L144) adds a TTFT and a generation leg. Agent latency = sum of its steps; the levers are fewer steps (better planning, L202) and shorter per-step outputs.
- **Batch / background (L222).** When nothing is watching, latency is irrelevant — optimize cost (L150) instead, and batch for throughput. Latency levers are *only* for the interactive path.

The through-line: **latency levers apply where a human waits; cost levers apply where a machine works.** The two halves of the same optimization.

## 6. Interview Explanation

Say it in four moves:

1. **The split.** "Latency has two halves: TTFT — dominated by input processing, attention over the whole prompt (L136, L138) — and generation, one forward pass per output token (L135)."
2. **The levers.** "I attack TTFT with caching (L171), tiering (L148), and input size (L138); generation with tier, output length (L143), and streaming (L145)."
3. **The asymmetric wins.** "Caching is the biggest: a cached prefix skips input processing entirely — TTFT drops to ~10%. Tiering is second: the small model is faster on both legs."
4. **The budget.** "Then I set a target per feature — 'feels fast' is a number — and trade latency against cost (L150) and quality deliberately. Latency optimization is never free."

## 7. Senior-Level Insights

- **TTFT is the number users actually feel (L145).** Total latency barely matters when the first token lands in 300ms and the rest streams in. Optimizing TTFT is optimizing the product's perceived intelligence.
- **Caching is the senior move (L171).** It's the rare lever that cuts cost *and* latency with no quality loss — the only cost is cache stability (L142). A senior answer leads with it.
- **Input size is a *retrieval* decision (L138, L189).** TTFT scales with input; so does cost (L150). Tight retrieval is a latency lever, a cost lever, and a quality lever at once — the best kind.
- **Output length is the hidden latency driver (L135, L143).** Most people optimize TTFT and ignore that a 500-token answer is 500 sequential forward passes. Structured, short outputs (L143) attack the slowest leg.
- **Latency budget per feature, not per system.** A chat answer has a 2-second budget; a background summarisation has none. The architect sets the budget by who's watching, then applies the levers.

## 8. Common Mistakes

- **Optimizing total time instead of TTFT.** Cutting generation time by 50% while the user waits 4 seconds for the first token is optimizing the wrong number (L145).
- **Ignoring input size (L138).** A 100K-token RAG context makes TTFT seconds — regardless of how fast the model is. The input is the TTFT lever.
- **No caching (L171).** Every request paying full input cost when the prefix is identical — the biggest missed win in most systems.
- **Flagship for everything (L148).** The flagship is slower *and* more expensive; tiering cuts both (L157).
- **Unbounded outputs.** Letting the model write 800 tokens when 150 would do — the slowest, most expensive leg, ignored (L135, L150).
- **Streaming without cache.** Streaming hides the wait but doesn't shorten it; the two compose, they don't replace each other (L145).

## 9. Best Practices

- **Measure TTFT and tokens/sec separately** — they're different problems with different levers (L333).
- **Cache the prefix (L171)** — freeze the system prompt, keep the doc prefix stable.
- **Tier the interactive path (L157)** — small model first, flagship for the hard tail.
- **Keep inputs tight (L138, L189)** — retrieval quality is a latency lever.
- **Design short structured outputs (L143)** — the generation leg is per-token.
- **Stream everything a human reads (L145)** — the felt-quality layer on top of the real ones.

## 10. Interview Questions

**Q: What determines an AI product's latency?**
> A: Two halves. Time-to-first-token, dominated by input processing — attention over the whole prompt (L136, L138), so it scales with input size. Then generation, one forward pass per output token (L135), so it scales with output length. Different halves, different levers.

**Q: How do you reduce TTFT?**
> A: Cache the prefix (L171) — a cache hit skips input processing, dropping TTFT to ~10%. Use a faster tier (L148). And shrink the input (L138): tight retrieval (L189), summarised history (L166), a lean system prompt (L142). Then stream (L145) so the short TTFT is visible.

**Q: Why is output length a latency driver?**
> A: Because generation is sequential — one forward pass per token (L135). A 500-token answer is 500 passes. Short, structured outputs (L143) and the right tier cut that leg directly; streaming (L145) makes it feel faster regardless.

**Q: How do you trade latency against cost?**
> A: The same levers move both (L150). Caching cuts both with no quality loss. Tiering cuts both but trades quality — so I route the interactive path to the small model and the hard tail to the flagship (L157). Shorter outputs cut both but trade completeness. I name the trade per lever and set a latency budget per feature.

## 11. Follow-Up Questions

- How does prompt caching (L171) work, and what makes a prefix cacheable?
- Why does a RAG request have a latency problem that plain chat doesn't (L174)?
- When is batching the right latency trade (L222)?
- How does agent latency differ from chat latency (L200)?
- What's the relationship between TTFT and perceived quality (L145)?

## 12. Comparison Table — The Latency Levers

| Lever | Cuts | Trade-off | Best for |
|---|---|---|---|
| **Cache** (L171) | TTFT ~10× | stability (L142) | chat, RAG repeats |
| **Tier** (L148) | both legs | quality (L157) | interactive path |
| **Input size** (L138) | TTFT | recall (L189) | RAG |
| **Output length** (L143) | generation leg | completeness | everything |
| **Streaming** (L145) | *felt* latency | complexity | humans reading |
| **Batching** | provider throughput | TTFT per request | background (L222) |

The senior read: **the table is a budget tool** — pick the levers by who's watching (human → stream + cache + tier; machine → batch + cost), and name the trade of each.

## 13. Code Example — Latency Levers in a Request

```js
// Latency optimization in code: cache the prefix, tier the path, stream the answer.
// 1 · The system prompt is frozen — it's the cache key (L142, L171).
const SYSTEM = 'You are a concise analyst.';

// 2 · The tier is config, not code (L148, L157) — interactive path = small model.
const TIER = { model: 'gpt-4o-mini', temperature: 0.3 };

// 3 · Stream (L145) so TTFT is visible, and the request is cache-friendly.
export async function POST(req) {
  const { question } = await req.json();
  const stream = await openai.chat.completions.create({
    ...TIER,
    messages: [
      { role: 'system', content: SYSTEM },          // ← byte-stable → cache hit
      { role: 'user', content: question },
    ],
    max_tokens: 200,                                // ← short output, short generation leg
    stream: true,
  });
  return toSSE(stream);                            // ← TTFT visible, tokens pour in
}

// 4 · The real latency levers, named:
//    cache (L171)   → the frozen SYSTEM prefix hits the cache, TTFT ≈ 10%
//    tier (L148)    → small model, fast both legs
//    output (L143)  → 200 max tokens, not 800
//    stream (L145)  → the user sees token 1 fast, then the rest
```

```text
What the reader must SEE — the levers are the request:

  frozen system prompt  → cache hit (L171)
  small model tier      → fast both legs (L148)
  max_tokens 200        → short generation leg (L135, L143)
  stream: true          → TTFT visible (L145)

  Four levers, one request — no latency magic.
```

```narrate
5: The frozen system prompt is the cache key — byte-stability is the cache discipline (L171).
10: The tier is config — small model for the interactive path, flagship only for the hard tail (L157).
14-15: A short output budget cuts the generation leg — the hidden latency driver (L135).
17: Streaming makes the TTFT visible — felt latency, on top of the real wins.
```

> [!TIP]
> This one request shape — **frozen prefix + small tier + tight output + stream** — is the latency baseline for every interactive AI feature. It's not exotic; it's the four levers done deliberately.

## 14. Performance Notes

- **TTFT and generation are separate budgets.** A 300ms TTFT + 20ms/token × 300 tokens = ~6.3s total — but streamed, it *feels* like 300ms. Measure both (L333), optimize both.
- **Caching is the biggest single lever (L171).** ~10× on TTFT for repeated prefixes — bigger than any model swap.
- **Input size is O(n²) in attention (L136).** Halving a 100K input doesn't halve TTFT linearly — it cuts the dominant term. Retrieval tightness (L189) is a first-class latency lever.
- **Tiering is the both-legs lever (L148).** Small models are faster and cheaper; the flagship's latency is a routed exception (L157), not a default.
- **Batching is a background lever (L222).** It improves provider throughput at the cost of per-request TTFT — wrong for chat, right for jobs.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Fast once, slow every time | No prompt cache (L171) or cache misses | Freeze the prefix; check cache-hit metrics |
| Slow before the first token | Big input (L138) or slow retrieval (L189) | Shrink input; cache retrieved prefix; tier up |
| Fast TTFT, slow "finish" | Long generation leg (L135) | Shorten outputs (L143); faster tier (L148) |
| Slower in production than dev | Network, no cache, cold start (L172, L222) | Profile hops; cache; warm the path |
| Agent feels slow | Many tool round trips (L144) | Fewer steps (L202); shorter per-step outputs |

## 16. Quick Revision Notes

- Latency = **TTFT + generation**: input processing (L136, L138) then one forward pass per output token (L135).
- TTFT levers: **cache (L171), tier (L148), input size (L138)**.
- Generation levers: **tier (L148), output length (L143), streaming (L145)**.
- **Caching is the asymmetric win** — ~10× TTFT, no quality loss.
- **Latency and cost are the same tokens (L150)** — the levers overlap.
- **Latency budget per feature, by who's watching** — human → stream+cache+tier; machine → batch+cost (L222).

## 17. Cheat Sheet

```text
LATENCY = TTFT + generation

  TTFT         input processing (attention, O(n²) in input — L136/L138)
  generation   one forward pass per output token (L135)

LEVERS
  cache (L171)    TTFT ~10×   trades stability
  tier (L148)     both legs   trades quality (route, L157)
  input size      TTFT        trades recall (L189)
  output length   generation  trades completeness (L143)
  stream (L145)   felt        trades complexity
  batch (L222)    throughput  trades per-request TTFT

THE BASELINE REQUEST
  frozen system prompt  → cache hit (L171)
  small tier            → fast both legs (L148)
  tight max_tokens      → short generation leg (L143)
  stream: true          → TTFT visible (L145)

RULES
  measure TTFT and tokens/sec separately (L333)
  budget per feature, by who's watching
  latency & cost are the same tokens (L150)

INTERVIEW, 4 MOVES
  1 split   "TTFT + generation, different levers"
  2 TTFT    "cache, tier, input size"
  3 gen     "tier, output length, stream"
  4 budget  "target per feature, trade deliberately"
```

## 18. Key Takeaways

> [!RECAP]
> - Latency is **two halves with two lever sets**: TTFT (input processing, L136/L138) and generation (a forward pass per output token, L135)
> - **TTFT levers**: caching (L171), tiering (L148), input size (L138). **Generation levers**: tier, output length (L143), streaming (L145)
> - **Caching is the asymmetric win** — ~10× on TTFT for a frozen prefix, with no quality loss (L171)
> - **Latency and cost are the same tokens** (L150): tight retrieval, short outputs, and tiering win both axes
> - **Streaming (L145) is the felt layer** on top of the real ones — it hides the wait but doesn't shorten it
> - **Budget per feature, by who's watching**: humans get cache + tier + stream; background jobs get batching and cost optimization (L222)

## Check your understanding

Answer these without looking back.

1. Name the two halves of latency, and what dominates each.
2. List the TTFT levers and the generation levers.
3. Why is caching the biggest single lever (L171)?
4. Why is output length a hidden latency driver (L135)?
5. How does input size (L138) affect TTFT, mechanically?
6. When would you choose batching over streaming (L222)?
7. Why are latency and cost the same tokens (L150)?
8. How do you set a latency budget for a feature?

## A Closing Note — The Two Numbers

You now hold the full latency toolbox: **TTFT and generation, two halves with two lever sets, and the baseline request — frozen prefix, small tier, tight output, stream.** Combined with cost (L150), you can now answer the two questions every AI architecture faces — "how much?" and "how fast?" — with the same ledger, the same levers, and the same honesty about trade-offs.

Next: the providers themselves — the OpenAI API (L152), Anthropic (L153), Gemini (L154), abstraction (L155), and the comparison that ties the module together (L156–L157).
