'use strict';
// Lesson 115 — Eloquent ORM. Run with:  node exercises/06-laravel/115-eloquent.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Mass assignment: `create(attrs)` must only keep the keys listed in
// `fillable` (the whitelist). Any key NOT in fillable is silently dropped
// — just like Eloquent discards an unguarded attribute from a request.
function makeFillableModel(rows, fillable) {
  return {
    create(attrs) {
      // your code here
    },
    all() {
      return rows;
    },
  };
}

// ── Task 2 ──────────────────────────────────────────────────────────
// Same store, but protection is the INVERSE: `guarded` is a blacklist.
// Everything is allowed EXCEPT the guarded keys. `id` must never be
// mass-assignable.
function makeGuardedModel(rows, guarded) {
  return {
    create(attrs) {
      // your code here
    },
  };
}

// ── Task 3 ──────────────────────────────────────────────────────────
// Casts: values are STORED raw (like the database column) and RETURNED
// converted (like the PHP value). A 'boolean' cast stores 1/0 and
// returns true/false; an 'array' cast stores JSON and returns a parsed
// array. Implement set/get so round-tripping works both ways.
function makeCastStore(casts) {
  const raw = {};
  return {
    set(key, value) {
      // your code here
    },
    get(key) {
      // your code here
    },
  };
}

// ── Task 4 ──────────────────────────────────────────────────────────
// An accessor: `fullName` is COMPUTED from first_name + last_name. It is
// not a stored column — attach it as a getter and don't mutate the row.
function withFullName(row) {
  // your code here
  return row;
}

// ── Task 5 ──────────────────────────────────────────────────────────
// Lazy query builder: `where(field, value)` CHAINS and runs nothing.
// `get()` is the resolver — only then are rows filtered (the SQL moment).
function makeBuilder(rows) {
  const conditions = [];
  const builder = {
    where(field, value) {
      conditions.push([field, value]);
      return builder; // chainable, like User::where(...)->where(...)
    },
    get() {
      // your code here
    },
  };
  return builder;
}

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const users = [
    { id: 1, name: 'Mansha', active: 1 },
    { id: 2, name: 'Ali', active: 1 },
    { id: 3, name: 'Sara', active: 0 },
  ];
  const all = makeBuilder(users).get();                        // all()
  const first = makeBuilder(users).get()[0];                   // first()
  const found = makeBuilder(users).where('id', 2).get()[0];    // find(2)
  const actives = makeBuilder(users).where('active', 1).get(); // get() with a where
  console.log(first.name, found.name, all.length);
  console.log(actives.map((u) => u.name));
}
// task6();

module.exports = { makeFillableModel, makeGuardedModel, makeCastStore, withFullName, makeBuilder };
