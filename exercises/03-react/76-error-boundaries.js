'use strict';
// Lesson 76 — Error Boundaries. Run with:  node exercises/03-react/76-error-boundaries.js
// Predict every output BEFORE running. Write your prediction in the comment.
// A boundary is a class, but its two methods are pure JS: a "render-phase"
// flag flip (getDerivedStateFromError) and a post-commit report
// (componentDidCatch). The mechanics below are the same mechanics.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (which render() is called?)
const boundary = {
  state: { hasError: false },
  render(children, fallback) {
    return this.state.hasError ? fallback : children;
  },
};
function getDerivedStateFromError() {
  return { hasError: true };
}
function task1() {
  boundary.state = getDerivedStateFromError();
  console.log(boundary.render('Profile UI', '⚠ widget crashed'));
  boundary.state = { hasError: false };
  console.log(boundary.render('Profile UI', '⚠ widget crashed'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The boundary state transition, as a pure function. hasError must go
// true when getDerivedStateFromError returns, and a retry (reset) must
// flip it back to false.
function transition(state, action) {
  // your code here — actions: { type: 'error' } | { type: 'reset' }
}

function task2() {
  let state = { hasError: false };
  state = transition(state, { type: 'error' });
  console.log('after error:', state.hasError); // must be true
  state = transition(state, { type: 'reset' });
  console.log('after reset:', state.hasError); // must be false
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (async errors escape the boundary)
// A boundary's "catch" only runs while a render is in flight. Sync
// errors throw during render; async callbacks throw after it.
function task3() {
  let rendering = true; // a render is in progress
  const boundary = { state: { hasError: false } };

  // SYNC — thrown while rendering: the boundary reacts.
  try {
    throw new Error('boom in render');
  } catch (err) {
    if (rendering) boundary.state = { hasError: true }; // getDerivedStateFromError
  }
  console.log('sync throw  → boundary hasError:', boundary.state.hasError);

  // ASYNC — thrown in a timer callback, after rendering finished.
  boundary.state = { hasError: false }; // fresh boundary
  rendering = false;
  setTimeout(() => {
    try {
      throw new Error('boom in setTimeout');
    } catch (err) {
      // caught by try/catch — the boundary never sees it
      console.log('async throw → boundary hasError:', boundary.state.hasError);
    }
  }, 0);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement makeErrorBoundary — a mini class component with the two
// methods and a retry. The boundary must reset on retry().
function makeErrorBoundary(initialChildren) {
  let state = { hasError: false };
  // your code here — catch(error), retry()
  return {
    catch() {
      // your code here — flip state, like getDerivedStateFromError
    },
    retry() {
      // your code here — reset state
    },
    get hasError() {
      return state.hasError;
    },
  };
}

function task4() {
  const b = makeErrorBoundary();
  console.log('initial:', b.hasError); // must be false
  b.catch();
  console.log('after catch:', b.hasError); // must be true
  b.retry();
  console.log('after retry:', b.hasError); // must be false
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (which throws are caught?)
function task5() {
  const catches = [];
  const report = (err) => catches.push(err.message);

  // A — thrown during "render"
  try {
    throw new Error('render error');
  } catch (err) {
    report(err);
  }

  // B — thrown in an event handler (a plain function call here)
  const handleClick = () => {
    throw new Error('handler error');
  };
  try {
    handleClick();
  } catch (err) {
    report(err);
  }

  // C — thrown inside a .then callback (async code). A boundary never
  // sees it; the .catch is the only thing that can report it (Lesson 27).
  const onAsyncError = (err) => {
    report(err);
    console.log('reported:', catches);
  };

  Promise.resolve()
    .then(() => {
      throw new Error('async error');
    })
    .catch(onAsyncError);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// The boundary does NOT catch this async error: the report must come
// from the .catch on the promise, never from the boundary's report.
// Implement safeAsync so the error lands in the boundary's report.
function makeBoundaryWithReport() {
  const reported = [];
  const catchAndReport = (err) => reported.push(err.message);
  // your code here — a function that attaches .catch to the promise
  function safeAsync(promise) {
    // your code here
    return promise;
  }
  return { catchAndReport, safeAsync, reported };
}

function task6() {
  const boundary = makeBoundaryWithReport();
  // safeAsync attaches a .catch, so the error lands in the boundary's
  // report. The returned promise still rejects (safeAsync can't change
  // that), so a trailing .catch keeps this harness from crashing on an
  // unhandled rejection — and the report is already populated.
  boundary.safeAsync(Promise.reject(new Error('fetch failed')))
    .then(() => console.log('reported:', boundary.reported))
    .catch(() => console.log('reported:', boundary.reported)); // must contain 'fetch failed'
}
// task6();

module.exports = { transition, makeErrorBoundary, makeBoundaryWithReport };
