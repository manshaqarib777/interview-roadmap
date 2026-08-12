'use strict';
// Lesson 40 — Conditional Types. Run with:  node exercises/02-typescript/40-conditional-types.js
// Plain Node — the conditionals below are emulated in JS; predictions are about
// what TypeScript would resolve the type to.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `T extends U ? X : Y` for strings: is `value` assignable to `kind`?
function task1() {
  const kind = 'string';          // the "U" — what we're checking against
  const value = 'hello';          // the "T"

  // 'hello' extends 'string' → true  → branch 'yes'
  const result = typeof value === kind ? 'yes' : 'no';

  const value2 = 42;
  // 42 extends 'string' → false → branch 'no'
  const result2 = typeof value2 === kind ? 'yes' : 'no';

  console.log(result, result2);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate distribution: run the check per member, union the results.
// Members: 'a' | 'b' | 'c'   vs  'a'. Matches → 1, misses → 2.
function task2() {
  const members = ['a', 'b', 'c'];
  const results = members.map((m) => (m === 'a' ? 1 : 2));
  console.log(results.join(' '));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate Exclude<T, U> = T extends U ? never : T  → drop matches.
function exclude(members, drop) {
  // your code here
  return members;
}

function task3() {
  console.log(exclude(['a', 'b', 'c'], 'a').join(' '));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate Extract<T, U> = T extends U ? T : never  → keep matches.
function extract(members, keep) {
  // your code here
  return members;
}

function task4() {
  console.log(extract(['a', 'b', 'c'], ['a', 'b']).join(' '));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate NonNullable<T>: drop null and undefined from an array of values.
function task5() {
  const values = ['a', null, 'b', undefined, 'c'];
  const cleaned = values.filter((v) => v !== null && v !== undefined);
  console.log(cleaned.join(' '));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate the `never` gotcha: a member that hits the `never` branch drops
// out of the result instead of making the whole result `never`.
function dropA(members) {
  return members.filter((m) => m !== 'a');   // 'a' → 'never' → dropped
}

function task6() {
  console.log(dropA(['a', 'b', 'c']).join(' ')); // 'b' 'c'
  console.log(dropA([]).join(' ') || '<empty>'); // distributing over nothing → nothing
}
// task6();

module.exports = { exclude, extract };
