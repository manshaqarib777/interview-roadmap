# Topic 10 — Eager Loading

**Checklist anchor:** lazy vs eager · `with()` · `load()` · `loadMissing()` · nested · conditional

**Owning lesson:** [117 Eager Loading & the N+1 Problem](../117-n1-problem.md)

---

## The one-sentence answer

**Eager loading fetches a model's relationships in the same query batch — `User::with('posts')->get()` does 2 queries instead of N+1.**

## The mental model

Compare the two:

```php
User::with('posts')->get();
// 1 query for users, 1 query for ALL their posts (WHERE user_id IN ...)
```

vs:

```php
User::all();
// 1 query for users, then one MORE query per user when you touch ->posts
```

The `with()` version turns **N+1 queries into 2**. The relationship is fetched once, in a single `WHERE user_id IN (...)` query, and Laravel stitches the results together in memory.

## How it works

### The two-phase fetch

```php
$users = User::with('posts')->get();
// phase 1: select * from users
// phase 2: select * from posts where user_id in (1, 2, 3, ...)
```

Now `$user->posts` is already loaded — no query fires when you access it.

### The tools

| Tool | What it does |
|---|---|
| `with('posts')` | Eager-load at query time |
| `with(['posts', 'profile'])` | Multiple relations |
| `with('posts.comments')` | **Nested** — posts and their comments |
| `load('posts')` | Eager-load on an **existing** collection/model |
| `loadMissing('posts')` | Load only if **not already loaded** |
| `loadCount('posts')` | Load `posts_count` without the collection |
| Conditional | `with($someCondition ? ['posts'] : [])` |

### Nested eager loading

```php
User::with('posts.comments')->get();
// users → posts (IN) → comments (IN) = 3 queries total, however deep
```

### Lazy eager loading

```php
$users = User::all();              // users only
$users->load('posts');             // NOW load all their posts (2 queries total)
$users->loadMissing('profile');    // only if not already loaded
```

### Conditional

```php
$users = User::with($includeProfile ? 'profile' : [])->get();
// or
$users->loadMissing('profile');
```

## The plain-JS model (what the exercise does)

```js
// WITHOUT with(): 1 + N queries
const users = User::all();            // 1
for (const u of users) u.posts;       // +1 each → N+1 total

// WITH with():  2 queries
const users = User::with('posts').get(); // 1 + 1 (WHERE user_id IN (...))
```

## Interview questions

**Q1. What is eager loading?**
> Fetching a model's relationships in the same operation, using a single `IN` query, so accessing the relationship doesn't trigger per-model queries. `User::with('posts')->get()` runs two queries total instead of one-plus-one-per-user.

**Q2. `with()` vs `load()`?**
> `with()` declares eager loads at query time — `User::with('posts')->get()`. `load()` adds eager loads to an already-fetched model or collection — `$users->load('posts')`. `loadMissing()` only loads what isn't already loaded, avoiding redundant queries.

**Q3. What's nested eager loading?**
> Loading relationships of relationships — `with('posts.comments')` fetches users, their posts, and the posts' comments in three queries total. The dot syntax is the path through the relationship tree.

**Q4. When does eager loading NOT help?**
> When you access a relationship on a single model (there's no N to save), when you filter *by* the relationship (use `whereHas`), or when you only need counts (`withCount` — don't hydrate the whole relation). Eager loading solves the loop-N+1, not every query shape.

**Q5. How do you detect a missing eager load?**
> Watch the query log — every `select * from posts where user_id = ?` in a loop is the smell — or use Laravel's N+1 detection: with `Model::preventLazyLoading()` in development, lazy access throws an exception so you find it before it ships.

**Senior follow-up: `withCount` vs `with` — when do you pick which?**
> `withCount('posts')` adds a `posts_count` column when you only need the number — no collection hydration. `with('posts')` loads the actual models when you need them. The rule: don't hydrate what you won't render.

## Common mistakes

❌ Lazy-loading in a loop — the N+1 itself.

❌ Eager-loading relationships you never use — wasted queries.

❌ `whereHas` confusion — filtering *by* a relationship is `whereHas`, not eager loading.

❌ Over-eager-loading deep trees — `with('posts.comments.author')` can fetch more than the view needs.

## Quick revision notes

- Eager loading = **relationship fetched with an `IN` query, not per-model**
- `with()` at query time · `load()` on existing · `loadMissing()` only-if-absent
- **Nested** via dots: `with('posts.comments')`
- `withCount()` for counts — don't hydrate what you won't render
- `preventLazyLoading()` in dev **catches** the N+1 before it ships

## Check your understanding

1. How many queries does `User::with('posts')->get()` run, and why?
2. `with` vs `load` vs `loadMissing` — when is each right?
3. What does `with('posts.comments')` fetch, and in how many queries?
4. When is eager loading the wrong tool?
5. How would you detect an N+1 in a codebase?
