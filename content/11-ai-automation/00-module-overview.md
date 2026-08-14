# Module 11 — AI Automation

## Why this module comes eleventh

Module 10 built the loop — the agent that perceives, decides, and acts. This module is the loop put to **work**: AI automation — wiring the agent's power into the business. The automation unit is the **workflow** (L217): a pipeline of AI steps with human checkpoints, triggered by events (L220) and schedules (L221), run on queues (L222), touching the CRM (L223), the inbox (L224), the channels (L225), the database (L226), and the world's APIs (L227). The discipline is the same one from Module 10 — human approval (L228), bounded loops (L231), and failure recovery (L232) — now applied to *business processes* (L229).

The distinction this module is built on: a **demo** has a script that sends an email. An **automation architect** has a platform: events in (L220), workflows (L217), queues (L222), approval gates (L228), and a recovery story (L232) — the L230 shape that every tool (n8n, L218; Make, L219) and every integration (L223–227) plugs into.

## Module map

- **M22 · AI Automation (L217–232)** — the loop, wired into the business.
  The workflow unit (L217) and the tools (L218–219), the triggers (L220–221) and the queues (L222), the integrations (L223–227), the approval gate (L228) and the business mapping (L229) — then the platform shape (L230), multi-agent automation (L231), and the failure-and-recovery story (L232).

## How to study each lesson

1. **Learn the workflow shape first (L217).** The pipeline of steps with human checkpoints is the module's unit. Every later lesson is a trigger, an integration, or a discipline around that shape.
2. **Follow a process end to end.** Pick one business process — "a support ticket that needs a refund" — and trace it through the module: triggered by an event (L220), run on a queue (L222), touching the CRM (L223), gated by approval (L228), recovered on failure (L232). The module is one process, taught piece by piece.
3. **Apply the Module 10 discipline.** The workflow is the L199 hybrid (workflow skeleton + agentic forks); approval gates are the L208 HITL; failure recovery is the L211 taxonomy applied to automation. This module is Module 10's business layer.
4. **Learn the tool vocabulary (L218–219).** n8n and Make are the platforms where this is built — know what they do, and when a custom build beats them (L230).

## Prerequisites

Module 10 (L198–216) — the agent loop (L200), HITL (L208), and the failure taxonomy (L211) are assumed. Module 9 (L174–197) — retrieval feeds the workflows' AI steps. You also need a working sense of webhooks, cron, and queues from general engineering (Modules 6 and 12 touch them).

## Next

→ [Lesson 217 — AI Workflows](./217-ai-workflows.md)
