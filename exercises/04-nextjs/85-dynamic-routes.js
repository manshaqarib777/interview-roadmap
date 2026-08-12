'use strict';
// Lesson 85 — Dynamic Routes. Run with:  node exercises/04-nextjs/85-dynamic-routes.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; none of them need a Next.js server to run.)

// ── Task 1 ──────────────────────────────────────────────────────────
// A [slug] segment captures ONE URL segment into params; segment values
// are always strings.
// Prediction: ______________________
function paramsFor(segments, pattern) {
  const keys = pattern.map((seg) => seg.replace(/^\[|\]$/g, ''));
  const result = {};
  keys.forEach((key, i) => {
    result[key] = segments[i];
  });
  return result;
}

function task1() {
  console.log(paramsFor(['hello-world'], ['[slug]']));
  console.log(paramsFor(['42'], ['[id]']));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// In a Server Component, params is a Promise — you must await it.
// Complete `readSlug` to resolve params before reading the slug.
async function readSlug(paramsPromise) {
  // your code here — await the promise, then return params.slug
}

async function task2() {
  console.log(await readSlug(Promise.resolve({ slug: 'app-router' })));
  console.log(await readSlug(Promise.resolve({ slug: 'dynamic-routes' })));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// generateStaticParams pre-renders the KNOWN slugs; dynamicParams
// decides what happens for the unknown ones.
// Prediction: ______________________
function serve(post, known) {
  if (known.includes(post)) return 'static (pre-rendered)';
  return 'on-demand (dynamicParams default)';
}

function task3() {
  const known = ['app-router', 'layouts', 'dynamic-routes'];
  console.log(serve('app-router', known));
  console.log(serve('unknown-post', known));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// generateStaticParams must return keys that match segment names.
// Complete the function so keys match the [slug] folder.
function generateStaticParams(slugs) {
  // your code here — return [{ slug: ... }, ...] for each slug
}

function task4() {
  console.log(generateStaticParams(['a', 'b']));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Catch-all [...slug] captures the REST of the path as an array;
// [[...slug]] also matches when nothing is there.
// Prediction: ______________________
function catchAll(segments) {
  return { slug: segments.length ? segments : [] };
}

function task5() {
  console.log(catchAll(['guide', 'setup']));
  console.log(catchAll([]));
}
// task5();

module.exports = { readSlug, generateStaticParams, catchAll };
