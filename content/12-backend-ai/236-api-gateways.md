# Lesson 236 — API Gateways

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the front door of an AI platform?" — the answer is the *gateway*: auth, rate limiting, routing, caching — the L172 baseline, made operational (L233).**

L233's request flow is this lesson: **API gateways** — the front door of the AI platform: the layer that sits between the clients and the services, enforcing auth (L237), rate limits (L242), routing (L233), and caching (L244) — the L172 security baseline, made operational (L236). The gateway is where the platform's cross-cutting concerns live: every request passes through it, so the concerns are enforced once (L236).

The distinction this lesson is built on: a **demo** scatters auth and limits through the services. A **solutions architect** centralizes them in the gateway (L236): the auth check (L237), the rate limits (L242), the routing (L233), the caching (L244), and the logging (L213) — the front door that guards every request (L236).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the gateway: the front door between clients and services (L236)
- Explain the gateway's concerns: auth, limits, routing, caching (L236)
- Explain the routing: the request to the right service (L233)
- Explain the caching: the gateway's response cache (L244)
- Explain the observability: the gateway's log (L213)

## 1. One-Line Definition

**The API gateway is the front door of the platform — the layer between the clients and the services that enforces auth (L237), rate limits (L242), routing (L233), and caching (L244), and logs every request (L213) — the L172 security baseline made operational, because every request passes through it, so the cross-cutting concerns are enforced once (L236).**

The one-sentence interview answer: *"The gateway is the front door (L236). Every request — from the app, the web, the partners — enters through the gateway before reaching the services (L233). The gateway enforces the cross-cutting concerns once (L236): auth — who's calling (L237); rate limiting — how fast (L242); routing — which service handles it (L233); caching — the repeat responses served without the backend (L244); and logging — every request traced (L213). The L172 baseline — the key server-side (L275), the client untrusted (L172) — is the gateway's job (L236). The front door is where the platform's concerns live: enforced in one place, instead of scattered through the services (L236)."*

## 2. Mental Model

Think of the gateway as **the front desk of a large building.** Every visitor (the request) checks in at the front desk (the gateway, L236) before reaching any office (the services, L233). The front desk: verifies the visitor's badge (auth, L237), notes how often they visit (the rate limit, L242), sends them to the right office (routing, L233), and — if the answer's already available — gives it without the office visit (caching, L244). Every visit is logged (L213). The building works because the front desk guards the entrance — the offices don't each run their own security (L236).

```text
   the visitors (the clients)         the front desk (the gateway, L236)
   ┌──────────────────────┐           ┌──────────────────────────────┐
   │ app · web · partners │  ──────►  │ auth (L237) · rate limit     │
   └──────────────────────┘           │ (L242) · routing (L233)      │
                                      │ · cache (L244) · log (L213)  │
                                      └──────────────┬───────────────┘
                                                     ▼
                                      the offices (the services, L233)
```

The mental model is **the front desk**: the badge check, the pace note, the routing, and the cached answers — every visitor through one guarded door (L236).

## 3. Visual Flow — One Request Through the Gateway

```text
   a request arrives (L236)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · AUTH (L237)                                          │
   │     who's calling? — the badge check (L237)              │
   │     reject the unauthenticated (L172)                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · RATE LIMIT (L242)                                    │
   │     how fast? — the pace note (L242)                     │
   │     over → 429 (L170)                                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · CACHE (L244)                                         │
   │     the repeat? → served from the cache (L244)           │
   │     a miss → continue to the routing (L244)              │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4 · ROUTE + LOG (L233, L213)                             │
   │     the request to the right service (L233)              │
   │     every request logged (L213)                          │
   └──────────────────────────────────────────────────────────┘
```

The flow is the front desk: **auth → rate limit → cache → route + log** — the cross-cutting concerns, enforced once (L236).

## 4. How It Works — The Concerns

