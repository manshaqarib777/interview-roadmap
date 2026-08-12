# Module 6 — Laravel

## Why this module comes last

Everything before this module was the front half of the stack. This is the back half. If you're
interviewing for full-stack or backend roles, Laravel is where the senior questions actually live:
the request lifecycle, the service container, Eloquent, queues, and the scenario questions that
separate "knows the syntax" from "can be handed a production system".

The module is built the same way as the frontend ones — one concept per file, each revisable in
under ten minutes, with prediction-first code blocks and a matching exercise. But Laravel code can't
run in the reader's browser worker (no PHP runtime), so the runnable part of every lesson lives in
the exercise files: plain-Node prediction drills that model the same logic — queues, transactions,
caching, rate limiting — so you still get the predict-then-run loop.

## Module map

- **M13 · Laravel Fundamentals (L105–L110)** — how the framework is put together.
  What Laravel is, the request lifecycle, application structure & bootstrapping, the service
  container & DI, service providers, facades & contracts.
- **M14 · Routing & Request Handling (L111–L114)** — the map from URL to response.
  Routing, middleware, controllers/requests/responses, Blade.
- **M15 · Eloquent & the Database (L115–L121)** — where the data lives.
  Eloquent, relationships, eager loading & N+1, query optimization & the query builder, migrations &
  seeders, transactions & concurrency, validation & form requests.
- **M16 · Auth, Queues & Async (L122–L129)** — identity, work, and waiting.
  Authentication, authorization, queues & jobs, events/listeners/observers, notifications/mail/
  scheduling, caching & Redis, security, testing.
- **M17 · Senior & Full-Stack (L130–L134)** — the round that decides the offer.
  Service layer/Repositories/SOLID, performance & deployment, Laravel + React/Inertia, Laravel API +
  Next.js & payments, multi-tenancy & system design.

## How to study each lesson

1. **Trace the path.** For every lesson, ask the same three questions: where does this code run,
   when does it run, and what does it touch? The request lifecycle is the map — everything else is a
   stop on it.
2. **Predict before you run.** Every code block: guess the output or behaviour, *then* check against
   the exercise file.
3. **Do the exercise in a file, not in your head.** Run it with
   `node exercises/06-laravel/<name>.js`.
4. **Say the scenario answers out loud.** The senior lessons (L120, L128, L131, L134) are graded on
   process, not recall — rehearse the "I'd measure, then…" shape until it's automatic.

## Prerequisites

Modules 1–5. Eloquent and Blade assume you understand the frontend modules (L48 composition, L86
server components for the Inertia lesson), and the async mental model from Module 1 carries straight
over to queues. If you're here for backend interviews only, the frontend modules still matter — the
Inertia and API lessons build directly on them.

## Next

→ [Lesson 105 — What is Laravel?](./105-what-is-laravel.md)
