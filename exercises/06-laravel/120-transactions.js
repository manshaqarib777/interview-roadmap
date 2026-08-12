'use strict';
// Lesson 120 — Database Transactions & Concurrency. Run with:  node exercises/06-laravel/120-transactions.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Models transactions in plain JS: an in-memory "DB" whose failed step rolls
// back ALL writes, a lockForUpdate-style overselling guard with two
// interleaved buyers, and an optimistic version column.

// ── Task 1 ──────────────────────────────────────────────────────────
// A tiny in-memory "DB". db.write() records an op in the journal;
// db.commit() flushes the journal into the store. If commit is never called,
// the ops don't exist — the atomicity idea.
function makeDB(initialStore) {
  const store = { ...initialStore }; // { stock: number }
  let journal = [];
  return {
    store,
    // begin(): a fresh journal for this "transaction"
    begin() {
      journal = [];
    },
    write(key, value) {
      // your code here — push { key, value } onto the journal
    },
    commit() {
      // your code here — apply every journal entry to `store`, then clear the journal
    },
  };
}
function task1() {
  const db = makeDB({ stock: 5 });
  db.begin();
  db.write('stock', 4);
  console.log('before commit:', db.store.stock); // journal not applied yet
  db.commit();
  console.log('after commit:', db.store.stock);
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Atomicity: a failed step must roll back every write. Implement run() so a
// throw inside the closure undoes the whole journal — the order/payment/
// inventory example where inventory fails.
function run(db, fn) {
  db.begin();
  try {
    const result = fn(db);
    db.commit();
    return result;
  } catch (err) {
    // your code here — roll back the journal WITHOUT touching the store,
    // then re-throw so the caller sees the failure
  }
}
function task2() {
  const db = makeDB({ stock: 3 });
  try {
    run(db, (d) => {
      d.write('stock', 2);          // "order + payment" writes
      d.write('orders', 1);
      throw new Error('inventory update failed'); // 💥 the failing step
    });
  } catch (err) {
    console.log('caught:', err.message);
  }
  console.log('stock after rollback:', db.store.stock);
  console.log('orders after rollback:', db.store.orders);
}
// Prediction: ______________________
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The two-users-buy-the-last-item race, reproduced. Implement buy() the
// NAIVE way (no lock): if the stock is available, decrement it. Then predict
// what happens when A and B interleave — and confirm the oversell.
function naiveBuy(db, qty) {
  // your code here — check db.store.stock, and if enough, decrement and
  // return 'ok', otherwise return 'out of stock'
}
function task3() {
  const db = makeDB({ stock: 1 });
  const a = naiveBuy(db, 1); // buyer A
  const b = naiveBuy(db, 1); // buyer B — reads the SAME stock the naive way
  console.log('A:', a, 'B:', b, 'stock now:', db.store.stock);
}
// Prediction: ______________________
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The lockForUpdate fix. Implement lockedBuy() so the check and the
// decrement happen ATOMICALLY — a lock flag that a second buyer cannot
// pass while the first is mid-transaction (the row lock, in plain JS).
function lockedBuy(db, qty) {
  // your code here — use a lock: while (db.locked) wait; set db.locked = true,
  // check + decrement, release the lock. Return 'ok' or 'out of stock'.
}
function task4() {
  const db = makeDB({ stock: 1 });
  db.locked = false;
  const a = lockedBuy(db, 1);
  const b = lockedBuy(db, 1);
  console.log('A:', a, 'B:', b, 'stock now:', db.store.stock);
}
// Prediction: ______________________
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The optimistic fix: a version column. Implement optimisticBuy() as a
// compare-and-swap — the UPDATE only lands when the version the buyer
// originally read (versionRead) still matches the current one. Return the
// number of rows "updated": 1 = won, 0 = stale, retry, -1 = out of stock.
function optimisticBuy(db, qty, versionRead) {
  // your code here — if db.store.version !== versionRead, return 0 (stale).
  // If stock is not enough, return -1. Otherwise apply the write, bump the
  // version, and return 1.
}
function task5() {
  const db = makeDB({ stock: 1, version: 1 });
  const versionA = db.store.version;          // both buyers READ version 1
  const versionB = db.store.version;
  const a = optimisticBuy(db, 1, versionA);   // wins: 1 row
  const b = optimisticBuy(db, 1, versionB);   // stale: 0 rows → retry
  console.log('A updated rows:', a, 'B updated rows:', b, 'stock now:', db.store.stock, 'version:', db.store.version);
}
// Prediction: ______________________
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Nested transactions: predict how many times commit flushes to the store
// when two "transactions" are nested, then implement outerRun() so the inner
// journal merges into the outer one (the savepoint idea — only the outermost
// really commits).
function outerRun(db, innerFn) {
  db.begin();
  try {
    innerFn();
    // your code here — commit the outer journal (flushing everything
    // accumulated by the inner block into the store)
    db.commit();
    return 'committed';
  } catch (err) {
    return 'rolled back';
  }
}
function task6() {
  const db = makeDB({ stock: 10 });
  const result = outerRun(db, () => {
    db.write('stock', 9); // "outer" write
  });
  console.log(result, 'stock:', db.store.stock);
}
// Prediction: ______________________
// task6();

// ── Task 7 ──────────────────────────────────────────────────────────
// Idempotency: a retried job must not charge twice. Implement applyPayment()
// so a second run with the same reference is a NO-OP (the idempotency key,
// which is the version-column idea applied to jobs).
function applyPayment(payments, reference, amount) {
  // your code here — if payments already has this reference, return
  // { applied: false, total }; otherwise push the payment and return
  // { applied: true, total } with the running total
}
function task7() {
  const payments = [];
  console.log('run 1:', applyPayment(payments, 'ref-1', 50));
  console.log('run 2 (retry):', applyPayment(payments, 'ref-1', 50));
  console.log('run 3:', applyPayment(payments, 'ref-2', 20));
  console.log('payments:', payments.map((p) => p.reference));
}
// Prediction: ______________________
// task7();

module.exports = { makeDB, run, naiveBuy, lockedBuy, optimisticBuy, outerRun, applyPayment };
