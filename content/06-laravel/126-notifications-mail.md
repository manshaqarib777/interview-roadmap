# Lesson 126 — Notifications, Mail & Scheduling

**Interview importance:** ⭐⭐ — the "how does this actually ship" glue layer; less theory,
more config, and the scheduler is a senior signal because it replaces cron.

Lessons 124 and 125 gave you the machinery: jobs do work, events announce facts. This
lesson is where that work finally reaches people. A **notification** is one message that
can travel down several channels — the same "order shipped" fact as an email, an SMS, a
database row, and a Slack message. A **mailable** is a purpose-built email, with Markdown
templates and attachments, ready for the queue from Lesson 124.

And because some work should happen *on a timetable* rather than in reaction to an event,
the **scheduler** stands in for cron: you declare `schedule()` rules in one PHP file, and a
single every-minute cron line (or the `schedule:work` process) turns them into dispatched
jobs — which are just Lesson 124 jobs running on a schedule.

## Learning Objectives

By the end of this lesson you should be able to:

- Send the same message through several notification channels from one class
- Explain why notifications are queueable by default and mailables are not
- Build a Markdown mailable with attachments and a template
- Configure mail drivers and switch between them
- Write `schedule()` rules and explain how the scheduler dispatches to the queue
- Choose between `withoutOverlapping`, `onOneServer`, and `runInBackground`

## 1. One-line Definition

**A notification is a message that can travel through many channels; a mailable is a
purpose-built email with a template; the scheduler is a cron replacement that turns a
one-minute tick into dispatched commands and jobs.**

One concept per sentence, and each one plugs into something you already know: channels are
the delivery mechanisms, mailables are the fanciest email, and the scheduler is `queue:work`
driven by a clock instead of an event.

## 2. Mental Model

**Notifications are a single message handed to a post office with a stamp for every
destination; mailables are a fancy letter you designed once; the scheduler is the alarm
clock that keeps ringing until someone does the chores.**

- **The notification** is the text you want heard ("your order shipped").
- **The channels** are the postmen — email, SMS, Slack, a database row — each with its own
  stamp (its own method: `toMail()`, `toDatabase()`, `toSlack()`).
- **The mailable** is the letterhead: the same design for every letter you send.
- **The scheduler** is the chore chart: "every morning at 8, check for overdue invoices";
  it rings at 8, and the chore (a command or a job) gets queued.

The through-line back to Lessons 124–125: notifications and scheduled tasks both end up as
jobs in a worker's hands. The only new thing here is *when* and *through what* they run.

## 3. Visual Flow

The notification fan-out — one class, many channels:

```text
   OrderShipped::make()                        THE NOTIFICATION
   ┌───────────────────────────────┐           ┌────────────────────────────────┐
   │ $user->notify(new OrderShipped)│──────────▶│  via(): mail, database, slack │
   └───────────────────────────────┘           │  toMail()      → email queue  │
                                              │  toDatabase()  → DB row       │
                                              │  toSlack()     → Slack API    │
                                              └────────────────────────────────┘
                                                        │
                                                        ▼
   THE SCHEDULER                       WHAT THE QUEUE LOOKS LIKE
   ┌──────────────────────────┐        ┌───────────────────────────────────────┐
   │ cron: * * * * * artisan  │        │  SendOrderShippedNotification (queued)│
   │         schedule:run     │        │  UpdateExpiredSubscriptionsJob        │
   │  └─ every morning at 8 → │───────▶│  (queued, from the schedule)          │
   │     Artisan::call(...)   │        └───────────────────────────────────────┘
   └──────────────────────────┘                  ▲ handled by workers (L124)
```

Same story twice: a trigger (an event or a clock) turns into a queued job, and a worker
from Lesson 124 delivers it. No new runtime needed.

## 4. How It Works

Create a notification; give it a `via()` list and one method per channel:

