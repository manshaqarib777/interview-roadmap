# Lesson 378 — AI Platform Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "the internal platform: shared services, guardrails, and self-service" — the answer is *the platform*: the shared services, the guardrails, and the self-service (L378).**

L356 built the automation and L373 the governance; this lesson is **the internal product**: the AI platform architecture — the internal platform: the shared services, the guardrails, and the self-service (L378): the services (the shared, L378), the guardrails (the governance, L373), and the self-service (the teams, L378). The AI shape (L173): the enterprise (L380) — the platform (L378) the teams (L378) build on (L378). This lesson is the internal platform (L378).

The distinction this lesson is built on: a **junior** builds the app. A **solutions architect** builds the platform (L378): the shared services (L378), the guardrails (L373), and the self-service (L378) — because the platform (L378) is the enterprise's (L380) multiplier (L378).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the services: the shared (L378)
- Explain the guardrails: the governance (L373)
- Explain the self-service: the teams (L378)
- Explain the golden path: the paved (L378)
- Explain the AI shape: the internal platform (L378)

## 1. One-Line Definition

**The AI platform architecture is the internal platform — the shared services, the guardrails, and the self-service (L378) — the services (the shared: the model access L278, the RAG L349, the observability L346, L378), the guardrails (the governance L373: the policies L373, the reviews L373, the audit L322, L378), and the self-service (the teams L378: the paved road L378, the golden path L378, L378) — the enterprise's (L380) multiplier (L378).**

The one-sentence interview answer: *"The AI platform is the internal product (L378). The services (L378): the shared (L378) — the model access (L278): the one gateway (L267) with the routing (L155); the RAG (L349): the shared knowledge (L349) with the isolation (L320); and the observability (L346): the one standard (L346) with the cost (L334). The guardrails (L373): the governance (L373) — the policies (L373): the use (L373) and the evals (L341); the reviews (L373): the pre-deploy (L373); and the audit (L322): the record (L322). The self-service (L378): the teams (L378) — the paved road (L378): the golden path (L378) — the template (L378) with the guardrails (L373) built in (L378): the team (L378) builds the app (L173) fast (L378) and safe (L373). The AI shape (L173): the enterprise (L380) — the platform (L378): the shared services (L378), the guardrails (L373), and the self-service (L378) — the multiplier (L378), built (L378)."*

## 2. Mental Model

Think of the AI platform as **the city's public utilities.** The city (the enterprise, L380) provides the utilities (the platform, L378): the power (the model access, L278) — the one grid (L267) with the tiers (L365); the water (the RAG, L349) — the shared (L349) with the per-district (L320) pipes (L320); and the inspection (the observability, L346) — the one standard (L346). The building codes (the guardrails, L373) — the permits (the reviews, L373) and the records (the audit, L322). And the builders (the teams, L378) — the standard plots (the golden path, L378) with the utilities (L378) and the codes (L373) ready (L378). The city works because the utilities are shared, the codes are enforced, and the builders build fast (L378).

```text
   the utilities (the platform, L378)
   ┌────────────────────────────────────────────────────────┐
   │ the power (the model, L278) · the water (the RAG, L349)│
   │ the inspection (the observability, L346)               │
   │ the codes (the guardrails, L373) · the plots (the      │
   │ golden path, L378)                                     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the utilities**: the power, the codes, and the plots (L378).

## 3. Visual Flow — One Team's Build

```text
   the team (L378)
        │  the golden path (L378)
        ▼
   ┌────────────────────── THE PLATFORM (L378) ─────────────────────────┐
   │  the model access (L278): the gateway (L267) + the routing (L155) │
   │  the RAG (L349): the shared knowledge (L349) + the isolation      │
   │  (L320)                                                           │
   │  the observability (L346): the standard (L346) + the cost (L334)  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE GUARDRAILS (L373) ───────────────────────┐
   │  the policies (L373) · the reviews (L373) · the audit (L322)      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE APP (L173) ──────────────────────────────┐
   │  the team's (L378) product (L173) — fast (L378) and safe (L373)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the build: **team → platform → guardrails → app** (L378).

