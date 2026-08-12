'use strict';
// Lesson 67 — React.memo. Run with:  node exercises/03-react/67-react-memo.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Simulate React.memo's shallow prop check with Object.is.
// Prediction: ______________________
function arePropsEqual(prev, next) {
  // your code here — one level deep, Object.is on each key
  return false;
}

console.log(arePropsEqual({ count: 3 }, { count: 3 })); // expect false
const same = { count: 3 };
console.log(arePropsEqual(same, same)); // expect true
console.log(arePropsEqual({ count: 3 }, { count: 4 })); // expect false

// ── Task 2 ──────────────────────────────────────────────────────────
// Memoise a "component" that counts how many times it renders.
function memo(renderFn) {
  let lastProps = null;
  let lastOutput = null;
  return (props) => {
    // your code here — return cached output when props are equal,
    // otherwise re-render and store props + output
    return renderFn(props);
  };
}

let renders = 0;
const Row = memo((props) => {
  renders += 1;
  return props.item;
});

const A = { item: 'a' };
Row(A); Row(A); Row(A);
console.log('renders after same props:', renders); // must be 1

// ── Task 3 ──────────────────────────────────────────────────────────
// Why does memo still re-render when an inline object is passed?
function task3() {
  const Row = memo((props) => props.item.id);
  Row({ item: { id: 1 } });
  Row({ item: { id: 1 } });
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Fix the parent so the memoised row skips. Make the props stable.
let task4Renders = 0;
const Row2 = memo((props) => {
  task4Renders += 1;
  return props.item.id;
});

function task4() {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
  // your code here — iterate with a stable item reference per row
}
// task4();
// console.log('Row2 renders:', task4Renders); // should be 3, one per item

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const heavy = memo(() => 'render!');
  console.log(heavy('x'), heavy('x'), heavy('y'));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement useCallback: return the SAME function reference while deps don't change.
function useCallback(fn, deps) {
  // your code here
  return fn;
}

const stable = useCallback(() => 1, []);
const stable2 = useCallback(() => 1, []);
console.log('stable reference:', stable === stable2); // expect true

module.exports = { arePropsEqual, memo, useCallback };
