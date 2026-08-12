'use strict';
// Lesson 109 — Service Providers. Run with:  node exercises/06-laravel/109-service-providers.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; this models the register()/boot() lifecycle with plain JS.)

// ── Task 1 ──────────────────────────────────────────────────────────
// The two-phase lifecycle: ALL providers register first, THEN all boot.
// Even though P1's boot is written before P2's register, the phases
// guarantee order — registration fully finishes before any booting.
// Prediction: ______________________
function bootApp(providers) {
  const events = [];
  for (const p of providers) {
    events.push(`${p.name} register`); // phase 1: everyone registers
  }
  for (const p of providers) {
    events.push(`${p.name} boot`); // phase 2: everyone boots
  }
  return events;
}

function task1() {
  const providers = [
    { name: 'Auth' },
    { name: 'Analytics' },
    { name: 'Cache' },
  ];
  console.log(bootApp(providers).join('\n'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Why can't register() use a service? Because a LATER provider's binding
// may not exist yet. Model it: registration order decides what's bound
// when each provider registers.
// Prediction: ______________________
function task2() {
  const bound = new Map(); // what's been registered so far
  const order = [];

  function register(provider) {
    if (provider.dependsOn && !bound.has(provider.dependsOn)) {
      order.push(`${provider.name} THREW: Target [${provider.dependsOn}] is not instantiable`);
      return;
    }
    if (provider.provides) {
      bound.set(provider.provides, true);
    }
    order.push(`${provider.name} registered ${provider.provides || 'nothing'}`);
  }

  register({ name: 'Analytics', provides: 'analytics' });
  register({ name: 'Logger', provides: 'logger' });
  register({ name: 'Events', dependsOn: 'logger' }); // ← register() tries to USE logger
  console.log(order.join('\n'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The fix: bind a recipe in register(), use it in boot(). Complete
// makeProvider so the log shows: Logger register, Analytics register,
// Logger boot, Analytics boot — registration always finishes first.
// Prediction: ______________________
function makeProvider(name, events) {
  return {
    name,
    register() {
      // your code here  (record `${name} register` — BIND ONLY)
    },
    boot() {
      // your code here  (record `${name} boot` — safe, registration is done)
    },
  };
}

function bootApp2(providers, events) {
  for (const p of providers) p.register(); // phase 1: everyone registers
  for (const p of providers) p.boot();     // phase 2: everyone boots
  return events;
}

function task3() {
  const events = [];
  const providers = [
    makeProvider('Logger', events),
    makeProvider('Analytics', events),
  ];
  console.log(bootApp2(providers, events).join('\n'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// mergeConfigFrom: a package's defaults merge UNDER the app's config —
// recursively, so package keys the app doesn't set survive. Complete it
// so the output is key=APP_KEY, retries=3, timeout=5.
// Your prediction for the logs: ______________________
function mergeConfigFrom(packageDefaults, appConfig) {
  const merged = {};
  for (const [key, val] of Object.entries(packageDefaults)) {
    merged[key] = val; // start from package defaults
  }
  for (const [key, val] of Object.entries(appConfig)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // your code here  (recursively merge — don't replace the whole section)
    } else {
      merged[key] = val; // scalars: app's value wins
    }
  }
  return merged;
}

function task4() {
  const appConfig = { analytics: { key: 'APP_KEY', timeout: 5 } };
  const packageDefaults = { analytics: { key: 'PACKAGE_KEY', retries: 3 } };

  const merged = mergeConfigFrom(packageDefaults, appConfig);
  console.log('key =', merged.analytics.key);      // APP_KEY  (app wins)
  console.log('retries =', merged.analytics.retries); // 3 (package key kept)
  console.log('timeout =', merged.analytics.timeout); // 5 (app key kept)
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Deferred providers: a provider that only binds is NOT loaded at boot —
// it loads on first resolve of one of its services. Count the loads.
// Prediction: ______________________
function task5() {
  let loaded = 0;

  function loadProvider(name) {
    loaded += 1;
    return { name, bindings: [name.toLowerCase()] };
  }

  // Bootstrap: only non-deferred providers load. Deferred ones are skipped.
  loadProvider('Auth'); // not deferred — loads at boot
  const deferred = { name: 'Analytics', bindings: ['analytics'] }; // deferred — skipped

  console.log('loaded at boot =', loaded);

  // First resolve of app('analytics'): the deferred provider loads now.
  if (deferred.bindings.includes('analytics')) loadProvider('Analytics');
  console.log('loaded after first resolve =', loaded);
}
// task5();

module.exports = { bootApp, makeProvider, mergeConfigFrom };
