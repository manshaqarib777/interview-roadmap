# Lesson 129 — Testing, Factories & Mocking

**Interview importance:** 🔥 — a hard-difficulty lesson (4/5) with the highest question
frequency in the module after N+1 and queues. Testing is where "I've written Laravel"
becomes "I can be handed a production system".

Lessons 115 and 121 taught you how the pieces behave — Eloquent's SQL and validation's
rules. This lesson is how you *prove* that behaviour, and keep proving it as the code
changes. Three skills: knowing which kind of test each concern deserves (the pyramid),
making a clean database for every run (`RefreshDatabase`), and deciding what gets faked
and why.

The question that decides this interview is rarely "what does `assertSee` do" — it's
**"what would you mock, and why?"** The answer is always a boundary.

## Learning Objectives

By the end of this lesson you should be able to:

- Place a concern on the test pyramid: unit, feature, or HTTP test
- Explain what `RefreshDatabase` does to the database between tests
- Write `User::factory()->count(10)->create()` and a state from memory
- Use seeders inside tests when shared data is needed
- Say exactly what `Cache::fake()`, `Queue::fake()`, `Event::fake()`, `Mail::fake()`
  and `Http::fake()` swap out, and why that's a boundary
- Explain what to mock (and why) and what never to mock
- Walk through a feature test end to end: request → assertion → output

## 1. One-Line Definition

**Laravel testing is three speeds — unit tests for one component, feature tests for app
behaviour, HTTP tests for the endpoint — run against a database that resets itself, with
factories to build data and fakes to stand in for the outside world.**

The pyramid decides *where* the proof lives; factories and `RefreshDatabase` decide *what
the proof runs against*; the fakes decide *what the proof does not touch*.

## 2. Mental Model

The test pyramid, Laravel edition — wide at the bottom, cheap; tall at the top, slow:

- **Unit tests** are **component bench tests** — one class in isolation, no database, no
  framework. A cast, a mutator, a service method. Dozens of them, milliseconds each.
- **Feature tests** are **integration drills** — Eloquent against a real test database,
  jobs and events actually firing (unless faked). This is where most of your tests live:
  "create a user, log in, hit the route, assert the database changed."
- **HTTP tests** are **end-to-end checks** — the full request through routes, middleware,
  controllers, out to a rendered response. `$this->get('/users')->assertOk()`.
  Slower, fewer, the safety net that feature tests compose.

| Level | "I'm proving…" | Database | Cost |
|---|---|---|---|
| Unit | one class is correct in isolation | none | µs |
| Feature | the app behaves correctly | real test DB (resets) | ms |
| HTTP | the endpoint answers correctly | real test DB (resets) | ms–s |

The pyramid is a *proportion*, not a rule: the majority of tests are feature tests; unit
tests cover the pure logic; HTTP tests cover the seams. If your suite is all HTTP tests,
you're paying integration cost for unit questions.

## 3. Visual Flow

```text
   HTTP test ──► $this->get('/users')->assertOk()
      │            (routes → middleware → controller → view — full stack)
      ▼
   FEATURE test ──► act on the app, assert state
      │              User::factory()->create();
      │              $this->actingAs($user)->post('/posts', [...]);
      │              $this->assertDatabaseHas('posts', ['title' => '...']);
      │                    │
      │                    ▼  RefreshDatabase
      │              migrate once per test run  →  wrap each test in a transaction →
      │              roll back → clean slate for the next test
      ▼
   UNIT test ──► one class, no framework
                   (new TaxCalculator)->apply(99.5) === 104.97
```

## 4. How It Works

### The three test types, concretely

```php
// UNIT — one class, no framework, no database:
public function test_a_full_name_joins_first_and_last(): void
{
    $user = new User(['first_name' => 'Ada', 'last_name' => 'Lovelace']);
    $this->assertSame('Ada Lovelace', $user->full_name);
}
```

```text
$ php artisan test --filter=full_name
PASS  Tests\Unit\...  ✓ a full name joins first and last
Tests:    1 passed
```

