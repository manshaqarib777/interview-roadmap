# Lesson 128 — Rate Limiting & Security

**Interview importance:** 🔥🔥 — the highest-weight security lesson in the module, and the
senior one (the module overview calls it out as scenario-graded).

Lesson 127 turned the cache into a performance tool. The same store turns into a security
tool: the rate limiter that throttles abuse is `Cache::get`/`Cache::add` with a TTL. And
then there's everything the cache can't help with — the attack surface. SQLi, XSS, CSRF,
mass assignment, uploads, secrets: each one is a specific Laravel feature that closes a
specific hole.

The interview shape here is never "recite OWASP". It's "here's an app, find the holes and
say what covers them" — so every section pairs the attack with the defense.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why parameter binding and Eloquent make SQL injection nearly impossible
- Say exactly what Blade's `{{ }}` escaping does and when `{!! !!}` is the exception
- Explain CSRF: the token, `VerifyCsrfToken`, `@csrf`, and why APIs use Sanctum tokens instead
- Explain the `User::create($_POST)` disaster and what `$fillable`/`$guarded` fix
- Say why passwords are hashed, not encrypted, and never stored plaintext
- Describe safe file upload: MIME, size, extension whitelist, storage outside `public/`
- Name the secrets rule: never commit `.env`, ship `.env.example`

## 1. One-Line Definition

**The Laravel attack surface is a set of known holes — injection, XSS, CSRF, mass
assignment, uploads, leaked secrets — each with a framework feature that closes it, and a
rate limiter on top to throttle the attempts.**

Everything in this lesson is "what can an attacker do, and what covers it?" If you can
answer that pairing for all six holes, you've answered the lesson.

## 2. Mental Model

Think of the request lifecycle (Lesson 106) as a pipeline an attacker's request travels
through, with a checkpoint at each stage:

- **Rate limiter** at the door — you're allowed 60 tries a minute, no more.
- **Route → CSRF** — any state-changing POST without a valid token is rejected before your
  code runs.
- **Validation** — the input is checked against rules (Lesson 121) before it's trusted.
- **Eloquent / query builder** — parameter binding makes SQL a template, never a string
  you paste input into.
- **Blade `{{ }}`** — anything you output is escaped, so stored data can't become script.
- **The database** — `$fillable`/`$guarded` decide exactly which columns mass assignment
  may write, no matter what the request contained.
- **Storage** — uploads are validated by MIME, size and extension, and kept out of the
  web root.

Each checkpoint is one line you already know how to write. The interview is naming the
checkpoint when shown the hole.

## 3. Visual Flow

```text
            ATTACKER REQUEST
                 │
                 ▼
   ┌─────────────────────────────┐
   │ 1. RATE LIMITER             │  throttle('api', 60, 1) — 60/min per user+IP
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ 2. CSRF (state-changing)    │  VerifyCsrfToken — POST without token → 419
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ 3. VALIDATION               │  Form Request rules — reject bad input early
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ 4. SQL LAYER                │  parameter binding: WHERE id = ?  (never concat)
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ 5. OUTPUT                   │  Blade {{ $name }} escapes — <script> stays text
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ 6. WRITE                    │  $fillable whitelist — mass assignment can't
   │                             │  write what it isn't allowed to
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ 7. STORAGE                  │  MIME + size + extension checks; outside public/
   └─────────────────────────────┘
```

## 4. How It Works

### SQL injection — and why parameter binding kills it

An attacker crafts input that changes the *meaning* of your SQL. If you paste it into a
string, it works:

```text
ATTACK STRING:  ' OR '1'='1

VULNERABLE (string interpolation):
    SELECT * FROM users WHERE email = '$email'
    →  SELECT * FROM users WHERE email = '' OR '1'='1'
    →  returns EVERY row  — login bypassed

ATTACK STRING:  '; DROP TABLE users; --

VULNERABLE:
    SELECT * FROM users WHERE id = $id
    →  SELECT * FROM users WHERE id = ''; DROP TABLE users; --'
    →  the second statement executes. the table is gone.

SAFE (parameter binding):
    SELECT * FROM users WHERE email = ?
    binding: $email = "' OR '1'='1"
    →  looks for the literal email  ' OR '1'='1  →  zero rows. harmless.
```

The `?` is a placeholder: the driver sends the SQL template and the value **separately**,
so the value can never become SQL. It is not escaped — it's never in the SQL at all.

> [!DEEPDIVE]
> With a `PDO::prepare()`, the driver parses the SQL once, builds the execution plan for
> the template `WHERE email = ?`, and treats the bound value as pure data. The server never
> re-parses it with the value inlined, so `' OR '1'='1` cannot become part of the query —
> it is *impossible* for that value to change the statement's meaning. That's why binding
> beats escaping: escaping is a best-effort filter, binding is a different mechanism.

