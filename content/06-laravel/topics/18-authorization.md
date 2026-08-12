# Topic 18 — Authorization

**Checklist anchor:** gates · policies · `authorize()` · middleware · roles · permissions · auth vs authz

**Owning lesson:** [123 Authorization](../123-authorization.md)

---

## The one-sentence answer

**Authorization is permission — "what are you allowed to do?" — expressed in Laravel as gates (simple closures) and policies (per-model classes), checked with `can()`/`authorize()`.**

## The mental model

The checklist's pair:

> **Authentication = Who are you?**
> **Authorization = What are you allowed to do?**

Authorization is the *second* question. The user is logged in (authenticated); now — can they delete *this* post? The answer depends on the **resource** (`$post->user_id === $user->id`) and the **role** (admin bypasses). That's a policy.

## How it works

### Gates — simple closures

```php
// AppServiceProvider::boot()
Gate::define('manage-users', fn (User $user) => $user->is_admin);

// usage:
Gate::allows('manage-users');                 // boolean
$request->user()->can('manage-users');        // on the user
```

Gates are one-liner checks — good for abilities that don't map to a resource.

### Policies — per-model authorization

```php
php artisan make:policy PostPolicy --model=Post
```

```php
class PostPolicy
{
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->is_admin;
    }
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

Registered automatically by naming convention (`PostPolicy` ↔ `Post`), or explicitly in a provider.

### Checking — the three ergonomics

```php
// in a controller:
public function update(Post $post)
{
    $this->authorize('update', $post);       // 403 on failure — cleanest
}

// on the user model:
$request->user()->can('update', $post);      // boolean

// in Blade:
@can('update', $post) {{-- show the button --}} @endcan
```

`authorize()` is the controller pattern: it throws `AuthorizationException` → **403** when the user isn't allowed, and the controller body only runs for authorized users.

### Middleware & roles

```php
// route-level gate:
Route::put('/posts/{post}', ...)->middleware('can:update,post');

// roles/permissions: typically via a package (Spatie) or your own role table
// a policy can consult roles:
public function delete(User $user, Post $post): bool
{
    return $user->hasRole('admin') || $user->id === $post->user_id;
}
```

**Roles** (what group you're in) and **permissions** (what you may do) are the data model; **policies/gates** are the enforcement. Laravel ships the enforcement; roles/permissions are your schema (or Spatie's).

## Middleware vs policy — the line (checklist #3's question)

| | Middleware (`can:update,post`) | Policy (`authorize()`) |
|---|---|---|
| Level | **Route level** — gates the whole route | **Action level** — inside the controller |
| Applies to | Everyone hitting the route | The specific action on the specific model |
| Use for | "Is this whole area admin-only?" | "Can *this* user do *this* thing *to this record*?" |
| Both | Middleware first (route gate), policy second (record check) | Same answer |

Middleware answers "should this route exist for you at all?"; the policy answers "may you touch *this* record?" Real apps use both layers.

## Interview questions

**Q1. What is authorization, and how does it differ from authentication?**
> Authentication is identity — proving who you are. Authorization is permission — what that identity may do. A user is authenticated when logged in; authorization decides whether they can update a specific post. In HTTP terms: 401 is auth (not logged in), 403 is authz (logged in but not allowed).

**Q2. Gates vs policies?**
> Gates are simple closures for abilities that aren't resource-scoped — `Gate::define('manage-users', fn ($u) => $u->is_admin)`. Policies are per-model classes with methods like `update(User, Post)` — the resource-aware form. Rule of thumb: gates for one-off abilities, policies for anything tied to a model. Policies also auto-discover by naming convention.

**Q3. How does `authorize()` work?**
> `$this->authorize('update', $post)` in a controller resolves the policy for `Post`, calls its `update` method with the current user, and throws an `AuthorizationException` (→ 403) if it returns false. If it returns true, the next line runs. It's the declarative form of "check permission, then act."

**Q4. How do roles and permissions fit?**
> Roles and permissions are the *data* — which groups exist and what each may do. Policies and gates are the *enforcement*. You typically model roles/permissions in the DB (or with Spatie's package) and have policies consult them: `$user->hasRole('admin') || $user->id === $post->user_id`. The policy is where the rule lives; the role/permission tables feed it.

**Q5. Middleware vs policy — when do you use which?**
> Middleware gates at the route level — "this route is admin-only" — with `->middleware('can:update,post')`. The policy gates at the action level — inside the controller, `$this->authorize('update', $post)` — deciding about the specific record. Route middleware first, policy second: the route decides who reaches the action; the policy decides what they may do to the record.

**Senior follow-up: How do you authorize in a service layer?**
> `Gate::authorize('update', $post)` works anywhere, not just controllers — call it at the top of the service method so the service enforces permission regardless of caller (controller, command, job). The senior shape: the *service* is the enforcement point, so no caller can bypass the check.

## Common mistakes

❌ Authorization checks only in views — hiding a button isn't authorization; the server must enforce.

❌ Only route middleware, no policy — the route gate doesn't know about the specific record.

❌ Policy methods returning true for everyone — a missing `$user` check is a data leak.

❌ Checking roles with string soup — keep the role logic in the policy, not scattered `if ($user->role === 'admin')`.

## Quick revision notes

- **Authorization = permission** · Authentication = identity
- **Gates** = closures (one-off abilities) · **Policies** = per-model classes
- `authorize()` in controller → **403** on failure · `can()` → boolean · `@can` → Blade
- Middleware gates **routes**; policies gate **records** — both layers
- **Roles/permissions** = data · **policies/gates** = enforcement

## Check your understanding

1. Auth vs authz — give the one-sentence distinction.
2. When do you reach for a gate instead of a policy?
3. What happens when `authorize('update', $post)` fails?
4. How do roles feed policies?
5. Why is a button-hidden check not authorization?
