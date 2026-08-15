# Lesson 244 — Caching Strategies

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you cache the AI backend?" — the answer is *the strategies*: cache-aside, TTL, and invalidation — for prompts and for data (L171, L243).**

L171 gave you the AI-level caching; L243 gave you Redis; this lesson is **the strategies**: caching strategies — how the cache is used: the **cache-aside** pattern (the app checks the cache, then the source, L244), the **TTL** (the staleness contract, L140), and the **invalidation** (the writes that kill the stale entries, L244). The AI backend caches two kinds: the **prompts and responses** (L171) and the **data** (the sessions, the profiles, L244).

The distinction this lesson is built on: a **demo** caches everything forever. A **solutions architect** designs the strategy: the cache-aside reads (L244), the TTLs by the staleness contract (L140), and the invalidation on the writes (L244) — because a cache without a strategy is a stale-data generator (L244).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain cache-aside: the app checks the cache, then the source (L244)
- Explain the TTL: the staleness contract (L140)
- Explain the invalidation: the writes that kill the stale entries (L244)
- Explain the AI kinds: the prompts and the data (L171, L244)
- Explain the strategy by data: TTL vs invalidation (L244)

## 1. One-Line Definition

**Caching strategies are how the cache is used — the cache-aside pattern (the app reads the cache, then the source on a miss, L244), the TTL (the staleness contract, L140), and the invalidation (the writes that kill the stale entries, L244) — applied to the AI backend's two kinds: the prompts and responses (L171) and the data (L244), with the strategy chosen by the data's freshness (L140).**

The one-sentence interview answer: *"The caching strategy is how the cache is used (L244). The core pattern: cache-aside (L244) — the app checks the cache (L243), on the hit it's done, on the miss it reads the source (L115) and writes the cache (L244). The TTL (L140) — everything cached expires, and the TTL is the staleness contract: how stale may this data be (L140)? The invalidation (L244) — on a write, the cache entries that the write affects are deleted (L244), so the next read is fresh (L244). The AI backend caches two kinds: the prompts and the responses (L171) — the exact-repeat generations (L171), TTL'd by the freshness of the content (L140); and the data — the sessions (L237), the profiles (L244) — TTL'd or invalidated on the writes (L244). The strategy follows the data (L244): the TTL for the slow-changing, the invalidation for the write-driven (L244)."*

## 2. Mental Model

Think of caching as **the office's bulletin board — with rules about what goes on it.** The board (the cache, L244) holds the frequently-needed notices (the hot data, L244). The rules: check the board first (the cache-aside read, L244) — if the notice's there, use it; if not, go to the archive (the source, L115) and pin a copy (the cache write, L244). Every notice has a "valid until" date (the TTL, L140) — the board's notices expire by design (L244). And when a notice's subject changes, the board's copy is pulled down (the invalidation, L244) so nobody reads the stale version (L140). The board works because the rules — check, pin with a date, pull on change — are followed (L244).

```text
   the bulletin board (the cache, L244)
   ┌────────────────────────────────────────────────────────┐
   │ check first (the cache-aside read, L244)               │
   │ pinned with a date (the TTL, L140)                     │
   │ pulled on change (the invalidation, L244)              │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the bulletin board**: check, pin with a date, pull on change — the cache's three rules (L244).

## 3. Visual Flow — The Cache-aside Read

```text
   a request needs the data (L244)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE CACHE READ (L243)                                │
   │     the cache check (L244) — sub-millisecond (L151)      │
   │     HIT → return (L244)                                  │
   │     MISS → continue (L244)                               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼ miss
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE SOURCE READ (L115)                               │
   │     the database (L115) or the model (L171)              │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE CACHE WRITE (L244)                               │
   │     pin the copy with the TTL (L140)                     │
   └──────────────────────────────────────────────────────────┘
                      ▼
   the response — the next read is a hit (L244)
