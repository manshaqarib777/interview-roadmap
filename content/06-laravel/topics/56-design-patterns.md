# Topic 56 — Design Patterns

**Checklist anchor:** Factory · Strategy · Repository · Adapter · Observer · Singleton · Dependency Injection · Decorator · Builder · Command — and where Laravel itself uses them

**Owning lesson:** [130 Service Layer, Repositories & SOLID](../130-solid-patterns.md)

---

## The one-sentence answer

**Design patterns are named, reusable solutions to recurring problems — and Laravel is a catalog of them, so knowing the pattern means knowing where in the framework it already lives.**

## The mental model

The senior framing: **you already use these patterns every day in Laravel** — you just didn't call them by name. The interview is about naming them and pointing at where the framework embodies them:

```text
Pattern          Where it already lives in Laravel
─────────────    ─────────────────────────────────────────
Factory          Eloquent factories, model factory
Strategy         Queue connections / cache drivers / mailers
Repository       (your own, when the swap is real — Lesson 54)
Adapter          Flysystem storage disks (S3, local, FTP)
Observer         Model observers (Lesson 48) — and event listeners
Singleton        Container singletons (Lesson 5)
DI               The container itself (Lesson 5)
Decorator        Middleware around the route (Lesson 3)
Builder          Eloquent query builder chains (Lesson 12/13)
Command          Artisan commands + queue jobs (Lesson 44/26)
```

## The ten patterns, each with the Laravel example

### Factory — create objects without specifying the exact class

```php
User::factory()->count(10)->create();   // the factory decides the shape (Lesson 42)
// also: the container's factory closures — bind a recipe, resolve on demand
```

### Strategy — swap algorithms at runtime

```php
// queue connections, cache drivers, mailers — all strategy-pattern:
CACHE_STORE=redis    // the "strategy" is config, not code (Lesson 33/34)
// the caller uses one interface; the driver is chosen by config
```

### Repository — abstract data access (Lesson 54)

```php
interface OrderRepository { /* ... */ }
EloquentOrderRepository implements OrderRepository;   // swap the impl
```

### Adapter — make one interface look like another

```php
// Flysystem: Storage::put() works identically on local, S3, Dropbox
// each "disk" is an adapter making the storage API uniform (Lesson 36)
```

### Observer — react to state changes

```php
Order::observe(OrderObserver::class);    // model lifecycle hooks (Lesson 48)
// and the event/listener system (Lesson 28) is the same idea app-wide
```

### Singleton — one shared instance

```php
$this->app->singleton(Cache::class, ...);   // built once, reused (Lesson 5)
```

### Dependency Injection — supply dependencies, don't create them

```php
class OrderService {
    public function __construct(private PaymentGateway $payments) {}
}
// the container builds and injects (Lesson 5) — the framework's core pattern
```

### Decorator — wrap behaviour around a core

```php
// middleware: each layer wraps the next (Lesson 3):
auth → throttle → ROUTE → throttle → auth
// the onion is the decorator pattern around the route
```

### Builder — construct step by step

```php
User::where('active', true)->orderBy('name')->limit(10)->get();
// each method returns the builder; the query compiles at get() (Lesson 13)
// also: MailMessage chains (Lesson 31)
```

### Command — encapsulate an action

```php
php artisan make:command SendDailyDigest   // CLI commands (Lesson 44)
SendOrderConfirmation::dispatch($order)    // queue jobs (Lesson 26)
```

## How to answer "what patterns do you know?"

1. **Name the pattern and its problem** — "Strategy: swapping an algorithm without changing the caller."
2. **Point at where Laravel uses it** — "cache drivers are Strategy — `CACHE_STORE=redis` swaps the implementation, the code doesn't change."
3. **Name where you've used it yourself** — "I used Adapter wrapping a payment SDK behind one interface."

That third step is the senior one — the framework's usage proves you know it; your own usage proves you *apply* it.

## Interview questions

**Q1. What design patterns does Laravel use?**
> Nearly the whole catalog: Factory (Eloquent factories), Strategy (cache/queue/mail drivers), Adapter (Flysystem disks), Observer (model observers, events), Singleton (container singletons), Dependency Injection (the container), Decorator (middleware), Builder (query builder), Command (artisan, jobs) — and Repository where you introduce it (Lesson 54).

**Q2. Where is the Strategy pattern in Laravel?**
> In the driver-based services. Cache, queues, and mail all have an interface with multiple implementations, and config picks one — `CACHE_STORE=redis`. The caller uses the facade/interface; the strategy is chosen by config, not by editing code (Lesson 33/34).

**Q3. What's the difference between Observer and Command patterns?**
> Observer reacts to state changes — `Order::created` fires hooks and listeners (Lesson 48/28). Command encapsulates an action to execute later — a queue job `SendOrderConfirmation` (Lesson 26). One is "when X happens, react"; the other is "do this specific thing."

**Q4. Where is the Decorator pattern?**
> Middleware. Each middleware wraps the next layer — the request passes in through the stack and out in reverse (Lesson 3). That's the decorator pattern around the route: adding cross-cutting behaviour (auth, throttling) without changing the route.

**Q5. When would you introduce a pattern Laravel doesn't give you?**
> When the framework's default doesn't fit — a Strategy for a business algorithm (shipping pricing), an Adapter around an external SDK, a Repository at a real data seam (Lesson 54). The senior rule: name the *problem* first, then the pattern — never "I need a pattern, what fits?"

**Senior follow-up: Design patterns vs over-engineering?**
> The same shape: a pattern is justified by the *problem* — a second strategy, a real swap, a test seam. The moment the pattern is applied "because it's a pattern," it's ceremony (Lesson 54's unnecessary abstraction). The senior answer: pattern-first thinking names the problem and lets the pattern fall out; tool-first thinking reaches for a name and forces a problem into it.

## Common mistakes

❌ Reciting pattern names without the Laravel mapping — "Strategy" with no `CACHE_STORE` example is a memorized list.

❌ Forcing patterns where Laravel's default fits — middleware is already decorator; don't re-implement it.

❌ Applying patterns for ceremony — the over-abstraction the checklist warns about.

❌ Confusing Observer (react) with Command (do) — the intent is the difference.

## Quick revision notes

- Patterns are **named solutions** — and Laravel is a catalog of them
- **Factory** (Eloquent) · **Strategy** (drivers) · **Repository** (your seam) · **Adapter** (Flysystem) · **Observer** (events/observers) · **Singleton** (container) · **DI** (container) · **Decorator** (middleware) · **Builder** (query builder) · **Command** (artisan/jobs)
- Answer shape: **problem → where Laravel uses it → where you've used it**
- Introduce a pattern for a **real problem**, never for ceremony

## Check your understanding

1. Name the pattern behind `CACHE_STORE=redis`.
2. Where is the decorator pattern in every Laravel request?
3. Observer vs Command — what's the intent difference?
4. Why is the container both DI *and* Singleton?
5. What's the line between a pattern and over-engineering?
