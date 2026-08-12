'use strict';
// Lesson 133 — Laravel API + Next.js & Payments. Run with:  node exercises/06-laravel/133-api-nextjs-stripe.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (We model Stripe's HMAC webhook signature and the idempotency guard in
// plain Node — no Stripe SDK needed.)

const crypto = require('crypto');

// Real Stripe:  HMAC-SHA256 of the raw payload, signed with the webhook secret.
// Stripe-Signature header format:  t=<timestamp>,v1=<hex digest>
function sign(payload, secret) {
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const now = Math.floor(Date.now() / 1000);
  return `t=${now},v1=${digest}`;
}

// The function you implement: verify the signature and accept the event.
// Signature format in the header:  t=<timestamp>,v1=<hex digest>
// HINT: an event is valid when the HMAC of the payload with the secret
// matches the v1 value, AND the timestamp is within 5 minutes of now.
function verifySignature(payload, header, secret) {
  // your code here
  return false;
}

// ── Task 1 ──────────────────────────────────────────────────────────
// A valid webhook from Stripe: signature matches, timestamp is fresh.
// Prediction: ______________________
function task1() {
  const secret = 'whsec_test_abc';
  const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
  const header = sign(body, secret);
  console.log('valid signed event:', verifySignature(body, header, secret));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// A FORGED webhook: same event id, but signed with the WRONG secret.
// What should verifySignature return — and what does the handler return?
// Prediction: ______________________
function task2() {
  const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
  const header = sign(body, 'whsec_wrong_key');
  const ok = verifySignature(body, header, 'whsec_test_abc');
  console.log('forged event accepted:', ok);
  console.log('handler response:', ok ? 200 : 400);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// A REPLAYED webhook: correct signature, but the timestamp is 10 minutes
// old. VerifySignature must also check the timestamp window.
// Prediction: ______________________
function task3() {
  const secret = 'whsec_test_abc';
  const body = JSON.stringify({ id: 'evt_3', type: 'invoice.payment_failed' });
  const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const oldHeader = `t=${Math.floor(Date.now() / 1000) - 600},v1=${digest}`; // 10 min old
  console.log('replayed event accepted:', verifySignature(body, oldHeader, secret));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Idempotency: the same event delivered twice must have its side effects
// run EXACTLY once. Implement handleEvent: a Set holds the event ids that
// were already processed; returning true means "ran the side effect".
// The second delivery must return false (already handled).
// Prediction: ______________________
const processed = new Set();

function handleEvent(eventId) {
  // your code here — add to the set ONLY when it wasn't already there
  return false;
}

function task4() {
  console.log('first delivery:', handleEvent('evt_9'));
  console.log('duplicate delivery:', handleEvent('evt_9'));
  console.log('new event:', handleEvent('evt_10'));
}
// Expected:
//   first delivery: true
//   duplicate delivery: false
//   new event: true
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The full handler. Given (body, header, secret): return the response the
// API should send — 'ok', 'duplicate', or 'invalid'. Use verifySignature
// for the check and the `processed` set for idempotency.
// Prediction: ______________________
function handleWebhook(body, header, secret) {
  // your code here
  return 'invalid';
}

function task5() {
  const secret = 'whsec_test_abc';
  const body = JSON.stringify({ id: 'evt_20', type: 'checkout.session.completed' });
  console.log('first:', handleWebhook(body, sign(body, secret), secret));
  console.log('again:', handleWebhook(body, sign(body, secret), secret));
  console.log('forged:', handleWebhook(body, sign(body, 'whsec_wrong'), secret));
}
// Expected:
//   first: ok
//   again: duplicate
//   forged: invalid
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// API Resources standardize the shape. Map a "user model" (object with
// internal fields) to the public resource shape: { id, name, email }.
// Prediction: ______________________
function toResource(user) {
  // your code here — keep only id, name, email
  return user;
}

function task6() {
  const user = { id: 7, name: 'Ada Lovelace', email: 'ada@example.dev', password_hash: 'x', role: 'admin' };
  console.log(JSON.stringify(toResource(user)));
}
// Expected: {"id":7,"name":"Ada Lovelace","email":"ada@example.dev"}
// task6();

module.exports = { verifySignature, handleEvent, handleWebhook, toResource };
