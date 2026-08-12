# Lesson 109 — Service Providers

**Interview importance:** ⭐⭐⭐ — `register()` vs `boot()` is the lifecycle that wires the
whole framework together.

A Laravel app is a collection of providers. Boot Laravel and it loads a provider list from
`bootstrap/providers.php`; each provider registers its bindings, then the framework boots them
in order. Controllers, middleware, routes, migrations, the view engine — every Laravel feature
arrives through a provider. Knowing that one fact makes the framework feel like a library
instead of a monolith.

`register()` vs `boot()` — the lifecycle that wires the whole framework together — is the
single most-asked provider question, and it's also the most practical: get the two methods
confused and you'll debug "binding not found" errors for an afternoon.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what a service provider is and name the one method it must implement
- Explain, with the exact mechanism, why `register()` can't use services
- Describe the difference between registration and booting, and when each runs
- Write a custom provider that binds services, loads config, and registers a macro
- Add a provider to `bootstrap/providers.php` and know when that's needed
- Explain why booting is deferred until *all* registrations are done

## 1. What is a Service Provider?

**A service provider is a class that tells the framework what it provides: which services to
bind, and what to set up once every provider has registered.**

It's the bootstrap point for a feature. The framework doesn't know about your analytics service
or your custom Blade directive until a provider registers them. Two methods matter:

| Method | When it runs | What it's for |
|---|---|---|
| `register()` | **Once, first phase** — providers register, in order | Bind things into the container. Nothing else |
| `boot()` | **Once, second phase** — after *all* providers have registered | Use the container and resolved services: routes, macros, observers, event listeners |

The rule that follows: **`register()` may only touch the container; `boot()` may use the
application.** Everything else is a consequence of that.

## 2. Mental Model

Providers are a **two-phase launch sequence** — like a rocket: fuel first, then ignition.

```text
PHASE 1 — REGISTER (all providers, in order)
  P1.register()  binds the payment gateway binding
  P2.register()  binds the analytics service recipe
  P3.register()  binds a cache wrapper            ← bindings are just recipes
  (no service is USED yet — nothing is built, nothing runs)

  ALL providers done registering.

PHASE 2 — BOOT (all providers, in order)
  P1.boot()   can use every binding now
  P2.boot()   registers routes, macros, observers
  P3.boot()   boots the analytics service
```

The ordering guarantee is the whole trick: because booting starts only after registration
finishes, **any provider's `boot()` can use any provider's bindings.** If `register()` tried
to use another provider's binding, that binding might not exist yet.

## 3. Visual Flow

```text
bootstrap/providers.php  ──►  provider list (in order)
                                  │
                                  ▼
        ┌── PHASE 1: REGISTER ───────────────────────────┐
        │  for each provider:  provider->register()      │
        │   → bind / singleton / scoped / mergeConfigFrom │
        │   ❌ NO app() calls here — not all bindings exist│
        └────────────────────────────────────────────────┘
                                  │
                                  ▼
              ALL providers registered ✅
                                  │
                                  ▼
        ┌── PHASE 2: BOOT ───────────────────────────────┐
        │  for each provider:  provider->boot()          │
        │   → resolve services, register routes,         │
        │     macros, observers, view composers          │
        └────────────────────────────────────────────────┘
                                  │
                                  ▼
                    application is ready
                    → handle the request
```

The two arrows matter: `register()` runs for **every** provider before **any** `boot()` runs.
Order is guaranteed within each phase (list order), not across phases.

## 4. How It Works: Registration vs Booting

Under the hood, Laravel collects every provider into an array, then runs two passes:

```php
// simplified — what Laravel's bootstrap does
foreach ($providers as $provider) {
    $provider->register();          // pass 1: everyone registers
}

// after ALL providers registered…
foreach ($providers as $provider) {
    $provider->boot();              // pass 2: everyone boots
}
```

```text
pass 1 (register):  AuthProvider::register  EventProvider::register  MyProvider::register
pass 2 (boot):      AuthProvider::boot      EventProvider::boot      MyProvider::boot
```

