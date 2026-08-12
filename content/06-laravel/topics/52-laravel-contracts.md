# Topic 52 — Laravel Contracts

**Checklist anchor:** cache contracts · queue contracts · mail contracts · filesystem contracts · why contracts make implementations replaceable/testable

**Owning lesson:** [110 Facades & Contracts](../110-facades-contracts.md)

---

## The one-sentence answer

**A contract is the interface a Laravel service promises — code that depends on the contract, not the concrete class, stays swappable and testable.**

## The mental model

A contract is the **promise** between a caller and an implementation:

```text
Caller type-hints the CONTRACT
        │
        ▼
Illuminate\Contracts\Cache\Store   ← "I need something with get/put/forget"
        │
        ▼
Implementation (RedisStore | DatabaseStore | ArrayStore | FakeStore)
```

The caller never mentions Redis or the database. It says *"give me a cache"* and the container supplies one. Swap the driver in config, inject a fake in tests — **no caller changes**, because no caller ever saw the concrete class.

## How it works

The framework contracts live in `Illuminate\Contracts`:

```php
use Illuminate\Contracts\Cache\Store;        // cache drivers
use Illuminate\Contracts\Queue\Queue;        // queue connections
use Illuminate\Contracts\Mail\Mailer;        // mail transports
use Illuminate\Contracts\Filesystem\Filesystem; // storage disks
use Illuminate\Contracts\Events\Dispatcher;  // events
use Illuminate\Contracts\Hashing\Hasher;     // password hashing
```

Type-hint the contract and the container resolves the configured implementation:

```php
use Illuminate\Contracts\Filesystem\Filesystem;

class ExportService
{
    public function __construct(private Filesystem $files) {}
    // $files is S3 in prod, local in dev, a fake in tests
}
```

## Why contracts exist (the three wins)

1. **Replaceability** — change `FILESYSTEM_DISK` in `.env` and every `Filesystem` injection follows. The caller is blind to the driver.
2. **Testability** — inject a fake that satisfies the contract. The test doesn't need Redis, mail, or S3 — it needs an object with the right methods.
3. **Decoupling** — a class depends on a *shape*, not a vendor class. That's dependency inversion (Lesson 130's SOLID) in practice.

The plain-JS shape (what the exercise models):

```js
const CacheContract = ['get', 'put', 'forget'];

function assertContract(contract, implementation) {
  return contract.every((method) => typeof implementation[method] === 'function');
}

assertContract(CacheContract, { get() {}, put() {}, forget() {} }); // true — real
assertContract(CacheContract, { get: () => 'FAKE', put() {}, forget() {} }); // true — fake
assertContract(CacheContract, { get() {} }); // false — missing methods
```

## Contracts vs facades

| | Contracts | Facades |
|---|---|---|
| What it is | An interface | Static-looking syntax over the container |
| How you use it | Type-hint in a constructor | `Cache::get(...)` |
| The promise | "Any implementation with this shape" | "The current container instance" |
| Test seam | Inject a fake | `Cache::fake()` |
| Relationship | The contract is the *shape*; the facade is one *way in* | |

They're two sides of the same idea: **code that depends on abstractions**. Facades are a syntax; contracts are the type.

## Interview questions

**Q1. What are Laravel contracts, and why do they exist?**
> Contracts are the interfaces the framework's services implement — cache, queue, mail, filesystem, events, hashing. They exist so callers depend on a shape rather than a concrete class. That makes implementations swappable (change the driver, no caller changes) and testable (inject a fake that satisfies the interface).

**Q2. How do contracts make implementations replaceable?**
> Because the caller type-hints `Illuminate\Contracts\Cache\Store`, not `RedisStore`. The container maps the contract to the configured implementation, so changing the config changes the implementation for every caller at once — and tests can bind the contract to a fake instead.

**Q3. Give a concrete example.**
> `Mailer` contract: a controller type-hints `Illuminate\Contracts\Mail\Mailer`. In production the container gives it the SMTP driver; in tests you `Mail::fake()` or bind a fake to the contract. The controller never imports a vendor mail class, so it never needs to change when the driver does.

**Q4. Contracts vs facades?**
> A contract is the interface a service promises; a facade is static-looking syntax that proxies to the container's instance. They complement each other: the facade is a convenient way in, the contract is the testable seam. Both exist so code depends on abstractions, not concrete classes.

**Senior follow-up: Would you write your own contracts?**
> When you have a seam worth protecting — a payment gateway, a notification provider, an AI client. Type-hint your own interface (`PaymentGatewayContract`), bind the Stripe implementation in a provider, inject fakes in tests. The framework's pattern scales to your code: contracts at the boundary, implementations behind the container.

## Common mistakes

❌ Type-hinting concrete classes (`RedisStore`) instead of the contract — kills replaceability.

❌ Forgetting contracts are interfaces, not facades — the facade is one way in; the contract is the type.

❌ Writing your own contract for a single implementation that never swaps — that's speculative abstraction (Lesson 130's "when the repository is over-abstraction").

❌ Breaking the contract's shape in an implementation — a fake that's missing a method fails at the seam, not at the swap.

## Quick revision notes

- **Contract = interface**: cache, queue, mail, filesystem, events, hashing
- Type-hint the **contract**, container resolves the **implementation**
- Wins: **replaceable, testable, decoupled**
- Facade is **syntax**; contract is **the type** — two sides of depending on abstractions
- Write your own contracts at **real boundaries** (payments, AI, notifications)

## Check your understanding

1. What exactly does a contract promise?
2. How does changing a driver in `.env` update every caller?
3. How do contracts make tests faster?
4. When would you write your own contract, and when is it over-abstraction?
