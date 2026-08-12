'use strict';
// Lesson 20 — Destructuring, Spread & Rest. Run with:  node exercises/01-javascript/20-destructuring-spread-rest.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const user = { name: 'Mansha', age: 28, city: 'Riyadh' };
  const { name, ...rest } = user;
  console.log(name);
  console.log(rest);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement mergeUser: take a user object and a patch, and return a NEW
// object with the patch applied — WITHOUT mutating the original.
function mergeUser(user, patch) {
  // your code here
}

function task2() {
  const user = { name: 'Mansha', age: 28 };
  const updated = mergeUser(user, { age: 29 });
  console.log(updated); // must NOT include any mutation of `user`
  console.log('original:', user); // must still be { name: 'Mansha', age: 28 }
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________  — nested mutation via shallow copy
function task3() {
  const original = { settings: { theme: 'dark' }, name: 'app' };
  const copy = { ...original };
  copy.settings.theme = 'light';
  console.log('copy.settings:', copy.settings);
  console.log('original.settings:', original.settings); // changed?!
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement updateSettings: change ONLY settings.theme, keep everything
// else (including the outer object) unchanged — without mutating input.
function updateSettings(state, theme) {
  // your code here
}

function task4() {
  const state = { name: 'app', settings: { theme: 'dark', lang: 'en' } };
  const next = updateSettings(state, 'light');
  console.log(next);            // settings.theme === 'light'
  console.log('original:', state); // untouched: theme 'dark'
  console.log('same inner?', next.settings === state.settings); // must be false
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________  — swap + defaults
function task5() {
  let a = 1;
  let b = 2;
  [a, b] = [b, a];
  console.log(a, b);

  const { x = 5 } = { x: null };
  const { y = 5 } = {};
  console.log(x, y);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement sumAll: any number of arguments → total. Then print the
// result of sumAll(1, 2, 3, 4, 5).
function sumAll(...nums) {
  // your code here
}

function task6() {
  console.log(sumAll(1, 2, 3, 4, 5)); // must be 15
  console.log(sumAll(10, 20));        // must be 30
}
// task6();

module.exports = { mergeUser, updateSettings, sumAll };
