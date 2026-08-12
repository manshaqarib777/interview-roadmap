'use strict';
// Lesson 83 — App Router & File Routing. Run with:  node exercises/04-nextjs/83-app-router.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; none of them need a Next.js server to run.)

// ── Task 1 ──────────────────────────────────────────────────────────
// The App Router maps URL segments to folders, and the segment carries
// the role. Complete `resolveRoute` so /blog/hello-world matches the
// page inside app/blog/[slug]/.
const routeTree = {
  children: {
    blog: { page: true, layout: true, children: { '[slug]': { page: true } } },
  },
};

function resolveRoute(tree, segments) {
  // your code here
  // Walk the tree segment by segment. If no literal child folder matches
  // a segment, fall back to the dynamic [name] child (a wildcard). If
  // neither exists, the route doesn't exist. Return the leaf ('page') or null.
}

function task1() {
  console.log('blog/hello-world →', resolveRoute(routeTree, ['blog', 'hello-world']));
  console.log('blog →', resolveRoute(routeTree, ['blog']));
  console.log('missing →', resolveRoute(routeTree, ['missing']));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The root layout is required and owns <html>/<body>. Model the "layout
// stack" for /dashboard/settings with root + nested layouts.
// Prediction: ______________________
function layoutStack(path) {
  const segments = path.split('/').filter(Boolean);
  const stack = ['RootLayout'];
  let current = segments[0];
  for (let i = 1; i < segments.length; i++) {
    stack.push(current + 'Layout');
    current = segments[i];
  }
  return stack;
}

function task2() {
  console.log(layoutStack('/dashboard/settings').join(' → '));
  console.log(layoutStack('/dashboard').join(' → '));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Only page.tsx makes a route renderable. Complete the function so a
// folder without a page (but with other files) is NOT a route.
function isRoute(files) {
  // your code here — return true only when the folder renders UI
}

function task3() {
  console.log('blog:', isRoute(['layout.tsx', 'page.tsx']));
  console.log('api/health:', isRoute(['route.ts']));
  console.log('blog/[slug]:', isRoute(['loading.tsx', 'page.tsx']));
  console.log('stale:', isRoute(['layout.tsx', 'error.tsx']));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// A route.ts and a page.tsx in the same folder: the route handler wins.
// Prediction: ______________________
function routeOwner(files) {
  if (files.includes('route.ts')) return 'route handler';
  if (files.includes('page.tsx')) return 'page';
  return 'nothing renders';
}

function task4() {
  console.log(routeOwner(['layout.tsx', 'page.tsx', 'route.ts']));
  console.log(routeOwner(['layout.tsx', 'error.tsx']));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Old pages/ router: one file, one route. New App Router: folder +
// page. Translate a Pages Router filename into its App Router path.
// Prediction: ______________________
function toAppRouter(pagesPath) {
  const base = pagesPath.replace(/^pages\//, '').replace(/\.(jsx?|tsx?)$/, '');
  if (base === 'index') return '/';
  return '/' + base.replace(/\/index$/, '');
}

function task5() {
  console.log(toAppRouter('pages/index.tsx'));
  console.log(toAppRouter('pages/blog.tsx'));
  console.log(toAppRouter('pages/blog/index.tsx'));
}
// task5();

module.exports = { resolveRoute, isRoute, routeOwner, toAppRouter };
