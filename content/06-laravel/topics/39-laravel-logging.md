# Topic 39 — Laravel Logging

**Checklist anchor:** log channels · stacks · daily logs · syslog · Slack · context · log levels

**Owning lesson:** [131 Laravel Performance & Deployment](../131-performance-deployment.md)

---

## The one-sentence answer

**Logging is the observability floor — `Log::info`/`Log::error` with context — routed through channels to files, syslog, or Slack, so a production incident has a trail.**

## The mental model

```text
Log::error('Payment failed', ['order_id' => 7])
   ↓  (the channel stack)
   └─► storage/logs/laravel.log      (daily file)
   └─► syslog                        (system logs)
   └─► Slack                         (alert the team, via webhook)
```

The checklist's example is the shape: **message + context**. The message says what; the context says *which order, which user, which request*. Context is what turns a log line from noise into an investigation.

## How it works

### The levels

```php
Log::debug(...)     // dev detail
Log::info(...)      // normal events — order placed
Log::notice(...)    // notable but fine
Log::warning(...)   // recoverable problem — retry happening
Log::error(...)     // something failed — payment declined
Log::critical(...)  // app-level failure — the DB is down
Log::alert(...)     // immediate action needed
Log::emergency(...) // system unusable
```

### Context — the checklist's example

```php
Log::error('Payment failed', [
    'order_id' => $order->id,
    'user_id' => $order->user_id,
    'gateway' => 'stripe',
]);
// the context is what makes the line actionable:
// "which order? which user? which gateway? what did the provider say?"
```

### Channels & stacks

```php
// config/logging.php
'channels' => [
    'stack' => [                       // a STACK: send to several at once
        'driver' => 'stack',
        'channels' => ['daily', 'slack-alerts'],
    ],
    'daily' => ['driver' => 'daily', 'path' => storage_path('logs/laravel.log'), 'days' => 14],
    'slack' => ['driver' => 'slack', 'url' => env('LOG_SLACK_WEBHOOK_URL'), 'level' => 'critical'],
    'syslog' => ['driver' => 'syslog'],
],
```

| Channel | Where | Use |
|---|---|---|
| `single` / `daily` | One file / rotating daily files | The default — keep 14 days, then rotate |
| `stack` | Several channels at once | Normal → daily file, critical → also Slack |
| `slack` | A Slack webhook | Alerts at a threshold level |
| `syslog` | System log daemon | Ops pipelines |
| `null` | Nowhere | Tests — silence |

### Stacking by severity

The classic stack: everything to the daily file, **errors and up also to Slack**. One `Log::error()` lands in both — the file keeps the full trail, Slack gets the alert.

```php
'stack' => [
    'driver' => 'stack',
    'channels' => ['daily', 'slack'],
    // slack channel is configured with 'level' => 'error', so only
    // errors/critical go to Slack; info/debug stay in the file
],
```

## Interview questions

**Q1. How do you log in Laravel?**
> Through the `Log` facade — `Log::info('order placed', ['order_id' => $order->id])`. The message says what happened; the context array says which order, user, and gateway. Logs route through the configured channel stack — usually a daily file, with errors also forwarded to Slack or syslog.

**Q2. What are the log levels?**
> debug, info, notice, warning, error, critical, alert, emergency — in increasing severity. A channel configures the minimum level it accepts (`'level' => 'error'`), so debug noise stays in the file while only real problems reach Slack.

**Q3. What is a channel stack?**
> A channel that forwards to several others — `'channels' => ['daily', 'slack']`. One `Log::error()` hits both: the daily file keeps the full history, Slack gets the alert. Stacks let you fan out by destination and severity in one config.

**Q4. What should go in the context?**
> Everything needed to investigate without re-running: the record id (`order_id`), the actor (`user_id`), the service (`gateway`), and any provider response. A log line without context is a "something failed" with no follow-up — context is what makes it actionable.

**Q5. What shouldn't go in logs?**
> Secrets and PII — passwords, tokens, full credit-card numbers, raw user data. Logs are copied, retained, and sometimes shipped; treat them as a leak surface. Log the id, not the sensitive value (Lesson 37's posture).

**Senior follow-up: Logging vs metrics vs tracing — when is a log the right tool?**
> Logs answer "what happened on this specific request?" — the event trail. Metrics (throughput, p95, error rate) answer "is the system healthy?" — aggregated. Tracing answers "where did time go in this request?" — across services. The senior answer: all three, structured — logs with context, metrics for thresholds, traces for latency — and logging alone can't tell you the system is slow.

## Common mistakes

❌ `Log::error('Payment failed')` with no context — an unactionable line.

❌ Logging secrets/PII — a leak surface in a rotated file.

❌ `dd()`/`dump()` left in code — that's debug, not logging.

❌ All log levels going everywhere — the stack with severity thresholds is the point.

## Quick revision notes

- `Log::error('message', ['context' => ...])` — **message + context**
- Levels: debug → info → warning → **error** → critical → emergency
- Channels: `daily` (files) · `stack` (fan out) · `slack` (alerts) · `syslog` · `null` (tests)
- **Stack + severity**: everything to file, errors+ to Slack
- Never log **secrets/PII** — logs are a leak surface
- Logs = event trail; metrics = health; traces = latency — use all three

## Check your understanding

1. What makes a log line actionable?
2. How do the levels gate what a channel receives?
3. What does a stack give you that one channel can't?
4. What must never appear in a log line?
5. Where does logging stop being the right observability tool?
