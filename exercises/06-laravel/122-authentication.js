'use strict';
// Lesson 122 — Authentication. Run with:  node exercises/06-laravel/122-authentication.js
// Predict every output BEFORE running. Write your prediction in the comment.

const crypto = require('crypto');

// ── Task 1 ──────────────────────────────────────────────────────────
// Simulate Hash::make / Hash::check. hashPassword stores the salt WITH
// the hash — verifyPassword recomputes, never "decrypts".
function hashPassword(password, salt) {
  const digest = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `sha256$${salt}$${digest}`;
}

function verifyPassword(password, stored) {
  // your code here — split off the salt, recompute, compare
}

// Prediction: ______________________
function task1() {
  const stored = hashPassword('correct-horse', 's0lt');
  console.log('stored :', stored);
  console.log('correct:', verifyPassword('correct-horse', stored));
  console.log('wrong  :', verifyPassword('hunter2', stored));
  console.log('plain  :', stored.includes('correct-horse'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The guard switcher — "who are you?" resolved by session cookie OR
// by bearer token. Both guards answer with { method, userId }.
function sessionGuard(sessionStore) {
  return {
    method: 'session',
    resolve(cookieId) {
      // your code here — sessionStore maps cookieId -> userId (null if unknown)
    },
  };
}

function tokenGuard(tokenStore) {
  return {
    method: 'token',
    resolve(bearerToken) {
      // your code here — tokenStore maps token -> userId (null if unknown)
    },
  };
}

function task2() {
  const sessions = { 's_abc123': 42, 's_zzz': 9 };
  const tokens = { 'tok_9f2a': 7 };
  const sessionLogin = sessionGuard(sessions).resolve('s_abc123');
  const tokenLogin = tokenGuard(tokens).resolve('tok_9f2a');
  const unknown = sessionGuard(sessions).resolve('s_does-not-exist');
  console.log({ sessionLogin, tokenLogin, unknown });
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The login flow: validate → provider lookup → hash check → session
// write → REGENERATE session id → redirect. Implement it so that
// `regenerate: true` issues a fresh session id (stopping fixation).
function login(email, password, users, sessions, { regenerate }) {
  // 1. find the user by email  (the "provider" lookup)
  const user = users.find((u) => u.email === email);
  // 2. hash check — wrong password or unknown user → 422, generic message
  // 3. build a session id: regenerate ? fresh : reuse the passed-in one
  // 4. write the user id into sessions
  // 5. return { status, cookie, userId }
  // your code here
}

function task3() {
  const users = [
    { id: 1, email: 'ada@example.com', hash: hashPassword('correct-horse', 's1') },
  ];
  const sessions = { 'old-session-id': null };

  const fixed = login('ada@example.com', 'correct-horse', users, sessions, { regenerate: false });
  const safe = login('ada@example.com', 'correct-horse', users, sessions, { regenerate: true });
  const bad = login('ada@example.com', 'wrong', users, sessions, { regenerate: true });

  console.log('no-regenerate:', fixed);   // cookie stays 'old-session-id' → fixation risk
  console.log('regenerate   :', safe);    // cookie becomes a fresh id
  console.log('bad password :', bad);      // 422, generic message, no cookie
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Remember me: a random token is stored on the user row and returned in
// a cookie. The password is never part of it.
function rememberMe(user, store) {
  const token = crypto.randomBytes(16).toString('hex');
  // your code here — store the token on the user, return the cookie value
}

function task4() {
  const user = { id: 1, name: 'Ada', remember_token: null };
  const cookie = rememberMe(user, {});
  console.log('cookie     :', cookie.startsWith('remember|'));
  console.log('token saved:', user.remember_token !== null);
  console.log('same twice :', rememberMe(user, {}) === rememberMe(user, {}));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  const guards = {
    web: { driver: 'session', provider: 'users' },
    api: { driver: 'token', provider: 'users' },
  };
  const providers = { users: { model: 'User' }, admins: { model: 'Admin' } };

  const resolve = (guardName) => {
    const g = guards[guardName];
    return { guard: guardName, provider: providers[g.provider].model };
  };

  console.log(resolve('web'));
  console.log(resolve('api'));
  console.log('same object?', resolve('web') === resolve('api'));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Fortify, Breeze and Jetstream — a tiny "scaffolding selector".
function scaffold(choice) {
  const matrix = {
    fortify: { ui: 'none', twoFactor: true, teams: false },
    breeze: { ui: 'minimal', twoFactor: false, teams: false },
    jetstream: { ui: 'tailwind', twoFactor: true, teams: true },
  };
  return matrix[choice];
}

function task6() {
  const headless = scaffold('fortify');
  const full = scaffold('jetstream');
  const minimal = scaffold('breeze');
  console.log('headless backend:', headless);
  console.log('full starter    :', full);
  console.log('minimal         :', minimal);
  console.log('order           :', full.ui.length > minimal.ui.length && minimal.ui.length > headless.ui.length);
}
// task6();

module.exports = { verifyPassword, sessionGuard, tokenGuard, login, rememberMe };
