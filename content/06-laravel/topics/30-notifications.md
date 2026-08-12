# Topic 30 — Notifications

**Checklist anchor:** mail · database · Slack · broadcast · custom channels · notification queues

**Owning lesson:** [126 Notifications, Mail & Scheduling](../126-notifications-mail.md)

---

## The one-sentence answer

**Notifications are a single, channel-agnostic way to tell a user something — one notification, sent through mail, database, Slack, SMS, or broadcast, whichever channels you enable.**

## The mental model

One event, many delivery channels:

```text
OrderShipped (notification)
   ├─ Mail channel      →  email
   ├─ Database channel  →  notifications table (in-app bell)
   ├─ Slack channel     →  a Slack workspace
   └─ Broadcast channel →  real-time push (WebSockets, Lesson 59)
```

The power: the *sender* says "notify this user," and the **channels** decide how. Add a channel without changing the code that sends — and `via()` lets each notification choose its channels.

## How it works

### The notification

```php
php artisan make:notification OrderShipped
```

```php
class OrderShipped extends Notification
{
    public function __construct(public Order $order) {}

    // which channels should this use?
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];   // email + in-app bell
    }

    // one method per channel:
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your order shipped')
            ->line('Order #'.$this->order->number.' is on its way.')
            ->action('Track order', url('/orders/'.$this->order->id));
    }

    public function toDatabase(object $notifiable): array
    {
        return ['order_id' => $this->order->id, 'status' => 'shipped'];
    }

    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)->content('Order shipped: #'.$this->order->number);
    }
}
```

### Sending

```php
$user->notify(new OrderShipped($order));        // via the user's preferred channels

// to many users:
Notification::send($users, new OrderShipped($order));
```

### The channels

| Channel | Where it goes | When |
|---|---|---|
| `mail` | Email (`toMail`) | The default "send them an email" |
| `database` | `notifications` table (`toDatabase`) | In-app notification bell |
| `Slack` | A Slack workspace | Team alerts, ops |
| `Broadcast` | Real-time WebSockets (`toBroadcast`) | Live push to the UI (Lesson 59) |
| **Custom** | Your own `toX() + channel class` | SMS, push, anything |

### Queued notifications — the standard shape

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Notification implements ShouldQueue
{
    // implements ShouldQueue → sent on a worker, not in the request
}
```

Email/Slack/SMS are all side effects with latency — **queued by default** in real apps, so the request returns before any of them are delivered (Lesson 26).

### The `notifiable`

Any model with the `Notifiable` trait can receive notifications — `User` has it by default. That's what `$user->notify()` means: the user is a *notifiable*.

## Interview questions

**Q1. What is a notification?**
> A channel-agnostic "something you should know" sent to a notifiable (usually a user). One notification class defines `via()` (the channels) and a `toMail`/`toDatabase`/`toSlack`/`toBroadcast` method per channel. The sender doesn't choose the delivery — the notification and the user's setup do.

**Q2. How do you send a notification?**
> `$user->notify(new OrderShipped($order))` — the notifiable runs each channel in `via()`. For many users, `Notification::send($users, $notification)`. The sender is one line; the channels are configured in the notification.

**Q3. What are the channels?**
> Mail (email), database (an in-app `notifications` table), Slack (workspace message), broadcast (real-time via WebSockets), and custom channels (SMS, push) you write yourself. `via()` picks which apply per notification — and a single notification can use several at once.

**Q4. When should notifications be queued?**
> Almost always. Email, Slack, and SMS are side effects with latency — `implements ShouldQueue` moves them to a worker so the request doesn't wait (Lesson 26). Database-channel writes are cheap enough to stay sync; the network-bound channels should be queued.

**Q5. What is a custom channel?**
> When the built-in channels don't fit — SMS, push, a chat API. You write a channel class (`send($notifiable, $notification)`) that calls the notification's `toX()` method, then add `X` to `via()`. The notification shape stays the same; the channel is a new transport.

**Senior follow-up: How do you rate-limit notifications?**
> Per-notification `$rateLimit` and `$cooldown` properties, or a throttle on the channel. The senior concern: a broadcast email to 100k users is a mail-server event. `Notification::send` with rate limits, or chunked sends through a queue with backoff, keeps the provider alive.

## Common mistakes

❌ Sending network-bound notifications synchronously — the request waits on SMTP/Slack.

❌ Forgetting `via()` — a notification with no channels sends nothing.

❌ Using the database channel for high-volume noise — the bell table grows; mark-as-read and purge.

❌ One channel per notification when several fit — `via()` returns an array for a reason.

## Quick revision notes

- Notification = **one event, many channels** — `via()` picks them
- `$user->notify(...)` / `Notification::send($users, ...)`
- Channels: **mail · database · Slack · broadcast · custom**
- One `toX()` method per channel
- `implements ShouldQueue` → sent on a worker — the standard for network channels
- **Notifiable** = any model with the trait (User by default)

## Check your understanding

1. What does `via()` decide, and how is it used?
2. How do you send to a single user vs many users?
3. When would you write a custom channel?
4. Why are notifications queued by default in real apps?
5. What's a notifiable, and why does User have it?
