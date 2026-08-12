'use strict';
// Lesson 38 — Discriminated Unions. Run with:  node exercises/02-typescript/38-discriminated-unions.js
// Plain Node — the "types" below are plain JS values; predictions are about what TS would allow.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The canonical discriminated union: loading / error / success.
// What does the runtime switch print for each state?
function render(state) {
  switch (state.kind) {
    case 'loading':
      return 'Loading…';
    case 'error':
      return `Error: ${state.message}`;
    case 'success':
      return `${state.data.length} users`;
  }
}

function task1() {
  console.log(render({ kind: 'loading' }));
  console.log(render({ kind: 'error', message: 'network down' }));
  console.log(render({ kind: 'success', data: [{ id: 1, name: 'Ali' }] }));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// With a LITERAL discriminant, each case sees its own fields.
// If kind were `string` instead, what would TypeScript lose?
function task2() {
  // TS: `state.message` compiles ONLY inside case 'error',
  //     `state.data` compiles ONLY inside case 'success'.
  // With kind: string → no narrowing → those reads error out.
  console.log('with a literal discriminant, each case narrows the whole object;');
  console.log('with kind: string, narrowing is impossible.');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `assertNever` and an exhaustive `describe` that uses it.
// Adding a new member to the union must fail the build.
function assertNever(value) {
  // your code here
  // throw an Error mentioning the unhandled value
  throw new Error('unhandled');
}

function describe(state) {
  switch (state.kind) {
    case 'loading':
      return 'loading';
    case 'error':
      return `error: ${state.message}`;
    case 'success':
      return `success: ${state.data.length}`;
    default:
      // your code here — if all cases are handled, state is `never` here
      return assertNever(state);
  }
}

function task3() {
  console.log(describe({ kind: 'loading' }));
  console.log(describe({ kind: 'error', message: 'boom' }));
  console.log(describe({ kind: 'success', data: [1, 2, 3] }));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The generic version — AsyncState<T> — one union, any payload.
function task4() {
  // TS: type AsyncState<T> =
  //   | { kind: 'loading' }
  //   | { kind: 'error'; message: string }
  //   | { kind: 'success'; data: T };
  //
  // const users: AsyncState<User[]> = { kind: 'success', data: [...] };
  // const meta:  AsyncState<{ page: number }> = { kind: 'success', data: { page: 1 } };
  console.log('AsyncState<User[]> and AsyncState<{ page: number }> both type-check;');
  console.log('the payload type follows the generic argument.');
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Build a reducer-style function: take an action (discriminated on
// `type`) and update a counter. Return the new count.
// Actions: { type: 'inc', by }  |  { type: 'reset' }
function reducer(count, action) {
  // your code here
  return count;
}

function task5() {
  console.log(reducer(0, { type: 'inc', by: 5 }));
  console.log(reducer(5, { type: 'reset' }));
  console.log(reducer(2, { type: 'inc', by: 1 }));
}
// task5();

module.exports = { assertNever, describe, reducer };
