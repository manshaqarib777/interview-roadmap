'use strict';
// Lesson 123 — Authorization. Run with:  node exercises/06-laravel/123-authorization.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A Gate = a closure: (user, resource) -> boolean.
const gate = {
  define(name, fn) {
    this.abilities[name] = fn;
    return this;
  },
  abilities: {},
  allows(name, user, resource) {
    const fn = this.abilities[name];
    return fn ? fn(user, resource) : false;
  },
};

function task1() {
  gate.define('update-post', (user, post) => user.id === post.user_id);
  gate.define('view-admin', (user) => user.isAdmin === true);

  const owner = { id: 42, isAdmin: false };
  const other = { id: 7, isAdmin: false };
  const admin = { id: 7, isAdmin: true };
  const post = { id: 1, user_id: 42 };

  console.log('owner can update:', gate.allows('update-post', owner, post));
  console.log('other can update:', gate.allows('update-post', other, post));
  console.log('admin panel     :', gate.allows('view-admin', admin) && !gate.allows('view-admin', owner));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  // Policies = classes grouped around a model. Calling `authorize`
  // resolves the policy for the model class, then runs the method.
  class PostPolicy {
    update(user, post) { return user.id === post.user_id; }
    delete(user, post) { return user.id === post.user_id; }
    viewAny(user) { return user.isAdmin === true; }
  }

  const policies = { Post: PostPolicy };
  const authorize = (modelClass, ability, user, resource) => {
    const policy = new policies[modelClass]();
    return policy[ability](user, resource);
  };

  const owner = { id: 1 };
  const admin = { id: 2, isAdmin: true };
  const post = { id: 9, user_id: 1 };

  console.log('owner update:', authorize('Post', 'update', owner, post));
  console.log('admin update:', authorize('Post', 'update', admin, post));
  console.log('admin viewAny:', authorize('Post', 'viewAny', admin, null));
  console.log('owner viewAny:', authorize('Post', 'viewAny', owner, null));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `before()` — the super-admin bypass. Returning true lets
// admins pass any check; returning null falls through to the method.
class Task3Policy {
  constructor(user) { this.user = user; }

  before(ability) {
    // your code here — admins (isAdmin) pass everything, others return null
  }

  update(post) { return this.user.id === post.user_id; }
  delete(post) { return this.user.id === post.user_id; }
}

function task3() {
  const check = (user, ability, post) => {
    const p = new Task3Policy(user);
    const before = p.before(ability);
    return before === null ? p[ability](post) : before;
  };

  const admin = { id: 1, isAdmin: true };
  const owner = { id: 2, isAdmin: false };
  const other = { id: 3, isAdmin: false };
  const post = { id: 5, user_id: 2 };

  console.log('admin deletes others post:', check(admin, 'delete', post));
  console.log('owner deletes own post   :', check(owner, 'delete', post));
  console.log('other deletes            :', check(other, 'delete', post));
  console.log('admin deletes (update)   :', check(admin, 'update', post));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement `authorize` with the 403 rule: it returns the boolean, and
// when the check is false it records a 403 for the "response".
function authorize(ability, user, resource, policy) {
  // your code here — run the policy method; return { allowed, status }
}

function task4() {
  const post = { id: 1, user_id: 10 };
  const canUpdate = (user, p) => user.id === p.user_id;
  const asOwner = authorize('update', { id: 10 }, post, canUpdate);
  const asStranger = authorize('update', { id: 99 }, post, canUpdate);
  console.log(JSON.stringify(asOwner));
  console.log(JSON.stringify(asStranger)); // must include status 403
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Role-based vs ability-based: roles bundle permissions, abilities are
// what you check. Implement hasPermission via the role->permissions map.
const ROLE_PERMISSIONS = {
  admin: ['publish', 'delete-any', 'manage-users'],
  editor: ['publish'],
  viewer: [],
};

function hasPermission(user, ability) {
  // your code here
}

function task5() {
  const admin = { name: 'Ada', role: 'admin' };
  const editor = { name: 'Bob', role: 'editor' };
  const viewer = { name: 'Cy', role: 'viewer' };

  console.log('admin can manage-users :', hasPermission(admin, 'manage-users'));
  console.log('editor can publish     :', hasPermission(editor, 'publish'));
  console.log('viewer can publish     :', hasPermission(viewer, 'publish'));
  console.log('editor can manage-users:', hasPermission(editor, 'manage-users'));
  console.log('unknown role           :', hasPermission({ role: 'root' }, 'publish'));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  // @can in Blade hides UI; authorize() is the server boundary.
  // In this model the UI hides the button, but the endpoint still runs
  // the policy. Which user gets through the endpoint?
  const post = { id: 1, user_id: 1 };
  const endpoint = (user) => {
    if (user.id !== post.user_id) return '403';
    return '200';
  };
  const render = (user) => (user.id === post.user_id ? 'Edit button shown' : 'No button');

  const attacker = { id: 2 };
  console.log('UI  :', render(attacker));
  console.log('API :', endpoint(attacker));
}
// task6();

// ── Task 7 ──────────────────────────────────────────────────────────
// Implement a middleware-style `can()` helper: it returns the gate's
// verdict, and applies it as a route guard (next() or a 403).
function makeCan(gateInstance) {
  return function can(ability, user, resource) {
    // your code here — reuse gateInstance.allows
  };
}

function task7() {
  gate.define('view-admin', (user) => user.isAdmin === true);
  const can = makeCan(gate);
  const admin = { id: 1, isAdmin: true };
  const guest = { id: 2, isAdmin: false };
  console.log('admin guard:', can('view-admin', admin, null));
  console.log('guest guard:', can('view-admin', guest, null));
}
// task7();

module.exports = { gate, Task3Policy, authorize, hasPermission, makeCan };
