'use strict';
// Lesson 3 — Hoisting. Run with:  node exercises/01-javascript/03-hoisting.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  console.log(price); // var is hoisted, the initialization is not
  var price = 99;
  console.log(price);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  console.log(double(4)); // function declarations hoist in full
  function double(n) {
    return n * 2;
  }
  console.log(typeof double);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  try {
    console.log(before); // let is hoisted but uninitialized (TDZ)
  } catch (e) {
    console.log(e.constructor.name);
  }
  let before = 'ready';
  console.log(before);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  console.log(typeof speak); // a var and a declaration share the name
  var speak = function () {
    return 'later';
  };
  function speak() {
    return 'declared';
  }
  console.log(typeof speak);
  console.log(speak());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  if (true) {
    function inBlock() {
      return 'block';
    }
  }
  console.log(typeof inBlock); // a declaration inside a block, in strict mode
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Fill the gap with a function DECLARATION (not an expression) so the
// call below works because of hoisting.
function buildMessage() {
  const prefix = 'Hello, ';
  // your code here
  return prefix + greet();
}

function task6() {
  console.log(buildMessage()); // must be: Hello, world
}
// task6();

module.exports = { buildMessage };
