'use strict';
// Lesson 46 — tsconfig & Strict Mode. Run with:  node exercises/02-typescript/46-tsconfig-strict.js
// strictNullChecks = null must be handled; noImplicitAny = no silent any;
// noUncheckedIndexedAccess = arr[i] may be missing. No compiler here, so we
// write code that *runs safely* under those rules.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Under strictNullChecks, `user.address` may be null — handle it.
const user = { name: 'Mansha', address: null };

function city(user) {
  return user.address === null ? 'no address' : user.address.city;
}

function task1() {
  console.log(city(user));
  console.log(city({ name: 'Ali', address: { city: 'Riyadh' } }));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Under noUncheckedIndexedAccess, rows[i] may be undefined — check first.
function firstRow(rows) {
  if (rows.length === 0) return 'no rows';
  return rows[0].toUpperCase();
}

function task2() {
  console.log(firstRow(['a', 'b']));
  console.log(firstRow([]));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement a runtime `noImplicitAny` linter: flag function params that are
// used but never annotated (represented here as a missing JSDoc-style type).
// Annotated parameters look like { name: 'x', type: 'string' }.
function findImplicitAny(params) {
  // your code here: return the names of params that have NO type
}

function task3() {
  console.log(findImplicitAny([
    { name: 'id', type: 'number' },
    { name: 'cb' },               // ← implicit any
    { name: 'opts', type: 'string | undefined' },
  ]));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// strictNullChecks: a nullable field must be narrowed before use.
// Read the raw value, then decide — don't trust it.
function readSetting(raw) {
  const value = typeof raw === 'string' ? raw : 'fallback';
  return value.toUpperCase();
}

function task4() {
  console.log(readSetting('dark'));
  console.log(readSetting(null)); // 'fallback' path — safe, not a crash
  console.log(readSetting(undefined));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Migrating a "legacy" file to strict: every array access must be checked.
const rows = ['alpha', 'beta'];
const third = rows[2]; // allowed under strictNullChecks, crash under index-access

function task5() {
  if (typeof third === 'undefined') {
    console.log('missing row');
  } else {
    console.log(third.toUpperCase());
  }
}
// task5();

module.exports = { findImplicitAny, readSetting };
