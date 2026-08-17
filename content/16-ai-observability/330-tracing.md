# Lesson 330 — Tracing

**Interview importance:** ⭐⭐⭐⭐⭐ — "the request path through gateway, retrieval, tools, and model" — the answer is *the trace*: the spans, the path, and the debugging (L330).**

L329 logged the record; this lesson is **the path**: the tracing — the request path through the gateway, the retrieval, the tools, and the model (L330): the spans (the segments, L330), the trace (the path, L330), and the debugging (the slow span, the failure, L330). The AI shape (L173): the request (L328) — the gateway (L267), the retrieval (L189), the tools (L315), and the model (L278) — traced (L330). This lesson is the path's layer (L330).

The distinction this lesson is built on: a **demo** logs the errors. A **solutions architect** traces the path (L330): the spans (L330), the trace (L330), and the debugging (L330) — because the slow call (L333) and the failure (L211) live in the path (L330).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the spans: the segments (L330)
- Explain the trace: the path (L330)
- Explain the propagation: the request ID (L330)
- Explain the debugging: the slow span, the failure (L330)
- Explain the AI shape: the request's path (L330)

## 1. One-Line Definition

**The tracing is the request's path through the gateway, the retrieval, the tools, and the model (L330) — the spans (the segments: each service's work with its duration L333, L330), the trace (the path: the spans chained by the request ID L330), and the debugging (the slow span: the latency's L333 location; the failure: the error's L211 location, L330) — the L213 observability (L213), trace-shaped (L330).**

The one-sentence interview answer: *"The tracing is the request's path (L330). The spans (L330): the segments of the path (L330) — the gateway's span (L267), the retrieval's span (L189), the tool's span (L315), and the model's span (L278) — each with its duration (L333), its attributes (L330), and its events (L330). The trace (L330): the path (L330) — the spans chained (L330) by the request ID (L330): the trace ID (L330) in every span (L330), the parent and the child (L330) — the one request (L330) across the services (L330). The propagation (L330): the trace ID (L330) carried (L330) — the header (L330) from the client (L330) through the gateway (L267) to the model (L278) — the path (L330) connected (L330). The debugging (L330): the slow span (L330) — the latency's (L333) location (L330): the model's span (L278) slow, the retrieval's (L189) slow; the failure (L330) — the error's (L211) location (L330): the failing span (L330) with the error (L330). The AI shape (L173): the request (L328) — the gateway (L267), the retrieval (L189), the tools (L315), and the model (L278) — traced (L330): the spans (L330), the path (L330), and the debugging (L330) — the L213 observability (L213), trace-shaped (L330)."*

## 2. Mental Model

Think of the tracing as **the package's journey map.** The package (the request, L328) travels (L330): the post office (the gateway, L267), the sorting center (the retrieval, L189), the courier (the tool, L315), and the factory (the model, L278). The journey map (the trace, L330) marks each stop (the span, L330): the post office's time (L333), the sorting's time (L333), the courier's time (L333), the factory's time (L333) — each stamped with the tracking number (the trace ID, L330). The dispatcher (the debugger, L211) reads the map (L330): the slow stop (the slow span, L330) — the factory (the model, L278) took the hour (L333) — and the lost package (the failure, L330) — the courier's (the tool, L315) error (L330). The journey works because every stop is stamped, and the numbers link the stops (L330).

```text
   the journey map (the trace, L330)
   ┌────────────────────────────────────────────────────────┐
   │ the stops (the spans, L330) — the gateway (L267), the  │
   │ retrieval (L189), the tools (L315), the model (L278)   │
   │ the stamps (the durations, L333) · the tracking        │
   │ number (the trace ID, L330)                            │
   │ the dispatcher (the debugger, L211) — reads the map    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the journey map**: the stops, the stamps, and the tracking number (L330).

## 3. Visual Flow — One Traced Request

```text
   the request (L328)
        │  the trace ID (L330)
        ▼
   ┌────────────────────── THE SPANS (L330) ────────────────────────────┐
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
   │  │ gateway  │→│retrieval │→│  tools   │→│  model   │             │
   │  │ (L267)   │ │ (L189)   │ │ (L315)   │ │ (L278)   │             │
   │  │ 12ms     │ │ 45ms     │ │ 8ms      │ │ 1.2s     │             │
   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
   │  the trace ID (L330) in every span (L330)                        │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DEBUGGING (L330) ────────────────────────┐
   │  the slow span (L330) — the model's 1.2s (L278, L333)            │
   │  the failure (L330) — the tool's error (L315, L211)              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the path: **spans → trace → debugging** (L330).

