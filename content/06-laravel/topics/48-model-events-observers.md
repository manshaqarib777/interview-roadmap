# Topic 48 — Model Events & Observers

**Checklist anchor:** `creating`/`created` · `updating`/`updated` · `saving`/`saved` · `deleting`/`deleted` · `restoring`/`restored` · observers

**Owning lessons:** [125 Events, Listeners & Observers](../125-events-observers.md) · [115 Eloquent ORM](../115-eloquent.md)

---

## The one-sentence answer

**Model events are hooks into the model's lifecycle — `creating`, `created`, `updating`, `deleting` — and an observer groups them for one model in one class.**

## The mental model

Every Eloquent model passes through the same lifecycle:

```text
new → creating → created → updating → updated → saving/saved → deleting → deleted → restoring → restored
```

Laravel fires an event at each stop, and you can listen. **The `-ing` events run before the DB operation** (you can cancel by returning false, or mutate the model); **the `-ed` events run after** (the row is committed).

```php
class Order extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->number ??= generateOrderNumber();  // set before insert
        });
        static::created(function (Order $order) {
            event(new OrderCreated($order));          // announce after insert
        });
    }
}
```

The observer is the same thing with all hooks in one class:

```php
// app/Observers/OrderObserver.php
class OrderObserver
{
    public function creating(Order $order) { $order->number ??= generateOrderNumber(); }
    public function created(Order $order)  { event(new OrderCreated($order)); }
    public function updating(Order $order) { /* ... */ }
    public function deleting(Order $order) { /* ... */ }
}

// register once:
Order::observe(OrderObserver::class);   // in a provider's boot()
```

## The hooks

| Event | When | Typical use |
|---|---|---|
| `creating` / `creating` | Before insert — can cancel (return false) | Defaults, number generation |
| `created` | After insert | Announce, trigger follow-up |
| `updating` | Before update | Guard against invalid transitions |
| `updated` | After update | Invalidate caches, reindex |
| `saving` / `saved` | Before/after any save (create or update) | Always-on normalization |
| `deleting` | Before delete — can cancel | Block deleting protected rows |
| `deleted` | After delete | Cleanup, cascade, audit |
| `restoring` / `restored` | Soft-delete restore (Lesson 50) | Re-permission, re-activate |

## Model events vs observers vs app events (the checklist's #58)

| | Model events | Observers | App events |
|---|---|---|---|
| What hooks | Model lifecycle | Same, grouped per model | Application events (`OrderCreated`) |
| Scope | One model | One model | Whole app, many listeners |
| Declared | In `booted()` | One class, registered via `observe()` | `Event::listen()` / providers |
| Best for | Small per-model logic | Several hooks on one model | Cross-cutting reactions (email, analytics, notifications) |

The senior shape: observers for **model-owned concerns** (number generation, guarded transitions), app events for **reactions** (email, analytics) — usually queued (Lesson 26).

## Interview questions

**Q1. What are model events?**
> Hooks into the Eloquent lifecycle — `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `restoring`, `restored`. The `-ing` events fire before the DB operation (and can cancel it by returning false); the `-ed` events fire after. You listen via `static::creating(...)` in `booted()`, or an observer.

**Q2. What is an observer?**
> A class that groups all of one model's lifecycle hooks — `OrderObserver` with `creating`, `created`, `deleting`, etc. — registered once with `Order::observe(OrderObserver::class)`. It keeps model lifecycle logic in one file instead of a crowded `booted()`.

**Q3. Model events vs app events?**
> Model events are tied to one model's lifecycle — `Order::creating`, `Order::deleted`. App events are application-level announcements — `OrderCreated` — that any number of listeners can react to. Model events are for model-owned logic; app events are for cross-cutting reactions like email, analytics, and notifications (which belong in listeners, often queued).

**Q4. When would you use a model event?**
> For things every instance of the model needs: generate an order number on `creating`, block deleting a protected row in `deleting`, invalidate a cache on `updated`. If the logic is "this always happens when an Order does X," it belongs on the model's lifecycle; if it's "the rest of the app should react," that's an app event.

**Q5. Can you cancel an event?**
> Yes — returning `false` from a `-ing` hook (`creating`, `updating`, `deleting`, `saving`) aborts the operation. That's the standard way to enforce model-level invariants: return false from `deleting` to protect rows, and Laravel refuses the delete.

**Senior follow-up: Where does this break down?**
> When business logic hides in lifecycle hooks. "Send email when order created" in `created` couples the model to side effects and is hard to test — that belongs in an app event listener (often queued). The rule: model events for **invariants** (must-always), app events for **reactions** (nice-to-have side effects).

## Common mistakes

❌ Putting side effects (email, HTTP) in `-ed` hooks — hard to test, blocks the save; use app events + queues.

❌ Forgetting `-ing` hooks can cancel — they're the enforcement point for invariants.

❌ Registering observers repeatedly — observe once in a provider's `boot()`.

❌ Confusing `saving`/`saved` (any save) with `creating`/`created` (insert only) — they fire on different operations.

## Quick revision notes

- Events at every lifecycle stop: `creating`/`created`, `updating`/`updated`, `saving`/`saved`, `deleting`/`deleted`, `restoring`/`restored`
- `-ing` = **before** (can cancel) · `-ed` = **after**
- **Observer** = one class, all hooks, `Order::observe(...)` once
- Model events = **invariants** · App events = **reactions** (queued)
- Return `false` from `-ing` to **abort** the operation

## Check your understanding

1. Which hooks run before the DB operation, and what can they do?
2. What does an observer give you over a crowded `booted()`?
3. Model events vs app events — where does "email the customer" belong?
4. How do you block a delete at the model level?
5. What's the difference between `saving` and `creating`?
