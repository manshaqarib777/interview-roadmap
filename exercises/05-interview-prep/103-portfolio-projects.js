'use strict';
// Lesson 103 — Portfolio Projects. Run with:  node exercises/05-interview-prep/103-portfolio-projects.js
// Predict every output BEFORE running. Write your prediction in the comment.

// ── Task 1 ──────────────────────────────────────────────────────────
// The scoping rule: "cut until it fits, then cut one more."
// Given a list of planned features, budget, and the effort of each feature,
// return the list of features that fit within the budget (in any order),
// cutting the LARGEST feature first until the rest fit.
// Prediction: ______________________
function scopeByBudget(features, budget) {
  const total = features.reduce((s, f) => s + f.effort, 0);
  if (total <= budget) return features.map((f) => f.name);

  const sorted = [...features].sort((a, b) => b.effort - a.effort);
  let used = total;
  const kept = [];
  for (const f of sorted) {
    if (used - f.effort <= budget) {
      used -= f.effort;
    } else {
      kept.push(f.name);
    }
  }
  return kept;
}

const features = [
  { name: 'signup', effort: 3 },
  { name: 'rbac', effort: 5 },
  { name: 'audit log', effort: 4 },
  { name: 'oauth linking', effort: 6 },
  { name: 'dark mode', effort: 1 },
];
// console.log(scopeByBudget(features, 12));

// ── Task 2 ──────────────────────────────────────────────────────────
// The RBAC decision table from Lesson 103, as data.
// Implement `can(role, action)` so admin can do everything, editor can
// read+write, viewer can only read, and unknown roles can do nothing.
// Prediction: ______________________
const PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'audit'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

function can(role, action) {
  // your code here
  return false;
}

// console.log(can('admin', 'delete'));  // must be true
// console.log(can('viewer', 'write'));  // must be false
// console.log(can('ghost', 'read'));    // must be false

// ── Task 3 ──────────────────────────────────────────────────────────
// A portfolio README explains DECISIONS, not instructions.
// Write `decisionLine(feature, reason)` so it formats as:
//   "CUT oauth linking — account linking doubles the auth surface."
// Prediction: ______________________
function decisionLine(feature, reason) {
  // your code here
  return '';
}

// console.log(decisionLine('oauth linking', 'account linking doubles the auth surface'));

// ── Task 4 ──────────────────────────────────────────────────────────
// Three projects, one skill cluster each. Map each project to what it proves.
// Prediction: ______________________
const projectClaims = {
  'auth dashboard': 'identity, security, visualisation',
  'e-commerce store': 'data modelling, transactions, optimistic UI',
  'ai saas app': 'streaming, async systems, rate limiting',
};

function claimFor(project) {
  return projectClaims[project] ?? 'unknown';
}

// console.log(claimFor('e-commerce store'));
// console.log(claimFor('portfolio site'));

// ── Task 5 ──────────────────────────────────────────────────────────
// "Three production-quality projects beat twenty tutorials."
// Given a list of repos, classify each as 'finished' (has a README with
// a decision section AND a deployment URL) or 'tutorial' otherwise.
// Prediction: ______________________
function classifyRepo(repo) {
  const hasReadme = typeof repo.readme === 'string' && repo.readme.includes('## Scope');
  const deployed = typeof repo.url === 'string' && repo.url.startsWith('https://');
  return hasReadme && deployed ? 'finished' : 'tutorial';
}

const repos = [
  { name: 'auth-dashboard', readme: '# Auth\n\n## Scope\n\n**In:** signup, rbac', url: 'https://auth-dash.vercel.app' },
  { name: 'todo-tutorial', readme: '# Todo app from course part 4', url: '' },
];
// console.log(repos.map(classifyRepo));

// ── Task 6 ──────────────────────────────────────────────────────────
// The two-minute walkthrough pitch, as a fill-in.
// Implement `pitch(project, claim)` so it returns:
//   "PROJECT: auth dashboard — identity, security, visualisation. I chose X because…"
// Prediction: ______________________
function pitch(project, claim) {
  // your code here
  return `${project} — ${claim}. I chose the stack because…`;
}

// console.log(pitch('auth dashboard', claimFor('auth dashboard')));

module.exports = { scopeByBudget, can, decisionLine, claimFor, classifyRepo, pitch };
