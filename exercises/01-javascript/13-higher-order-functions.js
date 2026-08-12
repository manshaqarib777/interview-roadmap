'use strict';
// Lesson 13 — Higher-Order Functions & Callbacks. Run with:  node exercises/01-javascript/13-higher-order-functions.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const nums = [1, 2, 3, 4];

  const doubled = nums.map((n) => n * 2);
  const evens = nums.filter((n) => n % 2 === 0);
  const total = nums.reduce((sum, n) => sum + n, 0);

  console.log(doubled);
  console.log(evens);
  console.log(total);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement myMap — your own higher-order function with the same signature
// as Array.prototype.map: (arr, callback) => new array. The callback receives
// (value, index, array).
function myMap(arr, callback) {
  // your code here
}

function task2() {
  console.log(myMap([1, 2, 3], (n) => n * n)); // must be [ 1, 4, 9 ]
  console.log(myMap(['a', 'b'], (v, i) => `${i}:${v}`)); // must be [ '0:a', '1:b' ]
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const result = [];
  [1, 2, 3].forEach((n) => {
    result.push(n * 10);
    return n * 100; // forEach ignores the return — where does this value go?
  });
  console.log(result);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Write a `withTax(rate)` HOF that returns a function. Expected output: 120 and 90.
function withTax(rate) {
  // your code here
}

function task4() {
  const at20 = withTax(0.2);
  const at0 = withTax(0.0);
  console.log(at20(100));
  console.log(at0(90));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const orders = [
    { item: 'laptop', qty: 1, price: 900 },
    { item: 'mouse', qty: 2, price: 25 },
    { item: 'cable', qty: 3, price: 10 },
  ];

  const total = orders
    .filter((o) => o.qty > 1)
    .map((o) => o.qty * o.price)
    .reduce((sum, n) => sum + n, 0);

  console.log(total);
}
// task5();

module.exports = { myMap, withTax };
