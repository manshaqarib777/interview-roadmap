# Lesson 290 — Docker Compose

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you run the multi-service stack locally?" — the answer is *Docker Compose*: the services, the networks, and the volumes — the local AI stack (L290).**

L288 defined the unit and L289 the recipe; this lesson is **how the units run together**: Docker Compose — the local multi-service stack: the services (the containers, L290), the networks (the service discovery, L292), and the volumes (the persistence, L290). The AI stack's shape (L290): the app (L173), the Postgres (L268), and the Redis (L269) in the Compose file (L290) — the local dev matches the production shape (L287). This lesson is the local AI stack (L290).

The distinction this lesson is built on: a **demo** runs the database by hand. A **solutions architect** declares the stack (L290): the services (L290), the networks (L292), and the volumes (L290) — because the L307 pipeline (L307) ships what the Compose (L290) rehearsed (L290).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the services: the containers in the stack (L290)
- Explain the networks: the service discovery (L292)
- Explain the volumes: the persistence (L290)
- Explain the environment: the dev and the prod parity (L290)
- Explain the AI shape: the local AI stack (L290)

## 1. One-Line Definition

**Docker Compose is the local multi-service stack (L290) — the services (the containers: the app L173, the Postgres L268, the Redis L269, L290), the networks (the service discovery: the app reaches the postgres by its service name, L292), and the volumes (the persistence: the database's data survives the container's restart, L290) — the dev stack that matches the production shape (L287, L290).**

The one-sentence interview answer: *"Docker Compose runs the multi-service stack locally (L290). The file (L290) declares the services (L290): the app — built from its Dockerfile (L289); the Postgres (L268) — the official image; the Redis (L269) — the official image (L290). The networks (L292): the services join the Compose network (L290) and reach each other by the service name (L292) — the app connects to `postgres:5432`, not an IP (L292). The volumes (L290): the Postgres's data directory (L290) is mounted to a named volume (L290) — the data survives the container's restart and the `docker compose down` (L290). The environment (L290): the Compose file sets the env vars (L300) — the dev values (L290); the secrets (L301) come from the env or the files, never the repo (L301). The AI shape (L290): the app (L173), the Postgres + pgvector (L268, L183), and the Redis (L269) — the local stack matches the production shape (L287) — the model calls (L278) against the real services (L290), not the mocks (L290)."*

## 2. Mental Model

Think of Docker Compose as **the neighborhood's startup checklist.** The checklist (the Compose file, L290) lists the shops (the services, L290): the bakery (the app, L173), the storage depot (the Postgres, L268), and the express counter (the Redis, L269). The checklist also defines the streets (the network, L292): the bakery finds the depot at "depot-street" (the service name, L292), not by a changing address (L292). And the depot's vault (the volume, L290): the records (the data, L290) are kept in the vault (L290) even when the depot's staff changes (the container restarts, L290). One command (L290) — `docker compose up` — opens all the shops (L290), and one command — `docker compose down` — closes them (L290). The neighborhood works because the checklist is complete, the streets are named, and the vaults persist (L290).

```text
   the checklist (the Compose file, L290)
   ┌────────────────────────────────────────────────────────┐
   │ the shops (the services, L290) — the app (L173), the   │
   │ Postgres (L268), the Redis (L269)                      │
   │ the streets (the network, L292) — the service names    │
   │ (L292)                                                 │
   │ the vaults (the volumes, L290) — the persistence (L290)│
   └────────────────────────────────────────────────────────┘
```

The mental model is **the checklist**: the shops, the streets, and the vaults (L290).

## 3. Visual Flow — One Stack Up

```text
   docker compose up (L290)
        │
        ▼
   ┌────────────────────── THE STACK (L290) ────────────────────────────┐
   │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐             │
   │  │ the app     │──►│ the postgres│   │ the redis   │             │
   │  │ (L173)      │   │ (L268)      │   │ (L269)      │             │
   │  │ :3000       │   │ :5432       │   │ :6379       │             │
   │  └─────────────┘   └─────────────┘   └─────────────┘             │
   │  the network (L292): the app → postgres:5432 (L292)              │
   │  the volume (L290): postgres:/var/lib/postgresql/data (L290)     │
   └──────────────────────────────────────────────────────────────────┘
      THE DEV (L290) — the same shape as the production (L287)
```

