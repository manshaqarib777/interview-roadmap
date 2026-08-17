# Lesson 287 — Cloud Architecture for an AI SaaS (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of Cloud & AWS: the edge, the front door, the compute, the data, the queues, the models, the cost, and the resilience — one coherent AWS architecture (L287).**

This is the last lesson of the Cloud & AWS module — and the synthesis it was built toward. L261–L286 gave you the parts: the map (L261), the permissions (L262), the network (L263), the compute (L264, L266, L271), the storage (L265), the front door (L267), the data (L268–269), the queues (L270), the edge (L272–273), the observability (L274), the secrets (L275), the events and the workflows (L276–277), the models (L278–281), the patterns (L282–284), the cost (L285), and the resilience (L286). This lesson **reassembles them into one coherent cloud architecture for a multi-tenant AI SaaS** — the shape you'd actually deploy (L287).

The distinction this lesson is built on: a **specialist** knows the services. A **solutions architect** assembles them into a whole — and explains why each part sits where it does, what it costs (L285), and what happens when it fails (L286). That assembly is M24's milestone: a Bedrock + Lambda + pgvector AI stack with cost controls (L287).

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L261–L286 into one coherent cloud architecture
- Draw the full flow: edge → gateway → compute → data → models → observability
- Explain each part's placement by its boundary — the door, the fast layer, the engine room
- Describe the cost controls: the model routing, the provisioned, the budgets (L285)
- Describe the resilience: the AZ spread, the multi-region, the RTO/RPO (L286)
- Defend the architecture in an interview: the parts, the boundaries, the trade-offs (L287)

## 1. One-Line Definition

**The cloud architecture for an AI SaaS is the module's synthesis — the edge (the CloudFront L272), the front door (the API Gateway L267 with the auth L267 and the throttling L242), the compute (the Lambda L266 and the ECS L271), the fast layer (the ElastiCache L269), the data (the RDS + pgvector L268, the S3 L265), the engine room (the SQS L270 and the Step Functions L277), the models (the Bedrock L278 with the guardrails L281), the observability (the CloudWatch L274), the cost controls (the routing L155, the provisioned L278, the budgets L285), and the resilience (the AZ spread L261, the multi-region L286) — one coherent AWS architecture for a multi-tenant AI SaaS, assembled and defended (L287).**

The one-sentence interview answer: *"The AI SaaS cloud architecture is the module in one design (L287). The edge: CloudFront (L272) — the static frontend and the streams (L251). The front door: the API Gateway (L267) — the routes (L267), the auth (L267), the throttling (L242). The compute: the Lambda (L266) for the request handlers and the workers, the ECS (L271) for the services that outgrow them (L284). The fast layer: the ElastiCache (L269) — the sessions (L237), the response cache (L171). The data: the RDS with the pgvector (L268, L183) — the tenants (L320), the history (L166), the vectors (L183) — and the S3 (L265) for the documents (L280). The engine room: the SQS (L270) and the Step Functions (L277) — the jobs (L249) and the workflows (L217), with the DLQ (L232). The models: the Bedrock (L278) — the one API (L278) with the guardrails (L281), the Knowledge Bases (L280) for the RAG (L280), the Agents (L279) for the loops (L279). The observability: the CloudWatch (L274) — the tokens (L332), the cost (L334), the alarms (L274). The cost controls: the model routing (L155), the provisioned (L278), the cache (L171), and the budgets (L285). The resilience: the AZ spread (L261) and the multi-region (L286) with the RTO/RPO (L374). Assemble it, cost it, and defend it — that's M24 (L287)."*

## 2. Mental Model