## 4. How It Works — The Path, Part by Part

- **The spans (L330).** The segments (L330): each service's work (L330) with its duration (L333), its attributes (L330), and its events (L330).
- **The trace (L330).** The path (L330): the spans chained (L330) by the trace ID (L330) — the parent and the child (L330) — the one request (L330) across the services (L330).
- **The propagation (L330).** The trace ID carried (L330): the header (L330) from the client (L330) through the gateway (L267) to the model (L278).
- **The debugging (L330).** The slow span (L330) — the latency's (L333) location; the failure (L330) — the error's (L211) location (L330).

> [!NOTE]
> **The trace is the log's path (L330).** The senior answer links the layers (L330): the log (L329) records each service's events (L329); the trace (L330) chains them (L330) — the trace ID (L330) in every log (L329) and every span (L330). The debugging (L211): the log (L329) shows the error (L329), the trace (L330) shows the path (L330) — the request (L328) from the gateway (L267) to the model (L278), with each span's (L330) duration (L333).

## 5. Real Project Usage

- **A production AI SaaS (L357).** The traces (L330) — the per-request (L328) path (L330) with the per-tenant (L320) attributes (L330).
- **A chat product (L162).** The stream's trace (L330) — the TTFT (L145) in the model's span (L278).
- **A RAG platform (L280).** The retrieval's span (L189) — the slow retrieval (L333) located (L330).
- **An agent product (L279).** The tool's spans (L315) — the trajectory (L340) traced (L330).
- **Anything AI (L328).** The path's layer (L330) — the spans, the trace, and the debugging (L330).

The through-line: **the path is the layer's** — the spans chained, the slow located (L330).

## 6. Interview Explanation

Say it in four moves:

1. **The spans.** "The segments — each service's work with its duration (L330)."
2. **The trace.** "The path — the spans chained by the trace ID (L330)."
3. **The propagation.** "The ID carried through the headers (L330)."
4. **The debugging.** "The slow span and the failure's location (L330)."

## 7. Senior-Level Insights

- **The trace ID is the chain (L330).** The ID (L330) in every span (L330) and every log (L329) — the request (L328) connected across the services (L330).
- **The span is the latency's location (L330).** The model's span (L278) — the TTFT (L145); the retrieval's span (L189) — the search (L333) — the slow (L333) located (L330).
- **The propagation is the standard (L330).** The trace context (L330) — the W3C (L346) header (L346) — the OpenTelemetry (L346) standard (L330).
- **The failure is the span's error (L330).** The error (L330) on the span (L330) — the failing service (L330) and the reason (L330) — the debugging (L211) fast (L330).
- **The audit is the trace's read (L322).** The trace (L330) — the who, the what, the when (L322) — the audit (L322) reads the path (L330).

## 8. Common Mistakes

- **The log-only (L329).** The records (L329) without the chain (L330) — the path (L330) invisible (L330).
- **The no trace ID (L330).** The spans (L330) un-linked (L330) — the request (L328) unconnected (L330).
- **The ID dropped (L330).** The header (L330) lost at the gateway (L267) — the chain (L330) broken (L330).
- **The spans un-nested (L330).** The flat spans (L330) — the parent and the child (L330) — the path (L330) unclear (L330).
- **The attributes missing (L330).** The tenant (L320) and the model (L148) absent (L330) — the queries (L330) and the audit (L322) starved (L330).

## 9. Best Practices

- **Span every service** (L330) — the gateway (L267), the retrieval (L189), the tools (L315), the model (L278).
- **Propagate the trace ID** (L330) — the W3C header (L346).
- **Nest the spans** (L330) — the parent and the child (L330).
- **Attach the attributes** (L330) — the tenant (L320), the model (L148), the tokens (L332).
- **Link the logs** (L329) — the trace ID (L330) in every record (L329).

## 10. Interview Questions

