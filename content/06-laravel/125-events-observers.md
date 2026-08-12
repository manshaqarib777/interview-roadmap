# Lesson 125 — Events, Listeners & Observers

**Interview importance:** ⭐⭐⭐ — a decoupling question that separates people who memorised
the syntax from people who know when each tool fits.

Lesson 124 gave you the vocabulary for *work*: a job is "do this thing". Events are the
flip side — *something happened, anyone who cares can react*. The order was placed; that's
one fact. The email, the analytics, the admin alert are three consequences, and only the
first belongs in the code that created the order. Events let each consequence subscribe
independently, so adding a new consequence never touches the order code again.

Observers are the same instinct pointed at the model lifecycle: `created`, `updated`,
`deleted`. They're the shortest answer to "where does logic run when a model changes?" —
and Lesson 124 showed you how to move that logic out of the request with queued listeners.

## Learning Objectives

By the end of this lesson you should be able to:

- Distinguish an event from a job in one sentence
- Dispatch an event and wire listeners, sync and queued
- Explain event discovery, subscribers, and when to use each
- Fit observers into the model lifecycle — and know when they don't
- Decide: event, listener, observer, or job — for a given feature

## 1. One-line Definition

**An event is a fact that happened ("order was created"); a listener is code that reacts to
it; an observer is a listener bound to a model's lifecycle events instead of your
custom ones.**

The event doesn't know who's listening. That one property — zero coupling between the
producer and its consequences — is the entire value.

## 2. Mental Model

**The event is the school bell; the listeners are everyone who hears it.**

- The bell rings because the day is over — it doesn't call each teacher and say "you may
  leave". It rings once; whoever cares reacts in their own way.
- The **order controller** rings the bell (`OrderCreated`); the **email listener**, the
  **analytics listener**, and the **admin listener** each react on their own schedule.
- Add a new listener tomorrow and the bell's code doesn't change at all.
- The **observer** is the classroom clock: it isn't rung by anyone — it reacts to a fixed
  schedule (a model being created, updated, deleted).

The shift from Lesson 124: a job is imperative ("go send this email"), an event is
declarative ("an order was created — world, do what you will").

## 3. Visual Flow

```text
   ORDER CONTROLLER                       THE EVENT BUS
   ┌──────────────────────┐               ┌─────────────────────────────┐
   │ Order::create(...)   │               │  dispatch(new OrderCreated) │
   │ event(...) / dispatch │─────────────▶│  ORDER CREATED              │
   │ return 201           │               │        │                     │
   └──────────────────────┘               │        ├─▶ SendOrderEmail  (sync)  │
                                          │        ├─▶ UpdateAnalytics (queued)│
                                          │        └─▶ NotifyAdmin     (queued)│
                                          └─────────────────────────────┘
   The controller knows nothing about email, analytics or admins.
   Each listener is one small class, added or removed independently.
```

Queued listeners are literally Lesson 124 jobs wearing an event hat — the event bus hands
them to the queue, and a worker runs them.

## 4. How It Works

Define the event (often an empty class — the fact is the payload):

```php
// php artisan make:event OrderCreated
class OrderCreated
{
    use Dispatchable;

    public function __construct(public Order $order) {}
}
```

Dispatch it, anywhere — a controller, a service, another listener:

```php
OrderCreated::dispatch($order);   // or: event(new OrderCreated($order));
```

Write a listener (note `ShouldQueue` — Lesson 124):

```php
// php artisan make:listener SendOrderEmail --event=OrderCreated
class SendOrderEmail implements ShouldQueue
{
    public $tries = 3;
    public $backoff = [1, 5, 10];

    public function handle(OrderCreated $event): void
    {
        Mail::to($event->order->email)->send(new OrderConfirmation($event->order));
    }
}
```

Tell Laravel who listens to what. The modern way — discovery — needs nothing at all:
Laravel scans `app/Listeners` and auto-wires `handle(OrderCreated $event)` to the
`OrderCreated` event. Register explicitly in `EventServiceProvider` if you prefer (or need
manual ordering):

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    OrderCreated::class => [
        SendOrderEmail::class,      // runs first, in this order
        UpdateAnalytics::class,
        NotifyAdmin::class,
    ],
];
```

Dispatching does one thing and returns immediately:

```text
dispatch(new OrderCreated($order))

  1. container resolves OrderCreated
  2. looks up its listeners  (from $listen or discovery)
  3. queues the ShouldQueue ones  →  jobs table insert
  4. runs the sync ones inline
  5. returns — nothing was returned to the caller
