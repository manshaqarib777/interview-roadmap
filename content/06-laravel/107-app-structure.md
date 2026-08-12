# Lesson 107 — Application Structure & Bootstrapping

**Interview importance:** ⭐⭐ — a "where does this live?" question that tests whether you've actually *built* with Laravel rather than read about it.

A Laravel project is a set of conventions: `app/` for your code, `config/` for settings, `routes/` for URLs, `bootstrap/` for the application's own wiring. The file that ties it together is **`bootstrap/app.php`** — the one file every request and every artisan command passes through, where the container, the middleware, and the routing are configured. This lesson is about the anatomy of a real app and how the bootstrapping sequence from Lesson 106 gets assembled.

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the standard Laravel directory tree from memory
- Say what `app/Http`, `app/Models`, `app/Providers`, `config/`, `bootstrap/`, and `routes/` each hold
- Explain what `bootstrap/app.php` does and why it's the wiring point
- Define a service provider and preview register vs boot
- Recite the bootstrap sequence: config load → providers register → providers boot

## 1. What is Application Structure & Bootstrapping?

**Application structure is the conventional directory layout of a Laravel project; bootstrapping is the ordered sequence — load config, register providers, boot providers — that turns those files into a running application.**

The structure is the *what and where* of the app. The bootstrap is the *when and how*: the sequence that reads the structure and powers the framework on, exactly as the kernel did in Lesson 106. The two are one topic because the file layout exists to make bootstrapping predictable.

## 2. Mental Model

Think of the project as a **restaurant with a labelled kitchen**.

- `app/` is the **kitchen floor** — everything your staff (your code) does daily.
- `config/` is the **wall of dials** — oven temperatures, opening hours, supplier keys. Read at startup, tweaked per environment, never hard-coded into recipes.
- `routes/` is the **menu** — the list of dishes (URLs) and which chef (controller) cooks each.
- `database/` is the **pantry ledger** — migrations (how the pantry is stocked), factories and seeders (test stock).
- `resources/` is the **plating station** — the views (Blade templates), CSS, and JS that dress each dish.
- `bootstrap/` is the **prep room** — and `bootstrap/app.php` is the **opening checklist**: which ovens to preheat (providers), which stations to set up (middleware), where the menu lives (routes). It runs first, every shift, before a single dish is cooked.

The opening checklist is the bootstrapping sequence: check the dials (config) → preheat the ovens (providers register) → stations live (providers boot).

## 3. Visual Flow

```text
laravel-project/
├── app/
│   ├── Http/
│   │   ├── Controllers/        ← route targets, orchestration
│   │   ├── Middleware/         ← the onion layers from L106
│   │   └── Requests/           ← form validation objects
│   ├── Models/                 ← Eloquent models (one per table)
│   ├── Providers/              ← wiring: AppServiceProvider, RouteServiceProvider…
│   ├── Services/               ← (your convention) domain logic
│   └── Console/                ← custom artisan commands
├── bootstrap/
│   ├── app.php                 ← THE wiring point: container, middleware, routing
│   └── providers.php           ← the app's service provider list
├── config/                     ← .env-driven settings, one file per area
├── database/
│   ├── migrations/             ← schema as versioned code
│   ├── factories/              ← test data generators
│   └── seeders/                ← starter rows
├── public/
│   └── index.php               ← the front door (Lesson 106)
├── resources/
│   ├── views/                  ← Blade templates
│   ├── css/  js/               ← compiled assets
├── routes/
│   ├── web.php                 ← browser routes (session, CSRF)
│   ├── api.php                 ← JSON routes (throttled, stateless)
│   └── console.php             ← artisan command routes
├── storage/                    ← logs, cache, uploads (writable)
├── tests/                      ← Feature + Unit tests
└── .env                        ← environment secrets (never committed)

Bootstrap order (every request, every command):
    config/*.php  ──►  providers register  ──►  providers boot  ──►  ready to dispatch
```

That tree is the *default* — Laravel's convention. The important sentence to remember: **the structure exists so the bootstrap knows where everything is.**

## 4. How It Works

The whole application starts in one small file:

```php
// bootstrap/app.php (Laravel 11+)
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // append(), alias(), prepend()… — the global middleware stack
    })
    ->withProviders([
        // extra providers beyond those in bootstrap/providers.php
    ])
    ->create();
```