## 4. How It Works — The Platform, Part by Part

- **The services (L378).** The shared (L378): the model access (L278), the RAG (L349), the observability (L346).
- **The guardrails (L373).** The governance (L373): the policies (L373), the reviews (L373), the audit (L322).
- **The self-service (L378).** The teams (L378): the paved road (L378), the golden path (L378).
- **The golden path (L378).** The template (L378) with the guardrails (L373) built in (L378).

> [!NOTE]
> **The golden path is the platform's product (L378).** The senior answer builds the golden path (L378): the paved road (L378) — the template (L378): the model access (L278) wired (L378), the RAG (L349) connected (L378), the observability (L346) on (L378), and the guardrails (L373) built in (L378) — the team (L378) fills in the app (L173) (L378). The golden path (L378) — the fast (L378) and the safe (L373) — is the platform's (L378) value (L378): the teams (L378) don't reinvent (L378) the L260 backend (L260).

## 5. Real Project Usage

- **An enterprise engagement (L379).** The platform (L378) — the case study's (L379) foundation (L378).
- **A multi-team enterprise (L380).** The shared services (L378) — the teams (L378) build on (L378).
- **A model gateway (L267).** The one access (L278) with the routing (L155) — the shared (L378).
- **A knowledge platform (L349).** The shared RAG (L349) with the isolation (L320).
- **Anything enterprise (L380).** The multiplier (L378) — the services, the guardrails, the self-service (L378).

The through-line: **the multiplier is the platform's** — the services, the guardrails, and the self-service (L378).

## 6. Interview Explanation

Say it in four moves:

1. **The services.** "The model access (L278), the RAG (L349), the observability (L346)."
2. **The guardrails.** "The policies (L373), the reviews (L373), the audit (L322)."
3. **The self-service.** "The teams (L378) — the golden path (L378)."
4. **The golden path.** "The paved road — the template with the guardrails built in (L378)."

## 7. Senior-Level Insights

- **The shared services are the leverage (L378).** The model access (L278) and the RAG (L349) — once (L378) — the teams (L378) build on (L378).
- **The guardrails are the governance's (L373).** The policies (L373) and the reviews (L373) — the platform (L378) enforces (L378) — the L373 rulebook (L373), platform-shaped (L378).
- **The golden path is the speed (L378).** The template (L378) — the team (L378) ships (L307) fast (L378) — the paved road (L378).
- **The isolation is the tenants' (L320).** The shared RAG (L349) — the per-tenant (L320) — the L320 wall (L320), platform-shaped (L378).
- **The observability is the standard's (L346).** The one standard (L346) — the cost (L334) and the evals (L341) per team (L378).

## 8. Common Mistakes

- **The app, not the platform (L378).** The one app (L173) built (L378) — the teams (L378) reinvent (L378) — the platform (L378) is the multiplier (L378).
- **The un-guarded self-service (L373).** The golden path (L378) without the policies (L373) — the unsafe (L325) apps (L378) — the guardrails (L373) built in (L378).
- **The shared without the isolation (L320).** The one RAG (L349) — the cross-tenant (L320) — the per-tenant (L320) wall (L378).
- **The un-observed platform (L346).** The teams (L378) without the standard (L346) — the cost (L334) and the evals (L341) per team (L378).
- **The golden path too narrow (L378).** The template (L378) for the one shape (L378) — the teams (L378) diverge (L378) — the paths (L378) for the shapes (L348–358).

## 9. Best Practices

- **Share the services** (L378) — the model access (L278), the RAG (L349), the observability (L346).
- **Build in the guardrails** (L373) — the policies (L373) and the reviews (L373).
- **Pave the golden path** (L378) — the template (L378) with the guardrails (L373).
- **Isolate the tenants** (L320) — the shared (L349) with the wall (L320).
- **Standardize the observability** (L346) — the cost (L334) and the evals (L341) per team (L378).

## 10. Interview Questions

**Q: Walk me through the AI platform architecture.**
> A: The internal product (L378). The services — the model access (L278), the RAG (L349), the observability (L346). The guardrails — the policies (L373), the reviews (L373), the audit (L322). The self-service — the teams (L378). And the golden path — the paved road (L378).

