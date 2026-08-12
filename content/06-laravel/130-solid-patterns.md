# Lesson 130 — Service Layer, Repositories & SOLID

**Interview importance:** ⭐⭐⭐⭐ — the senior round. Not "how do you write a controller"
but "prove you've felt the pain this architecture exists to solve."

The default Laravel shape is fat controllers talking to Eloquent directly, and it's fine —
right up until the same business rule shows up in a third controller. This lesson is about
the *layering* question: when a service layer earns its place, when a repository is
over-abstraction, and the SOLID examples you can recite with your own code. Most interviewers
don't want to see a textbook answer here — they want the judgment to say "I'd add a service
layer here, and here's why I would *not* add a repository."

## Learning Objectives

By the end of this lesson you should be able to:

- Draw the Controller → Service → Repository/Query → Model chain and say which links are optional
- State the two triggers that justify extracting a service layer
- Say when a repository is genuine architecture and when it's ceremony around Eloquent
- Give one concrete Laravel example for each of the five SOLID letters
- Walk a before/after refactor: fat controller → service → repository, explaining each step

## 1. What Is This Lesson Really About?

**Layering is a decision, not a default. The honest answer is: start simple (controller → Eloquent), and extract a service layer when logic repeats or a controller gets fat — a repository only when you actually need to swap or fake the data source.**

Three layers sit between the HTTP request and the database row:

```text
  HTTP request
       │
       ▼
  Controller      — parse the request, call something, return a response
       │
       ▼
  Service         — business logic: rules, transactions, coordination  (optional)
       │
       ▼
  Repository      — "give me the orders for this user"                 (optional)
       │
       ▼
  Eloquent Model  — the query; an abstraction over the DB already
       │
       ▼
  MySQL / Postgres
```

The two optional boxes are the whole conversation. When either earns its place you add it;
when it doesn't, the diagram above with them missing is *correct*.

> [!TIP]
> Laravel's HTTP layer already isolates routing from controllers (L111), and Eloquent already
> isolates your code from raw SQL (L115). You are deciding whether *one more* seam is worth its
> cost — not whether separation is good. It is. The question is where.

## 2. Mental Model

Think of each layer as a **contract with a direction of dependency**. Rules flow inward,
responses flow outward, and a layer may only call the layer beneath it:

```text
  Controller ──depends on──▶ Service ──depends on──▶ Repository ──depends on──▶ Model
       ▲                        ▲                       ▲
       └───── passes primitives & DTOs, never Eloquent models upward ─────┘
```

The rule that keeps the picture from turning into spaghetti: **the controller knows about
HTTP, the service knows about business rules, the repository knows about data retrieval.**
If you can point at a method and name two of those jobs, you've found the layer that needs
extracting.

## 3. Visual Flow — the Fat Controller, the Service, and the Repository

```text
  1. Request hits  POST /orders
  2. Controller      → validate input (FormRequest)                [HTTP job]
  3. Service         → createOrder(): DB::transaction, stock check,
                       charge, notify                              [business job]
  4. Repository      → orderItemsFor(): query with eager loading   [data job]
  5. Eloquent        → SQL: SELECT orders… WHERE user_id = ?
  6. Response        → 201 + order resource                        [HTTP job]
```

The same business rule — "an order can't exceed available stock" — is used by the API
controller, the admin "place order on behalf" controller, and the queue job that retries
a failed checkout (L124). Three callers means the rule lives in one place: the service.

## 4. How It Works — When to Extract a Service Layer

Two triggers justify the extraction. Name them, not "it's cleaner":

| Trigger | Sign you're looking at it |
|---|---|
| **Logic used in multiple places** | Same stock-check copied into 3 controllers / a job / a command |
| **Controller too fat** | The action does validate + orchestrate + persist + notify + respond |

The boundary is: if an action is still readable after you strip everything that is "HTTP",
it probably doesn't need a service yet. Concretely, before:

```php
// OrderController.php — every job at once
public function store(OrderRequest $request): JsonResponse
{
    $user = $request->user();

    if ($user->credit < $request->input('total')) {
        return response()->json(['error' => 'Insufficient credit'], 422);
    }

    $order = Order::create([
        'user_id' => $user->id,
        'total'   => $request->input('total'),
        'status'  => 'paid',
    ]);

    Mail::to($user)->send(new OrderConfirmation($order));

    return response()->json($order, 201);
}
```

and after — the controller keeps only its HTTP job:

```php
// OrderController.php — HTTP only
public function store(OrderRequest $request): JsonResponse
{
    $order = $this->orders->createOrder($request->user(), $request->validated());

    return response()->json($order, 201);
}
```

```text
Before: controller = validation + rule + persistence + email + response   (~15 lines of jobs)
After:  controller = validation + one call + response                     (~5 lines, one job)
        service    = the rule + transaction + notification                (testable in isolation)
```

The "why did you introduce a service layer here?" answer you should have ready:

> Two reasons. The credit rule and the order-creation transaction were already duplicated
> across the store action, the admin back-office, and the retry job — one change meant three
> edits. And the controller was doing five jobs, which made it untestable in isolation. Moving
> the business logic into `OrderService` gave it one home and let the controller go back to
> being purely about HTTP.

> [!PITFALL]
> A service layer is not a law. "Every controller must have a matching service" produces
> `OrderService::index()` that calls `Order::all()` and returns — a layer that adds a hop and
> nothing else. Extract on the two triggers, not on a naming convention.

## 5. How It Works — the Repository Pattern

The repository is an **interface over "give me the data for this use case"**, decoupled from
the persistence technology:

```php
interface OrderRepository
{
    /** @return Collection<int, Order> */
    public function forUser(User $user): Collection;
}
```

Eloquent's query builder already satisfies most read needs (L118) — the repository pays for
itself in exactly two situations:

1. **You must swap the data source** — an external API feed, a legacy DB, or a fake in tests
   that replaces the database entirely.
2. **You want the query itself unit-tested** without touching the DB.

The container makes the swap painless (L108): bind the interface, and Laravel resolves
whatever you pointed it at.

```php
// AppServiceProvider::register()
$this->app->bind(OrderRepository::class, EloquentOrderRepository::class);
```

```text
OrderRepository::forUser($user)  →  EloquentOrderRepository  →  SELECT * FROM orders
                                                               WHERE user_id = ? AND …
                                                               (eager loads items)
OrderRepository::forUser($user)  →  ApiOrderRepository       →  GET /v2/orders?user_id=…
                                                               (same Collection shape)
```

The collection contract stays identical; which implementation answers is a container
decision. That is the entire value of the pattern — nothing more.

### When the repository is over-abstraction

The honest senior answer — say this and mean it:

> Eloquent is already an abstraction over the database. It maps rows to objects, handles
> relations, and isolates you from SQL. Adding one repository per model on top of it is
> usually ceremony: `UserRepository::find($id)` that calls `User::find($id)` adds a hop,
> a file, and a binding for zero new capability. I reach for a repository when I need a seam —
> to fake the data layer in tests, or to switch a data source — not as a per-model default.

```text
Eloquent ORM ──already abstracts──▶ the database
    │
    └─ User::find()  /  Order::where('status', 'paid')->get()   ← real queries, real control

Repository per model             ← only adds a seam you can actually use:
  UserRepository::find($id)  =   User::find($id)     (pure ceremony)
  OrderRepository::forUser() =   orders + eager load (a use-case query — earns its place)
```

> [!NOTE]
> The modern Laravel default is closer to: FormRequest for validation, controllers that
> delegate, Eloquent scopes and query classes for reads, services for cross-cutting business
> rules. Repositories are the exception you justify, not the skeleton you scaffold. That
> nuance — not the pattern itself — is what separates a senior from someone who read a blog post.

