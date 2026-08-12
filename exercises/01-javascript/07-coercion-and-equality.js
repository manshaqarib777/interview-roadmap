'use strict';
// Lesson 7 — Coercion, Truthy/Falsy & Equality. Run with:  node exercises/01-javascript/07-coercion-and-equality.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const values = [0, '', null, undefined, NaN, false];
  for (const v of values) {
    console.log(Boolean(v)); // the six falsy values
  }
  console.log(Boolean('0')); // non-empty string → truthy
  console.log(Boolean([])); // empty object → truthy
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  console.log(0 == ''); // both coerce to 0
  console.log(0 === '');
  console.log(0 == false);
  console.log(null == undefined);
  console.log(null === undefined);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  console.log('5' - 2); // - coerces to numbers
  console.log('5' + 2); // + concatenates when a string is involved
  console.log('5' * '2');
  console.log('5' + 2 + 3);
  console.log(1 + 2 + '3');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  console.log(Number('')); // empty string → 0
  console.log(Number('  42  ')); // whitespace is trimmed
  console.log(Number('12px'));
  console.log(Number([]));
  console.log(Number([3]));
  console.log(Number([1, 2]));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  console.log(NaN === NaN); // NaN is never equal to itself
  console.log(Number.isNaN(NaN));
  console.log(isNaN('abc')); // global isNaN coerces first
  console.log(Number.isNaN('abc')); // Number.isNaN does not
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement `isTruthy` so every falsy value returns false and every
// truthy value returns true. No calls to Boolean() allowed.
function isTruthy(v) {
  // your code here
}

function task6() {
  console.log(isTruthy(0), isTruthy(''), isTruthy(null));
  console.log(isTruthy(1), isTruthy('a'), isTruthy({}));
}
// task6();

module.exports = { isTruthy };
