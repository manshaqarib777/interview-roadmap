'use strict';
// Lesson 111 — Routing. Run with:  node exercises/06-laravel/111-routing.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (A plain-JS model of the Laravel router: pattern → handler, parameter
//  extraction, optional parameters, and model binding by id.)

// ── Task 1 ──────────────────────────────────────────────────────────
// The router answers with the first row whose method AND path match —
// nothing else. Predict the five outputs.
// Prediction: ______________________
function firstMatch(routeTable, method, path) {
  for (const route of routeTable) {
    if (route.method === method && route.path === path) return route.handler;
  }
  return null;
}

const table = [
  { method: 'GET', path: '/', handler: 'welcome' },
  { method: 'GET', path: '/users', handler: 'UserController@index' },
  { method: 'POST', path: '/users', handler: 'UserController@store' },
  { method: 'GET', path: '/users/42', handler: 'UserController@show' },
];

function task1() {
  console.log(firstMatch(table, 'GET', '/'));
  console.log(firstMatch(table, 'POST', '/users'));
  console.log(firstMatch(table, 'GET', '/users'));
  console.log(firstMatch(table, 'GET', '/users/42'));
  console.log(firstMatch(table, 'GET', '/missing'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// A {name} is a slot. Extract the segment values from a path.
// Prediction: ______________________
function extractParams(pattern, path) {
  const p = pattern.split('/');
  const a = path.split('/');
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith('{')) {
      params[p[i].slice(1, -1)] = a[i];
    }
  }
  return params;
}

function task2() {
  console.log(extractParams('/users/{user}', '/users/42'));
  console.log(extractParams('/posts/{post}/comments/{comment}', '/posts/7/comments/9'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// An optional parameter ({term?}) matches with OR without the segment,
// and must be the last segment. Complete matchesPattern.
function matchesPattern(pattern, path) {
  // your code here
  // Split both on '/'. A '{x}' segment matches any one value. A '{x?}'
  // segment matches one value OR nothing — and must be the last segment.
  // Return true/false.
}

function task3() {
  console.log('/search/{term?} vs /search →', matchesPattern('/search/{term?}', '/search'));
  console.log('/search/{term?} vs /search/laravel →', matchesPattern('/search/{term?}', '/search/laravel'));
  console.log('/search/{term?} vs /search/a/b →', matchesPattern('/search/{term?}', '/search/a/b'));
  console.log('/users/{user} vs /users →', matchesPattern('/users/{user}', '/users'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implicit model binding: {user} + a User type-hint → User::findOrFail(id).
// Model it: the binding looks up by primary key and 404s when missing.
// Prediction: ______________________
const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Grace' },
];

function bindModel(segmentValue, typeHint) {
  if (typeHint !== 'User') return segmentValue; // no binding → raw string
  const found = users.find((u) => u.id === Number(segmentValue));
  return found ?? null; // null = ModelNotFoundException → 404
}

function task4() {
  console.log(bindModel('1', 'User'));
  console.log(bindModel('2', 'User'));
  console.log(bindModel('999', 'User'));
  console.log(bindModel('42', 'Post')); // no type-hint match → no binding
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The full router: first match wins, {x} extracts, {user} binds to a
// model. Implement `resolve` so the five lookups return handler + params.
function resolve(routeTable, method, path) {
  // your code here
  // Iterate in order; return { handler, params } for the first match, or null.
  // '{user}' segments bind through the users array above (by id; null when
  // missing). '{term?}' matches with or without the segment.
}

const fullTable = [
  { method: 'GET', path: '/', handler: 'welcome' },
  { method: 'GET', path: '/users/{user}', handler: 'UserController@show' },
  { method: 'GET', path: '/search/{term?}', handler: 'SearchController' },
];

function task5() {
  console.log(resolve(fullTable, 'GET', '/'));
  console.log(resolve(fullTable, 'GET', '/users/2'));
  console.log(resolve(fullTable, 'GET', '/users/999'));
  console.log(resolve(fullTable, 'GET', '/search/laravel'));
  console.log(resolve(fullTable, 'GET', '/search'));
}
// task5();

module.exports = { firstMatch, extractParams, matchesPattern, bindModel, resolve };
