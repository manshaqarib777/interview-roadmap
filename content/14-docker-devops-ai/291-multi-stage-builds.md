# Lesson 291 — Multi-Stage Builds

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you ship a small image?" — the answer is *the multi-stage build*: the build stage and the runtime stage — build once, ship the runtime (L291).**

L289 wrote the recipe; this lesson is **the slimming move**: the multi-stage build — the build stage (the toolchain: the compile, the install, L291) and the runtime stage (the artifacts only, L291) — build once, ship the runtime (L291). The AI service's shape (L173): the TypeScript compile (L291), the native deps (L291), and the slim runtime (L291) — the image small and the attack surface small (L293). This lesson is the image-slimming move (L291).

The distinction this lesson is built on: a **demo** ships the toolchain. A **solutions architect** ships the runtime (L291): the build stage (L291), the runtime stage (L291), and the copy of the artifacts (L291) — because the L307 pipeline (L307) ships the image (L291).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the build stage: the toolchain (L291)
- Explain the runtime stage: the artifacts only (L291)
- Explain the copy: the artifacts across the stages (L291)
- Explain the cache: the stage reuse (L291)
- Explain the AI shape: the slim, safe image (L291)

## 1. One-Line Definition

**The multi-stage build is the image-slimming move (L291) — the build stage (the toolchain: the compile, the install, the heavy dependencies, L291) and the runtime stage (the artifacts only: the compiled output and the production dependencies, L291) — the build stage compiles, the `COPY --from` carries the artifacts across (L291), and the runtime stage ships — build once, ship the runtime (L291).**

The one-sentence interview answer: *"The multi-stage build ships a small image (L291). The idea: two stages in one Dockerfile (L291). The build stage (L291): the full toolchain — the compiler (L291), the build tools (L291), the dev dependencies (L291) — compiles the code and installs the production dependencies (L291). The runtime stage (L291): a fresh base (L291) — the slim runtime (L291) — copies only the artifacts (L291): the compiled output (L291) and the production `node_modules` (L291). The bridge (L291): the `COPY --from=build` (L291) carries the artifacts from the build stage to the runtime stage (L291). The result (L291): the image (L288) contains the runtime and the artifacts (L291) — not the compiler, the build tools, or the dev dependencies (L291) — the image is small (L291) and the attack surface (L293) is small (L291). The AI shape (L291): the TypeScript API (L233) — the build stage compiles (L291), the runtime stage runs the `dist` (L291); the Python service (L289) — the build stage installs, the runtime stage copies the site-packages (L291). Build once, ship the runtime (L291)."*

## 2. Mental Model

Think of the multi-stage build as **the chef and the delivery kitchen.** The prep kitchen (the build stage, L291) is where the heavy work happens: the butchering (the compile, L291), the prep (the install, L291), the full staff (the toolchain, L291). The delivery kitchen (the runtime stage, L291) is the clean, small kitchen that ships: it has the ovens (the runtime, L291) and the finished dishes (the artifacts, L291) — but not the butchers (the compilers, L291) or the prep mess (the build tools, L291). The pass-through window (the `COPY --from`, L291) carries only the finished dishes (the artifacts, L291) from the prep to the delivery (L291). The customer (the container runtime, L295) gets the dish (the image, L288) — not the prep kitchen (L291). The kitchens work because the prep is separated, and only the finished dishes pass through (L291).

```text
   the kitchens (the multi-stage, L291)
   ┌────────────────────────────────────────────────────────┐
   │ the prep kitchen (the build stage, L291) — the compile, │
   │ the install, the toolchain (L291)                      │
   │ the pass-through (the COPY --from, L291) — the         │
   │ artifacts only (L291)                                  │
   │ the delivery kitchen (the runtime stage, L291) — the   │
   │ slim runtime (L291)                                    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the kitchens**: the prep, the pass-through, and the delivery (L291).

## 3. Visual Flow — One Multi-Stage Build

```text
   the code (L291)
        │
        ▼
   ┌────────────────────── THE BUILD STAGE (L291) ──────────────────────┐
   │  FROM node:22 AS build          ← the full toolchain (L291)       │
   │  COPY . . · npm ci              ← the install (L291)              │
   │  RUN npm run build              ← the compile (L291)              │
   └──────────────────────────┬───────────────────────────────────────┘
                              │  the COPY --from (L291)
                              ▼
   ┌────────────────────── THE RUNTIME STAGE (L291) ───────────────────┐
   │  FROM node:22-slim AS runtime   ← the slim base (L291)            │
   │  COPY --from=build /app/dist ./dist    ← the artifacts (L291)     │
   │  COPY --from=build /app/node_modules ./node_modules               │
   │  CMD ["node", "dist/server.js"] ← the start (L289)                │
   └──────────────────────────────────────────────────────────────────┘
      THE RESULT (L291) — the image: the runtime + the artifacts (L291)
      the toolchain excluded (L291) · the attack surface small (L293)
