'use strict';
// Lesson 99 — Top React Interview Questions.
// React-behavior gauntlet — but simulated with PLAIN JavaScript, so it runs
// with plain Node. Predict each behavior BEFORE running. The functions below
// stand in for React's machinery; the behavior being tested is the real one.
//   node exercises/05-interview-prep/99-react-questions.js

// ── Task 1 ──────────────────────────────────────────────────────────
// Batching: two setState-like calls in one "event". How many "renders"?
function task1() {
  const renders = [];
  let count = 0;

  // a plain-React simulation of React 18 batching:
  function handleClick() {
    const queued = [];
    const setCount = (updater) => queued.push(updater); // just queue
    setCount((prev) => prev + 1);                       // queued, not applied
    setCount((prev) => prev + 1);                       // queued, not applied
    // the batch flush — happens ONCE, before the render:
    queued.forEach((apply) => {
      count = apply(count);
    });
    renders.push(count); // one "render", with the merged value
  }

  handleClick();
  console.log('batching simulation:', JSON.stringify(renders));
  // Real React: two functional updates → ONE render, count = 2
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Keys: predict which list item keeps its DOM state when the list reorders.
function task2() {
  const list = ['a', 'b', 'c'];
  // With index keys, removing the first item "updates" the remaining nodes
  // into the wrong slots — the classic focus/input bug. With stable keys,
  // React reuses the right node. Answer: stable keys keep the DOM state.
  console.log('index keys: broken on reorder/filter — stable keys: correct');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Stale closures: why does this print 1 forever instead of counting up?
function task3() {
  const renderCounts = [];
  let count = 0;

  // a plain-React simulation of an effect with [] — the closure below is
  // created ONCE and captures `count` from the "first render" (value 0).
  const tick = () => {
    renderCounts.push(count + 1); // keeps computing 0 + 1 — stuck
  };
  tick();
  tick();
  tick();
  console.log('stale-effect simulation:', JSON.stringify(renderCounts));
  // Real React: setInterval(() => setCount(count + 1), 1000) with [] is stuck at 1
  // because the closure captured the first render's count. The functional
  // updater (setCount(prev => prev + 1)) is the fix.
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// useMemo vs useCallback: predict which is cached — a value or a function.
function task4() {
  // useMemo(() => expensive(), deps) → caches the RESULT
  // useCallback(fn, deps)            → caches the FUNCTION itself
  const memoResult = 42; // the cached computation result
  const callback = () => 42; // the cached function reference
  console.log('useMemo cached:', memoResult, '| useCallback cached:', callback());
  // In React: useCallback(fn, deps) is useMemo(() => fn, deps).
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Context re-renders: predict how many consumers re-render when the value
// object changes — then say the fix.
function task5() {
  const consumers = ['A', 'B', 'C'];
  // value object recreated every render → ALL consumers re-render
  console.log('consumers that re-render:', consumers.join(', '));
  // Fix: useMemo the value, split fast-changing contexts, or pass children
  // through so the subtree is created above the changing provider.
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Error boundaries: which errors are caught? Predict, then check the rules.
function task6() {
  // Caught: render errors, lifecycle errors, constructor errors of children
  // NOT caught: event handlers (need try/catch), async errors, the boundary's own errors
  console.log('error boundaries catch: render + lifecycle errors of children');
  console.log('error boundaries MISS: event handlers, async code, their own errors');
}
// task6();

module.exports = { task1, task2, task3, task4, task5, task6 };
