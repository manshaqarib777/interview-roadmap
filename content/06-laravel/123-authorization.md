# Lesson 123 — Authorization

**Interview importance:** ⭐⭐⭐ — smaller than auth, but it's the question that exposes
whether you've actually *shipped* a multi-user app. Gates, policies, roles and permissions —
what are you allowed to do?

Last lesson settled **who you are**. This one settles **what you're allowed to do** — and the
two must never blur. Authentication hands the request an identity; authorization takes that
identity and asks *may this identity perform this action on this resource?* In Laravel the
answer is a **Gate** or a **Policy**: one is a closure, the other is a class, and knowing
when to reach for which is exactly the kind of judgement a senior round probes.

## Learning Objectives

By the end of this lesson you should be able to:

- Say the auth/authorization rule and use it to explain *why* the two layers are separate
- Write a Gate closure and a Policy class, and say when each is the right call
- Register policies in `AuthServiceProvider` and call `authorize()` from a controller
- Use route middleware (`can:`) and Blade checks (`@can`) for the same ability
- Model roles & permissions both by hand and with `spatie/laravel-permission`
- Explain why "role-based" and "ability-based" authorization differ — and when roles are fine

## 1. What is Authorization?

**Authorization is deciding whether an authenticated identity may perform a given action on a given resource — returning yes or no, nothing more.**

It never decides *who* the user is; that's already done. It takes the identity, the action,
and the thing being acted on, and answers one boolean question. The clean separation matters:
a policy can be tested in isolation, swapped without touching auth, and — most importantly —
re-used in the controller, in the route, and in the Blade template with the *same* definition.

## 2. Mental Model

Auth is **who opens the door**; authorization is **which rooms they may enter**.

The bouncer from Lesson 122 checks the ID (authentication). A *second* person — the policy —
checks the room list: this ID may enter the kitchen, not the vault. Same person, different
rooms. If the policy only lived in the controller, the Blade template and the route would
have to guess the same answer — and one of them would get it wrong.

## 3. Visual Flow

```text
 authenticated request  (identity from Lesson 122)
      │
      ▼
 ┌───────────────┐
 │  controller   │  $this->authorize('update', $post)
 └──────┬────────┘        (or middleware can:update,post
        │                  or blade @can('update', $post))
        ▼
 ┌───────────────┐   finds the policy for the model
 │  Gate         │   (registered in AuthServiceProvider)
 └──────┬────────┘
        ▼
 ┌───────────────┐
 │  Policy::update($user, $post)
 │  → bool       │
 └──────┬────────┘
    ┌───┴───┐
    ▼       ▼
  false    true
    │       │
    ▼       ▼
   403     action runs
```

## 4. How It Works

The two mechanisms:

**Gates** — closures, registered in `AuthServiceProvider::boot()`:

```php
Gate::define('update-post', function (User $user, Post $post) {
    return $user->id === $post->user_id;
});
```

**Policies** — classes with one method per action (`view`, `create`, `update`, `delete`,
`restore`, `forceDelete`), auto-discovered by convention or registered explicitly:

