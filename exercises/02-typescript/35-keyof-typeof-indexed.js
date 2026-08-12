'use strict';
// Lesson 35 — keyof, typeof & Indexed Access. Run with:  node exercises/02-typescript/35-keyof-typeof-indexed.js
// Plain Node — the "types" below are plain JS values; predictions are about what TS would allow.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// typeof is compile-time in TS — but JS also has a runtime `typeof`.
// Note the difference: the RUNTIME typeof below returns strings like
// 'number' / 'string'. The TS typeof gives you a TYPE.
function task1() {
  const config = { url: '/api', retries: 3 };
  console.log(typeof config);          // runtime typeof — what does it print?
  console.log(typeof config.retries);  // runtime typeof of a number
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// keyof typeof obj — the keys of an object you already have.
// Object.keys gives the same keys at RUNTIME (a string[]).
function task2() {
  const users = { 1: 'Ali', 2: 'Omar' };
  // TS: type Keys = keyof typeof users;   // '1' | '2'
  const keys = Object.keys(users);          // runtime equivalent
  console.log('runtime keys:', keys.join(','));
  console.log('TS would type them as the literal union: "1" | "2"');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Indexed access: T[K] reads a property's TYPE. At runtime we emulate it
// by actually reading the property. What is the TYPE of each read?
function task3() {
  const user = { id: 1, name: 'Ali' };
  // TS:
  //   type Id   = typeof user['id'];    // number
  //   type Name = typeof user['name'];  // string
  //   type Any  = typeof user['id' | 'name'];  // number | string
  console.log('Id is number:', typeof user.id === 'number');
  console.log('Name is string:', typeof user.name === 'string');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// keyof on a UNION gives only the COMMON keys. In plain JS, the runtime
// equivalent is: which keys exist on every object in a list?
function task4() {
  const a = { a: 1, shared: 'x' };
  const b = { b: 2, shared: 'y' };
  // TS: keyof (typeof a | typeof b)  →  'shared' only
  const common = Object.keys(a).filter((k) => k in b);
  console.log('common keys:', common.join(','));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement a mini typed lookup: build a function that returns the value
// at a key, and print what the "type" of that value would be.
function pick(obj, key) {
  // your code here
  // return obj[key] — runtime equivalent of T[K]
  return undefined;
}

function task5() {
  const settings = { theme: 'dark', retries: 3 };
  const theme = pick(settings, 'theme');
  const retries = pick(settings, 'retries');
  console.log(theme, typeof theme);
  console.log(retries, typeof retries);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The classic operator mix-up:
//   typeof on a TYPE  →  error ('X' only refers to a type)
//   keyof on a VALUE  →  error ('x' refers to a value)
// Which of the two lines below would TS reject?
function task6() {
  const obj = { a: 1 };
  // typeof obj      → ✅ value → type
  // keyof obj       → ❌ keyof needs a type — should be `keyof typeof obj`
  console.log('keyof on a value is the error; typeof on a value is fine.');
}
// task6();

module.exports = { pick };
