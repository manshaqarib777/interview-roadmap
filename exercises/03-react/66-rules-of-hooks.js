'use strict';
// Lesson 66 — Rules of Hooks (Internals). Run with:  node exercises/03-react/66-rules-of-hooks.js
// No React here — a plain-array model of the hooks linked list, indexed by
// call order. This is the exact mechanism behind the Rules of Hooks.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The fiber stores a linked list of hook nodes. Each node is matched by
// POSITION, not by name. Walk the list in call order.
const fiberList = ['state#1', 'effect#2', 'ref#3']; // the linked list, by position
function render(callCount) {
  const result = [];
  for (let i = 0; i < callCount; i++) {
    result.push(fiberList[i]); // hook i reads slot i
  }
  return result;
}
console.log(render(3));   // three hooks called: clean walk
console.log(render(2));   // a hook was skipped: what lands in slot 2?

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A conditional hook call skips a slot. Walk with a "called" plan that
// includes a gap — every hook AFTER the gap reads the wrong slot.
function renderWithGap(list, called) {
  let cursor = 0;
  const result = [];
  for (const shouldCall of called) {
    if (shouldCall) {
      result.push(list[cursor]);
      cursor += 1;
    }
    // skipped → cursor does NOT advance → later calls misread
  }
  return result;
}
const list = ['a', 'b', 'c', 'd'];
console.log(renderWithGap(list, [true, true, true, true]));  // no gap
console.log(renderWithGap(list, [true, false, true, true])); // b skipped

// ── Task 3 ──────────────────────────────────────────────────────────
// Rule 2: hooks can only be called from React functions (components and
// custom hooks). Detect a "hook call" from a non-React function: it has
// no fiber, so it corrupts the caller's list. Fix the helper below.
const hookCallCount = { n: 0 };

function plainHelper() {
  hookCallCount.n += 1;          // ❌ this is what an illegal hook call would do
  return hookCallCount.n;
}

// your code here
// Fix: make this a proper "hook-shaped" factory so each call site gets
// its own counter, like a custom hook returning per-instance state.
function createCounter() {
  let n = 0;
  return () => ++n;
}
const c1 = createCounter();
const c2 = createCounter();
c1(); c1();
console.log('c1:', c1(), '| c2:', c2());

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// An early return before a hook call skips it — same desync as a gap.
// Detect the corruption: the function "reads" slot 2 expecting 'c' but
// the list walk never advanced past the gap.
const slots = ['s0', 's1', 's2'];
function component(earlyReturn, callCount) {
  if (earlyReturn) return 'early';            // hooks below never run
  const read = [];
  for (let i = 0; i < callCount; i++) {
    read.push(slots[i]);
  }
  return read;
}
console.log('normal render:', component(false, 3));
console.log('early return:', component(true, 3)); // what does the caller see?

// ── Task 5 ──────────────────────────────────────────────────────────
// The fix is structural: keep the hook CALL COUNT fixed between renders,
// and move the condition into the data. Implement a render that always
// calls every hook (fixed count) but varies the value.
function fixedRender(count, enabled) {
  const calls = [];
  for (let i = 0; i < count; i++) {
    calls.push({ slot: i, value: enabled ? `on-${i}` : `off-${i}` });
  }
  return calls;
}
console.log(fixedRender(3, true));
console.log(fixedRender(3, false)); // same call count, different values

module.exports = { render, renderWithGap, createCounter, fixedRender };
