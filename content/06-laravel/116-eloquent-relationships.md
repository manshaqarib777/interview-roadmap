# Lesson 116 — Eloquent Relationships

**Interview importance:** ⭐⭐⭐⭐⭐ — the second-most-common Eloquent topic, and the one that
separates "knows Eloquent" from "has actually modelled a domain".

Every interview data question comes down to picking the *right* relationship shape. Given a
User and a Post, is it `hasMany` or `hasOne`? Where does the foreign key live? Is `Doctor`
↔ `Patient` many-to-many with a pivot, or `hasManyThrough`? The answers are mechanical — one
rule about foreign keys covers half of them.

Relationships are where Eloquent earns its keep. You write `$user->posts` and Eloquent
decides the join, the foreign key, the pivot table and the SQL — so an interview about
relationships is really an interview about **mapping shapes to SQL**.

## Learning Objectives

By the end of this lesson you should be able to:

- Apply the "which side has the foreign key" rule to any pair of models
- Tell `hasOne` from `belongsTo` — and explain *why* the ownership side differs
- Model a many-to-many with a pivot table, and name the pivot's default columns
- Explain `hasManyThrough` with a diagram, and when it beats a join
- Use polymorphic `morphMany` / `morphTo` for comments on posts *and* videos
- Say what a pivot table is, what a polymorphic relationship is, and when to reach for
  `hasManyThrough`

## 1. What are Eloquent Relationships?

Relationships define how rows in one table reference rows in another — the foreign keys —
and then wrap that in methods so `$user->posts` *is* the query.

```php
class User extends Model
{
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);   // posts.user_id = users.id
    }
}

$posts = $user->posts;     // lazy-loads ALL of that user's posts
```

The method return type names the relationship class (`HasMany`, `BelongsTo`, `BelongsToMany`,
…). Eloquent's convention for the foreign key is the **owner's table name + `_id`** —
`posts.user_id`, `comments.post_id` — which is why a single method usually needs no
arguments at all.

```text
   users          posts
   ┌─────┐        ┌──────────┐
   │ id  │◄───────│ user_id  │   foreign key lives on posts
   └─────┘        └──────────┘
    1  …              1  …
    2  …              1  …      two posts, one user → hasMany
```

## 2. Mental Model

**Relationships are just the foreign key, read from the correct side.** One rule decides
almost everything:

> **The table that owns the foreign key is the `belongsTo` side; the other side is
> `hasOne`/`hasMany`.**

`posts.user_id` points at `users.id`, so `Post belongsTo User` and `User hasMany Post`.
That single rule gets you through one-to-one, one-to-many, and most of many-to-many.

| Shape | Methods | Where the FK lives |
|---|---|---|
| One-to-one | `hasOne` / `belongsTo` | On the dependent table (e.g. `profiles.user_id`) |
| One-to-many | `hasMany` / `belongsTo` | On the many-side table (`posts.user_id`) |
| Many-to-many | `belongsToMany` ×2 | Nowhere — a **pivot table** holds both keys |
| Through | `hasManyThrough` | On the middle table, then on the far table |
| Polymorphic | `morphMany` / `morphTo` / `morphToMany` | On the child, as `*_type` + `*_id` |

## 3. Visual Flow

```text
                $user->posts
                     │
                     ▼
        Eloquent reads the relationship definition
        ┌────────────────────────────────────────┐
        │  hasMany(Post::class)                  │
        │  → FK: posts.user_id                   │
        │  → own key: users.id                   │
        └────────────────────────────────────────┘
                     │
                     ▼
        query builder          ┌───────────────┐
        posts WHERE user_id = ?│  lazy → runs NOW │
        └──────────────────────┴───────────────┘
                     │
                     ▼
        Collection<Post>   ← the one user's posts
```

Accessing the property runs the query **at that moment** — that's lazy loading, and it's
exactly what Lesson 117 turns into the N+1 problem.

## 4. How it Works: One-to-One — `hasOne` / `belongsTo`

Profile and User: a user has one profile, a profile belongs to one user.

```php
class User extends Model
{
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);   // profiles.user_id
    }
}

class Profile extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);   // profiles.user_id
    }
}
```

Migration — the foreign key lives on the **profile** table:

```php
Schema::create('profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('avatar_url')->nullable();
    $table->timestamps();
});
```

