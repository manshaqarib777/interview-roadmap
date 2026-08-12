'use strict';
// Lesson 70 — Virtualization. Run with:  node exercises/03-react/70-virtualization.js
// Predict every output BEFORE running. Write your prediction in the comment.

// Virtualization without a browser: simulate the windowing math —
// which rows would be mounted given a scrollTop and a viewport height.

// ── Task 1 ──────────────────────────────────────────────────────────
// Compute the visible row range for fixed-height rows.
// Prediction: ______________________
function visibleRange(scrollTop, viewportHeight, rowHeight) {
  // your code here — return [startIndex, endIndex]
  return [0, 0];
}

console.log(visibleRange(0, 600, 40));       // expect [0, 15]
console.log(visibleRange(800, 600, 40));     // expect [20, 35]
console.log(visibleRange(9960, 600, 40));    // expect [249, 264]

// ── Task 2 ──────────────────────────────────────────────────────────
// A spacer needs the TOTAL height of all rows. Compute it.
function totalHeight(itemCount, rowHeight) {
  // your code here
  return 0;
}

console.log('total height:', totalHeight(100000, 40)); // expect 4000000

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task3() {
  const itemCount = 100000;
  const rowHeight = 40;
  const viewportHeight = 600;
  const overscan = 5;

  function rangeAt(scrollTop) {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(itemCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
    return [start, end];
  }

  console.log(rangeAt(0));      // [0, 20]
  console.log(rangeAt(3996000)); // last window
  console.log('rows mounted vs total:', rangeAt(1000)[1] - rangeAt(1000)[0], 'of', itemCount);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Windowed rows must be absolutely positioned. Compute each row's `top`.
// Prediction: ______________________
function rowTop(index, rowHeight) {
  // your code here
  return 0;
}

console.log('top of row 0:', rowTop(0, 40));   // 0
console.log('top of row 25:', rowTop(25, 40)); // 1000
console.log('top of row 99999:', rowTop(99999, 40)); // 3999960

// ── Task 5 ──────────────────────────────────────────────────────────
// Fixed-size positions are O(1). Variable heights need an offset lookup.
// Implement a simple VariableSizeList positioner.
function createVariablePositions(heights) {
  const offsets = [];
  // your code here — offsets[i] = sum of heights[0..i-1]
  return offsets;
}

const offsets = createVariablePositions([20, 30, 40, 10]);
console.log('offsets:', offsets); // expect [0, 20, 50, 90]
console.log('total height:', offsets[offsets.length - 1] + 10); // expect 100

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const itemCount = 100000;
  const rowHeight = 40;
  const viewportHeight = 600;

  const start = Math.floor(1000 / rowHeight);
  const end = Math.ceil((1000 + viewportHeight) / rowHeight);
  const mounted = end - start;

  console.log('start:', start, 'end:', end, 'mounted:', mounted);
  console.log('mounted as % of total:', ((mounted / itemCount) * 100).toFixed(4) + '%');
}
// task6();

module.exports = { visibleRange, totalHeight, rowTop, createVariablePositions };