```php
// app/Policies/PostPolicy.php
class PostPolicy
{
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;   // owners only
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

Both are called the same way — `authorize()`, middleware, `@can` — so the calling code never
knows which one backs it. That uniformity is deliberate.

> [!TIP]
> **The rule of thumb:** Gates for a few abilities that don't map to a model; Policies for
> anything that revolves around a model (`Post`, `Order`, `Team`). If you find yourself
> writing `Gate::define('update-post')` next to `Gate::define('delete-post')` and four more,
> that's a Policy begging to exist.

## 5. Real Project Usage

| Ability | Gate or Policy | The check |
|---|---|---|
| "Can view the admin dashboard" | Gate | `Gate::define('view-admin', fn (User $u) => $u->is_admin)` |
| "Can update *this* post" | Policy | `$user->id === $post->user_id` |
| "Can create a report" | Policy `create` | `$user->subscribed` (no model instance yet) |
| "Can publish to the company account" | Gate | Membership in the account's team |
| "Can manage users" | Gate + roles | `$user->hasRole('admin')` |

The classic ownership check in a controller:

```php
public function update(UpdatePostRequest $request, Post $post)
{
    $this->authorize('update', $post);   // 403 if not the owner
    $post->update($request->validated());
    return redirect()->route('posts.show', $post);
}
```

```text
PATCH /posts/1   as the owner (id 42, post.user_id 42) → 200, updated
PATCH /posts/1   as user id 7 (post.user_id 42)        → 403 Forbidden
```

## 6. Interview Explanation

> Authorization is what an identity is allowed to do — the "what are you allowed to do?"
> half, after authentication answers "who are you?". Laravel gives two tools: Gates, which
> are closures for a few abilities, and Policies, which are classes grouped around a model.
>
> Policies are auto-discovered by model naming convention and can be registered in
> `AuthServiceProvider`. I call them with `$this->authorize('update', $post)`, with
> `can:update,post` middleware on the route, or `@can('update', $post)` in Blade — same
> ability everywhere. For roles and permissions I'd use `spatie/laravel-permission` for
> anything real, or hand-roll it when there are only two or three rules.

## 7. Senior-Level Insights

- **Ownership checks belong in the policy, not in the controller.** `if ($post->user_id !== $request->user()->id)` in a controller is the smell. The policy is the single source of truth, unit-testable, and reusable from the route and the template.
- **`create` and `update` differ in shape.** `create` has no model instance — the policy
  method gets the class: `public function create(User $user)`. `update` gets the instance.
  Interviewees who know this detail have actually written policies.
- **`before()` is the escape hatch.** A policy `before($user, $ability)` that returns `true`
  for admins runs before the specific method — the classic super-admin bypass:

```php
public function before(User $user, string $ability): ?bool
{
    return $user->hasRole('super-admin') ? true : null;
    // null → fall through to the per-ability method
}
```

  Returning `null` (not `false`) lets the normal check run for everyone else.

- **Roles vs abilities is a modelling decision.** Role-based ("is admin") is coarse and quick;
  ability-based ("can publish") is granular and survives role renames. The senior answer is
  *assign roles, check abilities*: roles are how you bundle permissions, abilities are what
  you check. If every new feature needs a new role, you've coupled your data model to your UI.
- **Route-model binding gives you the model for free.** `Route::put('/posts/{post}', ...)`
  with `can:update,post` in the middleware resolves `{post}` first, then checks the policy —
  no manual fetch, no null model.
- **Authorization is not validation.** Lesson 121's rules decide whether the *input* is
  acceptable; policies decide whether the *user* may act. A valid request can still be a 403.

## 8. Common Mistakes

❌ Checking auth instead of authorization — "the user is logged in" is not "the user may
delete this post":

```php
if (Auth::check()) { $post->delete(); }   // ❌ any logged-in user
```

❌ Forgetting `authorize()` in the controller because the button is hidden in Blade. The
front end hiding a button is a *convenience*, not a security boundary:

```blade
@can('delete', $post)
    <form method="POST" action="/posts/{{ $post->id }}">…</form>
