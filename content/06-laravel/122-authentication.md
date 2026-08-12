# Lesson 122 — Authentication

**Interview importance:** ⭐⭐⭐⭐⭐ — auth is asked in *every* backend round, and the
Sanctum vs Passport comparison is where full-stack interviews separate people who have shipped
an API from people who have read about one.

**Authentication is who you are.** It answers the identity question — are you the person you
claim to be? — with something you know (a password), something you have (a token), or
something you are (a fingerprint). The next lesson, Authorization, asks a different question:
*given who you are, what are you allowed to do?* Hold those two apart and every auth interview
answer you give will stay coherent.

The interesting part of Laravel auth isn't the login form — it's the machinery around it.
Guards decide *how* a request identifies itself (session cookie, bearer token, SPA cookie),
providers decide *where* identities come from (your `users` table, an LDAP directory, an API),
and the Sanctum/Passport/Fortify family decides *which of those worlds* your app lives in. Get
that map right and "explain how login works" becomes a five-minute answer with a diagram.

## Learning Objectives

By the end of this lesson you should be able to:

- Say the auth-vs-authorization one-liner without mixing them up
- Explain guards and providers and why they are separate concepts
- Give the login flow start-to-finish: form → validate → `Auth::attempt` → hash check → session → cookie
- Compare Fortify, Breeze and Jetstream precisely, and say which you'd scaffold
- Compare Sanctum vs Passport: SPA cookie auth vs OAuth2 tokens, and when each is right
- Explain why passwords are hashed (`Hash::make`, bcrypt/argon) and never stored plaintext
- Cover remember me, email verification and password reset from memory

## 1. What is Authentication?

**Authentication is proving who you are — establishing the identity of the request, and keeping that identity across subsequent requests.**

Two distinct jobs hide in that sentence, and they're the whole subject:

- **Proof of identity, once** — the login step. *Is this really Ada, proving it with the password only Ada knows?*
- **Maintaining the identity, on every request after** — the *state* step. *How does the server know request #47 is still Ada?*

Laravel splits these across two moving parts. **Guards** answer "how does this request carry
its identity?" **Providers** answer "where do I look up who that identity belongs to?" Both
are configured in `config/auth.php`, and they are independent choices — you can swap a guard
without touching the provider.

## 2. Mental Model

Think of auth as a **building with two doors**.

The first door is the *login*: the guard checks your badge (credentials) and, if valid,
issues you a **lanyard** — the session cookie or token. The second door is every request
after: you walk in holding the lanyard, and the guard checks that the lanyard is still valid
without making you re-prove your identity.

- **Guard** = the door policy: *session-based lanyard*, *bearer-token lanyard*, or *SPA cookie*.
- **Provider** = the employee directory the door staff check: *users table*, *LDAP*, *an API*.
- The **lanyard** is what makes stateless HTTP feel stateful: the server recognises you
  because of the cookie/token you carry, not because it remembers you.

## 3. Visual Flow

```text
       login request                        every request after
   POST /login {email, password}            GET /dashboard  (with session cookie)
        │                                           │
        ▼                                           ▼
 ┌───────────────┐                          ┌──────────────┐
 │ guard: web    │                          │ guard: web   │
 │ Auth::attempt │                          │ session check│
 └──────┬────────┘                          └──────┬───────┘
        │                                          │
        ▼                                          ▼
 ┌───────────────┐   SELECT * FROM users     ┌─────────────┐
 │ provider:     │◄─── WHERE email = ?       │ cookie in   │
 │ users table   │      Hash::check(raw,     │ session?    │
 └──────┬────────┘      stored hash)         └──────┬──────┘
        │                                          │
   ┌────┴─────┐                                ┌────┴─────┐
   ▼          ▼                                ▼         ▼
 fail       pass                            valid     invalid
   │          │                                │         │
   ▼          ▼                                ▼         ▼
 back with  regenerate session id           route     302 → /login
 error      write user id to session        continues
            set remember-me cookie (opt)       │
                                                ▼
                                       auth('sanctum') for SPAs
                                       instead: cookie → user via
                                       CSRF + session, no token sent
```

