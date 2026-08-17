# Lesson 307 — The AI Deployment Pipeline (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of Docker / DevOps: from commit to canary to rollback — the full AI service pipeline (L307).**

This is the last lesson of the Docker / DevOps module — and the synthesis it was built toward. L288–L306 gave you the parts: the container (L288), the recipe (L289), the local stack (L290), the slim build (L291), the network (L292), the security (L293), the registry (L294), the runtime (L295), the conveyor (L296–297), the IaC (L298–299), the environments (L300), the secrets (L301), the strategies (L302–303), the rollback (L304), the observability (L305), and the Kubernetes vocabulary (L306). This lesson **reassembles them into one coherent deployment pipeline for an AI service** — the shape you'd actually ship (L307).

The distinction this lesson is built on: a **specialist** knows the tools. A **solutions architect** assembles them into a whole — and explains why each part sits where it does, what happens when each fails (L304), and how the whole is observed (L305). That assembly is M25's milestone: shipping an AI service through CI/CD with rollbacks (L307).

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L288–L306 into one coherent AI deployment pipeline
- Draw the full flow: commit → build → test → scan → deploy → canary → rollback
- Explain each part's placement by its boundary — the unit, the conveyor, the gate, the safety net
- Describe the AI-specific gates: the evals (L341), the model's canary (L303)
- Defend the architecture in an interview: the parts, the boundaries, the trade-offs (L307)

## 1. One-Line Definition

**The AI deployment pipeline is the module's synthesis — the container (the unit, L288, with the recipe L289 and the slim build L291), the conveyor (the CI L296: the build L289, the test L296, the scan L293; the CD: the deploy L302), the registry and the runtime (the ECR L294, the ECS L295 or the Kubernetes L306), the cloud (the IaC L298–299 with the environments L300), the secrets (the stores L301 with the OIDC L297), the gates (the evals L341 and the canary L303), the safety net (the rollback L304), and the watch (the observability L305) — from the commit to the canary to the rollback, one coherent pipeline (L307).**

The one-sentence interview answer: *"The AI deployment pipeline is the module in one flow (L307). The unit: the container (L288) — the image (L289) built slim (L291), secured (L293), and pushed to the ECR (L294). The conveyor: the CI (L296) — on every commit (L296), the image builds (L289), the tests run (L296), the scans gate (L293); the CD (L296) — the artifact (L289) deploys through the environments (L300): the dev (L300), the staging (L300), the production (L302). The runtime: the ECS (L295) — or the Kubernetes (L306) — runs the service (L233). The cloud: the IaC (L298) — the Terraform (L299) declares the environments (L298) with the variables (L300). The secrets: the OIDC (L297) for the CI's access (L297), the secrets manager (L275) for the runtime's (L301) — the L301 rule (L301) throughout (L301). The gates: the evals (L341) — the AI's tests (L341) — and the canary (L303) — the 5% first (L303), the metrics (L305) watched. The safety net: the rollback (L304) — the switch (L273) or the flag (L300), the instant (L304). And the watch: the observability (L305) — the deploy's (L305) and the model's (L332) metrics (L305). From the commit to the canary to the rollback — the full pipeline (L307)."*

## 2. Mental Model

Think of the deployment pipeline as **the factory the module built.** The product (the container, L288) is assembled from the recipe (L289) — slim (L291), safe (L293) — and boxed at the warehouse (the ECR, L294). The conveyor (the CI/CD, L296) carries every order (the commit, L296) through the stations (L296): the assembly (the build, L289), the inspection (the tests, L296), the security check (the scans, L293), and the quality gate (the evals, L341). The trucks (the CD, L296) deliver to the shops (the environments, L300): the model shop (the dev, L300), the rehearsal shop (the staging, L300), the main store (the production, L302) — with the blueprints (the Terraform, L299) declaring every shop (L298). The main store's launch (the deploy, L302) serves the new product to the few first (the canary, L303) — the reactions (the metrics, L305) watched — and the recall (the rollback, L304) is rehearsed (L304). The factory works because the unit is standard, the conveyor checks, the launch is gradual, and the recall is ready (L307).