The reason for the two passes is **ordering independence**: a provider can depend on bindings
from providers listed later, because by boot time every provider has registered. If booting
happened per-provider right after registering, then P2's boot couldn't use P1's later bindings
without knowing the order.

`boot()` is a real framework hook — it's called once per provider on a fresh application. It
may use the container (`$this->app->make(...)`), the router, config, anything registered so far.

> [!DEEPDIVE]
> The eager-loading trick: `register()` is also where you'd call `$this->app->register()`
> from a plugin to pull in other providers, and where `$this->app->singleton()` adds recipes.
> Some providers are **deferred** — Laravel skips registering them at all until one of their
> listed bindings is resolved, saving a class load per request. Deferred providers are the
> exception that proves the rule: everything still runs through `register()`/`boot()`, just
> lazily.

## 5. Why Can't You Use Services in `register()`?

**Because not everything is registered yet.** `register()` runs in pass 1, when other
providers — and often core bindings — haven't been added to the container. Resolving a service
in `register()` can throw "Target is not instantiable" for a binding that will exist two
providers later.

```php
public function register(): void
{
    $this->app->singleton(MyService::class);

    // ❌ WRONG — resolving here may hit bindings that aren't registered yet
    $service = app(MyService::class);          // may throw!
    $service->bootstrap();                     // even if it works, too early
}
```

```text
register():  app(MyService::class)
             └─ MyService exists… but its dependency Logger was bound by a
                provider LATER in the list → "Target [Logger] is not instantiable"
```

The fix is to bind the *recipe* now and let the container build it lazily when it's actually
resolved — or move the usage to `boot()`:

```php
public function register(): void
{
    // ✅ RIGHT — bind a recipe, don't build the service
    $this->app->singleton(MyService::class, fn ($app) => new MyService($app->make(Logger::class)));
}

public function boot(): void
{
    // Now every binding exists. Safe to use services.
    app(MyService::class)->bootstrap();
}
```

```text
register():  stores the recipe (nothing built)
boot():      every provider has registered → resolve MyService → Logger is bound → works ✅
```

> [!PITFALL]
> "It happens to work" is the dangerous version of this bug. In a small app every binding you
> use in `register()` happens to be registered early, so it never throws — until one more
> provider is added, or config is cached, and the order shifts. Write it right from the start:
> bind in `register()`, use in `boot()`.

## 6. Real Project Usage

| Where | How |
|---|---|
| **App service providers** | `AppServiceProvider` binds app services; `RouteServiceProvider` maps route files |
| **Package providers** | A package ships a provider that registers its classes, config, migrations, views |
| **Registering routes** | `Route::middleware('web')->group(base_path('routes/web.php'))` in `boot()` |
| **Blade directives / macros** | `Blade::directive(...)` and `Str::macro(...)` — registered in `boot()` |
| **Loading config** | `mergeConfigFrom()` in `register()` so package config merges with the app's |
| **Model observers** | `MyModel::observe(MyObserver::class)` in `boot()`, once models exist |
| **Events & listeners** | `Event::listen(...)` in `boot()` — the docs forbid listeners in `register()` |

The pattern that appears in almost every app: bind the service in `register()`, then use it in
`boot()` — often to register routes, macros, or observers that depend on it.

## 7. Interview Explanation

> A service provider is the class that registers a piece of the framework. Every feature —
> routing, auth, events, queues — arrives through one. Providers have two lifecycle methods:
> `register()`, which runs first for every provider and may only bind things into the
> container, and `boot()`, which runs after every provider has registered and may use the
> container, resolve services, and register routes, macros, and observers.
>
> The two phases exist so any provider's `boot()` can rely on any provider's bindings. That's
> why you can't resolve services in `register()` — the container isn't fully populated yet.
> You bind a recipe there and let the container build it lazily, or move usage to `boot()`.

## 8. Senior-Level Insights

