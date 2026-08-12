# Topic 75 — Senior Laravel Scenario Questions

**Checklist anchor:** the ten scenarios — 8s API · 50M users · overselling · 100k jobs · duplicate webhook · 10x traffic · broken deploy · tenant leak · Redis down · 20s external API — the decision rule, not the guess

**Owning lessons:** [120 Transactions & Concurrency](../120-transactions.md) · [131 Performance & Deployment](../131-performance-deployment.md) · [134 Multi-Tenancy & System Design](../134-multitenancy.md)

---

## The one-sentence answer

**The ten senior scenarios separate engineers from syntax specialists because each tests a decision rule — and every one has a known move you can rehearse, in the same shape: name the problem, then the fix, in order.**

## The mental model

These aren't trivia questions. Each scenario tests whether you can **decompose a production problem** under pressure — the shape is always:

```text
1. NAME what's actually happening (the failure mode)
2. ORDER the response (what first, what after)
3. DEFEND the fix (why this, not the alternative)
```

The checklist says it plainly: these separate senior engineers from Laravel syntax specialists. The syntax questions are Lesson 105–134; *these* are the ones where you show you can be handed a production system.

## The ten scenarios — the decision rules

### Scenario 1 — API response takes 8 seconds

**The move: measure first.**

> I'd start with the query log / profiler to see where the 8 seconds go — SQL, views, or bootstrap. The usual culprit is queries: an N+1 in a loop, a missing index, or loading too much. Then: eager-load (Lesson 11), index the filters (Lesson 63), paginate or select only what's needed (Lesson 12), cache the repeatable part (Lesson 33). The rule: the first fix is locating the time, never guessing.

### Scenario 2 — 50 million users; fetch them efficiently

**The move: never hydrate them all.**

> For a batch job: `chunkById` or `cursor()` — bounded memory, one row/batch at a time (Lessons 12, 46). For an API: paginate — `cursorPaginate` for keyset stability at depth (Lesson 47). Plus: `select` only the needed columns, and index the filter. The rule: a 50M-row table is never "fetched" — it's streamed or paged.

### Scenario 3 — Two users buy the same last product

**The move: the lock, plus the backstop.**

> A plain read-check-write races — both read stock=1, both pass, oversold (Lesson 64). The fix: a transaction with `lockForUpdate()` (the second buyer blocks, then sees 0) or an optimistic version check. The backstop: an atomic `update ... where stock > 0` or a `CHECK (stock >= 0)` constraint so a missed lock can't oversell. And the payment capture is idempotent (Lesson 71). The rule: lock, then constraint, then idempotency.

### Scenario 4 — Queue processing 100,000 jobs

**The move: measure the bottleneck, then scale the workers.**

> First, what's the bottleneck? If jobs are IO-bound (HTTP/SMTP), add workers — that scales. If they're DB-bound, more workers make the DB the bottleneck; batch the writes instead. Then: Horizon for supervision and auto-balancing (Lesson 27), Redis for the queue (Lesson 26), and watch failed jobs — a poison-pill job can stall the whole queue. The rule: scale the bottleneck, not blindly the workers.

### Scenario 5 — A Stripe webhook arrives twice

**The move: idempotency in the handler.**

> The handler is the source of truth (Lesson 71) — and it must be safe to run twice, because Stripe retries and duplicates are normal. Guard with `whereNull('paid_at')` before marking paid, or `firstOrCreate` on the event id (Lesson 64). A duplicate finds the work done and no-ops. The rule: idempotent handlers, always.

### Scenario 6 — API suddenly receives 10x traffic

**The move: protect the failure modes first, then scale.**

> The order: rate limit per user/IP (Lesson 35) so one source can't take everything down; cache hot reads so the DB doesn't melt (Lesson 33); check the DB — indexes and query counts decide whether it survives at all (Lessons 63, 11). Then scale: more app servers (stateless Sanctum tokens, Lesson 19) and read replicas. And watch the queue depth — if side effects are sync, 10x traffic means 10x synchronous load. The rule: protect first (limits, cache), scale second, monitor always.

### Scenario 7 — A Laravel deployment breaks production

**The move: roll back code instantly, plan data separately.**

> For code: instant rollback — the release symlink back to the previous release, workers restarted (Lessons 66, 68). For data: a code rollback doesn't undo a bad migration — restore from the backup taken *before* the deploy. The rule: code rolls back in seconds; data rolls back as far as the backup — that's why the plan exists before the deploy.

### Scenario 8 — A customer can see another tenant's data

**The move: treat it as a security incident, then find the unguarded path.**

