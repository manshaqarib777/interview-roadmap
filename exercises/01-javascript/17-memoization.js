'use strict';
// Lesson 17 — Memoization. Run with:  node exercises/01-javascript/17-memoization.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Implement memoize for a single-argument function, using a Map cache.
let globalCalls = 0;
function memoize(fn) {
  // your code here
}

function task1() {
  const square = memoize((n) => {
    globalCalls += 1;
    return n * n;
  });
  console.log(square(9)); // must be 81
  console.log(square(9));
  console.log(square(9));
  console.log('calls:', globalCalls); // must be 1
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (careful — object keys)
function task2() {
  const total = memoize((o) => o.a + o.b);
  console.log(total({ a: 1, b: 2 }));
  console.log(total({ a: 1, b: 2 })); // same contents, NEW object
  console.log('calls:', globalCalls);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement memoize for MULTIPLE arguments. Single arg keys stay
// primitive; multiple args are stringified. Count the real fn calls.
function memoizeN(fn) {
  // your code here
}

function task3() {
  let calls = 0;
  const add = memoizeN((a, b) => { calls += 1; return a + b; });
  console.log(add(1, 2));
  console.log(add(1, 2));
  console.log(add(2, 1)); // different key — should recompute
  console.log('calls:', calls); // must be 2
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (why is this a BUG?)
function task4() {
  let n = 0;
  const read = memoize(() => n); // memoizes a non-pure function
  n = 42;
  console.log(read());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Memoize a recursive fibonacci without blowing the call stack,
// so fib(30) runs in O(n) calls. Count how many times fibBody runs.
function makeMemoFib() {
  const cache = new Map();
  const fibBody = (n) => {
    if (n <= 1) return n;
    return fibMemo(n - 1) + fibMemo(n - 2);
  };
  let calls = 0;
  function fibMemo(n) {
    if (cache.has(n)) return cache.get(n);
    calls += 1;
    const result = fibBody(n);
    cache.set(n, result);
    return result;
  }
  fibMemo.calls = () => calls;
  return fibMemo;
}

function task5() {
  const fib = makeMemoFib();
  console.log(fib(30)); // must be 832040
  console.log('calls:', fib.calls()); // must be 31
}
// task5();

module.exports = { memoize, memoizeN, makeMemoFib };
