'use strict';
// Lesson 41 — Mapped Types. Run with:  node exercises/02-typescript/41-mapped-types.js
// Plain Node — the mapped types below are emulated in JS. Predictions are about
// what the shape transformation produces.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `{ [K in keyof T]: T[K] }` — an identity map over an object.
function mapIdentity(obj) {
  // your code here — return a NEW object with the same keys and values
  return obj;
}

function task1() {
  const user = { id: 1, name: 'Ali' };
  const copy = mapIdentity(user);
  copy.name = 'Omar';
  console.log(user.name, copy.name);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `Partial<T>` — every property optional. At runtime that means:
// build an object from only some of the source's keys.
function toPartial(obj, keys) {
  // your code here
  return obj;
}

function task2() {
  const user = { id: 1, name: 'Ali', email: 'ali@example.com' };
  const draft = toPartial(user, ['id', 'name']);   // email left out
  console.log(JSON.stringify(draft));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `Readonly<T>` at runtime — Object.freeze makes writes fail
// silently in sloppy mode, so we're in 'use strict' where they throw.
function task3() {
  const frozen = Object.freeze({ id: 1, name: 'Ali' });
  try {
    frozen.name = 'Omar';   // ❌ TypeError in strict mode
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
  console.log('name =', frozen.name);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `Record<K, V>` — build a map from a list of keys and a value.
function toRecord(keys, value) {
  // your code here
  return {};
}

function task4() {
  const byId = toRecord([1, 2, 3], 'user');
  console.log(JSON.stringify(byId));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate a value-mapping mapped type: `{ [K in keyof T]: T[K][] }`.
// Every value becomes an array containing the original value.
function mapToArrays(obj) {
  // your code here
  return obj;
}

function task5() {
  const counts = { a: 1, b: 2 };
  const arrays = mapToArrays(counts);
  console.log(JSON.stringify(arrays));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate key remapping with `as` — prefix every key with 'get'.
// `{ [K in keyof T as `get${K}`]: () => T[K] }`
function mapToGetters(obj) {
  // your code here
  return {};
}

function task6() {
  const user = { id: 1, name: 'Ali' };
  const getters = mapToGetters(user);
  console.log(Object.keys(getters).sort().join(','));
  console.log(getters.getName());
}
// task6();

module.exports = { mapIdentity, toPartial, toRecord, mapToArrays, mapToGetters };