Think of the cloud architecture as **the city the module built.** The map (the regions and the AZs, L261) is where the city sits; the badge system (the IAM, L262) and the walls (the VPC, L263) control the access. The airport (the CloudFront edge, L272) greets the visitors and the fast mail (the streams, L251); the city hall (the API Gateway, L267) is the front desk — every visitor checked in (the auth, L267), every pace measured (the throttle, L242). The workshops (the Lambda, L266, and the ECS, L271) do the work; the pantry (the ElastiCache, L269) keeps the hot items at hand; the archives (the RDS, L268, and the S3, L265) hold the records (L287). The mailroom (the SQS, L270) and the assembly lines (the Step Functions, L277) handle the slow work (L222). The power plant (the Bedrock, L278) supplies the intelligence — with the inspectors (the guardrails, L281) at the gates (L287). The control room (the CloudWatch, L274) watches the numbers; the treasurer (the cost controls, L285) watches the bill; and the emergency plan (the multi-region, L286) keeps the city running when a district fails (L287). The city works because the parts sit by their boundaries — the door, the fast layer, the engine room, the power plant — and the whole is watched and costed (L287).

```text
   the city (the cloud architecture, L287)
   ┌────────────────────────────────────────────────────────┐
   │ the map (L261) · the badges (L262) · the walls (L263)  │
   │ the airport (the edge, L272) · the city hall (the      │
   │ gateway, L267)                                         │
   │ the workshops (the compute, L266, L271) · the pantry   │
   │ (the cache, L269) · the archives (the data, L268, L265)│
   │ the mailroom (the SQS, L270) · the lines (the Step     │
   │ Functions, L277)                                       │
   │ the power plant (the Bedrock, L278) · the inspectors   │
   │ (the guardrails, L281) · the control room (L274)       │
   │ the treasurer (the cost, L285) · the emergency plan    │
   │ (the DR, L286)                                         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the city**: the guarded access, the working districts, the power plant, and the watched whole (L287).

## 3. Visual Flow — The Whole Architecture, One Diagram

```text
   the users (L287)
        │
        ▼
   ┌────────────────────── THE EDGE (L272) ────────────────────────────┐
   │  CloudFront (L272): the static frontend (L96) + the streams (L251)│
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE FRONT DOOR (L267) ──────────────────────┐
   │  the API Gateway (L267): the routes (L267) · the auth (L267)     │
   │  the throttling (L242) · the streaming (L251)                    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE COMPUTE (L266, L271) ───────────────────┐
   │  the Lambda (L266): the handlers + the workers (L270)            │
   │  the ECS (L271): the outgrown services (L284)                    │
   │  the fast layer: the ElastiCache (L269) — the sessions (L237),   │
   │  the cache (L171)                                                │
   └──────────────┬──────────────────────────────────┬────────────────┘
                  ▼                                  ▼
   ┌──────────────────────────┐   ┌──────────────────────────────────┐
   │ THE DATA (L268, L265)    │   │ THE ENGINE ROOM (L270, L277)      │
   │ the RDS + pgvector (L268)│   │ the SQS (L270) + the workers      │
   │ the tenants, the history,│   │ (L266) · the Step Functions (L277)│
   │ the vectors (L183)       │   │ the DLQ (L232) · the events (L276)│
   │ the S3 (L265) — the docs │   └──────────────────────────────────┘
   └──────────────────────────┘
   ┌────────────────────── THE MODELS (L278) ──────────────────────────┐
   │  the Bedrock (L278): the one API (L278) · the guardrails (L281)  │
   │  the Knowledge Bases (L280) · the Agents (L279)                  │
   └──────────────────────────────────────────────────────────────────┘
      THE WATCH (L274): the CloudWatch — the tokens (L332), the cost
      (L334), the alarms (L274) · THE COST (L285): the routing (L155),
      the provisioned (L278), the budgets (L285) · THE RESILIENCE
      (L286): the AZ spread (L261), the multi-region (L286), the RTO/RPO
