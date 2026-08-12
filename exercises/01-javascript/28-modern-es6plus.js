'use strict';
// Lesson 28 — Modern ES6+ Essentials. Run with:  node exercises/01-javascript/28-modern-es6plus.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const count = 0;
  const title = '';
  const missing = null;

  console.log('a:', count ?? 5);
  console.log('b:', count || 5);
  console.log('c:', title ?? 'Untitled');
  console.log('d:', title || 'Untitled');
  console.log('e:', missing ?? 'fallback');
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const user = { profile: { address: null } };

  console.log('city:', user?.profile?.address?.city ?? 'unknown');
  console.log('zip:', user.profile?.address?.zip ?? 'none');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  function* alphabet() {
    yield 'a';
    yield 'b';
    return 'done';
  }

  const it = alphabet();
  console.log(it.next());
  console.log(it.next());
  console.log(it.next());
  console.log(it.next());
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement a generator that yields the first n Fibonacci numbers.
// fibonacci(7) should yield: 0, 1, 1, 2, 3, 5, 8
function* fibonacci(n) {
  // your code here
}

function task4() {
  console.log([...fibonacci(7)]);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const settings = { theme: undefined, retries: 0 };

  const theme = settings.theme ?? 'dark';
  const retries = settings.retries ?? 3;
  const debug = settings.debug ?? false;

  console.log({ theme, retries, debug });
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Make the counters independent — two generators, two separate states.
function task6() {
  function* counter(start) {
    let n = start;
    while (true) yield n++;
  }

  // your code here — create TWO counters and log one value from each

  // expected output: 10 and 100 (either order)
}
// task6();

module.exports = { fibonacci };
