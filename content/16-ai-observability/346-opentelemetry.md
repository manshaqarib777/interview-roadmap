# Lesson 346 — OpenTelemetry for AI (Synthesis)

**Interview importance:** ⭐⭐⭐⭐⭐ — the capstone of AI Observability: one tracing standard across your AI stack — plus the OTel AI conventions (L346).**

This is the last lesson of the AI Observability module — and the synthesis it was built toward. L328–L345 gave you the parts: the frame (L328), the logging (L329), the tracing (L330), the metrics (L331), the tokens (L332), the latency (L333), the cost (L334), the model performance (L335), the hallucination (L336), the groundedness (L337), the retrieval (L338), the tools (L339), the agent (L340), the regression suite (L341), the datasets (L342), the judge (L343), and the platforms (L344–345). This lesson **reassembles them into one tracing standard across the AI stack** — plus the OTel AI conventions (L346).

The distinction this lesson is built on: a **specialist** knows the tools. A **solutions architect** unifies them (L346) — one standard (L346) across the stack (L346), with the AI's conventions (L346). That assembly is M27's milestone: detecting the regressions and grounding the eval dataset in CI (L346).

## Learning Objectives

By the end of this lesson you should be able to:

- Assemble L328–L345 into one observability architecture
- Explain the OTel: the spans, the metrics, the logs, one standard (L346)
- Explain the AI conventions: the gen_ai spans and the attributes (L346)
- Explain the eval suite: the datasets and the gates in the CI (L346)
- Defend the architecture in an interview: the layers, the standard, the gates (L346)

## 1. One-Line Definition

**The OpenTelemetry for AI is the module's synthesis — one tracing standard across the AI stack (L346): the OTel (the spans L330, the metrics L331, and the logs L329 under one standard L346), the AI conventions (the `gen_ai` spans and the attributes: the model L148, the tokens L332, the cost L334, L346), and the eval suite (the datasets L342 and the gates L341 in the CI L296, L346) — the L328 frame (L328), standardized (L346).**

The one-sentence interview answer: *"The OpenTelemetry for AI is the module in one standard (L346). The OTel (L346): the open standard (L346) — the spans (L330), the metrics (L331), and the logs (L329) under one API (L346) — the SDK (L346) instruments the app (L346), the exporter (L346) ships to the backend (L346): the Jaeger (L346), the Langfuse (L345), the CloudWatch (L274). The AI conventions (L346): the `gen_ai` spans (L346) — the `gen_ai.operation.name` (L346), the `gen_ai.request.model` (L148), the `gen_ai.usage.input_tokens` (L332) and the `gen_ai.usage.output_tokens` (L332) — the standard attributes (L346) the tools (L344–345) read (L346). The eval suite (L346): the datasets (L342) — the golden and the adversarial (L342); and the gates (L341) — the scores (L343) in the CI (L296) — the regression (L341) failing the build (L296). The AI shape (L173): the stack (L346) — the gateway (L267), the retrieval (L189), the tools (L315), and the model (L278) — traced (L330) under the one standard (L346), the tokens (L332) and the cost (L334) attributed (L334), and the evals (L341) gating the deploy (L307) — the L328 frame (L328), standardized (L346)."*

## 2. Mental Model

Think of the OpenTelemetry as **the national rail network.** The network (the OTel, L346) is the one standard (L346): the tracks (the spans, L330) — the trains (the requests, L328) run on them (L346); the stations (the services, L260) — the gateway (L267), the retrieval (L189), the tools (L315), the model (L278) — connected by the one gauge (the standard, L346). The ticketing (the AI conventions, L346): the standard tickets (the `gen_ai` attributes, L346) — the route (the model, L148), the seats (the tokens, L332), the fare (the cost, L334) — readable by every inspector (the tools, L344–345). And the control (the eval suite, L346): the schedules (the datasets, L342) and the inspections (the gates, L341) — the train (the deploy, L307) doesn't leave without the inspection (L346). The nation works because the tracks are standard, the tickets are standard, and the inspections gate the departures (L346).