```text
What runs when this file executes:
  1. Composer autoloader loads the classes (public/index.php, line 1)
  2. bootstrap/app.php is required — the container/application is created
  3. The provider list is read from bootstrap/providers.php
  4. Later, the kernel boots the app: config → register providers → boot providers
  5. Routing + middleware config take effect (used when the router dispatches)
```

```php
// bootstrap/providers.php — the app's own service providers
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
];
```

The kernel (from Lesson 106) then does the real bootstrapping *using* this file's configuration: it loads config, registers the providers listed here (plus any framework providers), and boots them. `bootstrap/app.php` is not magic — it's the factory that builds the application object, and `bootstrap/providers.php` is the list of wires that get plugged in.

> [!PITFALL]
> The #1 provider bug: resolving another service inside `register()`. Registration happens provider-by-provider, so the service you resolve may not be bound yet — and the failure is a cryptic "target class does not exist" on the *first* request, not at deploy time. The rule is mechanical: `register()` binds, `boot()` resolves.

## 5. Real Project Usage

Real projects live in these directories every day:

| Directory | What you actually do there |
|---|---|
| `app/Http/Controllers/` | Handle requests — `php artisan make:controller` |
| `app/Models/` | Eloquent models, relationships, scopes — `make:model` |
| `app/Providers/` | Register your services; `AppServiceProvider::boot()` for app-wide wiring |
| `routes/` | Map URLs: `web.php` for pages, `api.php` for JSON, `console.php` for commands |
| `config/` | `config/database.php`, `config/services.php`, custom `config/analytics.php` |
| `database/migrations/` | Version the schema — the first file you write for a new table |
| `bootstrap/` | Rarely touched after scaffolding — but *the* answer to "where does the app get wired?" |
| `tests/` | `php artisan test` — feature tests mirror the request lifecycle |

A typical first task on a real project: `php artisan make:model Product -m` (model + migration), write the migration, `php artisan migrate`, add a route in `routes/web.php`, a controller method, a Blade view. That one workflow exercises half the tree — and all of it is convention, not configuration.

> [!TIP]
> If a directory doesn't exist yet, Laravel *creates* it for you. `php artisan make:middleware EnsureAdmin` makes `app/Http/Middleware/` on demand — the structure is a convention, not a straitjacket.

## 6. Interview Explanation

> A Laravel project is organised by convention. `app/` holds my code — controllers, middleware, models, and providers. `routes/` maps URLs to controllers, `config/` holds environment-driven settings, `database/` versions the schema, and `resources/views` holds Blade templates.
>
> The whole thing is wired in `bootstrap/app.php` — it creates the application, configures routing and middleware, and lists the service providers. `bootstrap/providers.php` is that list. On every request, the kernel loads the config, registers the providers into the container, then boots them. That sequence — config, register, boot — is the bootstrap, and it's the same for HTTP requests, artisan commands, and queue workers.

Short, concrete, and it connects to Lesson 106's bootstrappers without being a recital of them.

## 7. Senior-Level Insights

- **The provider list is the app's dependency graph.** Reading `bootstrap/providers.php` tells you what a Laravel project is made of. When you onboard onto a codebase, that file plus `bootstrap/app.php` is your first read — before the routes.
- **`register()` vs `boot()` is the key distinction.** In `register()` you bind services into the container *without using them*; in `boot()` you're allowed to *use* services, because every provider has registered by then. The classic bug — resolving a service inside `register()` that isn't registered yet — is a provider-order bug, not a logic bug.
- **`withProviders()` is a recent addition.** In Laravel 11 the provider list lives in a separate file (`bootstrap/providers.php`) that you can edit directly; before that it was a `config/app.php` array. Knowing both tells the interviewer you've shipped across versions.
- **Custom service classes have no mandated home.** `app/Services/` (or `app/Domain/…`) is *your* convention — Laravel only names a few core folders. Saying "I keep service classes here and wire them in a provider" shows you've made deliberate structure decisions.
- **The structure is the bootstrap's contract.** A Laravel app boots because every convention is discoverable — config is in `config/`, providers are listed, routes are in `routes/`. The moment you invent parallel structures (`lib/`, home-grown DI), you pay the cost of the convention you abandoned.
- **The frontend parallel:** `resources/views` + Blade is your server-side rendering home — compare Lesson 86, Server Components, for the "where does presentation live?" conversation on the front half of the stack.

