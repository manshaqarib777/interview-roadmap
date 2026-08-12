# Topic 74 — System Design Questions

**Checklist anchor:** design a SaaS · a chat app · an e-commerce backend · a notification system · a payment system · an API handling 1M requests/day · a multi-tenant app · an AI support platform · a file-processing system · a job queue system

**Owning lesson:** [134 Multi-Tenancy & System Design](../134-multitenancy.md)

---

## The one-sentence answer

**System design interviews test the same architecture in different costumes — and the Laravel-shaped answer is the same skeleton every time: requirements → data model → the request path → the async path → the scale levers.**

## The mental model

Every design prompt maps to **one skeleton**:

```text
1. CLARIFY — what's in scope? (the product, the users, the scale)
2. DATA MODEL — the tables and relationships (the foundation)
3. REQUEST PATH — routes → controllers → services → queries → responses
4. ASYNC PATH — queues, jobs, events, workers (the background half)
5. SCALE LEVERS — caching, indexing, pagination, replicas, rate limits
```

The ten checklist prompts are that skeleton wearing different hats. Know the skeleton cold and you can answer any of them.

## The ten prompts, mapped to the skeleton

### 1. Design a SaaS application

- **Clarify:** multi-tenant (Lesson 72), billing, roles.
- **Data model:** users, tenants, plans, subscriptions.
- **The load-bearing answers:** multi-tenant isolation (global scope + context tenant — Lesson 72), Stripe webhook for the plan lifecycle (Lesson 71), roles/permissions (Lesson 18).

### 2. Design a chat application

- **Data model:** conversations, messages, participants.
- **The load-bearing answers:** WebSockets/broadcasting for delivery (Lesson 59/60), presence channels for "who's online", queues for fan-out, pagination/keyset for message history (Lesson 47).

### 3. Design an e-commerce backend

- **Data model:** products, orders, order_items, payments, inventory.
- **The load-bearing answers:** transactions + locking for the last-item oversell (Lessons 15/64), Stripe webhook for payment truth (Lesson 71), queues for confirmation email, indexes on the hot filters (Lesson 63).

### 4. Design a notification system

- **Data model:** notifications, channels, preferences.
- **The load-bearing answers:** Laravel notifications with channel per user (Lesson 30), queued delivery (Lesson 26), rate limits on sends, in-app via DB channel, realtime via broadcast (Lesson 59).

### 5. Design a payment system

- **Data model:** payments, refunds, ledger entries.
- **The load-bearing answers:** the webhook as truth (Lesson 71), idempotency on every boundary (Lesson 64), transactions for the ledger (Lesson 15), audit trail.

### 6. Design an API handling 1M requests/day

- **The load-bearing answers:** measure → cache → paginate → index → rate limit → queues → replicas (the Lesson 62 ladder, at scale). Stateless auth (Sanctum tokens, Lesson 19), Redis-backed rate limits shared across servers (Lesson 35), read replicas for the read-heavy path.

### 7. Design a multi-tenant Laravel application

- **The load-bearing answers:** shared DB + tenant_id by default (Lesson 72), global scope for isolation, composite indexes leading with tenant_id, per-tenant rate limits (Lesson 35), noisy-neighbour plan (replicas/isolation tiers).

### 8. Design an AI customer-support platform

- **The load-bearing answers:** the AI service behind an interface (Lesson 73), RAG over the support docs (pgvector), streaming for chat UX, queued embedding/summarization, the human handoff as a job/event.

### 9. Design a file-processing system

- **Data model:** files, jobs, processing state.
- **The load-bearing answers:** uploads → private storage + signed URLs (Lesson 36), the processing as a queued job (Lesson 26), status via events/broadcast (Lesson 59), idempotent reprocessing (Lesson 64), retention/purge jobs (Lesson 32).

### 10. Design a job queue system

- **The load-bearing answers:** Redis queue + Horizon (Lessons 26/27), retries/backoff/timeouts (Lesson 65), idempotent jobs, failed-job handling, batching/chains, the supervisor pattern in production.

## The interview shape (what to say out loud)

The senior answer is the **order**, said aloud:

> "Let me clarify scope: this is a multi-tenant SaaS, so isolation is the load-bearing requirement. The data model is tenants, users, plans, subscriptions — with `tenant_id` and composite indexes. The request path is routes → controllers → services → Eloquent with the tenant global scope. The async path: Stripe webhooks for billing, queued notifications. The scale levers: cache the hot reads, paginate the lists, index the filters, rate limit per tenant."