- **"Providers are just bootstrap modules"** — the senior framing. When someone asks "how would
  you add a feature to Laravel?", the answer starts with "a service provider", not a helper
  function.
- **Deferred providers are a real perf lever.** A provider that only binds (no `boot` work)
  can be deferred: Laravel registers it lazily, only when one of its services is resolved. That
  skips a class load and a `register()` call on every request that never touches that feature.
- **Order is a fact, not a guess.** You can read `bootstrap/providers.php` to know the order
  any app boots. When a provider depends on another's boot work (not just bindings), the
  dependent provider must come later in the list — and that's a legitimate reason to care about
  order.
- **`boot()` is the last place to mutate global state.** Macros, observers, view composers,
  route registration all belong here. Doing them earlier (in `register()`) works by accident
  until the binding they depend on moves later in the list.
- **Config merging is one-way.** `mergeConfigFrom()` merges your package's defaults *under*
  the app's config — the app's published config always wins. That's a deliberate convention so
  the package can't clobber an app's settings.

## 9. Common Mistakes

- **Calling `app()` / `resolve()` inside `register()`.** The container may not have the binding
  yet. Bind recipes; resolve in `boot()` or lazily.
- **Returning nothing.** `register()` must return void. A common bug is accidentally returning
  a value and getting "A non-null value returned from register()".
- **Binding things that auto-resolve anyway.** `$this->app->bind(Logger::class, Logger::class)`
  is noise — the container already auto-wires concrete classes.
- **Forgetting to register a package provider.** A package that throws "class not found" or
  "method not defined" usually needs its provider in `bootstrap/providers.php` — or it's an
  auto-discovered package that isn't.
- **Doing boot work in `register()` "because it works".** It works until order changes. Keep
  the two phases honest.
- **`register()` that's empty and `boot()` that binds.** Bindings belong in `register()`. A
  `boot()` that binds works but is wrong — it runs after other providers registered, so you've
  lost the ordering guarantee.

## 10. Best Practices

✅ Keep `register()` to container bindings — nothing else

✅ Put route/macro/observer registration in `boot()`

✅ Defer heavy or rarely-used providers (`$this->app->registerDeferredProvider(...)`) or mark
bindings with `defer`

✅ Merge package config with `mergeConfigFrom()` instead of overwriting it

✅ Register providers you need from packages in `bootstrap/providers.php`

❌ Don't resolve services inside `register()`

❌ Don't bind services in `boot()` — bindings belong in `register()`

## 11. Interview Questions

**Q1. What is a service provider?**

> A class that registers a feature into the application. It has two lifecycle methods:
> `register()`, which runs first for every provider and only adds bindings to the container,
> and `boot()`, which runs after all providers have registered and can use the container,
> resolve services, and register routes, macros, and observers.

**Q2. Why can't you use services in `register()`?**

> Because `register()` runs in the first pass, when not every provider has registered yet. The
> service I want may depend on a binding that's registered by a later provider — so resolving
> it can throw "Target [X] is not instantiable." I bind the recipe in `register()` and let the
> container build it lazily, or use it in `boot()` when everything exists.

**Q3. What's the difference between `register()` and `boot()`?**

> `register()` is for binding — it may only touch the container, and it runs before any
> provider boots. `boot()` runs after all registration is complete, so it may use the
> application: resolve services, register routes, macros, observers. Registration is about
> declaring what exists; booting is about using it.

**Q4. How do you register a custom service provider?**

> Create a class extending `ServiceProvider` with a `register()` (and optionally `boot()`)
> method, then add it to the provider array in `bootstrap/providers.php`. If the app is
> auto-discovering providers, it's discovered from the app namespace automatically.

**Q5. When would you make a provider deferred?**

> When the provider only binds services and does no boot work. Deferring means Laravel skips
> loading and registering it until one of its services is actually resolved — saving a class
> load and a `register()` call on requests that never touch that feature.

**Senior follow-up: A package you're building keeps booting before the app's own provider
needs it. How do you handle the ordering?**

