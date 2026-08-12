'use strict';
// Lesson 26 — Promise Combinators. Run with:  node exercises/01-javascript/26-promise-combinators.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const fast = Promise.resolve('fast');
  const slow = new Promise((resolve) => setTimeout(() => resolve('slow'), 20));
  const boom = Promise.reject('boom');

  Promise.race([fast, slow, boom]).then(
    (v) => console.log('race:', v),
    (e) => console.log('race rejected:', e)
  );
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const a = Promise.resolve(1);
  const b = new Promise((resolve, reject) => setTimeout(() => reject('nope'), 10));

  Promise.allSettled([a, b]).then((results) => console.log(JSON.stringify(results)));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `withTimeout(promise, ms)` using Promise.race.
// If the promise settles first, adopt its result; otherwise reject
// with `new Error(label + ' timed out')`.
function withTimeout(promise, ms, label) {
  // your code here
}

function task3() {
  const ok = new Promise((resolve) => setTimeout(() => resolve('data'), 20));
  const slow = new Promise((resolve) => setTimeout(() => resolve('too late'), 200));

  withTimeout(ok, 100, 'GET /ok')
    .then((v) => console.log('ok →', v))
    .catch((e) => console.log('ok →', e.message));

  withTimeout(slow, 50, 'GET /slow')
    .then((v) => console.log('slow →', v))
    .catch((e) => console.log('slow →', e.message));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  const p1 = Promise.reject('e1');
  const p2 = new Promise((resolve) => setTimeout(() => resolve('second wins'), 5));

  Promise.any([p1, p2]).then(
    (v) => console.log('any:', v),
    (e) => console.log('any errors:', e.errors)
  );
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Which combinator do you need, and why? Implement it.
// Three independent health checks: one failing check must NOT
// fail the whole report — each result is reported individually.
function task5() {
  const checks = [
    Promise.resolve({ name: 'db', healthy: true }),
    Promise.reject(new Error('cache down')),
    Promise.resolve({ name: 'api', healthy: true }),
  ];

  // your code here — one combinator, then log the per-check outcomes

  // expected output:
  // db: healthy
  // cache: unhealthy (cache down)
  // api: healthy
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const p = new Promise((resolve) => setTimeout(() => resolve('X'), 10));

  Promise.all([p]).then((v) => console.log('all:', v));
  Promise.race([p]).then((v) => console.log('race:', v));
}
// task6();

module.exports = { withTimeout };
