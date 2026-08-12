'use strict';
// Lesson 6 — Primitive vs Reference Types. Run with:  node exercises/01-javascript/06-primitive-vs-reference.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  let a = 5;
  let b = a; // primitives are copied by value
  b = 10;
  console.log(a, b);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const obj1 = { n: 1 };
  const obj2 = obj1; // objects are copied by reference
  obj2.n = 2;
  console.log(obj1.n, obj2.n);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  console.log({} === {});
  console.log({} == {});
  const x = { tag: 'x' };
  const y = x;
  console.log(x === y);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement `mutate` so the caller's array is changed. Then explain:
// why does the reassignment inside `replace` NOT change `arr` outside?
function mutate(arr) {
  // your code here
}

function replace(arr) {
  arr = [100]; // rebinding the local parameter only
}

function task4() {
  const nums = [1, 2, 3];
  mutate(nums);
  console.log(nums); // must be [1, 2, 3, 4]
  replace(nums);
  console.log(nums); // unchanged: the local rebinding did not leak out
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement `copyArray` so it returns a NEW array (shallow copy) —
// pushing to the copy must not change the original.
function copyArray(arr) {
  // your code here
}

function task5() {
  const original = [1, 2, 3];
  const copy = copyArray(original);
  copy.push(4);
  console.log(original, copy);
  console.log(original === copy); // must be false
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  function addOne(n) {
    n = n + 1; // n is a copy of the number
    return n;
  }
  function pushItem(arr) {
    arr.push(4); // arr is a reference to the same array
  }
  let count = 1;
  const list = [1, 2, 3];
  const newCount = addOne(count);
  pushItem(list);
  console.log(count, newCount);
  console.log(list);
}
// task6();

module.exports = { mutate, copyArray };
