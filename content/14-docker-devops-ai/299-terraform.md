# Lesson 299 — Terraform Fundamentals

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you write the IaC?" — the answer is *Terraform*: the providers, the state, and the plan/apply loop (L299).**

L298 defined the IaC; this lesson is **its implementation**: the Terraform fundamentals — the providers (the AWS plugin, L299), the state (the source of truth, L299), and the plan/apply loop (the preview and the apply, L299). The AI stack's shape (L287): the L287 cloud (L287) declared in the Terraform (L299) — the VPC (L263), the ECS (L295), and the RDS (L268) with the plan (L299) reviewed and the state (L299) stored (L298). This lesson is the IaC's engine (L299).

The distinction this lesson is built on: a **demo** clicks the console. A **solutions architect** writes the Terraform (L299): the providers (L299), the state (L299), and the plan/apply loop (L299) — because the L307 pipeline (L307) runs the Terraform (L299).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the providers: the AWS plugin (L299)
- Explain the state: the source of truth (L299)
- Explain the plan: the preview (L299)
- Explain the apply: the change (L299)
- Explain the AI shape: the L287 cloud, Terraformed (L299)

## 1. One-Line Definition

**The Terraform fundamentals are the IaC's engine (L299) — the providers (the plugins: the AWS provider declares the resources, L299), the state (the source of truth: the real resources mapped to the code, L299), and the plan/apply loop (the plan — the preview of the change; the apply — the change made, L299) — the L287 cloud, declared and applied (L299).**

The one-sentence interview answer: *"Terraform is the IaC tool (L299). The providers (L299): the plugins — the AWS provider (L299) knows the AWS resources (L299): the `aws_vpc`, the `aws_ecs_service`, the `aws_db_instance` (L299). The configuration (L299): the `.tf` files (L299) declare the resources (L298) — with the variables (L300) for the environments (L300). The state (L299): the mapping of the real resources (L299) to the code (L299) — stored remotely (L299) — the source of truth (L299): the plan (L299) compares the state (L299) with the code (L299). The loop (L299): the `terraform plan` (L299) — the preview: what will be created, changed, or destroyed (L299); the review (L298) of the plan (L299); and the `terraform apply` (L299) — the change made (L299). The AI shape (L287): the L287 cloud (L287) — the VPC (L263), the ECS (L295), the RDS (L268) — declared in the Terraform (L299), planned (L299) and reviewed (L298) in the pull request (L298), and applied by the pipeline (L296) — the plan is the safety, the state is the truth (L299)."*

## 2. Mental Model

Think of Terraform as **the architect with the master ledger.** The architect (Terraform, L299) works from the blueprints (the `.tf` files, L299) — the rooms (the resources, L298): the lobby (the VPC, L263), the floors (the ECS, L295), the vault (the RDS, L268) (L299). The architect knows the building codes (the providers, L299) — the AWS code (L299) for the AWS building (L299). The master ledger (the state, L299) records what's actually built (L299): each room (L299) with its real details (L299) — the ledger (L299) is the truth (L299). Before any change (L299), the architect draws the plan (L299): the rooms to be built (the creates, L299), the walls to move (the changes, L299), the rooms to demolish (the destroys, L299) — the owner (the reviewer, L298) approves the plan (L299), and the architect builds (the apply, L299) — updating the ledger (L299). The building works because the blueprints are clear, the ledger is true, and every change is planned first (L299).

```text
   the architect (Terraform, L299)
   ┌────────────────────────────────────────────────────────┐
   │ the blueprints (the .tf files, L299) — the resources   │
   │ (L298)                                                 │
   │ the codes (the providers, L299) — the AWS (L299)       │
   │ the ledger (the state, L299) — the truth (L299)        │
   │ the loop (L299) — the plan (L299), the apply (L299)    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the architect**: the blueprints, the codes, the ledger, and the loop (L299).

## 3. Visual Flow — One Plan/Apply

```text
   the code change (L299)
        │
        ▼
   ┌────────────────────── THE PLAN (L299) ─────────────────────────────┐
   │  terraform plan (L299)                                             │
   │  the state (L299) vs the code (L299) — the diff (L299)            │
   │  the creates · the changes · the destroys (L299)                  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REVIEW (L298) ───────────────────────────┐
   │  the plan reviewed in the pull request (L298)                     │
   │  the approval (L298) — the gate (L296)                            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE APPLY (L299) ────────────────────────────┐
   │  terraform apply (L299) — the change made (L299)                  │
   │  the state (L299) updated (L299)                                  │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the loop: **plan → review → apply → state** (L299).

