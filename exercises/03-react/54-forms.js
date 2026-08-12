'use strict';
// Lesson 54 — Controlled vs Uncontrolled Forms. Run with:  node exercises/03-react/54-forms.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Which call is a "controlled" update, and which is "uncontrolled"?
// Prediction: ______________________
function task1() {
  // A "component" holding state, the way useState would.
  function createField(initial) {
    let value = initial;
    return {
      read: () => value,
      write: (next) => { value = next; },
    };
  }

  const state = createField('');

  state.write('a');              // controlled update
  console.log(state.read());

  state.write('ab');             // another controlled update
  console.log(state.read());
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Simulate the "frozen input" bug: value prop without an onChange.
// React renders `value` back over whatever the user typed.
// Prediction: ______________________
function task2() {
  let value = '';   // React state

  function render(nextDOM) {
    // React applies its virtual tree to the DOM...
    nextDOM.value = value;
  }

  // user types "x" → DOM edits itself, but React state never changes
  const dom = { value: '' };
  dom.value = 'x';          // the browser's edit
  render(dom);              // React re-renders value back over it
  console.log('after render, input shows:', dom.value);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// defaultValue seeds once and never follows later changes.
// Prediction: ______________________
function task3() {
  let savedName = 'Ali';

  // uncontrolled: defaultValue applied once on mount
  function mount(defaultValue) {
    return { value: defaultValue };
  }

  const input = mount(savedName);

  savedName = 'Ahmed';      // prop changes later...
  // ...but uncontrolled input keeps its own DOM value
  console.log('input still shows:', input.value);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Validation must read the CURRENT value. Why does this sync fail?
// Prediction: ______________________
function task4() {
  let email = '';

  function validate() {
    console.log('valid?', email.includes('@'));
  }

  // controlled: every keystroke updates state, then we validate
  email = 'a@b';
  validate();

  // uncontrolled: the DOM owns the value...
  const input = { value: 'c@d' };
  // ...but state never heard about it, so validation is stale
  validate();
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Predict the output. File inputs can never be controlled.
// Prediction: ______________________
function task5() {
  const fileInput = { files: [] };   // the browser sets this; React can't

  // a controlled <input value=...> gets written back by React:
  const controlled = { value: '' };
  controlled.value = 'x';
  controlled.value = 'y';   // re-render writes state over it

  // a file input has no writable value, so React can't control it:
  console.log('file input value:', fileInput.value);
}
// task5();

module.exports = {};
