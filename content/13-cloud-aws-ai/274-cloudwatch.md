# Lesson 274 — CloudWatch

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you see what the AWS app is doing?" — the answer is *CloudWatch*: logs, metrics, alarms — the AWS observability floor (L274).**

L213 built the observability discipline (L213); this lesson is **its AWS implementation**: CloudWatch — the observability floor: the logs (the structured records, L329), the metrics (the counters and the gauges, L331), and the alarms (the thresholds and the actions, L274). The AI platform's shape: the Lambda's logs (L266), the model call metrics (L332), the cost and the latency (L333), and the alarms (L274) that page the on-call (L274). This lesson is the L213 observability, AWS-shaped (L274).

The distinction this lesson is built on: a **demo** prints to the console. A **solutions architect** designs the observability (L274): the structured logs (L329), the metrics (L331), and the alarms (L274) — because the L260 backend's health (L260) is the CloudWatch's (L274).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the logs: the structured records (L329)
- Explain the metrics: the counters and the gauges (L331)
- Explain the alarms: the thresholds and the actions (L274)
- Explain the dashboards: the L213 view (L213)
- Explain the AI shape: the observability of the L260 backend (L274)

## 1. One-Line Definition

**CloudWatch is the AWS observability floor (L274) — the logs (the structured records: the Lambda's logs L266, the model calls L329, with the sensitive data redacted L313), the metrics (the counters and the gauges: the invocations, the errors, the latency L333, the tokens L332), and the alarms (the thresholds with the actions: the alert, the auto-scaling L271, the incident L274) — the L213 observability, AWS-shaped (L274).**

The one-sentence interview answer: *"CloudWatch is AWS's observability service (L274). The three layers: the logs (L274) — the structured records every service writes: the Lambda's logs (L266), the API Gateway's access logs (L267), the model call records (L329) — searched with Logs Insights (L274); the metrics (L274) — the numbers: the invocations, the errors, the latency (L333), the token usage (L332) — the counters and the gauges (L331); and the alarms (L274) — the thresholds with the actions: the error rate over 1% alarms (L274) and the SNS (L270) pages the on-call (L274), or the auto-scaling (L271) adjusts (L274). The dashboards (L274) assemble the view — the L213 trace's summary (L213). The AI shape: the model call metrics (L332) — the tokens, the cost (L334), the latency (L333) — the per-tenant view (L320); and the alarms (L274) — the error spike, the cost spike, the queue depth (L270) — the L260 backend's health (L260) is the CloudWatch's (L274)."*

## 2. Mental Model

Think of CloudWatch as **the building's control room.** The control room (L274) watches the whole building (the AWS app, L274): the security cameras (the logs, L329) record everything — the front desk (the API Gateway, L267), the floors (the Lambdas, L266), the mailroom (the queues, L270) — searchable later (L274). The gauges (the metrics, L331) show the numbers — the people per floor (the invocations), the stuck elevators (the errors), the wait times (the latency, L333) (L274). And the alarms (L274) ring when the numbers cross the line: the crowd over the limit (the error rate, L274) triggers the response — the announcement (the SNS, L270) or the extra staff (the auto-scaling, L271). The control room works because the cameras record, the gauges measure, and the alarms act (L274).

```text
   the control room (CloudWatch, L274)
   ┌────────────────────────────────────────────────────────┐
   │ the cameras (the logs, L329) — the structured records  │
   │ the gauges (the metrics, L331) — the numbers           │
   │ the alarms (L274) — the thresholds + the actions       │
   │ the screens (the dashboards, L274) — the L213 view     │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the control room**: the cameras, the gauges, the alarms, and the screens (L274).

## 3. Visual Flow — One Incident

```text
   the app runs (L274)
        │
        ▼
   ┌────────────────────── THE LOGS (L329) ────────────────────────────┐
   │  the Lambda's logs (L266) · the API logs (L267) · the model      │
   │  calls (L329) — structured, searchable (L274)                    │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE METRICS (L331) ─────────────────────────┐
   │  the invocations · the errors · the latency (L333) · the tokens  │
   │  (L332) — the counters and the gauges (L331)                     │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE ALARM (L274) ───────────────────────────┐
   │  the error rate > 1% for 5 minutes (L274)                        │
   │  the action: the SNS (L270) → the on-call (L274) · or the        │
   │  auto-scaling (L271) adjusts (L274)                              │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the incident: **log → metric → alarm → action** (L274).

## 4. How It Works — The Floor, Part by Part

- **The logs (L329).** The structured records (L329): every service writes them (L274) — the Lambda's logs (L266), the API Gateway's access logs (L267), the model call records (L329). The Logs Insights (L274) searches them (L274); the sensitive data (L313) is redacted before the write (L329).
- **The metrics (L331).** The numbers (L331): the invocations, the errors, the latency (L333), the token usage (L332) — the counters and the gauges (L331). The custom metrics (L274) carry the app's own numbers (L274).
- **The alarms (L274).** The thresholds with the actions (L274): the error rate over 1% for 5 minutes (L274) → the SNS (L270) → the on-call (L274); or the auto-scaling (L271) adjusts (L274). The alarm is the incident's start (L274).
- **The dashboards (L274).** The assembled view (L274): the logs, the metrics, and the alarms on one screen (L274) — the L213 summary (L213).

> [!NOTE]
> **The logs tell the story; the metrics tell the numbers; the alarms tell the actions (L274).** The senior answer separates the three (L274): the logs (L329) are the record — searchable when the incident needs the detail (L274); the metrics (L331) are the numbers — the trends and the thresholds (L274); the alarms (L274) are the actions — the alert and the response (L274). The AI app's observability (L213) is the three, together (L274).

## 5. Real Project Usage

- **A serverless AI stack (L283).** The Lambda's logs (L266) and the model call metrics (L332) in CloudWatch (L274) — the tokens, the cost (L334), the latency (L333).
- **A production AI SaaS (L357).** The per-tenant metrics (L320) — the tokens per tenant (L332), the cost per tenant (L334), the alarms per tenant (L274).
- **An auto-scaling service (L271).** The ECS service (L271) scaling on the CloudWatch metrics (L274) — the CPU, the queue depth (L270).
- **An incident response (L274).** The alarm (L274) → the SNS (L270) → the on-call (L274) — the pager (L274).
- **Anything on AWS (L274).** The observability floor (L274) — the logs, the metrics, and the alarms (L274).

The through-line: **the observability floor is the app's health** — the logs record, the metrics measure, the alarms act (L274).

## 6. Interview Explanation

Say it in four moves:

1. **The logs.** "The structured records — the Lambda's, the API's, the model calls (L329)."
2. **The metrics.** "The numbers — the invocations, the errors, the latency (L333), the tokens (L332)."
3. **The alarms.** "The thresholds with the actions — the SNS (L270) to the on-call (L274)."
4. **The dashboards.** "The L213 view, assembled (L274)."

## 7. Senior-Level Insights

- **The observability is the product's health (L213).** The senior answer makes the AI metrics (L332) first-class (L274): the tokens, the cost (L334), the latency (L333) — the L260 backend's health (L260) is the CloudWatch's (L274).
- **The redaction is the privacy's baseline (L313).** The logs (L329) redact the sensitive data (L313) before the write (L274) — the L312 data leakage (L312), log-shaped (L274).
- **The alarm is the incident's start (L274).** The error-rate alarm (L274) — the SNS (L270) to the on-call (L274) — the incident (L274) begins with the alarm (L274).
- **The custom metrics are the app's truth (L274).** The token usage (L332) and the cost (L334) as the custom metrics (L274) — the L328 observability (L328), AWS-shaped (L274).
- **The metric is the scaling's input (L271).** The ECS (L271) and the Lambda (L266) scaling on the CloudWatch metrics (L274) — the queue depth (L270) and the latency (L333).

## 8. Common Mistakes

- **The console.log only (L329).** The unstructured prints (L329) — the L329 structured logs (L329) missing (L274).
- **The secrets in the logs (L313).** The API keys (L275) and the PII (L313) logged (L274) — the L312 leakage (L312).
- **No alarms (L274).** The errors visible only after the user reports (L274) — the incident (L274) undetected.
- **The metrics without the cost (L334).** The tokens and the cost (L332) unmeasured (L274) — the L334 attribution (L334) impossible.
- **The alarm without the action (L274).** The threshold with no SNS (L270) — the alarm rings, nobody hears (L274).

## 9. Best Practices

- **Log structured** (L329) — the JSON records, searchable (L274).
- **Redact the sensitive data** (L313) — before the write (L329).
- **Measure the AI metrics** (L332) — the tokens, the cost (L334), the latency (L333).
- **Alarm with the action** (L274) — the SNS (L270) to the on-call (L274), the auto-scaling (L271).
- **Dashboard the L213 view** (L274) — the logs, the metrics, and the alarms together (L274).

## 10. Interview Questions

**Q: Walk me through CloudWatch.**
> A: The observability floor (L274). The logs — the structured records, searchable (L329). The metrics — the invocations, the errors, the latency (L333), the tokens (L332). The alarms — the thresholds with the actions, the SNS (L270) to the on-call (L274). And the dashboards — the L213 view (L274).

**Q: How do you monitor an AI app?**
> A: With the AI metrics (L274): the token usage per request (L332), the cost (L334), the latency and the TTFT (L333), the error rate (L274) — the custom metrics (L274) carrying the L328 observability (L328). The alarms (L274) watch the thresholds; the dashboards (L274) assemble the view (L274).

**Q: What's in the logs?**
> A: The structured records (L329): the Lambda's logs (L266), the API Gateway's access logs (L267), the model call records — the prompt hash, the tokens, the latency (L329) — with the sensitive data (L313) redacted before the write (L329). The Logs Insights (L274) searches them when the incident needs the detail (L274).

**Q: What does an alarm do?**
> A: The threshold with the action (L274): the error rate over 1% for 5 minutes (L274) triggers the SNS (L270) — the on-call is paged (L274); or the auto-scaling (L271) adjusts (L274). The alarm is the incident's start (L274).

## 11. Follow-Up Questions

- What are the logs (L329)?
- What are the metrics (L331)?
- What's an alarm (L274)?
- How do you monitor an AI app (L274)?
- What's in the model call log (L329)?

## 12. Comparison Table — The Three Layers

| Layer (L274) | What it is (L274) | The AI use (L274) |
|---|---|---|
| Logs (L329) | the structured records (L329) | the model calls, the prompts (hashed), the tokens (L329) |
| Metrics (L331) | the counters and the gauges (L331) | the tokens (L332), the cost (L334), the latency (L333) |
| Alarms (L274) | the thresholds with the actions (L274) | the error spike → the on-call (L274) |
| Dashboards (L274) | the assembled view (L274) | the L213 summary (L213) |

The senior read: **the layers compose** — the logs for the detail, the metrics for the trends, the alarms for the actions (L274).

## 13. Code Example — The Observability, Declared

```js
// The observability floor (L274) — the logs, the metrics, the alarms (L274).
// THE LOG (L329) — the structured record, the sensitive data redacted (L313).
console.log(JSON.stringify({
  level: 'info',
  event: 'model_call',
  requestId: req.id,                       // the trace (L213)
  promptHash: hash(prompt),                // the prompt hashed (L313)
  tokens: usage.total,                     // the tokens (L332)
  latencyMs: Date.now() - started,         // the latency (L333)
  cost: costOf(usage),                     // the cost (L334)
}));

// THE METRIC (L331) — the custom metric for the AI (L274).
await cloudwatch.putMetricData({
  namespace: 'AI',
  metrics: [
    { name: 'Tokens',      value: usage.total, unit: 'Count' },       // L332
    { name: 'Cost',        value: costOf(usage), unit: 'USD' },       // L334
    { name: 'TTFT',        value: ttftMs, unit: 'Milliseconds' },     // L333
    { name: 'ErrorRate',   value: ok ? 0 : 1, unit: 'Count' },        // L274
  ],
});

// THE ALARM (L274) — the threshold with the action (L274).
await cloudwatch.putMetricAlarm({
  metric: 'ErrorRate', threshold: 0.01, period: 300,   // 1% over 5 min (L274)
  actions: [snsOnCall],                                 // the SNS → the pager (L270, L274)
});
```

```text
What the reader must SEE — the floor, declared:

  JSON log with promptHash + tokens → the structured record (L329)
  putMetricData: Tokens, Cost, TTFT  → the AI metrics (L332, L334, L333)
  ErrorRate > 1% → SNS → on-call     → the alarm with the action (L274)

  Logged, measured, and alarmed — the L260 health (L274).
```

```narrate
3-11: The log — the structured record with the hashed prompt, the tokens, the latency, and the cost (L329, L332).
13-21: The metrics — the custom AI metrics: the tokens, the cost, the TTFT, and the error rate (L331, L332).
23-27: The alarm — the error-rate threshold with the SNS action to the on-call (L274, L270).
```

> [!TIP]
> The pair that defines CloudWatch: **the structured log** (the record, L329) and **the alarm with the action** (the response, L274). **Log structured, measure the AI, alarm with the action — the L213 observability, AWS-shaped (L274).**

## 14. Performance Notes

- **The log is the debug's cost (L274).** The structured logs (L329) — the volume (L274) is the bill's line (L285); the sampling (L274) bounds it (L274).
- **The metric is the scale's input (L271).** The CloudWatch metrics (L274) drive the ECS (L271) and the Lambda (L266) scaling (L274) — the queue depth (L270) and the latency (L333).
- **The alarm is the incident's speed (L274).** The threshold and the period (L274) — the detection (L274) is the alarm's design (L274).
- **The dashboard is the review's view (L274).** The assembled screen (L274) — the L213 summary (L213) at a glance (L274).

## 15. Debugging Scenarios

| Symptom | First check (L274) | The lever |
|---|---|---|
| The errors are invisible | The alarms (L274) | The error-rate alarm (L274) |
| The incident has no detail | The logs (L329) | The structured logs (L329) |
| The cost is unexplained | The metrics (L334) | The per-request cost (L334) |
| The scale is wrong | The metrics (L274) | The queue depth (L270), the latency (L333) |
| The secrets are in the logs | The redaction (L313) | The redact-before-write (L329) |

## 16. Quick Revision Notes

- CloudWatch = **the observability floor** (L274): the logs, the metrics, the alarms, the dashboards.
- The logs: **the structured records (L329) — searchable (L274)**.
- The metrics: **the counters and the gauges (L331) — the tokens (L332), the cost (L334), the latency (L333)**.
- The alarms: **the thresholds with the actions (L274) — the SNS (L270) to the on-call (L274)**.
- The dashboards: **the L213 view, assembled (L274)**.

## 17. Cheat Sheet

```text
CLOUDWATCH = the AWS observability floor — the L213 shape, AWS-made

THE LOGS (L329)
  the structured records — the Lambda (L266), the API (L267),
  the model calls (L329)
  the sensitive data redacted before the write (L313)

THE METRICS (L331)
  the invocations · the errors · the latency (L333)
  the tokens (L332) · the cost (L334) — the custom metrics (L274)

THE ALARMS (L274)
  the thresholds with the actions (L274)
  the error rate > 1% → the SNS (L270) → the on-call (L274)
  or the auto-scaling (L271) adjusts (L274)

THE DASHBOARDS (L274)
  the logs + the metrics + the alarms — one screen (L274)

THE AI SHAPE (L274)
  the model call metrics (L332) — the per-tenant view (L320)
  the alarms — the error, the cost, the queue depth (L270)

INTERVIEW, 4 MOVES
  1 logs    "the structured records (L329)"
  2 metrics "the tokens, the cost, the latency (L332, L334, L333)"
  3 alarms  "the thresholds with the actions (L274)"
  4 dashboards "the L213 view (L274)"
```

## 18. Key Takeaways

> [!RECAP]
> - CloudWatch is **the AWS observability floor** (L274): the logs (L329), the metrics (L331), the alarms (L274), and the dashboards (L274)
> - **The logs** (L329) are the structured records — the Lambda's (L266), the API Gateway's (L267), the model calls (L329) — with the sensitive data (L313) redacted before the write (L329)
> - **The metrics** (L331) are the counters and the gauges — the invocations, the errors, the latency (L333), and the AI's own: the tokens (L332) and the cost (L334)
> - **The alarms** (L274) are the thresholds with the actions — the error rate over 1% (L274) triggers the SNS (L270) to the on-call (L274), or the auto-scaling (L271) adjusts
> - **The dashboards** (L274) assemble the L213 view (L213) — the logs, the metrics, and the alarms on one screen
> - The AI shape (L274): the model call metrics (L332), the per-tenant view (L320), and the alarms for the errors, the cost (L334), and the queue depth (L270) — the L260 backend's health (L260) is the CloudWatch's (L274)

## Check your understanding

Answer these without looking back.

1. What are the logs (L329)?
2. What are the metrics (L331)?
3. What's an alarm (L274)?
4. How do you monitor an AI app (L274)?
5. What's in the model call log (L329)?
6. What's the redaction for (L313)?
7. What drives the auto-scaling (L271)?
8. What is the L213 observability, AWS-shaped (L274)?

## A Closing Note — The Control Room, Manned

You now hold the observability floor: **the logs, the metrics, the alarms, and the dashboards — with the AI metrics first-class and the incidents starting at the alarm.** The L260 backend has its health — and the control room is watching (L274).

Next: where the API keys and the DB passwords actually live — Secrets Manager (L275).
