# Lesson 133 — Laravel API + Next.js & Payments

**Interview importance:** ⭐⭐⭐⭐⭐ — the money question: "how would you take a payment?"

This is the flip side of Lesson 132. There, Laravel rendered React pages. Here, Laravel is
the **API** a Next.js frontend talks to — and the reason to draw that line is almost always
money. Your Stripe key, your customer data, your webhook handler, your revenue: none of that
belongs in a browser bundle.

The reason the frontend exists is to be *distrusted*. A user can open DevTools and change
anything — the price, the "paid" flag, the request body. The architecture of a payment system
is built around that one fact: **never trust the frontend about money.** This lesson covers the
API side (Sanctum vs JWT, CORS, CSRF, API Resources) and then the Stripe side (Checkout vs
PaymentIntents, signed webhooks, idempotency, subscription lifecycle) — the part that separates
"built a storefront" from "built a storefront that won't leak money."

## Learning Objectives

By the end of this lesson you should be able to:

- Explain why a Next.js frontend and a Laravel API are the right split when money is involved
- Choose between Sanctum tokens and JWT for a first-party client — and defend it
- Handle CORS and explain why token auth sidesteps CSRF
- Use API Resources to standardize responses
- Explain why you never trust the frontend that a payment succeeded
- Verify a Stripe webhook signature, handle `checkout.session.completed`, and dedupe duplicate events
- Walk the subscription lifecycle: checkout → webhook → renewals → failed payments → refunds → cancellation

## 1. What is a "Laravel API + Next.js" architecture?

**Next.js owns the browser experience; Laravel owns the data, the auth, and the money. They talk over HTTP with JSON, and Laravel is the only place payment truth lives.**

```text
        BROWSER                        SERVER(S)
    ┌──────────────┐     https/JSON    ┌──────────────────────────────┐
    │  Next.js     │  ──────────────▶  │  Laravel API                 │
    │  (SSR + RSC) │                   │  · Sanctum token auth        │
    │              │◀────────────────  │  · API Resources             │
    │  renders,    │      JSON         │  · PaymentController         │
    │  navigates   │                   │  · webhook handler (Stripe)  │
    └──────────────┘                   └───────────────┬──────────────┘
                                                      │ SQL
                                                      ▼
                                            ┌───────────────────┐
                                            │  PostgreSQL       │
                                            │  users · orders   │
                                            │  subscriptions    │
                                            └───────────────────┘
```

Why this shape? Next.js handles rendering, routing, SEO (L86–91), and the interactive checkout
UI. Laravel handles everything that must be true: the user, the order, the charge. When the
frontend gets its data from an API instead of from Blade or Inertia, the two sides can deploy
independently — and the payment flow can be audited in one place.

> [!NOTE]
> Lesson 132 asked *"when should the server render the pages?"* — Inertia. This lesson asks the
> inverse: *"when should the frontend fetch the data?"* — when the API is a product, or when
> payment code must never live in a browser. Inertia and this architecture are answers to
> different questions, not competitors.

## 2. Mental Model

Three boundaries, and each one is a *trust* boundary:

| Boundary | What crosses it | Who to trust |
|---|---|---|
| Browser ↔ Next.js | rendered UI | the user can inspect everything |
| Next.js ↔ Laravel API | JSON over HTTPS | **the token** proves the client is logged in |
| Laravel ↔ Stripe | signed webhook events | **the signature** proves the event came from Stripe |

The whole lesson is the middle and the last boundary. The frontend is a *client of your API*,
like any client — and it's the least trustworthy one you have, because you don't control the
browser's code.

## 3. Visual Flow

```text
 USER clicks "Buy" in Next.js
        │
        ▼
 1. Next.js POST /api/orders { plan_id }        (Bearer: <sanctum token>)
        │
        ▼
 2. Laravel: validates, creates the Order (status: pending)
    returns JSON: { order_id, checkout_url }    ← never the raw price from the browser
        │
        ▼
 3. Browser redirects to Stripe Checkout (hosted page)
    Stripe shows the REAL price from the server
        │
        ▼
 4. Customer pays on Stripe's domain
        │
        ▼
 5. Stripe POSTs webhook: checkout.session.completed   (signed payload)
        │
        ▼
 6. Laravel verifies signature → marks Order paid → fires OrderPaid
    (maybe: creates the subscription, sends the receipt email)
        │
        ▼
 7. Next.js learns "paid" from its next API call — it never "knows" first
```

