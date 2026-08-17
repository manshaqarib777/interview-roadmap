# Lesson 301 — Secrets in CI/CD

**Interview importance:** ⭐⭐⭐⭐⭐ — "where do the pipeline's keys live?" — the answer is *the one rule*: the secrets never touch the repo or the image (L301).**

L275 built the secret store (L275) and L297 the workflow (L297); this lesson is **the pipeline's secret discipline**: the secrets in CI/CD — the one rule (the secrets never touch the repo or the image, L301), the storage (the secret stores: the GitHub secrets, the AWS secrets manager, L301), and the injection (the build-time and the runtime, L301). The AI pipeline's shape (L297): the AWS keys (L275) and the model keys (L278) live in the stores (L301), injected at the build and the runtime (L301) — never committed (L301), never baked (L301). This lesson is the L321 rule, pipeline-shaped (L301).

The distinction this lesson is built on: a **demo** commits the key. A **solutions architect** stores and injects (L301): the stores (L301), the injection (L301), and the detection (L301) — because the L307 pipeline (L307) never carries the secrets (L301).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the one rule: the secrets never touch the repo or the image (L301)
- Explain the stores: the GitHub secrets and the secrets manager (L301)
- Explain the injection: the build-time and the runtime (L301)
- Explain the detection: the secret scanning (L301)
- Explain the AI shape: the L321 rule, pipeline-shaped (L301)

## 1. One-Line Definition

