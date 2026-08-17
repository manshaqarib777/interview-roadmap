# Lesson 293 — Container Security

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you secure the container?" — the answer is *the threat model*: non-root, pinned base images, scanning — the container's attack surface (L293).**

L288 defined the unit and L291 slimmed it; this lesson is **the unit's threat model**: the container security — the non-root user (the least privilege, L293), the pinned base images (the reproducibility and the known-good bases, L293), and the scanning (the vulnerabilities in the supply chain, L293). The AI service's shape (L173): the container (L288) runs non-root (L293), the base is pinned (L293), and the image is scanned in the CI (L296). This lesson is the L172 baseline, container-shaped (L293).

The distinction this lesson is built on: a **demo** runs as root. A **solutions architect** designs the container's security (L293): the non-root (L293), the pinned base (L293), and the scans (L293) — because the L307 pipeline (L307) ships the container (L293).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the non-root: the least privilege (L293)
- Explain the pinned base: the known-good images (L293)
- Explain the scanning: the supply-chain vulnerabilities (L293)
- Explain the layers: the secrets and the bloat (L293)
- Explain the AI shape: the L172 baseline, container-shaped (L293)

## 1. One-Line Definition

**The container security is the container's threat model (L293) — the non-root user (the process runs without the root privileges, L293), the pinned base images (the known-good, scanned bases — not the latest, L293), the scanning (the image and the dependencies scanned for the vulnerabilities in the CI, L296), and the layers (the secrets L301 and the bloat L291 out of the image, L293) — the L172 baseline, container-shaped (L293).**

The one-sentence interview answer: *"The container security is the container's threat model (L293). The rules (L293): the non-root (L293) — the process runs as an unprivileged user (L293), so the container breakout (L293) doesn't grant the root (L293); the pinned base (L293) — the base image (L289) pinned to a specific tag (L293), a known-good, scanned base (L293) — not the `latest` (L291); the scanning (L293) — the image (L288) and the dependencies (L289) scanned for the known vulnerabilities (L293) in the CI (L296), with the gate (L293) failing the build (L296) on the critical findings (L293); and the layers (L293) — the secrets (L301) never baked in (L293), the bloat (L291) slimmed (L293). The AI shape (L173): the model service (L278) runs non-root (L293), the base pinned (L293), and the image scanned (L293) on every commit (L296) — the L172 baseline (L172), container-shaped (L293). The demo runs as root and hopes; the architect runs non-root and scans (L293)."*

## 2. Mental Model

Think of the container security as **the apartment's key policy.** The building (the host, L292) hands out the keys (the privileges, L293): the root key (L293) opens everything — the apartment, the boiler room, the street doors (L293); the non-root key (L293) opens only the tenant's apartment (L293). The tenants (the containers, L288) get the non-root keys (L293): a thief (the attacker, L293) with a tenant key (L293) reaches only that apartment (L293) — not the whole building (L293). The building also vets the residents (the scanning, L293): the background checks (the vulnerability scans, L293) on the move-in (the build, L296), with the felonies (the critical CVEs, L293) rejected (L293). And the mailroom (the image, L288) never holds the master keys (the secrets, L301). The building works because the keys are scoped, the residents are vetted, and the master keys never ship (L293).

```text
   the key policy (the container security, L293)
   ┌────────────────────────────────────────────────────────┐
   │ the keys (the privileges, L293) — the non-root (L293)  │
   │ the vetting (the scanning, L293) — the CVEs (L293)     │
   │ the mailroom (the image, L288) — no master keys (L301) │
   │ the tenants (the containers, L288) — scoped (L293)     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the key policy**: the scoped keys, the vetting, and the clean mailroom (L293).

## 3. Visual Flow — The Container's Defenses

```text
   the image (L288)
        │
        ▼
   ┌────────────────────── THE BASE (L293) ─────────────────────────────┐
   │  the pinned tag (L293) — not the latest (L291)                    │
   │  the known-good, scanned base (L293)                              │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE BUILD (L293) ────────────────────────────┐
   │  the layers (L289) — the secrets out (L301), the bloat slimmed    │
   │  (L291)                                                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCAN (L293) ─────────────────────────────┐
   │  the image + the dependencies scanned (L293)                      │
   │  the critical CVEs → the build fails (L296)                       │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RUN (L293) ──────────────────────────────┐
   │  the non-root user (L293) · the read-only fs (L293)               │
   │  the minimal capabilities (L293)                                  │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the defenses: **pinned base → clean build → scan → non-root run** (L293).

