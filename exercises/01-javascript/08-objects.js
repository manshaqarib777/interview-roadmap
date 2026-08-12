'use strict';
// Lesson 8 — Objects. Run with:  node exercises/01-javascript/08-objects.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const user = {
    name: 'Ada',
    'has-cat': true,
    2: 'two',
  };
  console.log(user.name);
  console.log(user['has-cat']);
  console.log(user[2]); // number keys are coerced to strings
  console.log(Object.keys(user));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const o = { a: 1, b: 2 };
  const key = 'a';
  o[key] = 10; // bracket access with a variable
  o.c = 3; // adding a new key
  console.log(o.a, o.c);
  console.log(Object.values(o));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `sumValues` using Object.values() only — no loops.
function sumValues(obj) {
  // your code here
}

function task3() {
  console.log(sumValues({ a: 1, b: 2, c: 3 })); // must be 6
  console.log(sumValues({})); // must be 0
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  const point = { x: 5, y: 7 };
  const { x, y } = point; // destructuring
  console.log(x, y);
  const { x: renamed, z = 0 } = point; // rename + default
  console.log(renamed, z);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const base = { a: 1 };
  const desc = Object.getOwnPropertyDescriptor(base, 'a');
  console.log(desc.writable, desc.enumerable, desc.configurable);
  const frozen = Object.freeze({ b: 2 });
  console.log(Object.isFrozen(frozen));
  try {
    frozen.b = 99; // strict mode: throws
  } catch (e) {
    console.log(e.constructor.name);
  }
  console.log(frozen.b);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement `merge` so it returns a NEW object containing every key
// from both `a` and `b`. If a key exists in both, `b` wins.
function merge(a, b) {
  // your code here
}

function task6() {
  const result = merge({ name: 'Ada', age: 36 }, { age: 37, city: 'London' });
  console.log(result); // must be { name: 'Ada', age: 37, city: 'London' }
}
// task6();

module.exports = { sumValues, merge };