That's the whole method — and it's the same for all ten prompts. The specific load-bearing answers differ per domain (WebSockets for chat, transactions for e-commerce, RAG for AI); the skeleton doesn't.

## The load-bearing answers by domain (cheat sheet)

| Prompt | Load-bearing answers (the lessons that carry it) |
|---|---|
| SaaS | Multi-tenancy (72) · Stripe (71) · roles (18) |
| Chat | Broadcasting/Reverb (59/60) · presence · message pagination (47) |
| E-commerce | Transactions/locking (64) · Stripe webhook (71) · queues (26) |
| Notifications | Notifications (30) · queues (26) · broadcasting (59) |
| Payments | Stripe webhook + idempotency (71/64) · ledger transactions (15) |
| 1M req/day API | The performance ladder (62) · rate limits (35) · caching (33) · replicas |
| Multi-tenant app | Isolation by construction (72) · per-tenant limits (35) |
| AI support | AI service (73) · RAG/pgvector · streaming · queued embedding |
| File processing | Storage/signed URLs (36) · queued jobs (26) · idempotency (64) |
| Job queue | Redis + Horizon (26/27) · retries/backoff (65) · failed jobs |

## Interview questions

**Q1. How do you approach any system design question?**
> Clarify scope first — users, features, scale — then the skeleton: data model, request path, async path, scale levers. I say the order out loud so the interviewer can follow: "requirements, then the tables, then the request path, then the queues, then caching and limits." The prompt changes the details; the skeleton doesn't.

**Q2. What's the load-bearing requirement in an e-commerce design?**
> The last-item oversell — two users buying the same product concurrently. The answer layers: a transaction with `lockForUpdate()` (pessimistic) or a version check (optimistic), a DB constraint as the backstop, and the Stripe webhook as the payment truth (Lessons 64, 71). Everything else — products, carts, orders — is standard CRUD behind it.

**Q3. How do you design for 1M requests/day?**
> The performance ladder (Lesson 62) at scale: measure, then cache hot reads in Redis, paginate lists (cursor for deep), index the filtered columns, rate limit per user (Lesson 35), move side effects to queues, add read replicas, and monitor. Stateless Sanctum tokens so any server can serve any request (Lesson 19).

**Q4. What's the hardest part of a chat design?**
> Delivery and presence, not message storage. Messages need WebSockets/broadcasting (Lesson 59/60), presence channels for "who's online," and reliable fan-out — often queued. History is the easy half: keyset pagination on an indexed `(conversation_id, id)` (Lesson 47).

**Q5. How do you design a notification system?**
> One notification, many channels — Laravel notifications with `via()` per user (Lesson 30), queued delivery so the request doesn't wait (Lesson 26), the DB channel for the in-app bell, broadcast for realtime (Lesson 59), and rate limits on high-volume sends. Preferences and suppression are data-model decisions (channels + opt-outs).

**Senior follow-up: What do you do when you don't know the domain?**
> Say so, then decompose: every prompt reduces to the skeleton plus a load-bearing question. "I haven't built a chat app, but delivery is the interesting part — WebSockets, presence, fan-out." Naming the load-bearing requirement — even before knowing its details — is the senior tell; the interviewer watches you *find* the hard part, not recite the answer.

## Common mistakes

❌ Jumping to the database schema — clarify scope and name the load-bearing requirement first.

❌ Forgetting the async path — every real design has queues; a design with only request/response is incomplete (Lesson 26).

❌ "Add caching" without saying what and when — caching comes after the query work (Lesson 62's ladder).

❌ Ignoring failure — what happens when the webhook is late, Redis is down, a job retries (Lessons 65, 71)? The senior design includes the failure story.

## Quick revision notes

- **One skeleton, ten prompts**: clarify → data model → request path → async path → scale levers
- The load-bearing answer differs: **transactions** (e-commerce) · **WebSockets** (chat) · **webhooks** (payments) · **RAG** (AI) · **isolation** (SaaS/multi-tenant)
- Say the **order out loud** — the interviewer follows your structure
- **Async path** and the **failure story** are non-negotiable parts
- Don't know the domain? **Decompose it** — find the hard part, then the answer

## Check your understanding

1. Recite the five-part skeleton.
2. What's the load-bearing answer for e-commerce? For chat? For payments?
3. Why is the async path a mandatory part of any design?
4. What does "the failure story" add to a design?
5. How do you answer a design prompt for a domain you've never built?
