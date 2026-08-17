# Lesson 288 — Docker & Containers

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the unit of deployment?" — the answer is *the container*: the image, the runtime contract, and the isolation (L288).**

This is the first lesson of the Docker / DevOps module — and the unit everything else ships. L287 built the cloud; this lesson is **what the cloud runs**: Docker & containers — the unit of deployment: the image (the immutable blueprint, L288), the container (the running process, L288), the runtime contract (the image runs the same everywhere, L288), and the isolation (the process and the filesystem boundaries, L288). The AI service (L173) ships as a container (L288): the image built once (L289), run anywhere (L288). This lesson is the unit of the pipeline (L288).

The distinction this lesson is built on: a **demo** runs on the laptop. A **solutions architect** ships the container (L288): the image (L288), the runtime contract (L288), and the isolation (L288) — because the L307 pipeline (L307) ships containers (L288).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the image: the immutable blueprint (L288)
- Explain the container: the running process (L288)
- Explain the runtime contract: the same everywhere (L288)
- Explain the isolation: the process and the filesystem boundaries (L288)
- Explain the AI shape: the service as a container (L288)

## 1. One-Line Definition

**Docker & containers are the unit of deployment (L288) — the image (the immutable blueprint: the code, the runtime, the dependencies, the config, L288), the container (the running process created from the image, L288), the runtime contract (the image runs the same on the laptop and in production, L288), and the isolation (the process, the filesystem, and the network boundaries, L288) — the AI service (L173) ships as a container (L288).**

The one-sentence interview answer: *"The container is the unit of deployment (L288). The image (L288) is the immutable blueprint — the code, the runtime, the dependencies, and the config, baked into layers (L289); the container (L288) is the running process created from the image — the same image, many containers (L288). The runtime contract (L288): the image runs the same on the laptop, in CI (L296), and in production (L287) — the 'it works on my machine' problem (L288) solved by packaging the machine (L288). The isolation (L288): the container shares the host's kernel (L288) but gets its own process tree, filesystem, and network namespace (L288) — the process-level isolation (L288), lighter than a VM (L288). The AI shape (L288): the service (L173) ships as a container (L288) — the image built once (L289), pushed to the registry (L294), and run by the ECS (L295) or the Kubernetes (L306) — the same bytes everywhere (L288). The unit of the pipeline (L288)."*

## 2. Mental Model

Think of the container as **the shipping container.** The shipping container (the image, L288) is the standardized box: you pack the cargo (the code, the runtime, the dependencies, L288) once, seal it (the immutable layers, L289), and it ships anywhere — the truck, the train, the ship (the laptop, the CI, the cloud, L288) — without repacking (the runtime contract, L288). The crane unloads a container (the running container, L288) and the cargo works because the box is standard (L288). The box is not the whole warehouse (the VM, L288): it's a standardized unit (L288) — lighter, faster, and the same everywhere (L288). The port (the cloud, L287) runs the boxes (the containers, L288) it's given (L288).

```text
   the shipping container (Docker, L288)
   ┌────────────────────────────────────────────────────────┐
   │ the sealed box (the image, L288) — the code, the       │
   │ runtime, the dependencies (L288)                       │
   │ the standard size (the runtime contract, L288) — the   │
   │ same everywhere (L288)                                 │
   │ the unloaded box (the container, L288) — the running   │
   │ process (L288)                                         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the shipping container**: the sealed box, the standard size, and the unloaded unit (L288).

## 3. Visual Flow — One Image to Many Containers

```text
   the code (L288)
        │  the build (L289)
        ▼
   ┌────────────────────── THE IMAGE (L288) ────────────────────────────┐
   │  the immutable blueprint — the layers (L289)                      │
   │  the code + the runtime + the dependencies (L288)                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              │  the run (L288)
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ the container│  │ the container│  │ the container│
   │ on the laptop│  │ in the CI    │  │ in the cloud │
   │ (L288)       │  │ (L296)       │  │ (L287)       │
   └──────────────┘  └──────────────┘  └──────────────┘
      THE SAME BYTES (L288) — the runtime contract (L288)
