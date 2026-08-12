'use strict';
// Lesson 79 — Async Thunks & Selectors. Run with:  node exercises/03-react/79-thunks-selectors.js
// No Redux here — plain JS mimicking createAsyncThunk's promise lifecycle
// and createSelector's memoisation.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// An async thunk dispatches `pending` first, then `fulfilled` on success
// or `rejected` on failure. Dispatch happens AFTER each await.
async function asyncThunk(mock, payload) {
  const events = [];
  events.push({ type: 'users/fetch/pending' });
  try {
    const result = await mock(payload);
    events.push({ type: 'users/fetch/fulfilled', payload: result });
  } catch (err) {
    events.push({ type: 'users/fetch/rejected', payload: err.message });
  }
  return events;
}
async function task1() {
  const ok = await asyncThunk((id) => Promise.resolve({ id, name: 'Ali' }), 7);
  const bad = await asyncThunk((id) => Promise.reject(new Error('404')), 7);
  console.log(ok.map((e) => e.type).join(' → '));
  console.log(bad.map((e) => e.type).join(' → '));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// `pending` and `fulfilled` are SYNC state updates; the network is the
// only async part. The reducer can therefore be a plain pure function
// even though the thunk is async.
const events2 = [];
function handleEvent(e) { events2.push(e); }
function fetchUser(id) {
  handleEvent({ type: 'users/fetch/pending' });
  Promise.resolve({ id, name: 'Ali' }).then((user) => {
    handleEvent({ type: 'users/fetch/fulfilled', payload: user });
  });
}
// Order of these two lines proves the point:
fetchUser(7);
console.log('sync after fetchUser call:', events2.length); // pending already logged?
// (wait a microtask before the final check)
Promise.resolve().then(() => console.log('after microtask:', events2.map((e) => e.type).join(' → ')));

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A memoised selector (createSelector) recomputes only when its input
// selectors return NEW references. Primitive numbers are compared by value.
function createSelector(inputs, compute) {
  let lastInputs = null;
  let lastResult = null;
  return (state) => {
    const current = inputs.map((f) => f(state));
    if (lastInputs !== null && current.every((v, i) => v === lastInputs[i])) {
      return lastResult;                    // hit the cache
    }
    lastInputs = current;
    lastResult = compute(...current);
    return lastResult;
  };
}
const selectItems = (s) => s.items;
const selectFilter = (s) => s.filter;
const selectVisible = createSelector(
  [selectItems, selectFilter],
  (items, filter) => items.filter((i) => i.name.includes(filter)),
);

const state1 = { items: [{ name: 'react' }, { name: 'redux' }], filter: 're' };
console.log('first call:', selectVisible(state1).map((i) => i.name));
console.log('second call (same refs):', selectVisible(state1).map((i) => i.name));

// ── Task 4 ──────────────────────────────────────────────────────────
// New array reference in state = recompute. Same data, new object.
let state2 = { items: [{ name: 'react' }, { name: 'redux' }], filter: 're' };
const call1 = selectVisible(state2);
state2 = { ...state2, items: [...state2.items] }; // new reference
const call2 = selectVisible(state2);
console.log('recomputed after new reference?', call1 !== call2);

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement an "extraReducers"-style handler: the thunk updates a slice
// through its three lifecycle actions. Return the next state.
function withExtraReducers(state, action) {
  switch (action.type) {
    case 'users/fetch/pending':
      return { ...state, status: 'loading', error: null };
    case 'users/fetch/fulfilled':
      // your code here — set the user and status 'idle'
      return { ...state, status: 'idle', user: action.payload };
    case 'users/fetch/rejected':
      // your code here — set error and status 'idle'
      return { ...state, status: 'idle', error: action.payload };
    default:
      return state;
  }
}
const s0 = { status: 'idle', user: null, error: null };
const s1 = withExtraReducers(s0, { type: 'users/fetch/pending' });
const s2 = withExtraReducers(s1, { type: 'users/fetch/fulfilled', payload: { id: 7, name: 'Ali' } });
const s3 = withExtraReducers(s2, { type: 'users/fetch/rejected', payload: '500' });
console.log('pending →', s1.status);
console.log('fulfilled →', s2.user.name, s2.status);
console.log('rejected →', s3.error, s3.status);

module.exports = { asyncThunk, createSelector, withExtraReducers };