**The secrets in CI/CD follow the one rule (L301) — the secrets never touch the repo or the image (L301) — the storage (the secret stores: the GitHub secrets L301, the AWS secrets manager L275, L301), the injection (the build-time: the build args and the CI secrets; the runtime: the task's secrets from the secrets manager, L301), and the detection (the secret scanning: the leaked keys found in the commits, L301) — the L321 rule (L321), pipeline-shaped (L301).**

The one-sentence interview answer: *"The secrets in the CI/CD follow one rule (L301): the secrets never touch the repo or the image (L301). The storage (L301): the secrets live in the stores (L301) — the GitHub secrets (L301) for the CI's credentials (L301), the AWS secrets manager (L275) for the runtime's (L301) — the L275 vault (L275), pipeline-shaped (L301). The injection (L301): the build-time (L301) — the CI's secrets (L301) as the env vars (L301) or the build args (L301), never baked into the layers (L289, L293); the runtime (L301) — the ECS task (L295) references the secrets manager (L275), and the container (L288) fetches them at the start (L301). The detection (L301): the secret scanning (L301) — the committed key (L301) found (L301) in the pull request (L297) and the history (L301). The AI shape (L297): the AWS keys (L275) and the model keys (L278) — the OIDC (L297) for the CI's AWS access (L297), the secrets manager (L275) for the runtime's (L301) — the keys never in the workflow file (L301), never in the image (L293), never in the logs (L301). The one rule (L301): the secrets never touch the repo or the image (L301)."*

## 2. Mental Model

Think of the secrets in the CI/CD as **the factory's master keys.** The master keys (the secrets, L301) open everything (L301): the vault (L275), the accounts (L262), the model providers (L278). The factory's rule (L301): the master keys never leave the safe (the stores, L301) — never posted on the bulletin board (the repo, L301), never taped to the machines (the images, L293). The foremen (the CI, L296) check out the keys from the safe (the GitHub secrets, L301) for their shift (the build, L289) and return them (L301); the machines (the containers, L288) fetch their keys at the start (the runtime injection, L301) from the central vault (the secrets manager, L275). And the security guard (the secret scanning, L301) patrols: the posted keys (L301) found and flagged (L301). The factory works because the keys stay in the safe, the shifts check them out, and the guard patrols (L301).

```text
   the master keys (the secrets, L301)
   ┌────────────────────────────────────────────────────────┐
   │ the safe (the stores, L301) — the GitHub secrets (L301)│
   │ the vault (L275)                                       │
   │ the rule (L301) — never the repo, never the image      │
   │ (L293)                                                 │
   │ the guard (the scanning, L301) — the leaks found       │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the master keys**: the safe, the rule, and the guard (L301).

## 3. Visual Flow — One Secret's Path

```text
   the secret is created (L301)
        │
        ▼
   ┌────────────────────── THE STORE (L301) ────────────────────────────┐
   │  the GitHub secrets (L301) — the CI's credentials (L301)          │
   │  the secrets manager (L275) — the runtime's (L301)                │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE INJECTION (L301) ────────────────────────┐
   │  the build-time (L301): the CI's env (L301) — not baked (L293)    │
   │  the runtime (L301): the task references the vault (L275)         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DETECTION (L301) ────────────────────────┐
   │  the scanning (L301) — the leaked key (L301) found (L301)         │
   │  the PR blocked (L297) · the history scrubbed (L301)              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the secret's path: **store → inject → detect** (L301).

## 4. How It Works — The Discipline, Part by Part

- **The one rule (L301).** The secrets never touch the repo or the image (L301): no keys in the code (L301), no keys in the Dockerfile (L293), no keys in the logs (L301).
- **The stores (L301).** The GitHub secrets (L301) — the CI's credentials (L301); the AWS secrets manager (L275) — the runtime's (L301). The OIDC (L297) — the keyless AWS auth for the CI (L297).
- **The injection (L301).** The build-time (L301): the CI's secrets (L301) as the env (L301) or the build args (L301) — never baked into the layers (L289); the runtime (L301): the ECS task (L295) references the secrets manager (L275) — the container (L288) fetches at the start (L301).
- **The detection (L301).** The secret scanning (L301): the committed key (L301) found (L301) in the PR (L297) and the history (L301) — the leak (L301) caught (L301).

> [!NOTE]
> **The build arg is not the secret's home (L301).** The senior answer is careful (L301): the `ARG` in the Dockerfile (L289) is visible in the image's history (L293) — the build-time secret (L301) via the `ARG` (L301) is baked (L293), even if the layer is deleted (L293). The runtime secret (L301) — the key the running app needs (L301) — comes from the secrets manager (L275) at the start (L301), never through the build (L301). The OIDC (L297) removes even the CI's keys (L301).

## 5. Real Project Usage

- **A CI pipeline (L296).** The GitHub secrets (L301) for the CI's credentials (L301) — or the OIDC (L297) for the AWS (L297).
- **A production AI stack (L287).** The task's secrets (L301) from the secrets manager (L275) — the Bedrock key (L278), the DB password (L268).
- **A secret scan (L301).** The scanning (L301) in the CI (L296) — the committed key (L301) blocked (L297).
- **A multi-env setup (L300).** The per-environment secrets (L300) in the secrets manager (L275) — the dev's mocks (L300), the production's real (L275).
- **Anything shipped (L307).** The pipeline (L307) follows the one rule (L301) — the secrets never touch the repo or the image (L301).

The through-line: **the rule is the pipeline's boundary** — the stores, the injection, and the detection (L301).

## 6. Interview Explanation

Say it in four moves:

1. **The rule.** "The secrets never touch the repo or the image (L301)."
2. **The stores.** "The GitHub secrets and the secrets manager (L301)."
3. **The injection.** "The build-time env and the runtime's vault (L301)."
4. **The detection.** "The scanning — the leaks found (L301)."

## 7. Senior-Level Insights

- **The OIDC is the CI's keyless path (L297).** The workflow (L297) assumes the role (L262) — no AWS keys (L275) in the GitHub secrets (L301) — the L297 move (L297), the L301 rule (L301) upheld (L301).
- **The runtime's secrets come from the vault (L275).** The task (L295) references the secrets manager (L275) — the container (L288) fetches at the start (L301) — never baked (L293).
- **The build-time is the danger zone (L301).** The `ARG` and the env (L301) — the layers (L289) and the history (L293) — the build-time secrets (L301) minimized (L301).
- **The scanning is the leak's net (L301).** The secret scanning (L301) in the PR (L297) — the committed key (L301) blocked before the merge (L301).
- **The rotation is the leak's containment (L275).** The rotated keys (L275) — the L275 rotation (L275), the leak's blast radius (L314) bounded (L301).

## 8. Common Mistakes

- **The key in the repo (L301).** The committed key (L301) — the L321 rule (L321) broken (L301).
- **The key in the image (L293).** The baked secret (L293) — the image (L288) is the artifact (L289) — the L293 warning (L293), the L301 rule (L301).
- **The key in the logs (L301).** The printed credential (L301) — the masking (L301) is the guard (L301).
- **The build-time secrets (L301).** The `ARG` secrets (L301) — the layers (L289) hold them (L293); the runtime's vault (L275) is the home (L301).
- **The scan skipped (L301).** The un-scanned history (L301) — the leaked key (L301) undetected (L301).

## 9. Best Practices

- **Store, don't commit** (L301) — the GitHub secrets (L301), the secrets manager (L275).
- **Inject at the runtime** (L301) — the task's vault reference (L275).
- **Use the OIDC** (L297) — the CI's keyless AWS (L297).
- **Scan the secrets** (L301) — the PR gate (L297).
- **Rotate the leaks** (L275) — the containment (L314).

## 10. Interview Questions

**Q: What's the one rule for the secrets in the CI/CD?**
> A: The secrets never touch the repo or the image (L301). No keys in the code (L301), no keys in the Dockerfile (L293), no keys in the logs (L301) — the secrets live in the stores (L301) and are injected (L301).

**Q: How does the CI get the AWS access?**
> A: The OIDC (L297) — the keyless path (L301): the workflow (L297) uses the `configure-aws-credentials` action (L297), the GitHub's OIDC issuer (L297) is trusted by the IAM role (L262), and the workflow assumes the role (L262) per run (L297) — no AWS keys (L275) in the GitHub secrets (L301) to leak (L301).

**Q: How do the runtime secrets get to the container?**
> A: From the vault (L301): the ECS task (L295) references the secrets manager (L275) — the container (L288) fetches the secret at the start (L301). The key never goes through the build (L301) — the layers (L289) and the image's history (L293) stay clean (L301).

**Q: What if a key leaks?**
> A: Three moves (L301): the detection — the scanning (L301) finds it (L301); the rotation — the key rotated (L275), the leak's blast radius (L314) bounded (L301); and the scrubbing — the history (L301) cleaned, the future scans (L301) gated (L301).

## 11. Follow-Up Questions

- What's the one rule (L301)?
- What are the stores (L301)?
- What's the injection (L301)?
- What's the OIDC (L297)?
- What if a key leaks (L301)?

## 12. Comparison Table — The Secret's Homes

| | The repo (L301) | The image (L293) | The store (L301) |
|---|---|---|---|
| The rule (L301) | never (L301) | never (L301) | the home (L301) |
| The leak (L301) | the history (L301) | the artifact (L289) | the scoped access (L262) |
| The rotation (L275) | hard (L301) | harder (L293) | the scheduled (L275) |
| The use (L301) | — | — | the CI (L301), the runtime (L301) |

The senior read: **the only home is the store** — the repo and the image are the leak's (L301).

## 13. Code Example — The Discipline, Applied

```yaml
# The one rule (L301) — the secrets never touch the repo or the image (L301).
name: ai-pipeline

on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    # THE OIDC (L297) — the keyless AWS (L301).
    permissions:
      id-token: write
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/ci   # L262
          aws-region: us-east-1

      - run: |
          docker build -t ai-service:${{ github.sha }} .      # L289
          # the build-time secrets (L301): the GitHub secrets (L301)
          # as the env (L301) — never baked into the layers (L293).
        env:
          MODEL_KEY: ${{ secrets.MODEL_KEY }}                # L301

      # THE SCAN (L301) — the committed keys caught (L301).
      - uses: gitleaks/gitleaks-action@v2

      - run: ecs-deploy --image ai-service:${{ github.sha }}
        # the runtime secrets (L301): the ECS task references the
        # secrets manager (L275) — the container fetches at the start (L301).
```

```text
What the reader must SEE — the discipline, applied:

  id-token: write + role   → the OIDC, keyless (L297, L262)
  MODEL_KEY from the env   → the build-time injection (L301)
  gitleaks scan            → the detection (L301)
  the task's vault ref     → the runtime injection (L275, L301)

  Stored, injected, detected — never committed, never baked (L301).
```

```narrate
7-9: The OIDC — the keyless AWS role for the pipeline (L297, L262).
11-16: The build — the image built with the secrets from the GitHub env, never baked (L289, L301).
19-20: The scan — the secret scanning catches the committed keys (L301).
22-25: The runtime — the task references the vault; the container fetches at the start (L275, L301).
```

> [!TIP]
> The pair that defines the discipline: **the OIDC role** (the keyless CI, L297) and **the task's vault reference** (the runtime injection, L275). **Store, inject, scan — the one rule (L301): the secrets never touch the repo or the image (L301).**

## 14. Performance Notes

- **The OIDC is the zero-key path (L297).** No keys to rotate (L275) — the CI's auth (L297) automatic (L301).
- **The runtime injection is the start's cost (L301).** The vault fetch (L275) at the start (L301) — the seconds (L301) for the safety (L301).
- **The scan is the CI's time (L301).** The gitleaks step (L301) — the seconds (L301) for the leak's net (L301).
- **The rotation is the ops' cost (L275).** The scheduled rotation (L275) — the leak's containment (L314) for the small cost (L301).

## 15. Debugging Scenarios

| Symptom | First check (L301) | The lever |
|---|---|---|
| The key is in the repo | The history (L301) | The scan (L301), the rotation (L275) |
| The container has the key | The image (L293) | The runtime injection (L301) |
| The CI can't access AWS | The OIDC (L297) | The role's trust (L262) |
| The task fails at the start | The vault (L275) | The task's secret references (L275) |
| The key is in the logs | The masking (L301) | The redaction (L301) |

## 16. Quick Revision Notes

- The secrets in the CI/CD = **the one rule** (L301): the secrets never touch the repo or the image.
- The stores: **the GitHub secrets (L301) and the secrets manager (L275)**.
- The injection: **the build-time env (L301), the runtime's vault (L275)**.
- The detection: **the secret scanning (L301) — the PR gate (L297)**.
- The keyless path: **the OIDC (L297) — the assumed role (L262)**.

## 17. Cheat Sheet

```text
SECRETS IN CI/CD = the one rule: never the repo, never the image

THE RULE (L301)
  the secrets never touch the repo or the image (L301)
  no keys in the code (L301) · no keys in the Dockerfile (L293)
  no keys in the logs (L301)

THE STORES (L301)
  the GitHub secrets (L301) — the CI's credentials (L301)
  the secrets manager (L275) — the runtime's (L301)
  the OIDC (L297) — the keyless AWS (L297)

THE INJECTION (L301)
  the build-time (L301) — the CI's env (L301), not baked (L293)
  the runtime (L301) — the task's vault reference (L275)

THE DETECTION (L301)
  the secret scanning (L301) — the committed keys (L301) found (L301)
  the PR gate (L297) · the history scrubbed (L301)

THE L321 RULE (L321), PIPELINE-SHAPED (L301)
  the keys never reach the client (L321) — and never the repo (L301)

INTERVIEW, 4 MOVES
  1 rule    "never the repo, never the image (L301)"
  2 stores  "the GitHub secrets, the vault (L301)"
  3 injection "the build-time env, the runtime's vault (L301)"
  4 detection "the scanning — the leaks found (L301)"
```

## 18. Key Takeaways

> [!RECAP]
> - The secrets in the CI/CD follow **the one rule** (L301): the secrets never touch the repo or the image (L301)
> - **The stores** (L301): the GitHub secrets (L301) for the CI's credentials (L301), the AWS secrets manager (L275) for the runtime's (L301) — with the OIDC (L297) as the CI's keyless path (L301)
> - **The injection** (L301): the build-time (L301) — the CI's secrets (L301) as the env (L301), never baked into the layers (L289, L293); the runtime (L301) — the ECS task (L295) references the secrets manager (L275), and the container (L288) fetches at the start (L301)
> - **The detection** (L301): the secret scanning (L301) — the committed keys (L301) found (L301) in the PR (L297) and the history (L301)
> - **The OIDC** (L297) removes even the CI's keys (L301): the workflow (L297) assumes the IAM role (L262) per run (L297) — no long-lived keys (L275) to leak (L301)
> - The L321 rule (L321), pipeline-shaped (L301): the keys never reach the client (L321) — and never the repo or the image (L301)

## Check your understanding

Answer these without looking back.

1. What's the one rule (L301)?
2. What are the stores (L301)?
3. What's the injection (L301)?
4. What's the OIDC (L297)?
5. What if a key leaks (L301)?
6. Why not the build args (L301)?
7. What's the scanning (L301)?
8. What is the L321 rule, pipeline-shaped (L301)?

## A Closing Note — The Keys, Locked

You now hold the discipline: **the one rule, the stores, the injection, and the detection — with the OIDC keyless and the vault at the runtime.** The pipeline has its boundary — and the keys are locked (L301).

Next: the ways to ship — Deployment Strategies (L302).
