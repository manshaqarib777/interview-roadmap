# Lesson 289 — Dockerfiles

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you write an image?" — the answer is *the Dockerfile*: the instructions, the layers, and the caching — writing images that are small, cached, and reproducible (L289).**

L288 defined the unit; this lesson is **how you build it**: Dockerfiles — the image's recipe: the instructions (the FROM, the COPY, the RUN, L289), the layers (each instruction is a layer, L289), and the caching (the unchanged layers reused, L289). The AI service's shape (L173): the Node image (L289), the dependencies (L289), and the multi-stage build (L291) — the image small, cached, and reproducible (L289). This lesson is the image's recipe (L289).

The distinction this lesson is built on: a **demo** builds a fat image. A **solutions architect** writes the recipe (L289): the layers (L289), the caching (L289), and the reproducibility (L291) — because the L307 pipeline (L307) ships the image (L289).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the instructions: the FROM, the COPY, the RUN (L289)
- Explain the layers: each instruction is a layer (L289)
- Explain the caching: the unchanged layers reused (L289)
- Explain the reproducibility: the pinned bases and the lockfiles (L289)
- Explain the AI shape: the small, cached image (L289)

## 1. One-Line Definition

**The Dockerfile is the image's recipe (L289) — the instructions (the FROM — the base image, the COPY — the files, the RUN — the commands, the CMD — the entrypoint, L289), the layers (each instruction is a layer, cached and reusable, L289), and the reproducibility (the pinned base tags L293 and the lockfiles, L289) — writing images that are small, cached, and reproducible (L289).**

The one-sentence interview answer: *"The Dockerfile is the image's recipe (L289). The instructions (L289): the FROM — the base image, like the Node runtime (L289); the COPY — the files into the image (L289); the RUN — the commands, like the dependency install (L289); and the CMD or the ENTRYPOINT — what runs when the container starts (L289). The layers (L289): each instruction creates a layer (L289) — the layers are cached (L289), so the unchanged instructions (L289) are reused on the next build (L289): the dependency layer (L289) cached until the lockfile changes (L289), the code layer (L289) rebuilt on every commit (L289). The reproducibility (L289): the base image pinned (L293) — not the latest (L291) — and the lockfile committed (L289) — the same dependencies every build (L289). The AI shape (L289): the Node image (L289) with the dependencies cached (L289) and the code copied last (L289) — the image small (L291) and the builds fast (L289) — the L307 pipeline (L307) builds it every commit (L289)."*

## 2. Mental Model

Think of the Dockerfile as **the recipe card for a layered cake.** The recipe (the Dockerfile, L289) lists the steps (the instructions, L289): the base (the FROM — the cake mix, L289), the ingredients (the COPY — the flour and the sugar, L289), the mixing (the RUN — the batter, L289), and the bake (the CMD — what comes out, L289). Each step produces a layer (L289): the base layer, the ingredient layers, the mix layer (L289). The baker (the build, L289) reuses the finished layers (the caching, L289): if the flour hasn't changed (the lockfile, L289), the flour layer is reused (L289) — only the changed steps (the code, L289) are redone (L289). The cake (the image, L288) is reproducible (L289): the same recipe, the same cake (L289). The recipe works because the steps are ordered (L289), the layers are cached (L289), and the ingredients are pinned (L289).

```text
   the recipe (the Dockerfile, L289)
   ┌────────────────────────────────────────────────────────┐
   │ the steps (the instructions, L289): the FROM (the base)│
   │ the COPY (the files) · the RUN (the commands) · the    │
   │ CMD (the start) (L289)                                 │
   │ the layers (L289) — cached (L289)                      │
   │ the ingredients (L289) — pinned, locked (L289)         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the recipe card**: the steps, the layers, and the pinned ingredients (L289).

## 3. Visual Flow — One Build

```text
   the commit (L296)
        │  the build (L289)
        ▼
   ┌────────────────────── THE BUILD (L289) ────────────────────────────┐
   │  FROM node:22-slim          ← the base (L289) — cached (L289)     │
   │  COPY package*.json ./      ← the deps' manifest (L289)           │
   │  RUN npm ci                 ← the install (L289) — cached until   │
   │                               the lockfile changes (L289)         │
   │  COPY . .                   ← the code (L289) — rebuilt every     │
   │                               commit (L289)                       │
   │  CMD ["node", "server.js"]  ← the start (L289)                    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE IMAGE (L288) ────────────────────────────┐
   │  the layers: the base + the deps (cached) + the code (new)        │
   │  the tag: ai-service:abc1234 (L291)                               │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the build: **the base → the deps → the code → the image** (L289).