## 8. Common Mistakes

❌ Putting business logic in controllers. Controllers orchestrate; real logic belongs in models, services, or actions — "skinny controllers" is the constant senior review comment.

❌ Hard-coding configuration in code instead of `config/` + `.env`. "I change the API key in three files" is the symptom of not using the config layer.

❌ Editing `bootstrap/app.php` without understanding it — adding middleware there when it belongs in a route group, or registering a provider that's already listed.

❌ Resolving a service inside `register()`. `register()` is for *binding*; `boot()` is for *using*. Doing the second in the first causes "target class doesn't exist" at the worst moment.

❌ Forgetting `php artisan optimize:clear` after editing config or routes — the compiled caches (from Lesson 105/106) are the reason "my change didn't apply."

❌ Assuming `app/Services/` is a Laravel default. It's a convention teams add — fine to use, wrong to cite as the framework's.

## 9. Best Practices

✅ Read `bootstrap/app.php` + `bootstrap/providers.php` first when joining a Laravel codebase

✅ Keep controllers thin — orchestrate, then delegate to models/services

✅ Put environment-specific values in `.env`, read them through `config/`, never inline

✅ Use `php artisan make:*` commands so the structure places your files correctly

✅ Bind in `register()`, consume in `boot()`

✅ Cache config and routes in production (`php artisan optimize`), and clear caches after edits in dev

❌ Don't create parallel conventions until the framework's are genuinely wrong for the app

❌ Don't resolve services in `register()` — the container isn't fully populated yet

## 10. Interview Questions

**Q1. Walk me through the standard Laravel directory structure.**

> `app/` holds my application code — controllers, middleware, models, and providers. `routes/` maps URLs to controllers (`web.php` for browser requests, `api.php` for JSON). `config/` holds environment-driven settings, `database/` holds migrations, factories, and seeders, and `resources/views` holds Blade templates. `bootstrap/` holds the app's own wiring — `app.php` and the provider list. `public/index.php` is the entry point, and `storage/`, `tests/`, and `.env` round it out.

**Q2. What is `bootstrap/app.php` and why does it matter?**

> It's the file that creates the Laravel application. It configures where the routes live, what middleware the app uses, and what providers are registered, then returns a configured `Application` instance. `public/index.php` requires it on every request, and artisan commands go through the same wiring — so it's the single point where the app is assembled.

**Q3. What does a service provider do?**

> It's the class that tells the container about your services. In `register()` you bind services and singletons into the container without using them. In `boot()` — which runs after every provider has registered — you can consume services and hook into framework events. It's the wiring layer between your code and the framework.

**Q4. What is the difference between `register()` and `boot()`?**

> `register()` happens first, for every provider, and it's only for binding things into the container — you can't safely *use* other services there because they may not be registered yet. `boot()` runs after all registration is done, so it's where you resolve services, register event listeners, and do app-wide setup. Registration first, then booting, is the ordering that makes the whole thing safe.

**Q5. Where does each kind of code live?**

> Requests and HTTP concerns in `app/Http` — controllers, middleware, form requests. Data in `app/Models` as Eloquent models. Wiring in `app/Providers`. Settings in `config/`. URL mappings in `routes/`. Templates in `resources/views`. Schema in `database/migrations`. And custom domain logic — my convention — in `app/Services` or `app/Actions`.

**Q6. What's in `routes/api.php` vs `routes/web.php`?**

> `web.php` handles browser requests — it gets the session and CSRF middleware by default. `api.php` is for JSON APIs — stateless, rate-limited, no session by default, prefixed with `/api`. Same framework, different middleware groups for different clients.

**Senior follow-up: You join a project and need to understand what it does in five minutes. Where do you look?**

> `bootstrap/app.php` and `bootstrap/providers.php` first — that's the app's wiring and dependency list. Then `routes/` to see what the app actually exposes, `config/` for the environment shape, and `app/Models` for the domain. That's the skeleton; the controllers and views fill in the details. The structure is a map — you read the map before walking the streets.

## 11. Follow-up Questions

**Can you add a service provider in Laravel 11?**