The flow is the stack: **one command → the services up, networked, persisted** (L290).

## 4. How It Works — The Stack, Part by Part

- **The services (L290).** The containers in the stack (L290): the app (L173) — built from its Dockerfile (L289); the Postgres (L268) and the Redis (L269) — the official images (L290). Each service declares its image, its ports, and its env (L290).
- **The networks (L292).** The service discovery (L292): the services join the Compose network (L290) and reach each other by the service name (L292) — the app connects to `postgres:5432` (L292). The ports (L290): only the app's 3000 is published to the host (L290); the internal ports stay internal (L292).
- **The volumes (L290).** The persistence (L290): the named volumes (L290) hold the data (L290) — the Postgres's data directory (L290) survives the container's restart (L290). The bind mounts (L290) — the code directory (L290) — give the live reload in the dev (L290).
- **The environment (L290).** The env vars (L300): the dev values (L290) in the Compose file (L290); the secrets (L301) from the env or the files (L301) — never the repo (L301).

> [!NOTE]
> **The dev-prod parity is the Compose's point (L290).** The senior answer runs the same shape locally as in production (L290): the app (L173), the Postgres (L268), and the Redis (L269) locally (L290) — the same services the ECS (L295) runs (L287). The parity (L290) catches the integration bugs (L290) before the deploy (L307) — the "works in the dev, breaks in the prod" (L290) reduced (L290). The one gap (L290): the model (L278) — the real Bedrock call (L278) vs the mock (L290) — is the developer's choice (L290).

## 5. Real Project Usage

- **A local AI stack (L290).** The app (L173), the Postgres + pgvector (L268, L183), and the Redis (L269) in the Compose file (L290) — the dev matches the production (L287).
- **A RAG dev (L280).** The pgvector (L183) locally (L290) — the retrieval (L189) tested against the real index (L290).
- **A worker dev (L249).** The SQS (L270) — or the local alternative (L290) — with the worker (L249) in the stack (L290).
- **A CI service (L296).** The Compose (L290) spinning up the Postgres (L268) and the Redis (L269) for the tests (L296) — the CI's services (L290).
- **Anything multi-service (L290).** The stack declared (L290) — one command up, one command down (L290).

The through-line: **the stack is the production's rehearsal** — the services, the network, and the volumes declared (L290).

## 6. Interview Explanation

Say it in four moves:

1. **The services.** "The containers in the stack — the app, the Postgres, the Redis (L290)."
2. **The networks.** "The service discovery — the app reaches `postgres:5432` (L292)."
3. **The volumes.** "The persistence — the data survives the restart (L290)."
4. **The parity.** "The dev matches the production shape (L287)."

## 7. Senior-Level Insights

- **The parity is the point (L290).** The same shape locally as in production (L290) — the integration bugs (L290) caught before the deploy (L307).
- **The service name is the contract (L292).** The app reaches `postgres:5432` (L292) — the service name (L292) is the internal DNS (L292) — the L292 networking (L292), Compose-shaped (L290).
- **The volume is the data's home (L290).** The named volumes (L290) — the data (L290) survives the container's restart (L290) — the local persistence (L290).
- **The secrets stay out (L301).** The dev values (L290) in the Compose (L290), the secrets (L301) from the env (L301) — the L301 rule (L301), Compose-shaped (L290).
- **The Compose is the CI's services (L296).** The test services (L296) declared in the Compose (L290) — the CI (L296) spins them up (L290).

## 8. Common Mistakes

