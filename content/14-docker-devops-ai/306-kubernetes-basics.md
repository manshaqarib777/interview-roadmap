# Lesson 306 — Kubernetes for the AI Architect (Concepts Only)

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's Kubernetes?" — the answer is *the concepts*: pods, deployments, services — enough to speak the language, not run the cluster (L306).**

L295 ran the containers on the ECS; this lesson is **the other runtime's vocabulary**: the Kubernetes for the AI architect — the concepts only: the pods (the containers' unit, L306), the deployments (the desired state, L306), the services (the stable addresses, L306), and the scaling (the autoscalers, L306). The AI shape (L173): the AI service (L233) as a deployment (L306) with the autoscaler (L306) — the language (L306) enough to design (L287) and to talk to the platform team (L306). This lesson is the Kubernetes vocabulary (L306).

The distinction this lesson is built on: a **demo** runs the cluster. A **solutions architect** speaks the language (L306): the pods (L306), the deployments (L306), and the services (L306) — enough to design (L306), not to run (L306).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the pods: the containers' unit (L306)
- Explain the deployments: the desired state (L306)
- Explain the services: the stable addresses (L306)
- Explain the scaling: the autoscalers (L306)
- Explain the AI shape: the vocabulary, not the cluster (L306)

## 1. One-Line Definition

