# Topic 37 — Laravel Security

**Checklist anchor:** SQL injection · XSS · CSRF · mass assignment · secure auth · authorization · file uploads · secrets — and how Laravel defends each

**Owning lesson:** [128 Rate Limiting & Security](../128-security.md)

---

## The one-sentence answer

**Laravel's security is mostly *defaults* — parameter binding kills SQL injection, Blade escaping kills XSS, the CSRF token guards state-changing requests, and `$fillable` tames mass assignment — plus the rules you own: hashing, policies, and uploads.**

## The mental model

Security in Laravel is **"the framework makes the right thing the default."** For each attack, there's a built-in defence — and your job is to not disable it:

```text
Attack              Laravel's default defence          Your job
SQL injection  ──►  Parameter binding everywhere  ──►  never interpolate SQL
XSS            ──►  {{ }} escapes in Blade        ──►  don't use {!! !!} on user data
CSRF           ──►  @csrf + token middleware      ──►  keep it on state-changing routes
Mass assignment──►  $fillable / $guarded          ──►  don't leave it open
Authz          ──►  gates/policies                ──►  enforce, don't just hide buttons
Uploads        ──►  (none automatic)              ──►  validate MIME/size, private storage
Secrets        ──►  (.env is yours to protect)    ──►  never commit it
```

## The seven defences

### 1. SQL injection — why parameter binding kills it

```php
// SAFE — the value is bound as a parameter, never parsed as SQL:
User::where('email', $email)->get();
DB::table('users')->whereRaw('email LIKE ?', ["%{$search}%"]);

// UNSAFE — interpolating input into SQL:
DB::select("select * from users where email = '$email'");
// → $email = "x' OR '1'='1" becomes a different query
```

Eloquent, the query builder, and `?` placeholders all **parameter-bind** — the database treats the value as *data*, never *SQL*. The rule: never build a SQL string from input.

### 2. XSS — Blade escapes by default

```blade
{{ $user->bio }}     {{-- HTML-escaped: <script> → &lt;script&gt; --}}
{!! $user->bio !!}   {{-- RAW — the XSS hole if $user->bio is user input --}}
```

Blade's `{{ }}` escapes output (Lesson 22). XSS happens when someone uses `{!! !!}` (or `v-html`-style output) on user-controlled content. Rule: `{{ }}` always; `{!! !!}` only for HTML you generate.

### 3. CSRF — the token for state-changing browser requests

```php
// in every state-changing form:
<form method="POST">
    @csrf
    ...
</form>
```

The CSRF middleware verifies a per-session token on `POST/PUT/PATCH/DELETE`. A malicious site can't forge a state-changing request because it can't read your token. **APIs use Sanctum's cookie+token handshake instead** (Lesson 19) — stateless tokens aren't CSRF-vulnerable the way session cookies are.

### 4. Mass assignment — `$fillable`/`$guarded`

```php
// NEVER: mass-assign raw input with no whitelist
User::create($request->all());
// → a request with is_admin => 1 sets it

// SAFE: the whitelist decides what's assignable
protected $fillable = ['name', 'email', 'password'];
```

`$fillable`/`$guarded` (Lesson 8) is the defence: only listed fields can be mass-assigned, so hostile extra fields are ignored.

### 5. Authentication — secure password hashing

`Hash::make` on write, `Hash::check` (or `Auth::attempt`) on login — bcrypt/argon by default (Lesson 17). Plaintext passwords are the unforgivable sin.

### 6. Authorization — policies/gates

Authz is not "hide the button" — the server must enforce via policies and `authorize()` (Lesson 18). A hidden button without a policy check is a data leak waiting for a direct API call.

### 7. File upload security

```php
$request->validate([
    'file' => ['required', 'file', 'mimes:pdf,png,jpg', 'max:8192'],
]);
$path = $request->file('file')->store('uploads', 'private');   // NOT public/
```

- **MIME + size + extension** validated server-side.
- Store **outside the public root** (private disk), serve via signed URLs (Lesson 36).
- Never trust the client's filename/extension.

### Secrets — `.env` is not for git

`.env` holds `APP_KEY`, DB credentials, API keys. It's gitignored by default. **Never commit it**, rotate a leaked key, and keep production secrets in the deploy environment (Lesson 66).

## Interview questions

**Q1. How does Laravel prevent SQL injection?**
> Parameter binding. Eloquent and the query builder bind values as parameters — `where('email', $email)` — so the database treats them as data, never SQL. Raw queries use `?` placeholders. The rule that must never be broken: don't build SQL strings from user input.

**Q2. How does Laravel prevent XSS?**
> Blade escapes output by default — `{{ $value }}` HTML-escapes, so user content renders as text, not markup. The vulnerability is opt-in: `{!! !!}` outputs raw HTML and must only be used for trusted, server-generated content. Escaping + never raw-outputting user input is the XSS defence.

**Q3. How does CSRF protection work?**
> Laravel embeds a per-session token in state-changing forms (`@csrf`) and the middleware verifies it on `POST/PUT/PATCH/DELETE`. A cross-site request can't forge a valid token because the attacker's site can't read the victim's session. For APIs, Sanctum's cookie/header handshake replaces the form token.

**Q4. What is mass assignment, and how do you stop it?**
> Mass assignment is creating/updating a model from an array — `User::create($request->all())` — where a hostile extra field (`is_admin`) can slip through. `$fillable` (whitelist) or `$guarded` (blacklist) restricts what mass assignment may set.

**Q5. What are the file-upload security rules?**
> Validate server-side — MIME, size, extension whitelist. Store outside the public web root (private disk) and serve via signed URLs. Never trust the client's filename or extension, and never let uploads land in `public/` where they're directly web-served.

**Senior follow-up: What's the difference between a framework default and a security posture?**
> Defaults make the common attacks hard to get wrong — binding, escaping, CSRF. A posture is what you own: authz on every server write, private storage for user files, secret rotation, monitoring for anomalies. The senior answer names both: what Laravel gives you, and what you must enforce on top.

## Common mistakes

❌ `{!! !!}` on user input — the XSS hole.

❌ `User::create($request->all())` with no `$fillable` — mass assignment.

❌ Raw SQL with interpolated input — SQL injection.

❌ Uploads into `public/` — web-served files with no control.

❌ Committing `.env` — secrets in the repo and in every clone.

## Quick revision notes

- **SQLi** → parameter binding · **XSS** → `{{ }}` escaping · **CSRF** → `@csrf` token
- **Mass assignment** → `$fillable`/`$guarded`
- **Auth** → `Hash::make` · **Authz** → policies, server-side
- **Uploads** → MIME/size/extension + private storage + signed URLs
- **Secrets** → `.env` never committed
- The posture is yours: enforce authz, keep uploads private, rotate secrets

## Check your understanding

1. Why does parameter binding defeat SQL injection?
2. When is `{!! !!}` safe, and when is it XSS?
3. How does the CSRF token stop forged state-changing requests?
4. What exactly does `$fillable` protect against?
5. Where should uploads live, and how are they served?