## 4. How It Works — The Model, Part by Part

- **The non-root (L293).** The process runs as an unprivileged user (L293): the `USER` in the Dockerfile (L289) — the container breakout (L293) doesn't grant the root (L293).
- **The pinned base (L293).** The base image (L289) pinned to a specific tag (L293) — a known-good, scanned base (L293) — not the `latest` (L291). The pin is the reproducibility (L289) and the security (L293).
- **The scanning (L293).** The image (L288) and the dependencies (L289) scanned for the known vulnerabilities (L293) in the CI (L296) — with the gate (L293): the critical findings (L293) fail the build (L296).
- **The layers (L293).** The secrets (L301) never baked into the layers (L293) — the L301 rule (L301); the bloat (L291) slimmed — the smaller surface (L291).

> [!NOTE]
> **The supply chain is the container's attack surface (L293).** The senior answer widens the model (L293): the container (L288) is not just the code (L293) — it's the base image (L293), the dependencies (L289), and the registry (L294) — the whole supply chain (L293). The pin (L293) and the lockfile (L289) fix the supply chain's versions (L293); the scan (L293) checks them; and the registry (L294) controls where the images come from (L293).

## 5. Real Project Usage

- **A model service (L278).** The container (L288) runs non-root (L293), the base pinned (L293), the image scanned (L293) in the CI (L296).
- **A worker (L249).** The SQS consumer (L270) with the read-only filesystem (L293) — the minimal capabilities (L293).
- **A CI pipeline (L296).** The scans (L293) in the workflow (L297) — the critical CVEs gate the build (L296).
- **A regulated workload (L371).** The signed images (L293) and the scanned supply chain (L293) — the compliance (L371) evidence (L322).
- **Anything shipped (L307).** The pipeline (L307) ships the secured container (L293) — the non-root, the pinned, the scanned (L293).

The through-line: **the threat model is the container's security** — the non-root, the pinned, the scanned (L293).

## 6. Interview Explanation

Say it in four moves:

1. **The non-root.** "The process runs unprivileged — the breakout doesn't grant the root (L293)."
2. **The pin.** "The base pinned to a known-good tag (L293) — not the latest (L291)."
3. **The scan.** "The image and the deps scanned — the critical CVEs fail the build (L296)."
4. **The layers.** "The secrets out (L301), the bloat slimmed (L291)."

## 7. Senior-Level Insights

- **The non-root is the breakout's containment (L293).** The container breakout (L293) — the unprivileged user (L293) — the blast radius (L314) is the tenant's (L293).
- **The pin is the supply chain's fix (L293).** The base and the dependencies (L289) pinned (L293) — the supply chain's versions (L293) fixed — the L293 supply-chain model (L293).
- **The scan is the gate (L293).** The CI (L296) scans (L293) — the critical CVEs (L293) fail the build (L296) — the vulnerability (L293) never ships (L307).
- **The read-only fs is the runtime's lock (L293).** The container's filesystem read-only (L293) — the runtime writes (L293) blocked (L293) — the attacker's foothold (L293) small (L293).
- **The secrets are the image's boundary (L301).** The secrets (L301) never in the layers (L293) — the L301 rule (L301), container-shaped (L293).

## 8. Common Mistakes

- **The root runtime (L293).** The process as root (L293) — the breakout (L293) is the host's compromise (L293).
- **The latest base (L291).** The unpinned `FROM node:latest` (L291) — the supply chain (L293) unknown (L293).
- **The scan skipped (L293).** The image un-scanned (L293) — the known CVEs (L293) ship (L307).
- **The secret in the layer (L301).** The key baked in (L301) — the image (L288) is the artifact (L289) — the L301 rule (L301) broken (L293).
- **The writable fs (L293).** The container's filesystem writable (L293) — the read-only (L293) is the lock (L293).

