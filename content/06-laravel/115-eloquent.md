# Lesson 115 — Eloquent ORM

**Interview importance:** ⭐⭐⭐⭐⭐ — the largest single Laravel interview topic. Most of the
Laravel questions you'll be asked, at any level, are Eloquent questions.

Eloquent is the layer of Laravel you touch on every task. Even a small feature is a model, a
fillable array, a scope and a query — and the interview questions are the same four or five
decisions, asked over and over: what's mass assignment, how does a cast work, where do
accessors live. Get those right and you've answered most of an Eloquent round.

Eloquent is an **active-record ORM**: a model is both your class *and* a row in the database.
`User::where('active', true)` doesn't return an array — it returns a *query builder* that
becomes a SELECT the moment you call `->get()`. Everything in this lesson is about what sits
between your PHP and the SQL that actually runs.

## Learning Objectives

By the end of this lesson you should be able to:

- Say what Eloquent is (active record) and name the two alternatives (data mapper)
- Explain `$fillable` vs `$guarded` and why one of them must exist
- Use `$casts` for dates, arrays/JSON and enums — and know when to reach for them
- Write modern accessors and mutators with `Attribute` syntax
- Write a local scope and explain how global scopes and model events work
- Explain why `User::where(...)` is a query builder, and exactly when the SQL runs
- Tell `first()` / `find()` / `all()` / `get()` apart without pausing

## 1. What is Eloquent?

Eloquent is Laravel's ORM — **Object-Relational Mapping** — and it implements the **active
record** pattern: each model class maps to one database table, each instance maps to one row,
and the model itself knows how to save and load itself.

```php
$user = new User;              // empty row-shaped object
$user->name = 'Mansha';
$user->save();                 // the MODEL runs the INSERT

$users = User::where('active', true)->get();   // SELECT * FROM users WHERE active = 1
```

Two sentences to own: *the class is the table, the instance is a row, and the methods are
SQL.* The alternative is the **data mapper** pattern (Doctrine, an entity that knows nothing
about the database), where you hand objects to a separate repository. Laravel chose active
record — and so will most interview answers.

```text
   ┌─ Table: users ─────────────────────────┐
   │  id   name     email        active     │
   │  1    Mansha   m@site.dev   1          │
   │  2    Ali      a@site.dev   0          │
   └────────────────────────────────────────┘
        ▲ maps to
   class User extends Model          ← one row per instance
```

## 2. Mental Model

**Think of a model as a row with a toolbox.** The instance holds one row's data; the class
carries the behaviour that turns that row into SQL — `$fillable` decides what may be written,
`$casts` decides how each attribute is read and stored, and methods decide what `SELECT` runs.

| Piece of the model | What it really does |
|---|---|
| `protected $table` | Which SQL table (default: plural snake_case of the class) |
| `protected $fillable` | Which attributes the model is allowed to mass-assign |
| `protected $casts` | How values are stored vs how they're returned (dates, arrays, enums) |
| `protected $appends` | Virtual attributes added to every JSON/serialised model |
| Method returning `Attribute` | Accessor/mutator — a custom getter and setter |
| `scopeActive()` | Reusable WHERE snippet for the query builder |
| `booted()` | Model events and global scopes — code that runs when the model boots |

## 3. Visual Flow

```text
                    User::where('active', true)
                              │
                              ▼
        ┌─────────────────────────────┐
        │   Query Builder             │   ← this is what the class method returns
        │   where active = true       │
        │   (NOT executed yet)        │
        └─────────────────────────────┘
                              │  ->get()
                              ▼
        ┌─────────────────────────────┐
        │   SQL Builder                │
        │   SELECT * FROM users        │
        │   WHERE active = 1           │
        └─────────────────────────────┘
                              │  PDO executes it
                              ▼
                    Eloquent\Collection
                    of User instances   ← hydration (rows → objects)
```

The model class is a *static gateway* to the query builder. Nothing touches the database
until a method that actually resolves the query — `get()`, `first()`, `count()` — is called.

## 4. How it Works: Models, `$fillable` vs `$guarded`, and Mass Assignment

A model is a row you can read and write, but a write is a security decision. **Mass
assignment** is setting many attributes at once from untrusted input:

```php
// The route is: User::create($request->all())   — request fields map onto the model
$user = User::create([
    'name'  => $request->input('name'),
    'admin' => 1,                    // 👈 attacker injects this — it's in $request->all()
]);
```

Eloquent blocks every attribute by default. You open the ones that are safe to fill with
**one** of two opposite doors:

