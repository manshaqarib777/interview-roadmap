'use strict';
// Lesson 121 — Validation & Form Requests. Run with:  node exercises/06-laravel/121-validation.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// `validate` returns { pass: [validated data], fail: [field => msgs] }.
// Predict the exact output of task1().
function validate(data, rules) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const msg = rule.check(field, data[field], data);
      if (msg) {
        (errors[field] = errors[field] || []).push(msg);
      }
    }
  }
  return Object.keys(errors).length ? { pass: null, fail: errors } : { pass: data, fail: null };
}

const required = { check: (f, v) => (v === undefined || v === '') ? `The ${f} field is required.` : null };
const email = { check: (f, v) => (v !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) ? `The ${f} must be a valid email.` : null };
const minLen = (n) => ({ check: (f, v) => (v !== undefined && String(v).length < n) ? `The ${f} must be at least ${n} characters.` : null });
const uniqueUsers = { check: (f, v) => (v === 'taken@example.com') ? `The ${f} has already been taken.` : null };

function task1() {
  const result = validate(
    { name: '', email: 'bad', password: 'abc' },
    { name: [required], email: [required, email, uniqueUsers], password: [required, minLen(8)] }
  );
  console.log(JSON.stringify(result.fail, null, 2));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task2() {
  const result = validate(
    { name: 'Ada', email: 'ada@example.com', password: 'longenough' },
    { name: [required], email: [required, email, uniqueUsers], password: [required, minLen(8)] }
  );
  console.log(result.pass);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement `sometimes` — a wrapper that only runs its rules when the
// field is present in the payload.
function sometimes(rules) {
  // your code here
}

function task3() {
  const result = validate(
    { name: 'Ada', bio: '' },
    { name: [required], bio: [sometimes([minLen(5)])] }
  );
  console.log(result); // bio is empty AND present → still checked
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement `confirmed` — fails unless a matching "<field>_confirmation"
// value exists in the payload and equals the field.
function confirmed() {
  // your code here
}

function task4() {
  const ok = validate(
    { password: 'secret123', password_confirmation: 'secret123' },
    { password: [required, confirmed()] }
  );
  const bad = validate(
    { password: 'secret123', password_confirmation: 'nope' },
    { password: [required, confirmed()] }
  );
  console.log('ok  ->', ok.pass && ok.pass.password);
  console.log('bad ->', JSON.stringify(bad.fail));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// A custom rule as a closure: reject `coupon` unless it is exactly 8
// chars, with the message "The coupon is not a valid coupon code."
function couponRule() {
  // your code here
}

function task5() {
  const result = validate(
    { name: 'Ada', coupon: 'SHORT' },
    { name: [required], coupon: [couponRule()] }
  );
  console.log(JSON.stringify(result.fail, null, 2));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Nested validation: items.*.qty must be an integer >= 1.
// Extend the engine so dot-notation fields read the nested value.
function validateNested(data, rules) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const msg = rule.check(field, data[field], data);
      if (msg) {
        (errors[field] = errors[field] || []).push(msg);
      }
    }
  }
  return Object.keys(errors).length ? { pass: null, fail: errors } : { pass: data, fail: null };
}

// your code here — a getPath(obj, 'items.0.qty') helper,
// then rewrite validateNested to use it instead of data[field].

// ── Task 7 ──────────────────────────────────────────────────────────
// `authorize()` — the Form Request gate. Model it: authorize(data) is
// called BEFORE rules; when it returns false the request is rejected
// with 403 and rules never run.
function gateRequest(data, rules, authorize) {
  // your code here — return { status: 403 } when authorize() is false,
  // otherwise run validate() and return { status: 422, errors } or { status: 200, data }
}

function task7() {
  const rules = { email: [required, email] };
  const who = { role: 'guest' };
  const adminGate = () => who.role === 'admin';

  const notAuthorized = gateRequest({ email: 'a@b.co' }, rules, adminGate);
  who.role = 'admin'; // the user is now authenticated
  const authorized = gateRequest({ email: 'a@b.co' }, rules, adminGate);
  const badEmail = gateRequest({ email: 'nope' }, rules, adminGate);
  console.log(JSON.stringify({ notAuthorized, authorized, badEmail }));
}
// task7();

module.exports = { validate, sometimes, confirmed, couponRule, validateNested, gateRequest };
