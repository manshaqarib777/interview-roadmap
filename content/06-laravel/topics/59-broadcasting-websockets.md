# Topic 59 — Broadcasting & WebSockets

**Checklist anchor:** broadcasting · events · channels · private/presence channels · WebSockets · Laravel Echo · use cases (chat, notifications, live dashboards, real-time status)

**Owning lessons:** [125 Events, Listeners & Observers](../125-events-observers.md) · [124 Queues & Jobs](../124-queues.md)

---

## The one-sentence answer

**Broadcasting pushes server events to browsers over WebSockets in real time — an event fires on the server, a channel carries it to subscribed clients, and Echo receives it in the browser.**

## The mental model

```text
Server:  OrderStatusChanged fires
             │
             ▼
Channel 'orders.42'  ──(WebSocket)──►  Browser (Echo subscribed to orders.42)
                                          │
                                          ▼
                                    update the UI live
```

Broadcasting is the **realtime half of events** (Lesson 28). A normal event has listeners *on the server*; a broadcast event additionally publishes to a **channel** that browsers are subscribed to. The browser gets the payload over an open WebSocket and updates the UI — no polling, no page reload.

## How it works

### 1. The broadcast event

```php
class OrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('orders.'.$this->order->id)];
        // private → authorized viewers only
    }
}
```

### 2. The channel + authorization

```php
// routes/channels.php
Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return $user->orders()->whereKey($orderId)->exists();
    // who may subscribe? → the order's owner
});
```

### 3. The browser (Laravel Echo)

```js
// Echo connects over WebSocket and subscribes:
Echo.private(`orders.${orderId}`)
    .listen('OrderStatusChanged', (e) => {
        renderStatus(e.order.status);       // live UI update
    });
```

## The channel types

| Channel | Access | Use |
|---|---|---|
| **Public** (`Channel`) | Anyone subscribes | Live scores, public dashboards |
| **Private** (`PrivateChannel`) | Authorized via `Broadcast::channel()` | A user's own orders/notifications |
| **Presence** (`PresenceChannel`) | Authorized + member list | "Who's online" in a chat, collaborative presence |

## Use cases (the checklist's list)

- **Chat** — presence channels + private channels per conversation.
- **Notifications** — the broadcast channel of a notification (Lesson 30) pushes the in-app bell in real time.
- **Live dashboards** — admin panels updating from events.
- **Real-time status** — order tracking, job progress, online indicators.

## Where WebSockets fit

Broadcasting needs a **WebSocket server** to hold connections open — the "transport." Laravel doesn't ship one by default; you bring it:

- **Laravel Reverb** (Lesson 60) — Laravel's own server, the modern default.
- **Pusher** / **Ably** — hosted WebSocket services.
- **`php artisan reverb:start`** for local dev.

## Interview questions

**Q1. What is broadcasting?**
> Pushing server events to browsers in real time. A broadcast event (`ShouldBroadcast`) publishes to a channel; subscribed browsers receive it over WebSocket and update the UI — no polling. It's the realtime counterpart of events: server listeners for reactions, channels for live UI.

**Q2. What are channels, and the three kinds?**
> Channels are the broadcast address browsers subscribe to. Public — anyone. Private — authorized via `Broadcast::channel()` (the callback decides who may join). Presence — authorized *and* carries the member list, for "who's online." The channel type is the access-control story of broadcasting.

**Q3. How does authorization work for private channels?**
> `routes/channels.php` maps a channel pattern to a callback: `Broadcast::channel('orders.{id}', fn ($user, $id) => $user->orders()->whereKey($id)->exists())`. Echo requests access when subscribing; the callback decides — so a user can't subscribe to another user's orders channel.

**Q4. What is Laravel Echo?**
> The JavaScript client for broadcasting. `Echo.private('orders.42').listen('OrderStatusChanged', cb)` opens the subscription and routes events to your callback. Echo is the browser half of the WebSocket story — the server broadcasts, Echo receives.

**Q5. What are the real-world uses?**
> Chat (presence + private channels), in-app notifications (the broadcast channel pushes the bell live), live dashboards (events stream statuses), and real-time tracking (order status, job progress). The common thread: something changes on the server, and the UI must know instantly without polling.

**Senior follow-up: When would you choose WebSockets over polling?**
> When the event is **frequent, low-latency, and many clients** — chat, live status, collaborative presence. Polling wastes requests checking for changes that mostly didn't happen; a WebSocket delivers only the events, instantly. For low-frequency checks (a status you can afford a 30s delay on), polling or server-sent events may be simpler. The trade is infrastructure: WebSockets need a maintained connection layer (Reverb, Pusher) and careful scaling (Lesson 74's chat design).

## Common mistakes

❌ Broadcasting sensitive data on public channels — private + authorization is the default for user data.

❌ Forgetting `ShouldBroadcast` — a plain event never reaches the browser.

❌ No channel authorization — a private channel without the `Broadcast::channel` check is public.

❌ Polling what could be pushed — the WebSocket exists to remove the poll.

## Quick revision notes

- Broadcasting = **realtime events**: server event → channel → browser (Echo)
- `ShouldBroadcast` + `broadcastOn()` = the event side
- Channels: **public · private** (authorized) · **presence** (members)
- **Echo** = the browser client; **Reverb/Pusher** = the WebSocket server
- Uses: chat, notifications, dashboards, real-time status
- Private channels need **authorization** — never trust the client

## Check your understanding

1. What exactly does broadcasting add over a normal event?
2. How does a private channel authorize a subscriber?
3. When is a presence channel the right choice?
4. What does Echo do in the browser?
5. WebSockets vs polling — when is each the right call?