## 9. Best Practices

- **Run non-root** (L293) — the `USER` in the recipe (L289).
- **Pin the base** (L293) — the known-good tag (L293).
- **Scan in the CI** (L296) — the gate on the critical CVEs (L293).
- **Keep the secrets out** (L301) — the env and the secrets manager (L275).
- **Lock the runtime** (L293) — the read-only fs, the minimal capabilities (L293).

## 10. Interview Questions

**Q: Walk me through the container security.**
> A: The threat model (L293). The non-root — the process runs unprivileged (L293). The pin — the base pinned to a known-good tag (L293). The scan — the image and the deps scanned in the CI (L296). And the layers — the secrets out (L301), the bloat slimmed (L291).

**Q: Why the non-root user?**
> A: The breakout's containment (L293). The container (L288) shares the host's kernel (L288) — if the process runs as root (L293), the breakout (L293) is the host's root (L293). The unprivileged user (L293) — the `USER` in the Dockerfile (L289) — bounds the blast radius (L314) to the container (L293).

**Q: How do you scan the image?**
> A: In the CI (L296): the scan step (L293) checks the image (L288) and the dependencies (L289) against the vulnerability databases (L293) — the critical CVEs (L293) fail the build (L296). The scan (L293) is the supply chain's gate (L293).

**Q: What's the supply chain's role?**
> A: The container (L288) is the code plus the base (L293) plus the dependencies (L289) plus the registry (L294) (L293). The pin (L293) and the lockfile (L289) fix the versions (L293); the scan (L293) checks them; the registry (L294) controls where they come from (L293) — the supply chain (L293) is the attack surface (L293).

## 11. Follow-Up Questions

- What's the non-root (L293)?
- What's the pin (L293)?
- What's the scan (L293)?
- What's in the layers (L293)?
- What's the supply chain (L293)?

## 12. Comparison Table — The Demo vs the Secured Container

| | The demo container (L293) | The secured container (L293) |
|---|---|---|
| The user (L293) | the root (L293) | the non-root (L293) |
| The base (L293) | the latest (L291) | the pinned, scanned (L293) |
| The scan (L293) | none (L293) | the CI gate (L296) |
| The secrets (L301) | in the layer (L301) | in the env (L301) |
| The fs (L293) | writable (L293) | the read-only (L293) |

The senior read: **the right column ships** — the least privilege, the known base, the checked supply chain (L293).

## 13. Code Example — The Secured Recipe

```dockerfile
# The secured container (L293) — the threat model in the recipe (L293).
# 1 · THE PINNED BASE (L293) — the known-good tag, not the latest (L291).
FROM node:22-slim@sha256:abc123... AS runtime

# 2 · THE LAYERS (L293) — the secrets never baked in (L301).
#     the ARG for the build-time values — never the runtime secrets (L301).

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# 3 · THE NON-ROOT (L293) — the least privilege (L293).
RUN useradd --create-home appuser
USER appuser

# 4 · THE START (L289) — the unprivileged process (L293).
CMD ["node", "dist/server.js"]

# 5 · THE RUN (L293) — the read-only fs, the minimal capabilities (L293).
#     docker run --read-only --cap-drop=ALL --cap-add=NET_BIND_SERVICE ...
```

```text
What the reader must SEE — the model, in the recipe:

  node:22-slim@sha256:... → the pinned base (L293)
  no ARG secrets           → the L301 rule (L301)
  USER appuser             → the non-root (L293)
  --read-only --cap-drop  → the locked runtime (L293)

  Non-root, pinned, scanned — the L172 baseline (L172, L293).
```

```narrate
3-4: The base — the pinned, known-good tag (L293).
6-7: The layers — the secrets never baked in (L301).
9-11: The non-root — the unprivileged user (L293).
13-14: The start — the unprivileged process (L293).
16-17: The run — the read-only filesystem and the minimal capabilities (L293).
```

> [!TIP]
> The pair that defines the container security: **the `USER appuser`** (the least privilege, L293) and **the pinned base** (the known supply chain, L293). **Run non-root, pin the base, scan the image — the container's threat model (L293).**

