# Lesson 108 — The Service Container & Dependency Injection

**Interview importance:** ⭐⭐⭐⭐ — the IoC container is the heart of Laravel; senior
interviews probe it directly.

The container is the one piece of Laravel you use on every request without ever touching it.
Type-hint `PaymentGateway` in a constructor and the right object appears. Someone builds it,
wires its dependencies, and hands it over — that someone is the service container, and being
able to explain it is what separates "uses Laravel" from "can explain Laravel".

Senior interviews probe this directly, because the container is where the framework's
architecture decisions are encoded: how objects are built, how long they live, and how one
interface can resolve to any implementation without a single caller changing. Lesson 106
showed where the container sits in the request lifecycle; this lesson is the container itself.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what the service container is, in one sentence, and what "inversion of control" means
- Explain automatic resolution: how a constructor type-hint turns into a built object
- Choose between `bind`, `singleton`, and `scoped` — and defend the choice
- Bind an interface to an implementation in one line
- Argue why DI beats direct instantiation — testability, swapability, decoupling
- Build a ~40-line container in plain JS that does the same job

## 1. What is the Service Container?

**A service container is a registry of "how to build things" plus a resolver that builds them.**

When you write:

```php
public function __construct(protected PaymentGateway $gateway) {}
```

You never say *which* payment gateway. The container decides — from a binding you registered
earlier — and constructs the whole dependency graph for you. The decision being made *outside*
the class is the inversion: the class says what it needs, the container says what it gets.

Two jobs; keep them separate in your head:

| Job | Laravel | What it does |
|---|---|---|
| **Register** | `$this->app->bind(...)` | Teach the container a recipe: "when asked for X, build it like this" |
| **Resolve** | `app(X::class)` / `resolve(X::class)` | Follow the recipe, building dependencies along the way, return the object |

The container is not a warehouse of pre-built objects — it's a factory with a menu. Nothing is
built until something asks for it (with one exception: singletons are built on first request,
then reused).

## 2. Mental Model

The container is a **menu, not a warehouse**.

| Laravel | Menu metaphor |
|---|---|
| `bind()` | "Add a dish: whenever anyone orders PaymentGateway, cook a StripePaymentGateway" |
| `singleton()` | "Cook this once, keep it warm, serve the same dish to everyone" |
| `scoped()` | "One dish per sitting (request/job), fresh at the next sitting" |
| resolve | Ordering — the kitchen builds the dish, and whatever side dishes it needs |
| Constructor type-hint | The order: "I need a PaymentGateway" (no brand specified) |
| Interface binding | The menu note: "PaymentGateway? We serve Stripe for that" |

The key inversion: **the class that needs a dependency doesn't know how it's built, and the
place that knows how to build it never talks to the class.** They meet in the middle, at the
container.

## 3. Visual Flow

```text
  OrderController needs a PaymentGateway          (type-hint, no brand)
                        │
                        ▼
   ┌────────────────────────────────────────────┐
   │               CONTAINER                     │
   │                                              │
   │   binding:  PaymentGateway::class            │
   │             └─► StripePaymentGateway         │   ← registered earlier
   │                                              │
   │   resolve(PaymentGateway::class)             │
   │     → check binding → found                  │
   │     → build StripePaymentGateway             │
   │        → needs HttpClient → build it         │   ← recursion
   │     → return the finished object             │
   └────────────────────────────────────────────┘
                        │
                        ▼
   controller gets a StripePaymentGateway, fully wired, never named it
```

Note the recursion: resolving one class can resolve five. The container doesn't stop at the
top-level binding — it walks the entire constructor graph.

## 4. How It Works: Automatic Resolution (Reflection)

When there's no binding for a class, Laravel doesn't give up. It uses **reflection**: PHP reads
the class's constructor, sees its type-hints, and recursively resolves each one.

```php
// No bind() anywhere. This works — as long as the type-hints are
// concrete classes (interfaces can't be auto-wired, see below):
class OrderService
{
    public function __construct(
        protected StripePaymentGateway $gateway,   // ← reflected
        protected Logger $logger,                  // ← reflected
    ) {}
}

// Laravel's resolve(OrderService::class) ≈
//   new OrderService(
//       resolve(StripePaymentGateway::class),
//       resolve(Logger::class),
//   );
```

```text
resolve(OrderService::class)
 ├─ reflect constructor → 2 parameters
 ├─ resolve(StripePaymentGateway::class) → auto-wires the concrete class
 ├─ resolve(Logger::class)               → auto-wires the concrete class
 └─ new OrderService(stripe, logger)   ✅
```

