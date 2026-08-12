'use strict';
// Lesson 107 — Application Structure & Bootstrapping. Run with:  node exercises/06-laravel/107-app-structure.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// The bootstrap sequence, modelled with plain JS: config load FIRST,
// then every provider REGISTERS, then every provider BOOTS. Predict
// the exact order the seven lines print in.
function bootstrapApp(providers, configFiles) {
  console.log(`[config] loading ${configFiles.join(', ')}`);
  const container = {};
  for (const p of providers) p.register(container); // every register first
  for (const p of providers) p.boot(container);     // every boot second
  return container;
}

function task1() {
  const container = bootstrapApp(
    [
      { name: 'App',   register: (c) => { c.app = 'bound'; },  boot: () => console.log('[boot] App') },
      { name: 'Route', register: (c) => { c.route = 'bound'; }, boot: () => console.log('[boot] Route') },
      { name: 'Analytics', register: (c) => { c.analytics = 'bound'; }, boot: () => console.log('[boot] Analytics') },
    ],
    ['app.php', 'database.php', 'services.php'],
  );
  console.log('bound:', Object.keys(container).join(', '));
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// register() must BIND without USING. The bug below resolves a service
// inside register() before it exists. Predict what happens, then fix it
// by moving the resolve into boot() — keep the bind in register().
function brokenProviders() {
  const container = {};
  const providers = [
    {
      name: 'A',
      register: (c) => { c.a = { ping: () => 'pong' }; },
      boot: () => {},
    },
    {
      name: 'B',
      register: (c) => { c.b = c.a.ping(); }, // ❌ resolves A before A is bound
      boot: () => {},
    },
  ];
  for (const p of providers) p.register(container);
  return container;
}

function fixedProviders() {
  const container = {};
  const providers = [
    {
      name: 'A',
      register: (c) => { c.a = { ping: () => 'pong' }; },
      boot: () => {},
    },
    {
      name: 'B',
      register: (c) => {
        // bind ONLY — don't resolve A yet
        c.b = { ping: () => 'pong' };
      },
      boot: (c) => {
        // this runs after ALL registers, so A exists now
        c.b = c.a.ping();
      },
    },
  ];
  for (const p of providers) p.register(container);
  for (const p of providers) p.boot(container);
  return container;
}

function task2() {
  try {
    console.log('broken:', brokenProviders().b); // throws — that's the bug
  } catch (err) {
    console.log('broken threw:', err.message);
  }
  console.log('fixed:', fixedProviders().b);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// bootstrap/app.php wires routing + middleware. Model it: build the
// app, then verify the routes and middleware config are in place.
// Implement buildApp() so all three checks print true.
function buildApp(routes, middleware) {
  return { routes, middleware };
}

function task3() {
  const app = buildApp(
    { web: ['/dashboard', '/settings'], api: ['/api/v1/users'] },
    ['throttle', 'auth'],
  );
  console.log('has web route:', app.routes.web.includes('/dashboard'));
  console.log('has api route:', app.routes.api.includes('/api/v1/users'));
  console.log('has middleware:', app.middleware.includes('auth'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The provider manifest (bootstrap/providers.php). Predict the output
// of loadProviders, then write the REAL resolve() so each registered
// provider class gets its instance from the container (in list order).
const providerClasses = [
  { name: 'AppServiceProvider', order: 1 },
  { name: 'RouteServiceProvider', order: 2 },
  { name: 'AnalyticsProvider', order: 3 },
];

function loadProviders(manifest) {
  const loaded = [];
  for (const p of manifest) loaded.push(`${p.name} (${p.order})`);
  return loaded;
}

function resolveProviders(manifest, container) {
  return manifest.map((p) => container.get(p.name).name);
}

function task4() {
  const container = { get: (name) => providerClasses.find((p) => p.name === name) };
  console.log('manifest:', loadProviders(providerClasses).join(', '));
  console.log('resolved:', resolveProviders(providerClasses, container).join(', '));
}
// Prediction: ______________________
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Route files load in order and 404s point at the router. Predict the
// two lines, then implement routeFor() so unknown paths 404 and known
// paths return their controller.
const ROUTES = [
  { method: 'GET', path: '/', controller: 'HomeController@index' },
  { method: 'GET', path: '/products', controller: 'ProductController@index' },
];

function routeFor(method, path) {
  const route = ROUTES.find((r) => r.method === method && r.path === path);
  if (!route) return `404 — no route for ${method} ${path}`;
  return `${route.method} ${route.path} → ${route.controller}`;
}

function task5() {
  console.log(routeFor('GET', '/products'));
  console.log(routeFor('POST', '/products'));
}
// Prediction: ______________________
// task5();

module.exports = { bootstrapApp, brokenProviders, fixedProviders, buildApp, loadProviders, resolveProviders, routeFor };
