'use strict';
// Lesson 116 — Eloquent Relationships. Run with:  node exercises/06-laravel/116-eloquent-relationships.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// A foreign key is a REFERENCE (not a copy): `posts.user_id` points at a
// user's id. Deleting the user must NOT change what the post references
// — fix the snapshot bug below.
const users = [
  { id: 1, name: 'Mansha' },
  { id: 2, name: 'Ali' },
  { id: 3, name: 'Sara' },
];

const posts = [
  { id: 1, title: 'Hello', user_id: 1 },
  { id: 2, title: 'World', user_id: 2 },
];

function deleteUser(userId) {
  // your code here
}

// ── Task 2 ──────────────────────────────────────────────────────────
// hasMany / belongsTo: `postsFor(userId)` returns the many posts whose
// user_id matches; `userFor(postId)` returns the ONE user a post belongs
// to. (One rule: the table holding the FK is the belongsTo side.)
function makeBlogRelations(users, posts) {
  return {
    postsFor(userId) {
      // your code here
    },
    userFor(postId) {
      // your code here
    },
  };
}

// ── Task 3 ──────────────────────────────────────────────────────────
// belongsToMany with a pivot: a user has many roles, a role has many
// users, and role_user PAIRS them. Implement rolesFor(userId) so each
// role gets a `pivot` property holding { user_id, role_id }.
const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Editor' },
  { id: 3, name: 'Viewer' },
];

const pivot = [
  { user_id: 1, role_id: 1 },
  { user_id: 1, role_id: 2 },
  { user_id: 2, role_id: 2 },
];

function makeManyToMany(roles, pivot) {
  return {
    rolesFor(userId) {
      // your code here
    },
  };
}

// ── Task 4 ──────────────────────────────────────────────────────────
// Polymorphic: comments belong to EITHER a post OR a video via
// commentable_type + commentable_id. Given the parent type and id,
// return its comments (both fields must match).
const comments = [
  { id: 1, body: 'nice', commentable_type: 'Post', commentable_id: 2 },
  { id: 2, body: 'cool', commentable_type: 'Video', commentable_id: 5 },
  { id: 3, body: 'wow', commentable_type: 'Post', commentable_id: 2 },
];

function commentsFor(comments, type, id) {
  // your code here
}

// ── Task 5 ──────────────────────────────────────────────────────────
// hasManyThrough: a country has many posts THROUGH its users.
// postsForCountry(countryId) must return only posts whose author
// (via user_id) belongs to that country — the middle table joins them.
const countryUsers = [
  { id: 1, country_id: 1 }, // Mansha → country 1
  { id: 2, country_id: 2 }, // Ali    → country 2
];

const userPosts = [
  { id: 1, user_id: 1 },
  { id: 2, user_id: 1 },
  { id: 3, user_id: 2 },
];

function postsForCountry(countryId) {
  // your code here
}

// ── Task 6 ──────────────────────────────────────────────────────────
// Prediction: ______________________
function task6() {
  const rel = makeBlogRelations(users, posts);
  console.log(rel.postsFor(1).map((p) => p.title));
  console.log(rel.userFor(2).name);
  console.log(makeManyToMany(roles, pivot).rolesFor(1).map((r) => `${r.name}:${r.pivot.role_id}`));
}
// task6();

module.exports = { deleteUser, makeBlogRelations, makeManyToMany, commentsFor, postsForCountry };
