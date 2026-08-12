# Lesson 105 — What is Laravel?

**Interview importance:** ⭐ — the orientation answer. It frames everything else in this module, and it is usually the first question in a Laravel interview: "so, what is Laravel?"

Laravel is a **PHP web framework** — a pre-built, opinionated skeleton for HTTP applications, organised around **MVC** and held together by a **service container**. It exists because plain PHP applications converge on the same problems — routing, databases, sessions, templates — and every team solves them slightly differently. Laravel solves them once, the same way every time, so you can spend your time on the parts of the app that are actually yours.

This lesson is where you build the *orientation answer*: what the framework is, why it beats plain PHP, how its big pieces fit together, and what the container is in one paragraph. Every later lesson is a zoom-in on one stop of the request journey this module maps.

## Learning Objectives

By the end of this lesson you should be able to:

- Define Laravel in one sentence without reaching for buzzwords
- Explain MVC in Laravel's terms: route → controller → model → view
- Give the "why not plain PHP" answer with three concrete points
- Say what the container is in one paragraph
- Name the ecosystem pillars — Eloquent, Blade, Artisan, queues — and what each is for
- Answer "Laravel vs plain PHP vs a micro-framework" from a comparison table

## 1. What is Laravel?

**Laravel is an open-source PHP framework for building web applications, built around the MVC pattern and a central service container.**

A framework is the *inverse* of a library: your code calls a library, but a framework calls your code. Laravel owns the HTTP request from `public/index.php` to the response, and your controllers, models, and views are plug-in points inside that flow. That inversion is why "framework" is the right word — you write the parts, Laravel runs the whole.

Laravel is also the most popular PHP framework by a wide margin (and has been for over a decade), which means the ecosystem — packages, hosting, jobs, interview questions — is enormous. Learning Laravel is the highest-leverage bet in the PHP world.

## 2. Mental Model

Think of Laravel as a **restaurant with a set menu**.

- The **front door** is `public/index.php` — every request enters here, no exceptions.
- The **kitchen** is the framework's bootstrapping — it turns on the ovens (services), checks the pantry (config), and assigns stations (providers) before any dish is cooked.
- The **waiter** is the router — it reads the order (the URL + method) and decides which recipe (controller) cooks it.
- The **recipe** is the controller — the instructions, using **models** (ingredients from the pantry, i.e. the database) to assemble a dish.
- The **plate** is the **view** — the finished presentation (HTML/JSON) carried back out by the same waiter.

The kitchen runs *before* the first order, and every order flows through the same door, the same waiter, the same kitchen. That shared pipeline is the request lifecycle (Lesson 106) and it is the map for everything else.

## 3. Visual Flow

```text
                  ┌──────────────────────────────────────────────┐
                  │            public/index.php                  │
                  │        (the front door — every request)      │
                  └───────────────────┬──────────────────────────┘
                                      ▼
                  ┌──────────────────────────────────────────────┐
                  │        bootstrapping (the kitchen)           │
                  │  load config → register providers → boot     │
                  └───────────────────┬──────────────────────────┘
                                      ▼
                  ┌──────────────────────────────────────────────┐
                  │            Router (the waiter)               │
                  │     GET /products  →  ProductController      │
                  └───────────────────┬──────────────────────────┘
                                      ▼
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
   Controller                    Model                      Blade view
   (the recipe)              (the database,               (the plate —
   orchestrates)              Eloquent)                    HTML/JSON)
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      ▼
                  ┌──────────────────────────────────────────────┐
                  │             HTTP Response                    │
                  │     (back out through the same pipeline)     │
                  └──────────────────────────────────────────────┘
```

Everything in this module is a stop on this line. Lesson 106 walks the line end to end; Lesson 107 zooms into the kitchen.

## 4. How It Works

Laravel is built on three structural ideas:

1. **MVC** — Model (data), View (presentation), Controller (orchestration). Laravel's routing layer maps URLs to controller methods; controllers use models to read/write data; views render the output. The separation is what makes a codebase navigable at scale.
2. **The container** — a single object that holds every service the app needs (database connection, session, mailer, cache…) and hands them out on demand. When a controller method type-hints `Request $request`, the container *resolves* it and injects it. Nothing is `new`'d by hand where the container can do it.
3. **Providers** — the wiring instructions. Every feature registers itself with the app through a service provider: "here are my services, here is when to boot me." The framework itself is just a collection of providers (Lesson 107 previews this).

The framework package (`laravel/framework`) is a set of decoupled components — routing, console, database, mail, cache, queue — coordinated by the container. `composer` installs it; `artisan` commands and `bootstrap/app.php` (Lesson 107) glue it together.

