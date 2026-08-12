# Topic 21 — Laravel Fortify

**Checklist anchor:** authentication backend · login · registration · password reset · email verification · 2FA · authentication pipelines · custom flows · Fortify vs Breeze vs Jetstream

**Owning lesson:** [122 Authentication](../122-authentication.md)

---

## The one-sentence answer

**Fortify is Laravel's headless authentication backend — the login, registration, password-reset, email-verification, and 2FA logic, without any frontend of its own.**

## The mental model

Fortify is the **engine without the car body**. It implements the auth *flows* — the logic of "log in," "register," "reset password" — and exposes them as routes and services. You bring the frontend (your own Blade, or Inertia/React, or a SPA), and Fortify provides the plumbing underneath.

```text
Breeze / Jetstream (the UI)      ← your frontend lives here
        │ uses
        ▼
Fortify (the backend)            ← login/register/reset/verify/2FA logic
        │
        ▼
Auth guards + users table        ← the identity layer
```

That's why Breeze and Jetstream are built *on* Fortify — they're frontends for the same backend.

## How it works

### The flows Fortify owns

| Flow | What it does |
|---|---|
| **Login** | Credentials → session, rate-limited, session regenerated |
| **Registration** | Create the user, log them in |
| **Password reset** | Token-based reset via email |
| **Email verification** | The `MustVerifyEmail` contract + signed URLs |
| **2FA** | TOTP two-factor — generate, verify, recovery codes |

### Configuration

```php
// config/fortify.php — you turn features on/off:
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::twoFactorAuthentication(),
    // ...
],
```

### Authentication pipelines

```php
// Fortify::authenticateThrough() — a pipeline of steps the login runs:
Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
        config('fortify.limiters.login') ? null : null,
        'user' => fn ($user) => /* check the user, return it or abort */,
        // each step is a closure: receive the user, allow/deny
    ]);
});
```

Pipelines are the extensibility point — you insert a step ("is this user banned?") into the auth flow without rewriting login.

### Custom flows

```php
// replace a Fortify action with your own:
Fortify::loginView(fn () => view('auth.login'));       // your view
Fortify::authenticateUsing(function (Request $request) {
    // your own credential check
    return $user;
});
```

## Fortify vs Breeze vs Jetstream — the question

| | Fortify | Breeze | Jetstream |
|---|---|---|---|
| What | Auth **backend** (no UI) | Auth **scaffolding** (UI + backend) | Full **starter kit** (UI + backend + team features) |
| Frontend | None — you build it | Simple Blade/React/Vue/Inertia | Livewire or Inertia |
| Extras | 2FA, pipelines (configurable) | Minimal | Teams, API tokens, profile management |
| Best for | Custom frontend, SPA, Inertia | A simple app that needs auth fast | A feature-rich starter with teams |

**The answer:** Fortify is the backend you build your own UI on; Breeze is Fortify + a simple UI; Jetstream is Fortify + UI + teams + more. Pick by how much you want out of the box.

## Interview questions

**Q1. What is Fortify?**
> Laravel's headless authentication backend — login, registration, password reset, email verification, and 2FA implemented as services and routes, with no frontend. You provide the UI — Blade, Inertia/React, or a SPA — and Fortify handles the flows. Breeze and Jetstream are UIs built on top of it.

**Q2. Fortify vs Breeze vs Jetstream?**
> Fortify is the backend only. Breeze is Fortify plus a minimal UI scaffold (Blade or React/Inertia). Jetstream is Fortify plus a richer starter — teams, profile management, API tokens, Livewire or Inertia. Fortify when you're building your own UI; Breeze for simple apps; Jetstream when you want teams and features out of the box.

**Q3. What are authentication pipelines?**
> The ordered steps a login runs through. Fortify lets you define them with `Fortify::authenticateThrough()`, inserting your own checks — "is this user active? is their IP blocked?" — between the standard steps. It's how you extend the auth flow without rewriting login.

**Q4. How do you customize a Fortify flow?**
> By replacing its actions — `Fortify::loginView()` for your view, `Fortify::authenticateUsing()` for your own credential check, and custom classes bound for the create/update actions. Fortify is deliberately replaceable: each flow has a seam you can override.

**Q5. What does email verification involve?**
> The `MustVerifyEmail` contract on the User model, a `verified` middleware on protected routes, and the verification flow Fortify provides — a signed link emailed to the user, `email_verified_at` set when clicked. Fortify's feature flag enables it; you keep the verification logic.

**Senior follow-up: When would you use Fortify instead of writing auth yourself?**
> Whenever auth is "standard" — login, register, reset, verify, 2FA. Fortify gives tested, rate-limited, session-safe flows out of the box, and every piece is replaceable. I'd write custom auth only when the flow is genuinely unusual (a non-standard identity source, a custom multi-step registration). Otherwise, using Fortify is the senior call: don't hand-roll the security-sensitive parts.

## Common mistakes

❌ Confusing Fortify with a UI — it's backend; you still build the views.

❌ Not enabling the feature flags — 2FA/verification silently off.

❌ Hand-writing auth flows when Fortify (or Breeze) already covers them — the security-sensitive parts should be framework-tested.

❌ Forgetting pipelines — custom checks belong as pipeline steps, not hacks in the controller.

## Quick revision notes

- Fortify = **headless auth backend**: login, register, reset, verify, 2FA
- **Breeze** = Fortify + simple UI · **Jetstream** = Fortify + UI + teams
- Features toggled in `config/fortify.php`
- **Pipelines** = ordered auth steps, extendable
- Every flow is **replaceable** (`loginView`, `authenticateUsing`, custom actions)

## Check your understanding

1. What does "headless" mean for Fortify, exactly?
2. Where does Breeze fit relative to Fortify?
3. What are authentication pipelines for?
4. How do you swap in your own login check?
5. When is writing auth from scratch the right call?
