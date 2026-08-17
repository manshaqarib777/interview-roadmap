# Lesson 297 — GitHub Actions for AI Apps

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you write the pipeline?" — the answer is *GitHub Actions*: the workflow file — CI for evals, and CD to the cloud (L297).**

L296 defined the conveyor; this lesson is **its implementation**: GitHub Actions for AI apps — the workflow file: the triggers (the events, L297), the jobs (the steps, L297), and the actions (the reusable units, L297) — the CI for the evals (L341) and the CD to the cloud (L287). The AI service's shape (L173): the workflow (L297) builds and scans the image (L289, L293), runs the tests and the evals (L341), and deploys to the ECS (L295). This lesson is the conveyor, GitHub-shaped (L297).

The distinction this lesson is built on: a **demo** runs the pipeline elsewhere. A **solutions architect** writes the workflow (L297): the triggers (L297), the jobs (L297), and the secrets (L301) — because the L307 pipeline (L307) runs on the GitHub Actions (L297).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the workflow: the file (L297)
- Explain the triggers: the events (L297)
- Explain the jobs: the steps (L297)
- Explain the secrets: the credentials (L301)
- Explain the AI shape: the CI for the evals, the CD to the cloud (L297)

## 1. One-Line Definition

**The GitHub Actions for AI apps is the workflow file — CI for the evals (L341), and CD to the cloud (L297) — the triggers (the events: the push L297, the pull request L297, the schedule L221), the jobs (the steps: the build L289, the test L296, the scan L293, the deploy L302), and the secrets (the credentials: the AWS keys L301, the OIDC L297) — the conveyor (L296), GitHub-shaped (L297).**

The one-sentence interview answer: *"GitHub Actions runs the pipeline in the workflow file (L297). The triggers (L297): the events that start the workflow (L297) — the push to the main (L297), the pull request (L297), the schedule (L221) for the nightly (L297). The jobs (L297): the steps (L297) — the checkout (L297), the build of the image (L289), the tests (L296), the scans (L293), and the deploy to the ECS (L295) — with the dependencies (L297): the deploy waits for the tests (L297). The actions (L297): the reusable units (L297) — the `actions/checkout` (L297), the `aws-actions/configure-aws-credentials` (L297). The secrets (L301): the credentials (L301) — the AWS keys (L275) stored as the secrets (L301), or the OIDC (L297) — the keyless auth (L297): the workflow assumes the role (L262) without the long-lived keys (L301). The AI shape (L173): the workflow (L297) builds and scans the image (L289, L293), runs the tests (L296) and the evals (L341) — the retrieval's quality (L195), the groundedness (L337) — and deploys to the ECS (L295) — the conveyor (L296), GitHub-shaped (L297)."*

## 2. Mental Model

Think of the workflow file as **the factory's shift schedule.** The schedule (the workflow file, L297) says when the factory starts (the triggers, L297): every new order (the push, L297), every change request (the pull request, L297), the nightly cleanup (the schedule, L221). The schedule lists the crews (the jobs, L297): the assembly crew (the build, L289), the inspectors (the tests, L296), the security team (the scans, L293), the shipping crew (the deploy, L302) — with the order (the dependencies, L297): the shipping waits for the inspectors (L297). The crews use the standard tools (the actions, L297): the shared checklists (the reusable actions, L297). And the safe (the secrets, L301): the master keys (the AWS credentials, L275) stay in the safe (L301) — the crews (the workflows, L297) unlock it on demand (the OIDC, L297). The factory works because the schedule is clear, the crews are ordered, and the safe is locked (L297).

```text
   the schedule (the workflow, L297)
   ┌────────────────────────────────────────────────────────┐
   │ the starts (the triggers, L297) — the push, the PR,    │
   │ the schedule (L221)                                    │
   │ the crews (the jobs, L297) — the build (L289), the     │
   │ tests (L296), the scan (L293), the deploy (L302)       │
   │ the tools (the actions, L297) · the safe (the secrets, │
   │ L301) — the OIDC (L297)                                │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the schedule**: the starts, the crews, the tools, and the safe (L297).

## 3. Visual Flow — One Workflow Run

```text
   the push (L297)
        │  the trigger (L297)
        ▼
   ┌────────────────────── THE JOBS (L297) ─────────────────────────────┐
   │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
   │  │ build+test  │──►│ scan        │──►│ deploy      │              │
   │  │ (L289, L296)│   │ (L293)      │   │ (L302, L295)│              │
   │  └─────────────┘   └─────────────┘   └─────────────┘              │
   │  the dependencies (L297): the deploy waits (L297)                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SECRETS (L301) ──────────────────────────┐
   │  the AWS credentials (L275) — the OIDC (L297): the keyless role   │
   │  (L262) — no long-lived keys (L301)                               │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the run: **trigger → jobs → secrets** (L297).

