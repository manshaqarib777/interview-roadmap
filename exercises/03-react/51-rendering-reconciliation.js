'use strict';
// Lesson 51 — Rendering & Reconciliation. Run with:  node exercises/03-react/51-rendering-reconciliation.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React needed: these are pure-JS models of the render/commit ideas.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Model of Lesson 51: render computes a NEW tree every time (each render
// creates fresh object references — the Lesson 6 crux).
let renderCount = 0;
function render(name) {
  renderCount += 1;
  return { tag: 'h1', children: name, createdAt: renderCount };
}
const tree1 = render('Ali');
const tree2 = render('Ali'); // same props — but is it the same object?
function task1() {
  console.log('same tree object?', tree1 === tree2);
  console.log('tree1 createdAt', tree1.createdAt, '| tree2 createdAt', tree2.createdAt);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement diffElement(oldNode, newNode): return
//   'update'  if the element TYPE is the same (update the DOM node in place)
//   'replace' if the type changed (unmount old, mount new)
//   'mount'   if oldNode is null (first render)
//   'unmount' if newNode is null (removed)
// Lesson 51: reconciliation's core rule is type equality.
function diffElement(oldNode, newNode) {
  // your code here
}

function task2() {
  const a = { type: 'div', props: {} };
  const b = { type: 'div', props: { className: 'x' } }; // same type, new props
  const c = { type: 'section', props: {} };
  console.log('same type →', diffElement(a, b));
  console.log('changed type →', diffElement(a, c));
  console.log('first render →', diffElement(null, a));
  console.log('removed →', diffElement(a, null));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The reference trap (Lesson 6): a new array every render looks "changed"
// to React.memo's shallow compare, even when the contents are identical.
function shallowEqual(prev, next) {
  return Object.is(prev, next);
}
function task3() {
  const prev = { data: [1, 2, 3] };
  const next = { data: [1, 2, 3] }; // new array, same contents
  console.log('shallowEqual →', shallowEqual(prev.data, next.data));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement a pure render: derive nextState WITHOUT mutating current.
// Given current = { count: 2 }, return { count: 3 } as a new object.
// Then prove the original is untouched.
function increment(current) {
  // your code here
}

function task4() {
  const before = { count: 2 };
  const after = increment(before);
  console.log('after', after);
  console.log('original untouched?', before.count === 2, '| same object?', before === after);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Effect timing: effects run AFTER commit, so a "render log" and an
// "effect log" are in different phases — commit is synchronous first.
const log = [];
function renderPhase() {
  log.push('render');
}
function commitAndEffects() {
  log.push('commit');
  log.push('effect');
}
function task5() {
  renderPhase();
  renderPhase(); // re-render with same result
  commitAndEffects();
  console.log(log.join(' → '));
}
// task5();

module.exports = { diffElement, increment };