> [!TIP]
> Notice the asymmetry: the *login* step proves identity with the password; the *session*
> step proves it with the cookie. The password should never travel again after login.

## 4. How It Works

The classic login controller:

```php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email'    => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (! Auth::attempt($credentials, $request->boolean('remember'))) {
        return back()->withErrors(['email' => 'Invalid credentials.']);
    }

    $request->session()->regenerate();   // prevent session fixation
    return redirect()->intended('/dashboard');
}
```

`Auth::attempt` does the whole dance: look up the email via the provider, run
`Hash::check($rawPassword, $storedHash)`, and — only if both match — write the user's id into
the session. `redirect()->intended()` returns the user to the page they originally wanted.

What actually happens, step by step:

```text
POST /login {email: ada@example.com, password: 'correct-horse'}

1. validate: email format + password present               (Lesson 121 rules)
2. provider query:   SELECT * FROM users WHERE email = 'ada@example.com'
3. hash check:       Hash::check('correct-horse', '$2y$12$…stored…') → true
4. session:          $_SESSION['login_web_...'] = 42     (user id, nothing else)
5. session id cookie: Set-Cookie: laravel_session=<id>; HttpOnly; SameSite=Lax
6. redirect:         302 → /dashboard
```

Wrong password? Step 3 returns `false` — the lookup happened, the hash comparison failed,
and `Auth::attempt` returns `false`. Laravel never tells you *which* half failed, on purpose:
"invalid credentials" doesn't leak whether the email exists.

> [!PITFALL]
> **Session fixation.** `Auth::attempt` alone leaves the session id unchanged, so an attacker
> who fixed a victim's session id keeps control after login. `$request->session()->regenerate()`
> issues a fresh id at the exact moment identity changes. Never skip it on login.

## 5. Real Project Usage

| App shape | Guard | What carries identity |
|---|---|---|
| Traditional web app (Blade) | `web` | Session cookie |
| API consumed by mobile/third party | `sanctum` / `passport` | Bearer token (or OAuth2 access token) |
| SPA (Vue/React) talking to a Laravel API | `sanctum` | Cookie-based session, CSRF token in header |
| Admin panel with a separate auth domain | `admin` guard, custom provider | Its own session/guard config |
| Stateless microservice auth | `passport` | OAuth2 client-credentials tokens |

The "add a second guard" move, when an admin panel needs its own session:

```php
// config/auth.php
'guards' => [
    'web'   => ['driver' => 'session', 'provider' => 'users'],
    'admin' => ['driver' => 'session', 'provider' => 'admins'],
],
'providers' => [
    'users'  => ['driver' => 'eloquent', 'model' => App\Models\User::class],
    'admins' => ['driver' => 'eloquent', 'model' => App\Models\Admin::class],
],
```

Same session *driver*, different provider — the admin guard looks users up in a different
table entirely. Guards and providers are independently configurable, which is the entire
point of the split.

## 6. Interview Explanation

> Authentication establishes who the request is; authorization decides what that identity may
> do — and Laravel separates the machinery: guards define how identity is carried, providers
> define where identities come from.
>
> For a classic web app, the `web` guard uses a session cookie: `Auth::attempt` looks the user
> up via the provider, runs `Hash::check` on the password, and writes the user id into the
> session. I regenerate the session id on login to stop fixation.
>
> For APIs the question is *how the client proves identity per request*: Sanctum gives SPAs
> cookie-based auth (same session mechanism, CSRF-protected) and simple token auth for mobile;
> Passport is full OAuth2 with scopes and third-party clients. I'd pick Sanctum for a
> first-party SPA or mobile app, Passport when I need OAuth2 grants, and Fortify as the
> headless backend that powers either of them.

## 7. Senior-Level Insights