- **Auth (L237).** The gateway authenticates every request (L237): the API key, the token (L240), the session (L237) — and rejects the unauthenticated (L172). The services trust the gateway's auth (L236).
- **Rate limiting (L242).** The gateway enforces the pace (L242): per user, per tenant, per key (L242) — the over-limit returns 429 (L170). The rate limit is the platform's abuse control (L318).
- **Routing (L233).** The gateway routes the request to the right service (L233): the chat service, the generation service, the data service (L233) — the front desk sends the visitor to the right office (L236).
- **Caching (L244).** The gateway serves the repeat responses from the cache (L244): the exact-repeat requests (L171) never reach the backend (L244) — the cache is the latency and cost lever (L150).
- **Logging (L213).** The gateway logs every request (L213): who, what, when, the cost (L332) — the platform's observability starts at the door (L236).

> [!NOTE]
> **The gateway is the L172 baseline, made operational (L236).** L172 said: the key stays server-side (L275), every call goes through the gateway, and the client is untrusted (L172). The API gateway (L236) is that baseline in infrastructure: the auth at the door (L237), the budgets (L149) and the limits (L242) enforced, the key server-side (L275), and the log (L213) as the audit (L322). The gateway is not an option for the AI platform — it's the L172 discipline, operationalized (L236).

## 5. Real Project Usage

- **The AI platform (L260).** The gateway (L236) in front of the chat (L233), generation, and data services — the auth (L237), the limits (L242), the cache (L244), the log (L213).
- **The multi-tenant SaaS (L357).** The gateway enforces the per-tenant limits (L242) and the tenant isolation (L320) — the front door knows the tenant (L236).
- **The serverless stack (L283).** The API Gateway (L267) in front of the Lambda functions (L266) — the L236 pattern, AWS-shaped (L283).
- **The partner API (L237).** The partners' keys (L237) authenticated and rate-limited at the gateway (L242) — the partner API's front door (L236).
- **Anything with an API (L260).** The gateway is the platform's front door (L236) — the concerns enforced once (L236).

The through-line: **the gateway is the front door** — the auth, the limits, the routing, the cache, and the log, enforced in one place (L236).

## 6. Interview Explanation

Say it in four moves:

1. **The front door.** "Every request enters through the gateway (L236) before the services (L233)."
2. **The concerns.** "Auth (L237), rate limits (L242), routing (L233), caching (L244), logging (L213)."
3. **The enforcement.** "Enforced once, at the door — not scattered through the services (L236)."
4. **The baseline.** "The L172 discipline — the key server-side (L275), the client untrusted — operationalized (L236)."

## 7. Senior-Level Insights

- **The gateway is the cross-cutting concerns' home (L236).** The senior answer centralizes what every request needs (L236): the auth (L237), the limits (L242), the cache (L244), the log (L213) — one place, enforced once (L236).
- **The gateway is the trust boundary (L172).** The L172 baseline (L172) is the gateway's job (L236): the client untrusted (L172), the key server-side (L275), the services trusting the gateway's auth (L236).
- **The cache at the door is the economics (L244).** The exact-repeat responses served without the backend (L244) — the L171 lever (L171) at the platform's scale (L150).
- **The gateway is the observability's start (L213).** The log at the door (L213) — who, what, when, cost (L332) — is the audit's (L322) beginning (L236).
- **The gateway composes with the services (L233).** The routing (L233) to the chat and generation services (L233) — the L260 platform's spine (L260).

## 8. Common Mistakes

- **No gateway (L236).** The concerns scattered (L172) — the auth in every service (L237), the limits nowhere (L242).
- **The gateway as a thin proxy (L236).** Only routing (L233), no auth (L237), no limits (L242) — the front door unlocked (L236).
- **The key at the edge (L275).** The provider keys exposed at the gateway (L172) — the server-side rule (L275) broken.
- **No caching at the door (L244).** The repeats hitting the backend (L244) — the L171 lever unused (L150).
- **No logging (L213).** The door with no record (L322) — the observability (L332) missing.
- **The gateway as a bottleneck (L151).** The slow front desk (L236) — the gateway's own latency (L151) eating the budget (L145).

## 9. Best Practices

- **Put every request through the gateway** (L236) — the front door for all (L233).
- **Enforce the auth at the door** (L237) — the services trust the gateway (L236).
- **Enforce the limits at the door** (L242) — per user, per tenant (L170).
- **Cache the repeats at the door** (L244) — the L171 lever (L150).
- **Log everything at the door** (L213) — the observability's start (L332).
- **Keep the gateway fast** (L151) — Redis (L243) for the checks (L236).

