'use strict';
// Lesson 19 — Arrays & Array Methods. Run with:  node exercises/01-javascript/19-arrays.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Implement myMap from scratch — same length, new array.
function myMap(arr, fn) {
  // your code here
}

function task1() {
  console.log(myMap([1, 2, 3], (n) => n * 2));       // [2, 4, 6]
  console.log(myMap(['a', 'b'], (s) => s.toUpperCase()));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement myFilter — new array of only the truthy matches.
function myFilter(arr, fn) {
  // your code here
}

function task2() {
  console.log(myFilter([1, 2, 3, 4, 5], (n) => n % 2 === 1)); // [1, 3, 5]
  console.log(myFilter(['x', '', 'y'], (s) => s.length > 0));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement myReduce — with AND without an initial value.
function myReduce(arr, fn, initial) {
  // your code here
}

function task3() {
  console.log(myReduce([1, 2, 3], (a, b) => a + b, 0));       // 6
  console.log(myReduce([1, 2, 3], (a, b) => a + b));          // 6 (no init)
  console.log(myReduce([], (a, b) => a + b, 100));            // 100
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Group the orders by region using reduce.
const orders = [
  { region: 'EU', total: 10 },
  { region: 'US', total: 20 },
  { region: 'EU', total: 30 },
];
function task4() {
  const byRegion = orders.reduce((groups, order) => {
    groups[order.region] = (groups[order.region] || 0) + order.total;
    return groups;
  }, {});
  console.log(byRegion);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________  — what does B print, and why?
function task5() {
  const items = [{ n: 1 }, { n: 2 }];
  const doubled = items.map((item) => {
    item.n *= 2;
    return item;
  });
  console.log('doubled:', doubled);
  console.log('original:', items); // mutated?!
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement applyDiscount: return a NEW array with each product's price
// reduced by `percent` WITHOUT mutating the source objects.
// Expected: discounted [{price:9},{price:36}], originals untouched.
function applyDiscount(products, percent) {
  // your code here
}

function task6() {
  const products = [
    { name: 'A', price: 10 },
    { name: 'B', price: 40 },
  ];
  const discounted = applyDiscount(products, 10);
  console.log('discounted:', discounted);
  console.log('originals:', products); // must stay { price: 10 } and { price: 40 }
}
// task6();

module.exports = { myMap, myFilter, myReduce, applyDiscount };
