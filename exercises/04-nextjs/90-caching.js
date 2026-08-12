'use strict';
// Lesson 90 — Caching. Run with:  node exercises/04-nextjs/90-caching.js
// Plain Node: dataCache() mirrors Next.js's Data Cache switches
// (no-store / force-cache / revalidate). Predict BEFORE running.
// Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Implement the Data Cache: `revalidate: N` = stale-while-revalidate.
// Serve the cached value while fresh; when stale, SERVE THE STALE VALUE
// immediately and refresh in the background. Count real backend hits.
let hits1 = 0;
function makeDataCache(fetchImpl, revalidate) {
  // your code here
}

function task1() {
  let t = 0;
  const now = () => t;
  const getPosts = makeDataCache(() => {
    hits1 += 1;
    return Promise.resolve(`posts@t=${t}`);
  }, 60);

  return (async () => {
    console.log(await getPosts(now)); // t=0  → cold fetch
    t = 30;
    console.log(await getPosts(now)); // t=30 → fresh, cached
    t = 70;
    console.log(await getPosts(now)); // t=70 → stale, refresh scheduled
    await new Promise((r) => setTimeout(r, 0)); // let the refresh land
    console.log(await getPosts(now)); // t=70 → now fresh
    console.log('backend hits:', hits1);
  })();
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement no-store: ALWAYS hit the backend, never cache. Count calls.
let hits2 = 0;
function noStore(fetchImpl) {
  // your code here
}

function task2() {
  const getNow = noStore(() => {
    hits2 += 1;
    return Promise.resolve(`now-${Math.random().toFixed(2)}`);
  });

  return Promise.all([getNow(), getNow()]).then(([a, b]) => {
    console.log('different values:', a !== b, 'backend calls:', hits2);
  });
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement force-cache: fetch once, serve the SAME promise forever.
// Count calls.
let hits3 = 0;
function forceCache(fetchImpl) {
  // your code here
}

function task3() {
  const getConfig = forceCache(() => {
    hits3 += 1;
    return Promise.resolve({ theme: 'dark' });
  });

  return Promise.all([getConfig(), getConfig(), getConfig()]).then(([a, b, c]) => {
    console.log('same object:', a === b && b === c, 'backend calls:', hits3);
  });
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// revalidateTag: purge a tagged cache entry ON DEMAND, then refetch.
let hits4 = 0;
function makeTaggedCache(fetchImpl) {
  // your code here
}

function task4() {
  const getPosts = makeTaggedCache(() => {
    hits4 += 1;
    return Promise.resolve(`version-${hits4}`);
  });

  return (async () => {
    console.log(await getPosts()); // fetch #1
    console.log(await getPosts()); // cached
    getPosts.revalidateTag();      // CMS publish → purge
    console.log(await getPosts()); // fetch #2
    console.log('backend hits:', hits4);
  })();
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Router Cache: a client-side, PER-SESSION cache of visited pages.
// Same session → cached. NEW session → refetch. Count backend calls.
let hits5 = 0;
function makeRouterCache(fetchImpl) {
  // your code here
}

function task5() {
  const load = makeRouterCache(() => {
    hits5 += 1;
    return Promise.resolve(`payload-${hits5}`);
  });

  function makeSession() {
    return { id: Math.random().toString(36).slice(2) };
  }

  return (async () => {
    const s1 = makeSession();
    console.log(await load(s1)); // session A, visit 1 → fetch
    console.log(await load(s1)); // session A, visit 2 → cached
    const s2 = makeSession();
    console.log(await load(s2)); // session B → fetch again
    console.log('backend hits:', hits5);
  })();
}
// task5();

module.exports = { makeDataCache, noStore, forceCache, makeTaggedCache, makeRouterCache };
