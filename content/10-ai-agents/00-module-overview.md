# Module 10 — AI Agents

## Why this module comes tenth

Module 8 built the production AI app; Module 9 taught it to know your data. Both still have the same shape: the app *answers*. This module is the step to the next shape: the app *acts*. **AI agents** are loops — the model perceives, decides, calls tools, observes the result, and decides again. That loop turns "the AI that knows our data" into "the AI that does things with it": books the refund, updates the record, runs the workflow (L216).

The distinction this module is built on: a **demo** calls the model once with a tool. An **agent** is the loop — and the *discipline* around it: planning (L202), reasoning patterns (L203), bounded loops (L205), memory and state (L206–207), human gates (L208), guardrails (L209), security (L212), and observability (L213). The loop is the architecture; everything else is what keeps it safe, bounded and explainable.

## Module map

- **M21 · AI Agents (L198–216)** — the loop, made production.
  The pattern (L198–199), the loop architecture (L200), tool calling (L201), planning (L202) and reasoning (L203), tool selection (L204), termination (L205), memory and state (L206–207), human-in-the-loop (L208) and guardrails (L209), multi-agent systems (L210), failure modes (L211), security (L212) and observability (L213) — then the frameworks (L214–215) and the production synthesis with MCP (L216).

## How to study each lesson

1. **Draw the loop first (L200).** Perceive → decide → act → observe is the module's spine. Every lesson is a discipline *around* that loop — planning (L202) is how it decides, tools (L201) are how it acts, guardrails (L209) are what keeps it on track.
2. **Build an agent in phases.** Start with the bare loop (L200), add tools (L201), then a plan (L202), then a human gate (L208). The milestone is a guarded, observable loop — and each phase is a lesson.
3. **Learn the failure vocabulary (L211).** Loops, drift, tool explosions — when agents break, they break in known patterns. Learn the names, and the observability (L213) that catches them.
4. **Hold L144 and L164 in one hand.** Tool calling is the agent's engine — the tools lessons (L201, L204) build directly on Module 7's primitive (L144) and Module 8's application patterns (L164).

## Prerequisites

Module 7 (L135–157) — especially function calling (L144) and the model decision rule (L157). Module 8 (L158–173) — the production floor plan (L173) is where the agent loop lives. Module 9 (L174–197) — retrieval (L189) and memory (L167) feed the agent's context. You also need TypeScript (Module 2) for the code examples.

## Next

→ [Lesson 198 — What Agents Are](./198-what-agents-are.md)