## 4. How It Works — The Recipe, Part by Part

- **The instructions (L289).** The FROM — the base image (L289); the COPY — the files into the image (L289); the RUN — the commands at the build time (L289); the CMD and the ENTRYPOINT — what runs at the start (L289). The order matters (L289): the slow-changing first, the fast-changing last (L289).
- **The layers (L289).** Each instruction creates a layer (L289): the base layer, the dependency layer, the code layer (L289). The layers are the image's structure (L289) — and the cache's units (L289).
- **The caching (L289).** The unchanged layers are reused (L289): the dependency layer (L289) is cached until the lockfile changes (L289); the code layer (L289) is rebuilt on every commit (L289). The order (L289) is the cache's design (L289).
- **The reproducibility (L289).** The pinned base image (L293) — not the `latest` (L291); the committed lockfile (L289) — the same dependencies every build (L289). The image is reproducible (L289).
- **The AI shape (L289).** The Node image (L289), the dependencies cached (L289), the code copied last (L289) — the small (L291) and the fast (L289) image (L289).

> [!NOTE]
> **The order is the cache's design (L289).** The senior answer orders the instructions by the change frequency (L289): the base (L289) first — the slowest to change; the dependency manifest (L289) next — cached until the lockfile changes (L289); the code (L289) last — rebuilt on every commit (L289). The wrong order (L289) — the code copied before the install (L289) — invalidates the dependency cache (L289) on every commit (L289) — the builds slow (L289).

## 5. Real Project Usage

- **An AI API (L233).** The Node image (L289) with the dependencies cached (L289) — the fast builds (L289) in the CI (L296).
- **A worker (L249).** The SQS consumer (L270) as the image (L289) — the same recipe, the same bytes (L289).
- **A training job (L365).** The Python image with the CUDA base (L289) — the heavy dependencies (L289) cached (L289).
- **A local dev stack (L290).** The Compose (L290) builds the images from the Dockerfiles (L289) — the dev and the prod the same (L288).
- **Anything shipped (L307).** The pipeline (L307) builds the image from the recipe (L289) — every commit (L289).

The through-line: **the recipe is the image's source** — the layers, the cache, and the reproducibility (L289).

## 6. Interview Explanation

Say it in four moves:

1. **The instructions.** "The FROM, the COPY, the RUN, the CMD (L289)."
2. **The layers.** "Each instruction is a layer — cached and reusable (L289)."
3. **The order.** "The slow-changing first, the fast-changing last (L289)."
4. **The reproducibility.** "The pinned base and the lockfile — the same image every build (L289)."

## 7. Senior-Level Insights

- **The order is the cache's design (L289).** The dependency layer (L289) cached until the lockfile changes (L289); the code layer (L289) rebuilt every commit (L289) — the build time (L296) is the order's (L289).
- **The pin is the reproducibility (L293).** The base image pinned (L293) — not the `latest` (L291) — and the lockfile committed (L289) — the same bytes every build (L289).
- **The multi-stage is the size (L291).** The build stage and the runtime stage (L291) — the image small (L291) — the L291 move (L291) is the senior's (L289).
- **The non-root is the security (L293).** The runtime as the non-root user (L293) — the L293 baseline (L293), recipe-shaped (L289).
- **The image is the artifact (L288).** The build's output (L289) — the tag (L291), the registry (L294), and the deployment (L307) — the artifact's chain (L289).

## 8. Common Mistakes

- **The latest base (L291).** The unpinned `FROM node:latest` (L291) — the build non-reproducible (L289); the pin (L293) is the fix (L289).
- **The code copied first (L289).** The COPY before the install (L289) — the dependency cache (L289) invalidated on every commit (L289).
- **The fat image (L291).** The build tools in the runtime (L291) — the multi-stage build (L291) is the slimming move (L289).
- **The root runtime (L293).** The container as root (L293) — the non-root user (L293) is the baseline (L289).
- **The secrets in the build (L301).** The key baked in the layer (L301) — the L301 rule (L301): the secrets never touch the image (L289).

