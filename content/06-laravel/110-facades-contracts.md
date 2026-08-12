# Lesson 110 — Facades & Contracts

**Interview importance:** ⭐⭐⭐ — "are facades static?" is a senior question in disguise.

`Cache::get('user')` looks like a static call on a class. It isn't. A facade is a static-looking
**proxy** to an instance that lives in the container — `Cache::get('user')` is really
`app('cache')->get('user')`. The facade class resolves the instance for you and forwards every
call to it. A contract is the other half of the same idea: the interface that instance
implements, so you can swap the implementation without touching the caller.

Both are container lookups wearing different clothes. Knowing the clothes tells you when a
facade is fine, what "bound to the container" actually means, and why `Cache::fake()` works in
tests.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain what a facade actually is: a static proxy to a container instance
- Trace `Cache::get()` to `app('cache')->get()` and name the facade root
- Argue when a facade is acceptable and when constructor DI is the better call
- Test code that uses facades with `Cache::fake()`
- Say what a contract is and why interfaces make implementations replaceable
- Compare facades vs DI vs contracts and pick one per situation

## 1. What is a Facade?

**A facade is a class that provides a static interface to a service resolved from the container.**

```php
Cache::get('user');              // what you write
// is sugar for:
app('cache')->get('user');       // what actually happens
```

