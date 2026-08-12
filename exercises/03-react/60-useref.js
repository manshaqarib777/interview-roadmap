'use strict';
// Lesson 60 — useRef. Run with:  node exercises/03-react/60-useref.js
// Every render creates NEW state and props, but ONE shared ref object (stable identity).
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A ref is a stable object; a plain object is not. Prediction: ______________
const box = { current: 0 };
const boxRef = { current: 0 };

function render() {
  // both survive the "render" — but only boxRef keeps its identity
  return boxRef;
}

const first = render();
const second = render();
box.current = 5;
first.current = 7;

console.log('box === boxRef:', box === boxRef);
console.log('first === second:', first === second);
console.log('first.current:', first.current);

// ── Task 2 ──────────────────────────────────────────────────────────
// Emulate useRef + useState. What is different about `a` and `b`?
// Prediction: ______________________
let renders = 0;

function component() {
  // useRef: returns the SAME object every render
  const a = (component.__a ??= { current: 0 });
  // useState: produces a NEW value every render
  const b = (component.__b ??= { current: 0 });

  component.__a.current += 1; // ref mutation — no re-render signal
  component.__b = { current: component.__b.current + 1 }; // "setState" → new value

  renders += 1;
  return { a, b: component.__b };
}

const r1 = component();
const r2 = component();
const r3 = component();

console.log('a (ref):', r1.a.current, r2.a.current, r3.a.current);
console.log('b (state):', r1.b.current, r2.b.current, r3.b.current);
console.log('a is ONE object across renders:', r1.a === r2.a && r2.a === r3.a);
console.log('b is a NEW object each render:', r1.b !== r2.b && r2.b !== r3.b);
console.log('renders:', renders);

// ── Task 3 ──────────────────────────────────────────────────────────
// Previous-value pattern. Predict the printed pairs before running.
function App() {
  let value = (App.__value ??= 1);
  let prevRef = (App.__prevRef ??= { current: value });

  // DURING the render, prevRef still holds the PREVIOUS render's value
  const output = { now: value, before: prevRef.current };

  // useEffect with no deps → runs AFTER the render
  prevRef.current = value;

  App.__value += 1;
  return output;
}

console.log(App());
console.log(App());
console.log(App());

// ── Task 4 ──────────────────────────────────────────────────────────
// A ref is per instance, a module variable is shared. Prediction: ______________
const shared = { current: 0 };

function makeInstance() {
  const localRef = { current: 0 };
  return {
    tick: function () {
      shared.current += 1;
      localRef.current += 1;
      return `shared=${shared.current} local=${localRef.current}`;
    },
  };
}

const i1 = makeInstance();
const i2 = makeInstance();

console.log(i1.tick());
console.log(i2.tick());
console.log(i1.tick());

// ── Task 5 ──────────────────────────────────────────────────────────
// The "latest ref" pattern: timers are created once but must read the
// CURRENT count. Why do BOTH read 2 here, and what would they read with
// a stale closure instead? Prediction: ______________
function latestCounter() {
  let count = 0;
  const latest = { current: 0 }; // the ref — updated, never recreated
  const timers = [];

  const schedule = () => {
    timers.push(() => console.log('timer sees count =', latest.current));
  };

  const increment = () => {
    count += 1;
    latest.current = count; // keep the ref current
    schedule();
  };

  return { increment, fire: () => timers.forEach((t) => t()) };
}

const lc = latestCounter();
lc.increment(); // count → 1
lc.increment(); // count → 2
lc.fire();

// ── Task 6 ──────────────────────────────────────────────────────────
// Mutate the ref vs REPLACE the ref. A long-lived consumer captures the
// ref OBJECT; if the ref is replaced, the consumer keeps a stale object.
// Prediction: ______________________
function makeRefClock(replaceRef) {
  let ref = { current: 0 };
  const captured = ref; // a long-lived consumer holds THIS object

  return {
    tick: function () {
      if (replaceRef) {
        ref = { current: ref.current + 1 }; // ❌ new object — captured goes stale
      } else {
        ref.current += 1; // ✅ mutate in place — captured stays current
      }
    },
    readCaptured: function () {
      return captured.current;
    },
  };
}

function task6() {
  const bad = makeRefClock(true);
  const good = makeRefClock(false);

  bad.tick(); bad.tick(); bad.tick();
  good.tick(); good.tick(); good.tick();

  console.log('replaced ref — captured sees:', bad.readCaptured());
  console.log('mutated ref — captured sees:', good.readCaptured());
}
task6();

module.exports = { makeRefClock };
