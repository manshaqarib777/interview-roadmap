'use strict';
// Lesson 96 — Env Vars, Build & Deployment. Run with:
//   node exercises/04-nextjs/96-deployment.js
// Predict every output BEFORE running. Write your prediction in the comment.
// NOTE: run with `node` directly, NOT `npm test` — we test the loader order.

// ── Task 1 ──────────────────────────────────────────────────────────
// Env loading order. Which value wins for each key?
//   .env.local       →  DATABASE_URL=local, THEME=local
//   .env.production  →  DATABASE_URL=prod,   API_URL=prod
//   .env             →  THEME=default,       API_URL=default
function loadEnv(mode, files) {
  // your code here — later files in `files` override earlier ones;
  // only apply '.env.production.local' style files when mode matches
  const merged = {};
  return merged;
}
function task1() {
  const files = ['env', 'env.production', 'env.local', 'env.production.local'];
  console.log(loadEnv('production', files));
  console.log(loadEnv('development', files));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// NEXT_PUBLIC_ inlining, modelled as two bundles. Rewrite each module:
//   server bundle  → real values for every var it references
//   client bundle  → NEXT_PUBLIC_ values inlined; other vars become undefined
function bundle(module, env) {
  // your code here — return a string like 'DATABASE_URL=<value>'
}
function task2() {
  const env = {
    DATABASE_URL: 'postgres://prod',
    NEXT_PUBLIC_API_URL: 'https://api.acme.com',
  };
  console.log('server:', bundle('DATABASE_URL', env));
  console.log('client:', bundle('NEXT_PUBLIC_API_URL', env));
  console.log('client:', bundle('DATABASE_URL', env));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Route classification. In a real build: static (○), dynamic (ƒ), or ISR (●)?
function classify(route) {
  // your code here
  return '○'; // placeholder
}
function task3() {
  const routes = [
    { name: '/', reads: [] },
    { name: '/dashboard', reads: ['cookies'] },
    { name: '/products/[id]', reads: [], revalidate: 3600 },
  ];
  for (const r of routes) console.log(r.name, '→', classify(r));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Why does the dashboard env change not reach a deployed site? Pick the
// single best explanation (write the letter).
//   A) NEXT_PUBLIC_ vars are read from the browser at runtime
//   B) values were inlined into the bundle at build time
//   C) Vercel caches env vars for 24 hours
//   D) the dashboard value is only used for local development
function task4() {
  console.log('answer:', /* your code here */);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The leaked secret. Given this client module and env, what does the
// client bundle end up containing for each expression?
function task5() {
  const env = { SUPABASE_SERVICE_KEY: 'sb_secret_7x', NEXT_PUBLIC_SITE: 'acme.com' };
  const clientCode = ['process.env.SUPABASE_SERVICE_KEY', 'process.env.NEXT_PUBLIC_SITE'];
  for (const expr of clientCode) {
    const key = expr.replace('process.env.', '');
    console.log(expr, '→', env[key]); // predict BEFORE running
  }
}
// task5();

module.exports = { loadEnv, bundle, classify };
