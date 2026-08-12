# Topic 28 — Events & Listeners

**Checklist anchor:** events · listeners · queued listeners · event discovery · event subscribers

**Owning lesson:** [125 Events, Listeners & Observers](../125-events-observers.md)

---

## The one-sentence answer

**An event is an announcement that something happened — `OrderCreated` — and listeners are the parts of the app that react to it, so the reaction decouples from the cause.**

## The mental model

The checklist's diagram:

```text
OrderCreated
      ↓
Listeners
 ├── SendEmail
 ├── UpdateAnalytics
 └── NotifyAdmin
```

The order is created, and `OrderCreated` is fired. **The creator doesn't care who reacts** — email, analytics, and admin alerts are listeners attached to the event. Add a reaction without touching the order code; remove one without breaking the flow.

```php
event(new OrderCreated($order));   // the announcement
// listeners run here — the order code knows nothing about them
```

## How it works

### The event + listener

```php
php artisan make:event OrderCreated
php artisan make:listener SendOrderConfirmation
```

```php
class OrderCreated
{
    public function __construct(public Order $order) {}
}

class SendOrderConfirmation
{
    public function handle(OrderCreated $event): void
    {
        Mail::to($event->order->email)->send(new OrderConfirmation($event->order));
    }
}
```

### Wiring — the provider

```php
// AppServiceProvider::boot() or EventServiceProvider
Event::listen(OrderCreated::class, SendOrderConfirmation::class);
```

### Event discovery (Laravel 8+)

```php
// no manual wiring needed — Laravel scans the events/listeners by convention:
// app/Events/OrderCreated.php + app/Listeners/OrderCreated*.php
```

Auto-discovery finds `handle(OrderCreated $event)` listeners by convention. Manual `Event::listen` remains for explicitness or complex wiring.

### Queued listeners — the async pattern

```php
class SendOrderConfirmation implements ShouldQueue
{
    public $connection = 'redis';
    public $tries = 3;

    public function handle(OrderCreated $event): void
    {
        Mail::to($event->order->email)->send(...);
    }
}
```

A listener implementing `ShouldQueue` runs on a **worker**, not in the request — the event fires instantly, the email is queued (Lesson 26). This is the standard shape for email/analytics/notification listeners.

### Event subscribers

```php
class OrderSubscriber
{
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(OrderCreated::class, [$this, 'handleCreated']);
        $events->listen(OrderStatusChanged::class, [$this, 'handleStatus']);
    }
}
```

A subscriber groups several event→handler mappings in one class — the "group of related reactions" pattern.

## Interview questions

**Q1. What is an event, and what are listeners?**
> An event is an object representing that something happened — `OrderCreated` carrying the order. Listeners are classes that react — `SendOrderConfirmation`, `UpdateAnalytics`. The event fires (`event(new OrderCreated($order))`), and Laravel runs every listener wired to it. The cause and the reaction are decoupled: the order code doesn't know about email or analytics.

**Q2. What are queued listeners?**
> Listeners implementing `ShouldQueue` — they run on a worker instead of in the request. The event fires and returns immediately; the listener's work happens later on the queue. That's the standard shape for email, analytics, and notifications — the reaction is asynchronous, and retryable (Lesson 26).

**Q3. How does event discovery work?**
> Laravel auto-wires events to listeners by convention — an `OrderCreated` event and an `OrderCreated…` listener class with `handle(OrderCreated $event)` are found without manual registration. Discovery removes boilerplate; explicit `Event::listen` stays available for clarity or non-conventional wiring.

**Q4. What is an event subscriber?**
> A class with a `subscribe()` method that registers several event→handler mappings at once. It's for grouping related reactions — an `OrderSubscriber` handling `OrderCreated` and `OrderStatusChanged` — instead of scattering `Event::listen` calls.

**Q5. When should a listener be queued?**
> Whenever the reaction is a side effect that shouldn't block the request — email, notifications, analytics, third-party calls. If it's fast and must happen before the response (say, setting a session value), keep it synchronous. The rule: side effects that can wait → `ShouldQueue`.

**Senior follow-up: Events vs model events?**
> Model events (`Order::creating`) are tied to one model's lifecycle (Lesson 48). Application events (`OrderCreated`) are announcements any part of the app can react to. The senior pattern: model events enforce invariants; application events carry the *reactions* — email, analytics, notifications — typically as queued listeners.

## Common mistakes

❌ Putting heavy reactions in synchronous listeners — the request pays for them; queue the listener.

❌ Events with no payload structure — the event should carry what listeners need (`public Order $order`).

❌ Hand-wiring everything when discovery handles it — or hiding intentional wiring behind magic; pick deliberately.

❌ Firing events inside transactions where the reaction can't be rolled back — commit, then fire (Lesson 15).

## Quick revision notes

- **Event** = "something happened" (`OrderCreated`) · **Listener** = the reaction
- Fire with `event(new ...)` — the cause doesn't know the reactions
- **Queued listeners** (`ShouldQueue`) = reactions on workers, retryable
- **Discovery** = convention-based wiring · **Subscribers** = grouped mappings
- Side effects that can wait → **queued listeners**

## Check your understanding

1. What does an event decouple, exactly?
2. When do you queue a listener?
3. How does event discovery find the wiring?
4. What's a subscriber for, and when is it the right shape?
5. Model event vs application event — where does each belong?