## 4. How It Works — The Workflow, Part by Part

- **The triggers (L297).** The events that start the workflow (L297): the push (L297), the pull request (L297), the schedule (L221). The trigger is the workflow's when (L297).
- **The jobs (L297).** The steps (L297): the checkout (L297), the build (L289), the test (L296), the scan (L293), the deploy (L302) — with the dependencies (L297): the jobs run in the order (L297).
- **The actions (L297).** The reusable units (L297): the `actions/checkout` (L297), the `aws-actions/configure-aws-credentials` (L297), the `docker/build-push-action` (L297) — the shared steps (L297).
- **The secrets (L301).** The credentials (L301): the AWS keys (L275) in the secrets (L301), or the OIDC (L297) — the workflow assumes the role (L262) without the long-lived keys (L301) — the keyless auth (L297).
- **The AI shape (L297).** The evals (L341) in the CI (L296): the retrieval's quality (L195), the groundedness (L337) — the AI change (L365) gated like the code's (L296).

> [!NOTE]
> **The OIDC is the senior's auth (L297).** The long-lived AWS keys (L301) in the GitHub secrets (L301) are the legacy (L297): the leaked key (L275) is the account's exposure (L297). The OIDC (L297) — the workload identity federation (L297) — lets the workflow assume the IAM role (L262) directly (L297): the role's trust (L262) allows the GitHub's OIDC issuer (L297), and the workflow assumes it per run (L297) — no keys to leak (L297), the L321 rule (L321) upheld (L297).

## 5. Real Project Usage

- **An AI API (L233).** The workflow (L297): the build and the scan (L289, L293), the tests (L296), the deploy to the ECS (L295).
- **A RAG platform (L280).** The eval gates (L341) in the CI (L296): the golden set (L342) run, the quality (L195) checked.
- **A nightly job (L221).** The schedule trigger (L221): the embedding refresh (L181), the retraining (L365).
- **A model update (L365).** The new model (L148) gated (L341) and deployed (L302) through the workflow (L297).
- **Anything shipped (L307).** The L307 pipeline (L307) — the workflow file (L297) — GitHub-shaped (L297).

The through-line: **the workflow is the conveyor's file** — the triggers, the jobs, and the secrets (L297).

## 6. Interview Explanation

Say it in four moves:

1. **The triggers.** "The events — the push, the PR, the schedule (L297)."
2. **The jobs.** "The steps — the build, the test, the scan, the deploy (L297)."
3. **The actions.** "The reusable units (L297)."
4. **The secrets.** "The OIDC — the keyless role assumption (L297)."

## 7. Senior-Level Insights

- **The OIDC is the keyless auth (L297).** The workflow assumes the role (L262) — no long-lived keys (L301) — the L321 rule (L321), pipeline-shaped (L297).
- **The evals are the AI's tests (L341).** The golden set (L342) and the groundedness (L337) in the CI (L296) — the AI regression (L335) caught like the code's (L296).
- **The jobs' dependencies are the order (L297).** The deploy waits for the tests and the scans (L297) — the pipeline's order (L297) is the safety's (L296).
- **The schedule is the AI's nightly (L221).** The retraining (L365) and the embedding refresh (L181) on the schedule (L221) — the L221 jobs (L221), workflow-shaped (L297).
- **The artifact is the handoff (L289).** The image (L289) from the build (L297) to the deploy (L302) — the same artifact (L296) up the ladder (L300).

## 8. Common Mistakes

- **The keys in the workflow (L301).** The AWS keys (L275) in the file (L301) — the L301 rule (L301); the OIDC (L297) is the fix (L297).
- **The deploy before the gates (L296).** The deploy job (L297) not waiting for the tests (L296) — the dependencies (L297) are the order (L297).
- **The latest action (L297).** The unpinned action (L297) — the supply chain (L293) unknown; the pinned SHA (L297) is the pin (L293).
- **The evals missing (L341).** The AI change (L365) un-evaluated (L341) — the L341 gates (L341) in the CI (L296).
- **The secret in the logs (L301).** The credential printed (L301) — the redaction (L301) and the masking (L301) are the guard (L301).