```php
// Whitelist — the safe-by-default choice for anything user-facing
class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
}

// OR the inverse: allow everything EXCEPT a few protected ones
class User extends Model
{
    protected $guarded = ['id', 'admin', 'remember_token'];
}
```

> [!PITFALL]
> Use one or the other, never both. And `$guarded = []` ("fill everything") is how the
> `admin = 1` injection becomes a real breach — in a stock Laravel app the only table the
> attacker can't reach is the one you forget to guard.
>
> Never put a generated column — `id`, `slug`, `created_at` — in `$fillable`. Mass assignment
> should never touch what the app itself manages.

## 5. How it Works: `$casts`, Accessors & Mutators

**Casts** transform values at the boundary between the database and your code. The column
might be a string in MySQL but you want a `Carbon` date, a JSON string but you want an array,
or an int but you want an enum:

```php
class User extends Model
{
    protected $casts = [
        'email_verified_at' => 'datetime',      // string → Carbon, serialised back
        'meta'              => 'array',         // JSON string ↔ PHP array
        'settings'          => 'json',          // same, but JSON:true / :false
        'status'            => StatusEnum::class,// int → enum (cast to enum in L9+)
        'is_admin'          => 'boolean',       // tinyint 1/0 ↔ true/false
    ];
}
```

Accessors and mutators are **custom** casts — getter and setter logic for one attribute.
Modern syntax (Laravel 9+) is the `Attribute` object; the old `getXAttribute` /
`setXAttribute` method pairs are legacy:

```php
class User extends Model
{
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => "{$attributes['first_name']} {$attributes['last_name']}",
        );
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => Hash::make($value),   // auto-hash on every write
        );
    }
}

// usage — no method calls, just attribute reads/writes
$user->full_name;                 // "Mansha Khan"
$user->password = 'secret123';    // stored hashed
```

