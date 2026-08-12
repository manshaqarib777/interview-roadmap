'use strict';
// Lesson 129 — Testing, Factories & Mocking. Run with:  node exercises/06-laravel/129-testing.js
// Plain Node: a mini test runner (given a list of "tests", run them, report
// pass/fail counts) plus a fake() helper that swaps a dependency — the
// Mail::fake() / Queue::fake() idea from the lesson.
// Predict BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A mini test runner. Each "test" is an object { name, fn }. Run them
// with try/catch — a throw means FAIL. Return and log the tally.
function runTests(tests) {
  let passed = 0;
  let failed = 0;
  // your code here — for each test: run fn(), count, log PASS/FAIL
  return { passed, failed };
}

function task1() {
  const tests = [
    { name: 'addition works', fn: () => { if (1 + 1 !== 2) throw new Error('nope'); } },
    { name: 'truthy assertion', fn: () => { if (!true) throw new Error('nope'); } },
    { name: 'this one fails', fn: () => { throw new Error('boom'); } },
    { name: 'string matches', fn: () => { if ('abc' !== 'abc') throw new Error('nope'); } },
  ];
  const tally = runTests(tests);
  console.log('tally:', tally); // { passed: 3, failed: 1 }
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// A fake() helper that SWAPS a dependency: it returns a fake object that
// records calls and can be asserted on — the Mail::fake() pattern. It
// matches Laravel's fluent Mailable shape:  mailer.to(addr).send(...)
function fake(impl) {
  const calls = [];
  const record = (...args) => {
    calls.push(args);
    if (impl) return impl(...args);
  };
  return {
    to(addr) {
      return {
        send: (subject) => record(addr, subject),
      };
    },
    assertCalledTimes: (n) => calls.length === n,
    calls,
  };
}

function task2() {
  const mailer = fake(); // no impl — delivery is "swapped out"
  mailer.to('ada@x.com').send('Welcome'); // records the call
  mailer.to('grace@x.com').send('Welcome');
  console.log('called twice?', mailer.assertCalledTimes(2)); // true
  console.log('first call args:', mailer.calls[0]);          // [ 'ada@x.com', 'Welcome' ]
  console.log('calls count:', mailer.calls.length);          // 2
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// RefreshDatabase, in miniature: a fake DB that "transactions" roll back.
// buildFakeDb returns { insert(table, row), count(table), reset() } where
// reset() wipes everything (the per-test rollback).
function makeFakeDb() {
  const tables = new Map(); // table → rows[]
  return {
    insert(table, row) {
      // your code here
    },
    count(table) {
      // your code here
    },
    reset() {
      // your code here
    },
  };
}

function task3() {
  const db = makeFakeDb();
  db.insert('users', { id: 1 });
  db.insert('users', { id: 2 });
  console.log('before reset:', db.count('users')); // 2
  db.reset();                                      // ← RefreshDatabase's rollback
  console.log('after reset:', db.count('users'));  // 0 — clean slate
  db.insert('users', { id: 3 });                   // next test starts fresh
  console.log('next test:', db.count('users'));    // 1
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// A factory: makeFactory(defaults) returns create(overrides) that merges
// the defaults with overrides and — like afterCreating — runs any hooks
// after the "row" is built.
function makeFactory(defaults) {
  const hooks = [];
  return {
    afterCreating(fn) {
      hooks.push(fn);
      return this;
    },
    create(overrides = {}) {
      // your code here — merge, run hooks, return the row
    },
  };
}

function task4() {
  const userFactory = makeFactory({ name: 'Ada', is_admin: false, email: 'ada@x.com' });
  userFactory.afterCreating((row) => (row.welcomed = true));
  const u1 = userFactory.create();
  const u2 = userFactory.create({ name: 'Grace', is_admin: true });
  console.log('u1:', u1); // { name: 'Ada', is_admin: false, email: 'ada@x.com', welcomed: true }
  console.log('u2:', u2); // { name: 'Grace', is_admin: true,  email: 'ada@x.com', welcomed: true }
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The whole shape together: a "feature test" that uses the fake mailer
// and the fake db — and asserts WITHOUT touching a real anything.
// Implement registerUser(deps) so the test passes.
function registerUser(deps) {
  const { db, mailer } = deps;
  // your code here — insert into 'users', then mailer.to(...).send('Welcome')
}

function task5() {
  const db = makeFakeDb();
  const mailer = fake();
  registerUser({ db, mailer });
  console.log('user stored?', db.count('users') === 1);        // true
  console.log('mail sent?', mailer.assertCalledTimes(1));     // true
  console.log('mail to:', mailer.calls[0] && mailer.calls[0][0]); // 'ada@x.com'
  // After the test, RefreshDatabase-style:
  db.reset();
  console.log('clean for next test:', db.count('users') === 0); // true
}
// task5();

module.exports = { runTests, fake, makeFakeDb, makeFactory, registerUser };
