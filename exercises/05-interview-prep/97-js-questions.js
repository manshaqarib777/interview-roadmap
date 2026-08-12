'use strict';
// Lesson 97 — Top JavaScript Interview Questions.
// Output-prediction gauntlet: predict EVERY output BEFORE running.
// Write your prediction in the comment, then uncomment the task and run:
//   node exercises/05-interview-prep/97-js-questions.js

// ── Task 1 ──────────────────────────────────────────────────────────
// The classic event-loop ordering. Predict the exact output order.
function task1() {
  console.log('a');
  setTimeout(() => console.log('b'), 0);
  Promise.resolve().then(() => console.log('c'));
  console.log('d');
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Microtask-inside-microtask vs a timer scheduled before both.
// Prediction: ______________________
function task2() {
  setTimeout(() => console.log('timer'), 0);
  Promise.resolve()
    .then(() => console.log('p1'))
    .then(() => console.log('p2'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Closures: capture the variable, not the value. Predict the three lines.
// Prediction: ______________________
function task3() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('var →', i), 0);
  }
  for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('let →', j), 0);
  }
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Two counters from one factory. Independent scopes or shared?
// Prediction: ______________________
function task4() {
  function makeCounter() {
    let n = 0;
    return () => (n += 1);
  }
  const a = makeCounter();
  const b = makeCounter();
  a(); a();
  console.log(a(), b());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// this binding: implicit call, detached call, arrow. (strict mode is on!)
// Prediction: ______________________
function task5() {
  const name = 'module scope';

  const obj = {
    name: 'ali',
    greet() {
      console.log(this.name);
    },
    arrow: () => console.log(name),
  };
  const detached = obj.greet;

  obj.greet();
  try {
    detached();
  } catch (err) {
    console.log('detached:', err.constructor.name);
  }
  obj.arrow();
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Coercion gauntlet. Predict every line, then run.
// Prediction: ______________________
function task6() {
  console.log(0 == '0');
  console.log(0 === '0');
  console.log(null == undefined);
  console.log([] == false);
  console.log([1] + [2]);
  console.log('5' - 2);
}
// task6();

module.exports = { task1, task2, task3, task4, task5, task6 };