```php
// php artisan make:notification OrderShipped
class OrderShipped extends Notification
{
    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];            // every channel on this list
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your order has shipped')
            ->greeting('Hi ' . $notifiable->name)
            ->line('Your order #' . $this->order->id . ' is on the way.')
            ->action('Track order', url('/orders/' . $this->order->id));
    }

    public function toDatabase(object $notifiable): array
    {
        return ['order_id' => $this->order->id, 'status' => 'shipped'];
    }

    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)->content('Order #' . $this->order->id . ' shipped!');
    }
}
```

Send it — to a user (has a `notifiable` trait) or to a channel/route:

```php
$user->notify(new OrderShipped($order));          // Notifiable trait on User
// or: Notification::send($users, new OrderShipped($order));

// an on-demand route — for unauthenticated numbers/emails
Notification::route('mail', 'someone@example.com')
             ->route('slack', '#ops')
             ->notify(new OrderShipped($order));
```

Notifications are **queueable by default** — the `Queueable` trait is already there; add
`implements ShouldQueue` and the send becomes a job (Lesson 124):

```php
class OrderShipped extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [1, 5, 10];
    // ...
}
```

The **mail driver** decides where mail actually goes (and doubles as your test harness):

```text
MAIL_MAILER=smtp            # real delivery through an SMTP relay
MAIL_MAILER=mailpit         # local dev: catch-all inbox at localhost:8025
MAIL_MAILER=log             # writes every mail to storage/logs/laravel.log
MAIL_MAILER=array           # keeps them in memory — testing only
```

A **mailable** is the purpose-built email with its own template:

```php
// php artisan make:mail OrderConfirmation --markdown=emails.orders.confirmation
class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function build(): Mailable
    {
        return $this->from('orders@example.com', 'Example Shop')
            ->subject('Order confirmation #' . $this->order->id)
            ->attachFromStorageDisk('s3', 'invoices/' . $this->order->invoice_pdf)
            ->markdown('emails.orders.confirmation');
    }
}

Mail::to($order->email)->queue(new OrderConfirmation($order));   // queued, L124
```

And the **scheduler** — the chunk that replaces cron:

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('emails:send-reminders')->daily()->at('08:00');

    $schedule->job(new UpdateExpiredSubscriptions)->everyFifteenMinutes();

    $schedule->command('reports:generate')
        ->dailyAt('02:30')
        ->withoutOverlapping()
        ->onOneServer()
        ->runInBackground();

    $schedule->call(function () {
        Cache::forget('stats:daily');
    })->hourly();
}
```

One cron line makes it tick:

```text
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

## 5. Real Project Usage

| Feature | The Laravel tool |
|---|---|
| "Email me when my order ships" | Notification with `mail` channel |
| "Show a bell icon with unread alerts" | Notification with `database` channel |
| "Message the #ops Slack on deploy failure" | Notification with `slack` channel |
| "Send a confirmation with the invoice attached" | Mailable with Markdown + attachment |
| "Remind users who abandoned carts" | Scheduler `->dailyAt('10:00')` dispatching jobs |
| "Purge old sessions every hour" | Scheduler `->hourly()` running a command |
| "Nightly PDF report, never overlapping itself" | Scheduler `->dailyAt('02:30')->withoutOverlapping()` |

Everything on that list ends in the queue from Lesson 124 — the scheduler, notifications,
and mailables all just enqueue work.

## 6. Interview Explanation

> A notification is one message with several delivery methods — I write `via()` and a
> method per channel, then `$user->notify(...)` fans it out to email, database, and Slack.
> Adding `implements ShouldQueue` makes the whole send a queued job, so it inherits retry
> and backoff from Lesson 124. A mailable is the email-focused version: Markdown template,
> attachments, configured per message. The scheduler is how I replace cron — I declare
> `schedule()` rules like `->dailyAt('08:00')->withoutOverlapping()` in one file, a single
> every-minute cron line runs `schedule:run`, and Laravel figures out which tasks are due,
> then dispatches them to the queue.

## 7. Senior-Level Insights

