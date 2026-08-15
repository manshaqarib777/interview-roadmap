# Module 12 — Backend & Distributed Systems for AI

## Why this module comes twelfth

Modules 7–11 built the AI product: the model decision (M18), the app (M19), the knowledge (M20), the loop (M21), and the automation (M22). Every one of them runs on a **backend** — and this module is that backend. The AI product's backend is the API architecture (L233), the gateway (L236), the auth (L237–241), the rate limits (L242), the cache and Redis (L243–244), the queues (L245–249), the streaming transport (L250–251), and the distributed-systems discipline — idempotency (L255), retries (L256), circuit breakers (L257), and graceful degradation (L258) — that keeps it alive.

The distinction this module is built on: a **demo** has a server that calls the model. A **backend architect** has a platform: the gateway that guards (L236), the auth that identifies (L237–241), the Redis that coordinates (L243), the queues that absorb (L245–249), the streams that deliver (L251), and the fault tolerance that survives (L256–258). The model is the easiest part of the backend — this module is the rest (L260).

## Module map

- **M23 · Backend & Distributed Systems (L233–260)** — the platform under the product.
  The API shape (L233–235), the gateway (L236), auth and authorization (L237–241), rate limiting (L242), Redis and caching (L243–244), queues and events (L245–249), the streaming transports (L250–251), the service shapes (L252–254), and the distributed-systems discipline (L255–258) — then the synthesis (L260) that assembles one coherent AI backend.

## How to study each lesson

1. **Follow one request through the module.** A streaming chat request (L251) enters the gateway (L236), gets authenticated (L237), rate-limited (L242), checked against the budget (L149), cached (L244), and streamed back — with the whole path traced (L213). The module is that path, taught layer by layer.
2. **Learn the discipline vocabulary.** Idempotency (L255), retries (L256), circuit breakers (L257), and degradation (L258) are the distributed-systems vocabulary (L259) every senior backend question uses. Learn the names with their mechanisms.
3. **Apply the earlier modules.** The gateway (L236) wraps the L172 security baseline; the cache (L244) is the L171 lever; the queues (L245) are the L222 engine room; the streaming (L251) is the L145 transport. This module is the infrastructure under everything before it.
4. **Build the synthesis at the end (L260).** The final lesson assembles the whole: gateway, auth, queues, caching, streaming — one coherent backend for an AI SaaS. Draw it, defend it, and M23 is claimed.

## Prerequisites

Module 8 (L158–173) — the AI app floor plan (L173) and the security baseline (L172). Module 11 (L217–232) — the automation platform's queues (L222) and gates (L228). Module 6 (L105–134) — the Laravel request lifecycle (L106), auth (L122), and queues (L124). You also need working REST (L92) and general web knowledge.

## Next

→ [Lesson 233 — API Architecture for AI Products](./233-api-architecture.md)
