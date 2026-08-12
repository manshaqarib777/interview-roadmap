'use strict';
// Lesson 88 — The Server/Client Boundary. Run with:  node exercises/04-nextjs/88-server-client-boundary.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (Plain Node models of serialization and the one-way boundary.)

// ── Task 1 ──────────────────────────────────────────────────────────
// What can cross the boundary? Check the values a server component
// might pass to a client component.
// Prediction: ______________________
function canCross(value) {
  if (typeof value === 'function') return false;
  if (value instanceof Date) return 'date';
  if (value instanceof Map) return 'map';
  return true;
}

function task1() {
  console.log(
    [
      canCross('hello'),                        // string
      canCross({ colors: ['#000', '#fff'] }),   // plain object
      canCross(new Date('2026-01-01')),         // Date
      canCross(() => 'hi'),                     // function
    ].join(', ')
  );
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Date crosses through a protocol encoder, not plain JSON. Model the RSC
// encoder: tag the value in the payload, untag it on arrival.
// Prediction: ______________________
const D = (d) => `D("${d.toISOString()}")`;

function decode(tagged) {
  // your code here
  return null;
}

function task2() {
  const payload = D(new Date('2026-01-01T00:00:00Z'));
  console.log('payload:', payload);
  console.log('decoded:', decode(payload) instanceof Date);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// A class instance fails even when its fields are plain data — the type
// is code. Model the serialization step: only plain objects pass.
// Prediction: ______________________
class Money {
  constructor(amount) {
    this.amount = amount;
  }
}

function isPlainObject(value) {
  return Object.getPrototypeOf(value) === Object.prototype;
}

function task3() {
  const plain = { amount: 5 }; // plain object ✅
  const instance = new Money(5); // class instance ❌
  console.log('plain crosses:', isPlainObject(plain));
  console.log('instance crosses:', isPlainObject(instance));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Server Actions cross as REFERENCES, not code. Model it: the client
// sends a string id; the server maps the id back to its own code.
// Prediction: ______________________
const SERVER = { updatePost: (id) => `updated ${id}` };
const registry = new Map([['$action_updatePost', 'updatePost']]);

function callFromClient(referenceId, ...args) {
  const name = registry.get(referenceId);
  if (!name) throw new Error('unknown action reference');
  return SERVER[name](...args); // the code itself never left the server
}

function task4() {
  const ref = '$action_updatePost';
  console.log('client sends:', ref);
  console.log('server runs:', callFromClient(ref, 7));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Children cross as OUTPUT; imports are forbidden. Model the boundary:
// server-rendered children are serialized into the payload, while a
// client→server import is rejected. Complete `boundaryCheck`.
function boundaryCheck(action) {
  // action: 'import-server' → 'blocked'   action: 'render-child' → 'crosses as output'
  // your code here
  return '?';
}

function task5() {
  console.log('client imports server module:', boundaryCheck('import-server'));
  console.log('server child passed in:', boundaryCheck('render-child'));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Why 'use server' imports break the build: importing the MODULE pulls
// server code into the client graph; importing an ACTION brings only a
// registered reference. Predict the outcome of each import.
// Prediction: ______________________
const ACTION_REGISTRY = new Set(['$action_updatePost']);
const SERVER_ONLY_MODULES = new Set(['db.ts', 'actions.ts']);

function importCheck(path) {
  if (SERVER_ONLY_MODULES.has(path)) return 'build error — server module';
  if (ACTION_REGISTRY.has(path)) return 'ok — action reference';
  return 'ok — plain module';
}

function task6() {
  console.log(importCheck('actions.ts')); // a 'use server' FILE
  console.log(importCheck('$action_updatePost')); // the registered ACTION
  console.log(importCheck('theme.ts')); // a plain shared module
}
// task6();

module.exports = { canCross, decode, isPlainObject, boundaryCheck };
