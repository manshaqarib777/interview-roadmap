# Lesson 252 — Microservices

**Interview importance:** ⭐⭐⭐⭐ — "how do you split an AI platform?" — the answer is *microservices*: splitting by domain and by scale — and the costs of the split (L253).**

L249–251 built the async parts; this lesson is **the service shape**: microservices — splitting the AI platform into independently deployable services (L252): by domain (the chat service, the generation service, the data service — L233) and by scale (the ones that need their own capacity — L252). The costs: the network (L254), the state (L207), the observability (L213), and the complexity (L252).

The distinction this lesson is built on: a **demo** splits everything. A **solutions architect** splits by the seam: the domain boundaries (L252), the scale independence (L252), and the team boundaries (L252) — with the modular monolith (L253) as the sane default (L253).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain microservices: the independently deployable services (L252)
- Explain the split: by domain and by scale (L252)
- Explain the costs: the network, the state, the observability (L254, L207, L213)
- Explain the alternatives: the modular monolith (L253)
- Explain the AI platform's shape: the services and their seams (L252)

## 1. One-Line Definition

**Microservices are the independently deployable services (L252) — the AI platform split by domain (the chat, the generation, the data services, L233) and by scale (the services that need their own capacity, L252), at the cost of the network (L254), the distributed state (L207), and the observability (L213) — with the modular monolith (L253) as the sane default until the split pays (L253).**

The one-sentence interview answer: *"Microservices are the independent services (L252). The platform is split by the seams (L252): by domain — the chat service, the generation service, the data service (L233); and by scale — the service that needs its own capacity gets it (L252); and by team — the independently deployable units (L252). The costs are real (L252): the network — every call is a round trip (L254); the state — the shared data becomes the distributed problem (L207); the observability — the request spans the services (L213, L330); and the complexity — the deployment, the retries (L256), the versioning (L341). The senior default: start with the modular monolith (L253) — the modules with the same domain seams (L253), deployed as one (L253) — and split when the scale or the team demands it (L252). The AI platform's services: the gateway (L236), the chat (L233), the generation (L145), the data (L189) — each split by its seam (L252)."*

## 2. Mental Model

Think of microservices as **the factory's separate buildings.** The factory (the platform, L260) can be one big building (the monolith, L253) or several buildings (the microservices, L252): the engine building (the generation service, L145), the parts building (the data service, L189), the assembly building (the chat service, L233). Each building has its own staff and its own schedule (independently deployable, L252) — a change in the engine building doesn't stop the assembly (L252). But the buildings are connected by roads (the network, L254): every part moved between them is a trip (the round trip, L254), and the inventory (the state, L207) is spread across them (L207). The factory works when the buildings are worth the roads (L252) — and it often starts as one building with departments (the modular monolith, L253).

```text
   the separate buildings (the microservices, L252)
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ the engine   │  │ the parts    │  │ the assembly │
   │ (L145)       │─▶│ (L189)       │─▶│ (L233)       │
   └──────────────┘  └──────────────┘  └──────────────┘
        the roads (the network, L254) — every part a trip (L254)
```

The mental model is **the separate buildings**: the independent schedules, the roads between them, and the spread inventory (L252).

## 3. Visual Flow — The Split Decision

```text
   the platform's shape (L252)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE SEAMS (L252)                                     │
   │     the domain boundaries: chat, generation, data (L233) │
   │     the scale boundaries: who needs its own capacity     │
   │     (L252) · the team boundaries: who deploys alone      │
   │     (L252)                                               │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE DEFAULT (L253)                                   │
   │     the modular monolith (L253) — the same seams, one    │
   │     deployment (L253)                                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE SPLIT (L252)                                     │
   │     when the scale or the team demands it (L252)         │
   │     — the service, the API, the ownership (L254)         │
   └──────────────────────────────────────────────────────────┘
```

The flow is the decision: **the seams → the default → the split** (L252).

## 4. How It Works — The Seams, the Costs, the Default

