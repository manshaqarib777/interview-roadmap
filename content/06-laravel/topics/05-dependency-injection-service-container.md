# Topic 5 — Dependency Injection & Service Container

**Checklist anchor:** IoC · dependency injection · service container · binding · singleton · scoped · contextual · interface→implementation · automatic resolution

**Owning lesson:** [108 The Service Container & Dependency Injection](../108-service-container.md)

---

## The one-sentence answer

**The service container is the object that builds and wires your classes; dependency injection is the pattern of asking for what you need instead of creating it yourself.**

## The mental model

Without a container, every class creates its own dependencies:

```php
class OrderController {
    public function store(Request $request) {
        $mailer = new Mailer();               // hard-coded — swap = edit here
        $mailer->send(...);
    }
}
```

That's the **tight coupling** the container exists to remove. Instead:

```php
class OrderController {
    public function __construct(private Mailer $mailer) {}
    // the container sees the type hint, builds a Mailer, injects it
}
```

The container is the **matchmaker**: it reads what a class needs, builds the dependency (and *its* dependencies, recursively), and hands the finished object over. You never write `new` for a service — you *ask*.

## How it works

### Binding a recipe

```php
use App\Services\PaymentGateway;
use App\Services\StripePaymentGateway;

$this->app->bind(PaymentGateway::class, StripePaymentGateway::class);
//      "interface"  →                    "implementation"
```

Callers type-hint `PaymentGateway`; the container hands back `StripePaymentGateway`. Swap the binding and no caller changes — that's the entire point.

### The binding kinds

| Binding | When it builds | The recipe |
|---|---|---|
| `bind()` | New instance on **every** resolve | `$this->app->bind(Service::class, fn () => new Service())` |
| `singleton()` | **Once**, then reused | `$this->app->singleton(Service::class, ...)` |
| `scoped()` | Once **per request/job** lifecycle | `$this->app->scoped(Service::class, ...)` |
| `instance()` | A pre-built object | `$this->app->instance(Service::class, $obj)` |
| `contextual()` | Different impl per consumer | `$this->app->when(ControllerA::class)->needs(Repo::class)->give(RepoA::class)` |

### Automatic resolution (reflection)

The container reads the constructor type hints and builds the graph:

```php
$this->app->bind('mailer', fn () => new Mailer());
// resolve a controller that type-hints Mailer — the container builds it recursively
$controller = $this->app->make(UserController::class);
```

The plain-JS version of the same idea:

```js
const app = new Container();
app.bind('mailer', () => new Mailer());
// resolve() reads the hint, resolves 'mailer', passes it to the constructor
const controller = resolve(UserController, app);
```

## The three binding types in plain JS (what the exercise models)

```js
app.bind('logger', () => ({ log: (m) => `[log] ${m}` }));       // new each time
app.singleton('cache', () => ({ get: (k) => `cached:${k}` }));  // once, reused
// interface → implementation
app.bind('PaymentGateway', () => ({ charge: (n) => `stripe charged ${n}` }));
```

## Why DI beats direct instantiation

1. **Replaceable** — bind a fake in tests, a different provider in staging, without touching callers.
2. **Testable** — inject a mock and assert on it; no global state to reset.
3. **Decoupled** — a class knows its *contract* (the interface), not the concrete class.
4. **Composable** — the container resolves the whole dependency graph, not just one level.

## Interview questions

**Q1. What is the IoC container?**
> The container is the engine of dependency injection in Laravel. You bind recipes — class names, or interfaces to implementations — and the container resolves them on demand, recursively building any dependencies the class declares. It's an Inversion of Control container: instead of the class creating its dependencies, the container supplies them.

**Q2. What's the difference between `bind` and `singleton`?**
> `bind` returns a fresh instance on every resolve. `singleton` builds once and returns the same instance for the rest of the app's life. Use singleton for stateless services where the instance is interchangeable; use bind when each consumer needs its own state.

**Q3. What is contextual binding?**
> When a single interface has different implementations for different consumers — for example `FileRepository` for the invoice controller and `DbRepository` for the audit controller. Laravel lets you say "when *this* class needs *that* interface, give it *this* implementation."

**Q4. How does automatic resolution work?**
> Laravel reflects on the constructor's type hints. When you `make(OrderController::class)`, it reads the `Mailer` hint, resolves (or builds) a Mailer, and passes it in — recursively, so the Mailer's own dependencies are also resolved. You only bind things that can't be auto-resolved, like interfaces or primitives.

**Q5. Why is DI better than `new`?**
> Direct instantiation hard-codes the dependency, makes swapping impossible without editing the caller, and makes testing painful. DI lets the caller depend on a contract, lets tests inject fakes, and keeps classes decoupled. The container is what makes DI automatic instead of manual.

**Senior follow-up: When would you *not* use the container?**
> When a class is a value object — `Money`, `Address`, a DTO — created from data, not services. The container is for services with dependencies; value objects are built with `new` because there's nothing to inject and no swap to make.

## Common mistakes

❌ Resolving services inside `register()` — a later provider's binding may not exist yet; use `boot()`.

❌ Treating the container as a service locator god-object — injecting the container and resolving inside the class hides dependencies instead of declaring them.

❌ Using `singleton` for stateful services — a singleton leaking request state across requests is a classic bug.

❌ Binding everything — the container auto-resolves concrete classes; bind only interfaces, primitives, and things needing special construction.

## Quick revision notes

- **DI**: ask for dependencies, don't create them
- **Container**: builds and wires the graph, recursively
- `bind()` = new each resolve · `singleton()` = once · `scoped()` = once per lifecycle · `instance()` = prebuilt
- **Interface → implementation** is the pattern that makes swapping zero-touch
- **Auto-resolution**: type hints + reflection; bind only the non-obvious

## Check your understanding

1. What problem does the container actually solve?
2. When does `singleton` bite you?
3. How does automatic resolution know what to build?
4. Why is interface→implementation binding the foundation of testability?
