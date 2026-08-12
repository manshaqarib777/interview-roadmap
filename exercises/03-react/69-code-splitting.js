'use strict';
// Lesson 69 — Code Splitting. Run with:  node exercises/03-react/69-code-splitting.js
// Predict every output BEFORE running. Write your prediction in the comment.

// In a browser a dynamic import is `import('./x')`. Node can't do that in
// plain scripts, so we simulate the bundler's chunk model with a registry.

const chunks = new Map();

// ── Task 1 ──────────────────────────────────────────────────────────
// Simulate the bundler: registerChunk(id, modules) stores a chunk; only
// `dynamicImport`-ing it evaluates it. An eager import evaluates at startup.
// Prediction: ______________________
function registerChunk(id, factory) {
  if (!chunks.has(id)) {
    const module = { exports: {} };
    factory(module, module.exports);
    chunks.set(id, module.exports);
  }
  return chunks.get(id);
}

function dynamicImport(id) {
  return Promise.resolve(chunks.get(id));
}

const eager = registerChunk('main', () => console.log('main evaluated')); // runs now
console.log('main chunk value:', eager);

function task1() {
  dynamicImport('reports').then((mod) => console.log('reports chunk:', mod));
  console.log('reports fetched eagerly?', chunks.has('reports'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The split point only works with a literal id. A variable id means the
// "bundler" can't resolve it. Implement resolveChunk(id) that returns a
// promise for the registered chunk or rejects with a clear message.
function resolveChunk(id) {
  // your code here
  return Promise.reject(new Error('unimplemented'));
}

// resolveChunk('reports').then(console.log, (e) => console.log('error:', e.message));

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const cache = new Map();
  const load = (id) => {
    if (!cache.has(id)) {
      cache.set(id, Promise.resolve(`${id} chunk loaded`));
    }
    return cache.get(id);
  };
  const first = load('reports');
  const second = load('reports');
  console.log('cached:', first === second);
  second.then(console.log);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// A shared module imported by TWO chunks must NOT be shipped twice.
// Hoist it into a shared chunk. Implement `getShared()` that returns the
// same module object to both chunks.
let sharedInstance = null;
function getShared() {
  // your code here — return the SAME object every time
  return sharedInstance;
}

const utilsA = getShared();
const utilsB = getShared();
console.log('shared instance:', utilsA === utilsB); // expect true

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const contents = {
    'main.7f3a9c.js': 240,
    'home.2b41d0.js': 18,
    'profile.a9e3f1.js': 34,
    'reports.e8b2aa.js': 412,
    'vendor.6c22dd.js': 158,
  };
  const total = Object.values(contents).reduce((a, b) => a + b, 0);
  const initial = contents['main.7f3a9c.js'] + contents['vendor.6c22dd.js'];
  console.log('total KB:', total);
  console.log('initial load KB:', initial);
}
// task5();

module.exports = { registerChunk, dynamicImport, resolveChunk, getShared };
