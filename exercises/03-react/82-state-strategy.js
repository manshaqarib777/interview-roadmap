'use strict';
// Lesson 82 — Local vs Global vs Server State. Run with:  node exercises/03-react/82-state-strategy.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React needed: the decision rule (Lesson 82) is pure logic. Model it,
// then classify the same values the way an interviewer would.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Lesson 82's rule, in miniature: answer the four questions in ORDER and
// the class falls out.
function classify(serverOwned, oneComponent, outsideReact) {
  if (serverOwned) return 'server';
  if (oneComponent) return 'local';
  if (outsideReact) return 'store'; // shared + written from outside React
  return 'context'; // shared, React-only, near-static
}
function task1() {
  console.log('product catalogue →', classify(true, false, false));
  console.log('accordion open flag →', classify(false, true, false));
  console.log('theme →', classify(false, false, false));
  console.log('session token (timer renews it) →', classify(false, false, true));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The cart is cross-cutting client state. Model the store decision:
// implement set/notify so a subscriber re-renders ONLY when its selected
// slice changed — the Zustand story from Lessons 80 and 82.
function createSliceStore(initial) {
  let state = initial;
  const listeners = new Set();
  // your code here — set() merges a partial; each listener checks its
  // own selector's value with Object.is before firing
  return { get: () => state, set, subscribe };
  function subscribe(selector, fn) {
    // your code here — remember last selected value, return unsubscribe
    return () => {};
  }
}
// task2();
// const cart = createSliceStore({ items: [], total: 0 });
// const log = [];
// cart.subscribe((s) => s.total, (t) => log.push(`total → ${t}`));
// cart.set({ items: [{ id: 1 }] }); // total unchanged — subscriber silent
// cart.set({ items: [{ id: 1 }], total: 9 });
// console.log(log.join(' | '));

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The most expensive trap in Lesson 82: server data copied into a global
// store. Nobody invalidates it — the mirror goes stale forever.
const serverList = ['a', 'b', 'c'];
const globalStore = { list: [...serverList] }; // a COPY, not the server
function task3() {
  globalStore.list.push('d'); // a local mutation the server never sees
  console.log('store list:', globalStore.list.join(','));
  console.log('server still has:', serverList.join(','));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The invalidation loop (Lessons 81–82): after a mutation, the cache is
// marked stale and the NEXT read refetches. Implement it.
function createCache() {
  const entries = new Map();
  return {
    // your code here — get, set(data), and invalidate(key) that marks stale
    get: () => undefined,
    set: () => {},
    invalidate: () => {},
  };
}

function task4() {
  const cache = createCache();
  cache.set(['todos'], { data: ['a'], stale: false });

  cache.invalidate(['todos']);        // the write finished
  const before = cache.get(['todos']);
  console.log('data survives invalidation:', before.data);

  cache.set(['todos'], { data: ['a', 'b'], stale: false }); // the refetch
  console.log('after refetch:', cache.get(['todos']).data);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The straddle (Lesson 82 section 7): a value can sit between classes.
// Naming the straddle out loud is the senior answer — the rule still
// resolves it.
function task5() {
  const draftSavedLocally = true;   // local: one component, dies on unmount
  const cartSharedAndExternal = true; // store: written from outside React
  console.log('draft is local because…', draftSavedLocally);
  console.log('cart is a store because…', cartSharedAndExternal);
}
// task5();

module.exports = { classify, createCache, createSliceStore };
