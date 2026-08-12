'use strict';
// Lesson 106 — Request Lifecycle. Run with:  node exercises/06-laravel/106-request-lifecycle.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A middleware pipeline as an array of layers: the request passes
// through the stack IN order, reaches the route, and the response
// returns OUT in REVERSE. Predict the exact log lines.
function pipeline(layers, request) {
  let index = 0;
  function next(req) {
    if (index >= layers.length) {
      // the "route" — a response that out-pass middleware can decorate
      return { status: 200, body: `handled: ${req.path}`, headers: {} };
    }
    const layer = layers[index++];
    return layer(req, next); // in Laravel this is $next($request)
  }
  return next(request);
}

const trace = (name, onIn, onOut = '') =>
  (req, next) => {
    console.log(`[IN]  ${name}`);
    const res = next(req);
    if (onOut) console.log(`[OUT] ${name}: ${onOut}`);
    return res;
  };

const stack = [
  trace('auth', true),
  trace('session', true),
  trace('throttle', true),
];

function task1() {
  const res = pipeline(stack, { path: '/dashboard' });
  console.log('final', res.status, res.body);
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The OUT pass is where middleware modifies the response. Predict the
// final header set, then note the ORDER the headers were added.
const withHeader = (name, value) =>
  (req, next) => {
    const res = next(req); // the response is back — we're on the way out
    res.headers[name] = value;
    return res;
  };

function task2() {
  const res = pipeline([...stack, withHeader('X-Duration-Ms', '42')], { path: '/api' });
  console.log(res.status, res.headers);
}
// Prediction: ______________________
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Order matters: an auth gate BEFORE the route must BLOCK the request
// without ever reaching the route. Fix `requiresAuth` so an anonymous
// request short-circuits (no route work) and an authenticated one
// passes through.
function requiresAuth(req, next) {
  if (!req.user) return { status: 401, body: 'Unauthorized' }; // block before the route
  return next(req);                                            // pass through
}

const guarded = [
  requiresAuth,
  trace('throttle', true),
];

function task3() {
  const anon = pipeline(guarded, { path: '/dashboard' });
  const authed = pipeline(guarded, { path: '/dashboard', user: 'ada' });
  console.log('anon ', anon.status, anon.body);
  console.log('authed', authed.status, authed.body);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The kernel's bootstrapping sequence, as a plain array of steps.
// Predict the log order, then add the TWO missing steps so the full
// Laravel order runs: env, config, exceptions, facades, register
// providers, boot providers.
function bootstrap(steps) {
  for (const step of steps) console.log('bootstrapping:', step);
}

function task4() {
  const steps = [
    'load environment (.env)',
    'load config',
    'register exceptions',
    'register facades',
    'register providers',
    'boot providers',
  ];
  bootstrap(steps);
}
// Prediction: ______________________
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The container gets its chance during provider registration. This
// mini-app registers providers into a container BEFORE the pipeline
// runs, and the route resolves its service from that container.
// Predict the three output lines.
function miniApp(providers) {
  const container = { services: {} };
  for (const provider of providers) provider.register(container); // step 5
  for (const provider of providers) provider.boot(container);     // step 6
  return container;
}

function task5() {
  const container = miniApp([
    { register: (c) => { c.services.db = { query: (s) => `SELECT ${s}` }; }, boot: () => {} },
    { register: (c) => { c.services.repo = (db) => ({ all: () => db.query('* FROM users') }); }, boot: (c) => { c.repoReady = true; } },
  ]);
  const repo = container.services.repo(container.services.db);
  console.log(repo.all());
  console.log(container.repoReady);
  console.log('provider order: register-then-boot, every provider');
}
// task5();

module.exports = { pipeline, requiresAuth, bootstrap, miniApp };
