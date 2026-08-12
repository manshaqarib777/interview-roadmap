'use strict';
// Lesson 131 — Laravel Performance & Deployment. Run with:  node exercises/06-laravel/131-performance-deployment.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// Models the 10-rung "slow API" ladder in plain JS: a fake endpoint whose latency
// comes from N+1 queries and row counts. A function applies fixes IN ORDER —
// eager load, then index, then cache — and prints query count and latency
// before/after each rung. "Measure first" is built into the ladder itself.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A fake Eloquent model: users, orders, items. Reading `items` per order is the N+1.
function task1() {
  const users = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' },
  ];
  const orders = [
    { id: 1, user_id: 1, status: 'paid' },
    { id: 2, user_id: 1, status: 'paid' },
    { id: 3, user_id: 2, status: 'paid' },
  ];
  const items = [
    { order_id: 1, name: 'a' },
    { order_id: 1, name: 'b' },
    { order_id: 2, name: 'c' },
    { order_id: 3, name: 'd' },
  ];

  function orderItems(orderId) {
    return items.filter((i) => i.order_id === orderId);
  }

  let queries = 0;
  const rows = [];
  for (const order of orders) {
    queries += 1; // the query for the order itself
    queries += 1; // the per-order items query — the N+1
    rows.push({ id: order.id, itemCount: orderItems(order.id).length });
  }
  console.log('total queries:', queries);
  console.log(JSON.stringify(rows));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The debugging ladder. Each rung reports its own delta, starting from a
// measured "before" — 500 rows of orders, each with 5 items.
function task2() {
  const ORDER_ROWS = 500;
  const ITEMS_PER_ORDER = 5;

  function buildStore() {
    const items = [];
    for (let i = 0; i < ORDER_ROWS * ITEMS_PER_ORDER; i += 1) {
      items.push({ order_id: Math.floor(i / ITEMS_PER_ORDER) + 1 });
    }
    return { itemCount: (orderId) => items.filter((i) => i.order_id === orderId).length };
  }

  function run(store, opts) {
    let queries = 0;
    let rows = 0;
    let work = 0;

    const page = opts.cacheHit
      ? []
      : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];

    if (opts.paginate) rows = page.length; // only 10 rows are "selected"

    for (const order of page) {
      queries += 1;
      if (!opts.eagerLoad) {
        queries += 1; // N+1
        work += store.itemCount(order.id); // N+1 work
      } else {
        work += ITEMS_PER_ORDER; // one grouped query, 5 rows
      }
    }

    return { queries, rows, work };
  }

  const store = buildStore();

  const before = run(store, {});
  const eager = run(store, { eagerLoad: true });
  const paginated = run(store, { eagerLoad: true, paginate: true });
  const cached = run(store, { eagerLoad: true, paginate: true, cacheHit: true });

  console.log('before:      queries=' + before.queries + ' rows=' + before.rows + ' work=' + before.work);
  console.log('eager load:  queries=' + eager.queries + ' rows=' + eager.rows + ' work=' + eager.work);
  console.log('paginate:    queries=' + paginated.queries + ' rows=' + paginated.rows + ' work=' + paginated.work);
  console.log('cache hit:   queries=' + cached.queries + ' rows=' + cached.rows + ' work=' + cached.work);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// EXPLAIN: an index turns a full scan into a seek. The latency delta is
// computed from the scanned row count — the same shape as the EXPLAIN output.
function task3() {
  const tableSize = 1200000;

  function explain(withIndex) {
    const type = withIndex ? 'ref' : 'ALL';
    const rows = withIndex ? 128 : tableSize;
    return { type, rows, latencyMs: withIndex ? 14 : 940 };
  }

  const before = explain(false);
  const after = explain(true);

  console.log('before:', before.type, 'rows=' + before.rows, before.latencyMs + 'ms');
  console.log('after: ', after.type, 'rows=' + after.rows, after.latencyMs + 'ms');
  console.log('speedup:', Math.round(before.latencyMs / after.latencyMs) + 'x');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The cache: first call computes and stores, later calls hit Redis (a Map here).
// A TTL expires the key; an explicit invalidate clears it on write.
function task4() {
  const cache = new Map();
  let computes = 0;

  function remember(key, ttlMs, compute) {
    const hit = cache.get(key);
    if (hit !== undefined && Date.now() - hit.at < ttlMs) return hit.value;
    const value = compute();
    computes += 1;
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  function forget(key) {
    cache.delete(key);
  }

  const expensive = () => {
    computes += 1;
    return { top10: ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8', 'o9', 'o10'] };
  };

  console.log('call 1 (miss):', remember('dashboard.top10', 60000, expensive).top10.length, 'top items');
  console.log('call 2 (hit): ', remember('dashboard.top10', 60000, expensive).top10[0]);
  forget('dashboard.top10'); // a write happened — invalidate
  console.log('call 3 (miss):', remember('dashboard.top10', 60000, expensive).top10[0]);
  console.log('computes total:', computes);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Deploy checklist: run the steps in order and print a report. A "broken"
// step (a failing test) must stop the pipeline before anything ships.
function task5() {
  const pipeline = [
    { name: 'composer install --no-dev --optimize-autoloader', ok: true },
    { name: 'run tests (php artisan test)', ok: true },
    { name: 'lint (pint)', ok: true },
    { name: 'config:cache + route:cache + view:cache', ok: true },
    { name: 'migrate --force', ok: true },
    { name: 'queue:restart', ok: true },
    { name: 'reload php-fpm', ok: true },
  ];

  function deploy(steps) {
    const log = [];
    for (const step of steps) {
      if (!step.ok) {
        log.push({ step: step.name, status: 'FAILED' });
        return { deployed: false, log };
      }
      log.push({ step: step.name, status: 'ok' });
    }
    return { deployed: true, log };
  }

  const good = deploy(pipeline);
  const broken = deploy(pipeline.map((s) => (s.name.includes('tests') ? { ...s, ok: false } : s)));

  console.log('good deploy deployed:', good.deployed, '| steps run:', good.log.length);
  console.log('broken deploy deployed:', broken.deployed, '| steps run:', broken.log.length);
  console.log('broken at:', broken.log[broken.log.length - 1].step);
}
// task5();

module.exports = { task1, task2, task3, task4, task5 };