## 10. Interview Questions

**Q: What's an API gateway?**
> A: The front door of the platform (L236). Every request enters through it before reaching the services (L233). The gateway enforces the cross-cutting concerns once: auth (L237), rate limits (L242), routing (L233), caching (L244), and logging (L213). The L172 baseline — the key server-side (L275), the client untrusted (L172) — is the gateway's job (L236).

**Q: Why centralize in the gateway?**
> A: Because every request passes through it (L236). Auth (L237), limits (L242), caching (L244), and logging (L213) are needed by every service (L233) — enforced at the door, they're written once (L236). Scattered through the services, they drift and get skipped (L172). The gateway is the cross-cutting concerns' home (L236).

**Q: What does the gateway do for an AI platform?**
> A: The same front door, AI-aware (L236): the auth (L237) and the per-tenant limits (L242) guard the chat (L233) and generation endpoints; the cache (L244) serves the exact-repeat requests (L171) without the model call (L150); the routing (L233) sends each request to the right service; and the log (L213) records the tokens and the cost (L332). The gateway is where the platform's concerns live (L236).

**Q: How is the gateway the L172 baseline?**
> A: L172 said: the key stays server-side (L275), every call goes through the gateway, and the client is untrusted (L172). The API gateway (L236) is that baseline in infrastructure: the auth at the door (L237), the budgets (L149) and the limits (L242), the key server-side (L275), and the log (L213) as the audit (L322). The gateway operationalizes the L172 discipline (L236).

## 11. Follow-Up Questions

- What are the gateway's concerns (L236)?
- Why centralize (L236)?
- How does the gateway cache (L244)?
- How does the gateway enforce the tenant limits (L242)?
- How is the gateway the L172 baseline (L236)?

## 12. Comparison Table — No Gateway vs Gateway

| | No gateway (L172) | Gateway (this lesson) |
|---|---|---|
| Auth (L237) | per service | at the door, once |
| Limits (L242) | nowhere | per user/tenant |
| Cache (L244) | none | the repeats at the door |
| Routing (L233) | the client knows | the front desk routes |
| Log (L213) | scattered | the door's record |
| The L172 baseline | aspirational | operational (L236) |

The senior read: **the right column is the front door** — the concerns enforced once, the baseline operational (L236).

## 13. Code Example — The Gateway

```js
// The gateway: auth → rate limit → cache → route + log (L236).
export async function gateway(req) {
  // 1 · AUTH (L237) — who's calling? The services trust this (L236).
  const session = await authenticate(req);                   // the token, the key (L240)
  if (!session) return error(401);                           // L172

  // 2 · RATE LIMIT (L242) — how fast? Per user, per tenant (L170).
  const limit = await rateLimit(session.tenant, session.user);   // Redis (L243)
  if (!limit.ok) return error(429, { retryAfter: limit.retryAfter });  // L170

  // 3 · CACHE (L244) — the repeat? Served without the backend (L171).
  const cached = await cache.get(cacheKey(req));
  if (cached) return cached;                                 // the L171 hit (L244)

  // 4 · ROUTE (L233) — the request to the right service (L236).
  const service = route(req.url);                            // chat · generate · data (L233)
  const response = await service.handle(session, req);

  // 5 · LOG (L213) — the door's record (L332).
  await log({ user: session.user, path: req.url, tokens: response.usage, at: Date.now() });
  return response;
}
```

```text
What the reader must SEE — the front desk:

  authenticate()   → the badge check (L237)
  rateLimit()      → the pace note (L242)
  cache.get()      → the repeat served at the door (L244)
  route()          → the right office (L233)
  log()            → the door's record (L213)

  Every visitor through the front desk — enforced once (L236).
```

```narrate
4-6: Auth — the badge check at the door (L237); the services trust it (L236).
8-10: The rate limit — the pace note per user and tenant (L242), the 429 on the over-limit (L170).
12-14: The cache — the exact repeat served without the backend (L244, L171).
16-18: The routing — the request to the right service (L233).
20-22: The log — the door's record of who, what, and the cost (L213, L332).
```