`Cache` is a class whose static methods forward to a real instance — the **facade root** —
pulled from the container. The static call is the syntax; the instance does the work. There is
no static state anywhere: the instance is a normal object, and each call re-resolves it (or
reuses it, if it's a singleton).

Every facade has a `getFacadeAccessor()` that says which container binding it proxies. That one
method is the whole trick.

## 2. Mental Model

A facade is a **remote control** — the buttons are static, the TV is the instance.

| Facade piece | Remote control piece |
|---|---|
| `Cache::get('user')` | Pressing the power button |
| `Cache` class | The remote |
| The static method | The button (static, in your hand) |
| The resolved instance (facade root) | The TV (in the container, in the other room) |
| `app('cache')` | The wiring that connects button to TV |
| The contract it implements | The button's guarantee: it controls *a* TV |

Pressing the button doesn't contain a TV — it's *wired* to one. Same for facades: the static
call is wired to a container instance, and the wiring is what lets tests swap the instance.

## 3. Visual Flow

```text
  Cache::get('user')                    (a static-looking call)
        │
        ▼
  Facade::__callStatic('get', ['user'])
        │
        ▼
  resolve from container:  app('cache')        ← the facade root
        │
        ▼
  $cache->get('user')                       (instance method runs)
        │
        ▼
  returns the cached value
```

The static call is a **dispatcher**: `__callStatic` catches any method, resolves the root from
the container, and forwards. No static state, no static data — just static syntax.

## 4. How It Works: The Facade Root

Every facade extends a base class that implements `__callStatic`. Two pieces make it work:

```php
// 1. The facade class says what to resolve
class Cache extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'cache';            // resolves app('cache')
    }
}

// 2. The base Facade forwards any static call to that instance
//    (simplified — this is what __callStatic does)
$instance = static::resolveFacadeInstance(static::getFacadeAccessor());
return $instance->{$method}(...$args);
```

```text
Cache::get('user')
  → getFacadeAccessor()  →  'cache'
  → resolveFacadeInstance('cache')  →  the CacheRepository instance
  → $instance->get('user')  →  'value'
```

The **facade root** is that resolved instance. For most core facades it's a singleton binding
(one repository instance per app), so every `Cache::...` call in a request hits the same
object — which is exactly what `Cache::fake()` replaces in tests.

> [!DEEPDIVE]
> `Cache::get()` is a *method call on an instance* wearing static clothes. You can prove it:
> `Cache::get('user') === app('cache')->get('user')` for the same binding. And you can grab
> the instance itself with `Cache::getFacadeRoot()` — the facade is a view onto the container,
> nothing more.

### A facade in plain JS

The same pattern — static-looking access resolving to an instance — in ~20 lines:

```js
// The "container" holding one instance
const container = {
  cache: {
    store: new Map(),
    get(k) { return this.store.get(k); },
    set(k, v) { this.store.set(k, v); },
  },
};

// The "facade": static-looking methods that resolve from the container
const Cache = new Proxy({}, {
  get(target, method) {
    return (...args) => {
      const instance = container.cache;          // ← the facade root
      return instance[method](...args);          // ← forward the call
    };
  },
});

// The "test fake": swap the root, caller never changes
function fakeCache() {
  const fake = { get: () => 'FAKE', set: (k, v) => {} };
  container.cache = fake;                         // ← Cache::fake() in Laravel
}

Cache.set('user', 'ada');                          // set() returns undefined — nothing prints
console.log(Cache.get('user'));                    // → 'ada' from the real instance
fakeCache();
console.log(Cache.get('user'));                    // → 'FAKE' from the fake
```

Output:

```text
ada
FAKE
```

```narrate
2-8: The "container" holds one cache instance — Laravel's app('cache') equivalent.
10-16: The Proxy is the facade: any method name resolves to a call on the root instance.
19-21: Swapping container.cache is exactly what Cache::fake() does in tests.
23-26: The caller never changes — same syntax, different root. That's the whole point.
```

## 5. Real Project Usage

| Where | How |
|---|---|
| **Quick access in controllers** | `Cache::remember('products', 3600, fn () => Product::all())` |
| **Logging anywhere** | `Log::info('charge failed', ['id' => $id])` |
| **Config reads** | `config('services.stripe.key')` (a helper, same idea) |
| **Auth / sessions** | `Auth::user()`, `Session::put(...)` |
| **Bus & queues** | `Bus::dispatch(new SendEmailJob(...))` |
| **Testing** | `Cache::fake()`, `Queue::fake()`, `Event::fake()` — swap the root, assert on the fake |

The pattern that matters: **facades are fine for framework services you call occasionally** —
logging, caching, config. The trouble starts when business objects reach for facades constantly
instead of receiving their dependencies.

## 6. Interview Explanation

> A facade is a static interface to a service resolved from the container. `Cache::get('user')`
> forwards to `app('cache')->get('user')` — the facade class's `__callStatic` resolves the
> real instance and calls the method on it. There's no static state; it's static *syntax* over
> a container lookup.
>
> Because every call goes through the container, tests can swap the root: `Cache::fake()`
> replaces the real repository with a fake, and code under test doesn't change. Facades are
> convenient for framework services, but for code that has real dependencies, constructor
> injection is clearer — the dependency shows up in the signature instead of hiding in a
> static call.

## 7. Senior-Level Insights

- **"Facades are not static" is the whole answer.** The class `Cache` has no static state and
  no static data — `__callStatic` resolves an instance per call. Candidates who call facades
  "static classes" miss that the container is doing the work.
- **Facades and DI are the same lookup with different ergonomics.** `Cache::get()` and
  `$this->cache->get()` both resolve from the container; the facade just hides it behind static
  syntax. So the real interview question is *where the dependency should be visible*, not
  whether the container is involved.
- **The facade is a test seam too.** `Cache::fake()` works precisely *because* the facade
  resolves from the container: the test swaps the root binding, and every static call lands on
  the fake. That's not a special testing feature — it's the container + facade root working
  together.
- **Contracts make fakes honest.** Testing against the `Cache` *contract* (the interface) means
  your fake must implement the same surface as the real class. A fake that "works" but has a
  different signature is a fake that lies; contracts prevent that.
- **Facades in services are a code smell when overused.** One `Cache::` call in a controller is
  fine. A service whose every line reaches for a facade is hard to test in isolation and hides
  its dependencies. The senior move is constructor injection for the service's real
  dependencies, facades for the occasional framework call.

## 8. Common Mistakes

- **Believing facades are static classes.** They're proxies. Static *syntax*, instance
  *behavior*. There is no shared static state.
- **Type-hinting the facade class instead of the contract.** `Cache $cache` as a type-hint is
  wrong — the facade isn't the implementation. Type-hint the contract:
  `Illuminate\Contracts\Cache\Repository`.
- **Mocking facades wrong in tests.** `Cache::shouldReceive()` is for mocking; `Cache::fake()`
  is for faking. They're different tools. Use `fake()` when you want the fake's behavior,
  `shouldReceive()` when you want to assert calls.
- **Forgetting `Cache::fake()` only affects the facade.** If you resolve the same service
  through the container elsewhere, the fake won't apply to it. Fake at the seam you're testing.
- **Treating contracts as optional decoration.** An interface is how Laravel lets you swap the
  cache driver, mailer, or queue without touching callers. Ignoring contracts means your
  dependencies are concrete — and un-swappable.

## 9. Best Practices

✅ Reach for a facade for one-off framework services (logging, config, cache in a controller)

✅ Inject the contract via constructor when a class genuinely depends on the service

✅ `Cache::fake()` in tests instead of hitting the real store

✅ Type-hint contracts, not facade classes

✅ Bind your own services to interfaces — same swapability Laravel gives you

❌ Don't pepper services with facades when constructor injection would show the dependency

❌ Don't type-hint a facade class; type-hint the contract it proxies

## 10. Interview Questions

**Q1. Are facades static?**

> No. A facade is a static *interface* to a container instance. `Cache::get('user')` is really
> `app('cache')->get('user')` — the facade's `__callStatic` resolves the real object and
> forwards the call. There's no static state, so swapping the instance (like `Cache::fake()`)
> changes what every static call does.

**Q2. What is the facade root?**

> The instance the facade proxies — for `Cache`, it's the cache repository resolved from the
> container. `getFacadeAccessor()` names the container binding, and `getFacadeRoot()` returns
> the resolved instance. The facade is just a view onto that root.

**Q3. When is using a facade okay? When should you use DI?**

> A facade is fine for occasional framework calls — logging, caching, config — where the static
> convenience is worth hiding the lookup. For a class that *depends* on a service (a service
> that must use the cache, a repository that must send mail), constructor injection of the
> contract is better: the dependency is visible in the signature, easy to fake, and doesn't
> hide behind a static call.

**Q4. How do you test code that uses facades?**

> Two ways. `Cache::fake()` swaps the root for a working fake, so the code runs against a fake
> store — best when I want the code to execute normally. `Cache::shouldReceive(...)` installs a
> mock for assertion — best when I want to verify calls. Both work because the facade resolves
> through the container, which the test controls.

**Q5. What is a contract in Laravel?**

> A contract is the interface that a framework service implements — for example
> `Illuminate\Contracts\Cache\Repository`, `Queue`, `Mail`, `Filesystem`. Type-hinting the
> contract means the caller depends on the behavior, not the implementation, so Laravel can
> swap drivers (file → Redis, mail → mailtrap) without changing the caller. It's the same
> swapability I get from binding my own interfaces.

**Senior follow-up: A coworker put `Cache::remember()` inside a service class. How do you
review it?**

> I'd ask whether the cache is the service's job or a dependency it needs. If the service's
> responsibility includes caching, I'd inject the `Cache` contract so the dependency is visible
> and testable — `Cache::fake()` would then reach the real code path. If caching is incidental,
> I'd move the `Cache::remember` up to the caller and keep the service focused. Either way, the
> question is about where the dependency is visible, not about the syntax.

## 11. Follow-up Questions

**How is a facade different from a helper function?**

> Both are convenience syntax, but a facade proxies a specific container instance and can be
> swapped per test; helpers like `config()` or `cache()` are function sugar over the same
> container lookups. The testability difference is what matters: `Cache::fake()` works because
> the facade resolves through the container.

**Can I write my own facade?**

> Yes — create a class extending `Facade`, implement `getFacadeAccessor()` to return the
> container binding, and register the alias (usually via `$aliases` in config). After that,
> `MyFacade::method()` forwards to the resolved instance.

**What's the difference between a facade and a contract?**

> They're complementary, not competing. A facade is *access syntax* (static-looking calls to a
> container instance). A contract is the *interface* that instance implements. `Cache` (the
> facade) proxies `Illuminate\Contracts\Cache\Repository` (the contract). Facades answer "how do
> I call it?", contracts answer "what does it promise?"