```

The flow is the move: **build → copy the artifacts → ship the runtime** (L291).

## 4. How It Works — The Move, Part by Part

- **The build stage (L291).** The full toolchain (L291): the compiler (L291), the build tools (L291), the dev dependencies (L291) — compiles the code (L291) and installs the production dependencies (L291). The build stage is the heavy kitchen (L291).
- **The runtime stage (L291).** The fresh, slim base (L291): the runtime only (L291) — the artifacts (L291) copied in (L291). The runtime stage is what ships (L291).
- **The copy (L291).** The `COPY --from=build` (L291): the artifacts carried from the build stage (L291) to the runtime stage (L291) — the compiled output (L291), the production dependencies (L291).
- **The cache (L291).** The stages cached (L289): the unchanged layers (L289) reused (L291) — the build stage's cache (L291) and the runtime stage's base (L291).
- **The result (L291).** The image (L288): the runtime and the artifacts (L291) — the toolchain excluded (L291) — the image small (L291), the attack surface (L293) small (L291).

> [!NOTE]
> **The multi-stage is the size and the security (L291).** The senior answer names both wins (L291): the size (L291) — the compiler and the build tools (L291) excluded, the image (L288) drops from the GBs to the hundreds of MBs (L291); and the security (L293) — the attack surface (L293) is the runtime's packages only (L291), not the toolchain's (L291). The multi-stage (L291) is the L289 recipe's senior move (L291).

## 5. Real Project Usage

- **A TypeScript API (L233).** The build stage compiles (L291); the runtime stage runs the `dist` (L291) — the slim Node image (L291).
- **A Python service (L289).** The build stage installs (L291); the runtime stage copies the site-packages (L291) — the slim Python image (L291).
- **A training job (L365).** The build stage compiles the CUDA kernels (L291); the runtime stage copies the artifacts (L291).
- **A frontend (L96).** The build stage runs the Next.js build (L96); the runtime stage serves the static output (L291).
- **Anything shipped (L307).** The pipeline (L307) builds the multi-stage image (L291) — the small artifact (L291).

The through-line: **the move is the slim image** — the toolchain in the build, the artifacts in the runtime (L291).

## 6. Interview Explanation

Say it in four moves:

1. **The build stage.** "The toolchain — the compile, the install (L291)."
2. **The runtime stage.** "The slim base — the artifacts only (L291)."
3. **The copy.** "The `COPY --from` carries the artifacts across (L291)."
4. **The result.** "The image small, the attack surface small (L291, L293)."

## 7. Senior-Level Insights

- **The multi-stage is the size's lever (L291).** The compiler and the build tools (L291) excluded — the image (L288) from the GBs to the hundreds of MBs (L291) — the pull (L288) and the start (L288) fast (L291).
- **The multi-stage is the security's lever (L293).** The attack surface (L293) is the runtime's packages (L291) — not the toolchain's (L291) — the L293 threat model (L293), slimmed (L291).
- **The cache is the build's speed (L289).** The stages' layers (L289) cached (L291) — the CI (L296) builds fast (L291).
- **The dist is the artifact (L291).** The compiled output (L291) — the artifact (L289) the pipeline (L307) ships (L291).
- **The base is the pin (L293).** The slim base pinned (L293) — the reproducibility (L289), slim-shaped (L291).

## 8. Common Mistakes

- **The single stage (L291).** The toolchain in the shipped image (L291) — the image fat (L291), the surface (L293) wide (L291).
- **The dev deps in the runtime (L291).** The `node_modules` with the dev packages (L291) — the `npm ci --omit=dev` (L291) is the fix (L291).
- **The COPY without the --from (L291).** The wrong stage's files (L291) — the `COPY --from=build` (L291) is the bridge (L291).
- **The cache unfriendly order (L289).** The code before the deps (L289) — the cache (L291) invalidated (L289).
- **The non-slim base (L291).** The full base in the runtime (L291) — the slim variant (L291) is the runtime's (L291).

## 9. Best Practices

- **Two stages** (L291) — the build (L291) and the runtime (L291).
- **Ship the artifacts** (L291) — the `COPY --from` (L291).
- **Omit the dev deps** (L291) — `npm ci --omit=dev` (L291).
- **Slim the base** (L291) — the `-slim` variants (L291).
- **Order for the cache** (L289) — the deps first (L289).

## 10. Interview Questions

**Q: Walk me through a multi-stage build.**
> A: The image-slimming move (L291). The build stage — the full toolchain: the compile, the install, the dev deps (L291). The runtime stage — the fresh slim base: the artifacts only (L291). The bridge — the `COPY --from=build` carries the artifacts (L291). The result — the image with the runtime, not the toolchain (L291).

**Q: Why does it matter?**
> A: Two wins (L291): the size — the compiler and the build tools (L291) excluded, the image (L288) small (L291); and the security — the attack surface (L293) is the runtime's packages only (L291). The pull (L288) is fast and the surface (L293) is small (L291).

**Q: How do you carry the artifacts?**
> A: The `COPY --from=build` (L291): the runtime stage (L291) copies the compiled output and the production dependencies (L291) from the build stage (L291) — the artifacts (L291), not the toolchain (L291).

**Q: How do you keep the runtime slim?**
> A: Three moves (L291): the slim base variant (L291); the production dependencies only — `npm ci --omit=dev` (L291); and the artifacts only — no source maps and no build tools (L291).

## 11. Follow-Up Questions

- What's the build stage (L291)?
- What's the runtime stage (L291)?
- What's the COPY --from (L291)?
- Why does it matter (L291)?
- How do you keep the runtime slim (L291)?

## 12. Comparison Table — Single vs Multi-Stage

| | The single stage (L291) | The multi-stage (L291) |
|---|---|---|
| The image (L288) | the toolchain + the app (L291) | the runtime + the artifacts (L291) |
| The size (L291) | the GBs (L291) | the hundreds of MBs (L291) |
| The surface (L293) | the toolchain's packages (L293) | the runtime's packages (L291) |
| The pull (L288) | slow (L291) | fast (L291) |
| The AI use (L291) | the demo (L291) | the shipped service (L307) |

The senior read: **the right column ships** — the runtime and the artifacts, nothing else (L291).

## 13. Code Example — The Move

```dockerfile
# The multi-stage build (L291) — build once, ship the runtime (L291).

