# Lesson 255 — Idempotency

**Interview importance:** ⭐⭐⭐⭐⭐ — "what makes retries safe?" — the answer is *idempotency*: the retried call is safe to repeat — the key that makes the retries (L256) and the replay (L232) correct (L254).**

L254's async correctness is this lesson: **idempotency** — the property that makes the retries safe (L255): a retried call — the retry (L256), the redelivery (L245), the replay (L232) — is safe to repeat because the side effects are deduplicated (L255). The mechanism: the idempotency key (L255) — the client sends the key, the server dedupes (L255). The AI platform's shape: the payments (L227), the generations (L145), and the event consumers (L248) — all idempotent (L255).

The distinction this lesson is built on: a **demo** retries and double-applies. A **solutions architect** designs the idempotency: the key (L255), the dedupe store (L255), and the response replay (L255) — because the retries (L256) are only safe if the retried call is safe to repeat (L255).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain idempotency: the retried call is safe to repeat (L255)
- Explain the key: the client's dedupe identifier (L255)
- Explain the dedupe store: the key → the response (L255)
- Explain the response replay: the duplicate returns the first result (L255)
- Explain the AI shape: the payments, the generations, the events (L255)

## 1. One-Line Definition

**Idempotency is what makes the retries safe (L255) — a retried call — the retry (L256), the redelivery (L245), the replay (L232) — is safe to repeat because its side effects are deduplicated by the idempotency key (L255): the client sends the key, the server checks the dedupe store (L255), and the duplicate returns the first response (L255) — the correctness under the at-least-once world (L254).**

The one-sentence interview answer: *"Idempotency is the property that makes the retries safe (L255). A retried call — the retry (L256), the redelivered message (L245), the replayed job (L232) — is safe to repeat because its side effects are deduplicated (L255). The mechanism: the idempotency key (L255) — the client generates a key for the operation, and the server uses it to dedupe (L255). The flow: the first call arrives with the key — the server processes it and stores the key → the response in the dedupe store (L255); the retry arrives with the same key — the server finds the key and returns the stored response without re-processing (L255). The AI platform's shape: the payments (L227) — the retried charge doesn't double-bill (L255); the generations (L145) — the retried request doesn't double-generate (L255); and the event consumers (L248) — the redelivered event is a no-op (L255). Idempotency is the correctness under the at-least-once world (L254)."*

## 2. Mental Model

Think of idempotency as **the numbered order slips at the counter.** You place an order (the operation, L255) and the clerk writes the order number (the idempotency key, L255) on the slip. If you call again — "did my order go through?" (the retry, L256) — you give the same number, and the clerk checks the book (the dedupe store, L255): the order's already there, so the clerk tells you what happened the first time (the response replay, L255) — no double order (L255). The system works because the number makes the repeat identifiable (L255) — the counter knows the first order from the repeat (L255).

```text
   the numbered slips (the idempotency, L255)
   ┌────────────────────────────────────────────────────────┐
   │ the order number (the key, L255)                       │
   │ the book (the dedupe store, L255)                      │
   │ the repeat → the book says "already done" (L255)       │
   │ → the first response returned (L255)                   │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the numbered slips**: the key, the book, and the repeat answered with the first result (L255).

## 3. Visual Flow — The Idempotent Call

```text
   the client sends the operation (L255)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE KEY (L255)                                       │
   │     the client sends the idempotency key (L255)          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE DEDUPE CHECK (L255)                              │
   │     the key in the store? (L255)                         │
   │     yes → the stored response, no re-process (L255)      │
   │     no → process + store (L255)                          │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE RETRY (L256)                                     │
   │     the same key → the stored response (L255)            │
   │     — the retry is safe (L255)                           │
   └──────────────────────────────────────────────────────────┘