```

The flow is the container's life: **code → image → containers, the same everywhere** (L288).

## 4. How It Works — The Unit, Part by Part

- **The image (L288).** The immutable blueprint (L288): the code, the runtime, the dependencies, and the config — baked into the layers (L289). The image is read-only (L288); the changes create a new image (L288).
- **The container (L288).** The running process created from the image (L288): the same image, many containers (L288). The container's writable layer (L288) holds the runtime state (L288).
- **The runtime contract (L288).** The image runs the same everywhere (L288): the laptop, the CI (L296), the production (L287) — the "it works on my machine" (L288) solved by packaging the machine (L288).
- **The isolation (L288).** The container shares the host's kernel (L288) but gets its own process tree, filesystem, and network namespace (L288) — the process-level isolation (L288), lighter than the VM (L288).

> [!NOTE]
> **The container vs the VM is the senior distinction (L288).** The VM (L288) virtualizes the hardware — each VM runs its own OS, heavy and slow to start (L288). The container (L288) virtualizes the OS — the containers share the host's kernel (L288) and isolate the processes (L288) — light and fast to start (L288). The AI workload (L173) prefers the container (L288): the model service (L278) starts in seconds (L288), not minutes (L288).

## 5. Real Project Usage

- **An AI service (L173).** The API (L233) ships as a container (L288): the image (L288) built in the CI (L296), run by the ECS (L295) or the Kubernetes (L306).
- **A worker (L249).** The SQS consumer (L270) as a container (L288) — the same image, many workers (L288).
- **A local dev stack (L290).** The app, the Postgres (L268), and the Redis (L269) in the containers (L288) — the Docker Compose (L290) orchestrates them (L288).
- **A CI pipeline (L296).** The test runner as a container (L288) — the same image in the CI (L296) as in the production (L287).
- **Anything shipped (L307).** The pipeline (L307) ships containers (L288) — the image is the unit (L288).

The through-line: **the container is the pipeline's unit** — the same bytes, everywhere (L288).

## 6. Interview Explanation

Say it in four moves:

1. **The image.** "The immutable blueprint — the code, the runtime, the dependencies (L288)."
2. **The container.** "The running process created from the image (L288)."
3. **The contract.** "The image runs the same everywhere — the laptop, the CI, the cloud (L288)."
4. **The isolation.** "The process-level isolation, lighter than the VM (L288)."

## 7. Senior-Level Insights

- **The container is the reproducibility (L288).** The senior answer ships the image (L288) — the same bytes everywhere (L288) — the "works on my machine" (L288) eliminated (L288).
- **The image is the artifact (L289).** The image (L288) is the build's output (L289) — the CI (L296) builds it, the registry (L294) stores it, the runtime (L295) runs it — the pipeline's artifact (L307).
- **The isolation is the security boundary (L293).** The container's namespaces (L288) — the process-level isolation (L288) — the L293 threat model (L293) starts here (L288).
- **The container is the scale unit (L295).** The same image, many containers (L288) — the ECS service (L295) and the Kubernetes deployment (L306) scale the containers (L288).
- **The container is not the VM (L288).** The shared kernel (L288) — the speed (L288) and the density (L288) — with the isolation (L288) the trade (L288).

## 8. Common Mistakes

- **The image as a VM (L288).** Treating the container as a full OS (L288) — the image bloat (L291) and the slow starts (L288).
- **The state in the container (L288).** The runtime state in the writable layer (L288) — the container is ephemeral (L288); the state goes to the volume or the managed data (L268).
- **The latest tag (L291).** The unpinned image (L291) — the fleet diverges (L298); the pinned tag (L291) is the reproducibility (L288).
- **The one-container everything (L290).** The monolith container (L288) — the services (L252) and the scaling (L295) blur (L288).
- **The root user (L293).** The container running as root (L293) — the L293 threat model (L293) starts with the non-root (L293).

## 9. Best Practices

- **Ship the image** (L288) — the artifact (L289), the same everywhere (L288).
- **Pin the tags** (L291) — the reproducible fleet (L288).
- **Keep the container ephemeral** (L288) — the state to the volume or the managed data (L268).
- **One concern per container** (L290) — the services (L252) as the units (L288).
- **Run non-root** (L293) — the L293 baseline (L293).

## 10. Interview Questions

**Q: Walk me through Docker and containers.**
> A: The unit of deployment (L288). The image — the immutable blueprint: the code, the runtime, the dependencies (L288). The container — the running process created from the image (L288). The runtime contract — the image runs the same everywhere (L288). And the isolation — the process-level boundaries, lighter than the VM (L288).

**Q: What's the difference between a container and a VM?**
> A: What they virtualize (L288). The VM virtualizes the hardware — each VM runs its own OS, heavy and slow (L288). The container virtualizes the OS — the containers share the host's kernel and isolate the processes (L288) — light and fast (L288). The AI service (L173) prefers the container's speed (L288).

**Q: How does the container solve "it works on my machine"?**
> A: By packaging the machine (L288). The image (L288) bakes in the code, the runtime, and the dependencies (L288) — the same bytes run on the laptop, in the CI (L296), and in production (L287) (L288). The runtime contract (L288) is the fix (L288).

**Q: Why is the container the unit of deployment?**
> A: Because it's the reproducible, portable, scalable unit (L288): the image built once (L289), stored in the registry (L294), run anywhere (L288) — and scaled by running more containers from the same image (L295). The pipeline (L307) ships the image (L288).

## 11. Follow-Up Questions

- What's the image (L288)?
- What's the container (L288)?
- What's the runtime contract (L288)?
- What's the isolation (L288)?
- Container vs VM (L288)?

## 12. Comparison Table — Container vs VM

| | The container (L288) | The VM (L288) |
|---|---|---|
| Virtualizes (L288) | the OS (L288) | the hardware (L288) |
| The OS (L288) | the shared kernel (L288) | its own (L288) |
| Start (L288) | seconds (L288) | minutes (L288) |
| Isolation (L288) | the process-level (L288) | the full boundary (L288) |
| Size (L288) | MBs (L288) | GBs (L288) |
| The AI use (L288) | the service (L173), the worker (L249) | the legacy (L264) |

The senior read: **the container for the speed and the density; the VM for the full isolation** (L288).

## 13. Code Example — The Unit in Action

```js
// The unit of deployment (L288) — the image to the container (L288).
// THE IMAGE (L288) — the immutable blueprint (L289).
//   docker build -t ai-service:1.2.3 .      # the build (L289)