> The immediate response: isolate — disable the affected path, revoke any suspect tokens (Lesson 19). Then find the leak: a query missing the tenant scope — a `where` that forgot `tenant_id`, or tenant from client input (Lesson 72). The fix is layering: the global scope on every tenant model (can't forget), tenant from request context (never client input), policies on top, scoped routes. The rule: the leak is a missing layer — find the layer, add it everywhere.

### Scenario 9 — Redis goes down

**The move: degrade, don't die.**

> The app stays up: cache falls back to the DB (Lesson 33), queues keep their jobs durable (Lesson 26), rate limiting loses its shared counter (Lesson 35 — per-server fallback or fail-open with care), sessions fall back if session driver is Redis. The incident is degraded throughput, not data loss — because the queue and the DB are durable. The rule: Redis is the fast path, never the source of truth — and the fallback path exists before the outage.

### Scenario 10 — An external API takes 20 seconds

**The move: never make the user wait on it.**

> Move it off the request path — a queued job with a `$timeout` that matches reality, `$tries` and `$backoff` for transient failures, and the result delivered when it's done (Lessons 26, 65). If the user must have *something* synchronously, cache the last good response (Lesson 33) or return a "processing" state. The rule: a 20-second external call is the definition of a job, not a request-time dependency.

## The one shape for all ten

Every answer follows the same three beats — that's what you rehearse:

| Beat | The move |
|---|---|
| **Name it** | The failure mode in one sentence ("this is a race," "this is an N+1," "this is a missing isolation layer") |
| **Order it** | What first, what after ("measure → fix the query → index" / "lock → constraint → idempotency") |
| **Defend it** | Why this move, not the shortcut ("caching before measuring caches the wrong thing") |

## Interview questions

**Q1. How do you prepare for scenario questions?**
> Rehearse the *shape*, not the specific answers. Every scenario decomposes the same way — name the failure mode, order the response, defend the fix. And each one maps to a lesson with a decision rule: transactions for overselling (64), the ladder for slow APIs (62), layered isolation for tenants (72), idempotency for webhooks (64/71). Know the rule, and the scenario is the rule wearing a costume.

**Q2. What separates a senior answer from a guess?**
> The order and the defence. A guess says "add Redis." A senior answer says "measure first — if it's SQL, Redis won't help; if it's bootstrap, then cache." The order proves you can decompose; the defence proves you can be handed a system. Wrong-but-transparent also beats right-by-luck (Lesson 104's rule): "I'd check X first" and being wrong about X is fine; pretending certainty isn't.

**Q3. Which scenarios share a move?**
> The concurrency trio — overselling (3), duplicate webhook (5), Redis down (9) — all run on idempotency and durability. The performance trio — slow API (1), 50M users (2), 10x traffic (6) — all start with measure-then-fix-then-scale. Grouping them by shared moves is the efficient way to rehearse: fewer rules, more coverage.

**Q4. What if the interviewer changes the scenario?**
> The shape survives. A new scenario ("a webhook is late," "a tenant's export is slow") still gets: name the failure mode, order the response, defend the fix. If the failure mode is familiar (latency, concurrency, isolation), the move transfers. If it's genuinely new, naming the *kind* of problem — "this is a consistency problem" — is already a senior answer.

**Q5. How do you keep the answers honest under pressure?**
> The three-beat shape is the pressure valve: saying "let me name what's happening first" buys the thinking time and structures the answer. And the honesty rule from Lesson 104 applies: "I'm not sure, here's my model of it" is a senior answer; bluffing a confident wrong answer is the only failure.

**Senior follow-up: Which scenario is the most important, and why?**
> The tenant leak (8) — because it's the one with real-world damage. Overselling and slow APIs cost money and time; a tenant leak is a trust and compliance event. The senior answer names the severity ordering: correctness of isolation first, then consistency, then performance — and the rehearsed move for the worst case is the one that matters most.

## Common mistakes

❌ Guessing instead of naming — "add Redis" without locating the problem is the guess the scenarios exist to filter.

❌ Skipping the order — "caching" before "measure" and "fix the query" is the wrong order (Lesson 62's ladder).

❌ Forgetting the failure story — a design answer without "what if the webhook is late?" is incomplete (Lesson 74).

❌ Bluffing — transparent "here's my model of it" beats confident-wrong (Lesson 104).

## Quick revision notes

- Ten scenarios, **three beats**: name the failure mode → order the response → defend the fix
- The shared moves: **idempotency** (webhook, oversell, Redis) · **measure-first** (slow API, 50M users, 10x traffic) · **layered isolation** (tenant leak) · **rollback plan** (deploy) · **queue the slow** (external API)
- Rehearse the **shape**, not the specific answers — new scenarios get the same treatment
- The severity order: **isolation > consistency > performance**
- Wrong-but-transparent beats right-by-luck — always

## Check your understanding

1. Recite the three-beat shape and apply it to scenario 1.
2. What's the shared move in scenarios 3, 5, and 9?
3. Why is the tenant leak the highest-severity scenario?
4. What does "order the response" add over a correct guess?
5. How do you answer a scenario you've never seen before?
