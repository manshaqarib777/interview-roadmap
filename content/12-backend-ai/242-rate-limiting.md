# Lesson 242 — Rate Limiting

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you protect the model bill?" — the answer is *rate limiting*: token buckets, per-tenant limits, and what the model bills you for (L170, L150).**

L170 gave you rate limiting for the AI app; this lesson is the **backend version**: rate limiting — the gateway's pace control (L236): the algorithms (the token bucket, L242), the limits (per user, per tenant, L242), and the model-specific shape (the token rates, L149, the cost, L150). The rate limit is the platform's abuse control (L318) and its cost control (L150) — enforced at the gateway (L236).

The distinction this lesson is built on: a **demo** lets anyone call anything. A **solutions architect** designs the limits: the algorithm (the token bucket, L242), the keys (per user, per tenant, L242), the model-aware rates (L149), and the 429's shape (L170) — the pace control at the platform's door (L236).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the algorithms: the token bucket, the fixed window, the sliding window (L242)
- Explain the keys: per user, per tenant, per key (L242)
- Explain the AI shape: the token rates and the model cost (L149, L150)
- Explain the enforcement: at the gateway (L236)
- Explain the 429's shape (L170)

## 1. One-Line Definition

**Rate limiting is the platform's pace control — the gateway (L236) limits how fast each caller may go with the token bucket and the window algorithms (L242), the per-user, per-tenant, and per-key limits (L242), and the AI-specific shape: the token rates (L149) and the model cost (L150) — the abuse control (L318) and the cost control (L150), returning the well-shaped 429 (L170).**

The one-sentence interview answer: *"Rate limiting is the pace control at the gateway (L236). The algorithms: the token bucket — a bucket that refills at a rate, allowing bursts up to the capacity (L242); the fixed window — N requests per minute, simple but bursty at the boundary (L242); the sliding window — the smooth version of the fixed (L242). The keys: the limits are per user, per tenant, per API key (L242) — the tenant's plan (L357) decides its rate (L242). The AI shape: the limits include the token rates — the requests per minute AND the tokens per minute (L149) — because the model bills you for the tokens, not just the calls (L150). The enforcement is at the gateway (L236): Redis (L243) counts, the over-limit returns the well-shaped 429 (L170) with the retry-after (L170). The rate limit is the abuse control (L318) and the cost control (L150) in one (L242)."*

## 2. Mental Model

Think of rate limiting as **the water meter on the building's main line.** The meter (the rate limit, L242) measures how fast the water (the requests) flows into the building (the platform, L236). The meter has a dial (the algorithm, L242): the token bucket is a tank that refills — you can draw a burst if the tank's full, then you wait for the refill (L242); the fixed window is a per-minute allowance that resets (L242). The meter reads per apartment (per user, L242) and per building (per tenant, L242). And for the AI platform, the meter also weighs the water (the tokens, L149) — because the bill is by the water's weight, not just the draws (L150). The meter at the main line protects the building (L318) and the budget (L150).

```text
   the water meter (the rate limit, L242)
   ┌────────────────────────────────────────────────────────┐
   │ the dial: token bucket (L242) · fixed window (L242)    │
   │ per apartment: per user (L242) · per building: per     │
   │ tenant (L242)                                          │
   │ the AI meter: tokens per minute (L149) + cost (L150)   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the water meter**: the dial, the per-apartment reads, and the AI's token weight — at the main line (L242).

## 3. Visual Flow — The Rate Check

```text
   a request arrives (L242)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE KEY (L242)                                       │
   │     the limit's identity: the user, the tenant, the key  │
   │     (L242)                                               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE ALGORITHM (L242)                                 │
   │     the token bucket: capacity + refill (L242)           │
   │     the request consumes a token (L242)                  │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE VERDICT (L170)                                   │
   │     tokens left → allowed (L242)                         │
   │     empty → 429 with the retry-after (L170)              │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the allowed request proceeds — the model call budgeted (L149)
