'use strict';
// Lesson 100 — Top Next.js Interview Questions.
// Conceptual gauntlet: predict each answer BEFORE reading the trailing
// comment, then run to reveal the model answers.
//   node exercises/05-interview-prep/100-nextjs-questions.js

// ── Task 1 ──────────────────────────────────────────────────────────
// Where does this code run? Predict: server or client, and when.
//   export async function Products() {
//     const products = await getProducts();  // reads the database
//     return <ProductList products={products} />;
//   }
function task1() {
  console.log('ANSWER: Server Component — renders on the server, no client JS');
  console.log('when: build time for static routes, per request for dynamic ones');
  // In the real file this is the DEFAULT — no 'use client' needed.
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Which of these CAN cross the server/client boundary as a prop?
function task2() {
  const ok = ['string', 'number', 'boolean', 'plain object', 'array', 'serialisable React element'];
  const blocked = ['function', 'class instance', 'Map/Set', 'server-only module'];
  console.log('crosses:', ok.join(', '));
  console.log('breaks the build:', blocked.join(', '));
  // Rule of thumb: if JSON.stringify cannot represent it, it does not cross.
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Predict which rendering strategy you would pick, and why.
function task3() {
  const pages = [
    { page: 'marketing landing page', strategy: 'SSG (build time)' },
    { page: 'blog updated a few times a day', strategy: 'ISR (static + revalidate window)' },
    { page: 'per-user dashboard', strategy: 'SSR (per request)' },
  ];
  for (const p of pages) console.log(p.page, '→', p.strategy);
  // The choice is a trade-off, not an acronym: freshness vs speed vs per-user cost.
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Predict how many cache layers there are — and which one lives in the browser.
function task4() {
  const layers = ['full-route cache', 'data cache', 'router cache', 'fetch cache (dedupe)'];
  console.log('cache layers:', layers.join(' | '));
  console.log('in the browser: the router cache (client-side navigation snapshots)');
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// A form submits and the page still shows stale data. Predict the missing step.
function task5() {
  console.log('missing step: revalidation after the mutation');
  console.log('fix: revalidatePath("/products") or revalidateTag("posts")');
  console.log('the revalidate call is the other half of every write in the App Router');
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Predict what middleware can and cannot do at the edge.
function task6() {
  console.log('CAN: redirect, rewrite, check headers, auth-gate before the route');
  console.log('CANNOT: reach the database / session store — it runs at the edge');
  console.log('so: a fast, coarse gate — not the whole security layer');
}
// task6();

module.exports = { task1, task2, task3, task4, task5, task6 };