## 6. How It Works — SOLID in Laravel

Five letters, five Laravel-shaped examples. The **D** is the one that decides interviews —
the container from L108 is a dependency-injection container, and DI is Dependency Inversion
made concrete.

| Letter | Principle | Laravel shape |
|---|---|---|
| **S** | Single Responsibility | A controller that only handles HTTP |
| **O** | Open/Closed | Add a payment provider through an interface, no edits to callers |
| **L** | Liskov Substitution | Subclasses keep the parent's contract — e.g. a job subclass that doesn't change semantics |
| **I** | Interface Segregation | Small, purpose-built contract interfaces, not one god interface |
| **D** | Dependency Inversion | Code depends on an interface; the container injects the concrete thing |

### S — Single Responsibility

The job of a controller is to translate an HTTP request into a call and a response. It does
not price orders, format reports, or decide who gets emailed:

```php
class OrderController extends Controller
{
    public function __construct(private OrderService $orders) {}

    public function store(OrderRequest $request): JsonResponse
    {
        return response()->json(
            $this->orders->createOrder($request->user(), $request->validated()),
            201,
        );
    }
}
```

```text
OrderController
  - validates        (OrderRequest)
  - delegates        (one call into the service)
  - responds         (201 + JSON)
  ── that's the whole file, and that's the point ──
```

### O — Open/Closed

Open for extension, closed for modification. A new payment provider slots in behind the
existing interface; nothing that *uses* payments changes:

```php
interface PaymentGateway
{
    public function charge(int $amountCents, array $payload): PaymentResult;
}

class StripeGateway implements PaymentGateway { /* … */ }
class PaypalGateway implements PaymentGateway { /* … */ }
```

```text
Adding PaypalGateway        → new class, new binding        (no edits anywhere else)
OrderService::charge()      → depends on PaymentGateway      (never on StripeGateway)
```

### L — Liskov Substitution

If a subclass is used where its parent is expected, it must honour the parent's contract —
same inputs, same behaviour. The canonical Laravel casualty is a "special" notification or
job subclass that quietly skips a step:

```php
class OrderConfirmation extends Notification
{
    public function __construct(private Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];                       // any subclass must still deliver
    }
}
```

A subclass that changes the semantics — delivering only to `mail` when callers expect mail
*and* database — breaks the contract and breaks every `Notification::send()` site that assumed
it. If a subclass needs different behaviour, it should implement the same contract, not
override the promise.

### I — Interface Segregation

Prefer several small interfaces over one fat one. A reporting service shouldn't be forced to
implement methods it never uses:

```php
interface RefundsOrders
{
    public function refund(Order $order): void;
}

interface TracksShipments
{
    public function trackingUrl(Order $order): string;
}
```

```text
One god interface                 Two small interfaces
  refund() + trackingUrl() +        RefundsOrders     → used by the refund job
  recalculate() + export()          TracksShipments   → used by the tracking route
  — a reporting class implements     — a reporting class implements neither
  methods it never calls
```

### D — Dependency Inversion

High-level policy depends on an abstraction, not on a concrete class. The container resolves
it (L108):

```php
// OrderService depends on the interface, not on EloquentOrderRepository
class OrderService
{
    public function __construct(private OrderRepository $orders) {}
}
```

```text
container
  OrderService            ← depends on OrderRepository (interface)
  OrderRepository (interface)
      └─ EloquentOrderRepository   (bound for prod)
      └─ InMemoryOrderRepository   (bound for tests)
```

Swap the binding, and the service works unchanged. That's D: *depend on abstractions*.

> [!DEEPDIVE]
> Laravel's container *is* the practical proof of D: type-hint an interface in a constructor
> and the container walks the dependency graph — resolving the interface's binding, then that
> implementation's own dependencies, recursively (L108). Facades and contracts (L110) are the
> same idea wearing different clothes: a facade is a static-looking shortcut to the container;
> a contract is the interface that lets you swap the implementation. The interview version:
> "the container is the `new` you never write."