```text
   the factory (the pipeline, L307)
   ┌────────────────────────────────────────────────────────┐
   │ the product (the container, L288) — the recipe (L289), │
   │ the slim build (L291), the security (L293)             │
   │ the warehouse (the ECR, L294) · the conveyor (the      │
   │ CI/CD, L296) — the build, the test, the scan, the      │
   │ evals (L341)                                           │
   │ the shops (the environments, L300) — the blueprints    │
   │ (the Terraform, L299)                                  │
   │ the launch (the canary, L303) · the recall (the        │
   │ rollback, L304) · the watch (the observability, L305)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the factory**: the product, the conveyor, the shops, and the recall (L307).

## 3. Visual Flow — The Whole Pipeline, One Diagram

```text
   the commit (L296)
        │
        ▼
   ┌────────────────────── THE CI (L296) ───────────────────────────────┐
   │  the build (L289): the image (L289) — the slim, the safe (L293)   │
   │  the tests (L296) · the scans (L293) · the evals (L341)           │
   │  the push to the ECR (L294) — the pinned tag (L291)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE CD (L296) ───────────────────────────────┐
   │  the dev (L300) → the staging (L300) → the production (L302)      │
   │  the Terraform (L299) declares the environments (L298)            │
   │  the secrets: the OIDC (L297), the vault (L275, L301)             │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DEPLOY (L302) ───────────────────────────┐
   │  the ECS (L295) / the Kubernetes (L306) runs the service (L233)   │
   │  the canary (L303): the 5% → 25% → 100% (L303)                   │
   │  the metrics (L305) watch · the evals (L341) gate                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SAFETY NET (L304) ───────────────────────┐
   │  the rollback (L304): the switch (L273), the flag (L300)          │
   │  the runbook (L304) rehearsed · the observability (L305)          │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the module in one diagram: **commit → CI → CD → deploy → canary → rollback** (L307).

## 4. How It Works — The Assembly, Part by Part

- **The unit (L288–293).** The container (L288): the recipe (L289), the slim build (L291), the network (L292), and the security (L293) — the unit everything ships (L307).
- **The conveyor (L296–297).** The CI (L296): the build (L289), the tests (L296), the scans (L293), and the evals (L341) — on every commit (L296); the CD (L296): the deploy through the environments (L300).
- **The registry and the runtime (L294–295, L306).** The ECR (L294): the image's home (L294); the ECS (L295) or the Kubernetes (L306): the service's run (L307).
- **The cloud (L298–301).** The IaC (L298): the Terraform (L299) declares the environments (L300); the secrets (L301): the OIDC (L297) and the vault (L275) — the L301 rule (L301) throughout (L301).
- **The gates and the safety net (L302–305).** The deploy (L302): the canary (L303) with the metrics (L305) and the evals (L341); the rollback (L304): the switch (L273) or the flag (L300) — the instant (L304).

> [!NOTE]
> **The assembly rule: every part is placed by a boundary (L307).** The container (L288) is the unit — built once, shipped everywhere (L288); the CI (L296) is where the verification lives — the tests (L296), the scans (L293), the evals (L341); the environments (L300) are where the ladder lives — the dev, the staging, the production (L300); the canary (L303) is where the risk lives — the 5% first (L303); and the rollback (L304) is where the safety lives — the instant revert (L304). An architect who can name the boundary for each part can defend the whole assembly (L307) — and M25's milestone is that defense (L307).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The full pipeline (L307): the container (L288), the CI/CD (L296), the ECS (L295), the Terraform (L299), the canary (L303), and the rollback (L304).
- **A model update (L365).** The new model (L148) through the pipeline (L307): the evals (L341) in the CI (L296), the canary (L303) in the production (L302), the rollback (L304) ready (L307).
- **A multi-tenant SaaS (L357).** The per-tenant environments (L300) — the per-tenant canaries (L303) — the L320 isolation (L320), pipeline-shaped (L307).
- **A regulated platform (L371).** The pipeline's audit (L322): the code (L298), the reviews (L298), and the observability (L305) — the compliance (L371) evidence (L307).
- **Anything "production AI" (L307).** The pattern is the shape (L307): the unit, the conveyor, the gates, and the safety net (L307).

