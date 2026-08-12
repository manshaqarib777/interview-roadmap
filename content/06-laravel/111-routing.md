# Lesson 111 — Routing

**Interview importance:** ⭐⭐⭐⭐ — the map from URL to controller. You'll write routes in every Laravel task and explain them in most interviews.

Every request to a Laravel app passes through the router first. The request lifecycle (Lesson 106) ends where this lesson begins: the kernel has booted, the request is in hand, and something has to decide which code answers it. That something is the route table in `routes/web.php` and `routes/api.php`.

Routes, parameters, model binding, groups, resource routes — this is the whole map from URL to controller. The container (Lesson 108) resolves the controllers your routes point at, so by the end of this lesson you'll be able to trace any URL to its action, and back again.

## Learning Objectives

By the end of this lesson you should be able to:

- Write a route for any HTTP method and read `php artisan route:list` like a table
- Define required, optional and constrained parameters — and their ordering rules
- Explain exactly how `{user}` plus a `User` type-hint becomes `select * from users where id = ?`
- Build a prefixed, named, middleware-wrapped route group from memory
- Say why `route:cache` refuses closures — and what you register instead
- List the seven routes a single `Route::resource()` line registers

## 1. One-Line Definition

**Routing is the map from URL to controller: `Route::get('/users', [UserController::class, 'index'])` says "when a GET request arrives at `/users`, run this action."**

## 2. Mental Model

Think of `routes/web.php` as a switchboard. The router answers with the first line whose *method* and *path pattern* both match the incoming request — nothing else. There is no "best match" and no longest-prefix logic: the first matching row wins, in file order.

```text
routes/web.php (the switchboard)

  GET  /users               →  UserController@index
  POST /users               →  UserController@store
  GET  /users/{user}        →  UserController@show     ← {user} is a slot
  GET  /users/{user}/edit   →  UserController@edit

A request for GET /users/42 drops into the {user} slot and lands on show(42).
```

Every URL in the app is one row in a table like this. The job of the router is to pick the row and hand the request to its handler.

## 3. Visual Flow

```text
GET /users/42?sort=name
            │
            ▼
    Router matches method + path pattern
            │  (routes/web.php — first match wins)
            ▼
    {user} = "42"  ──►  implicit model binding
            │              User::findOrFail(42)
            ▼
    Controller action runs:  UserController@show(User $user)
            │
            ▼
    Response (view / JSON / redirect) leaves the app
```

The URL is parsed once, matched against the table once, and the rest is parameter passing.

## 4. How It Works

Laravel loads `routes/web.php` and `routes/api.php` during bootstrapping. Each file is a list of registrations, and the order in the file *is* the matching order. Two registrations for the same path — the first one wins, silently:

```php
// routes/web.php
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::patch('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);
```

This is the table the router actually works from:

```text
$ php artisan route:list
GET|HEAD  /                ............................. closure
GET|HEAD  /users           ............................. App\Http\Controllers\UserController@index
POST      /users           ............................. App\Http\Controllers\UserController@store
PUT       /users/{user}    ............................. App\Http\Controllers\UserController@update
PATCH     /users/{user}    ............................. App\Http\Controllers\UserController@update
DELETE    /users/{user}    ............................. App\Http\Controllers\UserController@destroy
```

> [!TIP]
> `php artisan route:list` is the router's own table. Interviewers love it because it reveals both what's registered and what isn't — run it before claiming "the route should work".

### Parameters and optional parameters

A `{name}` is a slot that matches one path segment and passes its value to the handler. Adding `?` makes the slot optional — and an optional slot must be the *last* segment:

```php
Route::get('/search/{term?}', function (string $term = 'all') {
    return "Searching for: {$term}";
});
```

```text
GET /search          → "Searching for: all"
GET /search/laravel  → "Searching for: laravel"
```

### Model binding

The interesting case is `{user}` with a `User` type-hint. Laravel sees the variable name matches the segment name and the type-hint names a model, so it resolves the segment to a model instead of a raw string:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return "Showing {$user->name}";
})->whereNumber('user');
```

```text
GET /users/42
  1. router extracts the {user} segment → "42"
  2. the User type-hint says "this is a model binding"
  3. the variable name {user} matches $user → User::findOrFail(42)

SQL: select * from users where id = 42 limit 1

GET /users/999  → 404  (ModelNotFoundException)
```

When the lookup isn't by primary key, bind explicitly:

```php
// app/Providers/AppServiceProvider.php
use App\Models\Post;

public function boot(): void
{
    // force the model for a segment, by name
    Route::model('post', Post::class);

    // or fully custom resolution — here by slug instead of id
    Route::bind('post', function (string $value) {
        return Post::where('slug', $value)->firstOrFail();
    });
}
```

### Named routes, groups, and the fallback

```php
Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');