- **Auth is never "just do login".** The senior-level questions are *where does the session
  live, how does it scale, what happens when the token leaks*. The cookie/token choice is an
  architectural decision, not a preference.
- **Token auth and session auth have opposite failure modes.** Sessions are server-side state
  — revoke instantly, but need shared storage (Redis) across instances. Stateless tokens are
  self-verifying — no shared storage, but a leaked token lives until it expires, because the
  server can't revoke what it never stored. This trade-off *is* the Sanctum vs Passport
  discussion at one level.
- **`Hash::check` is intentionally slow.** bcrypt's cost factor (~100ms) is the defence
  against offline brute-force of a stolen database. That's why passwords are hashed with a
  per-user salt and a deliberately expensive algorithm — never plaintext, never MD5/SHA1.
- **The session stores the id, not the user.** Only the user id lives in the session. The user
  row is re-fetched per request, which is why an account can be deactivated and take effect
  immediately.
- **`remember me` is a second cookie.** A cryptographically random token stored in a
  `remember_token` column, matched via a separate lookup, not by storing the password or
  re-hashing it. If `remember_token` is NULL, there's nothing to remember.
- **Never trust a token the client sends "for auth" without a check.** Sanitising and
  validating input (Lesson 121) keeps bad data out; auth keeps *bad people* out. Different
  layers, both mandatory.

## 8. Common Mistakes

❌ Storing passwords in plaintext — or worse, hashing them with a fast algorithm like MD5/SHA1:

```php
User::create(['password' => $request->password]);            // ❌ plaintext
User::create(['password' => md5($request->password)]);       // ❌ fast + unsalted
User::create(['password' => Hash::make($request->password)]); // ✅ bcrypt (or argon2id)
```

❌ Logging someone in and **not regenerating the session id** — session fixation.

❌ Telling the user which half of the login failed. "Email not found" vs "wrong password" is a
user-enumeration attack.

❌ Sending the password in a GET request (it lands in URL logs) or over an unencrypted
connection.

❌ Putting the token in localStorage for an SPA, then wondering why XSS can read it — cookie +
CSRF is the SPA-correct shape (see Sanctum below).

## 9. Best Practices

✅ `Hash::make()` on write, `Hash::check()` on read — never hash manually, never plaintext

✅ Regenerate the session id on login *and* on logout

✅ `remember me` via `$request->boolean('remember')` + the `remember_token` column

✅ Rate-limit the login endpoint (Lesson 128) — the first defence against credential stuffing

✅ Give generic errors — "These credentials do not match our records."

✅ Force re-auth (`$this->passwordConfirm()` / `Auth::logoutOtherDevices`) for sensitive actions

❌ Don't roll your own crypto, tokens, or password storage

## 10. Interview Questions

**Q1. What is the difference between authentication and authorization?**

> Authentication is **who you are** — proving identity, usually with a password or token.
> Authorization is **what you're allowed to do** — whether that identity may perform a given
> action. They're sequential: you authenticate first, then authorization checks apply.
> Laravel implements auth with guards and providers, and authorization with Gates and
> policies (Lesson 123).

**Q2. Explain the difference between guards and providers in Laravel.**

> Guards define *how* a request proves identity: session cookie, bearer token, or Sanctum's
> SPA cookie. Providers define *where* the identity comes from: typically the Eloquent `User`
> model, but the concept supports any data source. They're configured separately in
> `config/auth.php` and are independent — one guard can use a different provider, and you can
> have multiple guards on the same provider.

**Q3. What happens when a user logs in? Walk me through it.**

> The login request is validated. `Auth::attempt` uses the configured provider to look the
> email up, then `Hash::check` compares the submitted password against the stored bcrypt hash.
> On success the user's id is written into the session, the session id is regenerated, and an
> optional remember-me token is stored. Every later request with the session cookie is
> recognised as that user without re-checking the password.

**Q4. How are passwords stored, and why?**

