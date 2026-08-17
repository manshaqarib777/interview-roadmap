# Lesson 296 — CI/CD Fundamentals

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the pipeline every AI service needs?" — the answer is *the CI/CD*: the build, the test, and the deploy — the conveyor (L296).**

L295 ran the container and L307 will assemble the pipeline; this lesson is **the conveyor itself**: the CI/CD fundamentals — the continuous integration (the build and the test on every commit, L296) and the continuous delivery (the deploy to the environments, L296) — the pipeline (L296). The AI service's shape (L173): the image (L289) built and scanned (L293), the tests (L296) run, and the deploy (L302) triggered — on every commit (L296). This lesson is the conveyor of the L307 pipeline (L296).

The distinction this lesson is built on: a **demo** deploys by hand. A **solutions architect** ships through the pipeline (L296): the CI (L296), the CD (L296), and the gates (L296) — because the L307 pipeline (L307) is the CI/CD, assembled (L296).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the CI: the build and the test on every commit (L296)
- Explain the CD: the deploy to the environments (L296)
- Explain the gates: the quality checks (L296)
- Explain the environments: the dev, the staging, the prod (L300)
- Explain the AI shape: the AI service's conveyor (L296)

## 1. One-Line Definition

**The CI/CD fundamentals are the conveyor every AI service needs (L296) — the continuous integration (the CI: the build and the test on every commit — the image L289 built, the tests L296 run, the scans L293 gating, L296) and the continuous delivery (the CD: the deploy to the environments — the staging L300 first, the production L302 after the gate, L296) — the pipeline (L296) the L307 synthesis assembles (L307).**

The one-sentence interview answer: *"The CI/CD is the pipeline that ships the code (L296). The CI — the continuous integration (L296): on every commit (L296), the pipeline builds the image (L289), runs the tests (L296), and scans it (L293) — the integration (L296) verified continuously (L296); the broken build (L296) fails fast (L296). The CD — the continuous delivery (L296): the verified artifact (L296) deploys to the environments (L296) — the staging (L300) first, the production (L302) after the gate (L296). The gates (L296): the quality checks — the tests (L296), the scans (L293), the evals (L341) — the pipeline (L296) stops on the failure (L296). The AI shape (L173): the service (L233) ships through the conveyor (L296) — the image (L289) built and scanned (L293) in the CI (L296), the evals (L341) run, and the deploy (L302) triggered to the ECS (L295) — on every commit (L296). The demo deploys by hand; the pipeline deploys continuously (L296)."*

## 2. Mental Model

Think of the CI/CD as **the factory's conveyor belt with the inspectors.** The belt (the pipeline, L296) carries every new part (the commit, L296) through the stations (L296): the assembly (the build, L289), the testing (the tests, L296), the inspection (the scans, L293) — the inspectors (the gates, L296) stop the belt (L296) on a defect (L296). The passed parts (the artifacts, L289) go to the warehouses (the environments, L300): the staging warehouse (L300) first — the dry run (L296) — and the shipping dock (the production, L302) after the final gate (L296). The belt works because every part is checked (L296), the defects stop the line (L296), and the passed parts ship (L296).

```text
   the belt (the CI/CD, L296)
   ┌────────────────────────────────────────────────────────┐
   │ the stations (L296): the build (L289), the tests (L296)│
   │ the scans (L293) — the gates (L296)                    │
   │ the warehouses (the environments, L300): the staging   │
   │ (L300), the production (L302)                          │
   │ the conveyor (L296) — on every commit (L296)           │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the belt**: the stations, the inspectors, and the warehouses (L296).

## 3. Visual Flow — One Commit Through the Conveyor

```text
   the commit (L296)
        │
        ▼
   ┌────────────────────── THE CI (L296) ───────────────────────────────┐
   │  the build (L289): the image (L289) — the artifact (L289)         │
   │  the tests (L296): the unit + the integration (L296)              │
   │  the scans (L293): the image + the deps (L293)                    │
   │  the gates (L296): the failure → the belt stops (L296)            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE CD (L296) ───────────────────────────────┐
   │  the staging (L300): the deploy (L302) + the smoke test (L296)    │
   │  the gate (L296): the evals (L341), the approval (L208)           │
   │  the production (L302): the canary (L303) + the rollback (L304)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the conveyor: **commit → CI → CD → environments** (L296).

