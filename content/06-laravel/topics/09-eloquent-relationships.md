# Topic 9 — Eloquent Relationships

**Checklist anchor:** one-to-one · one-to-many · many-to-many · has-many-through · polymorphic · pivot table · `hasOne` vs `belongsTo`

**Owning lesson:** [116 Eloquent Relationships](../116-eloquent-relationships.md)

---

## The one-sentence answer

**Eloquent relationships are methods that define how models relate — one-to-one, one-to-many, many-to-many, has-many-through, and polymorphic — and each one is a query builder you can chain and eager-load.**

## The mental model

A relationship is just **a method that returns a relationship object** — it's the database foreign key, expressed in PHP:

```php
class User extends Model
{
    public function posts() {
        return $this->hasMany(Post::class); // users.id → posts.user_id
    }
}
```

`$user->posts` then *feels* like a property, but it's a query: `select * from posts where user_id = ?`. Because it's a query, you can chain — `$user->posts()->where('published', true)->get()` — and eager-load it (Lesson 10/11).

## The relationship map

### One-to-one — `hasOne` / `belongsTo`

```php
class User extends Model
{
    public function profile() { return $this->hasOne(Profile::class); }
}
class Profile extends Model
{
    public function user() { return $this->belongsTo(User::class); }
}
```

**Which side is which:** the model that *owns the foreign key* is `belongsTo` (Profile holds `user_id`); the model on the other side is `hasOne`. When in doubt: "the one holding the key belongs to the other."

### One-to-many — `hasMany` / `belongsTo`

```php
class User extends Model
{
    public function posts() { return $this->hasMany(Post::class); }
}
class Post extends Model
{
    public function user() { return $this->belongsTo(User::class); }
}
```

The most common relationship: one user, many posts.

### Many-to-many — `belongsToMany` and the pivot

```php
class User extends Model
{
    public function roles() { return $this->belongsToMany(Role::class); }
}
// users ⋈ role_user ⋈ roles — the pivot table holds user_id + role_id
```

**The pivot table** is the junction: `role_user` with `user_id` and `role_id`. Extra pivot columns (like `expires_at`) are accessed via `withPivot()` and read as `$user->roles->first()->pivot->expires_at`.

### Has-many-through — the middle table

```php
class Country extends Model
{
    public function posts() { return $this->hasManyThrough(Post::class, User::class); }
}
// countries → users → posts
```

When you want **grandchildren through a middle table** — all posts in a country, through the country's users — `hasManyThrough` skips the intermediate fetch.

### Polymorphic — `morphMany` / `morphTo`

```php
class Image extends Model
{
    public function imageable() { return $this->morphTo(); }
}
class Post extends Model
{
    public function images() { return $this->morphMany(Image::class, 'imageable'); }
}
class User extends Model
{
    public function images() { return $this->morphMany(Image::class, 'imageable'); }
}
// images table: imageable_id + imageable_type ("App\Models\Post" | "App\Models\User")
```

One table serves **many parent types** — the same `images` table attaches to posts *and* users. The `imageable_type` column records which model it belongs to. (`morphToMany`/`morphOne` are the many/many and one variants.)

## The plain-JS shape (what the exercise models)

```js
// users.id → posts.user_id, resolved per user
function userPosts(userId, posts) {
  return posts.filter((p) => p.userId === userId);
}
```

## Interview questions

**Q1. `hasOne()` vs `belongsTo()` — how do you know which to use?**
> The model that holds the foreign key uses `belongsTo`; the model on the other side uses `hasOne` (or `hasMany`). Profile has `user_id`, so `Profile::belongsTo(User)`; User is the "one" side, so `User::hasOne(Profile)`. If you can find the foreign key, you can name the relationship.

**Q2. How does many-to-many work?**
> Through a pivot table. `belongsToMany` uses a junction table (e.g. `role_user`) holding both foreign keys. Eloquent reads `users → role_user → roles` automatically, and extra pivot columns are available via `withPivot()`.

**Q3. What is a pivot table?**
> The junction table for a many-to-many relationship. It holds the two foreign keys (and optionally extra data like `expires_at`). It exists because a many-to-many can't be represented with a single foreign key on either table.

**Q4. What is a polymorphic relationship?**
> One table that belongs to multiple parent types. An `images` table with `imageable_id` and `imageable_type` attaches to posts *and* users. The `_type` column records the parent class; `morphTo` on the image resolves whichever parent it points at. Use it for shared attachments, comments, likes.

**Q5. When would you use `hasManyThrough()`?**
> When you want records through a middle model — "all posts in a country" goes country → users → posts. `hasManyThrough` gives you the grandchildren directly without loading the intermediate collection, and it eager-loads in one query.

**Senior follow-up: How do you avoid N+1 with these?**
> Every relationship is a query, and lazy-loading one in a loop is the N+1 problem (Lesson 11). Eager-load with `with('posts.images')`, or load on demand with `load()`. The relationship *definitions* are where eager-loading hooks in — naming them well is part of performance.

## Common mistakes

❌ Forgetting the foreign key side — `belongsTo` goes on the model holding the key.

❌ Many-to-many without a pivot table — `belongsToMany` *requires* the junction.

❌ Polymorphic without the `_type` column — the type column is what makes it polymorphic.

❌ Loading relationships in a loop — that's N+1; eager-load instead.

## Quick revision notes

- `hasOne`/`hasMany` + `belongsTo` — the FK decides which side is which
- `belongsToMany` — **pivot table** (`role_user`) · extra columns via `withPivot()`
- `hasManyThrough` — **grandchildren through a middle table**
- Polymorphic — `imageable_id` + `imageable_type` = one table, many parents
- Every relationship is a **query** — chain it, eager-load it, never lazy-load in a loop

## Check your understanding

1. How do you decide between `hasOne` and `belongsTo`?
2. What's the pivot table, and what lives in it?
3. When is a polymorphic relationship the right shape?
4. What problem does `hasManyThrough` solve?
5. Why does every relationship risk N+1, and how do you prevent it?