Automatic resolution works for any **concrete, resolvable** class. It fails when the type-hint
is an **interface or abstract class with no binding** — the container can't guess an
implementation. That's exactly when you register a binding:

```php
// app/Providers/AppServiceProvider.php
public function register(): void
{
    $this->app->bind(
        PaymentGateway::class,       // what callers type-hint
        StripePaymentGateway::class, // what actually gets built
    );
}
```

```text
Before binding:  resolve(PaymentGateway::class)  →  💥 Target is not instantiable
After binding:   resolve(PaymentGateway::class)  →  StripePaymentGateway instance ✅
```

> [!TIP]
> The error "Target [X] is not instantiable" always means one of two things: you type-hinted an
> interface or abstract class with no binding, or a class can't be built because of its
> constructor. Read the name in the brackets — it tells you what failed.

### A tiny container in plain JS

The whole mechanism fits in ~40 lines. This is the mental model every "how does the container
work" question hangs on:

```js
class Container {
  constructor() {
    this.bindings = new Map();   // name → { factory, kind }
    this.shared  = new Map();    // name → singleton instance
  }

  bind(name, factory)      { this.bindings.set(name, { factory, kind: 'bound' }); }
  singleton(name, factory) { this.bindings.set(name, { factory, kind: 'singleton' }); }
  scoped(name, factory)    { this.bindings.set(name, { factory, kind: 'scoped' }); }

  resolve(name) {
    const entry = this.bindings.get(name);
    if (!entry) throw new Error(`Target [${name}] is not instantiable.`);

    // singletons: built once, reused forever
    if (entry.kind === 'singleton' && this.shared.has(name)) {
      return this.shared.get(name);
    }

    const instance = entry.factory(this);   // ← container passes ITSELF in,
                                            //   so factories can resolve
                                            //   their own dependencies
    if (entry.kind === 'singleton') this.shared.set(name, instance);
    return instance;
  }
}

// --- demo ------------------------------------------------------------
class Logger {
  log(msg) { return `[log] ${msg}`; }
}

class OrderService {
  constructor(logger) { this.logger = logger; }   // ← constructor injection
  place() { return this.logger.log('order placed'); }
}

const app = new Container();
app.bind('logger', () => new Logger());                            // new each time
app.singleton('orders', (c) => new OrderService(c.resolve('logger')));

const a = app.resolve('orders');
const b = app.resolve('orders');

console.log(a === b);                        // singleton → true
console.log(a.place());
```

Output:

```text
true
[log] order placed
```

```narrate
3-9: Bindings are just recipes — name → factory function. Nothing is built yet.
11-18: resolve() looks up the recipe, then calls the factory. This IS the container.
20-22: The factory receives the container itself, so nested dependencies resolve recursively.
33-36: A dependency delivered through the constructor — the factory builds it, the class never calls new.
38-46: singleton means the second resolve returns the same object. Try removing it and watch a === b flip to false.
```

## 5. Real Project Usage

| Where | How |
|---|---|
| **Controllers** | Type-hint a service in the constructor; the container injects it per request |
| **Service layer** | Bind interfaces to implementations so controllers never know the concrete class |
| **Jobs / commands** | `handle(OrderService $orders)` — method injection, same container |
| **Third-party packages** | Their providers bind their classes; your app resolves them with no config |
| **Tests** | Rebind an interface to a fake before each test — zero changes to the code under test |
| **Event listeners** | The container resolves the listener class and injects what it needs |

The pattern that pays most in real code: **a controller that type-hints an interface**. Every
caller is decoupled from the implementation, so swapping providers is a one-line binding change,
not a refactor.

```php
class CheckoutController extends Controller
{
    public function __construct(protected PaymentGateway $gateway) {}
    //                        ^ interface — never mentions Stripe
}
```

```text
StripePaymentGateway::class   → bound to PaymentGateway::class   (one line)
PayPalPaymentGateway::class   → swap the binding, done.
Controller code: zero changes. Tests: fake gateway bound, zero changes.
```

## 6. Interview Explanation