```

The flow is the module in one diagram: **edge → front door → compute → data + engine room → models**, watched, costed, and resilient (L287).

## 4. How It Works — The Assembly, Part by Part

- **The edge and the door (L272, L267).** The CloudFront (L272) serves the static and the streams (L251); the API Gateway (L267) routes, authorizes (L267), throttles (L242), and streams (L267) — the L236 front door (L236), AWS-shaped (L267).
- **The compute and the fast layer (L266, L271, L269).** The Lambda (L266) for the handlers and the workers (L270); the ECS (L271) for the outgrown services (L284); the ElastiCache (L269) for the sessions (L237) and the cache (L171).
- **The data and the engine room (L268, L265, L270, L277).** The RDS + pgvector (L268, L183) for the tenants (L320), the history (L166), and the vectors (L183); the S3 (L265) for the documents (L280); the SQS (L270) and the Step Functions (L277) for the jobs (L249) and the workflows (L217), with the DLQ (L232).
- **The models (L278).** The Bedrock (L278) — the one API (L278) with the guardrails (L281), the Knowledge Bases (L280) for the RAG (L280), the Agents (L279) for the loops (L279).
- **The watch, the cost, and the resilience (L274, L285, L286).** The CloudWatch (L274) — the tokens (L332), the cost (L334), the alarms (L274); the cost controls (L285) — the routing (L155), the provisioned (L278), the budgets (L285); the resilience (L286) — the AZ spread (L261), the multi-region (L286), the RTO/RPO (L374).

> [!NOTE]
> **The assembly rule: every part is placed by a boundary (L287).** The edge (L272) is where the static and the streams live (L272); the front door (L267) is where the auth (L267) and the limits (L242) live; the fast layer (L269) is where the hot data lives (L171); the engine room (L270) is where the slow work lives (L222); the models (L278) are where the intelligence lives (L148); and the watch, the cost, and the resilience (L274, L285, L286) wrap the whole (L287). An architect who can name the boundary for each part can defend the whole assembly (L287) — and M24's milestone is that defense (L287).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The full assembly (L287): the edge (L272), the door (L267), the compute (L266, L271), the data (L268), the engine room (L270), the models (L278), the watch (L274), the cost (L285), and the resilience (L286).
- **A multi-tenant platform (L357).** The per-tenant isolation (L320): the per-tenant keys (L265), the per-tenant limits (L242), the per-tenant cost (L334) — the L320 discipline (L320), cloud-shaped (L287).
- **A RAG product (L280).** The documents in the S3 (L265), the Knowledge Bases (L280), the retrieval (L189) — the RAG pattern (L280), assembled (L287).
- **An agent product (L279).** The Bedrock Agents (L279) with the action groups (L279), the Knowledge Bases (L280), and the guardrails (L281) — the agent pattern (L279), assembled (L287).
- **Anything "production AI" (L287).** The pattern is the shape (L287): the edge, the door, the compute, the data, the engine room, the models — watched, costed, and resilient (L287).

The through-line: **the floor plan is the module's output** — every AI SaaS cloud is this assembly, and M24's milestone is building it and defending it (L287).

## 6. Interview Explanation

Say it in four moves:

1. **The assembly.** "The edge (L272), the front door (L267), the compute (L266, L271), the data (L268), the engine room (L270), the models (L278)."
2. **The flow.** "The request: edge → gateway → compute → data → models → stream; the work: the queue."
3. **The boundaries.** "The auth at the door (L267); the hot data in the fast layer (L269); the slow work in the engine room (L270)."
4. **The whole.** "The watch (L274), the cost (L285), and the resilience (L286) — the AZ spread (L261), the multi-region (L286), the RTO/RPO (L374)."

## 7. Senior-Level Insights

- **The architecture is the sum of its boundaries (L287).** A senior review of an AI SaaS cloud checks the boundaries first (L287): where's the door (L267), the fast layer (L269), the engine room (L270), the model (L278), the cost (L285), the DR (L286)? Naming each is the review (L287).
- **The front door is the L172 baseline, operational (L267).** The API Gateway (L267) — the auth (L267), the throttling (L242), the guardrails (L281) at the model (L278) — the L172 baseline (L172), cloud-shaped (L287).
- **The engine room is the economics (L222).** The SQS (L270) and the Step Functions (L277) — the slow work (L222) off the request path (L151), the cost (L285) bounded (L256).
- **The model is the biggest line (L150).** The Bedrock (L278) — the routing (L155), the provisioned (L278), the cache (L171) — the cost controls (L285) around the biggest line (L150).
- **The resilience is the production difference (L286).** The AZ spread (L261) and the multi-region (L286) — the RTO/RPO (L374) — the demo runs in one region; this platform survives a region (L286).
- **The observability is the whole's record (L274).** The CloudWatch (L274) — the tokens (L332), the cost (L334), the alarms (L274) — the debugging (L211), the audit (L322), and the cost (L285) read the same record (L287).

## 8. Common Mistakes

- **The door missing (L267).** The Lambda exposed directly (L267) — no auth (L267), no throttling (L242), no L172 baseline (L172).
- **The slow path unlayered (L222).** The model call in the request (L222) — the engine room (L270) skipped, the user waits (L151).
- **The hot data in the database (L151).** Every read hitting the RDS (L268) — the fast layer (L269) missing.
- **The single region (L286).** No standby (L286) — the region failure (L286) is the total outage (L286).
- **The cost unmanaged (L150).** The frontier model for every call (L150) — the routing (L155) and the budgets (L285) missing.
- **The observability bolted on (L213).** The metrics after shipping (L274) — the debugging (L211) and the audit (L322) starved (L287).

## 9. Best Practices

- **Draw the floor plan first** (L287) — the edge, the door, the compute, the data, the engine room, the models (L287).
- **Place every part by its boundary** (L287) — the auth at the door (L267), the hot data in the fast layer (L269), the slow work in the engine room (L270).
- **Guard the models** (L281) — the guardrails (L281) at the Bedrock (L278), the knowledge (L280) and the agents (L279) managed (L287).
- **Cost the whole** (L285) — the routing (L155), the provisioned (L278), the budgets (L285), the attribution (L334).
- **Layer the resilience** (L286) — the AZ spread (L261), then the multi-region (L286) with the RTO/RPO (L374).
- **Build the milestone** (L287) — assemble it, cost it, and defend it with the L261–L286 vocabulary (L287).

## 10. Interview Questions

**Q: Walk me through an AI SaaS cloud architecture.**
> A: Seven parts (L287). The edge — the CloudFront (L272): the static and the streams (L251). The front door — the API Gateway (L267): the routes, the auth, the throttling (L242). The compute — the Lambda (L266) and the ECS (L271), with the ElastiCache (L269) as the fast layer. The data — the RDS + pgvector (L268, L183) and the S3 (L265). The engine room — the SQS (L270) and the Step Functions (L277), with the DLQ (L232). The models — the Bedrock (L278) with the guardrails (L281). And the whole — the CloudWatch (L274), the cost controls (L285), and the multi-region (L286).

**Q: Why is the API Gateway the front door?**
> A: Because it's where the cross-cutting concerns live (L267): the routes (L267), the auth (L267), the throttling (L242), and the streaming (L251) are enforced once, at the door (L267). It's the L172 baseline (L172), operational (L267) — the Lambda (L266) is never exposed directly (L267).

**Q: How do you control the cost?**
> A: Around the biggest line (L150): the model routing (L155) — the cheap for the simple, the frontier for the hard (L157); the provisioned throughput (L278) for the steady load (L278); the cache (L171) for the repeated prompts (L171); and the budgets (L285) with the per-tenant attribution (L334) — the L285 levers (L285), all applied (L287).

**Q: What makes it production and not a demo?**
> A: The watch, the cost, and the resilience (L287). The CloudWatch (L274) — the tokens (L332), the cost (L334), the alarms (L274). The cost controls (L285) — the routing (L155), the provisioned (L278), the budgets (L285). And the resilience (L286) — the AZ spread (L261), the multi-region (L286), the RTO/RPO (L374). A demo runs in one region on one model; this platform is watched, costed, and survives a region (L287).

## 11. Follow-Up Questions

- What are the seven parts (L287)?
- Why is the API Gateway the front door (L267)?
- Where does the AI work run (L270)?
- How do you control the cost (L285)?
- How does the resilience compose (L286)?

## 12. Comparison Table — Demo vs the Production Cloud

| Layer | Demo | The production cloud (this lesson) |
|---|---|---|
| The edge (L272) | none | the CloudFront (L272) |
| The front door (L267) | the Lambda URL | the API Gateway (L267): the auth, the throttle (L242) |
| The compute (L266, L271) | one server | the Lambda (L266) + the ECS (L271) |
| The fast layer (L269) | none | the ElastiCache (L269) |
| The data (L268) | the laptop's DB | the RDS + pgvector (L268, L183), the S3 (L265) |
| The engine room (L270) | none | the SQS (L270), the Step Functions (L277), the DLQ (L232) |
| The models (L278) | one provider call | the Bedrock (L278), the guardrails (L281), the KBs (L280) |
| The cost (L285) | the surprise | the routing (L155), the provisioned (L278), the budgets (L285) |
| The resilience (L286) | one region | the AZ spread (L261), the multi-region (L286) |

The senior read: **the table is the milestone** — M24's claim is building the right column and defending it with the left column's failures in mind (L287).

## 13. Code Example — The Assembly in One Shape

```text
The AI SaaS cloud (L287) — the floor plan as folders:

  edge/                      THE EDGE (L272)
    cloudfront.ts            the static + the streams (L251)

  front-door/                THE FRONT DOOR (L267)
    api-gateway.ts           the routes + the auth (L267)
    throttle.ts              the rate limits (L242)

  compute/                   THE COMPUTE (L266, L271)
    lambdas/                 the handlers + the workers (L270)
    ecs/                     the outgrown services (L284)
    fast-layer.ts            the ElastiCache (L269) — the cache (L171)

  data/                      THE DATA (L268, L265)
    rds-pgvector.ts          the tenants (L320) + the vectors (L183)
    s3.ts                    the documents (L280)

  engine-room/               THE ENGINE ROOM (L270, L277)
    sqs.ts                   the jobs (L249) + the DLQ (L232)
    step-functions.ts        the workflows (L217)
    eventbridge.ts           the events (L276)

  models/                    THE MODELS (L278)
    bedrock.ts               the one API (L278) + the guardrails (L281)
    knowledge-bases.ts       the RAG (L280)
    agents.ts                the loops (L279)

  watch/                     THE WATCH (L274)
    cloudwatch.ts            the tokens (L332) + the alarms (L274)

  cost/                      THE COST (L285)
    routing.ts               the cheap vs the frontier (L155)
    budgets.ts               the alert at 80% (L274, L285)

  resilience/                THE RESILIENCE (L286)
    az-spread.ts             the multi-AZ (L261)
    multi-region.ts          the failover (L273) + the RTO/RPO (L374)

  The edge serves, the door guards, the engine room works,
  the models think, and the whole is watched, costed, and resilient.
