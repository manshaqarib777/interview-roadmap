# Topic 55 — SOLID

**Checklist anchor:** S · O · L · I · D — each with a Laravel example

**Owning lesson:** [130 Service Layer, Repositories & SOLID](../130-solid-patterns.md)

---

## The one-sentence answer

**SOLID is five design principles that keep Laravel code easy to change — and each one maps to a concrete Laravel practice you already use.**

## The mental model

SOLID is about **managing change**: code that survives a new requirement without a rewrite. Each letter is a rule, and each rule has a Laravel-native form:

```text
S  one reason to change
O  extend without editing
L  substitutable implementations
I  small, focused interfaces
D  depend on abstractions
```

## S — Single Responsibility

> A class should have one reason to change.

The fat-controller problem (Lesson 53):

```php
// ❌ three reasons to change: validation, payment, email
class OrderController {
    public function store(Request $request) {
        // validate + charge + send email + create...
    }
}
```

```php
// ✅ one job each
OrderController  →  validate (form request), call the service, respond
OrderService     →  "place an order" (Lesson 53)
OrderPolicy      →  "can this user?" (Lesson 18)
```

**The Laravel form:** thin controllers, form requests for validation, services for logic. A class's "one reason" is stated by its name — `OrderService::place()` has one job, so one reason to change.

## O — Open/Closed

> Open for extension, closed for modification.

Add new behaviour **without editing existing code**. Laravel's shape:

```php
// the payment gateway interface (Lesson 7/52):
interface PaymentGateway {
    public function charge(int $amountCents): void;
}

// add a NEW provider by adding a NEW class — StripeGateway, PayPalGateway
// …no existing code changes; the container binding swaps (Lesson 5):
$this->app->bind(PaymentGateway::class, StripeGateway::class);
```

**The Laravel form:** interfaces + container bindings, service providers (Lesson 6), event listeners (Lesson 28 — add a listener, edit nothing), strategies behind an interface. You extend by adding, not editing.

## L — Liskov Substitution

> A subclass must be usable wherever its base is expected.

Any `PaymentGateway` implementation must behave like a `PaymentGateway`:

```php
class StripeGateway implements PaymentGateway {
    public function charge(int $amountCents): void { /* works */ }
}
class FakeGateway implements PaymentGateway {
    public function charge(int $amountCents): void { /* works, records only */ }
}
// swap them — callers can't tell the difference
```

**The Laravel form:** every implementation honours its contract — same methods, same semantics, same failure behaviour. A fake that *silently* succeeds where the real one throws breaks L (and your tests). The rule: implement the contract's behaviour, not just its signature.

## I — Interface Segregation

> No client should depend on methods it doesn't use.

```php
// ❌ one fat interface — every impl must fake the unused methods
interface UserRepository {
    public function find(int $id): User;
    public function findByName(string $name): User;
    public function exportCsv(): string;      // only exports need this
}

// ✅ segregated — each client depends on the small interface it uses
interface UserLookup { public function find(int $id): User; }
interface UserExporter { public function exportCsv(): string; }
```

**The Laravel form:** contracts (Lesson 52) sized to the consumer — a mailer contract for mailers, a cache contract for caches. If a client only reads, it shouldn't depend on a write-anything interface.

## D — Dependency Inversion

> Depend on abstractions, not concretions — and the abstraction is owned by the caller.

```php
// ❌ depends on the concrete class — swap = edit
class OrderService {
    public function __construct(private StripeGateway $payments) {}
}

// ✅ depends on the abstraction, supplied by the container
class OrderService {
    public function __construct(private PaymentGateway $payments) {}
}
// bind: PaymentGateway → StripeGateway (or PayPalGateway, or FakeGateway)
```

**The Laravel form:** the entire container story (Lesson 5) — constructor injection, interface→implementation bindings, contracts. The service names the *contract*; the container supplies the *implementation*.

## The whole set in one Laravel app

```php
interface PaymentGateway { public function charge(int $amountCents): void; }  // I + D

class StripeGateway implements PaymentGateway { public function charge(...) {...} } // L + O

class OrderService {                                                            // S
    public function __construct(private PaymentGateway $payments) {}            // D
    public function place(Order $order): void {
        $this->payments->charge($order->total_cents);
    }
}
// provider: bind(PaymentGateway::class, StripeGateway::class)                   // O
```

## Interview questions

**Q1. What is SOLID, in one pass?**
> Five principles for maintainable code: Single Responsibility (one reason to change per class), Open/Closed (extend by adding, not editing), Liskov Substitution (implementations honour their contract), Interface Segregation (small, focused interfaces), Dependency Inversion (depend on abstractions, supplied by the container).

**Q2. Give a Laravel example of OCP.**
> The payment gateway interface. Adding a new provider is a new class implementing `PaymentGateway` plus a container binding change — `StripeGateway`, `PayPalGateway`, `FakeGateway` — no existing caller is edited. Events are the same: add a listener to react to `OrderCreated` without touching the order code (Lesson 28).

**Q3. How does the container embody Dependency Inversion?**
> Callers type-hint the abstraction — `PaymentGateway` — and the container resolves the concrete implementation from a binding. The service never names `StripeGateway`, so the implementation is swappable without editing the service. That's "depend on abstractions" built into the framework.

**Q4. What does Liskov mean in practice?**
> Any implementation of a contract must behave like the contract promises. `StripeGateway` and `FakeGateway` are interchangeable in callers because both `charge()` the same way — same method, same semantics, same failure contract. A fake that returns success where the real gateway throws breaks the substitution.

**Q5. When does SOLID stop being useful?**
> Applied dogmatically to a small app, it becomes ceremony — an interface per class, abstractions for single implementations (Lesson 54's over-abstraction). SOLID is a *change-management* toolkit: the principles pay off at the boundaries that actually change — payments, mail, data access. Apply them where change is real, not everywhere.

**Senior follow-up: How does SOLID show up in an interview about a slow, fat controller?**
> The diagnosis is SOLID-shaped: the controller violates S (validation, payment, email — three reasons to change), and the payment call violates D (hard-coded `new StripeGateway()`). The fix is the same layered refactor: extract a service (S), type-hint an interface (D), add providers via bindings (O). Naming the principles while proposing the fix is the senior tell.

## Common mistakes

❌ Interfaces everywhere with one implementation — ceremony (YAGNI), not SOLID.

❌ A "Liskov-compliant" fake that lies about behaviour — breaks substitution.

❌ Fat interfaces that every impl must fake — violate I.

❌ SOLID applied to glue — a controller calling a service isn't a violation; it's the point.

## Quick revision notes

- **S** — one reason to change: thin controllers, services (Lesson 53)
- **O** — extend by adding: interfaces + bindings, listeners, providers
- **L** — implementations honour the contract: fakes must behave
- **I** — small interfaces: contracts sized to consumers (Lesson 52)
- **D** — depend on abstractions: type-hint the interface, container supplies it (Lesson 5)
- Apply **where change is real** — dogmatism becomes ceremony

## Check your understanding

1. State each principle in one sentence with a Laravel example.
2. How does adding a payment provider respect OCP?
3. What breaks when a fake doesn't behave like the real thing (L)?
4. Why is the container the embodiment of D?
5. When is skipping SOLID the right call?