> [!TIP]
> The trio that makes it the front door: **`authenticate()`** (L237), **`rateLimit()`** (L242), and **`cache.get()`** (L244). **The badge, the pace, and the repeat — enforced at the door, once (L236).**

## 14. Performance Notes

- **The gateway is the latency budget (L151).** The auth (L237) and the limit checks (L242) must be fast — Redis (L243), not the database (L236).
- **The cache at the door is the cost lever (L150).** The repeats (L244) skip the model (L171) — the L150 savings at the platform's scale (L236).
- **The gateway is the observability's start (L213).** The log (L213) with the tokens and the cost (L332) — the audit's (L322) beginning (L236).
- **The gateway must not be the bottleneck (L151).** The front desk's own latency (L151) — kept sub-millisecond (L236).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Unauthenticated calls | No auth at the door (L237) | The gateway's auth step (L236) |
| The API is hammered | No limits (L242) | The rate limit at the door (L170) |
| Repeats hit the backend | No cache (L244) | The gateway's cache (L171) |
| No audit | No log (L213) | The door's record (L322) |
| Slow gateway | The checks hit the DB (L151) | Redis (L243) |

## 16. Quick Revision Notes

- The gateway = **the front door** (L236): every request through it (L233).
- The concerns: **auth (L237), limits (L242), routing (L233), caching (L244), logging (L213)**.
- The enforcement: **once, at the door** (L236).
- The baseline: **the L172 discipline, operational** (L236).
- The cache: **the repeats at the door** (L244) — the L171 lever (L150).
- The log: **the observability's start** (L213, L332).

## 17. Cheat Sheet

```text
API GATEWAYS = the front door of the platform

THE CONCERNS (L236)
  auth       who's calling — the badge (L237), the services trust it (L236)
  rate limit how fast — per user, per tenant (L242), 429 (L170)
  routing    the request to the right service (L233)
  caching    the repeats served at the door (L244) — the L171 lever (L150)
  logging    who, what, when, cost (L213, L332) — the audit (L322)

THE ENFORCEMENT (L236)
  every request passes through the door (L233)
  the concerns written once, at the door (L236)
  scattered concerns drift and get skipped (L172)

THE BASELINE (L236)
  the L172 discipline, operational:
  the key server-side (L275) · the client untrusted (L172)
  the auth, the budgets (L149), the limits (L242), the log (L213)

THE PERFORMANCE (L151)
  the checks in Redis (L243), not the database (L236)
  the front desk sub-millisecond (L151)

INTERVIEW, 4 MOVES
  1 door    "every request through the gateway (L236)"
  2 concerns "auth, limits, routing, caching, logging (L236)"
  3 once    "enforced at the door, not scattered (L236)"
  4 baseline "the L172 discipline, operational (L236)"
```

## 18. Key Takeaways

> [!RECAP]
> - The API gateway is **the front door of the platform** (L236): every request enters through it before reaching the services (L233)
> - **The cross-cutting concerns live at the door** (L236): auth (L237), rate limits (L242), routing (L233), caching (L244), and logging (L213) — enforced once, not scattered (L236)
> - **The gateway is the L172 baseline, operational** (L236): the key server-side (L275), the client untrusted (L172), the budgets (L149) and the limits (L242) enforced at the door
> - **The cache at the door is the economics** (L244): the exact-repeat requests (L171) served without the model call (L150)
> - **The log at the door is the observability's start** (L213): who, what, when, and the cost (L332) — the audit's beginning (L322)
> - The gateway composes with the services (L233) to form **the L260 platform's spine** (L260) — the front door that guards every request (L236)

## Check your understanding

Answer these without looking back.

1. What are the gateway's five concerns (L236)?
2. Why centralize at the door (L236)?
3. How does the gateway cache (L244)?
4. How does the gateway enforce the tenant limits (L242)?
5. How is the gateway the L172 baseline (L236)?
6. Why must the gateway be fast (L151)?
7. What does the door's log record (L213)?
8. How does the gateway route (L233)?

## A Closing Note — The Front Desk, Guarded

You now hold the front door: **the auth badge, the pace notes, the cached repeats, the routing to the right office, and the log of every visitor.** The platform now has a front desk — and the L172 baseline is operational (L236).

Next: who's at the door — authentication (L237), sessions, tokens, and keys.
