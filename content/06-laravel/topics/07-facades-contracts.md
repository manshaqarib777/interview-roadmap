# Topic 7 — Facades & Contracts

**Checklist anchor:** facades (what they really are) · facade root · static-looking syntax · testing facades · facade vs DI · contracts (interfaces)

**Owning lesson:** [110 Facades & Contracts](../110-facades-contracts.md)

---

## The one-sentence answer

**A facade is static-looking syntax over a container-resolved instance; a contract is the interface that instance promises to honour.**

## The mental model

`Cache::get('user')` *looks* like a static call. It isn't. Under the hood:

```text
Cache::get('user')
    │
    ▼
Facade class (static method) ──→ resolves the REAL cache instance from the container
                                        │
                                        ▼
                                 $instance->get('user')   ← the actual call
```

The facade is a **proxy**: it holds no state, and every call resolves the *current* root from the container. That single indirection is what makes `Cache::fake()` possible — swap the root, and every call site changes behaviour without editing any of them.

## How it works

### The proxy, in plain JS

```js
function createFacade(getRoot) {
  return new Proxy({}, {
    get(_target, method) {
      return (...args) => getRoot()[method](...args); // resolve the root each call
    },
  });
}

let root = { get: () => 'real cache value' };
const Cache = createFacade(() => root);
Cache.get('user');            // 'real cache value'
root = { get: () => 'FAKE' }; // Cache::fake() in Laravel
Cache.get('user');            // 'FAKE' — same call site, swapped root
```

### Facade vs dependency injection

Same instance, two ergonomics:

```js
const instance = { get: () => 'shared' };
const Cache = createFacade(() => instance);   // facade: static-looking access
const controller = new Controller(instance);  // DI: injected through constructor
// both reach the SAME object
```

| | Facade | DI |
|---|---|---|
| Syntax | `Cache::get(...)` — static-looking | `__construct(private Cache $cache)` |
| Resolution | At call time, from the container | Once, by the container |
| Testability | `Cache::fake()` swaps the root | Inject a mock constructor arg |
| Discovery | Implicit — hidden dependency | Explicit — declared in the signature |
| Best for | Convenience, prototypes, quick access | Clarity, unit tests, explicitness |

### The facade root

Every facade has a `getFacadeAccessor()` that returns the container key — e.g. `Cache` → `cache`. The container resolves the real driver from that key, and the facade forwards the method call.

## Contracts

A contract is the **interface** a service promises. The framework's contracts live in `Illuminate\Contracts`:

```php
Illuminate\Contracts\Cache\Store
Illuminate\Contracts\Queue\Queue
Illuminate\Contracts\Mail\Mailer
Illuminate\Contracts\Filesystem\Filesystem
```

Why they matter:

1. **Replaceability** — swap the implementation (Redis → database cache) without touching callers.
2. **Testability** — inject a fake that satisfies the interface.
3. **Decoupling** — code depends on the *shape*, not the concrete class.

```js
const CacheContract = ['get', 'put', 'forget'];

function assertContract(contract, implementation) {
  return contract.every((method) => typeof implementation[method] === 'function');
}

assertContract(CacheContract, { get() {}, put() {}, forget() {} }); // true
assertContract(CacheContract, { get() {} });                        // false
```

## Interview questions

**Q1. Are Laravel facades actually static?**
> No. The syntax is static, but the implementation isn't. A facade class proxies to a real instance resolved from the container at call time — `Cache::get()` is really `$app['cache']->get()`. That's why swapping the root (like `Cache::fake()`) changes what every call site returns without touching any of them. There's no static state involved.

**Q2. What is a facade root?**
> The underlying instance the facade proxies to. Each facade declares a container key via `getFacadeAccessor()`, and on every call the container resolves the current instance for that key. The root is a normal object — the facade is just syntax over it.

**Q3. Facades vs dependency injection — when would you use each?**
> DI for anything you unit test or want to keep explicit — it declares the dependency in the signature. Facades for convenience, and they're perfectly testable through `Facade::fake()`. The trade is explicitness: a facade hides a dependency that DI would declare. Both reach the same container instance.

**Q4. What are Laravel contracts?**
> The interfaces the framework's services implement — `Cache`, `Queue`, `Mail`, `Filesystem` contracts, etc. They define the *shape* of each service so implementations can be swapped without changing callers, and so tests can inject fakes that satisfy the same shape.

**Q5. How do you test code that uses a facade?**
> `Cache::fake()` — it swaps the facade root for a fake store, then you assert against `Cache::store()`. The same pattern exists for `Queue::fake()`, `Mail::fake()`, `Storage::fake()`, etc. Because the facade resolves its root per call, the swap is immediate and complete.

**Senior follow-up: Why does "facades aren't static" matter in production?**
> Because it explains how a single config change swaps a whole driver: the facade root comes from the container, and the container's binding comes from config. Change `CACHE_DRIVER` in `.env` and every `Cache::` call site changes behaviour — no code edits, because the calls were never really static.

## Common mistakes

❌ Saying "facades are static classes" — they're proxies to container instances.

❌ Using facades inside long-lived contexts where explicitness matters (a facade hides its dependency).

❌ Implementing contracts with loose typing — a contract is a promise; violating it breaks the swap.

❌ Confusing "facade" with "static method" in interviews — the whole point is the indirection.

## Quick revision notes

- **Facade** = static-looking proxy → resolves the root from the container each call
- `Cache::fake()` works **because** the root is swapped, not the code
- **Facade vs DI**: same instance, different ergonomics — DI explicit, facade convenient
- **Contract** = the interface; swap implementations, inject fakes
- `getFacadeAccessor()` → the container key the facade proxies

## Check your understanding

1. What exactly happens when you call `Cache::get('user')`?
2. Why does `Cache::fake()` change behaviour at every call site?
3. Facade vs DI — when do you pick each?
4. What does a contract buy you beyond "an interface"?
5. Why is "facades are static" wrong?