> I'd check `bootstrap/providers.php` and move the dependent provider after the package
> provider in the list. If the dependency is only on a *binding*, the order doesn't matter —
> any provider's `boot()` can use any provider's registered bindings. Order only matters when
> one provider's `boot()` work depends on another provider's `boot()` work, and then the
> dependent one goes later.

## 12. Follow-up Questions

**Can a provider register another provider?**

> Yes — `$this->app->register(OtherProvider::class)` inside a provider's `register()` pulls in
> another provider. It's how plugins bundle providers. The newly registered provider's own
> `register()` runs immediately.

**What does `mergeConfigFrom` do?**

> Merges a package's config defaults under the app's config, so the app's published values win.
> Call it in `register()`; the framework merges the arrays so the package provides defaults the
> app can override.

**Why does the provider list live in `bootstrap/providers.php`?**

> It's the framework's registration point — Laravel reads that file while bootstrapping (L106)
> and instantiates every provider in order. It's the map of what the application is made of.

**Can `boot()` be called more than once?**

> On a fresh bootstrap, once per provider. But a provider class may be registered more than
> once, and under Octane a long-lived worker may re-boot. Guard idempotent work (e.g.
> registering an observer twice) so re-booting is safe.

## 13. Comparison Table

| | `register()` | `boot()` |
|---|---|---|
| When | First phase — all providers, in list order | Second phase — after all registrations |
| Can use the container? | ✅ (to bind) | ✅ (to bind AND resolve) |
| Can resolve services? | ❌ — bindings may not exist yet | ✅ — everything is registered |
| Typical work | `bind`, `singleton`, `scoped`, `mergeConfigFrom` | Routes, macros, observers, `Event::listen`, resolving services |
| Return value | void | void |
| Runs even if nothing uses the feature? | Yes (unless deferred) | Yes (unless deferred) |

## 14. Code Example

A complete custom provider — binds a service, loads config, registers a macro — all in the
right phase:

```php
// app/Providers/AnalyticsServiceProvider.php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use App\Services\AnalyticsService;

class AnalyticsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // 1. Load config defaults UNDER the app's config (app values win).
        $this->mergeConfigFrom(__DIR__.'/../../config/analytics.php', 'analytics');

        // 2. Bind the service as a singleton recipe — nothing is built yet.
        $this->app->singleton(AnalyticsService::class, function ($app) {
            return new AnalyticsService($app['config']['analytics']['key']);
        });
    }

    public function boot(): void
    {
        // 3. Safe now: every provider has registered, so every binding exists.
        $analytics = app(AnalyticsService::class);
        $analytics->init();

        // 4. Macros are boot-time registration — nothing runs until called.
        Str::macro('tracked', function (string $value) use ($analytics) {
            return $analytics->track($value);
        });
    }
}
```

```text
register():
  config/analytics.php merged under 'analytics'   (app's analytics.php wins)
  singleton recipe stored — AnalyticsService NOT built yet

boot():
  app(AnalyticsService::class) → built with config key → init() called
  Str::macro('tracked', …) → 'abc'.tracked → analytics->track('abc')
```

```narrate
10-20: register() phase — config merging and bindings only. Nothing is resolved here.
17-19: The closure defers construction: the service isn't built until something resolves it.
22-26: boot() phase — every binding exists now, so resolving is safe.
28-31: A macro is pure registration; it runs when called, not when registered.
```

## 15. Performance Notes

- **Deferred providers are the free win.** Providers that only bind (no boot work) can be
  deferred so they never load unless used. This removes a class load + `register()` call from
  requests that don't touch the feature — worthwhile for integrations like payment SDKs.
- **Boot cost is one-time per bootstrap**, so it matters per request under FPM. Every provider
  in `bootstrap/providers.php` pays `register()` and `boot()` on every request (unless
  deferred). The longer the list, the larger the fixed cost — prune or defer.
- **`mergeConfigFrom` is array merging, not disk I/O** — cheap. The expensive path is
  config file parsing, which `config:cache` eliminates (L106).
