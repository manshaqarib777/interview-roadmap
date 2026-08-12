'use strict';
// Lesson 95 — Cookies, Headers & Metadata. Run with:
//   node exercises/04-nextjs/95-cookies-headers-metadata.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// We're mimicking next/headers with plain objects. What does each await
// resolve to? Write the three values (note: process.env.NODE_ENV is
// 'production' when run through npm scripts, 'test' otherwise).
const cookieStore = {
  get: (name) => ({ theme: 'dark' }[name] ?? null),
};
async function readTheme() {
  const c = await cookieStore; // pretend this is (await cookies())
  return c.get('theme')?.value ?? 'light';
}
async function task1() {
  console.log('theme:', await readTheme());
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('has session:', Boolean((await cookieStore).get('session')));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Metadata title resolution. Given the root template and a page title,
// compute the final <title>. Watch out: a title of null means the page
// sets no title (fall back to the default).
function resolveTitle(template, pageTitle, fallback) {
  // your code here
}
function task2() {
  const tpl = { template: '%s | Acme', default: 'Acme' };
  console.log(resolveTitle(tpl, 'About', tpl.default));
  console.log(resolveTitle(tpl, null, tpl.default));
  console.log(resolveTitle(tpl, { absolute: 'Home' }, tpl.default));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Fix this 15-era code: it calls cookies() WITHOUT await. What does it
// print as-is, and what does it print after you add the missing await?
// (cookies() is mocked below; only the missing await is the bug.)
function cookies() {
  return cookieStore; // pretend this is the real next/headers cookies()
}
async function auth() {
  const c = cookies(); // missing await — c is a Promise, not the store
  return Boolean(c.get && c.get('session'));
}
async function task3() {
  console.log('no await →', await auth());
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The metadata merge: a child page defines openGraph.title only. Does the
// parent's openGraph.description survive? Implement shallow merge (a
// child field REPLACES the whole parent object of the same name) and see.
function mergeMetadata(parent, child) {
  // your code here
}
function task4() {
  const parent = { title: 'Acme', openGraph: { title: 'Acme', description: 'parent desc' } };
  const child = { title: 'Blog', openGraph: { title: 'Blog' } };
  console.log(mergeMetadata(parent, child));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// In real Next.js, cookies can only be SET in a Server Action or a Route
// Handler — never during a Server Component render. Implement the check.
function canSetCookie(context) {
  // your code here — return true only for 'action' and 'handler'
}
function task5() {
  for (const ctx of ['render', 'action', 'handler', 'middleware']) {
    console.log(ctx, '→', canSetCookie(ctx) ? 'allowed' : 'not allowed');
  }
}
// task5();

module.exports = { readTheme, resolveTitle, auth, mergeMetadata, canSetCookie };
