# Lesson 120 — Database Transactions & Concurrency

**Interview importance:** ⭐⭐⭐⭐ — the senior lesson of the module, and the one where interviews grade process, not recall.

Lesson 118 made queries fast. Lesson 119 made the schema versioned. This lesson is about
making the writes *correct under pressure*: atomicity, locking, and the scenario that
decides senior rounds — **two users buy the last item at the same time**.

The why-line: a checkout isn't one write, it's four — create the order, create the payment,
reduce inventory, send the confirmation. If the inventory step fails, you can't have an
order for an item you didn't stock. Transactions make that set of writes all-or-nothing,
and locking is what keeps two concurrent buyers from both getting the last unit. This is
where "it works on my laptop" stops being true — concurrency only exists when the app is
under real traffic.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain ACID, and why atomicity is the reason a transaction exists
- Write `DB::transaction()` around a multi-step write and say what rolls back and why
- Explain what a deadlock is, and how to design it away
- Solve the two-users-buy-the-last-item scenario with `lockForUpdate()` and with a version column
- Explain idempotency and why it matters for webhooks and retried jobs
- Say when a transaction is necessary — and when it's overkill

## 1. One-Line Definition

**A transaction groups several database writes so they commit together or roll back
together — and locking is what keeps concurrent writes from turning that group into a lie.**

## 2. Mental Model

Think of a transaction as **a save point in a game**. You play for ten minutes (write order,
payment, inventory, notification) — then you die (one step fails). You don't keep half the
progress; you respawn at the save point and the ten minutes never happened. The save point
is `BEGIN`, the next checkpoint is `COMMIT`, and dying is `ROLLBACK`.

Concurrency is a different mental model — **the last seat on a flight**. Two agents sell it
at the same moment. Both check "is it free?", both say yes, both sell it — one passenger,
two tickets. The database needs a way to say "while I'm deciding, nobody else can look at
this seat." That's a lock: either you take the seat (pessimistic) or you check the version
number before you commit (optimistic).

## 3. Visual Flow

```text
A CHECKOUT AS A TRANSACTION:

  BEGIN                              -- the save point
    create order                     -- INSERT orders
    create payment                   -- INSERT payments
    reduce inventory                 -- UPDATE products SET stock = stock - 1
    send confirmation                -- dispatch job / send mail
  COMMIT                             -- all four are now durable, together
       │
       └─ if ANY step throws ──▶ ROLLBACK -- every write above is undone

THE TWO BUYERS, NO LOCK (the bug):

  Buyer A reads stock=1          Buyer B reads stock=1
  A reduces to 0                B reduces to 0        ← both write 0
  A commits                     B commits
  Result: 2 orders, stock=0     ← oversold. Two customers, one unit.
```

## 4. How It Works

### Atomicity — the core guarantee

`DB::transaction()` is the Laravel API: give it a closure, and every query inside runs in
one transaction that commits if the closure returns normally and rolls back if it throws.

```php
DB::transaction(function () {
    $order = Order::create([...]);              // write 1
    Payment::create(['order_id' => $order->id]); // write 2
    $product->decrement('stock', 1);             // write 3
    Mail::to($order->email)->queue(...);         // write 4 (queued)
});
```

```text
normal path:   BEGIN → INSERT orders → INSERT payments → UPDATE stock → COMMIT
failure path:  BEGIN → INSERT orders → INSERT payments → 💥 UPDATE stock throws
               → ROLLBACK → orders and payments are GONE — the insert never happened

If the inventory update fails, the order and the payment roll back with it.
The four writes behave like one atomic write — that's the entire point.
```

```narrate
1-6: everything inside the closure is one unit — commit together or roll back together
3-4: if the stock update throws, the order and payment inserts are undone, not left orphaned
4: queued mail is dispatched after commit — never send a confirmation for an order that rolled back
```