```php
// FEATURE — real app behaviour against the real (test) database:
public function test_published_posts_are_visible(): void
{
    Post::factory()->count(3)->published()->create();

    $response = $this->get('/blog');

    $response->assertOk();
    $response->assertSee('3 posts');
}
```

```text
$ php artisan test --filter=published_posts
PASS  Tests\Feature\...  ✓ published posts are visible
Tests:    1 passed

(behind the scenes: migrations ran once, each test ran inside a transaction,
 the transaction rolled back — the next test saw an empty database again)
```

```php
// HTTP — the endpoint itself, full stack:
public function test_guests_are_redirected_from_the_dashboard(): void
{
    $this->get('/dashboard')->assertRedirect('/login');
}
```

```text
$ php artisan test --filter=guests_are_redirected
PASS  Tests\Feature\...  ✓ guests are redirected from the dashboard
Tests:    1 passed
```

```narrate
line: "unit = one class with no framework; feature = the app behaving; HTTP = the endpoint answering."
line: "all three print the same PASS lines — the difference is what they had to stand up to get there."
```

### `RefreshDatabase` — the clean-slate contract

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class PostsTest extends TestCase
{
    use RefreshDatabase;   // ← the whole deal
}
```

What it does, exactly:

```text
1. When the FIRST test starts:  php artisan migrate:fresh   (build schema once)
2. Before EACH test:            BEGIN a database transaction
3. After EACH test:             ROLL BACK the transaction
   → every test starts with an EMPTY, correctly-shaped database
   → test 1 creates 3 users; test 2 sees zero — no cleanup code, no shared-state bugs

Without RefreshDatabase:
   test order matters, counts accumulate, "works in isolation" fails in the suite.
   This is the single most common "flaky test suite" cause in Laravel apps.
```

> [!NOTE]
> `RefreshDatabase` works with any database Laravel supports — MySQL, Postgres, and
> SQLite (in-memory for tests). If your suite is slow, the usual suspects are an
> in-memory SQLite that's actually hitting disk, or seeding in every test — not the
> transaction rollback, which is cheap.

### Factories — data on demand

```php
$user = User::factory()->create();                       // one user, sensible defaults
$users = User::factory()->count(10)->create();           // ten
$admin = User::factory()->admin()->create();             // with a state
```

```text
User::factory()->count(10)->create() →
    INSERT INTO users (name, email, password) VALUES (…) × 10
    → returns a Collection of 10 persisted User models
    (10 rows in the test database, each with random-but-valid defaults)

User::factory()->admin()->create() →
    INSERT INTO users (..., is_admin, ...) VALUES (..., 1, ...)
    → the state overrode the defaults for one row
```

The factory defines defaults; **states** tweak one aspect:

```php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'is_admin' => false,
        ];
    }

    public function admin(): static          // a "state"
    {
        return $this->state(fn () => ['is_admin' => true]);
    }
}
```

And `afterCreating` runs code right after a model is persisted — for wiring up things a
row depends on:

```php
public function configure(): static
{
    return $this->afterCreating(function (User $user) {
        $user->notify(new WelcomeNotification($user));   // a real side effect, per create
    });
}
```

```text
User::factory()->create()  →
    row inserted → afterCreating fires → the welcome notification is dispatched
    (and in a test, Mail::fake() catches that dispatch so no email is ever sent — Section 6)
```

### Seeders in tests

Seeders (Lesson 119) aren't just for dev — tests can need shared baseline data. When a
feature's behaviour depends on data that exists by default (roles, settings, categories),
seed it in the test setUp instead of hand-creating rows in every test:

```php
protected function setUp(): void
{
    parent::setUp();
    $this->seed(RoleSeeder::class);        // roles exist for every test in this class
}