## 7. Real Project Usage

The layered shape pays off at exactly the places production bites:

- **Two entry points, one rule.** The API `POST /orders`, the admin "re-order" endpoint, and
  a queue retry all hit `OrderService::createOrder()` — the stock/credit rule can't drift
  between them.
- **A database migration with no code change.** Move reads to a read replica and the only
  change is the repository implementation — the services never learn a replica exists.
- **Tests that never touch a database.** An in-memory repository makes the service layer's
  logic testable in milliseconds instead of seconds of DB setup.
- **HTTP concerns stay in HTTP.** Swapping the response shape (L133 API Resources) changes
  the controller only — the business layer doesn't know it was rendered.

## 8. Interview Explanation

> Layering is a decision, not a template. My default is controller → Eloquent, with
> FormRequests for validation and Eloquent scopes for shared queries. I extract a service
> layer when the same business logic shows up in more than one place, or when a controller
> stops being readable because it's doing five jobs — then the rule gets one home and the
> controller goes back to HTTP only.
>
> A repository is a seam, and I add it only when I can use the seam: swapping the data source,
> or faking data in tests. Eloquent is already an abstraction over the database, so a
> repository per model is usually ceremony. SOLID is the vocabulary for all of it — S keeps
> the controller thin, O and D let the container swap implementations behind interfaces, and
> that's how I'd answer "why a service layer here".

## 9. Senior-Level Insights

- **Name the trigger, not the pattern.** "I extracted a service because the retry job and the
  admin endpoint needed the same transaction" beats "I always use services" in the first
  sentence.
- **Repositories are a test-strategy decision.** The most common real reason is the in-memory
  fake. If your tests already hit a test database (L129), the seam is worth less — say that
  trade-off out loud.
- **Fat controllers are usually fat validation + fat queries.** A FormRequest (L121) and an
  Eloquent scope/query class (L118) often remove the need for a service *and* a repository.
  The senior move is reaching for the cheapest seam first.
- **D is the letter that pays.** "The container resolves the interface I type-hinted" is the
  whole architecture in one sentence — it is the concrete mechanism behind Open/Closed too.
- **Refactor in small, verifiable steps.** Extract the service first and run the test suite;
  extract the repository after. Nobody can review a 400-line diff that re-layers everything
  at once.

## 10. Common Mistakes

❌ A repository per model "by default":

```php
class UserRepository
{
    public function find(int $id): ?User { return User::find($id); }
}
```

```text
UserRepository::find()  →  User::find()        ← identical call, extra hop, zero capability
```

❌ Services that return Eloquent models to the controller — the controller then reaches
through to relationships and the layering silently collapses:

```php
class OrderService
{
    public function paidOrders(User $user)
    {
        return $user->orders()->where('status', 'paid')->get();
        // controller: $order->user->email …        ← now controller owns the graph too
    }
}
```

❌ A `UserService::index()` that just forwards `User::all()` — a layer with no job (see §4 pitfall).

❌ SOLID recited as five memorised sentences with no Laravel example — interviewers hear
that and dig.

## 11. Best Practices

✅ Start controller → Eloquent; extract a service on the two triggers (reuse, fat controller)

✅ Keep the controller HTTP-only: validate → delegate → respond

✅ Let services own transactions (`DB::transaction`) and cross-entity rules (L120)

✅ Add a repository when you need the seam — fake data in tests, or swap the data source

✅ Type-hint interfaces, bind implementations in a service provider

✅ Return DTOs or collections from services, not fully-loaded Eloquent graphs

❌ Don't add a layer per model, per controller, or because "the architecture says so"

## 12. Interview Questions

**Q1. When do you introduce a service layer in Laravel?**

