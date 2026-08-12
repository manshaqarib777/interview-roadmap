'use strict';
// Lesson 86 — Server Components. Run with:  node exercises/04-nextjs/86-server-components.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (All tasks are standalone; none of them need a Next.js server to run.)

// ── Task 1 ──────────────────────────────────────────────────────────
// A Server Component can await directly in its body. This is the same
// idea: an async function that awaits data before returning JSX-like output.
// Prediction: ______________________
async function renderPosts() {
  const posts = await new Promise((resolve) =>
    setTimeout(() => resolve(['RSC payloads', 'Zero client JS']), 10)
  );
  return `<ul>${posts.map((p) => `<li>${p}</li>`).join('')}</ul>`;
}

async function task1() {
  const html = await renderPosts();
  console.log(html);
  console.log('is promise:', renderPosts() instanceof Promise);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// RSC is the default: a component with no 'use client' ships ZERO client
// JS. Model the "bundle" as an array of module names a client would load.
// Prediction: ______________________
const CLIENT_JS = [];

function serverComponent(name) {
  // server components never add to the client bundle
}

serverComponent('Header');
serverComponent('PostCard');
CLIENT_JS.push('like-button.js'); // the only interactive island

function task2() {
  console.log('client bundle:', CLIENT_JS.join(', ') || '(empty)');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Serialize a rendered tree into the shape of an RSC payload:
// server output as plain markup, client references as module entries.
// Complete serializeTree so the output matches the expected payload.
function serializeTree(node) {
  const out = [];
  function walk(n) {
    if (n.kind === 'server') {
      // your code here
    } else if (n.kind === 'client') {
      // your code here
    }
  }
  walk(node);
  return out;
}

function task3() {
  const tree = {
    kind: 'server',
    name: 'Header',
    children: [
      { kind: 'client', name: 'SearchBox' },
      { kind: 'server', name: 'NavLinks' },
    ],
  };
  console.log(serializeTree(tree).join('\n'));
}

// Expected:
//   render:Header
//   client:SearchBox
//   render:NavLinks
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Hooks are unavailable in Server Components — there is no runtime on
// the client to host them. What does this log, and why does it not throw?
// Prediction: ______________________
function useStateShim() {
  return ['0', () => {}]; // stand-in: hooks exist only where a runtime exists
}

function serverComponentWithHook() {
  // In Next.js this is a BUILD error. Here, it simply never runs — a
  // server-only component doesn't ship to the client at all.
  return useStateShim;
}

function task4() {
  const fn = serverComponentWithHook();
  console.log('hook shim shipped:', typeof fn === 'function');
  console.log('value:', fn()[0]);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Async components stream: the shell flushes before slow sections. Model
// it with a list of "sections" that resolve at different times.
// Prediction: ______________________
async function streamPage() {
  const order = [];
  order.push('shell');
  await new Promise((r) => setTimeout(r, 20));
  order.push('slow-section');
  await new Promise((r) => setTimeout(r, 20));
  order.push('footer');
  return order;
}

async function task5() {
  console.log((await streamPage()).join(' → '));
}
// task5();

module.exports = { renderPosts, serializeTree, streamPage };
