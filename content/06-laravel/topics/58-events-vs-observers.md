# Topic 58 — Laravel Events vs Observers

**Checklist anchor:** the difference · application-level event vs model lifecycle events

**Owning lessons:** [125 Events, Listeners & Observers](../125-events-observers.md) · [48 Model Events & Observers](../48-model-events-observers.md)

---

## The one-sentence answer

**Observers hook a single model's lifecycle (`Order::created`); events announce application-wide happenings (`OrderCreated`) that any number of listeners react to.**

## The mental model

Two different "when does this run?" mechanisms that sound alike:

```text
OBSERVER (model lifecycle)
   Order::created → OrderObserver::created($order)
   — tied to ONE model, fires when the model's DB operation happens

EVENT (application-level)
   event(new OrderCreated($order)) → any listeners wired
   — fires where YOU call it, reactions are decoupled and numerous
```

The observer says "when an Order row is inserted, do this." The event says "when the app announces an order was created, everyone relevant reacts." One is a **model hook**; the other is an **application broadcast**.

## How they work

### Observer — model lifecycle

```php
class OrderObserver
{
    public function created(Order $order): void
    {
        // runs whenever an Order row is inserted — no explicit call needed
        $order->number ??= generateOrderNumber();
    }
}

Order::observe(OrderObserver::class);   // registered once
```

- Fires automatically on the model's lifecycle events: `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `restoring`, `restored` (Lesson 48).
- One model, one observer — model-owned logic.

### Event — application broadcast

```php
class OrderCreated
{
    public function __construct(public Order $order) {}
}

// wired listeners:
Event::listen(OrderCreated::class, SendOrderConfirmation::class);
Event::listen(OrderCreated::class, UpdateAnalytics::class);

// fired explicitly, wherever the domain says "this happened":
event(new OrderCreated($order));
```

- Fires where you call `event()`, not automatically.
- Any number of listeners, added/removed without touching the cause (Lesson 28).

## The comparison

| | Observer | Event |
|---|---|---|
| Trigger | **Model lifecycle** (automatic) | **Explicit `event()` call** |
| Scope | One model | Whole application |
| Listeners | One observer class | Zero or many listeners |
| Decoupling | Tied to the model | Fully decoupled |
| Best for | Model invariants (number gen, guards) | Reactions (email, analytics, notifications) |
| Queued? | Runs in the save's request | Listeners can be `ShouldQueue` |

## The classic combination

The senior pattern uses both in one flow:

```php
// Observer: model-owned invariant
class OrderObserver
{
    public function creating(Order $order): void
    {
        $order->number ??= generateOrderNumber();   // must-always, model-owned
    }

    public function created(Order $order): void
    {
        event(new OrderCreated($order));            // announce — reactions decouple
    }
}
```

The observer handles what *every* Order creation needs (the number). The event handles what the *app* might want to do about it (email, analytics) — with queued listeners so the save doesn't pay for them.

## Interview questions

**Q1. Events vs observers — what's the difference?**
> An observer hooks a single model's lifecycle — `Order::created` runs automatically when an Order row is created, handling model-owned logic like generating a number. An event is an application-level announcement — `event(new OrderCreated($order))` — fired explicitly, with zero or many decoupled listeners reacting. Observer = model lifecycle hook; event = application broadcast.

**Q2. When would you use an observer?**
> For invariants every instance of the model needs — generate an order number on `creating`, block deleting a protected row in `deleting`. The logic is "this always happens when an Order does X," so it belongs on the model's own lifecycle, not scattered in callers.

**Q3. When would you use an event instead?**
> When reactions should be decoupled and numerous — "the order was created, so email the customer, update analytics, alert the admin." The order code shouldn't know about email or analytics; listeners attached to `OrderCreated` handle them, ideally queued.

**Q4. Can they work together?**
> Constantly. The observer owns the invariant (the order number), and its `created` hook fires the application event (`OrderCreated`) whose listeners own the reactions. Observer for must-always model logic; event for app-wide reactions.

**Q5. How do you decide where a piece of logic goes?**
> Ask "what triggers this?" If it's the model's own lifecycle — an Order row being created — it's an observer. If it's the *app* announcing an outcome and anyone may react — it's an event. And if it's a side effect that shouldn't block the request, the listener (or a job it dispatches) should be queued.

**Senior follow-up: Why is this distinction senior-level?**
> Because it's about where *responsibility* lives. Observers that email the customer couple the model to side effects and make the save slow and hard to test. Events push reactions to listeners — swappable, queueable, testable. The senior answer names the boundary: invariants in the observer, reactions in (queued) listeners.

## Common mistakes

❌ Putting side effects in observers — the model starts owning email/analytics; move them to event listeners.

❌ Using an event where an observer belongs — model invariants shouldn't depend on someone remembering to fire an event.

❌ Firing events inside transactions (Lesson 15) — the reaction can't roll back with the data.

❌ Non-queued heavy listeners — a synchronous reaction defeats the decoupling.

## Quick revision notes

- **Observer** = model lifecycle hook (automatic, one model) — *invariants*
- **Event** = application broadcast (explicit, many listeners) — *reactions*
- Observer fires automatically; event fires where you call `event()`
- The classic combo: observer sets the invariant, fires the event; listeners react (queued)
- Side effects belong in **listeners**, not observers

## Check your understanding

1. What triggers an observer vs what triggers an event?
2. Where do model invariants belong, and why?
3. Where do email/analytics reactions belong, and why?
4. Write the observer that sets an order number and announces `OrderCreated`.
5. When is a queued listener the right call?