```

```text
What the reader must SEE — the boundaries as folders:

  edge/        the static + the streams (L272)
  front-door/  the auth + the limits (L267, L242)
  compute/     the handlers + the fast layer (L266, L269)
  data/        the tenants + the vectors (L268, L183)
  engine-room/ the jobs + the workflows (L270, L277)
  models/      the Bedrock + the guardrails (L278, L281)
  watch/       the observability (L274)
  cost/        the routing + the budgets (L285)
  resilience/  the DR (L286)

  Every folder is a boundary; every boundary is a lesson.
```

```narrate
3-6: The edge — the CloudFront for the static and the streams (L272, L251).
8-12: The front door — the API Gateway with the routes, the auth, and the throttling (L267, L242).
14-19: The compute — the Lambdas, the ECS, and the fast layer (L266, L271, L269).
21-26: The data — the RDS with the pgvector and the S3 (L268, L183, L265).
28-32: The engine room — the SQS, the Step Functions, and the EventBridge (L270, L277, L276).
34-39: The models — the Bedrock, the Knowledge Bases, and the Agents (L278, L280, L279).
41-44: The watch — the CloudWatch metrics and the alarms (L274).
46-49: The cost — the routing and the budgets (L155, L285).
51-54: The resilience — the AZ spread and the multi-region (L261, L286).
```

> [!TIP]
> The folder shape *is* the architecture: **edge, front-door, compute, data, engine-room, models, watch, cost, resilience** — each a boundary, each a lesson (L287). **If the auth isn't at the door (L267) or the slow work isn't in the engine room (L270), the floor plan is missing its walls — that's M24's milestone in a directory tree (L287).**

## 14. Performance Notes

- **The edge is the perceived latency (L151).** The CloudFront (L272) — the static and the streams (L251) from the edge (L261) — the user's distance (L151) collapsed (L287).
- **The front door is the latency budget (L151).** The auth (L267) and the throttle (L242) in the fast layer (L269) — the checks sub-millisecond (L287).
- **The fast layer is the request's speed (L151).** The cache hits (L171) — the database (L268) and the model (L278) skipped (L150).
- **The engine room is the async throughput (L222).** The workers (L266) on the SQS (L270) — the model calls (L278) processed in parallel (L222), the request path fast (L151).
- **The model is the latency's floor (L145).** The Bedrock (L278) — the TTFT (L145) and the streaming (L251) — the model's speed (L333) is the response's (L287).

## 15. Debugging Scenarios

| Symptom | First check (L287) | The lever |
|---|---|---|
| The users are slow | The edge (L272) | The CloudFront (L272) |
| The request is slow | The fast layer (L269) | The cache (L171) |
| The user waits on the model | The engine room (L222) | The queue (L270) |
| The bill spikes | The model (L150) | The routing (L155), the provisioned (L278) |
| The region fails | The resilience (L286) | The failover (L273), the RTO/RPO (L374) |
| The failure is opaque | The watch (L274) | The CloudWatch alarms (L274) |

## 16. Quick Revision Notes

- The cloud architecture for an AI SaaS = **the module's synthesis** (L287): the edge, the door, the compute, the data, the engine room, the models, the whole.
- The edge: **the CloudFront (L272) — the static and the streams (L251)**.
- The front door: **the API Gateway (L267) — the auth (L267), the throttle (L242)**.
- The compute: **the Lambda (L266) + the ECS (L271) + the ElastiCache (L269)**.
- The data: **the RDS + pgvector (L268, L183) + the S3 (L265)**.
- The engine room: **the SQS (L270) + the Step Functions (L277) + the DLQ (L232)**.
- The models: **the Bedrock (L278) + the guardrails (L281) + the KBs (L280)**.
- The whole: **the watch (L274), the cost (L285), the resilience (L286)**.

## 17. Cheat Sheet

```text
CLOUD ARCHITECTURE FOR AN AI SAAS = the module's synthesis

