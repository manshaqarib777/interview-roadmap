'use strict';
// Lesson 22 — The Event Loop. Run with:  node exercises/01-javascript/22-event-loop.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  console.log('start');

  setTimeout(() => console.log('timeout'), 0);

  console.log('end');
}
// task1();
// Expected: 'start', 'end', 'timeout'. The timer callback is a task — it can
// only run once the stack has emptied and the loop picks it up.

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement a debounce WITHOUT setInterval — only setTimeout and closures
// (Lesson 5). It must delay running `fn` until `ms` after the LAST call.
function debounce(fn, ms) {
  // your code here
  return fn;
}

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  let count = 0;
  const timer = setInterval(() => {
    count += 1;
    console.log('tick', count);
    if (count === 2) clearInterval(timer);
  }, 50);

  setTimeout(() => console.log('late timer'), 200);
}
// task3();
// Expected: 'tick 1' (≈50ms), 'tick 2' (≈100ms), 'late timer' (≈200ms).
// All are separate tasks — the loop runs them one at a time in queue order.

// ── Task 4 ──────────────────────────────────────────────────────────
// The delay is a MINIMUM, not a guarantee. Verify it: queue a 0 ms timer,
// then block the stack for ~300 ms with a busy loop. How late does the
// timer actually fire?
function task4() {
  const t0 = Date.now();

  setTimeout(() => {
    console.log('timer fired at ~' + (Date.now() - t0) + ' ms');
  }, 0);

  const until = t0 + 300;
  while (Date.now() < until) { /* block the stack */ }
  console.log('blocking finished');
}
// task4();
// Expected: 'blocking finished', then 'timer fired at ~300 ms'. The timer was
// ready at ~0 ms but the busy stack held it until ~300 ms.

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  console.log('a');
  setTimeout(() => console.log('b'), 0);
  Promise.resolve().then(() => console.log('c'));
  console.log('d');
}
// task5();
// Expected: 'a', 'd', 'c', 'b'. `c` is a microtask (Lesson 23) and beats the
// macrotask `b` even though `b` was scheduled first.

// ── Task 6 ──────────────────────────────────────────────────────────
// Why does the order differ from task5 — and what single word names the
// mechanism? (No prediction needed — this one is broken on purpose.)
// function task6() {
//   while (true) { /* spins forever */ }
// }
// An infinite loop never lets the stack empty, so the event loop can never
// deliver ANY queued task or microtask. This is a "blocked event loop" —
// the frozen-page symptom from Lesson 22.

module.exports = { debounce };
