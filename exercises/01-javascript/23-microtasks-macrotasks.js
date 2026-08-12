'use strict';
// Lesson 23 — Microtasks vs Macrotasks. Run with:  node exercises/01-javascript/23-microtasks-macrotasks.js
// Every task here is an OUTPUT-ORDERING prediction. Write the exact sequence
// BEFORE running, then run and compare.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: a, __, __, __
function task1() {
  console.log('a');
  setTimeout(() => console.log('b'), 0);
  Promise.resolve().then(() => console.log('c'));
  console.log('d');
}
// task1();
// Expected: a, d, c, b — sync first, then the microtask (c), then the timer (b).

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: __, __, __, __
function task2() {
  setTimeout(() => console.log('t1'), 0);
  setTimeout(() => console.log('t2'), 0);
  Promise.resolve().then(() => console.log('p1'));
  Promise.resolve().then(() => console.log('p2'));
}
// task2();
// Expected: p1, p2, t1, t2 — both promises drain before EITHER timer runs.
// Scheduling order within each queue is preserved; the microtask queue wins first.

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: __, __, __, __
function task3() {
  console.log('s1');
  queueMicrotask(() => console.log('m1'));
  setTimeout(() => console.log('t1'), 0);
  Promise.resolve().then(() => console.log('p1'));
  console.log('s2');
}
// task3();
// Expected: s1, s2, m1, p1, t1 — the whole microtask drain (m1, then p1)
// happens before the task queue is ever consulted.

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: __, __, __
function task4() {
  Promise.resolve()
    .then(() => console.log('p1'))
    .then(() => console.log('p2'));

  queueMicrotask(() => console.log('m1'));
}
// task4();
// Expected: p1, m1, p2 — p2 only EXISTS once p1 resolves, and microtasks
// created during the drain still run within that same drain.

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: __, __, __, __, __
function task5() {
  setTimeout(() => {
    console.log('t1');
    Promise.resolve().then(() => console.log('t1 micro'));
  }, 0);

  setTimeout(() => console.log('t2'), 0);
}
// task5();
// Expected: t1, t1 micro, t2 — a microtask queued INSIDE a task drains before
// the loop picks the NEXT task.

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: __, __, __, __, __
async function task6() {
  console.log('a');
  await Promise.resolve();
  console.log('b');
  await null;
  console.log('c');
}
// task6();
// console.log('d');
// Expected: a, d, b, c — the async body starts synchronously (a), the caller
// continues (d), and each `await` continuation is a microtask (b, then c).

// ── Task 7 ──────────────────────────────────────────────────────────
// Prediction: __, __, __, __
function task7() {
  setTimeout(() => console.log('timeout'), 0);

  Promise.resolve()
    .then(() => console.log('p1'))
    .then(() => {
      setTimeout(() => console.log('inner timeout'), 0);
      console.log('p2');
    });
}
// task7();
// Expected: p1, p2, timeout, inner timeout — p1/p2 drain first; then the
// original timer; then the timer queued from inside p2 (a later task).

// ── Task 8 ──────────────────────────────────────────────────────────
// Predict, then rewrite so the timer runs FIRST (before any promise output),
// WITHOUT changing the Promise calls.
function task8() {
  Promise.resolve().then(() => console.log('p'));
  setTimeout(() => console.log('t'), 0);
}
// task8();
// Expected: p, t — you cannot make the timer beat the promise while it stays
// a microtask. To flip the order, give the timer enough of a head start that
// the task queue gets consulted first, e.g.:
//   setTimeout(() => console.log('t'), 0);
//   setTimeout(() => Promise.resolve().then(() => console.log('p')), 0);

module.exports = {};
