'use strict';
// Lesson 87 — Client Components. Run with:  node exercises/04-nextjs/87-client-components.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (Standalone models of hydration, the boundary, and pre-render — plain Node.)

// ── Task 1 ──────────────────────────────────────────────────────────
// Client Components are pre-rendered on the server, then hydrated in the
// browser. Model "pre-render" as a pass every component gets, and
// "hydration" as a pass only client components get.
// Prediction: ______________________
const passes = [];
const serverPass = (name) => passes.push(`pre-render:${name}`);
const hydrationPass = (name) => passes.push(`hydrate:${name}`);

function serverComponent(name) {
  serverPass(name); // every component gets the server pass
}

function clientComponent(name) {
  serverPass(name); // pre-render first — HTML ships
  hydrationPass(name); // then hydration — listeners attach
}

function task1() {
  serverComponent('Header');
  clientComponent('SearchBox');
  console.log(passes.join(' | '));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// The pre-render is why a client component appears in View Source:
// the HTML was produced on the server. Model "View Source" as the
// pre-render log only.
// Prediction: ______________________
const viewSource = [];
const serverRender = (name) => viewSource.push(`<div>${name}</div>`);
const hydrate = (name) => viewSource.push(`hydrated ${name}`);

function task2() {
  serverRender('SearchBox'); // this ran on the server
  hydrate('SearchBox'); // this ran in the browser, invisible to View Source
  console.log('View Source sees:', viewSource[0]);
  console.log('View Source misses:', viewSource[1]);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// 'use client' is a boundary marker, not a file-level toggle: a client
// file's imports become client code, but server children passed in still
// render on the server. Complete `isClientCode` to encode that rule.
// Rule: anything imported INTO the boundary file is client code;
//       anything passed INTO it as a child stays server code.
function isClientCode(kind) {
  // your code here
  return false;
}

function task3() {
  console.log(
    [
      'imported helper → client:',
      isClientCode('imported'),
      '  server child → client:',
      isClientCode('server-child'),
    ].join('')
  );
}

// Expected:  imported helper → client: true   server child → client: false
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Hooks become legal inside the boundary because hydration provides a
// runtime. Model state: the value starts at the pre-rendered default and
// only changes after hydration.
// Prediction: ______________________
let hydrated = false;
function useState(initial) {
  return [hydrated ? initial : 'pre-render-default', () => {}];
}

function task4() {
  const [value] = useState('server-value');
  console.log('before hydration:', value);
  hydrated = true;
  const [value2] = useState('server-value');
  console.log('after hydration:', value2);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// The smallest-possible-boundary principle: an interactive island inside
// a server tree. Model the client bundle as the set of modules that are
// inside the boundary. `createTree` returns { bundle, labels } — make
// the labels reflect what each node becomes after the boundary.
function createTree(config) {
  const labels = [];
  // your code here
  return { bundle: config.clientModules, labels };
}

function task5() {
  const { bundle, labels } = createTree({
    clientModules: ['like-button.js'],
    serverModules: ['page.tsx', 'post-card.tsx'],
  });
  console.log('bundle:', bundle.join(', '));
  console.log('labels:', labels.join(', '));
}

// Expected:
//   bundle: like-button.js
//   labels: page:server, post-card:server, like-button:client
// task5();

module.exports = { isClientCode, createTree };