The order of events is the security model. The browser initiates (steps 1, 3) but never
*confirms* anything (step 6 is server-only). Payment truth moves Laravel → Stripe → Laravel,
and the browser is read-only by design.

## 4. How It Works — Auth: Sanctum Tokens vs JWT

For a first-party client (your own Next.js app), the honest answer is **Sanctum**. Two modes:

- **Sanctum SPA mode** — the Next.js frontend and Laravel share a cookie-based session. Same
  CSRF protection as a normal web app; works when both are on the same domain (or via a proxy).
- **Sanctum token mode** — issue a plain, opaque token stored in the `personal_access_tokens`
  table; the client sends `Authorization: Bearer <token>`. No expiry ceremony, revocable per
  token, no session storage on the API side.

```php
// routes/api.php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

```text
Request:  GET /api/user
Headers:  Authorization: Bearer 12|hE9fQcT3nN5z…   ← issued by Sanctum::createToken()

Response: 200
{ "user": { "id": 7, "name": "Ada Lovelace", "email": "ada@example.dev" } }
```

What about JWT? It has two real advantages — it's stateless (no database lookup per request,
handy for many microservices) and it can carry claims. For a single Laravel app serving your
own frontend, those don't matter, and JWT costs you:

- **Revocation is hard.** You can't delete a token server-side; you must wait for expiry or
  maintain a blocklist (which makes it stateful anyway).
- **Key management and expiry** are yours to run.
- **No fine-grained per-token control** without extra work.

The interview answer: *"For a first-party client I'd use Sanctum tokens — opaque, stored in a
DB, instantly revocable, no signing keys to manage. I'd reach for JWT only if I had a
third-party ecosystem that needed verifiable stateless tokens, or several services that all
need to trust one issuer."*

> [!TIP]
> "When would you use JWT?" is a setup question. The senior answer is *"rarely, for my own
> first-party clients"* — then list the two cases where it's genuinely the right tool. Naming
> the costs (revocation, keys, expiry) is what sounds senior, not "JWT is bad."

### CORS and CSRF

**CORS** is a *browser* policy: it decides whether JS running on `app.example.com` may read
responses from `api.example.com`. A mobile app or a server-to-server call has no CORS at all.
You configure allowed origins in `config/cors.php` — and you *don't* add `*` when credentials
or tokens are involved.

**CSRF** is about *cookies*. A cross-site request carrying a cookie needs protection (that's
the `csrf` middleware from Lesson 112). **Token auth sidesteps CSRF entirely**: there's no
cookie to hijack — the attacker would need the token itself, and tokens don't ride along with
cross-site requests. That's why `api` routes have no CSRF middleware. The whole CSRF attack
surface exists only because of ambient credentials.

```php
// config/cors.php
'allowed_origins' => [
    'https://app.example.com',   // your Next.js frontend — and nothing else
],
```

```text
Browser fetch from https://app.example.com to https://api.example.com/api/orders
  → Preflight OPTIONS (because it sends a Bearer header) → 204 with:
    Access-Control-Allow-Origin: https://app.example.com
    Access-Control-Allow-Headers: Authorization, Content-Type
  → If the origin isn't in the allow-list: response is blocked by the browser
