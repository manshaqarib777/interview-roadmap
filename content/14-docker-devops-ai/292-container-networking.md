# Lesson 292 — Container Networking

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do the containers talk to each other?" — the answer is *the container network*: the ports, the networks, and the service discovery (L292).**

L290 ran the stack; this lesson is **how its parts talk**: the container networking — the ports (the published and the internal, L292), the networks (the bridge, the host, the none, L292), and the service discovery (the DNS names, L292). The AI stack's shape (L290): the app reaches the Postgres by the name (L292), the model calls (L278) go out through the host network (L292), and the internal ports stay internal (L292). This lesson is the container's streets (L292).

The distinction this lesson is built on: a **demo** uses the localhost. A **solutions architect** designs the container network (L292): the ports (L292), the networks (L292), and the discovery (L292) — because the L287 cloud's networking (L263) starts with the container's (L292).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the ports: the published and the internal (L292)
- Explain the networks: the bridge, the host, the none (L292)
- Explain the service discovery: the DNS names (L292)
- Explain the egress: the outbound calls (L292)
- Explain the AI shape: the stack's streets (L292)

## 1. One-Line Definition

**The container networking is how the containers talk (L292) — the ports (the published: the host's port to the container's, L292; the internal: the container's own ports on the network, L292), the networks (the bridge — the default private network; the host — the host's network shared; the none — the isolated, L292), and the service discovery (the DNS names: the containers reach each other by the service name, L292) — the app reaches `postgres:5432` (L292), and the model calls (L278) go out through the NAT (L292).**

The one-sentence interview answer: *"The container network connects the containers (L292). The ports (L292): the internal ports (L292) — the container's own ports, like the app's 3000 (L292) — are reachable on the container's network (L292); the published ports (L292) — the `-p 3000:3000` (L292) — map the host's port to the container's (L292), for the outside world (L292). The networks (L292): the bridge (L292) — the default private network, the containers on it reach each other (L292); the host (L292) — the container shares the host's network stack (L292); the none (L292) — the isolated (L292). The service discovery (L292): on the bridge (L292), the containers resolve each other by the name (L292) — the app reaches `postgres:5432` (L292) — the IPs change (L292), the names don't (L292). The egress (L292): the outbound calls (L292) — the model (L278) and the external APIs (L227) — go through the host's network (L292) with the NAT (L292). The AI shape (L290): the app (L173), the Postgres (L268), and the Redis (L269) on one bridge (L292), the app reaching the Postgres by the name (L292), and the Bedrock calls (L278) going out (L292)."*

## 2. Mental Model

