# Lesson 171 — Caching LLM Responses

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you cut AI cost and latency?" the answer's first move is *caching* — prompt caching and exact-match caching, the biggest win in the stack.

Lessons 149–151 gave you the levers; this lesson is the **biggest one**: caching. Two kinds matter — *prompt caching* (the provider's cache of repeated input prefixes, cutting TTFT and cost for a stable system prompt) and *exact-match caching* (your own cache of repeated request→response pairs, cutting the call entirely). Caching is the rare lever that wins cost *and* latency with no quality loss — the trade is cache *stability* (L142) and *freshness*.

The distinction this lesson is built on: a **demo** calls the provider every time. A **solutions architect** knows what's cacheable (stable prefixes, exact repeats), what isn't (novel prompts, fresh data), and designs the cache hierarchy — provider prompt cache for the prefix, your response cache for the repeat — as a deliberate layer of the L158 architecture.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the two caches: prompt caching (provider-side, prefix) and response caching (your side, exact match)
- Design for prompt-cache hits: byte-stable system prompts (L142), stable doc prefixes
- Design a response cache: cache keys, TTL, freshness, invalidation
- Decide what's cacheable and what isn't — and why freshness is the trade
- Place caching in the L158 architecture: at the gateway, before the call (L170)

## 1. One-Line Definition

**Caching for LLMs is the two-layer win: prompt caching — the provider's cache of repeated input prefixes, cutting TTFT (L151) and input cost (L150) — and response caching — your cache of exact request→response pairs, cutting the call entirely — the rare lever that helps cost and latency with no quality loss.**

The one-sentence interview answer: *"Two caches. Prompt caching (provider-side): a byte-stable system prompt and stable doc prefix hit the provider's cache — TTFT (L151) and input cost (L150) drop to a fraction, no quality change. Response caching (my side): an exact request → cached response, so the call never happens. The design is knowing what's cacheable — stable prefixes and exact repeats — and what isn't — novel prompts and fresh data. Caching is the cheapest win in the stack; the trade is stability (L142) and freshness."*

## 2. Mental Model

Think of the two caches as **a librarian's memory and a cook's recipe book.**

- **The librarian's memory (prompt cache, provider-side)** — remembers the opening of what you read: the same first pages (system prompt + docs prefix) cost almost nothing to "re-read". It's automatic, but only if the opening is *identical* (byte-stable, L142).
- **The cook's recipe book (response cache, your side)** — if someone orders the exact same dish (request) again, hand them the recipe result (response) without cooking. Fast and free, but stale if the dish should change (freshness).

```text
   prompt cache (provider)          response cache (yours)
   ┌─────────────────────────┐     ┌─────────────────────────┐
   │ [system + docs prefix]  │     │ key: hash(request)      │
   │  ──── cached ────       │     │ → {response, savedAt}   │
   │  new question appended  │     │ exact match → return it │
   │  ~90% cheaper, faster   │     │ no call at all          │
   └─────────────────────────┘     └─────────────────────────┘
       automatic, needs           yours, needs a key + TTL
       byte-stability (L142)      + freshness (this lesson)
```

The mental model is **two memories with two costs**: one automatic (if you keep the prefix stable), one yours (if you design the key and the TTL).

## 3. Visual Flow — A Request Through the Cache Layer

```text
   a request arrives at the gateway (L158, L170)
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │ 1 · RESPONSE CACHE? (yours)                  │
   │     exact request → cached response?         │
   │     hit → return it, no provider call        │
   │     miss → continue                          │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 2 · PROMPT CACHE? (provider, L171)           │
   │     is the prefix byte-stable? (L142)        │
   │     yes → the provider serves the prefix     │
   │     from cache: ~90% cheaper, faster TTFT    │
   └──────────────────┬───────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 3 · the call goes out — with the cached      │
   │     prefix, a fresh question, and a warm     │
   │     response cache for next time             │
   └──────────────────────────────────────────────┘
```

The flow is the hierarchy: **your response cache first (no call), the provider's prompt cache second (cheap call)** — and both depend on the discipline of the previous lessons (stable prompts, L142; budget, L149).

## 4. How It Works — The Two Caches, and the Cacheability Rules

- **Prompt caching (provider-side).** The provider caches the *input prefix* — the leading tokens, up to a cache breakpoint. When a new request shares that prefix byte-for-byte, the cached portion is served at a fraction of the price (often ~10%) and skips the input-processing TTFT (L151). The design rule: **keep the prefix byte-stable** — a frozen system prompt (L142), a stable doc prefix (L174), conversation history appended *after* the cache point (L166). One changed token in the prefix = a full cache miss.
- **Response caching (your side).** An exact request → cached response, keyed by a hash of the request. Hit → the call never happens (zero cost, zero latency). The design rules: **a cache key** (model + messages + params + schema), **a TTL** (how long the answer is valid), and **freshness** (when the answer must change). Exact repeats are rarer than stable prefixes — but for FAQs, common queries, and repeated RAG questions, the win is total.
- **What's cacheable.** Stable prefixes (yes), exact repeats (yes), deterministic tasks (classification, extraction with temp 0, L139 — the same input should mean the same answer). What's not: novel prompts, personalization (per-user memory, L167), and anything freshness-bound (prices, statuses, L140's recency desert).

> [!NOTE]
> **The honesty rule: caching trades *freshness*, never quality.** A cached answer is as good as the original — but it can be *stale*. The senior design decides what staleness is acceptable per feature: an FAQ answer can be cached for a day; a stock price must never be cached (L140). Cacheability is a freshness decision, not a performance one.

## 5. Real Project Usage

- **Chat products.** The system prompt is frozen (L142) → every request hits the prompt cache → the dominant input cost (L150) and TTFT (L151) drop. This is the single biggest cost lever in a chat product.
- **RAG (L174).** The system prompt + the retrieved-doc prefix are stable across queries → prompt cache; and repeated questions (top FAQs) hit the response cache. Retrieval-heavy apps cache the prefix and the repeats.
- **Extraction at scale (L163).** Deterministic extraction (temp 0, L139) with the same input → the response cache serves identical invoices without a call.
- **Agents (L200).** The system prompt + tool definitions are the stable prefix; the per-step results are fresh. Prompt caching makes agent loops far cheaper (L150).
- **Public AI APIs (L172).** A response cache at the gateway (L170) is both the cost control and the latency win for repeated consumer queries.

The through-line: **caching is the lever that pays for the architecture** — the stable parts of every request get cheaper or free, and the fresh parts carry the cost.

## 6. Interview Explanation

Say it in four moves:

1. **The two caches.** "Prompt caching (provider-side) serves a byte-stable prefix at ~10% cost and faster TTFT (L151). Response caching (my side) serves exact repeats with no call at all."
2. **The design.** "Keep the prefix byte-stable (L142) for prompt-cache hits; design a key + TTL for the response cache (L170)."
3. **The trade.** "Caching trades freshness, never quality — a cached answer is as good but can be stale. What's cacheable is a freshness decision: FAQs yes, prices never (L140)."
4. **The win.** "It's the rare lever that helps cost (L150) and latency (L151) with no quality loss — the first move in any optimization answer."

## 7. Senior-Level Insights

- **Prompt caching is the chat economics (L150).** In a chat product, the system prompt + history prefix dominates the input; caching it cuts the biggest cost line and TTFT (L151) at once. The senior answer leads with the frozen prompt (L142).
- **Cache stability is a *discipline*, not a feature (L142).** One changed token in the prefix = a full miss. The system prompt is a cache key — versioning it (L341) is versioning the cache.
- **The response cache is the batch/FAQs lever (L150).** Extraction and FAQ workloads have high exact-repeat rates; a response cache turns repeats into zero-cost, zero-latency hits.
- **Caching composes with the budget and the limits (L149, L170).** A cached response consumes no token budget (L149) and no rate limit (L170) — the cache is the cheapest way to stay inside both.
- **Cache invalidation is the freshness contract (L140).** Prices, statuses, and recency-desert data must invalidate on change (event-driven, L248) or never cache. The senior design names what's stale-allowed per feature before the cache exists.

## 8. Common Mistakes

- **Unstable prefixes.** The system prompt changes per request (L142) — the prompt cache never hits, and the biggest lever is silently off.
- **Caching fresh data.** A stock price or status cached (L140) — the cached answer is confidently stale.
- **Caching per-user responses.** Personalization (L167) cached globally — user A's answer served to user B. The cache key must include what changes the answer.
- **No invalidation.** A stale answer served forever — the freshness contract (L140) is missing.
- **Ignoring the response cache.** Only prompt caching, missing the exact-repeat win — for FAQs and extraction, the response cache is the bigger lever.
- **Caching as a quality risk.** Treating the cache as "optimization" without the freshness decision (L140) — it's a correctness decision wearing a performance hat.

## 9. Best Practices

- **Freeze the system prompt** (L142) — the byte-stable prefix is the prompt-cache key.
- **Append variable content after the cache point** — history (L166), the question — never in the prefix.
- **Cache exact repeats with a key + TTL** (model + messages + params + schema, L170).
- **Decide freshness per feature** (L140): FAQs cacheable; prices/statuses never, or invalidate on change (L248).
- **Scope the cache key** — per user where personalization (L167), per tenant where isolation (L320).
- **Count cache hits** (L332) — the hit rate is the lever's health; tune it (L341).

## 10. Interview Questions

**Q: How do you cache LLM calls?**
> A: Two layers. Prompt caching (provider-side): a byte-stable system prompt and doc prefix hit the provider's cache — ~10% input cost (L150) and faster TTFT (L151). Response caching (my side): exact request → cached response, so the call never happens. Both are designed for: the prefix is frozen (L142), the response cache has a key + TTL, and freshness decides what's cacheable (L140).

**Q: What's the difference between the two caches?**
> A: Prompt caching is automatic, provider-side, and needs only byte-stability of the prefix (L142) — it makes the *same opening* cheaper. Response caching is mine — a key and a TTL — and it makes the *same request* free. Prompt cache serves the prefix; response cache serves the whole repeat.

**Q: What's the trade-off?**
> A: Freshness, never quality (L140). A cached answer is as good as the original but can be stale. So I decide per feature: an FAQ answer can be cached for a day; a stock price is never cached. Cacheability is a freshness decision, not a performance one.

**Q: How does this fit into the architecture (L158)?**
> A: At the gateway (L170), before the call. The response cache is checked first — a hit never reaches the provider, consumes no budget (L149), and uses no rate limit (L170). Then the prompt cache makes the call that does go out cheaper and faster. Caching is a layer of the gateway, not an afterthought.

## 11. Follow-Up Questions

- How do you keep the system prompt byte-stable (L142)?
- How does prompt caching interact with conversation management (L166)?
- What's the cache key for a structured-output call (L143, L163)?
- How do you invalidate a cache on data change (L248)?
- How do you measure the cache hit rate (L332)?

## 12. Comparison Table — The Two Caches

| | Prompt cache (provider) | Response cache (yours) |
|---|---|---|
| What's cached | the input prefix | the whole request→response |
| Who owns it | the provider | you (L170) |
| The hit costs | ~10% + faster TTFT (L151) | zero — no call |
| The requirement | byte-stable prefix (L142) | key + TTL + freshness (L140) |
| Best for | chat, RAG, agents | FAQs, extraction, repeats |
| The risk | prefix drift → miss | staleness |

The senior read: **prompt cache for the stable parts, response cache for the exact repeats** — two levers, one discipline: know what's stable and what's fresh.

## 13. Code Example — The Cache Layer at the Gateway

```js
// The cache layer: response cache first, prompt-stable call second (L170, L171).
export async function POST(req) {
  const body = await req.json();

  // 1 · RESPONSE CACHE — exact repeats never reach the provider (L171).
  const key = cacheKey(body);                          // model + messages + params + schema
  const cached = await redis.get(key);
  if (cached) return Response.json(JSON.parse(cached), { headers: { 'X-Cache': 'HIT' } });

  // 2 · PROMPT CACHE — the call goes out with a byte-stable prefix (L142).
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: FROZEN_SYSTEM,                             // ← never changes (L142)
    messages: body.messages,                           // variable content, after the cache point
  });

  // 3 · WRITE the cache for exact repeats, with a TTL by freshness (L140).
  const response = await collectForCache(result);
  await redis.set(key, JSON.stringify(response), { ex: ttlFor(body) });
  return Response.json(response, { headers: { 'X-Cache': 'MISS' } });
}
```

```text
What the reader must SEE — the two caches in code:

  response cache  key → hit? return, no call (L171)
  prompt cache    FROZEN_SYSTEM → the provider serves the prefix (L142)
  TTL             ttlFor(body) → freshness by feature (L140)

  Cached repeats are free; cached prefixes are ~10%.
```

```narrate
7-10: The response cache — an exact repeat is served with no provider call (L171).
13-14: The system prompt is FROZEN — the byte-stable prefix is the prompt-cache key (L142).
18-20: Variable content (messages) comes after the cache point, per L166.
23-24: The response is cached with a TTL that encodes the freshness decision (L140).
```

> [!TIP]
> The two lines that make the cache correct are `FROZEN_SYSTEM` (the prompt-cache discipline, L142) and `ttlFor(body)` (the freshness decision, L140). **A stable prefix and a per-feature TTL** — everything else is plumbing.

## 14. Performance Notes

- **Prompt caching cuts TTFT and input cost together (L151, L150)** — the cached prefix skips the input-processing pass (L138) and bills at ~10%. The rare lever that helps both numbers.
- **The response cache is the zero-cost hit (L150)** — no tokens, no rate limit (L170), no latency. For high-repeat workloads (FAQs, extraction) it's the biggest lever.
- **Cache storage is a cost line (L150)** — Redis (L243) has a memory budget; TTLs and eviction (LRU) are the controls.
- **The cache key must be exact (L143)** — a schema change (L341) or a model change (L148) is a key change; version the key or serve stale-shape answers.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Cache hit rate ~0% | Prefix unstable (L142) | Freeze the system prompt; check drift |
| Stale answers served | TTL too long / no invalidation (L140) | Shorten TTL; invalidate on change (L248) |
| Wrong user's answer | Cache key missing user scope (L167, L320) | Include user/tenant in the key |
| Cache misses after a deploy | Model or schema changed the key (L341) | Version the key with model + schema |
| Redis growing unbounded | No TTL / eviction (L243) | Add TTLs; LRU eviction |

## 16. Quick Revision Notes

- Two caches: **prompt cache** (provider, prefix, ~10%) and **response cache** (yours, exact repeat, free).
- Prompt-cache rule: **byte-stable prefix** (L142) — one changed token = full miss.
- Response-cache rules: **key + TTL + freshness** (L140).
- **Freshness is the trade** — never quality; what's cacheable is a freshness decision.
- Cached hits consume **no budget (L149) and no rate limit (L170)**.
- Cache at the **gateway (L158, L170)**, count the hits (L332).

## 17. Cheat Sheet

```text
CACHING = the lever that pays for the architecture

THE TWO CACHES
  prompt cache (provider)  the byte-stable prefix → ~10% + faster TTFT (L151)
  response cache (yours)   exact request → cached response → free (L150)

THE DESIGN RULES
  prompt cache   freeze the system prompt (L142)
                 append variable content AFTER the cache point (L166)
  response cache key = model + messages + params + schema (L143)
                 TTL = the freshness decision (L140)
                 scope = user/tenant where it changes the answer (L320)

WHAT'S CACHEABLE / NOT
  stable prefixes   yes (system prompt, doc prefix, tool defs)
  exact repeats     yes (FAQs, extraction, common queries)
  personalization   key per user (L167)
  fresh data        never (prices, statuses — L140)

RULES
  a cached hit uses no budget (L149) and no rate limit (L170)
  version the cache key with model + schema (L341)
  count the hits (L332) — the hit rate is the lever's health

INTERVIEW, 4 MOVES
  1 two caches "prompt (prefix) + response (repeat)"
  2 design     "frozen prefix (L142) · key + TTL (L140)"
  3 trade      "freshness, never quality"
  4 win        "cost + latency, no quality loss — the first move"
```

## 18. Key Takeaways

> [!RECAP]
> - Caching is **the two-layer win**: prompt caching (provider-side, byte-stable prefix at ~10% and faster TTFT, L151) and response caching (your side, exact repeats served free)
> - The prompt-cache rule is **byte-stability** (L142) — one changed token in the prefix is a full miss; freeze the system prompt and append variable content after the cache point (L166)
> - The response-cache rules are **key + TTL + freshness** (L140) — the cache key encodes the request, the TTL encodes how long stale is acceptable
> - **Freshness is the trade, never quality** — a cached answer is as good but can be stale; what's cacheable is a freshness decision (L140)
> - Cached hits consume **no token budget (L149) and no rate limit (L170)** — the cache is the cheapest way to stay inside both
> - It's the **first move in any optimization answer**: cost (L150) and latency (L151) improve together, with no quality loss

## Check your understanding

Answer these without looking back.

1. Name the two caches and what each one serves.
2. What's the prompt-cache rule, and what breaks it (L142)?
3. What goes in a response-cache key (L143)?
4. What does the TTL encode, and why is that a freshness decision (L140)?
5. What's cacheable, and what never is?
6. How do cached hits interact with the budget (L149) and rate limits (L170)?
7. Why must the key be versioned with model + schema (L341)?
8. How do you measure whether the cache is working (L332)?

## A Closing Note — The Lever That Pays for the Architecture

You now hold the biggest lever in the stack: **the prompt cache for the stable parts, the response cache for the exact repeats, and the freshness discipline that decides what's cacheable.** It's the rare optimization that helps cost (L150), latency (L151), budget (L149), and rate limits (L170) at once — and it's the first move in every optimization interview answer.

Next: the security baseline of the app — AI API security fundamentals (L172), where the key, the proxy, and the secrets live.