```

> [!PITFALL]
> `allowed_origins => ['*']` with a Bearer token in localStorage is a "works locally, pwned
> later" configuration. If the app is *at least* the browser, list the origins.

## 5. Real Project Usage

- **The storefront you actually ship.** Next.js product pages + Laravel orders + Stripe.
  This exact three-piece stack is extremely common in Laravel job descriptions.
- **The "why not Inertia?" case.** Lesson 132's Inertia couples frontend and backend. When
  marketing pages need Next.js SSR/SEO, or a mobile app needs the same API, you split — and
  the API is the shared core.
- **Third-party access.** Your API is the product: a partner integrating orders, an open API.
  That's the "public API for third parties" trade-off Lesson 132 named, made concrete.

## 6. Interview Explanation

The 30-second answer to "how do you take a payment?":

> The frontend never decides anything about money. The user clicks buy, the Next.js app asks my
> Laravel API to create an order, and the API returns a Stripe Checkout URL with the price that
> *I* define server-side. The customer pays on Stripe's hosted page. Then Stripe sends a
> signed webhook to my API — I verify the signature, mark the order paid, create the
> subscription if there is one, and send the receipt. The webhook is idempotent, so a duplicate
> event can't double-charge or double-credit. The frontend finds out about the payment by
> asking the API afterwards — never by telling it.

That one paragraph contains the whole lesson. Everything below is the machinery behind it.

## 7. Senior-Level Insights

- **The threat model is "the client is a liar."** The browser can edit the price, resend
  requests, tamper with the order payload. Design every endpoint as if the client is hostile —
  it's the same browser, just with the network tab open.
- **Idempotency is a design invariant, not a nicety.** Webhooks retry; clients retry; payments
  retry. An endpoint that isn't safe to run twice will eventually be run twice.
- **Webhook = out-of-band truth.** The API response to "create order" can't confirm the
  payment — the webhook is the confirmation, and it arrives from Stripe, not from the user's
  browser. That's the pattern to draw: *initiate client-side, confirm server-side.*
- **Server Components (L86) don't make the server trusted.** RSC runs on the server, but the
  browser still posts forms and fetches. Any secret shipped to the browser is public — period.
  Stripe *secret* keys live only in Laravel; publishable keys are the only ones a browser may
  see.

## 8. Common Mistakes

❌ Trusting the frontend: "the user pressed pay, so mark the order paid." A 10-line change in
the browser can fake that.

❌ Sending the Stripe secret key to Next.js to build the Checkout session. The secret key lives
in the API; the frontend gets a *URL*.

❌ Ignoring webhook signatures — accepting any POST to `/api/webhooks/stripe`. That endpoint is
a remote code path into your billing; it must verify the `Stripe-Signature` header.

❌ Forgetting that webhook events are delivered at least once — and sometimes twice. No
idempotency guard means double-charges and double-credits.

❌ Using Checkout to *confirm* a subscription then trying to charge on your own schedule —
renewals belong to Stripe's subscription engine, not your cron.

❌ Shipping payment logic in the frontend bundle, where anyone can read it in DevTools.

## 9. Best Practices

✅ Price server-side: the API builds the Checkout session; the browser never sends a price

✅ Verify every webhook signature before touching any data

✅ Handle `checkout.session.completed` (and `invoice.payment_failed` / `customer.subscription.deleted`) explicitly

✅ Make the webhook handler idempotent — dedupe on the Stripe event id

✅ Use Checkout for first-party flows; reach for PaymentIntents only when you need custom UI

✅ Keep the secret key in the API; give the frontend only publishable keys and URLs

❌ Don't mark anything "paid" from a browser-initiated request — the webhook is the truth

## 10. Interview Questions

**Q1. Sanctum tokens or JWT for a Next.js frontend?**

> Sanctum. Opaque tokens stored in the database, instantly revocable, no signing keys or expiry
> to manage. JWT's advantages — statelessness and verifiable claims — only pay off when several
> services need to trust one issuer or a third party must verify tokens without asking us. For
> my own first-party client, Sanctum is the honest answer.

**Q2. How does token auth affect CSRF?**

> Token auth sidesteps CSRF. CSRF attacks work by riding ambient cookies on cross-site
> requests. A Bearer token isn't ambient — it's sent explicitly by our client, and a cross-site
> attacker can't read it to attach it. That's why API routes skip the `csrf` middleware.
> Sanctum's SPA mode, which does use cookies, needs the CSRF handshake back.

**Q3. Checkout vs PaymentIntents — which, and why?**

> For a first-party storefront, Checkout: Stripe hosts the page, handles cards, wallets, 3DS,
> SCA, and the PCI burden. I redirect the customer to the URL my API created. I'd use
> PaymentIntents only when I must build a fully custom payment UI and take payment on my own
> domain — that's where the SCA/3DS complexity becomes mine.

**Q4. How do you verify a webhook?**

> Stripe signs every event with the webhook secret. I compute HMAC SHA-256 over the raw payload
> using that secret, and compare it to the signature in the `Stripe-Signature` header —
> including the timestamp, to reject old replays. If it doesn't match, I return a non-2xx and
> log it. The handler never parses the payload before verifying it.

**Q5. The webhook arrives twice. How do you keep it safe?**

> The handler is idempotent. I store the Stripe event id — the unique constraint is the guard.
> When an event arrives I try to insert the id into the processed-events table; if the insert
> violates the unique constraint, the event was already handled and I return 200 without doing
> any work. A second `checkout.session.completed` for the same session can't double-credit.

**Q6. Walk the subscription lifecycle.**

> 1. Checkout: `POST /api/subscribe` → Laravel creates a Checkout session for the plan → the
>    customer pays on Stripe.
> 2. `checkout.session.completed` webhook → create the subscription record in Laravel, fire
>    `OrderPaid`, send the receipt.
> 3. Renewals are Stripe's job — it charges the saved payment method each cycle and sends
>    `invoice.paid`.
> 4. `invoice.payment_failed` → Stripe retries on its schedule; my handler marks the
>    subscription past-due, emails the customer, and can flag the account for gating.
> 5. Refunds happen in the Stripe dashboard or via API; `charge.refunded` webhook updates the
>    order status.
> 6. Cancellation: customer cancels → `customer.subscription.deleted` → I revoke access and
>    keep the data per the retention policy.

**Senior follow-up: "A customer says they paid, but our system shows pending. How do you debug it?"**

> I'd check the Stripe Dashboard first — is there a successful charge for that session? If yes,
> the webhook probably failed: I'd check the Stripe webhook deliveries log for a non-2xx
> response, then replay the event from the dashboard. If my handler returned 200 but no order
> changed, the bug is in the handler's matching logic — session id vs order id — and the
> idempotency table tells me whether the event was ever marked processed. The fix, if the
> handler was wrong, is to correct the code and *replay* the event, not to hand-edit the order.

## 11. Follow-Up Questions

**"What about Next.js route handlers — could they own the Stripe call?"**

> Route handlers (L92) run server-side, so a secret key stored there never reaches the browser
> — that's legitimate. The question is where the source of truth lives. If the Stripe session
> creation lives in a Next.js route handler, the billing logic is spread across two codebases.
> For a Laravel backend I'd keep payment creation and the webhook handler in Laravel, so one
> service owns the money. Route handlers stay for orchestration the app needs locally.

**"How do you handle local webhook development?"**

> `stripe listen --forward-to localhost/api/webhooks/stripe` gives me a live local endpoint and
> prints the webhook signing secret for the local env. Then I test by triggering events in the
> Stripe CLI — including the duplicate-delivery and failure cases.

**"What if the webhook is delayed for minutes?"**

> The user paid but the app still shows pending — that's normal, and the frontend should
> reflect it. Options: the Next.js app polls the order status (cheap, bounded), or the webhook
> handler fires a broadcast that the frontend subscribes to. What I would *not* do is mark the
> order paid from the browser.

**"Do you also verify the amount from the webhook?"**

> Yes. The webhook payload includes `amount_total` and the session's metadata. My handler
> compares the amount against the order's server-side price and checks the metadata order id —
> defense in depth on top of the signature.

## 12. Comparison Table

| Decision | Option A | Option B | When A | When B |
|---|---|---|---|---|
| **Auth** | Sanctum (opaque DB tokens / SPA session) | JWT | First-party client, need revocation (L133) | Multiple services trust one issuer; third-party verifies without us |
| **CSRF** | Token auth → no CSRF surface | Cookie session → `csrf` middleware (L112) | API clients, mobile, Next.js with Bearer | Same-origin cookie apps, Sanctum SPA mode |
| **Payment** | Stripe Checkout (hosted) | PaymentIntents (custom UI) | Standard storefront; keep PCI out of our code | Custom checkout UI on our domain; we take on SCA/3DS |
| **Confirmation** | Webhook (out-of-band truth) | API response says "success" | Any money movement | Read-only data, no charge involved |
| **Frontend truth** | Poll/refetch order status after payment | Trust the browser's success callback | Correct in all cases (the browser lies) | Never — this is the anti-pattern |

## 13. Code Example — Checkout, Webhook, and an API Resource

### Building the Checkout session (API side)

```php
// app/Http/Controllers/CheckoutController.php
use Stripe\Checkout\Session as StripeSession;