```

The flow is the counter: **key → dedupe check → process or replay** (L255).

## 4. How It Works — The Key, the Store, the Replay

- **The property (L255).** Idempotency: the operation's side effects are deduplicated (L255) — the retried call (L256), the redelivered message (L245), and the replayed job (L232) are all safe to repeat (L255).
- **The key (L255).** The client's identifier: the client generates a key for the operation (L255) — the payment's key, the generation's key (L255) — and sends it with the request (L255).
- **The dedupe store (L255).** The key → the response (L255): the first call processes and stores the mapping (L255); the duplicate finds the key (L255) — in Redis (L243) with the TTL (L243).
- **The response replay (L255).** The duplicate returns the stored response (L255) — without re-processing (L255): the same result, no double side effect (L255).
- **The AI shape (L255).** The payments (L227) — the retried charge doesn't double-bill (L255); the generations (L145) — the retried request doesn't double-generate (L255); and the event consumers (L248) — the redelivered event is a no-op (L255).

> [!NOTE]
> **Idempotency is the contract with the at-least-once world (L254, L255).** The retries (L256), the queue's redelivery (L245), and the replay (L232) all re-send the operation (L255). Without the key (L255), the re-send double-applies: the double charge, the double generation, the double write (L255). The senior design treats idempotency as the platform's contract (L255): every mutating operation carries a key (L255), the dedupe store (L255) remembers, and the retries are safe by construction (L256). Idempotency isn't one service's concern — it's the whole platform's correctness (L260).

## 5. Real Project Usage

- **The payments (L227).** The charge with the payment's key (L255) — the retried charge (L256) returns the first result, no double bill (L255).
- **The generations (L145).** The generation request with a key (L255) — the retry (L256) doesn't double-generate (L255) — the cost (L150) protected (L255).
- **The event consumers (L248).** The consumer dedupes by the event's ID (L255) — the redelivery (L245) is a no-op (L255).
- **The webhook handlers (L220).** The handler dedupes by the event ID (L255) — the provider's retries (L232) safe (L255).
- **Anything mutating (L260).** The idempotency (L255) is the L260 platform's correctness (L260) — every mutating operation keyed (L255).

The through-line: **the numbered slips** — the key, the store, and the replay making the retries safe (L255).

## 6. Interview Explanation

Say it in four moves:

1. **The property.** "The retried call is safe to repeat (L255)."
2. **The key.** "The client's identifier (L255) — sent with the request (L255)."
3. **The store.** "The key → the response (L255) — the duplicate finds it (L255)."
4. **The replay.** "The duplicate returns the first result (L255) — no double side effect (L255)."

## 7. Senior-Level Insights

- **Idempotency is the at-least-once contract (L254, L255).** The senior answer designs the key (L255) into every mutating operation (L255) — the retries (L256) and the replay (L232) safe by construction (L255).
- **The key is the client's generation (L255).** The client generates the key (L255) — the server dedupes on it (L255): the payment's ID, the request's UUID (L255).
- **The store is Redis with the TTL (L243).** The key → the response (L255) in Redis (L243) with the TTL (L243) — the dedupe window (L255), fast (L151).
- **The replay is the same result (L255).** The duplicate returns the stored response (L255) — the client's retry (L256) sees the first result (L255).
- **The scope is every mutating service (L255).** The payments (L227), the generations (L145), and the event consumers (L248) — the platform's correctness (L260).

## 8. Common Mistakes

- **The retries without the keys (L255).** The double charge, the double generation (L255) — the idempotency key (L255) missing (L255).
- **The key reused (L255).** The same key for different operations (L255) — the dedupe (L255) wrongly colliding (L255).
- **The store without the TTL (L243).** The keys growing forever (L150) — the TTL (L243) missing (L255).
- **The store not atomic (L255).** The concurrent duplicates both processing (L255) — the atomic check-and-set (L243) missing (L255).
- **The response not stored (L255).** The duplicate re-processes (L255) — the key without the response (L255).
- **The non-keyed operations (L255).** The mutating call without a key (L255) — the retry (L256) unsafe (L255).

## 9. Best Practices

- **Key every mutating operation** (L255) — the client's key (L255).
- **Store the key → the response** (L255) — in Redis (L243) with the TTL (L243).
- **Make the check-and-set atomic** (L243) — the concurrent duplicates (L255).
- **Replay the stored response** (L255) — the duplicate returns the first result (L255).
- **Size the TTL to the retry window** (L255) — the retries (L256) within the dedupe window (L255).
- **Include the events and the consumers** (L248) — the dedupe by the event ID (L255).

## 10. Interview Questions

**Q: What is idempotency?**
> A: The property that makes the retries safe (L255): a retried call (L256), a redelivered message (L245), or a replayed job (L232) is safe to repeat because its side effects are deduplicated (L255). The mechanism: the client sends an idempotency key (L255), and the server checks the dedupe store (L255) — the duplicate returns the first response without re-processing (L255).

**Q: Why are the retries unsafe without it?**
> A: Because the retry re-sends the operation (L256). Without the key (L255), the retried payment charges twice, the retried generation generates twice (L255) — the double side effect (L255). The key makes the repeat identifiable (L255): the server sees the same key and returns the stored response (L255). The retries (L256) are only safe if the retried call is safe to repeat (L255).

**Q: How does the dedupe store work?**
> A: The key → the response (L255). The first call processes and stores the mapping (L255) — in Redis (L243) with the TTL (L243). The duplicate finds the key (L255) and returns the stored response (L255) — no re-processing (L255). The check-and-set is atomic (L243) — the concurrent duplicates don't both process (L255).

**Q: What's the AI platform's idempotency?**
> A: Every mutating operation is keyed (L255): the payments (L227) — the retried charge doesn't double-bill (L255); the generations (L145) — the retried request doesn't double-generate, and the cost (L150) is protected (L255); and the event consumers (L248) — the redelivered event is deduplicated by its ID (L255). Idempotency is the platform's correctness under the at-least-once world (L260).

## 11. Follow-Up Questions

- What's the idempotency key (L255)?
- How does the dedupe store work (L255)?
- Why the atomic check-and-set (L243)?
- How does the response replay work (L255)?
- What's the TTL's role (L243)?

## 12. Comparison Table — Without vs With Idempotency

| | Without (L255) | With (this lesson) |
|---|---|---|
| The retry (L256) | double-applies | returns the first result (L255) |
| The payment (L227) | double charge | one charge (L255) |
| The generation (L145) | double cost (L150) | one generation (L255) |
| The event (L248) | double process | the no-op (L255) |
| The correctness (L260) | accidental | by construction (L255) |

The senior read: **the right column is the contract** — the retries safe by construction (L255).

## 13. Code Example — The Idempotent Endpoint

```js
// Idempotency: the key, the dedupe store, the replay (L255).
export async function POST(req) {
  const body = await req.json();
  const key = req.headers.get('Idempotency-Key') ?? body.key;   // the client's key (L255)
  if (!key) return error(400, 'Idempotency-Key required');       // the contract (L255)

  // THE DEDUPE CHECK (L255) — the atomic check-and-set (L243).
  const stored = await redis.get(`idem:${key}`);
  if (stored) return JSON.parse(stored);                        // the replay (L255)

  // The lock — the concurrent duplicates don't both process (L243, L255).
  const lock = await redis.set(`lock:${key}`, '1', { NX: true, EX: 10 });
  if (!lock) {
    // The other request is processing — wait for the stored result (L255).
    const result = await waitFor(`idem:${key}`, 10_000);
    return JSON.parse(result);
  }

  try {
    const result = await processOperation(body);               // the work (L145, L227)
    await redis.set(`idem:${key}`, JSON.stringify(result), { EX: ttl });  // the store (L255)
    return result;
  } finally {
    await redis.del(`lock:${key}`);
  }
}
```

```text
What the reader must SEE — the numbered slips:

  Idempotency-Key      → the client's identifier (L255)
  redis.get(idem:key)  → the dedupe check (L255)
  the NX lock          → the concurrent duplicates (L243)
  redis.set(idem:key)  → the store + the replay (L255)

  The repeat finds the book — the first result, no double work.
