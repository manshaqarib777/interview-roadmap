# Topic 60 — Laravel Reverb

**Checklist anchor:** Laravel's first-party WebSocket server · the broadcast chain: Laravel → event → Reverb → WebSocket → browser

**Owning lessons:** [124 Queues & Jobs](../124-queues.md) · [59 Broadcasting & WebSockets](../59-broadcasting-websockets.md)

---

## The one-sentence answer

**Reverb is Laravel's own WebSocket server — it sits between your broadcast events and the browser, holding connections open and delivering channel messages in real time.**

## The mental model

The checklist's chain:

```text
Laravel
 ↓
Broadcast Event (ShouldBroadcast)
 ↓
Reverb          ← the WebSocket server, first-party
 ↓
WebSocket
 ↓
Browser (Echo)
```

Without Reverb, broadcasting needs a hosted service (Pusher, Ably) or third-party server. Reverb is **the WebSocket server Laravel itself maintains** — same protocol, your infrastructure, no external service.

## How it works

### Setup

```bash
composer require laravel/reverb
php artisan reverb:install
```

```php
// config/broadcasting.php — the reverb connection:
'connections' => [
    'reverb' => [
        'driver' => 'reverb',
        'key' => env('REVERB_APP_KEY'),
        'secret' => env('REVERB_APP_SECRET'),
        'apps' => [['app_id' => env('REVERB_APP_ID'), ...]],
    ],
],
```

```bash
php artisan reverb:start      # run the WebSocket server
php artisan reverb:start --host=0.0.0.0 --port=8080
```

### The broadcast chain, end to end

```text
1. Server: event(new OrderStatusChanged($order))   // a ShouldBroadcast event
2. Laravel: publishes to channel 'orders.42' via the Reverb connection
3. Reverb: the WebSocket server pushes to subscribed clients
4. Browser: Echo.private('orders.42').listen(...)  // receives + updates UI
```

Reverb speaks the **Pusher protocol**, so the existing Echo/broadcasting stack works unchanged — it's a drop-in server, not a new API.

### Configuration highlights

```php
// config/reverb.php
'apps' => [...],                  // app id, key, secret (like Pusher's credentials)
'servers' => [
    'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
    'port' => env('REVERB_SERVER_PORT', 8080),
    'max_connections' => 10000,   // scaling knob
],
'scaling' => ['enabled' => false, 'servers' => [...]],   // horizontal scaling via Redis
```

Reverb scales horizontally by adding servers **sharing Redis** — connections spread across nodes while channels stay consistent (the scaling config above).

## Reverb vs the alternatives

| | Reverb | Pusher / Ably | Socket.IO-style custom |
|---|---|---|---|
| Who runs it | **You** (first-party) | Hosted service | You (hand-rolled) |
| Cost | Your infrastructure | Per-connection fees | Your engineering time |
| Protocol | Pusher-compatible | Pusher | Custom |
| Best for | Production Laravel apps that want control | Zero-ops, instant scale | Legacy/custom needs |
| Setup | `reverb:install` + `reverb:start` | Sign up + env keys | Everything by hand |

The modern Laravel answer: **Reverb** — first-party, Pusher-compatible, scales with Redis — unless you explicitly want to avoid running a WebSocket server, in which case Pusher/Ably.

## Interview questions

**Q1. What is Reverb?**
> Laravel's first-party WebSocket server. It sits between a broadcast event and the browser: Laravel publishes to a channel, Reverb holds the WebSocket connections and pushes the message to subscribed clients (Echo). It replaces hosted services like Pusher with your own infrastructure, using the same protocol.

**Q2. How does the broadcast chain work?**
> A `ShouldBroadcast` event fires on the server; Laravel publishes it to a channel through the broadcasting connection; Reverb — the WebSocket server — delivers it to subscribed browsers over the open connection; Echo in the browser routes it to a callback that updates the UI. Laravel → event → Reverb → WebSocket → browser.

**Q3. Why does Reverb exist when Pusher does?**
> To keep WebSockets first-party. Reverb speaks the Pusher protocol, so the Echo/broadcasting stack is unchanged — but the server is yours: no per-connection fees, no external dependency, full control. You choose Reverb when you want to run it; Pusher when you'd rather not operate a WebSocket server.

**Q4. How does Reverb scale?**
> Horizontally — run multiple Reverb servers sharing Redis (`scaling.enabled`). Connections spread across nodes while channel state stays consistent through Redis. Each server has a `max_connections` knob; the Redis layer is the coherence mechanism (Lesson 34's shared store in action).

**Q5. When would you use Reverb vs a hosted service?**
> Reverb when you want first-party control — it's the modern Laravel default, free to run, Pusher-compatible. A hosted service (Pusher, Ably) when you don't want to operate the server, need instant global scale, or have a team with no WebSocket ops appetite. The protocol is the same either way.

**Senior follow-up: What are the operational considerations of running Reverb?**
> It's a long-lived connection server — plan for `max_connections` per node, Redis for horizontal scaling, TLS for WebSockets (wss), and monitoring connection counts. Also: it must sit where browsers can reach it (the `REVERB_SERVER_HOST`), and deployment restarts it like a worker (supervisor-managed, graceful restart). The protocol is the easy part; connection lifecycle is the ops story.

## Common mistakes

❌ Forgetting the browser must reach Reverb — `REVERB_SERVER_HOST`/port and CORS config.

❌ Scaling with no Redis — multiple Reverb nodes without shared Redis break channel consistency.

❌ Confusing Reverb with Echo — Echo is the browser client; Reverb is the server.

❌ Running it without TLS in production — WebSockets over plain HTTP are wss-less and vulnerable.

## Quick revision notes

- Reverb = **Laravel's first-party WebSocket server**
- Chain: Laravel → **event** → **Reverb** → **WebSocket** → **browser (Echo)**
- **Pusher-protocol compatible** — the broadcasting stack is unchanged
- `reverb:install` + `reverb:start` · scaling via **Redis** + `max_connections`
- Reverb = first-party control · Pusher = zero-ops hosted
- Echo (browser) ≠ Reverb (server) — don't confuse the halves

## Check your understanding

1. Where does Reverb sit in the broadcast chain?
2. What does "Pusher-compatible" mean for your existing Echo code?
3. How do multiple Reverb nodes stay consistent?
4. When would you still choose a hosted service over Reverb?
5. What does running Reverb in production require that Pusher handles for you?