public function test_an_admin_can_assign_a_role(): void
{
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->post("/users/1/roles", ['role' => 'editor']);
    $this->assertDatabaseHas('role_user', ['role_id' => 2, 'user_id' => 1]);
}
```

```text
setUp() runs BEFORE each test → RoleSeeder inserts the baseline rows
test starts with roles present → acts as admin → assigns editor → row verified in the DB
```

> [!TIP]
> Seed *baselines* (reference data everything depends on), not *test-specific data*.
> If only one test needs a category, create it with a factory inside that test — a seed
> that most tests don't use is a tax every test pays.

## 5. Real Project Usage

| You want to prove… | Test type | Tool |
|---|---|---|
| A service method returns the right value | Unit | plain `new Class` + `assertSame` |
| A state/scope/factory behaves | Unit | factory + assert on attributes |
| "Signing up creates a user and logs them in" | Feature | factory + actingAs + assertDatabaseHas |
| "Guests can't see the dashboard" | Feature/HTTP | `$this->get(...)->assertRedirect` |
| A full endpoint renders correctly | HTTP | `$this->get('/users')->assertOk()->assertSee(...)` |
| A job was pushed when X happened | Feature | `Queue::fake()` + `assertPushed` |
| An email was "sent" on Y | Feature | `Mail::fake()` + `assertSent` |
| An external API call happened | Feature | `Http::fake()` + `assertSent` |
| A cache was written/cleared | Feature | `Cache::fake()` + `assertHas`/`assertMissing` |

## 6. Interview Explanation

> Laravel testing has three levels. Unit tests cover one class in isolation — no database,
> no framework. Feature tests exercise app behaviour against a real test database: I create
> data with factories, act as a user, hit a route, and assert the database or response
> changed. HTTP tests exercise the endpoint through the full stack. Every test class that
> touches the database uses `RefreshDatabase`, which migrates once and wraps each test in a
> transaction that rolls back — so every test starts from a clean, correctly-shaped schema.
> Factories build rows on demand with sensible defaults, states tweak one aspect, and
> `afterCreating` wires up side effects. What I mock is the outside world — boundaries.
> `Mail::fake()`, `Queue::fake()`, `Event::fake()`, `Http::fake()`, and `Cache::fake()`
> replace real delivery with in-memory records I can assert on. I mock those because the
> test is about my code, not about whether the mail server is up; I never mock Eloquent or
> the database, because `RefreshDatabase` gives me a real one cheaply and the test should
> prove the real query works.

## 7. Senior-Level Insights

- **Mock the boundary, not the behaviour.** The rule that earns the senior mark: fake
  things that reach *out* of your app — mail, queues, external HTTP, the clock, the cache
  *when it's the point of the test*. Never mock Eloquent or the query builder: the
  database is the app's own internals, `RefreshDatabase` gives you a real one for free,
  and a test that fakes the query layer is a test that doesn't test the query.
- **What to mock and why — say it as three boundaries.** **Mail** — delivery is another
  system's job; I assert "this mail was queued/sent" with `Mail::fake()`. **Queue** — the
  worker is another process (Lesson 124); `Queue::fake()` lets me assert "this job was
  pushed", not run it. **HTTP** — a third-party API is someone else's uptime;
  `Http::fake()` swaps it for canned responses. The cache is mocked only when the test's
  point is the cache key, not when the cache is incidental. The database is never mocked.
- **Tests are specifications.** A feature test — "act as admin, POST, assert the row
  exists" — is a runnable version of the acceptance criteria. When requirements change,
  the test changes first, then the code makes it green. That ordering is what senior teams
  mean by "test-driven".
- **Green is not proof; it's evidence.** A passing suite proves the behaviours you wrote
  tests for, nothing else. The gap between "the suite is green" and "the app is secure"
  is where Lesson 128's holes live — a test for the `is_admin` mass-assignment fix is
  worth more than a hundred tests for happy paths.
- **Fakes are a contract, and they drift.** `Http::fake()` encodes the request/response
  shape you expect from the API. When the third party changes that shape, the fake is
  where you'll notice — keep it close to the code that consumes the API, and treat a
  change to the fake as a change to the integration.
- **The suite is a product.** It must run in seconds (a suite that takes ten minutes gets
  skipped), be deterministic (no `sleep`, no real network, no shared state), and fail with
  a message that says *what* broke. Slow, flaky, or inscrutable suites are what people
  mean by "the tests are useless".

## 8. Common Mistakes

- **Mocking the database or Eloquent.** `mock(User::class)` in a feature test turns the
  test into a lie detector for your own mocks. `RefreshDatabase` gives you a real database;
  use it.
- **Testing everything at the HTTP level.** Every assertion is a full request — slow, and
  it hides *where* a failure is. Unit-test the pure logic, feature-test the behaviour,
  HTTP-test the seams.
- **No `RefreshDatabase`, then debugging order-dependent failures.** Tests pass alone,
  fail in the suite, and no one knows why — because test 7 left a row behind.
- **Factories that don't reflect reality.** A `UserFactory` with a non-hashed password or
  a missing `afterCreating` means tests pass against data that can't exist in production.
- **Seeding inside every test.** A `DatabaseSeeder` call per test is a full seed per
  test — slow. Seed baselines in `setUp`, use factories for test-specific data.
- **Real mail/queue/HTTP in tests.** Tests that actually send email, run workers, or hit
  the live API are slow, flaky, and occasionally expensive. `fake()` them and assert on
  the fake.
- **`assertSee` on fragile markup.** Asserting the exact HTML string breaks on any re-
  render. Assert the data that matters (`assertDatabaseHas`, `assertSessionHas`, a
  `assertSee` on stable text) instead of the entire page.
- **Test names that describe mechanics, not behaviour.** `testCreate` tells you nothing
  when it fails; `test_an_admin_can_publish_a_draft_post` does.
- **One giant test that does everything.** Ten assertions in a row means the first failure
  hides the rest, and no one knows which behaviour broke.

## 9. Best Practices

✅ Feature tests are the bulk of the suite; unit tests cover pure logic; HTTP tests cover seams

✅ `use RefreshDatabase` on every class that touches the database

✅ Build data with factories: defaults, states, `afterCreating` for side effects

✅ Seed baselines once in `setUp`; factory-create anything test-specific

✅ Fake the boundaries: `Mail::fake()`, `Queue::fake()`, `Event::fake()`, `Http::fake()`,
   `Cache::fake()` when the cache is the point

✅ Assert behaviour, not markup: `assertDatabaseHas`, `assertSessionHas`, stable text

✅ Name tests as behaviour: `test_an_admin_can_publish_a_draft_post`

✅ Keep the suite fast and deterministic — no sleep, no network, no shared state

❌ Don't mock Eloquent or the database

❌ Don't send real mail, run real workers, or hit real APIs in tests

❌ Don't let tests depend on order — `RefreshDatabase` is not optional

## 10. Interview Questions

**Q1. What's the difference between unit, feature, and HTTP tests in Laravel?**

> Unit tests exercise one class in isolation — no database, no framework, milliseconds.
> Feature tests exercise app behaviour against a real test database: factories build data,
> I act as a user, routes and controllers run, and I assert on the database or response.
> HTTP tests exercise the endpoint through the full stack. The suite is mostly feature
> tests; unit tests cover the pure logic; HTTP tests cover the seams.

**Q2. What does `RefreshDatabase` actually do?**

> When the first test in the class starts, it migrates the schema fresh. Then it wraps each
> test in a database transaction and rolls that transaction back after the test. So every
> test starts from an empty, correctly-shaped database — no cleanup code, no order
> dependence, no shared state leaking between tests.

**Q3. What is a factory, and what are states?**

> A factory defines sensible defaults for creating a model — `User::factory()->create()`
> inserts a valid user. States override part of the defaults for one case —
> `User::factory()->admin()->create()` sets `is_admin` to true. `afterCreating` hooks run
> code right after the row is persisted, for wiring side effects. `count(10)` creates ten.

**Q4. Why do you use `Mail::fake()` instead of checking the email actually arrives?**

> Because the test is about my code, not about the mail server. `Mail::fake()` swaps
> delivery for an in-memory record I can assert on — `Mail::assertSent(...)` proves the
> code queued the right mail to the right address without ever touching the network. It's
> the same for `Queue::fake()`, `Http::fake()`, and `Event::fake()`: assert that the
> boundary was crossed, don't actually cross it.

**Q5. What should you mock, and what should you never mock?**

> Mock the boundaries — the outside world: mail, queues, external HTTP, events, the cache
> when it's the point of the test. Never mock Eloquent or the database. The database is
> the app's own internals, `RefreshDatabase` gives me a real one for free, and a test that
> fakes the query layer proves nothing about the query.

**Q6. Show me a feature test that proves a user can create a post.**

> ```php
> public function test_an_authenticated_user_can_create_a_post(): void
> {
>     $user = User::factory()->create();
>
>     $this->actingAs($user)
>         ->post('/posts', ['title' => 'Hello', 'body' => 'World']);
>
>     $this->assertDatabaseHas('posts', ['title' => 'Hello', 'body' => 'World']);
> }
> ```

**Senior follow-up: a bug slips through despite a green suite. Walk me through what you'd do.**

> First, I don't assume the suite is wrong — I assume the bug lives in a behaviour nobody
> tested. I'd reproduce it as a failing test first, because that's also the specification
> for the fix. Then I look at the seams: did the change touch a boundary that's faked (a
> third-party API response shape, a queued job, a cache key)? The fake encodes an
> assumption, and the assumption can be wrong. Then I check the levels: was the logic
> unit-testable but only tested end-to-end (slow to fail, hard to pinpoint), or tested at
> the wrong level? Finally I'd ask what *kind* of bug it is — the mass-assignment and XSS
> holes from Lesson 128 routinely pass suites that only assert happy paths. A green suite
> proves the behaviours I wrote tests for; it never proves the app is secure.

## 11. Follow-up Questions

**What's the difference between a factory and a seeder?**

> A factory creates test data on demand — defaults plus per-call overrides, usually one or
> a few rows. A seeder inserts a fixed set of baseline data — roles, settings, reference
> rows — typically once for dev or once per test setUp. Factories are for *varying* data;
> seeders are for *fixed* data.

**How do you test something that depends on the current time?**

> Freeze time. Laravel's `Carbon::setTestNow()` (or `$this->travelTo()`) pins the clock so
> the test is deterministic — then I can assert on "sent within 24h", "expired
> yesterday", or an email's scheduled delivery without waiting. The clock is a boundary;
> mock it.

**When would you mock the cache in a test?**

> When the cache is the *subject* — testing that a write invalidates a tag (Lesson 127),
> or that `remember` uses the stored value. `Cache::fake()` records every put/get/forget,
> so I can assert `Cache::has('users')` or that a flush happened. When the cache is
> incidental, leave it real and let the memory store handle it.

**What makes a test suite flaky, and how do you fix it?**

> Shared state (order dependence — the `RefreshDatabase` fix), real network or mail (the
> fake fix), time dependence (freeze the clock), and sleeps (waiting for something instead
> of asserting on it). Each one has a deterministic replacement; a suite is flaky exactly
> when one of those was left in.

**How do you test a job that's meant to run on a queue?**

> `Queue::fake()`, then trigger the action that should push the job, then
> `Queue::assertPushed(MyJob::class)`. I'm proving the *dispatch* — that the right job
> was queued with the right payload — not running the worker (Lesson 124). The job's own
> logic gets its own test where `handle()` runs for real, usually with `Http::fake()`
> or `Mail::fake()` inside it.

## 12. Comparison Table

| | Unit test | Feature test | HTTP test |
|---|---|---|---|
| Scope | one class | app behaviour | full endpoint |
| Framework | none | app container | full stack |
| Database | no | real test DB (`RefreshDatabase`) | real test DB |
| Speed | µs | ms | ms–s |
| Typical asserts | `assertSame`, `assertTrue` | `assertDatabaseHas`, `assertRedirect` | `assertOk`, `assertSee` |
| Use for | casts, services, scopes | "signup creates a user" | "guests can't see /dashboard" |
| Count in suite | some | most | few |

## 13. Code Example

A complete feature test using factories, a state, `RefreshDatabase`, and a fake — then the
`php artisan test` output it produces:

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;
use App\Mail\WelcomeNotification;
use App\Models\User;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_a_user_and_queues_a_welcome_email(): void
    {
        Mail::fake();                                        // boundary: no real email

        $this->post('/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'password' => 'correct-horse',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'ada@example.com',
            'name' => 'Ada Lovelace',
        ]);

        Mail::assertQueued(WelcomeNotification::class);      // the "was it sent?" proof
    }
}
```