Eloquent and the query builder parameterise everything by default:

```php
$user = User::where('email', $request->input('email'))->first();  // safe
User::whereRaw("name LIKE ?", ["%$q%"])->get();                  // raw but still bound
// ❌ never:  User::whereRaw("name = '$q'")                        // pasted input
```

```text
User::where('email', $request->input('email')) generates:
    select * from `users` where `email` = ?          ← ? placeholder, not the value
    binding: ['attacker@evil.com']

Eloquent/QueryBuilder NEVER inline user input into SQL — the ? is non-negotiable.
The only way to be vulnerable is to concatenate strings yourself (or mis-parse a raw statement).
```

```narrate
line: "the ? is the whole defense — SQL is a template, input is data, and the two never meet."
line: "Eloquent parameterises by default; the vulnerable path is always handwritten string concatenation."
```

> [!PITFALL]
> `DB::statement("...")` and `whereRaw()` are the two places you can still hurt yourself —
> they accept a SQL string. Use them only with bound `?` placeholders (`whereRaw("x = ?", [$v])`),
> never with interpolated input. `->toSql()` on any builder shows the `?`s; that's your
> self-check.

### XSS — and why Blade escapes by default

Cross-Site Scripting: user-supplied content is rendered as HTML, so `<script>` becomes a
running script in *another* user's browser. The fix is output escaping — and Blade does it
by default:

```blade
{{ $name }}     {{-- ✅ escaped: <script>alert(1)</script> is shown as TEXT --}}
{!! $name !!}   {{-- ❌ raw:   the script tag renders and RUNS                --}}
```

```text
$name = "<script>alert('hi')</script>"

{{ $name }}  renders as:  &lt;script&gt;alert('hi')&lt;/script&gt;
                          (browser shows the text. nothing executes.)

{!! $name !!} renders as: <script>alert('hi')</script>
                          (browser EXECUTES it. the XSS is live.)
```

The rule: **always `{{ }}`. Reach for `{!! !!}` only when you know the content is safe** —
typically markdown you render server-side, or trusted admin-authored HTML. If it can be
typed by a user, escape it.

> [!NOTE]
> XSS has two flavours. **Stored** — the payload lives in your database (a comment, a
> profile field) and runs for every visitor. **Reflected** — the payload is in the URL and
> runs once. Blade's escaping stops both, because it's applied at output, not at input.
> That's also why "sanitise on input" is the wrong instinct — you can't know at input time
> where a value will be rendered (HTML? JSON? a URL attribute?).

### CSRF — the token, `@csrf`, and why APIs use Sanctum instead

Cross-Site Request Forgery: attacker's page makes *your browser* send a request to your
app, and the app can't tell it wasn't you. Classic version:

```text
1. You log in to bank.example (session cookie set in your browser)
2. You visit evil.example — it contains:  <img src="https://bank.example/transfer?to=attacker&amount=1000">
3. Your browser happily requests that URL — WITH your cookie — and the transfer runs

The server saw: a valid session + a state-changing request.
It never checked: did YOU actually ask for this?
```

The fix: every state-changing request must carry a token the attacker's page can't know.
Laravel's `VerifyCsrfToken` middleware (in the `web` middleware group, Lesson 112) checks
the session's `_token` against a token in the request — and returns **419** on a mismatch:

```blade
<form method="POST" action="/transfer">
    @csrf   {{-- renders <input type="hidden" name="_token" value="..."> --}}
</form>
```

```text
POST /transfer  with  _token=<session token>  →  ✅ VerifyCsrfToken passes → controller runs
POST /transfer  without the token             →  ❌ 419 Page Expired, controller never runs
evil.example's <img> GET can't forge a POST, and can't read the token (same-origin policy)
```

The token is random, per-session, and never exposed to other origins — so a third-party
page can't include it.

> [!DEEPDIVE]
> **Why do APIs use Sanctum tokens instead of CSRF?** CSRF exists because browsers
> *automatically* attach cookies to cross-origin requests. Sanctum's token auth has no such
> link: an API client sends `Authorization: Bearer <token>` explicitly, the server asks
> "who is this token", and the token is never auto-attached by a browser. The cookie
> mechanism that made CSRF possible isn't in play — so the CSRF check is unnecessary, and
> the API just uses tokens. Cookies + state-changing requests = CSRF middleware. Bearer
> tokens + explicit headers = no CSRF needed.

### Mass assignment — the `User::create($_POST)` disaster

