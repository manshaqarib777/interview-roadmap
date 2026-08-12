# Topic 17 — Authentication

**Checklist anchor:** auth vs authorization · guards · providers · sessions · API auth · Sanctum · Passport · Fortify · hashing · remember me · email verification · password reset

**Owning lesson:** [122 Authentication](../122-authentication.md)

---

## The one-sentence answer

**Authentication is identity — "who are you?" — and Laravel does it through guards that resolve a user from a session, token, or API credential, with Sanctum, Passport, and Fortify as the first-party flavours.**

## The mental model

**Authentication ≠ authorization.** The checklist's sharpest distinction:

> **Authentication = Who are you?** (prove an identity — login, token)
> **Authorization = What are you allowed to do?** (permissions on that identity — Lesson 18/123)

Auth answers "who"; authz answers "what may they do." A user is authenticated but not authorized (logged in, not an admin); a request can be authorized without being authenticated (a public route).

Laravel's architecture is a **guard** — the thing that says "who is this request?":

```text
request → guard (session | token | Sanctum) → User (or null)
```

- **Guards** define *how* a request authenticates (session for web, token for API).
- **Providers** (the auth provider, `users` table) define *where* users come from.

## How it works

### The web flow (sessions)

```php
// routes/web.php
Route::post('/login', [AuthController::class, 'login']);

// controller
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (Auth::attempt($credentials, $request->boolean('remember'))) {
        $request->session()->regenerate();          // session fixation defence
        return redirect()->intended('/dashboard');
    }

    return back()->withErrors(['email' => 'Invalid credentials.']);
}
```

The session guard stores the user id in the session; subsequent requests resolve the user from it. **Remember me** extends the session with a cookie-based token so the login survives the session ending.

### Password hashing — the non-negotiable

```php
// never store plaintext — Hash::make on write, Hash::check on login
User::create(['password' => Hash::make($request->password)]);
Hash::check($request->password, $user->password);   // what Auth::attempt does
```

### Email verification & password reset

```php
// the MustVerifyEmail contract on User → verified middleware
Route::get('/profile', ...)->middleware('verified');

// password reset: the forgot-password flow, token-based, via mail
```

### API authentication — the three first-party options

| | Sanctum | Passport | Fortify |
|---|---|---|---|
| What | Token/SPA auth, first-party API | Full **OAuth2** server | Auth *backend* (login, 2FA, pipelines) |
| Best for | Your own SPA + mobile app | Third-party apps needing OAuth2 grants | Server-rendered auth, Laravel's UI scaffolding |
| Token model | Personal access tokens, cookie-based SPA sessions | Access/refresh tokens, clients, scopes | Sessions/guards — not an API token system |
| The question | "My own API" | "Let others in via OAuth2" | "The login/register/reset backend" |

**Sanctum vs Passport** (the very common question): Sanctum is for your own app — simple personal access tokens and cookie-based SPA auth. Passport is a full OAuth2 server — needed only when *third parties* (or multiple client apps) must authenticate with access/refresh tokens and scopes. For a first-party SPA/mobile, Sanctum; for a public API with external clients, Passport. Lesson 19 and 20 have the depth.

## Interview questions

**Q1. Authentication vs authorization?**
> Authentication is identity — proving who you are via credentials or a token. Authorization is permission — what that identity is allowed to do. A logged-in user is authenticated; whether they can delete a post is authorization. Laravel: guards/auth for the first, gates/policies for the second.

**Q2. What are guards and providers?**
> A guard is the mechanism that authenticates a request — the session guard for web, token/Sanctum for API. An auth provider is the source of users — the Eloquent provider querying the `users` table. Config wires which guard uses which provider; `Auth::user()` is the result.

**Q3. Sanctum vs Passport?**
> Sanctum is for your own first-party API: simple personal access tokens, token abilities, and cookie-based SPA sessions with CSRF. Passport is a full OAuth2 server — access/refresh tokens, clients, scopes — for when third-party apps must authenticate against your API. Sanctum for your app; Passport for opening the API to others.

**Q4. What does Fortify give you?**
> The authentication *backend* — login, registration, password reset, email verification, and 2FA — as headless services. Fortify is the plumbing behind Laravel's auth scaffolding (Breeze/Jetstream use it): you keep control of the frontend, Fortify handles the flows.

**Q5. Why is password hashing non-negotiable?**
> Passwords must never be stored plaintext. `Hash::make` on write (bcrypt/argon) and `Hash::check` on login — if the database leaks, the hashes are the only thing an attacker gets, and they can't be reversed to the originals. `Auth::attempt` does the check for you.

**Senior follow-up: How do you secure the session?**
> Regenerate the session id after login (fixation defence), use HTTPS-only `Secure` cookies, expire sessions appropriately, and enable remember-me only where acceptable. Session fixation — attacker pre-sets your session id, you log in, they share it — is killed by `$request->session()->regenerate()` after `Auth::attempt`.

## Common mistakes

❌ Storing plaintext passwords — the unforgivable auth bug.

❌ Confusing auth and authz — 401 (identity) vs 403 (permission) in APIs (Lesson 25).

❌ Skipping session regeneration after login — the fixation hole.

❌ Using Passport where Sanctum suffices — OAuth2 complexity for a first-party app.

## Quick revision notes

- **Auth = who are you** · **Authz = what may you do**
- **Guards** (session/token) × **providers** (user source) → `Auth::user()`
- Hash on write (`Hash::make`), check on login (`Hash::check` / `Auth::attempt`)
- **Sanctum** = first-party API · **Passport** = OAuth2 for third parties · **Fortify** = auth backend
- Remember me, email verification, password reset — all guards/providers on top of the same shape
- `session()->regenerate()` after login = fixation defence

## Check your understanding

1. Authentication vs authorization — give one sentence each.
2. What does a guard do, and how is it different from a provider?
3. When do you reach for Sanctum vs Passport?
4. Why does `Hash::make` belong at write time, not login time?
5. What's the session-fixation defence, and where does it go?
