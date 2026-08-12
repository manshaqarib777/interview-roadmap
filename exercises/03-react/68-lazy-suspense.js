'use strict';
// Lesson 68 — Lazy Loading & Suspense. Run with:  node exercises/03-react/68-lazy-suspense.js
// Predict every output BEFORE running. Write your prediction in the comment.

// A fake dynamic import: returns a promise that resolves to a module.
// In a browser this is `() => import('./Routes')`; here it's a setTimeout.

// ── Task 1 ──────────────────────────────────────────────────────────
// Implement lazy(): return a function that calls load() only on FIRST
// render (first call), caches the promise, and returns the resolved value.
function lazy(load) {
  // your code here
  return () => undefined;
}

let loads = 0;
const loadRoutes = () => {
  loads += 1;
  return Promise.resolve({ default: 'Routes loaded' });
};

const renderLazy = lazy(loadRoutes);
// renderLazy().then((v) => console.log('first:', v));
// renderLazy().then((v) => console.log('second:', v));
// console.log('loads after two renders:', loads); // must stay 1

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const cache = new Map();
  const load = (key) => {
    if (!cache.has(key)) cache.set(key, Promise.resolve(`module:${key}`));
    return cache.get(key);
  };
  const p1 = load('A');
  const p2 = load('A');
  console.log('same promise:', p1 === p2);
  p2.then(console.log);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Write a Suspense-style "resolve or fallback" helper. If the promise is
// still pending, return the fallback; if settled, return the value.
function resolveWithFallback(promise, fallback) {
  // your code here — track state: 'pending' | 'done', and the value
  return fallback;
}

// const p = new Promise((res) => setTimeout(() => res('data'), 50));
// console.log('immediately:', resolveWithFallback(p, 'spinner')); // spinner
// p.then(() => console.log('after settle:', resolveWithFallback(p, 'spinner'))); // data

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task4() {
  let settled = false;
  let value;
  const p = Promise.resolve('chunk');
  p.then((v) => { settled = true; value = v; });
  console.log('settled synchronously?', settled);
  Promise.resolve().then(() => console.log('later:', settled, value));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// lazy() with a named export would break (default export required).
// Fix by re-exporting as default. Simulate the module shape here.
function task5() {
  const moduleWithNamedExport = { Reports: 'Reports component' };
  // your code here — produce { default: moduleWithNamedExport.Reports }
}
// task5();

module.exports = { lazy, resolveWithFallback };