```text
$ php artisan test --filter=RegistrationTest

   PASS  Tests\Feature\RegistrationTest
   ✓ registration creates a user and queues a welcome email

   Tests:    1 passed
   Time:     0.15s
```

```narrate
line: "Mail::fake() makes 'assertQueued' possible — no mail server, no slow network, just a recorded dispatch."
line: "RefreshDatabase means the next test sees an empty users table — this test's row is gone by the time it ends."
line: "assertDatabaseHas is the feature-test heart: prove the app changed the real database, not that the page rendered."
```

## 14. Performance Notes

- **The suite should run in seconds.** Each feature test is a transaction plus a few
  queries — hundreds of tests, single-digit seconds. If it's minutes, the culprits are
  seeds per test, real network, or a disk-backed SQLite instead of in-memory.
- **`RefreshDatabase` is cheaper than it looks.** Migrating once, then a transaction
  rollback per test, is far cheaper than re-migrating per test. Never put `migrate:fresh`
  inside a test's setUp.
- **Factories pay for themselves at scale.** Hand-writing inserts for twenty tests is
  fine; hand-writing them for a growing suite is why factories exist. The `count(10)`
  call is the pattern that makes data-volume tests readable.
- **Fakes make tests fast by removing waits.** The real queue would need a worker
  running; `Queue::fake()` turns "wait for the worker" into "assert it was pushed" — the
  single biggest speedup available in Laravel tests.
