# Lesson 284 — Containerized AI Architecture

**Interview importance:** ⭐⭐⭐⭐⭐ — "what runs when the Lambda stops fitting?" — the answer is *the containerized architecture*: ECS + ECR for the AI services that outgrow Lambda (L284).**

L283 built the serverless stack; this lesson is **its successor**: the containerized AI architecture — the ECS + ECR stack (L271) for the services that outgrow the Lambda (L266): the long-lived connections (L250), the heavy processing (L249), the GPU (L264), and the stateful services (L284). The AI platform's shape: the model serving (L278), the streaming (L251), and the workers (L249) run as the containers (L284) when the serverless shape stops fitting (L283). This lesson is the ECS + ECR for the AI services that outgrow Lambda (L284).

The distinction this lesson is built on: a **demo** grows the Lambda. A **solutions architect** knows the boundary (L284): the serverless stack (L283) for the handlers, the containers (L284) for the outgrown services — the trade named (L284).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the boundary: when the Lambda stops fitting (L266)
- Explain the services: the ECS tasks and the services (L271)
- Explain the images: the ECR and the build (L271)
- Explain the scale: the desired count and the metrics (L271)
- Explain the AI shape: the containerized successors (L284)

## 1. One-Line Definition

**The containerized AI architecture is the ECS + ECR for the AI services that outgrow Lambda (L284) — the boundary (the Lambda's L266 limits: the timeout, the memory, the connection model, L266), the services (the ECS tasks L271 and the services L271: the desired count, the load balancer, the scaling), the images (the ECR L271: the pinned builds, the scans L293), and the AI shape (the model serving L278, the streaming L251, the workers L249, and the GPU L264 run as the containers, L284) — the L283 stack's successor (L284).**

The one-sentence interview answer: *"The containerized AI architecture runs the services that outgrow the Lambda (L284). The boundary (L284): the Lambda's limits (L266) — the 15-minute timeout (L266), the 10 GB memory (L266), the request-response connection model (L266) — when a service crosses them (L284), it moves to the containers (L284). The services: the ECS (L271) — the tasks (L271), the services (L271) with the desired count, the load balancer, and the scaling (L271); the Fargate (L271) for the servers invisible, the EC2 (L264) for the GPU and the spot (L285). The images: the ECR (L271) — the pinned tags (L291), the vulnerability scans (L293). The AI shape (L284): the model serving (L278) with the long-lived connections and the GPU (L264); the streaming services (L251) with the WebSockets (L250); the heavy workers (L249) beyond the Lambda's memory (L266); and the stateful services (L284) — each as an ECS service (L271). The senior trade (L284): the Lambda (L266) for the request handlers, the ECS (L271) for the outgrown services — the L283 stack, containerized where it counts (L284)."*

## 2. Mental Model

Think of the containerized architecture as **the food trucks replacing the stalls.** The market's stalls (the Lambdas, L266) are perfect for the quick dishes (the request handlers, L266) — but the slow-braised dishes (the long services, L284) need the trucks (the containers, L284). The trucks (the ECS services, L271) carry the full kitchens (the images, L271): the recipes (the images) come from the commissary (the ECR, L271), each truck runs the same recipe version (the pinned tag, L291). The fleet manager (the service, L271) keeps the right number of trucks (the desired count, L271), checks their health (L271), and sends more when the lines grow (the scaling, L271). The market works because the stalls handle the quick, the trucks handle the slow, and the manager runs the fleet (L284).

```text
   the trucks (the containers, L284)
   ┌────────────────────────────────────────────────────────┐
   │ the kitchens (the images, L271) — the ECR, the pinned  │
   │ tags (L291)                                            │
   │ the trucks (the ECS services, L271) — the desired      │
   │ count, the health, the scaling (L271)                  │
   │ the stalls (the Lambdas, L266) — the quick dishes      │
   │ (the handlers, L266)                                   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the trucks and the stalls**: the full kitchens for the slow dishes, the stalls for the quick (L284).

## 3. Visual Flow — The Service That Outgrew

```text
   the service grows (L284)
        │  the Lambda's limits hit (L266)
        ▼
   ┌────────────────────── THE BOUNDARY (L284) ────────────────────────┐
   │  the timeout (L266) · the memory (L266) · the connections (L250) │
   │  → the container (L284)                                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SERVICE (L271) ─────────────────────────┐
   │  the ECS service (L271): the task (L271), the desired count      │
   │  (L271), the load balancer (L271)                                │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCALE (L271) ───────────────────────────┐
   │  the metrics (L271): the CPU, the memory, the queue depth (L270) │
   │  the Fargate (L271) or the EC2 (L264) with the GPU (L264)        │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the migration: **the limit hit → the container → the service → the scale** (L284).

## 4. How It Works — The Architecture, Part by Part

- **The boundary (L266).** The Lambda's limits (L266): the 15-minute timeout (L266), the 10 GB memory (L266), the request-response connection model (L266), and the state (L284). The service that crosses them (L284) moves to the containers (L284).
- **The services (L271).** The ECS (L271): the tasks (L271) — the running containers; the services (L271) — the desired count (L271), the load balancer (L271), the health checks (L271), and the scaling (L271).
- **The images (L271).** The ECR (L271): the pinned tags (L291) and the vulnerability scans (L293) — the reproducible, safe images (L284).
- **The scale (L271).** The Fargate (L271) for the servers invisible; the EC2 launch (L264) for the GPU (L264) and the spot (L285). The metrics (L271): the CPU, the memory, the queue depth (L270).
- **The AI shape (L284).** The model serving (L278) with the long-lived connections and the GPU (L264); the streaming (L251) with the WebSockets (L250); the heavy workers (L249); and the stateful services (L284) — as the ECS services (L271).

> [!NOTE]
> **The boundary is the senior's trade (L284).** The senior answer names the boundary (L284): the Lambda (L266) for the request handlers — the short, the stateless, the event-driven (L266); the ECS (L271) for the services that cross the limits (L284) — the long, the heavy, the stateful, the connection-bound (L250). The migration is deliberate (L284): the handler stays, the service moves (L284) — the L283 stack (L283), containerized where it counts (L284).

## 5. Real Project Usage

- **A model serving service (L278).** The self-hosted or the Bedrock-proxying service (L278) as an ECS service (L284) — the long-lived connections (L250) and the GPU (L264).
- **A streaming backend (L251).** The WebSocket service (L250) as a container (L284) — the connection model (L250) beyond the Lambda (L266).
- **A heavy worker fleet (L249).** The SQS consumers (L270) with the heavy processing (L249) as the ECS tasks (L284) — the memory (L266) beyond the Lambda's (L284).
- **A stateful service (L284).** The in-memory state (L284) that the stateless Lambda (L266) can't hold (L284).
- **Anything that outgrew (L283).** The L283 stack's successor (L284) — the services move to the ECS (L284).

The through-line: **the container is the outgrown service's home** — the boundary named, the service migrated (L284).

## 6. Interview Explanation

Say it in four moves:

1. **The boundary.** "The Lambda's limits (L266) — the timeout, the memory, the connections (L250)."
2. **The services.** "The ECS (L271) — the tasks, the desired count, the load balancer (L271)."
3. **The images.** "The ECR (L271) — the pinned tags (L291), the scans (L293)."
4. **The AI shape.** "The serving (L278), the streaming (L251), the workers (L249), the GPU (L264)."

## 7. Senior-Level Insights

- **The boundary is the trade (L284).** The senior answer names the boundary (L284): the handler stays on the Lambda (L266); the service moves when it crosses the limits (L284).
- **The Fargate is the default (L271).** The servers invisible (L271); the EC2 launch (L264) for the GPU (L264) and the spot (L285).
- **The image is the reproducibility (L291).** The pinned tags (L291) and the scans (L293) — the L298 IaC discipline (L298), container-shaped (L284).
- **The scale is the metric's (L271).** The CPU, the memory, the queue depth (L270) — the service's scale (L271) is the real metric's (L284).
- **The deployment is the risk control (L302).** The rolling (L302) and the blue/green (L303) — the new model or build (L304) with the rollback (L304).

## 8. Common Mistakes

- **The Lambda stretched (L266).** The service grown past the limits (L266) — the timeout (L266) and the cost (L285) balloon (L284).
- **The everything-container (L284).** The monolith container (L284) — the L252 service seams (L252) lost (L284).
- **The latest tag (L291).** The unpinned image (L291) — the fleet diverges (L298).
- **The EC2 by default (L264).** The fleet managed (L264) without the need (L284) — the Fargate (L271) is the default (L284).
- **The state on the container (L284).** The in-memory state without the persistence (L284) — the EBS (L264) or the managed data (L268) is the state's home (L284).

## 9. Best Practices

- **Name the boundary** (L284) — the Lambda (L266) for the handlers, the ECS (L271) for the outgrown (L284).
- **Pin the images** (L291) — the reproducible fleet (L284).
- **Default to the Fargate** (L271) — the EC2 (L264) for the GPU (L264) and the spot (L285).
- **Scale on the real metrics** (L271) — the CPU, the memory, the queue depth (L270).
- **Deploy with the rollback** (L302) — the rolling (L302) or the blue/green (L303).

## 10. Interview Questions

**Q: When do you move from Lambda to ECS?**
> A: When the service crosses the Lambda's limits (L284): the timeout (L266) — the long-running work; the memory (L266) — the heavy processing; the connections (L250) — the WebSockets and the streaming (L251); and the state (L284). The request handlers (L266) stay serverless (L283); the outgrown services move to the ECS (L271).

**Q: Walk me through a containerized AI service.**
> A: The image in the ECR (L271) — the pinned tag (L291), the scan (L293); the ECS service (L271) — the desired count (L271), the load balancer (L271), the health checks (L271); the launch — the Fargate (L271) by default, the EC2 (L264) for the GPU (L264); and the scale — the CPU, the memory, or the queue depth (L270) (L284).

**Q: What runs as a container in an AI platform?**
> A: The services that outgrow the Lambda (L284): the model serving (L278) with the long-lived connections and the GPU (L264); the streaming services (L251) with the WebSockets (L250); the heavy workers (L249) beyond the memory (L266); and the stateful services (L284).

**Q: How do you decide the launch type?**
> A: By the workload (L284): the Fargate (L271) — the servers invisible, the default (L284); the EC2 launch (L264) — when the workload needs the machine: the GPU (L264) for the inference (L278), or the spot instances (L285) for the cost (L284).

## 11. Follow-Up Questions

- What's the boundary (L266)?
- What's the ECS service (L271)?
- What's the image (L291)?
- What's the scale (L271)?
- When do you move from Lambda to ECS (L284)?

## 12. Comparison Table — The Serverless vs the Containerized

| | The serverless (L283) | The containerized (L284) |
|---|---|---|
| Unit (L266, L271) | the function (L266) | the container (L271) |
| Limits (L266, L271) | the timeout, the memory (L266) | the task's — much larger (L271) |
| Connections (L266, L250) | the request-response (L266) | the long-lived (L250) |
| GPU (L266, L264) | none (L266) | the EC2 launch (L264) |
| Cost (L285) | per invocation (L266) | per running task (L271) |
| Use (L284) | the request handlers (L266) | the outgrown services (L284) |

The senior read: **the spectrum is the answer** — the functions for the requests, the containers for the services (L284).

## 13. Code Example — The Migration

```js
// The migration (L284) — the service that outgrew the Lambda (L266).
// THE BOUNDARY (L266) — the limits crossed (L284):
//   · the WebSocket service (L250) — the long-lived connections (L250)
//   · the memory-heavy worker (L249) — beyond the 10 GB (L266)
//   · the stateful service (L284) — the state the Lambda can't hold (L266)

// THE IMAGE (L271) — the pinned build in the ECR (L291).
const image = '123456789012.dkr.ecr.us-east-1.amazonaws.com/ws-server:v2.4.1';

// THE SERVICE (L271) — the task, the count, the scale (L271).
const service = {
  task: {
    image,                                   // the pinned image (L291)
    cpu: 4096, memory: 8192,                 // the task's resources (L271)
    ports: [{ containerPort: 8080 }],        // the WebSocket port (L250)
  },
  desiredCount: 3,                           // the count (L271)
  launchType: 'FARGATE',                     // the servers invisible (L271)
  healthCheck: { path: '/health' },          // the pulse (L271)
  scaling: {
    metric: 'ALB:RequestCountPerTarget',     // the real metric (L271)
    target: 1000,
  },
  deployment: { type: 'blue-green' },        // the L303 deploy (L303)
};

// The handler stays on the Lambda (L266); the outgrown service
// runs as the container (L284) — the spectrum, named (L284).
```

```text
What the reader must SEE — the migration, declared:

  ws-server:v2.4.1   → the pinned image (L291)
  cpu + memory       → beyond the Lambda's limits (L266, L271)
  port 8080          → the WebSocket service (L250)
  FARGATE            → the servers invisible (L271)
  ALB requests       → the scale on the real metric (L271)
  blue-green         → the deployment with the rollback (L303)

  The boundary named, the service migrated (L284).
```

```narrate
4-7: The boundary — the WebSocket connections, the memory, and the state beyond the Lambda's limits (L266, L250, L284).
9-11: The image — the pinned build in the ECR (L291).
13-23: The service — the task's resources, the desired count, the Fargate launch, the health check, and the scale (L271).
25-27: The deployment — the blue-green with the rollback (L303).
29-30: The spectrum — the handler on the Lambda, the service on the ECS (L266, L284).
```

> [!TIP]
> The pair that defines the containerized architecture: **the named boundary** (the limits crossed, L266) and **the pinned image** (the reproducible service, L291). **Name the boundary, pin the image, run the fleet — the L283 stack's successor (L284).**

## 14. Performance Notes

- **The container is the latency's control (L271).** The long-lived connections (L250) — the WebSockets (L250) without the cold start (L266) — the streaming (L251) smooth (L284).
- **The GPU is the inference's speed (L264).** The EC2 launch (L264) with the accelerated instances (L264) — the self-hosted inference (L278) fast (L284).
- **The scale is the metric's (L271).** The ALB requests (L271) and the queue depth (L270) — the service (L271) matches the load (L284).
- **The task is the cost (L285).** The running tasks (L285) — the container bill (L285) is the fleet's (L284).

## 15. Debugging Scenarios

| Symptom | First check (L284) | The lever |
|---|---|---|
| The service restarts | The health check (L271) | The failing path (L271) |
| The traffic to the broken task | The target group (L271) | The load balancer (L271) |
| The service doesn't scale | The metric (L271) | The ALB / the queue depth (L270) |
| The fleet diverges | The image tag (L291) | The pinned tag (L291) |
| The deploy is down | The strategy (L302) | The blue-green (L303) with the rollback (L304) |

## 16. Quick Revision Notes

- The containerized AI architecture = **the ECS + ECR for the outgrown services** (L284).
- The boundary: **the Lambda's limits (L266) — the timeout, the memory, the connections (L250)**.
- The services: **the ECS tasks and the services (L271) — the count, the health, the scale**.
- The images: **the ECR (L271) — the pinned tags (L291), the scans (L293)**.
- The AI shape: **the serving (L278), the streaming (L251), the workers (L249), the GPU (L264)**.

## 17. Cheat Sheet

```text
CONTAINERIZED AI ARCHITECTURE = the ECS + ECR for the services
that outgrow the Lambda

THE BOUNDARY (L266)
  the timeout (L266) · the memory (L266) · the connections (L250)
  the state (L284) — the Lambda's limits crossed (L284)

THE SERVICES (L271)
  the ECS — the tasks (L271), the services (L271)
  the desired count (L271) · the load balancer (L271)
  the health checks (L271) · the scaling (L271)

THE IMAGES (L271)
  the ECR — the pinned tags (L291), the scans (L293)
  the reproducible, safe images (L284)

THE LAUNCH (L271)
  the Fargate (L271) — the default, the servers invisible
  the EC2 (L264) — the GPU (L264), the spot (L285)

THE AI SHAPE (L284)
  the model serving (L278) — the long-lived + the GPU (L264)
  the streaming (L251) — the WebSockets (L250)
  the heavy workers (L249) · the stateful services (L284)

INTERVIEW, 4 MOVES
  1 boundary "the Lambda's limits crossed (L266)"
  2 services "the ECS tasks and services (L271)"
  3 images   "the ECR — pinned, scanned (L291, L293)"
  4 AI shape "the serving, the streaming, the workers (L284)"
```

## 18. Key Takeaways

> [!RECAP]
> - The containerized AI architecture is **the ECS + ECR for the AI services that outgrow Lambda** (L284): the boundary (L266), the services (L271), the images (L271), and the AI shape (L284)
> - **The boundary** (L266) is the Lambda's limits — the timeout (L266), the memory (L266), the connection model (L250), and the state (L284)
> - **The services** (L271) are the ECS — the tasks (L271) and the services (L271) with the desired count (L271), the load balancer (L271), and the scaling on the real metrics (L270)
> - **The images** (L271) are the ECR — the pinned tags (L291) and the vulnerability scans (L293)
> - **The launch** (L271): the Fargate (L271) by default, the EC2 (L264) for the GPU (L264) and the spot (L285)
> - The AI shape (L284): the model serving (L278), the streaming (L251), the heavy workers (L249), and the stateful services (L284) run as the containers — the L283 stack's successor (L284), with the senior trade (L284): the handlers on the Lambda (L266), the outgrown services on the ECS (L271)

## Check your understanding

Answer these without looking back.

1. What's the boundary (L266)?
2. What's the ECS service (L271)?
3. What's the image (L291)?
4. What's the scale (L271)?
5. When do you move from Lambda to ECS (L284)?
6. What runs as a container (L284)?
7. How do you decide the launch type (L271)?
8. What is the L283 stack's successor (L284)?

## A Closing Note — The Trucks, Rolling

You now hold the containerized architecture: **the boundary, the services, the images, and the scale — with the spectrum named and the fleet managed.** The serverless stack has its successor — and the trucks are rolling (L284).

Next: the AWS bill as architecture — AWS Cost Optimization for AI (L285).
