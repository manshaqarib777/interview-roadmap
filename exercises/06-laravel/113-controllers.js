'use strict';
// Lesson 113 — Controllers, Requests & Responses. Run with:  node exercises/06-laravel/113-controllers.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (A plain-JS model of a resource controller dispatch: routes resolve to
//  the right method, form requests validate before the controller runs,
//  and the controller stays thin — validate, delegate, respond.)

// ── Task 1 ──────────────────────────────────────────────────────────
// Route::resource('posts', ...) maps 7 verbs+URLs to 7 method names.
// Complete dispatch so each (method, url) pair lands on the right method.
function resourceMethod(method, url) {
  // your code here
  // POST /posts             → 'store'
  // GET  /posts             → 'index'
  // GET  /posts/create      → 'create'
  // GET  /posts/{post}      → 'show'
  // GET  /posts/{post}/edit → 'edit'
  // PUT/PATCH /posts/{post} → 'update'
  // DELETE /posts/{post}    → 'destroy'
  // anything else           → null
}

function task1() {
  const calls = [
    ['GET', '/posts'],
    ['POST', '/posts'],
    ['GET', '/posts/create'],
    ['GET', '/posts/42'],
    ['GET', '/posts/42/edit'],
    ['PUT', '/posts/42'],
    ['PATCH', '/posts/42'],
    ['DELETE', '/posts/42'],
  ];
  for (const [m, u] of calls) console.log(m, u, '→', resourceMethod(m, u));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// A Form Request validates BEFORE the controller runs: bad input → 422,
// the action never executes. Implement validateAndDispatch.
function validateAndDispatch(input) {
  // your code here
  // Rules: title required, body required.
  // If any rule fails, return { status: 422, errors: { field: [message] } }.
  // Otherwise run the store action and return { status: 201, id }.
}

function task2() {
  console.log(validateAndDispatch({ title: 'Hi', body: 'World' }));
  console.log(validateAndDispatch({ title: 'Hi' }));
  console.log(validateAndDispatch({}));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// validated() only passes fields the rules allowed. A fat controller that
// reads request.all() lets 'admin' sneak into create(). Implement both.
function validated(input) {
  // your code here
  // Only the fields named in the rules pass through:
  //   title (required), body (required). Drop everything else.
}

function fatControllerCreate(input) {
  const data = { ...input }; // request->all(): everything, including 'admin'
  data.id = 1;
  return data;
}

function thinControllerCreate(input) {
  // your code here — persist only validated() fields
  const safe = validated(input);
  return { id: 1, ...safe };
}

function task3() {
  const attack = { title: 'Hi', body: 'World', admin: true };
  console.log('fat controller:', fatControllerCreate(attack));
  console.log('thin controller:', thinControllerCreate(attack));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The refactor: a 50-line store() collapses into validate → delegate →
// respond. Predict the three outputs.
// Prediction: ______________________
const storeService = {
  place(user, data) {
    return { id: 7, user: user.name, total: data.items.length * 10 };
  },
};

function thinStore(user, input) {
  const errors = {};
  if (!input.user_id) errors.user_id = ['required'];
  if (!Array.isArray(input.items) || input.items.length === 0) errors.items = ['required'];
  if (Object.keys(errors).length > 0) return { status: 422, errors };
  const order = storeService.place(user, input); // the delegated business logic
  return { status: 302, location: `/orders/${order.id}` };
}

function task4() {
  console.log(thinStore({ name: 'Ada' }, { user_id: 1, items: [{ sku: 'a', qty: 2 }] }));
  console.log(thinStore({ name: 'Ada' }, { user_id: 1, items: [] }));
  console.log(thinStore({ name: 'Ada' }, {}));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Responses: view, json, redirect. Model the response factory and
// predict which status each action produces.
// Prediction: ______________________
function response(type, payload) {
  const statuses = { view: 200, json: 200, redirect: 302, abort: 404 };
  return { status: statuses[type], type, payload };
}

function action(which) {
  switch (which) {
    case 'show':   return response('view', 'posts.show');
    case 'api':    return response('json', { data: [1, 2, 3] });
    case 'stored': return response('redirect', '/posts/1');
    case 'miss':   return response('abort', null);
  }
}

function task5() {
  console.log(action('show'));
  console.log(action('api'));
  console.log(action('stored'));
  console.log(action('miss'));
}
// task5();

module.exports = { resourceMethod, validateAndDispatch, validated, thinControllerCreate, thinStore };