## 4. How It Works — The Conveyor, Part by Part

- **The CI (L296).** The continuous integration (L296): on every commit (L296), the build (L289), the tests (L296), and the scans (L293) run (L296) — the integration (L296) verified continuously (L296).
- **The CD (L296).** The continuous delivery (L296): the verified artifact (L289) deploys to the environments (L296) — the staging (L300) first, the production (L302) after the gate (L296).
- **The gates (L296).** The quality checks (L296): the tests (L296), the scans (L293), the evals (L341) — the pipeline (L296) stops on the failure (L296).
- **The environments (L300).** The dev, the staging, and the production (L300): the dev for the developers (L300), the staging for the dry run (L296), the production for the users (L302).

> [!NOTE]
> **The CI is the speed; the gates are the safety (L296).** The senior answer names both (L296): the CI (L296) makes the feedback fast — the broken build (L296) fails in minutes (L296), not days (L296); the gates (L296) make the shipping safe — the tests (L296), the scans (L293), and the evals (L341) must pass (L296) before the production (L302). The pipeline (L296) is the speed and the safety together (L296).

## 5. Real Project Usage

- **An AI API (L233).** The service (L233) through the conveyor (L296): the image (L289) built and scanned (L293), the tests (L296) run, the deploy (L302) to the ECS (L295).
- **A RAG platform (L280).** The eval gates (L341) in the CI (L296): the retrieval's quality (L195) checked before the deploy (L302).
- **A worker (L249).** The SQS consumer (L270) through the conveyor (L296): the build (L289), the tests (L296), the deploy (L302).
- **A model update (L365).** The new model (L148) as a deployment (L302) — the evals (L341) gate the release (L296).
- **Anything shipped (L307).** The L307 pipeline (L307) is the CI/CD (L296), assembled (L296).

The through-line: **the conveyor is the shipping discipline** — the build, the test, and the deploy on every commit (L296).

## 6. Interview Explanation

Say it in four moves:

1. **The CI.** "The build and the test on every commit (L296)."
2. **The CD.** "The deploy to the environments (L296)."
3. **The gates.** "The tests, the scans, the evals — the pipeline stops on the failure (L296)."
4. **The environments.** "The dev, the staging, the production (L300)."

## 7. Senior-Level Insights

- **The CI is the feedback's speed (L296).** The broken build (L296) fails in minutes (L296) — the developers (L296) fix it while the context is fresh (L296).
- **The gates are the safety (L296).** The tests (L296), the scans (L293), and the evals (L341) — the AI quality (L341) gated like the code's tests (L296).
- **The artifact is the handoff (L289).** The CI's output (L289) — the image (L289) — is the CD's input (L296): the same artifact (L296) from the staging (L300) to the production (L302).
- **The environments are the ladder (L300).** The dev (L300), the staging (L300), the production (L302) — each rung (L296) with its gates (L296).
- **The deploy is the last mile (L302).** The canary (L303) and the rollback (L304) — the L302 strategies (L302) are the CD's (L296).

## 8. Common Mistakes

- **The deploy by hand (L296).** The manual production deploy (L296) — the pipeline (L296) is the automation (L296).
- **The tests skipped (L296).** The un-tested artifact (L296) — the gates (L296) are the safety (L296).
- **The scans missing (L293).** The vulnerable image (L293) shipped (L296) — the scan gate (L293) in the CI (L296).
- **The staging skipped (L300).** The straight-to-production (L296) — the staging (L300) is the dry run (L296).
- **The eval gates absent (L341).** The AI change (L365) un-evaluated (L296) — the L341 evals (L341) gate the AI (L296).

## 9. Best Practices

- **Run the CI on every commit** (L296) — the fast feedback (L296).
- **Gate the artifact** (L296) — the tests (L296), the scans (L293), the evals (L341).
- **Deploy through the ladder** (L300) — the dev, the staging, the production (L296).
- **Ship the same artifact** (L296) — from the CI (L296) to the production (L302).
- **Rehearse the rollback** (L304) — the L304 path (L304) in the CD (L296).