> [!NOTE]
> The confirmation is the tell. If the mail *inside* the transaction fails, does the whole
> order roll back? With `Mail::queue()` the job is pushed after commit, so a mail failure
> never cancels a paid order. Sending the mail *synchronously inside* the transaction means
> an SMTP timeout rolls back a real order — that's how you lose money to a flaky mail server.

### Deadlocks

Two transactions each holding a lock the other needs:

```text
Tx A: locks row 1  ──▶ wants row 2   ─┐
                                      ├──▶ the database kills one: "Deadlock found"
Tx B: locks row 2  ──▶ wants row 1   ─┘
```

The database detects it and rolls one side back, throwing a `DeadlockException`. Laravel
retries deadlocked transactions automatically (`DB::transaction(..., 5)`), but the senior
fix is to make the deadlock *unlikely*: lock rows in a consistent order (always
`products` before `orders`), keep transactions short, and let the retry handle the rare
collision.

### Nested transactions

`DB::transaction()` inside another — Laravel *counts* the nesting rather than starting a
real second transaction. The inner block doesn't commit independently; only the outermost
`COMMIT` decides, and one inner rollback marks the whole outer one for rollback.

```php
DB::transaction(function () {              // BEGIN            (depth 1)
    DB::transaction(function () {          // savepoint A      (depth 2)
        // ...
    });                                    // released on success
});                                        // COMMIT           (depth 0 — real commit)
```

```text
inner "transaction"  →  a savepoint, not a BEGIN
outer failure        →  rollback to the savepoint, then the whole thing rolls back
```

> [!TIP]
> Use nested transactions the way you'd use `try`/`finally`: the inner one marks a safe
> boundary, it never *decides* the outer one. If a helper is going to be called both inside
> and outside a transaction, wrap it in `DB::transaction()` — the nesting is free.

## 5. Real Project Usage

### The two-users-buy-the-last-item scenario — pessimistic locking

The naive code passes the code review, works in every demo, and oversells in production:

```php
// ❌ The bug: read-then-write with no lock.
$product = Product::find($id);                 // stock = 1
if ($product->stock < $quantity) {             // "we have 1" — BOTH buyers see this
    abort(422, 'Out of stock');
}
$product->decrement('stock', $quantity);       // both decrement to 0
```

```text
Buyer A: SELECT stock → 1     Buyer B: SELECT stock → 1   (no lock — both read)
Buyer A: UPDATE stock = 0     Buyer B: UPDATE stock = 0
Buyer A: COMMIT               Buyer B: COMMIT
→ 2 orders placed for 1 unit. Oversold.
```

```narrate
1-4: the "check then write" shape — two steps, and nothing prevents a second reader between them
3: both buyers pass this guard because both read stock = 1 before either writes
5: the last write wins — both decrements land, the stock is simply wrong
```

The fix is a **row lock**: read the row *with* the lock, decide, then write. The second
buyer's read blocks until the first commits — and then it sees the real number, 0.

```php
// ✅ Pessimistic fix: lockForUpdate() reads AND locks the row.
DB::transaction(function () use ($productId, $quantity) {
    $product = Product::query()
        ->lockForUpdate()                     // SELECT ... FOR UPDATE
        ->findOrFail($productId);

    if ($product->stock < $quantity) {
        abort(422, 'Out of stock');
    }

    $product->decrement('stock', $quantity);

    Order::create([
        'product_id' => $product->id,
        'quantity'   => $quantity,
    ]);
});
```

```text
Buyer A: SELECT ... FOR UPDATE → locks the product row, reads stock = 1
Buyer B: SELECT ... FOR UPDATE → BLOCKS, waiting on A's lock
Buyer A: UPDATE stock = 0 → COMMIT → lock released
Buyer B: unblocks → now reads stock = 0 → 422 "Out of stock" → ROLLBACK, no order
→ one unit, one buyer, zero overselling.
```

```narrate
3: lockForUpdate() is what turns the plain SELECT into SELECT ... FOR UPDATE — the row is locked for the rest of the transaction
6-8: the guard now runs against the locked, current value — buyer B never sees a stale 1
11-12: the write and the check happen inside the same transaction — one atomic "take the seat"
```

