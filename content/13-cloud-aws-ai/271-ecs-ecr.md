# Lesson 271 — ECS & ECR

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do the containers run on AWS?" — the answer is *ECS & ECR*: the image registry and the container service — the containerized AI architecture (L271).**

L264 placed the compute and L266 brought the functions; this lesson is **the containers**: ECS & ECR — the container service and the image registry: the ECR (the image repository, L271), the ECS (the container service: the tasks and the services, L271), the launch types (the Fargate and the EC2, L271), and the service shape (the desired count, the load balancer, the scaling, L271). The AI platform's shape: the services that outgrow Lambda (L284) — the model serving (L278), the workers (L249), the streaming services (L251) — run as containers (L271). This lesson is the containerized AI architecture (L271).

The distinction this lesson is built on: a **demo** runs Docker locally. A **solutions architect** ships it on ECS (L271): the image in ECR (L271), the task and the service (L271), the Fargate vs EC2 launch (L271), and the scaling (L271) — because the L260 backend (L260) outgrows Lambda where the containers fit (L271).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the ECR: the image registry (L271)
- Explain the ECS: the task and the service (L271)
- Explain the launch types: the Fargate and the EC2 (L271)
- Explain the service shape: the desired count and the scaling (L271)
- Explain the AI shape: the containerized AI architecture (L271)

## 1. One-Line Definition

**ECS & ECR is the container service and the image registry on AWS (L271) — the ECR (the image repository: the built containers stored and versioned, L271), the ECS (the container service: the tasks — the running containers — and the services — the desired count with the load balancer and the scaling, L271), the launch types (the Fargate — the servers invisible — and the EC2 — the servers yours, L271), and the AI shape (the services that outgrow Lambda L284: the model serving L278, the workers L249, the streaming L251, run as containers, L271).**

The one-sentence interview answer: *"ECR and ECS run the containers on AWS (L271). ECR is the image registry — the built Docker images stored, versioned, and scanned (L271); the CI/CD (L297) pushes the image there, and the service pulls it (L271). ECS is the container service: the task — a running container (or a set of them); the service — the desired count of tasks, kept running by ECS, behind a load balancer (L271). The launch types: the Fargate — the servers invisible, you pay for the vCPU and the memory — and the EC2 — the servers yours, you manage the fleet (L271). The service shape: the desired count, the health checks, and the scaling — the CPU and the memory, or the custom metrics (L271); the deployment (L302): the rolling and the blue/green (L303) update the tasks without the downtime (L271). The AI shape: the services that outgrow Lambda (L284) — the model serving (L278) with the long-lived connections and the GPU, the workers (L249) with the heavy processing, the streaming services (L251) with the WebSockets — run as containers on ECS (L271). The senior answer names the trade (L271): the Lambda (L266) for the request handlers, the ECS (L271) for the services that outgrow them (L284)."*

## 2. Mental Model

Think of ECS and ECR as **the fleet of food trucks with a commissary kitchen.** The commissary (the ECR, L271) is where the recipes (the images, L271) are prepared, labeled, and stored — every truck pulls the same recipe version (L271). The trucks (the tasks, L271) are the running containers: each truck serves the same menu (L271). The fleet manager (the service, L271) keeps the right number of trucks on the road (the desired count, L271), checks the health of each (L271), and sends more trucks when the lines grow (the scaling, L271). The trucks run in two ways: the fully-managed lots (the Fargate, L271) — you don't own the trucks, you rent the cooking (L271) — or your own lots (the EC2, L271) — you manage the parking and the maintenance (L271). The fleet works because the recipes are in the commissary, the manager keeps the count, and the lots match the need (L271).

```text
   the fleet (ECS, L271) + the commissary (ECR, L271)
   ┌────────────────────────────────────────────────────────┐
   │ the recipes (the images, L271) — stored in the ECR     │
   │ the trucks (the tasks, L271) — the running containers  │
   │ the manager (the service, L271) — the desired count,   │
   │ the health, the scaling (L271)                         │
   │ the lots (the launch types, L271) — Fargate / EC2      │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the fleet and the commissary**: the recipes, the trucks, the manager, and the lots (L271).

## 3. Visual Flow — The Image to the Service

```text
   the CI/CD (L297)
        │  the image pushed (L271)
        ▼
   ┌────────────────────── THE ECR (L271) ─────────────────────────────┐
   │  the image stored, versioned, and scanned (L271)                 │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼  the service pulls the image (L271)
   ┌────────────────────── THE ECS SERVICE (L271) ─────────────────────┐
   │  the desired count of tasks (L271)                               │
   │  the load balancer (L271) · the health checks (L271)             │
   │  the scaling: the CPU, the memory, the custom (L271)             │
   │  the launch type: the Fargate (the servers invisible)            │
   │  or the EC2 (the servers yours) (L271)                           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼  the deployment (L302)
   ┌────────────────────── THE UPDATE (L271) ──────────────────────────┐
   │  the rolling (L302) or the blue/green (L303) — no downtime       │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the container's life: **image → ECR → service → deploy** (L271).