```

```narrate
4-6: The key — the client's identifier, required by the contract (L255).
8-10: The dedupe check — the stored result returned, the replay (L255).
12-18: The atomic guard — the NX lock (L243) prevents the concurrent duplicates from both processing (L255).
20-24: The process and the store — the work (L145) and the key → the response (L255).
25-26: The cleanup — the lock released (L255).
```

> [!TIP]
> The pair that defines the correctness: **`redis.get(idem:${key})`** (the dedupe check, L255) and **`redis.set(..., { NX: true, EX: 10 })`** (the atomic guard, L243). **The book remembers and the lock prevents the double-entry — the retries safe by construction (L255).**

## 14. Performance Notes

- **The dedupe check is fast (L151).** The Redis get (L243) — the sub-millisecond check (L255).
- **The store is the memory cost (L150).** The key → the response (L255) with the TTL (L243) — the memory bounded (L150).
- **The atomic lock is the concurrency's correctness (L243).** The NX set (L243) — the concurrent duplicates serialized (L255).
- **The TTL is the retry window (L255).** Sized to the retries (L256) — the retry within the dedupe window finds the stored result (L255).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The double charge | No key (L255) | The Idempotency-Key (L255) |
| The duplicates both process | No atomic lock (L243) | The NX set (L255) |
| The store grows | No TTL (L243) | The expiry (L255) |
| The replay is wrong | The response not stored (L255) | The store (L255) |
| The keys collide | The key reused (L255) | The client's key generation (L255) |

## 16. Quick Revision Notes

- Idempotency = **the retried call is safe to repeat** (L255).
- The key: **the client's identifier** (L255), sent with the request (L255).
- The store: **the key → the response** (L255), in Redis (L243) with the TTL (L243).
- The replay: **the duplicate returns the first result** (L255).
- The atomicity: **the NX lock (L243) — the concurrent duplicates** (L255).
- The AI shape: **the payments (L227), the generations (L145), the events (L248)**.

## 17. Cheat Sheet

```text
IDEMPOTENCY = the retried call is safe to repeat

