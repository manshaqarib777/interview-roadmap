'use strict';
// Lesson 12 — Arrow Functions. Run with:  node exercises/01-javascript/12-arrow-functions.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const obj = {
    label: 'obj',
    regular() {
      return this.label;
    },
    arrow: () => this.label, // what does an arrow inherit here?
  };

  console.log(obj.regular());
  console.log(obj.arrow()); // this at file/module level
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const timer = {
    label: 'timer',
    start() {
      setTimeout(() => console.log(this.label), 0); // arrow inherits from start
    },
  };
  timer.start();
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const arrow = () => 'arrow';
  console.log(arrow.hasOwnProperty('prototype')); // arrows have no prototype

  try {
    new arrow(); // can you construct an arrow?
  } catch (e) {
    console.log(e.constructor.name);
  }

  console.log(arrow.call({ forced: true })); // can call/bind rebind an arrow?
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Rewrite to use a rest parameter inside an arrow (arrows have no `arguments`).
// Expected output: [ 1, 2, 3 ] and 3
function task4() {
  const collect = () => {
    // your code here
  };
  console.log(collect(1, 2, 3)); // must log [ 1, 2, 3 ]
  console.log(collect().length); // must log 3
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const greet = () => 'hi';
  try {
    console.log(greet());
  } catch (e) {
    console.log(e.constructor.name);
  }

  const outer = {
    name: 'outer',
    run() {
      const inner = () => this.name; // which `this` does inner see?
      return inner();
    },
  };
  console.log(outer.run());
}
// task5();

module.exports = {};