**Q: Walk me through the tracing.**
> A: The request's path (L330). The spans — the segments: the gateway (L267), the retrieval (L189), the tools (L315), the model (L278), each with its duration (L333). The trace — the spans chained by the trace ID (L330). And the debugging — the slow span and the failure's location (L330).

**Q: What do the spans record?**
> A: The segment's work (L330): the duration (L333), the attributes (L330) — the tenant (L320), the model (L148), the tokens (L332) — and the events (L330) — the retries (L256), the errors (L330). The model's span (L278) carries the TTFT (L145); the retrieval's span (L189) carries the top-k (L189).

**Q: How does the trace connect the services?**
> A: The trace ID (L330): the ID (L330) generated at the entry (L330) and propagated (L330) — the header (L330) through the gateway (L267), the retrieval (L189), and the model (L278) — every span (L330) and every log (L329) carries it (L330). The W3C trace context (L346) is the standard (L346).

**Q: How do you find the slow call?**
> A: The spans (L330): the trace (L330) shows each span's duration (L333) — the model's span (L278) at 1.2s (L333) is the slow (L333); the retrieval's span (L189) at 45ms is not (L330). The slow span (L330) is the latency's (L333) location (L330) — the optimization's (L151) target (L330).

## 11. Follow-Up Questions

- What are the spans (L330)?
- What's the trace (L330)?
- How does the propagation work (L330)?
- How do you find the slow call (L330)?
- What's the W3C context (L346)?

## 12. Comparison Table — The Log vs the Trace

| | The log (L329) | The trace (L330) |
|---|---|---|
| The unit (L330) | the record (L329) | the span (L330) |
| The view (L330) | the service's events (L329) | the request's path (L330) |
| The link (L330) | the request ID (L330) | the trace ID (L330) |
| The use (L330) | the error's detail (L329) | the latency's location (L333) |

The senior read: **the log records; the trace chains** — the two layers, one request ID (L330).

## 13. Code Example — The Path, Traced

```js
// The tracing (L330) — the spans of the request (L330).
// 1 · THE SPAN (L330) — the segment's work (L330).
async function tracedCall(req) {
  const tracer = otel.tracer('ai-service');        // the L346 standard (L346)

  // 2 · THE ROOT SPAN (L330) — the request's entry (L330).
  return tracer.startActiveSpan('chat.request', async (root) => {
    root.setAttribute('tenant.id', req.tenantId);  // the attribute (L320)
    root.setAttribute('user.id', req.userId);      // the attribute (L322)

    // 3 · THE NESTED SPANS (L330) — the path's segments (L330).
    const retrieval = await tracer.startActiveSpan('rag.retrieve', async (s) => {
      const chunks = await retrieve(req.query);    // the retrieval (L189)
      s.setAttribute('top_k', chunks.length);      // the attribute (L189)
      return chunks;
    });

    const model = await tracer.startActiveSpan('model.invoke', async (s) => {
      const started = performance.now();
      const out = await model.invoke(req.prompt);  // the model (L278)
      s.setAttribute('tokens', out.usage.total);   // the tokens (L332)
      s.setAttribute('ttft_ms', await measureTTFT());   // the TTFT (L145)
      return out;
    });

    // 4 · THE LINK (L329) — the log carries the trace ID (L330).
    logger.info({ traceId: root.spanContext().traceId, event: 'done' });

    return { retrieval, model };
  });
}
```

```text
What the reader must SEE — the path, traced:

  startActiveSpan('chat.request') → the root (L330)
  rag.retrieve + top_k           → the retrieval's span (L189)
  model.invoke + ttft_ms         → the model's span (L278, L145)
  tenant.id + user.id            → the attributes (L320, L322)
  logger.info with the traceId   → the log's link (L329)

  The spans chained, the slow located, the path connected (L330).
```

```narrate
4-5: The tracer — the OpenTelemetry standard (L346, L330).
7-10: The root span — the request's entry with the tenant and the user attributes (L330, L320).
12-17: The retrieval's span — the RAG's segment with the top-k (L189, L330).
18-24: The model's span — the invocation with the tokens and the TTFT (L278, L332, L145).
26-27: The link — the log carries the trace ID (L329, L330).
```