@endcan
```

Every mutation endpoint must still `authorize()` server-side.

❌ Hard-coding a user id check in the controller instead of the policy — the same rule then
drifts between controller, middleware and template.

❌ Returning `false` from `before()` for non-admins — that *blocks* everyone else from ever
reaching the per-ability method:

```php
return $user->hasRole('admin');   // ❌ non-admins now fail EVERY ability
return $user->hasRole('admin') ? true : null;   // ✅ fall through for everyone else
```

## 9. Best Practices

✅ One policy per model; register in `AuthServiceProvider` (or rely on auto-discovery)

✅ `authorize()` in every mutating controller method — Blade `@can` is presentation only

✅ Use `can:ability,model` route middleware for routes that are *entirely* gated

✅ Bundle roles, check abilities — roles are grouping, abilities are the checks

✅ Make `before()` the super-admin bypass and return `null` to fall through

✅ Unit-test policies like any other class — they're plain PHP with a bool return

❌ Don't duplicate the rule in the controller, the route *and* the template — define once

❌ Don't trust a client-sent `role` field; roles come from your database, not the payload

## 10. Interview Questions

**Q1. Gates vs Policies — when do you use each?**

> Gates are closures for a handful of abilities that don't fit a model — "view the admin
> panel". Policies are classes grouped around one model, with methods for `view`, `create`,
> `update`, `delete`. I default to policies for anything model-shaped, and gates for the few
> app-wide abilities.

**Q2. How do you protect a controller action?**

> `$this->authorize('update', $post)` — the Gate looks up the `PostPolicy`, runs `update()`,
> and throws a 403 when it returns false. Alternatively, middleware `can:update,post` on the
> route. Same ability, two call sites.

**Q3. How are policies registered?**

> Two ways: auto-discovery by naming convention (`Post` → `PostPolicy` in
> `app/Policies/`), or explicitly in `AuthServiceProvider::boot()` with
> `Gate::policy(Post::class, PostPolicy::class)`. Explicit registration wins when the
> convention doesn't hold.

**Q4. How do you handle roles and permissions?**

> For anything real, `spatie/laravel-permission` — it gives `hasRole()`, `hasPermissionTo()`,
> and the `HasRoles` trait on the User model. Hand-rolled is fine when there are a couple of
> rules: a `role` column and a Gate that checks it. The pattern I'd defend: assign roles,
> check abilities — roles bundle permissions, and the checks reference the ability, not the
> role, so a rename doesn't touch code.

**Q5. How do you do admin-only checks?**

> A `before()` method on the policy returning `true` for super-admins, which short-circuits
> before the per-ability method runs. Or a Gate like `view-admin` that checks the role. The
> `before()` version keeps "is this user exempt from everything?" in one place.

**Q6. What's the difference between `@can` in Blade and `authorize()` in the controller?**

> Nothing in the rule — both evaluate the same policy. The difference is the enforcement
> point: `authorize()` is the security boundary that must exist on the server, `@can` only
> hides or shows UI. Hiding the button without authorizing the endpoint is a bug.

**Senior follow-up: An intern added a `role` column and checks `$request->role === 'admin'`. Why is that dangerous?**

> The client decides its own role — anyone can POST `role: admin`. Roles must come from the
> server's own data, tied to the authenticated user. Authorization decisions are derived from
> identity (the session user), never from user-supplied input.

## 11. Follow-up Questions

**What is middleware `can:` and when would you use it?**

> Route middleware that runs the policy check before the controller — `Route::put('/posts/{post}', …)->middleware('can:update,post')`. I use it when the *entire* route is gated, so
> the controller can skip `authorize()`. Route-model binding resolves `{post}` first, then the
> middleware checks the policy against it.

**Can you authorize a whole resource in one line?**

> With `authorizeResource()` in the controller constructor, which registers `viewAny`, `view`,
> `create`, `update`, `delete` middleware for the resource routes automatically. Good for
> CRUD-heavy controllers that follow the convention; I'd avoid it when routes are selective.

**How do you show or hide UI based on authorization?**

> `@can('update', $post)` … `@endcan` in Blade, or the `@cannot` inverse. It's the same
> policy the server enforces, so the UI can't disagree with the endpoint.

**How do you test policies?**

> As unit tests — instantiate the policy, call the method with a user and a model, assert the
> bool. Laravel also gives `actingAs($user)` in feature tests so the middleware and controller
> path are covered end-to-end.

## 12. Comparison Table

| | **Gates** | **Policies** |
|---|---|---|
| Shape | Closure | Class |
| Scope | App-wide abilities | One model's abilities |
| Registration | `Gate::define` in `AuthServiceProvider` | Auto-discovered or `Gate::policy` |
| Example | `view-admin` | `PostPolicy::update` |
| When to use | A few abilities, no model | Model-centric CRUD |

| | **Role-based** | **Ability-based** |
|---|---|---|
| Question | "Are you an admin?" | "Can you publish?" |
| Granularity | Coarse | Fine |
| Survives role rename | ❌ code breaks | ✅ |
| Typical impl | `role` column / `hasRole` | Policy methods / `hasPermissionTo` |
| Senior answer | Roles bundle permissions | Checks reference abilities |

| | `authorize()` | `can:` middleware | `@can` |
|---|---|---|---|
| Where | Controller | Route | Blade |
| Security boundary | ✅ | ✅ | ❌ (UI only) |
| Runs per request | When called | Before controller | Render time |

## 13. Code Example

A complete ownership policy with admin bypass, wired through controller, route, and Blade:

```php
// app/Policies/PostPolicy.php
namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;           // admins pass every check
        }
        return null;               // everyone else: run the method below
    }

    public function viewAny(User $user): bool
    {
        return true;               // all authenticated users may list posts
    }

    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