```

```narrate
line 1: the fact is just data — a payload, no behaviour
line 3: discovery / $listen maps event → listener classes
line 4: ShouldQueue listeners become jobs — the queue from Lesson 124
line 5: sync listeners run immediately, inside dispatch()
line 6: dispatch() returns void — an event has no "result"
```

## 5. Real Project Usage

| What happened | Listeners that might care |
|---|---|
| **OrderCreated** | Send confirmation, update analytics, notify admins, reserve stock |
| **UserRegistered** | Welcome email, audit log, assign default role |
| **PaymentSucceeded** | Receipt, ledger entry, CRM sync |
| **OrderShipped** | Tracking email, update inventory, webhook to partners |
| **PasswordReset** | Security email, revoke other sessions |

The tell: every "and then" in a controller is a candidate listener. "Create the order **and
then** email **and then** update analytics" — two of those three are listeners, and the
email should be queued (Lesson 124).

**Observers** plug into the model lifecycle, not custom events. Register them:

```php
// app/Providers/EventServiceProvider.php
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

```php
// php artisan make:observer UserObserver
class UserObserver
{
    public function creating(User $user): void { /* before INSERT */ }
    public function created(User $user): void  { /* after INSERT */ }
    public function updating(User $user): void { /* before UPDATE */ }
    public function updated(User $user): void  { /* after UPDATE */ }
    public function deleting(User $user): void { /* before DELETE */ }
    public function deleted(User $user): void  { /* after DELETE */ }
    public function restoring(User $user): void
    public function restored(User $user): void
    // also: forceDeleted, creating via only()/except() to subscribe selectively
}
```

The two "guards" — `creating`/`updating` (before) — can block by throwing or setting
fields; `created`/`updated` (after) observe the result.

## 6. Interview Explanation

> An event says "this happened" and carries the data as a payload. Listeners subscribe to
> it — each one a small class that reacts its own way, and anything implementing
> `ShouldQueue` gets handed to the queue from Lesson 124, so the reaction is fast and
> retryable. The event doesn't know who's listening, so adding a consequence never touches
> the code that caused the fact. Observers are the same idea but bound to the model
> lifecycle — `created`, `updated`, `deleted` — so you don't dispatch anything by hand;
> Eloquent fires the event for you. Both are decoupling tools: events for "what happened in
> my app", observers for "what happened to this model".

## 7. Senior-Level Insights

