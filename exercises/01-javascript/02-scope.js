'use strict';
// Lesson 2 — Scope & the Scope Chain. Run with:  node exercises/01-javascript/02-scope.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const planet = 'Earth';
  const galaxy = 'Milky Way';

  function inner() {
    console.log(galaxy); // found by walking up the scope chain
    const star = 'Sun';
    return star;
  }

  console.log(planet);
  console.log(inner());
  console.log(typeof star); // star only exists inside inner()
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  let visible = 'outer';
  if (true) {
    let hidden = 'inner'; // let is block-scoped: gone after the block
    console.log(visible, hidden);
  }
  console.log(visible);
  console.log(typeof hidden); // not visible outside the block
  if (true) {
    var leaked = 'var leaks'; // var ignores blocks
  }
  console.log(leaked);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const name = 'Ada';
  function outer() {
    const name = 'Grace';
    function inner() {
      return name; // the scope chain stops at the nearest binding
    }
    return inner();
  }
  console.log(name);
  console.log(outer());
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    let count = i; // shadows the outer count inside this block
    console.log(count);
  }
  console.log(count); // the outer count was never touched
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement `inner` so it returns a greeting built from `name` in
// buildGreeting's scope. Do NOT pass `name` to inner().
function buildGreeting(name) {
  function inner() {
    // your code here
  }
  return inner();
}

function task5() {
  console.log(buildGreeting('Ada')); // must be: Hello, Ada
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const env = 'local';
  function logEnv(env) {
    console.log(env); // the parameter shadows the outer env
  }
  logEnv('parameter');
  console.log(env);
}
// task6();

module.exports = { buildGreeting };