> Two triggers. First, when the same business logic is used in multiple places — a queue job
> and two controllers sharing a stock check, say — because then one change means editing
> everywhere. Second, when a controller gets fat enough that it's doing validation,
> orchestration, persistence, and email in one method. Extraction gives the rule one home and
> returns the controller to HTTP-only. If neither trigger applies, I don't add one — a
> controller that calls Eloquent directly is fine.

**Q2. Why did you introduce a service layer here?**

> Because the credit rule and the order transaction were duplicated across the API, the admin
> back-office, and a retry job — three places to edit for one change. Moving it into
> `OrderService` gave the rule a single home, made it testable without an HTTP request, and
> let the controller go back to handling only HTTP.

**Q3. When is a repository over-abstraction in Laravel?**

> When it wraps Eloquent without adding capability. Eloquent is already an abstraction over
> the database — `UserRepository::find()` calling `User::find()` is ceremony: an extra file,
> a binding, and a hop, with nothing new. The pattern earns its place when I need a seam: a
> fake implementation for tests that never touch the DB, or a real swap of the data source.
> Otherwise I use Eloquent directly.

**Q4. Give me one example of each SOLID letter in Laravel.**

> S: a controller that only validates, delegates, and responds. O: a new payment provider
> added behind an existing `PaymentGateway` interface, with no caller edited. L: a notification
> subclass that must still honour the parent's delivery contract. I: separate `RefundsOrders`
> and `TracksShipments` contracts instead of one god interface a reporting class half-implements.
> D: `OrderService` depends on `OrderRepository` — the interface — and the container resolves
> the concrete implementation from a binding.

**Q5. How do you test a service that uses a repository?**

> Bind an in-memory implementation of the repository in the test and exercise the service's
> rules against it — no database involved. Because the service depends on the interface (D),
> the swap is a one-line container binding. Tests get fast and deterministic; the repository
> implementation itself is covered separately against the real DB in integration tests.

**Senior follow-up: Would you ever extract a repository for a single model with no swap in sight?**

> Not as a default. The seam has to pay rent. If tests already run against a test database
> and the data source won't change, `OrderRepository` around `Order` is a hop I'd skip. I'd
> extract it the moment something real needs the seam — the first fake in tests, or the first
> non-Eloquent source — because that's when the interface starts justifying its file.

## 13. Follow-up Questions

**What's the difference between a service and a repository?**

> A service owns business logic and orchestrates work — rules, transactions, calling other
> services. A repository owns data retrieval — the queries a use case needs. Same request,
> different jobs: the service decides *what must happen*; the repository decides *how the
> data is fetched*.

**Does a repository always return Eloquent models?**

> Not necessarily — it returns whatever the contract promises. A use-case query may return a
> collection of models, or a DTO/plain array if the caller shouldn't see Eloquent at all. The
> interface defines the shape; the implementation decides how to produce it.

**Where do FormRequests and Eloquent scopes fit in this picture?**

> They're often the cheapest fixes for a "fat controller". A FormRequest (L121) moves
> validation out of the action; a scope or query class (L118) moves the query out. That
> sometimes removes the need for a service layer and a repository entirely — which is the
> point: cheapest seam first.

**Doesn't the repository pattern conflict with Eloquent's active record style?**

> Eloquent is active record — the model carries its own persistence. A repository is the
> opposite shape: data access behind an interface. Laravel works fine with both because the
> repository is a thin seam over the active-record models; it doesn't replace them. The
> conflict only appears when someone wraps every model method and calls it architecture.

## 14. Comparison Table

| | Controller → Eloquent | + Service layer | + Repository |
|---|---|---|---|
| Extra files | none | one per use case | one interface + implementation(s) |
| When it pays | always (default) | logic reused / fat controller | swap or fake the data source |
| Testing the rule | through HTTP + DB | direct, fast | direct, DB-free with a fake |
| Risk | duplication across controllers | empty "forwarding" services | ceremony per model |
| Senior answer | "start here" | "extract on the two triggers" | "add only when the seam pays" |

## 15. Code Example — Fat Controller → Service → Repository

