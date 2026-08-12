'use strict';
// Lesson 118 — Query Optimization & the Query Builder. Run with:  node exercises/06-laravel/118-query-optimization.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Models the Query Builder in plain JS: a chainable where/select that compiles
// to a "SQL" string, a whereHas/exists check, and chunkById with memory tracking.

// ── Task 1 ──────────────────────────────────────────────────────────
// A mini query builder. Every link returns a new builder (so the chain is
// immutable) and only get() "runs" it by compiling the SQL string.
// Implement where(), select(), and get().
class QB {
  constructor(rows) {
    this.rows = rows;        // the "table" — an array of objects
    this.wheres = [];        // [{ col, value }]
    this.cols = '*';         // '*' or an array of column names
  }
  where(col, value) {
    const b = new QB(this.rows);
    b.wheres = this.wheres.concat([{ col, value }]);
    b.cols = this.cols;
    return b;
  }
  select(...cols) {
    // your code here
  }
  get() {
    // your code here
    // 1. filter this.rows by every where (strict equality)
    // 2. if cols !== '*', return only those columns
    // 3. return the resulting array of objects
  }
}
function task1() {
  const users = [
    { id: 1, name: 'ada', active: true },
    { id: 2, name: 'bob', active: false },
    { id: 3, name: 'carol', active: true },
  ];
  const q = new QB(users).where('active', true).select('id', 'name');
  console.log(q.get());
  console.log(new QB(users).where('active', false).get());
  console.log(new QB(users).get().length);
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Real Laravel SQL is built by the chain. Given the same three rows, write
// the SQL string each chain produces — then make the whereIn() method real.
// (Laravel: DB::table('users')->whereIn('id', [1,3])->get()
//          → "SELECT * FROM users WHERE id IN (1,3)")
class QB2 {
  constructor(rows) {
    this.rows = rows;
    this.wheres = [];
  }
  whereIn(col, values) {
    // your code here — push { col, values, in: true }
    return this;
  }
  where(col, value) {
    this.wheres.push({ col, value });
    return this;
  }
  get() {
    const ands = this.wheres.map((w) =>
      w.in ? `${w.col} IN (${w.values.join(',')})` : `${w.col} = ${JSON.stringify(w.value)}`
    );
    return `SELECT * FROM users${ands.length ? ' WHERE ' + ands.join(' AND ') : ''}`;
  }
}
function task2() {
  console.log(new QB2([]).get());
  console.log(new QB2([]).where('active', true).get());
  console.log(new QB2([]).whereIn('id', [1, 3]).where('active', true).get());
}
// Prediction: ______________________
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// whereHas in plain JS: "give me users who have at least one paid order" —
// the EXISTS-subquery idea, without hydrating any orders.
function usersWithPaidOrders(users, orders) {
  // your code here — return users who have at least one order with status 'paid'
}
function task3() {
  const users = [
    { id: 1, name: 'ada' },
    { id: 2, name: 'bob' },
  ];
  const orders = [
    { user_id: 1, status: 'paid' },
    { user_id: 1, status: 'refunded' },
    { user_id: 2, status: 'pending' },
  ];
  console.log(usersWithPaidOrders(users, orders).map((u) => u.name));
}
// Prediction: ______________________
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// withCount in plain JS: annotate each user with their order count WITHOUT
// loading the orders — this is the correlated COUNT subquery in Section 4.
function usersWithOrderCounts(users, orders) {
  // your code here — return new objects: { ...user, orders_count }
}
function task4() {
  const users = [
    { id: 1, name: 'ada' },
    { id: 2, name: 'bob' },
  ];
  const orders = [
    { user_id: 1, status: 'paid' },
    { user_id: 1, status: 'refunded' },
    { user_id: 2, status: 'pending' },
  ];
  console.log(usersWithOrderCounts(users, orders));
}
// Prediction: ______________________
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// chunkById in plain JS: iterate a big array in batches keyed by a
// strictly-increasing id, WITHOUT ever holding the whole array in memory.
// Track peak memory (the largest batch we ever materialise) — the Lesson 118
// answer to "how do you export 1M rows?".
function chunkById(bigArray, batchSize, onBatch) {
  // your code here
  // 1. maintain lastId = 0
  // 2. repeatedly filter for ids > lastId, take up to batchSize of them
  //    (slice is fine — the point is only one batch is "resident" at a time)
  // 3. call onBatch(batch) for each non-empty batch
  // 4. stop when a batch comes back empty
}
function task5() {
  const big = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, name: 'u' + (i + 1) }));
  let peak = 0;
  let batches = 0;
  let seen = 0;
  chunkById(big, 250, (batch) => {
    batches += 1;
    peak = Math.max(peak, batch.length);
    seen += batch.length;
  });
  console.log('batches:', batches, 'peak batch size:', peak, 'total seen:', seen);
}
// Prediction: ______________________
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Same idea as cursor(): return ONE row at a time, never materialising the
// whole filtered set. Implement cursor over a big array of ids.
function cursorOver(array, predicate) {
  // your code here — return an object with .next() that returns the next
  // matching element or undefined when exhausted; keep the index inside a closure
}
function task6() {
  const big = Array.from({ length: 1000 }, (_, i) => i);
  const cur = cursorOver(big, (n) => n % 2 === 0);
  const first = [];
  for (let i = 0; i < 3; i++) first.push(cur.next());
  console.log(first, 'next:', cur.next());
}
// Prediction: ______________________
// task6();

// ── Task 7 ──────────────────────────────────────────────────────────
// The memory lesson from the code example: loading ALL 1000 rows vs
// chunking them. Predict which "peak" is bigger, then implement countQueries
// for the N+1 fix: count how many queries a naive loop makes.
function countQueries(users, orders) {
  // N+1: for each user, one "query" to count their orders.
  // your code here — return the number of queries the naive loop would run
  // (= 1 for the users list + 1 per user)
}
function task7() {
  const users = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
  console.log('naive query count:', countQueries(users, []));
  console.log('with withCount (1 query):', 1);
}
// Prediction: ______________________
// task7();

// ── Task 8 ──────────────────────────────────────────────────────────
// Build a composite index decision: given a query's WHERE columns in order,
// return the correct composite index columns (leftmost-first — the Lesson 118
// index rule). WHERE user_id = ? AND status = ? ORDER BY created_at DESC
// → index columns ['user_id', 'status', 'created_at'] (range/order column last).
function compositeIndexFor(wheres, orderBy) {
  // your code here — wheres is an array of column names in WHERE order,
  // orderBy is a single column or null. Return wheres (in order) plus orderBy at the end.
}
function task8() {
  console.log(compositeIndexFor(['user_id', 'status'], 'created_at'));
  console.log(compositeIndexFor(['user_id'], null));
}
// Prediction: ______________________
// task8();

module.exports = { QB, QB2, usersWithPaidOrders, usersWithOrderCounts, chunkById, cursorOver, countQueries, compositeIndexFor };