```

The flow is the pattern: **cache read → miss → source → cache write** — the board's check-and-pin (L244).

## 4. How It Works — The Pattern, the TTL, the Invalidation

- **The cache-aside (L244).** The app checks the cache (L243); the hit returns (L244); the miss reads the source (L115) and writes the cache (L244). The pattern is the read path's default (L244).
- **The TTL (L140).** Every entry expires (L243): the TTL is the staleness contract (L140) — how stale may this data be (L140)? The prompt cache's TTL (L171) by the content's freshness (L140); the data's TTL (L244) by the profile's volatility (L244).
- **The invalidation (L244).** On a write (L244), the affected cache entries are deleted (L244) — the next read is fresh (L244). The invalidation is the write path's half of the strategy (L244).
- **The AI kinds (L171, L244).** The prompts and the responses (L171): the exact-repeat generations (L171) — TTL'd by the freshness (L140). The data (L244): the sessions (L237), the profiles (L244) — TTL'd or invalidated on the writes (L244).

> [!NOTE]
> **The TTL and the invalidation are the two freshness levers (L140, L244).** The TTL (L140) handles the slow-changing data: the data expires by design, and the staleness is the accepted contract (L140). The invalidation (L244) handles the write-driven data: the write kills the stale entry, and the next read is fresh (L244). The senior design chooses by the data's nature (L244): the TTL for the slow-changing — the profiles, the reference data (L244); the invalidation for the write-driven — the user's data, the quotas (L149). A strategy that uses only the TTL serves stale data after a write (L140); a strategy that uses only the invalidation misses the expiry's safety (L244).

## 5. Real Project Usage

- **The response cache (L171).** The exact-repeat generations (L171) cached in Redis (L244) — TTL'd by the content's freshness (L140).
- **The session cache (L237).** The sessions (L237) in Redis (L243) with the TTL (L243) — the fast lookups (L151).
- **The profile cache (L244).** The tenant's profile (L357) cached (L244) — invalidated on the profile's update (L244).
- **The prompt cache (L171).** The byte-stable prompts (L142) — the provider's prompt cache (L171) with the stable prefix (L171).
- **Anything hot (L260).** The caching strategy (L244) is the L260 platform's fast-data design (L260) — the TTL and the invalidation by the data (L244).

The through-line: **the strategy follows the data** — the cache-aside reads, the TTL for the slow-changing, the invalidation for the write-driven (L244).

## 6. Interview Explanation

Say it in four moves:

1. **The pattern.** "Cache-aside: check the cache, then the source (L244)."
2. **The TTL.** "The staleness contract (L140) — how stale may this be (L140)?"
3. **The invalidation.** "The write kills the stale entry (L244) — the next read is fresh (L244)."
4. **The kinds.** "The prompts and the responses (L171) + the data (L244) — the strategy by the freshness (L140)."

## 7. Senior-Level Insights

- **The pattern is the read path (L244).** The senior answer uses the cache-aside (L244) as the default — the check, the miss, the source, the write (L244).
- **The TTL is a contract, not a default (L140).** The senior answer sets each TTL (L140) by the data's accepted staleness (L140) — the freshness is a product decision (L140).
- **The invalidation is the write path (L244).** The senior answer invalidates on the writes (L244) — the user's data is fresh after the update (L244).
- **The stampede is the cache's failure (L244).** The miss storm (L244) — the cache thundering (L244) — the senior design uses the single-flight or the early refresh (L244).
- **The two kinds are cached differently (L171, L244).** The prompts and the responses (L171) by the exact-repeat and the freshness (L140); the data (L244) by the TTL or the invalidation (L244).

## 8. Common Mistakes

- **The cache forever (L244).** No TTL (L140), no invalidation (L244) — the stale data served (L140).
- **The TTL-only (L244).** The write-driven data expiring on the TTL, not the write (L244) — the stale-after-write (L140).
- **The invalidation-only (L244).** No expiry's safety (L140) — the forgotten entries live forever (L244).
- **The cache-aside with the stampede (L244).** The miss storm (L244) — the single-flight (L244) missing.
- **The wrong kind's strategy (L171).** The response cache without the freshness (L140) — the stale generations (L171).
- **The cache as the truth (L243).** The stale source of truth (L259) — the cache's role forgotten (L243).

## 9. Best Practices

- **Use the cache-aside as the default** (L244) — the check, the miss, the source, the write (L244).
- **Set the TTL by the staleness contract** (L140) — the accepted staleness per data (L244).
- **Invalidate on the writes** (L244) — the affected entries deleted (L244).
- **Prevent the stampede** (L244) — the single-flight or the early refresh (L244).
- **Cache the two kinds differently** (L171, L244) — the prompts by the freshness (L140), the data by the writes (L244).
- **Remember the cache's role** (L243) — the fast layer, not the truth (L259).

## 10. Interview Questions

**Q: What's the cache-aside pattern?**
> A: The read path's default (L244). The app checks the cache (L243): on the hit, return (L244); on the miss, read the source (L115) and write the cache (L244). The next read is a hit (L244). The pattern is simple and correct — the cache is a fast layer in front of the source (L244).

**Q: TTL or invalidation?**
> A: The data's nature decides (L244). The TTL (L140) for the slow-changing data — the profiles, the reference data: it expires by design, and the TTL is the accepted staleness contract (L140). The invalidation (L244) for the write-driven data — the user's data, the quotas (L149): the write kills the stale entry, and the next read is fresh (L244). The senior design uses both, by the data (L244).

**Q: How do you cache the AI responses?**
> A: The L171 discipline (L171). The exact-repeat generations are cached (L171) — keyed by the request (L171) with the TTL by the content's freshness (L140). The byte-stable prompts (L142) hit the provider's prompt cache (L171). The response cache is the cost and the latency lever (L150, L151) — but the freshness contract (L140) governs what's cached (L171).

**Q: What's the cache stampede?**
> A: The miss storm (L244). The entry expires, and every concurrent request misses and hits the source at once (L244) — the database or the model pounded (L244). The senior fixes: the single-flight — one request refreshes, the others wait (L244); or the early refresh — the entry is refreshed before it expires (L244). The stampede is the cache-aside's failure mode (L244).

## 11. Follow-Up Questions

- What's the cache-aside flow (L244)?
- How do you set the TTLs (L140)?
- How does the invalidation work (L244)?
- What's the stampede (L244)?
- How do the two AI kinds cache differently (L171)?

## 12. Comparison Table — The Freshness Levers

| | TTL (L140) | Invalidation (L244) |
|---|---|---|
| Handles | the slow-changing (L244) | the write-driven (L244) |
| Mechanism | expires by design (L140) | the write deletes (L244) |
| The contract | the accepted staleness (L140) | the next read is fresh (L244) |
| The cost | the stale window (L140) | the write's deletion (L244) |
| The fit (L244) | profiles, reference data | user data, quotas (L149) |

The senior read: **the columns are the levers** — the TTL for the slow, the invalidation for the written (L244).

## 13. Code Example — The Strategy

```js
// Caching strategies: cache-aside + TTL + invalidation (L244).
// 1 · THE CACHE-ASIDE READ (L244) — check, miss, source, write (L243).
async function cacheAside(key, fetch, ttl) {
  const hit = await redis.get(key);                  // the check (L243)
  if (hit) return JSON.parse(hit);                   // the hit (L244)

  const value = await fetch();                       // the miss → the source (L115)
  await redis.set(key, JSON.stringify(value), { EX: ttl });  // the pin + the date (L140)
  return value;
}