- **The secrets in the Compose (L301).** The keys in the file (L301) — the L301 rule (L301) — the env or the files (L290).
- **The internal ports published (L292).** The Postgres's 5432 exposed to the host (L292) — the internal ports (L292) stay internal (L290).
- **The state without the volume (L290).** The Postgres's data in the container (L290) — the restart loses it (L290); the named volume (L290) is the fix (L290).
- **The IP instead of the name (L292).** The app connecting to an IP (L292) — the service name (L292) is the discovery (L290).
- **The mock-everything dev (L290).** The mocks instead of the real services (L290) — the parity (L290) lost, the integration bugs (L290) deferred (L290).

## 9. Best Practices

- **Declare the whole stack** (L290) — the app (L173), the Postgres (L268), the Redis (L269).
- **Reach by the service name** (L292) — the discovery (L292).
- **Persist with the named volumes** (L290) — the data survives (L290).
- **Keep the secrets out** (L301) — the env or the files (L290).
- **Match the production shape** (L287) — the parity (L290).

## 10. Interview Questions

**Q: Walk me through Docker Compose.**
> A: The local multi-service stack (L290). The services — the containers: the app (L173), the Postgres (L268), the Redis (L269) (L290). The networks — the service discovery by the service name (L292). The volumes — the persistence (L290). And the parity — the dev matches the production shape (L287).

**Q: How does the app find the database?**
> A: By the service name (L292): the Compose network (L290) gives each service a DNS name (L292) — the app connects to `postgres:5432` (L292), not an IP (L292). The internal ports (L292) stay internal; only the app's 3000 is published to the host (L290).

**Q: How does the data persist?**
> A: The named volumes (L290): the Postgres's data directory (L290) is mounted to a volume (L290) — the data survives the container's restart and the `docker compose down` (L290). The code (L290) uses a bind mount (L290) for the live reload (L290).

**Q: How do you handle the secrets locally?**
> A: The L301 rule (L301): the dev values (L290) in the Compose file (L290) — the database name, the user (L290); the secrets (L301) — the API keys (L275) — from the env or the files (L301), never committed (L301).

## 11. Follow-Up Questions

- What are the services (L290)?
- What's the network (L292)?
- What's a volume (L290)?
- What's the dev-prod parity (L290)?
- How do you handle the secrets (L301)?

## 12. Comparison Table — The Compose Stack vs the Production

| | The Compose stack (L290) | The production (L287) |
|---|---|---|
| The app (L173) | the container (L290) | the ECS service (L295) |
| The database (L268) | the Postgres container (L290) | the RDS (L268) |
| The cache (L269) | the Redis container (L290) | the ElastiCache (L269) |
| The model (L278) | the mock or the real call (L290) | the Bedrock (L278) |
| The shape (L290) | the same services (L290) | the managed versions (L287) |

The senior read: **the left column rehearses the right** — the same services, the managed versions (L290).

## 13. Code Example — The Stack, Declared

```yaml
# The local AI stack (L290) — the Compose file (L290).
services:
  # THE APP (L173) — built from its recipe (L289).
  app:
    build: .
    ports:
      - "3000:3000"                  # the published port (L290)
    environment:
      DATABASE_URL: postgres://app:app@postgres:5432/app   # the service name (L292)
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  # THE DATABASE (L268) — the Postgres with the pgvector (L183).
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data     # the named volume (L290)

  # THE CACHE (L269) — the Redis (L269).
  redis:
    image: redis:7

volumes:
  pgdata:                                # the persistence (L290)
```

```text
What the reader must SEE — the stack, declared:

  app: build + 3000         → the app (L173, L290)
  postgres:5432 in the URL  → the service discovery (L292)
  pgvector image            → the vector store (L183, L290)
  pgdata volume             → the persistence (L290)
  redis:7                   → the cache (L269, L290)

  One command up — the production's rehearsal (L290).
```

```narrate
4-10: The app — built from its Dockerfile, its port published, the database URL using the service name (L289, L292).
12-15: The database — the pgvector Postgres with the env (L183, L268).
17-19: The cache — the Redis image (L269).
21-22: The volume — the named persistence (L290).
```