> Hashed with bcrypt by default (`Hash::make`), or argon2id if configured. Hashing is
> one-way and deliberately slow, with a per-user salt, which makes a stolen database
> impractical to brute-force offline. Plaintext or fast hashes like MD5 make a breach
> catastrophic. The point of `Hash::check` is to verify a password without ever storing it.

**Q5. Sanctum vs Passport — when would you use each?**

> Sanctum handles first-party SPA auth with cookie-based sessions and simple per-device tokens
> for mobile. Passport is a full OAuth2 implementation — access tokens, refresh tokens,
> scopes, and client applications — for third-party integrations. Sanctum is the default for
> a Laravel app's own front end; Passport when external services need OAuth2 grants. Fortify
> is the headless backend (login, reset, verification endpoints) that can sit behind either.

**Q6. What does "remember me" actually store?**

> A random token in the user's `remember_token` column, and a `remember_web_<hash>` cookie
> holding the id plus that token. On a returning request the guard looks the token up and
> restores the session. It never stores the password or a reversible form of it.

**Senior follow-up: Your API's tokens were leaked in a repo. What do you do?**

> Revoke them. Sanctum tokens are stored rows, so I can delete or expire the leaked ones
> immediately — that's the argument for server-stored tokens. With a stateless JWT I'd have
> to wait out the expiry or add a denylist. Then rotate secrets, check logs for use of the
> leaked tokens, and move the secrets out of the repo into the environment. The lesson: token
> storage is a revocation decision.

## 11. Follow-up Questions

**How does email verification work?**

> The `MustVerifyEmail` interface on the User model adds an `email_verified_at` column and a
> signed verification link (sent via a notification) that sets it. The `verified` middleware
> blocks routes until it's set. Login itself isn't blocked — unverified users can log in but
> can't reach verified-only routes.

**How does password reset work?**

> The `Password` facade mints a short-lived, single-use token tied to the email, stores it in
> the `password_reset_tokens` table, and emails a link. The reset form validates
> `required|confirmed`, then `Password::reset` updates the hash and invalidates the token.
> The token is the credential — it should be treated with the same care as a password.

**What is session fixation, exactly?**

> An attacker sets the victim's session id before login, then waits. If login doesn't
> regenerate the id, the attacker shares the *same* session id and inherits the victim's
> authenticated state. Regenerating on login severs that — a new id the attacker never saw.

**Do sessions work across multiple servers?**

> Not by default — sessions are stored in files on one server. Behind a load balancer you
> switch the session driver to Redis (or another shared store) so any instance can read the
> session. That's a standard senior deployment question (Lesson 131).

## 12. Comparison Table

| | **Fortify** | **Breeze** | **Jetstream** |
|---|---|---|---|
| What it is | Headless auth backend | Minimal auth *scaffold* | Full-featured app starter |
| Login/register/reset endpoints | ✅ | ✅ | ✅ |
| UI | None (JSON/redirect API only) | Simple Blade or Livewire/React/Vue | Tailwind + Livewire/Inertia |
| Two-factor / team management | ✅ (add-ons) | ❌ | ✅ built in |
| Choose when | Custom front end, API-first | Small app, learn the basics | Production-ready feature set out of the box |

| | **Sanctum** | **Passport** |
|---|---|---|
| Type | SPA cookie auth + simple personal tokens | Full OAuth2 server |
| SPA auth | Cookie + CSRF token | Not the primary path |
| Mobile / API | Personal access tokens | OAuth2 access + refresh tokens, scopes |
| Third-party clients | ❌ | ✅ (client credentials, auth code grants) |
| Revocation | Delete the token row | Revoke tokens/refresh tokens via grants |

## 13. Code Example

A complete `LoginRequest` → controller → route, with remember-me and rate limiting, plus a
Sanctum-protected API route for the SPA:

```php
// App\Http\Requests\LoginRequest
public function authorize(): bool
{
    return true;   // anyone may attempt to log in
}

public function rules(): array
{
    return [
        'email'    => ['required', 'email'],
        'password' => ['required', 'string'],
        'remember' => ['sometimes', 'boolean'],
    ];
}
```

