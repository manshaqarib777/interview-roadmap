'use strict';
// Lesson 73 — Render Props. Run with:  node exercises/03-react/73-render-props.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// The lesson's contract, without JSX: a render-prop COMPONENT is a function
// that CALLS a function-prop (the render fn) with its state and returns the
// result. Same shape as <Mouse>{(pos) => …}</Mouse>.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (the render fn is CALLED with state)
function task1() {
  const Mouse = (renderFn) => renderFn({ x: 10, y: 20 });
  const App = () => Mouse((pos) => `mouse at ${pos.x}, ${pos.y}`);
  console.log(App());
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (parent state changes → re-call → fresh markup)
function task2() {
  const Tracker = (renderFn) => {
    let n = 0;
    const result1 = renderFn(n);
    n += 1; // the parent "updated its state"
    const result2 = renderFn(n);
    return [result1, result2].join(' | ');
  };
  console.log(Tracker((n) => `n=${n}`));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement Mouse: call renderFn(pos) with { x: 5, y: 7 } and return its
// result. The caller decides the markup — the parent only owns the state.
function Mouse(renderFn) {
  // your code here
}

function task3() {
  const App = () => Mouse((pos) => `x=${pos.x} y=${pos.y}`);
  console.log(App()); // must be "x=5 y=7"
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (two args, like DataList passing each row)
function task4() {
  const DataList = (rows, renderItem) => rows.map(renderItem).join(' | ');
  const App = () => DataList([1, 2, 3], (n, i) => `${i}:${n}`);
  console.log(App());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (the render prop sees the CALLER's closure)
const bonus = 100;

function task5() {
  const Counter = (renderFn) => {
    let count = 0;
    count += 1;
    return renderFn(count);
  };
  const App = () => Counter((c) => `count=${c} bonus=${bonus}`);
  console.log(App());
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement DataList: call renderItem(row, index) for every row and join
// the results with ' | '. rows is an array; renderItem returns strings.
function DataList(rows, renderItem) {
  // your code here
}

function task6() {
  const users = [
    { name: 'a', age: 30 },
    { name: 'b', age: 20 },
  ];
  console.log(DataList(users, (u, i) => `${i}:${u.name}`)); // "0:a | 1:b"
  console.log(DataList(users, (u) => `${u.name}(${u.age})`)); // "a(30) | b(20)"
}
// task6();

module.exports = { Mouse, DataList };
