# Lesson 344 — LangSmith

**Interview importance:** ⭐⭐⭐⭐⭐ — "the LangChain-family tracing and evaluation platform" — the answer is *LangSmith*: the tracing, the datasets, and the evals of the LangChain family (L344).**

L330 built the tracing and L341 the suite; this lesson is **the platform**: LangSmith — the LangChain-family tracing and evaluation platform (L344): the tracing (the runs and the spans, L344), the datasets (the golden sets, L342), and the evals (the regression suite, L341) — for the LangChain (L214) and the LangGraph (L215) apps (L344). The AI shape (L173): the LangChain app (L214) — the runs (L344) traced (L344) and the evals (L344) run (L344). This lesson is the LangChain family's observability (L344).

The distinction this lesson is built on: a **demo** prints the traces. A **solutions architect** uses the platform (L344): the tracing (L344), the datasets (L344), and the evals (L344) — because the LangChain (L214) app (L344) needs its observability (L344).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the tracing: the runs and the spans (L344)
- Explain the datasets: the golden sets (L342)
- Explain the evals: the regression suite (L341)
- Explain the placement: the LangChain and the LangGraph (L344)
- Explain the AI shape: the LangChain family's observability (L344)

## 1. One-Line Definition

**LangSmith is the LangChain-family tracing and evaluation platform (L344) — the tracing (the runs and the spans: the chain's L214 steps, the tool calls L315, and the model calls L278, traced L344), the datasets (the golden sets L342: the examples with the expected outputs, L344), and the evals (the regression suite L341: the scores L343 on the datasets L344) — for the LangChain (L214) and the LangGraph (L215) apps (L344).**

The one-sentence interview answer: *"LangSmith is the observability platform for the LangChain family (L344). The tracing (L344): the runs (L344) — the chain's (L214) execution (L344) — the spans (L330): the prompt's construction (L344), the retrieval (L189), the tool calls (L315), and the model calls (L278) — each with the tokens (L332), the latency (L333), and the cost (L334) (L344). The datasets (L344): the golden sets (L342) — the examples (L344) with the expected outputs (L344) — the evals' (L344) foundation (L344). The evals (L344): the regression suite (L341) — the scores (L343) on the datasets (L344): the groundedness (L337), the exact match (L344), the LLM-judge (L343) — run on the schedule (L221) and in the CI (L296). The integration (L344): the LangChain (L214) and the LangGraph (L215) — the `langsmith` wrapper (L344) — the tracing (L344) automatic (L344). The AI shape (L173): the LangChain (L214) and the LangGraph (L215) apps (L344) — the runs (L344) traced (L344), the datasets (L344) curated (L344), and the evals (L344) gating (L344) — the L330 tracing (L330) and the L341 suite (L341), LangChain-shaped (L344)."*

## 2. Mental Model

Think of LangSmith as **the delivery company's control center for the LangChain couriers.** The control center (LangSmith, L344) tracks every delivery (the run, L344): the route (the chain, L214) — the stops (the spans, L330): the package pickup (the retrieval, L189), the courier (the tool, L315), the processing (the model, L278) — each timed (the latency, L333) and billed (the cost, L334). The center's archive (the datasets, L344): the known deliveries (the golden examples, L342) with the expected (L344). And the inspectors (the evals, L344): the scores (L343) on the archive (L344) — the deliveries (L344) meeting the standard (L344). The company works because the center tracks the routes, the archive holds the examples, and the inspectors gate the new routes (L344).

```text
   the control center (LangSmith, L344)
   ┌────────────────────────────────────────────────────────┐
   │ the routes (the runs, L344) — the stops (the spans,    │
   │ L330)                                                  │
   │ the archive (the datasets, L344) — the golden (L342)   │
   │ the inspectors (the evals, L344) — the scores (L343)   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the control center**: the routes, the archive, and the inspectors (L344).

## 3. Visual Flow — One LangChain Run

```text
   the LangChain app (L214)
        │  the langsmith wrapper (L344)
        ▼
   ┌────────────────────── THE RUN (L344) ──────────────────────────────┐
   │  the chain's steps (L214): the retrieval (L189), the tools        │
   │  (L315), the model (L278) — the spans (L330)                      │
   │  the tokens (L332), the latency (L333), the cost (L334)           │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DATASET (L344) ──────────────────────────┐
   │  the examples (L344) with the expected outputs (L344)             │
   │  the golden set (L342)                                            │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE EVAL (L344) ─────────────────────────────┐
   │  the scores (L343) on the dataset (L344)                          │
   │  the groundedness (L337), the exact match (L344)                  │
   │  the regression (L341) → the gate (L296)                          │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the platform: **run → dataset → eval** (L344).

## 4. How It Works — The Platform, Part by Part

- **The tracing (L344).** The runs (L344): the chain's (L214) execution (L344) — the spans (L330) of the steps (L344) — the tokens (L332), the latency (L333), the cost (L334).
- **The datasets (L344).** The golden sets (L342): the examples (L344) with the expected outputs (L344).
- **The evals (L344).** The regression suite (L341): the scores (L343) on the datasets (L344) — the groundedness (L337), the exact match (L344), the LLM-judge (L343).
- **The integration (L344).** The LangChain (L214) and the LangGraph (L215): the `langsmith` wrapper (L344) — the tracing (L344) automatic (L344).

> [!NOTE]
> **LangSmith is the L330 and the L341, LangChain-shaped (L344).** The senior answer maps the module (L344): the tracing (L344) is the L330 tracing (L330) — the runs (L344) and the spans (L330) — productized (L344); the datasets (L344) are the L342 datasets (L342) — the golden sets (L342) — productized (L344); and the evals (L344) are the L341 suite (L341) — the scores (L343) and the gates (L296) — productized (L344). The platform (L344) is the module's (L328) observability, LangChain-shaped (L344).

## 5. Real Project Usage

- **A LangChain app (L214).** The runs (L344) traced (L344) — the langsmith wrapper (L344).
- **A LangGraph agent (L215).** The graph's (L215) states (L344) traced (L344) — the trajectory (L340) in the runs (L344).
- **A RAG chain (L280).** The retrieval (L189) and the model (L278) spans (L344) — the evals (L344) on the dataset (L342).
- **A CI pipeline (L296).** The eval (L344) in the workflow (L297) — the regression (L341) gating (L296).
- **Anything LangChain (L214).** The platform (L344) — the tracing (L344), the datasets (L344), the evals (L344).

The through-line: **the platform is the family's observability** — the runs, the datasets, and the evals (L344).

## 6. Interview Explanation

Say it in four moves:

1. **The tracing.** "The runs and the spans — the chain's steps (L344)."
2. **The datasets.** "The golden examples with the expected outputs (L344)."
3. **The evals.** "The scores on the datasets (L343)."
4. **The integration.** "The langsmith wrapper — the tracing automatic (L344)."

## 7. Senior-Level Insights

- **The wrapper is the zero-code tracing (L344).** The `langsmith` wrapper (L344) — the runs (L344) traced (L344) without the instrumentation (L344).
- **The spans are the chain's map (L330).** The steps (L344) — the retrieval (L189), the tools (L315), the model (L278) — the slow step (L333) located (L344).
- **The datasets are the eval's (L342).** The golden examples (L344) — the L342 datasets (L342), platform-shaped (L344).
- **The evals are the gate's (L341).** The scores (L343) — the regression (L341) in the CI (L296) — the deploy (L307) gated (L344).
- **The cost is the run's (L334).** The tokens (L332) per run (L344) — the L334 attribution (L334), LangChain-shaped (L344).

## 8. Common Mistakes

- **The print-based tracing (L344).** The console logs (L329) — the runs (L344) un-instrumented (L344) — the wrapper (L344) is the fix (L344).
- **The dataset-less evals (L344).** The scores (L343) without the examples (L342) — the eval (L344) un-founded (L344).
- **The eval-less datasets (L344).** The golden sets (L342) un-scored (L344) — the suite (L341) un-run (L344).
- **The CI gate missing (L296).** The evals (L344) after the deploy (L307) — the regression (L341) ships (L344).
- **The un-wrapped chains (L344).** The LangChain (L214) without the wrapper (L344) — the tracing (L344) missing (L344).

## 9. Best Practices

- **Wrap the chains** (L344) — the langsmith wrapper (L344).
- **Curate the datasets** (L344) — the golden examples (L342).
- **Run the evals** (L344) — the scores (L343) on the schedule (L221).
- **Gate the CI** (L296) — the regression (L341) before the deploy (L307).
- **Watch the cost** (L334) — the tokens (L332) per run (L344).

## 10. Interview Questions

**Q: Walk me through LangSmith.**
> A: The LangChain family's observability (L344). The tracing — the runs and the spans of the chain's steps (L344). The datasets — the golden examples with the expected outputs (L344). The evals — the scores on the datasets (L343). And the integration — the langsmith wrapper, the tracing automatic (L344).

**Q: How does the tracing work?**
> A: The runs (L344): the wrapper (L344) traces the chain's (L214) execution (L344) — the spans (L330) of the retrieval (L189), the tools (L315), and the model (L278) — with the tokens (L332), the latency (L333), and the cost (L334) (L344). The run (L344) is the request's (L328) record (L344).

**Q: How do the evals work?**
> A: The datasets (L344): the golden examples (L342) with the expected outputs (L344); the evals (L344) — the scores (L343) on the datasets (L344): the groundedness (L337), the exact match (L344), the LLM-judge (L343); and the regression (L341) — the new scores vs the old (L344) — gating the CI (L296).

**Q: How does it compare to Langfuse?**
> A: The families (L346): LangSmith (L344) is the LangChain (L214) family's (L344); Langfuse (L345) is the open-source, framework-agnostic (L345). Both trace (L330), evaluate (L341), and observe (L328); the choice (L344) is the stack's (L344): the LangChain (L214) → LangSmith (L344); the custom (L345) → Langfuse (L345) or the OTel (L346).

## 11. Follow-Up Questions

- What's the tracing (L344)?
- What are the datasets (L344)?
- What are the evals (L344)?
- How does it compare to Langfuse (L345)?
- What's the integration (L344)?

## 12. Comparison Table — LangSmith vs Langfuse

| | LangSmith (L344) | Langfuse (L345) |
|---|---|---|
| The family (L346) | the LangChain (L214) | the agnostic (L345) |
| The tracing (L344) | the runs (L344) | the traces (L345) |
| The evals (L344) | the datasets + the scores (L344) | the datasets + the scores (L345) |
| The model (L346) | the commercial (L344) | the open-source (L345) |
| The use (L346) | the LangChain stack (L214) | the custom stack (L345) |

The senior read: **the family decides** — the LangChain (L214) → LangSmith (L344); the custom → Langfuse (L345).

## 13. Code Example — The Platform, Applied

```python
# The LangSmith platform (L344) — the tracing and the evals (L344).
# 1 · THE WRAPPER (L344) — the tracing automatic (L344).
from langsmith import traceable
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# 2 · THE CHAIN (L214) — the LangChain app (L344).
prompt = ChatPromptTemplate.from_template("Answer using the docs: {question}")
model = ChatOpenAI(model="gpt-4o-mini")

# 3 · THE RUN (L344) — the traced execution (L344).
@traceable(run_type="chain")                  # the wrapper (L344)
def answer(question: str):
    chain = prompt | model                    # the chain (L214)
    return chain.invoke({"question": question})
    # the run (L344): the prompt's construction, the model's call (L344)
    # the tokens (L332), the latency (L333), the cost (L334) — traced (L344)

# 4 · THE DATASET (L344) — the golden examples (L342).
from langsmith import Client
client = Client()
dataset = client.create_dataset("support-golden")
client.create_examples(dataset_id=dataset.id, examples=[
    {"inputs": {"question": "What is the refund policy?"},
     "outputs": {"answer": "30 days"}},       # the expected (L344)
])

# 5 · THE EVALS (L344) — the scores on the dataset (L343).
#   the groundedness (L337) · the exact match (L344) · the judge (L343)
#   the regression (L341) → the CI gate (L296)
```

```text
What the reader must SEE — the platform, applied:

  @traceable(run_type="chain") → the wrapper (L344)
  prompt | model               → the chain (L214)
  the run's tokens + latency   → the tracing (L332, L333)
  create_examples + expected   → the dataset (L342, L344)
  the groundedness + judge     → the evals (L343)

  The runs traced, the datasets curated, the evals gating (L344).
```

```narrate
5-6: The imports — the LangSmith and the LangChain (L344, L214).
10-11: The chain — the prompt and the model (L214).
13-19: The run — the traced execution with the tokens, the latency, and the cost (L344).
21-27: The dataset — the golden examples with the expected outputs (L342, L344).
29-31: The evals — the scores and the regression gate (L343, L341).
```

> [!TIP]
> The pair that defines the platform: **the `@traceable` wrapper** (the tracing, L344) and **the golden dataset** (the evals' foundation, L342). **Wrap the chains, curate the datasets, run the evals, gate the CI — the LangChain family's observability (L344).**

## 14. Performance Notes

- **The wrapper is the zero-cost tracing (L344).** The automatic (L344) — the overhead (L344) minimal (L344).
- **The evals are the CI's time (L344).** The dataset (L342) — the minutes (L344) per run (L341).
- **The cost is the run's (L334).** The tokens (L332) — the L334 attribution (L334), platform-shaped (L344).
- **The storage is the runs' (L344).** The traces (L344) — the retention (L322) bounded (L344).

## 15. Debugging Scenarios

| Symptom | First check (L344) | The lever |
|---|---|---|
| The run is untraced | The wrapper (L344) | The @traceable (L344) |
| The slow step | The spans (L330) | The run's steps (L344) |
| The evals are unfounded | The dataset (L342) | The examples (L344) |
| The regression ships | The gate (L296) | The eval in the CI (L344) |
| The cost is unexplained | The run (L334) | The tokens (L332) per run (L344) |

## 16. Quick Revision Notes

- LangSmith = **the LangChain family's observability** (L344): the tracing, the datasets, the evals.
- The tracing: **the runs and the spans (L344)** — the chain's steps (L214).
- The datasets: **the golden examples with the expected outputs (L342)**.
- The evals: **the scores on the datasets (L343)** — the regression (L341).
- The integration: **the langsmith wrapper (L344)** — the tracing automatic (L344).

## 17. Cheat Sheet

```text
LANGSMITH = the LangChain-family tracing and evaluation platform

THE TRACING (L344)
  the runs (L344) — the chain's (L214) execution (L344)
  the spans (L330): the retrieval (L189), the tools (L315),
  the model (L278)
  the tokens (L332), the latency (L333), the cost (L334)

THE DATASETS (L344)
  the golden examples (L344) with the expected outputs (L344)
  the L342 datasets (L342), platform-shaped (L344)

THE EVALS (L344)
  the scores (L343) on the datasets (L344)
  the groundedness (L337) · the exact match (L344) · the judge (L343)
  the regression (L341) → the CI gate (L296)

THE INTEGRATION (L344)
  the langsmith wrapper (L344) — the tracing automatic (L344)
  the LangChain (L214) · the LangGraph (L215)

INTERVIEW, 4 MOVES
  1 tracing   "the runs and the spans (L344)"
  2 datasets  "the golden examples (L344)"
  3 evals     "the scores on the datasets (L343)"
  4 integration "the wrapper — the tracing automatic (L344)"
```

## 18. Key Takeaways

> [!RECAP]
> - LangSmith is **the LangChain-family tracing and evaluation platform** (L344): the tracing (L344), the datasets (L344), the evals (L344), and the integration (L344)
> - **The tracing** (L344): the runs (L344) — the chain's (L214) execution (L344) — the spans (L330) of the retrieval (L189), the tools (L315), and the model (L278) — with the tokens (L332), the latency (L333), and the cost (L334)
> - **The datasets** (L344): the golden examples (L344) with the expected outputs (L344) — the L342 datasets (L342), platform-shaped (L344)
> - **The evals** (L344): the scores (L343) on the datasets (L344) — the groundedness (L337), the exact match (L344), the LLM-judge (L343) — the regression (L341) gating the CI (L296)
> - **The integration** (L344): the `langsmith` wrapper (L344) — the tracing (L344) automatic (L344) for the LangChain (L214) and the LangGraph (L215)
> - The mapping (L344): LangSmith (L344) is the L330 tracing (L330) and the L341 suite (L341), LangChain-shaped (L344)

## Check your understanding

Answer these without looking back.

1. What's the tracing (L344)?
2. What are the datasets (L344)?
3. What are the evals (L344)?
4. How does it compare to Langfuse (L345)?
5. What's the integration (L344)?
6. What's the run (L344)?
7. What's the wrapper (L344)?
8. What is the family's observability (L344)?

## A Closing Note — The Center, Manned

You now hold the platform: **the tracing, the datasets, the evals, and the integration — with the routes tracked and the inspectors gating.** The control center watches the LangChain couriers — and the new routes are inspected (L344).

Next: the open-source observability platform — Langfuse (L345).