public function store(SubscribeRequest $request)          // validated, authenticated (L121)
{
    $plan = Plan::findOrFail($request->validated('plan_id'));

    $session = StripeSession::create([
        'mode' => 'subscription',                         // or 'payment' for one-off
        'line_items' => [[
            'price' => $plan->stripe_price_id,            // price lives in Stripe, not the browser
            'quantity' => 1,
        ]],
        'success_url' => config('app.frontend_url') . '/account?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url'  => config('app.frontend_url') . '/pricing',
        'metadata' => [
            'user_id'  => $request->user()->id,
            'plan_id'  => $plan->id,
        ],
        'client_reference_id' => (string) $request->user()->id,
    ]);

    return response()->json([
        'checkout_url' => $session->url,                  // the browser only ever gets THIS
    ], 201);
}
```

```text
POST /api/subscribe   Authorization: Bearer 12|hE9…

201 Created
{ "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_a1B2c3D4e5F6…" }
```

```narrate
3: The price reference is a Stripe Price ID from our DB — never a number the browser sent.
10-16: success_url carries the session id so the frontend can confirm later — but confirming is the webhook's job.
18-22: metadata and client_reference_id let the webhook join the Stripe session back to OUR order/user.
26: The API returns only a URL. The secret key never leaves the server.
```

### The webhook handler (the money truth)

```php
// routes/api.php — NO auth middleware; the signature IS the auth
Route::post('/webhooks/stripe', [WebhookController::class, 'handle']);