```php
// web.php
Route::post('/login', function (LoginRequest $request) {
    if (! Auth::attempt($request->validated(), $request->boolean('remember'))) {
        throw ValidationException::withMessages([
            'email' => 'These credentials do not match our records.',
        ]);
    }

    $request->session()->regenerate();
    return redirect()->intended('/dashboard');
})->middleware('throttle:5,1');

// SPA route — cookie-based auth, CSRF checked, no bearer token needed
Route::get('/api/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

```narrate
line 5:  valid input first — Lesson 121's rules running before any auth work
line 8:  the whole identity check: provider lookup + Hash::check
line 12: generic message — never reveal which credential was wrong
line 17: regenerate the session id the moment identity changes
line 20: throttle:5,1 — max 5 attempts per minute (Lesson 128)
line 25: auth:sanctum reads the SPA session cookie, not a bearer token
```

Behavior:

```text
POST /login {email: ada@example.com, password: 'wrong'}
→ 422 { "message": "These credentials do not match our records." }
  (6th attempt in a minute) → 429 Too Many Requests

POST /login {email: ada@example.com, password: 'correct'}
→ 302 → /dashboard
  Set-Cookie: laravel_session=<id>; HttpOnly; SameSite=Lax

GET /api/user  (with session cookie, no Authorization header)
→ 200 { "id": 42, "name": "Ada Lovelace", "email": "ada@example.com" }
```

The SPA's fetch, using the Sanctum cookie flow:

```js
// First, fetch a CSRF cookie from /sanctum/csrf-cookie
await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

const res = await fetch('/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') },
  body: JSON.stringify({ email, password }),
});
```

## 14. Performance Notes

- **`Hash::check` is the expensive step.** bcrypt deliberately costs ~50–100ms. That's
  per-login, which is fine — but never hash inside a request-hot loop, and prefer password
  hashing off the request path (e.g. in a queued job) where you can.
- **`Auth::check` on every request re-queries the user** from the session-stored id. Cache the
  authenticated user (`cache()->remember`) only when the profile is read constantly — and
  invalidate on profile update.
- **Session storage is a shared-state problem.** File sessions don't survive load balancing;
  switch to Redis before traffic grows (Lesson 131 covers the deployment side).
- When hashing cost matters at scale: tune bcrypt rounds to your hardware, and consider
  `argon2id` for a memory-hard alternative. There is no "fast bcrypt" — the slowness is the feature.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| Login always fails, credentials are correct | `password` column stores something other than a `Hash::make` output | Re-hash the seed/import; check `Hash::check` against the raw string |
| Logged in, but next request is redirected to login | Session cookie not sent (SameSite/`secure` misconfig) or session driver not shared across servers | Check `SESSION_DRIVER` behind the LB; verify `SESSION_SECURE_COOKIE`/`SameSite` |
| "Too many redirects" on /login | Auth middleware guarding the login route itself | `guest` middleware for guest-only routes instead of `auth` |
| SPA gets 419 Page Expired on login | CSRF token mismatch — Sanctum SPA flow needs `/sanctum/csrf-cookie` first and the `X-XSRF-TOKEN` header | Fetch the CSRF cookie, send `X-XSRF-TOKEN` on every mutating request |
| Remember-me works in dev, forgets in prod | `remember_token` column missing, or cookie `secure` flag drops on http | Run the migration, check cookie flags match the environment |
| Sessions clash between users on shared hosting | File-based sessions colliding on one disk | Per-site `SESSION_DRIVER`/`SESSION_PATH`, or move to a shared store |

## 16. Quick Revision Notes

- **Auth = who you are; authorization = what you're allowed to do** (Lesson 123)
- **Guard** = how identity is carried (session cookie / bearer token / SPA cookie)
- **Provider** = where identities come from (Eloquent `User`, LDAP, API)
- Login flow: validate → provider `SELECT` → `Hash::check` → session id write → **regenerate** → redirect
- `Auth::attempt($credentials, $remember)`; `Hash::make` / `Hash::check`
- Passwords: bcrypt/argon2id, per-user salt, never plaintext, never MD5/SHA1
- **Fortify** = headless backend; **Breeze** = minimal scaffold; **Jetstream** = full starter
- **Sanctum** = SPA cookies + personal tokens; **Passport** = full OAuth2 (scopes, clients)
- Remember me = random token in `remember_token` + cookie, never the password
- Email verification = `MustVerifyEmail` + `verified` middleware + `email_verified_at`
- Password reset = single-use token in `password_reset_tokens` + signed link
- Sessions live on the server (switch to Redis for scaling); tokens live with the client (revoke-able only when stored server-side)

## 17. Cheat Sheet

```text
config/auth.php
  guards:    web   (session) | sanctum (session for SPAs) | passport (OAuth2)
             custom guard: driver + provider
  providers: users  → Eloquent User model | any data source

