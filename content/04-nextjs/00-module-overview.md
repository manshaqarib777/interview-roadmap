# Module 4 — Next.js

## Why this module comes fourth

The App Router is mostly one question: **where does this code run, and when?** Every other Next.js
interview topic — server components, caching, revalidation, server actions, middleware — is a
variation on that single question. Learn to answer it, and the rest of the module is detail.

Next.js is also the current baseline expectation for a modern frontend role. React knowledge gets
you the interview; App Router knowledge gets you the job. The module treats the framework as the
product layer on top of everything you've already built: components from Module 3, TypeScript from
Module 2, and the async mental model from Module 1.

## Module map

- **M10 · App Router (L83–L96)** — the full render and cache path.
  App Router & file routing, layouts & nested layouts, dynamic routes, server components, client
  components, the server/client boundary, data fetching, caching, revalidation & ISR/SSR/SSG, route
  handlers, server actions, middleware, cookies/headers/metadata, and env vars & deployment.

## How to study each lesson

1. **Trace one request end to end.** For every example: where does the code run (server or client),
   when does it run (build, request, or both), and what is cached and for how long?
2. **Predict before you run.** Every code block: guess the output and where it executes, *then*
   check.
3. **Do the exercise in a file, not in your head.** Run it with
   `node exercises/04-nextjs/<name>.js`.
4. **The caching lesson (L90) is the hardest.** Re-read it before the interview — it is a favourite
   senior question and the most misunderstood part of the framework.

## Prerequisites

Modules 1–3 complete. Server components assume you understand the React render model (L51) and
async JavaScript (L21–L28). If the client/server boundary feels fuzzy at the end of the module, the
fix is re-reading L86–L88, not more tutorials.

## Next

→ [Lesson 83 — App Router & File Routing](./83-app-router.md)