> [!DEEPDIVE]
> A cast and an accessor differ in one thing: a **cast** is a mechanical type conversion
> (int ↔ enum, JSON ↔ array), an **accessor** is *computed* logic (`fullName` doesn't exist
> in the database — it's derived from two real columns). Interviews love the question "cast or
> accessor?" — answer: "cast when the database representation differs from the PHP type;
> accessor when the value has to be *computed* from one or more columns."

## 6. How it Works: Scopes and Model Events

**Local scopes** are named WHERE snippets you chain onto any query:

```php
class User extends Model
{
    public function scopeActive($query): void
    {
        $query->where('active', true);
    }

    public function scopeRecent($query, $days = 7): void
    {
        $query->where('created_at', '>=', now()->subDays($days));
    }
}

$recentActives = User::active()->recent(30)->get();
```

**Global scopes** apply to *every* query on that model — you don't call them. Classic use:
multi-tenant scoping, or soft deletes (the `SoftDeletes` trait is a global scope that hides
`deleted_at IS NOT NULL` rows from every query).

```php
class User extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope('active', fn ($builder) => $builder->where('active', true));

        static::created(function (User $user) {
            // fires after every INSERT — e.g. send the welcome email
        });
    }
}
```

**Model events** (`created`, `updated`, `deleting`, …) are hooks on the model lifecycle —
for heavy lifting prefer listeners/observers (L125), but a small `created` closure here is
legitimately where it belongs.

> [!TIP]
> Remember the names: `booted()` is the modern place for global scopes and events (the old
> `boot()` static method is legacy). A scope *is* just a closure that mutates the builder.

## 7. Real Project Usage

In a stock Laravel app, every `php artisan make:model` hands you this shape — and the
typical production edits are: `$fillable`, `$casts`, an accessor or two, a scope, and a
relationship (Lesson 116):

```php
class Post extends Model
{
    protected $fillable = ['title', 'slug', 'body', 'published_at'];

    protected $casts = [
        'published_at' => 'datetime',
        'tags'         => 'array',
    ];

    protected function slug(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => Str::slug($value),
        );
    }

    public function scopePublished($query): void
    {
        $query->whereNotNull('published_at');
    }
}
```

## 8. Interview Explanation

> Eloquent is an active-record ORM. A model class maps to a table, an instance to a row, and
> its methods to SQL. The two things I control on every model are what can be mass-assigned —
> `$fillable` whitelist or `$guarded` blacklist — and how attributes convert at the database
> boundary with `$casts`.
>
> `User::where(...)` returns a query builder, so I can keep chaining conditions; the SQL only
> runs when I call a resolver like `get()` or `first()`. Accessors and mutators give me
> computed attributes with the modern `Attribute` syntax, and scopes let me reuse WHERE logic
> across the codebase. Global scopes and model events in `booted()` apply behaviour to every
> query on a model — like soft deletes hiding rows automatically.

## 9. Senior-Level Insights

- **`$fillable` is a boundary, not a list.** The senior framing: mass assignment is an attack
  surface, and `$guarded = []` on a user-facing model is a data-integrity bug waiting to
  happen. Reach for `$fillable` by default; reserve `$guarded` for models whose full column
  set is genuinely safe (and even then, keep `id` and the admin flags guarded).
- **`$casts` is where Eloquent hides your SQL types.** New devs manually `json_encode()` on
  write and `json_decode()` on read — a cast does both, automatically, and stays in one place
  the next dev will actually look.
- **Accessors for virtual fields, casts for real ones.** If the attribute isn't a column,
  it's an accessor. That one rule settles most "should I cast or accessor?" debates.
- **Know *when* SQL runs.** Senior answers always name the lazy moment — Eloquent builds the
  builder eagerly but executes lazily at `get()`/`first()`/`count()`. It's the difference
  between "`where()` returns users" and "`where()` returns a builder".
- **Model events belong in `booted()`**, not in controllers. The moment "send a welcome
  email" lives in the controller, the same event can fire twice from two code paths.

## 10. Common Mistakes

- ❌ **Both `$fillable` and `$guarded` set** — needless confusion; pick one.
- ❌ **`$guarded = []` on a model touched by `$request->all()`** — the classic mass-assignment
  escalation (`admin = 1`, `is_admin`, `role_id`).
- ❌ **Casting a column to `'array'` when the column isn't JSON** — MySQL errors or silent
  `null`s.
- ❌ **The old `getXAttribute` style** in a modern codebase — it works, but every recent
  Laravel answer should use `Attribute::make`.
- ❌ **`User::where(...)` without a resolver** — nothing runs, and the "bug" is invisible.
  This is the N+1 cousin, Lesson 117's core.
- ❌ **Never use `$fillable` with `create()` on a request** without whitelisting the keys —
  `$request->only(['name', 'email'])` is a cheap extra wall.

## 11. Best Practices

✅ One of `$fillable` / `$guarded`, never both — and `$fillable` for anything user-facing

✅ Cast dates (`datetime`), JSON columns (`array`/`json`) and enums to their PHP types

✅ Write accessors/mutators with `protected function name(): Attribute`

✅ Keep generated columns (`id`, `created_at`, `slug`) out of `$fillable`

✅ Put global scopes and model events in `booted()`

✅ Resolve queries explicitly — `get()`, `first()`, `find()` — and let the builder be lazy

## 12. Interview Questions

**Q1. What is Eloquent, and what pattern does it implement?**

> An ORM implementing the active-record pattern: each model class maps to a table, each
> instance to a row, and the model itself knows how to query and persist. The alternative is
> the data-mapper pattern, where entities are plain and a separate repository does the SQL.

**Q2. What is mass assignment, and how do you prevent it?**

> Assigning many attributes at once from untrusted input — typically
> `User::create($request->all())`. Eloquent guards against it with `$fillable` (whitelist) or
> `$guarded` (blacklist). I use `$fillable` for anything user-facing and never leave a model
> with `$guarded = []` reachable from a request.

**Q3. What's the difference between `$fillable` and `$guarded`?**

> They're the same protection configured opposite ways. `$fillable` is the list of attributes
> allowed through mass assignment; `$guarded` is the list of attributes blocked, with
> everything else allowed. Use one, never both, and prefer `$fillable`.

**Q4. What are casts used for?**

> Converting a database representation to a PHP type at read time and back at write time —
> `datetime` to `Carbon`, a JSON column to an array, an int to an enum. They replace manual
> `json_encode`/`json_decode` and keep the conversion in one declaration.

**Q5. What is the difference between an accessor and a mutator?**

> An accessor transforms an attribute when it's *read*; a mutator transforms it when it's
> *written*. In modern Laravel they're the `get` and `set` closures of one
> `Attribute::make()` call. A common mutator is auto-hashing a password on every set.

**Q6. What is a local scope?**

> A named, reusable WHERE clause defined as a method — `scopeActive()` gives you
> `User::active()->...`. It's a closure that receives the query builder and mutates it, so it
> chains with anything else.

**Q7. What is a global scope?**

> A constraint applied to *every* query on a model, declared in `booted()` via
> `addGlobalScope`. The best-known example is `SoftDeletes`, which hides soft-deleted rows
> from every query without you asking.

**Q8. What is the difference between `first()`, `find()`, `all()` and `get()`?**

> `all()` and `get()` run the full SELECT — `get()` resolves whatever builder you've chained,
> `all()` is a shorthand for the whole table. `first()` and `find()` return a single model
> (`first()` takes the first row of the query, `find($id)` is `where primary key`). `find`
> and `first` stop at one row — `get` and `all` collect everything.

**Q9. Explain how `User::where('active', true)` actually works internally.**

> `User::where(...)` goes through the model to the **query builder** and returns it — so the
> model *is* a builder factory. Nothing touches the database yet. The moment `get()` (or
> `first()`, `count()`) is called, the builder turns itself into SQL and executes it; then
> Eloquent hydrates each row back into a model instance.

**Q10. What is the difference between an accessor and a cast?**

> A cast is a mechanical type conversion of a real column — the stored value is a string, the
> PHP value is a `Carbon` or array. An accessor *computes* a value that may not exist as a
> column at all, like `full_name` derived from `first_name` + `last_name`.

**Senior follow-up: How would you add a `full_name` attribute that appears in JSON, and
why might you also want it in the database?**

> An accessor `protected function fullName(): Attribute` gives me `$user->full_name` on the
> fly, and `$appends = ['full_name']` puts it into every serialised response. If the computed
> value is read constantly and the underlying columns are large, I'd denormalise: store a
> real `full_name` column, keep the accessor as a fallback, and let a model event or DB
> trigger keep it in sync — trading one write-time step for cheaper reads.

## 13. Follow-Up Questions

**Q1. What happens if you `create()` a request with attributes not in `$fillable`?**

> They're silently discarded — no error, the columns just never get written. That's why
> `$fillable` is safe-by-default: the value is dropped rather than saved. If nothing in the
> request matched, you'd get an empty row (or a model with only defaults).

**Q2. If you change a column's cast, do you need a migration?**

> Not for the cast itself — the cast is a PHP-side conversion, the column in MySQL is
> unchanged. But if the *column type* differs from the new cast's expectations (casting an
> `int` column as `array`), you need a migration. The cast never requires one by itself.

