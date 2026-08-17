# Lesson 300 — Environment Management

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do the dev, staging, and prod differ?" — the answer is *the environments*: the ladder, the variables, and how AI config differs from app config (L300).**

L296 ran the conveyor and L299 the Terraform; this lesson is **the ladder it climbs**: the environment management — the environments (the dev, the staging, the production, L300), the variables (the per-environment values, L300), and the AI config (the models, the keys, and the feature flags, L300). The AI stack's shape (L287): the one code (L298) with the variables (L300) — the dev's mock model (L300), the staging's real Bedrock (L278) with the test keys (L300), and the production's real keys (L275). This lesson is the ladder's rungs (L300).

The distinction this lesson is built on: a **demo** has one environment. A **solutions architect** designs the ladder (L300): the environments (L300), the variables (L300), and the AI config (L300) — because the L307 pipeline (L307) climbs the ladder (L300).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the environments: the dev, the staging, the production (L300)
- Explain the variables: the per-environment values (L300)
- Explain the parity: the same code, the different values (L300)
- Explain the AI config: the models, the keys, the flags (L300)
- Explain the AI shape: the ladder's rungs (L300)

## 1. One-Line Definition

**The environment management is the ladder the pipeline climbs (L300) — the environments (the dev L300, the staging L300, the production L302: each a rung with its purpose, L300), the variables (the per-environment values: the URLs, the regions, the model IDs, L300), and the parity (the same code L298 with the different values, L300) — with the AI config (the model choice L148, the keys L275, and the feature flags, L300) differing from the app config (L300).**

The one-sentence interview answer: *"The environments are the ladder the pipeline climbs (L300). The rungs (L300): the dev (L300) — the developers' rung: the fast iterations (L300), the mock model (L300) or the real (L300), the disposable data (L300); the staging (L300) — the rehearsal rung: the production-like (L300) with the test keys (L300), the dry run of the deploy (L296); the production (L302) — the users' rung: the real keys (L275), the canary (L303), the rollback (L304) (L300). The variables (L300): the per-environment values (L300) — the URLs, the regions, the model IDs (L300) — the one code (L298) with the different variables (L300). The parity (L300): the same code (L298) up the ladder (L300) — the staging (L300) catches what the dev (L300) missed (L300), and the production (L302) gets what the staging (L300) rehearsed (L300). The AI config (L300): the model's choice (L148) per environment (L300) — the dev's cheap model (L157), the production's frontier (L148); the keys (L275) from the secrets manager (L275); and the feature flags (L300) for the gradual rollouts (L303). The AI config (L300) is the app config's (L300) plus the model and the keys (L300)."*

## 2. Mental Model

Think of the environments as **the theater's rehearsal ladder.** The ladder (L300) has the rungs (L300): the script readings (the dev, L300) — the actors (the developers, L300) try the lines (L300) fast, with the understudies (the mocks, L300); the dress rehearsal (the staging, L300) — the full set (the production-like, L300), the real lights (the services, L300), the stage manager (the pipeline, L296) checking everything (L300); and the opening night (the production, L302) — the real show (L300) for the audience (the users, L302). The playbook (the code, L298) is the same (L300); only the details change (the variables, L300): the understudies (the dev's mocks, L300), the rehearsal props (the staging's test keys, L300), the real props (the production's keys, L275). The ladder works because every rung rehearses (L300), and the same playbook climbs (L300).

```text
   the ladder (the environments, L300)
   ┌────────────────────────────────────────────────────────┐
   │ the readings (the dev, L300) — the fast iterations,    │
   │ the mocks (L300)                                       │
   │ the dress rehearsal (the staging, L300) — the          │
   │ production-like (L300)                                 │
   │ the opening night (the production, L302) — the users   │
   │ (L302)                                                 │
   │ the playbook (the code, L298) — the same, the details  │
   │ (the variables, L300) differ (L300)                    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the ladder**: the readings, the dress rehearsal, and the opening night (L300).

## 3. Visual Flow — One Release Up the Ladder

```text
   the merge (L296)
        │
        ▼
   ┌────────────────────── THE DEV (L300) ──────────────────────────────┐
   │  the developers (L300) · the fast iterations (L300)               │
   │  the mock model (L300) or the cheap (L157) · the disposable data  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼  the pipeline (L296)
   ┌────────────────────── THE STAGING (L300) ──────────────────────────┐
   │  the production-like (L300) · the test keys (L300)                │
   │  the dry run (L296): the deploy (L302) + the smoke tests (L296)   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼  the gate (L296)
   ┌────────────────────── THE PRODUCTION (L302) ───────────────────────┐
   │  the real keys (L275) · the canary (L303) · the rollback (L304)   │
   └──────────────────────────────────────────────────────────────────┘
      THE ONE CODE (L298) — the variables (L300) up the ladder (L300)
