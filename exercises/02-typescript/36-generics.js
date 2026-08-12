'use strict';
// Lesson 36 — Generics. Run with:  node exercises/02-typescript/36-generics.js
// Plain Node — the "types" below are plain JS values; predictions are about what TS would allow.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The generic identity function. In TS the return type tracks the input.
// At runtime the same JS does the obvious thing — what prints?
function identity(value) {
  return value;
}

function task1() {
  const a = identity(42);        // TS: T = number  →  a: number
  const b = identity('hello');   // TS: T = string  →  b: string
  console.log(typeof a, typeof b, b);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The classic:  function first<T>(arr: T[]): T | undefined
// The return is T | undefined because arr[0] may not exist.
function first(arr) {
  return arr[0];
}

function task2() {
  const n = first([10, 20, 30]);       // TS: number | undefined
  const s = first(['a', 'b']);         // TS: string | undefined
  const e = first([]);                 // TS: undefined (empty)
  console.log(n, s, e);
  console.log('TS types:', 'number | undefined', 'string | undefined', 'undefined');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Multiple type parameters: pair<A, B>(a, b) → [A, B].
// Each parameter is inferred independently.
function pair(a, b) {
  return [a, b];
}

function task3() {
  const p = pair(1, 'one');     // TS: [number, string]
  const q = pair('x', true);    // TS: [string, boolean]
  console.log(p, q);
  console.log('TS types:', '[number, string]', '[string, boolean]');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement `last` — the mirror of `first`. Return the final element.
// TS signature:  function last<T>(arr: T[]): T | undefined
function last(arr) {
  // your code here
  return undefined;
}

function task4() {
  console.log(last([1, 2, 3]));
  console.log(last(['x']));
  console.log(last([]));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement `mapPair`: take an array of [A, B] tuples and return an array
// of { first: A, second: B } objects (the lesson's code example).
function mapPair(arr) {
  // your code here
  // e.g. [[1, 'one'], [2, 'two']] → [{ first: 1, second: 'one' }, …]
  return arr;
}

function task5() {
  const pairs = mapPair([[1, 'one'], [2, 'two']]);
  console.log(pairs[0]);
  console.log(pairs[1]);
}
// task5();

module.exports = { identity, first, pair, last, mapPair };