**Why does `Cache::fake()` work even though facades are "static"?**

> Because the static call resolves through the container at call time. `fake()` swaps the
> container binding, and the next `__callStatic` picks up the fake. If facades were truly
> static classes with static state, there'd be nothing to swap.

## 12. Comparison Table

| | **Facade** | **DI (constructor injection)** | **Contract (interface)** |
|---|---|---|---|
| What it is | Static syntax over a container lookup | Container injects a dependency at build time | The interface the dependency implements |
| Call site | `Cache::get('user')` | `$this->cache->get('user')` | Type-hint: `Repository $cache` |
| Dependency visible? | ❌ hidden in a static call | ✅ in the signature | ✅ in the signature |
| Swap in tests | `Cache::fake()` swaps the root | Bind a fake to the interface | Bind a fake to the interface |
| Best for | Occasional framework services | Classes that truly depend on a service | Any swappable service (cache, mail, queue) |
| Pitfall | Overuse hides dependencies | Verbose when over-applied | Extra layer when there's one implementation |

Facades and DI are **two ways to reach the same container instance**; contracts are **what the
instance promises**, and they're what makes either one swappable.

## 13. Code Example

The three pieces together — facade syntax, contract type-hint, and a swap:

```php
// 1. Facade syntax — a static-looking call to a container instance
public function index()
{
    $products = Cache::remember('products', 3600, fn () => Product::all());
    return view('products', ['products' => $products]);
}
```