THE SEVEN PARTS (L287)
  edge       the CloudFront (L272) — the static + the streams (L251)
  front door the API Gateway (L267) — the auth (L267), the throttle (L242)
  compute    the Lambda (L266) + the ECS (L271) + the cache (L269)
  data       the RDS + pgvector (L268, L183) + the S3 (L265)
  engine room the SQS (L270) + the Step Functions (L277) + the DLQ (L232)
  models     the Bedrock (L278) + the guardrails (L281) + the KBs (L280)
  the whole  the watch (L274) + the cost (L285) + the resilience (L286)

THE BOUNDARIES (L287)
  the auth at the door (L267) · the hot data in the fast layer (L269)
  the slow work in the engine room (L270) · the models guarded (L281)

THE COST (L285)
  the routing (L155) · the provisioned (L278) · the cache (L171)
  the budgets (L285) · the attribution (L334)

THE RESILIENCE (L286)
  the AZ spread (L261) · the multi-region (L286)
  the RTO/RPO (L374)

THE MILESTONE (M24)
  assemble the edge, the door, the compute, the data, the engine room,
  and the models — watched, costed, and resilient (L287)

INTERVIEW, 4 MOVES
  1 assembly "edge, door, compute, data, engine room, models (L287)"
  2 flow     "edge → gateway → compute → data → models → stream (L287)"
  3 boundaries "auth at the door, hot data fast, slow work queued (L287)"
  4 the whole "the watch, the cost, the resilience (L287)"