```

The flow is the release: **dev → staging → production**, the one code with the variables (L300).

## 4. How It Works — The Ladder, Part by Part

- **The environments (L300).** The rungs (L300): the dev (L300) — the developers' fast iterations (L300); the staging (L300) — the production-like rehearsal (L300); the production (L302) — the users' (L300).
- **The variables (L300).** The per-environment values (L300): the URLs, the regions, the model IDs (L300) — the one code (L298) with the different variables (L300).
- **The parity (L300).** The same code (L298) up the ladder (L300): the staging (L300) catches what the dev (L300) missed (L300), and the production (L302) gets what the staging (L300) rehearsed (L300).
- **The AI config (L300).** The model's choice (L148) per environment (L300): the dev's cheap model (L157), the production's frontier (L148); the keys (L275) from the secrets manager (L275); the feature flags (L300) for the gradual rollouts (L303).

> [!NOTE]
> **The parity is the code's, not the data's (L300).** The senior answer is precise (L300): the *code* (L298) and the *shape* (L300) are the same up the ladder (L300) — the same containers (L288), the same services (L295), the same Terraform (L299) with the variables (L300). The *data* (L300) differs by design (L300): the dev's disposable data (L300), the staging's synthetic data (L300), the production's real (L300). The parity (L300) catches the integration bugs (L290); the data's difference (L300) protects the users' (L313).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The ladder (L300): the dev (L300), the staging (L300), the production (L302) — the one code (L298) with the variables (L300).
- **A RAG platform (L280).** The staging's Knowledge Bases (L280) with the test documents (L300), the production's real (L265).
- **A model rollout (L365).** The new model (L148) in the dev (L300), the evals (L341) in the staging (L300), the canary (L303) in the production (L302).
- **A multi-tenant SaaS (L357).** The feature flags (L300) — the beta tenants (L303) first (L300).
- **Anything shipped (L307).** The pipeline (L307) climbs the ladder (L300) — the one code, the variables (L300).

The through-line: **the ladder is the release's path** — the dev's speed, the staging's rehearsal, the production's safety (L300).

## 6. Interview Explanation

Say it in four moves:

1. **The rungs.** "The dev, the staging, the production (L300)."
2. **The variables.** "The per-environment values — the one code (L300)."
3. **The parity.** "The same code up the ladder (L300)."
4. **The AI config.** "The model (L148), the keys (L275), the flags (L300)."

## 7. Senior-Level Insights

- **The ladder is the risk's graduation (L300).** The dev (L300) catches the code's bugs (L300), the staging (L300) the integration's (L290), the production (L302) the users' (L300) — each rung (L300) catches what the last missed (L300).
- **The parity is the code's (L300).** The same containers (L288) and the Terraform (L299) with the variables (L300) — the staging's (L300) rehearsal is the production's (L302) truth (L300).
- **The AI config is the model's ladder (L300).** The dev's cheap model (L157), the staging's real Bedrock (L278), the production's frontier (L148) — the model's choice (L148) per rung (L300).
- **The keys are the secrets manager's (L275).** The keys (L275) per environment (L300) — the secrets manager (L275), never the code (L301).
- **The flags are the rollout's control (L300).** The feature flags (L300) — the gradual rollouts (L303) and the instant off (L304) — the L303 canary (L303), flag-shaped (L300).

## 8. Common Mistakes

- **The one environment (L300).** The dev-only (L300) — the staging's (L300) rehearsal skipped, the production (L302) surprised (L300).
- **The drift between the rungs (L298).** The dev and the production (L300) from the different code (L298) — the parity (L300) lost (L300).
- **The keys in the code (L301).** The per-env keys in the repo (L301) — the secrets manager (L275) is the home (L300).
- **The production model in the dev (L157).** The frontier model (L148) in the dev (L300) — the cost (L285) without the need (L300); the cheap model (L157) is the dev's (L300).
- **The prod-like staging (L300).** The staging's shape (L300) diverged from the production (L302) — the rehearsal (L300) lies (L300).

## 9. Best Practices

- **Climb the ladder** (L300) — the dev, the staging, the production (L300).
- **One code, the variables** (L300) — the parity (L300).
- **Secrets per environment** (L275) — the secrets manager (L275).
- **Models per rung** (L300) — the dev's cheap (L157), the prod's frontier (L148).
- **Flags for the rollouts** (L300) — the gradual (L303), the instant off (L304).

## 10. Interview Questions

**Q: Walk me through the environments.**
> A: The ladder (L300). The dev — the fast iterations, the mocks (L300). The staging — the production-like rehearsal (L300). The production — the users', with the canary (L303) and the rollback (L304) (L300). The one code (L298) with the variables (L300) up the ladder (L300).

**Q: What's the parity?**
> A: The code's (L300): the same containers (L288), the same services (L295), and the same Terraform (L299) — with the variables (L300) — up the ladder (L300). The staging (L300) catches what the dev (L300) missed, and the production (L302) gets what the staging (L300) rehearsed (L300). The data (L300) differs by design (L300).

**Q: How does the AI config differ from the app config?**
> A: The app config (L300) is the URLs and the regions (L300). The AI config (L300) adds the model (L148) — the dev's cheap (L157), the production's frontier (L148) — and the keys (L275) — from the secrets manager (L275) per environment (L300). The feature flags (L300) control the rollouts (L303).

**Q: How do you roll out a new model?**
> A: Up the ladder (L300): the new model (L148) in the dev (L300), the evals (L341) in the staging (L300), and the canary (L303) in the production (L302) — the flag (L300) or the traffic weight (L303) controls the rollout (L303), and the rollback (L304) is the instant off (L304).

## 11. Follow-Up Questions

- What are the rungs (L300)?
- What's the parity (L300)?
- What are the variables (L300)?
- How does the AI config differ (L300)?
- How do you roll out a model (L303)?

## 12. Comparison Table — The Rungs

| | The dev (L300) | The staging (L300) | The production (L302) |
|---|---|---|---|
| The purpose (L300) | the iteration (L300) | the rehearsal (L300) | the users (L302) |
| The model (L148) | the cheap (L157) | the real Bedrock (L278) | the frontier (L148) |
| The keys (L275) | the mocks (L300) | the test keys (L300) | the real (L275) |
| The data (L300) | the disposable (L300) | the synthetic (L300) | the real (L313) |
| The deploy (L302) | the auto (L296) | the dry run (L296) | the canary (L303) |

The senior read: **the ladder is the risk's graduation** — each rung catches what the last missed (L300).

## 13. Code Example — The Ladder, Declared

```js
// The environments (L300) — the one code, the variables (L300).
// THE VARIABLES (L300) — the per-environment values (L300).
const envs = {
  dev: {
    model: 'amazon.titan-text-lite',       // the cheap (L157)
    database: 'postgres://dev:dev@dev-db/app',  // the disposable (L300)
    mockModel: true,                       // the mock (L300)
  },
  staging: {
    model: 'anthropic.claude-3-5-sonnet',  // the real Bedrock (L278)
    database: 'postgres://staging:...@staging-db/app',  // the synthetic (L300)
    mockModel: false,
  },
  production: {
    model: 'anthropic.claude-3-5-sonnet',  // the frontier (L148)
    database: 'postgres://...@prod-db/app',
    mockModel: false,
  },
};

