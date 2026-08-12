'use strict';
// Lesson 128 — Rate Limiting & Security. Run with:  node exercises/06-laravel/128-security.js
// Plain Node: a fixed-window rate limiter (100/min per user → 429 past it)
// and a SQL parameter binder (interpolated string vs bound ? params).
// Predict BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Fixed-window rate limiter: per key, allow `limit` calls per `windowMs`.
// Track each key's { windowStart, count }. On each attempt:
//   - if now - windowStart >= windowMs → NEW window: reset count to 1, allow
//   - else if count >= limit          → REJECT (429)
//   - else                            → count++, allow
function makeRateLimiter(limit, windowMs) {
  const state = new Map(); // key → { windowStart, count }
  return function attempt(key, now) {
    // your code here — return true (allowed) or false (429)
  };
}

function task1() {
  const allow = makeRateLimiter(3, 60000); // 3 per minute
  const t0 = 0;
  console.log(allow('ada', t0), allow('ada', t0 + 1000), allow('ada', t0 + 2000)); // true true true
  console.log(allow('ada', t0 + 3000)); // 4th in the same window → false (429)
  console.log(allow('grace', t0 + 3000)); // different key → true
  console.log(allow('ada', t0 + 61000)); // new window → true
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The 100/min rule from the lesson: build a limiter with limit=100,
// windowMs=60000, and count how many requests get through vs 429'd
// when one user fires 250 within a single minute.
function task2() {
  const allow = makeRateLimiter(100, 60000);
  let allowed = 0;
  let rejected = 0;
  for (let i = 0; i < 250; i++) {
    if (allow('user-1', i * 100)) allowed += 1; // 0…24900ms — all in one 60s window
    else rejected += 1;
  }
  console.log('allowed:', allowed, 'rejected:', rejected); // first 100 OK, 150 × 429
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Token bucket: the smoothing answer. Bucket holds up to `capacity`
// tokens; it refills at `refillPerSec` (capped at capacity), and each
// allowed request spends 1 token. Returns true if a token was available,
// else false. Tokens only refill while the bucket ISN'T full — a full
// bucket that sits idle stays full (spending is the drain).
function makeTokenBucket(capacity, refillPerSec) {
  let tokens = capacity;
  let lastRefill = 0;
  return function attempt(now) {
    // your code here — refill first, then spend
    // hint: elapsed = now - lastRefill; add elapsed * refillPerSec,
    // cap at capacity, set lastRefill = now — but if the bucket is
    // already full, DON'T advance lastRefill (idle time accrues nothing).
  };
}

function task3() {
  const allow = makeTokenBucket(10, 2); // cap 10, refills 2/sec
  for (let i = 0; i < 10; i++) console.log('burst:', allow(0)); // 10×true (burst drains the bucket)
  console.log('over-burst:', allow(0));  // no refill time → false (429)
  console.log('after 1s:', allow(1));    // 1s × 2 = 2 tokens → true (1 left)
  console.log('after 1s:', allow(1));    // 1 left → true (0 left)
  console.log('after 1s:', allow(1));    // 0 tokens → false (429)
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// SQL parameter binder. Write a SELECT builder that takes a WHERE clause
// with `?` placeholders plus an array of values, and returns the SQL +
// the separate binding list. NEVER inline the values into the SQL.
function bindQuery(clause, values) {
  // your code here — return { sql: 'SELECT * FROM users WHERE email = ?', bindings: [...] }
}

function task4() {
  const safe = bindQuery('WHERE email = ?', ["' OR '1'='1"]);
  console.log('sql:', safe && safe.sql);
  console.log('bindings:', safe && safe.bindings);
  // The attack string sits in bindings, NOT in the SQL:
  console.log('attack in sql?', safe ? safe.sql.includes("' OR '1'='1") : 'not implemented');
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Mass assignment guard: a mini Eloquent create() that only writes keys
// listed in $fillable. The attacker POSTs is_admin=1 — it must be DROPPED.
function createWithFillable(fillable, data) {
  // your code here — return a NEW object with only the fillable keys
}

function task5() {
  const fillable = ['name', 'email', 'password'];
  const request = { name: 'ada', email: 'ada@x.com', password: 'pw', is_admin: 1 };
  const user = createWithFillable(fillable, request);
  console.log('created user:', user);
  console.log('is_admin present?', 'is_admin' in user); // must be false
}
// task5();

module.exports = { makeRateLimiter, makeTokenBucket, bindQuery, createWithFillable };