## 10. Interview Questions

**Q: Walk me through the CI/CD.**
> A: The conveyor (L296). The CI — the continuous integration: the build (L289), the tests (L296), and the scans (L293) on every commit (L296). The CD — the continuous delivery: the deploy to the environments (L296). The gates — the quality checks that stop the pipeline (L296).

**Q: What's the difference between the CI and the CD?**
> A: The halves of the conveyor (L296). The CI (L296) verifies the integration — the build (L289), the tests (L296), and the scans (L293) on every commit (L296) — and produces the artifact (L289). The CD (L296) ships the artifact — the deploy to the staging (L300) and the production (L302), through the gates (L296).

**Q: How do the gates work for an AI service?**
> A: Like the tests, plus the AI's own (L296): the unit and the integration tests (L296), the scans (L293), and the evals (L341) — the retrieval's quality (L195), the groundedness (L337) — the pipeline (L296) stops on the failure (L296). The AI change (L365) is gated like the code's change (L296).

**Q: Why the environments?**
> A: The ladder (L300): the dev (L300) for the developers (L300), the staging (L300) for the dry run (L296) — the same artifact (L296) against the production-like services (L300) — and the production (L302) after the gates (L296). Each rung (L296) catches what the last missed (L296).

## 11. Follow-Up Questions

- What's the CI (L296)?
- What's the CD (L296)?
- What are the gates (L296)?
- Why the environments (L300)?
- How do the evals gate (L341)?

## 12. Comparison Table — The Manual vs the Pipeline

| | The manual deploy (L296) | The pipeline (L296) |
|---|---|---|
| The commit (L296) | the manual build (L296) | the CI: build + test + scan (L296) |
| The feedback (L296) | days (L296) | minutes (L296) |
| The environments (L300) | the guess (L296) | the ladder: dev, staging, prod (L300) |
| The gates (L296) | the hope (L296) | the tests, the scans, the evals (L296) |
| The rollback (L304) | the scramble (L296) | the rehearsed path (L304) |

The senior read: **the right column is the shipping discipline** — the conveyor (L296).

## 13. Code Example — The Conveyor, Declared

```yaml
# The conveyor (L296) — the CI/CD stages (L296).
# THE CI (L296) — the build, the test, the scan (L296).
stages:
  - name: build
    run: docker build -t ai-service:$SHA .        # the image (L289)
  - name: test
    run: docker run ai-service:$SHA npm test      # the tests (L296)
  - name: scan
    run: docker scan ai-service:$SHA              # the scans (L293)

# THE CD (L296) — the environments (L300).
  - name: deploy-staging
    run: ecs-deploy --env staging                 # the dry run (L300)
    gate: smoke-tests                             # the gate (L296)
  - name: deploy-production
    run: ecs-deploy --env production --canary 5%  # the canary (L303)
    gate: [evals, approval]                       # the L341 + the L208 (L296)

# THE GATES (L296): the failure → the belt stops (L296).
```

```text
What the reader must SEE — the conveyor, declared:

  build + test + scan      → the CI (L296)
  docker run ... npm test   → the tests (L296)
  docker scan               → the scans (L293)
  staging → production      → the environments (L300)
  canary 5% + evals + approval → the gates (L303, L341, L208)

  The commit in, the verified artifact to the production (L296).
```

```narrate
4-6: The CI's build — the image from the commit (L289, L296).
7-8: The CI's tests — the test suite in the container (L296).
9-10: The CI's scans — the vulnerability checks (L293).
12-14: The CD's staging — the dry run with the smoke tests (L300, L296).
15-17: The CD's production — the canary with the eval and the approval gates (L303, L341, L208).
```

> [!TIP]
> The pair that defines the CI/CD: **the scan gate** (the safety, L293) and **the canary deploy** (the last mile, L303). **Build, test, scan on every commit; canary and gate to the production — the conveyor (L296).**

## 14. Performance Notes