> [!PITFALL]
> A `lockForUpdate()` outside a transaction is a lie — the lock would be released
> immediately after the statement. The lock only lives as long as the enclosing
> `DB::transaction()`, which is why the whole check-and-decrement lives inside the closure.

### The optimistic alternative — a version column

Instead of locking the row, keep a `version` (or `updated_at`) and refuse to write if it
changed since you read it:

```php
// ✅ Optimistic fix: compare-and-swap on the version column.
$product = Product::findOrFail($productId);    // version = 1

$updated = DB::table('products')
    ->where('id', $product->id)
    ->where('version', $product->version)       // still 1? then I'm the only one
    ->update([
        'stock'   => DB::raw('stock - ' . $quantity),
        'version' => $product->version + 1,
    ]);

if ($updated === 0) {
    abort(409, 'The product changed — refresh and retry.');
}
```

```text
Buyer A: reads version = 1
Buyer B: reads version = 1
Buyer A: UPDATE ... WHERE version = 1 → 1 row affected → commits, version becomes 2
Buyer B: UPDATE ... WHERE version = 1 → 0 rows affected  ← B's write silently lost
Buyer B: sees 0 rows → 409 "The product changed" → B retries with the fresh data
→ both reads were allowed, but only one write landed. No oversell, no blocking.
```

```narrate
2: the optimistic version reads without any lock — reads never block, even under load
5: where('version', ...) is the compare — the UPDATE only lands if the row is unchanged
6-8: the stock and the version bump are one atomic UPDATE statement
11-12: zero rows updated means someone else won the race — the caller retries with fresh data
```

### Pessimistic vs optimistic — the trade

| | Pessimistic (`lockForUpdate`) | Optimistic (version column) |
|---|---|---|
| Reads block? | ✅ second reader waits | ❌ both read freely |
| Winner | first to the lock | first to the UPDATE |
| Contention cost | waiting | failed retries |
| Best for | scarce rows, few writers (the last item) | read-heavy, rare writes (profiles, documents) |
| Watch out | deadlocks, long-held locks | retry handling on the caller side |

> [!DEEPDIVE]
> Optimistic locking is CAS (compare-and-swap) with a retry loop, and you've used it before:
> Laravel's `updateOrCreate` and Stripe's idempotency keys are the same shape — send a
> token, and if the token was already applied, apply nothing. The version-column UPDATE is
> the "compare" part, `$updated === 0` is the "and retry" part.

## 6. Interview Explanation

> A transaction is the database's all-or-nothing guarantee: I wrap the writes that belong
> together — create the order, record the payment, reduce the stock — in `DB::transaction()`,
> and if any step throws, every write rolls back. The failure that taught me this: the
> inventory update threw, but the order and payment had already been inserted, so I had
> charged for a product we didn't stock. Transactions turn that four-step write into one
> atomic write.
>
> But atomicity alone doesn't stop two buyers from taking the last item — that needs locking.
> The read-then-write shape (check the stock, then decrement) has a race: both buyers read
> `1` before either writes. The pessimistic fix is `lockForUpdate()`, so the second buyer
> blocks until the first commits and then sees `0`. The optimistic fix is a version column:
> the UPDATE only lands if the version is still what I read, otherwise I return `409` and
> the client retries. I'd pick pessimistic for a hot, scarce row — the last item — and
> optimistic for read-heavy data where locking would throttle everyone.

## 7. Senior-Level Insights

- **Transactions protect invariants, not just money.** "An order without a payment" is the
  classic, but the same shape is everywhere: a user and their profile, a post and its tags,
  a subscription and its first invoice. If a failure leaves half the pair, it belongs in a
  transaction.
- **The check-then-act race is the #1 database interview trap.** Any "if it's available,
  then take it" logic — stock, seats, slots, coupon redemption — has the bug. Say it
  *before* you're asked; it signals you've seen real traffic.
