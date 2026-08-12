'use strict';
// Lesson 31 — Objects, Interfaces & Type Aliases. Run with:  node exercises/02-typescript/31-objects-interfaces-aliases.js
// Predict every output BEFORE running. Write your prediction in the comment.
// Types live in comments so this runs on plain Node.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// In TS these two shapes are interchangeable. Write each as a comment:
// interface User { ... }   and   type Account = { ... }
const user = { id: 1, name: 'Mansha' };
console.log(user.name);

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Structural typing — `admin` was never declared as a User, but it has the
// shape. Does an extra property matter here? (comment your answer)
const admin = { id: 7, name: 'Ali', role: 'admin' };
console.log(`Hello, ${admin.name} (${admin.role})`);

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// In TS the same object passed as a LITERAL would be excess-property
// checked. Comment the line that would fail to compile:
// greetUser({ id: 7, name: 'Ali', role: 'admin' });
function greetUser(u) {
  return `Hello, ${u.name}`;
}

console.log(greetUser(admin));

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Optional properties (email?: string) — missing is fine, wrong type is not.
const a = { id: 1, name: 'Mansha' };
const b = { id: 2, name: 'Ali', email: 'ali@example.com' };
console.log(a.email, b.email);

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Declaration merging: two `interface User` declarations become one shape.
// Comment what a merged User would look like:
const merged = { id: 1, name: 'Mansha', email: 'm@example.com' };
console.log(merged.id, merged.name, merged.email);

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// An interface is OPEN (extendable), a type alias is CLOSED. Comment the
// type-alias equivalent of:  interface Admin extends User
const adminUser = { id: 1, name: 'Mansha', permissions: ['read'] };
console.log(adminUser.permissions.join(','));

module.exports = { greetUser };
