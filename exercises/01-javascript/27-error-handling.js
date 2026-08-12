'use strict';
// Lesson 27 — Error Handling & Propagation. Run with:  node exercises/01-javascript/27-error-handling.js
// Predict every output BEFORE running. Write your prediction in the comment.

const tick = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  Promise.reject(new Error('bad'))
    .catch((err) => {
      console.log('caught:', err.message);
      return 'recovered';
    })
    .then((v) => console.log('after catch:', v));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
async function task2() {
  try {
    await tick(5, 'ok');
    throw new Error('after await');
  } catch (err) {
    console.log('caught:', err.message);
  } finally {
    console.log('cleanup');
  }
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  function make() {
    return new Promise((resolve, reject) => setTimeout(() => reject('no good'), 5));
  }

  async function run() {
    const value = make();              // no await — rejection escapes this scope
    return 'ignored the problem';
  }
  // NOTE: running this task also prints an UNHANDLED rejection at the end —
  // that crash is the point of the task, not a bug in the file.

  run()
    .then((v) => console.log('resolved:', v))
    .catch((e) => console.log('rejected:', e));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Rethrow so the CALLER can decide what to do.
function task4() {
  async function risky() {
    try {
      await tick(5, 'data');
      throw new Error('validation failed');
    } catch (err) {
      console.log('[risky]', err.message);
      // your code here — rethrow so the .catch below fires
    }
  }

  risky().catch((err) => console.log('[caller]', err.message));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Which runs first? Why?
function task5() {
  const p = new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('late')), 5)
  );

  p.finally(() => console.log('finally ran'));
  p.catch((err) => console.log('catch ran:', err.message));
  console.log('sync end');
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// `allSettled` never rejects — decide the policy per result here.
function task6() {
  const sources = [
    Promise.resolve({ from: 'a', ok: true }),
    Promise.reject(new Error('source b down')),
    Promise.resolve({ from: 'c', ok: true }),
  ];

  // your code here — use allSettled, then log which sources survived
  // expected output: survived: a, c   |   failed: b (source b down)
}
// task6();

module.exports = {};
