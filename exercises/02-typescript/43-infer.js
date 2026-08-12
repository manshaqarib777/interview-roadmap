'use strict';
// Lesson 43 — infer. Run with:  node exercises/02-typescript/43-infer.js
// `infer` is a type-level pattern match. This file exercises the same
// shapes at runtime: pattern-matching, recursive unwrapping, destructuring.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A "promise" is modelled as { tag: 'promise', inner }. Pattern-match on tag.
function unwrapOne(value) {
  return value && value.tag === 'promise' ? value.inner : value;
}

function task1() {
  console.log(unwrapOne({ tag: 'promise', inner: 'hello' }));
  console.log(unwrapOne('plain string'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement the runtime Awaited<T>: unwrap NESTED promises recursively.
// e.g. unwrapPromises({tag:'promise', inner:{tag:'promise', inner:42}}) → 42
function unwrapPromises(value) {
  // your code here
}

function task2() {
  console.log(unwrapPromises({ tag: 'promise', inner: 'a' }));
  console.log(unwrapPromises({ tag: 'promise', inner: { tag: 'promise', inner: 42 } }));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement firstOf — the runtime twin of `T extends [infer A, ...infer Rest]`.
// Returns the first element of an array. Handle empty arrays by returning null.
function firstOf(pair) {
  // your code here
}

function task3() {
  console.log(firstOf(['left', 'right']));
  console.log(firstOf([]));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function flattenOne(arr) {
  return Array.isArray(arr) ? arr[0] : arr;
}

function task4() {
  console.log(flattenOne([10, 20]));   // one level deep
  console.log(flattenOne([[1, 2], [3, 4]])); // still nested?
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement flattenDeep — the recursive version of Task 4.
// [[1,2],[3,4]] → 1   (deepest element, like FlattenDeep<T>)
function flattenDeep(value) {
  // your code here
}

function task5() {
  console.log(flattenDeep([1, 2]));
  console.log(flattenDeep([[1, [2]], [[3]]]));
  console.log(flattenDeep('flat'));
}
// task5();

module.exports = { unwrapPromises, firstOf, flattenDeep };