## 4. How It Works — The Container Platform, Part by Part

- **The ECR (L271).** The image registry (L271): the built images stored, versioned by the tags, and scanned for the vulnerabilities (L293). The CI/CD (L297) pushes; the service pulls (L271).
- **The ECS (L271).** The container service (L271): the task — a running container or a set; the service — the desired count of tasks kept running, behind a load balancer (L271).
- **The launch types (L271).** The Fargate — the servers invisible, you pay for the vCPU and the memory (L271); the EC2 — the servers yours, you manage the fleet and pay for the instances (L264) (L271).
- **The service shape (L271).** The desired count (L271), the health checks (L271), and the scaling — the CPU, the memory, or the custom metrics (L271). The deployment (L302): the rolling (L302) or the blue/green (L303) with no downtime (L271).
- **The AI shape (L271).** The services that outgrow Lambda (L284): the model serving (L278) with the long-lived connections and the GPU, the workers (L249) with the heavy processing, the streaming services (L251) with the WebSockets (L250) — the containers (L271).

> [!NOTE]
> **The service is the deployment unit; the task is the running unit (L271).** The task (L271) is the container (or the set) that runs; the service (L271) is the operator that keeps the desired count running — the scheduler, the load balancer, the scaling, the deployment (L271). The senior answer describes the service, not the task (L271): *"the service keeps N tasks running behind the load balancer, scales on the metrics, and rolls the new image without the downtime"* (L271).

## 5. Real Project Usage

- **A containerized AI architecture (L284).** The model serving (L278), the workers (L249), and the streaming services (L251) as the ECS services (L271) — the L284 shape (L271).
- **A model inference service (L278).** The Bedrock fallback or the self-hosted model (L278) as a container (L271) — the long-lived connections and the GPU (L264).
- **A worker fleet (L249).** The SQS consumers (L270) as the ECS tasks (L271) — the heavy processing (L249) with the desired count (L271).
- **A streaming backend (L251).** The WebSocket service (L250) as a container (L271) — the long-lived connections (L250) beyond the Lambda's shape (L266).
- **Anything that outgrows Lambda (L284).** The container is the next step (L271) — the ECS (L271) runs it (L271).

The through-line: **the container is the Lambda's successor** — the services that outgrow the function's shape run on ECS (L271).

## 6. Interview Explanation

Say it in four moves:

1. **The ECR.** "The image registry — built, versioned, scanned (L271)."
2. **The ECS.** "The tasks — the running containers; the services — the desired count, the load balancer, the scaling (L271)."
3. **The launch.** "The Fargate — the servers invisible; the EC2 — the servers yours (L271)."
4. **The AI shape.** "The model serving (L278), the workers (L249), the streaming (L251) — the services that outgrow Lambda (L284)."

## 7. Senior-Level Insights

- **The container is the Lambda's successor (L271).** The senior answer places the service (L271): the request handlers stay on Lambda (L266); the long-lived and the heavy services (L284) move to the containers (L271).
- **The Fargate is the default (L271).** The servers invisible (L271) — the fleet management (L264) gone; the EC2 launch (L271) is the exception for the GPU (L264) and the spot (L285).
- **The service shape is the operations (L271).** The desired count, the health checks, and the scaling (L271) — the service's design is its operations (L271).
- **The image is the reproducibility (L293).** The ECR image (L271) — the pinned tag (L291), the scan (L293) — the L298 IaC idea, container-shaped (L271).
- **The deployment is the risk control (L302).** The rolling (L302) and the blue/green (L303) — the new model or build (L304) rolled with the rollback path (L304).

## 8. Common Mistakes

- **The latest tag (L271).** The `:latest` pull (L271) — the fleet diverges (L298); the pinned tag (L291) is the reproducibility (L271).
- **The service without the health check (L271).** The unhealthy task kept in the rotation (L271) — the load balancer (L271) sends the traffic to the broken container (L271).
- **The EC2 launch by default (L271).** The fleet managed (L264) without the need (L271) — the Fargate (L271) is the default (L271).
- **The scaling by the CPU only (L271).** The memory- and the queue-bound services (L270) — the custom metrics (L271) are the scale's truth (L271).
- **The container too big (L293).** The fat image (L291) — the cold pull (L271) and the attack surface (L293).