## 9. Best Practices

- **Use the OIDC** (L297) — the keyless role (L262).
- **Order the jobs** (L297) — the deploy after the gates (L296).
- **Pin the actions** (L297) — the SHA (L297), the supply chain (L293).
- **Gate the evals** (L341) — the AI's tests (L296).
- **Mask the secrets** (L301) — the logs clean (L301).

## 10. Interview Questions

**Q: Walk me through GitHub Actions for an AI app.**
> A: The workflow file (L297). The triggers — the push, the PR, the schedule (L297). The jobs — the build (L289), the test (L296), the scan (L293), the deploy (L302). The actions — the reusable units (L297). And the secrets — the OIDC (L297), the keyless auth (L297).

**Q: How do you deploy to AWS without the keys?**
> A: The OIDC (L297): the workflow uses the `configure-aws-credentials` action (L297) with the OIDC (L297) — the GitHub's OIDC issuer (L297) is trusted by the IAM role (L262), and the workflow assumes the role (L262) per run (L297) — no long-lived keys (L301) to leak (L297).

**Q: How do the evals fit in?**
> A: As a CI gate (L296): the eval job (L297) runs the golden set (L342) — the retrieval's quality (L195), the groundedness (L337) — and the deploy (L302) waits for it (L297). The AI regression (L335) fails the build (L296) like the code's test (L296).

**Q: What's the workflow's order?**
> A: The dependencies (L297): the build (L289) and the test (L296) first, the scan (L293) next, and the deploy (L302) last — the deploy waits for the gates (L296). The order (L297) is the pipeline's safety (L296).

## 11. Follow-Up Questions

- What's the trigger (L297)?
- What's a job (L297)?
- What's an action (L297)?
- What's the OIDC (L297)?
- How do the evals fit (L341)?

## 12. Comparison Table — The Keys vs the OIDC

| | The keys in the secrets (L301) | The OIDC (L297) |
|---|---|---|
| The credentials (L301) | the long-lived keys (L275) | the assumed role (L262) |
| The leak (L297) | the account's exposure (L297) | none — per-run (L297) |
| The rotation (L275) | manual (L275) | none needed (L297) |
| The use (L297) | the legacy (L297) | the senior's (L297) |

The senior read: **the OIDC is the keyless path** — the role assumed, the keys eliminated (L297).

## 13. Code Example — The Workflow

```yaml
# The workflow (L297) — the AI app's conveyor (L296).
name: ai-service-pipeline
on:
  push:
    branches: [main]                 # the trigger (L297)
  pull_request:                       # the PR trigger (L297)
  schedule:
    - cron: '0 3 * * *'             # the nightly (L221)

jobs:
  # THE CI (L296) — the build, the test, the scan (L297).
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4    # the action (L297)
      - run: docker build -t ai-service:${{ github.sha }} .   # L289
      - run: docker run ai-service:${{ github.sha }} npm test # L296
      - run: docker scan ai-service:${{ github.sha }}         # L293

  # THE EVALS (L341) — the AI's gates (L296).
  evals:
    runs-on: ubuntu-latest
    steps:
      - run: npm run eval:golden     # the golden set (L342)

  # THE CD (L296) — the deploy to the ECS (L295).
  deploy:
    needs: [build-and-test, evals]   # the order (L297)
    if: github.ref == 'refs/heads/main'
    permissions:
      id-token: write                # the OIDC (L297)
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/ci   # L262
      - run: ecs-deploy --image ai-service:${{ github.sha }}  # L295
```

```text
What the reader must SEE — the workflow, declared:

  on: push + PR + cron      → the triggers (L297, L221)
  build + test + scan       → the CI (L296)
  npm run eval:golden       → the AI's gate (L341)
  needs: [build, evals]     → the order (L297)
  id-token: write + role    → the OIDC, keyless (L297, L262)

  The commit in, the evals gated, the ECS deployed (L297).
```

```narrate
4-9: The triggers — the push, the pull request, and the nightly schedule (L297, L221).
11-16: The CI — the build, the tests, and the scan (L289, L296, L293).
18-21: The evals — the golden set gates the AI (L341, L342).
23-31: The CD — the deploy waits for the gates and assumes the role via the OIDC (L297, L262).
```

