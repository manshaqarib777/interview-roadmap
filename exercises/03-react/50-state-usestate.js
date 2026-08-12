'use strict';
// Lesson 50 — State & useState. Run with:  node exercises/03-react/50-state-usestate.js
// Updates are queued and batched, not applied. A plain-JS simulation
// of the useState model (Lesson 5's closure, Lesson 50's batching).
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// useState = a snapshot + a setter. The setter schedules, it doesn't apply.
function createState(initial) {
  let value = initial;
  const set = (next) => { value = next; };
  return [value, set];
}

const [count, setCount] = createState(0);
setCount(1);                 // scheduled… but where does `count` read?
// Prediction: ______________________
console.log(count);          // what does this log?
const [later, setLater] = createState(0);
setLater(5);
console.log(later);          // and this?

// ── Task 2 ──────────────────────────────────────────────────────────
// Batching: queue updates, apply them once at flush.
function createBatch() {
  let queue = [];
  const dispatch = (updater) => { queue.push(updater); };
  const flush = (initial) => {
    let current = initial;
    queue.forEach((update) => { current = update(current); });
    queue = [];
    return current;
  };
  return { dispatch, flush };
}

const batch = createBatch();
batch.dispatch((prev) => prev + 1);
batch.dispatch((prev) => prev + 1);
batch.dispatch((prev) => prev + 1);
// Prediction: ______________________
console.log(batch.flush(0));

// ── Task 3 ──────────────────────────────────────────────────────────
// The functional updater reads the LATEST value; the value form reads
// the snapshot. Fill the dispatch lines so the flush returns 3.
function counter3() {
  const batch = createBatch();
  // your code here — queue the right updaters (hint: three of them)
  return batch.flush(0);
}
// Prediction: ______________________
console.log(counter3()); // must be 3

// ── Task 4 ──────────────────────────────────────────────────────────
// The stale-closure trap (Lesson 5): a callback captures an old snapshot.
function buildInterval(captureCount, setCount) {
  // Interval tick — simulates 1s later, closure still holds the old value.
  setCount(captureCount + 1); // ❌ reads the captured snapshot
}

let state1 = 0;
const set1 = (next) => { state1 = next; };
buildInterval(0, set1);
buildInterval(0, set1);   // second tick — same captured 0
// Prediction: ______________________
console.log(state1);      // stuck at 1, not 2

// ── Task 5 ──────────────────────────────────────────────────────────
// Fix the stuck interval with functional updates (don't touch buildInterval).
// Fill the gap, then uncomment task5().
function buildIntervalFixed(captureCount, setCount) {
  // your code here (hint: setCount(prev => …) — ignore the captured value)
}
function task5() {
  let state2 = 0;
  const set2 = (next) => { state2 = next; };
  buildIntervalFixed(0, set2);
  buildIntervalFixed(0, set2);
  console.log(state2); // must be 2
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Never mutate state — replace it. Reference equality is the check.
function addTodo(todos, todo) {
  // your code here (hint: return a NEW array; leave `todos` untouched)
  return todos;
}
const initialTodos = ['learn JSX'];
const updatedTodos = addTodo(initialTodos, 'learn state');
// Prediction: ______________________
console.log(initialTodos.length, updatedTodos.length); // must be 1 2
console.log(initialTodos !== updatedTodos);            // must be true

module.exports = { createState, createBatch, counter3, buildInterval, buildIntervalFixed, addTodo };