Eloquent's `create()` accepts an array and writes every key it's given. If you hand it raw
request input, an attacker can add fields you never meant to expose:

```text
❌  User::create($request->all());
    normal form sends:  name, email, password
    attacker adds:      is_admin=1     →  admin account, no special request needed

The attacker just POSTs a field that doesn't exist in your form. Eloquent writes it
because create() was told to write everything.

✅  User::create($request->validated());          // only the validated keys
✅  User::create($request->only(['name','email']));  // only the named keys
```

Two whitelists control what mass assignment may touch:

```php
class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];   // ✅ allowlist — the default
    // protected $guarded = ['is_admin'];                  // or deny one field
}
```

```text
$fillable = ['name', 'email', 'password']
    User::create(['name' => 'A', 'is_admin' => 1])
    → is_admin is NOT in the allowlist → silently dropped → the user is created without it

$guarded = ['is_admin']
    → same result: is_admin blocked. (guarded is the denylist — prefer fillable.)

Mass assignment is off by default in modern Laravel — you must name $fillable to allow anything.
```

```narrate
line: "create($request->all()) is the disaster; create($request->validated()) is the fix — validation (L121) and fillable work together."
line: "$fillable is the allowlist you ship; $guarded is the denylist that tends to grow holes."
```

> [!PITFALL]
> `$guarded = []` (guard nothing) is an open door. The two rules that matter: prefer
> `$fillable`, and never pass raw request input to `create()`/`fill()`/`update()`.

### Secure auth — hashes, never plaintext

Passwords are **hashed, not encrypted**. Encryption is reversible (you have a key);
hashing is one-way, and Laravel's `Hash::make()` uses bcrypt (or argon) with a per-password
salt and a work factor. There is no key, because the password is never meant to come back.

```php
$user->password = Hash::make($request->password);   // ✅ the only way to store a password
if (Hash::check($request->password, $user->password)) { /* login */ }
```

```text
Hash::make('correct horse') →
    $2y$12$wI9q...  (bcrypt, cost 12, unique salt baked into the hash)

Storing plaintext means: one database leak = every password in the clear.
Storing a bcrypt hash means: a leak gives the attacker slow hashes to crack, one at a time.
Laravel's default auth (Lesson 122) hashes on register and checks on login for you —
the mistake is hand-rolling auth and storing the raw string.
```

> [!TIP]
> You never verify a password yourself — `Hash::check()` does it (timing-safe), and the
> default `Auth`/Fortify flow already does. The interview point is *why*: an unsalted fast
> hash (md5/sha1) lets attackers brute-force millions a second; bcrypt's cost factor is
> the deliberate slowdown.

### File uploads — MIME, size, extension, and out of `public/`

Uploads are executable code waiting for a mistake: a `.php` file uploaded to a public
folder and then requested over HTTP **runs as a script on your server**. The defense is
layers:

```php
$request->validate([
    'avatar' => ['required', 'image', 'mimes:jpg,png,webp', 'max:2048'],  // 2MB
]);

$path = $request->file('avatar')->store('avatars', 's3');  // ✅ NOT public/
```

```text
'mimes:jpg,png,webp'  → extension whitelist (Laravel checks the actual MIME type too)
'max:2048'            → size cap in KB
->store('avatars', …) → goes to storage/, NOT public/ — nothing web-servable
serve it later via a CONTROLLED route (->response()) or a signed URL, not the filesystem

Why whitelisting beats blacklisting:
  deny ".php"        → attacker uploads ".php5", ".phtml", ".PhP"…   cat-and-mouse
  allow jpg/png/webp → everything else is rejected, full stop
```

```narrate
line: "whitelist the extensions you WILL serve; blacklisting everything else always misses one."
line: "the rule that matters most: a user-controlled file must never land somewhere the web server can execute it."
```

### Secrets — `.env` is not for git

```text
❌  .env committed to the repo:
      DB_PASSWORD=super-secret
      STRIPE_SECRET=sk_live_...
    → anyone with repo access (or a leaked history, or a public fork) has your keys
    → one search in a public repo later, and it's in everyone's hands

✅  .env in .gitignore, and a committed .env.example instead:
      .env.example   →  DB_PASSWORD=            (empty, documented, safe to commit)
      .env           →  DB_PASSWORD=real-value  (never committed)
      deploy → copy .env.example to .env, fill in real values per environment
```