// app/Http/Controllers/WebhookController.php
use Illuminate\Support\Facades\DB;

public function handle(Request $request)
{
    $payload = $request->getContent();
    $sigHeader = $request->header('Stripe-Signature');

    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload, $sigHeader, config('services.stripe.webhook_secret')
        );                                                        // ← verify FIRST
    } catch (\UnexpectedValueException|\Stripe\Exception\SignatureVerificationException $e) {
        abort(400, 'Invalid signature');                          // reject before any work
    }

    $handled = DB::table('processed_webhook_events')             // idempotency guard
        ->insertOrIgnore(['stripe_event_id' => $event->id]);

    if (! $handled) {
        return response()->json(['status' => 'duplicate'], 200);  // already done — no-op
    }

    match ($event->type) {
        'checkout.session.completed' => $this->handleCheckoutCompleted($event),
        'invoice.payment_failed'     => $this->handlePaymentFailed($event),
        'customer.subscription.deleted' => $this->handleCancellation($event),
        default => null,                                          // unknown event: ack, ignore
    };

    return response()->json(['status' => 'ok'], 200);
}

private function handleCheckoutCompleted($event): void
{
    $session = $event->data->object;

    // 1. find OUR order via metadata / client_reference_id
    $order = Order::where('stripe_session_id', $session->id)->firstOrFail();

    // 2. the webhook says paid — THIS is the only place status flips to 'paid'
    $order->update(['status' => 'paid', 'paid_at' => now()]);

    // 3. side effects: create the subscription, send the receipt
    event(new OrderPaid($order));
}
```

```text
POST /api/webhooks/stripe   (no token — the signature is the credential)

Headers: Stripe-Signature: t=1729000000,v1=abc…def   ← HMAC over the raw body
Body:    { "id": "evt_1QxY…", "type": "checkout.session.completed",
           "data": { "object": { "id": "cs_test_…", "metadata": { "user_id": "7" } } } }

