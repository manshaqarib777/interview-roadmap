# Topic 41 — Laravel Testing

**Checklist anchor:** unit tests · feature tests · HTTP tests · database testing (`RefreshDatabase`) · factories · seeders · mocking (Mockery, Laravel helpers)

**Owning lesson:** [129 Testing, Factories & Mocking](../129-testing.md)

---

## The one-sentence answer

**Laravel testing is layered — unit tests for isolated components, feature/HTTP tests for the app's behaviour end-to-end, with `RefreshDatabase` for a clean DB, factories for data, and fakes instead of real mail/queues/HTTP.**

## The mental model

```text
UNIT TEST      a service, a calculator, a policy — no framework, no HTTP
FEATURE TEST   a full flow: request → middleware → controller → service → DB
HTTP TEST      the feature test's I/O: get/post + status + JSON assertions
```

```php
// the feature/HTTP test shape:
test('an order can be placed', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/orders', ['items' => [['id' => 1, 'qty' => 2]]]);

    $response->assertStatus(201)
        ->assertJson(['status' => 'created']);
    $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
});
```

## How it works

### The three levels

| Test | What it tests | Cost | Example |
|---|---|---|---|
| **Unit** | One component in isolation | Fastest | `new Calculator()->add(2, 3)` — no framework |
| **Feature** | Behaviour through the app stack | Medium | A service method against a test DB |
| **HTTP** | Endpoints: request in, response out | Medium | `postJson('/api/orders')` + `assertStatus` |

Feature and HTTP tests are what Laravel is known for — `$this->get()`, `postJson()`, `actingAs()` — exercising the real routing, middleware, validation, and controller.

### Database testing — `RefreshDatabase`

```php
use RefreshDatabase;   // migrate, then wrap each test in a transaction

test('users can update their profile', function () {
    $user = User::factory()->create();
    // each test starts from a clean DB
});
```

`RefreshDatabase` runs migrations once, then **transacts each test** — fast, isolated, clean state every time. The contract: no test depends on another's data.

### Factories — data on demand

```php
$user = User::factory()->create();                          // one user
$user = User::factory()->count(5)->create();                // five
$user = User::factory()->has(Post::factory()->count(3))->create(); // with relations

// states:
User::factory()->admin()->create();    // a named variation
```

Factories (Lesson 42) replace hand-written fixture arrays.

### Seeders in tests

Seed only what the flow needs — a seeder for shared reference data, factories for the rest. `RefreshDatabase` + `->seed()` when the scenario depends on seeded rows.

### Mocking — fakes and Mockery

```php
// Laravel fakes — the standard, no Mockery needed:
Mail::fake();                      // capture mailables
Queue::fake();                     // capture dispatched jobs
Http::fake();                      // fake external HTTP responses
Event::fake();                     // capture fired events
Storage::fake('s3');               // fake a disk

// assert the side effect happened:
Mail::assertSent(OrderConfirmation::class);
Queue::assertPushed(SendOrderConfirmation::class);
Http::assertSent(fn ($request) => $request->url() === 'https://api.x.com/charge');

// Mockery — when you need a hand-rolled double:
$this->mock(PaymentGateway::class, function ($mock) {
    $mock->shouldReceive('charge')->once()->andReturn(true);
});
```

The rule: **fakes for framework services** (mail, queue, HTTP, events, storage), **Mockery for your own contracts** when a fake is overkill.

## Interview questions

**Q1. Unit vs feature vs HTTP tests?**
> Unit tests test one component in isolation — a calculator, a policy, a service method — with no framework. Feature tests exercise behaviour through the app stack — a service against a real (test) database. HTTP tests are the feature test's I/O form: hit an endpoint, assert on status and JSON. The pyramid is many unit tests, fewer feature/HTTP tests — each level trades speed for confidence.

**Q2. What does `RefreshDatabase` do?**
> Migrates the test database once, then wraps each test in a transaction that rolls back at the end. Every test starts from a clean, migrated schema without re-migrating per test — fast and isolated. It's the standard trait for anything touching the DB.

**Q3. How do you test a controller endpoint?**
> With an HTTP test: `$this->actingAs($user)->postJson('/api/orders', $payload)` then `assertStatus(201)` and `assertJson([...])`, plus `assertDatabaseHas('orders', [...])`. The test drives the real stack — routing, middleware, validation, controller — and asserts on the outcome.

**Q4. When do you mock, and when do you fake?**
> Prefer Laravel's fakes for framework services — `Mail::fake()`, `Queue::fake()`, `Http::fake()`, `Event::fake()`, `Storage::fake()` — they're purpose-built with assertions. Use Mockery for your own contracts/interfaces when you need fine-grained expectations (called once, returns X). Fakes where the framework offers them; Mockery where it doesn't.

**Q5. How do you test that an email was sent?**
> `Mail::fake()`, trigger the flow, then `Mail::assertSent(OrderConfirmation::class, fn ($mail) => $mail->hasTo($user->email))`. No SMTP, no real email — the fake captures the Mailable and you assert on its content and recipient.

**Senior follow-up: What makes a good test suite?**
> Tests that fail for a *reason* and are cheap to run. Each test asserts one behaviour (not "200, and also this, and also that"), uses fakes at the boundary (mail, queue, HTTP), and touches the DB through factories with `RefreshDatabase`. The senior tell: the suite tells you *what broke*, not just *that* something broke — `assertDatabaseHas`, `assertRedirectedTo`, and JSON structure assertions do that.

## Common mistakes

❌ Testing implementation, not behaviour — asserting "the method was called" instead of "the order exists."

❌ Real HTTP/mail/queue in tests — slow, flaky, external; fake them.

❌ Tests that share data — `RefreshDatabase` exists exactly so each test starts clean.

❌ One giant assertion soup — one behaviour per test, named by what it protects.

## Quick revision notes

- **Unit** (component) · **Feature** (behaviour) · **HTTP** (endpoint I/O)
- `RefreshDatabase` = migrate once, **transact per test**, clean state
- **Factories** for data · seeders for shared reference data
- **Fakes**: `Mail::fake()`, `Queue::fake()`, `Http::fake()`, `Event::fake()`, `Storage::fake()` + `assert*`
- **Mockery** for your own contracts (fine-grained expectations)
- Good suite = **fails for a reason, cheap to run**

## Check your understanding

1. Where does an HTTP test sit between unit and feature?
2. How does `RefreshDatabase` keep tests isolated and fast?
3. When do you pick a fake over Mockery?
4. How do you assert an email was sent with the right recipient?
5. What's the sign of a test that will mislead you?
