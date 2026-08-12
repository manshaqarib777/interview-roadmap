'use strict';
// Lesson 102 — Frontend System Design. Run with:  node exercises/05-interview-prep/102-system-design.js
// Tasks 1, 4 and 5 are written answers in the comments. Task 3 is a function for you to
// implement. Running the file prints the reference answers so you can check your predictions.

// ── Task 1 ──────────────────────────────────────────────────────────
// Fill in the four phases of a frontend system-design interview, in order:
//   1. ____________________  → turn the prompt into functional + non-functional requirements
//   2. ____________________  → DAU, data size, latency budget (three defensible numbers)
//   3. ____________________  → data model, API, component tree, state, perf, errors/a11y
//   4. ____________________  → defend each decision, name the cost, say when you'd switch

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: write the output you expect BEFORE running the file.
// Prediction: peakConcurrent = ______ · perLoadKB = ______ · requestsPerSec = ______
function estimateFeed({ dau, peakFraction, itemsPerLoad, bytesPerItem, loadsPerUserPerDay }) {
  const peakConcurrent = Math.round(dau * peakFraction);
  const perLoadKB = (itemsPerLoad * bytesPerItem) / 1024;
  const requestsPerDay = dau * loadsPerUserPerDay;
  const requestsPerSec = Math.round(requestsPerDay / 86400);
  return { peakConcurrent, perLoadKB: Math.round(perLoadKB * 10) / 10, requestsPerSec };
}

function task2() {
  const feed = estimateFeed({
    dau: 1_000_000,
    peakFraction: 0.1,
    itemsPerLoad: 30,
    bytesPerItem: 5 * 1024, // 5 KB per feed item
    loadsPerUserPerDay: 10,
  });
  console.log('feed:', JSON.stringify(feed));
}

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement estimateChat below. Formulas:
//   peakConcurrent = users * peakFraction
//   opsPerSec      = Math.round((users * peakFraction * msgsPerUserPerMin) / 60)
function estimateChat(config) {
  // your code here
  return null;
}

function task3() {
  const chat = estimateChat({ users: 10_000, peakFraction: 0.5, msgsPerUserPerMin: 10 });
  console.log('chat:', JSON.stringify(chat));
  // expected: {"peakConcurrent":5000,"opsPerSec":833}
}

// ── Task 4 ──────────────────────────────────────────────────────────
// Small estimation math. The collaborative editor serves 1.5M edits/day.
// Fill in the blanks, then check your arithmetic against the run output.
//   1.5M edits/day ÷ 86,400 s/day ≈ ______ edits/sec average
//   if peak is 20× the average,    peak ≈ ______ edits/sec
function editsPerSecond(totalPerDay, peakFactor) {
  const avg = totalPerDay / 86400;
  return { avg: Math.round(avg), peak: Math.round(avg * peakFactor) };
}

// ── Task 5 ──────────────────────────────────────────────────────────
// State-strategy decision (Lesson 82). For each feature, write the bucket it belongs to:
//   SERVER (cache it — TanStack Query) · CLIENT-SHARED (state library / context) · EPHEMERAL (useState)
//   a. the feed item list            → ________
//   b. which sidebar section is open → ________
//   c. the user's comment drafts     → ________
//   d. live cursor positions         → ________
// Then implement chooseStateLayer to encode your answers and run task5() to check them.
function chooseStateLayer(feature) {
  // return 'server' | 'client-shared' | 'ephemeral'
  // your code here
  return null;
}

function task5() {
  for (const f of ['feedList', 'sidebarOpen', 'commentDraft', 'cursorPositions']) {
    console.log(f, '→', chooseStateLayer(f));
  }
}

// ── Reference answers (shown when you run the file) ─────────────────
if (require.main === module) {
  console.log('=== 102-system-design exercise ===');
  task2();
  console.log('---');
  console.log('editsPerSecond(1_500_000, 20) →', JSON.stringify(editsPerSecond(1_500_000, 20)));
  console.log('---');
  console.log('Did the feed output match your Task 2 prediction? Uncomment task3() and task5()');
  console.log('after implementing them. Task 4 averages ~17 edits/sec, peak ~347/sec.');
}

module.exports = { estimateFeed, estimateChat, editsPerSecond, chooseStateLayer };
