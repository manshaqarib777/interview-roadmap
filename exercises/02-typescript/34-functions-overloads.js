'use strict';
// Lesson 34 — Functions & Overloads. Run with:  node exercises/02-typescript/34-functions-overloads.js
// Plain Node — the "types" below are plain JS values; predictions are about what TS would allow.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Three ways to describe ONE function shape. Which is which?
// (a) inline   (b) type alias   (c) interface call signature
function task1() {
  const greet = (name) => `Hi ${name}`;   // (a) inline
  // type Greet = (name: string) => string;   // (b) alias — comment in real TS
  // interface Greeter { (name: string): string } // (c) call signature

  console.log(greet('Ali'));
  console.log(greet('Sara'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Overloads: the FIRST matching signature wins (top-down).
// What would a TS compiler let through, and what would it reject?
function task2() {
  // TS equivalent:
  // function f(x: 'a'): string;      // overload 1 — most specific
  // function f(x: number): number;   // overload 2
  // function f(x: 'a' | number): string | number { return x; }

  const a = 'a';
  const n = 42;
  console.log('call 1:', typeof a, '→ returns', 'string');
  console.log('call 2:', typeof n, '→ returns', 'number');
  // call 3 would be: f(true)  → ❌ neither overload accepts a boolean
  console.log('call 3 rejected at compile time: true');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement an overloaded-style `format` that handles a number OR a
// string, mirroring the lesson's example. Fill the gaps.
function format(input, opts) {
  // your code here
  // if input is a number → input.toFixed(opts?.decimals ?? 2)
  // if input is a string → opts?.upper ? input.toUpperCase() : input
  return input;
}

function task3() {
  console.log(format(3.14159, { decimals: 2 }));
  console.log(format('hello', { upper: true }));
  console.log(format('plain'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// `void` return types are deliberately permissive: a function returning
// a value is assignable to a `() => void` handler. What does each print?
function task4() {
  const handler = () => 'hello';         // returns a string
  const callIt = (fn) => { console.log(fn()); };
  callIt(handler);                        // handler is assignable to () => void
  console.log('assignable to void: true');
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The implementation signature must be wider than the overloads.
// Order matters: overloads match top-down.
function task5() {
  // TS: the implementation `(x: string | number) => …` is NOT an overload —
  // callers never see it. Why does listing it first break narrowing?
  console.log('implementation signature is never public;');
  console.log('if listed first, it shadows the specific overloads.');
}
// task5();

module.exports = { format };
