'use strict';
// Lesson 117 — Eager Loading & the N+1 Problem. Run with:  node exercises/06-laravel/117-n1-problem.js
// Predict every output BEFORE running. Write your prediction in the comment.

let queryCount = 0; // the "database" — every function call that hits data bumps this

// The posts "table".
const allPosts = [
  { id: 1, user_id: 1, title: 'A' },
  { id: 2, user_id: 1, title: 'B' },
  { id: 3, user_id: 2, title: 'C' },
  { id: 4, user_id: 4, title: 'D' },
  { id: 5, user_id: 4, title: 'E' },
];

// ── Task 1 ──────────────────────────────────────────────────────────
// The N+1 pattern: `getUsers()` runs ONE query, then the loop calls
// `getPostsFor(userId)` ONCE PER USER. For N users that's 1 + N queries.
// Run the loop, read the count, then fix it in Task 2.
function getUsers() {
  queryCount += 1; // SELECT * FROM users
  return [
    { id: 1, name: 'Mansha' },
    { id: 2, name: 'Ali' },
    { id: 3, name: 'Sara' },
    { id: 4, name: 'Huda' },
  ];
}

function getPostsFor(userId) {
  queryCount += 1; // SELECT * FROM posts WHERE user_id = ?
  return allPosts.filter((p) => p.user_id === userId);
}

// ── Task 2 ──────────────────────────────────────────────────────────
// Eager loading: fetch ALL the posts with ONE query
// (WHERE user_id IN (...)) and attach each user's posts in memory —
// N+1 becomes a flat 2 queries for any N.
function getUsersWithPosts(users) {
  // your code here
}

function task2() {
  queryCount = 0;
  const users = getUsers();
  const usersWithPosts = getUsersWithPosts(users);
  console.log('eager query count =', queryCount);
  for (const u of usersWithPosts) {
    console.log(`${u.name}: ${u.posts.length} posts`);
  }
}

// ── Task 3 ──────────────────────────────────────────────────────────
// `withCount`: a SUBQUERY that returns totals without loading the posts.
// getUsersWithPostCounts must add a `posts_count` number to every user
// while running exactly TWO queries total (one for users, one COUNT with
// an IN clause — no per-user loop).
function getUsersWithPostCounts(users) {
  // your code here
}

function task3() {
  queryCount = 0;
  const users = getUsers();
  const counted = getUsersWithPostCounts(users);
  console.log('withCount query count =', queryCount);
  for (const u of counted) {
    console.log(`${u.name}: ${u.posts_count}`);
  }
}

// ── Task 4 ──────────────────────────────────────────────────────────
// Detection: `preventLazyLoading()` — the moment a relation that was
// never eager-loaded is accessed, it THROWS. That's the dev safety net
// for N+1. Fix it by eager-loading `posts` before accessing it.
function preventLazyLoading(collection) {
  for (const u of collection) {
    Object.defineProperty(u, 'posts', {
      get() {
        throw new Error(`Lazy loading detected: posts was not eager-loaded for ${u.name}`);
      },
    });
  }
}

function task4() {
  queryCount = 0;
  const users = getUsers();
  preventLazyLoading(users);
  try {
    console.log(users[0].posts); // should throw
  } catch (err) {
    console.log('caught:', err.message);
  }
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task5() {
  queryCount = 0;
  const users = getUsers();
  for (const u of users) {
    u._posts = getPostsFor(u.id); // lazy: one query per user
  }
  const lazyTotal = queryCount;
  queryCount = 0;
  getUsersWithPosts(users); // eager: fixed
  console.log('lazy queries =', lazyTotal, '| eager queries =', queryCount);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implementation: `load()` — eager-load a relation on a collection that
// ALREADY EXISTS, using exactly ONE query for all users (no loop).
function loadPosts(users) {
  // your code here
}

function task6() {
  queryCount = 0;
  const users = getUsers(); // no with() up front — build it later
  loadPosts(users);
  console.log('load() query count =', queryCount);
  for (const u of users) {
    console.log(`${u.name}: ${u.posts.length} posts`);
  }
}
// task6();

module.exports = { getUsersWithPosts, getUsersWithPostCounts, loadPosts };