```php
// app/Providers/AuthServiceProvider.php
protected $policies = [
    Post::class => PostPolicy::class,   // explicit (auto-discovery also works)
];
```

```php
// PostController
public function update(UpdatePostRequest $request, Post $post)
{
    $this->authorize('update', $post);
    $post->update($request->validated());
    return redirect()->route('posts.show', $post);
}
```

```blade
@can('update', $post)
    <a href="/posts/{{ $post->id }}/edit">Edit</a>
@endcan
```

```php
// web.php
Route::put('/posts/{post}', [PostController::class, 'update'])
    ->middleware('can:update,post');   // or keep authorize() in the controller
```

```narrate
line 6:  before() short-circuits the whole policy for admins — one place, not per method
line 9:  null (not false!) lets non-admins reach the specific methods
line 14: viewAny — a list permission shared by every authenticated user
line 17: the core ownership rule, single source of truth
line 26: explicit registration; auto-discovery would find PostPolicy anyway
line 32: authorize() throws 403 on false — the server-side boundary
line 39: @can only toggles the button — it is never the security boundary
line 45: can:update,post with route-model binding checks BEFORE the controller
```

Behavior with three different users:

```text
PATCH /posts/1   (user 42, post.user_id 42)            → 200 updated
PATCH /posts/1   (user 7,  post.user_id 42)            → 403 Forbidden
PATCH /posts/1   (user 7,  role admin via before())    → 200 updated
GET   /posts     (any authenticated user)              → 200 list
```

## 14. Performance Notes

- **A policy check is a function call** — microseconds. The queries it runs are the only cost:
  an ownership check that must fetch the post first (route-model binding already did), or a
  role lookup. Keep policy methods query-light; `load()` relations instead of re-querying.
- **`before()` runs on every ability check** for that policy — a role query per check is fine,
  but cache the role lookup when the same user hits many gated routes in one request
  (Lesson 129 covers caching).
- **N+1 danger hides in templates.** `@can('update', $post)` inside a `@foreach` over 100
  posts fires 100 policy evaluations. If each one queries the owner, that's a query-per-row.
  Policy methods are cheap; make sure what they touch is already loaded.
- When it doesn't matter: a boolean comparison on already-loaded models costs nothing. The
  mistake is policy methods that *trigger* queries in a loop.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| 403 for the owner of the resource | Policy checks the wrong key (`post.user_id` vs `created_by`) | Align the policy with the actual schema; test the policy directly |
| `@can` hides the button but the route still works | No server-side check on the endpoint | Add `authorize()` or `can:` middleware — UI hiding is not security |
| Policy method never runs | `before()` returns `false` (not `null`) for non-admins | Return `null` to fall through to the specific method |
| "Policy does not exist" / 403 on everything | Naming convention mismatch (`PostPolicy` vs `PostsPolicy`) | Rename, or register explicitly with `Gate::policy` |
| Gate works in `tinker` but not in tests | Policy registered in a provider not loaded in the test environment | Register in `AuthServiceProvider` and run `RefreshDatabase` in the test |
| Every user can delete everything | Policy registered but `authorize()` forgotten in the controller | Add `$this->authorize('delete', $post)` to the action |