# 1 · THE BUILD STAGE (L291) — the full toolchain (L291).
FROM node:22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                              # the full install (L291)
COPY . .
RUN npm run build                       # the compile (L291) — the dist (L291)

# 2 · THE RUNTIME STAGE (L291) — the slim base, the artifacts (L291).
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 3 · THE PRODUCTION DEPS (L291) — without the dev packages (L291).
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# 4 · THE ARTIFACTS (L291) — the compiled output (L291).
COPY --from=build /app/dist ./dist

# 5 · THE START (L289) — the runtime runs the artifacts (L291).
USER node
CMD ["node", "dist/server.js"]
```

```text
What the reader must SEE — the move, declared:

  FROM node:22 AS build      → the toolchain stage (L291)
  npm run build              → the compile (L291)
  FROM node:22-slim AS runtime → the slim stage (L291)
  COPY --from=build /app/dist → the artifacts bridge (L291)
  node_modules from the build → the prod deps only (L291)
  USER node + CMD            → the non-root start (L293, L289)

  The toolchain in the build, the runtime in the ship (L291).
```

```narrate
3-7: The build stage — the full Node image compiles the code and installs the dependencies (L291).
9-11: The runtime stage — the slim base with the production environment (L291).
13-14: The production dependencies — copied from the build stage, without the dev packages (L291).
16-17: The artifacts — the compiled output copied across (L291).
19-20: The start — the non-root user runs the artifacts (L293, L289).
```

> [!TIP]
> The pair that defines the multi-stage: **the build stage's compile** (the toolchain, L291) and **the `COPY --from` artifacts** (the runtime, L291). **Build with the toolchain, ship the runtime — the image-slimming move (L291).**

## 14. Performance Notes

- **The size is the pull's speed (L291).** The slim image (L291) — the pull (L288) and the start (L288) fast (L291) — the ECS (L295) and the k8s (L306) scale fast (L291).
- **The cache is the build's speed (L289).** The stages' layers (L289) cached (L291) — the CI (L296) builds in seconds (L291).
- **The runtime is the memory (L291).** The slim base (L291) — the container (L288) uses less (L291) — the density (L288) up (L291).
- **The surface is the scan's cost (L293).** The runtime's packages (L291) — the L293 scans (L293) smaller (L291).

## 15. Debugging Scenarios

| Symptom | First check (L291) | The lever |
|---|---|---|
| The image is huge | The stages (L291) | The multi-stage (L291) |
| The runtime has the dev deps | The install (L291) | `npm ci --omit=dev` (L291) |
| The dist is missing | The COPY (L291) | The `COPY --from=build` (L291) |
| The build is slow | The order (L289) | The deps first, cached (L289) |
| The container fails to start | The artifacts (L291) | The dist's entrypoint (L289) |

## 16. Quick Revision Notes

- The multi-stage build = **the image-slimming move** (L291): the build stage, the runtime stage, the copy.
- The build stage: **the toolchain — the compile, the install** (L291).
- The runtime stage: **the slim base — the artifacts only** (L291).
- The copy: **the `COPY --from` — the artifacts across** (L291).
- The result: **the image small (L291), the surface small (L293)**.

## 17. Cheat Sheet

```text
MULTI-STAGE BUILDS = build once, ship the runtime

