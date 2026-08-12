'use strict';
// Lesson 59 — Lifecycle & Effect Order. Run with:  node exercises/03-react/59-lifecycle.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React here — we simulate the two effect-pass walks with plain JS.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The two-walk model: effects run bottom-up, cleanup runs top-down.
function task1() {
  const log = [];

  // a tiny tree, mounted root-first like React renders it
  const root = {
    name: 'parent',
    children: [
      { name: 'first', children: [] },
      { name: 'second', children: [] },
    ],
  };

  const walkEffects = (node) => {
    node.children.forEach(walkEffects);          // children first…
    log.push('effect: ' + node.name);            // …then the node itself
  };
  const walkCleanup = (node) => {
    log.push('cleanup: ' + node.name);           // parent first…
    node.children.forEach(walkCleanup);          // …then children
  };

  walkEffects(root);
  log.push('---');
  walkCleanup(root);
  console.log(log.join('\n'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Strict Mode double-invocation: the body runs, cleanup runs, body again.
function task2() {
  const log = [];
  const effect = (body, cleanup) => {
    // dev Strict Mode: mount → cleanup → mount
    body();                       // mount #1
    cleanup();                    // the extra unmount
    body();                       // mount #2
  };
  effect(
    () => log.push('fetch started'),
    () => log.push('fetch aborted'),
  );
  console.log(log.join('\n'));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// When do the cleanups run — before the re-run, or after?
function task3() {
  const log = [];
  let previous = null;
  const run = (deps, body, cleanup) => {
    const changed = previous === null || deps.some((d, i) => !Object.is(d, previous[i]));
    if (changed) {
      if (previous !== null) {
        log.push('cleanup (old run)');           // first time: nothing to clean
        cleanup();
      }
      previous = deps;
      body();
      log.push('body (new run)');
    }
  };

  run(['a'], () => {}, () => log.push('  …'));
  run(['a'], () => {}, () => log.push('  …'));
  run(['b'], () => {}, () => log.push('  …'));
  console.log(log.join('\n'));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The parent subscribes BEFORE the child effect runs. Is the parent's
// handler guaranteed to see the child's setup? (This is why children
// effect first.)
function task4() {
  const log = [];
  const childState = { mounted: false };

  // effect walk: child first, then parent
  const childEffect = () => { childState.mounted = true; };
  const parentEffect = () => {
    log.push('parent reads child.mounted = ' + childState.mounted);
  };

  childEffect();      // children finish their effects first
  parentEffect();     // then the parent reads their state
  console.log(log.join('\n'));
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Unmount order: does the child keep firing into a torn-down parent?
function task5() {
  const log = [];
  let channelOpen = true;
  const channel = {
    emit: (msg) => log.push(channelOpen ? 'channel: ' + msg : 'DROPPED: ' + msg),
  };

  const parentCleanup = () => { channelOpen = false; };  // closes the shared channel
  const childCleanup = () => { channel.emit('child teardown'); };

  // unmount walk is TOP-DOWN: parent cleanup first, then child
  parentCleanup();
  childCleanup();
  console.log(log.join('\n'));
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Which effect belongs in useLayoutEffect? Pick the one that must run
// BEFORE the paint, and explain why the other can wait.
function task6() {
  // A. position a tooltip next to a just-rendered button
  const measureAndPosition = 'useLayoutEffect';   // must be pre-paint — no flash
  // B. push an analytics event when the route changes
  const sendAnalytics = 'useEffect';              // post-paint is fine — nobody sees timing

  console.log('A:', measureAndPosition, '| B:', sendAnalytics);
}
// task6();

module.exports = {};