```text
   the rail network (the OTel, L346)
   ┌────────────────────────────────────────────────────────┐
   │ the tracks (the spans, L330) · the stations (the       │
   │ services, L260) — the one gauge (the standard, L346)   │
   │ the tickets (the gen_ai conventions, L346) · the       │
   │ inspections (the eval gates, L341)                     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the rail network**: the tracks, the tickets, and the inspections (L346).

## 3. Visual Flow — The Whole Architecture, One Diagram

```text
   the app (L173)
        │  the OTel SDK (L346)
        ▼
   ┌────────────────────── THE SPANS (L330, L346) ──────────────────────┐
   │  the gateway (L267) → the retrieval (L189) → the tools (L315)     │
   │  → the model (L278) — the gen_ai spans (L346)                     │
   │  the attributes: the model (L148), the tokens (L332), the cost    │
   │  (L334) — the conventions (L346)                                  │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EXPORTER (L346) ─────────────────────────┐
   │  the backend (L346): the Jaeger (L346), the Langfuse (L345),      │
   │  the CloudWatch (L274)                                            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EVAL SUITE (L341) ───────────────────────┐
   │  the datasets (L342): the golden and the adversarial (L342)       │
   │  the gates (L341): the groundedness (L337), the retrieval (L338), │
   │  the agent (L340) — in the CI (L296)                              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the module in one diagram: **spans → exporter → eval suite** (L346).

## 4. How It Works — The Assembly, Part by Part

- **The OTel (L346).** The open standard (L346): the spans (L330), the metrics (L331), and the logs (L329) under one API (L346) — the SDK (L346) and the exporter (L346).
- **The AI conventions (L346).** The `gen_ai` spans (L346): the `gen_ai.operation.name` (L346), the `gen_ai.request.model` (L148), the `gen_ai.usage.input_tokens` (L332) and the `gen_ai.usage.output_tokens` (L332).
- **The eval suite (L341).** The datasets (L342) — the golden and the adversarial (L342); and the gates (L341) — the scores (L343) in the CI (L296).
- **The platforms (L344–345).** The LangSmith (L344) and the Langfuse (L345) — the OTel-compatible (L346) backends (L346).

> [!NOTE]
> **The assembly rule: the one standard, the AI's conventions, and the gates (L346).** The senior answer assembles (L346): the OTel (L346) — the one standard (L346) for the spans (L330), the metrics (L331), and the logs (L329) — replaces the bespoke instrumentation (L346); the `gen_ai` conventions (L346) — the standard attributes (L346) for the model (L148), the tokens (L332), and the cost (L334) — make the traces (L330) readable by the platforms (L344–345) and the audits (L322); and the eval suite (L341) — the datasets (L342) and the gates (L341) — closes the loop (L346): the observability (L328) tells what happened, the evals (L341) tell whether it's good, and the CI (L296) gates the change (L346).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The OTel (L346) — the one standard (L346) across the stack (L346), the evals (L341) in the CI (L296).
- **A RAG platform (L280).** The retrieval (L189) and the model (L278) spans (L346) — the groundedness (L337) evals (L341).
- **An agent product (L279).** The tool (L315) and the model (L278) spans (L346) — the agent eval (L340) gating (L341).
- **A regulated workload (L371).** The OTel (L346) — the standard attributes (L346) — the audit (L322) reading (L346).
- **Anything AI (L328).** The module's synthesis (L346) — the one standard, the conventions, the gates (L346).

The through-line: **the standard is the module's output** — one tracing standard across the stack, with the evals gating (L346).

## 6. Interview Explanation

Say it in four moves:

1. **The standard.** "The OTel — the spans, the metrics, the logs under one API (L346)."
2. **The conventions.** "The `gen_ai` spans — the model, the tokens, the cost (L346)."
3. **The exporter.** "The one standard to the backends (L346)."
4. **The gates.** "The eval suite (L341) in the CI (L296)."