## 4. How It Works — The Engine, Part by Part

- **The providers (L299).** The plugins (L299): the AWS provider (L299) knows the AWS resources (L299) — the `aws_vpc`, the `aws_ecs_service`, the `aws_db_instance` (L299). The provider is the API's bridge (L299).
- **The configuration (L299).** The `.tf` files (L299): the resources declared (L298) with the variables (L300) — the environments (L300) reuse the one code (L299).
- **The state (L299).** The mapping of the real resources (L299) to the code (L299) — stored remotely (L299) — the source of truth (L299): the plan (L299) compares the state (L299) with the code (L299).
- **The plan (L299).** The preview (L299): what will be created, changed, or destroyed (L299) — the safety (L299) before the apply (L299).
- **The apply (L299).** The change made (L299): the resources created, changed, or destroyed (L299) — the state (L299) updated (L299).

> [!NOTE]
> **The state is the truth; the plan is the safety (L299).** The senior answer names both (L299): the state (L299) — the real resources' mapping (L299) — is stored remotely (L299) and locked (L299): two applies (L299) don't race (L299). The plan (L299) — the diff (L299) between the state (L299) and the code (L299) — is the safety (L299): the destructive change (L299) — the `destroy` (L299) — is seen in the plan (L299) before the apply (L299). The review (L298) of the plan (L299) is the human's gate (L298).

## 5. Real Project Usage

- **A production AI stack (L287).** The L287 cloud (L287) in the Terraform (L299): the VPC (L263), the ECS (L295), the RDS (L268), the S3 (L265).
- **A multi-environment setup (L300).** The variables (L300) for the dev (L300), the staging (L300), and the production (L302) — the one code (L299).
- **A CI/CD pipeline (L296).** The workflow (L297) runs the plan (L299) in the PR (L298) and the apply (L299) on the merge (L296).
- **A disaster recovery (L286).** The standby region (L286) from the same Terraform (L299) — the DR (L286) reproducible (L298).
- **Anything on AWS (L299).** The IaC (L298) with the Terraform (L299) — the plan/apply loop (L299).

The through-line: **the engine is the IaC's loop** — the providers, the state, and the plan/apply (L299).

## 6. Interview Explanation

Say it in four moves:

1. **The providers.** "The plugins — the AWS provider knows the resources (L299)."
2. **The state.** "The mapping of the real resources — the source of truth (L299)."
3. **The plan.** "The preview — the creates, the changes, the destroys (L299)."
4. **The apply.** "The change made — the state updated (L299)."

## 7. Senior-Level Insights

- **The state is the truth (L299).** The real resources' mapping (L299) — stored remotely (L299) and locked (L299) — the source of truth (L299).
- **The plan is the safety (L299).** The diff (L299) — the destructive change (L299) seen before the apply (L299) — the review (L298) of the plan (L299) is the gate (L296).
- **The remote state is the team's (L299).** The shared state (L299) — the S3 (L265) with the lock (L299) — the team (L299) applies without the race (L299).
- **The variables are the environments (L300).** The one code (L299), the variables (L300) — the dev (L300), the staging (L300), the production (L302) (L299).
- **The pipeline is the hand (L296).** The plan (L299) in the PR (L298), the apply (L299) on the merge (L296) — the L296 conveyor (L296), Terraform-shaped (L299).

## 8. Common Mistakes

- **The local state (L299).** The state on the laptop (L299) — the team's truth (L299) lost; the remote state (L299) with the lock (L299) is the fix (L299).
- **The plan skipped (L299).** The direct apply (L299) — the destructive change (L299) unseen (L299).
- **The state unlocked (L299).** The concurrent applies (L299) — the race (L299) and the corruption (L299); the lock (L299) is the guard (L299).
- **The secrets in the code (L301).** The keys in the `.tf` (L301) — the variables (L300) and the secrets manager (L275) are the values (L299).
- **The manual console changes (L298).** The drift (L298) — the state (L299) diverges (L298); the import (L299) or the revert (L298) is the fix (L299).