## 14. Performance Notes

- **The non-root is the zero-cost control (L293).** The `USER` (L289) — no performance cost (L293), the breakout's blast radius (L314) bounded (L293).
- **The scan is the build's time (L293).** The scan step (L293) in the CI (L296) — the seconds (L293) for the gate (L293).
- **The slim is the surface and the speed (L291).** The slim image (L291) — the surface (L293) small, the pull (L288) fast (L293).
- **The read-only is the runtime's safety (L293).** The read-only fs (L293) — the runtime writes (L293) blocked — the attacker's foothold (L293) small (L293).

## 15. Debugging Scenarios

| Symptom | First check (L293) | The lever |
|---|---|---|
| The container runs as root | The recipe (L293) | The `USER appuser` (L293) |
| The build is non-reproducible | The base (L291) | The pinned tag (L293) |
| The known CVE ships | The scan (L293) | The CI gate (L296) |
| The secret is in the image | The layers (L301) | The env and the secrets manager (L275) |
| The runtime writes | The fs (L293) | The read-only mount (L293) |

## 16. Quick Revision Notes

- The container security = **the threat model** (L293): the non-root, the pin, the scan, the layers.
- The non-root: **the unprivileged process (L293) — the breakout's containment (L314)**.
- The pin: **the known-good base (L293) — not the latest (L291)**.
- The scan: **the CI gate (L296) — the critical CVEs fail the build (L293)**.
- The layers: **the secrets out (L301), the bloat slimmed (L291)**.

## 17. Cheat Sheet

```text
CONTAINER SECURITY = the container's threat model

THE NON-ROOT (L293)
  the USER in the recipe (L289) — the unprivileged process (L293)
  the breakout (L293) — the blast radius (L314) is the container's (L293)

THE PIN (L293)
  the base pinned to the known-good tag (L293)
  not the latest (L291) · the supply chain's versions fixed (L293)

THE SCAN (L293)
  the image + the deps scanned (L293) — in the CI (L296)
  the critical CVEs → the build fails (L296)

THE LAYERS (L293)
  the secrets never baked in (L301) — the L301 rule (L301)
  the bloat slimmed (L291) — the small surface (L291)

THE RUNTIME (L293)
  the read-only fs (L293) · the minimal capabilities (L293)
  the L172 baseline (L172), container-shaped (L293)

INTERVIEW, 4 MOVES
  1 non-root "the unprivileged process (L293)"
  2 pin      "the known-good base (L293)"
  3 scan     "the CI gate on the CVEs (L296)"
  4 layers   "the secrets out, the bloat slimmed (L301, L291)"
```

## 18. Key Takeaways

> [!RECAP]
> - The container security is **the container's threat model** (L293): the non-root (L293), the pinned base (L293), the scanning (L293), and the layers (L293)
> - **The non-root** (L293) — the process runs as an unprivileged user (L293) — the breakout (L293) doesn't grant the host's root (L293), the blast radius (L314) bounded (L293)
> - **The pin** (L293) — the base image (L289) pinned to a known-good tag (L293), not the `latest` (L291) — the supply chain's versions fixed (L293)
> - **The scan** (L293) — the image (L288) and the dependencies (L289) scanned in the CI (L296), with the critical CVEs (L293) failing the build (L296)
> - **The layers** (L293) — the secrets (L301) never baked in (L301), the bloat (L291) slimmed (L291)
> - The runtime (L293): the read-only filesystem (L293) and the minimal capabilities (L293) — the L172 baseline (L172), container-shaped (L293)

## Check your understanding

Answer these without looking back.

1. What's the non-root (L293)?
2. What's the pin (L293)?
3. What's the scan (L293)?
4. What's in the layers (L293)?
5. What's the supply chain (L293)?
6. Why the read-only fs (L293)?
7. What's the L301 rule (L301)?
8. What is the L172 baseline, container-shaped (L293)?

## A Closing Note — The Keys, Scoped

You now hold the threat model: **the non-root, the pin, the scan, and the layers — with the breakout contained and the supply chain checked.** The unit has its security — and the keys are scoped (L293).

Next: the AWS image registry — ECR (L294).