The through-line: **the floor plan is the module's output** — every AI service ships through this pipeline, and M25's milestone is building it and defending it (L307).

## 6. Interview Explanation

Say it in four moves:

1. **The assembly.** "The unit (L288), the conveyor (L296), the environments (L300), the gates (L303), the safety net (L304)."
2. **The flow.** "The commit: CI builds, tests, scans, evaluates; CD deploys through the ladder; the canary ships to 5%."
3. **The boundaries.** "The verification in the CI (L296); the risk at the canary (L303); the safety at the rollback (L304)."
4. **The AI's gates.** "The evals (L341) and the model's canary (L303) — the AI's change (L365) gated like the code's (L296)."

## 7. Senior-Level Insights

- **The pipeline is the sum of its boundaries (L307).** A senior review of an AI service's pipeline checks the boundaries first (L307): where's the unit (L288), the verification (L296), the gate (L303), the safety net (L304)? Naming each is the review (L307).
- **The CI is the verification's home (L296).** The tests (L296), the scans (L293), and the evals (L341) — the verification (L296) before the deploy (L302) — the pipeline (L307) stops on the failure (L296).
- **The environments are the risk's ladder (L300).** The dev (L300), the staging (L300), the production (L302) — the risk (L307) graduates (L300) — each rung (L300) catches what the last missed (L300).
- **The canary is the AI's gate (L303).** The model update (L365) — the evals (L341) and the cost (L334) on the 5% (L303) — the regression (L335) caught before the 100% (L303).
- **The rollback is the trust (L304).** The rehearsed revert (L304) — the pipeline (L307) ships because the undo (L304) is ready (L304).
- **The observability is the whole's record (L305).** The deploy's (L305) and the model's (L332) metrics — the debugging (L211), the audit (L322), and the cost (L334) read the same record (L307).

## 8. Common Mistakes

- **The fat image (L291).** The toolchain in the shipped image (L291) — the pull (L288) slow, the surface (L293) wide (L307).
- **The gates skipped (L296).** The deploy without the tests (L296), the scans (L293), or the evals (L341) — the pipeline (L307) unverified (L307).
- **The keys in the repo (L301).** The secrets committed (L301) — the L301 rule (L301) broken (L307).
- **The 100% ship (L303).** The full rollout (L303) without the canary (L303) — the blast radius (L314) the whole (L307).
- **The rollback after the design (L304).** The deploy (L302) without the revert (L304) — the trust (L307) missing (L307).
- **The app-only observability (L305).** The app's metrics (L274) without the deploy's (L305) — the pipeline's health (L305) invisible (L307).

## 9. Best Practices

- **Draw the floor plan first** (L307) — the unit, the conveyor, the environments, the gates, the safety net (L307).
- **Place every part by its boundary** (L307) — the verification in the CI (L296), the risk at the canary (L303), the safety at the rollback (L304).
- **Gate the AI like the code** (L296) — the evals (L341) in the CI (L296).
- **Canary the model** (L303) — the 5% with the metrics (L305) and the cost (L334).
- **Rehearse the rollback** (L304) — the instant revert (L304) ready.
- **Watch the whole** (L305) — the deploy's (L305) and the model's (L332) metrics.
- **Build the milestone** (L307) — assemble it, and defend it with the L288–L306 vocabulary (L307).

## 10. Interview Questions

