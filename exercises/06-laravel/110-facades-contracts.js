'use strict';
// Lesson 110 — Facades & Contracts. Run with:  node exercises/06-laravel/110-facades-contracts.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; this models static-looking facades with plain JS.)

// ── Task 1 ──────────────────────────────────────────────────────────
// A facade is static-looking syntax over a container instance. This is
// the classic static call — what does it return, and why is there no
// "static state"?
// Prediction: ______________________
const cache = { store: new Map(), get: (k) => cache.store.get(k) };
cache.store.set('user', 'ada');

function task1() {
  console.log(cache.get('user')); // plain instance call
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The proxy facade: a static-looking object whose methods forward to
// the instance. Each call resolves the CURRENT root, so swapping the
// root changes what every "static" call does.
// Prediction: ______________________
function createFacade(getRoot) {
  return new Proxy({}, {
    get(_target, method) {
      return (...args) => {
        const root = getRoot();          // ← resolve the facade root
        return root[method](...args);
      };
    },
  });
}

function task2() {
  let root = { get: () => 'real cache value' };
  const Cache = createFacade(() => root); // the "facade"

  console.log(Cache.get('user'));        // before the swap
  root = { get: () => 'FAKE' };          // ← Cache::fake() in Laravel
  console.log(Cache.get('user'));        // after the swap — same call site
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Same container lookup, two ergonomics: the facade syntax and
// constructor injection reach the SAME instance.
// Prediction: ______________________
function task3() {
  const instance = { get: () => 'shared' };

  // "Facade": static-looking access to the one instance
  const Cache = createFacade(() => instance);

  // "DI": the same instance passed through a constructor
  class Controller {
    constructor(cache) {
      this.cache = cache;
    }
    read() {
      return this.cache.get('k');
    }
  }

  const controller = new Controller(instance);
  console.log('facade:', Cache.get('k'));
  console.log('injected:', controller.read());
  console.log('same instance:', Cache.get('k') === controller.read());
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The contract is the interface: an object with a get() method. Any
// implementation (real, fake) that satisfies it can be swapped in. Pick
// the fake so the test asserts on it — complete fakeCache.
// Prediction: ______________________
function fakeCache() {
  // your code here  (return an object with get() that returns 'FAKE')
  return null;
}

function task4() {
  let root = { get: () => 'redis' };
  const Cache = createFacade(() => root);

  root = fakeCache();                    // ← Cache::fake()
  console.log(Cache.get('user'));        // must be 'FAKE'
  root = { get: () => 'redis' };         // back to the real driver
  console.log(Cache.get('user'));        // 'redis' again
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// A contract is what the instance promises. Complete assertContract so
// it returns true when the implementation satisfies the interface
// (has every method the contract lists).
// Prediction: ______________________
const CacheContract = ['get', 'put', 'forget'];

function assertContract(contract, implementation) {
  // your code here  (return whether every method exists on implementation)
  return false;
}

function task5() {
  console.log('real repo ok:', assertContract(CacheContract, { get() {}, put() {}, forget() {} }));
  console.log('fake ok:', assertContract(CacheContract, { get: () => 'FAKE', put() {}, forget() {} }));
  console.log('missing method:', assertContract(CacheContract, { get() {} }));
}
// task5();

module.exports = { createFacade, fakeCache, assertContract };