> The service container is the object that builds and hands out the framework's dependencies.
> When a class type-hints a dependency in its constructor, the container resolves it — using
> reflection to read the constructor if there's no explicit binding, and recursively building
> everything that class needs.
>
> You register recipes with `bind`, `singleton`, or `scoped`. `bind` builds a new instance
> every time; `singleton` builds once and reuses it for the app's lifetime; `scoped` builds
> once per request or job. Interfaces need an explicit binding — that's the
> `$this->app->bind(PaymentGateway::class, StripePaymentGateway::class)` line — because the
> container can't guess an implementation.
>
> The point is inversion of control: the class declares what it needs and never constructs it,
> so the same code runs against any implementation you bind.

## 7. Senior-Level Insights

- **The container is a plain array of closures.** Laravel's real container stores recipes in an
  array keyed by class name; `bind()` mostly does `$this->bindings[$abstract] = fn ($app, $params) =>
  new $concrete(...)`. No magic — once you've built a tiny one (Section 4), the real one is
  that, plus reflection and a few caches.
- **"Not instantiable" is the container telling you it can't guess.** Interfaces, abstract
  classes, and classes with non-resolvable constructor params all fail with it. The senior
  reflex is to read the target name, then check for a missing binding — not to sprinkle
  `app()->make()` calls around.
- **Automatic resolution is lazy.** Nothing is built until resolved, so a request that never
  touches a service never pays for it. Resolution cost is proportional to what you actually
  resolve.
- **Lifetimes are a design decision, not a default.** People default to `singleton` "for speed"
  without asking the real question: can two callers safely share this instance? Stateless
  services: singleton. Stateful ones (per-request context, user-scoped repositories): scoped.
  If you'd answer differently after a week in production, you chose wrong.
- **DI is a decoupling tool, not a ceremony.** If a class is only ever built one way and never
  tested in isolation, a constructor taking five interfaces is noise. Size the abstraction to
  the actual seams.

## 8. Common Mistakes

- **Resolving in `register()` of a provider.** When `register()` runs, other providers haven't
  registered yet — resolving early throws "not instantiable" for bindings that exist later.
  Bind closures; resolve in `boot()` or at runtime (the whole topic of Lesson 109).
- **Binding a concrete class that's already auto-resolvable.** `bind(Logger::class, Logger::class)`
  adds nothing. Only bind when the container *can't* guess: interfaces, abstract classes, or
  construction that needs arguments.
- **Using `singleton` for stateful services.** A singleton shared across a request — or across
  requests under Octane — means one user's data can leak into another's. When in doubt:
  `scoped` or plain `bind`.
- **`app()` everywhere instead of injection.** Calling the container from inside a class is the
  service locator pattern — a hidden dependency. Constructor injection keeps the dependency
  graph visible in the signature.
- **Forgetting that type-hints, not names, drive resolution.** `bind('cache', ...)` and
  type-hinting a contract class are different keys. Bind what you type-hint.

## 9. Best Practices

✅ Bind interfaces, type-hint interfaces — callers then can't reach the concrete class

✅ Choose the lifetime deliberately: stateless → singleton, request-scoped → scoped, stateful-per-use → bind

✅ Prefer constructor injection over `app()` inside classes

✅ Keep `register()` to bindings only — resolve in `boot()` or at runtime (Lesson 109)

✅ Let auto-resolution do the boring work; only bind what can't be guessed

❌ Don't bind concrete classes that resolve fine on their own

❌ Don't make a singleton out of something that holds per-user state

## 10. Interview Questions

**Q1. What is Laravel's service container?**

> A registry of "how to build things" plus a resolver. You bind a name or interface to a recipe,
> and when something asks for it the container builds it — resolving the whole constructor graph
> recursively. If there's no recipe, it uses reflection to auto-wire concrete classes.

**Q2. How does automatic resolution work?**

> The container reflects on the constructor, reads the type-hints of its parameters, and
> resolves each one — recursively. If a parameter is a concrete class with a resolvable
> constructor, it just builds it; if it's an interface or abstract class, it needs a binding,
> otherwise you get "Target is not instantiable."

**Q3. `bind`, `singleton`, `scoped` — what's the difference?**

> `bind` builds a new instance on every resolve. `singleton` builds once and returns the same
> instance for the app's lifetime. `scoped` builds once per scope — typically a request or a
> queued job — and is fresh for the next one. The choice is about how long an instance may
> safely be shared.

**Q4. How do you bind an interface to an implementation?**

> In a service provider's `register()`:

> ```php
> $this->app->bind(PaymentGateway::class, StripePaymentGateway::class);
> ```

> ```text
> resolve(PaymentGateway::class)  →  StripePaymentGateway instance
> ```

> Now any constructor that type-hints `PaymentGateway` receives a `StripePaymentGateway`, and
> switching providers means changing this one line.