Rules: never commit `.env`; commit `.env.example` with blank placeholders; rotate any
secret that ever touched a repo. (A key that was pushed once is compromised forever —
"I deleted the file" doesn't undo git history.)

> [!PITFALL]
> The subtle version: a secret in `.env` that's *fine* locally, but the codebase also has
> a hardcoded fallback (`config('services.stripe.secret') ?? 'sk_test_default'`) — or the
> frontend bundle imports a value you thought was server-side. Secrets belong in env + a
> secret store at deploy time, never in source, never in the browser bundle.

### Rate limiting — the cache as a bouncer

The throttle sits before all of that. Laravel's `RateLimiter` + the `throttle` middleware
is a fixed-window counter built on the cache from Lesson 127:

```php
RateLimiter::for('api', fn ($job) => Limit::perMinute(60)->by($job->user()?->id ?: $job->ip()));
```

```php
// on the route:
Route::middleware('throttle:api')->group(function () { /* … */ });
```

```text
requests 1–60 in minute N  → 200 OK
request 61 in minute N      → 429 Too Many Requests, Retry-After: 37
a new window rolls          → counter resets → 60 more allowed
keyed per user (or per IP when unauthenticated) so one user's abuse never throttles another
```

The counter is `Cache::get`/`Cache::add` with a TTL — the same store Lesson 127 put in
front of queries, now counting attempts instead of caching results.

> [!DEEPDIVE]
> **Fixed window vs token bucket.** `Limit::perMinute(60)` is a fixed window: 60 allowed
> per clock minute — simple, but 120 requests in a burst at the window boundary both pass
> (59 at :59 + 61 at :00). The token bucket (Section 13) smooths that: a bucket refills at
> a rate (say 1 token/sec, cap 60), so a burst of 60 is fine and sustained abuse over 60/s
> is blocked *continuously* — no boundary gift. For interviews: fixed window is what
> `throttle` gives you for free; the token bucket is the "how would you smooth it" answer.

## 5. Real Project Usage

| Threat | The hole | Laravel covers it with |
|---|---|---|
| Login bypass / `DROP TABLE` | SQL injection | Parameter binding (Eloquent, QueryBuilder) — the `?` |
| `<script>` in user content runs | XSS | Blade `{{ }}` escapes everything by default |
| Forged state-changing requests | CSRF | `VerifyCsrfToken` + `@csrf`; **419** on mismatch |
| `is_admin=1` in a POST | Mass assignment | `$fillable`/`$guarded` + `$request->validated()` |
| Leaked database of passwords | Plaintext storage | `Hash::make()` (bcrypt/argon, salted, cost factor) |
| `.php` uploaded to public dir runs | File upload | `mimes:` whitelist, `max:`, store outside `public/` |
| `.env` in the repo | Secret leak | `.gitignore` + committed `.env.example` |
| Brute force / abuse / scraping | No throttle | `throttle:api` + `RateLimiter`, 429 past the limit |

## 6. Interview Explanation

> Laravel's security is a set of defaults plus a few deliberate choices. SQL injection is
> closed by parameter binding — Eloquent and the query builder send the SQL as a template
> with `?` placeholders and the input as data, so input can never become SQL; the only way
> to be vulnerable is string-concatenating input yourself. XSS is closed by Blade's `{{ }}`,
> which HTML-escapes everything — `{!! !!}` is the raw escape hatch you only use on trusted
> content. CSRF is closed by `VerifyCsrfToken` on the web group: every state-changing
> request needs the session token, so an attacker's page can't forge one; APIs skip this
> because Sanctum's bearer tokens are never auto-attached by the browser. Mass assignment is
> closed by `$fillable` and by passing validated/only input to `create()`. Passwords are
> hashed with `Hash::make`, uploads are validated by MIME/size and stored outside `public/`,
> and secrets live in `.env` — never committed, with `.env.example` in the repo instead. On
> top of all of it, `throttle:api` rate-limits requests per user or IP.

## 7. Senior-Level Insights

- **Defense is layered, and each layer has a job.** Rate limiting slows attempts, CSRF
  stops forgery, validation bounds input, binding prevents injection, escaping prevents
  XSS, fillable bounds writes, storage rules stop executable uploads. No single layer is
  "the security" — the question is always which layer stops which attack, and what happens
  when one layer is bypassed.
- **Trust boundaries are the mental model.** The browser is untrusted. The request body is
  untrusted. The database is trusted once it's written by trusted code. The failure mode
  that matters is "untrusted data reached a trusted sink" — a SQL string, an HTML output,
  a filesystem path, a `create()` call. Name the sink and the boundary, and the fix is
  obvious.
- **"Sanitise on input" is wrong; escape at output.** You can't know at input time whether
  a value will be rendered as HTML, JSON, a URL, or SQL. Escaping is context-specific, so
  it happens where the value is used — Blade escapes at output, binding parameterises at
  the query. This is why "I sanitised the comment field" isn't an XSS answer.
- **Whitelisting over blacklisting, everywhere.** Allowed extensions, allowed fillable
  fields, allowed origins, allowed routes. A deny list is a list of attacks you've heard
  of; an allow list is a list of things you're willing to accept. Say it and you'll sound
  senior on any of these.
- **The "senior scenario" answer has a shape**: identify the attacker's path, say which
  layer stops it, then say what you'd *verify* (a test, a log line, a header). Rehearse
  that shape — the module overview says L128 is graded on process, not recall.
- **`Content-Security-Policy` and `X-Content-Type-Options` are the belt-and-suspenders**
  on top of escaping. Blade's escaping is the defense; a CSP header (`default-src 'self'`)
  is what stops an injected script that slipped through. Named in passing, it shows depth.

## 8. Common Mistakes

- **String-concatenating SQL**: `whereRaw("name = '$q'")` — the one way to reopen the
  injection hole Eloquent closed for you.
- **`{!! !!}` on user content** — the escaping is off, and the script runs. Escape by
  default; only render trusted content raw.
- **Removing `@csrf` "because it's annoying"** — every state-changing form without it is a
  CSRF hole; the 419 you "fixed" was the protection working.
- **`User::create($request->all())`** — mass assignment + raw input = `is_admin` written
  by anyone who guesses the field name.
- **Storing plaintext passwords, or using `md5()`/`sha1()`** — unsalted fast hashes are
  brute-forceable; `Hash::make` exists so you never hand-roll this.
- **`store()` to `public/` or trusting a file extension** — a `.php` in a web-servable
  folder is a remote code execution waiting for a URL.
- **Committing `.env` once** — the secret is compromised forever; git history doesn't
  forget. Rotate, don't just delete.
- **Throttling nothing** — no `throttle` middleware on auth or expensive endpoints means
  brute force and scraping are unlimited.
- **Blacklisting file extensions** (`"not .php"`) — `.php5`, `.phtml`, case tricks. Allow
  the three you serve.

## 9. Best Practices

✅ Let Eloquent/QueryBuilder bind your SQL — never concatenate input into a query string

✅ `{{ }}` by default; `{!! !!}` only for trusted, known-safe content

✅ Keep `@csrf` on every state-changing form; use Sanctum tokens for APIs

✅ Always `$fillable`; always pass `$request->validated()` / `->only([...])` to `create()`

✅ `Hash::make()` on write, `Hash::check()` on login — never store a plaintext password

✅ Validate uploads with `mimes:` whitelist + `max:`, store outside `public/`, serve via
   a controlled route

✅ Never commit `.env`; commit `.env.example` with blank placeholders; rotate leaked keys

✅ Put `throttle:` on auth and expensive routes; key by user, fall back to IP

✅ Layer headers: `X-Content-Type-Options: nosniff`, a CSP, HTTPS everywhere

❌ Don't concatenate input into SQL, HTML, or filesystem paths

❌ Don't trust the client about anything — content type, file name, `is_admin`

## 10. Interview Questions

**Q1. How does Laravel protect against SQL injection?**

> Eloquent and the query builder use parameter binding: the SQL is sent as a template with
> `?` placeholders and the values are sent separately, so input is always treated as data
> and can never change the meaning of the query. Even `whereRaw` supports `?` bindings.
> The only way to be vulnerable is to concatenate input into a raw SQL string yourself.

**Q2. Show me the actual attack string and why binding stops it.**

> `' OR '1'='1` pasted into a string-built query becomes `WHERE email = '' OR '1'='1`,
> which returns every row — a login bypass. `'; DROP TABLE users; --` appended to a string
> query runs a second statement. Bound, the same input is just the literal value the query
> searches for: the placeholder keeps it out of the SQL, so the server parses `WHERE email
> = ?` once and treats the value as data, always.

**Q3. What's the difference between `{{ }}` and `{!! !!}` in Blade?**

> `{{ }}` HTML-escapes the value — `<script>` renders as text. `{!! !!}` outputs raw, so
> the script tag executes. I use `{{ }}` by default, and `{!! !!}` only for content I know
> is safe, like server-rendered markdown. Escaping at output is what stops both stored and
> reflected XSS.

**Q4. What is CSRF and how does Laravel handle it?**

> CSRF is a forged state-changing request: an attacker's page makes my browser send a POST
> to my app with my session cookie, and the server can't tell it wasn't me. Laravel's
> `VerifyCsrfToken` middleware requires a per-session token on every state-changing request
> — the `@csrf` directive embeds it in forms, and a missing or wrong token gets a 419. The
> attacker's page can't read the token, so it can't include it.

**Q5. Why don't APIs need the CSRF check?**

> Because CSRF exists because browsers auto-attach cookies cross-origin. Sanctum's bearer
> tokens are sent explicitly in the `Authorization` header and are never auto-attached, so
> the mechanism CSRF protects against isn't present. Tokens replace the cookie link; no
> cookie link, no CSRF.

**Q6. What is mass assignment, and how do you prevent it?**

> `create($request->all())` writes every key the request contains. An attacker adds
> `is_admin=1` and the model writes it. I prevent it with `$fillable` — an allowlist of
> writable columns — and by passing only validated or `only()` input to `create()`.
> `$guarded` is the denylist alternative, but the allowlist is what I ship.

**Q7. Why are passwords hashed and not encrypted?**

> Encryption is reversible — a key exists, and the attacker wants that key. Hashing is
> one-way: bcrypt with a per-password salt and a cost factor. A leaked database of hashes
> is slow to crack one at a time; a leaked database of plaintext is over. `Hash::make` and
> `Hash::check` are the only places passwords should appear.

**Q8. Walk me through safe file uploads.**

> Three checks: MIME and extension whitelist (`mimes:jpg,png,webp`), a size cap (`max:`),
> and storage outside the web root — `store('avatars', 's3')` goes to `storage/`, not
> `public/`, so a `.php` can't land somewhere the web server will execute it. I whitelist
> what I'll serve rather than blacklist what I won't.

**Q9. How do you rate limit an endpoint?**

> `RateLimiter::for('api', fn ($job) => Limit::perMinute(60)->by($job->user()?->id ?: $job->ip()))`
> and `throttle:api` middleware on the routes. Past the limit the client gets 429 with a
> `Retry-After` header. The counter is just a cached integer with a TTL — the same store as
> the cache from Lesson 127.

**Senior follow-up: your users table just got dumped — email, hashed password, and nothing else. What do you do, in order?**

> First, contain: rotate the secrets that could reach the data (DB credentials, any env
> secrets), and confirm the leak isn't still active. Second, assume the hashes will be
> attacked — bcrypt's cost factor is the only thing between the attacker and those
> passwords, so if any were stored with weak or missing hashing, that's the emergency.
> Third, notify and force a reset for affected users. Fourth, find the path: was it SQLi
> (someone concatenated input), a leaked credential, or mass assignment? Fifth, prove the
> fix with a test and a log — a regression test for the injection path, and monitoring on
> the database. The hashing choice is what determines whether "a dump" becomes "a breach".

## 11. Follow-up Questions

**What's the difference between stored and reflected XSS?**

> Stored: the payload lives in the database — a comment, a profile field — and runs for
> every visitor who views it. Reflected: the payload is in the URL and runs once for the
> victim who clicks the link. Blade's `{{ }}` stops both because it escapes at output,
> regardless of where the value came from.

**What is a `419 Page Expired`?**

> Laravel's CSRF failure response. The `VerifyCsrfToken` middleware rejected a
> state-changing request with a missing or mismatched token. It commonly appears after a
> form sits open past the session lifetime — the fix is re-rendering the form, not
> disabling the middleware.

**When would you choose a token bucket over Laravel's fixed-window limiter?**

> When a burst at the window boundary is a real problem — the fixed window lets 120
> requests through if 59 land at :59 and 61 at :00. A token bucket refills at a steady
> rate, so a burst is fine but sustained abuse over the rate is blocked continuously. If
> the requirement is "at most 60/minute, ever", the bucket is the honest answer.

**How do you serve a stored upload safely if not from `public/`?**

> A controlled route that streams the file with an explicit `Content-Type` and
> `Content-Disposition`, or a signed temporary URL. The point is the web server never
> serves the file directly from the filesystem — so a `.php` upload is never *executed*,
> and the response headers are always yours.

**What else would you check after committing a secret to git by accident?**

> Rotate it immediately — deletion isn't enough, the value is in history and possibly in
> forks. Then purge history if you can (filter-branch / BFG), scan the repo for other
> secrets, and set up a pre-commit hook or secret scanner so it can't happen again.

## 12. Comparison Table

| Threat | Vulnerable path | Laravel defense | What the defense does |
|---|---|---|---|
| SQL injection | `"WHERE id = $id"` string concat | Parameter binding (`?`) | input never enters SQL — no parse |
| XSS | `{!! $userInput !!}` | Blade `{{ }}` | HTML-escapes at output |
| CSRF | state-changing POST w/o token | `VerifyCsrfToken` + `@csrf` | 419 on missing/mismatched token |
| Mass assignment | `create($request->all())` | `$fillable` + `validated()` | allowlist of writable columns |
| Plaintext passwords | storing the raw string | `Hash::make()` / `Hash::check()` | one-way bcrypt, salted, costed |
| Executable upload | `.php` in `public/` | `mimes:` + `max:` + `store()` | whitelist, cap size, out of webroot |
| Secret leak | `.env` committed | `.gitignore` + `.env.example` | keys never enter the repo |
| Brute force / scraping | unthrottled routes | `throttle:` + `RateLimiter` | N per window per user/IP, then 429 |

## 13. Code Example

A token-bucket rate limiter — the smoothing answer from the DEEPDIVE, implemented on
`Cache::get`/`Cache::add` exactly as Laravel's limiter is:

```php
public function attempt(string $key, int $capacity, float $refillPerSec): bool
{
    $bucket = Cache::get("ratelimit:$key");                    // [tokens, lastRefill]

    if ($bucket === null) {
        Cache::put("ratelimit:$key", [$capacity, now()->timestamp], 60);
        return true;                                           // fresh bucket: full
    }

    [$tokens, $last] = $bucket;
    $tokens = min($capacity, $tokens + (now()->timestamp - $last) * $refillPerSec);

    if ($tokens < 1) {
        Cache::put("ratelimit:$key", [0, now()->timestamp], 60); // 429 path
        return false;
    }

    Cache::put("ratelimit:$key", [$tokens - 1, now()->timestamp], 60);
    return true;
}
```

```text
t=0     bucket = [60, t0]        → allow, tokens → 59
t=1     bucket = [59, t1]        → allow, tokens → 58
…60 fast requests → 429 past the burst
idle 10s → refill = 10 × 1 token  → 10 more requests allowed
a 60-request burst at t=59 followed by 60 at t=60: still capped — no window-boundary gift
```

```narrate
line: "the token bucket is the fixed window's honest cousin — same cache store, steady refill instead of a hard reset."
line: "keyed per user (or per IP when logged out), one user's burst never throttles the next."
```

## 14. Performance Notes

- **Rate limiting is cheap if it's in-memory.** A `Cache::get`+`Cache::add` pair on Redis
  (Lesson 127) is a sub-millisecond addition per request. Put the limiter *before* the
  expensive work — throttling first means abusive traffic never reaches your queries.
- **Throttle the endpoints that invite abuse:** auth (`login`), password reset, anything
  that sends email or runs a job (they have real costs — Lesson 124), and anything
  expensive (Lesson 118's slow queries). Unthrottled login = free brute force.
- **Key by the right identity.** User id when authenticated, IP otherwise — and remember
  that behind a proxy, `$job->ip()` is the proxy unless you trust `X-Forwarded-For`
  correctly (Laravel's `TrustProxies` handles that).
- **The security layers you add are nearly free** — `mimes:`, `max:`, `{{ }}`, `@csrf`,
  `$fillable` are all defaults or one line. The expensive thing is the *penetration
  review* that finds the one hand-rolled SQL string.
- **When performance matters for security:** a hash cost factor that's too high slows
  login for everyone (measure it), and per-request hashing of passwords in a loop is a
  DoS vector — hash on write, check on login, never re-hash on every read.

## 15. Debugging Scenarios

**Scenario 1: "Login works in Postman but the browser returns 419."**

Postman isn't sending the CSRF token; the browser form is missing `@csrf` (or the session
expired while the form sat open). Add `@csrf` to the form (or send the token header the
SPA expects), and check the session lifetime if it keeps expiring. This is the CSRF
middleware working — the "fix" is never disabling it.

**Scenario 2: "A user's profile shows their comment as an alert box."**

Stored XSS. The comment was stored (fine — storage is not execution) and rendered with
`{!! !!}` somewhere in the Blade template. Change it to `{{ }}`. Then search the codebase
for every other `{!! !!}` and audit that each one only touches trusted content. The
database is not clean; only the output is.

**Scenario 3: "POSTing to the API returns 419 sometimes, but not always."**

The API route is probably in the `web` middleware group (which includes `VerifyCsrfToken`)
instead of the `api` group. Stateless API clients can't maintain the session token. Move
the route into `api` (or `routes/api.php`) and switch to Sanctum token auth — which also
removes the CSRF requirement entirely (Section 4).

**Scenario 4: "Users keep getting signed in as admin."**

Classic mass assignment. `User::create($request->all())` and no `$fillable` — an attacker
POSTs `is_admin=1` and it's written. Add `$fillable`, switch to `$request->validated()`,
and confirm `is_admin` isn't in either list. Then check the audit trail: find the accounts
created with the field present.

**Scenario 5: "My site got hammered and the database fell over."**

No throttle on a hot endpoint. The cache (Lesson 127) didn't help because every request
was a miss, or the endpoint wasn't cached at all. Add `throttle:` middleware, then re-check
which endpoint was the target — throttling the auth or search route usually fixes it, and
the 429s you see in the logs are the feature working.

## 16. Quick Revision Notes

- SQLi → parameter binding: SQL is a template, `?` placeholders, input is data — never
  concatenate into a query string
- XSS → `{{ }}` escapes, `{!! !!}` is raw; escape at output, both stored & reflected
- CSRF → `VerifyCsrfToken` + `@csrf`; 419 on mismatch; APIs use Sanctum tokens (no cookie
  auto-attach, no CSRF)
- Mass assignment → `$fillable` allowlist + `$request->validated()`; never
  `create($request->all())`
- Passwords → `Hash::make` (one-way bcrypt, salted, costed); never plaintext, never md5
- Uploads → `mimes:` whitelist + `max:` + `store()` outside `public/`; whitelist, not
  blacklist
- Secrets → `.env` never committed; `.env.example` in repo; rotate anything that leaked
- Rate limiting → `throttle:api` + `RateLimiter`; 429 + `Retry-After`; key by user/IP
- Senior shape: attacker's path → stopping layer → what you'd verify
- Whitelist over blacklist, everywhere

## 17. Cheat Sheet

```text
SQL INJECTION
  User::where('email', $e)->first()      ✅ binds — WHERE email = ?
  DB::raw / whereRaw("... = ?", [$v])    ✅ still binds
  whereRaw("x = '$v'")                   ❌ the only way to be vulnerable

XSS
  {{ $name }}     ✅ HTML-escaped (always default)
  {!! $name !!}   ❌ raw — trusted content only

CSRF
  <form>…@csrf…</form>                   ✅ token embedded, 419 on mismatch
  API routes (Sanctum)                   ✅ bearer token, no CSRF needed

MASS ASSIGNMENT
  $fillable = ['name','email']           ✅ allowlist
  User::create($request->validated())    ✅ only validated keys
  User::create($request->all())          ❌ never

AUTH
  Hash::make($pw) → store                ✅ one-way bcrypt
  Hash::check($pw, $hash) → verify       ✅ timing-safe
  plaintext / md5                        ❌ never

UPLOADS
  'mimes:jpg,png,webp' + 'max:2048'      ✅ whitelist + size
  $file->store('avatars', 's3')          ✅ outside public/, served via route

SECRETS
  .env → .gitignore                      ✅
  .env.example → committed, blank        ✅
  rotate any key that touched a repo     ✅

RATE LIMIT
  Limit::perMinute(60)->by($user->id ?: $ip)
  middleware('throttle:api') → 429 + Retry-After past the limit
```

## 18. Key Takeaways

> [!RECAP]
> - The attack surface is six known holes; each has one Laravel feature that closes it
> - SQLi dies at the `?` — parameter binding keeps input out of the SQL, never concatenate
> - XSS dies at output — Blade `{{ }}` escapes; `{!! !!}` is the trusted-only exception
> - CSRF dies at the token — `VerifyCsrfToken` + `@csrf`, 419 on failure; APIs use Sanctum
> - Mass assignment dies at the whitelist — `$fillable` + `$request->validated()`
> - Passwords are hashed (`Hash::make`), never encrypted, never plaintext
> - Uploads: MIME whitelist, size cap, stored outside `public/`
> - Secrets: `.env` never committed, `.env.example` committed, rotate leaks
> - Rate limiting is the cache from Lesson 127 counting attempts — 429 past the limit
> - The senior answer is layered: attacker's path → stopping layer → what you'd verify

## Check your understanding

Answer these without looking back.

1. Write the SQLi attack string for a login bypass, and show why binding stops it.
2. What's the difference between `{{ }}` and `{!! !!}` — and when is raw output OK?
3. Explain CSRF with the evil `<img>` story, and what `@csrf` actually renders.
4. Why do API clients (Sanctum tokens) not need the CSRF check?
5. What does `$fillable` protect against, exactly — and what's the `create($request->all())` disaster?
6. Why is `Hash::make` one-way, and what does the cost factor do?
7. Name the three upload checks and where the file must *not* be stored.
8. What's in your repo vs your `.env`? What do you do if a secret was committed?
9. How many requests pass `Limit::perMinute(60)` in a minute, and what's the response past it?

## What's Next

**Lesson 129 — Testing, Factories & Mocking.** Now that you know what can break, learn how
to prove it doesn't: the test pyramid, `RefreshDatabase`, factories, and what to mock and
why — with a feature test that would have caught half of this lesson's holes.