## 9. Best Practices

- **Pin the base** (L293) — the reproducibility (L289).
- **Order by the change** (L289) — the deps cached, the code last (L289).
- **Multi-stage the build** (L291) — the runtime slim (L291).
- **Run non-root** (L293) — the L293 baseline (L293).
- **Keep the secrets out** (L301) — the L301 rule (L301).

## 10. Interview Questions

**Q: Walk me through a Dockerfile.**
> A: The image's recipe (L289). The instructions: the FROM — the base image; the COPY — the files; the RUN — the build commands; the CMD — the start (L289). The layers: each instruction is a layer, cached (L289). The order: the slow-changing first, the fast-changing last (L289). And the reproducibility: the pinned base and the lockfile (L289).

**Q: Why does the order matter?**
> A: The cache (L289). The dependency layer (L289) is cached until the lockfile changes (L289); the code layer (L289) is rebuilt on every commit (L289). If the code is copied before the install (L289), the dependency cache (L289) is invalidated on every commit (L289) — the builds slow (L289). The order is the cache's design (L289).

**Q: How do you make the build reproducible?**
> A: Two pins (L289): the base image pinned to a specific tag (L293) — not the `latest` (L291) — and the lockfile committed (L289) — the same dependencies every build (L289). The image (L288) is then the same bytes everywhere (L289).

**Q: How do you keep the image small?**
> A: The multi-stage build (L291): the build stage (L291) compiles and installs — with the build tools (L291); the runtime stage (L291) copies only the artifacts (L291) — the slim runtime (L291). The image ships the runtime, not the toolchain (L291).

## 11. Follow-Up Questions

- What are the instructions (L289)?
- What are the layers (L289)?
- Why does the order matter (L289)?
- How do you make the build reproducible (L289)?
- How do you keep the image small (L291)?

## 12. Comparison Table — The Good vs the Bad Recipe

| | The bad recipe (L289) | The good recipe (L289) |
|---|---|---|
| The base (L289) | `FROM node:latest` (L291) | the pinned tag (L293) |
| The order (L289) | the code first (L289) | the deps first, cached (L289) |
| The deps (L289) | no lockfile (L289) | the committed lockfile (L289) |
| The runtime (L291) | the build tools included (L291) | the multi-stage, slim (L291) |
| The user (L293) | the root (L293) | the non-root (L293) |

The senior read: **the right column is the recipe** — pinned, ordered, slim, non-root (L289).

## 13. Code Example — The Recipe

```dockerfile
# The image's recipe (L289) — the AI API's Dockerfile (L233).
# 1 · THE BASE (L289) — the pinned Node runtime (L293).
FROM node:22-slim AS build

# 2 · THE DEPS (L289) — the manifest first, the cache preserved (L289).
WORKDIR /app
COPY package.json package-lock.json ./     # the lockfile (L289)
RUN npm ci                                 # cached until the lock changes (L289)

# 3 · THE CODE (L289) — last, rebuilt on every commit (L289).
COPY . .

# 4 · THE BUILD (L291) — the compile in the build stage (L291).
RUN npm run build

# 5 · THE RUNTIME (L291) — the slim stage, the artifacts only (L291).
FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# 6 · THE USER (L293) — the non-root baseline (L293).
USER node

# 7 · THE START (L289) — what runs when the container starts (L289).
CMD ["node", "dist/server.js"]
```

```text
What the reader must SEE — the recipe, ordered:

  FROM node:22-slim        → the pinned base (L293)
  COPY package*.json + npm ci → the deps cached (L289)
  COPY . .                → the code last (L289)
  build → runtime stages  → the multi-stage slimming (L291)
  USER node               → the non-root (L293)
  CMD node dist/server.js → the start (L289)

  Pinned, ordered, slim, non-root (L289).
```

```narrate
3-4: The base — the pinned Node runtime (L289, L293).
6-8: The deps — the manifest copied first, the install cached (L289).
10-11: The code — copied last, rebuilt every commit (L289).
13-14: The build — the compile in the build stage (L291).
16-18: The runtime — the slim stage with the artifacts only (L291).
20-21: The user — the non-root baseline (L293).
23: The start — the command that runs (L289).
```

