'use strict';
// Lesson 48 — Components & Composition. Run with:  node exercises/03-react/48-components-composition.js
// A component is a function returning an element; composition passes
// elements down through props. Simulated with plain JS.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A "component" is just a function. Calling it returns an element object.
// Prediction: ______________________
function Card(title) {
  return { type: 'div', props: { className: 'card', title } };
}
console.log(Card('Overview').props.title);

// ── Task 2 ──────────────────────────────────────────────────────────
// Composition = children passed as a prop. Predict the two logs.
function Layout({ title, children }) {
  return { type: 'main', props: { title, children } };
}
const layout = Layout({
  title: 'Dashboard',
  children: [{ type: 'p', props: { children: 'content' } }],
});
console.log(layout.props.title, layout.props.children.length);

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `CardGrid` — it composes cards via `children` (the slot).
// Fill the gap, then uncomment task3().
function CardGrid({ children }) {
  // your code here (hint: return a 'div' whose props carry the children)
  return { type: 'div', props: {} };
}
function task3() {
  const grid = CardGrid({
    children: [Card('One'), Card('Two')],
  });
  console.log(grid.props.children.length);            // must be 2
  console.log(grid.props.children[0].props.title);    // must be 'One'
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// `children` can be a FUNCTION (render props). Prediction: ___________
function DataList({ data, render }) {
  return data.map(render);
}
const rows = DataList({
  data: ['a', 'b'],
  render: (item) => ({ type: 'li', props: { children: item } }),
});
console.log(rows.map((r) => r.props.children).join(','));

// ── Task 5 ──────────────────────────────────────────────────────────
// Composition over configuration: build a composed button from a base.
// Fill the gap, then uncomment task5().
function BaseButton({ label, variant }) {
  return { type: 'button', props: { className: `btn btn-${variant}`, children: label } };
}
function PrimaryButton(label) {
  // your code here (hint: call BaseButton with a fixed variant)
  return null;
}
function task5() {
  console.log(PrimaryButton('Save'));   // must be { type: 'button', props: { className: 'btn btn-primary', children: 'Save' } }
  console.log(PrimaryButton('Delete')); // same shape, label 'Delete'
}
// task5();

module.exports = { Card, Layout, CardGrid, DataList, BaseButton, PrimaryButton };
