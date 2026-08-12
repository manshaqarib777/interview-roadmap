'use strict';
// Lesson 71 — When NOT to Optimize. Run with:  node exercises/03-react/71-when-not-to-optimize.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (cheap work behind a memo: every call pays the CHECK)
function task1() {
  let checks = 0;
  let computes = 0;
  const cache = new Map();
  const memoize = (fn) => (arg) => {
    checks += 1; // the per-render comparison — paid even on cache hits (Lesson 71 §4)
    if (cache.has(arg)) return cache.get(arg);
    computes += 1;
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };

  const triple = memoize((n) => n * 3); // trivial work — the memo is pure overhead
  console.log(triple(3));
  console.log(triple(3));
  console.log(triple(3));
  console.log('checks:', checks, 'computes:', computes);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (memo keyed by REFERENCE goes stale)
let sortRuns = 0;
function sortByAge(list) {
  sortRuns += 1;
  return [...list].sort((a, b) => a.age - b.age);
}

function task2() {
  const list = [{ name: 'a', age: 30 }, { name: 'b', age: 20 }];
  const memoizedSort = (l) => {
    if (memoizedSort.last === l) return memoizedSort.cached;
    memoizedSort.last = l;
    memoizedSort.cached = sortByAge(l);
    return memoizedSort.cached;
  };

  const first = memoizedSort(list);          // cold — computes
  list.push({ name: 'c', age: 10 });         // mutate — but `list` is the SAME reference
  const second = memoizedSort(list);         // cache hit on a stale value…
  console.log('first:', first.map((u) => u.name));
  console.log('second:', second.map((u) => u.name));
  console.log('sortRuns:', sortRuns);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (TWO memoized functions, ONE cache)
let calls = 0;
const sharedCache = new Map();

function cachedAdd(a, b) {
  const key = `${a},${b}`;
  if (sharedCache.has(key)) return sharedCache.get(key);
  calls += 1;
  const result = a + b;
  sharedCache.set(key, result);
  return result;
}

function cachedMul(a, b) {
  const key = `${a},${b}`;
  if (sharedCache.has(key)) return sharedCache.get(key); // collides with add's key
  calls += 1;
  const result = a * b;
  sharedCache.set(key, result);
  return result;
}

function task3() {
  console.log(cachedAdd(2, 3));
  console.log(cachedMul(2, 3)); // same key "2,3" — wrong cached result!
  console.log('calls:', calls);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (a FRESH object injected every render)
function withTheme(Component) {
  return function Wrapped(props) {
    const theme = { mode: 'dark' }; // NEW object on every call — memo can never skip
    return Component({ ...props, theme });
  };
}

function task4() {
  const Plain = (props) => props; // return the props it was given
  const Wrapped = withTheme(Plain);
  const first = Wrapped({});
  const second = Wrapped({});
  console.log('mode:', first.theme.mode);
  console.log('same theme object?', first.theme === second.theme); // fresh each render → false
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement isWorthMemoizing(cost, savings, renders) — the Lesson 71 decision:
//   'never'   — cost >= savings: the check costs as much as the work it skips
//   'measure' — savings win, but too few renders to matter: profile FIRST
//   'memo'    — cheap check, expensive work, enough renders: worth it
function isWorthMemoizing(cost, savings, renders) {
  // your code here
  return 'measure';
}

function task5() {
  console.log(isWorthMemoizing(1, 50, 1000)); // cheap check, heavy work, hot path
  console.log(isWorthMemoizing(50, 1, 1000)); // expensive check, trivial work
  console.log(isWorthMemoizing(1, 50, 1));    // heavy work — but it runs ONCE
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// A profiler-style story: a component re-renders `rendersPerSecond` times;
// each render costs `perRender` units; a memo comparison costs `perCheck`.
// Return TOTAL saved (or lost) per second if memo is applied.
//   > 0 → memo helps   < 0 → memo hurts
function profitPerSecond(perRender, perCheck, rendersPerSecond) {
  // your code here
  return 0;
}

function task6() {
  console.log('memo wins:', profitPerSecond(0.5, 0.01, 10000));  // 10k × 0.5 saved vs 10k × 0.01
  console.log('memo loses:', profitPerSecond(0.01, 0.5, 10000)); // trivial renders, pricey check
}
// task6();

module.exports = { isWorthMemoizing, profitPerSecond };
