'use strict';
// Lesson 94 — Middleware. Run with:  node exercises/04-nextjs/94-middleware.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A simplified middleware decision chain. What does decide() return for
// each request object? Write the three values.
function decide(request) {
  if (!request.cookies.session) return { action: 'redirect', to: '/login' };
  if (request.nextUrl === '/old-page') return { action: 'redirect', to: '/new-page' };
  if (request.bucket === 'b') return { action: 'rewrite', to: '/landing/b' };
  return { action: 'next' };
}
function task1() {
  console.log(decide({ cookies: {}, nextUrl: '/dashboard', bucket: 'a' }));
  console.log(decide({ cookies: { session: 't' }, nextUrl: '/dashboard', bucket: 'a' }));
  console.log(decide({ cookies: { session: 't' }, nextUrl: '/landing', bucket: 'b' }));
}
// Prediction: ______________________
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Fix the redirect loop: this middleware redirects EVERY request,
// including /login itself, so the browser bounces forever.
// Add a guard so /login is never redirected. Keep the redirect for /dashboard.
function middleware(request) {
  // your code here
  if (!request.cookies.session) {
    return { action: 'redirect', to: '/login' };
  }
  return { action: 'next' };
}
function task2() {
  console.log(middleware({ nextUrl: '/login', cookies: {} }));
  console.log(middleware({ nextUrl: '/dashboard', cookies: {} }));
  console.log(middleware({ nextUrl: '/dashboard', cookies: { session: 't' } }));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement the matcher check: a path matches '/dashboard/:path*' when it
// is '/dashboard' or starts with '/dashboard/'. /dashboardx must NOT match.
function matches(pattern, path) {
  // your code here
}
function task3() {
  const pattern = '/dashboard/:path*';
  for (const p of ['/dashboard', '/dashboard/settings', '/dashboardx', '/about']) {
    console.log(p, '→', matches(pattern, p));
  }
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// The A/B test: rewrite /landing to /landing/b when the bucket cookie is
// 'b', but NEVER touch other paths. Read the cookie from request.cookies.
function abMiddleware(request) {
  // your code here
  return { action: 'next' };
}
function task4() {
  console.log(abMiddleware({ nextUrl: '/landing', cookies: { bucket: 'b' } }));
  console.log(abMiddleware({ nextUrl: '/landing', cookies: { bucket: 'a' } }));
  console.log(abMiddleware({ nextUrl: '/pricing', cookies: { bucket: 'b' } }));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// THIS middleware has the redirect-loop bug. Predict the four lines it
// prints when the browser follows the redirects, then add a guard so
// /login is never redirected (which breaks the loop).
function gate(request) {
  // your code here
  if (!request.cookies.session) {
    return { action: 'redirect', to: '/login' };
  }
  return { action: 'next' };
}
function task5() {
  let url = '/dashboard';
  for (let i = 0; i < 4; i++) {
    const res = gate({ nextUrl: url, cookies: {} });
    console.log(i + 1, res);
    url = res.to ?? res.nextUrl; // follow the redirect, like a browser would
  }
}
// task5();

module.exports = { decide, middleware, matches, abMiddleware, gate };