First delivery  → 200 { "status": "ok" }          + row inserted into processed_webhook_events
Same event again → 200 { "status": "duplicate" }  + insertOrIgnore found the row → no side effects
Forged body (bad signature) → 400 Invalid signature  + nothing was read as trusted data
```

```narrate
3-11: The signature check happens BEFORE anything else — a forged body dies here.
13-19: insertOrIgnore on the event id is the idempotency guard: "webhook arrives twice" is handled in three lines.
21-28: match routes each event type to a handler; unknown types are acknowledged and ignored.
30-41: The status flip to 'paid' happens only here — never in a browser-facing controller.
```

> [!DEEPDIVE]
> Why `insertOrIgnore` and not "check then insert"? Because check-then-insert has a race: two
> deliveries of the same event can both pass the check, then both insert, then both run side
> effects. A **unique constraint on the event id** turns the database into the arbiter — one
> insert wins, the other is ignored. That single constraint *is* the idempotency. Same pattern
> for your own endpoints: a `client_request_id` column with a unique index, and retries become
> safe.

### API Resources — standardizing what the client sees

```php
// app/Http/Resources/OrderResource.php
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'plan'       => $this->plan->name,
            'amount'     => $this->amount_cents,        // server truth, never the browser's number
            'status'     => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
```

```php
// app/Http/Controllers/OrderController.php
public function index(Request $request)
{
    $orders = $request->user()->orders()->latest()->get();

    return OrderResource::collection($orders);          // ::make for one, ::collection for many
}
```

```text
GET /api/orders   Authorization: Bearer 12|hE9…

200 OK
{ "data": [
    { "id": 91, "plan": "Pro", "amount": 2400, "status": "paid",
      "created_at": "2025-10-02T09:14:22+00:00" },
    { "id": 90, "plan": "Pro", "amount": 2400, "status": "pending",
      "created_at": "2025-10-01T11:02:48+00:00" }
  ] }
```

```narrate
4-9: The resource defines EXACTLY what ships — no id columns, no pivots, no internal flags leaking.
2-4: ::collection wraps each model in OrderResource — one consistent shape for every list.
7: amount is server truth in cents — a future frontend can't accidentally invent a price.
```

Why resources standardize: the controller returns `OrderResource::collection($orders)`, and no
matter which controller builds an order payload, the shape is identical — keys, types, date
format, field selection. The Next.js types (from Lesson 43, the TypeScript side) can be
generated from one canonical shape, and a consumer can't reach into internals that the resource
simply doesn't expose.

## 14. Performance Notes

- **The webhook path is latency-sensitive in a different way.** Stripe retries with backoff and
  eventually gives up. A handler that's slow to acknowledge (e.g. doing a 2-second email send
  inline) pushes Stripe into retry loops. Acknowledge fast (200), then dispatch the work to a
  queue (L123) — `OrderPaid` should be a queued event.
- **CORS preflights double the request count for cross-origin POSTs.** The browser sends an
  `OPTIONS` before every `Authorization`-bearing request. Keep the CORS middleware cheap and
  cache preflight responses where your edge allows.
- **The API's own hot paths** are the Lesson 115–117 ones: eager loading (no N+1 on order
  lists), pagination, index the `stripe_session_id` and `stripe_event_id` columns — both are
  lookup keys in the flow above.
- **Never cache money state aggressively.** Order status can be cached for reads (L126) with a
  short TTL, but the webhook handler must read the fresh row — a stale "pending" that a cache
  returns after a webhook flipped it to "paid" is a support ticket generator.

## 15. Debugging Scenarios

| Symptom | Likely cause | The move |
|---|---|---|
| "Payment succeeded" but order stays pending | Webhook not reaching the handler | Check the Stripe Dashboard → Webhooks → deliveries for the non-2xx; replay the event |
| Webhook handler runs but no order updates | Metadata/session-id mismatch — event can't find our order | Verify `client_reference_id`/`metadata` on the session; log the matched keys |
| Double charge / double credit | No idempotency guard, or check-then-insert race | Add the unique `stripe_event_id` constraint and `insertOrIgnore` |
| Browser gets CORS error on the API | Origin not in `allowed_origins`, or missing `Authorization` header allowance | Inspect the preflight response; add the exact frontend origin |
| Forged webhook reaches the handler | Signature check missing or bypassed | `Webhook::constructEvent` with the secret, on the raw body, before parsing |
| Token works in Postman, fails in the browser | Credentials/header setup — token not attached, or CORS preflight blocked | Check the request headers and the preflight; Sanctum token belongs in `Authorization` |
| Webhook "succeeds" but is slow, Stripe keeps retrying | Inline side effects (emails, long writes) blocking the ack | Return 200 fast; dispatch `OrderPaid` to a queue (L123) |

## 16. Quick Revision Notes

- Next.js renders; **Laravel owns data, auth, and money**; the frontend is a client of the API
- Auth: **Sanctum for first-party clients** (opaque, revocable, DB-stored); JWT only for
  verifiable stateless tokens across services
- CORS is a browser policy (allow-list your origins); **token auth sidesteps CSRF** — no
  ambient cookie, no `csrf` middleware on `api` routes
- **API Resources** (`::make` / `::collection`) standardize every response shape
- Checkout for hosted payments; PaymentIntents only for custom UI
- **Never trust the frontend about money** — initiate client-side, confirm server-side
- Webhooks: **verify the signature first**, handle `checkout.session.completed`, make the
  handler **idempotent** (unique constraint on the event id)
- Subscriptions: renewals are Stripe's engine; handle `payment_failed` and `deleted` explicitly
- Refunds via Stripe → `charge.refunded` webhook → update the order

## 17. Cheat Sheet

```text
THE FLOW          browser → POST /api/orders → Laravel builds Checkout session
                  → Stripe hosts payment → signed webhook → Laravel marks paid
                  → frontend polls the API for truth