Think of the container network as **the apartment building's floors and the mail slots.** The building (the host, L292) has the floors (the bridge networks, L292): the apartments (the containers, L288) on the same floor (the network, L292) reach each other by knocking on the named doors (the service discovery, L292) — "the postgres apartment" (L292). The mail slots (the published ports, L292) are the one-way openings to the street (the host, L292): the mail carrier (the outside world, L292) delivers through the slot (the `-p 3000:3000`, L292) to the apartment (the container, L292). The apartments without the street slots (the internal ports, L292) are reachable only from the floor (L292). And the building's exits (the egress, L292): the residents (the containers, L292) go out to the city (the internet, L292) through the lobby (the host's NAT, L292). The building works because the floors are named, the slots are mapped, and the exits are shared (L292).

```text
   the building (the host, L292)
   ┌────────────────────────────────────────────────────────┐
   │ the floors (the networks, L292) — the bridge (L292)    │
   │ the doors (the discovery, L292) — the service names    │
   │ (L292)                                                 │
   │ the mail slots (the published ports, L292) — the       │
   │ outside (L292)                                         │
   │ the lobby (the egress, L292) — the NAT (L292)          │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the building**: the floors, the doors, the mail slots, and the lobby (L292).

## 3. Visual Flow — One Request Across the Network

```text
   the client (L292)
        │  the published port (L292)
        ▼
   ┌────────────────────── THE HOST (L292) ─────────────────────────────┐
   │  localhost:3000 → the app container's 3000 (L292)                │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE BRIDGE (L292) ───────────────────────────┐
   │  the app (L173) ── the service name ──► postgres:5432 (L292)     │
   │  the app (L173) ── the service name ──► redis:6379 (L292)        │
   │  the internal ports — not published (L292)                       │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EGRESS (L292) ───────────────────────────┐
   │  the model calls (L278) → the host's NAT → the internet (L292)   │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the network: **the published port in → the bridge across → the NAT out** (L292).

## 4. How It Works — The Streets, Part by Part

- **The ports (L292).** The internal ports (L292): the container's own ports (L292), reachable on the network (L292). The published ports (L292): the `-p host:container` (L292) — the host's port to the container's (L292) — for the outside (L292).
- **The networks (L292).** The bridge (L292): the default private network — the containers on it reach each other (L292); the host (L292): the container shares the host's network stack (L292); the none (L292): the isolated (L292).
- **The service discovery (L292).** The DNS names (L292): on the bridge (L292), the containers resolve each other by the name (L292) — the app reaches `postgres:5432` (L292). The IPs change (L292); the names don't (L292).
- **The egress (L292).** The outbound calls (L292): the model (L278) and the external APIs (L227) — through the host's network (L292) with the NAT (L292).

> [!NOTE]
> **The published port is the only door from the outside (L292).** The senior answer minimizes the published ports (L292): the app's 3000 (L292) is the only door (L292); the Postgres's 5432 and the Redis's 6379 (L292) are internal (L292) — reachable on the bridge (L292), not from the host or the internet (L292). The L263 security groups (L263) — the cloud's walls (L263) — mirror the same rule (L292): the fewer the doors, the smaller the surface (L293).

## 5. Real Project Usage

- **A local AI stack (L290).** The app (L173), the Postgres (L268), and the Redis (L269) on the Compose bridge (L290) — the service names (L292), the app's port published (L292).
- **A model call (L278).** The Bedrock (L278) and the external APIs (L227) through the egress (L292) — the host's NAT (L292).
- **A host-network service (L292).** The service that needs the host's network (L292) — the metrics agent (L274) — the `network: host` (L292).
- **An isolated service (L292).** The untrusted job (L292) on the `none` network (L292) — the isolation (L293).
- **Anything multi-container (L290).** The stack's streets (L292) — the ports, the networks, and the names (L292).

The through-line: **the streets are the stack's connections** — the published doors, the named bridges, and the shared exit (L292).

## 6. Interview Explanation

Say it in four moves:

1. **The ports.** "The internal — on the network; the published — to the host (L292)."
2. **The networks.** "The bridge, the host, the none (L292)."
3. **The discovery.** "The service names — `postgres:5432` (L292)."
4. **The egress.** "The outbound calls through the host's NAT (L292)."

## 7. Senior-Level Insights

- **The service name is the contract (L292).** The app reaches `postgres:5432` (L292) — the name (L292) is the stable contract (L292); the IPs (L292) change (L292).
- **The published ports are the surface (L292).** The fewer the doors (L292) — the smaller the surface (L293); the internal ports (L292) stay internal (L292).
- **The bridge is the default (L292).** The private network (L292) — the containers on it reach each other (L292) — the host network (L292) is the exception (L292).
- **The egress is the model's path (L278).** The Bedrock (L278) and the external APIs (L227) out through the NAT (L292) — the L263 VPC (L263), container-shaped (L292).
- **The networks are the isolation (L293).** The separate bridges (L292) — the untrusted services (L293) separated (L292) — the L293 threat model (L293), network-shaped (L292).

## 8. Common Mistakes

- **The localhost assumption (L292).** The app connecting to `localhost:5432` (L292) — inside the container (L292), the localhost is the container (L292); the service name (L292) is the path (L292).
- **The internal ports published (L292).** The Postgres's 5432 exposed (L292) — the surface (L293) widened (L292).
- **The IP instead of the name (L292).** The hardcoded IP (L292) — the IPs change (L292); the name (L292) is stable (L292).
- **The host network by default (L292).** The shared stack (L292) for everything (L292) — the bridge (L292) is the default (L292).
- **The egress blocked (L292).** The model calls (L278) failing (L292) — the NAT (L292) and the firewall (L263) checked (L292).

## 9. Best Practices

- **Reach by the name** (L292) — the service discovery (L292).
- **Publish the few doors** (L292) — the app's port only (L292).
- **Default to the bridge** (L292) — the private network (L292).
- **Separate the untrusted** (L292) — the networks as the isolation (L293).
- **Plan the egress** (L292) — the model (L278) and the external APIs (L227).

## 10. Interview Questions

**Q: Walk me through the container networking.**
> A: The streets (L292). The ports — the internal (on the network) and the published (to the host) (L292). The networks — the bridge (the default), the host (the shared stack), the none (the isolated) (L292). The discovery — the service names (L292). And the egress — the outbound calls through the NAT (L292).

**Q: How does the app reach the database?**
> A: By the service name (L292): on the bridge (L292), the containers resolve each other by the name (L292) — the app connects to `postgres:5432` (L292). The IPs change (L292); the names don't (L292) — the name is the stable contract (L292).

**Q: What's the difference between the published and the internal port?**
> A: The reach (L292). The internal port (L292) is the container's own port, reachable on the network (L292) — the Postgres's 5432 (L292). The published port (L292) maps the host's port to the container's (L292) — the `-p 3000:3000` (L292) — for the outside world (L292). The few published doors (L292), the small surface (L293).

**Q: How do the model calls go out?**
> A: Through the egress (L292): the container's outbound traffic (L292) goes through the host's network (L292) with the NAT (L292) — the Bedrock (L278) and the external APIs (L227) (L292). In the cloud (L263), the VPC (L263) and the NAT gateway (L263) play the same role (L292).

## 11. Follow-Up Questions

- What are the ports (L292)?
- What are the networks (L292)?
- What's the service discovery (L292)?
- What's the egress (L292)?
- Published vs internal port (L292)?

## 12. Comparison Table — The Networks

| Network (L292) | What it is (L292) | The use (L292) |
|---|---|---|
| The bridge (L292) | the private network, the default (L292) | the app + the Postgres + the Redis (L290) |
| The host (L292) | the host's stack shared (L292) | the metrics agent (L274) |
| The none (L292) | the isolated (L292) | the untrusted job (L293) |

The senior read: **the bridge is the default; the host and the none are the exceptions** (L292).

## 13. Code Example — The Streets, Declared

```yaml
# The container network (L292) — the Compose's streets (L290).
services:
  app:
    build: .
    ports:
      - "3000:3000"                # the published door (L292)
    environment:
      DATABASE_URL: postgres://app:app@postgres:5432/app   # the name (L292)
    networks:
      - app-net                    # the bridge (L292)

  postgres:
    image: pgvector/pgvector:pg16
    # no ports published — the internal only (L292)
    networks:
      - app-net

  redis:
    image: redis:7
    networks:
      - app-net

networks:
  app-net:                          # the private bridge (L292)

# THE EGRESS (L292): the model calls (L278) go out through
# the host's NAT (L292) — the same bridge in the dev (L292)
# and the production's VPC (L263).
```

```text
What the reader must SEE — the streets, declared:

  "3000:3000" published  → the only door (L292)
  postgres:5432 in the URL → the service name (L292)
  postgres has no ports  → the internal only (L292)
  networks: app-net      → the private bridge (L292)
  the egress through the NAT → the model path (L278, L292)

  The few doors, the named streets, the shared exit (L292).
```

```narrate
4-10: The app — the published port and the service-name connection string (L292).
12-15: The Postgres — no published ports, internal only (L292).
17-19: The Redis — the same bridge (L292).
21-22: The network — the private bridge declared (L292).
24-26: The egress — the outbound calls through the NAT (L292, L263).
```

> [!TIP]
> The pair that defines the container network: **the service-name URL** (the discovery, L292) and **the unpublished database** (the internal-only ports, L292). **Reach by the name, publish the few doors, share the exit — the container's streets (L292).**

## 14. Performance Notes

- **The bridge is the latency (L292).** The containers on the bridge (L292) — the sub-millisecond (L292) internal calls (L292).
- **The published port is the path (L292).** The host's port to the container's (L292) — the extra hop (L292) negligible (L292).
- **The NAT is the egress's throughput (L292).** The outbound calls (L278) — the NAT (L292) and the firewall (L263) are the egress's limits (L292).
- **The network is the isolation's cost (L292).** The separate bridges (L292) — the isolation (L293) for the few services (L292).

## 15. Debugging Scenarios

| Symptom | First check (L292) | The lever |
|---|---|---|
| The app can't reach the DB | The service name (L292) | `postgres:5432` (L292) |
| The outside can't reach the app | The published port (L292) | The `-p 3000:3000` (L292) |
| The DB is exposed | The published ports (L292) | The internal only (L292) |
| The model call fails | The egress (L292) | The NAT (L292), the firewall (L263) |
| The containers can't talk | The networks (L292) | The same bridge (L292) |

## 16. Quick Revision Notes

- The container networking = **the streets** (L292): the ports, the networks, the discovery, the egress.
- The ports: **the internal (on the network) and the published (to the host)** (L292).
- The networks: **the bridge (the default), the host, the none** (L292).
- The discovery: **the service names — `postgres:5432`** (L292).
- The egress: **the outbound calls through the NAT (L292)**.

## 17. Cheat Sheet

```text
CONTAINER NETWORKING = the container's streets

THE PORTS (L292)
  the internal — the container's ports on the network (L292)
  the published — the -p host:container, to the outside (L292)

THE NETWORKS (L292)
  the bridge — the default private network (L292)
  the host — the shared stack (L292) · the none — the isolated (L292)

THE DISCOVERY (L292)
  the DNS names — the containers reach by the name (L292)
  the app → postgres:5432 (L292) · the IPs change, the names don't (L292)

THE EGRESS (L292)
  the outbound calls — the model (L278), the APIs (L227)
  through the host's NAT (L292)

THE RULES (L292)
  the few published doors (L292) · the small surface (L293)
  the separate bridges for the untrusted (L293)

INTERVIEW, 4 MOVES
  1 ports    "the internal and the published (L292)"
  2 networks "the bridge, the host, the none (L292)"
  3 discovery "the service names (L292)"
  4 egress   "the outbound through the NAT (L292)"
```

## 18. Key Takeaways

> [!RECAP]
> - The container networking is **how the containers talk** (L292): the ports (L292), the networks (L292), the service discovery (L292), and the egress (L292)
> - **The ports** (L292): the internal — the container's own ports on the network (L292); the published — the `-p host:container` to the outside (L292)
> - **The networks** (L292): the bridge — the default private network (L292); the host — the shared stack (L292); the none — the isolated (L292)
> - **The service discovery** (L292): the DNS names — the containers reach each other by the name (L292), the app to `postgres:5432` (L292) — the IPs change, the names don't (L292)
> - **The egress** (L292): the outbound calls (L278) through the host's NAT (L292)
> - The rules (L292): the few published doors (L292), the small surface (L293) — the L263 VPC (L263) in the cloud mirrors the container's streets (L292)

## Check your understanding

Answer these without looking back.

1. What are the ports (L292)?
2. What are the networks (L292)?
3. What's the service discovery (L292)?
4. What's the egress (L292)?
5. Published vs internal port (L292)?
6. How does the app reach the database (L292)?
7. How do the model calls go out (L292)?
8. What are the container's streets (L292)?

## A Closing Note — The Streets, Named

You now hold the streets: **the ports, the networks, the discovery, and the egress — with the few doors and the named bridges.** The stack can talk — and the streets are named (L292).

Next: the container's threat model — Container Security (L293).
