'use strict';
// Lesson 89 — Data Fetching. Run with:  node exercises/04-nextjs/89-data-fetching.js
// Plain Node: the functions below are named after Next.js concepts but have
// no Next.js dependency — they run here exactly as written.
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task1() {
  let calls = 0;
  const fetchPosts = () => {
    calls += 1;
    return Promise.resolve([{ id: 1, title: 'one' }, { id: 2, title: 'two' }]);
  };

  async function Page() {
    const posts = await fetchPosts(); // an async Server Component awaits its fetch
    return posts;
  }

  Page().then((posts) => {
    console.log(posts.length, 'posts,', calls, 'fetch(es)');
  });
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement memoizeFetch: within a SINGLE "request" (one request() call),
// identical fetches share one network call. Across requests it must
// refetch. Count the real network calls.
let netCalls = 0;
let memo = new Map(); // the per-request memo cache

function request(work) {
  memo = new Map(); // a fresh memo for each request
  return work();
}

function memoizeFetch(fetchImpl) {
  // your code here
}

const getPosts = memoizeFetch(() => {
  netCalls += 1;
  return Promise.resolve([{ id: 1 }]);
});

function task2() {
  return request(() =>
    Promise.all([
      getPosts().then((p) => p.length),
      getPosts().then((p) => p.length),
      getPosts().then((p) => p.length),
    ]).then((lens) => {
      console.log('lengths:', lens, 'network calls:', netCalls);
    }),
  );
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// An async Server Component must throw on a bad status so the nearest
// error.tsx handles it. Return { ok: true, data } for 200s and reject
// for anything else.
async function serverFetch(url, fetchImpl) {
  // your code here
}

function task3() {
  const fakeFetch = (url) =>
    Promise.resolve({
      ok: url.endsWith('/ok'),
      status: url.endsWith('/ok') ? 200 : 404,
      json: () => Promise.resolve({ url }),
    });

  return serverFetch('https://api.example.com/ok', fakeFetch).then((r) => {
    console.log('200 →', JSON.stringify(r));
    return serverFetch('https://api.example.com/missing', fakeFetch).catch((e) => {
      console.log('404 → threw:', e.message);
    });
  });
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (check the boundary)
const bound = { name: 'server', date: new Date() };
function task4() {
  // A client component only receives SERIALISABLE values — a Date does
  // not survive the server/client boundary, so we stringify it first:
  const { date, ...rest } = bound;
  console.log(JSON.stringify({ ...rest, date: String(date) }));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Implement a tiny streaming shell: stream() must print 'shell' FIRST,
// then resolve after the data promise and print the data. Output ORDER
// is what matters — run it and check your prediction.
function stream(shell, dataPromise) {
  // your code here
}

function task5() {
  return stream('shell', new Promise((r) => setTimeout(() => r('data'), 20)));
}
// task5();

module.exports = { memoizeFetch, serverFetch, stream };
