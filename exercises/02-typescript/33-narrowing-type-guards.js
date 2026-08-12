'use strict';
// Lesson 33 — Narrowing & Type Guards. Run with:  node exercises/02-typescript/33-narrowing-type-guards.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Types live in comments so this runs on plain Node.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// typeof narrows to a primitive type inside the block:
function describe(value) {
  if (typeof value === 'string') {
    return `string: ${value.toUpperCase()}`;
  }
  return `number: ${value.toFixed(2)}`;
}

console.log(describe('hi'));
console.log(describe(3.14159));

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Array.isArray narrows to an array:
function firstItem(x) {
  if (Array.isArray(x)) {
    return x[0];
  }
  return x;
}

console.log(firstItem(['a', 'b']));
console.log(firstItem('solo'));

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// instanceof narrows to a class (and its subclasses):
function describeError(err) {
  if (err instanceof Error) {
    return `Error: ${err.message}`;
  }
  return `String: ${err}`;
}

console.log(describeError(new Error('boom')));
console.log(describeError('not an error'));

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The `in` operator narrows by property PRESENCE:
function move(pet) {
  if ('swim' in pet) {
    return pet.swim();
  }
  return pet.fly();
}

console.log(move({ swim: () => 'swimming' }));
console.log(move({ fly: () => 'flying' }));

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Discriminated-union narrowing on a literal field:
function handle(r) {
  if (r.status === 'ok') {
    return `data: ${r.data}`;
  }
  return `error: ${r.error}`;
}

console.log(handle({ status: 'ok', data: 'payload' }));
console.log(handle({ status: 'error', error: 'boom' }));

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A type predicate validates an unknown response. In TS the signature is:
// function isUser(value: unknown): value is User { ... }
// Write the predicate's comment-typed version below, then predict the filter:
const response = [
  { id: 1, name: 'Mansha' },
  { id: 'nope' }, // not a valid user — filtered out
];

function isUser(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.name === 'string'
  );
}

console.log(response.filter(isUser));

module.exports = { describe, firstItem, isUser };
