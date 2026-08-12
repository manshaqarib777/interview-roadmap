'use strict';
// Lesson 18 — Debounce & Throttle. Run with:  node exercises/01-javascript/18-debounce-throttle.js
// Predict every output BEFORE running. Write your prediction in the comment.
// NOTE: some tasks use setTimeout — predictions are about the ORDER, and
//       the last line of each task logs when the debounce/throttle fired.

// ── Task 1 ──────────────────────────────────────────────────────────
// Implement debounce. Three rapid calls must produce ONE execution,
// with the LAST message, 100ms after the burst stops.
function debounce(fn, delay) {
  // your code here
}

function task1() {
  const log = debounce((msg) => console.log('debounced:', msg), 100);
  log('a'); log('b'); log('c');
  // after ~100ms of silence → 'debounced: c'
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________  — 6 calls in 50ms, delay 200ms.
// How many times does 'throttled:' print? With what arguments?
function throttle(fn, wait) {
  // your code here
}

function task2() {
  const t = throttle((n) => console.log('throttled:', n), 200);
  for (let i = 1; i <= 6; i++) t(i);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Add a `cancel` method so a scheduled debounce can be aborted.
function debounceWithCancel(fn, delay) {
  // your code here (return a function with a .cancel property)
}

function task3() {
  const log = debounceWithCancel((msg) => console.log('fired:', msg), 100);
  log('never');          // scheduled for +100ms
  log.cancel();          // must abort it
  // 120ms later: nothing should print
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Leading-edge debounce: first call runs NOW, then blocked until quiet.
function debounceLeading(fn, delay) {
  let timer = null;
  let shouldRun = true;
  return function (...args) {
    if (shouldRun) { fn.apply(this, args); shouldRun = false; }
    clearTimeout(timer);
    timer = setTimeout(() => { shouldRun = true; }, delay);
  };
}

function task4() {
  const log = debounceLeading((n) => console.log('leading:', n), 100);
  log(1); log(2); log(3);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Fix the bug: the click handler below must keep the right `this`.
// Complete the wrapper so `u.save()` prints the username, not undefined.
const debounceThis = (fn, delay) => {
  // your code here
};

function task5() {
  const user = {
    name: 'Mansha',
    save: debounceThis(function () {
      console.log('saving for', this.name);
    }, 50),
  };
  user.save(); user.save(); user.save();
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A debounced function that ALSO forwards arguments. Predict the order:
function task6() {
  const log = debounceWithCancel((a, b) => console.log('sum:', a + b), 100);
  log(1, 2);
  log(10, 20);
  setTimeout(() => log(100, 200), 300);
}
// task6();

module.exports = { debounce, throttle, debounceWithCancel, debounceThis };
