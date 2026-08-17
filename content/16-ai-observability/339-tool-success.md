# Lesson 339 — Tool Success Rate

**Interview importance:** ⭐⭐⭐⭐⭐ — "the agent metric: how often tools work, and how that decays" — the answer is *the tool rate*: the success, the failure, and the decay (L339).**

L213 built the agent observability (L213); this lesson is **the tool's metric**: the tool success rate — the agent metric: how often the tools work, and how that decays (L339): the rate (the successes ÷ the calls, L339), the failures (the errors, the invalid args, L339), and the decay (the drift over time, L339). The AI shape (L173): the agents (L200) with the tools (L315) — the success rate (L339) watched (L339). This lesson is the agent's tool metric (L339).

The distinction this lesson is built on: a **demo** watches the answers. A **solutions architect** watches the tools (L339): the success rate (L339), the failures (L339), and the decay (L339) — because the agent (L200) is its tools (L339).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the rate: the successes ÷ the calls (L339)
- Explain the failures: the errors, the invalid args (L339)
- Explain the decay: the drift over time (L339)
- Explain the causes: the schema, the model, the API (L339)
- Explain the AI shape: the agent's tool metric (L339)

## 1. One-Line Definition

**The tool success rate is the agent metric — how often the tools work, and how that decays (L339) — the rate (the successful calls ÷ the total calls: the per-tool and the overall, L339), the failures (the errors L330, the invalid arguments L315, the timeouts L339), and the decay (the rate's drift over time: the API L227 changing, the model L148 drifting L335, the schema L315 breaking, L339) — the agent's (L200) health, tool-shaped (L339).**

The one-sentence interview answer: *"The tool success rate is the agent's key metric (L339). The rate (L339): the successful calls (L339) ÷ the total calls (L339) — the per-tool (L339) and the overall (L339) — the agent's (L200) tool health (L339). The failures (L339): the errors (L330) — the API's (L227) rejection (L339); the invalid arguments (L315) — the schema's (L315) violation (L339); and the timeouts (L339) — the slow tool (L333). The decay (L339): the rate's drift over time (L335) — the API (L227) changing (L339), the model (L148) drifting (L335), the schema (L315) breaking (L339) — the tool (L339) degrading silently (L339). The causes (L339): the schema (L315) — the arguments (L315) invalid; the model (L148) — the tool call (L201) malformed; the API (L227) — the external (L227) breaking. The AI shape (L173): the agents (L200) with the tools (L315) — the success rate (L339) watched (L339): the per-tool (L339) and the overall (L339), the failures (L339) categorized (L339), and the decay (L339) alerted (L274) — the agent's (L200) health, tool-shaped (L339)."*

## 2. Mental Model

Think of the tool success rate as **the courier company's delivery log.** The log (the metric, L339) records the deliveries (the tool calls, L315): the delivered (the successes, L339), the returned (the failures, L339) — the wrong address (the invalid args, L315), the recipient gone (the API's error, L339), the lost (the timeout, L339). The manager (the monitor, L339) computes the rate (L339): the delivered ÷ the total (L339) — per courier (the per-tool, L339) and overall (L339). The trends (the decay, L339): the rate slipping (L335) — the map changed (the API, L227), the couriers (the model, L148) confused (L339). The alarm (L274) rings when the rate drops (L339). The company works because the log is kept, the rates are computed, and the slips are paged (L339).

```text
   the delivery log (the tool rate, L339)
   ┌────────────────────────────────────────────────────────┐
   │ the deliveries (the calls, L315) — the successes, the  │
   │ failures (L339)                                        │
   │ the reasons (L339): the args (L315), the API (L227),   │
   │ the timeouts (L339)                                    │
   │ the rate (L339) · the decay (L335) · the alarm (L274)  │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the delivery log**: the deliveries, the reasons, and the rate (L339).

## 3. Visual Flow — One Tool's Rate

```text
   the agent (L200)
        │  the tool call (L315)
        ▼
   ┌────────────────────── THE OUTCOME (L339) ──────────────────────────┐
   │  the success (L339) — the result returned (L339)                  │
   │  the failure (L339) — the error, the invalid args (L315),         │
   │  the timeout (L339)                                               │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE RATE (L339) ─────────────────────────────┐
   │  the per-tool: send_email 98% (L339)                              │
   │  the overall: 96% (L339)                                          │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE DECAY (L335) ────────────────────────────┐
   │  the rate over time (L339): 98% → 91% (L335)                     │
   │  the cause: the API changed (L227) → the alert (L274)            │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the rate: **outcome → rate → decay** (L339).

