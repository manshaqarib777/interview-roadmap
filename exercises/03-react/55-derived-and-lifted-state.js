'use strict';
// Lesson 55 — Derived State & Lifting State. Run with:  node exercises/03-react/55-derived-and-lifted-state.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Derived state: computed in render, never stored.
// Prediction: ______________________
function task1() {
  const items = [
    { id: 1, name: 'Tea', status: 'done' },
    { id: 2, name: 'Bread', status: 'open' },
    { id: 3, name: 'Milk', status: 'done' },
  ];
  const filter = 'done';

  // derived — recomputed on every render, so it can never go stale
  const visible = items.filter((i) => i.status === filter);
  console.log('visible:', visible.map((i) => i.name).join(', '));
  console.log('count:', items.length);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The anti-pattern: copy state, then re-sync it. Predict what goes wrong.
// Prediction: ______________________
function task2() {
  let first = 'Ada';
  let last = 'Lovelace';
  let fullName = `${first} ${last}`;   // ❌ stored copy, like useState+useEffect

  first = 'Grace';                     // prop changes...
  console.log('stored copy still says:', fullName);

  fullName = `${first} ${last}`;       // ...until a re-sync happens
  console.log('after re-sync:', fullName);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Lifting: one owner, value down, callbacks up.
// Fix LiftedCounter so the increment ACTUALLY updates the total.
// Prediction: ______________________
function task3() {
  function makeCounter(initial) {
    let count = initial;               // LIFTED — lives in the "parent"
    const get = () => count;
    const set = (next) => { count = next; };
    return { get, set };
  }

  const parent = makeCounter(0);
  parent.set(parent.get() + 1);        // ✅ callback-up works...
  parent.set(parent.get() + 1);
  console.log('count after two increments:', parent.get());
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Spot the bug: a sibling that only gets the VALUE can't change it.
// Prediction: ______________________
function task4() {
  function makeCounter(initial) {
    let count = initial;
    return { get: () => count };
  }

  const counter = makeCounter(0);
  const count = counter.get();         // prop passed down: value only

  count = count + 1;                   // 💥 TypeError? comment this out to see the real bug
  console.log('count is now:', counter.get());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const items = [10, 20, 30];          // the one source of truth
  const total = items.reduce((a, b) => a + b, 0);   // derived
  const doubled = items.map((n) => n * 2);          // also derived

  items.push(40);                      // source changes...
  console.log('total still:', total);  // ...derived values are snapshots!
  console.log('new total:', items.reduce((a, b) => a + b, 0));
}
// task5();

module.exports = {};
