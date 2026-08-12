'use strict';
// Lesson 30 — Primitives, Arrays & Tuples. Run with:  node exercises/02-typescript/30-primitives-arrays-tuples.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Types live in comments so this runs on plain Node.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The type of each value (write it next to the value):
const t1 = [42, 'hi', true];
console.log(t1); // elements: number, string, boolean

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// In TS: const point: [number, number] = [3, 4];
const point = [3, 4];
console.log(point[0] + point[1]);

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Tuples are arrays at runtime — that's why `push` exists on a "fixed" pair.
const pair = ['retries', 3];
pair.push(9);
console.log(pair);
// In TS, `readonly` would block that push at COMPILE time. Comment the
// version you'd write to keep the pair fixed:

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Write a comment above this function with its TS signature,
// e.g. // function describe(labels: readonly string[]): string
function describe(labels) {
  return labels.join(', ');
}

console.log(describe(['ts', 'js']));

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// `number` covers integers AND floats — one type only.
const measures = [3, 3.14, -1, 0];
console.log(measures.map((m) => m * 2));

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The array inferred as number[] — a tuple needs an explicit annotation
// in TS. What does that annotation look like? (comment your answer)
const first = 10;
const second = 20;
const coords = [first, second];
console.log(coords);

module.exports = { describe };
