'use strict';
// Lesson 78 — Redux Toolkit. Run with:  node exercises/03-react/78-redux-toolkit.js
// No Redux here — plain JS that mimics configureStore + createSlice semantics.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Actions are serialisable objects with a `type`. Dispatches are
// synchronous: `store.dispatch(action)` runs the reducer immediately.
function mimicStore(reducer, initial) {
  let state = initial;
  const getState = () => state;
  const dispatch = (action) => { state = reducer(state, action); };
  return { getState, dispatch };
}

const store = mimicStore(
  (state, action) => action.type === 'increment' ? { count: state.count + 1 } : state,
  { count: 0 }
);
store.dispatch({ type: 'increment' });
store.dispatch({ type: 'increment' });
console.log('count after two increments:', store.getState().count);

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// `createSlice` auto-generates actions from reducers. Each action is a
// creator: call it with a payload to get `{ type, payload }`.
function createSlice({ name, initialState, reducers }) {
  const actions = {};
  const reducer = (state = initialState, action) => {
    const fn = reducers[action.type.replace(`${name}/`, '')];
    return fn ? fn(state, action) : state;
  };
  for (const key of Object.keys(reducers)) {
    actions[key] = (payload) => ({ type: `${name}/${key}`, payload });
  }
  return { name, reducer, actions };
}

const counter = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    addBy: (state, action) => state + action.payload,
  },
});
console.log('auto action:', counter.actions.increment());
console.log('auto action with payload:', counter.actions.addBy(5));

// ── Task 3 ──────────────────────────────────────────────────────────
// A slice reducer is still a reducer: it runs on (state, action).
// Predict the result after the two dispatches, then implement `decrement`.
const counter2 = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1, // your code here
  },
});
let c2 = 0;
c2 = counter2.reducer(c2, counter2.actions.increment());
c2 = counter2.reducer(c2, counter2.actions.decrement());
console.log('after increment + decrement:', c2);

// ── Task 4 ──────────────────────────────────────────────────────────
// A slice reducer ignores actions from OTHER slices (no cross-talk).
// Feed the counter reducer an action from a different slice.
const counter3 = createSlice({
  name: 'counter',
  initialState: 5,
  reducers: { increment: (state) => state + 1 },
});
const unrelated = { type: 'user/rename', payload: 'Ali' };
console.log('counter ignores unrelated action:', counter3.reducer(5, unrelated));

// ── Task 5 ──────────────────────────────────────────────────────────
// Selectors are pure functions: state in, derived value out.
// Implement `selectTotal` and `selectCount` without mutating anything.
const cartState = { items: [{ price: 5 }, { price: 7 }, { price: 9 }] };

function selectCount(state) {
  // your code here
  return state.items.length;
}
function selectTotal(state) {
  // your code here
  return state.items.reduce((sum, i) => sum + i.price, 0);
}
console.log('count:', selectCount(cartState));   // 3
console.log('total:', selectTotal(cartState));    // 21

module.exports = { createSlice, selectCount, selectTotal };
