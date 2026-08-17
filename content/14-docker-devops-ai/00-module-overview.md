# Module 14 — Docker / DevOps / Infrastructure

## Why this module comes fourteenth

Modules 7–13 built the AI product and deployed it to AWS: the model decision (M18), the app (M19), the knowledge (M20), the loop (M21), the automation (M22), the backend (M23), and the cloud (M24). Every one of them is **shipped through a pipeline** — and this module is that pipeline. The L287 cloud is the destination; this module is the road: the containers (L288–293), the registry and the runtime (L294–295), the CI/CD (L296–297), the infrastructure as code (L298–299), the environments and the secrets (L300–301), the deployments (L302–304), the observability (L305), and the Kubernetes concepts (L306) — assembled into the delivery pipeline (L307) that ships the AI service from commit to canary to rollback.

The distinction this module is built on: a **demo** runs locally and deploys by hand. A **solutions architect** ships through a pipeline (L307): the container (L288) as the unit, the CI/CD (L296) as the conveyor, the IaC (L298) as the blueprint, the canary (L303) as the gate, and the rollback (L304) as the safety net.

## Module map

- **M25 · Docker / DevOps / Infrastructure (L288–307)** — the pipeline under the product.
  The container (L288–293), the registry and the runtime (L294–295), the CI/CD (L296–297), the infrastructure as code (L298–299), the environments and the secrets (L300–301), the deployments (L302–304), the observability (L305), the Kubernetes concepts (L306), and the synthesis (L307).

## How to study each lesson

1. **Follow one service through the module.** A commit (L296) builds the image (L289) in the CI (L297), pushes it to the ECR (L294), the ECS service (L295) pulls it, the canary (L303) ships to 5%, the metrics (L305) watch, and the rollback (L304) undoes it — with the whole environment declared in Terraform (L299). The module is that path, taught layer by layer.
2. **Learn the container vocabulary.** The image and the container (L288), the Dockerfile (L289), the multi-stage build (L291), the network (L292), and the threat model (L293) — the words every deployment discussion uses. Learn the names with their mechanisms.
3. **Apply the earlier modules.** The L287 cloud (L287) is what the pipeline deploys to; the L260 backend (L260) is what the container ships; the L172 security baseline (L172) is what the pipeline must not break (L301). This module is the L287 cloud, shipped (L307).
4. **Build the synthesis at the end (L307).** The final lesson assembles the whole: the commit, the build, the test, the deploy, the canary, the rollback — one coherent delivery pipeline for an AI service. Draw it, defend it, and M25 is claimed.

## Prerequisites

Module 13 (L261–287) — the cloud the pipeline deploys to (L287). Module 8 (L158–173) — the AI app the pipeline ships (L173). Module 6 (L105–134) — the Laravel deployment discipline (L131). Module 4 (L83–96) — the Next.js build and deployment (L96). You also need working knowledge of the command line and git.

## Next

→ [Lesson 288 — Docker & Containers](./288-docker-basics.md)
