'use strict';
// Lesson 63 — useContext. Run with:  node exercises/03-react/63-usecontext.js
// No React here — plain JS that mimics how context re-render decisions work.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// A context value is "stable" only when its identity is unchanged.
// Why does the SECOND log show a new identity?
const themeValue = { theme: 'dark' };
console.log(themeValue === themeValue);
console.log({ theme: 'dark' } === { theme: 'dark' });

// ── Task 2 ──────────────────────────────────────────────────────────
// Every render of the provider creates a NEW value object (the context
// re-render bug). Simulate: how many distinct objects does a loop create?
function renderValue() {
  return { theme: 'dark' }; // ❌ new object every call — like an inline value
}
function memoizedValue() {
  return renderValue.cached; // ✅ same object every call — like useMemo
}
memoizedValue.cached = renderValue();
const rendered = new Set();
const memoized = new Set();
for (let i = 0; i < 3; i++) {
  rendered.add(renderValue());
  memoized.add(memoizedValue());
}
console.log('inline  objects:', rendered.size);
console.log('memoised objects:', memoized.size);

// ── Task 3 ──────────────────────────────────────────────────────────
// Consumers re-render when the value CHANGES. Which of these value
// updates should re-render a consumer? (Answer: which produce a new identity)
const consumers = [];
function subscribe(consumer) {
  consumers.push(consumer);
}
function update(value) {
  consumers.forEach((c) => c(value));
}
subscribe((v) => console.log('consumer got:', v.theme));
update({ theme: 'light' }); // A — new object: re-renders?
update({ theme: 'light' }); // B — another new object: re-renders?
// your code here — copy the value so C keeps identity (no re-render)
let same = { theme: 'dark' };
// update(same); // C — same object: re-render?

// ── Task 4 ──────────────────────────────────────────────────────────
// Context is NOT a state manager: it delivers values, it doesn't hold them.
// "Holding state" here means storing it in a closure. Implement a minimal
// value holder (the useState part), then read it through a "context" getter.
function createValue(initial) {
  // your code here
  let current = initial;
  return {
    get: () => current,
    set: (next) => { current = next; },
  };
}
const auth = createValue({ user: null });
const { user } = auth.get();
console.log('before login, user =', user);
auth.set({ user: { name: 'Ali' } });
console.log('after login, user =', auth.get().user.name);

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The default context value is used ONLY when no provider exists.
// A provider that passes `undefined` shadows the default.
function readContext(defaultValue, providerValue) {
  return providerValue === undefined ? defaultValue : providerValue;
}
console.log(readContext('light', undefined));   // no provider → default
console.log(readContext('light', 'dark'));      // provider value
console.log(readContext('light', null));        // provider passes null

module.exports = { renderValue, memoizedValue, createValue, readContext };