## 4. How It Works — The Metric, Part by Part

- **The rate (L339).** The successful calls ÷ the total calls (L339) — the per-tool (L339) and the overall (L339).
- **The failures (L339).** The errors (L330), the invalid arguments (L315), the timeouts (L339) — categorized (L339).
- **The decay (L339).** The rate's drift over time (L335) — the API (L227) changing, the model (L148) drifting (L335), the schema (L315) breaking.
- **The causes (L339).** The schema (L315), the model (L148), and the API (L227) — the failure's root (L339).

> [!NOTE]
> **The tool rate is the agent's health (L339).** The senior answer treats the tools (L339) as the agent's (L200) organs (L339): the agent (L200) is only as good as its tools (L315) — the failing tool (L339) breaks the trajectory (L340). The rate (L339) per tool (L339) locates the failing organ (L339); the decay (L335) alerts before the users (L162) notice (L339). The L339 metric (L339) is the L340 agent eval's (L340) input (L339).

## 5. Real Project Usage

- **An agent product (L279).** The per-tool success rate (L339) — the failing tool (L339) found.
- **A customer support agent (L350).** The ticket tools (L315) — the success rate (L339) and the decay (L335).
- **A RAG agent (L327).** The retrieval tool (L189) — the success (L339) and the recall (L338).
- **A multi-tenant SaaS (L357).** The per-tenant (L320) tool rates (L339) — the tenant's (L320) API keys (L319) failing (L339).
- **Anything agentic (L200).** The tool metric (L339) — the rate, the failures, the decay (L339).

The through-line: **the rate is the tool's** — the successes, the failures, and the decay (L339).

## 6. Interview Explanation

Say it in four moves:

1. **The rate.** "The successes ÷ the calls — per tool and overall (L339)."
2. **The failures.** "The errors, the invalid args, the timeouts (L339)."
3. **The decay.** "The rate's drift over time (L335)."
4. **The causes.** "The schema (L315), the model (L148), the API (L227)."

## 7. Senior-Level Insights

- **The per-tool rate locates (L339).** The overall (L339) hides the failing tool (L339) — the per-tool (L339) finds it (L339).
- **The failure's category directs (L339).** The invalid args (L315) — the schema's (L315) fix; the API's (L227) error — the integration's (L227) fix; the timeout (L339) — the latency's (L333) fix (L339).
- **The decay is the silent regression (L335).** The rate slipping (L339) — the API (L227) or the model (L148) changed (L335) — the alert (L274) before the users (L162).
- **The trajectory is the agent's context (L340).** The tool's success (L339) — the L340 task success (L340) — the L339 metric (L339) feeds the L340 eval (L340).
- **The audit is the call's record (L322).** The tool calls (L315) — the successes and the failures (L339) — the L322 record (L322), tool-shaped (L339).

## 8. Common Mistakes

- **The overall only (L339).** The aggregate (L339) hiding the failing tool (L339) — the per-tool (L339) is the location (L339).
- **The failure un-categorized (L339).** The errors (L339) without the reasons (L339) — the fix (L339) undirected (L339).
- **The decay un-watched (L335).** The rate (L339) without the trend (L335) — the silent regression (L339) ships (L335).
- **The tool un-sampled (L341).** The calls (L315) unscored (L341) — the success (L339) un-verified (L341).
- **The alarm-less rate (L274).** The drop (L339) without the page (L274) — the agent (L200) degraded (L339).

## 9. Best Practices

- **Watch the per-tool rate** (L339) — and the overall (L339).
- **Categorize the failures** (L339) — the args (L315), the API (L227), the timeouts (L339).
- **Alert the decay** (L274) — the drift (L335) over the threshold (L274).
- **Sample the calls** (L341) — the success (L339) verified (L341).
- **Audit the calls** (L322) — the record (L322) of the tool (L339).