- **When it doesn't matter:** a one-off script or a spike doesn't need a suite. But the
  moment code is shared or shipped, the question changes from "can I test this" to "how
  do I keep it from breaking" — and that's `RefreshDatabase`, factories, and fakes.

## 15. Debugging Scenarios

**Scenario 1: "The test passes alone and fails in the suite."**

Order dependence — the classic missing-`RefreshDatabase` signature. A test before yours
left rows behind, and your test's `assertDatabaseHas` (or a unique constraint) trips on
them. Add `use RefreshDatabase` to the class, and the transaction rollback makes every
test start empty. Then delete the test-specific cleanup code you were writing to
compensate.

**Scenario 2: "The test hits a real API / sends a real email / pushes a real job."**

The suite is touching a boundary without a fake — slow, flaky, and sometimes sending
actual mail. Add `Http::fake()` (with canned responses shaped like the real API),
`Mail::fake()`, or `Queue::fake()`, and change the assertions to `Http::assertSent`,
`Mail::assertQueued`, `Queue::assertPushed`. If the fake needs a response body, give the
fake a fixture — the test should not care what the third party actually returns today.

**Scenario 3: "`assertDatabaseHas('users', ...)` passes but the login fails."**

The row exists but doesn't behave like a real user — almost always a factory that doesn't
match production. The classic: `UserFactory` storing a raw `'password'` string instead of
`Hash::make('password')`, so the test's row can't authenticate. Fix the factory, not the
test — the factory is the specification for what a user *is*.