> [!NOTE]
> "Laravel" is just a Composer package like any other. `composer.json` requires `laravel/framework`, and that package is itself a bundle of smaller components that could be used independently. Nothing about Laravel is bolted onto PHP from outside — it's ordinary PHP libraries, organised by strong conventions.

## 5. Real Project Usage

A real Laravel project is a directory of conventions. The parts you touch daily:

| Layer | Where it lives | What you write there |
|---|---|---|
| Routes | `routes/web.php`, `routes/api.php` | URL → controller mappings |
| Controllers | `app/Http/Controllers/` | Request handling, orchestration |
| Models | `app/Models/` | Eloquent models for each table |
| Views | `resources/views/` | Blade templates |
| Migrations | `database/migrations/` | Schema changes, versioned |
| Config | `config/` | Per-environment settings |

The very first thing you do with a new project is `composer create-project laravel/laravel`, then `php artisan serve` — and you have an HTTP app. From there, "building a feature" is: route → controller → model → view, with the container and providers doing the plumbing automatically.

## 6. Interview Explanation

> Laravel is an open-source PHP framework for building web applications, organised around MVC and coordinated by a service container. The framework owns the request lifecycle — from `public/index.php` through bootstrapping, routing, and middleware to the controller and back out as a response — and my code plugs into that flow at defined points: routes, controllers, models, views, and service providers.
>
> The container is what makes it cohesive: services register themselves through providers, and the framework injects them where they're needed, so my controllers don't hand-wire dependencies. Its biggest pieces are Eloquent for the database, Blade for templates, Artisan for the command line, and the queue system for async work.

That answer, delivered without hedging, is the whole orientation section done. Notice it names the container *and* the ecosystem in one breath — that's the shape interviewers expect.

## 7. Senior-Level Insights

- **The framework is the container, plus a set of providers.** When you understand that Laravel is "a bootstrap that loads providers into a container," the magic evaporates — facades, contracts, middleware, even `Route::` are all container-resolved services.
- **"Opinionated" is a feature.** Laravel has *default* answers for routing, auth, caching, and queues. Seniors lean into the conventions instead of fighting them, because the next developer (or the interviewer) already knows them.
- **Versioning matters in interviews.** Laravel 11 moved most boilerplate out of the skeleton (`bootstrap/app.php` replaced most of `app/Http/Kernel.php`). Say "in modern Laravel, `bootstrap/app.php` is the wiring point" and you sound current rather than like you learned from a 2019 tutorial.
- **Full-stack synergy.** Your frontend knowledge transfers: Blade is server-side rendering with a template language (compare Lesson 86, Server Components), and a Laravel API feeding Next.js is the same shape as any backend-for-frontend.
- **The container is the differentiator.** Plain PHP and micro-frameworks don't have a container doing dependency injection at the heart. When comparing frameworks, that is the line that matters most — and it's where senior questions go (Lesson 108).

## 8. Common Mistakes

❌ Calling Laravel "a CMS" — it is a *framework*; you write the app. WordPress is a CMS.

❌ Saying "MVC" but not being able to place routing — in Laravel the router is the front controller; MVC's "controller" receives the request *after* the route has matched.

❌ Answering "what is Laravel?" with features only: "it has Eloquent and Blade." Those are components — the *frame* is the lifecycle + container + providers.

❌ Assuming Laravel 11+ still has `app/Http/Kernel.php` and the classic `Kernel::class` bootstrappers — that moved into `bootstrap/app.php`. Reciting the old file layout dates you.

❌ Treating facades as static classes. `Cache::get()` *looks* static but is a container lookup (Lesson 110). Mis-explaining this in an interview loses a senior signal fast.

## 9. Best Practices

✅ Learn the request lifecycle first — every other Laravel concept is a stop on it

✅ Say "service container" out loud until the phrase feels ordinary — it is the load-bearing concept

✅ Follow the conventions for at least a year before questioning them — framework opinion is the point

✅ Read the current major version's docs, not decade-old tutorials — the skeleton changed a lot between Laravel 8 and 11

✅ When asked "why Laravel?", give the *why not plain PHP* answer — it shows you've thought about the trade

❌ Don't describe Laravel by listing packages; describe the *architecture* (lifecycle, container, providers) and then the packages as the payload

❌ Don't say "facades are static" — they are proxies for container-resolved services

## 10. Interview Questions

**Q1. What is Laravel?**

> An open-source PHP framework for building web applications, organised around MVC and coordinated by a service container. It owns the request lifecycle and calls my code — routes, controllers, models, views, providers — at defined points inside that flow.

**Q2. Why not just plain PHP?**

> Because every real app needs routing, database access, sessions, auth, and templates, and each team solving those independently produces the same bugs with different names. Laravel solves them once, in one consistent, documented, testable way — so my code is the part that's actually mine. It also brings the ecosystem: migrations, queues, caching, and a huge package library.

