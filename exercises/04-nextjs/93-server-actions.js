'use strict';
// Lesson 93 — Server Actions. Run with:  node exercises/04-nextjs/93-server-actions.js
// Predict every output BEFORE running. Write your prediction in the comment.

// Server Actions are async functions the client can call by reference.
// These tasks simulate the contract in plain Node: an action table, a
// serializer that rejects non-serialisable values, and a cache layer
// driven by revalidatePath / revalidateTag.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________
const DIRECTIVES = ['use server', 'use client'];

function task1() {
  const isServerAction = DIRECTIVES.includes('use server');
  console.log('server action file?', isServerAction);
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// FormData.get() returns the value for a named field. Implement a tiny
// formData parser that returns a plain object.
function formToObject(entries) {
  // your code here:  formToObject([['title','Hi'],['done','false']]) → { title:'Hi', done:'false' }
  return {};
}

function task2() {
  const obj = formToObject([['title', 'Buy milk'], ['done', 'false']]);
  console.log(obj.title, obj.done);
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Serialisation: server actions only accept serialisable values.
// Implement the check — reject Date/Map/class instances, allow the rest.
function serialisable(value) {
  // your code here
  return true;
}

function task3() {
  console.log(serialisable({ id: 1 }), serialisable(new Date()));
  console.log(serialisable([1, 2, 3]), serialisable(new Map()));
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// revalidatePath / revalidateTag mark cached data stale. Build the
// cache layer: every entry gets a path and a tag; invalidating one
// marks exactly the matching entries dirty.
function makeCache() {
  const entries = new Map();
  return {
    set(path, tag, value) {
      entries.set(path, { tag, value, dirty: false });
    },
    get(path) {
      return entries.get(path) ?? null;
    },
    revalidatePath(path) {
      // your code here
    },
    revalidateTag(tag) {
      // your code here
    },
  };
}

function task4() {
  const cache = makeCache();
  cache.set('/posts', 'posts', ['post-1', 'post-2']);
  cache.set('/profile', 'user:1', { name: 'Ali' });
  cache.revalidatePath('/posts');
  console.log(cache.get('/posts').dirty, cache.get('/profile').dirty);
  cache.set('/posts', 'posts', ['post-1', 'post-2']);
  cache.revalidateTag('posts');
  console.log(cache.get('/posts').dirty, cache.get('/profile').dirty);
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________
async function task5() {
  const cache = { posts: ['post-1'] };
  const revalidatePath = () => {
    cache.posts = ['post-1', 'post-2'];
  };

  await Promise.resolve(); // "the action runs"
  revalidatePath();
  console.log(cache.posts);
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// `useActionState` returns [state, action, pending]. Wire a mini version
// that tracks pending while the action runs.
function useActionState(action, initial) {
  let state = initial;
  let pending = false;
  return {
    get state() {
      return state;
    },
    get pending() {
      return pending;
    },
    async run(form) {
      pending = true;
      try {
        state = await action(form);
      } finally {
        pending = false;
      }
      return state;
    },
  };
}

async function task6() {
  const form = useActionState(async (data) => {
    await new Promise((r) => setTimeout(r, 10));
    return { ok: true, title: data.get('title') };
  }, null);

  console.log('before:', form.pending, form.state);
  await form.run(new Map([['title', 'Buy milk']]));
  console.log('after:', form.pending, form.state);
}
// task6();

module.exports = { formToObject, serialisable, makeCache };
