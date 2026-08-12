'use strict';
// Lesson 98 — Top TypeScript Interview Questions.
// Type-annotation gauntlet. All types live in COMMENTS: this file is plain
// JavaScript, so it runs with plain Node. Predict each type BEFORE running.
//   node exercises/05-interview-prep/98-ts-questions.js

// ── Task 1 ──────────────────────────────────────────────────────────
// Predict the inferred type of `cfg` — then run and compare with the answer
// in the module notes for Lesson 39.
function task1() {
  const cfg = {
    theme: 'dark',
    retries: 3,
    debug: false,
  };
  console.log('cfg:', JSON.stringify(cfg));
  // TS: const cfg: { theme: string; retries: number; debug: boolean }
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Write the TYPE of `partial` in the comment. (Partial<Config> — but what
// shape is that, concretely?)
function task2() {
  const config = { theme: 'dark', retries: 3 };
  const partial = { theme: 'dark' }; // allowed: every key of config is optional
  console.log('partial:', JSON.stringify(partial));
  // TS: const partial: { theme?: string; retries?: number }
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Predict the type of `result`. (In TS: ReturnType<F>.)
function task3() {
  function id(n) {
    return `id-${n}`;
  }
  const result = id(7); // 'id-7'
  console.log('result:', result);
  // TS: const result: string   (ReturnType of id)
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Predict the narrowed type inside each branch. (In TS: discriminated union.)
function task4() {
  const states = [
    { status: 'success', data: { name: 'ali' } },
    { status: 'error', error: new Error('boom') },
  ];
  for (const s of states) {
    if (s.status === 'success') {
      console.log('success data:', s.data.name);
      // TS: s is { status: 'success'; data: { name: string } }
    } else {
      console.log('error message:', s.error.message);
      // TS: s is { status: 'error'; error: Error }
    }
  }
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Predict the type of `unknown`. Then write the narrowing that makes it
// safe — without `any`.
function task5() {
  // In TS: const raw: unknown = JSON.parse('{"name":"ali"}');
  // raw.name        // ❌ TS error — unknown needs narrowing
  // const data = raw as { name: string };  // the trust-boundary narrow
  console.log('unknown is safe until narrowed — no property access without proving shape');
  // TS: type data = { name: string }
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Predict the type of `routes.home`. (In TS: `satisfies`.)
function task6() {
  const routes = {
    home: '/',
    user: (id) => `/user/${id}`,
  };
  console.log('home route:', routes.home, '| user route:', routes.user(7));
  // TS: routes.home: string   (literal '/' — not widened, thanks to satisfies)
}
// task6();

module.exports = { task1, task2, task3, task4, task5, task6 };
