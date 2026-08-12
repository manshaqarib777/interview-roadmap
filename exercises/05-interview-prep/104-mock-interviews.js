'use strict';
// Lesson 104 — Mock Interview Playbook. Run with:  node exercises/05-interview-prep/104-mock-interviews.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// The one-sentence-then-detail shape.
// Implement `answer(oneSentence, detail)` so it returns the shape:
//   "1: <oneSentence>\n2: <detail>\n3: <one more step deeper>"
// Prediction: ______________________
function answer(oneSentence, detail) {
  // your code here
  return `${oneSentence} ${detail}`;
}

// console.log(answer('useMemo caches a value, useCallback caches a function.',
//   'The honest add-on is that you usually should not use either.'));

// ── Task 2 ──────────────────────────────────────────────────────────
// The think-aloud protocol has five beats: restate, plan, code, test, discuss.
// Given an ordered list of the beats, find the index of a given beat.
// Prediction: ______________________
const BEATS = ['restate', 'plan', 'code', 'test', 'discuss'];

function beatIndex(name) {
  return BEATS.indexOf(name);
}

// console.log(beatIndex('test'));
// console.log(beatIndex('silence'));

// ── Task 3 ──────────────────────────────────────────────────────────
// The "make it work, then make it fast" rule, applied.
// Implement `firstWorking(fn, fast, budget)` that returns 'work' if fn runs
// within budget ms (measured by a fake clock), else 'fast'.
// Prediction: ______________________
function firstWorking(fn, fast, budget) {
  const ran = fn();
  return ran <= budget ? 'work' : 'fast';
}

// console.log(firstWorking(() => 5, 0, 10));       // 5ms within a 10ms budget
// console.log(firstWorking(() => 20, 0, 10));      // 20ms over a 10ms budget

// ── Task 4 ──────────────────────────────────────────────────────────
// The trade-off shape: "chose A because X, the cost is Y, I'd switch if Z."
// Implement `tradeoff(choice, reason, cost, switchIf)` to produce that shape.
// Prediction: ______________________
function tradeoff(choice, reason, cost, switchIf) {
  // your code here
  return '';
}

// console.log(tradeoff('trailing debounce', 'the last call wins', 'leading-edge delayed',
//   'the product needs instant feedback'));

// ── Task 5 ──────────────────────────────────────────────────────────
// The stuck drill: restate → name the stuck part → pick the cheapest probe.
// Implement `stuckDrill(problem)` so that given
//   "why does my effect run every render"
// it returns the probe: "probe: add a console.log inside the effect"
// (i.e. prefix the input with "probe: ").
// Prediction: ______________________
function stuckDrill(problem) {
  // your code here
  return '';
}

// console.log(stuckDrill('why does my effect run every render'));

// ── Task 6 ──────────────────────────────────────────────────────────
// The close: 2-3 questions that invite stories.
// Given a list of questions, keep only the ones that invite a story
// (contain 'challenge', 'decision', or 'disagree').
// Prediction: ______________________
function keepStoryQuestions(questions) {
  return questions.filter((q) => /challenge|decision|disagree/i.test(q));
}

const questions = [
  "What's the biggest challenge the team is facing this quarter?",
  'How many people work here?',
  'What decision was controversial recently?',
  'Do you offer free coffee?',
];
// console.log(keepStoryQuestions(questions));

module.exports = { answer, beatIndex, firstWorking, tradeoff, stuckDrill, keepStoryQuestions };
