'use strict';
// Lesson 62 — useCallback. Run with:  node exercises/03-react/62-usecallback.js
// Every render creates a NEW function identity. useCallback freezes it until
// the deps change. The honest default: "usually you should not use it".
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Function identity: same code, new identity per creation. Prediction: ______
function greet(name) {
  return `hi ${name}`;
}
const a = greet;
const b = greet;

const make = () => (name) => `hi ${name}`;
const c = make();
const d = make();

console.log('a === b (declared once):', a === b);
console.log('c === d (created twice):', c === d);
console.log('c(1) === d(1):', c('x') === d('x'));

// ── Task 2 ──────────────────────────────────────────────────────────
// Every render re-executes the component body → new inline functions.
function renderApp() {
  const onClick = () => console.log('clicked');
  return onClick;
}

const f1 = renderApp();
const f2 = renderApp();
console.log('f1 === f2 (two renders):', f1 === f2);

// ── Task 3 ──────────────────────────────────────────────────────────
// A minimal useCallback: keep one stored function while deps are unchanged.
const useCallbackEmu = (() => {
  let stored = null;
  let lastDeps = null;

  return (fn, deps) => {
    const same =
      lastDeps && deps.length === lastDeps.length && deps.every((d, i) => Object.is(d, lastDeps[i]));
    if (!same) {
      stored = fn;
      lastDeps = deps;
    }
    return stored;
  };
})();

let made = 0;
const makeHandle = (x) => {
  made += 1;
  return () => console.log('handler', x);
};

const h1 = useCallbackEmu(makeHandle(1), [1]);
const h2 = useCallbackEmu(makeHandle(2), [1]); // same dep → REUSED
const h3 = useCallbackEmu(makeHandle(3), [2]); // dep changed → recreated

console.log('h1 === h2 (same deps):', h1 === h2);
console.log('h1 === h3 (deps changed):', h1 === h3);
console.log('factories run:', made);

// ── Task 4 ──────────────────────────────────────────────────────────
// Fresh deps every render defeat the cache. Prediction: ______________
const cache2 = { fn: null, deps: null, ready: false };

function useCallbackEmu2(fn, deps) {
  const same =
    cache2.ready &&
    deps.length === cache2.deps.length &&
    deps.every((d, i) => Object.is(d, cache2.deps[i]));
  if (!same) {
    cache2.ready = true;
    cache2.fn = fn;
    cache2.deps = deps;
  }
  return cache2.fn;
}

let creations2 = 0;

function render(greeting) {
  const handler = useCallbackEmu2(() => console.log(greeting), [greeting]);
  creations2 += 1;
  return handler;
}

const c1 = render('hi');
const c2 = render('hi'); // primitive dep — same by value → REUSED
const c3 = render('hi');
console.log('c1 === c2 (same primitive dep):', c1 === c2);
console.log('c1 === c3:', c1 === c3);
console.log('render() calls:', creations2, '| handlers created:', creations2 - 1);

// ── Task 5 ──────────────────────────────────────────────────────────
// STABLE does not mean FRESH. A frozen closure reads stale state.
// Prediction: ______________
function makeStaleCallback() {
  let count = 0;
  const handle = (() => {
    const captured = count; // frozen at creation
    return () => captured;
  })();

  count = 99; // "state" changes, but the callback never re-reads it
  return handle;
}

const cb = makeStaleCallback();
console.log('stale callback reads:', cb());

// ── Task 6 ──────────────────────────────────────────────────────────
// Fix it: a stable callback that reads the LATEST value through a ref.
// Complete makeFreshCallback so `read` sees the newest count. Prediction:
// "read sees latest: ______"
function makeFreshCallback() {
  let count = 0;
  const latest = { current: count }; // the ref — mutated, never recreated

  const increment = () => {
    count += 1;
    latest.current = count; // your code here (keep the ref current)
  };

  // your code here — return a function that reads latest.current
  const read = () => 0; // replace this line

  return { increment, read };
}

function task6() {
  const { increment, read } = makeFreshCallback();
  increment();
  increment();
  increment();
  console.log('read sees latest:', read());
}
task6();

module.exports = { useCallbackEmu, makeFreshCallback };
