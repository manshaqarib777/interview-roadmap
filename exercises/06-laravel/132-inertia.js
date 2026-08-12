'use strict';
// Lesson 132 — Laravel + React / Inertia. Run with:  node exercises/06-laravel/132-inertia.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (Inertia's real wire format is JSON; we model the page object with plain objects.)

// ── Task 1 ──────────────────────────────────────────────────────────
// Model Inertia::render(): build a page object from a component name and
// props. The response shape on the wire is { component, props, url }.
// Prediction: ______________________
function render(component, props, url) {
  // your code here
  return {};
}

function task1() {
  const page = render('Users/Index', { users: [{ id: 1, name: 'Ada' }] }, '/users');
  console.log(page.component);
  console.log(page.props.users[0].name);
  console.log(page.url);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Eloquent models serialize automatically. Model it: models are objects
// with attributes; the response should carry the plain data, not the
// class. Hidden attributes (__ prefix, like Laravel's $hidden) and
// methods never ship.
// Prediction: ______________________
function serializeModel(instance) {
  // your code here — drop methods and __-prefixed (hidden) keys
  return instance;
}

function task2() {
  const user = { id: 1, name: 'Ada', __hidden: 'secret', getAttributes() { return this; } };
  console.log(JSON.stringify(serializeModel(user)));
}
// Expected: {"id":1,"name":"Ada"}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Validation errors from a form request arrive as a redirect + session
// flash. Model the errors-to-props merge: merge incoming errors into the
// page props WITHOUT overwriting existing props.
// Prediction: ______________________
function mergeErrors(pageProps, errors) {
  // your code here — result must keep existing props and add an 'errors' key
  return pageProps;
}

function task3() {
  const props = { users: [{ id: 1 }], flash: { message: 'Created.' } };
  const merged = mergeErrors(props, { email: ['The email has already been taken.'] });
  console.log(merged.errors.email[0]);
  console.log(merged.users.length, merged.flash.message);
}
// Expected:
//   The email has already been taken.
//   1 Created.
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Partial reloads: only the requested props cross the wire. Build the
// response that ships ONLY the props named in `only`, and skip the rest.
// Prediction: ______________________
function partialReload(allProps, only) {
  // your code here — return { props, skipped }
  return { props: {}, skipped: [] };
}

function task4() {
  const all = { users: [1, 2, 3], stats: { views: 9 }, settings: { dark: true } };
  const res = partialReload(all, ['users']);
  console.log('shipped:', Object.keys(res.props).join(', '));
  console.log('skipped:', res.skipped.join(', '));
  console.log('stats still intact:', all.stats.views);
}
// Expected:
//   shipped: users
//   skipped: stats, settings
//   stats still intact: 9
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Lazy props: heavy data is computed only when the page first asks for it.
// Model it with a thunk that runs at most once and is memoized.
// Prediction: ______________________
function lazyProps(propDefs) {
  // your code here — return an object where each value resolves its thunk once
  return {};
}

function task5() {
  let heavyCalls = 0;
  const props = lazyProps({
    users: () => [1, 2],
    stats: () => { heavyCalls += 1; return { views: 42 }; },
  });
  console.log('stats:', props.stats.views, props.stats.views);
  console.log('heavy computed:', heavyCalls, 'times');
  console.log('users:', props.users.join(','));
}
// Expected:
//   stats: 42 42
//   heavy computed: 1 times
//   users: 1,2
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const page = render('Settings/Show', { user: { id: 3 }, flash: {} }, '/settings');
  const merged = mergeErrors({ ...page.props }, { name: ['The name field is required.'] });
  console.log(page.component);
  console.log(merged.errors.name[0]);
}
// task6();

module.exports = { render, serializeModel, mergeErrors, partialReload, lazyProps };