**Q: What are the shared services?**
> A: Three (L378): the model access (L278) — the one gateway (L267) with the routing (L155) and the tiers (L365); the RAG (L349) — the shared knowledge (L349) with the isolation (L320); and the observability (L346) — the one standard (L346) with the cost (L334). The services (L378) once (L378), the teams (L378) build on (L378).

**Q: What's the golden path?**
> A: The paved road (L378): the template (L378) — the model access (L278) wired, the RAG (L349) connected, the observability (L346) on, and the guardrails (L373) built in (L378) — the team (L378) fills in the app (L173) (L378). The golden path (L378) is the fast (L378) and the safe (L373) (L378).

**Q: How do the guardrails work?**
> A: The platform's (L378) governance (L373): the policies (L373) — the use (L373) and the evals (L341); the reviews (L373) — the pre-deploy (L373); and the audit (L322) — the record (L322). The golden path (L378) has them (L373) built in (L378) — the team (L378) can't skip (L378) the safe (L373) defaults (L378).

## 11. Follow-Up Questions

- What are the shared services (L378)?
- What's the golden path (L378)?
- How do the guardrails work (L373)?
- What's the self-service (L378)?
- What's the isolation (L320)?

## 12. Comparison Table — The App vs the Platform

| | The app (L173) | The platform (L378) |
|---|---|---|
| The model (L278) | the per-app (L378) | the shared gateway (L267) |
| The RAG (L349) | the per-app (L378) | the shared knowledge (L349) |
| The guardrails (L373) | the per-app (L378) | the built-in (L378) |
| The leverage (L378) | the one (L173) | the many (L378) |

The senior read: **the platform is the multiplier** — the services and the guardrails, once (L378).

## 13. Code Example — The Platform, Built

```js
// The AI platform (L378) — the services, the guardrails, the path (L378).
// 1 · THE SHARED SERVICES (L378) — the one gateway (L267).
const platform = {
  modelAccess: {                    // the model (L278)
    gateway: 'shared-api-gateway',  // the one door (L267)
    routing: 'tiered',              // the tiers (L155, L365)
    provisioned: true,              // the steady (L278)
  },
  rag: {                            // the knowledge (L349)
    shared: true,                   // the one platform (L349)
    isolation: 'per-tenant',        // the wall (L320)
  },
  observability: {                  // the standard (L346)
    otel: true,                     // the OTel (L346)
    costPerTeam: true,              // the attribution (L334)
  },
};

// 2 · THE GUARDRAILS (L373) — the governance (L378).
const guardrails = {
  policies: { use: 'allowed', evals: 'bar' },   // L373
  review: 'pre-deploy',                          // L373
  audit: 'append-only',                          // L322
};

// 3 · THE GOLDEN PATH (L378) — the paved road (L378).
async function scaffold(team, appType) {
  // the template (L378): the gateway (L267), the RAG (L349),
  // the observability (L346) — wired (L378)
  const app = await template.clone(appType);     // the shapes (L348-358)
  await wireModelAccess(app, platform.modelAccess);   // L278
  await connectRag(app, platform.rag);                 // L349
  await enableObservability(app, platform.observability); // L346
  await attachGuardrails(app, guardrails);             // L373
  return app;                                     // the team's (L378) app (L173)
}
```

```text
What the reader must SEE — the platform, built:

  the shared gateway + tiers   → the model access (L278, L155)
  the shared RAG + isolation   → the knowledge (L349, L320)
  the OTel + the per-team cost → the observability (L346, L334)
  the policies + the audit     → the guardrails (L373)
  the template scaffold        → the golden path (L378)

  The services, the guardrails, the self-service (L378).
```

```narrate
4-17: The shared services — the gateway, the RAG, and the observability (L378).
19-24: The guardrails — the policies, the review, and the audit (L373).
26-32: The golden path — the template scaffolded with everything wired (L378).
```