// 2 · THE INVALIDATION (L244) — the write kills the stale entries (L140).
async function updateProfile(tenantId, patch) {
  await db.updateProfile(tenantId, patch);           // the write (L115)
  await redis.del(`profile:${tenantId}`);            // the invalidation (L244)
  await redis.del(`config:${tenantId}`);             // the affected entries (L244)
}

// 3 · THE AI RESPONSE CACHE (L171) — by the freshness (L140).
const answer = await cacheAside(
  `resp:${hash(prompt)}`,                            // the exact-repeat key (L171)
  () => streamText({ … }),                           // the miss → the model (L171)
  ttlFor(prompt),                                    // the freshness contract (L140)
);
```

```text
What the reader must SEE — the board's three rules:

  cacheAside(key, fetch, ttl) → check, pin with a date (L244, L140)
  redis.del on the write      → pull the stale (L244)
  ttlFor(prompt)              → the freshness by the content (L140)

  The bulletin board — checked first, pinned with a date, pulled on change.
```

```narrate
4-8: The cache-aside read — the check, the miss, the source, the write with the TTL (L244, L140).
10-13: The invalidation — the write deletes the affected entries, so the next read is fresh (L244).
15-19: The AI response cache — the exact-repeat key (L171) with the TTL by the freshness (L140).
```

> [!TIP]
> The pair that makes the strategy complete: **`EX: ttl`** (the pin with a date, L140) and **`redis.del(...)` on the write** (the pull on change, L244). **The TTL and the invalidation together — the slow-changing expires, the write-driven refreshes (L244).**

## 14. Performance Notes

- **The cache read is the latency lever (L151).** The sub-millisecond hit (L243) — the source skipped (L244).
- **The TTL is the memory's bound (L150).** The expiry (L243) keeps the cache's memory bounded (L150) — the TTLs are the governor (L243).
- **The invalidation is the freshness's cost (L244).** The deletion (L244) — cheap, and the next read's cache-miss (L244).
- **The stampede guard is the reliability (L244).** The single-flight (L244) — the source protected (L244).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Stale data | No TTL or invalidation (L140) | The freshness levers (L244) |
| Stale after a write | No invalidation (L244) | The write's deletion (L244) |
| The source pounded | The stampede (L244) | The single-flight (L244) |
| The memory grows | No TTLs (L243) | The expiry (L150) |
| Stale generations | The response cache's TTL (L140) | The freshness by content (L171) |

## 16. Quick Revision Notes

- The strategies = **how the cache is used** (L244): cache-aside, TTL, invalidation.
- The pattern: **check, miss, source, write** (L244).
- The TTL: **the staleness contract** (L140).
- The invalidation: **the write kills the stale** (L244).
- The two kinds: **the prompts (L171) and the data (L244)** — by the freshness (L140).
- The stampede: **the miss storm (L244)** — the single-flight (L244).

## 17. Cheat Sheet

```text
CACHING STRATEGIES = how the cache is used — the bulletin board