The full refactor, top to bottom. **Step 1** — the fat controller (start): validation, a
business rule, persistence, email, all in one method.

```php
// app/Http/Controllers/OrderController.php — BEFORE
public function store(OrderRequest $request): JsonResponse
{
    $user = $request->user();

    if ($user->credit < $request->validated('total')) {
        return response()->json(['error' => 'Insufficient credit'], 422);
    }

    $order = Order::create([
        'user_id' => $user->id,
        'total'   => $request->validated('total'),
        'status'  => 'paid',
    ]);

    Mail::to($user)->send(new OrderConfirmation($order));

    return response()->json($order, 201);
}
```

**Step 2** — extract the service. The rule and the transaction move in; the controller
delegates. The service returns a DTO, not an Eloquent model:

```php
// app/Services/OrderService.php
class OrderService
{
    public function __construct(private OrderRepository $orders) {}

    public function createOrder(User $user, array $data): OrderDto
    {
        return DB::transaction(function () use ($user, $data) {
            if ($user->credit < $data['total']) {
                throw new InsufficientCreditException();
            }

            $order = $this->orders->create([
                'user_id' => $user->id,
                'total'   => $data['total'],
                'status'  => 'paid',
            ]);

            Mail::to($user)->send(new OrderConfirmation($order));

            return OrderDto::from($order);
        });
    }
}
```

```text
HTTP /orders  →  controller (validate + delegate)  →  OrderService
                                                      ├─ DB::transaction()        (L120)
                                                      ├─ credit rule → 422 on failure
                                                      ├─ orders->create()          (repo)
                                                      └─ OrderConfirmation email   (L126)
        ── response: 201 + {"id": 42, "total": 9900, "status": "paid"} ──
```

**Step 3** — the repository, only because it earns its place: the contract lets the test
bind an in-memory fake and lets the app swap the source later. If neither was true, stop here.

```php
// app/Repositories/OrderRepository.php (interface) + EloquentOrderRepository.php
interface OrderRepository
{
    public function create(array $data): Order;
    public function forUser(User $user): Collection;
}

class EloquentOrderRepository implements OrderRepository
{
    public function create(array $data): Order
    {
        return Order::create($data);          // active record under the seam
    }

    public function forUser(User $user): Collection
    {
        return $user->orders()
            ->with('items')                    // eager loading (L117) — no N+1 here
            ->where('status', 'paid')
            ->get();
    }
}
```

```text
forUser($user) generates:
  select * from "orders" where "user_id" = ? and "status" = 'paid'
  select * from "order_items" where "order_id" in (1, 2, 3, …)     ← eager loaded, 2 queries total
```

```narrate
line 1 (controller):    validate + delegate + respond — HTTP only, S satisfied
line 2 (service):       DB::transaction wraps the rule and the persistence — the business home
line 3 (service):       InsufficientCreditException → controller maps it to a 422 (L128)
line 4 (repo):          create() is a thin seam; forUser() carries the eager load
output:                 two SQL statements — the N+1 from Lesson 117 is gone by construction
```

The test that the seam exists for:

```php
// tests — no database at all
class InMemoryOrderRepository implements OrderRepository
{
    // array-backed store; same Collection shapes as EloquentOrderRepository
}

public function test_order_fails_when_credit_is_insufficient(): void
{
    $service = new OrderService(new InMemoryOrderRepository());
    // …assert InsufficientCreditException, assert nothing was persisted
}
```

```text
✓ 1 passed  — milliseconds, no DB container, no HTTP
```

## 16. Performance Notes

- **Eager loading is the whole game for reads.** A repository that owns the use-case query
  is the one place you can guarantee `with()` happens (L117) — every caller gets the N+1 fix
  without remembering it.
- **`DB::transaction` costs one round trip to the DB per transaction** (BEGIN/COMMIT). Batch
  the writes a service makes, don't open one transaction per item (L120).
- **A service layer adds one method call per request** — microseconds. Any "performance"
  argument against layering is noise; the real cost is file count and indirection, not speed.
