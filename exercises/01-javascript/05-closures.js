'use strict';
// Lesson 5 — Closures. Run with:  node exercises/01-javascript/05-closures.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Fill the gap so each call returns the next counter value.
function makeCounter() {
  let count = 0;
  return function () {
    // your code here
  };
}

function task1() {
  const c = makeCounter();
  console.log(c(), c(), c()); // must be 1 2 3
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const callbacks = [];
  for (var i = 0; i < 3; i++) {
    callbacks.push(() => i); // closures capture the VARIABLE, not its value
  }
  console.log(callbacks.map((fn) => fn()));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const callbacks = [];
  for (let i = 0; i < 3; i++) {
    callbacks.push(() => i); // a fresh binding per iteration
  }
  console.log(callbacks.map((fn) => fn()));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement `once` — the wrapped fn runs at most once; later calls
// return the first result.
function once(fn) {
  // your code here
}

function task4() {
  let calls = 0;
  const runOnce = once(() => ++calls);
  console.log(runOnce(), runOnce(), runOnce()); // must be 1 1 1
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement `memoize` — return the cached result for repeat args.
function memoize(fn) {
  // your code here
}

function task5() {
  let calls = 0;
  const slow = memoize((n) => {
    calls++;
    return n * 2;
  });
  console.log(slow(3), slow(3), slow(4)); // must be 6 6 8
  console.log('calls =', calls); // must be 2
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  function makeAdder(x) {
    return function (y) {
      return x + y;
    };
  }
  const add5 = makeAdder(5);
  const add10 = makeAdder(10);
  console.log(add5(2), add10(2)); // each closure keeps its own x
}
// task6();

module.exports = { makeCounter, once, memoize };