**Q3. What is MVC in Laravel's terms?**

> The Model is the data layer — Eloquent models wrapping tables. The View is presentation — Blade templates. The Controller is the orchestration layer — it receives the request, talks to models, and returns a view or a response. The router maps URLs to controller methods.

**Q4. What is the service container, in one paragraph?**

> The container is a single object that holds every service the application needs — the database connection, cache, session, mailer, and so on — and resolves them on demand. Services register themselves through service providers, and when code needs one, the container builds it and injects it — including recursively building its dependencies. That's dependency injection at the heart of the framework, and it's why controllers don't hand-wire their own dependencies.

**Q5. Name the main pieces of the Laravel ecosystem.**

> Eloquent for the database, Blade for templates, Artisan for the command line, and the queue system for async work — plus the container and providers that wire it all together. And Composer for dependencies, since the framework itself is just a package.

**Q6. Is Laravel a micro-framework?**

> No. Micro-frameworks like Slim or Lumen are minimal — routing and little else — and you assemble the rest yourself. Laravel is a full-stack framework: batteries included, with conventions for routing, DB, auth, queues, and caching. Lumen is actually Laravel's own micro-framework, built from the same components with the optional pieces removed.

**Senior follow-up: What would a minimal "framework" need before you'd call it one?**

> Two things: an inversion of control point — the framework calls *my* code, not the reverse — and a bootstrap that wires services together once per request. Everything else (routing, templates, DB) is a component you can add or swap. That's the mental yardstick I use to compare Laravel against Slim or raw PHP.

## 11. Follow-up Questions

**Is Laravel good for APIs too?**

> Yes — `php artisan install:api` sets up `routes/api.php` with a JSON-first pipeline (no sessions or web middleware by default), and Laravel ships the tools APIs need: rate limiting, token auth, resource responses, and JSON error handling. The same framework serves HTML via Blade and JSON via API routes.

**Why is Laravel so popular?**

> Because it's opinionated *and* complete — most teams would otherwise assemble this stack themselves. The docs are exceptional, the ecosystem (Forge, Vapor, Nova, the package library) removes hosting and admin pain, and the job market rewards the skill.

**How does Laravel relate to PHP itself?**

> Laravel is written in PHP and runs on PHP — it's a framework *for* the language, not a replacement. You still need PHP 8.2+ and Composer; the framework standardises how you structure code, not which language you write.

## 12. Comparison Table

| | **Laravel** | **Plain PHP** | **Micro-framework (Slim/Lumen)** |
|---|---|---|---|
| Scope | Full-stack: routing, DB, auth, queues, caching | Nothing — you build it all | Routing + a few HTTP helpers |
| Inversion of control | Framework calls your code | Your code calls everything | Framework calls your code |
| Dependency injection | Service container, built-in | Hand-rolled or absent | Minimal / manual wiring |
| Database layer | Eloquent ORM + query builder | Whatever you write (often PDO) | Bring your own |
| Templates | Blade, built-in | You pick/echo everything | Bring your own |
| CLI tooling | Artisan, migrations, seeders | None | None (or minimal) |
| Opinion | High — conventions for everything | None — every decision is yours | Low — you assemble the rest |
| Best for | Full apps and APIs, team velocity | Tiny scripts, learning PHP internals | Small services, ultra-light APIs |
| Interview framing | "the framework with the container" | "the baseline it saves you from" | "Laravel minus the batteries" |

## 13. Code Example

A feature end to end — route, controller, model, view. This is the entire mental model in four files.

```php
// routes/web.php
use App\Http\Controllers\ProductController;

Route::get('/products/{product}', [ProductController::class, 'show']);
```

```php
// app/Http/Controllers/ProductController.php
namespace App\Http\Controllers;

use App\Models\Product;

class ProductController extends Controller
{
    public function show(Product $product)   // container injects the model binding
    {
        return view('products.show', ['product' => $product]);
    }
}
```

```php
// app/Models/Product.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Eloquent maps this model to the products table
}
```

```blade
{{-- resources/views/products/show.blade.php --}}
<h1>{{ $product->name }}</h1>
<p class="price">£{{ number_format($product->price / 100, 2) }}</p>
```

```narrate
line 1:  the route — GET /products/{product} calls ProductController::show
line 2:  the controller method — {product} is resolved by the router into a Product model
line 3:  Eloquent does the database read; the view gets the model
line 4:  the view renders plain HTML using the model's attributes
```

What the request produces:

```text
GET /products/42

  1. Router matches /products/{product} → ProductController::show
  2. {product} = 42 is resolved through Eloquent (container + model binding)
  3. SQL executed:  select * from `products` where `id` = 42 limit 1
  4. view('products.show') renders the Blade template with $product

HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8

<h1>Woolly Beanie</h1>
<p class="price">£24.99</p>
```