Auth facade
  Auth::attempt($credentials, $remember) → bool
  Auth::check() | Auth::user() | Auth::id()
  Auth::login($user) | Auth::logout()
  Auth::logoutOtherDevices($password)   (needs AuthenticateSession middleware)

Hashing
  Hash::make($pw)    → bcrypt string  ($2y$12$…)
  Hash::check($pw, $hash) → bool
  Hash::needsRehash($hash) → bool    (re-hash lazily on login)

Remember me
  'remember_token' column + $request->boolean('remember')
  cookie: remember_web_<hash> = {id, token}

Scaffolding
  Fortify   → headless auth backend (API/JSON)
  Breeze    → minimal Blade/React/Vue scaffold
  Jetstream → Fortify + teams + 2FA + Tailwind UI

SPA with Sanctum
  fetch('/sanctum/csrf-cookie')  → XSRF-TOKEN cookie
  send X-XSRF-TOKEN header       → routes behind auth:sanctum

Security musts
  regenerate session on login/logout
  throttle login (throttle:5,1)
  generic error messages
  HTTPS only for cookies in prod
```

## 18. Key Takeaways

> [!RECAP]
> - **Authentication = who you are; authorization = what you're allowed to do** — keep them apart
> - **Guards** carry identity (session, token, SPA cookie); **providers** supply it (users table, LDAP, API)
> - Login = validate → `Auth::attempt` → `Hash::check` → write session id → **regenerate** → redirect
> - Passwords are bcrypt/argon2id-hashed with `Hash::make`/`Hash::check` — never plaintext, never fast hashes
> - **Fortify** is the headless auth backend; **Breeze** is minimal scaffolding; **Jetstream** is the full starter
> - **Sanctum** for first-party SPAs (cookies + CSRF) and personal tokens; **Passport** for OAuth2 with scopes and third-party clients
> - Remember me = a stored random token, not the password; revoke-ability is the token-vs-session trade-off
> - Email verification gates routes with `verified`; password reset uses single-use tokens
> - Sessions are server-side state (Redis to scale); tokens are client-side (expire or revoke)
> - Next: now that we know *who* it is — what are they *allowed* to do?

## Check your understanding

Answer these without looking back.

1. Say the auth-vs-authorization one-liner exactly.
2. What is the difference between a guard and a provider? Give one example of each.
3. Walk through login from `POST /login` to the response cookie — at least six steps.
4. Why is the session id regenerated on login, and what attack does it stop?
5. Compare Sanctum and Passport in three bullet points each, including when you'd choose one.
6. What do Fortify, Breeze and Jetstream each give you — and which is headless?
7. Why can't a server revoke a leaked JWT, but it can revoke a Sanctum token?
8. What does "remember me" store, and what does it never store?
9. How does email verification work end-to-end?
10. Why is `Hash::check` deliberately slow — and what would break if it weren't?

## What's Next

**Lesson 123 — Authorization.** Identity is established; now the question is *what may this
identity do?* Gates and policies, roles and permissions — authorization, the other half of
the auth story.
