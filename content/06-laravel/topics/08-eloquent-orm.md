# Topic 8 — Eloquent ORM

**Checklist anchor:** models · `$fillable`/`$guarded` · `$casts` · accessors · mutators · attribute objects · relationships · scopes · events · observers · collections · query builder · model events · serialization

**Owning lesson:** [115 Eloquent ORM](../115-eloquent.md)

---

## The one-sentence answer

**Eloquent is Laravel's ORM — each model class maps to a database table, and each instance maps to a row, with relationships, scopes, events, and serialization layered on top.**

## The mental model

Eloquent is **active record**: the model is the table, an instance is a row, and the model carries both data and behaviour.

```php
// app/Models/Order.php
class Order extends Model
{
    // the table is assumed (orders), the PK is assumed (id)
}
```

```php
Order::where('status', 'paid')->get();   // SQL: select * from orders where status = 'paid'
$order = Order::find(1);                 // one row → one instance
$order->total;                           // a column value
$order->status = 'shipped';              // mutate a column
$order->save();                          // update the row
```

The model is where mass-assignment safety, casting, accessors, scopes, and events all live — which is why "Eloquent" is the largest topic on the checklist.

## How it works

### Mass assignment — `$fillable` vs `$guarded`

```php
class User extends Model
{
    // whitelist: ONLY these fields can be mass-assigned
    protected $fillable = ['name', 'email', 'password'];

    // or blacklist everything except these (safer to leave guarded empty)
    protected $guarded = ['id', 'is_admin'];
}

User::create($request->all()); // mass assignment — guarded by fillable
```

Mass assignment is the vector for the "user sets `is_admin`" attack (Lesson 37). `$fillable` is the whitelist, `$guarded` the blacklist — never leave both empty, and never trust raw input.

### Casts — typed attributes

```php
protected $casts = [
    'is_active' => 'boolean',   // 0/1 → true/false
    'metadata' => 'array',      // JSON column → array
    'price' => 'decimal:2',
    'paid_at' => 'datetime',    // string → Carbon instance
    'settings' => AsCollection::class, // or attribute objects (L10+)
];
```

Casts turn raw DB values into useful PHP objects at the boundary.

### Accessors & mutators — the modern syntax

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected function fullName(): Attribute
{
    return Attribute::make(
        get: fn ($value) => trim($this->first_name.' '.$this->last_name),
        set: fn ($value) => ['first_name' => ..., 'last_name' => ...],
    );
}

$user->full_name;   // reads through the accessor
$user->full_name = 'Ada Lovelace'; // writes through the mutator
```

### Scopes — reusable query fragments

```php
public function scopeActive($query) { return $query->where('is_active', true); }
public function scopeRecent($query) { return $query->orderBy('created_at', 'desc'); }

User::active()->recent()->get(); // global-scope-free, composable
```

### Model events & observers

```php
// in a provider's boot():
Order::observe(OrderObserver::class);

class OrderObserver
{
    public function creating(Order $order) { $order->number = generateNumber(); }
    public function created(Order $order)  { event(new OrderCreated($order)); }
}
```

Model lifecycle hooks: `creating/created`, `updating/updated`, `saving/saved`, `deleting/deleted`, `restoring/restored`.

### Serialization

```php
$user->toArray();          // model → plain array
$user->toJson();           // model → JSON
$user->makeHidden('secret'); // omit attributes
$user->only('id', 'name');   // pick attributes
```

## Interview questions

**Q1. What is Eloquent, and how is it different from the query builder?**
> Eloquent is the ORM — models map to tables, instances to rows, with relationships, casts, events, and serialization. The query builder (`DB::table()`) is the lower-level, Eloquent-free SQL builder. Eloquent is built on the query builder; use Eloquent for domain models, the query builder for raw-ish joins and aggregates.

**Q2. What is mass assignment, and how do you protect against it?**
> Mass assignment is creating/updating a model from an array (`User::create($request->all())`). Without protection, a user could slip `is_admin => 1` into the request and get it persisted. `$fillable` (whitelist) or `$guarded` (blacklist) controls which fields mass assignment may touch.

**Q3. What are accessors and mutators?**
> Accessors transform an attribute when read; mutators transform it when written. The modern syntax is an `Attribute` object with `get` and/or `set` closures. They let you present data (full name, formatted price) without storing the presentation.

**Q4. What are casts for?**
> Casts convert raw database values to PHP types at the boundary — booleans, arrays (JSON columns), decimals, datetimes as Carbon. Without them you'd manually convert `0`/`1`, JSON strings, and date strings everywhere.

**Q5. What are scopes?**
> Reusable query fragments — `scopeActive()` becomes `User::active()`. They keep repeated conditions (`where('is_active', true)`) in one place, composable with other scopes and constraints.

**Q6. What are model events and observers?**
> Hooks into the model lifecycle — `creating`, `created`, `updating`, etc. An observer groups them for one model in one class. Use them for cross-cutting model behaviour (auto-numbering, firing domain events); business logic still belongs in services.

**Senior follow-up: When would you *not* use Eloquent?**
> For heavy reporting — complex joins, grouped aggregates, huge result sets — where the query builder or raw SQL with `EXPLAIN` is clearer and faster. And never hydrate thousands of models when you only need counts: `count()`, `sum()`, `pluck()` are Eloquent methods that avoid hydration entirely.

## Common mistakes

❌ Leaving `$guarded`/`$fillable` unset — mass assignment is wide open.

❌ Accessors doing DB queries — accessors are for transformation, not queries (N+1 risk).

❌ Fat models — model events and scopes are convenient, but business logic belongs in services.

❌ Hydrating models to count them — `Model::all()->count()` loads everything; use `Model::count()`.

## Quick revision notes

- Eloquent = **active record**: model ↔ table, instance ↔ row
- `$fillable` (whitelist) / `$guarded` (blacklist) — **mass assignment defence**
- `$casts` → typed attributes · `Attribute::make(get, set)` → accessors/mutators
- **Scopes** = reusable query fragments
- **Model events/observers** = lifecycle hooks (`creating`/`created`/…)
- Serialization: `toArray()` / `toJson()` / `makeHidden()`

## Check your understanding

1. What is active record, and how does Eloquent embody it?
2. Why is `$fillable` a security control, not just a nicety?
3. Accessor vs cast — when do you reach for each?
4. What's the difference between a scope and a model event?
5. When should you drop Eloquent for the query builder?
