# Topic 64 — Transactions & Concurrency

**Checklist anchor:** race conditions · database locks · `lockForUpdate()` · deadlocks · optimistic vs pessimistic locking · idempotency · overselling

**Owning lesson:** [120 Database Transactions & Concurrency](../120-transactions.md)

---

## The one-sentence answer

**Concurrency control is making sure two simultaneous actions don't corrupt shared data — and the overselling scenario ("two users buy the last item") is the canonical question.**

## The mental model

The classic race:

```php
// two users both run this at the same time:
$product = Product::find($id);
if ($product->stock > 0) {          // both read stock = 1
    $product->stock -= 1;           // both write stock = 0
    $product->save();
    // both "succeeded" — ONE item sold TWICE
}
```

Read-check-write is the race: the check and the write are separate steps, and two requests can interleave between them. The fix is a **lock** — make the read-check-write atomic.

## The two locking strategies

### Pessimistic locking — lock the row

```php
DB::transaction(function () use ($id) {
    $product = Product::where('id', $id)->lockForUpdate()->first();
    // the row is LOCKED: the second user's read BLOCKS until the first commits

    if ($product->stock > 0) {
        $product->decrement('stock');
        // commit releases the lock → the second user now sees stock = 0
    }
});
```

- **`lockForUpdate()`** = "lock this row exclusively until I commit." The second transaction waits, then sees the updated value — the check now sees `0` and refuses.
- Cost: **contention** — concurrent buyers of the same row queue up. Fine for rare rows, wrong for hot rows (a like counter on a popular post).

### Optimistic locking — version column

```php
// migration: $table->integer('version')->default(0);

$product = Product::find($id);
if ($product->stock < 1) abort(409);

$updated = Product::where('id', $id)
    ->where('version', $product->version)   // only if unchanged
    ->update([
        'stock' => $product->stock - 1,
        'version' => $product->version + 1,
    ]);

if ($updated === 0) {
    abort(409); // someone else changed it — retry or reject
}
```

- The **`where('version', ...)`** makes the update affect 0 rows if someone else got there first. No lock, no waiting — the loser detects the conflict and retries or 409s.
- Cost: **retries** — the loser re-reads and re-attempts.

### Pessimistic vs optimistic — the trade

| | Pessimistic (`lockForUpdate`) | Optimistic (version) |
|---|---|---|
| Mechanism | Lock the row, block others | Version check, retry on conflict |
| Contention | Writers **wait** | Writers **retry** |
| Best for | Rare rows, low contention, must-be-atomic | Hot rows, high read:write, offline-tolerant |
| Failure mode | Deadlocks | Lost-update retries |

## Idempotency — the other half

Concurrency isn't just locks. If a webhook or retry fires twice, the second run must be a no-op:

```php
// Stripe webhook arrives twice (checklist Scenario 5):
$processed = WebhookEvent::firstOrCreate(['stripe_event_id' => $event->id]);
if (!$processed->wasRecentlyCreated) return;   // already handled — skip

// idempotency key on the API side:
$order = Order::firstOrCreate(['client_ref' => $request->header('Idempotency-Key')]);
```

**Idempotency** = an operation that produces the same result when run twice. It's the belt-and-suspenders that works even when a lock can't (across retries, duplicated webhooks, queue redelivery).

## The plain-JS model (what the exercise does)

```js
// the race:
let stock = 1;
function buy() {
  if (stock > 0) stock -= 1;     // two calls interleave → both "buy" the last item
}

// pessimistic (mutex):
function buyLocked() {
  withLock(() => { if (stock > 0) stock -= 1; });  // serialized
}

// optimistic (version):
function buyOptimistic(version) {
  return updateWhere(stock > 0 && version === myVersion)
    ? 'sold'
    : 'conflict — retry';
}
```

## Interview questions

**Q1. Two users purchase the last item simultaneously — what happens, and how do you prevent it?**
> With a plain read-check-write, both read stock=1, both pass the check, both decrement — oversold. The fix: pessimistic locking — `lockForUpdate()` inside a transaction makes the second buyer block until the first commits, then see stock=0 and refuse. Or optimistic locking — a version column makes the second update affect 0 rows, and the loser retries or gets a conflict. Which you pick: pessimistic for rare rows that must be exact; optimistic for hot rows where waiting is worse than retrying.

**Q2. What is a race condition?**
> When two processes read and write shared state in an order that corrupts it — the read-check-write of stock being the textbook case. The check and the write are separate steps, so they can interleave: both read 1, both write 0, one item sold twice. Locks or version checks make the steps atomic.

**Q3. What does `lockForUpdate()` do?**
> It takes an exclusive lock on the selected rows for the rest of the transaction. Other transactions trying to read-or-lock those rows block until the first commits. Inside a transaction, it turns read-check-write into a serialized unit — the second buyer sees the committed state, not the stale one.

**Q4. Optimistic vs pessimistic — how do you choose?**
> Pessimistic: lock and wait — best when contention is low and correctness is critical (inventory). Optimistic: version column and retry — best when a row is read by many and written by few (a counter, a profile), where locks would serialize everyone. Pessimistic trades waiting for certainty; optimistic trades retries for throughput.

**Q5. What is idempotency, and where does it matter?**
> An operation that's safe to run twice — the second run is a no-op or returns the same result. It matters at every retry boundary: Stripe webhooks (a `firstOrCreate` on the event id), queue redelivery, API retries with an `Idempotency-Key`. Locks protect *simultaneous* access; idempotency protects *repeated* delivery — you usually need both.

**Senior follow-up: How do you stop overselling across a queue of workers?**
> Same tools, one extra layer. Each worker runs the order in a transaction with `lockForUpdate()`, or an optimistic version update. Add a database constraint as the hard backstop — `CHECK (stock >= 0)` or an atomic `update ... set stock = stock - 1 where stock > 0` — so even a missed lock can't oversell. And make the payment capture idempotent so a retry can't double-charge. Locks first, constraints as the net, idempotency at the boundaries.

## Common mistakes

❌ Read-check-write without a lock — the race itself.

❌ Locking inside a long transaction — held locks invite deadlocks and block everyone (Lesson 15).

❌ Optimistic locking without a conflict handler — `$updated === 0` must retry or 409, not silently pass.

❌ Relying on locks *or* idempotency — simultaneous access needs locks; repeated delivery needs idempotency; both are part of the answer.

## Quick revision notes

- Race = **read-check-write interleaves** — the oversell bug
- **Pessimistic**: `lockForUpdate()` — block the second buyer until commit
- **Optimistic**: version column — second update affects 0 rows → retry/409
- Trade: **wait vs retry** — rare rows lock, hot rows version
- **Idempotency** = safe to run twice (`firstOrCreate` on webhook id, `Idempotency-Key`)
- Backstop: `CHECK (stock >= 0)` — constraints catch what locks miss

## Check your understanding

1. Walk through exactly how two users oversell the last item.
2. What does `lockForUpdate()` guarantee, and what does it cost?
3. Optimistic vs pessimistic — when is each the right trade?
4. What does idempotency protect that locks don't?
5. What's the layered answer to "prevent overselling"?
