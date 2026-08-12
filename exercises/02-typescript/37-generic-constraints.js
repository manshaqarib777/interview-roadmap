'use strict';
// Lesson 37 — Generic Constraints. Run with:  node exercises/02-typescript/37-generic-constraints.js
// Plain Node — the "types" below are plain JS values; predictions are about what TS would allow.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// `T extends { length: number }` grants the body `.length`.
// Which of these would TS REJECT at compile time?
function logLength(value) {
  console.log(value.length);   // TS: only valid because of the constraint
  return value;
}

function task1() {
  console.log(logLength('hello'));   // string has .length
  console.log(logLength([1, 2, 3])); // arrays have .length
  // logLength(42);                  // ❌ number has no .length — would not compile
  console.log('42 would be a compile error: no .length');
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A constraint does NOT widen: logLength('hello') returns string,
// not "{ length: number }".
function task2() {
  const s = logLength('hello');       // TS: s: string (T preserved)
  const a = logLength([1, 2, 3]);     // TS: a: number[]
  console.log('s is string:', typeof s === 'string');
  console.log('a is array:', Array.isArray(a));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `pick` — the key-constrained lookup:
//   function pick<T, K extends keyof T>(obj: T, key: K): T[K]
// At runtime it's just obj[key]; the constraint is what TS checks.
function pick(obj, key) {
  // your code here
  return undefined;
}

function task3() {
  const user = { id: 1, name: 'Ali', email: 'ali@example.com' };
  console.log(pick(user, 'id'));
  console.log(pick(user, 'name'));
  // pick(user, 'age');   // ❌ 'age' is not a key of user — compile error
  console.log("'age' would be a compile error: not a key");
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// `T extends 'a' | 'b'` — literal constraint. A plain `string` variable
// does NOT satisfy it, because it could be anything.
function task4() {
  // TS:
  //   function routeTo<T extends 'home' | 'about'>(r: T): string
  //   routeTo('home')   → ✅ literal
  //   const s: string = 'home'; routeTo(s) → ❌ too wide
  console.log("a literal 'home' satisfies the constraint;");
  console.log('a variable typed `string` does not — it could be anything.');
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement `total` — constrained to items that carry a price:
//   function total<T extends { price: number }>(items: T[]): number
function total(items) {
  // your code here
  // sum every item.price
  return 0;
}

function task5() {
  const cart = [
    { name: 'shirt', price: 25 },
    { name: 'hat', price: 10 },
  ];
  console.log(total(cart));
}
// task5();

module.exports = { logLength, pick, total };