- **Lock scope is the senior detail.** A transaction that locks a row, then runs a slow
  HTTP call or a long computation, holds the lock the whole time — every other buyer queues
  behind it. Keep the locked section short: lock, check, write, commit. Move mail, webhooks
  and slow work *after* the transaction (via queued jobs).
- **`lockForUpdate()` without a transaction is a no-op in practice.** The lock dies when the
  statement ends. If you see this in a code review, that's the review comment.
- **Queues and webhooks demand idempotency, and idempotency is the optimistic idea.**
  A retried job must not charge twice — so the job stores a unique key and a second run
  finds the key already present and does nothing. Same CAS shape as the version column.
- **When transactions are overkill:** a single write (it's atomic on its own), or a
  read-only path. Wrapping a 3-query report in a transaction adds locking cost and zero
  correctness. The rule is *what breaks if a step fails* — if nothing breaks, no
  transaction.
- **`DB::transaction()` with a retry count** (`DB::transaction($cb, 5)`) retries deadlocked
  transactions automatically. The *number* is a design decision: retries must be safe
  (idempotent) and short.

## 8. Common Mistakes

- **The check-then-act race** — `if (stock > 0) decrement` with no lock and no version. The
  exact bug this lesson exists to kill.
- **`lockForUpdate()` outside a transaction.** The lock is released at the end of the
  statement; the guard and the write are not atomic. The lock only means anything inside
  `DB::transaction()`.
- **Side effects inside the transaction.** Sending mail or calling a third-party API inside
  the closure: if that call fails, the order rolls back — and if it *succeeds*, it can't be
  rolled back with the transaction. Queue it or dispatch it *after* commit.
- **A retried job that isn't idempotent.** The queue runs a job twice; without a unique-key
  guard you charge twice or create two orders. Idempotency is the job's job, not the
  queue's.
- **Long transactions.** Holding a lock across a slow external call makes every other buyer
  wait on your timeout. Short transactions are correct transactions.
- **Transactions where they don't help.** A single UPDATE is already atomic; wrapping a
  read-only report in `DB::transaction()` just adds overhead. The question is *what breaks
  if a step fails* — not "should I wrap everything?"
- **Ignoring the deadlock retry.** Deadlocks *will* happen under load. The fix is consistent
  lock ordering and a retry, not hoping they stop.

## 9. Best Practices

✅ Wrap multi-step writes in `DB::transaction()` — every step commits together or none does

✅ Lock scarce rows with `lockForUpdate()` — read *and* lock in one statement, inside the transaction

✅ Use a version column for read-heavy data — no blocking, CAS + retry on `0` rows

✅ Queue mail and notifications so they dispatch *after* commit — never inside

✅ Make retried jobs idempotent — a unique key, and a second run is a no-op

✅ Lock in a consistent order everywhere, keep transactions short, retry deadlocks

✅ Use nested `DB::transaction()` for helpers that must be callable inside or outside a transaction

❌ Don't check-then-act on stock, seats or coupons without a lock or a version

❌ Don't put external calls inside the transaction — they can't roll back

## 10. Interview Questions

**Q1. What is a transaction, and why do you need one?**

> A transaction groups writes so they commit together or roll back together — the A in ACID,
> atomicity. I use one whenever a set of writes is only valid as a set: creating an order,
> recording its payment, reducing stock. If the stock update fails, the order and payment
> must not survive. The transaction gives me that: `DB::transaction()` commits on a clean
> return and rolls everything back on an exception.

**Q2. Explain the two-users-buy-the-last-item scenario and the fixes.**

> Two buyers read the stock as `1`, both pass the "in stock" check, both decrement — two
> orders for one unit. The bug is the read-then-write gap: nothing stops a second read
> between my read and my write. The pessimistic fix is `lockForUpdate()`, which locks the
> row on read, so the second buyer blocks and then sees `0`. The optimistic fix is a version
> column and a compare-and-swap UPDATE — only the first write lands, and the loser gets
> `0` rows updated and retries. Pessimistic for hot scarce rows, optimistic for read-heavy
> data.

**Q3. What is a deadlock?**

> Two transactions each hold a lock the other needs, so neither can finish. The database
> detects the cycle and rolls one side back with a deadlock error. The fixes are to lock
> rows in a consistent order so the cycle can't form, keep transactions short, and let
> Laravel's built-in retry handle the rare collisions that still happen.

**Q4. How do nested transactions behave in Laravel?**

> Laravel doesn't open a real second transaction — it counts nesting depth and creates a
> savepoint. The inner block only marks a boundary: the *outermost* transaction does the
> real `COMMIT`, and a failure anywhere rolls back to the nearest savepoint and ultimately
> the whole thing. I use nesting when a helper needs to work both inside and outside a
> transaction.

**Q5. When are transactions overkill?**

> When nothing breaks if a step fails. A single write is already atomic; a read-only query
> path gains nothing from a transaction. The question is "what happens if the second write
> fails?" — if the answer is "nothing bad", it doesn't need a transaction.

**Senior follow-up: your checkout uses `lockForUpdate()` and the site gets slow. What do you check?**

> First, what's holding the lock. A `SELECT ... FOR UPDATE` held across a slow external
> call — an HTTP request or a long computation inside the transaction — makes every buyer
> queue behind it. I'd look for side effects inside the closure and move them out, then
> measure lock wait times. If the row is genuinely hot, I'd consider optimistic locking so
> reads never block, or a queue that processes one purchase at a time per product. The
> design rule stays the same: lock the row, check, write, commit — nothing else inside.

## 11. Follow-up Questions

**What happens if two `lockForUpdate()` reads target the same rows in a different order?**

> A deadlock: each holds a row the other needs. The database rolls one side back. Fix the
> ordering — always acquire the same locks in the same order across the codebase — and add a
> retry so the loser's transaction runs again cleanly.

**How does idempotency relate to the version column?**

> Same CAS shape. The version column refuses a second *concurrent* write; an idempotency key
> refuses a second *retried* write. Both say "apply this only if it hasn't already been
> applied." A webhook that fires twice, or a job the queue runs twice, needs the key — not
> a transaction.

**Why is `DB::transaction(function () { dispatch(...); })` a bug?**

> The job is dispatched inside the closure, so a rollback can't unsend it — and a job that
> runs after the rollback acts on data that no longer exists. Dispatch after commit instead
> (`afterCommit()` on the job, or dispatch outside the closure), so the job only runs for
> transactions that actually committed.

## 12. Comparison Table

| | Plain `DB::transaction` | `lockForUpdate()` | Version column (optimistic) |
|---|---|---|---|
| Guarantee | all writes commit together | read + write are atomic on a locked row | write only lands if unchanged |
| Reads blocked? | ❌ | ✅ (the locked row) | ❌ |
| Handles check-then-act? | ❌ alone — needs locking | ✅ | ✅ |
| Contention cost | — | waiting on the lock | failed retries |
| Best for | multi-step writes, no contention | scarce rows (stock, seats) | read-heavy, rare writes |
| Failure mode | rollback | rollback + retry | `0` rows → 409 → retry |

## 13. Code Example

The full overselling fix with a `try/catch`, an idempotent order number, and a queued
confirmation that only runs after commit:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

DB::transaction(function () use ($user, $productId, $quantity) {
    $order = Order::create([
        'user_id'       => $user->id,
        'order_number'  => (string) Str::uuid(),     // unique — makes retries safe
        'product_id'    => $productId,
        'quantity'      => $quantity,
        'status'        => 'paid',
    ]);

    Payment::create([
        'order_id'   => $order->id,
        'amount'     => $order->total,
        'reference'  => (string) Str::uuid(),        // the idempotency key
    ]);

    $product = Product::query()
        ->lockForUpdate()
        ->findOrFail($productId);

    if ($product->stock < $quantity) {
        throw new OutOfStockException($product->id); // → rollback everything
    }

    $product->decrement('stock', $quantity);

    // queued — dispatched AFTER commit, so a failure never cancels a paid order
    SendOrderConfirmation::dispatch($order)->afterCommit();
});
```

```text
happy path:
  BEGIN → INSERT orders → INSERT payments → SELECT ... FOR UPDATE (locks row)
        → UPDATE stock → dispatch confirmation → COMMIT
  stock: 1 → 0   order + payment persisted   confirmation queued

out-of-stock path (buyer B, after A committed):
  BEGIN → INSERT orders → INSERT payments → SELECT ... FOR UPDATE
        → blocks until A commits → reads stock = 0 → throws OutOfStockException
        → ROLLBACK → order and payment are GONE → 500/422, nothing half-written

retried job path (queue ran the dispatch twice):
  job #2 finds order_number already exists → skips → no duplicate confirmation
```

```narrate
9-13: an idempotency key on the order — the queue can retry safely, a second run is a no-op
17: lockForUpdate() inside the transaction — the read and the lock are one statement
20-23: the guard now runs against the locked value; the throw rolls the whole thing back
26-27: the confirmation is queued with afterCommit() — it only runs for orders that really committed
```

> [!NOTE]
> That "queued after commit" line is the one interviewers fish for. A confirmation email for
> an order that rolled back is worse than no email — it's a lie to the customer. `afterCommit()`
> is the mechanism that makes the side effect *follow* the transaction's fate instead of
> ignoring it.

## 14. Performance Notes

- **Locking is a throughput tax.** `SELECT ... FOR UPDATE` serialises writers on the locked
  row. Correct, and the right cost for scarce inventory — but the lock should cover the
  smallest possible section: lock, check, write, commit.
- **Lock time = wait time for everyone.** A 200 ms transaction with a slow external call
  inside is 200 ms of blocked buyers. Move anything that isn't a database write out of the
  closure.
- **Indexes decide lock granularity.** `lockForUpdate()->where('product_id', ...)` on an
  unindexed column locks (or deadlocks on) far more than one row. The index from Lesson 118
  is what makes the lock *row-sized* instead of *table-sized*.
- **Optimistic locking has no read cost.** Reads never block — the price is paid in retries,
  which matter only when writes collide. For read-heavy data that's almost always the
  better curve.
- **The retry count is a knob.** `DB::transaction($cb, 5)` retries deadlocks up to five
  times. Retrying an idempotent job is free; retrying a non-idempotent one is charging
  twice. Idempotency first, retries second.
- **When it doesn't matter:** single writes, admin-only single-user tools, or data where a
  lost update is acceptable. A transaction and a lock are tools with costs — use them where
  the invariant matters.

## 15. Debugging Scenarios

**Scenario 1: "Two testers bought the same last item in the same second."**

That's the check-then-act race, reproduced. The stock guard read before either wrote. Add
`lockForUpdate()` inside a `DB::transaction()` (or a version column) and write the test
that runs two purchases concurrently — the second must get the 422/409.

**Scenario 2: "`DB::transaction()` retries, but I still see 'Deadlock found' in the logs."**

Deadlocks are supposed to be retried, not eliminated — some are unavoidable under load.
Check that all lock acquisitions happen in the same order across the codebase (that removes
the avoidable cycles), and that the retried closure is idempotent so the retry is safe. If
they keep appearing, one transaction is probably holding its lock across a slow call.

**Scenario 3: "A customer got a confirmation email for an order that doesn't exist."**

The mail was dispatched *inside* the transaction — the order rolled back, the mail didn't.
Move the dispatch out (or `afterCommit()`), and from now on the mail can only run for
committed orders. This is the signature symptom of side effects inside a transaction.

**Scenario 4: "A retried queue job charged the customer twice."**

The job wasn't idempotent — it created a payment on every run. Give it a unique key (the
order number or the payment reference) and make it check-before-create; the second run
finds the key and becomes a no-op. That's the idempotency pattern, and it's what the
version column is, applied to jobs.

## 16. Quick Revision Notes

- Transaction = writes commit together or roll back together (ACID's atomicity)
- `DB::transaction($cb)` — commit on clean return, rollback on exception
- The four-step checkout: order → payment → stock → confirmation; one failure rolls back all four
- Mail/notifications dispatch *after* commit (`afterCommit()`) — never inside
- Check-then-act is the classic race: two readers both see "available"
- `lockForUpdate()` = `SELECT ... FOR UPDATE` — read + lock, only meaningful inside a transaction
- Optimistic = version column + CAS UPDATE + retry on `0` rows → `409`
- Pessimistic for scarce rows; optimistic for read-heavy data
- Deadlock = two transactions each want the other's lock — order your locks, keep transactions short
- Nested `DB::transaction()` = savepoint; only the outermost commits
- Idempotency keys make retries safe — the same idea as the version column, for jobs/webhooks
- Transactions are overkill when nothing breaks if a step fails

## 17. Cheat Sheet

```text
ATOMIC WRITE (multi-step, must all-or-nothing):
  DB::transaction(function () {
      Order::create([...]);
      Payment::create([...]);
      $product->decrement('stock', 1);
  });
  → clean return = COMMIT, exception = ROLLBACK

THE LAST-ITEM FIX (pessimistic):
  DB::transaction(function () {
      $p = Product::query()->lockForUpdate()->find($id);   // SELECT ... FOR UPDATE
      if ($p->stock < 1) abort(422, 'Out of stock');
      $p->decrement('stock', 1);
  });
  → second buyer blocks, then reads 0, then 422

THE LAST-ITEM FIX (optimistic):
  UPDATE products SET stock = stock - 1, version = version + 1
  WHERE id = ? AND version = ?        // 1 row = won, 0 rows = retry with fresh data

RULES:
  lock + check + write + commit — nothing else inside the closure
  queue mail after commit (afterCommit())
  same lock order everywhere → fewer deadlocks
  idempotency key on every retried job / webhook
  no transaction when a single write or a read is all there is
```

## 18. Key Takeaways

> [!RECAP]
> - A transaction makes several writes one atomic write — commit together or roll back together
> - The checkout example: order, payment, inventory, confirmation; one failure undoes all four
> - Side effects (mail, webhooks) dispatch after commit — they can't roll back, so don't put them inside
> - Check-then-act on stock/seats/coupons is the classic race — both buyers read "available"
> - `lockForUpdate()` reads and locks in one statement, and only means anything inside a transaction
> - A version column is the optimistic fix: CAS + retry on `0` rows
> - Deadlocks are retried, then prevented with consistent lock ordering and short transactions
> - Nested transactions are savepoints — only the outermost commits
> - Idempotency keys make retried jobs and webhooks safe to run twice
> - Transactions are a tool with a cost — use them where a broken invariant is worse than the lock

## Check your understanding

Answer these without looking back.

1. Write the four-step checkout inside `DB::transaction()` and say exactly what happens if the inventory update throws.
2. Why is `lockForUpdate()` useless outside a transaction — and where does the lock live?
3. Walk the two-buyer race with `lockForUpdate()`: what does buyer B see, and what does the endpoint return?
4. Write the version-column UPDATE that refuses a stale write, and what the `0` rows result means.
5. What is a deadlock, and what two design choices make it rare?
6. Why must the confirmation email dispatch after commit — what goes wrong inside the transaction?
7. When is a transaction overkill?
8. What's the idempotency key, and which pattern from this lesson is it the same as?

## What's Next

**Lesson 121 — Validation & Form Requests.** Your writes are atomic and your concurrency is
safe — now make sure the data entering those writes is trustworthy. Rules, custom rules,
`authorize()`, and validation inside Form Requests.