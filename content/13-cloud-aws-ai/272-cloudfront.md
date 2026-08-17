# Lesson 272 — CloudFront

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do the users get the content fast, globally?" — the answer is *CloudFront*: the CDN — the edge locations, the cache, the origins, and the streaming (L272).**

L261 drew the edge; this lesson is **what runs on it**: CloudFront — the CDN: the edge locations (the cache near the users, L261), the cache (the TTL and the invalidation, L244), the origins (the S3 bucket L265, the load balancer L271, the API Gateway L267), and the streaming (the AI responses, L251). The AI platform's shape: the static frontend (L272) and the streamed responses (L251) are served from the edge (L272). This lesson is the CDN in front of the static and the streaming AI apps (L272).

The distinction this lesson is built on: a **demo** serves from one server. A **solutions architect** puts the edge in front (L272): the cache (L272), the origins (L272), and the streaming (L251) — because the user's distance (L151) is the perceived latency (L162).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the edge: the cache locations (L261)
- Explain the cache: the TTL and the invalidation (L244)
- Explain the origins: the S3, the load balancer, the API Gateway (L272)
- Explain the streaming: the AI responses (L251)
- Explain the AI shape: the frontend and the streams at the edge (L272)

## 1. One-Line Definition

**CloudFront is the CDN in front of the static and the streaming AI apps (L272) — the edge locations (the cache near the users, L261), the cache (the TTL and the invalidation, L244), the origins (the S3 bucket L265 for the static, the load balancer L271 and the API Gateway L267 for the dynamic), and the streaming (the AI responses passing through the edge, L251) — the user's distance (L151) as the perceived latency (L162), served from nearby (L272).**

The one-sentence interview answer: *"CloudFront is AWS's CDN (L272). The shape: the edge locations — the cache locations around the world, near the users (L261); the cache — the content stored at the edge with the TTL (L244) and the invalidation when it changes (L272); the origins — the S3 bucket (L265) for the static content, the load balancer (L271) and the API Gateway (L267) for the dynamic (L272). The flow: the user's request hits the nearest edge; the edge serves the cached content (L272) or fetches it from the origin and caches it (L272). The AI shape: the static frontend (the built site in the S3 bucket, L265) is served from the edge (L272); the streamed responses (L251) — the AI tokens (L145) — pass through the edge to the client (L272); and the API (L267) is accelerated through the edge (L272). The senior answer names the layers (L272): the edge for the static and the cacheable, the origin for the dynamic, and the streaming for the AI (L272)."*

## 2. Mental Model

Think of CloudFront as **the neighborhood newsstands.** The newsstand (the edge location, L261) sits near the readers: the popular papers (the static content, L265) are on the shelf (the cache, L272) — the reader grabs one instantly (L151). When a paper isn't on the shelf (the miss, L272), the newsstand fetches it from the publisher (the origin, L272) and shelves a copy (L272) — the next reader finds it (L272). The papers go stale (L272): the publisher recalls the old editions (the invalidation, L272) and the newsstands stock the new (L272). And the live bulletins (the AI streams, L251) are passed through as they arrive (L272) — the reader gets the news the moment it's printed (L145). The system works because the newsstands are near, the shelves are stocked, and the recalls are instant (L272).

```text
   the newsstands (CloudFront, L272)
   ┌────────────────────────────────────────────────────────┐
   │ the shelf (the cache, L272) — the TTL (L244)           │
   │ the publisher (the origin, L272) — the S3 (L265), the  │
   │ load balancer (L271), the API Gateway (L267)           │
   │ the recall (the invalidation, L272)                    │
   │ the bulletins (the streams, L251) — passed through     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the newsstands**: the shelf, the publisher, the recall, and the bulletins (L272).

## 3. Visual Flow — One Request Through the Edge

```text
   the user (L272)
        │
        ▼
   ┌────────────────────── THE EDGE (L261) ────────────────────────────┐
   │  the nearest location (L261)                                      │
   │  the HIT: the cached content serves — instant (L272)             │
   │  the MISS: the origin is fetched and cached (L272)               │
   └──────────────┬──────────────────────────────────┬────────────────┘
                  ▼                                  ▼
   ┌──────────────────────────┐   ┌──────────────────────────────────┐
   │ the static origin (L265) │   │ the dynamic origin (L267, L271)   │
   │ the S3 bucket — the site │   │ the API Gateway / the load        │
   │ (L272)                   │   │ balancer — the API + the streams  │
   └──────────────────────────┘   │ (L251) passing through (L272)     │
                                  └──────────────────────────────────┘
