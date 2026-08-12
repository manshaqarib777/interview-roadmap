'use strict';
// Lesson 92 — Route Handlers. Run with:  node exercises/04-nextjs/92-route-handlers.js
// Predict every output BEFORE running. Write your prediction in the comment.

// These tasks simulate Next.js route-handler behaviour with plain Node so the
// file stays runnable. Task 4 and Task 5 read process.argv: pass a number to
// change the output, e.g.  node exercises/04-nextjs/92-route-handlers.js 7

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
const makeHandler = (methods) => {
  const allowed = new Set(methods);
  return (verb) => (allowed.has(verb) ? 200 : 405);
};

const handle = makeHandler(['POST']);

function task1() {
  console.log(handle('POST'), handle('GET'), handle('DELETE'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Route handlers read `params` from dynamic segments (a Promise in
// Next 15). Implement the equivalent of `ctx.params` resolution.
async function resolveParams(segment, value) {
  // your code here
  return undefined;
}

async function task2() {
  console.log(await resolveParams('id', '42'));
  console.log(await resolveParams('slug', 'hello-world'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The NextRequest body is a stream: it can only be read once. Simulate
// that with a string consumed by `json()`.
function makeRequest(body) {
  let consumed = false;
  return {
    async json() {
      if (consumed) throw new Error('Body already read');
      consumed = true;
      return JSON.parse(body);
    },
  };
}

async function task3() {
  const req = makeRequest('{"sku":"a1","qty":2}');
  const first = await req.json();
  console.log('first read:', first);
  try {
    await req.json();
  } catch (err) {
    console.log('second read threw:', err.message);
  }
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Search params live on `request.nextUrl` — implement the equivalent.
function nextUrl(raw) {
  const [path, query] = raw.split('?');
  const searchParams = new URLSearchParams(query ?? '');
  return { path, searchParams };
}

function task4() {
  const url = nextUrl('/api/users?page=2&sort=desc');
  console.log(url.path);
  console.log(url.searchParams.get('page'), url.searchParams.get('sort'));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// A 405 means "endpoint exists, verb not allowed". Implement allowed
// verbs per path, like a route table.
const ROUTES = new Map([
  ['/api/checkout', ['POST']],
  ['/api/users', ['GET', 'POST']],
  ['/api/items', ['GET', 'DELETE']],
]);

function routeTable(verb) {
  // your code here:  routeTable('DELETE') →
  //   [['/api/checkout', false], ['/api/users', false], ['/api/items', true]]
  return [];
}

function task5() {
  console.log(routeTable('DELETE'));
  console.log(routeTable('GET'));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
async function task6() {
  const id = process.argv[2] ?? '42'; // try:  node 92-route-handlers.js 7
  console.log({ url: `/api/users/${id}`, method: 'GET', status: 200 });
}
// task6();

module.exports = { resolveParams, routeTable };