## 7. Senior-Level Insights

- **The one standard is the portability (L346).** The OTel (L346) — the instrumented app (L346) ships to any backend (L346) — the vendor lock-in (L377) avoided (L346).
- **The conventions are the shared language (L346).** The `gen_ai` attributes (L346) — the model (L148), the tokens (L332), the cost (L334) — the platforms (L344–345) and the audits (L322) read the same (L346).
- **The eval suite is the quality's gate (L341).** The datasets (L342) and the scores (L343) — the regression (L341) in the CI (L296) — the M27 milestone (L346): the evals grounded in CI (L346).
- **The exporter is the backends' door (L346).** The Jaeger (L346), the Langfuse (L345), the CloudWatch (L274) — the one SDK (L346), the many backends (L346).
- **The cost is the standard's record (L334).** The `gen_ai.usage` (L332) — the L334 attribution (L334), standard-shaped (L346).

## 8. Common Mistakes

- **The bespoke instrumentation (L346).** The custom spans (L330) per service (L346) — the one standard (L346) is the fix (L346).
- **The non-standard attributes (L346).** The custom keys (L346) — the platforms (L344–345) and the audits (L322) can't read (L346) — the `gen_ai` conventions (L346) are the fix (L346).
- **The exporter lock-in (L346).** The backend's SDK (L346) — the OTel (L346) is the portability (L346).
- **The eval-less observability (L346).** The traces (L330) without the gates (L341) — the what (L328) without the whether (L341).
- **The gate-less deploy (L341).** The change (L365) un-gated (L341) — the regression (L335) ships (L346).

## 9. Best Practices

- **Standardize the tracing** (L346) — the OTel (L346) across the stack (L346).
- **Use the conventions** (L346) — the `gen_ai` attributes (L346).
- **Export to the backends** (L346) — the one SDK, the many (L346).
- **Ground the evals in CI** (L346) — the datasets (L342) and the gates (L341).
- **Close the loop** (L346) — the observability (L328) into the evals (L341) into the gates (L296).

## 10. Interview Questions

**Q: Walk me through the OpenTelemetry for AI.**
> A: The module in one standard (L346). The OTel — the spans (L330), the metrics (L331), the logs (L329) under one API (L346). The AI conventions — the `gen_ai` spans: the model (L148), the tokens (L332), the cost (L334). The exporter — the one standard to the backends (L346). And the eval suite — the datasets (L342) and the gates (L341) in the CI (L296).

**Q: What are the AI conventions?**
> A: The standard attributes (L346): the `gen_ai.operation.name` (L346), the `gen_ai.request.model` (L148), the `gen_ai.usage.input_tokens` (L332) and the `gen_ai.usage.output_tokens` (L332), and the `gen_ai.response.completion` (L346). The conventions (L346) make the traces (L330) readable by the platforms (L344–345) and the audits (L322).

**Q: Why the one standard?**
> A: The portability (L346): the OTel (L346) — the instrumented app (L346) exports to any backend (L346) — the Jaeger (L346), the Langfuse (L345), the CloudWatch (L274) — without the re-instrumentation (L346). The vendor lock-in (L377) avoided (L346); the stack (L346) observed (L346).

**Q: What's M27's milestone?**
> A: The regressions detected and the eval dataset grounded in CI (L346): the observability (L328) — the five signals (L328) under the one standard (L346); and the evals (L341) — the datasets (L342) and the scores (L343) in the CI (L296) — the regression (L341) failing the build (L296). The module (L346): the what (L328), the whether (L341), and the gate (L296).

## 11. Follow-Up Questions

- What's the OTel (L346)?
- What are the AI conventions (L346)?
- Why the one standard (L346)?
- What's the exporter (L346)?
- What's M27's milestone (L346)?

## 12. Comparison Table — The Bespoke vs the Standard