- **Notifications are queueable by default; mailables are not.** A notification's send is a
  job the moment it implements `ShouldQueue`. A `Mailable` must be sent via `->queue()` or
  `->later()` — `Mail::send()` blocks the request (Lesson 124's original sin).
- **The scheduler is not a timing guarantee.** `schedule:run` is a *filter*: it checks which
  due tasks to fire *now*. If no cron line runs it, nothing ever fires. Two cron lines =
  double dispatches = the `withoutOverlapping` problem you're supposed to prevent.
- **`withoutOverlapping()` is a lock, not a timer** — it prevents a second run while the
  first is still going. Perfect for a 40-minute report on a `dailyAt('02:30')` rule.
- **`onOneServer()` needs shared state to mean anything** — it uses the cache, so on a
  multi-server setup it must be the shared cache (Redis), or every server fires the job.
- **`runInBackground()` is for long-running commands** — without it, the scheduler waits
  synchronously for the task to finish before checking the next one, which can overrun
  the one-minute tick.
- **Delayed notifications are `->delay()`** — the same queue concept from Lesson 124:
  `$user->notify((new OrderShipped($order))->delay(now()->addMinutes(15)))`.
- **Custom channels are a class with one `send()` method** — the framework's channels are
  not magic; if you need SMS via Twilio, you write one small channel class and `via()`
  returns its name.

> [!TIP]
> In development, set `MAIL_MAILER=log` (or Mailpit) and `QUEUE_CONNECTION=sync` to see
> every mail, notification, and job as plain output — before you wire real SMTP and a
> worker. That combination is the fastest way to *watch* this whole lesson run.

## 8. Common Mistakes

**Mistake 1 — using `Mail::send()` for mail that can wait.** That blocks the request on
SMTP. Use `Mail::queue()` — the entire Lesson 124 lesson, in one method call.

**Mistake 2 — forgetting the cron line.** The scheduler does nothing without
`schedule:run` being triggered every minute. "It works in my dev" usually means the
scheduler ran because `php artisan schedule:work` was running — not that production has
the cron entry.

**Mistake 3 — sensitive data in `toDatabase()`.** The database channel stores the array as
JSON in a `notifications` table. Put IDs and human-friendly text there; never secrets or
raw API responses.

**Mistake 4 — overlapping long tasks.** A report that takes 40 minutes, scheduled every
minute without `withoutOverlapping()`: now you have 40 copies of it running. The lock is
the fix, not hoping it's fast enough.

**Mistake 5 — sending to a route you can't reach.** `Notification::route('mail', ...)`
needs a real email; a typo there means a queued failure in `failed_jobs` (Lesson 124).

**Mistake 6 — a mailable that mutates shared state.** Mailables can be serialized to the
queue, and `build()` runs in the worker. Keep `build()` pure — it should only assemble
the message, not change anything.

## 9. Best Practices

✅ Use notifications when the same message needs multiple channels; mailables for
purpose-built emails

✅ Always `Mail::queue(...)` / `->queue()` for anything that can wait

✅ Make notifications `implements ShouldQueue` and set `$tries`/`$backoff`

✅ Prefer Markdown mailables — Laravel ships with responsive, tested templates

✅ Keep `toDatabase()` payloads to IDs and safe, readable text

✅ Give every repeating task `->withoutOverlapping()` and, on multi-server, `->onOneServer()`

✅ Put long tasks behind `->runInBackground()`

✅ Use `MAIL_MAILER=log`/`array` in tests and local dev — assert on what was "sent"

❌ Don't schedule a task with no cron line — that's not scheduling, that's hoping

❌ Don't attach files synchronously from a slow driver in a queued mailable

❌ Don't let notifications/mailables block the request "just this once"

## 10. Interview Questions

**Q1. Notification vs mailable — when do you use which?**

> Notifications when one message fans out across channels — the same fact as email,
> database row, and Slack from a single `via()` list. Mailables when I'm building a
> specific email: a Markdown template, attachments, a particular subject. They overlap —
> a mail channel inside a notification uses a MailMessage — but the intent differs:
> notification = multi-channel message; mailable = purpose-built email.

**Q2. How do you send an email in Laravel?**

> Build a mailable, then `Mail::to($order->email)->queue(new OrderConfirmation($order))`.
> The driver is chosen by `MAIL_MAILER` (smtp, log, array, Mailpit). `->queue()` puts it
> through the Lesson 124 queue so SMTP latency never touches the request; `->send()` is the
> sync version for tests and immediate mail.

**Q3. How does the scheduler work, exactly?**

> A single cron line runs `php artisan schedule:run` every minute. Laravel loads
> `app/Console/Kernel.php`, filters the declared tasks to those whose expression is due
> *right now*, and runs or dispatches each one. That's the whole mechanism — the cron line
> is the heartbeat, the schedule file is the plan, and the queue carries the work.

**Q4. What do `withoutOverlapping`, `onOneServer`, and `runInBackground` do?**

> `withoutOverlapping()` takes a lock so the task can't start again while a previous run
> is still going — the guard for long jobs. `onOneServer()` uses the shared cache so only
> one server in a fleet fires the task. `runInBackground()` sends long-running commands to
> the background so the scheduler doesn't block waiting for them — all three prevent the
> same class of bug: the "it runs twice because nothing stopped it" bug.

**Q5. How do you deliver a notification through a channel the framework doesn't have?**

> Write a custom channel — one class with a `send($notifiable, $notification)` method, and
> a `toX($notifiable)` method on the notification that returns what the channel needs.
> Then add the channel's name to `via()`. Channels are just contracts; that's why adding
> Twilio SMS or a WebSocket push is an afternoon, not a framework change.

**Senior follow-up: Design the nightly report that must run once, take as long as it
needs, and never double-send.**

> A `->dailyAt('02:30')` command with `->withoutOverlapping()` so a slow run can't start a
> second copy, `->onOneServer()` so the fleet doesn't all fire it, `->runInBackground()`
> so the scheduler doesn't block on the 40-minute run, and the report generation itself
> dispatched as a queued job (Lesson 124) so the command returns instantly and a worker
> handles retries. On failure it lands in `failed_jobs`, and an alert notification to
> #ops tells a human — which is exactly the `toSlack` channel from this lesson.

## 11. Follow-up Questions

**Does every notification need all its channels configured?**

> No — `via()` decides per recipient. A user with no Slack token simply doesn't get the
> Slack channel; Laravel checks what's actually available on the notifiable (the `routes`
> field for on-demand, or the notifiable's attributes for DB tokens) and skips
> unavailable ones.

**How do you test mail?**

> With the `array` driver, mail is captured in memory: `Mail::fake()` and assert on
> `Mail::assertSent(OrderConfirmation::class, fn ($mail) => ...)`. For notifications,
> `Notification::fake()` and `assertSentTo`. The fake intercepts before any channel runs —
> fast and deterministic, which is why the array driver is the production test setup.

**What's the difference between `schedule:run` and `schedule:work`?**

> `schedule:run` is the cron-triggered filter — run it every minute and due tasks fire.
> `schedule:work` is a foreground process that loops that every-minute check forever, so
> local dev doesn't need cron. Production uses `schedule:run` under cron; `schedule:work`
> is the "I don't want to configure cron" convenience.

**How do you make the scheduler wait for a specific job to finish before the next one?**

> Put them in a chain — `Bus::chain([...])` from Lesson 124 — or gate the second on the
> first's completion callback. The scheduler schedules *individual* tasks; ordering between
> them is queue work, which is where chains and batches live.

## 12. Comparison Table

| | **Notification** | **Mailable** | **Scheduler** |
|---|---|---|---|
| What it is | A multi-channel message | A purpose-built email | A cron replacement |
| Trigger | `notify()` / `Notification::send()` | `Mail::queue()` / `->send()` | `schedule:run` every minute |
| Channels | mail, database, slack, broadcast, custom | mail only | — |
| Queueable | ✅ `ShouldQueue` (default-ready) | Via `->queue()` / `->later()` | Dispatches jobs/commands |
| Template | `MailMessage` builder | Markdown / view | — |
| Runs where | Worker (if queued) | Worker (if queued) | Scheduler process → queue |

## 13. Code Example

The full delivery pipeline for one order — notification, mailable, and a scheduled
follow-up:

```php
// 1. The notification — fan-out over email + database
class OrderShipped extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [1, 5, 10];

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your order #' . $this->order->id . ' has shipped')
            ->line('It left our warehouse today.')
            ->action('Track your order', url('/orders/' . $this->order->id));
    }

    public function toDatabase(object $notifiable): array
    {
        return ['order_id' => $this->order->id, 'status' => 'shipped'];
    }
}

// 2. Trigger it from a listener (Lesson 125)
class MarkOrderShipped implements ShouldQueue
{
    public function handle(OrderShippedEvent $event): void
    {
        $event->order->user->notify(new OrderShipped($event->order));
    }
}
```

The database channel stores a row per notification — visible as the bell-icon feed:

```text
select * from notifications where notifiable_id = 42;
+----+------------+----------------------+------------------------------------------+---------------------+
| id | type       | data                 | read_at                                  | created_at          |
+----+------------+----------------------+------------------------------------------+---------------------+
| 1  | OrderShipped | {"order_id":42,...} | null                                     | 2026-03-04 10:12:03 |
+----+------------+----------------------+------------------------------------------+---------------------+
```

Now the scheduled follow-up — "nudge anyone who hasn't checked out in 3 days":

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->job(new SendAbandonedCartReminders)
        ->dailyAt('10:00')
        ->withoutOverlapping()
        ->onOneServer()
        ->runInBackground();

    $schedule->command('mail:send-reminders')->dailyAt('08:00');
}
```

Watch it tick — the scheduler is a filter over `schedule()`:

```text
$ php artisan schedule:run
No scheduled commands are ready to run.