## 16. Quick Revision Notes

- **Authorization = what you're allowed to do; authentication = who you are** (Lesson 122)
- **Gates** = closures for a few abilities; **Policies** = classes grouped around a model
- Registration: auto-discovery (`Post` → `PostPolicy`) or `Gate::policy(Post::class, …)`
- Call sites: `authorize('update', $post)` · `can:update,post` middleware · `@can('update', $post)`
- `create` gets the class, not an instance; `update`/`delete` get the model
- `before()` = super-admin bypass; return `true` to allow, **`null` to fall through**, never blanket `false`
- Roles bundle permissions; checks reference abilities — survives role renames
- `spatie/laravel-permission` for real role systems; hand-roll only for trivial cases
- `@can` is UI; `authorize()`/`can:` middleware is the actual boundary
- Server-side identity, never client-sent roles

## 17. Cheat Sheet

```text
Gates
  Gate::define('view-admin', fn (User $u) => $u->is_admin);
  Gate::allows('view-admin') | Gate::denies('view-admin') | Gate::forUser($u)->allows(...)

Policies
  make:policy PostPolicy --model=Post
  methods: viewAny view create update delete restore forceDelete
  create(User $user) — no model; others get the model
  before(User $user, string $ability): ?bool   → true allow / null fall through

Registration
  AuthServiceProvider::$policies = [ Post::class => PostPolicy::class ]
  (or rely on App\Policies naming auto-discovery)

Call sites
  $this->authorize('update', $post)            // controller, 403 on false
  $request->user()->can('update', $post)       // on the user
  Route::put(...)->middleware('can:update,post') // route level, RMB first
  @can('update', $post) … @endcan              // Blade — UI only
  @cannot('update', $post) … @endcannot

Roles & permissions
  spatie/laravel-permission:
    $user->assignRole('editor') | hasRole('admin')
    $user->givePermissionTo('publish') | hasPermissionTo('publish')
  hand-rolled: role column + Gate closure checking it

Controller shortcut
  authorizeResource() → wires viewAny/view/create/update/delete middleware
```

## 18. Key Takeaways

> [!RECAP]
> - **Auth = who you are; authorization = what you're allowed to do** — the one-liner to say first
> - **Gates** are closures for a few app-wide abilities; **Policies** are classes per model
> - Policies auto-discover by convention or register via `AuthServiceProvider`
> - Enforce with `authorize()` in the controller, `can:` middleware on the route, `@can` in Blade
> - `create` policies receive the class; model actions receive the instance
> - `before()` is the admin bypass — return `true` or `null`, never a blanket `false`
> - **Roles bundle permissions, abilities are what you check** — rename-proof and granular
> - `spatie/laravel-permission` for real systems; hand-roll only the trivial two-rule case
> - Blade `@can` hides UI; the server-side `authorize()` is the actual boundary
> - Roles come from your database, never from the request payload

## Check your understanding

Answer these without looking back.

1. Say the auth-vs-authorization rule exactly, and give one example of each.
2. When do you reach for a Gate instead of a Policy? Give a concrete ability for each.
3. Write the `update` policy for a `Post` owned by `user_id`, then the controller call that uses it.
4. How does `before()` work, and why must non-admins get `null` rather than `false`?
5. Name the three call sites for one ability, and which one is *not* a security boundary.
6. How would you add roles and permissions — and what does `spatie/laravel-permission` give you?
7. Why is trusting a `role` field from the request a security bug?
8. What does `can:update,post` middleware do with route-model binding?
9. Where does an N+1 problem hide in authorization, and how do you avoid it?

## What's Next

**Lesson 124 — Queues & Jobs.** Identity and permission checks are done — now the work that
*waits*. Queues, jobs, `dispatch()`, retries and timeouts: how Laravel moves slow work off the
request path.