> [!TIP]
> The pair that defines the Compose: **the service name in the connection string** (the discovery, L292) and **the named volume** (the persistence, L290). **Declare the services, reach by the name, persist the data — the production's rehearsal (L290).**

## 14. Performance Notes

- **The stack is the dev's speed (L290).** One command up (L290) — the whole environment (L290) ready in seconds (L290).
- **The volume is the I/O (L290).** The named volume (L290) — the database's I/O (L268) faster than the container's layer (L290).
- **The parity is the debug's speed (L290).** The local stack (L290) matches the production (L287) — the bugs (L290) found in the dev (L290), not the prod (L307).
- **The model is the dev's cost (L290).** The real Bedrock calls (L278) in the dev (L290) — the mock (L290) for the free path (L290).

## 15. Debugging Scenarios

| Symptom | First check (L290) | The lever |
|---|---|---|
| The app can't reach the DB | The service name (L292) | `postgres:5432` (L292) |
| The data is lost on restart | The volume (L290) | The named volume (L290) |
| The port is in use | The published ports (L290) | The host port mapping (L290) |
| The secret is in the repo | The Compose (L301) | The env or the files (L301) |
| The dev works, the prod breaks | The parity (L290) | The same services locally (L290) |

## 16. Quick Revision Notes

- Docker Compose = **the local multi-service stack** (L290): the services, the networks, the volumes.
- The services: **the app (L173), the Postgres (L268), the Redis (L269)** (L290).
- The networks: **the service discovery — `postgres:5432`** (L292).
- The volumes: **the named persistence** (L290).
- The parity: **the dev matches the production shape (L287)**.

## 17. Cheat Sheet

```text
DOCKER COMPOSE = the local multi-service stack

THE SERVICES (L290)
  the app (L173) — built from its recipe (L289)
  the Postgres (L268) · the Redis (L269) — the official images (L290)

THE NETWORKS (L292)
  the service discovery — the service name = the DNS (L292)
  the app → postgres:5432 (L292) · the internal ports internal (L292)

THE VOLUMES (L290)
  the named volumes — the data survives the restart (L290)
  the bind mounts — the code's live reload (L290)

THE ENVIRONMENT (L290)
  the dev values in the Compose (L290)
  the secrets from the env or the files (L301) — never the repo (L301)

THE PARITY (L290)
  the dev matches the production shape (L287)
  the integration bugs caught before the deploy (L307)

INTERVIEW, 4 MOVES
  1 services "the app, the Postgres, the Redis (L290)"
  2 networks "the service names — postgres:5432 (L292)"
  3 volumes  "the named persistence (L290)"
  4 parity   "the dev matches the production (L287)"
```

## 18. Key Takeaways

> [!RECAP]
> - Docker Compose is **the local multi-service stack** (L290): the services (L290), the networks (L292), and the volumes (L290)
> - **The services** (L290) are the containers in the stack — the app (L173) built from its Dockerfile (L289), the Postgres (L268) and the Redis (L269) from the official images (L290)
> - **The networks** (L292) are the service discovery — the app reaches `postgres:5432` by the service name (L292), not an IP (L292)
> - **The volumes** (L290) are the persistence — the named volumes (L290) survive the container's restart (L290)
> - **The environment** (L290): the dev values in the Compose (L290), the secrets (L301) from the env or the files (L301) — never the repo (L301)
> - The point is **the dev-prod parity** (L290): the same services locally (L290) as the production (L287) — the integration bugs (L290) caught before the deploy (L307)

## Check your understanding

Answer these without looking back.

1. What are the services (L290)?
2. What's the network (L292)?
3. What's a volume (L290)?
4. What's the dev-prod parity (L290)?
5. How do you handle the secrets (L301)?
6. How does the app find the database (L292)?
7. How does the data persist (L290)?
8. What is the local AI stack (L290)?

## A Closing Note — The Checklist, Complete

You now hold the local stack: **the services, the networks, and the volumes — with the parity as the point.** The production has its rehearsal — and the checklist is complete (L290).

Next: the image-slimming move — Multi-Stage Builds (L291).