THE BUILD STAGE (L291)
  FROM node:22 AS build (L291)
  the toolchain: the compiler, the build tools, the dev deps (L291)
  the compile (L291) · the install (L291)

THE RUNTIME STAGE (L291)
  FROM node:22-slim AS runtime (L291)
  the slim base (L291) · the artifacts only (L291)

THE COPY (L291)
  COPY --from=build /app/dist ./dist (L291)
  the compiled output + the production deps (L291)

THE WINS (L291)
  the size — the GBs to the hundreds of MBs (L291)
  the security — the attack surface is the runtime's packages (L293)

THE AI SHAPE (L291)
  the TypeScript API (L233) — the dist (L291)
  the Python service (L289) — the site-packages (L291)
  the frontend (L96) — the static output (L291)

INTERVIEW, 4 MOVES
  1 build stage "the toolchain — the compile (L291)"
  2 runtime stage "the slim base — the artifacts (L291)"
  3 copy       "the COPY --from (L291)"
  4 result     "small image, small surface (L291, L293)"
```

## 18. Key Takeaways

> [!RECAP]
> - The multi-stage build is **the image-slimming move** (L291): the build stage (L291), the runtime stage (L291), and the `COPY --from` (L291)
> - **The build stage** (L291) is the full toolchain — the compiler (L291), the build tools (L291), and the dev dependencies (L291) — it compiles the code (L291) and installs the production dependencies (L291)
> - **The runtime stage** (L291) is the fresh, slim base (L291) — the artifacts only (L291): the compiled output (L291) and the production `node_modules` (L291)
> - **The `COPY --from=build`** (L291) carries the artifacts from the build stage to the runtime stage (L291)
> - **The wins** (L291): the size — the GBs to the hundreds of MBs (L291) — and the security — the attack surface (L293) is the runtime's packages only (L291)
> - The AI shape (L291): the TypeScript API (L233) runs the `dist` (L291), the Python service (L289) copies the site-packages (L291) — build once, ship the runtime (L291)

## Check your understanding

Answer these without looking back.

1. What's the build stage (L291)?
2. What's the runtime stage (L291)?
3. What's the COPY --from (L291)?
4. Why does it matter (L291)?
5. How do you keep the runtime slim (L291)?
6. What's the security win (L293)?
7. What's the cache's role (L289)?
8. What is the image-slimming move (L291)?

## A Closing Note — The Kitchens, Split

You now hold the slimming move: **the build stage, the runtime stage, and the copy — with the toolchain left behind.** The recipe now ships the runtime — and the image is slim (L291).

Next: the container's streets — Container Networking (L292).
