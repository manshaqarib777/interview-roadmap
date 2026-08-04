'use strict';
// Lesson 1 — Variables. Run with:  node exercises/01-javascript/01-variables.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  console.log(a);
  console.log(b);
  var a = 1;
  let b = 2;
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Make this log 0, 1, 2 WITHOUT changing `var` to `let`.
function task2() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Why does B throw but A doesn't? Fix B while keeping `const`.
const settings = { theme: 'dark' };
settings.theme = 'light'; // A
// settings = { theme: 'light' }; // B

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement deepFreeze so cfg.api.retries stays 3.
function deepFreeze(obj) {
  // your code here
  return obj;
}

function task4() {
  const cfg = deepFreeze({ api: { url: 'x', retries: 3 }, debug: false });
  try {
    cfg.api.retries = 99;
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
  console.log('retries =', cfg.api.retries); // must be 3
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  let p = 1;
  let q = 2;
  {
    let p = 10;
    q = 20;
    console.log(p, q);
  }
  console.log(p, q);
}
// task5();

module.exports = { deepFreeze };
