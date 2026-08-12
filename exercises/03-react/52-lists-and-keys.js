'use strict';
// Lesson 52 — Lists & Keys. Run with:  node exercises/03-react/52-lists-and-keys.js
// Predict every output BEFORE running. Write your prediction in the comment.
// No React needed: these model reconciliation's list behavior with plain JS.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// The index-key trap: an unshift changes every item's index, so matching
// the OLD list by index matches the WRONG items.
const oldList = [
  { id: 'a', label: 'first' },
  { id: 'b', label: 'second' },
  { id: 'c', label: 'third' },
];
const newList = [
  { id: 'x', label: 'new' }, // inserted at the front
  { id: 'a', label: 'first' },
  { id: 'b', label: 'second' },
  { id: 'c', label: 'third' },
];
// With key={index}: old index 0 ("first") matches NEW index 0 ("new").
function task1() {
  const pairs = oldList.map((item, i) => `${item.id}@${i} → ${newList[i].id}@${i}`);
  console.log(pairs.join('\n'));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Implement matchByKey(prev, next, keyOf): match each item in `prev` to
// its counterpart in `next` BY KEY, and return the id of the item it got
// matched to. With a stable key (id), a reorder matches every item to
// ITSELF. With index keys, the same reorder matches every item to the
// WRONG item — identity is decided by position, which just moved.
function matchByKey(prev, next, keyOf) {
  // your code here
}

function task2() {
  const reordered = [oldList[2], oldList[0], oldList[1]]; // c, a, b
  const byId = matchByKey(oldList, reordered, (item) => item.id);
  const keptById = byId.filter((m) => m.matchedId === m.id).length;
  console.log('kept with id keys →', keptById, '(' + byId.map((m) => m.matchedId).join(',') + ')');
  // Simulate the index trap: keys are positions, so identity follows position.
  const byIndex = matchByKey(oldList, reordered, (item, i) => i);
  const keptByIndex = byIndex.filter((m) => m.matchedId === m.id).length;
  console.log('kept with index keys →', keptByIndex, '(' + byIndex.map((m) => m.matchedId).join(',') + ')');
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// What a key change does: React treats an element with a DIFFERENT key as
// a NEW element, so DOM state (the typed input value) is destroyed and
// rebuilt, not moved.
function task3() {
  let remounts = 0;
  const prev = { key: 'a', inputValue: 'user typed Z' };

  const nextSameKey = { key: 'a', inputValue: 'user typed Z' };
  if (nextSameKey.key === prev.key) {
    // reuse — same element, DOM state carries over
  } else {
    remounts += 1;
  }
  const withStableKey = remounts;

  remounts = 0;
  const nextChangedKey = { key: 'b', inputValue: 'user typed Z' };
  if (nextChangedKey.key === prev.key) {
    // reuse
  } else {
    remounts += 1; // changed key → brand new element → state destroyed
  }
  const withChangedKey = remounts;

  console.log('stable key →', withStableKey, 'remount(s)');
  console.log('changed key →', withChangedKey, 'remount(s)');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Implement stableId(items): assign a stable id to any item that doesn't
// have one, WITHOUT mutating the input. A naive per-call counter is NOT
// stable — it renumbers everything every call, exactly like generating a
// key "in render" (which remounts the whole list each render). Keep a
// persistent cache (Map keyed by the item) so a given item keeps its id.
// Goal: 'ids stable across calls?' must be true.
let idSeq = 0;
function stableId(items) {
  // your code here
}

function task4() {
  const drafts = [{ text: 'a' }, { text: 'b' }];
  const first = stableId(drafts);
  const second = stableId(drafts); // same inputs — must produce the same ids
  console.log('first pass', first.map((d) => d.id).join(', '));
  console.log('second pass', second.map((d) => d.id).join(', '));
  console.log('ids stable across calls?', first[0].id === second[0].id);
  console.log('input untouched?', drafts[0].id === undefined);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
// Uniqueness is only needed AMONG SIBLINGS — the same key in two separate
// lists is fine; the same key twice in ONE list is the bug.
function countDuplicateKeys(items) {
  const seen = new Set();
  let duplicates = 0;
  for (const item of items) {
    if (seen.has(item.id)) duplicates += 1;
    seen.add(item.id);
  }
  return duplicates;
}

function task5() {
  const todos = [{ id: 'a' }, { id: 'b' }];
  const archived = [{ id: 'a' }, { id: 'c' }]; // 'a' again, different list — OK
  console.log('same key across two lists →', countDuplicateKeys(todos) + countDuplicateKeys(archived));

  const broken = [{ id: 'a' }, { id: 'a' }, { id: 'b' }]; // 'a' twice in ONE list
  console.log('duplicate key inside one list →', countDuplicateKeys(broken));
}
// task5();

module.exports = { matchByKey, stableId, countDuplicateKeys };