**Q5. Why is DI better than just `new`-ing the dependency?**

> Three reasons. **Testability:** I can bind a fake gateway in a test and the class under test
> never knows. **Swapability:** changing the implementation is one binding line, not a
> search-and-replace across callers. **Decoupling:** the class depends on an interface it can
> describe, not on a concrete class's internals — so the same code compiles and tests against
> any implementation.

**Senior follow-up: When would you NOT use the container?**

> When the container would hide a dependency. The container is great for wiring the app's
> seams — but if I find myself injecting a service into a class just to pass it to another
> class, the container is hiding a dependency the class actually has; I'd pass it through the
> signature instead. And I wouldn't resolve from the container inside a class when constructor
> injection would make the dependency visible — that's the service locator antipattern.

## 11. Follow-up Questions

**What happens if the container can't resolve something?**

> It throws `BindingResolutionException` with "Target [X] is not instantiable." The target name
> tells you what failed: an interface or abstract class with no binding, or a class whose
> constructor can't be auto-wired. Fix the binding, not the call site.

**Is the container instantiated per request?**

> One container per application bootstrap, which is once per request under classic PHP-FPM.
> Under Octane, the same container lives across requests — which is exactly why `scoped` exists:
> singleton instances survive too long unless they're stateless.

**Does automatic resolution work for method parameters, not just constructors?**

> Yes — a queued job's `handle()`, a controller method, and route action parameters can all be
> type-hinted and get injected. Same reflection mechanism, applied at the call site.

**Why is `singleton` the wrong default for a repository?**

> Repositories are often stateless, so singleton is fine. But the moment a repository caches
> anything per-user, a singleton means request B reads request A's cache. `scoped` gives the
> same reuse *within* a request and a clean slate for the next one.

## 12. Comparison Table

| | `new` in the class | Service locator (`app()`) | **DI container (constructor injection)** |
|---|---|---|---|
| Dependency visible in signature | ❌ hidden | ❌ hidden | ✅ |
| Caller knows the implementation | ✅ (concrete) | ❌ | ❌ |
| Swap implementation | Refactor every call | Change the lookup | **One binding line** |
| Test in isolation | Fake is impossible | Fake the locator | **Bind a fake, done** |
| Container involved | None | Resolve at call site | Builds and injects once |

And the lifetimes:

| Binding | Built | Lives | Use for |
|---|---|---|---|
| `bind` | every resolve | per instance | Stateful-per-use, or anything cheap |
| `singleton` | first resolve | whole app | Stateless services (mailer, logger) |
| `scoped` | first resolve in scope | one request/job | Per-request context, user-scoped repos |

## 13. Code Example

The full picture — interface binding plus auto-wired dependencies:

```php
// app/Providers/AppServiceProvider.php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Interface → implementation. Anything type-hinting PaymentGateway
        // now receives a StripePaymentGateway.
        $this->app->bind(
            PaymentGateway::class,
            StripePaymentGateway::class,
        );

        // A service built once and reused — safe here because it's stateless.
        $this->app->singleton(OrderService::class);
    }
}
```

```text
resolve(PaymentGateway::class)   → StripePaymentGateway            (from the bind)
resolve(OrderService::class)     → auto-wired, singleton, cached
resolve(OrderService::class)     → SAME instance again             (singleton)
```

```narrate
8-15: register() may ONLY touch the container — bind recipes here, resolve nowhere.
12-15: bind an interface to an implementation; callers keep type-hinting the interface.
17-18: singleton with no closure: the container auto-wires the class, builds once, reuses.
```

And the consumer — a controller that never mentions a concrete implementation:

```php
// app/Http/Controllers/CheckoutController.php
class CheckoutController extends Controller
{
    public function __construct(
        protected PaymentGateway $gateway,   // injected by the container
    ) {}

    public function charge(Request $request): JsonResponse
    {
        $charge = $this->gateway->charge($request->input('amount'));

        return response()->json(['charge_id' => $charge->id]);
    }
}
```

```text
POST /checkout/charge  →  container injects StripePaymentGateway
                      →  StripeGateway::charge(4999)  →  { id: 'ch_3…' }
                      →  200  {"charge_id":"ch_3…"}
```

## 14. Performance Notes

- **Resolution is one array lookup + a build.** Built singletons are cached, and reflection
  results are cached per class after first use. Warm resolution of a bound service is a hash
  lookup.
