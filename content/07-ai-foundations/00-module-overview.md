# Module 7 — AI & LLM Foundations

## Why this module comes seventh

You already know how to build web applications. The AI half of this roadmap is not about learning
another framework — it is about learning a new *class* of system, and every decision in that class
is downstream of one fact: **a language model predicts the next token.** Cost, latency, context
limits, hallucination, tool calling, embeddings — all of it is consequence of that single fact.

This module is where you stop treating the model as a magic box and start treating it as a
component with known properties: a context budget, a sampling knob, a failure surface, and a price
tag. The rest of the roadmap — RAG, agents, security, system design — assumes you can already do
exactly that. If you can't explain why temperature is a sampling parameter and not "creativity",
every later module will feel hollow.

## Module map

- **M18 · AI & LLM Foundations (L135–157)** — the model as a component.
  What an LLM is, the transformer & attention, tokens, context windows, sampling, capabilities,
  limitations, prompt engineering, structured outputs, function calling, streaming, multimodal,
  embeddings — then the architect's view: model selection, token budgeting, cost, latency, and a
  comparison of OpenAI, Anthropic and Gemini as the three providers you'll actually choose between.

## How to study each lesson

1. **Say the mechanism, not the marketing.** "Temperature is a sampling parameter" beats
   "temperature controls creativity" in every interview. Every lesson here is mechanism-first.
2. **Do the math by hand.** Tokens per request, cost per million, latency per streamed token —
   estimate before you check, the way you estimated N+1 queries in the backend module.
3. **Write the API calls yourself.** Each provider lesson has a working snippet — run it with a
   real key so the shape of the request is muscle memory, not reading.
4. **Say the "why" out loud.** The decision rule at the end (L157) is the milestone test: can you
   classify any model request — task, budget, latency, reliability — and pick a model, a provider
   and a token budget without notes?

## Prerequisites

You need working JavaScript and TypeScript (Modules 1–2) and basic API familiarity from Laravel or
Next.js. No machine-learning background is assumed — and none is needed. The transformer lesson
(L136) gives you enough mechanism to explain attention; it does not ask you to implement one.

## Next

→ [Lesson 135 — What an LLM Is](./135-what-is-an-llm.md)
