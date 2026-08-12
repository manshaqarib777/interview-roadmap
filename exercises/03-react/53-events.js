'use strict';
// Lesson 53 — Events & Synthetic Events. Run with:  node exercises/03-react/53-events.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React needed: these model event propagation, pooling and default actions.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// stopPropagation vs preventDefault: stopPropagation stops the walk upward,
// preventDefault cancels the default action but lets the walk continue.
const calls = [];
const defaultAction = { cancelled: false };

function stopPropagation() {
  return { stops: true };
}
function preventDefault() {
  return { cancelsDefault: true };
}

function dispatchWalk(handler, eventAction) {
  calls.length = 0;
  defaultAction.cancelled = false;
  if (!eventAction.stops) calls.push('parent'); // the walk upward
  if (eventAction.cancelsDefault) defaultAction.cancelled = true;
  return calls;
}

function task1() {
  console.log('with stopPropagation →', dispatchWalk(undefined, stopPropagation()).join(', '));
  console.log('with preventDefault  →', dispatchWalk(undefined, preventDefault()).join(', '), '| default cancelled:', defaultAction.cancelled);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement a root-delegated event system. One listener per event type at
// the "root". A handler on the root catches events from any child.
// Return how many times the root listener fired when clicking 3 buttons.
const root = {
  listeners: {},
  addEventListener(type, fn) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(fn);
  },
  dispatch(type, payload) {
    for (const fn of this.listeners[type] || []) fn(payload);
  },
};
const buttons = [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }];

function task2() {
  let rootClicks = 0;
  root.addEventListener('click', () => {
    rootClicks += 1;
  });
  for (const button of buttons) {
    root.dispatch('click', { target: button.id }); // click bubbles up to the root
  }
  console.log('root listener fired →', rootClicks, 'time(s) for', buttons.length, 'clicks');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The pooling bug (pre-React 17): the event object is nulled after the
// handler runs, so reading it in an async callback sees nulled properties.
function pooledDispatch(target, handler) {
  const event = { target, persist() { /* pre-17 escape hatch */ } };
  handler(event);
  // pre-17 pooling: the event is "released" and its props nulled
  event.target = null;
  return event;
}

function task3() {
  let readLater;
  pooledDispatch('button', (e) => {
    readLater = e.target; // copy synchronously — the pooling-era habit
  });
  console.log('copied synchronously →', readLater);

  let asyncRead;
  pooledDispatch('button', (e) => {
    setTimeout(() => {
      asyncRead = e.target; // ❌ pooled events are nulled by the time this runs
    }, 0);
  });
  setImmediate(() => console.log('read async →', asyncRead));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement normalizeEvent(raw): return a synthetic event with the SAME
// properties on every "browser". Raw events differ across browsers
// (oldIE uses keyCode, modern uses key) — the synthetic event must expose `key`.
function normalizeEvent(raw) {
  // your code here
}

function task4() {
  const oldBrowser = normalizeEvent({ type: 'keydown', keyCode: 13 });
  const modernBrowser = normalizeEvent({ type: 'keydown', key: 'Enter' });
  console.log('oldIE →', oldBrowser.key, '| modern →', modernBrowser.key);
  console.log('same everywhere?', oldBrowser.key === modernBrowser.key);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// React's onChange maps to the native `input` event: it fires on every
// keystroke, not on blur like the DOM `change` event.
const nativeChange = { fires: 'on blur only' };
const reactOnChange = { fires: 'every keystroke (native input event)' };
function task5() {
  console.log('DOM change event →', nativeChange.fires);
  console.log('React onChange   →', reactOnChange.fires);
}
// task5();

module.exports = { normalizeEvent, pooledDispatch, root };