**Q: Walk me through an AI deployment pipeline.**
> A: Five parts (L307). The unit — the container (L288): the image (L289), slim (L291), secured (L293). The conveyor — the CI/CD (L296): the build (L289), the tests (L296), the scans (L293), the evals (L341), and the deploy through the environments (L300). The runtime — the ECS (L295) or the Kubernetes (L306). The cloud — the Terraform (L299) with the secrets (L301). And the gates and the safety net — the canary (L303) and the rollback (L304).

**Q: How is an AI pipeline different?**
> A: The AI's gates (L307): the evals (L341) in the CI (L296) — the groundedness (L337), the retrieval's quality (L195); the model's canary (L303) — the 5% with the cost (L334) and the TTFT (L333) watched; and the model's rollback (L304) — the previous model (L148), the instant (L304). The code's pipeline (L296) plus the model's (L365) — the AI's change (L365) gated like the code's (L296).

**Q: How do you ship a model update?**
> A: Through the pipeline (L307): the new model (L148) in the dev (L300), the evals (L341) in the CI (L296), the staging (L300) with the golden set (L342), and the production's canary (L303) — the 5% (L303), the metrics (L305) watched, the progression (L303) — with the rollback (L304) to the previous model (L148) ready (L307).

**Q: What makes it production and not a demo?**
> A: The verification, the gates, and the safety net (L307). The CI (L296) verifies — the tests (L296), the scans (L293), the evals (L341); the canary (L303) gates — the 5% first (L303); and the rollback (L304) protects — the rehearsed revert (L304). A demo deploys by hand and hopes; this pipeline ships, verifies, gates, and reverts (L307).

## 11. Follow-Up Questions

- What are the five parts (L307)?
- How is an AI pipeline different (L307)?
- Where does the verification live (L296)?
- How do you ship a model (L365)?
- How does the safety net work (L304)?

## 12. Comparison Table — Demo vs the Production Pipeline

| Layer | Demo | The production pipeline (this lesson) |
|---|---|---|
| The unit (L288) | the laptop's folder | the container (L288) — slim (L291), secured (L293) |
| The build (L289) | the local `npm run build` | the CI (L296): the image (L289), the pinned tag (L291) |
| The verification (L296) | the hope | the tests (L296), the scans (L293), the evals (L341) |
| The deploy (L302) | the SSH + the pull | the CD (L296): the ladder (L300), the Terraform (L299) |
| The rollout (L303) | the 100% | the canary (L303): the 5% → 25% → 100% |
| The rollback (L304) | the scramble | the rehearsed revert (L304) |
| The watch (L305) | the logs | the observability (L305): the deploy's + the model's (L332) |

The senior read: **the table is the milestone** — M25's claim is building the right column and defending it with the left column's failures in mind (L307).

## 13. Code Example — The Assembly in One Shape

```text
The AI deployment pipeline (L307) — the floor plan as folders:

  unit/                      THE UNIT (L288)
    Dockerfile               the recipe (L289) — the slim (L291)
    .dockerignore            the context's control (L293)

  ci/                        THE CONVEYOR (L296)
    workflow.yml             the GitHub Actions (L297): the build,
                             the test, the scan (L293), the evals (L341)
    evals/                   the golden set (L342) — the gates (L341)

  registry/                  THE REGISTRY (L294)
    ecr.ts                   the repository, the tags (L291), the scan (L293)

  infra/                     THE CLOUD (L298)
    terraform/               the environments (L300) — the variables (L300)
    secrets.tf               the OIDC (L297) + the vault's references (L275)

  runtime/                   THE RUNTIME (L295, L306)
    ecs-service.ts           the ECS service (L295) — or the k8s (L306)

  rollout/                   THE GATES (L302)
    canary.ts                the 5% → 25% → 100% (L303)
    rollback.ts              the switch (L273) or the flag (L300) (L304)

  watch/                     THE WATCH (L305)
    deploy-metrics.ts        the success, the duration, the rollbacks (L305)
    model-metrics.ts         the evals (L341), the tokens (L332), the cost (L334)

  The unit ships, the conveyor checks, the canary gates,
  the rollback protects, and the watch records.
```