**The Kubernetes for the AI architect is the concepts — enough to speak the language, not run the cluster (L306) — the pods (the containers' unit: one or more containers sharing the network, L306), the deployments (the desired state: the replicas, the rolling updates L302, the rollbacks L304, L306), the services (the stable addresses: the DNS names in front of the pods, L306), and the scaling (the autoscalers: the replicas by the metrics, L306) — the AI service (L233) as a deployment (L306).**

The one-sentence interview answer: *"Kubernetes is the container orchestrator (L306). The concepts (L306): the pod (L306) — the smallest unit: one or more containers (L288) sharing the network and the storage (L306); the deployment (L306) — the desired state: how many replicas (L306), which image (L291), the rolling updates (L302) and the rollbacks (L304) (L306); the service (L306) — the stable address: the DNS name (L306) in front of the pods (L306) — the pods change (L306), the service name doesn't (L306); the scaling (L306) — the autoscaler: the replicas by the metrics (L306) — the CPU, the memory, the custom (L306). The AI shape (L173): the service (L233) as a deployment (L306) — the image (L291) pinned, the replicas (L306) autoscaled, the service (L306) in front — the architect (L306) speaks the language (L306): the pods, the deployments, the services (L306) — and designs the L287 cloud (L287) with the platform team (L306). The architect doesn't run the cluster (L306); the architect designs for it (L306)."*

## 2. Mental Model

Think of Kubernetes as **the city's taxi dispatcher.** The dispatcher (the Kubernetes, L306) runs the fleet (the cluster, L306): the cars (the pods, L306) — each car carries the passengers (the containers, L288); the dispatcher keeps the right number of cars (the replicas, L306) per the plan (the deployment, L306) — the car's spec (the image, L291), the fleet's size (the desired state, L306). The cars come and go (the pods change, L306) — but the taxi stand (the service, L306) has the stable phone number (the DNS name, L306): the riders (the requests, L306) call the stand (L306), and the dispatcher sends a car (L306). And the dispatcher adds the cars when the lines grow (the autoscaler, L306) — by the wait times (the metrics, L306). The city works because the dispatcher holds the plan, the stand is stable, and the fleet scales (L306).

```text
   the dispatcher (Kubernetes, L306)
   ┌────────────────────────────────────────────────────────┐
   │ the cars (the pods, L306) — the containers (L288)      │
   │ the plan (the deployment, L306) — the replicas, the    │
   │ image (L291), the updates (L302)                       │
   │ the stands (the services, L306) — the stable names     │
   │ (L306)                                                 │
   │ the lines (the autoscaler, L306) — the metrics (L306)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the dispatcher**: the cars, the plan, the stands, and the lines (L306).

## 3. Visual Flow — One Request Through the Cluster

```text
   the client (L306)
        │  the service name (L306)
        ▼
   ┌────────────────────── THE SERVICE (L306) ──────────────────────────┐
   │  the stable DNS name (L306) — in front of the pods (L306)         │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE PODS (L306) ─────────────────────────────┐
   │  the deployment's replicas (L306) — the image (L291)              │
   │  the pod 1 · the pod 2 · the pod 3 (L306)                        │
   │  the rolling updates (L302) · the rollbacks (L304)               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SCALE (L306) ────────────────────────────┐
   │  the autoscaler (L306) — the replicas by the metrics (L306)       │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the request: **service → pods → scale** (L306).

## 4. How It Works — The Vocabulary, Part by Part

- **The pods (L306).** The smallest unit (L306): one or more containers (L288) sharing the network and the storage (L306). The pod is the car (L306).
- **The deployments (L306).** The desired state (L306): how many replicas (L306), which image (L291) — the rolling updates (L302) and the rollbacks (L304) (L306). The deployment is the plan (L306).
- **The services (L306).** The stable addresses (L306): the DNS names (L306) in front of the pods (L306) — the pods change (L306), the service name doesn't (L306). The service is the stand (L306).
- **The scaling (L306).** The autoscaler (L306): the replicas by the metrics (L306) — the CPU, the memory, the custom (L306). The scaling is the dispatcher's (L306).

> [!NOTE]
> **The architect speaks the language; the platform team runs the cluster (L306).** The senior answer is precise (L306): the AI architect (L306) designs for the Kubernetes (L306) — the deployments (L306), the services (L306), and the autoscalers (L306) — and talks to the platform team (L306) in the vocabulary (L306). The architect doesn't run the cluster (L306): the kubelet, the scheduler, and the control plane (L306) are the platform team's (L306). The lesson's title (L306) is the scope (L306): the concepts only (L306).

## 5. Real Project Usage

- **A production AI stack (L287).** The L287 cloud (L287) on the EKS (L306): the services (L233) as the deployments (L306).
- **A model serving (L278).** The model service (L278) as a deployment (L306) with the autoscaler (L306) — the GPU nodes (L264) for the inference (L306).
- **A worker (L249).** The SQS consumer (L270) as a deployment (L306) — the replicas (L306) scaling with the queue (L270).
- **A conversation with the platform team (L306).** The architect (L306) speaking the vocabulary (L306): "the deployment's replicas, the service in front, the autoscaler on the queue" (L306).
- **Anything containerized (L306).** The Kubernetes (L306) — the L295 ECS's (L295) cousin (L306) — the vocabulary (L306) shared (L306).

The through-line: **the vocabulary is the architect's language** — the pods, the deployments, the services, the scaling (L306).

## 6. Interview Explanation

Say it in four moves:

1. **The pods.** "The smallest unit — the containers sharing the network (L306)."
2. **The deployments.** "The desired state — the replicas, the image, the updates (L306)."
3. **The services.** "The stable addresses — the DNS in front of the pods (L306)."
4. **The scaling.** "The autoscaler — the replicas by the metrics (L306)."

## 7. Senior-Level Insights

- **The deployment is the ECS service's cousin (L306).** The desired count (L295) → the replicas (L306); the rolling (L302) → the deployment's updates (L306) — the L295 concepts (L295), Kubernetes-shaped (L306).
- **The service is the stable contract (L306).** The pods change (L306); the service name (L306) doesn't (L306) — the L292 discovery (L292), cluster-shaped (L306).
- **The autoscaler is the metric's scale (L306).** The CPU, the memory, the queue (L270) — the replicas (L306) by the real metrics (L306) — the L295 scaling (L295), Kubernetes-shaped (L306).
- **The architect's scope is the design (L306).** The deployments (L306) and the services (L306) — the cluster's operation (L306) is the platform team's (L306).
- **The cluster is the scale's home (L306).** The pods (L306) across the nodes (L306) — the L288 containers (L288) at the scale (L306).

## 8. Common Mistakes

- **The cluster by the architect (L306).** Running the cluster (L306) — the architect's scope (L306) is the design (L306).
- **The pod as the deploy unit (L306).** The pod (L306) deployed directly (L306) — the deployment (L306) is the unit (L306); the pods (L306) are the cars (L306).
- **The pods reached directly (L306).** The IPs (L306) — the pods change (L306); the service (L306) is the stable name (L306).
- **The service without the deployment (L306).** The address (L306) without the plan (L306) — the deployment (L306) is the state (L306).
- **The scale by the CPU only (L306).** The queue-bound worker (L270) — the custom metrics (L306) are the truth (L306).

## 9. Best Practices

- **Deploy with the deployment** (L306) — the desired state (L306).
- **Reach through the service** (L306) — the stable name (L306).
- **Scale on the real metrics** (L306) — the CPU, the memory, the queue (L270).
- **Design with the platform team** (L306) — the vocabulary (L306).
- **Keep the scope** (L306) — the concepts (L306), not the cluster's operation (L306).

## 10. Interview Questions

**Q: Walk me through the Kubernetes concepts.**
> A: The vocabulary (L306). The pod — the smallest unit: the containers sharing the network (L306). The deployment — the desired state: the replicas, the image, the updates (L306). The service — the stable address in front of the pods (L306). And the scaling — the autoscaler by the metrics (L306).

**Q: What's the difference between a pod and a deployment?**
> A: The car and the plan (L306). The pod (L306) is the running unit — the containers (L288) sharing the network (L306). The deployment (L306) is the desired state — how many replicas (L306), which image (L291), the rolling updates (L302) (L306). The deployment (L306) manages the pods (L306); the pods (L306) are the deployment's cars (L306).

**Q: Why the service?**
> A: The stable address (L306): the pods change (L306) — they come and go with the scaling (L306) and the updates (L302) — but the service name (L306) stays (L306). The clients (L306) reach the service (L306), and the service (L306) routes to the pods (L306) — the L292 discovery (L292), cluster-shaped (L306).

**Q: How does it compare to the ECS?**
> A: The cousins (L306): the ECS service (L295) → the deployment (L306); the task (L295) → the pod (L306); the load balancer (L295) → the service (L306); the scaling (L295) → the autoscaler (L306). The concepts (L306) transfer (L306) — the vocabulary (L306) is shared (L306).

## 11. Follow-Up Questions

- What's a pod (L306)?
- What's a deployment (L306)?
- What's a service (L306)?
- What's the autoscaler (L306)?
- How does it compare to the ECS (L295)?

## 12. Comparison Table — The ECS vs the Kubernetes

| | The ECS (L295) | The Kubernetes (L306) |
|---|---|---|
| The unit (L295, L306) | the task (L295) | the pod (L306) |
| The state (L295, L306) | the service (L295) | the deployment (L306) |
| The address (L295, L306) | the load balancer (L295) | the service (L306) |
| The scale (L295, L306) | the service's scaling (L295) | the autoscaler (L306) |
| The ops (L295, L306) | the managed (L295) | the platform team's (L306) |

The senior read: **the concepts transfer** — the vocabulary (L306) is shared (L306).

## 13. Code Example — The Vocabulary, Declared

```yaml
# The Kubernetes (L306) — the vocabulary, declared (L306).
# 1 · THE DEPLOYMENT (L306) — the desired state (L306).
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-service
spec:
  replicas: 3                            # the desired count (L306)
  selector:
    matchLabels: { app: ai-service }
  template:
    metadata:
      labels: { app: ai-service }
    spec:
      containers:
        - name: api
          image: ai-service:abc1234       # the pinned image (L291)
          ports: [{ containerPort: 3000 }]
---
# 2 · THE SERVICE (L306) — the stable address (L306).
apiVersion: v1
kind: Service
metadata:
  name: ai-service
spec:
  selector: { app: ai-service }           # the pods (L306)
  ports: [{ port: 80, targetPort: 3000 }]
---
# 3 · THE AUTOSCALER (L306) — the replicas by the metrics (L306).
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-service
spec:
  scaleTargetRef: { kind: Deployment, name: ai-service }
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

```text
What the reader must SEE — the vocabulary, declared:

  kind: Deployment + replicas 3 → the desired state (L306)
  image: ai-service:abc1234     → the pinned image (L291)
  kind: Service + selector      → the stable address (L306)
  kind: HorizontalPodAutoscaler → the scale by the metrics (L306)

  The pods, the deployments, the services — the vocabulary (L306).
```

```narrate
4-16: The deployment — the desired state: the replicas, the pinned image, the container (L306, L291).
18-24: The service — the stable address routing to the pods by the selector (L306).
26-35: The autoscaler — the replicas by the CPU utilization (L306).
```

> [!TIP]
> The pair that defines the vocabulary: **the deployment's replicas** (the desired state, L306) and **the service's selector** (the stable address, L306). **Deploy with the deployment, reach through the service, scale with the autoscaler — the language (L306).**

## 14. Performance Notes

- **The pod is the unit's density (L306).** The pods (L306) across the nodes (L306) — the containers (L288) at the scale (L306).
- **The service is the routing's cost (L306).** The stable name (L306) — the DNS (L306) and the proxy (L306) — the routing (L306) between the pods (L306).
- **The autoscaler is the scale's speed (L306).** The metrics (L306) — the replicas (L306) added in the minutes (L306).
- **The cluster is the ops' cost (L306).** The nodes (L306) and the control plane (L306) — the platform team's (L306) bill (L285).

## 15. Debugging Scenarios

| Symptom | First check (L306) | The lever |
|---|---|---|
| The pods restart | The deployment (L306) | The image (L291), the probes (L306) |
| The request fails | The service (L306) | The selector (L306) |
| The scale stalls | The autoscaler (L306) | The metrics (L306) |
| The update breaks | The deployment (L302) | The rollback (L304) |
| The cluster is complex | The scope (L306) | The platform team (L306) |

## 16. Quick Revision Notes

- The Kubernetes for the AI architect = **the vocabulary** (L306): the pods, the deployments, the services, the scaling.
- The pods: **the smallest unit — the containers sharing the network** (L306).
- The deployments: **the desired state — the replicas, the image, the updates** (L306).
- The services: **the stable addresses — the DNS in front of the pods** (L306).
- The scaling: **the autoscaler — the replicas by the metrics** (L306).

## 17. Cheat Sheet

```text
KUBERNETES FOR THE AI ARCHITECT = the concepts — the vocabulary

THE PODS (L306)
  the smallest unit (L306) — the containers (L288)
  sharing the network and the storage (L306)

THE DEPLOYMENTS (L306)
  the desired state (L306): the replicas (L306), the image (L291)
  the rolling updates (L302) · the rollbacks (L304)

THE SERVICES (L306)
  the stable addresses (L306) — the DNS in front of the pods (L306)
  the pods change (L306) · the service name doesn't (L306)

THE SCALING (L306)
  the autoscaler (L306) — the replicas by the metrics (L306)
  the CPU, the memory, the custom (L306)

THE SCOPE (L306)
  the architect designs (L306) — the platform team runs (L306)
  the concepts only (L306) — the vocabulary (L306)

INTERVIEW, 4 MOVES
  1 pods        "the smallest unit (L306)"
  2 deployments "the desired state (L306)"
  3 services    "the stable addresses (L306)"
  4 scaling     "the autoscaler by the metrics (L306)"
```

## 18. Key Takeaways

> [!RECAP]
> - The Kubernetes for the AI architect is **the concepts — enough to speak the language, not run the cluster** (L306): the pods (L306), the deployments (L306), the services (L306), and the scaling (L306)
> - **The pods** (L306) are the smallest unit (L306) — one or more containers (L288) sharing the network and the storage (L306)
> - **The deployments** (L306) are the desired state (L306) — the replicas (L306), the image (L291), the rolling updates (L302), and the rollbacks (L304) (L306)
> - **The services** (L306) are the stable addresses (L306) — the DNS names (L306) in front of the pods (L306); the pods change (L306), the service name doesn't (L306)
> - **The scaling** (L306) is the autoscaler (L306) — the replicas by the metrics (L306): the CPU, the memory, the custom (L306)
> - The scope (L306): the architect designs for the Kubernetes (L306) — the deployments (L306), the services (L306), and the autoscalers (L306) — and the platform team (L306) runs the cluster (L306); the concepts transfer from the ECS (L295), and the vocabulary (L306) is shared (L306)

## Check your understanding

Answer these without looking back.

1. What's a pod (L306)?
2. What's a deployment (L306)?
3. What's a service (L306)?
4. What's the autoscaler (L306)?
5. How does it compare to the ECS (L295)?
6. What's the architect's scope (L306)?
7. Why the service (L306)?
8. What is the vocabulary (L306)?

## A Closing Note — The Language, Spoken

You now hold the vocabulary: **the pods, the deployments, the services, and the scaling — with the architect designing and the platform team running.** The runtime has its language — and you can speak it (L306).

Next: the capstone — The AI Deployment Pipeline (L307).