AUTH              Sanctum token:  Authorization: Bearer <token>    (revocable)
                  JWT: only when services must verify without asking us
CSRF              token auth → no CSRF surface; cookie sessions → csrf middleware (L112)

WEBHOOK (order matters)
                  1 verify signature  (Webhook::constructEvent, raw body)
                  2 idempotency guard (unique stripe_event_id, insertOrIgnore)
                  3 match event type  (checkout.session.completed → paid)
                  4 ack fast 200,     queue the side effects (L123)

NEVER              price from the browser ▸ secret key to the frontend ▸
                  "paid" from a client request ▸ parse before verifying

RESOURCES          OrderResource::make($o)  /  OrderResource::collection($os)
```

## 18. Key Takeaways

> [!RECAP]
> - The architecture: **Next.js owns the browser, Laravel owns the API, PostgreSQL owns the
>   data** — and only Laravel talks to Stripe
> - Auth: **Sanctum tokens for first-party clients** — the honest answer; JWT only when
>   stateless, verifiable tokens across services are a real requirement
> - **CORS** is a browser allow-list; **token auth sidesteps CSRF** because there's no ambient
>   cookie for an attacker to ride
> - **API Resources** (`UserResource::make` / `::collection`) standardize responses — one shape,
>   one contract, typed client-side
> - **Never trust the frontend about money**: the browser initiates, the server confirms, via a
>   signed Stripe webhook
> - Webhook discipline: **verify the signature, handle `checkout.session.completed`, ack fast**,
>   and make the handler **idempotent** — a unique constraint on the event id makes "the webhook
>   arrives twice" a non-event
> - The subscription lifecycle is a small state machine: paid → renewals (Stripe) → failed
>   payment (past-due) → refunded → cancelled — each transition driven by a webhook, not a browser
> - **Promise combinators (L26) and server-component thinking (L86)** carry over: the async
>   flow between Next.js, Laravel, and Stripe is just the async mental model from Module 1, at
>   system scale

## Check your understanding

Answer these without looking back.

1. Draw the full payment flow — every hop from "user clicks buy" to "order marked paid."
2. Why is the frontend "distrusted"? Name three things a user with DevTools can change.
3. Defend Sanctum over JWT for a first-party client — and name the case where you'd switch.
4. Why does token auth make CSRF a non-issue?
5. What do API Resources standardize, and what do they prevent leaking?
6. List the four webhook rules in order, and what each one stops.
7. Explain idempotency: why check-then-insert is racy, and what the unique constraint guarantees.
8. Walk the subscription lifecycle — including the two failure/cancellation paths.

## What's Next

**Lesson 134 — Multi-Tenancy & System Design.** The capstone: the three tenant architectures,
how data leaks between tenants, and the system-design prompts — design a SaaS, a chat, a
notification system, an API at 1M requests/day, a multi-tenant Laravel app — that decide the
offer.