// THE CONTAINER (L288) — the running process (L288).
//   docker run -p 3000:3000 ai-service:1.2.3

// THE SAME EVERYWHERE (L288) — the runtime contract (L288).
//   the laptop:  docker run ai-service:1.2.3        # the dev (L288)
//   the CI:      docker run ai-service:1.2.3 npm test  # the tests (L296)
//   the cloud:   the ECS service (L295) pulls the same image (L288)

// THE ISOLATION (L288) — the process tree, the filesystem,
// the network namespace — the container shares the kernel (L288).

// THE AI SHAPE (L288) — the service ships as the container (L288):
//   the image → the registry (L294) → the ECS (L295) / the k8s (L306)
```

```text
What the reader must SEE — the unit, in action:

  docker build -t ai-service:1.2.3  → the image (L288, L289)
  docker run -p 3000:3000           → the container (L288)
  the same image in the CI + cloud  → the runtime contract (L288)
  the namespaces                    → the isolation (L288)

  The same bytes, everywhere (L288).
```

```narrate
3-4: The image — the build produces the immutable blueprint (L288, L289).
6-7: The container — the run creates the process (L288).
9-12: The contract — the same image runs on the laptop, in the CI, and in the cloud (L288).
14-16: The isolation — the namespaces boundary the process (L288).
18-19: The AI shape — the image ships through the registry to the runtime (L288, L294, L295).
```

> [!TIP]
> The pair that defines the container: **the image** (the immutable blueprint, L288) and **the runtime contract** (the same everywhere, L288). **Build the image once, run it anywhere — the unit of the pipeline (L288).**

## 14. Performance Notes

- **The container is the start's speed (L288).** The process-level start (L288) — the model service (L278) and the workers (L249) scale in seconds (L288).
- **The image is the pull's cost (L291).** The image size (L291) — the cold pull (L288) and the start (L288) — the multi-stage build (L291) slims it (L288).
- **The shared kernel is the density (L288).** The containers share the kernel (L288) — the host runs more (L288) than the VMs (L288).
- **The container is the scale's unit (L295).** The same image, many containers (L288) — the ECS (L295) and the k8s (L306) scale them (L288).

## 15. Debugging Scenarios

| Symptom | First check (L288) | The lever |
|---|---|---|
| It works on my machine, not in prod | The image (L288) | The same image everywhere (L288) |
| The container won't start | The image (L288) | The entrypoint and the cmd (L289) |
| The container loses data | The writable layer (L288) | The volume or the managed data (L268) |
| The start is slow | The image size (L291) | The multi-stage build (L291) |
| The container runs as root | The Dockerfile (L293) | The non-root user (L293) |

## 16. Quick Revision Notes

- Docker & containers = **the unit of deployment** (L288): the image, the container, the contract, the isolation.
- The image: **the immutable blueprint** (L288) — the code, the runtime, the dependencies (L288).
- The container: **the running process** (L288) — the same image, many containers (L288).
- The contract: **the same everywhere** (L288) — the laptop, the CI (L296), the cloud (L287).
- The isolation: **the process-level** (L288) — lighter than the VM (L288).

## 17. Cheat Sheet

```text
DOCKER & CONTAINERS = the unit of deployment

