# Topic 71 — Laravel + Stripe

**Checklist anchor:** Stripe Checkout · payment intents · webhooks · subscription lifecycle · idempotency · failed payments · refunds · cancellation · webhook verification · **never trust the frontend — use the verified webhook**

**Owning lesson:** [133 Laravel API + Next.js & Payments](../133-api-nextjs-stripe.md)

---

## The one-sentence answer

**Stripe payments work on one rule — the server verifies everything through Stripe, and the webhook is the source of truth: the frontend's "payment succeeded" is a claim, not a fact.**

## The mental model

```text
Frontend (Next.js/React)
   │  "create a checkout session" → gets a session id
   ▼
Laravel API ──► Stripe (Checkout / PaymentIntent)
   │
   ▼  Stripe verifies the payment → sends a WEBHOOK
Laravel webhook handler ──► mark the order paid (the ONLY truth)
```

The senior rule from the checklist: **never rely solely on the frontend saying payment succeeded.** The frontend can be forged, refreshed mid-flow, or lied to — the webhook is Stripe's *verified* word that money moved. The order is marked paid in the webhook handler, not in the browser callback.

## How it works

### 1. Checkout — create the session server-side

```php
// the API creates the Checkout Session — the client only gets the redirect URL/id:
public function checkout(Request $request)
{
    $checkout = Stripe::checkout()->sessions->create([
        'line_items' => [...],
        'mode' => 'payment',                          // or 'subscription'
        'success_url' => route('checkout.success'),
        'cancel_url' => route('checkout.cancel'),
        'metadata' => ['order_id' => $order->id],     // the link back to your order
    ]);

    return response()->json(['url' => $checkout->url]);
}
```

The client redirects to Stripe's hosted page — you never handle card data.

### 2. Payment Intents — the API-driven flow

For a custom checkout UI, `PaymentIntent` is the server-side object:

```php
$intent = Stripe::paymentIntents()->create([
    'amount' => $order->total_cents,
    'currency' => 'usd',
    'metadata' => ['order_id' => $order->id],
    'automatic_payment_methods' => ['enabled' => true],
]);
return response()->json(['client_secret' => $intent->client_secret]);
// the frontend confirms the payment with the client_secret
// → and the WEBHOOK still confirms the outcome server-side
```

### 3. The webhook — the source of truth

```php
// routes/api.php — the webhook is an UNPROTECTED route (Stripe can't send a token):
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// controller:
public function handle(Request $request)
{
    // 1. VERIFY — the signature proves it's really Stripe:
    $event = Stripe::webhooks()->constructEvent(
        $request->getContent(),
        $request->header('Stripe-Signature'),
        config('services.stripe.webhook_secret'),
    );

    // 2. ACT on the verified event:
    match ($event->type) {
        'checkout.session.completed' => $this->markOrderPaid($event),
        'invoice.payment_failed' => $this->handleFailedPayment($event),
        'customer.subscription.deleted' => $this->cancelSubscription($event),
        default => null,
    };

    return response('ok');   // acknowledge — Stripe retries on non-2xx
}

private function markOrderPaid($event): void
{
    $orderId = $event->data->object->metadata['order_id'];

    $order = Order::where('id', $orderId)
        ->whereNull('paid_at')                    // idempotent — Lesson 64
        ->first();
    if ($order) $order->markPaid();               // the ONLY place paid_at is set
}
```

### 4. Idempotency — the webhook arrives twice (scenario 5)

```php
// the guard: only mark paid if not already paid
$order = Order::where('id', $orderId)->whereNull('paid_at')->first();
// a duplicate webhook finds paid_at set → no-op (Lesson 64's idempotency)
// plus: Stripe's own idempotency keys on the request side
```

### 5. The subscription lifecycle

