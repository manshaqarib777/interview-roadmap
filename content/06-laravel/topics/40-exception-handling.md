# Topic 40 — Exception Handling

**Checklist anchor:** exceptions · global exception handling · custom exceptions · HTTP exceptions · rendering · reporting · logging · API error responses

**Owning lessons:** [131 Laravel Performance & Deployment](../131-performance-deployment.md) · [133 Laravel API + Next.js & Payments](../133-api-nextjs-stripe.md)

---

## The one-sentence answer

**Exception handling is the single place every failure meets its fate — `report()` decides what's logged, `render()` decides what the client sees, and custom exceptions turn thrown errors into precise HTTP responses.**

## The mental model

Every thrown exception funnels to one place: the **exception handler**.

```text
controller throws PaymentFailed
        │
        ▼
Exception Handler (app/Exceptions/Handler)
   ├─ report(): log it? → yes, with context (Lesson 39)
   ├─ render():  HTTP response? → { message, errors } shape (Lesson 25)
   └─ unhandled  → 500, logged, generic message (no internals leaked)
```

The handler is the **single exit door** — which is why API error consistency (Lesson 23) is implemented there, once, for every endpoint.

## How it works

### The handler

```php
// app/Exceptions/Handler.php (or the boot method)
class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (PaymentFailed $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Payment failed',
                    'errors'  => ['payment' => [$e->getMessage()]],
                ], 422);
            }
            return back()->withErrors(['payment' => $e->getMessage()]);
        });

        $this->reportable(function (PaymentFailed $e) {
            Log::critical('payment failure', ['order_id' => $e->orderId]); // context
        });
    }
}
```

- **`reportable()`** — what gets logged (and how, with context).
- **`renderable()`** — what the client receives (web vs API shapes).
- **`shouldReport()`** — some exceptions are expected and shouldn't log as errors.

### Custom exceptions

```php
class PaymentFailed extends Exception
{
    public function __construct(public int $orderId, string $message)
    {
        parent::__construct($message);
    }
}
```

Throw it with meaning: `throw new PaymentFailed($order->id, 'card declined')` — the handler now has the context it needs for both the log and the response.

### HTTP exceptions

```php
abort(404);                                  // NotFoundHttpException
abort_unless($can, 403);                     // AccessDeniedHttpException
throw ValidationException::withMessages([...]); // 422 + errors (what validate() does)
```

Each maps to the right status code and message automatically (Lesson 25).

### Reporting vs rendering

| | `report()` | `render()` |
|---|---|---|
| Job | Decide the **log trail** | Decide the **HTTP response** |
| Output | Logs, metrics, alerting (Lesson 39) | JSON/redirect/error page |
| Never-run case | Expected exceptions (`shouldReport()` false) | n/a — always renders |

The split matters: a `ValidationException` shouldn't log as an error (expected, client-caused), but must render a clean 422. A `PaymentFailed` should log critically *and* render a useful message.

### API error responses — the consistent shape

```php
$this->renderable(function (\Throwable $e, Request $request) {
    if ($request->is('api/*')) {
        return response()->json([
            'message' => $e->getMessage() ?: 'Server Error',
            'errors'  => method_exists($e, 'errors') ? $e->errors() : (object) [],
        ], $e instanceof HttpException ? $e->getStatusCode() : 500);
    }
});
```

One shape, every endpoint — the API contract's error clause (Lesson 23).

## Interview questions

**Q1. What is the exception handler?**
> The single place every uncaught exception lands. `register()` wires `reportable()` callbacks — how it's logged — and `renderable()` callbacks — what the client sees. It's where error *consistency* lives: one `renderable` for API shape means every endpoint returns the same error JSON.

**Q2. What are custom exceptions for?**
> Turning "something failed" into a *named, contextual* failure. `PaymentFailed` with an `orderId` property lets the handler log with context (`order_id`) and render a precise message and status. Custom exceptions are the vocabulary of your domain's failures.

**Q3. `report()` vs `render()`?**
> `report()` decides the log trail — what's recorded, at what level, with what context. `render()` decides the HTTP response — status code and body. The same exception can report critically (a payment failure) while rendering a clean client message. `shouldReport()` can suppress logging for expected exceptions (validation).

**Q4. How do you handle API exceptions consistently?**
> A `renderable` for `\Throwable` that checks `$request->is('api/*')` and returns the standard shape — `{ message, errors }` with the right status (422 validation, 403 authz, 500 default). Every error then looks the same to the client, and web requests keep their own redirect/error-page path.

**Q5. What should a 500 response contain?**
> A generic message — "Server Error" — never the exception message or stack trace. Internals are a leak surface (Lesson 37); the detail belongs in the log (`report()` with context), where the team can read it. The client gets a safe, consistent envelope.

**Senior follow-up: How do you handle expected vs unexpected exceptions?**
> The distinction is the senior skill. Expected failures — validation, "card declined," "not found" — are **flow control**: render clean responses, don't log as errors (`shouldReport` false). Unexpected failures — a null where data should exist, a dead DB — are **incidents**: log critically with context, alert (Lesson 39), and return a generic 500. Mixing the two is how error dashboards fill with noise and real incidents get buried.

## Common mistakes

❌ Returning the raw exception message on a 500 — leaking internals to clients.

❌ Logging expected exceptions as errors — validation noise burying real failures.

❌ Scattering error handling in controllers — the handler is the single place.

❌ API and web errors shaped differently — the handler is where the shapes converge.

## Quick revision notes

- **Handler** = the single exit door for every exception
- `reportable()` = the log trail · `renderable()` = the HTTP response
- **Custom exceptions** carry context (orderId) for both
- HTTP exceptions: `abort(404/403)`, `ValidationException` → 422
- API errors: **one shape** `{ message, errors }` via a Throwable `renderable`
- 500 = **generic message client-side**, detail in the log
- Expected = flow control · unexpected = incident — don't mix the logging

## Check your understanding

1. Where does every uncaught exception end up?
2. What does a custom exception carry that a generic one can't?
3. `report()` vs `render()` — what does each own?
4. How do you keep every API error the same shape?
5. Why shouldn't a validation failure log like a payment failure?
