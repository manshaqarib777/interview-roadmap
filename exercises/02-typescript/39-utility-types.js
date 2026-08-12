'use strict';
// Lesson 39 — Utility Types. Run with:  node exercises/02-typescript/39-utility-types.js
// Plain Node — the "types" below are plain JS objects; predictions are about what TS would allow.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// These two objects are "the same" at runtime. In TS, what utility type
// does each represent?
function task1() {
  const user = { id: 1, name: 'Ali', email: 'ali@example.com' };

  // A = Pick<User, 'id' | 'name'>
  const a = { id: user.id, name: user.name };

  // B = Omit<User, 'email'>
  const b = { id: user.id, name: user.name, email: user.email };
  delete b.email;

  // C = Partial<User>
  const c = { id: 1 };

  console.log(JSON.stringify({ a, b, c }));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Deep-copy a user, then confirm the copy is independent (spread = shallow).
function task2() {
  const user = { id: 1, name: 'Ali', address: { city: 'Riyadh' } };
  const copy = { ...user };                    // what does the spread copy?

  copy.name = 'Omar';
  copy.address.city = 'Jeddah';

  console.log(user.name, user.address.city);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Build a Record<K, V> at runtime — a map of ids to users. Then derive
// a Pick-ed shape from one entry.
function task3() {
  const users = {
    1: { id: 1, name: 'Ali', email: 'ali@example.com' },
    2: { id: 2, name: 'Omar', email: 'omar@example.com' },
  };

  const keys = Object.keys(users).map(Number);
  console.log('record keys:', keys.join(','));

  const publicUser = (({ id, name }) => ({ id, name }))(users[1]);
  console.log('pick of user 1:', JSON.stringify(publicUser));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Emulate ReturnType<typeof fn> at runtime: call fn, capture its result,
// and describe the result's type.
function task4() {
  function getConfig() {
    return { theme: 'dark', verbose: false };
  }

  const config = getConfig();   // ReturnType<typeof getConfig> in TS
  config.theme = 'light';       // allowed: the object is not frozen

  // "Omit the returned theme" — build a copy without one key
  const { theme, ...rest } = config;
  console.log('rest has theme?', Object.hasOwn(rest, 'theme'), '→', JSON.stringify(rest));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Implement a manual "Pick" for plain objects — keep only listed keys.
function manualPick(obj, keys) {
  // your code here
  return obj;
}

function task5() {
  const user = { id: 1, name: 'Ali', email: 'ali@example.com' };
  const picked = manualPick(user, ['id', 'name']);
  console.log(JSON.stringify(picked));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement a manual "Omit" — remove the listed keys (mirror of Task 5).
function manualOmit(obj, keys) {
  // your code here
  return obj;
}

function task6() {
  const user = { id: 1, name: 'Ali', email: 'ali@example.com' };
  const stripped = manualOmit(user, ['email']);
  console.log(JSON.stringify(stripped));
}
// task6();

module.exports = { manualPick, manualOmit };
