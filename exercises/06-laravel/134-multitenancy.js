'use strict';
// Lesson 134 — Multi-Tenancy & System Design. Run with:  node exercises/06-laravel/134-multitenancy.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (A tiny "database" of rows; the scope guard appends the tenant predicate
// the way Eloquent's global scope appends `where tenant_id = ?`.)

// ── Task 1 ──────────────────────────────────────────────────────────
// The global scope: query(table, where) must ALWAYS append the tenant
// predicate — like Eloquent appending `and tenant_id = ?` to every query.
// Prediction: ______________________
const tenantId = 7;

function query(table, where) {
  // your code here — the tenant predicate is mandatory on every read
  return [];
}

function task1() {
  console.log('order 91:', JSON.stringify(query('orders', { id: 91 })));
  console.log('all orders:', JSON.stringify(query('orders', {})));
}
// Expected:
//   order 91: [{"id":91,"tenant_id":7,"total":42}]
//   all orders: [{"id":91,"tenant_id":7,"total":42},{"id":92,"tenant_id":7,"total":9}]
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// THE leak test: tenant 7 asks for order 91's neighbour, order 99 —
// which belongs to tenant 9. The scope must block it. What is returned?
// Prediction: ______________________
function task2() {
  console.log('cross-tenant read:', JSON.stringify(query('orders', { id: 99 })));
  console.log('empty array means blocked:', JSON.stringify(query('orders', { id: 99 })) === '[]');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The raw query escape hatch: unscoped(table, where) does NOT add the
// tenant predicate — exactly like DB::select() bypassing the scope.
// A raw query can leak. What leaks here?
// Prediction: ______________________
function unscoped(table, where) {
  return DATABASE[table].filter((row) => Object.entries(where).every(([k, v]) => row[k] === v));
}

function task3() {
  const leaked = unscoped('orders', { id: 99 });
  console.log('raw query returned:', JSON.stringify(leaked));
  console.log('belongs to tenant:', leaked[0]?.tenant_id, '(7 is ours, 9 is not)');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// A tenant-aware query layer with an explicit bypass switch: scope=true
// (default) appends the predicate; scope=false is the sanctioned escape
// hatch used ONLY by cross-tenant system jobs.
// Prediction: ______________________
function scopedQuery(table, where, opts = {}) {
  // your code here — default ON; opts.scope === false turns it off
  return [];
}

function task4() {
  console.log('scoped:', JSON.stringify(scopedQuery('orders', { id: 99 })));
  console.log('bypassed:', JSON.stringify(scopedQuery('orders', { id: 99 }, { scope: false })));
}
// Expected:
//   scoped: []
//   bypassed: [{"id":99,"tenant_id":9,"total":500}]
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The bypass must be impossible to forget: a call that passes scope:false
// is an audible decision. The audit log records every bypass — name the
// caller and what it did. Without an audit trail you can't debug a leak.
// Prediction: ______________________
const bypassAudit = [];

function auditedScopedQuery(table, where, opts = {}) {
  const bypassed = opts.scope === false;
  if (bypassed) {
    bypassAudit.push({ caller: opts.caller ?? 'unknown', table, at: Date.now() });
  }
  // your code here — same behaviour as scopedQuery
  return [];
}

function task5() {
  console.log('bypass 1:', JSON.stringify(auditedScopedQuery('orders', { id: 99 }, { scope: false, caller: 'NightlyReport' })));
  console.log('bypass 2:', JSON.stringify(auditedScopedQuery('orders', { id: 99 }, { scope: false, caller: 'DataExport' })));
  console.log('audit log:', bypassAudit.map((e) => e.caller).join(', '));
}
// Expected:
//   bypass 1: [{"id":99,"tenant_id":9,"total":500}]
//   bypass 2: [{"id":99,"tenant_id":9,"total":500}]
//   audit log: NightlyReport, DataExport
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  console.log('tenant 7 lists orders:', JSON.stringify(query('orders', {})));
  console.log('tenant 7 reads own 92:', JSON.stringify(query('orders', { id: 92 })));
  console.log('tenant 7 reads others 99:', JSON.stringify(query('orders', { id: 99 })));
}
// task6();

// ── Database ─────────────────────────────────────────────────────────
// (Two tenants share one table — the exact shape of the shared-DB design.)
const DATABASE = {
  orders: [
    { id: 91, tenant_id: 7, total: 42 },
    { id: 92, tenant_id: 7, total: 9 },
    { id: 99, tenant_id: 9, total: 500 },
    { id: 100, tenant_id: 9, total: 77 },
  ],
  users: [
    { id: 1, tenant_id: 7, name: 'Ada' },
    { id: 2, tenant_id: 9, name: 'Grace' },
  ],
};

module.exports = { query, scopedQuery, auditedScopedQuery, unscoped };