THE PATTERN (L244)
  cache-aside  the check (L243) → the hit returns (L244)
               → the miss reads the source (L115) → the write (L244)

THE FRESHNESS LEVERS (L140, L244)
  TTL           the slow-changing — expires by design (L140)
                the TTL is the accepted staleness contract (L140)
  invalidation  the write-driven — the write deletes the stale (L244)
                the next read is fresh (L244)
  use both, by the data (L244)

THE TWO KINDS (L171, L244)
  the prompts and the responses (L171) — the exact-repeat (L171),
                TTL'd by the content's freshness (L140)
  the data (L244) — the sessions (L237), the profiles (L244),
                TTL'd or invalidated on the writes (L244)

THE FAILURE (L244)
  the stampede — the miss storm (L244)
  the single-flight (L244) or the early refresh (L244)

THE RULE (L243)
  the cache is the fast layer, not the truth (L259)

INTERVIEW, 4 MOVES
  1 pattern  "cache-aside: check, miss, source, write (L244)"
  2 TTL      "the staleness contract (L140)"
  3 invalidation "the write kills the stale (L244)"
  4 kinds    "the prompts (L171) and the data (L244)"
```

## 18. Key Takeaways

> [!RECAP]
> - Caching strategies are **how the cache is used** (L244): the cache-aside pattern (L244), the TTL (L140), and the invalidation (L244)
> - **The cache-aside is the read path's default** (L244): check the cache (L243), return on the hit, read the source (L115) and write the cache on the miss (L244)
> - **The TTL is the staleness contract** (L140) — the accepted staleness per data (L244); **the invalidation is the write path** (L244) — the write deletes the affected entries, and the next read is fresh (L244)
> - **The two AI kinds are cached differently** (L171, L244): the prompts and the responses (L171) by the exact-repeat and the freshness (L140), and the data (L244) by the TTL or the invalidation (L244)
> - **The stampede is the cache-aside's failure** (L244) — prevented with the single-flight or the early refresh (L244)
> - The cache is **the fast layer, not the truth** (L243, L259) — the strategy is what keeps the fast layer honest (L244)

## Check your understanding

Answer these without looking back.

1. What's the cache-aside flow (L244)?
2. What's the TTL's role (L140)?
3. What's the invalidation's role (L244)?
4. When do you use each lever (L244)?
5. How do the AI responses cache (L171)?
6. What's the stampede (L244)?
7. How does the single-flight fix it (L244)?
8. Why is the cache not the truth (L259)?

## A Closing Note — The Bulletin Board, Kept Honest

You now hold the strategies: **the cache-aside check, the TTL as the staleness contract, the invalidation on the writes, and the stampede's guard — the prompts and the data, cached by their freshness.** The fast layer now stays fast *and* honest (L244).

Next: the courier queue — message queues & DLQs (L245), async work, ordering, and the dead-letter catcher.
