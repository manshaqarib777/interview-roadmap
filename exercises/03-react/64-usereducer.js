'use strict';
// Lesson 64 — useReducer. Run with:  node exercises/03-react/64-usereducer.js
// A reducer is just a pure function — it runs in plain Node, no React needed.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Pure functions: same inputs → same output, every time.
// Which of these is a valid reducer? (Hint: the pure one)
function reducerA(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    default:
      return state;
  }
}
function reducerB(state, action) {
  state.count += 1;               // mutation — what's wrong here?
  return state;
}
const s1 = { count: 0 };
const a1 = reducerA(s1, { type: 'increment' });
const b1 = reducerB(s1, { type: 'increment' });
console.log('reducerA:', a1.count);
console.log('reducerB:', b1.count, '| original now:', s1.count);

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The default case must return the SAME state object.
// React uses identity to decide whether to re-render.
const initial = { count: 0 };
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
const unchanged = reducer(initial, { type: 'bogus' });
console.log('default returns same object?', unchanged === initial);

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement a cart reducer with 'add' and 'remove' actions.
// Rules: pure, no mutation, return new arrays/objects.
function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const item = action.payload;
      // your code here
      return {
        items: [...state.items, item],
        total: state.total + item.price,
      };
    }
    case 'remove': {
      // your code here
      const items = state.items.filter((i) => i.id !== action.payload);
      return { items, total: items.reduce((sum, i) => sum + i.price, 0) };
    }
    default:
      return state;
  }
}

function cartTask() {
  let state = { items: [], total: 0 };
  state = cartReducer(state, { type: 'add', payload: { id: 1, price: 5 } });
  state = cartReducer(state, { type: 'add', payload: { id: 2, price: 7 } });
  state = cartReducer(state, { type: 'remove', payload: 1 });
  console.log('items:', state.items.map((i) => i.id));
  console.log('total:', state.total); // must be 7
}
// cartTask();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// dispatch is stable across renders. "Stable" here = the function
// identity never changes, so it's safe to pass down or use in deps.
let dispatch;
function createDispatch() {
  dispatch = (action) => action.type; // stands in for React's dispatch
}
createDispatch();
const first = dispatch;
const second = dispatch;
console.log('dispatch stable?', first === second);

// ── Task 5 ──────────────────────────────────────────────────────────
// Side effects do NOT belong in a reducer (pure rule, Lesson 14).
// Fix the reducer below so it is pure: the "time" must come from the
// action, not from Date.now().
let lastTotal = null;
function impureReducer(state, action) {
  if (action.type === 'apply') {
    const discount = Math.random();          // ❌ not deterministic
    lastTotal = state.total * (1 - discount); // ❌ writes outside
    return { total: lastTotal };
  }
  return state;
}
function pureReducer(state, action) {
  // your code here
  if (action.type === 'apply') {
    return { total: state.total * action.payload.discount };
  }
  return state;
}
const p1 = pureReducer({ total: 100 }, { type: 'apply', payload: { discount: 0.2 } });
const p2 = pureReducer({ total: 100 }, { type: 'apply', payload: { discount: 0.2 } });
console.log('pure reducer deterministic?', p1.total === p2.total);

module.exports = { reducerA, reducerB, cartReducer, pureReducer };