> [!TIP]
> The pair that defines the workflow: **the eval job** (the AI's gate, L341) and **the OIDC role assumption** (the keyless deploy, L297). **Gate the evals, assume the role, deploy to the ECS — the conveyor, GitHub-shaped (L297).**

## 14. Performance Notes

- **The cache is the build's speed (L297).** The `docker/build-push-action` cache (L297) — the layers (L289) reused (L297).
- **The parallel jobs are the pipeline's speed (L297).** The independent jobs (L297) in parallel (L297) — the critical path (L297) shortened (L297).
- **The matrix is the coverage (L297).** The matrix (L297) — the versions (L297) and the models (L148) tested (L297).
- **The OIDC is the security's cost (L297).** The keyless auth (L297) — the zero secrets (L301), the zero rotation (L275).

## 15. Debugging Scenarios

| Symptom | First check (L297) | The lever |
|---|---|---|
| The workflow doesn't start | The trigger (L297) | The event (L297) |
| The deploy runs before the tests | The dependencies (L297) | The `needs` (L297) |
| The AWS auth fails | The OIDC (L297) | The role's trust (L262) |
| The AI regresses | The evals (L341) | The golden set (L342) |
| The key is in the logs | The secrets (L301) | The masking (L301) |

## 16. Quick Revision Notes

- The GitHub Actions for AI = **the workflow file** (L297): the triggers, the jobs, the actions, the secrets.
- The triggers: **the push, the PR, the schedule (L221)** (L297).
- The jobs: **the build (L289), the test (L296), the scan (L293), the deploy (L302)** (L297).
- The actions: **the reusable units (L297)** — pinned (L297).
- The secrets: **the OIDC (L297) — the keyless role (L262)**.

## 17. Cheat Sheet

```text
GITHUB ACTIONS FOR AI APPS = the workflow file — CI for the evals,
CD to the cloud

THE TRIGGERS (L297)
  the push (L297) · the pull request (L297) · the schedule (L221)

THE JOBS (L297)
  the build (L289) · the test (L296) · the scan (L293)
  the evals (L341) · the deploy (L302)
  the dependencies (L297): the deploy waits for the gates (L296)

THE ACTIONS (L297)
  the reusable units (L297) — pinned to the SHA (L297)
  the checkout (L297) · the aws-credentials (L297) · the build-push (L297)

THE SECRETS (L301)
  the OIDC (L297) — the keyless role assumption (L262)
  no long-lived keys (L301) — the L321 rule (L321), pipeline-shaped (L297)

THE AI SHAPE (L297)
  the evals (L341): the golden set (L342), the groundedness (L337)
  the deploy to the ECS (L295) · the nightly retraining (L365, L221)

INTERVIEW, 4 MOVES
  1 triggers "the push, the PR, the schedule (L297)"
  2 jobs     "the build, the test, the scan, the deploy (L297)"
  3 actions  "the reusable units, pinned (L297)"
  4 secrets  "the OIDC — the keyless role (L297)"
```

## 18. Key Takeaways

> [!RECAP]
> - The GitHub Actions for AI apps is **the workflow file — CI for the evals (L341), and CD to the cloud** (L297): the triggers (L297), the jobs (L297), the actions (L297), and the secrets (L301)
> - **The triggers** (L297): the push (L297), the pull request (L297), and the schedule (L221)
> - **The jobs** (L297): the build (L289), the test (L296), the scan (L293), the evals (L341), and the deploy (L302) — with the dependencies (L297): the deploy waits for the gates (L296)
> - **The actions** (L297) are the reusable units — the checkout (L297), the AWS credentials (L297), the build-push (L297) — pinned to the SHAs (L297)
> - **The secrets** (L301): the OIDC (L297) — the workflow assumes the IAM role (L262) per run, no long-lived keys (L301) — the L321 rule (L321), pipeline-shaped (L297)
> - The AI shape (L297): the evals (L341) gate the AI change (L365), the nightly schedule (L221) runs the retraining (L365), and the deploy (L302) ships to the ECS (L295) — the conveyor (L296), GitHub-shaped (L297)

## Check your understanding

Answer these without looking back.

1. What's the trigger (L297)?
2. What's a job (L297)?
3. What's an action (L297)?
4. What's the OIDC (L297)?
5. How do the evals fit (L341)?
6. What's the `needs` (L297)?
7. Why pin the actions (L297)?
8. What is the workflow file (L297)?

## A Closing Note — The Schedule, Posted

You now hold the workflow: **the triggers, the jobs, the actions, and the secrets — with the evals gating and the OIDC keyless.** The conveyor has its file — and the schedule is posted (L297).

Next: declaring the cloud in code — Infrastructure as Code (L298).
