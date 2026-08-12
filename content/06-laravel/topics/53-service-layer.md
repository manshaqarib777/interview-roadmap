# Topic 53 — Service Layer

**Checklist anchor:** when to extract business logic into Controller → Service → Repository/Query → Model · why you don't need a repository per model · "why did you introduce a service layer?"

**Owning lesson:** [130 Service Layer, Repositories & SOLID](../130-solid-patterns.md)

---

## The one-sentence answer

**A service layer holds the business logic that doesn't belong in a controller or a model — the "how this feature works" code — so controllers stay thin and the logic is testable without HTTP.**

## The mental model

The checklist's layering:

```text
Controller    →  traffic cop: validate, call, respond
   ↓
Service       →  THE BUSINESS LOGIC: "place an order" as one method
   ↓
Repository/Query → data access (where it earns its keep)
   ↓
Model         →  the row, relationships, invariants
```

The controller knows *about* HTTP; the service knows *about the business*. When you move payment, inventory, and email orchestration out of a controller into `OrderService::place(...)`, the logic becomes:

- **Testable** without HTTP — a unit test calls the service.
- **Reusable** — a controller, an artisan command, and a job can all place an order.
- **Single-homed** — one place to fix, not a duplicated flow.

## When to extract a service (and when not to)

The senior question is **"why did you introduce a service layer here?"** — you need a concrete answer:

### Extract when

| Signal | The logic… |
|---|---|
| Multiple steps | "Place order" = create, charge, decrement, email |
| Multiple models | Order + Payment + Inventory |
| Reused | Called from a controller *and* a command/job |
| Hard to test | Payment/email logic tangled with HTTP |
| The controller is fat | A method past a few lines of orchestration |

### Don't extract when

| Signal | Keep it where it is |
|---|---|
| One step, one model | A single `create` in the controller is fine |
| No reuse | The logic is used in exactly one place |
| It's a CRUD passthrough | A service that just calls `Model::create()` is a wrapper |

**The rule:** the service layer earns its place by holding *business logic* — orchestration, rules, transactions. A service that's a thin pass-through to a model is ceremony. That's the concrete answer to "why did you introduce a service layer?" — *this flow is multi-step, multi-model, reused, and needs to be tested without HTTP.*

## How it works

```php
class OrderService
{
    public function __construct(
        private PaymentGateway $payments,
        private InventoryService $inventory,
    ) {}

    public function place(User $customer, array $items): Order
    {
        return DB::transaction(function () use ($customer, $items) {
            $order = Order::create(['user_id' => $customer->id]);
            foreach ($items as $item) {
                $this->inventory->reserve($item['product'], $item['qty']); // throws → rollback
                $order->items()->create($item);
            }
            $this->payments->charge($customer, $order->total);
            return $order;
        });
    }
}
```

The controller becomes:

```php
public function store(StoreOrderRequest $request)
{
    $order = $this->orders->place($request->user(), $request->validated()['items']);
    return OrderResource::make($order);     // 201 — Lesson 24/25
}
```

## Service layer vs repository (the relationship)

| | Service | Repository |
|---|---|---|
| Job | **Business logic** | **Data access** |
| Example | `place()` — orchestrate the flow | `findByStatus()` — the query |
| Tested with | Fakes of its dependencies | The DB (or a fake) |
| Always needed? | When logic is non-trivial | **Only when the abstraction pays** |

A service can use the model directly — the repository is a *separate* decision (Lesson 54), not a required rung. The checklist's ladder shows "Repository/Query" with a slash for a reason: often the service's data access is just Eloquent.

## Interview questions

**Q1. What is the service layer?**
> The home of business logic that doesn't belong in a controller or a model. `OrderService::place()` holds the orchestration — create, charge, decrement, email — so the controller stays thin and the logic is testable without HTTP and reusable from controllers, commands, and jobs.

**Q2. When do you introduce one?**
> When the flow is multi-step, spans models, is reused, or is hard to test inside a controller — that's the concrete answer to "why did you add a service?" If it's a single `Model::create()` used once, a service is ceremony, and not adding one is the senior call.

**Q3. Controller vs service — where does the logic live?**
> The controller validates (form request), calls the service, and returns a response — the traffic cop. The service owns the business rules and orchestration. The tell: if the controller method can't be described in one line without "and," the logic belongs in a service.

**Q4. Why is a service more testable?**
> Because it doesn't need HTTP. `OrderService::place($user, $items)` runs in a unit test with fakes for the payment gateway and inventory — no routing, no request, no view. Controllers force the whole stack; services isolate the logic.

**Q5. Do you need a repository under every service?**
> No. The repository is a separate decision (Lesson 54) — worth it when you need a swappable data source or a test seam. Most services can query Eloquent directly. The checklist says "Repository/Query" — the query is often enough.

**Senior follow-up: Where do transactions live — controller or service?**
> The service owns the transaction. `DB::transaction` wraps the business flow so atomicity (Lesson 15) is part of the *behaviour*, not the HTTP layer. A controller that wraps the service in a transaction can't be reused by a command; the service owning it can be.

## Common mistakes

❌ A service for every model — pass-through services are ceremony (Lesson 54's over-abstraction).

❌ Controllers with orchestration — "the fat controller" moved nowhere.

❌ Services that return HTTP-isms — a service shouldn't return redirects or view responses; it returns domain results.

❌ Business logic in resources/views — presentation layers are not the home (Lesson 24).

## Quick revision notes

- Service = **the business logic** — orchestration, rules, transactions
- Controller = traffic cop → service → response
- Extract when: **multi-step, multi-model, reused, hard to test**
- Skip when: **single-step CRUD, no reuse** — ceremony
- Service owns **transactions**; controller never wraps it
- Repository is a *separate* decision, not a required rung

## Check your understanding

1. What exactly does a service hold that a controller shouldn't?
2. Give the concrete "why did you introduce a service layer?" answer.
3. When is NOT extracting the senior call?
4. Why are services testable where controllers aren't?
5. Who owns the transaction, and why?