**Scenario 4: "The suite got slow after adding a seeder."**

The seed ran per test. Move the baseline seed to `setUp` (once per test, not per
assertion) or better, only seed the classes each test needs. If only a few tests need
roles, create the roles with a factory inside those tests instead of seeding for
everyone.

**Scenario 5: "A security fix shipped, and the tests are still green."**

Then the security behaviour has no test. Lesson 128's holes — the mass-assignment fix,
the escaping fix, the CSRF check — each deserve a regression test that proves the attack
fails and the safe path works. Write the test that POSTs `is_admin=1` and asserts the
user is *not* an admin; it's the test that would have caught the bug before it shipped.

## 16. Quick Revision Notes

- Pyramid: unit (one class) → feature (behaviour, most tests) → HTTP (endpoint, few)
- `RefreshDatabase`: migrate once, transaction per test, rollback after → clean slate
- Factories: `User::factory()->count(10)->create()`, states (`->admin()`), `afterCreating`
- Seeders: baselines in `setUp`, test-specific data via factories
- Fakes are boundaries: `Mail::`, `Queue::`, `Event::`, `Http::`, `Cache::` (when it's
  the point)
- Mock mail/queue/HTTP/cache; NEVER mock Eloquent or the database
- Assert behaviour, not markup: `assertDatabaseHas`, `assertSessionHas`, stable text
- Test names describe behaviour: `test_an_admin_can_publish_a_draft_post`
- Green = evidence for what you tested, not proof of security — test the attack paths too
- Suite must be fast, deterministic, and self-diagnosing

