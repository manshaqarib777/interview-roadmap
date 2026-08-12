'use strict';
// Lesson 21 — Call Stack & Execution Contexts. Run with:  node exercises/01-javascript/21-call-stack.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  function inner() {
    console.log('inner sees:', msg);
  }
  function outer() {
    const msg = 'hello from outer';
    inner();
  }
  const msg = 'global hello';
  outer();
}
// task1();
// `inner` is defined in the GLOBAL scope, so it looks up `msg` in its own
// scope, then the global scope — NOT in outer's. Scope is lexical (where a
// function is written), so the answer is 'global hello'.

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement factorial WITHOUT recursion — an iterative version that never
// pushes more than a couple of frames onto the call stack.
function factorialIter(n) {
  // your code here
  return 1;
}

function task2() {
  console.log('factorialIter(5) =', factorialIter(5));
  console.log('factorialIter(170) =', factorialIter(170));
  // Uncomment the next line — recursion dies here, iteration doesn't:
  // console.log('factorialIter(100000) =', factorialIter(100000));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  function a() {
    return b();
  }
  function b() {
    return c();
  }
  function c() {
    return 42;
  }
  console.log('result:', a());
}
// task3();
// At the moment `c` runs, the call stack (bottom→top) is:
//   [global] → [a] → [b] → [c]   ← c is the top (running) frame

// ── Task 4 ──────────────────────────────────────────────────────────
// Make `getStackTrace()` return the list of frames below it, deepest first.
// Use the Error API, not a framework.
function getStackTrace() {
  // your code here
  return [];
}

function task4() {
  function level3() {
    return getStackTrace();
  }
  function level2() {
    return level3();
  }
  function level1() {
    return level2();
  }
  const frames = level1();
  console.log('frames:', frames.slice(0, 4));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  function recurse(n) {
    if (n <= 0) return 'done';
    return recurse(n - 1); // tail call — but plain engines still push a frame
  }
  console.log(recurse(5));
}
// task5();
// Works fine. Raise 5 to 1_000_000 in your head: every call pushes a frame
// until the stack overflows, because there's no frame reuse without proper
// tail-call optimisation.

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A works — why can you call `add` before its line runs?
// B throws — why doesn't the arrow work the same way?
function task6() {
  console.log('add(1, 2) =', add(1, 2));

  function add(a, b) {
    return a + b;
  }

  // console.log('sub(5, 2) =', sub(5, 2));   // uncomment → throws
  const sub = (a, b) => a - b;
}
// task6();
// During the execution context's CREATION phase, function declarations are
// hoisted and assigned, so `add` exists before its source line executes.
// `const sub` sits in the TDZ (Lesson 3) until its declaration runs — calling
// it early throws a ReferenceError.

module.exports = { factorialIter, getStackTrace };