```

The flow is the edge: **request → edge → hit/miss → origin** (L272).

## 4. How It Works — The Edge, Part by Part

- **The edge locations (L261).** The cache locations around the world (L261) — the user's request hits the nearest (L272). The edge is the user's distance to the content (L151).
- **The cache (L244).** The content stored at the edge with the TTL (L244): the static and the cacheable responses (L272). The invalidation (L272) — or the versioned filenames (L272) — clears the stale (L272).
- **The origins (L272).** Where the edge fetches the misses (L272): the S3 bucket (L265) for the static, the load balancer (L271) and the API Gateway (L267) for the dynamic (L272).
- **The streaming (L251).** The AI responses (L145) pass through the edge (L272): the tokens arrive as they're generated (L251), the TTFT (L145) preserved (L272).
- **The security (L272).** The edge is the first layer: the WAF (L325) at the edge (L272), the signed URLs for the private content (L272), the TLS end-to-end (L272).

> [!NOTE]
> **The edge is for the cacheable; the origin is for the rest (L272).** The senior answer splits the traffic (L272): the static frontend (L265) and the cacheable API responses (L244) are served from the edge (L272) — the user's distance (L151) collapses (L272); the dynamic and the personalized (L272) go to the origin (L272); and the AI streams (L251) pass through (L272). The edge is not the origin's replacement (L272) — it's the origin's front (L272).

## 5. Real Project Usage

- **A global frontend (L272).** The built Next.js site (L96) in the S3 bucket (L265), served from the edge (L272) — the global users near the content (L151).
- **A streaming AI app (L251).** The chat responses (L162) passing through the edge (L272) — the TTFT (L145) preserved (L272).
- **An API acceleration (L267).** The API Gateway (L267) behind the edge (L272) — the API responses cached (L244) and accelerated (L272).
- **A media platform (L272).** The images and the video (L272) at the edge (L272) — the heavy assets near the users (L272).
- **Anything global (L272).** The edge (L261) in front (L272) — the user's distance (L151) is the perceived latency (L162).

The through-line: **the edge is the user's proximity** — the static served, the dynamic accelerated, the streams passed through (L272).

## 6. Interview Explanation

Say it in four moves:

1. **The edge.** "The cache locations near the users (L261)."
2. **The cache.** "The content at the edge with the TTL (L244) and the invalidation (L272)."
3. **The origins.** "The S3 (L265) for the static; the load balancer (L271) and the API Gateway (L267) for the dynamic."
4. **The streams.** "The AI responses (L251) pass through — the TTFT (L145) preserved (L272)."

## 7. Senior-Level Insights

- **The edge is the perceived latency (L151).** The static and the cacheable from the edge (L272) — the user's distance (L151) collapses (L272) — the perceived speed (L162) is the edge's (L272).
- **The cache is the origin's load (L244).** The TTL (L244) and the versioned filenames (L272) — the origin's requests (L272) drop with the hit rate (L272).
- **The streaming is the AI UX (L251).** The AI responses (L145) through the edge (L272) — the TTFT (L145) and the perceived latency (L162) preserved (L272).
- **The edge is the security layer (L272).** The WAF (L325) at the edge (L272) — the L325 defense in depth (L325), geographically first (L272).
- **The invalidation is the cache's discipline (L272).** The versioned filenames (L272) beat the invalidation (L272) — the new build, the new names, no cache clearing (L272).

## 8. Common Mistakes

- **The edge for the personalized (L272).** The user-specific responses cached (L272) — the data leakage (L312) across the users (L320).
- **No TTL (L244).** The content cached forever (L272) — the stale site (L272).
- **The origin's load unmanaged (L272).** The misses slamming the origin (L272) — the cache (L244) and the versioning (L272) missing.
- **The streaming buffered (L272).** The AI response (L251) held at the edge (L272) — the TTFT (L145) and the UX (L162) die.
- **The edge without the WAF (L272).** The origin exposed (L272) — the L325 layer (L325) skipped.

## 9. Best Practices

- **Serve the static from the edge** (L272) — the built site (L96) in the S3 (L265).
- **Cache the cacheable** (L244) — the TTL (L244) and the versioned filenames (L272).
- **Stream the AI responses** (L251) — the TTFT (L145) through the edge (L272).
- **Put the WAF at the edge** (L325) — the first security layer (L272).
- **Keep the personalized at the origin** (L272) — the per-user data (L320) never cached (L272).

## 10. Interview Questions

**Q: Walk me through CloudFront.**
> A: The CDN (L272). The edge locations — the cache near the users (L261). The cache — the content at the edge with the TTL (L244) and the invalidation (L272). The origins — the S3 (L265) for the static, the load balancer (L271) and the API Gateway (L267) for the dynamic. And the streaming — the AI responses (L251) pass through (L272).

**Q: How do you serve a global AI frontend?**
> A: From the edge (L272). The built site (L96) goes in the S3 bucket (L265), and CloudFront (L272) serves it from the edge locations (L261) — the global users get the static content from nearby (L151). The API (L267) and the streams (L251) sit behind the same distribution (L272).

**Q: How does streaming work through the edge?**
> A: The edge passes the response through (L272): the API Gateway (L267) streams the tokens (L251), and CloudFront (L272) relays the chunks to the client as they arrive (L272) — the TTFT (L145) is preserved (L272). The edge doesn't buffer the stream (L272).

**Q: What's the cache strategy?**
> A: Cache the cacheable, version the rest (L272). The static and the public responses get the TTL (L244); the new builds use the versioned filenames (L272) so the cache never serves the stale (L272); and the personalized (L320) and the streams (L251) are never cached (L272).

## 11. Follow-Up Questions

- What's the edge (L261)?
- What's the cache (L244)?
- What are the origins (L272)?
- How does the streaming work (L251)?
- What's the cache strategy (L272)?

## 12. Comparison Table — The Edge vs the Origin

| | The edge (CloudFront, L272) | The origin (L272) |
|---|---|---|
| Location (L261) | near the users (L261) | the region (L261) |
| Content (L272) | the static + the cacheable (L244) | the dynamic + the personalized (L320) |
| AI use (L272) | the frontend (L96), the streams (L251) | the API (L267), the model calls (L278) |
| Latency (L151) | the perceived (L162) | the real (L151) |
| Cost (L285) | the edge requests + the data transfer (L285) | the compute + the data (L285) |

The senior read: **the edge is the front; the origin is the truth** — the cacheable at the edge, the rest at the origin (L272).

## 13. Code Example — The Distribution, Declared

```js
// The edge (L272) — the CloudFront distribution, declared (L272).
// THE ORIGINS (L272) — the static and the dynamic (L272).
const distribution = {
  origins: [
    { id: 'static',  domain: 'site-bucket.s3.amazonaws.com' },    // the S3 (L265)
    { id: 'api',     domain: 'api.example.com' },                 // the API (L267)
  ],

  // THE CACHE (L244) — the TTLs and the versioning (L272).
  behaviors: [
    { path: '/_next/*',     origin: 'static', ttl: 31536000 },    // the hashed assets (L272)
    { path: '/api/chat',    origin: 'api',    ttl: 0, stream: true },  // the streams (L251)
    { path: '/*',           origin: 'static', ttl: 3600 },        // the rest (L244)
  ],

  // THE SECURITY (L272) — the WAF at the edge (L325).
  waf: 'ai-waf',                                                 // the first layer (L272)
};