THE IMAGE (L288)
  the immutable blueprint — the code, the runtime, the deps (L288)
  the layers (L289) · read-only (L288) · the artifact (L289)

THE CONTAINER (L288)
  the running process from the image (L288)
  the same image, many containers (L288)
  the writable layer — the ephemeral state (L288)

THE CONTRACT (L288)
  the same everywhere — the laptop, the CI (L296), the cloud (L287)
  "it works on my machine" solved (L288)

THE ISOLATION (L288)
  the shared kernel (L288) · the process tree, the fs, the net (L288)
  lighter than the VM (L288)

THE AI SHAPE (L288)
  the service (L173) ships as the container (L288)
  the image → the registry (L294) → the ECS (L295) / the k8s (L306)

INTERVIEW, 4 MOVES
  1 image    "the immutable blueprint (L288)"
  2 container "the running process (L288)"
  3 contract "the same everywhere (L288)"
  4 isolation "the process-level, lighter than the VM (L288)"
```

## 18. Key Takeaways

> [!RECAP]
> - Docker & containers are **the unit of deployment** (L288): the image (L288), the container (L288), the runtime contract (L288), and the isolation (L288)
> - **The image** (L288) is the immutable blueprint — the code, the runtime, the dependencies (L288) — baked into the layers (L289)
> - **The container** (L288) is the running process created from the image (L288) — the same image, many containers (L288)
> - **The runtime contract** (L288): the image runs the same on the laptop, in the CI (L296), and in production (L287) — "it works on my machine" solved by packaging the machine (L288)
> - **The isolation** (L288): the container shares the host's kernel (L288) but gets its own process tree, filesystem, and network namespace (L288) — lighter than the VM (L288)
> - The AI shape (L288): the service (L173) ships as a container (L288) — the image built once (L289), pushed to the registry (L294), and run by the ECS (L295) or the Kubernetes (L306) — the unit of the pipeline (L307)

## Check your understanding

Answer these without looking back.

1. What's the image (L288)?
2. What's the container (L288)?
3. What's the runtime contract (L288)?
4. What's the isolation (L288)?
5. Container vs VM (L288)?
6. Why is the container the unit of deployment (L288)?
7. Where does the state live (L288)?
8. What is the AI service's shipping unit (L288)?

## A Closing Note — The Box, Sealed

You now hold the unit of deployment: **the image, the container, the runtime contract, and the isolation.** The pipeline has its unit — and the box is sealed (L288).

Next: writing the images — Dockerfiles (L289).
