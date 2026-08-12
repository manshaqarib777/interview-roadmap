# Topic 6 — Service Providers

**Checklist anchor:** `register()` · `boot()` · provider lifecycle · custom providers · binding services · loading configuration · registering macros

**Owning lesson:** [109 Service Providers](../109-service-providers.md)

---

## The one-sentence answer

**A service provider is the central place where a feature registers its services into the container — every package and every first-party feature in Laravel is wired up by one.**

## The mental model

Think of providers as the **registration desk** of the application. Every department (feature, package) shows up at the desk and declares what it provides:

- **`register()`** — *"I'd like to register these services."* It only *binds recipes*; it never uses them.
- **`boot()`** — *"Everything is registered now, so I can use services."* Runs after every provider has registered.

The two-phase structure exists for one reason: **a provider can't use a service that a later provider hasn't registered yet.** So Laravel runs *all* `register()` methods first, then *all* `boot()` methods.

```text
Phase 1 — register()   all providers bind their services
Phase 2 — boot()       all providers can now resolve anything
```

## How it works

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\PaymentGateway;
use App\Services\StripePaymentGateway;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // BIND ONLY — nothing here may resolve a service
        $this->app->bind(PaymentGateway::class, StripePaymentGateway::class);
    }

    public function boot(): void
    {
        // Everything is registered — safe to resolve and use
        $this->app->singleton('analytics', fn () => new Analytics());
        // also: share views, register routes, macros, observers…
    }
}
```

Registered in `bootstrap/providers.php`:

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
];
```

### What providers do in the wild

| Job | Where it shows up |
|---|---|
| Bind services | `register()` → `$this->app->bind(...)` |
| Register event listeners | `boot()` → `Event::listen(...)` |
| Share data with views | `boot()` → `View::share('siteName', ...)` |
| Register Blade components/directives | `boot()` → `Blade::component(...)` |
| Register macros | `boot()` → `Collection::macro(...)` |
| Load package config/routes/migrations | `register()`/`boot()` → `mergeConfigFrom()`, `loadRoutesFrom()` |
| Register observers | `boot()` → `Model::observe(...)` |

### `mergeConfigFrom` — the config pattern

A package's defaults merge *under* the app's config — recursively, so keys the app doesn't set survive:

```js
// package defaults:  { analytics: { key: 'PACKAGE_KEY', retries: 3 } }
// app config:        { analytics: { key: 'APP_KEY',     timeout: 5 } }
// merged:            { analytics: { key: 'APP_KEY', retries: 3, timeout: 5 } }
```

App values win; package keys the app didn't touch survive.

## The plain-JS model (what the exercise does)

```js
function bootApp(providers) {
  for (const p of providers) p.register();  // phase 1: EVERYONE registers
  for (const p of providers) p.boot();      // phase 2: EVERYONE boots
}
```

## Interview questions

**Q1. What's the difference between `register()` and `boot()`?**
> `register()` is where you bind services into the container — and only bind; using a service there is an error because a later provider's binding may not exist yet. `boot()` runs after every provider has registered, so it's where you can safely resolve and use services, register listeners, macros, and observers. All `register()` calls happen first, then all `boot()` calls.

**Q2. Why can't you use a service in `register()`?**
> Because registration order matters. Provider A might try to resolve a service that Provider B binds later in the list — at A's `register()` time, B hasn't run. The two-phase design — all registers, then all boots — guarantees that by `boot()` time, every binding exists.

**Q3. What's the provider lifecycle?**
> Providers are collected from `bootstrap/providers.php` (and packages), all have `register()` called, then all have `boot()` called — on every request, during the kernel's bootstrap phase. Deferred providers only load when one of their services is first resolved.

**Q4. How do you create a custom provider?**
> `php artisan make:provider MyServiceProvider`, implement `register()` (bind services) and `boot()` (use services / register listeners), then add it to `bootstrap/providers.php`. Registering it makes its bindings available app-wide.

**Q5. What is a deferred provider?**
> A provider whose only job is binding — marked `deferred` — isn't loaded at boot at all. It loads lazily on the first resolve of one of its services, saving bootstrap cost when the service is rarely used.

**Senior follow-up: Where do you put bindings vs listeners?**
> Bindings in `register()`, everything that *runs* — listeners, macros, observers, view shares — in `boot()`. That split isn't pedantry: `boot()` is where the framework guarantees the whole container is ready, so anything that consumes services belongs there.

## Common mistakes

❌ Resolving in `register()` — the classic "Target is not instantiable" source.

❌ Doing heavy work in `boot()` — it runs on every request; heavy work belongs in services invoked lazily.

❌ Putting bindings in `boot()` — bindings belong in `register()`; `boot()` is for *using* services.

❌ Forgetting to register the provider — a custom provider that's never listed in `bootstrap/providers.php` simply never runs.

## Quick revision notes

- Provider = **the registration desk** for a feature/package
- `register()`: **bind only** · `boot()`: **use safely** — all registers, then all boots
- Registered in **`bootstrap/providers.php`**
- `mergeConfigFrom()`: **app config wins, package defaults fill gaps**
- Deferred providers: **lazy-load on first resolve** to save bootstrap cost

## Check your understanding

1. Why does the two-phase register-then-boot design exist?
2. Where do listeners and macros belong, and why?
3. What's the config-merge pattern for a package?
4. When would you make a provider deferred?