## 9. Best Practices

- **Store the state remotely** (L299) — with the lock (L299).
- **Plan before the apply** (L299) — the review (L298) of the plan (L299).
- **Use the variables** (L300) — the environments (L300) from the one code (L299).
- **Keep the secrets out** (L301) — the secrets manager (L275).
- **Detect the drift** (L298) — the plan (L299) in the CI (L296).

## 10. Interview Questions

**Q: Walk me through the Terraform.**
> A: The IaC's engine (L299). The providers — the plugins: the AWS provider knows the resources (L299). The state — the mapping of the real resources, the source of truth (L299). The plan — the preview of the change (L299). And the apply — the change made (L299).

**Q: What's the state for?**
> A: The truth (L299): the mapping of the real resources (L299) to the code (L299). The plan (L299) compares the state (L299) with the code (L299) — the diff (L299) is the change (L299). The state (L299) is stored remotely (L299) with the lock (L299) — the team applies without the race (L299).

**Q: What's the plan/apply loop?**
> A: The safety and the change (L299): the `terraform plan` (L299) previews — the creates, the changes, the destroys (L299); the plan (L299) is reviewed (L298) in the pull request (L298); and the `terraform apply` (L299) makes the change (L299), updating the state (L299). The plan (L299) catches the destructive change (L299) before it happens (L299).

**Q: How does it fit the pipeline?**
> A: The plan (L299) runs in the pull request (L297) — the diff (L299) reviewed (L298); the apply (L299) runs on the merge (L296) — the pipeline (L296) is the hand (L299). The same code (L299) with the variables (L300) deploys the dev (L300), the staging (L300), and the production (L302).

## 11. Follow-Up Questions

- What's a provider (L299)?
- What's the state (L299)?
- What's the plan (L299)?
- What's the apply (L299)?
- How does it fit the pipeline (L296)?

## 12. Comparison Table — Terraform vs the Console

| | The console (L298) | The Terraform (L299) |
|---|---|---|
| The changes (L298) | the clicks (L298) | the plan/apply (L299) |
| The truth (L299) | the console's view (L298) | the state (L299) |
| The preview (L299) | none (L298) | the plan (L299) |
| The review (L298) | none (L298) | the pull requests (L298) |
| The environments (L300) | the manual (L298) | the variables (L300) |

The senior read: **the right column is the engine** — the state, the plan, and the apply (L299).

## 13. Code Example — The Loop, Declared

```hcl
# The Terraform (L299) — the L287 cloud, declared (L298).
# 1 · THE PROVIDER (L299) — the AWS plugin (L299).
provider "aws" {
  region = var.region                  # the variable (L300)
}

# 2 · THE RESOURCES (L298) — declared in the code (L299).
resource "aws_vpc" "ai" {
  cidr_block = "10.0.0.0/16"           # the network (L263)
}

resource "aws_ecs_service" "api" {
  name            = "ai-service-${var.env}"
  desired_count   = var.env == "prod" ? 3 : 1   # the env's count (L300)
}

# 3 · THE STATE (L299) — the remote source of truth (L299).
terraform {
  backend "s3" {
    bucket = "ai-terraform-state"      # the state (L265, L299)
    key    = "ai/terraform.tfstate"
    region = "us-east-1"
  }
}

# 4 · THE LOOP (L299): the plan (L299) in the PR (L298),
#     the apply (L299) on the merge (L296).
```

```text
What the reader must SEE — the engine, declared:

  provider "aws" + var.region → the provider (L299, L300)
  aws_vpc, aws_ecs_service   → the resources (L298, L299)
  desired_count by the env   → the variables (L300)
  backend "s3"               → the remote state (L265, L299)
  plan in the PR, apply on the merge → the loop in the pipeline (L296)

  The state is the truth; the plan is the safety (L299).
```

```narrate
3-5: The provider — the AWS plugin with the region variable (L299, L300).
7-10: The resources — the VPC and the ECS service declared (L298, L299).
12-15: The environment — the desired count varies by the environment (L300).
17-23: The state — the remote S3 backend, the source of truth (L265, L299).
25-26: The loop — the plan in the pull request, the apply on the merge (L298, L296).
```

