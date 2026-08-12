'use strict';
// Lesson 4 — Temporal Dead Zone. Run with:  node exercises/01-javascript/04-temporal-dead-zone.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  try {
    console.log(x); // x is in the TDZ until its declaration runs
  } catch (e) {
    console.log(e.constructor.name);
  }
  let x = 10;
  console.log(x);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  try {
    console.log(typeof secret); // typeof does NOT rescue a TDZ binding
  } catch (e) {
    console.log(e.constructor.name);
  }
  const secret = 'hidden';
  console.log(typeof secret);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const x = 'outer';
  {
    try {
      console.log(x); // this block has its own x — in the TDZ here
    } catch (e) {
      console.log(e.constructor.name);
    }
    const x = 'inner';
    console.log(x);
  }
  console.log(x);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  try {
    count = 5; // assignment before the let declaration → TDZ
  } catch (e) {
    console.log(e.constructor.name);
  }
  let count;
  console.log(count);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  {
    const item = 'first';
    console.log(item);
  }
  {
    try {
      console.log(item); // this block's own item is in the TDZ here
    } catch (e) {
      console.log(e.constructor.name);
    }
    const item = 'second';
    console.log(item);
  }
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement `safeRead` — run `fn()` and return its result; if it throws
// (e.g. a TDZ ReferenceError), return `fallback` instead.
function safeRead(fn, fallback) {
  // your code here
}

function task6() {
  console.log(safeRead(() => 42, 0)); // must be 42
  console.log(safeRead(() => tdzVar, 'fallback')); // tdzVar is in the TDZ here
  let tdzVar = 'x'; // this declaration runs after the call above
}
// task6();

module.exports = { safeRead };
