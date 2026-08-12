'use strict';
// Lesson 49 — Props. Run with:  node exercises/03-react/49-props.js
// Props are read-only function arguments flowing parent → child.
// Simulated with plain JS.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A component receives one props object. Destructuring = the param list.
function Greeting({ name, lang = 'en' }) {
  return { type: 'p', props: { children: lang === 'en' ? `Hi ${name}` : `مرحباً ${name}` } };
}
console.log(Greeting({ name: 'Mansha' }).props.children);
console.log(Greeting({ name: 'Ali', lang: 'ar' }).props.children);

// ── Task 2 ──────────────────────────────────────────────────────────
// Callbacks flow down; the child calls them with its own value.
function SearchBox({ onQueryChange }) {
  // simulating the user typing 'react' into the input
  onQueryChange('react');
  return { type: 'input', props: { placeholder: 'Search' } };
}
let query = '';
SearchBox({ onQueryChange: (value) => { query = value; } });
// Prediction: ______________________
console.log(query);

// ── Task 3 ──────────────────────────────────────────────────────────
// Children are a prop too — the composition slot.
function Card({ title, children }) {
  return { type: 'div', props: { className: 'card', children } };
}
const card = Card({ title: 'T', children: { type: 'strong', props: { children: 'bold' } } });
console.log(card.props.children.type);

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement `UserCard` (data + callback + children). Don't mutate `user`.
// Fill the gap, then uncomment task4().
function UserCard({ user, onSelect, children }) {
  // your code here
  // return: { type: 'div', props: { className: 'user-card', children: [...] } }
  // children must be: [user.name, children, { type: 'button', props: { onClick: onSelect } }]
  return { type: 'div', props: {} };
}
function task4() {
  const u = { name: 'Mansha' };
  let selected = null;
  const el = UserCard({ user: u, onSelect: (user) => { selected = user; }, children: 'extra' });
  console.log(el.props.children[0], el.props.children[1]); // must be 'Mansha' 'extra'
  el.props.children[2].props.onClick(u);                   // must set selected = u
  console.log(selected.name, selected === u);              // must be 'Mansha' true
  console.log(u.name);                                     // must still be 'Mansha' (read-only)
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The mutation pitfall: replace, don't edit. Fill the gap, then run.
function updateTheme(s, next) {
  // your code here (hint: return a NEW object, keep `s` untouched)
  return s;
}
const settings = { theme: 'dark' };
const nextSettings = updateTheme(settings, 'light');
// Prediction: ______________________
console.log(settings.theme, nextSettings.theme); // must be dark light

// ── Task 6 ──────────────────────────────────────────────────────────
// A typed-props stand-in: validate prop types like TS would at compile time.
function requireString(props, name) {
  if (typeof props[name] !== 'string') {
    throw new TypeError(`Prop "${name}" must be a string`);
  }
}
requireString({ title: 'ok' }, 'title');
// Prediction: ______________________
try {
  requireString({ title: 42 }, 'title');
  console.log('no throw');
} catch (err) {
  console.log(err.message);
}

module.exports = { Greeting, SearchBox, Card, UserCard, updateTheme, requireString };