- **Don't micro-optimize `boot()`.** A couple of `app()` calls in boot are negligible; the
  structural win is not registering providers that are never used. Measure with the profiler
  before adding deferral complexity.

## 16. Debugging Scenarios

**Scenario 1: "Target [App\Services\Logger] is not instantiable" in a provider.**

You're resolving (or type-hinting into a resolved service) in `register()`, and the binding
lives in a later provider. Move the usage to `boot()` — or, if it's genuinely needed at
registration, move the binding earlier in `bootstrap/providers.php`.

**Scenario 2: "A non-null value returned from register()".**

`register()` returned something. The framework calls it and discards the result — returning a
value is a sign a `return` snuck into a `register()` that's doing boot work. Strip the return;
if it was doing real work, move that work to `boot()`.

**Scenario 3: "My package's config never shows up."**

You called `mergeConfigFrom` in `boot()` (or after the config is already read). Config is read
during registration — call `mergeConfigFrom()` in `register()`. Also confirm the path to the
config file is correct; a typo silently merges nothing.

**Scenario 4: "The observer only fires sometimes."**

`MyModel::observe()` is called in `register()`, before models are fully available — or a
second registration in `boot()` duplicates it. Move observer registration to `boot()` and guard
it so a re-boot doesn't register twice.

**Scenario 5: "Works in dev, fails in production."**

Dev auto-discovers providers; production runs `bootstrap/providers.php` (or a cached bootstrap)
that lists them explicitly. If a provider was discovered in dev but never added to the array,
production misses it. Add it to the array.

## 17. Quick Revision Notes

- Provider = a class that registers a feature; every Laravel feature is one
- `register()`: first phase, bind-only, return void, no resolving
- `boot()`: second phase, after all registrations, may use the app
- Two passes exist so any boot() can use any provider's bindings
- "Target is not instantiable" in a provider = resolving too early
- Bind recipes in `register()`; resolve/macros/routes/observers in `boot()`
- Deferred providers skip loading until a service is resolved — the perf lever
- Providers live in `bootstrap/providers.php`; auto-discovery can hide missing ones in prod
- `mergeConfigFrom()` in `register()`; app config wins

## 18. Cheat Sheet

```text
LIFECYCLE
  register()  →  for ALL providers, in list order     →  BIND ONLY
  boot()      →  for ALL providers, in list order     →  USE EVERYTHING

RULE
  register()  →  bind / singleton / scoped / mergeConfigFrom
  boot()      →  resolve / routes / macros / observers / Event::listen

ERR  "not instantiable" in register()  →  resolving before registration finished
ERR  "non-null value returned"         →  register() must return void

PROVIDERS LIVE IN  bootstrap/providers.php
```

## 19. Key Takeaways

> [!RECAP]
> - A service provider registers a feature into Laravel — every feature is a provider
> - Two phases: `register()` (all providers, bind-only) then `boot()` (all providers, use the app)
> - The phases guarantee any provider's `boot()` can use any provider's bindings
> - Never resolve services in `register()` — bindings from later providers don't exist yet
> - Bind recipes in `register()`; register routes, macros, observers in `boot()`
> - Deferred providers skip loading until a service is resolved — the built-in perf lever
> - `bootstrap/providers.php` is the map; auto-discovery can make missing providers invisible in production

## Check your understanding

Answer these without looking back.

1. What is a service provider, in one sentence?
2. What's the one method every provider must implement, and what may it do?
3. Why does booting wait until every provider has registered?
4. Walk through the exact failure when you call `app(Logger::class)` in `register()` and Logger is bound by a later provider.
5. Where do routes, macros, and observers get registered — and why there?
6. What does `mergeConfigFrom()` do, and which phase does it belong to?
7. A package works in dev but is missing in production. What's the likely cause and the fix?

## What's Next

**Lesson 110 — Facades & Contracts.** Are facades static? What are contracts? Both are
container lookups wearing different clothes.
