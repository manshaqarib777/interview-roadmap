'use strict';
// Lesson 58 — Dependency Arrays & Cleanup. Run with:  node exercises/03-react/58-deps-and-cleanup.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React here — we simulate the deps/cleanup contract with plain JS so the
// ideas run anywhere.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Object.is against a fresh literal (Lesson 6) — does a "same-looking"
// object trigger a re-run?
function task1() {
  const make = (sort) => ({ sort });              // called fresh per render
  const prev = make('new');
  const next = make('new');
  console.log('same reference?', Object.is(prev, next)); // the deps comparison
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A tiny deps engine, exactly like React's: changed on first run and on
// real changes only. Which labels re-run?
function task2() {
  const trace = [];
  let previous = null;
  const commit = (label, deps) => {
    const changed = previous === null || deps.some((d, i) => !Object.is(d, previous[i]));
    if (changed) {
      previous = deps;
      trace.push(`${label} → runs`);
    } else {
      trace.push(`${label} → skips`);
    }
  };
  commit('A', ['a', 1]);
  commit('B', ['a', 1]);
  commit('C', ['a', 2]);
  commit('D', [{ id: 1 }]);
  commit('E', [{ id: 1 }]);
  console.log(trace.join('\n'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Cleanup order: does cleanup run BEFORE the next body?
function task3() {
  const log = [];
  let previous = null;
  const cleanup = () => {};
  const run = (label, deps, body, cleanupFn) => {
    const changed = previous === null || deps.some((d, i) => !Object.is(d, previous[i]));
    if (changed) {
      if (previous !== null) {
        log.push(`${label}: cleanup`);   // React runs the PREVIOUS cleanup here
        cleanupFn();
      }
      previous = deps;
      body();
      log.push(`${label}: body`);
    }
  };
  run('mount',   ['x'], () => log.push('body(mount)'),   cleanup);
  run('change',  ['y'], () => log.push('body(change)'),  cleanup);
  console.log(log.join(' → '));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Fix the dependency array: this effect reads TWO values but declares one.
function task4() {
  let maxPrice = 50;
  const products = [{ price: 10 }, { price: 99 }];
  // eslint would flag the missing dep:
  //   useEffect(() => { setFiltered(products.filter(p => p.price <= maxPrice)); }, [maxPrice]);
  // your fix — declare both values the body reads:
  const deps = [maxPrice, products]; // ← was [maxPrice] (products is read too)
  console.log('declared deps:', deps.map(String).join(' | '));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A ref is stable forever — is it ever a meaningful dependency?
function task5() {
  const ref = { current: null };               // useRef's stable object
  ref.current = { el: 'mounted div' };         // populated at mount, stays stable
  const before = ref;
  const after = ref;                           // same object across every render
  console.log('ref stable across renders?', before === after);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Why does this effect loop forever? The object in deps is a NEW reference
// every iteration (Lesson 6). Break the loop: depend on a primitive.
function task6() {
  let count = 0;
  let previous = null;

  const effectBody = () => { count += 1; };

  // the bug: `{ id: 1 }` is a fresh object each iteration, so Object.is is
  // never equal and the effect re-runs every commit.
  // your fix:  const makeDeps = () => [1];   // depend on the primitive
  const makeDeps = () => [{ id: 1 }];

  let iterations = 0;
  while (iterations < 100) {
    iterations += 1;
    const deps = makeDeps();
    const changed = previous === null || deps.some((d, i) => !Object.is(d, previous[i]));
    previous = deps;
    if (!changed) break;      // with the fix, iteration 2 breaks here
    effectBody();
  }

  console.log('effect runs:', count, '| commits:', iterations);
}
// task6();

module.exports = {};
