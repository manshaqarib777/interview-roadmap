# Topic 54 — Repository Pattern

**Checklist anchor:** repository abstraction · interface · implementation · dependency injection · testing · when it becomes unnecessary abstraction

**Owning lesson:** [130 Service Layer, Repositories & SOLID](../130-solid-patterns.md)

---

## The one-sentence answer

**A repository is a data-access abstraction — the service asks an interface for data, and the concrete implementation (Eloquent, a remote API, an in-memory store) is swappable behind the container — and it's only worth it when the swap is real.**

## The mental model

```text
Service (or controller)
   │  depends on the INTERFACE
   ▼
OrderRepository (interface)          ← the contract
   │  bound in the container
   ▼
EloquentOrderRepository (impl)      ← today's implementation
   └─ swap to CachedOrderRepository, ApiOrderRepository, FakeOrderRepository
```

The repository **hides where the data comes from**. The service asks `$orders->findPending()`, and doesn't know or care whether that's Eloquent, a cache, a remote service, or an in-memory fake. That's the dependency-inversion pattern (Lesson 55's D) applied to data.

## How it works

```php
// the interface — the contract:
interface OrderRepository
{
    public function findPending(): Collection;
    public function findForUser(int $userId): Collection;
}

// the implementation — Eloquent today:
class EloquentOrderRepository implements OrderRepository
{
    public function findPending(): Collection
    {
        return Order::where('status', 'pending')->get();
    }
    public function findForUser(int $userId): Collection
    {
        return Order::where('user_id', $userId)->get();
    }
}
```

```php
// bound in a provider — the swap point:
$this->app->bind(OrderRepository::class, EloquentOrderRepository::class);

// consumed via injection — depends on the contract, not the concrete:
class OrderReportService
{
    public function __construct(private OrderRepository $orders) {}
}
```

### The two wins

1. **Swappability** — change the binding (`FakeOrderRepository` in tests, a cached one in prod) and no caller changes.
2. **Testing** — inject a fake that returns fixed data; the service is tested without a database.

## When it's worth it (the senior question)

The checklist asks directly: **"When does Repository Pattern become unnecessary abstraction?"** The honest answer:

| Worth it | Unnecessary |
|---|---|
| The data source is **likely to change** (Eloquent → API/cache/another DB) | The model stays Eloquent forever |
| A **test seam** matters more than simplicity | The DB is fast to fake with `RefreshDatabase` (Lesson 41) |
| The query vocabulary is rich and reused (`findPending`, `findForUser`) | It's a passthrough: `find()` → `Model::find()` |
| Team/architecture already uses it | One extra layer for every model, for ceremony |

**The rule of three:** when you have 1 implementation, an interface is a guess; 2 implementations, it's a seam; 3, it's a pattern. Laravel's own stance is "most apps don't need repositories" — Eloquent *is* the data-access layer, with factories and `RefreshDatabase` covering the test needs.

## Repository vs service (from Topic 53)

| | Service | Repository |
|---|---|---|
| Job | **Business logic** (orchestration, rules) | **Data access** (the queries) |
| Depends on | Services + repositories | The DB/ORM (behind the interface) |
| Tested with | Fakes of its dependencies | A fake repository, or the DB |

A service can exist without a repository — and a repository without a service is a query library. The checklist's ladder (Controller → Service → Repository/Query → Model) treats the repository as an *option* at the data-access rung.

## Interview questions

**Q1. What is the repository pattern?**
> A data-access abstraction: an interface (`OrderRepository`) with a concrete implementation (`EloquentOrderRepository`), bound in the container. Callers depend on the interface, so swapping the implementation — Eloquent for a cache, a remote API, a fake in tests — touches the binding only.

**Q2. What does it buy you?**
> Two things: swappability (change the data source without changing callers) and testing (inject a fake repository instead of the DB). Both follow from the same idea — callers depend on the contract, the container supplies the implementation.

**Q3. When does it become unnecessary abstraction?**
> When there's only one implementation and no likely swap. If Eloquent is the data source and will stay the data source, an interface around `Model::find()` adds a layer with no payoff — and Laravel's factories + `RefreshDatabase` already solve the testing need. The senior rule: repositories for real seams, Eloquent for everything else.

**Q4. How do you test with a repository?**
> Two ways: bind a fake (`FakeOrderRepository` returning fixed collections) to test the service in isolation, or test the Eloquent implementation itself against the real DB with `RefreshDatabase` (Lesson 41). The interface makes the first trivial; the implementation keeps the second honest.

**Q5. Interface + implementation + DI — how do they fit?**
> The interface is the contract, the implementation is the concrete class, and the container binds the two — `$this->app->bind(OrderRepository::class, EloquentOrderRepository::class)`. Constructor injection hands the implementation to callers without them ever naming it. That's dependency inversion (Lesson 55) as a working pattern.

**Senior follow-up: When would you actually introduce a repository in a Laravel app?**
> When there's a real second implementation or a real test pain — a cached repository for hot reads, an API-backed source for part of the data, or a fake that makes a gnarly flow testable without a DB. I'd introduce it at that moment, not pre-emptively: the pattern pays for itself when the swap exists, not when it might.

## Common mistakes

❌ A repository per model as boilerplate — the over-abstraction the checklist warns about.

❌ Interfaces with one implementation "for the future" — the future is where the YAGNI cost lives.

❌ Repositories that leak Eloquent — returning query builders defeats the abstraction.

❌ Repos doing business logic — repositories query; services decide (Lesson 53).

## Quick revision notes

- Repository = **data-access interface + swappable implementation**
- Callers depend on the **contract**; the container binds the impl
- Wins: **swappability + test seams**
- Worth it: real second impl / real test pain · Unnecessary: Eloquent forever + no seam
- Eloquent *is* the data layer — repositories are the exception, not the default
- Repos **query**; services **decide**

## Check your understanding

1. What exactly does the repository abstract away?
2. What are the two concrete wins?
3. When does the pattern become ceremony?
4. How do you test a service that uses a repository?
5. What's the honest trigger for introducing one?
