'use strict';
// Lesson 57 — useEffect. Run with:  node exercises/03-react/57-useeffect.js
// Predict every output BEFORE running. Write your prediction in the comment.
// React itself isn't installed — we simulate the effect contract with plain JS
// so the ideas run anywhere.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Does an effect run for an unchanged dependency? Re-read Lesson 57 §3.
function task1() {
  const runs = [];
  const deps = ['a'];
  const effect = (fn, depsArr) => {
    let last = null;
    const run = (d) => {
      const changed = last === null || !depsArr.every((k, i) => Object.is(d[k], last[i]));
      if (changed) {
        last = depsArr.map((k) => d[k]);
        fn();
      }
    };
    run({ a: 1 });
    run({ a: 1 });
    run({ a: 2 });
    return runs;
  };
  effect(() => runs.push('effect ran'), deps);
  console.log(runs.join(' | '));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The stale closure (Lesson 5): what does the callback see?
function task2() {
  let count = 0;                    // "state" of the first render
  const tick = () => count + 1;     // the interval callback from a [] effect
  count = 5;                        // later renders keep running
  console.log('tick sees', tick()); // does it see 5?
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// A keystroke is an EVENT, not an effect. Convert it: set the query in the
// handler instead of inside the effect.
function task3() {
  let query = '';
  let results = 'idle';
  const setQuery = (q) => {
    query = q;
    results = 'searching:' + q; // ← move this INTO setQuery (the handler)
  };

  // The effect-shaped (wrong) version would do:  useEffect(() => { results = 'searching:' + query; }, [query])
  // ...but that runs AFTER the render. Here we just call the handler directly:
  setQuery('react');
  console.log(results);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Fix the interval so it stops being stuck at 1 — WITHOUT reading the
// captured `count`. Use the functional updater.
function task4() {
  let count = 0;
  const setCount = (updater) => {
    count = typeof updater === 'function' ? updater(count) : updater;
  };

  // the buggy body (stale closure — Lesson 5):
  //   setInterval(() => setCount(count + 1), 1000);
  // your fix here — a functional updater that never reads the captured count:

  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  console.log('count =', count); // must be 3, not 1
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A subscription: the cleanup is what stops the leak. Does the last set
// reach any listener?
function task5() {
  const listeners = new Set();
  const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const fire = (v) => listeners.forEach((l) => l(v));

  const seen = [];
  const unsub = subscribe((v) => seen.push(v));

  fire('first');
  unsub();            // the cleanup React would call before re-run / on unmount
  fire('second');

  console.log(seen.join(' | '));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Why does this effect fire on EVERY render? Fix the dependency so it
// fires only when `id` actually changes.
function task6() {
  let id = 'u1';
  // eslint would flag this: a fresh object every render (Lesson 6)
  //   useEffect(() => { /* … */ }, [{ id }]);
  // your fix — depend on the primitive instead:
  const deps = [id]; // ← was [{ id }]

  console.log('fixed deps:', deps.map(String).join(', '));
}
// task6();

module.exports = {};
