# Module 13 — Cloud & AWS for AI

## Why this module comes thirteenth

Modules 7–12 built the AI product: the model decision (M18), the app (M19), the knowledge (M20), the loop (M21), the automation (M22), and the backend (M23). Every one of them runs on **infrastructure** — and this module is that infrastructure. The L260 backend is the floor plan; this module is **the cloud it stands on** — the regions and IAM (L261–262), the network (L263), the compute (L264, L266), the storage (L265), the front door (L267), the databases (L268–269), the queues (L270), the containers (L271), the edge (L272–273), the observability (L274), the secrets (L275), the events and workflows (L276–277), and the Bedrock (L278–281) that hosts the models — assembled into the repeatable patterns (L282–284), the cost controls (L285), the resilience (L286), and the synthesis (L287).

The distinction this module is built on: a **demo** runs on a laptop. A **solutions architect** runs it on AWS — and explains *where each part sits, why it sits there, what it costs, and what happens when it fails*. The L260 backend is the shape; this module is the deployment (L287).

## Module map

- **M24 · Cloud & AWS for AI (L261–287)** — the cloud under the product.
  The map and the permission model (L261–262), the network (L263), the compute (L264, L266), the storage (L265), the front door (L267), the databases (L268–269), the queues (L270), the containers (L271), the edge (L272–273), the observability (L274), the secrets (L275), the events and workflows (L276–277), the Bedrock (L278–281), the repeatable patterns (L282–284), the cost (L285), the resilience (L286), and the synthesis (L287) that assembles one coherent cloud architecture.

## How to study each lesson

1. **Follow one request through the module.** A streaming chat request (L251) enters the CloudFront edge (L272), hits the API Gateway (L267), gets authenticated by IAM (L262) and the Lambda (L266), reads the RDS + pgvector (L268), streams from Bedrock (L278), and is traced in CloudWatch (L274) — with the whole path costed (L285). The module is that path, taught layer by layer.
2. **Learn the AWS vocabulary.** Regions and AZs (L261), IAM (L262), VPC (L263), the services (L264–277), and Bedrock (L278–281) — the words every AWS design round uses. Learn the names with their mechanisms.
3. **Apply the earlier modules.** The gateway (L236) becomes the API Gateway (L267); the Redis (L243) becomes ElastiCache (L269); the queues (L245) become SQS (L270); the model access (L148) becomes Bedrock (L278). This module is the L260 backend, deployed (L287).
4. **Build the synthesis at the end (L287).** The final lesson assembles the whole: the edge, the front door, the compute, the data, the queues, the models, the cost, and the resilience — one coherent cloud architecture for a multi-tenant AI SaaS. Draw it, cost it, and defend it — and M24 is claimed.

## Prerequisites

Module 12 (L233–260) — the backend the cloud hosts (L260). Module 7 (L135–157) — the model access that Bedrock (L278) provides (L148). Module 9 (L174–197) — the RAG that Bedrock Knowledge Bases (L280) manages (L183). Module 3 (L47–82) and Module 4 (L83–96) — the frontend that CloudFront (L272) and the API Gateway (L267) serve.

## Next

→ [Lesson 261 — AWS Fundamentals (regions, AZs)](./261-aws-fundamentals.md)