## 10. Interview Questions

**Q: Walk me through the tool success rate.**
> A: The agent's key metric (L339). The rate — the successes ÷ the calls, per tool and overall (L339). The failures — the errors, the invalid args, the timeouts (L339). The decay — the rate's drift over time (L335). And the causes — the schema (L315), the model (L148), the API (L227).

**Q: Why the per-tool rate?**
> A: The location (L339): the overall (L339) hides the failing tool (L339) — the per-tool (L339) finds it (L339): "the send_email tool is at 91%, the rest at 98%" (L339). The fix (L339) is directed (L339).

**Q: What causes the decay?**
> A: Three (L339): the API (L227) — the external (L227) changed (L339); the model (L148) — the tool call (L201) malformed after the provider's update (L365, L335); and the schema (L315) — the arguments (L315) breaking (L339). The failure's category (L339) directs the fix (L339).

**Q: How does it feed the agent eval?**
> A: The L340 input (L339): the task's success (L340) depends on the tool's success (L339) — the trajectory (L340) with the failing tool (L339) fails the task (L340). The L339 metric (L339) is the L340 eval's (L340) component (L339).

## 11. Follow-Up Questions

- What's the rate (L339)?
- Why the per-tool rate (L339)?
- What causes the decay (L339)?
- How does it feed the agent eval (L340)?
- What's the audit (L322)?

## 12. Comparison Table — The Tool's Outcomes

| | The success (L339) | The failure (L339) |
|---|---|---|
| The rate's effect (L339) | the up (L339) | the down (L339) |
| The cause (L339) | the valid call (L315) | the args (L315), the API (L227), the timeout (L339) |
| The fix (L339) | none (L339) | the schema (L315), the integration (L227), the latency (L333) |
| The agent's effect (L339) | the trajectory (L340) | the task's failure (L340) |

The senior read: **the failure's category directs the fix** (L339).

## 13. Code Example — The Rate, Watched

```js
// The tool success rate (L339) — the metric of the calls (L339).
// 1 · THE OUTCOME (L339) — recorded per call (L339).
async function trackedToolCall(tool, args, ctx) {
  const started = performance.now();
  try {
    const result = await executeScoped(tool, args);   // L323
    await recordOutcome(tool, { ok: true, latencyMs: performance.now() - started });
    return result;
  } catch (err) {
    await recordOutcome(tool, {
      ok: false,
      reason: categorize(err),              // the args / the API / the timeout (L339)
      error: err.message,
    });
    throw err;
  }
}

// 2 · THE RATE (L339) — the per-tool and the overall (L339).
async function toolHealth() {
  const calls = await metricStore.toolCalls('24h');    // L331
  const byTool = groupBy(calls, 'tool');
  return Object.fromEntries(
    Object.entries(byTool).map(([tool, list]) => [
      tool,
      list.filter((c) => c.ok).length / list.length,   // the rate (L339)
    ]),
  );
}

// 3 · THE DECAY (L335) — the trend over time (L339).
//   toolHealth() week-over-week → the drift (L335)
//   the rate < 95% → the alert (L274)
//   → the rollback (L304) or the fix (L339)
```

```text
What the reader must SEE — the rate, watched:

  recordOutcome: ok + reason → the outcome (L339)
  categorize(err)            → the failure's category (L339)
  groupBy(tool) + rate       → the per-tool (L339)
  week-over-week drift       → the decay (L335)
  rate < 95% → alert         → the alarm (L274)

  The successes counted, the failures categorized, the decay paged (L339).
```

```narrate
4-15: The outcome — each call recorded with its success and its failure's category (L339).
17-26: The rate — the per-tool success computed (L339).
28-30: The decay — the trend watched and the drop alerted (L335, L274).
```

> [!TIP]
> The pair that defines the metric: **the categorized failure** (the directed fix, L339) and **the per-tool rate** (the location, L339). **Count the successes, categorize the failures, watch the per-tool rates, alert the decay — the agent's health (L339).**

