'use strict';
// Lesson 24 — Promises from Scratch. Run with:  node exercises/01-javascript/24-promises.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  const promise = new Promise((resolve) => {
    console.log('executor');
    resolve(1);
    resolve(2);
  });
  promise.then((value) => console.log('value:', value));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  Promise.resolve(2)
    .then((value) => { console.log('first:', value); })
    .then((value) => console.log('second:', value));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const p = Promise.resolve('a');
  p.then((v) => console.log('handler 1:', v));
  p.then((v) => console.log('handler 2:', v));
  console.log('after attach');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement a state machine with `state`, `value` and a `handlers` array,
// plus a `then` that registers one handler and returns `this`.
// Just the state transitions and queue — no chaining yet.
function ToyPromise() {
  this.state = 'pending';
  this.value = undefined;
  this.handlers = [];
}

ToyPromise.prototype._settle = function (state, value) {
  // your code here — only settle once, store the value, flush handlers
};

ToyPromise.prototype._handle = function (handler) {
  // your code here — queue while pending, otherwise run the handler
};

ToyPromise.prototype.then = function (onFulfilled) {
  // your code here — register a handler (run it now if already settled)
  return this;
};

function task4() {
  const p = new ToyPromise();
  p.then((value) => console.log('settled with:', value));
  p._settle('fulfilled', 42);
  p._settle('fulfilled', 99); // must be ignored
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const boom = Promise.reject(new Error('kaput'));
  boom
    .then(() => console.log('BAD: fulfilled ran'))
    .then(undefined, (err) => console.log('caught:', err.message));
  console.log('end of script');
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement `makePending()` — return { promise, resolve, reject } and then
// make the toy below resolve through the returned `resolve`.
function makePending() {
  // your code here
}

function task6() {
  const { promise, resolve } = makePending();
  promise.then((value) => console.log('resolved with:', value));
  resolve(7);
}
// task6();

module.exports = { ToyPromise, makePending };