```text
Cache::remember('products', 3600, …)
  → app('cache')->remember('products', 3600, …)
  → miss → query products → store in cache → return
  → hit  → return cached value, no query
```

```php
// 2. Contract type-hint — the same service, injected and visible
use Illuminate\Contracts\Cache\Repository as Cache;

class ProductService
{
    public function __construct(
        protected Cache $cache,            // ← the contract, not the facade
    ) {}

    public function featured(): array
    {
        return $this->cache->remember('featured', 3600, fn () => Product::query()->take(4)->get());
    }
}
```

```text
resolve(ProductService::class)  →  container injects the cache repository
$service->cache  →  the SAME instance Cache::… resolves to
swap driver (file → redis)  →  one config line, both call sites unaffected
```

```php
// 3. Testing with a fake — swap the root, the caller never changes
Cache::fake();

$response = $this->get('/products');

Cache::assertHas('products');      // ✅ the controller hit the fake, not Redis
```

```text
before:  Cache::remember hits Redis
after:   Cache::fake() → same call hits the fake store → assertHas passes
         real Redis never touched, test is fast and isolated
```

```narrate
Block 1, 2-6: A facade call — static syntax, container-resolved instance behind it.
Block 2, 1-13: The same service via DI: the contract appears in the signature, so the dependency is visible.
Block 3, 1-6: The swap is a test-time one-liner because the facade resolves through the container.
```

## 14. Performance Notes

- **Facade resolution is one container lookup per call.** The facade root is cached per
  resolution, so `Cache::get()` costs a hash lookup plus a method call — negligible. The
  static syntax isn't a performance argument for or against.
- **Facade vs injected contract is a readability decision, not a perf one.** Both end at the
  same instance. Measure real bottlenecks; this is never one.
- **`Cache::fake()` costs nothing in production** — it's a test-only swap. But beware fakes in
  *hot* test loops hiding real behavior: a fake that never touches the code path under test
  gives you false confidence, not speed.
- **Contracts have no runtime cost** — an interface is erased at compile time. Type-hinting
  `Repository` instead of the concrete class costs zero and buys swapability.