## 17. Cheat Sheet

```text
TEST TYPES
  unit      new MyClass() → assertSame        one class, no framework, no DB
  feature   act + assert state                factories, actingAs, assertDatabaseHas
  HTTP      $this->get('/x')->assertOk()      full stack endpoint

DATABASE
  use RefreshDatabase        migrate once + transaction per test + rollback
  WITHOUT it → order-dependent, flaky suites

FACTORIES
  User::factory()->create()                     one valid row
  User::factory()->count(10)->create()          ten rows
  User::factory()->admin()->create()            one row, state applied
  afterCreating(fn)                             side effects after persist

SEEDERS
  $this->seed(RoleSeeder::class)   in setUp — baselines once per test

FAKES (boundaries — mock these)
  Mail::fake()     + Mail::assertQueued(...) / assertSent(...)
  Queue::fake()    + Queue::assertPushed(...)
  Event::fake()    + Event::assertDispatched(...)
  Http::fake()     + Http::assertSent(...)
  Cache::fake()    + Cache::has(...) / assertMissing(...)
  NEVER mock: Eloquent, the query builder, the database

ASSERTS
  assertDatabaseHas('users', [...])    row exists in real DB
  assertRedirect('/login')             auth guard worked
  assertOk() / assertSee('stable')     endpoint answered

$ php artisan test --filter=RegistrationTest
```

## 18. Key Takeaways

> [!RECAP]
> - Three speeds: unit tests for one class, feature tests for behaviour (the bulk),
>   HTTP tests for the endpoint
> - `RefreshDatabase` gives every test an empty, correctly-shaped database via
>   one migration + per-test transactions
> - Factories: `->count(10)->create()`, states, `afterCreating` — data on demand
> - Seeders provide baselines in `setUp`; factories provide test-specific rows
> - Fakes stand in for boundaries: Mail, Queue, Event, Http, Cache
> - Mock the outside world, never the database — `RefreshDatabase` makes a real one free
> - Assert behaviour (`assertDatabaseHas`) over markup (`assertSee` on the whole page)
> - Tests are specifications: change the test first, then make it green
> - Green is evidence for what you tested — regression-test the attack paths from L128
> - A suite that runs in seconds, deterministically, is a suite that gets run

## Check your understanding

Answer these without looking back.

1. Where does a unit test end and a feature test begin — and where does HTTP testing fit?
2. What does `RefreshDatabase` do before and after each test — in three steps?
3. Write the factory calls for: one user, ten users, one admin user.
4. What does `afterCreating` run, and give one use for it.
5. When do you seed in a test, and when do you use a factory instead?
6. Name the five fakes — and the one thing you must never mock.
7. Why is `Mail::fake()` faster *and* more reliable than asserting on real email?
8. What's the difference between `assertDatabaseHas` and `assertSee`, and why prefer the first?
9. A suite that's green after a security fix — why is that not enough, and what test would you add?

## What's Next

**Lesson 130 — Service Layer, Repositories & SOLID.** Tests prove the behaviour you wrote;
architecture decides whether that behaviour stays testable. When a service layer earns its
place, when a repository is over-abstraction, and the SOLID examples — the senior round
that decides the offer.
