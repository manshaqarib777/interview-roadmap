'use strict';
// Lesson 105 — What is Laravel?. Run with:  node exercises/06-laravel/105-what-is-laravel.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A mini MVC dispatcher: the router maps a method+path to a controller,
// the controller reads a "model", and renders a "view". Predict the
// three responses in order (method, path, rendered body).
const MODEL = { products: { 1: 'Woolly Beanie', 2: 'Canvas Tote' } };

function render(view, data) {
  return `<h1>${data.name}</h1>`;
}

function controller(method, path) {
  const match = path.match(/^\/products\/(\d+)$/);
  if (method !== 'GET' || !match) return { status: 404, body: 'Not Found' };
  const product = MODEL.products[match[1]];
  if (!product) return { status: 404, body: 'Not Found' };
  return { status: 200, body: render('products.show', { name: product }) };
}

function dispatch(method, path) {
  return controller(method, path); // the router's only job: pick the controller
}

function task1() {
  console.log(dispatch('GET', '/products/1'));
  console.log(dispatch('GET', '/products/9'));
  console.log(dispatch('POST', '/products/1'));
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The container, in one paragraph's worth of code: resolve() builds a
// service ON DEMAND and injects it. Predict the two lines of output.
class Container {
  constructor() {
    this.bindings = {};
  }
  bind(key, factory) {
    this.bindings[key] = factory; // factory is lazy — nothing runs yet
  }
  resolve(key) {
    return this.bindings[key](this); // the container passes ITSELF in
  }
}

class Mailer {
  send(to) {
    return `mail sent to ${to}`;
  }
}

function task2() {
  const app = new Container();
  app.bind('mailer', () => new Mailer()); // factory: built only when resolved
  console.log(app.resolve('mailer') instanceof Mailer);
  console.log(app.resolve('mailer').send('ada@example.com'));
}
// Prediction: ______________________
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The container injects the dependency automatically: the controller
// declares what it needs, and the container builds it (recursively).
// Fix resolve so UserController receives a working Mailer.
class UserController {
  constructor(mailer) {
    this.mailer = mailer;
  }
  welcome(email) {
    return this.mailer.send(`Welcome! ${email}`);
  }
}

function resolve(className, container) {
  return new className(container.resolve('mailer'));
}

function task3() {
  const container = new Container();
  container.bind('mailer', () => new Mailer());
  const controller = resolve(UserController, container);
  console.log(controller instanceof UserController);
  console.log(controller.welcome('grace@example.com'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// A lazy singleton: the factory must run EXACTLY once, and every
// resolve() returns the SAME instance. Predict the two lines of output.
class Counter {
  constructor() {
    this.n = 0;
  }
  tick() {
    return ++this.n;
  }
}

function task4() {
  const app = new Container();
  let builds = 0;
  app.bind('counter', () => { builds += 1; return new Counter(); });
  const a = app.resolve('counter');
  const b = app.resolve('counter');
  console.log(builds);
  console.log(a === b, a.tick(), b.tick());
}
// Prediction: ______________________
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Why does this "framework" beat plain functions? Predict the output,
// then add ONE missing piece so the Container becomes a lazy singleton
// (the factory must run exactly once for a given key).
class SmartContainer {
  constructor() {
    this.bindings = {};
    this.shared = {}; // ← the singleton cache lives here
  }
  bind(key, factory) {
    this.bindings[key] = factory;
  }
  resolve(key) {
    if (!(key in this.shared)) {
      this.shared[key] = this.bindings[key](this); // build once
    }
    return this.shared[key]; // every later resolve reuses the same object
  }
}

function task5() {
  const app = new SmartContainer();
  let builds = 0;
  app.bind('db', () => { builds += 1; return { connected: true }; });
  const one = app.resolve('db');
  const two = app.resolve('db');
  console.log(builds, one === two, one.connected);
}
// task5();

module.exports = { dispatch, resolve, Container, SmartContainer };