Note the SQL in step 3 — that's how you "see" what Eloquent did. Readers of this module learn to predict that line before they trust any query.

> [!TIP]
> The container is invisible in that example, which is exactly the point: the route, the model binding, and the view resolver all *used* the container without you writing a single `new`. You'll meet the container head-on in Lesson 108.

## 14. Performance Notes

- **Framework cost is real but small.** Laravel bootstraps and boots dozens of providers per request; with OPcache enabled that overhead is typically a few milliseconds — dwarfed by the database and rendering work it organises.
- **Opcache is non-negotiable.** Laravel is many PHP files; without OPcache, every request recompiles them. `php artisan optimize` pre-compiles config, routes, and events so bootstrapping reads caches instead of files.
- **The skeleton got lighter.** Laravel 11 removed a pile of default middleware and boilerplate, so fresh apps bootstrap less. Smaller surface = fewer wasted instructions per request.
- **When you outgrow the defaults,** the standard lever is *not* abandoning the framework — it's caching (config/route/view caches), queues for slow work, and only then heavier infrastructure.
- **For interviews:** "OPcache + config cache, then optimise the queries" is the correct senior shape. Nobody expects you to out-benchmark plain PHP on a single route; the framework earns its cost by making everything else faster to build and operate.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| `Class "App\Models\Product" not found` | Model in the wrong namespace or not created | `php artisan make:model Product`, check `app/Models/` |
| Route returns 404 for a URL you "defined" | Route in `routes/api.php` but you hit `/products` (no `/api` prefix) or the route file isn't loaded | Check which route file your URL implies; `php artisan route:list` |
| `View [products.show] not found` | File path/name doesn't match the dotted view name | The dot maps to a slash: `products.show` = `resources/views/products/show.blade.php` |
| Changes "don't take effect" | Config/route cache serving stale data | `php artisan optimize:clear` after changing config, routes, or views |
| "Too many redirects" on a fresh install | Auth middleware vs. missing session config | `php artisan key:generate` first; check `.env` |

## 16. Quick Revision Notes

- Laravel = **PHP framework**, MVC-shaped, container-driven, provider-wired
- Framework **calls your code**; you never `new` what the container can inject
- Request path: `public/index.php` → bootstrap → router → controller → model/view → response
- **MVC**: route → controller orchestrates, models hold data, views present
- **Container**: one object that resolves and injects services, dependencies included
- **Ecosystem pillars**: Eloquent (DB), Blade (views), Artisan (CLI), queues (async)
- The "why not plain PHP" answer = routing, DB, sessions, auth, templates, solved once
- **Full-stack** vs **micro**: batteries included vs. assemble-it-yourself
- Laravel 11+ wires itself in `bootstrap/app.php`, not the old `Kernel.php`

## 17. Cheat Sheet

```text
Definition:   open-source PHP framework, MVC + service container
Entry point:  public/index.php  (every request, no exceptions)
Flow:         index.php → bootstrap → router → controller → model/view → response
MVC:          route → Controller → Model (Eloquent) + View (Blade)
Container:    resolves & injects services (Request, DB, cache, mail…)
Providers:    the wiring instructions — "register these services, boot me here"
Artisan:      php artisan serve | make:model | route:list | optimize:clear
New app:      composer create-project laravel/laravel my-app
Versions:     Laravel 11+: bootstrap/app.php, slimmer skeleton, PHP 8.2+
```

## 18. Key Takeaways

> [!RECAP]
> - Laravel is an **opinionated PHP framework**: MVC-shaped, container-driven, provider-wired
> - The framework **calls your code** — you plug into the lifecycle, you don't drive it
> - The container is the load-bearing idea: services resolve and inject themselves
> - The ecosystem pillars to name in an interview: **Eloquent, Blade, Artisan, queues**
> - The "why not plain PHP" answer is *solved once, consistently, for everyone*
> - Full-stack vs micro-framework is a scope comparison, not a quality one
> - Know the current skeleton (`bootstrap/app.php`, slim Laravel 11+) so you don't date yourself

## Check your understanding

Answer these without looking back.

1. Define Laravel in one sentence, without the word "powerful".
2. Which layer does the router feed into, and what do models and views each do?
3. Give the "why not plain PHP" answer in three points.
4. Explain the service container in one paragraph, mentioning providers and injection.
5. Name the four ecosystem pillars and what each one is for.
6. From the comparison table: what's the *real* difference between Laravel and a micro-framework?
7. What does "the framework calls your code" mean, concretely, for a `GET /products/42` request?

## What's Next

**Lesson 106 — Request Lifecycle.** The full journey from `public/index.php` to a response: the kernel bootstrapping sequence, middleware, routing, the controller, and the return trip — the single most-asked Laravel question, and the map every other lesson in this module follows.