- **The split (L252).** The services by the seams (L252): the domain (the chat, the generation, the data — L233), the scale (the service that needs its own capacity — L252), and the team (the independently deployable units — L252).
- **The costs (L252).** The network — every call a round trip (L254); the state — the shared data becomes the distributed problem (L207); the observability — the request spans the services (L213, L330); and the complexity — the retries (L256), the versioning (L341), the deployment (L252).
- **The default (L253).** The modular monolith (L253): the same domain seams as modules (L253), deployed as one (L253) — the sanity until the split pays (L253).
- **The AI shape (L252).** The platform's services: the gateway (L236), the chat (L233), the generation (L145), the data (L189) — each split by its seam (L252).

> [!NOTE]
> **The split is a cost decision, not a fashion (L252, L253).** Microservices buy the independent deployment and the scale isolation (L252) — and pay with the network (L254), the distributed state (L207), and the observability (L213). The senior default is the modular monolith (L253): the modules with the domain seams (L253), deployed as one (L253) — the seam without the cost (L253). The split happens when the scale (L252) or the team (L252) genuinely demands it — measured, not assumed (L253).

## 5. Real Project Usage

- **The scale isolation (L252).** The generation service (L145) — the GPU-heavy, bursty service (L252) — split from the data service (L189), scaled independently (L252).
- **The team ownership (L252).** The chat team, the data team (L252) — each owning its service (L252), deploying independently (L252).
- **The third-party boundary (L252).** The integration service (L227) — the isolated failures (L257) — split from the core (L252).
- **The modular monolith (L253).** The start: the modules (L253) — the chat module, the data module (L253) — one deployment (L253).
- **Anything split (L260).** The L260 platform's services (L252) — the seams, the costs, and the default (L253).

The through-line: **the separate buildings** — split by the seams, at the network's and the state's cost, with the modular monolith as the default (L252).

## 6. Interview Explanation

Say it in four moves:

1. **The split.** "By the seams: domain, scale, team (L252)."
2. **The costs.** "The network (L254), the state (L207), the observability (L213)."
3. **The default.** "The modular monolith (L253) — the seams without the split's cost (L253)."
4. **The AI shape.** "The gateway (L236), the chat (L233), the generation (L145), the data (L189) — by their seams (L252)."

## 7. Senior-Level Insights

- **The seam is the split's unit (L252).** The senior answer splits by the domain and the scale seams (L252) — not by the folder structure (L252).
- **The default is the modular monolith (L253).** The senior answer starts modular (L253) — the seams in the code (L253) — and splits when the scale or the team pays (L252).
- **The costs are the contracts (L254).** The network (L254) — the service APIs (L254) become the contracts (L254); the retries (L256) and the versioning (L341) follow (L252).
- **The state is the split's hardest cost (L207).** The shared data (L207) — the distributed transaction (L255) and the eventual consistency (L259) — the split's real price (L252).
- **The observability is the split's requirement (L213).** The request spanning the services (L213) — the distributed trace (L330) — the split demands it (L252).

## 8. Common Mistakes

- **The split by fashion (L252).** Everything micro (L252) — the network (L254) and the state (L207) costs paid for nothing (L253).
- **The seams wrong (L252).** The split across the transaction boundaries (L255) — the distributed transactions (L255) everywhere (L252).
- **The state shared (L207).** The services sharing the database (L207) — the coupling (L252) the split was supposed to end (L252).
- **No observability (L213).** The request spanning the services untraced (L213) — the debugging (L211) impossible (L252).
- **The contracts unversioned (L341).** The services' APIs breaking (L341) — the versioning (L341) missing (L252).
- **The monolith with no seams (L253).** The big ball of mud (L253) — the modular monolith's modules (L253) missing (L253).

## 9. Best Practices

- **Split by the seams** (L252) — the domain, the scale, the team (L252).
- **Start modular** (L253) — the modular monolith (L253), the seams in the code (L253).
- **Define the service contracts** (L254) — the APIs (L254), versioned (L341).
- **Own the state per service** (L207) — the shared database avoided (L252).
- **Trace across the services** (L213) — the distributed trace (L330).
- **Split when it pays** (L252) — the scale or the team's demand, measured (L253).

