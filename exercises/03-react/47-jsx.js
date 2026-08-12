'use strict';
// Lesson 47 — JSX. Run with:  node exercises/03-react/47-jsx.js
// JSX is a function call. Simulate it with plain JS — no React needed.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function createElement(type, props, ...children) {
  return { type, props: props || {}, children };
}

const el = createElement('div', { className: 'card' }, 'Hello');
console.log(el.type, el.props.className, el.children);
// Prediction: ______________________
const nested = createElement('ul', null,
  createElement('li', null, 'a'),
  createElement('li', null, 'b')
);
console.log(nested.children.length, nested.children[1].type);

// ── Task 2 ──────────────────────────────────────────────────────────
// JSX renames reserved words: `class` → `className`, `for` → `htmlFor`.
// Fill the props so the assertion holds, then uncomment task2().
function task2() {
  const el = createElement('a', {
    // your code here (hint: two properties — className and htmlFor)
  }, 'go');
  console.log(el.props); // must show { className: 'link', htmlFor: 'x' } and nothing else
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Expressions work inside {}; statements don't. Predict each log.
function pick(isDark) {
  // this IS an expression (a ternary), so it's legal in JSX
  return isDark ? 'dark' : 'light';
}
console.log(pick(false));
// Prediction: ______________________
console.log(`theme is ${pick(true).toUpperCase()}`);

// ── Task 4 ──────────────────────────────────────────────────────────
// Children are just extra arguments — conditional content included.
function render(el) {
  if (typeof el === 'string' || typeof el === 'number') return String(el);
  const { type, props, children } = el;
  const attrs = Object.entries(props || {})
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  return `<${type}${attrs}>${(children || []).map(render).join('')}</${type}>`;
}

// Your JSX-ish tree:  <div className="card"><h1>Hi</h1></div>
const card = createElement('div', { className: 'card' },
  createElement('h1', null, 'Hi')
);
console.log(render(card));

// ── Task 5 ──────────────────────────────────────────────────────────
// The automatic runtime folds children into props. Implement `jsx`,
// then uncomment task5().
function jsx(type, props) {
  // your code here (hint: return the type plus all the props)
  return { type };
}
function task5() {
  const auto = jsx('p', { className: 'lead', children: 'it works' });
  console.log(auto.type, auto.className, auto.children); // must be: p lead it works
}
// task5();

module.exports = { createElement, jsx, render };
