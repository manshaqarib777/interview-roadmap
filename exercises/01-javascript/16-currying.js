'use strict';
// Lesson 16 — Currying & Partial Application. Run with:  node exercises/01-javascript/16-currying.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
const add = (a, b, c) => a + b + c;
const curried = (a) => (b) => (c) => a + b + c;
function task1() {
  console.log(add(1, 2, 3));
  console.log(curried(1)(2)(3));
  console.log(curried(10)(20)(30));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement curry so all three calls print 6. It must handle 2-arg
// functions AND variadic functions, so don't rely on fn.length alone.
function curry(fn, arity = fn.length) {
  // your code here
}

function task2() {
  const curriedAdd = curry((a, b, c) => a + b + c);
  console.log(curriedAdd(1)(2)(3));
  console.log(curriedAdd(1, 2)(3));
  console.log(curriedAdd(1, 2, 3));

  const sum = curry((...nums) => nums.reduce((t, n) => t + n, 0), 4);
  console.log(sum(1)(2)(3)(4)); // must be 10
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Build a `withConfig` factory that fixes the base once and applies it
// to many numbers. Add 10% to each.
function withConfig(base) {
  // your code here
}

function task3() {
  const addTenPercent = withConfig(1.1);
  console.log(addTenPercent(100)); // must be 110.00000000000001 style
  console.log(addTenPercent(200));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  const greet = (greeting) => (name) => `${greeting}, ${name}!`;
  const hi = greet('Hi');
  const hello = greet('Hello');
  console.log(hi('Mansha'));
  console.log(hello('Ali'));
  console.log(greet('Hey')('Sara'));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Fix the bug: curriedAdd(1)(2) currently returns a function (or NaN).
// Keep the default parameter. Use an explicit arity.
function task5() {
  const add = (a, b, c = 0) => a + b + c;
  const curriedAdd = curry(add, 3); // NOTE: curry() is defined above — works in scope
  console.log(curriedAdd(1)(2)(3)); // must be 6
}
// task5();

module.exports = { curry, withConfig };