> [!TIP]
> The pair that defines the Terraform: **the remote state** (the truth, L299) and **the plan** (the safety, L299). **Store the state remotely, plan before you apply, review the diff — the IaC's engine (L299).**

## 14. Performance Notes

- **The state is the apply's speed (L299).** The unchanged resources (L299) skipped (L299) — the applies (L299) fast (L299).
- **The plan is the review's speed (L299).** The diff (L299) — the review (L298) reads the change (L299), not the whole state (L299).
- **The provider is the API's cost (L299).** The plan (L299) calls the provider (L299) — the reads (L299) are the provider's (L299).
- **The parallelism is the apply's speed (L299).** The independent resources (L299) applied in parallel (L299) — the applies (L299) faster (L299).

## 15. Debugging Scenarios

| Symptom | First check (L299) | The lever |
|---|---|---|
| The apply shows the wrong change | The state (L299) | The state's refresh (L299) |
| The team's applies race | The lock (L299) | The remote state's lock (L299) |
| The destructive change surprises | The plan (L299) | The plan's review (L298) |
| The environment differs | The variables (L300) | The env's variables (L300) |
| The key is in the code | The secrets (L301) | The secrets manager (L275) |

## 16. Quick Revision Notes

- The Terraform = **the IaC's engine** (L299): the providers, the state, the plan, the apply.
- The providers: **the plugins — the AWS provider** (L299).
- The state: **the mapping of the real resources — the truth** (L299).
- The plan: **the preview — the creates, the changes, the destroys** (L299).
- The apply: **the change made — the state updated** (L299).

## 17. Cheat Sheet

```text
TERRAFORM FUNDAMENTALS = the IaC's engine

THE PROVIDERS (L299)
  the plugins — the AWS provider (L299)
  the resources known: the aws_vpc, the aws_ecs_service (L299)

THE STATE (L299)
  the mapping of the real resources (L299) — the truth (L299)
  the remote backend (L265) with the lock (L299)

THE PLAN (L299)
  the preview — the diff between the state and the code (L299)
  the creates · the changes · the destroys (L299)
  the review (L298) — the human's gate (L298)

THE APPLY (L299)
  the change made (L299) — the state updated (L299)

THE LOOP IN THE PIPELINE (L296)
  the plan (L299) in the PR (L298) · the apply (L299) on the merge (L296)
  the variables (L300) — the environments (L300) from the one code (L299)

INTERVIEW, 4 MOVES
  1 providers "the plugins — the AWS (L299)"
  2 state     "the mapping of the real resources (L299)"
  3 plan      "the preview — the diff (L299)"
  4 apply     "the change made (L299)"
```

## 18. Key Takeaways

> [!RECAP]
> - The Terraform fundamentals are **the IaC's engine** (L299): the providers (L299), the state (L299), and the plan/apply loop (L299)
> - **The providers** (L299) are the plugins — the AWS provider (L299) knows the AWS resources (L299): the `aws_vpc`, the `aws_ecs_service`, the `aws_db_instance` (L299)
> - **The state** (L299) is the mapping of the real resources (L299) to the code (L299) — stored remotely (L299) with the lock (L299) — the source of truth (L299)
> - **The plan** (L299) is the preview — the diff (L299) between the state (L299) and the code (L299): the creates, the changes, the destroys (L299) — reviewed (L298) in the pull request (L298)
> - **The apply** (L299) makes the change (L299) and updates the state (L299)
> - The AI shape (L299): the L287 cloud (L287) declared in the Terraform (L299), planned (L299) and reviewed (L298) in the pull request (L298), and applied by the pipeline (L296) — the state is the truth, the plan is the safety (L299)

## Check your understanding

Answer these without looking back.

1. What's a provider (L299)?
2. What's the state (L299)?
3. What's the plan (L299)?
4. What's the apply (L299)?
5. Why the remote state (L299)?
6. How does it fit the pipeline (L296)?
7. What's the lock (L299)?
8. What is the IaC's engine (L299)?

## A Closing Note — The Ledger, True

You now hold the engine: **the providers, the state, and the plan/apply loop — with the plan as the safety and the state as the truth.** The blueprint has its engine — and the ledger is true (L299).

Next: the dev, the staging, and the prod — Environment Management (L300).