Generated SQL when you access it:

```text
SELECT * FROM profiles WHERE profiles.user_id = 1 LIMIT 1
```

> [!TIP]
> **Which side is `hasOne`, which is `belongsTo`?** The side that *holds the foreign key*
> (`profiles`) is `belongsTo`. The side that merely references it (`users`) is `hasOne`.
> "Has" always means "I don't carry the key — the other table points at me."

## 5. How it Works: One-to-Many — `hasMany` / `belongsTo`

The most common shape in an interview: posts on a blog.

```php
class User extends Model
{
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);    // posts.user_id
    }
}

class Post extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);  // posts.user_id
    }
}
```

Migration — many-side table `posts` carries the key:

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('body');
    $table->timestamps();
});
```

Generated SQL:

```text
SELECT * FROM posts WHERE posts.user_id = 1
```

`cascadeOnDelete` is the interview-worthy detail: deleting the user deletes their posts —
the database enforces it, Eloquent never has to.

## 6. How it Works: Many-to-Many — `belongsToMany` and the Pivot

User and Role: many users, many roles, a user can hold several roles and a role can be held
by several users. The foreign key *can't* live on either table — it lives on a **pivot
table** that pairs the two primary keys.

```php
class User extends Model
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);   // role_user table
    }
}

class Role extends Model
{
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

Pivot migration — a table whose name is the **two table names, alphabetically, singular**,
joined by an underscore: `role_user`. Its only job is to hold both foreign keys:

```php
Schema::create('role_user', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('role_id')->constrained()->cascadeOnDelete();
    $table->timestamps();
});
```

```text
   users            role_user (pivot)         roles
   ┌─────┐          ┌───────────────┐         ┌──────┐
   │ id  │◄─────────│ user_id role_id│────────►│  id  │
   └─────┘          └───────────────┘         └──────┘
    1                (1, 2)  (2, 3)             2      users 1 & 2 share role 2
```

Generated SQL for `$user->roles` — a two-table join:

```text
SELECT roles.*, role_user.user_id AS pivot_user_id,
       role_user.role_id AS pivot_role_id
FROM roles
INNER JOIN role_user ON roles.id = role_user.role_id
WHERE role_user.user_id = 1
```

The extra `pivot_*` columns are Eloquent attaching the pivot row to each role, available as
`$role->pivot`. Custom pivot columns (`assigned_at`, `level`) go in a third argument and
`withPivot()`:

```php
return $this->belongsToMany(Role::class)
            ->withPivot('level')
            ->withTimestamps();

$user->roles->first()->pivot->level;   // reads the pivot's extra column
```

> [!NOTE]
> Every relationship question about "users can have many roles" or "students and courses"
> is this one. Say the words *pivot table* and you've answered the model half; say *composite
> foreign keys on the pivot* and you've answered the schema half.

## 7. How it Works: `hasManyThrough` — the Middle Table

A country has many posts, through the users who wrote them. Country → User → Post, where the
Country table never touches the Post table at all.

```php
class Country extends Model
{
    public function posts(): HasManyThrough
    {
        return $this->hasManyThrough(
            Post::class,      // the far model
            User::class,      // the middle model
            'country_id',     // FK on users
            'user_id',        // FK on posts
        );
    }
}
```

```text
   countries       users            posts
   ┌─────────┐    ┌────────────┐    ┌──────────┐
   │ id      │    │ id         │    │ id       │
   └─────────┘    │ country_id │◄───│ user_id  │
     1            └────────────┘    └──────────┘
        └─────────  users in country 1  ─────────┘
                          └── posts by those users ──┘
```

Generated SQL — Eloquent joins through the middle table for you:

```text
SELECT posts.*
FROM posts
INNER JOIN users ON users.id = posts.user_id
WHERE users.country_id = 1
```

**When does `hasManyThrough` win?** Whenever the relationship reads "X has many Y through Z",
and you'd otherwise write two queries or a hand-rolled join in a controller. It keeps the
relationship in the model, where it belongs.

> [!PITFALL]
> The middle table (users) can't soft-delete with the default setup — the join in
> `hasManyThrough` is a plain `INNER JOIN`, so a soft-deleted user drops their posts from the
> result even though they still exist. That's a classic subtle bug in report queries.

## 8. How it Works: Polymorphic Relationships — `morphMany` / `morphTo`

One comments table serving **many different parents** — posts *and* videos. A normal foreign
key can't point at two tables, so the child stores *two* columns: the parent's table
(`commentable_type`) and the parent's id (`commentable_id`).

```php
class Comment extends Model
{
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

class Video extends Model
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

Migration — no `post_id`, no `video_id`; instead the two morph columns, plus an index on both
together:

```php
Schema::create('comments', function (Blueprint $table) {
    $table->id();
    $table->morphs('commentable');          // commentable_type + commentable_id
    $table->text('body');
    $table->timestamps();
});
```

```text
   posts            comments              videos
   ┌─────┐    ┌──────────────────────┐    ┌──────┐
   │ id  │◄───│ commentable_type     │───►│  id  │
   └─────┘    │ commentable_id       │    └──────┘
     2        └──────────────────────┘
              (App\Models\Post, 2)          ← row 2 of posts
              (App\Models\Video, 5)         ← row 5 of videos
```

Generated SQL for `$post->comments` — a WHERE on *both* morph columns:

```text
SELECT * FROM comments
WHERE commentable_type = 'App\Models\Post'
  AND commentable_id = 2
```

`morphToMany` extends the idea to many-to-many with a **polymorphic pivot** — e.g. tags
shared by posts and videos via a `taggables` pivot that stores `tag_id` plus
`taggable_type`/`taggable_id`. And `morphOne` is the one-to-one version of the same shape: a
user has one `image` (`morphOne`), while the image table stores `imageable_type` +
`imageable_id` so it can also serve products — same two-column trick, `LIMIT 1` on read.

> [!TIP]
> Interview phrasing to have ready: *"A polymorphic relationship lets one child table belong
> to several parent models by storing the parent's class and id instead of a fixed foreign
> key."* The trade-off — no FK constraint and no join through a single parent — is the senior
> caveat to add.

## 9. Real Project Usage

A typical Laravel app uses four of these in one screen — and this is a realistic answer to
"how do you model that?":

```php
class User extends Model
{
    public function posts(): HasMany { return $this->hasMany(Post::class); }
}

class Post extends Model
{
    public function user(): BelongsTo       { return $this->belongsTo(User::class); }
    public function tags(): BelongsToMany   { return $this->belongsToMany(Tag::class); }
    public function comments(): MorphMany   { return $this->morphMany(Comment::class, 'commentable'); }
}

class Comment extends Model
{
    public function commentable(): MorphTo  { return $this->morphTo(); }
}
```

## 10. Interview Explanation

> Eloquent relationships turn foreign keys into methods, so `$user->posts` is a query. The
> rule that decides which method to use is: the table that holds the foreign key is
> `belongsTo`, the other side is `hasOne` or `hasMany`. For many-to-many, neither table can
> hold a single foreign key, so a pivot table stores both — that's `belongsToMany`.
>
> `hasManyThrough` models "X has many Y through Z" with a single query and a join, and
> polymorphic `morphMany`/`morphTo` let one child table (comments) belong to many different
> parents (posts, videos) by storing the parent's class and id. Each one is a different shape
> of the same idea: let the foreign key tell you which relation it is.

## 11. Senior-Level Insights

- **The foreign key is the source of truth.** Seniors don't memorise `hasOne` vs `belongsTo`
  — they look at the schema and say "the FK is on profiles, so profile belongsTo user".
  Name the rule, then apply it to the interviewer's tables.
- **`cascadeOnDelete` vs null-on-delete is a data decision.** Deleting a user should delete
  their comments (cascade) but *keep* the order history with a nulled `user_id`
  (`nullOnDelete`). Choosing correctly is a senior signal.
- **Pivots can be first-class models.** When a pivot carries real data (`role_user.level`,
  `order_product.quantity`), `belongsToMany` with `withPivot()` is fine — when the pivot
  becomes a thing of its own (an enrolment with a grade and a date), it should become its own
  model with `hasMany` on both sides. That's the "extend the pivot" answer.
- **Polymorphic morphs have a real cost.** No foreign-key constraint means orphaned
  `commentable_id`s, and every query scans the `_type` string. Only use polymorphic when the
  parent set is genuinely open — for a fixed parent, use a real FK.
- **The difference between relationships is SQL, not magic.** `hasMany` is `WHERE user_id =`,
  `belongsToMany` is a join, `hasManyThrough` is a join through a middle table, `morphMany`
  is `WHERE type AND id`. Say the SQL out loud and the abstraction stops being mysterious.

## 12. Common Mistakes

- ❌ **Getting `hasOne`/`belongsTo` backwards** — the FK lives on the `belongsTo` side;
  `hasOne` never carries the key.
- ❌ **Naming the pivot table wrong** — it's the two *singular* table names in alphabetical
  order: `role_user`, not `roles_users`. Eloquent expects `role_user` unless you pass a table
  name.
- ❌ **Forgetting the foreign key in the migration** — the relationship method compiles, but
  every query returns empty because `posts.user_id` doesn't exist.
- ❌ **A polymorphic child with a single FK column** — one `commentable_id` can't point at two
  parents; you need `commentable_type` too (that's what `morphs()` creates).
- ❌ **Loading relationships in a loop** — `foreach ($users as $user) { $user->posts }` is the
  N+1 problem. Lesson 117 is the fix.
- ❌ **Using `hasManyThrough` when the middle table has no real role** — a two-table
  relationship via a coincidental join is clearer as a normal `hasMany` plus a `belongsTo`.

## 13. Best Practices

✅ Name methods in the plural for collections (`posts`, `roles`), singular for one (`profile`)

✅ Let the FK convention work — only pass the key arguments when they're custom

✅ Add `->constrained()->cascadeOnDelete()` (or `nullOnDelete()`) to every `foreignId`

✅ Use `withPivot()` for real pivot data; promote the pivot to a model when it grows up

✅ Prefer a real foreign key over a polymorphic morph when the parent set is fixed

✅ Keep relationship definitions one-per-method and put the query logic (scopes) on the model

## 14. Interview Questions

**Q1. What is the difference between `hasOne` and `belongsTo`?**

> Which side holds the foreign key. A Profile has `user_id`, so Profile `belongsTo` User and
> User `hasOne` Profile. `hasOne` means "I'm referenced by that table"; `belongsTo` means "I
> carry the key that references you".

**Q2. What is a pivot table?**

> The table that resolves a many-to-many relationship. Neither side can hold a single foreign
> key — a user has many roles and a role has many users — so a third table stores pairs of
> both keys: `role_user` with `user_id` and `role_id`. Eloquent calls it the pivot, and
> exposes it on each model as `->pivot`.

**Q3. What is a polymorphic relationship?**

> One child table that can belong to several different parent tables. Instead of a fixed
> foreign key, the child stores the parent's class (`commentable_type`) and id
> (`commentable_id`) — so comments can attach to posts *and* videos without separate tables.
> `morphTo` is the child side, `morphMany` the parent side.

**Q4. When would you use `hasManyThrough`?**

> When the relationship reads "X has many Y through Z" and the two tables aren't directly
> linked — a Country has many Posts through its Users. It produces one query with a join
> through the middle table, so I don't hand-write the join in a controller.

**Q5. What's the difference between one-to-many and many-to-many?**

> One-to-many: the child holds a single foreign key to the parent (`posts.user_id`) — one
> user, many posts. Many-to-many: neither side can hold it, so a pivot table pairs both keys
> (`role_user`). The schema difference is *where the keys live*.

**Q6. How do you add data to a pivot table?**

> `$user->roles()->attach($roleId)` or `sync([$roleId1, $roleId2])` for a whole set at once.
> With extra pivot columns, `attach($roleId, ['level' => 3])` and the relationship needs
> `withPivot('level')` so the column is loaded.

**Q7. What is the default foreign key Eloquent guesses, and when must you override it?**

> The owner's model name, snake_cased, plus `_id` — `User` → `user_id`, `Post` → `post_id`.
> You override it whenever the column doesn't follow the convention, like a `Country` using
> `nation_id` on the users table.

**Q8. Can a table be involved in two relationships to the same model?**

> Yes — and that's when you must give the relationship a name and specify the foreign key.
> `User` as both author and editor of a `Post` needs `author()` and `editor()` methods, each
> with its own `belongsTo(User::class, 'author_id')` / `('editor_id')`.

**Senior follow-up: A `User` `hasOne` `Profile`, but you now need a `Profile` to belong to a
`Team` as well. What changes in the schema?**

> The Profile table gains a `team_id` foreign key, and Profile gets a second
> `belongsTo(Team::class)`. The User side is untouched — `hasOne`/`belongsTo` reads the key on
> the Profile row. The lesson to state out loud: *adding a relationship is usually adding a
> column plus a method*, and the existing relations don't move.

## 15. Follow-Up Questions

**Q1. What happens if you delete a user with posts?**

> With `cascadeOnDelete` on the `user_id` FK, the database deletes the posts automatically.
> Without it, the delete fails with a foreign-key constraint error (or leaves orphaned rows,
> depending on the constraint). Eloquent doesn't clean children up by itself — that's the
> migration's job.

**Q2. Why might you want a pivot table as its own model?**

> When the pivot carries enough data to be a domain object — an enrolment with a grade and an
> enrolled-at date. Then `belongsToMany` with `withPivot()` gets clumsy, and a real model
> (`Enrolment`) with `hasMany` on both sides gives you relationships, scopes, and events on
> the pivot itself.

**Q3. When is a polymorphic relationship a mistake?**

> When the parent set is small and fixed. Two parent types could just be two real columns or
> two child tables, and you'd keep the foreign-key constraint and the cleaner joins. Polymorph
> is for genuinely open parent sets — "anything can be commented on".

**Q4. `sync()` vs `attach()` vs `detach()`?**

> `attach($id)` adds one pivot row; `detach($id)` removes one; `sync([ids])` replaces the
> whole set in one call — it attaches the new ids and detaches anything not in the list. For
> saving a "choose your roles" form, `sync` is the one you want.

## 16. Comparison Table

| | One-to-one | One-to-many | Many-to-many | Through | Polymorphic |
|---|---|---|---|---|---|
| Methods | `hasOne` / `belongsTo` | `hasMany` / `belongsTo` | `belongsToMany` ×2 | `hasManyThrough` | `morphOne` / `morphMany` / `morphTo` / `morphToMany` |
| FK location | Dependent table | Many-side table | Pivot table | Middle, then far table | Child stores `type` + `id` |
| Example | User–Profile | User–Post | User–Role | Country–Post via User | Comments on Post & Video |
| SQL shape | `WHERE user_id = ? LIMIT 1` | `WHERE user_id = ?` | `INNER JOIN pivot` | `JOIN users ON … WHERE country_id` | `WHERE type = ? AND id = ?` |
| Covers | 1:1 attribute-ish | 1:N, most common | N:N roles/tags/courses | Chains through a middle table | One child, many parents |

| Question | Method |
|---|---|
| "I carry the key that points at you" | `belongsTo` |
| "I'm pointed at by that table" | `hasOne` / `hasMany` |
| "Both sides have many" | `belongsToMany` |
| "Many, but through a middle table" | `hasManyThrough` |
| "Belongs to one of several kinds of parent" | `morphTo` / `morphMany` |

## 17. Code Example

```php
use App\Models\User;
use App\Models\Role;

$user = User::find(1);
$user->roles()->attach(2);                 // INSERT INTO role_user (user_id, role_id) VALUES (1, 2)

$user->roles()->sync([2, 3, 5]);           // one call: attach 2,3,5, detach the rest

foreach ($user->roles as $role) {
    echo "{$role->name} (level {$role->pivot->level})\n";
}
```

Output (the SQL behind `$user->roles`, then the loop):

```text
SELECT roles.*, role_user.user_id AS pivot_user_id,
       role_user.role_id AS pivot_role_id,
       role_user.level AS pivot_level
FROM roles
INNER JOIN role_user ON roles.id = role_user.role_id
WHERE role_user.user_id = 1

Admin (level 3)
Editor (level 2)
```

## 18. Performance Notes

- **The property triggers a query.** `$user->posts` runs SQL on first access and caches it on
  the model for the rest of the request — useful, but inside a loop it's N queries (Lesson
  117's core).
- **Use `with()` / `load()` for anything more than one model.** Two users' posts = two extra
  queries; two hundred = two hundred. Eager loading turns that into one.
- **Only fetch what you traverse.** A relationship you never touch is a query you never
  needed — `with()` on unused relations is wasted SQL.
- **Count without hydrating.** `$user->posts()->count()` does `SELECT COUNT(*)` instead of
  loading every post; the relationship method (not the property) gives you the builder.
- **`constraints` + eager loading interplay** comes next — Lesson 117 covers why `with('posts')`
  uses `WHERE user_id IN (...)`.

## 19. Debugging Scenarios

- **"`$user->posts` returns an empty collection but the rows are there."** — The foreign key
  column doesn't match the convention: `posts.author_id` instead of `posts.user_id`. Pass it
  explicitly: `$this->hasMany(Post::class, 'author_id')`.
- **"`$user->roles` returns `null` instead of a collection."** — You're calling a method that
  returns a `BelongsToMany` and treating it as a property, or the pivot table is missing /
  misnamed (`roles_user` instead of `role_user`).
- **"A polymorphic comment is null on one parent but works on the other."** — The
  `commentable_type` string must match the actual class — `App\Models\Post` with the right
  case and namespace. A wrong string silently returns no rows.
- **"Deleting a user deleted nothing, and now the app errors on the post count."** — The FK
  has no `cascadeOnDelete`, so the constraint blocks the delete (or orphans the posts). Fix
  in the migration, not in a controller.

## 20. Quick Revision Notes

- **One rule: the table with the FK is `belongsTo`; the other side is `hasOne`/`hasMany`.**
- **`hasOne`** = "referenced by", **`belongsTo`** = "carries the key". The words mean the
  *direction of the pointer*, not importance.
- **Pivot**: neither side can hold the key, so a third table pairs them — `role_user`.
- **`hasManyThrough`**: Country → Posts via Users; one query, `INNER JOIN` through the middle.
- **Polymorphic**: child stores `_type` + `_id`; comments on posts *and* videos; `morphOne` /
  `morphMany` / `morphTo` / `morphToMany`; no FK constraint — the trade-off to name.
- **`attach` / `detach` / `sync`** add, remove, and replace pivot rows.
- **Property access lazily runs SQL** — the door Lesson 117 walks through.

## 21. Cheat Sheet

```text
hasOne        → referenced by one row           (profiles.user_id → users.id)
hasMany       → referenced by many rows         (posts.user_id)
belongsTo     → I hold the FK                   (profiles.user_id, posts.user_id)
belongsToMany → pivot table pairs both keys     (role_user)
hasManyThrough→ join through a middle table     (country → users → posts)
morphMany     → child holds type + id           (comments.commentable_*)
morphOne      → one-to-one morph                (image.imageable_*, LIMIT 1)
morphTo       → the child side of a morph       (comment.commentable)
morphToMany   → polymorphic pivot               (taggables)
FK rule       → "the key decides the side, the schema decides the shape"
```

## 22. Key Takeaways

> [!RECAP]
> - A relationship is a foreign key expressed as a method: `$user->posts` *is* a query
> - The FK's location decides everything — `belongsTo` carries it, `hasOne`/`hasMany` doesn't
> - Many-to-many needs a pivot table (`role_user`) holding both keys — `belongsToMany`
> - `hasManyThrough` models chains (Country → Posts via Users) with one joined query
> - Polymorphic `morphMany`/`morphTo` let one child serve many parent types via `type` + `id`
> - `cascadeOnDelete` and `nullOnDelete` are data decisions, made in the migration
> - Property access runs SQL lazily — the exact behaviour Lesson 117 turns into N+1

## Check your understanding

Answer these without looking back.

1. State the foreign-key rule that picks `hasOne` vs `belongsTo`.
2. For a `Post` that belongs to a `User`, which table holds the FK and which method goes on
   which model?
3. Draw the `role_user` pivot between `users` and `roles`, and write the `belongsToMany`
   method for one side.
4. When do you use `hasManyThrough`? Sketch Country → User → Post with its two FK columns.
5. A comments table serves both posts and videos — what two columns does the migration need,
   and what are the two methods on the child?
6. `attach`, `detach`, `sync`: what does each do, and which saves a "choose roles" form?
7. What does `cascadeOnDelete()` actually enforce, and where does it live?
8. When is a polymorphic relationship the wrong choice?

## What's Next

**Lesson 117 — Eager Loading & the N+1 Problem.** The most-asked Laravel performance question:
why `User::all()` with `$user->posts` in a loop is O(N+1) queries, and how `with('posts')`
collapses it to two.
