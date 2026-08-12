'use strict';
// Lesson 45 — unknown vs any vs never. Run with:  node exercises/02-typescript/45-unknown-any-never.js
// any = no checks, unknown = narrow before use, never = uninhabitable.
// In plain Node there is no type checker — so we simulate the three roles:
// unknown = a value you must verify before using; any = used as-is; never = unreachable.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// "any" — used as-is, no checks. Crashes at runtime if the shape is wrong.
function useAsIs(value) {
  return value.label.toUpperCase();
}

function task1() {
  console.log(useAsIs({ label: 'hello' }));
  // console.log(useAsIs(null)); // uncomment: "any" compiles, but this throws at runtime
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// "unknown" — verify before use. Implement a runtime guard, then use safely.
function isUser(x) {
  // your code here: return true only if x is an object with
  // id:number and name:string (mirror the Lesson 45 isUser guard)
}

function describeUser(x) {
  if (!isUser(x)) return 'malformed';
  return x.name;
}

function task2() {
  console.log(describeUser({ id: 1, name: 'Mansha' }));
  console.log(describeUser({ id: '1', name: 'Mansha' }));
  console.log(describeUser(null));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// "never" as the empty set: a function that can never return a value.
function fail(message) {
  throw new Error(message);
}

function task3() {
  console.log('before fail');
  try {
    fail('boom');
  } catch (err) {
    console.log('caught:', err.message);
  }
  console.log('after fail'); // does this run? why?
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement the runtime twin of `assertNever`: given any value, throw.
// Its signature would be (x: never) => never in TypeScript.
function assertNever(x) {
  // your code here
}

function task4() {
  try {
    assertNever({ kind: 'triangle' });
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Exhaustive narrowing: every known kind is handled; unknown kinds must fail.
const SHAPES = new Set(['circle', 'square']);

function area(shape) {
  if (shape.kind === 'circle') return Math.PI * shape.radius ** 2;
  if (shape.kind === 'square') return shape.side ** 2;
  if (!SHAPES.has(shape.kind)) throw new Error('unexpected: ' + shape.kind); // assertNever
}

function task5() {
  console.log(area({ kind: 'circle', radius: 2 }));
  try {
    area({ kind: 'triangle' });
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
}
// task5();

module.exports = { isUser, assertNever };
