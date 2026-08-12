'use strict';
// Lesson 84 — Layouts & Nested Layouts. Run with:  node exercises/04-nextjs/84-layouts.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; none of them need a Next.js server to run.)

// ── Task 1 ──────────────────────────────────────────────────────────
// Layouts persist across navigation: the shell keeps its state while the
// page beneath swaps. Model "remounts" with an array.
// Prediction: ______________________
function navigate(path, log) {
  if (!log.includes(path)) log.push(path); // a layout is not remounted if it's already there
  return log;
}

function task1() {
  let shell = [];
  navigate('RootLayout', shell);
  navigate('DashboardLayout', shell);
  navigate('OverviewPage', shell);
  navigate('SettingsPage', shell); // page swap: the shell is untouched
  console.log(shell.join(' → '));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// A layout must render `children` or the subtree disappears. Model the
// bug: a layout that drops children.
// Prediction: ______________________
function renderTree(layout, children) {
  const parts = [layout];
  if (children !== undefined) parts.push(children);
  return parts.join(' > ');
}

function task2() {
  console.log(renderTree('DashboardLayout', renderTree('SettingsPage', null)));
  console.log(renderTree('SettingsPage', null)); // what if DashboardLayout forgets children?
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Nested layouts compose: each level wraps the one below it. Complete
// `wrap` so the output nests exactly like <Root><Dashboard><Page/></Dashboard></Root>.
function wrap(outer, inner) {
  // your code here — return a nested string, e.g. 'Root(Page)'
}

function task3() {
  console.log(wrap('Root', wrap('Dashboard', 'SettingsPage')));
  console.log(wrap('Root', 'BlogPage'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// A template re-mounts on every navigation; a layout does not. Which
// line logs the mount count?
// Prediction: ______________________
let mounts = 0;
function Template() {
  mounts += 1;
  return 'template body';
}

function task4() {
  // first navigation
  Template();
  // second navigation — templates re-mount, so this runs the function again
  Template();
  console.log('template mounts:', mounts);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The root layout is the only place that may render <html>/<body>.
// Validate a layout: root may render html, nested layouts may not.
function isValidLayout(kind, rendersDocumentTags) {
  // your code here — a root layout may, any other layout may not
}

function task5() {
  console.log('root with html:', isValidLayout('root', true));
  console.log('nested with html:', isValidLayout('nested', true));
  console.log('root without html:', isValidLayout('root', false));
}
// task5();

module.exports = { renderTree, wrap, isValidLayout };
