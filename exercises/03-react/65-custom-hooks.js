'use strict';
// Lesson 65 — Custom Hooks. Run with:  node exercises/03-react/65-custom-hooks.js
// Hooks can't run in Node, but their LOGIC can — these tasks factor the
// logic into testable pure functions (what the hooks wrap).
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The `use` prefix is what the ESLint rules key on. Without it, a
// function that calls hooks escapes `react-hooks/rules-of-hooks`.
function isHookName(name) {
  return /^use[A-Z]/.test(name);
}
console.log('useLocalStorage:', isHookName('useLocalStorage'));
console.log('use_my_hook:', isHookName('use_my_hook'));
console.log('fetchData:', isHookName('fetchData'));
console.log('useX:', isHookName('useX'));

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Each call to a custom hook gets its OWN state instance (useState is
// per-component). Model that: each factory call creates a fresh closure.
function createCounter(initial) {
  let count = initial;
  return {
    inc: () => ++count,
    get: () => count,
  };
}
const a = createCounter(0);
const b = createCounter(10);
a.inc(); a.inc();
console.log('a:', a.get(), '| b:', b.get());

// ── Task 3 ──────────────────────────────────────────────────────────
// The logic behind useLocalStorage. Implement the read/write helpers.
// The real hook seeds useState with readStored and writes in useEffect.
function readStored(key, initialValue) {
  // your code here
  const stored = localStorage.getItem(key);
  return stored !== null ? JSON.parse(stored) : initialValue;
}
function writeStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function storageTask() {
  writeStored('theme', 'dark');
  console.log('read theme:', readStored('theme', 'light'));
  console.log('read missing:', readStored('missing', 'light'));
  console.log('read null value:', readStored('nullish', null));
}
// storageTask();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The logic behind usePrevious. Renders happen first, effects run AFTER
// — so during a render the ref still holds the PREVIOUS value.
// Simulate render → effect ordering with explicit commit() steps.
function createPreviousTracker() {
  let ref = { current: undefined };
  return {
    // called during a RENDER: returns what the ref still holds
    render(value) {
      const prev = ref.current;
      // the effect would run now, after the render — simulate with commit()
      return { prev, commit: () => { ref.current = value; } };
    },
  };
}
const tracker = createPreviousTracker();
const r1 = tracker.render('a');
console.log('render 1 sees prev:', r1.prev);   // nothing committed yet
r1.commit();                                   // effect runs
const r2 = tracker.render('b');
console.log('render 2 sees prev:', r2.prev);   // the previous value
r2.commit();
const r3 = tracker.render('c');
console.log('render 3 sees prev:', r3.prev);

// ── Task 5 ──────────────────────────────────────────────────────────
// A custom hook returns fresh objects every render. If a caller puts that
// object in a dependency array, it changes identity every render.
// Model identity stability: implement a memoised getter that returns the
// SAME object until the underlying value changes (the useMemo job).
function createStableValue(initial) {
  // your code here
  let value = initial;
  let cached = { value };
  return {
    set: (next) => {
      if (next === value) return cached;  // same value → same identity
      value = next;
      cached = { value };
      return cached;
    },
    getStable: () => cached,
  };
}
const holder = createStableValue(1);
const firstObj = holder.getStable();
holder.set(1);                       // same value — identity should survive
const secondObj = holder.getStable();
console.log('stable across same-value set?', firstObj === secondObj);
holder.set(2);                       // new value — new identity
console.log('changes on new value?', firstObj !== holder.getStable());

module.exports = { isHookName, createCounter, readStored, writeStored, createStableValue };
