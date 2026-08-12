'use strict';
// Lesson 114 — Blade. Run with:  node exercises/06-laravel/114-blade.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (A plain-JS model of Blade's escaping rule: interpolate escapes, raw
//  interpolate doesn't — plus directives, slots and stacks.)

// ── Task 1 ──────────────────────────────────────────────────────────
// {{ $value }} escapes through e(); {!! $value !!} does not. Predict
// which values stay safe, then implement both.
// Prediction: ______________________
function e(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(value).replace(/[&<>"']/g, (ch) => map[ch]);
}

function escaped(value) {
  // your code here
  return e(value); // {{ $value }}
}

function raw(value) {
  // your code here
  return String(value); // {!! $value !!}
}

function task1() {
  const attack = '<script>alert(1)</script>';
  console.log('escaped:', escaped(attack));
  console.log('raw:    ', raw(attack));
  console.log('author:', escaped('Ada "A" <Lovelace>'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// @foreach … @empty renders the empty state when the list has no items.
// Implement renderList so an empty array prints the @empty branch.
function renderList(items) {
  // your code here
  // Build the inner HTML with items escaped. If the array is empty,
  // return '<li>No posts yet.</li>'. Otherwise one <li> per item.
}

function task2() {
  console.log(renderList(['Hello', 'World']));
  console.log(renderList([]));
  console.log(renderList(['<b>hi</b>']));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// A layout component: <x-layout>…</x-layout> — the body is the $slot.
// Predict what renderLayout produces for each call.
// Prediction: ______________________
function renderLayout(title, slot) {
  return `<html><head><title>${escaped(title)}</title></head><body>${slot}</body></html>`;
}

function task3() {
  console.log(renderLayout('Posts', '<h1>All posts</h1>'));
  console.log(renderLayout('<script>', '<p>x</p>'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// @push('scripts') … @stack('scripts') — per-page scripts land in the
// layout. Implement push + stack.
const stacks = { scripts: [], styles: [] };

function push(name, content) {
  // your code here
  if (!stacks[name]) stacks[name] = [];
  stacks[name].push(content);
}

function stack(name) {
  // your code here
  return (stacks[name] ?? []).join('\n');
}

function task4() {
  push('styles', '<link rel="stylesheet" href="posts.css">');
  push('scripts', '<script>highlight();</script>');
  push('scripts', '<script>track();</script>');
  console.log(stack('styles'));
  console.log(stack('scripts'));
  console.log(stack('empty'));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The full page: layout + section + @auth/@guest. Predict the three
// outputs, then implement renderPage.
// Prediction: ______________________
function renderPage(parts) {
  // your code here
  // parts = { title, content, user, scripts: [] }
  // user null → 'guest' nav; user set → 'dashboard' nav.
  // scripts pushed into a 'scripts' stack render before </body>.
  return '';
}

function task5() {
  console.log(renderPage({ title: 'Home', content: '<p>hi</p>', user: null, scripts: [] }));
  console.log(renderPage({ title: 'Home', content: '<p>hi</p>', user: { name: 'Ada' }, scripts: [] }));
  console.log(renderPage({ title: 'Home', content: '<p>hi</p>', user: null, scripts: ['<script>x();</script>'] }));
}
// task5();

module.exports = { escaped, raw, renderList, renderLayout, push, stack, renderPage };