$ php artisan schedule:run        # at 10:00:00
Running scheduled command: App\Jobs\SendAbandonedCartReminders
Finished: App\Jobs\SendAbandonedCartReminders   → handed to the queue (L124)
```

```narrate
line 1: every minute cron fires schedule:run
line 2: it filters the schedule() rules against "now" — usually nothing is due
line 4: at 10:00 the rule matches → the job is dispatched to the queue
line 5: the scheduler is done in milliseconds; the WORKER runs the job (L124)
```

## 14. Performance Notes

- **`->queue()` on mail = one job; `->send()` = one SMTP round-trip in the request.** The
  difference is the entire Lesson 124 thesis; measure response time with and without it.
- **Database notifications are a table per notification** — `read_at` queries need an
  index on `(notifiable_id, read_at)` once the feed grows.
- **Markdown mailables render server-side** and are cached per render — fine. Attachments
  from remote disks (S3) are fetched in the worker; keep them behind a queue.
- **The scheduler's per-minute cost is trivial** — a cache check for overlapping locks and
  a due-task filter. The expensive part is the tasks you let run unbounded; that's what
  `withoutOverlapping` and `runInBackground` protect.
- **When it doesn't matter:** a hobby site mailing a dozen confirmations a day on `sync`
  and `array` — the tools still apply, but nothing here will be the bottleneck.

## 15. Debugging Scenarios

**Scenario 1 — "no emails arrive anywhere."**

Check the driver first: `MAIL_MAILER=log` writes to `storage/logs/laravel.log`;
`array` keeps them in memory (so "sent" but gone); `mailpit` has a web inbox. Then check
`QUEUE_CONNECTION` — a queued mailable with no worker running is a job waiting forever
(Lesson 124). `php artisan queue:work --once` is the one-shot diagnostic.

**Scenario 2 — "the scheduled job never fires."**

Verify the cron line exists and runs (`* * * * *`), then
`php artisan schedule:list` — it prints every declared task and its next due time. If the
rule never appears, it's not in `schedule()`; if it appears but never fires, check
`withoutOverlapping` (a stuck lock — clear the cache) and `onOneServer` (wrong cache driver).

**Scenario 3 — "the nightly report ran three times last night."**

That's the missing-lock triad: no `withoutOverlapping()` plus three cron hosts or a
re-run. Add `->withoutOverlapping()` and `->onOneServer()`. If it *still* double-fires,
check whether the lock lives in the shared cache (Redis), not a per-server file cache.

**Scenario 4 — "the Slack notification goes out, but emails don't."**

`via()` lists both, so each channel is independent — the mail channel failed. Check the
mail driver (SMTP creds), then `php artisan queue:failed` for the mail job's exception.
The Slack channel succeeding tells you the notification itself is fine; the channel is
the problem.

## 16. Quick Revision Notes

- Notification = one message, many channels via `via()`
- Mailable = purpose-built email: Markdown, attachments, subject, from
- `ShouldQueue` on a notification → a Lesson 124 job; `Mail::queue()` for mailables
- Channels: mail, database, slack, broadcast, and custom classes with `send()`
- Scheduler = cron replacement: one `schedule:run` cron line filters `schedule()` per minute
- `->daily()->at('08:00')`, `->hourly()`, `->everyFifteenMinutes()`, `->dailyAt('02:30')`
- `withoutOverlapping` = lock against a second run; `onOneServer` = one of the fleet;
  `runInBackground` = don't block the scheduler
- Delayed notification = `->delay()` (Lesson 124's concept)
- `schedule:list` shows tasks and next runs; `schedule:run` shows what fired
- Drivers: smtp / log / array / mailpit — the switch is one env var

## 17. Cheat Sheet

```text
# Notifications
php artisan make:notification OrderShipped
class OrderShipped extends Notification implements ShouldQueue {
    public function via($n) { return ['mail', 'database', 'slack']; }
    public function toMail($n)    { return (new MailMessage)->line('...')->action('...', url('/')); }
    public function toDatabase($n) { return ['order_id' => 42]; }
}
$user->notify(new OrderShipped($order));
Notification::route('mail', 'x@y.z')->notify(new OrderShipped($order));