// THE KEYS (L275) — per environment, in the secrets manager (L275).
//   dev:      /dev/ai/api-key        (the mock key, L300)
//   staging:  /staging/ai/api-key    (the test key, L300)
//   production: /prod/ai/api-key     (the real key, L275)

// THE FLAGS (L300) — the gradual rollouts (L303).
const flags = { newAgent: env === 'production' ? 'canary' : 'on' };
```

```text
What the reader must SEE — the ladder, declared:

  dev: titan-lite + mock      → the iteration (L157, L300)
  staging: claude + synthetic → the rehearsal (L300)
  production: claude + real   → the users (L148, L275)
  the keys per env            → the secrets manager (L275)
  the flags                   → the gradual rollouts (L303)

  The one code, the variables, the ladder (L300).
```

```narrate
4-9: The dev — the cheap model and the mock (L157, L300).
10-15: The staging — the real model against the synthetic data (L300).
16-21: The production — the frontier model with the real data (L148, L300).
23-25: The keys — per environment in the secrets manager (L275).
27-28: The flags — the canary rollout control (L303, L300).
```

> [!TIP]
> The pair that defines the environments: **the one code** (the parity, L298) and **the per-environment model** (the AI config, L148). **One code up the ladder, the model per rung, the keys in the vault — the ladder (L300).**

## 14. Performance Notes

- **The dev is the iteration's speed (L300).** The cheap model (L157) and the mocks (L300) — the feedback (L296) fast (L300).
- **The staging is the rehearsal's fidelity (L300).** The production-like shape (L300) — the dry run (L296) real (L300).
- **The production is the users' latency (L151).** The frontier model (L148) — the TTFT (L145) the users' (L302).
- **The flags are the rollout's speed (L300).** The gradual rollouts (L303) — the instant off (L304) the flag's (L300).

## 15. Debugging Scenarios

| Symptom | First check (L300) | The lever |
|---|---|---|
| It works in the dev, breaks in the prod | The parity (L300) | The same code, the variables (L300) |
| The keys are wrong | The environment (L275) | The per-env secrets (L275) |
| The dev's bill is high | The model (L157) | The dev's cheap model (L157) |
| The staging's test misses | The shape (L300) | The production-like staging (L300) |
| The rollout is all-or-nothing | The flags (L300) | The gradual rollout (L303) |

## 16. Quick Revision Notes

- The environment management = **the ladder** (L300): the dev, the staging, the production.
- The rungs: **the dev (the iteration), the staging (the rehearsal), the production (the users)** (L300).
- The variables: **the per-environment values — the one code** (L300).
- The parity: **the same code (L298) up the ladder (L300)**.
- The AI config: **the model (L148), the keys (L275), the flags (L300)**.

## 17. Cheat Sheet

```text
ENVIRONMENT MANAGEMENT = the ladder the pipeline climbs

