'use strict';
// Lesson 29 — Why TypeScript?. Run with:  node exercises/02-typescript/29-why-typescript.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Types live in comments so this runs on plain Node — the real typecheck happens
// when you paste the same code into a .ts file.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// In TypeScript this would be: function double(n: number): number
function double(n) {
  return n * 2;
}

console.log(double(21)); // would compile
// console.log(double('21')); // would fail to compile — TS2345

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Where does this program's error surface: at compile time or runtime?
const user = { id: 1, name: 'Mansha' };

console.log(user.name.toUpperCase());
// console.log(user.email.toUpperCase()); // would not compile — property does not exist

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// This compiles fine. Why is the type system NOT protecting us here?
const config = { retries: 3 }; // imagine : any in TS
console.log(config.retries + 1);

// ── Task 4 ──────────────────────────────────────────────────────────
// Add a JSDoc style comment above `greet` describing the shape it accepts,
// then predict the output:
function greet(u) {
  return `Hello, ${u.name}`;
}

console.log(greet({ id: 7, name: 'Ali' }));

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The value survives as `any` — nothing checks it. How would you fix the
// boundary in TypeScript? (comment your answer below the output)
const raw = JSON.parse('{"id": 1, "name": "Mansha"}');
console.log(raw.name.toUpperCase());

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// TypeScript catches this at COMPILE time. Does plain JS catch it at all?
const arr = [1, 2, 3];
const sum = arr.reduce((total, item) => total + item, 0);
console.log(sum);

module.exports = { double };