## 9. Best Practices

- **Pin the image tags** (L291) — the reproducible fleet (L271).
- **Wire the health checks** (L271) — the load balancer (L271) sends the traffic to the healthy (L271).
- **Default to the Fargate** (L271) — the EC2 (L264) for the GPU (L264) and the spot (L285).
- **Scale on the real metrics** (L271) — the CPU, the memory, the queue depth (L270).
- **Deploy with the rollback** (L302) — the rolling (L302) or the blue/green (L303) with the L304 path (L304).

## 10. Interview Questions

**Q: Walk me through ECS and ECR.**
> A: The container platform (L271). The ECR — the image registry: built, versioned, scanned (L271). The ECS — the tasks, the running containers, and the services, the desired count kept running behind the load balancer (L271). The launch types — the Fargate, the servers invisible, and the EC2, the servers yours (L271).

**Q: When do you move from Lambda to ECS?**
> A: When the service outgrows the Lambda's shape (L284): the long-lived connections — the WebSockets (L250) and the streaming (L251); the heavy processing — the workers (L249) beyond the memory and the timeout (L266); the GPU — the inference (L278) on the accelerated instances (L264). The request handlers stay on the Lambda (L266); the services move to the containers (L271).

**Q: What's the difference between Fargate and EC2 launch?**
> A: Who runs the servers (L271). The Fargate — the servers invisible: you define the task and pay for the vCPU and the memory (L271). The EC2 — the servers yours: you manage the fleet and pay for the instances (L264). The Fargate is the default (L271); the EC2 is for the GPU (L264) and the spot (L285).

**Q: How does the service scale?**
> A: By the metrics (L271): the CPU and the memory utilization (L271), or the custom metrics — the SQS queue depth (L270), the request count (L274) — with the target tracking (L271). The desired count (L271) scales in and out; the deployment (L302) updates the tasks without the downtime (L271).

## 11. Follow-Up Questions

- What's the ECR (L271)?
- What's the ECS (L271)?
- What's the Fargate (L271)?
- What's the service shape (L271)?
- When do you move from Lambda to ECS (L284)?

## 12. Comparison Table — Lambda vs ECS

| | Lambda (L266) | ECS (L271) |
|---|---|---|
| Unit (L271) | the function | the container |
| Limits (L266, L271) | the timeout, the memory (L266) | the task's — much larger (L271) |
| Connections (L271) | the request-response (L266) | the long-lived: the WebSockets (L250), the streaming (L251) |
| GPU (L271) | none (L266) | the EC2 launch (L264) |
| Cost (L285) | per invocation (L266) | per running task (L271) |
| AI use (L271) | the request handlers (L267) | the serving (L278), the workers (L249) |

The senior read: **the function for the requests, the container for the services** (L271).

## 13. Code Example — The Container Service, Declared

```js
// The container platform (L271) — the ECS service, declared (L271).
// THE IMAGE (L271) — the ECR repository, the pinned tag (L291).
const image = '123456789012.dkr.ecr.us-east-1.amazonaws.com/worker:abc1234';
// The CI/CD (L297) pushes the image; the tag is the commit's (L291).

// THE TASK (L271) — the running container's definition (L271).
const task = {
  image,                                      // the pinned image (L291)
  cpu: 1024, memory: 2048,                    // the task's resources (L271)
  environment: [{ name: 'QUEUE', value: 'generation-jobs' }],
};

// THE SERVICE (L271) — the desired count, the health, the scale (L271).
const service = {
  task,
  desiredCount: 4,                            // the desired count (L271)
  launchType: 'FARGATE',                      // the servers invisible (L271)
  healthCheck: { path: '/health', interval: 30 },   // the health (L271)
  scaling: {
    metric: 'SQS:ApproximateNumberOfMessages',      // the queue depth (L270)
    target: 100,                                    // the workers scale with it (L271)
  },
  deployment: { type: 'rolling', minHealthy: 50 },  // the rolling (L302)
};
```

```text
What the reader must SEE — the service, declared:

  ecr.../worker:abc1234 → the pinned image (L291)
  cpu + memory          → the task's resources (L271)
  desiredCount: 4       → the service's floor (L271)
  FARGATE               → the servers invisible (L271)
  SQS depth + target    → the scale on the real metric (L270, L271)
  rolling + minHealthy  → the deployment without the downtime (L302)

  The recipe pinned, the fleet managed, the scale real (L271).
```

```narrate
3-4: The image — the ECR repository with the pinned tag (L271, L291).
6-9: The task — the container's definition: the image, the resources, the environment (L271).
11-19: The service — the desired count, the Fargate launch, the health check, the queue-depth scaling, and the rolling deployment (L271, L302).
```

