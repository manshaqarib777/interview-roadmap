'use strict';
// Lesson 91 — Revalidation, ISR, SSR & SSG. Run with:  node exercises/04-nextjs/91-revalidation-isr-ssr-ssg.js
// Plain Node: each task models a rendering strategy. Predict EVERY output
// BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// SSG: render once at "build", serve the SAME object forever.
// Prediction: ______________________
let builds = 0;
const renderAtBuild = () => {
  builds += 1;
  return { html: `<p>build #${builds}</p>` };
};
function task1() {
  const ssg = renderAtBuild();          // the build-time render
  console.log(ssg === renderAtBuild()); // same cached object?
  console.log(ssg.html);
  console.log('renders:', builds);      // must be 1
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// SSR: render on EVERY request. Implement serve().
let renders2 = 0;
function makeSsr(render) {
  // your code here
}

function task2() {
  const serve = makeSsr(() => {
    renders2 += 1;
    return `<p>fresh render #${renders2}</p>`;
  });
  console.log(serve());
  console.log(serve());
  console.log(serve());
  console.log('renders:', renders2);    // must be 3
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// ISR: render at build, re-render only when revalidate elapses. Serve
// stale while refreshing in the background. Count renders.
let renders3 = 0;
function makeIsr(render, revalidate) {
  // your code here
}

function task3() {
  let t = 0;
  const now = () => t;
  const page = makeIsr(() => {
    renders3 += 1;
    return Promise.resolve(`<p>rendered at t=${t}</p>`);
  }, 60);

  return (async () => {
    console.log(await page(now)); // t=0  → build render
    t = 30;
    console.log(await page(now)); // t=30 → cached
    t = 70;
    console.log(await page(now)); // t=70 → stale, refresh scheduled
    await new Promise((r) => setTimeout(r, 0));
    console.log(await page(now)); // t=70 → now fresh
    console.log('renders:', renders3); // must be 2
  })();
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// revalidateTag: purge a tagged entry ON DEMAND (CMS publish).
let renders4 = 0;
function makeTaggedIsr(render) {
  // your code here
}

function task4() {
  const page = makeTaggedIsr(() => {
    renders4 += 1;
    return Promise.resolve(`<p>render #${renders4}</p>`);
  });

  return (async () => {
    console.log(await page.get());    // render #1
    console.log(await page.get());    // cached — still #1
    page.revalidateTag();             // CMS publish → purge
    console.log(await page.get());    // render #2
    console.log(await page.get());    // cached — still #2
    console.log('renders:', renders4); // must be 2
  })();
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Apply the "is it dynamic?" rule: cookies()/headers()/searchParams or
// no-store ⇒ dynamic ⇒ fresh render per request.
// Prediction: ______________________
function task5() {
  const route = { readsCookies: true, fetch: 'cached' };
  const dynamic = route.readsCookies === true || route.fetch === 'no-store';
  console.log('dynamic:', dynamic, '→ strategy:', dynamic ? 'SSR' : 'static/ISR');
}
// task5();

module.exports = { makeSsr, makeIsr, makeTaggedIsr };
