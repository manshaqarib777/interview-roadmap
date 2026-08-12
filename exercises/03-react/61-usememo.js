'use strict';
// Lesson 61 — useMemo. Run with:  node exercises/03-react/61-usememo.js
// useMemo caches a VALUE between renders, keyed by its dependency array.
// Deps compare by REFERENCE equality (Lesson 6 / Lesson 58) — so fresh
// references defeat the cache. Predict every output BEFORE running.

// ── Task 1 ──────────────────────────────────────────────────────────
// memoize: cache by key; the REAL useMemo also compares deps by reference.
function memoize(fn) {
  const cache = new Map();
  return (key) => {
    if (!cache.has(key)) cache.set(key, fn(key));
    return cache.get(key);
  };
}

let calls = 0;
const heavy = memoize((n) => { calls += 1; return n * n; });

console.log(heavy(10));
console.log(heavy(10));
console.log(heavy(10));
console.log('calls:', calls);

// ── Task 2 ──────────────────────────────────────────────────────────
// A reference-equal dep is a cache HIT; a new-but-identical dep is a MISS.
// This is why inline objects in a dep array defeat useMemo (Lesson 6).
// Prediction: ______________________
const a = { items: [1, 2, 3] };
const b = a;                 // same reference → cache hit
const c = { items: [1, 2, 3] }; // same contents, NEW reference → cache miss

const seen = new Set();

function memoCompute(key) {
  if (!seen.has(key)) {
    seen.add(key);
    return `computed ${key.items.reduce((s, n) => s + n, 0)}`;
  }
  return `reused ${key.items.reduce((s, n) => s + n, 0)}`;
}

console.log(memoCompute(a));
console.log(memoCompute(b));
console.log(memoCompute(c));
console.log('distinct entries cached:', seen.size);

// ── Task 3 ──────────────────────────────────────────────────────────
// Emulate useMemo's deps check with Object.is. Prediction: ______________
const lastDeps = [];

function useMemoEmu(factory, deps) {
  const prev = lastDeps[0];
  const same = prev && deps.length === prev.length && deps.every((d, i) => Object.is(d, prev[i]));

  if (!same || !prev) {
    lastDeps[0] = deps;
    lastDeps[1] = factory();
  }
  return lastDeps[1];
}

let count = 0;
const dep = 42; // primitive — compares by VALUE

const v1 = useMemoEmu(() => { count += 1; return `expensive ${count}`; }, [dep]);
const v2 = useMemoEmu(() => { count += 1; return `expensive ${count}`; }, [42]); // same value
const v3 = useMemoEmu(() => { count += 1; return `expensive ${count}`; }, [43]); // changed

console.log(v1, v2, v3, '| total computations:', count);

// ── Task 4 ──────────────────────────────────────────────────────────
// Deps are compared ELEMENT-WISE with Object.is. A dep array is a HIT when
// every element is reference-equal to last render's — new primitives hit,
// but a NEW OBJECT as an element misses. Prediction: ______
const lastDeps2 = [];

function useMemoEmu4(factory, deps) {
  const prev = lastDeps2[0];
  const same = prev && deps.length === prev.length && deps.every((d, i) => Object.is(d, prev[i]));

  if (!same || !prev) {
    lastDeps2[0] = deps;
    lastDeps2[1] = factory();
  }
  return lastDeps2[1];
}

let count2 = 0;
const obj = { id: 1 };

// each call passes a NEW dep-array literal, but the ELEMENT is the same ref
const p1 = useMemoEmu4(() => { count2 += 1; return `v${count2}`; }, [obj]);
const p2 = useMemoEmu4(() => { count2 += 1; return `v${count2}`; }, [obj]); // HIT
const p3 = useMemoEmu4(() => { count2 += 1; return `v${count2}`; }, [{ id: 1 }]); // MISS — new object

console.log('values:', p1, p2, p3);
console.log('computations (2 = fresh object missed):', count2);

// ── Task 5 ──────────────────────────────────────────────────────────
// A memo cache holding a value that the code MUTATES is corrupted.
// Why is mutating a memoized value dangerous? Prediction: ______________
const memo = { value: null, deps: [], ready: false };

function useMemoEmu2(factory, deps) {
  const prev = memo.deps;
  const same =
    memo.ready && deps.length === prev.length && deps.every((d, i) => Object.is(d, prev[i]));
  if (!same) {
    memo.ready = true;
    memo.deps = deps;
    memo.value = factory();
  }
  return memo.value;
}

let made = 0;
const first = useMemoEmu2(() => { made += 1; return { theme: 'dark' }; }, []);
first.theme = 'light'; // ❌ mutating the cached value
const second = useMemoEmu2(() => { made += 1; return { theme: 'dark' }; }, []);

console.log('second.theme:', second.theme);
console.log('factory ran how many times?', made);

// ── Task 6 ──────────────────────────────────────────────────────────
// A small useMemo emulator for expensive SORT work: the cached value is
// reused when the dep reference is unchanged. Complete makeSortMemo.
function makeSortMemo() {
  let deps = null;
  let value = null;
  let computations = 0;

  return {
    get: function (fn, nextDeps) {
      const same =
        deps && nextDeps.length === deps.length && nextDeps.every((d, i) => Object.is(d, deps[i]));
      if (!same) {
        deps = nextDeps;
        value = fn();
        computations += 1;
      }
      return value;
    },
    computations: () => computations,
  };
}

function task6() {
  const memo = makeSortMemo();
  const sortItems = (items) => [...items].sort((x, y) => x.name.localeCompare(y.name));

  const itemsA = [{ name: 'b' }, { name: 'a' }];
  const itemsB = itemsA; // same reference → cache HIT
  const itemsC = [{ name: 'b' }, { name: 'a' }]; // new reference → cache MISS

  const r1 = memo.get(() => sortItems(itemsA), [itemsA]);
  const r2 = memo.get(() => sortItems(itemsB), [itemsB]);
  const r3 = memo.get(() => sortItems(itemsC), [itemsC]);

  console.log('sorted:', r1.map((i) => i.name).join(','), '|', r2.map((i) => i.name).join(','), '|', r3.map((i) => i.name).join(','));
  console.log('sort ran N times (2 = miss on C):', memo.computations());
}
task6();

module.exports = { memoize, makeSortMemo };