## 10. Interview Questions

**Q: How do you split an AI platform into microservices?**
> A: By the seams (L252): the domain — the chat service (L233), the generation service (L145), the data service (L189); the scale — the service that needs its own capacity (L252); and the team — the independently deployable units (L252). The costs follow: the network (L254), the distributed state (L207), and the observability (L213).

**Q: Why start with a modular monolith?**
> A: Because the split's costs are real (L253). The modular monolith (L253) has the same domain seams as modules (L253) — the chat module, the data module — deployed as one (L253): no network (L254), no distributed state (L207), one deployment (L253). The split happens when the scale or the team genuinely demands it (L252) — measured, not assumed (L253).

**Q: What's the hardest cost of the split?**
> A: The state (L207). The monolith's shared data (L207) becomes the distributed problem: the distributed transactions (L255) and the eventual consistency (L259). The network (L254) is handled by the retries (L256) and the contracts (L341); the state is the split's real price (L252). The senior design owns the state per service (L207) — the shared database couples what the split was supposed to separate (L252).

**Q: What are the AI platform's seams?**
> A: The natural service boundaries (L252): the gateway (L236) — the front door; the chat service (L233) — the streaming (L251); the generation service (L145) — the heavy, bursty compute (L252); and the data service (L189) — the retrieval and the storage (L183). Each split by its seam (L252), with the modular monolith (L253) as the default until the scale pays for the split (L253).

## 11. Follow-Up Questions

- What are the seams (L252)?
- Why the modular monolith default (L253)?
- What's the hardest cost (L207)?
- How do the service contracts work (L254)?
- How do you trace across the services (L213)?

## 12. Comparison Table — Monolith vs Microservices

| | Modular monolith (L253) | Microservices (this lesson) |
|---|---|---|
| The seams (L252) | modules (L253) | services (L252) |
| The deployment | one (L253) | independent (L252) |
| The network (L254) | none | round trips (L254) |
| The state (L207) | shared in-process | the distributed problem (L207) |
| The observability (L213) | one process | the distributed trace (L330) |
| The fit (L252) | the default | the scale/team demand (L252) |

The senior read: **the columns are the trade** — the seam without the cost vs the seam with the independence (L253).

## 13. Code Example — The Seams

```js
// Microservices: the seams, the contracts, the state ownership (L252, L254).
// THE MODULAR MONOLITH (L253) — the seams as modules, one deployment.
//   modules/chat.service.ts      → the chat module (L233)
//   modules/generation.service.ts → the generation module (L145)
//   modules/data.service.ts      → the data module (L189)

// THE SPLIT (L252) — when the scale demands it (L252):
//   the generation service (L145) — the GPU-heavy, bursty one (L252)
//   → its own deployment, its own capacity (L252)

// THE SERVICE CONTRACT (L254) — the API, versioned (L341).
//   POST /v1/generations  → { prompt, model, stream } (L233, L254)

// THE STATE OWNERSHIP (L207) — each service owns its data (L252).
//   chat.service owns: the conversations (L166)
//   data.service owns: the vector index (L182)
//   generation.service owns: the jobs' state (L249)
//   NO shared database — the coupling the split ends (L252)

// THE OBSERVABILITY (L213) — the distributed trace (L330).
//   the request: gateway → chat → generation → data (L330)
//   one trace ID across the services (L213, L330)
```

```text
What the reader must SEE — the buildings and the roads:

  the modules → the monolith (L253) · the split by the seams (L252)
  the contracts (L254), versioned (L341)
  the state owned per service (L207) — no shared DB (L252)
  the trace across the services (L213, L330)

  Start modular; split when the scale pays; own the state and the trace.
```

```narrate
4-6: The modular monolith — the seams as modules, one deployment (L253).
8-10: The split — the scale-demanding service gets its own deployment (L252).
12-13: The contract — the service API, versioned (L254, L341).
15-19: The state ownership — each service owns its data, no shared database (L207, L252).
21-24: The observability — the distributed trace spanning the services (L213, L330).
```