- **Scopes and query classes (L118) beat string-building in controllers** — the query stays
  composable and index-friendly, and `EXPLAIN` reads the same either way.

## 17. Debugging Scenarios

| Symptom | Likely cause | Fix |
|---|---|---|
| Same rule edited in 3 controllers, drift after 2 weeks | Rule never extracted | Pull it into a service; call it from all entry points |
| Controller test needs a full HTTP + DB setup | Logic lives in the action | Extract the service; test it with a fake repository |
| New "repository" does nothing but forward | Ceremony, no seam | Delete it; use Eloquent directly until the seam pays |
| N+1 reappears despite eager loading | Repository bypassed somewhere | Make the use-case query the only path — move it into the repo |
| "Works in tests, broken in prod" | Test fake diverged from real repo | Contract test both implementations against the same assertions |

## 18. Quick Revision Notes

- Layering: Controller → Service → Repository → Eloquent; the last two are **optional seams**
- Extract a service on two triggers: logic used in multiple places, or a fat controller
- The "why a service layer?" answer: one home for the rule, HTTP back to the controller
- Repository = interface + implementation(s) + container binding + testability
- Repository over-abstraction: Eloquent already abstracts the DB; per-model repos are ceremony
- S: controller = HTTP only · O: provider behind an interface · L: subclasses keep the contract
- I: small contract interfaces · D: depend on interfaces, container resolves concretes
- Cheapest seam first: FormRequest + Eloquent scope often remove the need for service + repo

## 19. Cheat Sheet

```text
Layering decision:
  default:      Controller → Eloquent (FormRequest for validation, scopes for queries)
  add service:  logic reused in 2+ places, OR controller doing 5 jobs
  add repository: need a seam — fake data in tests, or swap the data source

SOLID in Laravel:
  S  controller validates + delegates + responds — nothing else
  O  PaymentGateway interface; Stripe/Paypal behind it, callers untouched
  L  subclasses honour the parent contract (no "special" notifications)
  I  RefundsOrders, TracksShipments — small contracts, not one god interface
  D  type-hint OrderRepository; container resolves EloquentOrderRepository

Refactor recipe:
  fat controller → OrderService (rule + transaction) → OrderRepository (query seam)
  → test with InMemoryOrderRepository, no database
```

## 20. Key Takeaways

> [!RECAP]
> - Layering is a decision, not a default: start controller → Eloquent, extract when it pays
> - Extract a service layer on two triggers — logic used in multiple places, or a fat controller
> - The repository earns its place only as a seam: fake data in tests, or a swap of the data source
> - Eloquent is already an abstraction over the database — a repository per model is usually ceremony
> - S keeps controllers HTTP-only; O lets providers appear behind interfaces without edits
> - L means subclasses keep the contract; I means small interfaces; D means depend on the interface and let the container resolve it
> - Cheapest seam first: FormRequests and Eloquent scopes often make service + repo unnecessary
> - "Why did you introduce a service layer here?" → one home for a duplicated rule, and an HTTP-only controller

## Check your understanding

Answer these without looking back.

1. Draw the layering diagram and mark which boxes are optional — and why they're optional.
2. Give the two triggers for extracting a service layer, and one sign that you shouldn't.
3. What is the honest senior answer to "when is a repository over-abstraction?"
4. For each SOLID letter, name the one Laravel example from this lesson.
5. Explain why `OrderService` depending on `OrderRepository` is Dependency Inversion — and what the container does about it.
6. Walk the fat-controller refactor: which responsibility moves where, and why the repository is the last step.
7. Why does a repository that owns the eager-loaded query kill the N+1 problem by construction?

## What's Next

**Lesson 131 — Laravel Performance & Deployment.** The flagship senior scenario: your API is
slow — measure, find the N+1, cache, move work to queues — then ship it safely with
config caching, workers, and a rollback that doesn't panic.