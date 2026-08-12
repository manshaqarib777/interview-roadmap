'use strict';
// Lesson 25 — async / await. Run with:  node exercises/01-javascript/25-async-await.js
// Predict every output BEFORE running. Write your prediction in the comment.

const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
async function task1() {
  const result = await wait(5, 'done');
  console.log(result);
  return 'finished';
}
// task1().then((v) => console.log('task1 resolved with:', v));

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  async function load() {
    const a = await wait(10, 'A');
    const b = await wait(10, 'B');
    return `${a} then ${b}`;
  }
  load().then((v) => console.log(v));
  console.log('synchronous end');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Make this log 1, 2, 3 in order WITHOUT using a `for...of` loop.
// (Hint: Lesson 26 is still a few pages away — Promise.all is fair game.)
function task3() {
  const delays = [30, 10, 20];

  // your code here — one or two lines, no loops

  // expected: 1, 2, 3 (in that order)
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
async function task4() {
  console.log('before await');
  await wait(5, null);
  console.log('after await');
}
// task4();
// console.log('after task4() call');

// ── Task 5 ──────────────────────────────────────────────────────────
// Fix: run the two independent calls in PARALLEL, not sequentially.
function task5() {
  const first = () => wait(15, 'first');
  const second = () => wait(15, 'second');

  async function slow() {
    const a = await first();
    const b = await second();
    return [a, b];
  }

  async function fast() {
    // your code here — both start in the same tick
  }

  fast().then((v) => console.log(v));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  async function make() {
    return 5;
  }
  async function use() {
    const value = await make();
    return value * 2;
  }
  use().then((v) => console.log('use():', v));
  console.log('direct call:', make());
}
// task6();

module.exports = { wait };