> [!TIP]
> The pair that defines the tracing: **the nested span** (the path's segment, L330) and **the trace ID in the log** (the chain's link, L329). **Span every service, propagate the ID, nest the spans, link the logs — the path's layer (L330).**

## 14. Performance Notes

- **The span is the latency's record (L330).** The durations (L333) per segment (L330) — the slow (L333) located (L330).
- **The propagation is the header's cost (L330).** The trace context (L346) — the negligible (L330) header (L330).
- **The storage is the trace's cost (L330).** The spans (L330) — the sampling (L330) bounds the storage (L285).
- **The attributes are the query's power (L330).** The tenant (L320) and the model (L148) — the queries (L330) and the audit (L322) read them (L330).

## 15. Debugging Scenarios

| Symptom | First check (L330) | The lever |
|---|---|---|
| The response is slow | The spans (L330) | The slow span's duration (L333) |
| The failure is opaque | The trace (L330) | The error span (L330) |
| The chain is broken | The propagation (L330) | The trace ID (L330) |
| The spans are flat | The nesting (L330) | The parent and the child (L330) |
| The audit can't read | The attributes (L330) | The tenant (L320), the user (L322) |

## 16. Quick Revision Notes

- The tracing = **the path's layer** (L330): the spans, the trace, the propagation, the debugging.
- The spans: **the segments — the gateway (L267), the retrieval (L189), the tools (L315), the model (L278)**.
- The trace: **the path — the spans chained by the trace ID (L330)**.
- The propagation: **the ID carried through the headers (L330)**.
- The debugging: **the slow span (L333) and the failure's location (L330)**.

## 17. Cheat Sheet

```text
TRACING = the request path through the services

THE SPANS (L330)
  the segments (L330): the gateway (L267), the retrieval (L189)
  the tools (L315), the model (L278)
  each with its duration (L333), its attributes (L330), its events (L330)

THE TRACE (L330)
  the path (L330) — the spans chained (L330)
  the trace ID (L330) in every span (L330)
  the parent and the child (L330)

THE PROPAGATION (L330)
  the trace ID (L330) carried (L330)
  the W3C trace context (L346) — the standard (L346)

THE DEBUGGING (L330)
  the slow span (L330) — the latency's (L333) location (L330)
  the failure (L330) — the error's (L211) location (L330)
  the log (L329) carries the trace ID (L330) — the link (L330)

INTERVIEW, 4 MOVES
  1 spans        "the segments with their durations (L330)"
  2 trace        "the path chained by the ID (L330)"
  3 propagation  "the ID through the headers (L330)"
  4 debugging    "the slow span and the failure (L330)"
```

## 18. Key Takeaways

> [!RECAP]
> - The tracing is **the request's path through the gateway, the retrieval, the tools, and the model** (L330): the spans (L330), the trace (L330), the propagation (L330), and the debugging (L330)
> - **The spans** (L330): the segments (L330) — the gateway (L267), the retrieval (L189), the tools (L315), and the model (L278) — each with its duration (L333), its attributes (L330), and its events (L330)
> - **The trace** (L330): the path (L330) — the spans chained (L330) by the trace ID (L330), the parent and the child (L330)
> - **The propagation** (L330): the trace ID (L330) carried (L330) through the headers (L330) — the W3C trace context (L346) as the standard (L346)
> - **The debugging** (L330): the slow span (L330) — the latency's (L333) location (L330); the failure (L330) — the error's (L211) location (L330); and the log (L329) carries the trace ID (L330) — the link (L330)
> - The AI shape (L330): the request (L328) — the gateway (L267), the retrieval (L189), the tools (L315), and the model (L278) — traced (L330) — the L213 observability (L213), trace-shaped (L330)

## Check your understanding

Answer these without looking back.

1. What are the spans (L330)?
2. What's the trace (L330)?
3. How does the propagation work (L330)?
4. How do you find the slow call (L330)?
5. What's the W3C context (L346)?
6. What are the attributes (L330)?
7. How do the logs link (L329)?
8. What is the path's layer (L330)?

## A Closing Note — The Map, Chained

You now hold the path: **the spans, the trace, the propagation, and the debugging — with the tracking number in every stamp.** The journey map is complete — and the slow stop is found (L330).

Next: the counters, gauges, and histograms — Metrics (L331).
