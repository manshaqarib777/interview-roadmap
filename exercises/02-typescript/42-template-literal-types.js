'use strict';
// Lesson 42 — Template Literal Types. Run with:  node exercises/02-typescript/42-template-literal-types.js
// Plain Node — the template-literal types are emulated with runtime templates
// and string matching. Predictions are about what TypeScript would infer.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `on${AppEvent}` — derive handler names from an event union.
const APP_EVENTS = ['Click', 'Hover', 'Submit'];

function handlerNames(events) {
  // your code here — return `on` + event for each
  return events;
}

function task1() {
  console.log(handlerNames(APP_EVENTS).join(','));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `Capitalize<T>` — first letter uppercase, like the type-level util.
function capitalize(word) {
  // your code here
  return word;
}

function task2() {
  console.log(capitalize('click'), capitalize('hover'), capitalize('submit'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate `` `on${Capitalize<E>}` `` — combine both: prefix + capitalize.
function handlerName(event) {
  // your code here
  return event;
}

function task3() {
  console.log(handlerName('click'), handlerName('hover'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate the `${string}` wildcard matching: any string starting with `on`.
// What does the pattern accept?
function task4() {
  const pattern = /^on/;
  console.log(pattern.test('onClick'));     // ?
  console.log(pattern.test('onScroll'));    // ?
  console.log(pattern.test('click'));       // ?
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate a route shape: `/users/${number}` — what should match?
function task5() {
  const userRoute = /^\/users\/\d+$/;
  console.log(userRoute.test('/users/42'));   // ?
  console.log(userRoute.test('/users/abc'));  // ?
  console.log(userRoute.test('/users/'));     // ?
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Emulate extracting a route param with `infer`: capture `/users/<id>`.
function extractId(route) {
  // your code here — return the id, or null if it doesn't fit the shape
  return null;
}

function task6() {
  console.log(extractId('/users/42'));
  console.log(extractId('/users/42/posts'));
  console.log(extractId('/about'));
}
// task6();

module.exports = { handlerNames, capitalize, handlerName, extractId };
