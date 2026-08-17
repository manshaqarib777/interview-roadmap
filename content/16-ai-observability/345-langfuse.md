# Lesson 345 — Langfuse

**Interview importance:** ⭐⭐⭐⭐⭐ — "the open-source observability platform for LLM apps" — the answer is *Langfuse*: the self-hosted tracing and evaluation (L345).**

L344 covered LangSmith; this lesson is **its open-source cousin**: Langfuse — the open-source observability platform for the LLM apps (L345): the tracing (the traces and the observations, L345), the evals (the datasets and the scores, L345), and the self-hosting (the open-source, the data's control, L345). The AI shape (L173): the custom stack (L345) — the traces (L345) and the evals (L345), self-hosted (L345). This lesson is the open-source observability (L345).

The distinction this lesson is built on: a **demo** prints the traces. A **solutions architect** chooses the platform (L345): the tracing (L345), the evals (L345), and the self-hosting (L345) — by the stack (L345) and the data's control (L345).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tracing: the traces and the observations (L345)
- Explain the evals: the datasets and the scores (L345)
- Explain the self-hosting: the open-source (L345)
- Explain the integration: the SDKs (L345)
- Explain the AI shape: the open-source observability (L345)

## 1. One-Line Definition

**Langfuse is the open-source observability platform for the LLM apps (L345) — the tracing (the traces and the observations: the LLM calls L278, the retrieval L189, the tools L315, L345), the evals (the datasets L342 and the scores L343: the groundedness L337, the exact match, the judge L343, L345), and the self-hosting (the open-source: the data stays in your control L345, the self-hosted or the cloud L345) — the L330 tracing (L330) and the L341 suite (L341), open-source (L345).**

The one-sentence interview answer: *"Langfuse is the open-source observability platform (L345). The tracing (L345): the traces (L345) — the request's (L328) path (L330) — the observations (L345): the LLM calls (L278), the retrieval (L189), the tools (L315) — each with the tokens (L332), the latency (L333), and the cost (L334) (L345). The evals (L345): the datasets (L342) — the golden examples (L345); and the scores (L343) — the groundedness (L337), the exact match (L345), the LLM-judge (L343) — the regression (L341) gating (L345). The self-hosting (L345): the open-source (L345) — the self-hosted (L345) keeps the data in your control (L345) — the compliance (L371) and the privacy (L313); or the managed cloud (L345). The integration (L345): the SDKs (L345) — the Python and the JS (L345), the OpenAI (L152) and the LangChain (L214) integrations (L345). The AI shape (L173): the custom stack (L345) — the traces (L345) and the evals (L345), self-hosted (L345) — the L330 tracing (L330) and the L341 suite (L341), open-source (L345)."*

## 2. Mental Model

Think of Langfuse as **the observatory the town built itself.** The observatory (Langfuse, L345) tracks the stars (the traces, L345): the constellations (the requests, L328) — the stars (the observations, L345): the telescopes' work (the LLM calls, L278), the archives (the retrieval, L189), the messengers (the tools, L315) — each timed (the latency, L333) and logged (L345). The town's own charts (the datasets, L342): the known constellations (the golden examples, L345). And the town's astronomers (the evals, L343): the charts scored (L345) — the new charts (L341) compared (L345). The observatory (L345) is the town's own (L345) — the records (L345) stay in the town (L345). The town works because it built the observatory, tracks the stars, and scores the charts (L345).

```text
   the town's observatory (Langfuse, L345)
   ┌────────────────────────────────────────────────────────┐
   │ the stars (the observations, L345) — the calls (L278), │
   │ the retrieval (L189), the tools (L315)                 │
   │ the charts (the datasets, L342) · the astronomers      │
   │ (the evals, L343)                                      │
   │ the town's own (L345) — the self-hosted (L345)         │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the observatory**: the stars, the charts, and the town's own (L345).

## 3. Visual Flow — One Langfuse Trace

```text
   the app (L173)
        │  the SDK (L345)
        ▼
   ┌────────────────────── THE TRACE (L345) ────────────────────────────┐
   │  the observations (L345): the LLM call (L278), the retrieval      │
   │  (L189), the tool (L315)                                          │
   │  the tokens (L332), the latency (L333), the cost (L334)           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EVAL (L345) ─────────────────────────────┐
   │  the dataset (L342) · the scores (L343): the groundedness (L337)  │
   │  the regression (L341) → the gate (L296)                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE SELF-HOST (L345) ────────────────────────┐
   │  the open-source (L345) — the data in your control (L345)         │
   │  the compliance (L371) and the privacy (L313)                     │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the platform: **trace → eval → self-host** (L345).

## 4. How It Works — The Platform, Part by Part

- **The tracing (L345).** The traces (L345): the request's (L328) path (L330) — the observations (L345): the LLM calls (L278), the retrieval (L189), the tools (L315).
- **The evals (L345).** The datasets (L342) and the scores (L343): the groundedness (L337), the exact match (L345), the LLM-judge (L343) — the regression (L341).
- **The self-hosting (L345).** The open-source (L345): the self-hosted (L345) — the data in your control (L345); or the managed cloud (L345).
- **The integration (L345).** The SDKs (L345): the Python and the JS (L345), the OpenAI (L152) and the LangChain (L214) integrations (L345).

> [!NOTE]
> **The self-hosting is the data's control (L345).** The senior answer names the trade (L345): LangSmith (L344) is the managed (L344); Langfuse (L345) is the open-source (L345) — the self-hosted (L345) keeps the traces (L345) in your control (L345) — the compliance (L371) and the privacy (L313) — at the ops' cost (L345). The choice (L346): the managed (L344) for the speed (L344); the self-hosted (L345) for the control (L345).

## 5. Real Project Usage

- **A custom AI stack (L345).** The SDK (L345) — the traces (L345) and the evals (L345).
- **A regulated workload (L371).** The self-hosted (L345) — the traces (L345) in the compliance's (L371) boundary (L345).
- **A RAG platform (L280).** The retrieval (L189) and the model (L278) observations (L345) — the groundedness (L337) evals (L345).
- **A CI pipeline (L296).** The eval (L345) in the workflow (L297) — the regression (L341) gating (L296).
- **Anything with the data control (L345).** The open-source (L345) — the self-hosted (L345) observability (L345).

The through-line: **the platform is the open-source's** — the traces, the evals, and the control (L345).

## 6. Interview Explanation

Say it in four moves:

1. **The tracing.** "The traces and the observations (L345)."
2. **The evals.** "The datasets (L342) and the scores (L343)."
3. **The self-hosting.** "The open-source — the data in your control (L345)."
4. **The integration.** "The SDKs — the Python, the JS, the LangChain (L345)."

## 7. Senior-Level Insights

- **The self-host is the control (L345).** The open-source (L345) — the traces (L345) in your boundary (L345) — the compliance (L371) and the privacy (L313).
- **The SDK is the integration (L345).** The Python (L345) and the JS (L345) — the OpenAI (L152) and the LangChain (L214) — the tracing (L345) automatic (L345).
- **The observations are the spans (L330).** The LLM (L278), the retrieval (L189), the tools (L315) — the L330 spans (L330), Langfuse-shaped (L345).
- **The evals are the gate (L341).** The datasets (L342) and the scores (L343) — the regression (L341) in the CI (L296).
- **The cost is the run's (L334).** The tokens (L332) per observation (L345) — the L334 attribution (L334), platform-shaped (L345).

## 8. Common Mistakes

- **The print-based tracing (L345).** The console logs (L329) — the SDK (L345) is the tracing (L345).
- **The data's boundary missed (L345).** The traces (L345) to the managed (L344) — the regulated (L371) needs the self-host (L345).
- **The dataset-less evals (L345).** The scores (L343) without the examples (L342) — the eval (L345) un-founded (L345).
- **The CI gate missing (L296).** The evals (L345) after the deploy (L307) — the regression (L341) ships (L345).
- **The platform by the habit (L346).** The LangSmith (L344) for the custom stack (L345) — the choice (L346) by the stack (L345).

## 9. Best Practices

- **SDK the app** (L345) — the tracing (L345) automatic (L345).
- **Self-host for the control** (L345) — the compliance (L371) and the privacy (L313).
- **Curate the datasets** (L342) — the golden examples (L345).
- **Run the evals** (L345) — the regression (L341) in the CI (L296).
- **Choose by the stack** (L346) — the LangChain (L214) → LangSmith (L344); the custom → Langfuse (L345).

## 10. Interview Questions

**Q: Walk me through Langfuse.**
> A: The open-source observability platform (L345). The tracing — the traces and the observations: the LLM calls, the retrieval, the tools (L345). The evals — the datasets (L342) and the scores (L343). The self-hosting — the open-source, the data in your control (L345). And the integration — the SDKs (L345).

**Q: Why the self-hosting?**
> A: The data's control (L345): the self-hosted (L345) keeps the traces (L345) in your boundary (L345) — the compliance (L371) and the privacy (L313) — at the ops' cost (L345). The managed (L344) is faster (L344); the self-hosted (L345) is the control (L345) — the trade (L346) by the workload (L345).

**Q: How does it compare to LangSmith?**
> A: The family and the model (L346): LangSmith (L344) is the LangChain (L214) family's, managed (L344); Langfuse (L345) is the framework-agnostic (L345), open-source (L345). Both trace (L330) and evaluate (L341); the choice (L346): the LangChain (L214) → LangSmith (L344); the custom stack (L345) or the data control (L345) → Langfuse (L345).

**Q: How do the evals work?**
> A: The datasets (L342) and the scores (L343): the golden examples (L345) — the groundedness (L337), the exact match (L345), the LLM-judge (L343) — scored (L343) and compared (L341) — the regression (L341) gating the CI (L296).

## 11. Follow-Up Questions

- What's the tracing (L345)?
- What are the evals (L345)?
- Why the self-hosting (L345)?
- How does it compare to LangSmith (L344)?
- What's the integration (L345)?

## 12. Comparison Table — Langfuse vs LangSmith

| | Langfuse (L345) | LangSmith (L344) |
|---|---|---|
| The model (L346) | the open-source (L345) | the managed (L344) |
| The family (L346) | the agnostic (L345) | the LangChain (L214) |
| The control (L345) | the self-hosted (L345) | the cloud (L344) |
| The use (L346) | the custom (L345), the regulated (L371) | the LangChain stack (L214) |

The senior read: **the control or the convenience** — the trade by the workload (L346).

## 13. Code Example — The Platform, Applied

```python
# The Langfuse platform (L345) — the SDK tracing (L345).
# 1 · THE SDK (L345) — the integration (L345).
from langfuse import Langfuse
from langfuse.decorators import observe

langfuse = Langfuse()                    # the client (L345)

# 2 · THE OBSERVATION (L345) — the traced call (L345).
@observe()
def answer(question: str):
    # the observation (L345): the LLM call (L278) — traced (L345)
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": question}],
    )
    # the tokens (L332), the latency (L333), the cost (L334)
    # — recorded on the observation (L345)
    return response.choices[0].message.content

# 3 · THE EVAL (L345) — the dataset and the score (L343).
#   langfuse.create_dataset("support-golden")      # the golden (L342)
#   the groundedness (L337) and the judge (L343) scored (L345)
#   the regression (L341) → the CI gate (L296)

# 4 · THE SELF-HOST (L345) — the open-source deployment (L345).
#   the data (L345) in your boundary (L345) — the compliance (L371)
```

```text
What the reader must SEE — the platform, applied:

  Langfuse() client         → the SDK (L345)
  @observe()                → the traced call (L345)
  the tokens + latency      → the observation's record (L332, L333)
  create_dataset + scores   → the evals (L342, L343)
  the self-host             → the data's control (L345)

  The traces, the evals, and the control — open-source (L345).
```

```narrate
5-7: The SDK — the Langfuse client (L345).
9-18: The observation — the traced LLM call with the tokens and the latency (L345, L332).
20-22: The evals — the dataset and the scores (L342, L343).
24-25: The self-host — the data in your control (L345, L371).
```

> [!TIP]
> The pair that defines the platform: **the `@observe()` decorator** (the tracing, L345) and **the self-hosted deployment** (the control, L345). **SDK the app, trace the observations, score the evals, self-host for the control — the open-source observability (L345).**

## 14. Performance Notes

- **The SDK is the zero-code tracing (L345).** The decorator (L345) — the overhead (L345) minimal (L345).
- **The self-host is the ops' cost (L345).** The deployment (L345) — the infrastructure (L285) for the control (L345).
- **The evals are the CI's time (L345).** The dataset (L342) — the minutes (L345) per run (L341).
- **The storage is the traces' (L345).** The observations (L345) — the retention (L322) bounded (L345).

## 15. Debugging Scenarios

| Symptom | First check (L345) | The lever |
|---|---|---|
| The trace is missing | The SDK (L345) | The @observe (L345) |
| The data leaves the boundary | The hosting (L345) | The self-host (L345) |
| The evals are unfounded | The dataset (L342) | The examples (L345) |
| The regression ships | The gate (L296) | The eval in the CI (L345) |
| The cost is unexplained | The observation (L334) | The tokens (L332) per call (L345) |

## 16. Quick Revision Notes

- Langfuse = **the open-source observability** (L345): the tracing, the evals, the self-hosting.
- The tracing: **the traces and the observations (L345)**.
- The evals: **the datasets (L342) and the scores (L343)**.
- The self-hosting: **the open-source — the data in your control (L345)**.
- The integration: **the SDKs — the Python, the JS, the LangChain (L345)**.

## 17. Cheat Sheet

```text
LANGFUSE = the open-source observability platform

THE TRACING (L345)
  the traces (L345) — the request's (L328) path (L330)
  the observations (L345): the LLM calls (L278), the retrieval (L189),
  the tools (L315)
  the tokens (L332), the latency (L333), the cost (L334)

THE EVALS (L345)
  the datasets (L342) — the golden examples (L345)
  the scores (L343): the groundedness (L337), the exact match (L345),
  the LLM-judge (L343)
  the regression (L341) → the CI gate (L296)

THE SELF-HOSTING (L345)
  the open-source (L345) — the data in your control (L345)
  the compliance (L371) and the privacy (L313)
  or the managed cloud (L345)

THE INTEGRATION (L345)
  the SDKs (L345) — the Python, the JS (L345)
  the OpenAI (L152), the LangChain (L214)

INTERVIEW, 4 MOVES
  1 tracing   "the traces and the observations (L345)"
  2 evals     "the datasets and the scores (L345)"
  3 self-host "the open-source, the data's control (L345)"
  4 integration "the SDKs (L345)"
```

## 18. Key Takeaways

> [!RECAP]
> - Langfuse is **the open-source observability platform for the LLM apps** (L345): the tracing (L345), the evals (L345), the self-hosting (L345), and the integration (L345)
> - **The tracing** (L345): the traces (L345) — the request's (L328) path (L330) — and the observations (L345): the LLM calls (L278), the retrieval (L189), the tools (L315) — with the tokens (L332), the latency (L333), and the cost (L334)
> - **The evals** (L345): the datasets (L342) — the golden examples (L345); and the scores (L343) — the groundedness (L337), the exact match (L345), the LLM-judge (L343) — the regression (L341) gating (L345)
> - **The self-hosting** (L345): the open-source (L345) — the self-hosted (L345) keeps the data (L345) in your control (L345) — the compliance (L371) and the privacy (L313)
> - **The integration** (L345): the SDKs (L345) — the Python and the JS (L345), the OpenAI (L152) and the LangChain (L214) integrations (L345)
> - The choice (L346): the LangChain (L214) → LangSmith (L344); the custom stack (L345) or the data control (L345) → Langfuse (L345) — the L330 tracing (L330) and the L341 suite (L341), open-source (L345)

## Check your understanding

Answer these without looking back.

1. What's the tracing (L345)?
2. What are the evals (L345)?
3. Why the self-hosting (L345)?
4. How does it compare to LangSmith (L344)?
5. What's the integration (L345)?
6. What's the observation (L345)?
7. What's the SDK (L345)?
8. What is the open-source observability (L345)?

## A Closing Note — The Observatory, Town-Built

You now hold the platform: **the tracing, the evals, the self-hosting, and the integration — with the stars tracked and the charts scored.** The town built its own observatory — and the records stay in the town (L345).

Next: the capstone — one tracing standard across your AI stack (L346).