> [!TIP]
> The line that shows the split's discipline: **`NO shared database`** — the state owned per service (L207). **The buildings are separate because the inventory is separate — the shared DB is the coupling the split was supposed to end (L252).**

## 14. Performance Notes

- **The network is the latency (L151).** Every call a round trip (L254) — the service-to-service latency (L151) added to the request (L252).
- **The state is the consistency (L259).** The distributed data (L207) — the eventual consistency (L259) and the idempotency (L255) follow (L252).
- **The observability is the requirement (L213).** The distributed trace (L330) — the split's debugging and the audit (L322) (L252).
- **The scale isolation is the win (L252).** The bursty generation service (L145) scaled alone (L252) — the data service unaffected (L252).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The request is slow | The network hops (L254) | The service calls (L252) |
| The data inconsistent | The shared database (L207) | The state ownership (L252) |
| The failure is opaque | No distributed trace (L213) | The trace ID (L330) |
| The deployments couple | The contracts unversioned (L341) | The versioning (L341) |
| The split pays nothing | No real seams (L252) | The domain boundaries (L253) |

## 16. Quick Revision Notes

- Microservices = **the independent services** (L252) — split by the seams (L252).
- The seams: **the domain (L233), the scale (L252), the team (L252)**.
- The costs: **the network (L254), the state (L207), the observability (L213)**.
- The default: **the modular monolith (L253)** — the seams without the split's cost (L253).
- The state: **owned per service** (L207) — no shared database (L252).
- The trace: **the distributed trace (L330)** — the split's requirement (L213).

## 17. Cheat Sheet

```text
MICROSERVICES = the independent services — split by the seams

THE SPLIT (L252)
  the domain   — the chat (L233), the generation (L145), the data (L189)
  the scale    — the service that needs its own capacity (L252)
  the team     — the independently deployable units (L252)

THE COSTS (L252)
  the network   — every call a round trip (L254)
  the state     — the shared data becomes the distributed problem (L207)
  the observability — the request spans the services (L213, L330)
  the complexity — the retries (L256), the versioning (L341)

THE DEFAULT (L253)
  the modular monolith (L253) — the same seams as modules (L253),
  one deployment (L253) — until the split pays (L252)

THE STATE RULE (L207, L252)
  each service owns its data (L207)
  NO shared database — the coupling the split ends (L252)

INTERVIEW, 4 MOVES
  1 seams   "domain, scale, team (L252)"
  2 costs   "the network (L254), the state (L207), the trace (L213)"
  3 default "the modular monolith (L253)"
  4 AI shape "gateway, chat, generation, data — by their seams (L252)"
```

## 18. Key Takeaways

> [!RECAP]
> - Microservices are **the independently deployable services** (L252) — split by the seams: the domain (L233), the scale (L252), and the team (L252)
> - **The costs are real** (L252): the network (L254), the distributed state (L207), the observability (L213), and the complexity — the retries (L256) and the versioning (L341)
> - **The default is the modular monolith** (L253): the same domain seams as modules (L253), deployed as one (L253) — the seam without the split's cost (L253)
> - **The state is the hardest cost** (L207) — each service owns its data (L207), and no shared database couples what the split was supposed to separate (L252)
> - **The observability is the split's requirement** (L213) — the distributed trace (L330) spans the services (L213)
> - The AI platform's services — the gateway (L236), the chat (L233), the generation (L145), the data (L189) — are split by their seams (L252), with the modular monolith as the sane start (L253)

## Check your understanding

Answer these without looking back.

1. What are the seams (L252)?
2. What are the costs of the split (L252)?
3. Why the modular monolith default (L253)?
4. What's the hardest cost (L207)?
5. How do the service contracts work (L254)?
6. Why no shared database (L252)?
7. How do you trace across the services (L213)?
8. When does the split pay (L252)?

## A Closing Note — The Buildings and the Roads

You now hold the service shape: **the seams that split, the costs of the roads, the modular monolith as the default, and the state and the trace owned across the buildings.** The AI platform now has a shape — and the discipline to start with one building (L252).

Next: the default made explicit — modular monoliths (L253), the sane middle between monolith and microservices.