```text
What the reader must SEE — the boundaries as folders:

  unit/        the container — the recipe, the slim (L288, L291)
  ci/          the verification — the tests, the scans, the evals (L296, L341)
  registry/    the image's home — the tags, the scans (L294, L293)
  infra/       the cloud — the Terraform, the secrets (L298, L301)
  runtime/     the run — the ECS (L295) or the k8s (L306)
  rollout/     the gates — the canary (L303), the rollback (L304)
  watch/       the observability — the deploy's + the model's (L305)

  Every folder is a boundary; every boundary is a lesson.
```

```narrate
3-6: The unit — the Dockerfile recipe, slim and secured (L288, L289, L291).
8-12: The conveyor — the workflow with the build, the tests, the scans, and the evals (L296, L293, L341).
14-16: The registry — the ECR repository with the pinned tags and the scans (L294, L291).
18-21: The cloud — the Terraform environments and the secret references (L298, L300, L275).
23-25: The runtime — the ECS service or the Kubernetes deployment (L295, L306).
27-30: The rollout — the canary progression and the rollback strategies (L303, L304).
32-35: The watch — the deploy's metrics and the model's metrics (L305, L332).
```

> [!TIP]
> The folder shape *is* the architecture: **unit, ci, registry, infra, runtime, rollout, watch** — each a boundary, each a lesson (L307). **If the evals aren't in the CI (L341) or the rollback isn't ready (L304), the floor plan is missing its walls — that's M25's milestone in a directory tree (L307).**

## 14. Performance Notes

- **The unit is the ship's size (L291).** The slim image (L291) — the pull (L288) and the start (L295) fast (L307).
- **The CI is the feedback's speed (L296).** The cache (L289) and the parallel jobs (L297) — the verification (L296) in minutes (L307).
- **The canary is the exposure's growth (L303).** The 5% → 25% → 100% (L303) — the blast radius (L314) bounded (L307).
- **The rollback is the recovery's speed (L304).** The switch (L273) and the flag (L300) — the seconds (L304) to the previous (L304).
- **The watch is the cost's record (L305).** The tokens (L332) and the cost (L334) — the model's change (L365) priced (L307).

## 15. Debugging Scenarios

| Symptom | First check (L307) | The lever |
|---|---|---|
| The deploy is slow | The unit (L291) | The slim image (L291) |
| The broken code ships | The CI (L296) | The gates (L296) |
| The model regresses | The evals (L341) | The eval gate (L341) |
| The rollout is all-or-nothing | The canary (L303) | The 5% (L303) |
| The revert is slow | The rollback (L304) | The switch (L273), the flag (L300) |
| The failure is opaque | The watch (L305) | The deploy's metrics (L305) |

## 16. Quick Revision Notes

- The AI deployment pipeline = **the module's synthesis** (L307): the unit, the conveyor, the cloud, the gates, the safety net.
- The unit: **the container (L288) — the recipe (L289), the slim (L291), the security (L293)**.
- The conveyor: **the CI (L296) — the build, the test, the scan, the evals (L341); the CD — the ladder (L300)**.
- The registry and the runtime: **the ECR (L294), the ECS (L295) or the k8s (L306)**.
- The cloud: **the Terraform (L299), the environments (L300), the secrets (L301)**.
- The gates: **the canary (L303) with the metrics (L305)**.
- The safety net: **the rollback (L304) — the instant revert (L304)**.

## 17. Cheat Sheet