- **The CI is the feedback's speed (L296).** The minutes (L296) — the cache (L289) and the parallel stages (L296) keep it fast (L296).
- **The gates are the release's safety (L296).** The tests (L296) and the scans (L293) — the failure (L296) caught before the production (L302).
- **The environments are the ladder's cost (L300).** The staging (L300) — the production-like (L300) at the fraction of the cost (L285).
- **The canary is the risk's control (L303).** The 5% (L303) — the blast radius (L314) bounded (L296).

## 15. Debugging Scenarios

| Symptom | First check (L296) | The lever |
|---|---|---|
| The build fails | The CI (L296) | The failing stage (L296) |
| The broken code ships | The gates (L296) | The tests (L296) and the scans (L293) |
| The prod breaks, the staging didn't | The parity (L300) | The production-like staging (L300) |
| The deploy is manual | The CD (L296) | The pipeline (L296) |
| The AI regresses | The evals (L341) | The L341 gates (L296) |

## 16. Quick Revision Notes

- The CI/CD = **the conveyor** (L296): the CI, the CD, the gates, the environments.
- The CI: **the build (L289), the test (L296), the scan (L293) on every commit** (L296).
- The CD: **the deploy to the environments (L296) — the staging (L300), the production (L302)**.
- The gates: **the tests, the scans, the evals (L341) — the belt stops on the failure** (L296).
- The environments: **the dev, the staging, the production (L300)**.

## 17. Cheat Sheet

```text
CI/CD FUNDAMENTALS = the conveyor every AI service needs

THE CI (L296)
  the continuous integration (L296) — on every commit (L296)
  the build (L289) · the tests (L296) · the scans (L293)
  the artifact (L289) — the handoff to the CD (L296)

THE CD (L296)
  the continuous delivery (L296) — the deploy (L296)
  the staging (L300) first · the production (L302) after the gate (L296)

THE GATES (L296)
  the tests (L296) · the scans (L293) · the evals (L341)
  the failure → the belt stops (L296)

THE ENVIRONMENTS (L300)
  the dev (L300) · the staging (L300) · the production (L302)
  the same artifact (L296) up the ladder (L300)

THE AI SHAPE (L296)
  the image (L289) built and scanned (L293)
  the evals (L341) gating · the canary (L303) deploying
  the rollback (L304) rehearsed

INTERVIEW, 4 MOVES
  1 CI    "the build, the test, the scan (L296)"
  2 CD    "the deploy through the environments (L296)"
  3 gates "the tests, the scans, the evals (L296)"
  4 ladder "the dev, the staging, the production (L300)"
```

## 18. Key Takeaways

> [!RECAP]
> - The CI/CD fundamentals are **the conveyor every AI service needs** (L296): the CI (L296), the CD (L296), the gates (L296), and the environments (L300)
> - **The CI** (L296) is the continuous integration — the build (L289), the tests (L296), and the scans (L293) on every commit (L296), producing the artifact (L289)
> - **The CD** (L296) is the continuous delivery — the deploy of the verified artifact (L296) to the staging (L300) first, the production (L302) after the gate (L296)
> - **The gates** (L296) are the quality checks — the tests (L296), the scans (L293), and the evals (L341) — the pipeline stops on the failure (L296)
> - **The environments** (L300) are the ladder — the dev (L300), the staging (L300), the production (L302) — the same artifact (L296) up the ladder (L300)
> - The AI shape (L296): the image (L289) built and scanned (L293) in the CI (L296), the evals (L341) gating, and the canary (L303) deploying — the L307 pipeline (L307), stage by stage (L296)

## Check your understanding

Answer these without looking back.

1. What's the CI (L296)?
2. What's the CD (L296)?
3. What are the gates (L296)?
4. Why the environments (L300)?
5. How do the evals gate (L341)?
6. What's the artifact (L289)?
7. Why the staging (L300)?
8. What is the conveyor (L296)?

## A Closing Note — The Belt, Moving

You now hold the conveyor: **the CI, the CD, the gates, and the environments — with the fast feedback and the safe shipping.** The service has its pipeline — and the belt is moving (L296).

Next: the workflow file — GitHub Actions for AI Apps (L297).