// The flow (L272): the static from the edge (L261), the API to the
// origin (L267), the streams passed through (L251) — and the WAF (L325)
// in front of all of it (L272).
```

```text
What the reader must SEE — the edge, declared:

  s3 bucket origin    → the static frontend (L265, L272)
  api origin          → the dynamic API (L267, L272)
  /_next/* ttl 1y     → the versioned assets (L272)
  /api/chat ttl 0 + stream → the AI streams never buffered (L251)
  waf: ai-waf         → the first security layer (L325, L272)

  The static served, the dynamic proxied, the streams passed (L272).
```

```narrate
3-7: The origins — the S3 bucket for the static and the API for the dynamic (L272).
9-13: The cache — the hashed assets cached for the year, the chat stream never cached (L244, L251).
15-17: The security — the WAF at the edge (L325, L272).
19-21: The flow — the static from the edge, the API to the origin, the streams passed through (L272).
```

> [!TIP]
> The pair that defines CloudFront: **the versioned asset TTL** (the static served forever, L272) and **the never-cached stream** (the AI tokens passed through, L251). **Cache the static, stream the AI, protect the edge (L272).**

## 14. Performance Notes

- **The edge is the perceived latency (L151).** The static from the nearest location (L261) — the round-trip (L151) collapses (L272).
- **The cache is the origin's relief (L244).** The TTL (L244) — the origin's requests (L272) drop with the hit rate (L272).
- **The stream is the TTFT (L145).** The AI tokens (L145) passed through (L272) — the first token's arrival (L145) is the UX (L162).
- **The data transfer is the cost (L285).** The edge's requests and the data transfer (L285) — the CDN's bill (L285) is the traffic's (L272).

## 15. Debugging Scenarios

| Symptom | First check (L272) | The lever |
|---|---|---|
| The site is stale | The cache (L244) | The versioned filenames (L272) |
| The user sees another's data | The cache (L272) | The personalized never cached (L320) |
| The stream stalls | The behavior (L272) | The TTL 0 + the stream (L251) |
| The origin is slammed | The hit rate (L244) | The TTLs (L272) |
| The attacks reach the origin | The WAF (L325) | The WAF at the edge (L272) |

## 16. Quick Revision Notes

- CloudFront = **the CDN** (L272): the edge, the cache, the origins, the streaming.
- The edge: **the cache locations near the users (L261)**.
- The cache: **the TTL (L244) and the versioned filenames (L272)**.
- The origins: **the S3 (L265) for the static; the API (L267) and the load balancer (L271) for the dynamic**.
- The streams: **the AI responses (L251) passed through — the TTFT (L145) preserved**.

## 17. Cheat Sheet

```text
CLOUDFRONT = the CDN in front of the static and the streaming AI apps

THE EDGE (L261)
  the cache locations around the world — near the users (L272)

THE CACHE (L244)
  the TTLs — the static and the cacheable (L272)
  the versioned filenames — the new build, the new names (L272)

THE ORIGINS (L272)
  the S3 bucket (L265) — the static frontend (L96)
  the load balancer (L271) + the API Gateway (L267) — the dynamic

THE STREAMS (L251)
  the AI responses (L145) pass through the edge (L272)
  the TTFT (L145) preserved — never buffered (L272)

THE SECURITY (L272)
  the WAF at the edge (L325) — the first layer (L272)
  the signed URLs for the private content (L272)

INTERVIEW, 4 MOVES
  1 edge    "the cache locations near the users (L261)"
  2 cache   "the TTL + the versioning (L244, L272)"
  3 origins "the S3 static; the API dynamic (L272)"
  4 streams "the AI tokens passed through (L251)"
```

## 18. Key Takeaways

> [!RECAP]
> - CloudFront is **the CDN in front of the static and the streaming AI apps** (L272): the edge (L261), the cache (L244), the origins (L272), and the streaming (L251)
> - **The edge** (L261) is the cache locations near the users — the user's distance (L151) as the perceived latency (L162)
> - **The cache** (L244) is the content at the edge — the TTLs (L244) and the versioned filenames (L272) keeping it fresh
> - **The origins** (L272) are the S3 bucket (L265) for the static, and the load balancer (L271) and the API Gateway (L267) for the dynamic
> - **The streaming** (L251) passes the AI responses through the edge (L272) — the TTFT (L145) preserved, never buffered (L272)
> - The security (L272): the WAF (L325) at the edge — the first layer of the L325 defense in depth (L272)

## Check your understanding

Answer these without looking back.

1. What's the edge (L261)?
2. What's the cache (L244)?
3. What are the origins (L272)?
4. How does the streaming work (L251)?
5. What's the cache strategy (L272)?
6. What's the WAF at the edge (L325)?
7. How do you serve a global AI frontend (L272)?
8. What is the edge's AI shape (L272)?

## A Closing Note — The Newsstands, Stocked

You now hold the CDN: **the edge, the cache, the origins, and the streaming — with the static served from nearby and the AI tokens passed through.** The users have their proximity — and the perceived latency is the edge's (L272).

Next: the DNS, health checks, and the routing — Route 53 (L273).