```text
THE AI DEPLOYMENT PIPELINE = the module's synthesis

THE UNIT (L288)
  the container (L288) — the recipe (L289), the slim (L291)
  the network (L292) · the security (L293)

THE CONVEYOR (L296)
  the CI: the build (L289), the tests (L296), the scans (L293)
  the evals (L341) — on every commit (L296)
  the CD: the deploy through the environments (L300)

THE REGISTRY + THE RUNTIME (L294, L295)
  the ECR (L294) — the tags (L291), the scans (L293)
  the ECS (L295) or the Kubernetes (L306)

THE CLOUD (L298)
  the Terraform (L299) — the environments (L300)
  the secrets (L301) — the OIDC (L297), the vault (L275)

THE GATES (L302)
  the canary (L303): the 5% → 25% → 100% (L303)
  the metrics (L305) · the evals (L341)

THE SAFETY NET (L304)
  the rollback (L304) — the switch (L273), the flag (L300)
  the runbook (L304) rehearsed

THE MILESTONE (M25)
  ship the AI service through the CI/CD with the rollbacks (L307)

INTERVIEW, 4 MOVES
  1 assembly "the unit, the conveyor, the cloud, the gates, the net (L307)"
  2 flow     "commit → CI → CD → canary → rollback (L307)"
  3 boundaries "the verification in the CI, the risk at the canary, the safety at the rollback (L307)"
  4 AI gates "the evals and the model's canary (L341, L303)"
```

## 18. Key Takeaways

> [!RECAP]
> - The AI deployment pipeline is **the module's synthesis** (L307): the unit (L288), the conveyor (L296), the registry and the runtime (L294, L295), the cloud (L298), the gates (L303), and the safety net (L304)
> - **The unit** (L288) is the container — the recipe (L289), the slim build (L291), the network (L292), and the security (L293)
> - **The conveyor** (L296) is the CI/CD — the CI verifies (L296): the build (L289), the tests (L296), the scans (L293), and the evals (L341); the CD deploys (L296) through the environments (L300)
> - **The registry and the runtime** (L294, L295): the ECR (L294) holds the pinned image (L291); the ECS (L295) or the Kubernetes (L306) runs the service (L233)
> - **The cloud** (L298): the Terraform (L299) declares the environments (L300); the secrets (L301) — the OIDC (L297) and the vault (L275) — follow the L301 rule (L301)
> - **The gates** (L303): the canary (L303) — the 5% first (L303) — with the evals (L341) and the metrics (L305) watching
> - **The safety net** (L304): the rollback (L304) — the switch (L273) or the flag (L300), the instant revert (L304), the runbook (L304) rehearsed
> - From the commit to the canary to the rollback (L307) — assemble it, and defend it with the L288–L306 vocabulary, and M25 is claimed (L307)

## Check your understanding

Answer these without looking back.

1. What are the five parts (L307)?
2. How is an AI pipeline different (L307)?
3. Where does the verification live (L296)?
4. How do you ship a model (L365)?
5. How does the safety net work (L304)?
6. What's the AI's gate (L341)?
7. What does the watch record (L305)?
8. What is M25's milestone (L307)?

## A Closing Note — The Factory, Running

That was the last lesson of the Docker / DevOps module — and the one you'll *ship with*. L288–L306 gave you the parts; this lesson gave you the floor plan: **the unit, the conveyor, the cloud, the gates, and the safety net — from the commit to the canary to the rollback.** When you can draw it, defend it, and run it — naming the verification in the CI (L296), the risk at the canary (L303), and the safety at the rollback (L304) — you have claimed Milestone M25.

The next module turns the shipped service into the *secured* service: AI Security (L308–L327) — the threat model (L308), the prompt injection and the jailbreaks (L309–310), the data leakage (L312–313), the excessive agency (L314–315), the RAG poisoning (L316), the abuse (L317–318), the auth (L319), the tenant isolation (L320), the secrets (L321), the audit (L322), the secure tools (L323–324), the defense in depth (L325), and the OWASP walkthrough (L326–327). You've built the pipeline that ships it; now you'll build the security that guards it.