> [!TIP]
> The pair that defines the platform: **the shared gateway** (the services, L267) and **the scaffolded template** (the golden path, L378). **Share the services, build in the guardrails, pave the golden path, isolate the tenants — the enterprise's multiplier (L378).**

## 14. Performance Notes

- **The shared services are the cost's (L378).** The one gateway (L267) — the provisioned (L278) — the L285 economics (L285) (L378).
- **The golden path is the team's speed (L378).** The template (L378) — the ship (L307) fast (L378).
- **The guardrails are the risk's (L373).** The built-in (L378) — the unsafe (L325) apps (L378) prevented (L378).
- **The observability is the standard's (L346).** The one (L346) — the per-team (L378) cost (L334) and the evals (L341).

## 15. Debugging Scenarios

| Symptom | First check (L378) | The lever |
|---|---|---|
| The teams reinvent | The platform (L378) | The golden path (L378) |
| The apps are unsafe | The guardrails (L373) | The built-in (L378) |
| The tenants mix | The isolation (L320) | The per-tenant wall (L320) |
| The cost is unattributed | The observability (L346) | The per-team (L334) |
| The paths diverge | The golden path (L378) | The shapes (L348–358) |

## 16. Quick Revision Notes

- The AI platform = **the enterprise's multiplier** (L378): the services, the guardrails, the self-service.
- The services: **the model access (L278), the RAG (L349), the observability (L346)**.
- The guardrails: **the policies (L373), the reviews (L373), the audit (L322)**.
- The self-service: **the teams (L378) — the golden path (L378)**.
- The golden path: **the paved road — the template with the guardrails built in (L378)**.

## 17. Cheat Sheet

```text
AI PLATFORM ARCHITECTURE = the internal platform

THE SERVICES (L378)
  the model access (L278) — the one gateway (L267), the routing (L155)
  the RAG (L349) — the shared knowledge (L349), the isolation (L320)
  the observability (L346) — the one standard (L346), the cost (L334)

THE GUARDRAILS (L373)
  the policies (L373) — the use (L373), the evals (L341)
  the reviews (L373) — the pre-deploy (L373)
  the audit (L322) — the record (L322)

THE SELF-SERVICE (L378)
  the teams (L378) — the golden path (L378)
  the paved road (L378) — the template (L378)
  with the guardrails (L373) built in (L378)

THE GOLDEN PATH (L378)
  the model access (L278) wired · the RAG (L349) connected
  the observability (L346) on · the guardrails (L373) built in
  the team (L378) fills in the app (L173)

INTERVIEW, 4 MOVES
  1 services  "the model, the RAG, the observability (L378)"
  2 guardrails "the policies, the reviews, the audit (L378)"
  3 self-service "the teams, the golden path (L378)"
  4 golden path "the paved road (L378)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI platform architecture is **the internal platform — the shared services, the guardrails, and the self-service** (L378): the services (L378), the guardrails (L373), the self-service (L378), and the golden path (L378)
> - **The services** (L378): the shared (L378) — the model access (L278), the RAG (L349), and the observability (L346)
> - **The guardrails** (L373): the governance (L373) — the policies (L373), the reviews (L373), and the audit (L322)
> - **The self-service** (L378): the teams (L378) — the paved road (L378)
> - **The golden path** (L378): the template (L378) — the model access (L278) wired, the RAG (L349) connected, the observability (L346) on, and the guardrails (L373) built in (L378)
> - The principle (L378): the platform (L378) is the enterprise's (L380) multiplier (L378) — the services (L378) once, the teams (L378) build on (L378), fast (L378) and safe (L373)

## Check your understanding

Answer these without looking back.

1. What are the shared services (L378)?
2. What's the golden path (L378)?
3. How do the guardrails work (L373)?
4. What's the self-service (L378)?
5. What's the isolation (L320)?
6. What's the paved road (L378)?
7. What's the multiplier (L378)?
8. What is the internal platform (L378)?

## A Closing Note — The Utilities, Run

You now hold the platform: **the services, the guardrails, and the golden path — with the power shared and the plots paved.** The city's utilities are running — and the builders build fast (L378).

Next: the full requirement-to-architecture walkthrough — Enterprise AI Case Study (L379).
