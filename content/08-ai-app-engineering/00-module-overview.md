# Module 8 — AI Application Engineering

## Why this module comes eighth

Module 7 gave you the model and the decision rule: *classify → budget → select → verify*. This module is the step between "I can call an API" and "I ship an AI product". Every production LLM application — a chat, a copilot, an agent UI, an extraction pipeline — shares the same engineering layer: the **streaming UI**, the **tool loop**, the **state model**, the **conversation shape**, **memory**, and the **resilience stack** (retries, rate limiting, caching). That layer is what this module teaches.

The distinction this module is built on: a **demo** calls an API and renders the text. A **product** streams tokens with cancellation, runs tool calls in a visible loop, keeps conversation state that survives a refresh, budgets tokens per request, retries with backoff, and caches the expensive calls. Module 7 gave you the decision rule; this module gives you the *system* that the decision runs inside.

## Module map

- **M19 · AI Application Engineering (L158–173)** — the production layer.
  Architecture and integration patterns (L158–159), the Vercel AI SDK (L160) and its patterns (L161), streaming UI (L162), structured generation in apps (L163), tool calling in the UI loop (L164), application state (L165), conversation management (L166), memory (L167), error handling (L168), retries (L169), rate limiting (L170), caching (L171), API security fundamentals (L172) — then a synthesis (L173) that puts it all together in one architecture.

## How to study each lesson

1. **Build the demo, then break it.** Each lesson's code example is runnable. Run it, then break it — kill the provider mid-stream, send malformed JSON, double-submit a tool call — and watch the lesson's pattern catch it. The failure handling is the lesson.
2. **Say the state model out loud.** Streaming UI, tool loops, and conversation management are all *state machines* (L161, L165). If you can draw the states and transitions for a chat, you can build any AI UI.
3. **Do the resilience arithmetic.** Retries (L169), rate limits (L170), and caching (L171) are numbers: backoff schedules, TPM/RPM budgets, cache-hit rates. Estimate before you check, the way you estimated token costs in Module 7.
4. **Hold L157 in one hand.** The model decision rule from Module 7 decides *which* model; this module decides *how* the app calls it, streams it, and survives it. The two compose — the rule picks the engine, this module builds the car.

## Prerequisites

Module 7 (L135–157) — the model decision rule is assumed. You also need working React/Next.js (Modules 3–4) and TypeScript (Module 2): every example here is a real UI pattern, not pseudocode. No provider-specific knowledge beyond L152–L154 is assumed — the SDK (L160) abstracts the dialects, which is the point.

## Next

→ [Lesson 158 — AI Application Architecture](./158-ai-app-architecture.md)