## 15. Debugging Scenarios

**Scenario 1: "`Cache::get()` returns null even though I just `put()` a value."**

You're probably using a different driver or a different key namespace — or the value was stored
in a request that used a different cache store. Check the facade root: `app('cache')->store()`
and confirm the store matches what `Cache::put()` used. If it's a queue worker vs web request,
a per-request cache (array driver) explains it — the "cache" never survives the request.

**Scenario 2: "`Cache::fake()` didn't fake anything."**

The code under test resolves the cache through the container directly, not through the facade —
or the facade class name doesn't match the one the code uses. Fake at the seam you're testing:
if the code type-hints `Repository`, bind the fake to `Repository` in the test, not `Cache::fake()`.

**Scenario 3: "I type-hinted `Cache` and got an error."**

`Cache` is a facade, not an implementation — you can't inject it. Type-hint the contract
(`Illuminate\Contracts\Cache\Repository`) instead, and the container injects the real
repository. Same for `Queue`, `Mail`, and `Filesystem`.

**Scenario 4: "My package binds `PaymentGateway` but a test rebinding it does nothing."**

The caller resolved the binding before the test swapped it — a facade that caches its root, or
an already-resolved singleton. Swap the binding before any code resolves it (in the test's
setup), and if the facade cached the root, clear it (`Facade::clearResolvedInstance(...)`)
between tests.

## 16. Quick Revision Notes

- Facade = static syntax over a container instance; `Cache::get()` ≈ `app('cache')->get()`
- No static state — `__callStatic` resolves the root per call
- Facade root = the resolved instance; `getFacadeAccessor()` names the binding
- Facades & DI are the same container lookup, different ergonomics
- Facades fine for occasional framework calls; inject contracts for real dependencies
- `Cache::fake()` swaps the root → tests hit a fake, caller unchanged
- Contract = interface the service implements (`Cache`, `Queue`, `Mail`, `Filesystem` contracts)
- Type-hint contracts, never facade classes

## 17. Cheat Sheet

```text
Cache::get('user')   ==   app('cache')->get('user')     (facade ≈ container lookup)

FACADE   = static syntax + container instance             → "how do I call it?"
CONTRACT = interface the instance implements              → "what does it promise?"

FAKE:    Cache::fake()  →  root swapped, caller unchanged
INJECT:  __construct(Repository $cache)  →  visible dependency
FACADE OK:  occasional framework calls
INJECT:     real dependencies in services

Type-hint the CONTRACT, never the FACADE.
```

## 18. Key Takeaways

> [!RECAP]
> - A facade is a static *proxy* to a container instance — `Cache::get()` is `app('cache')->get()`
> - Facades are not static classes: `__callStatic` resolves the root, there's no static state
> - The facade root is the instance; `getFacadeAccessor()` names the container binding
> - Facades and DI are the same container lookup with different ergonomics
> - Facades suit occasional framework calls; inject the contract for real dependencies
> - `Cache::fake()` works because the facade resolves through the container — the seam is the binding
> - Contracts are interfaces (`Cache`, `Queue`, `Mail`, `Filesystem`) that make implementations replaceable and testable
> - Type-hint contracts, never facades — the signature should say what, not how

## Check your understanding

Answer these without looking back.

1. Rewrite `Queue::push($job)` as the container call it stands for.
2. What is the facade root, and how does the facade find it?
3. Why is "facades are static" a wrong answer, and what would you say instead?
4. Give one situation where a facade is fine, and one where constructor DI is the better call.
5. How does `Cache::fake()` manage to change what `Cache::get()` returns?
6. What is a contract, and why does type-hinting `Repository` instead of the facade help you swap drivers?
7. A test's `Cache::fake()` seems to do nothing. What's the likely cause?

## What's Next

**Lesson 111 — Routing.** The map from URL to controller: route registration, parameter
binding, named routes, and the middleware pipeline it all runs through.