```php
// events that drive subscriptions:
'customer.subscription.created'
'customer.subscription.updated'    // plan changes, renewals
'customer.subscription.deleted'    // cancellation — end access
'invoice.payment_succeeded'        // renewal charged
'invoice.payment_failed'           // → handleFailedPayment (retry, dunning)

// + failed payment handling: Stripe retries the charge automatically;
// your webhook records it and may downgrade/notify the user
```

### 6. Refunds & cancellation

```php
// refunds — from your server, via Stripe (not the frontend):
Stripe::refunds()->create(['payment_intent' => $intentId, 'amount' => $amount]);

// cancellation — Stripe sends customer.subscription.deleted →
// your webhook revokes access (the verified truth, again)
```

## Interview questions

**Q1. How do you take a payment with Laravel + Stripe?**
> Create a Checkout Session (or PaymentIntent) server-side with the amount and order metadata, return the URL/client_secret to the frontend, and let Stripe's hosted page handle the card. Then the **webhook** confirms the outcome server-side — the frontend callback is only UX, never the source of truth.

**Q2. Why must you use the webhook and not trust the frontend?**
> Because the frontend can be forged or interrupted — "payment succeeded" from the browser is a claim. The webhook carries Stripe's cryptographic signature, proving the event really happened. The order is marked paid in the webhook handler; the frontend callback only redirects the user. Verify the signature, act on the verified event.

**Q3. What's the difference between Checkout and PaymentIntent?**
> Checkout is Stripe's hosted payment page — you create the session, the client redirects, Stripe handles the card UI. PaymentIntent is the API-level payment object for a custom UI — you create the intent, return its `client_secret`, the frontend confirms with Stripe.js. Both end the same way: the webhook confirms the outcome.

**Q4. What happens when a webhook arrives twice?**
> The handler must be idempotent (Lesson 64): `whereNull('paid_at')` before marking paid, or a `firstOrCreate` on the event id. A duplicate finds the work already done and no-ops. Stripe also retries failed deliveries — the handler must be safe to run more than once by design.

**Q5. How do you handle failed payments and cancellations?**
> Failed payments: Stripe retries automatically and sends `invoice.payment_failed` — you record it, notify the user, and maybe downgrade access. Cancellation: `customer.subscription.deleted` fires — your webhook revokes access. Both flow through the same verified webhook path — Stripe's event is the truth, your handler acts on it.

**Senior follow-up: How do you handle the subscription lifecycle end to end?**
> Created → updated (plan changes/renewals) → succeeded/failed invoices → deleted. Each is a webhook event: `subscription.created/updated/deleted` and `invoice.payment_succeeded/failed`. The mapping is the design: your access logic mirrors Stripe's lifecycle, driven by verified events, with idempotency at every handler so retries and duplicates are safe. The answer that separates senior engineers: the lifecycle is *event-driven from Stripe*, not polled and not trusted from the client.

## Common mistakes

❌ Marking orders paid from the frontend callback — the forgery vector.

❌ Skipping webhook signature verification — an unauthenticated endpoint that "marks paid" is a vulnerability.

❌ Non-idempotent handlers — duplicate webhooks double-charge or double-mark.

❌ Handing card data to your server — Checkout/PaymentIntent keep you out of PCI scope.

## Quick revision notes

- **The webhook is the source of truth** — verified signature, then act
- **Checkout** = hosted page · **PaymentIntent** = custom UI — both end in the webhook
- **Verify** (`Stripe-Signature`) → **act** (`checkout.session.completed`) → **acknowledge** (2xx)
- **Idempotency**: `whereNull('paid_at')` / `firstOrCreate` — duplicates and retries are safe
- Subscriptions: `created` → `updated` → `payment_succeeded` / `payment_failed` → `deleted`
- Refunds/cancellation from **your server via Stripe**, never the client

## Check your understanding

1. Why is the frontend's "payment succeeded" not a fact?
2. What does signature verification prove, and where does it go?
3. Checkout vs PaymentIntent — when is each the right flow?
4. How does the handler survive a duplicate webhook?
5. Which Stripe events drive the subscription lifecycle?
