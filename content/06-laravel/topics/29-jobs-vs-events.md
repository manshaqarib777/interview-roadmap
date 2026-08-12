# Topic 29 — Jobs vs Events

**Checklist anchor:** the difference · "execute a specific piece of work" vs "something happened in the system"

**Owning lesson:** [125 Events, Listeners & Observers](../125-events-observers.md)

---

## The one-sentence answer

**A job is a command — "do this specific work" — while an event is an announcement — "this happened" — and the difference is *intent*, which decides how you wire them.**

## The mental model

The checklist's crisp pair:

> **Job** — Execute a specific piece of work.
> **Event** — Something happened in the system.

```text
JOB:  SendOrderConfirmation::dispatch($order)
      → "DO this." One piece of work, one handler. The dispatch is the command.

EVENT: event(new OrderCreated($order))
       → "THIS happened." Zero or many reactions, attached by listeners.
       → The announcer doesn't know or care who reacts.
```

The question that decides which you need: **"Am I telling the system to do something, or telling it that something happened?"**

## How it works

### The job — a command

```php
// "Do this one thing, in the background, exactly as specified."
ProcessPayment::dispatch($order);
// → a queue worker runs ProcessPayment's handle()
```

- One piece of work, one handler.
- The dispatcher *names the work* — it knows exactly what should happen.
- Retries/backoff/timeout are per-job (Lesson 26).

### The event — an announcement

```php
// "This happened — anyone wired up may react."
event(new OrderCreated($order));
// → every listener on OrderCreated runs, in the request or on a queue
```

- The announcer doesn't know the reactions — listeners are wired separately.
- Zero or many listeners; adding one is a config change, not an edit to the cause.
- The *same* event can drive email, analytics, and an admin alert.

### When each is right

| | Job | Event |
|---|---|---|
| Intent | **Do this** | **This happened** |
| Handlers | Exactly one | Zero or many |
| Who decides | The dispatcher | The listeners (wired separately) |
| The shape | `SendEmail::dispatch(...)` | `event(new EmailSent(...))` |
| Decoupling | Dispatch → one handler | Cause → many reactions |
| Example | Process the payment, generate the report | OrderCreated, UserRegistered |

**The overlap:** a listener can dispatch a job (the reaction *is* work), and a job can fire an event (the work produced an outcome). They're not competing — they're two layers: events for "announce", jobs for "execute."

## The plain-JS model (what the exercise does)

```js
// JOB — direct command, one recipient:
const job = { do: () => processPayment(order) };
job.do();

// EVENT — broadcast, unknown recipients:
const bus = [];
function emit(event) { bus.forEach((l) => l(event)); }  // all listeners react
emit({ type: 'ORDER_CREATED', order });                 // who reacts? whoever's wired
```

## Interview questions

**Q1. What's the difference between a job and an event?**
> Intent. A job is a command — "do this specific piece of work" — dispatched to exactly one handler, like `SendOrderConfirmation::dispatch($order)`. An event is an announcement — "something happened" — broadcast to whatever listeners are wired, like `event(new OrderCreated($order))`. The job names the work; the event lets the system decide who reacts.

**Q2. When would you use a job instead of an event?**
> When you're commanding one specific piece of work — process this payment, generate this report, send this email. You know exactly what must happen, so you dispatch the job. An event is for when the outcome has reactions you want decoupled — the order was created, so email, analytics, and admin alerts should react without the order code knowing about them.

**Q3. Can they combine?**
> Yes. A listener can dispatch a job — the reaction to "order created" is the work of sending the email, so the listener queues a job. And a job can fire an event — the payment job finishes and announces `PaymentSucceeded` so other parts react. Events for announcing, jobs for executing; they layer naturally.

**Q4. How do you decide in a real codebase?**
> Ask: "Am I telling the system to do something, or telling it something happened?" Command → job (one handler). Announcement → event (many optional listeners). If the dispatcher shouldn't know or care about the reactions — event. If it names exactly one piece of work — job.

**Q5. When does the distinction matter operationally?**
> Retries and visibility. A job carries its own retry/backoff/timeout — a piece of work that must eventually succeed. An event's listeners each carry theirs, and a queued listener is its own job. So the choice shapes the failure story: "the payment job retries 5 times" vs "the email listener retries 3 times, analytics is best-effort."

**Senior follow-up: Where do you put the side effects?**
> The senior pattern: the domain action fires the event; listeners own the side effects. The order service creates the order and fires `OrderCreated` — it doesn't email or analyze. Listeners (usually queued) do email, analytics, notifications. That keeps the domain pure and the reactions swappable — the checklist's "reactions are config, not edits."

## Common mistakes

❌ Using an event where a job belongs — one work item with one handler becomes an unclear broadcast.

❌ Using a job where an event belongs — the cause starts knowing about every reaction.

❌ Firing events inside transactions (Lesson 15) — reactions can't be rolled back; commit, then fire.

❌ Non-queued heavy listeners — a synchronous email listener defeats the decoupling (Lesson 28).

## Quick revision notes

- **Job = command** — "do this work," one handler, `::dispatch()`
- **Event = announcement** — "this happened," many listeners, `event(new ...)`
- Decide by **intent**: do-this → job · this-happened → event
- They **layer**: listeners dispatch jobs; jobs fire events
- The choice shapes **retries & visibility** — jobs and queued listeners each carry their own
- Side effects live in **listeners**, not the domain action

## Check your understanding

1. In one sentence each: what is a job for, what is an event for?
2. What's the question that picks between them?
3. Give a real example of a listener that dispatches a job.
4. How does the choice affect the retry story?
5. Where do side effects belong in the senior pattern?