```

The flow is the meter: **key → algorithm → verdict** — the pace measured at the door (L242).

## 4. How It Works — The Algorithms, the Keys, the AI Shape

- **The algorithms (L242).** The token bucket — a bucket of capacity that refills at a rate: bursts allowed up to the capacity, then the refill's pace (L242). The fixed window — N per minute, simple, bursty at the boundary (L242). The sliding window — the smooth fixed window (L242). The token bucket is the common default (L242).
- **The keys (L242).** The limits are keyed: per user (L242), per tenant (L242), per API key (L237). The tenant's plan (L357) decides its rate (L242) — the key is the limit's identity (L242).
- **The AI shape (L149).** The model's limits include the token rates (L149): the requests per minute AND the tokens per minute (L149) — because the model bills you for the tokens, not just the calls (L150). The AI rate limit is request-aware and token-aware (L242).
- **The enforcement (L236).** The gateway (L236) enforces: Redis (L243) counts, the check is fast (L151), and the over-limit returns the well-shaped 429 (L170) with the retry-after (L170).
- **The purpose (L318, L150).** The rate limit is the abuse control (L318) — the runaway caller can't hammer the platform — and the cost control (L150) — the capped caller can't run a bill (L150).

> [!NOTE]
> **The AI rate limit is token-aware, not just request-aware (L149, L150).** A request limit alone is meaningless for the AI platform: one request can be 100 tokens or 100,000 (L149). The senior design limits both — the requests per minute (the call pace) AND the tokens per minute (the spend pace, L149) — because the model bills by the tokens (L150). The token rate limit is the cost control's enforcement (L150): the tenant's token budget (L149) IS its rate limit's denominator (L242).

## 5. Real Project Usage

- **The AI SaaS (L357).** The per-tenant limits (L242): the tenant's plan (L357) decides its requests per minute and its tokens per minute (L149).
- **The partner API (L237).** The per-key limits (L242): the partner's key (L237) has its rate (L242).
- **The free tier (L318).** The free users' limits (L242) — the abuse control (L318) and the upgrade driver (L357).
- **The bursty product (L242).** The token bucket (L242) — the bursts allowed up to the capacity (L242).
- **Anything at the door (L260).** The rate limit (L242) is the gateway's pace control (L236) — the L260 platform's meter (L260).

The through-line: **the meter at the door** — the algorithms, the per-caller keys, and the AI's token-aware shape (L242).

## 6. Interview Explanation

Say it in four moves:

1. **The algorithms.** "Token bucket (L242), fixed window (L242), sliding window (L242)."
2. **The keys.** "Per user, per tenant, per key (L242)."
3. **The AI shape.** "Requests per minute AND tokens per minute (L149) — the bill's pace (L150)."
4. **The enforcement.** "At the gateway (L236), Redis (L243), the well-shaped 429 (L170)."

## 7. Senior-Level Insights

- **The token bucket is the burst default (L242).** The senior answer uses the token bucket (L242) for the bursty products — the capacity and the refill are the design (L242).
- **The keys are the business model (L242).** The per-tenant limits (L242) — the tenant's plan (L357) is its rate (L242): the pricing's pace (L150).
- **The token rate is the AI's cost control (L149).** The tokens per minute (L149) bound the spend (L150) — the token-aware limit is the AI platform's meter (L242).
- **Redis is the counter's home (L243).** The atomic counters (L243) in Redis (L243) — the rate check sub-millisecond (L151).
- **The 429 is a contract (L170).** The well-shaped 429 (L170) with the retry-after (L170) — the client's backoff (L169) reads it (L242).

## 8. Common Mistakes

- **No rate limiting (L242).** The runaway caller (L318) and the runaway bill (L150) — the meter missing (L242).
- **The request-only limit (L149).** The 100k-token request counts as one (L149) — the token rate (L149) missing (L242).
- **The global limit (L242).** One limit for everyone (L242) — the per-tenant keys (L242) missing.
- **The 429 unshaped (L170).** The raw error with no retry-after (L170) — the client's backoff (L169) can't read it (L242).
- **The check in the database (L151).** The counter in Postgres (L151) — the Redis (L243) home missing (L242).
- **The rate limit bypassed (L236).** The enforcement not at the gateway (L236) — the services re-implementing (L242).

## 9. Best Practices

- **Enforce at the gateway** (L236) — the meter at the door (L242).
- **Key the limits** (L242) — per user, per tenant, per key (L237).
- **Limit the tokens, not just the requests** (L149) — the AI's cost pace (L150).
- **Use the token bucket for the bursts** (L242) — the capacity and the refill (L242).
- **Count in Redis** (L243) — the atomic, fast counters (L151).
- **Shape the 429** (L170) — with the retry-after (L170), readable by the client's backoff (L169).

## 10. Interview Questions

**Q: What's rate limiting?**
> A: The platform's pace control (L242): the gateway (L236) limits how fast each caller may go. The algorithms: the token bucket — the capacity and the refill, allowing bursts (L242); the fixed and sliding windows (L242). The keys: per user, per tenant, per key (L242). The AI shape: the requests per minute AND the tokens per minute (L149) — because the model bills by the tokens (L150).

**Q: Token bucket or fixed window?**
> A: The burstiness decides (L242). The fixed window — N per minute — is simple but bursty at the boundary (L242). The token bucket — the capacity and the refill — allows the bursts up to the capacity, then paces the refill (L242). For the bursty AI product — a user sending several requests at once — the token bucket is the default (L242).

**Q: Why limit the tokens, not just the requests?**
> A: Because the model bills you for the tokens (L150). One request can be 100 tokens or 100,000 (L149) — a request-only limit lets a 100k-token request through as "one call" (L149). The AI rate limit is token-aware: the requests per minute bound the call pace, and the tokens per minute bound the spend pace (L149) — the cost control's enforcement (L150).

**Q: What does the 429 look like?**
> A: The well-shaped 429 (L170): the status, the code, and the retry-after (L170) — how long until the bucket refills (L242). The client's backoff (L169) reads the retry-after (L170) and waits instead of hammering (L169). The 429 is a contract (L242), not a raw error (L170).

## 11. Follow-Up Questions

- What are the algorithms (L242)?
- How do the keys work (L242)?
- Why the token-aware limits (L149)?
- Where is the enforcement (L236)?
- What's in the 429 (L170)?

## 12. Comparison Table — The Algorithms

| | Token bucket (L242) | Fixed window (L242) | Sliding window (L242) |
|---|---|---|---|
| Mechanism | the capacity + refill | N per minute | the smooth fixed |
| Bursts (L242) | allowed, up to capacity | boundary-bursty | smooth |
| Memory (L243) | one counter | one counter | the window's log |
| The fit (L242) | the bursty default | the simple | the smooth |

The senior read: **the burstiness column is the choice** — the token bucket for the bursts, the windows for the smooth (L242).

## 13. Code Example — The Token Bucket

```js
// Rate limiting: the token bucket at the gateway (L242, L236).
// THE BUCKET (L242) — the capacity and the refill, in Redis (L243).
async function checkRate(key, { capacity = 60, refillPerSec = 1, cost = 1 }) {
  // The atomic Lua — read, refill, consume (L243, L255).
  const script = `
    local bucket = redis.call('hgetall', KEYS[1])
    local tokens = tonumber(bucket[2] or ARGV[1])     -- the current tokens
    local last = tonumber(bucket[4] or ARGV[2])       -- the last refill
    local now = tonumber(ARGV[2])
    tokens = math.min(tonumber(ARGV[1]), tokens + (now - last) * tonumber(ARGV[3]))
    if tokens >= tonumber(ARGV[4]) then
      redis.call('hset', KEYS[1], 'tokens', tokens - ARGV[4], 'last', now)
      return { 1, tokens - ARGV[4] }
    end
    return { 0, tokens }
  `;

  // THE ENFORCEMENT (L236) — the key: the user + the tenant (L242).
  const key = `rl:${tenant}:${user}`;
  const [allowed, remaining] = await redis.eval(script, [key], [capacity, Date.now() / 1000, refillPerSec, cost]);

  if (!allowed) {
    const retryAfter = Math.ceil((cost - remaining) / refillPerSec);   // the refill time (L242)
    return error(429, { code: 'rate_limited', retryAfter });           // the contract (L170)
  }
  return ok({ remaining });
}

