# Lesson 295 — ECS & Fargate

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you run the containers on AWS?" — the answer is *ECS & Fargate*: the task, the service, and the no-servers runtime (L295).**

L271 introduced the ECS (L271) and L294 the registry (L294); this lesson is **the runtime in full**: ECS & Fargate — running the containers without managing the servers: the task (the container's definition, L295), the service (the desired count, the load balancer, the scaling, L295), and the Fargate (the servers invisible, L295). The AI service's shape (L173): the image (L289) from the ECR (L294) runs as the ECS service (L295) on the Fargate (L295) — no servers to manage (L295). This lesson is the container's AWS runtime (L295).

The distinction this lesson is built on: a **demo** runs the container locally. A **solutions architect** runs it on the ECS (L295): the task (L295), the service (L295), and the Fargate (L295) — because the L307 pipeline (L307) deploys to the ECS (L295).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the task: the container's definition (L295)
- Explain the service: the desired count and the scaling (L295)
- Explain the Fargate: the servers invisible (L295)
- Explain the deployment: the rolling and the blue/green (L302)
- Explain the AI shape: the container's AWS runtime (L295)

## 1. One-Line Definition

**The ECS & Fargate run the containers without managing the servers (L295) — the task (the container's definition: the image L294, the resources, the env, L295), the service (the desired count of tasks, the load balancer, the health checks, and the scaling, L295), and the Fargate (the launch type with the servers invisible: the vCPU and the memory billed, L295) — the AI service (L173) runs as the ECS service on the Fargate (L295).**

The one-sentence interview answer: *"ECS runs the containers on AWS; Fargate removes the servers (L295). The task (L295): the container's definition — the image (L294), the CPU and the memory, the environment (L295) — the task is the unit (L295). The service (L295): the desired count of tasks (L295) — the ECS keeps that many running (L295), behind the load balancer (L295), with the health checks (L295) and the scaling on the metrics (L295) — the CPU, the memory, or the custom (L295). The launch types (L295): the Fargate (L295) — the servers invisible, you define the task and pay for the vCPU and the memory (L295) — and the EC2 (L264) — the servers yours, for the GPU (L264) and the spot (L285). The deployment (L302): the rolling (L302) and the blue/green (L303) update the tasks without the downtime (L295). The AI shape (L173): the service (L233) runs as the ECS service (L295) — the image (L289) from the ECR (L294), the desired count (L295) scaling with the traffic (L295), the health checks (L295) on the `/health` (L295) — no servers to manage (L295)."*

## 2. Mental Model

Think of ECS as **the food-truck fleet manager.** The manager (the ECS, L295) runs the trucks (the tasks, L295): each truck's spec (the task definition, L295) — the kitchen setup (the image, L294), the size (the CPU and the memory, L295), the supplies (the env, L295). The manager keeps the right number of trucks on the road (the desired count, L295), checks each truck's health (L295), and sends more when the lines grow (the scaling, L295). The trucks run in the managed lots (the Fargate, L295): you don't own the trucks (the servers, L295) — you rent the cooking (the vCPU and the memory, L295) — or your own lots (the EC2, L264): you manage the parking (the fleet, L264). The fleet works because the manager runs the count, the health, and the scale (L295).

```text
   the fleet (ECS, L295)
   ┌────────────────────────────────────────────────────────┐
   │ the trucks (the tasks, L295) — the image (L294), the   │
   │ resources, the env (L295)                              │
   │ the manager (the service, L295) — the count, the       │
   │ health, the scale (L295)                               │
   │ the lots (the launch types, L295) — the Fargate (L295),│
   │ the EC2 (L264)                                         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the fleet**: the trucks, the manager, and the lots (L295).

## 3. Visual Flow — One Service

```text
   the image (L294)
        │  the pull (L294)
        ▼
   ┌────────────────────── THE TASK (L295) ─────────────────────────────┐
   │  the image: ai-service:abc1234 (L291)                             │
   │  the resources: 1 vCPU, 2 GB (L295) · the env (L295)              │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SERVICE (L295) ──────────────────────────┐
   │  the desired count: 3 (L295)                                      │
   │  the load balancer (L295) · the health check: /health (L295)      │
   │  the scaling: the CPU, the memory, the custom (L295)              │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE LAUNCH (L295) ───────────────────────────┐
   │  the Fargate (L295) — the servers invisible (L295)                │
   │  the EC2 (L264) — the GPU (L264), the spot (L285)                 │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the service: **image → task → service → launch** (L295).

## 4. How It Works — The Runtime, Part by Part

- **The task (L295).** The container's definition (L295): the image (L294), the CPU and the memory (L295), the environment (L295), the ports (L292). The task is the unit (L295).
- **The service (L295).** The desired count of tasks (L295): the ECS keeps that many running (L295), behind the load balancer (L295), with the health checks (L295) and the scaling (L295) — the CPU, the memory, or the custom metrics (L295).
- **The Fargate (L295).** The launch type with the servers invisible (L295): you define the task (L295) and pay for the vCPU and the memory (L285) — no EC2 instances (L264) to manage (L295). The EC2 launch (L264): the servers yours (L264), for the GPU (L264) and the spot (L285).
- **The deployment (L302).** The rolling (L302) and the blue/green (L303): the new task versions (L295) rolled without the downtime (L295), with the rollback (L304).

> [!NOTE]
> **The service is the operations; the task is the unit (L295).** The senior answer separates them (L295): the task (L295) is the container's definition (L295) — what runs (L295); the service (L295) is the operator (L295) — how many run, how they're checked, how they scale (L295). The service (L295) is what the pipeline (L307) deploys to (L295): the new task version (L295) rolled through the service (L295).

## 5. Real Project Usage

- **An AI API (L233).** The service (L233) as the ECS service (L295): the image (L289) from the ECR (L294), the desired count (L295), the `/health` check (L295).
- **A worker (L249).** The SQS consumer (L270) as the ECS service (L295): the desired count (L295) scaling with the queue depth (L270).
- **A streaming backend (L251).** The WebSocket service (L250) as the ECS service (L295): the long-lived connections (L250) beyond the Lambda (L266).
- **A GPU inference (L278).** The EC2 launch (L264) with the accelerated instances (L264) — the GPU (L264) the Fargate (L295) doesn't offer (L295).
- **Anything containerized (L284).** The L284 services (L284) run on the ECS (L295) — the container's AWS runtime (L295).

The through-line: **the runtime is the container's AWS home** — the task defined, the service operated, the servers invisible (L295).

## 6. Interview Explanation

Say it in four moves:

1. **The task.** "The container's definition — the image, the resources, the env (L295)."
2. **The service.** "The desired count, the load balancer, the health, the scaling (L295)."
3. **The Fargate.** "The servers invisible — the vCPU and the memory billed (L295)."
4. **The deployment.** "The rolling and the blue/green (L302) — no downtime (L295)."

## 7. Senior-Level Insights

- **The Fargate is the default (L295).** The servers invisible (L295) — the fleet management (L264) gone; the EC2 launch (L264) for the GPU (L264) and the spot (L285).
- **The service is the operations (L295).** The desired count (L295), the health checks (L295), the scaling (L295) — the service's design is its operations (L295).
- **The scale is the metric's (L295).** The CPU and the memory (L295), the queue depth (L270), the request count (L274) — the service (L295) scales on the real metrics (L295).
- **The deployment is the risk control (L302).** The rolling (L302) and the blue/green (L303) — the new image (L289) rolled with the rollback (L304).
- **The IAM is the task's access (L262).** The task's role (L262) — the least privilege (L262): the model (L278), the S3 (L265), and the logs (L274) scoped (L295).

## 8. Common Mistakes

- **The latest tag (L291).** The `:latest` in the task (L291) — the deployed image (L294) unknown; the pin (L291) is the contract (L294).
- **The health check missing (L295).** The unhealthy task (L295) in the rotation (L295) — the load balancer (L295) sends the traffic to the broken (L295).
- **The EC2 by default (L264).** The fleet managed (L264) without the need (L295) — the Fargate (L295) is the default (L295).
- **The scale by the CPU only (L295).** The queue-bound worker (L270) — the custom metric (L295) is the truth (L295).
- **The secrets in the task (L301).** The keys in the task's env (L301) — the Secrets Manager (L275) is the home (L275).

## 9. Best Practices

- **Pin the image** (L291) — the task's image (L294) exact (L295).
- **Wire the health checks** (L295) — the `/health` (L295).
- **Default to the Fargate** (L295) — the EC2 (L264) for the GPU (L264) and the spot (L285).
- **Scale on the real metrics** (L295) — the CPU, the memory, the queue depth (L270).
- **Use the Secrets Manager** (L275) — the task's env (L301) without the keys (L275).

## 10. Interview Questions

**Q: Walk me through the ECS & Fargate.**
> A: The container runtime without the servers (L295). The task — the container's definition: the image (L294), the resources, the env (L295). The service — the desired count, the load balancer, the health checks, the scaling (L295). The Fargate — the servers invisible (L295). And the deployment — the rolling and the blue/green (L302).

**Q: What's the difference between the task and the service?**
> A: The unit and the operator (L295). The task (L295) is the container's definition — what runs (L295). The service (L295) is the operator — how many run (L295), how they're checked (L295), how they scale (L295). The pipeline (L307) deploys the new task version (L295) through the service (L295).

**Q: When do you use the EC2 launch instead of the Fargate?**
> A: When the workload needs the machine (L295): the GPU (L264) for the inference (L278) — the Fargate (L295) doesn't offer the GPUs (L295) — and the spot instances (L285) for the cost (L285). Otherwise, the Fargate (L295) is the default (L295).

**Q: How does the service scale?**
> A: By the metrics (L295): the CPU and the memory utilization (L295), or the custom metrics (L295) — the SQS queue depth (L270), the request count (L274) — with the target tracking (L295). The desired count (L295) scales in and out (L295).

## 11. Follow-Up Questions

- What's the task (L295)?
- What's the service (L295)?
- What's the Fargate (L295)?
- When the EC2 launch (L264)?
- How does the service scale (L295)?

## 12. Comparison Table — Fargate vs EC2 Launch

| | The Fargate (L295) | The EC2 launch (L264) |
|---|---|---|
| The servers (L295) | invisible (L295) | yours (L264) |
| The billing (L285) | the vCPU + the memory (L295) | the instances (L264) |
| The GPU (L264) | none (L295) | the accelerated (L264) |
| The spot (L285) | none (L295) | the interruptible (L285) |
| The use (L295) | the default (L295) | the GPU (L264), the cost (L285) |

The senior read: **the Fargate by default, the EC2 for the machine** (L295).

## 13. Code Example — The Service, Declared

```js
// The runtime (L295) — the ECS service, declared (L295).
// 1 · THE TASK (L295) — the container's definition (L295).
const task = {
  image: '123456789012.dkr.ecr.us-east-1.amazonaws.com/ai-service:abc1234', // L294, L291
  cpu: '1 vCPU', memory: '2 GB',          // the resources (L295)
  portMappings: [{ containerPort: 3000 }],  // the port (L292)
  environment: [{ name: 'NODE_ENV', value: 'production' }],
  // the secrets (L301): from the Secrets Manager (L275), not the env (L301)
  role: aiServiceTaskRole,                // the IAM (L262): the least privilege (L262)
};

// 2 · THE SERVICE (L295) — the operator (L295).
const service = {
  task,
  desiredCount: 3,                        // the count (L295)
  launchType: 'FARGATE',                  // the servers invisible (L295)
  loadBalancer: { targetGroup: 'ai-service-tg' },   // the LB (L295)
  healthCheck: { path: '/health', interval: 30 },   // the pulse (L295)
  scaling: {
    metric: 'ALB:RequestCountPerTarget',  // the custom metric (L295)
    target: 1000,
  },
  deployment: { type: 'rolling', minHealthy: 50 },  // the L302 deploy (L302)
};
```

```text
What the reader must SEE — the service, declared:

  ai-service:abc1234       → the pinned image (L291, L294)
  1 vCPU, 2 GB             → the task's resources (L295)
  FARGATE                  → the servers invisible (L295)
  /health + the LB         → the pulse (L295)
  ALB requests + target    → the scale on the real metric (L295)
  rolling + minHealthy     → the deployment (L302)

  The task defined, the service operated, the servers invisible (L295).
```

```narrate
4-11: The task — the pinned image, the resources, the port, and the scoped role (L294, L262).
13-22: The service — the desired count, the Fargate launch, the load balancer, the health check, and the scaling (L295).
24-25: The deployment — the rolling with the minimum healthy (L302).
```

> [!TIP]
> The pair that defines the ECS: **the pinned image in the task** (the contract, L291) and **the service's desired count** (the operations, L295). **Pin the image, run the count, scale on the real metric — the container's AWS runtime (L295).**

## 14. Performance Notes

- **The Fargate is the ops' cost (L295).** The servers invisible (L295) — the vCPU and the memory (L285) billed, the fleet (L264) gone (L295).
- **The scale is the metric's (L295).** The queue depth (L270) and the request count (L274) — the desired count (L295) matches the load (L295).
- **The deployment is the downtime's control (L302).** The rolling (L302) and the blue/green (L303) — the update (L295) without the downtime (L295).
- **The image is the start's speed (L291).** The slim image (L291) — the pull (L294) and the start (L295) fast (L295).

## 15. Debugging Scenarios

| Symptom | First check (L295) | The lever |
|---|---|---|
| The task keeps restarting | The health check (L295) | The failing `/health` (L295) |
| The traffic hits the broken task | The target group (L295) | The LB's health (L295) |
| The service doesn't scale | The metric (L295) | The custom metric (L295) |
| The deployed image is unknown | The tag (L291) | The pinned tag (L291) |
| The task can't access the data | The role (L262) | The task's IAM (L262) |

## 16. Quick Revision Notes

- The ECS & Fargate = **the container runtime without the servers** (L295): the task, the service, the launch.
- The task: **the container's definition — the image (L294), the resources, the env** (L295).
- The service: **the desired count, the LB, the health, the scaling** (L295).
- The Fargate: **the servers invisible (L295) — the vCPU and the memory billed**.
- The launch: **the Fargate by default (L295), the EC2 (L264) for the GPU and the spot (L285)**.

## 17. Cheat Sheet

```text
ECS & FARGATE = the containers without the servers

THE TASK (L295)
  the container's definition (L295)
  the image (L294) · the CPU + the memory (L295) · the env (L295)
  the role (L262) — the least privilege (L262)

THE SERVICE (L295)
  the desired count (L295) — the ECS keeps it (L295)
  the load balancer (L295) · the health checks (L295)
  the scaling — the CPU, the memory, the custom (L295)

THE LAUNCH (L295)
  the Fargate (L295) — the servers invisible, the default (L295)
  the EC2 (L264) — the GPU (L264), the spot (L285)

THE DEPLOYMENT (L302)
  the rolling (L302) · the blue/green (L303)
  the rollback (L304)

THE AI SHAPE (L295)
  the service (L233) as the ECS service (L295)
  the worker (L249) scaling with the queue (L270)
  the GPU inference (L278) on the EC2 (L264)

INTERVIEW, 4 MOVES
  1 task    "the container's definition (L295)"
  2 service "the count, the health, the scale (L295)"
  3 Fargate "the servers invisible (L295)"
  4 deploy  "the rolling and the blue/green (L302)"
```

## 18. Key Takeaways

> [!RECAP]
> - The ECS & Fargate run **the containers without managing the servers** (L295): the task (L295), the service (L295), and the Fargate (L295)
> - **The task** (L295) is the container's definition — the image (L294), the CPU and the memory (L295), the environment (L295), and the IAM role (L262)
> - **The service** (L295) is the operator — the desired count (L295), the load balancer (L295), the health checks (L295), and the scaling on the metrics (L295)
> - **The Fargate** (L295) is the launch type with the servers invisible (L295) — the vCPU and the memory (L285) billed, the default (L295); the EC2 launch (L264) for the GPU (L264) and the spot (L285)
> - **The deployment** (L302): the rolling (L302) and the blue/green (L303) update the tasks without the downtime (L295), with the rollback (L304)
> - The AI shape (L295): the service (L233) runs as the ECS service (L295) — the image (L289) from the ECR (L294), the desired count (L295) scaling with the traffic (L295), the health checks (L295) on the `/health` (L295) — the container's AWS runtime (L295)

## Check your understanding

Answer these without looking back.

1. What's the task (L295)?
2. What's the service (L295)?
3. What's the Fargate (L295)?
4. When the EC2 launch (L264)?
5. How does the service scale (L295)?
6. What's the deployment (L302)?
7. What's the task's role (L262)?
8. What is the container's AWS runtime (L295)?

## A Closing Note — The Fleet, Managed

You now hold the runtime: **the task, the service, and the Fargate — with the count kept and the servers invisible.** The container has its AWS home — and the fleet is managed (L295).

Next: the conveyor — CI/CD Fundamentals (L296).
