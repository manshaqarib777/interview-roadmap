'use strict';
// Lesson 44 — satisfies & as const. Run with:  node exercises/02-typescript/44-satisfies-as-const.js
// `satisfies` checks a shape without widening; `as const` freezes literals.
// This file practices the runtime twins: shape validation and freezing.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A mutable config object (no freezing here — mutation is allowed).
const config = { apiUrl: 'https://api.example.com', retries: 3 };
config.retries = 5;
console.log(config.retries);
// What would `as const` change here? Write it in the comment.

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function readFirst(ports) {
  return ports[0];
}
const ports = [80, 443];
console.log(readFirst(ports));
console.log(ports[0]);
// ports.push(8080); // uncomment: does this work for a plain array? Why?

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement a runtime `satisfies`: check that an object matches a shape,
// and return true/false. Shape is { apiUrl: string, retries: number }.
function satisfiesConfig(value) {
  // your code here
}

function task3() {
  console.log(satisfiesConfig({ apiUrl: 'x', retries: 2 }));      // true
  console.log(satisfiesConfig({ apiUrl: 'x' }));                  // missing key
  console.log(satisfiesConfig({ apiUrl: 42, retries: 2 }));       // wrong type
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement a shallow-freeze `as const` twin using Object.freeze.
// The returned object must be read-only (mutation should fail or throw).
function asConst(value) {
  // your code here
}

function task4() {
  const frozen = asConst({ method: 'GET', flags: ['a'] });
  try {
    frozen.method = 'POST';
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
  console.log('method =', frozen.method);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// as const freezes arrays into readonly tuples — at runtime that's a freeze.
function freezeTuple(value) {
  return Object.freeze(value);
}

function task5() {
  const tuple = freezeTuple(['GET', 'POST']);
  try {
    tuple.push('PUT');
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
  console.log(tuple.length);
}
// task5();

module.exports = { satisfiesConfig, asConst };
