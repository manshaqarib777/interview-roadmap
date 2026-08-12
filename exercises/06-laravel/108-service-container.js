'use strict';
// Lesson 108 — The Service Container & Dependency Injection. Run with:  node exercises/06-laravel/108-service-container.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; this models Laravel's container with plain JS.)

// ── Task 1 ──────────────────────────────────────────────────────────
// A tiny container: bind() stores a recipe, resolve() builds on demand.
// Nothing is built until something asks for it.
// Prediction: ______________________
function createContainer() {
  const bindings = new Map();

  return {
    bind(name, factory) {
      bindings.set(name, factory);
    },
    resolve(name) {
      const factory = bindings.get(name);
      if (!factory) throw new Error(`Target [${name}] is not instantiable.`);
      return factory(this); // the container passes ITSELF so factories can resolve deps
    },
  };
}

function task1() {
  let builds = 0;
  const app = createContainer();

  app.bind('logger', () => {
    builds += 1;
    return { log: (m) => `[log] ${m}` };
  });

  console.log('before any resolve, builds =', builds);
  const a = app.resolve('logger');
  const b = app.resolve('logger');
  console.log('after two resolves, builds =', builds);
  console.log('same instance:', a === b);
  console.log(a.log('order placed'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Constructor injection by name: the container builds the dependency
// and passes it into the factory. The class never calls `new`.
// Prediction: ______________________
function task2() {
  const app = createContainer();

  app.bind('logger', () => ({ log: (m) => `[log] ${m}` }));
  app.bind('orders', (c) => {
    const logger = c.resolve('logger'); // dependency pulled from the container
    return { place: (item) => logger.log(`placed ${item}`) };
  });

  const orders = app.resolve('orders');
  console.log(orders.place('shoes'));
  console.log(orders.place('hat'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Resolving an unbound name throws — the plain-JS version of
// "Target [X] is not instantiable".
// Prediction: ______________________
function task3() {
  const app = createContainer();
  try {
    app.resolve('PaymentGateway'); // never bound
  } catch (err) {
    console.log('threw as expected:', err.message);
  }
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// singleton: built once, then reused. Complete it so the second resolve
// returns the same instance and the builds counter stays at 1.
// Your prediction for the logs: ______________________
function createSingletonContainer() {
  const bindings = new Map();
  const shared = new Map(); // name → singleton instance

  return {
    singleton(name, factory) {
      bindings.set(name, { factory, singleton: true });
    },
    resolve(name) {
      const entry = bindings.get(name);
      if (!entry) throw new Error(`Target [${name}] is not instantiable.`);

      if (entry.singleton && shared.has(name)) {
        return shared.get(name);
      }

      const instance = entry.factory(this);
      // your code here  (cache singletons in `shared`)
      return instance;
    },
  };
}

function task4() {
  let builds = 0;
  const app = createSingletonContainer();

  app.singleton('cache', (c) => {
    builds += 1;
    return { get: (k) => `cached:${k}` };
  });

  const a = app.resolve('cache');
  const b = app.resolve('cache');
  console.log('same singleton instance:', a === b);
  console.log('builds =', builds);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Interface → implementation binding: callers ask for the "interface",
// the container hands back the implementation. Swap the implementation
// and no caller changes.
// Prediction: ______________________
function task5() {
  const app = createContainer();

  // The "interface" PaymentGateway resolves to a Stripe implementation.
  app.bind('PaymentGateway', () => ({ charge: (n) => `stripe charged ${n}` }));

  const controller = app.resolve('PaymentGateway');
  console.log(controller.charge(4999));

  // Swap the binding — the controller code above never changes.
  app.bind('PaymentGateway', () => ({ charge: (n) => `paypal charged ${n}` }));
  console.log(app.resolve('PaymentGateway').charge(4999));
}
// task5();

module.exports = { createContainer, createSingletonContainer };