## 14. Performance Notes

- **The recording is the call's latency (L339).** The outcome (L339) — the async (L222) write (L339) — the call (L315) unblocked (L339).
- **The rate is the query's cost (L339).** The aggregation (L339) — the batched (L339) computation (L339).
- **The decay is the watch's cost (L339).** The trend (L335) — the scheduled (L221) computation (L339).
- **The alert is the incident's speed (L274).** The drop (L339) — the page (L274) before the users (L162).

## 15. Debugging Scenarios

| Symptom | First check (L339) | The lever |
|---|---|---|
| The agent fails the tasks | The tool rate (L339) | The failing tool (L339) |
| The send_email fails | The API (L227) | The integration (L227) |
| The invalid args | The schema (L315) | The validation (L315) |
| The rate slipped | The decay (L335) | The model (L148), the API (L227) |
| The drop is silent | The alert (L274) | The threshold (L274) |

## 16. Quick Revision Notes

- The tool success rate = **the agent's tool metric** (L339): the rate, the failures, the decay.
- The rate: **the successes ÷ the calls — per tool and overall (L339)**.
- The failures: **the errors, the invalid args (L315), the timeouts (L339)**.
- The decay: **the rate's drift over time (L335)**.
- The causes: **the schema (L315), the model (L148), the API (L227)**.

## 17. Cheat Sheet

```text
TOOL SUCCESS RATE = the agent metric

THE RATE (L339)
  the successful calls ÷ the total calls (L339)
  the per-tool (L339) · the overall (L339)
  the agent's (L200) tool health (L339)

THE FAILURES (L339)
  the errors (L330) — the API's (L227) rejection (L339)
  the invalid arguments (L315) — the schema's (L315) violation (L339)
  the timeouts (L339) — the slow tool (L333)
  the category (L339) directs the fix (L339)

THE DECAY (L335)
  the rate's drift over time (L339)
  the API (L227) changing · the model (L148) drifting (L335)
  the schema (L315) breaking · the silent regression (L339)

THE USE (L339)
  the L340 input — the task's success (L340)
  the alert (L274) — the rate < the threshold → the page (L274)

INTERVIEW, 4 MOVES
  1 rate     "the successes ÷ the calls (L339)"
  2 failures "the errors, the args, the timeouts (L339)"
  3 decay    "the drift over time (L335)"
  4 causes   "the schema, the model, the API (L339)"
```

## 18. Key Takeaways

> [!RECAP]
> - The tool success rate is **the agent metric — how often the tools work, and how that decays** (L339): the rate (L339), the failures (L339), the decay (L335), and the causes (L339)
> - **The rate** (L339): the successful calls (L339) ÷ the total calls (L339) — the per-tool (L339) and the overall (L339)
> - **The failures** (L339): the errors (L330), the invalid arguments (L315), and the timeouts (L339) — categorized (L339) so the fix (L339) is directed (L339)
> - **The decay** (L335): the rate's drift over time (L339) — the API (L227) changing, the model (L148) drifting (L335), the schema (L315) breaking (L339)
> - **The causes** (L339): the schema (L315), the model (L148), and the API (L227) — the failure's root (L339)
> - The AI shape (L339): the agents (L200) with the tools (L315) — the success rate (L339) watched (L339): the per-tool (L339) and the overall (L339), the failures (L339) categorized (L339), and the decay (L339) alerted (L274) — the agent's (L200) health, tool-shaped (L339)

## Check your understanding

Answer these without looking back.

1. What's the rate (L339)?
2. Why the per-tool rate (L339)?
3. What causes the decay (L339)?
4. How does it feed the agent eval (L340)?
5. What's the failure's category (L339)?
6. What's the alert (L274)?
7. What's the audit (L322)?
8. What is the agent's tool metric (L339)?

## A Closing Note — The Log, Tallied

You now hold the metric: **the rate, the failures, the decay, and the causes — with the per-tool rates and the drop paged.** The courier log is tallied — and the slipping courier is found (L339).

Next: trajectories, task success, and the cost per completed task — Agent Evaluation (L340).