```

## 18. Key Takeaways

> [!RECAP]
> - The cloud architecture for an AI SaaS is **the module's synthesis** (L287): the edge (L272), the front door (L267), the compute (L266, L271), the data (L268, L265), the engine room (L270, L277), and the models (L278) — watched (L274), costed (L285), and resilient (L286)
> - **The edge** (L272) is the CloudFront — the static frontend (L96) and the streams (L251) from the edge (L261)
> - **The front door** (L267) is the API Gateway — the routes (L267), the auth (L267), and the throttling (L242) — the L172 baseline (L172), operational (L267)
> - **The compute** (L266, L271) is the Lambda (L266) and the ECS (L271), with the ElastiCache (L269) as the fast layer — the sessions (L237) and the cache (L171)
> - **The data** (L268, L265) is the RDS + pgvector (L268, L183) — the tenants (L320), the history (L166), the vectors (L183) — and the S3 (L265) for the documents (L280)
> - **The engine room** (L270, L277) is the SQS (L270) and the Step Functions (L277) — the jobs (L249), the workflows (L217), and the DLQ (L232)
> - **The models** (L278) are the Bedrock (L278) — the one API (L278) with the guardrails (L281), the Knowledge Bases (L280), and the Agents (L279)
> - **The whole** (L287): the CloudWatch (L274) — the tokens (L332), the cost (L334), the alarms (L274); the cost controls (L285) — the routing (L155), the provisioned (L278), the budgets (L285); and the resilience (L286) — the AZ spread (L261), the multi-region (L286), the RTO/RPO (L374) — assemble it, cost it, and defend it, and M24 is claimed (L287)

## Check your understanding

Answer these without looking back.

1. What are the seven parts (L287)?
2. Why is the API Gateway the front door (L267)?
3. What's in the fast layer (L269)?
4. What's in the engine room (L270)?
5. What's the model tier (L278)?
6. How do you control the cost (L285)?
7. How does the resilience compose (L286)?
8. What is M24's milestone (L287)?

## A Closing Note — The City, Assembled

That was the last lesson of the Cloud & AWS module — and the one you'll *deploy*. L261–L286 gave you the parts; this lesson gave you the floor plan: **the edge, the front door, the compute, the data, the engine room, the models — watched, costed, and resilient.** When you can draw it, cost it, and defend it — naming the door (L267), the fast layer (L269), the engine room (L270), the models (L278), the cost (L285), and the DR (L286) — you have claimed Milestone M24.

The next module turns the deployed cloud into the *delivery pipeline*: Docker / DevOps / Infrastructure (L288–L307) — the containers (L288–293), the ECR and the ECS (L294–295), the CI/CD (L296–297), the IaC (L298–299), the environments and the secrets (L300–301), the deployments (L302–304), the observability (L305), and the Kubernetes concepts (L306) — the L287 cloud, shipped through the pipeline (L307). You've built the city; now you'll build the road that delivers to it.