**Q3. When is `$guarded` a legitimate choice?**

> When a model's whole column set is safe to mass-assign — typically internal, admin-owned
> models with no user input reaching `create()`. Even then I keep `id` and permission flags
> guarded, and prefer `$fillable` for anything a request can touch.

**Q4. Does a global scope ever get in the way?**

> Yes — that's why `withoutGlobalScope()` exists. The classic trap: an admin panel or a
> reporting job needs to see soft-deleted rows, and the scope silently hides them. Being able
> to *remove* a scope by name is part of the answer.

## 14. Comparison Table

| Feature | `$fillable` | `$guarded` | `$casts` | Accessor / Mutator |
|---|---|---|---|---|
| What it configures | Allowed mass-assign | Blocked mass-assign | Type boundary | Custom get/set logic |
| Direction | Read by `create()` | Read by `create()` | Both ways | Get = read, set = write |
| Safety posture | Whitelist (default) | Blacklist | Neutral | Neutral |
| Typical use | User-facing model | Internal model | dates / JSON / enums | `full_name`, hashed `password` |
| Wrong use | Putting `id` in it | `= []` on a request model | Casting a non-JSON column | Mixing in legacy `getX` style |

| Method | Returns | Query | Use it for |
|---|---|---|---|
| `all()` | Collection of every row | `SELECT * FROM users` | Small static tables |
| `get()` | Collection | The chained query | The default "give me rows" |
| `first()` | One model or `null` | `LIMIT 1` | "Give me the first / any" |
| `find($id)` | One model or `null` | `WHERE id = ?` | Primary-key lookups |
| `where(...)` | Query builder (lazy) | — (no SQL yet) | Building up a query |

## 15. Code Example

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// build the query first — NOTHING has run yet
$query = User::where('active', true)
             ->whereNotNull('email_verified_at');

// now the SQL executes, and rows become User instances
$users = $query->orderBy('name')->get();

foreach ($users as $user) {
    echo "{$user->name} ({$user->email}) — {$user->full_name}\n";
}
```

Output (the SQL Eloquent actually runs, then the result):

```text
SELECT * FROM users
WHERE active = 1
  AND email_verified_at IS NOT NULL
ORDER BY name ASC

