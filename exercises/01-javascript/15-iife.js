'use strict';
// Lesson 15 — IIFE & the Module Pattern. Run with:  node exercises/01-javascript/15-iife.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const result = (function (a, b) {
    return a + b;
  })(2, 3);
  console.log(result);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  (function () {
    var hidden = 'secret'; // private to the IIFE?
  })();
  try {
    console.log(hidden);
  } catch (e) {
    console.log(e.constructor.name);
  }
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Build the module pattern: private `count`, public `increment`, `get`, `reset`.
// Expected output: 1, 2, 2, undefined, 0, 1
const counter = (function () {
  // your code here
  return {};
})();

function task3() {
  console.log(counter.increment());
  console.log(counter.increment());
  console.log(counter.get());
  console.log(counter.count); // private — must be undefined
  counter.reset();
  console.log(counter.get()); // must be 0
  console.log(counter.increment()); // must be 1
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  const api = (function () {
    let state = 0;
    return { next: () => ++state };
  })();
  console.log(api.next(), api.next());
  console.log(state);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const arrowIIFE = (() => 'arrow IIFE')();
  console.log(arrowIIFE);
  console.log(typeof arrowIIFE);
}
// task5();

module.exports = { counter };
