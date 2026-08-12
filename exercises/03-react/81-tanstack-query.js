'use strict';
// Lesson 81 — TanStack Query. Run with:  node exercises/03-react/81-tanstack-query.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React needed: these are pure-JS models of the query cache — keys,
// staleTime vs gcTime, refetch-on-stale-read, and invalidate-after-write.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Model of Lesson 81: staleTime is a FRESHNESS window; inside it a read
// is served from cache with no fetch.
const now = () => Date.now();
let lastFetch = 0;
function fetchTodos() { lastFetch = now(); return ['todo']; }

function readWithStale(cacheTime, staleTime) {
  if (cacheTime !== null && now() - cacheTime < staleTime) {
    return { source: 'cache', data: ['todo'] };
  }
  return { source: 'fetch', data: fetchTodos() };
}
function task1() {
  const fetched = readWithStale(null, 0);
  const cached = readWithStale(lastFetch, 60_000); // fresh for 60s
  console.log('first read:', fetched.source);
  console.log('second read:', cached.source);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement a minimal query cache with invalidate-after-write (the
// mutation onSuccess pattern from Lesson 81).
function createQueryCache() {
  const entries = new Map();
  return {
    // your code here
    // get(key)         → entry or undefined
    // set(key, data)   → store { data, stale: false, updatedAt: Date.now() }
    // invalidate(key)  → mark the entry stale (keep its data — no delete!)
    get: () => undefined,
    set: () => {},
    invalidate: () => {},
  };
}

const cache = createQueryCache();
cache.set(['todos'], ['learn queries']);
cache.invalidate(['todos']);
const entry = cache.get(['todos']);
console.log('data kept after invalidate:', entry && entry.data);
console.log('marked stale:', entry && entry.stale === true);

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// gcTime governs how long an UNUSED entry lives. This simulates an entry
// no component subscribes to being garbage-collected after gcTime.
let entries = { todos: { data: [1], updatedAt: now() } };
function gcTicks(msSinceUse, gcTime) {
  if (msSinceUse > gcTime) entries = {}; // GC'd — nobody subscribed
}
function task3() {
  gcTicks(6 * 60_000, 5 * 60_000); // 6 min idle > 5 min gcTime
  console.log('entry alive after GC:', 'todos' in entries);
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Model the refetch-on-stale-read cycle: stale → refetch → fresh.
// The "invalidated" state must refetch on the NEXT read, not immediately.
async function task4() {
  const cache = createQueryCache();
  cache.set(['todos'], ['a']);

  cache.invalidate(['todos']); // a mutation just landed
  console.log('before read (stale):', cache.get(['todos']).data);

  // your code here — the next read sees stale, refetches, marks fresh
  cache.set(['todos'], ['a', 'b']);

  const fresh = cache.get(['todos']);
  console.log('after refetch:', fresh.data, '| stale:', fresh.stale);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// queryKey is the cache address — structural equality means two queries
// with equal keys share ONE fetch. This is the deduplication story.
function task5() {
  const key1 = ['todos', { filter: 'done' }];
  const key2 = ['todos', { filter: 'done' }];
  const key3 = ['todos', { filter: 'all' }];
  console.log('key1 === key2 (as JSON):', JSON.stringify(key1) === JSON.stringify(key2));
  console.log('key1 === key3 (as JSON):', JSON.stringify(key1) === JSON.stringify(key3));
}
// task5();

module.exports = { createQueryCache, readWithStale };
