# Lesson 261 — AWS Fundamentals (Regions, AZs)

**Interview importance:** ⭐⭐⭐⭐⭐ — "where does your AI service run?" — the answer is *the map*: regions, AZs, and the shared-responsibility model — the map every AWS answer starts from (L261).**

This is the first lesson of the Cloud & AWS module — and the map the module is drawn on. L260 built the backend floor plan; this lesson is **where it runs**: AWS fundamentals — the regions (the geographic locations, L261), the AZs (the isolated data centers, L261), the edge (L272), and the shared-responsibility model (the security split between AWS and you, L261). The AI SaaS backend (L260) runs in a region (L261), spreads across AZs (L261), and is secured by the shared model (L261). This lesson is the map of that cloud (L261).

The distinction this lesson is built on: a **demo** runs wherever the laptop is. A **solutions architect** chooses the region (L261), designs for the AZs (L261), and knows who secures what (L261) — the map before the services (L261).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the regions: the geographic locations of AWS (L261)
- Explain the AZs: the isolated data centers inside a region (L261)
- Explain the edge: the CloudFront locations closer to users (L272)
- Explain the shared-responsibility model: the security split (L261)
- Explain the AI shape: where the L260 backend runs (L261)

## 1. One-Line Definition

**AWS fundamentals are the map the module is drawn on (L261) — the regions (the geographic locations where AWS runs, L261), the AZs (the isolated data centers inside a region, L261), the edge (the CloudFront locations closer to users, L272), and the shared-responsibility model (AWS secures the cloud; you secure what's in it, L261) — the map before the services (L261).**

The one-sentence interview answer: *"AWS runs in regions — geographic locations like `us-east-1` (L261). Inside each region are AZs — isolated data centers, typically three or more, connected by low-latency links (L261). A production system spreads across AZs: the database in one, the compute in another, so an AZ failure doesn't take the system down (L261). Closer to users is the edge — CloudFront's cache locations that serve static and streaming content from nearby (L272). And the security is a shared-responsibility model: AWS secures the cloud — the physical data centers, the hardware, the network (L261) — and you secure what's in it — your IAM policies (L262), your data (L275), your application (L261). The AI backend (L260) runs in a region, spreads across AZs, is served from the edge, and is secured by the shared model (L261)."*

## 2. Mental Model

Think of AWS as **a set of cities, each with power plants.** The city (the region, L261) is where the services run — pick the city near your users (L261). The power plants (the AZs, L261) are the isolated facilities inside the city: if one plant fails, the others keep the lights on (L261). The neighborhood kiosks (the edge, L272) are the small cache locations closer to your users' homes — the newspaper (the static and streaming content) is available nearby (L272). And the security is a shared contract: the city secures the streets and the grid (the physical infrastructure, L261); you secure your house and your documents (your data and your access, L261). The map works because the city is near, the plants are redundant, the kiosks are close, and the contract is clear (L261).

```text
   the map (L261)
   ┌────────────────────────────────────────────────────────┐
   │ the region (L261) — the city where the services run    │
   │ the AZs (L261) — the isolated power plants             │
   │ the edge (L272) — the neighborhood kiosks              │
   │ the shared model (L261) — the security contract        │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the map**: the city, the plants, the kiosks, and the contract (L261).

## 3. Visual Flow — The Cloud, Mapped

```text
   the users (L261)
        │
        ▼
   ┌──────────────────────── THE EDGE (L272) ────────────────────────┐
   │  CloudFront — the cache locations near the users (L272)         │
   │  the static site · the streamed responses (L251)                │
   └──────────────────────────┬──────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE REGION (L261) ────────────────────────┐
   │  ┌─────────── THE AZs (L261) ───────────┐                       │
   │  │  AZ-a: the compute (L264, L266)      │                       │
   │  │  AZ-b: the compute (L264, L266)      │                       │
   │  │  AZ-c: the database (L268)           │                       │
   │  └──────────────────────────────────────┘                       │
   │  the services: the gateway (L267) · the queues (L270)           │
   │  the models (L278) · the observability (L274)                   │
   └─────────────────────────────────────────────────────────────────┘
      THE SHARED MODEL (L261)
      AWS secures the cloud (the physical infrastructure)
      you secure what's in it (the IAM, the data, the app — L262, L275)
```

The flow is the map: **users → edge → region → AZs**, secured by the shared model (L261).

## 4. How It Works — The Map, Part by Part

- **The regions (L261).** The geographic locations where AWS runs — `us-east-1`, `eu-west-1`, `ap-southeast-1` (L261). The choice is latency (L151) — near the users (L261) — and compliance (L371) — where the data may live (L261).
- **The AZs (L261).** The isolated data centers inside a region — typically three or more, each with independent power, cooling, and networking, connected by low-latency links (L261). The production shape: spread the services across the AZs so an AZ failure (L286) isn't a system failure (L261).
- **The edge (L272).** The CloudFront locations closer to the users (L272) — the static site, the streamed responses (L251), the API acceleration (L267). The edge is the user's distance to the service (L261).
- **The shared-responsibility model (L261).** AWS secures the cloud — the physical data centers, the hardware, the network, the hypervisor (L261). You secure what's in it — the IAM (L262), the data (L275), the application (L261). The split is the first security question (L261).

> [!NOTE]
> **The region and the AZ are different scales (L261).** A region is the geographic location (L261); an AZ is the isolated facility inside it (L261). A service is *regional* — it runs in the region, spread across the AZs (L261) — or *global* — it runs everywhere (L261). The senior answer names the scale: the database (L268) is regional and AZ-spread (L261); IAM (L262) and CloudFront (L272) are global (L261).

## 5. Real Project Usage

- **A multi-region AI SaaS (L286).** The primary region for the app (L261), the standby region for the DR (L286), the traffic routed by Route 53 (L273).
- **A production backend (L260).** The L260 shape deployed in one region (L261): the compute spread across the AZs (L261), the database in the multi-AZ configuration (L268).
- **A global frontend (L272).** The static site and the streamed responses (L251) served from the edge (L272) — the users near the content (L261).
- **A regulated workload (L371).** The region chosen for the compliance boundary (L261) — the data residency (L371).
- **Anything AWS (L261).** The map is the first answer: the region, the AZs, the edge, and the shared model (L261).

The through-line: **the map is the module's start** — every AWS design begins with the region, the AZs, the edge, and the shared model (L261).

## 6. Interview Explanation

Say it in four moves:

1. **The region.** "AWS runs in geographic locations — `us-east-1` (L261) — pick the one near your users (L151)."
2. **The AZs.** "Inside the region are isolated data centers — spread the services across them so an AZ failure isn't a system failure (L286)."
3. **The edge.** "CloudFront (L272) serves the static and streaming content from locations near the users (L251)."
4. **The shared model.** "AWS secures the cloud — the physical infrastructure; you secure what's in it — the IAM (L262), the data (L275), the app (L261)."

## 7. Senior-Level Insights

- **The region is a latency and compliance decision (L261).** The senior answer chooses the region by the users' distance (L151) and the data's residency (L371) — not by habit (L261).
- **The AZ is the availability unit (L261).** The multi-AZ shape (L261) is the availability (L286): the database in the multi-AZ configuration (L268), the compute spread (L264), the queue redundant (L270) — an AZ failure is absorbed (L286).
- **The edge is the user experience (L272).** The static site and the streamed responses (L251) from the edge (L272) — the perceived latency (L151) is the user's distance to the content (L261).
- **The shared model is the security baseline (L261).** The first security answer is the split (L261): what AWS secures (L261) and what you secure (L262, L275) — the L172 baseline, cloud-shaped (L261).
- **The map is the cost's frame (L285).** The region (L261), the AZs (L261), and the edge (L272) all carry cost (L285) — the data transfer between the AZs, the edge requests (L285).

## 8. Common Mistakes

- **The region by habit (L261).** `us-east-1` for a European user base (L261) — the latency (L151) and the compliance (L371) wrong.
- **The single-AZ system (L261).** Everything in one AZ (L261) — the AZ failure (L286) is a total outage (L261).
- **The edge forgotten (L272).** The static site served from the region only (L261) — the global users wait (L151).
- **The shared model blurred (L261).** Expecting AWS to secure the application (L261) — the IAM (L262), the data (L275), and the app are yours (L261).
- **The scales confused (L261).** The region treated as one data center (L261) — the AZ spread and the multi-AZ design (L268) lost.

## 9. Best Practices

- **Pick the region by the users and the compliance** (L261) — the latency (L151) and the residency (L371).
- **Design for the AZs** (L261) — the compute spread (L264), the database multi-AZ (L268), the queue redundant (L270).
- **Serve from the edge** (L272) — the static site and the streamed responses (L251).
- **Know the shared model** (L261) — what AWS secures and what you secure (L262, L275).
- **Cost the map** (L285) — the region, the AZs, and the edge all carry a price (L285).

## 10. Interview Questions

**Q: Walk me through AWS fundamentals.**
> A: The map (L261). The regions — the geographic locations like `us-east-1` (L261). The AZs — the isolated data centers inside a region, spread for availability (L261). The edge — CloudFront's locations near the users, serving the static and streaming content (L272). And the shared-responsibility model — AWS secures the cloud, you secure what's in it (L261).

**Q: How do you choose a region?**
> A: By two axes (L261): the latency — near the users (L151) — and the compliance — where the data may live (L371). The region is the latency and residency decision (L261); everything else follows (L261).

**Q: What's the difference between a region and an AZ?**
> A: The scale (L261). A region is the geographic location (L261); an AZ is the isolated facility inside it — independent power, cooling, and networking (L261). A production system spreads across the AZs so an AZ failure (L286) is absorbed (L261).

**Q: What's in the shared-responsibility model?**
> A: The split (L261). AWS secures the cloud — the physical data centers, the hardware, the network, the hypervisor (L261). You secure what's in it — the IAM (L262), the data (L275), the application (L261). The split is the first security answer (L261).

## 11. Follow-Up Questions

- What are the regions (L261)?
- What are the AZs (L261)?
- What's the edge (L272)?
- What's in the shared-responsibility model (L261)?
- How do the region and the AZ differ (L261)?

## 12. Comparison Table — The Map at Each Scale

| Scale | What it is | The AI shape (L261) |
|---|---|---|
| Region (L261) | the geographic location | the backend's home (L260), chosen by latency (L151) |
| AZ (L261) | the isolated facility inside the region | the spread for availability (L286) |
| Edge (L272) | the cache location near the users | the static site + the streams (L251) |
| Shared model (L261) | the security split | AWS the cloud; you the IAM + data (L262, L275) |

The senior read: **each scale is a decision** — where, how redundant, how close, and who secures it (L261).

## 13. Code Example — The Map in Terraform

```js
// The map, declared (L261): the region, the AZs, the edge (L272).
// THE REGION (L261) — chosen by the users and the compliance (L151, L371).
provider "aws" {
  region = "us-east-1"                     // the geographic location (L261)
}

// THE AZS (L261) — the spread for availability (L286).
// The compute (L264) and the database (L268) live across the AZs.
data "aws_availability_zones" "available" {
  state = "available"                      // the isolated facilities (L261)
}

// THE EDGE (L272) — the cache locations near the users.
resource "aws_cloudfront_distribution" "edge" {
  default_cache_behavior {
    target_origin_id = "origin"            // the static site at the edge (L272)
  }
}

// THE SHARED MODEL (L261) — AWS secures the cloud; the IAM (L262)
// and the data (L275) are yours to secure.
```

```text
What the reader must SEE — the map, declared:

  region = "us-east-1"        → the geographic location (L261)
  aws_availability_zones      → the AZ spread (L261)
  aws_cloudfront_distribution → the edge near the users (L272)
  IAM + data                  → the shared model's your side (L262, L275)

  The map before the services: region, AZs, edge, shared model.
```

```narrate
3-6: The region — the geographic location, chosen by the users and the compliance (L261).
8-12: The AZs — the isolated facilities the compute and the database spread across (L261).
14-19: The edge — the CloudFront distribution serving the static site near the users (L272).
21-23: The shared model — AWS secures the cloud; the IAM and the data are yours (L261, L262, L275).
```

> [!TIP]
> The pair that defines the map: **the region** (where the services run, L261) and **the AZ spread** (how the services survive, L261). **Choose the region, spread the AZs — the map before the services (L261).**

## 14. Performance Notes

- **The region is the latency floor (L151).** The distance from the users (L261) is the round-trip's floor (L151) — the region choice is the first latency decision (L261).
- **The AZ spread is the availability (L286).** The multi-AZ shape (L261) — the compute (L264), the database (L268), the queues (L270) — absorbs an AZ failure (L286).
- **The edge is the perceived latency (L272).** The static site and the streamed responses (L251) from the edge (L272) — the first byte near the user (L151).
- **The map is the cost's frame (L285).** The inter-AZ traffic and the edge requests (L285) — the map's price is in the bill (L285).

## 15. Debugging Scenarios

| Symptom | First check (L261) | The lever |
|---|---|---|
| The users are slow | The region (L261) | The region near the users (L151) |
| The AZ failure kills the system | The AZ spread (L261) | The multi-AZ shape (L286) |
| The static content is slow globally | The edge (L272) | The CloudFront distribution (L272) |
| The access is insecure | The shared model (L261) | The IAM (L262), the data (L275) |
| The bill is surprising | The map's cost (L285) | The region, the AZs, the edge (L285) |

## 16. Quick Revision Notes

- AWS fundamentals = **the map** (L261): the regions, the AZs, the edge, the shared model.
- The regions: **the geographic locations** (L261) — `us-east-1`.
- The AZs: **the isolated facilities** (L261) — the spread for availability (L286).
- The edge: **CloudFront (L272)** — the static and streaming content near the users (L251).
- The shared model: **AWS the cloud; you the IAM + data (L262, L275)**.

## 17. Cheat Sheet

```text
AWS FUNDAMENTALS = the map before the services

THE REGION (L261)
  the geographic location — us-east-1, eu-west-1, ap-southeast-1
  chosen by the latency (L151) and the compliance (L371)

THE AZS (L261)
  the isolated data centers inside the region
  independent power, cooling, networking · low-latency links
  the production shape: the spread for availability (L286)

THE EDGE (L272)
  CloudFront — the cache locations near the users
  the static site · the streamed responses (L251)

THE SHARED MODEL (L261)
  AWS secures the cloud — the physical infrastructure
  you secure what's in it — the IAM (L262), the data (L275), the app

INTERVIEW, 4 MOVES
  1 region    "the geographic location — pick near the users (L151)"
  2 AZs       "the isolated facilities — the spread for availability (L286)"
  3 edge      "CloudFront — the static and streaming content near the users (L272)"
  4 shared    "AWS the cloud; you the IAM, the data, the app (L262, L275)"
```

## 18. Key Takeaways

> [!RECAP]
> - AWS fundamentals are **the map the module is drawn on** (L261): the regions (L261), the AZs (L261), the edge (L272), and the shared-responsibility model (L261)
> - **The region** (L261) is the geographic location — chosen by the users' latency (L151) and the data's compliance (L371)
> - **The AZs** (L261) are the isolated facilities inside the region — the spread (L286) that absorbs an AZ failure
> - **The edge** (L272) is CloudFront — the static site and the streamed responses (L251) served near the users
> - **The shared model** (L261) splits the security: AWS secures the cloud, and you secure what's in it — the IAM (L262), the data (L275), and the application
> - The L260 backend runs on this map (L261): a region, an AZ spread, an edge, and the shared model — the map before the services (L261)

## Check your understanding

Answer these without looking back.

1. What are the regions (L261)?
2. What are the AZs (L261)?
3. What's the edge (L272)?
4. What's in the shared-responsibility model (L261)?
5. How do the region and the AZ differ (L261)?
6. Why spread across the AZs (L286)?
7. What's the shared model's your side (L262, L275)?
8. What is M24's map (L261)?

## A Closing Note — The Map, Drawn

You now hold the map: **the region, the AZs, the edge, and the shared-responsibility model.** The L260 backend has a home — and the map is drawn (L261).

Next: the permission model everything else inherits — IAM (L262).