# Mailables
php artisan make:mail OrderConfirmation --markdown=emails.orders.confirmation
Mail::to($order->email)->queue(new OrderConfirmation($order));   # queue, never send()
# MAIL_MAILER = smtp | log | array | mailpit

# Scheduler — app/Console/Kernel.php
$schedule->command('emails:send')->daily()->at('08:00');
$schedule->job(new UpdateSubs)->everyFifteenMinutes();
$schedule->command('report:gen')->dailyAt('02:30')->withoutOverlapping()->onOneServer()->runInBackground();
$schedule->call(fn () => cache()->forget('x'))->hourly();

# The one cron line
* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1

# Ops
php artisan schedule:list
php artisan schedule:run
php artisan queue:failed      # where broken mail/notifications land
```

## 18. Key Takeaways

> [!RECAP]
> - Notifications fan one message across many channels from a single `via()` list
> - Mailables are purpose-built emails — Markdown, attachments, per-message config
> - Notifications are queueable by default; mailables only via `->queue()` — never block
>   a request on SMTP (Lesson 124)
> - The scheduler replaces cron: one per-minute `schedule:run` filters your `schedule()`
>   rules and dispatches due work to the queue
> - `withoutOverlapping()`, `onOneServer()`, `runInBackground()` are the senior trio —
>   they prevent "ran twice" the same way retries/backoff prevent "lost work"
> - Custom channels are just classes with `send()` — the framework's channels are a
>   contract, not magic
> - Every delivery path ends in the queue and worker from Lesson 124 — nothing new to run

## Check your understanding

Answer these without looking back.

1. Notification vs mailable — one sentence each, and the trigger for each.
2. How does `via()` work, and what happens to a channel a user can't receive?
3. Why is a notification queueable "by default" but a mailable is not — and what's the
   one method call that fixes a mailable?
4. Name the mail drivers and what each is for.
5. Draw the scheduler flow from cron line to worker. Where does `schedule:run` sit?
6. What do `withoutOverlapping`, `onOneServer`, and `runInBackground` each prevent?
7. Why does `schedule:run` need a cron line at all? What happens without it?
8. How would you add an SMS channel the framework doesn't ship?

## What's Next

**Lesson 127 — Caching & Redis.** Every job in this module has a memory: the queue store,
the scheduler locks, the throttle buckets. Lesson 127 is that memory, done properly —
cache drivers, TTL, tags, `remember()`, and why Redis beats the database for hot ephemeral
data.
