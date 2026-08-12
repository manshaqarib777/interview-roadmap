'use strict';
// Lesson 80 — Zustand. Run with:  node exercises/03-react/80-zustand.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React needed: these are pure-JS models of Zustand's core — set, get,
// and selector subscriptions (useSyncExternalStore under the hood).

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Model of Lesson 80: set() MERGES a partial into the state.
let state = { items: [], total: 0 };
function set(partial) {
  state = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
}
function task1() {
  set({ items: [{ id: 1 }] });
  set({ total: 9 });
  console.log('state after merges:', state);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement a tiny store factory: subscribe(selector, callback) must call
// callback only when the SELECTED value changed (Object.is), not on every set.
function createSelectorStore(initial) {
  let state = initial;
  const listeners = new Set();
  function set(partial) {
    // your code here — merge, then notify only subscribers whose
    // selected value changed (compare with Object.is)
  }
  function subscribe(selector, callback) {
    // your code here — remember the selector's last value per subscription
    // return an unsubscribe function
    return () => {};
  }
  return { get: () => state, set, subscribe };
}

const store = createSelectorStore({ user: 'Mansha', count: 0 });
const log = [];
store.subscribe((s) => s.count, (n) => log.push(`count → ${n}`));
store.subscribe((s) => s.user, (n) => log.push(`user → ${n}`));
store.set({ count: 1 });
store.set({ user: 'Ali' });
console.log('notified:', log.join(' | ')); // count changed, user changed

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The Lesson 6 reference trap in store form: selecting a WHOLE array
// re-renders on any change to it, even when the same items are there.
function task3() {
  const before = [1, 2, 3];
  const after = [...before]; // new array, same contents
  console.log('Object.is(before, after):', Object.is(before, after));
  console.log('selecting .length instead:', Object.is(before.length, after.length));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Fix the stale-selector bug: useStore(s => ({ n: s.count })) returns a
// NEW object every render. Implement useShallow — compare the fields
// structurally instead of by reference.
function useShallow(selectedValue) {
  // your code here — return true when the two objects' values are
  // equal field-by-field (shallow), false otherwise
  return false;
}

function task4() {
  const a = { n: 1, m: 'x' };
  const b = { n: 1, m: 'x' }; // same values, different reference
  console.log('Object.is:', Object.is(a, b));       // expect false
  console.log('useShallow:', useShallow(a, b));     // expect true
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Lesson 80's outside-React escape hatch: getState() reads without
// subscribing — a timer or analytics module can call it anywhere.
function task5() {
  const counter = { n: 0 };
  counter.n = counter.n + 1;   // pretend: store.getState().n += 1
  counter.n = counter.n + 1;
  console.log('imperative read (no subscription):', counter.n);
}
// task5();

module.exports = { createSelectorStore, useShallow };
