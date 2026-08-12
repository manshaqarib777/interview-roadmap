# Topic 2 — Routing

**Checklist anchor:** basic routes · parameters · optional · named · groups · prefixes · middleware groups · route model binding · resource routes · API routes · fallback · route caching · constraints

**Owning lesson:** [111 Routing](../111-routing.md)

---

## The one-sentence answer

**Routing is the map from "method + URL" to "controller + action" — and route model binding is the piece that turns a URL segment into an actual model instance.**

## The mental model

`routes/web.php` is a **table with two columns**: what the URL looks like, and what should handle it.

```php
Route::get('/users/{user}', [UserController::class, 'show']);
//      "GET /users/7"  ──►  UserController@show, with $user = User#7
```

The magic of model binding: because the parameter is named `{user}` (matching the type-hint `User $user`), Laravel resolves the segment `7` into `User::findOrFail(7)` **automatically**. You never write the lookup.

## How it works

### Parameters

```php
Route::get('/users/{user}', ...);          // required segment
Route::get('/posts/{post}/comments/{comment}', ...); // multiple
Route::get('/search/{term?}', ...);        // optional — ? makes it optional
```

### Named routes

```php
Route::get('/users/{user}', ...)->name('users.show');
// generate the URL anywhere:
route('users.show', $user);   // → https://app.test/users/7
```

### Groups — shared middleware, prefixes, names

```php
Route::middleware('auth')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users');
        // URL: /admin/users · name: admin.users · guarded by auth
    });
```

### Resource routes

```php
Route::resource('posts', PostController::class);
// one line → index, create, store, show, edit, update, destroy
Route::apiResource('posts', PostController::class);
// same, minus the create/edit view routes (API flavour)
```

### Route model binding — implicit

```php
Route::get('/users/{user}', [UserController::class, 'show']);

public function show(User $user) // ← type-hint + same name as {user}
{
    // $user is already User::findOrFail($userSegment)
}
```

Laravel matches the `{user}` segment to the `User $user` type-hint and runs the lookup — 404 if missing. **Custom binding** lets you override the lookup:

```php
Route::get('/users/{user:username}', ...);       // bind by username column
// or in the model:
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('slug', $value)->firstOrFail();
}
```

### Fallback & constraints

```php
Route::fallback(fn () => ...);                   // any unmatched URL → 404 handler
Route::get('/users/{user}', ...)->where('user', '[0-9]+'); // digits only
```

### Route caching

```php
php artisan route:cache
php artisan route:list     // inspect
```

`route:cache` compiles all routes to one file so the router skips re-parsing — but **closures can't be cached** (Laravel warns), and the cache must be rebuilt after any route change.

## The plain-JS model (what the exercise does)

```js
const ROUTES = [
  { method: 'GET', path: '/products', controller: 'ProductController@index' },
];

function routeFor(method, path) {
  const route = ROUTES.find((r) => r.method === method && r.path === path);
  if (!route) return `404 — no route for ${method} ${path}`;
  return `${route.method} ${route.path} → ${route.controller}`;
}
```

## Interview questions

**Q1. What is implicit route model binding?**
> When a route parameter name matches a type-hinted model parameter, Laravel automatically resolves the URL segment into a model instance — `{user}` + `User $user` → `User::findOrFail($segment)`. No manual lookup, and a missing model 404s automatically.

**Q2. Explicit vs implicit binding?**
> Implicit is the magic: name the parameter to match the type-hint and Laravel does the lookup. Explicit is when you tell Laravel how to bind — a custom `resolveRouteBinding()` on the model, or `{user:username}` to bind by a column instead of the primary key.

**Q3. How does route caching work?**
> `route:cache` serializes all routes into a single file the router loads instead of re-parsing route files. It's a bootstrap-cost win. It breaks if routes use closures (they can't be serialized), and you must rebuild it after adding or changing routes.

**Q4. `web.php` vs `api.php`?**
> Two route files with different middleware groups. `web.php` gets the web group — session, cookies, CSRF, and typically returns views. `api.php` gets the api group — typically no session/CSRF, JSON error handling, and rate limiting. The kernel routes them by URL prefix (`/api`).

**Q5. How do route groups work?**
> A group applies shared attributes — middleware, prefix, name prefix, namespace — to every route inside it, without repeating them per route. `Route::middleware('auth')->prefix('admin')->group(...)` is the shape of an entire admin section.

**Senior follow-up: When would you use custom binding?**
> When the URL should use a human-readable key instead of the id — `{user:username}` or a slug — or when the lookup needs extra scoping, like `where('tenant_id', $tenant->id)->firstOrFail()`. Custom binding keeps the 404-and-inject behaviour while changing the query.

## Common mistakes

❌ Route parameters named differently from the type-hint — binding silently fails (the segment arrives as a string).

❌ Forgetting to rebuild `route:cache` after changes — old routes served in production.

❌ Using closures in routes that you later `route:cache` — the cache build fails.

❌ Writing business logic in route files — routes are a map, not a place for logic.

## Quick revision notes

- Route = **method + URL → controller action**
- `{user}` + `User $user` = **implicit model binding** → auto `findOrFail`
- Named routes → `route('name', $model)` generates URLs
- Groups = **middleware + prefix + name** shared once
- `route:resource` / `route:apiResource` → the 7 (or 5) standard actions
- `route:cache` = compile, but **no closures**, rebuild on change

## Check your understanding

1. What exactly does Laravel do when it sees `{user}` + `User $user`?
2. How would you bind a route by `username` instead of `id`?
3. What's the difference between `web.php` and `api.php`?
4. Why can't closures be route-cached?
5. What do route groups share, and how do you read one?
