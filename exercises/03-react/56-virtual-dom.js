'use strict';
// Lesson 56 — The Virtual DOM. Run with:  node exercises/03-react/56-virtual-dom.js
// Predict every output BEFORE running. Write your prediction in the comment.
// (No React required — the virtual DOM is just plain JS trees being diffed.)

// ── Task 1 ──────────────────────────────────────────────────────────
// The diff: same type + same key → reuse. Different type → replace.
// Prediction: ______________________
function task1() {
  const oldTree = [{ key: 'a', type: 'li', text: 'One' }];
  const newTree = [{ key: 'a', type: 'li', text: 'One' }];

  function diff(oldNode, newNode) {
    if (oldNode.type !== newNode.type) return 'replace';
    if (oldNode.key !== newNode.key) return 'rebuild';
    if (oldNode.text !== newNode.text) return 'updateText';
    return 'none';
  }

  console.log('same node:', diff(oldTree[0], newTree[0]));
  console.log('different text:', diff(oldTree[0], { ...newTree[0], text: 'Two' }));
  console.log('different type:', diff(oldTree[0], { type: 'div', key: 'a', text: 'One' }));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Predict the patch list when a list changes WITHOUT keys.
// Prediction: ______________________
function task2() {
  function diffLists(oldItems, newItems) {
    const patches = [];
    const len = Math.max(oldItems.length, newItems.length);
    for (let i = 0; i < len; i++) {
      const oldNode = oldItems[i];
      const newNode = newItems[i];
      if (!oldNode) patches.push(`create #${i}`);
      else if (!newNode) patches.push(`remove #${i}`);
      else if (oldNode.text !== newNode.text) patches.push(`update #${i}: '${oldNode.text}' → '${newNode.text}'`);
    }
    return patches;
  }

  // old: A B C  →  new: A C (B removed)
  const patches = diffLists(
    [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
    [{ text: 'A' }, { text: 'C' }],
  );
  console.log(patches);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// The diff always RUNS, even when nothing changed. That is the price
// of "not automatically fast". Predict what this logs.
// Prediction: ______________________
function task3() {
  // render + diff always run, even when nothing changed:
  function renderAndDiff(prev, next) {
    const patches = [];
    if (prev.text !== next.text) patches.push(`update: '${prev.text}' → '${next.text}'`);
    return patches;
  }

  const before = { text: 'Hello' };
  const after = { text: 'Hello' };      // unchanged...

  console.log('patches:', renderAndDiff(before, after));
  console.log('diff ran:', true, '— DOM work:', 0, '— the fixed cost of the virtual DOM');
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Render → diff → commit. Predict the commit steps.
// Prediction: ______________________
function task4() {
  const prev = { type: 'ul', children: ['a', 'b'] };
  const next = { type: 'ul', children: ['a', 'b', 'c'] };

  function reconcile(oldTree, newTree) {
    const commits = [];
    if (oldTree.type !== newTree.type) {
      commits.push('replace root');
      return commits;
    }
    const oldLen = oldTree.children.length;
    const newLen = newTree.children.length;
    if (newLen > oldLen) {
      for (let i = oldLen; i < newLen; i++) commits.push(`append '${newTree.children[i]}'`);
    }
    return commits;
  }

  const commits = reconcile(prev, next);
  console.log('commits:', commits);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Keys keep the diff CORRECT: reuse follows identity, not position.
// Prediction: ______________________
function task5() {
  const byKey = (nodes) => Object.fromEntries(nodes.map((n) => [n.key, n]));

  const before = [
    { key: 'a', text: 'A' },
    { key: 'b', text: 'B' },
    { key: 'c', text: 'C' },
  ];
  const after = [
    { key: 'a', text: 'A' },
    { key: 'c', text: 'C' },
    { key: 'b', text: 'B' },   // B moved, not changed
  ];

  const prev = byKey(before);
  const next = byKey(after);
  const changed = after.filter((n) => prev[n.key] && prev[n.key].text !== n.text);

  console.log('nodes that actually changed:', changed.length);
  console.log('moved-but-unchanged rows reused:', after.filter((n) => prev[n.key] && prev[n.key].text === n.text).map((n) => n.key).join(', '));
}
// task5();

module.exports = {};