> Two ways: add its class to `bootstrap/providers.php`, or register it in `bootstrap/app.php` with `withProviders()`. The file-based list is the modern default — `php artisan make:provider` creates the class, and you add it to the list.

**Where does custom domain logic go?**

> Laravel's default directories cover HTTP, models, and providers, but not "services." The common conventions are `app/Services/` for service classes and `app/Actions/` for single-purpose action classes, wired into the container via a provider when they need dependencies. It's a team convention — the point is that it's *consistent*.

**Why is `storage/` writable?**

> Because Laravel writes logs, framework caches, compiled views, and user uploads there at runtime. It's the one directory the web server must be able to write — hence the `storage:link` step for public uploads.

**How does the bootstrap sequence relate to the kernel's bootstrappers from Lesson 106?**

> They're the same sequence at two levels. The kernel's bootstrappers are the framework's steps — load env, load config, register providers, boot providers. `bootstrap/app.php` and `bootstrap/providers.php` supply the *application-specific* parts: your config files, your provider list. The kernel orchestrates; these files are the payload it orchestrates.

## 12. Comparison Table

| Directory | What it holds | The mental slot |
|---|---|---|
| `app/Http/` | Controllers, middleware, form requests | The kitchen floor |
| `app/Models/` | Eloquent models, relationships, scopes | The pantry |
| `app/Providers/` | The wiring — register/boot your services | The junction box |
| `config/` | `.env`-driven settings, one file per area | The wall of dials |
| `bootstrap/` | `app.php` + `providers.php` — the app's own assembly | The prep room / checklist |
| `routes/` | URL → controller maps (`web`, `api`, `console`) | The menu |
| `database/` | Migrations, factories, seeders | The pantry ledger |
| `resources/views/` | Blade templates | The plating station |
| `public/index.php` | The entry point (Lesson 106) | The front door |
| `tests/` | Feature + unit tests | The QA corner |

## 13. Code Example

A real service provider — this is the smallest provider that shows register vs boot meaningfully:

```php
// app/Providers/AnalyticsProvider.php
namespace App\Providers;

use App\Services\Analytics;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\UserRegistered;

class AnalyticsProvider extends ServiceProvider
{
    public function register(): void
    {
        // BIND, don't use: nothing else is guaranteed to be registered yet.
        $this->app->singleton(Analytics::class, function () {
            return new Analytics(config('services.analytics.key'));
        });
    }

    public function boot(): void
    {
        // USE is safe here: every provider has registered by this point.
        Event::listen(UserRegistered::class, function (UserRegistered $event) {
            app(Analytics::class)->track('user_registered', $event->user->id);
        });
    }
}
```

```php
// bootstrap/providers.php — where that provider gets listed
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
    App\Providers\AnalyticsProvider::class,
];
```

```narrate
line 7:  register() only BINDS the Analytics service into the container
line 8:  the closure defers construction — nothing is built until first use
line 9:  reading config here is safe; resolving OTHER services is not
line 14: boot() runs after ALL providers registered — using services is safe now
line 16: app(Analytics::class) resolves what register() bound earlier
```

What this provider does at runtime:

```text
Request arrives
  kernel bootstraps (L106 order):
    1. load .env
    2. load config            → config/services.php read
    3. register exceptions
    4. register facades
    5. register providers     → AnalyticsProvider::register() binds Analytics
                              → (App + Route providers register too)
    6. boot providers         → AnalyticsProvider::boot() listens for UserRegistered

Later, UserRegistered fires:
  app(Analytics::class)  → the singleton built from register()'s closure
                         → Analytics::track('user_registered', 42) called
```

The shape to internalise: **bind in `register()`, act in `boot()`, and the provider list is the app's manifest.**

## 14. Performance Notes

The structure exists for bootstrapping, and bootstrapping is a per-request cost (Lesson 106):