Mansha Khan (m@site.dev) — Mansha Khan
Ali Ahmed (a@site.dev) — Ali Ahmed
```

## 16. Performance Notes

- **Stay lazy.** `where()` / `orderBy()` are free until a resolver runs — one query, not one
  per chain step.
- **`find()` beats `where('id', $id)->first()`** — the primary key is indexed, and Eloquent
  can use it directly.
- **`pluck('name')` beats `get()->pluck('name')`** — it selects only that column instead of
  `*`. On a 100k-row table that's the difference between one column and 30 crossing the wire.
- **Respect the count.** If you only need a number, `->count()` does `SELECT COUNT(*)` and
  skips hydrating models entirely.
- **The next frontier is Lesson 117**: `User::all()` in a loop with `$user->posts` inside is
  the N+1 problem — the single most-asked Laravel performance question.

## 17. Debugging Scenarios

- **"I called `User::where('active', true)` and got nothing."** — Correct: you got a query
  builder. Add `->get()` or `->first()`. The lazy-execution model means "no result" often
  means "no resolver called".
- **"`User::create($request->all())` silently drops my `role` field."** — `role` isn't in
  `$fillable` (or is in `$guarded`). Whitelist the keys you actually want with `->only([...])`
  *and* `$fillable`.
- **"`$user->meta` returns a string but I expected an array."** — The `meta` cast is missing
  or the column isn't JSON. Add `'meta' => 'array'`; if that's already there, the column
  likely contains invalid JSON (nulls corrupt the cast).
- **"`$user->full_name` is null."** — An accessor returning null usually means the *underlying
  columns* are null (`first_name`/`last_name` empty), or the `$attributes` keys in the closure
  don't match the real column names.

## 18. Quick Revision Notes

- **Eloquent = active-record ORM**: class → table, instance → row, methods → SQL.
- **`$fillable` / `$guarded`**: one of them, always. `$fillable` is the whitelist; `$guarded`
  is the blacklist. Never `$guarded = []` on a request-reachable model.
- **`$casts`**: `datetime`, `array`/`json`, `boolean`, enum class — conversions at both ends.
- **Accessor/mutator** = `protected function x(): Attribute` with `get:` / `set:` closures.
- **Local scope** = reusable WHERE (`scopeActive()` → `User::active()`).
- **Global scope** = applied to every query, declared in `booted()`, removable with
  `withoutGlobalScope()`.
- **Model events** = `created` / `updated` / `deleting` / …, in `booted()`.
- **`where()` returns a query builder — lazy.** SQL runs at `get()`/`first()`/`count()`.

## 19. Cheat Sheet

```text
FILLABLE     → which attributes may be mass-assigned          ($fillable / $guarded)
CAST         → DB type ↔ PHP type at the boundary             ($casts)
ACCESSOR     → computed attribute on read                     Attribute::get
MUTATOR      → transform on write                             Attribute::set
LOCAL SCOPE  → named WHERE snippet, chained                   scopeX()
GLOBAL SCOPE → applied to every query, in booted()            addGlobalScope()
EVENT        → lifecycle hook, in booted()                    created, updated…
LAZY SQL     → where()/orderBy() build; get()/first() run     the only rule that matters
```

## 20. Key Takeaways

> [!RECAP]
> - Eloquent is an active-record ORM — model = table, instance = row, methods = SQL
> - Mass assignment is blocked by default; open exactly one door: `$fillable` or `$guarded`
> - `$casts` convert dates/arrays/enums at the boundary, in both directions
> - Accessors and mutators are custom casts, written as `Attribute::make(get:, set:)`
> - Local scopes are reusable WHEREs; global scopes and events live in `booted()`
> - `User::where(...)` returns a **query builder** — SQL runs only at `get()`/`first()`/`count()`
> - `first()`/`find()` return one model; `all()`/`get()` return a collection
> - Lazy builders are why the N+1 trap in Lesson 117 is so easy to fall into

## Check your understanding

Answer these without looking back.

1. What pattern does Eloquent implement, and what's the one-sentence difference from a data
   mapper?
2. Why must every model declare `$fillable` or `$guarded`, and which do you prefer?
3. Write the cast declaration that makes a `meta` column come back as an array.
4. Write a `full_name` accessor using modern `Attribute` syntax.
5. What does `User::where('active', true)` actually return, and when does the SQL run?
6. Name three ways a global scope differs from a local scope.
7. Match each to its query: `all()`, `get()`, `first()`, `find(7)`.
8. What is the mass-assignment attack, and what's the exact fix for it?

## What's Next

**Lesson 116 — Eloquent Relationships.** One-to-one, one-to-many, many-to-many with a pivot,
`hasManyThrough`, and polymorphic relations — which one fits which data shape, and how each
maps to SQL.
