'use strict';
// Lesson 125 — Events, Listeners & Observers. Run with:  node exercises/06-laravel/125-events-observers.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// Models Laravel's event bus in plain JS: dispatch → listeners in order,
// a queued listener that runs LATER, and an observer that reacts to a
// "model" state change — the Lesson 125 mental model, runnable here.

// ── Task 1 ──────────────────────────────────────────────────────────
// Fill the gap so dispatch() runs every listener in registration order
// and returns the listeners' outputs as an array.
function createEventBus() {
  const listeners = [];
  return {
    listen(fn) {
      listeners.push(fn);
    },
    dispatch(payload) {
      // your code here
    },
  };
}

function task1() {
  const bus = createEventBus();
  bus.listen((order) => 'email:' + order.id);
  bus.listen((order) => 'analytics:' + order.id);
  console.log(bus.dispatch({ id: 42 }));
}
// task1();
// Expected: [ 'email:42', 'analytics:42' ] — sync listeners run in order.

// ── Task 2 ──────────────────────────────────────────────────────────
// A queued listener must run AFTER the sync listeners, in a later turn of
// the event loop (Laravel: ShouldQueue → the Lesson 124 worker).
function task2() {
  const log = [];
  const bus = createEventBus();

  bus.listen((order) => log.push('sync:email:' + order.id));       // sync
  bus.listen((order) => {
    setTimeout(() => log.push('queued:slack:' + order.id), 0);      // queued
  });
  bus.listen((order) => log.push('sync:audit:' + order.id));       // sync

  bus.dispatch({ id: 7 });
  console.log('after dispatch:', log);
  setTimeout(() => console.log('after tick:', log), 10);
}
// task2();
// Expected: after dispatch: [ 'sync:email:7', 'sync:audit:7' ],
//           after tick:    [ 'sync:email:7', 'sync:audit:7', 'queued:slack:7' ]
// The queued listener is a macrotask (Lesson 22) — it runs after the sync ones.

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Same ordering idea, microtasks version (Lesson 23) — where does the
// "queued" listener land this time?
function task3() {
  const log = [];
  const bus = createEventBus();

  bus.listen(() => log.push('sync:email'));
  bus.listen(() => Promise.resolve().then(() => log.push('queued:analytics')));
  bus.listen(() => log.push('sync:audit'));

  bus.dispatch({});
  console.log('immediate:', log);
  setTimeout(() => console.log('later:', log), 0);
}
// task3();
// Expected: immediate: [ 'sync:email', 'sync:audit' ],
//           later: [ 'sync:email', 'sync:audit', 'queued:analytics' ]
// A Promise microtask still runs before any task, but after the sync listeners.

// ── Task 4 ──────────────────────────────────────────────────────────
// An observer: a function that reacts to a "model" lifecycle event. Fill
// the gap so `saved` runs on BOTH create and update (the subtle trap from
// Lesson 125) while `created` runs only on create.
function createModel() {
  let isNew = true;
  const hooks = { created: [], saved: [] };
  return {
    onCreate(fn) { hooks.created.push(fn); },
    onSaved(fn) { hooks.saved.push(fn); },
    save() {
      // your code here
    },
  };
}

function task4() {
  const log = [];
  const model = createModel();
  model.onCreate(() => log.push('created'));
  model.onSaved(() => log.push('saved'));

  model.save(); // insert
  model.isNew = false; // (simulating the DB row existing after the insert)
  model.save(); // update
  console.log(log);
}
// task4();
// Expected: [ 'created', 'saved', 'saved' ] — `saved` fires twice, `created` once.
// (This is why observers guard with isDirty / wasRecentlyCreated.)

// ── Task 5 ──────────────────────────────────────────────────────────
// Build a tiny observer registry: register hooks, fire the right ones for
// an event, and support the before/after pairs from Lesson 125.
function createObserverRegistry() {
  const hooks = {}; // event name -> [fn, ...]
  return {
    on(event, fn) {
      // your code here
    },
    fire(event, model) {
      // your code here
    },
  };
}

function task5() {
  const log = [];
  const obs = createObserverRegistry();
  obs.on('creating', (m) => log.push('creating:' + m.email));
  obs.on('created', (m) => log.push('created:' + m.email));
  obs.on('updated', (m) => log.push('updated:' + m.email));

  obs.fire('creating', { email: 'a@b.c' });
  obs.fire('created', { email: 'a@b.c' });
  obs.fire('updated', { email: 'a@b.c' });
  console.log(log);
}
// task5();
// Expected:
// [ 'creating:a@b.c', 'created:a@b.c', 'updated:a@b.c' ]
// Each lifecycle event reaches only the hooks registered for it.

module.exports = { createEventBus, createModel, createObserverRegistry };