> [!TIP]
> The pair that defines the Dockerfile: **the pinned base** (the reproducibility, L293) and **the deps-before-code order** (the cache, L289). **Pin the base, cache the deps, ship the slim runtime — the recipe (L289).**

## 14. Performance Notes

- **The cache is the build's speed (L289).** The unchanged layers (L289) reused (L289) — the CI (L296) builds in seconds (L289), not minutes (L289).
- **The order is the cache's hit rate (L289).** The deps first (L289) — the lockfile's changes (L289) are the only cache misses (L289).
- **The multi-stage is the size (L291).** The runtime stage (L291) — the image (L288) small (L291) — the pull (L288) fast (L289).
- **The image is the start's speed (L288).** The slim image (L291) — the container (L288) starts fast (L289).

## 15. Debugging Scenarios

| Symptom | First check (L289) | The lever |
|---|---|---|
| The build is slow | The order (L289) | The deps before the code (L289) |
| The build is non-reproducible | The base (L291) | The pinned tag (L293) |
| The image is huge | The stages (L291) | The multi-stage build (L291) |
| The container starts as root | The user (L293) | The USER node (L293) |
| The secret is in the image | The layers (L301) | The L301 rule (L301) |

## 16. Quick Revision Notes

- The Dockerfile = **the image's recipe** (L289): the instructions, the layers, the cache, the reproducibility.
- The instructions: **the FROM, the COPY, the RUN, the CMD** (L289).
- The layers: **each instruction is a layer** (L289) — cached (L289).
- The order: **the slow-changing first, the fast-changing last** (L289).
- The reproducibility: **the pinned base (L293) and the lockfile (L289)**.

## 17. Cheat Sheet

```text
DOCKERFILES = the image's recipe — small, cached, reproducible

THE INSTRUCTIONS (L289)
  FROM — the base image (L289) · COPY — the files (L289)
  RUN — the build commands (L289) · CMD / ENTRYPOINT — the start (L289)

THE LAYERS (L289)
  each instruction is a layer (L289)
  the layers are cached (L289) — the reuse (L289)

THE ORDER (L289)
  the base first (L289) · the deps next, cached (L289)
  the code last, rebuilt every commit (L289)

THE REPRODUCIBILITY (L289)
  the pinned base (L293) — not the latest (L291)
  the committed lockfile (L289) — the same deps (L289)

THE SLIM (L291)
  the multi-stage build (L291): the build stage, the runtime stage (L291)
  the artifacts only in the runtime (L291)

INTERVIEW, 4 MOVES
  1 instructions "FROM, COPY, RUN, CMD (L289)"
  2 layers     "each instruction is a layer, cached (L289)"
  3 order      "the slow first, the fast last (L289)"
  4 reproducible "the pinned base and the lockfile (L289)"
```

## 18. Key Takeaways

> [!RECAP]
> - The Dockerfile is **the image's recipe** (L289): the instructions (L289), the layers (L289), the caching (L289), and the reproducibility (L289)
> - **The instructions** (L289): the FROM — the base image; the COPY — the files; the RUN — the build commands; the CMD / the ENTRYPOINT — the start (L289)
> - **The layers** (L289): each instruction is a layer, cached and reused (L289) — the unchanged layers skip the rebuild (L289)
> - **The order** (L289) is the cache's design: the base (L289) first, the dependencies (L289) next — cached until the lockfile changes (L289) — and the code (L289) last, rebuilt on every commit (L289)
> - **The reproducibility** (L289): the pinned base image (L293) and the committed lockfile (L289) — the same bytes every build (L289)
> - The AI shape (L289): the Node image (L289), the dependencies cached (L289), the multi-stage runtime (L291), and the non-root user (L293) — the small, fast, reproducible image the L307 pipeline (L307) ships (L289)

## Check your understanding

Answer these without looking back.

1. What are the instructions (L289)?
2. What are the layers (L289)?
3. Why does the order matter (L289)?
4. How do you make the build reproducible (L289)?
5. How do you keep the image small (L291)?
6. Why the non-root user (L293)?
7. What's the lockfile for (L289)?
8. What is the image's recipe (L289)?

## A Closing Note — The Recipe, Written

You now hold the recipe: **the instructions, the layers, the cache, and the reproducibility — with the deps cached and the code last.** The unit has its recipe — and the cake is reproducible (L289).

Next: the local multi-service stack — Docker Compose (L290).
