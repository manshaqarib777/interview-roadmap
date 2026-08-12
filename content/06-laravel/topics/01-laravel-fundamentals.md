# Topic 1 — Laravel Fundamentals

**Checklist anchor:** What is Laravel? · MVC · request lifecycle · app structure · service providers · facades · contracts · helpers · config · env vars · Artisan · routing · controllers · Blade · sessions · cookies · CSRF · encryption · logging

**Owning lesson:** [105 What is Laravel](../105-what-is-laravel.md) · [106 Request Lifecycle](../106-request-lifecycle.md) · [107 Application Structure & Bootstrapping](../107-app-structure.md)

---

## The one-sentence answer

**Laravel is a PHP web framework built on the MVC pattern — a routing layer that maps HTTP requests to controllers, a container that wires services together, and a template engine that renders views.**

## What it actually is

Laravel is a **batteries-included** framework. "Batteries included" means it ships with the things every real app needs: authentication, queues, caching, mail, sessions, validation, encryption, and a testing harness — all with a coherent API and one container underneath.

The three pillars every interviewer is really probing:

| Pillar | What it is | Where it lives |
|---|---|---|
| **MVC** | Model (data), View (presentation), Controller (logic glue) | `app/Models`, `resources/views`, `app/Http/Controllers` |
| **The container** | The thing that builds and wires your classes | `bootstrap/app.php`, resolved all over |
| **The lifecycle** | The fixed path every request takes | `public/index.php` → kernel → middleware → route |

## The mental model

Think of Laravel as a **restaurant kitchen with a fixed process**. Every order (request) enters through the same front door (`public/index.php`), the manager (kernel) turns the kitchen on once, the maître d' (middleware) vets each order in and checks the bill out, and the chef (router + controller) cooks using ingredients from the pantry (models). The finished dish leaves through the same doors in reverse.

Everything in Laravel is a **stop on that fixed line**. If you can trace a request end-to-end, you can place any feature — queues, caching, validation — on the map.

## How it works, briefly

```php
// public/index.php — the front door, trimmed
require __DIR__.'/../vendor/autoload.php';          // load every class
$app = require_once __DIR__.'/../bootstrap/app.php'; // build the container
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request);               // run the lifecycle
$response->send();
$kernel->terminate($request, $response);
```

The kernel runs six bootstrappers in order: **env → config → exceptions → facades → register providers → boot providers**. Then the request goes **in through middleware, to the route and controller, and back out through the same middleware in reverse**.

## The directory map

| Path | What lives there |
|---|---|
| `app/Http/Controllers` | Controllers — thin, route to services |
| `app/Models` | Eloquent models |
| `app/Providers` | Service providers — register/boot services |
| `app/Http/Middleware` | Request filters |
| `routes/` | `web.php`, `api.php`, `console.php`, `channels.php` |
| `resources/views` | Blade templates |
| `config/` | Configuration files, `env()` helpers |
| `database/` | Migrations, factories, seeders |
| `bootstrap/` | `app.php` (wiring), `providers.php` (provider manifest) |
| `public/` | `index.php`, assets — the only web-exposed directory |

## Common interview questions

**Q1. What is Laravel?**
> A PHP web framework built on MVC. It gives you routing, a service container for dependency injection, an ORM (Eloquent), a template engine (Blade), and first-party tools for auth, queues, caching, and testing — all sharing one request lifecycle and one container.

**Q2. Explain the request lifecycle.**
> Every request enters `public/index.php`, which builds the app from `bootstrap/app.php` and hands the request to the kernel. The kernel bootstraps — env, config, exceptions, facades, register providers, boot providers — then sends the request through middleware, which wraps the router. The router matches the URL to a controller, the controller builds a response through models and views, and the response travels back out through the same middleware in reverse, gets sent, and `terminate()` cleans up.

**Q3. What is the IoC container?**
> The container is the object that builds and manages your classes. You bind a recipe — a class, or an interface to an implementation — and the container resolves it on demand, recursively injecting the dependencies the class declares. It's the engine behind dependency injection in Laravel.

**Q4. What are service providers?**
> The central place to register things into the container. Every service, package, and feature is registered by a provider — `register()` binds recipes, `boot()` runs after every provider has registered, so it can safely use services. `bootstrap/providers.php` lists them.

**Q5. What are facades?**
> Static-looking classes that proxy to an instance resolved from the container. `Cache::get()` looks static, but it resolves the real cache instance from the container and forwards the call. They're a syntax convenience over the container, not static state.

**Q6. Facade vs dependency injection?**
> Same underlying instance, two ergonomics. A facade is a static-looking proxy that resolves from the container at call time; DI injects the instance through a constructor. Both reach the same object. DI is more explicit and easier to unit test; facades are more convenient and testable via `Cache::fake()`.

**Q7. What are Laravel contracts?**
> The interfaces the framework uses for its services — `Illuminate\Contracts\Cache\Store`, `Illuminate\Contracts\Queue\Queue`, etc. Contracts let you swap implementations without touching callers, and they're the seams where fakes and test doubles plug in.

**Q8. Why shouldn't you put business logic inside controllers?**
> Because controllers should only be the *traffic cop*: take the request, validate it, call a service, return a response. Business logic — payments, inventory, email — lives in services or models. Fat controllers couple the logic to HTTP, make it untestable outside a request, and force the same logic to be duplicated wherever it's needed.

## Senior follow-up

**How would you explain the container to someone who's never seen DI?**
> Instead of `new Mailer()` inside the controller — which hard-codes the dependency and makes swapping impossible — you ask the container for it. The controller declares "I need a Mailer," and the container builds it, resolving its own dependencies recursively. The benefit is replaceability: bind `PaymentGateway` to `StripePaymentGateway`, and every caller gets the new implementation without changing a line.

## Common mistakes

❌ Treating Laravel as "just PHP files" — the framework is the lifecycle, and every feature is a stop on it.

❌ Describing MVC as "the whole framework" — MVC is the pattern; the container and lifecycle are what make it Laravel.

❌ Saying facades are static methods — they're proxies; the syntax is static, the state is not.

❌ Answering "what is Laravel" with a feature list — answer with the architecture: MVC + container + lifecycle.

## Quick revision notes

- Laravel = **MVC + container + lifecycle**, batteries included
- Every request: `public/index.php` → kernel → **bootstrap (6 steps)** → middleware in → route → controller → middleware out → send → terminate
- Providers: **register()** binds, **boot()** uses — all register first, then all boot
- Facades: **static-looking syntax, real instance from the container**
- Contracts: **interfaces** — swap implementations without touching callers
- Controllers: **thin** — validate, call a service, respond

## Check your understanding

1. What are the three pillars of Laravel, and what does each do?
2. Write the six kernel bootstrappers in order.
3. What's the difference between `register()` and `boot()`?
4. Are facades static? Explain.
5. Why are contracts useful beyond "interfaces"?
6. Where does business logic belong, and why not in the controller?