- **Fewer providers = cheaper bootstrap.** Every provider in the list is registered and booted per request. Laravel 11 removed boilerplate providers for exactly this reason — each one was real milliseconds on every request.
- **Config files are loaded at bootstrap.** `config:cache` merges them into one compiled file, so a dozen `config/` files cost one file read.
- **Deferred providers are the pro lever.** A provider can declare it only provides certain bindings, so it's *not loaded at all* unless one of them is resolved. Senior answer: "I'd make heavy providers deferred, then cache config and routes."
- **Storage writes** (logs, cache, compiled views) go to `storage/`; keeping that on fast disk and the heavy reads out of the hot path matters more than any micro-optimisation.
- **Interview framing:** structure enables the bootstrap; the bootstrap is the per-request tax; the tax is paid by caching config/routes and keeping providers lean.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| "Target class [Analytics] does not exist" | Provider not listed in `bootstrap/providers.php` (or binding missing) | Add the provider to the list; check `register()` binds the class |
| Service resolved as `null` in a provider | Resolved something inside `register()` before it was registered | Move consumption to `boot()`, keep `register()` for binding only |
| "Class not found" right after adding a provider | Composer hasn't re-mapped the namespace | `composer dump-autoload` |
| Config change has no effect | `config:cache` serving the old compiled config | `php artisan optimize:clear` |
| New route 404s | Route file not wired in `withRouting()` in `bootstrap/app.php` | Check `bootstrap/app.php` lists the route file; `php artisan route:list` |
| Migration "table already exists" | Migration file in `database/migrations/` ran before | `php artisan migrate:rollback` or `migrate:fresh` in dev, never in prod |

## 16. Quick Revision Notes

- The tree: `app/` (your code), `config/` (settings), `routes/` (URL map), `database/` (schema), `resources/` (views/assets), `bootstrap/` (the app's own wiring)
- **`bootstrap/app.php`** = creates the app, wires routing + middleware; **`bootstrap/providers.php`** = the provider list
- Provider lifecycle: **`register()` binds, `boot()` uses** — and boot runs only after *all* registration
- Bootstrap sequence: **config → providers register → providers boot** → dispatch (Lesson 106)
- The same bootstrap serves **HTTP requests, artisan commands, and queue workers**
- Skinny controllers; logic in models/services/actions
- `php artisan make:*` places files; `php artisan optimize:clear` after config/route edits
- Provider list = the app's manifest — the first thing to read on a new codebase

## 17. Cheat Sheet

```text
App code:      app/Http (controllers, middleware), app/Models,
               app/Providers, app/Console (artisan commands)
Settings:      config/*.php   (read .env — never hard-code values)
Routes:        routes/web.php, routes/api.php, routes/console.php
Database:      database/migrations|factories|seeders
Views:         resources/views (Blade)
Entry:         public/index.php  (requires bootstrap/app.php)

Wiring:        bootstrap/app.php        → create app, configure routing+middleware
               bootstrap/providers.php  → the provider manifest

Provider:      register()  → bind services into the container (no using!)
               boot()      → use services, wire events (after all registers)

Bootstrap:     config load → providers register → providers boot → dispatch
Commands:      php artisan make:provider | make:controller | make:model -m
               php artisan optimize | optimize:clear
```

## 18. Key Takeaways

> [!RECAP]
> - Laravel's structure is **convention, not config**: `app/`, `config/`, `routes/`, `database/`, `resources/`, `bootstrap/` — each with one job
> - **`bootstrap/app.php`** is the app's wiring point; **`bootstrap/providers.php`** is the provider manifest
> - A provider **binds in `register()`, acts in `boot()`** — boot only runs after every provider has registered
> - The bootstrap sequence is **config → register providers → boot providers**, then dispatch (Lesson 106)
> - HTTP, console, and queue workers bootstrap the **same way** from the same files
> - Controllers orchestrate; keep them thin — logic lives in models, services, and actions
> - On a new codebase, read `bootstrap/` first — it's the map of what the app is made of

## Check your understanding

Answer these without looking back.

1. Draw the directory tree from memory — at least ten entries.
2. What is `bootstrap/app.php`, and what is `bootstrap/providers.php`?
3. In your own words: why can't you resolve services in `register()`?
4. Name the three steps of the bootstrap sequence, in order.
5. Where would you put (a) a middleware class, (b) a custom domain service, (c) a queue's schema change?
6. What's the difference between `routes/web.php` and `routes/api.php`?
7. You join a project: which two files do you read first, and why?

## What's Next

**Lesson 108 — The Service Container & Dependency Injection.** The IoC container is the heart of Laravel — how bindings are registered and resolved, constructor injection vs method injection, and why senior interviews probe this directly.
