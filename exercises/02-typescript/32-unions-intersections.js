'use strict';
// Lesson 32 — Union & Intersection Types. Run with:  node exercises/02-typescript/32-unions-intersections.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Types live in comments so this runs on plain Node.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A union is OR:  type Id = string | number;
function render(id) {
  return `id: ${id}`;
}

console.log(render(42));
console.log(render('user_7'));

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A literal union replaces an enum:  type Size = 'small' | 'medium' | 'large';
function label(size) {
  return `Size: ${size}`;
}

console.log(label('medium'));
// console.log(label('huge')); // would fail to compile — not in the union

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A union of objects exposes only the COMMON properties without narrowing.
const result = { status: 'ok', data: 'payload' };
console.log(result.status); // both members have `status`
// console.log(result.data); // would fail to compile on a Success | Failure union

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Narrowing on the discriminant unlocks member-specific properties.
// In TS: switch (r.status) { case 'ok': ... case 'error': ... }
function handle(r) {
  return r.status === 'ok' ? r.data : r.error;
}

console.log(handle({ status: 'ok', data: 'payload' }));
console.log(handle({ status: 'error', error: 'boom' }));

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// An intersection is AND — all fields of both:
// type Person = HasName & HasAge;
const person = { name: 'Mansha', age: 28 };
console.log(person.name, person.age);

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// (string | number)[] is an array of either; string | number[] is a string
// OR an array of numbers. Which is `mix` below? (comment your answer)
const mix = ['a', 1, 'b'];
console.log(mix.map((m) => `${m}!`));

module.exports = { render, label, handle };