- **Events vs observers vs jobs is the whole question.** The clean rule: *a job is
  imperative work you order ("send this email"); an event is a fact others react to ("the
  order was created"); an observer is a fact about a model's lifecycle.* A queued listener
  is literally a job being ordered in reaction to a fact.
- **Events don't return values — and that's the feature.** A request knows its 201; the
  listeners do their own thing. If you need a result back, you don't have an event, you
  have a service call (see Lesson 130 on service layers).
- **Queued listeners get fresh state.** The `OrderCreated` payload is serialized to the
  queue, so a queued listener sees the state *at dispatch time*. Sync listeners see
  whatever is current when they run.
- **Observers are subtle: `saved` fires for both create and update** — if you only want one
  path, compare `$model->wasRecentlyCreated` inside it, or use the specific hooks.
- **Mass operations still fire model events** (`User::query()->update()` doesn't — that's a
  query, not a model). If you need events on mass updates, loop or use the model.
- **Naming a listener after its event** (`SendOrderEmail`) is the convention — it keeps
  discovery trivial and the intent visible in the filename.

> [!PITFALL]
> Sync listeners run **inside the request** — a slow listener makes the request slow,
> exactly the Lesson 124 mistake wearing a new hat. Anything touching mail, SMS, webhooks,
> or external APIs gets `ShouldQueue`; sync is for cheap, in-process consequences
> (an audit log row, updating an in-memory counter).

## 8. Common Mistakes

**Mistake 1 — using events to "return data" from a listener.** Events are fire-and-forget
by design. If you need the result, that's a service or a repository, not an event.

**Mistake 2 — assuming observers are the only way to react to models.** They're one tool.
`created` hooks are also a classic place to *forget a transaction is still open* (see
Lesson 120) — your side effect can run before the surrounding DB work is committed.

**Mistake 3 — slow sync listeners.** The controller calls `dispatch()` and pays for every
sync listener inline. SendOrderEmail without `ShouldQueue` is the queue lesson unlearned.

**Mistake 4 — duplicate logic across event and observer.** Reacting to a model change in
both `UserObserver::updated` and an `OrderCreated` listener is two code paths maintaining
the same rule.

**Mistake 5 — dispatching a model event manually inside the observer hook that fires it.**

```php
public function updated(User $user): void
{
    UserUpdated::dispatch($user);   // ❌ double-fire risk — see below
}
```

If another listener updates the model, `updated` fires again, dispatching again — an event
storm. Guard with a `isDirty` check or dedupe.

## 9. Best Practices

✅ One listener, one responsibility — "email the customer" is one class

✅ Queue anything that touches the network: `implements ShouldQueue`

✅ Let discovery wire events for you; use `$listen` when order matters

✅ Use observers for model-lifecycle facts; custom events for domain facts

✅ Keep event payloads minimal — pass the model or its ID, not a pile of data

✅ Use `isDirty()` / `wasChanged()` guards inside observers to react only to real changes

✅ Prefer `created`/`updated` (after) over the "before" hooks for side effects

❌ Don't chain event → event → event — three dispatches deep is unreadable coupling

❌ Don't put business rules in observers that also need to be triggerable from a command

❌ Don't fire model events in mass queries (`where(...)->update()`) and expect observers

## 10. Interview Questions

**Q1. Event vs job — what's the difference?**

> A job is imperative: "do this work" — it's ordered, it runs, and it's explicitly queued.
> An event is declarative: "this happened" — it's a fact carrying a payload, and any number
> of listeners react to it. A listener implementing `ShouldQueue` is a job being dispatched
> in reaction to a fact, which is why a queued listener gets all of Lesson 124's retry and
> backoff machinery.

**Q2. How do you decide between an observer and an event?**

> Observer when the trigger is the model lifecycle itself — every `User::create()` should
> hash a slug, send a welcome email, log an audit row. Event when the trigger is a domain
> fact — "order created", "payment succeeded" — which may not even map to a single model
> change. If the feature must also run from a CLI command or a service, prefer a custom
> event or a direct service call; observers are tied to model lifecycles.

**Q3. How do you make a listener async?**

> `implements ShouldQueue` — nothing else. The listener becomes a job, queued on dispatch,
> and runs in a worker with `$tries`, `$backoff`, and `$timeout` available. Laravel
> serializes the event payload to the queue, so the listener sees the state at dispatch
> time, not when it runs.

**Q4. What is event discovery?**

> Laravel scans `app/Listeners` and, if a listener's `handle()` type-hints an event class,
> registers it as a listener for that event automatically. No `$listen` array needed. You
> only add the mapping manually when you need explicit ordering or a listener for an event
> outside `app/Events`.

**Q5. What is an event subscriber?**

> A class with `subscribe($events)` that registers many listener mappings in one place —
> useful when one class handles several related events, like a payment subscriber covering
> `PaymentSucceeded`, `PaymentFailed`, and `PaymentRefunded`. The `subscribes` trait or the
> subscriber class itself can be registered as a provider. It's organization, not a new
> mechanism — under the hood they're still listeners.

**Q6. When does an observer NOT run?**

> When the change never touches the model layer. `User::query()->update([...])` and
> `DB::table('users')->update([...])` don't instantiate models, so no `updated` hook fires.
> Also — a key gotcha — a queued listener running hours later changes models on a
> *different* process with different request state; observers run wherever the model code
> runs.

**Senior follow-up: Your `OrderObserver::created` is slow and now holds up order creation.
What do you do?**

> I'd split the work by responsibility: move anything that can wait to a custom event with
> queued listeners (email, analytics, admin alerts — Lesson 124's retry/backoff now apply),
> and keep in the observer only what must happen atomically with the INSERT. Then I'd
> profile to confirm the request time dropped, and check `isDirty`/`wasRecentlyCreated`
> guards so the split didn't double-fire anything.

## 11. Follow-up Questions

**Do events work across queues and connections?**

> Yes — dispatching is synchronous (writes the fact), and `ShouldQueue` listeners hand the
> reaction to the queue from Lesson 124. The event itself can be dispatched from anywhere:
> controller, listener, job, command.

**What's the difference between `event()` and `dispatch()`?**

> `event(new OrderCreated($order))` — the global helper, resolves through the dispatcher.
> `OrderCreated::dispatch($order)` — the `Dispatchable` trait's static, also goes through
> the same dispatcher and supports `->onQueue()` / `->delay()` chaining. Functionally
> equivalent; `dispatch()` reads better and offers queue modifiers.

**Can an observer be queued?**

> Observers run inline on the process touching the model. You can't put an observer method
> "on the queue" directly, but you can `SomeJob::dispatch()` from inside it — which is the
> idiomatic way: the observer reacts now, the heavy reaction goes through the queue.

## 12. Comparison Table

| | **Event** | **Listener (sync)** | **Queued listener** | **Observer** |
|---|---|---|---|---|
| Trigger | `dispatch()` | An event | An event | Model lifecycle (`created`…) |
| Runs where | Caller's process | Caller's process, inline | Worker process (Lesson 124) | Model's process |
| Coupling | Zero — event doesn't know listeners | Zero — listeners subscribe | Zero + durable/retryable | Tied to the model |
| Retry/backoff | — | — | ✅ | — (dispatch a job for it) |
| Use when | Domain facts | Cheap, must-happen-now reactions | Anything slow or flaky | Model-internal lifecycle logic |

## 13. Code Example

The canonical trio — one event, three listeners, two of them queued:

```php
// app/Events/OrderCreated.php
class OrderCreated
{
    use Dispatchable;

    public function __construct(public Order $order) {}
}

// app/Listeners/SendOrderEmail.php          → implements ShouldQueue (Lesson 124)
// app/Listeners/UpdateAnalytics.php         → implements ShouldQueue
// app/Listeners/NotifyAdmin.php             → sync — an audit log row is cheap
```

A subscriber grouping the payment reactions:

```php
class PaymentEventSubscriber
{
    public function handleSucceeded(PaymentSucceeded $event): void { /* receipt */ }
    public function handleFailed(PaymentFailed $event): void        { /* flag account */ }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(PaymentSucceeded::class, [self::class, 'handleSucceeded']);
        $events->listen(PaymentFailed::class, [self::class, 'handleFailed']);
    }
}
// registered in EventServiceProvider::$subscribe (or a service provider boot)
```

An observer with a real guard:

```php
class UserObserver
{
    public function updated(User $user): void
    {
        if ($user->isDirty('email')) {
            VerifyNewEmail::dispatch($user);      // only on an actual email change
        }
    }
}
```

What that dispatches when someone changes their email:

```text
$ php artisan queue:work
[2026-03-04 10:12:03] Processing: App\Jobs\VerifyNewEmail
[2026-03-04 10:12:03] Processed:  App\Jobs\VerifyNewEmail
# and no job at all when the update touched only the name field
```

## 14. Performance Notes

- **Sync listeners cost the request their runtime.** `dispatch()` runs them inline, so a
  300 ms listener is a 300 ms response. Queue anything measurable (Lesson 124's rules).
- **Discovery is a one-time scan.** Laravel caches it; run `event:cache` in production to
  avoid re-scanning listeners on every request.
- **Queued listeners add a round-trip** (write job, worker pops it) — that's the point, but
  it means the reaction is eventually consistent with the fact. Observers running inline
  are the strongly-consistent option.
- **An observer firing inside a transaction** (Lesson 120) runs its side effects before
  commit — a queued dispatch inside an observer inherits that timing. Defer external
  effects until you're sure the transaction commits.
- **When it doesn't matter:** small apps with a few listeners — the machinery is cheap;
  the discipline (queued, single-purpose, guarded) is what scales.

## 15. Debugging Scenarios

**Scenario 1 — "my listener never runs."**

Check discovery first: is the listener in `app/Listeners` with a `handle(OrderCreated $event)`
signature that type-hints the exact event class? A wrong type-hint silently means "not a
listener for this event". Then check `ShouldQueue` — a queued listener is a job; is a
worker running (Lesson 124)? Finally `php artisan event:list` shows the live mapping:

```text
$ php artisan event:list
+------------------+------------------------------+
| Event            | Listeners                    |
+------------------+------------------------------+
| App\Events\OrderCreated | App\Listeners\SendOrderEmail   |
|                 | App\Listeners\UpdateAnalytics |
|                 | App\Listeners\NotifyAdmin     |
+------------------+------------------------------+
```

**Scenario 2 — "the observer fires twice."**

The usual cause: `saved` fires for both insert and update, or a listener that updates the
model re-triggers the hook. Use the specific hooks (`created` vs `updated`) and guard with
`isDirty()`/`wasRecentlyCreated` so re-firing is a no-op.

**Scenario 3 — "events work in dev but not in production."**

Classic discovery-cache mismatch: `php artisan event:cache` was run before a listener was
added. Re-run `event:cache` after deploy — or skip it and let discovery scan per request.

**Scenario 4 — "the event fires but the queued listener is a day late."**

It's in `failed_jobs` (Lesson 124). `php artisan queue:failed` and read the exception —
usually a payload that can't unserialize (a model that was deleted) or a listener without
the retry config it needs.

## 16. Quick Revision Notes

- Event = a fact ("order created"); listener = a reaction; observer = a reaction bound to a
  model lifecycle hook
- `OrderCreated::dispatch($order)` — the event never knows who's listening
- `ShouldQueue` on a listener = a Lesson 124 job reacting to a fact
- Discovery auto-wires `handle(EventType $e)`; `$listen` when order matters
- Subscriber = one class registering many listeners (e.g. payment events)
- Observers: `creating/created`, `updating/updated`, `deleting/deleted`, `restoring/restored`
- Guard observers with `isDirty()`; beware `saved` firing on both insert and update
- Sync listeners cost the request; queue anything slow
- Mass queries (`where()->update()`) skip model events entirely
- `event:list` / `event:cache` are your debugging and production friends

## 17. Cheat Sheet

```text
# Dispatch a fact
OrderCreated::dispatch($order);        // or event(new OrderCreated($order))

# Listeners — app/Listeners/, discovery auto-wires them
class SendOrderEmail implements ShouldQueue {      # queued → Lesson 124 machinery
    public function handle(OrderCreated $event): void { ... }
}

# Observers — bound to model lifecycle
User::observe(UserObserver::class);     # in a service provider's boot()

class UserObserver {
    public function created(User $u): void  { /* after INSERT */ }
    public function updated(User $u): void  { if ($u->isDirty('email')) { ... } }
    public function deleted(User $u): void  { /* after DELETE */ }
}

# Subscriber — one class, many listens
class PaymentSubscriber { public function subscribe(Dispatcher $e): void { $e->listen(...); } }

# Ops
php artisan event:list     # who listens to what
php artisan event:cache    # production discovery cache
php artisan make:event OrderCreated
php artisan make:listener SendOrderEmail --event=OrderCreated
php artisan make:observer UserObserver --model=User
```

## 18. Key Takeaways

> [!RECAP]
> - Events are facts; listeners react; observers react specifically to model lifecycles
> - Zero coupling: the event doesn't know its listeners, so new consequences never touch
>   the code that caused the fact
> - `ShouldQueue` makes a listener a Lesson 124 job — retry, backoff, worker
> - Sync listeners run inline and cost the request; queue anything slow
> - Observers fire automatically with the model lifecycle — no manual `dispatch()`
> - Guard observers (`isDirty`, `wasRecentlyCreated`) or `saved` will double-fire
> - Job = "do this work"; Event = "this happened" — say that sentence in any interview

## Check your understanding

Answer these without looking back.

1. Event vs job vs observer — one sentence each, and one real trigger for each.
2. What makes a listener "queued", and what machinery does it inherit from Lesson 124?
3. How does discovery wire a listener, and when do you need `$listen` instead?
4. Name the observer hooks that fire *before* a DB change and the two *after* a delete.
5. Why does `User::query()->update(...)` not trigger observers? What is the workaround?
6. What is the double-fire risk with `saved`, and how do you guard against it?
7. When would you choose a subscriber over individual listeners?
8. Why is a slow sync listener in `OrderCreated` a Lesson 124 mistake wearing a new hat?

## What's Next

**Lesson 126 — Notifications, Mail & Scheduling.** Where everything you've queued actually
goes out: notification channels, mailables, and the scheduler that replaces cron — standing
in for `queue:work` so your jobs run on a timetable.
