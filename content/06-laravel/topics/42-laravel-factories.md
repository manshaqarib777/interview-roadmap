# Topic 42 — Laravel Factories

**Checklist anchor:** `User::factory()->count(10)->create()` · states · relationships · Faker · factory callbacks

**Owning lesson:** [129 Testing, Factories & Mocking](../129-testing.md)

---

## The one-sentence answer

**A factory generates test data on demand — `User::factory()->count(10)->create()` — with realistic faker values, named states, and relationship wiring.**

## The mental model

Instead of hand-writing fixture arrays, a factory is a **blueprint for a model's data**:

```php
// one blueprint, infinite variations:
User::factory()->create();                    // a default user
User::factory()->count(10)->create();         // ten users
User::factory()->admin()->create();           // the 'admin' state
User::factory()->has(Post::factory()->count(3))->create(); // + 3 posts
```

The factory answers "give me a valid User row" in one call, with sensible defaults (faker-generated) that you can override per test.

## How it works

### The factory

```php
php artisan make:factory PostFactory --model=Post
```

```php
class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),      // a related user (created on demand)
            'title' => fake()->sentence(5),    // Faker — realistic text
            'body' => fake()->paragraph(),
            'published_at' => null,
        ];
    }
}
```

### Creating

```php
Post::factory()->create();                    // persist one
Post::factory()->make();                      // build one, don't save
Post::factory()->count(10)->create();         // ten persisted
Post::factory()->create(['title' => 'Fixed']); // override a field
```

### States — named variations

```php
class UserFactory extends Factory
{
    public function definition(): array { /* defaults */ }

    public function admin(): static
    {
        return $this->state(fn () => ['is_admin' => true]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}

User::factory()->admin()->create();       // the named variation
User::factory()->unverified()->create();
```

### Relationships

```php
// in the factory definition — user_id => User::factory() creates the parent
Post::factory()->create();   // also creates a User

// from the test — wire explicitly:
$user = User::factory()->has(Post::factory()->count(3))->create();
// $user->posts has 3

// belongsTo-style: create a post FOR a specific user
Post::factory()->for($user)->create();
```

### Factory callbacks

```php
public function configure(): static
{
    return $this->afterCreating(function (Post $post) {
        $post->addMedia(...);   // run after the row exists
    });
}
```

`afterMaking`/`afterCreating` run hooks when the model is built/persisted — for side data that needs the id.

### Faker

`fake()->name()`, `fake()->email()`, `fake()->sentence()` — Faker generates realistic-but-random data, seeded per test run so tests are reproducible (`$this->seed()` / faker seeding).

## Interview questions

**Q1. What is a factory?**
> A blueprint for generating model data — `User::factory()->create()` produces a valid user with faker-generated attributes, `count(10)` produces ten, and overrides/state tweak specifics. It replaces hand-written fixture arrays with one reusable definition.

**Q2. What are factory states?**
> Named variations of the default definition — `admin()`, `unverified()` — each `$this->state(fn () => [...])` overriding a few fields. States make a test read like prose: `User::factory()->admin()->create()` is self-documenting.

**Q3. How do factories handle relationships?**
> Declaratively. In the definition, `'user_id' => User::factory()` creates the parent on demand. From the test, `has(Post::factory()->count(3))` attaches children, and `for($user)` points at an existing parent. The factory builds the graph, not the test.

**Q4. `create()` vs `make()`?**
> `create()` persists the model. `make()` builds it in memory without saving — for tests that don't need the row in the DB (a service that takes a model instance). The choice is "do I need the DB?"

**Q5. What are factory callbacks?**
> Hooks that run after the model is made or created — `afterMaking`/`afterCreating`. Use them for side data that needs the row's id (attachments, pivot rows). They keep that wiring in the factory instead of repeating it in every test.

**Senior follow-up: When do you override the factory vs use a state?**
> Override (`->create(['title' => 'X'])`) for test-specific one-offs. A **state** is for a variation many tests need — `admin()`, `unverified()` — so it has a name and a single home. The rule: if two tests would write the same override, it's a state.

## Common mistakes

❌ Hand-writing fixtures instead of factories — duplicated, drift-prone data.

❌ Forgetting `count()` vs one — `User::factory()->create()` is one; scale with `count(N)`.

❌ Overriding in every test what should be a named state.

❌ Factories without Faker — hard-coded values make uniqueness and realism a test-time problem.

## Quick revision notes

- Factory = **blueprint for model data** — `definition()` + faker
- `create()` persists · `make()` builds · `count(N)` scales · overrides per test
- **States** = named variations (`admin()`) via `$this->state(...)`
- **Relationships**: `has(...)`, `for(...)`, `'user_id' => User::factory()`
- **Callbacks**: `afterMaking` / `afterCreating`
- Repeated overrides → **promote to a state**

## Check your understanding

1. What does `User::factory()->count(10)->create()` produce, exactly?
2. When do you promote an override to a state?
3. How does a factory define a relationship to its parent?
4. `create()` vs `make()` — when is each right?
5. What's a factory callback for, and when do you need one?
