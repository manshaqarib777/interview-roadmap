'use strict';
// Lesson 119 — Migrations, Schema & Seeders. Run with:  node exercises/06-laravel/119-migrations.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Models migrations in plain JS: a schema "database" (arrays of column names),
// a migration runner with an applied-state log (like the migrations table),
// and a factory + seeder split.

// ── Task 1 ──────────────────────────────────────────────────────────
// A minimal schema builder. schema.addTable creates an empty table; columns
// live in an array. Implement it (a table is `{ name, columns: [] }`).
function createSchema() {
  const tables = [];
  return {
    tables,
    addTable(name) {
      // your code here — push { name, columns: [] } and return the table object
    },
  };
}
function task1() {
  const s = createSchema();
  const users = s.addTable('users');
  users.columns.push('id', 'email', 'created_at');
  const orders = s.addTable('orders');
  orders.columns.push('id', 'user_id', 'status');
  console.log(s.tables.map((t) => `${t.name}: [${t.columns.join(', ')}]`));
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The migrations table: apply/rollback a list of migrations and track the
// applied state (like the `migrations` table + migrate / migrate:rollback).
// Each migration: { name, up(schema), down(schema) }.
function makeRunner(schema) {
  const applied = [];       // names in apply order — the "migrations" table
  return {
    applied,
    migrate(list) {
      // your code here — for each migration not yet applied: run up(),
      // then push its name onto `applied`
    },
    rollback() {
      // your code here — run the LAST applied migration's down(), then
      // remove it from `applied` (mirror the exact inverse — Lesson 119)
    },
  };
}
function task2() {
  const s = createSchema();
  const users = s.addTable('users');
  const addOrders = { name: 'add_orders', up: () => s.addTable('orders'), down: () => {} };
  const runner = makeRunner(s);
  runner.migrate([addOrders]);
  runner.migrate([addOrders]); // already applied — must be a no-op
  console.log('applied after migrate:', runner.applied);
  runner.rollback();
  console.log('applied after rollback:', runner.applied);
}
// Prediction: ______________________
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Fresh vs rollback: predict what each command leaves behind, then make
// runFresh() work — drop ALL tables and re-apply every migration (the
// migrate:fresh idea, which is why it only exists for local/CI).
function runFresh(schema, migrations) {
  // your code here — remove every table from schema.tables, reset the runner's
  // applied log, then re-run all migrations. Return { tables, applied }.
}
function task3() {
  const s = createSchema();
  const runner = makeRunner(s);
  const m1 = { name: 'create_users', up: () => s.addTable('users'), down: () => {} };
  const m2 = { name: 'create_orders', up: () => s.addTable('orders'), down: () => {} };
  runner.migrate([m1, m2]);
  const after = runFresh(s, [m1, m2]);
  console.log('tables after fresh:', after.tables.map((t) => t.name));
  console.log('applied after fresh:', after.applied);
}
// Prediction: ______________________
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Soft deletes in plain JS: `deleted_at` marks a row instead of removing it.
// Implement softDelete (set deleted_at), onlyTrashed (return the marked rows),
// and restore (clear deleted_at). The Lesson 119 deleted_at filter, no DB.
function softDelete(rows, id) {
  // your code here — set deleted_at to a timestamp string on the matching row
}
function onlyTrashed(rows) {
  // your code here — return rows whose deleted_at is set
}
function restore(rows, id) {
  // your code here — clear deleted_at on the matching row
}
function task4() {
  const posts = [
    { id: 1, title: 'a' },
    { id: 2, title: 'b' },
    { id: 3, title: 'c' },
  ];
  softDelete(posts, 2);
  console.log('live ids:', posts.filter((p) => !p.deleted_at).map((p) => p.id));
  console.log('trashed:', onlyTrashed(posts).map((p) => p.id));
  restore(posts, 2);
  console.log('after restore:', posts.map((p) => p.id));
}
// Prediction: ______________________
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Factory vs seeder: a factory generates volume with states; a seeder
// guarantees canonical rows and must be safe to run twice (firstOrCreate).
// Implement make(n) (n copies of the defaults) and state(name) — which
// returns a NEW factory with merged defaults, Laravel's ->state() idea.
function makeFactory(defaults, states) {
  return {
    make(n) {
      // your code here — n shallow copies of `defaults`
    },
    state(name) {
      // your code here — return a new factory whose defaults are
      // { ...defaults, ...states[name] }, keeping the same `states`
    },
  };
}
function firstOrCreate(rows, match, create) {
  // your code here — if a row matches (every key in `match`), return it;
  // otherwise push `create` and return it. The re-runnable seeder fix.
}
function task5() {
  const f = makeFactory({ role: 'member' }, { admin: { role: 'admin' } });
  console.log('factory:', f.make(2));
  console.log('admin state:', f.state('admin').make(1));
  const users = [{ id: 1, email: 'admin@example.com' }];
  const got = firstOrCreate(users, { email: 'admin@example.com' }, { id: 2, email: 'admin@example.com' });
  firstOrCreate(users, { email: 'new@example.com' }, { id: 3, email: 'new@example.com' });
  console.log('seeder users:', users.map((u) => u.email));
  console.log('got existing:', got.email);
}
// Prediction: ______________________
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// The migrate command family, as a decision: classify each command as safe
// on production (✅) or local/CI only (⚠️). Implement the classifier.
function safetyOf(command) {
  // your code here — return 'local/CI only' for migrate:fresh and
  // migrate:refresh, 'safe' for migrate, migrate:status, and db:seed
}
function task6() {
  for (const c of ['migrate', 'migrate:fresh', 'migrate:refresh', 'migrate:rollback', 'migrate:status', 'db:seed']) {
    console.log(c, '→', safetyOf(c));
  }
}
// Prediction: ______________________
// task6();

module.exports = { createSchema, makeRunner, runFresh, softDelete, onlyTrashed, restore, makeFactory, firstOrCreate, safetyOf };