THE PROPERTY (L255)
  the retry (L256) · the redelivery (L245) · the replay (L232)
  are safe because the side effects are deduplicated (L255)

THE MECHANISM (L255)
  the key     the client's identifier, sent with the request (L255)
              the payment's ID · the request's UUID (L255)
  the store   the key → the response (L255)
              in Redis (L243) with the TTL (L243)
  the replay  the duplicate returns the first result (L255)
              without re-processing (L255)

THE ATOMICITY (L243)
  the NX lock — the concurrent duplicates don't both process (L255)
  the check-and-set, atomic (L243)

THE AI SHAPE (L255)
  the payments (L227)   — no double bill (L255)
  the generations (L145) — no double generate, the cost protected (L150)
  the events (L248)     — the redelivery is a no-op (L255)

THE RULE (L254)
  the retries are only safe if the retried call is safe to repeat (L255)
  idempotency is the platform's correctness under at-least-once (L260)

INTERVIEW, 4 MOVES
  1 property "the retried call is safe to repeat (L255)"
  2 key      "the client's identifier (L255)"
  3 store    "the key → the response (L255), atomic (L243)"
  4 replay   "the duplicate returns the first result (L255)"
```

## 18. Key Takeaways

> [!RECAP]
> - Idempotency is **what makes the retries safe** (L255): the retried call (L256), the redelivered message (L245), and the replayed job (L232) are safe to repeat because their side effects are deduplicated (L255)
> - **The mechanism is the key** (L255): the client generates an idempotency key (L255), and the server uses it to dedupe (L255)
> - **The dedupe store** (L255): the key → the response (L255), in Redis (L243) with the TTL (L243) — and the atomic NX lock (L243) prevents the concurrent duplicates from both processing (L255)
> - **The replay** (L255): the duplicate returns the stored response (L255) — the same result, no double side effect (L255)
> - **The AI shape** (L255): the payments (L227) don't double-bill, the generations (L145) don't double-generate (protecting the cost, L150), and the event consumers (L248) treat the redelivery as a no-op (L255)
> - Idempotency is **the platform's correctness under the at-least-once world** (L254, L260) — every mutating operation keyed (L255)

## Check your understanding

Answer these without looking back.

1. What's the idempotency property (L255)?
2. What's the key (L255)?
3. How does the dedupe store work (L255)?
4. Why the atomic lock (L243)?
5. What's the replay (L255)?
6. What's the TTL's role (L243)?
7. What's the AI shape (L255)?
8. Why is it the platform's correctness (L260)?

## A Closing Note — The Numbered Slips

You now hold the correctness: **the key that identifies the repeat, the store that remembers the result, and the replay that returns it — the retries safe by construction.** The platform's mutating operations now have their numbered slips (L255).

Next: the retries themselves — retries & backoff (L256), the bounded, jittered, logged policy.