| | The bespoke (L346) | The OTel (L346) |
|---|---|---|
| The spans (L330) | the custom per service (L346) | the standard (L346) |
| The attributes (L346) | the custom keys (L346) | the `gen_ai` conventions (L346) |
| The backends (L346) | the locked (L346) | the exporter (L346) |
| The tools (L344–345) | the unreadable (L346) | the compatible (L346) |
| The audits (L322) | the unreadable (L346) | the readable (L346) |

The senior read: **the right column is the standard** — the portability and the shared language (L346).

## 13. Code Example — The Assembly in One Shape

```python
# The OpenTelemetry (L346) — the one standard (L346).
# 1 · THE SDK (L346) — the instrumentation (L346).
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    SpanProcessor(OTLPSpanExporter(endpoint="http://collector:4317"))  # L346
)

# 2 · THE GEN_AI SPAN (L346) — the conventions (L346).
tracer = trace.get_tracer("ai-app")

def chat(question: str):
    with tracer.start_as_current_span("chat.completion") as span:    # L346
        span.set_attribute("gen_ai.operation.name", "chat")          # L346
        span.set_attribute("gen_ai.request.model", "gpt-4o-mini")    # L148
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": question}],
        )
        span.set_attribute("gen_ai.usage.input_tokens",
                           response.usage.prompt_tokens)             # L332
        span.set_attribute("gen_ai.usage.output_tokens",
                           response.usage.completion_tokens)         # L332
        return response.choices[0].message.content

# 3 · THE METRICS AND THE LOGS (L331, L329) — under the same standard (L346).
# 4 · THE EVAL SUITE (L341) — the datasets (L342) and the gates (L296).
```

```text
What the reader must SEE — the assembly, applied:

  TracerProvider + OTLP exporter → the standard (L346)
  start_as_current_span          → the span (L330, L346)
  gen_ai.operation.name          → the convention (L346)
  gen_ai.request.model           → the model (L148)
  gen_ai.usage.*_tokens          → the tokens (L332)
  the eval suite in the CI       → the gate (L341, L296)

  The one standard, the conventions, the gates (L346).
```

```narrate
5-8: The SDK — the tracer and the OTLP exporter (L346).
10-11: The tracer — the app's instrumentation (L346).
13-24: The gen_ai span — the conventions: the operation, the model, and the tokens (L346, L148, L332).
26-28: The metrics, the logs, and the eval suite — under the same standard (L331, L329, L341).
```

> [!TIP]
> The pair that defines the synthesis: **the `gen_ai` span** (the conventions, L346) and **the eval gate in the CI** (the milestone, L341). **Standardize the spans, use the conventions, export to the backends, ground the evals in CI — the module's synthesis (L346).**

## 14. Performance Notes

- **The SDK is the request's latency (L346).** The span (L330) — the negligible (L346) overhead (L346).
- **The exporter is the pipeline's cost (L346).** The OTLP (L346) — the batched (L346) export (L346).
- **The evals are the CI's time (L341).** The datasets (L342) — the minutes (L346) per run (L341).
- **The storage is the spans' (L346).** The traces (L330) — the retention (L322) and the sampling (L330) bounded (L346).

## 15. Debugging Scenarios

| Symptom | First check (L346) | The lever |
|---|---|---|
| The span is missing | The SDK (L346) | The instrumentation (L346) |
| The backend can't read | The attributes (L346) | The `gen_ai` conventions (L346) |
| The export fails | The exporter (L346) | The OTLP endpoint (L346) |
| The regression ships | The gate (L341) | The eval suite (L341) in the CI (L296) |
| The traces are huge | The sampling (L330) | The retention (L322) |

## 16. Quick Revision Notes

- The OpenTelemetry for AI = **the module's synthesis** (L346): the OTel, the conventions, the exporter, the gates.
- The OTel: **the spans (L330), the metrics (L331), the logs (L329) under one API (L346)**.
- The conventions: **the `gen_ai` spans — the model (L148), the tokens (L332), the cost (L334)**.
- The exporter: **the one standard to the backends (L346)**.
- The gates: **the eval suite (L341) — the datasets (L342) in the CI (L296)**.