// anywhere else in the app:
$url = route('users.show', ['user' => 42]);   // http://localhost/users/42
redirect()->route('users.show', ['user' => 42]);
```

```php
Route::prefix('admin')->middleware('auth')->name('admin.')->group(function () {
    Route::get('users', [AdminUserController::class, 'index'])->name('users');
    Route::get('reports', [ReportController::class, 'index'])->name('reports');
});

Route::fallback(function () {
    return response()->json(['message' => 'Not Found'], 404);
});
```

```text
GET /admin/users     → gated by auth, route name: admin.users
GET /admin/reports   → gated by auth, route name: admin.reports
GET /no/such/page    → 404 {"message":"Not Found"}   (the fallback)
```

## 5. Real Project Usage

| Pattern | Example | Serves |
|---|---|---|
| Static | `Route::get('/about', ...)` | `/about` |
| Parameter | `Route::get('/users/{user}', ...)` | `/users/42` |
| Optional param | `Route::get('/search/{term?}', ...)` | `/search` *and* `/search/laravel` |
| Named | `->name('users.show')` | `route('users.show', ...)` |
| Group | `prefix('admin')->middleware('auth')` | `/admin/*`, auth-gated |
| Resource | `Route::resource('posts', PostController::class)` | all 7 post routes |
| API | routes/api.php | `/api/*`, stateless |

This table is the whole lesson in miniature — everything else is one of these rows, detailed.

## 6. Interview Explanation

> The router maps an HTTP method plus a URL pattern to a handler, and the first matching row wins. Parameters are `{name}` slots in the pattern; a `?` makes one optional. A `{user}` slot matched against a `User` type-hint triggers implicit model binding — Laravel fetches the model by id and injects it. Named routes let me generate URLs and redirects from a name instead of a hard-coded path. Groups apply a prefix, middleware and a name prefix to many routes at once, and `Route::resource()` registers the standard seven CRUD routes in one line.

That's the 30-second answer. Now the parts people get wrong.

## 7. Senior-Level Insights

- **Route order is a silent contract.** Because the first match wins, a `{user}` route registered before a static `/users/new` swallows it. Senior teams keep specific routes above dynamic ones and review `route:list` in PRs.
- **Closures are a cache killer.** `php artisan route:cache` serializes the route table to a file — and a Closure cannot be serialized. Long-lived apps register controllers or invokable classes precisely so routes *can* be cached:

```text
$ php artisan route:cache          $ php artisan route:cache  (closure route present)
Route cache cleared!              Unable to prepare route [/] for serialization.
Routes cached successfully!       Uses Closure.
```

- **Routes are configuration, not code.** A route file with business logic is a smell — it's a table. An `if` inside a route means the decision belongs in middleware (Lesson 112) or a controller (Lesson 113).
- **Names are the API of your URLs.** `route('users.show', $user)` survives a URL change; a hard-coded `/users/42` in a view doesn't. Naming discipline is what makes redirects and links refactorable.
- **`routes/api.php` is stateless by design.** It carries no session middleware and is throttled via `throttle:api`. That is the contract your SPA or mobile client relies on — never add session logic there.

## 8. Common Mistakes

- **Optional parameter in the middle:** `Route::get('/users/{user?}/posts', ...)` — an optional slot must be last, or routing can't tell where the segment ends.
- **Ordering a dynamic route before a specific one** — the specific route silently never matches.
- **Binding by type alone.** Implicit binding keys off the *variable name* matching the `{...}` slot, not just the type: `{user}` must pair with `$user`.
- **Registering in the wrong file** — `web.php` vs `api.php` changes middleware, sessions and prefix. A 419 (CSRF) on an endpoint usually means it belongs in `api.php`.
- **Forgetting `route:clear` after changing routes on a cached deploy** — a stale cache serves stale routes.

## 9. Best Practices

✅ Keep routes declarative — one line per route, no logic inside

✅ Name routes you link or redirect to (`->name('users.show')`)

✅ Use groups for a shared prefix + middleware + name prefix

✅ Prefer `Route::resource()` / `apiResource()` for CRUD — seven routes, one line, consistent names

✅ Constrain dynamic segments (`->whereNumber('user')`)

✅ Run `php artisan route:cache` on deploy and `route:clear` when the table changes

❌ Don't use closures when the route will be cached — register a controller action

❌ Don't hard-code URLs in views and redirects — use `route()`

❌ Don't put `if` or business logic inside a route file

## 10. Interview Questions

**Q1. What does a route do?**

> It maps an HTTP method and a URL pattern to a handler, usually a controller action, and the first matching registration wins. Laravel loads `routes/web.php` and `routes/api.php` at boot, so file order is match order.

**Q2. How do parameters work?**

> A `{name}` in the pattern is a slot. `/users/{user}` matches `/users/42` and passes `"42"` to the handler. Adding `?` makes it optional — `/search/{term?}` matches `/search` too — and an optional parameter must be last.

**Q3. What happens with `Route::get('/users/{user}', fn (User $user) => ...)` — how does `{user}` become a `User`?**

> Implicit route model binding. The variable name `user` matches the `{user}` segment, and the `User` type-hint tells the router the segment is a model id, so it runs `User::findOrFail($user)` — `select * from users where id = ?` — and injects the model. A missing row means a 404.

**Q4. What are named routes for?**

> A stable handle for a URL. `route('users.show', ['user' => 42])` generates the URL and survives URL changes, and `redirect()->route(...)` uses the same name — so renaming a path never means hunting through views.

**Q5. What do route groups give you?**

> One place to apply a prefix, middleware and a name prefix to many routes: `Route::prefix('admin')->middleware('auth')->name('admin.')->group(...)`. Every route inside inherits all three — `/admin/users`, auth-gated, named `admin.users`.

**Q6. What is route caching, and why does it break closures?**

> `php artisan route:cache` serializes the compiled route table to `bootstrap/cache` so the router doesn't recompile it per request — a measurable production win. Closures can't be serialized, so the command throws. That's why production apps register controller actions and invokable classes instead of closures.

**Senior follow-up: How do you register a route that must only match numeric ids?**

> A constraint: `->whereNumber('user')` (or `->where('user', '[0-9]+')`), or a global `Route::pattern('id', '[0-9]+')` in a service provider so every `{id}` segment inherits it. A non-matching segment falls through to the next route or a 404.

## 11. Follow-up Questions

**Can two routes match one URL?**

> Yes — the first registration wins and the second is dead code. This is the classic "why is my static route not working" cause: a dynamic route above it swallows the URL first.

**What's the difference between a required and an optional parameter?**

> A required one must be present or the route doesn't match. An optional one (`{term?}`) matches with or without the segment; the handler reads a default (`$term = 'all'`) when it's absent.

**When would you use explicit binding?**

> When the lookup isn't by primary key — `Route::bind('post', fn ($value) => Post::where('slug', $value)->firstOrFail())` for slug URLs, or `Route::model('post', Post::class)` to force a model for a differently-named segment.

## 12. Comparison Table

| | `routes/web.php` | `routes/api.php` |
|---|---|---|
| Prefix | `/` | `/api` |
| Middleware group | `web` (session, CSRF) | `api` (throttle, no session) |
| Built for | browser pages, forms | SPAs, mobile, third parties |
| CSRF | enforced | not enforced |
| Typical handler | view-returning controller | JSON-returning controller |

| | Implicit binding | Explicit binding |
|---|---|---|
| Declared | type-hint + `{name}` | `Route::model()` / `Route::bind()` |
| Lookup | by primary key | anything you write |
| 404 on miss | `ModelNotFoundException` → 404 | whatever your closure does |

## 13. Code Example

One file exercising most of the lesson:

```php
// routes/web.php
use App\Http\Controllers\PostController;
use App\Models\User;

// static
Route::get('/', fn () => view('welcome'))->name('home');

// optional parameter + constraint
Route::get('/search/{term?}', function (string $term = 'all') {
    return "Searching for: {$term}";
})->whereAlpha('term');

// implicit model binding — {user} matches $user, the User type-hint drives the query
Route::get('/users/{user}', function (User $user) {
    return "Showing {$user->name}";
})->whereNumber('user');

// group: prefix + middleware + name prefix
Route::prefix('admin')->middleware('auth')->name('admin.')->group(function () {
    Route::get('users', [AdminUserController::class, 'index'])->name('users');
});

// resource: all 7 CRUD routes in one line
Route::resource('posts', PostController::class);
```

What the router does with it:

```text
GET /search              → "Searching for: all"
GET /search/laravel      → "Searching for: laravel"
GET /users/42            → "Showing Ada"   (SQL: select * from users where id = 42 limit 1)
GET /users/abc           → 404             (whereNumber rejected it)
GET /admin/users         → AdminUserController@index, gated by auth
GET /posts               → PostController@index      (resource route)
GET /posts/7/edit        → PostController@edit       (resource route)
```

```narrate
1:   every route file is a list of registrations
5-9: an optional parameter must be last; whereAlpha constrains the segment
12-14: {user} + User $user = implicit binding; whereNumber keeps non-numeric ids out
17-19: the group stamps prefix, middleware and name on every inner route
22:   one line registers the standard seven CRUD routes
```

## 14. Performance Notes

- **Route caching is the big win.** `route:cache` turns per-request route compilation into a single unserialize — the most effective routing optimization, and it only works when no closures are involved.
- **Compilation cost is paid once, matching cost per request.** The match is a linear scan of the table. A few hundred routes are nothing; thousands with regex constraints start to matter.
- **Constraints cost more than plain segments.** Regex `->where()` runs per match attempt. Use the built-ins (`whereNumber`, `whereAlpha`) and keep custom regexes short.
- **`route()` generation is cheap but not free** — in a tight loop, compute the URL once outside the loop.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| "My route returns 404 but it's registered" | stale route cache, or the file isn't loaded | `php artisan route:clear`; confirm the file is `routes/web.php` or `routes/api.php` |
| A static route never matches | a dynamic route above it wins | move the specific route above the dynamic one; verify with `route:list` |
| `{user}` isn't being bound | variable name ≠ segment name, or no type-hint | rename to match: `{user}` + `User $user` |
| `/users/abc` matches when it shouldn't | no constraint | `->whereNumber('user')` or a global `Route::pattern` |
| 419 on an endpoint that should be an API | the route is in `web.php` (CSRF group) | move it to `routes/api.php` |
| `route:cache` throws "Uses Closure" | a closure route can't serialize | convert to a controller action or invokable class |

## 16. Quick Revision Notes

- A route = HTTP method + URL pattern → handler; first match wins, file order is match order
- `{name}` = required segment; `{name?}` = optional, must be last
- Named routes: `->name('x')`; use `route('x', ...)` and `redirect()->route('x')`
- Groups: `prefix()`, `middleware()`, `name()` apply to every route inside
- Implicit binding: `{user}` + `User $user` → `User::findOrFail($user)` → `select ... where id = ?`
- Explicit binding: `Route::model()` / `Route::bind()` for non-id lookups
- `Route::resource('posts', PostController::class)` → index/create/store/show/edit/update/destroy
- `routes/api.php` → `/api` prefix, no session, throttled
- `Route::fallback(...)` → the last-resort 404 handler
- Constraints: `->whereNumber()`, `->whereAlpha()`, `->where('user', '[0-9]+')`, global `Route::pattern()`
- `route:cache` serializes the table; closures break it; `route:clear` fixes staleness

## 17. Cheat Sheet

```text
Route::get('/path', handler)->name('n')->middleware('m')->where('p', 're');
        │         │            │             │                │
        │         └ closure | [Ctrl::class,'method'] | invokable class
        └ get|post|put|patch|delete|match|any|fallback

{user}        required segment
{user?}       optional (must be last)
{user:slug}   scoped binding — resolve by a column
fn (User $u)  implicit binding → User::findOrFail(id)

Groups:
  Route::prefix('admin')->middleware('auth')->name('admin.')->group(fn () => …);

Resource:  Route::resource('posts', PostController::class)
  index    GET    /posts             create  GET    /posts/create
  store    POST   /posts             show    GET    /posts/{post}
  edit     GET    /posts/{post}/edit update  PUT|PATCH /posts/{post}
  destroy  DELETE /posts/{post}

apiResource(...) = resource minus create/edit views

Route::fallback(fn () => abort(404));
php artisan route:list | route:cache | route:clear
```

## 18. Key Takeaways

> [!RECAP]
> - A route binds an HTTP method + URL pattern to a handler; the first match wins
> - Parameters are `{name}` slots; add `?` for optional (last only), `whereNumber`/`whereAlpha` to constrain
> - Implicit model binding: the variable name matches the segment, the type-hint runs the query
> - Groups stamp prefix + middleware + name on every inner route
> - `Route::resource()` registers the seven CRUD routes in one line
> - `routes/api.php` is stateless, `/api`-prefixed and throttled
> - `route:cache` serializes routes — and that's exactly why closures are banned from cached routes

## Check your understanding

Answer these without looking back.

1. Which row wins when two routes match the same URL, and what decides the order?
2. Write the route that serves both `/search` and `/search/laravel`.
3. What three facts make `{user}` resolve to a `User` model — segment, variable, type-hint?
4. Write a group that puts every inner route under `/admin`, gated by `auth`, named `admin.*`.
5. List the seven routes `Route::resource('posts', ...)` registers.
6. Why does `route:cache` throw on a closure route — and what's the fix?
7. Your API endpoint is returning 419. What's the most likely cause?

## What's Next

**Lesson 112 — Middleware.** The onion layers around your routes: auth, throttling, CORS —
and what `$next($request)` really does when the request and response pass through each layer.