THE RUNGS (L300)
  the dev (L300) — the iteration, the mocks (L300)
  the staging (L300) — the production-like rehearsal (L300)
  the production (L302) — the users', the canary (L303), the rollback (L304)

THE VARIABLES (L300)
  the per-environment values (L300)
  the one code (L298) with the different variables (L300)

THE PARITY (L300)
  the same code up the ladder (L300)
  the staging catches what the dev missed (L300)

THE AI CONFIG (L300)
  the model (L148) — the dev's cheap (L157), the prod's frontier (L148)
  the keys (L275) — the secrets manager (L275) per env (L300)
  the flags (L300) — the gradual rollouts (L303)

INTERVIEW, 4 MOVES
  1 rungs    "the dev, the staging, the production (L300)"
  2 variables "the per-env values, the one code (L300)"
  3 parity   "the same code up the ladder (L300)"
  4 AI config "the model, the keys, the flags (L148, L275, L300)"
```

## 18. Key Takeaways

> [!RECAP]
> - The environment management is **the ladder the pipeline climbs** (L300): the environments (L300), the variables (L300), the parity (L300), and the AI config (L300)
> - **The rungs** (L300): the dev (L300) — the fast iterations with the mocks (L300); the staging (L300) — the production-like rehearsal (L300); the production (L302) — the users' (L300)
> - **The variables** (L300) are the per-environment values — the URLs, the regions, the model IDs (L300) — the one code (L298) with the different variables (L300)
> - **The parity** (L300): the same code (L298) up the ladder (L300) — the staging (L300) catches what the dev (L300) missed (L300)
> - **The AI config** (L300): the model's choice (L148) per environment (L300), the keys (L275) from the secrets manager (L275), and the feature flags (L300) for the gradual rollouts (L303)
> - The AI shape (L300): the dev's cheap model (L157), the staging's real Bedrock (L278) with the test keys (L300), and the production's frontier (L148) with the real keys (L275) — the ladder (L300) the L307 pipeline (L307) climbs (L300)

## Check your understanding

Answer these without looking back.

1. What are the rungs (L300)?
2. What's the parity (L300)?
3. What are the variables (L300)?
4. How does the AI config differ (L300)?
5. How do you roll out a model (L303)?
6. Where do the keys live (L275)?
7. What's the dev's model (L157)?
8. What is the ladder (L300)?

## A Closing Note — The Ladder, Climbed

You now hold the ladder: **the dev, the staging, the production — with the one code and the per-rung variables.** The pipeline has its path — and the ladder is climbed (L300).

Next: the one rule — Secrets in CI/CD (L301).