- **Cost is proportional to what you resolve.** A request touching three services pays for
  three builds, not for the whole container. Don't pre-build "just in case" — the lazy default
  is already the fast default.
- **`singleton` saves build cost, not resolve cost.** The win is skipping constructor work on
  reuse. If construction is trivial, singleton buys nothing and risks sharing state.
- **Cached config** means bindings that read config read it from the cached array — one reason
  `config:cache` helps (L106, bootstrapping).
- **Under Octane**, everything is long-lived, so scoped vs singleton stops being academic: a
  careless singleton becomes a cross-request state leak, and per-request resolution cost
  disappears entirely.

## 15. Debugging Scenarios

**Scenario 1: "Target [App\Services\Analytics] is not instantiable."**

You type-hinted a class that can't be built — usually because its constructor takes an argument
the container can't guess (a string, an enum, another interface). Two fixes: give it a
resolvable constructor, or bind it explicitly with a closure that supplies the argument.

**Scenario 2: "It works in my controller but not in my job."**

A controller gets injected fine, but a job's `handle()` throws. Queued jobs are serialized and
re-resolved in the queue worker — if the binding lives in a provider that doesn't run in the
worker's bootstrap, resolution fails. Check `bootstrap/providers.php` and that the job's
dependencies are resolvable from a cold container.

**Scenario 3: "Two requests share state."**

A repository or service you bound as `singleton` is holding per-user data. Switch to `scoped`
if it should be per-request, or remove the cache from the singleton entirely. Under Octane this
shows up as one user seeing another user's data — the classic singleton-with-state leak.

**Scenario 4: "`new MyClass(...)` works but the container throws."**

`new` doesn't resolve dependencies — you passed them by hand. The container only has the class
name, so it reflects: if the constructor needs an interface with no binding, it throws. Bind
the interface, or pass a closure to `bind` that does exactly what your `new` line did.

## 16. Quick Revision Notes

- Container = recipes (bindings) + resolver; nothing builds until asked
- `bind` → new instance each resolve; `singleton` → one per app; `scoped` → one per request/job
- Auto-resolution: reflection reads constructor type-hints, resolves recursively
- Interfaces need an explicit binding: `bind(PaymentGateway::class, Stripe::class)`
- "Target [X] is not instantiable" = can't guess → missing/incorrect binding
- `register()` = bind only; resolve in `boot()` (Lesson 109)
- DI wins: testability, swapability, decoupling — dependency visible in the signature
- Service locator (`app()` inside classes) is the antipattern; inject instead

## 17. Cheat Sheet

```text
RESOLVE  →  app(X::class)             build X (and its deps), return
BIND     →  $this->app->bind(X, Y)    resolve X → new Y() each time
SINGLETON→  $this->app->singleton(X)  one instance for the app
SCOPED   →  $this->app->scoped(X)     one instance per request/job
INTERFACE→  bind(PaymentGateway::class, StripePaymentGateway::class)

ERROR  "Target [X] is not instantiable"  →  binding missing / can't guess

RULE   register() binds, boot() resolves.  Never make() in register().
```

## 18. Key Takeaways

> [!RECAP]
> - The container is a recipe registry plus a resolver — "when asked for X, build it like this"
> - Nothing is built until resolved; singleton instances are the one exception and they're cached
> - Automatic resolution uses reflection to walk constructor type-hints recursively
> - `bind` = new each time · `singleton` = one per app · `scoped` = one per request/job
> - Interfaces are not instantiable — that's why `bind(PaymentGateway::class, StripePaymentGateway::class)` exists
> - DI beats `new`: testable (bind a fake), swappable (one line), decoupled (interface in the signature)
> - The container is just a map of closures — a ~40-line JS version does the same job (Section 4)

## Check your understanding

Answer these without looking back.

1. In one sentence: what does the service container do?
2. Walk through what happens when the container resolves a class whose constructor type-hints two other classes.
3. `bind` vs `singleton` vs `scoped` — give the lifetime of each, and a case where `singleton` is wrong.
4. Why does `resolve(PaymentGateway::class)` throw before you bind it, and what does the error mean?
5. Give the three reasons DI beats direct instantiation, each in one clause.
6. What does "Target [X] is not instantiable" tell you, and what's the first thing you check?
7. You're asked why a singleton service leaked user data between requests. What went wrong, and what's the fix?

## What's Next

**Lesson 109 — Service Providers.** `register()` vs `boot()` — the lifecycle that wires the
whole framework together, and why the order is everything.