> [!TIP]
> The pair that defines ECS: **the pinned image** (the reproducibility, L291) and **the service's desired count** (the operations, L271). **Pin the image, manage the count, scale on the real metric — the container platform (L271).**

## 14. Performance Notes

- **The Fargate is the ops' cost (L271).** The servers invisible (L271) — the vCPU and the memory billed (L285), the fleet management (L264) gone (L271).
- **The scale is the queue's (L270).** The SQS depth (L270) as the metric (L271) — the workers (L249) match the backlog (L271).
- **The deployment is the downtime's control (L302).** The rolling (L302) and the blue/green (L303) — the update (L271) with the minimum healthy (L271).
- **The image is the pull's cost (L271).** The small image (L291) — the cold pull (L271) and the start (L271) fast (L271).

## 15. Debugging Scenarios

| Symptom | First check (L271) | The lever |
|---|---|---|
| The task keeps restarting | The health check (L271) | The failing path (L271) |
| The traffic goes to the broken task | The health check (L271) | The load balancer's target group (L271) |
| The service doesn't scale | The metric (L271) | The custom metric — the queue depth (L270) |
| The fleet diverges | The image tag (L291) | The pinned tag (L291) |
| The deployment is down | The strategy (L302) | The rolling with the min healthy (L302) |

## 16. Quick Revision Notes

- ECS & ECR = **the container platform** (L271): the registry, the service, the launch, the shape.
- The ECR: **the image registry — built, versioned, scanned** (L271).
- The ECS: **the tasks (the running containers) and the services (the desired count)** (L271).
- The launch: **the Fargate (the servers invisible) vs the EC2 (the servers yours)** (L271).
- The AI shape: **the serving (L278), the workers (L249), the streaming (L251) — the services that outgrow Lambda (L284)**.

## 17. Cheat Sheet

```text
ECS & ECR = the container platform on AWS

THE ECR (L271)
  the image registry — built, versioned, scanned (L293)
  the pinned tag (L291) — the reproducible fleet

THE ECS (L271)
  the task — the running container (L271)
  the service — the desired count + the load balancer + the scaling (L271)

THE LAUNCH (L271)
  the Fargate — the servers invisible, the vCPU + the memory billed
  the EC2 — the servers yours, the fleet managed (L264)

THE SHAPE (L271)
  the desired count · the health checks · the scaling (L271)
  the deployment: the rolling (L302) / the blue-green (L303)

THE AI SHAPE (L271)
  the model serving (L278) — the long-lived + the GPU (L264)
  the workers (L249) — the heavy processing (L270)
  the streaming (L251) — the WebSockets (L250)
  the services that outgrow Lambda (L284)

INTERVIEW, 4 MOVES
  1 ECR    "the image registry — pinned, scanned (L271)"
  2 ECS    "the tasks and the services (L271)"
  3 launch "the Fargate default; the EC2 for the GPU (L271)"
  4 AI     "the serving, the workers, the streaming (L271)"
```

## 18. Key Takeaways

> [!RECAP]
> - ECS & ECR is **the container service and the image registry on AWS** (L271): the ECR (L271), the ECS tasks and services (L271), the launch types (L271), and the service shape (L271)
> - **The ECR** (L271) is the image registry — the images built, versioned, and scanned (L293); the CI/CD (L297) pushes, the service pulls (L271)
> - **The ECS** (L271) is the container service — the task (the running container) and the service (the desired count, the load balancer, the scaling) (L271)
> - **The launch types** (L271): the Fargate — the servers invisible (the default), and the EC2 — the servers yours (for the GPU, L264, and the spot, L285)
> - **The service shape** (L271): the desired count, the health checks, the scaling on the real metrics (L270), and the deployment with the rollback (L302)
> - The AI shape (L271): the model serving (L278), the workers (L249), and the streaming services (L251) — the services that outgrow Lambda (L284) — run as the containers (L271)

## Check your understanding

Answer these without looking back.

1. What's the ECR (L271)?
2. What's the ECS (L271)?
3. What's the Fargate (L271)?
4. What's the service shape (L271)?
5. When do you move from Lambda to ECS (L284)?
6. What's the difference between the Fargate and the EC2 launch (L271)?
7. How does the service scale (L271)?
8. What is the container platform's AI shape (L271)?

## A Closing Note — The Fleet, Rolling

You now hold the container platform: **the ECR, the ECS, the launch types, and the service shape — with the pinned images and the managed count.** The backend has the containers — and the services that outgrow the functions have a home (L271).

Next: the CDN in front of the AI apps — CloudFront (L272).
