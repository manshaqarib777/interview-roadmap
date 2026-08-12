'use strict';
// Lesson 75 — The Provider Pattern. Run with:  node exercises/03-react/75-provider-pattern.js
// Predict every output BEFORE running. Write your prediction in the comment.
// The provider pattern is plain JS before it is React: a closure holding
// state, exposing a read and an update. That closure is the mechanism.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (which calls re-create the value?)
function task1() {
  let theme = 'light';
  function providerRender() {
    return { theme }; // inline "value" object — re-created every render
  }
  const v1 = providerRender();
  const v2 = providerRender();
  console.log('same contents:', v1.theme === v2.theme);
  console.log('same object?  ', v1 === v2);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement a mini theme provider: a closure that owns `theme` and
// exposes a stable getter AND a stable setter, exactly like a Context
// provider with useMemo'd value + useCallback'd setTheme.
function createThemeProvider(initial) {
  let theme = initial;
  const getTheme = () => theme;      // stable function reference
  // your code here — the setter, stable too
  return { getTheme, setTheme };
}

function task2() {
  const provider = createThemeProvider('light');
  const { getTheme, setTheme } = provider;
  const { getTheme: g2 } = provider; // a second "render" reading the value
  console.log(getTheme());
  setTheme('dark');
  console.log(getTheme());
  console.log('same getter across reads:', getTheme === g2); // must be true
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement the memoized provider value: useMemo semantics — the value
// object is ONLY re-created when `theme` actually changes. Count how
// many times the value is rebuilt.
function createMemoizedProvider(initial) {
  let theme = initial;
  let cache = null; // last value object we handed out
  let rebuilds = 0;
  // your code here — readValue() re-creates the object ONLY on real changes
  function readValue() {
    // your code here
  }
  function setTheme(next) {
    // your code here
  }
  return { readValue, setTheme, rebuilds: () => rebuilds };
}

function task3() {
  const provider = createMemoizedProvider('light');
  const { readValue, setTheme, rebuilds } = provider;
  readValue();
  readValue(); // same theme — must NOT rebuild
  console.log('rebuilds after 2 reads:', rebuilds()); // must be 1
  setTheme('dark');
  readValue();
  readValue();
  console.log('rebuilds after change:', rebuilds()); // must be 2
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement useCallback semantics for the exposed setter: the SAME
// function reference is returned on every read, so consumers that
// receive it as a dependency never re-render just because it changed.
function createStableSetterProvider(initial) {
  let theme = initial;
  // your code here — setTheme must be created ONCE
  return { getTheme: () => theme, setTheme };
}
// (Hint: assign the setter to a const once, outside every function that
//  could be called again — the closure keeps it for the provider's life.)

function task4() {
  const a = createStableSetterProvider('light');
  const b = createStableSetterProvider('light');
  console.log('same setter on every read:', a.setTheme === a.setTheme);
  console.log('independent providers?   ', a.setTheme !== b.setTheme);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (which providers are independent?)
function task5() {
  const make = createThemeProvider;
  const p1 = make('light');
  const p2 = make('light');
  p1.setTheme('dark');
  console.log(p1.getTheme());
  console.log(p2.getTheme());
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Fix the bug: this provider rebuilds its value on every read because
// the comparison is wrong. It must return the SAME object while the
// theme is unchanged, and a NEW object after a change.
function createFixedProvider(initial) {
  let theme = initial;
  let cache = { theme }; // seed the first value
  function readValue() {
    // your code here — compare BEFORE rebuilding
  }
  function setTheme(next) {
    theme = next;
  }
  return { readValue, setTheme };
}

function task6() {
  const provider = createFixedProvider('light');
  const { readValue, setTheme } = provider;
  console.log('stable while unchanged:', readValue() === readValue());
  setTheme('dark');
  console.log('new object after change:', readValue() !== readValue());
}
// task6();

module.exports = { createThemeProvider, createMemoizedProvider, createStableSetterProvider, createFixedProvider };
