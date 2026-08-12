'use strict';
// Lesson 127 — Caching & Redis. Run with:  node exercises/06-laravel/127-caching-redis.js
// Plain Node: a cache simulator for Laravel's Cache::remember(key, ttl, fn)
// (miss → compute → store · hit → return · TTL expiry · forget · tags).
// Predict BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// Implement remember(): given a cache map, a key, a TTL (seconds) and a
// producer fn — on a MISS call producer() and store { value, expiresAt },
// on a HIT return the stored value WITHOUT calling producer().
// Count producer calls with hits.
let hits1 = 0;
function remember(cache, key, ttl, producer, now) {
  // your code here
}

function task1() {
  const cache = new Map();
  const now = () => 0;
  const getUsers = () => {
    hits1 += 1;
    return `users@t=${now()}`;
  };

  console.log(remember(cache, 'users', 3600, getUsers, now)); // cold → compute
  console.log(remember(cache, 'users', 3600, getUsers, now)); // t=0 → hit
  console.log(remember(cache, 'users', 3600, getUsers, now)); // t=0 → hit
  console.log('producer calls:', hits1);                       // must be 1
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// TTL expiry: once `now` passes the stored expiresAt, the entry is a MISS
// again — producer() runs once more and the entry gets a NEW expiry.
let hits2 = 0;
function rememberTtl(cache, key, ttl, producer, now) {
  // your code here
}

function task2() {
  const cache = new Map();
  let t = 0;
  const now = () => t;
  const load = () => {
    hits2 += 1;
    return `value@t=${t}`;
  };

  console.log(rememberTtl(cache, 'stats', 60, load, now)); // t=0  → compute
  console.log(rememberTtl(cache, 'stats', 60, load, now)); // t=30 → hit
  t = 61;                                                   // past the 60s TTL
  console.log(rememberTtl(cache, 'stats', 60, load, now)); // t=61 → compute again
  console.log(rememberTtl(cache, 'stats', 60, load, now)); // t=61 → hit (new expiry)
  console.log('producer calls:', hits2);                    // must be 2
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// forget(): remove ONE key. The next read for that key is a miss again.
// Other keys stay cached.
let hits3 = 0;
function rememberForget(cache, key, ttl, producer, now) {
  // your code here
}

function task3() {
  const cache = new Map();
  const now = () => 0;
  const load = (name) => {
    hits3 += 1;
    return `${name}@t=0`;
  };

  console.log(rememberForget(cache, 'a', 3600, () => load('a'), now)); // miss → 'a@t=0'
  console.log(rememberForget(cache, 'b', 3600, () => load('b'), now)); // miss → 'b@t=0'
  cache.delete('a');                                                    // ← the invalidation
  console.log(rememberForget(cache, 'a', 3600, () => load('a'), now)); // miss again → 'a@t=0'
  console.log(rememberForget(cache, 'b', 3600, () => load('b'), now)); // HIT → 'b@t=0'
  console.log('producer calls:', hits3);                                // must be 3
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Tags (Redis/Memcached only): entries are stored with a list of tags.
// tagsFlush(tags) removes EVERY entry that has ANY of those tags — the
// group dies together, like Cache::tags(['users'])->flush().
// Hint: store each entry as { value, expiresAt, tags } and keep an
// index map from tag → Set of keys.
function makeTaggedCache() {
  const store = new Map();     // key → { value, expiresAt, tags }
  const index = new Map();     // tag → Set<key>
  const now = () => 0;

  return {
    now,
    get(key) {
      // your code here
    },
    put(key, value, tags) {
      // your code here
    },
    tagsFlush(tags) {
      // your code here
    },
  };
}

function task4() {
  const c = makeTaggedCache();
  c.put('users:count', 3, ['users']);
  c.put('users:admins', ['ada'], ['users']);
  c.put('posts:recent', ['hello'], ['posts']);
  console.log('before flush:', c.get('users:count'), c.get('posts:recent')); // 3 'hello'
  c.tagsFlush(['users']);                                                    // users group dies
  console.log('after flush:', c.get('users:count'), c.get('users:admins'));  // undefined undefined
  console.log('posts survived:', c.get('posts:recent'));                     // 'hello'
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Invalidation on write: the senior pattern from Lesson 127. When a user
// is "created", the users tag must be flushed inside the same step, so the
// very next read recomputes. Count producer calls.
let hits5 = 0;
function createUserSim(now) {
  const cache = new Map();
  const index = new Map(); // tag → Set<key>
  let users = ['ada'];

  function getUsers() {
    // your code here — remember('users:all', 3600, ...) + tags
  }
  function addUser(name) {
    // your code here — push, then flush the 'users' tag (no stale reads!)
  }
  return { getUsers, addUser };
}

function task5() {
  let t = 0;
  const sim = createUserSim(() => t);
  console.log(sim.getUsers()); // miss → compute (['ada'])
  console.log(sim.getUsers()); // hit
  sim.addUser('grace');        // write → tag flush
  console.log(sim.getUsers()); // miss again → fresh (['ada','grace'])
  console.log('producer calls:', hits5); // must be 2 — never served stale after a write
}
// task5();

module.exports = { remember, rememberTtl, rememberForget, makeTaggedCache, createUserSim };