// THE AI SHAPE (L149) — the token-aware limit (L150).
await checkRate(`tokens:${tenant}`, { capacity: tenant.tokenRate, cost: request.estimateTokens });  // L149
await checkRate(`reqs:${tenant}:${user}`, { capacity: tenant.reqRate });                            // L242
```

```text
What the reader must SEE — the meter at the door:

  the capacity + refill      → the token bucket (L242)
  hset in Redis              → the counter's home (L243)
  the per-tenant keys        → the business model (L242)
  the token-aware cost       → the AI's spend pace (L149, L150)
  the 429 + retryAfter       → the contract (L170)

  The bucket refills, the requests consume, the 429 tells the wait.
```

```narrate
4-13: The bucket — the capacity and the refill, computed atomically in Redis (L242, L243).
15-19: The verdict — the tokens left decide the allow or the 429 (L170).
21-23: The 429's shape — the retry-after, readable by the client's backoff (L169, L170).
26-28: The AI shape — the token-aware limit (L149) beside the request limit (L242).
```

> [!TIP]
> The pair that makes it the AI's meter: **`tokens:${tenant}`** (the token rate, L149) beside **`reqs:${tenant}:${user}`** (the request rate, L242). **The bill's pace and the call's pace — the meter weighs the water AND counts the draws (L242).**

## 14. Performance Notes

- **The check is sub-millisecond (L151).** The Redis counter (L243) — the atomic eval (L243) — the rate check off the latency budget (L236).
- **The token-aware limit is the cost control (L150).** The tokens per minute (L149) bound the spend (L150) — the meter's weight (L242).
- **The 429 is the backoff's input (L169).** The retry-after (L170) — the client waits correctly (L169), the hammering avoided (L242).
- **The counters are the storage cost (L150).** The Redis keys (L243) with the TTLs (L243) — cheap, bounded (L242).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The bill explodes | The request-only limit (L149) | The token rate (L149) |
| The 429s unfair | The window's boundary (L242) | The token bucket (L242) |
| One tenant starves others | The global limit (L242) | The per-tenant keys (L242) |
| The clients hammer | The 429 unshaped (L170) | The retry-after (L170) |
| The check is slow | The counter in Postgres (L151) | Redis (L243) |

## 16. Quick Revision Notes

- Rate limiting = **the pace control** (L242): the gateway's meter (L236).
- The algorithms: **token bucket, fixed window, sliding window** (L242).
- The keys: **per user, per tenant, per key** (L242).
- The AI shape: **the tokens per minute, not just the requests** (L149, L150).
- The enforcement: **Redis (L243), the well-shaped 429 (L170)**.
- The purpose: **the abuse control (L318) and the cost control (L150)**.

## 17. Cheat Sheet

```text
RATE LIMITING = the pace control at the platform's door

