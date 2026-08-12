# Topic 15 — Database Transactions

**Checklist anchor:** `DB::transaction()` · atomicity · rollback · deadlocks · nested transactions · when they're necessary

**Owning lesson:** [120 Database Transactions & Concurrency](../120-transactions.md)

---

## The one-sentence answer

**A transaction groups multiple database writes into one atomic unit — either all of them commit or none of them do.**

## The mental model

The classic multi-write flow:

```text
Create order
 ↓
Create payment
 ↓
Reduce inventory
 ↓
Send confirmation
```

If the inventory update fails *after* the order and payment were written, you've got a half-done order — the customer is charged and the stock is wrong. A transaction fixes that:

```php
DB::transaction(function () {
    Order::create($orderData);          // 1
    Payment::create($paymentData);      // 2
    Inventory::decrement('stock', 1);   // 3 — if this throws…
    // …1 and 2 ROLL BACK automatically
});
```

**Atomicity** is the whole point: the three writes behave as one. Any failure inside the closure rolls everything back, and the exception propagates for you to handle.

## How it works

### The three forms

```php
DB::transaction(function () { /* all-or-nothing */ });

// with retries for deadlocks:
DB::transaction(function () { /* ... */ }, 3);   // retry up to 3 times

// manual control:
DB::beginTransaction();
try {
    // writes
    DB::commit();
} catch (\Throwable $e) {
    DB::rollBack();
    throw $e;
}
```

### Nested transactions

```php
DB::transaction(function () {
    // outer work
    DB::transaction(function () { /* "nested" */ });
});
```

Laravel's nested transactions **aren't real savepoints by default** — the inner "transaction" joins the outer one. The inner commit is a no-op; only the outer commit actually writes. (Savepoints are available, but the default mental model is: nesting shares the outer transaction.)

### Deadlocks

Two transactions waiting on each other's locks:

```text
T1: locks row A, wants row B
T2: locks row B, wants row A
→ the DB kills one; the other proceeds
```

The `DB::transaction(fn, 3)` retry parameter exists for this: on a deadlock, Laravel retries the whole closure. Design also matters — consistent lock ordering prevents most deadlocks.

### When transactions are necessary

| When | Why |
|---|---|
| Multi-table writes that must match | Order + payment + inventory |
| Money moves | Debit + credit must be atomic |
| Any invariant across rows | Balance must never go negative mid-write |
| Batch operations | Import N rows — all or none |

| When they're NOT the tool | Why |
|---|---|
| Email / external calls inside | External side effects can't be rolled back — send them after commit, or queue them (Lesson 26) |
| Long-running work inside | Holding locks for seconds invites deadlocks; keep transactions short |
| Reads with no writes | Nothing to roll back |

## The plain-JS model (what the exercise does)

```js
function runTransaction(operations) {
  const snapshot = {};            // "database" state before
  try {
    operations();                 // all writes
    return { committed: true };   // commit
  } catch (err) {
    return { committed: false, rolledBack: true, error: err.message };
  }
}
```

## Interview questions

**Q1. What is a transaction, and why do you need one?**
> A group of writes that must all succeed or all fail. `DB::transaction(fn)` commits if the closure completes and rolls everything back if it throws. Without it, a failure mid-flow leaves a half-written state — a charged customer with no order, or an order with no inventory deduction.

**Q2. What happens if the inventory update fails?**
> The exception propagates, the transaction rolls back — the order and payment writes are undone — and the exception reaches your handler to log/report. The customer is not left with a partial order, and the inventory is untouched. That's atomicity in action.

**Q3. What are deadlocks?**
> Two transactions each holding a lock the other needs. The DB detects the cycle, kills one transaction (usually the one holding fewer locks), and the other proceeds. You handle it by retrying (`DB::transaction(fn, 3)`) and by locking rows in a consistent order so cycles don't form.

**Q4. How do nested transactions work?**
> Laravel's inner `DB::transaction` joins the outer one rather than creating a real savepoint by default — the inner commit is a no-op, and only the outer transaction actually commits. So nesting is safe for organizing code, but the atomicity boundary is the outermost call.

**Q5. What should NOT go inside a transaction?**
> External side effects — emails, HTTP calls — because they can't be rolled back. If the transaction retries or rolls back, the email already went out. The pattern is: do the DB writes in the transaction, commit, *then* dispatch the side effects (often to a queue, Lesson 26). Also: keep transactions short — long-held locks invite deadlocks.

**Senior follow-up: The two-users-buy-the-last-item scenario.**
> Two users read "1 item left", both try to buy. With plain reads, both succeed past the check — oversell. The fix is locking: `Product::where('id', $id)->lockForUpdate()->first()` inside a transaction (pessimistic — the second user blocks until the first commits, then sees 0), or optimistic locking (a version column; the second writer's update affects 0 rows and gets retried/rejected). Lesson 120 has both in depth — this is the single most-asked senior scenario.

## Common mistakes

❌ Putting external calls (email, HTTP) inside the transaction — they can't roll back.

❌ Long transactions — locks held for seconds invite deadlocks and block other writers.

❌ Catching inside the transaction and swallowing the error — the rollback still happens, but you've lost the failure signal.

❌ Forgetting the retry parameter — `DB::transaction(fn, 3)` is the standard deadlock defence.

## Quick revision notes

- Transaction = **all writes commit, or none do** (atomicity)
- `DB::transaction(fn)` · `DB::transaction(fn, 3)` (deadlock retries) · manual begin/commit/rollBack
- **Nested = shared outer transaction** (no real savepoint by default)
- Deadlock = **lock cycle** → DB kills one → retry + consistent lock order
- **No external side effects inside** — commit, then email/queue
- Oversell defence: **`lockForUpdate()`** (pessimistic) or a **version column** (optimistic)

## Check your understanding

1. What exactly does atomicity guarantee in the order/payment/inventory flow?
2. Why can't an email live inside the transaction?
3. What is a deadlock, and what are the two defences?
4. What's the mental model for a nested transaction?
5. How do you stop two users overselling the last item?
