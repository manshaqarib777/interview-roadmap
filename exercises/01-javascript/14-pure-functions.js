'use strict';
// Lesson 14 — Pure Functions & Side Effects. Run with:  node exercises/01-javascript/14-pure-functions.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const base = { items: [1, 2, 3] };

  function addItemPure(cart, item) {
    return { ...cart, items: [...cart.items, item] };
  }

  const next = addItemPure(base, 4);
  console.log(base.items); // is the input touched?
  console.log(next.items);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const original = [3, 1, 2];
  const sorted = original.sort(); // sort mutates in place — or does it?
  console.log(original);
  console.log(sorted);
  console.log(original === sorted);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Rewrite addTax so it is PURE: same input → same output, and the input array
// is never mutated. Expected output: [ 120, 300, 108 ] twice, then [ 100, 250, 90 ].
function addTaxImpure(prices, rate) {
  for (let i = 0; i < prices.length; i++) {
    prices[i] = Math.round(prices[i] * (1 + rate));
  }
  return prices;
}

function addTaxPure(prices, rate) {
  // your code here
}

function task3() {
  const prices = [100, 250, 90];
  console.log(addTaxPure(prices, 0.2));
  console.log(addTaxPure(prices, 0.2)); // identical result again?
  console.log(prices); // input must still be [ 100, 250, 90 ]
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  let calls = 0;
  const square = (n) => {
    calls += 1;
    return n * n;
  };

  console.log(square(3));
  console.log(square(3));
  console.log('calls:', calls); // is square pure? does calls prove it?
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const settings = { theme: 'dark' };
  function applyTheme(s) {
    s.theme = 'light'; // mutating an argument — visible side effect?
    return s;
  }
  console.log(applyTheme(settings) === settings);
  console.log(settings.theme);
}
// task5();

module.exports = { addTaxPure };