THE ALGORITHMS (L242)
  token bucket  the capacity + the refill — bursts up to the
                capacity, then the refill's pace (L242)
  fixed window  N per minute — simple, boundary-bursty (L242)
  sliding window  the smooth fixed (L242)

THE KEYS (L242)
  per user (L242) · per tenant (L242) · per API key (L237)
  the tenant's plan (L357) IS its rate (L242)

THE AI SHAPE (L149, L150)
  the requests per minute — the call pace (L242)
  AND the tokens per minute — the spend pace (L149)
  the model bills by the tokens (L150)

THE ENFORCEMENT (L236)
  at the gateway (L236) · Redis counters (L243) · fast (L151)
  the 429 with the retry-after (L170) — the client's backoff reads it (L169)

THE PURPOSE (L318, L150)
  the abuse control (L318) · the cost control (L150)

INTERVIEW, 4 MOVES
  1 algorithms "token bucket, windows (L242)"
  2 keys      "per user, per tenant, per key (L242)"
  3 AI shape  "the tokens per minute (L149, L150)"
  4 enforcement "the gateway, Redis, the shaped 429 (L236, L170)"
```

## 18. Key Takeaways

> [!RECAP]
> - Rate limiting is **the pace control at the gateway** (L242): the token bucket (L242), the fixed and sliding windows (L242), keyed per user, per tenant, per key (L242)
> - **The token bucket is the burst default** (L242) — the capacity and the refill are the design (L242)
> - **The AI rate limit is token-aware** (L149): the requests per minute bound the call pace, and the tokens per minute (L149) bound the spend pace — because the model bills by the tokens (L150)
> - **The per-tenant keys are the business model** (L242) — the tenant's plan (L357) IS its rate (L242)
> - **The enforcement is at the gateway** (L236) — the Redis counters (L243) keep the check sub-millisecond (L151), and the well-shaped 429 (L170) with the retry-after (L170) is the client's backoff input (L169)
> - The rate limit is **the abuse control (L318) and the cost control (L150) in one** (L242)

## Check your understanding

Answer these without looking back.

1. What are the three algorithms (L242)?
2. How does the token bucket work (L242)?
3. What are the keys (L242)?
4. Why the token-aware limits (L149)?
5. Where is the enforcement (L236)?
6. What's in the 429 (L170)?
7. How does Redis count (L243)?
8. What's the rate limit's purpose (L318)?

## A Closing Note — The Meter at the Main Line

You now hold the pace control: **the token bucket's capacity and refill, the per-tenant keys, the token-aware spend limit, and the shaped 429 with its retry-after.** The platform's main line now has a meter — protecting the building and the budget (L242).

Next: the counter's home — Redis (L243), the cache and coordination layer every AI backend leans on.