## 17. Cheat Sheet

```text
OPENTELEMETRY FOR AI = one tracing standard across the AI stack

THE OTel (L346)
  the open standard (L346)
  the spans (L330) · the metrics (L331) · the logs (L329)
  under one API (L346) — the SDK (L346), the exporter (L346)

THE AI CONVENTIONS (L346)
  the gen_ai spans (L346)
  gen_ai.operation.name (L346) · gen_ai.request.model (L148)
  gen_ai.usage.input_tokens (L332) · gen_ai.usage.output_tokens (L332)
  the standard attributes (L346) — the shared language (L346)

THE EXPORTER (L346)
  the one standard (L346) to the backends (L346)
  the Jaeger (L346) · the Langfuse (L345) · the CloudWatch (L274)

THE EVAL SUITE (L341)
  the datasets (L342) — the golden and the adversarial (L342)
  the gates (L341) — the scores (L343) in the CI (L296)
  the regression (L341) failing the build (L296)

THE MILESTONE (M27)
  the regressions detected (L335) · the eval dataset grounded in CI (L346)

INTERVIEW, 4 MOVES
  1 standard   "the spans, the metrics, the logs under one API (L346)"
  2 conventions "the gen_ai spans (L346)"
  3 exporter   "the one standard to the backends (L346)"
  4 gates      "the eval suite in the CI (L341, L296)"
```

## 18. Key Takeaways

> [!RECAP]
> - The OpenTelemetry for AI is **the module's synthesis — one tracing standard across the AI stack** (L346): the OTel (L346), the AI conventions (L346), the exporter (L346), and the eval suite (L341)
> - **The OTel** (L346): the open standard (L346) — the spans (L330), the metrics (L331), and the logs (L329) under one API (L346) — the SDK (L346) and the exporter (L346)
> - **The AI conventions** (L346): the `gen_ai` spans (L346) — the `gen_ai.operation.name` (L346), the `gen_ai.request.model` (L148), the `gen_ai.usage.input_tokens` (L332) and the `gen_ai.usage.output_tokens` (L332) — the shared language (L346)
> - **The exporter** (L346): the one standard (L346) to the backends (L346) — the Jaeger (L346), the Langfuse (L345), the CloudWatch (L274) — the portability (L346)
> - **The eval suite** (L341): the datasets (L342) — the golden and the adversarial (L342); and the gates (L341) — the scores (L343) in the CI (L296) — the regression (L341) failing the build (L296)
> - The milestone (L346): the regressions detected (L335) and the eval dataset grounded in CI (L346) — the observability (L328) tells the what, the evals (L341) tell the whether, and the CI (L296) gates the change (L346) — assemble it, standardize it, and M27 is claimed (L346)

## Check your understanding

Answer these without looking back.

1. What's the OTel (L346)?
2. What are the AI conventions (L346)?
3. Why the one standard (L346)?
4. What's the exporter (L346)?
5. What's M27's milestone (L346)?
6. What are the gen_ai attributes (L346)?
7. What's the eval gate (L341)?
8. What is the module's synthesis (L346)?

## A Closing Note — The Network, Standard

That was the last lesson of the AI Observability module — and the one you'll *measure with*. L328–L345 gave you the parts; this lesson gave you the floor plan: **one tracing standard across the stack, the `gen_ai` conventions, and the eval suite gating the CI.** When you can draw it, standardize it, and defend it — naming the five signals (L328), the `gen_ai` spans (L346), and the eval gates (L341) — you have claimed Milestone M27.

The next module turns the measured system into the *designed* system: AI System Design (L347–L358) — the protocol (L347), the chat system (L348), the RAG platform (L349), the support and the sales (L350–351), the recruiting (L352), the document processing (L353), the coding assistant (L354), the e-commerce (L355), the automation platform (L356), the multi-tenant SaaS (L357), and the high-scale system (L358). You've measured the embassy; now you'll design the whole city.
