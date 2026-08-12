'use strict';
// Lesson 112 — Middleware. Run with:  node exercises/06-laravel/112-middleware.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (A plain-JS model of the middleware onion: a request passes through
//  layers in order, and the response passes back in reverse.)

// ── Task 1 ──────────────────────────────────────────────────────────
// The onion. A middleware is a function that wraps the next one. Trace
// the order in and the order out. Predict the console lines exactly.
// Prediction: ______________________
function task1() {
  // three layers, innermost last: A wraps B wraps the controller
  const layers = [
    (req, next) => { console.log('A in'); const res = next(req); console.log('A out'); return res; },
    (req, next) => { console.log('B in'); const res = next(req); console.log('B out'); return res; },
    (req) => { console.log('controller got', req); return 'HTML'; },
  ];
  // fold right-to-left so the controller is innermost
  let pipeline = layers[layers.length - 1];
  for (let i = layers.length - 2; i >= 0; i--) {
    const layer = layers[i];
    const inner = pipeline;
    pipeline = (req) => layer(req, inner);
  }
  const response = pipeline('GET /users');
  console.log('final response:', response);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The classic auth gate: no session → redirect to /login. Complete
// ensureAuth so only a logged-in user reaches the controller.
function ensureAuth(request, next) {
  // your code here
  // If request.session is missing, return { redirect: '/login' } and never
  // call next. Otherwise pass the request through and return next(request).
}

function task2() {
  const controller = (req) => 'dashboard rendered';
  console.log(ensureAuth({ path: '/dashboard' }, controller));
  console.log(ensureAuth({ path: '/dashboard', session: 'abc' }, controller));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Parameters: throttle:60,1 = 60 requests per 1-minute window, keyed by
// client. Predict the outputs, then implement throttle.
// Prediction: ______________________
function throttle(limit, windowMinutes, requests, clientKey) {
  // your code here
  // requests is a Map keyed by client → array of timestamps. Within
  // windowMinutes * 60000 ms, count timestamps; if adding this request
  // would exceed `limit`, return { allowed: false, remaining: 0 }.
  // Otherwise record the timestamp and return { allowed: true, remaining }.
}

function task3() {
  const now = Date.now();
  const requests = new Map([['ip-1', [now - 2000, now - 1000]]]); // 2 already
  console.log(throttle(2, 1, requests, 'ip-1')); // 2 already + 1 = over limit?
  console.log(throttle(3, 1, requests, 'ip-1')); // limit 3 → allowed?
  console.log(throttle(3, 1, requests, 'ip-2')); // fresh client → allowed?
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The admin gate: auth establishes identity, admin decides permission.
// Both are middleware layers; the request must pass through auth FIRST.
// Implement the pipeline so the outputs are correct.
function adminPipeline(request) {
  // your code here
  // Layer 1 (auth): no session → { status: 302, to: '/login' }.
  // Layer 2 (admin): session but not admin → { status: 403, body: 'Admins only.' }.
  // Otherwise the controller runs: { status: 200, body: 'admin reports' }.
}

function task4() {
  console.log(adminPipeline({ path: '/admin/reports' }));
  console.log(adminPipeline({ path: '/admin/reports', session: 'abc', isAdmin: false }));
  console.log(adminPipeline({ path: '/admin/reports', session: 'abc', isAdmin: true }));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The response passes back in REVERSE. A header set after next() in an
// outer layer overwrites what an inner layer set on the way out.
// Predict the three outputs.
// Prediction: ______________________
function task5() {
  const inner = (req) => ({ status: 200, headers: { 'X-Powered-By': 'inner' } });

  const layerA = (req, next) => { const res = next(req); res.headers['X-Powered-By'] = 'A'; return res; };
  const layerB = (req, next) => { const res = next(req); res.headers['X-Powered-By'] = 'B'; return res; };

  const pipeline = (req) => layerA(req, () => layerB(req, () => inner(req)));
  console.log(pipeline({})); // A wraps B wraps inner — who wins the header?

  console.log('B only:', layerA({}, () => layerB({}, () => inner({}))).headers);
  console.log('A then B:', layerB({}, () => layerA({}, () => inner({}))).headers);
}
// task5();

module.exports = { ensureAuth, throttle, adminPipeline };
