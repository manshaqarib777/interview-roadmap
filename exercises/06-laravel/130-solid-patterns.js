'use strict';
// Lesson 130 — Service Layer, Repositories & SOLID. Run with:  node exercises/06-laravel/130-solid-patterns.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// This models the fat-controller refactor in plain JS: an OrderService holds the
// business rule, an OrderRepository interface has two implementations (Eloquent-like
// over a fake "database", and an in-memory fake used by tests), and dependency
// inversion lets a test swap the implementation behind the same service.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Fat "controller": validation, the credit rule, persistence, and the response
// all live in one place. Trace what happens for user C (credit 20, order 10).
function task1() {
  const db = [];
  const users = [
    { id: 'A', credit: 100 },
    { id: 'B', credit: 5 },
    { id: 'C', credit: 20 },
  ];

  function store(userId, total) {
    const user = users.find((u) => u.id === userId);
    if (!user) return { status: 404, body: { error: 'Not found' } };
    if (user.credit < total) return { status: 422, body: { error: 'Insufficient credit' } };
    const order = { id: db.length + 1, user_id: userId, total, status: 'paid' };
    db.push(order);
    return { status: 201, body: order };
  }

  console.log(store('A', 50).status, store('A', 50).body.id);
  console.log(store('B', 10).status);
  console.log(store('C', 10).status, store('C', 10).body.total);
  console.log('db rows:', db.length);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The same rule now used from three entry points (API, admin, retry job).
// What breaks if one caller forgets the credit check? Prediction: ______
function task2() {
  const db = [];
  let seq = 0;

  // "Business rule" buried in the controller:
  function apiCreateOrder(user, total) {
    if (user.credit < total) throw new Error('Insufficient credit');
    const order = { id: ++seq, user_id: user.id, total };
    db.push(order);
    return order;
  }
  function adminCreateOrder(user, total) {
    // Admin path copied the check but with a different message:
    if (user.credit < total) throw new Error('Admin: not enough credit');
    const order = { id: ++seq, user_id: user.id, total };
    db.push(order);
    return order;
  }
  function retryJob(user, total) {
    // Retry path — check forgotten:
    const order = { id: ++seq, user_id: user.id, total };
    db.push(order);
    return order;
  }

  const alice = { id: 'A', credit: 10 };
  apiCreateOrder(alice, 10);
  adminCreateOrder(alice, 10);
  try { retryJob(alice, 9999); } catch (err) { console.log('retry threw:', err.message); }
  console.log('orders in db:', db.length, '| last total:', db[db.length - 1].total);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The service layer: one home for the rule, called from all entry points.
function task3() {
  const db = [];
  let seq = 0;

  class InsufficientCreditError extends Error {}

  function createOrderService() {
    function createOrder(user, total) {
      if (user.credit < total) throw new InsufficientCreditError('Insufficient credit');
      const order = { id: ++seq, user_id: user.id, total, status: 'paid' };
      db.push(order);
      return order;
    }
    return { createOrder };
  }

  const service = createOrderService();
  const alice = { id: 'A', credit: 10 };

  service.createOrder(alice, 10);
  try {
    service.createOrder(alice, 9999);
  } catch (err) {
    console.log(err.name + ':', err.message);
  }
  console.log('orders:', db.length);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The repository seam: one interface, two implementations. A test swaps in
// the in-memory fake WITHOUT touching the service — dependency inversion.
function task4() {
  // "Eloquent" implementation over an array pretending to be a database:
  function createEloquentOrderRepo() {
    const rows = [];
    let seq = 0;
    return {
      create(data) {
        const row = { id: ++seq, ...data };
        rows.push(row);
        return row;
      },
      paidForUser(user) {
        return rows.filter((r) => r.user_id === user.id && r.status === 'paid');
      },
      rowCount() {
        return rows.length;
      },
    };
  }

  // Test fake — same interface, no "database" anywhere:
  function createInMemoryOrderRepo() {
    const orders = [];
    let seq = 0;
    return {
      create(data) {
        const order = { id: ++seq, ...data };
        orders.push(order);
        return order;
      },
      paidForUser(user) {
        return orders.filter((o) => o.user_id === user.id && o.status === 'paid');
      },
      count() {
        return orders.length;
      },
    };
  }

  function createOrderService(repo) {
    return {
      createOrder(user, total) {
        if (user.credit < total) throw new Error('Insufficient credit');
        return repo.create({ user_id: user.id, total, status: 'paid' });
      },
    };
  }

  const alice = { id: 'A', credit: 10 };
  const service = createOrderService(createInMemoryOrderRepo());
  service.createOrder(alice, 10);
  service.createOrder(alice, 5);

  console.log('service order ids:', service.createOrder(alice, 7).id);
  console.log('total in fake repo:', createInMemoryOrderRepo().count());
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Container-style "binding": a small registry resolves the interface to an
// implementation — the same idea as AppServiceProvider::bind(). Trace each.
function task5() {
  const container = {
    bindings: {},
    bind(abstract, concrete) {
      this.bindings[abstract] = concrete;
    },
    make(abstract) {
      return this.bindings[abstract];
    },
  };

  const repoA = { kind: 'eloquent' };
  const repoB = { kind: 'in-memory' };

  container.bind('OrderRepository', repoA);
  const resolved1 = container.make('OrderRepository');

  container.bind('OrderRepository', repoB); // prod binding replaced in tests
  const resolved2 = container.make('OrderRepository');

  console.log('resolved1:', resolved1.kind);
  console.log('resolved2:', resolved2.kind);
  console.log('same object as repoA:', resolved1 === repoA);
}
// task5();

module.exports = { task1, task2, task3, task4, task5 };
