# Topic 31 — Mail

**Checklist anchor:** mailables · markdown mail · queued mail · attachments · templates · mail drivers · configuration

**Owning lesson:** [126 Notifications, Mail & Scheduling](../126-notifications-mail.md)

---

## The one-sentence answer

**Mail in Laravel is a Mailable class — the email's content, subject, and attachments in one place — sent through a configurable driver, and queued so the request never waits on SMTP.**

## The mental model

```text
Mailable (the email: subject, view, data, attachments)
   ↓
Mailer (the driver: smtp | mailgun | postmark | log | array)
   ↓
recipient
```

The Mailable is the **email's blueprint**; the driver is the **delivery mechanism**; the config decides which driver, so switching mail providers is a `.env` change, not a code change.

## How it works

### The Mailable

```php
php artisan make:mail OrderConfirmation
```

```php
class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Order #'.$this->order->number.' confirmed');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.confirmation',   // the Blade template
            with: ['total' => $this->order->total],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath('/path/to/invoice.pdf')->as('invoice.pdf'),
        ];
    }
}
```

### Sending & queuing

```php
Mail::to($order->email)->send(new OrderConfirmation($order));   // sync
Mail::to($order->email)->queue(new OrderConfirmation($order));  // queued — the default in real apps
// or implement ShouldQueue on the Mailable so `send()` queues it
```

**Queued mail** is the standard: SMTP is slow, and the request shouldn't wait (Lesson 26). `Mail::queue()` or `implements ShouldQueue` sends through the worker.

### Markdown mail

```php
public function content(): Content
{
    return new Content(markdown: 'emails.orders.confirmation');
}
```

Markdown mailables render a Blade/Markdown template with the styled mail components (buttons, panels, tables) — the modern default for transactional email.

### Drivers & configuration

```php
// config/mail.php + .env:
MAIL_MAILER=smtp             // smtp | mailgun | postmark | ses | log | array
MAIL_FROM_ADDRESS=no-reply@example.com
```

| Driver | Use |
|---|---|
| `smtp` | Any SMTP provider |
| `mailgun` / `postmark` / `ses` | Provider-native APIs (webhooks, analytics) |
| `log` | Writes to the log — dev |
| `array` | Collects for tests (assert against `Mail::fake()`) |

### Testing

```php
Mail::fake();
Mail::to($user)->send(new OrderConfirmation($order));
Mail::assertSent(OrderConfirmation::class);
```

## Interview questions

**Q1. What is a Mailable?**
> A class that defines one email — its subject (`envelope()`), content (`content()` — a Blade view with data, or Markdown), and attachments. Sending is `Mail::to($email)->send(new OrderConfirmation($order))`. It's the email's blueprint, kept with the app instead of scattered in controllers.

**Q2. How do you queue mail, and why?**
> `Mail::queue(...)` or `implements ShouldQueue` on the Mailable. SMTP is slow and flaky — sending synchronously makes the request wait on the mail server, and a failure breaks the checkout. Queued, the request returns instantly and a worker delivers with retries (Lesson 26).

**Q3. What is Markdown mail?**
> A Markdown-flavoured Mailable — `new Content(markdown: 'emails.orders.confirmation')` — rendered with Laravel's styled mail components (buttons, panels, tables) instead of hand-rolled table HTML. It's the modern default for transactional email: readable templates with consistent styling.

**Q4. How do attachments work?**
> The Mailable's `attachments()` returns `Attachment::fromPath($path)->as('name.pdf')` (also `fromStorage`, `fromData`). Attachments are declared with the email, so every send of that Mailable carries them.

**Q5. How do mail drivers work?**
> `config/mail.php` maps the default mailer to a driver — smtp, mailgun, postmark, ses, log, array. Switching providers is changing `MAIL_MAILER`, not code. `log`/`array` are dev/test drivers: `Mail::fake()` in tests captures mailables for assertions without a real provider.

**Senior follow-up: How do you handle a failed email?**
> Queued mail retries per the Mailable's `$tries`/`$backoff`, then lands in failed jobs (Lesson 26). For critical mail — receipts, password resets — add a fallback: a notification channel, an admin alert, or a dead-letter record. And test the *template* rendering with `Mail::fake()` + `assertSent`, not just "an email was attempted."

## Common mistakes

❌ Sending mail synchronously in a request — the SMTP hang.

❌ Forgetting `ShouldQueue` — the queue is opt-in, and sync is the default trap.

❌ Hand-rolled HTML instead of Markdown mailables — the styled components are the point.

❌ Using `send()` where `queue()` belongs — one word changes the request's latency story.

## Quick revision notes

- **Mailable** = the email: `envelope()` (subject) · `content()` (view/data) · `attachments()`
- **Queue it**: `Mail::queue()` or `implements ShouldQueue` — the default in real apps
- **Markdown mail** = styled components for transactional email
- Drivers: `smtp` · `mailgun`/`postmark`/`ses` · `log` (dev) · `array` (tests)
- `Mail::fake()` + `assertSent()` = the testing shape

## Check your understanding

1. What three things does a Mailable define?
2. Why is queued mail the default, not an optimization?
3. What does Markdown mail give you over hand-rolled HTML?
4. How do you attach a file, and where does the declaration live?
5. How do you test that an email was sent without SMTP?
